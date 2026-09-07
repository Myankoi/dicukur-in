import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { TrackingEndpoint } from '../generated/endpoints.js';
import { LiveTrackingMap } from '../components/LiveTrackingMap.js';

interface TrackingData {
  bookingId?: number; bookingCode?: string; status?: string; paymentStatus?: string;
  customerAddress?: string; customerLatitude?: number; customerLongitude?: number;
  barberLatitude?: number; barberLongitude?: number; barberAccuracy?: number;
  locationUpdatedAt?: string; barberName?: string; barberPhone?: string;
}

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!id) return;
    try { setTracking((await TrackingEndpoint.getTracking(Number(id))) as TrackingData); setError(''); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Tracking gagal dimuat'); }
  }, [id]);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 5000); return () => window.clearInterval(timer); }, [load]);

  if (error) return <div className="grid h-dvh place-items-center bg-slate-950 p-6 text-center"><div><p className="text-sm font-bold text-white">{error}</p><button type="button" onClick={() => navigate(-1)} className="mt-4 min-h-11 rounded-xl bg-white px-4 text-xs font-bold text-slate-900">Kembali</button></div></div>;
  if (!tracking || tracking.customerLatitude == null || tracking.customerLongitude == null) return <div className="grid h-dvh place-items-center bg-slate-950 text-white"><Loader2 className="animate-spin" /></div>;
  return <div className="h-dvh bg-slate-950"><LiveTrackingMap fullPage customerLat={tracking.customerLatitude} customerLng={tracking.customerLongitude} customerAddress={tracking.customerAddress} barberLat={tracking.barberLatitude} barberLng={tracking.barberLongitude} barberName={tracking.barberName || 'Barber'} barberPhone={tracking.barberPhone} phoneLabel="Hubungi Barber" status={tracking.status || 'accepted'} /><button type="button" onClick={() => navigate(-1)} className="fixed left-5 top-5 z-[60] grid size-11 place-items-center rounded-full bg-white/95 text-slate-800 shadow-lg" aria-label="Kembali"><ArrowLeft size={18} /></button></div>;
}
