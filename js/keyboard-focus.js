// Foco da área de digitação para desktop e navegadores móveis.
(() => {
  const init = () => {
    const input = document.getElementById('hidden-input');
    const wrapper = document.querySelector('.typing-wrapper');
    if (!input || !wrapper || wrapper.dataset.keyboardFocusReady === 'true') return;

    wrapper.dataset.keyboardFocusReady = 'true';
    input.setAttribute('inputmode', 'text');
    input.setAttribute('enterkeyhint', 'done');

    // O input é o elemento que recebe o toque. O texto visual permanece
    // visível, mas não intercepta o gesto do usuário.
    const style = document.createElement('style');
    style.textContent = `
      .typing-wrapper { position: relative; }
      .typing-wrapper #hidden-input {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        opacity: 0 !important;
        z-index: 10 !important;
        display: block !important;
        pointer-events: auto !important;
        background: transparent !important;
        border: 0 !important;
        outline: 0 !important;
        color: transparent !important;
        caret-color: transparent !important;
      }
      .typing-wrapper #text-display,
      .typing-wrapper .focus-hint { pointer-events: none !important; }
    `;
    document.head.appendChild(style);

    const focusTypingInput = (event) => {
      if (event) {
        const target = event.target;
        if (target && target.closest('button, a, textarea, select')) return;
      }
      if (input.disabled || document.body.classList.contains('tutorial-open')) return;
      input.focus({ preventScroll: true });
    };

    input.addEventListener('focus', () => wrapper.classList.add('typing-focused'));
    input.addEventListener('blur', () => wrapper.classList.remove('typing-focused'));
    wrapper.addEventListener('pointerdown', focusTypingInput);
    wrapper.addEventListener('click', focusTypingInput);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
