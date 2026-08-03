import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarDays,
  CalendarPlus,
  ChartNoAxesCombined,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Scissors,
  Store,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { UserEndpoint } from '../generated/endpoints.js';

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

const navItems: Record<string, NavItem[]> = {
  Admin: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Pendaftaran', path: '/admin/registrations', icon: ClipboardList },
    { label: 'User', path: '/admin/users', icon: Users },
    { label: 'Layanan', path: '/admin/services', icon: Scissors },
    { label: 'Booking', path: '/admin/bookings', icon: CalendarDays },
  ],
  Barber: [
    { label: 'Dashboard', path: '/barber', icon: LayoutDashboard },
    { label: 'Pesanan Masuk', path: '/barber/bookings', icon: ClipboardList },
    { label: 'Jadwal Saya', path: '/barber/schedules', icon: Clock3 },
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

  useEffect(() => {
    UserEndpoint.getCurrentUser().then((currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser as UserInfo);
    });
  }, [navigate]);

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
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/95 text-zinc-100 backdrop-blur-xl',
          'transition-transform duration-200 ease-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-brand-400/30 bg-gradient-to-br from-brand-400/20 to-zinc-900 text-brand-300 shadow-md shadow-brand-500/10">
              <Scissors size={18} />
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-transparent bg-gradient-to-r from-brand-200 via-brand-400 to-amber-200 bg-clip-text">
                dicukur.in
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Barber booking</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup menu"
            className="grid size-9 place-items-center text-zinc-400 transition-colors hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
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
        <div className="border-t border-zinc-800/80 bg-zinc-900/40 px-5 py-4 backdrop-blur-sm">
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

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-300 lg:inline-block">
              {user?.role ?? 'Customer'}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 text-xs font-semibold text-zinc-300 transition-all duration-200 hover:border-brand-400/40 hover:bg-zinc-900 hover:text-brand-300"
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

