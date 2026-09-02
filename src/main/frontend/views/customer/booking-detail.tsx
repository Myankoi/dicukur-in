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
  QrCode,
  UploadCloud,
} from 'lucide-react';
import { BookingEndpoint, PaymentEndpoint, ReviewEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type BookingResponse from '../../generated/com/dicukur/app/booking/dto/BookingResponse.js';
import type PaymentResponse from '../../generated/com/dicukur/app/payment/dto/PaymentResponse.js';
import type ReviewResponse from '../../generated/com/dicukur/app/review/dto/ReviewResponse.js';

import { LiveTrackingMap } from '../../components/LiveTrackingMap.js';
import { toast } from '../../components/ui/Toast.js';

export default function CustomerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Form state
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cash' | 'transfer'>('qris');
  const [proofBase64, setProofBase64] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Review Form state
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
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
    const interval = setInterval(() => {
      if (booking?.status === 'on_the_way' || booking?.status === 'accepted') {
        void loadData();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData, booking?.status]);

  useEffect(() => {
    if (document.getElementById('midtrans-snap-script')) return;
    const script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = (import.meta as any).env?.VITE_MIDTRANS_CLIENT_KEY;
    if (clientKey) script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPaymentError('Bukti pembayaran harus berupa gambar.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPaymentError('Ukuran bukti pembayaran maksimal 5 MB.');
      return;
    }
    setUploadingProof(true);
    setPaymentError('');
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
        setPaymentError(errJson.error || 'Gagal mengunggah file');
        return;
      }
      const data = await res.json();
      setProofBase64(data.path);
    } catch {
      setPaymentError('Gagal mengunggah bukti transfer');
    } finally {
      setUploadingProof(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!booking) return;
    setPaymentError('');
    if (paymentMethod === 'transfer' && !proofBase64) {
      setPaymentError('Unggah foto bukti transfer terlebih dahulu.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const result = await PaymentEndpoint.submitPayment({
        bookingId: booking.id!,
        paymentMethod: paymentMethod,
        amount: booking.totalPrice!,
        proof: proofBase64,
        notes: paymentNotes,
      });
      if (paymentMethod === 'qris') {
        const clientKey = (import.meta as any).env?.VITE_MIDTRANS_CLIENT_KEY;
        if (!clientKey) {
          throw new Error('Pembayaran online belum dikonfigurasi di aplikasi. Pilih Transfer Manual.');
        }
        const snap = (window as any).snap;
        if (!result?.snapToken || !snap?.pay) {
          throw new Error('Pembayaran online belum siap. Coba lagi atau pilih Transfer Manual.');
        }
        snap.pay(result.snapToken, {
          onSuccess: () => { toast.success('Pembayaran berhasil', 'Status akan diperbarui otomatis setelah gateway mengonfirmasi.'); void loadData(); },
          onPending: () => { toast.info('Pembayaran masih diproses', 'Selesaikan pembayaran di halaman Midtrans.'); void loadData(); },
          onError: () => toast.error('Pembayaran gagal', 'Coba lagi atau gunakan metode transfer manual.'),
          onClose: () => { void loadData(); },
        });
      } else {
        toast.success(paymentMethod === 'cash' ? 'Pembayaran dicatat' : 'Bukti pembayaran terkirim', paymentMethod === 'cash' ? 'Pembayaran tunai akan diproses bersama barber.' : 'Admin akan memverifikasi bukti transfer kamu.');
        setProofBase64('');
        setPaymentNotes('');
        await loadData();
      }
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : 'Gagal memproses pembayaran');
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
          {/* Live Tracking Map Component */}
          {(booking.status?.toLowerCase() === 'on_the_way' ||
            booking.status?.toLowerCase() === 'arrived' ||
            booking.status?.toLowerCase() === 'accepted') && (
            <LiveTrackingMap
              customerLat={booking.latitude || -6.200000}
              customerLng={booking.longitude || 106.816666}
              customerAddress={booking.address}
              barberLat={booking.barberLatitude}
              barberLng={booking.barberLongitude}
              barberName={booking.barberName || 'Barber'}
              barberPhone={booking.barberPhone}
              phoneLabel="Hubungi Barber"
              status={booking.status?.toLowerCase() || 'accepted'}
            />
          )}

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
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">Status Pembayaran</h2>
              <span className="text-xs font-bold text-slate-900">Rp {(booking.totalPrice ?? 0).toLocaleString('id-ID')}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
              <CreditCard size={20} className="text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 capitalize">
                  {(payment?.status || booking.paymentStatus) === 'paid'
                    ? 'Lunas'
                    : (payment?.status || booking.paymentStatus) === 'waiting_verification'
                      ? 'Menunggu Verifikasi'
                      : (payment?.status || booking.paymentStatus) === 'pending'
                        ? 'Menunggu Pembayaran'
                        : (payment?.status || booking.paymentStatus) === 'failed'
                          ? 'Pembayaran Ditolak / Gagal'
                          : 'Belum Dibayar'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {payment ? `Metode: ${payment.paymentMethod === 'qris' ? 'Midtrans / QRIS' : payment.paymentMethod === 'transfer' ? 'Transfer Manual' : 'Bayar di Lokasi'}` : 'Belum memilih metode'}
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

            {payment?.status === 'failed' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 space-y-1.5">
                <p className="font-bold">Pembayaran belum disetujui</p>
                <p className="text-[11px] text-red-700">{payment.notes || 'Silakan periksa kembali nominal dan unggah bukti yang lebih jelas.'}</p>
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

            {/* Payment Form */}
            {(!payment || payment.status === 'pending' || payment.status === 'failed') && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-700">Pilih cara pembayaran</p>
                  <p className="mt-1 text-[11px] text-slate-500">Selesaikan pembayaran sebelum barber datang agar pesanan berjalan lancar.</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`rounded-xl border p-3 text-left transition-all ${paymentMethod === 'qris' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    <QrCode size={18} className="mb-2" />
                    <span className="block text-xs font-bold">Online / QRIS</span>
                    <span className="mt-0.5 block text-[10px] font-medium text-slate-500">Bayar otomatis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold">Transfer Manual</span>
                    <span className="mt-0.5 block text-[10px] font-medium text-slate-500">Upload bukti transfer</span>
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
                    <span className="block text-xs font-bold">Bayar di Lokasi</span>
                    <span className="mt-0.5 block text-[10px] font-medium text-slate-500">Tunai ke barber</span>
                  </button>
                </div>

                {paymentMethod === 'qris' && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
                    <div className="flex items-start gap-2"><QrCode size={18} className="mt-0.5 shrink-0 text-blue-600" /><div><p className="font-bold">Pembayaran aman melalui Midtrans</p><p className="mt-1 text-[11px] leading-relaxed text-blue-700">Kamu akan diarahkan ke halaman pembayaran untuk memilih QRIS, transfer bank, e-wallet, atau kartu.</p></div></div>
                  </div>
                )}

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
                      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-center hover:border-red-400 hover:bg-red-50/40">
                        <UploadCloud size={20} className="text-red-600" />
                        <span className="mt-1 text-[11px] font-bold text-slate-700">Pilih foto bukti transfer</span>
                        <span className="text-[10px] text-slate-400">JPG/PNG, maksimal 5 MB</span>
                        <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="sr-only"
                        />
                      </label>
                      {uploadingProof && <p className="text-[11px] font-semibold text-blue-600">Mengunggah bukti...</p>}
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

                {paymentError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">{paymentError}</p>}

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                  onClick={() => void handlePaymentSubmit()}
                  disabled={submittingPayment || uploadingProof}
                >
                  {submittingPayment ? 'Memproses...' : paymentMethod === 'qris' ? 'Lanjut ke Pembayaran' : paymentMethod === 'transfer' ? 'Kirim Bukti Pembayaran' : 'Konfirmasi Bayar di Lokasi'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
