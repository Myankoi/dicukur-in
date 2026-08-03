import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LocateFixed, MapPin, Plus, Search, Star, Trash2 } from 'lucide-react';
import { CustomerAddressEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import { InputField, TextareaField } from '../../components/ui/Field.js';

interface Address {
  id: number;
  label?: string;
  recipientName?: string;
  phone?: string;
  fullAddress: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  notes?: string;
  isDefault: boolean;
}

interface FormState {
  label: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  notes: string;
  isDefault: boolean;
}

const initialForm: FormState = {
  label: 'Rumah',
  recipientName: '',
  phone: '',
  fullAddress: '',
  city: '',
  province: '',
  postalCode: '',
  latitude: '',
  longitude: '',
  notes: '',
  isDefault: true,
};

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
}

interface MapPickerProps {
  latitude: string;
  longitude: string;
  onLocationSelect: (
    lat: string,
    lng: string,
    details?: { fullAddress?: string; city?: string; province?: string; postalCode?: string }
  ) => void;
}

function MapPicker({ latitude, longitude, onLocationSelect }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Leaflet Assets dynamically
  useEffect(() => {
    if (document.getElementById('leaflet-css')) {
      if ((window as any).L) setMapLoaded(true);
      return;
    }

    const css = document.createElement('link');
    css.id = 'leaflet-css';
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Reverse Geocoding helper
  const reverseGeocode = async (lat: number, lng: number) => {
    const latStr = lat.toFixed(8);
    const lngStr = lng.toFixed(8);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.city_district || addr.county || addr.municipality || '';
        const province = addr.state || '';
        const postalCode = addr.postcode || '';
        const fullAddress = data.display_name || `${latStr}, ${lngStr}`;
        onLocationSelect(latStr, lngStr, { fullAddress, city, province, postalCode });
        return;
      }
    } catch {
      // Fallback if network issue
    }
    onLocationSelect(latStr, lngStr);
  };

  // Initialize Map with Google Maps Tile Layer
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const defaultLat = Number(latitude) || -6.200000;
    const defaultLng = Number(longitude) || 106.816666;

    const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 15);

    // Google Maps Tile Layer
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Google Maps',
    }).addTo(map);

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const marker = L.marker([defaultLat, defaultLng], { draggable: true, icon: customIcon }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      void reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', (e: any) => {
      marker.setLatLng(e.latlng);
      void reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [mapLoaded]);

  // Sync marker position when latitude or longitude props change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    if (Number.isFinite(latNum) && Number.isFinite(lngNum) && latNum !== 0 && lngNum !== 0) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - latNum) > 0.00001 || Math.abs(currentPos.lng - lngNum) > 0.00001) {
        markerRef.current.setLatLng([latNum, lngNum]);
        mapInstanceRef.current.panTo([latNum, lngNum]);
      }
    }
  }, [latitude, longitude]);

  // Address search via Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=id&limit=5`
      );
      const data = await response.json();
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    const latNum = Number(result.lat);
    const lngNum = Number(result.lon);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([latNum, lngNum], 16);
      markerRef.current.setLatLng([latNum, lngNum]);
    }

    const addr = result.address;
    const city = addr?.city || addr?.town || addr?.city_district || addr?.county || '';
    const province = addr?.state || '';
    const postalCode = addr?.postcode || '';
    const fullAddress = result.display_name;

    onLocationSelect(result.lat, result.lon, {
      fullAddress,
      city,
      province,
      postalCode,
    });

    setSearchResults([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-300">
          Lokasi Google Maps (Klik peta / cari lokasi)
        </label>
        <span className="text-[11px] text-zinc-500">Klik peta atau geser penanda untuk memilih titik</span>
      </div>

      {/* Search Input for Map */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSearch();
                }
              }}
              placeholder="Cari nama jalan / tempat di peta (contoh: Monas, Jakarta Pusat)..."
              className="h-11 w-full rounded-md border border-zinc-700 bg-zinc-950/70 pl-9 pr-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <Button
            type="button"
            size="md"
            variant="secondary"
            disabled={isSearching}
            onClick={() => void handleSearch()}
          >
            {isSearching ? 'Mencari...' : 'Cari di Peta'}
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-[1000] mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 shadow-2xl backdrop-blur-md">
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => selectSearchResult(item)}
                className="w-full border-b border-zinc-800 p-3 text-left transition-colors hover:bg-zinc-800/80"
              >
                <p className="text-xs font-semibold text-brand-300">{item.display_name.split(',')[0]}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-400">{item.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Element */}
      <div className="relative h-72 w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 shadow-inner">
        <div ref={mapContainerRef} className="h-full w-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 text-xs text-zinc-400">
            Memuat Google Maps...
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const result = await CustomerAddressEndpoint.getMyAddresses();
      setAddresses((result ?? []).filter(Boolean) as Address[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Alamat gagal dimuat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const updateForm = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleMapLocationSelect = (
    lat: string,
    lng: string,
    details?: { fullAddress?: string; city?: string; province?: string; postalCode?: string }
  ) => {
    setForm((current) => ({
      ...current,
      latitude: lat,
      longitude: lng,
      fullAddress: details?.fullAddress || current.fullAddress,
      city: details?.city || current.city,
      province: details?.province || current.province,
      postalCode: details?.postalCode || current.postalCode,
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser ini tidak mendukung lokasi perangkat');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latStr = position.coords.latitude.toFixed(8);
        const lngStr = position.coords.longitude.toFixed(8);
        updateForm('latitude', latStr);
        updateForm('longitude', lngStr);
        setError('');
      },
      () => setError('Lokasi tidak bisa diakses. Izinkan lokasi atau masukkan koordinat manual.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveAddress = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!form.fullAddress.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError('Alamat lengkap dan koordinat wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await CustomerAddressEndpoint.create({
        label: form.label,
        recipientName: form.recipientName,
        phone: form.phone,
        fullAddress: form.fullAddress,
        district: '',
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        latitude,
        longitude,
        notes: form.notes,
        isDefault: form.isDefault,
      });
      setForm(initialForm);
      setShowForm(false);
      await loadAddresses();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Alamat gagal disimpan');
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: number) => {
    if (!window.confirm('Hapus alamat ini?')) return;
    try {
      await CustomerAddressEndpoint.delete(id);
      await loadAddresses();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Alamat gagal dihapus');
    }
  };

  const makeDefault = async (id: number) => {
    try {
      await CustomerAddressEndpoint.setDefault(id);
      await loadAddresses();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Alamat utama gagal diubah');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Lokasi Layanan</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-zinc-100">Alamat Saya</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Barber datang ke alamat yang kamu tentukan. Koordinat dipakai untuk menghitung jarak dan biaya perjalanan.
          </p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <Plus size={17} />
          {showForm ? 'Tutup Form' : 'Tambah Alamat'}
        </Button>
      </div>

      {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</p>}

      {showForm && (
        <form onSubmit={saveAddress} className="space-y-6 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div>
              <h2 className="font-display text-2xl font-semibold text-zinc-100">Tambah Alamat Baru</h2>
              <p className="mt-1 text-xs text-zinc-400">Pilih lokasi di Google Maps atau cari alamat agar lokasi presisi.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={useCurrentLocation}>
              <LocateFixed size={15} />
              Ambil Lokasi GPS
            </Button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InputField label="Label Alamat" name="label" value={form.label} onChange={(event) => updateForm('label', event.target.value)} placeholder="Rumah / Kantor / Apartemen" />
            <InputField label="Nama Penerima" name="recipientName" value={form.recipientName} onChange={(event) => updateForm('recipientName', event.target.value)} placeholder="Nama yang ditemui barber" />
          </div>

          <InputField label="Nomor Telepon / WhatsApp" name="phone" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} placeholder="08xxxxxxxxxx" />

          {/* Interactive Google Maps Search & Picker */}
          <MapPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onLocationSelect={handleMapLocationSelect}
          />

          <TextareaField label="Alamat Lengkap" name="fullAddress" value={form.fullAddress} onChange={(event) => updateForm('fullAddress', event.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW, atau patokan" required />

          <div className="grid gap-5 sm:grid-cols-3">
            <InputField label="Kota" name="city" value={form.city} onChange={(event) => updateForm('city', event.target.value)} placeholder="Jakarta Selatan" />
            <InputField label="Provinsi" name="province" value={form.province} onChange={(event) => updateForm('province', event.target.value)} placeholder="DKI Jakarta" />
            <InputField label="Kode Pos" name="postalCode" value={form.postalCode} onChange={(event) => updateForm('postalCode', event.target.value)} placeholder="12190" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InputField label="Latitude" name="latitude" value={form.latitude} onChange={(event) => updateForm('latitude', event.target.value)} placeholder="-6.20000000" inputMode="decimal" required />
            <InputField label="Longitude" name="longitude" value={form.longitude} onChange={(event) => updateForm('longitude', event.target.value)} placeholder="106.81666667" inputMode="decimal" required />
          </div>

          <TextareaField label="Catatan Tambahan untuk Barber" name="notes" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="Contoh: masuk lewat gerbang samping, ada anjing penjaga, dll." />

          <label className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
            <input type="checkbox" checked={form.isDefault} onChange={(event) => updateForm('isDefault', event.target.checked)} className="size-4 rounded border-zinc-700 bg-zinc-950 accent-brand-500" />
            Jadikan alamat utama untuk pencarian
          </label>

          <div className="flex justify-end gap-3 border-t border-zinc-800/80 pt-5">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Alamat'}</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-xs text-zinc-500">Memuat data alamat...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center backdrop-blur-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-brand-400/20 bg-zinc-950 text-brand-400 shadow-inner">
            <MapPin size={24} />
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold text-zinc-100">Belum Ada Alamat Tersimpan</h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-400">
            Tambahkan lokasi pertama kamu agar sistem dapat mencari barbershop terdekat di sekitarmu.
          </p>
          <Button className="mt-6" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Tambah Alamat Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg border border-brand-400/30 bg-zinc-950 text-brand-300">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <h2 className="font-semibold text-zinc-100">{address.label || 'Alamat'}</h2>
                      {address.isDefault && (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-300">
                          <Star size={10} fill="currentColor" /> Utama
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeAddress(address.id)}
                    className="text-zinc-500 transition-colors hover:text-red-400"
                    aria-label={`Hapus ${address.label || 'alamat'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-zinc-300">{address.fullAddress}</p>
                <p className="mt-2 text-[11px] text-zinc-500">
                  {[address.city, address.province, address.postalCode].filter(Boolean).join(', ')}
                </p>
              </div>

              {!address.isDefault && (
                <div className="mt-6 border-t border-zinc-800/80 pt-4">
                  <button
                    type="button"
                    onClick={() => void makeDefault(address.id)}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                  >
                    Jadikan Alamat Utama
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}


