export interface Product {
  id: string;
  title: string;
  price: number;
  rating: number;
  description: string;
  mainImage: string;
  slug: string;
  manufacturer: string;
  category: string;
  inStock: number; // 1 for in stock, 0 for out of stock
  popularity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productsNumber: number;
  parentCategory: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'Processing' | 'Delivered' | 'Cancelled' | 'Pending';
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface StatsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  recentOrders: Order[];
  topProducts: Product[];
}
