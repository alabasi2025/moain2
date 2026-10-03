import { localDate, addDays } from '@moain/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { authOf, requirePerm } from '../lib/auth';
import { okJson } from '../lib/http';

export const reports = new Hono<AppEnv>();

/** Owner dashboard KPIs for today. */
reports.get('/dashboard', async (c) => {
  const a = authOf(c);
  const today = localDate(new Date(), a.settings.timezone);
  const tomorrow = addDays(today, 1);
  const [todayPo, tomorrowPo, lowStock, deliveries, pendingEx, recent] = await Promise.all([
    a.db.first(`SELECT po.id, po.number, po.status, po.delivery_date, (SELECT COUNT(*) FROM orders o WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS orders,
                (SELECT COALESCE(SUM(ol.qty),0) FROM orders o JOIN order_lines ol ON ol.order_id = o.id WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS units
                FROM production_orders po JOIN order_windows w ON w.id = po.window_id WHERE po.tenant_id = ? AND po.delivery_date = ? AND w.kind = 'regular' LIMIT 1`, a.tenantId, today),
    a.db.first(`SELECT po.id, po.number, po.status, po.delivery_date, (SELECT COUNT(*) FROM orders o WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS orders,
                (SELECT COALESCE(SUM(ol.qty),0) FROM orders o JOIN order_lines ol ON ol.order_id = o.id WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS units
                FROM production_orders po JOIN order_windows w ON w.id = po.window_id WHERE po.tenant_id = ? AND po.delivery_date = ? AND w.kind = 'regular' LIMIT 1`, a.tenantId, tomorrow),
    a.db.all(`SELECT m.id, m.name_ar, COALESCE(b.qty,0) AS qty, m.safety_stock, u.name_ar AS uom_name FROM raw_materials m JOIN uoms u ON u.id = m.uom_id LEFT JOIN stock_balances b ON b.raw_material_id = m.id
              WHERE m.tenant_id = ? AND m.is_active = 1 AND COALESCE(b.qty,0) < m.safety_stock ORDER BY COALESCE(b.qty,0) / MAX(m.safety_stock, 0.0001) LIMIT 8`, a.tenantId),
    a.db.first<{ ordered: number; delivered: number; n: number }>(`SELECT COALESCE(SUM(ol.qty),0) AS ordered, COALESCE(SUM((SELECT SUM(qty_delivered) FROM delivery_lines WHERE order_line_id = ol.id)),0) AS delivered, COUNT(DISTINCT o.id) AS n
              FROM orders o JOIN order_lines ol ON ol.order_id = o.id WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND o.status IN ('delivered','partially_delivered')`, a.tenantId, addDays(today, -6), today),
    a.db.first<{ n: number }>(`SELECT COUNT(*) n FROM order_exceptions e JOIN orders o ON o.id = e.order_id WHERE o.tenant_id = ? AND e.status = 'pending' AND e.expires_at > ?`, a.tenantId, new Date().toISOString()),
    a.db.all(`SELECT al.entity_type, al.action, al.at, u.full_name AS actor_name, al.entity_id FROM audit_log al LEFT JOIN users u ON u.id = al.actor_id WHERE al.tenant_id = ? AND al.action NOT IN ('login','set_pin') ORDER BY al.at DESC LIMIT 8`, a.tenantId),
  ]);
  return okJson(c, { today, today_po: todayPo, tomorrow_po: tomorrowPo, low_stock: lowStock, fulfillment_7d: deliveries, pending_exceptions: pendingEx?.n ?? 0, recent });
});

/** Demand by product/branch over a period + fulfillment rate (1.11). */
reports.get('/reports/demand', requirePerm('reports:read'), async (c) => {
  const a = authOf(c);
  const today = localDate(new Date(), a.settings.timezone);
  const from = c.req.query('from') ?? addDays(today, -6);
  const to = c.req.query('to') ?? addDays(today, 1);
  const groupBy = c.req.query('group_by') === 'branch' ? 'branch' : 'product';
  const rows = groupBy === 'branch'
    ? await a.db.all(`SELECT l.id AS key_id, l.name_ar AS label, COUNT(DISTINCT o.id) AS orders, COALESCE(SUM(ol.qty),0) AS qty_ordered,
                        COALESCE(SUM((SELECT SUM(qty_delivered) FROM delivery_lines WHERE order_line_id = ol.id)),0) AS qty_delivered
                      FROM orders o JOIN order_lines ol ON ol.order_id = o.id JOIN locations l ON l.id = o.branch_id
                      WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND o.status <> 'cancelled' GROUP BY l.id ORDER BY qty_ordered DESC`, a.tenantId, from, to)
    : await a.db.all(`SELECT p.id AS key_id, p.name_ar AS label, c.name_ar AS category, u.name_ar AS uom, COUNT(DISTINCT o.id) AS orders, COALESCE(SUM(ol.qty),0) AS qty_ordered,
                        COALESCE(SUM((SELECT SUM(qty_delivered) FROM delivery_lines WHERE order_line_id = ol.id)),0) AS qty_delivered
                      FROM orders o JOIN order_lines ol ON ol.order_id = o.id JOIN products p ON p.id = ol.product_id JOIN categories c ON c.id = p.category_id JOIN uoms u ON u.id = p.uom_id
                      WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND o.status <> 'cancelled' GROUP BY p.id ORDER BY c.sort_order, qty_ordered DESC`, a.tenantId, from, to);
  const daily = await a.db.all(`SELECT o.delivery_date AS day, COALESCE(SUM(ol.qty),0) AS qty FROM orders o JOIN order_lines ol ON ol.order_id = o.id
                                WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND o.status <> 'cancelled' GROUP BY o.delivery_date ORDER BY day`, a.tenantId, from, to);
  return okJson(c, { from, to, group_by: groupBy, rows, daily });
});
