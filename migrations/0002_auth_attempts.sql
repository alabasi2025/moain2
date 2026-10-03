-- ADR-0012 P3: rate-limit counters must be strongly consistent → D1, not KV.
CREATE TABLE auth_attempts (
  key           TEXT PRIMARY KEY,          -- 'pin:<deviceId>' | 'login:<tenant>:<identifier>'
  fail_count    INTEGER NOT NULL DEFAULT 0,
  total_fails   INTEGER NOT NULL DEFAULT 0,
  window_start  TEXT NOT NULL,
  locked_until  TEXT
);

-- Idempotency for repeated device submissions of revisions / quick vouchers / deliveries (C12, E8, §3.4).
CREATE TABLE idempotency_keys (
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  key         TEXT NOT NULL,
  op          TEXT NOT NULL,
  response    TEXT NOT NULL CHECK (json_valid(response)),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (tenant_id, key)
);

-- The client asked for "خانة اسم المسؤول عن الطلبية": the supervisor may not have a system account.
ALTER TABLE production_orders ADD COLUMN assigned_to_name TEXT;
