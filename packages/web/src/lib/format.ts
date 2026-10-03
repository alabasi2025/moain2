/** Locale formatting — Intl in tenant timezone; western/eastern numerals per tenant setting (00-design-system §7). */
let tz = 'Asia/Aden';
let nu: 'latn' | 'arab' = 'latn';
let currencyDecimals = 0;
let currencyLabel = 'ر.ي';
export function configureFormat(o: { timezone: string; numerals: 'western' | 'eastern'; currency_decimals: number; currency_code: string }) {
  tz = o.timezone; nu = o.numerals === 'eastern' ? 'arab' : 'latn'; currencyDecimals = o.currency_decimals;
  currencyLabel = o.currency_code === 'YER' ? 'ر.ي' : o.currency_code === 'SAR' ? 'ر.س' : o.currency_code;
}
const loc = () => `ar-YE-u-nu-${nu}`;
export const tzName = () => tz;

export function fmtNum(n: number | null | undefined, maxFrac = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(loc(), { maximumFractionDigits: maxFrac }).format(n);
}
export const fmtQty = (n: number | null | undefined) => fmtNum(n, 2);
export function fmtMoney(minorUnits: number | null | undefined, withLabel = false): string {
  if (minorUnits === null || minorUnits === undefined) return '—';
  const v = minorUnits / 10 ** currencyDecimals;
  const s = new Intl.NumberFormat(loc(), { minimumFractionDigits: currencyDecimals, maximumFractionDigits: currencyDecimals }).format(v);
  return withLabel ? `${s} ${currencyLabel}` : s;
}
export const currency = () => currencyLabel;
export const moneyToMinor = (v: number) => Math.round(v * 10 ** currencyDecimals);
export const minorToMoney = (m: number) => m / 10 ** currencyDecimals;

const dateOnly = (d: string) => new Date(d + 'T12:00:00Z'); // a calendar date, render in UTC to avoid shifting
export function fmtDay(date: string, style: 'long' | 'short' | 'weekday' = 'short'): string {
  const o: Intl.DateTimeFormatOptions = style === 'long' ? { weekday: 'long', day: 'numeric', month: 'long' } : style === 'weekday' ? { weekday: 'long' } : { weekday: 'short', day: 'numeric', month: 'numeric' };
  return new Intl.DateTimeFormat(loc(), { ...o, timeZone: 'UTC' }).format(dateOnly(date));
}
export function fmtDateFull(date: string): string {
  return new Intl.DateTimeFormat(loc(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(dateOnly(date));
}
export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(loc(), { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date(iso));
}
export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date(iso));
}
export function localToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
export function addDaysStr(d: string, n: number): string {
  const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10);
}
/** Relative day label: اليوم / غداً / أمس / weekday */
export function dayLabel(date: string): string {
  const today = localToday();
  if (date === today) return 'اليوم';
  if (date === addDaysStr(today, 1)) return 'غداً';
  if (date === addDaysStr(today, -1)) return 'أمس';
  return fmtDay(date, 'weekday');
}
export function fmtRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return 'الآن';
  if (diff < 60) return `قبل ${fmtNum(Math.round(diff))} د`;
  if (diff < 60 * 24 && new Date(iso).toDateString() === new Date().toDateString()) return fmtTime(iso);
  return fmtDateTime(iso);
}
export function fmtDuration(minutes: number): string {
  if (minutes <= 0) return 'الآن';
  const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
  if (h === 0) return `${fmtNum(m)} د`;
  if (h >= 24) return `${fmtNum(Math.floor(h / 24))} يوم و${fmtNum(h % 24)} س`;
  return m ? `${fmtNum(h)} س ${fmtNum(m)} د` : `${fmtNum(h)} س`;
}
/** Local datetime-local input value <-> ISO in tenant timezone */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return '';
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '00';
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}`;
}
export function localInputToIso(v: string): string | null {
  if (!v) return null;
  const [d, t] = v.split('T');
  if (!d || !t) return null;
  // find offset of tz at that instant
  const guess = new Date(`${d}T${t}:00Z`);
  const asLocal = new Date(isoToLocalInput(guess.toISOString()) + ':00Z');
  return new Date(guess.getTime() - (asLocal.getTime() - guess.getTime())).toISOString();
}
export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w.replace(/^(ال|م\.)/, '')[0] ?? '').join('');
