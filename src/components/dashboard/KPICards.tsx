import React from 'react';
import {
  Flame,
  AlertTriangle,
  BellRing,
  Truck,
  Users,
  TrendingUp,
} from 'lucide-react';

interface KPICardsProps {
  totalIncidents: number;
  criticalIncidents: number;
  activeAlerts: number;
  deployedUnits: number;
  populationAtRisk: number;
  onFilterCritical?: () => void;
  onFilterAlerts?: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  totalIncidents,
  criticalIncidents,
  activeAlerts,
  deployedUnits,
  populationAtRisk,
  onFilterCritical,
  onFilterAlerts,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {/* 1. Active Incidents */}
      <div className="hud-panel p-3 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-cyan-400/50 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">Active Incidents</span>
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-heading text-slate-100">{totalIncidents}</span>
          <span className="text-[10px] text-emerald-400 flex items-center font-mono">
            <TrendingUp className="w-3 h-3 mr-0.5" /> LIVE
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 truncate">Sensors Monitored</span>
      </div>

      {/* 2. Critical Emergencies */}
      <div
        onClick={onFilterCritical}
        className="hud-panel-critical p-3 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-red-400/80 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between text-red-300 mb-1">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold">Critical Threat</span>
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-heading text-red-100 group-hover:scale-105 transition-transform">
            {criticalIncidents}
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/30 text-red-200 uppercase">
            IMMEDIATE
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-red-300/80 mt-1 truncate">Score &gt; 85</span>
      </div>

      {/* 3. Active Alerts */}
      <div
        onClick={onFilterAlerts}
        className="hud-panel p-3 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-amber-400/50 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">Active Alerts</span>
          <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-heading text-slate-100 group-hover:scale-105 transition-transform">
            {activeAlerts}
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-amber-400">Broadcasting</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 truncate">Multilingual</span>
      </div>

      {/* 4. Responders Deployed */}
      <div className="hud-panel p-3 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-cyan-400/50 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">Response Teams</span>
          <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-heading text-slate-100">{deployedUnits}</span>
          <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400">Deployed</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 truncate">SAR & Hazmat</span>
      </div>

      {/* 5. Population At Risk */}
      <div className="col-span-2 sm:col-span-1 hud-panel p-3 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-purple-400/50 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">Est. Population</span>
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-heading text-slate-100">
            {populationAtRisk.toLocaleString()}
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-purple-300">In Danger Zone</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 truncate">Evacuation active</span>
      </div>
    </div>
  );
};
