import { ulid } from '@moain/shared';
import { Check, ChevronDown, ClipboardCopy, Lock, Minus, MoreVertical, Plus, Send, StickyNote, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ApiError, get, post } from '../../lib/api';
import { dayLabel, fmtDay, fmtDuration, fmtNum, fmtTime } from '../../lib/format';
import { haptic } from '../../lib/haptics';
import { count } from '../../lib/i18n';
import { drafts, enqueue, useOutbox, type OrderDraft } from '../../lib/outbox';
import { invalidate, useApi, useCatalog } from '../../lib/queries';
import { useMyBranch, useSession } from '../../lib/session';
import { orderTone } from '../../lib/status';
import type { Catalog, OrderDetail, OrderWindow, Product } from '../../lib/types';
import { ActionBar, Badge, Button, Chips, Empty, ErrorState, IconButton, ListSkeleton, NumberPad, Screen, SearchBar, Sheet, StatusBadge, useConfirm, useDebounced, useErrToast, useToast } from '../../ui/kit';

interface Current { cycle: OrderWindow['cycle']; window: OrderWindow; order: OrderDetail | null }
type Lines = Record<string, { qty: number; note?: string | null }>;

/** Shared state for /order and /order/review — kept in module scope so review sees the same draft. */
function useOrderContext() {
  const [sp] = useSearchParams();
  const { branch, branches } = useMyBranch();
  const wq = useApi<OrderWindow[]>(branch ? `/windows?branch_id=${branch.id}` : null);
  const windowId = sp.get('w') ?? wq.data?.find((w) => w.kind === 'regular' && w.is_active)?.id ?? null;
  const cq = useApi<Current>(branch && windowId ? `/orders/current?branch_id=${branch.id}&window_id=${windowId}` : null, { refetchInterval: 60_000 });
  return { branch, branches, windows: wq.data ?? [], windowId, cq, wq };
}

function linesFromOrder(o: OrderDetail | null): Lines {
  const l: Lines = {};
  for (const x of o?.lines ?? []) l[x.product_id] = { qty: x.qty, note: x.note };
  return l;
}

function useDraft(branchId: string | undefined, cur: Current | undefined) {
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  useEffect(() => {
    if (!branchId || !cur) return;
    const local = drafts.load(branchId, cur.window.id, cur.cycle.deliveryDate);
    const serverRev = cur.order?.revision ?? null;
    // a local draft wins only if it was based on the current server revision (or there is no server order)
    if (local && (local.baseRevision === serverRev || (serverRev === null))) setDraft(local);
    else setDraft({ branchId, windowId: cur.window.id, deliveryDate: cur.cycle.deliveryDate, lines: linesFromOrder(cur.order), note: cur.order?.note ?? '', updatedAt: new Date().toISOString(), baseRevision: serverRev });
  }, [branchId, cur?.window.id, cur?.cycle.deliveryDate, cur?.order?.revision]); // eslint-disable-line react-hooks/exhaustive-deps
  const update = useCallback((fn: (d: OrderDraft) => OrderDraft) => {
    setDraft((d) => { if (!d) return d; const n = { ...fn(d), updatedAt: new Date().toISOString() }; drafts.save(n); return n; });
  }, []);
  return { draft, update };
}

function isDirty(d: OrderDraft | null, o: OrderDetail | null): boolean {
  if (!d) return false;
  const server = linesFromOrder(o);
  const keys = new Set([...Object.keys(server), ...Object.keys(d.lines)]);
  for (const k of keys) {
    const a = server[k]?.qty ?? 0, b = d.lines[k]?.qty ?? 0;
    if (a !== b || (server[k]?.note ?? '') !== (d.lines[k]?.note ?? '')) return true;
  }
  return (o?.note ?? '') !== (d.note ?? '');
}

function editable(cur: Current | undefined): { ok: boolean; why?: string; viaException?: boolean } {
  if (!cur) return { ok: false };
  const st = cur.order?.status;
  if (st && !['submitted', 'cancelled', 'draft'].includes(st)) {
    const ex = cur.order?.exceptions.find((e) => e.status === 'approved' && !e.consumed_at && e.edit_until && new Date(e.edit_until) > new Date());
    if (ex) return { ok: true, viaException: true };
    return { ok: false, why: st === 'locked' ? 'أُقفلت الطلبية — اطلب استثناء من المعمل للتعديل' : 'الطلبية في الإنتاج ولا يمكن تعديلها' };
  }
  if (cur.window.kind === 'regular' && cur.cycle.closesInMinutes !== null && cur.cycle.closesInMinutes <= 0) return { ok: false, why: 'أُغلقت نافذة الطلب' };
  return { ok: true };
}

