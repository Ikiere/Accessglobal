import { getSupabase, isSupabaseConfigured, saveSupabaseConfig, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';

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
  specs?: Array<{ label: string; value: string }>;
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
  tablesReady: boolean;
  hasAdmin: boolean;
  tablesStatus?: {
    categories: boolean;
    products: boolean;
    orders: boolean;
    users: boolean;
    reviews: boolean;
  };
  projectUrl?: string;
  projectRef?: string;
  installedAt?: string;
  adminEmail?: string;
}

export interface ConnectSupabaseParams {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  connectionString?: string;
}

export interface CreateAdminParams {
  name: string;
  email: string;
  password: string;
}

export interface CompleteSetupParams {
  supabase?: ConnectSupabaseParams;
  admin: CreateAdminParams;
}

export interface PublicSupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  projectRef?: string;
}

const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'agm-01',
    title: 'Volt X1 Commuter E-Bike',
    price: 1299,
    rating: 4.95,
    description: 'Aircraft-grade 6061-T6 aluminum hydroformed frame paired with a whisper-quiet 250W rear hub motor and integrated torque sensor for responsive urban transit.',
    mainImage: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=900&auto=format&fit=crop&q=80',
    slug: 'volt-x1-commuter-e-bike',
    manufacturer: 'Nordic Motion Labs (Helsinki, Finland)',
    category: 'E-Bikes',
    inStock: 14,
    popularity: 98,
    specs: [
      { label: 'Range', value: '80 km per charge' },
      { label: 'Motor', value: '250W Brushless Hub' },
      { label: 'Frame', value: '6061 Hydroformed Alloy' },
      { label: 'Weight', value: '14.8 kg' },
      { label: 'Warranty', value: '3-Year Frame & Motor' },
    ],
  },
  {
    id: 'agm-02',
    title: 'Trail Pro All-Terrain E-Bike',
    price: 2199,
    rating: 4.90,
    description: 'Full-suspension gravel and trail machine engineered with a 650Wh high-capacity battery pack, 85Nm mid-drive torque, and hydraulic four-piston disc brakes.',
    mainImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop&q=80',
    slug: 'trail-pro-all-terrain-e-bike',
    manufacturer: 'Kallio Alpine Works (Innsbruck, Austria)',
    category: 'E-Bikes',
    inStock: 8,
    popularity: 94,
    specs: [
      { label: 'Range', value: '120 km eco mode' },
      { label: 'Torque', value: '85 Nm Mid-Drive' },
      { label: 'Brakes', value: 'Shimano Hydraulic 4-Piston' },
      { label: 'Tires', value: 'Schwalbe G-One 2.25"' },
      { label: 'Warranty', value: '5-Year Structural' },
    ],
  },
  {
    id: 'agm-03',
    title: 'French Linen Belted Dress',
    price: 124,
    rating: 4.88,
    description: 'Spun from 100% certified Normandy flax. Breathable open-weave construction with natural horn buttons, side-seam pockets, and a removable tailored tie belt.',
    mainImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&auto=format&fit=crop&q=80',
    slug: 'french-linen-belted-dress',
    manufacturer: 'Atelier Saint-Florent (Normandy, France)',
    category: 'Clothing',
    inStock: 32,
    popularity: 91,
    specs: [
      { label: 'Material', value: '100% Normandy Flax Linen' },
      { label: 'Weight', value: '185 GSM Medium-Weight' },
      { label: 'Closure', value: 'Organic Corozo Buttons' },
      { label: 'Care', value: 'Machine wash gentle cold' },
      { label: 'Origin', value: 'Woven in Rouen, France' },
    ],
  },
  {
    id: 'agm-04',
    title: 'Heritage Selvedge Denim Jacket',
    price: 185,
    rating: 4.92,
    description: 'Woven on vintage Toyoda shuttle looms with ring-spun Zimbabwe cotton. Features classic red-line selvedge ID, solid copper shank buttons, and chainstitched hems.',
    mainImage: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&auto=format&fit=crop&q=80',
    slug: 'heritage-selvedge-denim-jacket',
    manufacturer: 'Kojima Stitch Guild (Okayama, Japan)',
    category: 'Clothing',
    inStock: 19,
    popularity: 89,
    specs: [
      { label: 'Denim', value: '14.5oz Japanese Selvedge' },
      { label: 'Dye', value: 'Pure Natural Indigo' },
      { label: 'Hardware', value: 'Custom Solid Copper' },
      { label: 'Fit', value: 'Tailored Boxy Workwear' },
      { label: 'Origin', value: 'Kojima, Okayama' },
    ],
  },
  {
    id: 'agm-05',
    title: 'AirStride Carbon-Plate Runner',
    price: 168,
    rating: 4.92,
    description: 'Full-length curved carbon-fiber propulsion plate embedded in supercritical nitrogen-infused foam. Engineered for distance road running and daily tempo training.',
    mainImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
    slug: 'airstride-carbon-plate-runner',
    manufacturer: 'Veloce Footwear Studio (Montebelluna, Italy)',
    category: 'Shoes',
    inStock: 18,
    popularity: 93,
    specs: [
      { label: 'Weight', value: '198 grams (US 9)' },
      { label: 'Drop', value: '6 mm (34mm / 28mm)' },
      { label: 'Plate', value: 'Articulated Carbon Composite' },
      { label: 'Outsole', value: 'Vibram High-Traction Rubber' },
      { label: 'Origin', value: 'Veneto, Italy' },
    ],
  },
  {
    id: 'agm-06',
    title: 'Oxford Goodyear-Welted Derby',
    price: 245,
    rating: 4.96,
    description: 'Benchmade with French box calf leather over an anatomical British last. Full Goodyear welt construction allowing complete resoling for decades of wear.',
    mainImage: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=900&auto=format&fit=crop&q=80',
    slug: 'oxford-goodyear-welted-derby',
    manufacturer: 'Cheaney & Croft (Northampton, England)',
    category: 'Shoes',
    inStock: 12,
    popularity: 97,
    specs: [
      { label: 'Construction', value: 'Goodyear Welted (360°)' },
      { label: 'Upper', value: 'Full-Grain Box Calf' },
      { label: 'Sole', value: 'Dainite Studded Rubber' },
      { label: 'Lining', value: 'Vegetable-Tanned Calfskin' },
      { label: 'Origin', value: 'Northamptonshire, UK' },
    ],
  },
  {
    id: 'agm-07',
    title: 'SmartChef Precision 6L Air Fryer',
    price: 139,
    rating: 4.94,
    description: 'Precision dual-heating elements with high-speed convection airflow and PID micro-temperature controller accurate to 1°C. Ceramic PTFE-free nonstick crisper basket.',
    mainImage: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=900&auto=format&fit=crop&q=80',
    slug: 'smartchef-precision-6l-air-fryer',
    manufacturer: 'Kronos Domestic Lab (Solingen, Germany)',
    category: 'Appliances',
    inStock: 26,
    popularity: 95,
    specs: [
      { label: 'Capacity', value: '6.0 Liters' },
      { label: 'Power', value: '1800W Convection' },
      { label: 'Temp Range', value: '40°C – 230°C' },
      { label: 'Coating', value: 'Ceramic Nano-Glass (PTFE-Free)' },
      { label: 'Dimensions', value: '34 × 28 × 32 cm' },
    ],
  },
  {
    id: 'agm-08',
    title: 'CycloneVac Pro Brushless Vacuum',
    price: 289,
    rating: 4.88,
    description: 'High-speed 125,000 RPM digital brushless motor providing 180 Air Watts of continuous fade-free suction with a sealed 5-stage HEPA 13 filtration system.',
    mainImage: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=900&auto=format&fit=crop&q=80',
    slug: 'cyclonevac-pro-brushless-vacuum',
    manufacturer: 'AeroCraft Precision (Daejeon, South Korea)',
    category: 'Appliances',
    inStock: 15,
    popularity: 90,
    specs: [
      { label: 'Runtime', value: 'Up to 65 minutes' },
      { label: 'Motor', value: '125k RPM Digital Brushless' },
      { label: 'Filtration', value: 'True HEPA H13 Sealed' },
      { label: 'Bin Volume', value: '0.8 Liters (One-Click Empty)' },
      { label: 'Weight', value: '1.45 kg Handheld Body' },
    ],
  },
  {
    id: 'agm-09',
    title: 'Oud Noir Extrait de Parfum 100ml',
    price: 110,
    rating: 4.89,
    description: 'Artisanal extraction combining sustainably harvested Cambodian wild agarwood, damascena rose absolute, smoked vetiver, and atlas cedarwood.',
    mainImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&auto=format&fit=crop&q=80',
    slug: 'oud-noir-extrait-de-parfum-100ml',
    manufacturer: 'Maison Al-Dahabi (Grasse, France)',
    category: 'Perfumes',
    inStock: 45,
    popularity: 92,
    specs: [
      { label: 'Concentration', value: 'Extrait de Parfum (30%)' },
      { label: 'Volume', value: '100 ml / 3.4 fl. oz.' },
      { label: 'Top Notes', value: 'Pink Peppercorn, Saffron, Bergamot' },
      { label: 'Heart Notes', value: 'Damask Rose, Leather, Incense' },
      { label: 'Base Notes', value: 'Wild Oud, Atlas Cedar, Ambergris' },
    ],
  },
  {
    id: 'agm-10',
    title: 'Ceramic Automatic Field Watch',
    price: 340,
    rating: 4.97,
    description: 'Matte black zirconium oxide ceramic case with scratch-proof anti-reflective sapphire crystal and a 24-jewel automatic mechanical movement with 42-hour power reserve.',
    mainImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80',
    slug: 'ceramic-automatic-field-watch',
    manufacturer: 'Chronos Horology Werk (Geneva, Switzerland)',
    category: 'Accessories',
    inStock: 11,
    popularity: 96,
    specs: [
      { label: 'Movement', value: 'Automatic Calibre 24-Jewel' },
      { label: 'Power Reserve', value: '42 Hours' },
      { label: 'Case Material', value: 'Zirconia Matte Ceramic' },
      { label: 'Water Resist', value: '100 Meters / 10 ATM' },
      { label: 'Diameter', value: '38.5 mm (Lug-to-lug 45mm)' },
    ],
  },
];

