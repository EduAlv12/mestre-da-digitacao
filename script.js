const sentences = {
  easy: [
    "O sol nasce para todos todas as manhãs.",
    "Café fresquinho logo cedo renova as energias.",
    "Um sorriso sincero transforma o dia de alguém.",
    "Caminhar na praia ao pôr do sol acalma a alma.",
    "A vida é feita de pequenos momentos especiais.",
    "Ler um bom livro é viajar sem sair do lugar.",
    "Flores coloridas perfumam o jardim da casa.",
    "A música suave embala os pensamentos da tarde.",
    "Comer uma fruta bem docinha é maravilhoso.",
    "A chuva fina caindo no telhado traz paz."
  ],
  medium: [
    "As estações do ano mudam as cores da paisagem e trazem novas perspectivas para a vida.",
    "Cozinhar para quem amamos é uma das formas mais bonitas de demonstrar afeto e carinho.",
    "Viajar para lugares desconhecidos nos ensina sobre novas culturas e amplia nossos horizontes.",
    "O respeito às diferenças é o pilar fundamental para a construção de uma sociedade justa.",
    "Cuidar de plantas requer paciência e dedicação diária para vê-las florescer no tempo certo."
  ],
  hard: [
    "A diversidade cultural da humanidade reflete-se na vasta riqueza de tradições, idiomas, mitos e manifestações artísticas ao redor do mundo.",
    "Navegar pelos mares da literatura clássica nos proporciona um encontro transformador com grandes pensadores de épocas distantes.",
    "O constante equilíbrio entre a preservação dos ecossistemas naturais e o progresso humano é um dos maiores desafios do século presente."
  ]
};

const difficultyThresholds = {
  easy: { time15: 15, time30: 30, speed60: 50 },
  medium: { time15: 20, time30: 40, speed60: 60 },
  hard: { time15: 30, time30: 60, speed60: 70 }
};

const difficultyNames = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil', custom: 'Personalizado' };
const themeNames = { default: 'Azul Marinho', light: 'Claro Clean', dracula: 'Dracula Cyber', amber: 'Amber Retrô' };

let currentDifficulty = 'easy';
let currentTheme = 'default';
let customUserText = localStorage.getItem('customUserText') || "";

const difficultyTriggerText = document.getElementById('difficulty-trigger-text');
const themeTriggerText = document.getElementById('theme-trigger-text');
const difficultyTag = document.getElementById('difficulty-tag');
const textDisplay = document.getElementById('text-display');
const hiddenInput = document.getElementById('hidden-input');
const ppmVal = document.getElementById('ppm-val');
const accuracyVal = document.getElementById('accuracy-val');
const timerVal = document.getElementById('timer-val');
const restartBtn = document.getElementById('restart-btn');
const editCustomBtn = document.getElementById('edit-custom-btn');
const resultMessage = document.getElementById('result-message');
const medalsTitle = document.getElementById('medals-title');

const modalDifficulty = document.getElementById('modal-difficulty');
const modalTheme = document.getElementById('modal-theme');
const modalCustomText = document.getElementById('modal-custom-text');
const modalAchievements = document.getElementById('modal-achievements');

const customTextInput = document.getElementById('custom-text-input');
const customTextError = document.getElementById('custom-text-error');
const saveCustomTextBtn = document.getElementById('save-custom-text-btn');

const difficultyTrigger = document.getElementById('difficulty-trigger');
const themeTrigger = document.getElementById('theme-trigger');
const achievementsTrigger = document.getElementById('achievements-trigger') || document.getElementById('btn-open-achievements');

const standardMedalKeys = ['accuracy', 'time15', 'time30', 'speed60'];
const customMedalKeys = ['custom_first', 'custom_long', 'custom_speed', 'custom_perfect'];

let currentText = "";
let timerInterval = null;
let isRunning = false;
let totalTyped = 0;
let errors = 0;
let startTime = null;
let previousInputValue = "";

function getDifficulty() {
  return currentDifficulty;
}

function getStorageKey() {
  return `typingMedalCounts_${getDifficulty()}`;
}

function openModal(modal) {
  if (modal) modal.classList.add('active');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('active');
}

// Configuração dos Modais
if (difficultyTrigger) difficultyTrigger.addEventListener('click', () => openModal(modalDifficulty));
if (themeTrigger) themeTrigger.addEventListener('click', () => openModal(modalTheme));
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

[modalDifficulty, modalTheme, modalCustomText, modalAchievements].forEach(modal => {
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
    closeModal(modalCustomText);
    closeModal(modalAchievements);
  }
});

