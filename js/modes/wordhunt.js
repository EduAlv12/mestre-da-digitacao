// js/modes/wordhunt.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'wordhunt',
  name: 'Caça-Palavras',
  linear: false,
  hasTimer: false,

  words: [],
  currentWordIndex: 0,
  scrambled: '',
  startTime: null,
  totalWords: 0,
  foundWords: 0,
  errors: 0,
  correctChars: 0,
  lastInputLength: 0,

  init(text) {
    const raw = text.split(/\s+/).filter(Boolean);
    this.words = [...raw].sort(() => Math.random() - 0.5);
    this.totalWords = this.words.length;
    this.currentWordIndex = 0;
    this.foundWords = 0;
    this.errors = 0;
    this.correctChars = 0;
    this.lastInputLength = 0;
    this.startTime = null;

    this.showWord();
    this.resetInput();
    this.updateProgress(0);
  },

  showWord() {
    if (this.currentWordIndex >= this.totalWords) {
      const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
      const totalChars = this.words.reduce((sum, word) => sum + word.length, 0);
      const wpm = Math.round((totalChars / 5) / (elapsed / 60));
      const attempts = this.correctChars + this.errors;
      const accuracy = attempts > 0 ? Math.round((this.correctChars / attempts) * 100) : 100;
      document.dispatchEvent(new CustomEvent('modeEndTest', { detail: { accuracy, wpm, modeId: this.id } }));
      return;
    }

    const word = this.words[this.currentWordIndex];
    const arr = word.split('');
    if (arr.length > 1) {
      let shuffled = arr.join('');
      let guard = 0;
      while (shuffled === word && guard < 10) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        shuffled = arr.join('');
        guard++;
      }
      this.scrambled = shuffled;
    } else {
      this.scrambled = word;
    }

    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = `<span style="color: var(--text-muted);">🔍 Digite a palavra correta:</span><br><strong style="font-size:1.2em;letter-spacing:2px;">${this.scrambled}</strong><div id="wordhunt-feedback" class="mode-feedback" aria-live="polite"></div>`;
    }

    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = `🧩 Palavra ${this.currentWordIndex + 1}/${this.totalWords}`;

    const progress = Math.round((this.currentWordIndex / this.totalWords) * 100);
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    const percent = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${progress}%`;
    if (text) text.textContent = `${this.currentWordIndex} / ${this.totalWords} palavras`;
    if (percent) percent.textContent = `${progress}%`;

    this.lastInputLength = 0;
    this.resetInput();
  },

  resetInput() {
    const input = document.getElementById('hidden-input');
    if (input) input.value = '';
  },

  updateProgress(typed) {
    const total = this.totalWords || 1;
    const percent = Math.round((this.currentWordIndex / total) * 100);
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    const pct = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${this.currentWordIndex} / ${this.totalWords} palavras`;
    if (pct) pct.textContent = `${percent}%`;
  },

  handleInput(value) {
    const target = this.words[this.currentWordIndex];
    if (!target) return { playError: false };

    if (!this.startTime) this.startTime = performance.now();

    const typed = value;
    const previousLength = this.lastInputLength;
    this.lastInputLength = typed.length;

    const feedback = document.getElementById('wordhunt-feedback');
    if (feedback) feedback.textContent = '';

    // Conta apenas uma nova tecla como tentativa de erro; backspace não penaliza.
    if (typed.length > previousLength) {
      const index = typed.length - 1;
      const char = typed[index];
      if (char === target[index]) {
        this.correctChars++;
      } else {
        this.errors++;
        if (feedback) feedback.textContent = '❌ Caractere incorreto — corrija com Backspace.';
        return { playError: true };
      }
    }

    if (typed.length > target.length) {
      return { playError: true };
    }

    if (typed === target) {
      this.foundWords++;
      this.currentWordIndex++;
      this.showWord();
      return { playError: false };
    }

    return { playError: false };
  },

  reset() {
    this.words = [];
    this.currentWordIndex = 0;
    this.startTime = null;
    this.totalWords = 0;
    this.foundWords = 0;
    this.errors = 0;
    this.correctChars = 0;
    this.lastInputLength = 0;
  },

  checkMedals() {
    if (this.totalWords >= 10) incrementMedal(this.id, 'hunt_10');
    if (this.totalWords >= 20) incrementMedal(this.id, 'hunt_20');
  },

  getMetrics() {
    const attempts = this.correctChars + this.errors;
    const accuracy = attempts > 0 ? Math.round((this.correctChars / attempts) * 100) : 100;
    const elapsed = this.startTime ? Math.max(1, (performance.now() - this.startTime) / 1000) : 1;
    const wpm = Math.round((this.correctChars / 5) / (elapsed / 60));
    return { accuracy, wpm, progress: this.currentWordIndex };
  },

  getResultMessage(accuracy, wpm) {
    return `🧩 ${this.foundWords} palavras encontradas de ${this.totalWords} — ${accuracy}% de precisão.`;
  }
};