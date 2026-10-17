import test from 'node:test';
import assert from 'node:assert/strict';
import { missions, TYPE_RULES } from '../src/missions.js';
import { story, routeEdges } from '../src/story.js';
import { createCampaign,currentNode,chooseOption,resolveMission,canChoose,validateGraph,validateCampaign,missionById } from '../src/engine.js';
import { createFlight,advanceFlight,fireMissile,isTargetLocked } from '../src/combat.js';
import { loadCampaign,saveCampaign,SAVE_KEY,SIMULATOR_KEY,loadProfile } from '../src/storage.js';
import * as legacy from '../src/legacy/engine.js';
import { environment } from './helpers/dom.mjs';

function play(mission,secondaryCount=0){
  const flight=createFlight(mission.id,mission,0);
  const optional=flight.targets.filter(target=>target.group).slice(0,secondaryCount);
  const required=flight.targets.filter(target=>target.required);
  let time=0;
  for(const target of [...optional,...required]){
    while(target.alive){
      time+=500;advanceFlight(flight,time);
      assert.equal(flight.status,'active',`${mission.name} no debe fallar antes de atacar.`);
      if(target.role==='gate')flight.x=target.x;
      assert.equal(fireMissile(flight,target.x,target.y),true,`${mission.name}: ${target.label}`);
    }
  }
  assert.equal(flight.status,'victory',mission.name);
  return {status:'victory',kills:flight.kills,completed:flight.completed,objectives:flight.objectives,integrity:flight.hp,timeRemaining:flight.t};
}
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};

test('Catálogo de 52 misiones únicas, ordenadas, desarrolladas y con fuente por capítulo',()=>{
  const catalog=Object.values(missions);
  assert.equal(catalog.length,52);
  assert.deepEqual(catalog.map(mission=>mission.number),Array.from({length:52},(_,i)=>i+1));
  assert.equal(new Set(catalog.map(mission=>mission.name)).size,52);
  assert.equal(catalog[0].name,'Awakening');assert.equal(catalog[51].name,'Sole Survivor');
  for(const mission of catalog){
    assert.ok(mission.briefing.length>100&&mission.report.length>100,mission.name);
    assert.ok(mission.dialogue.filter(line=>line.kind!=='narration').length>=6);
    assert.ok(story[mission.id+'Report'].dialogue.filter(line=>line.kind!=='narration').length>=3);
    assert.ok(mission.dialogue.every(line=>(line.kind==='narration'||line.speaker)&&line.text.trim().length>0));
    assert.equal(mission.source.url,`https://w.atwiki.jp/acacac/pages/${mission.number+10}.html`);
    assert.equal(mission.adaptation,true);assert.equal(mission.confidence,'community-transcript');
    assert.ok(TYPE_RULES[mission.type]);
    for(const suffix of ['Intro','Combat','Report'])assert.ok(story[mission.id+suffix]);
  }
  assert.deepEqual(validateGraph(),[]);
  assert.equal(Object.values(story).filter(node=>node.kind==='mission').length,52);
  assert.equal(Object.values(story).filter(node=>node.kind==='ending').length,5);
});

test('Las 52 misiones pueden ganarse con su simulación real y guardar su resultado',()=>{
  for(const mission of Object.values(missions)){
    let state=createCampaign({simulatorMission:mission.id});
    state=chooseOption(state,'choice-1');
    state=resolveMission(state,play(mission,mission.secondary?.count||0));
    assert.equal(state.node,'simulatorComplete');assert.equal(currentNode(state).kind,'ending');
    assert.deepEqual(validateCampaign(state),state);
    const storage=memory();assert.equal(saveCampaign(storage,state).ok,true);
    assert.deepEqual(loadCampaign(storage,{simulator:true}).state,state);
  }
});

