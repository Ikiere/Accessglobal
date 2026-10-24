import { Request, Response } from 'express';
import { RepositoryService } from '../services/repository.service.js';
import { z } from 'zod';

const createProductSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long.'),
  price: z.number().positive('Price must be greater than 0.'),
  rating: z.number().min(0).max(5).default(5),
  description: z.string().default(''),
  mainImage: z.string().url('Image must be a valid URL.').or(z.string().min(1)),
  slug: z.string().optional(),
  manufacturer: z.string().default('AccessTech'),
  category: z.string().min(1, 'Category is required.'),
  inStock: z.number().default(1),
  popularity: z.number().default(50)
});

export class ProductsController {
  private static repo = RepositoryService.getInstance();

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { category, search, inStock } = req.query;
      const products = await ProductsController.repo.getProducts({
        category: category as string,
        search: search as string,
        inStock: inStock !== undefined ? parseInt(inStock as string, 10) : undefined
      });
      res.json({ products, count: products.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch products.' });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const product = await ProductsController.repo.getProductById(id);
      if (!product) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }
      res.json({ product });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch product.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createProductSchema.parse(req.body);
      const product = await ProductsController.repo.createProduct({
        ...parsed,
        slug: parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      });
      res.status(201).json({ product });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(500).json({ error: err.message || 'Failed to create product.' });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await ProductsController.repo.updateProduct(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }
      res.json({ product: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update product.' });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await ProductsController.repo.deleteProduct(id);
      res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete product.' });
    }
  }
}
