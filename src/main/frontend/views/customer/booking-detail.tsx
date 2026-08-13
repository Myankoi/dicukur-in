import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Navigation,
  Sparkles,
  Star,
  Building2,
} from 'lucide-react';
import { BookingEndpoint, PaymentEndpoint, ReviewEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type BookingResponse from '../../generated/com/dicukur/app/booking/dto/BookingResponse.js';
import type PaymentResponse from '../../generated/com/dicukur/app/payment/dto/PaymentResponse.js';
import type ReviewResponse from '../../generated/com/dicukur/app/review/dto/ReviewResponse.js';

export default function CustomerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Form state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer');
  const [proofBase64, setProofBase64] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Review Form state
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const bId = Number(id);
      const bData = await BookingEndpoint.getBookingById(bId);
      setBooking(bData ?? null);

      if (bData) {
        const [pData, rData] = await Promise.all([
          PaymentEndpoint.getPaymentByBooking(bId),
          ReviewEndpoint.getReviewByBooking(bId),
        ]);
        setPayment(pData ?? null);
        setReview(rData ?? null);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'documents');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errJson = await res.json();
        alert(errJson.error || 'Gagal mengunggah file');
        return;
      }
      const data = await res.json();
      setProofBase64(data.path);
    } catch {
      alert('Gagal mengunggah bukti transfer');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!booking) return;
    if (paymentMethod === 'transfer' && !proofBase64) {
      alert('Silakan unggah foto bukti transfer pembayaran terlebih dahulu.');
      return;
    }

    setSubmittingPayment(true);
    try {
      await PaymentEndpoint.submitPayment({
        bookingId: booking.id!,
        paymentMethod: paymentMethod,
        amount: booking.totalPrice!,
        proof: proofBase64,
        notes: paymentNotes,
      });
      alert('Pembayaran berhasil dikirim!');
      await loadData();
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Gagal memproses pembayaran');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!booking) return;
    setSubmittingReview(true);
    try {
      await ReviewEndpoint.submitReview({
        bookingId: booking.id!,
        rating: rating,
        review: reviewText,
      });
      alert('Terima kasih atas ulasan bintang dan umpan balik kamu!');
      await loadData();
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Gagal mengirim ulasan');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs font-medium text-slate-500 rounded-2xl border border-slate-200 bg-white max-w-4xl mx-auto">Memuat detail pesanan...</div>;
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600 text-sm font-bold mb-4">{error || 'Pesanan tidak ditemukan'}</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/customer/bookings')} className="bg-white border-slate-300">
          Kembali ke Daftar Pesanan
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/customer/bookings')}
            className="grid size-9 place-items-center rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-red-600">#{booking.bookingCode}</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] uppercase font-bold text-slate-700 border border-slate-200">
                {booking.status}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">Detail Janji Cukur</h1>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Barber & Shop Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">Penyedia Layanan</h2>
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-full border border-red-200 bg-red-50 text-red-600 font-bold text-lg">
                {booking.barberName?.[0] || 'B'}
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{booking.barberName}</p>
                <p className="text-xs text-slate-500">{booking.barbershopName || 'Barber Independent'}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Layanan Grooming</p>
                <p className="font-bold text-slate-900 mt-0.5">{booking.serviceName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Jadwal Janji</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {booking.startDatetime
                    ? new Date(booking.startDatetime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                    : '-'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs space-y-2">
              <p className="text-slate-500 font-medium">Lokasi Tujuan Cukur</p>
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-slate-900 font-medium">{booking.address}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
              >
                <Navigation size={13} /> Bukad Peta Google Maps ({booking.distanceKm?.toFixed(1)} km)
              </a>
            </div>
          </div>

          {/* Rincian Biaya */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">Rincian Pembayaran</h2>
            <div className="flex justify-between text-xs text-slate-600 pt-2">
              <span>Layanan {booking.serviceName}</span>
              <span className="font-semibold text-slate-900">Rp {(booking.serviceSubtotal ?? 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Biaya Perjalanan ({booking.distanceKm?.toFixed(1)} km)</span>
              <span className="font-semibold text-slate-900">Rp {(booking.travelFee ?? 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Tagihan</span>
              <span className="text-red-600">Rp {(booking.totalPrice ?? 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Customer Rating & Review Box (If Completed) */}
          {booking.status?.toLowerCase() === 'completed' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Ulasan & Rating Customer</h2>
              </div>

              {review ? (
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating! ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}
                      />
                    ))}
                    <span className="ml-2 font-bold text-slate-900">{review.rating} / 5</span>
                  </div>
                  <p className="text-slate-700 italic">"{review.review}"</p>
                  <p className="text-[10px] text-slate-400">Dikirim pada {review.createdAt}</p>
                </div>
              ) : (
                <div className="space-y-4 border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-600">
                    Bagaimana pengalaman kamu dicukur oleh <strong>{booking.barberName}</strong>? Berikan ulasanmu!
                  </p>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125"
                      >
                        <Star
                          size={24}
                          className={star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Tulis ulasan pengalaman potong rambutmu di sini..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none"
                  />

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void handleReviewSubmit()}
                    disabled={submittingReview}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Payment Action Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">Status Pembayaran</h2>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
              <CreditCard size={20} className="text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 capitalize">
                  {booking.paymentStatus === 'paid'
                    ? 'Lunas'
                    : booking.paymentStatus === 'waiting_verification'
                    ? 'Menunggu Verifikasi Admin'
                    : 'Belum Dibayar'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {payment ? `Metode: ${payment.paymentMethod?.toUpperCase()}` : 'Belum memilih metode'}
                </p>
              </div>
            </div>

            {/* If Payment exists & waiting verification */}
            {payment?.status === 'waiting_verification' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 space-y-2">
                <p className="font-bold">Bukti Transfer Berhasil Diunggah!</p>
                <p className="text-[11px] text-amber-700">Admin sedang memverifikasi bukti pembayaran kamu.</p>
                {payment.proof && (
                  <img src={payment.proof} alt="Bukti Transfer" className="mt-2 max-h-40 rounded-xl border border-amber-200 object-cover" />
                )}
              </div>
            )}

            {/* If Payment is Paid */}
            {payment?.status === 'paid' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" /> Pembayaran Terverifikasi
                </p>
                <p className="text-[11px] text-emerald-700">Waktu Lunas: {payment.paidAt || '-'}</p>
              </div>
            )}

            {/* If Unpaid: Payment Form */}
            {(!payment || payment.status === 'pending' || payment.status === 'failed') && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-700">Pilih Metode Pembayaran:</p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Transfer Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tunai (Cash)
                  </button>
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-red-600">
                      <Building2 size={16} />
                      <span className="font-bold">Rekening Pembayaran:</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <p className="text-[11px] text-slate-500 font-medium">Bank BCA</p>
                      <p className="font-mono text-sm font-bold text-slate-900 tracking-wider">1234 5678 90</p>
                      <p className="text-[11px] text-slate-500">a.n. PT Dicukur Digital Indonesia</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">Unggah Bukti Transfer:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                      />
                      {proofBase64 && (
                        <img
                          src={proofBase64}
                          alt="Preview Bukti"
                          className="mt-2 h-28 rounded-xl border border-slate-300 object-cover"
                        />
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                  onClick={() => void handlePaymentSubmit()}
                  disabled={submittingPayment}
                >
                  {submittingPayment ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
