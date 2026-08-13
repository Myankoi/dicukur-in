import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star, Store } from 'lucide-react';
import { Link } from 'react-router';
import { BarbershopEndpoint, CustomerAddressEndpoint } from '../../generated/endpoints.js';
import type NearbyBarbershopResponse from '../../generated/com/dicukur/app/barbershop/dto/NearbyBarbershopResponse.js';
import type AddressResponse from '../../generated/com/dicukur/app/address/dto/AddressResponse.js';

const RADIUS_OPTIONS = [
  { label: 'Semua Radius (Default)', value: 0 },
  { label: '< 5 km (Terdekat)', value: 5 },
  { label: '< 10 km (Sedang)', value: 10 },
  { label: '< 25 km (Luas)', value: 25 },
];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
];

export default function CustomerBookingsNewPage() {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>();
  const [shops, setShops] = useState<NearbyBarbershopResponse[]>([]);
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(0);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    CustomerAddressEndpoint.getMyAddresses()
      .then((items) => {
        const valid = (items ?? []).filter(Boolean) as AddressResponse[];
        setAddresses(valid);
        const def = valid.find((item) => item.isDefault) ?? valid[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Daftar alamat gagal dimuat'));
  }, []);

  useEffect(() => {
    if (!selectedAddressId) return;
    setSearching(true);
    BarbershopEndpoint.searchNearby(selectedAddressId, radiusKm)
      .then((result) => setShops((result ?? []).filter(Boolean) as NearbyBarbershopResponse[]))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Pencarian barbershop terdekat gagal'))
      .finally(() => setSearching(false));
  }, [selectedAddressId]);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchQuery =
        !query.trim() ||
        (shop.name || '').toLowerCase().includes(query.trim().toLowerCase()) ||
        (shop.city || '').toLowerCase().includes(query.trim().toLowerCase()) ||
        (shop.address || '').toLowerCase().includes(query.trim().toLowerCase());

      const matchRadius = radiusKm <= 0 || (shop.distanceKm || 0) <= radiusKm;

      return matchQuery && matchRadius;
    });
  }, [shops, query, radiusKm]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-display text-3xl font-bold text-slate-900">Cari Barbershop Mitra</h1>
        <p className="mt-1 text-xs text-slate-600">
          Pilih lokasi barbershop resmi di sekitar tempat tinggalmu untuk memanggil barber ke lokasi.
        </p>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}

      {/* 1. Location Selection Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm mt-0.5">
              <MapPin size={20} />
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Lokasi Tujuan Cukur (Rumah/Lokasimu)</span>
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
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer shadow-sm"
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
            className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none shadow-sm"
          />
        </div>

        {/* Radius Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 mr-2">
            <SlidersHorizontal size={14} className="text-blue-600" /> Filter Radius:
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20'
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
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
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
                      <MapPin size={14} className="shrink-0 text-blue-600" />
                      <span className="truncate">{shop.address}</span>
                    </p>
                    <p className="text-[11px] font-bold text-slate-500">
                      {shop.distanceKm.toFixed(1)} km dari lokasimu · {shop.totalCompleted} booking selesai
                    </p>
                  </div>

                  <Link
                    to={`/customer/barbershops/${shop.id}`}
                    className="mt-2 inline-flex items-center justify-between rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
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
