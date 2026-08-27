// js/modules/sentence-engine.js
import { SENTENCES } from './utils.js';

const STORAGE_KEY = 'mestre_sentence_history_v1';

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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch { /* storage indisponível */ }
}

/**
 * Retorna uma frase sem repetir as frases recentemente usadas.
 * A memória é persistida por dificuldade, então recarregar o site
 * não reinicia imediatamente o conjunto de frases já vistas.
 */
export function getNextSentence(difficulty = 'easy') {
  const pool = Array.isArray(SENTENCES[difficulty]) && SENTENCES[difficulty].length
    ? SENTENCES[difficulty]
    : SENTENCES.easy;
  const key = difficulty in SENTENCES ? difficulty : 'easy';
  const history = readHistory();
  const recent = Array.isArray(history[key]) ? history[key].filter(text => pool.includes(text)) : [];

  const available = pool.filter(text => !recent.includes(text));
  const candidates = available.length ? available : pool;
  const sentence = candidates[Math.floor(Math.random() * candidates.length)];

  // Mantém todas as outras frases do conjunto fora da seleção imediata.
  const nextRecent = [...recent.filter(text => text !== sentence), sentence]
    .slice(-(pool.length - 1));
  history[key] = nextRecent;
  writeHistory(history);
  return sentence;
}

export function clearSentenceHistory(difficulty = null) {
  const history = readHistory();
  if (difficulty) delete history[difficulty];
  else Object.keys(history).forEach(key => delete history[key]);
  writeHistory(history);
}
