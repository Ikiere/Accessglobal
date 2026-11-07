import { Product } from '../data/products';

const API_BASE = '/api';

export interface ApiProduct {
  id: string;
  title: string;
  price: number;
  rating?: number;
  description: string;
  mainImage: string;
  slug: string;
  manufacturer: string;
  category: string;
  inStock?: number;
  popularity?: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface ApiOrderPayload {
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
  paymentMethod?: string;
  shippingAddress: string;
}

function mapApiProductToProduct(item: ApiProduct): Product {
  const originParts = (item.manufacturer || '').split('(');
  const makerName = originParts[0]?.trim() || item.manufacturer || 'Verified Workshop';
  const makerOrigin = originParts[1]?.replace(')', '').trim() || 'Global Workshop Hub';

  return {
    id: item.id,
    name: item.title,
    category: (item.category as any) || 'Accessories',
    maker: makerName,
    makerOrigin: makerOrigin,
    price: Number(item.price),
    badge: (item.rating && item.rating >= 4.9) ? 'Flagship Edition' : 'Verified Maker',
    image: item.mainImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
    description: item.description || 'Precision crafted with verified materials and direct-from-workshop provenance.',
    leadTime: 'Pre-cleared · Ships in 48h',
    inStock: item.inStock === undefined || item.inStock > 0,
    specs: [
      { label: 'Origin', value: makerOrigin },
      { label: 'Maker', value: makerName },
      { label: 'Rating', value: `${item.rating || 5.0} / 5.0` },
      { label: 'Warranty', value: '3-Year Limited' },
      { label: 'Stock Level', value: item.inStock !== undefined ? `${item.inStock} units ready` : 'Available' },
    ],
  };
}

export const api = {
  // Products API
  async getProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') {
      query.set('category', params.category);
    }
    if (params?.search) {
      query.set('search', params.search);
    }

    const url = `${API_BASE}/products${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load products: ${res.statusText}`);
    }
    const data = await res.json();
    const items: ApiProduct[] = Array.isArray(data) ? data : data.data || [];
    return items.map(mapApiProductToProduct);
  },

  async getProductById(id: string): Promise<Product | null> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to load product: ${res.statusText}`);
    }
    const item: ApiProduct = await res.json();
    return mapApiProductToProduct(item);
  },

  // Auth API
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    if (data.token) {
      localStorage.setItem('agm_token', data.token);
      localStorage.setItem('agm_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

    if (data.token) {
      localStorage.setItem('agm_token', data.token);
      localStorage.setItem('agm_user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem('agm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('agm_token');
    localStorage.removeItem('agm_user');
  },

  // Orders API
  async createOrder(payload: ApiOrderPayload): Promise<{ success: boolean; orderId: string }> {
    const token = localStorage.getItem('agm_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Order creation failed.');
    }
    return { success: true, orderId: data.id || data.orderId || 'AGM-ORD' };
  },
};

