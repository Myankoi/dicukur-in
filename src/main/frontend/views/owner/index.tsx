import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Store,
  Users,
  CalendarDays,
  DollarSign,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Scissors,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router';
import { OwnerEndpoint } from '../../generated/endpoints.js';
import type OwnerDashboardSummaryResponse from '../../generated/com/dicukur/app/barbershop/dto/OwnerDashboardSummaryResponse.js';

export default function OwnerDashboard() {
  const [summary, setSummary] = useState<OwnerDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    OwnerEndpoint.getDashboardSummary()
      .then((data) => setSummary(data ?? null))
      .catch((err) => setError(err?.message || 'Gagal memuat ringkasan dashboard owner.'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const isApproved = summary?.verificationStatus === 'approved';
  const isPending = summary?.verificationStatus === 'pending';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-500/10 blur-[100px]" />
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
              <Sparkles size={13} />
              Portal Pemilik Barbershop
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {summary?.barbershopName || 'Dashboard Barbershop'}
            </h1>
            <p className="text-xs text-zinc-400 sm:text-sm">
              Pantau statistik booking, kinerja karyawan barber, dan kelola operasional tokomu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/owner/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-all hover:border-zinc-700 hover:bg-zinc-900"
            >
              <Store size={15} />
              Profil Toko
            </Link>
            <Link
              to="/owner/staff"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-amber-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-brand-500/10 transition-all hover:brightness-110 active:scale-95"
            >
              <Plus size={15} />
              Tambah Barber
            </Link>
          </div>
        </div>

        {/* Verification Status Alert */}
        {summary && (
          <div className="mt-6 border-t border-zinc-800/80 pt-4">
            {isApproved ? (
              <div className="flex items-center gap-2.5 text-xs text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Barbershop Anda telah <strong>DIVERIFIKASI & AKTIF</strong>. Siap menerima booking pelanggan!</span>
              </div>
            ) : isPending ? (
              <div className="flex items-center gap-2.5 text-xs text-amber-400">
                <Clock size={16} />
                <span>Pendaftaran Barbershop sedang <strong>DITINJAU OLEH ADMIN</strong>. Kamu bisa melengkapi profil & menambah staf terlebih dahulu.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-red-400">
                <AlertTriangle size={16} />
                <span>Status verifikasi: <strong>{summary.verificationStatus}</strong>. Periksa data profil usaha Anda.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat Cards Grid */}
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <span className="size-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Booking</span>
              <div className="grid size-9 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
                <CalendarDays size={18} />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-white">{summary?.totalBookings || 0}</p>
            <p className="mt-1 text-[11px] text-zinc-500">{summary?.completedBookings || 0} booking selesai</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Barber Aktif</span>
              <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-400">
                <Users size={18} />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-white">{summary?.activeStaffCount || 0}</p>
            <p className="mt-1 text-[11px] text-zinc-500">Staf barber terdaftar</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Estimasi Omzet</span>
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-emerald-400">
              {formatCurrency(summary?.totalRevenue)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">Dari booking selesai</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Rating Barbershop</span>
              <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-400">
                <Star size={18} />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-amber-400">
              {summary?.ratingAverage ? summary.ratingAverage.toFixed(1) : '5.0'} / 5.0
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">Ulasan pelanggan</p>
          </motion.div>
        </div>
      )}

      {/* Quick Menu Action Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/owner/profile"
          className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-900/70"
        >
          <Store size={22} className="text-brand-300 transition-transform group-hover:scale-110" />
          <h3 className="mt-3 font-semibold text-sm text-zinc-100 flex items-center justify-between">
            Profil Barbershop
            <ArrowRight size={14} className="text-zinc-500 transition-transform group-hover:translate-x-1" />
          </h3>
          <p className="mt-1 text-xs text-zinc-400">Lengkapi deskripsi, lokasi koordinat, radius, dan lisensi usaha.</p>
        </Link>

        <Link
          to="/owner/staff"
          className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-900/70"
        >
          <Users size={22} className="text-amber-400 transition-transform group-hover:scale-110" />
          <h3 className="mt-3 font-semibold text-sm text-zinc-100 flex items-center justify-between">
            Manajemen Karyawan
            <ArrowRight size={14} className="text-zinc-500 transition-transform group-hover:translate-x-1" />
          </h3>
          <p className="mt-1 text-xs text-zinc-400">Tambah akun barber baru & kelola status aktif staf tokomu.</p>
        </Link>

        <Link
          to="/owner/bookings"
          className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-900/70"
        >
          <CalendarDays size={22} className="text-emerald-400 transition-transform group-hover:scale-110" />
          <h3 className="mt-3 font-semibold text-sm text-zinc-100 flex items-center justify-between">
            Pantau Booking
            <ArrowRight size={14} className="text-zinc-500 transition-transform group-hover:translate-x-1" />
          </h3>
          <p className="mt-1 text-xs text-zinc-400">Lihat semua status pesanan barber yang masuk ke tokomu.</p>
        </Link>
      </div>
    </div>
  );
}
