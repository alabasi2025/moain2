import { Hono } from 'hono';
import type { AppEnv } from '../env';

/** Per-tenant dynamic manifest (04-branding §3): name, colours, shortcuts. */
export const manifest = new Hono<AppEnv>();
manifest.get('/:slug/manifest.webmanifest', async (c) => {
  const slug = c.req.param('slug');
  const b = await c.env.DB.prepare(`SELECT b.company_name, b.primary_color FROM tenants t JOIN tenant_branding b ON b.tenant_id = t.id WHERE t.slug = ?`).bind(slug).first<{ company_name: string; primary_color: string }>();
  const name = b?.company_name ?? 'مُعين';
  const body = {
    name, short_name: name.length <= 12 ? name : 'مُعين', description: 'إدارة الطلبيات والإنتاج والمخزون',
    lang: 'ar', dir: 'rtl', start_url: `/?tenant=${encodeURIComponent(slug)}`, scope: '/', id: `/?tenant=${encodeURIComponent(slug)}`,
    display: 'standalone', display_override: ['standalone'], orientation: 'any',
    background_color: '#FAF7F2', theme_color: '#FAF7F2',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'طلبية اليوم', url: '/order', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'حركة مخزنية', url: '/movement', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
  c.header('Content-Type', 'application/manifest+json; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=300');
  return c.body(JSON.stringify(body));
});
