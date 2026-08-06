import { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  ChartNoAxesCombined,
  ClipboardList,
  Clock3,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Scissors,
  Store,
  UserRound,
  Users,
  X,
  CheckCheck,
  type LucideIcon,
} from 'lucide-react';
import { UserEndpoint, NotificationEndpoint } from '../generated/endpoints.js';

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const navItems: Record<string, NavItem[]> = {
  Admin: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Pendaftaran', path: '/admin/registrations', icon: ClipboardList },
    { label: 'User', path: '/admin/users', icon: Users },
    { label: 'Layanan', path: '/admin/services', icon: Scissors },
    { label: 'Booking', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Pembayaran', path: '/admin/payments', icon: CreditCard },
    { label: 'Laporan', path: '/admin/reports', icon: ChartNoAxesCombined },
  ],
  Barber: [
    { label: 'Dashboard', path: '/barber', icon: LayoutDashboard },
    { label: 'Pesanan Masuk', path: '/barber/bookings', icon: ClipboardList },
    { label: 'Jadwal Saya', path: '/barber/schedule', icon: Clock3 },
    { label: 'Riwayat', path: '/barber/history', icon: History },
    { label: 'Profil Saya', path: '/barber/profile', icon: UserRound },
  ],
  Owner: [
    { label: 'Dashboard', path: '/owner', icon: LayoutDashboard },
    { label: 'Profil Barbershop', path: '/owner/profile', icon: Store },
    { label: 'Karyawan', path: '/owner/staff', icon: UserRound },
    { label: 'Booking', path: '/owner/bookings', icon: CalendarDays },
    { label: 'Laporan', path: '/owner/reports', icon: ChartNoAxesCombined },
  ],
  Customer: [
    { label: 'Dashboard', path: '/customer', icon: LayoutDashboard },
    { label: 'Pesan Barber', path: '/customer/bookings/new', icon: CalendarPlus },
    { label: 'Alamat Saya', path: '/customer/addresses', icon: MapPin },
    { label: 'Pesanan Saya', path: '/customer/bookings', icon: ClipboardList },
  ],
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [list, count] = await Promise.all([
        NotificationEndpoint.getMyNotifications(),
        NotificationEndpoint.getUnreadCount(),
      ]);
      setNotifications((list as NotificationItem[]) || []);
      setUnreadCount(Number(count) || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    UserEndpoint.getCurrentUser().then((currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser as UserInfo);
      void fetchNotifications();
    });

    const interval = setInterval(() => {
      void fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationEndpoint.markAsRead(id);
      await fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationEndpoint.markAllAsRead();
      await fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await fetch('/logout', { method: 'POST' });
    navigate('/login');
  };

  const items = user ? (navItems[user.role] ?? []) : [];

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-950 text-zinc-100">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Tutup navigasi"
            className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-md lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/95 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand Header */}
        <div className="relative flex h-16 items-center justify-between border-b border-zinc-800/80 px-6 overflow-hidden">
          <div
            className="absolute top-0 left-0 bottom-0 w-1.5"
            style={{ background: 'linear-gradient(180deg, #dc2626, #f8fafc, #2563eb)' }}
          />
          <div className="flex items-center gap-3 pl-2">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/20">
              <Scissors size={18} />
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-zinc-100">dicukur.in</p>
              <p className="text-[10px] font-semibold tracking-wider text-brand-400 uppercase">Barber Booking</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup menu"
            className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-4 pl-5">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.split('/').length === 2}
                className={({ isActive }) => [
                  'group relative flex h-11 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-brand-500/20 via-brand-400/10 to-transparent text-brand-300 border-l-2 border-brand-400 shadow-sm shadow-brand-500/5'
                    : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100',
                ].join(' ')}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Footer */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/40 px-5 py-4 backdrop-blur-sm pl-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full border border-brand-400/30 bg-zinc-900 text-xs font-bold text-brand-300 uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-200">{user?.name}</p>
              <p className="truncate text-[11px] text-zinc-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-zinc-950">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            aria-label="Buka menu"
            className="grid size-10 place-items-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 ml-auto mr-3">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                className="relative grid size-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-950/60">
                      <div className="flex items-center gap-2">
                        <Bell size={15} className="text-brand-400" />
                        <span className="text-xs font-bold text-zinc-200">Notifikasi</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-300">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[11px] font-semibold text-brand-400 hover:text-brand-300"
                          onClick={handleMarkAllAsRead}
                        >
                          <CheckCheck size={13} />
                          Tandai Semua
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-500">Tidak ada notifikasi</div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={`w-full p-3.5 text-left transition-colors hover:bg-zinc-800/50 ${
                              !n.isRead ? 'bg-brand-500/5' : ''
                            }`}
                            onClick={() => void handleMarkAsRead(n.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold ${!n.isRead ? 'text-brand-300' : 'text-zinc-300'}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-zinc-500 shrink-0">{n.createdAt}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{n.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="hidden rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-300 lg:inline-block">
              {user?.role ?? 'Customer'}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 text-xs font-semibold text-zinc-300 transition-all duration-200 hover:border-barber-red/40 hover:bg-zinc-900 hover:text-barber-red-light"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </header>

        <motion.main
          key={location.pathname}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
