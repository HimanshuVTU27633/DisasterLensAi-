import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  Radio,
  PlusCircle,
  BrainCircuit,
  BellRing,
  ArrowUpDown,
  Truck,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type NavigationTab =
  | 'overview'
  | 'map'
  | 'radar'
  | 'report'
  | 'ai-risk'
  | 'alerts'
  | 'prioritization'
  | 'resources'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  alertCount: number;
  criticalIncidentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onToggle,
  alertCount,
  criticalIncidentCount,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'map', label: 'Live Disaster Map', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'radar', label: 'Doppler Radar System', icon: <Radio className="w-4 h-4 text-cyan-400" /> },
    { id: 'report', label: 'Report Incident', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'ai-risk', label: 'AI Risk Analysis', icon: <BrainCircuit className="w-4 h-4" /> },
    {
      id: 'alerts',
      label: 'Emergency Alerts',
      icon: <BellRing className="w-4 h-4" />,
      badge: alertCount,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
    {
      id: 'prioritization',
      label: 'Response Prioritization',
      icon: <ArrowUpDown className="w-4 h-4" />,
      badge: criticalIncidentCount,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    },
    { id: 'resources', label: 'Resource Allocation', icon: <Truck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Audit', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/75 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] bg-[#070b14]/98 border-r border-cyan-500/20 backdrop-blur-md flex flex-col justify-between transition-all duration-300 ${
          isOpen
            ? 'w-64 max-w-[80vw] translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-16'
        }`}
      >
        {/* Navigation Items */}
        <div className="p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 768 && isOpen) {
                    onToggle();
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
                title={item.label}
              >
                <div className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {item.icon}
                </div>

                {isOpen && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-200'}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Collapsible Toggle & System Status */}
        <div className="p-3 border-t border-slate-800/80">
          {isOpen && (
            <div className="mb-3 px-2 py-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[10px] font-mono text-slate-400">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>DEFCON STATUS</span>
                <span className="text-amber-400 font-semibold">LEVEL 2</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full w-3/4 animate-pulse" />
              </div>
              <span className="block mt-1 text-[9px] text-slate-400">Real-time risk telemetry active</span>
            </div>
          )}

          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition"
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
