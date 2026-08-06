import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  QrCode,
  Scissors,
  ShieldAlert,
  Sparkles,
  Star,
  Upload,
  UserRound,
  DollarSign,
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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
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
    return <div className="py-16 text-center text-xs text-zinc-500">Memuat detail pesanan...</div>;
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <p className="text-red-400 text-sm mb-4">{error || 'Pesanan tidak ditemukan'}</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/customer/bookings')}>
          Kembali ke Daftar Pesanan
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/customer/bookings')}
          className="grid size-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-300">#{booking.bookingCode}</span>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] uppercase font-bold text-zinc-300">
              {booking.status}
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-zinc-100 mt-1">Detail Janji Cukur</h1>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Barber & Shop Info */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Penyedia Layanan</h2>
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-full border border-brand-500/30 bg-zinc-900 text-brand-300 font-bold text-lg">
                {booking.barberName?.[0] || 'B'}
              </div>
              <div>
                <p className="text-base font-bold text-zinc-100">{booking.barberName}</p>
                <p className="text-xs text-zinc-400">{booking.barbershopName || 'Barber Independent'}</p>
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-zinc-500">Layanan Grooming</p>
                <p className="font-semibold text-zinc-200 mt-0.5">{booking.serviceName}</p>
              </div>
              <div>
                <p className="text-zinc-500">Jadwal Janji</p>
                <p className="font-semibold text-zinc-200 mt-0.5">
                  {booking.startDatetime
                    ? new Date(booking.startDatetime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                    : '-'}
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-4 text-xs">
              <p className="text-zinc-500">Lokasi Tujuan Cukur</p>
              <div className="flex items-start gap-2 mt-1">
                <MapPin size={15} className="text-brand-400 shrink-0 mt-0.5" />
                <p className="text-zinc-200">{booking.address}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-400 hover:underline"
              >
                <Navigation size={13} /> Open google maps ({booking.distanceKm?.toFixed(1)} km)
              </a>
            </div>
          </div>

          {/* Rincian Biaya */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Rincian Pembayaran</h2>
            <div className="flex justify-between text-xs text-zinc-300 pt-2">
              <span>Layanan {booking.serviceName}</span>
              <span>Rp {(booking.serviceSubtotal ?? 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-300">
              <span>Biaya Perjalanan ({booking.distanceKm?.toFixed(1)} km)</span>
              <span>Rp {(booking.travelFee ?? 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm font-bold text-brand-300">
              <span>Total Tagihan</span>
              <span>Rp {(booking.totalPrice ?? 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Customer Rating & Review Box (If Completed) */}
          {booking.status?.toLowerCase() === 'completed' && (
            <div className="rounded-xl border border-brand-500/30 bg-gradient-to-b from-zinc-900 via-zinc-900/80 to-zinc-950 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h2 className="text-sm font-bold text-zinc-100">Ulasan & Rating Customer</h2>
              </div>

              {review ? (
                <div className="space-y-2 border-t border-zinc-800 pt-3 text-xs">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating! ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}
                      />
                    ))}
                    <span className="ml-2 font-bold text-zinc-200">{review.rating} / 5</span>
                  </div>
                  <p className="text-zinc-300 italic">"{review.review}"</p>
                  <p className="text-[10px] text-zinc-500">Dikirim pada {review.createdAt}</p>
                </div>
              ) : (
                <div className="space-y-4 border-t border-zinc-800 pt-3">
                  <p className="text-xs text-zinc-400">
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
                          className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Tulis ulasan pengalaman potong rambutmu di sini..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-brand-500 focus:outline-none"
                  />

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void handleReviewSubmit()}
                    disabled={submittingReview}
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
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Status Pembayaran</h2>

            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center gap-3">
              <CreditCard size={20} className="text-brand-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-200 capitalize">
                  {booking.paymentStatus === 'paid'
                    ? 'Lunas'
                    : booking.paymentStatus === 'waiting_verification'
                    ? 'Menunggu Verifikasi Admin'
                    : 'Belum Dibayar'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {payment ? `Metode: ${payment.paymentMethod?.toUpperCase()}` : 'Belum memilih metode'}
                </p>
              </div>
            </div>

            {/* If Payment exists & waiting verification */}
            {payment?.status === 'waiting_verification' && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 space-y-2">
                <p className="font-semibold">Bukti Transfer Berhasil Diunggah!</p>
                <p className="text-[11px] text-amber-200/80">Admin sedang memverifikasi bukti pembayaran kamu.</p>
                {payment.proof && (
                  <img src={payment.proof} alt="Bukti Transfer" className="mt-2 max-h-40 rounded border border-amber-500/40 object-cover" />
                )}
              </div>
            )}

            {/* If Payment is Paid */}
            {payment?.status === 'paid' && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Pembayaran Terverifikasi
                </p>
                <p className="text-[11px] text-emerald-200/80">Waktu Lunas: {payment.paidAt || '-'}</p>
              </div>
            )}

            {/* If Unpaid: Payment Form */}
            {(!payment || payment.status === 'pending' || payment.status === 'failed') && (
              <div className="space-y-4 border-t border-zinc-800 pt-4">
                <p className="text-xs font-semibold text-zinc-200">Pilih Metode Pembayaran:</p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`rounded-lg border p-3 text-center text-xs font-semibold transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                    }`}
                  >
                    Transfer Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`rounded-lg border p-3 text-center text-xs font-semibold transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                    }`}
                  >
                    Tunai (Cash)
                  </button>
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-brand-400">
                      <Building2 size={16} />
                      <span className="font-bold">Rekening Pembayaran:</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800 space-y-1">
                      <p className="text-[11px] text-zinc-400">Bank BCA</p>
                      <p className="font-mono text-sm font-bold text-zinc-100 tracking-wider">1234 5678 90</p>
                      <p className="text-[11px] text-zinc-400">a.n. PT Dicukur Digital Indonesia</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-medium text-zinc-300">Unggah Bukti Transfer:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-zinc-200 hover:file:bg-zinc-700"
                      />
                      {proofBase64 && (
                        <img
                          src={proofBase64}
                          alt="Preview Bukti"
                          className="mt-2 h-28 rounded border border-zinc-700 object-cover"
                        />
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
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
