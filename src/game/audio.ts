// Synthesized Web Audio API sound engine for retro 8-bit / 16-bit platformer

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private musicInterval: number | null = null;
  private currentMusicTheme: string | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
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

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicEnabled ? 0.35 : 0;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.soundEnabled ? 0.75 : 0;
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

  // --- Sound Effects ---

  public playJump(isBig = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'square';
    const startFreq = isBig ? 280 : 380;
    const endFreq = isBig ? 620 : 880;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.14);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playCoin() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playAttack(isGold = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isGold ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isGold ? 700 : 500, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.22);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playEnemyDefeat() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playEggCrack() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Cracking crunch noise
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);

    // Baby chirp follow-up
    setTimeout(() => {
      if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
      const t = this.ctx.currentTime;
      const chirp = this.ctx.createOscillator();
      const chirpGain = this.ctx.createGain();
      chirp.type = 'sine';
      chirp.frequency.setValueAtTime(1400, t);
      chirp.frequency.linearRampToValueAtTime(1800, t + 0.08);
      chirpGain.gain.setValueAtTime(0.25, t);
      chirpGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      chirp.connect(chirpGain);
      chirpGain.connect(this.sfxGain);
      chirp.start(t);
      chirp.stop(t + 0.12);
    }, 120);
  }

  public playChest() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = this.ctx.currentTime + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.22);
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

  // --- Procedural Chiptune Music Loops ---

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
    // Scale notes in Hz
    const A2 = 110.00;
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;
    const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, Bb3 = 233.08, B3 = 246.94;

    let melody: number[] = [];
    let bass: number[] = [];
    let bpm = 130;

    if (theme === 'coop') {
      melody = [C5, 0, E4, G4, C5, G4, E4, 0, D4, 0, F4, A4, G4, F4, E4, D4];
      bass = [C3, C3, G3, G3, F3, F3, G3, G3];
      bpm = 118;
    } else if (theme === 'trail') {
      melody = [E4, G4, C5, D4, E4, G4, A4, G4, C5, B4, A4, G4, E4, F4, G4, C5];
      bass = [C3, G3, A3, F3, C3, G3, F3, G3];
      bpm = 136;
    } else if (theme === 'juvenile') {
      melody = [A4, C5, E4, G4, A4, B4, C5, A4, F4, A4, G4, E4, D4, E4, F4, G4];
      bass = [A3, E3, F3, G3, A3, F3, D3, E3];
      bpm = 142;
    } else if (theme === 'jungle') {
      melody = [D4, F4, G4, A4, 0, A4, G4, F4, D4, 0, F4, D4, C4, D4, F4, A4];
      bass = [D3, D3, A3, D3, F3, F3, G3, A3];
      bpm = 148;
    } else if (theme === 'storm') {
      melody = [E4, 0, G4, 0, B4, A4, G4, E4, D4, 0, F4, 0, A4, G4, F4, D4];
      bass = [E3, E3, B3, E3, D3, D3, A3, D3];
      bpm = 152;
    } else if (theme === 'boss') {
      // Extremely cool, epic high-octane Boss Fight Theme with galloping minor bass, heroic arpeggios & driving percussion
      const Csharp3 = 138.59;
      const C4 = 261.63, Csharp4 = 277.18, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, B4 = 493.88;
      const C5 = 523.25, Csharp5 = 554.37, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;
      melody = [
        D4, F4, A4, D5, C5, A4, F4, G4,
        A4, D5, F5, E5, D5, Csharp5, D5, A5,
        F5, D5, Bb4, G4, A4, C5, F5, E5,
        D5, C5, Bb4, A4, G4, E4, Csharp4, D4
      ];
      bass = [
        D3, D3, A2, D3, F3, F3, C3, F3,
        G3, G3, D3, G3, A3, A3, E3, A3,
        Bb3, Bb3, F3, Bb3, C3, C3, G3, C3,
        D3, D3, A2, D3, Csharp3, Csharp3, A2, Csharp3
      ];
      bpm = 176;
    } else if (theme === 'waiting') {
      // Relaxing, mellow elevator / lounge waiting theme for pause menu, main menu & settings
      const D5 = 587.33, E5 = 659.25;
      melody = [
        C5, 0, E4, G4, A4, 0, G4, E4,
        F4, A4, C5, D5, C5, 0, A4, 0,
        D5, 0, B4, G4, E5, 0, C5, G4,
        A4, C5, D5, E5, C5, 0, 0, 0
      ];
      bass = [
        C3, C3, G3, G3, F3, F3, C3, C3,
        D3, D3, G3, G3, C3, C3, G3, G3
      ];
      bpm = 104;
    } else if (theme === 'victory') {
      // Glorious, triumphant fanfare victory theme for the ending cutscene
      const D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
      melody = [
        C4, G4, C5, E5, G5, 0, E5, G5,
        F5, E5, D5, C5, D5, 0, G4, 0,
        E5, 0, E5, F5, G5, 0, E5, C5,
        D5, E5, D5, C5, C5, 0, 0, 0
      ];
      bass = [
        C3, C3, G3, G3, F3, F3, G3, G3,
        C3, C3, E3, E3, F3, G3, C3, C3
      ];
      bpm = 136;
    } else { // 'fields' / default meadow
      melody = [C5, E4, G4, C5, D4, F4, A4, D4, E4, G4, C5, B4, C5, 0, 0, 0];
      bass = [C3, G3, F3, C3, C3, G3, F3, G3];
      bpm = 110;
    }

    const stepMs = (60 / bpm / 2) * 1000;

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.musicEnabled || this.ctx.state !== 'running') return;

      const now = this.ctx.currentTime;
      const melodyNote = melody[step % melody.length];
      const bassNote = bass[Math.floor(step / 2) % bass.length];

      // Play lead note with rich color
      if (melodyNote > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        // Tone customization by theme
        if (theme === 'waiting') {
          osc.type = 'sine';
        } else if (theme === 'victory' || theme === 'boss') {
          osc.type = 'sawtooth';
        } else {
          osc.type = 'triangle';
        }
        osc.frequency.setValueAtTime(melodyNote, now);

        const leadVol = theme === 'waiting' ? 0.12 : (theme === 'boss' ? 0.22 : (theme === 'victory' ? 0.20 : 0.18));
        gain.gain.setValueAtTime(leadVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (stepMs / 1000) * 0.88);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + (stepMs / 1000) * 0.92);

        // Rich 5th harmonic undertone for boss and victory themes
        if ((theme === 'boss' || theme === 'victory') && step % 4 === 0) {
          const hOsc = this.ctx.createOscillator();
          const hGain = this.ctx.createGain();
          hOsc.type = 'triangle';
          hOsc.frequency.setValueAtTime(melodyNote * (theme === 'victory' ? 1.5 : 0.75), now);
          hGain.gain.setValueAtTime(0.10, now);
          hGain.gain.exponentialRampToValueAtTime(0.001, now + (stepMs / 1000) * 0.8);
          hOsc.connect(hGain);
          hGain.connect(this.musicGain);
          hOsc.start(now);
          hOsc.stop(now + (stepMs / 1000) * 0.85);
        }
      }

      // Play bass pulse note on even steps
      if (step % 2 === 0 && bassNote > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = theme === 'boss' ? 'triangle' : 'sine';
        bOsc.frequency.setValueAtTime(bassNote, now);

        const bassVol = theme === 'waiting' ? 0.16 : (theme === 'boss' ? 0.28 : 0.22);
        bGain.gain.setValueAtTime(bassVol, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + (stepMs / 1000) * 1.8);

        bOsc.connect(bGain);
        bGain.connect(this.musicGain);

        bOsc.start(now);
        bOsc.stop(now + (stepMs / 1000) * 1.9);
      }

      // Driving percussive chiptune beat for boss fight and triumphant victory
      if ((theme === 'boss' || theme === 'victory') && step % 2 === 0) {
        const pOsc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        pOsc.type = 'square';
        // Alternating kick and punchy snare
        const isSnare = (step % 4 === 2);
        pOsc.frequency.setValueAtTime(isSnare ? 320 : 130, now);
        pOsc.frequency.exponentialRampToValueAtTime(isSnare ? 80 : 35, now + 0.055);
        pGain.gain.setValueAtTime(theme === 'boss' ? 0.20 : 0.14, now);
        pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        pOsc.connect(pGain);
        pGain.connect(this.musicGain);

        pOsc.start(now);
        pOsc.stop(now + 0.065);
      } else if (theme === 'boss' && step % 2 === 1) {
        // High-speed metallic hi-hat tick on off-beats
        const hOsc = this.ctx.createOscillator();
        const hGain = this.ctx.createGain();
        hOsc.type = 'square';
        hOsc.frequency.setValueAtTime(1400 + (step % 4) * 200, now);
        hOsc.frequency.exponentialRampToValueAtTime(400, now + 0.025);
        hGain.gain.setValueAtTime(0.06, now);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

        hOsc.connect(hGain);
        hGain.connect(this.musicGain);

        hOsc.start(now);
        hOsc.stop(now + 0.028);
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
