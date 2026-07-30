import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Scissors,
  Store,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { RegisterEndpoint } from 'Frontend/generated/endpoints';
import { AuthShell } from '../../components/AuthShell.js';
import { Button, buttonStyles } from '../../components/ui/Button.js';
import { InputField, TextareaField } from '../../components/ui/Field.js';

type AccountType = 'customer' | 'barber' | 'owner';
type Step = 1 | 2 | 3;

interface RegistrationForm {
  accountType: AccountType;
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  experienceYears: string;
  skillDescription: string;
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
    value: 'barber',
    title: 'Barber mandiri',
    description: 'Terima pesanan dan atur area layanan.',
    icon: Scissors,
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
  return value === 'customer' || value === 'barber' || value === 'owner';
}

function createInitialForm(accountType: AccountType): RegistrationForm {
  return {
    accountType,
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    experienceYears: '',
    skillDescription: '',
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
      if (form.accountType === 'barber') {
        if (!form.skillDescription.trim()) return 'Ceritakan keahlian utamamu.';
        if (!form.address.trim() || !form.city.trim() || !form.province.trim()) {
          return 'Alamat, kota, dan provinsi wajib diisi.';
        }
      }

      if (form.accountType === 'owner') {
        if (!form.businessName.trim()) return 'Nama barbershop wajib diisi.';
        if (!form.address.trim() || !form.city.trim() || !form.province.trim()) {
          return 'Alamat, kota, dan provinsi wajib diisi.';
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
      } else if (form.accountType === 'barber') {
        await RegisterEndpoint.registerBarber({
          ...identity,
          experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
          skillDescription: form.skillDescription.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          province: form.province.trim(),
          serviceRadiusKm: Number(form.serviceRadiusKm),
        });
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
      const message = caughtError instanceof Error ? caughtError.message : '';
      setError(message.includes('Email sudah terdaftar') ? message : 'Pendaftaran belum berhasil. Periksa data lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    const needsReview = form.accountType !== 'customer';
    return (
      <AuthShell>
        <motion.div
          className="rounded-md border border-zinc-800 bg-zinc-900/55 p-7 text-center sm:p-10"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-400/15 text-brand-300">
            <CircleCheck size={28} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold text-white">
            {needsReview ? 'Pendaftaran sudah dikirim.' : 'Akunmu sudah siap.'}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
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
      <div className="rounded-md border border-zinc-800 bg-zinc-900/55 p-5 shadow-2xl shadow-black/20 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-brand-300">Buat akun baru</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-white">Bergabung dengan dicukur.in</h1>
          </div>
          <span className="shrink-0 text-xs text-zinc-600">{step} / 3</span>
        </div>

        <ol className="mt-7 grid grid-cols-3 gap-2" aria-label="Progres registrasi">
          {stepLabels.map((label, index) => {
            const number = index + 1;
            const active = step === number;
            const done = step > number;
            return (
              <li key={label}>
                <div className={`h-1 rounded-full ${done || active ? 'bg-brand-400' : 'bg-zinc-800'}`} />
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
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Kamu akan menggunakan dicukur.in sebagai apa?</h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Jenis akun">
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
                            'min-h-32 rounded-md border p-4 text-left transition-colors',
                            selected
                              ? 'border-brand-400 bg-brand-400/10'
                              : 'border-zinc-800 bg-zinc-950/30 hover:border-zinc-700',
                          ].join(' ')}
                          onClick={() => selectAccountType(option.value)}
                        >
                          <Icon size={20} className={selected ? 'text-brand-300' : 'text-zinc-500'} />
                          <span className="mt-4 block text-xs font-semibold text-zinc-100">{option.title}</span>
                          <span className="mt-1 block text-[11px] leading-5 text-zinc-600">{option.description}</span>
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
                      <dl className="mt-5 divide-y divide-zinc-800 border-y border-zinc-800 text-xs">
                        <div className="flex justify-between gap-4 py-3">
                          <dt className="text-zinc-600">Jenis akun</dt>
                          <dd className="text-zinc-200">Pelanggan</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-3">
                          <dt className="text-zinc-600">Nama</dt>
                          <dd className="text-right text-zinc-200">{form.name}</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-3">
                          <dt className="text-zinc-600">Email</dt>
                          <dd className="text-right text-zinc-200">{form.email}</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-3">
                          <dt className="text-zinc-600">Telepon</dt>
                          <dd className="text-zinc-200">{form.phone}</dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  {form.accountType === 'barber' && (
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100">Profil layanan barber</h2>
                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <InputField
                          label="Pengalaman"
                          name="experienceYears"
                          type="number"
                          min="0"
                          max="60"
                          hint="Tahun"
                          value={form.experienceYears}
                          onChange={(event) => update('experienceYears', event.target.value)}
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
                      <div className="mt-5">
                        <TextareaField
                          label="Keahlian utama"
                          name="skillDescription"
                          placeholder="Contoh: classic cut, fade, beard grooming..."
                          value={form.skillDescription}
                          onChange={(event) => update('skillDescription', event.target.value)}
                          required
                        />
                      </div>
                      <PartnerAddressFields form={form} update={update} />
                    </div>
                  )}

                  {form.accountType === 'owner' && (
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100">Profil barbershop</h2>
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
                      <PartnerAddressFields form={form} update={update} showDistrict />
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
                      {form.accountType !== 'customer' && ' Data mitra akan diverifikasi oleh admin sebelum akun aktif.'}
                    </span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-zinc-800 pt-6">
            {step === 1 ? (
              <Link to="/login" className="text-xs font-medium text-zinc-600 hover:text-zinc-300">
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

interface PartnerAddressFieldsProps {
  form: RegistrationForm;
  showDistrict?: boolean;
  update: <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => void;
}

function PartnerAddressFields({ form, showDistrict = false, update }: PartnerAddressFieldsProps) {
  return (
    <div className="mt-5 space-y-5">
      <TextareaField
        label={showDistrict ? 'Alamat barbershop' : 'Alamat basis layanan'}
        name="address"
        placeholder="Nama jalan, nomor, dan detail lokasi"
        value={form.address}
        onChange={(event) => update('address', event.target.value)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {showDistrict && (
          <InputField
            label="Kecamatan"
            name="district"
            value={form.district}
            onChange={(event) => update('district', event.target.value)}
          />
        )}
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
        {showDistrict && (
          <InputField
            label="Kode pos"
            name="postalCode"
            value={form.postalCode}
            onChange={(event) => update('postalCode', event.target.value)}
          />
        )}
        {showDistrict && (
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
        )}
      </div>
    </div>
  );
}
