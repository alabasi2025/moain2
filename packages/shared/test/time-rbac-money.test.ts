import { describe, expect, it } from 'vitest';
import { windowCycle, isCycleClosed, zonedInstant, parseQty, pluralAr, can, navFor, scopeFor, stripCosts, divRound } from '../src';

const TZ = 'Asia/Aden'; // UTC+3
const daily = { kind: 'regular' as const, cutoff_time: '22:00', delivery_offset_days: 1 };

describe('window cycle (G1)', () => {
  it('before cutoff → delivers tomorrow, closes tonight 22:00 local', () => {
    const c = windowCycle(daily, new Date('2026-10-03T15:00:00Z'), TZ); // 18:00 local
    expect(c.deliveryDate).toBe('2026-10-04');
    expect(c.closesAt).toBe('2026-10-03T19:00:00.000Z');
    expect(c.closesInMinutes).toBe(240);
  });
  it('after cutoff → next cycle (delivers the day after tomorrow)', () => {
    const c = windowCycle(daily, new Date('2026-10-03T20:00:00Z'), TZ); // 23:00 local
    expect(c.deliveryDate).toBe('2026-10-05');
  });
  it('local midnight boundary uses tenant tz not UTC', () => {
    const c = windowCycle(daily, new Date('2026-10-03T21:30:00Z'), TZ); // 00:30 local on 10-04
    expect(c.orderDate).toBe('2026-10-04');
    expect(c.deliveryDate).toBe('2026-10-05');
  });
  it('urgent never closes and delivers same day', () => {
    const c = windowCycle({ kind: 'urgent', cutoff_time: null, delivery_offset_days: 0 }, new Date('2026-10-03T20:00:00Z'), TZ);
    expect(c.closesAt).toBeNull();
    expect(c.deliveryDate).toBe('2026-10-03');
  });
  it('isCycleClosed', () => {
    expect(isCycleClosed(daily, '2026-10-04', new Date('2026-10-03T18:59:00Z'), TZ)).toBe(false);
    expect(isCycleClosed(daily, '2026-10-04', new Date('2026-10-03T19:00:00Z'), TZ)).toBe(true);
  });
  it('zonedInstant', () => expect(zonedInstant('2026-10-04', '06:00', TZ).toISOString()).toBe('2026-10-04T03:00:00.000Z'));
});

describe('money & qty (no float)', () => {
  it('parses western and eastern digits, rounds to decimals', () => {
    expect(parseQty('12.5', 2)).toBe(125000);
    expect(parseQty('١٢٫٥', 2)).toBe(125000);
    expect(parseQty('1.23456', 2)).toBe(12300);
    expect(parseQty('abc', 2)).toBeNull();
  });
  it('divRound half away from zero', () => {
    expect(divRound(5n, 2n)).toBe(3n);
    expect(divRound(-5n, 2n)).toBe(-3n);
  });
});

describe('arabic plural', () => {
  const f = { zero: 'لا أصناف', one: 'صنف واحد', two: 'صنفان', few: 'أصناف', many: 'صنفاً', other: 'صنف' };
  it.each([[0, 'لا أصناف'], [1, 'صنف واحد'], [2, 'صنفان'], [3, 'أصناف'], [10, 'أصناف'], [11, 'صنفاً'], [99, 'صنفاً'], [100, 'صنف'], [103, 'أصناف']])('%i', (n, w) => expect(pluralAr(n, f)).toBe(w));
});

describe('rbac', () => {
  const branch = [{ role: 'branch_user' as const, location_id: 'b1' }];
  it('branch user submits only for own branch', () => {
    expect(can(branch, 'orders:submit', 'b1')).toBe(true);
    expect(can(branch, 'orders:submit', 'b2')).toBe(false);
    expect(can(branch, 'vouchers:post')).toBe(false);
    expect(scopeFor(branch, 'orders:read')).toEqual(['b1']);
  });
  it('viewer cannot read audit nor costs (D2)', () => {
    const v = [{ role: 'viewer' as const, location_id: null }];
    expect(can(v, 'audit:read')).toBe(false);
    expect(can(v, 'costs:view')).toBe(false);
  });
  it('cost fields stripped (H3)', () => {
    expect(stripCosts({ name: 'x', unit_cost_minor: 5, nested: [{ stock_value_minor: 1, qty: 2 }] }, false)).toEqual({ name: 'x', nested: [{ qty: 2 }] });
  });
  it('nav per role', () => {
    expect(navFor(['branch_user'])).toEqual(['home', 'order', 'receive', 'history', 'more']);
    expect(navFor(['owner'])).toEqual(['home', 'production', 'stock', 'reports', 'settings']);
    expect(navFor(['plant_manager', 'storekeeper']).length).toBeLessThanOrEqual(5);
  });
});
