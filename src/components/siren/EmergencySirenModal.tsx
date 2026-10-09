import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  Radio,
  Mic,
  ShieldAlert,
  Clock,
  Sliders,
  BellRing,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { audioManager, SirenType } from '../../utils/soundAndNotifications';

interface EmergencySirenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSirenToggled: (isActive: boolean, sirenType: string, sector: string) => void;
}

const SIREN_TYPES: { id: SirenType; label: string; desc: string; color: string }[] = [
  {
    id: 'cyclone_wail',
    label: 'Cyclone & Landslide Wail',
    desc: '450–950 Hz undulating continuous acoustic wail. Standard for coastal cyclones and landslide evacuations.',
    color: 'text-red-400 border-red-500/50',
  },
  {
    id: 'flood_rapid',
    label: 'Flash Flood Rapid Pulse',
    desc: '650–1100 Hz high-frequency undulating pulse. Used for sudden dam spillway discharge and river inundation.',
    color: 'text-orange-400 border-orange-500/50',
  },
  {
    id: 'hazmat_warble',
    label: 'Industrial & Gas Leak Warble',
    desc: '850/480 Hz rapid two-tone alternating warble horn. Mandatory for toxic gas leaks and industrial exclusions.',
    color: 'text-amber-400 border-amber-500/50',
  },
  {
    id: 'all_clear',
    label: 'All-Clear Civil Defense Tone',
    desc: '440 Hz steady continuous single pitch. Signals danger has subsided and normal operations can resume.',
    color: 'text-emerald-400 border-emerald-500/50',
  },
];

const SECTORS = [
  'Wayanad Chooralmala Hill Tracts (Kerala)',
  'Mumbai Mithi River Basin & Kurla (Maharashtra)',
  'Paradip Port & Jagatsinghpur Coast (Odisha)',
  'Brahmaputra Kaliabor & Kaziranga (Assam)',
  'Delhi Yamuna Floodplain & Ring Road',
  'Chamoli & Joshimath Slopes (Uttarakhand)',
  'All-India National Broadcast Net',
];

