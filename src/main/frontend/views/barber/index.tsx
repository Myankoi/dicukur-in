import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  Star,
  DollarSign,
  ArrowRight,
  Clock,
  Scissors,
  Store,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { BarberEndpoint } from '../../generated/endpoints.js';

interface DashboardData {
  pendingCount: number;
  todayCompleted: number;
  totalCompleted: number;
  totalEarnings: number;
  averageRating: number;
}

interface BarberProfileInfo {
  name: string;
  barbershopName?: string;
  barbershopAddress?: string;
  verificationStatus?: string;
  availabilityStatus?: string;
}

const WORKPLACE_PHOTOS = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80',
];

export default function BarberDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<BarberProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    Promise.all([
      BarberEndpoint.getDashboardSummary(),
      BarberEndpoint.getMyProfile(),
    ])
      .then(([res, prof]: [any, any]) => {
        setData({
          pendingCount: res?.pendingCount ?? 0,
          todayCompleted: res?.todayCompleted ?? 0,
          totalCompleted: res?.totalCompleted ?? 0,
          totalEarnings: res?.totalEarnings ?? 0,
          averageRating: res?.averageRating ?? 0,
        });
        if (prof) {
          setProfile({
            name: prof.name,
            barbershopName: prof.barbershopName,
            barbershopAddress: prof.barbershopAddress,
            verificationStatus: prof.verificationStatus,
            availabilityStatus: prof.availabilityStatus,
          });
        }
      })
      .catch(() => {
        setData({
          pendingCount: 0,
          todayCompleted: 0,
          totalCompleted: 0,
          totalEarnings: 0,
          averageRating: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % WORKPLACE_PHOTOS.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + WORKPLACE_PHOTOS.length) % WORKPLACE_PHOTOS.length);
  };

  const cards = data
    ? [
        {
          label: 'Pesanan Masuk',
          value: data.pendingCount,
          desc: 'Menunggu konfirmasi',
          icon: ClipboardList,
<<<<<<< HEAD
          iconBg: 'bg-red-50 text-red-600 border-red-200',
=======
          color: '#dc2626',
          bgGradient: 'bg-red-50/60 border-red-200',
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
          link: '/barber/bookings',
        },
        {
          label: 'Selesai Hari Ini',
          value: data.todayCompleted,
          desc: 'Layanan selesai hari ini',
          icon: CheckCircle2,
<<<<<<< HEAD
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
=======
          color: '#16a34a',
          bgGradient: 'bg-emerald-50/60 border-emerald-200',
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
          link: '/barber/history',
        },
        {
          label: 'Total Selesai',
          value: data.totalCompleted,
          desc: 'Riwayat semua pesanan',
          icon: TrendingUp,
<<<<<<< HEAD
          iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
=======
          color: '#2563eb',
          bgGradient: 'bg-blue-50/60 border-blue-200',
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
          link: '/barber/history',
        },
        {
          label: 'Estimasi Pendapatan',
          value: `Rp ${Number(data.totalEarnings).toLocaleString('id-ID')}`,
          desc: 'Total booking selesai',
          icon: DollarSign,
<<<<<<< HEAD
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
=======
          color: '#d97706',
          bgGradient: 'bg-amber-50/60 border-amber-200',
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
          link: '/barber/history',
        },
        {
          label: 'Rating Rata-rata',
          value: Number(data.averageRating).toFixed(1),
          desc: 'Ulasan dari customer',
          icon: Star,
<<<<<<< HEAD
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
=======
          color: '#d97706',
          bgGradient: 'bg-amber-50/60 border-amber-200',
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
          link: '/barber/profile',
        },
      ]
    : [];

  return (
<<<<<<< HEAD
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-3 font-display">
          <Scissors size={24} className="text-red-600" />
          Dashboard Barber
        </h1>
        <p className="text-slate-600 mt-1 text-sm">Kelola pesanan masuk, jadwal, dan unit tempat Anda bekerja.</p>
=======
    <div className="space-y-8">
      {/* Header with barber pole decorative accent */}
      <div className="relative">
        <div
          className="absolute -top-3 left-0 w-20 h-1.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #dc2626 0%, #ffffff 50%, #2563eb 100%)' }}
        />
        <h1 className="text-2xl font-bold text-slate-900 mt-4 flex items-center gap-3">
          <Scissors size={24} className="text-red-600" />
          Dashboard Barber Mitra
        </h1>
        <p className="text-slate-500 text-sm mt-1">Kelola pesanan masuk, atur jadwal kerja, dan pantau performa layananmu.</p>
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
      </div>

      {/* Barbershop Workplace Info Card with Photo Carousel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Info */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                <Store size={14} /> Mitra Barbershop Tempat Kerja
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <ShieldCheck size={14} /> Terverifikasi
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-900">
              {profile?.barbershopName || 'Crown Barbershop Executive'}
            </h2>

            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
              <MapPin size={16} className="text-red-600 shrink-0" />
              <span>{profile?.barbershopAddress || 'Jl. Raya Utama No. 12, Senopati, Jakarta Selatan'}</span>
            </p>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Anda terdaftar secara resmi sebagai tim staf barber profesional di unit ini. Seluruh pesanan masuk dari pelanggan di area jangkauan toko akan diteruskan ke dashboard Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/barber/profile')}
              className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 transition"
            >
              <span>Kelola Base & Profil Barber</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Side Workplace Carousel */}
        <div className="relative h-48 lg:h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900 group">
          <img
            src={WORKPLACE_PHOTOS[currentSlide]}
            alt="Tempat Kerja Barbershop"
            className="h-full w-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

          {/* Carousel Arrow Controls */}
          <button
            type="button"
            onClick={handlePrevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-slate-900/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition hover:bg-slate-900"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-slate-900/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition hover:bg-slate-900"
          >
            <ChevronRight size={16} />
          </button>

          {/* Carousel Indicator Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-auto">
            {WORKPLACE_PHOTOS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === i ? 'w-5 bg-red-600' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
<<<<<<< HEAD
            <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200 animate-pulse shadow-sm" />
=======
            <div key={i} className="h-36 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.label}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5"
                onClick={() => navigate(card.link)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`grid size-10 place-items-center rounded-xl border ${card.iconBg}`}>
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={14} className="text-slate-400 transition-all group-hover:text-red-600 group-hover:translate-x-1" />
=======
                transition={{ delay: i * 0.06, duration: 0.2 }}
                className={`group relative overflow-hidden rounded-xl border bg-white p-5 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${card.bgGradient}`}
                onClick={() => navigate(card.link)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-white border border-slate-200 shadow-xs">
                    <Icon size={18} style={{ color: card.color }} />
                  </div>
                  <ArrowRight size={14} className="text-slate-400 transition-all group-hover:text-blue-600 group-hover:translate-x-1" />
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{card.value}</p>
                <p className="text-xs font-bold text-slate-800 mb-0.5">{card.label}</p>
                <p className="text-[11px] text-slate-500">{card.desc}</p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
<<<<<<< HEAD
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Lihat Pesanan Masuk', path: '/barber/bookings', icon: ClipboardList, color: 'text-red-600 bg-red-50 border-red-200' },
            { label: 'Atur Jadwal Kerja', path: '/barber/schedule', icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'Riwayat Pekerjaan', path: '/barber/history', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
=======
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Lihat Pesanan Masuk', path: '/barber/bookings', icon: ClipboardList, accent: 'border-l-4 border-l-red-600', iconColor: 'text-red-600' },
            { label: 'Atur Jadwal Kerja', path: '/barber/schedule', icon: Clock, accent: 'border-l-4 border-l-blue-600', iconColor: 'text-blue-600' },
            { label: 'Riwayat Pekerjaan', path: '/barber/history', icon: TrendingUp, accent: 'border-l-4 border-l-emerald-600', iconColor: 'text-emerald-600' },
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                type="button"
<<<<<<< HEAD
                className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-900 shadow-sm transition-all hover:border-red-300 hover:shadow-md hover:-translate-y-0.5"
                onClick={() => navigate(action.path)}
              >
                <div className={`grid size-9 place-items-center rounded-xl border ${action.color}`}>
                  <Icon size={18} />
                </div>
=======
                className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 transition-all hover:border-slate-300 hover:shadow-md ${action.accent}`}
                onClick={() => navigate(action.path)}
              >
                <Icon size={18} className={action.iconColor} />
>>>>>>> 37106706632accb6dd0c5a3b6c17edaa31627ce8
                <span>{action.label}</span>
                <ArrowRight size={14} className="ml-auto text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
