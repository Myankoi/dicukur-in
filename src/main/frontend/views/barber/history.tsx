import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  History,
  Scissors,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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

const STATUS_LABELS: Record<string, string> = {
  completed: 'Selesai',
  rejected: 'Ditolak',
  cancelled_by_customer: 'Dibatalkan Customer',
  cancelled_by_barber: 'Dibatalkan Barber',
  cancelled_by_admin: 'Dibatalkan Admin',
  no_show: 'Tidak Hadir',
};

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  completed: { color: '#22c55e', icon: CheckCircle2 },
  rejected: { color: '#ef4444', icon: XCircle },
  cancelled_by_customer: { color: '#f59e0b', icon: AlertTriangle },
  cancelled_by_barber: { color: '#ef4444', icon: XCircle },
  cancelled_by_admin: { color: '#ef4444', icon: XCircle },
  no_show: { color: '#6b7280', icon: AlertTriangle },
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

  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.totalPrice), 0);

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return s; }
  };

  const formatTime = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch { return s; }
  };

  const formatCurrency = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

  return (
    <div>
      {/* Header */}
      <div className="relative mb-6">
        <div className="absolute -top-2 left-0 w-16 h-1 rounded-full"
          style={{ background: 'linear-gradient(90deg, #dc2626, #f8fafc, #2563eb)' }} />
        <h1 className="text-2xl font-bold text-zinc-100 mt-4 flex items-center gap-3">
          <History size={24} className="text-brand-400" />
          Riwayat Pekerjaan
        </h1>
        <p className="text-zinc-400 mt-1">Lihat semua riwayat cukur yang sudah selesai atau dibatalkan.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Selesai</p>
          <p className="text-2xl font-bold text-green-400">{bookings.filter(b => b.status === 'completed').length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Dibatalkan</p>
          <p className="text-2xl font-bold text-red-400">{bookings.filter(b => b.status !== 'completed').length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Estimasi Pendapatan</p>
          <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalEarnings)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-zinc-900/50 border border-zinc-800/50 w-fit">
        {(['all', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
              filter === f
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Semua' : f === 'completed' ? 'Selesai' : 'Dibatalkan'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <History size={32} className="text-zinc-600 mb-3" />
          <p className="text-zinc-400 font-medium">Belum ada riwayat</p>
          <p className="text-zinc-500 text-sm mt-1">Riwayat pekerjaan akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((booking, i) => {
            const cfg = STATUS_CONFIG[booking.status] || { color: '#6b7280', icon: AlertTriangle };
            const StatusIcon = cfg.icon;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-4 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-zinc-800/50" style={{ backgroundColor: `${cfg.color}15` }}>
                  <StatusIcon size={18} style={{ color: cfg.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-100">{booking.customerName}</span>
                    <span className="text-[10px] font-mono text-zinc-600">{booking.bookingCode}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-500 flex-wrap">
                    <span className="flex items-center gap-1"><Scissors size={11} /> {booking.serviceName}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(booking.startDatetime)} {formatTime(booking.startDatetime)}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {Number(booking.distanceKm).toFixed(1)} km</span>
                  </div>
                  {booking.cancellationReason && (
                    <p className="text-xs text-red-400/70 mt-1">Alasan: {booking.cancellationReason}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-zinc-200">{formatCurrency(booking.totalPrice)}</p>
                  <span
                    className="inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                    style={{
                      color: cfg.color,
                      borderColor: `${cfg.color}30`,
                      backgroundColor: `${cfg.color}15`,
                    }}
                  >
                    {STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
