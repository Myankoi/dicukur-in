import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
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

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="rounded-md border border-zinc-800 bg-zinc-900/55 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <p className="text-xs font-semibold text-brand-300">Portal akun</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-white">
            Selamat datang kembali.
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Masuk dengan email yang terdaftar untuk melanjutkan.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-md border border-red-900/70 bg-red-950/45 px-4 py-3 text-xs leading-5 text-red-300"
            >
              {error}
            </div>
          )}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <InputField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="relative">
              <InputField
                label="Kata sandi"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className="pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
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
              <LogIn size={17} />
              {loading ? 'Memeriksa akun...' : 'Masuk'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
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