export const EmergencySirenModal: React.FC<EmergencySirenModalProps> = ({
  isOpen,
  onClose,
  onSirenToggled,
}) => {
  const [selectedType, setSelectedType] = useState<SirenType>('cyclone_wail');
  const [selectedSector, setSelectedSector] = useState<string>(SECTORS[0]);
  const [volume, setVolume] = useState<number>(audioManager.getSirenVolume());
  const [autoDuration, setAutoDuration] = useState<number>(30); // seconds (0 = continuous)
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(audioManager.isSirenActive());
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  const [paLanguage, setPaLanguage] = useState<'en' | 'hi'>('en');
  const [isSpeakingPa, setIsSpeakingPa] = useState<boolean>(false);

  // Sync state if audioManager changes
  useEffect(() => {
    setIsSirenPlaying(audioManager.isSirenActive());
  }, [isOpen]);

  // Handle auto-silence countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isSirenPlaying && autoDuration > 0) {
      setTimerRemaining(autoDuration);
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleStopSiren();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimerRemaining(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSirenPlaying, autoDuration]);

  if (!isOpen) return null;

  const handleStartSiren = () => {
    audioManager.setSirenVolume(volume);
    audioManager.startSiren(selectedType);
    setIsSirenPlaying(true);
    onSirenToggled(true, selectedType, selectedSector);
  };

  const handleStopSiren = () => {
    audioManager.stopSiren();
    setIsSirenPlaying(false);
    setTimerRemaining(null);
    onSirenToggled(false, selectedType, selectedSector);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioManager.setSirenVolume(newVol);
  };

  // Public Address Voice Announcement
  const handleTriggerPaVoice = () => {
    setIsSpeakingPa(true);
    const textEn = `Attention! Civil Defense Emergency Evacuation Warning issued for ${selectedSector}. Severe hazard imminent. All citizens must proceed immediately to designated elevated concrete shelters.`;
    const textHi = `ध्यान दें! ${selectedSector} के लिए नागरिक सुरक्षा आपातकालीन निकासी चेतावनी जारी की गई है। सभी नागरिक तुरंत सुरक्षित और ऊंचे स्थानों पर जाएं।`;

    audioManager.speakPublicAnnouncement(paLanguage === 'hi' ? textHi : textEn, paLanguage);
    setTimeout(() => {
      setIsSpeakingPa(false);
    }, 9000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className={`relative w-full max-w-xl bg-[#090e1c] border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        isSirenPlaying ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.35)]' : 'border-cyan-500/40'
      }`}>
        {/* Top Flashing Strobe Bar when Siren is Active */}
        {isSirenPlaying && (
          <div className="h-2 w-full bg-red-600 animate-pulse shadow-[0_0_20px_#ef4444]" />
        )}

        {/* Modal Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isSirenPlaying
                ? 'bg-red-950 border-red-500 text-red-400 animate-bounce'
                : 'bg-cyan-950 border-cyan-500/40 text-cyan-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm tracking-wide text-slate-100 flex items-center gap-2">
                CIVIL DEFENSE EMERGENCY SIREN COMMAND
                {isSirenPlaying && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse">
                    SIREN SOUNDING NOW
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Acoustic Evacuation Sirens & Public Address (PA) Voice System
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

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[82vh]">
          {/* Main Big Siren Trigger Action Button */}
          <div className="text-center py-2">
            {!isSirenPlaying ? (
              <button
                type="button"
                onClick={handleStartSiren}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-heading font-bold text-sm uppercase tracking-widest shadow-2xl shadow-red-950 flex flex-col items-center justify-center gap-1.5 transition transform hover:scale-[1.01] active:scale-[0.99] border border-red-400/50"
              >
                <div className="flex items-center gap-2 text-base">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span>START EMERGENCY SIREN</span>
                </div>
                <span className="text-[10px] font-mono font-normal opacity-90 tracking-normal">
                  Broadcasts acoustic wailing alarm for evacuation alert
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopSiren}
                className="w-full py-4 rounded-2xl bg-red-950 border-2 border-red-500 text-red-200 font-heading font-bold text-sm uppercase tracking-widest shadow-[0_0_35px_rgba(239,68,68,0.4)] flex flex-col items-center justify-center gap-1.5 transition animate-pulse hover:bg-red-900"
              >
                <div className="flex items-center gap-2 text-base text-white">
                  <VolumeX className="w-5 h-5" />
                  <span>SILENCE ACTIVE SIREN</span>
                </div>
                <span className="text-[10px] font-mono text-red-300 tracking-normal">
                  {timerRemaining !== null ? `Auto-silencing in ${timerRemaining}s` : 'Continuous broadcast active — Click to halt'}
                </span>
              </button>
            )}
          </div>

          {/* Visual Siren Soundwave Spectrum */}
          {isSirenPlaying && (
            <div className="hud-panel p-3 rounded-xl border border-red-500/50 bg-red-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-spin" />
                <span className="text-xs font-mono text-red-300 font-bold uppercase">
                  Acoustic Beacon Transmitting
                </span>
              </div>

              {/* Animated audio bars */}
              <div className="flex items-center gap-1">
                {[4, 12, 8, 16, 10, 14, 6, 16, 12, 8, 14, 6].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-400 rounded-full animate-pulse"
                    style={{
                      height: `${h + (i % 3) * 3}px`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Target Sector Selection */}
          <div>
            <label className="text-[10px] font-mono text-slate-300 block mb-1">
              TARGET BROADCAST SECTOR (INDIA)
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              disabled={isSirenPlaying}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
            >
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Siren Warning Types */}
          <div>
            <label className="text-[10px] font-mono text-slate-300 block mb-1.5">
              SIREN SIGNAL PATTERN TYPE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SIREN_TYPES.map((st) => {
                const isSelected = selectedType === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    disabled={isSirenPlaying}
                    onClick={() => setSelectedType(st.id)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className={`font-heading font-bold text-xs block mb-0.5 ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight block">
                      {st.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer & Volume Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            {/* Auto-Silence Duration */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Auto-Silence Timer:
                </span>
                <span className="text-cyan-300 font-bold">
                  {autoDuration === 0 ? 'Continuous' : `${autoDuration}s`}
                </span>
              </div>
              <div className="flex gap-1.5 text-xs font-mono">
                {[15, 30, 60, 0].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={isSirenPlaying}
                    onClick={() => setAutoDuration(d)}
                    className={`flex-1 py-1 rounded border text-[11px] transition ${
                      autoDuration === d
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {d === 0 ? 'Manual' : `${d}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Output Volume:
                </span>
                <span className="text-cyan-300 font-bold">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Public Address (PA) Voice Synthesizer Announcement */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
              <span className="font-heading font-bold text-cyan-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                Public Address (PA) Voice Dispatcher
              </span>
              <div className="flex gap-1 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setPaLanguage('en')}
                  className={`px-2 py-0.5 rounded transition ${
                    paLanguage === 'en'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setPaLanguage('hi')}
                  className={`px-2 py-0.5 rounded transition ${
                    paLanguage === 'hi'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 font-sans italic leading-snug">
              {paLanguage === 'hi'
                ? `\"ध्यान दें! ${selectedSector} के लिए नागरिक सुरक्षा आपातकालीन निकासी चेतावनी जारी की गई है। सभी नागरिक तुरंत सुरक्षित और ऊंचे स्थानों पर जाएं।\"`
                : `\"Attention! Civil Defense Emergency Evacuation Warning issued for ${selectedSector}. Severe hazard imminent. Proceed immediately to designated shelters.\"`}
            </p>

            <button
              type="button"
              onClick={handleTriggerPaVoice}
              disabled={isSpeakingPa}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isSpeakingPa ? 'Speaking Over PA Speakers...' : 'Broadcast PA Voice Announcement'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-slate-400">
            Civil Defense Protocol 44-B • Indian Disaster Management Guidelines
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
