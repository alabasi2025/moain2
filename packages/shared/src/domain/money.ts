/**
 * Money: integer minor units (J1). Qty: integer scaled by 10^4 (J2).
 * Never use floating point for arithmetic on these — all products/quotients go through BigInt.
 */
export type Minor = number & { readonly __brand: 'Minor' };
export type QtyE4 = number & { readonly __brand: 'QtyE4' };

export const QTY_SCALE = 10_000;
const QTY_SCALE_N = 10_000n;

export const minor = (n: number): Minor => {
  if (!Number.isSafeInteger(n)) throw new RangeError(`minor must be a safe integer: ${n}`);
  return n as Minor;
};
export const qtyE4 = (n: number): QtyE4 => {
  if (!Number.isSafeInteger(n)) throw new RangeError(`qtyE4 must be a safe integer: ${n}`);
  return n as QtyE4;
};

/** Round-half-away-from-zero division of BigInts. */
export function divRound(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new RangeError('division by zero');
  const neg = a < 0n !== b < 0n;
  const aa = a < 0n ? -a : a;
  const bb = b < 0n ? -b : b;
  const q = (aa * 2n + bb) / (bb * 2n);
  return neg ? -q : q;
}

/** Parse a user decimal string ("12.5", "١٢٫٥") into QtyE4, rounded to `decimals`. */
export function parseQty(input: string, decimals: number): QtyE4 | null {
  const normalized = toWesternDigits(input).replace('٫', '.').replace(',', '.').trim();
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const neg = normalized.startsWith('-');
  const [intPart = '0', fracPart = ''] = normalized.replace('-', '').split('.');
  const frac = (fracPart + '0000').slice(0, 4);
  let v = BigInt(intPart) * QTY_SCALE_N + BigInt(frac);
  const step = 10n ** BigInt(4 - Math.max(0, Math.min(4, decimals)));
  v = divRound(v, step) * step;
  return qtyE4(Number(neg ? -v : v));
}

/** Convert a QtyE4 to the REAL stored in D1 (4 fixed decimals). */
export const qtyToDb = (q: QtyE4): number => Number((q / QTY_SCALE).toFixed(4));
/** Convert a REAL from D1 back to QtyE4. */
export const qtyFromDb = (r: number): QtyE4 => qtyE4(Math.round(r * QTY_SCALE));
/** Whole units → QtyE4 (for integer UI steppers). */
export const qtyFromUnits = (units: number): QtyE4 => qtyE4(Math.round(units * QTY_SCALE));

/** value = qty × unitCost  (minor), rounded. */
export function lineValue(q: QtyE4, unitCost: Minor): Minor {
  return minor(Number(divRound(BigInt(q) * BigInt(unitCost), QTY_SCALE_N)));
}

export function toWesternDigits(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
