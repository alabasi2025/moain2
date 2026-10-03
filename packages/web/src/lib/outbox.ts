/**
 * Offline outbox (ADR-0005). Order drafts autosave locally; a submit made offline is queued with its
 * client_uuid and replayed on reconnect — the server is idempotent on client_uuid (C12), so retries are safe.
 * Storage: localStorage (small payloads, synchronous, survives reloads). IndexedDB is a drop-in later.
 */
import { create } from 'zustand';
import { ApiError, post } from './api';

export interface DraftLine { qty: number; note?: string | null }
export interface OrderDraft { windowId: string; branchId: string; deliveryDate: string; lines: Record<string, DraftLine>; note: string; updatedAt: string; baseRevision: number | null }
export interface OutboxItem { id: string; kind: 'order.submit'; path: string; body: unknown; label: string; createdAt: string; attempts: number; lastError?: string }

const DKEY = (b: string, w: string, d: string) => `moain.draft.${b}.${w}.${d}`;
export const drafts = {
  load(b: string, w: string, d: string): OrderDraft | null {
    try { const s = localStorage.getItem(DKEY(b, w, d)); return s ? (JSON.parse(s) as OrderDraft) : null; } catch { return null; }
  },
  save(dr: OrderDraft) { localStorage.setItem(DKEY(dr.branchId, dr.windowId, dr.deliveryDate), JSON.stringify(dr)); },
  clear(b: string, w: string, d: string) { localStorage.removeItem(DKEY(b, w, d)); },
};

const OKEY = 'moain.outbox';
const read = (): OutboxItem[] => { try { return JSON.parse(localStorage.getItem(OKEY) ?? '[]') as OutboxItem[]; } catch { return []; } };
const write = (x: OutboxItem[]) => localStorage.setItem(OKEY, JSON.stringify(x));

interface OutboxState { items: OutboxItem[]; online: boolean; flushing: boolean; refresh: () => void; setOnline: (v: boolean) => void }
export const useOutbox = create<OutboxState>((set) => ({
  items: read(), online: typeof navigator === 'undefined' ? true : navigator.onLine, flushing: false,
  refresh: () => set({ items: read() }),
  setOnline: (online) => set({ online }),
}));

export function enqueue(item: Omit<OutboxItem, 'createdAt' | 'attempts'>) {
  const all = read().filter((x) => x.id !== item.id);
  all.push({ ...item, createdAt: new Date().toISOString(), attempts: 0 });
  write(all);
  useOutbox.getState().refresh();
}

let onFlushed: ((it: OutboxItem, result: unknown) => void) | null = null;
export const setOnFlushed = (fn: typeof onFlushed) => { onFlushed = fn; };

export async function flushOutbox(): Promise<void> {
  const st = useOutbox.getState();
  if (st.flushing || !navigator.onLine) return;
  useOutbox.setState({ flushing: true });
  try {
    for (const it of read()) {
      try {
        const res = await post(it.path, it.body);
        write(read().filter((x) => x.id !== it.id));
        onFlushed?.(it, res);
      } catch (e) {
        if (e instanceof ApiError && e.offline) break;
        // a business rejection (e.g. window closed): keep it visible with the reason, stop retrying automatically
        write(read().map((x) => (x.id === it.id ? { ...x, attempts: x.attempts + 1, lastError: e instanceof ApiError ? e.messageAr : String(e) } : x)));
      }
    }
  } finally {
    useOutbox.setState({ flushing: false, items: read() });
  }
}
export function dropOutbox(id: string) { write(read().filter((x) => x.id !== id)); useOutbox.getState().refresh(); }

export function startOutbox() {
  const on = () => { useOutbox.getState().setOnline(true); void flushOutbox(); };
  const off = () => useOutbox.getState().setOnline(false);
  window.addEventListener('online', on);
  window.addEventListener('offline', off);
  setInterval(() => { if (navigator.onLine && read().some((x) => !x.lastError)) void flushOutbox(); }, 15000);
  void flushOutbox();
}
