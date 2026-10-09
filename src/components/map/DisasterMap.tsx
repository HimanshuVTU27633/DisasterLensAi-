import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  GOOGLE_MAPS_API_KEY,
  MAP_ID,
  GMP_ATTRIBUTION_ID,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  GLOBAL_PRESET_CITIES,
} from '../../config/maps';
import { Incident, ShelterOrHospital } from '../../types/disaster';
import { HazardCircle } from './HazardCircle';
import { RouteCorridor } from './RouteCorridor';
import {
  DisasterHeatmapLayer,
  HeatmapGradientType,
  HeatmapWeightMetric,
} from './DisasterHeatmapLayer';
import { HeatmapControlsPanel } from './HeatmapControlsPanel';
import { HistoricalIncidentModal } from './HistoricalIncidentModal';
import {
  HISTORICAL_DISASTERS_INDIA,
  HistoricalDisasterIncident,
} from '../../data/historicalDisastersIndia';
import {
  Crosshair,
  Layers,
  MapPin,
  Navigation,
  Eye,
  Building2,
  ShieldAlert,
  Flame,
  Activity,
  Compass,
  AlertTriangle,
  Sliders,
} from 'lucide-react';

interface DisasterMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  facilities: ShelterOrHospital[];
  activeRoute: { origin: Incident; facility: ShelterOrHospital } | null;
  onClearRoute: () => void;
  isPickingLocation?: boolean;
  onLocationPicked?: (coords: { lat: number; lng: number; addressHint?: string }) => void;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
}

// Map Controller for programmatically flying camera to target incident or city
function MapCameraController({
  targetCoords,
  zoom,
}: {
  targetCoords: { lat: number; lng: number } | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetCoords) return;
    map.panTo(targetCoords);
    if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, targetCoords, zoom]);

  return null;
}

