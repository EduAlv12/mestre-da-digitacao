import { state, saveState, THEME_NAMES, SOUND_NAMES, DIFFICULTY_NAMES, DIFFICULTY_THRESHOLDS, getModeStats } from './utils.js';
import { loadAchievements, renderAchievementsUI, trackThemeChange, updateGlobalLevelUI } from './stats.js';
import { initTest } from './typing.js';
import { audioEngine } from './audio.js';
import { setMode, renderModeList, MODE_NAMES, getModeId, getModeHandler } from '../modes/index.js';

const difficultyTriggerText = document.getElementById('difficulty-trigger-text');
const themeTriggerText = document.getElementById('theme-trigger-text');
const soundTriggerText = document.getElementById('sound-trigger-text');
const modeTriggerText = document.getElementById('mode-trigger-text');
const difficultyTag = document.getElementById('difficulty-tag');
const editCustomBtn = document.getElementById('edit-custom-btn');
const restartBtn = document.getElementById('restart-btn');
const medalsTitle = document.getElementById('medals-title');
const standardMedals = document.getElementById('standard-medals');
const customMedals = document.getElementById('custom-medals');
const reqTime15 = document.getElementById('req-time15');
const reqTime30 = document.getElementById('req-time30');
const reqSpeed60 = document.getElementById('req-speed60');
const customTextInput = document.getElementById('custom-text-input');
const customTextError = document.getElementById('custom-text-error');
const saveCustomTextBtn = document.getElementById('save-custom-text-btn');
const volumeSlider = document.getElementById('volume-slider');
const countdownTag = document.getElementById('countdown-tag');
const modalDifficulty = document.getElementById('modal-difficulty');
const modalTheme = document.getElementById('modal-theme');
const modalSound = document.getElementById('modal-sound');
const modalModes = document.getElementById('modal-modes');
const modalCustomText = document.getElementById('modal-custom-text');
const modalAchievements = document.getElementById('modal-achievements');
const modalPpmInfo = document.getElementById('modal-ppm-info');
const modalWelcome = document.getElementById('modal-welcome');
const modalRestartConfirm = document.getElementById('modal-restart-confirm');
const modalModeHelp = document.getElementById('modal-mode-help');
const modeHelpTrigger = document.getElementById('mode-help-trigger');
const modeHelpClose = document.getElementById('mode-help-close');
const modeHelpIcon = document.getElementById('mode-help-icon');
const modeHelpTitle = document.getElementById('mode-help-title');
const modeHelpDescription = document.getElementById('mode-help-description');
const modeHelpRules = document.getElementById('mode-help-rules');
const confirmRestartBtn = document.getElementById('confirm-restart-btn');
const cancelRestartBtn = document.getElementById('cancel-restart-btn');

export function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  if (modal === modalWelcome) {
    document.body.classList.add('tutorial-open');
    const hiddenInput = document.getElementById('hidden-input');
    if (hiddenInput) { hiddenInput.blur(); hiddenInput.disabled = true; hiddenInput.setAttribute('inputmode', 'none'); }
  }
}

export function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  if (modal === modalWelcome) {
    document.body.classList.remove('tutorial-open');
    const hiddenInput = document.getElementById('hidden-input');
    if (hiddenInput) { hiddenInput.disabled = false; hiddenInput.setAttribute('inputmode', 'text'); }
  }
}

export function disableTimerMode() {
  if (state.isTimerMode) {
    state.isTimerMode = false;
    const btn = document.getElementById('timer-mode-btn');
    if (btn) { btn.textContent = '⏱️ Contra-Relógio'; btn.classList.remove('active'); }
    if (countdownTag) { countdownTag.classList.add('hidden'); countdownTag.classList.remove('warning'); }
    clearInterval(state.timerModeInterval); state.timerModeInterval = null;
  }
}

