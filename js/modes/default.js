// js/modes/default.js
import { state, SENTENCES } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'default',
  name: 'Padrão',
  linear: true,
  hasTimer: false,

  typed: '',
  errors: 0,
  startTime: null,
  phase: 0,           // fase atual (cada frase completada com ≥90% sobe)
  phaseTexts: [],     // lista de frases da fase

  init(text) {
    this.typed = '';
    this.errors = 0;
    this.startTime = performance.now();

    // Define o pool de frases com base na dificuldade
    const diff = state.currentDifficulty;
    const pool = SENTENCES[diff] || SENTENCES.easy;
    // Seleciona 5 frases para a fase (ou menos se não houver suficientes)
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.phaseTexts = shuffled.slice(0, 5);
    this.phase = 0;
    this.currentText = this.phaseTexts[0];

    this.render();
    this.resetInput();
    this.updateProgress(0);
  },

  render() {
    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = this.currentText.split('').map((ch, i) =>
        `<span class="char ${i === 0 ? 'current' : ''}">${ch}</span>`
      ).join('');
    }
    const tag = document.getElementById('mode-status-tag');
    if (tag) {
      tag.textContent = `📖 Fase ${this.phase+1}/${this.phaseTexts.length}`;
    }
  },

  resetInput() {
    document.getElementById('hidden-input').value = '';
  },

  updateProgress(typed) {
    const total = this.currentText.length;
    const percent = Math.min(100, Math.round((typed / total) * 100));
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('progress-text').textContent = `${typed} / ${total} caracteres`;
    document.getElementById('progress-percent').textContent = `${percent}%`;
  },

  handleInput(value) {
    const text = this.currentText;
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

    // Verifica se completou a frase atual
    if (chars.length >= text.length) {
      // Avança para a próxima fase se a precisão for ≥ 90%
      if (accuracy >= 90) {
        this.phase++;
        if (this.phase < this.phaseTexts.length) {
          this.currentText = this.phaseTexts[this.phase];
          this.render();
          this.resetInput();
          this.typed = '';
          this.errors = 0;
          this.updateProgress(0);
          document.getElementById('accuracy-val').textContent = '100%';
          return { playError: false, playSound: true };
        } else {
          // Fase concluída! Finaliza o teste com sucesso.
          return { done: true, accuracy, wpm, playError: false };
        }
      } else {
        // Precisão baixa: recomeça a mesma frase
        this.render();
        this.resetInput();
        this.typed = '';
        this.errors = 0;
        this.updateProgress(0);
        document.getElementById('accuracy-val').textContent = '100%';
        return { playError: true, playSound: true };
      }
    }

    return { done: false, playError: (chars.length > prevLen && chars.length > 0 && chars[chars.length-1] !== text[chars.length-1]) };
  },

  reset() {
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.phase = 0;
    this.phaseTexts = [];
    this.currentText = '';
  },

  checkMedals(accuracy, wpm, time) {
    const diff = state.currentDifficulty;
    const limits = { easy: { time15: 15, time30: 30, speed60: 50 },
                     medium: { time15: 20, time30: 40, speed60: 60 },
                     hard: { time15: 30, time30: 60, speed60: 70 } }[diff] || { time15: 15, time30: 30, speed60: 50 };
    if (accuracy >= 90) incrementMedal(this.id, 'accuracy');
    if (time <= limits.time15 && accuracy >= 90) incrementMedal(this.id, 'time15');
    if (time <= limits.time30 && accuracy >= 90) incrementMedal(this.id, 'time30');
    if (wpm >= limits.speed60 && accuracy >= 90) incrementMedal(this.id, 'speed60');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `📖 Fases completadas: ${this.phase}/${this.phaseTexts.length} | ${accuracy}% precisão, ${wpm} PPM`;
  }
};