// Seleção de Dificuldade / Modo
if (modalDifficulty) {
  modalDifficulty.querySelectorAll('.modal-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      setDifficulty(val);
      closeModal(modalDifficulty);
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
    if (restartBtn) restartBtn.textContent = "🔄 Recomeçar";

    if (!customUserText || customUserText.trim().length < 10) {
      openCustomTextModal();
    }
  } else {
    if (medalsTitle) medalsTitle.textContent = "🏅 Medalhas (Modo Padrão)";
    if (standardMedalsGrid) standardMedalsGrid.classList.remove('hidden');
    if (customMedalsGrid) customMedalsGrid.classList.add('hidden');
    if (editCustomBtn) editCustomBtn.classList.add('hidden');
    if (restartBtn) restartBtn.textContent = "🔄 Nova Frase";
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

// Seleção de Tema
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
  document.documentElement.setAttribute('data-theme', val);
  localStorage.setItem('selectedTheme', val);
  if (themeTriggerText) themeTriggerText.textContent = themeNames[val] || 'Azul Marinho';

  if (modalTheme) {
    modalTheme.querySelectorAll('.modal-option-btn').forEach(b => {
      b.classList.toggle('selected', b.getAttribute('data-value') === val);
    });
  }

  // Registra troca de tema para conquista
  trackThemeChange(val);
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

function initTest() {
  clearInterval(timerInterval);
  isRunning = false;
  totalTyped = 0;
  errors = 0;
  startTime = null;
  previousInputValue = "";

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

  focusInput();
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startTime = performance.now();

  timerInterval = setInterval(() => {
    const elapsedSeconds = Math.max(1, Math.floor((performance.now() - startTime) / 1000));
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
    return wpm;
  }
  return 0;
}

// Bloqueia teclas de exclusão e registra pressionamento de Espaço
if (hiddenInput) {
  hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
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
  if (hiddenInput.value.length < previousInputValue.length) {
    hiddenInput.value = previousInputValue;
    return;
  }

  const lengthDiff = hiddenInput.value.length - previousInputValue.length;
  if (lengthDiff > 1) {
    hiddenInput.value = previousInputValue + hiddenInput.value.slice(previousInputValue.length, previousInputValue.length + 1);
  }

  previousInputValue = hiddenInput.value;
  const inputChars = hiddenInput.value.split('');

  if (!isRunning && inputChars.length > 0) {
    startTimer();
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
  if (hiddenInput) hiddenInput.disabled = true;
  isRunning = false;

  const endTime = performance.now();
  const finalTimeInSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
  if (timerVal) timerVal.textContent = `${finalTimeInSeconds}s`;

  const finalWpm = calculateMetrics(finalTimeInSeconds);
  const diff = getDifficulty();

  // Processa as 11 conquistas com o resultado da frase
  checkRoundAchievements(finalWpm, finalAccuracy, currentTheme);

  if (diff === 'custom') {
    if (finalAccuracy >= 90) {
      incrementMedal('custom_first');
      if (currentText.length >= 150) incrementMedal('custom_long');
      if (finalWpm >= 50) incrementMedal('custom_speed');
      if (finalAccuracy === 100) incrementMedal('custom_perfect');

      if (resultMessage) {
        resultMessage.className = 'result-message success';
        resultMessage.innerHTML = `🎉 <strong>Parabéns!</strong> Você concluiu seu texto personalizado em ${finalTimeInSeconds}s (${finalAccuracy}% de precisão). Medalhas desbloqueadas!`;
        resultMessage.classList.remove('hidden');
      }
    } else {
      if (resultMessage) {
        resultMessage.className = 'result-message warning';
        resultMessage.innerHTML = `⚠️ <strong>Texto personalizado concluído com ${errors} erro${errors > 1 ? 's' : ''}</strong> (${finalAccuracy}% de precisão). É necessário pelo menos 90% de precisão para ganhar medalhas!`;
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
        resultMessage.innerHTML = `🎉 <strong>Incrível!</strong> ${finalAccuracy}% de precisão em ${finalTimeInSeconds}s. Medalhas conquistadas!`;
        resultMessage.classList.remove('hidden');
      }
    } else {
      if (resultMessage) {
        resultMessage.className = 'result-message warning';
        resultMessage.innerHTML = `⚠️ <strong>Texto concluído com ${errors} erro${errors > 1 ? 's' : ''}</strong> (${finalAccuracy}% de precisão). É necessário ter no mínimo 90% de precisão para conquistar medalhas!`;
        resultMessage.classList.remove('hidden');
      }
    }
  }
}

if (textDisplay) textDisplay.addEventListener('click', focusInput);
const typingBox = document.getElementById('typing-box-container');
if (typingBox) typingBox.addEventListener('click', focusInput);
if (restartBtn) restartBtn.addEventListener('click', initTest);

// ==========================================================================
// MENSAGENS DE BOAS-VINDAS E MOTIVAÇÃO
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

    focusInput();
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

  closeBtn.addEventListener('click', closeModalFn);
  document.addEventListener('keydown', handleKeyDown);
  modal.addEventListener('click', handleOverlayClick);
}

// ==========================================================================
// SISTEMA DE CONQUISTAS & MEDALHAS (11 CONQUISTAS)
// ==========================================================================
const achievementsList = [
  { id: 'surgeon', icon: '🎯', title: 'Cirurgião do Teclado', desc: '3 frases seguidas com 100% de precisão' },
  { id: 'slow_steady', icon: '🐢', title: 'Devagar e Sempre', desc: 'Frase com menos de 20 PPM e 100% de precisão' },
  { id: 'light_speed', icon: '⚡', title: 'Velocidade da Luz', desc: 'Ultrapassar 80 PPM em qualquer frase' },
  { id: 'hot_finger', icon: '🔥', title: 'Dedo Quente', desc: 'Média acima de 60 PPM em 5 frases seguidas' },
  { id: 'fast_imperfect', icon: '🏎️', title: 'Velozes e Imperfeitos', desc: 'Mais de 70 PPM com precisão abaixo de 80%' },
  { id: 'night_owl', icon: '🦉', title: 'Coruja Noturna', desc: 'Treinar entre 00:00 e 05:00 da manhã' },
  { id: 'morning_coffee', icon: '☕', title: 'Café com Teclado', desc: 'Treinar entre 06:00 e 08:00 da manhã' },
  { id: 'streak_3', icon: '📅', title: 'Imparável', desc: 'Praticar no site por 3 dias seguidos' },
  { id: 'chameleon', icon: '🎨', title: 'Camaleão Visual', desc: 'Alternar entre 5 temas na mesma sessão' },
  { id: 'hacker_80s', icon: '📟', title: 'Hacker dos Anos 80', desc: 'Concluir frase nos temas Matrix ou Amber' },
  { id: 'space_destroyer', icon: '⌨️', title: 'Destruidor de Espaços', desc: 'Acumular 1.000 barras de espaço pressionadas' }
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

function checkTimeAndStreakAchievements() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 0 && hour < 5) unlockAchievement('night_owl');
  if (hour >= 6 && hour < 8) unlockAchievement('morning_coffee');

  const todayStr = now.toISOString().split('T')[0];
  if (userStats.lastActiveDate !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (userStats.lastActiveDate === yesterdayStr) {
      userStats.dayStreak += 1;
    } else {
      userStats.dayStreak = 1;
    }

    userStats.lastActiveDate = todayStr;
    saveUserStats();
  }

  if (userStats.dayStreak >= 3) unlockAchievement('streak_3');
}

function checkRoundAchievements(wpm, accuracy, currentTheme) {
  if (accuracy === 100) {
    userStats.perfectStreak += 1;
    if (userStats.perfectStreak >= 3) unlockAchievement('surgeon');
  } else {
    userStats.perfectStreak = 0;
  }

  if (wpm < 20 && accuracy === 100) unlockAchievement('slow_steady');
  if (wpm > 80) unlockAchievement('light_speed');

  userStats.recentWpms.push(wpm);
  if (userStats.recentWpms.length > 5) userStats.recentWpms.shift();
  if (userStats.recentWpms.length === 5) {
    const avgWpm = userStats.recentWpms.reduce((a, b) => a + b, 0) / 5;
    if (avgWpm > 60) unlockAchievement('hot_finger');
  }

  if (wpm > 70 && accuracy < 80) unlockAchievement('fast_imperfect');

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
  if (userStats.themesUsed.length >= 5) unlockAchievement('chameleon');
}

function trackSpaceKey() {
  userStats.spaceCount += 1;
  if (userStats.spaceCount >= 1000) unlockAchievement('space_destroyer');
  saveUserStats();
}

// INICIALIZAÇÃO ÚNICA AO CARREGAR A PÁGINA
document.addEventListener('DOMContentLoaded', () => {
  loadSavedTheme();
  setDifficulty('easy');
  showWelcomeModal();
  renderAchievements();
  checkTimeAndStreakAchievements();
});
