import { divRound, minor, qtyE4, QTY_SCALE, type Minor, type QtyE4 } from './money';

/**
 * Moving weighted average with CARRIED VALUE as source of truth (ADR-0011 §7).
 * - The stock value is carried exactly; the rate is derived (value / qty).
 * - Issues take value proportionally; issuing the whole balance takes the whole value,
 *   so qty = 0  ⇔  value = 0 (no orphan value from rounding — finding S8).
 * - Receipts into zero/negative stock reset the rate to the incoming cost (SAP rule, F12).
 */
export interface StockState {
  readonly qty: QtyE4;
  readonly value: Minor;
  /** last known rate (minor per 1 unit) — used when qty <= 0 */
  readonly rate: Minor;
}

export interface MovementResult {
  readonly signedQty: QtyE4;
  readonly unitCost: Minor;
  readonly qtyAfter: QtyE4;
  readonly rateAfter: Minor;
  readonly valueAfter: Minor;
  readonly valueDiff: Minor;
}

export const EMPTY_STOCK: StockState = { qty: qtyE4(0), value: minor(0), rate: minor(0) };

const S = BigInt(QTY_SCALE);

function rateOf(qty: QtyE4, value: Minor, fallback: Minor): Minor {
  if (qty <= 0) return fallback;
  return minor(Number(divRound(BigInt(value) * S, BigInt(qty))));
}

/** Inbound movement (opening / receipt / return_in / transfer-in / positive adjustment at cost). */
export function applyInbound(state: StockState, q: QtyE4, unitCost: Minor): MovementResult {
  if (q <= 0) throw new RangeError('inbound qty must be positive');
  const qtyAfter = qtyE4(state.qty + q);
  const inValue = divRound(BigInt(q) * BigInt(unitCost), S);
  let valueAfter: Minor;
  if (state.qty <= 0) {
    valueAfter = minor(Number(divRound(BigInt(qtyAfter) * BigInt(unitCost), S)));
  } else {
    valueAfter = minor(state.value + Number(inValue));
  }
  const rateAfter = state.qty <= 0 ? unitCost : rateOf(qtyAfter, valueAfter, unitCost);
  return { signedQty: q, unitCost, qtyAfter, rateAfter, valueAfter, valueDiff: minor(valueAfter - state.value) };
}

/** Outbound movement (issue / waste / return_out / transfer-out / negative adjustment). Valued at current average. */
export function applyOutbound(state: StockState, q: QtyE4): MovementResult {
  if (q <= 0) throw new RangeError('outbound qty must be positive');
  const qtyAfter = qtyE4(state.qty - q);
  const currentRate = rateOf(state.qty, state.value, state.rate);
  let outValue: bigint;
  if (state.qty > 0 && q >= state.qty) {
    // Whole balance leaves: take the entire carried value, then any excess at the current rate.
    const excess = BigInt(q - state.qty);
    outValue = BigInt(state.value) + divRound(excess * BigInt(currentRate), S);
  } else if (state.qty > 0) {
    outValue = divRound(BigInt(q) * BigInt(state.value), BigInt(state.qty));
  } else {
    outValue = divRound(BigInt(q) * BigInt(currentRate), S);
  }
  const valueAfter = minor(state.value - Number(outValue));
  const rateAfter = qtyAfter > 0 ? rateOf(qtyAfter, valueAfter, currentRate) : currentRate;
  return {
    signedQty: qtyE4(-q),
    unitCost: currentRate,
    qtyAfter,
    rateAfter,
    valueAfter,
    valueDiff: minor(valueAfter - state.value),
  };
}

export const nextState = (r: MovementResult): StockState => ({ qty: r.qtyAfter, value: r.valueAfter, rate: r.rateAfter });

/**
 * Outbound at an explicit cost — used to reverse an inbound movement (F15).
 * Removing the whole balance removes the whole value (keeps qty 0 ⇔ value 0).
 */
export function applyOutboundAtCost(state: StockState, q: QtyE4, unitCost: Minor): MovementResult {
  if (q <= 0) throw new RangeError('outbound qty must be positive');
  const qtyAfter = qtyE4(state.qty - q);
  const outValue = qtyAfter === 0 ? BigInt(state.value) : divRound(BigInt(q) * BigInt(unitCost), S);
  const valueAfter = minor(state.value - Number(outValue));
  const rateAfter = qtyAfter > 0 ? rateOf(qtyAfter, valueAfter, state.rate) : state.rate;
  return { signedQty: qtyE4(-q), unitCost, qtyAfter, rateAfter, valueAfter, valueDiff: minor(valueAfter - state.value) };
}
