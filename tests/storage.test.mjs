import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaign, chooseOption } from '../src/engine.js';
import { SAVE_KEY, saveCampaign, loadCampaign } from '../src/storage.js';

function memory() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('Guarda y recupera una partida versionada, sin compartir referencias', () => {
  const storage = memory();
  assert.deepEqual(loadCampaign(storage), { ok: true, state: null });
  const state = chooseOption(createCampaign(), 'choice-1');
  assert.equal(saveCampaign(storage, state).ok, true);
  const loaded = loadCampaign(storage);
  assert.equal(loaded.ok, true);
  assert.deepEqual(loaded.state, state);
  loaded.state.node = 'intro';
  assert.deepEqual(loadCampaign(storage).state, state);
});

test('Rechaza corrupción, versiones desconocidas y rutas o contadores manipulados', () => {
  const storage = memory();
  const state = chooseOption(createCampaign(), 'choice-1');
  for (const raw of ['{', 'null', '[]', JSON.stringify({ ...state, version: 99 }),
    JSON.stringify({ ...state, node: 'missing' }), JSON.stringify({ ...state, faction: 'GR' }),
    JSON.stringify({ ...state, results: [{ mission: 'paper', status: 'victory', kills: 999 }] }),
    JSON.stringify({ ...state, history: [{ type: 'choice', node: 'generalChoice', option: 'choice-1' }] }),
    JSON.stringify({ ...state, history: [{ type: 'choice', node: 'intro', option: 'missing' }] }),
    ' '.repeat(250001)]) {
    storage.setItem(SAVE_KEY, raw);
    assert.equal(loadCampaign(storage).ok, false);
    assert.equal(storage.getItem(SAVE_KEY), raw, 'No debe borrar un guardado incompatible.');
  }
});

test('Tolera almacenamiento bloqueado y cuota agotada sin interrumpir el juego', () => {
  const blocked = { getItem() { throw new Error('Bloqueado'); }, setItem() { throw new Error('Cuota agotada'); } };
  assert.equal(loadCampaign(blocked).ok, false);
  assert.equal(saveCampaign(blocked, createCampaign()).ok, false);
  const storage = memory();
  saveCampaign(storage, createCampaign());
  assert.equal(saveCampaign(storage, { ...createCampaign(), node: 'missing' }).ok, false);
  assert.deepEqual(loadCampaign(storage).state, createCampaign());
});
