import { AlertTriangle, ChevronLeft, ClipboardList, Edit3, FileSignature, Printer, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { post } from '../../lib/api';
import { dayLabel, fmtDateTime, fmtDay, fmtNum, fmtTime } from '../../lib/format';
import { count } from '../../lib/i18n';
import { invalidate, useApi } from '../../lib/queries';
import { hasRole, useMe } from '../../lib/session';
import { excTone, orderTone } from '../../lib/status';
import type { OrderDetail, OrderStatus, OrderSummary } from '../../lib/types';
import { Badge, Button, Chips, Empty, Q, Screen, SearchBar, StatusBadge, useConfirm, useDebounced, useErrToast, useToast } from '../../ui/kit';

export function OrdersHistoryScreen() {
  const me = useMe();
  const q = useApi<OrderSummary[]>('/orders');
  const [f, setF] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [s, setS] = useState('');
  const ds = useDebounced(s);
  const many = !hasRole(me, 'branch_user') || me.myLocationIds.length > 1;
  const rows = (q.data ?? []).filter((o) => {
    if (f === 'active' && ['delivered', 'cancelled'].includes(o.status)) return false;
    if (f === 'delivered' && !['delivered', 'partially_delivered'].includes(o.status)) return false;
    if (f === 'cancelled' && o.status !== 'cancelled') return false;
    if (ds && !o.branch_name.includes(ds)) return false;
    return true;
  });
  const groups = new Map<string, OrderSummary[]>();
  for (const o of rows) { const g = groups.get(o.delivery_date) ?? []; g.push(o); groups.set(o.delivery_date, g); }
  return (
    <Screen title="سجل الطلبيات" subtitle={q.data ? count(q.data.length, 'order') : undefined}>
      <div className="stack" style={{ gap: 10 }}>
        {many ? <SearchBar value={s} onChange={setS} placeholder="ابحث باسم الفرع…" /> : null}
        <Chips value={f} onChange={setF} items={[{ v: 'all', label: 'الكل' }, { v: 'active', label: 'الجارية' }, { v: 'delivered', label: 'المُسلَّمة' }, { v: 'cancelled', label: 'الملغاة' }]} />
        <Q q={q} empty={() => (rows.length ? null : <Empty icon={<ClipboardList size={40} strokeWidth={1.5} />} title="لا طلبيات" text="ستظهر طلبياتك هنا بعد الإرسال" />)}>
          {() => [...groups.entries()].map(([d, os]) => (
            <div key={d}>
              <div className="sect-h" style={{ marginTop: 10 }}><h2>{dayLabel(d)} · {fmtDay(d)}</h2></div>
              <div className="list">
                {os.map((o) => (
                  <Link key={o.id} to={`/orders/${o.id}`} className="row">
                    <div className="grow">
                      <div className="ttl">{many ? o.branch_name : o.window_name}{o.window_kind === 'urgent' ? ' ⚡' : ''}</div>
                      <div className="sub num">{count(o.line_count, 'item')} · {fmtNum(o.total_qty)} وحدة{o.total_delivered ? ` · سُلّم ${fmtNum(o.total_delivered)}` : ''}</div>
                    </div>
                    <StatusBadge s={orderTone(o.status)} sm />
                    <ChevronLeft size={18} className="chev" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </Q>
      </div>
    </Screen>
  );
}

const FLOW: OrderStatus[] = ['submitted', 'locked', 'in_production', 'ready', 'delivered'];

export function OrderDetailScreen() {
  const { id } = useParams();
  const me = useMe();
  const nav = useNavigate();
  const q = useApi<OrderDetail>(`/orders/${id}`);
  const confirm = useConfirm();
  const toast = useToast();
  const err = useErrToast();
  const isBranch = hasRole(me, 'branch_user', 'owner', 'admin');

  const requestException = async (o: OrderDetail) => {
    const reason = await confirm({ title: 'طلب تعديل بعد الإغلاق', text: 'سيصل طلبك لمدير المعمل. عند الموافقة تُفتح لك مهلة قصيرة للتعديل.', input: { label: 'سبب التعديل', placeholder: 'مثال: نسينا الكيك', min: 3 }, confirm: 'إرسال الطلب' });
    if (!reason) return;
    try { await post(`/orders/${o.id}/exceptions`, { reason }); toast('أُرسل طلب التعديل للمعمل'); void q.refetch(); } catch (e) { err(e); }
  };
  const cancel = async (o: OrderDetail) => {
    const reason = await confirm({ title: 'إلغاء الطلبية؟', text: 'لن تُنتَج هذه الطلبية. يمكنك إرسال طلبية جديدة قبل الإغلاق.', input: { label: 'السبب', min: 2 }, danger: true, confirm: 'إلغاء الطلبية' });
    if (!reason) return;
    try { await post(`/orders/${o.id}/cancel`, { reason }); toast('أُلغيت الطلبية'); await invalidate('/orders', '/production', '/dashboard'); void q.refetch(); } catch (e) { err(e); }
  };

  return (
    <Screen title={q.data ? `طلبية ${q.data.branch.name_ar}` : 'الطلبية'} subtitle={q.data ? `${fmtDay(q.data.delivery_date, 'long')} · ${q.data.window.name_ar}` : undefined} back>
      <Q q={q}>
        {(o) => {
          const idx = FLOW.indexOf(o.status === 'partially_delivered' ? 'ready' : o.status);
          const pendingEx = o.exceptions.find((e) => e.status === 'pending');
          const approvedEx = o.exceptions.find((e) => e.status === 'approved' && !e.consumed_at && e.edit_until && new Date(e.edit_until) > new Date());
          const cats = new Map<string, typeof o.lines>();
          for (const l of o.lines) { const g = cats.get(l.category_name) ?? []; g.push(l); cats.set(l.category_name, g); }
          const total = o.lines.reduce((a, l) => a + l.qty, 0);
          const delivered = o.lines.reduce((a, l) => a + l.qty_delivered, 0);
          return (
            <div className="two-pane">
              <div className="stack">
                <div className="card pad">
                  <div className="split"><StatusBadge s={orderTone(o.status)} /><span className="t-small muted">نسخة {fmtNum(o.revision)}</span></div>
                  <div className="hstack" style={{ gap: 20, marginTop: 12 }}>
                    <div><div className="t-cap faint">الأصناف</div><div className="t-h2 num">{fmtNum(o.lines.length)}</div></div>
                    <div><div className="t-cap faint">الوحدات</div><div className="t-h2 num">{fmtNum(total)}</div></div>
                    {delivered ? <div><div className="t-cap faint">سُلّم</div><div className="t-h2 num" style={{ color: 'var(--success-ink)' }}>{fmtNum(delivered)}</div></div> : null}
                  </div>
                  {o.production_order ? (
                    <div className="t-small muted" style={{ marginTop: 10 }}>
                      {o.production_order.assigned_to_name || o.production_order.assigned_to_user ? <>المسؤول: <b style={{ color: 'var(--ink)' }}>{o.production_order.assigned_to_name ?? o.production_order.assigned_to_user}</b> · </> : null}
                      {o.production_order.expected_ready_at ? <>متوقع الجاهزية: <b style={{ color: 'var(--ink)' }}>{fmtTime(o.production_order.expected_ready_at)}</b></> : 'لم يُحدَّد وقت الجاهزية بعد'}
                    </div>
                  ) : null}
                  {o.note ? <div className="tone-warning t-small" style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10 }}>📝 {o.note}</div> : null}
                  {o.cancel_reason ? <div className="tone-danger t-small" style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10 }}>سبب الإلغاء: {o.cancel_reason}</div> : null}
                </div>

                {isBranch ? (
                  <div className="hstack" style={{ flexWrap: 'wrap' }}>
                    {o.status === 'submitted' || approvedEx ? <Button variant="primary" icon={<Edit3 size={18} />} onClick={() => nav(`/order?w=${o.window_id}`)}>تعديل الطلبية</Button> : null}
                    {o.status === 'locked' && !pendingEx && !approvedEx ? <Button icon={<AlertTriangle size={18} />} onClick={() => requestException(o)}>طلب تعديل (استثناء)</Button> : null}
                    {['submitted', 'locked'].includes(o.status) ? <Button variant="danger-soft" icon={<XCircle size={18} />} onClick={() => cancel(o)}>إلغاء</Button> : null}
                  </div>
                ) : null}
                {pendingEx ? <div className="card pad tone-warning" style={{ borderColor: 'transparent' }}><b>طلب التعديل بانتظار قرار المعمل</b><div className="t-small">«{pendingEx.reason}» · {fmtDateTime(pendingEx.requested_at)}</div></div> : null}
                {approvedEx ? <div className="card pad tone-success" style={{ borderColor: 'transparent' }}><b>وافق المعمل — عدّل قبل {fmtTime(approvedEx.edit_until)}</b>{approvedEx.decision_note ? <div className="t-small">«{approvedEx.decision_note}»</div> : null}</div> : null}

                {[...cats.entries()].map(([c, ls]) => (
                  <div key={c}>
                    <div className="sect-h" style={{ marginTop: 6 }}><h2>{c}</h2><span className="t-small faint num">{fmtNum(ls.reduce((a, l) => a + l.qty, 0))}</span></div>
                    <div className="list">
                      {ls.map((l) => (
                        <div key={l.id} className="row">
                          <div className="grow"><div className="ttl">{l.product_name}</div><div className="sub">{l.note ? <span style={{ color: 'var(--warning-ink)' }}>📝 {l.note}</span> : l.uom_name}</div></div>
                          {l.qty_delivered && l.qty_delivered !== l.qty ? <span className="t-small num" style={{ color: 'var(--warning-ink)' }}>سُلّم {fmtNum(l.qty_delivered)}</span> : null}
                          <b className="num" style={{ fontSize: 17 }}>{fmtNum(l.qty)}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="stack">
                <div className="card pad">
                  <div className="t-h3" style={{ marginBottom: 12 }}>مسار الطلبية</div>
                  {o.status === 'cancelled' ? <Badge tone="danger">ملغاة</Badge> : (
                    <ul className="tl">
                      {FLOW.map((s, i) => (
                        <li key={s} className={i < idx ? 'done' : i === idx ? 'now' : ''}>
                          <span className="d" />
                          <div><div style={{ fontWeight: i === idx ? 600 : 500, color: i > idx ? 'var(--ink-3)' : undefined }}>{orderTone(s).label}{s === 'ready' && o.status === 'partially_delivered' ? ' · تسليم جزئي' : ''}</div>
                            {s === 'submitted' && o.submitted_at ? <div className="t-cap faint">{fmtDateTime(o.submitted_at)}</div> : null}
                            {s === 'delivered' && o.deliveries.length ? <div className="t-cap faint">{fmtDateTime(o.deliveries[o.deliveries.length - 1]?.delivered_at)}</div> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {o.deliveries.length ? (
                  <div>
                    <div className="sect-h"><h2>التسليمات</h2></div>
                    <div className="list">{o.deliveries.map((d) => (
                      <Link key={d.id} to={`/print/delivery/${d.id}`} className="row"><FileSignature size={20} style={{ color: 'var(--success)' }} /><div className="grow"><div className="ttl mono" style={{ textAlign: 'right' }}>{d.number}</div><div className="sub">استلم: {d.received_by_name} · {fmtDateTime(d.delivered_at)}{d.signed ? ' · موقّع' : ''}</div></div><Printer size={18} className="chev" /></Link>
                    ))}</div>
                  </div>
                ) : null}
                {o.exceptions.length ? (
                  <div>
                    <div className="sect-h"><h2>الاستثناءات</h2></div>
                    <div className="list">{o.exceptions.map((e) => <div key={e.id} className="row"><div className="grow"><div className="ttl">«{e.reason}»</div><div className="sub">{fmtDateTime(e.requested_at)}{e.decision_note ? ` · ${e.decision_note}` : ''}</div></div><StatusBadge s={excTone(e.consumed_at ? 'approved' : e.status)} sm /></div>)}</div>
                  </div>
                ) : null}
                {o.revisions.length > 1 ? (
                  <div>
                    <div className="sect-h"><h2>سجل التعديلات</h2></div>
                    <div className="list">{o.revisions.map((r) => <div key={r.revision} className="row"><b className="num" style={{ width: 28 }}>{fmtNum(r.revision)}</b><div className="grow"><div className="ttl t-small">{r.changed_by_name}</div><div className="sub">{fmtDateTime(r.changed_at)}{r.reason?.startsWith('exception') ? ' · عبر استثناء' : ''}</div></div></div>)}</div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        }}
      </Q>
    </Screen>
  );
}
