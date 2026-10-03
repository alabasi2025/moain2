import { useState } from 'react';
import { Download } from 'lucide-react';
import { addDaysStr, fmtDay, fmtNum, localToday } from '../../lib/format';
import { useApi } from '../../lib/queries';
import { Button, Empty, Q, Screen, Segmented } from '../../ui/kit';
import { exportXlsx } from '../../lib/excel';

interface Rep { rows: { key_id: string; label: string; category?: string; uom?: string; orders: number; qty_ordered: number; qty_delivered: number }[]; daily: { day: string; qty: number }[] }
export function ReportsScreen() {
  const [g, setG] = useState<'product' | 'branch'>('product');
  const to = addDaysStr(localToday(), 1), from = addDaysStr(localToday(), -7);
  const q = useApi<Rep>(`/reports/demand?from=${from}&to=${to}&group_by=${g}`);
  const mx = Math.max(1, ...(q.data?.daily ?? []).map((d) => d.qty));
  return (
    <Screen title="التقارير" subtitle="الطلب والتسليم — آخر 7 أيام" actions={<Button size="sm" icon={<Download size={16} />} onClick={() => q.data && exportXlsx('تقرير-الطلب.xlsx', 'الطلب', [g === 'product' ? 'الصنف' : 'الفرع', 'الطلبيات', 'المطلوب', 'المُسلَّم'], q.data.rows.map((r) => [r.label, r.orders, r.qty_ordered, r.qty_delivered]))}>Excel</Button>}>
      <div className="content-narrow stack">
        <Segmented value={g} onChange={setG} items={[{ v: 'product', label: 'حسب الصنف' }, { v: 'branch', label: 'حسب الفرع' }]} />
        <Q q={q} empty={(d) => (d.rows.length ? null : <Empty title="لا بيانات في الفترة" />)}>
          {(d) => (<>
            <div className="card pad"><div className="t-h3">الوحدات المطلوبة يومياً</div><div className="spark" style={{ height: 90, marginTop: 10 }}>{d.daily.map((x) => <i key={x.day} title={`${fmtDay(x.day)}: ${x.qty}`} style={{ height: `${(x.qty / mx) * 100}%` }} />)}</div></div>
            <div className="list">{d.rows.map((r) => (
              <div key={r.key_id} className="row"><div className="grow"><div className="ttl">{r.label}</div><div className="sub">{fmtNum(r.orders)} طلبية{r.category ? ` · ${r.category}` : ''}</div></div>
                <div style={{ textAlign: 'end' }}><b className="num">{fmtNum(r.qty_ordered)}</b><div className="t-cap faint num">سُلّم {fmtNum(r.qty_delivered)}</div></div></div>))}</div>
          </>)}
        </Q>
      </div>
    </Screen>
  );
}
