/** Time helpers. Storage is UTC ISO (I1); "today" & cutoffs are in the tenant timezone (I2, I3). */

export const nowIso = (d: Date = new Date()): string => d.toISOString();

/** Local wall-clock parts of an instant in `tz`. */
export function localParts(d: Date, tz: string): { date: string; time: string; weekday: number } {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday ?? 'Sun');
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, weekday: wd };
}

export const localDate = (d: Date, tz: string): string => localParts(d, tz).date;

export function addDays(date: string, days: number): string {
  const [y, m, dd] = date.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, dd + days));
  return t.toISOString().slice(0, 10);
}

/** Offset (minutes) of tz from UTC at instant d. */
function tzOffsetMinutes(d: Date, tz: string): number {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return Math.round((asUtc - d.getTime()) / 60000);
}

/** The UTC instant of local `date`+`time` in `tz`. */
export function zonedInstant(date: string, time: string, tz: string): Date {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const [hh, mm] = time.split(':').map(Number) as [number, number];
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const off = tzOffsetMinutes(guess, tz);
  const first = new Date(guess.getTime() - off * 60000);
  const off2 = tzOffsetMinutes(first, tz);
  return off2 === off ? first : new Date(guess.getTime() - off2 * 60000);
}

/** Local start-of-day of a 'YYYY-MM-DD' as full ISO UTC (used for voucher occurred_at). */
export const startOfLocalDayIso = (date: string, tz: string): string => zonedInstant(date, '00:00', tz).toISOString();

export interface WindowSpec {
  readonly kind: 'regular' | 'urgent';
  readonly cutoff_time: string | null;
  readonly delivery_offset_days: number;
}

export interface WindowCycle {
  /** local date on which ordering for this cycle happens */
  readonly orderDate: string;
  readonly deliveryDate: string;
  /** UTC ISO of the cutoff, null = never closes (urgent) */
  readonly closesAt: string | null;
  readonly closesInMinutes: number | null;
}

/**
 * Active ordering cycle of a window at `now` (finding G1).
 * Before today's cutoff → today's cycle. After it → tomorrow's cycle (the next one still open).
 */
export function windowCycle(w: WindowSpec, now: Date, tz: string): WindowCycle {
  const { date, time } = localParts(now, tz);
  if (w.kind === 'urgent' || !w.cutoff_time) {
    return { orderDate: date, deliveryDate: addDays(date, w.delivery_offset_days), closesAt: null, closesInMinutes: null };
  }
  const orderDate = time < w.cutoff_time ? date : addDays(date, 1);
  const closes = zonedInstant(orderDate, w.cutoff_time, tz);
  return {
    orderDate,
    deliveryDate: addDays(orderDate, w.delivery_offset_days),
    closesAt: closes.toISOString(),
    closesInMinutes: Math.max(0, Math.round((closes.getTime() - now.getTime()) / 60000)),
  };
}

/** Is the cycle for `deliveryDate` already past its cutoff? */
export function isCycleClosed(w: WindowSpec, deliveryDate: string, now: Date, tz: string): boolean {
  if (w.kind === 'urgent' || !w.cutoff_time) return false;
  const orderDate = addDays(deliveryDate, -w.delivery_offset_days);
  return now.getTime() >= zonedInstant(orderDate, w.cutoff_time, tz).getTime();
}
