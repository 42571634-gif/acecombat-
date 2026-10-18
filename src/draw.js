import { isTargetLocked } from './combat.js?v=0.7.1';
import { ENEMY_TYPES,drawEnemy } from './enemy-types.js?v=0.7.1';
import { isActiveTarget } from './waves.js?v=0.7.1';
import { coreOpen } from './operations.js?v=0.7.1';
export function draw(flight,canvas){
  if(!flight||!canvas)return;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,720,420);ctx.fillStyle='#071824';ctx.fillRect(0,0,720,420);
  ctx.strokeStyle='#173744';ctx.lineWidth=1;
  for(let x=0;x<=720;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,420);ctx.stroke();}
  for(let y=(flight.scroll||0)%40;y<=420;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(720,y);ctx.stroke();}
  if(flight.mode==='bullethell'){
    ctx.fillStyle=flight.terrain==='sea'?'#103548':flight.terrain==='space'?'#213044':'#17342e';
    for(let i=0;i<9;i++){const y=(i*79+(flight.scroll||0))%470-40,x=(i*163)%700;ctx.fillRect(x,y,flight.terrain==='sea'?65:35,flight.terrain==='sea'?3:18);}
    if(flight.m.type==='train'){ctx.strokeStyle='#7f816b';for(const x of [300,420]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,280);ctx.stroke();}}
    if(flight.m.type==='boss'){
      ctx.fillStyle='#18263a';ctx.strokeStyle='#77618f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(360,32);ctx.lineTo(650,90);ctx.lineTo(670,185);ctx.lineTo(480,220);ctx.lineTo(360,255);ctx.lineTo(240,220);ctx.lineTo(50,185);ctx.lineTo(70,90);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#a897c4';ctx.fillText('ESTRUCTURA · '+flight.waves[flight.waveIndex].label,180,35);
    }
  }
  ctx.font='12px monospace';ctx.fillStyle='#77a7b2';ctx.fillText((flight.m.arc||'SARF')+' / TACTICAL DISPLAY',14,20);
  if(flight.m.type==='tunnel'){
    const gate=flight.targets.find(target=>target.alive&&target.role==='gate');
    if(gate){ctx.fillStyle='#16404a';ctx.fillRect(gate.x-65,35,130,345);}
  }
  if(flight.mode==='bullethell'){
    ctx.fillStyle='#0c2738';ctx.fillRect(0,280,720,140);
    ctx.font='11px monospace';ctx.fillStyle='#77a7b2';ctx.fillText('ZONA DE MANIOBRA · '+flight.config.label.toUpperCase(),14,414);
    for(const bullet of flight.playerBullets){ctx.fillStyle='#aaffed';ctx.fillRect(bullet.x-2,bullet.y-9,4,14);}
    for(const bullet of flight.bullets){ctx.fillStyle=['#ff818f','#ffc76e','#dd9aff'][bullet.kind];ctx.beginPath();ctx.arc(bullet.x,bullet.y,bullet.r,0,Math.PI*2);ctx.fill();}
  }
  if(flight.protected){
    const unit=flight.protected;ctx.fillStyle='#6ef3b9';ctx.strokeStyle='#6ef3b9';
    if(unit.mobile){
      if(flight.id==='m08'){ctx.beginPath();ctx.ellipse(unit.x,unit.y,14,25,0,0,Math.PI*2);ctx.stroke();}
      else if(flight.id==='m42'){ctx.beginPath();ctx.moveTo(unit.x,unit.y-20);ctx.lineTo(unit.x-12,unit.y+12);ctx.lineTo(unit.x+12,unit.y+12);ctx.closePath();ctx.fill();}
      else drawEnemy(ctx,{x:unit.x,y:unit.y,enemyType:'manta'},'#6ef3b9');
    }else ctx.fillRect(unit.x-20,unit.y-7,40,14);
    if(flight.covering){ctx.beginPath();ctx.arc(unit.x,unit.y,31,0,Math.PI*2);ctx.stroke();}
    ctx.font='10px monospace';ctx.fillText('ALIADO '+Math.round(unit.hp)+'%',Math.min(615,Math.max(5,unit.x-35)),unit.y-14);
  }
  ctx.save();ctx.translate(flight.x,flight.y||365);ctx.fillStyle=flight.invulnerable>0&&Math.floor(flight.invulnerable*12)%2?'#fff':'#67f6e0';ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(-12,15);ctx.lineTo(0,8);ctx.lineTo(12,15);ctx.closePath();ctx.fill();
  if(flight.mode==='bullethell'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,flight.config.radius,0,Math.PI*2);ctx.fill();if(flight.focus){ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.stroke();}}ctx.restore();
  for(const target of flight.targets){
    if(!isActiveTarget(target)||target.inView===false)continue;
    const locked=isTargetLocked(flight,target);
    const color=locked?'#527078':target.role==='civilian'?'#78e4a7':target.group?'#85aaff':target.role==='boss'?'#ee85e6':target.enemyType?ENEMY_TYPES[target.enemyType].color:['scan','cloud','gate'].includes(target.role)?'#6ef3df':['facility','support','generator'].includes(target.role)?'#ffc170':'#ff7884';
    ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=target.group?1:2;
    const aircraft=flight.mode==='bullethell'&&target.enemyType;
    if(target.role==='boss'&&flight.mode==='bullethell'){
      const open=coreOpen(flight,target);ctx.fillStyle=open?'#ff92dc':'#384d5e';ctx.beginPath();ctx.arc(target.x,target.y,open?9:17,0,Math.PI*2);ctx.fill();ctx.strokeRect(target.x-22,target.y-22,44,44);
    }else if(aircraft)drawEnemy(ctx,target,color);
    else if(target.domain==='sea'){
      ctx.beginPath();ctx.moveTo(target.x,target.y-25);ctx.lineTo(target.x-13,target.y-10);ctx.lineTo(target.x-13,target.y+22);ctx.lineTo(target.x+13,target.y+22);ctx.lineTo(target.x+13,target.y-10);ctx.closePath();ctx.stroke();ctx.fillRect(target.x-5,target.y-8,10,18);
    }else {ctx.strokeRect(target.x-13,target.y-13,26,26);if(target.domain==='ground'){ctx.fillRect(target.x-7,target.y-7,14,14);ctx.strokeRect(target.x-20,target.y-19,40,38);}}
    if(flight.mode==='bullethell'&&target.maxHp>1){ctx.fillStyle='#254052';ctx.fillRect(target.x-16,target.y+20,32,3);ctx.fillStyle=color;ctx.fillRect(target.x-16,target.y+20,32*Math.max(0,target.hp)/target.maxHp,3);}
    if(!locked&&!aircraft){ctx.beginPath();ctx.moveTo(target.x-18,target.y);ctx.lineTo(target.x+18,target.y);ctx.moveTo(target.x,target.y-18);ctx.lineTo(target.x,target.y+18);ctx.stroke();}
    ctx.font='10px monospace';
    const label=locked?'BLOQUEADO':target.role==='civilian'?'CIVIL':target.group?'SECUNDARIO':target.role==='boss'?(coreOpen(flight,target)?'NÚCLEO ABIERTO':'COMPUERTA CERRADA'):target.enemyType?ENEMY_TYPES[target.enemyType].name:target.role==='scan'?'REGISTRAR':target.role==='gate'?'PASO '+(target.sequence+1):target.role==='cloud'?'ANB':target.label;
    ctx.fillStyle=color;ctx.fillText(label,Math.min(590,aircraft?target.x-20:target.x+18),target.y-(aircraft?27:14));
  }
  for(const shot of flight.shots){ctx.strokeStyle=shot.miss?'#ffbd85':'#aafbf2';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(shot.sx,shot.sy);ctx.lineTo(shot.x+(shot.miss?40:0),shot.y);ctx.stroke();}
  for(const effect of flight.effects){ctx.strokeStyle='#ffd475';ctx.beginPath();ctx.arc(effect.x,effect.y,30*(1-effect.life/.6)+10,0,Math.PI*2);ctx.stroke();}
  if(flight.waveTransition>0){ctx.font='18px monospace';ctx.fillStyle='#ffe4a0';ctx.fillText('OLEADA '+(flight.waveIndex+1)+' · EN APROXIMACIÓN',145,235);}
  ctx.fillStyle='#77b9c6';ctx.font='11px monospace';ctx.fillText('NEMO',Math.min(670,flight.x+16),flight.y||365);
}
