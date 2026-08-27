// js/modules/ui.js
import { state, THEME_NAMES, SOUND_NAMES, DIFFICULTY_NAMES, DIFFICULTY_THRESHOLDS, getModeStats } from './utils.js';
import { loadAchievements, renderAchievementsUI, trackThemeChange, updateGlobalLevelUI } from './stats.js';
import { initTest } from './typing.js';
import { audioEngine } from './audio.js';
import { setMode, renderModeList, MODE_NAMES, getModeId, getModeHandler } from '../modes/index.js';

const $ = id => document.getElementById(id);
const difficultyTriggerText=$('difficulty-trigger-text'),themeTriggerText=$('theme-trigger-text'),soundTriggerText=$('sound-trigger-text'),modeTriggerText=$('mode-trigger-text'),difficultyTag=$('difficulty-tag'),editCustomBtn=$('edit-custom-btn'),restartBtn=$('restart-btn'),standardMedals=$('standard-medals'),customMedals=$('custom-medals'),medalsTitle=$('medals-title'),reqTime15=$('req-time15'),reqTime30=$('req-time30'),reqSpeed60=$('req-speed60'),customTextInput=$('custom-text-input'),customTextError=$('custom-text-error'),saveCustomTextBtn=$('save-custom-text-btn'),volumeSlider=$('volume-slider'),countdownTag=$('countdown-tag');
const modalDifficulty=$('modal-difficulty'),modalTheme=$('modal-theme'),modalSound=$('modal-sound'),modalModes=$('modal-modes'),modalCustomText=$('modal-custom-text'),modalAchievements=$('modal-achievements'),modalPpmInfo=$('modal-ppm-info'),modalWelcome=$('modal-welcome'),modalRestartConfirm=$('modal-restart-confirm'),modalModeHelp=$('modal-mode-help'),modeHelpClose=$('mode-help-close'),modeHelpIcon=$('mode-help-icon'),modeHelpTitle=$('mode-help-title'),modeHelpDescription=$('mode-help-description'),modeHelpRules=$('mode-help-rules'),confirmRestartBtn=$('confirm-restart-btn'),cancelRestartBtn=$('cancel-restart-btn');

const MODE_HELP={
  default:{icon:'📖',title:'Padrão',description:'Treine sua digitação no formato clássico.',rules:['Complete a sequência de frases.','Acompanhe PPM, precisão, tempo e progresso.','Ao terminar, use Continuar Treinando para iniciar outra sequência.']},
  fury:{icon:'🔥',title:'Fúria',description:'Mantenha uma sequência de acertos.',rules:['Acertos consecutivos aumentam o streak.','Erros quebram a sequência.','Busque o maior streak possível.']},
  survival:{icon:'💀',title:'Sobrevivência',description:'Cada caractere é uma disputa contra o tempo.',rules:['Você possui vidas limitadas.','Cada caractere tem tempo de vida.','Equilibre velocidade e precisão.']},
  sniper:{icon:'🎯',title:'Precisão Extrema',description:'Erros custam caro.',rules:['Evite erros consecutivos.','O modo pode recuar seu progresso após erros.','Mantenha a precisão alta até o fim.']},
  wordhunt:{icon:'🧩',title:'Caça-Palavras',description:'Descubra e digite as palavras corretamente.',rules:['A palavra aparece embaralhada.','Digite a forma correta para avançar.','Complete a sequência com poucos erros.']},
  casino:{icon:'💰',title:'Cassino',description:'Aposte fichas na sua própria performance.',rules:['Sua banca define as apostas.','Precisão e resultado influenciam a recompensa.','Use Nova Rodada para continuar.']},
  marathon:{icon:'🏃',title:'Maratona',description:'Digite o máximo possível antes do tempo terminar.',rules:['Há um cronômetro global para toda a prova.','Cada palavra concluída aumenta sua pontuação.','O tempo encerra a partida.']},
  memory:{icon:'🧠',title:'Memória',description:'Memorize o texto antes que ele desapareça.',rules:['Observe o texto durante a fase de memorização.','Depois ele some e você digita de memória.','Use Memorizar Novamente para tentar outra vez.']},
  wave:{icon:'🌊',title:'Onda',description:'Cada palavra possui seu próprio tempo.',rules:['Complete a palavra antes do tempo acabar.','Cada acerto avança para a próxima.','A sequência termina ao concluir todas as ondas.']},
  rpg:{icon:'⚔️',title:'RPG',description:'Sua digitação vira ataque e defesa.',rules:['Cada frase causa dano ao monstro.','Erros causam dano ao jogador.','Após vencer, use Continuar Batalhando.']}
};

