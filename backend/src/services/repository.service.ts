import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { SupabaseService } from './supabase.service.js';
import {
  initialCategories,
  initialProducts,
  initialOrders,
  initialUsers,
  initialReviews
} from '../data/initialSeed.js';
import { Product, Category, Order, User, Review } from '../types/models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface LocalStoreData {
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: User[];
  reviews: Review[];
}

export class RepositoryService {
  private static instance: RepositoryService;
  private localData: LocalStoreData;

  private constructor() {
    this.localData = this.loadOrCreateStore();
  }

  public static getInstance(): RepositoryService {
    if (!RepositoryService.instance) {
      RepositoryService.instance = new RepositoryService();
    }
    return RepositoryService.instance;
  }

  private loadOrCreateStore(): LocalStoreData {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn('[RepositoryService] Failed to parse store.json, re-initializing seed.');
      }
    }

    const initialData: LocalStoreData = {
      products: [...initialProducts],
      categories: [...initialCategories],
      orders: [...initialOrders],
      users: [...initialUsers],
      reviews: [...initialReviews]
    };

    this.saveLocalStore(initialData);
    return initialData;
  }

  private saveLocalStore(data: LocalStoreData): void {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
      this.localData = data;
    } catch (err) {
      console.error('[RepositoryService] Error saving local store:', err);
    }
  }

  // ===================== PRODUCTS =====================
  public async getProducts(filter?: { category?: string; search?: string; inStock?: number }): Promise<Product[]> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        let query = supabase.from('products').select('*');
        if (filter?.category && filter.category !== 'all' && filter.category !== 'default') {
          query = query.ilike('category', `%${filter.category}%`);
        }
        if (filter?.search) {
          query = query.ilike('title', `%${filter.search}%`);
        }
        if (filter?.inStock !== undefined) {
          query = query.eq('in_stock', filter.inStock);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            price: Number(d.price),
            rating: Number(d.rating || 5.0),
            description: d.description || '',
            mainImage: d.main_image || '',
            slug: d.slug,
            manufacturer: d.manufacturer || '',
            category: d.category,
            inStock: d.in_stock,
            popularity: d.popularity || 0,
            createdAt: d.created_at,
            updatedAt: d.updated_at
          }));
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase getProducts failed, falling back to local store:', err);
      }
    }

    // Local fallback
    let list = [...this.localData.products];
    if (filter?.category && filter.category !== 'all' && filter.category !== 'default') {
      list = list.filter(p => p.category.toLowerCase().includes(filter.category!.toLowerCase()));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filter?.inStock !== undefined) {
      list = list.filter(p => p.inStock === filter.inStock);
    }
    return list;
  }

  public async getProductById(id: string): Promise<Product | null> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (!error && data) {
          return {
            id: data.id,
            title: data.title,
            price: Number(data.price),
            rating: Number(data.rating),
            description: data.description,
            mainImage: data.main_image,
            slug: data.slug,
            manufacturer: data.manufacturer,
            category: data.category,
            inStock: data.in_stock,
            popularity: data.popularity,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase getProductById failed:', err);
      }
    }
    return this.localData.products.find(p => p.id === id) || null;
  }

  public async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const id = `prod-${crypto.randomUUID().slice(0, 8)}`;
    const newProduct: Product = { ...product, id, createdAt: new Date().toISOString() };

    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').insert({
          title: newProduct.title,
          price: newProduct.price,
          rating: newProduct.rating,
          description: newProduct.description,
          main_image: newProduct.mainImage,
          slug: newProduct.slug || newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          manufacturer: newProduct.manufacturer,
          category: newProduct.category,
          in_stock: newProduct.inStock,
          popularity: newProduct.popularity
        }).select().single();

        if (!error && data) {
          newProduct.id = data.id;
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase insert product failed, saving locally:', err);
      }
    }

    this.localData.products.unshift(newProduct);
    this.saveLocalStore(this.localData);
    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const existing = await this.getProductById(id);
    if (!existing) return null;

    const updated: Product = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        await supabase.from('products').update({
          title: updated.title,
          price: updated.price,
          rating: updated.rating,
          description: updated.description,
          main_image: updated.mainImage,
          slug: updated.slug,
          manufacturer: updated.manufacturer,
          category: updated.category,
          in_stock: updated.inStock,
          popularity: updated.popularity,
          updated_at: updated.updatedAt
        }).eq('id', id);
      } catch (err) {
        console.warn('[RepositoryService] Supabase update product failed:', err);
      }
    }

    const index = this.localData.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.localData.products[index] = updated;
    } else {
      this.localData.products.unshift(updated);
    }
    this.saveLocalStore(this.localData);
    return updated;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('[RepositoryService] Supabase delete product failed:', err);
      }
    }
    this.localData.products = this.localData.products.filter(p => p.id !== id);
    this.saveLocalStore(this.localData);
    return true;
  }

  // ===================== CATEGORIES =====================
  public async getCategories(): Promise<Category[]> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            imageUrl: d.image_url || '',
            productsNumber: d.products_number || 0,
            parentCategory: d.parent_category || '/',
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase getCategories failed:', err);
      }
    }
    return [...this.localData.categories];
  }

  public async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const id = `cat-${crypto.randomUUID().slice(0, 8)}`;
    const newCat: Category = { ...cat, id, createdAt: new Date().toISOString() };

    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').insert({
          name: newCat.name,
          slug: newCat.slug || newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          image_url: newCat.imageUrl,
          products_number: newCat.productsNumber,
          parent_category: newCat.parentCategory
        }).select().single();
        if (!error && data) {
          newCat.id = data.id;
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase createCategory failed:', err);
      }
    }

    this.localData.categories.push(newCat);
    this.saveLocalStore(this.localData);
    return newCat;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('[RepositoryService] Supabase deleteCategory failed:', err);
      }
    }
    this.localData.categories = this.localData.categories.filter(c => c.id !== id);
    this.saveLocalStore(this.localData);
    return true;
  }

  // ===================== ORDERS =====================
  public async getOrders(statusFilter?: string): Promise<Order[]> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            customerName: d.customer_name,
            customerEmail: d.customer_email,
            status: d.status,
            total: Number(d.total),
            items: d.items || [],
            paymentMethod: d.payment_method,
            shippingAddress: d.shipping_address,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase getOrders failed:', err);
      }
    }
    let list = [...this.localData.orders];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return list;
  }

  public async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = { ...order, id, createdAt: new Date().toISOString() };

    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        await supabase.from('orders').insert({
          id: newOrder.id,
          customer_name: newOrder.customerName,
          customer_email: newOrder.customerEmail,
          status: newOrder.status,
          total: newOrder.total,
          items: newOrder.items,
          payment_method: newOrder.paymentMethod,
          shipping_address: newOrder.shippingAddress
        });
      } catch (err) {
        console.warn('[RepositoryService] Supabase createOrder failed:', err);
      }
    }

    this.localData.orders.unshift(newOrder);
    this.saveLocalStore(this.localData);
    return newOrder;
  }

  public async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      } catch (err) {
        console.warn('[RepositoryService] Supabase updateOrderStatus failed:', err);
      }
    }

    const order = this.localData.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.saveLocalStore(this.localData);
      return order;
    }
    return null;
  }

  // ===================== USERS =====================
  public async getUsers(): Promise<User[]> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            email: d.email,
            role: d.role,
            status: d.status,
            avatar: d.avatar,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase getUsers failed:', err);
      }
    }
    return [...this.localData.users];
  }

  public async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
    const newUser: User = { ...user, id, createdAt: new Date().toISOString() };

    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        await supabase.from('users').insert({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          avatar: newUser.avatar,
          password_hash: newUser.passwordHash
        });
      } catch (err) {
        console.warn('[RepositoryService] Supabase createUser failed:', err);
      }
    }

    this.localData.users.push(newUser);
    this.saveLocalStore(this.localData);
    return newUser;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('email', normalized).single();
        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            status: data.status,
            avatar: data.avatar,
            passwordHash: data.password_hash,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase getUserByEmail failed:', err);
      }
    }
    return this.localData.users.find(u => u.email.toLowerCase() === normalized) || null;
  }

  // ===================== REVIEWS =====================
  public async getReviews(): Promise<Review[]> {
    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            productId: d.product_id,
            productName: d.product_name,
            userName: d.user_name,
            userEmail: d.user_email,
            rating: d.rating,
            comment: d.comment,
            status: d.status,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('[RepositoryService] Supabase getReviews failed:', err);
      }
    }
    return [...this.localData.reviews];
  }

  public async createReview(rev: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const id = `rev-${crypto.randomUUID().slice(0, 8)}`;
    const newRev: Review = { ...rev, id, createdAt: new Date().toISOString() };

    const supabase = SupabaseService.getInstance().getClient();
    if (supabase) {
      try {
        await supabase.from('reviews').insert({
          product_id: newRev.productId,
          product_name: newRev.productName,
          user_name: newRev.userName,
          user_email: newRev.userEmail,
          rating: newRev.rating,
          comment: newRev.comment,
          status: newRev.status
        });
      } catch (err) {
        console.warn('[RepositoryService] Supabase createReview failed:', err);
      }
    }

    this.localData.reviews.unshift(newRev);
    this.saveLocalStore(this.localData);
    return newRev;
  }

  // ===================== STATS =====================
  public async getStats() {
    const products = await this.getProducts();
    const orders = await this.getOrders();
    const users = await this.getUsers();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders: orders.slice(0, 5),
      topProducts: products.slice(0, 4)
    };
  }
}
