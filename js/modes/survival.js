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
  currentCharIndex: 0,
  timerId: null,
  typed: '',
  errors: 0,
  startTime: null,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy:   { lives: 5, charLife: 4.0 },
      medium: { lives: 4, charLife: 2.5 },
      hard:   { lives: 3, charLife: 1.5 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.lives = config.lives;
    this.maxLives = config.lives;
    this.charLife = config.charLife;
    this.currentCharIndex = 0;
    this.typed = '';
    this.errors = 0;
    this.startTime = performance.now();

    this.render(text);
    this.resetInput();
    this.updateProgress(0);
    this.updateUI();
    this.startTimer(text);
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
      const hearts = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, this.maxLives - this.lives));
      tag.innerHTML = `💀 ${hearts} ⏱️ ${this.charLife.toFixed(1)}s`;
    }
  },

  startTimer(text) {
    if (this.timerId) clearInterval(this.timerId);
    let remaining = this.charLife;
    this.timerId = setInterval(() => {
      remaining -= 0.1;
      this.charLife = remaining;
      this.updateUI();
      if (remaining <= 0) {
        this.lives--;
        if (this.lives < 0) this.lives = 0;
        this.charLife = Math.max(1.0, 4 - this.currentCharIndex * 0.05);
        this.updateUI();
        if (this.lives <= 0) {
          clearInterval(this.timerId);
          this.timerId = null;
          const chars = this.typed.length;
          const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
          const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
          const wpm = Math.round((chars / 5) / (elapsed / 60));
          document.dispatchEvent(new CustomEvent('modeEndTest', { detail: { accuracy, wpm, modeId: this.id } }));
          return;
        }
        if (this.timerId) {
          clearInterval(this.timerId);
          this.startTimer(text);
        }
      }
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
    document.getElementById('accuracy-val').textContent = `${accuracy}%`;

    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars.length / 5) / (elapsed / 60));
    document.getElementById('ppm-val').textContent = wpm;
    state.currentPPM = wpm;

    const lastChar = chars[chars.length - 1];
    const lastTarget = text[chars.length - 1];
    if (chars.length > prevLen && chars.length > 0 && lastChar === lastTarget) {
      this.currentCharIndex++;
      this.charLife = Math.max(1.0, 4 - this.currentCharIndex * 0.05);
      this.startTimer(text);
    }

    if (chars.length >= text.length) {
      clearInterval(this.timerId);
      this.timerId = null;
      return { done: true, accuracy, wpm, playError: false };
    }
    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && lastChar !== lastTarget) };
  },

  reset() {
    if (this.timerId) clearInterval(this.timerId);
    this.lives = 5;
    this.maxLives = 5;
    this.charLife = 3;
    this.currentCharIndex = 0;
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.updateUI();
  },

  destroy() {
    if (this.timerId) clearInterval(this.timerId);
  },

  checkMedals(accuracy, wpm) {
    if (this.lives === this.maxLives) incrementMedal(this.id, 'survive_5');
    if (this.lives === 1) incrementMedal(this.id, 'survive_1');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `💀 Vidas restantes: ${this.lives} | ${accuracy}% precisão, ${wpm} PPM`;
  }
};