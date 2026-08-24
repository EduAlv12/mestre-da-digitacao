// js/main.js
import { state } from './modules/utils.js';
import { audioEngine } from './modules/audio.js';
import { loadAchievements, renderAchievementsUI } from './modules/stats.js';
import { setupTypingEvents } from './modules/typing.js';
import {
  setDifficulty,
  setTheme,
  setSoundProfile,
  loadSavedSettings,
  setupModalTriggers,
  showWelcomeModal,
  toggleTimerMode,
  setupShareButton,
  renderHistoryChart as renderChart
} from './modules/ui.js';
import { loadSavedMode } from './modes/index.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Mestre da Digitação iniciado!');
  
  loadSavedSettings();
  loadSavedMode();
  
  setupModalTriggers();
  setupShareButton();
  setupTypingEvents();

  setDifficulty('easy');
  loadAchievements();

  showWelcomeModal();

  const timerBtn = document.getElementById('timer-mode-btn');
  if (timerBtn) timerBtn.addEventListener('click', toggleTimerMode);

  const stats = state.modeStats[state.currentModeId] || { bestPPM: 0 };
  const bestEl = document.getElementById('best-ppm-val');
  if (bestEl) bestEl.textContent = stats.bestPPM || 0;

  renderChart(state.currentModeId);

  document.addEventListener('click', () => {
    audioEngine.init();
  }, { once: true });

  window.addEventListener('beforeunload', () => {
    localStorage.setItem('mestre_user_stats', JSON.stringify(state.userStats));
    localStorage.setItem('mestre_mode_stats', JSON.stringify(state.modeStats));
  });
});