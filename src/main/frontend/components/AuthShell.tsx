import { ArrowLeft, CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { BrandMark } from './BrandMark.js';

interface AuthShellProps {
  children: React.ReactNode;
  wide?: boolean;
}

const proofPoints = [
  { icon: ShieldCheck, label: 'Mitra terverifikasi' },
  { icon: CalendarCheck, label: 'Jadwal transparan' },
  { icon: Sparkles, label: 'Layanan premium' },
];

export function AuthShell({ children, wide = false }: AuthShellProps) {
  return (
    <main className="min-h-dvh overflow-hidden bg-zinc-950 text-zinc-100 lg:grid lg:grid-cols-[minmax(420px,45%)_minmax(560px,55%)]">
      <section className="relative hidden min-h-dvh overflow-hidden border-r border-white/10 lg:block">
        <img
          src="/images/barbershop_hero.jpg"
          alt="Interior barbershop premium dicukur.in"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-zinc-950/45" />
        <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

        <div className="relative z-10 flex min-h-dvh flex-col justify-between p-10 xl:p-12">
          <BrandMark />

          <div className="max-w-md">
            <p className="text-xs font-semibold text-brand-300">dicukur.in partner network</p>
            <h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95] text-white">
              Grooming rapi, booking tanpa ribet.
            </h2>
            <div className="mt-8 grid gap-2">
              {proofPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.label}
                    className="flex items-center gap-3 border-b border-white/10 py-3 text-sm text-zinc-300"
                  >
                    <span className="grid size-9 place-items-center rounded-md bg-zinc-950/60 text-brand-300">
                      <Icon size={17} />
                    </span>
                    {point.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-dvh flex-col bg-[radial-gradient(circle_at_top_left,rgba(216,174,79,0.12),transparent_34%),linear-gradient(180deg,#09090b_0%,#111113_100%)]">
        <div className="flex min-h-20 items-center justify-between gap-4 border-b border-white/10 px-5 sm:px-8 lg:border-0 lg:px-12">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <Link
            to="/"
            className="group ml-auto inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs font-medium text-zinc-400 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Kembali ke beranda
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8 lg:px-14">
          <div className={wide ? 'w-full max-w-2xl [perspective:1400px]' : 'w-full max-w-[440px] [perspective:1400px]'}>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
