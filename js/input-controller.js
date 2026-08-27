import { state } from './modules/utils.js';
import { audioEngine } from './modules/audio.js';
import { getModeHandler, getModeId, renderModeDashboard } from './modes/index.js';
import { trackSpaceKey } from './modules/stats.js';

const init = () => {
  const input = document.getElementById('hidden-input');
  if (!input || input.dataset.inputControllerReady === 'true') return;
  input.dataset.inputControllerReady = 'true';

  const getElapsed = () => state.startTime
    ? Math.max(1, Math.floor((performance.now() - state.startTime) / 1000))
    : 0;

  const updateMetrics = (metrics) => {
    const mode = getModeHandler();
    const current = metrics || mode?.getMetrics?.();
    if (!current) return;
    const ppm = Number.isFinite(Number(current.wpm)) ? Math.max(0, Math.round(Number(current.wpm))) : 0;
    const accuracy = Number.isFinite(Number(current.accuracy)) ? Math.max(0, Math.min(100, Math.round(Number(current.accuracy)))) : 100;
    const ppmEl = document.getElementById('ppm-val');
    const accuracyEl = document.getElementById('accuracy-val');
    if (ppmEl) ppmEl.textContent = ppm;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    state.currentPPM = ppm;
    renderModeDashboard();
  };

  let timer = null;
  const stopTimer = () => {
    clearInterval(timer);
    timer = null;
  };

  const startTimer = () => {
    if (state.isRunning) return;
    state.isRunning = true;
    state.startTime = performance.now();
    const mode = getModeHandler();
    if (mode && Object.prototype.hasOwnProperty.call(mode, 'startTime') && !mode.startTime) mode.startTime = state.startTime;
    stopTimer();
    timer = setInterval(() => {
      if (!state.isRunning) {
        stopTimer();
        return;
      }
      const modeNow = getModeHandler();
      const timerEl = document.getElementById('timer-val');
      if (timerEl && !modeNow?.hasTimer) timerEl.textContent = `${getElapsed()}s`;
      updateMetrics();
    }, 250);
  };

  const finish = (result) => {
    stopTimer();
    const modeId = getModeId();
    document.dispatchEvent(new CustomEvent('modeEndTest', {
      detail: {
        accuracy: result?.accuracy,
        wpm: result?.wpm,
        modeId
      }
    }));
  };

  const handleInput = () => {
    if (input.disabled || document.body.classList.contains('tutorial-open')) return;
    const value = input.value;
    const mode = getModeHandler();
    if (!mode?.handleInput) return;

    if (value.length > 0 && !state.isRunning) startTimer();

    const previousLength = Number(state._controllerLastLength) || 0;
    const inserted = value.length - previousLength;
    if (inserted > 0) {
      state.totalTyped = (Number(state.totalTyped) || 0) + inserted;
    }
    state._controllerLastLength = value.length;

    const result = mode.handleInput(value) || {};
    if (result.accuracy !== undefined || result.wpm !== undefined) updateMetrics(result);

    // Sound belongs to the input event, not to a mode-specific return flag.
    // Several modes intentionally omit playSound for ordinary correct keys.
    // A negative length means deletion/reset, so it must stay silent.
    if (inserted > 0) {
      if (result.playError) audioEngine.playErrorSound?.();
      else audioEngine.playKey?.(false);
    }

    if (result.done) finish(result);
  };

  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', event => {
    if (event.key === ' ') trackSpaceKey();
  });
  input.addEventListener('beforeinput', event => {
    if (/insertFromPaste|insertFromDrop|insertReplacementText|insertFromYank/.test(event.inputType)) {
      event.preventDefault();
    }
  });
  input.addEventListener('paste', event => event.preventDefault());
  input.addEventListener('contextmenu', event => event.preventDefault());

  document.addEventListener('modeResetTest', () => {
    stopTimer();
    state._controllerLastLength = 0;
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
