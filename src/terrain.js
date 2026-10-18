import { stream } from './attempts.js?v=0.8.0';
export function prepareTerrain(f){
  const n=f.m.number;
  f.biome=n===38?'digital':f.m.type==='orbital'?'orbit':/Geofront/.test(f.m.place)?'tunnel':/Desert/.test(f.m.place)?'desert':/Mountains|Range|Valley|Plateau/.test(f.m.place)?'mountains':[8,11,25,26,40,44].includes(n)?'facility':/Ocean|Gulf|Coast|Island|Bay/.test(f.m.place)?'coast':'city';
  const random=stream(f.attempt?.seed??f.m.seed??1,'terrain');
  f.scenery=Array.from({length:80},()=>({x:random()*720,y:random()*520,w:12+random()*48,h:12+random()*58,t:random()}));
}
export function drawTerrain(ctx,f){
  const colors={city:['#101e2b','#1c3443'],mountains:['#232b25','#405044'],desert:['#302a20','#5e5037'],coast:['#092c42','#145169'],facility:['#182629','#304344'],orbit:['#080d23','#a1bdd6'],tunnel:['#111926','#33495b'],digital:['#071d29','#1a5d65']};
  const [base,detail]=colors[f.biome]||colors.city;ctx.fillStyle=base;ctx.fillRect(0,0,720,420);
  for(const item of f.scenery||[]){
    const y=(item.y+(f.scroll||0)*(f.biome==='orbit'?.1:.45+item.t*.4))%520-70;
    ctx.fillStyle=detail;ctx.strokeStyle=detail;ctx.lineWidth=1;
    if(f.biome==='orbit'){ctx.fillRect(item.x,y,item.t>0.8?2:1,item.t>0.8?2:1);}
    else if(f.biome==='mountains'||f.biome==='desert'){ctx.beginPath();ctx.moveTo(item.x,y+item.h);ctx.lineTo(item.x+item.w/2,y);ctx.lineTo(item.x+item.w,y+item.h);ctx.closePath();ctx.fill();}
    else if(f.biome==='coast'){ctx.fillRect(item.x,y,item.w,2);if(item.t>.9){ctx.fillStyle='#374e45';ctx.fillRect(item.x,y,item.w,item.h);}}
    else if(f.biome==='digital'){ctx.strokeRect(item.x,y,item.w,item.h);ctx.beginPath();ctx.moveTo(item.x,y);ctx.lineTo(item.x+item.w+25,y-20);ctx.stroke();}
    else if(f.biome==='tunnel'){ctx.strokeRect(45,y,630,50);ctx.fillRect(30,y,8,25);ctx.fillRect(682,y,8,25);}
    else {ctx.fillRect(item.x,y,item.w,item.h);ctx.fillStyle='#59716a';if(item.t>.4)ctx.fillRect(item.x+3,y+4,3,3);}
  }
}
export function drawOutcome(ctx,f){
  const presentation=f.presentation||f.finalPresentation;if(!presentation)return;
  const p=Math.min(1,presentation.elapsed/presentation.duration),victory=f.status==='victory';
  ctx.fillStyle= victory?'rgba(25,100,90,0.18)':'rgba(70,12,22,0.35)';ctx.fillRect(0,0,720,420);
  if(victory){
    ctx.strokeStyle='#96ffe1';ctx.lineWidth=3;
    for(const offset of [-26,0,26]){ctx.beginPath();ctx.moveTo(f.x+offset,365-p*490);ctx.lineTo(f.x+offset,425-p*490);ctx.stroke();}
    if(f.m.type==='boss')for(let i=0;i<9;i++){ctx.strokeStyle=i%2?'#ffc777':'#ff8bb4';ctx.beginPath();ctx.arc(360+Math.sin(i*3)*90,120+Math.cos(i*3)*40,2+p*(30+i*4),0,Math.PI*2);ctx.stroke();}
  }else if(f.t<=0&&f.hp>0&&(f.protected?.hp??100)>0){
    ctx.strokeStyle='#ffbd85';ctx.lineWidth=4;ctx.beginPath();ctx.arc(360,115,20+p*45,p*5,p*5+Math.PI*1.5);ctx.stroke();ctx.font='14px monospace';ctx.fillStyle='#ffdab0';ctx.fillText('VENTANA AGOTADA · RETIRADA',240,240);
  }else{
    const x=f.protected?.hp<=0?f.protected.x:f.x,y=f.protected?.hp<=0?f.protected.y:f.y||365;
    for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#ffb96c':'#6f5b62';ctx.beginPath();ctx.arc(x+Math.sin(i*2)*p*70,y+Math.cos(i*2)*p*45-p*50,3+p*(i+3),0,Math.PI*2);ctx.fill();}
  }
  ctx.fillStyle='#f4f8ff';ctx.font='bold 25px monospace';ctx.fillText(victory?'MISIÓN COMPLETADA':'MISIÓN FALLIDA',215,195);
}