export function openModal(modal){
  if(!modal)return;modal.classList.add('active');
  if(modal===modalWelcome){document.body.classList.add('tutorial-open');const input=$('hidden-input');if(input){input.blur();input.disabled=true;input.setAttribute('inputmode','none');}}
}
export function closeModal(modal){
  if(!modal)return;modal.classList.remove('active');
  if(modal===modalWelcome){document.body.classList.remove('tutorial-open');const input=$('hidden-input');if(input){input.disabled=false;input.setAttribute('inputmode','text');}}
}
export function disableTimerMode(){state.isTimerMode=false;clearInterval(state.timerModeInterval);state.timerModeInterval=null;countdownTag?.classList.add('hidden');countdownTag?.classList.remove('warning');const btn=$('timer-mode-btn');if(btn){btn.textContent='⏱️ Contra-Relógio';btn.classList.remove('active');}}

export function renderHistoryChart(modeId){
  const chart=$('history-chart');if(!chart)return;const stats=getModeStats(modeId),history=stats.ppmHistory||[],avg=$('history-avg');chart.innerHTML='';
  if(!history.length){if(avg)avg.textContent='Média: 0';chart.innerHTML='<span style="font-size:.6rem;color:var(--text-muted);width:100%;text-align:center;padding:8px 0;">Nenhum dado ainda. Comece a digitar!</span>';return;}
  if(avg)avg.textContent=`Média: ${Math.round(history.reduce((a,b)=>a+b,0)/history.length)}`;const max=Math.max(10,...history,1);
  history.forEach(value=>{const dot=document.createElement('div');dot.className=`history-dot ${value>0?'active':''}`;dot.style.height=`${Math.max(4,(value/max)*38)}px`;if(value>0){const tip=document.createElement('span');tip.className='dot-tooltip';tip.textContent=`${value} PPM`;dot.appendChild(tip);}chart.appendChild(dot);});
}

let tutorialReady=false,tutorialStep=0;const TOTAL_TUTORIAL_STEPS=5;
function updateTutorialUI(){document.querySelectorAll('.tutorial-step').forEach((el,i)=>el.classList.toggle('active',i===tutorialStep));document.querySelectorAll('.tutorial-dots .dot').forEach((el,i)=>el.classList.toggle('active',i===tutorialStep));const prev=$('tutorial-prev'),next=$('tutorial-next');if(prev)prev.disabled=tutorialStep===0;if(next)next.textContent=tutorialStep===TOTAL_TUTORIAL_STEPS-1?'✨ Vamos Começar!':'Próximo →';}
function setupTutorial(){if(tutorialReady)return;tutorialReady=true;$('tutorial-prev')?.addEventListener('click',e=>{e.preventDefault();if(tutorialStep>0){tutorialStep--;updateTutorialUI();}});$('tutorial-next')?.addEventListener('click',e=>{e.preventDefault();if(tutorialStep<TOTAL_TUTORIAL_STEPS-1){tutorialStep++;updateTutorialUI();}else closeModal(modalWelcome);});document.querySelectorAll('.tutorial-dots .dot').forEach(dot=>dot.addEventListener('click',e=>{e.preventDefault();const step=Number(dot.dataset.step);if(Number.isInteger(step)&&step>=0&&step<TOTAL_TUTORIAL_STEPS){tutorialStep=step;updateTutorialUI();}}));}

