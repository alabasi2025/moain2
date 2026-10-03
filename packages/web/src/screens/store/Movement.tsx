import { ulid } from '@moain/shared';
import { ArrowDown, ArrowLeftRight, ArrowUp, Check, ChevronDown, Plus, Scale, Trash2, Undo2, X, Flame } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { post } from '../../lib/api';
import { currency, fmtMoney, fmtNum, fmtQty, localToday, minorToMoney } from '../../lib/format';
import { haptic } from '../../lib/haptics';
import { count, t } from '../../lib/i18n';
import { invalidate, useApi } from '../../lib/queries';
import { useMe } from '../../lib/session';
import { stockTone } from '../../lib/status';
import type { Location, Material } from '../../lib/types';
import { ActionBar, Badge, Button, Field, IconButton, ListSkeleton, NumberPad, Screen, SearchBar, Sheet, StatusBadge, useDebounced, useErrToast, useToast } from '../../ui/kit';

type Kind = 'receipt' | 'issue' | 'adjustment' | 'waste' | 'transfer' | 'return_in' | 'return_out' | 'opening';
interface Line { m: Material; qty: number; cost: number | null; note: string }
interface Sugg { recent: string[]; last_costs?: { raw_material_id: string; unit_cost_minor: number; supplier_id: string | null }[]; requesters: string[] }
interface Supplier { id: string; name: string }

const KIND_UI: Record<Kind, { icon: React.ReactNode; tone: string; sub: string }> = {
  receipt: { icon: <ArrowDown size={28} />, tone: 'tone-success', sub: 'توريد من مورد بفاتورة' },
  issue: { icon: <ArrowUp size={28} />, tone: 'tone-danger', sub: 'صرف لقسم أو ساحب بسند' },
  adjustment: { icon: <Scale size={22} />, tone: 'tone-info', sub: 'تصحيح رصيد بعد جرد' },
  waste: { icon: <Flame size={22} />, tone: 'tone-warning', sub: 'تالف أو منتهي' },
  transfer: { icon: <ArrowLeftRight size={22} />, tone: 'tone-violet', sub: 'بين مخزنين' },
  return_out: { icon: <Undo2 size={22} />, tone: 'tone-muted', sub: 'إرجاع للمورد' },
  return_in: { icon: <Undo2 size={22} />, tone: 'tone-muted', sub: 'مرتجع من قسم' },
  opening: { icon: <Plus size={22} />, tone: 'tone-brand', sub: 'أول تشغيل للنظام' },
};
const INBOUND: Kind[] = ['receipt', 'return_in', 'opening'];

