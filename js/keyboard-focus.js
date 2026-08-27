// Foco robusto da área de digitação, com suporte a navegadores móveis.
(() => {
  const init = () => {
    const input = document.getElementById('hidden-input');
    const wrapper = document.querySelector('.typing-wrapper');
    const display = document.getElementById('text-display');
    if (!input || !wrapper || wrapper.dataset.keyboardFocusReady === 'true') return;

    wrapper.dataset.keyboardFocusReady = 'true';
    input.setAttribute('inputmode', 'text');
    input.setAttribute('enterkeyhint', 'done');

    // O input fica sobre a área de texto, transparente para o usuário.
    // Isso faz o próprio toque do usuário ser o responsável pelo focus,
    // evitando bloqueios de teclado de alguns navegadores Android.
    const style = document.createElement('style');
    style.textContent = `
      .typing-wrapper { position: relative; }
      .typing-wrapper #hidden-input {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        opacity: .01 !important;
        z-index: 5 !important;
        display: block !important;
        pointer-events: auto !important;
        background: transparent !important;
        border: 0 !important;
        outline: 0 !important;
        color: transparent !important;
        caret-color: transparent !important;
      }
      .typing-wrapper #text-display,
      .typing-wrapper .focus-hint { pointer-events: none; }
    `;
    document.head.appendChild(style);

    const focusTypingInput = () => {
      if (input.disabled || document.body.classList.contains('tutorial-open')) return;
      input.focus({ preventScroll: true });
    };

    input.addEventListener('focus', () => wrapper.classList.add('typing-focused'));
    input.addEventListener('blur', () => wrapper.classList.remove('typing-focused'));
    input.addEventListener('touchstart', focusTypingInput, { passive: true });
    input.addEventListener('pointerdown', focusTypingInput);
    if (display) display.addEventListener('click', focusTypingInput);
    wrapper.addEventListener('click', (event) => {
      if (event.target.closest('button, a, textarea, select')) return;
      focusTypingInput();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