const MODE_HELP = {
  default: { icon:'📖', title:'Padrão', description:'Treine sua digitação no formato clássico.', rules:['Digite a frase completa com o máximo de velocidade e precisão.','Acompanhe PPM, precisão, tempo e progresso em tempo real.','Complete uma sequência de 5 frases para registrar seu resultado e medalhas.'] },
  fury: { icon:'🔥', title:'Fúria', description:'Construa uma sequência de acertos e aumente sua velocidade.', rules:['Acertos consecutivos aumentam seu nível de Fúria.','Erros quebram o streak e prejudicam seu ritmo.','Tente manter o maior streak possível.'] },
  survival: { icon:'💀', title:'Sobrevivência', description:'Cada caractere é uma corrida contra o relógio.', rules:['Você possui vidas limitadas.','Cada caractere tem um tempo de vida; digite antes que expire.','Administre velocidade e precisão para sobreviver.'] },
  sniper: { icon:'🎯', title:'Precisão Extrema', description:'Erros custam caro. Digite como um atirador de elite.', rules:['Evite erros consecutivos.','Quando errar, o modo pode recuar seu progresso.','Mantenha a precisão alta para chegar ao fim.'] },
  wordhunt: { icon:'🧩', title:'Caça-Palavras', description:'Encontre e digite as palavras corretamente.', rules:['As palavras aparecem embaralhadas.','Digite a forma correta para marcar a palavra como encontrada.','Complete o maior número possível com poucos erros.'] },
  casino: { icon:'💰', title:'Cassino', description:'Aposte suas fichas na sua própria performance.', rules:['Você começa com um saldo de fichas.','Aposta e resultado dependem da sua precisão.','Vença para aumentar sua banca e mantenha uma sequência.'] },
  marathon: { icon:'🏃', title:'Maratona', description:'Digite o máximo que conseguir antes do tempo acabar.', rules:['O cronômetro limita a duração da prova.','Cada palavra concluída aumenta sua pontuação.','Busque o maior volume possível sem sacrificar a precisão.'] },
  memory: { icon:'🧠', title:'Memória', description:'Memorize o texto antes que ele desapareça.', rules:['O texto fica visível por alguns segundos.','Depois, digite usando apenas o que memorizou.','Erros contam contra sua precisão e desempenho.'] },
  wave: { icon:'🌊', title:'Onda', description:'As palavras chegam em ondas cada vez mais intensas.', rules:['Complete as palavras antes que a onda termine.','O tempo por palavra depende da dificuldade, mas a sequência tem quantidade definida.','Mantenha velocidade e precisão para avançar.'] },
  rpg: { icon:'⚔️', title:'RPG', description:'Transforme sua digitação em combate e evolua seu personagem.', rules:['Cada acerto causa dano ao monstro; erros causam dano a você.','Ataques ficam mais fortes conforme você evolui e acumula XP.','Ao derrotar um monstro, a frase permanece na tela: clique em "Continuar Batalhando" para iniciar a próxima batalha.','Suba de nível para aumentar HP e ataque.'] },
  rainbow: { icon:'🌈', title:'Arco-Íris', description:'Pinte a frase corretamente com todas as cores.', rules:['Cada trecho correto recebe uma cor.','Caracteres incorretos ficam sem a cor correspondente até serem corrigidos.','Complete a frase para obter o melhor resultado.'] }
};

function openModeHelp() {
  if (!modalModeHelp) return;
  const id = getModeId(), help = MODE_HELP[id] || MODE_HELP.default;
  if (modeHelpIcon) modeHelpIcon.textContent = help.icon;
  if (modeHelpTitle) modeHelpTitle.textContent = `Como jogar: ${help.title}`;
  if (modeHelpDescription) modeHelpDescription.textContent = help.description;
  if (modeHelpRules) modeHelpRules.innerHTML = help.rules.map((rule, i) => `<div class="mode-help-rule"><span>${i + 1}</span><p>${rule}</p></div>`).join('');
  openModal(modalModeHelp);
}

