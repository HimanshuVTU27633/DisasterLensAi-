import React from 'react';
import {
  AlertTriangle,
  Calendar,
  MapPin,
  Users,
  Activity,
  Layers,
  Flame,
  ShieldAlert,
  Coins,
  CheckCircle,
} from 'lucide-react';
import { HistoricalDisasterIncident } from '../../data/historicalDisastersIndia';

interface HistoricalIncidentModalProps {
  incident: HistoricalDisasterIncident | null;
  onClose: () => void;
  onFlyTo: (coords: { lat: number; lng: number }) => void;
}

export const HistoricalIncidentModal: React.FC<HistoricalIncidentModalProps> = ({
  incident,
  onClose,
  onFlyTo,
}) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100">
        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-orange-950/50 p-4 border-b border-cyan-500/30 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  {incident.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    incident.severity === 'critical'
                      ? 'bg-red-950/90 text-red-300 border border-red-500/40'
                      : incident.severity === 'high'
                      ? 'bg-orange-950/90 text-orange-300 border border-orange-500/40'
                      : 'bg-amber-950/90 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {incident.severity} Severity
                </span>
                <span className="text-[10px] text-slate-400">
                  Risk Score: {incident.riskScore}/100
                </span>
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-100 leading-snug">
                {incident.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-3.5 text-xs">
          {/* Location and Date */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Location</span>
                <span className="text-slate-200 font-bold truncate block">
                  {incident.location.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Occurred</span>
                <span className="text-slate-200 font-bold block">
                  {new Date(incident.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Historical Incident Debrief:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {incident.description}
            </p>
          </div>

          {/* Macro Corridor & Impact Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Casualties</span>
              <span className="text-red-400 font-bold text-sm flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {incident.casualties}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Displaced</span>
              <span className="text-orange-400 font-bold text-sm">
                {incident.displaced.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Econ Impact</span>
              <span className="text-cyan-400 font-bold text-sm">
                {incident.economicImpact}
              </span>
            </div>
          </div>

          {/* Zone Badge */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px]">
            <span className="text-slate-400">Risk Corridor:</span>
            <span className="text-cyan-300 font-bold">{incident.zone}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            ID: {incident.id} • Lat: {incident.location.lat.toFixed(3)}, Lng: {incident.location.lng.toFixed(3)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onFlyTo(incident.location);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-900/40"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Center on Map</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
