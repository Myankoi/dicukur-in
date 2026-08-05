import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Search,
  Filter,
  Eye,
  X,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { AdminRegistrationEndpoint } from '../../generated/endpoints.js';
import type RegistrationResponse from '../../generated/com/dicukur/app/registration/dto/RegistrationResponse.js';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'submitted' | 'approved' | 'rejected'>('ALL');

  // Modal State for Details & Actions
  const [selectedReg, setSelectedReg] = useState<RegistrationResponse | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminRegistrationEndpoint.getAllRegistrations();
      setRegistrations((data || []).filter((r): r is RegistrationResponse => r !== undefined));
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleApprove = async () => {
    if (!selectedReg || selectedReg.id === undefined) return;
    setProcessing(true);
    setError(null);
    try {
      await AdminRegistrationEndpoint.approveRegistration(selectedReg.id, adminNotes);
      setSuccessMsg(`Pendaftaran "${selectedReg.businessName || selectedReg.applicantName}" berhasil DI-ACC! Barbershop telah diaktifkan.`);
      setApproveModalOpen(false);
      setSelectedReg(null);
      setAdminNotes('');
      await fetchRegistrations();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyetujui pendaftaran.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReg || selectedReg.id === undefined) return;
    if (!rejectionReason.trim()) {
      setError('Harap masukkan alasan penolakan agar barbershop mengetahui alasannya.');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      await AdminRegistrationEndpoint.rejectRegistration(selectedReg.id, rejectionReason);
      setSuccessMsg(`Pendaftaran "${selectedReg.businessName || selectedReg.applicantName}" berhasil DITOLAK.`);
      setRejectModalOpen(false);
      setSelectedReg(null);
      setRejectionReason('');
      await fetchRegistrations();
    } catch (err: any) {
      setError(err?.message || 'Gagal menolak pendaftaran.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      (reg.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.applicantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.applicantEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 size={13} />
            Disetujui (Mitra Aktif)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
            <XCircle size={13} />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 animate-pulse">
            <Clock size={13} />
            Menunggu Approval Admin
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-display">
            Pendaftaran & Approval Mitra Barbershop
          </h1>
          <p className="text-sm text-zinc-400">
            Verifikasi kelayakan usaha, perizinan, dan dokumen bukti dari Owner Barbershop untuk diterima sebagai mitra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRegistrations}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-brand-400/40 hover:bg-zinc-800 hover:text-brand-300 transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari nama usaha, owner, email, atau kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-zinc-500" />
          <span className="text-xs text-zinc-400">Status:</span>
          <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
            {(
              [
                { id: 'ALL', label: 'Semua' },
                { id: 'submitted', label: 'Perlu Review' },
                { id: 'approved', label: 'Disetujui' },
                { id: 'rejected', label: 'Ditolak' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations List Grid / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 space-y-3">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm">Memuat daftar pendaftaran mitra...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-16 text-center text-zinc-500">
          <Building2 size={40} className="mx-auto mb-3 text-zinc-600" />
          <p className="text-base font-semibold text-zinc-300">Tidak Ada Pendaftaran Ditemukan</p>
          <p className="text-xs text-zinc-500">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Coba sesuaikan kata kunci pencarian atau filter status.'
              : 'Belum ada pengajuan pendaftaran usaha dari Owner Barbershop.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRegistrations.map((reg) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md transition-all hover:border-zinc-700/80"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-base flex items-center gap-2">
                      <Building2 size={16} className="text-brand-400" />
                      {reg.businessName || 'Nama Usaha Belum Diisi'}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Tipe: <span className="text-zinc-200 capitalize font-medium">{reg.registrationType}</span>
                    </p>
                  </div>
                  {getStatusBadge(reg.status)}
                </div>

                {/* Owner & Contact Info */}
                <div className="space-y-1.5 py-3 border-y border-zinc-800/60 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-zinc-500 shrink-0" />
                    <span>
                      Pemilik: <strong className="text-zinc-100">{reg.applicantName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-zinc-500 shrink-0" />
                    <span className="truncate">{reg.applicantEmail}</span>
                  </div>
                  {reg.applicantPhone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-zinc-500 shrink-0" />
                      <span>{reg.applicantPhone}</span>
                    </div>
                  )}
                  {reg.city && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-zinc-500 shrink-0" />
                      <span className="truncate">
                        {reg.city}, {reg.province || ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* License Info */}
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-amber-400" />
                    No. Izin Usaha / NIB:
                  </p>
                  <p className="text-xs font-mono bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 text-amber-200">
                    {reg.businessLicenseNumber || 'Tidak melampirkan nomor izin'}
                  </p>
                </div>

                {reg.rejectionReason && reg.status === 'rejected' && (
                  <div className="mt-3 p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs text-rose-300">
                    <p className="font-semibold text-rose-400 mb-1">Alasan Penolakan:</p>
                    <p>{reg.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setSelectedReg(reg)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
                >
                  <Eye size={14} />
                  Detail / Berkas
                </button>

                {reg.status === 'submitted' || reg.status === 'under_review' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReg(reg);
                        setApproveModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition"
                    >
                      <CheckCircle2 size={14} />
                      ACC Mitra
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReg(reg);
                        setRejectionReason('');
                        setRejectModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600/20 border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-600 hover:text-white transition"
                    >
                      <XCircle size={14} />
                      Tolak
                    </button>
                  </>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedReg && !approveModalOpen && !rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl border border-brand-400/30 bg-brand-500/10 text-brand-300">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-100">{selectedReg.businessName || 'Detail Usaha'}</h2>
                    <p className="text-xs text-zinc-400">Pengajuan Pendaftaran Barber / Barbershop</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                {/* Status Header */}
                <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-3.5 border border-zinc-800">
                  <span className="text-xs text-zinc-400">Status Pendaftaran saat ini:</span>
                  {getStatusBadge(selectedReg.status)}
                </div>

                {/* Section Pemilik */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
                  <h4 className="font-semibold text-xs text-brand-300 uppercase tracking-wider">Informasi Pemilik (Owner)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500">Nama Pemilik:</span>{' '}
                      <strong className="text-zinc-200">{selectedReg.applicantName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Email:</span>{' '}
                      <span className="text-zinc-200">{selectedReg.applicantEmail}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">No. HP:</span>{' '}
                      <span className="text-zinc-200">{selectedReg.applicantPhone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Tanggal Pengajuan:</span>{' '}
                      <span className="text-zinc-200">{selectedReg.submittedAt || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Section Usaha */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
                  <h4 className="font-semibold text-xs text-brand-300 uppercase tracking-wider">Detail Barbershop & Perizinan</h4>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-zinc-500">Nama Usaha:</span>{' '}
                      <strong className="text-zinc-100">{selectedReg.businessName || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Nomor Izin Usaha / NIB:</span>{' '}
                      <span className="font-mono text-amber-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {selectedReg.businessLicenseNumber || 'Tidak dicantumkan'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Alamat Lengkap:</span>{' '}
                      <span className="text-zinc-200">
                        {selectedReg.address || '-'}, {selectedReg.district || ''}, {selectedReg.city || ''},{' '}
                        {selectedReg.province || ''} {selectedReg.postalCode || ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Radius Layanan Maksimal:</span>{' '}
                      <span className="text-zinc-200">{selectedReg.serviceRadiusKm} KM</span>
                    </div>
                    {selectedReg.description && (
                      <div>
                        <span className="text-zinc-500">Deskripsi Usaha:</span>
                        <p className="mt-1 p-2 bg-zinc-900 rounded text-zinc-300 text-xs italic">
                          "{selectedReg.description}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Dokumen Bukti */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
                  <h4 className="font-semibold text-xs text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={15} />
                    Dokumen Bukti / File Izin Usaha
                  </h4>
                  {selectedReg.documents && selectedReg.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedReg.documents
                        .filter((doc): doc is NonNullable<typeof doc> => doc !== undefined && doc !== null)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <FileCheck size={16} className="text-emerald-400" />
                              <div>
                                <p className="font-medium text-zinc-200">{doc.fileName}</p>
                                <p className="text-[10px] text-zinc-500 capitalize">{doc.documentType}</p>
                              </div>
                            </div>
                            {doc.filePath && (
                              <a
                                href={doc.filePath}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-300 hover:underline text-xs"
                              >
                                Lihat File
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      Nomor izin tercantum pada form di atas ({selectedReg.businessLicenseNumber || 'NIB'}). Tidak ada dokumen tambahan yang diunggah.
                    </p>
                  )}
                </div>

                {selectedReg.rejectionReason && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                    <p className="font-semibold text-rose-400 mb-1">Catatan Penolakan Admin Sebelumnya:</p>
                    <p>{selectedReg.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons in Modal */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Tutup
                </button>

                {selectedReg.status === 'submitted' || selectedReg.status === 'under_review' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setRejectModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/20 border border-rose-500/30 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-600 hover:text-white transition"
                    >
                      <XCircle size={15} />
                      Tolak Pendaftaran
                    </button>
                    <button
                      type="button"
                      onClick={() => setApproveModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition"
                    >
                      <CheckCircle2 size={15} />
                      ACC & Terima Mitra
                    </button>
                  </>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACC / APPROVE MODAL */}
      <AnimatePresence>
        {approveModalOpen && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-zinc-900 p-6 shadow-2xl text-zinc-100"
            >
              <div className="flex items-center gap-3 text-emerald-400 mb-3">
                <CheckCircle2 size={24} />
                <h3 className="text-lg font-bold text-zinc-100">Setujui & Terbitkan Lisensi Mitra</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Anda akan menyetujui <strong className="text-zinc-200">{selectedReg.businessName || selectedReg.applicantName}</strong> sebagai mitra aktif. Akun owner akan diaktifkan dan profil Barbershop akan dipublikasikan.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-300 mb-1">Catatan Tambahan Admin (Opsional):</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Misal: Dokumen NIB tervalidasi, radius operasional disetujui..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  disabled={processing}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {processing ? 'Memproses...' : 'Ya, ACC Pendaftaran Ini'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECT MODAL */}
      <AnimatePresence>
        {rejectModalOpen && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-zinc-900 p-6 shadow-2xl text-zinc-100"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <XCircle size={24} />
                <h3 className="text-lg font-bold text-zinc-100">Tolak Pendaftaran Mitra</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Berikan alasan penolakan untuk <strong className="text-zinc-200">{selectedReg.businessName || selectedReg.applicantName}</strong> agar pihak barbershop paham penyebab pengajuannya ditolak.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-rose-300 mb-1">Alasan Penolakan (Wajib Diisi):</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Misal: Nomor Izin Usaha / NIB tidak terdaftar pada database perizinan, alamat lokasi kurang jelas..."
                  className="w-full rounded-lg border border-rose-500/30 bg-zinc-950 p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={processing}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={processing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-md shadow-rose-600/20 transition disabled:opacity-50"
                >
                  {processing ? 'Memproses...' : 'Kirim Penolakan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
