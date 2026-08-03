import { useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import {
  EndpointValidationError,
  ForbiddenResponseError,
  UnauthorizedResponseError,
} from '@vaadin/hilla-frontend';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Store,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { RegisterEndpoint } from 'Frontend/generated/endpoints';
import { AuthShell } from '../../components/AuthShell.js';
import { Button, buttonStyles } from '../../components/ui/Button.js';
import { InputField } from '../../components/ui/Field.js';

type AccountType = 'customer' | 'owner';
type Step = 1 | 2 | 3;

interface RegistrationForm {
  accountType: AccountType;
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  city: string;
  agreed: boolean;
}

interface AccountOption {
  value: AccountType;
  title: string;
  description: string;
  icon: LucideIcon;
}

const accountOptions: AccountOption[] = [
  {
    value: 'customer',
    title: 'Pelanggan',
    description: 'Pesan barber ke lokasi pilihanmu.',
    icon: UserRound,
  },
  {
    value: 'owner',
    title: 'Pemilik barbershop',
    description: 'Daftarkan bisnis dan kelola tim.',
    icon: Store,
  },
];

const stepLabels = ['Identitas', 'Keamanan akun', 'Detail & konfirmasi'];

function isAccountType(value: string | null): value is AccountType {
  return value === 'customer' || value === 'owner';
}

function createInitialForm(accountType: AccountType): RegistrationForm {
  return {
    accountType,
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    city: '',
    agreed: false,
  };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedType = searchParams.get('type');
  const initialType = isAccountType(requestedType) ? requestedType : 'customer';
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<RegistrationForm>(() => createInitialForm(initialType));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const update = <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectAccountType = (accountType: AccountType) => {
    update('accountType', accountType);
    setSearchParams({ type: accountType }, { replace: true });
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (form.name.trim().length < 2) {
        return 'Nama lengkap minimal 2 karakter.';
      }
      if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(form.phone.replace(/[\s-]/g, ''))) {
        return 'Masukkan nomor telepon Indonesia yang valid.';
      }
    }

    if (step === 2) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return 'Masukkan alamat email yang valid.';
      }
      if (form.password.length < 8) {
        return 'Kata sandi minimal 8 karakter.';
      }
      if (form.password !== form.confirmPassword) {
        return 'Konfirmasi kata sandi belum sama.';
      }
    }

    if (step === 3) {
      if (form.accountType === 'owner') {
        if (!form.businessName.trim()) return 'Nama barbershop wajib diisi.';
        if (!form.city.trim()) return 'Kota wajib diisi.';
      }
      if (!form.agreed) {
        return 'Setujui syarat dan ketentuan untuk melanjutkan.';
      }
    }

    return '';
  };

  const nextStep = (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep((current) => Math.min(3, current + 1) as Step);
  };

  const previousStep = () => {
    setError('');
    setStep((current) => Math.max(1, current - 1) as Step);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    const identity = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/[\s-]/g, ''),
      password: form.password,
    };

    try {
      if (form.accountType === 'customer') {
        await RegisterEndpoint.registerCustomer(identity);
      } else {
        await RegisterEndpoint.registerOwner({
          ...identity,
          businessName: form.businessName.trim(),
          city: form.city.trim(),
        });
      }
      setComplete(true);
    } catch (caughtError) {
      setError(formatRegistrationError(caughtError));
    } finally {
      setLoading(false);
    }
  };

  const openLoginOnSwipe = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (step === 1 && info.offset.x > 90 && Math.abs(info.offset.y) < 70) {
      navigate('/login');
    }
  };

  if (complete) {
    const isOwner = form.accountType === 'owner';
    return (
      <AuthShell>
        <motion.div
          className="rounded-md border border-white/10 bg-zinc-900/70 p-7 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-400/15 text-brand-300">
            <CircleCheck size={28} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold text-white">
            {isOwner ? 'Pendaftaran sudah dikirim.' : 'Akunmu sudah siap.'}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            {isOwner
              ? 'Tim admin akan memeriksa profil barbershopmu. Kamu bisa masuk dan lengkapi detail usaha setelah akun disetujui.'
              : 'Registrasi berhasil. Masuk dan mulai buat janji pertamamu.'}
          </p>
          <button
            type="button"
            className={buttonStyles({ size: 'lg', className: 'mt-8 w-full' })}
            onClick={() => navigate('/login', { replace: true })}
          >
            Ke halaman masuk
            <ArrowRight size={17} />
          </button>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell wide>
      <motion.div
        drag={step === 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={openLoginOnSwipe}
        initial={{ opacity: 0, rotateY: 14, x: 18 }}
        animate={{ opacity: 1, rotateY: 0, x: 0 }}
        whileDrag={{ rotateY: 6, scale: 0.985 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-md border border-white/10 bg-zinc-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl touch-pan-y sm:p-8"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-xs font-semibold text-brand-300">
              <span className="h-px w-7 bg-brand-400" />
              Buat akun baru
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white">
              Bergabung dengan dicukur.in.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Daftar sebagai pelanggan atau pemilik barbershop. Data owner dibuat ringkas dulu,
              detail usaha dilengkapi setelah akun disetujui.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
            {step} / 3
          </span>
        </div>

        <ol className="mt-7 grid grid-cols-3 gap-3" aria-label="Progres registrasi">
          {stepLabels.map((label, index) => {
            const number = index + 1;
            const active = step === number;
            const done = step > number;
            return (
              <li key={label}>
                <div className="relative h-1 overflow-hidden rounded-full bg-zinc-800">
                  {(done || active) && (
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-brand-400"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                    />
                  )}
                </div>
                <p className={`mt-2 hidden text-[11px] sm:block ${active ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {label}
                </p>
              </li>
            );
          })}
        </ol>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-red-900/70 bg-red-950/45 px-4 py-3 text-xs leading-5 text-red-300"
          >
            {error}
          </div>
        )}

        <form className="mt-7" onSubmit={step === 3 ? submit : nextStep}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, rotateY: 4, x: 12 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: -4, x: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {step === 1 && (
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">
                    Kamu akan menggunakan dicukur.in sebagai apa?
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Jenis akun">
                    {accountOptions.map((option) => {
                      const Icon = option.icon;
                      const selected = form.accountType === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          whileTap={{ scale: 0.98 }}
                          className={[
                            'min-h-32 rounded-md border p-4 text-left transition-colors',
                            selected
                              ? 'border-brand-400 bg-brand-400/10 shadow-[0_16px_34px_rgba(216,174,79,0.08)]'
                              : 'border-white/10 bg-zinc-950/35 hover:border-zinc-700',
                          ].join(' ')}
                          onClick={() => selectAccountType(option.value)}
                        >
                          <span
                            className={`grid size-10 place-items-center rounded-md ${
                              selected ? 'bg-brand-400 text-zinc-950' : 'bg-zinc-900 text-zinc-500'
                            }`}
                          >
                            <Icon size={19} />
                          </span>
                          <span className="mt-4 block text-xs font-semibold text-zinc-100">{option.title}</span>
                          <span className="mt-1 block text-[11px] leading-5 text-zinc-600">{option.description}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="Nama lengkap"
                      name="name"
                      autoComplete="name"
                      placeholder="Nama sesuai identitas"
                      value={form.name}
                      onChange={(event) => update('name', event.target.value)}
                      required
                    />
                    <InputField
                      label="Nomor telepon"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="08xxxxxxxxxx"
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Siapkan akses akunmu</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    Email dipakai untuk login dan informasi penting terkait pesanan.
                  </p>
                  <div className="mt-6 space-y-5">
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={form.email}
                      onChange={(event) => update('email', event.target.value)}
                      required
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputField
                        label="Kata sandi"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        hint="Min. 8 karakter"
                        value={form.password}
                        onChange={(event) => update('password', event.target.value)}
                        required
                      />
                      <InputField
                        label="Ulangi kata sandi"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={(event) => update('confirmPassword', event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  {form.accountType === 'customer' && (
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100">Periksa kembali akunmu</h2>
                      <dl className="mt-5 divide-y divide-white/10 rounded-md border border-white/10 bg-zinc-950/35 text-xs">
                        <div className="flex justify-between gap-4 px-4 py-3">
                          <dt className="text-zinc-600">Jenis akun</dt>
                          <dd className="text-zinc-200">Pelanggan</dd>
                        </div>
                        <div className="flex justify-between gap-4 px-4 py-3">
                          <dt className="text-zinc-600">Nama</dt>
                          <dd className="text-right text-zinc-200">{form.name}</dd>
                        </div>
                        <div className="flex justify-between gap-4 px-4 py-3">
                          <dt className="text-zinc-600">Email</dt>
                          <dd className="text-right text-zinc-200">{form.email}</dd>
                        </div>
                        <div className="flex justify-between gap-4 px-4 py-3">
                          <dt className="text-zinc-600">Telepon</dt>
                          <dd className="text-zinc-200">{form.phone}</dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  {form.accountType === 'owner' && (
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100">Info barbershop</h2>
                      <p className="mt-1 text-xs leading-5 text-zinc-600">
                        Detail lengkap seperti alamat, dokumen, dan layanan bisa dilengkapi
                        setelah akun disetujui.
                      </p>
                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <InputField
                          label="Nama barbershop"
                          name="businessName"
                          placeholder="Contoh: Barber Bros"
                          value={form.businessName}
                          onChange={(event) => update('businessName', event.target.value)}
                          required
                        />
                        <InputField
                          label="Kota / Kabupaten"
                          name="city"
                          placeholder="Contoh: Bandung"
                          value={form.city}
                          onChange={(event) => update('city', event.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-zinc-800 pt-5 text-xs leading-5 text-zinc-500">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-zinc-700 accent-[var(--color-brand-400)]"
                      checked={form.agreed}
                      onChange={(event) => update('agreed', event.target.checked)}
                    />
                    <span>
                      Saya menyetujui syarat penggunaan dan kebijakan privasi dicukur.in.
                      {form.accountType === 'owner' && ' Data barbershop akan diverifikasi oleh admin sebelum aktif.'}
                    </span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-zinc-800 pt-6">
            {step === 1 ? (
              <Link to="/login" className="text-xs font-medium text-zinc-500 hover:text-brand-300">
                Sudah punya akun?
              </Link>
            ) : (
              <Button type="button" variant="ghost" onClick={previousStep}>
                <ArrowLeft size={16} />
                Kembali
              </Button>
            )}

            <Button type="submit" disabled={loading}>
              {step === 3 ? (
                <>
                  <Check size={16} />
                  {loading ? 'Mengirim...' : 'Selesaikan pendaftaran'}
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </AuthShell>
  );
}

function formatRegistrationError(caughtError: unknown) {
  if (caughtError instanceof EndpointValidationError) {
    const firstValidationError = caughtError.validationErrorData.at(0);
    return firstValidationError?.message || 'Ada data pendaftaran yang belum valid.';
  }

  if (caughtError instanceof UnauthorizedResponseError || caughtError instanceof ForbiddenResponseError) {
    return 'Sesi halaman sudah kedaluwarsa. Muat ulang halaman lalu kirim ulang pendaftaran.';
  }

  if (caughtError instanceof Error) {
    const message = caughtError.message;
    if (
      message.includes('Email sudah terdaftar') ||
      message.includes('Nomor telepon sudah terdaftar') ||
      message.includes('Role Owner tidak ditemukan') ||
      message.includes('Role Customer tidak ditemukan')
    ) {
      return message;
    }
  }

  return 'Pendaftaran belum berhasil. Periksa data lalu coba lagi.';
}
