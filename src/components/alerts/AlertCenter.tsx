import React, { useState } from 'react';
import { EmergencyAlert, AlertCategory, IncidentSeverity } from '../../types/disaster';
import {
  BellRing,
  AlertTriangle,
  Globe,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Clock,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  Languages,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface AlertCenterProps {
  alerts: EmergencyAlert[];
  onApproveAlert: (alertId: string) => void;
  onRejectAlert: (alertId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onViewOnMap: (coords: { lat: number; lng: number }) => void;
  onTranslateAlert: (alertId: string, lang: 'hi' | 'ta') => Promise<void>;
  translatingId?: string;
  onOpenPhoneSender?: (alert: EmergencyAlert) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  onApproveAlert,
  onRejectAlert,
  onAcknowledgeAlert,
  onViewOnMap,
  onTranslateAlert,
  translatingId,
  onOpenPhoneSender,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeLangTab, setActiveLangTab] = useState<Record<string, 'en' | 'hi' | 'ta'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobilePreviewAlert, setMobilePreviewAlert] = useState<EmergencyAlert | null>(null);

  // Counters
  const totalActive = alerts.filter((a) => a.active).length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.active).length;
  const highCount = alerts.filter((a) => a.severity === 'high' && a.active).length;
  const awaitingVerification = alerts.filter(
    (a) => (a.verificationStatus === 'unverified_ai_draft' || a.verificationStatus === 'under_review') && a.active
  ).length;
  const acknowledgedCount = alerts.filter(
    (a) => a.responseStatus === 'acknowledged' || a.responseStatus === 'dispatched'
  ).length;
  const resolvedCount = alerts.filter((a) => a.responseStatus === 'resolved' || !a.active).length;

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedCategory !== 'all' && alert.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    return true;
  });

  const handleCopyAlert = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryLabel = (cat: AlertCategory) => {
    switch (cat) {
      case 'critical_emergency':
        return 'Critical Emergency';
      case 'high_priority':
        return 'High Priority';
      case 'hazard_warning':
        return 'Hazard Warning';
      case 'infrastructure_disruption':
        return 'Infrastructure Disruption';
      case 'community_safety':
        return 'Community Safety Advisory';
      case 'system_notification':
        return 'System Notification';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner KPI Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="hud-panel p-3 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Active Alerts</span>
          <span className="text-xl font-bold font-heading text-slate-100">{totalActive}</span>
        </div>
        <div className="hud-panel-critical p-3 rounded-xl">
          <span className="text-[10px] font-mono text-red-300 block uppercase">Critical Emergencies</span>
          <span className="text-xl font-bold font-heading text-red-100">{criticalCount}</span>
        </div>
        <div className="hud-panel p-3 rounded-xl border-orange-500/30">
          <span className="text-[10px] font-mono text-orange-300 block uppercase">High-Priority</span>
          <span className="text-xl font-bold font-heading text-orange-100">{highCount}</span>
        </div>
        <div className="hud-panel p-3 rounded-xl border-amber-500/30">
          <span className="text-[10px] font-mono text-amber-300 block uppercase">Awaiting Verification</span>
          <span className="text-xl font-bold font-heading text-amber-100">{awaitingVerification}</span>
        </div>
        <div className="hud-panel p-3 rounded-xl border-cyan-500/30">
          <span className="text-[10px] font-mono text-cyan-300 block uppercase">Acknowledged / Teams</span>
          <span className="text-xl font-bold font-heading text-cyan-100">{acknowledgedCount}</span>
        </div>
        <div className="hud-panel p-3 rounded-xl border-emerald-500/30">
          <span className="text-[10px] font-mono text-emerald-300 block uppercase">Resolved Alerts</span>
          <span className="text-xl font-bold font-heading text-emerald-100">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="hud-panel p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">CATEGORY:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All 6 Categories</option>
            <option value="critical_emergency">1. Critical Emergency</option>
            <option value="high_priority">2. High Priority</option>
            <option value="hazard_warning">3. Hazard Warning</option>
            <option value="infrastructure_disruption">4. Infrastructure Disruption</option>
            <option value="community_safety">5. Community Safety Advisory</option>
            <option value="system_notification">6. System Notification</option>
          </select>

          <span className="text-slate-400 font-mono text-[11px] ml-2">SEVERITY:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> MULTILINGUAL BROADCAST: EN / HI / TA
          </span>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAlerts.map((alert, idx) => {
          const currentLang = activeLangTab[alert.id] || 'en';
          const isCritical = alert.severity === 'critical';
          const localized = alert.languages[currentLang] || alert.languages.en;

          return (
            <div
              key={`${alert.id}-${idx}`}
              className={`rounded-xl p-4 flex flex-col justify-between border transition-all ${
                isCritical
                  ? 'bg-red-950/30 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'hud-panel hover:border-cyan-500/40'
              }`}
            >
              <div>
                {/* Alert Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      {alert.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                        isCritical
                          ? 'bg-red-500/20 text-red-300 border-red-500/50'
                          : alert.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      {getCategoryLabel(alert.category)}
                    </span>
                  </div>

                  {/* Verification Badge */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      alert.verificationStatus === 'confirmed_official'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : alert.verificationStatus === 'under_review'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {alert.verificationStatus.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Multilingual Selector Tabs */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 mb-3 gap-2">
                  <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
                    <button
                      onClick={() => setActiveLangTab({ ...activeLangTab, [alert.id]: 'en' })}
                      className={`px-2 py-0.5 text-xs rounded transition whitespace-nowrap ${
                        currentLang === 'en'
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        if (!alert.languages.hi) {
                          onTranslateAlert(alert.id, 'hi');
                        }
                        setActiveLangTab({ ...activeLangTab, [alert.id]: 'hi' });
                      }}
                      disabled={translatingId === `${alert.id}-hi`}
                      className={`px-2 py-0.5 text-xs rounded transition flex items-center gap-1 whitespace-nowrap ${
                        currentLang === 'hi'
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>हिंदी (Hindi)</span>
                      {!alert.languages.hi && <Sparkles className="w-2.5 h-2.5 text-amber-400" />}
                    </button>
                    <button
                      onClick={() => {
                        if (!alert.languages.ta) {
                          onTranslateAlert(alert.id, 'ta');
                        }
                        setActiveLangTab({ ...activeLangTab, [alert.id]: 'ta' });
                      }}
                      disabled={translatingId === `${alert.id}-ta`}
                      className={`px-2 py-0.5 text-xs rounded transition flex items-center gap-1 whitespace-nowrap ${
                        currentLang === 'ta'
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>தமிழ் (Tamil)</span>
                      {!alert.languages.ta && <Sparkles className="w-2.5 h-2.5 text-amber-400" />}
                    </button>
                  </div>

                  {translatingId?.startsWith(alert.id) && (
                    <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                      Gemini translating...
                    </span>
                  )}
                </div>

                {/* Localized Title & Content */}
                <h3 className="font-heading font-bold text-sm text-slate-100 mb-1.5 leading-snug">
                  {localized.title}
                </h3>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {localized.content}
                </p>

                {/* Safety Precautions Box */}
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg mb-3">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                    Protective Safety Precautions
                  </span>
                  <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {localized.precautions}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{alert.affectedArea}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Alert Actions Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* View on Map */}
                  {alert.coordinates && (
                    <button
                      onClick={() => onViewOnMap(alert.coordinates!)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono transition flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Map
                    </button>
                  )}

                  {/* Mobile Preview */}
                  <button
                    onClick={() => setMobilePreviewAlert(alert)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1"
                  >
                    <Smartphone className="w-3 h-3" /> Preview
                  </button>

                  {/* Send via WhatsApp */}
                  {onOpenPhoneSender && (
                    <button
                      onClick={() => onOpenPhoneSender(alert)}
                      className="px-2.5 py-1 rounded bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold transition flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                      title="Send directly via WhatsApp to +91 9883690602"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" /> WhatsApp Alert
                    </button>
                  )}

                  {/* Copy Alert */}
                  <button
                    onClick={() =>
                      handleCopyAlert(
                        `${localized.title}\n\n${localized.content}\n\nPRECAUTIONS:\n${localized.precautions}`,
                        alert.id
                      )
                    }
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1"
                  >
                    {copiedId === alert.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedId === alert.id ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {alert.verificationStatus !== 'confirmed_official' && (
                    <>
                      <button
                        onClick={() => onApproveAlert(alert.id)}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition flex items-center gap-1 shadow-md shadow-emerald-950"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve Broadcast
                      </button>
                      <button
                        onClick={() => onRejectAlert(alert.id)}
                        className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-mono transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {alert.verificationStatus === 'confirmed_official' && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 rounded bg-cyan-700/60 hover:bg-cyan-600/60 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-medium transition"
                    >
                      Acknowledge Response
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Device Broadcast Mockup Modal */}
      {mobilePreviewAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-slate-950 border-4 border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
            {/* Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mb-6" />

            {/* Mobile Notification Card */}
            <div className="w-full bg-slate-900/95 border border-red-500/60 text-slate-100 p-4 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-red-400">
                <span className="flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                  EMERGENCY BROADCAST SYSTEM
                </span>
                <span>NOW</span>
              </div>
              <h4 className="font-bold text-xs text-white leading-tight">
                {mobilePreviewAlert.languages.en.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                {mobilePreviewAlert.languages.en.content}
              </p>
              <div className="text-[10px] text-amber-300 font-mono pt-1 border-t border-slate-800">
                Affected: {mobilePreviewAlert.affectedArea}
              </div>
            </div>

            <button
              onClick={() => setMobilePreviewAlert(null)}
              className="mt-6 px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
            >
              Close Phone Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
