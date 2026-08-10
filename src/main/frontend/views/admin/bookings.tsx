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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Monitoring Sistem</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Seluruh Transaksi Booking
          </h1>
          <p className="mt-2 text-sm text-slate-500">Pantau seluruh janji cukur customer dan barber secara real-time.</p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => void loadBookings()} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Segarkan
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode booking, nama customer, atau barber..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CUSTOMER'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-400">Memuat data booking...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs font-medium text-slate-500 shadow-xs">
          Tidak ada data booking yang cocok dengan filter.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">#{b.bookingCode}</span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs font-bold text-slate-700">{b.startDatetime || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700 border border-slate-200">
                    {b.status}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      b.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {b.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Customer</p>
                  <p className="font-bold text-slate-900 mt-0.5">{b.customerName}</p>
                  <p className="text-[11px] text-slate-500">{b.customerEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Barber / Barbershop</p>
                  <p className="font-bold text-slate-900 mt-0.5">{b.barberName}</p>
                  <p className="text-[11px] text-slate-500">{b.barbershopName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Layanan</p>
                  <p className="font-bold text-slate-900 mt-0.5">{b.serviceName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Harga</p>
                  <p className="font-extrabold text-blue-700 mt-0.5 text-sm">Rp {(b.totalPrice ?? 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
