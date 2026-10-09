import React from 'react';
import { Incident } from '../../types/disaster';
import {
  BrainCircuit,
  Sliders,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface PrioritizationMatrixViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const PrioritizationMatrixView: React.FC<PrioritizationMatrixViewProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const sorted = [...incidents].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-4">
      {/* Mathematical Model Header */}
      <div className="hud-panel p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider">
              Transparent Multi-Factor Prioritization Model
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Formula: P = S(0-30) + E(0-25) + V(0-15) + I(0-15) + A(0-10) + F(0-5)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-red-500/30">
            <span className="text-red-400 font-bold block text-[10px]">S: SEVERITY (30%)</span>
            <p className="text-slate-300 text-[11px] mt-0.5">Physical hazard scale, flood velocity, fire intensity</p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-orange-500/30">
            <span className="text-orange-400 font-bold block text-[10px]">E: EXPOSURE (25%)</span>
            <p className="text-slate-300 text-[11px] mt-0.5">Estimated population density within 1-2km buffer</p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/30">
            <span className="text-amber-400 font-bold block text-[10px]">V: VULNERABILITY (15%)</span>
            <p className="text-slate-300 text-[11px] mt-0.5">Elderly, schools, mobility-constrained residents</p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-purple-500/30">
            <span className="text-purple-400 font-bold block text-[10px]">I: INFRASTRUCTURE (15%)</span>
            <p className="text-slate-300 text-[11px] mt-0.5">Power stations, gas lines, transit tunnels, hospitals</p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-blue-500/30">
            <span className="text-blue-400 font-bold block text-[10px]">A: ACCESS (10%)</span>
            <p className="text-slate-300 text-[11px] mt-0.5">Road washouts, blocked arteries, transit bottlenecks</p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-cyan-500/30">
            <span className="text-cyan-400 font-bold block text-[10px]">F: FRESHNESS (5%)</span>
            <p className="text-slate-300 text-[11px] mt-0.5">Time decay and verification confidence reliability</p>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Human-in-the-Loop Governance:</strong> AI priority scores serve as automated decision-support rankings. First responder dispatch and official evacuations require command approval.
          </span>
        </div>
      </div>

      {/* Prioritization Matrix Table */}
      <div className="hud-panel rounded-xl overflow-hidden">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-heading font-bold text-xs uppercase text-slate-200 tracking-wider">
            Active Priority Assessment Table ({incidents.length} Records)
          </h4>
          <span className="text-[10px] font-mono text-cyan-400">Sorted by Rank Order</span>
        </div>

        {/* Mobile View: High-Density Tactical Cards */}
        <div className="md:hidden divide-y divide-slate-800/80 p-2 space-y-2">
          {sorted.map((inc, idx) => {
            const b = inc.priorityBreakdown;
            const isCritical = inc.severity === 'critical';

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/50 transition cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-white text-xs leading-snug">
                      {inc.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                      isCritical
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    }`}
                  >
                    {inc.priorityScore}/100
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>📍 {inc.location.name}</span>
                  <span className="capitalize text-cyan-300">{inc.category}</span>
                </div>

                {/* Score breakdown metrics bar */}
                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-800/80 text-[10px] font-mono">
                  <span className="text-red-300">Sev: {b.severityScore}/30</span>
                  <span className="text-orange-300">Exp: {b.exposureScore}/25</span>
                  <span className="text-amber-300">Vuln: {b.vulnerabilityScore}/15</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Assessment Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Rank & Incident</th>
                <th className="p-3">Category</th>
                <th className="p-3">Severity (30)</th>
                <th className="p-3">Exposure (25)</th>
                <th className="p-3">Vulnerability (15)</th>
                <th className="p-3">Infra (15)</th>
                <th className="p-3">Access (10)</th>
                <th className="p-3 text-right">Total Score</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {sorted.map((inc, idx) => {
                const b = inc.priorityBreakdown;
                const isCritical = inc.severity === 'critical';

                return (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-slate-900/60 cursor-pointer transition"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">#{idx + 1}</span>
                        <div>
                          <span className="font-semibold text-white block truncate max-w-xs">{inc.title}</span>
                          <span className="text-[10px] text-slate-400">{inc.location.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 capitalize text-cyan-300">
                      {inc.category}
                    </td>

                    <td className="p-3 text-red-300">{b.severityScore} pts</td>
                    <td className="p-3 text-orange-300">{b.exposureScore} pts</td>
                    <td className="p-3 text-amber-300">{b.vulnerabilityScore} pts</td>
                    <td className="p-3 text-purple-300">{b.infrastructureScore} pts</td>
                    <td className="p-3 text-blue-300">{b.accessConstraintsScore} pts</td>

                    <td className="p-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          isCritical
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        }`}
                      >
                        {inc.priorityScore} / 100
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(inc);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
