import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const typing=await readFile(new URL('../js/modules/typing.js',import.meta.url),'utf8');
const inputController=await readFile(new URL('../js/input-controller.js',import.meta.url),'utf8');
const modes=await readFile(new URL('../js/modes/index.js',import.meta.url),'utf8');
const index=await readFile(new URL('../js/main.js',import.meta.url),'utf8');
const ui=await readFile(new URL('../js/modules/ui.js',import.meta.url),'utf8');
const audio=await readFile(new URL('../js/modules/audio.js',import.meta.url),'utf8');
const keyboard=await readFile(new URL('../js/keyboard-focus.js',import.meta.url),'utf8');
const tutorial=await readFile(new URL('../js/tutorial-navigation.js',import.meta.url),'utf8');
const memory=await readFile(new URL('../js/modes/memory.js',import.meta.url),'utf8');
const marathon=await readFile(new URL('../js/modes/marathon.js',import.meta.url),'utf8');
const wave=await readFile(new URL('../js/modes/wave.js',import.meta.url),'utf8');
const rpg=await readFile(new URL('../js/modes/rpg.js',import.meta.url),'utf8');
const utils=await readFile(new URL('../js/modules/utils.js',import.meta.url),'utf8');

test('núcleo rejeita colagem, drop e substituição',()=>{assert.match(inputController,/insertFromPaste/);assert.match(inputController,/insertFromDrop/);assert.match(inputController,/insertReplacementText/);assert.match(inputController,/preventDefault/)});
test('contagem e áudio usam o input efetivo',()=>{assert.match(inputController,/const value = input\.value/);assert.match(inputController,/state\.totalTyped/);assert.match(inputController,/audioEngine\.playKey/);assert.match(index,/input-controller\.js/)});
test('reinícios internos sincronizam a base do controlador',()=>{assert.match(inputController,/syncAfterProgrammaticReset/);assert.match(inputController,/_controllerLastLength=0|_controllerLastLength = 0/)})
test('modos com temporizador recebem controle de timer próprio',()=>{assert.match(inputController,/mode\?\.hasTimer/);assert.match(inputController,/mode\.startTimer/);assert.match(marathon,/hasTimer:true/);assert.match(marathon,/startTimer\(\)/);assert.match(wave,/startWordTimer/)});
test('Maratona é distinta da Onda',()=>{assert.match(marathon,/timeLimit/);assert.match(marathon,/wordsTyped/);assert.match(wave,/waveIndex/);assert.match(wave,/timeForWord/)});
test('modo memória libera a entrada depois da fase de memorização',()=>{assert.match(memory,/input\)\{input\.readOnly=false;input\.disabled=false/);assert.match(memory,/if\(!this\.hidden\)return/);assert.match(memory,/visibility='hidden'/)});
test('RPG inicializa texto e baseline da primeira batalha explicitamente',()=>{assert.match(rpg,/state\.currentText=text/);assert.match(rpg,/state\._controllerLastLength=0/);assert.match(rpg,/this\.battleOver=false/)});
test('encerramento protege contra processamento duplicado',()=>{assert.match(typing,/if\(state\._ending\)return/);assert.match(typing,/state\._testEnded=true/)});
test('há uma ação de continuação única para os dez modos ativos',()=>{assert.match(typing,/continue-mode-btn/);for(const id of ['default','fury','survival','sniper','wordhunt','casino','marathon','memory','wave','rpg'])assert.match(typing,new RegExp(id+':'))});
test('prévia sonora não seleciona o perfil',()=>{assert.match(ui,/sound-preview-btn/);assert.match(ui,/audioEngine\.playPreview\(value\)/);assert.match(audio,/playPreview\(profile=this\.profile\)/);assert.match(audio,/playKey\(false,profile\)/)});
test('prévia não fecha o modal nem salva a seleção',()=>{assert.match(ui,/modal-sound&&e\.target\.closest\('\.sound-preview-btn'\)\)return/);const previewHandler=ui.match(/document\.addEventListener\('click',e=>\{const preview=e\.target\.closest\('\.sound-preview-btn'\)[\s\S]*?\}\);/);assert.ok(previewHandler);assert.doesNotMatch(previewHandler[0],/closeModal\(modalSound\)/);assert.doesNotMatch(previewHandler[0],/setSoundProfile/)});
test('Arco-Íris não faz mais parte do catálogo',()=>{assert.doesNotMatch(modes,/rainbowMode|rainbow:/);assert.doesNotMatch(modes,/Arco-Íris/);assert.doesNotMatch(utils,/rainbow:/)});
test('ajuda contextual está fora do painel de configurações',()=>{assert.match(index,/mode-help-trigger/);assert.match(await readFile(new URL('../js/ui-v3.js',import.meta.url),'utf8'),/typing-mode-info/);assert.doesNotMatch(await readFile(new URL('../js/ui-v3.js',import.meta.url),'utf8'),/ids:\['difficulty-trigger','theme-trigger','sound-trigger','mode-help-trigger'/)});
test('interface reduz seleção/context menu acidentais no mobile',()=>{assert.match(keyboard,/-webkit-touch-callout:none/);assert.match(keyboard,/document\.addEventListener\('contextmenu'/);assert.match(keyboard,/scrollIntoView\(\{behavior:'smooth'/);assert.match(keyboard,/scrollTo\(\{top:savedScrollY,behavior:'smooth'/)});
test('tutorial possui navegação por clique e gesto',()=>{assert.match(index,/tutorial-navigation\.js/);assert.match(tutorial,/tutorial-next/);assert.match(tutorial,/tutorial-prev/);assert.match(tutorial,/touchstart/);assert.match(tutorial,/touchend/)});
test('troca de modo destrói o anterior antes de inicializar o próximo',()=>{assert.match(modes,/currentMode&&currentMode\.destroy/);assert.match(modes,/initTest\(\{resetMode:false\}\)*/)});
