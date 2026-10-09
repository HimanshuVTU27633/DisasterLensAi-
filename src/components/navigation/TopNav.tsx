import React, { useState } from 'react';
import {
  Radio,
  Bell,
  Volume2,
  VolumeX,
  Search,
  AlertTriangle,
  User,
  Shield,
  Activity,
  PlusCircle,
  Menu,
  Smartphone,
  ShieldAlert,
  MoreVertical,
  X,
  Check,
} from 'lucide-react';
import { audioManager } from '../../utils/soundAndNotifications';
import { AppSettings, Incident } from '../../types/disaster';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface TopNavProps {
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenReportModal: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onToggleSidebar: () => void;
  onSearchSelectIncident?: (incident: Incident) => void;
  incidents: Incident[];
  isMobileMode: boolean;
  onToggleMobileMode: () => void;
  isSirenActive?: boolean;
  onOpenSirenModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  unreadCount,
  onOpenNotifications,
  onOpenReportModal,
  settings,
  onUpdateSettings,
  onToggleSidebar,
  onSearchSelectIncident,
  incidents,
  isMobileMode,
  onToggleMobileMode,
  isSirenActive,
  onOpenSirenModal,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(settings.soundAlerts);
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);
  const [searchVal, setSearchVal] = useState<string>('');
  const [searchSuggestions, setSearchSuggestions] = useState<Incident[]>([]);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    audioManager.setSoundEnabled(next);
    onUpdateSettings({ soundAlerts: next });
    if (next) {
      audioManager.playTelemetryChime();
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    if (val.trim().length > 1) {
      const filtered = incidents.filter(
        (i) =>
          i.title.toLowerCase().includes(val.toLowerCase()) ||
          i.location.name.toLowerCase().includes(val.toLowerCase()) ||
          i.category.toLowerCase().includes(val.toLowerCase())
      );
      setSearchSuggestions(filtered.slice(0, 5));
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSelectIncident = (inc: Incident) => {
    onSearchSelectIncident?.(inc);
    setSearchVal('');
    setSearchSuggestions([]);
    setMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-[#080d1a]/95 backdrop-blur-md border-b border-cyan-500/20 px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition md:hidden"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-bold text-sm sm:text-base tracking-wider bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                DISASTERLENS
              </span>
              <span className="hidden xs:inline-block text-[8px] sm:text-[9px] uppercase tracking-widest px-1 sm:px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono">
                OPS
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden sm:block tracking-wide">
              EMERGENCY INTELLIGENCE & PRIORITIZATION
            </p>
          </div>
        </div>
      </div>

      {/* Global Incident Search (Desktop) */}
      <div className="relative hidden md:block max-w-md w-full">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 focus-within:border-cyan-400/60 rounded-lg px-3 py-1.5 transition">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Global search: incidents, hazards, coordinates..."
            value={searchVal}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-400 focus:outline-none w-full"
          />
          {searchVal && (
            <button onClick={() => setSearchVal('')} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-cyan-500/40 rounded-lg shadow-2xl p-2 z-50">
            <span className="text-[10px] uppercase font-mono text-cyan-400 px-2">Matched Incidents</span>
            <div className="mt-1 space-y-1">
              {searchSuggestions.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => handleSelectIncident(inc)}
                  className="w-full text-left p-2 rounded hover:bg-cyan-950/40 flex items-center justify-between text-xs transition"
                >
                  <div>
                    <span className="font-medium text-slate-100">{inc.title}</span>
                    <span className="block text-[10px] text-slate-400">{inc.location.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                    inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {inc.severity}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Action Icons & Status */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Orbital Link Status Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>SATELLITE SYNC</span>
        </div>

        {/* Mobile Search Toggle Button */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 md:hidden transition"
          title="Search Incidents"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Mobile / Command Center Mode Toggle (Desktop) */}
        <button
          onClick={onToggleMobileMode}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
            isMobileMode
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
          }`}
          title="Toggle Mobile Responder App view"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isMobileMode ? 'Command Center' : 'Mobile App'}</span>
        </button>

        {/* PWA Install Button for Offline Responders (Desktop) */}
        <div className="hidden md:block">
          <PWAInstallButton />
        </div>

        {/* Emergency Siren System Button */}
        {onOpenSirenModal && (
          <button
            onClick={onOpenSirenModal}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition ${
              isSirenActive
                ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_#ef4444] border border-red-300'
                : 'bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 shadow-md shadow-red-950'
            }`}
            title="Civil Defense Evacuation Siren System"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isSirenActive ? 'animate-bounce' : 'text-red-400'}`} />
            <span className="hidden sm:inline">{isSirenActive ? 'SIREN ACTIVE' : 'SIREN'}</span>
          </button>
        )}

        {/* Audio Toggle (Desktop) */}
        <button
          onClick={handleToggleSound}
          className={`hidden md:flex p-2 rounded-lg border transition ${
            soundOn
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={soundOn ? 'Sound Alerts: Enabled' : 'Sound Alerts: Muted'}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Emergency Alert Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-400/60 text-slate-200 transition"
          title="Notification Center"
          aria-label="Notification Center"
        >
          <Bell className="w-4 h-4 text-cyan-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-mono font-bold text-white ring-2 ring-slate-950 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Report Incident Quick CTA */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium font-heading tracking-wider shadow-lg shadow-cyan-900/30 transition transform active:scale-95"
          title="Report Field Incident"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">REPORT</span>
        </button>

        {/* Role Menu (Desktop) */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-white">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] text-slate-300 font-mono hidden xl:inline">
              {settings.responderRole}
            </span>
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 border border-cyan-500/30 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-lg">
              <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">Tactical Clearance</span>
                <p className="text-xs font-semibold text-cyan-300">{settings.responderRole}</p>
              </div>
              <div className="space-y-1">
                {(['Incident Commander', 'Tactical Responder', 'Field Medic'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onUpdateSettings({ responderRole: r });
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition ${
                      settings.responderRole === r
                        ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Quick Tactical Menu Button (Mobile only) */}
        <div className="relative md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 transition"
            title="Tactical Options"
            aria-label="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#090e1c] border border-cyan-500/40 rounded-xl shadow-2xl p-3 z-50 text-xs font-mono space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Tactical Tools</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* View Mode Toggle */}
                <button
                  onClick={() => {
                    onToggleMobileMode();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-cyan-400/50 transition"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-200">View Mode</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px]">
                    {isMobileMode ? 'Mobile App' : 'Command Ctr'}
                  </span>
                </button>

                {/* Offline PWA Install button */}
                <div className="p-1 rounded-lg bg-slate-900 border border-slate-800">
                  <PWAInstallButton />
                </div>

                {/* Sound Alert Toggle */}
                <button
                  onClick={handleToggleSound}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-cyan-400/50 transition"
                >
                  <div className="flex items-center gap-2">
                    {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span className="text-slate-200">Audio Telemetry</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${soundOn ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {soundOn ? 'ACTIVE' : 'MUTED'}
                  </span>
                </button>

                {/* Responder Role Clearance */}
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Tactical Clearance:</span>
                  {(['Incident Commander', 'Tactical Responder', 'Field Medic'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onUpdateSettings({ responderRole: r });
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-[11px] ${
                        settings.responderRole === r
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <span>{r}</span>
                      {settings.responderRole === r && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>SATELLITE LINK</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CONNECTED
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="absolute inset-x-0 top-16 bg-[#080d1a]/98 border-b border-cyan-500/30 p-3 shadow-2xl z-50 md:hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search incidents, hazards, locations..."
              value={searchVal}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-400 focus:outline-none w-full"
            />
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchVal('');
                setSearchSuggestions([]);
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {searchSuggestions.length > 0 && (
            <div className="mt-2 bg-slate-900 border border-slate-700 rounded-lg p-2 max-h-60 overflow-y-auto divide-y divide-slate-800">
              {searchSuggestions.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => handleSelectIncident(inc)}
                  className="w-full text-left p-2 hover:bg-cyan-950/40 flex items-center justify-between text-xs transition"
                >
                  <div className="pr-2">
                    <span className="font-semibold text-slate-100 block">{inc.title}</span>
                    <span className="text-[10px] text-slate-400">{inc.location.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0 ${
                    inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {inc.severity}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
