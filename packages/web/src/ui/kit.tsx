import { AlertTriangle, Check, ChevronRight, Delete, Inbox, RefreshCw, Search, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { ApiError } from '../lib/api';
import { t } from '../lib/i18n';
import type { Tone } from '../lib/status';
import { fmtNum } from '../lib/format';

/* ─── Button ─── */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'danger-soft' | 'success' | 'secondary'; size?: 'sm' | 'md' | 'lg'; block?: boolean; loading?: boolean; icon?: ReactNode };
export function Button({ variant = 'secondary', size = 'md', block, loading, icon, children, className = '', disabled, ...rest }: BtnProps) {
  return (
    <button className={`btn ${variant === 'secondary' ? '' : variant} ${size === 'md' ? '' : size} ${block ? 'block' : ''} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}
export function IconButton({ label, children, badge, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; badge?: number }) {
  return (
    <button className="ibtn" aria-label={label} title={label} {...rest}>
      {children}
      {badge ? <span className="dot">{badge > 9 ? '9+' : fmtNum(badge)}</span> : null}
    </button>
  );
}
export function Badge({ tone = 'muted', children, dot = true, sm }: { tone?: Tone; children: ReactNode; dot?: boolean; sm?: boolean }) {
  return <span className={`badge tone-${tone} ${sm ? 'sm' : ''}`}>{dot && <i />}{children}</span>;
}
export function StatusBadge({ s, sm }: { s: { tone: Tone; label: string }; sm?: boolean }) {
  return <Badge tone={s.tone} sm={sm}>{s.label}</Badge>;
}

/* ─── Screen + header ─── */
export function Screen({ title, subtitle, back, actions, children, footer, noPad, onScrollBody, leading }: {
  title: ReactNode; subtitle?: ReactNode; back?: string | true; actions?: ReactNode; children: ReactNode; footer?: ReactNode; noPad?: boolean; onScrollBody?: (el: HTMLDivElement) => void; leading?: ReactNode;
}) {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <section className="screen screen-enter">
      <header className={`hdr ${scrolled ? 'scrolled' : ''}`}>
        <div className="hdr-row">
          {back ? (
            <IconButton label={t('common.back')} onClick={() => (back === true ? (history.length > 1 ? nav(-1) : nav('/')) : nav(back))}>
              <ChevronRight size={24} />
            </IconButton>
          ) : leading}
          <div className="hdr-title">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions}
        </div>
      </header>
      <div
        className="screen-body"
        ref={bodyRef}
        onScroll={(e) => { const el = e.currentTarget; setScrolled(el.scrollTop > 4); onScrollBody?.(el); }}
      >
        {noPad ? children : <div className="screen-pad">{children}</div>}
      </div>
      {footer}
    </section>
  );
}
export function ActionBar({ children, summary }: { children: ReactNode; summary?: ReactNode }) {
  return (
    <div className="sab">
      <div className="sab-inner">
        {summary ? <div className="sum">{summary}</div> : null}
        {children}
      </div>
    </div>
  );
}

/* ─── States: Skeleton / Empty / Error ─── */
export function Skeleton({ h = 56, w = '100%', r = 12, style }: { h?: number; w?: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="sk" style={{ height: h, width: w, borderRadius: r, ...style }} aria-hidden />;
}
export function ListSkeleton({ rows = 5, h = 64 }: { rows?: number; h?: number }) {
  return (
    <div className="stack" aria-busy="true" aria-label={t('common.loading')}>
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={h} r={14} />)}
    </div>
  );
}
export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="state">
      <div className="ill">{icon ?? <Inbox size={40} strokeWidth={1.5} />}</div>
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  );
}
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const e = error instanceof ApiError ? error : null;
  const [open, setOpen] = useState(false);
  return (
    <div className="state err">
      <div className="ill"><AlertTriangle size={40} strokeWidth={1.5} /></div>
      <h3>{e?.offline ? 'لا يوجد اتصال' : t('common.errorTitle')}</h3>
      <p>{e?.messageAr ?? 'حدث خطأ غير متوقع'}</p>
      {onRetry ? <Button icon={<RefreshCw size={18} />} onClick={onRetry} style={{ marginTop: 12 }}>{t('common.retry')}</Button> : null}
      <button className="btn ghost sm" onClick={() => setOpen(!open)} style={{ marginTop: 4 }}>{t('common.errorTech')}</button>
      {open ? <code className="t-cap faint mono" style={{ whiteSpace: 'pre-wrap' }}>{e ? `${e.status} ${e.code}` : String(error)}</code> : null}
    </div>
  );
}
/** Four-state wrapper: Skeleton → Error → Empty → Loaded */
export function Q<T>({ q, skeleton, empty, children }: { q: { data: T | undefined; isLoading: boolean; error: unknown; refetch: () => unknown }; skeleton?: ReactNode; empty?: (d: T) => ReactNode | null; children: (d: T) => ReactNode }) {
  if (q.isLoading) return <>{skeleton ?? <ListSkeleton />}</>;
  if (q.error && q.data === undefined) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  if (q.data === undefined) return <>{skeleton ?? <ListSkeleton />}</>;
  const e = empty?.(q.data);
  if (e) return <>{e}</>;
  return <>{children(q.data)}</>;
}

/* ─── Sheet (bottom on mobile, dialog on desktop) ─── */
export function Sheet({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>('input,textarea,select,button.primary')?.focus(), 60);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open, onClose]);
  // swipe-down to close
  const start = useRef<number | null>(null);
  if (!open) return null;
  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" ref={ref} style={wide ? { maxWidth: 820 } : undefined}
        onTouchStart={(e) => { const tgt = e.target as HTMLElement; if (tgt.closest('.sh-body') && (tgt.closest('.sh-body') as HTMLElement).scrollTop > 0) return; start.current = e.touches[0]?.clientY ?? null; }}
        onTouchMove={(e) => { if (start.current === null || !ref.current) return; const dy = (e.touches[0]?.clientY ?? 0) - start.current; if (dy > 0) ref.current.style.transform = `translateY(${dy}px)`; }}
        onTouchEnd={(e) => { if (start.current === null || !ref.current) return; const dy = (e.changedTouches[0]?.clientY ?? 0) - start.current; ref.current.style.transform = ''; start.current = null; if (dy > 110) onClose(); }}
      >
        <div className="grab" />
        {title ? (
          <div className="sh-head">
            <h3>{title}</h3>
            <IconButton label={t('common.close')} onClick={onClose}><X size={22} /></IconButton>
          </div>
        ) : null}
        <div className="sh-body">{children}</div>
        {footer ? <div className="sh-foot">{footer}</div> : null}
      </div>
    </>,
    document.body,
  );
}

/* ─── Confirm ─── */
type ConfirmOpts = { title: string; text?: string; confirm?: string; danger?: boolean; input?: { label: string; placeholder?: string; min?: number } };
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<string | false>>(async () => false);
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [st, setSt] = useState<(ConfirmOpts & { resolve: (v: string | false) => void }) | null>(null);
  const [val, setVal] = useState('');
  const ask = useCallback((o: ConfirmOpts) => new Promise<string | false>((resolve) => { setVal(''); setSt({ ...o, resolve }); }), []);
  const done = (v: string | false) => { st?.resolve(v); setSt(null); };
  const minLen = st?.input?.min ?? 0;
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      <Sheet open={!!st} onClose={() => done(false)} title={st?.title}
        footer={<>
          <Button block onClick={() => done(false)}>{t('common.cancel')}</Button>
          <Button block variant={st?.danger ? 'danger' : 'primary'} disabled={val.trim().length < minLen} onClick={() => done(st?.input ? val.trim() : 'yes')}>{st?.confirm ?? t('common.confirm')}</Button>
        </>}>
        {st?.text ? <p className="muted" style={{ marginTop: 0 }}>{st.text}</p> : null}
        {st?.input ? (
          <div className="field">
            <label>{st.input.label}</label>
            <textarea className="inp" value={val} onChange={(e) => setVal(e.target.value)} placeholder={st.input.placeholder} rows={3} />
          </div>
        ) : null}
      </Sheet>
    </ConfirmCtx.Provider>
  );
}
export const useConfirm = () => useContext(ConfirmCtx);

/* ─── Toast ─── */
type ToastT = { id: number; text: string; err?: boolean; action?: { label: string; on: () => void } };
const ToastCtx = createContext<(text: string, o?: { err?: boolean; action?: ToastT['action'] }) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [t1, setT] = useState<ToastT | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((text: string, o?: { err?: boolean; action?: ToastT['action'] }) => {
    window.clearTimeout(timer.current);
    setT({ id: Date.now(), text, ...o });
    timer.current = window.setTimeout(() => setT(null), o?.err ? 5000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t1 ? createPortal(
        <div className="toast-wrap" role="status" aria-live="polite">
          <div key={t1.id} className={`toast ${t1.err ? 'err' : ''}`}>
            <span className="ic">{t1.err ? <AlertTriangle size={20} /> : <Check size={20} />}</span>
            <span>{t1.text}</span>
            {t1.action ? <button className="btn sm ghost" style={{ color: 'inherit' }} onClick={() => { t1.action?.on(); setT(null); }}>{t1.action.label}</button> : null}
          </div>
        </div>, document.body) : null}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
export function useErrToast() {
  const toast = useToast();
  return (e: unknown) => toast(e instanceof ApiError ? e.messageAr : 'حدث خطأ غير متوقع', { err: true });
}

/* ─── Search, chips, segmented, switch ─── */
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="search">
      <Search size={20} />
      <input type="search" inputMode="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? t('common.search')} aria-label={placeholder ?? t('common.search')} />
      {value ? <button className="clr" onClick={() => onChange('')} aria-label={t('common.clear')}><X size={18} /></button> : null}
    </div>
  );
}
export function Chips<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { v: T; label: string; n?: number }[] }) {
  return (
    <div className="chips" role="tablist">
      {items.map((i) => (
        <button key={i.v} role="tab" aria-selected={value === i.v} className={`chip ${value === i.v ? 'on' : ''}`} onClick={() => onChange(i.v)}>
          {i.label}{i.n !== undefined ? <span className="n">{fmtNum(i.n)}</span> : null}
        </button>
      ))}
    </div>
  );
}
export function Segmented<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { v: T; label: string }[] }) {
  return (
    <div className="seg" role="tablist">
      {items.map((i) => <button key={i.v} role="tab" aria-selected={value === i.v} className={value === i.v ? 'on' : ''} onClick={() => onChange(i.v)}>{i.label}</button>)}
    </div>
  );
}
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button role="switch" aria-checked={on} aria-label={label} className={`switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />;
}
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

/* ─── NumberPad (W2b) ─── */
export function NumberPad({ open, onClose, title, unit, decimals = 0, initial, onDone, onNext, max }: {
  open: boolean; onClose: () => void; title: string; unit?: string; decimals?: number; initial: number; onDone: (v: number) => void; onNext?: (v: number) => void; max?: number;
}) {
  const [s, setS] = useState('');
  useEffect(() => { if (open) setS(initial ? String(initial) : ''); }, [open, initial]);
  const press = (k: string) => {
    setS((cur) => {
      if (k === 'del') return cur.slice(0, -1);
      if (k === '.') return decimals > 0 && !cur.includes('.') ? (cur || '0') + '.' : cur;
      const [, frac] = cur.split('.');
      if (frac !== undefined && frac.length >= decimals) return cur;
      const next = cur === '0' ? k : cur + k;
      return next.length > 9 ? cur : next;
    });
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('del');
      else if (e.key === '.' || e.key === ',') press('.');
      else if (e.key === 'Enter') { e.preventDefault(); onDone(Number(s || 0)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const v = Number(s || 0);
  const over = max !== undefined && v > max;
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="pad-display" aria-live="polite">
        <span className="v" style={over ? { color: 'var(--danger)' } : undefined}>{s ? fmtNum(v, decimals) : '0'}</span>
        {unit ? <span className="u">{unit}</span> : null}
        {over ? <div className="t-small" style={{ color: 'var(--danger-ink)' }}>المتاح {fmtNum(max)} {unit}</div> : null}
      </div>
      <div className="numpad" dir="ltr">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => <button key={k} onClick={() => press(k)}>{fmtNum(Number(k))}</button>)}
        <button onClick={() => press('.')} disabled={decimals === 0} style={decimals === 0 ? { opacity: 0.3 } : undefined}>.</button>
        <button onClick={() => press('0')}>{fmtNum(0)}</button>
        <button onClick={() => press('del')} aria-label="حذف"><Delete size={24} /></button>
      </div>
      <div className="stack" style={{ marginTop: 14, gap: 8 }}>
        <Button variant="primary" size="lg" block onClick={() => onDone(v)}>{t('common.done')}</Button>
        <div className="split">
          <Button variant="ghost" onClick={() => setS('')}>{t('common.clear')}</Button>
          {onNext ? <Button variant="ghost" onClick={() => onNext(v)}>التالي ↓</Button> : null}
        </div>
      </div>
    </Sheet>
  );
}

/* ─── SignaturePad ─── */
export function SignaturePad({ onChange }: { onChange: (pngBase64: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [has, setHas] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr; c.height = r.height * dpr;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.5; ctx.strokeStyle = '#1d1712';
  }, []);
  const pos = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const exportPng = () => {
    const c = ref.current; if (!c) return;
    // downscale to keep the payload ≤ 50KB (E-rule)
    const out = document.createElement('canvas'); const w = 480; out.width = w; out.height = Math.round((c.height / c.width) * w);
    const o = out.getContext('2d'); if (!o) return;
    o.fillStyle = '#fff'; o.fillRect(0, 0, out.width, out.height); o.drawImage(c, 0, 0, out.width, out.height);
    onChange(out.toDataURL('image/png').split(',')[1] ?? null);
  };
  return (
    <div>
      <div className="split" style={{ marginBottom: 6 }}>
        <span className="t-small muted" style={{ fontWeight: 500 }}>توقيع المستلم</span>
        <button className="btn ghost sm" disabled={!has} onClick={() => { const c = ref.current; c?.getContext('2d')?.clearRect(0, 0, c.width, c.height); setHas(false); onChange(null); }}>{t('common.clear')}</button>
      </div>
      <div className="sigpad">
        <canvas ref={ref}
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drawing.current = true; last.current = pos(e); }}
          onPointerMove={(e) => {
            if (!drawing.current || !last.current) return;
            const ctx = ref.current?.getContext('2d'); if (!ctx) return;
            const p = pos(e); ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last.current = p; if (!has) setHas(true);
          }}
          onPointerUp={() => { drawing.current = false; last.current = null; if (has) exportPng(); }}
          onPointerLeave={() => { if (drawing.current) { drawing.current = false; if (has) exportPng(); } }}
        />
        <div className="base" />
        {!has ? <div className="ph">وقّع هنا بإصبعك</div> : null}
      </div>
    </div>
  );
}

export function useDebounced<T>(v: T, ms = 150): T {
  const [d, setD] = useState(v);
  useEffect(() => { const id = setTimeout(() => setD(v), ms); return () => clearTimeout(id); }, [v, ms]);
  return d;
}
export function Logo({ name, url, size }: { name: string; url?: string | null; size?: 'lg' }) {
  return <div className={`logo-mark ${size ?? ''}`}>{url ? <img src={url} alt="" /> : (name.replace(/^(مخابز|مخبز|حلويات)\s+/, '').replace(/^ال/, '')[0] ?? 'م')}</div>;
}
