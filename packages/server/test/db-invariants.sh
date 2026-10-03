#!/usr/bin/env bash
# DB-level invariants on the local D1 (after e2e-api): the triggers must reject these writes.
cd "$(dirname "$0")/.."
fail=0
try() { # $1 name, $2 sql, $3 expected error fragment
  out=$(npx wrangler d1 execute moain --local --command "$2" 2>&1)
  if echo "$out" | grep -q "$3"; then echo "PASS  $1"; else echo "FAIL  $1"; echo "$out" | tail -3; fail=1; fi
}
try "F1 UPDATE stock_movements rejected" "UPDATE stock_movements SET qty = 999" "append-only"
try "F1 DELETE stock_movements rejected" "DELETE FROM stock_movements" "append-only"
try "A8 audit_log append-only" "DELETE FROM audit_log" "append-only"
try "E5 delivery UPDATE rejected" "UPDATE deliveries SET received_by_name = 'x'" "immutable"
try "S6 delivery DELETE rejected" "DELETE FROM deliveries" "immutable"
try "S6 delivery_lines UPDATE rejected" "UPDATE delivery_lines SET qty_delivered = 0" "immutable"
try "S4 posted voucher cannot revert to draft" "UPDATE vouchers SET status = 'draft' WHERE status = 'posted'" "REGRESSION"
try "F7 posted voucher lines frozen" "UPDATE voucher_lines SET qty = 1 WHERE voucher_id IN (SELECT id FROM vouchers WHERE status <> 'draft')" "immutable"
try "S1 back-dated movement rejected" "INSERT INTO stock_movements (id,tenant_id,raw_material_id,location_id,qty,reason,unit_cost_minor,qty_after,valuation_rate_minor_after,stock_value_minor_after,stock_value_diff_minor,actor_id,occurred_at) SELECT 'x1', tenant_id, raw_material_id, location_id, 1, 'receipt', 1, qty_after+1, 1, 1, 1, actor_id, '2000-01-01T00:00:00.000Z' FROM stock_movements LIMIT 1" "LEDGER_BACKDATED"
try "S2 date-only occurred_at rejected" "INSERT INTO stock_movements (id,tenant_id,raw_material_id,location_id,qty,reason,unit_cost_minor,qty_after,valuation_rate_minor_after,stock_value_minor_after,stock_value_diff_minor,actor_id,occurred_at) SELECT 'x2', m.tenant_id, b.raw_material_id, b.location_id, 1, 'receipt', 1, b.qty+1, 1, b.stock_value_minor+1, 1, m.actor_id, '2099-01-01' FROM stock_balances b JOIN stock_movements m ON m.id = b.last_movement_id LIMIT 1" "occurred_at must be"
try "S3 stale-balance movement rejected" "INSERT INTO stock_movements (id,tenant_id,raw_material_id,location_id,qty,reason,unit_cost_minor,qty_after,valuation_rate_minor_after,stock_value_minor_after,stock_value_diff_minor,actor_id,occurred_at) SELECT 'x3', tenant_id, raw_material_id, location_id, 1, 'receipt', 1, 99999, 1, 1, 1, actor_id, '2099-01-01T00:00:00.000Z' FROM stock_movements LIMIT 1" "LEDGER_CHAIN_BROKEN"
out=$(npx wrangler d1 execute moain --local --json --command "SELECT COUNT(*) AS n FROM stock_balances b JOIN v_stock_on_hand v ON v.raw_material_id = b.raw_material_id AND v.location_id = b.location_id WHERE ABS(b.qty - v.qty) > 1e-9 OR b.stock_value_minor <> v.stock_value_minor" 2>/dev/null)
echo "$out" | grep -q '"n": 0' && echo "PASS  F20 stock_balances cache == ledger view" || { echo "FAIL  F20 cache vs ledger"; fail=1; }
exit $fail
