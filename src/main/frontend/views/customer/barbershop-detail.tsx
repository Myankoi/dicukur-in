import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Scissors,
  Star,
  UserRound,
  X,
  Search,
  Baby,
  Zap,
  Crown,
  Palette,
  Droplets,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { BarbershopEndpoint, BookingEndpoint, CustomerAddressEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import { InputField, TextareaField } from '../../components/ui/Field.js';

interface Address { id: number; label?: string; fullAddress: string; isDefault: boolean; }
interface Staff { staffId: number; barberUserId: number; name: string; position?: string; ratingAverage: number; totalCompleted: number; availabilityStatus: string; photo?: string; }
interface Service { id: number; name: string; description?: string; price: number; duration: number; }
interface ShopPhoto { id: number; filePath: string; caption?: string; }
interface Shop { id: number; name: string; description?: string; address: string; city?: string; province?: string; phone?: string; ratingAverage: number; totalCompleted: number; staff: Staff[]; services: Service[]; photoUrl?: string; photos?: ShopPhoto[]; }
interface BookingParticipant { participantName: string; serviceId?: number; }

const SAMPLE_GALLERY = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=80',
];

function getServiceIcon(serviceName: string) {
  const name = serviceName.toLowerCase();
  if (name.includes('anak') || name.includes('kid')) {
    return { icon: Baby, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' };
  }
  if (name.includes('jenggot') || name.includes('beard') || name.includes('kumis')) {
    return { icon: Zap, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' };
  }
  if (name.includes('paket') || name.includes('combo') || name.includes('complete') || name.includes('vip') || name.includes('executive')) {
    return { icon: Crown, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' };
  }
  if (name.includes('color') || name.includes('cat') || name.includes('pewarnaan') || name.includes('tint')) {
    return { icon: Palette, bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' };
  }
  if (name.includes('wash') || name.includes('cuci') || name.includes('shampoo') || name.includes('massage') || name.includes('pijat')) {
    return { icon: Droplets, bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' };
  }
  if (name.includes('facial') || name.includes('treatment') || name.includes('masker') || name.includes('spa')) {
    return { icon: Sparkles, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' };
  }
  return { icon: Scissors, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' };
}

export default function BarbershopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [barberId, setBarberId] = useState<number>();
  const [participants, setParticipants] = useState<BookingParticipant[]>([{ participantName: 'Saya' }]);
  const getTodayDateStr = () => new Date().toLocaleDateString('en-CA');
  const getFutureTimeStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d.toTimeString().slice(0, 5);
  };

  const [date, setDate] = useState(getTodayDateStr());
  const [time, setTime] = useState(getFutureTimeStr());
  const [notes, setNotes] = useState('');
  const [addressId, setAddressId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Carousel & Modal State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Scalable Barber Search State
  const [barberSearch, setBarberSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([BarbershopEndpoint.getDetail(Number(id)), CustomerAddressEndpoint.getMyAddresses()])
      .then(([shopResult, addressResult]) => {
        const nextShop = shopResult as unknown as Shop;
        const nextAddresses = (addressResult ?? []).filter(Boolean) as Address[];
        setShop(nextShop);
        setAddresses(nextAddresses);
        setBarberId(nextShop.staff[0]?.barberUserId ?? (nextShop.staff[0] as any)?.staffId);
        setParticipants([{ participantName: 'Saya', serviceId: nextShop.services[0]?.id }]);
        setAddressId(nextAddresses.find((item) => item.isDefault)?.id ?? nextAddresses[0]?.id);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Detail barbershop gagal dimuat'))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedService = useMemo(() => shop?.services.find((item) => item.id === participants[0]?.serviceId), [participants, shop]);
  const selectedBarber = useMemo(() => shop?.staff.find((item) => item.barberUserId === barberId), [barberId, shop]);
  const minimumDate = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 10);

  const galleryList = useMemo(() => {
    if (!shop) return [];
    const list: string[] = [];
    if (shop.photoUrl) list.push(shop.photoUrl);
    if (shop.photos && shop.photos.length > 0) {
      shop.photos.forEach((p) => {
        if (p.filePath && !list.includes(p.filePath)) list.push(p.filePath);
      });
    }
    if (list.length === 0) return SAMPLE_GALLERY;
    return list;
  }, [shop]);

  const filteredStaff = useMemo(() => {
    if (!shop?.staff) return [];
    const q = barberSearch.trim().toLowerCase();
    if (!q) return shop.staff;
    return shop.staff.filter((s) => `${s.name} ${s.position || ''}`.toLowerCase().includes(q));
  }, [shop?.staff, barberSearch]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryList.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryList.length) % galleryList.length);
  };

  const updateParticipant = (index: number, changes: Partial<BookingParticipant>) => {
    setParticipants((current) => current.map((participant, i) => i === index ? { ...participant, ...changes } : participant));
  };

  const addParticipant = () => {
    if (!shop?.services[0] || participants.length >= 10) return;
    setParticipants((current) => [...current, { participantName: `Peserta ${current.length + 1}`, serviceId: shop.services[0].id }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= 1) return;
    setParticipants((current) => current.filter((_, i) => i !== index));
  };

  const createBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!id || !barberId || !addressId || !date || !time || participants.some((item) => !item.participantName.trim() || !item.serviceId)) {
      setError('Lengkapi nama peserta, layanan, alamat, tanggal, dan jam booking');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await BookingEndpoint.create({
        barbershopId: Number(id), barberId, addressId,
        items: participants.map((item) => ({ participantName: item.participantName.trim(), serviceId: item.serviceId! })),
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

  if (loading) return <div className="py-16 text-center text-xs font-medium text-slate-500 rounded-2xl border border-slate-200 bg-white max-w-6xl mx-auto">Memuat detail barbershop...</div>;
  if (!shop) return <div className="py-16 text-center text-xs font-bold text-red-600 rounded-2xl border border-red-200 bg-red-50 max-w-6xl mx-auto">{error || 'Barbershop tidak ditemukan'}</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link to="/customer/bookings/new" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors">
        <ArrowLeft size={16} /> Kembali ke Pencarian Barbershop
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        {/* Left Column: Photos Carousel, Details, Staff, Services */}
        <div className="space-y-8">
          <header className="border-b border-slate-200 pb-6 space-y-5">
            {/* Interactive Photo Carousel */}
            <div className="space-y-3">
              <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm group">
                <img
                  src={galleryList[currentSlide]}
                  alt={shop.name}
                  className="h-full w-full object-cover transition-all duration-500 cursor-pointer"
                  onClick={() => setActivePhoto(galleryList[currentSlide])}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Carousel Arrow Controls */}
                {galleryList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full bg-slate-900/70 text-white backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition hover:bg-slate-900"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full bg-slate-900/70 text-white backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition hover:bg-slate-900"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Indicators & Counter */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/20">
                    {currentSlide + 1}/{galleryList.length}
                  </span>

                  <div className="flex gap-1.5 pointer-events-auto">
                    {galleryList.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentSlide(i)}
                        className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-6 bg-red-600' : 'w-2 bg-white/60 hover:bg-white'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Gallery Thumbnails Row */}
              {galleryList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {galleryList.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${currentSlide === idx
                        ? 'border-red-600 shadow-md scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                        }`}
                    >
                      <img src={photo} alt={`Galeri ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{shop.name}</h1>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700 shadow-sm">
                <Star size={14} className="fill-amber-500 text-amber-500" /> {shop.ratingAverage?.toFixed?.(1) ?? '0.0'}
                <span className="font-medium text-slate-500">· {shop.totalCompleted} booking selesai</span>
              </div>
            </div>

            <p className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <MapPin size={16} className="shrink-0 text-blue-600" />
              <span>{shop.address}, {shop.city}, {shop.province}</span>
            </p>
            {shop.description && <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">{shop.description}</p>}
          </header>

          {/* Scalable & Searchable Barber Selection Section */}
          <section className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Tim Barber Professional ({shop.staff.length})</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">1. Pilih Karyawan Barber</h2>
            </div>

            {shop.staff.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-500 text-center shadow-sm">
                Belum ada karyawan terverifikasi yang bisa menerima booking saat ini.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Search Bar for filtering large number of barbers */}
                {shop.staff.length > 2 && (
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={`Cari dari ${shop.staff.length} karyawan barber...`}
                      value={barberSearch}
                      onChange={(e) => setBarberSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none shadow-sm"
                    />
                  </div>
                )}

                {/* Currently Selected Barber Banner summary */}
                {selectedBarber && (
                  <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <UserCheck size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">Barber Dipilih: </span>
                        <span className="font-extrabold text-blue-600">{selectedBarber.name}</span>
                        <span className="text-slate-500 ml-1">({selectedBarber.position || 'Barber'})</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                      <Star size={12} className="fill-amber-500 text-amber-500" /> {selectedBarber.ratingAverage?.toFixed?.(1) ?? '0.0'}
                    </span>
                  </div>
                )}

                {/* Scalable Scrollable Grid Container for Scalability (max-h-72) */}
                <div className="grid gap-3 sm:grid-cols-2 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                  {filteredStaff.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-xs text-slate-500">
                      Tidak ada karyawan barber yang cocok dengan kata kunci "{barberSearch}".
                    </div>
                  ) : (
                    filteredStaff.map((staff) => {
                      const isSelected = barberId === staff.barberUserId;
                      return (
                        <button
                          key={staff.barberUserId}
                          type="button"
                          onClick={() => setBarberId(staff.barberUserId)}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 ${isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {staff.photo ? (
                              <img src={staff.photo} alt={staff.name} className="size-11 rounded-xl object-cover border border-slate-200" />
                            ) : (
                              <span className="grid size-11 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 font-bold">
                                <UserRound size={20} />
                              </span>
                            )}
                            {isSelected && <CheckCircle2 size={20} className="text-blue-600" />}
                          </div>

                          <div className="mt-4">
                            <h3 className={`font-bold text-sm ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                              {staff.name}
                            </h3>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {staff.position || 'Barber'} ·{' '}
                              <span className={staff.availabilityStatus === 'available' ? 'font-bold text-emerald-600' : 'font-bold text-slate-400'}>
                                {staff.availabilityStatus === 'available' ? '● Tersedia' : '○ Tidak Tersedia'}
                              </span>
                            </p>
                          </div>

                          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-bold text-amber-700">
                            <Star size={12} className="fill-amber-500 text-amber-500" /> {staff.ratingAverage?.toFixed?.(1) ?? '0.0'} · {staff.totalCompleted} booking
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Section Services and participants */}
          <section className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Pilihan Layanan Cukur</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">2. Siapa yang akan dicukur?</h2>
              <p className="mt-1 text-xs text-slate-600">Tambahkan anak atau anggota keluarga lain dalam satu booking. Barber mengerjakannya berurutan.</p>
            </div>

            <div className="space-y-3">
              {participants.map((participant, index) => {
                const selected = shop.services.find((service) => service.id === participant.serviceId);
                const iconInfo = getServiceIcon(selected?.name || 'cukur');
                const IconComponent = iconInfo.icon;
                return (
                  <div key={`${index}-${participant.participantName}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl border ${iconInfo.border} ${iconInfo.bg} ${iconInfo.text}`}><IconComponent size={18} /></span>
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900">Peserta {index + 1}</p>
                          {participants.length > 1 && <button type="button" onClick={() => removeParticipant(index)} aria-label={`Hapus peserta ${index + 1}`} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>}
                        </div>
                        <input value={participant.participantName} onChange={(event) => updateParticipant(index, { participantName: event.target.value })} placeholder="Nama, contoh: Budi / Anak saya" className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-900 outline-none focus:border-blue-600" />
                        <select value={participant.serviceId ?? ''} onChange={(event) => updateParticipant(index, { serviceId: Number(event.target.value) })} className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600">
                          <option value="">Pilih layanan</option>
                          {shop.services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.duration} menit · Rp {service.price.toLocaleString('id-ID')}</option>)}
                        </select>
                      </div>
                    </div>
                    {selected && <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">{selected.name} · {selected.duration} menit · Rp {selected.price.toLocaleString('id-ID')}</p>}
                  </div>
                );
              })}
              <button type="button" onClick={addParticipant} disabled={participants.length >= 10} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} /> Tambah orang ({participants.length}/10)</button>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Form */}
        <form onSubmit={createBooking} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Konfirmasi Jadwal</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">Buat Booking</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Biaya perjalanan final akan dihitung otomatis dari titik alamatmu ke lokasi operasional barber.
            </p>
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">{error}</p>}
          {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">{success}</p>}

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-700">Lokasi Tujuan Barber (Alamat Panggilan)</span>
            <select
              value={addressId ?? ''}
              onChange={(event) => setAddressId(Number(event.target.value))}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
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
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Clock3 size={14} className="text-blue-600" />
                {participants.length > 1 ? `${participants.length} peserta` : selectedService.name} · {participants.reduce((total, item) => total + (shop.services.find((service) => service.id === item.serviceId)?.duration ?? 0), 0)}m
              </span>
              <span className="font-bold text-blue-600">Rp {participants.reduce((total, item) => total + (shop.services.find((service) => service.id === item.serviceId)?.price ?? 0), 0).toLocaleString('id-ID')}+</span>
            </div>
          )}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20" disabled={saving || !shop.staff.length || !shop.services.length}>
            <span>{saving ? 'Membuat Booking...' : 'Konfirmasi & Simpan Booking'}</span>
            <CalendarDays size={17} />
          </Button>

          <p className="text-center text-[10px] leading-relaxed text-slate-500">
            Booking menunggu konfirmasi barber. Setelah diterima, kamu punya 30 menit untuk menyelesaikan pembayaran sebelum barber berangkat.
          </p>
        </form>
      </div>

      {/* Lightbox Photo Preview Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md" onClick={() => setActivePhoto(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 transition"
            >
              <X size={24} />
            </button>
            <img src={activePhoto} alt="Barbershop Full Preview" className="w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
