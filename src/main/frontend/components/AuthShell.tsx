import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { BrandMark } from './BrandMark.js';

interface AuthShellProps {
  children: React.ReactNode;
  wide?: boolean;
}

export function AuthShell({ children, wide = false }: AuthShellProps) {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100 lg:grid lg:grid-cols-[minmax(360px,46%)_1fr]">
      <section className="relative hidden min-h-dvh overflow-hidden border-r border-white/10 lg:block">
        <img
          src="/images/barbershop-hero-wide.png"
          alt="Barber sedang melayani pelanggan di lounge dicukur.in"
          className="absolute inset-0 size-full object-cover object-[64%_center]"
        />
        <div className="absolute inset-0 bg-zinc-950/35" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <BrandMark />
          <blockquote className="mt-8 max-w-md font-display text-3xl font-medium italic leading-tight text-zinc-100">
            "Tampil rapi, bergerak lebih percaya diri."
          </blockquote>
          <p className="mt-3 text-sm text-zinc-400">Temukan barber terbaik, sesuai jadwalmu.</p>
        </div>
      </section>

      <section className="flex min-h-dvh flex-col">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5 lg:border-0 lg:px-10">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-brand-300"
          >
            <ArrowLeft size={15} />
            Kembali ke beranda
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
