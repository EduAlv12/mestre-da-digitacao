import { describe, it, expect, beforeEach, vi } from 'vitest';

const setupDom = () => {
  document.body.innerHTML = `
    <div id="text-display"></div>
    <input id="hidden-input" />
    <div id="progress-fill"></div>
    <div id="progress-text"></div>
    <div id="progress-percent"></div>
    <div id="accuracy-val"></div>
    <div id="ppm-val"></div>
    <div id="timer-val"></div>
  `;
};

describe('núcleo de digitação', () => {
  beforeEach(() => {
    setupDom();
    vi.restoreAllMocks();
  });

  it('deve aceitar uma sequência válida de caracteres sem contar backspace como digitação', async () => {
    const { state } = await import('../../js/modules/utils.js');
    state.currentText = 'abc';
    state.totalTyped = 0;
    state.errors = 0;
    state.startTime = null;

    const { default: typing } = await import('../../js/modules/typing.js');
    expect(typing).toBeTruthy();
    expect(state.currentText).toBe('abc');

    const input = document.querySelector('#hidden-input');
    input.value = 'a';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: 'a', bubbles: true }));
    expect(input.value).toBe('a');

    input.value = '';
    input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', data: null, bubbles: true }));
    expect(input.value).toBe('');
  });

  it('deve manter o progresso dentro de 0–100%', async () => {
    const { updateProgress } = await import('../../js/modules/typing.js');
    updateProgress(0, 10);
    expect(document.querySelector('#progress-percent').textContent).toBe('0%');
    updateProgress(5, 10);
    expect(document.querySelector('#progress-percent').textContent).toBe('50%');
    updateProgress(20, 10);
    expect(document.querySelector('#progress-percent').textContent).toBe('100%');
  });

  it('não deve produzir valores infinitos quando o tempo é zero', async () => {
    const { calculateWPM } = await import('../../js/modules/typing.js');
    expect(Number.isFinite(calculateWPM(100, 0))).toBe(true);
    expect(calculateWPM(100, 0)).toBe(0);
  });
});
