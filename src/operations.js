// Mecánicas originales aplicadas a los objetivos de cada capítulo; no añaden sucesos canónicos.
const mobileEscorts={8:'Dirigible',9:'Transporte de Clarkson y Fiona',26:'Unidades de asalto',40:'Transbordador',42:'Equipo de recuperación'};
const fixedEscorts={5:'Base de Neucom',11:'Complejo espacial'};
const groundNames={2:'Emisor de interferencias',8:'Obstáculo del descenso',14:'Instalación designada',19:'Instalación de la base aérea',22:'Nodo de energía',27:'Silo de misiles',34:'Objetivo de Ouroboros',39:'Instalación de General Resource'};
const airNames={1:'Contacto de Neucom',7:'Interceptor',10:'Bombardero',15:'Avión combatiente',16:'Interceptor del corredor',23:'Transporte y escolta',24:'Bombardero',25:'Escolta del transbordador',33:'Geopelia',43:'Avión de General Resource',44:'Interceptor',48:'Escolta de Ouroboros'};
export function prepareOperation(f){
  f.scroll=0;f.passes=0;f.coverEscort=false;f.coverEnergy=100;
  f.terrain=f.m.type==='naval'||f.id==='m42'?'sea':f.m.type==='orbital'||f.id==='m38'?'space':f.m.type==='tunnel'?'tunnel':'land';
  if(f.protected){Object.assign(f.protected,{label:mobileEscorts[f.m.number]||fixedEscorts[f.m.number]||'Unidad aliada',mobile:!fixedEscorts[f.m.number],x:360,y:397,invulnerable:0});}
  for(const t of f.targets){
    t.inView=true;t.passes=0;t.returnIn=0;
    t.domain=t.role==='facility'||t.role==='support'||t.role==='generator'?'ground':t.role==='civilian'?'civilian':'air';
    if(f.m.type==='naval'||t.group==='hydrofoil')t.domain='sea';
    if(t.role==='boss'||t.role==='generator')t.domain='structure';
    if(f.m.type==='containers'){t.domain='cargo';delete t.enemyType;t.label='Contenedor '+(t.sequence+1);}
    if(f.m.type==='orbital')t.label='Satélite '+(t.sequence+1);
    if(t.role==='facility'&&!t.group)t.label=(f.m.type==='naval'?'Buque ':f.m.type==='train'?'Vagón blindado ':'Instalación ')+(t.sequence+1);
    if(f.m.type==='train'){t.x=330+(t.sequence%2)*60;t.y=45+t.sequence*42;t.vx=0;}
    if(t.required&&groundNames[f.m.number]&&t.role==='facility')t.label=groundNames[f.m.number]+' '+(t.sequence+1);
    if(t.required&&airNames[f.m.number]&&t.role==='hostile')t.label=airNames[f.m.number]+' '+(t.sequence+1);
    if(f.id==='m20'&&t.required&&t.sequence===0){t.domain='ground';t.label='Centro de control de Megafloat';}
    if(f.id==='m25'&&t.required&&t.sequence===0)t.label='Transbordador de Neucom';
    if(f.id==='m29'&&t.required&&t.sequence%2===1){t.role='hostile';t.domain='air';t.enemyType='dart';t.homeX=t.x;t.label='Grupo aéreo '+(t.sequence+1);}
    if(f.id==='m35'&&t.required&&t.sequence===f.m.total-1){t.domain='cargo';t.label='Misil en lanzamiento';}
    if(f.id==='m27'&&t.required&&t.sequence===f.m.total-1){t.domain='cargo';t.role='hostile';delete t.enemyType;t.label='Misil lanzado desde el silo';}
    if(f.id==='m26'&&t.required&&t.sequence===f.m.total-1){t.domain='cargo';t.role='hostile';delete t.enemyType;t.label='Cohete de Neucom';}
    if(f.id==='m08'&&t.required&&t.sequence===f.m.total-1){t.domain='sea';t.role='hostile';delete t.enemyType;t.label='Embarcación que escapa del dirigible';}
    if(f.id==='m13'&&t.required&&t.sequence===f.m.total-1)t.label='Rena · aplicar ANB';
    if(f.id==='m43'&&t.required&&t.sequence>=Math.ceil(f.m.total/2)){t.role='hostile';t.domain='air';t.enemyType='dart';t.homeX=t.x;t.label='Defensa aérea de General Resource';}
    if(f.id==='m45'&&t.required&&t.sequence>=f.m.total-2){t.domain='structure';t.label=t.sequence===f.m.total-2?'Sphyrna':'Avión de Dision';delete t.enemyType;}
    if(t.domain==='sea'){delete t.enemyType;t.vx=0;}
    if(t.group==='sphyrna'){t.domain='structure';delete t.enemyType;}
  }
  if(f.m.type==='boss'){
    const parts=f.targets.filter(t=>t.role==='generator'),split=Math.ceil(parts.length/2);
    parts.forEach((t,i)=>{t.depth=i<split?0:1;t.label=(f.id==='m47'?'Generador Aeon · ':'')+(t.depth?'Sistema interno ':'Defensa exterior ')+(i+1);t.x=t.depth?290+(i-split)*140:180+i*360;t.y=t.depth?170:120;});
    for(const t of f.targets.filter(t=>t.role==='boss')){t.depth=2;t.hitRadius=9;t.homeX=360;t.x=360;t.y=125;}
    if(f.id==='m52')for(const t of parts)t.label='Enlace Aeon · interferir '+(t.sequence+1);
  }
}
export function advanceOperation(f,dt){
  f.scroll+=dt*(f.m.type==='boss'?12:38);
  if(f.protected){
    const unit=f.protected;unit.invulnerable=Math.max(0,unit.invulnerable-dt);
    if(unit.mobile){const follow=1-Math.exp(-dt*4);unit.x+=(f.x-unit.x)*follow;unit.y+=(Math.min(404,f.y+33)-unit.y)*follow;}
    const covering=(f.coverEscort||f.focus)&&Math.hypot(f.x-unit.x,f.y-unit.y)<90&&f.coverEnergy>0;
    f.covering=Boolean(covering);
    f.coverEnergy=Math.max(0,Math.min(100,f.coverEnergy+(covering?-8:12)*dt));
    if(!f.coverEnergy)f.coverEscort=false;
  }
  for(const t of f.targets){
    if(!t.alive||t.active===false)continue;
    if(t.role==='boss'){t.x=360+Math.sin(f.elapsed*1.4+t.sequence)*100;continue;}
    if(f.m.type==='boss'||['gate','scan','cloud','civilian'].includes(t.role)||t.domain==='structure')continue;
    if(t.returnIn>0){t.returnIn=Math.max(0,t.returnIn-dt);if(!t.returnIn){t.y=-28;t.inView=false;}continue;}
    t.y+=dt*(t.domain==='cargo'?23:t.domain==='air'?17:24);
    t.inView=t.y>=30&&t.y<=280;
    if(t.y>305){
      t.inView=false;t.returnIn=1.2;t.passes++;f.passes++;
      if(t.domain==='cargo'){f.hp=Math.max(0,f.hp-20);f.feedback='Un contenedor alcanzó la zona. Quedan otros de la misma carga en aproximación.';}
      else f.feedback='Contacto fuera de pantalla · Volverá en la siguiente pasada.';
    }
  }
}
export function missileHitChance(f,t){
  if(f.mode!=='bullethell'||['gate','scan','cloud'].includes(t.role))return 1;
  const base={easy:.94,normal:.86,expert:.78}[f.difficulty];
  const evasion=t.role==='boss'?.22:t.enemyType==='dart'?.08:t.enemyType==='lynx'?.12:0;
  return Math.max(.4,Math.min(.98,base-evasion+(['ground','sea'].includes(t.domain)?.06:0)));
}
export function coreOpen(f,t){return t.role!=='boss'||f.mode!=='bullethell'||f.elapsed%3.2<1.4;}
export function hitProtected(f,bullet,hits,ax,ay){
  const unit=f.protected;if(!unit||unit.invulnerable>0)return false;
  if(!hits(ax,ay,bullet.x,bullet.y,unit.x,unit.y,f.covering?31:17))return false;
  bullet.y=500;
  if(f.covering&&f.coverEnergy>=12){f.coverEnergy-=12;f.feedback='Cobertura: proyectil interceptado antes de alcanzar al aliado.';return true;}
  unit.hp=Math.max(0,unit.hp-f.config.damage*.6);unit.invulnerable=1;
  f.feedback=unit.label+' bajo fuego · Acércate y activa Cobertura.';
  if(unit.hp<=0){f.status='defeat';f.feedback='Unidad protegida destruida: misión fallida.';}
  return true;
}
