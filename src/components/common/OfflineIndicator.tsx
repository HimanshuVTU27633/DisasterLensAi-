import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-lg bg-amber-950/95 border border-amber-500/70 px-3.5 py-2 text-xs font-mono font-medium text-amber-200 shadow-2xl shadow-black/80 backdrop-blur-md animate-pulse">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex flex-col">
        <span className="font-heading font-bold text-amber-300 uppercase tracking-wide">
          OFFLINE PROTOCOL ENGAGED
        </span>
        <span className="text-[11px] text-amber-200/80">
          Viewing cached maps, incident reports & shelters from local storage
        </span>
      </div>
      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-amber-600/40 text-[10px] text-amber-400 bg-amber-900/40 px-1.5 py-0.5 rounded">
        <Database className="w-3 h-3" />
        <span>CACHED</span>
      </div>
    </div>
  );
};
