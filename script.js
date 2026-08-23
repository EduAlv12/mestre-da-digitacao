const sentences = {
  easy: [
    "O sol ilumina a manhã tranquila.",
    "Um café quente renova as energias.",
    "As folhas secas caem no outono.",
    "Caminhar na praia acalma a mente.",
    "O aroma do pão fresco é delicioso.",
    "Passarinhos cantam na janela do quarto.",
    "A lua cheia brilha no céu estrelado.",
    "Plantar flores traz cor ao jardim.",
    "A água da fonte é bem fresca.",
    "O vento suave balança as árvores.",
    "Ler um bom livro diverte bastante.",
    "A chuva fina molha a calçada.",
    "Comer frutas faz bem à saúde.",
    "Um sorriso sincero muda o dia.",
    "Gatos adoram dormir ao sol da tarde.",
    "A montanha alta desafia os aventureiros.",
    "Pintar um quadro desperta a imaginação.",
    "Cães correm felizes pelo parque verde.",
    "O bolo de fubá assa no forno.",
    "A noite traz paz e descanso merecido."
  ],
  medium: [
    "Enquanto as ondas quebram na areia, o farol ilumina o caminho dos navegantes.",
    "Preparar uma receita antiga traz memórias afetuosas e aromas inesquecíveis para a cozinha.",
    "As estações do ano transformam a paisagem com cores, aromas e sensações totalmente diferentes.",
    "Na calma da biblioteca, o som das páginas viradas acompanha a busca pelo conhecimento.",
    "O jardineiro cuida das rosas com paciência, sabendo que cada flor exige seu próprio tempo.",
    "Viajar para lugares desconhecidos abre novos horizontes e enriquece a nossa bagagem cultural.",
    "A orquestra começou a tocar suavemente, encantando a plateia com uma melodia inesquecível.",
    "Observar o pôr do sol no horizonte é um lembrete diário da beleza simples da vida.",
    "Pequenos hábitos diários de gentileza têm o poder de transformar relacionamentos e ambientes.",
    "O aroma de terra molhada após a tempestade traz uma sensação única de renovação.",
    "Aprender a tocar um instrumento exige dedicação diária, foco e muita paixão pela música.",
    "No topo da colina, a vista panorâmica da cidade ao amanhecer revela um espetáculo grandioso.",
    "A arte de cozinhar envolve combinar temperos simples para criar sabores surpreendentes.",
    "Reler um clássico da literatura nos permite descobrir detalhes que antes passaram despercebidos.",
    "O canto dos pássaros ao alvorecer anuncia a chegada de mais uma oportunidade para recomeçar.",
    "Caminhar por trilhas florestais nos reconecta com a natureza e purifica os pensamentos.",
    "O pintor mistura cores primárias na paleta até encontrar o tom exato para sua obra.",
    "Guardar boas recordações em fotografias ajuda a preservar momentos especiais com quem amamos.",
    "Uma xícara de chá bem quente é o acompanhamento perfeito para uma tarde fria de chuva.",
    "A determinação dos atletas na maratona inspira todos aqueles que assistem à competição."
  ],
  hard: [
    "Entre os vales sinuosos e as montanhas cobertas de névoa, a antiga civilização deixou vestígios arquitetônicos surpreendentes.",
    "A gastronomia artesanal combina tradições seculares com técnicas modernas, valorizando ingredientes orgânicos cultivados por pequenos produtores.",
    "O silêncio sepulcral das galerias de arte permite aos visitantes contemplar as nuances das pinceladas e a melancolia das telas.",
    "Navegar por mares agitados exige coragem inabalável, conhecimento profundo das marés e um respeito absoluto pelas forças da natureza.",
    "A preservação dos ecossistemas florestais garante o equilíbrio climático global, protegendo espécies raras e mantendo a biodiversidade.",
    "Durante o rigoroso inverno nórdico, o espetáculo luminoso da aurora boreal tinge o céu noturno com tons vibrantes de verde e violeta.",
    "A literatura clássica atravessa séculos sem perder sua relevância, pois retrata as paixões, dilemas morais e contradições humanas.",
    "Arquitetos renomados buscam harmonizar o design urbano com espaços verdes, promovendo a sustentabilidade e o bem-estar coletivo.",
    "O artesão dedica horas esculpindo a madeira bruta com ferramentas manuais, transformando um tronco inerte em uma escultura viva.",
    "Enquanto a chuva torrencial batia contra as vidraças do casarão, a família se reunia ao redor da lareira para ouvir histórias antigas.",
    "A complexidade do ecossistema marinho revela um mundo fascinante de corais coloridos, peixes exóticos e criaturas misteriosas.",
    "Cultivar a paciência e a resiliência nos momentos adversos permite-nos superar obstáculos aparentemente intransponíveis com serenidade.",
    "O festival de música atrai multidões entusiasmadas, celebrando a diversidade cultural por meio de ritmos vibrantes e performances ao ar livre.",
    "As expedições botânicas do século dezenove catalogaram milhares de plantas medicinais, contribuindo para o avanço do conhecimento científico.",
    "Caminhar pelas vielas de pedras de uma cidade histórica é como viajar no tempo, vislumbrando séculos de arte e tradição preservadas.",
    "O sabor encorpado de um bom vinho envelhecido em barris de carvalho reflete o clima do vinhedo e a dedicação do enólogo.",
    "Decifrar os mistérios do universo demanda observação meticulosa das estrelas, cálculos rigorosos e um desejo incessante de exploração.",
    "A sinfonia composta no período romântico alterna momentos de intensa dramaticidade com passagens suaves de pura delicadeza poética.",
    "A prática regular de meditação e exercícios de respiração reduz o estresse, promovendo o equilíbrio emocional e a clareza mental.",
    "Nos mercados tradicionais do oriente, o aroma penetrante de especiarias raras mescla-se ao colorido das tecelagens manuais e ao burburinho local."
  ]
};

