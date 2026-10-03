/**
 * Tenant-scoped data access (A1, ADR-0009).
 * Every Db instance is bound to one tenant; `t` is the tenant id to bind in every root-table query.
 * Child tables (order_lines, voucher_lines, …) are only reached through their root (finding S10).
 * D1 has no BEGIN/COMMIT (ADR-0012 P2): multi-statement writes go through `batch()` which is atomic.
 */
export type Param = string | number | null | ArrayBuffer;

export class Db {
  constructor(readonly d1: D1Database, readonly t: string) {}

  prep(sql: string, ...params: Param[]): D1PreparedStatement {
    return this.d1.prepare(sql).bind(...params);
  }
  async all<T>(sql: string, ...params: Param[]): Promise<T[]> {
    return (await this.prep(sql, ...params).all<T>()).results;
  }
  async first<T>(sql: string, ...params: Param[]): Promise<T | null> {
    return (await this.prep(sql, ...params).first<T>()) ?? null;
  }
  async run(sql: string, ...params: Param[]): Promise<D1Result> {
    return this.prep(sql, ...params).run();
  }
  async batch(stmts: D1PreparedStatement[]): Promise<D1Result[]> {
    if (stmts.length === 0) return [];
    return this.d1.batch(stmts);
  }

  /** Next human-readable number from `sequences` (A9). Gaps allowed, never reused. */
  async nextNumber(key: string, year: number): Promise<string> {
    const r = await this.first<{ v: number }>(
      `INSERT INTO sequences (tenant_id, key, year, next_value) VALUES (?, ?, ?, 2)
       ON CONFLICT (tenant_id, key, year) DO UPDATE SET next_value = next_value + 1
       RETURNING next_value - 1 AS v`,
      this.t, key, year,
    );
    return `${key}-${year}-${String(r?.v ?? 1).padStart(5, '0')}`;
  }

  audit(actorId: string | null, entityType: string, entityId: string, action: string, before: unknown, after: unknown, newId: string): D1PreparedStatement {
    return this.prep(
      `INSERT INTO audit_log (id, tenant_id, actor_id, entity_type, entity_id, action, before, after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      newId, this.t, actorId, entityType, entityId, action, before === null ? null : JSON.stringify(before), after === null ? null : JSON.stringify(after),
    );
  }

  async getIdempotent<T>(key: string): Promise<T | null> {
    const r = await this.first<{ response: string }>(`SELECT response FROM idempotency_keys WHERE tenant_id = ? AND key = ?`, this.t, key);
    return r ? (JSON.parse(r.response) as T) : null;
  }
  saveIdempotent(key: string, op: string, response: unknown): D1PreparedStatement {
    return this.prep(`INSERT OR IGNORE INTO idempotency_keys (tenant_id, key, op, response) VALUES (?, ?, ?, ?)`, this.t, key, op, JSON.stringify(response));
  }
}
