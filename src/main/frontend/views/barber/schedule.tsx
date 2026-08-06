import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Plus,
  Trash2,
  Save,
  X,
  CalendarOff,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { BarberEndpoint } from '../../generated/endpoints.js';

interface ScheduleItem {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  status: string;
}

interface TimeOffItem {
  id: number;
  startDatetime: string;
  endDatetime: string;
}

const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DAY_SHORT = ['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function BarberSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  // Schedule form
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [schDay, setSchDay] = useState(1);
  const [schStart, setSchStart] = useState('08:00');
  const [schEnd, setSchEnd] = useState('17:00');
  const [schStatus, setSchStatus] = useState('active');

  // Time off form
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [toStart, setToStart] = useState('');
  const [toEnd, setToEnd] = useState('');

  const [activeTab, setActiveTab] = useState<'schedule' | 'timeoff'>('schedule');

  const fetchAll = useCallback(async () => {
    try {
      const [sch, to] = await Promise.all([
        BarberEndpoint.getMySchedules(),
        BarberEndpoint.getMyTimeOffs(),
      ]);
      setSchedules((sch as ScheduleItem[]) || []);
      setTimeOffs((to as TimeOffItem[]) || []);
    } catch {
      setSchedules([]);
      setTimeOffs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const openScheduleForm = (item?: ScheduleItem) => {
    clearMessages();
    if (item) {
      setEditingSchedule(item);
      setSchDay(item.dayOfWeek);
      setSchStart(item.startTime);
      setSchEnd(item.endTime);
      setSchStatus(item.status);
    } else {
      setEditingSchedule(null);
      setSchDay(1);
      setSchStart('08:00');
      setSchEnd('17:00');
      setSchStatus('active');
    }
    setShowScheduleForm(true);
  };

  const handleSaveSchedule = async () => {
    clearMessages();
    setProcessing(true);
    try {
      await BarberEndpoint.saveSchedule({
        id: editingSchedule?.id ?? undefined,
        dayOfWeek: schDay,
        startTime: schStart,
        endTime: schEnd,
        status: schStatus,
      } as any);
      setShowScheduleForm(false);
      setSuccess('Jadwal berhasil disimpan');
      await fetchAll();
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan jadwal');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    clearMessages();
    setProcessing(true);
    try {
      await BarberEndpoint.deleteSchedule(id);
      setSuccess('Jadwal berhasil dihapus');
      await fetchAll();
    } catch (e: any) {
      setError(e?.message || 'Gagal menghapus jadwal');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveTimeOff = async () => {
    clearMessages();
    setProcessing(true);
    try {
      await BarberEndpoint.saveTimeOff({
        id: undefined,
        startDatetime: toStart,
        endDatetime: toEnd,
      } as any);
      setShowTimeOffForm(false);
      setToStart('');
      setToEnd('');
      setSuccess('Hari libur berhasil ditambahkan');
      await fetchAll();
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan hari libur');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteTimeOff = async (id: number) => {
    clearMessages();
    setProcessing(true);
    try {
      await BarberEndpoint.deleteTimeOff(id);
      setSuccess('Hari libur berhasil dihapus');
      await fetchAll();
    } catch (e: any) {
      setError(e?.message || 'Gagal menghapus hari libur');
    } finally {
      setProcessing(false);
    }
  };

  const formatDatetime = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return s; }
  };

  // Group schedules by day
  const grouped = new Map<number, ScheduleItem[]>();
  for (const s of schedules) {
    const list = grouped.get(s.dayOfWeek) || [];
    list.push(s);
    grouped.set(s.dayOfWeek, list);
  }

  return (
    <div>
      {/* Header */}
      <div className="relative mb-6">
        <div className="absolute -top-2 left-0 w-16 h-1 rounded-full"
          style={{ background: 'linear-gradient(90deg, #dc2626, #f8fafc, #2563eb)' }} />
        <h1 className="text-2xl font-bold text-zinc-100 mt-4 flex items-center gap-3">
          <Clock size={24} className="text-brand-400" />
          Jadwal & Hari Libur
        </h1>
        <p className="text-zinc-400 mt-1">Atur jadwal kerja mingguan dan hari libur Anda.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-zinc-900/50 border border-zinc-800/50 w-fit">
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'schedule'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setActiveTab('schedule')}
        >
          <span className="flex items-center gap-2"><Calendar size={14} /> Jadwal Mingguan</span>
        </button>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'timeoff'
              ? 'bg-barber-red/20 text-red-300 border border-red-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setActiveTab('timeoff')}
        >
          <span className="flex items-center gap-2"><CalendarOff size={14} /> Hari Libur</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800/50" />
          ))}
        </div>
      ) : (
        <>
          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Jadwal Kerja Mingguan</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-colors"
                  onClick={() => openScheduleForm()}
                >
                  <Plus size={14} /> Tambah Jadwal
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-zinc-800/50 bg-zinc-900/20">
                  <Calendar size={32} className="text-zinc-600 mb-3" />
                  <p className="text-zinc-400 font-medium">Belum ada jadwal</p>
                  <p className="text-zinc-500 text-sm mt-1">Tambahkan jadwal kerja mingguan Anda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const daySchedules = grouped.get(day) || [];
                    return (
                      <div key={day} className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-zinc-800/40 bg-zinc-900/50">
                          <p className="text-sm font-semibold text-zinc-200">{DAY_NAMES[day]}</p>
                        </div>
                        <div className="p-3 space-y-2 min-h-[60px]">
                          {daySchedules.length === 0 ? (
                            <p className="text-xs text-zinc-600 italic">Libur</p>
                          ) : (
                            daySchedules.map((s) => (
                              <div key={s.id} className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2 border border-zinc-800/30">
                                <div className="flex items-center gap-2">
                                  <Clock size={13} className="text-brand-400" />
                                  <span className="text-sm text-zinc-200 font-medium">{s.startTime} - {s.endTime}</span>
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                    s.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-zinc-700/50 text-zinc-500'
                                  }`}>
                                    {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <button type="button" className="grid size-7 place-items-center rounded text-zinc-500 hover:text-brand-300 hover:bg-zinc-800 transition-colors"
                                    onClick={() => openScheduleForm(s)}>
                                    <Save size={13} />
                                  </button>
                                  <button type="button" className="grid size-7 place-items-center rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                    onClick={() => handleDeleteSchedule(s.id)}>
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TIME OFF TAB */}
          {activeTab === 'timeoff' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Hari Libur / Time Off</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-barber-red px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                  onClick={() => { clearMessages(); setShowTimeOffForm(true); }}
                >
                  <Plus size={14} /> Tambah Libur
                </button>
              </div>

              {timeOffs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-zinc-800/50 bg-zinc-900/20">
                  <CalendarOff size={32} className="text-zinc-600 mb-3" />
                  <p className="text-zinc-400 font-medium">Belum ada hari libur</p>
                  <p className="text-zinc-500 text-sm mt-1">Tambahkan waktu libur jika Anda tidak tersedia</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timeOffs.map((to, i) => (
                    <motion.div
                      key={to.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarOff size={16} className="text-red-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{formatDatetime(to.startDatetime)}</p>
                          <p className="text-xs text-zinc-500">sampai {formatDatetime(to.endDatetime)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        onClick={() => handleDeleteTimeOff(to.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Schedule Form Dialog */}
      <AnimatePresence>
        {showScheduleForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-zinc-100 mb-4">{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="sch-day" className="block text-xs font-semibold text-zinc-400 mb-1.5">Hari</label>
                  <select id="sch-day" value={schDay} onChange={(e) => setSchDay(Number(e.target.value))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none">
                    {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="sch-start" className="block text-xs font-semibold text-zinc-400 mb-1.5">Jam Mulai</label>
                    <input id="sch-start" type="time" value={schStart} onChange={(e) => setSchStart(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="sch-end" className="block text-xs font-semibold text-zinc-400 mb-1.5">Jam Selesai</label>
                    <input id="sch-end" type="time" value={schEnd} onChange={(e) => setSchEnd(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="sch-status" className="block text-xs font-semibold text-zinc-400 mb-1.5">Status</label>
                  <select id="sch-status" value={schStatus} onChange={(e) => setSchStatus(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none">
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                  onClick={() => setShowScheduleForm(false)}>
                  Batal
                </button>
                <button type="button" disabled={processing}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                  onClick={handleSaveSchedule}>
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Off Form Dialog */}
      <AnimatePresence>
        {showTimeOffForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-zinc-100 mb-4">Tambah Hari Libur</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="to-start" className="block text-xs font-semibold text-zinc-400 mb-1.5">Mulai Libur</label>
                  <input id="to-start" type="datetime-local" value={toStart} onChange={(e) => setToStart(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="to-end" className="block text-xs font-semibold text-zinc-400 mb-1.5">Selesai Libur</label>
                  <input id="to-end" type="datetime-local" value={toEnd} onChange={(e) => setToEnd(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                  onClick={() => setShowTimeOffForm(false)}>
                  Batal
                </button>
                <button type="button" disabled={processing}
                  className="inline-flex items-center gap-2 rounded-lg bg-barber-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                  onClick={handleSaveTimeOff}>
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <CalendarOff size={16} />}
                  Tambah Libur
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
