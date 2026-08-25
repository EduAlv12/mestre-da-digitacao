// js/modes/rainbow.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'rainbow',
  name: 'Arco-Íris',
  linear: true,
  hasTimer: false,

  colors: ['#ff6b6b', '#ffa94d', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#fd79a8'],
  painted: 0,
  typed: '',
  errors: 0,
  startTime: null,

  init(text) {
    this.painted = 0;
    this.typed = '';
    this.errors = 0;
    this.startTime = null;

    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = text.split('').map((ch, i) => {
        const color = this.colors[i % this.colors.length];
        return `<span class="char" style="color:${color};">${ch}</span>`;
      }).join('');
    }
    this.resetInput();
    this.updateProgress(0);
    this.updateUI();
  },

  resetInput() {
    const input = document.getElementById('hidden-input');
    if (input) input.value = '';
  },

  updateProgress(typed) {
    const total = state.currentText.length;
    const percent = total ? Math.min(100, Math.round((typed / total) * 100)) : 0;
    const fill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const percentText = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${typed} / ${total} caracteres`;
    if (percentText) percentText.textContent = `${percent}%`;
  },

  updateUI() {
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.innerHTML = `🌈 Coloridos: ${this.painted}/${state.currentText.length}`;
  },

  handleInput(value) {
    const text = state.currentText;
    const prevLen = this.typed.length;
    this.typed = value;
    if (!this.startTime && value.length > 0) this.startTime = performance.now();

    const chars = value.split('');
    let errors = 0;
    const spans = document.querySelectorAll('#text-display .char');
    spans.forEach((span, idx) => {
      const typed = chars[idx];
      const target = text[idx];
      span.classList.remove('correct', 'incorrect', 'current');
      if (typed == null) {
        if (idx === chars.length) span.classList.add('current');
      } else if (typed === target) {
        span.classList.add('correct');
        span.style.color = this.colors[idx % this.colors.length];
      } else {
        span.classList.add('incorrect');
        span.style.color = 'var(--text-muted)';
        errors++;
      }
    });
    this.errors = errors;
    this.painted = chars.filter((ch, i) => ch === text[i]).length;
    this.updateProgress(chars.length);

    const accuracy = chars.length > 0 ? Math.round(((chars.length - errors) / chars.length) * 100) : 100;
    const accuracyEl = document.getElementById('accuracy-val');
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;

    const elapsedMs = this.startTime ? Math.max(1, performance.now() - this.startTime) : 1;
    const wpm = Math.round((chars.length / 5) / (elapsedMs / 60000));
    const ppmEl = document.getElementById('ppm-val');
    if (ppmEl) ppmEl.textContent = wpm;
    state.currentPPM = wpm;

    this.updateUI();

    if (chars.length >= text.length) {
      return { done: true, accuracy, wpm, playError: false };
    }
    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && chars[chars.length - 1] !== text[chars.length - 1]) };
  },

  reset() {
    this.painted = 0;
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = '🌈 Modo Arco-Íris';
  },

  destroy() {
    const display = document.getElementById('text-display');
    if (display) {
      display.querySelectorAll('.char').forEach(span => span.style.removeProperty('color'));
    }
  },

  checkMedals(accuracy, wpm, time) {
    if (this.painted === state.currentText.length) incrementMedal(this.id, 'rainbow_full');
    if (time < 10) incrementMedal(this.id, 'rainbow_fast');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsedMs = this.startTime ? Math.max(1, performance.now() - this.startTime) : 1;
    const wpm = Math.round((chars / 5) / (elapsedMs / 60000));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `🌈 ${this.painted} caracteres coloridos | ${accuracy}% precisão, ${wpm} PPM`;
  }
};