import { ChevronLeft, PackageCheck } from 'lucide-react';
import { Link } from 'react-router';
import { dayLabel, fmtNum, fmtTime } from '../../lib/format';
import { count } from '../../lib/i18n';
import { useApi } from '../../lib/queries';
import { orderTone } from '../../lib/status';
import type { OrderSummary } from '../../lib/types';
import { Empty, Q, Screen, StatusBadge } from '../../ui/kit';

/** Branch view of what is on its way / ready (the plant records delivery with the signature on its device — E-rules). */
export function ReceiveListScreen() {
  const q = useApi<OrderSummary[]>('/orders', { refetchInterval: 30_000 });
  const rows = (q.data ?? []).filter((o) => ['locked', 'in_production', 'ready', 'partially_delivered'].includes(o.status));
  const done = (q.data ?? []).filter((o) => o.status === 'delivered').slice(0, 5);
  return (
    <Screen title="الاستلام" subtitle="الطلبيات القادمة من المعمل">
      <Q q={q} empty={() => (rows.length || done.length ? null : <Empty icon={<PackageCheck size={40} strokeWidth={1.5} />} title="لا شيء بانتظار الاستلام" text="عند تجهيز طلبيتك في المعمل ستظهر هنا" />)}>
        {() => (
          <div className="stack">
            {rows.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="card pad tap">
                <div className="split"><span className="t-h3">طلبية {dayLabel(o.delivery_date)}</span><StatusBadge s={orderTone(o.status)} /></div>
                <div className="t-small muted" style={{ marginTop: 4 }}>{count(o.line_count, 'item')} · {fmtNum(o.total_qty)} وحدة{o.total_delivered ? ` · استلمت ${fmtNum(o.total_delivered)}` : ''}</div>
                {o.status === 'ready' ? <div className="t-small" style={{ marginTop: 8, fontWeight: 600, color: 'var(--success-ink)' }}>جاهزة — بانتظار التسليم من المعمل. وقّع على جهاز المسلِّم عند الاستلام.</div> : null}
              </Link>
            ))}
            {done.length ? (
              <>
                <div className="sect-h"><h2>استُلمت مؤخراً</h2><Link to="/orders">السجل ›</Link></div>
                <div className="list">{done.map((o) => (
                  <Link key={o.id} to={`/orders/${o.id}`} className="row"><PackageCheck size={20} style={{ color: 'var(--success)' }} /><div className="grow"><div className="ttl">{dayLabel(o.delivery_date)}</div><div className="sub num">{fmtNum(o.total_delivered)} من {fmtNum(o.total_qty)}{o.submitted_at ? ` · أُرسلت ${fmtTime(o.submitted_at)}` : ''}</div></div><ChevronLeft size={18} className="chev" /></Link>
                ))}</div>
              </>
            ) : null}
          </div>
        )}
      </Q>
    </Screen>
  );
}
