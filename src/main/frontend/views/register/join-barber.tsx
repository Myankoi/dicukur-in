import { useState } from 'react';
import { CheckCircle2, Scissors, ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { RegisterEndpoint } from '../../generated/endpoints.js';
import { AuthShell } from '../../components/AuthShell.js';
import { Button } from '../../components/ui/Button.js';

export default function JoinBarberPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) { setError('Link undangan tidak valid.'); return; }
    setLoading(true); setError('');
    try {
      await RegisterEndpoint.acceptBarberInvitation({ token, ...form });
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Undangan gagal diterima');
    } finally { setLoading(false); }
  };

  if (done) return <AuthShell wide><div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl"><CheckCircle2 className="mx-auto text-emerald-600" size={48} /><h1 className="mt-5 font-display text-3xl font-bold text-slate-900">Akun barber dibuat</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">Masuk menggunakan akunmu, lalu unggah KTP dan sertifikat kompetensi atau portofolio dari halaman profil. Admin akan memverifikasi dokumen sebelum kamu menerima booking.</p><Button className="mt-7 w-full" onClick={() => navigate('/login', { replace: true })}>Ke halaman masuk <ArrowRight size={16} /></Button></div></AuthShell>;

  return <AuthShell wide><form onSubmit={submit} className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Scissors size={22} /></span><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Undangan barber</p><h1 className="font-display text-2xl font-bold text-slate-900">Bergabung ke barbershop</h1></div></div><p className="mt-4 text-xs leading-5 text-slate-600">Lengkapi akunmu. Setelah masuk, dokumen identitas dan kompetensi wajib diunggah untuk proses verifikasi admin.</p>{error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}<div className="mt-6 space-y-4">{([['name','Nama lengkap','text','Nama sesuai identitas'],['email','Email undangan','email','email@contoh.com'],['phone','Nomor WhatsApp','tel','08xxxxxxxxxx'],['password','Password','password','Minimal 8 karakter']] as const).map(([key,label,type,placeholder]) => <label key={key} className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">{label}</span><input required minLength={key === 'password' ? 8 : undefined} type={type} placeholder={placeholder} value={form[key]} onChange={(event) => update(key, event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 outline-none focus:border-emerald-600" /></label>)}</div><Button type="submit" disabled={loading} className="mt-7 w-full bg-emerald-600 hover:bg-emerald-700">{loading ? 'Memproses...' : 'Terima Undangan'} <ArrowRight size={16} /></Button></form></AuthShell>;
}