// Click listener inside Map context
function MapClickListener({
  isPickingLocation,
  onLocationPicked,
}: {
  isPickingLocation?: boolean;
  onLocationPicked?: (coords: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !isPickingLocation || !onLocationPicked) return;

    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onLocationPicked({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, isPickingLocation, onLocationPicked]);

  return null;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  facilities,
  activeRoute,
  onClearRoute,
  isPickingLocation,
  onLocationPicked,
}) => {
  const [mapType, setMapType] = useState<string>('roadmap');
  const [showHazardZones, setShowHazardZones] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [flyZoom, setFlyZoom] = useState<number | undefined>(undefined);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFeedback, setSearchFeedback] = useState<string>('');
  const [mapError, setMapError] = useState<boolean>(false);

  // Google Maps Historical Disaster Density Heatmap Layer State
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [isHeatmapPanelOpen, setIsHeatmapPanelOpen] = useState<boolean>(false);
  const [heatmapTimeRange, setHeatmapTimeRange] = useState<'all' | 'monsoon' | 'pre_monsoon' | 'post_monsoon' | 'winter'>('all');
  const [heatmapCategory, setHeatmapCategory] = useState<string>('all');
  const [heatmapMinSeverity, setHeatmapMinSeverity] = useState<'all' | 'moderate' | 'high' | 'critical'>('all');
  const [heatmapWeightMetric, setHeatmapWeightMetric] = useState<HeatmapWeightMetric>('risk');
  const [heatmapRadius, setHeatmapRadius] = useState<number>(32);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.82);
  const [heatmapGradient, setHeatmapGradient] = useState<HeatmapGradientType>('thermal');
  const [showHistoricalPins, setShowHistoricalPins] = useState<boolean>(false);
  const [selectedHistoricalIncident, setSelectedHistoricalIncident] = useState<HistoricalDisasterIncident | null>(null);

  // Filter historical incidents based on responder criteria
  const filteredHistoricalIncidents = useMemo(() => {
    return HISTORICAL_DISASTERS_INDIA.filter((item) => {
      if (heatmapTimeRange !== 'all' && item.season !== heatmapTimeRange) {
        return false;
      }
      if (heatmapCategory !== 'all' && item.category !== heatmapCategory) {
        return false;
      }
      if (heatmapMinSeverity === 'moderate' && item.severity === 'low') {
        return false;
      }
      if (heatmapMinSeverity === 'high' && (item.severity === 'low' || item.severity === 'moderate')) {
        return false;
      }
      if (heatmapMinSeverity === 'critical' && item.severity !== 'critical') {
        return false;
      }
      return true;
    });
  }, [heatmapTimeRange, heatmapCategory, heatmapMinSeverity]);

  // When selectedIncident changes externally, center map on it
  useEffect(() => {
    if (selectedIncident) {
      setFlyTarget({ lat: selectedIncident.location.lat, lng: selectedIncident.location.lng });
      setFlyZoom(15);
    }
  }, [selectedIncident]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setFlyTarget(userLoc);
        setFlyZoom(14);
        if (isPickingLocation && onLocationPicked) {
          onLocationPicked(userLoc);
        }
      },
      (err) => {
        setLocatingUser(false);
        console.warn('Geolocation failed:', err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [isPickingLocation, onLocationPicked]);

  const handleCitySelect = (city: typeof GLOBAL_PRESET_CITIES[0]) => {
    setFlyTarget({ lat: city.lat, lng: city.lng });
    setFlyZoom(city.zoom);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Search against incidents or preset cities
    const query = searchQuery.toLowerCase();
    const matchedCity = GLOBAL_PRESET_CITIES.find(
      (c) => c.name.toLowerCase().includes(query)
    );
    if (matchedCity) {
      setFlyTarget({ lat: matchedCity.lat, lng: matchedCity.lng });
      setFlyZoom(matchedCity.zoom);
      setSearchFeedback(`Navigated to ${matchedCity.name}`);
      setTimeout(() => setSearchFeedback(''), 3000);
      return;
    }

    const matchedIncident = incidents.find(
      (inc) =>
        inc.title.toLowerCase().includes(query) ||
        inc.location.name.toLowerCase().includes(query)
    );
    if (matchedIncident) {
      onSelectIncident(matchedIncident);
      setFlyTarget({ lat: matchedIncident.location.lat, lng: matchedIncident.location.lng });
      setFlyZoom(16);
      setSearchFeedback(`Focused on Incident: ${matchedIncident.title}`);
      setTimeout(() => setSearchFeedback(''), 3000);
      return;
    }

    setSearchFeedback(`Location "${searchQuery}" queued. Use map click or presets.`);
    setTimeout(() => setSearchFeedback(''), 4000);
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity === 'all') return true;
    return inc.severity === filterSeverity;
  });

  return (
    <div className="relative w-full h-full min-h-[350px] sm:min-h-[500px] flex flex-col bg-slate-950 overflow-hidden rounded-xl border border-cyan-500/20 shadow-2xl">
      {/* Top Tactical Controls Bar */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        {/* Search & Location Bar */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-lg max-w-full sm:max-w-md w-full">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              placeholder="Search location, landmark, or incident ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-400 focus:outline-none w-full"
            />
          </form>
          {searchFeedback && (
            <span className="text-[10px] text-cyan-300 font-mono animate-pulse shrink-0">
              {searchFeedback}
            </span>
          )}
        </div>

        {/* Tactical Overlay & Layer Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-1 shadow-lg text-xs overflow-x-auto max-w-full shrink-0 flex-nowrap">
          {/* Preset Cities Dropdown */}
          <select
            onChange={(e) => {
              const city = GLOBAL_PRESET_CITIES.find((c) => c.name === e.target.value);
              if (city) handleCitySelect(city);
            }}
            className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-cyan-400"
            defaultValue=""
          >
            <option value="" disabled>Sector Presets</option>
            {GLOBAL_PRESET_CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Map Layer View Switcher */}
          <div className="flex bg-slate-950 rounded p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2 py-0.5 text-[11px] rounded transition ${
                mapType === 'roadmap' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tactical
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 text-[11px] rounded transition ${
                mapType === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType('hybrid')}
              className={`px-2 py-0.5 text-[11px] rounded transition ${
                mapType === 'hybrid' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hybrid
            </button>
          </div>

          {/* Google Maps Historical Heatmap Toggle & Controls */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded border border-slate-800">
            <button
              type="button"
              title="Toggle Google Maps Historical Disaster Incident Density Heatmap (India Past 12 Months)"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-bold transition ${
                showHeatmap
                  ? 'bg-gradient-to-r from-orange-500/25 to-red-500/25 text-orange-300 border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-orange-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Heatmap</span>
              <span className={`text-[10px] px-1 rounded ${showHeatmap ? 'bg-orange-950 text-orange-300 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                {showHeatmap ? 'ON' : 'OFF'}
              </span>
              <span className="text-[10px] bg-slate-800/80 px-1 rounded text-cyan-300">
                {filteredHistoricalIncidents.length}
              </span>
            </button>

            <button
              type="button"
              title="Open Heatmap Risk Filters & Tuning Panel"
              onClick={() => setIsHeatmapPanelOpen(!isHeatmapPanelOpen)}
              className={`p-1.5 rounded transition ${
                isHeatmapPanelOpen ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hazard Zones Toggle */}
          <button
            type="button"
            title="Toggle Hazard Risk Zones"
            onClick={() => setShowHazardZones(!showHazardZones)}
            className={`p-1.5 rounded transition ${
              showHazardZones ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Facilities Toggle */}
          <button
            type="button"
            title="Toggle Emergency Hospitals & Shelters"
            onClick={() => setShowFacilities(!showFacilities)}
            className={`p-1.5 rounded transition ${
              showFacilities ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
          </button>

          {/* Locate Me */}
          <button
            type="button"
            title="Request Geolocation"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className={`p-1.5 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700 transition border border-cyan-500/30 ${
              locatingUser ? 'animate-spin' : ''
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Location Picking Banner */}
      {isPickingLocation && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-cyan-950/90 border border-cyan-400 text-cyan-200 px-4 py-1.5 rounded-full text-xs font-mono shadow-xl flex items-center gap-2 animate-bounce">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click anywhere on the map to pin incident coordinates</span>
        </div>
      )}

      {/* Active Route Corridor Banner */}
      {activeRoute && (
        <div className="absolute top-16 left-4 z-30 bg-slate-900/95 border border-cyan-400/60 text-slate-100 p-3 rounded-xl text-xs shadow-2xl max-w-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold uppercase tracking-wider text-[11px]">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Tactical Evacuation Route
            </span>
            <button
              onClick={onClearRoute}
              className="text-slate-400 hover:text-red-400 font-mono text-xs px-1"
            >
              ✕ Clear
            </button>
          </div>
          <p className="text-slate-300 text-[11px] mb-1">
            <strong className="text-white">From:</strong> {activeRoute.origin.title}
          </p>
          <p className="text-slate-300 text-[11px] mb-2">
            <strong className="text-white">To:</strong> {activeRoute.facility.name} ({activeRoute.facility.type})
          </p>
          <div className="flex items-center gap-3 text-[10px] text-cyan-300 font-mono bg-cyan-950/50 p-1.5 rounded border border-cyan-500/20">
            <span>EST DISTANCE: ~2.4 km</span>
            <span>TRANSIT ETA: ~6 mins</span>
            <span className="text-emerald-400">STATUS: CLEAR</span>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="w-full h-full flex-1 relative">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} solutionChannel="GMP_aistudio">
          <Map
            id="disasterlens-main-map"
            mapId={MAP_ID}
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={false}
            fullscreenControl={true}
            internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
            className="w-full h-full"
          >
            {/* Camera Fly Controller */}
            <MapCameraController targetCoords={flyTarget} zoom={flyZoom} />

            {/* Click listener for location picking */}
            <MapClickListener
              isPickingLocation={isPickingLocation}
              onLocationPicked={onLocationPicked}
            />

            {/* Tactical Evacuation Route Corridor */}
            {activeRoute && (
              <RouteCorridor
                origin={activeRoute.origin.location}
                destination={activeRoute.facility.location}
                facilityName={activeRoute.facility.name}
              />
            )}

            {/* Google Maps Historical Disaster Density Heatmap Layer (India Past 12 Months) */}
            <DisasterHeatmapLayer
              incidents={filteredHistoricalIncidents}
              visible={showHeatmap}
              radius={heatmapRadius}
              opacity={heatmapOpacity}
              gradientScheme={heatmapGradient}
              weightMetric={heatmapWeightMetric}
            />

            {/* Optional Individual Historical Incident Pins */}
            {showHeatmap &&
              showHistoricalPins &&
              filteredHistoricalIncidents.map((hist) => (
                <AdvancedMarker
                  key={`hist-marker-${hist.id}`}
                  position={hist.location}
                  title={`${hist.title} (${hist.month})`}
                  zIndex={40}
                  onClick={() => setSelectedHistoricalIncident(hist)}
                >
                  <div className="cursor-pointer group transform hover:scale-125 transition-transform">
                    <div className="w-3.5 h-3.5 rounded-full bg-orange-500/90 border border-white shadow-lg flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col bg-slate-900/95 border border-orange-500/40 text-slate-100 p-1.5 rounded text-[10px] font-mono whitespace-nowrap z-40 shadow-xl pointer-events-none">
                      <span className="font-semibold text-orange-300">{hist.title}</span>
                      <span className="text-[9px] text-slate-400">
                        {hist.location.name} • {hist.month}
                      </span>
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

            {/* Risk Overlay Circles */}
            {showHazardZones &&
              filteredIncidents.map((inc) => (
                <HazardCircle
                  key={`hazard-zone-${inc.id}`}
                  center={{ lat: inc.location.lat, lng: inc.location.lng }}
                  radiusMeters={(inc.evacuationRadiusKm || 1.0) * 1000}
                  severity={inc.severity}
                />
              ))}

            {/* Emergency Facilities Markers */}
            {showFacilities &&
              facilities.map((fac) => (
                <AdvancedMarker
                  key={`facility-${fac.id}`}
                  position={fac.location}
                  title={`${fac.name} (${fac.type})`}
                  onClick={() => {
                    // Quick facility inspection
                  }}
                >
                  <div className="group relative cursor-pointer transform hover:scale-110 transition-transform">
                    <div className="bg-slate-900 border-2 border-emerald-400 text-emerald-300 p-1.5 rounded-lg shadow-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col bg-slate-900/95 border border-emerald-500/40 text-slate-100 p-2 rounded text-[11px] whitespace-nowrap z-30 shadow-xl pointer-events-none">
                      <span className="font-semibold text-emerald-300">{fac.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{fac.type} • Cap: {fac.capacity - fac.occupied} beds free</span>
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

            {/* Incident Markers */}
            {showIncidents &&
              filteredIncidents.map((incident) => {
                const isSelected = selectedIncident?.id === incident.id;
                const isCritical = incident.severity === 'critical';
                const isHigh = incident.severity === 'high';

                return (
                  <AdvancedMarker
                    key={incident.id}
                    position={incident.location}
                    title={incident.title}
                    zIndex={isSelected ? 100 : isCritical ? 90 : 50}
                    onClick={() => onSelectIncident(incident)}
                  >
                    <div className="relative group cursor-pointer">
                      {/* Pulsing ring for critical emergencies */}
                      {isCritical && (
                        <div className="absolute -inset-2 bg-red-500/30 rounded-full animate-ping pointer-events-none" />
                      )}

                      {/* Tactical Marker Badge */}
                      <div
                        className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono font-bold shadow-2xl transition-all duration-200 ${
                          isSelected
                            ? 'ring-2 ring-cyan-300 scale-110'
                            : 'hover:scale-105'
                        } ${
                          isCritical
                            ? 'bg-red-950/90 text-red-100 border-2 border-red-500 shadow-red-900/50'
                            : isHigh
                            ? 'bg-orange-950/90 text-orange-100 border-2 border-orange-500 shadow-orange-900/50'
                            : incident.severity === 'moderate'
                            ? 'bg-amber-950/90 text-amber-100 border-2 border-amber-500'
                            : 'bg-emerald-950/90 text-emerald-100 border-2 border-cyan-500'
                        }`}
                      >
                        {isCritical ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />
                        ) : (
                          <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                        <span className="text-[11px]">{incident.priorityScore}</span>
                      </div>

                      {/* Tooltip Hover Badge */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col bg-slate-900/95 border border-cyan-500/40 text-slate-100 p-2 rounded-lg text-[11px] whitespace-nowrap z-40 shadow-2xl pointer-events-none">
                        <span className="font-semibold text-cyan-300">{incident.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="capitalize">{incident.category}</span>
                          <span>•</span>
                          <span className="uppercase text-amber-300">{incident.severity}</span>
                          <span>•</span>
                          <span>{incident.location.name}</span>
                        </div>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}
          </Map>
        </APIProvider>

        {/* Heatmap Controls & Risk Analysis Panel */}
        <HeatmapControlsPanel
          isOpen={isHeatmapPanelOpen}
          onClose={() => setIsHeatmapPanelOpen(false)}
          visible={showHeatmap}
          onToggleVisible={setShowHeatmap}
          timeRange={heatmapTimeRange}
          setTimeRange={setHeatmapTimeRange}
          selectedCategory={heatmapCategory}
          setSelectedCategory={setHeatmapCategory}
          minSeverity={heatmapMinSeverity}
          setMinSeverity={setHeatmapMinSeverity}
          weightMetric={heatmapWeightMetric}
          setWeightMetric={setHeatmapWeightMetric}
          radius={heatmapRadius}
          setRadius={setHeatmapRadius}
          opacity={heatmapOpacity}
          setOpacity={setHeatmapOpacity}
          gradient={heatmapGradient}
          setGradient={setHeatmapGradient}
          showIncidentPins={showHistoricalPins}
          setShowIncidentPins={setShowHistoricalPins}
          onSelectZone={(zone) => {
            setFlyTarget(zone.center);
            setFlyZoom(zone.zoom);
          }}
          filteredCount={filteredHistoricalIncidents.length}
          totalCount={HISTORICAL_DISASTERS_INDIA.length}
        />

        {/* Historical Incident Detail Briefing Modal */}
        <HistoricalIncidentModal
          incident={selectedHistoricalIncident}
          onClose={() => setSelectedHistoricalIncident(null)}
          onFlyTo={(coords) => {
            setFlyTarget(coords);
            setFlyZoom(13);
          }}
        />
      </div>

      {/* Bottom HUD Legend & Live Incident Metric */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 flex flex-wrap items-center gap-2.5 sm:gap-3 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 font-mono shadow-xl pointer-events-auto">
        <span className="flex items-center gap-1.5 text-slate-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          INCIDENTS ACTIVE: {incidents.length}
        </span>
        <div className="h-3 w-[1px] bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Moderate
          </span>
        </div>

        {/* Dynamic Heatmap Thermal Density Legend */}
        {showHeatmap && (
          <>
            <div className="h-3 w-[1px] bg-slate-700 hidden md:block" />
            <div className="flex items-center gap-2 text-[10px] text-slate-300">
              <span className="text-orange-400 font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400 animate-pulse shrink-0" />
                <span className="hidden lg:inline">12-MO</span> DENSITY:
              </span>
              <span className="text-cyan-400 text-[9px]">Low</span>
              <div
                className="h-2 w-20 md:w-28 rounded-full border border-slate-700 shadow-inner shrink-0"
                style={{
                  background:
                    heatmapGradient === 'thermal'
                      ? 'linear-gradient(to right, #06b6d4, #22c55e, #eab308, #f97316, #ef4444, #7f1d1d)'
                      : heatmapGradient === 'imd_radar'
                      ? 'linear-gradient(to right, #38bdf8, #4ade80, #facc15, #fb923c, #ef4444, #c026d3)'
                      : heatmapGradient === 'emergency'
                      ? 'linear-gradient(to right, #3b82f6, #9333ea, #ec4899, #ef4444)'
                      : 'linear-gradient(to right, #fef08a, #facc15, #f59e0b, #dc2626, #7f1d1d)',
                }}
              />
              <span className="text-red-400 font-bold text-[9px]">Critical Peak</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
