import { state } from './modules/utils.js';
import { audioEngine } from './modules/audio.js';
import { getModeHandler, getModeId, renderModeDashboard } from './modes/index.js';
import { trackSpaceKey } from './modules/stats.js';

const init = () => {
  const input = document.getElementById('hidden-input');
  if (!input || input.dataset.inputControllerReady === 'true') return;
  input.dataset.inputControllerReady = 'true';
  let timer = null;
  const getElapsed = () => state.startTime ? Math.max(1, Math.floor((performance.now()-state.startTime)/1000)) : 0;
  const updateMetrics = metrics => {
    const mode = getModeHandler();
    const current = metrics || mode?.getMetrics?.();
    if (!current) return;
    const ppm = Number.isFinite(Number(current.wpm)) ? Math.max(0,Math.round(Number(current.wpm))) : 0;
    const accuracy = Number.isFinite(Number(current.accuracy)) ? Math.max(0,Math.min(100,Math.round(Number(current.accuracy)))) : 100;
    const p=document.getElementById('ppm-val'),a=document.getElementById('accuracy-val');
    if(p)p.textContent=ppm;if(a)a.textContent=`${accuracy}%`;state.currentPPM=ppm;renderModeDashboard();
  };
  const stopTimer=()=>{clearInterval(timer);timer=null;};
  const startTimer=()=>{
    if(state.isRunning)return;
    state.isRunning=true;state.startTime=performance.now();
    const mode=getModeHandler();
    if(mode?.hasTimer){
      // Timed modes own their timer because each mode has a different timeout mechanic.
      if(typeof mode.startTimer==='function')mode.startTimer();
      return;
    }
    stopTimer();
    timer=setInterval(()=>{if(!state.isRunning){stopTimer();return;}const modeNow=getModeHandler(),timerEl=document.getElementById('timer-val');if(timerEl)timerEl.textContent=`${getElapsed()}s`;updateMetrics();},250);
  };
  const finish=result=>{stopTimer();const modeId=getModeId();document.dispatchEvent(new CustomEvent('modeEndTest',{detail:{accuracy:result?.accuracy,wpm:result?.wpm,modeId}}));};
  const syncAfterProgrammaticReset=()=>{queueMicrotask(()=>{if(input.value.length===0)state._controllerLastLength=0;});};
  const handleInput=()=>{
    if(input.disabled||document.body.classList.contains('tutorial-open'))return;
    const value=input.value,mode=getModeHandler();if(!mode?.handleInput)return;
    if(value.length>0&&!state.isRunning)startTimer();
    const previousLength=Number(state._controllerLastLength)||0,inserted=value.length-previousLength;
    if(inserted>0)state.totalTyped=(Number(state.totalTyped)||0)+inserted;
    state._controllerLastLength=value.length;
    const result=mode.handleInput(value)||{};
    if(result.accuracy!==undefined||result.wpm!==undefined)updateMetrics(result);
    if(inserted>0){if(result.playError)audioEngine.playErrorSound?.();else audioEngine.playKey?.(false);}
    if(result.done)finish(result);
    syncAfterProgrammaticReset();
  };
  input.addEventListener('input',handleInput);
  input.addEventListener('keydown',event=>{if(event.key===' ')trackSpaceKey();});
  input.addEventListener('beforeinput',event=>{if(/insertFromPaste|insertFromDrop|insertReplacementText|insertFromYank/.test(event.inputType))event.preventDefault();});
  input.addEventListener('paste',event=>event.preventDefault());
  input.addEventListener('contextmenu',event=>event.preventDefault());
  document.addEventListener('modeResetTest',()=>{stopTimer();state._controllerLastLength=0;});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
