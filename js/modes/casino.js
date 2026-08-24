// js/modes/casino.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'casino',
  name: 'Cassino',
  linear: true,
  hasTimer: false,

  chips: 100,
  bet: 10,
  typed: '',
  errors: 0,
  startTime: null,
  winStreak: 0,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy:   { bet: 5 },
      medium: { bet: 10 },
      hard:   { bet: 20 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.chips = parseInt(localStorage.getItem('casino_chips')) || 100;
    this.bet = Math.min(config.bet, Math.floor(this.chips / 10));
    this.typed = '';
    this.errors = 0;
    this.winStreak = 0;
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
      tag.innerHTML = `💰 ${this.chips} fichas | Aposta: ${this.bet}`;
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
      let win = 0;
      if (accuracy === 100) {
        win = this.bet * 2;
        this.winStreak++;
      } else if (accuracy >= 90) {
        win = this.bet;
        this.winStreak++;
      } else if (accuracy >= 70) {
        win = 0;
        this.winStreak = 0;
      } else {
        win = -this.bet;
        this.winStreak = 0;
      }
      this.chips += win;
      if (this.chips < 0) this.chips = 0;
      localStorage.setItem('casino_chips', String(this.chips));
      this.bet = Math.min(10, Math.floor(this.chips / 10));
      this.updateUI();
      return { done: true, accuracy, wpm, playError: false };
    }
    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && chars[chars.length-1] !== text[chars.length-1]) };
  },

  reset() {
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.updateUI();
  },

  checkMedals(accuracy, wpm) {
    if (this.chips >= 500) incrementMedal(this.id, 'casino_500');
    if (this.winStreak >= 3) incrementMedal(this.id, 'casino_lucky');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `💰 ${this.chips} fichas | ${accuracy}% precisão, ${wpm} PPM`;
  }
};