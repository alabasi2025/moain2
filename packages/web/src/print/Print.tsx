import './print.css';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import { fmtDateFull, fmtDateTime, fmtMoney, fmtNum, fmtQty, fmtTime, localToday } from '../lib/format';
import { t } from '../lib/i18n';
import { useApi } from '../lib/queries';
import { useMe } from '../lib/session';
import type { Branding, PoPrint, StockRow } from '../lib/types';
import { ListSkeleton } from '../ui/kit';
import { normalizeMatrix } from '../lib/matrix';

function Toolbar({ hint }: { hint: string }) {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  return (
    <div className="toolbar no-print">
      <button className="primary" onClick={() => window.print()}>🖨️ طباعة / حفظ PDF</button>
      <select value={sp.get('large') ? 'large' : 'normal'} onChange={(e) => { if (e.target.value === 'large') sp.set('large', '1'); else sp.delete('large'); setSp(sp, { replace: true }); }}><option value="normal">خط عادي</option><option value="large">خط كبير</option></select>
      <span className="hint">{hint}</span><span className="spacer" />
      <button onClick={() => (history.length > 1 ? nav(-1) : nav('/'))}>إغلاق</button>
    </div>
  );
}
function Header({ b, sub, num, badge, lines }: { b: Branding; sub: string; num: string; badge?: string; lines: React.ReactNode[] }) {
  return (
    <header className="doc-header">
      <div className="brand"><div className="logo">{b.logo_url ? <img src={b.logo_url} alt="" /> : b.company_name.replace(/^(مخابز|مخبز)\s+/, '').replace(/^ال/, '')[0]}</div><div><h1>{b.company_name}</h1><p className="sub">{sub}</p></div></div>
      <div className="doc-id"><div><span className="num">{num}</span>{badge ? <span className="badge">{badge}</span> : null}</div>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
    </header>
  );
}
function Footer({ b, text }: { b: Branding; text: string }) {
  return <footer className="doc-footer"><div /><div className="center"><div className="foot-text">{b.footer_text}</div><div>{text}</div></div><div>نظام مُعين</div></footer>;
}
function Root({ children, hint }: { children: React.ReactNode; hint: string }) {
  const [sp] = useSearchParams();
  return <div className={`print-root ${sp.get('large') ? 'font-large' : ''}`} dir="rtl"><Toolbar hint={hint} />{children}</div>;
}

