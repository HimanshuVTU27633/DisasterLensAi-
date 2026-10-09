import React, { useState } from 'react';
import {
  Incident,
  EmergencyAlert,
  ShelterOrHospital,
  NotificationItem,
} from '../../types/disaster';
import { DisasterMap } from '../map/DisasterMap';
import { RadarSystem } from '../radar/RadarSystem';
import {
  Radio,
  Map as MapIcon,
  BellRing,
  PhoneCall,
  PlusCircle,
  AlertTriangle,
  Flame,
  Droplets,
  Building2,
  Navigation,
  Send,
  Eye,
  Share2,
  Shield,
  ShieldAlert,
  Smartphone,
  MessageSquare,
} from 'lucide-react';

interface MobileAppViewProps {
  incidents: Incident[];
  alerts: EmergencyAlert[];
  facilities: ShelterOrHospital[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  onOpenReportModal: () => void;
  onOpenPhoneSender: (alert: EmergencyAlert) => void;
  activeRoute: any;
  onClearRoute: () => void;
  onOpenSirenModal?: () => void;
  isSirenActive?: boolean;
}

export type MobileTab = 'map' | 'radar' | 'incidents' | 'alerts' | 'helplines';

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  incidents,
  alerts,
  facilities,
  selectedIncident,
  onSelectIncident,
  onOpenReportModal,
  onOpenPhoneSender,
  activeRoute,
  onClearRoute,
  onOpenSirenModal,
  isSirenActive,
}) => {
  const [mobileTab, setMobileTab] = useState<MobileTab>('map');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [incidentSearchQuery, setIncidentSearchQuery] = useState<string>('');

  const filteredIncidents = incidents.filter((i) => {
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    if (incidentSearchQuery.trim()) {
      const q = incidentSearchQuery.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        i.location.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-[#060913] text-slate-100 overflow-hidden relative">
      {/* Mobile Top Sub-Header */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-cyan-500/20 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
            NDMA TACTICAL MOBILE
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Emergency Siren Button */}
          {onOpenSirenModal && (
            <button
              onClick={onOpenSirenModal}
              className={`p-1.5 rounded-lg border transition ${
                isSirenActive
                  ? 'bg-red-600 border-red-300 text-white animate-pulse shadow-[0_0_12px_#ef4444]'
                  : 'bg-red-950/80 border-red-500/50 text-red-400'
              }`}
              title="Emergency Evacuation Siren"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}

          {/* 1-Tap SOS Call 112 */}
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[11px] font-mono font-bold shadow-lg shadow-red-950 transition animate-pulse"
          >
            <PhoneCall className="w-3 h-3" />
            <span>SOS 112</span>
          </a>
        </div>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto relative min-h-0">
        {/* TAB 1: GOOGLE MAP */}
        {mobileTab === 'map' && (
          <div className="w-full h-full relative">
            <DisasterMap
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={onSelectIncident}
              facilities={facilities}
              activeRoute={activeRoute}
              onClearRoute={onClearRoute}
            />

            {/* Selected Incident Tactical Mini-Dossier Card on Map */}
            {selectedIncident && (
              <div className="absolute bottom-3 inset-x-3 z-20 bg-[#080d1a]/95 border border-cyan-400/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 text-xs font-mono">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        selectedIncident.severity === 'critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {selectedIncident.severity}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-400">
                      PRIORITY {selectedIncident.priorityScore}/100
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectIncident(null)}
                    className="text-slate-400 hover:text-white p-1 rounded"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>

                <h4 className="font-heading font-bold text-sm text-white truncate mb-0.5">
                  {selectedIncident.title}
                </h4>
                <p className="text-[11px] text-slate-300 truncate mb-2">
                  📍 {selectedIncident.location.name}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Leaving selectedIncident open activates the full dossier drawer
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-heading font-bold text-xs uppercase tracking-wider text-center transition"
                  >
                    Full Dossier & Actions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE RADAR */}
        {mobileTab === 'radar' && (
          <div className="p-3 pb-8">
            <RadarSystem
              incidents={incidents}
              onSelectIncident={(inc) => {
                onSelectIncident(inc);
                setMobileTab('map');
              }}
            />
          </div>
        )}

        {/* TAB 3: INCIDENTS FEED */}
        {mobileTab === 'incidents' && (
          <div className="p-3 pb-8 space-y-3">
            {/* Search Input for Mobile Feed */}
            <div className="bg-slate-900 border border-slate-700 focus-within:border-cyan-400 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
              <span className="text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search incident, location, or hazard..."
                value={incidentSearchQuery}
                onChange={(e) => setIncidentSearchQuery(e.target.value)}
                className="bg-transparent border-none text-slate-100 placeholder-slate-400 focus:outline-none w-full text-xs font-mono"
              />
              {incidentSearchQuery && (
                <button onClick={() => setIncidentSearchQuery('')} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
              {['all', 'critical', 'high', 'moderate'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-full border transition uppercase whitespace-nowrap ${
                    severityFilter === sev
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Incident Cards */}
            <div className="space-y-2.5">
              {filteredIncidents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono text-xs">
                  No incidents matching search criteria
                </div>
              ) : (
                filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      onSelectIncident(inc);
                      setMobileTab('map');
                    }}
                    className="hud-panel p-3 rounded-xl border border-slate-800 hover:border-cyan-400 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          inc.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        SCORE: {inc.priorityScore}/100
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-slate-100 leading-snug mb-1">
                      {inc.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mb-2">
                      {inc.location.name}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 pt-2 border-t border-slate-800">
                      <span className="capitalize">{inc.category}</span>
                      <span className="flex items-center gap-1 underline">
                        <Eye className="w-3.5 h-3.5" /> Inspect On Map
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ALERTS & SEND TO PHONE */}
        {mobileTab === 'alerts' && (
          <div className="p-3 pb-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Active Disaster Broadcasts ({alerts.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tap Send to Phone</span>
            </div>

            <div className="space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="hud-panel p-3.5 rounded-xl border border-red-500/40 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-bold uppercase">
                      {al.severity}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      CONFIRMED
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-white leading-snug">
                    {al.languages.en.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {al.languages.en.content}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenPhoneSender(al)}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send via WhatsApp (+91 9883690602)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: INDIAN EMERGENCY HELPLINES & RELIEF HUBS */}
        {mobileTab === 'helplines' && (
          <div className="p-3 pb-8 space-y-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold block">
              National Emergency Hotlines & WhatsApp Desk (India)
            </span>

            {/* Direct WhatsApp Emergency Contact */}
            <a
              href="https://api.whatsapp.com/send?phone=919883690602&text=EMERGENCY%20SITUATION%20REPORT%20-%20DISASTERLENS%20INDIA"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/50 hover:border-emerald-400 flex items-center justify-between text-xs font-mono shadow-lg shadow-emerald-950/40 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-900">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-100">WHATSAPP DISASTER DESK</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">LIVE</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm tracking-wide block">+91 9883690602</span>
                  <span className="text-[9px] text-slate-400">Direct instant messaging & SOS alert</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-600 group-hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 transition">
                Chat
              </span>
            </a>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <a
                href="tel:112"
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-red-400 flex flex-col justify-between"
              >
                <span className="text-slate-400 text-[10px]">ALL EMERGENCY</span>
                <span className="text-lg font-bold text-red-400">112</span>
                <span className="text-[9px] text-slate-500">Police, Fire, Ambulance</span>
              </a>

              <a
                href="tel:1078"
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 flex flex-col justify-between"
              >
                <span className="text-slate-400 text-[10px]">NDRF DISASTER</span>
                <span className="text-lg font-bold text-cyan-400">1078</span>
                <span className="text-[9px] text-slate-500">Search & Rescue Ops</span>
              </a>

              <a
                href="tel:1070"
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 flex flex-col justify-between"
              >
                <span className="text-slate-400 text-[10px]">STATE EOC</span>
                <span className="text-lg font-bold text-amber-400">1070</span>
                <span className="text-[9px] text-slate-500">State Relief Comm.</span>
              </a>

              <a
                href="tel:1077"
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 flex flex-col justify-between"
              >
                <span className="text-slate-400 text-[10px]">DISTRICT CONTROL</span>
                <span className="text-lg font-bold text-emerald-400">1077</span>
                <span className="text-[9px] text-slate-500">District Magistrate</span>
              </a>
            </div>

            {/* Designated Facilities */}
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold block pt-2">
              Designated Indian Trauma Centers & Shelters
            </span>

            <div className="space-y-2">
              {facilities.map((fac) => (
                <div
                  key={fac.id}
                  className="hud-panel p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-100">{fac.name}</h5>
                    <span className="text-[10px] text-slate-400 capitalize">{fac.type} • {fac.location.name}</span>
                  </div>
                  <a
                    href={`tel:${fac.contact}`}
                    className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300"
                    title="Call Facility"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button: Quick Report */}
      <button
        onClick={onOpenReportModal}
        className="absolute bottom-20 right-4 z-30 p-3.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-2xl shadow-cyan-900/60 flex items-center justify-center transform hover:scale-105 active:scale-95 transition"
        title="Report Field Incident"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      {/* Bottom Mobile Tab Bar */}
      <nav className="shrink-0 h-16 bg-[#070b14]/98 border-t border-cyan-500/30 backdrop-blur-xl flex items-center justify-around px-2 z-30">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex flex-col items-center gap-1 transition ${
            mobileTab === 'map' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-[10px] font-mono">Map</span>
        </button>

        <button
          onClick={() => setMobileTab('radar')}
          className={`flex flex-col items-center gap-1 transition ${
            mobileTab === 'radar' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-mono">Radar</span>
        </button>

        <button
          onClick={() => setMobileTab('incidents')}
          className={`flex flex-col items-center gap-1 transition ${
            mobileTab === 'incidents' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[10px] font-mono">Incidents</span>
        </button>

        <button
          onClick={() => setMobileTab('alerts')}
          className={`flex flex-col items-center gap-1 transition ${
            mobileTab === 'alerts' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BellRing className="w-5 h-5" />
          <span className="text-[10px] font-mono">Alerts</span>
        </button>

        <button
          onClick={() => setMobileTab('helplines')}
          className={`flex flex-col items-center gap-1 transition ${
            mobileTab === 'helplines' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px] font-mono">Helpline</span>
        </button>
      </nav>
    </div>
  );
};
