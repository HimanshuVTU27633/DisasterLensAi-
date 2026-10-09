import React from 'react';
import { Incident } from '../../types/disaster';
import {
  AlertTriangle,
  ArrowRight,
  Flame,
  Wind,
  Droplets,
  Zap,
  Activity,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface RankedQueueProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onQuickRouteToNearest?: (incident: Incident) => void;
}

export const RankedQueue: React.FC<RankedQueueProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onQuickRouteToNearest,
}) => {
  // Sort incidents by AI Priority Score descending
  const sorted = [...incidents].sort((a, b) => b.priorityScore - a.priorityScore);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'flood':
        return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
      case 'wildfire':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'cyclone':
      case 'severe_storm':
        return <Wind className="w-3.5 h-3.5 text-cyan-400" />;
      case 'infrastructure':
      case 'industrial':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="hud-panel rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-100">
            Ranked Emergency Queue
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          AI MULTI-FACTOR SORT
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1.5">
        {sorted.map((incident, idx) => {
          const isSelected = selectedIncident?.id === incident.id;
          const isCritical = incident.severity === 'critical';
          const isHigh = incident.severity === 'high';

          return (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              className={`p-2.5 rounded-lg transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                    #{idx + 1}
                  </span>
                  <div className="p-1 rounded bg-slate-950/60 border border-slate-800">
                    {getCategoryIcon(incident.category)}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 truncate">
                    {incident.title}
                  </h4>
                </div>

                {/* Priority Score Gauge */}
                <div
                  className={`shrink-0 px-2 py-0.5 rounded text-xs font-mono font-bold border flex items-center gap-1 ${
                    isCritical
                      ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      : isHigh
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                      : incident.severity === 'moderate'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  }`}
                  title={`AI Priority Score: ${incident.priorityScore}/100`}
                >
                  <span className="text-[10px]">PRIORITY</span>
                  <span>{incident.priorityScore}</span>
                </div>
              </div>

              {/* Location & Status Line */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span className="truncate max-w-[200px]">{incident.location.name}</span>
                <span className="capitalize text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {incident.status.replace('_', ' ')}
                </span>
              </div>

              {/* Action buttons on card hover/selection */}
              {isSelected && (
                <div className="mt-2.5 pt-2 border-t border-cyan-500/30 flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300 text-[10px] font-mono">
                    Exposure: {incident.priorityBreakdown.exposureScore}/25 pts
                  </span>
                  <div className="flex items-center gap-1.5">
                    {onQuickRouteToNearest && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickRouteToNearest(incident);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/40 text-[10px] font-mono transition"
                      >
                        Plan Corridor
                      </button>
                    )}
                    <span className="text-cyan-400 text-[10px] font-mono flex items-center">
                      Viewing Dossier <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
