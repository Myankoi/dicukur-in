import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { login } from '@vaadin/hilla-frontend';
import { UserEndpoint } from '../generated/endpoints.js';
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
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Selamat datang kembali.
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Masuk dengan email yang terdaftar untuk melanjutkan.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700"
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
                className="absolute bottom-0 right-0 grid size-11 place-items-center text-slate-400 transition-colors hover:text-slate-700"
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

          <p className="mt-6 text-center text-xs text-slate-600">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthShell>
  );
}
