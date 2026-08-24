// js/modes/rpg.js
import { state, SENTENCES } from '../modules/utils.js';
import { incrementMedal, addGlobalXP, unlockAchievement } from '../modules/stats.js';
import { audioEngine } from '../modules/audio.js';

const MONSTER_POOL = [
  { name: '🦇 Morcego Sombrio', hpBase: 80, xpBase: 15, attack: 2, isBoss: false },
  { name: '🐺 Lobo Selvagem', hpBase: 120, xpBase: 22, attack: 3, isBoss: false },
  { name: '🧟 Zumbi Pestilento', hpBase: 160, xpBase: 30, attack: 4, isBoss: false },
  { name: '🔥 Elemental de Fogo', hpBase: 210, xpBase: 40, attack: 5, isBoss: false },
  { name: '👹 Demônio das Trevas', hpBase: 280, xpBase: 55, attack: 7, isBoss: false },
  { name: '🐉 Dragão Ancião', hpBase: 400, xpBase: 80, attack: 10, isBoss: false },
];

const BOSS_POOL = [
  { name: '👑 Rei Demônio', hpBase: 600, xpBase: 150, attack: 15, isBoss: true },
  { name: '🐲 Dragão de Fogo', hpBase: 750, xpBase: 200, attack: 18, isBoss: true },
  { name: '🧙‍♂️ Mago das Trevas', hpBase: 500, xpBase: 180, attack: 20, isBoss: true },
];