const difficultyThresholds = {
  easy: { time15: 15, time30: 30, speed60: 50 },
  medium: { time15: 20, time30: 40, speed60: 60 },
  hard: { time15: 30, time30: 60, speed60: 70 }
};

const difficultyNames = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil', custom: 'Personalizado' };

const themeNames = { 
  default: 'Azul Marinho', 
  dracula: 'Dracula Cyber', 
  midnight: 'Meia-Noite Roxo', 
  charcoal: 'Carvão Minimalista', 
  'nordic-dark': 'Nórdico Escuro', 
  light: 'Claro Clean', 
  paper: 'Papel Sépia', 
  pastel: 'Soft Pastel', 
  'nordic-light': 'Nórdico Claro', 
  amber: 'Amber Retrô', 
  matrix: 'Matrix Terminal', 
  'terminal-blue': 'IBM Blue Terminal', 
  synthwave: 'Synthwave 80s', 
  sunset: 'Pôr do Sol', 
  emerald: 'Floresta Esmeralda' 
};

const soundProfileNames = {
  thock: 'Thock Mecânico',
  pop: 'Pop Suave',
  retro: 'Retrô Cyber 80s',
  typewriter: 'Máquina de Escrever',
  silent: 'Silencioso / Muto'
};

let currentDifficulty = 'easy';
let currentTheme = 'default';
let customUserText = localStorage.getItem('customUserText') || "";

// ESTADO DO MODO HARDCORE
let isHardcore = JSON.parse(localStorage.getItem('mestre_hardcore_mode') || 'false');
let hardcoreConsecutivePerfect = parseInt(localStorage.getItem('mestre_hardcore_streak') || '0', 10);

// NOVAS VARIÁVEIS PARA AS MELHORIAS
let ppmHistory = JSON.parse(localStorage.getItem('mestre_ppm_history') || '[]');
let bestPPM = parseInt(localStorage.getItem('mestre_best_ppm') || '0');
let isTimerMode = false;
let timerModeLimit = 30;
let timerModeInterval = null;
let currentPPM = 0;

const difficultyTriggerText = document.getElementById('difficulty-trigger-text');
const themeTriggerText = document.getElementById('theme-trigger-text');
const soundTriggerText = document.getElementById('sound-trigger-text');
const difficultyTag = document.getElementById('difficulty-tag');
const hardcoreTag = document.getElementById('hardcore-tag');
const hardcoreToggle = document.getElementById('hardcore-toggle');
const textDisplay = document.getElementById('text-display');
const hiddenInput = document.getElementById('hidden-input');
const ppmVal = document.getElementById('ppm-val');
const accuracyVal = document.getElementById('accuracy-val');
const timerVal = document.getElementById('timer-val');
const restartBtn = document.getElementById('restart-btn');
const editCustomBtn = document.getElementById('edit-custom-btn');
const resultMessage = document.getElementById('result-message');
const medalsTitle = document.getElementById('medals-title');
const countdownTag = document.getElementById('countdown-tag'); // <-- ADICIONADO AQUI

const modalDifficulty = document.getElementById('modal-difficulty');
const modalTheme = document.getElementById('modal-theme');
const modalSound = document.getElementById('modal-sound');
const modalCustomText = document.getElementById('modal-custom-text');
const modalAchievements = document.getElementById('modal-achievements');
const modalHardcoreInfo = document.getElementById('modal-hardcore-info');
const modalPpmInfo = document.getElementById('modal-ppm-info');

const customTextInput = document.getElementById('custom-text-input');
const customTextError = document.getElementById('custom-text-error');
const saveCustomTextBtn = document.getElementById('save-custom-text-btn');

const difficultyTrigger = document.getElementById('difficulty-trigger');
const themeTrigger = document.getElementById('theme-trigger');
const soundTrigger = document.getElementById('sound-trigger');
const achievementsTrigger = document.getElementById('achievements-trigger');
const volumeSlider = document.getElementById('volume-slider');

const standardMedalKeys = ['accuracy', 'time15', 'time30', 'speed60'];
const customMedalKeys = ['custom_first', 'custom_long', 'custom_speed', 'custom_perfect'];

let currentText = "";
let timerInterval = null;
let autoRestartTimeout = null;
let isRunning = false;
let totalTyped = 0;
let errors = 0;
let startTime = null;
let previousInputValue = "";

