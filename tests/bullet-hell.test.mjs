import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlight,advanceFlight,fireMissile,isTargetLocked,useBomb,DIFFICULTIES } from '../src/combat.js';
import { emitPattern,toggleAutoFire } from '../src/bullet-hell.js';
import { missions } from '../src/missions.js';
import { story } from '../src/story.js';
import { environment } from './helpers/dom.mjs';

const flightFor=(id='m01',difficulty='normal')=>createFlight(id,missions[id],0,undefined,{mode:'bullethell',difficulty});

test('Las tres dificultades cambian densidad, velocidad, blindaje y tolerancia al daño',()=>{
  const flights=Object.keys(DIFFICULTIES).map(d=>flightFor('m01',d));
  for(const f of flights){emitPattern(f,isTargetLocked);assert.ok(f.bullets.length>0);}
  assert.deepEqual(flights.map(f=>f.bullets.length),[3,5,7]);
  assert.ok(flights[0].config.speed<flights[1].config.speed&&flights[1].config.speed<flights[2].config.speed);
  assert.ok(flights[0].targets[0].hp<flights[1].targets[0].hp&&flights[1].targets[0].hp<flights[2].targets[0].hp);
  assert.equal(flightFor('m01','invalid').difficulty,'normal');
});

test('Abanicos y anillos se alternan, viajan por el campo y tienen límites de población',()=>{
  const f=flightFor();
  emitPattern(f,isTargetLocked);emitPattern(f,isTargetLocked);emitPattern(f,isTargetLocked);
  assert.equal(f.pattern,3);assert.equal(f.bullets.length,27);
  assert.ok(f.bullets.some(b=>b.vy<0));
  const first=f.bullets[0],x=first.x,y=first.y;
  advanceFlight(f,100);assert.notEqual(first.y,y);assert.ok(Number.isFinite(first.x-x));
  for(let time=200;time<15000&&f.status==='active';time+=100)advanceFlight(f,time,{KeyD:time%2000<1000,KeyA:time%2000>=1000});
  assert.ok(f.bullets.length<250);assert.ok(f.playerBullets.length<30);
});

test('Colisión continua, invulnerabilidad, derrota y contramedidas limitadas funcionan',()=>{
  const f=flightFor();
  const hit=()=>f.bullets.push({x:f.x,y:f.y-10,vx:0,vy:1200,r:4,kind:0});
  hit();hit();advanceFlight(f,20);assert.equal(f.hp,80);
  hit();advanceFlight(f,40);assert.equal(f.hp,80,'El mismo patrón no aplica daño repetido durante invulnerabilidad.');
  assert.equal(useBomb(f),true);assert.equal(f.bullets.length,0);assert.equal(f.bombs,2);
  assert.equal(useBomb(f),true);assert.equal(useBomb(f),true);assert.equal(useBomb(f),false);
  for(let time=2000;f.status==='active'&&time<15000;time+=2000){f.invulnerable=0;hit();advanceFlight(f,time);}
  assert.equal(f.status,'defeat');assert.equal(useBomb(f),false);assert.equal(fireMissile(f,80,80),false);
  const retry=flightFor();assert.equal(retry.bombs,3);assert.equal(retry.bullets.length,0);assert.equal(retry.hp,100);
});

test('Movimiento diagonal normalizado, precisión y límites en los dos ejes',()=>{
  const a=flightFor(),b=flightFor();
  advanceFlight(a,100,{KeyD:true});advanceFlight(b,100,{KeyD:true,KeyW:true});
  assert.ok(Math.abs(Math.hypot(b.x-360,b.y-365)-(a.x-360))<1e-8);
  const focused=flightFor();advanceFlight(focused,100,{KeyD:true,ShiftLeft:true});
  assert.ok(focused.x<a.x);assert.equal(focused.focus,true);
  advanceFlight(a,2000,{KeyD:true,KeyS:true});assert.ok(a.x<=705&&a.y<=403);
});

test('El cañón automático destruye blancos por impacto y respeta civiles y bloqueos',()=>{
  const f=flightFor('m52');
  const generator=f.targets.find(t=>t.role==='generator');generator.x=360;generator.y=100;
  for(const target of f.targets.filter(t=>t!==generator))target.x=650;
  for(let time=20;generator.alive&&time<=2000;time+=20)advanceFlight(f,time);
  assert.equal(generator.alive,false);assert.equal(f.completed,1);
  const boss=f.targets.find(t=>t.role==='boss'),hp=boss.hp;
  boss.x=360;boss.y=100;
  for(let time=2020;time<=2600;time+=20)advanceFlight(f,time);
  assert.equal(boss.hp,hp,'El núcleo sigue protegido por los generadores restantes.');
  const civilianFlight=flightFor('m04');
  const civilian=civilianFlight.targets.find(t=>t.role==='civilian');civilian.x=360;civilian.y=310;
  advanceFlight(civilianFlight,500);assert.equal(civilian.alive,true);
  assert.equal(fireMissile(civilianFlight,civilian.x,civilian.y),false);assert.equal(civilianFlight.status,'defeat');
});

