import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const typing = await readFile(new URL('../js/modules/typing.js', import.meta.url), 'utf8');
const inputController = await readFile(new URL('../js/input-controller.js', import.meta.url), 'utf8');
const modes = await readFile(new URL('../js/modes/index.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../js/main.js', import.meta.url), 'utf8');
const ui = await readFile(new URL('../js/modules/ui.js', import.meta.url), 'utf8');
const audio = await readFile(new URL('../js/modules/audio.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const memory = await readFile(new URL('../js/modes/memory.js', import.meta.url), 'utf8');

test('núcleo rejeita colagem, drop e substituição', () => {
  assert.match(inputController, /insertFromPaste/);
  assert.match(inputController, /insertFromDrop/);
  assert.match(inputController, /insertReplacementText/);
  assert.match(inputController, /event\.preventDefault\(\)/);
});

test('controlador rejeita entrada de múltiplos caracteres no beforeinput', () => {
  assert.match(inputController, /inputType/);
});

test('contagem e áudio usam o input efetivo', () => {
  assert.match(inputController, /const value = input\.value/);
  assert.match(inputController, /state\.totalTyped/);
  assert.match(inputController, /audioEngine\.playKey/);
  assert.match(index, /input-controller\.js/);
});

test('reinícios internos de modos sincronizam a base do controlador', () => {
  assert.match(inputController, /syncAfterProgrammaticReset/);
  assert.match(inputController, /_controllerLastLength = 0/);
});

test('primeira entrada inicia a sessão e o timer não inicia no initTest', () => {
  assert.match(typing, /if\(!state\.isRunning&&v\.length\)startTimer\(\)/);
  assert.match(typing, /state\.startTime=null/);
});

test('encerramento limpa timers e impede processamento duplicado', () => {
  assert.match(typing, /if\(state\._ending\)return/);
  assert.match(typing, /clearInterval\(state\.timerInterval\)/);
  assert.match(typing, /state\.timerInterval=null/);
  assert.match(typing, /state\.isRunning=false/);
});

test('modo normal expõe continuação após a sessão', () => {
  assert.match(html, /id="normal-continue-btn"/);
  assert.match(typing, /normal-continue-btn/);
  assert.match(typing, /state\._testEnded=true/);
});

test('prévia sonora não seleciona o perfil', () => {
  assert.match(ui, /modal-sound&&e\.target\.closest\('\.sound-preview-btn'\)\)return/);
  assert.match(ui, /audioEngine\.playPreview\(value\)/);
  assert.match(audio, /playPreview\(profile=this\.profile\)/);
  assert.doesNotMatch(ui, /const currentProfile = audioEngine\.profile/);
});

test('prévia usa o mesmo caminho de síntese das teclas', () => {
  assert.match(audio, /this\.playKey\(false,profile\)/);
  assert.match(audio, /profileOverride/);
});

test('modo memória realmente oculta o texto durante a fase de digitação', () => {
  assert.match(memory, /display\.style\.visibility='hidden'/);
  assert.match(memory, /display\.style\.visibility='visible'/);
});

test('troca de modo destrói o modo anterior antes de inicializar o próximo', () => {
  assert.match(modes, /currentMode&&currentMode\.destroy/);
  assert.match(modes, /initTest\(\{resetMode:false\}\)/);
  assert.match(modes, /const newMode=MODES\[id\]/);
  assert.match(modes, /currentMode=newMode/);
});

test('troca de modo cancela estado central de execução', () => {
  assert.match(modes, /cleanupModeTransition/);
  assert.match(modes, /clearInterval\(state\.timerInterval\)/);
  assert.match(modes, /clearTimeout\(state\.autoRestartTimeout\)/);
});

test('Contra-Relógio aposentado não permanece como ação visível', async () => {
  assert.match(index, /timer-mode-btn/);
  const uiV3 = await readFile(new URL('../js/ui-v3.js', import.meta.url), 'utf8');
  assert.match(uiV3, /timer-mode-btn.*remove/);
});
