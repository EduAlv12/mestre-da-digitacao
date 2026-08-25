// js/modes/memory.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'memory',
  name: 'Memória',
  linear: true,
  hasTimer: false,

  hidden: false,
  revealTimeout: null,
  typed: '',
  errors: 0,
  startTime: null,
  textShown: '',
  displayTime: 3,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy:   { displayTime: 5 },
      medium: { displayTime: 3.5 },
      hard:   { displayTime: 2 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.displayTime = config.displayTime;
    this.hidden = false;
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.textShown = text;

    this.render(text);
    this.resetInput();
    this.updateProgress(0);
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = '🧠 Memorize o texto...';

    const display = document.getElementById('text-display');
    if (display) {
      display.style.opacity = '1';
      this.revealTimeout = setTimeout(() => {
        display.style.opacity = '0.1';
        this.hidden = true;
        if (tag) tag.textContent = '🧠 Digite de memória!';
      }, this.displayTime * 1000);
    }
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
    const total = state.currentText.length;
    const percent = total ? Math.min(100, Math.round((typed / total) * 100)) : 0;
    const fill = document.getElementById('progress-fill');
    const textEl = document.getElementById('progress-text');
    const percentEl = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${percent}%`;
    if (textEl) textEl.textContent = `${typed} / ${total} caracteres`;
    if (percentEl) percentEl.textContent = `${percent}%`;
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
        if (this.hidden) span.style.color = 'var(--accent)';
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

    if (chars.length >= text.length) {
      if (this.revealTimeout) {
        clearTimeout(this.revealTimeout);
        this.revealTimeout = null;
      }
      return { done: true, accuracy, wpm, playError: false };
    }
    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && chars[chars.length-1] !== text[chars.length-1]) };
  },

  reset() {
    if (this.revealTimeout) {
      clearTimeout(this.revealTimeout);
      this.revealTimeout = null;
    }
    this.hidden = false;
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    const display = document.getElementById('text-display');
    if (display) display.style.opacity = '1';
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = '🧠 Modo Memória';
  },

  destroy() {
    if (this.revealTimeout) {
      clearTimeout(this.revealTimeout);
      this.revealTimeout = null;
    }
    const display = document.getElementById('text-display');
    if (display) {
      display.style.opacity = '1';
      display.querySelectorAll('.char').forEach(span => {
        span.style.removeProperty('color');
      });
    }
  },

  checkMedals(accuracy, wpm, time) {
    if (accuracy === 100) incrementMedal(this.id, 'memory_perfect');
    if (time < 5) incrementMedal(this.id, 'memory_fast');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsedMs = this.startTime ? Math.max(1, performance.now() - this.startTime) : 1;
    const wpm = Math.round((chars / 5) / (elapsedMs / 60000));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `🧠 ${accuracy}% precisão de memória | ${wpm} PPM`;
  }
};