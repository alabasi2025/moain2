import { Delete, Eye, EyeOff, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ApiError, get, post, put } from '../lib/api';
import { haptic } from '../lib/haptics';
import { deviceFingerprint, savedDevice, savedTenant, useSession } from '../lib/session';
import type { Me } from '../lib/types';
import { Button, Field, Logo, useToast } from '../ui/kit';
import { applyBrand } from '../lib/theme';
import { fmtNum } from '../lib/format';

interface TenantPub { slug: string; company_name: string; logo_url: string | null; primary_color: string }

const DEMO = [
  { label: 'المالك', id: 'owner@alnoor.ye', hint: 'كل الصلاحيات' },
  { label: 'فرع الستين', id: 'sitteen@alnoor.ye', hint: 'إدخال الطلبية' },
  { label: 'فرع حدة', id: 'hadda@alnoor.ye', hint: 'إدخال الطلبية' },
  { label: 'مدير المعمل', id: 'plant@alnoor.ye', hint: 'الإنتاج والتسليم' },
  { label: 'موظف معمل', id: 'staff@alnoor.ye', hint: 'التجهيز والتسليم' },
  { label: 'أمين المخزن', id: 'store@alnoor.ye', hint: 'الوارد والصارف' },
];

export async function loadMe(): Promise<Me> {
  const me = await get<Me>('/auth/me');
  useSession.getState().setMe(me);
  return me;
}

