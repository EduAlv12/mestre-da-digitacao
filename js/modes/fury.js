// js/modes/fury.js
import { state } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id: 'fury', name: 'Fúria', linear: true, hasTimer: false,
  typed: '', errors: 0, startTime: null, streak: 0, maxStreak: 0,
  furyLevel: 0, targetPPM: 20, basePPM: 20, speedIncrement: 2, streakThreshold: 10,
  messageTimeout: null,

  init(text) {
    this.clearMessageTimeout();
    const config = { easy:{threshold:10,increment:2,basePPM:20}, medium:{threshold:8,increment:3,basePPM:25}, hard:{threshold:5,increment:5,basePPM:30} }[state.currentDifficulty] || {threshold:10,increment:2,basePPM:20};
    this.streakThreshold=config.threshold; this.speedIncrement=config.increment; this.basePPM=config.basePPM; this.targetPPM=config.basePPM;
    this.typed=''; this.errors=0; this.streak=0; this.maxStreak=0; this.furyLevel=0; this.startTime=null;
    this.render(text); this.resetInput(); this.updateProgress(0); this.updateUI();
  },
  render(text){const d=document.getElementById('text-display');if(d)d.innerHTML=text.split('').map((ch,i)=>`<span class="char ${i===0?'current':''}">${ch}</span>`).join('');},
  resetInput(){const i=document.getElementById('hidden-input');if(i)i.value='';},
  updateProgress(typed){const total=state.currentText.length||1,p=Math.min(100,Math.round(typed/total*100)),f=document.getElementById('progress-fill'),t=document.getElementById('progress-text'),q=document.getElementById('progress-percent');if(f)f.style.width=`${p}%`;if(t)t.textContent=`${typed} / ${state.currentText.length} caracteres`;if(q)q.textContent=`${p}%`;},
  updateUI(){const tag=document.getElementById('mode-status-tag');if(tag)tag.innerHTML=`🔥 Streak: ${this.streak} | Nível ${this.furyLevel} (🎯 ${this.targetPPM} PPM)`;},
  clearMessageTimeout(){if(this.messageTimeout!==null){clearTimeout(this.messageTimeout);this.messageTimeout=null;}},
  handleInput(value){
    const text=state.currentText;if(!text)return{done:false,playError:false};
    if(!this.startTime&&value.length>0)this.startTime=performance.now();
    const prevLen=this.typed.length;this.typed=value;const chars=value.split('');let errors=0;
    document.querySelectorAll('#text-display .char').forEach((span,idx)=>{const typed=chars[idx],target=text[idx];span.classList.remove('correct','incorrect','current');if(typed==null){if(idx===chars.length)span.classList.add('current');}else if(typed===target)span.classList.add('correct');else{span.classList.add('incorrect');errors++;}});
    this.errors=errors;this.updateProgress(chars.length);
    const accuracy=chars.length?Math.round(((chars.length-errors)/chars.length)*100):100,av=document.getElementById('accuracy-val');if(av)av.textContent=`${accuracy}%`;
    const elapsed=this.startTime?Math.max(.001,(performance.now()-this.startTime)/1000):.001,wpm=Math.round((chars.length/5)/(elapsed/60)),pv=document.getElementById('ppm-val');if(pv)pv.textContent=wpm;state.currentPPM=wpm;
    const lastChar=chars[chars.length-1],lastTarget=text[chars.length-1];
    if(chars.length>prevLen&&chars.length){if(lastChar===lastTarget){this.streak++;this.maxStreak=Math.max(this.maxStreak,this.streak);if(this.streak%this.streakThreshold===0){this.furyLevel++;this.targetPPM+=this.speedIncrement;const msg=document.getElementById('result-message');if(msg){this.clearMessageTimeout();msg.className='result-message success';msg.innerHTML=`⚡ Fúria Nível ${this.furyLevel}! Nova meta: ${this.targetPPM} PPM`;msg.classList.remove('hidden');this.messageTimeout=setTimeout(()=>{this.messageTimeout=null;msg.classList.add('hidden');},1500);}}}else{this.streak=0;this.furyLevel=0;this.targetPPM=this.basePPM;}this.updateUI();}
    if(chars.length>=text.length)return{done:true,accuracy,wpm,playError:false};
    return{done:false,playError:chars.length>prevLen&&chars.length>0&&lastChar!==lastTarget};
  },
  reset(){this.clearMessageTimeout();this.typed='';this.errors=0;this.startTime=null;this.streak=0;this.maxStreak=0;this.furyLevel=0;this.targetPPM=this.basePPM;},
  destroy(){this.clearMessageTimeout();},
  checkMedals(){if(this.maxStreak>=50)incrementMedal(this.id,'fury_50');if(this.maxStreak>=100)incrementMedal(this.id,'fury_100');},
  getMetrics(){const chars=this.typed.length,accuracy=chars?Math.round(((chars-this.errors)/chars)*100):100,elapsed=this.startTime?Math.max(.001,(performance.now()-this.startTime)/1000):.001;return{accuracy,wpm:Math.round((chars/5)/(elapsed/60))};},
  getResultMessage(accuracy,wpm){return`🔥 Streak máximo: ${this.maxStreak} | ${accuracy}% precisão, ${wpm} PPM`;}
};