export function setDifficulty(value){
  if(!DIFFICULTY_NAMES[value])value='easy';state.currentDifficulty=value;if(difficultyTriggerText)difficultyTriggerText.textContent=DIFFICULTY_NAMES[value];
  modalDifficulty?.querySelectorAll('.modal-option-btn').forEach(btn=>btn.classList.toggle('selected',btn.dataset.value===value));
  const custom=value==='custom';standardMedals?.classList.toggle('hidden',custom);customMedals?.classList.toggle('hidden',!custom);if(medalsTitle)medalsTitle.textContent=custom?'🏅 Medalhas (Modo Personalizado)':'🏅 Medalhas (Modo Padrão)';editCustomBtn?.classList.toggle('hidden',!custom);if(difficultyTag)difficultyTag.textContent=`Nível: ${DIFFICULTY_NAMES[value]}`;
  const limits=DIFFICULTY_THRESHOLDS[value]||DIFFICULTY_THRESHOLDS.easy;if(reqTime15)reqTime15.textContent=`Tempo ≤ ${limits.time15}s`;if(reqTime30)reqTime30.textContent=`Tempo ≤ ${limits.time30}s`;if(reqSpeed60)reqSpeed60.textContent=`${limits.speed60}+ PPM`;
  loadAchievements();initTest();if(custom&&(!state.customUserText||state.customUserText.trim().length<10))openModal(modalCustomText);
}
export function setTheme(value){if(!THEME_NAMES[value])value='default';state.currentTheme=value;document.documentElement.classList.add('no-transitions');document.documentElement.setAttribute('data-theme',value);localStorage.setItem('selectedTheme',value);if(themeTriggerText)themeTriggerText.textContent=THEME_NAMES[value];modalTheme?.querySelectorAll('.modal-option-btn').forEach(btn=>btn.classList.toggle('selected',btn.dataset.value===value));trackThemeChange(value);requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('no-transitions')));}
export function setSoundProfile(value){if(!SOUND_NAMES[value])value='thock';audioEngine.setProfile(value);localStorage.setItem('selectedSoundProfile',value);if(soundTriggerText)soundTriggerText.textContent=SOUND_NAMES[value];modalSound?.querySelectorAll('.modal-option-btn').forEach(btn=>btn.classList.toggle('selected',btn.dataset.value===value));audioEngine.playKey(false);}
export function loadSavedSettings(){setTheme(localStorage.getItem('selectedTheme')||'default');setSoundProfile(localStorage.getItem('selectedSoundProfile')||'thock');const volume=localStorage.getItem('selectedSoundVolume')||'0.72';audioEngine.setVolume(volume);if(volumeSlider)volumeSlider.value=volume;updateGlobalLevelUI();}

