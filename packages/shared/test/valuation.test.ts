import { describe, expect, it } from 'vitest';
import { applyInbound, applyOutbound, EMPTY_STOCK, nextState, minor, qtyFromUnits, type StockState } from '../src';

const u = qtyFromUnits;
describe('moving weighted average (carried value)', () => {
  it('mandatory study scenario: opening 100@500 → receipt 50@800 → avg 600 → issue 120 → 30 / 18,000', () => {
    let s: StockState = EMPTY_STOCK;
    const a = applyInbound(s, u(100), minor(500)); s = nextState(a);
    expect([a.qtyAfter, a.rateAfter, a.valueAfter]).toEqual([u(100), 500, 50_000]);
    const b = applyInbound(s, u(50), minor(800)); s = nextState(b);
    expect(b.rateAfter).toBe(600);
    expect(b.valueAfter).toBe(90_000);
    const c = applyOutbound(s, u(120)); s = nextState(c);
    expect(c.unitCost).toBe(600);
    expect(s.qty).toBe(u(30));
    expect(s.value).toBe(18_000);
    expect(c.valueDiff).toBe(-72_000);
  });

  it('S8: fully issuing stock leaves value exactly 0 (no orphan value from rounding)', () => {
    let s: StockState = EMPTY_STOCK;
    s = nextState(applyInbound(s, u(100), minor(500)));
    s = nextState(applyInbound(s, u(50), minor(810)));
    s = nextState(applyOutbound(s, u(149)));
    s = nextState(applyOutbound(s, u(1)));
    expect(s.qty).toBe(0);
    expect(s.value).toBe(0);
  });

  it('issue never changes the average', () => {
    let s = nextState(applyInbound(EMPTY_STOCK, u(10), minor(1234)));
    const before = s.rate;
    s = nextState(applyOutbound(s, u(3)));
    expect(s.rate).toBe(before);
  });

  it('F12 (SAP): receipt into zero stock resets rate to incoming cost', () => {
    let s = nextState(applyInbound(EMPTY_STOCK, u(5), minor(100)));
    s = nextState(applyOutbound(s, u(5)));
    s = nextState(applyInbound(s, u(5), minor(300)));
    expect(s.rate).toBe(300);
    expect(s.value).toBe(1500);
  });

  it('reversal of a receipt restores qty and value exactly', () => {
    let s = nextState(applyInbound(EMPTY_STOCK, u(100), minor(500)));
    const before = s;
    const r = applyInbound(s, u(50), minor(800)); s = nextState(r);
    // reversal = outbound of the same qty at the movement cost: value removed = valueDiff
    const rev = { qtyAfter: s.qty - r.signedQty, valueAfter: s.value - r.valueDiff };
    expect(rev).toEqual({ qtyAfter: before.qty, valueAfter: before.value });
  });

  it('fractional quantities stay exact (0.25 kg @ 3333)', () => {
    const s = nextState(applyInbound(EMPTY_STOCK, 2500 as never, minor(3333)));
    expect(s.value).toBe(833);
  });

  it('1000 random movements: value never drifts and zero qty ⇒ zero value', () => {
    let s: StockState = EMPTY_STOCK;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 1000; i++) {
      if (s.qty <= 0 || rnd() < 0.55) s = nextState(applyInbound(s, u(1 + Math.floor(rnd() * 50)), minor(100 + Math.floor(rnd() * 900))));
      else s = nextState(applyOutbound(s, Math.min(s.qty, u(1 + Math.floor(rnd() * 40))) as never));
      if (s.qty === 0) expect(s.value).toBe(0);
      expect(Number.isSafeInteger(s.value)).toBe(true);
    }
  });
});

describe('reversal at original cost (voucher cancel)', () => {
  it('reversing a receipt restores the prior state exactly', async () => {
    const { applyOutboundAtCost } = await import('../src');
    let s: StockState = nextState(applyInbound(EMPTY_STOCK, u(100), minor(500)));
    s = nextState(applyInbound(s, u(50), minor(800)));
    const r = applyOutboundAtCost(s, u(50), minor(800));
    expect([r.qtyAfter, r.valueAfter, r.rateAfter]).toEqual([u(100), 50_000, 500]);
  });
  it('reversing everything zeroes value (qty 0 ⇔ value 0)', async () => {
    const { applyOutboundAtCost } = await import('../src');
    const s = nextState(applyInbound(EMPTY_STOCK, u(3), minor(333)));
    const r = applyOutboundAtCost(s, u(3), minor(334));
    expect([r.qtyAfter, r.valueAfter]).toEqual([0, 0]);
  });
});
