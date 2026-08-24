// js/modes/fury.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'fury',
  name: 'Fúria',
  linear: true,
  hasTimer: false,

  typed: '',
  errors: 0,
  startTime: null,
  streak: 0,
  maxStreak: 0,
  furyLevel: 0,
  targetPPM: 20,
  basePPM: 20,
  speedIncrement: 2,
  streakThreshold: 10,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy:   { threshold: 10, increment: 2, basePPM: 20 },
      medium: { threshold: 8,  increment: 3, basePPM: 25 },
      hard:   { threshold: 5,  increment: 5, basePPM: 30 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.streakThreshold = config.threshold;
    this.speedIncrement = config.increment;
    this.basePPM = config.basePPM;
    this.targetPPM = config.basePPM;

    this.typed = '';
    this.errors = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.furyLevel = 0;
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
      tag.innerHTML = `🔥 Streak: ${this.streak} | Nível ${this.furyLevel} (⏱️ ${this.targetPPM} PPM)`;
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
    let wpm = Math.round((chars.length / 5) / (elapsed / 60));
    document.getElementById('ppm-val').textContent = wpm;
    state.currentPPM = wpm;

    // Lógica da Fúria
    const lastChar = chars[chars.length - 1];
    const lastTarget = text[chars.length - 1];
    if (chars.length > prevLen && chars.length > 0) {
      if (lastChar === lastTarget) {
        this.streak++;
        if (this.streak > this.maxStreak) this.maxStreak = this.streak;
        if (this.streak % this.streakThreshold === 0) {
          this.furyLevel++;
          this.targetPPM += this.speedIncrement;
          // Notifica o aumento
          const msg = document.getElementById('result-message');
          if (msg) {
            msg.className = 'result-message success';
            msg.innerHTML = `⚡ Fúria Nível ${this.furyLevel}! PPM alvo: ${this.targetPPM}`;
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 1500);
          }
        }
      } else {
        this.streak = 0;
        this.furyLevel = 0;
        this.targetPPM = this.basePPM; // volta ao alvo base da dificuldade
      }
      this.updateUI();
    }

    // Verifica se completou a frase
    if (chars.length >= text.length) {
      return { done: true, accuracy, wpm, playError: false };
    }

    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && lastChar !== lastTarget) };
  },

  reset() {
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.streak = 0;
    this.maxStreak = 0;
    this.furyLevel = 0;
    this.basePPM = 20;
    this.targetPPM = 20;
  },

  checkMedals(accuracy, wpm) {
    if (this.maxStreak >= 50) incrementMedal(this.id, 'fury_50');
    if (this.maxStreak >= 100) incrementMedal(this.id, 'fury_100');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `🔥 Streak máximo: ${this.maxStreak} | ${accuracy}% precisão, ${wpm} PPM`;
  }
};