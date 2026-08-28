// js/modules/sentence-engine.js
import { SENTENCES } from './utils.js';
import { SENTENCE_BANK } from './sentence-bank.js';

const STORAGE_KEY = 'mestre_sentence_history_v3';
const GLOBAL_RECENT_LIMIT = 60;
const DIFFICULTY_RECENT_LIMIT = 24;
const SESSION_RECENT_LIMIT = 8;

const MODE_CATEGORIES = {
  default: ['cotidiano', 'ciencia'],
  fury: ['tecnologia', 'criatividade'],
  survival: ['natureza', 'cotidiano'],
  sniper: ['ciencia', 'tecnologia'],
  wordhunt: ['cotidiano', 'criatividade'],
  casino: ['cotidiano', 'historia'],
  marathon: ['cotidiano', 'tecnologia'],
  memory: ['ciencia', 'natureza'],
  wave: ['natureza', 'aventura'],
  rpg: ['historia', 'criatividade'],
  rainbow: ['criatividade', 'natureza']
};

let sessionRecent = [];

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // O jogo continua funcionando mesmo sem armazenamento persistente.
  }
}

function normalizeHistory(history) {
  const normalized = {
    global: Array.isArray(history.global) ? history.global : [],
    byDifficulty: history.byDifficulty && typeof history.byDifficulty === 'object'
      ? history.byDifficulty
      : {}
  };

  normalized.global = normalized.global.filter(Boolean).slice(-GLOBAL_RECENT_LIMIT);
  Object.keys(normalized.byDifficulty).forEach(key => {
    normalized.byDifficulty[key] = Array.isArray(normalized.byDifficulty[key])
      ? normalized.byDifficulty[key].filter(Boolean).slice(-DIFFICULTY_RECENT_LIMIT)
      : [];
  });

  return normalized;
}

function remember(history, difficulty, sentence) {
  history.global = [...history.global.filter(item => item !== sentence), sentence]
    .slice(-GLOBAL_RECENT_LIMIT);

  const current = Array.isArray(history.byDifficulty[difficulty])
    ? history.byDifficulty[difficulty]
    : [];

  history.byDifficulty[difficulty] = [
    ...current.filter(item => item !== sentence),
    sentence
  ].slice(-DIFFICULTY_RECENT_LIMIT);

  sessionRecent = [
    ...sessionRecent.filter(item => item !== sentence),
    sentence
  ].slice(-SESSION_RECENT_LIMIT);
}

function getSupplementalPool(difficulty, modeId) {
  const source = SENTENCE_BANK[difficulty] || {};
  const categories = MODE_CATEGORIES[modeId] || [];
  const all = Object.values(source).flat();
  const preferred = categories.flatMap(category => source[category] || []);

  // A preferência de modo orienta a variedade, mas nunca deixa o banco vazio.
  return [...new Set(preferred.length ? preferred : all)];
}

/**
 * Escolhe uma frase com rotação persistente, dificuldade e preferência temática.
 * O modeId é opcional para manter compatibilidade com chamadas antigas.
 */
export function getNextSentence(difficulty = 'easy', modeId = 'default') {
  const safeDifficulty = Object.prototype.hasOwnProperty.call(SENTENCES, difficulty)
    ? difficulty
    : 'easy';

  const basePool = Array.isArray(SENTENCES[safeDifficulty]) ? SENTENCES[safeDifficulty] : [];
  const supplementalPool = getSupplementalPool(safeDifficulty, modeId);
  const pool = [...new Set([...basePool, ...supplementalPool])];

  if (!pool.length) return '';

  const history = normalizeHistory(readHistory());
  const difficultyRecent = new Set(history.byDifficulty[safeDifficulty] || []);
  const globalRecent = new Set(history.global || []);
  const session = new Set(sessionRecent);

  let candidates = pool.filter(sentence =>
    !session.has(sentence) &&
    !difficultyRecent.has(sentence) &&
    !globalRecent.has(sentence)
  );

  // Se o banco específico já foi parcialmente consumido, relaxamos o global.
  if (!candidates.length) {
    candidates = pool.filter(sentence =>
      !session.has(sentence) && !difficultyRecent.has(sentence)
    );
  }

  // Em último caso, preservamos ao menos a anti-repetição da sessão.
  if (!candidates.length) candidates = pool.filter(sentence => !session.has(sentence));
  if (!candidates.length) candidates = pool;

  const last = sessionRecent.at(-1);
  if (last && candidates.length > 3) {
    const lastLength = last.length;
    const varied = candidates.filter(sentence => Math.abs(sentence.length - lastLength) >= 12);
    if (varied.length) candidates = varied;
  }

  const sentence = candidates[Math.floor(Math.random() * candidates.length)];
  remember(history, safeDifficulty, sentence);
  writeHistory(history);
  return sentence;
}

export function clearSentenceHistory(difficulty = null) {
  const history = normalizeHistory(readHistory());

  if (difficulty) {
    delete history.byDifficulty[difficulty];
    const known = new Set([
      ...(SENTENCES[difficulty] || []),
      ...Object.values(SENTENCE_BANK[difficulty] || {}).flat()
    ]);
    history.global = history.global.filter(sentence => !known.has(sentence));
    sessionRecent = sessionRecent.filter(sentence => !known.has(sentence));
  } else {
    history.global = [];
    history.byDifficulty = {};
    sessionRecent = [];
  }

  writeHistory(history);
}

export function resetSentenceSession() {
  sessionRecent = [];
}
