import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order, OrderStatus } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { Cart } from '../entities/Cart';
import { Product } from '../entities/Product';
import axios from 'axios';
import { EntityManager } from 'typeorm';

export class OrderController {
  private orderRepository = AppDataSource.getRepository(Order);
  private cartRepository = AppDataSource.getRepository(Cart);
  
  // Initialize Checkout
  async checkout(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const { shippingAddress } = req.body; // e.g., { street, city, state, zip }

      // 1. Get User Cart
      const cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['items', 'items.product', 'user']
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // 2. Calculate Total & Validate Stock
      let totalAmount = 0;
      for (const item of cart.items) {
        if (item.product.stock_quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Product ${item.product.title} is out of stock (Requested: ${item.quantity}, Available: ${item.product.stock_quantity})` 
          });
        }
        totalAmount += Number(item.product.price) * item.quantity;
      }

      // 3. Create Pending Order
      const order = new Order();
      order.user = cart.user;
      order.total_amount = totalAmount;
      order.status = OrderStatus.PENDING;
      order.shipping_address = shippingAddress;
      order.items = cart.items.map(cartItem => {
        const orderItem = new OrderItem();
        orderItem.product = cartItem.product;
        orderItem.product_title = cartItem.product.title;
        orderItem.price_at_purchase = cartItem.product.price;
        orderItem.quantity = cartItem.quantity;
        return orderItem;
      });

      await this.orderRepository.save(order);

      // 4. Initialize Paystack Transaction
      const paystackUrl = process.env.PAYSTACK_API_URL || 'https://api.paystack.co';
      const paystackResponse = await axios.post(
        `${paystackUrl}/transaction/initialize`,
        {
          email: cart.user.email,
          amount: Math.round(totalAmount * 100), // Amount in kobo
          reference: order.id, // Use Order ID as reference
          callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
          metadata: {
            order_id: order.id
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.json({
        authorization_url: paystackResponse.data.data.authorization_url,
        access_code: paystackResponse.data.data.access_code,
        reference: paystackResponse.data.data.reference,
        orderId: order.id
      });

    } catch (error: any) {
      console.error('Checkout Error:', error.response?.data || error.message);
      return res.status(500).json({ message: 'Error initializing checkout' });
    }
  }

  // Verify Payment (Called by frontend after Paystack redirect or via Webhook)
  async verifyPayment(req: Request, res: Response) {
    try {
      const { reference } = req.body; // Paystack transaction reference (which we set to order.id or paystack's own ref)
      
      // Look up order
      // Note: If we used order.id as reference, we can find it directly. 
      // If we used Paystack's generated reference, we need to verify with Paystack to get metadata.order_id
      
      // Let's verify with Paystack first
      const paystackUrl = process.env.PAYSTACK_API_URL || 'https://api.paystack.co';
      const verifyResponse = await axios.get(
        `${paystackUrl}/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        }
      );

      const data = verifyResponse.data.data;
      
      if (data.status !== 'success') {
        return res.status(400).json({ message: 'Payment verification failed' });
      }

      const orderId = data.metadata?.order_id || data.reference; // Fallback if ref was orderId

      // Transactional Update
      await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
        const order = await transactionalEntityManager.findOne(Order, {
            where: { id: orderId },
            relations: ['items', 'items.product', 'user']
        });

        if (!order) throw new Error('Order not found');
        if (order.status === OrderStatus.PAID) return; // Already processed

        // Decrement Stock & Validate again
        for (const item of order.items) {
            const product = await transactionalEntityManager.findOne(Product, { 
                where: { id: item.product.id },
                lock: { mode: 'pessimistic_write' } // Lock row to prevent race conditions
            });
            
            if (!product) throw new Error(`Product ${item.product_title} not found`);
            
            if (product.stock_quantity < item.quantity) {
                // Determine strategy: Fail whole order or Partial?
                // For now, fail entire order processing here would require refund manual process in reality.
                // But for now let's throw error.
                throw new Error(`Insufficient stock for ${product.title} during payment finalization`);
            }

            product.stock_quantity -= item.quantity;
            await transactionalEntityManager.save(product);
        }

        // Update Order
        order.status = OrderStatus.PAID;
        order.payment_reference = reference;
        await transactionalEntityManager.save(order);

        // Clear Cart
        const cart = await transactionalEntityManager.findOne(Cart, {
            where: { user: { id: order.user.id } },
            relations: ['items']
        });
        
        if (cart) {
            cart.items = []; // Or remove using delete
            await transactionalEntityManager.getRepository(Cart).save(cart);
            // Actually needing to delete cartItems specifically
            await transactionalEntityManager.delete('cart_items', { cart: { id: cart.id } });
        }
      });

      return res.json({ message: 'Payment verified and order processed successfully' });

    } catch (error: any) {
      console.error('Verify Payment Error:', error.message);
      return res.status(500).json({ message: error.message || 'Error verifying payment' });
    }
  }

  // Get User Orders
  async getUserOrders(req: Request, res: Response) {
      try {
          // @ts-ignore
          const userId = req.user.id;
          const orders = await this.orderRepository.find({
              where: { user: { id: userId } },
              order: { created_at: 'DESC' },
              relations: ['items']
          });
          return res.json(orders);
      } catch (error) {
          return res.status(500).json({ message: 'Error fetching orders' });
      }
  }
}
