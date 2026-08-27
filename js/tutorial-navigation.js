// Navegação independente do tutorial. Usa capture para impedir listeners
// antigos de disputarem o mesmo clique nos botões de paginação.
(() => {
  let step = 0;
  const total = 5;
  const clamp = value => Math.max(0, Math.min(total - 1, value));
  const render = () => {
    const modal = document.getElementById('modal-welcome');
    if (!modal) return;
    modal.querySelectorAll('.tutorial-step').forEach((el, i) => el.classList.toggle('active', i === step));
    modal.querySelectorAll('.tutorial-dots .dot').forEach((el, i) => el.classList.toggle('active', i === step));
    const prev = modal.querySelector('#tutorial-prev');
    const next = modal.querySelector('#tutorial-next');
    if (prev) prev.disabled = step === 0;
    if (next) next.textContent = step === total - 1 ? '✨ Vamos Começar!' : 'Próximo →';
    const modeDemo = modal.querySelector('.tutorial-step[data-step="2"] .tutorial-demo');
    const modeText = modal.querySelector('.tutorial-step[data-step="2"] .tutorial-text');
    if (modeText) modeText.innerHTML = 'Escolha entre <strong>10 modos de jogo</strong> com mecânicas diferentes e medalhas exclusivas.';
    if (modeDemo) modeDemo.textContent = '🔥 Fúria • 💀 Sobrevivência • 🎯 Sniper • 🧩 WordHunt • 💰 Cassino • 🏃 Maratona • 🧠 Memória • 🌊 Onda • ⚔️ RPG';
  };
  const openFirst = () => { step = 0; render(); };
  let touchX = null;
  document.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('#tutorial-btn')) { openFirst(); return; }
    if (target.closest('#tutorial-next')) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (step < total - 1) { step++; render(); } else document.getElementById('modal-welcome')?.classList.remove('active');
      return;
    }
    if (target.closest('#tutorial-prev')) {
      event.preventDefault(); event.stopImmediatePropagation();
      step = clamp(step - 1); render(); return;
    }
    const dot = target.closest('#modal-welcome .tutorial-dots .dot');
    if (dot) {
      event.preventDefault(); event.stopImmediatePropagation();
      const nextStep = Number(dot.getAttribute('data-step'));
      if (Number.isFinite(nextStep)) { step = clamp(nextStep); render(); }
    }
  }, true);
  document.addEventListener('touchstart', event => {
    if (!event.target.closest('#modal-welcome .tutorial-slides')) return;
    touchX = event.changedTouches[0]?.clientX ?? null;
  }, {passive:true});
  document.addEventListener('touchend', event => {
    if (touchX == null || !event.target.closest('#modal-welcome .tutorial-slides')) return;
    const endX = event.changedTouches[0]?.clientX ?? touchX;
    const delta = endX - touchX; touchX = null;
    if (Math.abs(delta) < 45) return;
    step = clamp(step + (delta < 0 ? 1 : -1)); render();
  }, {passive:true});
  if (document.readyState !== 'loading') render();
  else document.addEventListener('DOMContentLoaded', render, {once:true});
})();