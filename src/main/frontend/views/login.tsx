import { useState } from 'react';
import { motion, type PanInfo } from 'motion/react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { login } from '@vaadin/hilla-frontend';
import { UserEndpoint } from 'Frontend/generated/endpoints';
import { AuthShell } from '../components/AuthShell.js';
import { Button } from '../components/ui/Button.js';
import { InputField } from '../components/ui/Field.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email.trim(), password, {
        navigate: () => undefined,
      });

      if (result.error) {
        setError('Email atau kata sandi tidak sesuai, atau akunmu belum aktif.');
        return;
      }

      const user = await UserEndpoint.getCurrentUser();
      if (!user) {
        setError('Email atau kata sandi tidak sesuai, atau akunmu belum aktif.');
        return;
      }

      const destination: Record<string, string> = {
        Admin: '/admin',
        Barber: '/barber',
        Owner: '/owner',
        Customer: '/customer',
      };
      navigate(user.role ? (destination[user.role] ?? '/customer') : '/customer', { replace: true });
    } catch {
      setError('Login belum berhasil. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const openRegisterOnSwipe = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -90 && Math.abs(info.offset.y) < 70) {
      navigate('/register');
    }
  };

  return (
    <AuthShell>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={openRegisterOnSwipe}
        initial={{ opacity: 0, rotateY: -14, x: -18 }}
        animate={{ opacity: 1, rotateY: 0, x: 0 }}
        whileDrag={{ rotateY: -6, scale: 0.985 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="touch-pan-y"
      >
        <div className="rounded-md border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div>
            <div className="flex items-center gap-3 text-xs font-semibold text-brand-300">
              <span className="h-px w-7 bg-brand-400" />
              Customer, owner, dan admin
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white">
              Selamat datang kembali.
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Masuk untuk mengelola booking, alamat, atau operasional barbershop.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-md border border-red-900/70 bg-red-950/45 px-4 py-3 text-xs leading-5 text-red-300"
            >
              {error}
            </div>
          )}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <InputField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                className="pl-11"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Mail
                size={17}
                className="pointer-events-none absolute bottom-3 left-3.5 text-zinc-600"
              />
            </div>

            <div className="relative">
              <InputField
                label="Kata sandi"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className="pl-11 pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <LockKeyhole
                size={17}
                className="pointer-events-none absolute bottom-3 left-3.5 text-zinc-600"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute bottom-0 right-0 grid size-11 place-items-center text-zinc-500 transition-colors hover:text-zinc-200"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Memeriksa akun...' : 'Masuk'}
              <ArrowRight size={17} />
            </Button>
          </form>

          <p className="mt-7 border-t border-white/10 pt-5 text-center text-xs text-zinc-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-brand-300 hover:text-brand-100">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthShell>
  );
}
