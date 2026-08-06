import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  Check,
  X,
  MapPin,
  Phone,
  Clock,
  Navigation,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  User,
  Scissors,
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
  pending: 'Menunggu Konfirmasi',
  accepted: 'Diterima',
  on_the_way: 'Dalam Perjalanan',
  arrived: 'Sudah Tiba',
  in_progress: 'Sedang Berlangsung',
  completed: 'Selesai',
  rejected: 'Ditolak',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  on_the_way: '#8b5cf6',
  arrived: '#06b6d4',
  in_progress: '#f97316',
  completed: '#22c55e',
  rejected: '#ef4444',
};

const NEXT_STATUS: Record<string, { label: string; value: string }> = {
  accepted: { label: 'Berangkat', value: 'on_the_way' },
  on_the_way: { label: 'Sudah Tiba', value: 'arrived' },
  arrived: { label: 'Mulai Cukur', value: 'in_progress' },
  in_progress: { label: 'Selesai', value: 'completed' },
};

export default function BarberBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await BarberEndpoint.getIncomingBookings();
      setBookings((res as BookingItem[]) || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleAccept = async (id: number) => {
    setProcessing(id);
    setError('');
    try {
      await BarberEndpoint.acceptBooking(id);
      await fetchBookings();
    } catch (e: any) {
      setError(e?.message || 'Gagal menerima booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialogId) return;
    setProcessing(rejectDialogId);
    setError('');
    try {
      await BarberEndpoint.rejectBooking(rejectDialogId, rejectReason);
      setRejectDialogId(null);
      setRejectReason('');
      await fetchBookings();
    } catch (e: any) {
      setError(e?.message || 'Gagal menolak booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setProcessing(id);
    setError('');
    try {
      await BarberEndpoint.updateBookingStatus(id, newStatus);
      await fetchBookings();
    } catch (e: any) {
      setError(e?.message || 'Gagal mengubah status');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return s;
    }
  };

  const formatTime = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return s;
    }
  };

  const formatCurrency = (n: number) =>
    `Rp ${Number(n).toLocaleString('id-ID')}`;

  return (
    <div>
      {/* Header */}
      <div className="relative mb-6">
        <div className="absolute -top-2 left-0 w-16 h-1 rounded-full"
          style={{ background: 'linear-gradient(90deg, #dc2626, #f8fafc, #2563eb)' }} />
        <h1 className="text-2xl font-bold text-zinc-100 mt-4 flex items-center gap-3">
          <ClipboardList size={24} className="text-barber-red" />
          Pesanan Masuk
        </h1>
        <p className="text-zinc-400 mt-1">Terima atau tolak pesanan, lalu update status cukur.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800/50" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
            <Scissors size={28} className="text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium">Belum ada pesanan masuk</p>
          <p className="text-zinc-500 text-sm mt-1">Pesanan baru akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, i) => {
            const isExpanded = expandedId === booking.id;
            const next = NEXT_STATUS[booking.status];
            const statusColor = STATUS_COLORS[booking.status] || '#6b7280';

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden"
              >
                {/* Card Header */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-900/60 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                      <User size={18} className="text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-zinc-100">{booking.customerName}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{booking.bookingCode}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Scissors size={12} />
                          {booking.serviceName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(booking.startDatetime)} {formatTime(booking.startDatetime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold border"
                      style={{
                        color: statusColor,
                        borderColor: `${statusColor}30`,
                        backgroundColor: `${statusColor}15`,
                      }}
                    >
                      {STATUS_LABELS[booking.status] || booking.status}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                  </div>
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-zinc-800/50 px-5 py-4 space-y-4">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/40">
                            <MapPin size={16} className="text-barber-blue mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Alamat Tujuan</p>
                              <p className="text-sm text-zinc-200">{booking.address}</p>
                              <p className="text-[11px] text-zinc-500 mt-1">
                                Koordinat: {Number(booking.customerLatitude).toFixed(6)}, {Number(booking.customerLongitude).toFixed(6)}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/40">
                              <Phone size={16} className="text-green-400 shrink-0" />
                              <div>
                                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Telepon</p>
                                <p className="text-sm text-zinc-200">{booking.customerPhone || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/40">
                              <div className="flex items-center gap-2">
                                <Navigation size={14} className="text-barber-blue" />
                                <span className="text-xs text-zinc-400">Jarak</span>
                              </div>
                              <span className="text-sm font-semibold text-zinc-200">{Number(booking.distanceKm).toFixed(1)} km</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Notes */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/40">
                          <span className="text-xs text-zinc-400">Total Harga</span>
                          <span className="text-lg font-bold text-zinc-100">{formatCurrency(booking.totalPrice)}</span>
                        </div>

                        {booking.notes && (
                          <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/40">
                            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Catatan Customer</p>
                            <p className="text-sm text-zinc-300">{booking.notes}</p>
                          </div>
                        )}

                        {/* Google Maps link */}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${booking.customerLatitude},${booking.customerLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-barber-blue/30 bg-barber-blue/10 px-4 py-2.5 text-sm font-medium text-barber-blue-light hover:bg-barber-blue/20 transition-colors"
                        >
                          <Navigation size={16} />
                          Buka di Google Maps
                        </a>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={processing === booking.id}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
                                onClick={() => handleAccept(booking.id)}
                              >
                                {processing === booking.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                Terima
                              </button>
                              <button
                                type="button"
                                disabled={processing === booking.id}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                onClick={() => setRejectDialogId(booking.id)}
                              >
                                <X size={16} />
                                Tolak
                              </button>
                            </>
                          )}

                          {next && (
                            <button
                              type="button"
                              disabled={processing === booking.id}
                              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
                              onClick={() => handleUpdateStatus(booking.id, next.value)}
                            >
                              {processing === booking.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                              {next.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reject Dialog */}
      <AnimatePresence>
        {rejectDialogId !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-zinc-100 mb-2">Tolak Pesanan</h3>
              <p className="text-sm text-zinc-400 mb-4">Berikan alasan penolakan (opsional):</p>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Jadwal sudah penuh..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                  onClick={() => { setRejectDialogId(null); setRejectReason(''); }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={processing !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                  onClick={handleReject}
                >
                  {processing !== null ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                  Tolak Pesanan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
