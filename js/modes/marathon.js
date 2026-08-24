// js/modes/marathon.js
import { state, SENTENCES } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'marathon',
  name: 'Maratona',
  linear: true,
  hasTimer: true,

  timeLimit: 60,
  timeLeft: 60,
  wordsTyped: 0,
  timerId: null,
  typed: '',
  errors: 0,
  startTime: null,
  currentWord: '',
  wordPool: [],

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy:   { time: 60, wordCount: 5 },
      medium: { time: 45, wordCount: 7 },
      hard:   { time: 30, wordCount: 10 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    this.timeLimit = config.time;
    this.timeLeft = config.time;
    // A maratona conta palavras individuais, não frases inteiras.
    this.wordPool = (state.currentDifficulty === 'custom' ? text : (SENTENCES[state.currentDifficulty] || SENTENCES.easy).join(' '))
      .split(/\s+/)
      .map(word => word.trim())
      .filter(Boolean);
    this.currentWord = this.wordPool[0] || '';
    this.wordsTyped = 0;
    this.typed = '';
    this.errors = 0;
    this.startTime = performance.now();

    this.render(text);
    this.resetInput();
    this.updateProgress(0);
    this.updateUI();
    this.startTimer();
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
    const total = this.currentWord.length;
    const percent = Math.min(100, Math.round((typed / total) * 100));
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('progress-text').textContent = `${typed} / ${total} caracteres`;
    document.getElementById('progress-percent').textContent = `${percent}%`;
  },

  updateUI() {
    const tag = document.getElementById('mode-status-tag');
    if (tag) {
      tag.innerHTML = `🏃 ${this.timeLeft}s | Palavras: ${this.wordsTyped}`;
    }
    if (document.getElementById('timer-val')) {
      document.getElementById('timer-val').textContent = `${this.timeLeft}s`;
    }
  },

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.timeLeft--;
      this.updateUI();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerId);
        this.timerId = null;
        const chars = this.typed.length;
        const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
        const wpm = Math.round(this.wordsTyped / (this.timeLimit / 60));
        document.dispatchEvent(new CustomEvent('modeEndTest', { detail: { accuracy, wpm, modeId: this.id } }));
      }
    }, 1000);
  },

  nextWord() {
    const words = this.wordPool;
    this.currentWord = words[Math.floor(Math.random() * words.length)] || '';
    this.typed = '';
    this.errors = 0;
    this.render(this.currentWord);
    this.resetInput();
    this.updateProgress(0);
  },

  handleInput(value) {
    const text = this.currentWord;
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

    const elapsed = this.timeLimit - this.timeLeft;
    const wpm = elapsed > 0 ? Math.round(this.wordsTyped / (elapsed / 60)) : 0;
    document.getElementById('ppm-val').textContent = wpm;
    state.currentPPM = wpm;

    if (chars.length >= text.length) {
      this.wordsTyped++;
      this.updateUI();
      this.nextWord();
      return { playError: false };
    }
    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && chars[chars.length-1] !== text[chars.length-1]) };
  },

  reset() {
    if (this.timerId) clearInterval(this.timerId);
    this.timeLeft = this.timeLimit;
    this.wordsTyped = 0;
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.updateUI();
    document.getElementById('timer-val').textContent = `${this.timeLimit}s`;
  },

  destroy() {
    if (this.timerId) clearInterval(this.timerId);
  },

  checkMedals(accuracy, wpm) {
    if (this.wordsTyped >= 50) incrementMedal(this.id, 'marathon_50');
    if (this.wordsTyped >= 100) incrementMedal(this.id, 'marathon_100');
  },

  getMetrics() {
    const elapsed = this.timeLimit - this.timeLeft;
    const wpm = elapsed > 0 ? Math.round(this.wordsTyped / (elapsed / 60)) : 0;
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `🏃 ${this.wordsTyped} palavras em ${this.timeLimit}s | ${wpm} PPM`;
  }
};