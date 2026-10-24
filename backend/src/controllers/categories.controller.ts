import { Request, Response } from 'express';
import { RepositoryService } from '../services/repository.service.js';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters.'),
  slug: z.string().optional(),
  imageUrl: z.string().default(''),
  productsNumber: z.number().default(0),
  parentCategory: z.string().default('/')
});

export class CategoriesController {
  private static repo = RepositoryService.getInstance();

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoriesController.repo.getCategories();
      res.json({ categories, count: categories.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch categories.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createCategorySchema.parse(req.body);
      const cat = await CategoriesController.repo.createCategory({
        ...parsed,
        slug: parsed.slug || parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      });
      res.status(201).json({ category: cat });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(500).json({ error: err.message || 'Failed to create category.' });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await CategoriesController.repo.deleteCategory(id);
      res.json({ success: true, message: 'Category removed successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete category.' });
    }
  }
}
