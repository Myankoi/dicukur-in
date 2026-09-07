import { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { AdminAuditEndpoint } from '../../generated/endpoints.js';
import { Button } from '../../components/ui/Button.js';

interface AuditLog {
  id?: number;
  adminName?: string;
  action?: string;
  targetType?: string;
  targetId?: number;
  details?: string;
  createdAt?: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await AdminAuditEndpoint.getRecent();
      setLogs((result ?? []).filter(Boolean) as AuditLog[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Log aktivitas gagal dimuat');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">Kontrol & keamanan</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-slate-900">Log Aktivitas Admin</h1>
          <p className="mt-1 text-sm text-slate-600">Riwayat intervensi operasional, verifikasi, refund, dan perubahan partner.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading} className="min-h-11 bg-white">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">Memuat log aktivitas...</div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          <Activity size={28} className="mx-auto mb-3 text-slate-400" /> Belum ada aktivitas admin.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600"><Activity size={16} /></span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">{log.action} · {log.targetType}{log.targetId ? ' #' + log.targetId : ''}</p>
                    <p className="mt-1 break-words text-[11px] text-slate-600">{log.details || 'Tidak ada catatan tambahan'}</p>
                  </div>
                </div>
                <div className="shrink-0 text-left text-[10px] text-slate-500 sm:text-right">
                  <p className="font-bold text-slate-700">{log.adminName || 'Admin'}</p>
                  <p className="mt-0.5">{log.createdAt ? new Date(log.createdAt).toLocaleString('id-ID') : '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
