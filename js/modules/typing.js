// js/modules/typing.js
import { state, saveState, SENTENCES, getModeStats } from './utils.js';
import { incrementMedal, updatePPMHistory, loadAchievements, checkRoundAchievements, trackSpaceKey, addGlobalXP } from './stats.js';
import { audioEngine } from './audio.js';
import { getModeHandler, getModeId, MODE_NAMES, renderModeDashboard } from '../modes/index.js';

const hiddenInput = document.getElementById('hidden-input');
const textDisplay = document.getElementById('text-display');
const ppmVal = document.getElementById('ppm-val');
const accuracyVal = document.getElementById('accuracy-val');
const timerVal = document.getElementById('timer-val');
const resultMessage = document.getElementById('result-message');
const countdownTag = document.getElementById('countdown-tag');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const progressPercent = document.getElementById('progress-percent');
const modeStatusTag = document.getElementById('mode-status-tag');

function syncRpgContinueButton() {
  const btn = document.getElementById('rpg-continue-btn');
  if (!btn) return;
  const isRpg = getModeId() === 'rpg';
  if (!isRpg) {
    btn.classList.add('hidden');
    btn.setAttribute('aria-hidden', 'true');
  } else {
    btn.setAttribute('aria-hidden', 'false');
  }
}

document.addEventListener('modeEndTest', (e) => {
  const { accuracy, wpm, modeId } = e.detail || {};
  if (modeId && modeId !== getModeId()) return;
  endTest(accuracy, wpm, modeId);
});

document.addEventListener('modeResetTest', () => {
  initTest();
});

document.addEventListener('modeUpdateDisplay', (e) => {
  if (e.detail?.html) {
    textDisplay.innerHTML = e.detail.html;
  }
});

