// Sound synthesizer, Emergency Siren Generator, PA Voice Announcer & Web Notification system for DisasterLens AI

export type SirenType = 'cyclone_wail' | 'flood_rapid' | 'hazmat_warble' | 'all_clear';

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private activeSirenOscillators: {
    carrier?: OscillatorNode;
    modulator?: OscillatorNode;
    gainNode?: GainNode;
    intervalId?: any;
  } | null = null;
  private currentSirenType: SirenType | null = null;
  private sirenVolume: number = 0.3;

  constructor() {
    this.soundEnabled = localStorage.getItem('disasterlens_sound') !== 'false';
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('disasterlens_sound', String(enabled));
    if (!enabled) {
      this.stopSiren();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSirenVolume(vol: number) {
    this.sirenVolume = Math.max(0.05, Math.min(1.0, vol));
    if (this.activeSirenOscillators?.gainNode) {
      this.activeSirenOscillators.gainNode.gain.setValueAtTime(
        this.sirenVolume,
        this.ctx?.currentTime || 0
      );
    }
  }

  public getSirenVolume(): number {
    return this.sirenVolume;
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Tactical radar ping for critical incident
  public playCriticalAlert() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.3);

      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  // Subtle telemetry chime
  public playTelemetryChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // EMERGENCY SIREN SYNTHESIZER ENGINE
  // ==========================================
  public startSiren(type: SirenType = 'cyclone_wail') {
    this.stopSiren();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const carrier = ctx.createOscillator();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.sirenVolume, now);

      if (type === 'cyclone_wail') {
        // Continuous rising and falling siren (400 Hz to 900 Hz, 3.5s cycle)
        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(450, now);

        // Low-Frequency Oscillator (LFO) for smooth pitch sweep
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.3, now); // ~3.3 second period
        lfoGain.gain.setValueAtTime(350, now); // Amplitude: +/- 350 Hz

        lfo.connect(lfoGain);
        lfoGain.connect(carrier.frequency);
        carrier.connect(gainNode);
        gainNode.connect(ctx.destination);

        carrier.start(now);
        lfo.start(now);

        this.activeSirenOscillators = { carrier, modulator: lfo, gainNode };
      } else if (type === 'flood_rapid') {
        // Rapid pulsing evacuation wail (600 Hz to 1100 Hz, 1.2s period)
        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(650, now);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'triangle';
        lfo.frequency.setValueAtTime(1.0, now); // 1.0 Hz fast period
        lfoGain.gain.setValueAtTime(350, now);

        lfo.connect(lfoGain);
        lfoGain.connect(carrier.frequency);
        carrier.connect(gainNode);
        gainNode.connect(ctx.destination);

        carrier.start(now);
        lfo.start(now);

        this.activeSirenOscillators = { carrier, modulator: lfo, gainNode };
      } else if (type === 'hazmat_warble') {
        // Alternating two-tone warble (800 Hz / 450 Hz rapid pulse)
        carrier.type = 'square';
        carrier.frequency.setValueAtTime(800, now);

        let high = true;
        const intervalId = setInterval(() => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          high = !high;
          carrier.frequency.setValueAtTime(high ? 850 : 480, t);
        }, 220);

        carrier.connect(gainNode);
        gainNode.connect(ctx.destination);
        carrier.start(now);

        this.activeSirenOscillators = { carrier, gainNode, intervalId };
      } else if (type === 'all_clear') {
        // Steady continuous 440 Hz single tone (All-Clear)
        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(440, now);
        carrier.connect(gainNode);
        gainNode.connect(ctx.destination);
        carrier.start(now);

        this.activeSirenOscillators = { carrier, gainNode };
      }

      this.currentSirenType = type;
    } catch (err) {
      console.warn('Could not initialize siren generator:', err);
    }
  }

  public stopSiren() {
    if (this.activeSirenOscillators) {
      try {
        if (this.activeSirenOscillators.intervalId) {
          clearInterval(this.activeSirenOscillators.intervalId);
        }
        if (this.activeSirenOscillators.carrier) {
          this.activeSirenOscillators.carrier.stop();
          this.activeSirenOscillators.carrier.disconnect();
        }
        if (this.activeSirenOscillators.modulator) {
          this.activeSirenOscillators.modulator.stop();
          this.activeSirenOscillators.modulator.disconnect();
        }
        if (this.activeSirenOscillators.gainNode) {
          this.activeSirenOscillators.gainNode.disconnect();
        }
      } catch {
        // Ignore
      }
      this.activeSirenOscillators = null;
      this.currentSirenType = null;
    }
  }

  public isSirenActive(): boolean {
    return this.activeSirenOscillators !== null;
  }

  public getCurrentSirenType(): SirenType | null {
    return this.currentSirenType;
  }

  // ==========================================
  // PUBLIC ADDRESS (PA) VOICE SYNTHESIS
  // ==========================================
  public speakPublicAnnouncement(text: string, lang: 'en' | 'hi' = 'en') {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Halt existing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // Clear emergency dispatcher pace
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis unavailable:', err);
    }
  }

  public stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioManager = new AudioManager();

// Browser Notification Service
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

export function getBrowserNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (err) {
    console.warn('Browser notification could not be shown:', err);
  }
}
