import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scissors,
  Plus,
  Search,
  Edit2,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { AdminServiceEndpoint } from '../../generated/endpoints.js';
import type ServiceOfferingResponse from '../../generated/com/dicukur/app/servicecatalog/dto/ServiceOfferingResponse.js';
import type ServiceOfferingRequest from '../../generated/com/dicukur/app/servicecatalog/dto/ServiceOfferingRequest.js';

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceOfferingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');

  // Modal State: Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceOfferingRequest>({
    name: '',
    description: '',
    price: 50000,
    duration: 30,
    status: 'active',
  });
  const [processing, setProcessing] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminServiceEndpoint.getAllServices();
      setServices((data || []).filter((s): s is ServiceOfferingResponse => s !== undefined));
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat katalog layanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      price: 50000,
      duration: 30,
      status: 'active',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceOfferingResponse) => {
    if (!service.id) return;
    setEditingId(service.id);
    setForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || 0,
      duration: service.duration || 30,
      status: service.status || 'active',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      if (editingId) {
        await AdminServiceEndpoint.updateService(editingId, form);
        setSuccessMsg(`Layanan "${form.name}" berhasil diperbarui!`);
      } else {
        await AdminServiceEndpoint.createService(form);
        setSuccessMsg(`Layanan baru "${form.name}" berhasil ditambahkan!`);
      }
      setModalOpen(false);
      await fetchServices();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan data layanan.');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (service: ServiceOfferingResponse) => {
    if (!service.id) return;
    try {
      await AdminServiceEndpoint.toggleStatus(service.id);
      const newSt = service.status === 'active' ? 'nonaktif' : 'aktif';
      setSuccessMsg(`Status layanan "${service.name}" diubah menjadi ${newSt}.`);
      await fetchServices();
    } catch (err: any) {
      setError(err?.message || 'Gagal mengubah status layanan.');
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (s.status || '').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Katalog Layanan Barber
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm">
              Kelola nama, harga standar, durasi, dan ketersediaan layanan yang dapat dipesan pelanggan.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 border border-red-600"
            onClick={handleOpenCreateModal}
          >
            <Plus size={16} />
            Tambah Layanan Baru
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau deskripsi layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(['ALL', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'Semua' : st === 'active' ? 'Aktif' : 'Nonaktif'}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <span className="size-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            Memuat katalog layanan...
          </div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Scissors size={32} className="text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-900">Belum Ada Layanan</p>
          <p className="text-[11px] text-slate-500 mt-1">Tidak ada layanan cukur yang cocok dengan filter kamu.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const isActive = service.status === 'active';
            const sName = (service.name || '').toLowerCase();
            let iconBg = 'bg-red-50 text-red-600 border-red-200';
            let IconComponent = Scissors;

            if (sName.includes('anak') || sName.includes('kid')) {
              iconBg = 'bg-amber-50 text-amber-600 border-amber-200';
            } else if (sName.includes('jenggot') || sName.includes('beard') || sName.includes('kumis')) {
              iconBg = 'bg-blue-50 text-blue-600 border-blue-200';
            } else if (sName.includes('paket') || sName.includes('combo') || sName.includes('vip')) {
              iconBg = 'bg-purple-50 text-purple-600 border-purple-200';
            } else if (sName.includes('color') || sName.includes('cat') || sName.includes('pewarnaan')) {
              iconBg = 'bg-indigo-50 text-indigo-600 border-indigo-200';
            } else if (sName.includes('wash') || sName.includes('cuci') || sName.includes('massage')) {
              iconBg = 'bg-cyan-50 text-cyan-600 border-cyan-200';
            } else if (sName.includes('facial') || sName.includes('treatment')) {
              iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-200';
            }

            return (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm ${
                  isActive
                    ? 'border-slate-200 bg-white hover:border-red-300'
                    : 'border-slate-200 bg-slate-50/70 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`grid size-10 place-items-center rounded-xl border ${iconBg}`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <Clock size={12} className="text-red-600" />
                            {service.duration} Menit
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(service)}
                      title={isActive ? 'Nonaktifkan layanan' : 'Aktifkan layanan'}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {isActive ? (
                        <ToggleRight size={26} className="text-emerald-600" />
                      ) : (
                        <ToggleLeft size={26} className="text-slate-400" />
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {service.description || 'Tidak ada deskripsi layanan.'}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Harga standar</span>
                    <span className="font-display font-bold text-base text-red-600">
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => handleOpenEditModal(service)}
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Form Create/Edit */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {editingId ? 'Edit Layanan Barber' : 'Tambah Layanan Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Layanan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Potong Cukur Regular"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    placeholder="Penjelasan singkat layanan..."
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Durasi (Menit)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      step={5}
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status || 'active'}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 disabled:opacity-50 border border-red-600"
                  >
                    {processing ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Layanan'}
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
