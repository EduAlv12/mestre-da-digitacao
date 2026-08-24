// js/modes/index.js
import { state, saveState, getModeStats } from '../modules/utils.js';
import { initTest } from '../modules/typing.js';
import { disableTimerMode, renderHistoryChart } from '../modules/ui.js';

import defaultMode from './default.js';
import furyMode from './fury.js';
import survivalMode from './survival.js';
import sniperMode from './sniper.js';
import wordhuntMode from './wordhunt.js';
import casinoMode from './casino.js';
import marathonMode from './marathon.js';
import memoryMode from './memory.js';
import waveMode from './wave.js';
import rpgMode from './rpg.js';
import rainbowMode from './rainbow.js';

const MODES = {
  default: defaultMode,
  fury: furyMode,
  survival: survivalMode,
  sniper: sniperMode,
  wordhunt: wordhuntMode,
  casino: casinoMode,
  marathon: marathonMode,
  memory: memoryMode,
  wave: waveMode,
  rpg: rpgMode,
  rainbow: rainbowMode
};

export const MODE_NAMES = {
  default: '📖 Padrão',
  fury: '🔥 Fúria',
  survival: '💀 Sobrevivência',
  sniper: '🎯 Precisão Extrema',
  wordhunt: '🧩 Caça-Palavras',
  casino: '💰 Cassino',
  marathon: '🏃 Maratona',
  memory: '🧠 Memória',
  wave: '🌊 Onda',
  rpg: '⚔️ RPG',
  rainbow: '🌈 Arco-Íris'
};

const MODE_DESCRIPTIONS = {
  default: 'Modo clássico, digite frases e ganhe medalhas.',
  fury: 'A cada 10 caracteres corretos, a velocidade aumenta. Erros resetam o streak.',
  survival: 'Cada caractere tem tempo de vida. Se expirar, perde uma vida.',
  sniper: 'Erros custam caro: volte caracteres e reinicie se errar demais.',
  wordhunt: 'Palavras embaralhadas, digite a forma correta para avançar.',
  casino: 'Aposte fichas na sua precisão. Ganhe ou perca com base no resultado.',
  marathon: 'Digite o máximo de palavras em 60 segundos.',
  memory: 'Texto desaparece após 3s. Digite de memória.',
  wave: 'Palavras vêm em ondas. Digite antes que a onda quebre.',
  rpg: 'Cada frase é um inimigo. Derrote-os com precisão para ganhar XP.',
  rainbow: 'Pinte o texto com todas as cores do arco-íris. Erros quebram a pintura.'
};

let currentModeId = 'default';
let currentMode = MODES.default;

export function getMode() { return currentMode; }
export function getModeId() { return currentModeId; }
export function getModeHandler() { return currentMode; }

const DASHBOARD_LABELS = {
  default: ['Partidas', 'Melhor PPM', 'Precisão máx.', 'Melhor tempo'],
  fury: ['Streak atual', 'Streak máx.', 'Nível Fúria', 'Alvo PPM'],
  survival: ['Vidas', 'Máx. vidas', 'Tempo/caract.', 'Erros'],
  sniper: ['Erros seguidos', 'Limite', 'Recuo', 'Erros totais'],
  wordhunt: ['Palavras', 'Encontradas', 'Restantes', 'Erros'],
  casino: ['Fichas', 'Aposta', 'Vitórias seg.', 'Melhor PPM'],
  marathon: ['Tempo', 'Palavras', 'PPM', 'Erros'],
  memory: ['Exibição', 'Caracteres', 'Erros', 'Melhor PPM'],
  wave: ['Onda', 'Palavras', 'Tempo', 'Erros'],
  rpg: ['Nível', 'XP', 'HP', 'Ataque'],
  rainbow: ['Pintadas', 'Cores', 'Caracteres', 'Erros']
};