// ==========================================================================
// AUDIO ENGINE E SOM DE ERRO
// ==========================================================================
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.profile = 'thock';
    this.volume = 0.7;
    this.compressor = null;
    this.masterGain = null;
    this.currentOsc = null;
    this.currentGain = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(15, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.001, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.04, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = parseFloat(val);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setProfile(profile) {
    this.profile = profile;
  }

  stopCurrentSound(now) {
    if (this.currentGain && this.currentOsc) {
      try {
        this.currentGain.gain.cancelScheduledValues(now);
        this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
        this.currentGain.gain.linearRampToValueAtTime(0.0001, now + 0.008);
        this.currentOsc.stop(now + 0.01);
      } catch (e) {
        // ignora se já finalizou
      }
    }
  }

  playKey(isSpecial = false) {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();

    const now = this.ctx.currentTime;
    this.stopCurrentSound(now);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    this.currentOsc = osc;
    this.currentGain = gain;

    osc.connect(gain);
    gain.connect(this.compressor);

    const detune = (Math.random() - 0.5) * 35;
    let baseFreq = 600;
    let endFreq = 150;
    let duration = 0.040;
    let waveType = 'triangle';
    let baseGain = 0.12;

    switch (this.profile) {
      case 'thock':
        waveType = 'triangle';
        baseFreq = isSpecial ? 220 : 380;
        endFreq = isSpecial ? 80 : 120;
        duration = 0.045;
        baseGain = 0.16;
        break;

      case 'pop':
        waveType = 'sine';
        baseFreq = isSpecial ? 450 : 750;
        endFreq = isSpecial ? 200 : 300;
        duration = 0.035;
        baseGain = 0.13;
        break;

      case 'retro':
        waveType = 'sawtooth';
        baseFreq = isSpecial ? 350 : 900;
        endFreq = isSpecial ? 150 : 400;
        duration = 0.030;
        baseGain = 0.08;
        break;

      case 'typewriter':
        waveType = 'square';
        baseFreq = isSpecial ? 300 : 1200;
        endFreq = isSpecial ? 100 : 250;
        duration = 0.028;
        baseGain = 0.09;
        break;
    }

    osc.type = waveType;
    osc.frequency.setValueAtTime(baseFreq + detune, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);

    gain.gain.setValueAtTime(baseGain * 0.5, now);
    gain.gain.linearRampToValueAtTime(baseGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.005);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  playErrorSound() {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0.10 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playThemeSwitch() {
    if (!this.enabled || this.profile === 'silent') return;
    this.init();

    const now = this.ctx.currentTime;
    this.stopCurrentSound(now);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.compressor);

    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  }
}

const audioEngine = new AudioEngine();

function setSoundProfile(val) {
  audioEngine.setProfile(val);
  localStorage.setItem('selectedSoundProfile', val);

  if (soundTriggerText) {
    soundTriggerText.textContent = soundProfileNames[val] || 'Thock Mecânico';
  }

  if (modalSound) {
    modalSound.querySelectorAll('.modal-option-btn').forEach(b => {
      b.classList.toggle('selected', b.getAttribute('data-value') === val);
    });
  }

  audioEngine.playKey(false);
}

function loadSavedAudioSettings() {
  const savedProfile = localStorage.getItem('selectedSoundProfile') || 'thock';
  const savedVolume = localStorage.getItem('selectedSoundVolume') || '0.7';

  setSoundProfile(savedProfile);
  audioEngine.setVolume(savedVolume);

  if (volumeSlider) {
    volumeSlider.value = savedVolume;
  }
}

if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    audioEngine.setVolume(val);
    localStorage.setItem('selectedSoundVolume', val);
  });
}

// ==========================================================================
// CONTROLE DO MODO HARDCORE
// ==========================================================================
function updateHardcoreUI() {
  if (hardcoreToggle) {
    hardcoreToggle.checked = isHardcore;
  }
  if (hardcoreTag) {
    if (isHardcore) {
      hardcoreTag.textContent = `🔥 HARDCORE (${hardcoreConsecutivePerfect}/3)`;
      hardcoreTag.classList.remove('hidden');
    } else {
      hardcoreTag.classList.add('hidden');
    }
  }
}

function showHardcoreModal(title, text, icon = '🔥') {
  const modalTitle = document.getElementById('hardcore-modal-title');
  const modalText = document.getElementById('hardcore-modal-text');
  const modalIcon = document.getElementById('hardcore-modal-icon');
  const closeBtn = document.getElementById('btn-hardcore-modal-close');

  if (modalTitle) modalTitle.textContent = title;
  if (modalText) modalText.innerHTML = text;
  if (modalIcon) modalIcon.textContent = icon;

  openModal(modalHardcoreInfo);

  if (closeBtn) {
    closeBtn.onclick = () => {
      closeModal(modalHardcoreInfo);
    };
  }
}

if (hardcoreToggle) {
  hardcoreToggle.addEventListener('change', (e) => {
    const wantsHardcore = e.target.checked;

    if (wantsHardcore) {
      isHardcore = true;
      hardcoreConsecutivePerfect = 0;
      localStorage.setItem('mestre_hardcore_mode', 'true');
      localStorage.setItem('mestre_hardcore_streak', '0');
      updateHardcoreUI();

      showHardcoreModal(
        "🔥 Modo Hardcore Ativado!",
        "Neste modo você <strong>NÃO poderá apagar</strong> nada do que digitar.<br><br>Atenção: Você só poderá desativar este modo após completar <strong>3 fases consecutivas com 100% de precisão</strong>!",
        "🔥"
      );
      initTest();
    } else {
      if (hardcoreConsecutivePerfect >= 3) {
        isHardcore = false;
        hardcoreConsecutivePerfect = 0;
        localStorage.setItem('mestre_hardcore_mode', 'false');
        localStorage.setItem('mestre_hardcore_streak', '0');
        updateHardcoreUI();

        showHardcoreModal(
          "🔓 Modo Hardcore Desativado!",
          "Parabéns! Você provou sua precisão e desbloqueou a alternância para o modo normal. A tecla de apagar está disponível novamente.",
          "🎉"
        );
        initTest();
      } else {
        hardcoreToggle.checked = true;
        showHardcoreModal(
          "🔒 Modo Hardcore Bloqueado!",
          `Você ainda não completou as 3 fases seguidas com 100% de precisão para poder desativar este modo.<br><br>Progresso atual: <strong>${hardcoreConsecutivePerfect}/3 fases completas</strong> com 100% de precisão.`,
          "🔒"
        );
      }
    }
  });
}

// ==========================================================================
// MODO ZEN & ÁUDIO
// ==========================================================================
let zenTimeout = null;
const INACTIVITY_DELAY = 2000;

function initZenAndAudioControls() {
  window.addEventListener('keydown', (e) => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) return;

    const isTypingFocused = document.activeElement === hiddenInput || document.activeElement === textDisplay;
    if (!isTypingFocused) return;

    const isSpecialKey = ['Backspace', 'Enter', 'Space'].includes(e.code);
    audioEngine.playKey(isSpecialKey);

    document.body.classList.remove('zen-active');
    clearTimeout(zenTimeout);

    zenTimeout = setTimeout(() => {
      document.body.classList.add('zen-active');
    }, INACTIVITY_DELAY);
  });

  window.addEventListener('mousemove', () => {
    if (document.body.classList.contains('zen-active')) {
      document.body.classList.remove('zen-active');
    }
    clearTimeout(zenTimeout);
  });
}

// ==========================================================================
// GERENCIAMENTO DE MODAIS E NAVEGAÇÃO
// ==========================================================================
function getDifficulty() { return currentDifficulty; }
function getStorageKey() { return `typingMedalCounts_${getDifficulty()}`; }

