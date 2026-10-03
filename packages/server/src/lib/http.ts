import type { ApiErrorCode } from '@moain/shared';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ZodSchema } from 'zod';

export class Fail extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: ApiErrorCode,
    readonly messageAr: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(code);
  }
}

export const notFound = (what = 'العنصر'): Fail => new Fail(404, 'NOT_FOUND', `${what} غير موجود`);
export const forbidden = (): Fail => new Fail(403, 'FORBIDDEN', 'ليست لديك صلاحية لهذا الإجراء');
export const businessRule = (rule: string, messageAr: string, details: Record<string, unknown> = {}): Fail =>
  new Fail(422, 'BUSINESS_RULE', messageAr, { rule, ...details });
export const invalidTransition = (from: string, event: string): Fail =>
  new Fail(409, 'INVALID_TRANSITION', 'لا يمكن تنفيذ هذا الإجراء في الحالة الحالية', { from, event });

export function okJson<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json({ ok: true, data, meta: { requestId: c.get('requestId') as string, serverTime: new Date().toISOString() } }, status);
}

export async function parseBody<T>(c: Context, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new Fail(400, 'VALIDATION', 'صيغة الطلب غير صالحة');
  }
  const r = schema.safeParse(raw);
  if (!r.success) {
    throw new Fail(400, 'VALIDATION', 'بعض الحقول غير صحيحة', { issues: r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) });
  }
  return r.data;
}
