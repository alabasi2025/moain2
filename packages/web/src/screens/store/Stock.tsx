import { ArrowDownUp, Boxes, Download, Library, Printer, Receipt } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { addDaysStr, fmtMoney, fmtQty, localToday } from '../../lib/format';
import { t } from '../../lib/i18n';
import { useApi } from '../../lib/queries';
import { useMe } from '../../lib/session';
import { stockTone } from '../../lib/status';
import type { MovementRow, StockRow } from '../../lib/types';
import { Button, Chips, Empty, Field, Q, Screen, StatusBadge } from '../../ui/kit';
import { MovementList } from '../Home';
import { exportXlsx } from '../../lib/excel';

export function StockHubScreen() {
  const items = [
    { to: '/stock/overview', icon: <Boxes size={22} />, t: 'حالة المخزون', s: 'الجدول ذو الأعمدة الـ 11 + تصدير Excel' },
    { to: '/movements', icon: <ArrowDownUp size={22} />, t: 'دفتر الحركة اليومية', s: 'كل الوارد والصارف بالتاريخ والطالب ورقم السند' },
    { to: '/materials', icon: <Library size={22} />, t: 'المواد الخام', s: 'الأرصدة وبطاقة كل مادة' },
    { to: '/vouchers', icon: <Receipt size={22} />, t: 'السندات', s: 'سندات الوارد والصرف والتسوية' },
    { to: '/movement/new', icon: <ArrowDownUp size={22} />, t: 'حركة جديدة', s: 'وارد / صارف سريع' },
  ];
  return (
    <Screen title="المخزون">
      <div className="content-narrow stack">
        {items.map((i) => <Link key={i.to} to={i.to} className="bigchoice" style={{ textDecoration: 'none', color: 'inherit' }}><span className="ic tone-brand">{i.icon}</span><div><div className="t" style={{ fontSize: 17 }}>{i.t}</div><div className="s">{i.s}</div></div></Link>)}
      </div>
    </Screen>
  );
}

function usePeriod() {
  const today = localToday();
  const [from, setFrom] = useState(today.slice(0, 8) + '01');
  const [to, setTo] = useState(today);
  return { from, to, setFrom, setTo };
}
function PeriodFields({ p }: { p: ReturnType<typeof usePeriod> }) {
  return (
    <div className="hstack">
      <Field label="من"><input className="inp" type="date" value={p.from} onChange={(e) => p.setFrom(e.target.value)} style={{ height: 44 }} /></Field>
      <Field label="إلى"><input className="inp" type="date" value={p.to} onChange={(e) => p.setTo(e.target.value)} style={{ height: 44 }} /></Field>
    </div>
  );
}

