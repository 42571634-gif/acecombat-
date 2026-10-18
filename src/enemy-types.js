// Siluetas y nombres propios de esta adaptación; no son modelos extraídos del juego.
export const ENEMY_TYPES={
  dart:{name:'Dardo',color:'#ff8793',armor:6,pattern:'aimed',speed:1.15,description:'Ala delta · ágil · abanico dirigido'},
  manta:{name:'Manta',color:'#ffc773',armor:10,pattern:'curtain',speed:.8,description:'Ala ancha y dos motores · blindado · cortina'},
  lynx:{name:'Lince',color:'#d6a0ff',armor:8,pattern:'ring',speed:1,description:'Dron hexagonal · ojo central · anillos'},
};
export function assignEnemyTypes(flight){
  let index=0;
  for(const target of flight.targets){
    if(target.role==='hostile'&&flight.m.type!=='orbital'){
      const baseHp=target.baseHp||1;target.enemyType=['dart','manta','lynx'][index++%3];
      target.hp=Math.ceil(ENEMY_TYPES[target.enemyType].armor*baseHp*flight.config.armor);target.maxHp=target.hp;
      target.homeX=target.x;
    }
  }
}
export function moveEnemy(target,time){
  const settings={dart:[48,1.8],manta:[12,.6],lynx:[26,.9]}[target.enemyType];
  if(settings)target.x=Math.max(30,Math.min(690,target.homeX+Math.sin(time*settings[1]+(target.sequence||0))*settings[0]));
}
export function drawEnemy(ctx,target,color){
  ctx.save();ctx.translate(target.x,target.y);ctx.strokeStyle=color;ctx.fillStyle='#142b3d';ctx.lineWidth=2;
  ctx.beginPath();
  if(target.enemyType==='dart'){
    ctx.moveTo(0,21);ctx.lineTo(-17,-10);ctx.lineTo(-5,-5);ctx.lineTo(0,-20);ctx.lineTo(5,-5);ctx.lineTo(17,-10);
  }else if(target.enemyType==='manta'||target.role==='boss'){
    ctx.moveTo(0,18);ctx.lineTo(-8,8);ctx.lineTo(-30,1);ctx.lineTo(-26,-12);ctx.lineTo(-8,-5);ctx.lineTo(0,-15);ctx.lineTo(8,-5);ctx.lineTo(26,-12);ctx.lineTo(30,1);ctx.lineTo(8,8);
  }else{
    for(let i=0;i<6;i++){const angle=Math.PI/3*i;const x=Math.cos(angle)*18,y=Math.sin(angle)*18;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
  }
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=color;
  if(target.enemyType==='manta'||target.role==='boss'){
    ctx.fillRect(-17,-15,5,9);ctx.fillRect(12,-15,5,9);
  }else if(target.enemyType==='lynx'){
    ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-25,0);ctx.lineTo(-17,0);ctx.moveTo(17,0);ctx.lineTo(25,0);ctx.stroke();
  }else ctx.fillRect(-3,-19,6,9);
  ctx.restore();
}
