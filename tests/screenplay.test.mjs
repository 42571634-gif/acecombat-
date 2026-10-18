import test from 'node:test';
import assert from 'node:assert/strict';
import { characters,dialogueLine } from '../src/characters.js';
import { missions } from '../src/missions.js';
import { story } from '../src/story.js';
import { environment } from './helpers/dom.mjs';

test('Todas las intervenciones tienen un interlocutor definido; Nemo no recibe voz inventada',()=>{
  const lines=[...story.intro.dialogue,...Object.values(missions).flatMap(m=>[...m.dialogue,...m.reportDialogue])].filter(line=>line.kind!=='narration');
  assert.ok(lines.length>0);
  for(const line of lines){
    const profile=characters[line.character];assert.ok(profile,line.speaker);
    assert.equal(line.speaker,profile.name);assert.ok(line.text.trim());
    assert.ok(profile.source.startsWith('https://'));assert.ok(profile.documented&&profile.voice&&profile.want&&profile.fear);
    assert.equal(profile.interpretation,true);assert.equal(profile.adaptation,true);
    assert.notEqual(line.character,'nemo');
  }
  assert.throws(()=>dialogueLine(['unknown','texto']),/Personaje desconocido/);
});

test('La continuidad evita interlocutores de otras rutas y distingue las grabaciones de los fallecidos',()=>{
  for(let n=10;n<=18;n++){
    const mission=missions['m'+String(n).padStart(2,'0')];
    assert.ok([...mission.dialogue,...mission.reportDialogue].every(d=>d.character!=='fiona'&&d.character!=='clarkson'));
  }
  assert.ok(missions.m43.dialogue.some(d=>d.character==='fiona'));
  assert.ok(missions.m43.dialogue.some(d=>d.character==='cynthia'));
  for(let n=44;n<=47;n++)assert.ok([...missions['m'+n].dialogue,...missions['m'+n].reportDialogue].every(d=>d.character!=='fiona'));
  for(let n=48;n<=52;n++)assert.ok([...missions['m'+n].dialogue,...missions['m'+n].reportDialogue].every(d=>d.character!=='cynthia'||n===52&&d.recorded&&d.direction.includes('digital')));
  for(const [id,character] of [['m32','keith'],['m37','keith'],['m38','dision']]){
    const replay=missions[id].reportDialogue.filter(d=>d.character===character);
    assert.ok(replay.length);assert.ok(replay.every(d=>d.recorded&&d.direction));
  }
  assert.ok(missions.m33.dialogue.every(d=>d.character!=='keith'));
  // Simon interviene solo en las operaciones donde su apoyo está documentado.
  for(const m of Object.values(missions))if(m.number!==47&&m.number!==52)assert.ok([...m.dialogue,...m.reportDialogue].every(d=>d.character!=='simon'));
});

test('La interfaz presenta voces, iniciales y acotaciones sin cambiar decisiones ni simulaciones',()=>{
  const env=environment();
  assert.match(env.get('main').innerHTML,/data-character="erich"/);
  assert.match(env.get('main').innerHTML,/class="direction"/);
  assert.match(env.get('main').innerHTML,/>EJ<|>FI</);
  env.app.simulate('m43');
  assert.match(env.get('main').innerHTML,/data-character="cynthia"/);
  assert.match(env.get('main').innerHTML,/data-character="fiona"/);
  assert.equal(env.get('actions').children.length,1,'El simulador sigue ofreciendo solo el despegue.');
  assert.equal(env.app.getState().simulatorMission,'m43');
});
