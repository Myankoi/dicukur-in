import { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { BrandMark } from './BrandMark.js';

interface AuthShellProps {
  children: React.ReactNode;
  wide?: boolean;
}

export function AuthShell({ children, wide = false }: AuthShellProps) {
  const illustrationBoundsRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900 lg:grid lg:grid-cols-12">
      {/* Left Visual Panel (4 Cols) */}
      <section className="relative hidden min-h-dvh overflow-hidden border-r border-slate-200 bg-slate-950 lg:col-span-4 lg:block">
        <div
          ref={illustrationBoundsRef}
          className="absolute inset-0 flex items-center justify-center overflow-hidden p-10 xl:p-16"
          style={{ perspective: '1100px' }}
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute size-72 rounded-full bg-blue-500/20 blur-3xl xl:size-96"
            animate={{ scale: [0.88, 1.08, 0.88], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.div
            drag
            dragConstraints={illustrationBoundsRef}
            dragElastic={0.22}
            dragMomentum
            whileHover={{ scale: 1.025 }}
            whileTap={{ cursor: 'grabbing', scale: 1.05 }}
            className="relative z-[1] h-[78%] w-[78%] max-w-[28rem] cursor-grab touch-none"
          >
            <motion.img
              src="/images/cordless-clipper-3d.png"
              alt="Ilustrasi alat cukur cordless"
              className="h-full w-full select-none object-contain drop-shadow-[0_24px_36px_rgba(37,99,235,0.24)]"
              draggable={false}
              animate={{
                rotate: [-5, 5, -5],
                rotateX: [2, -2, 2],
                rotateY: [-10, 10, -10],
                y: [0, -10, 0],
              }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
            />
          </motion.div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/35 via-transparent to-slate-950/30"
        />

        {/* Top Logo */}
        <div className="absolute top-0 left-0 p-8 xl:p-10 z-10">
          <BrandMark />
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
