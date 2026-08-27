// js/modules/changelog.js
const CHANGELOG_VERSION = 'ui-foundation-v1-2026-08-27';
const CHANGELOG_SEEN_KEY = 'mestre_changelog_seen_version';

const CHANGELOG = [
  { version: 'UI Foundation V1', date: '27 de agosto de 2026', items: [
    '🎨 Nova fundação visual da interface, com layout mais limpo e consistente.',
    '📱 Melhorias de responsividade para celular e telas menores.',
    '📊 Gráfico de Evolução do PPM e medalhas corrigidos para aparecerem no mobile.',
    '🎮 Menu de modos reorganizado e integrado à nova interface.',
    '📖 Botão “Como jogar” corrigido para abrir as instruções do modo atual.',
    '⚙️ Dificuldade personalizada recebeu ajustes no layout dos botões de ação.',
    '⌨️ Área de digitação e foco do teclado no celular foram reorganizados.',
    '🔊 Sistema de sons foi revisado e os perfis sonoros continuam disponíveis no painel.',
    '⚔️ RPG recebeu ajustes no fluxo de continuidade das batalhas.',
    '📈 Estatísticas, progresso global e histórico foram reorganizados para a nova interface.'
  ]},
  { version: 'Correções de modos', date: 'Agosto de 2026', items: [
    '🧩 Caça-Palavras: tratamento de erros e feedback aprimorados.',
    '🌊 Onda: precisão e feedback de erros corrigidos.',
    '💀 Sobrevivência: tempo por caractere passa a respeitar a dificuldade.',
    '🏃 Maratona: cronômetro e precisão da sessão revisados.',
    '🧹 Reinício e troca de modo agora fazem uma limpeza de estado mais consistente.'
  ]}
];

function buildChangelog() {
  if (document.getElementById('changelog-modal')) return;

  const style = document.createElement('style');
  style.id = 'changelog-style';
  style.textContent = `
    #changelog-trigger{position:relative}
    #changelog-trigger .new-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;margin-left:6px;vertical-align:middle}
    #changelog-modal .changelog-list{display:grid;gap:14px;margin:14px 0}
    #changelog-modal .changelog-version{font-weight:700;margin:6px 0}
    #changelog-modal .changelog-date{font-size:.78rem;color:var(--text-muted);margin-left:6px}
    #changelog-modal .changelog-item{display:flex;gap:9px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:rgba(127,127,127,.08);line-height:1.4}
    #changelog-modal .changelog-footer{font-size:.78rem;color:var(--text-muted);margin-top:12px}
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.id = 'changelog-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal-card modal-card-scrollable" role="dialog" aria-modal="true" aria-labelledby="changelog-title"><div class="modal-header"><h3 class="modal-title" id="changelog-title">🆕 O que mudou?</h3><button type="button" class="modal-close" aria-label="Fechar">&times;</button></div><div class="modal-body"><p>Veja o que mudou na versão atual em comparação com a versão principal (main).</p><div class="changelog-list"></div><div class="changelog-footer">Esta lista resume as principais alterações da UI Foundation V1 em relação à main.</div></div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.changelog-list').innerHTML = CHANGELOG.map(section => `<section><div class="changelog-version">${section.version}<span class="changelog-date">${section.date}</span></div>${section.items.map(item => `<div class="changelog-item">${item}</div>`).join('')}</section>`).join('');

  const close = () => modal.classList.remove('active');
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  const controls = document.querySelector('.header-controls');
  if (controls) {
    const group = document.createElement('div');
    group.className = 'control-group';
    const unseen = localStorage.getItem(CHANGELOG_SEEN_KEY) !== CHANGELOG_VERSION;
    group.innerHTML = `<label>Atualização</label><button type="button" class="select-trigger" id="changelog-trigger"><span>🆕 O que mudou?</span>${unseen ? '<span class="new-dot" aria-label="Nova atualização"></span>' : ''}</button>`;

    const soundGroup = controls.querySelector('#sound-trigger')?.closest('.control-group');
    if (soundGroup) soundGroup.insertAdjacentElement('afterend', group);
    else controls.appendChild(group);

    group.querySelector('button').addEventListener('click', () => {
      modal.classList.add('active');
      localStorage.setItem(CHANGELOG_SEEN_KEY, CHANGELOG_VERSION);
      group.querySelector('.new-dot')?.remove();
    });
  }
}

export function setupChangelog() { buildChangelog(); }
