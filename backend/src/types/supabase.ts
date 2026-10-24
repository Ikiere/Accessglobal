export interface SupabaseCredentials {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface SupabaseConfigStatus {
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