function openModal(modal) { if (modal) modal.classList.add('active'); }
function closeModal(modal) { if (modal) modal.classList.remove('active'); }

const ppmInfoTrigger = document.getElementById('ppm-info-btn');
if (ppmInfoTrigger) ppmInfoTrigger.addEventListener('click', () => openModal(modalPpmInfo));

if (difficultyTrigger) difficultyTrigger.addEventListener('click', () => openModal(modalDifficulty));
if (themeTrigger) themeTrigger.addEventListener('click', () => openModal(modalTheme));
if (soundTrigger) soundTrigger.addEventListener('click', () => openModal(modalSound));
if (achievementsTrigger) {
  achievementsTrigger.addEventListener('click', () => {
    renderAchievements();
    openModal(modalAchievements);
  });
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = e.target.getAttribute('data-close');
    closeModal(document.getElementById(modalId));
  });
});

[modalDifficulty, modalTheme, modalSound, modalCustomText, modalAchievements, modalHardcoreInfo, modalPpmInfo].forEach(modal => {
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(modalDifficulty);
    closeModal(modalTheme);
    closeModal(modalSound);
    closeModal(modalCustomText);
    closeModal(modalAchievements);
    closeModal(modalHardcoreInfo);
    closeModal(modalPpmInfo);
  }
});

if (modalDifficulty) {
  modalDifficulty.querySelectorAll('.modal-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      setDifficulty(val);
      closeModal(modalDifficulty);
    });
  });
}

if (modalSound) {
  modalSound.querySelectorAll('.modal-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      setSoundProfile(val);
      closeModal(modalSound);
    });
  });
}

function setDifficulty(val) {
  currentDifficulty = val;
  if (difficultyTriggerText) difficultyTriggerText.textContent = difficultyNames[val] || 'Fácil';

  if (modalDifficulty) {
    modalDifficulty.querySelectorAll('.modal-option-btn').forEach(b => {
      b.classList.toggle('selected', b.getAttribute('data-value') === val);
    });
  }

  const standardMedalsGrid = document.getElementById('standard-medals');
  const customMedalsGrid = document.getElementById('custom-medals');

  if (val === 'custom') {
    if (medalsTitle) medalsTitle.textContent = "🏅 Medalhas (Modo Personalizado)";
    if (standardMedalsGrid) standardMedalsGrid.classList.add('hidden');
    if (customMedalsGrid) customMedalsGrid.classList.remove('hidden');
    if (editCustomBtn) editCustomBtn.classList.remove('hidden');
    if (restartBtn) restartBtn.textContent = "↻ Recomeçar";

    if (!customUserText || customUserText.trim().length < 10) {
      openCustomTextModal();
    }
  } else {
    if (medalsTitle) medalsTitle.textContent = "🏅 Medalhas (Modo Padrão)";
    if (standardMedalsGrid) standardMedalsGrid.classList.remove('hidden');
    if (customMedalsGrid) customMedalsGrid.classList.add('hidden');
    if (editCustomBtn) editCustomBtn.classList.add('hidden');
    if (restartBtn) restartBtn.textContent = "↻ Nova Frase";
  }

  updateMedalLabels();
  loadAchievements();
  initTest();
}

function openCustomTextModal() {
  if (customTextInput) customTextInput.value = customUserText;
  if (customTextError) customTextError.classList.add('hidden');
  openModal(modalCustomText);
}

if (saveCustomTextBtn) {
  saveCustomTextBtn.addEventListener('click', () => {
    const textVal = customTextInput.value.trim();
    if (textVal.length < 10) {
      if (customTextError) customTextError.classList.remove('hidden');
      return;
    }
    customUserText = textVal;
    localStorage.setItem('customUserText', customUserText);
    closeModal(modalCustomText);
    initTest();
  });
}

if (editCustomBtn) editCustomBtn.addEventListener('click', openCustomTextModal);

if (modalTheme) {
  modalTheme.querySelectorAll('.modal-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      setTheme(val);
      closeModal(modalTheme);
    });
  });
}

function setTheme(val) {
  currentTheme = val;
  audioEngine.playThemeSwitch();

  document.documentElement.classList.add('no-transitions');
  document.documentElement.setAttribute('data-theme', val);
  localStorage.setItem('selectedTheme', val);

  if (themeTriggerText) themeTriggerText.textContent = themeNames[val] || 'Azul Marinho';

  if (modalTheme) {
    modalTheme.querySelectorAll('.modal-option-btn').forEach(b => {
      b.classList.toggle('selected', b.getAttribute('data-value') === val);
    });
  }

  trackThemeChange(val);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transitions');
    });
  });
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  setTheme(savedTheme);
}

function updateMedalLabels() {
  const diff = getDifficulty();
  if (diff === 'custom') {
    if (difficultyTag) difficultyTag.textContent = `Modo: Personalizado`;
    return;
  }

  const limits = difficultyThresholds[diff];
  const reqTime15 = document.getElementById('req-time15');
  const reqTime30 = document.getElementById('req-time30');
  const reqSpeed60 = document.getElementById('req-speed60');

  if (reqTime15) reqTime15.textContent = `Tempo ≤ ${limits.time15}s`;
  if (reqTime30) reqTime30.textContent = `Tempo ≤ ${limits.time30}s`;
  if (reqSpeed60) reqSpeed60.textContent = `${limits.speed60}+ PPM`;
  
  if (difficultyTag) difficultyTag.textContent = `Nível: ${difficultyNames[diff]}`;
}

function loadAchievements() {
  const medalCounts = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
  const activeKeys = getDifficulty() === 'custom' ? customMedalKeys : standardMedalKeys;

  activeKeys.forEach(key => {
    const count = medalCounts[key] || 0;
    const badgeEl = document.getElementById(`badge-${key}`);
    const countEl = document.getElementById(`count-${key}`);

    if (badgeEl && countEl) {
      if (count > 0) {
        badgeEl.classList.add('unlocked');
        countEl.textContent = count;
        countEl.classList.add('active');
      } else {
        badgeEl.classList.remove('unlocked');
        countEl.textContent = "0";
        countEl.classList.remove('active');
      }
    }
  });
}

