import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router';
import { BrandMark } from './BrandMark.js';
import { buttonStyles } from './ui/Button.js';

const navigation = [
  { label: 'Layanan', href: '/#layanan' },
  { label: 'Mitra Barber', href: '/#mitra' },
  { label: 'Harga', href: '/#harga' },
];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandMark />

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-semibold text-zinc-400 transition-colors hover:text-brand-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
            Masuk
          </Link>
          <Link to="/register" className={buttonStyles({ size: 'sm' })}>
            Daftar akun
          </Link>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-md text-zinc-200 md:hidden"
          aria-label="Buka navigasi"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="border-t border-white/10 bg-zinc-950 px-5 py-5 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="grid gap-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/login" className={buttonStyles({ variant: 'secondary' })}>
                Masuk
              </Link>
              <Link to="/register" className={buttonStyles()}>
                Daftar akun
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
