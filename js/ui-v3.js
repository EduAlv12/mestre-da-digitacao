/* V3 UI: reorganiza apenas a apresentação. IDs e listeners existentes são preservados. */
(() => {
  const init = () => {
    const header = document.querySelector('.app-header');
    const controls = document.querySelector('.header-controls');
    if (!header || !controls || document.querySelector('.ui-v3-drawer')) return;

    const top = header.firstElementChild;
    if (!top) return;

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'ui-v3-open';
    open.id = 'ui-v3-open';
    open.setAttribute('aria-label', 'Abrir painel');
    open.textContent = '☰ Painel';
    top.appendChild(open);

    const drawer = document.createElement('div');
    drawer.className = 'ui-v3-drawer';
    drawer.id = 'ui-v3-drawer';

    const backdrop = document.createElement('div');
    backdrop.className = 'ui-v3-backdrop-close';
    backdrop.setAttribute('aria-hidden', 'true');

    const sheet = document.createElement('aside');
    sheet.className = 'ui-v3-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Painel de configurações');

    const head = document.createElement('div');
    head.className = 'ui-v3-head';
    head.innerHTML = '<h2>⚙️ Painel</h2><button type="button" class="ui-v3-close" aria-label="Fechar painel">×</button>';
    sheet.appendChild(head);

    const groups = [
      {title:'Treino', ids:['mode-trigger','difficulty-trigger','theme-trigger','sound-trigger']},
      {title:'Extras', ids:['achievements-trigger','mode-help-trigger','feedback-trigger']}
    ];

    groups.forEach(group => {
      const section = document.createElement('section');
      section.className = 'ui-v3-group';
      const label = document.createElement('span');
      label.className = 'ui-v3-label';
      label.textContent = group.title;
      section.appendChild(label);
      const grid = document.createElement('div');
      grid.className = 'ui-v3-controls';
      group.ids.forEach(id => {
        const node = document.getElementById(id);
        if (!node) return;
        const groupNode = node.closest('.control-group');
        if (groupNode) grid.appendChild(groupNode);
      });
      section.appendChild(grid);
      sheet.appendChild(section);
    });

    drawer.append(backdrop, sheet);
    document.body.appendChild(drawer);

    const close = () => { drawer.classList.remove('is-open'); document.body.classList.remove('ui-v3-lock'); };
    const show = () => { drawer.classList.add('is-open'); document.body.classList.add('ui-v3-lock'); sheet.querySelector('.ui-v3-close')?.focus(); };
    open.addEventListener('click', show);
    head.querySelector('.ui-v3-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    controls.style.display = 'none';
    document.body.classList.add('ui-v3-ready');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
