import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, Scissors, Star, UserRound } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { BarbershopEndpoint, BookingEndpoint, CustomerAddressEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import { InputField, TextareaField } from '../../components/ui/Field.js';

interface Address { id: number; label?: string; fullAddress: string; isDefault: boolean; }
interface Staff { id: number; name: string; position?: string; ratingAverage: number; totalCompleted: number; availabilityStatus: string; }
interface Service { id: number; name: string; description?: string; price: number; duration: number; }
interface Shop { id: number; name: string; description?: string; address: string; city?: string; province?: string; phone?: string; ratingAverage: number; totalCompleted: number; staff: Staff[]; services: Service[]; }

export default function BarbershopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [barberId, setBarberId] = useState<number>();
  const [serviceId, setServiceId] = useState<number>();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [addressId, setAddressId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([BarbershopEndpoint.getDetail(Number(id)), CustomerAddressEndpoint.getMyAddresses()])
      .then(([shopResult, addressResult]) => {
        const nextShop = shopResult as Shop;
        const nextAddresses = (addressResult ?? []).filter(Boolean) as Address[];
        setShop(nextShop);
        setAddresses(nextAddresses);
        setBarberId(nextShop.staff[0]?.id);
        setServiceId(nextShop.services[0]?.id);
        setAddressId(nextAddresses.find((item) => item.isDefault)?.id ?? nextAddresses[0]?.id);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Detail barbershop gagal dimuat'))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedService = useMemo(() => shop?.services.find((item) => item.id === serviceId), [serviceId, shop]);
  const minimumDate = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 10);

  const createBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!id || !barberId || !serviceId || !addressId || !date || !time) {
      setError('Pilih alamat, karyawan, layanan, tanggal, dan jam booking');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await BookingEndpoint.create({
        barbershopId: Number(id), barberId, addressId, serviceId,
        startDatetime: `${date}T${time}`,
        notes,
      });
      if (result?.id) {
        setSuccess(`Booking ${result.bookingCode} berhasil dibuat. Total sementara Rp ${(result.totalPrice ?? 0).toLocaleString('id-ID')}.`);
        window.setTimeout(() => navigate('/customer/bookings'), 900);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Booking gagal dibuat');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-xs text-zinc-500">Memuat detail barbershop...</div>;
  if (!shop) return <div className="py-12 text-center text-xs text-red-400">{error || 'Barbershop tidak ditemukan'}</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link to="/customer/bookings/new" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-brand-300 transition-colors">
        <ArrowLeft size={16} /> Kembali ke Pencarian Barbershop
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        {/* Left Column: Details, Staff, Services */}
        <div className="space-y-8">
          <header className="border-b border-zinc-800/80 pb-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Barbershop Mitra Resmi</p>
                <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">{shop.name}</h1>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-300">
                <Star size={14} fill="currentColor" /> {shop.ratingAverage?.toFixed?.(1) ?? '0.0'}
                <span className="font-normal text-zinc-400">· {shop.totalCompleted} booking selesai</span>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-zinc-300">
              <MapPin size={16} className="shrink-0 text-brand-400" />
              <span>{shop.address}, {shop.city}, {shop.province}</span>
            </p>
            {shop.description && <p className="mt-3 text-xs leading-relaxed text-zinc-400">{shop.description}</p>}
          </header>

          {/* Section Staff Barber */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Tim Barber</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-zinc-100">1. Pilih Karyawan Barber</h2>
              </div>
              <UserRound className="text-zinc-600" size={20} />
            </div>

            {shop.staff.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-5 text-xs text-zinc-500">
                Belum ada karyawan terverifikasi yang bisa menerima booking saat ini.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {shop.staff.map((staff) => {
                  const isSelected = barberId === staff.id;
                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => setBarberId(staff.id)}
                      className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left backdrop-blur-sm transition-all duration-200 ${
                        isSelected
                          ? 'border-brand-400 bg-brand-500/10 shadow-lg shadow-brand-500/5'
                          : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid size-10 place-items-center rounded-lg border border-brand-400/20 bg-zinc-950 text-brand-300">
                          <UserRound size={18} />
                        </span>
                        {isSelected && <CheckCircle2 size={18} className="text-brand-400" />}
                      </div>

                      <div className="mt-4">
                        <h3 className={`font-semibold text-sm ${isSelected ? 'text-brand-300' : 'text-zinc-100'}`}>
                          {staff.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-zinc-400">
                          {staff.position || 'Barber'} · <span className="text-emerald-400">{staff.availabilityStatus}</span>
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-800/60 pt-3 text-[11px] font-semibold text-brand-300">
                        <Star size={11} fill="currentColor" /> {staff.ratingAverage?.toFixed?.(1) ?? '0.0'} · {staff.totalCompleted} booking
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section Services */}
          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Pilihan Layanan</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-zinc-100">2. Pilih Kebutuhan Grooming</h2>
            </div>

            <div className="divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
              {shop.services.map((service) => {
                const isSelected = serviceId === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setServiceId(service.id)}
                    className={`flex w-full items-center justify-between gap-4 p-4 text-left transition-colors ${
                      isSelected ? 'bg-brand-500/10' : 'hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-lg border ${isSelected ? 'border-brand-400 bg-zinc-950 text-brand-300' : 'border-zinc-800 bg-zinc-950 text-zinc-500'}`}>
                        <Scissors size={16} />
                      </span>
                      <div>
                        <span className={`block text-xs font-semibold ${isSelected ? 'text-brand-300' : 'text-zinc-100'}`}>
                          {service.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-zinc-400">
                          {service.description || 'Layanan grooming resmi'} · {service.duration} menit
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-brand-300">
                      Rp {service.price.toLocaleString('id-ID')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Form */}
        <form onSubmit={createBooking} className="space-y-5 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur-md lg:sticky lg:top-6 sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Konfirmasi Jadwal</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-zinc-100">Buat Booking</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              Biaya perjalanan final akan dihitung otomatis dari titik alamatmu ke lokasi operasional barber.
            </p>
          </div>

          {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
          {success && <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">{success}</p>}

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-300">Alamat Tujuan Dikirim</span>
            <select
              value={addressId ?? ''}
              onChange={(event) => setAddressId(Number(event.target.value))}
              className="h-11 w-full rounded-md border border-zinc-700 bg-zinc-950/70 px-3.5 text-xs text-zinc-100 focus:border-brand-400 focus:outline-none"
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label || 'Alamat'} · {address.fullAddress}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <InputField label="Tanggal Kedatangan" name="date" type="date" min={minimumDate} value={date} onChange={(event) => setDate(event.target.value)} required />
            <InputField label="Jam Mulai" name="time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          </div>

          <TextareaField label="Catatan Tambahan (Opsional)" name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contoh: patokan pagar hitam, permintaan potongan tertentu..." />

          {selectedService && (
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs">
              <span className="flex items-center gap-2 text-zinc-400">
                <Clock3 size={14} className="text-brand-400" />
                {selectedService.name} ({selectedService.duration}m)
              </span>
              <span className="font-bold text-brand-300">Rp {selectedService.price.toLocaleString('id-ID')}+</span>
            </div>
          )}

          <Button type="submit" className="w-full shadow-lg shadow-brand-500/15" disabled={saving || !shop.staff.length || !shop.services.length}>
            <span>{saving ? 'Membuat Booking...' : 'Konfirmasi & Simpan Booking'}</span>
            <CalendarDays size={17} />
          </Button>

          <p className="text-center text-[10px] leading-relaxed text-zinc-500">
            Booking menunggu konfirmasi barber. Pembayaran via Midtrans / QRIS dapat dilanjutkan setelah booking tersimpan.
          </p>
        </form>
      </div>
    </div>
  );
}

