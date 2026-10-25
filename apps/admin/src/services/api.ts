const API_BASE = '/api';

export interface SupabaseStatus {
  connected: boolean;
  source: 'env' | 'vault' | 'none';
  projectUrl: string;
  hasServiceRoleKey: boolean;
  tablesStatus: {
    products: boolean;
    categories: boolean;
    orders: boolean;
    users: boolean;
    reviews: boolean;
  };
  lastChecked: string;
  error?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  rating: number;
  description: string;
  mainImage: string;
  slug: string;
  manufacturer: string;
  category: string;
  inStock: number;
  popularity: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  productsNumber?: number;
  productCount?: number;
  parentCategory?: string;
}

export interface OrderItem {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'Processing' | 'Delivered' | 'Cancelled' | 'Pending';
  total: number;
  items: Array<{ productId: string; title: string; price: number; quantity: number; imageUrl?: string }>;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  supabaseConnected: boolean;
  dataSource: string;
  recentOrders: OrderItem[];
  topProducts: ProductItem[];
}

export interface SetupStatus {
  isInstalled: boolean;
  requiresSetup: boolean;
  supabaseConfigured: boolean;
  installedAt?: string;
  adminEmail?: string;
}

export interface CompleteSetupParams {
  supabase?: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
  };
  useSandbox?: boolean;
}

export interface PublicSupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('accessglobal_token');
  }

  public setToken(token: string): void {
    localStorage.setItem('accessglobal_token', token);
  }

  public clearToken(): void {
    localStorage.removeItem('accessglobal_token');
    localStorage.removeItem('accessglobal_user');
  }

  public isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  public getCurrentUser(): UserItem | null {
    try {
      const raw = localStorage.getItem('accessglobal_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: UserItem): void {
    localStorage.setItem('accessglobal_user', JSON.stringify(user));
  }

  public logout(): void {
    this.clearToken();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data as T;
  }

  // Stats
  public async getStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/stats');
  }

  // Supabase Integration
  public async getSupabaseStatus(): Promise<SupabaseStatus> {
    return this.request<SupabaseStatus>('/supabase/status');
  }

  public async testSupabase(url: string, key: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/supabase/test', {
      method: 'POST',
      body: JSON.stringify({ url, key })
    });
  }

  public async connectSupabase(creds: { url: string; anonKey: string; serviceRoleKey?: string }): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/supabase/connect', {
      method: 'POST',
      body: JSON.stringify(creds)
    });
  }

  public async disconnectSupabase(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/supabase/disconnect', {
      method: 'POST'
    });
  }

  public async getSupabaseSchema(): Promise<{ sql: string }> {
    return this.request<{ sql: string }>('/supabase/schema');
  }

  // Products
  public async getProducts(params?: { category?: string; search?: string; inStock?: number }): Promise<{ products: ProductItem[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.inStock !== undefined) query.append('inStock', String(params.inStock));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ products: ProductItem[]; count: number }>(`/products${qs}`);
  }

  public async getProduct(id: string): Promise<{ product: ProductItem }> {
    return this.request<{ product: ProductItem }>(`/products/${id}`);
  }

  public async createProduct(product: Partial<ProductItem>): Promise<{ product: ProductItem }> {
    return this.request<{ product: ProductItem }>('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  }

  public async updateProduct(id: string, updates: Partial<ProductItem>): Promise<{ product: ProductItem }> {
    return this.request<{ product: ProductItem }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories
  public async getCategories(): Promise<{ categories: CategoryItem[]; count: number }> {
    return this.request<{ categories: CategoryItem[]; count: number }>('/categories');
  }

  public async createCategory(cat: Partial<CategoryItem>): Promise<{ category: CategoryItem }> {
    return this.request<{ category: CategoryItem }>('/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    });
  }

  public async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Orders
  public async getOrders(status?: string): Promise<{ orders: OrderItem[]; count: number }> {
    const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<{ orders: OrderItem[]; count: number }>(`/orders${qs}`);
  }

  public async updateOrderStatus(id: string, status: OrderItem['status']): Promise<{ order: OrderItem }> {
    return this.request<{ order: OrderItem }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  public async createOrder(order: any): Promise<{ order: OrderItem }> {
    return this.request<{ order: OrderItem }>('/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  }

  // Users
  public async getUsers(): Promise<{ users: UserItem[]; count: number }> {
    return this.request<{ users: UserItem[]; count: number }>('/users');
  }

  public async createUser(user: Partial<UserItem>): Promise<{ user: UserItem }> {
    return this.request<{ user: UserItem }>('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }

  // Reviews
  public async getReviews(): Promise<{ reviews: ReviewItem[]; count: number }> {
    return this.request<{ reviews: ReviewItem[]; count: number }>('/reviews');
  }

  public async createReview(rev: Partial<ReviewItem>): Promise<{ review: ReviewItem }> {
    return this.request<{ review: ReviewItem }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(rev)
    });
  }

  // Auth
  public async login(email: string, password: string): Promise<{ user: UserItem; token: string }> {
    const res = await this.request<{ user: UserItem; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token);
    if (res.user) {
      this.setCurrentUser(res.user);
    }
    return res;
  }

  public async register(name: string, email: string, password: string): Promise<{ user: UserItem; token: string }> {
    const res = await this.request<{ user: UserItem; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    this.setToken(res.token);
    if (res.user) {
      this.setCurrentUser(res.user);
    }
    return res;
  }

  public async getMe(): Promise<{ user: UserItem }> {
    return this.request<{ user: UserItem }>('/auth/me');
  }

  // Setup / Onboarding
  public async getSetupStatus(): Promise<SetupStatus> {
    return this.request<SetupStatus>('/setup/status');
  }

  public async completeSetup(params: CompleteSetupParams): Promise<{ success: boolean; message: string; token: string; user: UserItem }> {
    const res = await this.request<{ success: boolean; message: string; token: string; user: UserItem }>('/setup/complete', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (res.token) {
      this.setToken(res.token);
    }
    if (res.user) {
      this.setCurrentUser(res.user);
    }
    return res;
  }

  public async getPublicSupabaseConfig(): Promise<PublicSupabaseConfig> {
    return this.request<PublicSupabaseConfig>('/supabase/public-config');
  }
}

export const api = new ApiService();
