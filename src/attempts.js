// Generador versionado: el resultado no depende del renderizado ni del azar de misiles.
export const GENERATOR_VERSION=1;
export function seeded(seed){let value=seed>>>0;return ()=>{value=(Math.imul(1664525,value)+1013904223)>>>0;return value/4294967296;};}
export const stream=(seed,name)=>seeded((seed^({terrain:0x45d9f3b,encounters:0x119de1f3,missiles:0x3449a21d}[name]||0))>>>0);
export function newAttempt(difficulty='normal',crypto=globalThis.crypto){
  const data=new Uint32Array(1);if(crypto?.getRandomValues)crypto.getRandomValues(data);else data[0]=Math.floor(Math.random()*4294967296);
  return {seed:data[0],difficulty,generator:GENERATOR_VERSION};
}
export function validAttempt(value){return value&&Object.keys(value).sort().join(',')==='difficulty,generator,seed'&&Number.isInteger(value.seed)&&value.seed>=0&&value.seed<=4294967295&&['easy','normal','expert'].includes(value.difficulty)&&value.generator===GENERATOR_VERSION;}
// Los tipos especiales y sus cantidades se conservan. Los encuentros ordinarios varían.
export function generateEncounter(mission,attempt){
  if(!validAttempt(attempt))throw new Error('Descriptor de intento inválido.');
  const random=stream(attempt.seed,'encounters');
  const fixed=!['intercept','ground','naval','train'].includes(mission.type)||[1,2,4,20,23,24,25,27,29,33,34,35,39,43,44,45,48].includes(mission.number);
  const total=fixed?mission.total:Math.max(3,mission.total+Math.floor(random()*3)-1);
  const waveCount=fixed?null:1+Math.floor(random()*Math.min(3,Math.floor(total/2)));
  const extra=Math.max(0,total-mission.total)*15+Math.max(0,(waveCount||1)-1)*8;
  return {...mission,total,time:mission.time+Math.min(mission.time*.25,extra),encounter:{...attempt,fixed,waveCount}};
}
