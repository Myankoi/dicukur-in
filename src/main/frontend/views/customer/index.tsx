import { ArrowRight, CalendarCheck, MapPin, Scissors, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button.js';

export default function CustomerDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 text-white shadow-2xl sm:p-12">
        {/* Glow ambient background graphics */}
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-32 size-64 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-400/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-300 backdrop-blur-md">
            <Sparkles size={14} className="text-brand-300" />
            <span className="uppercase tracking-widest text-[10px]">Customer Lounge</span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-zinc-100 sm:text-5xl lg:text-6xl">
            Grooming Pria Eksklusif <br />
            <span className="text-transparent bg-gradient-to-r from-brand-200 via-brand-400 to-amber-200 bg-clip-text">
              Langsung ke Lokasi Kamu.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            Pilih barbershop mitra resmi, tentukan barber favoritmu, dan atur jadwal pemotongan rambut tanpa perlu antre di tempat.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/customer/bookings/new">
              <Button size="lg" className="shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30">
                <span>Cari Barbershop</span>
                <ArrowRight size={17} />
              </Button>
            </Link>
            <Link to="/customer/addresses">
              <Button variant="secondary" size="lg">
                <MapPin size={16} />
                <span>Atur Alamat Saya</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature badges */}
        <div className="mt-10 grid gap-4 border-t border-zinc-800/80 pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-brand-400">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Barbershop Resmi</p>
              <p className="text-[11px] text-zinc-500">Terverifikasi oleh admin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-brand-400">
              <Scissors size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Barber Profesional</p>
              <p className="text-[11px] text-zinc-500">Karyawan berpenalaman</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-brand-400">
              <MapPin size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Perhitungan Akurat</p>
              <p className="text-[11px] text-zinc-500">Jarak & biaya real-time</p>
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
          },
          {
            icon: MapPin,
            title: 'Kelola Alamat',
            desc: 'Simpan lokasi rumah atau kantor di Google Maps dan jadikan alamat utama untuk perhitungan jarak.',
            to: '/customer/addresses',
            badge: 'Titik Lokasi',
          },
          {
            icon: WalletCards,
            title: 'Pantau Pesanan',
            desc: 'Lihat status keberangkatan barber, rincian biaya, jadwal datang, dan lakukan pembayaran digital.',
            to: '/customer/bookings',
            badge: 'Riwayat & Bayar',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.to}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-brand-500/5"
            >
              {/* Subtle gold glow line on top on hover */}
              <div className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-xl border border-brand-400/20 bg-zinc-950 text-brand-300 shadow-inner group-hover:border-brand-400/40 group-hover:bg-brand-500/10 transition-colors">
                    <Icon size={22} />
                  </span>
                  <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                    {item.badge}
                  </span>
                </div>

                <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-zinc-100 group-hover:text-brand-300 transition-colors">
                  {item.title}
                </h2>
                <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
                  {item.desc}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-brand-400 group-hover:text-brand-300">
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