/* T1 consolidated · T2 by section · T3 by branch */
export function PrintProduction() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const layout = sp.get('layout') ?? 'consolidated';
  const q = useApi<PoPrint>(`/production-orders/${id}/print`);
  if (!q.data) return <div style={{ padding: 20 }}><ListSkeleton /></div>;
  const d = q.data; const m = normalizeMatrix(d.matrix); const b = d.branding;
  const short = (n: string) => n.replace(/^فرع\s+/, '');
  const headLines = [<>تاريخ التسليم: <b>{fmtDateFull(d.po.delivery_date)}</b></>, <>{d.window.name_ar}{d.window.cutoff_time ? ` · تُغلق ${d.window.cutoff_time}` : ''} · نسخة {fmtNum(d.snapshot_version ?? 0)}</>];
  const foot = `${d.po.number} · نسخة ${fmtNum(d.snapshot_version ?? 0)} · طُبع ${fmtDateTime(d.printed_at)} · بواسطة ${d.printed_by}`;
  const meta = (
    <div className="meta-grid">
      <div className="cell"><span className="k">المسؤول عن الطلبية</span>{d.po.assigned_name ? <span className="v">{d.po.assigned_name}</span> : <span className="fill" />}</div>
      <div className="cell"><span className="k">الوقت المتوقع للإتمام</span>{d.po.expected_ready_at ? <span className="v">{fmtTime(d.po.expected_ready_at)}</span> : <span className="fill" />}</div>
      <div className="cell"><span className="k">مشرف الجودة</span><span className="fill" /></div>
    </div>
  );
  const sigs = <div className="signatures">{['مسؤول الإنتاج', 'مشرف الجودة', 'مسؤول التسليم'].map((r) => <div key={r} className="sig"><div className="role">{r}</div><div className="line">الاسم:<span /></div><div className="line">التوقيع:<span /></div></div>)}</div>;
  const notes = m.order_notes.length || m.categories.some((c) => c.products.some((p) => p.notes.length)) ? (
    <div className="notes"><h4>ملاحظات الفروع</h4><ul>{m.order_notes.map((n, i) => <li key={i}><b>{n.branch}:</b> {n.note}</li>)}{m.categories.flatMap((c) => c.products.flatMap((p) => p.notes.map((n, i) => <li key={p.id + i}><b>{n.branch}</b> · {p.name}: {n.note}</li>)))}</ul></div>
  ) : null;

  if (layout === 'branch') {
    return (
      <Root hint="T3 — ورقة تجهيز لكل فرع (A5)">
        {m.branches.map((br, bi) => {
          const items = m.categories.flatMap((c) => c.products.filter((p) => p.by_branch[br.id]));
          const total = items.reduce((a, p) => a + (p.by_branch[br.id] ?? 0), 0);
          return (
            <article key={br.id} className="psheet a5">
              <Header b={b} sub={`${d.plant.name_ar} · ${d.plant.phone ?? ''}`} num={d.po.number} lines={[fmtDateFull(d.po.delivery_date)]} />
              <div className="branch-hero"><div className="name">{br.name}</div><div className="meta">ورقة تجهيز · {fmtNum(bi + 1)} من {fmtNum(m.branches.length)}<br />{fmtNum(items.length)} صنف · {fmtNum(total)} وحدة</div></div>
              <table><thead><tr><th>✓</th><th>الصنف</th><th>الوحدة</th><th>المطلوب</th><th>المُجهَّز</th></tr></thead>
                <tbody>{items.map((p) => { const n = p.notes.find((x) => x.branch_id === br.id); return <tr key={p.id}><td className="check" /><td className="name">{p.name}{n ? <span className="note">{n.note}</span> : null}</td><td className="uom">{p.uom}</td><td className="total">{fmtNum(p.by_branch[br.id])}</td><td className="num" style={{ borderBottom: '1pt solid var(--ink-3)' }} /></tr>; })}
                  <tr className="subtotal"><td colSpan={3}>الإجمالي</td><td className="total">{fmtNum(total)}</td><td /></tr></tbody></table>
              {m.order_notes.filter((n) => n.branch_id === br.id).map((n, i) => <div key={i} className="notes"><h4>ملاحظة الفرع</h4><ul><li>{n.note}</li></ul></div>)}
              <div className="signatures">{['المُجهِّز', 'المُسلِّم', 'المستلم (الفرع)'].map((r) => <div key={r} className="sig"><div className="role">{r}</div><div className="line">الاسم:<span /></div><div className="line">التوقيع:<span /></div></div>)}</div>
              <Footer b={b} text={foot} />
            </article>
          );
        })}
      </Root>
    );
  }
  const table = (cats: typeof m.categories) => cats.map((c) => (
    <section key={c.id} className="section">
      <div className="section-header"><span className="bar" style={{ background: c.color ?? undefined }} /><h3>{c.name}</h3><span className="count">{fmtNum(c.products.length)} صنف · {fmtNum(c.total)}</span></div>
      <table><thead><tr><th>#</th><th>الصنف</th><th>الوحدة</th>{m.branches.map((br) => <th key={br.id}>{short(br.name)}</th>)}<th>الإجمالي</th><th>✓</th></tr></thead>
        <tbody>{c.products.map((p, i) => <tr key={p.id}><td className="idx">{fmtNum(i + 1)}</td><td className="name">{p.name}{p.notes.map((n, k) => <span key={k} className="note">{short(n.branch)}: {n.note}</span>)}</td><td className="uom">{p.uom}</td>{m.branches.map((br) => <td key={br.id} className={`num ${p.by_branch[br.id] ? '' : 'zero'}`}>{p.by_branch[br.id] ? fmtNum(p.by_branch[br.id]) : '—'}</td>)}<td className="total">{fmtNum(p.total)}</td><td className="check" /></tr>)}
          <tr className="subtotal"><td colSpan={3}>إجمالي {c.name}</td>{m.branches.map((br) => <td key={br.id} className="num">{fmtNum(c.by_branch[br.id] ?? 0)}</td>)}<td className="total">{fmtNum(c.total)}</td><td /></tr></tbody></table>
    </section>
  ));
  if (layout === 'section') {
    return (
      <Root hint="T2 — ورقة لكل قسم">
        {m.categories.map((c) => (
          <article key={c.id} className="psheet">
            <Header b={b} sub={d.plant.name_ar} num={d.po.number} badge={t(`poStatus.${d.po.status}`)} lines={headLines} />
            <div className="title-band"><h2>قسم {c.name}</h2><div className="meta">{fmtNum(c.total)} وحدة</div></div>
            {meta}{table([c])}{sigs}<Footer b={b} text={foot} />
          </article>
        ))}
      </Root>
    );
  }
  return (
    <Root hint="T1 — أمر إنتاج مجمّع (A4)">
      <article className="psheet">
        <Header b={b} sub={`${b.address ?? ''} · هاتف ${b.phone ?? ''} · ${d.plant.name_ar}`} num={d.po.number} badge={t(`poStatus.${d.po.status}`)} lines={headLines} />
        <div className="title-band"><h2>أمر إنتاج — مجمّع</h2><div className="meta">المعمل: <b>{d.plant.name_ar}</b> · النافذة: <b>{d.window.name_ar}</b></div></div>
        {meta}
        <div className="stats"><div className="stat"><div className="n">{fmtNum(m.branches.length)}</div><div className="l">فروع</div></div><div className="stat"><div className="n">{fmtNum(m.totals.products)}</div><div className="l">صنف</div></div><div className="stat"><div className="n">{fmtNum(m.totals.units)}</div><div className="l">وحدة إجمالية</div></div><div className="stat"><div className="n">{fmtNum(m.totals.notes)}</div><div className="l">ملاحظات</div></div></div>
        {table(m.categories)}{notes}{sigs}<Footer b={b} text={foot} />
      </article>
    </Root>
  );
}

