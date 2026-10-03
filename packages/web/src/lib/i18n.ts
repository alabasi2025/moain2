import ar from '../locales/ar.json';

type Dict = typeof ar;
/** t('orderStatus.ready') — every UI string lives in locales/ar.json (00-design-system §7). */
export function t(key: string, fallback?: string): string {
  const v = key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), ar);
  return typeof v === 'string' ? v : fallback ?? key;
}
export const dict: Dict = ar;

/** Arabic counted nouns (صنف واحد / صنفان / 3 أصناف / 11 صنفاً). */
import { pluralAr } from '@moain/shared';
import { fmtNum } from './format';
const NOUNS = {
  item: { one: 'صنف واحد', two: 'صنفان', few: 'أصناف', many: 'صنفاً', other: 'صنف' },
  unit: { one: 'وحدة واحدة', two: 'وحدتان', few: 'وحدات', many: 'وحدة', other: 'وحدة' },
  branch: { one: 'فرع واحد', two: 'فرعان', few: 'فروع', many: 'فرعاً', other: 'فرع' },
  order: { one: 'طلبية واحدة', two: 'طلبيتان', few: 'طلبيات', many: 'طلبية', other: 'طلبية' },
  material: { one: 'مادة واحدة', two: 'مادتان', few: 'مواد', many: 'مادة', other: 'مادة' },
  note: { one: 'ملاحظة واحدة', two: 'ملاحظتان', few: 'ملاحظات', many: 'ملاحظة', other: 'ملاحظة' },
  movement: { one: 'حركة واحدة', two: 'حركتان', few: 'حركات', many: 'حركة', other: 'حركة' },
} as const;
export function count(n: number, noun: keyof typeof NOUNS): string {
  const f = NOUNS[noun];
  const num = fmtNum(n);
  return pluralAr(n, { zero: `لا ${f.other}`, one: f.one, two: f.two, few: `${num} ${f.few}`, many: `${num} ${f.many}`, other: `${num} ${f.other}` });
}
