import { useEffect, useState, useCallback } from 'react';
import {
  ChartNoAxesCombined,
  DollarSign,
  RefreshCw,
  Scissors,
  Star,
  Users,
  CheckCircle2,
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
    return <div className="py-16 text-center text-xs font-medium text-slate-500 rounded-2xl border border-slate-200 bg-white">Memuat data laporan executive...</div>;
  }

  if (!report) {
    return <div className="py-16 text-center text-xs font-medium text-red-600 rounded-2xl border border-red-200 bg-red-50">Gagal memuat laporan.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Laporan Executive Platform
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ringkasan pendapatan, konversi transaksi cukur, serta performa layanan tiap barber.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => void loadReport()} disabled={loading} className="bg-white border-slate-300 text-slate-700">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Segarkan Laporan
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-emerald-700">Total Pendapatan</p>
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-slate-900">
            Rp {(report.totalRevenue ?? 0).toLocaleString('id-ID')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Dari transaksi booking selesai</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-blue-700">Booking Selesai</p>
            <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-slate-900">{report.completedBookings}</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">vs {report.cancelledBookings} dibatalkan</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-red-700">Total Mitra Barber</p>
            <div className="grid size-9 place-items-center rounded-xl bg-red-50 text-red-600">
              <Scissors size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-slate-900">{report.totalBarbers}</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">{report.totalBarbershops} unit barbershop</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-purple-700">Pengguna Terdaftar</p>
            <div className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-slate-900">{report.totalUsers}</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Customer & Barber aktif</p>
        </div>
      </div>

      {/* Barber Performance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ChartNoAxesCombined size={18} className="text-red-600" /> Performa Barber & Ulasan Customer
        </h2>

        {report.topBarbers?.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Belum ada data performa barber.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="pb-3 pl-2">Nama Barber</th>
                  <th className="pb-3">Barbershop</th>
                  <th className="pb-3 text-center">Total Janji</th>
                  <th className="pb-3 text-center">Selesai</th>
                  <th className="pb-3 text-right">Pendapatan</th>
                  <th className="pb-3 text-right pr-2">Rating Rata-Rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.topBarbers?.map((b) => {
                  if (!b) return null;
                  return (
                  <tr key={b.barberId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-900">{b.barberName}</td>
                    <td className="py-3 text-slate-600">{b.barbershopName}</td>
                    <td className="py-3 text-center font-bold text-slate-700">{b.totalBookings}</td>
                    <td className="py-3 text-center font-bold text-emerald-600">{b.completedBookings}</td>
                    <td className="py-3 text-right font-bold text-red-600">
                      Rp {(b.totalRevenue ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 justify-end">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
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
