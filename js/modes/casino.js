// js/modes/casino.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'casino', name: 'Cassino', linear: true, hasTimer: false,
  chips: 100, bet: 10, typed: '', errors: 0, startTime: null, winStreak: 0,

  init(text) {
    const diff = state.currentDifficulty;
    const difficultyConfig = { easy:{bet:5}, medium:{bet:10}, hard:{bet:20} };
    const config = difficultyConfig[diff] || difficultyConfig.easy;
    const savedChips = Number.parseInt(localStorage.getItem('casino_chips'), 10);
    this.chips = Number.isFinite(savedChips) && savedChips >= 0 ? savedChips : 100;
    const savedStreak = Number.parseInt(localStorage.getItem('casino_win_streak'), 10);
    this.winStreak = Number.isFinite(savedStreak) && savedStreak >= 0 ? savedStreak : 0;
    this.bet = this.chips > 0 ? Math.min(config.bet, this.chips) : 0;
    this.typed = ''; this.errors = 0; this.startTime = null;
    this.render(text); this.resetInput(); this.updateProgress(0); this.updateUI();
  },

  render(text) {
    const display = document.getElementById('text-display');
    if (display) display.innerHTML = text.split('').map((ch,i)=>`<span class="char ${i===0?'current':''}">${ch}</span>`).join('');
  },
  resetInput(){const input=document.getElementById('hidden-input');if(input)input.value='';},
  updateProgress(typed){const total=state.currentText.length,percent=total?Math.min(100,Math.round(typed/total*100)):0,fill=document.getElementById('progress-fill'),textEl=document.getElementById('progress-text'),percentEl=document.getElementById('progress-percent');if(fill)fill.style.width=`${percent}%`;if(textEl)textEl.textContent=`${typed} / ${total} caracteres`;if(percentEl)percentEl.textContent=`${percent}%`;},
  updateUI(){const tag=document.getElementById('mode-status-tag');if(tag)tag.innerHTML=`💰 ${this.chips} fichas | Aposta: ${this.bet}`;},
  handleInput(value){
    const text=state.currentText,prevLen=this.typed.length;this.typed=value;if(!this.startTime&&value.length>0)this.startTime=performance.now();
    const chars=value.split('');let errors=0;document.querySelectorAll('#text-display .char').forEach((span,idx)=>{const typed=chars[idx],target=text[idx];span.classList.remove('correct','incorrect','current');if(typed==null){if(idx===chars.length)span.classList.add('current');}else if(typed===target)span.classList.add('correct');else{span.classList.add('incorrect');errors++;}});
    this.errors=errors;this.updateProgress(chars.length);
    const accuracy=chars.length>0?Math.max(0,Math.round(((chars.length-errors)/chars.length)*100)):100;const accuracyEl=document.getElementById('accuracy-val');if(accuracyEl)accuracyEl.textContent=`${accuracy}%`;
    const elapsedMs=this.startTime?Math.max(1,performance.now()-this.startTime):1,wpm=Math.round((chars.length/5)/(elapsedMs/60000)),ppmEl=document.getElementById('ppm-val');if(ppmEl)ppmEl.textContent=wpm;state.currentPPM=wpm;
    if(chars.length>=text.length){
      let win=0;
      if(accuracy===100){win=this.bet*2;this.winStreak++;}
      else if(accuracy>=90){win=this.bet;this.winStreak++;}
      else if(accuracy>=70){this.winStreak=0;}
      else{win=-this.bet;this.winStreak=0;}
      this.chips=Math.max(0,this.chips+win);
      localStorage.setItem('casino_chips',String(this.chips));localStorage.setItem('casino_win_streak',String(this.winStreak));
      this.updateUI();return{done:true,accuracy,wpm,playError:false};
    }
    return{done:false,playError:chars.length>prevLen&&chars.length>0&&chars[chars.length-1]!==text[chars.length-1]};
  },
  reset(){this.typed='';this.errors=0;this.startTime=null;this.updateUI();},
  checkMedals(){if(this.chips>=500)incrementMedal(this.id,'casino_500');if(this.winStreak>=3)incrementMedal(this.id,'casino_lucky');},
  getMetrics(){const chars=this.typed.length,accuracy=chars>0?Math.max(0,Math.round(((chars-this.errors)/chars)*100)):100,elapsedMs=this.startTime?Math.max(1,performance.now()-this.startTime):1,wpm=Math.round((chars/5)/(elapsedMs/60000));return{accuracy,wpm};},
  getResultMessage(accuracy,wpm){return`💰 ${this.chips} fichas | ${accuracy}% precisão, ${wpm} PPM`;}
};