export function LoginScreen() {
  const slug = new URLSearchParams(location.search).get('t') ?? savedTenant();
  const [tenant, setTenant] = useState<TenantPub | null>(null);
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { get<TenantPub>(`/auth/tenant/${slug}`).then((x) => { setTenant(x); applyBrand(x.primary_color); }).catch(() => setTenant(null)); }, [slug]);

  const submit = async (identifier = id, password = pw) => {
    setBusy(true); setErr(null);
    try {
      await post('/auth/login', { tenant: slug, identifier: identifier.trim(), password, deviceFingerprint: deviceFingerprint(), deviceLabel: navigator.userAgent.includes('Mobile') ? 'جوال' : 'كمبيوتر' });
      haptic.ok();
      await loadMe();
    } catch (e) {
      haptic.err();
      setErr(e instanceof ApiError ? e.messageAr : 'تعذّر الدخول');
    } finally { setBusy(false); }
  };

  return (
    <div className="screen" style={{ minHeight: '100dvh' }}>
      <div className="screen-body">
        <div style={{ maxWidth: 420, margin: '0 auto', padding: 'calc(40px + var(--sat)) 20px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Logo name={tenant?.company_name ?? 'مُعين'} url={tenant?.logo_url} size="lg" />
            <div style={{ textAlign: 'center' }}>
              <div className="t-display">{tenant?.company_name ?? 'مُعين'}</div>
              <div className="muted t-small">الطلبيات · الإنتاج · المخزون</div>
            </div>
          </div>
          <form className="stack" style={{ gap: 14 }} onSubmit={(e) => { e.preventDefault(); void submit(); }}>
            <Field label="البريد أو رقم الجوال">
              <input className="inp" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" inputMode="email" dir="ltr" style={{ textAlign: 'right' }} placeholder="name@company.ye" required />
            </Field>
            <Field label="كلمة المرور">
              <div style={{ position: 'relative' }}>
                <input className="inp" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required style={{ paddingInlineEnd: 48 }} />
                <button type="button" className="ibtn" style={{ position: 'absolute', insetInlineEnd: 4, top: 4 }} onClick={() => setShow(!show)} aria-label={show ? 'إخفاء' : 'إظهار'}>{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </Field>
            {err ? <div className="tone-danger t-small" style={{ padding: '10px 14px', borderRadius: 12 }}>{err}</div> : null}
            <Button type="submit" variant="primary" size="lg" block loading={busy} icon={<LogIn size={20} />}>دخول</Button>
          </form>

          <div style={{ marginTop: 32 }}>
            <div className="split" style={{ marginBottom: 10 }}>
              <span className="t-small" style={{ fontWeight: 600 }}>دخول تجريبي سريع</span>
              <span className="t-cap faint">كلمة المرور 123456</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DEMO.map((d) => (
                <button key={d.id} className="card tap" style={{ padding: '10px 12px', textAlign: 'start', border: '1px solid var(--border)' }} disabled={busy}
                  onClick={() => { setId(d.id); setPw('123456'); void submit(d.id, '123456'); }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{d.label}</div>
                  <div className="t-cap faint">{d.hint}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** W7 — PIN lock / quick unlock on a trusted device. */
export function PinScreen({ mode, onDone, onUsePassword }: { mode: 'unlock' | 'setup'; onDone: () => void; onUsePassword?: () => void }) {
  const me = useSession((s) => s.me);
  const [owner, setOwner] = useState<string | null>(me?.user.full_name ?? null);
  const [pin, setPin] = useState('');
  const [first, setFirst] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useToast();
  const dev = savedDevice();
  useEffect(() => { if (mode === 'unlock' && dev && !owner) get<{ fullName: string }>(`/auth/device/${dev}`).then((d) => setOwner(d.fullName)).catch(() => onUsePassword?.()); }, [dev, mode, owner, onUsePassword]);

  const fail = (m: string) => { haptic.err(); setShake(true); setMsg(m); setTimeout(() => { setShake(false); setPin(''); }, 380); };
  const complete = async (p: string) => {
    if (mode === 'setup') {
      if (!first) { setFirst(p); setPin(''); setMsg('أعد إدخال الرمز للتأكيد'); return; }
      if (first !== p) { setFirst(null); fail('الرمزان غير متطابقين — ابدأ من جديد'); return; }
      try { await put('/auth/pin/set', { pin: p }); haptic.ok(); toast('تم تعيين رمز الدخول السريع'); await loadMe(); onDone(); } catch (e) { fail(e instanceof ApiError ? e.messageAr : 'تعذّر الحفظ'); }
      return;
    }
    try {
      await post('/auth/pin', { deviceId: dev, pin: p });
      haptic.ok();
      await loadMe();
      onDone();
    } catch (e) {
      const ae = e instanceof ApiError ? e : null;
      if (ae?.details?.requirePassword) { onUsePassword?.(); return; }
      const rem = ae?.details?.remaining as number | undefined;
      fail(rem !== undefined ? `الرمز غير صحيح — متبقٍ ${fmtNum(rem)} محاولات` : ae?.messageAr ?? 'الرمز غير صحيح');
    }
  };
  const press = (k: string) => {
    if (k === 'del') { setPin((x) => x.slice(0, -1)); return; }
    setPin((x) => {
      const n = (x + k).slice(0, 4);
      if (n.length === 4) setTimeout(() => void complete(n), 120);
      return n;
    });
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const b = me?.branding;
  return (
    <div className="screen" style={{ minHeight: '100dvh', position: mode === 'unlock' ? 'fixed' : undefined, inset: 0, zIndex: 100 }}>
      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'calc(24px + var(--sat)) 20px 24px' }}>
        <Logo name={b?.company_name ?? 'مُعين'} url={b?.logo_url} size="lg" />
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <div className="t-h1">{mode === 'setup' ? 'رمز الدخول السريع' : `أهلاً ${owner?.split(' ')[0] ?? ''}`}</div>
          <div className="muted t-small" style={{ minHeight: 20 }}>{msg ?? (mode === 'setup' ? 'اختر 4 أرقام تفتح بها التطبيق على هذا الجهاز' : 'أدخل رمز الدخول')}</div>
        </div>
        <div className={`pin-dots ${shake ? 'shake' : ''}`} aria-label={`${pin.length} من 4`}>
          {[0, 1, 2, 3].map((i) => <i key={i} className={i < pin.length ? 'on' : ''} />)}
        </div>
        <div className="pin-pad" dir="ltr">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => <button key={k} onClick={() => press(k)}>{fmtNum(Number(k))}</button>)}
          <span />
          <button onClick={() => press('0')}>{fmtNum(0)}</button>
          <button className="bare" onClick={() => press('del')} aria-label="حذف"><Delete size={26} /></button>
        </div>
        <div className="hstack" style={{ marginTop: 28 }}>
          {mode === 'setup' ? <Button variant="ghost" onClick={onDone}>لاحقاً</Button> : <Button variant="ghost" onClick={onUsePassword}>الدخول بكلمة المرور</Button>}
        </div>
      </div>
    </div>
  );
}
