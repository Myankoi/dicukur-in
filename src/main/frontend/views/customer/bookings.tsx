import { useEffect, useState } from 'react';
import { CalendarDays, CreditCard, MapPin, XCircle } from 'lucide-react';
import { Link } from 'react-router';
import { BookingEndpoint, PaymentEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';

interface Booking { id: number; bookingCode: string; barbershopName: string; barberName: string; serviceName: string; startDatetime: string; endDatetime: string; address: string; distanceKm: number; serviceSubtotal: number; travelFee: number; totalPrice: number; status: string; paymentStatus: string; }

const statusLabel: Record<string, string> = { pending: 'Menunggu konfirmasi', accepted: 'Dikonfirmasi', on_the_way: 'Dalam perjalanan', arrived: 'Sudah tiba', in_progress: 'Sedang dikerjakan', completed: 'Selesai', cancelled_by_customer: 'Dibatalkan', cancelled_by_barber: 'Dibatalkan barber', rejected: 'Ditolak' };

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<number>();

  const loadBookings = () => {
    setLoading(true);
    BookingEndpoint.getMyBookings().then((result) => setBookings((result ?? []).filter(Boolean) as Booking[])).catch((cause) => setError(cause instanceof Error ? cause.message : 'Booking gagal dimuat')).finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, []);

  const cancel = async (id: number) => {
    if (!window.confirm('Batalkan booking ini?')) return;
    try { await BookingEndpoint.cancel(id, 'Dibatalkan oleh customer'); loadBookings(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Booking gagal dibatalkan'); }
  };

  const startPayment = async (bookingId: number) => {
    setPayingId(bookingId);
    setError('');
    try {
      const result = await PaymentEndpoint.start(bookingId);
      if (result?.redirectUrl) {
        window.location.assign(result.redirectUrl);
      } else if (result?.message) {
        window.alert(result.message);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Pembayaran gagal dimulai');
    } finally {
      setPayingId(undefined);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Riwayat layanan</p><h1 className="mt-2 font-display text-4xl font-semibold text-zinc-950">Pesanan saya</h1><p className="mt-2 text-sm text-zinc-500">Pantau jadwal, status barber, dan pembayaran booking kamu.</p></div><Link to="/customer/bookings/new"><Button><CalendarDays size={17} /> Booking baru</Button></Link></div>
      {error && <p className="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="text-sm text-zinc-500">Memuat booking...</p> : bookings.length === 0 ? <div className="border border-dashed border-zinc-300 bg-white px-6 py-14 text-center"><CalendarDays className="mx-auto text-brand-500" size={26} /><h2 className="mt-4 font-display text-2xl font-semibold text-zinc-950">Belum ada booking</h2><p className="mt-2 text-sm text-zinc-500">Cari barbershop resmi pertama kamu dan atur jadwalnya.</p></div> : <div className="space-y-4">{bookings.map((booking) => <article key={booking.id} className="border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold tracking-[0.16em] text-brand-700">{booking.bookingCode}</p><h2 className="mt-1 font-display text-2xl font-semibold text-zinc-950">{booking.barbershopName}</h2><p className="mt-1 text-sm text-zinc-500">{booking.serviceName} · {booking.barberName}</p></div><span className="w-fit bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">{statusLabel[booking.status] || booking.status}</span></div><div className="grid gap-4 py-5 text-sm text-zinc-600 sm:grid-cols-3"><p className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-brand-600" /> {new Date(booking.startDatetime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p><p className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" /> {booking.distanceKm.toFixed(2)} km · {booking.address}</p><p className="flex gap-2"><CreditCard size={16} className="mt-0.5 shrink-0 text-brand-600" /> Rp {booking.totalPrice.toLocaleString('id-ID')} · {booking.paymentStatus}</p></div><div className="flex flex-wrap justify-end gap-3 border-t border-zinc-100 pt-4">{['pending', 'accepted'].includes(booking.status) && <Button variant="ghost" size="sm" onClick={() => void cancel(booking.id)}><XCircle size={15} /> Batalkan</Button>}{booking.paymentStatus !== 'paid' && !booking.status.startsWith('cancelled') && <Button size="sm" onClick={() => void startPayment(booking.id)} disabled={payingId === booking.id}><CreditCard size={15} /> {payingId === booking.id ? 'Menyiapkan...' : 'Bayar booking'}</Button>}</div></article>)}</div>}
    </div>
  );
}
