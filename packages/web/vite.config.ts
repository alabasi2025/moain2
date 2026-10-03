import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // served per-tenant by the worker: /m/:slug/manifest.webmanifest
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'], globIgnores: ['**/exceljs*'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/m\//],
        runtimeCaching: [{ urlPattern: /\/api\/v1\/catalog$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'catalog' } }],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:8787', '/m': 'http://localhost:8787' } },
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
});
