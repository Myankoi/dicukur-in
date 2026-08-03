import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react';
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
      <div className="mx-auto max-w-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <MapPin className="mx-auto text-brand-500" size={28} />
        <h1 className="mt-4 font-display text-3xl font-semibold text-zinc-950">Tambahkan alamat dulu</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">Kami perlu lokasi tujuan untuk menghitung barbershop terdekat dan biaya perjalanan.</p>
        <Button className="mt-6" onClick={() => navigate('/customer/addresses')}>Atur alamat</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Booking baru</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-zinc-950">Cari barbershop di dekatmu</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Pilih barbershop resmi, lalu pilih karyawan yang tersedia untuk datang ke lokasi kamu.</p>
      </div>

      {error && <p className="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex flex-col gap-3 border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
        <label className="min-w-0 flex-1 space-y-2">
          <span className="text-xs font-semibold text-zinc-700">Layanan ke alamat</span>
          <select value={selectedAddressId ?? ''} onChange={(event) => setSelectedAddressId(Number(event.target.value))} className="h-11 w-full border border-zinc-300 bg-white px-3 text-sm text-zinc-800 focus:border-brand-500 focus:outline-none">
            {addresses.map((address) => <option key={address.id} value={address.id}>{address.label || 'Alamat'} · {address.fullAddress}</option>)}
          </select>
        </label>
        <label className="relative min-w-0 flex-1 space-y-2">
          <span className="text-xs font-semibold text-zinc-700">Cari nama atau area</span>
          <Search size={16} className="absolute bottom-3 left-3 text-zinc-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Misalnya: Senopati" className="h-11 w-full border border-zinc-300 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none" />
        </label>
        <div className="flex h-11 items-center gap-2 px-1 text-xs text-zinc-500"><SlidersHorizontal size={15} /> Radius 25 km</div>
      </div>

      {searching ? <p className="text-sm text-zinc-500">Mencari barbershop...</p> : filteredShops.length === 0 ? (
        <div className="border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
          <h2 className="font-display text-2xl font-semibold text-zinc-950">Belum ada yang cocok</h2>
          <p className="mt-2 text-sm text-zinc-500">Coba alamat atau kata kunci area lain. Barbershop harus sudah aktif dan disetujui admin.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredShops.map((shop) => (
            <article key={shop.id} className="flex min-h-64 flex-col border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-display text-2xl font-semibold text-zinc-950">{shop.name}</h2><p className="mt-1 text-xs text-zinc-500">{shop.city || 'Lokasi terdekat'}</p></div>
                <span className="flex items-center gap-1 text-xs font-semibold text-brand-700"><Star size={13} fill="currentColor" /> {shop.ratingAverage?.toFixed?.(1) ?? '0.0'}</span>
              </div>
              <p className="mt-5 line-clamp-2 text-sm leading-6 text-zinc-600">{shop.description || 'Barbershop partner resmi dicukur.in.'}</p>
              <div className="mt-5 space-y-2 text-xs text-zinc-500"><p className="flex gap-2"><MapPin size={14} className="shrink-0 text-brand-600" /> {shop.address}</p><p>{shop.distanceKm.toFixed(1)} km dari alamatmu · {shop.totalCompleted} booking selesai</p></div>
              <Link to={`/customer/barbershops/${shop.id}`} className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-5 text-sm font-semibold text-brand-700 hover:text-brand-500">Lihat karyawan & layanan <ArrowRight size={16} /></Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
