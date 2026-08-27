import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const typing=await read('../js/modules/typing.js');
const modes=await read('../js/modes/index.js');
const index=await read('../js/main.js');
const ui=await read('../js/modules/ui.js');
const audio=await read('../js/modules/audio.js');
const keyboard=await read('../js/keyboard-focus.js');
const memory=await read('../js/modes/memory.js');
const marathon=await read('../js/modes/marathon.js');
const wave=await read('../js/modes/wave.js');
const rpg=await read('../js/modes/rpg.js');

 test('há uma única fonte de eventos de digitação',()=>{
  assert.match(index,/setupTypingEvents\(\)/);
  assert.doesNotMatch(index,/input-controller\.js/);
  assert.match(typing,/hiddenInput\.addEventListener\('input',handleTyping\)/);
 });

test('entrada rejeita colagem e múltiplos caracteres',()=>{
  assert.match(typing,/insertFromPaste/);assert.match(typing,/insertFromDrop/);assert.match(typing,/insertReplacementText/);assert.match(typing,/event\.data&&event\.data\.length>1/);
});

test('base de entrada é resetada quando um modo troca de frase',()=>{
  assert.match(typing,/if\(hiddenInput\.value\.length===0\)resetControllerBaseline\(\)/);
});

test('temporizadores têm proprietários definidos',()=>{
  assert.match(typing,/if\(mode\?\.hasTimer\)return/);
  assert.match(marathon,/hasTimer:true/);assert.match(marathon,/startTimer\(\)/);
  assert.match(wave,/startWordTimer/);
});

test('Maratona usa cronômetro global, não mecânica de Onda',()=>{
  assert.match(marathon,/timeLimit/);assert.match(marathon,/wordsTyped/);assert.match(marathon,/timeLeft/);
  assert.match(wave,/waveIndex/);assert.match(wave,/timeForWord/);
});

test('Memória bloqueia durante a memorização e libera depois',()=>{
  assert.match(memory,/input\){input\.value='';input\.disabled=true;input\.readOnly=true/);
  assert.match(memory,/input\.readOnly=false;input\.disabled=false/);
  assert.match(memory,/visibility='hidden'/);
});

test('RPG prepara a primeira frase e o baseline',()=>{
  assert.match(rpg,/state\.currentText=text/);assert.match(rpg,/state\.previousInput=''/);assert.match(rpg,/this\.battleOver=false/);
  assert.match(rpg,/document\.dispatchEvent\(new CustomEvent\('rpgReadyForContinue'\)/);
});

test('continuação é única e cobre os dez modos',()=>{
  assert.match(typing,/continue-mode-btn/);
  for(const id of ['default','fury','survival','sniper','wordhunt','casino','marathon','memory','wave','rpg'])assert.match(typing,new RegExp(id+':'));
});

test('RPG usa a continuação compartilhada',()=>{
  assert.match(typing,/continueBattle/);assert.match(typing,/id==='rpg'/);assert.match(typing,/button\.id='continue-mode-btn'/);
});

test('prévia sonora usa o mesmo sintetizador do perfil escolhido',()=>{
  assert.match(ui,/audioEngine\.playPreview\(preview\.dataset\.value\)/);
  assert.match(audio,/playPreview\(profile=this\.profile\)/);
  assert.match(audio,/playKey\(false,profile\)/);
});

test('prévia não seleciona nem fecha o modal',()=>{
  assert.match(ui,/audioEngine\.playPreview\(preview\.dataset\.value\)/);
  assert.doesNotMatch(ui,/setSoundProfile\(preview\.dataset\.value\)/);
});

test('ajuda contextual sai do painel e fica na área da digitação',()=>{
  assert.match(index,/mode-help-trigger/);
  assert.match(index,/ui-v3\.js/);
  const v3=await read('../js/ui-v3.js');
  assert.match(v3,/typing-mode-control/);assert.match(v3,/typing-mode-info/);assert.match(v3,/ids:\['difficulty-trigger','theme-trigger','sound-trigger'\]/);
});

test('teclado acompanha a caixa com animação suave',()=>{
  assert.match(index,/keyboard-focus\.js/);
  assert.match(keyboard,/scrollIntoView\(\{behavior:'smooth'/);
  assert.match(keyboard,/scrollTo\(\{top:savedScrollY,behavior:'smooth'/);
  assert.match(keyboard,/visualViewport/);
});

test('tutorial tem navegação implementada no controlador de UI',()=>{
  assert.match(ui,/tutorial-next/);assert.match(ui,/tutorial-prev/);assert.match(ui,/TOTAL_TUTORIAL_STEPS=5/);
  assert.doesNotMatch(index,/tutorial-navigation\.js/);
});

test('troca de modo encerra timers e destrói o modo anterior',()=>{
  assert.match(modes,/currentMode&&currentMode\.destroy/);assert.match(modes,/clearInterval\(state\.timerInterval\)/);assert.match(modes,/clearTimeout\(state\.autoRestartTimeout\)/);assert.match(modes,/currentMode=newMode/);
});
