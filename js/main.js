// js/main.js
import './ui-v3.js';
import './keyboard-focus.js';
import './input-controller.js';
import { state } from './modules/utils.js';
import { audioEngine } from './modules/audio.js';
import { loadAchievements } from './modules/stats.js';
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

  // Restaura apenas o modo. A primeira partida é criada uma única vez por
  // setDifficulty(), depois que todos os elementos da interface existem.
  loadSavedMode();
  setupTypingEventsFallback();
  setupModalTriggers();
  setupShareButton();
  setupChangelog();
  setupRestartControl();

  setDifficulty(state.currentDifficulty || 'easy');

  loadAchievements();
  updateGlobalLevelUI();

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

// O controlador novo (input-controller.js) é a única fonte de eventos de
// digitação. Este fallback mantém compatibilidade caso uma página antiga
// tenha sido carregada sem ele, sem registrar um segundo listener quando o
// controlador novo já estiver ativo.
function setupTypingEventsFallback() {
  const input = document.getElementById('hidden-input');
  if (!input || input.dataset.inputControllerReady === 'true') return;
  console.warn('Controlador de entrada ainda não foi inicializado.');
}
