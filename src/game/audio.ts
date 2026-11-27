// Synthesized Web Audio API sound engine for retro 8-bit / 16-bit platformer

interface ActiveMusicTrack {
  theme: string;
  gainNode: GainNode;
  intervalId: number | null;
  padOscillators: OscillatorNode[];
  padGain: GainNode | null;
  cleanupTimeout: number | null;
  stopped: boolean;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private activeTrack: ActiveMusicTrack | null = null;
  private fadingTracks: Set<ActiveMusicTrack> = new Set();
  private currentMusicTheme: string | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private unlocked = false;

  constructor() {
    this.attachMobileUnlockListeners();
  }

  private enableIOSPlaybackSession() {
    try {
      const nav = navigator as unknown as { audioSession?: { type: string } };
      if (nav && nav.audioSession && nav.audioSession.type !== 'playback') {
        nav.audioSession.type = 'playback';
      }
    } catch {
      // Ignore on browsers without navigator.audioSession
    }
  }

  private attachMobileUnlockListeners() {
    if (typeof window === 'undefined') return;
    const handleGesture = () => {
      this.unlock();
    };
    const events: Array<keyof WindowEventMap> = [
      'touchstart',
      'touchend',
      'pointerdown',
      'mousedown',
      'keydown',
      'click',
    ];
    events.forEach(evt => {
      window.addEventListener(evt, handleGesture, { capture: true, passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.ctx) {
        if (this.ctx.state !== 'running') {
          this.unlocked = false;
          this.ctx.resume().catch(() => {});
        }
      }
    });

    window.addEventListener('pageshow', () => {
      if (this.ctx && this.ctx.state !== 'running') {
        this.unlocked = false;
        this.ctx.resume().catch(() => {});
      }
    });
  }

  public unlock() {
    this.enableIOSPlaybackSession();
    this.initContext();
    if (!this.ctx) return;

    const resumePromise =
      this.ctx.state !== 'running'
        ? this.ctx.resume().catch(() => {})
        : Promise.resolve();

    if (!this.unlocked) {
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
      } catch {
        // Ignore silent-buffer unlock failures
      }
    }

    resumePromise.then(() => {
      if (!this.ctx) return;
      if (this.ctx.state === 'running') {
        this.unlocked = true;
        if (this.musicEnabled && this.currentMusicTheme && !this.activeTrack) {
          this.playMusic(this.currentMusicTheme, 0.75);
        }
      }
    });
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.noiseBuffer) {
      const length = Math.floor(this.ctx.sampleRate * 0.5);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  private playNoiseBurst(
    duration: number,
    filterFreq: number,
    filterType: BiquadFilterType,
    volume: number,
    target: AudioNode,
    delay = 0
  ) {
    if (!this.ctx) return;
    const buffer = this.getNoiseBuffer();
    if (!buffer) return;
    const now = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(Math.max(0.001, volume), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(target);
    src.start(now);
    src.stop(now + duration + 0.01);
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      this.enableIOSPlaybackSession();
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.ctx.onstatechange = () => {
        if (this.ctx && this.ctx.state === 'running') {
          this.unlocked = true;
        } else if (this.ctx && this.ctx.state !== 'running') {
          this.unlocked = false;
        }
      };

      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.14;
      compressor.connect(this.ctx.destination);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.88;
      this.masterGain.connect(compressor);

      // Warm music bus with subtle low-pass smoothing for rich non-harsh timber
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.value = 3400;
      this.musicFilter.Q.value = 0.6;
      this.musicFilter.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicEnabled ? 0.36 : 0;
      this.musicGain.connect(this.musicFilter);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.soundEnabled ? 0.78 : 0;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state !== 'running') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (enabled) this.unlock();
    if (this.sfxGain) {
      this.sfxGain.gain.value = enabled ? 0.75 : 0;
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) this.unlock();
    if (this.musicGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(enabled ? 0.36 : 0, now + 0.12);
    } else if (this.musicGain) {
      this.musicGain.gain.value = enabled ? 0.36 : 0;
    }
    if (!enabled) {
      this.stopMusic(0.18, true);
    } else if (this.currentMusicTheme) {
      this.playMusic(this.currentMusicTheme, 0.8);
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  // --- Sound Effects (Layered Organic + Retro Synthesis) ---

  public playJump(isBig = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Soft feather wing-flutter transient
    this.playNoiseBurst(0.085, isBig ? 1400 : 1900, 'bandpass', 0.16, this.sfxGain);

    // Crisp upward avian spring tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const startFreq = isBig ? 250 : 340;
    const endFreq = isBig ? 580 : 820;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.13);

    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playCoin() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Dual-harmonic shimmering bell chime (B5 -> E6 + octave sparkle)
    const tones = [
      { freq: 987.77, delay: 0, dur: 0.14, vol: 0.24, type: 'triangle' as OscillatorType },
      { freq: 1318.51, delay: 0.065, dur: 0.24, vol: 0.26, type: 'sine' as OscillatorType },
      { freq: 2637.02, delay: 0.07, dur: 0.16, vol: 0.09, type: 'sine' as OscillatorType },
    ];
    tones.forEach(t => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = t.type;
      osc.frequency.setValueAtTime(t.freq, now + t.delay);
      gain.gain.setValueAtTime(t.vol, now + t.delay);
      gain.gain.exponentialRampToValueAtTime(0.004, now + t.delay + t.dur);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + t.delay);
      osc.stop(now + t.delay + t.dur + 0.01);
    });
  }

