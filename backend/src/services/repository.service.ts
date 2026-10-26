import crypto from 'crypto';
import { SupabaseService } from './supabase.service.js';
import { Product, Category, Order, User, Review } from '../types/models.js';

export class RepositoryService {
  private static instance: RepositoryService;

  private constructor() {}

  public static getInstance(): RepositoryService {
    if (!RepositoryService.instance) {
      RepositoryService.instance = new RepositoryService();
    }
    return RepositoryService.instance;
  }

  private getSupabaseClient() {
    const supabase = SupabaseService.getInstance().getClient();
    if (!supabase) {
      throw new Error('Supabase database is not connected. Supabase is the sole source of truth. Please configure it in /setup.');
    }
    return supabase;
  }

  // ===================== PRODUCTS =====================
  public async getProducts(filter?: { category?: string; search?: string; inStock?: number }): Promise<Product[]> {
    const supabase = this.getSupabaseClient();
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

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
    if (error) {
      throw new Error(`Supabase products query failed: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      price: Number(d.price),
      rating: Number(d.rating ?? 5.0),
      description: d.description || '',
      mainImage: d.main_image || '',
      slug: d.slug,
      manufacturer: d.manufacturer || '',
      category: d.category,
      inStock: Number(d.in_stock ?? 1),
      popularity: Number(d.popularity || 0),
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  }

  public async getProductById(id: string): Promise<Product | null> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();

    if (error) {
      throw new Error(`Supabase product lookup failed: ${error.message}`);
    }
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      price: Number(data.price),
      rating: Number(data.rating ?? 5.0),
      description: data.description || '',
      mainImage: data.main_image || '',
      slug: data.slug,
      manufacturer: data.manufacturer || '',
      category: data.category,
      inStock: Number(data.in_stock ?? 1),
      popularity: Number(data.popularity || 0),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  public async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const supabase = this.getSupabaseClient();
    const slug = product.slug || product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase.from('products').insert({
      title: product.title,
      price: product.price,
      rating: product.rating || 5.0,
      description: product.description || '',
      main_image: product.mainImage || '',
      slug,
      manufacturer: product.manufacturer || '',
      category: product.category,
      in_stock: product.inStock ?? 1,
      popularity: product.popularity || 0
    }).select().single();

    if (error) {
      throw new Error(`Supabase product creation failed: ${error.message}`);
    }

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
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const supabase = this.getSupabaseClient();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.price !== undefined) updatePayload.price = updates.price;
    if (updates.rating !== undefined) updatePayload.rating = updates.rating;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.mainImage !== undefined) updatePayload.main_image = updates.mainImage;
    if (updates.slug !== undefined) updatePayload.slug = updates.slug;
    if (updates.manufacturer !== undefined) updatePayload.manufacturer = updates.manufacturer;
    if (updates.category !== undefined) updatePayload.category = updates.category;
    if (updates.inStock !== undefined) updatePayload.in_stock = updates.inStock;
    if (updates.popularity !== undefined) updatePayload.popularity = updates.popularity;

    const { data, error } = await supabase.from('products').update(updatePayload).eq('id', id).select().single();

    if (error) {
      throw new Error(`Supabase product update failed: ${error.message}`);
    }
    if (!data) return null;

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
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      throw new Error(`Supabase product deletion failed: ${error.message}`);
    }
    return true;
  }

  // ===================== CATEGORIES =====================
  public async getCategories(): Promise<Category[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      throw new Error(`Supabase categories query failed: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      imageUrl: d.image_url || '',
      productsNumber: Number(d.products_number || 0),
      parentCategory: d.parent_category || '/',
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  }

  public async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const supabase = this.getSupabaseClient();
    const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase.from('categories').insert({
      name: cat.name,
      slug,
      image_url: cat.imageUrl || '',
      products_number: cat.productsNumber || 0,
      parent_category: cat.parentCategory || '/'
    }).select().single();

    if (error) {
      throw new Error(`Supabase category creation failed: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      imageUrl: data.image_url,
      productsNumber: data.products_number,
      parentCategory: data.parent_category,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      throw new Error(`Supabase category deletion failed: ${error.message}`);
    }
    return true;
  }

  // ===================== ORDERS =====================
  public async getOrders(statusFilter?: string): Promise<Order[]> {
    const supabase = this.getSupabaseClient();
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Supabase orders query failed: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      customerName: d.customer_name,
      customerEmail: d.customer_email,
      status: d.status,
      total: Number(d.total),
      items: typeof d.items === 'string' ? JSON.parse(d.items) : (d.items || []),
      paymentMethod: d.payment_method || 'Credit Card',
      shippingAddress: d.shipping_address || '',
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  }

  public async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase.from('orders').insert({
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      status: order.status || 'Processing',
      total: order.total,
      items: order.items || [],
      payment_method: order.paymentMethod || 'Credit Card',
      shipping_address: order.shippingAddress || ''
    }).select().single();

    if (error) {
      throw new Error(`Supabase order creation failed: ${error.message}`);
    }

    return {
      id: data.id,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      status: data.status,
      total: Number(data.total),
      items: data.items,
      paymentMethod: data.payment_method,
      shippingAddress: data.shipping_address,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  public async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('orders').update({
      status,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();

    if (error) {
      throw new Error(`Supabase order status update failed: ${error.message}`);
    }
    if (!data) return null;

    return {
      id: data.id,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      status: data.status,
      total: Number(data.total),
      items: data.items,
      paymentMethod: data.payment_method,
      shippingAddress: data.shipping_address,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // ===================== USERS =====================
  public async getUsers(): Promise<User[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase users query failed: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      role: d.role,
      status: d.status,
      avatar: d.avatar,
      createdAt: d.created_at
    }));
  }

  public async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('users').insert({
      name: user.name,
      email: user.email.trim().toLowerCase(),
      role: user.role || 'user',
      status: user.status || 'active',
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      password_hash: user.passwordHash
    }).select().single();

    if (error) {
      throw new Error(`Supabase user creation failed: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      avatar: data.avatar,
      createdAt: data.created_at
    };
  }

  public async hasAdminUser(): Promise<boolean> {
    const supabase = SupabaseService.getInstance().getClient();
    if (!supabase) return false;

    try {
      const { data, error } = await supabase.from('users').select('id').eq('role', 'admin').limit(1);
      if (error || !data) return false;
      return data.length > 0;
    } catch {
      return false;
    }
  }

  public async upsertAdminUser(user: { name: string; email: string; passwordHash: string }): Promise<User> {
    const supabase = this.getSupabaseClient();
    const normalized = user.email.trim().toLowerCase();

    const { data: existing } = await supabase.from('users').select('id').eq('email', normalized).maybeSingle();

    if (existing) {
      const { data, error } = await supabase.from('users').update({
        name: user.name,
        role: 'admin',
        status: 'active',
        password_hash: user.passwordHash
      }).eq('id', existing.id).select().single();

      if (error) {
        throw new Error(`Supabase admin update failed: ${error.message}`);
      }
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        avatar: data.avatar,
        createdAt: data.created_at
      };
    } else {
      const { data, error } = await supabase.from('users').insert({
        name: user.name,
        email: normalized,
        role: 'admin',
        status: 'active',
        password_hash: user.passwordHash,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
      }).select().single();

      if (error) {
        throw new Error(`Supabase admin insert failed: ${error.message}`);
      }
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        avatar: data.avatar,
        createdAt: data.created_at
      };
    }
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const supabase = this.getSupabaseClient();
    const normalized = email.trim().toLowerCase();

    const { data, error } = await supabase.from('users').select('*').eq('email', normalized).maybeSingle();

    if (error) {
      throw new Error(`Supabase user lookup failed: ${error.message}`);
    }
    if (!data) return null;

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

  // ===================== REVIEWS =====================
  public async getReviews(): Promise<Review[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase reviews query failed: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      productId: d.product_id,
      productName: d.product_name,
      userName: d.user_name,
      userEmail: d.user_email,
      rating: Number(d.rating),
      comment: d.comment,
      status: d.status,
      createdAt: d.created_at
    }));
  }

  public async createReview(rev: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('reviews').insert({
      product_id: rev.productId,
      product_name: rev.productName,
      user_name: rev.userName,
      user_email: rev.userEmail,
      rating: rev.rating,
      comment: rev.comment,
      status: rev.status || 'approved'
    }).select().single();

    if (error) {
      throw new Error(`Supabase review creation failed: ${error.message}`);
    }

    return {
      id: data.id,
      productId: data.product_id,
      productName: data.product_name,
      userName: data.user_name,
      userEmail: data.user_email,
      rating: Number(data.rating),
      comment: data.comment,
      status: data.status,
      createdAt: data.created_at
    };
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