/* The client's 11-column material status table */
export function StockOverviewScreen() {
  const me = useMe();
  const nav = useNavigate();
  const p = usePeriod();
  const [f, setF] = useState<'all' | 'low' | 'out'>('all');
  const q = useApi<{ from: string; to: string; location: { name_ar: string }; rows: StockRow[] }>(`/stock/overview?from=${p.from}&to=${p.to}`);
  const rows = (q.data?.rows ?? []).filter((r) => f === 'all' || r.stock_status === f || (f === 'low' && r.stock_status === 'out'));
  const c = me.canViewCosts;
  const total = rows.reduce((a, r) => a + (r.closing_value_minor ?? 0), 0);
  const xls = () => exportXlsx(`حالة-المخزون-${p.from}-${p.to}.xlsx`, 'حالة المخزون',
    ['كود المادة', 'التصنيف', 'اسم المادة الخام', ...(c ? ['تكلفة الوحدة'] : []), 'وحدة القياس', 'حد الأمان', 'رصيد أول المدة', 'إجمالي الوارد', 'إجمالي الصادر', 'الرصيد المتبقي', ...(c ? ['تكلفة الرصيد الإجمالية'] : []), 'الحالة'],
    rows.map((r) => [r.code, r.category ?? '', r.name_ar, ...(c ? [(r.unit_cost_minor ?? 0)] : []), r.uom, r.safety_stock, r.opening_qty, r.total_in, r.total_out, r.closing_qty, ...(c ? [(r.closing_value_minor ?? 0)] : []), t(`stockStatus.${r.stock_status}`)]));
  return (
    <Screen title="حالة المخزون" subtitle={q.data?.location.name_ar} back actions={<><Button size="sm" icon={<Download size={16} />} onClick={xls} disabled={!rows.length}>Excel</Button><Button size="sm" icon={<Printer size={16} />} onClick={() => nav(`/print/stock?from=${p.from}&to=${p.to}`)}>طباعة</Button></>}>
      <div className="stack" style={{ gap: 10 }}>
        <PeriodFields p={p} />
        <Chips value={f} onChange={setF} items={[{ v: 'all', label: 'الكل' }, { v: 'low', label: 'تحت الحد' }, { v: 'out', label: 'نفدت' }]} />
        <Q q={q} empty={() => (rows.length ? null : <Empty title="لا مواد" />)}>
          {() => (
            <div className="dt-wrap" style={{ maxHeight: '68dvh' }}>
              <table className="dt">
                <thead><tr><th>الكود</th><th>التصنيف</th><th className="sticky-1" style={{ background: 'var(--surface-2)' }}>المادة</th>{c ? <th className="n">تكلفة الوحدة</th> : null}<th>الوحدة</th><th className="n">حد الأمان</th><th className="n">أول المدة</th><th className="n">الوارد</th><th className="n">الصادر</th><th className="n">المتبقي</th>{c ? <th className="n">القيمة</th> : null}<th>الحالة</th></tr></thead>
                <tbody>{rows.map((r) => (
                  <tr key={r.id} className={r.stock_status === 'ok' ? '' : r.stock_status} onClick={() => nav(`/materials/${r.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="mono">{r.code}</td><td>{r.category}</td><td className="sticky-1" style={{ fontWeight: 500, background: 'var(--surface)' }}>{r.name_ar}</td>{c ? <td className="n">{fmtMoney(r.unit_cost_minor)}</td> : null}<td>{r.uom}</td><td className="n">{fmtQty(r.safety_stock)}</td><td className="n">{fmtQty(r.opening_qty)}</td><td className="n" style={{ color: 'var(--success-ink)' }}>{fmtQty(r.total_in)}</td><td className="n" style={{ color: 'var(--danger-ink)' }}>{fmtQty(r.total_out)}</td><td className="n"><b>{fmtQty(r.closing_qty)}</b></td>{c ? <td className="n">{fmtMoney(r.closing_value_minor)}</td> : null}<td><StatusBadge s={stockTone(r.stock_status)} sm /></td>
                  </tr>))}</tbody>
                {c ? <tfoot><tr><td colSpan={10}>إجمالي قيمة المخزون</td><td className="n">{fmtMoney(total)}</td><td /></tr></tfoot> : null}
              </table>
            </div>
          )}
        </Q>
      </div>
    </Screen>
  );
}

/* The client's daily movement log */
export function MovementsLogScreen() {
  const [day, setDay] = useState(localToday());
  const [dir, setDir] = useState<'all' | 'in' | 'out'>('all');
  const q = useApi<{ rows: MovementRow[] }>(`/movements?from=${day}&to=${day}${dir === 'all' ? '' : `&dir=${dir}`}`);
  const xls = () => exportXlsx(`حركة-${day}.xlsx`, 'الحركة اليومية', ['الوقت', 'الكود', 'المادة', 'النوع', 'الكمية', 'الوحدة', 'الطالب / المورد', 'رقم السند', 'رقم الفاتورة/المرجع', 'الرصيد بعد', 'المُدخل'],
    (q.data?.rows ?? []).map((r) => [new Date(r.occurred_at).toLocaleTimeString('ar'), r.code, r.name_ar, r.qty > 0 ? 'وارد' : 'صادر', Math.abs(r.qty), r.uom_name, r.supplier_name ?? r.issued_to_name ?? '', r.voucher_number ?? '', r.external_ref ?? '', r.qty_after, r.actor_name]));
  return (
    <Screen title="دفتر الحركة اليومية" back actions={<Button size="sm" icon={<Download size={16} />} onClick={xls}>Excel</Button>}>
      <div className="content-narrow stack" style={{ gap: 10 }}>
        <div className="hstack">
          <Button size="sm" onClick={() => setDay(addDaysStr(day, -1))}>‹ السابق</Button>
          <input className="inp" type="date" value={day} onChange={(e) => setDay(e.target.value)} style={{ height: 40, flex: 1 }} />
          <Button size="sm" onClick={() => setDay(addDaysStr(day, 1))} disabled={day >= localToday()}>التالي ›</Button>
        </div>
        <Chips value={dir} onChange={setDir} items={[{ v: 'all', label: 'الكل' }, { v: 'in', label: 'وارد' }, { v: 'out', label: 'صادر' }]} />
        <Q q={q} empty={(d) => (d.rows.length ? null : <Empty title="لا حركات في هذا اليوم" />)}>{(d) => <MovementList rows={d.rows} />}</Q>
      </div>
    </Screen>
  );
}
