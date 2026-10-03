import { ChevronLeft, Printer, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { post } from '../../lib/api';
import { fmtDateTime, fmtDay, fmtMoney, fmtQty } from '../../lib/format';
import { t } from '../../lib/i18n';
import { invalidate, useApi } from '../../lib/queries';
import { useMe } from '../../lib/session';
import { voucherTone } from '../../lib/status';
import type { VoucherSummary } from '../../lib/types';
import { Button, Chips, Empty, Q, Screen, StatusBadge, useConfirm, useErrToast, useToast } from '../../ui/kit';

export function VouchersScreen() {
  const [k, setK] = useState('all');
  const q = useApi<VoucherSummary[]>(`/vouchers${k === 'all' ? '' : `?kind=${k}`}`);
  const me = useMe();
  return (
    <Screen title="السندات" subtitle="وارد · صارف · تسوية · هالك · تحويل">
      <div className="stack" style={{ gap: 10 }}>
        <Chips value={k} onChange={setK} items={[{ v: 'all', label: 'الكل' }, ...['receipt', 'issue', 'adjustment', 'waste', 'transfer', 'opening'].map((v) => ({ v, label: t(`voucherKindShort.${v}`) }))]} />
        <Q q={q} empty={(d) => (d.length ? null : <Empty title="لا سندات" text="سجّل أول حركة من «حركة جديدة»" />)}>
          {(d) => (
            <div className="list">
              {d.map((v) => (
                <Link key={v.id} to={`/vouchers/${v.id}`} className="row">
                  <div className="grow">
                    <div className="ttl"><span className="mono">{v.number}</span> · {t(`voucherKindShort.${v.kind}`)}</div>
                    <div className="sub">{v.materials} · {v.supplier_name ?? v.issued_to_name ?? v.created_by_name} · {fmtDay(v.voucher_date)}</div>
                  </div>
                  {me.canViewCosts && v.total_minor !== undefined ? <span className="num t-small">{fmtMoney(v.total_minor)}</span> : null}
                  <StatusBadge s={voucherTone(v.status)} sm />
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

interface VDetail { id: string; kind: string; number: string; status: string; voucher_date: string; external_ref: string | null; issued_to_name: string | null; supplier_name: string | null; location_name: string; created_by_name: string; posted_at: string | null; cancel_reason: string | null; note: string | null; lines: { id: string; name_ar: string; code: string; qty: number; uom_name: string; unit_cost_minor?: number }[] }
export function VoucherDetailScreen() {
  const { id } = useParams();
  const nav = useNavigate();
  const me = useMe();
  const q = useApi<VDetail>(`/vouchers/${id}`);
  const confirm = useConfirm();
  const toast = useToast();
  const err = useErrToast();
  const cancel = async () => {
    const reason = await confirm({ title: 'إلغاء السند؟', text: 'تُنشأ حركات عكسية بنفس التكلفة الأصلية ويعود الرصيد كما كان. لا يُحذف شيء من الدفتر.', input: { label: 'السبب', min: 2 }, danger: true, confirm: 'إلغاء السند' });
    if (!reason) return;
    try { await post(`/vouchers/${id}/cancel`, { reason }); toast('أُلغي السند وعُكست الحركات'); await invalidate('/vouchers', '/raw-materials', '/stock', '/movements'); void q.refetch(); } catch (e) { err(e); }
  };
  return (
    <Screen title={q.data ? <span className="mono">{q.data.number}</span> : 'السند'} subtitle={q.data ? t(`voucherKind.${q.data.kind}`) : undefined} back
      actions={<Button size="sm" icon={<Printer size={17} />} onClick={() => nav(`/print/voucher/${id}`)}>طباعة</Button>}>
      <Q q={q}>
        {(v) => (
          <div className="content-narrow stack">
            <div className="card pad">
              <div className="kv"><span className="k">الحالة</span><span className="v"><StatusBadge s={voucherTone(v.status)} sm /></span></div>
              <div className="kv"><span className="k">التاريخ</span><span className="v">{fmtDay(v.voucher_date, 'long')}</span></div>
              {v.supplier_name ? <div className="kv"><span className="k">المورد</span><span className="v">{v.supplier_name}</span></div> : null}
              {v.issued_to_name ? <div className="kv"><span className="k">الساحب</span><span className="v">{v.issued_to_name}</span></div> : null}
              {v.external_ref ? <div className="kv"><span className="k">رقم الفاتورة / السند</span><span className="v mono">{v.external_ref}</span></div> : null}
              <div className="kv"><span className="k">أدخله</span><span className="v">{v.created_by_name} · {fmtDateTime(v.posted_at)}</span></div>
              {v.cancel_reason ? <div className="kv"><span className="k">سبب الإلغاء</span><span className="v" style={{ color: 'var(--danger-ink)' }}>{v.cancel_reason}</span></div> : null}
            </div>
            <div className="list">
              {v.lines.map((l) => (
                <div key={l.id} className="row"><div className="grow"><div className="ttl">{l.name_ar}</div><div className="sub mono">{l.code}</div></div>
                  <div style={{ textAlign: 'end' }}><b className="num">{fmtQty(l.qty)} {l.uom_name}</b>{me.canViewCosts && l.unit_cost_minor ? <div className="t-cap faint num">{fmtMoney(l.unit_cost_minor)} × = {fmtMoney(Math.round(l.unit_cost_minor * Math.abs(l.qty)))}</div> : null}</div></div>
              ))}
            </div>
            {v.status === 'posted' && me.roles.some((r) => ['storekeeper', 'owner', 'admin'].includes(r)) ? <Button variant="danger-soft" icon={<XCircle size={18} />} onClick={cancel}>إلغاء السند (عكس الحركات)</Button> : null}
          </div>
        )}
      </Q>
    </Screen>
  );
}