interface DPrint { number: string; branch_name: string; delivery_date: string; po_number: string | null; received_by_name: string; delivered_by_name: string; delivered_at: string; signature: string | null; lines: { qty_delivered: number; qty_ordered: number; product_name: string; uom_name: string }[]; branding: Branding }
export function PrintDelivery() {
  const { id } = useParams();
  const q = useApi<DPrint>(`/deliveries/${id}`);
  if (!q.data) return <div style={{ padding: 20 }}><ListSkeleton /></div>;
  const d = q.data;
  return (
    <Root hint="إيصال تسليم (A5)">
      <article className="psheet a5">
        <Header b={d.branding} sub={d.branding.address ?? ''} num={d.number} lines={[fmtDateTime(d.delivered_at)]} />
        <div className="branch-hero"><div className="name">{d.branch_name}</div><div className="meta">إيصال تسليم<br />{d.po_number}</div></div>
        <table><thead><tr><th>#</th><th>الصنف</th><th>الوحدة</th><th>المطلوب</th><th>المُسلَّم</th></tr></thead>
          <tbody>{d.lines.map((l, i) => <tr key={i}><td className="idx">{fmtNum(i + 1)}</td><td className="name">{l.product_name}</td><td className="uom">{l.uom_name}</td><td className="num">{fmtNum(l.qty_ordered)}</td><td className="total">{fmtNum(l.qty_delivered)}</td></tr>)}
            <tr className="subtotal"><td colSpan={4}>الإجمالي</td><td className="total">{fmtNum(d.lines.reduce((a, l) => a + l.qty_delivered, 0))}</td></tr></tbody></table>
        <div className="signatures">
          <div className="sig"><div className="role">المُسلِّم</div><div className="line">الاسم: <b>{d.delivered_by_name}</b></div><div className="line">التوقيع:<span /></div></div>
          <div className="sig"><div className="role">المستلم</div><div className="line">الاسم: <b>{d.received_by_name}</b></div>{d.signature ? <img src={d.signature} alt="توقيع" style={{ height: 60, objectFit: 'contain' }} /> : <div className="line">التوقيع:<span /></div>}</div>
        </div>
        <Footer b={d.branding} text={`${d.number} · طُبع ${fmtDateTime(new Date().toISOString())}`} />
      </article>
    </Root>
  );
}

