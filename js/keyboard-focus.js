// Garante foco direto na área de digitação, especialmente em dispositivos móveis.
(() => {
  const init = () => {
    const input = document.getElementById('hidden-input');
    const wrapper = document.querySelector('.typing-wrapper');
    if (!input || !wrapper || wrapper.dataset.keyboardFocusReady === 'true') return;

    wrapper.dataset.keyboardFocusReady = 'true';
    input.setAttribute('inputmode', 'text');

    const focusTypingInput = (event) => {
      if (input.disabled || document.body.classList.contains('tutorial-open')) return;
      if (event.target.closest('button, a, textarea, select')) return;
      input.focus({ preventScroll: true });
    };

    // pointerdown preserva o gesto do usuário e permite ao navegador móvel
    // abrir o teclado sem depender de um segundo toque.
    wrapper.addEventListener('pointerdown', focusTypingInput);
    wrapper.addEventListener('click', focusTypingInput);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
