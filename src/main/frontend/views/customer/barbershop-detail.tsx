import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, Star, UserRound } from 'lucide-react';
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

  if (loading) return <p className="text-sm text-zinc-500">Memuat detail barbershop...</p>;
  if (!shop) return <p className="text-sm text-red-600">{error || 'Barbershop tidak ditemukan'}</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link to="/customer/bookings/new" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950"><ArrowLeft size={16} /> Kembali ke pencarian</Link>
      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="space-y-6">
          <header className="border-b border-zinc-200 pb-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Barbershop partner</p><h1 className="mt-2 font-display text-5xl font-semibold text-zinc-950">{shop.name}</h1></div>
              <div className="flex items-center gap-1 text-sm font-semibold text-brand-700"><Star size={15} fill="currentColor" /> {shop.ratingAverage?.toFixed?.(1) ?? '0.0'} <span className="font-normal text-zinc-400">· {shop.totalCompleted} selesai</span></div>
            </div>
            <p className="mt-5 flex gap-2 text-sm leading-6 text-zinc-600"><MapPin size={17} className="mt-0.5 shrink-0 text-brand-600" /> {shop.address}, {shop.city}, {shop.province}</p>
            {shop.description && <p className="mt-3 text-sm leading-6 text-zinc-500">{shop.description}</p>}
          </header>

          <section>
            <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Tim resmi</p><h2 className="mt-2 font-display text-3xl font-semibold text-zinc-950">Pilih karyawan</h2></div><UserRound className="text-zinc-300" /></div>
            {shop.staff.length === 0 ? <p className="mt-5 border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-500">Belum ada karyawan terverifikasi yang bisa menerima booking.</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2">{shop.staff.map((staff) => <button key={staff.id} type="button" onClick={() => setBarberId(staff.id)} className={`border p-4 text-left transition-colors ${barberId === staff.id ? 'border-brand-500 bg-brand-50' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center bg-zinc-900 text-brand-300"><UserRound size={18} /></span>{barberId === staff.id && <Check size={17} className="text-brand-700" />}</div><h3 className="mt-4 font-semibold text-zinc-950">{staff.name}</h3><p className="mt-1 text-xs text-zinc-500">{staff.position || 'Barber'} · {staff.availabilityStatus}</p><p className="mt-3 flex items-center gap-1 text-xs text-brand-700"><Star size={12} fill="currentColor" /> {staff.ratingAverage?.toFixed?.(1) ?? '0.0'} · {staff.totalCompleted} layanan</p></button>)}</div>}
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Layanan</p><h2 className="mt-2 font-display text-3xl font-semibold text-zinc-950">Pilih kebutuhanmu</h2>
            <div className="mt-5 divide-y divide-zinc-100 border border-zinc-200 bg-white">{shop.services.map((service) => <button key={service.id} type="button" onClick={() => setServiceId(service.id)} className={`flex w-full items-center justify-between gap-4 p-4 text-left ${serviceId === service.id ? 'bg-brand-50' : 'hover:bg-zinc-50'}`}><span><span className="block font-semibold text-zinc-950">{service.name}</span><span className="mt-1 block text-xs text-zinc-500">{service.description || 'Layanan grooming partner'} · {service.duration} menit</span></span><span className="shrink-0 text-sm font-semibold text-brand-700">Rp {service.price.toLocaleString('id-ID')}</span></button>)}</div>
          </section>
        </div>

        <form onSubmit={createBooking} className="space-y-5 border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 sm:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Atur jadwal</p><h2 className="mt-2 font-display text-3xl font-semibold text-zinc-950">Buat booking</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Harga perjalanan final dihitung dari jarak alamat ke lokasi operasional barber.</p></div>
          {error && <p className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{error}</p>}
          {success && <p className="border-l-2 border-emerald-500 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-700">{success}</p>}
          <label className="space-y-2"><span className="text-xs font-semibold text-zinc-700">Alamat tujuan</span><select value={addressId ?? ''} onChange={(event) => setAddressId(Number(event.target.value))} className="h-11 w-full border border-zinc-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none">{addresses.map((address) => <option key={address.id} value={address.id}>{address.label || 'Alamat'} · {address.fullAddress}</option>)}</select></label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><InputField label="Tanggal" name="date" type="date" min={minimumDate} value={date} onChange={(event) => setDate(event.target.value)} required /><InputField label="Jam mulai" name="time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></div>
          <TextareaField label="Catatan" name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Patokan atau permintaan khusus" />
          {selectedService && <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-sm"><span className="flex items-center gap-2 text-zinc-500"><Clock3 size={15} /> {selectedService.name} · {selectedService.duration} menit</span><span className="font-semibold text-zinc-950">Rp {selectedService.price.toLocaleString('id-ID')}+</span></div>}
          <Button type="submit" className="w-full" disabled={saving || !shop.staff.length || !shop.services.length}>{saving ? 'Membuat booking...' : 'Konfirmasi booking'}<CalendarDays size={17} /></Button>
          <p className="text-center text-[11px] leading-5 text-zinc-400">Booking menunggu konfirmasi karyawan. Pembayaran bisa dilanjutkan setelah booking tersimpan.</p>
        </form>
      </div>
    </div>
  );
}
