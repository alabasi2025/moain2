import { AlertTriangle, ArrowDown, ArrowUp, ChevronLeft, ClipboardCopy, Clock, Factory, PackageCheck, Printer, Truck, Zap, Boxes, ClipboardList, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { count, t } from '../lib/i18n';
import { dayLabel, fmtDateTime, fmtDay, fmtDuration, fmtMoney, fmtNum, fmtQty, fmtRelative, fmtTime, localToday } from '../lib/format';
import { useApi } from '../lib/queries';
import { hasRole, useMe, useMyBranch } from '../lib/session';
import { orderTone, poTone, stockTone } from '../lib/status';
import type { Material, MovementRow, OrderSummary, OrderWindow, PoSummary } from '../lib/types';
import { Badge, Button, Empty, ListSkeleton, Q, Screen, Skeleton, StatusBadge } from '../ui/kit';
import { NotifBell } from '../ui/Shell';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'صباح الخير' : 'مساء الخير';
}

export function HomeScreen() {
  const me = useMe();
  if (hasRole(me, 'owner', 'admin')) return <AdminHome />;
  if (hasRole(me, 'plant_manager', 'plant_staff')) return <PlantHome />;
  if (hasRole(me, 'storekeeper')) return <StoreHome />;
  if (hasRole(me, 'branch_user')) return <BranchHome />;
  return <AdminHome />;
}

function HomeHeader({ sub }: { sub: string }) {
  const me = useMe();
  return { title: `${greeting()}، ${me.user.full_name.split(' ')[0]}`, subtitle: sub, actions: <NotifBell /> };
}

/* ═══ W1 — branch home ═══ */
function BranchHome() {
  const { branch } = useMyBranch();
  const nav = useNavigate();
  const wq = useApi<OrderWindow[]>(branch ? `/windows?branch_id=${branch.id}` : null, { refetchInterval: 60_000 });
  const oq = useApi<OrderSummary[]>('/orders');
  const h = HomeHeader({ sub: `${branch?.name_ar ?? ''} · ${fmtDay(localToday(), 'weekday')}` });
  const daily = wq.data?.find((w) => w.kind === 'regular' && w.is_active);
  const urgent = wq.data?.find((w) => w.kind === 'urgent' && w.is_active);
  const orders = oq.data ?? [];
  const forNext = daily ? orders.find((o) => o.delivery_date === daily.cycle.deliveryDate && o.window_id === daily.id) : undefined;
  const active = orders.filter((o) => ['locked', 'in_production', 'ready', 'partially_delivered'].includes(o.status)).sort((a, b) => a.delivery_date.localeCompare(b.delivery_date))[0];
  const delivered = orders.filter((o) => o.status === 'delivered' || o.status === 'partially_delivered').slice(0, 3);
  const mins = daily?.cycle.closesInMinutes ?? null;
  return (
    <Screen {...h}>
      <div className="stack" style={{ gap: 12 }}>
        {wq.isLoading ? <Skeleton h={180} r={20} /> : daily ? (
          <div className="hero">
            <div className="split">
              <div>
                <div className="t-small muted">{dayLabel(daily.cycle.deliveryDate) === 'غداً' ? 'طلبية الغد' : `طلبية ${dayLabel(daily.cycle.deliveryDate)}`}</div>
                <div className="t-display" style={{ fontSize: 24 }}>{fmtDay(daily.cycle.deliveryDate, 'long')}</div>
              </div>
              {forNext ? <StatusBadge s={orderTone(forNext.status)} /> : <Badge tone="muted">لم تُرسل بعد</Badge>}
            </div>
            <div className="hstack" style={{ marginTop: 12, color: mins !== null && mins < 60 ? 'var(--warning-ink)' : 'var(--ink-2)', fontWeight: 500 }}>
              <Clock size={18} />
              {mins !== null && mins > 0 ? <span>تُغلق خلال <b className="num">{fmtDuration(mins)}</b> · الساعة {fmtTime(daily.cycle.closesAt)}</span> : <span>أُغلقت النافذة</span>}
            </div>
            {forNext ? <div className="t-small muted" style={{ marginTop: 6 }}>{count(forNext.line_count, 'item')} · {fmtNum(forNext.total_qty)} وحدة{forNext.revision > 1 ? ` · تعديل ${fmtNum(forNext.revision)}` : ''}</div> : null}
            <Button variant="primary" size="lg" block style={{ marginTop: 14 }} onClick={() => nav('/order')} icon={<ClipboardList size={20} />}>
              {forNext ? (forNext.status === 'submitted' ? 'عرض / تعديل الطلبية' : 'عرض الطلبية') : 'ابدأ الطلبية'}
            </Button>
          </div>
        ) : <Empty title="لا توجد نافذة طلب" text="اطلب من المسؤول تفعيل نافذة الطلب اليومية" />}

        {active ? (
          <Link to={`/orders/${active.id}`} className="card pad tap">
            <div className="split">
              <span className="t-h3">طلبية {dayLabel(active.delivery_date)}</span>
              <StatusBadge s={orderTone(active.status)} />
            </div>
            <div className="t-small muted" style={{ marginTop: 4 }}>{count(active.line_count, 'item')} · {fmtNum(active.total_qty)} وحدة</div>
            {active.status === 'ready' ? <div className="t-small" style={{ marginTop: 6, color: 'var(--success-ink)', fontWeight: 600 }}>جاهزة للاستلام من المعمل</div> : null}
          </Link>
        ) : null}

        <div className="quick">
          <button onClick={() => nav('/order?copy=1')}>
            <span className="qi tone-brand"><ClipboardCopy size={20} /></span>
            <span className="ql">نسخ طلبية سابقة</span>
            <span className="qs">املأ الكميات بآخر طلبية</span>
          </button>
          <button onClick={() => urgent && nav(`/order?w=${urgent.id}`)} disabled={!urgent}>
            <span className="qi tone-warning"><Zap size={20} /></span>
            <span className="ql">طلب عاجل</span>
            <span className="qs">خارج الطلبية اليومية</span>
          </button>
        </div>

        <div className="sect-h"><h2>آخر التسليمات</h2><Link to="/orders">الكل ›</Link></div>
        {oq.isLoading ? <ListSkeleton rows={2} /> : delivered.length ? (
          <div className="list">
            {delivered.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="row">
                <PackageCheck size={20} style={{ color: o.status === 'delivered' ? 'var(--success)' : 'var(--warning)' }} />
                <div className="grow">
                  <div className="ttl">{fmtDay(o.delivery_date)}</div>
                  <div className="sub num">{fmtNum(o.total_delivered)} من {fmtNum(o.total_qty)} · {o.status === 'delivered' ? 'كامل' : 'جزئي'}</div>
                </div>
                <ChevronLeft size={18} className="chev" />
              </Link>
            ))}
          </div>
        ) : <div className="empty-dash">لا تسليمات بعد</div>}
      </div>
    </Screen>
  );
}

