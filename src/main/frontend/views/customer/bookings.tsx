import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  CalendarDays,
  MapPin,
  Scissors,
  ShieldAlert,
  Sparkles,
  UserRound,
  RefreshCw,
  Navigation,
  CheckCircle2,
  Clock,
  CreditCard,
} from 'lucide-react';
import { BookingEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type BookingResponse from '../../generated/com/dicukur/app/booking/dto/BookingResponse.js';

export default function CustomerBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number>();
  const [error, setError] = useState('');

  const loadBookings = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const result = await BookingEndpoint.getMyBookings();
      setBookings((result ?? []).filter(Boolean) as BookingResponse[]);
      setError('');
    } catch (cause) {
      if (!isSilent) {
        setError(cause instanceof Error ? cause.message : 'Daftar pesanan gagal dimuat');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();

    // Auto-poll status changes every 5 seconds
    const interval = setInterval(() => {
      void loadBookings(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadBookings]);

  const handleCancel = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Apakah kamu yakin ingin membatalkan pesanan ini?')) return;
    setActionLoadingId(id);
    try {
      await BookingEndpoint.cancel(id, 'Dibatalkan oleh customer');
      await loadBookings();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal membatalkan pesanan');
    } finally {
      setActionLoadingId(undefined);
    }
  };

  const handlePay = (id?: number) => {
    if (!id) return;
    navigate(`/customer/bookings/${id}`);
  };

  const canCancel = (status?: string) => {
    const s = status?.toUpperCase() ?? '';
    return s === 'PENDING' || s === 'ACCEPTED';
  };

  const canPay = (status?: string, paymentStatus?: string) => {
    const s = status?.toUpperCase() ?? '';
    const p = paymentStatus?.toLowerCase();
    return ['PENDING', 'ACCEPTED'].includes(s)
      && p !== 'paid' && p !== 'waiting_verification';
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() ?? '';
    switch (s) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-300">
            <CheckCircle2 size={13} className="text-blue-400" />
            Diterima Barber
          </span>
        );
      case 'on_the_way':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-300">
            <Navigation size={13} className="text-purple-400 animate-bounce" />
            Barber Dalam Perjalanan
          </span>
        );
      case 'arrived':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
            <MapPin size={13} className="text-cyan-400" />
            Barber Tiba di Lokasi
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-300">
            <Scissors size={13} className="text-orange-400 animate-spin" />
            Sedang Cukur
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
            <Sparkles size={13} className="text-emerald-300" />
            Selesai
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-300">
            <ShieldAlert size={13} />
            Ditolak Barber
          </span>
        );
      case 'cancelled':
      case 'cancelled_by_customer':
      case 'cancelled_by_barber':
      case 'cancelled_by_admin':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-300">
            <ShieldAlert size={13} />
            Dibatalkan
          </span>
        );
      case 'cancelled_unpaid':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-500/30 bg-slate-500/10 px-2.5 py-1 text-xs font-bold text-slate-300">
            <ShieldAlert size={13} />
            Batal — Belum Dibayar
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">
            <Clock size={13} className="text-amber-400 animate-pulse" />
            Menunggu Konfirmasi
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Pesanan Saya</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Pantau status keberangkatan barber ke lokasimu, rincian biaya, serta bayar atau beri ulasan.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => void loadBookings(false)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto flex items-center gap-2 text-xs font-bold border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-red-600' : ''} />
          {refreshing ? 'Memperbarui...' : 'Segarkan'}
        </Button>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}

      {loading ? (
        <div className="py-16 text-center text-xs font-medium text-slate-500 rounded-2xl border border-slate-200 bg-white">Memuat riwayat pesanan...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm">
            <CalendarDays size={24} />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">Belum Ada Pesanan Aktif</h2>
          <p className="mt-2 text-xs text-slate-500">Kamu belum pernah membuat janji booking cukur.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-red-300 hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-red-600">#{booking.bookingCode}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs font-bold text-slate-900">{booking.barbershopName}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Jadwal datang:{' '}
                    {booking.startDatetime
                      ? new Date(booking.startDatetime).toLocaleString('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })
                      : '-'}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-red-600">
                    <UserRound size={17} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Barber Bertugas</p>
                    <p className="text-xs font-bold text-slate-900">{booking.barberName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
                    <Scissors size={17} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Layanan Grooming</p>
                    <p className="text-xs font-bold text-slate-900">{booking.serviceName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-red-600">
                    <MapPin size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alamat Tujuan</p>
                    <p className="truncate text-xs font-bold text-slate-900">{booking.address}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs text-slate-500">
                    Layanan Rp {(booking.serviceSubtotal ?? 0).toLocaleString('id-ID')} + Perjalanan Rp{' '}
                    {(booking.travelFee ?? 0).toLocaleString('id-ID')} ({(booking.distanceKm ?? 0).toFixed(1)} km)
                  </p>
                  <p className="mt-0.5 text-base font-bold text-slate-900">
                    Total Biaya: <span className="text-red-600">Rp {(booking.totalPrice ?? 0).toLocaleString('id-ID')}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canCancel(booking.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleCancel(booking.id)}
                      disabled={actionLoadingId === booking.id}
                      className="text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {actionLoadingId === booking.id ? 'Membatalkan...' : 'Batalkan Booking'}
                    </Button>
                  )}

                  {canPay(booking.status, booking.paymentStatus) && (
                    <Button
                      size="sm"
                      onClick={() => handlePay(booking.id)}
                      disabled={actionLoadingId === booking.id}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                    >
                      <CreditCard size={14} className="mr-1.5" />
                      {booking.paymentStatus?.toLowerCase() === 'failed' ? 'Bayar Ulang' : 'Bayar Sekarang'}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
