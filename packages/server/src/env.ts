import type { RoleGrant } from '@moain/shared';
import type { Db } from './lib/db';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  DEMO?: string;
  DEFAULT_TENANT?: string;
  PEPPER?: string;
}

export interface TenantSettings {
  timezone: string;
  currency_code: string;
  currency_decimals: number;
  numerals: 'western' | 'eastern';
  allow_negative_stock: number;
  exception_ttl_minutes: number;
  qty_decimals: number;
}

export interface AuthCtx {
  tenantId: string;
  userId: string;
  userName: string;
  sessionId: string;
  deviceId: string | null;
  grants: RoleGrant[];
  settings: TenantSettings;
  db: Db;
}

export type AppEnv = { Bindings: Env; Variables: { auth: AuthCtx; requestId: string } };
