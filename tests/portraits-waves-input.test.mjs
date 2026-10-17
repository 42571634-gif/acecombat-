import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { characters } from '../src/characters.js';
import { missions } from '../src/missions.js';
import { createFlight,advanceFlight,damageTarget,fireMissile,isTargetLocked } from '../src/combat.js';
import { WAVE_PLANS,isActiveTarget } from '../src/waves.js';
import { ENEMY_TYPES } from '../src/enemy-types.js';
import { environment } from './helpers/dom.mjs';
const flight=(id='m01',difficulty='normal')=>createFlight(id,missions[id],0,undefined,{mode:'bullethell',difficulty});
const launch=env=>{env.clickChoice();env.clickChoice();};

test('Nueve retratos locales tienen archivo real, fuente y correspondencia con el personaje',()=>{
  const sources=JSON.parse(readFileSync('assets/portraits/sources.json','utf8'));
  assert.equal(sources.portraits.length,9);
  for(const p of sources.portraits){
    assert.equal(characters[p.id].portrait,'./assets/portraits/'+p.file);
    assert.ok(p.source.startsWith('https://')&&p.credit);
    const bytes=readFileSync('assets/portraits/'+p.file);assert.ok(bytes.length>1000);
    assert.ok(bytes[0]===255&&bytes[1]===216||bytes.toString('ascii',0,4)==='RIFF');
  }
  assert.equal(characters.control.portrait,undefined);assert.equal(characters.archive.portrait,undefined);
});

test('Una pulsación ataca al presionar y conserva el mismo botón tras impactos y destrucción',()=>{
  const env=environment(undefined,{battleMode:'bullethell'});launch(env);
  const first=env.get('targetActions').children[0];env.document.activeElement=first;
  first.onpointerdown({button:0,preventDefault(){}});
  assert.match(first.textContent,/Blindaje 3/,'El impacto aparece sin esperar al siguiente tick ni a soltar el botón.');
  assert.equal(env.get('targetActions').children[0],first);assert.equal(env.document.activeElement,first);
  env.tick(500);first.onpointerdown({button:0,preventDefault(){}});
  assert.equal(first.hidden,true);assert.equal(first.disabled,true);
  assert.equal(env.get('targetActions').children[0],first,'No se reemplaza la lista durante el combate.');
});

test('Toques breves y flechas con foco en un botón mueven de inmediato; ocultar libera controles',()=>{
  const env=environment(undefined,{battleMode:'bullethell'});launch(env);
  const start=env.drawing.x;
  env.get('right').onpointerdown({pointerId:3,preventDefault(){}});
  env.get('right').onpointerup({pointerId:3});
  assert.equal(env.drawing.x,start+4,'Un toque entre fotogramas no se pierde.');
  env.listeners.get('keydown')({code:'ArrowRight',target:{tagName:'BUTTON'},preventDefault(){}});
  assert.equal(env.drawing.x,start+8);
  env.listeners.get('keyup')({code:'ArrowRight'});
  env.get('left').onpointerdown({pointerId:4,preventDefault(){}});
  env.document.hidden=true;env.listeners.get('visibilitychange')();
  env.tick(2000);env.document.hidden=false;env.listeners.get('visibilitychange')();
  const restored=env.drawing.x;
  env.get('left').onpointerdown({pointerId:5,preventDefault(){}});env.get('left').onpointerup({pointerId:5});
  assert.equal(env.drawing.x,restored-4,'Puede volver a tocarse el mismo control después de cambiar de pestaña.');
});

test('La animación usa un único RAF, pausa el tiempo y cancela fotogramas antiguos al reiniciar',()=>{
  const env=environment(undefined,{battleMode:'bullethell',animation:true});launch(env);
  assert.equal(env.intervals.size,0);assert.equal(env.frames.size,1);
  env.frame();assert.equal(env.frames.size,1);
  env.get('pause').onclick();const time=env.get('hudTime').textContent;
  env.frame(5000);assert.equal(env.get('hudTime').textContent,time);
  env.get('pause').onclick();env.frame(16);assert.equal(env.frames.size,1);
  const stale=[...env.frames.values()][0];env.get('retry').onclick();
  assert.equal(env.frames.size,1);stale();assert.equal(env.frames.size,1);
  env.get('reset').onclick();assert.equal(env.frames.size,0);
});

test('Las oleadas ocultan futuros contactos y esperan hasta el último grupo para dar la victoria',()=>{
  const f=flight(),required=f.targets.filter(t=>t.required);
  assert.equal(f.waves.length,2);assert.equal(required.filter(isActiveTarget).length,3);
  const future=required.find(t=>!t.active);assert.equal(isTargetLocked(f,future),true);
  assert.equal(fireMissile(f,future.x,future.y),false);
  f.cooldown=0;
  for(const t of required.filter(isActiveTarget))damageTarget(f,t,t.hp);
  assert.equal(f.status,'active');assert.equal(f.completed,3);assert.equal(f.waveIndex,1);
  assert.equal(f.waveEvents.length,2);assert.ok(f.waveTransition>0);assert.equal(f.bullets.length,0);
  advanceFlight(f,400);assert.equal(required.filter(isActiveTarget).length,0);
  advanceFlight(f,900);assert.equal(required.filter(isActiveTarget).length,2);
  for(const t of required.filter(isActiveTarget))damageTarget(f,t,t.hp);
  assert.equal(f.status,'victory');assert.equal(f.completed,missions.m01.total);assert.equal(f.kills,missions.m01.total);
  assert.equal(Object.keys(WAVE_PLANS).length,15);
  for(const [id,plan] of Object.entries(WAVE_PLANS))for(const phase of plan){assert.ok(missions[id]&&characters[phase.message.character]);assert.equal(phase.adaptation,true);}
});

test('Los secundarios sobreviven a los cambios de fase y los dos jefes se desbloquean en orden',()=>{
  const f=flight('m48');const secondary=f.targets.find(t=>t.group);
  for(const t of f.targets.filter(t=>t.required&&t.active))damageTarget(f,t,t.hp);
  advanceFlight(f,900);assert.equal(isActiveTarget(secondary),true);
  const before=f.objectives.sphyrna;damageTarget(f,secondary,secondary.hp);assert.equal(f.objectives.sphyrna,before+1);
  const boss=flight('m52');const bosses=boss.targets.filter(t=>t.role==='boss');
  assert.equal(boss.waves.length,3);assert.ok(bosses.every(t=>!t.active));
  for(const t of boss.targets.filter(t=>t.role==='generator'))damageTarget(boss,t,t.hp);
  advanceFlight(boss,900);assert.equal(isTargetLocked(boss,bosses[0]),false);assert.equal(isTargetLocked(boss,bosses[1]),true);
  damageTarget(boss,bosses[0],bosses[0].hp);advanceFlight(boss,1800);
  assert.equal(isTargetLocked(boss,bosses[1]),false);assert.equal(boss.status,'active');
});

test('Los tres arquetipos tienen blindaje y patrones distintos sin multiplicar dos veces la dificultad',()=>{
  const expected={easy:[5,8,7],normal:[6,10,8],expert:[8,13,10]};
  assert.equal(Object.keys(ENEMY_TYPES).length,3);
  for(const [difficulty,hp] of Object.entries(expected)){
    const f=flight('m01',difficulty);
    assert.deepEqual(f.targets.slice(0,3).map(t=>t.hp),hp);
    assert.deepEqual(f.targets.slice(0,3).map(t=>t.enemyType),['dart','manta','lynx']);
  }
});
