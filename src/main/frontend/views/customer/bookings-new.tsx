import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { BarbershopEndpoint, CustomerAddressEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';

interface Address { id: number; label?: string; fullAddress: string; isDefault: boolean; }
interface Shop { id: number; name: string; description?: string; address: string; city?: string; distanceKm: number; ratingAverage: number; totalCompleted: number; }

export default function NewBookingPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>();
  const [shops, setShops] = useState<Shop[]>([]);
  const [query, setQuery] = useState('');
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
    BarbershopEndpoint.searchNearby(selectedAddressId, 25)
      .then((result) => setShops((result ?? []).filter(Boolean) as Shop[]))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Pencarian barbershop gagal'))
      .finally(() => setSearching(false));
  }, [selectedAddressId]);

  const filteredShops = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return shops;
    return shops.filter((shop) => `${shop.name} ${shop.city ?? ''} ${shop.address}`.toLowerCase().includes(normalized));
  }, [query, shops]);

  if (!loading && addresses.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center backdrop-blur-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-brand-400/20 bg-zinc-950 text-brand-300 shadow-xl">
          <MapPin size={28} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-zinc-100">Tambahkan Alamat Terlebih Dahulu</h1>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-400">
          Sistem membutuhkan lokasi tujuan untuk mencari lokasi barbershop mitra terdekat dan menghitung biaya perjalanan secara akurat.
        </p>
        <Button className="mt-8" size="lg" onClick={() => navigate('/customer/addresses')}>
          <MapPin size={16} /> Atur Alamat Sekarang
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Cari Barbershop</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-zinc-100">Mitra Barbershop Terdekat</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Pilih tempat cukur resmi di sekitarmu, tentukan barber pilihan, dan atur waktu kedatangan ke lokasimu.
        </p>
      </div>

      {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</p>}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-md md:flex-row md:items-end">
        <label className="min-w-0 flex-1 space-y-1.5">
          <span className="text-xs font-semibold text-zinc-300">Layanan Dikirim ke Alamat</span>
          <select
            value={selectedAddressId ?? ''}
            onChange={(event) => setSelectedAddressId(Number(event.target.value))}
            className="h-11 w-full rounded-md border border-zinc-700 bg-zinc-950/70 px-3.5 text-xs text-zinc-100 focus:border-brand-400 focus:outline-none"
          >
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.label || 'Alamat'} · {address.fullAddress}
              </option>
            ))}
          </select>
        </label>

        <label className="relative min-w-0 flex-1 space-y-1.5">
          <span className="text-xs font-semibold text-zinc-300">Cari Nama Barbershop / Area</span>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: Senopati, Barbershop Executive..."
              className="h-11 w-full rounded-md border border-zinc-700 bg-zinc-950/70 pl-9 pr-3.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-brand-400 focus:outline-none"
            />
          </div>
        </label>

        <div className="flex h-11 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3.5 text-xs text-zinc-400">
          <SlidersHorizontal size={15} className="text-brand-400" />
          <span>Radius 25 km</span>
        </div>
      </div>

      {searching ? (
        <div className="py-12 text-center text-xs text-zinc-500">Mencari barbershop mitra terdekat...</div>
      ) : filteredShops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center backdrop-blur-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-500">
            <Store size={24} />
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold text-zinc-100">Belum Ada Barbershop yang Cocok</h2>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            Coba ganti alamat tujuan atau kata kunci pencarian area lain.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredShops.map((shop) => (
            <article
              key={shop.id}
              className="group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-brand-500/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl border border-brand-400/20 bg-zinc-950 text-brand-300">
                    <Store size={20} />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-zinc-100 group-hover:text-brand-300 transition-colors">
                      {shop.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-zinc-500">{shop.city || 'Lokasi Terdekat'}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-300">
                  <Star size={12} fill="currentColor" />
                  {shop.ratingAverage?.toFixed?.(1) ?? '0.0'}
                </span>
              </div>

              <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                {shop.description || 'Barbershop partner resmi dicukur.in dengan tim profesional.'}
              </p>

              <div className="mt-5 space-y-1.5 border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="shrink-0 text-brand-400" />
                  <span className="truncate">{shop.address}</span>
                </p>
                <p className="text-[11px] text-zinc-500">
                  {shop.distanceKm.toFixed(1)} km dari lokasimu · {shop.totalCompleted} booking selesai
                </p>
              </div>

              <Link
                to={`/customer/barbershops/${shop.id}`}
                className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs font-semibold text-brand-400 group-hover:text-brand-300"
              >
                <span>Lihat Barber & Layanan</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

