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
    <div className="flex h-dvh overflow-hidden bg-zinc-50 text-zinc-900">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Tutup navigasi"
            className="fixed inset-0 z-20 bg-zinc-950/45 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100',
          'transition-transform duration-200 ease-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
          <div>
            <p className="text-base font-semibold text-white">dicukur.in</p>
            <p className="text-xs text-zinc-400">Barber booking system</p>
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

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.split('/').length === 2}
                className={({ isActive }) => [
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
                ].join(' ')}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 px-5 py-4">
          <p className="truncate text-sm font-medium text-zinc-200">{user?.name}</p>
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            aria-label="Buka menu"
            className="grid size-10 place-items-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <p className="hidden text-xs font-medium uppercase text-zinc-400 lg:block">
            {user?.role ?? 'Memuat'}
          </p>

          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            onClick={handleLogout}
          >
            <LogOut size={16} />
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
