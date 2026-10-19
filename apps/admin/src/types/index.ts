export type TenantStatus = 'Active' | 'Pending KYC' | 'Suspended';
export type TenantTier = 'Enterprise' | 'Growth' | 'Starter';

export interface Tenant {
  id: string;
  companyName: string;
  jurisdiction: string;
  tier: TenantTier;
  volume30d: number;
  status: TenantStatus;
  joinedAt: string;
  primaryContact: string;
}

export interface MetricSummary {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  sublabel: string;
}

export interface DailyVolume {
  date: string;
  volume: number; // in USD
  txCount: number;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  bypassInstantSettlement: boolean;
  automatedOFAC: boolean;
  retryLimit: number;
  rateLimitPerSec: number;
}
