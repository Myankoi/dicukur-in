import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, LockKeyhole, Mail, Phone, Save, UserRound } from 'lucide-react';
import { UserEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';

interface Profile {
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  notes?: string;
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    UserEndpoint.getMyProfile()
      .then((data) => {
        const next = (data ?? {}) as Profile;
        setProfile(next);
        setName(next.name ?? '');
        setEmail(next.email ?? '');
        setPhone(next.phone ?? '');
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Profil gagal dimuat'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await UserEndpoint.updateMyProfile({
        name,
        email,
        phone,
        photo: profile?.photo,
        notes: profile?.notes,
        password: password || undefined,
      });
      setProfile((updated ?? {}) as Profile);
      setPassword('');
      setSuccess('Profil berhasil diperbarui.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Profil gagal disimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white py-20 text-center text-sm text-slate-500">Memuat profil...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Akun saya</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900">Profil Customer</h1>
        <p className="mt-1 text-sm text-slate-600">Perbarui kontakmu agar barber lebih mudah menghubungi saat booking berlangsung.</p>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"><AlertCircle size={16} />{error}</div>}
      {success && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800"><CheckCircle2 size={16} />{success}</div>}

      <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><UserRound size={26} /></div>
          <div><h2 className="font-bold text-slate-900">Informasi pribadi</h2><p className="text-xs text-slate-500">Data ini hanya digunakan untuk kebutuhan layanan.</p></div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-1.5"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><UserRound size={14} />Nama lengkap</span><input required value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-600" /></label>
          <label className="space-y-1.5"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><Mail size={14} />Email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-600" /></label>
          <label className="space-y-1.5"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><Phone size={14} />Nomor telepon / WhatsApp</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="081234567890" className="h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-600" /></label>
          <label className="space-y-1.5"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><LockKeyhole size={14} />Password baru <span className="font-normal text-slate-400">(opsional)</span></span><input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className="h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-600" /></label>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><Button type="submit" disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700"><Save size={16} />{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button></div>
      </form>
    </div>
  );
}
