import { assignEnemyTypes,ENEMY_TYPES } from './enemy-types.js?v=0.7.0';
import { coreOpen,hitProtected } from './operations.js?v=0.7.0';
// Patrones originales. Coordenadas lógicas independientes del tamaño de pantalla.
export const DIFFICULTIES = Object.freeze({
  easy: {label:'Fácil', interval:1.5, speed:85, fan:3, damage:10, radius:4, invulnerability:1.6, armor:0.8},
  normal: {label:'Normal', interval:1, speed:115, fan:5, damage:20, radius:5, invulnerability:1.2, armor:1},
  expert: {label:'Experto', interval:0.65, speed:150, fan:7, damage:25, radius:6, invulnerability:0.9, armor:1.25},
});
export const isSensor = target => ['gate','scan','cloud'].includes(target.role);
export function prepareBulletHell(flight,difficulty='normal') {
  flight.mode='bullethell';flight.difficulty=Object.hasOwn(DIFFICULTIES,difficulty)?difficulty:'normal';
  flight.config=DIFFICULTIES[flight.difficulty];flight.y=365;flight.bullets=[];flight.playerBullets=[];
  flight.patternClock=0;flight.pattern=0;flight.gunClock=0;flight.invulnerable=0;flight.bombs=3;flight.focus=false;
  flight.keyU=false;flight.keyD=false;flight.drag=null;flight.emitterIndex=0;flight.gunEnabled=true;
  for(const target of flight.targets){
    target.baseHp=target.hp;
    if(!isSensor(target)&&target.role!=='civilian')target.hp=Math.ceil((target.role==='boss'?30:target.hp*7)*flight.config.armor);
    target.maxHp=target.hp;
    // Los contactos se mantienen por encima de la zona de maniobra.
    target.vy=0;target.y=Math.min(265,target.y);
  }
  assignEnemyTypes(flight);
}
export function emitPattern(flight,isLocked) {
  if(flight.waveTransition>0)return;
  const candidates=flight.targets.filter(t=>t.alive&&t.role!=='civilian'&&!isLocked(flight,t));
  if(!candidates.length)return;
  const source=candidates[flight.emitterIndex++%candidates.length],c=flight.config;
  const aim=flight.protected&&flight.pattern%2===0?flight.protected:flight;
  const aimed=Math.atan2(aim.y-source.y,aim.x-source.x);
  const phase=flight.pattern++%3;
  const archetype=ENEMY_TYPES[source.enemyType];
  const kind=archetype?{aimed:0,curtain:1,ring:2}[archetype.pattern]:phase;
  const count=kind===2?c.fan*3:archetype?.pattern==='curtain'?c.fan+2:c.fan;
  for(let i=0;i<count;i++){
    const angle=kind===2?(i/count)*Math.PI*2+flight.pattern*.19:kind===1?Math.PI/2+(i-(count-1)/2)*.25:aimed+(i-(count-1)/2)*.16;
    const speed=c.speed*(archetype?.speed||1);
    flight.bullets.push({x:source.x,y:source.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:4,kind});
  }
}
// Segmento-círculo: evita atravesar hitboxes entre dos fotogramas.
function hits(ax,ay,bx,by,x,y,r) {
  const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)):0;
  return Math.hypot(ax+dx*t-x,ay+dy*t-y)<r;
}
export function advanceBulletHell(flight,dt,keys,isLocked,damageTarget) {
  const c=flight.config;
  // Subpasos acotados; el reloj de misión conserva todo el tiempo transcurrido.
  let remaining=Math.min(dt,2);
  while(remaining>1e-8&&flight.status==='active'){
    const step=Math.min(1/120,remaining);remaining-=step;
    flight.invulnerable=Math.max(0,flight.invulnerable-step);
    flight.focus=Boolean(keys.ShiftLeft||keys.ShiftRight||flight.coverEscort);
    const speed=flight.focus?100:240;
    let dx=Number(Boolean(flight.keyR||keys.ArrowRight||keys.KeyD))-Number(Boolean(flight.keyL||keys.ArrowLeft||keys.KeyA));
    let dy=Number(Boolean(flight.keyD||keys.ArrowDown||keys.KeyS))-Number(Boolean(flight.keyU||keys.ArrowUp||keys.KeyW));
    const length=Math.hypot(dx,dy)||1;
    flight.x=Math.max(15,Math.min(705,flight.x+dx/length*speed*step));
    flight.y=Math.max(285,Math.min(403,flight.y+dy/length*speed*step));
    flight.patternClock+=step;flight.gunClock-=step;
    if(flight.patternClock>=c.interval){flight.patternClock-=c.interval;emitPattern(flight,isLocked);}
    if(flight.waveTransition>0)flight.gunClock=.1;
    if(!flight.gunEnabled)flight.gunClock=.1;
    if(flight.gunClock<=0&&flight.gunEnabled){
      flight.gunClock+=.1;
      for(const offset of [-7,7])flight.playerBullets.push({x:flight.x+offset,y:flight.y-15});
    }
    for(const bullet of flight.playerBullets){
      const oldY=bullet.y;bullet.y-=520*step;
      const target=flight.targets.find(t=>t.alive&&!isSensor(t)&&t.role!=='civilian'&&!isLocked(flight,t)&&coreOpen(flight,t)&&hits(bullet.x,oldY,bullet.x,bullet.y,t.x,t.y,t.hitRadius||18));
      if(target){bullet.y=-50;damageTarget(flight,target,1);if(flight.status!=='active')break;}
    }
    flight.playerBullets=flight.playerBullets.filter(b=>b.y>-20);
    if(flight.status!=='active')break;
    for(const bullet of flight.bullets){
      const ax=bullet.x,ay=bullet.y;bullet.x+=bullet.vx*step;bullet.y+=bullet.vy*step;
      if(!flight.invulnerable&&hits(ax,ay,bullet.x,bullet.y,flight.x,flight.y,c.radius+bullet.r)){
        flight.hp=Math.max(0,flight.hp-c.damage);flight.invulnerable=c.invulnerability;bullet.y=500;
        flight.feedback='Impacto · Aprovecha la invulnerabilidad para reposicionarte.';
        if(flight.hp<=0){flight.status='defeat';flight.feedback='Aeronave derribada por el fuego enemigo.';break;}
      }else if(hitProtected(flight,bullet,hits,ax,ay)&&flight.status!=='active')break;
    }
    flight.bullets=flight.bullets.filter(b=>b.x>-30&&b.x<750&&b.y>-30&&b.y<450);
  }
}
export function toggleAutoFire(flight){if(flight.mode!=='bullethell'||flight.status!=='active')return false;flight.gunEnabled=!flight.gunEnabled;return flight.gunEnabled;}
export function useBomb(flight) {
  if(flight.mode!=='bullethell'||flight.status!=='active'||flight.bombs<=0)return false;
  flight.bombs--;flight.bullets=[];flight.invulnerable=Math.max(flight.invulnerable,1);
  flight.feedback='Contramedida desplegada · Proyectiles despejados.';return true;
}
