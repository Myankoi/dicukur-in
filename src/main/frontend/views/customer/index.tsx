import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, MapPin, Scissors, Clock, Plus, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { BookingEndpoint, CustomerAddressEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type BookingResponse from '../../generated/com/dicukur/app/booking/dto/BookingResponse.js';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState<BookingResponse[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      BookingEndpoint.getMyBookings(),
      CustomerAddressEndpoint.getMyAddresses(),
    ])
      .then(([bookings, addresses]) => {
        setRecentBookings(((bookings ?? []).filter(Boolean) as BookingResponse[]).slice(0, 3));
        const def = (addresses ?? []).find((a) => a?.isDefault) ?? addresses?.[0];
        if (def) {
          setDefaultAddress(`${def.label || 'Alamat'} · ${def.fullAddress}`);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeBooking = recentBookings.find(
    (b) => b.status && !['completed', 'cancelled', 'cancelled_by_customer'].includes(b.status.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Sleek Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Scissors size={14} /> Dashboard Pelanggan
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Selamat Datang di Dicukur.in</h1>
          <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{defaultAddress || 'Belum ada alamat lokasi cukur yang diatur'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            onClick={() => navigate('/customer/bookings/new')}
          >
            <Plus size={16} /> Pesan Barber Sekarang
          </Button>
        </div>
      </div>

      {/* Active Booking Banner (If Any) */}
      {activeBooking && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-300">
              <Clock size={14} /> Pesan Berlangsung #{activeBooking.bookingCode}
            </span>
            <span className="text-xs font-bold capitalize text-amber-900">{activeBooking.status}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-amber-200/60 pt-3">
            <div>
              <p className="font-bold text-slate-900">{activeBooking.serviceName} · {activeBooking.barberName}</p>
              <p className="text-slate-600 mt-0.5">{activeBooking.barbershopName}</p>
            </div>

            <Link
              to={`/customer/bookings/${activeBooking.id}`}
              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Lihat Detail Status</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Link
          to="/customer/bookings/new"
          className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
        >
          <div className="space-y-3">
            <span className="grid size-11 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
              <Scissors size={20} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Pesan Barber</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Cari barbershop mitra terdekat dan pilih barber untuk dipanggil ke lokasimu.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Cari Barbershop</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          to="/customer/bookings"
          className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
        >
          <div className="space-y-3">
            <span className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
              <Calendar size={20} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Riwayat Booking</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Pantau status pemesanan aktif, bayar pesanan, dan lihat riwayat cukur.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Lihat Pesanan</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          to="/customer/addresses"
          className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
        >
          <div className="space-y-3">
            <span className="grid size-11 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
              <MapPin size={20} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Kelola Alamat</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Atur titik lokasi rumah/kantor untuk perhitungan jarak perjalanan barber.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Atur Alamat</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Recent Bookings Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-bold text-sm text-slate-900">Pesanan Terakhir</h2>
          <Link to="/customer/bookings" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Lihat Semua →
          </Link>
        </div>

        {loading ? (
          <p className="py-6 text-center text-xs text-slate-500">Memuat pesanan...</p>
        ) : recentBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-2">
            <p>Belum ada pemesanan cukur yang dibuat.</p>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={() => navigate('/customer/bookings/new')}
            >
              Buat Pemesanan Pertama
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => (
              <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">#{b.bookingCode}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {b.status}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 mt-1">{b.serviceName} · {b.barberName}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">Rp {(b.totalPrice ?? 0).toLocaleString('id-ID')}</span>
                  <Link
                    to={`/customer/bookings/${b.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