function dashboardData(id, mode, stats) {
  const generic = [
    stats.rounds || 0,
    stats.bestPPM || 0,
    `${stats.bestAccuracy || 0}%`,
    stats.bestTime == null ? '—' : `${stats.bestTime}s`
  ];
  switch (id) {
    case 'fury': return [mode.streak, mode.maxStreak, mode.furyLevel, mode.targetPPM];
    case 'survival': return [`${mode.lives}/${mode.maxLives}`, mode.maxLives, `${mode.charLife}s`, mode.errors];
    case 'sniper': return [mode.consecutiveErrors, mode.maxErrors, mode.rewind, mode.totalErrors];
    case 'wordhunt': return [mode.totalWords, mode.foundWords, Math.max(0, mode.totalWords - mode.foundWords), mode.errors];
    case 'casino': return [mode.chips, mode.bet, mode.winStreak, stats.bestPPM || 0];
    case 'marathon': return [`${mode.timeLeft}s`, mode.wordsTyped, mode.wordsTyped > 0 ? Math.round(mode.wordsTyped / Math.max(1, (mode.timeLimit - mode.timeLeft) / 60)) : 0, mode.errors];
    case 'memory': return [`${mode.displayTime}s`, mode.typed.length, mode.errors, stats.bestPPM || 0];
    case 'wave': return [mode.waveIndex, mode.totalWords, `${Math.ceil(mode.timeLeft || 0)}s`, mode.errors];
    case 'rpg': return [`Lv.${mode.player.level}`, `${mode.player.xp}/${mode.player.xpToNext}`, `${mode.player.hp}/${mode.player.maxHp}`, mode.player.attack];
    case 'rainbow': return [`${mode.painted}/${mode.typed.length || 0}`, mode.colors.length, mode.typed.length, mode.errors];
    default: return generic;
  }
}

export function renderModeDashboard() {
  const grid = document.getElementById('mode-dashboard-grid');
  const title = document.getElementById('mode-dashboard-title');
  if (!grid) return;

  const id = currentModeId;
  const labels = DASHBOARD_LABELS[id] || DASHBOARD_LABELS.default;
  const stats = getModeStats(id);
  const values = dashboardData(id, currentMode, stats);

  if (title) title.textContent = `${MODE_NAMES[id] || id} · dados exclusivos`;
  grid.innerHTML = labels.map((label, i) => `
    <div class="mode-data-card">
      <span class="mode-data-label">${label}</span>
      <span class="mode-data-value">${values[i] ?? '—'}</span>
    </div>
  `).join('');
}


export function setMode(id, { restart = true } = {}) {
  if (!MODES[id]) return;
  if (currentMode && currentMode.destroy) currentMode.destroy();
  
  const newMode = MODES[id];
  if (newMode.hasTimer && state.isTimerMode) disableTimerMode();
  
  currentModeId = id;
  currentMode = newMode;
  state.currentModeId = id;
  
  localStorage.setItem('selectedGameMode', id);
  
  const modeTrigger = document.getElementById('mode-trigger-text');
  if (modeTrigger) modeTrigger.textContent = MODE_NAMES[id] || id;
  
  const modeStatusTag = document.getElementById('mode-status-tag');
  if (modeStatusTag) modeStatusTag.textContent = MODE_NAMES[id] || 'Padrão';
  
  // Atualiza recorde
  const stats = getModeStats(id);
  const bestEl = document.getElementById('best-ppm-val');
  if (bestEl) bestEl.textContent = stats.bestPPM || 0;
  renderHistoryChart(id);
  renderModeDashboard();
  
  renderModeList();
  if (restart) initTest();
}

export function renderModeList() {
  const container = document.getElementById('modes-list');
  if (!container) return;
  
  container.innerHTML = Object.keys(MODES).map(id => `
    <button type="button" class="modal-option-btn ${id === currentModeId ? 'selected' : ''}" data-value="${id}">
      <div class="option-info">
        <span class="option-label">${MODE_NAMES[id]}</span>
        <span class="option-desc">${MODE_DESCRIPTIONS[id]}</span>
      </div>
      <span class="option-check">✓</span>
    </button>
  `).join('');
}

export function loadSavedMode() {
  const saved = localStorage.getItem('selectedGameMode') || 'default';
  setMode(saved, { restart: false });
}

export function getModeList() {
  return Object.keys(MODES).map(id => ({
    id,
    name: MODE_NAMES[id],
    desc: MODE_DESCRIPTIONS[id]
  }));
}