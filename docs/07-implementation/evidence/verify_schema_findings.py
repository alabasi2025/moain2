#!/usr/bin/env python3
"""
Reproducible evidence for the findings in 00-agent-understanding.md.
Loads docs/02-domain/04-schema.sql into an in-memory SQLite and probes it.
Run:  python3 docs/07-implementation/evidence/verify_schema_findings.py
"""
import sqlite3, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
SCHEMA = (ROOT / "docs/02-domain/04-schema.sql").read_text(encoding="utf-8")

def fresh():
    db = sqlite3.connect(":memory:")
    db.executescript(SCHEMA)
    db.executescript("""
      INSERT INTO tenants(id,name,slug) VALUES ('t1','T','t');
      INSERT INTO tenant_settings(tenant_id) VALUES ('t1');
      INSERT INTO users(id,tenant_id,full_name) VALUES ('u1','t1','U');
      INSERT INTO locations(id,tenant_id,code,name_ar,kind) VALUES ('w1','t1','WH','مخزن','warehouse');
      INSERT INTO uoms(id,tenant_id,code,name_ar) VALUES ('kg','t1','kg','كجم');
      INSERT INTO raw_materials(id,tenant_id,code,name_ar,uom_id) VALUES ('m1','t1','RM-1','دقيق','kg');
    """)
    return db