export function updateProgress(typed, total) {
  const percent = total > 0 ? Math.min(100, Math.round((typed / total) * 100)) : 0;
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${typed} / ${total} caracteres`;
  if (progressPercent) progressPercent.textContent = `${percent}%`;
}

function getElapsedSeconds() {
  return Math.max(1, Math.floor((performance.now() - state.startTime) / 1000));
}

function startTimer() {
  if (state.isRunning) return;
  state.isRunning = true;
  state.startTime = performance.now();
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    const sec = getElapsedSeconds();
    if (timerVal) timerVal.textContent = `${sec}s`;
    const mode = getModeHandler();
    if (mode && mode.getMetrics) {
      const metrics = mode.getMetrics();
      if (metrics && metrics.wpm !== undefined) {
        ppmVal.textContent = metrics.wpm;
        state.currentPPM = metrics.wpm;
      }
      if (metrics && metrics.accuracy !== undefined) {
        accuracyVal.textContent = `${metrics.accuracy}%`;
      }
      renderModeDashboard();
    }
  }, 1000);
}

export function endTest(finalAccuracy, finalWpm, modeId) {
  if (state._ending) return;
  state._ending = true;

  clearInterval(state.timerInterval);
  clearInterval(state.timerModeInterval);
  state.timerModeInterval = null;
  state.isRunning = false;

  const mode = getModeHandler();
  const id = modeId || getModeId();
  const finalTime = getElapsedSeconds();
  if (timerVal) timerVal.textContent = `${finalTime}s`;

  let accuracy = finalAccuracy;
  let wpm = finalWpm;
  if (mode && mode.getMetrics) {
    const metrics = mode.getMetrics();
    if (accuracy === undefined || accuracy === null) accuracy = metrics.accuracy;
    if (wpm === undefined || wpm === null) wpm = metrics.wpm;
  }
  if (accuracy === undefined || accuracy === null) accuracy = 100;
  if (wpm === undefined || wpm === null) wpm = state.currentPPM || 0;

  if (ppmVal) ppmVal.textContent = wpm;
  if (accuracyVal) accuracyVal.textContent = `${accuracy}%`;

  // XP GLOBAL
  let xpGain = Math.round((wpm * 2) + (accuracy * 0.5));
  if (accuracy === 100) xpGain += 20;
  if (xpGain < 5) xpGain = 5;
  addGlobalXP(xpGain);

  updatePPMHistory(id, wpm);
  const modeStats = getModeStats(id);
  modeStats.rounds = (modeStats.rounds || 0) + 1;
  modeStats.totalTyped = (modeStats.totalTyped || 0) + (mode?.typed?.length || state.totalTyped || 0);
  modeStats.bestPPM = Math.max(modeStats.bestPPM || 0, Number(wpm) || 0);
  modeStats.bestAccuracy = Math.max(modeStats.bestAccuracy || 0, Number(accuracy) || 0);
  modeStats.bestTime = modeStats.bestTime == null ? finalTime : Math.min(modeStats.bestTime, finalTime);
  saveState();

  if (mode && mode.checkMedals) {
    mode.checkMedals(accuracy, wpm, finalTime);
  }

  let modeMessage = '';
  if (mode && mode.getResultMessage) {
    modeMessage = mode.getResultMessage(accuracy, wpm);
  }

  showResult('success', `🎉 <strong>${accuracy}%</strong> em ${finalTime}s. ${modeMessage}`);

  checkRoundAchievements(wpm, accuracy, state.currentTheme);
  loadAchievements();
  state._ending = false;
  hiddenInput.disabled = true;
  syncRpgContinueButton();
}

function showResult(type, html) {
  if (!resultMessage) return;
  resultMessage.className = `result-message ${type}`;
  resultMessage.innerHTML = html;
  resultMessage.classList.remove('hidden');
}

export function initTest() {
  syncRpgContinueButton();
  clearInterval(state.timerInterval);
  clearTimeout(state.autoRestartTimeout);
  state.isRunning = false;
  state.totalTyped = 0;
  state.errors = 0;
  state.startTime = null;
  state.previousInput = '';
  state.currentPPM = 0;
  state._ending = false;
  
  if (hiddenInput) {
    hiddenInput.value = '';
    hiddenInput.disabled = false;
  }
  if (timerVal) timerVal.textContent = '0s';
  if (ppmVal) ppmVal.textContent = '0';
  if (accuracyVal) accuracyVal.textContent = '100%';
  if (resultMessage) {
    resultMessage.classList.add('hidden');
    resultMessage.innerHTML = '';
  }
  clearInterval(state.timerModeInterval);
  state.timerModeInterval = null;
  if (countdownTag) {
    countdownTag.classList.add('hidden');
    countdownTag.classList.remove('warning');
  }

  state.startTime = performance.now();

  const mode = getModeHandler();
  if (mode && mode.reset) mode.reset();

  const diff = state.currentDifficulty;
  if (diff === 'custom') {
    if (!state.customUserText || state.customUserText.trim().length < 10) {
      textDisplay.innerHTML = '<em>Nenhum texto customizado. Clique em "Alterar Texto".</em>';
      if (hiddenInput) hiddenInput.disabled = true;
      return;
    }
    state.currentText = state.customUserText;
  } else {
    const list = SENTENCES[diff] || SENTENCES.easy;
    state.currentText = list[Math.floor(Math.random() * list.length)];
  }

  if (mode && mode.init) {
    mode.init(state.currentText);
  } else {
    textDisplay.innerHTML = state.currentText.split('').map(ch => `<span class="char">${ch}</span>`).join('');
  }

  updateProgress(0, state.currentText.length);

  if (modeStatusTag) {
    const modeId = getModeId();
    modeStatusTag.textContent = MODE_NAMES[modeId] || 'Padrão';
  }

  const stats = getModeStats(getModeId());
  const bestEl = document.getElementById('best-ppm-val');
  if (bestEl) bestEl.textContent = stats.bestPPM || 0;

  loadAchievements();
  renderModeDashboard();
}

export function handleTyping() {
  const mode = getModeHandler();
  if (!state.isRunning && hiddenInput?.value?.length) startTimer();
  if (!mode) return;

  const inputValue = hiddenInput.value;
  const result = mode.handleInput(inputValue);
  
  if (result) {
    if (result.playError) {
      audioEngine.playErrorSound();
    } else if (result.playSound !== false) {
      audioEngine.playKey(false);
    }

    if (result.done) {
      const accuracy = result.accuracy !== undefined ? result.accuracy : 100;
      const wpm = result.wpm !== undefined ? result.wpm : state.currentPPM || 0;
      endTest(accuracy, wpm);
      return;
    }
    
    if (result.reset) {
      initTest();
      return;
    }
    
    if (result.metrics) {
      if (result.metrics.wpm !== undefined) ppmVal.textContent = result.metrics.wpm;
      if (result.metrics.accuracy !== undefined) accuracyVal.textContent = `${result.metrics.accuracy}%`;
      if (result.metrics.progress !== undefined) updateProgress(result.metrics.progress, state.currentText.length);
    }
  }
  renderModeDashboard();
}

export function setupTypingEvents() {
  if (!hiddenInput) return;
  hiddenInput.setAttribute('autocomplete', 'new-password');
  hiddenInput.setAttribute('autocorrect', 'off');
  hiddenInput.setAttribute('autocapitalize', 'none');
  hiddenInput.setAttribute('spellcheck', 'false');
  hiddenInput.setAttribute('data-form-type', 'other');

  hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      trackSpaceKey();
    }
  });
  hiddenInput.addEventListener('beforeinput', (e) => {
    if (/insertFromPaste|insertFromDrop|insertReplacementText|insertFromYank/.test(e.inputType)) {
      e.preventDefault();
    }
    if (e.data && e.data.length > 1) e.preventDefault();
  });
  hiddenInput.addEventListener('paste', e => e.preventDefault());
  hiddenInput.addEventListener('contextmenu', e => e.preventDefault());
  hiddenInput.addEventListener('input', handleTyping);

  if (textDisplay) {
    textDisplay.addEventListener('click', () => {
      if (!hiddenInput.disabled) {
        hiddenInput.focus({ preventScroll: true });
      }
    });
  }
}