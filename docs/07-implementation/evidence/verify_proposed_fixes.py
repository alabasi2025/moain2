#!/usr/bin/env python3
"""
Prototype of the ADDITIVE schema amendments proposed in ADR-0011 (status: proposed).
Applies docs/02-domain/04-schema.sql unchanged, then a candidate migration 0001, and
re-runs the failing probes from verify_schema_findings.py. Nothing here is applied to the
real schema until the owner approves the ADR.
"""
import sqlite3, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[3]
SCHEMA = (ROOT / "docs/02-domain/04-schema.sql").read_text(encoding="utf-8")

AMEND = r"""
-- (a) occurred_at must be full ISO-8601 UTC with ms → string order == time order
CREATE TRIGGER trg_sm_occurred_at_format BEFORE INSERT ON stock_movements
WHEN length(NEW.occurred_at) <> 24 OR substr(NEW.occurred_at, 5, 1) <> '-' OR substr(NEW.occurred_at, 8, 1) <> '-'
  OR substr(NEW.occurred_at, 11, 1) <> 'T' OR substr(NEW.occurred_at, 14, 1) <> ':' OR substr(NEW.occurred_at, 17, 1) <> ':'
  OR substr(NEW.occurred_at, 20, 1) <> '.' OR substr(NEW.occurred_at, 24, 1) <> 'Z'
  OR datetime(substr(NEW.occurred_at, 1, 19)) IS NULL
BEGIN SELECT RAISE(ABORT, 'occurred_at must be YYYY-MM-DDTHH:MM:SS.sssZ'); END;

-- (b) ledger chain integrity: each movement must continue the latest balance of its
--     (material, location) and may not be dated before it. Makes back-dating impossible
--     and turns a read-compute-write race into an atomic batch failure (retry).
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
      THEN RAISE(ABORT, 'LEDGER_VALUE_CHAIN_BROKEN')
  END;
END;

-- (c) user_roles: NULL location must not allow duplicate global roles
CREATE UNIQUE INDEX ux_user_roles_scope ON user_roles(user_id, role, COALESCE(location_id, ''));

-- (d) deliveries are events: no DELETE; lines frozen
CREATE TRIGGER trg_deliveries_no_delete BEFORE DELETE ON deliveries
BEGIN SELECT RAISE(ABORT, 'deliveries are immutable'); END;
CREATE TRIGGER trg_delivery_lines_no_update BEFORE UPDATE ON delivery_lines
BEGIN SELECT RAISE(ABORT, 'delivery lines are immutable'); END;
CREATE TRIGGER trg_delivery_lines_no_delete BEFORE DELETE ON delivery_lines
BEGIN SELECT RAISE(ABORT, 'delivery lines are immutable'); END;

-- (e) frozen documents cannot be un-frozen by flipping status
CREATE TRIGGER trg_vouchers_status_forward BEFORE UPDATE OF status ON vouchers
WHEN (OLD.status = 'posted' AND NEW.status NOT IN ('posted','cancelled')) OR (OLD.status = 'cancelled' AND NEW.status <> 'cancelled')
BEGIN SELECT RAISE(ABORT, 'VOUCHER_STATUS_REGRESSION'); END;
CREATE TRIGGER trg_vouchers_no_delete_nondraft BEFORE DELETE ON vouchers
WHEN OLD.status <> 'draft'
BEGIN SELECT RAISE(ABORT, 'only draft vouchers can be deleted'); END;
CREATE TRIGGER trg_count_sessions_terminal BEFORE UPDATE OF status ON count_sessions
WHEN OLD.status IN ('committed','cancelled') AND NEW.status <> OLD.status
BEGIN SELECT RAISE(ABORT, 'COUNT_STATUS_REGRESSION'); END;
"""

def fresh(amend=True):
    db = sqlite3.connect(":memory:"); db.executescript(SCHEMA)
    if amend: db.executescript(AMEND)
    db.executescript("""
      INSERT INTO tenants(id,name,slug) VALUES ('t1','T','t'); INSERT INTO tenant_settings(tenant_id) VALUES ('t1');
      INSERT INTO users(id,tenant_id,full_name) VALUES ('u1','t1','U');
      INSERT INTO locations(id,tenant_id,code,name_ar,kind) VALUES ('w1','t1','WH','مخزن','warehouse');
      INSERT INTO uoms(id,tenant_id,code,name_ar) VALUES ('kg','t1','kg','كجم');
      INSERT INTO raw_materials(id,tenant_id,code,name_ar,uom_id) VALUES ('m1','t1','RM-1','دقيق','kg');""")
    return db

