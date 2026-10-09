import React, { useState, useEffect, useRef } from 'react';
import { Incident } from '../../types/disaster';
import {
  Radio,
  Compass,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  Maximize2,
  Volume2,
  VolumeX,
  Target,
  RefreshCw,
} from 'lucide-react';

interface RadarStation {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  maxRangeKm: number;
  frequency: string;
}

const RADAR_STATIONS: RadarStation[] = [
  {
    id: 'DWR-BOM',
    name: 'IMD Doppler Radar Colaba (Mumbai)',
    location: 'Mumbai, Maharashtra',
    lat: 18.9067,
    lng: 72.8147,
    maxRangeKm: 400,
    frequency: '2.8 GHz (S-Band)',
  },
  {
    id: 'DWR-DEL',
    name: 'IMD Doppler Radar Palam (Delhi NCR)',
    location: 'New Delhi',
    lat: 28.5665,
    lng: 77.1031,
    maxRangeKm: 400,
    frequency: '5.6 GHz (C-Band)',
  },
  {
    id: 'DWR-PDP',
    name: 'IMD Coastal Radar Paradip (Odisha)',
    location: 'Paradip Port, Odisha',
    lat: 20.2644,
    lng: 86.6713,
    maxRangeKm: 500,
    frequency: '2.7 GHz (S-Band Cyclone)',
  },
  {
    id: 'DWR-KOC',
    name: 'IMD Doppler Radar Kochi (Kerala & Western Ghats)',
    location: 'Kochi / Wayanad Ridge',
    lat: 9.9312,
    lng: 76.2673,
    maxRangeKm: 400,
    frequency: '5.6 GHz (C-Band)',
  },
  {
    id: 'DWR-GHY',
    name: 'IMD Doppler Radar Guwahati (Assam Valley)',
    location: 'Guwahati, Assam',
    lat: 26.1064,
    lng: 91.5859,
    maxRangeKm: 400,
    frequency: '5.6 GHz (C-Band)',
  },
];

type RadarMode = 'precipitation' | 'wind_shear' | 'sar_flood' | 'seismic';

interface RadarSystemProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onFlyToCoordinates?: (coords: { lat: number; lng: number; zoom?: number }) => void;
}

