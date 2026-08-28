// js/modes/wave.js
import { state } from '../modules/utils.js';
import { getNextSentence } from '../modules/sentence-engine.js';
import { incrementMedal } from '../modules/stats.js';

const CONFIG = {
  easy: { timeForWord: 5, wordCount: 6 },
  medium: { timeForWord: 3.5, wordCount: 8 },
  hard: { timeForWord: 2, wordCount: 10 }
};

export default {
  id:'wave',name:'Onda',linear:false,hasTimer:true,
  waveIndex:0,words:[],currentWord:'',waveTimer:null,timeForWord:5,timeLeft:5,startTime:null,errors:0,correctChars:0,attemptedChars:0,totalWords:0,lastInputLength:0,
  stopTimer(){if(this.waveTimer!==null){clearInterval(this.waveTimer);this.waveTimer=null;}},
  init(){
    const difficulty=CONFIG[state.currentDifficulty]?state.currentDifficulty:'easy';
    const config=CONFIG[difficulty];
    this.stopTimer();this.timeForWord=config.timeForWord;
    this.waveIndex=0;this.startTime=null;this.errors=0;this.correctChars=0;this.attemptedChars=0;this.lastInputLength=0;
    this.words=[];this.totalWords=config.wordCount;
    this.nextWord();
  },
  nextWord(){
    this.stopTimer();
    if(this.waveIndex>=this.totalWords){
      const elapsed=this.startTime?Math.max(0.001,(performance.now()-this.startTime)/1000):0.001;
      const wpm=Math.round((this.correctChars/5)/(elapsed/60));
      const accuracy=this.attemptedChars?Math.round((this.correctChars/this.attemptedChars)*100):100;
      document.dispatchEvent(new CustomEvent('modeEndTest',{detail:{accuracy,wpm,modeId:this.id}}));
      return;
    }
    // Cada onda recebe uma nova palavra proveniente de uma nova frase do banco.
    // A escolha respeita dificuldade, categoria do modo e anti-repetição.
    const sentence=getNextSentence(state.currentDifficulty||'easy',this.id);
    const candidates=sentence.split(/\s+/).map(word=>word.replace(/[^\p{L}\p{N}À-ÿ'’-]/gu,'')).filter(Boolean);
    this.currentWord=(candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:'onda');
    this.timeLeft=this.timeForWord;this.lastInputLength=0;state.previousInput='';
    state.currentText=this.currentWord;
    const display=document.getElementById('text-display');
    if(display)display.innerHTML=`<span style="color: var(--text-muted);">🌊 Onda ${this.waveIndex+1}</span><br><strong style="font-size:1.4em;letter-spacing:2px;">${this.currentWord}</strong><div id="wave-feedback" class="mode-feedback" aria-live="polite"></div>`;
    this.updateUI();this.updateProgress();this.resetInput();
    // Depois que a primeira tecla iniciou a partida, cada nova palavra recebe
    // imediatamente seu próprio intervalo de tempo. Sem isso, o contador só
    // voltava a andar quando o usuário digitava outra tecla.
    if(this.startTime!==null)this.startWordTimer();
  },
  startWordTimer(){
    this.stopTimer();
    this.waveTimer=setInterval(()=>{
      this.timeLeft=Math.max(0,this.timeLeft-0.1);this.updateUI();
      if(this.timeLeft<=0){this.stopTimer();this.waveIndex++;this.errors++;this.nextWord();}
    },100);
  },
  resetInput(){const input=document.getElementById('hidden-input');if(input)input.value='';},
  updateProgress(){const total=this.totalWords||1,progress=Math.min(100,Math.round((this.waveIndex/total)*100)),fill=document.getElementById('progress-fill'),text=document.getElementById('progress-text'),percent=document.getElementById('progress-percent');if(fill)fill.style.width=`${progress}%`;if(text)text.textContent=`${this.waveIndex} / ${this.totalWords} ondas`;if(percent)percent.textContent=`${progress}%`;},
  updateUI(){const tag=document.getElementById('mode-status-tag');if(tag)tag.innerHTML=`🌊 Onda ${Math.min(this.waveIndex+1,this.totalWords)}/${this.totalWords} | ⏳ ${this.timeLeft.toFixed(1)}s`;},
  handleInput(value){
    if(this.waveIndex>=this.totalWords)return{playError:false};
    if(!this.startTime){this.startTime=performance.now();state.startTime=this.startTime;this.startWordTimer();}
    const target=this.currentWord,previousLength=this.lastInputLength;this.lastInputLength=value.length;
    const feedback=document.getElementById('wave-feedback');if(feedback)feedback.textContent='';
    if(value.length>previousLength){
      const index=value.length-1,char=value[index];this.attemptedChars++;
      if(char===target[index])this.correctChars++;
      else{this.errors++;if(feedback)feedback.textContent='❌ Corrija o caractere antes de continuar.';return{playError:true};}
    }
    if(value.length>target.length)return{playError:true};
    if(value===target){this.stopTimer();this.waveIndex++;this.nextWord();}
    return{playError:false};
  },
  reset(){this.stopTimer();this.waveIndex=0;this.words=[];this.currentWord='';this.startTime=null;this.errors=0;this.correctChars=0;this.attemptedChars=0;this.totalWords=0;this.lastInputLength=0;state.previousInput='';this.timeLeft=this.timeForWord;const tag=document.getElementById('mode-status-tag');if(tag)tag.textContent='🌊 Modo Onda';},
  destroy(){this.stopTimer();},
  checkMedals(){if(this.totalWords>=10)incrementMedal(this.id,'wave_10');if(this.errors===0)incrementMedal(this.id,'wave_perfect');},
  getMetrics(){const accuracy=this.attemptedChars?Math.round((this.correctChars/this.attemptedChars)*100):100,elapsed=this.startTime?Math.max(0.001,(performance.now()-this.startTime)/1000):0.001;return{accuracy,wpm:Math.round((this.correctChars/5)/(elapsed/60)),progress:this.waveIndex};},
  getResultMessage(accuracy,wpm){return`🌊 Ondas completadas: ${this.waveIndex} (${this.errors} erros de digitação/tempo)`;}
};