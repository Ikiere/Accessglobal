import { Request, Response } from 'express';
import { RepositoryService } from '../services/repository.service.js';
import { z } from 'zod';

const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required.'),
  customerEmail: z.string().email('Valid customer email is required.'),
  status: z.enum(['Processing', 'Delivered', 'Cancelled', 'Pending']).default('Processing'),
  total: z.number().positive('Total amount must be greater than zero.'),
  items: z.array(z.object({
    productId: z.string(),
    title: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
    imageUrl: z.string().optional()
  })).min(1, 'Order must contain at least 1 item.'),
  paymentMethod: z.string().default('Credit Card'),
  shippingAddress: z.string().min(5, 'Valid shipping address required.')
});

export class OrdersController {
  private static repo = RepositoryService.getInstance();

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const orders = await OrdersController.repo.getOrders(status as string);
      res.json({ orders, count: orders.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch orders.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createOrderSchema.parse(req.body);
      const order = await OrdersController.repo.createOrder(parsed);
      res.status(201).json({ order });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(500).json({ error: err.message || 'Failed to create order.' });
    }
  }

  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!['Processing', 'Delivered', 'Cancelled', 'Pending'].includes(status)) {
        res.status(400).json({ error: 'Invalid order status value.' });
        return;
      }
      const id = String(req.params.id);
      const updated = await OrdersController.repo.updateOrderStatus(id, status);
      if (!updated) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      res.json({ order: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update order status.' });
    }
  }
}