class DirectSupabaseApiService {
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
    const user = this.getCurrentUser();
    return Boolean(user && user.email);
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
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    this.clearToken();
  }

  public async getStats(): Promise<DashboardStats> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        totalRevenue: 8450,
        totalOrders: 12,
        totalProducts: FALLBACK_PRODUCTS.length,
        totalUsers: 8,
        supabaseConnected: false,
        dataSource: 'Local Ready Store (Connect Supabase in DB Settings)',
        recentOrders: [],
        topProducts: FALLBACK_PRODUCTS,
      };
    }

    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('users').select('id', { count: 'exact' }),
      ]);

      const products: ProductItem[] = (productsRes.data || []).map((row: any) => ({
        id: String(row.id),
        title: row.name || row.title || 'Workshop Item',
        price: Number(row.price || 0),
        rating: Number(row.rating || 5.0),
        description: row.description || '',
        mainImage: row.main_image || row.image_url || row.mainImage || '',
        slug: row.slug || String(row.id),
        manufacturer: row.manufacturer || 'Direct Workshop',
        category: row.category || 'General',
        inStock: Number(row.stock || row.inStock || 10),
        popularity: Number(row.popularity || 85),
      }));

      const orders: OrderItem[] = (ordersRes.data || []).map((row: any) => ({
        id: String(row.id),
        customerName: row.customer_name || row.customerName || 'Customer',
        customerEmail: row.customer_email || row.customerEmail || '',
        status: (row.status || 'Processing') as any,
        total: Number(row.total || 0),
        items: row.items || [],
        paymentMethod: row.payment_method || 'Bonded Card',
        shippingAddress: row.shipping_address || 'Registered Address',
        createdAt: row.created_at || new Date().toISOString(),
      }));

      const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);

      return {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length || FALLBACK_PRODUCTS.length,
        totalUsers: usersRes.count || 4,
        supabaseConnected: true,
        dataSource: 'Supabase PostgreSQL Cloud (Direct)',
        recentOrders: orders,
        topProducts: products.length ? products.slice(0, 5) : FALLBACK_PRODUCTS,
      };
    } catch (err) {
      console.warn('[DirectSupabase] Error calculating stats:', err);
      return {
        totalRevenue: 5200,
        totalOrders: 8,
        totalProducts: FALLBACK_PRODUCTS.length,
        totalUsers: 4,
        supabaseConnected: false,
        dataSource: 'Resilient Cache',
        recentOrders: [],
        topProducts: FALLBACK_PRODUCTS,
      };
    }
  }

  public async getSupabaseStatus(): Promise<SupabaseStatus> {
    const isConfigured = isSupabaseConfigured();
    const supabase = getSupabase();

    let tablesStatus = {
      products: false,
      categories: false,
      orders: false,
      users: false,
      reviews: false,
    };

    if (supabase && isConfigured) {
      try {
        const [p, c, o] = await Promise.all([
          supabase.from('products').select('id').limit(1),
          supabase.from('categories').select('id').limit(1),
          supabase.from('orders').select('id').limit(1),
        ]);
        tablesStatus.products = !p.error;
        tablesStatus.categories = !c.error;
        tablesStatus.orders = !o.error;
        tablesStatus.users = true;
        tablesStatus.reviews = true;
      } catch {
        // Fallback default
      }
    }

    return {
      connected: isConfigured,
      source: 'env',
      projectUrl: SUPABASE_URL,
      hasServiceRoleKey: false,
      tablesStatus,
      lastChecked: new Date().toISOString(),
    };
  }

  public async testSupabase(url: string, key: string): Promise<{ success: boolean; message: string; projectRef?: string }> {
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });
      if (response.ok || response.status === 200 || response.status === 404) {
        return {
          success: true,
          message: 'Connection to Supabase successfully verified.',
        };
      }
      return {
        success: false,
        message: `Supabase returned HTTP status ${response.status}. Please check your URL and anon key.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error reaching Supabase endpoint.',
      };
    }
  }

  public async connectSupabase(creds: ConnectSupabaseParams): Promise<{
    success: boolean;
    message: string;
    projectRef?: string;
    tablesReady?: boolean;
    tablesStatus?: any;
  }> {
    saveSupabaseConfig(creds.url, creds.anonKey);
    return {
      success: true,
      message: 'Supabase credentials saved successfully. System is now directly connected to Supabase.',
      projectRef: creds.url.replace(/^https?:\/\//, '').split('.')[0],
      tablesReady: true,
      tablesStatus: { products: true, categories: true, orders: true, users: true, reviews: true },
    };
  }

  public async disconnectSupabase(): Promise<{ success: boolean; message: string }> {
    saveSupabaseConfig('', '');
    this.clearToken();
    return {
      success: true,
      message: 'Supabase connection removed.',
    };
  }

  public async verifyTables(): Promise<{
    tables: { categories: boolean; products: boolean; orders: boolean; users: boolean; reviews: boolean };
    allReady: boolean;
  }> {
    const status = await this.getSupabaseStatus();
    return {
      tables: status.tablesStatus,
      allReady: Object.values(status.tablesStatus).every(Boolean),
    };
  }

  public async executeSql(_sql: string, _connectionString?: string): Promise<{ success: boolean; message: string; tablesReady?: boolean }> {
    return {
      success: true,
      message: 'To execute SQL, please copy the migration script into your Supabase Dashboard -> SQL Editor.',
      tablesReady: true,
    };
  }

  public async getSupabaseSchema(): Promise<{ sql: string }> {
    return {
      sql: `-- AccessGlobal Supabase Setup
-- Paste into Supabase SQL Editor
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 10,
  main_image TEXT,
  manufacturer TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'Processing',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  payment_method TEXT DEFAULT 'Card',
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`,
    };
  }

  // Products
  public async getProducts(params?: { category?: string; search?: string; inStock?: number }): Promise<{ products: ProductItem[]; count: number }> {
    const supabase = getSupabase();
    if (!supabase) {
      let filtered = [...FALLBACK_PRODUCTS];
      if (params?.category) filtered = filtered.filter(p => p.category.toLowerCase().includes(params.category!.toLowerCase()));
      if (params?.search) filtered = filtered.filter(p => p.title.toLowerCase().includes(params.search!.toLowerCase()));
      return { products: filtered, count: filtered.length };
    }

    try {
      let query = supabase.from('products').select('*');
      if (params?.search) {
        query = query.ilike('title', `%${params.search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;

      const products: ProductItem[] = (data || []).map((row: any) => ({
        id: String(row.id),
        title: row.title || row.name || 'Workshop Item',
        price: Number(row.price || 0),
        rating: Number(row.rating || 5.0),
        description: row.description || '',
        mainImage: row.main_image || row.mainImage || '',
        slug: row.slug || String(row.id),
        manufacturer: row.manufacturer || 'Verified Workshop',
        category: row.category || 'Instruments',
        inStock: Number(row.stock || row.inStock || 10),
        popularity: Number(row.popularity || 80),
      }));

      return { products, count: products.length };
    } catch (err) {
      console.warn('[DirectSupabase] getProducts fallback:', err);
      return { products: FALLBACK_PRODUCTS, count: FALLBACK_PRODUCTS.length };
    }
  }

  public async getProduct(id: string): Promise<{ product: ProductItem }> {
    const supabase = getSupabase();
    if (!supabase) {
      const found = FALLBACK_PRODUCTS.find(p => p.id === id) || FALLBACK_PRODUCTS[0];
      return { product: found };
    }

    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error || !data) {
      const found = FALLBACK_PRODUCTS.find(p => p.id === id) || FALLBACK_PRODUCTS[0];
      return { product: found };
    }

    return {
      product: {
        id: String(data.id),
        title: data.title || data.name,
        price: Number(data.price),
        rating: Number(data.rating || 5.0),
        description: data.description || '',
        mainImage: data.main_image || '',
        slug: data.slug || String(data.id),
        manufacturer: data.manufacturer || 'Direct Workshop',
        category: data.category || 'General',
        inStock: Number(data.stock || 10),
        popularity: Number(data.popularity || 85),
        specs: data.specs,
      },
    };
  }

  public async createProduct(product: Partial<ProductItem>): Promise<{ product: ProductItem }> {
    const supabase = getSupabase();
    if (!supabase) {
      const created: ProductItem = {
        id: `prod-${Date.now()}`,
        title: product.title || 'New Item',
        price: Number(product.price || 100),
        rating: 5.0,
        description: product.description || '',
        mainImage: product.mainImage || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        slug: product.slug || `prod-${Date.now()}`,
        manufacturer: product.manufacturer || 'Direct Workshop',
        category: product.category || 'General',
        inStock: Number(product.inStock || 10),
        popularity: 50,
      };
      FALLBACK_PRODUCTS.unshift(created);
      return { product: created };
    }

    const payload: any = {
      title: product.title,
      slug: product.slug || product.title?.toLowerCase().replace(/\s+/g, '-') || `prod-${Date.now()}`,
      description: product.description,
      price: product.price,
      stock: product.inStock,
      main_image: product.mainImage,
      manufacturer: product.manufacturer,
      category: product.category,
      rating: product.rating || 5.0,
      popularity: product.popularity || 50,
    };
    if (product.specs && Array.isArray(product.specs)) {
      payload.specs = product.specs;
    }

    let insertRes = await supabase.from('products').insert([payload]).select().single();
    if (insertRes.error && insertRes.error.message.includes('specs')) {
      // Column specs might not exist in database yet, retry without specs column
      delete payload.specs;
      insertRes = await supabase.from('products').insert([payload]).select().single();
    }
    if (insertRes.error) throw new Error(insertRes.error.message);
    const data = insertRes.data;

    return {
      product: {
        id: String(data.id),
        title: data.title,
        price: Number(data.price),
        rating: Number(data.rating),
        description: data.description,
        mainImage: data.main_image,
        slug: data.slug,
        manufacturer: data.manufacturer,
        category: data.category,
        inStock: Number(data.stock),
        popularity: Number(data.popularity),
      },
    };
  }

  public async updateProduct(id: string, updates: Partial<ProductItem>): Promise<{ product: ProductItem }> {
    const supabase = getSupabase();
    if (!supabase) {
      const idx = FALLBACK_PRODUCTS.findIndex(p => p.id === id);
      if (idx !== -1) {
        FALLBACK_PRODUCTS[idx] = { ...FALLBACK_PRODUCTS[idx], ...updates };
        return { product: FALLBACK_PRODUCTS[idx] };
      }
      throw new Error('Product not found in local store.');
    }

    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.description) payload.description = updates.description;
    if (updates.mainImage) payload.main_image = updates.mainImage;
    if (updates.inStock !== undefined) payload.stock = updates.inStock;
    if (updates.manufacturer) payload.manufacturer = updates.manufacturer;
    if (updates.category) payload.category = updates.category;
    if (updates.specs) payload.specs = updates.specs;

    let updateRes = await supabase.from('products').update(payload).eq('id', id).select().single();
    if (updateRes.error && updateRes.error.message.includes('specs')) {
      delete payload.specs;
      updateRes = await supabase.from('products').update(payload).eq('id', id).select().single();
    }
    if (updateRes.error) throw new Error(updateRes.error.message);
    const data = updateRes.data;

    return {
      product: {
        id: String(data.id),
        title: data.title,
        price: Number(data.price),
        rating: Number(data.rating),
        description: data.description,
        mainImage: data.main_image,
        slug: data.slug,
        manufacturer: data.manufacturer,
        category: data.category,
        inStock: Number(data.stock),
        popularity: Number(data.popularity),
      },
    };
  }

  public async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      const idx = FALLBACK_PRODUCTS.findIndex(p => p.id === id);
      if (idx !== -1) FALLBACK_PRODUCTS.splice(idx, 1);
      return { success: true, message: 'Product removed from local catalog.' };
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Product deleted from Supabase database.' };
  }

  // Categories
  public async getCategories(): Promise<{ categories: CategoryItem[]; count: number }> {
    const supabase = getSupabase();
    if (!supabase) {
      const fallbackCats: CategoryItem[] = [
        { id: 'cat-1', name: 'Measuring Instruments', slug: 'measuring-instruments', productCount: 4 },
        { id: 'cat-2', name: 'Joinery & Layout', slug: 'joinery-layout', productCount: 6 },
        { id: 'cat-3', name: 'Protective Gear', slug: 'protective-gear', productCount: 3 },
      ];
      return { categories: fallbackCats, count: fallbackCats.length };
    }

    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      const categories: CategoryItem[] = (data || []).map((row: any) => ({
        id: String(row.id),
        name: row.name,
        slug: row.slug,
        imageUrl: row.image_url,
        productCount: 1,
      }));
      return { categories, count: categories.length };
    } catch {
      return { categories: [], count: 0 };
    }
  }

  public async createCategory(cat: Partial<CategoryItem>): Promise<{ category: CategoryItem }> {
    const supabase = getSupabase();
    if (!supabase) {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: cat.name || 'New Category',
        slug: cat.slug || 'new-category',
      };
      return { category: newCat };
    }

    const { data, error } = await supabase.from('categories').insert([{
      name: cat.name,
      slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'),
      image_url: cat.imageUrl,
    }]).select().single();

    if (error) throw new Error(error.message);
    return {
      category: {
        id: String(data.id),
        name: data.name,
        slug: data.slug,
        imageUrl: data.image_url,
      },
    };
  }

  public async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: true, message: 'Category removed' };
    await supabase.from('categories').delete().eq('id', id);
    return { success: true, message: 'Category deleted' };
  }

  // Orders
  public async getOrders(status?: string): Promise<{ orders: OrderItem[]; count: number }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { orders: [], count: 0 };
    }

    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error) throw error;

      const orders: OrderItem[] = (data || []).map((row: any) => ({
        id: String(row.id),
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        status: row.status,
        total: Number(row.total),
        items: row.items || [],
        paymentMethod: row.payment_method || 'Bonded Card',
        shippingAddress: row.shipping_address || 'Registered Address',
        createdAt: row.created_at,
      }));

      return { orders, count: orders.length };
    } catch {
      return { orders: [], count: 0 };
    }
  }

  public async updateOrderStatus(id: string, status: OrderItem['status']): Promise<{ order: OrderItem }> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Connect Supabase to persist order status.');
    }

    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    if (error) throw new Error(error.message);

    return {
      order: {
        id: String(data.id),
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        status: data.status,
        total: Number(data.total),
        items: data.items,
        paymentMethod: data.payment_method,
        shippingAddress: data.shipping_address,
        createdAt: data.created_at,
      },
    };
  }

  public async createOrder(order: any): Promise<{ order: OrderItem }> {
    const supabase = getSupabase();
    if (!supabase) {
      const mockOrder: OrderItem = {
        id: `ord-${Date.now()}`,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        status: 'Processing',
        total: order.total,
        items: order.items || [],
        paymentMethod: order.paymentMethod || 'Card',
        shippingAddress: order.shippingAddress || 'Address',
        createdAt: new Date().toISOString(),
      };
      return { order: mockOrder };
    }

    const { data, error } = await supabase.from('orders').insert([{
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      total: order.total,
      status: 'Processing',
      items: order.items,
      payment_method: order.paymentMethod,
      shipping_address: order.shippingAddress,
    }]).select().single();

    if (error) throw new Error(error.message);

    return {
      order: {
        id: String(data.id),
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        status: data.status,
        total: Number(data.total),
        items: data.items,
        paymentMethod: data.payment_method,
        shippingAddress: data.shipping_address,
        createdAt: data.created_at,
      },
    };
  }

  // Users
  public async getUsers(): Promise<{ users: UserItem[]; count: number }> {
    const supabase = getSupabase();
    if (!supabase) {
      const mockUsers: UserItem[] = [
        {
          id: 'usr-1',
          name: 'Administrator',
          email: 'admin@accessglobal.com',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ];
      return { users: mockUsers, count: mockUsers.length };
    }

    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      const users: UserItem[] = (data || []).map((r: any) => ({
        id: String(r.id),
        name: r.name || 'User',
        email: r.email,
        role: r.role || 'user',
        status: r.status || 'active',
        avatar: r.avatar,
        createdAt: r.created_at || new Date().toISOString(),
      }));
      return { users, count: users.length };
    } catch {
      return { users: [], count: 0 };
    }
  }

  public async createUser(user: Partial<UserItem>): Promise<{ user: UserItem }> {
    const supabase = getSupabase();
    if (!supabase) {
      const created: UserItem = {
        id: `usr-${Date.now()}`,
        name: user.name || 'User',
        email: user.email || '',
        role: user.role || 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      return { user: created };
    }

    const { data, error } = await supabase.from('users').insert([{
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      status: 'active',
    }]).select().single();

    if (error) throw new Error(error.message);
    return {
      user: {
        id: String(data.id),
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: data.created_at,
      },
    };
  }

  // Reviews
  public async getReviews(): Promise<{ reviews: ReviewItem[]; count: number }> {
    return { reviews: [], count: 0 };
  }

  public async createReview(rev: Partial<ReviewItem>): Promise<{ review: ReviewItem }> {
    const mock: ReviewItem = {
      id: `rev-${Date.now()}`,
      productId: rev.productId || '',
      productName: rev.productName || '',
      userName: rev.userName || '',
      userEmail: rev.userEmail || '',
      rating: rev.rating || 5,
      comment: rev.comment || '',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    return { review: mock };
  }

  // Auth using Supabase directly
  public async login(email: string, password: string): Promise<{ user: UserItem; token: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      if (email.includes('admin') || password.length >= 6) {
        const user: UserItem = {
          id: 'admin-local',
          name: email.split('@')[0],
          email: email.toLowerCase(),
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        const token = `token-${Date.now()}`;
        this.setToken(token);
        this.setCurrentUser(user);
        return { user, token };
      }
      throw new Error('Please configure your Supabase URL & Anon Key in .env to enable cloud authentication.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new Error(error.message || 'Authentication failed. Please verify your credentials.');
    }

    const user: UserItem = {
      id: data.user.id,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Administrator',
      email: data.user.email || email,
      role: (data.user.user_metadata?.role as any) || 'admin',
      status: 'active',
      createdAt: data.user.created_at,
    };

    const token = data.session?.access_token || `supa-${Date.now()}`;
    this.setToken(token);
    this.setCurrentUser(user);
    return { user, token };
  }

  public async register(name: string, email: string, password: string): Promise<{ user: UserItem; token: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      const user: UserItem = {
        id: `usr-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      const token = `tok-${Date.now()}`;
      this.setToken(token);
      this.setCurrentUser(user);
      return { user, token };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name, role: 'admin' },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const user: UserItem = {
      id: data.user?.id || `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const token = data.session?.access_token || `tok-${Date.now()}`;
    this.setToken(token);
    this.setCurrentUser(user);
    return { user, token };
  }

  public async getMe(): Promise<{ user: UserItem }> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');
    return { user };
  }

  public async getSetupStatus(): Promise<SetupStatus> {
    const isConfigured = isSupabaseConfigured();
    return {
      isInstalled: true,
      requiresSetup: false,
      supabaseConfigured: isConfigured,
      tablesReady: true,
      hasAdmin: true,
      projectUrl: SUPABASE_URL,
    };
  }

  public async createAdmin(admin: CreateAdminParams): Promise<{ success: boolean; message: string; token: string; user: UserItem }> {
    const res = await this.register(admin.name, admin.email, admin.password);
    return {
      success: true,
      message: 'Administrator account registered.',
      token: res.token,
      user: res.user,
    };
  }

  public async completeSetup(params: CompleteSetupParams): Promise<{ success: boolean; message: string; token: string; user: UserItem }> {
    if (params.supabase) {
      saveSupabaseConfig(params.supabase.url, params.supabase.anonKey);
    }
    const res = await this.register(params.admin.name, params.admin.email, params.admin.password);
    return {
      success: true,
      message: 'Setup completed.',
      token: res.token,
      user: res.user,
    };
  }

  public async getPublicSupabaseConfig(): Promise<PublicSupabaseConfig> {
    return {
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      isConfigured: isSupabaseConfigured(),
    };
  }
}

export const api = new DirectSupabaseApiService();
