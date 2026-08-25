// js/modules/restart-control.js
// O fluxo de reinício de cada modo é específico e pode ter efeitos diferentes
// (nova frase, nova onda, nova batalha etc.). O antigo botão "Recomeçar"
// sugeria que a mesma frase seria recarregada, mas isso nem sempre acontecia.
// Removemos o controle ambíguo da interface até existir uma ação realmente
// consistente para todos os modos.

export function setupRestartControl() {
  const restartBtn = document.getElementById('restart-btn');
  if (!restartBtn) return;

  restartBtn.classList.add('hidden');
  restartBtn.setAttribute('aria-hidden', 'true');
  restartBtn.setAttribute('tabindex', '-1');
  restartBtn.disabled = true;
}