interface VPrint { kind: string; number: string; status: string; voucher_date: string; supplier_name: string | null; issued_to_name: string | null; external_ref: string | null; location_name: string; created_by_name: string; posted_at: string | null; note: string | null; lines: { name_ar: string; code: string; qty: number; uom_name: string; unit_cost_minor?: number }[]; movements: { name_ar: string; qty_after: number }[]; branding: Branding }
export function PrintVoucher() {
  const { id } = useParams();
  const me = useMe();
  const q = useApi<VPrint>(`/vouchers/${id}`);
  if (!q.data) return <div style={{ padding: 20 }}><ListSkeleton /></div>;
  const v = q.data; const c = me.canViewCosts;
  const total = v.lines.reduce((a, l) => a + Math.round((l.unit_cost_minor ?? 0) * Math.abs(l.qty)), 0);
  return (
    <Root hint="T5 — سند مخزني (A5)">
      <article className="psheet a5">
        <Header b={v.branding} sub={v.location_name} num={v.number} badge={t(`voucherStatus.${v.status}`)} lines={[<>التاريخ: <b>{fmtDateFull(v.voucher_date)}</b></>]} />
        <div className="title-band"><h2>سند {t(`voucherKind.${v.kind}`)}</h2><div className="meta">المخزن: <b>{v.location_name}</b></div></div>
        <div className="meta-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="cell"><span className="k">{v.supplier_name ? 'المورد' : 'الساحب'}</span><span className="v">{v.supplier_name ?? v.issued_to_name ?? '—'}</span></div>
          <div className="cell"><span className="k">رقم الفاتورة / المرجع</span><span className="v">{v.external_ref ?? '—'}</span></div>
          <div className="cell"><span className="k">أدخله</span><span className="v">{v.created_by_name}</span></div>
          <div className="cell"><span className="k">وقت الترحيل</span><span className="v">{fmtDateTime(v.posted_at)}</span></div>
        </div>
        <table><thead><tr><th>#</th><th>المادة</th><th>الكود</th><th>الكمية</th><th>الوحدة</th>{c ? <><th>سعر الوحدة</th><th>الإجمالي</th></> : null}</tr></thead>
          <tbody>{v.lines.map((l, i) => <tr key={i}><td className="idx">{fmtNum(i + 1)}</td><td className="name">{l.name_ar}</td><td className="uom">{l.code}</td><td className="num">{fmtQty(l.qty)}</td><td className="uom">{l.uom_name}</td>{c ? <><td className="money">{fmtMoney(l.unit_cost_minor)}</td><td className="money">{fmtMoney(Math.round((l.unit_cost_minor ?? 0) * Math.abs(l.qty)))}</td></> : null}</tr>)}
            {c ? <tr className="subtotal"><td colSpan={6}>الإجمالي</td><td className="money">{fmtMoney(total)}</td></tr> : null}</tbody></table>
        {v.note ? <div className="notes"><h4>ملاحظات</h4><ul><li>{v.note}</li></ul></div> : null}
        <div className="signatures"><div className="sig"><div className="role">أمين المخزن</div><div className="line">الاسم: <b>{v.created_by_name}</b></div><div className="line">التوقيع:<span /></div></div><div className="sig"><div className="role">{v.supplier_name ? 'مندوب المورد' : 'المستلم'}</div><div className="line">الاسم:<span /></div><div className="line">التوقيع:<span /></div></div></div>
        <Footer b={v.branding} text={`هذا السند مسجّل في دفتر المخزون برقم تسلسلي لا يُعاد · طُبع ${fmtDateTime(new Date().toISOString())}`} />
      </article>
    </Root>
  );
}

