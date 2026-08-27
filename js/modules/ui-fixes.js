const STYLE_ID = 'mestre-ui-fixes';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .typing-header-tags {
      align-items: flex-start;
    }

    .typing-header-left {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      min-width: 0;
    }

    .typing-mode-control {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .typing-mode-control label {
      font-size: .55rem;
      font-weight: 700;
      color: #687384;
      text-transform: uppercase;
      letter-spacing: .12em;
    }

    .typing-mode-control .select-trigger {
      width: auto;
      min-width: 150px;
      min-height: 36px;
      padding: 0 10px;
      font-size: .66rem;
    }

    .action-bar {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      align-items: stretch;
    }

    .action-bar > button {
      width: 100%;
      min-width: 0;
      margin: 0;
    }

    .action-bar #tutorial-btn {
      grid-column: auto !important;
    }

    @media (max-width: 620px) {
      .typing-header-tags {
        flex-wrap: wrap;
      }

      .typing-header-left {
        width: 100%;
      }

      .typing-mode-control,
      .typing-mode-control .select-trigger {
        width: 100%;
      }

      .action-bar {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function moveModeControl() {
  const modeTrigger = document.getElementById('mode-trigger');
  const difficultyTag = document.getElementById('difficulty-tag');
  const typingHeader = document.querySelector('.typing-header-tags');

  if (!modeTrigger || !difficultyTag || !typingHeader) return;
  if (modeTrigger.closest('.typing-mode-control')) return;

  const originalControl = modeTrigger.closest('.control-group');
  const modeControl = document.createElement('div');
  modeControl.className = 'typing-mode-control';

  const label = document.createElement('label');
  label.textContent = 'Modo de Jogo';
  label.setAttribute('for', modeTrigger.id);

  modeControl.append(label, modeTrigger);

  if (originalControl) originalControl.remove();

  const left = document.createElement('div');
  left.className = 'typing-header-left';
  difficultyTag.replaceWith(left);
  left.append(difficultyTag, modeControl);
  typingHeader.prepend(left);
}

function setupModeHelpFix() {
  const trigger = document.getElementById('mode-help-trigger');
  const close = document.getElementById('mode-help-close');
  const modal = document.getElementById('modal-mode-help');

  if (trigger && !trigger.dataset.modeHelpBound) {
    trigger.dataset.modeHelpBound = 'true';
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const modeText = document.getElementById('mode-trigger-text')?.textContent || '📖 Padrão';
      const modeMap = {
        '📖 Padrão': 'default',
        '🔥 Fúria': 'fury',
        '💀 Sobrevivência': 'survival',
        '🎯 Precisão Extrema': 'sniper',
        '🧩 Caça-Palavras': 'wordhunt',
        '💰 Cassino': 'casino',
        '🏃 Maratona': 'marathon',
        '🧠 Memória': 'memory',
        '🌊 Onda': 'wave',
        '⚔️ RPG': 'rpg',
        '🌈 Arco-Íris': 'rainbow'
      };
      const helpData = window.MESTRE_MODE_HELP?.[modeMap[modeText]] || window.MESTRE_MODE_HELP?.default;

      if (!helpData || !modal) return;

      const icon = document.getElementById('mode-help-icon');
      const title = document.getElementById('mode-help-title');
      const description = document.getElementById('mode-help-description');
      const rules = document.getElementById('mode-help-rules');

      if (icon) icon.textContent = helpData.icon;
      if (title) title.textContent = `Como jogar: ${helpData.title}`;
      if (description) description.textContent = helpData.description;
      if (rules) {
        rules.innerHTML = helpData.rules
          .map((rule, i) => `<div class="mode-help-rule"><span>${i + 1}</span><p>${rule}</p></div>`)
          .join('');
      }

      modal.classList.add('active');
    });
  }

  if (close && !close.dataset.modeHelpBound) {
    close.dataset.modeHelpBound = 'true';
    close.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      modal?.classList.remove('active');
    });
  }
}

function exposeModeHelpData() {
  window.MESTRE_MODE_HELP = {
    default: { icon:'📖', title:'Padrão', description:'Treine sua digitação no formato clássico.', rules:['Digite a frase completa com o máximo de velocidade e precisão.','Acompanhe PPM, precisão, tempo e progresso em tempo real.','Complete frases para registrar seus resultados e medalhas.'] },
    fury: { icon:'🔥', title:'Fúria', description:'Construa uma sequência de acertos e aumente sua velocidade.', rules:['Acertos consecutivos aumentam seu nível de Fúria.','Erros quebram o streak e prejudicam seu ritmo.','Tente manter o maior streak possível.'] },
    survival: { icon:'💀', title:'Sobrevivência', description:'Cada caractere é uma corrida contra o relógio.', rules:['Você possui vidas limitadas.','Cada caractere tem um tempo de vida; digite antes que expire.','Administre velocidade e precisão para sobreviver.'] },
    sniper: { icon:'🎯', title:'Precisão Extrema', description:'Erros custam caro. Digite como um atirador de elite.', rules:['Evite erros consecutivos.','Quando errar, o modo pode recuar seu progresso.','Mantenha a precisão alta para chegar ao fim.'] },
    wordhunt: { icon:'🧩', title:'Caça-Palavras', description:'Encontre e digite as palavras corretamente.', rules:['As palavras aparecem embaralhadas.','Digite a forma correta para marcar a palavra como encontrada.','Complete o maior número possível com poucos erros.'] },
    casino: { icon:'💰', title:'Cassino', description:'Aposte suas fichas na sua própria performance.', rules:['Você começa com um saldo de fichas.','Aposta e resultado dependem da sua precisão.','Vença para aumentar sua banca e mantenha uma sequência.'] },
    marathon: { icon:'🏃', title:'Maratona', description:'Digite o máximo que conseguir antes do tempo acabar.', rules:['O cronômetro limita a duração da prova.','Cada palavra concluída aumenta sua pontuação.','Busque o maior volume possível sem sacrificar a precisão.'] },
    memory: { icon:'🧠', title:'Memória', description:'Memorize o texto antes que ele desapareça.', rules:['O texto fica visível por alguns segundos.','Depois, digite usando apenas o que memorizou.','Erros contam contra sua precisão e desempenho.'] },
    wave: { icon:'🌊', title:'Onda', description:'As palavras chegam em ondas cada vez mais intensas.', rules:['Complete as palavras antes que a onda termine.','Cada onda aumenta o desafio.','Mantenha velocidade e precisão para avançar.'] },
    rpg: { icon:'⚔️', title:'RPG', description:'Transforme sua digitação em combate e evolua seu personagem.', rules:['Cada acerto causa dano ao monstro; erros causam dano a você.','Ataques ficam mais fortes conforme você evolui e acumula XP.','Ao derrotar um monstro, a frase permanece na tela: clique em "Continuar Batalhando" para iniciar a próxima batalha.','Suba de nível para aumentar HP e ataque.'] },
    rainbow: { icon:'🌈', title:'Arco-Íris', description:'Pinte a frase corretamente com todas as cores.', rules:['Cada trecho correto recebe uma cor.','Erros quebram a sequência de pintura.','Complete a frase para obter o melhor resultado.'] }
  };
}

function init() {
  injectStyles();
  exposeModeHelpData();
  moveModeControl();
  setupModeHelpFix();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
