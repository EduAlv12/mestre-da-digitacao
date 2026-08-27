// js/modules/audio.js
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.profile = 'thock';
    this.volume = 0.72;
    this.compressor = null;
    this.masterGain = null;
    this._initialized = false;
    this._noiseBuffer = null;
  }

  init() {
    if (this._initialized) {
      this._resume();
      return;
    }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.001, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.08, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this._initialized = true;
      this._resume();
    } catch (e) {
      console.warn('Áudio não suportado:', e);
      this.enabled = false;
    }
  }

  _resume() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, parseFloat(val) || 0));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setProfile(profile) { this.profile = profile; }

  _getNoiseBuffer() {
    if (this._noiseBuffer || !this.ctx) return this._noiseBuffer;
    const length = Math.ceil(this.ctx.sampleRate * 0.08);
    this._noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = this._noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return this._noiseBuffer;
  }

  _playNoise(now, duration, gainValue, filterType, frequency, q = 0.7) {
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    source.buffer = this._getNoiseBuffer();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, now);
    filter.Q.setValueAtTime(q, now);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), now + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.start(now);
    source.stop(now + duration + 0.005);
  }

  playKey(isSpecial = false) {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const tone = this.ctx.createBiquadFilter();
    const detune = (Math.random() - 0.5) * 22;

    let baseFreq = 360;
    let endFreq = 105;
    let duration = 0.055;
    let waveType = 'triangle';
    let toneGain = 0.10;
    let noiseGain = 0.10;
    let noiseFilter = 'lowpass';
    let noiseFreq = 1700;
    let toneFilter = 900;

    switch (this.profile) {
      case 'thock':
        baseFreq = isSpecial ? 210 : 340; endFreq = isSpecial ? 65 : 95;
        duration = 0.060; waveType = 'triangle'; toneGain = 0.12;
        noiseGain = 0.16; noiseFilter = 'lowpass'; noiseFreq = 1450; toneFilter = 700;
        break;
      case 'pop':
        baseFreq = isSpecial ? 430 : 650; endFreq = isSpecial ? 170 : 230;
        duration = 0.045; waveType = 'sine'; toneGain = 0.13;
        noiseGain = 0.07; noiseFilter = 'bandpass'; noiseFreq = 1800; toneFilter = 1300;
        break;
      case 'retro':
        baseFreq = isSpecial ? 300 : 820; endFreq = isSpecial ? 120 : 330;
        duration = 0.040; waveType = 'sawtooth'; toneGain = 0.075;
        noiseGain = 0.06; noiseFilter = 'bandpass'; noiseFreq = 2400; toneFilter = 2600;
        break;
      case 'typewriter':
        baseFreq = isSpecial ? 260 : 1050; endFreq = isSpecial ? 85 : 200;
        duration = 0.038; waveType = 'square'; toneGain = 0.065;
        noiseGain = 0.14; noiseFilter = 'bandpass'; noiseFreq = 2300; toneFilter = 3000;
        break;
      case 'clack':
        baseFreq = isSpecial ? 380 : 1250; endFreq = isSpecial ? 130 : 450;
        duration = 0.030; waveType = 'square'; toneGain = 0.055;
        noiseGain = 0.18; noiseFilter = 'highpass'; noiseFreq = 1900; toneFilter = 4200;
        break;
      case 'deep':
        baseFreq = isSpecial ? 175 : 285; endFreq = isSpecial ? 55 : 85;
        duration = 0.075; waveType = 'sine'; toneGain = 0.14;
        noiseGain = 0.12; noiseFilter = 'lowpass'; noiseFreq = 900; toneFilter = 500;
        break;
      case 'clicky':
        baseFreq = isSpecial ? 480 : 1450; endFreq = isSpecial ? 190 : 620;
        duration = 0.026; waveType = 'triangle'; toneGain = 0.065;
        noiseGain = 0.16; noiseFilter = 'highpass'; noiseFreq = 2800; toneFilter = 5000;
        break;
    }

    osc.type = waveType;
    osc.frequency.setValueAtTime(baseFreq + detune, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);

    tone.type = 'lowpass';
    tone.frequency.setValueAtTime(toneFilter, now);
    tone.frequency.exponentialRampToValueAtTime(Math.max(120, toneFilter * 0.45), now + duration);
    osc.connect(tone);
    tone.connect(gain);
    gain.connect(this.compressor);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(toneGain, now + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.005);

    // A short filtered noise transient supplies the physical "impact" that a
    // bare oscillator lacks, making the profiles read more like key switches.
    this._playNoise(now, duration * 0.72, noiseGain, noiseFilter, noiseFreq);
  }

  playErrorSound() {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.13);
    osc.connect(gain);
    gain.connect(this.compressor);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.start(now);
    osc.stop(now + 0.135);
    this._playNoise(now, 0.045, 0.055, 'bandpass', 950, 1.2);
  }

  playThemeSwitch() {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.085);
  }

  playPreview() {
    if (this.profile === 'silent' || !this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playKeyNote(freq, 0.08, 0.7), i * 150);
    });
  }

  playKeyNote(freq, duration = 0.08, volumeMul = 0.7) {
    if (this.profile === 'silent' || !this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'closed') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const detune = (Math.random() - 0.5) * 18;
    const waveType = this.profile === 'pop' ? 'sine' : this.profile === 'retro' || this.profile === 'typewriter' || this.profile === 'clack' ? 'square' : 'triangle';
    const baseGain = this.profile === 'deep' ? 0.12 : 0.09;
    osc.type = waveType;
    osc.frequency.setValueAtTime(freq + detune, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.42, now + duration);
    osc.connect(gain);
    gain.connect(this.compressor);
    const finalGain = baseGain * volumeMul;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(finalGain, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.005);
  }
}

export const audioEngine = new AudioEngine();

// Unlock/resume on a real user gesture. This is especially important on
// mobile browsers, where AudioContext normally starts suspended.
const unlockAudio = () => audioEngine.init();
document.addEventListener('pointerdown', unlockAudio, { passive: true });
document.addEventListener('keydown', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio, { once: true });
