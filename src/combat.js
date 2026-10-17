import { prepareBulletHell, advanceBulletHell } from './bullet-hell.js?v=0.4.0';
export { useBomb, DIFFICULTIES } from './bullet-hell.js?v=0.4.0';
function seeded(seed) {
  let value=seed>>>0;
  return ()=>{value=(1664525*value+1013904223)>>>0;return value/4294967296;};
}
export function createFlight(id,mission,now,random=seeded(mission.seed||1),options={}) {
  const type=mission.type;
  const flight={id,m:mission,t:mission.time,last:now,kills:0,completed:0,hp:100,x:360,shots:[],effects:[],cooldown:0,keyL:false,keyR:false,status:'active',
    objectives:mission.secondary?{[mission.secondary.id]:0}:{},protected:type==='escort'?{x:360,y:305,hp:100}:null,targets:[],feedback:'',elapsed:0};
  const bossCount=mission.bossCount||1;
  for(let i=0;i<mission.total;i++) {
    const role=type==='boss'?(i>=mission.total-bossCount?'boss':'generator'):type==='recon'?'scan':type==='containment'?'cloud':type==='tunnel'?(i>=mission.total-(mission.supportCount||0)?'support':'gate'):type==='escort'&&mission.number===8?'facility':['ground','naval','train'].includes(type)?'facility':'hostile';
    flight.targets.push({id:'required-'+i,label:role==='gate'?`Paso ${i+1}`:role==='boss'?(mission.bossNames?.[i-(mission.total-bossCount)]||'Núcleo'):role==='support'?`Soporte ${i-(mission.total-mission.supportCount)+1}`:role==='generator'?`Generador ${i+1}`:`Objetivo ${i+1}`,
      role,required:true,sequence:i,x:85+(i%5)*135+random()*18,y:65+Math.floor(i/5)*85+random()*15,
      vx:['facility','support','generator','scan','cloud','gate'].includes(role)?(type==='train'?32:0):(random()-.5)*24,
      vy:['intercept','escort','containers'].includes(type)&&role!=='facility'?7+random()*5:0,
      hp:role==='boss'?3:type==='orbital'?2:1,alive:true});
  }
  if(mission.secondary) for(let i=0;i<mission.secondary.count;i++) flight.targets.push({
    id:'secondary-'+i,label:mission.secondary.label+(mission.secondary.count>1?` ${i+1}`:''),role:mission.secondary.kind,group:mission.secondary.id,required:false,
    x:80+(i%5)*135,y:235+Math.floor(i/5)*52,vx:0,vy:0,hp:mission.secondary.hp||1,alive:true,
  });
  for(let i=0;i<(mission.civilianCount||0);i++) flight.targets.push({id:'civilian-'+i,label:'Civil · NO DISPARAR',role:'civilian',required:false,x:615,y:300,vx:-5,vy:0,hp:1,alive:true});
  if(options.mode==='bullethell')prepareBulletHell(flight,options.difficulty);
  return flight;
}
export function isTargetLocked(flight,target) {
  return target.role==='boss' && flight.targets.some(other=>other.alive&&(other.role==='generator'||other.role==='boss'&&other.sequence<target.sequence)) ||
    target.role==='support' && flight.targets.some(other=>other.alive&&other.role==='gate') ||
    target.role==='gate' && flight.targets.some(other=>other.alive&&other.role==='gate'&&other.sequence<target.sequence);
}
export function advanceFlight(flight,now,keys={}) {
  if(flight.status!=='active')return;
  const dt=Math.max(0,(now-flight.last)/1000);
  flight.last=now;flight.t=Math.max(0,flight.t-dt);flight.elapsed+=dt;
  if(flight.t<=0){flight.status='defeat';flight.feedback='Se agotó el tiempo de operación.';return;}
  flight.cooldown=Math.max(0,flight.cooldown-dt);
  if(flight.mode==='bullethell')advanceBulletHell(flight,dt,keys,isTargetLocked,damageTarget);
  else {
    if(flight.keyL||keys.ArrowLeft||keys.KeyA)flight.x-=190*dt;
    if(flight.keyR||keys.ArrowRight||keys.KeyD)flight.x+=190*dt;
    flight.x=Math.max(35,Math.min(685,flight.x));
  }
  if(flight.status!=='active')return;
  for(const target of flight.targets) if(target.alive){
    target.x+=target.vx*dt;target.y+=target.vy*dt;
    if(target.x<30||target.x>690){target.x=Math.max(30,Math.min(690,target.x));target.vx*=-1;}
    if(target.y>385){
      const damage=flight.m.type==='containers'?35:15;
      if(flight.protected){flight.protected.hp=Math.max(0,flight.protected.hp-35);flight.hp=flight.protected.hp;}
      else flight.hp=Math.max(0,flight.hp-damage);
      target.y=55;
    }
  }
  if(flight.m.type==='tunnel'){
    const gate=flight.targets.find(target=>target.alive&&target.role==='gate');
    if(gate && Math.abs(flight.x-gate.x)>135)flight.hp=Math.max(0,flight.hp-5*dt);
  }
  for(const shot of flight.shots)shot.life-=dt;
  for(const effect of flight.effects)effect.life-=dt;
  flight.shots=flight.shots.filter(shot=>shot.life>0);flight.effects=flight.effects.filter(effect=>effect.life>0);
  if(flight.t<=0||flight.hp<=0){flight.status='defeat';flight.feedback=flight.hp<=0?'La zona o unidad protegida ha perdido su integridad.':'Se agotó el tiempo de operación.';}
}
export function fireMissile(flight,x,y){
  if(flight.status!=='active'||flight.cooldown>0)return false;
  if(flight.protected&&Math.hypot(x-flight.protected.x,y-flight.protected.y)<25){flight.hp=0;flight.status='defeat';flight.feedback='Fuego sobre la unidad protegida: misión fallida.';return false;}
  const nearest=flight.targets.filter(target=>target.alive&&!isTargetLocked(flight,target))
    .map(target=>({target,distance:Math.hypot(x-target.x,y-target.y)})).sort((a,b)=>a.distance-b.distance)[0];
  if(!nearest||nearest.distance>=32||Math.hypot(nearest.target.x-flight.x,nearest.target.y-(flight.y||365))>500){flight.feedback='Sin contacto válido dentro del alcance.';return false;}
  const target=nearest.target;
  if(target.role==='gate'&&Math.abs(flight.x-target.x)>65){flight.feedback='Alinea la aeronave con el paso antes de cruzarlo.';return false;}
  flight.cooldown=.45;
  if(target.role==='civilian'){flight.hp=0;flight.status='defeat';flight.feedback='Fuego sobre un contacto civil: misión fallida.';return false;}
  flight.shots.push({sx:flight.x,sy:flight.y||365,x:target.x,y:target.y,life:.3});
  return damageTarget(flight,target,flight.mode==='bullethell'&&!['scan','cloud','gate'].includes(target.role)?3:1);
}
export function damageTarget(flight,target,damage=1){
  if(flight.status!=='active'||!target.alive||isTargetLocked(flight,target))return false;
  target.hp-=damage;
  if(target.hp>0){flight.feedback=`Impacto confirmado · Resistencia restante ${target.hp}`;return true;}
  target.alive=false;flight.effects.push({x:target.x,y:target.y,life:.6});
  if(target.required)flight.completed++;
  if(target.group)flight.objectives[target.group]++;
  if(!['scan','cloud','gate'].includes(target.role))flight.kills++;
  flight.feedback=target.role==='scan'?'Registro de reconocimiento completado.':target.role==='cloud'?'Concentración neutralizada con ANB.':target.role==='gate'?'Paso del corredor completado.':target.group?'Objetivo secundario completado.':'Objetivo neutralizado.';
  if(flight.completed===flight.m.total)flight.status='victory';
  return true;
}
