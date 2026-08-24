// js/modules/stats.js
import { state, saveState, getLocalDateStr, ACHIEVEMENTS_LIST, MODE_MEDALS, getModeStats } from './utils.js';
import { renderHistoryChart } from './ui.js';

export function incrementMedal(modeId, medalId) {
  const stats = getModeStats(modeId);
  stats.medalCounts[medalId] = (stats.medalCounts[medalId] || 0) + 1;
  saveState();
}

export function loadAchievements() {
  const modeId = state.currentModeId;
  const stats = getModeStats(modeId);
  const medals = MODE_MEDALS[modeId] || [];
  
  const title = document.getElementById('medals-title');
  if (title) {
    const modeName = state.currentModeId.charAt(0).toUpperCase() + state.currentModeId.slice(1);
    title.textContent = `🏅 Medalhas (Modo ${modeName})`;
  }

  const container = document.getElementById('standard-medals');
  if (container) {
    container.innerHTML = '';
    medals.forEach(medal => {
      const count = stats.medalCounts[medal.id] || 0;
      const div = document.createElement('div');
      div.className = `medal-item ${count > 0 ? 'unlocked' : ''}`;
      div.id = `badge-${medal.id}`;
      div.innerHTML = `
        <span class="badge-counter ${count > 0 ? 'active' : ''}" id="count-${medal.id}">${count || 0}</span>
        <div class="medal-icon">${medal.icon}</div>
        <div class="medal-name">${medal.name}</div>
        <div class="medal-req">${medal.req}</div>
      `;
      container.appendChild(div);
    });
  }

  const customContainer = document.getElementById('custom-medals');
  if (customContainer) {
    customContainer.classList.add('hidden');
  }
}

export function renderAchievementsUI() {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  const modeId = state.currentModeId;
  const medals = MODE_MEDALS[modeId] || [];
  const stats = getModeStats(modeId);
  
  let html = medals.map(medal => {
    const count = stats.medalCounts[medal.id] || 0;
    const unlocked = count > 0;
    return `<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
      <div class="achievement-icon">${medal.icon}</div>
      <div class="achievement-info">
        <span class="achievement-title">${medal.name}</span>
        <span class="achievement-desc">${medal.req}</span>
        <span class="achievement-status">${unlocked ? `✓ Desbloqueado (${count}x)` : '🔒 Bloqueado'}</span>
      </div>
    </div>`;
  }).join('');

  html += `<div class="achievement-divider" style="grid-column:1/-1;border-top:1px solid var(--card-border);margin:12px 0;padding-top:12px;font-size:0.7rem;font-weight:600;color:var(--text-muted);text-align:center;">🌍 Conquistas Globais</div>`;
  html += ACHIEVEMENTS_LIST.map(ach => {
    const unlocked = state.userStats.unlockedAchievements.includes(ach.id);
    return `<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-info">
        <span class="achievement-title">${ach.title}</span>
        <span class="achievement-desc">${ach.desc}</span>
        <span class="achievement-status">${unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}</span>
      </div>
    </div>`;
  }).join('');
  
  container.innerHTML = html;
}

export function unlockAchievement(id) {
  if (!state.userStats.unlockedAchievements.includes(id)) {
    state.userStats.unlockedAchievements.push(id);
    saveState();
    renderAchievementsUI();
    const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
    if (ach) {
      showToast(`🏆 Conquista desbloqueada: ${ach.title}`);
    }
  }
}

export function updatePPMHistory(modeId, wpm) {
  if (wpm <= 0) return;
  const stats = getModeStats(modeId);
  stats.ppmHistory.push(wpm);
  if (stats.ppmHistory.length > 20) stats.ppmHistory.shift();
  if (wpm > stats.bestPPM) {
    stats.bestPPM = wpm;
    const bestEl = document.getElementById('best-ppm-val');
    if (bestEl) bestEl.textContent = stats.bestPPM;
  }
  saveState();
  renderHistoryChart(modeId);
}

export function checkTimeAndStreakAchievements() {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 0 && hour < 5) unlockAchievement('night_owl');
  if (hour >= 6 && hour < 8) unlockAchievement('morning_coffee');

  const today = getLocalDateStr(now);
  if (state.userStats.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yStr = getLocalDateStr(yesterday);
    if (state.userStats.lastActiveDate === yStr) {
      state.userStats.dayStreak += 1;
    } else {
      state.userStats.dayStreak = 1;
    }
    state.userStats.lastActiveDate = today;
    saveState();
  }
  if (state.userStats.dayStreak >= 2) unlockAchievement('streak_3');
}

