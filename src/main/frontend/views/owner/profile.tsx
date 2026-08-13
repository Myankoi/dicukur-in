import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  MapPin,
  Save,
  CheckCircle2,
  XCircle,
  X,
  Building,
  Search,
  LocateFixed,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { OwnerEndpoint } from '../../generated/endpoints.js';
import type BarbershopUpdateRequest from '../../generated/com/dicukur/app/barbershop/dto/BarbershopUpdateRequest.js';

interface PhotoItem {
  id: number;
  filePath: string;
  caption?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    city_district?: string;
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
    details?: { fullAddress?: string; city?: string; province?: string }
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

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.city_district || addr.county || '';
        const province = addr.state || '';
        onLocationSelect(lat, lng, { fullAddress: data.display_name, city, province });
        return;
      }
    } catch {
      // Fallback
    }
    onLocationSelect(lat, lng);
  };

  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const defaultLat = latitude || -6.2088;
    const defaultLng = longitude || 106.8456;

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

    onLocationSelect(latNum, lngNum, { fullAddress: result.display_name, city, province });
    setSearchResults([]);
  };

  return (
    <div className="space-y-3">
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
              placeholder="Cari lokasi barbershop di Google Maps (contoh: Jalan Riau, Bandung)..."
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

export default function OwnerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const [form, setForm] = useState<BarbershopUpdateRequest>({
    name: '',
    description: '',
    businessPhone: '',
    businessEmail: '',
    businessLicenseNumber: '',
    businessAddress: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    latitude: -6.2088,
    longitude: 106.8456,
    serviceRadiusKm: 10,
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await OwnerEndpoint.getMyBarbershop();
      if (data) {
        setForm({
          name: data.name || '',
          description: data.description || '',
          businessPhone: data.phone || data.businessPhone || '',
          businessEmail: data.email || data.businessEmail || '',
          businessLicenseNumber: data.businessLicenseNumber || '',
          businessAddress: data.address || data.businessAddress || '',
          district: data.district || '',
          city: data.city || '',
          province: data.province || '',
          postalCode: data.postalCode || '',
          latitude: Number(data.latitude || -6.2088),
          longitude: Number(data.longitude || 106.8456),
          serviceRadiusKm: Number(data.serviceRadiusKm || 10),
        });
        if (data.photos) {
          setPhotos(data.photos);
        }
      }
    } catch {
      // Form default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleMapLocationSelect = (
    lat: number,
    lng: number,
    details?: { fullAddress?: string; city?: string; province?: string }
  ) => {
    setForm((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(8)),
      longitude: Number(lng.toFixed(8)),
      businessAddress: details?.fullAddress || prev.businessAddress,
      city: details?.city || prev.city,
      province: details?.province || prev.province,
    }));
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
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        setError(null);
      },
      () => setError('Lokasi tidak bisa diakses. Izinkan lokasi atau pilih langsung di peta.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'photos');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        throw new Error('Gagal mengunggah foto ke server.');
      }
      const data = await res.json();
      const photoPath = data.path || data.url;
      await OwnerEndpoint.addPhoto(photoPath, file.name);
      await fetchProfile();
      setSuccessMsg('Foto galeri berhasil ditambahkan!');
    } catch (err: any) {
      setError(err?.message || 'Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm('Hapus foto galeri ini?')) return;
    try {
      await OwnerEndpoint.deletePhoto(photoId);
      await fetchProfile();
      setSuccessMsg('Foto berhasil dihapus.');
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus foto.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await OwnerEndpoint.updateMyBarbershop(form);
      setSuccessMsg('Profil Barbershop berhasil diperbarui!');
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui profil barbershop.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold">
            <Store size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Profil & Detail Barbershop
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm mt-0.5">
              Lengkapi informasi usaha, alamat toko, koordinat lokasi, dan galeri foto toko Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button type="button" onClick={() => setSuccessMsg(null)}>
              <X size={15} />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700"
          >
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-red-600" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError(null)}>
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Form */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="size-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Usaha */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building size={16} className="text-red-600" />
              Informasi Usaha & Kontak
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Barbershop *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Crown Barbershop"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon Bisnis</label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={form.businessPhone || ''}
                  onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Bisnis</label>
                <input
                  type="email"
                  placeholder="kontak@barbershop.com"
                  value={form.businessEmail || ''}
                  onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Izin Usaha (NIB/SIUP)</label>
                <input
                  type="text"
                  placeholder="Opsional / nomor izin resmi"
                  value={form.businessLicenseNumber || ''}
                  onChange={(e) => setForm({ ...form, businessLicenseNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Barbershop</label>
              <textarea
                rows={3}
                placeholder="Jelaskan keahlian, konsep toko, atau suasana layanan..."
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Alamat & Lokasi Google Maps */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin size={16} className="text-blue-600" />
              Alamat Toko & Titik Peta Google Maps
            </h3>

            {/* Interactive Map Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin size={14} className="text-red-600" />
                  Titik Lokasi Google Maps
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
                latitude={form.latitude}
                longitude={form.longitude}
                onLocationSelect={handleMapLocationSelect}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap Toko *</label>
              <textarea
                rows={2}
                required
                placeholder="Jl. Merdeka No. 123..."
                value={form.businessAddress}
                onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  placeholder="Kec. Coblong"
                  value={form.district || ''}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten *</label>
                <input
                  type="text"
                  required
                  placeholder="Bandung"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Provinsi</label>
                <input
                  type="text"
                  placeholder="Jawa Barat"
                  value={form.province || ''}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Latitude Koordinat *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="-6.2088"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Longitude Koordinat *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="106.8456"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Radius Layanan (KM) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  min={0.5}
                  max={100}
                  value={form.serviceRadiusKm}
                  onChange={(e) => setForm({ ...form, serviceRadiusKm: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Galeri Foto Barbershop */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Store size={16} className="text-red-600" />
              Galeri Foto Barbershop & Portofolio Usaha
            </h3>

            {/* Display Photos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 h-28">
                    <img src={photo.filePath} alt="Galeri" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                      title="Hapus foto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Unggah Foto Baru:</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="owner-photo-input"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileUpload(file);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => document.getElementById('owner-photo-input')?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  <UploadCloud size={16} className="text-red-600" />
                  {uploading ? 'Mengunggah...' : 'Pilih Foto dari Perangkat'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50 border border-red-600"
            >
              <Save size={16} />
              {saving ? 'Menyimpan Profil...' : 'Simpan Profil Usaha'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
