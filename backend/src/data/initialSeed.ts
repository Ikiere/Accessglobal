import { Product, Category, Order, User, Review } from '../types/models.js';

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Smartphones & Mobile',
    slug: 'smartphones',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    productsNumber: 24,
    parentCategory: '/'
  },
  {
    id: 'cat-2',
    name: 'Laptops & Workstations',
    slug: 'laptops',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    productsNumber: 18,
    parentCategory: '/'
  },
  {
    id: 'cat-3',
    name: 'Audio & Acoustics',
    slug: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    productsNumber: 15,
    parentCategory: '/'
  },
  {
    id: 'cat-4',
    name: 'Wearables & Smartwatches',
    slug: 'wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    productsNumber: 12,
    parentCategory: '/'
  },
  {
    id: 'cat-5',
    name: 'Cameras & Optics',
    slug: 'cameras',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    productsNumber: 9,
    parentCategory: '/'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'Titanium Pro Edition Smartphone 256GB',
    price: 1199.00,
    rating: 4.9,
    description: 'Next-generation flagship smartphone with aerospace-grade titanium frame, 120Hz Super AMOLED display, and triple computational camera system.',
    mainImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    slug: 'titanium-pro-smartphone-256gb',
    manufacturer: 'AccessTech',
    category: 'Smartphones & Mobile',
    inStock: 1,
    popularity: 98
  },
  {
    id: 'prod-2',
    title: 'ApexBook Pro 16-inch M-Max Chip',
    price: 2499.00,
    rating: 4.8,
    description: 'High-performance developer workstation with 32-core neural engine, 64GB unified memory, and 120Hz Liquid Retina XDR screen.',
    mainImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    slug: 'apexbook-pro-16-inch-m-max',
    manufacturer: 'AccessTech',
    category: 'Laptops & Workstations',
    inStock: 1,
    popularity: 95
  },
  {
    id: 'prod-3',
    title: 'Aura ANC Wireless Studio Headphones',
    price: 349.00,
    rating: 4.9,
    description: 'Studio-grade spatial audio headphones with active hybrid noise cancellation, transparency mode, and 40-hour ultra battery lifespan.',
    mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    slug: 'aura-anc-wireless-headphones',
    manufacturer: 'Acoustics Global',
    category: 'Audio & Acoustics',
    inStock: 1,
    popularity: 91
  },
  {
    id: 'prod-4',
    title: 'Pulse Chrono Ultra Smartwatch',
    price: 429.00,
    rating: 4.7,
    description: 'Rugged titanium adventure smartwatch with dual-frequency GPS, ECG biometric tracking, and 100m water resistance rating.',
    mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    slug: 'pulse-chrono-ultra-smartwatch',
    manufacturer: 'Pulse Wear',
    category: 'Wearables & Smartwatches',
    inStock: 1,
    popularity: 88
  },
  {
    id: 'prod-5',
    title: 'CineMatrix 8K Mirrorless Cinematic Camera',
    price: 3899.00,
    rating: 5.0,
    description: 'Full-frame cinema mirrorless camera capable of 8K 60fps raw recording with 16 stops of dynamic range and dual native ISO.',
    mainImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    slug: 'cinematrix-8k-mirrorless-camera',
    manufacturer: 'Vision Optics',
    category: 'Cameras & Optics',
    inStock: 1,
    popularity: 84
  },
  {
    id: 'prod-6',
    title: 'Quantum Soundbar with Wireless Subwoofer',
    price: 699.00,
    rating: 4.6,
    description: 'Dolby Atmos 7.1.4 immersive home cinema audio bar with room calibration microphones and wireless satellite rear speakers.',
    mainImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    slug: 'quantum-soundbar-subwoofer',
    manufacturer: 'Acoustics Global',
    category: 'Audio & Acoustics',
    inStock: 1,
    popularity: 76
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ORD-78921',
    customerName: 'Alexander Vance',
    customerEmail: 'alex.vance@vanguardmedia.com',
    status: 'Delivered',
    total: 2499.00,
    items: [
      {
        productId: 'prod-2',
        title: 'ApexBook Pro 16-inch M-Max Chip',
        price: 2499.00,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80'
      }
    ],
    paymentMethod: 'Corporate Wire',
    shippingAddress: '452 5th Avenue, New York, NY 10018',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ORD-78922',
    customerName: 'Sarah Jenkins',
    customerEmail: 's.jenkins@meridian-tech.org',
    status: 'Processing',
    total: 1548.00,
    items: [
      {
        productId: 'prod-1',
        title: 'Titanium Pro Edition Smartphone 256GB',
        price: 1199.00,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
      },
      {
        productId: 'prod-3',
        title: 'Aura ANC Wireless Studio Headphones',
        price: 349.00,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
      }
    ],
    paymentMethod: 'Credit Card (Stripe)',
    shippingAddress: '100 Montgomery St, San Francisco, CA 94104',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'ORD-78923',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@geneva-capital.ch',
    status: 'Pending',
    total: 429.00,
    items: [
      {
        productId: 'prod-4',
        title: 'Pulse Chrono Ultra Smartwatch',
        price: 429.00,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
      }
    ],
    paymentMethod: 'Apple Pay',
    shippingAddress: 'Rue du Rhône 42, 1204 Genève, Switzerland',
    createdAt: new Date().toISOString()
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Admin Ikiere',
    email: 'admin@accessglobal.io',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'usr-2',
    name: 'Alexander Vance',
    email: 'alex.vance@vanguardmedia.com',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T10:30:00Z'
  },
  {
    id: 'usr-3',
    name: 'Sarah Jenkins',
    email: 's.jenkins@meridian-tech.org',
    role: 'manager',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-02-12T14:15:00Z'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'Titanium Pro Edition Smartphone 256GB',
    userName: 'Alexander Vance',
    userEmail: 'alex.vance@vanguardmedia.com',
    rating: 5,
    comment: 'Exceptional build quality and battery life. Fast delivery and pristine packaging.',
    status: 'approved',
    createdAt: '2026-03-01T11:00:00Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-3',
    productName: 'Aura ANC Wireless Studio Headphones',
    userName: 'Sarah Jenkins',
    userEmail: 's.jenkins@meridian-tech.org',
    rating: 5,
    comment: 'The active noise cancellation is superior to anything else on the market. Extremely satisfied.',
    status: 'approved',
    createdAt: '2026-03-05T15:20:00Z'
  }
];
