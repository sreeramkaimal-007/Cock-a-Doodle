// Synthesized Web Audio API sound engine for retro 8-bit / 16-bit platformer

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private musicInterval: number | null = null;
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
        if (this.musicEnabled && this.currentMusicTheme && this.musicInterval === null) {
          this.playMusic(this.currentMusicTheme);
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
    if (this.musicGain) {
      this.musicGain.gain.value = enabled ? 0.35 : 0;
    }
    if (!enabled) {
      this.stopMusic();
    } else if (this.currentMusicTheme) {
      this.playMusic(this.currentMusicTheme);
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

  public playFootstep() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
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
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
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

  // --- Procedural Adventure Music Loops (Warm Filtered Multi-Voice Arrangements) ---

  public playMusic(theme: string) {
    if (this.currentMusicTheme === theme && this.musicInterval !== null) {
      return;
    }
    this.currentMusicTheme = theme;
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    this.stopMusic();

    let step = 0;
    const A2 = 110.00;
    const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, Bb3 = 233.08, B3 = 246.94;
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

    let melody: number[] = [];
    let harmony: number[] = [];
    let bass: number[] = [];
    let bpm = 130;

    if (theme === 'coop') {
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
    } else if (theme === 'trail') {
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
    } else if (theme === 'juvenile') {
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
    } else if (theme === 'jungle') {
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
    } else if (theme === 'snowy') {
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
    } else if (theme === 'storm') {
      melody = [E4, 0, G4, 0, B4, A4, G4, E4, D4, 0, F4, 0, A4, G4, F4, D4];
      harmony = [B3, 0, E4, 0, G4, F4, E4, B3, A3, 0, D4, 0, F4, E4, D4, A3];
      bass = [E3, E3, B3, E3, D3, D3, A3, D3];
      bpm = 152;
    } else if (theme === 'boss') {
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
    } else if (theme === 'waiting') {
      // Warm, inviting acoustic lounge theme for menus & shop
      melody = [
        C5, 0, E4, G4, A4, 0, G4, E4,
        F4, A4, C5, D5, C5, 0, A4, 0,
        D5, 0, B4, G4, E5, 0, C5, G4,
        A4, C5, D5, E5, C5, 0, 0, 0
      ];
      harmony = [
        G4, 0, C4, E4, F4, 0, E4, C4,
        C4, F4, A4, B4, A4, 0, F4, 0
      ];
      bass = [
        C3, C3, G3, G3, F3, F3, C3, C3,
        D3, D3, G3, G3, C3, C3, G3, G3
      ];
      bpm = 104;
    } else if (theme === 'victory') {
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
    } else { // 'fields' / default restored meadow
      melody = [C5, E4, G4, C5, D5, F4, A4, D5, E5, G4, C5, B4, C5, 0, G4, 0];
      harmony = [G4, C4, E4, G4, A4, D4, F4, A4, C5, E4, G4, G4, E4, 0, E4, 0];
      bass = [C3, G3, F3, C3, C3, G3, F3, G3];
      bpm = 112;
    }

    const stepMs = (60 / bpm / 2) * 1000;
    const stepSec = stepMs / 1000;

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.musicEnabled || this.ctx.state !== 'running') return;

      const now = this.ctx.currentTime;
      const melodyNote = melody[step % melody.length];
      const harmonyNote = harmony.length > 0 ? harmony[step % harmony.length] : 0;
      const bassNote = bass[Math.floor(step / 2) % bass.length];

      // 1. Expressive Lead Voice with soft envelope attack
      if (melodyNote > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        if (theme === 'waiting' || theme === 'snowy') {
          osc.type = 'sine';
        } else if (theme === 'victory' || theme === 'boss') {
          osc.type = 'sawtooth';
        } else {
          osc.type = 'triangle';
        }
        osc.frequency.setValueAtTime(melodyNote, now);

        const leadVol =
          theme === 'waiting' ? 0.13 :
          theme === 'snowy' ? 0.16 :
          theme === 'boss' ? 0.21 :
          theme === 'victory' ? 0.19 : 0.17;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(leadVol, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepSec * (theme === 'snowy' ? 1.35 : 0.9));

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + stepSec * (theme === 'snowy' ? 1.4 : 0.95));

        // Crystalline bell overtone for snowy Arctic theme
        if (theme === 'snowy' && step % 2 === 0) {
          const bell = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bell.type = 'sine';
          bell.frequency.setValueAtTime(melodyNote * 2, now);
          bGain.gain.setValueAtTime(0.055, now);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + stepSec * 1.1);
          bell.connect(bGain);
          bGain.connect(this.musicGain);
          bell.start(now);
          bell.stop(now + stepSec * 1.15);
        }
      }

      // 2. Soft Warm Harmony Pad / Counter-Melody
      if (harmonyNote > 0 && (step % 2 === 0 || theme === 'boss')) {
        const hOsc = this.ctx.createOscillator();
        const hGain = this.ctx.createGain();
        hOsc.type = 'triangle';
        hOsc.frequency.setValueAtTime(harmonyNote, now);
        const hVol = theme === 'boss' ? 0.095 : (theme === 'waiting' ? 0.055 : 0.075);
        hGain.gain.setValueAtTime(0.001, now);
        hGain.gain.linearRampToValueAtTime(hVol, now + 0.018);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + stepSec * 1.5);
        hOsc.connect(hGain);
        hGain.connect(this.musicGain);
        hOsc.start(now);
        hOsc.stop(now + stepSec * 1.55);
      }

      // 3. Warm Grounded Bass Pulse on Even Steps
      if (step % 2 === 0 && bassNote > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = theme === 'boss' ? 'triangle' : 'sine';
        bOsc.frequency.setValueAtTime(bassNote, now);

        const bassVol = theme === 'waiting' ? 0.15 : (theme === 'boss' ? 0.27 : 0.21);
        bGain.gain.setValueAtTime(0.001, now);
        bGain.gain.linearRampToValueAtTime(bassVol, now + 0.01);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + stepSec * 1.85);

        bOsc.connect(bGain);
        bGain.connect(this.musicGain);
        bOsc.start(now);
        bOsc.stop(now + stepSec * 1.9);
      }

      // 4. Organic Acoustic/Retro Percussion Groove
      const hasGroove = theme === 'boss' || theme === 'victory' || theme === 'jungle' || theme === 'juvenile' || theme === 'trail';
      if (hasGroove && step % 2 === 0) {
        const isSnare = step % 4 === 2;
        if (isSnare) {
          this.playNoiseBurst(
            0.065,
            theme === 'jungle' ? 1400 : 2200,
            'bandpass',
            theme === 'boss' ? 0.16 : 0.09,
            this.musicGain
          );
        } else {
          // Punchy warm kick drum
          const kOsc = this.ctx.createOscillator();
          const kGain = this.ctx.createGain();
          kOsc.type = 'sine';
          kOsc.frequency.setValueAtTime(128, now);
          kOsc.frequency.exponentialRampToValueAtTime(42, now + 0.065);
          kGain.gain.setValueAtTime(theme === 'boss' ? 0.26 : 0.14, now);
          kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
          kOsc.connect(kGain);
          kGain.connect(this.musicGain);
          kOsc.start(now);
          kOsc.stop(now + 0.08);
        }
      } else if ((theme === 'boss' || theme === 'jungle') && step % 2 === 1) {
        // Crisp off-beat hi-hat / shaker
        this.playNoiseBurst(0.028, 5200, 'highpass', theme === 'boss' ? 0.075 : 0.045, this.musicGain);
      }

      step++;
    }, stepMs);
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

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioManager();
