import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChartNoAxesCombined,
  DollarSign,
  TrendingUp,
  Users,
  Scissors,
  CalendarCheck,
  Star,
} from 'lucide-react';
import { OwnerEndpoint } from '../../generated/endpoints.js';
import type OwnerDashboardSummaryResponse from '../../generated/com/dicukur/app/barbershop/dto/OwnerDashboardSummaryResponse.js';

export default function OwnerReportsPage() {
  const [summary, setSummary] = useState<OwnerDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OwnerEndpoint.getDashboardSummary()
      .then((data) => setSummary(data ?? null))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-red-600/10 blur-[100px]" />
        
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Laporan Performa & Omzet
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm">
            Ringkasan pendapatan bisnis, kinerja transaksi, dan statistik ulasan pelanggan.
          </p>
        </div>
      </div>

      {/* Reports Stat Grid */}
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="size-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Total Omzet Bersih</span>
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-emerald-600">
              {formatCurrency(summary?.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Hasil transaksi booking selesai</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Booking Selesai</span>
              <CalendarCheck size={20} className="text-red-600" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-slate-900">
              {summary?.completedBookings || 0} <span className="text-xs font-normal text-slate-500">/ {summary?.totalBookings || 0} Total</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Tingkat keberhasilan booking</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Kepuasan Pelanggan</span>
              <Star size={20} className="text-amber-500" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-amber-600">
              {summary?.ratingAverage ? summary.ratingAverage.toFixed(1) : '5.0'} ⭐
            </p>
            <p className="mt-1 text-xs text-slate-500">Rata-rata ulasan pelanggan</p>
          </div>
        </div>
      )}

      {/* Summary Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 mb-2">Ringkasan Operasional Toko</h3>
        <p className="text-xs text-slate-600">
          Untuk laporan mendalam per staf dan riwayat transaksi bulanan, Anda dapat memantau secara langsung melalui tab <strong>Karyawan</strong> dan <strong>Monitoring Booking</strong>.
        </p>
      </div>
    </div>
  );
}
