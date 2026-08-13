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
      {/* Left Wireframe Panel (4 Cols) */}
      <section className="relative hidden min-h-dvh overflow-hidden border-r border-slate-200 bg-slate-100 lg:col-span-4 lg:block">
        {/* Wireframe X Canvas Background */}
        <div className="absolute inset-0 bg-slate-100">
          <svg className="h-full w-full stroke-slate-300" strokeWidth="1.5">
            <line x1="0" y1="0" x2="100%" y2="100%" />
            <line x1="100%" y1="0" x2="0" y2="100%" />
          </svg>
        </div>

        {/* Top Logo */}
        <div className="absolute top-0 left-0 p-8 xl:p-10 z-10">
          <BrandMark />
        </div>

        {/* Bottom Quotation */}
        <div className="absolute bottom-0 left-0 p-8 xl:p-10 z-10 space-y-1.5 max-w-sm">
          <blockquote className="font-display text-2xl font-bold tracking-tight text-slate-900">
            "Tampil rapi, bergerak lebih percaya diri."
          </blockquote>
          <p className="text-xs font-medium text-slate-500">
            Temukan barber terbaik, sesuai jadwalmu.
          </p>
        </div>
      </section>

      {/* Right Form Panel (8 Cols - Larger Ratio) */}
      <section className="flex min-h-dvh flex-col bg-slate-50 lg:col-span-8">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 sm:px-10">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-2 text-xs font-bold text-slate-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft size={15} />
            Kembali ke beranda
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className={wide ? 'w-full max-w-3xl' : 'w-full max-w-lg'}>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
