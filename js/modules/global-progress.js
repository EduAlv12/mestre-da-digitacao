import { state, saveState } from './utils.js';

export const getXPForGlobalLevel = (level) => {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  return Math.max(100, Math.floor(100 * Math.pow(1.25, safeLevel - 1)));
};

export function normalizeGlobalProgress() {
  const stats = state.userStats || (state.userStats = {});
  let level = Math.max(1, Math.floor(Number(stats.globalLevel) || 1));
  let xp = Math.max(0, Number(stats.globalXP) || 0);
  let changed = false;

  // Migra dados antigos que ficaram com XP acumulado acima do limite do nível.
  while (xp >= getXPForGlobalLevel(level + 1)) {
    xp -= getXPForGlobalLevel(level + 1);
    level += 1;
    changed = true;
  }

  if (stats.globalLevel !== level || stats.globalXP !== xp) {
    stats.globalLevel = level;
    stats.globalXP = xp;
    changed = true;
  }

  if (changed) saveState();
  return { level, xp, nextXP: getXPForGlobalLevel(level + 1) };
}