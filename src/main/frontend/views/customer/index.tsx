import { ArrowRight, CalendarCheck, MapPin, Scissors, ShieldCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button.js';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80';

export default function CustomerDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Visual Hero Banner with High Quality Barbershop Background Image */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Barbershop Interior"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        {/* Top Accent Bar */}
        <div
          className="relative z-10 h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #dc2626 0%, #ffffff 50%, #2563eb 100%)' }}
        />

        <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-bold text-red-400 backdrop-blur-md mb-4">
            <Scissors size={14} /> Platform Grooming On-Demand #1
          </span>

          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Grooming Pria Eksklusif <br />
            <span className="text-red-500">Langsung ke Lokasi Kamu.</span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
            Pilih tempat cukur mitra resmi, tentukan barber profesional favoritmu, dan atur pemotongan rambut eksklusif di rumah atau kantor.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/customer/bookings/new">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/30">
                <span>Cari Barbershop</span>
                <ArrowRight size={17} />
              </Button>
            </Link>
            <Link to="/customer/addresses">
              <Button variant="secondary" size="lg" className="border-slate-700 text-slate-200 bg-slate-800/80 hover:bg-slate-800 font-bold backdrop-blur-md">
                <MapPin size={16} />
                <span>Atur Alamat Saya</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature badges */}
        <div className="relative z-10 grid gap-4 border-t border-slate-800/80 bg-slate-950/60 p-6 backdrop-blur-md sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-bold">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Barbershop Resmi</p>
              <p className="text-[11px] text-slate-400">Terverifikasi oleh admin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 font-bold">
              <Scissors size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Barber Profesional</p>
              <p className="text-[11px] text-slate-400">Karyawan berpengalaman</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-bold">
              <MapPin size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Perhitungan Akurat</p>
              <p className="text-[11px] text-slate-400">Jarak & biaya real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Navigation Cards with Visual Cover Photos */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: CalendarCheck,
            title: 'Atur Booking',
            desc: 'Pilih barber profesional dan layanan terbaik dari barbershop terdekat di sekitar lokasimu.',
            to: '/customer/bookings/new',
            badge: 'Pesan Sekarang',
            image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
          },
          {
            icon: MapPin,
            title: 'Kelola Alamat',
            desc: 'Simpan lokasi rumah atau kantor di Google Maps dan jadikan alamat utama untuk perhitungan jarak.',
            to: '/customer/addresses',
            badge: 'Titik Lokasi',
            image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
          },
          {
            icon: WalletCards,
            title: 'Pantau Pesanan',
            desc: 'Lihat status keberangkatan barber, rincian biaya, jadwal datang, dan lakukan pembayaran digital.',
            to: '/customer/bookings',
            badge: 'Riwayat & Bayar',
            image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80',
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.to}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-md"
            >
              {/* Card Image Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 inline-flex items-center rounded-md border border-white/20 bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  {item.badge}
                </span>
                <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-xl bg-white text-red-600 shadow-md">
                  <Icon size={20} />
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.desc}</p>
                </div>

                <Link
                  to={item.to}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-red-600 transition-colors group-hover:text-red-700"
                >
                  <span>Akses Fitur</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
