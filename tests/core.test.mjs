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
const memory=await readFile(new URL('../js/modes/memory.js',import.meta.url),'utf8');
const utils=await readFile(new URL('../js/modules/utils.js',import.meta.url),'utf8');

test('núcleo rejeita colagem, drop e substituição',()=>{assert.match(inputController,/insertFromPaste/);assert.match(inputController,/insertFromDrop/);assert.match(inputController,/insertReplacementText/);assert.match(inputController,/preventDefault/)});
test('contagem e áudio usam o input efetivo',()=>{assert.match(inputController,/const value = input\.value/);assert.match(inputController,/state\.totalTyped/);assert.match(inputController,/audioEngine\.playKey/);assert.match(index,/input-controller\.js/)});
test('reinícios internos sincronizam a base do controlador',()=>{assert.match(inputController,/syncAfterProgrammaticReset/);assert.match(inputController,/_controllerLastLength = 0/)})
test('encerramento protege contra processamento duplicado',()=>{assert.match(typing,/if\(state\._ending\)return/);assert.match(typing,/state\._testEnded=true/)});
test('há uma ação de continuação única para os dez modos ativos',()=>{assert.match(typing,/continue-mode-btn/);for(const id of ['default','fury','survival','sniper','wordhunt','casino','marathon','memory','wave','rpg'])assert.match(typing,new RegExp(id+':'))});
test('RPG usa a mesma ação compartilhada',()=>{assert.match(typing,/id='rpg'/);assert.match(typing,/continueBattle/);assert.doesNotMatch(await readFile(new URL('../js/modes/rpg.js',import.meta.url),'utf8'),/rpg-continue-btn/)});
test('prévia sonora não seleciona o perfil',()=>{assert.match(ui,/sound-preview-btn/);assert.match(ui,/audioEngine\.playPreview\(value\)/);assert.match(audio,/playPreview\(profile=this\.profile\)/);assert.match(audio,/playKey\(false,profile\)/)});
test('prévia não fecha o modal nem salva a seleção',()=>{assert.match(ui,/modal-sound&&e\.target\.closest\('\.sound-preview-btn'\)\)return/);const previewHandler=ui.match(/document\.addEventListener\('click',e=>\{const preview=e\.target\.closest\('\.sound-preview-btn'\)[\s\S]*?\}\);/);assert.ok(previewHandler);assert.doesNotMatch(previewHandler[0],/closeModal\(modalSound\)/);assert.doesNotMatch(previewHandler[0],/setSoundProfile/)});
test('modo memória mantém a frase sem embaralhamento próprio',()=>{assert.match(memory,/this\.textShown=String\(text\?\?state\.currentText\)/);assert.match(memory,/this\.render\(this\.textShown\)/);assert.doesNotMatch(memory,/sort\(/);});
test('Arco-Íris não faz mais parte do catálogo',()=>{assert.doesNotMatch(modes,/rainbowMode|rainbow:/);assert.doesNotMatch(modes,/Arco-Íris/);assert.doesNotMatch(utils,/rainbow:/)});
test('ajuda contextual usa ℹ️ e o botão antigo é removido',()=>{assert.match(ui,/mode-info-btn/);assert.match(ui,/mode-help-trigger.*remove/)});
test('interface reduz seleção/context menu acidentais no mobile',()=>{assert.match(keyboard,/-webkit-touch-callout:none/);assert.match(keyboard,/document\.addEventListener\('contextmenu'/);});
test('troca de modo destrói o anterior antes de inicializar o próximo',()=>{assert.match(modes,/currentMode\?\.destroy|currentMode&&currentMode\.destroy/);assert.match(modes,/initTest\(\{resetMode:false\}\)/)});
