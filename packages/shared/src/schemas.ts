import { z } from 'zod';

export const qtyNumber = z.number().finite().positive().max(1_000_000);
export const idStr = z.string().min(1).max(64);
export const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const LoginInput = z.object({
  tenant: z.string().min(1).max(64),
  identifier: z.string().min(1).max(120),
  password: z.string().min(1).max(200),
  deviceFingerprint: z.string().min(8).max(200),
  deviceLabel: z.string().max(120).optional(),
});
export const PinInput = z.object({ deviceId: idStr, pin: z.string().regex(/^\d{4,6}$/) });
export const SetPinInput = z.object({ pin: z.string().regex(/^\d{4,6}$/) });

export const SubmitOrderInput = z.object({
  client_uuid: idStr,
  window_id: idStr,
  branch_id: idStr.optional(),
  /** the cycle the device intended (offline submits must not silently roll to the next day) */
  delivery_date: dateStr.optional(),
  note: z.string().max(500).optional().nullable(),
  lines: z.array(z.object({ product_id: idStr, qty: qtyNumber, note: z.string().max(200).optional().nullable() })).min(1).max(500),
});

export const CancelInput = z.object({ reason: z.string().min(2).max(300) });

export const AssignInput = z.object({
  assigned_to: idStr.nullable().optional(),
  assigned_to_name: z.string().max(80).nullable().optional(),
  expected_ready_at: z.string().max(40).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export const DeliveryInput = z.object({
  client_uuid: idStr,
  order_id: idStr,
  received_by_name: z.string().min(2).max(120),
  lines: z.array(z.object({ order_line_id: idStr, qty_delivered: z.number().finite().min(0).max(1_000_000), note: z.string().max(200).optional().nullable() })).min(1),
  signature_png_base64: z.string().max(70_000).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export const VOUCHER_KINDS = ['opening', 'receipt', 'issue', 'adjustment', 'transfer', 'waste', 'return_in', 'return_out'] as const;
export type VoucherKind = (typeof VOUCHER_KINDS)[number];

export const QuickVoucherInput = z.object({
  client_uuid: idStr,
  kind: z.enum(VOUCHER_KINDS),
  location_id: idStr.optional(),
  to_location_id: idStr.optional().nullable(),
  voucher_date: dateStr.optional(),
  supplier_id: idStr.optional().nullable(),
  external_ref: z.string().max(80).optional().nullable(),
  issued_to_name: z.string().max(120).optional().nullable(),
  purpose: z.enum(['production', 'cleaning', 'other']).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  lines: z.array(z.object({
    raw_material_id: idStr,
    qty: z.number().finite().refine((v) => v !== 0).refine((v) => Math.abs(v) <= 1_000_000),
    unit_cost: z.number().finite().min(0).max(1e12).optional().nullable(),
    note: z.string().max(200).optional().nullable(),
  })).min(1).max(100),
});

export const LocationInput = z.object({
  code: z.string().min(1).max(20),
  name_ar: z.string().min(2).max(80),
  kind: z.enum(['plant', 'branch', 'warehouse']),
  default_plant_id: idStr.nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  is_active: z.boolean().optional(),
});

export const CategoryInput = z.object({
  name_ar: z.string().min(2).max(60),
  parent_id: idStr.nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export const ProductInput = z.object({
  category_id: idStr,
  code: z.string().min(1).max(20),
  name_ar: z.string().min(2).max(80),
  uom_id: idStr,
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export const RawMaterialInput = z.object({
  category_id: idStr.nullable().optional(),
  code: z.string().min(1).max(20),
  name_ar: z.string().min(2).max(80),
  uom_id: idStr,
  safety_stock: z.number().finite().min(0),
  default_unit_cost: z.number().finite().min(0).nullable().optional(),
  is_active: z.boolean().optional(),
});

export const SupplierInput = z.object({ name: z.string().min(2).max(120), phone: z.string().max(40).nullable().optional(), address: z.string().max(200).nullable().optional() });

export const UserInput = z.object({
  full_name: z.string().min(2).max(80),
  email: z.string().email().max(120).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  password: z.string().min(6).max(200).optional(),
  is_active: z.boolean().optional(),
  roles: z.array(z.object({ role: z.enum(['owner', 'admin', 'plant_manager', 'plant_staff', 'branch_user', 'storekeeper', 'viewer']), location_id: idStr.nullable() })).min(1),
});

export const WindowInput = z.object({
  plant_id: idStr,
  name_ar: z.string().min(2).max(60),
  kind: z.enum(['regular', 'urgent']),
  cutoff_time: timeStr.nullable(),
  delivery_offset_days: z.number().int().min(0).max(7),
  is_active: z.boolean().optional(),
});

export const BrandingInput = z.object({
  company_name: z.string().min(2).max(80),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  phone: z.string().max(40).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  footer_text: z.string().max(200).nullable().optional(),
  logo_url: z.string().max(400_000).nullable().optional(),
});

export const SettingsInput = z.object({
  timezone: z.string().min(3).max(60),
  currency_code: z.string().min(3).max(3),
  currency_decimals: z.number().int().min(0).max(4),
  numerals: z.enum(['western', 'eastern']),
  allow_negative_stock: z.boolean(),
});

export type ApiErrorCode = 'VALIDATION' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INVALID_TRANSITION' | 'DUPLICATE' | 'BUSINESS_RULE' | 'WINDOW_CLOSED' | 'RATE_LIMITED' | 'INTERNAL';
export interface ApiError { code: ApiErrorCode; message_ar: string; details?: Record<string, unknown> }
export type ApiResponse<T> = { ok: true; data: T; meta: { requestId: string; serverTime: string } } | { ok: false; error: ApiError; meta: { requestId: string; serverTime: string } };
