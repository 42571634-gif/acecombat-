import { mkdir,writeFile,readFile } from 'node:fs/promises';
const base='https://www.bandainamcoent.co.jp/cs/list/acecombat3/';
const portraits=['rena','fiona','erich','clarkson','park','dision','keith','cynthia'].map(id=>({id,url:base+'img/'+id+'.jpg',source:base+(['rena','fiona','erich'].includes(id)?'page03.html':['clarkson','park'].includes(id)?'page04.html':'page05.html'),credit:'Namco / Bandai Namco Entertainment'}));
portraits.push({id:'simon',file:'simon.webp',url:'https://static.wikia.nocookie.net/acecombat/images/e/e6/Simons-ace3.jpg/revision/latest/scale-to-width-down/268?cb=20100926053026',source:'https://acecombat.fandom.com/wiki/Simon_Orestes_Cohen',credit:'Namco / Bandai Namco Entertainment; archivo en Acepedia'});
for(const p of portraits)p.file||=p.id+'.jpg';
await mkdir('assets/portraits',{recursive:true});
await writeFile('assets/portraits/sources.json',JSON.stringify({accessed:'2026-10-17',note:'Retratos incorporados por petición explícita del usuario. No son imágenes originales del proyecto; no se atribuye una licencia libre. Simon se descargó mediante el navegador; su servidor rechaza algunos clientes.',portraits},null,2)+'\n');
await mkdir('assets/portraits',{recursive:true});
const results=await Promise.allSettled(portraits.map(async p=>{
  try{const existing=await readFile('assets/portraits/'+p.file);if(existing.length>1000)return {id:p.id,bytes:existing.length,cached:true};}catch{}
  const response=await fetch(p.url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(p.id+': HTTP '+response.status);
  const data=Buffer.from(await response.arrayBuffer());
  if(!(data[0]===255&&data[1]===216)&&data.toString('ascii',0,4)!=='RIFF')throw new Error(p.id+': el recurso no es una imagen válida');
  await writeFile('assets/portraits/'+p.file,data);
  return {id:p.id,bytes:data.length};
}));
for(const r of results)console.log(r.status==='fulfilled'?r.value:r.reason.message);
if(results.some(r=>r.status==='rejected'))process.exitCode=1;
