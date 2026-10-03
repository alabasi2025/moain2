import { create } from 'zustand';
import type { Me } from './types';
import { configureFormat } from './format';
import { applyBrand } from './theme';

const FP_KEY = 'moain.fp';
const DEV_KEY = 'moain.device';
const TENANT_KEY = 'moain.tenant';
const ACTIVE_LOC = 'moain.activeLoc';

export function deviceFingerprint(): string {
  let fp = localStorage.getItem(FP_KEY);
  if (!fp) { fp = crypto.randomUUID(); localStorage.setItem(FP_KEY, fp); }
  return fp;
}
export const savedDevice = () => localStorage.getItem(DEV_KEY);
export const savedTenant = () => localStorage.getItem(TENANT_KEY) ?? 'alnoor';

interface SessionState {
  me: Me | null;
  locked: boolean;
  activeLocationId: string | null;
  setMe: (m: Me | null) => void;
  lock: () => void;
  unlock: () => void;
  setActiveLocation: (id: string) => void;
}
export const useSession = create<SessionState>((set) => ({
  me: null,
  locked: false,
  activeLocationId: localStorage.getItem(ACTIVE_LOC),
  setMe: (me) => {
    if (me) {
      localStorage.setItem(DEV_KEY, me.deviceId);
      localStorage.setItem(TENANT_KEY, me.tenant.slug);
      configureFormat(me.settings);
      applyBrand(me.branding.primary_color);
      const cur = localStorage.getItem(ACTIVE_LOC);
      if (!cur || !me.myLocationIds.includes(cur)) {
        const first = me.myLocationIds[0] ?? null;
        if (first) localStorage.setItem(ACTIVE_LOC, first);
        set({ activeLocationId: first });
      }
    }
    set({ me, locked: false });
  },
  lock: () => set({ locked: true }),
  unlock: () => set({ locked: false }),
  setActiveLocation: (id) => { localStorage.setItem(ACTIVE_LOC, id); set({ activeLocationId: id }); },
}));

export function useMe(): Me {
  const me = useSession((s) => s.me);
  if (!me) throw new Error('useMe outside authenticated tree');
  return me;
}
/** The branch this user orders for (branch_user grants first, else first branch for admins). */
export function useMyBranch() {
  const me = useMe();
  const active = useSession((s) => s.activeLocationId);
  const branchGrants = me.grants.filter((g) => g.role === 'branch_user' && g.location_id).map((g) => g.location_id as string);
  const isAdmin = me.roles.includes('owner') || me.roles.includes('admin');
  const candidates = branchGrants.length ? me.locations.filter((l) => branchGrants.includes(l.id)) : isAdmin ? me.locations.filter((l) => l.kind === 'branch') : [];
  const current = candidates.find((l) => l.id === active) ?? candidates[0] ?? null;
  return { branch: current, branches: candidates };
}
export const hasRole = (me: Me, ...r: string[]) => me.roles.some((x) => r.includes(x));