/* ═══ W4 — quick movement: type → material → qty ═══ */
export function MovementNewScreen() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const me = useMe();
  const [kind, setKind] = useState<Kind | null>((sp.get('k') as Kind | null) ?? null);
  const [step, setStep] = useState<1 | 2 | 3>(sp.get('k') ? 2 : 1);
  const [lines, setLines] = useState<Line[]>([]);
  const [cur, setCur] = useState<Line | null>(null);
  const [more, setMore] = useState(false);
  // header fields
  const [supplierId, setSupplierId] = useState<string>('');
  const [ref, setRef] = useState('');
  const [requester, setRequester] = useState('');
  const [purpose, setPurpose] = useState<'production' | 'cleaning' | 'other'>('production');
  const [toLoc, setToLoc] = useState('');
  const [note, setNote] = useState('');
  const [adjSign, setAdjSign] = useState<1 | -1>(-1);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const err = useErrToast();

  const mq = useApi<Material[]>('/raw-materials');
  const sq = useApi<Sugg>('/inventory/suggestions');
  const supq = useApi<Supplier[]>('/suppliers');
  const warehouses = me.locations.filter((l: Location) => l.kind === 'warehouse');
  const preMat = sp.get('m');
  useEffect(() => {
    if (preMat && mq.data && kind && !cur && !lines.length) { const m = mq.data.find((x) => x.id === preMat); if (m) pick(m); }
  }, [preMat, mq.data, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const inbound = kind ? INBOUND.includes(kind) : false;
  const lastCost = (id: string) => sq.data?.last_costs?.find((c) => c.raw_material_id === id);
  const pick = (m: Material) => {
    const lc = lastCost(m.id);
    if (kind === 'receipt' && lc?.supplier_id && !supplierId) setSupplierId(lc.supplier_id);
    setCur({ m, qty: 0, cost: inbound && me.canViewCosts ? minorToMoney(lc?.unit_cost_minor ?? m.default_unit_cost_minor ?? m.unit_cost_minor ?? 0) || null : null, note: '' });
    setStep(3);
  };
  const commitCur = () => { if (!cur || cur.qty <= 0) return false; setLines((ls) => [...ls.filter((l) => l.m.id !== cur.m.id), cur]); setCur(null); return true; };

  const submit = async () => {
    const all = cur && cur.qty > 0 ? [...lines.filter((l) => l.m.id !== cur.m.id), cur] : lines;
    if (!kind || !all.length) return;
    setBusy(true);
    try {
      const r = await post<{ voucher: { id: string; number: string }; movements: { qty_after: number; name_ar?: string }[]; alerts: { name: string; qty_after: number; safety_stock: number }[]; warnings?: string[] }>('/vouchers/quick', {
        client_uuid: ulid(), kind,
        supplier_id: kind === 'receipt' || kind === 'return_out' ? supplierId || null : null,
        external_ref: ref.trim() || null,
        issued_to_name: kind === 'issue' || kind === 'return_in' ? requester.trim() || null : null,
        purpose: kind === 'issue' ? purpose : null,
        to_location_id: kind === 'transfer' ? toLoc : null,
        note: note.trim() || null,
        lines: all.map((l) => ({ raw_material_id: l.m.id, qty: kind === 'adjustment' ? adjSign * l.qty : l.qty, unit_cost: inbound && l.cost !== null ? l.cost : null })),
      });
      haptic.ok();
      await invalidate('/raw-materials', '/vouchers', '/stock', '/movements', '/dashboard', '/inventory');
      const first = all[0];
      const bal = first ? r.movements[0]?.qty_after : undefined;
      toast(`${r.voucher.number} ✓${first && bal !== undefined && all.length === 1 ? ` · رصيد ${first.m.name_ar} الآن ${fmtQty(bal)} ${first.m.uom_name}` : ` · ${count(all.length, 'material')}`}`, { action: { label: 'طباعة', on: () => nav(`/print/voucher/${r.voucher.id}`) } });
      if (r.alerts?.length) setTimeout(() => toast(`تنبيه: ${r.alerts.map((a) => `${a.name} ${fmtQty(a.qty_after)} (الحد ${fmtQty(a.safety_stock)})`).join('، ')}`, { err: true }), 3600);
      nav(-1);
    } catch (e) { haptic.err(); err(e); } finally { setBusy(false); }
  };

  const title = !kind ? 'حركة جديدة' : step === 2 ? `${t(`voucherKindShort.${kind}`)} · اختر المادة` : cur ? `${t(`voucherKindShort.${kind}`)} · ${cur.m.name_ar}` : `${t(`voucherKindShort.${kind}`)} · مراجعة`;
  const back = () => { if (step === 3 && cur) { setCur(null); setStep(lines.length ? 3 : 2); } else if (step === 3) setStep(2); else if (step === 2 && !sp.get('k')) { setStep(1); setKind(null); } else nav(-1); };
  const headerOk = kind === 'issue' ? requester.trim().length >= 2 : kind === 'transfer' ? !!toLoc : true;
  const allLines = cur && cur.qty > 0 ? [...lines.filter((l) => l.m.id !== cur.m.id), cur] : lines;
  const over = cur && !inbound && kind !== 'adjustment' ? cur.qty > cur.m.qty_on_hand && !me.settings.allow_negative_stock : false;
  const total = allLines.reduce((a, l) => a + (l.cost ?? 0) * l.qty, 0);

  return (
    <Screen title={title} back={undefined} leading={<IconButton label="رجوع" onClick={back}>{step === 1 ? <X size={22} /> : <ChevronDown size={24} style={{ transform: 'rotate(-90deg)' }} />}</IconButton>}
      footer={step === 3 ? (
        <ActionBar summary={allLines.length ? <><span><b>{count(allLines.length, 'material')}</b></span>{inbound && me.canViewCosts ? <span><b>{fmtNum(total, 0)}</b> {currency()}</span> : null}</> : undefined}>
          <div className="hstack">
            <Button size="lg" disabled={!cur || cur.qty <= 0 || over} onClick={() => { if (commitCur()) setStep(2); }} icon={<Plus size={18} />}>مادة أخرى</Button>
            <Button variant="primary" size="lg" block loading={busy} disabled={!allLines.length || !headerOk || over} onClick={submit} icon={<Check size={20} />}>ترحيل</Button>
          </div>
        </ActionBar>
      ) : undefined}>
      {step === 1 ? (
        <div className="content-narrow stack" style={{ gap: 12 }}>
          {(['receipt', 'issue'] as Kind[]).map((k) => (
            <button key={k} className="bigchoice" style={{ minHeight: 112 }} onClick={() => { setKind(k); setStep(2); }}>
              <span className={`ic ${KIND_UI[k].tone}`}>{KIND_UI[k].icon}</span>
              <div><div className="t">{k === 'receipt' ? 'وارد' : 'صارف'}</div><div className="s">{KIND_UI[k].sub}</div></div>
            </button>
          ))}
          <button className="btn ghost" onClick={() => setMore(!more)}>المزيد <ChevronDown size={18} style={{ transform: more ? 'rotate(180deg)' : undefined }} /></button>
          {more ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['adjustment', 'waste', 'transfer', 'return_out', 'return_in', 'opening'] as Kind[]).map((k) => (
                <button key={k} className="bigchoice" style={{ padding: 14, gap: 10, flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => { setKind(k); setStep(2); }}>
                  <span className={`ic ${KIND_UI[k].tone}`} style={{ width: 40, height: 40, borderRadius: 12 }}>{KIND_UI[k].icon}</span>
                  <div><div style={{ fontWeight: 700 }}>{t(`voucherKind.${k}`)}</div><div className="t-cap muted">{KIND_UI[k].sub}</div></div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : step === 2 ? (
        <MaterialPicker mats={mq.data} loading={mq.isLoading} recent={sq.data?.recent ?? []} picked={lines.map((l) => l.m.id)} onPick={pick} />
      ) : (
        <div className="content-narrow stack">
          {lines.length ? (
            <div className="list">
              {lines.map((l) => (
                <div key={l.m.id} className="row">
                  <div className="grow"><div className="ttl">{l.m.name_ar}</div><div className="sub num">{kind === 'adjustment' ? (adjSign > 0 ? '+' : '−') : ''}{fmtQty(l.qty)} {l.m.uom_name}{l.cost !== null && me.canViewCosts ? ` × ${fmtNum(l.cost)}` : ''}</div></div>
                  <IconButton label="تعديل" onClick={() => { setCur(l); setLines(lines.filter((x) => x.m.id !== l.m.id)); }}><Scale size={18} /></IconButton>
                  <IconButton label="حذف" onClick={() => setLines(lines.filter((x) => x.m.id !== l.m.id))}><Trash2 size={18} /></IconButton>
                </div>
              ))}
            </div>
          ) : null}
          {cur ? <QtyEntry line={cur} onChange={setCur} kind={kind as Kind} adjSign={adjSign} setAdjSign={setAdjSign} canCost={me.canViewCosts} over={!!over} /> : <Button onClick={() => setStep(2)} icon={<Plus size={18} />}>إضافة مادة</Button>}

          <div className="card pad stack" style={{ gap: 12 }}>
            {kind === 'receipt' || kind === 'return_out' ? (
              <>
                <Field label="المورد">
                  <select className="inp" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                    <option value="">— بدون —</option>
                    {(supq.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label={kind === 'receipt' ? 'رقم الفاتورة' : 'رقم المرجع'}><input className="inp" value={ref} onChange={(e) => setRef(e.target.value)} dir="ltr" style={{ textAlign: 'right' }} placeholder="INV-…" /></Field>
              </>
            ) : null}
            {kind === 'issue' || kind === 'return_in' ? (
              <>
                <Field label={kind === 'issue' ? 'الساحب / الجهة الطالبة' : 'المُرجِع'}>
                  <input className="inp" value={requester} onChange={(e) => setRequester(e.target.value)} list="reqs" placeholder="مثال: قسم المعجنات" />
                  <datalist id="reqs">{(sq.data?.requesters ?? []).map((r) => <option key={r} value={r} />)}</datalist>
                </Field>
                {sq.data?.requesters.length ? <div className="chips" style={{ flexWrap: 'wrap', marginTop: -4 }}>{sq.data.requesters.slice(0, 5).map((r) => <button key={r} className={`chip ${requester === r ? 'on' : ''}`} onClick={() => setRequester(r)}>{r}</button>)}</div> : null}
                {kind === 'issue' ? (
                  <Field label="الغرض">
                    <div className="seg">{(['production', 'cleaning', 'other'] as const).map((p) => <button key={p} className={purpose === p ? 'on' : ''} onClick={() => setPurpose(p)}>{t(`purpose.${p}`)}</button>)}</div>
                  </Field>
                ) : null}
                <Field label="رقم سند الصرف الورقي (اختياري)"><input className="inp" value={ref} onChange={(e) => setRef(e.target.value)} dir="ltr" style={{ textAlign: 'right' }} /></Field>
              </>
            ) : null}
            {kind === 'transfer' ? (
              <Field label="إلى مخزن">
                <select className="inp" value={toLoc} onChange={(e) => setToLoc(e.target.value)}>
                  <option value="">— اختر —</option>
                  {me.locations.filter((l) => l.kind !== 'branch' && l.id !== warehouses[0]?.id).map((l) => <option key={l.id} value={l.id}>{l.name_ar}</option>)}
                </select>
              </Field>
            ) : null}
            <Field label="ملاحظة (اختياري)"><input className="inp" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
            <div className="t-cap faint">التاريخ: اليوم {localToday()} · المخزن: {warehouses[0]?.name_ar}</div>
          </div>
        </div>
      )}
    </Screen>
  );
}

function MaterialPicker({ mats, loading, recent, picked, onPick }: { mats?: Material[]; loading: boolean; recent: string[]; picked: string[]; onPick: (m: Material) => void }) {
  const [s, setS] = useState('');
  const ds = useDebounced(s);
  const list = (mats ?? []).filter((m) => m.is_active && !picked.includes(m.id));
  const filtered = ds ? list.filter((m) => m.name_ar.includes(ds.trim()) || m.code.toLowerCase().includes(ds.trim().toLowerCase())) : list;
  const rec = recent.map((id) => list.find((m) => m.id === id)).filter((m): m is Material => !!m);
  const groups = useMemo(() => { const g = new Map<string, Material[]>(); for (const m of filtered) { const k = m.category_name ?? 'أخرى'; g.set(k, [...(g.get(k) ?? []), m]); } return g; }, [filtered]);
  const Row = ({ m }: { m: Material }) => (
    <button className="row" onClick={() => onPick(m)}>
      <div className="grow"><div className="ttl">{m.name_ar}</div><div className="sub"><span className="mono">{m.code}</span> · رصيد {fmtQty(m.qty_on_hand)} {m.uom_name}</div></div>
      {m.stock_status !== 'ok' ? <StatusBadge s={stockTone(m.stock_status)} sm /> : null}
    </button>
  );
  return (
    <div className="content-narrow stack">
      <SearchBar value={s} onChange={setS} placeholder="ابحث بالاسم أو الكود…" />
      {loading ? <ListSkeleton /> : (
        <>
          {!ds && rec.length ? <><div className="sect-h" style={{ marginTop: 4 }}><h2>آخر المستخدمة</h2></div><div className="list">{rec.map((m) => <Row key={m.id} m={m} />)}</div></> : null}
          {[...groups.entries()].map(([g, ms]) => (
            <div key={g}><div className="sect-h" style={{ marginTop: 6 }}><h2>{g}</h2></div><div className="list">{ms.map((m) => <Row key={m.id} m={m} />)}</div></div>
          ))}
          {!filtered.length ? <div className="empty-dash">لا مادة تطابق «{ds}»</div> : null}
        </>
      )}
    </div>
  );
}

function QtyEntry({ line, onChange, kind, adjSign, setAdjSign, canCost, over }: { line: Line; onChange: (l: Line) => void; kind: Kind; adjSign: 1 | -1; setAdjSign: (v: 1 | -1) => void; canCost: boolean; over: boolean }) {
  const [pad, setPad] = useState<'qty' | 'cost' | null>(line.qty ? null : 'qty');
  const inbound = INBOUND.includes(kind);
  const after = line.m.qty_on_hand + (inbound ? line.qty : kind === 'adjustment' ? adjSign * line.qty : -line.qty);
  return (
    <div className="card pad">
      <div className="split"><span className="t-small muted">الرصيد الحالي</span><b className="num">{fmtQty(line.m.qty_on_hand)} {line.m.uom_name}</b></div>
      {kind === 'adjustment' ? <div className="seg" style={{ marginTop: 10 }}><button className={adjSign === 1 ? 'on' : ''} onClick={() => setAdjSign(1)}>زيادة +</button><button className={adjSign === -1 ? 'on' : ''} onClick={() => setAdjSign(-1)}>نقص −</button></div> : null}
      <button onClick={() => setPad('qty')} style={{ width: '100%', background: 'var(--surface-2)', border: over ? '2px solid var(--danger)' : '2px solid transparent', borderRadius: 16, padding: '14px 0', marginTop: 12, cursor: 'pointer' }}>
        <div className="num" style={{ fontSize: 40, fontWeight: 600, lineHeight: '48px', color: line.qty ? undefined : 'var(--ink-3)' }}>{fmtQty(line.qty)}</div>
        <div className="muted t-small">{line.m.uom_name} · اضغط للإدخال</div>
      </button>
      {over ? <div className="t-small" style={{ color: 'var(--danger-ink)', marginTop: 6 }}>المتاح {fmtQty(line.m.qty_on_hand)} {line.m.uom_name} فقط</div> : line.qty ? <div className="t-small muted" style={{ marginTop: 6 }}>الرصيد بعد الحركة: <b className="num" style={{ color: 'var(--ink)' }}>{fmtQty(after)}</b> {after < line.m.safety_stock ? <Badge tone="warning" sm>تحت الحد</Badge> : null}</div> : null}
      {inbound && canCost ? (
        <button className="kv" style={{ width: '100%', background: 'none', border: 0, borderTop: '1px solid var(--border)', marginTop: 10, cursor: 'pointer' }} onClick={() => setPad('cost')}>
          <span className="k">سعر الوحدة ({currency()})</span><span className="v num">{line.cost !== null ? fmtNum(line.cost) : 'أدخل السعر'}{line.cost && line.qty ? <span className="faint t-small"> · إجمالي {fmtNum(line.cost * line.qty, 0)}</span> : null}</span>
        </button>
      ) : !inbound && canCost && line.m.unit_cost_minor ? <div className="t-cap faint" style={{ marginTop: 8 }}>يُصرف بمتوسط التكلفة {fmtMoney(line.m.unit_cost_minor)} {currency()}</div> : null}
      <NumberPad open={pad === 'qty'} onClose={() => setPad(null)} title={`الكمية · ${line.m.name_ar}`} unit={line.m.uom_name} decimals={line.m.uom_decimals} initial={line.qty}
        max={!inbound && kind !== 'adjustment' ? line.m.qty_on_hand : undefined}
        onDone={(v) => { onChange({ ...line, qty: v }); setPad(inbound && canCost && line.cost === null ? 'cost' : null); }} />
      <NumberPad open={pad === 'cost'} onClose={() => setPad(null)} title={`سعر الوحدة · ${line.m.name_ar}`} unit={currency()} decimals={2} initial={line.cost ?? 0}
        onDone={(v) => { onChange({ ...line, cost: v }); setPad(null); }} />
    </div>
  );
}
export { Sheet };
