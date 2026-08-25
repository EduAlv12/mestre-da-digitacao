// js/modes/sniper.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'sniper',
  name: 'Precisão Extrema',
  linear: true,
  hasTimer: false,

  consecutiveErrors: 0,
  maxErrors: 3,
  rewind: 3,
  processing: false,
  typed: '',
  errors: 0,
  totalErrors: 0,
  startTime: null,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy:   { maxErrors: 3, rewind: 3 },
      medium: { maxErrors: 2, rewind: 5 },
      hard:   { maxErrors: 1, rewind: 7 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.maxErrors = config.maxErrors;
    this.rewind = config.rewind;
    this.consecutiveErrors = 0;
    this.totalErrors = 0;
    this.processing = false;
    this.typed = '';
    this.errors = 0;
    // A sessão começa somente quando a primeira tecla for realmente digitada.
    this.startTime = null;

    this.render(text);
    this.resetInput();
    this.updateProgress(0);
    this.updateUI();
  },

  render(text) {
    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = text.split('').map((ch, i) =>
        `<span class="char ${i === 0 ? 'current' : ''}">${ch}</span>`
      ).join('');
    }
  },

  resetInput() {
    const input = document.getElementById('hidden-input');
    if (input) input.value = '';
  },

  updateProgress(typed) {
    const total = state.currentText.length || 1;
    const percent = Math.min(100, Math.round((typed / total) * 100));
    const fill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const percentEl = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${typed} / ${state.currentText.length} caracteres`;
    if (percentEl) percentEl.textContent = `${percent}%`;
  },

  updateUI() {
    const tag = document.getElementById('mode-status-tag');
    if (tag) {
      tag.innerHTML = `🎯 Erros: ${this.consecutiveErrors}/${this.maxErrors} | Total: ${this.totalErrors}`;
    }
  },

  handleInput(value) {
    if (this.processing) return { playError: false };

    const text = state.currentText;
    if (!text) return { done: false, playError: false };

    if (!this.startTime && value.length > 0) this.startTime = performance.now();

    const prevLen = this.typed.length;
    this.typed = value;
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
      } else {
        span.classList.add('incorrect');
        errors++;
      }
    });
    this.errors = errors;
    this.updateProgress(chars.length);

    const accuracy = chars.length > 0 ? Math.round(((chars.length - errors) / chars.length) * 100) : 100;
    const accuracyEl = document.getElementById('accuracy-val');
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;

    const elapsedMs = this.startTime ? Math.max(1, performance.now() - this.startTime) : 1;
    const wpm = Math.round((chars.length / 5) / (elapsedMs / 60000));
    const ppmEl = document.getElementById('ppm-val');
    if (ppmEl) ppmEl.textContent = wpm;
    state.currentPPM = wpm;

    const lastChar = chars[chars.length - 1];
    const lastTarget = text[chars.length - 1];
    if (chars.length > prevLen && chars.length > 0 && lastChar !== lastTarget) {
      this.consecutiveErrors++;
      this.totalErrors++;
      this.updateUI();

      if (this.consecutiveErrors >= this.maxErrors) {
        return { playError: true, reset: true };
      }

      const input = document.getElementById('hidden-input');
      if (input) {
        this.processing = true;
        // Nunca remova mais caracteres do que realmente existem.
        const removeCount = Math.min(this.rewind, input.value.length);
        const newVal = input.value.slice(0, input.value.length - removeCount);
        input.value = newVal;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        this.processing = false;
        this.typed = newVal;
      }
      return { playError: true };
    }

    if (chars.length > prevLen && chars.length > 0) {
      this.consecutiveErrors = 0;
      this.updateUI();
    }

    if (chars.length >= text.length) {
      return { done: true, accuracy, wpm, playError: false };
    }
    return { done: false, playError: false };
  },

  reset() {
    this.consecutiveErrors = 0;
    this.totalErrors = 0;
    this.processing = false;
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.updateUI();
  },

  checkMedals(accuracy, wpm) {
    if (this.totalErrors === 0) incrementMedal(this.id, 'sniper_perfect');
    if (this.totalErrors >= 2) incrementMedal(this.id, 'sniper_comeback');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsed = this.startTime ? Math.max(1, performance.now() - this.startTime) : 1;
    const wpm = Math.round((chars / 5) / (elapsed / 60000));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `🎯 ${this.totalErrors} erros totais | ${accuracy}% precisão, ${wpm} PPM`;
  }
};