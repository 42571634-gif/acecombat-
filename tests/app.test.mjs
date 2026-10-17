import test from 'node:test';
import assert from 'node:assert/strict';
import { currentNode, createCampaign as createAnyCampaign } from '../src/engine.js';
import { loadCampaign, SAVE_KEY } from '../src/storage.js';

import { environment as createEnvironment } from './helpers/dom.mjs';
const environment = storage => createEnvironment(storage,{campaignId:'demo-v1'});
const createCampaign = () => createAnyCampaign({campaignId:'demo-v1'});

function launch(env) { env.clickChoice(); env.clickChoice(); }
function win(env) { while (currentNode(env.app.getState()).kind === 'mission') env.shoot(); }

test('La interfaz permite completar UPEO, guardar su final y comenzar otra campaña', () => {
  const env = environment();
  while (currentNode(env.app.getState()).kind !== 'ending') {
    if (currentNode(env.app.getState()).kind === 'mission') { win(env); env.flush(); }
    else env.clickChoice();
  }
  assert.match(env.get('main').innerHTML, /FIN DE RUTA · UPEO/);
  assert.equal(env.get('missions').textContent, 5);
  assert.equal(env.get('kills').textContent, 26);
  assert.deepEqual(loadCampaign(env.storage).state, env.app.getState());
  const reopened = environment(env.storage);
  assert.equal(reopened.get('load').disabled, false);
  reopened.get('load').onclick();
  assert.match(reopened.get('main').innerHTML, /FIN DE RUTA · UPEO/);
  reopened.get('anotherRoute').onclick();
  assert.deepEqual(reopened.app.getState(), createCampaign());
  assert.deepEqual(loadCampaign(env.storage).state, createCampaign());
});

test('Cargar durante combate reinicia la misión y los reintentos no acumulan bajas parciales', () => {
  const env = environment();
  launch(env);
  env.shoot();
  assert.equal(env.get('kills').textContent, 1);
  env.get('save').onclick();
  const reopened = environment(env.storage);
  assert.equal(reopened.app.getState().node, 'intro');
  reopened.get('load').onclick();
  assert.equal(reopened.app.getState().node, 'awakeningCombat');
  assert.equal(reopened.get('kills').textContent, 0);
  assert.match(reopened.get('main').innerHTML, /TIEMPO 55s/);
  reopened.shoot();
  reopened.get('retry').onclick();
  assert.equal(reopened.get('kills').textContent, 0);
  assert.equal(reopened.intervals.size, 1);
  win(reopened);
  reopened.flush();
  assert.equal(reopened.get('kills').textContent, 5);
  assert.equal(reopened.get('missions').textContent, 1);
});

test('Reiniciar cancela la transición pendiente y una devolución antigua no salta de misión', () => {
  const env = environment();
  launch(env);
  win(env);
  const oldCallback = [...env.delays.values()][0];
  assert.equal(env.get('retry').disabled, true);
  env.get('reset').onclick();
  assert.equal(env.delays.size, 0);
  launch(env);
  oldCallback();
  assert.equal(env.app.getState().node, 'awakeningCombat');
  assert.equal(env.intervals.size, 1);
  assert.equal(env.get('kills').textContent, 0);
});

test('La derrota permite reintentar; ocultar la pestaña pausa el reloj y limpia controles', () => {
  const env = environment();
  launch(env);
  env.get('left').onpointerdown({ preventDefault() {}, pointerId: 1 });
  env.tick(100);
  const position = env.drawing.x;
  env.document.hidden = true;
  env.listeners.get('visibilitychange')();
  env.tick(60000);
  env.document.hidden = false;
  env.listeners.get('visibilitychange')();
  env.tick(1000);
  assert.equal(env.get('hudTime').textContent, 'TIEMPO 54s');
  assert.equal(env.drawing.x, position, 'No quedan controles pulsados tras ocultar la pestaña.');
  env.tick(54000);
  assert.equal(env.app.getState().node, 'awakeningCombat');
  assert.equal(env.app.getState().results[0].status, 'defeat');
  assert.match(env.get('combatHint').textContent, /MISIÓN FALLIDA/);
  env.get('retry').onclick();
  win(env);
  env.flush();
  assert.equal(env.app.getState().node, 'afterAwakening');
  assert.equal(env.app.getState().results.length, 2);
});

test('Los guardados corruptos o bloqueados no impiden jugar ni dejan la interfaz a medias', () => {
  const storage = { getItem() { throw new Error('Bloqueado'); }, setItem() { throw new Error('Bloqueado'); } };
  const env = environment(storage);
  assert.match(env.get('saveStatus').textContent, /No se pudo cargar/);
  launch(env);
  assert.equal(env.app.getState().node, 'awakeningCombat');
  assert.match(env.get('saveStatus').textContent, /seguir jugando/);
  const loaded = environment();
  loaded.clickChoice();
  loaded.storage.setItem(SAVE_KEY, '{');
  loaded.app.load();
  assert.equal(loaded.app.getState().node, 'awakeningIntro');
  assert.match(loaded.get('saveStatus').textContent, /No se pudo cargar/);
});
