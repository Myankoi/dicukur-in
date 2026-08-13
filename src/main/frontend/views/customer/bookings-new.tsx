import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star, Store, Check, Compass } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { BarbershopEndpoint, CustomerAddressEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';

interface Address { id: number; label?: string; fullAddress: string; isDefault: boolean; }
interface Shop { id: number; name: string; description?: string; address: string; city?: string; distanceKm: number; ratingAverage: number; totalCompleted: number; photoUrl?: string; }

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=600&auto=format&fit=crop&q=80',
];

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km (Default)' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km (Semua)' },
];

export default function NewBookingPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>();
  const [shops, setShops] = useState<Shop[]>([]);
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    CustomerAddressEndpoint.getMyAddresses()
      .then((result) => {
        const next = (result ?? []).filter(Boolean) as Address[];
        setAddresses(next);
        setSelectedAddressId(next.find((item) => item.isDefault)?.id ?? next[0]?.id);
      })
      .catch(() => setError('Alamat gagal dimuat'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAddressId) return;
    setSearching(true);
    BarbershopEndpoint.searchNearby(selectedAddressId, radiusKm)
      .then((result) => setShops((result ?? []).filter(Boolean) as Shop[]))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Pencarian barbershop gagal'))
      .finally(() => setSearching(false));
  }, [selectedAddressId, radiusKm]);

  const selectedAddress = useMemo(() => addresses.find((a) => a.id === selectedAddressId), [addresses, selectedAddressId]);

  const filteredShops = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return shops;
    return shops.filter((shop) => `${shop.name} ${shop.city ?? ''} ${shop.address}`.toLowerCase().includes(normalized));
  }, [query, shops]);

  if (!loading && addresses.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-red-200 bg-red-50 text-red-600 shadow-md">
          <MapPin size={28} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold text-slate-900">Tambahkan Alamat Terlebih Dahulu</h1>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-600">
          Sistem membutuhkan lokasi tujuan untuk mencari lokasi barbershop mitra terdekat dan menghitung biaya perjalanan secara akurat.
        </p>
        <Button className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold" size="lg" onClick={() => navigate('/customer/addresses')}>
          <MapPin size={16} /> Atur Alamat Sekarang
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Mitra Barbershop Terdekat</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Pilih tempat cukur resmi di sekitarmu, tentukan barber pilihan, dan atur waktu kedatangan ke lokasimu.
        </p>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}

      {/* 1. Location Selection Card (Spacious & Clean UX) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm mt-0.5">
              <MapPin size={20} />
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">Alamat Tujuan Pengiriman</span>
              <h2 className="font-bold text-sm text-slate-900 truncate">
                {selectedAddress?.label || 'Alamat Utama'} · {selectedAddress?.fullAddress}
              </h2>
            </div>
          </div>

          {/* Location Selector Dropdown */}
          <div className="shrink-0 w-full sm:w-64">
            <select
              value={selectedAddressId ?? ''}
              onChange={(event) => setSelectedAddressId(Number(event.target.value))}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none cursor-pointer shadow-sm"
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label || 'Alamat'} · {address.fullAddress}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Radius Pill Filters */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama barbershop atau lokasi area (contoh: Senopati, Cipayung, Executive)..."
            className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none shadow-sm"
          />
        </div>

        {/* Interactive Radius Pill Buttons (Intuitive UI/UX) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 mr-2">
            <SlidersHorizontal size={14} className="text-red-600" /> Filter Radius:
          </span>
          {RADIUS_OPTIONS.map((option) => {
            const isSelected = radiusKm === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRadiusKm(option.value)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20 ring-2 ring-red-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Barbershop Cards List */}
      {searching ? (
        <div className="py-16 text-center text-xs font-medium text-slate-500 rounded-2xl border border-slate-200 bg-white">Mencari barbershop mitra terdekat...</div>
      ) : filteredShops.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
            <Store size={24} />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">Belum Ada Barbershop yang Cocok</h2>
          <p className="mt-2 text-xs text-slate-500">
            Coba pilih jangkauan radius lebih luas atau gunakan kata kunci area lain.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredShops.map((shop, idx) => {
            const photoSrc = shop.photoUrl || SAMPLE_PHOTOS[idx % SAMPLE_PHOTOS.length];

            return (
              <article
                key={shop.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-md"
              >
                {/* Visual Header Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={photoSrc}
                    alt={shop.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-amber-400 backdrop-blur-md">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    {shop.ratingAverage?.toFixed?.(1) ?? '0.0'}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold text-white drop-shadow-md">
                        {shop.name}
                      </h2>
                      <p className="text-xs text-slate-200 font-medium">{shop.city || 'Lokasi Terdekat'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {shop.description || 'Barbershop partner resmi dicukur.in dengan tim profesional.'}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="shrink-0 text-red-600" />
                      <span className="truncate">{shop.address}</span>
                    </p>
                    <p className="text-[11px] font-bold text-slate-500">
                      {shop.distanceKm.toFixed(1)} km dari lokasimu · {shop.totalCompleted} booking selesai
                    </p>
                  </div>

                  <Link
                    to={`/customer/barbershops/${shop.id}`}
                    className="mt-2 inline-flex items-center justify-between rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700 transition"
                  >
                    <span>Pilih Barbershop</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
