/** Arabic plural forms: zero | one | two | few (3–10) | many (11–99) | other (100+ / 0 mod 100) */
export interface PluralForms { zero: string; one: string; two: string; few: string; many: string; other: string }
export function pluralAr(n: number, f: PluralForms): string {
  const abs = Math.abs(Math.trunc(n));
  const m100 = abs % 100;
  if (abs === 0) return f.zero;
  if (abs === 1) return f.one;
  if (abs === 2) return f.two;
  if (m100 >= 3 && m100 <= 10) return f.few;
  if (m100 >= 11 && m100 <= 99) return f.many;
  return f.other;
}