// Piloto de prueba: elige desplazamiento por distancia prevista a los proyectiles.
// Usa movimiento real, misil de la interfaz y contramedidas; no modifica vida ni blancos.
function completeMission(id,difficulty){
  const f=flightFor(id,difficulty);let now=0;
  while(f.status==='active'&&now<f.m.time*1000){
    const optionalPending=f.targets.some(t=>t.alive&&t.group);
    if(f.gunEnabled===optionalPending)toggleAutoFire(f);
    const target=f.targets.find(t=>t.alive&&t.group&&!isTargetLocked(f,t))||(!optionalPending&&f.targets.find(t=>t.alive&&t.required&&!isTargetLocked(f,t)));
    const options=[{}, {KeyA:true},{KeyD:true},{KeyW:true},{KeyS:true},{KeyA:true,KeyW:true},{KeyD:true,KeyW:true},{KeyA:true,KeyS:true},{KeyD:true,KeyS:true}];
    let best=options[0],score=-Infinity;
    for(const keys of options){
      const vx=(Number(Boolean(keys.KeyD))-Number(Boolean(keys.KeyA)))*170;
      const vy=(Number(Boolean(keys.KeyS))-Number(Boolean(keys.KeyW)))*170;
      let safety=200;
      for(const b of f.bullets){
        for(const horizon of [.1,.25,.45]){
          const x=Math.max(15,Math.min(705,f.x+vx*horizon)),y=Math.max(285,Math.min(403,f.y+vy*horizon));
          safety=Math.min(safety,Math.hypot(x-(b.x+b.vx*horizon),y-(b.y+b.vy*horizon)));
        }
      }
      const aim=target?Math.abs(Math.max(15,Math.min(705,f.x+vx*.25))-target.x):0;
      const range=target?Math.hypot(Math.max(15,Math.min(705,f.x+vx*.25))-target.x,Math.max(285,Math.min(403,f.y+vy*.25))-target.y):0;
      const candidate=safety-aim*.12-Math.max(0,range-430)*2;
      if(candidate>score){score=candidate;best=keys;}
    }
    if(f.bullets.some(b=>Math.hypot(b.x-f.x,b.y-f.y)<45)&&!f.invulnerable)useBomb(f);
    now+=50;advanceFlight(f,now,best);
    if(target?.alive&&f.status==='active'){
      // Sensores de navegación conservan la ayuda de alineación de la lista accesible.
      if(target.role==='gate')f.x=target.x;
      fireMissile(f,target.x,target.y);
    }
  }
  assert.equal(f.status,'victory',`${id} / ${difficulty}: ${f.feedback} (${f.hp}% / ${f.completed}; x=${f.x}, y=${f.y}; ${JSON.stringify(f.targets.filter(t=>t.alive).map(t=>[t.id,t.x,t.y,t.hp]))})`);
  assert.equal(f.completed,f.m.total);
  if(f.m.secondary)assert.equal(f.objectives[f.m.secondary.id],f.m.secondary.count,`${id} / ${difficulty}: secundarios`);
}
test('Las 52 misiones se completan en Fácil, Normal y Experto, incluidos secundarios y jefes',()=>{
  for(const difficulty of Object.keys(DIFFICULTIES))for(const id of Object.keys(missions))completeMission(id,difficulty);
});

test('Cada capítulo conserva una escena y un informe propios, con extensión flexible',()=>{
  const text=[];
  for(const mission of Object.values(missions)){
    const spoken=mission.dialogue.filter(line=>line.kind!=='narration');
    assert.ok(spoken.length>=6);assert.ok(mission.reportDialogue.filter(line=>line.kind!=='narration').length>=3);
    assert.equal(story[mission.id+'Intro'].dialogue,mission.dialogue);
    for(const line of spoken.slice(2)){assert.ok(line.text.trim());text.push(line.text);}
    assert.equal(mission.adaptation,true);assert.ok(mission.source.url);
  }
  assert.equal(new Set(text).size,text.length);assert.equal(story.intro.dialogue.length,3);
});

test('Interfaz bullet hell: preferencia persistente, pausa, contramedidas y arrastre táctil',()=>{
  const env=environment(undefined,{battleMode:'bullethell'});
  env.get('difficulty').value='expert';env.get('difficulty').onchange();
  env.clickChoice();env.clickChoice();
  assert.equal(env.get('difficulty').disabled,true);assert.ok(env.get('bomb'));
  env.get('bomb').onclick();assert.equal(env.get('bomb').textContent,'Contramedida (2)');
  const canvas=env.get('radar');
  canvas.onpointerdown({clientX:360,clientY:365,pointerId:7,preventDefault(){}});
  canvas.onpointermove({clientX:420,clientY:340,pointerId:7});assert.equal(env.drawing.x,420);
  canvas.onpointerup();
  env.get('pause').onclick();const time=env.get('hudTime').textContent;
  env.tick(5000);env.get('bomb').onclick();assert.equal(env.get('hudTime').textContent,time);
  assert.equal(env.get('bomb').textContent,'Contramedida (2)');
  env.get('pause').onclick();env.tick(100);assert.equal(env.get('hudTime').textContent,`TIEMPO ${missions.m01.time}s`);
  const reopened=environment(env.storage,{battleMode:'bullethell'});assert.equal(reopened.get('difficulty').value,'expert');
});
