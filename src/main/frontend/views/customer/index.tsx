import { ArrowRight, CalendarCheck, MapPin, Scissors, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button.js';

export default function CustomerDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Light Luxury Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-8 text-white shadow-xl sm:p-12">
        {/* Glow ambient background graphics */}
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-32 size-64 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <Sparkles size={14} className="text-yellow-300" />
            <span className="uppercase tracking-widest text-[10px] font-bold">Barber Booking Platform</span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Grooming Pria Eksklusif <br />
            <span className="text-transparent bg-gradient-to-r from-red-300 via-white to-blue-200 bg-clip-text">
              Langsung ke Lokasi Kamu.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-blue-100 sm:text-base">
            Pilih barbershop mitra resmi, tentukan barber favoritmu, dan atur jadwal pemotongan rambut tanpa perlu antre di tempat.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/customer/bookings/new">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-900/30">
                <span>Cari Barbershop</span>
                <ArrowRight size={17} />
              </Button>
            </Link>
            <Link to="/customer/addresses">
              <Button variant="secondary" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <MapPin size={16} />
                <span>Atur Alamat Saya</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature badges */}
        <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-white border border-white/20">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Barbershop Resmi</p>
              <p className="text-[11px] text-blue-200">Terverifikasi oleh admin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-white border border-white/20">
              <Scissors size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Barber Profesional</p>
              <p className="text-[11px] text-blue-200">Karyawan berpengalaman</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-white border border-white/20">
              <MapPin size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Perhitungan Akurat</p>
              <p className="text-[11px] text-blue-200">Jarak & biaya real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Navigation Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: CalendarCheck,
            title: 'Atur Booking',
            desc: 'Pilih barber profesional dan layanan terbaik dari barbershop terdekat di sekitar lokasimu.',
            to: '/customer/bookings/new',
            badge: 'Pesan Sekarang',
            borderColor: 'hover:border-red-500',
            iconColor: 'text-red-600 bg-red-50 border-red-200',
          },
          {
            icon: MapPin,
            title: 'Kelola Alamat',
            desc: 'Simpan lokasi rumah atau kantor di Google Maps dan jadikan alamat utama untuk perhitungan jarak.',
            to: '/customer/addresses',
            badge: 'Titik Lokasi',
            borderColor: 'hover:border-blue-500',
            iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
          },
          {
            icon: WalletCards,
            title: 'Pantau Pesanan',
            desc: 'Lihat status keberangkatan barber, rincian biaya, jadwal datang, dan lakukan pembayaran digital.',
            to: '/customer/bookings',
            badge: 'Riwayat & Bayar',
            borderColor: 'hover:border-red-500',
            iconColor: 'text-red-600 bg-red-50 border-red-200',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.to}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${item.borderColor}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`grid size-12 place-items-center rounded-xl border ${item.iconColor}`}>
                    <Icon size={22} />
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                    {item.badge}
                  </span>
                </div>

                <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h2>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs font-bold text-blue-600">
                <span>Akses Fitur</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

