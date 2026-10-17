import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlight,advanceFlight,fireMissile,damageTarget,isTargetLocked } from '../src/combat.js';
import { advanceOperation,missileHitChance,coreOpen } from '../src/operations.js';
import { advanceBulletHell,toggleAutoFire } from '../src/bullet-hell.js';
import { missions } from '../src/missions.js';
import { environment } from './helpers/dom.mjs';
const flight=(id='m01',difficulty='normal',random)=>createFlight(id,missions[id],0,random,{mode:'bullethell',difficulty});

test('El terreno avanza y un blanco escapado vuelve sin curarse ni duplicar bajas',()=>{
  const f=flight(),target=f.targets[0];toggleAutoFire(f);
  damageTarget(f,target,1);const hp=target.hp;target.y=304;
  advanceOperation(f,.1);assert.equal(target.inView,false);assert.equal(isTargetLocked(f,target),true);assert.equal(target.passes,1);
  advanceOperation(f,1.3);for(let i=0;i<40;i++)advanceOperation(f,.1);
  assert.equal(target.inView,true);assert.equal(target.alive,true);assert.equal(target.hp,hp);assert.equal(f.completed,0);assert.ok(f.scroll>0);
  damageTarget(f,target,target.hp);const completed=f.completed;
  advanceOperation(f,30);assert.equal(target.alive,false);assert.equal(f.completed,completed);
});
test('Los blancos conservan su función narrativa: tierra, mar, aire, carga y satélites',()=>{
  assert.ok(flight('m02').targets.filter(t=>t.required).every(t=>t.domain==='ground'&&!t.enemyType));
  assert.ok(flight('m04').targets.filter(t=>t.required).every(t=>t.domain==='sea'&&!t.enemyType));
  assert.ok(flight('m43').targets.filter(t=>t.required).every(t=>t.domain==='air'&&t.enemyType));
  assert.ok(flight('m03').targets.every(t=>t.domain==='cargo'&&!t.enemyType));
  assert.match(flight('m41').targets[0].label,/Satélite/);
  assert.ok(flight('m29').targets.some(t=>t.domain==='air')&&flight('m29').targets.some(t=>t.domain==='sea'));
  assert.equal(flight('m20').targets[0].label,'Centro de control de Megafloat');
});
test('Un misil puede fallar o acertar, consume recarga y nunca altera objetivos si falla',()=>{
  const miss=flight('m01','normal',()=>.999),target=miss.targets[0],hp=target.hp;
  assert.equal(fireMissile(miss,target.x,target.y),false);assert.equal(target.hp,hp);assert.equal(miss.kills,0);assert.ok(miss.cooldown>0);assert.equal(miss.shots[0].miss,true);
  const hit=flight('m01','normal',()=>0);assert.equal(fireMissile(hit,hit.targets[0].x,hit.targets[0].y),true);assert.equal(hit.targets[0].hp,3);
  assert.ok(missileHitChance(flight('m01','easy'),target)>missileHitChance(flight('m01','expert'),target));
  assert.ok(missileHitChance(miss,target)<missileHitChance(miss,{role:'facility',domain:'ground'}));
  assert.equal(missileHitChance(miss,{role:'scan'}),1);
});
test('El transporte sigue con retraso y la base permanece fija; sus vidas son independientes',()=>{
  const moving=flight('m09'),base=flight('m05');moving.x=500;base.x=500;
  advanceOperation(moving,.25);advanceOperation(base,.25);
  assert.ok(moving.protected.x>360&&moving.protected.x<500);assert.equal(base.protected.x,360);assert.equal(base.protected.mobile,false);
  const unit=moving.protected;moving.bullets=[{x:unit.x,y:unit.y-8,vx:0,vy:400,r:4,kind:0}];
  advanceBulletHell(moving,.03,{},isTargetLocked,damageTarget);
  assert.ok(unit.hp<100);assert.equal(moving.hp,100);
  unit.hp=1;unit.invulnerable=0;moving.bullets=[{x:unit.x,y:unit.y-8,vx:0,vy:400,r:4,kind:0}];
  advanceBulletHell(moving,.03,{},isTargetLocked,damageTarget);assert.equal(moving.status,'defeat');
});
test('La cobertura intercepta fuego con energía limitada y se recarga al soltarla',()=>{
  const f=flight('m09');f.coverEscort=true;advanceOperation(f,.1);const u=f.protected;
  f.bullets=[{x:u.x+20,y:u.y-8,vx:0,vy:400,r:4,kind:0}];
  advanceBulletHell(f,.03,{},isTargetLocked,damageTarget);assert.equal(u.hp,100);assert.ok(f.coverEnergy<90);
  f.coverEscort=false;f.focus=false;const energy=f.coverEnergy;advanceOperation(f,.2);assert.ok(f.coverEnergy>energy);
  f.x=30;f.coverEscort=true;advanceOperation(f,.01);assert.equal(f.covering,false,'La cobertura exige proximidad al aliado.');
});
test('Los jefes requieren ambas capas y el núcleo rechaza misiles con la compuerta cerrada',()=>{
  const f=flight('m17','normal',()=>0),core=f.targets.find(t=>t.role==='boss');
  assert.equal(f.waves.length,3);assert.equal(isTargetLocked(f,core),true);
  for(const t of f.targets.filter(t=>t.active))damageTarget(f,t,t.hp);
  advanceFlight(f,900);assert.equal(isTargetLocked(f,core),true);
  for(const t of f.targets.filter(t=>t.active&&t.alive))damageTarget(f,t,t.hp);
  advanceFlight(f,1800);assert.equal(isTargetLocked(f,core),false);assert.equal(coreOpen(f,core),false);
  const hp=core.hp;assert.equal(fireMissile(f,core.x,core.y),false);assert.equal(core.hp,hp);assert.equal(f.cooldown,0);
  advanceFlight(f,3300);assert.equal(coreOpen(f,core),true);assert.equal(fireMissile(f,core.x,core.y),true);assert.equal(core.hp,hp-3);
});
test('Cobertura y cañón tienen controles móviles y el archivo pausa el avance de la operación',()=>{
  const env=environment(undefined,{battleMode:'bullethell'});env.app.simulate('m09');env.clickChoice();
  assert.match(env.get('escortStatus').textContent,/Transporte de Clarkson/);env.get('cover').onclick();assert.match(env.get('cover').textContent,/Desactivar/);
  env.get('gun').onclick();assert.equal(env.get('gun').textContent,'Cañón: en espera');
  env.get('archive').onclick();const time=env.get('hudTime').textContent;env.tick(3000);assert.equal(env.get('hudTime').textContent,time);
});
