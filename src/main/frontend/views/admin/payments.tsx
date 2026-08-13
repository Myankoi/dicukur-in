import { useEffect, useState, useCallback } from 'react';
import { Check, RefreshCw, X, Eye } from 'lucide-react';
import { PaymentEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type PaymentResponse from '../../generated/com/dicukur/app/payment/dto/PaymentResponse.js';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await PaymentEndpoint.getAllPayments();
      setPayments((result ?? []).filter(Boolean) as PaymentResponse[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const handleVerify = async (paymentId: number, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      await PaymentEndpoint.verifyPayment(paymentId, action, action === 'reject' ? rejectNote : '');
      alert(`Pembayaran berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}!`);
      setRejectingId(null);
      setRejectNote('');
      await loadPayments();
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Gagal memproses verifikasi');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Bukti Transfer Manual
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Periksa foto bukti transfer dari customer dan lakukan verifikasi persetujuan / penolakan.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => void loadPayments()} disabled={loading} className="bg-white border-slate-300 text-slate-700">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Segarkan
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-medium text-slate-500 rounded-2xl border border-slate-200 bg-white">Memuat data pembayaran...</div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-medium text-slate-500 shadow-sm">
          Belum ada data transaksi pembayaran.
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-red-200"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-600">#{p.bookingCode}</span>
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        p.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'waiting_verification'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800">
                    Customer: <strong className="text-slate-900">{p.customerName}</strong> ({p.customerPhone || '-'})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Metode: <strong className="uppercase text-slate-700">{p.paymentMethod}</strong> · Tagihan: Rp{' '}
                    {(p.amount ?? 0).toLocaleString('id-ID')} · Tanggal: {p.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {p.proof && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedProof(p.proof!)}
                      className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      <Eye size={14} /> Lihat Bukti
                    </Button>
                  )}

                  {p.status === 'waiting_verification' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => void handleVerify(p.id!, 'approve')}
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 text-xs font-bold"
                      >
                        <Check size={14} /> Setujui
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRejectingId(p.id!)}
                        disabled={actionLoading}
                        className="text-red-600 hover:bg-red-50 flex items-center gap-1 text-xs font-bold"
                      >
                        <X size={14} /> Tolak
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Rejection Reason Form Inline */}
              {rejectingId === p.id && (
                <div className="mt-4 border-t border-slate-100 pt-3 space-y-2">
                  <p className="text-xs text-slate-800 font-bold">Alasan Penolakan Pembayaran:</p>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Bukti transfer tidak terbaca / nominal tidak sesuai"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => void handleVerify(p.id!, 'reject')}
                      disabled={actionLoading || !rejectNote.trim()}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                    >
                      Konfirmasi Tolak
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setRejectingId(null)} className="text-xs bg-slate-100 text-slate-700">
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Proof Image Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="relative max-w-xl w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Foto Bukti Transfer</h3>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <img src={selectedProof} alt="Bukti Transfer Detail" className="w-full max-h-[70vh] rounded-xl object-contain bg-slate-50 border border-slate-200" />
            <div className="text-right">
              <Button variant="secondary" size="sm" onClick={() => setSelectedProof(null)} className="bg-slate-100 text-slate-700">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
