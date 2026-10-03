import { Bell, KeyRound, LogOut, Moon, Settings, Truck, History, Factory } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { post } from '../lib/api';
import { fmtRelative } from '../lib/format';
import { t } from '../lib/i18n';
import { useApi, invalidate } from '../lib/queries';
import { hasRole, useMe, useSession } from '../lib/session';
import { getTheme, setTheme, type ThemeMode } from '../lib/theme';
import type { Notification } from '../lib/types';
import { Button, Empty, Q, Screen, Segmented } from '../ui/kit';
import { PinScreen } from './Auth';

export function MoreScreen() {
  const me = useMe();
  const [theme, setT] = useState<ThemeMode>(getTheme());
  const [pin, setPin] = useState(false);
  if (pin) return <PinScreen mode="setup" onDone={() => setPin(false)} />;
  return (
    <Screen title="المزيد">
      <div className="content-narrow stack">
        <div className="card pad hstack"><div className="avatar">{me.user.full_name[0]}</div><div><b>{me.user.full_name}</b><div className="t-small muted">{me.roles.map((r) => t(`roles.${r}`)).join('، ')} · {me.branding.company_name}</div></div></div>
        <div className="list">
          <Link to="/notifications" className="row"><Bell size={20} /><div className="grow ttl">الإشعارات</div></Link>
          {hasRole(me, 'plant_manager', 'plant_staff', 'owner', 'admin') ? <><Link to="/production" className="row"><Factory size={20} /><div className="grow ttl">أوامر الإنتاج</div></Link><Link to="/deliveries" className="row"><Truck size={20} /><div className="grow ttl">سجل التسليمات</div></Link></> : null}
          {hasRole(me, 'branch_user') ? <Link to="/orders" className="row"><History size={20} /><div className="grow ttl">سجل الطلبيات</div></Link> : null}
          {hasRole(me, 'owner', 'admin') ? <Link to="/settings" className="row"><Settings size={20} /><div className="grow ttl">الإعدادات</div></Link> : null}
          <button className="row" onClick={() => setPin(true)}><KeyRound size={20} /><div className="grow ttl">{me.user.has_pin ? 'تغيير رمز الدخول السريع' : 'تعيين رمز الدخول السريع'}</div></button>
        </div>
        <div className="card pad"><div className="hstack" style={{ marginBottom: 10 }}><Moon size={18} /><b>المظهر</b></div><Segmented value={theme} onChange={(v) => { setT(v); setTheme(v); }} items={[{ v: 'light', label: 'فاتح' }, { v: 'dark', label: 'داكن' }, { v: 'system', label: 'تلقائي' }]} /></div>
        <Button variant="danger-soft" icon={<LogOut size={18} />} onClick={async () => { await post('/auth/logout').catch(() => null); localStorage.removeItem('moain.device'); useSession.getState().setMe(null); location.href = '/'; }}>{t('common.logout')}</Button>
      </div>
    </Screen>
  );
}

export function NotificationsScreen() {
  const q = useApi<{ items: Notification[]; unread: number }>('/notifications');
  return (
    <Screen title="الإشعارات" back actions={<Button size="sm" variant="ghost" onClick={async () => { await post('/notifications/read-all'); void invalidate('/notifications'); }}>تعليم الكل كمقروء</Button>}>
      <Q q={q} empty={(d) => (d.items.length ? null : <Empty icon={<Bell size={40} strokeWidth={1.5} />} title="لا إشعارات" />)}>
        {(d) => (
          <div className="content-narrow list">
            {d.items.map((n) => {
              const p = n.payload ? (JSON.parse(n.payload) as Record<string, string>) : {};
              const to = p.order_id ? `/orders/${p.order_id}` : p.production_order_id ? `/production/${p.production_order_id}` : p.raw_material_id ? `/materials/${p.raw_material_id}` : '#';
              return (
                <Link key={n.id} to={to} className="row" style={!n.read_at ? { background: 'var(--brand-50)' } : undefined}>
                  <Bell size={18} style={{ color: n.read_at ? 'var(--ink-3)' : 'var(--brand-text)' }} />
                  <div className="grow"><div className="ttl" style={{ fontWeight: n.read_at ? 400 : 600 }}>{n.title_ar}</div>{n.body_ar ? <div className="sub">{n.body_ar}</div> : null}</div>
                  <span className="t-cap faint">{fmtRelative(n.created_at)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </Q>
    </Screen>
  );
}
