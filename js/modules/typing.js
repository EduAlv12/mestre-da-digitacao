import { state, saveState, SENTENCES, getModeStats } from './utils.js';
import { getNextSentence } from './sentence-engine.js';
import { updatePPMHistory, loadAchievements, checkRoundAchievements, trackSpaceKey, addGlobalXP } from './stats.js';
import { audioEngine } from './audio.js';
import { getModeHandler, getModeId, MODE_NAMES, renderModeDashboard } from '../modes/index.js';

const hiddenInput=document.getElementById('hidden-input');
const textDisplay=document.getElementById('text-display');
const ppmVal=document.getElementById('ppm-val');
const accuracyVal=document.getElementById('accuracy-val');
const timerVal=document.getElementById('timer-val');
const resultMessage=document.getElementById('result-message');
const countdownTag=document.getElementById('countdown-tag');
const progressFill=document.getElementById('progress-fill');
const progressText=document.getElementById('progress-text');
const progressPercent=document.getElementById('progress-percent');
const modeStatusTag=document.getElementById('mode-status-tag');

const CONTINUE_LABELS={
  default:'▶️ Continuar Treinando',fury:'🔥 Nova Sequência',survival:'💀 Tentar Novamente',
  sniper:'🎯 Nova Tentativa',wordhunt:'🧩 Caçar Novamente',casino:'💰 Nova Rodada',
  marathon:'🏃 Nova Maratona',memory:'🧠 Memorizar Novamente',wave:'🌊 Nova Onda',rpg:'⚔️ Continuar Batalhando'
};

function resetControllerBaseline(){state.previousInput='';}
function getContinueButton(){return document.getElementById('continue-mode-btn')||document.getElementById('rpg-continue-btn')||document.getElementById('normal-continue-btn');}
function syncContinueButton(){
  const b=getContinueButton();if(!b)return;
  if(b.id!=='continue-mode-btn')b.id='continue-mode-btn';
  const id=getModeId(),mode=getModeHandler();
  const canContinue=id==='rpg'?Boolean(mode?.battleOver):state._testEnded===true;
  b.textContent=CONTINUE_LABELS[id]||'▶️ Continuar';
  b.classList.toggle('hidden',!canContinue);b.disabled=!canContinue;b.setAttribute('aria-hidden',String(!canContinue));
}

document.addEventListener('modeEndTest',e=>{const{accuracy,wpm,modeId}=e.detail||{};if(modeId&&modeId!==getModeId())return;endTest(accuracy,wpm,modeId);});
document.addEventListener('rpgReadyForContinue',syncContinueButton);
document.addEventListener('modeResetTest',()=>initTest());
document.addEventListener('modeUpdateDisplay',e=>{if(e.detail?.html&&textDisplay)textDisplay.innerHTML=e.detail.html;});

export function updateProgress(typed,total){const p=total>0?Math.min(100,Math.round(typed/total*100)):0;if(progressFill)progressFill.style.width=`${p}%`;if(progressText)progressText.textContent=`${typed} / ${total} caracteres`;if(progressPercent)progressPercent.textContent=`${p}%`;}
function elapsed(){return state.startTime?Math.max(1,Math.floor((performance.now()-state.startTime)/1000)):0;}
function startTimer(){
  if(state.isRunning)return;
  state.isRunning=true;state.startTime=performance.now();
  const mode=getModeHandler();
  if(mode&&Object.prototype.hasOwnProperty.call(mode,'startTime')&&!mode.startTime)mode.startTime=state.startTime;
  if(mode?.hasTimer)return;
  clearInterval(state.timerInterval);
  state.timerInterval=setInterval(()=>{
    if(!state.isRunning){clearInterval(state.timerInterval);state.timerInterval=null;return;}
    if(timerVal)timerVal.textContent=`${elapsed()}s`;
    const current=getModeHandler()?.getMetrics?.();
    if(current){if(current.wpm!==undefined){ppmVal.textContent=current.wpm;state.currentPPM=current.wpm;}if(current.accuracy!==undefined)accuracyVal.textContent=`${current.accuracy}%`;renderModeDashboard();}
  },250);
}

export function endTest(accuracy,wpm,id){
  if(state._ending)return;
  state._ending=true;
  clearInterval(state.timerInterval);clearInterval(state.timerModeInterval);state.timerInterval=null;state.timerModeInterval=null;state.isRunning=false;state._testEnded=true;
  const mode=getModeHandler(),modeId=id||getModeId(),time=elapsed(),metrics=mode?.getMetrics?.();
  accuracy ??= metrics?.accuracy ?? 100;wpm ??= metrics?.wpm ?? state.currentPPM ?? 0;
  if(timerVal&&!mode?.hasTimer)timerVal.textContent=`${time}s`;if(ppmVal)ppmVal.textContent=wpm;if(accuracyVal)accuracyVal.textContent=`${accuracy}%`;
  const xp=Math.max(5,Math.round(wpm*2+accuracy*.5)+(accuracy===100?20:0));
  const chars=Math.max(0,Number(state.totalTyped)||0);
  addGlobalXP(xp,chars);updatePPMHistory(modeId,wpm);
  const stats=getModeStats(modeId);stats.rounds=(stats.rounds||0)+1;stats.totalTyped=(stats.totalTyped||0)+chars;stats.bestPPM=Math.max(stats.bestPPM||0,Number(wpm)||0);stats.bestAccuracy=Math.max(stats.bestAccuracy||0,Number(accuracy)||0);stats.bestTime=stats.bestTime==null?time:Math.min(stats.bestTime,time);
  saveState();mode?.checkMedals?.(accuracy,wpm,time);
  const msg=mode?.getResultMessage?.(accuracy,wpm)||'';
  if(resultMessage){resultMessage.className='result-message success';resultMessage.innerHTML=`🎉 <strong>${accuracy}%</strong> em ${time}s. ${msg}`;resultMessage.classList.remove('hidden');}
  checkRoundAchievements(wpm,accuracy,state.currentTheme);loadAchievements();state._ending=false;
  if(hiddenInput)hiddenInput.disabled=true;
  syncContinueButton();
}

