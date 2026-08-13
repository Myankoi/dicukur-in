import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
import { RegisterEndpoint } from '../../generated/endpoints.js';
import { AuthShell } from '../../components/AuthShell.js';
import { Button, buttonStyles } from '../../components/ui/Button.js';
import { InputField, TextareaField } from '../../components/ui/Field.js';

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
  businessLicenseNumber: string;
  businessDescription: string;
  address: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  serviceRadiusKm: string;
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
    businessLicenseNumber: '',
    businessDescription: '',
    address: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    serviceRadiusKm: '10',
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
        if (!form.address.trim() || !form.city.trim() || !form.province.trim()) {
          return 'Alamat, kota, dan provinsi wajib diisi.';
        }
        const serviceRadiusKm = Number(form.serviceRadiusKm);
        if (!Number.isFinite(serviceRadiusKm) || serviceRadiusKm < 1 || serviceRadiusKm > 100) {
          return 'Radius layanan harus di antara 1 sampai 100 km.';
        }
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
          businessLicenseNumber: form.businessLicenseNumber.trim(),
          description: form.businessDescription.trim(),
          address: form.address.trim(),
          district: form.district.trim(),
          city: form.city.trim(),
          province: form.province.trim(),
          postalCode: form.postalCode.trim(),
          serviceRadiusKm: Number(form.serviceRadiusKm),
        });
      }

      setComplete(true);
    } catch (caughtError) {
      setError(formatRegistrationError(caughtError));
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    const needsReview = form.accountType !== 'customer';
    return (
      <AuthShell wide>
        <motion.div
          className="rounded-xl border border-slate-200 bg-white p-7 text-center sm:p-10 shadow-xl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CircleCheck size={28} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold text-slate-900">
            {needsReview ? 'Pendaftaran sudah dikirim.' : 'Akunmu sudah siap.'}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
            {needsReview
              ? 'Tim admin akan memeriksa profil mitramu. Kamu bisa masuk setelah akun disetujui.'
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
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">Buat akun baru</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">Bergabung dengan dicukur.in</h1>
          </div>
          <span className="shrink-0 text-xs font-bold text-slate-400">{step} / 3</span>
        </div>

        <ol className="mt-7 grid grid-cols-3 gap-2" aria-label="Progres registrasi">
          {stepLabels.map((label, index) => {
            const number = index + 1;
            const active = step === number;
            const done = step > number;
            return (
              <li key={label}>
                <div className={`h-1 rounded-full ${done || active ? 'bg-red-600' : 'bg-slate-200'}`} />
                <p className={`mt-2 hidden text-[11px] font-semibold sm:block ${active ? 'text-red-600' : 'text-slate-400'}`}>
                  {label}
                </p>
              </li>
            );
          })}
        </ol>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700"
          >
            {error}
          </div>
        )}

        <form className="mt-7" onSubmit={step === 3 ? submit : nextStep}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Kamu akan menggunakan dicukur.in sebagai apa?</h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Jenis akun">
                    {accountOptions.map((option) => {
                      const Icon = option.icon;
                      const selected = form.accountType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          className={[
                            'min-h-32 rounded-xl border p-4 text-left transition-all',
                            selected
                              ? 'border-red-600 bg-red-50/60 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300',
                          ].join(' ')}
                          onClick={() => selectAccountType(option.value)}
                        >
                          <Icon size={20} className={selected ? 'text-red-600' : 'text-slate-400'} />
                          <span className="mt-4 block text-xs font-bold text-slate-900">{option.title}</span>
                          <span className="mt-1 block text-[11px] leading-5 text-slate-600">{option.description}</span>
                        </button>
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
                  <h2 className="text-sm font-bold text-slate-900">Siapkan akses akunmu</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
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
                      <h2 className="text-sm font-bold text-slate-900">Periksa kembali akunmu</h2>
                      <dl className="mt-5 divide-y divide-slate-100 border-y border-slate-200 text-xs">
                        <div className="flex justify-between gap-4 py-3">
                          <dt className="text-slate-500">Jenis akun</dt>
                          <dd className="text-slate-900 font-bold">Pelanggan</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-3">
                          <dt className="text-slate-500">Nama</dt>
                          <dd className="text-right text-slate-900 font-medium">{form.name}</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-3">
                          <dt className="text-slate-500">Email</dt>
                          <dd className="text-right text-slate-900 font-medium">{form.email}</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-3">
                          <dt className="text-slate-500">Telepon</dt>
                          <dd className="text-slate-900 font-medium">{form.phone}</dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  {form.accountType === 'owner' && (
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Profil barbershop</h2>
                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <InputField
                          label="Nama barbershop"
                          name="businessName"
                          value={form.businessName}
                          onChange={(event) => update('businessName', event.target.value)}
                          required
                        />
                        <InputField
                          label="Nomor izin usaha"
                          name="businessLicenseNumber"
                          hint="Opsional"
                          value={form.businessLicenseNumber}
                          onChange={(event) => update('businessLicenseNumber', event.target.value)}
                        />
                      </div>
                      <div className="mt-5">
                        <TextareaField
                          label="Deskripsi singkat"
                          name="businessDescription"
                          hint="Opsional"
                          placeholder="Ceritakan karakter dan layanan barbershop..."
                          value={form.businessDescription}
                          onChange={(event) => update('businessDescription', event.target.value)}
                        />
                      </div>
                      <OwnerAddressFields form={form} update={update} />
                    </div>
                  )}

                  <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-600">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-slate-300 accent-red-600"
                      checked={form.agreed}
                      onChange={(event) => update('agreed', event.target.checked)}
                    />
                    <span>
                      Saya menyetujui syarat penggunaan dan kebijakan privasi dicukur.in.
                      {form.accountType !== 'customer' && ' Data mitra akan diverifikasi oleh admin sebelum akun aktif.'}
                    </span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
            {step === 1 ? (
              <Link to="/login" className="text-xs font-bold text-red-600 hover:text-red-700">
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
      </div>
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

interface OwnerAddressFieldsProps {
  form: RegistrationForm;
  update: <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => void;
}

function OwnerAddressFields({ form, update }: OwnerAddressFieldsProps) {
  return (
    <div className="mt-5 space-y-5">
      <TextareaField
        label="Alamat barbershop"
        name="address"
        placeholder="Nama jalan, nomor, dan detail lokasi"
        value={form.address}
        onChange={(event) => update('address', event.target.value)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField
          label="Kecamatan"
          name="district"
          value={form.district}
          onChange={(event) => update('district', event.target.value)}
        />
        <InputField
          label="Kota / Kabupaten"
          name="city"
          value={form.city}
          onChange={(event) => update('city', event.target.value)}
          required
        />
        <InputField
          label="Provinsi"
          name="province"
          value={form.province}
          onChange={(event) => update('province', event.target.value)}
          required
        />
        <InputField
          label="Kode pos"
          name="postalCode"
          value={form.postalCode}
          onChange={(event) => update('postalCode', event.target.value)}
        />
        <InputField
          label="Radius layanan"
          name="serviceRadiusKm"
          type="number"
          min="1"
          max="100"
          hint="Kilometer"
          value={form.serviceRadiusKm}
          onChange={(event) => update('serviceRadiusKm', event.target.value)}
          required
        />
      </div>
    </div>
  );
}
