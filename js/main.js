// js/main.js
import './ui-v3.js';
import '../js/keyboard-focus.js';
import { state } from './modules/utils.js';
import { audioEngine } from './modules/audio.js';
import { loadAchievements } from './modules/stats.js';
import { setupTypingEvents, initTest } from './modules/typing.js';
import { setDifficulty, setTheme, setSoundProfile, loadSavedSettings, setupModalTriggers, setupShareButton, renderHistoryChart as renderChart } from './modules/ui.js';
import { loadSavedMode } from './modes/index.js';
import { setupChangelog } from './modules/changelog.js';
import { setupRestartControl } from './modules/restart-control.js';
import { normalizeGlobalProgress } from './modules/global-progress.js';
import { updateGlobalLevelUI } from './modules/stats.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Mestre da Digitação iniciado!');
  loadSavedSettings();
  normalizeGlobalProgress();
  loadSavedMode();
  setupModalTriggers();
  setupShareButton();
  setupTypingEvents();
  setupChangelog();
  setupRestartControl();
  setDifficulty('easy');

  // Se a primeira inicialização foi interrompida por alguma transição de UI,
  // renderiza a frase somente quando o quadro ainda estiver vazio.
  requestAnimationFrame(() => {
    const textDisplay = document.getElementById('text-display');
    if (!textDisplay?.textContent?.trim() || !state.currentText) initTest();
  });

  loadAchievements();
  updateGlobalLevelUI();

  // Contra-Relógio foi removido da interface. Os modos que possuem
  // temporizador próprio continuam usando seus cronômetros normalmente.
  document.getElementById('timer-mode-btn')?.remove();

  const stats = state.modeStats[state.currentModeId] || { bestPPM: 0 };
  const bestEl = document.getElementById('best-ppm-val');
  if (bestEl) bestEl.textContent = stats.bestPPM || 0;
  renderChart(state.currentModeId);
  document.addEventListener('click', () => { audioEngine.init(); }, { once: true });
  window.addEventListener('beforeunload', () => {
    localStorage.setItem('mestre_user_stats', JSON.stringify(state.userStats));
    localStorage.setItem('mestre_mode_stats', JSON.stringify(state.modeStats));
  });
});