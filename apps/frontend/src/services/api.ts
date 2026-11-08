import { Product, ProductSpec, catalogProducts } from '../data/products';
import { getSupabase } from './supabaseClient';
import { emailService, OrderConfirmationData } from './emailService';
import { OrderDetails } from '../components/OrderReceiptModal';

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
  specs?: ProductSpec[];
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
  emailResult?: any;
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
  userId?: string;
  email: string;
  name: string;
  password?: string;
  otp: string;
  expiresAt: number;
}

const OTP_STORAGE_KEY = 'accessglobal_pending_otp';

function savePendingOtp(email: string, name: string, otp: string, password?: string, userId?: string): void {
  const data: PendingOtpData = {
    userId,
    email: email.trim().toLowerCase(),
    name,
    password,
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

async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password.trim() + ':accessglobal_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function mapApiProductToProduct(item: any): Product {
  const rawMaker = item.manufacturer || 'Direct Workshop';
  const originParts = rawMaker.split('(');
  const makerName = originParts[0]?.trim() || rawMaker;
  const makerOrigin = originParts[1]?.replace(')', '').trim() || 'Global Workshop Hub';

  // Parse specifications
  let specs: ProductSpec[] = [];
  if (Array.isArray(item.specs) && item.specs.length > 0) {
    specs = item.specs.filter((s: any) => s && s.label && s.value);
  } else if (typeof item.specs === 'string' && item.specs.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(item.specs);
      if (Array.isArray(parsed)) {
        specs = parsed.filter((s: any) => s && s.label && s.value);
      }
    } catch {
      // ignore
    }
  }

  // If no specs array, check if embedded in description markdown
  let cleanDescription = item.description || 'Precision crafted with verified materials and direct-from-workshop provenance.';
  if (specs.length === 0 && item.description && item.description.includes('Technical Specifications')) {
    const parts = item.description.split(/### Technical Specifications/i);
    cleanDescription = parts[0].trim();
    const specBlock = parts[1] || '';
    const lines = specBlock.split('\n');
    for (const line of lines) {
      const match = line.match(/[•\-*]?\s*\*\*([^*]+)\*\*:\s*(.+)/);
      if (match) {
        specs.push({ label: match[1].trim(), value: match[2].trim() });
      }
    }
  } else if (item.description && item.description.includes('### Technical Specifications')) {
    cleanDescription = item.description.split(/### Technical Specifications/i)[0].trim();
  }

  const stockCount = item.in_stock !== undefined ? Number(item.in_stock) : (item.stock !== undefined ? Number(item.stock) : 10);

  // Fallback default specs if none configured
  if (specs.length === 0) {
    specs = [
      { label: 'Origin', value: makerOrigin },
      { label: 'Maker', value: makerName },
      { label: 'Rating', value: `${item.rating || 5.0} / 5.0` },
      { label: 'Warranty', value: '3-Year Limited' },
      { label: 'Stock Level', value: `${stockCount} units ready` },
    ];
  }

  return {
    id: String(item.id),
    name: item.title || item.name || 'Workshop Creation',
    category: (item.category as any) || 'Accessories',
    maker: makerName,
    makerOrigin: makerOrigin,
    price: Number(item.price || 0),
    badge: (item.rating && Number(item.rating) >= 4.9) ? 'Flagship Edition' : 'Verified Maker',
    image: item.main_image || item.mainImage || item.image_url || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    description: cleanDescription,
    leadTime: 'Pre-cleared · Ships in 48h',
    inStock: stockCount > 0,
    specs,
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

  // Auth API - direct Supabase Database + Resend Transactional OTP
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

    // 1. Try Supabase Auth native login (for users in auth.users)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
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
      }
    } catch {
      // Continue to public.users verified check
    }

    // 2. Resilient Fallback: check public.users for registered customer
    try {
      const { data: publicUser, error: pubErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (publicUser && !pubErr && publicUser.status === 'active') {
        const inputHash = await hashPassword(password);

        if (publicUser.password_hash) {
          if (publicUser.password_hash !== inputHash) {
            throw new Error('Incorrect password. Please verify your credentials and try again.');
          }
        } else {
          // Initialize password_hash for existing user record
          try {
            await supabase.from('users').update({ password_hash: inputHash, updated_at: new Date().toISOString() }).eq('id', publicUser.id);
          } catch {
            // non-fatal
          }
        }

        const user: AuthUser = {
          id: String(publicUser.id),
          name: publicUser.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: (publicUser.role as any) || 'user',
          isVerified: true,
        };
        const token = `agm-session-${Date.now()}`;
        localStorage.setItem('agm_token', token);
        localStorage.setItem('agm_user', JSON.stringify(user));
        return { user, token };
      }
    } catch (err: any) {
      if (err.message?.includes('Incorrect password')) throw err;
    }

    throw new Error('No account found with this email, or password incorrect. Please verify your credentials or create an account.');
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name.trim() || cleanEmail.split('@')[0];
    const supabase = getSupabase();

    // 1. Check if an active account already exists with this email address
    if (supabase) {
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, email, name, status, password_hash')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingUser && existingUser.status === 'active' && existingUser.password_hash) {
          throw new Error(
            `An account with email "${cleanEmail}" is already registered. Please click "Sign In" below to log in.`
          );
        }
      } catch (checkErr: any) {
        if (checkErr.message?.includes('already registered')) throw checkErr;
      }
    }

    // 2. Generate 6-digit OTP
    const otpCode = generateOtpCode();

    // 3. Save pending registration state (Password retained for post-verification activation)
    // Note: We intentionally DO NOT call supabase.auth.signUp() here to prevent Supabase's mailer
    // from dispatching unbranded confirmation emails from noreply@mail.app.supabase.io.
    savePendingOtp(cleanEmail, displayName, otpCode, password);

    // 4. Dispatch 6-digit OTP exclusively via Resend transactional engine from verified domain
    const emailResult = await emailService.sendOtpVerificationEmail(cleanEmail, displayName, otpCode);

    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      role: 'user',
      isVerified: false,
    };

    return {
      user,
      token: `pending-${Date.now()}`,
      requiresOtp: true,
      emailResult,
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

    const supabase = getSupabase();
    let resolvedUserId = pending.userId || `usr-${Date.now()}`;
    let sessionToken = `agm-user-${Date.now()}`;
    const passwordHash = pending.password ? await hashPassword(pending.password) : null;

    if (supabase) {
      // 1. Persist user into public.users with active status and password_hash
      try {
        const { data: upsertData, error: upErr } = await supabase
          .from('users')
          .upsert(
            [
              {
                name: pending.name,
                email: cleanEmail,
                role: 'user',
                status: 'active',
                password_hash: passwordHash,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            { onConflict: 'email' }
          )
          .select()
          .maybeSingle();

        if (!upErr && upsertData?.id) {
          resolvedUserId = String(upsertData.id);
        }
      } catch (dbErr) {
        console.warn('[DirectSupabase] Failed to write user to public.users:', dbErr);
      }

      // 2. Also invoke create_confirmed_user RPC if available
      if (pending.password) {
        try {
          const { data: rpcUserId } = await supabase.rpc('create_confirmed_user', {
            p_email: cleanEmail,
            p_password: pending.password,
            p_name: pending.name,
          });

          if (rpcUserId) {
            resolvedUserId = String(rpcUserId);
            // Attempt to establish native Supabase session
            try {
              const { data: sessionData } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: pending.password,
              });
              if (sessionData?.session?.access_token) {
                sessionToken = sessionData.session.access_token;
              }
            } catch {
              // fallback token remains active
            }
          }
        } catch {
          // RPC is optional; public.users is the primary record
        }
      }
    }

    // Success: activate account session
    localStorage.removeItem(OTP_STORAGE_KEY);
    const user: AuthUser = {
      id: resolvedUserId,
      name: pending.name,
      email: cleanEmail,
      role: 'user',
      isVerified: true,
    };
    localStorage.setItem('agm_token', sessionToken);
    localStorage.setItem('agm_user', JSON.stringify(user));

    return { user, token: sessionToken };
  },

  async resendOtp(email: string, name: string): Promise<{ success: boolean; emailResult: any; newCode: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const newOtp = generateOtpCode();
    const pending = getPendingOtp(cleanEmail);

    // Preserve existing password in pending state for later activation
    savePendingOtp(cleanEmail, name, newOtp, pending?.password, pending?.userId);

    // Exclusively dispatch OTP via Resend transactional email (Never trigger Supabase default mailer)
    const emailResult = await emailService.sendOtpVerificationEmail(cleanEmail, name, newOtp);
    return { success: true, emailResult, newCode: newOtp };
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

  // Orders API - writes directly to Supabase orders table + dispatches Resend receipt
  async createOrder(payload: ApiOrderPayload): Promise<{ success: boolean; order: OrderDetails; orderId: string }> {
    const supabase = getSupabase();
    let dbId: string | undefined;
    let orderNumber = `AGM-${Math.floor(100000 + Math.random() * 900000)}`;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([
            {
              customer_name: payload.customerName.trim(),
              customer_email: payload.customerEmail.toLowerCase().trim(),
              total: payload.total,
              status: 'Processing',
              items: payload.items,
              payment_method: payload.paymentMethod || 'Bonded Card',
              shipping_address: payload.shippingAddress,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          dbId = String(data.id);
          orderNumber = `AGM-${data.id.split('-')[0].toUpperCase()}`;
        } else if (error) {
          console.warn('[DirectSupabase] Order insert warning:', error.message);
        }
      } catch (err) {
        console.warn('[DirectSupabase] Failed to write order to Supabase:', err);
      }
    }

    const orderDetails: OrderDetails = {
      orderNumber,
      dbId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerAddress: payload.shippingAddress.split(',')[0] || payload.shippingAddress,
      customerCountry: payload.shippingAddress.split(',').pop()?.trim() || 'Global Transit',
      status: 'Processing',
      items: payload.items.map((it) => ({
        id: it.productId,
        name: it.title,
        maker: (it as any).maker || 'Verified Workshop',
        price: it.price,
        quantity: it.quantity,
      })),
      subtotal: payload.total,
      discount: 0,
      total: payload.total,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Cache locally in localStorage for fast immediate lookup
    try {
      const recent = JSON.parse(localStorage.getItem('agm_recent_orders') || '[]');
      const filtered = recent.filter((r: any) => r.orderNumber !== orderNumber);
      localStorage.setItem('agm_recent_orders', JSON.stringify([orderDetails, ...filtered]));
    } catch {}

    // Dispatch itemized Order Confirmation Email via Resend
    const confirmationData: OrderConfirmationData = {
      orderId: orderNumber,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      items: payload.items.map((it) => ({
        title: it.title,
        quantity: it.quantity,
        price: it.price,
        imageUrl: it.imageUrl,
        maker: (it as any).maker,
      })),
      subtotal: payload.total,
      customsDuty: 0,
      shipping: 0,
      total: payload.total,
      shippingAddress: payload.shippingAddress,
      createdAt: orderDetails.date,
    };

    emailService.sendOrderConfirmationEmail(confirmationData).catch((err) => {
      console.warn('[EmailService] Order email warning:', err);
    });

    return { success: true, order: orderDetails, orderId: orderNumber };
  },

  // Fetch orders from Supabase (filtered by customerEmail if provided)
  async getOrders(customerEmail?: string): Promise<OrderDetails[]> {
    const supabase = getSupabase();
    const cleanEmail = customerEmail?.trim().toLowerCase();

    if (supabase) {
      try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (cleanEmail) {
          query = query.ilike('customer_email', cleanEmail);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((row: any) => {
            const shortId = row.id ? `AGM-${String(row.id).split('-')[0].toUpperCase()}` : `AGM-${Math.floor(100000 + Math.random() * 900000)}`;
            const rawItems = Array.isArray(row.items) ? row.items : [];
            const parsedItems = rawItems.map((it: any) => ({
              id: it.productId || it.id || 'item',
              name: it.title || it.name || 'Workshop Piece',
              maker: it.maker || 'Verified Workshop',
              price: Number(it.price || 0),
              quantity: Number(it.quantity || 1),
            }));

            const addr = row.shipping_address || 'Registered Consignee Address';
            const addrParts = addr.split(',');
            const country = addrParts.length > 1 ? addrParts.pop()?.trim() || 'Global Transit' : 'Global Transit';
            const street = addrParts.join(',').trim() || addr;

            return {
              orderNumber: shortId,
              dbId: String(row.id),
              customerName: row.customer_name || 'Verified Consignee',
              customerEmail: row.customer_email || cleanEmail || '',
              customerAddress: street,
              customerCountry: country,
              status: row.status || 'Processing',
              items: parsedItems,
              subtotal: Number(row.total || 0),
              discount: 0,
              total: Number(row.total || 0),
              date: new Date(row.created_at || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            };
          });
        }
      } catch (err) {
        console.warn('[DirectSupabase] getOrders query failed:', err);
      }
    }

    // Fallback to localStorage recent orders
    try {
      const stored = localStorage.getItem('agm_recent_orders');
      if (stored) {
        const parsed: OrderDetails[] = JSON.parse(stored);
        if (cleanEmail) {
          return parsed.filter((o) => o.customerEmail?.toLowerCase() === cleanEmail);
        }
        return parsed;
      }
    } catch {}

    return [];
  },

  // Instant Consignment Tracker: Lookup order by Order Number, UUID, or email
  async trackOrder(query: string): Promise<OrderDetails | null> {
    const clean = query.trim();
    if (!clean) return null;
    const supabase = getSupabase();

    if (supabase) {
      try {
        // 1. Try exact UUID
        if (clean.includes('-') && clean.length > 20) {
          const { data, error } = await supabase.from('orders').select('*').eq('id', clean).maybeSingle();
          if (!error && data) {
            const list = await this.getOrders();
            const found = list.find((o) => o.dbId === data.id);
            if (found) return found;
          }
        }

        // 2. Try email
        if (clean.includes('@')) {
          const orders = await this.getOrders(clean);
          if (orders.length > 0) return orders[0];
        }

        // 3. Search all orders by orderNumber or ID prefix
        const allOrders = await this.getOrders();
        const found = allOrders.find(
          (o) =>
            o.orderNumber.toLowerCase() === clean.toLowerCase() ||
            o.dbId?.toLowerCase().startsWith(clean.toLowerCase()) ||
            o.customerEmail.toLowerCase() === clean.toLowerCase() ||
            clean.toLowerCase().includes(o.orderNumber.replace('AGM-', '').toLowerCase())
        );
        if (found) return found;
      } catch (err) {
        console.warn('[DirectSupabase] trackOrder error:', err);
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('agm_recent_orders');
      if (stored) {
        const parsed: OrderDetails[] = JSON.parse(stored);
        const match = parsed.find(
          (o) =>
            o.orderNumber.toLowerCase() === clean.toLowerCase() ||
            o.customerEmail.toLowerCase() === clean.toLowerCase()
        );
        if (match) return match;
      }
    } catch {}

    return null;
  },
};
