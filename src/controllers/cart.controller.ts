import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { Product } from '../entities/Product';
import { User } from '../entities/User';

export class CartController {
  private cartRepository = AppDataSource.getRepository(Cart);
  private cartItemRepository = AppDataSource.getRepository(CartItem);
  private productRepository = AppDataSource.getRepository(Product);

  // Get user's cart
  async getCart(req: Request, res: Response) {
    try {
      // @ts-ignore - user is attached by auth middleware
      const userId = req.user.id;

      let cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        // Create new cart if not exists
        const user = new User();
        user.id = userId;
        
        cart = this.cartRepository.create({ user, items: [] });
        await this.cartRepository.save(cart);
      }

      // Calculate totals
      const items = cart.items.map(item => ({
        id: item.id,
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        image_url: item.product.image_url,
        quantity: item.quantity,
        subtotal: Number(item.product.price) * item.quantity,
        stock_available: item.product.stock_quantity
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      return res.json({
        id: cart.id,
        items,
        totalAmount,
        itemCount: items.length
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching cart' });
    }
  }

  // Add item to cart
  async addToCart(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      // Check product existence and stock
      const product = await this.productRepository.findOneBy({ id: productId });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock_quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      // Get or create cart
      let cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['items']
      });

      if (!cart) {
        const user = new User();
        user.id = userId;
        cart = this.cartRepository.create({ user, items: [] });
        await this.cartRepository.save(cart);
      }

      // Check if item already exists in cart
      let cartItem = await this.cartItemRepository.findOne({
        where: { cart: { id: cart.id }, product: { id: productId } }
      });

      if (cartItem) {
        // Update quantity
        cartItem.quantity += quantity;
        if (cartItem.quantity > product.stock_quantity) {
          return res.status(400).json({ message: 'Cannot add more items than available in stock' });
        }
        await this.cartItemRepository.save(cartItem);
      } else {
        // Create new cart item
        cartItem = this.cartItemRepository.create({
          cart,
          product,
          quantity
        });
        await this.cartItemRepository.save(cartItem);
      }

      return res.json({ message: 'Item added to cart' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error adding to cart' });
    }
  }

  // Update cart item quantity
  async updateCartItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }

      const cartItem = await this.cartItemRepository.findOne({
        where: { id: itemId },
        relations: ['product']
      });

      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      if (quantity > cartItem.product.stock_quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);

      return res.json({ message: 'Cart updated' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating cart' });
    }
  }

  // Remove item from cart
  async removeFromCart(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      if (!itemId) {
        return res.status(400).json({ message: 'Item ID is required' });
      }
      await this.cartItemRepository.delete(itemId);
      return res.json({ message: 'Item removed from cart' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error removing item' });
    }
  }

  // Clear cart
  async clearCart(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      
      const cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['items']
      });

      if (cart && cart.items.length > 0) {
        await this.cartItemRepository.remove(cart.items);
      }

      return res.json({ message: 'Cart cleared' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error clearing cart' });
    }
  }
}
