import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import type { AppEnv } from './env';
import { requireAuth } from './lib/auth';
import { Fail } from './lib/http';
import { admin } from './modules/admin';
import { auth } from './modules/auth';
import { catalog } from './modules/catalog';
import { fulfillment } from './modules/fulfillment';
import { inventory } from './modules/inventory';
import { notifications } from './modules/notify';
import { ordering } from './modules/ordering';
import { cronLock, production } from './modules/production';
import { reports } from './modules/reports';
import { manifest } from './modules/manifest';
import { seed } from './modules/seed';

const app = new Hono<AppEnv>();

app.use('*', async (c, next) => {
  c.set('requestId', crypto.randomUUID());
  await next();
  // Responses from ASSETS.fetch carry immutable headers — clone before tagging.
  try {
    c.res.headers.set('X-Request-Id', c.get('requestId'));
  } catch {
    c.res = new Response(c.res.body, c.res);
    c.res.headers.set('X-Request-Id', c.get('requestId'));
  }
});
app.use('/api/*', secureHeaders({ crossOriginResourcePolicy: 'same-origin' }));

/** CSRF: SameSite=Lax cookie + Origin check on every state-changing request (03-security §5). */
app.use('/api/*', async (c, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
    const origin = c.req.header('origin');
    const host = c.req.header('x-forwarded-host') ?? c.req.header('host');
    if (origin && host && new URL(origin).host !== host) throw new Fail(403, 'FORBIDDEN', 'مصدر الطلب غير موثوق');
    const len = Number(c.req.header('content-length') ?? 0);
    if (len > 512 * 1024) throw new Fail(413, 'VALIDATION', 'حجم الطلب كبير');
  }
  c.header('Cache-Control', 'no-store');
  await next();
});

app.onError((e, c) => {
  const meta = { requestId: c.get('requestId') ?? '', serverTime: new Date().toISOString() };
  if (e instanceof Fail) return c.json({ ok: false, error: { code: e.code, message_ar: e.messageAr, details: e.details }, meta }, e.status);
  const msg = String(e);
  if (msg.includes('append-only') || msg.includes('immutable') || msg.includes('REGRESSION')) {
    return c.json({ ok: false, error: { code: 'CONFLICT', message_ar: 'هذا السجل مجمّد ولا يمكن تعديله', details: { db: msg.slice(0, 120) } }, meta }, 409);
  }
  console.error('[api]', meta.requestId, msg);
  return c.json({ ok: false, error: { code: 'INTERNAL', message_ar: 'حدث خطأ غير متوقع — حاول مجدداً', details: {} }, meta }, 500);
});

const api = new Hono<AppEnv>();
api.get('/health', (c) => c.json({ ok: true }));
api.route('/auth', auth);
api.route('/dev', seed);
api.use('*', async (c, next) => (c.req.path.startsWith('/api/v1/auth/') || c.req.path.startsWith('/api/v1/dev/') || c.req.path === '/api/v1/health' ? next() : requireAuth(c, next)));
for (const r of [catalog, ordering, production, fulfillment, inventory, admin, reports, notifications]) api.route('/', r);
api.notFound((c) => c.json({ ok: false, error: { code: 'NOT_FOUND', message_ar: 'المسار غير موجود' }, meta: { requestId: c.get('requestId'), serverTime: new Date().toISOString() } }, 404));

app.route('/api/v1', api);
app.route('/m', manifest);
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default {
  fetch: app.fetch,
  async scheduled(_e: ScheduledController, env: AppEnv['Bindings'], ctx: ExecutionContext) {
    ctx.waitUntil(cronLock(env));
  },
};
