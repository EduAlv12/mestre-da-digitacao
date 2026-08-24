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

  init(text) {
    // Divide o texto em palavras
    const raw = text.split(/\s+/);
    // Embaralha a ordem das palavras
    this.words = [...raw].sort(() => Math.random() - 0.5);
    this.totalWords = this.words.length;
    this.currentWordIndex = 0;
    this.foundWords = 0;
    this.startTime = performance.now();

    this.showWord();
    this.resetInput();
    this.updateProgress(0);
  },

  showWord() {
    if (this.currentWordIndex >= this.totalWords) {
      const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
      const totalChars = state.currentText.length;
      const wpm = Math.round((totalChars / 5) / (elapsed / 60));
      document.dispatchEvent(new CustomEvent('modeEndTest', { detail: { accuracy: 100, wpm, modeId: this.id } }));
      return;
    }
    const word = this.words[this.currentWordIndex];
    // Embaralha a palavra
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    this.scrambled = arr.join('');
    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = `<span style="color: var(--text-muted);">🔍 Digite a palavra correta:</span><br><strong style="font-size:1.2em;letter-spacing:2px;">${this.scrambled}</strong>`;
    }
    const tag = document.getElementById('mode-status-tag');
    if (tag) tag.textContent = `🧩 Palavra ${this.currentWordIndex+1}/${this.totalWords}`;
    
    const progress = Math.round((this.currentWordIndex / this.totalWords) * 100);
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${this.currentWordIndex} / ${this.totalWords} palavras`;
    document.getElementById('progress-percent').textContent = `${progress}%`;
    
    this.resetInput();
  },

  resetInput() {
    document.getElementById('hidden-input').value = '';
  },

  updateProgress(typed) {
    // Não usado diretamente, mas mantido para compatibilidade
  },

  handleInput(value) {
    const typed = value.trim();
    if (typed.length > 0 && typed === this.words[this.currentWordIndex]) {
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
  },

  checkMedals(accuracy, wpm) {
    if (this.totalWords >= 10) incrementMedal(this.id, 'hunt_10');
    if (this.totalWords >= 20) incrementMedal(this.id, 'hunt_20');
  },

  getMetrics() {
    return { accuracy: 100, wpm: 0, progress: this.currentWordIndex };
  },

  getResultMessage(accuracy, wpm) {
    return `🧩 ${this.foundWords} palavras encontradas de ${this.totalWords}!`;
  }
};