function incrementMedal(key) {
  const storageKey = getStorageKey();
  const medalCounts = JSON.parse(localStorage.getItem(storageKey) || '{}');
  medalCounts[key] = (medalCounts[key] || 0) + 1;
  localStorage.setItem(storageKey, JSON.stringify(medalCounts));
  loadAchievements();
}

function focusInput() {
  if (hiddenInput && !hiddenInput.disabled) {
    hiddenInput.focus();
  }
}

// ==========================================================================
// LÓGICA DO TESTE DE DIGITAÇÃO
// ==========================================================================
function initTest() {
  clearInterval(timerInterval);
  clearTimeout(autoRestartTimeout);
  isRunning = false;
  totalTyped = 0;
  errors = 0;
  startTime = null;
  previousInputValue = "";

  // Resetar barra de progresso
  updateProgress(0, 1);
  clearInterval(timerModeInterval);
  timerModeInterval = null;
  if (countdownTag) {
    countdownTag.classList.add('hidden');
    countdownTag.classList.remove('warning');
  }

  if (timerVal) timerVal.textContent = "0s";
  if (ppmVal) ppmVal.textContent = "0";
  if (accuracyVal) accuracyVal.textContent = "100%";
  if (hiddenInput) {
    hiddenInput.value = "";
    hiddenInput.disabled = false;
  }

  if (resultMessage) {
    resultMessage.classList.add('hidden');
    resultMessage.className = 'result-message hidden';
    resultMessage.innerHTML = '';
  }

  const difficulty = getDifficulty();

  if (difficulty === 'custom') {
    if (!customUserText || customUserText.trim().length < 10) {
      if (textDisplay) textDisplay.innerHTML = '<em>Nenhum texto personalizado configurado. Clique em "Alterar Texto" para colar um texto.</em>';
      if (hiddenInput) hiddenInput.disabled = true;
      return;
    }
    currentText = customUserText;
  } else {
    const list = sentences[difficulty] || sentences['easy'];
    currentText = list[Math.floor(Math.random() * list.length)];
  }

  if (textDisplay) {
    textDisplay.innerHTML = currentText
      .split('')
      .map((char, i) => `<span class="char ${i === 0 ? 'current' : ''}">${char}</span>`)
      .join('');
  }

  updateHardcoreUI();
  updateProgress(0, currentText.length);
}

function getElapsedSeconds() {
  return Math.max(1, Math.floor((performance.now() - startTime) / 1000));
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startTime = performance.now();

  timerInterval = setInterval(() => {
    const elapsedSeconds = getElapsedSeconds();
    if (timerVal) timerVal.textContent = `${elapsedSeconds}s`;
    calculateMetrics(elapsedSeconds);
  }, 1000);
}

function calculateMetrics(seconds) {
  if (seconds > 0) {
    const minutes = seconds / 60;
    const wordsTyped = Math.max(0, totalTyped - errors) / 5;
    const wpm = Math.max(0, Math.round(wordsTyped / minutes));
    if (ppmVal) ppmVal.textContent = wpm;
    currentPPM = wpm;
    return wpm;
  }
  return 0;
}

if (hiddenInput) {
  hiddenInput.addEventListener('keydown', (e) => {
    if (isHardcore && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
    }
    if (e.key === ' ') {
      trackSpaceKey();
    }
  });

  hiddenInput.addEventListener('beforeinput', (e) => {
    if (
      e.inputType === 'insertFromPaste' || 
      e.inputType === 'insertFromDrop' || 
      e.inputType === 'insertReplacementText' ||
      e.inputType === 'insertFromYank'
    ) {
      e.preventDefault();
      return;
    }
    if (e.data && e.data.length > 1) {
      e.preventDefault();
    }
  });

  hiddenInput.addEventListener('paste', (e) => e.preventDefault());
  hiddenInput.addEventListener('contextmenu', (e) => e.preventDefault());
  hiddenInput.addEventListener('input', handleTyping);
}

function handleTyping() {
  if (isHardcore && hiddenInput.value.length < previousInputValue.length) {
    hiddenInput.value = previousInputValue;
    return;
  }

  if (isHardcore) {
    const lengthDiff = hiddenInput.value.length - previousInputValue.length;
    if (lengthDiff > 1) {
      hiddenInput.value = previousInputValue + hiddenInput.value.slice(previousInputValue.length, previousInputValue.length + 1);
    }
  }

  const previousLength = previousInputValue.length;
  previousInputValue = hiddenInput.value;
  const inputChars = hiddenInput.value.split('');

  if (inputChars.length > previousLength) {
    const lastIndex = inputChars.length - 1;
    if (inputChars[lastIndex] !== currentText[lastIndex]) {
      audioEngine.playErrorSound();
    }
  }

  if (!isRunning && inputChars.length > 0) {
    startTimer();
    // Iniciar modo contra-relógio se ativo
    if (isTimerMode && !timerModeInterval) {
      startTimerMode();
    }
  }

  const textSpans = textDisplay ? textDisplay.querySelectorAll('.char') : [];
  errors = 0;

  textSpans.forEach((span, index) => {
    const typedChar = inputChars[index];
    const targetChar = currentText[index];
    
    span.classList.remove('correct', 'incorrect', 'current');

    if (typedChar == null) {
      if (index === inputChars.length) {
        span.classList.add('current');
      }
    } else if (typedChar === targetChar) {
      span.classList.add('correct');
    } else {
      span.classList.add('incorrect');
      errors++;
    }
  });

  totalTyped = inputChars.length;

  // Atualizar barra de progresso
  updateProgress(inputChars.length, currentText.length);

  let currentAcc = 100;
  if (totalTyped > 0) {
    currentAcc = Math.max(0, Math.round(((totalTyped - errors) / totalTyped) * 100));
    if (accuracyVal) accuracyVal.textContent = `${currentAcc}%`;
  } else {
    if (accuracyVal) accuracyVal.textContent = "100%";
  }

  if (inputChars.length >= currentText.length) {
    endTest(currentAcc);
  }
}

