# Progress — مُعين

## M0 — first working version (sent to the client for feedback)

| Area | Status | Evidence |
|---|---|---|
| Domain (money/qty, moving average, state machines, cycles, RBAC) | ✅ | `packages/shared` — 154 tests |
| Database: verbatim baseline + integrity (ADR-0011) + auth/idempotency | ✅ | `migrations/0000–0002`, `test/db-invariants.sh` 12/12 |
| API: auth/PIN, catalog, orders + exceptions, production + snapshots, delivery + signature, inventory + 11 columns + daily log, admin, reports, notifications, automatic lock (cron) | ✅ | `test/e2e-api.mjs` 45/45, `test/isolation.mjs` 17/17 |
| App-like PWA (bottom nav / sidebar, sheets, number pad, PIN, dark mode, offline outbox) | ✅ | `packages/web`, `docs/07-implementation/screens/*.png` |
| Branch screens: home, order entry (stepper + notes + copy previous), review, history, details + exception, receiving | ✅ | 02–05 |
| Plant screens: production orders, branch × item matrix, assign responsible + time, lock/start/complete, exceptions, delivery with signature | ✅ | 06–07, 14 |
| Store screens: quick receipt/issue, materials + ledger, vouchers + cancellation by reversal, stock status (11 columns), daily movement log, Excel | ✅ | 09–12, 15 |
| Printing: T1 consolidated, T2 per section, T3 per branch (A5), delivery receipt, T5 voucher, T7 stock | ✅ | 08 |
| Settings: branches/sites, categories/items, order windows, users, branding/logo, audit log | ✅ (basic) | |

## Pending / next
- Full editing of users, materials and items (currently: list + add).
- Stock counts (count sessions) — schema and state machine ready, UI not built yet.
- Push notifications (in-app only for now).
- Deploy to Cloudflare (D1 + Workers) once the client approves.
