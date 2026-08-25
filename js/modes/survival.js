// js/modes/survival.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'survival', name: 'Sobrevivência', linear: true, hasTimer: true,
  lives: 5, maxLives: 5, charLife: 3, baseCharLife: 3, currentCharIndex: 0, timerId: null,
  typed: '', errors: 0, startTime: null, lastInputLength: 0,

  init(text) {
    const cfg = { easy:{lives:5,charLife:4}, medium:{lives:4,charLife:2.5}, hard:{lives:3,charLife:1.5} }[state.currentDifficulty] || {lives:5,charLife:4};
    this.stopTimer();
    this.lives=cfg.lives; this.maxLives=cfg.lives; this.baseCharLife=cfg.charLife; this.charLife=cfg.charLife;
    this.currentCharIndex=0; this.typed=''; this.errors=0; this.lastInputLength=0; this.startTime=null;
    this.render(text); this.resetInput(); this.updateProgress(0); this.updateUI();
  },
  render(text){const d=document.getElementById('text-display');if(d)d.innerHTML=text.split('').map((ch,i)=>`<span class="char ${i===0?'current':''}">${ch}</span>`).join('');},
  resetInput(){const i=document.getElementById('hidden-input');if(i)i.value='';},
  updateProgress(typed){const total=state.currentText.length||1,p=Math.min(100,Math.round(typed/total*100)),f=document.getElementById('progress-fill'),t=document.getElementById('progress-text'),q=document.getElementById('progress-percent');if(f)f.style.width=`${p}%`;if(t)t.textContent=`${typed} / ${state.currentText.length} caracteres`;if(q)q.textContent=`${p}%`;},
  updateUI(){const tag=document.getElementById('mode-status-tag');if(tag){const hearts='❤️'.repeat(Math.max(0,this.lives))+'🖤'.repeat(Math.max(0,this.maxLives-this.lives));tag.innerHTML=`💀 ${hearts} ⏱️ ${Math.max(0,this.charLife).toFixed(1)}s`; }},
  getCurrentLifeTime(){return Math.max(1,this.baseCharLife-this.currentCharIndex*0.05);},
  stopTimer(){if(this.timerId!==null){clearInterval(this.timerId);this.timerId=null;}},
  resetCharTimer(){this.stopTimer();this.charLife=this.getCurrentLifeTime();this.startTimer();},
  startTimer(){this.stopTimer();let remaining=Math.max(0,this.charLife);this.timerId=setInterval(()=>{remaining=Math.max(0,remaining-0.1);this.charLife=remaining;this.updateUI();if(remaining>0)return;this.lives=Math.max(0,this.lives-1);if(this.lives<=0){this.stopTimer();const chars=this.typed.length,accuracy=chars?Math.round(((chars-this.errors)/chars)*100):100,elapsed=this.startTime?Math.max(1,(performance.now()-this.startTime)/1000):1,wpm=Math.round((chars/5)/(elapsed/60));document.dispatchEvent(new CustomEvent('modeEndTest',{detail:{accuracy,wpm,modeId:this.id}}));return;}this.resetCharTimer();},100);},
  handleInput(value){const text=state.currentText,prevLen=this.typed.length;this.typed=value;const chars=value.split('');let errors=0;document.querySelectorAll('#text-display .char').forEach((span,idx)=>{const typed=chars[idx],target=text[idx];span.classList.remove('correct','incorrect','current');if(typed==null){if(idx===chars.length)span.classList.add('current');}else if(typed===target)span.classList.add('correct');else{span.classList.add('incorrect');errors++;}});this.errors=errors;this.updateProgress(chars.length);const accuracy=chars.length?Math.round(((chars.length-errors)/chars.length)*100):100;if(!this.startTime&&chars.length){this.startTime=performance.now();this.charLife=this.baseCharLife;this.startTimer();}const elapsed=this.startTime?Math.max(1,(performance.now()-this.startTime)/1000):1,wpm=Math.round((chars.length/5)/(elapsed/60));const av=document.getElementById('accuracy-val'),pv=document.getElementById('ppm-val');if(av)av.textContent=`${accuracy}%`;if(pv)pv.textContent=wpm;state.currentPPM=wpm;const lastChar=chars[chars.length-1],lastTarget=text[chars.length-1];if(chars.length>prevLen&&chars.length&&lastChar===lastTarget){this.currentCharIndex++;this.resetCharTimer();}if(chars.length>=text.length){this.stopTimer();return{done:true,accuracy,wpm,playError:false};}return{done:false,playError:chars.length>prevLen&&chars.length>0&&lastChar!==lastTarget};},
  reset(){this.stopTimer();const cfg={easy:{lives:5,charLife:4},medium:{lives:4,charLife:2.5},hard:{lives:3,charLife:1.5}}[state.currentDifficulty]||{lives:5,charLife:4};this.lives=cfg.lives;this.maxLives=cfg.lives;this.charLife=cfg.charLife;this.baseCharLife=cfg.charLife;this.currentCharIndex=0;this.typed='';this.errors=0;this.lastInputLength=0;this.startTime=null;this.updateUI();},
  destroy(){this.stopTimer();},
  checkMedals(){if(this.lives===this.maxLives)incrementMedal(this.id,'survive_5');if(this.lives===1)incrementMedal(this.id,'survive_1');},
  getMetrics(){const chars=this.typed.length,accuracy=chars?Math.round(((chars-this.errors)/chars)*100):100,elapsed=this.startTime?Math.max(1,(performance.now()-this.startTime)/1000):1;return{accuracy,wpm:Math.round((chars/5)/(elapsed/60))};},
  getResultMessage(accuracy,wpm){return`💀 Vidas restantes: ${this.lives} | ${accuracy}% precisão, ${wpm} PPM`;}
};