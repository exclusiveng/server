import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './Order';
import { Product } from './Product';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @ManyToOne(() => Product)
  @JoinColumn()
  product!: Product;

  @Column({ type: 'varchar' })
  product_title!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_at_purchase!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @CreateDateColumn()
  created_at!: Date;
}
