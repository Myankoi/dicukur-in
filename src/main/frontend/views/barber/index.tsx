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
} from 'lucide-react';
import { BarberEndpoint } from '../../generated/endpoints.js';

interface DashboardData {
  pendingCount: number;
  todayCompleted: number;
  totalCompleted: number;
  totalEarnings: number;
  averageRating: number;
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function BarberDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BarberEndpoint.getDashboardSummary()
      .then((res: any) => {
        setData({
          pendingCount: res?.pendingCount ?? 0,
          todayCompleted: res?.todayCompleted ?? 0,
          totalCompleted: res?.totalCompleted ?? 0,
          totalEarnings: res?.totalEarnings ?? 0,
          averageRating: res?.averageRating ?? 0,
        });
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

  const cards = data
    ? [
        {
          label: 'Pesanan Masuk',
          value: data.pendingCount,
          desc: 'Menunggu konfirmasi',
          icon: ClipboardList,
          color: '#dc2626',
          bgGradient: 'bg-red-50/60 border-red-200',
          link: '/barber/bookings',
        },
        {
          label: 'Selesai Hari Ini',
          value: data.todayCompleted,
          desc: 'Layanan selesai hari ini',
          icon: CheckCircle2,
          color: '#16a34a',
          bgGradient: 'bg-emerald-50/60 border-emerald-200',
          link: '/barber/history',
        },
        {
          label: 'Total Selesai',
          value: data.totalCompleted,
          desc: 'Riwayat semua pesanan',
          icon: TrendingUp,
          color: '#2563eb',
          bgGradient: 'bg-blue-50/60 border-blue-200',
          link: '/barber/history',
        },
        {
          label: 'Estimasi Pendapatan',
          value: `Rp ${Number(data.totalEarnings).toLocaleString('id-ID')}`,
          desc: 'Total booking selesai',
          icon: DollarSign,
          color: '#d97706',
          bgGradient: 'bg-amber-50/60 border-amber-200',
          link: '/barber/history',
        },
        {
          label: 'Rating Rata-rata',
          value: Number(data.averageRating).toFixed(1),
          desc: 'Ulasan dari customer',
          icon: Star,
          color: '#d97706',
          bgGradient: 'bg-amber-50/60 border-amber-200',
          link: '/barber/profile',
        },
      ]
    : [];

  return (
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
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
                transition={{ delay: i * 0.06, duration: 0.2 }}
                className={`group relative overflow-hidden rounded-xl border bg-white p-5 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${card.bgGradient}`}
                onClick={() => navigate(card.link)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-white border border-slate-200 shadow-xs">
                    <Icon size={18} style={{ color: card.color }} />
                  </div>
                  <ArrowRight size={14} className="text-slate-400 transition-all group-hover:text-blue-600 group-hover:translate-x-1" />
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
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Lihat Pesanan Masuk', path: '/barber/bookings', icon: ClipboardList, accent: 'border-l-4 border-l-red-600', iconColor: 'text-red-600' },
            { label: 'Atur Jadwal Kerja', path: '/barber/schedule', icon: Clock, accent: 'border-l-4 border-l-blue-600', iconColor: 'text-blue-600' },
            { label: 'Riwayat Pekerjaan', path: '/barber/history', icon: TrendingUp, accent: 'border-l-4 border-l-emerald-600', iconColor: 'text-emerald-600' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                type="button"
                className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 transition-all hover:border-slate-300 hover:shadow-md ${action.accent}`}
                onClick={() => navigate(action.path)}
              >
                <Icon size={18} className={action.iconColor} />
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
