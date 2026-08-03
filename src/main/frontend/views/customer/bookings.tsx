import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Scissors, ShieldAlert, Sparkles, UserRound, XCircle } from 'lucide-react';
import { BookingEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type BookingResponse from '../../generated/com/dicukur/app/booking/dto/BookingResponse.js';

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number>();
  const [error, setError] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await BookingEndpoint.getMyBookings();
      setBookings((result ?? []).filter(Boolean) as BookingResponse[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Daftar pesanan gagal dimuat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const handleCancel = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Apakah kamu yakin ingin membatalkan pesanan ini?')) return;
    setCancellingId(id);
    try {
      await BookingEndpoint.cancel(id, 'Dibatalkan oleh customer');
      await loadBookings();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal membatalkan pesanan');
    } finally {
      setCancellingId(undefined);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Diterima Barber
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-300">
            <Sparkles size={12} className="text-brand-300" />
            Selesai
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
            <ShieldAlert size={12} />
            Batal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            Menunggu Konfirmasi
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Riwayat Layanan</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-zinc-100">Pesanan Saya</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
          Pantau status keberangkatan barber ke lokasimu, rincian biaya, serta batalkan atau konfirmasi booking.
        </p>
      </div>

      {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</p>}

      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-500">Memuat riwayat pesanan...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center backdrop-blur-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-brand-400/20 bg-zinc-950 text-brand-300 shadow-inner">
            <CalendarDays size={24} />
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold text-zinc-100">Belum Ada Pesanan Aktif</h2>
          <p className="mt-2 text-xs text-zinc-400">Kamu belum pernah membuat janji booking cukur.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-brand-300">#{booking.bookingCode}</span>
                    <span className="text-xs text-zinc-500">·</span>
                    <span className="text-xs font-semibold text-zinc-300">{booking.barbershopName}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
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
                  <span className="grid size-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-950 text-brand-300">
                    <UserRound size={17} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Barber Bertugas</p>
                    <p className="text-xs font-semibold text-zinc-100">{booking.barberName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-950 text-brand-300">
                    <Scissors size={17} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Layanan Grooming</p>
                    <p className="text-xs font-semibold text-zinc-100">{booking.serviceName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-950 text-brand-300">
                    <MapPin size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Alamat Tujuan</p>
                    <p className="truncate text-xs font-semibold text-zinc-100">{booking.address}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col justify-between gap-4 border-t border-zinc-800/80 pt-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[11px] text-zinc-400">
                    Layanan Rp {(booking.serviceSubtotal ?? 0).toLocaleString('id-ID')} + Perjalanan Rp{' '}
                    {(booking.travelFee ?? 0).toLocaleString('id-ID')} ({(booking.distanceKm ?? 0).toFixed(1)} km)
                  </p>
                  <p className="mt-0.5 text-base font-bold text-brand-300">
                    Total Biaya: Rp {(booking.totalPrice ?? 0).toLocaleString('id-ID')}
                  </p>
                </div>

                {['PENDING', 'ACCEPTED'].includes(booking.status?.toUpperCase() ?? '') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <XCircle size={15} /> {cancellingId === booking.id ? 'Membatalkan...' : 'Batalkan Booking'}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
