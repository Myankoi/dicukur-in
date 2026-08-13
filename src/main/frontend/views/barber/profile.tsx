import { useEffect, useRef, useState } from 'react';
import {
  UserRound,
  Phone,
  Briefcase,
  MapPin,
  Star,
  CheckCircle2,
  Save,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Award,
  Search,
  LocateFixed,
} from 'lucide-react';
import { BarberEndpoint } from '../../generated/endpoints.js';

interface BarberProfile {
  name: string;
  email: string;
  phone: string;
  bio: string | null;
  experienceYears: number;
  baseAddress: string | null;
  baseLatitude: number;
  baseLongitude: number;
  serviceRadiusKm: number;
  verificationStatus: string;
  availabilityStatus: string;
  ratingAverage: number;
  totalCompleted: number;
}

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
  latitude: number;
  longitude: number;
  onLocationSelect: (
    lat: number,
    lng: number,
    details?: { fullAddress?: string }
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
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        onLocationSelect(lat, lng, { fullAddress: data.display_name });
        return;
      }
    } catch {
      // Fallback
    }
    onLocationSelect(lat, lng);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const defaultLat = latitude || -6.200000;
    const defaultLng = longitude || 106.816666;

    const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 15);

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

    if (Number.isFinite(latitude) && Number.isFinite(longitude) && latitude !== 0 && longitude !== 0) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - latitude) > 0.00001 || Math.abs(currentPos.lng - longitude) > 0.00001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  // Address search
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

    onLocationSelect(latNum, lngNum, { fullAddress: result.display_name });
    setSearchResults([]);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
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
              placeholder="Cari lokasi base di peta (contoh: Kemang, Jakarta Selatan)..."
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none"
            />
          </div>
          <button
            type="button"
            disabled={isSearching}
            onClick={() => void handleSearch()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            {isSearching ? 'Mencari...' : 'Cari Peta'}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-[1000] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => selectSearchResult(item)}
                className="w-full border-b border-slate-100 p-3 text-left transition-colors hover:bg-slate-50"
              >
                <p className="text-xs font-bold text-red-600">{item.display_name.split(',')[0]}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{item.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Element */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-100 shadow-inner">
        <div ref={mapContainerRef} className="h-full w-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-xs text-white font-medium">
            Memuat Google Maps...
          </div>
        )}
      </div>
    </div>
  );
}

export default function BarberProfilePage() {
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [baseAddress, setBaseAddress] = useState('');
  const [baseLatitude, setBaseLatitude] = useState(0);
  const [baseLongitude, setBaseLongitude] = useState(0);

  useEffect(() => {
    BarberEndpoint.getMyProfile()
      .then((res: any) => {
        if (res) {
          setProfile(res);
          setName(res.name || '');
          setPhone(res.phone || '');
          setBio(res.bio || '');
          setExperienceYears(res.experienceYears || 0);
          setBaseAddress(res.baseAddress || '');
          setBaseLatitude(res.baseLatitude || 0);
          setBaseLongitude(res.baseLongitude || 0);
        }
      })
      .catch((err: any) => {
        setError(err?.message || 'Gagal memuat profil');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleMapLocationSelect = (
    lat: number,
    lng: number,
    details?: { fullAddress?: string }
  ) => {
    setBaseLatitude(Number(lat.toFixed(8)));
    setBaseLongitude(Number(lng.toFixed(8)));
    if (details?.fullAddress) {
      setBaseAddress(details.fullAddress);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser ini tidak mendukung lokasi perangkat');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(8));
        const lng = Number(position.coords.longitude.toFixed(8));
        setBaseLatitude(lat);
        setBaseLongitude(lng);
        setError('');
      },
      () => setError('Lokasi tidak bisa diakses. Izinkan lokasi atau pilih langsung di peta.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updated = await BarberEndpoint.updateMyProfile({
        name,
        phone,
        bio,
        experienceYears: Number(experienceYears),
        baseAddress,
        baseLatitude: Number(baseLatitude),
        baseLongitude: Number(baseLongitude),
      } as any);

      if (updated) {
        setProfile(updated as BarberProfile);
        setSuccess('Profil berhasil diperbarui!');
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-3 font-display">
          <UserRound size={24} className="text-red-600" />
          Profil Barber
        </h1>
        <p className="text-slate-600 mt-1 text-sm">
          Kelola informasi personal, bio, pengalaman, dan titik lokasi base keberangkatan Anda.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="relative mx-auto mb-4 size-24">
              <div className="grid size-24 place-items-center rounded-full border-2 border-red-200 bg-red-50 text-3xl font-bold text-red-600 uppercase">
                {profile?.name?.[0]?.toUpperCase() || 'B'}
              </div>
              <div
                className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border-2 border-white bg-emerald-600 text-white"
                title="Status Terverifikasi"
              >
                <ShieldCheck size={14} />
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{profile?.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile?.email}</p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                <Star size={13} className="fill-amber-500 text-amber-500" />
                {Number(profile?.ratingAverage ?? 0).toFixed(1)} Rating
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <Award size={13} />
                {profile?.totalCompleted ?? 0} Selesai
              </span>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-left space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Status Verifikasi</span>
                <span className="font-bold text-emerald-600 capitalize">
                  {profile?.verificationStatus}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Ketersediaan</span>
                <span className="font-bold text-blue-600 capitalize">
                  {profile?.availabilityStatus}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Radius Layanan</span>
                <span className="font-bold text-slate-900">
                  {profile?.serviceRadiusKm} km
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informasi Data Diri & Base Barber
            </h3>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <UserRound size={14} className="text-slate-400" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  Nomor Telepon / WA
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Bio & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-slate-400" />
                  Bio / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Barber profesional spesialis fade & haircut modern..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Award size={14} className="text-slate-400" />
                  Pengalaman (Tahun)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Interactive Map Location Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={14} className="text-red-600" />
                  Pilih Titik Lokasi Base (Google Maps)
                </label>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <LocateFixed size={14} />
                  Ambil Lokasi GPS
                </button>
              </div>

              <MapPicker
                latitude={baseLatitude}
                longitude={baseLongitude}
                onLocationSelect={handleMapLocationSelect}
              />
            </div>

            {/* Base Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                Alamat Lengkap Base Barber
              </label>
              <textarea
                rows={2}
                value={baseAddress}
                onChange={(e) => setBaseAddress(e.target.value)}
                placeholder="Jl. Raya Utama No. 12, Jakarta..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Latitude Base
                </label>
                <input
                  type="number"
                  step="any"
                  value={baseLatitude}
                  onChange={(e) => setBaseLatitude(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Longitude Base
                </label>
                <input
                  type="number"
                  step="any"
                  value={baseLongitude}
                  onChange={(e) => setBaseLongitude(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
