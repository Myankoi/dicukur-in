import { useEffect, useState, useCallback } from 'react';
import { Check, CreditCard, ExternalLink, RefreshCw, X, ShieldAlert, Eye } from 'lucide-react';
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Verifikasi Pembayaran</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-zinc-100">
            Bukti Transfer Manual
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Periksa foto bukti transfer dari customer dan lakukan verifikasi persetujuan / penolakan.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => void loadPayments()} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Segarkan
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-500">Memuat data pembayaran...</div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-xs text-zinc-500">
          Belum ada data transaksi pembayaran.
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm transition-all hover:border-zinc-700"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-300">#{p.bookingCode}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        p.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : p.status === 'waiting_verification'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Customer: <strong>{p.customerName}</strong> ({p.customerPhone || '-'})
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Metode: <strong className="uppercase text-zinc-400">{p.paymentMethod}</strong> · Tagihan: Rp{' '}
                    {(p.amount ?? 0).toLocaleString('id-ID')} · Tanggal: {p.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {p.proof && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedProof(p.proof!)}
                      className="flex items-center gap-1.5 text-xs"
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
                        className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 text-xs"
                      >
                        <Check size={14} /> Setujui
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRejectingId(p.id!)}
                        disabled={actionLoading}
                        className="text-red-400 hover:bg-red-500/10 flex items-center gap-1 text-xs"
                      >
                        <X size={14} /> Tolak
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Rejection Reason Form Inline */}
              {rejectingId === p.id && (
                <div className="mt-4 border-t border-zinc-800 pt-3 space-y-2">
                  <p className="text-xs text-zinc-300 font-semibold">Alasan Penolakan Pembayaran:</p>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Bukti transfer tidak terbaca / nominal tidak sesuai"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => void handleVerify(p.id!, 'reject')}
                      disabled={actionLoading || !rejectNote.trim()}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs"
                    >
                      Konfirmasi Tolak
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setRejectingId(null)} className="text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-w-xl w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-bold text-zinc-200 uppercase">Foto Bukti Transfer</h3>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <img src={selectedProof} alt="Bukti Transfer Detail" className="w-full max-h-[70vh] rounded object-contain bg-zinc-950" />
            <div className="text-right">
              <Button variant="secondary" size="sm" onClick={() => setSelectedProof(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