/* ═══ plant home ═══ */
function PlantHome() {
  const me = useMe();
  const h = HomeHeader({ sub: `${me.locations.find((l) => l.kind === 'plant')?.name_ar ?? 'المعمل'} · ${fmtDay(localToday(), 'weekday')}` });
  const pq = useApi<PoSummary[]>('/production-orders', { refetchInterval: 30_000 });
  const dq = useApi<OrderSummary[]>('/deliveries/pending', { refetchInterval: 30_000 });
  const eq = useApi<{ id: string; status: string }[]>(hasRole(me, 'plant_manager') ? '/exceptions' : null, { refetchInterval: 30_000 });
  const pendingExc = eq.data?.filter((e) => e.status === 'pending').length ?? 0;
  const pos = (pq.data ?? []).filter((p) => p.status !== 'cancelled' && p.status !== 'completed');
  const ready = (dq.data ?? []).filter((d) => d.status === 'ready' || d.status === 'partially_delivered');
  return (
    <Screen {...h}>
      <div className="stack" style={{ gap: 12 }}>
        {pendingExc ? (
          <Link to="/exceptions" className="card pad tap tone-warning" style={{ borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={22} />
            <div className="grow" style={{ flex: 1 }}><b>{fmtNum(pendingExc)} طلب تعديل بانتظار قرارك</b><div className="t-small">بعد الإغلاق — راجعها الآن</div></div>
            <ChevronLeft size={18} />
          </Link>
        ) : null}
        <Q q={pq} skeleton={<Skeleton h={170} r={20} />}>
          {() => pos.length ? (
            <>
              {pos.slice(0, 3).map((p, i) => <PoHero key={p.id} p={p} primary={i === 0} />)}
            </>
          ) : <Empty icon={<Factory size={40} strokeWidth={1.5} />} title="لا أوامر إنتاج مفتوحة" text="تظهر هنا تلقائياً عند وصول أول طلبية من الفروع" />}
        </Q>
        <div className="sect-h"><h2>جاهزة للتسليم</h2><Link to="/deliver">الكل ›</Link></div>
        {dq.isLoading ? <ListSkeleton rows={2} /> : ready.length ? (
          <div className="list">
            {ready.slice(0, 5).map((o) => (
              <Link key={o.id} to={`/deliver/${o.id}`} className="row">
                <Truck size={20} style={{ color: 'var(--success)' }} />
                <div className="grow"><div className="ttl">{o.branch_name}</div><div className="sub">{fmtDay(o.delivery_date)} · {fmtNum(o.total_qty)} وحدة</div></div>
                <StatusBadge s={orderTone(o.status)} sm />
              </Link>
            ))}
          </div>
        ) : <div className="empty-dash">لا طلبيات جاهزة للتسليم الآن</div>}
      </div>
    </Screen>
  );
}

function PoHero({ p, primary }: { p: PoSummary; primary?: boolean }) {
  const nav = useNavigate();
  return (
    <div className={primary ? 'hero' : 'card pad'}>
      <div className="split">
        <div>
          <div className="t-small muted">أمر إنتاج {dayLabel(p.delivery_date)} · {p.window_name}</div>
          <div className="t-h1 mono" style={{ direction: 'ltr', textAlign: 'right' }}>{p.number}</div>
        </div>
        <StatusBadge s={poTone(p.status)} />
      </div>
      <div className="hstack" style={{ gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        <span className="t-small"><b className="num">{fmtNum(p.order_count)}</b> <span className="muted">فروع</span></span>
        <span className="t-small"><b className="num">{fmtNum(p.total_units)}</b> <span className="muted">وحدة</span></span>
        {p.assigned_to_name ? <span className="t-small muted"><Users size={14} style={{ verticalAlign: -2 }} /> {p.assigned_to_name}</span> : null}
        {p.expected_ready_at ? <span className="t-small muted"><Clock size={14} style={{ verticalAlign: -2 }} /> {fmtTime(p.expected_ready_at)}</span> : null}
      </div>
      <div className="hstack" style={{ marginTop: 12 }}>
        <Button variant={primary ? 'primary' : 'secondary'} block onClick={() => nav(`/production/${p.id}`)}>فتح الأمر</Button>
        <Button onClick={() => nav(`/print/production/${p.id}`)} icon={<Printer size={18} />} aria-label="طباعة">طباعة</Button>
      </div>
    </div>
  );
}

/* ═══ store home ═══ */
function StoreHome() {
  const nav = useNavigate();
  const h = HomeHeader({ sub: `المخزن · ${fmtDay(localToday(), 'weekday')}` });
  const mq = useApi<Material[]>('/raw-materials');
  const lq = useApi<{ rows: MovementRow[] }>('/movements');
  const alerts = (mq.data ?? []).filter((m) => m.stock_status !== 'ok' && m.is_active);
  return (
    <Screen {...h}>
      <div className="stack" style={{ gap: 12 }}>
        <div className="quick">
          <button onClick={() => nav('/movement/new?k=receipt')} style={{ minHeight: 110 }}>
            <span className="qi tone-success"><ArrowDown size={22} /></span>
            <span className="ql" style={{ fontSize: 17 }}>وارد</span><span className="qs">توريد من مورد</span>
          </button>
          <button onClick={() => nav('/movement/new?k=issue')} style={{ minHeight: 110 }}>
            <span className="qi tone-danger"><ArrowUp size={22} /></span>
            <span className="ql" style={{ fontSize: 17 }}>صارف</span><span className="qs">صرف لقسم / ساحب</span>
          </button>
        </div>
        <div className="sect-h"><h2>تنبيهات المخزون</h2><Link to="/materials?f=alert">الكل ›</Link></div>
        <Q q={mq} skeleton={<ListSkeleton rows={3} />} empty={() => (alerts.length ? null : <div className="empty-dash">كل المواد فوق حد الأمان ✓</div>)}>
          {() => (
            <div className="list">
              {alerts.slice(0, 5).map((m) => (
                <Link key={m.id} to={`/materials/${m.id}`} className="row">
                  <div className="grow"><div className="ttl">{m.name_ar}</div><div className="sub num">{fmtQty(m.qty_on_hand)} {m.uom_name} · الحد {fmtQty(m.safety_stock)}</div></div>
                  <StatusBadge s={stockTone(m.stock_status)} sm />
                </Link>
              ))}
            </div>
          )}
        </Q>
        <div className="sect-h"><h2>حركات اليوم</h2><Link to="/movements">الدفتر ›</Link></div>
        <Q q={lq} skeleton={<ListSkeleton rows={3} />} empty={(d) => (d.rows.length ? null : <div className="empty-dash">لم تُسجّل حركات اليوم بعد</div>)}>
          {(d) => <MovementList rows={d.rows.slice(0, 6)} />}
        </Q>
      </div>
    </Screen>
  );
}

export function MovementList({ rows, showMaterial = true }: { rows: MovementRow[]; showMaterial?: boolean }) {
  return (
    <div className="list">
      {rows.map((r) => {
        const inbound = r.qty > 0;
        return (
          <Link key={r.id} to={r.voucher_id ? `/vouchers/${r.voucher_id}` : `/materials/${r.raw_material_id}`} className="row">
            <span className={`qi ${inbound ? 'tone-success' : 'tone-danger'}`} style={{ width: 36, height: 36, borderRadius: 11, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{inbound ? <ArrowDown size={18} /> : <ArrowUp size={18} />}</span>
            <div className="grow">
              <div className="ttl">{showMaterial ? r.name_ar : t(`reason.${r.reverses_movement_id ? 'reversal' : r.reason}`)} <span className="num" style={{ color: inbound ? 'var(--success-ink)' : 'var(--danger-ink)', fontWeight: 600 }}>{inbound ? '+' : '−'}{fmtQty(Math.abs(r.qty))}</span> <span className="faint t-small">{r.uom_name}</span></div>
              <div className="sub">{[r.voucher_number, r.supplier_name ?? r.issued_to_name, r.external_ref, fmtRelative(r.occurred_at)].filter(Boolean).join(' · ')}</div>
            </div>
            <div className="t-small muted num" style={{ textAlign: 'end' }}>{fmtQty(r.qty_after)}</div>
          </Link>
        );
      })}
    </div>
  );
}

/* ═══ admin dashboard ═══ */
interface Dash {
  today: string; today_po: (PoSummary & { orders: number; units: number }) | null; tomorrow_po: (PoSummary & { orders: number; units: number }) | null;
  low_stock: { id: string; name_ar: string; qty: number; safety_stock: number; uom_name: string }[];
  fulfillment_7d: { ordered: number; delivered: number; n: number }; pending_exceptions: number;
  recent: { entity_type: string; action: string; at: string; actor_name: string; entity_id: string }[];
}
const ACT: Record<string, string> = { submit: 'أرسل طلبية', revise: 'عدّل طلبية', lock: 'أقفل أمر إنتاج', start: 'بدأ الإنتاج', complete: 'أكمل الإنتاج', create: 'أنشأ', post: 'رحّل سنداً', cancel: 'ألغى', login: 'دخل النظام', approve: 'وافق على تعديل', reject: 'رفض تعديلاً', assign: 'عيّن مسؤولاً', update: 'عدّل', deliver: 'سلّم طلبية', set_pin: 'عيّن رمز دخول' };
const ENT: Record<string, string> = { order: 'طلبية', production_order: 'أمر إنتاج', voucher: 'سند', delivery: 'تسليم', user: '', product: 'صنف', location: 'موقع', raw_material: 'مادة', order_exception: '', category: 'تصنيف', tenant_branding: 'الهوية', order_window: 'نافذة طلب' };

function AdminHome() {
  const me = useMe();
  const nav = useNavigate();
  const h = HomeHeader({ sub: `${me.branding.company_name} · ${fmtDay(localToday(), 'long')}` });
  const q = useApi<Dash>('/dashboard', { refetchInterval: 30_000 });
  const vq = useApi<{ rows: { closing_value_minor?: number; stock_status: string }[] }>(me.canViewCosts ? '/stock/overview' : null);
  const stockValue = vq.data?.rows.reduce((a, r) => a + (r.closing_value_minor ?? 0), 0);
  return (
    <Screen {...h}>
      <Q q={q} skeleton={<div className="stack"><div className="kpis">{[1, 2, 3, 4].map((i) => <Skeleton key={i} h={96} r={16} />)}</div><Skeleton h={170} r={20} /></div>}>
        {(d) => {
          const po = d.tomorrow_po ?? d.today_po;
          const pct = d.fulfillment_7d.ordered ? Math.round((d.fulfillment_7d.delivered / d.fulfillment_7d.ordered) * 100) : null;
          return (
            <div className="stack" style={{ gap: 12 }}>
              <div className="kpis">
                <Link to={po ? `/production/${po.id}` : '/production'} className="kpi"><span className="k"><ClipboardList size={15} /> طلبيات {po ? dayLabel(po.delivery_date) : 'اليوم'}</span><span className="v">{fmtNum(po?.orders ?? 0)}</span><span className="s">{fmtNum(po?.units ?? 0)} وحدة</span></Link>
                <Link to="/reports" className="kpi"><span className="k"><Truck size={15} /> نسبة التسليم (7 أيام)</span><span className="v">{pct === null ? '—' : `${fmtNum(pct)}٪`}</span><span className="s">{fmtNum(d.fulfillment_7d.delivered)} من {fmtNum(d.fulfillment_7d.ordered)}</span></Link>
                <Link to="/materials?f=alert" className="kpi"><span className="k"><AlertTriangle size={15} /> مواد تحت الحد</span><span className="v" style={{ color: d.low_stock.length ? 'var(--warning-ink)' : undefined }}>{fmtNum(d.low_stock.length)}</span><span className="s">من المخزن المركزي</span></Link>
                <Link to="/stock/overview" className="kpi"><span className="k"><Boxes size={15} /> قيمة المخزون</span><span className="v" style={{ fontSize: 20 }}>{stockValue === undefined ? '—' : fmtMoney(stockValue)}</span><span className="s">ريال يمني</span></Link>
              </div>
              {d.pending_exceptions ? (
                <Link to="/exceptions" className="card pad tap tone-warning" style={{ borderColor: 'transparent', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <AlertTriangle size={22} /><b style={{ flex: 1 }}>{fmtNum(d.pending_exceptions)} طلب تعديل بانتظار القرار</b><ChevronLeft size={18} />
                </Link>
              ) : null}
              {po ? <PoHero p={{ ...po, order_count: po.orders, total_units: po.units, window_name: 'الطلبية اليومية', window_kind: 'regular', plant_name: '', expected_ready_at: po.expected_ready_at ?? null, assigned_to_name: po.assigned_to_name ?? null }} primary /> : (
                <div className="hero"><div className="t-h2">لا طلبيات بعد لهذه الدورة</div><div className="muted t-small">تظهر هنا فور إرسال أول فرع</div><Button style={{ marginTop: 12 }} onClick={() => nav('/order')}>إدخال طلبية نيابة عن فرع</Button></div>
              )}
              <div className="grid-2">
                <div>
                  <div className="sect-h"><h2>تنبيهات المخزون</h2><Link to="/stock/overview">التقرير ›</Link></div>
                  {d.low_stock.length ? (
                    <div className="list">{d.low_stock.slice(0, 5).map((m) => (
                      <Link key={m.id} to={`/materials/${m.id}`} className="row"><div className="grow"><div className="ttl">{m.name_ar}</div><div className="sub num">{fmtQty(m.qty)} {m.uom_name} · الحد {fmtQty(m.safety_stock)}</div></div><StatusBadge s={stockTone(m.qty <= 0 ? 'out' : 'low')} sm /></Link>
                    ))}</div>
                  ) : <div className="empty-dash">كل المواد فوق حد الأمان ✓</div>}
                </div>
                <div>
                  <div className="sect-h"><h2>آخر النشاط</h2><Link to="/settings/audit">السجل ›</Link></div>
                  <div className="list">{d.recent.slice(0, 6).map((r, i) => (
                    <div key={i} className="row"><div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{r.actor_name?.[0] ?? '·'}</div><div className="grow"><div className="ttl t-small">{r.actor_name} {ACT[r.action] ?? r.action} {ENT[r.entity_type] ?? ''}</div><div className="sub t-cap">{fmtDateTime(r.at)}</div></div></div>
                  ))}</div>
                </div>
              </div>
            </div>
          );
        }}
      </Q>
    </Screen>
  );
}