export function initTest({resetMode=true}={}){
  clearInterval(state.timerInterval);clearTimeout(state.autoRestartTimeout);state.timerInterval=null;state.autoRestartTimeout=null;state.isRunning=false;state.totalTyped=0;state.errors=0;state.startTime=null;state.currentPPM=0;state._ending=false;state._testEnded=false;resetControllerBaseline();
  if(hiddenInput){hiddenInput.value='';hiddenInput.disabled=false;hiddenInput.setAttribute('inputmode','text');}
  if(timerVal)timerVal.textContent='0s';if(ppmVal)ppmVal.textContent='0';if(accuracyVal)accuracyVal.textContent='100%';
  if(resultMessage){resultMessage.classList.add('hidden');resultMessage.innerHTML='';}
  clearInterval(state.timerModeInterval);state.timerModeInterval=null;
  if(countdownTag){countdownTag.classList.add('hidden');countdownTag.classList.remove('warning');}
  const mode=getModeHandler();if(resetMode)mode?.reset?.();
  const difficulty=state.currentDifficulty;
  if(difficulty==='custom'){
    if(!state.customUserText||state.customUserText.trim().length<10){state.currentText='';if(textDisplay)textDisplay.innerHTML='<em>Nenhum texto customizado. Clique em "Alterar Texto".</em>';if(hiddenInput)hiddenInput.disabled=true;syncContinueButton();return;}
    state.currentText=state.customUserText;
  }else{
    state.currentText=getNextSentence(difficulty,getModeId())||SENTENCES[difficulty]?.[0]||SENTENCES.easy?.[0]||'';
  }
  if(mode?.init)mode.init(state.currentText);else if(textDisplay)textDisplay.innerHTML=state.currentText.split('').map((ch,i)=>`<span class="char ${i===0?'current':''}">${ch}</span>`).join('');
  resetControllerBaseline();
  if(modeStatusTag&&!mode?.render)modeStatusTag.textContent=MODE_NAMES[getModeId()]||'📖 Padrão';
  const stats=getModeStats(getModeId()),best=document.getElementById('best-ppm-val');if(best)best.textContent=stats.bestPPM||0;
  updateProgress(0,state.currentText.length);loadAchievements();renderModeDashboard();syncContinueButton();
}

function handleTyping(){
  if(!hiddenInput||hiddenInput.disabled||document.body.classList.contains('tutorial-open'))return;
  const mode=getModeHandler();if(!mode?.handleInput)return;
  const value=hiddenInput.value;
  const previous=state.previousInput||'';
  const inserted=Math.max(0,value.length-previous.length);
  if(!state.isRunning&&value.length)startTimer();
  if(inserted>0)state.totalTyped=(Number(state.totalTyped)||0)+inserted;
  state.previousInput=value;
  const result=mode.handleInput(value)||{};
  if(result.accuracy!==undefined||result.wpm!==undefined){if(result.accuracy!==undefined)accuracyVal.textContent=`${result.accuracy}%`;if(result.wpm!==undefined){ppmVal.textContent=result.wpm;state.currentPPM=result.wpm;}}
  if(inserted>0){if(result.playError)audioEngine.playErrorSound();else if(result.playSound!==false)audioEngine.playKey(false);}
  if(result.done){endTest(result.accuracy??100,result.wpm??state.currentPPM??0);return;}
  if(result.reset){initTest();return;}
  if(result.metrics){if(result.metrics.wpm!==undefined){ppmVal.textContent=result.metrics.wpm;state.currentPPM=result.metrics.wpm;}if(result.metrics.accuracy!==undefined)accuracyVal.textContent=`${result.metrics.accuracy}%`;}
  if(hiddenInput.value.length===0)resetControllerBaseline();
  renderModeDashboard();syncContinueButton();
}

export function setupTypingEvents(){
  if(!hiddenInput||hiddenInput.dataset.typingEventsReady==='true')return;
  hiddenInput.dataset.typingEventsReady='true';
  hiddenInput.setAttribute('autocomplete','new-password');hiddenInput.setAttribute('autocorrect','off');hiddenInput.setAttribute('autocapitalize','none');hiddenInput.setAttribute('spellcheck','false');hiddenInput.setAttribute('data-form-type','other');
  hiddenInput.addEventListener('keydown',e=>{if(e.key===' ')trackSpaceKey();});
  hiddenInput.addEventListener('beforeinput',e=>{if(/insertFromPaste|insertFromDrop|insertReplacementText|insertFromYank/.test(e.inputType)||(e.data&&e.data.length>1)){e.preventDefault();}});
  hiddenInput.addEventListener('paste',e=>e.preventDefault());
  hiddenInput.addEventListener('contextmenu',e=>e.preventDefault());
  hiddenInput.addEventListener('input',handleTyping);
  textDisplay?.addEventListener('click',()=>{if(!hiddenInput.disabled)hiddenInput.focus({preventScroll:true});});
  const continueBtn=getContinueButton();
  if(continueBtn&&!continueBtn.dataset.continueBound){
    continueBtn.dataset.continueBound='true';continueBtn.addEventListener('click',e=>{e.preventDefault();const id=getModeId(),mode=getModeHandler();if(id==='rpg'){if(mode?.battleOver)mode.continueBattle?.();}else if(state._testEnded){initTest();}syncContinueButton();});
  }
  syncContinueButton();
}
