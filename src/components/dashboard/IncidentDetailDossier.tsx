import React, { useState } from 'react';
import { Incident, ShelterOrHospital, IncidentStatus } from '../../types/disaster';
import {
  X,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  BrainCircuit,
  Navigation,
  Send,
  Users,
  CheckCircle,
  Truck,
  ExternalLink,
  Info,
} from 'lucide-react';

interface IncidentDetailDossierProps {
  incident: Incident;
  onClose: () => void;
  facilities: ShelterOrHospital[];
  onRouteToFacility: (facility: ShelterOrHospital) => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus) => void;
  onProposeAlertFromIncident: (incident: Incident) => void;
}

export const IncidentDetailDossier: React.FC<IncidentDetailDossierProps> = ({
  incident,
  onClose,
  facilities,
  onRouteToFacility,
  onUpdateStatus,
  onProposeAlertFromIncident,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || '');
  const [assignedTeamInput, setAssignedTeamInput] = useState<string>('');
  const [assignedTeams, setAssignedTeams] = useState<string[]>(incident.assignedTeams || []);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTeamInput.trim()) return;
    setAssignedTeams([...assignedTeams, assignedTeamInput.trim()]);
    setAssignedTeamInput('');
  };

  const handleRouteClick = () => {
    const fac = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];
    if (fac) {
      onRouteToFacility(fac);
    }
  };

  const pb = incident.priorityBreakdown;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl bg-[#080d1a]/98 backdrop-blur-xl border-l border-cyan-500/30 shadow-2xl flex flex-col text-slate-100 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Dossier Header */}
        <div className="p-3 sm:p-4 border-b border-cyan-500/20 bg-slate-900/60 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                {incident.id}
              </span>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                incident.severity === 'critical'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              }`}>
                {incident.severity}
              </span>
              <span className="text-[10px] text-slate-400 font-mono capitalize">
                {incident.category}
              </span>
            </div>
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-100 leading-tight">
              {incident.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
            title="Close Dossier"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Dossier Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Incident Photographic Evidence */}
        {incident.imageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-48 group">
            <img
              src={incident.imageUrl}
              alt={incident.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200 font-mono">
              <span>PHOTO TELEMETRY SOURCE: {incident.verificationSource.toUpperCase()}</span>
              {incident.verified && (
                <span className="flex items-center text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> VERIFIED
                </span>
              )}
            </div>
          </div>
        )}

        {/* Location & Time Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-cyan-400" /> COORDINATES
            </span>
            <p className="text-slate-200 truncate">{incident.location.name}</p>
            <p className="text-[10px] text-cyan-300 mt-0.5">
              {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-cyan-400" /> REPORTED TIME
            </span>
            <p className="text-slate-200">
              {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              By: {incident.reportedBy}
            </p>
          </div>
        </div>

        {/* Tactical Situation Description */}
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Citizen / Field Dispatch Summary
          </span>
          <p className="text-slate-300 leading-relaxed">{incident.description}</p>
        </div>

        {/* AI Multimodal Intelligence Assessment */}
        <div className="hud-panel p-3.5 rounded-xl border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-cyan-300">
                Gemini Multimodal Forensic Assessment
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
              CONFIDENCE {incident.aiAnalysis.confidenceScore}%
            </span>
          </div>

          <p className="text-xs text-slate-200 italic leading-relaxed">
            "{incident.aiAnalysis.summary}"
          </p>

          {/* Transparent Multi-Factor Priority Breakdown */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-cyan-300 font-bold">TOTAL PRIORITY SCORE</span>
              <span className="text-lg font-heading font-bold text-cyan-400">
                {incident.priorityScore} / 100
              </span>
            </div>

            {/* Score bars */}
            <div className="space-y-1.5 text-[10px] font-mono text-slate-300">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Severity Potential (max 30)</span>
                  <span>{pb.severityScore} pts</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(pb.severityScore / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Population Exposure (max 25)</span>
                  <span>{pb.exposureScore} pts</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${(pb.exposureScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Vulnerability & Demographics (max 15)</span>
                  <span>{pb.vulnerabilityScore} pts</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(pb.vulnerabilityScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Critical Infrastructure Threat (max 15)</span>
                  <span>{pb.infrastructureScore} pts</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(pb.infrastructureScore / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Threats */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 block mb-1">
              Imminent Life & Infrastructure Threats
            </span>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {incident.aiAnalysis.keyThreats.map((t, idx) => (
                <li key={idx} className="leading-tight">{t}</li>
              ))}
            </ul>
          </div>

          {/* Uncertainties & Missing Info */}
          {incident.aiAnalysis.uncertainties.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-lg text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block mb-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-400" /> Operational Uncertainties & Data Gaps
              </span>
              <ul className="space-y-0.5 text-[11px] text-amber-100/90 list-disc list-inside">
                {incident.aiAnalysis.uncertainties.map((u, idx) => (
                  <li key={idx}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Next Actions */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 block mb-1">
              Recommended Tactical Actions
            </span>
            <ul className="space-y-1 text-xs text-slate-300 list-decimal list-inside">
              {incident.aiAnalysis.recommendedNextActions.map((act, idx) => (
                <li key={idx} className="leading-tight">{act}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Evacuation Routing To Facility */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Navigation className="w-4 h-4 text-cyan-400" />
              Tactical Evacuation Corridor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="flex-1 bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.type}) - Cap: {fac.capacity - fac.occupied}
                </option>
              ))}
            </select>
            <button
              onClick={handleRouteClick}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 shadow-lg shadow-cyan-900/30"
            >
              Route
            </button>
          </div>
        </div>

        {/* Assigned Response Squads */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Tactical Units Assigned
          </span>
          <div className="flex flex-wrap gap-1.5">
            {assignedTeams.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No units assigned yet</span>
            ) : (
              assignedTeams.map((team, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-200 border border-blue-500/40 text-[10px] font-mono flex items-center gap-1"
                >
                  <Truck className="w-3 h-3 text-cyan-400" />
                  {team}
                </span>
              ))
            )}
          </div>
          <form onSubmit={handleAddTeam} className="flex gap-1.5 mt-2">
            <input
              type="text"
              placeholder="Assign team (e.g. Engine 14, SAR Unit 3)..."
              value={assignedTeamInput}
              onChange={(e) => setAssignedTeamInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300"
            >
              Assign
            </button>
          </form>
        </div>
      </div>

      {/* Dossier Bottom Action Bar */}
      <div className="p-3 border-t border-cyan-500/20 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400">STATUS:</span>
          <select
            value={incident.status}
            onChange={(e) => onUpdateStatus(incident.id, e.target.value as IncidentStatus)}
            className="bg-slate-950 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 capitalize font-mono"
          >
            <option value="reported">Reported</option>
            <option value="investigating">Investigating</option>
            <option value="responder_assigned">Responder Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <button
          onClick={() => onProposeAlertFromIncident(incident)}
          className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-heading font-bold tracking-wider shadow-lg shadow-red-900/30 flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          PROPOSE EMERGENCY ALERT
        </button>
      </div>
    </div>
    </>
  );
};