function endTest(finalAccuracy) {
  clearInterval(timerInterval);
  clearInterval(timerModeInterval);
  timerModeInterval = null;
  if (hiddenInput) hiddenInput.disabled = true;
  isRunning = false;

  const finalTimeInSeconds = getElapsedSeconds();
  if (timerVal) timerVal.textContent = `${finalTimeInSeconds}s`;

  const finalWpm = calculateMetrics(finalTimeInSeconds);
  
  // Atualizar histórico
  updateHistory(finalWpm);
  
  const diff = getDifficulty();

  let hardcoreStatusMsg = "";
  if (isHardcore) {
    if (finalAccuracy === 100) {
      hardcoreConsecutivePerfect += 1;
      localStorage.setItem('mestre_hardcore_streak', hardcoreConsecutivePerfect.toString());
      if (hardcoreConsecutivePerfect >= 3) {
        hardcoreStatusMsg = `<br>🔓 <strong>Sua sequência Hardcore é de ${hardcoreConsecutivePerfect}/3!</strong> Você desbloqueou a opção de desativar o modo Hardcore!`;
      } else {
        hardcoreStatusMsg = `<br>🔥 <strong>Sequência Hardcore: ${hardcoreConsecutivePerfect}/3 fases perfeitas!</strong> Mantenha o foco!`;
      }
    } else {
      hardcoreConsecutivePerfect = 0;
      localStorage.setItem('mestre_hardcore_streak', '0');
      hardcoreStatusMsg = `<br>💔 <strong>Sua sequência Hardcore foi zerada por conta dos erros!</strong> Complete 3 seguidas com 100% de precisão para poder desativar.`;
    }
    updateHardcoreUI();
  }

  checkRoundAchievements(finalWpm, finalAccuracy, currentTheme);

  if (diff === 'custom') {
    if (finalAccuracy >= 90) {
      incrementMedal('custom_first');
      if (currentText.length >= 150) incrementMedal('custom_long');
      if (finalWpm >= 50) incrementMedal('custom_speed');
      if (finalAccuracy === 100) incrementMedal('custom_perfect');

      if (resultMessage) {
        resultMessage.className = 'result-message success';
        resultMessage.innerHTML = `🎉 <strong>Parabéns!</strong> Você concluiu seu texto personalizado em ${finalTimeInSeconds}s (${finalAccuracy}% de precisão). Medalhas desbloqueadas! ${hardcoreStatusMsg}`;
        resultMessage.classList.remove('hidden');
      }
    } else {
      if (resultMessage) {
        resultMessage.className = 'result-message warning';
        resultMessage.innerHTML = `⚠️ <strong>Texto personalizado concluído com ${errors} erro${errors > 1 ? 's' : ''}</strong> (${finalAccuracy}% de precisão). É necessário pelo menos 90% de precisão para ganhar medalhas! ${hardcoreStatusMsg}`;
        resultMessage.classList.remove('hidden');
      }
    }
  } else {
    const limits = difficultyThresholds[diff];
    if (finalAccuracy >= 90) {
      incrementMedal('accuracy');
      if (finalTimeInSeconds <= limits.time15) incrementMedal('time15');
      if (finalTimeInSeconds <= limits.time30) incrementMedal('time30');
      if (finalWpm >= limits.speed60) incrementMedal('speed60');

      if (resultMessage) {
        resultMessage.className = 'result-message success';
        resultMessage.innerHTML = `🎉 <strong>Incrível!</strong> ${finalAccuracy}% de precisão em ${finalTimeInSeconds}s. Medalhas conquistadas! ${hardcoreStatusMsg}`;
        resultMessage.classList.remove('hidden');
      }
    } else {
      if (resultMessage) {
        resultMessage.className = 'result-message warning';
        resultMessage.innerHTML = `⚠️ <strong>Texto concluído com ${errors} erro${errors > 1 ? 's' : ''}</strong> (${finalAccuracy}% de precisão). É necessário ter no mínimo 90% de precisão para conquistar medalhas! ${hardcoreStatusMsg}`;
        resultMessage.classList.remove('hidden');
      }
    }
  }

  clearTimeout(autoRestartTimeout);
  autoRestartTimeout = setTimeout(() => {
    initTest();
  }, 1000);
}

if (textDisplay) textDisplay.addEventListener('click', focusInput);
const typingBox = document.getElementById('typing-box-container');
if (typingBox) typingBox.addEventListener('click', focusInput);
if (restartBtn) restartBtn.addEventListener('click', initTest);

// ==========================================================================
// MENSAGENS DE BOAS-VINDAS
// ==========================================================================
const motivationalQuotes = [
  "A prática constante é o segredo para dominar o teclado.",
  "Cada tecla pressionada é um passo em direção à maestria!",
  "Mantenha o foco, a velocidade virá naturalmente com a precisão.",
  "Pequenos progressos diários resultam em grandes conquistas.",
  "A agilidade vem com a repetição consciente. Respire e digite!",
  "Não busque apenas velocidade, busque ritmo e consistência.",
  "O erro é apenas um feedback para sua próxima tentativa com sucesso."
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia! Pronto(a) para praticar?";
  if (hour >= 12 && hour < 18) return "Boa tarde! Vamos evoluir sua digitação hoje?";
  return "Boa noite! Excelente momento para focar e treinar.";
}

