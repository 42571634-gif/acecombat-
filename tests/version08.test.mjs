import test from 'node:test';
import assert from 'node:assert/strict';
import { missions } from '../src/missions.js';
import { missionContexts,enemyRadio } from '../src/mission-context.js';
import { generateEncounter,stream } from '../src/attempts.js';
import { createCampaign,chooseOption,beginAttempt,resolveMission,validateCampaign,retryMission } from '../src/engine.js';
import { createFlight,damageTarget,advanceFlight } from '../src/combat.js';
import { syncRadio } from '../src/radio.js';
import { advanceWaves } from '../src/waves.js';
import { createMissionLog } from '../src/mission-log.js';
import { environment } from './helpers/dom.mjs';
import { draw } from '../src/draw.js';
import { narrativeCounts } from '../src/communications.js';
import { assessNarrative } from '../src/editorial-policy.js';
const descriptor=(seed=1,difficulty='normal')=>({seed,difficulty,generator:1});
const spoken=lines=>lines.filter(line=>line.kind!=='narration').length;
function finish(f,optional=false,paced=false){
  if(optional)for(const target of f.targets.filter(t=>t.group))damageTarget(f,target,target.hp);
  while(f.status==='active'){
    const targets=f.targets.filter(t=>t.required&&t.alive&&t.active!==false);
    assert.ok(targets.length);
    for(const target of targets){damageTarget(f,target,target.hp);if(paced)syncRadio(f);}
    advanceWaves(f,1);syncRadio(f);
  }
  return {status:f.status,kills:f.kills,completed:f.completed,objectives:f.objectives,integrity:Math.min(f.hp,f.protected?.hp??100),timeRemaining:f.t,attempt:f.attempt};
}
test('52 fichas documentales: guía editorial por recorrido, sin sistema, narración ni alternativas juntas',()=>{
  assert.equal(Object.keys(missionContexts).length,52);
  for(const mission of Object.values(missions)){
    const context=mission.research;
    assert.equal(context.reviewed,'2026-10-18');assert.equal(context.source.url,mission.source.url);
    for(const key of ['situation','condition','consequence','radio'])assert.ok(context[key].length>15,mission.id+' '+key);
    for(const seed of [0,1,19,999,0xffffffff])for(const optional of [false,true])for(const warned of [false,true])for(const paced of [false,true]){
      const f=createFlight(mission.id,mission,0,undefined,{mode:'bullethell',attempt:descriptor(seed)});
      if(warned){f.hp=24;syncRadio(f);}finish(f,optional,paced);
      const total=narrativeCounts([...mission.dialogue,...f.radio,...mission.reportDialogue]).total;
      assert.ok(assessNarrative(mission.id,total).valid,`${mission.id}: ${total}`);
      assert.equal(new Set(f.radio.map(event=>event.id)).size,f.radio.length);
      const loss=createFlight(mission.id,mission,0,undefined,{mode:'bullethell',attempt:descriptor(seed)});loss.t=0;advanceFlight(loss,0);
      const failed=spoken(mission.dialogue)+loss.radio.length;
      assert.ok(assessNarrative(mission.id,failed,{defeat:true}).valid);
    }
  }
  assert.ok(spoken(missions.m07.dialogue)>=8,'La salida de regreso anticipado también satisface el mínimo.');
});
test('Los encuentros son reproducibles, acotados y no alteran secundarios ni elementos especiales',()=>{
  let varied=0;
  for(const mission of Object.values(missions)){
    const counts=new Set();
    for(let seed=0;seed<50;seed++){
      const attempt=descriptor(seed),plan=generateEncounter(mission,attempt);counts.add(plan.total+':'+plan.encounter.waveCount);
      assert.deepEqual(plan,generateEncounter(mission,structuredClone(attempt)));assert.deepEqual(plan.secondary,mission.secondary);
      assert.equal(plan.civilianCount,mission.civilianCount);assert.deepEqual(plan.bossNames,mission.bossNames);
      assert.ok(plan.time>=mission.time&&plan.time<=mission.time*1.25);
      const f=createFlight(mission.id,mission,0,undefined,{mode:'bullethell',attempt});
      if(!plan.encounter.fixed){
        assert.ok(plan.total>=Math.max(3,mission.total-1)&&plan.total<=mission.total+1);
        assert.equal(f.waves.length,plan.encounter.waveCount);
        for(let wave=0;wave<f.waves.length;wave++)assert.ok(f.targets.filter(t=>t.required&&t.wave===wave).length>=2);
      }else assert.equal(plan.total,mission.total);
      const rng=stream(attempt.seed,'missiles'),first=rng();stream(attempt.seed,'terrain')();assert.equal(first,stream(attempt.seed,'missiles')());
    }
    if(counts.size>1)varied++;
  }
  assert.ok(varied>=4);
  assert.throws(()=>generateEncounter(missions.m01,{...descriptor(),generator:99}),/inválido/);
});
test('Guardado v3 conserva la semilla pendiente, migra v2 y rechaza resultados de otra semilla o cantidad',()=>{
  let state=chooseOption(createCampaign({simulatorMission:'m28'}),'choice-1');
  const old=structuredClone(state);old.version=2;delete old.pendingAttempt;
  assert.deepEqual(validateCampaign(old),state);
  state=beginAttempt(state,descriptor(14));assert.deepEqual(validateCampaign(structuredClone(state)),state);
  const f=createFlight('m28',missions.m28,0,undefined,{mode:'bullethell',attempt:state.pendingAttempt}),outcome=finish(f);
  assert.throws(()=>resolveMission(state,{...outcome,attempt:descriptor(15)}),/intento/);
  assert.throws(()=>resolveMission(state,{...outcome,completed:99}),/inválido/);
  const won=resolveMission(state,outcome);assert.deepEqual(validateCampaign(won),won);
  const retry=beginAttempt(retryMission(won),descriptor(21));assert.deepEqual(validateCampaign(retry),retry);
  assert.notEqual(retry.pendingAttempt.seed,state.pendingAttempt.seed);
  assert.deepEqual(retry.results,won.results);
});
test('Radio: orden, umbrales únicos, silencio de futuros enemigos y desenlace único',()=>{
  const f=createFlight('m52',missions.m52,0,undefined,{mode:'bullethell',attempt:descriptor()});
  assert.equal(f.radio.some(event=>event.channel==='enemy'),false);
  f.elapsed=7;f.hp=49;syncRadio(f);syncRadio(f);f.hp=24;syncRadio(f);
  assert.deepEqual(f.radio.filter(event=>event.id.startsWith('integrity')).map(event=>event.id),['integrity-50','integrity-25']);
  finish(f);syncRadio(f);assert.equal(f.radio.filter(event=>event.id==='outcome').length,1);
  assert.equal(f.radio.filter(event=>event.channel==='enemy').length,1);
  for(const [index,event] of f.radio.entries()){assert.equal(event.order,index+1);assert.ok(event.source.url);assert.ok(event.trigger);if(index)assert.ok(event.time>=f.radio[index-1].time);}
  for(const [id,enemy] of Object.entries(enemyRadio)){const other=createFlight(id,missions[id],0,undefined,{mode:'bullethell'});finish(other);assert.ok(other.radio.some(event=>event.channel==='enemy'&&event.message.character===enemy.character),id);}
});
// Doble de IndexedDB con transacciones asincrónicas; también se prueba con el navegador real.
function fakeIDB({abort=false}={}){
  const records=new Map();const db={objectStoreNames:{contains:()=>true},close(){},transaction(){
    const tx={objectStore(){return {put(record){records.set(record.key,structuredClone(record));},getAll(){const req={};queueMicrotask(()=>{req.result=[...records.values()];req.onsuccess?.();});return req;}};}};
    queueMicrotask(()=>queueMicrotask(()=>abort?tx.onabort?.():tx.oncomplete?.()));return tx;
  }};
  return {open(){const req={result:db};queueMicrotask(()=>req.onsuccess?.());return req;}};
}
test('Registro: última victoria/intento por modo, snapshots históricos y persistencia tras reabrir',async()=>{
  const db=fakeIDB(),logs=createMissionLog(db);
  const base={mission:'m01',mode:'campaign',name:'Awakening',result:'victory',startedAt:1,duration:10,participants:['Rena'],messages:[{message:{text:'Mensaje original'}}]};
  assert.equal(await logs.save(base),true);base.messages[0].message.text='Revisión posterior';
  await logs.save({...base,result:'defeat',startedAt:2});await logs.save({...base,mode:'simulator',startedAt:3});
  const reopened=createMissionLog(db),records=await reopened.list('m01');assert.equal(records.length,4);
  assert.equal(records.find(r=>r.key==='campaign:m01:victory').messages[0].message.text,'Mensaje original');
  assert.equal(records.find(r=>r.key==='campaign:m01:attempt').result,'defeat');
  const blocked=createMissionLog({open(){throw new Error('Bloqueado');}});assert.equal(await blocked.save(base),false);assert.equal((await blocked.list()).length,2);
  const failed=createMissionLog(fakeIDB({abort:true}));assert.equal(await failed.save(base),false);assert.equal((await failed.list()).length,2);
});
test('Victoria y derrota animan, esperan confirmación y no duplican resultado ni daño; se puede omitir',()=>{
  for(const victory of [false,true]){
    const env=environment();env.app.simulate('m41');env.clickChoice();
    if(victory)while(env.app.getState().node.endsWith('Combat'))env.actTarget();else env.tick(1000000);
    assert.equal(env.app.getState().results.length,1);assert.equal(env.get('retry').disabled,true);
    const result=env.app.getState().results[0];env.tick(500);assert.equal(env.app.getState().results.length,1);assert.deepEqual(env.app.getState().results[0],result);
    env.tick(2000);assert.equal(env.get('resultSummary').hidden,false);assert.equal(env.get('retry').disabled,false);
    assert.equal(env.intervals.size,0);assert.equal(env.app.getState().results.length,1);
    if(victory){assert.match(env.get('resultSummary').innerHTML,/Continuar al informe/);env.tick(60000);assert.ok(env.get('continueOutcome'));env.get('continueOutcome').onclick();assert.ok(env.get('anotherRoute'));}
    else {assert.match(env.get('combatHint').textContent,/MISIÓN FALLIDA/);env.get('retry').onclick();assert.equal(env.app.getState().results.length,1);}
  }
});
test('Consultar el registro pausa y cerrar restaura el reloj sin activar eventos futuros',async()=>{
  const env=environment(undefined,{battleMode:'bullethell'});env.app.simulate('m52');env.clickChoice();env.tick(100);
  env.get('viewMissionLog').onclick();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(env.get('missionLogPanel').hidden,false);assert.doesNotMatch(env.get('missionLogPanel').innerHTML,/no entienden lo que he intentado/);
  const time=env.get('hudTime').textContent;env.tick(30000);assert.equal(env.get('hudTime').textContent,time);
  env.get('closeMissionLog').onclick();env.tick(100);assert.equal(env.get('missionLogPanel').hidden,true);assert.equal(env.app.getState().results.length,0);
});
test('El juego conserva semilla al cargar y la renueva al reintentar; movimiento reducido omite la animación',()=>{
  const env=environment(undefined,{battleMode:'bullethell'});env.clickChoice();env.clickChoice();
  const first=env.app.getState().pendingAttempt;env.app.load();assert.deepEqual(env.app.getState().pendingAttempt,first);
  env.get('retry').onclick();assert.notEqual(env.app.getState().pendingAttempt.seed,first.seed);
  assert.equal(env.app.getState().results.length,0);
  const reduced=environment(undefined,{reducedMotion:true,animation:true});reduced.app.simulate('m41');reduced.clickChoice();reduced.frame(1000000);
  assert.match(reduced.get('resultSummary').innerHTML,/Misión fallida/);assert.equal(reduced.frames.size,0);assert.equal(reduced.get('retry').disabled,false);
});
test('Ocho escenarios cubren el fondo completo y conservan su geometría cacheada por intento',()=>{
  const biomes=new Set();
  for(const m of Object.values(missions)){
    const f=createFlight(m.id,m,0,undefined,{mode:'bullethell',attempt:descriptor()});biomes.add(f.biome);
    const scenery=f.scenery,rects=[];
    const ctx=new Proxy({},{get:(_,method)=>(...args)=>{if(method==='fillRect')rects.push(args);}});
    draw(f,{getContext:()=>ctx});assert.ok(rects.some(r=>r[0]===0&&r[1]===0&&r[2]===720&&r[3]===420));
    advanceFlight(f,50);assert.equal(f.scenery,scenery);
    assert.deepEqual(f.scenery,createFlight(m.id,m,0,undefined,{mode:'bullethell',attempt:descriptor()}).scenery);
  }
  assert.deepEqual([...biomes].sort(),['city','coast','desert','digital','facility','mountains','orbit','tunnel']);
});
