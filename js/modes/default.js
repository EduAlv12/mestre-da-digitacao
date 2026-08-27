// js/modes/default.js
import { state } from '../modules/utils.js';
import { getNextSentence } from '../modules/sentence-engine.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'default', name: 'Padrão', linear: true, hasTimer: false,
  typed: '', errors: 0, startTime: null, phase: 0, phaseTexts: [], currentText: '',
  sessionChars: 0, sessionErrors: 0,

  init(text) {
    this.typed = ''; this.errors = 0; this.startTime = null;
    this.sessionChars = 0; this.sessionErrors = 0;
    const diff = state.currentDifficulty;
    this.phaseTexts = Array.from({ length: 5 }, () => getNextSentence(diff));
    this.phase = 0;
    this.currentText = this.phaseTexts[0] || text || '';
    state.currentText = this.currentText;
    this.render(); this.resetInput(); this.updateProgress(0);
  },

  render() {
    const display = document.getElementById('text-display');
    if (display) display.innerHTML = this.currentText.split('').map((ch, i) => `<span class="char ${i === 0 ? 'current' : ''}">${ch}</span>`).join('');
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = `📖 Fase ${this.phase + 1}/${this.phaseTexts.length}`;
  },

  resetInput() { const input = document.getElementById('hidden-input'); if (input) input.value = ''; },

  updateProgress(typed) {
    const total = this.currentText.length || 1;
    const percent = Math.min(100, Math.round((typed / total) * 100));
    const fill = document.getElementById('progress-fill'), text = document.getElementById('progress-text'), pct = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${typed} / ${this.currentText.length} caracteres`;
    if (pct) pct.textContent = `${percent}%`;
  },

  handleInput(value) {
    const text = this.currentText; if (!text) return { done: false, playError: false };
    const prevLen = this.typed.length; this.typed = value;
    if (!this.startTime && value.length > 0) this.startTime = performance.now();
    const chars = value.split(''); let errors = 0;
    document.querySelectorAll('#text-display .char').forEach((span, idx) => {
      const typed = chars[idx], target = text[idx]; span.classList.remove('correct', 'incorrect', 'current');
      if (typed == null) { if (idx === chars.length) span.classList.add('current'); }
      else if (typed === target) span.classList.add('correct');
      else { span.classList.add('incorrect'); errors++; }
    });
    this.errors = errors; this.updateProgress(chars.length);
    const accuracy = chars.length ? Math.round(((chars.length - errors) / chars.length) * 100) : 100;
    const accuracyEl = document.getElementById('accuracy-val'), ppmEl = document.getElementById('ppm-val');
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    const elapsed = this.startTime ? Math.max(0.001, (performance.now() - this.startTime) / 1000) : 0.001;
    const wpm = Math.round((chars.length / 5) / (elapsed / 60));
    if (ppmEl) ppmEl.textContent = wpm; state.currentPPM = wpm;

    if (chars.length >= text.length) {
      const phaseChars = chars.length;
      this.sessionChars += phaseChars;
      this.sessionErrors += errors;
      if (accuracy >= 90) {
        this.phase++;
        if (this.phase < this.phaseTexts.length) {
          this.currentText = this.phaseTexts[this.phase]; state.currentText = this.currentText;
          this.render(); this.resetInput(); this.typed = ''; this.errors = 0;
          state.previousInput = '';
          this.updateProgress(0);
          if (accuracyEl) accuracyEl.textContent = '100%';
          return { playError: false, playSound: true };
        }
        const sessionAccuracy = this.sessionChars ? Math.round(((this.sessionChars - this.sessionErrors) / this.sessionChars) * 100) : 100;
        const sessionElapsed = Math.max(0.001, (performance.now() - this.startTime) / 1000);
        const sessionWpm = Math.round((this.sessionChars / 5) / (sessionElapsed / 60));
        if (accuracyEl) accuracyEl.textContent = `${sessionAccuracy}%`;
        if (ppmEl) ppmEl.textContent = sessionWpm;
        state.currentPPM = sessionWpm;
        return { done: true, accuracy: sessionAccuracy, wpm: sessionWpm, playError: false };
      }
      this.render(); this.resetInput(); this.typed = ''; this.errors = 0; state.previousInput = ''; this.updateProgress(0);
      if (accuracyEl) accuracyEl.textContent = '100%';
      return { playError: true, playSound: true };
    }
    return { done: false, playError: chars.length > prevLen && chars.length > 0 && chars[chars.length - 1] !== text[chars.length - 1] };
  },

  reset() { this.typed = ''; this.errors = 0; this.startTime = null; this.phase = 0; this.phaseTexts = []; this.currentText = ''; this.sessionChars = 0; this.sessionErrors = 0; },
  checkMedals(accuracy, wpm, time) {
    const limits = { easy: { time15: 15, time30: 30, speed60: 50 }, medium: { time15: 20, time30: 40, speed60: 60 }, hard: { time15: 30, time30: 60, speed60: 70 } }[state.currentDifficulty] || { time15: 15, time30: 30, speed60: 50 };
    if (accuracy >= 90) incrementMedal(this.id, 'accuracy');
    if (time <= limits.time15 && accuracy >= 90) incrementMedal(this.id, 'time15');
    if (time <= limits.time30 && accuracy >= 90) incrementMedal(this.id, 'time30');
    if (wpm >= limits.speed60 && accuracy >= 90) incrementMedal(this.id, 'speed60');
  },
  getMetrics() {
    const chars = this.sessionChars || this.typed.length;
    const errors = this.sessionChars ? this.sessionErrors : this.errors;
    const accuracy = chars ? Math.max(0, Math.round(((chars - errors) / chars) * 100)) : 100;
    const elapsed = this.startTime ? Math.max(0.001, (performance.now() - this.startTime) / 1000) : 0.001;
    return { accuracy, wpm: Math.round((chars / 5) / (elapsed / 60)) };
  },
  getResultMessage(accuracy, wpm) { return `📖 Fases completadas: ${this.phase}/${this.phaseTexts.length} | ${accuracy}% precisão, ${wpm} PPM`; }
};