def mv(db, id_, qty, reason, cost, qa, rate, val, diff, occurred, created):
    db.execute("""INSERT INTO stock_movements(id,tenant_id,raw_material_id,location_id,qty,reason,
      unit_cost_minor,qty_after,valuation_rate_minor_after,stock_value_minor_after,stock_value_diff_minor,
      actor_id,occurred_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
      (id_,'t1','m1','w1',qty,reason,cost,qa,rate,val,diff,'u1',occurred,created))

results = []
def check(name, ok, detail):
    results.append((name, ok, detail)); print(("PASS " if ok else "FINDING ") + name + " :: " + detail)

print("SQLite", sqlite3.sqlite_version)

# 1) Mandatory moving-average scenario + immutability (expected to PASS)
db = fresh()
mv(db,'a',100,'opening',500,100,500,50000,50000,'2026-10-01T00:00:00.000Z','2026-10-01T08:00:00.000Z')
mv(db,'b', 50,'receipt',800,150,600,90000,40000,'2026-10-02T00:00:00.000Z','2026-10-02T08:00:00.000Z')
mv(db,'c',-120,'issue', 600, 30,600,18000,-72000,'2026-10-03T00:00:00.000Z','2026-10-03T08:00:00.000Z')
row = db.execute("SELECT qty,stock_value_minor FROM v_stock_on_hand").fetchone()
check("MA scenario 100@500 +50@800 -120 => 30 / 18000", row == (30.0, 18000), str(row))
try:
    db.execute("UPDATE stock_movements SET qty=1 WHERE id='a'"); check("ledger UPDATE blocked", False, "update succeeded")
except sqlite3.DatabaseError as e: check("ledger UPDATE blocked", True, str(e))
try:
    db.execute("DELETE FROM stock_movements WHERE id='a'"); check("ledger DELETE blocked", False, "delete succeeded")
except sqlite3.DatabaseError as e: check("ledger DELETE blocked", True, str(e))

# 2) Back-dated posting (F19 allows it with a warning) -> view vs cache diverge
db = fresh()
mv(db,'a',100,'opening',500,100,500,50000,50000,'2026-10-01T00:00:00.000Z','2026-10-01T08:00:00.000Z')
mv(db,'b', 50,'receipt',800,150,600,90000,40000,'2026-10-03T00:00:00.000Z','2026-10-03T08:00:00.000Z')
# posted later (created 10-04) but dated 10-02; qty_after computed from the latest balance (150) as the pseudocode does
mv(db,'c',-20,'issue',600,130,600,78000,-12000,'2026-10-02T00:00:00.000Z','2026-10-04T08:00:00.000Z')
view = db.execute("SELECT qty FROM v_stock_on_hand").fetchone()[0]
cache = db.execute("SELECT qty FROM stock_balances").fetchone()[0]
check("back-dated post keeps view == cache", view == cache, f"v_stock_on_hand={view} stock_balances={cache} (true balance 130)")

# 3) Mixed date formats in occurred_at break the (occurred_at || created_at) ordering.
#    voucher_date is 'YYYY-MM-DD' (I5) while other paths may write full ISO. Reverse case:
#    the LATER movement is date-only, so its concatenated key sorts lower ('2' < 'T').
db = fresh()
mv(db,'a',100,'opening',500,100,500,50000,50000,'2026-10-03T00:00:00.000Z','2026-10-03T08:00:00.000Z') # full ISO
mv(db,'b', 10,'receipt',500,110,500,55000,5000,'2026-10-03','2026-10-03T09:00:00.000Z')               # date-only, recorded later
view = db.execute("SELECT qty FROM v_stock_on_hand").fetchone()[0]
check("occurred_at format-agnostic ordering", view == 110, f"view picked qty={view} (expected 110 = latest)")

# 4) user_roles PK with NULL location allows duplicate global roles
db = fresh()
db.execute("INSERT INTO user_roles(user_id,role,location_id) VALUES ('u1','admin',NULL)")
try:
    db.execute("INSERT INTO user_roles(user_id,role,location_id) VALUES ('u1','admin',NULL)")
    n = db.execute("SELECT COUNT(*) FROM user_roles").fetchone()[0]
    check("user_roles rejects duplicate global role", False, f"{n} identical rows accepted (NULL in composite PK)")
except sqlite3.IntegrityError as e: check("user_roles rejects duplicate global role", True, str(e))

# 5) deliveries: UPDATE blocked, but DELETE and delivery_lines edits are not (E5 says immutable)
db = fresh()
db.executescript("""
 INSERT INTO locations(id,tenant_id,code,name_ar,kind) VALUES ('p1','t1','PL','معمل','plant'),('b1','t1','BR','فرع','branch');
 INSERT INTO categories(id,tenant_id,name_ar) VALUES ('c1','t1','المعجنات');
 INSERT INTO products(id,tenant_id,category_id,code,name_ar,uom_id) VALUES ('pr1','t1','c1','P1','كرواسون','kg');
 INSERT INTO order_windows(id,tenant_id,plant_id,name_ar) VALUES ('win','t1','p1','يومية');
 INSERT INTO orders(id,tenant_id,branch_id,plant_id,window_id,delivery_date,status,client_uuid) VALUES ('o1','t1','b1','p1','win','2026-10-04','ready','cu1');
 INSERT INTO order_lines(id,order_id,product_id,qty) VALUES ('ol1','o1','pr1',40);
 INSERT INTO deliveries(id,tenant_id,order_id,number,delivered_by,received_by_name,delivered_at,client_uuid) VALUES ('d1','t1','o1','DLV-1','u1','أحمد','2026-10-04T05:00:00Z','cu2');
 INSERT INTO delivery_lines(id,delivery_id,order_line_id,qty_delivered) VALUES ('dl1','d1','ol1',40);
""")
try:
    db.execute("UPDATE delivery_lines SET qty_delivered=10 WHERE id='dl1'")
    check("delivery_lines immutable", False, "UPDATE delivery_lines succeeded")
except sqlite3.DatabaseError as e: check("delivery_lines immutable", True, str(e))
try:
    db.execute("DELETE FROM deliveries WHERE id='d1'")
    check("deliveries DELETE blocked", False, "DELETE deliveries succeeded (lines cascaded)")
except sqlite3.DatabaseError as e: check("deliveries DELETE blocked", True, str(e))

# 6) Integer valuation rate drift (J3: ROUND(...,4) then stored as INTEGER)
qty0, rate0 = 100, 500; inq, incost = 50, 810
exact = (qty0*rate0 + inq*incost) / (qty0+inq)
stored = round(exact)
out = 149
value_by_rate = round((qty0+inq-out) * stored)
value_carried = (qty0*rate0 + inq*incost) - round(out * stored)
check("rate-integer rounding loses no value", value_by_rate == value_carried,
      f"exact rate={exact:.4f} stored={stored}; after issuing {out}: qty*rate value={value_by_rate}, carried value={value_carried}")


# 7) A cancelled order/production order permanently blocks the (branch, window, date) slot
db = fresh()
db.executescript("""
 INSERT INTO locations(id,tenant_id,code,name_ar,kind) VALUES ('p1','t1','PL','معمل','plant'),('b1','t1','BR','فرع','branch');
 INSERT INTO order_windows(id,tenant_id,plant_id,name_ar) VALUES ('win','t1','p1','يومية');
 INSERT INTO orders(id,tenant_id,branch_id,plant_id,window_id,delivery_date,status,client_uuid,cancel_reason)
   VALUES ('o1','t1','b1','p1','win','2026-10-04','cancelled','cu1','خطأ');""")
try:
    db.execute("""INSERT INTO orders(id,tenant_id,branch_id,plant_id,window_id,delivery_date,status,client_uuid)
                  VALUES ('o2','t1','b1','p1','win','2026-10-04','submitted','cu2')""")
    check("re-order after cancellation (same day/window)", True, "allowed")
except sqlite3.IntegrityError as e:
    check("re-order after cancellation (same day/window)", False, f"blocked: {e}")

# 8) Child tables carry no tenant_id (A1 says every query carries tenant_id)
db = fresh()
tables = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")]
no_tenant = [t for t in tables if 'tenant_id' not in [c[1] for c in db.execute(f"PRAGMA table_info({t})")] and t != 'tenants']
check("every table has tenant_id", not no_tenant, f"{len(no_tenant)} tables without it: {', '.join(no_tenant)}")

print("\nSUMMARY:", sum(1 for r in results if r[1]), "pass /", sum(1 for r in results if not r[1]), "findings")