export function PrintStock() {
  const [sp] = useSearchParams();
  const me = useMe();
  const from = sp.get('from') ?? localToday(), to = sp.get('to') ?? localToday();
  const q = useApi<{ location: { name_ar: string }; rows: StockRow[] }>(`/stock/overview?from=${from}&to=${to}`);
  if (!q.data) return <div style={{ padding: 20 }}><ListSkeleton /></div>;
  const rows = q.data.rows; const c = me.canViewCosts; const b = me.branding;
  const total = rows.reduce((a, r) => a + (r.closing_value_minor ?? 0), 0);
  return (
    <Root hint="T7 — حالة المخزون (A4 أفقي)">
      <article className="psheet landscape">
        <Header b={b} sub={`${q.data.location.name_ar} · تقرير فتري`} num={`STK-${to.slice(0, 7)}`} lines={[<>الفترة: <b>{from} — {to}</b></>, `أُنشئ ${fmtDateTime(new Date().toISOString())} · ${me.user.full_name}`]} />
        <div className="title-band"><h2>حالة المخزون — المواد الخام</h2><div className="meta">طريقة التقييم: <b>متوسط مرجّح متحرك</b></div></div>
        <div className="stats"><div className="stat"><div className="n">{fmtNum(rows.length)}</div><div className="l">مادة</div></div><div className="stat"><div className="n">{fmtNum(rows.filter((r) => r.stock_status === 'low').length)}</div><div className="l">تحت حد الأمان</div></div><div className="stat"><div className="n">{fmtNum(rows.filter((r) => r.stock_status === 'out').length)}</div><div className="l">نفدت</div></div>{c ? <div className="stat"><div className="n">{fmtMoney(total)}</div><div className="l">قيمة المخزون</div></div> : null}</div>
        <table><thead><tr><th>كود المادة</th><th>التصنيف</th><th>اسم المادة الخام</th>{c ? <th>تكلفة الوحدة</th> : null}<th>وحدة القياس</th><th>حد الأمان</th><th>رصيد أول المدة</th><th>إجمالي الوارد</th><th>إجمالي الصادر</th><th>الرصيد المتبقي</th>{c ? <th>تكلفة الرصيد الإجمالية</th> : null}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id}><td className="uom">{r.code}</td><td>{r.category}</td><td className="name" style={r.stock_status !== 'ok' ? { color: r.stock_status === 'out' ? '#A93226' : '#8A6D0B', fontWeight: 700 } : undefined}>{r.name_ar}</td>{c ? <td className="money">{fmtMoney(r.unit_cost_minor)}</td> : null}<td className="uom">{r.uom}</td><td className="num">{fmtQty(r.safety_stock)}</td><td className="num">{fmtQty(r.opening_qty)}</td><td className="num">{fmtQty(r.total_in)}</td><td className="num">{fmtQty(r.total_out)}</td><td className="total">{fmtQty(r.closing_qty)}</td>{c ? <td className="money">{fmtMoney(r.closing_value_minor)}</td> : null}</tr>)}
            {c ? <tr className="subtotal"><td colSpan={10}>إجمالي قيمة المخزون في نهاية الفترة</td><td className="money">{fmtMoney(total)}</td></tr> : null}</tbody></table>
        <Footer b={b} text="الأرصدة مشتقة من دفتر الحركات غير القابل للتعديل" />
      </article>
    </Root>
  );
}
