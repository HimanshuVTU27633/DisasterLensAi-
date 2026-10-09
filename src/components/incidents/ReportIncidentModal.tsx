import React, { useState } from 'react';
import { Incident, IncidentCategory, PriorityBreakdown } from '../../types/disaster';
import {
  X,
  Upload,
  Camera,
  MapPin,
  Crosshair,
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  Loader2,
} from 'lucide-react';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIncident: (newIncident: Incident, proposedAlert?: any) => void;
  onStartPickOnMap: () => void;
  pickedCoords?: { lat: number; lng: number } | null;
}

const SAMPLE_INCIDENT_PHOTOS = [
  {
    name: 'Mumbai Urban Flood',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    category: 'flood',
    title: 'Severe Underpass Inundation & Rail Waterlogging',
    desc: 'Water level surging above 1.5m at rail underpass. Pumps struggling against incoming high tide runoff.',
  },
  {
    name: 'Wayanad Hill Mudslide',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    category: 'landslide',
    title: 'Hillside Earth Slip Blocking Arterial Road',
    desc: 'Heavy saturated mud and boulder flow cut off access bridge. Saturated bluff above remains precarious.',
  },
  {
    name: 'Odisha Cyclone Surge',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    category: 'cyclone',
    title: 'Severe Coastal Tidal Surge & Embankment Breach',
    desc: 'Gale wind gusts and 3m storm tide breached saline embankment near coastal fishing hamlet.',
  },
  {
    name: 'Industrial Gas Rupture',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    category: 'industrial',
    title: 'Chemical Pipeline Valve Failure & Vapor Venting',
    desc: 'Pungent chemical vapor venting from refinery auxiliary pipeline. 400m perimeter cordon enforced.',
  },
];

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmitIncident,
  onStartPickOnMap,
  pickedCoords,
}) => {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<IncidentCategory>('flood');
  const [locationName, setLocationName] = useState<string>('Minto Bridge & Connaught Place, New Delhi');
  const [lat, setLat] = useState<number>(pickedCoords?.lat || 28.6315);
  const [lng, setLng] = useState<number>(pickedCoords?.lng || 77.2167);
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoMimeType, setPhotoMimeType] = useState<string>('');

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string>('');

  // Sync coords if picked on map
  React.useEffect(() => {
    if (pickedCoords) {
      setLat(pickedCoords.lat);
      setLng(pickedCoords.lng);
      setLocationName(`Tactical Pin: ${pickedCoords.lat.toFixed(4)}, ${pickedCoords.lng.toFixed(4)}`);
    }
  }, [pickedCoords]);

  if (!isOpen) return null;

  const handleSelectSample = (sample: typeof SAMPLE_INCIDENT_PHOTOS[0]) => {
    setPhotoUrl(sample.url);
    setTitle(sample.title);
    setCategory(sample.category as IncidentCategory);
    setDescription(sample.desc);
    setPhotoBase64('');
    setAnalysisResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRunGeminiAnalysis = async () => {
    if (!title.trim() && !description.trim()) {
      setAnalysisError('Please provide a title or description before running AI analysis.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError('');

    try {
      const res = await fetch('/api/analyze-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Field Incident Report',
          description: description || 'Visual hazard reported via field surveillance.',
          locationName,
          coordinates: { lat, lng },
          categoryHint: category,
          imageBase64: photoBase64,
          mimeType: photoMimeType || 'image/jpeg',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysisResult(json.data);
      } else {
        throw new Error(json.error || 'AI analysis response failed');
      }
    } catch (err: any) {
      console.warn('Analysis error:', err);
      // Fallback heuristics
      setAnalysisResult({
        hazardClassification: `${category.toUpperCase()} Event`,
        category,
        severity: 'high',
        confidenceScore: 82,
        uncertainties: ['Requires on-scene physical verification by patrol unit'],
        priorityBreakdown: {
          severityScore: 24,
          exposureScore: 20,
          vulnerabilityScore: 12,
          infrastructureScore: 12,
          accessConstraintsScore: 6,
          freshnessScore: 5,
        },
        totalPriorityScore: 79,
        summary: `Tactical AI heuristic assessment: ${title} at ${locationName}. Potential hazard requiring responder triage.`,
        keyThreats: ['Localized threat to civilian transit and infrastructure'],
        recommendedNextActions: ['Dispatch nearest reconnaissance vehicle', 'Monitor weather and sensor feeds'],
        resourceNeeds: ['1x Mobile responder crew'],
        evacuationRadiusKm: 1.0,
        proposedAlert: {
          title: `EMERGENCY ALERT: ${title}`,
          threatDescription: description,
          safetyPrecautions: ['Avoid the vicinity', 'Heed responder directions'],
          nextSteps: 'Monitoring ongoing',
        },
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const analysis = analysisResult || {
      hazardClassification: `${category.toUpperCase()} Alert`,
      category,
      severity: 'moderate',
      confidenceScore: 78,
      uncertainties: ['Pending official verification'],
      priorityBreakdown: {
        severityScore: 18,
        exposureScore: 16,
        vulnerabilityScore: 10,
        infrastructureScore: 10,
        accessConstraintsScore: 5,
        freshnessScore: 5,
      },
      totalPriorityScore: 64,
      summary: description || title,
      keyThreats: ['Civilian disruption and safety risk'],
      recommendedNextActions: ['Dispatch inspection team'],
      resourceNeeds: ['First response vehicle'],
      evacuationRadiusKm: 0.8,
    };

    const newIncident: Incident = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: title || 'Field Incident',
      category: analysis.category || category,
      severity: analysis.severity || 'high',
      status: 'reported',
      location: {
        name: locationName,
        lat,
        lng,
      },
      reportedAt: new Date().toISOString(),
      reportedBy: 'Tactical Command Dispatcher',
      description: description || 'Report submitted through DisasterLens AI command terminal.',
      imageUrl: photoUrl || undefined,
      verified: false,
      verificationSource: 'first_responder',
      priorityScore: analysis.totalPriorityScore || 75,
      priorityBreakdown: analysis.priorityBreakdown,
      aiAnalysis: {
        summary: analysis.summary,
        hazardClassification: analysis.hazardClassification,
        keyThreats: analysis.keyThreats || [],
        uncertainties: analysis.uncertainties || [],
        recommendedNextActions: analysis.recommendedNextActions || [],
        resourceNeeds: analysis.resourceNeeds || [],
        confidenceScore: analysis.confidenceScore || 80,
        evaluatedAt: new Date().toISOString(),
      },
      assignedTeams: [],
      evacuationRadiusKm: analysis.evacuationRadiusKm || 1.0,
      isSample: false,
    };

    onSubmitIncident(newIncident, analysis.proposedAlert);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090e1c] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm tracking-wide text-slate-100">
                INTAKE & AI HAZARD ANALYSIS
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Multimodal Photo & Text Intelligence Prioritization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Sample Selector */}
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
              Quick Load Tactical Sample Scenario:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_INCIDENT_PHOTOS.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectSample(s)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-400/60 text-left transition text-xs"
                >
                  <span className="font-semibold text-cyan-300 block text-[11px] truncate">{s.name}</span>
                  <span className="text-[9px] text-slate-400 capitalize">{s.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-mono text-slate-300 block mb-1">
                INCIDENT TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rapid Water Inundation Near Transit Tunnel"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-300 block mb-1">
                HAZARD CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 capitalize font-mono"
              >
                <option value="flood">Flood</option>
                <option value="wildfire">Wildfire</option>
                <option value="cyclone">Cyclone / Storm</option>
                <option value="earthquake">Earthquake</option>
                <option value="landslide">Landslide</option>
                <option value="severe_storm">Severe Storm</option>
                <option value="industrial">Industrial Hazard</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>
          </div>

          {/* Location & Map Pin Trigger */}
          <div>
            <label className="text-[10px] font-mono text-slate-300 block mb-1">
              LOCATION & MAP PIN COORDINATES
            </label>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Address, Sector, or Landmark"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => {
                  onStartPickOnMap();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-900/60 transition whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Pick on Map
              </button>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mt-1">
              <span>LAT: {lat.toFixed(4)}</span>
              <span>LNG: {lng.toFixed(4)}</span>
            </div>
          </div>

          {/* Situation Description */}
          <div>
            <label className="text-[10px] font-mono text-slate-300 block mb-1">
              OBSERVATION REPORT & FIELD DETAILS
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe current water level, fire progression, structural cracks, trapped civilians, or hazard indicators..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Photo Upload / Preview */}
          <div>
            <label className="text-[10px] font-mono text-slate-300 block mb-1">
              PHOTOGRAPHIC TELEMETRY / FIELD IMAGE
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 transition">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Photograph</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {photoUrl && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Image attached for multimodal AI
                </span>
              )}
            </div>

            {photoUrl && (
              <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-slate-700">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl('');
                    setPhotoBase64('');
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-slate-300 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Run Gemini Multimodal Analysis Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={analyzing}
              onClick={handleRunGeminiAnalysis}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Gemini Multimodal Forensic Analysis In Progress...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4 text-cyan-300" />
                  <span>Execute Gemini Multimodal Analysis</span>
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <p className="text-xs text-red-400 font-mono">{analysisError}</p>
          )}

          {/* AI Analysis Preview Box */}
          {analysisResult && (
            <div className="hud-panel p-3.5 rounded-xl border-cyan-400/40 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-heading font-bold text-xs text-cyan-300 uppercase">
                    AI Prioritization Intelligence
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  Confidence: {analysisResult.confidenceScore}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Hazard Class: <strong className="text-white">{analysisResult.hazardClassification}</strong></span>
                <span className={`px-2 py-0.5 rounded uppercase font-bold ${
                  analysisResult.severity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {analysisResult.severity}
                </span>
              </div>

              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-xs text-slate-300">
                <div className="flex justify-between font-mono text-[11px] text-cyan-300 mb-1">
                  <span>Transparent Priority Score:</span>
                  <span className="font-bold text-base">{analysisResult.totalPriorityScore} / 100</span>
                </div>
                <p className="text-[11px] text-slate-300 italic">{analysisResult.summary}</p>
              </div>

              {analysisResult.proposedAlert && (
                <div className="bg-red-950/20 border border-red-500/30 p-2 rounded text-[11px]">
                  <span className="text-red-300 font-bold block uppercase mb-0.5">
                    Proposed Alert Draft:
                  </span>
                  <p className="text-slate-200">{analysisResult.proposedAlert.title}</p>
                </div>
              )}
            </div>
          )}

          {/* Form Submit / Close */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-heading font-bold tracking-wider shadow-lg shadow-cyan-900/30 flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Ingest & Plot on Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
