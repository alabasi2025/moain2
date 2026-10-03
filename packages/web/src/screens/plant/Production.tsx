import { AlertTriangle, Check, ChevronLeft, Clock, Factory, Lock, MessageSquare, Play, Printer, StickyNote, User, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { get, patch, post } from '../../lib/api';
import { dayLabel, fmtDateTime, fmtDay, fmtNum, fmtTime, isoToLocalInput, localInputToIso } from '../../lib/format';
import { count } from '../../lib/i18n';
import { invalidate, useApi } from '../../lib/queries';
import { hasRole, useMe } from '../../lib/session';
import { excTone, orderTone, poTone } from '../../lib/status';
import type { Matrix, PoDetail, PoSummary } from '../../lib/types';
import { ActionBar, Badge, Button, Chips, Empty, Field, IconButton, Q, Screen, Segmented, Sheet, Skeleton, StatusBadge, Switch, useConfirm, useErrToast, useToast } from '../../ui/kit';
import { haptic } from '../../lib/haptics';
import { normalizeMatrix } from '../../lib/matrix';

export function ProductionListScreen() {
  const q = useApi<PoSummary[]>('/production-orders', { refetchInterval: 30_000 });
  const [f, setF] = useState<'active' | 'done' | 'all'>('active');
  const rows = (q.data ?? []).filter((p) => (f === 'all' ? true : f === 'active' ? ['open', 'locked', 'in_progress'].includes(p.status) : ['completed', 'delivered', 'cancelled'].includes(p.status)));
  return (
    <Screen title="أوامر الإنتاج" subtitle="تُجمَّع تلقائياً من طلبيات الفروع" actions={<Link to="/exceptions" className="btn ghost sm">الاستثناءات</Link>}>
      <div className="stack" style={{ gap: 10 }}>
        <Chips value={f} onChange={setF} items={[{ v: 'active', label: 'الجارية' }, { v: 'done', label: 'المنتهية' }, { v: 'all', label: 'الكل' }]} />
        <Q q={q} empty={() => (rows.length ? null : <Empty icon={<Factory size={40} strokeWidth={1.5} />} title="لا أوامر هنا" text="يُنشأ أمر الإنتاج تلقائياً عند أول طلبية من أي فرع" />)}>
          {() => (
            <div className="list">
              {rows.map((p) => (
                <Link key={p.id} to={`/production/${p.id}`} className="row" style={{ minHeight: 72 }}>
                  <div className="grow">
                    <div className="hstack"><span className="ttl">{dayLabel(p.delivery_date)} · {fmtDay(p.delivery_date)}</span>{p.window_kind === 'urgent' ? <Badge tone="warning" sm>عاجل</Badge> : null}</div>
                    <div className="sub"><span className="mono">{p.number}</span> · {count(p.order_count, 'branch')} · {fmtNum(p.total_units)} وحدة{p.assigned_to_name ? ` · ${p.assigned_to_name}` : ''}</div>
                  </div>
                  <StatusBadge s={poTone(p.status)} sm />
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

type View = 'all' | 'branch' | 'section';

/* ═══ W3 / W8 ═══ */
export function ProductionDetailScreen() {
  const { id } = useParams();
  const me = useMe();
  const nav = useNavigate();
  const q = useApi<PoDetail>(`/production-orders/${id}`, { select: (d) => normalizeMatrix(d) });
  const [view, setView] = useState<View>('all');
  const [assign, setAssign] = useState(false);
  const [printSheet, setPrintSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const err = useErrToast();
  const confirm = useConfirm();
  const canManage = hasRole(me, 'plant_manager', 'owner', 'admin');

  // live updates via cheap version polling (ADR-0012: no SSE on Workers free tier)
  useEffect(() => {
    if (!q.data || ['completed', 'delivered', 'cancelled'].includes(q.data.header.status)) return;
    const v = q.data.version;
    const tm = setInterval(async () => {
      try { const r = await get<{ version: string }>(`/production-orders/${id}/version`); if (r && r.version !== v) void q.refetch(); } catch { /* offline */ }
    }, 10_000);
    return () => clearInterval(tm);
  }, [q.data?.version, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (path: string, ok: string, ask?: { title: string; text: string }) => {
    if (ask && !(await confirm({ title: ask.title, text: ask.text }))) return;
    setBusy(true);
    try { await post(`/production-orders/${id}/${path}`); haptic.ok(); toast(ok); await invalidate('/production-orders', '/dashboard', '/deliveries', '/orders'); } catch (e) { err(e); } finally { setBusy(false); }
  };

  const d = q.data;
  const h = d?.header;
  const cta = !h || !canManage ? null
    : h.status === 'open' ? <Button variant="primary" size="lg" block loading={busy} icon={<Lock size={19} />} onClick={() => act('lock', 'أُقفل الأمر — لا تعديلات من الفروع إلا باستثناء', { title: 'قفل أمر الإنتاج الآن؟', text: `${d?.missing_branches.length ? `${count(d.missing_branches.length, 'branch')} لم ترسل بعد. ` : ''}بعد القفل لا يمكن للفروع التعديل إلا بطلب استثناء.` })}>قفل الطلبيات الآن</Button>
      : h.status === 'locked' ? <Button variant="primary" size="lg" block loading={busy} icon={<Play size={19} className="flip-rtl" />} onClick={() => act('start', 'بدأ الإنتاج — أُشعرت الفروع')}>بدء الإنتاج</Button>
        : h.status === 'in_progress' ? <Button variant="success" size="lg" block loading={busy} icon={<Check size={19} />} onClick={() => act('complete', 'اكتمل الإنتاج — الطلبيات جاهزة للتسليم', { title: 'تأكيد اكتمال الإنتاج؟', text: 'ستصبح كل الطلبيات «جاهزة» وتُشعَر الفروع.' })}>اكتمل الإنتاج</Button>
          : h.status === 'completed' ? <Button variant="primary" size="lg" block icon={<Check size={19} />} onClick={() => nav('/deliver')}>الانتقال للتسليم</Button> : null;

  return (
    <Screen
      title={h ? <span className="mono" style={{ direction: 'ltr', display: 'inline-block' }}>{h.number}</span> : 'أمر الإنتاج'}
      subtitle={h ? `${poTone(h.status).label} · تسليم ${fmtDay(h.delivery_date, 'long')}` : undefined}
      back="/production"
      actions={<>
        <span className="hide-m"><Button onClick={() => setPrintSheet(true)} icon={<Printer size={18} />}>طباعة</Button></span>
        <span className="hide-d"><IconButton label="طباعة" onClick={() => setPrintSheet(true)}><Printer size={22} /></IconButton></span>
      </>}
      footer={cta ? <ActionBar>{cta}</ActionBar> : undefined}
    >
      <Q q={q} skeleton={<div className="stack"><Skeleton h={120} r={16} /><Skeleton h={44} /><Skeleton h={320} r={14} /></div>}>
        {(d) => (
          <div className="two-pane">
            <div className="stack" style={{ minWidth: 0 }}>
              <div className="card pad">
                <button className="kv" style={{ width: '100%', background: 'none', border: 0, cursor: canManage ? 'pointer' : 'default', padding: '6px 0' }} onClick={() => canManage && setAssign(true)}>
                  <span className="k hstack"><User size={16} /> المسؤول عن الطلبية</span>
                  <span className="v" style={{ color: d.header.assigned_to_name || d.header.assigned_to_user ? undefined : 'var(--brand-text)' }}>{d.header.assigned_to_name ?? d.header.assigned_to_user ?? (canManage ? 'تعيين ›' : '—')}</span>
                </button>
                <button className="kv" style={{ width: '100%', background: 'none', border: 0, borderTop: '1px solid var(--border)', cursor: canManage ? 'pointer' : 'default', padding: '10px 0 6px' }} onClick={() => canManage && setAssign(true)}>
                  <span className="k hstack"><Clock size={16} /> الوقت المتوقع للإتمام</span>
                  <span className="v" style={{ color: d.header.expected_ready_at ? undefined : 'var(--brand-text)' }}>{d.header.expected_ready_at ? `${dayLabel(isoToLocalInput(d.header.expected_ready_at).slice(0, 10))} ${fmtTime(d.header.expected_ready_at)}` : canManage ? 'تحديد ›' : '—'}</span>
                </button>
                <div className="hstack t-small muted" style={{ marginTop: 8, flexWrap: 'wrap', gap: 6 }}>
                  <span><b className="num" style={{ color: 'var(--ink)' }}>{fmtNum(d.branches.length)}</b> فروع</span>·
                  <span><b className="num" style={{ color: 'var(--ink)' }}>{fmtNum(d.totals.products)}</b> صنف</span>·
                  <span><b className="num" style={{ color: 'var(--ink)' }}>{fmtNum(d.totals.units)}</b> وحدة</span>
                  {d.snapshot_version ? <Badge tone="violet" sm>نسخة {fmtNum(d.snapshot_version)}</Badge> : null}
                </div>
              </div>

              {d.missing_branches.length && d.header.status === 'open' ? (
                <div className="tone-warning t-small" style={{ padding: '10px 14px', borderRadius: 12 }}>لم ترسل بعد: {d.missing_branches.map((b) => b.name_ar).join('، ')}</div>
              ) : null}

              <Segmented value={view} onChange={setView} items={[{ v: 'all', label: 'مجمّع' }, { v: 'branch', label: 'حسب الفرع' }, { v: 'section', label: 'حسب القسم' }]} />

              {d.totals.units === 0 ? <Empty title="لا طلبيات بعد" text="ستظهر الكميات هنا لحظة إرسال الفروع" /> :
                view === 'all' ? <DemandMatrix m={d} /> : view === 'branch' ? <ByBranch m={d} /> : <BySection m={d} />}

              <NotesPanel m={d} className="hide-d" />
            </div>
            <div className="stack hide-m">
              <NotesPanel m={d} />
              <div className="card pad">
                <div className="t-h3" style={{ marginBottom: 8 }}>الطلبيات</div>
                {d.orders.map((o) => <Link key={o.id} to={`/orders/${o.id}`} className="kv" style={{ color: 'inherit', textDecoration: 'none' }}><span className="k">✓ {o.branch_name}</span><span className="v num">{fmtNum(o.total_qty)} <StatusBadge s={orderTone(o.status)} sm /></span></Link>)}
                {d.missing_branches.map((b) => <div key={b.id} className="kv"><span className="k" style={{ color: 'var(--ink-3)' }}>✗ {b.name_ar}</span><span className="v faint">لم يرسل</span></div>)}
              </div>
            </div>
          </div>
        )}
      </Q>
      {d ? <AssignSheet open={assign} onClose={() => setAssign(false)} d={d} onSaved={() => { setAssign(false); void q.refetch(); }} /> : null}
      <PrintSheet open={printSheet} onClose={() => setPrintSheet(false)} id={id ?? ''} />
    </Screen>
  );
}

export function DemandMatrix({ m }: { m: Matrix }) {
  const [noteOf, setNoteOf] = useState<{ name: string; notes: { branch: string; note: string }[] } | null>(null);
  const bTotals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const c of m.categories) for (const [b, v] of Object.entries(c.by_branch)) t[b] = (t[b] ?? 0) + v;
    return t;
  }, [m]);
  return (
    <>
      <div className="mx-wrap" style={{ maxHeight: '70dvh' }}>
        <table className="mx">
          <thead><tr><th className="c-name">الصنف</th><th className="c-tot">الإجمالي</th>{m.branches.map((b) => <th key={b.id}>{b.name.replace(/^فرع\s+/, '')}</th>)}</tr></thead>
          <tbody>
            {m.categories.map((c) => (
              <FragmentRows key={c.id}>
                <tr className="cat">
                  <td className="c-name"><span style={{ display: 'inline-block', width: 4, height: 14, borderRadius: 2, background: c.color ?? 'var(--brand-fill)', marginInlineEnd: 8, verticalAlign: -2 }} />{c.name}</td>
                  <td className="c-tot">{fmtNum(c.total)}</td>
                  {m.branches.map((b) => <td key={b.id}>{c.by_branch[b.id] ? fmtNum(c.by_branch[b.id]) : '—'}</td>)}
                </tr>
                {c.products.map((p) => (
                  <tr key={p.id}>
                    <td className="c-name" onClick={() => p.notes.length && setNoteOf({ name: p.name, notes: p.notes })} style={p.notes.length ? { cursor: 'pointer' } : undefined}>
                      {p.name}{p.notes.length ? <span className="note-ic"><StickyNote size={14} /></span> : null}
                      <div className="t-cap faint">{p.uom}</div>
                    </td>
                    <td className="c-tot">{fmtNum(p.total)}</td>
                    {m.branches.map((b) => { const v = p.by_branch[b.id]; return <td key={b.id} className={v ? '' : 'z'}>{v ? fmtNum(v) : '—'}</td>; })}
                  </tr>
                ))}
              </FragmentRows>
            ))}
            <tr className="grand"><td className="c-name">الإجمالي الكلي</td><td className="c-tot">{fmtNum(m.totals.units)}</td>{m.branches.map((b) => <td key={b.id}>{fmtNum(bTotals[b.id] ?? 0)}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <Sheet open={!!noteOf} onClose={() => setNoteOf(null)} title={`ملاحظات · ${noteOf?.name ?? ''}`}>
        <div className="list">{noteOf?.notes.map((n, i) => <div key={i} className="row"><b style={{ minWidth: 70 }}>{n.branch}</b><span>{n.note}</span></div>)}</div>
      </Sheet>
    </>
  );
}
function FragmentRows({ children }: { children: React.ReactNode }) { return <>{children}</>; }

function ByBranch({ m }: { m: Matrix }) {
  const [b, setB] = useState(m.branches[0]?.id ?? '');
  const branch = m.branches.find((x) => x.id === b);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <Chips value={b} onChange={setB} items={m.branches.map((x) => ({ v: x.id, label: x.name, n: m.categories.reduce((a, c) => a + (c.by_branch[x.id] ?? 0), 0) }))} />
      {m.categories.map((c) => {
        const ps = c.products.filter((p) => p.by_branch[b]);
        if (!ps.length) return null;
        return (
          <div key={c.id}>
            <div className="hstack" style={{ margin: '6px 4px' }}><span style={{ width: 4, height: 16, borderRadius: 2, background: c.color ?? 'var(--brand-fill)' }} /><b>{c.name}</b><span className="faint t-small num">· {fmtNum(c.by_branch[b] ?? 0)}</span></div>
            <div className="list">{ps.map((p) => {
              const note = p.notes.find((n) => n.branch_id === b);
              return <div key={p.id} className="row"><div className="grow"><div className="ttl">{p.name}</div><div className="sub">{note ? <span style={{ color: 'var(--warning-ink)' }}>📝 {note.note}</span> : p.uom}</div></div><b className="num" style={{ fontSize: 18 }}>{fmtNum(p.by_branch[b])}</b></div>;
            })}</div>
          </div>
        );
      })}
      {m.order_notes.filter((n) => n.branch_id === b).map((n, i) => <div key={i} className="tone-warning t-small" style={{ padding: '10px 14px', borderRadius: 12 }}>ملاحظة {branch?.name}: {n.note}</div>)}
    </div>
  );
}

function BySection({ m }: { m: Matrix }) {
  return (
    <div className="stack" style={{ gap: 10 }}>
      {m.categories.map((c) => (
        <div key={c.id} className="card" style={{ overflow: 'hidden' }}>
          <div className="split" style={{ padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <div className="hstack"><span style={{ width: 4, height: 18, borderRadius: 2, background: c.color ?? 'var(--brand-fill)' }} /><b>{c.name}</b></div>
            <span className="num" style={{ fontWeight: 700 }}>{fmtNum(c.total)}</span>
          </div>
          {c.products.map((p) => (
            <div key={p.id} className="row">
              <div className="grow"><div className="ttl">{p.name}</div><div className="sub">{m.branches.filter((b) => p.by_branch[b.id]).map((b) => `${b.name.replace(/^فرع\s+/, '')} ${fmtNum(p.by_branch[b.id])}`).join(' · ')}</div></div>
              <b className="num" style={{ fontSize: 18 }}>{fmtNum(p.total)}</b>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function NotesPanel({ m, className }: { m: Matrix; className?: string }) {
  const [open, setOpen] = useState(true);
  const lineNotes = m.categories.flatMap((c) => c.products.flatMap((p) => p.notes.map((n) => ({ ...n, product: p.name }))));
  const n = m.order_notes.length + lineNotes.length;
  if (!n) return null;
  return (
    <div className={`card ${className ?? ''}`} style={{ overflow: 'hidden' }}>
      <button className="row" onClick={() => setOpen(!open)} style={{ background: 'none' }}><MessageSquare size={20} style={{ color: 'var(--warning-ink)' }} /><div className="grow"><div className="ttl">ملاحظات الفروع ({fmtNum(n)})</div></div></button>
      {open ? (
        <div style={{ padding: '0 16px 12px' }} className="stack">
          {m.order_notes.map((x, i) => <div key={`o${i}`} className="t-small"><b>{x.branch}:</b> {x.note}</div>)}
          {lineNotes.map((x, i) => <div key={`l${i}`} className="t-small"><b>{x.branch}</b> · {x.product}: <span style={{ color: 'var(--warning-ink)' }}>{x.note}</span></div>)}
        </div>
      ) : null}
    </div>
  );
}

function AssignSheet({ open, onClose, d, onSaved }: { open: boolean; onClose: () => void; d: PoDetail; onSaved: () => void }) {
  const [name, setName] = useState(d.header.assigned_to_name ?? '');
  const [userId, setUserId] = useState<string | null>(d.header.assigned_to);
  const [when, setWhen] = useState(isoToLocalInput(d.header.expected_ready_at));
  const [busy, setBusy] = useState(false);
  const err = useErrToast();
  const toast = useToast();
  useEffect(() => { if (open) { setName(d.header.assigned_to_name ?? d.header.assigned_to_user ?? ''); setWhen(isoToLocalInput(d.header.expected_ready_at)); setUserId(d.header.assigned_to); } }, [open, d]);
  const quick = (h: number, m = 0) => { const base = new Date(d.header.delivery_date + 'T00:00:00'); base.setHours(h, m); const iso = localInputToIso(`${d.header.delivery_date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`); setWhen(isoToLocalInput(iso)); };
  const save = async () => {
    setBusy(true);
    try { await patch(`/production-orders/${d.header.id}`, { assigned_to: userId, assigned_to_name: name.trim() || null, expected_ready_at: localInputToIso(when) }); toast('حُفظ المسؤول والوقت'); onSaved(); } catch (e) { err(e); } finally { setBusy(false); }
  };
  return (
    <Sheet open={open} onClose={onClose} title="المسؤول والوقت المتوقع" footer={<Button variant="primary" size="lg" block loading={busy} onClick={save}>حفظ</Button>}>
      <div className="stack">
        <Field label="اسم المسؤول عن الطلبية" hint="يظهر في الأمر المطبوع وفي تطبيق الفروع">
          <input className="inp" value={name} onChange={(e) => { setName(e.target.value); setUserId(null); }} placeholder="مثال: م. خالد العمري" />
        </Field>
        {d.staff.length ? <div className="chips" style={{ flexWrap: 'wrap' }}>{d.staff.map((s) => <button key={s.id} className={`chip ${userId === s.id ? 'on' : ''}`} onClick={() => { setUserId(s.id); setName(s.full_name); }}>{s.full_name}</button>)}</div> : null}
        <Field label="الوقت المتوقع لإتمام الطلبية">
          <input className="inp" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} dir="ltr" />
        </Field>
        <div className="chips" style={{ flexWrap: 'wrap' }}>
          {[[5, 0], [6, 0], [6, 30], [7, 0], [8, 0]].map(([h, m]) => <button key={`${h}${m}`} className="chip" onClick={() => quick(h as number, m as number)}>{fmtTime(localInputToIso(`${d.header.delivery_date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`))} {dayLabel(d.header.delivery_date)}</button>)}
        </div>
      </div>
    </Sheet>
  );
}

function PrintSheet({ open, onClose, id }: { open: boolean; onClose: () => void; id: string }) {
  const nav = useNavigate();
  const [large, setLarge] = useState(false);
  const go = (layout: string) => { onClose(); nav(`/print/production/${id}?layout=${layout}${large ? '&large=1' : ''}`); };
  return (
    <Sheet open={open} onClose={onClose} title="طباعة أمر الإنتاج">
      <div className="stack">
        <button className="bigchoice" onClick={() => go('consolidated')}><span className="ic tone-brand"><Printer size={26} /></span><div><div className="t">مجمّع (A4)</div><div className="s">الأصناف × الفروع مع الإجماليات والتوقيعات</div></div></button>
        <button className="bigchoice" onClick={() => go('section')}><span className="ic tone-info"><Factory size={26} /></span><div><div className="t">حسب القسم</div><div className="s">ورقة لكل قسم (معجنات، كيك…) للعمال</div></div></button>
        <button className="bigchoice" onClick={() => go('branch')}><span className="ic tone-success"><StickyNote size={26} /></span><div><div className="t">حسب الفرع (A5)</div><div className="s">ورقة تجهيز لكل فرع مع خانة ✓ وتوقيع المستلم</div></div></button>
        <div className="split card pad"><span>خط كبير للعمال</span><Switch on={large} onChange={setLarge} label="خط كبير" /></div>
      </div>
    </Sheet>
  );
}

/* ═══ /exceptions ═══ */
interface Exc { id: string; order_id: string; reason: string; status: string; requested_at: string; expires_at: string; decided_at: string | null; decision_note: string | null; branch_name: string; delivery_date: string; requested_by_name: string }
export function ExceptionsScreen() {
  const q = useApi<Exc[]>('/exceptions', { refetchInterval: 20_000 });
  const err = useErrToast();
  const toast = useToast();
  const confirm = useConfirm();
  const decide = async (e: Exc, d: 'approve' | 'reject') => {
    const note = await confirm({ title: d === 'approve' ? `الموافقة على تعديل ${e.branch_name}؟` : `رفض طلب ${e.branch_name}؟`, text: d === 'approve' ? 'سيحصل الفرع على 15 دقيقة لإرسال التعديل، ويُحدَّث أمر الإنتاج تلقائياً بنسخة جديدة.' : undefined, input: { label: 'ملاحظة للفرع (اختياري)' }, confirm: d === 'approve' ? 'موافقة' : 'رفض', danger: d === 'reject' });
    if (note === false) return;
    try { await post(`/exceptions/${e.id}/${d}`, { note: note || undefined }); toast(d === 'approve' ? 'تمت الموافقة — أُشعر الفرع' : 'تم الرفض'); void q.refetch(); void invalidate('/dashboard'); } catch (x) { err(x); }
  };
  return (
    <Screen title="طلبات التعديل (الاستثناءات)" subtitle="تعديلات الفروع بعد إغلاق الطلبية" back>
      <Q q={q} empty={(d) => (d.length ? null : <Empty icon={<AlertTriangle size={40} strokeWidth={1.5} />} title="لا طلبات تعديل" text="عندما يطلب فرع تعديل طلبيته بعد الإغلاق تظهر هنا" />)}>
        {(d) => (
          <div className="stack content-narrow">
            {d.map((e) => (
              <div key={e.id} className="card pad">
                <div className="split"><b>{e.branch_name}</b><StatusBadge s={excTone(e.status)} sm /></div>
                <div style={{ margin: '8px 0', fontSize: 16 }}>«{e.reason}»</div>
                <div className="t-small muted">{e.requested_by_name} · {fmtDateTime(e.requested_at)} · طلبية {fmtDay(e.delivery_date)}</div>
                {e.decision_note ? <div className="t-small" style={{ marginTop: 6 }}>ردّك: {e.decision_note}</div> : null}
                {e.status === 'pending' ? (
                  <div className="hstack" style={{ marginTop: 12 }}>
                    <Button variant="danger-soft" icon={<X size={18} />} onClick={() => decide(e, 'reject')}>رفض</Button>
                    <Button variant="primary" block icon={<Check size={18} />} onClick={() => decide(e, 'approve')}>موافقة (15 دقيقة)</Button>
                  </div>
                ) : null}
                <Link to={`/orders/${e.order_id}`} className="btn ghost sm" style={{ marginTop: 6 }}>عرض الطلبية</Link>
              </div>
            ))}
          </div>
        )}
      </Q>
    </Screen>
  );
}