function showWelcomeModal() {
  const modal = document.getElementById('modal-welcome');
  const greetingEl = document.getElementById('welcome-greeting');
  const quoteEl = document.getElementById('welcome-quote-text');
  const closeBtn = document.getElementById('btn-start-session');

  if (!modal || !closeBtn) return;

  greetingEl.textContent = getGreeting();
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  quoteEl.textContent = `"${motivationalQuotes[randomIndex]}"`;

  modal.classList.add('active');
  setTimeout(() => closeBtn.focus(), 50);

  const closeModalFn = () => {
    modal.classList.remove('active');
    closeBtn.removeEventListener('click', closeModalFn);
    document.removeEventListener('keydown', handleKeyDown);
    modal.removeEventListener('click', handleOverlayClick);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      closeModalFn();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === modal) {
      closeModalFn();
    }
  };

  closeBtn.addEventListener('click', () => {
    audioEngine.init();
    closeModalFn();
  });
  document.addEventListener('keydown', handleKeyDown);
  modal.addEventListener('click', handleOverlayClick);
}

// ==========================================================================
// CONQUISTAS E ESTATÍSTICAS
// ==========================================================================
const achievementsList = [
  { id: 'surgeon', icon: '🎯', title: 'Cirurgião do Teclado', desc: '2 frases seguidas com 100% de precisão' },
  { id: 'slow_steady', icon: '🐢', title: 'Devagar e Sempre', desc: 'Frase com menos de 20 PPM e 100% de precisão' },
  { id: 'light_speed', icon: '⚡', title: 'Velocidade da Luz', desc: 'Ultrapassar 70 PPM em qualquer frase' },
  { id: 'hot_finger', icon: '🔥', title: 'Dedo Quente', desc: 'Média acima de 50 PPM em 5 frases seguidas' },
  { id: 'fast_imperfect', icon: '🏎️', title: 'Velozes e Imperfeitos', desc: 'Mais de 60 PPM com precisão abaixo de 80%' },
  { id: 'night_owl', icon: '🦉', title: 'Coruja Noturna', desc: 'Treinar entre 00:00 e 05:00 da manhã' },
  { id: 'morning_coffee', icon: '☕', title: 'Café com Teclado', desc: 'Treinar entre 06:00 e 08:00 da manhã' },
  { id: 'streak_3', icon: '📅', title: 'Imparável', desc: 'Praticar no site por 2 dias seguidos' },
  { id: 'chameleon', icon: '🎨', title: 'Camaleão Visual', desc: 'Alternar entre 4 temas na mesma sessão' },
  { id: 'hacker_80s', icon: '📟', title: 'Hacker dos Anos 80', desc: 'Concluir frase nos temas Matrix ou Amber' },
  { id: 'space_destroyer', icon: '⌨️', title: 'Destruidor de Espaços', desc: 'Acumular 500 barras de espaço pressionadas' }
];

let userStats = JSON.parse(localStorage.getItem('mestre_user_stats')) || {
  unlockedAchievements: [],
  spaceCount: 0,
  themesUsed: [],
  perfectStreak: 0,
  recentWpms: [],
  lastActiveDate: null,
  dayStreak: 0
};

function saveUserStats() {
  localStorage.setItem('mestre_user_stats', JSON.stringify(userStats));
}

function unlockAchievement(id) {
  if (!userStats.unlockedAchievements.includes(id)) {
    userStats.unlockedAchievements.push(id);
    saveUserStats();
    renderAchievements();
  }
}

