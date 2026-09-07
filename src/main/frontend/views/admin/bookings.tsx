import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, ArrowRightLeft, Filter, RefreshCw, Search, XCircle } from 'lucide-react';
import { AdminMonitoringEndpoint, AdminOperationsEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type AdminBookingResponse from '../../generated/com/dicukur/app/admin/dto/AdminBookingResponse.js';
import type UserResponse from '../../generated/com/dicukur/app/user/dto/UserResponse.js';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionId, setActionId] = useState<number>();
  const [error, setError] = useState('');
  const [barbers, setBarbers] = useState<UserResponse[]>([]);
  const [selectedBarbers, setSelectedBarbers] = useState<Record<number, string>>({});

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
    void AdminOperationsEndpoint.getAssignableBarbers()
      .then((result) => setBarbers((result ?? []).filter((item): item is UserResponse => item !== undefined && item.status === 'active')))
      .catch(() => setBarbers([]));
  }, [loadBookings]);

  const cancelBooking = async (booking: AdminBookingResponse) => {
    if (!booking.id || !window.confirm(`Batalkan booking #${booking.bookingCode}?`)) return;
    setActionId(booking.id);
    setError('');
    try {
      await AdminMonitoringEndpoint.cancelBooking(booking.id, 'Dibatalkan oleh admin karena kendala operasional');
      await loadBookings();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Booking gagal dibatalkan');
    } finally {
      setActionId(undefined);
    }
  };

  const reassignBooking = async (booking: AdminBookingResponse) => {
    const barberId = Number(selectedBarbers[booking.id!]);
    if (!booking.id || !barberId || !window.confirm('Alihkan booking #' + booking.bookingCode + ' ke barber yang dipilih?')) return;
    setActionId(booking.id);
    setError('');
    try {
      await AdminOperationsEndpoint.reassignBooking(booking.id, barberId);
      setSelectedBarbers((current) => ({ ...current, [booking.id!]: '' }));
      await loadBookings();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Booking gagal dialihkan');
    } finally {
      setActionId(undefined);
    }
  };

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Seluruh Transaksi Booking
          </h1>
          <p className="mt-1 text-sm text-slate-600">Pantau seluruh janji cukur customer dan barber secara real-time.</p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => void loadBookings()} disabled={loading} className="bg-white border-slate-300 text-slate-700">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Segarkan
        </Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"><AlertTriangle size={16} />{error}</div>}

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode booking, nama customer, atau barber..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_UNPAID', 'CANCELLED_BY_CUSTOMER'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="py-16 text-center text-xs font-medium text-slate-500 rounded-2xl border border-slate-200 bg-white">Memuat data booking...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-medium text-slate-500 shadow-sm">
          Tidak ada data booking yang cocok dengan filter.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-red-200"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-red-600">#{b.bookingCode}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-700">{b.startDatetime || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700 border border-slate-200">
                    {b.status}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      b.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.paymentStatus}
                  </span>
                </div>
              </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Customer</p>
                  <p className="font-bold text-slate-900 mt-0.5">{b.customerName}</p>
                  <p className="text-[11px] text-slate-500">{b.customerEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Barber / Barbershop</p>
                  <p className="font-bold text-slate-900 mt-0.5">{b.barberName}</p>
                  <p className="text-[11px] text-slate-500">{b.barbershopName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Layanan</p>
                  <p className="font-bold text-slate-900 mt-0.5">{b.serviceName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Total Harga</p>
                  <p className="font-bold text-red-600 mt-0.5">Rp {(b.totalPrice ?? 0).toLocaleString('id-ID')}</p>
                </div>
                {!['COMPLETED', 'REJECTED', 'CANCELLED_UNPAID', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_BARBER', 'CANCELLED_BY_ADMIN'].includes((b.status ?? '').toUpperCase()) && (
                  <div className="sm:col-span-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" size="sm" onClick={() => void cancelBooking(b)} disabled={actionId === b.id} className="self-start text-red-600 hover:bg-red-50">
                      <XCircle size={14} /> {actionId === b.id ? 'Memproses...' : 'Batalkan Booking'}
                    </Button>
                    {barbers.length > 0 && (
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <select
                          aria-label="Pilih barber pengganti"
                          value={selectedBarbers[b.id!] ?? ''}
                          onChange={(event) => setSelectedBarbers((current) => ({ ...current, [b.id!]: event.target.value }))}
                          className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
                        >
                          <option value="">Pilih barber pengganti</option>
                          {barbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
                        </select>
                        <Button variant="secondary" size="sm" onClick={() => void reassignBooking(b)} disabled={actionId === b.id || !selectedBarbers[b.id!]} className="min-h-11 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                          <ArrowRightLeft size={14} /> Alihkan
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