export const RadarSystem: React.FC<RadarSystemProps> = ({
  incidents,
  onSelectIncident,
  onFlyToCoordinates,
}) => {
  const [selectedStation, setSelectedStation] = useState<RadarStation>(RADAR_STATIONS[0]);
  const [mode, setMode] = useState<RadarMode>('precipitation');
  const [sweepAngle, setSweepAngle] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [selectedBlip, setSelectedBlip] = useState<any | null>(null);

  // Animation frame for rotating radar beam
  useEffect(() => {
    let animId: number;
    let angle = 0;

    const animate = () => {
      if (isScanning) {
        angle = (angle + 1.2) % 360;
        setSweepAngle(angle);
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isScanning]);

  // Compute distance and bearing from selected radar station to each incident
  const calculatePolarCoordinates = (
    stationLat: number,
    stationLng: number,
    targetLat: number,
    targetLng: number
  ) => {
    // Haversine distance in km
    const R = 6371;
    const dLat = ((targetLat - stationLat) * Math.PI) / 180;
    const dLng = ((targetLng - stationLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((stationLat * Math.PI) / 180) *
        Math.cos((targetLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Bearing in degrees (0 to 360)
    const y = Math.sin(dLng) * Math.cos((targetLat * Math.PI) / 180);
    const x =
      Math.cos((stationLat * Math.PI) / 180) * Math.sin((targetLat * Math.PI) / 180) -
      Math.sin((stationLat * Math.PI) / 180) *
        Math.cos((targetLat * Math.PI) / 180) *
        Math.cos(dLng);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    return { distanceKm, bearing };
  };

  const detectedEchoes = incidents
    .map((inc) => {
      const { distanceKm, bearing } = calculatePolarCoordinates(
        selectedStation.lat,
        selectedStation.lng,
        inc.location.lat,
        inc.location.lng
      );
      // Normalized radius percentage for radar screen (0 to 100%)
      const normalizedRadius = Math.min((distanceKm / selectedStation.maxRangeKm) * 100, 100);
      const inRange = distanceKm <= selectedStation.maxRangeKm;

      // Simulated dBZ based on priority and category
      const dBZ = Math.min(Math.round(20 + inc.priorityScore * 0.45), 65);

      return {
        incident: inc,
        distanceKm: Math.round(distanceKm),
        bearing: Math.round(bearing),
        normalizedRadius,
        inRange,
        dBZ,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="space-y-4">
      {/* Station Selector & Radar Telemetry Bar */}
      <div className="hud-panel p-3 sm:p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
            <div>
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-100">
                IMD Doppler Weather Radar
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono block">
                {selectedStation.frequency} • {selectedStation.maxRangeKm} KM
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Station Selector Dropdown */}
          <select
            value={selectedStation.id}
            onChange={(e) => {
              const st = RADAR_STATIONS.find((s) => s.id === e.target.value);
              if (st) {
                setSelectedStation(st);
                onFlyToCoordinates?.({ lat: st.lat, lng: st.lng, zoom: 11 });
              }
            }}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
          >
            {RADAR_STATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scan Mode Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto max-w-full">
          {[
            { id: 'precipitation', label: 'Rain (dBZ)' },
            { id: 'wind_shear', label: 'Cyclone' },
            { id: 'sar_flood', label: 'SAR Flood' },
            { id: 'seismic', label: 'Seismic' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as RadarMode)}
              className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-mono transition whitespace-nowrap shrink-0 ${
                mode === m.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Radar Screen & Target Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* 2/3 Radar Scope Display */}
        <div className="lg:col-span-2 hud-panel p-2.5 sm:p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden min-h-[400px] sm:min-h-[500px]">
          {/* Subtle Grid scan background */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Compass Rose Header */}
          <div className="absolute top-2 sm:top-3 left-2.5 sm:left-4 right-2.5 sm:right-4 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-cyan-400 z-10 pointer-events-none">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              AZIMUTH: {Math.round(sweepAngle)}°
            </span>
            <span className="text-emerald-400 animate-pulse hidden xs:inline">
              ● 360° SWEEP
            </span>
            <span>0–{selectedStation.maxRangeKm} KM</span>
          </div>

          {/* Circular Radar Scope Screen */}
          <div className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[440px] sm:h-[440px] max-w-[85vw] max-h-[85vw] rounded-full border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-[#040812]/90 flex items-center justify-center overflow-hidden my-4 sm:my-6">
            {/* Range Rings: 25%, 50%, 75%, 100% */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 pointer-events-none" />
            <div className="absolute w-3/4 h-3/4 rounded-full border border-dashed border-cyan-500/25 pointer-events-none" />
            <div className="absolute w-1/2 h-1/2 rounded-full border border-cyan-500/30 pointer-events-none" />
            <div className="absolute w-1/4 h-1/4 rounded-full border border-cyan-500/40 pointer-events-none" />

            {/* Crosshair Axes */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/25 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/25 pointer-events-none" />
            {/* Diagonal Grid Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-cyan-500/10 rotate-45" />
              <div className="w-full h-[1px] bg-cyan-500/10 -rotate-45" />
            </div>

            {/* Distance Labels */}
            <span className="absolute top-[28%] text-[9px] font-mono text-cyan-500/60 pointer-events-none">
              {Math.round(selectedStation.maxRangeKm * 0.5)} KM
            </span>
            <span className="absolute top-[15%] text-[9px] font-mono text-cyan-500/60 pointer-events-none">
              {Math.round(selectedStation.maxRangeKm * 0.75)} KM
            </span>
            <span className="absolute top-2 text-[9px] font-mono text-cyan-400 pointer-events-none font-bold">
              000° N
            </span>
            <span className="absolute bottom-2 text-[9px] font-mono text-cyan-400 pointer-events-none font-bold">
              180° S
            </span>
            <span className="absolute right-2 text-[9px] font-mono text-cyan-400 pointer-events-none font-bold">
              090° E
            </span>
            <span className="absolute left-2 text-[9px] font-mono text-cyan-400 pointer-events-none font-bold">
              270° W
            </span>

            {/* Center Radar Transmitter Node */}
            <div className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] z-20" />

            {/* Rotating Radar Sweep Cone & Beam */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `rotate(${sweepAngle}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {/* Sweep Line */}
              <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-gradient-to-t from-cyan-300 via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee]" />
              {/* Sweep Phosphor Gradient Cone */}
              <div
                className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
                style={{
                  background:
                    'conic-gradient(from 270deg at 0% 100%, rgba(6,182,212,0.35) 0deg, rgba(6,182,212,0.1) 45deg, transparent 60deg)',
                }}
              />
            </div>

            {/* Plotted Radar Echoes / Incident Blips */}
            {detectedEchoes.map((echo) => {
              if (!echo.inRange) return null;

              // Convert polar to Cartesian (angle 0 is North / straight up)
              // Angle in radians: subtract 90 deg so 0 is up
              const rad = ((echo.bearing - 90) * Math.PI) / 180;
              // Radius in percent of container radius (max 46% to stay inside ring)
              const rPct = (echo.normalizedRadius / 100) * 44;
              const xPct = 50 + rPct * Math.cos(rad);
              const yPct = 50 + rPct * Math.sin(rad);

              const isEchoUnderBeam =
                Math.abs((sweepAngle - echo.bearing + 360) % 360) < 30;

              const isCrit = echo.incident.severity === 'critical';

              return (
                <div
                  key={echo.incident.id}
                  onClick={() => {
                    setSelectedBlip(echo);
                    onSelectIncident(echo.incident);
                  }}
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-20 cursor-pointer group"
                >
                  {/* Radar Blip Circle */}
                  <div className="relative">
                    {/* Phosphor Flash when sweep passes */}
                    {isEchoUnderBeam && (
                      <div className="absolute -inset-2 rounded-full bg-cyan-400/40 animate-ping pointer-events-none" />
                    )}

                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                        isCrit
                          ? 'bg-red-600 border-red-300 shadow-[0_0_12px_#ef4444]'
                          : echo.incident.severity === 'high'
                          ? 'bg-orange-500 border-orange-300 shadow-[0_0_10px_#f97316]'
                          : 'bg-amber-500 border-amber-300 shadow-[0_0_8px_#f59e0b]'
                      } ${selectedBlip?.incident.id === echo.incident.id ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    {/* Quick Callout Tag */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-slate-900/95 border border-cyan-500/50 text-slate-100 p-2 rounded-lg text-[10px] whitespace-nowrap z-30 shadow-2xl pointer-events-none">
                      <span className="font-bold text-cyan-300">{echo.incident.title}</span>
                      <span className="text-slate-400">
                        {echo.distanceKm} km • {echo.bearing}° • {echo.dBZ} dBZ ({echo.incident.severity.toUpperCase()})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* dBZ Reflectivity Scale Bar */}
          <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 p-2 rounded-lg flex items-center justify-between text-[10px] font-mono mt-2">
            <span className="text-slate-400">REFLECTIVITY (dBZ):</span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200">15 (Light)</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-200">30 (Moderate)</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-200">45 (Heavy)</span>
              <span className="px-1.5 py-0.5 rounded bg-red-900/80 text-red-200">55+ (Cloudburst)</span>
            </div>
          </div>
        </div>

        {/* 1/3 Detected Radar Targets Panel */}
        <div className="hud-panel rounded-xl flex flex-col h-[520px] overflow-hidden">
          <div className="p-3.5 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <h4 className="font-heading font-bold text-xs uppercase text-slate-100 tracking-wider">
                Radar Contacts In Range
              </h4>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              {detectedEchoes.filter((e) => e.inRange).length} ACTIVE
            </span>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {detectedEchoes.map((echo) => {
              const isSelected = selectedBlip?.incident.id === echo.incident.id;

              return (
                <div
                  key={echo.incident.id}
                  onClick={() => {
                    setSelectedBlip(echo);
                    onSelectIncident(echo.incident);
                  }}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h5 className="text-xs font-semibold text-slate-100 truncate">
                      {echo.incident.title}
                    </h5>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                        echo.incident.severity === 'critical'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {echo.incident.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 truncate mb-2">
                    {echo.incident.location.name}
                  </p>

                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono bg-slate-950/70 p-1.5 rounded border border-slate-800/80 text-slate-300">
                    <div>
                      <span className="text-slate-500 block">RANGE</span>
                      <strong className="text-cyan-300">{echo.distanceKm} km</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">BEARING</span>
                      <strong className="text-cyan-300">{echo.bearing}°</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ECHO INT</span>
                      <strong className={echo.dBZ > 45 ? 'text-red-400' : 'text-amber-400'}>
                        {echo.dBZ} dBZ
                      </strong>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-1.5 border-t border-cyan-500/30 flex items-center justify-between text-[10px] font-mono text-cyan-300">
                      <span>Tracking Telemetry Locked</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(echo.incident);
                        }}
                        className="underline hover:text-white"
                      >
                        Inspect Full Dossier →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
