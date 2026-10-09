import React, { useState } from 'react';
import { AppSettings, AuditLogItem, IncidentCategory } from '../../types/disaster';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  Globe,
  Radio,
  FileText,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  requestBrowserNotificationPermission,
  getBrowserNotificationPermission,
  sendBrowserNotification,
} from '../../utils/soundAndNotifications';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  auditLogs: AuditLogItem[];
  onTriggerDemoAlert: () => void;
}

const CATEGORIES: { id: IncidentCategory; label: string }[] = [
  { id: 'flood', label: 'Flash Flood & Inundation' },
  { id: 'wildfire', label: 'Wildland-Urban Wildfire' },
  { id: 'cyclone', label: 'Cyclone & Hurricane' },
  { id: 'earthquake', label: 'Earthquake & Seismic' },
  { id: 'landslide', label: 'Landslide & Debris Flow' },
  { id: 'severe_storm', label: 'Severe Storm & Gale' },
  { id: 'industrial', label: 'Industrial & Hazmat Plume' },
  { id: 'infrastructure', label: 'Infrastructure & Power Outage' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  auditLogs,
  onTriggerDemoAlert,
}) => {
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(
    getBrowserNotificationPermission()
  );
  const [testNotifSent, setTestNotifSent] = useState<boolean>(false);

  const handleRequestPerm = async () => {
    const res = await requestBrowserNotificationPermission();
    setNotificationPerm(res);
  };

  const handleSendTestNotification = () => {
    sendBrowserNotification('DisasterLens AI - Tactical Alert Test', {
      body: 'Verified emergency broadcast test successful. Secure channel open.',
    });
    setTestNotifSent(true);
    setTimeout(() => setTestNotifSent(false), 3000);
  };

  const toggleCategory = (cat: IncidentCategory) => {
    const exists = settings.triggerCategories.includes(cat);
    const updated = exists
      ? settings.triggerCategories.filter((c) => c !== cat)
      : [...settings.triggerCategories, cat];
    onUpdateSettings({ triggerCategories: updated });
  };

  return (
    <div className="space-y-4">
      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Thresholds & Triggers */}
        <div className="hud-panel p-4 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h4 className="font-heading font-bold text-xs uppercase text-slate-100 tracking-wider">
              Alert Trigger Thresholds & Rules
            </h4>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Auto-Alert Severity Threshold:</span>
              <span className="text-cyan-400 font-bold">{settings.severityThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={settings.severityThreshold}
              onChange={(e) => onUpdateSettings({ severityThreshold: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 font-mono">
              Incidents scoring at or above this threshold trigger an automated Emergency Alert draft for command review.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-mono text-slate-300 block">
              Categories That Trigger Proposed Alerts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {CATEGORIES.map((cat) => {
                const checked = settings.triggerCategories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat.id)}
                      className="accent-cyan-400 rounded"
                    />
                    <span className="text-[11px] text-slate-300 truncate">{cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Require Dual Commander Verification
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Enforce second officer sign-off before Critical public broadcast
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireDualVerification}
                onChange={(e) => onUpdateSettings({ requireDualVerification: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Language Configuration */}
        <div className="hud-panel p-4 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h4 className="font-heading font-bold text-xs uppercase text-slate-100 tracking-wider">
              Notification & Broadcast Preferences
            </h4>
          </div>

          {/* Browser Notifications Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Desktop Browser Notifications
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Current Status: <strong className="text-cyan-300 uppercase">{notificationPerm}</strong>
                </span>
              </div>
              {notificationPerm !== 'granted' ? (
                <button
                  onClick={handleRequestPerm}
                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono transition"
                >
                  Request Permission
                </button>
              ) : (
                <button
                  onClick={handleSendTestNotification}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-cyan-500/40 transition"
                >
                  {testNotifSent ? 'Test Sent!' : 'Send Test Notification'}
                </button>
              )}
            </div>
          </div>

          {/* Multilingual Config */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-mono text-slate-300 block">
              Default Operational Language:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'en', label: 'English (EN)' },
                { id: 'hi', label: 'Hindi (हिंदी)' },
                { id: 'ta', label: 'Tamil (தமிழ்)' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => onUpdateSettings({ activeLanguage: l.id as any })}
                  className={`p-2 rounded-lg border text-center font-mono transition ${
                    settings.activeLanguage === l.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulation & Connected Data Mode */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Simulated Real-Time Incident Stream
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Inject periodic synthetic incident reports for operational drills
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.simulationEnabled}
                onChange={(e) => onUpdateSettings({ simulationEnabled: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </div>

            <button
              onClick={onTriggerDemoAlert}
              className="w-full mt-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center justify-center gap-2 transition"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              Simulate Live Influx Incident Event Now
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="hud-panel rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h4 className="font-heading font-bold text-xs uppercase text-slate-200 tracking-wider">
              Emergency Operations Audit Trail ({auditLogs.length} Events)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Immutable Commander Log</span>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase sticky top-0">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor / Role</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Details</th>
                <th className="p-3">Target Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {auditLogs.map((log, idx) => (
                <tr key={`${log.id}-${idx}`} className="hover:bg-slate-900/50">
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-3 text-cyan-300 font-semibold">{log.actor}</td>
                  <td className="p-3 font-bold text-slate-300">{log.action}</td>
                  <td className="p-3 text-slate-300">{log.details}</td>
                  <td className="p-3 text-slate-400 font-mono">{log.targetId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
