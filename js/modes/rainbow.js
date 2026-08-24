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
    const diff = state.currentDifficulty;
    // Para dificuldade, podemos limitar o tempo ou aumentar o tamanho da frase
    // Mas aqui apenas usamos a frase do pool correspondente.
    this.painted = 0;
    this.typed = '';
    this.errors = 0;
    this.startTime = performance.now();

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
      tag.innerHTML = `🌈 Coloridos: ${this.painted}/${state.currentText.length}`;
    }
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
    document.getElementById('accuracy-val').textContent = `${accuracy}%`;

    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars.length / 5) / (elapsed / 60));
    document.getElementById('ppm-val').textContent = wpm;
    state.currentPPM = wpm;

    this.updateUI();

    if (chars.length >= text.length) {
      return { done: true, accuracy, wpm, playError: false };
    }
    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && chars[chars.length-1] !== text[chars.length-1]) };
  },

  reset() {
    this.painted = 0;
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = '🌈 Modo Arco-Íris';
  },

  checkMedals(accuracy, wpm, time) {
    if (this.painted === state.currentText.length) incrementMedal(this.id, 'rainbow_full');
    if (time < 10) incrementMedal(this.id, 'rainbow_fast');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `🌈 ${this.painted} caracteres coloridos | ${accuracy}% precisão, ${wpm} PPM`;
  }
};