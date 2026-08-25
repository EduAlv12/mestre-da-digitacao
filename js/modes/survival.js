// js/modes/survival.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'survival',
  name: 'Sobrevivência',
  linear: true,
  hasTimer: true,

  lives: 5,
  maxLives: 5,
  charLife: 3,
  baseCharLife: 3,
  currentCharIndex: 0,
  timerId: null,
  typed: '',
  errors: 0,
  startTime: null,
  lastInputLength: 0,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy: { lives: 5, charLife: 4.0 },
      medium: { lives: 4, charLife: 2.5 },
      hard: { lives: 3, charLife: 1.5 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.lives = config.lives;
    this.maxLives = config.lives;
    this.baseCharLife = config.charLife;
    this.charLife = config.charLife;
    this.currentCharIndex = 0;
    this.typed = '';
    this.errors = 0;
    this.lastInputLength = 0;
    this.startTime = null;

    this.render(text);
    this.resetInput();
    this.updateProgress(0);
    this.updateUI();
    // O relógio começa no primeiro caractere, não ao entrar no modo.
  },

  render(text) {
    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = text.split('').map((ch, i) => `<span class="char ${i === 0 ? 'current' : ''}">${ch}</span>`).join('');
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
    const text = document.getElementById('progress-text');
    const percentEl = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${typed} / ${state.currentText.length} caracteres`;
    if (percentEl) percentEl.textContent = `${percent}%`;
  },

  updateUI() {
    const tag = document.getElementById('mode-status-tag');
    if (tag) {
      const hearts = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, this.maxLives - this.lives));
      tag.innerHTML = `💀 ${hearts} ⏱️ ${Math.max(0, this.charLife).toFixed(1)}s`;
    }
  },

  getCurrentLifeTime() {
    return Math.max(1.0, this.baseCharLife - this.currentCharIndex * 0.05);
  },

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    let remaining = this.charLife;
    this.timerId = setInterval(() => {
      remaining = Math.max(0, remaining - 0.1);
      this.charLife = remaining;
      this.updateUI();
      if (remaining > 0) return;

      this.lives = Math.max(0, this.lives - 1);
      if (this.lives <= 0) {
        clearInterval(this.timerId);
        this.timerId = null;
        const chars = this.typed.length;
        const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
        const elapsed = Math.max(1, (performance.now() - this.startTime) / 1000);
        const wpm = Math.round((chars / 5) / (elapsed / 60));
        document.dispatchEvent(new CustomEvent('modeEndTest', { detail: { accuracy, wpm, modeId: this.id } }));
        return;
      }

      this.charLife = this.getCurrentLifeTime();
      this.updateUI();
      this.startTimer();
    }, 100);
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

    if (!this.startTime && chars.length > 0) {
      this.startTime = performance.now();
      this.charLife = this.baseCharLife;
      this.startTimer();
    }

    const elapsed = this.startTime ? Math.max(1, (performance.now() - this.startTime) / 1000) : 1;
    const wpm = Math.round((chars.length / 5) / (elapsed / 60));
    const ppmEl = document.getElementById('ppm-val');
    if (ppmEl) ppmEl.textContent = wpm;
    state.currentPPM = wpm;

    const lastChar = chars[chars.length - 1];
    const lastTarget = text[chars.length - 1];
    if (chars.length > prevLen && chars.length > 0 && lastChar === lastTarget) {
      this.currentCharIndex++;
      this.charLife = this.getCurrentLifeTime();
      this.startTimer();
    }

    if (chars.length >= text.length) {
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = null;
      return { done: true, accuracy, wpm, playError: false };
    }

    return {
      done: false,
      playError: chars.length > prevLen && chars.length > 0 && lastChar !== lastTarget
    };
  },

  reset() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
    this.lives = 5;
    this.maxLives = 5;
    this.charLife = 3;
    this.baseCharLife = 3;
    this.currentCharIndex = 0;
    this.typed = '';
    this.errors = 0;
    this.lastInputLength = 0;
    this.startTime = null;
    this.updateUI();
  },

  destroy() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
  },

  checkMedals() {
    if (this.lives === this.maxLives) incrementMedal(this.id, 'survive_5');
    if (this.lives === 1) incrementMedal(this.id, 'survive_1');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsed = this.startTime ? Math.max(1, (performance.now() - this.startTime) / 1000) : 1;
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `💀 Vidas restantes: ${this.lives} | ${accuracy}% precisão, ${wpm} PPM`;
  }
};