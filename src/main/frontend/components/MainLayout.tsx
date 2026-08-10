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
  Shield,
  Briefcase,
  User,
  Sparkles,
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

const roleConfig: Record<string, { label: string; badgeBg: string; badgeText: string; badgeBorder: string; icon: LucideIcon }> = {
  Admin: {
    label: 'ADMINISTRATOR',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200',
    icon: Shield,
  },
  Owner: {
    label: 'PEMILIK MITRA',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    icon: Briefcase,
  },
  Barber: {
    label: 'BARBER MITRA',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    icon: Scissors,
  },
  Customer: {
    label: 'PELANGGAN',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    icon: User,
  },
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

  const userRole = user?.role ?? 'Customer';
  const currentRoleConfig = roleConfig[userRole] || roleConfig.Customer;
  const RoleIcon = currentRoleConfig.icon;
  const items = user ? (navItems[user.role] ?? navItems.Customer) : [];

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Tutup navigasi"
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-sm',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand Header */}
        <div className="relative flex h-16 items-center justify-between border-b border-slate-200 px-5">
          {/* Barber Pole Strip accent: Red, White, Blue */}
          <div
            className="absolute top-0 left-0 bottom-0 w-1.5"
            style={{ background: 'linear-gradient(180deg, #dc2626 0%, #ffffff 50%, #2563eb 100%)' }}
          />
          <div className="flex items-center gap-3 pl-2">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-red-600 via-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/20">
              <Scissors size={18} />
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-slate-900">dicukur.in</p>
              <p className="text-[10px] font-bold tracking-wider text-red-600 uppercase">Barber Platform</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup menu"
            className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </p>
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.split('/').length === 2}
                className={({ isActive }) => [
                  'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
                ].join(' ')}
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Footer */}
        <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-600 uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">{user?.name || 'Pengguna'}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email || 'user@dicukur.in'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Buka menu"
              className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            {/* Role Badge Indicator in Navbar */}
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeText} ${currentRoleConfig.badgeBorder}`}>
              <RoleIcon size={14} />
              <span className="tracking-wide text-[11px]">{currentRoleConfig.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label="Notifikasi"
                className="relative grid size-9 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Bell size={15} className="text-blue-600" />
                        <span className="text-xs font-bold text-slate-800">Notifikasi System</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          onClick={handleMarkAllAsRead}
                        >
                          <CheckCheck size={13} />
                          Tandai Semua
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">Tidak ada notifikasi baru</div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={`w-full p-3.5 text-left transition-colors hover:bg-slate-50 ${
                              !n.isRead ? 'bg-blue-50/50 border-l-2 border-blue-600' : ''
                            }`}
                            onClick={() => void handleMarkAsRead(n.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold ${!n.isRead ? 'text-blue-700' : 'text-slate-700'}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-400 shrink-0">{n.createdAt}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-3.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          key={location.pathname}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