export default {
  id: 'rpg',
  name: 'RPG',
  linear: false,
  hasTimer: false,

  player: {
    level: 1,
    xp: 0,
    xpToNext: 10,
    hp: 100,
    maxHp: 100,
    attack: 3,
  },
  monster: null,
  typed: '',
  errors: 0,
  startTime: null,
  totalCorrect: 0,
  battleOver: false,
  combo: 0,
  maxCombo: 0,
  battleCount: 0,
  comboBonus: 0,
  isBossBattle: false,
  playerHP: 100,
  maxPlayerHP: 100,

  init(text) {
    const continueBtn = document.getElementById('rpg-continue-btn');
    if (continueBtn && !continueBtn.dataset.bound) {
      continueBtn.dataset.bound = 'true';
      continueBtn.addEventListener('click', () => this.continueBattle());
    }
    const diff = state.currentDifficulty;
    const difficultyConfig = {
      easy:   { playerAttack: 7, monsterHpMult: 1.0, xpMult: 1.0 },
      medium: { playerAttack: 6, monsterHpMult: 1.15, xpMult: 1.2 },
      hard:   { playerAttack: 5, monsterHpMult: 1.3, xpMult: 1.5 }
    };
    const config = difficultyConfig[diff] || difficultyConfig.easy;

    const saved = localStorage.getItem('rpg_player');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        this.player = { ...this.player, ...p };
      } catch (_) {}
    }
    this.player.attack = config.playerAttack;
    this.player.hp = this.player.maxHp;
    this.playerHP = this.player.maxHp;
    this.maxPlayerHP = this.player.maxHp;

    this.typed = '';
    this.errors = 0;
    this.totalCorrect = 0;
    this.battleOver = false;
    this.combo = 0;
    this.maxCombo = 0;
    this.battleCount = parseInt(localStorage.getItem('rpg_battleCount')) || 0;
    this.startTime = performance.now();

    this.spawnMonster(config);
    this.resetInput();
    this.updateProgress(0);
    this.updateUI();
  },

  spawnMonster(config) {
    const isBoss = (this.battleCount > 0 && this.battleCount % 5 === 0);
    this.isBossBattle = isBoss;
    let pool = isBoss ? BOSS_POOL : MONSTER_POOL;
    let maxIndex = Math.min(this.player.level - 1, pool.length - 1);
    if (maxIndex < 0) maxIndex = 0;
    const index = Math.floor(Math.random() * (maxIndex + 1));
    const base = pool[index];

    const levelScale = 1 + (this.player.level - 1) * 0.15;
    const hp = Math.floor(base.hpBase * levelScale * config.monsterHpMult);
    const xpReward = Math.floor(base.xpBase * levelScale * config.xpMult);
    const finalXp = isBoss ? Math.floor(xpReward * 2) : xpReward;

    const diff = state.currentDifficulty === 'custom' ? 'easy' : (state.currentDifficulty || 'easy');
    const sentences = SENTENCES[diff] || SENTENCES.easy;
    const text = sentences[Math.floor(Math.random() * sentences.length)];

    this.monster = {
      name: base.name,
      hp,
      maxHp: hp,
      xpReward: finalXp,
      attack: base.attack + (isBoss ? 5 : 0),
      isBoss,
      text,
    };

    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = text.split('').map((ch, i) =>
        `<span class="char ${i === 0 ? 'current' : ''}">${ch}</span>`
      ).join('');
    }
    document.getElementById('hidden-input').value = '';
    this.typed = '';
    this.errors = 0;
    this.battleOver = false;
    this.combo = 0;
    const continueBtn = document.getElementById('rpg-continue-btn');
    if (continueBtn) continueBtn.classList.add('hidden');
    this.updateUI();
  },

  renderSentence(text) {
    const display = document.getElementById('text-display');
    if (display) {
      display.innerHTML = text.split('').map((ch, i) =>
        `<span class="char ${i === 0 ? 'current' : ''}">${ch}</span>`
      ).join('');
    }
    const input = document.getElementById('hidden-input');
    if (input) input.value = '';
    this.typed = '';
    this.errors = 0;
    this.startTime = performance.now();
    this.updateProgress(0);
    const accuracy = document.getElementById('accuracy-val');
    if (accuracy) accuracy.textContent = '100%';
  },

  resetSentenceForSameMonster() {
    if (!this.monster) return;
    const diff = state.currentDifficulty === 'custom' ? 'easy' : (state.currentDifficulty || 'easy');
    const sentences = SENTENCES[diff] || SENTENCES.easy;
    const previous = this.monster.text;
    let text = sentences[Math.floor(Math.random() * sentences.length)];
    if (sentences.length > 1) {
      let guard = 0;
      while (text === previous && guard++ < 10) text = sentences[Math.floor(Math.random() * sentences.length)];
    }
    this.monster.text = text;
    this.battleOver = false;
    this.renderSentence(text);
    this.updateUI();
  },

  resetInput() {
    document.getElementById('hidden-input').value = '';
  },

  updateProgress(typed) {
    const total = this.monster.text.length;
    const percent = Math.min(100, Math.round((typed / total) * 100));
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('progress-text').textContent = `${typed} / ${total} caracteres`;
    document.getElementById('progress-percent').textContent = `${percent}%`;
  },

  updateUI() {
    const tag = document.getElementById('mode-status-tag');
    if (tag) {
      const p = this.player;
      const m = this.monster;
      const hpPercent = Math.round((m.hp / m.maxHp) * 100);
      const hpBar = '❤️'.repeat(Math.max(0, Math.floor(this.playerHP / 10))) + '🖤'.repeat(Math.max(0, 10 - Math.floor(this.playerHP / 10)));
      const comboStr = this.combo > 0 ? `🔥 ${this.combo}x` : '';
      const bossTag = m.isBoss ? '👑 BOSS' : '';
      tag.innerHTML =
        `⚔️ Lv.${p.level} (${p.xp}/${p.xpToNext} XP) &nbsp;|&nbsp; ${hpBar} &nbsp;|&nbsp; ${comboStr} &nbsp;|&nbsp; 🐉 ${m.name} HP: ${hpPercent}% ${bossTag}`;
    }
  },

  defeatMonster() {
    if (this.battleOver) return;
    this.battleOver = true;
    this.monster.hp = 0;
    const xpGain = this.monster.xpReward + Math.floor(this.combo * 2);
    this.player.xp += xpGain;
    addGlobalXP(xpGain);
    this.battleCount++;
    localStorage.setItem('rpg_battleCount', String(this.battleCount));
    if (this.battleCount >= 10) unlockAchievement('battle_10');
    if (this.battleCount >= 50) unlockAchievement('battle_50');
    if (this.battleCount >= 100) unlockAchievement('battle_100');
    if (this.battleCount >= 50) unlockAchievement('rpg_win_50');
    
    const dropChance = 0.3;
    let rewardMsg = '';
    if (Math.random() < dropChance) {
      const heal = Math.floor(this.player.maxHp * 0.2);
      this.playerHP = Math.min(this.player.maxHp, this.playerHP + heal);
      rewardMsg = ` +💚${heal} HP (poção)`;
    }
    this.checkLevelUp();

    const msg = document.getElementById('result-message');
    if (msg) {
      msg.className = 'result-message success';
      msg.innerHTML = `💀 ${this.monster.name} derrotado! +${xpGain} XP${rewardMsg}`;
      msg.classList.remove('hidden');
    }
    const continueBtn = document.getElementById('rpg-continue-btn');
    if (continueBtn) continueBtn.classList.remove('hidden');
    const input = document.getElementById('hidden-input');
    if (input) input.disabled = true;
    this.updateUI();
    localStorage.setItem('rpg_player', JSON.stringify(this.player));
  },

  continueBattle() {
    const msg = document.getElementById('result-message');
    if (msg) msg.classList.add('hidden');
    const diff = state.currentDifficulty;
    const config = {
      easy: { playerAttack: 7, monsterHpMult: 1.0, xpMult: 1.0 },
      medium: { playerAttack: 6, monsterHpMult: 1.15, xpMult: 1.2 },
      hard: { playerAttack: 5, monsterHpMult: 1.3, xpMult: 1.5 }
    }[diff] || { playerAttack: 7, monsterHpMult: 1.0, xpMult: 1.0 };
    this.spawnMonster(config);
    this.resetInput();
    const input = document.getElementById('hidden-input');
    if (input) input.disabled = false;
    document.getElementById('accuracy-val').textContent = '100%';
    return { playError: false, playSound: false };
  },

  handleInput(value) {
    if (this.battleOver) return { playError: false, playSound: false };
    const prevLen = this.typed.length;
    this.typed = value;
    const chars = value.split('');
    const text = this.monster.text;

    let errors = 0;
    const spans = document.querySelectorAll('#text-display .char');
    spans.forEach((span, idx) => {
      const typed = chars[idx];
      const target = text[idx];
      span.classList.remove('correct', 'incorrect', 'current');
      if (typed == null) {
        if (idx === chars.length) span.classList.add('current');
      } else if (typed === target) {
        span.classList.add('correct');
        span.style.animation = 'none';
        void span.offsetHeight;
        span.style.animation = 'popCorrect 0.1s ease';
      } else {
        span.classList.add('incorrect');
        span.style.animation = 'shake 0.1s ease';
        errors++;
      }
    });
    this.errors = errors;
    this.updateProgress(chars.length);

    const accuracy = chars.length > 0 ? Math.round(((chars.length - errors) / chars.length) * 100) : 100;
    document.getElementById('accuracy-val').textContent = `${accuracy}%`;

    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars.length / 5) / (elapsed / 60));
    document.getElementById('ppm-val').textContent = wpm;
    state.currentPPM = wpm;

    const lastChar = chars[chars.length - 1];
    const lastTarget = text[chars.length - 1];
    if (chars.length > prevLen && chars.length > 0) {
      if (lastChar === lastTarget) {
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        if (this.combo % 5 === 0) {
          this.comboBonus += 1;
          const msg = document.getElementById('result-message');
          if (msg) {
            msg.className = 'result-message success';
            msg.innerHTML = `🔥 Combo x${this.combo}! +${this.comboBonus} de dano extra`;
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 1200);
          }
          audioEngine.playKey(true);
        }
        this.totalCorrect++;
      } else {
        this.combo = 0;
        this.comboBonus = 0;
        const monsterDamage = Math.max(1, this.monster.attack - Math.floor(this.player.level / 2));
        this.playerHP -= monsterDamage;
        if (this.playerHP < 0) this.playerHP = 0;
        const msg = document.getElementById('result-message');
        if (msg) {
          msg.className = 'result-message warning';
          msg.innerHTML = `💥 Erro! Perdeu combo. Monstro causou ${monsterDamage} de dano.`;
          msg.classList.remove('hidden');
          setTimeout(() => msg.classList.add('hidden'), 1000);
        }
        audioEngine.playErrorSound();
        this.updateUI();
        if (this.playerHP <= 0) {
          this.playerDeath();
          return { playError: true, playSound: false };
        }
      }
    }

    if (chars.length >= text.length && this.monster.hp > 0) {
      const baseAttack = this.player.attack + this.comboBonus;
      let crit = false;
      if (this.combo >= 10 && accuracy === 100) {
        crit = true;
      } else if (this.combo >= 5 && Math.random() < 0.2) {
        crit = true;
      }
      let damage = baseAttack + Math.floor(this.combo / 3);
      if (crit) {
        damage = Math.floor(damage * 1.8);
        const msg = document.getElementById('result-message');
        if (msg) {
          msg.className = 'result-message success';
          msg.innerHTML = `💥 CRÍTICO! +${damage} de dano!`;
          msg.classList.remove('hidden');
          setTimeout(() => msg.classList.add('hidden'), 1000);
        }
        audioEngine.playKey(true);
      }
      this.monster.hp -= damage;
      this.updateUI();
      if (this.monster.hp <= 0) {
        this.defeatMonster();
        return { playError: false, playSound: false };
      } else {
        this.resetSentenceForSameMonster();
      }
    }

    return { playError: false, playSound: false };
  },

  playerDeath() {
    this.playerHP = this.player.maxHp;
    const xpLoss = Math.floor(state.userStats.globalXP * 0.1);
    state.userStats.globalXP = Math.max(0, state.userStats.globalXP - xpLoss);
    this.player.xp = Math.max(0, this.player.xp - Math.floor(this.player.xp * 0.1));
    const msg = document.getElementById('result-message');
    if (msg) {
      msg.className = 'result-message warning';
      msg.innerHTML = `💀 Você morreu! Perdeu ${xpLoss} XP global.`;
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 2000);
    }
    const continueBtn = document.getElementById('rpg-continue-btn');
    if (continueBtn) continueBtn.classList.remove('hidden');
    const input = document.getElementById('hidden-input');
    if (input) input.disabled = true;
    this.updateUI();
    localStorage.setItem('rpg_player', JSON.stringify(this.player));
    localStorage.setItem('mestre_user_stats', JSON.stringify(state.userStats));
  },

  checkLevelUp() {
    const p = this.player;
    while (p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext;
      p.level++;
      p.xpToNext = Math.floor(p.xpToNext * 1.5);
      p.maxHp += 10;
      p.hp = p.maxHp;
      this.playerHP = p.maxHp;
      this.maxPlayerHP = p.maxHp;
      p.attack += 1;
      const msg = document.getElementById('result-message');
      if (msg) {
        msg.className = 'result-message success';
        msg.innerHTML = `🎉 UP! Nível ${p.level}! Ataque +1, HP +10`;
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 2000);
      }
      localStorage.setItem('rpg_player', JSON.stringify(p));
    }
    this.updateUI();
  },

  reset() {
    const continueBtn = document.getElementById('rpg-continue-btn');
    if (continueBtn) continueBtn.classList.add('hidden');
    this.battleOver = false;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboBonus = 0;
    this.typed = '';
    this.errors = 0;
    this.totalCorrect = 0;
    this.startTime = performance.now();
    this.playerHP = this.player.maxHp;
    this.maxPlayerHP = this.player.maxHp;
    const diff = state.currentDifficulty;
    const config = {
      easy:   { playerAttack: 7, monsterHpMult: 1.0, xpMult: 1.0 },
      medium: { playerAttack: 6, monsterHpMult: 1.15, xpMult: 1.2 },
      hard:   { playerAttack: 5, monsterHpMult: 1.3, xpMult: 1.5 }
    }[diff] || { playerAttack: 7, monsterHpMult: 1.0, xpMult: 1.0 };
    this.spawnMonster(config);
    this.updateUI();
  },

  destroy() {
    localStorage.setItem('rpg_player', JSON.stringify(this.player));
  },

  checkMedals(accuracy, wpm) {
    if (this.player.level >= 5) incrementMedal(this.id, 'rpg_lv5');
    if (this.player.level >= 10) incrementMedal(this.id, 'rpg_lv10');
    if (this.totalCorrect >= 100) incrementMedal(this.id, 'rpg_100_hits');
  },

  getMetrics() {
    const chars = this.typed.length;
    const accuracy = chars > 0 ? Math.round(((chars - this.errors) / chars) * 100) : 100;
    const elapsed = Math.max(1, Math.floor((performance.now() - this.startTime) / 1000));
    const wpm = Math.round((chars / 5) / (elapsed / 60));
    return { accuracy, wpm };
  },

  getResultMessage(accuracy, wpm) {
    return `⚔️ Nível ${this.player.level} | ${this.totalCorrect} acertos | ${accuracy}% precisão, ${wpm} PPM`;
  }
};