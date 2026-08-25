// js/modes/wave.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'wave',
  name: 'Onda',
  linear: false,
  hasTimer: true,

  waveIndex: 0,
  words: [],
  currentWord: '',
  waveTimer: null,
  timeForWord: 3,
  timeLeft: 3,
  startTime: null,
  errors: 0,
  correctChars: 0,
  attemptedChars: 0,
  totalWords: 0,
  lastInputLength: 0,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy: { timeForWord: 5, wordCount: 6 },
      medium: { timeForWord: 3.5, wordCount: 8 },
      hard: { timeForWord: 2, wordCount: 10 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.timeForWord = config.timeForWord;
    const allWords = text.split(/\s+/).filter(Boolean);
    this.words = allWords.slice(0, config.wordCount);
    this.totalWords = this.words.length;
    this.waveIndex = 0;
    this.startTime = null;
    this.errors = 0;
    this.correctChars = 0;
    this.attemptedChars = 0;
    this.lastInputLength = 0;
    this.nextWord();
  },

  nextWord() {
    if (this.waveIndex >= this.totalWords) {
      const elapsed = Math.max(1, (performance.now() - this.startTime) / 1000);
      const wpm = Math.round((this.correctChars / 5) / (elapsed / 60));
      const accuracy = this.attemptedChars > 0 ? Math.round((this.correctChars / this.attemptedChars) * 100) : 100;
      document.dispatchEvent(new CustomEvent('modeEndTest', { detail: { accuracy, wpm, modeId: this.id } }));
      return;
    }

    this.currentWord = this.words[this.waveIndex];
    this.timeLeft = this.timeForWord;
    this.lastInputLength = 0;

    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = `<span style="color: var(--text-muted);">🌊 Onda ${this.waveIndex + 1}</span><br><strong style="font-size:1.4em;letter-spacing:2px;">${this.currentWord}</strong><div id="wave-feedback" class="mode-feedback" aria-live="polite"></div>`;
    }
    this.updateUI();
    this.updateProgress();
    this.resetInput();

    if (this.waveTimer) clearInterval(this.waveTimer);
    this.waveTimer = setInterval(() => {
      this.timeLeft = Math.max(0, this.timeLeft - 0.1);
      this.updateUI();
      if (this.timeLeft <= 0) {
        clearInterval(this.waveTimer);
        this.waveTimer = null;
        this.waveIndex++;
        this.errors++;
        this.nextWord();
      }
    }, 100);
  },

  resetInput() {
    const input = document.getElementById('hidden-input');
    if (input) input.value = '';
  },

  updateProgress() {
    const total = this.totalWords || 1;
    const progress = Math.round((this.waveIndex / total) * 100);
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    const percent = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${progress}%`;
    if (text) text.textContent = `${this.waveIndex} / ${this.totalWords} ondas`;
    if (percent) percent.textContent = `${progress}%`;
  },

  updateUI() {
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.innerHTML = `🌊 Onda ${Math.min(this.waveIndex + 1, this.totalWords)}/${this.totalWords} | ⏳ ${this.timeLeft.toFixed(1)}s`;
  },

  handleInput(value) {
    if (!this.startTime) this.startTime = performance.now();
    const target = this.currentWord;
    const previousLength = this.lastInputLength;
    this.lastInputLength = value.length;

    const feedback = document.getElementById('wave-feedback');
    if (feedback) feedback.textContent = '';

    if (value.length > previousLength) {
      const index = value.length - 1;
      const char = value[index];
      this.attemptedChars++;
      if (char === target[index]) {
        this.correctChars++;
      } else {
        this.errors++;
        if (feedback) feedback.textContent = '❌ Corrija o caractere antes de continuar.';
        return { playError: true };
      }
    }

    if (value.length > target.length) return { playError: true };

    if (value === target) {
      clearInterval(this.waveTimer);
      this.waveTimer = null;
      this.waveIndex++;
      this.nextWord();
    }

    return { playError: false };
  },

  reset() {
    if (this.waveTimer) clearInterval(this.waveTimer);
    this.waveTimer = null;
    this.waveIndex = 0;
    this.words = [];
    this.currentWord = '';
    this.startTime = null;
    this.errors = 0;
    this.correctChars = 0;
    this.attemptedChars = 0;
    this.totalWords = 0;
    this.lastInputLength = 0;
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = '🌊 Modo Onda';
  },

  destroy() {
    if (this.waveTimer) clearInterval(this.waveTimer);
    this.waveTimer = null;
  },

  checkMedals() {
    if (this.totalWords >= 10) incrementMedal(this.id, 'wave_10');
    if (this.errors === 0) incrementMedal(this.id, 'wave_perfect');
  },

  getMetrics() {
    const accuracy = this.attemptedChars > 0 ? Math.round((this.correctChars / this.attemptedChars) * 100) : 100;
    const elapsed = this.startTime ? Math.max(1, (performance.now() - this.startTime) / 1000) : 1;
    const wpm = Math.round((this.correctChars / 5) / (elapsed / 60));
    return { accuracy, wpm, progress: this.waveIndex };
  },

  getResultMessage(accuracy, wpm) {
    return `🌊 Ondas completadas: ${this.waveIndex} (${this.errors} erros de digitação/tempo)`;
  }
};