import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Plus,
  Trash2,
  Save,
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

  const grouped = new Map<number, ScheduleItem[]>();
  for (const s of schedules) {
    const list = grouped.get(s.dayOfWeek) || [];
    list.push(s);
    grouped.set(s.dayOfWeek, list);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 font-display">
          <Clock size={24} className="text-red-600" />
          Jadwal & Hari Libur Barber
        </h1>
        <p className="text-slate-600 mt-1 text-sm">Atur jam operasional keberangkatan dan waktu istirahat Anda.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm w-fit">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('schedule')}
        >
          <span className="flex items-center gap-2"><Calendar size={14} /> Jadwal Mingguan</span>
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'timeoff'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('timeoff')}
        >
          <span className="flex items-center gap-2"><CalendarOff size={14} /> Hari Libur</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="size-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jadwal Kerja Mingguan</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                  onClick={() => openScheduleForm()}
                >
                  <Plus size={14} /> Tambah Jadwal
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <Calendar size={32} className="text-slate-400 mb-3" />
                  <p className="text-slate-900 font-bold text-sm">Belum ada jadwal</p>
                  <p className="text-slate-500 text-xs mt-1">Tambahkan jadwal kerja mingguan Anda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const daySchedules = grouped.get(day) || [];
                    return (
                      <div key={day} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                          <p className="text-xs font-bold text-slate-900">{DAY_NAMES[day]}</p>
                        </div>
                        <div className="p-3 space-y-2 min-h-[60px]">
                          {daySchedules.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Libur</p>
                          ) : (
                            daySchedules.map((s) => (
                              <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
                                <div className="flex items-center gap-2">
                                  <Clock size={13} className="text-red-600" />
                                  <span className="text-xs text-slate-900 font-bold">{s.startTime} - {s.endTime}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {s.status === 'active' ? 'Aktif' : 'Off'}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <button type="button" className="grid size-7 place-items-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-200 transition"
                                    onClick={() => openScheduleForm(s)}>
                                    <Save size={13} />
                                  </button>
                                  <button type="button" className="grid size-7 place-items-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-200 transition"
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hari Libur / Time Off</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                  onClick={() => { clearMessages(); setShowTimeOffForm(true); }}
                >
                  <Plus size={14} /> Tambah Libur
                </button>
              </div>

              {timeOffs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <CalendarOff size={32} className="text-slate-400 mb-3" />
                  <p className="text-slate-900 font-bold text-sm">Belum ada hari libur</p>
                  <p className="text-slate-500 text-xs mt-1">Tambahkan waktu libur jika Anda tidak tersedia</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timeOffs.map((to, i) => (
                    <motion.div
                      key={to.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarOff size={16} className="text-red-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{formatDatetime(to.startDatetime)}</p>
                          <p className="text-xs text-slate-500">sampai {formatDatetime(to.endDatetime)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="sch-day" className="block text-xs font-bold text-slate-700 mb-1">Hari</label>
                  <select id="sch-day" value={schDay} onChange={(e) => setSchDay(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none">
                    {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="sch-start" className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
                    <input id="sch-start" type="time" value={schStart} onChange={(e) => setSchStart(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="sch-end" className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
                    <input id="sch-end" type="time" value={schEnd} onChange={(e) => setSchEnd(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="sch-status" className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select id="sch-status" value={schStatus} onChange={(e) => setSchStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none">
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowScheduleForm(false)}>
                  Batal
                </button>
                <button type="button" disabled={processing}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  onClick={handleSaveSchedule}>
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Time Off Form Dialog */}
      <AnimatePresence>
        {showTimeOffForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Tambah Hari Libur</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="to-start" className="block text-xs font-bold text-slate-700 mb-1">Mulai Libur</label>
                  <input id="to-start" type="datetime-local" value={toStart} onChange={(e) => setToStart(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="to-end" className="block text-xs font-bold text-slate-700 mb-1">Selesai Libur</label>
                  <input id="to-end" type="datetime-local" value={toEnd} onChange={(e) => setToEnd(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowTimeOffForm(false)}>
                  Batal
                </button>
                <button type="button" disabled={processing}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  onClick={handleSaveTimeOff}>
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <CalendarOff size={16} />}
                  Tambah Libur
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
