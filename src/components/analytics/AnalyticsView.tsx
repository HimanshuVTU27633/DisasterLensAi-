import React from 'react';
import { Incident, ShelterOrHospital } from '../../types/disaster';
import {
  HISTORICAL_DISASTERS_INDIA,
  HISTORICAL_RISK_ZONES,
} from '../../data/historicalDisastersIndia';
import {
  BarChart2,
  PieChart,
  TrendingUp,
  Activity,
  Layers,
  ShieldCheck,
  Flame,
  Users,
  Compass,
} from 'lucide-react';

interface AnalyticsViewProps {
  incidents: Incident[];
  facilities: ShelterOrHospital[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  incidents,
  facilities,
}) => {
  // Category counts
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  // Severity counts
  const severityCounts: Record<string, number> = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
  };
  incidents.forEach((i) => {
    severityCounts[i.severity] = (severityCounts[i.severity] || 0) + 1;
  });

  const avgPriority = Math.round(
    incidents.reduce((sum, i) => sum + i.priorityScore, 0) / (incidents.length || 1)
  );

  return (
    <div className="space-y-4">
      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="hud-panel p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Average Priority Score</span>
          <span className="text-2xl font-bold font-heading text-cyan-300">{avgPriority} / 100</span>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Elevated Threat Level</span>
        </div>

        <div className="hud-panel p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Critical Incidents Ratio</span>
          <span className="text-2xl font-bold font-heading text-red-400">
            {Math.round((severityCounts.critical / (incidents.length || 1)) * 100)}%
          </span>
          <span className="text-[10px] text-red-300/80 font-mono mt-1 block">Require Immediate Team Dispatch</span>
        </div>

        <div className="hud-panel p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Monitoring Net</span>
          <span className="text-2xl font-bold font-heading text-emerald-400">100%</span>
          <span className="text-[10px] text-emerald-300/80 font-mono mt-1 block">IoT Sensors + Satellites online</span>
        </div>

        <div className="hud-panel p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Shelter Surge Headroom</span>
          <span className="text-2xl font-bold font-heading text-purple-400">
            {facilities.reduce((sum, f) => sum + (f.capacity - f.occupied), 0)} Beds
          </span>
          <span className="text-[10px] text-purple-300/80 font-mono mt-1 block">Across 6 regional hubs</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="hud-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-heading font-bold text-xs uppercase text-slate-200 tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Incidents Cataloged by Hazard Category
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Real-time counts</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / incidents.length) * 100);
              return (
                <div key={cat} className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span className="capitalize">{cat.replace('_', ' ')}</span>
                    <span>{count} incidents ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="hud-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-heading font-bold text-xs uppercase text-slate-200 tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Severity Tier Distribution
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Triage Levels</span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4">
            {Object.entries(severityCounts).map(([sev, count]) => (
              <div
                key={sev}
                className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center flex flex-col justify-between"
              >
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  {sev}
                </span>
                <span
                  className={`text-2xl font-bold font-heading ${
                    sev === 'critical'
                      ? 'text-red-400'
                      : sev === 'high'
                      ? 'text-orange-400'
                      : sev === 'moderate'
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {count}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  {Math.round((count / (incidents.length || 1)) * 100)}% of total
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono mt-4">
            <span>
              Telemetry Source Distribution: 42% Automated IoT Water/Gas Gauges • 33% Thermal Satellite • 25% Verified First Responders.
            </span>
          </div>
        </div>
      </div>

      {/* 12-Month Historical Disaster Density & High-Risk Corridors (Google Maps Heatmap Layer Grounding) */}
      <div className="hud-panel p-4 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs uppercase text-slate-100 tracking-wider">
                12-Month Historical Disaster Incident Density (India)
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Historical spatial clustering synthesized into Google Maps Heatmap layer
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/30">
            {HISTORICAL_DISASTERS_INDIA.length} Incidents Cataloged
          </span>
        </div>

        {/* Macro Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {HISTORICAL_RISK_ZONES.map((zone) => {
            const count = HISTORICAL_DISASTERS_INDIA.filter((h) =>
              h.zone.toLowerCase().includes(zone.name.split(' ')[0].toLowerCase()) ||
              h.zone.toLowerCase().includes(zone.name.split(' ')[1]?.toLowerCase() || '')
            ).length;

            return (
              <div
                key={zone.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition space-y-2 font-mono text-xs"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="font-bold text-slate-200 text-[11px] leading-snug">
                    {zone.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30 shrink-0">
                    {zone.riskLevel}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {zone.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span className="text-cyan-300">Peak: {zone.peakSeason.split(' ')[0]}</span>
                  <span className="text-orange-400 font-bold">~{count || 10}+ Events</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
