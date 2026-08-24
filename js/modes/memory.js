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
    this.startTime = performance.now();
    this.textShown = text;

    this.render(text);
    this.resetInput();
    this.updateProgress(0);
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = '🧠 Memorize o texto...';

    // Mostra o texto por alguns segundos, depois esconde
    const display = document.getElementById('text-display');
    display.style.opacity = '1';
    this.revealTimeout = setTimeout(() => {
      display.style.opacity = '0.1';
      this.hidden = true;
      if (tag) tag.textContent = '🧠 Digite de memória!';
    }, this.displayTime * 1000);
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

  handleInput(value) {
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
        if (this.hidden) span.style.color = 'var(--accent)';
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

    if (chars.length >= text.length) {
      if (this.revealTimeout) clearTimeout(this.revealTimeout);
      return { done: true, accuracy, wpm, playError: false };
    }
    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && chars[chars.length-1] !== text[chars.length-1]) };
  },

  reset() {
    if (this.revealTimeout) clearTimeout(this.revealTimeout);
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
    // O modo Memória altera a opacidade do texto. Sempre restaure o
    // estado visual ao sair do modo para não contaminar os demais modos.
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
    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `🧠 ${accuracy}% precisão de memória | ${wpm} PPM`;
  }
};