function renderAchievements() {
  const container = document.getElementById('achievements-container');
  if (!container) return;

  container.innerHTML = achievementsList.map(ach => {
    const isUnlocked = userStats.unlockedAchievements.includes(ach.id);
    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-info">
          <span class="achievement-title">${ach.title}</span>
          <span class="achievement-desc">${ach.desc}</span>
          <span class="achievement-status">${isUnlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function getLocalDateStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function checkTimeAndStreakAchievements() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 0 && hour < 5) unlockAchievement('night_owl');
  if (hour >= 6 && hour < 8) unlockAchievement('morning_coffee');

  const todayStr = getLocalDateStr(now);
  if (userStats.lastActiveDate !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = getLocalDateStr(yesterday);

    if (userStats.lastActiveDate === yesterdayStr) {
      userStats.dayStreak += 1;
    } else {
      userStats.dayStreak = 1;
    }

    userStats.lastActiveDate = todayStr;
    saveUserStats();
  }

  if (userStats.dayStreak >= 2) unlockAchievement('streak_3');
}

function checkRoundAchievements(wpm, accuracy, currentTheme) {
  if (accuracy === 100) {
    userStats.perfectStreak += 1;
    if (userStats.perfectStreak >= 2) unlockAchievement('surgeon');
  } else {
    userStats.perfectStreak = 0;
  }

  if (wpm < 20 && accuracy === 100) unlockAchievement('slow_steady');
  if (wpm > 70) unlockAchievement('light_speed');

  userStats.recentWpms.push(wpm);
  if (userStats.recentWpms.length > 5) userStats.recentWpms.shift();
  if (userStats.recentWpms.length === 5) {
    const avgWpm = userStats.recentWpms.reduce((a, b) => a + b, 0) / 5;
    if (avgWpm > 50) unlockAchievement('hot_finger');
  }

  if (wpm > 60 && accuracy < 80) unlockAchievement('fast_imperfect');

  if (currentTheme === 'matrix' || currentTheme === 'amber') {
    unlockAchievement('hacker_80s');
  }

  checkTimeAndStreakAchievements();
  saveUserStats();
}

function trackThemeChange(themeName) {
  if (!userStats.themesUsed.includes(themeName)) {
    userStats.themesUsed.push(themeName);
    saveUserStats();
  }
  if (userStats.themesUsed.length >= 4) unlockAchievement('chameleon');
}

function trackSpaceKey() {
  userStats.spaceCount += 1;
  if (userStats.spaceCount >= 500) {
    unlockAchievement('space_destroyer');
  }
  if (userStats.spaceCount % 20 === 0 || userStats.spaceCount === 500) {
    saveUserStats();
  }
}

window.addEventListener('beforeunload', saveUserStats);

// ==========================================================================
// FUNÇÕES PARA AS NOVAS MELHORIAS
// ==========================================================================

// 1. BARRA DE PROGRESSO
function updateProgress(typed, total) {
  const percent = total > 0 ? Math.min(100, Math.round((typed / total) * 100)) : 0;
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const progressPercent = document.getElementById('progress-percent');
  
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${typed} / ${total} caracteres`;
  if (progressPercent) progressPercent.textContent = `${percent}%`;
}

// 2. HISTÓRICO DE PPM
function updateHistory(wpm) {
  if (wpm > 0) {
    ppmHistory.push(wpm);
    if (ppmHistory.length > 20) ppmHistory.shift();
    localStorage.setItem('mestre_ppm_history', JSON.stringify(ppmHistory));
    
    if (wpm > bestPPM) {
      bestPPM = wpm;
      localStorage.setItem('mestre_best_ppm', bestPPM.toString());
    }
    const bestPPMVal = document.getElementById('best-ppm-val');
    if (bestPPMVal) bestPPMVal.textContent = bestPPM;
    
    renderHistory();
  }
}

function renderHistory() {
  const historyChart = document.getElementById('history-chart');
  if (!historyChart) return;
  
  const maxPPM = Math.max(10, ...ppmHistory, 1);
  historyChart.innerHTML = '';
  
  if (ppmHistory.length === 0) {
    historyChart.innerHTML = '<span style="font-size:0.6rem;color:var(--text-muted);width:100%;text-align:center;padding:8px 0;">Nenhum dado ainda. Comece a digitar!</span>';
    const historyAvg = document.getElementById('history-avg');
    if (historyAvg) historyAvg.textContent = 'Média: 0';
    return;
  }
  
  const avg = Math.round(ppmHistory.reduce((a,b) => a + b, 0) / ppmHistory.length);
  const historyAvg = document.getElementById('history-avg');
  if (historyAvg) historyAvg.textContent = `Média: ${avg}`;
  
  ppmHistory.forEach((value) => {
    const dot = document.createElement('div');
    dot.className = `history-dot ${value > 0 ? 'active' : ''}`;
    const heightPercent = Math.max(10, (value / maxPPM) * 80);
    dot.style.setProperty('--value', heightPercent);
    dot.style.height = `${Math.max(4, heightPercent * 0.48)}px`;
    
    if (value > 0) {
      const tooltip = document.createElement('span');
      tooltip.className = 'dot-tooltip';
      tooltip.textContent = `${value} PPM`;
      dot.appendChild(tooltip);
    }
    
    historyChart.appendChild(dot);
  });
}

// 3. MODO CONTRA-RELÓGIO
function toggleTimerMode() {
  isTimerMode = !isTimerMode;
  const timerModeBtn = document.getElementById('timer-mode-btn');
  
  if (isTimerMode) {
    timerModeBtn.textContent = '⏱️ Modo Normal';
    timerModeBtn.classList.add('active');
    if (countdownTag) {
      countdownTag.classList.remove('hidden');
      countdownTag.textContent = `⏱️ ${timerModeLimit}s`;
    }
  } else {
    timerModeBtn.textContent = '⏱️ Contra-Relógio';
    timerModeBtn.classList.remove('active');
    if (countdownTag) {
      countdownTag.classList.add('hidden');
      countdownTag.classList.remove('warning');
    }
    clearInterval(timerModeInterval);
    timerModeInterval = null;
  }
  initTest();
}

function startTimerMode() {
  if (!isTimerMode) return;
  let remaining = timerModeLimit;
  if (countdownTag) {
    countdownTag.textContent = `⏱️ ${remaining}s`;
    countdownTag.classList.remove('warning');
  }
  
  clearInterval(timerModeInterval);
  timerModeInterval = setInterval(() => {
    remaining--;
    if (countdownTag) {
      countdownTag.textContent = `⏱️ ${remaining}s`;
      if (remaining <= 5) {
        countdownTag.classList.add('warning');
      }
    }
    if (remaining <= 0) {
      clearInterval(timerModeInterval);
      timerModeInterval = null;
      if (hiddenInput && !hiddenInput.disabled) {
        const currentAcc = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
        endTest(currentAcc);
      }
    }
  }, 1000);
}

// 4. COMPARTILHAR O SITE
function shareSite() {
  const url = window.location.href;
  const title = 'Mestre da Digitação - Teste sua velocidade!';
  const text = '⌨️ Mestre da Digitação - Teste sua velocidade e precisão! 🚀';
  
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: url
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        fallbackShare(url, text);
      }
    });
  } else {
    fallbackShare(url, text);
  }
}

function fallbackShare(url, text) {
  const shareText = `${text}\n\n${url}`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareText).then(() => {
      showToast('✅ Link copiado! Compartilhe com seus amigos.');
      const btn = document.getElementById('share-site-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✅ Copiado!';
        btn.classList.add('success');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('success');
        }, 2000);
      }
    }).catch(() => {
      manualCopyFallback(shareText);
    });
  } else {
    manualCopyFallback(shareText);
  }
}

function manualCopyFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showToast('✅ Link copiado! Compartilhe com seus amigos.');
    const btn = document.getElementById('share-site-btn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✅ Copiado!';
      btn.classList.add('success');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('success');
      }, 2000);
    }
  } catch (e) {
    showToast(`📋 Copie o link: ${window.location.href}`);
  }
  
  document.body.removeChild(textarea);
}

// 5. TOAST (feedback rápido)
function showToast(message) {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ==========================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedTheme();
  loadSavedAudioSettings();
  initZenAndAudioControls();
  setDifficulty('easy');
  loadAchievements();
  updateHardcoreUI();
  showWelcomeModal();
  initTest();
  
  // Botão compartilhar site
  const shareSiteBtn = document.getElementById('share-site-btn');
  if (shareSiteBtn) {
    shareSiteBtn.addEventListener('click', shareSite);
  }
  
  // Botão modo contra-relógio
  const timerModeBtn = document.getElementById('timer-mode-btn');
  if (timerModeBtn) {
    timerModeBtn.addEventListener('click', toggleTimerMode);
  }
  
  // Renderizar histórico inicial
  renderHistory();
  const bestPPMVal = document.getElementById('best-ppm-val');
  if (bestPPMVal) bestPPMVal.textContent = bestPPM;
});