#!/usr/bin/env bash
# Reset local D1, apply migrations, start wrangler dev, seed demo tenant.
cd "$(dirname "$0")"
for p in $(pgrep -f "node.*wrangler.*dev"); do kill "$p" 2>/dev/null; done
for p in $(pgrep -f "workerd"); do kill "$p" 2>/dev/null; done
sleep 2
rm -rf .wrangler/state
npx wrangler d1 migrations apply moain --local >/dev/null 2>&1
nohup npx wrangler dev --port 8787 --ip 0.0.0.0 --test-scheduled > /tmp/srv.log 2>&1 &
for i in $(seq 1 40); do curl -sf localhost:8787/api/v1/health >/dev/null && break; sleep 1; done
curl -s -X POST localhost:8787/api/v1/dev/seed; echo