export function checkRoundAchievements(wpm, accuracy, currentTheme) {
  if (accuracy === 100) {
    state.userStats.perfectStreak += 1;
    state.userStats.totalPerfectRounds = (state.userStats.totalPerfectRounds || 0) + 1;
    if (state.userStats.perfectStreak >= 2) unlockAchievement('surgeon');
    if (state.userStats.totalPerfectRounds >= 10) unlockAchievement('perfect_10');
    if (state.userStats.totalPerfectRounds >= 50) unlockAchievement('perfect_50');
    if (state.userStats.totalPerfectRounds >= 100) unlockAchievement('perfect_100');
  } else {
    state.userStats.perfectStreak = 0;
  }
  if (wpm < 20 && accuracy === 100) unlockAchievement('slow_steady');
  if (wpm > 70) unlockAchievement('light_speed');

  state.userStats.recentWpms.push(wpm);
  if (state.userStats.recentWpms.length > 5) state.userStats.recentWpms.shift();
  if (state.userStats.recentWpms.length === 5) {
    const avg = state.userStats.recentWpms.reduce((a, b) => a + b, 0) / 5;
    if (avg > 50) unlockAchievement('hot_finger');
  }
  if (wpm > 60 && accuracy < 80) unlockAchievement('fast_imperfect');
  if (currentTheme === 'matrix' || currentTheme === 'amber') unlockAchievement('hacker_80s');

  checkTimeAndStreakAchievements();
  saveState();
}

export function trackThemeChange(themeName) {
  if (!state.userStats.themesUsed.includes(themeName)) {
    state.userStats.themesUsed.push(themeName);
    saveState();
  }
  if (state.userStats.themesUsed.length >= 4) unlockAchievement('chameleon');
}

export function trackSpaceKey() {
  state.userStats.spaceCount += 1;
  if (state.userStats.spaceCount >= 500) unlockAchievement('space_destroyer');
  if (state.userStats.spaceCount % 20 === 0 || state.userStats.spaceCount === 500) saveState();
}

// ========== PROGRESSÃO GLOBAL ==========

export function getXPForLevel(level) {
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

export function addGlobalXP(amount) {
  const stats = state.userStats;
  stats.globalXP = (stats.globalXP || 0) + amount;
  stats.totalTypedChars = (stats.totalTypedChars || 0) + 1;
  let needed = getXPForLevel(stats.globalLevel + 1);
  let leveledUp = false;
  while (stats.globalXP >= needed) {
    stats.globalXP -= needed;
    stats.globalLevel++;
    needed = getXPForLevel(stats.globalLevel + 1);
    leveledUp = true;
    if (stats.globalLevel >= 5) unlockAchievement('level_5');
    if (stats.globalLevel >= 10) unlockAchievement('level_10');
    if (stats.globalLevel >= 25) unlockAchievement('level_25');
    if (stats.globalLevel >= 50) unlockAchievement('level_50');
  }
  if (leveledUp) {
    showToast(`🎉 Subiu para o nível ${stats.globalLevel}!`);
  }
  saveState();
  updateGlobalLevelUI();
}

export function updateGlobalLevelUI() {
  const el = document.getElementById('global-level-display');
  if (!el) return;
  const stats = state.userStats;
  const xp = stats.globalXP || 0;
  const level = stats.globalLevel || 1;
  const nextXP = getXPForLevel(level + 1);
  const progress = Math.min(100, Math.round((xp / nextXP) * 100));
  el.innerHTML = `
    <span class="global-level-badge">Nv. ${level}</span>
    <div style="flex:1;min-width:40px;height:4px;background:var(--card-border);border-radius:4px;overflow:hidden;">
      <div class="global-xp-bar" style="width:${progress}%;height:100%;background:var(--accent);border-radius:4px;transition:width 0.4s ease;"></div>
    </div>
    <span class="global-xp-text">${xp}/${nextXP}</span>
  `;
}

function showToast(msg) {
  const old = document.querySelector('.toast-message');
  if (old) old.remove();
  const div = document.createElement('div');
  div.className = 'toast-message';
  div.innerHTML = msg;
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.3s';
    setTimeout(() => div.remove(), 300);
  }, 3000);
}