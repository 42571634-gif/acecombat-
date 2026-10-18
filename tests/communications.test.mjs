import test from 'node:test';
import assert from 'node:assert/strict';
import { missions } from '../src/missions.js';
import { createFlight,damageTarget } from '../src/combat.js';
import { advanceWaves } from '../src/waves.js';
import { syncRadio } from '../src/radio.js';
import { communicationCategory,filterCommunications,narrativeCounts } from '../src/communications.js';
import { assessNarrative } from '../src/editorial-policy.js';
import { messageMarkup } from '../src/dialogue-view.js';
import { environment } from './helpers/dom.mjs';
const flight=id=>createFlight(id,missions[id],0,undefined,{mode:'bullethell',attempt:{seed:1,difficulty:'normal',generator:1}});
function phase(f){
 for(const target of f.targets.filter(t=>t.required&&t.active!==false&&t.alive)){damageTarget(f,target,target.hp);syncRadio(f);}
 advanceWaves(f,1);syncRadio(f);
}
test('El sistema no consume cupo narrativo; las órdenes argumentales conservan voz de mando',()=>{
 const f=flight('m52'),before=narrativeCounts(f.radio).total;
 f.hp=24;syncRadio(f);syncRadio(f);
 assert.equal(narrativeCounts(f.radio).total,before);
 assert.deepEqual(filterCommunications(f.radio,'system').filter(x=>x.id.startsWith('integrity')).map(x=>x.id),['integrity-50','integrity-25']);
 assert.equal(communicationCategory({character:'fiona',text:'Cubre la formación y confirma el objetivo.'}),'character');
 assert.ok(missions.m09.dialogue.some(x=>x.character==='control'&&x.category==='command'));
 assert.equal(assessNarrative('m01',7).valid,false);assert.equal(assessNarrative('m33',6).valid,true);
 assert.equal(assessNarrative('m33',21).valid,false);assert.equal(assessNarrative('m52',31).valid,false);
 assert.equal(assessNarrative('m52',1,{defeat:true}).valid,true);
});
test('Los jefes preservan intercambios documentados y no adelantan las fases',()=>{
 const f=flight('m37');assert.equal(f.radio.some(x=>x.message.character==='rena'),false);
 phase(f);assert.equal(f.radio.some(x=>x.message.character==='rena'),false);
 phase(f);assert.ok(f.radio.some(x=>x.message.character==='rena'&&x.channel==='enemy'));
 assert.ok(f.radio.some(x=>x.message.character==='keith'&&/atrapado/.test(x.message.text)));
 phase(f);const farewell=f.radio.find(x=>x.message.recorded);assert.ok(farewell);assert.equal(farewell.message.character,'keith');
 while(f.status==='active')phase(f);syncRadio(f);
 assert.equal(f.radio.filter(x=>x.id==='dision-loss-0').length,1);
 assert.equal(f.radio.find(x=>x.id==='dision-loss-0').channel,'enemy');
 assert.equal(new Set(f.radio.map(x=>x.id)).size,f.radio.length);
 const c=flight('m47');assert.equal(c.radio.some(x=>/generadores Aeon/.test(x.message.text)),false);
 phase(c);assert.ok(c.radio.some(x=>x.message.character==='simon'&&/generadores Aeon/.test(x.message.text)));
});
test('Los eventos contextuales y el agradecimiento opcional se activan una sola vez',()=>{
 const f=flight('m21');assert.equal(f.radio.some(x=>x.id.startsWith('rena-encounter')),false);
 const target=f.targets.find(x=>x.required&&x.active!==false);damageTarget(f,target,target.hp);syncRadio(f);syncRadio(f);
 assert.equal(f.radio.filter(x=>x.id.startsWith('rena-encounter')).length,3);
 assert.equal(f.radio.find(x=>x.id==='rena-encounter-0').channel,'enemy');
 const k=flight('m24');assert.equal(k.radio.some(x=>x.id==='keith-help-0'),false);
 for(const t of k.targets.filter(t=>t.group))damageTarget(k,t,t.hp);syncRadio(k);syncRadio(k);
 assert.equal(k.radio.filter(x=>x.id==='keith-help-0').length,1);
});
test('Los registros anteriores se filtran sin alterar texto, orden, tiempo ni snapshots',()=>{
 const events=[{id:'old-command',time:1,confidence:'community-transcript',message:{character:'control',text:'Interrumpan la escolta.'}},
 {id:'old-hp',time:2,confidence:'operational-adaptation',message:{character:'control',text:'Integridad al 50 %.'}},
 {id:'old-keith',time:3,message:{character:'keith',text:'Te cubro, compañero.'}}];
 const snapshot=structuredClone(events);
 assert.deepEqual(filterCommunications(events).map(x=>x.id),['old-command','old-keith']);
 assert.deepEqual(filterCommunications(events,'system').map(x=>x.id),['old-hp']);
 assert.deepEqual(filterCommunications(events,'all'),snapshot);assert.deepEqual(events,snapshot);
 const html=messageMarkup({...events[1].message,category:'system'});
 assert.match(html,/system-message/);assert.doesNotMatch(html,/avatar|data-character|<img/);
 assert.match(messageMarkup({...events[0].message,category:'command'}),/data-character="control"/);
});
test('Los filtros del registro conservan la pausa y los avisos no desplazan a los personajes',async()=>{
 const env=environment(undefined,{battleMode:'bullethell'});env.app.simulate('m52');env.clickChoice();env.tick(100);
 assert.match(env.get('radioMessages').innerHTML,/data-character=/);
 assert.doesNotMatch(env.get('radioMessages').innerHTML,/system-message/);
 env.get('viewMissionLog').onclick();await new Promise(resolve=>setImmediate(resolve));
 const panel=env.get('missionLogPanel');assert.match(panel.innerHTML,/id="filterConversations" aria-pressed="true"/);
 assert.doesNotMatch(panel.innerHTML,/data-category="system"/);
 const state=structuredClone(env.app.getState()),time=env.get('hudTime').textContent;
 env.get('filterSystem').onclick();assert.match(panel.innerHTML,/data-category="system"/);assert.doesNotMatch(panel.innerHTML,/data-character=/);
 env.tick(50000);assert.equal(env.get('hudTime').textContent,time);
 env.get('filterAll').onclick();assert.match(panel.innerHTML,/data-category="system"/);assert.match(panel.innerHTML,/data-character=/);
 assert.deepEqual(env.app.getState(),state);env.get('closeMissionLog').onclick();assert.equal(panel.hidden,true);
});
