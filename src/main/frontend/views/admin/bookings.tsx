import { useEffect, useState, useCallback } from 'react';
import { CalendarDays, Filter, RefreshCw, Search, UserRound, Scissors, MapPin, DollarSign } from 'lucide-react';
import { AdminMonitoringEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type AdminBookingResponse from '../../generated/com/dicukur/app/admin/dto/AdminBookingResponse.js';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AdminMonitoringEndpoint.getAllBookings();
      setBookings((result ?? []).filter(Boolean) as AdminBookingResponse[]);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.bookingCode ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (b.customerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (b.barberName ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || (b.status ?? '').toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Monitoring Sistem</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-zinc-100">
            Seluruh Transaksi Booking
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Pantau seluruh janji cukur customer dan barber secara real-time.</p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => void loadBookings()} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Segarkan
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari kode booking, nama customer, atau barber..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter size={15} className="text-zinc-500 shrink-0" />
          {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CUSTOMER'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-brand-500 text-white'
                  : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-500">Memuat data booking...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-xs text-zinc-500">
          Tidak ada data booking yang cocok dengan filter.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm transition-all hover:border-zinc-700"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/60 pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand-300">#{b.bookingCode}</span>
                  <span className="text-xs text-zinc-500">·</span>
                  <span className="text-xs font-semibold text-zinc-300">{b.startDatetime || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold uppercase text-zinc-300">
                    {b.status}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      b.paymentStatus === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {b.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Customer</p>
                  <p className="font-semibold text-zinc-100 mt-0.5">{b.customerName}</p>
                  <p className="text-[11px] text-zinc-500">{b.customerEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Barber / Barbershop</p>
                  <p className="font-semibold text-zinc-100 mt-0.5">{b.barberName}</p>
                  <p className="text-[11px] text-zinc-500">{b.barbershopName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Layanan</p>
                  <p className="font-semibold text-zinc-100 mt-0.5">{b.serviceName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Total Harga</p>
                  <p className="font-bold text-brand-300 mt-0.5">Rp {(b.totalPrice ?? 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
