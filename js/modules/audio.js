// js/modules/audio.js
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.profile = 'thock';
    this.volume = 0.9;
    this.compressor = null;
    this.masterGain = null;
    this.currentOsc = null;
    this.currentGain = null;
    this._initialized = false;
  }

  init() {
    if (this._initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-8, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.001, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.04, this.ctx.currentTime);
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this._initialized = true;
    } catch (e) {
      console.warn('Áudio não suportado:', e);
      this.enabled = false;
    }
  }

  setVolume(val) {
    this.volume = parseFloat(val);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setProfile(profile) { this.profile = profile; }

  stopCurrentSound(now) {
    if (this.currentGain && this.currentOsc) {
      try {
        this.currentGain.gain.cancelScheduledValues(now);
        this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
        this.currentGain.gain.linearRampToValueAtTime(0.0001, now + 0.008);
        this.currentOsc.stop(now + 0.01);
      } catch (_) { /* ignore */ }
    }
  }

  playKey(isSpecial = false) {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const now = this.ctx.currentTime;
    this.stopCurrentSound(now);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    this.currentOsc = osc;
    this.currentGain = gain;
    osc.connect(gain);
    gain.connect(this.compressor);

    const detune = (Math.random() - 0.5) * 35;
    let baseFreq = 600,
      endFreq = 150,
      duration = 0.04,
      waveType = 'triangle',
      baseGain = 0.80;

    switch (this.profile) {
      case 'thock':
        waveType = 'triangle';
        baseFreq = isSpecial ? 200 : 380;
        endFreq = isSpecial ? 70 : 120;
        duration = 0.045;
        baseGain = 1.20;
        break;
      case 'pop':
        waveType = 'sine';
        baseFreq = isSpecial ? 420 : 720;
        endFreq = isSpecial ? 180 : 280;
        duration = 0.035;
        baseGain = 1.00;
        break;
      case 'retro':
        waveType = 'sawtooth';
        baseFreq = isSpecial ? 320 : 880;
        endFreq = isSpecial ? 130 : 380;
        duration = 0.03;
        baseGain = 0.80;
        break;
      case 'typewriter':
        waveType = 'square';
        baseFreq = isSpecial ? 280 : 1150;
        endFreq = isSpecial ? 90 : 220;
        duration = 0.028;
        baseGain = 1.10;
        break;
      case 'clack':
        waveType = 'square';
        baseFreq = isSpecial ? 400 : 1200;
        endFreq = isSpecial ? 150 : 500;
        duration = 0.025;
        baseGain = 1.20;
        break;
      case 'deep':
        waveType = 'sine';
        baseFreq = isSpecial ? 180 : 300;
        endFreq = isSpecial ? 60 : 100;
        duration = 0.06;
        baseGain = 1.60;
        break;
      case 'clicky':
        waveType = 'triangle';
        baseFreq = isSpecial ? 500 : 1500;
        endFreq = isSpecial ? 200 : 700;
        duration = 0.02;
        baseGain = 1.10;
        break;
    }

    osc.type = waveType;
    osc.frequency.setValueAtTime(baseFreq + detune, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    
    const finalGain = baseGain * 0.6;
    gain.gain.setValueAtTime(finalGain * 0.2, now);
    gain.gain.linearRampToValueAtTime(finalGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.005);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  playErrorSound() {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
    gain.gain.setValueAtTime(0.80 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playThemeSwitch() {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const now = this.ctx.currentTime;
    this.stopCurrentSound(now);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.60, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playPreview() {
    if (this.profile === 'silent' || !this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playKeyNote(freq, 0.08, 0.7);
      }, i * 150);
    });
  }

  playKeyNote(freq, duration = 0.08, volumeMul = 0.7) {
    if (this.profile === 'silent' || !this.enabled) return;
    if (!this.ctx) this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const detune = (Math.random() - 0.5) * 20;
    let waveType = 'triangle';
    let baseGain = 0.80;
    
    switch (this.profile) {
      case 'thock': waveType = 'triangle'; baseGain = 1.20; break;
      case 'pop': waveType = 'sine'; baseGain = 1.00; break;
      case 'retro': waveType = 'sawtooth'; baseGain = 0.80; break;
      case 'typewriter': waveType = 'square'; baseGain = 1.10; break;
      case 'clack': waveType = 'square'; baseGain = 1.20; break;
      case 'deep': waveType = 'sine'; baseGain = 1.60; break;
      case 'clicky': waveType = 'triangle'; baseGain = 1.10; break;
      default: waveType = 'triangle'; baseGain = 1.00;
    }
    
    osc.type = waveType;
    osc.frequency.setValueAtTime(freq + detune, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + duration);
    const finalGain = baseGain * volumeMul * 0.5;
    gain.gain.setValueAtTime(finalGain * 0.2, now);
    gain.gain.linearRampToValueAtTime(finalGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.005);
    osc.connect(gain);
    gain.connect(this.compressor || this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }
}

export const audioEngine = new AudioEngine();

// Inicializa no primeiro clique
document.addEventListener('click', () => {
  audioEngine.init();
}, { once: true });