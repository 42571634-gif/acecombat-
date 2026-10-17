import test from 'node:test';
import assert from 'node:assert/strict';
import { story } from '../src/legacy/story.js';
import { missions } from '../src/legacy/missions.js';
import { createCampaign as createAnyCampaign, chooseOption, resolveMission, currentNode, campaignSummary, validateGraph as validateAnyGraph, validateCampaign } from '../src/engine.js';

const createCampaign = () => createAnyCampaign({campaignId:'demo-v1'});
const validateGraph = (nodes=story,catalog=missions) => validateAnyGraph(nodes,catalog);
const victory = state => {
  const mission = missions[currentNode(state).mission];
  return resolveMission(state, { status: 'victory', kills: mission.total, integrity: 100, timeRemaining: mission.time - 3 });
};

test('El grafo tiene destinos válidos y todos sus nodos son alcanzables', () => {
  assert.deepEqual(validateGraph(), []);
  assert.equal(Object.values(story).filter(node => node.kind === 'mission').length, 9);
  assert.equal(Object.values(story).filter(node => node.kind === 'ending').length, 5);
});

test('Detecta nodos inexistentes, misiones inválidas, finales sin marcar y opciones ambiguas', () => {
  const broken = structuredClone(story);
  broken.intro.options[0].next = 'missing';
  broken.awakeningCombat.mission = 'missing';
  broken.intro.options.push({ ...broken.intro.options[0], effects: { faction: 'missing' } });
  broken.upeoChoiceEnding.kind = 'dialogue';
  const errors = validateGraph(broken);
  for (const expected of ['destino inexistente', 'misión inexistente', 'sin opciones', 'duplicada', 'efectos inválidos', 'inaccesible'])
    assert.ok(errors.some(error => error.includes(expected)), expected);
});

test('Las cinco rutas se completan con sus facciones y contadores originales', () => {
  const endings = [];
  function walk(state) {
    assert.deepEqual(validateCampaign(state), state);
    const node = currentNode(state);
    if (node.kind === 'ending') {
      endings.push({ label: node.label, faction: state.faction, ...campaignSummary(state) });
      return;
    }
    if (node.kind === 'mission') { walk(victory(state)); return; }
    for (const option of node.options) {
      const snapshot = structuredClone(state);
      const next = chooseOption(state, option.id);
      assert.deepEqual(state, snapshot, 'Las decisiones no mutan su estado de entrada.');
      assert.deepEqual(next, chooseOption(state, option.id), 'La decisión es determinista.');
      walk(next);
    }
  }
  walk(createCampaign());
  assert.deepEqual(endings, [
    { label: 'UPEO', faction: 'UPEO', missionCount: 5, kills: 26 },
    { label: 'General Resource', faction: 'GR', missionCount: 5, kills: 25 },
    { label: 'Ouroboros · Dision', faction: 'OUROBOROS', missionCount: 6, kills: 31 },
    { label: 'Neucom', faction: 'NEUCOM', missionCount: 6, kills: 30 },
    { label: 'Ouroboros · Cynthia', faction: 'OUROBOROS', missionCount: 7, kills: 36 },
  ]);
});

test('Rechaza decisiones inexistentes, condiciones incumplidas y acciones fuera de contexto', () => {
  assert.throws(() => chooseOption(createCampaign(), 'inventada'), /Decisión/);
  assert.throws(() => chooseOption({ ...createCampaign(), node: 'missing' }, 'choice-1'), /Nodo inexistente/);
  assert.throws(() => chooseOption({ ...createCampaign(), node: 'generalChoice' }, 'choice-1'), /no disponible/);
  assert.throws(() => chooseOption({ ...createCampaign(), node: 'awakeningCombat' }, 'choice-1'), /No hay decisiones/);
  assert.throws(() => resolveMission(createCampaign(), {}), /No hay una misión/);
});

test('Una derrota mantiene la misión pendiente y el reintento no duplica victorias ni bajas', () => {
  const initial = chooseOption(chooseOption(createCampaign(), 'choice-1'), 'choice-1');
  const lost = resolveMission(initial, { status: 'defeat', kills: 2, integrity: 70, timeRemaining: 0 });
  assert.equal(lost.node, 'awakeningCombat');
  assert.deepEqual(campaignSummary(lost), { missionCount: 0, kills: 0 });
  const won = victory(lost);
  assert.equal(won.results.length, 2);
  assert.deepEqual(campaignSummary(won), { missionCount: 1, kills: 5 });
  assert.throws(() => resolveMission(won, {}), /No hay una misión/);
  assert.deepEqual(validateCampaign(won), won);
  for (const outcome of [
    { status: 'victory', kills: 4, integrity: 100, timeRemaining: 1 },
    { status: 'victory', kills: 5, integrity: 100, timeRemaining: 0 },
    { status: 'defeat', kills: 2, integrity: 100, timeRemaining: 20 },
    { status: 'defeat', kills: -1, integrity: 0, timeRemaining: 10 },
    { status: 'defeat', kills: 0, integrity: 0, timeRemaining: NaN },
  ]) assert.throws(() => resolveMission(initial, outcome), /inválido/);
});
