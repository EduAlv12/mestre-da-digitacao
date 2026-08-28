// js/modes/wordhunt.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'wordhunt', name: 'Caça-Palavras', linear: false, hasTimer: false,
  words: [], currentWordIndex: 0, scrambled: '', startTime: null, totalWords: 0,
  foundWords: 0, errors: 0, correctChars: 0, lastInputLength: 0,

  init(text) {
    const raw = text.split(/\s+/).filter(Boolean);
    this.words = [...raw].sort(() => Math.random() - 0.5);
    this.totalWords = this.words.length; this.currentWordIndex = 0; this.foundWords = 0;
    this.errors = 0; this.correctChars = 0; this.lastInputLength = 0; this.startTime = null;
    this.showWord(); this.resetInput(); this.updateProgress(0);
  },
  elapsedSeconds() { return this.startTime ? Math.max(0.001, (performance.now() - this.startTime) / 1000) : 0.001; },
  showWord() {
    if (this.currentWordIndex >= this.totalWords) {
      const elapsed = this.elapsedSeconds();
      const wpm = Math.round((this.correctChars / 5) / (elapsed / 60));
      const attempts = this.correctChars + this.errors;
      const accuracy = attempts > 0 ? Math.round((this.correctChars / attempts) * 100) : 100;
      document.dispatchEvent(new CustomEvent('modeEndTest', { detail: { accuracy, wpm, modeId: this.id } })); return;
    }
    const word = this.words[this.currentWordIndex]; const arr = word.split(''); let shuffled = arr.join(''), guard = 0;
    while (arr.length > 1 && shuffled === word && guard++ < 10) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } shuffled = arr.join(''); }
    this.scrambled = shuffled;
    const display = document.getElementById('text-display');
    if (display) display.innerHTML = `<span style="color: var(--text-muted);">🔍 Digite a palavra correta:</span><br><strong style="font-size:1.2em;letter-spacing:2px;">${this.scrambled}</strong><div id="wordhunt-feedback" class="mode-feedback" aria-live="polite"></div>`;
    const tag = document.getElementById('mode-status-tag'); if (tag) tag.textContent = `🧩 Palavra ${this.currentWordIndex + 1}/${this.totalWords}`;
    const progress = Math.round((this.currentWordIndex / this.totalWords) * 100);
    const fill = document.getElementById('progress-fill'), text = document.getElementById('progress-text'), percent = document.getElementById('progress-percent');
    if (fill) fill.style.width = `${progress}%`; if (text) text.textContent = `${this.currentWordIndex} / ${this.totalWords} palavras`; if (percent) percent.textContent = `${progress}%`;
    this.lastInputLength = 0; state.previousInput = ''; this.resetInput();
  },
  resetInput() { const input = document.getElementById('hidden-input'); if (input) input.value = ''; },
  updateProgress() { const total = this.totalWords || 1, percent = Math.round((this.currentWordIndex / total) * 100), fill = document.getElementById('progress-fill'), text = document.getElementById('progress-text'), pct = document.getElementById('progress-percent'); if (fill) fill.style.width = `${percent}%`; if (text) text.textContent = `${this.currentWordIndex} / ${this.totalWords} palavras`; if (pct) pct.textContent = `${percent}%`; },
  handleInput(value) {
    const target = this.words[this.currentWordIndex]; if (!target) return { playError: false };
    if (!this.startTime) this.startTime = performance.now();
    const previousLength = this.lastInputLength; this.lastInputLength = value.length;
    const feedback = document.getElementById('wordhunt-feedback'); if (feedback) feedback.textContent = '';
    if (value.length > previousLength) { const index = value.length - 1, char = value[index]; if (char === target[index]) this.correctChars++; else { this.errors++; if (feedback) feedback.textContent = '❌ Caractere incorreto — corrija com Backspace.'; return { playError: true }; } }
    if (value.length > target.length) return { playError: true };
    if (value === target) { this.foundWords++; this.currentWordIndex++; this.showWord(); return { playError: false }; }
    return { playError: false };
  },
  reset() { this.words = []; this.currentWordIndex = 0; this.startTime = null; this.totalWords = 0; this.foundWords = 0; this.errors = 0; this.correctChars = 0; this.lastInputLength = 0; state.previousInput = ''; },
  checkMedals() { if (this.totalWords >= 10) incrementMedal(this.id, 'hunt_10'); if (this.totalWords >= 20) incrementMedal(this.id, 'hunt_20'); },
  getMetrics() { const attempts = this.correctChars + this.errors, accuracy = attempts > 0 ? Math.round((this.correctChars / attempts) * 100) : 100, elapsed = this.elapsedSeconds(); return { accuracy, wpm: Math.round((this.correctChars / 5) / (elapsed / 60)), progress: this.currentWordIndex }; },
  getResultMessage(accuracy, wpm) { return `🧩 ${this.foundWords} palavras encontradas de ${this.totalWords} — ${accuracy}% de precisão.`; }
};