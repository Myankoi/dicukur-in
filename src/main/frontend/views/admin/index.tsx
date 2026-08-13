import { useEffect, useState } from 'react';
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
      </div>
    </div>
  );
}
