import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Scissors,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { OwnerEndpoint } from '../../generated/endpoints.js';
import type StaffResponse from '../../generated/com/dicukur/app/barbershop/dto/StaffResponse.js';
import type AddStaffRequest from '../../generated/com/dicukur/app/barbershop/dto/AddStaffRequest.js';

export default function OwnerStaffPage() {
  const [staffList, setStaffList] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State: Add Staff
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form, setForm] = useState<AddStaffRequest>({
    name: '',
    email: '',
    phone: '',
    password: '',
    position: 'Senior Barber',
  });
  const [processing, setProcessing] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OwnerEndpoint.getMyStaff();
      setStaffList(((data || []).filter(Boolean)) as StaffResponse[]);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat daftar staf barber.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenCreateModal = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      position: 'Senior Barber',
    });
    setCreateModalOpen(true);
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      await OwnerEndpoint.addStaff(form);
      setSuccessMsg(`Barber baru "${form.name}" berhasil ditambahkan sebagai karyawan!`);
      setCreateModalOpen(false);
      await fetchStaff();
    } catch (err: any) {
      setError(err?.message || 'Gagal mendaftarkan karyawan barber baru.');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (staff: StaffResponse) => {
    if (!staff.staffId) return;
    try {
      await OwnerEndpoint.toggleStaffStatus(staff.staffId);
      const newSt = staff.employmentStatus === 'active' ? 'nonaktif' : 'aktif';
      setSuccessMsg(`Status karyawan "${staff.name}" diubah menjadi ${newSt}.`);
      await fetchStaff();
    } catch (err: any) {
      setError(err?.message || 'Gagal mengubah status karyawan.');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    return (
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.position || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-blue-600/10 blur-[100px]" />
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Karyawan Barber
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm">
              Daftarkan akun barber karyawan baru untuk menerima pesanan booking atas nama toko Anda.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 border border-red-600"
            onClick={handleOpenCreateModal}
          >
            <Plus size={16} />
            Tambah Barber Baru
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama, email, atau posisi barber..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-red-600 focus:outline-none"
        />
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="size-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Users size={32} className="text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-800">Belum Ada Karyawan Barber</p>
          <p className="text-[11px] text-slate-500 mt-1">Klik tombol 'Tambah Barber Baru' untuk mendaftarkan akun staf Anda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((staf) => {
            const isActive = staf.employmentStatus === 'active';
            return (
              <motion.div
                key={staf.staffId}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                  isActive
                    ? 'border-slate-200 bg-white shadow-sm hover:shadow-md'
                    : 'border-slate-200 bg-slate-50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-2xl border border-red-200 bg-red-50 text-sm font-bold text-red-600 uppercase">
                        {staf.name?.[0] || 'B'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{staf.name}</h3>
                        <span className="inline-block text-[11px] font-bold text-blue-600">
                          {staf.position || 'Barber'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(staf)}
                      title={isActive ? 'Nonaktifkan barber' : 'Aktifkan barber'}
                    >
                      {isActive ? (
                        <ToggleRight size={26} className="text-emerald-600 hover:opacity-80" />
                      ) : (
                        <ToggleLeft size={26} className="text-slate-400 hover:opacity-80" />
                      )}
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span className="truncate">{staf.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{staf.phone || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                    {isActive ? 'Aktif Terima Booking' : 'Nonaktif'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Add Barber Staff */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setCreateModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Tambah Karyawan Barber Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama staf barber"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Untuk Login Barber) *</label>
                  <input
                    type="email"
                    required
                    placeholder="barber@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Awal *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min. 6 karakter"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Posisi / Jabatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Senior Barber / Junior Barber"
                    value={form.position || ''}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 disabled:opacity-50 border border-red-600"
                  >
                    {processing ? 'Mendaftarkan...' : 'Daftarkan Barber'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
