import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  History,
  Scissors,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  TrendingUp,
  Ban,
  Wallet,
} from 'lucide-react';
import { BarberEndpoint } from '../../generated/endpoints.js';

interface BookingItem {
  id: number;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  startDatetime: string;
  endDatetime: string;
  address: string;
  customerLatitude: number;
  customerLongitude: number;
  distanceKm: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  notes: string | null;
  cancellationReason: string | null;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: typeof CheckCircle2;
}> = {
  completed: {
    label: 'Selesai',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Ditolak',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    icon: XCircle,
  },
  cancelled_by_customer: {
    label: 'Dibatalkan Customer',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    icon: AlertTriangle,
  },
  cancelled_by_barber: {
    label: 'Dibatalkan Barber',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    icon: XCircle,
  },
  cancelled_by_admin: {
    label: 'Dibatalkan Admin',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    icon: Ban,
  },
  no_show: {
    label: 'Tidak Hadir',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-200',
    badgeText: 'text-slate-600',
    icon: AlertTriangle,
  },
};

const DEFAULT_STATUS = {
  label: 'Tidak Diketahui',
  badgeBg: 'bg-slate-100',
  badgeBorder: 'border-slate-200',
  badgeText: 'text-slate-600',
  icon: AlertTriangle,
};

export default function BarberHistoryPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    BarberEndpoint.getBookingHistory()
      .then((res) => setBookings((res as BookingItem[]) || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status !== 'completed';
    return true;
  });

  const totalCompleted = bookings.filter((b) => b.status === 'completed').length;
  const totalCancelled = bookings.filter((b) => b.status !== 'completed').length;
  const totalEarnings = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.totalPrice), 0);

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return s; }
  };

  const formatTime = (s: string) => {
    try {
      return new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch { return s; }
  };

  const formatCurrency = (n: number) =>
    `Rp ${Number(n).toLocaleString('id-ID')}`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Riwayat Pekerjaan
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Semua riwayat booking yang sudah selesai atau dibatalkan.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 border border-emerald-200">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Selesai</p>
            <p className="text-2xl font-bold text-slate-900">{totalCompleted}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 border border-red-200">
            <Ban size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Dibatalkan</p>
            <p className="text-2xl font-bold text-slate-900">{totalCancelled}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 border border-blue-200">
            <Wallet size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Est. Pendapatan</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(totalEarnings)}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit">
        {(['all', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Semua' : f === 'completed' ? 'Selesai' : 'Dibatalkan'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
          <History size={36} className="text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">Belum ada riwayat</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Riwayat booking akan muncul setelah customer menyelesaikan atau membatalkan pemesanan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking, i) => {
            const cfg = STATUS_CONFIG[booking.status] || DEFAULT_STATUS;
            const StatusIcon = cfg.icon;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Top Row: Customer + Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-sm font-bold text-blue-600 uppercase">
                      {booking.customerName?.[0] || <User size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{booking.customerName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{booking.bookingCode}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`}>
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                </div>

                {/* Middle Row: Service + Date/Time */}
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Scissors size={13} className="text-slate-400 shrink-0" />
                    <span className="font-semibold">{booking.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={13} className="text-slate-400 shrink-0" />
                    <span>{formatDate(booking.startDatetime)} · {formatTime(booking.startDatetime)}</span>
                  </div>
                </div>

                {/* Bottom Row: Total + cancellation reason */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    {booking.cancellationReason && (
                      <p className="text-[11px] text-red-500">
                        <span className="font-bold">Alasan: </span>{booking.cancellationReason}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
