import { err, ok, type Result } from './result';

export interface InvalidTransition {
  readonly code: 'INVALID_TRANSITION';
  readonly machine: string;
  readonly from: string;
  readonly event: string;
}

function machine<S extends string, E extends string>(name: string, table: Record<S, Partial<Record<E, S>>>) {
  return {
    table,
    can(from: S, event: E): boolean {
      return table[from][event] !== undefined;
    },
    transition(from: S, event: E): Result<S, InvalidTransition> {
      const next = table[from][event];
      return next !== undefined ? ok(next) : err({ code: 'INVALID_TRANSITION', machine: name, from, event });
    },
  };
}

/* ─── Order ─── (03-state-machines §1, with D1 clarification + ADR-0011 `reopen`) */
export const ORDER_STATUSES = ['draft', 'submitted', 'locked', 'in_production', 'ready', 'partially_delivered', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const ORDER_EVENTS = ['submit', 'lock', 'approve_exception', 'start', 'mark_ready', 'deliver_partial', 'deliver_full', 'cancel', 'reopen'] as const;
export type OrderEvent = (typeof ORDER_EVENTS)[number];

export const OrderMachine = machine<OrderStatus, OrderEvent>('order', {
  draft: { submit: 'submitted', cancel: 'cancelled' },
  submitted: { submit: 'submitted', lock: 'locked', cancel: 'cancelled' },
  locked: { approve_exception: 'locked', start: 'in_production', cancel: 'cancelled' },
  in_production: { mark_ready: 'ready', deliver_partial: 'partially_delivered', deliver_full: 'delivered', cancel: 'cancelled' },
  ready: { deliver_partial: 'partially_delivered', deliver_full: 'delivered' },
  partially_delivered: { deliver_partial: 'partially_delivered', deliver_full: 'delivered' },
  delivered: {},
  cancelled: { reopen: 'submitted' },
});

/* ─── Production order ─── (§2) */
export const PO_STATUSES = ['open', 'locked', 'in_progress', 'completed', 'delivered', 'cancelled'] as const;
export type ProductionStatus = (typeof PO_STATUSES)[number];
export const PO_EVENTS = ['add_order', 'lock', 'apply_exception', 'start', 'complete', 'reopen', 'deliver', 'cancel'] as const;
export type ProductionEvent = (typeof PO_EVENTS)[number];

export const ProductionMachine = machine<ProductionStatus, ProductionEvent>('production_order', {
  open: { add_order: 'open', lock: 'locked', cancel: 'cancelled' },
  locked: { apply_exception: 'locked', start: 'in_progress', cancel: 'cancelled' },
  in_progress: { complete: 'completed' },
  completed: { deliver: 'delivered', reopen: 'in_progress' },
  delivered: {},
  cancelled: {},
});

/* ─── Voucher ─── (§3) */
export const VOUCHER_STATUSES = ['draft', 'posted', 'cancelled'] as const;
export type VoucherStatus = (typeof VOUCHER_STATUSES)[number];
export type VoucherEvent = 'edit' | 'post' | 'cancel';
export const VoucherMachine = machine<VoucherStatus, VoucherEvent>('voucher', {
  draft: { edit: 'draft', post: 'posted' },
  posted: { cancel: 'cancelled' },
  cancelled: {},
});

/* ─── Count session ─── (§4) */
export const COUNT_STATUSES = ['open', 'review', 'committed', 'cancelled'] as const;
export type CountStatus = (typeof COUNT_STATUSES)[number];
export type CountEvent = 'count' | 'finish' | 'reopen' | 'commit' | 'cancel';
export const CountMachine = machine<CountStatus, CountEvent>('count_session', {
  open: { count: 'open', finish: 'review', cancel: 'cancelled' },
  review: { reopen: 'open', commit: 'committed', cancel: 'cancelled' },
  committed: {},
  cancelled: {},
});

/* ─── Order exception ─── (§5) */
export type ExceptionStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type ExceptionEvent = 'approve' | 'reject' | 'expire';
export const ExceptionMachine = machine<ExceptionStatus, ExceptionEvent>('order_exception', {
  pending: { approve: 'approved', reject: 'rejected', expire: 'expired' },
  approved: {},
  rejected: {},
  expired: {},
});
