import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  Search,
  Filter,
  User,
  Scissors,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { BookingEndpoint } from '../../generated/endpoints.js';
import type BookingResponse from '../../generated/com/dicukur/app/booking/dto/BookingResponse.js';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Untuk MVP, menggunakan endpoint getMyBookings / booking barbershop
      const data = await BookingEndpoint.getMyBookings();
      setBookings((data || []).filter((b): b is BookingResponse => b !== undefined));
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat daftar pemesanan barbershop.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.bookingCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.barbershopName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.barberName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (b.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/10 blur-[100px]" />
        
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <CalendarDays size={13} />
            Monitoring Booking Barbershop
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Pesanan Masuk
          </h1>
          <p className="text-xs text-zinc-400 sm:text-sm">
            Pantau seluruh jadwal & alur status booking pelanggan di toko Anda.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari kode booking, nama customer, atau nama barber..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2.5 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          {['ALL', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <span className="size-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
          <CalendarDays size={32} className="text-zinc-600 mb-2" />
          <p className="text-xs font-semibold text-zinc-300">Belum Ada Pesanan</p>
          <p className="text-[11px] text-zinc-500 mt-1">Belum ada booking yang sesuai dengan filter ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl transition-all hover:border-zinc-700/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-amber-400">#{b.bookingCode}</span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                    {b.status}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <User size={15} className="text-zinc-400" />
                  Pelanggan
                  <span className="text-xs font-normal text-zinc-500">• Barber: {b.barberName || '-'}</span>
                </h3>
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                  <Clock size={13} className="text-zinc-500" />
                  {b.startDatetime || '-'}
                  <span className="text-zinc-600">•</span>
                  <MapPin size={13} className="text-zinc-500" />
                  {b.address || 'Alamat Customer'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-zinc-800/60 pt-3 sm:border-0 sm:pt-0 sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Total Biaya</span>
                  <span className="font-display font-semibold text-sm text-emerald-400">
                    {formatCurrency(b.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
