import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { BrandMark } from './BrandMark.js';

interface AuthShellProps {
  children: React.ReactNode;
  wide?: boolean;
}

export function AuthShell({ children, wide = false }: AuthShellProps) {
  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900 lg:grid lg:grid-cols-12">
      {/* Left Hero Panel */}
      <section className="relative hidden min-h-dvh overflow-hidden lg:col-span-5 lg:block">
        {/* Full Color Barbershop Image */}
        <img
          src="/images/barbershop-hero-wide.png"
          alt="Dicukur.in Lounge"
          className="absolute inset-0 size-full object-cover object-[65%_center]"
        />
        {/* Soft Bottom Gradient for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Top Logo */}
        <div className="absolute top-0 left-0 p-8 xl:p-12 z-10">
          <BrandMark inverted />
        </div>

        {/* Bottom Left Quotation (No Footer, No Center Alignment) */}
        <div className="absolute bottom-0 left-0 p-8 xl:p-12 z-10 space-y-2 max-w-md">
          <blockquote className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl drop-shadow-md">
            "Tampil rapi, bergerak lebih percaya diri."
          </blockquote>
          <p className="text-xs font-medium text-slate-200 drop-shadow">
            Temukan barber terbaik, sesuai jadwalmu.
          </p>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="flex min-h-dvh flex-col bg-slate-50 lg:col-span-7">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 sm:px-10">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-2 text-xs font-bold text-slate-600 transition-colors hover:text-red-600"
          >
            <ArrowLeft size={15} />
            Kembali ke beranda
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
