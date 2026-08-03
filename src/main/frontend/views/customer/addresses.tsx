import { useEffect, useState, type FormEvent } from 'react';
import { LocateFixed, MapPin, Plus, Star, Trash2 } from 'lucide-react';
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

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser ini tidak mendukung lokasi perangkat');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateForm('latitude', position.coords.latitude.toFixed(8));
        updateForm('longitude', position.coords.longitude.toFixed(8));
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Lokasi layanan</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-zinc-950">Alamat saya</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">Barber datang ke alamat yang kamu pilih. Koordinat dipakai untuk menghitung jarak dan biaya perjalanan.</p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <Plus size={17} />
          Tambah alamat
        </Button>
      </div>

      {error && <p className="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {showForm && (
        <form onSubmit={saveAddress} className="space-y-5 border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-zinc-950">Alamat baru</h2>
              <p className="mt-1 text-xs text-zinc-500">Pakai titik lokasi aktual agar pencarian barber akurat.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={useCurrentLocation}>
              <LocateFixed size={15} />
              Ambil lokasi
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField label="Label" name="label" value={form.label} onChange={(event) => updateForm('label', event.target.value)} placeholder="Rumah / Kantor" />
            <InputField label="Nama penerima" name="recipientName" value={form.recipientName} onChange={(event) => updateForm('recipientName', event.target.value)} placeholder="Nama yang ditemui barber" />
          </div>
          <InputField label="Nomor telepon" name="phone" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} placeholder="08xxxxxxxxxx" />
          <TextareaField label="Alamat lengkap" name="fullAddress" value={form.fullAddress} onChange={(event) => updateForm('fullAddress', event.target.value)} placeholder="Jalan, nomor rumah, patokan" required />
          <div className="grid gap-5 sm:grid-cols-3">
            <InputField label="Kota" name="city" value={form.city} onChange={(event) => updateForm('city', event.target.value)} placeholder="Jakarta" />
            <InputField label="Provinsi" name="province" value={form.province} onChange={(event) => updateForm('province', event.target.value)} placeholder="DKI Jakarta" />
            <InputField label="Kode pos" name="postalCode" value={form.postalCode} onChange={(event) => updateForm('postalCode', event.target.value)} placeholder="10110" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField label="Latitude" name="latitude" value={form.latitude} onChange={(event) => updateForm('latitude', event.target.value)} placeholder="-6.20000000" inputMode="decimal" required />
            <InputField label="Longitude" name="longitude" value={form.longitude} onChange={(event) => updateForm('longitude', event.target.value)} placeholder="106.81666667" inputMode="decimal" required />
          </div>
          <TextareaField label="Catatan untuk barber" name="notes" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="Contoh: masuk lewat gerbang samping" />
          <label className="flex items-center gap-3 text-sm text-zinc-700">
            <input type="checkbox" checked={form.isDefault} onChange={(event) => updateForm('isDefault', event.target.checked)} className="size-4 accent-brand-500" />
            Jadikan alamat utama
          </label>
          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan alamat'}</Button>
          </div>
        </form>
      )}

      {loading ? <p className="text-sm text-zinc-500">Memuat alamat...</p> : addresses.length === 0 ? (
        <div className="border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
          <MapPin className="mx-auto text-brand-500" size={26} />
          <h2 className="mt-4 font-display text-2xl font-semibold text-zinc-950">Belum ada alamat</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">Tambahkan alamat pertama untuk mulai mencari barbershop yang melayani area kamu.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center bg-brand-100 text-brand-700"><MapPin size={17} /></span>
                  <div>
                    <h2 className="font-semibold text-zinc-950">{address.label || 'Alamat'}</h2>
                    {address.isDefault && <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700"><Star size={11} fill="currentColor" /> Utama</p>}
                  </div>
                </div>
                <button type="button" onClick={() => void removeAddress(address.id)} className="text-zinc-400 transition-colors hover:text-red-600" aria-label={`Hapus ${address.label || 'alamat'}`}><Trash2 size={17} /></button>
              </div>
              <p className="mt-5 text-sm leading-6 text-zinc-700">{address.fullAddress}</p>
              <p className="mt-2 text-xs text-zinc-500">{[address.city, address.province, address.postalCode].filter(Boolean).join(', ')}</p>
              {!address.isDefault && <button type="button" onClick={() => void makeDefault(address.id)} className="mt-5 text-xs font-semibold text-brand-700 hover:text-brand-500">Jadikan alamat utama</button>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
