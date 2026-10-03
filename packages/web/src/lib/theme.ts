/** Tenant colour → --brand-h/--brand-s; every brand shade derives from those (04-branding §2). */
export function hexToHsl(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return [26, 40, 39];
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x as string, 16) / 255) as [number, number, number];
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
export function applyBrand(hex: string) {
  const [h, s] = hexToHsl(hex);
  const root = document.documentElement.style;
  root.setProperty('--brand-h', String(h));
  root.setProperty('--brand-s', `${Math.min(Math.max(s, 25), 70)}%`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', hex);
}
export type ThemeMode = 'light' | 'dark' | 'system';
export function getTheme(): ThemeMode { return (localStorage.getItem('moain.theme') as ThemeMode | null) ?? 'system'; }
export function setTheme(m: ThemeMode) {
  if (m === 'system') localStorage.removeItem('moain.theme'); else localStorage.setItem('moain.theme', m);
  const dark = m === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches : m === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
