// js/modules/sentence-engine.js
import { SENTENCES } from './utils.js';

const STORAGE_KEY = 'mestre_sentence_history_v2';
const GLOBAL_RECENT_LIMIT = 40;
const DIFFICULTY_RECENT_LIMIT = 18;
const SESSION_RECENT_LIMIT = 6;

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

/**
 * Escolhe uma frase evitando repetições recentes.
 *
 * A rotação possui três camadas:
 * 1. memória da sessão atual;
 * 2. memória persistente da dificuldade;
 * 3. memória global entre dificuldades e recarregamentos.
 *
 * Isso evita que trocar de dificuldade imediatamente traga de volta
 * uma frase que acabou de aparecer em outro conjunto.
 */
export function getNextSentence(difficulty = 'easy') {
  const safeDifficulty = Object.prototype.hasOwnProperty.call(SENTENCES, difficulty)
    ? difficulty
    : 'easy';

  const pool = Array.isArray(SENTENCES[safeDifficulty]) && SENTENCES[safeDifficulty].length
    ? [...new Set(SENTENCES[safeDifficulty])]
    : [...new Set(SENTENCES.easy || [])];

  if (!pool.length) return '';

  const history = normalizeHistory(readHistory());
  const difficultyRecent = new Set(history.byDifficulty[safeDifficulty] || []);
  const globalRecent = new Set(history.global || []);
  const session = new Set(sessionRecent);

  // Primeiro tentamos uma frase que não tenha aparecido recentemente
  // nem na sessão atual.
  let candidates = pool.filter(sentence =>
    !session.has(sentence) &&
    !difficultyRecent.has(sentence) &&
    !globalRecent.has(sentence)
  );

  // Se o banco específico for pequeno, relaxamos apenas a memória global.
  if (!candidates.length) {
    candidates = pool.filter(sentence =>
      !session.has(sentence) && !difficultyRecent.has(sentence)
    );
  }

  // Se todas já foram usadas dentro da janela, a sessão continua
  // sem travar: permitimos as mais antigas, preservando as recentes.
  if (!candidates.length) {
    candidates = pool.filter(sentence => !session.has(sentence));
  }

  if (!candidates.length) candidates = pool;

  // Entre os candidatos restantes, evita escolher repetidamente frases
  // de tamanho muito parecido quando houver alternativas.
  const last = sessionRecent.at(-1);
  if (last && candidates.length > 2) {
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
    history.global = history.global.filter(sentence => !SENTENCES[difficulty]?.includes(sentence));
    sessionRecent = sessionRecent.filter(sentence => !SENTENCES[difficulty]?.includes(sentence));
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
