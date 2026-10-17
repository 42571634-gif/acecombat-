import test from 'node:test';
import assert from 'node:assert/strict';
import { missions } from '../src/missions.js';
import { narration,situateScene } from '../src/scene-narration.js';
import { messageMarkup } from '../src/dialogue-view.js';
import { environment } from './helpers/dom.mjs';

test('La narración distingue cambios de escenario y ocupa su lugar entre réplicas',()=>{
  const scene=missions.m09.dialogue;
  assert.equal(scene[0].kind,'narration');assert.match(scene[0].text,/Clarkson y Fiona viajan en el transporte/);
  assert.equal(scene[5].kind,'narration');assert.equal(scene[6].character,'control');
  assert.match(missions.m09.reportDialogue[0].text,/sigue en vuelo.*Park/);
  assert.match(missions.m41.dialogue[0].text,/fuera de la atmósfera/);
  const input=[{text:'Una réplica'}];assert.deepEqual(situateScene(2,input),input);
  assert.equal(input.length,1);
});
test('Los puentes se muestran como narración accesible sin interlocutor ni retrato y escapan HTML',()=>{
  const html=messageMarkup(narration('<salto>','Tiempo & lugar'));
  assert.match(html,/aria-label="Narración"/);assert.match(html,/&lt;salto&gt;/);assert.match(html,/Tiempo &amp; lugar/);
  assert.doesNotMatch(html,/avatar|data-character|<img/);
  const env=environment();env.app.simulate('m09');
  assert.match(env.get('main').innerHTML,/class="scene-narration"/);
  assert.equal(env.get('actions').children.length,1);
});
