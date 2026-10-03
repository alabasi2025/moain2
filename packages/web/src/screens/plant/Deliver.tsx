import { ulid } from '@moain/shared';
import { AlertTriangle, Check, ChevronLeft, FileSignature, Printer, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { post } from '../../lib/api';
import { dayLabel, fmtDateTime, fmtDay, fmtNum } from '../../lib/format';
import { haptic } from '../../lib/haptics';
import { count } from '../../lib/i18n';
import { invalidate, useApi } from '../../lib/queries';
import { orderTone } from '../../lib/status';
import type { OrderDetail, OrderSummary } from '../../lib/types';
import { ActionBar, Button, Chips, Empty, Field, NumberPad, Q, Screen, SignaturePad, StatusBadge, Switch, useErrToast, useToast } from '../../ui/kit';

export function DeliverListScreen() {
  const q = useApi<OrderSummary[]>('/deliveries/pending', { refetchInterval: 20_000 });
  const [f, setF] = useState<'ready' | 'all'>('ready');
  const rows = (q.data ?? []).filter((o) => (f === 'ready' ? o.status !== 'in_production' : true));
  return (
    <Screen title="التسليم للفروع" subtitle="اختر الفرع ثم سجّل الكميات والتوقيع" actions={<Link to="/deliveries" className="btn ghost sm">السجل</Link>}>
      <div className="stack" style={{ gap: 10 }}>
        <Chips value={f} onChange={setF} items={[{ v: 'ready', label: 'الجاهزة', n: (q.data ?? []).filter((o) => o.status !== 'in_production').length }, { v: 'all', label: 'الكل (مع قيد الإنتاج)' }]} />
        <Q q={q} empty={() => (rows.length ? null : <Empty icon={<Truck size={40} strokeWidth={1.5} />} title="لا طلبيات جاهزة للتسليم" text="بعد «اكتمل الإنتاج» تظهر طلبيات الفروع هنا" />)}>
          {() => (
            <div className="list">
              {rows.map((o) => (
                <Link key={o.id} to={`/deliver/${o.id}`} className="row" style={{ minHeight: 72 }}>
                  <div className="avatar" style={{ borderRadius: 12 }}><Truck size={20} /></div>
                  <div className="grow">
                    <div className="ttl">{o.branch_name}</div>
                    <div className="sub">{dayLabel(o.delivery_date)} · {count(o.line_count, 'item')} · {fmtNum(o.total_qty)} وحدة{o.total_delivered ? ` · سُلّم ${fmtNum(o.total_delivered)}` : ''}</div>
                  </div>
                  <StatusBadge s={orderTone(o.status)} sm />
                  <ChevronLeft size={18} className="chev" />
                </Link>
              ))}
            </div>
          )}
        </Q>
      </div>
    </Screen>
  );
}

/* ═══ W6 — delivery with signature ═══ */
export function DeliverScreen() {
  const { orderId } = useParams();
  const nav = useNavigate();
  const q = useApi<OrderDetail>(`/orders/${orderId}`);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [sig, setSig] = useState<string | null>(null);
  const [noSig, setNoSig] = useState(false);
  const [pad, setPad] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const err = useErrToast();
  const o = q.data;
  const remaining = useMemo(() => Object.fromEntries((o?.lines ?? []).map((l) => [l.id, Math.max(0, l.qty - l.qty_delivered)])), [o]);
  useEffect(() => { if (o) { setQty(remaining); const last = o.deliveries[o.deliveries.length - 1]; if (last && !name) setName(last.received_by_name); } }, [o]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!o) return <Screen title="تسليم" back="/deliver"><Q q={q}>{() => null}</Q></Screen>;
  const lines = o.lines.filter((l) => (remaining[l.id] ?? 0) > 0);
  const short = lines.filter((l) => (qty[l.id] ?? 0) < (remaining[l.id] ?? 0));
  const total = lines.reduce((a, l) => a + (qty[l.id] ?? 0), 0);
  const ready = name.trim().length >= 2 && (sig || noSig) && total > 0;
  const padLine = o.lines.find((l) => l.id === pad);

  const submit = async () => {
    setBusy(true);
    try {
      const r = await post<{ delivery: { id: string; number: string }; order_status: string }>('/deliveries', {
        client_uuid: ulid(), order_id: o.id, received_by_name: name.trim(),
        lines: lines.map((l) => ({ order_line_id: l.id, qty_delivered: qty[l.id] ?? 0 })).filter((l) => l.qty_delivered > 0),
        signature_png_base64: sig,
      });
      haptic.ok();
      await invalidate('/deliveries', '/orders', '/production-orders', '/dashboard');
      toast(r.order_status === 'delivered' ? `تم التسليم ✓ ${r.delivery.number}` : `تسليم جزئي ✓ ${r.delivery.number}`, { action: { label: 'طباعة الإيصال', on: () => nav(`/print/delivery/${r.delivery.id}`) } });
      nav('/deliver', { replace: true });
    } catch (e) { haptic.err(); err(e); } finally { setBusy(false); }
  };

  return (
    <Screen title={`تسليم · ${o.branch.name_ar}`} subtitle={`طلبية ${fmtDay(o.delivery_date)}${o.production_order ? ` · ${o.production_order.number}` : ''}`} back="/deliver"
      footer={<ActionBar summary={<><span>{short.length ? <span style={{ color: 'var(--warning-ink)' }}>جزئي — نقص في {count(short.length, 'item')}</span> : 'تسليم كامل'}</span><span><b>{fmtNum(total)}</b> وحدة</span></>}>
        <Button variant="primary" size="lg" block disabled={!ready} loading={busy} onClick={submit} icon={<Check size={20} />}>تأكيد التسليم</Button>
      </ActionBar>}>
      <div className="content-narrow stack">
        {!['ready', 'partially_delivered', 'in_production'].includes(o.status) ? <div className="tone-danger t-small" style={{ padding: '10px 14px', borderRadius: 12 }}>هذه الطلبية {orderTone(o.status).label} — لا يمكن تسليمها</div> : null}
        <div className="t-small muted">الكميات مملوءة بالمطلوب — عدّل إن نقص شيء</div>
        <div className="list">
          {lines.map((l) => {
            const v = qty[l.id] ?? 0, need = remaining[l.id] ?? 0;
            return (
              <div key={l.id} className="row" style={v < need ? { background: 'var(--warning-bg)' } : undefined}>
                <div className="grow"><div className="ttl">{l.product_name}</div><div className="sub">مطلوب {fmtNum(need)} {l.uom_name}{l.qty_delivered ? ` (سُلّم سابقاً ${fmtNum(l.qty_delivered)})` : ''}</div></div>
                <button className="inp num-in" style={{ width: 84, height: 46, cursor: 'pointer' }} onClick={() => setPad(l.id)}>{fmtNum(v)}</button>
              </div>
            );
          })}
        </div>
        {short.length ? <div className="hstack t-small" style={{ color: 'var(--warning-ink)' }}><AlertTriangle size={16} /> {short.map((l) => `نقص ${fmtNum((remaining[l.id] ?? 0) - (qty[l.id] ?? 0))} ${l.product_name}`).join('، ')} — سيُسجَّل جزئياً</div> : null}
        <Field label="اسم المستلم من الفرع">
          <input className="inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" list="recv-names" />
          <datalist id="recv-names">{[...new Set(o.deliveries.map((d) => d.received_by_name))].map((n) => <option key={n} value={n} />)}</datalist>
        </Field>
        {!noSig ? <SignaturePad onChange={setSig} /> : null}
        <div className="split"><span className="t-small muted">تسليم بدون توقيع (يُسجَّل في السجل)</span><Switch on={noSig} onChange={(v) => { setNoSig(v); if (v) setSig(null); }} label="بدون توقيع" /></div>
      </div>
      <NumberPad open={!!padLine} onClose={() => setPad(null)} title={padLine?.product_name ?? ''} unit={padLine?.uom_name} initial={pad ? qty[pad] ?? 0 : 0}
        onDone={(v) => { if (pad) setQty({ ...qty, [pad]: v }); setPad(null); }} />
    </Screen>
  );
}

interface DeliveryRow { id: string; number: string; order_id: string; received_by_name: string; delivered_at: string; delivered_by_name: string; branch_name: string; delivery_date: string; qty: number; signed: number }
export function DeliveriesScreen() {
  const q = useApi<DeliveryRow[]>('/deliveries');
  return (
    <Screen title="سجل التسليمات" back>
      <Q q={q} empty={(d) => (d.length ? null : <Empty title="لا تسليمات بعد" />)}>
        {(d) => (
          <div className="list">
            {d.map((x) => (
              <Link key={x.id} to={`/print/delivery/${x.id}`} className="row">
                <FileSignature size={20} style={{ color: x.signed ? 'var(--success)' : 'var(--ink-3)' }} />
                <div className="grow"><div className="ttl">{x.branch_name} · <span className="mono">{x.number}</span></div><div className="sub">{fmtNum(x.qty)} وحدة · استلم {x.received_by_name} · {fmtDateTime(x.delivered_at)}</div></div>
                <Printer size={18} className="chev" />
              </Link>
            ))}
          </div>
        )}
      </Q>
    </Screen>
  );
}