test('Recorrer todas las decisiones y resultados de bifurcación alcanza 52 misiones y cinco finales',()=>{
  const seen=new Set(),endings=new Set(),lengths=[];
  function walk(state,depth=0){
    assert.ok(depth<100,'La campaña debe terminar sin ciclos.');
    const node=currentNode(state);
    if(node.kind==='ending'){
      endings.add(state.node);lengths.push(state.results.length);
      assert.deepEqual(validateCampaign(state),state);return;
    }
    if(node.kind==='mission'){
      const mission=missionById(state,node.mission);seen.add(mission.id);
      for(const count of mission.secondary?[0,mission.secondary.count]:[0])walk(resolveMission(state,play(mission,count)),depth+1);
      return;
    }
    const available=node.options.filter(option=>canChoose(state,option));
    assert.ok(available.length,`${state.node}: al menos una salida disponible.`);
    for(const option of available){
      const snapshot=structuredClone(state);const next=chooseOption(state,option.id);
      assert.deepEqual(state,snapshot);assert.deepEqual(next,chooseOption(state,option.id));walk(next,depth+1);
    }
  }
  walk(createCampaign());
  assert.equal(seen.size,52);assert.equal(endings.size,5);
  assert.ok(Math.max(...lengths)<=19&&Math.min(...lengths)<19,'Las 52 misiones no son una sola secuencia obligatoria.');
});

test('Las conexiones principales corresponden a las rutas japonesas, sin atajo GR→Neucom',()=>{
  const expected={m04:[5,19],m06:[7,8],m07:[9,8],m09:[10,39],m20:[21,22],m24:[25,26],m28:[29,34],m30:[31,32],m34:[35,36],m39:[40,41],m43:[44,48],m48:[49,50]};
  for(const [mission,exits] of Object.entries(expected))assert.deepEqual(routeEdges[mission],exits);
  assert.ok(!routeEdges.m28.includes(39));
  assert.equal(story.m44Report.options[0].effects.faction,'NEUCOM');
});

test('Los umbrales de objetivos habilitan una única salida y bloquean decisiones manipuladas',()=>{
  for(const [id,count] of [['m06',1],['m20',1],['m24',1],['m30',1],['m34',3],['m39',7],['m48',3]]){
    for(const achieved of [0,count-1,count]){
      // Estado de briefing mediante una campaña real; se busca una ruta que alcance la misión.
      let found;
      function find(state){
        if(found)return;
        if(state.node===id+'Combat'){found=state;return;}
        const node=currentNode(state);
        if(node.kind==='ending')return;
        if(node.kind==='mission'){
          const mission=missionById(state,node.mission);
          for(const n of mission.secondary?[0,mission.secondary.count]:[0])find(resolveMission(state,play(mission,n)));
        }else for(const option of node.options.filter(option=>canChoose(state,option)))find(chooseOption(state,option.id));
      }
      find(createCampaign());assert.ok(found,id);
      const report=resolveMission(found,play(missions[id],achieved));
      const options=currentNode(report).options;
      assert.equal(options.filter(option=>canChoose(report,option)).length,1,id);
      const unavailable=options.find(option=>!canChoose(report,option));
      assert.throws(()=>chooseOption(report,unavailable.id),/no disponible/);
      assert.deepEqual(validateCampaign(report),report);
    }
  }
});

test('Jefes por fases, reconocimiento sin bajas y civiles protegidos tienen reglas distintas',()=>{
  const boss=createFlight('m47',missions.m47,0),core=boss.targets.find(target=>target.role==='boss');
  assert.equal(isTargetLocked(boss,core),true);assert.equal(fireMissile(boss,core.x,core.y),false);
  assert.equal(play(missions.m06,1).kills,0);
  assert.equal(play(missions.m13).kills,0);
  assert.equal(play(missions.m51).kills,0);
  assert.equal(play(missions.m31).kills,2,'Geofront Attack exige destruir soportes después del corredor.');
  const escort=createFlight('m08',missions.m08,0);
  fireMissile(escort,escort.protected.x,escort.protected.y);
  assert.equal(escort.status,'defeat');
  const naval=createFlight('m04',missions.m04,0),civil=naval.targets.find(target=>target.role==='civilian');
  fireMissile(naval,civil.x,civil.y);assert.equal(naval.status,'defeat');assert.equal(naval.hp,0);
  const final=createFlight('m52',missions.m52,0);
  for(const target of final.targets.filter(target=>target.role==='generator'))target.alive=false;
  const bosses=final.targets.filter(target=>target.role==='boss');
  assert.equal(isTargetLocked(final,bosses[0]),false);
  assert.equal(isTargetLocked(final,bosses[1]),true);
  bosses[0].alive=false;
  assert.equal(isTargetLocked(final,bosses[1]),false);
});

