// js/main.js
import './ui-v3.js';
import './keyboard-focus.js';
import './mode-help-fix.js';
import { state } from './modules/utils.js';
import { audioEngine } from './modules/audio.js';
import { loadAchievements, updateGlobalLevelUI } from './modules/stats.js';
import { setDifficulty, loadSavedSettings, setupModalTriggers, setupShareButton, renderHistoryChart as renderChart } from './modules/ui.js';
import { loadSavedMode } from './modes/index.js';
import { setupChangelog } from './modules/changelog.js';
import { setupRestartControl } from './modules/restart-control.js';
import { normalizeGlobalProgress } from './modules/global-progress.js';
import { setupTypingEvents } from './modules/typing.js';

document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
  normalizeGlobalProgress();
  loadSavedMode();
  setupModalTriggers();
  setupShareButton();
  setupTypingEvents();
  setupChangelog();
  setupRestartControl();

  setDifficulty(state.currentDifficulty || 'easy');
  loadAchievements();
  updateGlobalLevelUI();

  const tutorialText = document.querySelector('.tutorial-step[data-step="2"] .tutorial-text');
  const tutorialDemo = document.querySelector('.tutorial-step[data-step="2"] .tutorial-demo');
  if (tutorialText) tutorialText.innerHTML = 'Escolha entre <strong>10 modos de jogo</strong> únicos! Cada modo tem mecânicas diferentes e medalhas exclusivas.';
  if (tutorialDemo) tutorialDemo.textContent = '🔥 Fúria • 💀 Sobrevivência • 🎯 Sniper • 🧩 WordHunt • 💰 Cassino • 🏃 Maratona • 🧠 Memória • 🌊 Onda • ⚔️ RPG';

  const stats = state.modeStats[state.currentModeId] || { bestPPM: 0 };
  const bestEl = document.getElementById('best-ppm-val');
  if (bestEl) bestEl.textContent = stats.bestPPM || 0;
  renderChart(state.currentModeId);

  document.addEventListener('pointerdown', () => audioEngine.init(), { once: true, passive: true });

  window.addEventListener('beforeunload', () => {
    localStorage.setItem('mestre_user_stats', JSON.stringify(state.userStats));
    localStorage.setItem('mestre_mode_stats', JSON.stringify(state.modeStats));
  });
});
