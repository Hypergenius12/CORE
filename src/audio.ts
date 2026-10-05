/**
 * Web Audio Synthesizer recreating Luis Bergmann's sound design for Hakim El Hattab's Core.
 * Pure Web Audio implementation: zero latency, glitch-free, works across all modern browsers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private ambientEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  private notes = [0, 2, 3, 5, 7, 10];
  private octaves = [0, 12, 24, 36];
  private noiseBuffer: AudioBuffer | null = null;
  private lastShieldSoundTime = 0;

  public setScale(scale: 'minor' | 'dorian' | 'blues' | 'major') {
    switch (scale) {
      case 'dorian':
        this.notes = [0, 2, 3, 5, 7, 9];
        break;
      case 'blues':
        this.notes = [0, 3, 5, 6, 7, 10];
        break;
      case 'major':
        this.notes = [0, 2, 4, 7, 9, 11];
        break;
      case 'minor':
      default:
        this.notes = [0, 2, 3, 5, 7, 10];
        break;
    }
  }

  constructor() {
    // Lazy initialized on user gesture
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime
      );
      this.masterGain.connect(this.ctx.destination);
      this.createNoiseBuffer();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setAmbientEnabled(enabled: boolean) {
    this.ambientEnabled = enabled;
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  private getDestination(): AudioNode | null {
    if (!this.ctx) return null;
    return this.masterGain || this.ctx.destination;
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Play synth note every time an organism is created (with ~70% probability)
   */
  public playSynth(normalizedX: number) {
    if (this.isMuted || !this.ambientEnabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    if (Math.random() > 0.7) return;

    const note = this.notes[(Math.random() * 5) | 0];
    const octave = this.octaves[(Math.random() * 3) | 0];
    const freq = this.midiToFreq(60 + note + octave);

    const now = this.ctx.currentTime;

    // Carrier Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Filter
    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(800, now);
    bpf.Q.setValueAtTime(1.2, now);

    // Envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    // Tremolo LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const tremFreq = Math.random() * 5 + 5;
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(tremFreq, now);
    lfo.frequency.linearRampToValueAtTime(1, now + 2.8);
    lfoGain.gain.setValueAtTime(0.5, now);

    // Stereo Panner (normalizedX is 0 to 1, map to -0.8 to 0.8)
    const panNode = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panNode) {
      const initialPan = Math.max(-1, Math.min(1, (normalizedX - 0.5) * 1.8));
      panNode.pan.setValueAtTime(initialPan, now);
      panNode.pan.exponentialRampToValueAtTime(0.01, now + 2.8);
    }

    // Connect nodes
    osc.connect(bpf);
    bpf.connect(gain);

    if (panNode) {
      gain.connect(panNode);
      panNode.connect(dest);
    } else {
      gain.connect(dest);
    }

    osc.start(now);
    osc.stop(now + 3.0);
    lfo.start(now);
    lfo.stop(now + 3.0);
  }

  /**
   * Played when an organism is deflected by the shield
   */
  public organismDead() {
    if (this.isMuted || !this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const note = this.notes[(Math.random() * 5) | 0];
    const octave = this.octaves[(Math.random() * 3) | 0];
    const now = this.ctx.currentTime;

    // High snappy pulse
    const highOsc = this.ctx.createOscillator();
    highOsc.type = 'triangle';
    highOsc.frequency.setValueAtTime(this.midiToFreq(84 + note + (octave % 24)), now);
    const highGain = this.ctx.createGain();
    highGain.gain.setValueAtTime(0.18, now);
    highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    highOsc.connect(highGain);
    highGain.connect(dest);
    highOsc.start(now);
    highOsc.stop(now + 0.09);

    // Low punch
    const lowOsc = this.ctx.createOscillator();
    lowOsc.type = 'sine';
    lowOsc.frequency.setValueAtTime(Math.random() * 40 + 70, now);
    lowOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    const lowGain = this.ctx.createGain();
    lowGain.gain.setValueAtTime(0.3, now);
    lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    lowOsc.connect(lowGain);
    lowGain.connect(dest);
    lowOsc.start(now);
    lowOsc.stop(now + 0.15);
  }

  /**
   * Played while the spacebar shield is active
   */
  public playShield() {
    if (this.isMuted || !this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const now = this.ctx.currentTime;
    if (now - this.lastShieldSoundTime < 0.08) return;
    this.lastShieldSoundTime = now;

    // Pulse osc
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.09);

    // Subtle noise layer
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(400, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);

      noise.start(now);
      noise.stop(now + 0.08);
    }
  }

  /**
   * Energy collected (+energy, +score)
   */
  public energyUp() {
    if (this.isMuted || !this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const targetFreq = Math.random() * 500 + 500;
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(150, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Core damaged by enemy (-energy)
   */
  public energyDown() {
    if (this.isMuted || !this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const startFreq = Math.random() * 100 + 100;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(15, now + 0.8);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(Math.random() * 50 + 60, now);
    osc2.frequency.exponentialRampToValueAtTime(25, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(120, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.85);
    osc2.start(now);
    osc2.stop(now + 0.85);
  }

  /**
   * Game over sound
   */
  public playGameOver() {
    if (this.isMuted || !this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const now = this.ctx.currentTime;

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(20, now + 1.6);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(now);
    subOsc.stop(now + 1.9);

    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 2.0);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      noise.start(now);
      noise.stop(now + 2.2);
    }
  }
}

export const CoreAudio = new SoundEngine();
