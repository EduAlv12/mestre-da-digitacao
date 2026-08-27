/* V3 UI: reorganiza a apresentação sem alterar a lógica dos modos. */
(() => {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './ui-v3.css';
  document.head.appendChild(css);

  const init = () => {
    if (window.matchMedia('(min-width: 761px)').matches) return;
    const header = document.querySelector('.app-header');
    const controls = document.querySelector('.header-controls');
    if (!header || !controls || document.querySelector('.ui-v3-drawer')) return;
    const top = header.firstElementChild;
    if (!top) return;

    const open = document.createElement('button');
    open.type = 'button'; open.className = 'ui-v3-open'; open.id = 'ui-v3-open';
    open.setAttribute('aria-label', 'Abrir painel'); open.textContent = '☰ Painel';
    top.appendChild(open);

    const drawer = document.createElement('div');
    drawer.className = 'ui-v3-drawer'; drawer.id = 'ui-v3-drawer';
    const backdrop = document.createElement('div');
    backdrop.className = 'ui-v3-backdrop-close'; backdrop.setAttribute('aria-hidden', 'true');
    const sheet = document.createElement('aside');
    sheet.className = 'ui-v3-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Painel de configurações e estatísticas');

    const head = document.createElement('div');
    head.className = 'ui-v3-head';
    head.innerHTML = '<h2>⚙️ Painel</h2><button type="button" class="ui-v3-close" aria-label="Fechar painel">×</button>';
    sheet.appendChild(head);

    const statsSection = document.createElement('section');
    statsSection.className = 'ui-v3-group ui-v3-session-summary';
    statsSection.innerHTML = '<div class="ui-v3-section-heading"><span class="ui-v3-label">Resumo das sessões</span><span class="ui-v3-section-note">Atual</span></div><div class="ui-v3-mobile-stats">' +
      '<div class="ui-v3-mobile-stat"><span>PPM</span><strong data-v3-stat="ppm">0</strong></div>' +
      '<div class="ui-v3-mobile-stat"><span>Precisão</span><strong data-v3-stat="accuracy">100%</strong></div>' +
      '<div class="ui-v3-mobile-stat"><span>Tempo</span><strong data-v3-stat="time">0s</strong></div>' +
      '<div class="ui-v3-mobile-stat"><span>Recorde</span><strong data-v3-stat="best">0</strong></div>' +
      '</div>';
    sheet.appendChild(statsSection);

    const groups = [
      {title:'Treino', ids:['mode-trigger','difficulty-trigger','theme-trigger','sound-trigger']},
      {title:'Extras', ids:['achievements-trigger','mode-help-trigger','feedback-trigger']}
    ];
    groups.forEach(group => {
      const section = document.createElement('section'); section.className = 'ui-v3-group';
      const label = document.createElement('span'); label.className = 'ui-v3-label'; label.textContent = group.title;
      section.appendChild(label);
      const grid = document.createElement('div'); grid.className = 'ui-v3-controls';
      group.ids.forEach(id => {
        const node = document.getElementById(id); const groupNode = node?.closest('.control-group');
        if (groupNode) grid.appendChild(groupNode);
      });
      section.appendChild(grid); sheet.appendChild(section);
    });

    drawer.append(backdrop, sheet); document.body.appendChild(drawer);

    // Os modais originais ficam no DOM principal. Ao movê-los para o body,
    // eles deixam de ficar presos ao stacking context do painel e podem abrir
    // sobre ele. Os listeners originais continuam válidos porque os elementos
    // não são recriados, apenas reparentados.
    ['modal-modes','modal-difficulty','modal-theme','modal-sound','modal-achievements','modal-custom-text','modal-mode-help'].forEach(id => {
      const modal = document.getElementById(id);
      if (modal && modal.parentElement !== document.body) document.body.appendChild(modal);
    });

    const syncStats = () => {
      const map = {ppm:'ppm-val', accuracy:'accuracy-val', time:'timer-val', best:'best-ppm-val'};
      Object.entries(map).forEach(([key,id]) => {
        const source = document.getElementById(id); const target = sheet.querySelector(`[data-v3-stat="${key}"]`);
        if (source && target) target.textContent = source.textContent;
      });
    };
    const close = () => { drawer.classList.remove('is-open'); document.body.classList.remove('ui-v3-lock'); };
    const show = () => { syncStats(); drawer.classList.add('is-open'); document.body.classList.add('ui-v3-lock'); sheet.querySelector('.ui-v3-close')?.focus(); };
    open.addEventListener('click', show);
    head.querySelector('.ui-v3-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    controls.style.display = 'none';
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();