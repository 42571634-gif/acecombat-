import { isTargetLocked } from './combat.js?v=0.2.0';
export function draw(flight,canvas){
  if(!flight||!canvas)return;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,720,420);ctx.fillStyle='#071824';ctx.fillRect(0,0,720,420);
  ctx.strokeStyle='#173744';ctx.lineWidth=1;
  for(let x=0;x<=720;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,420);ctx.stroke();}
  for(let y=0;y<=420;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(720,y);ctx.stroke();}
  ctx.font='12px monospace';ctx.fillStyle='#77a7b2';ctx.fillText((flight.m.arc||'SARF')+' / TACTICAL DISPLAY',14,20);
  if(flight.m.type==='tunnel'){
    const gate=flight.targets.find(target=>target.alive&&target.role==='gate');
    if(gate){ctx.fillStyle='#16404a';ctx.fillRect(gate.x-65,35,130,345);}
  }
  if(flight.protected){ctx.fillStyle='#6ef3b9';ctx.fillRect(flight.protected.x-20,flight.protected.y-8,40,16);ctx.fillText('PROTEGER '+Math.round(flight.protected.hp)+'%',flight.protected.x-44,flight.protected.y+30);}
  ctx.save();ctx.translate(flight.x,365);ctx.fillStyle='#67f6e0';ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(-12,15);ctx.lineTo(0,8);ctx.lineTo(12,15);ctx.closePath();ctx.fill();ctx.restore();
  for(const target of flight.targets){
    if(!target.alive)continue;
    const locked=isTargetLocked(flight,target);
    const color=locked?'#527078':target.role==='civilian'?'#78e4a7':target.group?'#85aaff':target.role==='boss'?'#ee85e6':['scan','cloud','gate'].includes(target.role)?'#6ef3df':['facility','support','generator'].includes(target.role)?'#ffc170':'#ff7884';
    ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=target.group?1:2;
    ctx.strokeRect(target.x-13,target.y-13,26,26);
    if(!locked){ctx.beginPath();ctx.moveTo(target.x-18,target.y);ctx.lineTo(target.x+18,target.y);ctx.moveTo(target.x,target.y-18);ctx.lineTo(target.x,target.y+18);ctx.stroke();}
    ctx.font='10px monospace';
    const label=locked?'BLOQUEADO':target.role==='civilian'?'CIVIL':target.group?'SECUNDARIO':target.role==='boss'?'NÚCLEO '+target.hp:target.role==='scan'?'REGISTRAR':target.role==='gate'?'PASO '+(target.sequence+1):target.role==='cloud'?'ANB':target.label;
    ctx.fillText(label,Math.min(590,target.x+18),target.y-14);
  }
  for(const shot of flight.shots){ctx.strokeStyle='#aafbf2';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(shot.sx,shot.sy);ctx.lineTo(shot.x,shot.y);ctx.stroke();}
  for(const effect of flight.effects){ctx.strokeStyle='#ffd475';ctx.beginPath();ctx.arc(effect.x,effect.y,30*(1-effect.life/.6)+10,0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle='#77b9c6';ctx.font='11px monospace';ctx.fillText('NEMO',flight.x+16,365);
}
