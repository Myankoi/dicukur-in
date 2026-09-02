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
import { LiveTrackingMap } from '../../components/LiveTrackingMap.js';

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
  barberLatitude: number;
  barberLongitude: number;
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
  const [barberCoords, setBarberCoords] = useState<{ lat: number; lng: number } | null>(null);

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

  // Live GPS tracking when barber status is 'on_the_way'
  useEffect(() => {
    const activeOtw = bookings.find((b) => b.status === 'on_the_way');
    if (!activeOtw || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setBarberCoords({ lat, lng });
        void BarberEndpoint.updateLiveLocation(activeOtw.id, lat as any, lng as any);
      },
      (err) => {
        console.warn('Lokasi GPS tidak dapat diakses:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [bookings]);

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

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'accepted':
        return <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Diterima</span>;
      case 'on_the_way':
        return <span className="rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">Dalam Perjalanan</span>;
      case 'arrived':
        return <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">Sudah Tiba</span>;
      case 'in_progress':
        return <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Sedang Cukur</span>;
      case 'completed':
        return <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Selesai</span>;
      case 'rejected':
        return <span className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Ditolak</span>;
      case 'pending':
      default:
        return <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Menunggu Konfirmasi</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-3 font-display">
          <ClipboardList size={24} className="text-red-600" />
          Pesanan Masuk
        </h1>
        <p className="text-slate-600 mt-1 text-sm">Terima atau tolak pesanan, lalu update status kedatangan cukur.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {bookings.some((b) => b.status === 'on_the_way') && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-sm">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </span>
          <div>
            <p className="font-bold">GPS Live Location Aktif 🟢</p>
            <p className="text-[11px] font-normal text-emerald-700 mt-0.5">
              Posisi lokasi Anda sedang dibagikan secara realtime ke Customer yang menunggu kedatangan Anda.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid size-16 place-items-center rounded-2xl bg-slate-50 border border-slate-200 mb-4 text-slate-400">
            <Scissors size={28} />
          </div>
          <p className="text-slate-900 font-bold text-base">Belum ada pesanan masuk</p>
          <p className="text-slate-500 text-xs mt-1">Pesanan baru akan muncul di sini secara realtime.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, i) => {
            const isExpanded = expandedId === booking.id;
            const next = NEXT_STATUS[booking.status];

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                {/* Card Header */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 font-bold border border-red-200">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{booking.customerName}</span>
                        <span className="text-xs font-mono text-slate-500 font-bold">#{booking.bookingCode}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold">
                          <Scissors size={12} className="text-blue-600" />
                          {booking.serviceName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          {formatDate(booking.startDatetime)} {formatTime(booking.startDatetime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(booking.status)}
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
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
                      <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
                        {/* Live Tracking Map for Barber */}
                        {(booking.status?.toLowerCase() === 'accepted' ||
                          booking.status?.toLowerCase() === 'on_the_way' ||
                          booking.status?.toLowerCase() === 'arrived' ||
                          booking.status?.toLowerCase() === 'in_progress') && (
                          <LiveTrackingMap
                            customerLat={booking.customerLatitude || -6.200000}
                            customerLng={booking.customerLongitude || 106.816666}
                            customerAddress={booking.address}
                            barberLat={barberCoords?.lat ?? booking.barberLatitude}
                            barberLng={barberCoords?.lng ?? booking.barberLongitude}
                            barberName="Posisi Anda (Barber)"
                            barberPhone={booking.customerPhone}
                            phoneLabel="Hubungi Customer"
                            status={booking.status?.toLowerCase()}
                          />
                        )}

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <MapPin size={16} className="text-red-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Alamat Tujuan</p>
                              <p className="text-xs font-bold text-slate-900">{booking.address}</p>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Koordinat: {Number(booking.customerLatitude).toFixed(6)}, {Number(booking.customerLongitude).toFixed(6)}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                              <Phone size={16} className="text-emerald-600 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Telepon</p>
                                <p className="text-xs font-bold text-slate-900">{booking.customerPhone || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                              <div className="flex items-center gap-2">
                                <Navigation size={14} className="text-blue-600" />
                                <span className="text-xs font-medium text-slate-600">Jarak</span>
                              </div>
                              <span className="text-xs font-bold text-slate-900">{Number(booking.distanceKm).toFixed(1)} km</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Notes */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                          <span className="text-xs font-bold text-slate-600">Total Biaya</span>
                          <span className="text-base font-bold text-red-600">{formatCurrency(booking.totalPrice)}</span>
                        </div>

                        {booking.notes && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Customer</p>
                            <p className="text-xs text-slate-700">{booking.notes}</p>
                          </div>
                        )}

                        {/* Google Maps link */}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${booking.customerLatitude},${booking.customerLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Navigation size={16} />
                          Buka Navigasi di Google Maps
                        </a>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={processing === booking.id}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                                onClick={() => handleAccept(booking.id)}
                              >
                                {processing === booking.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                Terima
                              </button>
                              <button
                                type="button"
                                disabled={processing === booking.id}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
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
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50 shadow-sm"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tolak Pesanan</h3>
              <p className="text-xs text-slate-600 mb-4">Berikan alasan penolakan (opsional):</p>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Jadwal sudah penuh..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none"
              />
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  onClick={() => { setRejectDialogId(null); setRejectReason(''); }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={processing !== null}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow-md shadow-red-600/20"
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
