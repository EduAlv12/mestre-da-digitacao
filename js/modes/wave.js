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
  totalWords: 0,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy:   { timeForWord: 5, wordCount: 6 },
      medium: { timeForWord: 3.5, wordCount: 8 },
      hard:   { timeForWord: 2, wordCount: 10 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.timeForWord = config.timeForWord;
    // Pega as primeiras N palavras do texto
    const allWords = text.split(/\s+/);
    this.words = allWords.slice(0, config.wordCount);
    this.totalWords = this.words.length;
    this.waveIndex = 0;
    this.startTime = performance.now();
    this.errors = 0;
    this.nextWord();
    this.resetInput();
    this.updateProgress(0);
  },

  nextWord() {
    if (this.waveIndex >= this.totalWords) {
      const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
      const totalChars = state.currentText.length;
      const wpm = Math.round((totalChars / 5) / (elapsed / 60));
      const accuracy = this.totalWords > 0 ? Math.round(((this.totalWords - this.errors) / this.totalWords) * 100) : 100;
      document.dispatchEvent(new CustomEvent('modeEndTest', { detail: { accuracy, wpm, modeId: this.id } }));
      return;
    }
    this.currentWord = this.words[this.waveIndex];
    this.timeLeft = this.timeForWord;
    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = `<span style="color: var(--text-muted);">🌊 Onda ${this.waveIndex+1}</span><br><strong style="font-size:1.4em;letter-spacing:2px;">${this.currentWord}</strong>`;
    }
    this.updateUI();
    if (this.waveTimer) clearInterval(this.waveTimer);
    this.waveTimer = setInterval(() => {
      this.timeLeft -= 0.1;
      this.updateUI();
      if (this.timeLeft <= 0) {
        clearInterval(this.waveTimer);
        this.waveIndex++;
        this.errors++;
        this.nextWord();
      }
    }, 100);
    
    const progress = Math.round((this.waveIndex / this.totalWords) * 100);
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${this.waveIndex} / ${this.totalWords} ondas`;
    document.getElementById('progress-percent').textContent = `${progress}%`;
    
    this.resetInput();
  },

  resetInput() {
    document.getElementById('hidden-input').value = '';
  },

  updateProgress(typed) {
    // não usado diretamente
  },

  updateUI() {
    const tag = document.getElementById('mode-status-tag');
    if (tag) {
      tag.innerHTML = `🌊 Onda ${this.waveIndex+1}/${this.totalWords} | ⏳ ${this.timeLeft.toFixed(1)}s`;
    }
  },

  handleInput(value) {
    const typed = value.trim();
    if (typed === this.currentWord) {
      clearInterval(this.waveTimer);
      this.waveIndex++;
      this.nextWord();
      return { playError: false };
    }
    return { playError: false };
  },

  reset() {
    if (this.waveTimer) clearInterval(this.waveTimer);
    this.waveIndex = 0;
    this.words = [];
    this.startTime = null;
    this.errors = 0;
    this.totalWords = 0;
    document.getElementById('mode-status-tag').textContent = '🌊 Modo Onda';
  },

  destroy() {
    if (this.waveTimer) clearInterval(this.waveTimer);
  },

  checkMedals(accuracy, wpm) {
    if (this.totalWords >= 10) incrementMedal(this.id, 'wave_10');
    if (this.errors === 0) incrementMedal(this.id, 'wave_perfect');
  },

  getMetrics() {
    const accuracy = this.totalWords > 0 ? Math.round(((this.totalWords - this.errors) / this.totalWords) * 100) : 100;
    const elapsed = this.startTime ? Math.max(1, Math.floor((performance.now() - this.startTime) / 1000)) : 1;
    const wpm = Math.round((this.waveIndex / (elapsed / 60)) || 0);
    return { accuracy, wpm, progress: this.waveIndex };
  },

  getResultMessage(accuracy, wpm) {
    return `🌊 Ondas completadas: ${this.waveIndex} (${this.errors} erros)`;
  }
};