export function setupModalTriggers(){
  if(document.body.dataset.uiEventsReady==='true')return;document.body.dataset.uiEventsReady='true';
  document.addEventListener('click',e=>{const target=e.target.closest('.select-trigger,.btn-achievements-trigger');if(!target)return;if(target.id==='mode-trigger'){renderModeList();openModal(modalModes);}else if(target.id==='difficulty-trigger')openModal(modalDifficulty);else if(target.id==='theme-trigger')openModal(modalTheme);else if(target.id==='sound-trigger')openModal(modalSound);else if(target.id==='achievements-trigger'){renderAchievementsUI();openModal(modalAchievements);}});
  document.addEventListener('click',e=>{const close=e.target.closest('.modal-close');if(close){const modal=$(close.dataset.close);if(modal)closeModal(modal);return;}if(e.target.classList.contains('modal-overlay'))closeModal(e.target);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')[modalDifficulty,modalTheme,modalSound,modalModes,modalCustomText,modalAchievements,modalPpmInfo,modalWelcome,modalRestartConfirm,modalModeHelp].forEach(closeModal);});
  document.addEventListener('click',e=>{const preview=e.target.closest('.sound-preview-btn');if(!preview)return;e.preventDefault();e.stopPropagation();if(preview.dataset.value)audioEngine.playPreview(preview.dataset.value);});
  document.addEventListener('click',e=>{const option=e.target.closest('.modal-option-btn');if(!option)return;const modal=option.closest('.modal-overlay'),value=option.dataset.value;if(!modal||!value)return;if(modal.id==='modal-sound'&&e.target.closest('.sound-preview-btn'))return;if(modal.id==='modal-difficulty'){setDifficulty(value);closeModal(modal);}else if(modal.id==='modal-theme'){setTheme(value);closeModal(modal);}else if(modal.id==='modal-sound'){setSoundProfile(value);closeModal(modal);}else if(modal.id==='modal-modes'){setMode(value);closeModal(modal);if(modeTriggerText)modeTriggerText.textContent=MODE_NAMES[value]||value;const stats=getModeStats(value),best=$('best-ppm-val');if(best)best.textContent=stats.bestPPM||0;renderHistoryChart(value);updateGlobalLevelUI();}});
  $('ppm-info-btn')?.addEventListener('click',()=>openModal(modalPpmInfo));
  $('mode-help-trigger')?.addEventListener('click',e=>{e.preventDefault();openModeHelp();});$('mode-info-btn')?.addEventListener('click',e=>{e.preventDefault();openModeHelp();});modeHelpClose?.addEventListener('click',e=>{e.preventDefault();closeModal(modalModeHelp);});
  saveCustomTextBtn?.addEventListener('click',()=>{const value=customTextInput?.value.trim()||'';if(value.length<10){customTextError?.classList.remove('hidden');return;}state.customUserText=value;localStorage.setItem('customUserText',value);closeModal(modalCustomText);initTest();});
  editCustomBtn?.addEventListener('click',()=>{if(customTextInput)customTextInput.value=state.customUserText||'';customTextError?.classList.add('hidden');openModal(modalCustomText);});
  volumeSlider?.addEventListener('input',e=>{audioEngine.setVolume(e.target.value);localStorage.setItem('selectedSoundVolume',e.target.value);});
  restartBtn?.addEventListener('click',e=>{e.preventDefault();openModal(modalRestartConfirm);});confirmRestartBtn?.addEventListener('click',e=>{e.preventDefault();closeModal(modalRestartConfirm);initTest();});cancelRestartBtn?.addEventListener('click',e=>{e.preventDefault();closeModal(modalRestartConfirm);});
  const tutorialBtn=$('tutorial-btn');tutorialBtn?.addEventListener('click',e=>{e.preventDefault();tutorialStep=0;setupTutorial();updateTutorialUI();openModal(modalWelcome);});
  $('feedback-trigger')?.addEventListener('click',e=>{e.preventDefault();window.open('https://forms.gle/KsACEZfVzteRzm8s9','_blank');});
}
export function showWelcomeModal(){setupTutorial();tutorialStep=0;updateTutorialUI();openModal(modalWelcome);}
export function toggleTimerMode(){const mode=getModeHandler();if(mode?.hasTimer){showToast('Este modo já possui temporizador próprio.');return;}state.isTimerMode=!state.isTimerMode;const btn=$('timer-mode-btn');if(btn){btn.textContent=state.isTimerMode?'⏱️ Modo Normal':'⏱️ Contra-Relógio';btn.classList.toggle('active',state.isTimerMode);}if(countdownTag){countdownTag.classList.toggle('hidden',!state.isTimerMode);if(state.isTimerMode)countdownTag.textContent=`⏱️ ${state.timerModeLimit}s`;}clearInterval(state.timerModeInterval);state.timerModeInterval=null;initTest();}
export function setupShareButton(){const btn=$('share-site-btn');if(!btn||btn.dataset.shareReady==='true')return;btn.dataset.shareReady='true';btn.addEventListener('click',()=>{const url=window.location.href,text='⌨️ Mestre da Digitação - Teste sua velocidade e precisão!';if(navigator.share)navigator.share({title:'Mestre da Digitação',text,url}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(`${text}\n\n${url}`).then(()=>showToast('Link copiado!')).catch(()=>fallbackShare(url,text));else fallbackShare(url,text);});}
function fallbackShare(url,text){const ta=document.createElement('textarea');ta.value=`${text}\n\n${url}`;ta.style.cssText='position:fixed;opacity:0;left:-9999px;';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');showToast('Link copiado!');}catch(_){showToast(`Copie o link: ${url}`);}ta.remove();}
function showToast(message){document.querySelector('.toast-message')?.remove();const el=document.createElement('div');el.className='toast-message';el.textContent=message;document.body.appendChild(el);setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),300);},2000);}
