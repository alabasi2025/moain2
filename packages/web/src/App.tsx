import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { ApiError, onUnauthenticated } from './lib/api';
import { invalidate } from './lib/queries';
import { hasRole, savedDevice, useSession } from './lib/session';
import { setOnFlushed, startOutbox } from './lib/outbox';
import { loadMe, LoginScreen, PinScreen } from './screens/Auth';
import { AppShell } from './ui/Shell';
import { Logo, useToast } from './ui/kit';
import { HomeScreen } from './screens/Home';
import { OrderEntryScreen, OrderReviewScreen } from './screens/branch/OrderEntry';
import { OrderDetailScreen, OrdersHistoryScreen } from './screens/branch/Orders';
import { ReceiveListScreen } from './screens/branch/Receive';
import { ProductionListScreen, ProductionDetailScreen, ExceptionsScreen } from './screens/plant/Production';
import { DeliverListScreen, DeliverScreen, DeliveriesScreen } from './screens/plant/Deliver';
import { MovementNewScreen } from './screens/store/Movement';
import { MaterialsScreen, MaterialCardScreen } from './screens/store/Materials';
import { VouchersScreen, VoucherDetailScreen } from './screens/store/Vouchers';
import { StockOverviewScreen, StockHubScreen, MovementsLogScreen } from './screens/store/Stock';
import { ReportsScreen } from './screens/admin/Reports';
import { SettingsRoutes } from './screens/admin/Settings';
import { MoreScreen, NotificationsScreen } from './screens/More';
import { PrintProduction, PrintDelivery, PrintVoucher, PrintStock } from './print/Print';

const IDLE_LOCK_MS = 10 * 60_000;

export function App() {
  const me = useSession((s) => s.me);
  const locked = useSession((s) => s.locked);
  const [boot, setBoot] = useState<'loading' | 'login' | 'pin' | 'ready'>('loading');
  const [askPin, setAskPin] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadMe()
      .then(() => setBoot('ready'))
      .catch((e) => setBoot(e instanceof ApiError && e.status === 401 && savedDevice() ? 'pin' : 'login'));
    const off = onUnauthenticated(() => { useSession.getState().setMe(null); setBoot(savedDevice() ? 'pin' : 'login'); });
    setOnFlushed((it) => { toast(`تم إرسال ${it.label} ✓`); void invalidate('/orders', '/production', '/dashboard', '/windows'); });
    startOutbox();
    return () => { off(); };
  }, [toast]);

  useEffect(() => { if (me && boot !== 'ready') setBoot('ready'); }, [me, boot]);
  // offer quick-unlock PIN once per device (A5)
  useEffect(() => { if (me && !me.user.has_pin && !localStorage.getItem('moain.pinAsked')) setAskPin(true); }, [me]);

  // idle → PIN lock (only when the user has a PIN)
  useEffect(() => {
    if (!me?.user.has_pin) return;
    let last = Date.now();
    const bump = () => { last = Date.now(); };
    const tick = setInterval(() => { if (Date.now() - last > IDLE_LOCK_MS) useSession.getState().lock(); }, 15_000);
    const vis = () => { if (document.visibilityState === 'visible' && Date.now() - last > IDLE_LOCK_MS) useSession.getState().lock(); else bump(); };
    ['pointerdown', 'keydown'].forEach((e) => window.addEventListener(e, bump));
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(tick); ['pointerdown', 'keydown'].forEach((e) => window.removeEventListener(e, bump)); document.removeEventListener('visibilitychange', vis); };
  }, [me?.user.has_pin]);

  if (boot === 'loading') return <Splash />;
  if (boot === 'pin' && !me) return <PinScreen mode="unlock" onDone={() => setBoot('ready')} onUsePassword={() => setBoot('login')} />;
  if (!me) return <LoginScreen />;
  if (askPin) return <PinScreen mode="setup" onDone={() => { localStorage.setItem('moain.pinAsked', '1'); setAskPin(false); }} />;

  return (
    <>
      <Routes>
        <Route path="/print/production/:id" element={<PrintProduction />} />
        <Route path="/print/delivery/:id" element={<PrintDelivery />} />
        <Route path="/print/voucher/:id" element={<PrintVoucher />} />
        <Route path="/print/stock" element={<PrintStock />} />
        <Route element={<AppShell />}>
          <Route index element={<HomeScreen />} />
          {/* branch */}
          <Route path="order" element={<Guard roles={['branch_user', 'owner', 'admin']}><OrderEntryScreen /></Guard>} />
          <Route path="order/review" element={<Guard roles={['branch_user', 'owner', 'admin']}><OrderReviewScreen /></Guard>} />
          <Route path="orders" element={<OrdersHistoryScreen />} />
          <Route path="orders/:id" element={<OrderDetailScreen />} />
          <Route path="receive" element={<ReceiveListScreen />} />
          {/* plant */}
          <Route path="production" element={<ProductionListScreen />} />
          <Route path="production/:id" element={<ProductionDetailScreen />} />
          <Route path="exceptions" element={<ExceptionsScreen />} />
          <Route path="deliver" element={<DeliverListScreen />} />
          <Route path="deliver/:orderId" element={<DeliverScreen />} />
          <Route path="deliveries" element={<DeliveriesScreen />} />
          {/* store */}
          <Route path="movement/new" element={<MovementNewScreen />} />
          <Route path="materials" element={<MaterialsScreen />} />
          <Route path="materials/:id" element={<MaterialCardScreen />} />
          <Route path="vouchers" element={<VouchersScreen />} />
          <Route path="vouchers/:id" element={<VoucherDetailScreen />} />
          <Route path="stock" element={<StockHubScreen />} />
          <Route path="stock/overview" element={<StockOverviewScreen />} />
          <Route path="movements" element={<MovementsLogScreen />} />
          {/* admin */}
          <Route path="reports" element={<ReportsScreen />} />
          <Route path="settings/*" element={<SettingsRoutes />} />
          <Route path="more" element={<MoreScreen />} />
          <Route path="notifications" element={<NotificationsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {locked ? <PinScreen mode="unlock" onDone={() => useSession.getState().unlock()} onUsePassword={() => { useSession.getState().setMe(null); setBoot('login'); }} /> : null}
    </>
  );
}

function Guard({ roles, children }: { roles: string[]; children: ReactNode }) {
  const me = useSession((s) => s.me);
  if (!me || !hasRole(me, ...roles)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div style={{ height: '100dvh', display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, animation: 'fadeIn .4s both' }}>
        <Logo name="مُعين" size="lg" />
        <div className="sk" style={{ width: 120, height: 8, borderRadius: 8 }} />
      </div>
    </div>
  );
}
