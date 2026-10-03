import { Building2, ChevronLeft, Clock, History, Package, Palette, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, Route, Routes } from 'react-router';
import { post, put } from '../../lib/api';
import { fmtDateTime } from '../../lib/format';
import { t } from '../../lib/i18n';
import { invalidate, useApi, useCatalog } from '../../lib/queries';
import { useMe } from '../../lib/session';
import type { Location } from '../../lib/types';
import { Button, Field, Q, Screen, Sheet, useErrToast, useToast } from '../../ui/kit';
import { loadMe } from '../Auth';

export function SettingsRoutes() {
  return (
    <Routes>
      <Route index element={<SettingsHome />} />
      <Route path="locations" element={<LocationsScreen />} />
      <Route path="catalog" element={<CatalogScreen />} />
      <Route path="users" element={<UsersScreen />} />
      <Route path="windows" element={<WindowsScreen />} />
      <Route path="branding" element={<BrandingScreen />} />
      <Route path="audit" element={<AuditScreen />} />
    </Routes>
  );
}
function SettingsHome() {
  const items = [
    ['locations', <Building2 size={20} />, 'الفروع والمعامل والمخازن', 'أضف فرعاً جديداً — يظهر عموده في الطباعة تلقائياً'],
    ['catalog', <Package size={20} />, 'التصنيفات والأصناف', 'المعجنات، المخبوزات، الكيك…'],
    ['windows', <Clock size={20} />, 'نوافذ الطلب', 'وقت الإغلاق ويوم التسليم'],
    ['users', <Users size={20} />, 'المستخدمون والصلاحيات', ''],
    ['branding', <Palette size={20} />, 'الهوية والطباعة', 'الاسم، اللون، الشعار، تذييل المستندات'],
    ['audit', <History size={20} />, 'سجل النشاط', 'من فعل ماذا ومتى'],
  ] as const;
  return (
    <Screen title="الإعدادات">
      <div className="content-narrow list">
        {items.map(([to, ic, a, b]) => <Link key={to} to={`/settings/${to}`} className="row">{ic}<div className="grow"><div className="ttl">{a}</div>{b ? <div className="sub">{b}</div> : null}</div><ChevronLeft size={18} className="chev" /></Link>)}
      </div>
    </Screen>
  );
}

function LocationsScreen() {
  const q = useApi<(Location & { plant_name: string | null; user_count: number; is_active: number })[]>('/locations');
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ code: '', name_ar: '', kind: 'branch', default_plant_id: '' });
  const toast = useToast(); const err = useErrToast();
  const plants = (q.data ?? []).filter((l) => l.kind === 'plant');
  const save = async () => { try { await post('/locations', { ...f, default_plant_id: f.kind === 'branch' ? f.default_plant_id || plants[0]?.id : null }); toast('أُضيف الموقع'); setOpen(false); await q.refetch(); await loadMe(); } catch (e) { err(e); } };
  return (
    <Screen title="الفروع والمواقع" back="/settings" actions={<Button size="sm" variant="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>إضافة</Button>}>
      <Q q={q}>{(d) => <div className="content-narrow list">{d.map((l) => <div key={l.id} className="row"><div className="grow"><div className="ttl">{l.name_ar}</div><div className="sub"><span className="mono">{l.code}</span> · {t(`locKind.${l.kind}`)}{l.plant_name ? ` · يخدمه ${l.plant_name}` : ''} · {l.user_count} مستخدم</div></div></div>)}</div>}</Q>
      <Sheet open={open} onClose={() => setOpen(false)} title="موقع جديد" footer={<Button variant="primary" block onClick={save}>حفظ</Button>}>
        <div className="stack">
          <Field label="النوع"><select className="inp" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="branch">فرع</option><option value="plant">معمل</option><option value="warehouse">مخزن</option></select></Field>
          <Field label="الاسم"><input className="inp" value={f.name_ar} onChange={(e) => setF({ ...f, name_ar: e.target.value })} placeholder="فرع شميلة" /></Field>
          <Field label="الكود"><input className="inp" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="BR-03" dir="ltr" /></Field>
          {f.kind === 'branch' ? <Field label="المعمل الذي يخدمه"><select className="inp" value={f.default_plant_id} onChange={(e) => setF({ ...f, default_plant_id: e.target.value })}>{plants.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}</select></Field> : null}
        </div>
      </Sheet>
    </Screen>
  );
}

function CatalogScreen() {
  const q = useCatalog();
  const [open, setOpen] = useState<string | null>(null);
  const [f, setF] = useState({ name_ar: '', code: '', uom_id: '' });
  const toast = useToast(); const err = useErrToast();
  const save = async () => { try { await post('/products', { category_id: open, ...f, uom_id: f.uom_id || q.data?.uoms[0]?.id }); toast('أُضيف الصنف'); setOpen(null); setF({ name_ar: '', code: '', uom_id: '' }); await invalidate('/catalog'); } catch (e) { err(e); } };
  return (
    <Screen title="التصنيفات والأصناف" back="/settings">
      <Q q={q}>{(c) => <div className="content-narrow stack">{c.categories.map((cat) => (
        <div key={cat.id}><div className="sect-h"><h2><span style={{ display: 'inline-block', width: 4, height: 14, background: cat.color ?? 'var(--brand-fill)', borderRadius: 2, marginInlineEnd: 6 }} />{cat.name_ar}</h2><button onClick={() => setOpen(cat.id)}>+ صنف</button></div>
          <div className="list">{c.products.filter((p) => p.category_id === cat.id).map((p) => <div key={p.id} className="row"><div className="grow"><div className="ttl">{p.name_ar}</div><div className="sub"><span className="mono">{p.code}</span> · {p.uom_name}</div></div></div>)}</div></div>))}</div>}</Q>
      <Sheet open={!!open} onClose={() => setOpen(null)} title="صنف جديد" footer={<Button variant="primary" block onClick={save}>حفظ</Button>}>
        <div className="stack">
          <Field label="الاسم"><input className="inp" value={f.name_ar} onChange={(e) => setF({ ...f, name_ar: e.target.value })} /></Field>
          <Field label="الكود"><input className="inp" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} dir="ltr" /></Field>
          <Field label="الوحدة"><select className="inp" value={f.uom_id} onChange={(e) => setF({ ...f, uom_id: e.target.value })}>{q.data?.uoms.map((u) => <option key={u.id} value={u.id}>{u.name_ar}</option>)}</select></Field>
        </div>
      </Sheet>
    </Screen>
  );
}

