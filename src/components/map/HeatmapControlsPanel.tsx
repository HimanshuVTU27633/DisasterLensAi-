import React from 'react';
import {
  Flame,
  Filter,
  Sliders,
  Calendar,
  Layers,
  MapPin,
  ChevronRight,
  Info,
  RotateCcw,
  Compass,
  AlertTriangle,
  Users,
} from 'lucide-react';
import {
  HISTORICAL_RISK_ZONES,
  HistoricalDisasterIncident,
} from '../../data/historicalDisastersIndia';
import {
  HeatmapGradientType,
  HeatmapWeightMetric,
  HEATMAP_GRADIENTS,
} from './DisasterHeatmapLayer';

interface HeatmapControlsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // State
  visible: boolean;
  onToggleVisible: (v: boolean) => void;
  timeRange: 'all' | 'monsoon' | 'pre_monsoon' | 'post_monsoon' | 'winter';
  setTimeRange: (t: 'all' | 'monsoon' | 'pre_monsoon' | 'post_monsoon' | 'winter') => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  minSeverity: 'all' | 'moderate' | 'high' | 'critical';
  setMinSeverity: (s: 'all' | 'moderate' | 'high' | 'critical') => void;
  weightMetric: HeatmapWeightMetric;
  setWeightMetric: (m: HeatmapWeightMetric) => void;
  radius: number;
  setRadius: (r: number) => void;
  opacity: number;
  setOpacity: (o: number) => void;
  gradient: HeatmapGradientType;
  setGradient: (g: HeatmapGradientType) => void;
  showIncidentPins: boolean;
  setShowIncidentPins: (s: boolean) => void;
  onSelectZone: (zone: typeof HISTORICAL_RISK_ZONES[0]) => void;
  filteredCount: number;
  totalCount: number;
}

export const HeatmapControlsPanel: React.FC<HeatmapControlsPanelProps> = ({
  isOpen,
  onClose,
  visible,
  onToggleVisible,
  timeRange,
  setTimeRange,
  selectedCategory,
  setSelectedCategory,
  minSeverity,
  setMinSeverity,
  weightMetric,
  setWeightMetric,
  radius,
  setRadius,
  opacity,
  setOpacity,
  gradient,
  setGradient,
  showIncidentPins,
  setShowIncidentPins,
  onSelectZone,
  filteredCount,
  totalCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-3 z-30 w-96 max-w-[calc(100vw-1.5rem)] max-h-[calc(100%-5rem)] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-100">
              Historical Risk Heatmap
            </h3>
            <p className="text-[10px] text-cyan-300 font-mono">
              India Incident Density • 12-Month Analysis
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs font-mono">
        {/* Main Master Toggle */}
        <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-xs font-bold text-white block">Heatmap Layer State</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {visible ? 'Rendering active thermal surface' : 'Layer currently hidden'}
              </span>
            </div>
          </div>
          <button
            onClick={() => onToggleVisible(!visible)}
            className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition ${
              visible
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {visible ? 'Active (ON)' : 'Disabled (OFF)'}
          </button>
        </div>

        {/* Live Filter Metric Status */}
        <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
          <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-lg">
            <span className="text-slate-400 block mb-0.5">Plotting Incidents</span>
            <span className="text-cyan-300 font-bold text-sm">
              {filteredCount}{' '}
              <span className="text-[10px] text-slate-500">/ {totalCount}</span>
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-lg">
            <span className="text-slate-400 block mb-0.5">Peak Danger Corridor</span>
            <span className="text-red-400 font-bold text-xs truncate block">
              Western Ghats (Wayd)
            </span>
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time Horizon & Monsoon Season:</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {[
              { id: 'all', label: 'Past 12 Months (Full)' },
              { id: 'monsoon', label: 'Monsoon (Jun-Sep)' },
              { id: 'post_monsoon', label: 'Cyclone Wave (Oct-Dec)' },
              { id: 'pre_monsoon', label: 'Summer/Pre-Monsoon' },
              { id: 'winter', label: 'Winter (Jan-Feb)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as any)}
                className={`py-1.5 px-2 rounded border text-left transition ${
                  timeRange === t.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hazard Category Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Disaster Category:</span>
          </label>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {[
              { id: 'all', label: 'All Hazards' },
              { id: 'landslide', label: 'Landslides' },
              { id: 'flood', label: 'River Floods' },
              { id: 'cloudburst', label: 'Cloudbursts' },
              { id: 'cyclone', label: 'Cyclones' },
              { id: 'urban_inundation', label: 'Urban Floods' },
              { id: 'earthquake', label: 'Earthquakes' },
              { id: 'industrial', label: 'Hazmat/Fire' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1 px-1.5 rounded border text-center truncate transition ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500/20 text-orange-300 border-orange-400 font-bold'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weighting Metric */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Heatmap Weighting Factor:</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            {[
              { id: 'risk', label: 'Risk / Severity' },
              { id: 'displacement', label: 'Displacement' },
              { id: 'density', label: 'Pure Density' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setWeightMetric(m.id as any)}
                className={`py-1 px-1.5 rounded border text-center transition ${
                  weightMetric === m.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Tuning (Radius & Opacity) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dispersion Radius</span>
            </span>
            <span className="text-cyan-300 font-mono">{radius}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="60"
            step="2"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thermal Opacity</span>
            </span>
            <span className="text-cyan-300 font-mono">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Color Palette Gradient Schemes */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300">
            Color Palette Preset:
          </label>
          <div className="space-y-1">
            {(Object.keys(HEATMAP_GRADIENTS) as HeatmapGradientType[]).map((key) => {
              const item = HEATMAP_GRADIENTS[key];
              const isSelected = gradient === key;
              return (
                <button
                  key={key}
                  onClick={() => setGradient(key)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold truncate">{item.name}</span>
                  {/* Miniature color bar preview */}
                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    {item.colors.slice(1).map((col, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-3 rounded-xs inline-block"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle Individual Incident Markers */}
        <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-xs font-bold text-white block">Historical Pins</span>
              <span className="text-[10px] text-slate-400">Inspect individual incident briefs</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={showIncidentPins}
            onChange={(e) => setShowIncidentPins(e.target.checked)}
            className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
          />
        </div>

        {/* Quick Fly-To High-Risk Zones */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fly-To High Risk Indian Zones:</span>
          </label>
          <div className="space-y-1.5">
            {HISTORICAL_RISK_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => onSelectZone(zone)}
                className="w-full p-2 rounded-lg bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between group transition text-left"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300">
                      {zone.name}
                    </span>
                    <span className="px-1 py-0.2 bg-red-500/20 text-red-300 rounded text-[9px] uppercase border border-red-500/30">
                      {zone.riskLevel}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {zone.peakSeason}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>Google Maps Visualization Layer</span>
        </span>
        <button
          onClick={() => {
            setTimeRange('all');
            setSelectedCategory('all');
            setMinSeverity('all');
            setWeightMetric('risk');
            setRadius(32);
            setOpacity(0.82);
            setGradient('thermal');
          }}
          className="text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
};
