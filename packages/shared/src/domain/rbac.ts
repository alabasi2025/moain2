/** RBAC — mirrors 03-security-rbac §3.1 matrix (the matrix is authoritative, finding D2). */
export const ROLES = ['owner', 'admin', 'plant_manager', 'plant_staff', 'branch_user', 'storekeeper', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'settings:write', 'users:write', 'locations:write',
  'catalog:read', 'catalog:write', 'windows:write',
  'orders:submit', 'orders:read', 'orders:cancel',
  'exceptions:request', 'exceptions:decide',
  'production:read', 'production:manage', 'production:section_complete', 'production:print',
  'deliveries:create', 'deliveries:receive',
  'inventory:read', 'inventory:write', 'vouchers:post', 'counts:write',
  'stock:read', 'costs:view', 'audit:read', 'reports:read',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ALL = new Set<Permission>(PERMISSIONS);

export const ROLE_PERMS: Record<Role, ReadonlySet<Permission>> = {
  owner: ALL,
  admin: ALL,
  plant_manager: new Set<Permission>(['catalog:read', 'catalog:write', 'windows:write', 'orders:read', 'orders:cancel', 'exceptions:decide', 'production:read', 'production:manage', 'production:section_complete', 'production:print', 'deliveries:create', 'stock:read', 'reports:read']),
  plant_staff: new Set<Permission>(['catalog:read', 'orders:read', 'production:read', 'production:section_complete', 'production:print', 'deliveries:create']),
  branch_user: new Set<Permission>(['catalog:read', 'orders:submit', 'orders:read', 'orders:cancel', 'exceptions:request', 'deliveries:receive']),
  storekeeper: new Set<Permission>(['catalog:read', 'inventory:read', 'inventory:write', 'vouchers:post', 'counts:write', 'stock:read', 'costs:view', 'reports:read']),
  viewer: new Set<Permission>(['catalog:read', 'orders:read', 'production:read', 'production:print', 'stock:read', 'reports:read', 'inventory:read']),
};

export interface RoleGrant {
  readonly role: Role;
  /** null = tenant-wide */
  readonly location_id: string | null;
}

export function can(grants: readonly RoleGrant[], perm: Permission, locationId?: string | null): boolean {
  return grants.some((g) => ROLE_PERMS[g.role].has(perm) && (g.location_id === null || locationId === undefined || g.location_id === locationId));
}

export function hasRole(grants: readonly RoleGrant[], ...roles: Role[]): boolean {
  return grants.some((g) => roles.includes(g.role));
}

/** Locations a user may act on for a permission; null = all. */
export function scopeFor(grants: readonly RoleGrant[], perm: Permission): string[] | null {
  const relevant = grants.filter((g) => ROLE_PERMS[g.role].has(perm));
  if (relevant.some((g) => g.location_id === null)) return null;
  return relevant.map((g) => g.location_id).filter((x): x is string => x !== null);
}

const COST_KEY = /(cost|valuation|value|rate)_?/i;
/** Field-level security (H3): drop cost fields for users without costs:view. */
export function stripCosts<T>(data: T, allowed: boolean): T {
  if (allowed) return data;
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([k]) => !COST_KEY.test(k) || k === 'stock_status').map(([k, x]) => [k, walk(x)]));
    }
    return v;
  };
  return walk(data) as T;
}

/** Bottom-navigation tabs per role (02-screen-map §1). Union for multi-role users, capped at 5. */
export type NavTab = 'home' | 'order' | 'receive' | 'history' | 'production' | 'deliver' | 'reports' | 'movement' | 'materials' | 'vouchers' | 'stock' | 'settings' | 'more';
const NAV: Record<Role, NavTab[]> = {
  branch_user: ['home', 'order', 'receive', 'history', 'more'],
  plant_manager: ['home', 'production', 'deliver', 'reports', 'more'],
  plant_staff: ['home', 'production', 'deliver', 'more'],
  storekeeper: ['home', 'movement', 'materials', 'vouchers', 'more'],
  admin: ['home', 'production', 'stock', 'reports', 'settings'],
  owner: ['home', 'production', 'stock', 'reports', 'settings'],
  viewer: ['home', 'reports', 'more'],
};
export function navFor(roles: readonly Role[]): NavTab[] {
  const priority: Role[] = ['owner', 'admin', 'plant_manager', 'plant_staff', 'storekeeper', 'branch_user', 'viewer'];
  const sorted = [...new Set(roles)].sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
  const out: NavTab[] = [];
  for (const r of sorted) for (const t of NAV[r]) if (!out.includes(t)) out.push(t);
  const tail = out.includes('settings') ? 'settings' : 'more';
  const head = out.filter((t) => t !== 'settings' && t !== 'more').slice(0, 4);
  return [...head, tail];
}
