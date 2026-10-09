import React, { useState } from 'react';
import { NotificationItem, Incident } from '../../types/disaster';
import {
  X,
  Bell,
  CheckCheck,
  MapPin,
  Eye,
  AlertTriangle,
  Info,
  Activity,
  Volume2,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSelectIncidentById?: (incidentId: string) => void;
  onViewOnMap?: (coords: { lat: number; lng: number }) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectIncidentById,
  onViewOnMap,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filterSeverity === 'all') return true;
    return n.severity === filterSeverity;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-[#080d1a]/98 backdrop-blur-xl border-l border-cyan-500/30 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="font-heading font-bold text-sm tracking-wide text-slate-100">
            EMERGENCY NOTIFICATION LOG
          </h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-600 text-white font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 border-b border-slate-800 flex items-center gap-1 text-[11px] font-mono bg-slate-950/40">
        {(['all', 'critical', 'high', 'system'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-2.5 py-1 rounded transition capitalize ${
              filterSeverity === sev
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No alerts in this category
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => onMarkRead(item.id)}
              className={`p-3 rounded-lg transition-all cursor-pointer border ${
                !item.read
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  {item.severity === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                  ) : item.severity === 'system' ? (
                    <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <Activity className="w-4 h-4 text-orange-400 shrink-0" />
                  )}
                  <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                )}
              </div>

              <p className="text-xs text-slate-300 leading-snug mb-2 pl-5">
                {item.message}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pl-5">
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                <div className="flex items-center gap-2">
                  {item.coordinates && onViewOnMap && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOnMap(item.coordinates!);
                        onClose();
                      }}
                      className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 underline"
                    >
                      <MapPin className="w-3 h-3" /> View on Map
                    </button>
                  )}

                  {item.incidentId && onSelectIncidentById && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncidentById(item.incidentId!);
                        onClose();
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-3 h-3" /> Inspect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};
