// js/modes/marathon.js
import { state, SENTENCES } from '../modules/utils.js';
import { incrementMedal } from '../modules/stats.js';

export default {
  id:'marathon', name:'Maratona', linear:true, hasTimer:true,
  timeLimit:60,timeLeft:60,wordsTyped:0,timerId:null,typed:'',errors:0,startTime:null,currentWord:'',wordPool:[],totalTypedChars:0,totalErrors:0,

  init(text){
    const config=({easy:{time:60},medium:{time:45},hard:{time:30}})[state.currentDifficulty]||{time:60};
    this.timeLimit=config.time;this.timeLeft=config.time;this.wordPool=(state.currentDifficulty==='custom'?text:(SENTENCES[state.currentDifficulty]||SENTENCES.easy).join(' ')).split(/\s+/).map(w=>w.trim()).filter(Boolean);
    this.currentWord=this.wordPool[0]||'';this.wordsTyped=0;this.typed='';this.errors=0;this.totalTypedChars=0;this.totalErrors=0;this.startTime=null;
    this.render(this.currentWord);this.resetInput();this.updateProgress(0);this.updateUI();
  },
  render(text){const d=document.getElementById('text-display');if(d)d.innerHTML=text.split('').map((ch,i)=>`<span class="char ${i===0?'current':''}">${ch}</span>`).join('');},
  resetInput(){const i=document.getElementById('hidden-input');if(i)i.value='';},
  updateProgress(typed){const total=this.currentWord.length||1,p=Math.min(100,Math.round(typed/total*100)),f=document.getElementById('progress-fill'),t=document.getElementById('progress-text'),q=document.getElementById('progress-percent');if(f)f.style.width=`${p}%`;if(t)t.textContent=`${typed} / ${this.currentWord.length} caracteres`;if(q)q.textContent=`${p}%`;},
  updateUI(){const tag=document.getElementById('mode-status-tag');if(tag)tag.innerHTML=`🏃 ${this.timeLeft}s | Palavras: ${this.wordsTyped}`;const timer=document.getElementById('timer-val');if(timer)timer.textContent=`${this.timeLeft}s`;},
  startTimer(){if(this.timerId)clearInterval(this.timerId);this.timerId=setInterval(()=>{this.timeLeft=Math.max(0,this.timeLeft-1);this.updateUI();if(this.timeLeft<=0){clearInterval(this.timerId);this.timerId=null;const elapsed=Math.max(1,this.timeLimit-this.timeLeft);const accuracy=this.totalTypedChars?Math.round(((this.totalTypedChars-this.totalErrors)/this.totalTypedChars)*100):100;const wpm=Math.round(this.wordsTyped/(this.timeLimit/60));document.dispatchEvent(new CustomEvent('modeEndTest',{detail:{accuracy,wpm,modeId:this.id}}));}},1000);},
  nextWord(){this.currentWord=this.wordPool[Math.floor(Math.random()*this.wordPool.length)]||'';this.typed='';this.errors=0;this.render(this.currentWord);this.resetInput();this.updateProgress(0);},
  handleInput(value){
    if(!this.startTime&&value.length>0){this.startTime=performance.now();this.startTimer();}
    const text=this.currentWord,prevLen=this.typed.length;this.typed=value;const chars=value.split('');let errors=0;
    document.querySelectorAll('#text-display .char').forEach((span,idx)=>{const typed=chars[idx],target=text[idx];span.classList.remove('correct','incorrect','current');if(typed==null){if(idx===chars.length)span.classList.add('current');}else if(typed===target)span.classList.add('correct');else{span.classList.add('incorrect');errors++;}});
    this.errors=errors;this.updateProgress(chars.length);
    const accuracy=chars.length?Math.round(((chars.length-errors)/chars.length)*100):100;
    const elapsed=this.startTime?Math.max(1,(performance.now()-this.startTime)/1000):1;const wpm=Math.round(this.wordsTyped/(elapsed/60));
    const av=document.getElementById('accuracy-val'),pv=document.getElementById('ppm-val');if(av)av.textContent=`${accuracy}%`;if(pv)pv.textContent=wpm;state.currentPPM=wpm;
    if(chars.length>=text.length){this.totalTypedChars+=chars.length;this.totalErrors+=errors;this.wordsTyped++;this.updateUI();this.nextWord();return {playError:false};}
    return {done:false,playError:chars.length>prevLen&&chars.length>0&&chars[chars.length-1]!==text[chars.length-1]};
  },
  reset(){if(this.timerId)clearInterval(this.timerId);this.timerId=null;this.timeLeft=this.timeLimit;this.wordsTyped=0;this.typed='';this.errors=0;this.startTime=null;this.totalTypedChars=0;this.totalErrors=0;this.updateUI();const timer=document.getElementById('timer-val');if(timer)timer.textContent=`${this.timeLimit}s`;},
  destroy(){if(this.timerId)clearInterval(this.timerId);this.timerId=null;},
  checkMedals(){if(this.wordsTyped>=50)incrementMedal(this.id,'marathon_50');if(this.wordsTyped>=100)incrementMedal(this.id,'marathon_100');},
  getMetrics(){const elapsed=this.startTime?Math.max(1,(performance.now()-this.startTime)/1000):1,wpm=Math.round(this.wordsTyped/(elapsed/60)),accuracy=this.totalTypedChars?Math.round(((this.totalTypedChars-this.totalErrors)/this.totalTypedChars)*100):100;return {accuracy,wpm};},
  getResultMessage(accuracy,wpm){return `🏃 ${this.wordsTyped} palavras | ${accuracy}% precisão | ${wpm} PPM`;}
};