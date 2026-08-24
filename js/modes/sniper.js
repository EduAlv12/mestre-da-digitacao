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
    this.startTime = performance.now();

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
    document.getElementById('hidden-input').value = '';
  },

  updateProgress(typed) {
    const total = state.currentText.length;
    const percent = Math.min(100, Math.round((typed / total) * 100));
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('progress-text').textContent = `${typed} / ${total} caracteres`;
    document.getElementById('progress-percent').textContent = `${percent}%`;
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
    document.getElementById('accuracy-val').textContent = `${accuracy}%`;

    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars.length / 5) / (elapsed / 60));
    document.getElementById('ppm-val').textContent = wpm;
    state.currentPPM = wpm;

    const lastChar = chars[chars.length - 1];
    const lastTarget = text[chars.length - 1];
    if (chars.length > prevLen && chars.length > 0 && lastChar !== lastTarget) {
      this.consecutiveErrors++;
      this.totalErrors++;
      this.updateUI();

      if (this.consecutiveErrors >= this.maxErrors) {
        return { playError: true, reset: true };
      } else {
        const input = document.getElementById('hidden-input');
        if (input) {
          this.processing = true;
          const newVal = input.value.slice(0, -this.rewind);
          input.value = newVal;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          this.processing = false;
          this.typed = newVal;
        }
        return { playError: true };
      }
    } else if (chars.length > prevLen && chars.length > 0) {
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
    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `🎯 ${this.totalErrors} erros totais | ${accuracy}% precisão, ${wpm} PPM`;
  }
};