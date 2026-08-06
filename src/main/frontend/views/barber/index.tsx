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
          bgGradient: 'from-red-500/10 to-red-900/5',
          link: '/barber/bookings',
        },
        {
          label: 'Selesai Hari Ini',
          value: data.todayCompleted,
          desc: 'Layanan yang sudah dikerjakan',
          icon: CheckCircle2,
          color: '#22c55e',
          bgGradient: 'from-green-500/10 to-green-900/5',
          link: '/barber/history',
        },
        {
          label: 'Total Selesai',
          value: data.totalCompleted,
          desc: 'Riwayat semua pesanan',
          icon: TrendingUp,
          color: '#3b82f6',
          bgGradient: 'from-blue-500/10 to-blue-900/5',
          link: '/barber/history',
        },
        {
          label: 'Estimasi Pendapatan',
          value: `Rp ${Number(data.totalEarnings).toLocaleString('id-ID')}`,
          desc: 'Total dari booking selesai',
          icon: DollarSign,
          color: '#eab308',
          bgGradient: 'from-yellow-500/10 to-yellow-900/5',
          link: '/barber/history',
        },
        {
          label: 'Rating Rata-rata',
          value: Number(data.averageRating).toFixed(1),
          desc: 'Dari ulasan customer',
          icon: Star,
          color: '#f59e0b',
          bgGradient: 'from-amber-500/10 to-amber-900/5',
          link: '/barber/profile',
        },
      ]
    : [];

  return (
    <div>
      {/* Header with barber pole decorative accent */}
      <div className="relative mb-8">
        <div className="absolute -top-2 left-0 w-16 h-1 rounded-full"
          style={{ background: 'linear-gradient(90deg, #dc2626, #f8fafc, #2563eb)' }} />
        <h1 className="text-2xl font-bold text-zinc-100 mt-4 flex items-center gap-3">
          <Scissors size={24} className="text-brand-400" />
          Dashboard Barber
        </h1>
        <p className="text-zinc-400 mt-1">Kelola pesanan masuk, jadwal, dan riwayat pekerjaan Anda.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800/50" />
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
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className={`group relative overflow-hidden rounded-xl border border-zinc-800/60 bg-gradient-to-br ${card.bgGradient} p-5 text-left transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50 hover:-translate-y-0.5`}
                onClick={() => navigate(card.link)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-zinc-900/80 border border-zinc-800/60">
                    <Icon size={18} style={{ color: card.color }} />
                  </div>
                  <ArrowRight size={14} className="text-zinc-600 transition-all group-hover:text-zinc-400 group-hover:translate-x-1" />
                </div>
                <p className="text-2xl font-bold text-zinc-100 mb-1">{card.value}</p>
                <p className="text-xs font-semibold text-zinc-300 mb-0.5">{card.label}</p>
                <p className="text-[11px] text-zinc-500">{card.desc}</p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Lihat Pesanan Masuk', path: '/barber/bookings', icon: ClipboardList, accent: '#dc2626' },
            { label: 'Atur Jadwal Kerja', path: '/barber/schedule', icon: Clock, accent: '#3b82f6' },
            { label: 'Riwayat Pekerjaan', path: '/barber/history', icon: TrendingUp, accent: '#22c55e' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                type="button"
                className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-3.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-zinc-100"
                onClick={() => navigate(action.path)}
              >
                <Icon size={18} style={{ color: action.accent }} />
                <span>{action.label}</span>
                <ArrowRight size={14} className="ml-auto text-zinc-600" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