test('Se rechazan objetivos inventados, contadores imposibles y grafos con ciclos',()=>{
  let state=createCampaign({simulatorMission:'m39'});state=chooseOption(state,'choice-1');
  const valid=play(missions.m39,7);
  assert.throws(()=>resolveMission(state,{...valid,objectives:{infrastructure:8}}),/inválido/);
  assert.throws(()=>resolveMission(state,{...valid,kills:0}),/Bajas incompatibles/);
  assert.throws(()=>resolveMission(state,{...valid,objectives:{infrastructure:7,invented:1}}),/inválido/);
  const broken=structuredClone(story);broken.m01Report.options[0].next='m01Intro';
  assert.ok(validateGraph(broken).some(error=>error.includes('ciclo')));
});

test('Migración v1 conserva exactamente decisiones y resultados de la demo anterior',()=>{
  const storage=memory();let old=legacy.chooseOption(legacy.createCampaign(),'choice-1');
  old=legacy.chooseOption(old,'choice-1');
  old=legacy.resolveMission(old,{status:'victory',kills:5,integrity:100,timeRemaining:50});
  storage.setItem(SAVE_KEY,JSON.stringify(old));
  const loaded=loadCampaign(storage);assert.equal(loaded.ok,true);assert.equal(loaded.migrated,true);
  assert.equal(loaded.state.version,2);assert.equal(loaded.state.campaignId,'demo-v1');
  assert.deepEqual(loaded.state.history,old.history);assert.deepEqual(loaded.state.results,old.results);
  assert.deepEqual(validateCampaign(loaded.state),loaded.state);
  assert.equal(saveCampaign(storage,loaded.state).ok,true);
});

test('Simulador y campaña guardan en ranuras diferentes y el perfil persiste tras reiniciar',()=>{
  const env=environment();env.clickChoice();const campaign=env.storage.getItem(SAVE_KEY);
  env.app.simulate('m41');env.clickChoice();
  while(currentNode(env.app.getState()).kind==='mission')env.actTarget();
  env.flush();assert.equal(env.app.getState().node,'simulatorComplete');
  assert.equal(env.storage.getItem(SAVE_KEY),campaign);assert.ok(env.storage.getItem(SIMULATOR_KEY));
  assert.ok(loadProfile(env.storage).missions.includes('m41'));assert.equal(loadProfile(env.storage).endings.length,0);
  env.get('anotherRoute').onclick();assert.equal(env.app.getState().node,'m01Intro');
  env.app.restart();assert.ok(loadProfile(env.storage).missions.includes('m41'));
});

test('El archivo muestra 52 expedientes, filtra y pausa sin perder el combate actual',()=>{
  const env=environment();env.clickChoice();env.clickChoice();env.tick(1000);
  env.get('archive').onclick();assert.equal(env.get('archivePanel').hidden,false);
  assert.equal(env.get('archiveList').children.length,52);env.tick(60000);
  env.get('missionSearch').value='Zero Gravity';env.get('missionSearch').oninput();
  assert.equal(env.get('archiveList').children.length,1);
  env.get('closeArchive').onclick();env.tick(1000);
  assert.equal(env.get('hudTime').textContent,`TIEMPO ${missions.m01.time-2}s`);
  env.get('pause').onclick();env.tick(60000);env.get('pause').onclick();env.tick(1000);
  assert.equal(env.get('hudTime').textContent,`TIEMPO ${missions.m01.time-3}s`);
});

test('La interfaz completa una campaña japonesa nueva y conserva su final en el perfil',()=>{
  const env=environment();let transitions=0;
  while(currentNode(env.app.getState()).kind!=='ending'){
    assert.ok(++transitions<100,'No debe atascarse en un informe con una salida bloqueada.');
    if(currentNode(env.app.getState()).kind==='mission'){
      let actions=0;
      while(currentNode(env.app.getState()).kind==='mission'){
        assert.ok(++actions<50);
        env.actTarget(button=>!button.className.includes('secondary'));
      }
      env.flush();
    }else{
      const available=env.get('actions').children.find(button=>!button.disabled);
      assert.ok(available);available.onclick();
    }
  }
  assert.equal(env.app.getState().node,'ending-upeo');
  assert.equal(env.app.getState().results.length,17);
  assert.deepEqual(loadProfile(env.storage).endings,['upeo']);
  assert.equal(loadProfile(env.storage).missions.length,17);
  assert.deepEqual(loadCampaign(env.storage).state,env.app.getState());
  env.get('anotherRoute').onclick();
  assert.equal(env.app.getState().node,'intro');
  assert.equal(loadProfile(env.storage).missions.length,17);
  assert.deepEqual(loadProfile(env.storage).endings,['upeo']);
});
