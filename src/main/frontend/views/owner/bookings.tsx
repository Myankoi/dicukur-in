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
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-red-600/10 blur-[100px]" />
        
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pesanan Masuk
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm">
            Pantau seluruh jadwal & alur status booking pelanggan di toko Anda.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode booking, nama customer, atau nama barber..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-red-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {['ALL', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="size-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <CalendarDays size={32} className="text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-800">Belum Ada Pesanan</p>
          <p className="text-[11px] text-slate-500 mt-1">Belum ada booking yang sesuai dengan filter ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-red-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-600">#{b.bookingCode}</span>
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    {b.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <User size={15} className="text-slate-500" />
                  Pelanggan
                  <span className="text-xs font-normal text-slate-500">• Barber: {b.barberName || '-'}</span>
                </h3>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <Clock size={13} className="text-slate-400" />
                  {b.startDatetime || '-'}
                  <span className="text-slate-300">•</span>
                  <MapPin size={13} className="text-slate-400" />
                  {b.address || 'Alamat Customer'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0 sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Biaya</span>
                  <span className="font-display font-bold text-sm text-emerald-600">
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