/* ═══ W2 ═══ */
export function OrderEntryScreen() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const ctx = useOrderContext();
  const cat = useCatalog();
  const { draft, update } = useDraft(ctx.branch?.id, ctx.cq.data);
  const [query, setQuery] = useState('');
  const dq = useDebounced(query, 150);
  const [filter, setFilter] = useState<string>('all');
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [pad, setPad] = useState<Product | null>(null);
  const [noteFor, setNoteFor] = useState<Product | null>(null);
  const [menu, setMenu] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();
  const errToast = useErrToast();
  const cur = ctx.cq.data;
  const ed = editable(cur);

  // ?copy=1 → offer to copy last order
  const copied = useRef(false);
  const copyLast = useCallback(async () => {
    if (!ctx.branch || !cur) return;
    try {
      const src = await get<{ delivery_date: string; lines: { product_id: string; qty: number; note: string | null }[] } | null>(`/orders-copy-source?branch_id=${ctx.branch.id}&window_id=${cur.window.id}&before=${cur.cycle.deliveryDate}`);
      if (!src) { toast('لا توجد طلبية سابقة للنسخ', { err: true }); return; }
      update((d) => ({ ...d, lines: Object.fromEntries(src.lines.map((l) => [l.product_id, { qty: l.qty, note: l.note }])) }));
      haptic.ok();
      toast(`نُسخت طلبية ${fmtDay(src.delivery_date)} · ${count(src.lines.length, 'item')}`);
    } catch (e) { errToast(e); }
  }, [ctx.branch, cur, update, toast, errToast]);
  useEffect(() => {
    if (sp.get('copy') && draft && !copied.current) { copied.current = true; sp.delete('copy'); setSp(sp, { replace: true }); void copyLast(); }
  }, [sp, draft, copyLast, setSp]);

  const products = useMemo(() => activeProducts(cat.data, ctx.branch?.id), [cat.data, ctx.branch?.id]);
  const cats = useMemo(() => (cat.data?.categories ?? []).filter((c) => c.is_active), [cat.data]);
  const lines = draft?.lines ?? {};
  const selected = Object.entries(lines).filter(([, l]) => l.qty > 0);
  const totalUnits = selected.reduce((a, [, l]) => a + l.qty, 0);

  const setQty = (p: Product, q: number) => {
    if (!ed.ok) return;
    const v = Math.max(0, Math.round(q * 10 ** p.uom_decimals) / 10 ** p.uom_decimals);
    update((d) => { const n = { ...d.lines }; if (v <= 0 && !n[p.id]?.note) delete n[p.id]; else n[p.id] = { ...n[p.id], qty: v }; return { ...d, lines: n }; });
    setFlash(p.id); setTimeout(() => setFlash((f) => (f === p.id ? null : f)), 220);
  };

  if (!ctx.branch) return <Screen title="طلبيتي" back="/"><Empty title="لا يوجد فرع مرتبط بحسابك" text="اطلب من المسؤول ربط حسابك بفرع" /></Screen>;
  const loading = ctx.cq.isLoading || cat.isLoading || ctx.wq.isLoading || !draft;
  const err = ctx.cq.error ?? cat.error;

  const shown = products.filter((p) => {
    if (dq && !p.name_ar.includes(dq.trim()) && !p.code.toLowerCase().includes(dq.trim().toLowerCase())) return false;
    if (filter === 'selected') return (lines[p.id]?.qty ?? 0) > 0;
    if (filter !== 'all') return p.category_id === filter;
    return true;
  });
  const flat = shown; // order for “next” on the numpad

  const title = cur ? (cur.window.kind === 'urgent' ? 'طلب عاجل' : `طلبية ${dayLabel(cur.cycle.deliveryDate)}`) + ` · ${fmtDay(cur.cycle.deliveryDate)}` : 'طلبيتي';
  const dirty = isDirty(draft, cur?.order ?? null);
  const sub = !cur ? '' : !ed.ok ? (ed.why ?? '') : `${cur.order ? `${orderTone(cur.order.status).label}${dirty ? ' · تعديلات غير مُرسلة' : ' ✓'}` : selected.length ? 'محفوظ على الجهاز' : 'مسودة جديدة'}${cur.cycle.closesAt && cur.window.kind === 'regular' ? ` · تُغلق ${fmtTime(cur.cycle.closesAt)}` : ''}`;

  return (
    <Screen
      title={title}
      subtitle={sub}
      back="/"
      actions={<IconButton label="خيارات" onClick={() => setMenu(true)}><MoreVertical size={22} /></IconButton>}
      noPad
      footer={
        <ActionBar summary={<><span>{selected.length ? <b>{count(selected.length, 'item')}</b> : 'لم تختر أصنافاً بعد'}</span>{selected.length ? <span><b>{fmtNum(totalUnits)}</b> وحدة</span> : null}</>}>
          {ed.ok ? (
            <Button variant="primary" size="lg" block disabled={!selected.length || (!dirty && !!cur?.order && cur.order.status !== 'cancelled')} onClick={() => nav('/order/review' + (sp.get('w') ? `?w=${sp.get('w')}` : ''))} icon={<Send size={19} className="flip-rtl" />}>
              {cur?.order && cur.order.status !== 'cancelled' ? (dirty ? 'مراجعة وإرسال التعديل' : 'لا تعديلات جديدة') : 'مراجعة وإرسال'}
            </Button>
          ) : (
            <Button size="lg" block onClick={() => cur?.order && nav(`/orders/${cur.order.id}`)} icon={<Lock size={18} />}>عرض الطلبية وطلب استثناء</Button>
          )}
        </ActionBar>
      }
    >
      {ctx.branches.length > 1 ? <BranchSwitcher /> : null}
      <div style={{ padding: '10px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 8 }}>
        <SearchBar value={query} onChange={setQuery} placeholder="ابحث عن صنف…" />
        <Chips value={filter} onChange={setFilter} items={[{ v: 'all', label: 'الكل' }, { v: 'selected', label: 'المختارة', n: selected.length }, ...cats.map((c) => ({ v: c.id, label: c.name_ar }))]} />
      </div>
      {ed.viaException ? <div className="tone-success t-small" style={{ margin: '0 16px 8px', padding: '10px 14px', borderRadius: 12 }}>وافق المعمل على تعديل طلبيتك — أرسل التعديل قبل انتهاء المهلة</div> : null}
      {!ed.ok && ed.why ? <div className="tone-violet t-small" style={{ margin: '0 16px 8px', padding: '10px 14px', borderRadius: 12, display: 'flex', gap: 8, alignItems: 'center' }}><Lock size={16} />{ed.why}</div> : null}
      {err ? <ErrorState error={err} onRetry={() => { void ctx.cq.refetch(); void cat.refetch(); }} /> : loading ? <div style={{ padding: 16 }}><ListSkeleton rows={8} /></div> : !products.length ? <Empty title="لا أصناف متاحة لهذا الفرع" /> : (
        <div style={{ paddingBottom: 24 }}>
          {cats.map((c) => {
            const ps = shown.filter((p) => p.category_id === c.id);
            if (!ps.length) return null;
            const sel = ps.filter((p) => (lines[p.id]?.qty ?? 0) > 0);
            const units = sel.reduce((a, p) => a + (lines[p.id]?.qty ?? 0), 0);
            const isClosed = closed[c.id] ?? false;
            return (
              <section key={c.id} style={{ marginBottom: 8 }}>
                <button className={`acc-h ${isClosed ? 'closed' : ''}`} onClick={() => setClosed({ ...closed, [c.id]: !isClosed })} aria-expanded={!isClosed}>
                  <span className="bar" style={{ background: c.color ?? 'var(--brand-fill)' }} />
                  <span className="nm">{c.name_ar}</span>
                  <span className="ct">{sel.length ? `${count(sel.length, 'item')} · ${fmtNum(units)}` : `${fmtNum(ps.length)} متاح`}</span>
                  <ChevronDown size={20} />
                </button>
                {!isClosed ? (
                  <div className="list" style={{ borderRadius: 0, borderInline: 0 }}>
                    {ps.map((p) => {
                      const l = lines[p.id];
                      const q = l?.qty ?? 0;
                      return (
                        <div key={p.id} className={`prow ${q ? '' : 'zero'} ${flash === p.id ? 'flash' : ''}`}>
                          <span className={`tick ${q ? '' : 'off'}`}>{q ? <Check size={13} strokeWidth={3} /> : null}</span>
                          <div style={{ flex: 1, minWidth: 0 }} onClick={() => ed.ok && setNoteFor(p)} onContextMenu={(e) => { e.preventDefault(); if (ed.ok) setNoteFor(p); }}>
                            <div className="pname">{p.name_ar}</div>
                            <div className="pmeta">{p.uom_name}{l?.note ? <span className="note"><StickyNote size={12} style={{ verticalAlign: -1 }} /> {l.note}</span> : null}</div>
                          </div>
                          <div className="stepper" aria-label={`${p.name_ar}، الكمية ${q}`}>
                            <button aria-label="إنقاص" onClick={() => setQty(p, q - 1)} disabled={!ed.ok || q <= 0} style={q <= 0 ? { opacity: 0.35 } : undefined}><Minus size={20} /></button>
                            <button className={`val ${q ? '' : 'z'}`} onClick={() => ed.ok && setPad(p)} aria-label="إدخال الكمية">{fmtNum(q)}</button>
                            <HoldButton onStep={(n) => setQty(p, (lines[p.id]?.qty ?? 0) + n)} disabled={!ed.ok} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
          {!shown.length ? <Empty title="لا نتائج" text={`لا يوجد صنف يطابق «${dq}»`} /> : null}
        </div>
      )}

      <NumberPad open={!!pad} onClose={() => setPad(null)} title={pad?.name_ar ?? ''} unit={pad?.uom_name} decimals={pad?.uom_decimals ?? 0} initial={pad ? lines[pad.id]?.qty ?? 0 : 0}
        onDone={(v) => { if (pad) setQty(pad, v); setPad(null); }}
        onNext={(v) => { if (!pad) return; setQty(pad, v); const i = flat.findIndex((x) => x.id === pad.id); setPad(flat[i + 1] ?? null); }} />
      <NoteSheet product={noteFor} value={noteFor ? lines[noteFor.id]?.note ?? '' : ''} onClose={() => setNoteFor(null)}
        onSave={(note) => { if (!noteFor) return; update((d) => ({ ...d, lines: { ...d.lines, [noteFor.id]: { qty: d.lines[noteFor.id]?.qty ?? 0, note: note || null } } })); setNoteFor(null); }} />
      <Sheet open={menu} onClose={() => setMenu(false)} title="خيارات الطلبية">
        <div className="list">
          <button className="row" disabled={!ed.ok} onClick={() => { setMenu(false); void copyLast(); }}><ClipboardCopy size={20} /><div className="grow"><div className="ttl">نسخ آخر طلبية</div><div className="sub">تُملأ الكميات ويمكنك التعديل</div></div></button>
          <button className="row" disabled={!ed.ok || !selected.length} onClick={async () => { setMenu(false); if (await confirm({ title: 'تصفير كل الكميات؟', danger: true, confirm: 'تصفير' })) update((d) => ({ ...d, lines: {} })); }}><Trash2 size={20} /><div className="grow"><div className="ttl">تصفير الكميات</div></div></button>
          {cur?.order ? <button className="row" onClick={() => { setMenu(false); nav(`/orders/${cur.order?.id}`); }}><Check size={20} /><div className="grow"><div className="ttl">تفاصيل الطلبية المُرسلة</div><div className="sub">الحالة والسجل والاستثناءات</div></div></button> : null}
          {ctx.windows.filter((w) => w.is_active).map((w) => (
            <button key={w.id} className="row" onClick={() => { setMenu(false); nav(`/order?w=${w.id}`, { replace: true }); }}>
              <span style={{ width: 20 }}>{w.id === ctx.windowId ? <Check size={18} /> : null}</span>
              <div className="grow"><div className="ttl">{w.name_ar}</div><div className="sub">{w.kind === 'urgent' ? 'بدون وقت إغلاق' : `تُغلق ${w.cutoff_time} · التسليم بعد ${fmtNum(w.delivery_offset_days)} يوم`}</div></div>
            </button>
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}

function BranchSwitcher() {
  const { branch, branches } = useMyBranch();
  const set = useSession((s) => s.setActiveLocation);
  return (
    <div style={{ padding: '8px 16px 0' }}>
      <select className="inp" style={{ height: 44 }} value={branch?.id} onChange={(e) => set(e.target.value)} aria-label="الفرع">
        {branches.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
      </select>
    </div>
  );
}

/** “+” with long-press acceleration (1,1,1,2,2,5,5,10…) */
function HoldButton({ onStep, disabled }: { onStep: (n: number) => void; disabled?: boolean }) {
  const timer = useRef<number | undefined>(undefined);
  const n = useRef(0);
  const held = useRef(false);
  const steps = [1, 1, 1, 2, 2, 5, 5, 10];
  const stop = () => { window.clearTimeout(timer.current); timer.current = undefined; };
  const tick = () => { held.current = true; onStep(steps[Math.min(n.current, steps.length - 1)] ?? 10); n.current++; timer.current = window.setTimeout(tick, n.current < 4 ? 260 : 140); };
  return (
    <button className="plus" aria-label="زيادة" disabled={disabled}
      onPointerDown={() => { n.current = 0; held.current = false; timer.current = window.setTimeout(tick, 420); }}
      onPointerUp={() => { stop(); if (!held.current) onStep(1); }}
      onPointerLeave={stop} onPointerCancel={stop} onContextMenu={(e) => e.preventDefault()}>
      <Plus size={20} />
    </button>
  );
}

function NoteSheet({ product, value, onClose, onSave }: { product: Product | null; value: string; onClose: () => void; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value, product]);
  const quick = ['بدون سمسم', 'تغليف خاص', 'حجم صغير', 'التسليم مبكراً', 'بدون سكر'];
  return (
    <Sheet open={!!product} onClose={onClose} title={`ملاحظة · ${product?.name_ar ?? ''}`} footer={<><Button block onClick={() => onSave('')} icon={<X size={18} />}>حذف الملاحظة</Button><Button block variant="primary" onClick={() => onSave(v.trim())}>حفظ</Button></>}>
      <textarea className="inp" value={v} onChange={(e) => setV(e.target.value)} maxLength={200} rows={3} placeholder="مثال: بدون سمسم" />
      <div className="chips" style={{ marginTop: 10, flexWrap: 'wrap' }}>{quick.map((q) => <button key={q} className="chip" onClick={() => setV(q)}>{q}</button>)}</div>
    </Sheet>
  );
}

function activeProducts(c: Catalog | undefined, branchId?: string): Product[] {
  if (!c) return [];
  const restricted = new Map<string, Set<string>>();
  for (const a of c.availability) { if (!restricted.has(a.product_id)) restricted.set(a.product_id, new Set()); restricted.get(a.product_id)?.add(a.location_id); }
  const catOrder = new Map(c.categories.map((x) => [x.id, x.sort_order]));
  return c.products
    .filter((p) => p.is_active && (!restricted.has(p.id) || (branchId && restricted.get(p.id)?.has(branchId))))
    .sort((a, b) => (catOrder.get(a.category_id) ?? 0) - (catOrder.get(b.category_id) ?? 0) || a.sort_order - b.sort_order);
}

/* ═══ /order/review ═══ */
export function OrderReviewScreen() {
  const nav = useNavigate();
  const ctx = useOrderContext();
  const cat = useCatalog();
  const { draft, update } = useDraft(ctx.branch?.id, ctx.cq.data);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const errToast = useErrToast();
  const online = useOutbox((s) => s.online);
  const cur = ctx.cq.data;
  const prodMap = useMemo(() => new Map((cat.data?.products ?? []).map((p) => [p.id, p])), [cat.data]);
  const cats = cat.data?.categories ?? [];
  if (!draft || !cur || !cat.data) return <Screen title="مراجعة الطلبية" back="/order"><ListSkeleton /></Screen>;
  const sel = Object.entries(draft.lines).filter(([, l]) => l.qty > 0).map(([pid, l]) => ({ p: prodMap.get(pid), ...l })).filter((x): x is { p: Product; qty: number; note?: string | null } => !!x.p);
  const total = sel.reduce((a, x) => a + x.qty, 0);
  const prev = linesFromOrder(cur.order);

  const submit = async () => {
    if (!ctx.branch) return;
    const body = { client_uuid: ulid(), window_id: cur.window.id, branch_id: ctx.branch.id, delivery_date: cur.cycle.deliveryDate, note: draft.note || null, lines: sel.map((x) => ({ product_id: x.p.id, qty: x.qty, note: x.note ?? null })) };
    setBusy(true);
    const label = `طلبية ${fmtDay(cur.cycle.deliveryDate)}`;
    if (!navigator.onLine) {
      enqueue({ id: body.client_uuid, kind: 'order.submit', path: '/orders/submit', body, label });
      drafts.save({ ...draft, baseRevision: (cur.order?.revision ?? 0) + 1 });
      toast('حُفظت الطلبية وستُرسل تلقائياً عند عودة الاتصال');
      setBusy(false); nav('/'); return;
    }
    try {
      const r = await post<{ order: { revision: number } }>('/orders/submit', body);
      haptic.ok();
      drafts.clear(ctx.branch.id, cur.window.id, cur.cycle.deliveryDate);
      await invalidate('/orders', '/windows', '/dashboard', '/production');
      toast(r.order.revision > 1 ? `تم إرسال التعديل ✓ (نسخة ${fmtNum(r.order.revision)})` : 'تم إرسال الطلبية ✓');
      nav('/', { replace: true });
    } catch (e) {
      haptic.err();
      if (e instanceof ApiError && e.offline) { enqueue({ id: body.client_uuid, kind: 'order.submit', path: '/orders/submit', body, label }); toast('انقطع الاتصال — ستُرسل تلقائياً'); nav('/'); }
      else errToast(e);
    } finally { setBusy(false); }
  };

  return (
    <Screen title="مراجعة قبل الإرسال" subtitle={`${ctx.branch?.name_ar} · ${fmtDay(cur.cycle.deliveryDate, 'long')}`} back
      footer={<ActionBar summary={<><span><b>{count(sel.length, 'item')}</b></span><span><b>{fmtNum(total)}</b> وحدة</span></>}>
        <Button variant="primary" size="lg" block loading={busy} onClick={submit} icon={<Send size={19} className="flip-rtl" />}>{online ? (cur.order && cur.order.status !== 'cancelled' ? 'إرسال التعديل' : 'إرسال الطلبية') : 'حفظ للإرسال لاحقاً'}</Button>
      </ActionBar>}>
      <div className="content-narrow stack">
        {cur.cycle.closesInMinutes !== null && cur.cycle.closesInMinutes > 0 ? <div className="t-small muted">يمكنك التعديل حتى الساعة {fmtTime(cur.cycle.closesAt)} ({fmtDuration(cur.cycle.closesInMinutes)} متبقية)</div> : null}
        {cats.map((c) => {
          const xs = sel.filter((x) => x.p.category_id === c.id);
          if (!xs.length) return null;
          return (
            <div key={c.id}>
              <div className="hstack" style={{ margin: '8px 4px' }}><span style={{ width: 4, height: 18, borderRadius: 3, background: c.color ?? 'var(--brand-fill)' }} /><b>{c.name_ar}</b><span className="faint t-small num">· {fmtNum(xs.reduce((a, x) => a + x.qty, 0))}</span></div>
              <div className="list">
                {xs.map((x) => {
                  const before = prev[x.p.id]?.qty;
                  const changed = cur.order && before !== x.qty;
                  return (
                    <div key={x.p.id} className="row">
                      <div className="grow"><div className="ttl">{x.p.name_ar}</div>{x.note ? <div className="sub" style={{ color: 'var(--warning-ink)' }}>📝 {x.note}</div> : <div className="sub">{x.p.uom_name}</div>}</div>
                      {changed ? <span className="t-cap faint num" style={{ textDecoration: 'line-through' }}>{before ? fmtNum(before) : 'جديد'}</span> : null}
                      <b className="num" style={{ fontSize: 18, minWidth: 40, textAlign: 'end' }}>{fmtNum(x.qty)}</b>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {cur.order ? Object.keys(prev).filter((k) => !(draft.lines[k]?.qty)).map((k) => <div key={k} className="t-small" style={{ color: 'var(--danger-ink)' }}>محذوف: {prodMap.get(k)?.name_ar} ({fmtNum(prev[k]?.qty)})</div>) : null}
        <div className="field" style={{ marginTop: 8 }}>
          <label>ملاحظة عامة على الطلبية</label>
          <textarea className="inp" rows={2} maxLength={500} value={draft.note} onChange={(e) => update((d) => ({ ...d, note: e.target.value }))} placeholder="مثال: التسليم قبل 7 صباحاً" />
        </div>
        {cur.order ? <Badge tone="info">سيُرسل كتعديل رقم {fmtNum(cur.order.revision + 1)} — المعمل يرى آخر نسخة فقط</Badge> : null}
      </div>
    </Screen>
  );
}
export { StatusBadge };
