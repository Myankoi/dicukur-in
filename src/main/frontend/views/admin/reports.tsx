import { useEffect, useState, useCallback } from 'react';
import {
  ChartNoAxesCombined,
  DollarSign,
  RefreshCw,
  Scissors,
  Star,
  Users,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';
import { AdminMonitoringEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';
import type AdminReportResponse from '../../generated/com/dicukur/app/admin/dto/AdminReportResponse.js';

export default function AdminReportsPage() {
  const [report, setReport] = useState<AdminReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminMonitoringEndpoint.getReportSummary();
      setReport(data ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  if (loading) {
    return <div className="py-16 text-center text-xs text-zinc-500">Memuat data laporan executive...</div>;
  }

  if (!report) {
    return <div className="py-16 text-center text-xs text-red-400">Gagal memuat laporan.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Analistik & Kinerja</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-zinc-100">
            Laporan Executive Platform
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Ringkasan pendapatan, konversi transaksi cukur, serta performa layanan tiap barber.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => void loadReport()} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Segarkan Laporan
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-zinc-900 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-emerald-400">Total Pendapatan</p>
            <DollarSign size={20} className="text-emerald-400" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-zinc-100">
            Rp {(report.totalRevenue ?? 0).toLocaleString('id-ID')}
          </p>
          <p className="mt-1 text-[11px] text-emerald-300/80">Dari transaksi booking selesai</p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-zinc-900 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-blue-400">Booking Selesai</p>
            <CheckCircle2 size={20} className="text-blue-400" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-zinc-100">{report.completedBookings}</p>
          <p className="mt-1 text-[11px] text-blue-300/80">vs {report.cancelledBookings} dibatalkan</p>
        </div>

        <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-zinc-900 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-brand-400">Total Mitra Barber</p>
            <Scissors size={20} className="text-brand-400" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-zinc-100">{report.totalBarbers}</p>
          <p className="mt-1 text-[11px] text-brand-300/80">{report.totalBarbershops} unit barbershop</p>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-zinc-900 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-purple-400">Pengguna Terdaftar</p>
            <Users size={20} className="text-purple-400" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-zinc-100">{report.totalUsers}</p>
          <p className="mt-1 text-[11px] text-purple-300/80">Customer & Barber active</p>
        </div>
      </div>

      {/* Barber Performance Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-4">
        <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <ChartNoAxesCombined size={18} className="text-brand-400" /> Performa Barber & Ulasan Customer
        </h2>

        {report.topBarbers?.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">Belum ada data performa barber.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] font-bold">
                  <th className="pb-3 pl-2">Nama Barber</th>
                  <th className="pb-3">Barbershop</th>
                  <th className="pb-3 text-center">Total Janji</th>
                  <th className="pb-3 text-center">Selesai</th>
                  <th className="pb-3 text-right">Pendapatan</th>
                  <th className="pb-3 text-right pr-2">Rating Rata-Rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {report.topBarbers?.map((b) => {
                  if (!b) return null;
                  return (
                  <tr key={b.barberId} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 pl-2 font-semibold text-zinc-200">{b.barberName}</td>
                    <td className="py-3 text-zinc-400">{b.barbershopName}</td>
                    <td className="py-3 text-center font-bold text-zinc-300">{b.totalBookings}</td>
                    <td className="py-3 text-center font-bold text-emerald-400">{b.completedBookings}</td>
                    <td className="py-3 text-right font-bold text-brand-300">
                      Rp {(b.totalRevenue ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400 justify-end">
                        <Star size={14} className="fill-amber-400" />
                        {(b.averageRating ?? 0).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
