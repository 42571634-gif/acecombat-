import test from 'node:test';
import assert from 'node:assert/strict';
import { missions } from '../src/missions.js';
import { story } from '../src/story.js';
import { environment } from './helpers/dom.mjs';
import { WAVE_PLANS } from '../src/waves.js';

test('Awakening usa el contenido de su página: Neucom, Rena y aviso de refuerzos',()=>{
  const mission=missions.m01;
  assert.equal(mission.source.url,'https://w.atwiki.jp/acacac/pages/11.html');
  assert.match(mission.briefing,/Neucom.*ofensiva/);assert.match(mission.briefing,/Rena/);
  assert.ok(mission.dialogue.some(line=>line.character==='rena'));
  assert.deepEqual(mission.reportDialogue.filter(line=>line.kind!=='narration').map(line=>line.character),['control','fiona','rena']);
  assert.match(WAVE_PLANS.m01[1].label,/Refuerzos/);
  assert.doesNotMatch(mission.goal,/transportes|espacio restringido/);
});

test('La escolta explica el destino, las interferencias y la orden posterior sin anticiparla',()=>{
  assert.match(missions.m09.briefing,/cabo Rainy/);
  assert.doesNotMatch(missions.m09.briefing,/exige derribarlo|cambia las órdenes/);
  const speech=missions.m09.reportDialogue.filter(line=>line.kind!=='narration');
  assert.deepEqual(speech.map(line=>line.character),['park','rena','erich','rena','erich']);
  assert.match(speech[2].text,/interferencias/);
  assert.doesNotMatch(missions.m09.dialogue.map(line=>line.text).join(' '),/llegue a ella|cuarta la revisas|tiempo para una conversación/);
});
test('Los términos y las decisiones se explican en las escenas relevantes',()=>{
  assert.match(missions.m43.dialogue.map(line=>line.text).join(' '),/sublimación: copiar la conciencia/);
  assert.equal(missions.m43.dialogue.at(-1).kind,'narration');
  const rupture=missions.m43.reportDialogue.map(line=>line.text).join(' ');
  assert.match(rupture,/golpe militar/);assert.match(rupture,/unirme a ellos/);assert.match(rupture,/volveré a Neucom/);
  assert.match(missions.m47.dialogue.map(line=>line.text).join(' '),/generadores Aeon de la ciudad/);
  assert.match(story['ending-fiona'].description,/abandonar Neucom/);
});
test('Las referencias siguen visibles y ampliar una escena no añade decisiones ni cambia la partida',()=>{
  const env=environment();env.app.simulate('m43');
  assert.match(env.get('main').innerHTML,/Fuente de esta misión/);
  assert.match(env.get('main').innerHTML,/https:\/\/w.atwiki.jp\/acacac\/pages\/53.html/);
  assert.equal(env.get('actions').children.length,1);assert.equal(env.app.getState().simulatorMission,'m43');
});
