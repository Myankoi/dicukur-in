import { ArrowRight, CalendarCheck, MapPin, WalletCards } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button.js';

export default function CustomerDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden bg-zinc-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Customer lounge</p><h1 className="mt-3 font-display text-5xl font-semibold leading-none">Grooming datang ke lokasi kamu.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-zinc-300">Pilih barbershop resmi, tentukan karyawan, dan booking jadwal tanpa chat panjang.</p><Link to="/customer/bookings/new" className="mt-7 inline-block"><Button size="lg">Cari barbershop <ArrowRight size={17} /></Button></Link></div>
        <div className="absolute -right-10 -top-10 size-64 border border-brand-400/25" />
        <div className="absolute -bottom-28 right-20 size-80 border border-zinc-700/60" />
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {[{ icon: CalendarCheck, title: 'Atur booking', desc: 'Pilih barber dan layanan dari barbershop terdekat.', to: '/customer/bookings/new' }, { icon: MapPin, title: 'Kelola alamat', desc: 'Simpan lokasi dan jadikan alamat utama untuk pencarian.', to: '/customer/addresses' }, { icon: WalletCards, title: 'Pantau pesanan', desc: 'Lihat status, jadwal, total biaya, dan pembayaran.', to: '/customer/bookings' }].map((item) => { const Icon = item.icon; return <Link key={item.title} to={item.to} className="group border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"><Icon size={21} className="text-brand-600" /><h2 className="mt-5 font-display text-2xl font-semibold text-zinc-950">{item.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{item.desc}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-brand-700 group-hover:text-brand-500">Buka <ArrowRight size={14} /></span></Link>; })}
      </div>
    </div>
  );
}
