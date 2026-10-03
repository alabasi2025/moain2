import type { NavTab, Role, RoleGrant } from '@moain/shared';

export interface Branding { company_name: string; logo_url: string | null; primary_color: string; accent_color?: string; footer_text?: string | null; phone?: string | null; address?: string | null; tax_number?: string | null }
export interface Location { id: string; code: string; name_ar: string; kind: 'plant' | 'branch' | 'warehouse'; default_plant_id: string | null }
export interface Me {
  user: { id: string; full_name: string; email: string | null; phone: string | null; has_pin: boolean };
  tenant: { slug: string; name: string };
  branding: Branding;
  settings: { timezone: string; currency_code: string; currency_decimals: number; numerals: 'western' | 'eastern'; allow_negative_stock: number; qty_decimals: number; exception_ttl_minutes: number };
  grants: RoleGrant[]; roles: Role[]; nav: NavTab[]; canViewCosts: boolean;
  locations: Location[]; myLocationIds: string[]; deviceId: string;
}
export interface Cycle { orderDate: string; deliveryDate: string; closesAt: string | null; closesInMinutes: number | null }
export interface OrderWindow { id: string; plant_id: string; name_ar: string; kind: 'regular' | 'urgent'; cutoff_time: string | null; delivery_offset_days: number; is_active: number; cycle: Cycle; plant_name?: string }
export interface Category { id: string; parent_id: string | null; name_ar: string; color: string | null; sort_order: number; is_active: number }
export interface Product { id: string; category_id: string; code: string; name_ar: string; uom_id: string; sort_order: number; is_active: number; uom_name: string; uom_decimals: number }
export interface Uom { id: string; code: string; name_ar: string; decimals: number }
export interface Catalog { categories: Category[]; products: Product[]; uoms: Uom[]; availability: { product_id: string; location_id: string }[] }

export type OrderStatus = 'draft' | 'submitted' | 'locked' | 'in_production' | 'ready' | 'partially_delivered' | 'delivered' | 'cancelled';
export interface OrderSummary { id: string; branch_id: string; branch_name: string; delivery_date: string; status: OrderStatus; revision: number; submitted_at: string | null; window_id: string; window_name: string; window_kind: string; line_count: number; total_qty: number; total_delivered: number; po_number?: string }
export interface OrderLine { id: string; product_id: string; qty: number; note: string | null; product_name: string; product_code: string; uom_name: string; category_name: string; category_id: string; qty_delivered: number }
export interface OrderDetail {
  id: string; branch_id: string; plant_id: string; window_id: string; delivery_date: string; status: OrderStatus; note: string | null; submitted_at: string | null; revision: number; cancel_reason: string | null; created_at: string; updated_at: string;
  lines: OrderLine[]; revisions: { revision: number; reason: string | null; changed_at: string; changed_by_name: string | null }[];
  production_order: { id: string; number: string; status: string; expected_ready_at: string | null; assigned_to_name: string | null; assigned_to_user: string | null } | null;
  branch: { id: string; code: string; name_ar: string };
  deliveries: { id: string; number: string; received_by_name: string; delivered_at: string; delivered_by_name: string; signed: number }[];
  exceptions: { id: string; reason: string; status: string; requested_at: string; decided_at: string | null; decision_note: string | null; edit_until: string | null; consumed_at: string | null }[];
  window: OrderWindow;
}

export type PoStatus = 'open' | 'locked' | 'in_progress' | 'completed' | 'cancelled';
export interface PoSummary { id: string; number: string; status: PoStatus; delivery_date: string; expected_ready_at: string | null; assigned_to_name: string | null; window_name: string; window_kind: string; plant_name: string; order_count: number; total_units: number }
export interface MatrixProduct { id: string; code: string; name: string; uom: string; total: number; by_branch: Record<string, number>; notes: { branch_id: string; branch: string; note: string }[] }
export interface MatrixCategory { id: string; name: string; color: string | null; products: MatrixProduct[]; total: number; by_branch: Record<string, number> }
export interface Matrix { branches: { id: string; code: string; name: string; sort: number }[]; categories: MatrixCategory[]; order_notes: { branch_id: string; branch: string; note: string }[]; totals: { products: number; units: number; orders: number; notes: number } }
export interface PoDetail extends Matrix {
  header: { id: string; number: string; status: PoStatus; delivery_date: string; expected_ready_at: string | null; assigned_to: string | null; assigned_to_name: string | null; assigned_to_user: string | null; locked_at: string | null; started_at: string | null; completed_at: string | null; note: string | null; window: OrderWindow; plant: { id: string; name_ar: string; phone: string | null; address: string | null }; cycle_closed: boolean; closes_at: string | null };
  snapshot_version: number | null; snapshot_at: string | null;
  orders: { id: string; branch_id: string; status: OrderStatus; revision: number; submitted_at: string | null; branch_name: string; line_count: number; total_qty: number; total_delivered: number }[];
  missing_branches: { id: string; name_ar: string }[];
  staff: { id: string; full_name: string }[];
  version: string;
}
export interface PoPrint { po: PoDetail['header'] & { assigned_name: string | null }; matrix: Matrix; snapshot_version: number | null; snapshot_at: string | null; window: { name_ar: string; kind: string; cutoff_time: string | null }; plant: { name_ar: string; phone: string | null; address: string | null }; branding: Branding; printed_by: string; printed_at: string; timezone: string }

export interface Material { id: string; code: string; name_ar: string; category_id: string | null; category_name: string | null; uom_id: string; uom_name: string; uom_decimals: number; safety_stock: number; default_unit_cost_minor?: number | null; is_active: number; qty_on_hand: number; unit_cost_minor?: number; stock_value_minor?: number; stock_status: 'ok' | 'low' | 'out'; last_movement_at: string | null }
export interface LedgerRow { id: string; reason: string; qty: number; qty_after: number; unit_cost_minor?: number; valuation_rate_minor_after?: number; stock_value_minor_after?: number; occurred_at: string; note: string | null; voucher_id: string | null; voucher_number: string | null; voucher_kind: string | null; issued_to_name: string | null; external_ref: string | null; supplier_name: string | null; actor_name: string }
export interface MovementRow extends LedgerRow { raw_material_id: string; code: string; name_ar: string; uom_name: string; category_name: string | null; value_minor?: number; voucher_status: string | null; reverses_movement_id: string | null }
export interface VoucherSummary { id: string; kind: string; number: string; voucher_date: string; status: string; external_ref: string | null; issued_to_name: string | null; supplier_name: string | null; created_by_name: string; created_at: string; line_count: number; total_minor?: number; materials: string }
export interface StockRow { id: string; code: string; category: string | null; category_id: string | null; name_ar: string; uom: string; safety_stock: number; opening_qty: number; total_in: number; total_out: number; closing_qty: number; unit_cost_minor?: number; closing_value_minor?: number; stock_status: 'ok' | 'low' | 'out' }
export interface Notification { id: string; kind: string; title_ar: string; body_ar: string | null; payload: string | null; read_at: string | null; created_at: string }