export function renderHistoryChart(modeId) {
  const chart = document.getElementById('history-chart');
  if (!chart) return;
  const stats = getModeStats(modeId), avgEl = document.getElementById('history-avg'), history = stats.ppmHistory || [];
  const maxPPM = Math.max(10, ...history, 1);
  chart.innerHTML = '';
  if (!history.length) { chart.innerHTML = '<span style="font-size:0.6rem;color:var(--text-muted);width:100%;text-align:center;padding:8px 0;">Nenhum dado ainda. Comece a digitar!</span>'; if (avgEl) avgEl.textContent = 'Média: 0'; return; }
  const avg = Math.round(history.reduce((a,b)=>a+b,0)/history.length); if (avgEl) avgEl.textContent = `Média: ${avg}`;
  history.forEach(value => { const dot=document.createElement('div'); dot.className=`history-dot ${value>0?'active':''}`; const h=Math.max(10,(value/maxPPM)*80); dot.style.setProperty('--value',h); dot.style.height=`${Math.max(4,h*0.48)}px`; if(value>0){const tip=document.createElement('span');tip.className='dot-tooltip';tip.textContent=`${value} PPM`;dot.appendChild(tip)} chart.appendChild(dot); });
}

let tutorialStep = 0;
const totalSteps = 5;
function updateTutorialUI(){const steps=document.querySelectorAll('.tutorial-step'),dots=document.querySelectorAll('.tutorial-dots .dot'),prevBtn=document.getElementById('tutorial-prev'),nextBtn=document.getElementById('tutorial-next');steps.forEach((el,i)=>el.classList.toggle('active',i===tutorialStep));dots.forEach((el,i)=>el.classList.toggle('active',i===tutorialStep));if(prevBtn)prevBtn.disabled=tutorialStep===0;if(nextBtn)nextBtn.textContent=tutorialStep===totalSteps-1?'✨ Vamos Começar!':'Próximo →';}
function setupTutorial(){const prevBtn=document.getElementById('tutorial-prev'),nextBtn=document.getElementById('tutorial-next'),dots=document.querySelectorAll('.tutorial-dots .dot');if(prevBtn)prevBtn.addEventListener('click',e=>{e.preventDefault();if(tutorialStep>0){tutorialStep--;updateTutorialUI()}});if(nextBtn)nextBtn.addEventListener('click',e=>{e.preventDefault();if(tutorialStep<totalSteps-1){tutorialStep++;updateTutorialUI()}else closeModal(modalWelcome)});dots.forEach(dot=>dot.addEventListener('click',e=>{e.preventDefault();const step=parseInt(dot.getAttribute('data-step'),10);if(!isNaN(step)&&step>=0&&step<totalSteps){tutorialStep=step;updateTutorialUI()}}));}

