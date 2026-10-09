import React from 'react';
import { ShelterOrHospital, Incident } from '../../types/disaster';
import {
  Building2,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  Navigation,
} from 'lucide-react';

interface ResourceAllocationViewProps {
  facilities: ShelterOrHospital[];
  incidents: Incident[];
  onRouteFacilityToIncident: (facility: ShelterOrHospital, incident: Incident) => void;
}

export const ResourceAllocationView: React.FC<ResourceAllocationViewProps> = ({
  facilities,
  incidents,
  onRouteFacilityToIncident,
}) => {
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalOccupied = facilities.reduce((sum, f) => sum + f.occupied, 0);
  const availableBeds = totalCapacity - totalOccupied;

  return (
    <div className="space-y-4">
      {/* Top Facility KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="hud-panel p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Designated Facilities</span>
          <span className="text-2xl font-bold font-heading text-slate-100">{facilities.length}</span>
          <span className="text-[10px] text-cyan-300 font-mono mt-1 block">Hospitals & Evacuation Hubs</span>
        </div>

        <div className="hud-panel p-3.5 rounded-xl border-emerald-500/30">
          <span className="text-[10px] font-mono text-emerald-300 block uppercase">Available Surge Capacity</span>
          <span className="text-2xl font-bold font-heading text-emerald-100">{availableBeds}</span>
          <span className="text-[10px] text-emerald-300/80 font-mono mt-1 block">Unoccupied emergency beds</span>
        </div>

        <div className="hud-panel p-3.5 rounded-xl border-amber-500/30">
          <span className="text-[10px] font-mono text-amber-300 block uppercase">Current Sheltered Persons</span>
          <span className="text-2xl font-bold font-heading text-amber-100">{totalOccupied}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">In 6 municipal sectors</span>
        </div>

        <div className="hud-panel p-3.5 rounded-xl border-cyan-500/30">
          <span className="text-[10px] font-mono text-cyan-300 block uppercase">Overall Occupancy Rate</span>
          <span className="text-2xl font-bold font-heading text-cyan-100">
            {((totalOccupied / totalCapacity) * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Status: Moderate Load</span>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {facilities.map((fac) => {
          const occPercent = Math.round((fac.occupied / fac.capacity) * 100);
          const isNearCap = occPercent >= 80;

          return (
            <div
              key={fac.id}
              className="hud-panel p-4 rounded-xl flex flex-col justify-between hover:border-cyan-500/50 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-slate-100 leading-snug">
                        {fac.name}
                      </h4>
                      <span className="text-[10px] text-cyan-400 font-mono uppercase">
                        {fac.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                      isNearCap
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {fac.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 my-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{fac.location.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{fac.contact}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Capacity Occupancy:</span>
                    <span className={isNearCap ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                      {fac.occupied} / {fac.capacity} ({occPercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isNearCap ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${occPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Operational
                </span>

                {incidents.length > 0 && (
                  <button
                    onClick={() => onRouteFacilityToIncident(fac, incidents[0])}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono transition flex items-center gap-1 border border-cyan-500/30"
                  >
                    <Navigation className="w-3 h-3 text-cyan-400" />
                    Route to Priority Incident
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
