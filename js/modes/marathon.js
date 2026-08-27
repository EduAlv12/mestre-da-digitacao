// js/modes/marathon.js
import { state, SENTENCES } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id:'marathon',name:'Maratona',linear:false,hasTimer:true,
  timeLimit:60,timeLeft:60,wordsTyped:0,timerId:null,typed:'',errors:0,startTime:null,currentWord:'',wordPool:[],totalTypedChars:0,totalErrors:0,currentIndex:0,
  stopTimer(){if(this.timerId!==null){clearInterval(this.timerId);this.timerId=null;}},
  elapsedSeconds(){return this.startTime?Math.min(this.timeLimit,Math.max(0,(performance.now()-this.startTime)/1000)):0;},
  currentWpm(){const elapsed=this.elapsedSeconds();return elapsed>0?Math.round((this.totalTypedChars/5)/(elapsed/60)):0;},
  init(text){
    this.stopTimer();
    const config=({easy:{time:60},medium:{time:45},hard:{time:30}})[state.currentDifficulty]||{time:60};
    this.timeLimit=config.time;this.timeLeft=config.time;this.wordsTyped=0;this.typed='';this.errors=0;this.totalTypedChars=0;this.totalErrors=0;this.currentIndex=0;this.startTime=null;
    const source=state.currentDifficulty==='custom'?String(text||''):((SENTENCES[state.currentDifficulty]||SENTENCES.easy).join(' '));
    this.wordPool=source.split(/\s+/).map(w=>w.trim()).filter(Boolean);
    this.currentWord=this.wordPool[0]||'';this.render(this.currentWord);this.resetInput();this.updateProgress(0);this.updateUI();
  },
  render(text){const d=document.getElementById('text-display');if(!d)return;const upcoming=this.wordPool.slice(this.currentIndex+1,this.currentIndex+6);d.innerHTML=`<div class="marathon-current"><small>🏃 Maratona · palavra ${this.wordsTyped+1}</small><strong>${text}</strong></div><div class="marathon-upcoming">${upcoming.map(w=>`<span>${w}</span>`).join('')}</div>`;},
  resetInput(){const i=document.getElementById('hidden-input');if(i)i.value='';state.previousInput='';},
  updateProgress(typed){const f=document.getElementById('progress-fill'),t=document.getElementById('progress-text'),q=document.getElementById('progress-percent');const p=Math.min(100,Math.round((this.timeLeft/this.timeLimit)*100));if(f)f.style.width=`${p}%`;if(t)t.textContent=`${this.wordsTyped} palavras · ${Math.ceil(this.timeLeft)}s restantes`;if(q)q.textContent=`${Math.ceil(this.timeLeft)}s`;},
  updateUI(){const tag=document.getElementById('mode-status-tag');if(tag)tag.innerHTML=`🏃 ${Math.ceil(this.timeLeft)}s | ${this.wordsTyped} palavras | ${this.currentWpm()} PPM`;const timer=document.getElementById('timer-val');if(timer)timer.textContent=`${Math.ceil(this.timeLeft)}s`;this.updateProgress(this.typed.length);},
  startTimer(){if(this.timerId!==null||!this.startTime)return;this.timerId=setInterval(()=>{this.timeLeft=Math.max(0,this.timeLimit-this.elapsedSeconds());this.updateUI();if(this.timeLeft<=0){this.stopTimer();const accuracy=this.totalTypedChars?Math.round(((this.totalTypedChars-this.totalErrors)/this.totalTypedChars)*100):100;document.dispatchEvent(new CustomEvent('modeEndTest',{detail:{accuracy,wpm:this.currentWpm(),modeId:this.id}}));}},100);},
  nextWord(){if(!this.wordPool.length)return;this.currentIndex=(this.currentIndex+1)%this.wordPool.length;this.currentWord=this.wordPool[this.currentIndex];this.typed='';this.errors=0;this.render(this.currentWord);this.resetInput();this.updateUI();},
  handleInput(value){if(!this.startTime)this.startTime=state.startTime||performance.now();if(this.timerId===null)this.startTimer();const text=this.currentWord,prevLen=this.typed.length;this.typed=value;const chars=value.split('');let errors=0;document.querySelectorAll('#text-display .char').forEach((span,idx)=>{const typed=chars[idx],target=text[idx];span.classList.remove('correct','incorrect','current');if(typed==null){if(idx===chars.length)span.classList.add('current');}else if(typed===target)span.classList.add('correct');else{span.classList.add('incorrect');errors++;}});this.errors=errors;const accuracy=chars.length?Math.round(((chars.length-errors)/chars.length)*100):100;if(document.getElementById('accuracy-val'))document.getElementById('accuracy-val').textContent=`${accuracy}%`;if(document.getElementById('ppm-val'))document.getElementById('ppm-val').textContent=this.currentWpm();state.currentPPM=this.currentWpm();this.updateProgress(chars.length);if(chars.length>=text.length){this.totalTypedChars+=chars.length;this.totalErrors+=errors;this.wordsTyped++;this.nextWord();return{playError:false};}return{done:false,playError:chars.length>prevLen&&chars.length>0&&chars[chars.length-1]!==text[chars.length-1]};},
  reset(){this.stopTimer();const config=({easy:{time:60},medium:{time:45},hard:{time:30}})[state.currentDifficulty]||{time:60};this.timeLimit=config.time;this.timeLeft=this.timeLimit;this.wordsTyped=0;this.typed='';this.errors=0;this.startTime=null;this.totalTypedChars=0;this.totalErrors=0;this.currentIndex=0;state.previousInput='';this.updateUI();const timer=document.getElementById('timer-val');if(timer)timer.textContent=`${this.timeLimit}s`;},
  destroy(){this.stopTimer();},
  checkMedals(){if(this.wordsTyped>=50)incrementMedal(this.id,'marathon_50');if(this.wordsTyped>=100)incrementMedal(this.id,'marathon_100');},
  getMetrics(){const elapsed=this.elapsedSeconds(),wpm=elapsed>0?Math.round((this.totalTypedChars/5)/(elapsed/60)):0,accuracy=this.totalTypedChars?Math.round(((this.totalTypedChars-this.totalErrors)/this.totalTypedChars)*100):100;return{accuracy,wpm};},
  getResultMessage(accuracy,wpm){return`🏃 ${this.wordsTyped} palavras em ${this.timeLimit}s | ${accuracy}% precisão | ${wpm} PPM`;}
};