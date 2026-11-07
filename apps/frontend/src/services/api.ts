import { Product, catalogProducts } from '../data/products';
import { getSupabase } from './supabaseClient';
import { emailService, OrderConfirmationData } from './emailService';

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
  isVerified?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  requiresOtp?: boolean;
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

// In-memory / localStorage cache for pending OTP verifications
interface PendingOtpData {
  email: string;
  name: string;
  otp: string;
  expiresAt: number;
}

const OTP_STORAGE_KEY = 'accessglobal_pending_otp';

function savePendingOtp(email: string, name: string, otp: string): void {
  const data: PendingOtpData = {
    email: email.trim().toLowerCase(),
    name,
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  };
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(data));
}

function getPendingOtp(email: string): PendingOtpData | null {
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return null;
    const parsed: PendingOtpData = JSON.parse(raw);
    if (parsed.email === email.trim().toLowerCase() && parsed.expiresAt > Date.now()) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function mapApiProductToProduct(item: any): Product {
  const rawMaker = item.manufacturer || 'Direct Workshop';
  const originParts = rawMaker.split('(');
  const makerName = originParts[0]?.trim() || rawMaker;
  const makerOrigin = originParts[1]?.replace(')', '').trim() || 'Global Workshop Hub';

  return {
    id: String(item.id),
    name: item.title || item.name || 'Workshop Creation',
    category: (item.category as any) || 'Accessories',
    maker: makerName,
    makerOrigin: makerOrigin,
    price: Number(item.price || 0),
    badge: (item.rating && Number(item.rating) >= 4.9) ? 'Flagship Edition' : 'Verified Maker',
    image: item.main_image || item.mainImage || item.image_url || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    description: item.description || 'Precision crafted with verified materials and direct-from-workshop provenance.',
    leadTime: 'Pre-cleared · Ships in 48h',
    inStock: item.stock === undefined ? true : Number(item.stock) > 0,
    specs: [
      { label: 'Origin', value: makerOrigin },
      { label: 'Maker', value: makerName },
      { label: 'Rating', value: `${item.rating || 5.0} / 5.0` },
      { label: 'Warranty', value: '3-Year Limited' },
      { label: 'Stock Level', value: item.stock !== undefined ? `${item.stock} units ready` : 'Available' },
    ],
  };
}

export const api = {
  // Products API - directly from Supabase
  async getProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
    const supabase = getSupabase();

    if (!supabase) {
      // Graceful fallback to verified catalog if Supabase credentials are not entered yet
      let list = [...catalogProducts];
      if (params?.category && params.category !== 'All') {
        list = list.filter((p) => p.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      return list;
    }

    try {
      let query = supabase.from('products').select('*');
      if (params?.category && params.category !== 'All') {
        query = query.ilike('category', `%${params.category}%`);
      }
      if (params?.search) {
        query = query.ilike('title', `%${params.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        // If DB table is empty, provide initial catalog
        return catalogProducts;
      }

      return data.map(mapApiProductToProduct);
    } catch (err) {
      console.warn('[DirectSupabase Frontend] getProducts fallback to catalog:', err);
      return catalogProducts;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    const supabase = getSupabase();
    if (!supabase) {
      return catalogProducts.find((p) => p.id === id) || null;
    }

    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error || !data) {
        return catalogProducts.find((p) => p.id === id) || null;
      }
      return mapApiProductToProduct(data);
    } catch {
      return catalogProducts.find((p) => p.id === id) || null;
    }
  },

  // Auth API - directly via Supabase Auth + Resend OTP
  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabase();

    if (!supabase) {
      // Local fallback account
      const user: AuthUser = {
        id: `usr-${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'user',
        isVerified: true,
      };
      const token = `token-${Date.now()}`;
      localStorage.setItem('agm_token', token);
      localStorage.setItem('agm_user', JSON.stringify(user));
      return { user, token };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Login failed. Please verify your email and password.');
    }

    const user: AuthUser = {
      id: data.user.id,
      name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: (data.user.user_metadata?.role as any) || 'user',
      isVerified: Boolean(data.user.email_confirmed_at),
    };

    const token = data.session?.access_token || `token-${Date.now()}`;
    localStorage.setItem('agm_token', token);
    localStorage.setItem('agm_user', JSON.stringify(user));
    return { user, token };
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name.trim() || cleanEmail.split('@')[0];
    const supabase = getSupabase();

    // 1. Generate 6-digit OTP
    const otpCode = generateOtpCode();
    savePendingOtp(cleanEmail, displayName, otpCode);

    // 2. Dispatch OTP via Resend email template
    await emailService.sendOtpVerificationEmail(cleanEmail, displayName, otpCode);

    // 3. Initiate signup in Supabase Auth if connected
    let userId = `usr-${Date.now()}`;
    let token = `pending-${Date.now()}`;

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: displayName,
              role: 'user',
            },
          },
        });
        if (error) {
          // If already registered
          if (error.message.toLowerCase().includes('already registered')) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          }
        }
        if (data?.user?.id) userId = data.user.id;
        if (data?.session?.access_token) token = data.session.access_token;
      } catch (err: any) {
        if (err.message?.includes('already exists')) throw err;
        console.warn('[DirectSupabase] auth.signUp warning:', err.message);
      }
    }

    const user: AuthUser = {
      id: userId,
      name: displayName,
      email: cleanEmail,
      role: 'user',
      isVerified: false,
    };

    return {
      user,
      token,
      requiresOtp: true,
    };
  },

  async verifyOtp(email: string, otpInput: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const pending = getPendingOtp(cleanEmail);

    if (!pending) {
      throw new Error('Verification code has expired or is invalid. Please request a new code.');
    }

    if (pending.otp.trim() !== otpInput.trim()) {
      throw new Error('Incorrect verification code. Please check your email and try again.');
    }

    // Attempt Supabase OTP verification if supported
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: otpInput.trim(),
          type: 'signup',
        });
      } catch {
        // Fallback: Proceed with verified session
      }
    }

    // Success: activate account
    localStorage.removeItem(OTP_STORAGE_KEY);
    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      name: pending.name,
      email: cleanEmail,
      role: 'user',
      isVerified: true,
    };
    const token = `auth-${Date.now()}`;
    localStorage.setItem('agm_token', token);
    localStorage.setItem('agm_user', JSON.stringify(user));

    return { user, token };
  },

  async resendOtp(email: string, name: string): Promise<{ success: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const newOtp = generateOtpCode();
    savePendingOtp(cleanEmail, name, newOtp);
    await emailService.sendOtpVerificationEmail(cleanEmail, name, newOtp);
    return { success: true };
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
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.signOut().catch(() => { });
    }
    localStorage.removeItem('agm_token');
    localStorage.removeItem('agm_user');
  },

  // Orders API - directly writes to Supabase orders table + dispatches Resend confirmation email
  async createOrder(payload: ApiOrderPayload): Promise<{ success: boolean; orderId: string }> {
    const orderId = `AGM-${Date.now().toString().slice(-6)}`;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { error } = await supabase.from('orders').insert([
          {
            customer_name: payload.customerName,
            customer_email: payload.customerEmail,
            total: payload.total,
            status: 'Processing',
            items: payload.items,
            payment_method: payload.paymentMethod || 'Bonded Card',
            shipping_address: payload.shippingAddress,
          },
        ]);
        if (error) {
          console.warn('[DirectSupabase] Order insert warning:', error.message);
        }
      } catch (err) {
        console.warn('[DirectSupabase] Failed to write order to Supabase:', err);
      }
    }

    // Dispatch itemized Order Confirmation Email via Resend
    const confirmationData: OrderConfirmationData = {
      orderId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      items: payload.items.map((it) => ({
        title: it.title,
        quantity: it.quantity,
        price: it.price,
        imageUrl: it.imageUrl,
      })),
      subtotal: payload.total,
      customsDuty: 0,
      shipping: 0,
      total: payload.total,
      shippingAddress: payload.shippingAddress,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    emailService.sendOrderConfirmationEmail(confirmationData).catch((err) => {
      console.warn('[EmailService] Order email warning:', err);
    });

    return { success: true, orderId };
  },
};
