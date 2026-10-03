-- ADR-0011: additive integrity amendments on top of 0000_baseline (04-schema.sql verbatim).
-- Every statement below closes a gap proven in docs/07-implementation/evidence/.

-- S2: occurred_at must be full ISO-8601 UTC with ms so that string order == time order
CREATE TRIGGER trg_sm_occurred_at_format BEFORE INSERT ON stock_movements
WHEN length(NEW.occurred_at) <> 24 OR substr(NEW.occurred_at, 5, 1) <> '-' OR substr(NEW.occurred_at, 8, 1) <> '-'
  OR substr(NEW.occurred_at, 11, 1) <> 'T' OR substr(NEW.occurred_at, 14, 1) <> ':' OR substr(NEW.occurred_at, 17, 1) <> ':'
  OR substr(NEW.occurred_at, 20, 1) <> '.' OR substr(NEW.occurred_at, 24, 1) <> 'Z'
  OR datetime(substr(NEW.occurred_at, 1, 19)) IS NULL
BEGIN SELECT RAISE(ABORT, 'occurred_at must be YYYY-MM-DDTHH:MM:SS.sssZ'); END;

-- S1 + S3: ledger chain — each movement continues the latest balance and is never dated before it
CREATE TRIGGER trg_sm_chain BEFORE INSERT ON stock_movements
BEGIN
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM stock_balances b JOIN stock_movements p ON p.id = b.last_movement_id
                 WHERE b.raw_material_id = NEW.raw_material_id AND b.location_id = NEW.location_id
                   AND NEW.occurred_at < p.occurred_at)
      THEN RAISE(ABORT, 'LEDGER_BACKDATED')
    WHEN ROUND(COALESCE((SELECT qty FROM stock_balances WHERE raw_material_id = NEW.raw_material_id
                          AND location_id = NEW.location_id), 0) + NEW.qty, 4) <> ROUND(NEW.qty_after, 4)
      THEN RAISE(ABORT, 'LEDGER_CHAIN_BROKEN')
    WHEN COALESCE((SELECT stock_value_minor FROM stock_balances WHERE raw_material_id = NEW.raw_material_id
                    AND location_id = NEW.location_id), 0) + NEW.stock_value_diff_minor <> NEW.stock_value_minor_after
      THEN RAISE(ABORT, 'LEDGER_CHAIN_BROKEN')
  END;
END;

-- S7: no duplicate tenant-wide roles
CREATE UNIQUE INDEX ux_user_roles_scope ON user_roles(user_id, role, COALESCE(location_id, ''));

-- S6: deliveries are events
CREATE TRIGGER trg_deliveries_no_delete BEFORE DELETE ON deliveries
BEGIN SELECT RAISE(ABORT, 'deliveries are immutable'); END;
CREATE TRIGGER trg_delivery_lines_no_update BEFORE UPDATE ON delivery_lines
BEGIN SELECT RAISE(ABORT, 'delivery lines are immutable'); END;
CREATE TRIGGER trg_delivery_lines_no_delete BEFORE DELETE ON delivery_lines
BEGIN SELECT RAISE(ABORT, 'delivery lines are immutable'); END;

-- S4: a posted voucher cannot be un-frozen; only drafts can be deleted
CREATE TRIGGER trg_vouchers_status_forward BEFORE UPDATE OF status ON vouchers
WHEN (OLD.status = 'posted' AND NEW.status NOT IN ('posted','cancelled')) OR (OLD.status = 'cancelled' AND NEW.status <> 'cancelled')
BEGIN SELECT RAISE(ABORT, 'VOUCHER_STATUS_REGRESSION'); END;
CREATE TRIGGER trg_vouchers_no_delete_nondraft BEFORE DELETE ON vouchers
WHEN OLD.status <> 'draft'
BEGIN SELECT RAISE(ABORT, 'only draft vouchers can be deleted'); END;

-- S5: committed / cancelled count sessions are terminal
CREATE TRIGGER trg_count_sessions_terminal BEFORE UPDATE OF status ON count_sessions
WHEN OLD.status IN ('committed','cancelled') AND NEW.status <> OLD.status
BEGIN SELECT RAISE(ABORT, 'COUNT_STATUS_REGRESSION'); END;

-- G2: one-shot exceptions with an edit window
ALTER TABLE order_exceptions ADD COLUMN consumed_at TEXT;
ALTER TABLE order_exceptions ADD COLUMN edit_until TEXT;
