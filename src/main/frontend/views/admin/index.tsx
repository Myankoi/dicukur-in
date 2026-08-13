import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { motion } from 'motion/react';
import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Users,
  Store,
  Scissors,
  Star,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { AdminMonitoringEndpoint } from '../../generated/endpoints.js';

interface ReportSummary {
  totalRevenue: number;
  completedBookings: number;
  cancelledBookings: number;
  totalUsers: number;
  totalBarbers: number;
  totalBarbershops: number;
  topBarbers: {
    barberId: number;
    barberName: string;
    barbershopName: string;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    averageRating: number;
  }[];
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    AdminMonitoringEndpoint.getReportSummary()
      .then((res: any) => setSummary(res))
      .catch((err: any) => setError(err?.message || 'Gagal memuat ringkasan admin'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Omzet (Selesai)',
      value: `Rp ${Number(summary?.totalRevenue ?? 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Booking Selesai',
      value: summary?.completedBookings ?? 0,
      icon: CheckCircle2,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
    },
    {
      label: 'Total Barbershop Mitra',
      value: summary?.totalBarbershops ?? 0,
      icon: Store,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Total Barber Aktif',
      value: summary?.totalBarbers ?? 0,
      icon: Scissors,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Total Pengguna',
      value: summary?.totalUsers ?? 0,
      icon: Users,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
    },
    {
      label: 'Booking Dibatalkan',
      value: summary?.cancelledBookings ?? 0,
      icon: CalendarDays,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-red-600/10 blur-[100px]" />
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard Overview Admin
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm">
              Pantau seluruh statistik platform, omzet, pengguna, dan performa mitra barber secara real-time.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-600">{card.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className={`grid size-12 place-items-center rounded-xl border ${card.bg} ${card.color}`}>
                <Icon size={22} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top Performing Barbers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <Star size={18} className="text-amber-500 fill-amber-500" />
          Performa Barber Terbaik (Top Performers)
        </h2>

        {!summary?.topBarbers || summary.topBarbers.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Belum ada data performa barber</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-3 px-2">Nama Barber</th>
                  <th className="py-3 px-2">Barbershop</th>
                  <th className="py-3 px-2 text-center">Rating</th>
                  <th className="py-3 px-2 text-center">Selesai</th>
                  <th className="py-3 px-2 text-right">Estimasi Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {summary.topBarbers.map((b) => (
                  <tr key={b.barberId} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900">{b.barberName}</td>
                    <td className="py-3 px-2 text-slate-600">{b.barbershopName || 'Independent'}</td>
                    <td className="py-3 px-2 text-center font-bold text-amber-600">
                      ★ {Number(b.averageRating ?? 0).toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-center font-semibold">{b.completedBookings}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-emerald-600">
                      Rp {Number(b.totalRevenue ?? 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
=======
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Users,
  Scissors,
  CalendarDays,
  CreditCard,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
} from 'lucide-react';
import {
  AdminMonitoringEndpoint,
  AdminRegistrationEndpoint,
  AdminUserEndpoint,
} from '../../generated/endpoints.js';

interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  pendingRegistrations: number;
  totalRevenue: number;
  totalUsers: number;
  totalBarbershops: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    pendingBookings: 0,
    pendingRegistrations: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalBarbershops: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [bookings, customers, owners, registrations] = await Promise.all([
          AdminMonitoringEndpoint.getAllBookings().catch(() => []),
          AdminUserEndpoint.getUsersByRole('Customer').catch(() => []),
          AdminUserEndpoint.getUsersByRole('Owner').catch(() => []),
          AdminRegistrationEndpoint.getAllRegistrations().catch(() => []),
        ]);

        const validBookings = Array.isArray(bookings) ? bookings.filter(Boolean) : [];
        const validCustomers = Array.isArray(customers) ? customers.filter(Boolean) : [];
        const validOwners = Array.isArray(owners) ? owners.filter(Boolean) : [];
        const validRegistrations = Array.isArray(registrations) ? registrations.filter(Boolean) : [];

        const totalB = validBookings.length;
        const pendingB = validBookings.filter((b: any) => b?.status === 'PENDING').length;
        const totalU = validCustomers.length + validOwners.length;
        const pendingR = validRegistrations.filter((r: any) => r?.status === 'PENDING').length;
        const approvedShops = validRegistrations.filter((r: any) => r?.status === 'APPROVED').length;

        const revenue = validBookings
          .filter((b: any) => b?.paymentStatus === 'paid' || b?.paymentStatus === 'PAID')
          .reduce((sum: number, b: any) => sum + (Number(b?.totalPrice) || Number(b?.totalAmount) || 0), 0);

        setStats({
          totalBookings: totalB,
          pendingBookings: pendingB,
          pendingRegistrations: pendingR,
          totalRevenue: revenue,
          totalUsers: totalU,
          totalBarbershops: approvedShops,
        });
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    void loadStats();
  }, []);

  const cards = [
    {
      label: 'Pendaftaran Mitra Pending',
      value: stats.pendingRegistrations,
      desc: 'Menunggu persetujuan admin',
      icon: ClipboardList,
      color: '#dc2626',
      link: '/admin/registrations',
      badge: stats.pendingRegistrations > 0 ? `${stats.pendingRegistrations} Perlu Review` : 'Aman',
      badgeClass: stats.pendingRegistrations > 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Total Pengguna',
      value: stats.totalUsers,
      desc: 'Pelanggan, Owner & Barber',
      icon: Users,
      color: '#2563eb',
      link: '/admin/users',
      badge: 'Aktif',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    {
      label: 'Total Barbershop Mitra',
      value: stats.totalBarbershops,
      desc: 'Mitra resmi terdaftar',
      icon: Building2,
      color: '#dc2626',
      link: '/admin/services',
      badge: 'Terverifikasi',
      badgeClass: 'bg-red-100 text-red-700 border-red-200',
    },
    {
      label: 'Booking Keseluruhan',
      value: stats.totalBookings,
      desc: `${stats.pendingBookings} transaksi pending`,
      icon: CalendarDays,
      color: '#2563eb',
      link: '/admin/bookings',
      badge: 'Live',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    {
      label: 'Total Omzet Terverifikasi',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      desc: 'Dari transaksi pembayaran lunas',
      icon: CreditCard,
      color: '#16a34a',
      link: '/admin/payments',
      badge: 'Lunas',
      badgeClass: 'bg-green-100 text-green-700 border-green-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-red-600" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dashboard Administrator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau status pendaftaran mitra, kontrol akun pengguna, verifikasi pembayaran, dan statistik operasional.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.label}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                onClick={() => navigate(card.link)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                      <Icon size={18} style={{ color: card.color }} />
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${card.badgeClass}`}>
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{card.value}</p>
                  <p className="text-xs font-bold text-slate-700">{card.label}</p>
                </div>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500 group-hover:text-blue-600 transition-colors">
                  <span>{card.desc}</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aksi Modul Utama</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Review Pendaftaran',
              desc: 'Setujui atau tolak aplikasi pendaftaran mitra barbershop baru',
              link: '/admin/registrations',
              icon: ClipboardList,
              badge: stats.pendingRegistrations > 0 ? `${stats.pendingRegistrations} Menunggu` : 'Bersih',
              accent: 'border-l-4 border-l-red-600',
            },
            {
              title: 'Kelola Pengguna',
              desc: 'Atur hak akses, status aktif, dan profil customer/barber/owner',
              link: '/admin/users',
              icon: Users,
              badge: 'Manajemen User',
              accent: 'border-l-4 border-l-blue-600',
            },
            {
              title: 'Monitoring Booking',
              desc: 'Pantau status pemesanan real-time dari seluruh barbershop mitra',
              link: '/admin/bookings',
              icon: Clock,
              badge: 'Live Status',
              accent: 'border-l-4 border-l-blue-600',
            },
            {
              title: 'Laporan & Keuangan',
              desc: 'Analisis pendapatan platform, komisi, dan ringkasan bulanan',
              link: '/admin/reports',
              icon: TrendingUp,
              badge: 'Analitik',
              accent: 'border-l-4 border-l-red-600',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => navigate(item.link)}
                className={`group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-slate-300 hover:shadow-md ${item.accent}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon size={18} />
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">
                    {item.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 pt-3 border-t border-slate-100">
                  <span>Buka Modul</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
      </div>
    </div>
  );
}