function UsersScreen() {
  const q = useApi<{ id: string; full_name: string; email: string | null; phone: string | null; is_active: number; last_login_at: string | null; roles: { role: string; location_name: string | null }[] }[]>('/users');
  return (
    <Screen title="المستخدمون" back="/settings">
      <Q q={q}>{(d) => <div className="content-narrow list">{d.map((u) => <div key={u.id} className="row"><div className="avatar">{u.full_name[0]}</div><div className="grow"><div className="ttl">{u.full_name}</div><div className="sub">{u.roles.map((r) => `${t(`roles.${r.role}`)}${r.location_name ? ` (${r.location_name})` : ''}`).join('، ')} · {u.email ?? u.phone}</div></div></div>)}</div>}</Q>
    </Screen>
  );
}

function WindowsScreen() {
  const q = useApi<{ id: string; plant_id: string; name_ar: string; kind: 'regular' | 'urgent'; cutoff_time: string | null; delivery_offset_days: number; plant_name: string }[]>('/order-windows');
  const toast = useToast(); const err = useErrToast();
  const save = async (w: NonNullable<typeof q.data>[number], cutoff: string) => { try { await put(`/order-windows/${w.id}`, { plant_id: w.plant_id, name_ar: w.name_ar, kind: w.kind, cutoff_time: w.kind === 'urgent' ? null : cutoff, delivery_offset_days: w.delivery_offset_days }); toast('حُفظ وقت الإغلاق'); void q.refetch(); } catch (e) { err(e); } };
  return (
    <Screen title="نوافذ الطلب" back="/settings">
      <Q q={q}>{(d) => <div className="content-narrow list">{d.map((w) => <div key={w.id} className="row"><div className="grow"><div className="ttl">{w.name_ar}</div><div className="sub">{w.plant_name} · التسليم بعد {w.delivery_offset_days} يوم</div></div>{w.kind === 'regular' ? <input type="time" className="inp" style={{ width: 120, height: 42 }} defaultValue={w.cutoff_time ?? ''} onBlur={(e) => e.target.value !== w.cutoff_time && save(w, e.target.value)} /> : <span className="t-small muted">بلا إغلاق</span>}</div>)}</div>}</Q>
    </Screen>
  );
}

function BrandingScreen() {
  const me = useMe();
  const b = me.branding;
  const [f, setF] = useState({ company_name: b.company_name, primary_color: b.primary_color, phone: b.phone ?? '', address: b.address ?? '', footer_text: b.footer_text ?? '', logo_url: null as string | null });
  const toast = useToast(); const err = useErrToast();
  const onLogo = (file: File) => { const r = new FileReader(); r.onload = () => setF((x) => ({ ...x, logo_url: String(r.result) })); r.readAsDataURL(file); };
  const save = async () => { try { await put('/tenant/branding', f); await loadMe(); toast('حُفظت الهوية'); } catch (e) { err(e); } };
  return (
    <Screen title="الهوية والطباعة" back="/settings">
      <div className="content-narrow stack">
        <Field label="اسم المنشأة"><input className="inp" value={f.company_name} onChange={(e) => setF({ ...f, company_name: e.target.value })} /></Field>
        <Field label="اللون الأساسي"><input className="inp" type="color" value={f.primary_color} onChange={(e) => setF({ ...f, primary_color: e.target.value })} style={{ height: 52, padding: 4 }} /></Field>
        <Field label="الشعار (PNG/JPG)"><input className="inp" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])} style={{ paddingTop: 12 }} /></Field>
        <Field label="الهاتف"><input className="inp" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="العنوان"><input className="inp" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <Field label="تذييل المستندات المطبوعة"><input className="inp" value={f.footer_text} onChange={(e) => setF({ ...f, footer_text: e.target.value })} /></Field>
        <Button variant="primary" size="lg" onClick={save}>حفظ</Button>
      </div>
    </Screen>
  );
}

function AuditScreen() {
  const q = useApi<{ id: string; entity_type: string; action: string; at: string; actor_name: string | null }[]>('/audit');
  return (
    <Screen title="سجل النشاط" back="/settings">
      <Q q={q}>{(d) => <div className="content-narrow list">{d.map((a) => <div key={a.id} className="row"><div className="grow"><div className="ttl t-small">{a.actor_name ?? 'النظام'} · {a.action} · {a.entity_type}</div><div className="sub">{fmtDateTime(a.at)}</div></div></div>)}</div>}</Q>
    </Screen>
  );
}
