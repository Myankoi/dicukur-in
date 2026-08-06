import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  UserRound,
  Mail,
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
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative mb-6">
        <div
          className="absolute -top-2 left-0 w-16 h-1 rounded-full"
          style={{ background: 'linear-gradient(90deg, #dc2626, #f8fafc, #2563eb)' }}
        />
        <h1 className="text-2xl font-bold text-zinc-100 mt-4 flex items-center gap-3">
          <UserRound size={24} className="text-barber-blue" />
          Profil Barber
        </h1>
        <p className="text-zinc-400 mt-1">
          Kelola informasi personal, bio, pengalaman, dan alamat base lokasi Anda.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary Card */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 text-center shadow-xl"
          >
            <div className="relative mx-auto mb-4 size-24">
              <div className="grid size-24 place-items-center rounded-full border-2 border-barber-blue/40 bg-zinc-800 text-3xl font-bold text-barber-blue-light">
                {profile?.name?.[0]?.toUpperCase() || 'B'}
              </div>
              <div
                className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border-2 border-zinc-900 bg-green-500 text-white"
                title="Status Terverifikasi"
              >
                <ShieldCheck size={14} />
              </div>
            </div>

            <h2 className="text-lg font-bold text-zinc-100">{profile?.name}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{profile?.email}</p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {Number(profile?.ratingAverage ?? 0).toFixed(1)} Rating
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                <Award size={13} />
                {profile?.totalCompleted ?? 0} Selesai
              </span>
            </div>

            <div className="mt-6 border-t border-zinc-800/60 pt-4 text-left space-y-3 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Status Verifikasi</span>
                <span className="font-semibold text-green-400 capitalize">
                  {profile?.verificationStatus}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Ketersediaan</span>
                <span className="font-semibold text-blue-400 capitalize">
                  {profile?.availabilityStatus}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Radius Layanan</span>
                <span className="font-semibold text-zinc-200">
                  {profile?.serviceRadiusKm} km
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-2">
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSave}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl space-y-5"
          >
            <h3 className="text-base font-bold text-zinc-100 border-b border-zinc-800/60 pb-3">
              Informasi Data Diri & Base Barber
            </h3>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <UserRound size={14} className="text-zinc-500" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-zinc-500" />
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bio & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-zinc-500" />
                  Bio / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Barber profesional spesialis fade & haircut modern..."
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Award size={14} className="text-zinc-500" />
                  Pengalaman (Tahun)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Base Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-zinc-500" />
                Alamat Base Barber
              </label>
              <textarea
                rows={2}
                value={baseAddress}
                onChange={(e) => setBaseAddress(e.target.value)}
                placeholder="Jl. Raya Utama No. 12, Jakarta..."
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Latitude Base
                </label>
                <input
                  type="number"
                  step="any"
                  value={baseLatitude}
                  onChange={(e) => setBaseLatitude(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Longitude Base
                </label>
                <input
                  type="number"
                  step="any"
                  value={baseLongitude}
                  onChange={(e) => setBaseLongitude(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-barber-blue to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Simpan Perubahan
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
