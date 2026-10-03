import type { NavTab } from '@moain/shared';
import {
  BarChart3, Bell, Boxes, ClipboardList, Factory, History, Home, LayoutDashboard, Menu, PackageCheck, Receipt, Settings, ArrowDownUp, Truck, WifiOff, CloudUpload, Library, Store,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { initials } from '../lib/format';
import { t } from '../lib/i18n';
import { useApi } from '../lib/queries';
import { hasRole, useMe } from '../lib/session';
import { useOutbox } from '../lib/outbox';
import { Logo } from './kit';

export const TAB_PATH: Record<NavTab, string> = {
  home: '/', order: '/order', receive: '/receive', history: '/orders', production: '/production', deliver: '/deliver', reports: '/reports',
  movement: '/movement/new', materials: '/materials', vouchers: '/vouchers', stock: '/stock', settings: '/settings', more: '/more',
};
const ICON: Record<NavTab, (p: { size: number }) => ReactNode> = {
  home: (p) => <Home {...p} />, order: (p) => <ClipboardList {...p} />, receive: (p) => <PackageCheck {...p} />, history: (p) => <History {...p} />,
  production: (p) => <Factory {...p} />, deliver: (p) => <Truck {...p} />, reports: (p) => <BarChart3 {...p} />, movement: (p) => <ArrowDownUp {...p} />,
  materials: (p) => <Library {...p} />, vouchers: (p) => <Receipt {...p} />, stock: (p) => <Boxes {...p} />, settings: (p) => <Settings {...p} />, more: (p) => <Menu {...p} />,
};
const isActive = (tab: NavTab, path: string) => {
  const base = TAB_PATH[tab];
  if (tab === 'home') return path === '/';
  if (tab === 'movement') return path.startsWith('/movement');
  if (tab === 'stock') return path.startsWith('/stock') || path.startsWith('/materials') || path.startsWith('/vouchers') || path.startsWith('/movements');
  if (tab === 'history') return path.startsWith('/orders');
  if (tab === 'order') return path === '/order' || path.startsWith('/order/');
  if (tab === 'settings') return path.startsWith('/settings');
  return path.startsWith(base);
};
const label = (tab: NavTab, admin: boolean) => (tab === 'home' && admin ? t('nav.dashboard') : t(`nav.${tab}`));

export function useUnread() {
  const q = useApi<{ unread: number }>('/notifications', { refetchInterval: 30_000 });
  return q.data?.unread ?? 0;
}

function SyncBar() {
  const { online, items } = useOutbox();
  const pending = items.length;
  if (online && pending === 0) return null;
  return (
    <div className={`syncbar ${online ? 'tone-info' : 'tone-warning'}`} role="status">
      {online ? <CloudUpload size={15} /> : <WifiOff size={15} />}
      {online ? `${pending} بانتظار الإرسال — جارٍ المزامنة…` : pending ? `غير متصل · ${pending} بانتظار الإرسال` : 'غير متصل — يمكنك المتابعة وسيُرسل تلقائياً'}
    </div>
  );
}

/** Full-screen task routes hide the bottom nav (W2: “التركيز على المهمة”). */
const FOCUS = [/^\/order$/, /^\/order\/review$/, /^\/movement\/new/, /^\/deliver\/[^/]+$/, /^\/receive\/[^/]+$/];

export function AppShell() {
  const me = useMe();
  const loc = useLocation();
  const unread = useUnread();
  const admin = hasRole(me, 'owner', 'admin');
  const focus = FOCUS.some((r) => r.test(loc.pathname));
  const tabs = me.nav;
  const extra: { to: string; label: string; icon: ReactNode }[] = [];
  if (admin) {
    extra.push({ to: '/deliver', label: t('nav.deliver'), icon: <Truck size={20} /> });
    extra.push({ to: '/movements', label: 'دفتر الحركة اليومية', icon: <ArrowDownUp size={20} /> });
    extra.push({ to: '/materials', label: t('nav.materials'), icon: <Library size={20} /> });
    extra.push({ to: '/vouchers', label: t('nav.vouchers'), icon: <Receipt size={20} /> });
    extra.push({ to: '/order', label: 'طلبية فرع', icon: <Store size={20} /> });
  }
  if (hasRole(me, 'storekeeper') && !admin) extra.push({ to: '/stock', label: 'حالة المخزون', icon: <Boxes size={20} /> }, { to: '/movements', label: 'دفتر الحركة اليومية', icon: <ArrowDownUp size={20} /> });

  return (
    <div className="app">
      <aside className="side" aria-label="القائمة">
        <div className="brandrow">
          <Logo name={me.branding.company_name} url={me.branding.logo_url} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{me.branding.company_name}</div>
            <div className="t-cap faint">{t('app.tagline')}</div>
          </div>
        </div>
        {tabs.filter((x) => x !== 'more').map((tab) => (
          <NavLink key={tab} to={TAB_PATH[tab]} className={() => (isActive(tab, loc.pathname) ? 'active' : '')} end={tab === 'home'}>
            {ICON[tab]({ size: 21 })}<span>{label(tab, admin)}</span>
          </NavLink>
        ))}
        {extra.length ? <div className="sect">اختصارات</div> : null}
        {extra.map((x) => <NavLink key={x.to} to={x.to} className={({ isActive: a }) => (a ? 'active' : '')}>{x.icon}<span>{x.label}</span></NavLink>)}
        <div className="sect">الحساب</div>
        <NavLink to="/notifications" className={({ isActive: a }) => (a ? 'active' : '')}><Bell size={21} /><span>الإشعارات</span>{unread ? <span className="cnt">{unread}</span> : null}</NavLink>
        <NavLink to="/more" className={({ isActive: a }) => (a ? 'active' : '')}><Menu size={21} /><span>{t('nav.more')}</span></NavLink>
        <div className="me">
          <div className="avatar">{initials(me.user.full_name)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{me.user.full_name}</div>
            <div className="t-cap faint">{me.roles.map((r) => t(`roles.${r}`)).join('، ')}</div>
          </div>
        </div>
      </aside>
      <main className="app-main">
        <SyncBar />
        <Outlet />
        {!focus ? (
          <nav className="bnav" aria-label="التنقل الرئيسي">
            {tabs.map((tab) => (
              <NavLink key={tab} to={TAB_PATH[tab]} className={() => (isActive(tab, loc.pathname) ? 'active' : '')} end={tab === 'home'}>
                <span className="pill">{ICON[tab]({ size: 23 })}</span>
                <span>{label(tab, admin)}</span>
                {(tab === 'more' || tab === 'settings') && unread ? <span className="dot">{unread > 9 ? '9+' : unread}</span> : null}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </main>
    </div>
  );
}

export function NotifBell() {
  const unread = useUnread();
  return (
    <NavLink to="/notifications" className="ibtn hide-d" aria-label="الإشعارات" style={{ color: 'inherit' }}>
      <Bell size={22} />
      {unread ? <span className="dot">{unread > 9 ? '9+' : unread}</span> : null}
    </NavLink>
  );
}
export { LayoutDashboard };
