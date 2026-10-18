import { dialogueLine } from './characters.js?v=0.8.0';
import { enemyRadio } from './mission-context.js?v=0.8.0';
export function prepareRadio(flight){flight.radio=[];flight.radioSeen=new Set();flight.radioWave=0;syncRadio(flight);}
export function syncRadio(f){
  if(!f.radio)return;
  function emit(id,message,channel='control',trigger=id,source=f.m.source,confidence='operational-adaptation'){
    if(f.radioSeen.has(id))return;
    f.radioSeen.add(id);f.radio.push({id,mission:f.id,order:f.radio.length+1,time:Math.round(f.elapsed*1000)/1000,channel,message:structuredClone(message),source,trigger,confidence,adaptation:true});
  }
  while(f.radioWave<(f.waveEvents?.length||0)){
    const event=f.waveEvents[f.radioWave++];emit('phase-'+event.index,event.message,event.channel||'allied','phase:'+event.index,event.source||f.m.source,event.confidence||'operational-adaptation');
  }
  if(!f.waves)emit('start',dialogueLine(['control','Operación en curso. Confirma los objetivos marcados antes de atacar.']));
  const enemy=enemyRadio[f.id];
  if(enemy&&f.waveIndex>=enemy.phase)emit('enemy',dialogueLine([enemy.character,enemy.text]),'enemy','phase:'+enemy.phase,f.m.source,'community-transcript');
  const integrity=Math.min(f.hp,f.protected?.hp??100);
  for(const threshold of [50,25])if(integrity<=threshold)emit('integrity-'+threshold,dialogueLine(['control',threshold===50?'Integridad por debajo del 50 %. Reduce la exposición al fuego y protege la formación.':'Integridad crítica: por debajo del 25 %. Prioriza las maniobras de evasión.']),'control','integrity<='+threshold);
  if(f.m.secondary&&f.objectives[f.m.secondary.id]===f.m.secondary.count)emit('secondary',dialogueLine(['control',f.m.secondary.label+': objetivo secundario confirmado. El informe recogerá este resultado.']),'control','secondary:'+f.m.secondary.id);
  if(f.status!=='active')emit('outcome',dialogueLine(['control',f.status==='victory'?'Objetivos de esta operación completados. Finaliza la intervención y consulta el informe.':'Operación interrumpida. '+f.feedback]),'control','outcome:'+f.status);
}