def mv(db,i,q,r,c,qa,rate,val,diff,occ,cre):
    db.execute("""INSERT INTO stock_movements(id,tenant_id,raw_material_id,location_id,qty,reason,unit_cost_minor,qty_after,
      valuation_rate_minor_after,stock_value_minor_after,stock_value_diff_minor,actor_id,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",(i,'t1','m1','w1',q,r,c,qa,rate,val,diff,'u1',occ,cre))

res=[]
def check(n,ok,d): res.append(ok); print(("OK   " if ok else "FAIL ")+n+" :: "+d)
def expect_abort(n, fn, token):
    try: fn(); check(n, False, "statement succeeded")
    except sqlite3.DatabaseError as e: check(n, token in str(e), str(e))

T='2026-10-0%dT0%d:00:00.000Z'
db=fresh()
mv(db,'a',100,'opening',500,100,500,50000,50000,T%(1,8),T%(1,8))
mv(db,'b',50,'receipt',800,150,600,90000,40000,T%(2,8),T%(2,8))
mv(db,'c',-120,'issue',600,30,600,18000,-72000,T%(3,8),T%(3,8))
check("mandatory MA scenario still passes with amendments", db.execute("SELECT qty,stock_value_minor FROM v_stock_on_hand").fetchone()==(30.0,18000), "30 / 18000")
expect_abort("back-dated movement rejected", lambda: mv(db,'d',-5,'issue',600,25,600,15000,-3000,T%(2,9),T%(4,8)), "LEDGER_BACKDATED")
expect_abort("stale-balance (race) movement rejected", lambda: mv(db,'e',-5,'issue',600,145,600,87000,-3000,T%(4,8),T%(4,8)), "LEDGER_CHAIN_BROKEN")
expect_abort("value chain enforced", lambda: mv(db,'f',-5,'issue',600,25,600,15000,-9999,T%(4,8),T%(4,8)), "LEDGER_VALUE_CHAIN_BROKEN")
expect_abort("date-only occurred_at rejected", lambda: mv(db,'g',-5,'issue',600,25,600,15000,-3000,'2026-10-05',T%(5,8)), "occurred_at must be")
check("view == cache after amendments", db.execute("SELECT qty FROM v_stock_on_hand").fetchone()[0]==db.execute("SELECT qty FROM stock_balances").fetchone()[0], "equal")
check("ledger still immutable", True, "")
try: db.execute("UPDATE stock_movements SET qty=1 WHERE id='a'"); res[-1]=False
except sqlite3.DatabaseError: pass

db.execute("INSERT INTO user_roles VALUES ('u1','admin',NULL)")
expect_abort("duplicate global role rejected", lambda: db.execute("INSERT INTO user_roles VALUES ('u1','admin',NULL)"), "UNIQUE")

db.executescript("""
INSERT INTO vouchers(id,tenant_id,kind,number,location_id,voucher_date,status,created_by,client_uuid) VALUES ('v1','t1','receipt','RCV-1','w1','2026-10-03','posted','u1','c1');
INSERT INTO count_sessions(id,tenant_id,location_id,number,status,opened_by) VALUES ('cs1','t1','w1','CNT-1','committed','u1');""")
expect_abort("posted voucher cannot revert to draft", lambda: db.execute("UPDATE vouchers SET status='draft' WHERE id='v1'"), "VOUCHER_STATUS_REGRESSION")
expect_abort("posted voucher cannot be deleted", lambda: db.execute("DELETE FROM vouchers WHERE id='v1'"), "only draft")
db.execute("UPDATE vouchers SET status='cancelled', cancel_reason='x' WHERE id='v1'"); check("posted -> cancelled still allowed", True, "")
expect_abort("committed count cannot reopen", lambda: db.execute("UPDATE count_sessions SET status='open' WHERE id='cs1'"), "COUNT_STATUS_REGRESSION")

# carried-value valuation (proposal in ADR-0011 §e): value is the source of truth, rate derived; exact at zero
qty, val = 0, 0
def receipt(q,c):
    global qty,val; qty+=q; val+=q*c
def issue(q):
    global qty,val
    rate_e4 = (val*10000)//qty if qty else 0          # integer, 4 extra digits
    out = (q*rate_e4 + 5000)//10000 if q<qty else val # last unit absorbs rounding
    qty-=q; val-=out; return out
receipt(100,500); receipt(50,810); issue(149); last=issue(1)
check("carried-value: stock fully issued -> value exactly 0", (qty,val)==(0,0), f"qty={qty} value={val}, last unit cost {last}")

print("\nSUMMARY:", sum(res), "/", len(res), "ok")
