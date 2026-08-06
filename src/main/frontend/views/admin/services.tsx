import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scissors,
  Plus,
  Search,
  Edit2,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              <Sparkles size={13} />
              Manajemen Katalog Layanan
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Katalog Layanan Barber
            </h1>
            <p className="text-xs text-zinc-400 sm:text-sm">
              Kelola nama, harga standar, durasi, dan ketersediaan layanan yang dapat dipesan pelanggan.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-95"
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari nama atau deskripsi layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2.5 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          {(['ALL', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-zinc-800 text-amber-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
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
        <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="size-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            Memuat katalog layanan...
          </div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-center">
          <Scissors size={32} className="text-zinc-600 mb-2" />
          <p className="text-xs font-semibold text-zinc-300">Belum Ada Layanan</p>
          <p className="text-[11px] text-zinc-500 mt-1">Tidak ada layanan cukur yang cocok dengan filter kamu.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const isActive = service.status === 'active';
            return (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                  isActive
                    ? 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80 shadow-lg shadow-black/30'
                    : 'border-zinc-800/40 bg-zinc-950/40 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-10 place-items-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                        <Scissors size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-zinc-100">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                            <Clock size={12} className="text-amber-400/80" />
                            {service.duration} Menit
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(service)}
                      title={isActive ? 'Nonaktifkan layanan' : 'Aktifkan layanan'}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      {isActive ? (
                        <ToggleRight size={26} className="text-emerald-400" />
                      ) : (
                        <ToggleLeft size={26} className="text-zinc-600" />
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                    {service.description || 'Tidak ada deskripsi layanan.'}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-zinc-800/60 pt-4">
                  <div>
                    <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Harga standar</span>
                    <span className="font-display font-semibold text-base text-amber-400">
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
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
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
              onClick={() => setModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <h3 className="font-display text-lg font-semibold text-white">
                  {editingId ? 'Edit Layanan Barber' : 'Tambah Layanan Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Nama Layanan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Potong Cukur Regular"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    placeholder="Penjelasan singkat layanan..."
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Durasi (Menit)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      step={5}
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Status</label>
                  <select
                    value={form.status || 'active'}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-md transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
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
