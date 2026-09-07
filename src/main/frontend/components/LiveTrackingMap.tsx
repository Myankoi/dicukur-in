import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Phone, ShieldCheck, Car, LocateFixed, Maximize2, Minimize2 } from 'lucide-react';

interface LiveTrackingMapProps {
  customerLat: number;
  customerLng: number;
  customerAddress?: string;
  barberLat?: number;
  barberLng?: number;
  barberName: string;
  barberPhone?: string;
  phoneLabel?: string;
  status: string;
  fullPage?: boolean;
}

// Calculate Haversine distance in KM
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LiveTrackingMap({
  customerLat,
  customerLng,
  customerAddress,
  barberLat,
  barberLng,
  barberName,
  barberPhone,
  phoneLabel,
  status,
  fullPage = false,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const barberMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const isUserMovedRef = useRef<boolean>(false);
  const hasInitialFitRef = useRef<boolean>(false);

  const [hasUserMoved, setHasUserMoved] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [roadInfo, setRoadInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);

  const hasBarberPosition = Number.isFinite(barberLat) && Number.isFinite(barberLng) && barberLat !== 0 && barberLng !== 0;
  const bLat = hasBarberPosition ? barberLat! : customerLat;
  const bLng = hasBarberPosition ? barberLng! : customerLng;

  const fallbackDistance = getDistanceKm(bLat, bLng, customerLat, customerLng);
  const fallbackEta = Math.max(1, Math.round((fallbackDistance / 30) * 60));

  const currentDistance = roadInfo ? roadInfo.distanceKm : fallbackDistance;
  const etaMinutes = roadInfo ? roadInfo.durationMin : fallbackEta;

  // Helper function to create or update markers with Leaflet native pixel-anchoring (remains 100% accurate across all zoom levels)
  const renderOrUpdateMarkers = (map: L.Map, cLat = customerLat, cLng = customerLng, brbLat = bLat, brbLng = bLng) => {
    const shortAddress = customerAddress ? customerAddress.split(',')[0] : 'Lokasi Anda';

    // Customer Pin Icon: 220px width, 75px height -> iconAnchor: [110, 75] places bottom needle tip exactly on lat/lng at ALL zoom levels
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `<div style="width: 220px; height: 75px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: auto;">
              <div style="background-color: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155; white-space: nowrap; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span>🏠</span>
                <span style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; color: #f8fafc;">${shortAddress}</span>
              </div>
              <div style="width: 38px; height: 38px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(37,99,235,0.5); border: 3px solid #ffffff; flex-shrink: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563eb; margin-top: -2px; flex-shrink: 0;"></div>
            </div>`,
      iconSize: [220, 75],
      iconAnchor: [110, 75],
    });

    if (!customerMarkerRef.current) {
      customerMarkerRef.current = L.marker([cLat, cLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>Lokasi Pemesanan Anda</b><br/>${customerAddress || '-'}`);
    } else {
      customerMarkerRef.current.setIcon(customerIcon);
      customerMarkerRef.current.setLatLng([cLat, cLng]);
    }

    const barberMarkerLabel = status === 'on_the_way'
      ? `${barberName} (Sedang OTW)`
      : status === 'arrived'
        ? `${barberName} (Sudah Tiba)`
        : `${barberName} (Titik Awal Barber)`;

    // Barber Pin Icon: 240px width, 75px height -> iconAnchor: [120, 75] places bottom needle tip exactly on lat/lng at ALL zoom levels
    const barberIcon = L.divIcon({
      className: 'custom-barber-pin',
      html: `<div style="width: 240px; height: 75px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: auto;">
              <div style="background-color: #dc2626; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); border: 1px solid #f87171; white-space: nowrap; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span>💈</span>
                <span>${barberMarkerLabel}</span>
              </div>
              <div style="position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <div style="width: 42px; height: 42px; background: linear-gradient(135deg, #dc2626, #e11d48); color: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(220,38,38,0.6); border: 3px solid #ffffff; font-size: 22px;">
                  💈
                </div>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #dc2626; margin-top: -2px; flex-shrink: 0;"></div>
            </div>`,
      iconSize: [240, 75],
      iconAnchor: [120, 75],
    });

    if (!hasBarberPosition) {
      barberMarkerRef.current?.removeFrom(map);
      barberMarkerRef.current = null;
      return;
    }
    if (!barberMarkerRef.current) {
      barberMarkerRef.current = L.marker([brbLat, brbLng], { icon: barberIcon })
        .addTo(map)
        .bindPopup(`<b>${barberName}</b><br/>${status === 'on_the_way' ? 'Barber sedang dalam perjalanan' : 'Titik awal/base barber'}`);
    } else {
      barberMarkerRef.current.setIcon(barberIcon);
      barberMarkerRef.current.setLatLng([brbLat, brbLng]);
    }
  };

  // 1. Initialize Map Instance ONCE on component mount
  useEffect(() => {
    if (!mapRef.current) return;

    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([customerLat, customerLng], 14);

      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps',
      }).addTo(map);

      // Detect user manual pan/zoom interactions
      map.on('dragstart zoomstart', () => {
        isUserMovedRef.current = true;
        setHasUserMoved(true);
      });

      mapInstanceRef.current = map;

      // IMMEDIATELY render markers when map is created
      renderOrUpdateMarkers(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      customerMarkerRef.current = null;
      barberMarkerRef.current = null;
      polylineRef.current = null;
      hasInitialFitRef.current = false;
      isUserMovedRef.current = false;
    };
  }, []);

  // 2. Update Customer & Barber Markers whenever props/coordinates update
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderOrUpdateMarkers(mapInstanceRef.current);
    }
  }, [customerLat, customerLng, customerAddress, bLat, bLng, barberName, hasBarberPosition]);

  // 3. Fetch OSRM Driving Route & snap markers exactly to route start/end points
  useEffect(() => {
    let active = true;
    const fetchRoadRoute = async () => {
      if (!hasBarberPosition) {
        setRoadInfo(null);
        if (polylineRef.current && mapInstanceRef.current) polylineRef.current.removeFrom(mapInstanceRef.current);
        polylineRef.current = null;
        return;
      }
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${bLng},${bLat};${customerLng},${customerLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data.routes && data.routes.length > 0 && active && mapInstanceRef.current) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);

          if (!polylineRef.current) {
            polylineRef.current = L.polyline(coords, { color: '#2563eb', weight: 5, opacity: 0.85 }).addTo(
              mapInstanceRef.current
            );
          } else {
            polylineRef.current.setLatLngs(coords);
          }

          const distKm = route.distance / 1000;
          const durMin = Math.max(1, Math.round(route.duration / 60));
          setRoadInfo({ distanceKm: distKm, durationMin: durMin });

          // ONLY fit bounds ONCE on initial load if user has not panned/zoomed
          if (!hasInitialFitRef.current && !isUserMovedRef.current) {
            hasInitialFitRef.current = true;
            const bounds = L.latLngBounds(coords);
            mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55] });
          }
        }
      } catch (err) {
        console.warn('OSRM routing fallback:', err);
      }
    };

    void fetchRoadRoute();
    return () => {
      active = false;
    };
  }, [bLat, bLng, customerLat, customerLng, hasBarberPosition]);

  const handleRecenter = () => {
    isUserMovedRef.current = false;
    setHasUserMoved(false);

    if (mapInstanceRef.current) {
      if (polylineRef.current) {
        const latLngs = polylineRef.current.getLatLngs() as L.LatLng[];
        if (latLngs.length > 0) {
          mapInstanceRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [55, 55] });
          return;
        }
      }
      const bounds = L.latLngBounds([[customerLat, customerLng], [bLat, bLng]]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55] });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  };

  return (
    <>
      {/* Dark overlay backdrop when fullscreen */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          onClick={toggleFullscreen}
        />
      )}

      <div
        className={`${fullPage ? 'fixed inset-0 z-50 flex h-dvh flex-col rounded-none border-0 p-3 sm:p-5' : 'rounded-2xl border border-slate-200 p-5'} bg-white shadow-sm space-y-4 transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-4 sm:inset-10 z-50 flex flex-col justify-between shadow-2xl border-slate-300 bg-white'
            : 'w-full'
        }`}
      >
        {/* Realtime Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Car size={20} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  {status === 'on_the_way'
                    ? 'Barber Sedang OTW Menuju Lokasi'
                    : status === 'arrived'
                      ? 'Barber Telah Tiba di Lokasi'
                      : 'Titik Awal Barber'}
                </p>
              </div>
              <p className="text-xs text-blue-700 font-medium mt-0.5">
                Jarak: <span className="font-bold">{currentDistance.toFixed(1)} km</span> · Estimasi tiba dalam{' '}
                <span className="font-bold text-blue-900">{etaMinutes} menit</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {barberPhone && (
              <a
                href={`https://wa.me/${barberPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
              >
                <Phone size={14} /> {phoneLabel || 'Hubungi Barber'}
              </a>
            )}
            {!fullPage && <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
              title={isFullscreen ? 'Kecilkan Peta' : 'Perbesar Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="hidden sm:inline">{isFullscreen ? 'Kecilkan' : 'Full Screen'}</span>
            </button>}
          </div>
        </div>

        {/* Interactive Map (Expanded Height: h-[440px] by default, flex-1 when fullscreen) */}
        <div
          className={`relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner transition-all ${
            fullPage || isFullscreen ? 'flex-1 min-h-0' : 'h-80 sm:h-[440px]'
          }`}
        >
          <div ref={mapRef} className="h-full w-full z-0" />

          {/* Floating Recenter Button (shows when user panned/zoomed) */}
          {hasUserMoved && (
            <button
              type="button"
              onClick={handleRecenter}
              className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-lg backdrop-blur border border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all animate-in fade-in zoom-in"
            >
              <LocateFixed size={14} className="text-blue-600 animate-pulse" />
              Fokus Peta (Recenter)
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-blue-600" />
            Dilindungi Sistem Live Geolocation dicukur.in
          </span>
          {!hasBarberPosition && <span className="text-amber-700">Menunggu lokasi GPS barber</span>}
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${bLat},${bLng}&destination=${customerLat},${customerLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Navigation size={12} /> Buka di Maps
          </a>
        </div>
      </div>
    </>
  );
}