export function setDifficulty(val){state.currentDifficulty=val;if(difficultyTriggerText)difficultyTriggerText.textContent=DIFFICULTY_NAMES[val]||'Fácil';if(modalDifficulty)modalDifficulty.querySelectorAll('.modal-option-btn').forEach(b=>b.classList.toggle('selected',b.getAttribute('data-value')===val));const isCustom=val==='custom';if(standardMedals)standardMedals.classList.toggle('hidden',isCustom);if(customMedals)customMedals.classList.toggle('hidden',!isCustom);if(medalsTitle)medalsTitle.textContent=isCustom?'🏅 Medalhas (Modo Personalizado)':'🏅 Medalhas (Modo Padrão)';if(editCustomBtn)editCustomBtn.classList.toggle('hidden',!isCustom);if(restartBtn)restartBtn.textContent='↻ Recomeçar';if(difficultyTag)difficultyTag.textContent=`Nível: ${DIFFICULTY_NAMES[val]}`;updateMedalLabels();loadAchievements();initTest();if(isCustom&&(!state.customUserText||state.customUserText.trim().length<10))openModal(modalCustomText);}
function updateMedalLabels(){const diff=state.currentDifficulty;if(diff==='custom')return;const limits=DIFFICULTY_THRESHOLDS[diff];if(reqTime15)reqTime15.textContent=`Tempo ≤ ${limits.time15}s`;if(reqTime30)reqTime30.textContent=`Tempo ≤ ${limits.time30}s`;if(reqSpeed60)reqSpeed60.textContent=`${limits.speed60}+ PPM`;}
export function setTheme(val){state.currentTheme=val;audioEngine.playThemeSwitch();document.documentElement.classList.add('no-transitions');document.documentElement.setAttribute('data-theme',val);localStorage.setItem('selectedTheme',val);if(themeTriggerText)themeTriggerText.textContent=THEME_NAMES[val]||'Azul Marinho';if(modalTheme)modalTheme.querySelectorAll('.modal-option-btn').forEach(b=>b.classList.toggle('selected',b.getAttribute('data-value')===val));trackThemeChange(val);requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('no-transitions')));}
export function setSoundProfile(val){audioEngine.setProfile(val);localStorage.setItem('selectedSoundProfile',val);if(soundTriggerText)soundTriggerText.textContent=SOUND_NAMES[val]||'Thock Mecânico';if(modalSound)modalSound.querySelectorAll('.modal-option-btn').forEach(b=>b.classList.toggle('selected',b.getAttribute('data-value')===val));audioEngine.playKey(false);}
export function loadSavedSettings(){const savedTheme=localStorage.getItem('selectedTheme')||'default',savedProfile=localStorage.getItem('selectedSoundProfile')||'thock',savedVolume=localStorage.getItem('selectedSoundVolume')||'0.9';setTheme(savedTheme);setSoundProfile(savedProfile);audioEngine.setVolume(savedVolume);if(volumeSlider)volumeSlider.value=savedVolume;updateGlobalLevelUI();}
export function setupModalTriggers(){
  document.addEventListener('click',e=>{const target=e.target.closest('.select-trigger,.btn-achievements-trigger');if(!target)return;if(target.id==='mode-trigger'){renderModeList();openModal(modalModes)}else if(target.id==='difficulty-trigger')openModal(modalDifficulty);else if(target.id==='theme-trigger')openModal(modalTheme);else if(target.id==='sound-trigger')openModal(modalSound);else if(target.id==='achievements-trigger'){renderAchievementsUI();openModal(modalAchievements)}});
  document.addEventListener('click',e=>{const closeBtn=e.target.closest('.modal-close');if(closeBtn){const modal=document.getElementById(closeBtn.getAttribute('data-close'));if(modal)closeModal(modal);return}if(e.target.classList.contains('modal-overlay'))closeModal(e.target)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')[modalDifficulty,modalTheme,modalSound,modalModes,modalCustomText,modalAchievements,modalPpmInfo,modalWelcome,modalRestartConfirm,modalModeHelp].forEach(m=>closeModal(m))});
  document.addEventListener('click',e=>{const option=e.target.closest('.modal-option-btn');if(!option)return;const parentModal=option.closest('.modal-overlay');if(!parentModal)return;const value=option.getAttribute('data-value');if(!value)return;if(parentModal.id==='modal-sound'&&e.target.closest('.sound-preview-btn'))return;if(parentModal.id==='modal-difficulty'){setDifficulty(value);closeModal(parentModal)}else if(parentModal.id==='modal-theme'){setTheme(value);closeModal(parentModal)}else if(parentModal.id==='modal-sound'){setSoundProfile(value);closeModal(parentModal)}else if(parentModal.id==='modal-modes'){setMode(value);closeModal(parentModal);if(modeTriggerText)modeTriggerText.textContent=MODE_NAMES[value]||value;const stats=getModeStats(value),bestEl=document.getElementById('best-ppm-val');if(bestEl)bestEl.textContent=stats.bestPPM||0;renderHistoryChart(value);updateGlobalLevelUI()}});
  document.addEventListener('click',e=>{const previewBtn=e.target.closest('.sound-preview-btn');if(!previewBtn)return;e.preventDefault();e.stopPropagation();const value=previewBtn.getAttribute('data-value');if(!value)return;audioEngine.playPreview(value);});
  document.addEventListener('click',e=>{if(e.target.closest('#ppm-info-btn'))openModal(modalPpmInfo)});
  if(saveCustomTextBtn)saveCustomTextBtn.addEventListener('click',()=>{const val=customTextInput.value.trim();if(val.length<10){if(customTextError)customTextError.classList.remove('hidden');return}state.customUserText=val;localStorage.setItem('customUserText',val);closeModal(modalCustomText);initTest()});
  if(editCustomBtn)editCustomBtn.addEventListener('click',()=>{if(customTextInput)customTextInput.value=state.customUserText;if(customTextError)customTextError.classList.add('hidden');openModal(modalCustomText)});
  if(volumeSlider)volumeSlider.addEventListener('input',e=>{const val=e.target.value;audioEngine.setVolume(val);localStorage.setItem('selectedSoundVolume',val)});
  if(restartBtn)restartBtn.addEventListener('click',e=>{e.preventDefault();openModal(modalRestartConfirm)});
  if(confirmRestartBtn)confirmRestartBtn.addEventListener('click',e=>{e.preventDefault();closeModal(modalRestartConfirm);initTest()});
  if(cancelRestartBtn)cancelRestartBtn.addEventListener('click',e=>{e.preventDefault();closeModal(modalRestartConfirm)});
  if(modeHelpTrigger)modeHelpTrigger.addEventListener('click',e=>{e.preventDefault();openModeHelp()});
  if(modeHelpClose)modeHelpClose.addEventListener('click',e=>{e.preventDefault();closeModal(modalModeHelp)});
  const tutorialBtn=document.getElementById('tutorial-btn');if(tutorialBtn)tutorialBtn.addEventListener('click',e=>{e.preventDefault();const hiddenInput=document.getElementById('hidden-input');if(hiddenInput){hiddenInput.blur();hiddenInput.disabled=true}tutorialStep=0;updateTutorialUI();openModal(modalWelcome)});
  const feedbackBtn=document.getElementById('feedback-trigger');if(feedbackBtn)feedbackBtn.addEventListener('click',e=>{e.preventDefault();window.open('https://forms.gle/KsACEZfVzteRzm8s9','_blank')});
}
export function showWelcomeModal(){if(!modalWelcome)return;const hiddenInput=document.getElementById('hidden-input');if(hiddenInput){hiddenInput.blur();hiddenInput.disabled=true;hiddenInput.setAttribute('inputmode','none')}setupTutorial();tutorialStep=0;updateTutorialUI();openModal(modalWelcome);}
export function toggleTimerMode(){const mode=getModeHandler();if(mode&&mode.hasTimer){showToast('⚠️ Este modo já possui temporizador próprio!');return}state.isTimerMode=!state.isTimerMode;const btn=document.getElementById('timer-mode-btn');if(btn){btn.textContent=state.isTimerMode?'⏱️ Modo Normal':'⏱️ Contra-Relógio';btn.classList.toggle('active',state.isTimerMode)}if(countdownTag){if(state.isTimerMode){countdownTag.textContent=`⏱️ ${state.timerModeLimit}s`;countdownTag.classList.remove('hidden');countdownTag.classList.remove('warning')}else{countdownTag.classList.add('hidden');countdownTag.classList.remove('warning')}}clearInterval(state.timerModeInterval);state.timerModeInterval=null;initTest();}
export function setupShareButton(){const btn=document.getElementById('share-site-btn');if(!btn)return;btn.addEventListener('click',()=>{const url=window.location.href,text='⌨️ Mestre da Digitação - Teste sua velocidade e precisão! 🚀';if(navigator.share){navigator.share({title:'Mestre da Digitação',text,url}).catch(()=>{})}else if(navigator.clipboard){navigator.clipboard.writeText(`${text}\n\n${url}`).then(()=>{showToast('✅ Link copiado! Compartilhe com seus amigos.');btn.textContent='✅ Copiado!';btn.classList.add('success');setTimeout(()=>{btn.textContent='📤 Compartilhar';btn.classList.remove('success')},2000)}).catch(()=>fallbackShare(url,text))}else fallbackShare(url,text)})}
function fallbackShare(url,text){const ta=document.createElement('textarea');ta.value=`${text}\n\n${url}`;ta.style.cssText='position:fixed;opacity:0;left:-9999px;';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');showToast('✅ Link copiado!')}catch(_){showToast(`📋 Copie o link: ${url}`)}document.body.removeChild(ta)}
function showToast(msg){const old=document.querySelector('.toast-message');if(old)old.remove();const div=document.createElement('div');div.className='toast-message';div.textContent=msg;document.body.appendChild(div);setTimeout(()=>{div.style.opacity='0';div.style.transition='opacity 0.3s';setTimeout(()=>div.remove(),300)},2000)}