  public playAttack(isGold = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Crisp air-cutting blade swoosh
    this.playNoiseBurst(0.11, isGold ? 2800 : 2100, 'bandpass', 0.24, this.sfxGain);

    // Metallic blade harmonic ring
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isGold ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isGold ? 880 : 620, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.11);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Impact thud noise
    this.playNoiseBurst(0.12, 650, 'lowpass', 0.28, this.sfxGain);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.21);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);

    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playEnemyDefeat() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Satisfying stomp punch + soft puff
    this.playNoiseBurst(0.09, 1200, 'bandpass', 0.22, this.sfxGain);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(72, now + 0.16);
    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.17);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);

    // Quick bright confirmation pop
    const pop = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    pop.type = 'sine';
    pop.frequency.setValueAtTime(520, now + 0.05);
    pop.frequency.exponentialRampToValueAtTime(860, now + 0.14);
    popGain.gain.setValueAtTime(0.18, now + 0.05);
    popGain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);
    pop.connect(popGain);
    popGain.connect(this.sfxGain);
    pop.start(now + 0.05);
    pop.stop(now + 0.16);
  }

  public playEggCrack() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Crisp organic eggshell snap
    this.playNoiseBurst(0.075, 2400, 'highpass', 0.28, this.sfxGain);
    this.playNoiseBurst(0.055, 1600, 'bandpass', 0.2, this.sfxGain, 0.04);

    // Cute baby chick peep follow-up
    setTimeout(() => {
      if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
      const t = this.ctx.currentTime;
      const chirp = this.ctx.createOscillator();
      const chirpGain = this.ctx.createGain();
      chirp.type = 'sine';
      chirp.frequency.setValueAtTime(1450, t);
      chirp.frequency.exponentialRampToValueAtTime(1950, t + 0.07);
      chirp.frequency.exponentialRampToValueAtTime(1600, t + 0.12);
      chirpGain.gain.setValueAtTime(0.24, t);
      chirpGain.gain.exponentialRampToValueAtTime(0.008, t + 0.13);
      chirp.connect(chirpGain);
      chirpGain.connect(this.sfxGain);
      chirp.start(t);
      chirp.stop(t + 0.14);
    }, 115);
  }

  public playChest() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Subtle wooden latch click + sparkling treasure arpeggio
    this.playNoiseBurst(0.05, 900, 'bandpass', 0.18, this.sfxGain);
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = this.ctx.currentTime + idx * 0.08;

      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.008, noteTime + 0.26);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.28);
    });
  }

  public playCheckpoint() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });
  }

  public playCountdownBeep(count: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pitch rises as countdown nears 1: 3 -> 660Hz, 2 -> 770Hz, 1 -> 880Hz
    const freq = count === 1 ? 880 : (count === 2 ? 770 : 660);
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playFightGong() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Resonant battle gong & brass explosion
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.65);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  public playBadgeUnlock() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [349.23, 440.00, 523.25, 698.46, 880.00, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = this.ctx.currentTime + idx * 0.085;

      osc.type = idx >= 4 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  public playPowerUp() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = this.ctx.currentTime + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.32, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  public playVolcanoWarning() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playRockSmash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.24);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playVolcanoEruption() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playBoulderRumble() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playLightning() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playEvolution() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [392.00, 440.00, 523.25, 659.25, 783.99, 1046.50]; // G4, A4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = this.ctx.currentTime + idx * 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  public playLevelClear() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = this.ctx.currentTime + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.4, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  // --- Player Sound Effects ---

  public playFootstep(
    surface: 'grass' | 'wood' | 'snow' | 'stone' | 'jungle' = 'grass',
    stage: 'egg' | 'baby' | 'juvenile' | 'teen' | 'adult' = 'baby'
  ) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const stagePitch = (stage === 'egg' || stage === 'baby') ? 1.38 : stage === 'juvenile' ? 1.18 : stage === 'teen' ? 1.04 : 0.9;
    const jitter = 0.92 + Math.random() * 0.16;

    // 1. Primary foot tap body
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    let baseFreq = 190;
    let endFreq = 72;
    let dur = 0.055;
    let vol = 0.2;

    if (surface === 'wood') {
      osc.type = 'triangle';
      baseFreq = 310;
      endFreq = 115;
      dur = 0.05;
      vol = 0.24;
    } else if (surface === 'stone') {
      osc.type = 'triangle';
      baseFreq = 420;
      endFreq = 165;
      dur = 0.042;
      vol = 0.22;
    } else if (surface === 'snow') {
      osc.type = 'sine';
      baseFreq = 165;
      endFreq = 65;
      dur = 0.062;
      vol = 0.18;
    } else if (surface === 'jungle') {
      osc.type = 'sine';
      baseFreq = 210;
      endFreq = 80;
      dur = 0.06;
      vol = 0.2;
    } else {
      osc.type = 'triangle';
      baseFreq = 185;
      endFreq = 68;
      dur = 0.052;
      vol = 0.2;
    }

    osc.frequency.setValueAtTime(baseFreq * stagePitch * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(35, endFreq * stagePitch), now + dur);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.01);

    // 2. Crisp surface texture brush/crunch noise
    const noiseDur = surface === 'snow' ? 0.052 : 0.032;
    const len = Math.floor(this.ctx.sampleRate * noiseDur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.pow(1 - i / len, surface === 'snow' ? 1.6 : 2.3);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(
      surface === 'snow' ? 2900 : surface === 'stone' ? 2400 : surface === 'wood' ? 1400 : surface === 'jungle' ? 1650 : 1350,
      now
    );
    filter.Q.setValueAtTime(surface === 'snow' ? 1.4 : 2.1, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(surface === 'snow' ? 0.22 : 0.14, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDur);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  public playShieldBlock() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // 1. Heavy metallic impact clang
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(920, now);
    osc1.frequency.exponentialRampToValueAtTime(420, now + 0.22);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1840, now);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.28);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  }

  public playChickenCluck() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.linearRampToValueAtTime(640, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // --- Silkie Sam Merchant Voice & Speech Sound Effects ---
  public playSilkieSpeech(type: 'welcome' | 'again' | 'purchase' | 'talk' = 'talk') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const baseTime = this.ctx.currentTime;

    // Pattern definitions for each speech dialogue
    let syllables: Array<{ freq: number; dur: number; type: OscillatorType; sweep?: number; delay: number }>;

    if (type === 'welcome') {
      // Cheerful 6-note friendly merchant chicken greeting: "hello welcome to the shop!"
      syllables = [
        { freq: 520, dur: 0.08, type: 'triangle', sweep: 640, delay: 0 },
        { freq: 660, dur: 0.07, type: 'sawtooth', sweep: 780, delay: 0.09 },
        { freq: 880, dur: 0.09, type: 'triangle', sweep: 980, delay: 0.17 },
        { freq: 740, dur: 0.08, type: 'sawtooth', sweep: 860, delay: 0.27 },
        { freq: 990, dur: 0.10, type: 'sine', sweep: 1180, delay: 0.36 },
        { freq: 1320, dur: 0.14, type: 'triangle', sweep: 1050, delay: 0.47 },
      ];
    } else if (type === 'again') {
      // Warm, quick 4-note recognition chatter: "hello again"
      syllables = [
        { freq: 580, dur: 0.08, type: 'triangle', sweep: 720, delay: 0 },
        { freq: 720, dur: 0.08, type: 'sawtooth', sweep: 880, delay: 0.09 },
        { freq: 960, dur: 0.11, type: 'triangle', sweep: 1200, delay: 0.19 },
        { freq: 880, dur: 0.14, type: 'sine', sweep: 820, delay: 0.31 },
      ];
    } else if (type === 'purchase') {
      // Delightful, overjoyed merchant cluck + coin chime flourish: "thanks for your purchase!"
      syllables = [
        { freq: 784, dur: 0.08, type: 'triangle', sweep: 940, delay: 0 },
        { freq: 987, dur: 0.09, type: 'sawtooth', sweep: 1170, delay: 0.09 },
        { freq: 1175, dur: 0.10, type: 'triangle', sweep: 1400, delay: 0.19 },
        { freq: 1568, dur: 0.16, type: 'sine', sweep: 1760, delay: 0.29 },
      ];

      // Add a sparkly merchant chime on purchase!
      const chimeNotes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
      chimeNotes.forEach((cFreq, cIdx) => {
        if (!this.ctx || !this.sfxGain) return;
        const cOsc = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        const cTime = baseTime + 0.12 + cIdx * 0.07;
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(cFreq, cTime);
        cGain.gain.setValueAtTime(0.2, cTime);
        cGain.gain.exponentialRampToValueAtTime(0.001, cTime + 0.24);
        cOsc.connect(cGain);
        cGain.connect(this.sfxGain);
        cOsc.start(cTime);
        cOsc.stop(cTime + 0.25);
      });
    } else {
      // General short speech chirp / syllable chatter
      syllables = [
        { freq: 640 + Math.random() * 200, dur: 0.07, type: 'triangle', sweep: 800, delay: 0 },
        { freq: 760 + Math.random() * 200, dur: 0.09, type: 'sawtooth', sweep: 600, delay: 0.08 },
      ];
    }

    // Play each vocalized speech syllable
    syllables.forEach(({ freq, dur, type: oscType, sweep, delay }) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = baseTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, t);
      if (sweep) {
        osc.frequency.exponentialRampToValueAtTime(sweep, t + dur);
      }

      // Soft friendly envelope with gentle attack and decay
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.26, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.005, t + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  }

  // Rapid speech typewriter chirp for individual letters/words
  public playSilkieSpeechChirp(pitchModifier: number = 0) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 650 + (pitchModifier % 5) * 60;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, t + 0.04);

    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playPlayerDeath() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 392, 349.23, 293.66, 220, 146.83];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // --- Enemy Sound Effects ---

  // 1. FOX
  public playFoxBark() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.linearRampToValueAtTime(940, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.14);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playFoxHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 2. WOLF
  public playWolfHowl() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(290, now + 0.55);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  public playWolfBite() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playWolfHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.linearRampToValueAtTime(620, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 3. BEAR
  public playBearRoar() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(130, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.5);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playBearSlam() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playBearHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playSnakeHiss() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 0.28;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3800, now);
    filter.frequency.exponentialRampToValueAtTime(6200, now + 0.14);
    filter.frequency.exponentialRampToValueAtTime(2800, now + duration);
    filter.Q.value = 3.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.008, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  public playSnakeHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.16);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playPoisonTick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  // 4. FARMER MINI-BOSS (Gruff barnyard speech, shin-peck yelp & pitchfork lunge)
  public playFarmerSpeech(tone: 'gruff' | 'ouch' | 'rematch' | 'defeat' = 'gruff') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const patterns: Record<typeof tone, number[]> = {
      gruff: [155, 185, 145, 170],
      ouch: [290, 390, 210, 175],
      rematch: [140, 165, 200, 150, 190],
      defeat: [205, 175, 145, 115],
    };
    const notes = patterns[tone];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.085;
      osc.type = tone === 'ouch' ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * (tone === 'ouch' ? 1.18 : 0.92), t + 0.07);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.008, t + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.085);
    });
  }

  public playFarmerHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(360, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(135, now + 0.22);
    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playFarmerLunge() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  // --- Cockatrice Boss Sound Effects ---

  public playBossDialogueVoice() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80 + Math.random() * 60, now);
    osc.frequency.linearRampToValueAtTime(140 + Math.random() * 40, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playCockatriceScreech() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.linearRampToValueAtTime(780, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.45);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.48);
  }

  public playBossFireWindup() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.6);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.55);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  public playBossFireShoot() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playBossBiteCrunch() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Massive jaw snap + wood/stone crunch
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(260, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.25);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(180, now);
    osc2.frequency.exponentialRampToValueAtTime(30, now + 0.28);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  public playFireDeflect() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Resonant magical parry chime
    const freqs = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  public playBossStunKnockdown() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // 1. Heavy crash thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.45);

    // 2. Cartoon dizzy ringing stars sound
    const starNotes = [1174.66, 1318.51, 1396.91, 1567.98, 1760.00];
    starNotes.forEach((n, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const sOsc = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      const st = now + 0.2 + idx * 0.1;

      sOsc.type = 'triangle';
      sOsc.frequency.setValueAtTime(n, st);

      sGain.gain.setValueAtTime(0.25, st);
      sGain.gain.exponentialRampToValueAtTime(0.005, st + 0.2);

      sOsc.connect(sGain);
      sGain.connect(this.sfxGain);

      sOsc.start(st);
      sOsc.stop(st + 0.22);
    });
  }

  public playBossHit(hitNumber: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Pitch rises with each consecutive hit (1, 2, 3)
    const baseFreq = hitNumber === 1 ? 260 : (hitNumber === 2 ? 340 : 440);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playBossDefeat() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Grand explosion + victory fanfare
    const chords = [
      [261.63, 329.63, 392.00], // C maj
      [349.23, 440.00, 523.25], // F maj
      [392.00, 493.88, 587.33], // G maj
      [523.25, 659.25, 783.99, 1046.50] // C maj grand
    ];

    chords.forEach((chord, cIdx) => {
      const cTime = this.ctx!.currentTime + cIdx * 0.24;
      chord.forEach(freq => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, cTime);

        gain.gain.setValueAtTime(0.3, cTime);
        gain.gain.exponentialRampToValueAtTime(0.005, cTime + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(cTime);
        osc.stop(cTime + 0.45);
      });
    });
  }

  public playVictory() {
    this.playBossDefeat();
  }

  // --- Procedural Adventure & Dynamic Biome Ambient Music (Smooth Crossfade Engine) ---

  public getAmbientThemeForBiome(biome: string, hasCompletedGame = false): string {
    switch (biome) {
      case 'coop':
        return 'ambient_plains';
      case 'trail':
      case 'juvenile':
        return 'ambient_trail';
      case 'jungle':
        return 'ambient_jungle';
      case 'storm':
      case 'snowy':
        return 'ambient_arctic';
      case 'fields':
        return hasCompletedGame ? 'ambient_sanctuary' : 'ambient_volcanic';
      case 'desert':
        return 'ambient_desert';
      case 'coast':
        return 'ambient_coast';
      default:
        return 'ambient_plains';
    }
  }

  public playBiomeAmbient(biome: string, hasCompletedGame = false, fadeDuration = 1.35) {
    const ambientTheme = this.getAmbientThemeForBiome(biome, hasCompletedGame);
    this.playMusic(ambientTheme, fadeDuration);
  }

  public getCurrentMusicTheme(): string | null {
    return this.currentMusicTheme;
  }

  private getFilterCutoffForTheme(theme: string): number {
    switch (theme) {
      case 'ambient_plains':
        return 2150;
      case 'ambient_trail':
        return 2400;
      case 'ambient_jungle':
        return 1900;
      case 'ambient_arctic':
        return 3050;
      case 'ambient_volcanic':
        return 1380;
      case 'ambient_sanctuary':
        return 2750;
      case 'ambient_desert':
        return 2250;
      case 'ambient_coast':
        return 2850;
      case 'boss':
        return 4200;
      case 'victory':
        return 3900;
      default:
        return 3400;
    }
  }

  private disposeTrack(track: ActiveMusicTrack) {
    track.stopped = true;
    if (track.cleanupTimeout !== null) {
      clearTimeout(track.cleanupTimeout);
      track.cleanupTimeout = null;
    }
    if (track.intervalId !== null) {
      clearInterval(track.intervalId);
      track.intervalId = null;
    }
    track.padOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
      try {
        osc.disconnect();
      } catch {
        // Already disconnected
      }
    });
    track.padOscillators = [];
    if (track.padGain) {
      try {
        track.padGain.disconnect();
      } catch {
        // Ignore disconnect error
      }
      track.padGain = null;
    }
    try {
      track.gainNode.disconnect();
    } catch {
      // Ignore disconnect error
    }
    this.fadingTracks.delete(track);
  }

  private fadeOutTrack(track: ActiveMusicTrack, fadeDuration: number) {
    if (track.stopped) return;
    track.stopped = true;
    if (!this.ctx || fadeDuration <= 0.02) {
      this.disposeTrack(track);
      return;
    }

    const now = this.ctx.currentTime;
    const clampedFade = Math.max(0.08, fadeDuration);
    const currentGain = Math.max(0.0001, track.gainNode.gain.value);
    track.gainNode.gain.cancelScheduledValues(now);
    track.gainNode.gain.setValueAtTime(currentGain, now);
    track.gainNode.gain.linearRampToValueAtTime(0.0001, now + clampedFade);

    this.fadingTracks.add(track);
    if (track.cleanupTimeout !== null) {
      clearTimeout(track.cleanupTimeout);
    }
    track.cleanupTimeout = window.setTimeout(() => {
      this.disposeTrack(track);
    }, Math.ceil((clampedFade + 0.14) * 1000));
  }

  private attachAmbientPad(track: ActiveMusicTrack, theme: string) {
    if (!this.ctx) return;

    const padConfigs: Record<string, { freqs: number[]; types: OscillatorType[]; baseGain: number; lfoHz: number; lfoDepth: number }> = {
      ambient_plains: {
        freqs: [130.81, 196.0, 329.63],
        types: ['sine', 'sine', 'triangle'],
        baseGain: 0.068,
        lfoHz: 0.18,
        lfoDepth: 0.016,
      },
      ambient_trail: {
        freqs: [98.0, 146.83, 246.94],
        types: ['sine', 'triangle', 'sine'],
        baseGain: 0.062,
        lfoHz: 0.22,
        lfoDepth: 0.015,
      },
      ambient_jungle: {
        freqs: [146.83, 220.0, 174.61],
        types: ['sine', 'sine', 'triangle'],
        baseGain: 0.066,
        lfoHz: 0.15,
        lfoDepth: 0.018,
      },
      ambient_arctic: {
        freqs: [220.0, 329.63, 523.25],
        types: ['sine', 'sine', 'sine'],
        baseGain: 0.052,
        lfoHz: 0.13,
        lfoDepth: 0.014,
      },
      ambient_volcanic: {
        freqs: [73.42, 110.0, 174.61],
        types: ['triangle', 'sine', 'sine'],
        baseGain: 0.088,
        lfoHz: 0.1,
        lfoDepth: 0.022,
      },
      ambient_sanctuary: {
        freqs: [174.61, 261.63, 440.0],
        types: ['sine', 'sine', 'triangle'],
        baseGain: 0.064,
        lfoHz: 0.16,
        lfoDepth: 0.016,
      },
      ambient_desert: {
        freqs: [146.83, 220.0, 293.66],
        types: ['triangle', 'sine', 'sine'],
        baseGain: 0.068,
        lfoHz: 0.14,
        lfoDepth: 0.02,
      },
      ambient_coast: {
        freqs: [130.81, 196.0, 293.66],
        types: ['sine', 'sine', 'triangle'],
        baseGain: 0.064,
        lfoHz: 0.21,
        lfoDepth: 0.022,
      },
    };

    const cfg = padConfigs[theme];
    if (!cfg) return;

    const now = this.ctx.currentTime;
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(cfg.baseGain, now);
    padGain.connect(track.gainNode);
    track.padGain = padGain;

    // Slow breathing LFO so the ambient harmonic bed gently swells like living wind/air
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(cfg.lfoHz, now);
    lfoGain.gain.setValueAtTime(cfg.lfoDepth, now);
    lfo.connect(lfoGain);
    lfoGain.connect(padGain.gain);
    lfo.start(now);
    track.padOscillators.push(lfo);

    cfg.freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();
      osc.type = cfg.types[idx] || 'sine';
      // Subtle organic detune on upper voices for lush warm chorus shimmer
      osc.frequency.setValueAtTime(freq, now);
      if (idx > 0) {
        osc.detune.setValueAtTime(idx === 1 ? -4.5 : 5.5, now);
      }
      voiceGain.gain.setValueAtTime(idx === 0 ? 0.52 : idx === 1 ? 0.34 : 0.22, now);
      osc.connect(voiceGain);
      voiceGain.connect(padGain);
      osc.start(now);
      track.padOscillators.push(osc);
    });
  }

  public playMusic(theme: string, fadeDuration = 1.05) {
    // Gracefully upgrade any legacy 'waiting' request into the sunlit plains ambient track
    const resolvedTheme = theme === 'waiting' ? 'ambient_plains' : theme;

    if (this.activeTrack && this.activeTrack.theme === resolvedTheme && !this.activeTrack.stopped) {
      return;
    }
    this.currentMusicTheme = resolvedTheme;
    if (!this.musicEnabled) {
      if (this.activeTrack) {
        this.fadeOutTrack(this.activeTrack, 0.2);
        this.activeTrack = null;
      }
      return;
    }
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    const now = this.ctx.currentTime;
    const isAmbient = resolvedTheme.startsWith('ambient_');
    const effectiveFade = this.activeTrack ? Math.max(0.25, fadeDuration) : Math.max(0.18, fadeDuration * 0.75);

    // Smoothly crossfade out previous track instead of cutting abruptly
    if (this.activeTrack) {
      this.fadeOutTrack(this.activeTrack, effectiveFade);
      this.activeTrack = null;
    }

    // Smoothly glide the master music filter frequency to match the biome/track mood
    if (this.musicFilter) {
      const targetCutoff = this.getFilterCutoffForTheme(resolvedTheme);
      this.musicFilter.frequency.cancelScheduledValues(now);
      this.musicFilter.frequency.setValueAtTime(this.musicFilter.frequency.value, now);
      this.musicFilter.frequency.linearRampToValueAtTime(targetCutoff, now + effectiveFade);
    }

    // Dedicated per-track GainNode bus for click-free crossfade
    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.0001, now);
    trackGain.gain.linearRampToValueAtTime(1.0, now + effectiveFade);
    trackGain.connect(this.musicGain);

    const track: ActiveMusicTrack = {
      theme: resolvedTheme,
      gainNode: trackGain,
      intervalId: null,
      padOscillators: [],
      padGain: null,
      cleanupTimeout: null,
      stopped: false,
    };
    this.activeTrack = track;

    if (isAmbient) {
      this.attachAmbientPad(track, resolvedTheme);
    }

    let step = 0;
    const D2 = 73.42, G2 = 98.00, A2 = 110.00, Bb2 = 116.54;
    const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, Bb3 = 233.08, B3 = 246.94;
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, Fsharp4 = 369.99, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

    let melody: number[] = [];
    let harmony: number[] = [];
    let bass: number[] = [];
    let bpm = 130;

    if (resolvedTheme === 'ambient_plains') {
      // Cozy sunlit barnyard harp & marimba ambient meditation (World 1)
      melody = [
        C5, 0, G4, 0, E4, G4, A4, 0,
        G4, 0, E4, 0, D4, 0, 0, 0,
        F4, 0, A4, 0, C5, D5, C5, 0,
        A4, 0, G4, 0, E4, 0, 0, 0
      ];
      harmony = [
        E4, 0, C4, 0, G4, 0, E4, 0,
        D4, 0, B3, 0, G4, 0, 0, 0,
        C4, 0, F4, 0, A4, 0, G4, 0,
        F4, 0, E4, 0, C4, 0, 0, 0
      ];
      bass = [C3, 0, G3, 0, F3, 0, C3, 0, D3, 0, G3, 0, C3, 0, G3, 0];
      bpm = 86;
    } else if (resolvedTheme === 'ambient_trail') {
      // Breezy golden-hour pastoral trail flute & folk fifths (Worlds 2-3)
      melody = [
        G4, 0, B4, D5, E5, 0, D5, 0,
        B4, A4, G4, 0, Fsharp4, 0, 0, 0,
        E4, 0, G4, B4, D5, 0, C5, B4,
        A4, 0, G4, 0, D4, 0, 0, 0
      ];
      harmony = [
        D4, 0, G4, 0, B4, 0, A4, 0,
        G4, 0, E4, 0, D4, 0, 0, 0,
        B3, 0, E4, 0, G4, 0, A4, 0,
        Fsharp4, 0, D4, 0, B3, 0, 0, 0
      ];
      bass = [G2, 0, D3, 0, E3, 0, B3, 0, C3, 0, G3, 0, D3, 0, G2, 0];
      bpm = 92;
    } else if (resolvedTheme === 'ambient_jungle') {
      // Mystical emerald canopy kalimba & wood-marimba droplets (World 4)
      melody = [
        D4, 0, A4, F4, 0, G4, A4, 0,
        C5, 0, A4, 0, F4, E4, D4, 0,
        D4, F4, 0, A4, C5, 0, D5, A4,
        G4, 0, F4, E4, D4, 0, 0, 0
      ];
      harmony = [
        A3, 0, D4, 0, C4, 0, F4, 0,
        G4, 0, F4, 0, C4, 0, A3, 0,
        A3, 0, C4, 0, F4, 0, A4, 0,
        E4, 0, C4, 0, A3, 0, 0, 0
      ];
      bass = [D3, 0, A3, 0, C3, 0, G3, 0, F3, 0, C3, 0, G3, 0, D3, 0];
      bpm = 96;
    } else if (resolvedTheme === 'ambient_arctic') {
      // Crystalline northern aurora celesta & frost-bell ambience (World 5)
      melody = [
        E5, 0, 0, B4, C5, 0, 0, A4,
        G4, 0, A4, 0, B4, 0, 0, 0,
        C5, 0, 0, E5, D5, 0, 0, B4,
        A4, 0, G4, 0, E4, 0, 0, 0
      ];
      harmony = [
        C5, 0, 0, G4, A4, 0, 0, E4,
        D4, 0, E4, 0, G4, 0, 0, 0,
        A4, 0, 0, C5, B4, 0, 0, G4,
        E4, 0, D4, 0, C4, 0, 0, 0
      ];
      bass = [A3, 0, E3, 0, G3, 0, D3, 0, F3, 0, C3, 0, E3, 0, A3, 0];
      bpm = 80;
    } else if (resolvedTheme === 'ambient_volcanic') {
      // Deep brooding obsidian ember drone & sparse resonant bells (World 6 Cursed Lair)
      melody = [
        D4, 0, 0, 0, F4, 0, 0, E4,
        D4, 0, 0, 0, Bb3, 0, 0, 0,
        A3, 0, 0, 0, D4, 0, 0, C4,
        Bb3, 0, 0, A3, D4, 0, 0, 0
      ];
      harmony = [
        A3, 0, 0, 0, D4, 0, 0, 0,
        F3, 0, 0, 0, G3, 0, 0, 0,
        E3, 0, 0, 0, A3, 0, 0, 0,
        F3, 0, 0, E3, A3, 0, 0, 0
      ];
      bass = [D2, 0, 0, 0, A2, 0, 0, 0, Bb2, 0, 0, 0, A2, 0, 0, 0];
      bpm = 76;
    } else if (resolvedTheme === 'ambient_sanctuary') {
      // Radiant restored sanctuary harp & celestial chimes (World 6 Post-Victory)
      melody = [
        F4, 0, A4, C5, F5, 0, E5, C5,
        D5, 0, C5, A4, G4, 0, 0, 0,
        A4, 0, C5, F5, G5, 0, F5, D5,
        C5, 0, A4, G4, F4, 0, 0, 0
      ];
      harmony = [
        C4, 0, F4, 0, A4, 0, G4, 0,
        F4, 0, E4, 0, D4, 0, 0, 0,
        F4, 0, A4, 0, C5, 0, Bb4, 0,
        A4, 0, F4, E4, C4, 0, 0, 0
      ];
      bass = [F3, 0, C3, 0, D3, 0, A3, 0, Bb3, 0, F3, 0, C3, 0, F3, 0];
      bpm = 88;
    } else if (resolvedTheme === 'coop') {
      // Cozy sunlit country barnyard theme
      melody = [
        C5, 0, E4, G4, C5, G4, E4, 0,
        D4, 0, F4, A4, G4, F4, E4, D4,
        E4, G4, C5, D5, C5, A4, G4, 0,
        F4, A4, G4, E4, D4, G4, C5, 0
      ];
      harmony = [E4, 0, C4, E4, G4, E4, C4, 0, F4, 0, D4, F4, E4, D4, C4, B3];
      bass = [C3, C3, G3, G3, F3, F3, G3, G3, C3, E3, F3, D3, G3, G3, C3, G3];
      bpm = 118;
    } else if (resolvedTheme === 'trail') {
      // Bright rolling-hills adventure theme
      melody = [
        E4, G4, C5, D5, E5, D5, C5, G4,
        A4, C5, B4, A4, G4, E4, D4, 0,
        E4, G4, C5, D5, E5, G5, E5, C5,
        D5, C5, B4, A4, G4, A4, C5, 0
      ];
      harmony = [C4, E4, G4, B4, C5, B4, G4, E4, F4, A4, G4, F4, E4, C4, B3, 0];
      bass = [C3, G3, A3, F3, C3, G3, F3, G3];
      bpm = 134;
    } else if (resolvedTheme === 'juvenile') {
      // Determined rising-hero theme (World 3: The Heat Up)
      melody = [
        A4, C5, E5, D5, C5, B4, A4, E4,
        F4, A4, C5, B4, A4, G4, E4, 0,
        A4, B4, C5, E5, D5, C5, B4, G4,
        F4, G4, A4, B4, A4, 0, E4, 0
      ];
      harmony = [E4, A4, C5, B4, A4, G4, E4, C4, D4, F4, A4, G4, F4, E4, B3, 0];
      bass = [A3, E3, F3, G3, A3, F3, D3, E3];
      bpm = 140;
    } else if (resolvedTheme === 'jungle') {
      // Rhythmic tropical canopy groove (World 4)
      melody = [
        D4, F4, G4, A4, 0, A4, G4, F4,
        D4, 0, F4, D4, C4, D4, F4, A4,
        D5, C5, A4, G4, F4, G4, A4, 0,
        G4, F4, E4, D4, F4, E4, D4, 0
      ];
      harmony = [A3, D4, E4, F4, 0, F4, E4, D4, A3, 0, D4, A3, G3, A3, D4, F4];
      bass = [D3, D3, A3, D3, F3, F3, G3, A3];
      bpm = 146;
    } else if (resolvedTheme === 'snowy') {
      // Dedicated crystalline alpine winter theme (World 5: The Arctic Lands!)
      melody = [
        E5, 0, B4, C5, D5, 0, C5, B4,
        A4, 0, A4, C5, E5, 0, D5, C5,
        B4, 0, C5, D5, E5, 0, C5, A4,
        G4, A4, B4, G4, A4, 0, 0, 0
      ];
      harmony = [
        C5, 0, G4, A4, B4, 0, A4, G4,
        E4, 0, E4, A4, C5, 0, B4, A4
      ];
      bass = [A3, E3, G3, D3, F3, C3, E3, B3];
      bpm = 126;
    } else if (resolvedTheme === 'storm') {
      melody = [E4, 0, G4, 0, B4, A4, G4, E4, D4, 0, F4, 0, A4, G4, F4, D4];
      harmony = [B3, 0, E4, 0, G4, F4, E4, B3, A3, 0, D4, 0, F4, E4, D4, A3];
      bass = [E3, E3, B3, E3, D3, D3, A3, D3];
      bpm = 152;
    } else if (resolvedTheme === 'boss') {
      // Epic high-octane Boss Fight Theme with galloping minor bass, heroic arpeggios & driving percussion
      const Csharp3 = 138.59, Csharp4 = 277.18, Csharp5 = 554.37;
      melody = [
        D4, F4, A4, D5, C5, A4, F4, G4,
        A4, D5, F5, E5, D5, Csharp5, D5, A5,
        F5, D5, Bb4, G4, A4, C5, F5, E5,
        D5, C5, Bb4, A4, G4, E4, Csharp4, D4
      ];
      harmony = [
        A3, D4, F4, A4, G4, F4, D4, E4,
        F4, A4, D5, C5, Bb4, A4, A4, F5,
        D5, Bb4, G4, E4, F4, A4, D5, C5,
        Bb4, A4, G4, F4, E4, Csharp4, A3, A3
      ];
      bass = [
        D3, D3, A2, D3, F3, F3, C3, F3,
        G3, G3, D3, G3, A3, A3, E3, A3,
        Bb3, Bb3, F3, Bb3, C3, C3, G3, C3,
        D3, D3, A2, D3, Csharp3, Csharp3, A2, Csharp3
      ];
      bpm = 176;
    } else if (resolvedTheme === 'victory') {
      // Glorious, triumphant fanfare victory theme
      melody = [
        C4, G4, C5, E5, G5, 0, E5, G5,
        F5, E5, D5, C5, D5, 0, G4, 0,
        E5, 0, E5, F5, G5, 0, E5, C5,
        D5, E5, D5, C5, C5, 0, 0, 0
      ];
      harmony = [
        E4, C5, E4, G4, C5, 0, G4, C5,
        A4, G4, F4, E4, G4, 0, D4, 0
      ];
      bass = [
        C3, C3, G3, G3, F3, F3, G3, G3,
        C3, C3, E3, E3, F3, G3, C3, C3
      ];
      bpm = 136;
    } else if (resolvedTheme === 'ambient_desert') {
      // Shimmering Phrygian-dominant desert dunes oud & mirage flute
      const Eb4 = 311.13, Eb5 = 622.25;
      melody = [
        D4, 0, Eb4, Fsharp4, G4, 0, A4, 0,
        Bb4, A4, G4, Fsharp4, Eb4, 0, D4, 0,
        A4, 0, Bb4, C5, D5, 0, Eb5, D5,
        Bb4, 0, A4, G4, Fsharp4, 0, D4, 0
      ];
      harmony = [
        A3, 0, D4, 0, D4, 0, Fsharp4, 0,
        G4, 0, D4, 0, A3, 0, D4, 0
      ];
      bass = [D3, 0, A2, 0, D3, 0, G2, 0, A2, 0, D3, 0, A2, 0, D3, 0];
      bpm = 90;
    } else if (resolvedTheme === 'desert') {
      // Adventurous sunlit desert caravan theme (World 7: the Desert lands)
      const Eb4 = 311.13, Eb5 = 622.25;
      melody = [
        D4, Fsharp4, G4, A4, Bb4, A4, G4, Fsharp4,
        Eb4, D4, Fsharp4, A4, D5, 0, Bb4, A4,
        G4, A4, Bb4, C5, D5, Eb5, D5, Bb4,
        A4, G4, Fsharp4, Eb4, D4, 0, A4, 0
      ];
      harmony = [
        A3, D4, D4, Fsharp4, G4, Fsharp4, D4, D4,
        Bb3, A3, D4, Fsharp4, A4, 0, G4, Fsharp4
      ];
      bass = [D3, A2, D3, A2, G2, D3, A2, D3];
      bpm = 138;
    } else if (resolvedTheme === 'ambient_coast') {
      // Breezy Peckerin Coast tide-harbor marimba & sea-breeze shimmer
      melody = [
        G4, 0, B4, D5, G5, 0, E5, D5,
        C5, 0, A4, 0, B4, 0, G4, 0,
        E4, 0, G4, C5, D5, 0, B4, A4,
        G4, 0, D4, 0, G4, 0, 0, 0
      ];
      harmony = [
        D4, 0, G4, 0, B4, 0, G4, 0,
        E4, 0, C4, 0, D4, 0, B3, 0
      ];
      bass = [G2, 0, D3, 0, C3, 0, G2, 0, E3, 0, C3, 0, D3, 0, G2, 0];
      bpm = 94;
    } else if (resolvedTheme === 'coast') {
      // Upbeat Peckerin Coast sea-voyage shanty adventure (World 8: Peckerin Coast)
      melody = [
        G4, B4, D5, G5, E5, D5, B4, G4,
        A4, C5, E5, D5, B4, 0, G4, 0,
        C5, E5, G5, E5, D5, B4, G4, B4,
        A4, G4, Fsharp4, A4, G4, 0, D5, 0
      ];
      harmony = [
        D4, G4, B4, D5, C5, B4, G4, D4,
        E4, A4, C5, A4, G4, 0, D4, 0
      ];
      bass = [G2, D3, G2, D3, C3, G2, D3, G2];
      bpm = 142;
    } else { // 'fields' / default restored meadow
      melody = [C5, E4, G4, C5, D5, F4, A4, D5, E5, G4, C5, B4, C5, 0, G4, 0];
      harmony = [G4, C4, E4, G4, A4, D4, F4, A4, C5, E4, G4, G4, E4, 0, E4, 0];
      bass = [C3, G3, F3, C3, C3, G3, F3, G3];
      bpm = 112;
    }

    const stepMs = (60 / bpm / 2) * 1000;
    const stepSec = stepMs / 1000;

    const triggerStep = () => {
      if (!this.ctx || !this.musicEnabled || this.ctx.state !== 'running') return;

      const tNow = this.ctx.currentTime;
      const melodyNote = melody[step % melody.length];
      const harmonyNote = harmony.length > 0 ? harmony[step % harmony.length] : 0;
      const bassNote = bass[Math.floor(step / 2) % bass.length];

      // 1. Expressive Lead Voice (biome-tailored synth timbre & envelope)
      if (melodyNote > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        if (
          resolvedTheme === 'snowy' ||
          resolvedTheme === 'ambient_arctic' ||
          resolvedTheme === 'ambient_trail' ||
          resolvedTheme === 'ambient_volcanic' ||
          resolvedTheme === 'ambient_sanctuary'
        ) {
          osc.type = 'sine';
        } else if (resolvedTheme === 'victory' || resolvedTheme === 'boss') {
          osc.type = 'sawtooth';
        } else {
          osc.type = 'triangle';
        }

        // Subtle organic kalimba pitch settle on jungle ambient plucks
        if (resolvedTheme === 'ambient_jungle') {
          osc.frequency.setValueAtTime(melodyNote * 1.015, tNow);
          osc.frequency.exponentialRampToValueAtTime(melodyNote, tNow + 0.025);
        } else {
          osc.frequency.setValueAtTime(melodyNote, tNow);
        }

        const leadVol =
          resolvedTheme === 'ambient_volcanic' ? 0.14 :
          resolvedTheme === 'ambient_arctic' ? 0.125 :
          isAmbient ? 0.135 :
          resolvedTheme === 'snowy' ? 0.16 :
          resolvedTheme === 'boss' ? 0.21 :
          resolvedTheme === 'victory' ? 0.19 : 0.17;

        const attackSec = isAmbient ? (resolvedTheme === 'ambient_jungle' ? 0.008 : 0.024) : 0.012;
        const decayMult =
          resolvedTheme === 'ambient_arctic' || resolvedTheme === 'ambient_volcanic' ? 2.35 :
          isAmbient ? 1.85 :
          resolvedTheme === 'snowy' ? 1.35 : 0.9;

        gain.gain.setValueAtTime(0.001, tNow);
        gain.gain.linearRampToValueAtTime(leadVol, tNow + attackSec);
        gain.gain.exponentialRampToValueAtTime(0.001, tNow + stepSec * decayMult);

        osc.connect(gain);
        gain.connect(trackGain);
        osc.start(tNow);
        osc.stop(tNow + stepSec * decayMult + 0.04);

        // Biome-specific harmonic sparkle / chime overtones
        if (
          (resolvedTheme === 'snowy' && step % 2 === 0) ||
          resolvedTheme === 'ambient_arctic' ||
          resolvedTheme === 'ambient_sanctuary'
        ) {
          const bell = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bell.type = 'sine';
          bell.frequency.setValueAtTime(melodyNote * 2, tNow);
          bGain.gain.setValueAtTime(resolvedTheme === 'ambient_arctic' ? 0.048 : 0.042, tNow);
          bGain.gain.exponentialRampToValueAtTime(0.001, tNow + stepSec * 1.6);
          bell.connect(bGain);
          bGain.connect(trackGain);
          bell.start(tNow);
          bell.stop(tNow + stepSec * 1.65);
        } else if (resolvedTheme === 'ambient_volcanic') {
          // Resonant metallic fifth overtone for solemn obsidian cathedral bell
          const bell = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bell.type = 'sine';
          bell.frequency.setValueAtTime(melodyNote * 1.5, tNow);
          bGain.gain.setValueAtTime(0.036, tNow);
          bGain.gain.exponentialRampToValueAtTime(0.001, tNow + stepSec * 2.1);
          bell.connect(bGain);
          bGain.connect(trackGain);
          bell.start(tNow);
          bell.stop(tNow + stepSec * 2.15);
        }
      }

      // 2. Soft Warm Harmony Pad / Counter-Melody
      if (harmonyNote > 0 && (step % 2 === 0 || resolvedTheme === 'boss')) {
        const hOsc = this.ctx.createOscillator();
        const hGain = this.ctx.createGain();
        hOsc.type = isAmbient ? 'sine' : 'triangle';
        hOsc.frequency.setValueAtTime(harmonyNote, tNow);
        const hVol = resolvedTheme === 'boss' ? 0.095 : (isAmbient ? 0.058 : 0.075);
        const hDecay = isAmbient ? 2.1 : 1.5;
        hGain.gain.setValueAtTime(0.001, tNow);
        hGain.gain.linearRampToValueAtTime(hVol, tNow + (isAmbient ? 0.035 : 0.018));
        hGain.gain.exponentialRampToValueAtTime(0.001, tNow + stepSec * hDecay);
        hOsc.connect(hGain);
        hGain.connect(trackGain);
        hOsc.start(tNow);
        hOsc.stop(tNow + stepSec * hDecay + 0.05);
      }

      // 3. Warm Grounded Bass Pulse on Even Steps
      if (step % 2 === 0 && bassNote > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = resolvedTheme === 'boss' ? 'triangle' : 'sine';
        bOsc.frequency.setValueAtTime(bassNote, tNow);

        const bassVol =
          resolvedTheme === 'ambient_volcanic' ? 0.18 :
          isAmbient ? 0.125 :
          resolvedTheme === 'boss' ? 0.27 : 0.21;
        const bassDecay = isAmbient ? 2.4 : 1.85;
        bGain.gain.setValueAtTime(0.001, tNow);
        bGain.gain.linearRampToValueAtTime(bassVol, tNow + (isAmbient ? 0.03 : 0.01));
        bGain.gain.exponentialRampToValueAtTime(0.001, tNow + stepSec * bassDecay);

        bOsc.connect(bGain);
        bGain.connect(trackGain);
        bOsc.start(tNow);
        bOsc.stop(tNow + stepSec * bassDecay + 0.05);
      }

      // 4. Organic Acoustic/Retro Percussion Groove & Biome Ambient Textures
      const hasGroove =
        resolvedTheme === 'boss' ||
        resolvedTheme === 'victory' ||
        resolvedTheme === 'jungle' ||
        resolvedTheme === 'juvenile' ||
        resolvedTheme === 'trail';

      if (hasGroove && step % 2 === 0) {
        const isSnare = step % 4 === 2;
        if (isSnare) {
          this.playNoiseBurst(
            0.065,
            resolvedTheme === 'jungle' ? 1400 : 2200,
            'bandpass',
            resolvedTheme === 'boss' ? 0.16 : 0.09,
            trackGain
          );
        } else {
          // Punchy warm kick drum
          const kOsc = this.ctx.createOscillator();
          const kGain = this.ctx.createGain();
          kOsc.type = 'sine';
          kOsc.frequency.setValueAtTime(128, tNow);
          kOsc.frequency.exponentialRampToValueAtTime(42, tNow + 0.065);
          kGain.gain.setValueAtTime(resolvedTheme === 'boss' ? 0.26 : 0.14, tNow);
          kGain.gain.exponentialRampToValueAtTime(0.001, tNow + 0.075);
          kOsc.connect(kGain);
          kGain.connect(trackGain);
          kOsc.start(tNow);
          kOsc.stop(tNow + 0.08);
        }
      } else if ((resolvedTheme === 'boss' || resolvedTheme === 'jungle') && step % 2 === 1) {
        // Crisp off-beat hi-hat / shaker
        this.playNoiseBurst(0.028, 5200, 'highpass', resolvedTheme === 'boss' ? 0.075 : 0.045, trackGain);
      } else if (resolvedTheme === 'ambient_jungle' && step % 4 === 3) {
        // Gentle rainforest canopy shaker whisper
        this.playNoiseBurst(0.055, 3600, 'bandpass', 0.026, trackGain);
      } else if (resolvedTheme === 'ambient_volcanic' && step % 8 === 0) {
        // Subtle distant magma ember pulse
        this.playNoiseBurst(0.18, 320, 'lowpass', 0.04, trackGain);
      }

      step++;
    };

    // Start immediately on beat 0 for ambient tracks so transitions feel responsive and alive
    if (isAmbient) {
      triggerStep();
    }
    track.intervalId = window.setInterval(triggerStep, stepMs);
  }

  public playCountdownPip(count: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // 3 = 440Hz, 2 = 554Hz, 1 = 659Hz
    const freq = count === 1 ? 659.25 : (count === 2 ? 554.37 : 440.0);
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playFightFanfare() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [880, 1174.66, 1318.51].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.15);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  public playGateLatch(isOpening: boolean) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // 1. Crisp metallic brass latch click transient
    const clickTime = isOpening ? now : now + 0.022;
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    if (isOpening) {
      clickOsc.frequency.setValueAtTime(1760, clickTime);
      clickOsc.frequency.exponentialRampToValueAtTime(920, clickTime + 0.024);
    } else {
      clickOsc.frequency.setValueAtTime(1380, clickTime);
      clickOsc.frequency.exponentialRampToValueAtTime(720, clickTime + 0.026);
    }
    clickGain.gain.setValueAtTime(0.001, clickTime);
    clickGain.gain.linearRampToValueAtTime(0.28, clickTime + 0.003);
    clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.028);
    clickOsc.connect(clickGain);
    clickGain.connect(this.sfxGain);
    clickOsc.start(clickTime);
    clickOsc.stop(clickTime + 0.032);

    // 2. Short bandpass-filtered noise snap for tactile mechanical click crispness
    const snapLen = Math.floor(this.ctx.sampleRate * 0.018);
    const snapBuffer = this.ctx.createBuffer(1, snapLen, this.ctx.sampleRate);
    const snapData = snapBuffer.getChannelData(0);
    for (let i = 0; i < snapLen; i++) {
      const env = Math.pow(1 - i / snapLen, 2.5);
      snapData[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = snapBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isOpening ? 2800 : 2200, clickTime);
    filter.Q.setValueAtTime(2.6, clickTime);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.32, clickTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.018);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(clickTime);

    // 3. Subtle hollow cedar wood clack (follows latch on open, precedes latch snap on close)
    const woodTime = isOpening ? now + 0.02 : now;
    const woodOsc = this.ctx.createOscillator();
    const woodGain = this.ctx.createGain();
    woodOsc.type = 'sine';
    if (isOpening) {
      woodOsc.frequency.setValueAtTime(440, woodTime);
      woodOsc.frequency.exponentialRampToValueAtTime(220, woodTime + 0.042);
    } else {
      woodOsc.frequency.setValueAtTime(340, woodTime);
      woodOsc.frequency.exponentialRampToValueAtTime(155, woodTime + 0.046);
    }
    woodGain.gain.setValueAtTime(0.001, woodTime);
    woodGain.gain.linearRampToValueAtTime(0.24, woodTime + 0.004);
    woodGain.gain.exponentialRampToValueAtTime(0.001, woodTime + 0.048);
    woodOsc.connect(woodGain);
    woodGain.connect(this.sfxGain);
    woodOsc.start(woodTime);
    woodOsc.stop(woodTime + 0.052);
  }

  public playEnemyStep(
    type: 'wolf' | 'fox' | 'bear' | 'snake',
    volumeScale = 1.0,
    surface: 'grass' | 'wood' | 'snow' | 'stone' | 'jungle' = 'grass'
  ) {
    if (!this.soundEnabled || volumeScale <= 0.04) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const v = Math.min(1, Math.max(0.05, volumeScale));

    if (type === 'snake') {
      // Smooth scale-glide slither rustle across mossy jungle leaves
      const dur = 0.19;
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const env = Math.sin(t * Math.PI);
        const ripple = 0.72 + 0.28 * Math.sin(t * Math.PI * 6);
        data[i] = (Math.random() * 2 - 1) * env * ripple;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1450 + Math.random() * 250, now);
      filter.frequency.linearRampToValueAtTime(2750, now + dur * 0.45);
      filter.frequency.exponentialRampToValueAtTime(1180, now + dur);
      filter.Q.setValueAtTime(3.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 * v, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(now);
      return;
    }

    const jitter = 0.92 + Math.random() * 0.16;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'bear') {
      // Heavy weighty ursine thump
      osc.type = 'sine';
      osc.frequency.setValueAtTime(98 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.13);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32 * v, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'fox') {
      // Quick nimble fox paw tap
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(225 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(88, now + 0.045);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16 * v, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.052);
    } else {
      // Wolf padded paw step
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(155 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(58, now + 0.065);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2 * v, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.075);
    }

    // Subtle ground crunch layer
    const nDur = type === 'bear' ? 0.07 : 0.032;
    const len = Math.floor(this.ctx.sampleRate * nDur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.0);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(surface === 'snow' ? 2600 : type === 'bear' ? 750 : 1550, now);
    filter.Q.setValueAtTime(1.8, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime((type === 'bear' ? 0.2 : 0.12) * v, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + nDur);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  public playFarmerStep(isLunge = false, volumeScale = 1.0) {
    if (!this.soundEnabled || volumeScale <= 0.04) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const v = Math.min(1, Math.max(0.08, volumeScale));
    const jitter = 0.93 + Math.random() * 0.14;

    // Sturdy leather farm-boot stomp
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime((isLunge ? 148 : 122) * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(44, now + 0.085);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime((isLunge ? 0.3 : 0.23) * v, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.092);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);

    // Boot-sole turf grit
    const len = Math.floor(this.ctx.sampleRate * 0.042);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1250, now);
    filter.Q.setValueAtTime(1.6, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime((isLunge ? 0.19 : 0.13) * v, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  public playBossStep(isHeavy = false, volumeScale = 1.0) {
    if (!this.soundEnabled || volumeScale <= 0.04) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const v = Math.min(1, Math.max(0.1, volumeScale));

    // Colossal Cockatrice talon thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isHeavy ? 96 : 78, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.18);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime((isHeavy ? 0.42 : 0.3) * v, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);

    // Scaly claw scrape burst
    const len = Math.floor(this.ctx.sampleRate * 0.075);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(920, now);
    filter.Q.setValueAtTime(1.5, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime((isHeavy ? 0.24 : 0.16) * v, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  public playWildlifeChime(kind: 'sheep' | 'monkey' | 'hare' | 'insect' | 'sand_cat' | 'seagull') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    if (kind === 'sand_cat') {
      this.playSandCatPurr();
      return;
    }
    if (kind === 'seagull') {
      this.playSeagullCall();
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (kind === 'sheep') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.08);
      osc.frequency.linearRampToValueAtTime(245, now + 0.28);
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(18, now);
      lfoGain.gain.setValueAtTime(16, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 0.3);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.31);
    } else if (kind === 'monkey') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(1260, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(1380, now + 0.21);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.24);
    } else if (kind === 'hare') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.13);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.18);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.21);
    }
  }

  public playFalconScreech() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(3.2, now);
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(2850, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.36);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.26, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.39);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.42);
    this.playNoiseBurst(0.18, 2800, 'bandpass', 0.12, this.sfxGain, 0.02);
  }

  public playSandCatPurr() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Soft desert kitten trill/mew
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(510, now + 0.24);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playTreeChop() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(230, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.09);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
    this.playNoiseBurst(0.08, 1250, 'bandpass', 0.24, this.sfxGain, 0);
  }

  public playTreeFall() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Creak then heavy timber thud
    const creak = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    creak.type = 'sawtooth';
    creak.frequency.setValueAtTime(190, now);
    creak.frequency.linearRampToValueAtTime(110, now + 0.26);
    cGain.gain.setValueAtTime(0.14, now);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    creak.connect(cGain);
    cGain.connect(this.sfxGain);
    creak.start(now);
    creak.stop(now + 0.3);

    const thud = this.ctx.createOscillator();
    const tGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(120, now + 0.32);
    thud.frequency.exponentialRampToValueAtTime(38, now + 0.56);
    tGain.gain.setValueAtTime(0.36, now + 0.32);
    tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
    thud.connect(tGain);
    tGain.connect(this.sfxGain);
    thud.start(now + 0.32);
    thud.stop(now + 0.6);
    this.playNoiseBurst(0.22, 650, 'lowpass', 0.28, this.sfxGain, 0.32);
  }

  public playRaftBuild() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [0, 0.12, 0.24].forEach((offset, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280 + idx * 75, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);
      g.gain.setValueAtTime(0.24, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  public playRockCrunch() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.22);
    g.gain.setValueAtTime(0.32, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.26);
    this.playNoiseBurst(0.2, 950, 'bandpass', 0.32, this.sfxGain, 0);
  }

  public playSharkLunge() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Ocean splash + menacing low jaw snap
    this.playNoiseBurst(0.28, 1300, 'bandpass', 0.28, this.sfxGain, 0);
    const snap = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    snap.type = 'sawtooth';
    snap.frequency.setValueAtTime(160, now + 0.05);
    snap.frequency.exponentialRampToValueAtTime(52, now + 0.24);
    g.gain.setValueAtTime(0.28, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    snap.connect(g);
    g.connect(this.sfxGain);
    snap.start(now + 0.05);
    snap.stop(now + 0.28);
  }

  public playSeagullCall() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [0, 0.22].forEach((offset, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 1150 : 1260, t);
      osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 1680 : 1540, t + 0.07);
      osc.frequency.exponentialRampToValueAtTime(920, t + 0.19);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  public playEmote(
    emoteId: 'squawk' | 'happy_hop' | 'angry_ruffle' | 'heart_flutter' | 'royal_strut' | 'golden_crow',
    stage: 'egg' | 'baby' | 'juvenile' | 'teen' | 'adult' = 'baby'
  ) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const pitchScale =
      stage === 'baby' || stage === 'egg' ? 1.24 :
      stage === 'juvenile' ? 1.08 :
      stage === 'teen' ? 0.96 : 0.84;

    if (emoteId === 'squawk') {
      // Expressive two-part barnyard squawk + airy beak burst
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(1450 * pitchScale, now);
      f.Q.setValueAtTime(2.8, now);

      osc.frequency.setValueAtTime(420 * pitchScale, now);
      osc.frequency.exponentialRampToValueAtTime(860 * pitchScale, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(520 * pitchScale, now + 0.22);
      osc.frequency.exponentialRampToValueAtTime(760 * pitchScale, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(380 * pitchScale, now + 0.44);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.22);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

      osc.connect(f);
      f.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.48);

      this.playNoiseBurst(0.12, 2200 * pitchScale, 'bandpass', 0.14, this.sfxGain, 0.02);
    } else if (emoteId === 'happy_hop') {
      // Bouncy joyful pentatonic chime + playful spring chirp
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = now + idx * 0.075;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * (0.94 + pitchScale * 0.08), t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.06 * (0.94 + pitchScale * 0.08), t + 0.055);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.24, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } else if (emoteId === 'angry_ruffle') {
      // Furious feather-ruffle bursts + indignant low grumpy squawk
      for (let i = 0; i < 4; i++) {
        this.playNoiseBurst(0.075, 1150 + i * 240, 'bandpass', 0.22, this.sfxGain, i * 0.07);
      }
      [0, 0.18].forEach((offset, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const base = (idx === 0 ? 310 : 265) * pitchScale;
        osc.frequency.setValueAtTime(base, t);
        osc.frequency.exponentialRampToValueAtTime(base * 0.68, t + 0.14);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.24, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.17);
      });
    } else if (emoteId === 'heart_flutter') {
      // Warm sparkling heart harp triad + gentle feather flutter
      this.playNoiseBurst(0.11, 2400, 'bandpass', 0.11, this.sfxGain, 0);
      this.playNoiseBurst(0.1, 2600, 'bandpass', 0.09, this.sfxGain, 0.14);
      const chord = [587.33, 739.99, 880.0, 1174.66];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = now + idx * 0.065;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    } else if (emoteId === 'royal_strut') {
      // Regal trumpet-like mini fanfare with crystalline shimmer
      const fanfare = [
        { freq: 392.0, offset: 0, dur: 0.11 },
        { freq: 523.25, offset: 0.1, dur: 0.11 },
        { freq: 659.25, offset: 0.2, dur: 0.12 },
        { freq: 783.99, offset: 0.31, dur: 0.34 },
      ];
      fanfare.forEach(({ freq, offset, dur }) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + dur + 0.03);
      });
    } else {
      // 'golden_crow': Iconic heroic sunrise cock-a-doodle-doo with golden bell shimmer
      const crowNotes = [
        { f1: 392, f2: 523.25, offset: 0, dur: 0.12 },
        { f1: 523.25, f2: 659.25, offset: 0.12, dur: 0.1 },
        { f1: 587.33, f2: 783.99, offset: 0.22, dur: 0.13 },
        { f1: 783.99, f2: 1046.5, offset: 0.35, dur: 0.42 },
      ];
      crowNotes.forEach(({ f1, f2, offset, dur }) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, t);

        osc.frequency.setValueAtTime(f1 * pitchScale, t);
        osc.frequency.exponentialRampToValueAtTime(f2 * pitchScale, t + dur * 0.7);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + dur + 0.03);
      });
      // Golden sunrise sparkle bell
      const sparkle = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      sparkle.type = 'sine';
      sparkle.frequency.setValueAtTime(1567.98, now + 0.36);
      sGain.gain.setValueAtTime(0.001, now + 0.36);
      sGain.gain.linearRampToValueAtTime(0.16, now + 0.38);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      sparkle.connect(sGain);
      sGain.connect(this.sfxGain);
      sparkle.start(now + 0.36);
      sparkle.stop(now + 0.88);
    }
  }

  public stopMusic(fadeDuration = 0.28, preserveTheme = false) {
    if (!preserveTheme) {
      this.currentMusicTheme = null;
    }
    if (this.activeTrack) {
      const trackToStop = this.activeTrack;
      this.activeTrack = null;
      this.fadeOutTrack(trackToStop, fadeDuration);
    }
    if (fadeDuration <= 0.02) {
      Array.from(this.fadingTracks).forEach(track => this.disposeTrack(track));
    }
  }
}

export const audio = new AudioManager();
