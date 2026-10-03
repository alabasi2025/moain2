import { ArrowDown, ArrowUp, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { fmtDateTime, fmtMoney, fmtQty } from '../../lib/format';
import { t } from '../../lib/i18n';
import { useApi } from '../../lib/queries';
import { useMe } from '../../lib/session';
import { stockTone } from '../../lib/status';
import type { LedgerRow, Material } from '../../lib/types';
import { ActionBar, Button, Chips, Empty, Q, Screen, SearchBar, StatusBadge, useDebounced } from '../../ui/kit';

export function MaterialsScreen() {
  const [sp] = useSearchParams();
  const q = useApi<Material[]>('/raw-materials');
  const [f, setF] = useState<'all' | 'alert' | 'out'>((sp.get('f') as 'alert') ?? 'all');
  const [s, setS] = useState('');
  const ds = useDebounced(s);
  const rows = (q.data ?? []).filter((m) => (f === 'all' || (f === 'alert' ? m.stock_status !== 'ok' : m.stock_status === 'out')) && (!ds || m.name_ar.includes(ds) || m.code.toLowerCase().includes(ds.toLowerCase())));
  return (
    <Screen title="المواد الخام" subtitle={q.data ? `${q.data.length} مادة` : undefined} actions={<Link to="/stock/overview" className="btn ghost sm">حالة المخزون</Link>}>
      <div className="stack" style={{ gap: 10 }}>
        <SearchBar value={s} onChange={setS} placeholder="ابحث بالاسم أو الكود…" />
        <Chips value={f} onChange={setF} items={[{ v: 'all', label: 'الكل' }, { v: 'alert', label: 'تحت الحد', n: (q.data ?? []).filter((m) => m.stock_status !== 'ok').length }, { v: 'out', label: 'نفدت' }]} />
        <Q q={q} empty={() => (rows.length ? null : <Empty title="لا مواد" />)}>
          {() => (
            <div className="list">
              {rows.map((m) => (
                <Link key={m.id} to={`/materials/${m.id}`} className="row">
                  <div className="grow"><div className="ttl">{m.name_ar}</div><div className="sub"><span className="mono">{m.code}</span> · {m.category_name} · الحد {fmtQty(m.safety_stock)}</div></div>
                  <div style={{ textAlign: 'end' }}><b className="num">{fmtQty(m.qty_on_hand)}</b> <span className="t-cap faint">{m.uom_name}</span><div><StatusBadge s={stockTone(m.stock_status)} sm /></div></div>
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

/* ═══ W5 — material card + ledger ═══ */
export function MaterialCardScreen() {
  const { id } = useParams();
  const me = useMe();
  const nav = useNavigate();
  const q = useApi<Material & { ledger: LedgerRow[] }>(`/raw-materials/${id}`);
  const canPost = me.roles.some((r) => ['storekeeper', 'owner', 'admin'].includes(r));
  return (
    <Screen title={q.data ? `${q.data.name_ar}` : 'المادة'} subtitle={q.data?.code} back
      footer={canPost ? <ActionBar><div className="hstack"><Button size="lg" block variant="danger-soft" icon={<ArrowUp size={19} />} onClick={() => nav(`/movement/new?k=issue&m=${id}`)}>صارف</Button><Button size="lg" block variant="primary" icon={<ArrowDown size={19} />} onClick={() => nav(`/movement/new?k=receipt&m=${id}`)}>وارد</Button></div></ActionBar> : undefined}>
      <Q q={q}>
        {(m) => {
          const spark = [...m.ledger].reverse().slice(-24).map((r) => r.qty_after);
          const mx = Math.max(1, ...spark);
          return (
            <div className="content-narrow stack">
              <div className="card pad" style={{ textAlign: 'center' }}>
                <div className="t-display num" style={{ fontSize: 36 }}>{fmtQty(m.qty_on_hand)} <span className="t-h2 muted">{m.uom_name}</span></div>
                <div style={{ marginTop: 6 }}><StatusBadge s={stockTone(m.stock_status)} /> <span className="t-small muted">الحد {fmtQty(m.safety_stock)}</span></div>
                {me.canViewCosts ? <div className="hstack" style={{ justifyContent: 'center', gap: 24, marginTop: 12 }}><span className="t-small muted">تكلفة الوحدة <b className="num" style={{ color: 'var(--ink)' }}>{fmtMoney(m.unit_cost_minor)}</b></span><span className="t-small muted">القيمة <b className="num" style={{ color: 'var(--ink)' }}>{fmtMoney(m.stock_value_minor)}</b></span></div> : null}
              </div>
              {spark.length > 1 ? <div className="spark">{spark.map((v, i) => <i key={i} className={i === spark.length - 1 ? 'hi' : ''} style={{ height: `${(v / mx) * 100}%` }} />)}</div> : null}
              <div className="sect-h"><h2>دفتر الحركات</h2></div>
              {m.ledger.length ? (
                <div className="list">
                  {m.ledger.map((r) => (
                    <Link key={r.id} to={r.voucher_id ? `/vouchers/${r.voucher_id}` : '#'} className="row">
                      {r.qty > 0 ? <ArrowDown size={20} style={{ color: 'var(--success)' }} /> : <ArrowUp size={20} style={{ color: 'var(--danger)' }} />}
                      <div className="grow">
                        <div className="ttl num">{r.qty > 0 ? '+' : '−'}{fmtQty(Math.abs(r.qty))}{me.canViewCosts && r.unit_cost_minor ? <span className="t-small muted"> · {fmtMoney(r.unit_cost_minor)}</span> : null}</div>
                        <div className="sub">{t(`reason.${r.reason}`)} {r.voucher_number ?? ''} · {r.supplier_name ?? r.issued_to_name ?? r.actor_name} · {fmtDateTime(r.occurred_at)}</div>
                      </div>
                      <b className="num">{fmtQty(r.qty_after)}</b>
                    </Link>
                  ))}
                </div>
              ) : <div className="empty-dash">لا حركات بعد — سجّل رصيداً افتتاحياً أو وارداً</div>}
            </div>
          );
        }}
      </Q>
    </Screen>
  );
}
