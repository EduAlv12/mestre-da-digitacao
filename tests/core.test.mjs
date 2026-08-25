import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const typing = await readFile(new URL('../js/modules/typing.js', import.meta.url), 'utf8');
const modes = await readFile(new URL('../js/modes/index.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../js/main.js', import.meta.url), 'utf8');

test('núcleo rejeita colagem, drop e substituição', () => {
  assert.match(typing, /insertFromPaste/);
  assert.match(typing, /insertFromDrop/);
  assert.match(typing, /insertReplacementText/);
  assert.match(typing, /e\.preventDefault\(\)/);
});

test('núcleo rejeita entrada de múltiplos caracteres no beforeinput', () => {
  assert.match(typing, /e\.data&&e\.data\.length>1/);
});

test('contagem de caracteres ocorre no input efetivo', () => {
  assert.match(typing, /const v=hiddenInput\.value/);
  assert.match(typing, /const prev=state\.previousInput/);
  assert.match(typing, /state\.totalTyped\+=inserted/);
  assert.match(typing, /hiddenInput\.addEventListener\('input',handleTyping\)/);
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

test('reinício zera contadores essenciais', () => {
  for (const token of ['state.totalTyped=0', 'state.errors=0', 'state.startTime=null', 'state.previousInput=\'\'', 'state.currentPPM=0']) {
    assert.match(typing, new RegExp(token.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')));
  }
});

test('troca de modo destrói o modo anterior antes de inicializar o próximo', () => {
  assert.match(modes, /currentMode\?\.destroy\?\.\(\)/);
  assert.match(modes, /initTest\(\{resetMode:false\}\)/);
  assert.match(modes, /currentMode\?\.init\?/);
});

test('troca de modo cancela estado central de execução', () => {
  assert.match(modes, /cleanupModeRuntime/);
  assert.match(modes, /clearInterval\(state\.timerInterval\)/);
  assert.match(modes, /clearTimeout\(state\.autoRestartTimeout\)/);
});

test('aplicação configura os eventos de digitação uma única vez na inicialização', () => {
  const matches = index.match(/setupTypingEvents\(\)/g) ?? [];
  assert.equal(matches.length, 1);
});
