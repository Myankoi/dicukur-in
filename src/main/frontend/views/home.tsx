import { motion } from 'motion/react';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  MapPin,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import { Link } from 'react-router';
import { PublicHeader } from '../components/PublicHeader.js';
import { buttonStyles } from '../components/ui/Button.js';

const services = [
  {
    icon: Scissors,
    title: 'Barber terkurasi',
    description: 'Pilih barber berdasarkan keahlian, area layanan, dan ulasan pelanggan.',
  },
  {
    icon: CalendarCheck,
    title: 'Jadwal transparan',
    description: 'Lihat slot tersedia dan buat janji tanpa menunggu balasan manual.',
  },
  {
    icon: MapPin,
    title: 'Datang ke lokasi',
    description: 'Nikmati layanan grooming di rumah, kantor, atau tempat pilihanmu.',
  },
];

const benefits = [
  'Profil dan keahlian mitra terverifikasi',
  'Atur jadwal dan radius layanan sendiri',
  'Kelola pesanan dalam satu dashboard',
];

export default function HomePage() {
  return (
    <div className="bg-zinc-950 text-zinc-100">
      <PublicHeader />

      <section className="relative flex h-[88dvh] min-h-[560px] max-h-[840px] items-center overflow-hidden">
        <img
          src="/images/barbershop-hero-wide.png"
          alt="Layanan potong rambut premium dari dicukur.in"
          className="absolute inset-0 size-full object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-zinc-950/35" />
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/5 lg:w-4/5" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="mb-6 flex items-center gap-3 text-xs font-semibold text-brand-300">
              <span className="h-px w-7 bg-brand-400" />
              Premium grooming platform
            </div>
            <h1 className="text-balance font-display text-5xl font-semibold leading-[0.94] text-white sm:text-6xl lg:text-7xl">
              Barber premium,
              <span className="mt-1 block italic text-brand-300">sesuai jadwalmu.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
              Pesan barber terverifikasi untuk datang ke lokasimu. Tanpa antre, tanpa chat
              panjang, dengan jadwal dan harga yang jelas sejak awal.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register?type=customer" className={buttonStyles({ size: 'lg' })}>
                Buat janji pertama
                <ArrowRight size={17} />
              </Link>
              <a href="#mitra" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
                Jadi mitra barber
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="layanan" className="border-y border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold text-brand-300">Cara baru merawat diri</p>
              <h2 className="mt-4 max-w-md font-display text-4xl font-semibold leading-tight text-white">
                Grooming yang mengikuti ritmemu.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-zinc-500">
                Dari memilih barber sampai memastikan jadwal, semuanya selesai dalam beberapa
                langkah sederhana.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.article
                    key={service.title}
                    className="rounded-md border border-zinc-800 bg-zinc-900/45 p-6"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <span className="grid size-10 place-items-center rounded-md bg-brand-400/10 text-brand-300">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-5 text-sm font-semibold text-zinc-100">{service.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">{service.description}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="mitra" className="bg-zinc-100 text-zinc-950">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[600px]">
            <img
              src="/images/barbershop_hero.jpg"
              alt="Mitra barber profesional dicukur.in"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          <div className="flex items-center px-5 py-16 sm:px-10 lg:px-16 lg:py-20">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                <Store size={16} />
                Program mitra
              </div>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Keahlianmu pantas ditemukan lebih banyak pelanggan.
              </h2>
              <p className="mt-5 text-sm leading-7 text-zinc-600">
                Bergabung sebagai barber mandiri atau pemilik barbershop. Kami bantu mengelola
                permintaan, jadwal, dan jangkauan layanan.
              </p>
              <ul className="mt-7 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-zinc-700">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500 text-zinc-950">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link to="/register?type=barber" className={buttonStyles({ size: 'lg', className: 'mt-8' })}>
                Daftar sebagai mitra
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="harga" className="border-b border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                <Sparkles size={16} />
                Harga transparan
              </div>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Pilih layanan, lihat harga, lalu tentukan waktu.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-zinc-800 p-6">
                <p className="text-sm font-semibold text-white">Potong rambut</p>
                <p className="mt-5 font-display text-4xl font-semibold text-brand-300">
                  Mulai 60rb
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Harga akhir mengikuti barber, area, dan layanan tambahan.
                </p>
              </div>
              <div className="rounded-md border border-zinc-800 p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-brand-300" />
                  <p className="text-sm font-semibold text-white">Jaminan platform</p>
                </div>
                <p className="mt-5 text-sm leading-6 text-zinc-400">
                  Mitra diverifikasi dan detail pesanan tercatat agar layanan lebih aman dan
                  mudah dilacak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="font-display text-lg font-semibold text-zinc-300">dicukur.in</p>
          <p>Premium grooming, dibuat lebih mudah.</p>
        </div>
      </footer>
    </div>
  );
}
