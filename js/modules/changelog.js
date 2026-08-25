// js/modules/changelog.js
const CHANGELOG = [
  { version: 'Auditoria atual', date: 'Agosto de 2026', items: [
    '🧩 Caça-Palavras: erros agora são contabilizados e há feedback imediato.',
    '🌊 Onda: erros de digitação entram na precisão e o feedback ficou mais claro.',
    '💀 Sobrevivência: o tempo por caractere agora respeita a dificuldade escolhida.',
    '🏃 Maratona: o cronômetro começa na primeira digitação e a precisão considera a sessão inteira.',
    '⌨️ O teclado no celular só é ativado quando você toca na área de digitação.',
    '⚔️ RPG: a batalha continua no mesmo monstro enquanto ele ainda tiver vida.',
    '🧹 Melhorias de limpeza de estado ao reiniciar e trocar de modo.'
  ]},
  { version: 'Melhorias de experiência', date: 'Agosto de 2026', items: [
    '📖 Cada modo possui instruções próprias em “Como jogar”.',
    '📊 Métricas e progresso foram revisados para reduzir resultados incoerentes.',
    '📱 Interface preparada para uso mais confortável no celular.'
  ]}
];

function buildChangelog() {
  if (document.getElementById('changelog-modal')) return;
  const style = document.createElement('style');
  style.id = 'changelog-style';
  style.textContent = `
    #changelog-trigger{position:relative}
    #changelog-trigger .new-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;margin-left:6px;vertical-align:middle}
    #changelog-modal .changelog-list{display:grid;gap:12px;margin:14px 0}
    #changelog-modal .changelog-version{font-weight:700;margin:4px 0}
    #changelog-modal .changelog-date{font-size:.78rem;color:var(--text-muted);margin-left:6px}
    #changelog-modal .changelog-item{display:flex;gap:9px;align-items:flex-start;padding:9px 10px;border-radius:10px;background:rgba(127,127,127,.08);line-height:1.4}
    #changelog-modal .changelog-footer{font-size:.78rem;color:var(--text-muted);margin-top:12px}
  `;
  document.head.appendChild(style);
  const modal=document.createElement('div');
  modal.id='changelog-modal';modal.className='modal-overlay';
  modal.innerHTML=`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="changelog-title"><div class="modal-header"><h3 class="modal-title" id="changelog-title">🆕 O que mudou?</h3><button type="button" class="modal-close" aria-label="Fechar">&times;</button></div><div class="modal-body"><p>Veja as melhorias e correções mais recentes do Mestre da Digitação.</p><div class="changelog-list"></div><div class="changelog-footer">As novidades aparecem aqui para você saber o que mudou sem precisar conhecer o código.</div></div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.changelog-list').innerHTML=CHANGELOG.map(section=>`<section><div class="changelog-version">${section.version}<span class="changelog-date">${section.date}</span></div>${section.items.map(item=>`<div class="changelog-item">${item}</div>`).join('')}</section>`).join('');
  const close=()=>modal.classList.remove('active');
  modal.querySelector('.modal-close').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  const controls=document.querySelector('.header-controls');
  if(controls){
    const group=document.createElement('div');group.className='control-group';
    group.innerHTML=`<label>Novidades</label><button type="button" class="select-trigger" id="changelog-trigger"><span>🆕 O que mudou?</span><span class="new-dot" aria-label="Novidades"></span></button>`;
    controls.appendChild(group);
    group.querySelector('button').addEventListener('click',()=>{modal.classList.add('active');localStorage.setItem('mestre_changelog_seen','1');group.querySelector('.new-dot')?.remove();});
  }
}
export function setupChangelog(){buildChangelog();}
