/** Thin fetch wrapper around the `{ ok, data | error, meta }` envelope (01-api-contract §1). */
export class ApiError extends Error {
  constructor(public status: number, public code: string, public messageAr: string, public details?: Record<string, unknown>) {
    super(messageAr);
  }
  get offline() { return this.status === 0; }
}

type Listener = () => void;
const unauthListeners = new Set<Listener>();
export const onUnauthenticated = (fn: Listener) => { unauthListeners.add(fn); return () => unauthListeners.delete(fn); };

export async function api<T>(method: string, path: string, body?: unknown, init?: RequestInit): Promise<T> {
  let r: Response;
  try {
    r = await fetch('/api/v1' + path, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });
  } catch {
    throw new ApiError(0, 'OFFLINE', 'لا يوجد اتصال بالإنترنت');
  }
  if (r.status === 304) return undefined as T;
  let j: { ok: boolean; data?: T; error?: { code: string; message_ar: string; details?: Record<string, unknown> } };
  try { j = await r.json(); } catch { throw new ApiError(r.status, 'INTERNAL', 'استجابة غير متوقعة من الخادم'); }
  if (!j.ok) {
    const e = j.error ?? { code: 'INTERNAL', message_ar: 'حدث خطأ' };
    if (r.status === 401 && !path.startsWith('/auth/')) unauthListeners.forEach((f) => f());
    throw new ApiError(r.status, e.code, e.message_ar, e.details);
  }
  return j.data as T;
}
export const get = <T>(p: string) => api<T>('GET', p);
export const post = <T>(p: string, b?: unknown) => api<T>('POST', p, b ?? {});
export const put = <T>(p: string, b: unknown) => api<T>('PUT', p, b);
export const patch = <T>(p: string, b: unknown) => api<T>('PATCH', p, b);

export function qs(o: Record<string, string | number | null | undefined>): string {
  const p = Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return p.length ? '?' + p.join('&') : '';
}
