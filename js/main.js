// js/main.js
import './ui-v3.js';
import { state } from './modules/utils.js';
import { audioEngine } from './modules/audio.js';
import { loadAchievements } from './modules/stats.js';
import { setupTypingEvents } from './modules/typing.js';
import { setDifficulty, setTheme, setSoundProfile, loadSavedSettings, setupModalTriggers, showWelcomeModal, toggleTimerMode, setupShareButton, renderHistoryChart as renderChart } from './modules/ui.js';
import { loadSavedMode } from './modes/index.js';
import { setupChangelog } from './modules/changelog.js';
import { setupRestartControl } from './modules/restart-control.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Mestre da Digitação iniciado!');
  loadSavedSettings();
  loadSavedMode();
  setupModalTriggers();
  setupShareButton();
  setupTypingEvents();
  setupChangelog();
  setupRestartControl();
  setDifficulty('easy');
  loadAchievements();

  // O tutorial automático aparece somente na primeira visita deste navegador.
  // O botão "Tutorial" continua podendo abrir o tutorial manualmente depois.
  const tutorialSeenKey = 'mestre_tutorial_seen_v1';
  if (localStorage.getItem(tutorialSeenKey) !== '1') {
    showWelcomeModal();
    localStorage.setItem(tutorialSeenKey, '1');
  }

  const timerBtn = document.getElementById('timer-mode-btn');
  if (timerBtn) timerBtn.addEventListener('click', toggleTimerMode);
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