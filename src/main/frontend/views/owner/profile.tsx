import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  FileText,
  Save,
  CheckCircle2,
  XCircle,
  X,
  Compass,
  Building,
} from 'lucide-react';
import { OwnerEndpoint } from '../../generated/endpoints.js';
import type BarbershopUpdateRequest from '../../generated/com/dicukur/app/barbershop/dto/BarbershopUpdateRequest.js';

export default function OwnerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      const data = await OwnerEndpoint.getMyBarbershop();
      if (data) {
        setForm({
          name: data.name || '',
          description: data.description || '',
          businessPhone: data.phone || '',
          businessEmail: '',
          businessLicenseNumber: '',
          businessAddress: data.address || '',
          district: data.district || '',
          city: data.city || '',
          province: data.province || '',
          postalCode: '',
          latitude: data.latitude || -6.2088,
          longitude: data.longitude || 106.8456,
          serviceRadiusKm: data.serviceRadiusKm || 10,
        });
      }
    } catch (err: any) {
      // jika belum diisi, kita biarkan form kosong
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl border border-brand-400/20 bg-brand-500/10 text-brand-300">
            <Store size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Profil & Detail Barbershop
            </h1>
            <p className="text-xs text-zinc-400 sm:text-sm">
              Lengkapi informasi usaha, alamat toko, koordinat lokasi, dan radius layanan booking.
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
            className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-300 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
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
            className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <XCircle size={16} />
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
        <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <span className="size-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Usaha */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Building size={16} className="text-brand-300" />
              Informasi Usaha & Kontak
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nama Barbershop *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Crown Barbershop"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nomor Telepon Bisnis</label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={form.businessPhone || ''}
                  onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Bisnis</label>
                <input
                  type="email"
                  placeholder="kontak@barbershop.com"
                  value={form.businessEmail || ''}
                  onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nomor Izin Usaha (NIB/SIUP)</label>
                <input
                  type="text"
                  placeholder="Opsional / nomor izin resmi"
                  value={form.businessLicenseNumber || ''}
                  onChange={(e) => setForm({ ...form, businessLicenseNumber: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Deskripsi Barbershop</label>
              <textarea
                rows={3}
                placeholder="Jelaskan keahlian, konsep toko, atau suasana layanan..."
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Alamat & Lokasi */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <MapPin size={16} className="text-amber-400" />
              Alamat Toko & Jangkauan Layanan
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Alamat Lengkap Toko *</label>
              <textarea
                rows={2}
                required
                placeholder="Jl. Merdeka No. 123..."
                value={form.businessAddress}
                onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Kecamatan</label>
                <input
                  type="text"
                  placeholder="Kec. Coblong"
                  value={form.district || ''}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Kota / Kabupaten *</label>
                <input
                  type="text"
                  required
                  placeholder="Bandung"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Provinsi</label>
                <input
                  type="text"
                  placeholder="Jawa Barat"
                  value={form.province || ''}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 border-t border-zinc-800/60 pt-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Latitude Koordinat *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="-6.2088"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs font-mono text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Longitude Koordinat *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="106.8456"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs font-mono text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Radius Layanan (KM) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  min={0.5}
                  max={100}
                  value={form.serviceRadiusKm}
                  onChange={(e) => setForm({ ...form, serviceRadiusKm: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-xs font-mono text-zinc-100 focus:border-brand-400/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-amber-500 px-6 py-3 text-xs font-semibold text-zinc-950 shadow-lg shadow-brand-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
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
