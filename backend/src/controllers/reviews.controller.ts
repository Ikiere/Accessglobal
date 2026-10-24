import { Request, Response } from 'express';
import { RepositoryService } from '../services/repository.service.js';
import { z } from 'zod';

const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required.'),
  productName: z.string().min(1, 'Product Name is required.'),
  userName: z.string().min(2, 'User Name is required.'),
  userEmail: z.string().email('Valid email is required.'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, 'Comment must be at least 3 characters.'),
  status: z.enum(['approved', 'pending', 'rejected']).default('approved')
});

export class ReviewsController {
  private static repo = RepositoryService.getInstance();

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await ReviewsController.repo.getReviews();
      res.json({ reviews, count: reviews.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch reviews.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createReviewSchema.parse(req.body);
      const rev = await ReviewsController.repo.createReview(parsed);
      res.status(201).json({ review: rev });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(500).json({ error: err.message || 'Failed to create review.' });
    }
  }
}
