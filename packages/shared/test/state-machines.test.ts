import { describe, expect, it } from 'vitest';
import { OrderMachine, ORDER_STATUSES, ORDER_EVENTS, ProductionMachine, PO_STATUSES, PO_EVENTS, VoucherMachine, CountMachine, ExceptionMachine } from '../src';

const ORDER_ALLOWED: Record<string, string> = {
  'draft:submit': 'submitted', 'draft:cancel': 'cancelled',
  'submitted:submit': 'submitted', 'submitted:lock': 'locked', 'submitted:cancel': 'cancelled',
  'locked:approve_exception': 'locked', 'locked:start': 'in_production', 'locked:cancel': 'cancelled',
  'in_production:mark_ready': 'ready', 'in_production:deliver_partial': 'partially_delivered', 'in_production:deliver_full': 'delivered', 'in_production:cancel': 'cancelled',
  'ready:deliver_partial': 'partially_delivered', 'ready:deliver_full': 'delivered',
  'partially_delivered:deliver_partial': 'partially_delivered', 'partially_delivered:deliver_full': 'delivered',
  'cancelled:reopen': 'submitted',
};

describe('Order state machine — every cell', () => {
  for (const s of ORDER_STATUSES) for (const e of ORDER_EVENTS) {
    const key = `${s}:${e}`;
    it(`${key} → ${ORDER_ALLOWED[key] ?? 'REJECTED'}`, () => {
      const r = OrderMachine.transition(s, e);
      if (ORDER_ALLOWED[key]) expect(r).toEqual({ ok: true, value: ORDER_ALLOWED[key] });
      else expect(r.ok).toBe(false);
    });
  }
  it('never: draft → locked, delivered → anything', () => {
    expect(OrderMachine.can('draft', 'lock')).toBe(false);
    for (const e of ORDER_EVENTS) expect(OrderMachine.can('delivered', e)).toBe(false);
  });
});

const PO_ALLOWED: Record<string, string> = {
  'open:add_order': 'open', 'open:lock': 'locked', 'open:cancel': 'cancelled',
  'locked:apply_exception': 'locked', 'locked:start': 'in_progress', 'locked:cancel': 'cancelled',
  'in_progress:complete': 'completed', 'completed:deliver': 'delivered', 'completed:reopen': 'in_progress',
};
describe('ProductionOrder state machine — every cell', () => {
  for (const s of PO_STATUSES) for (const e of PO_EVENTS) {
    const key = `${s}:${e}`;
    it(`${key} → ${PO_ALLOWED[key] ?? 'REJECTED'}`, () => {
      const r = ProductionMachine.transition(s, e);
      expect(r.ok ? r.value : null).toBe(PO_ALLOWED[key] ?? null);
    });
  }
});

describe('Voucher / Count / Exception', () => {
  it('voucher: posted is frozen except cancel; cancelled terminal', () => {
    expect(VoucherMachine.can('posted', 'edit')).toBe(false);
    expect(VoucherMachine.can('posted', 'post')).toBe(false);
    expect(VoucherMachine.can('posted', 'cancel')).toBe(true);
    expect(VoucherMachine.can('cancelled', 'cancel')).toBe(false);
    expect(VoucherMachine.can('draft', 'cancel')).toBe(false);
  });
  it('count: committed is terminal', () => {
    for (const e of ['count', 'finish', 'reopen', 'commit', 'cancel'] as const) expect(CountMachine.can('committed', e)).toBe(false);
    expect(CountMachine.can('review', 'reopen')).toBe(true);
  });
  it('exception: only pending decides', () => {
    expect(ExceptionMachine.can('pending', 'approve')).toBe(true);
    expect(ExceptionMachine.can('approved', 'reject')).toBe(false);
  });
});
