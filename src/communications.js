// La categoría describe la función editorial; el canal sigue indicando aliado/enemigo/mando.
export const COMMUNICATION_CATEGORIES=['character','command','system'];
export function communicationCategory(value){
  if(COMMUNICATION_CATEGORIES.includes(value.category))return value.category;
  const message=value.message||value;
  if(COMMUNICATION_CATEGORIES.includes(message.category))return message.category;
  if(message.kind==='narration'||message.character==='archive')return 'system';
  if(message.character==='control')return value.confidence==='community-transcript'?'command':'system';
  return 'character';
}
export const isNarrative=value=>(value.message||value).kind!=='narration'&&communicationCategory(value)!=='system';
export function filterCommunications(events,filter='conversations'){
  return events.filter(event=>filter==='all'||(filter==='system'?communicationCategory(event)==='system':communicationCategory(event)!=='system'));
}
// Decisiones explícitas de la revisión: órdenes con función narrativa, no instrucciones del minijuego.
const commandScenes={1:['pre'],3:['pre'],9:['pre'],11:['pre'],12:['pre'],23:['pre','post'],29:['pre'],33:['pre','post'],35:['pre'],41:['pre','post'],43:['post'],45:['post'],49:['pre'],50:['post'],52:['pre']};
export function classifyScene(number,stage,lines){
  return lines.map(line=>({...line,category:line.character==='archive'?'system':line.character==='control'?(commandScenes[number]?.includes(stage)?'command':'system'):'character'}));
}
export function narrativeCounts(lines){
  const counts={character:0,command:0,system:0,narration:0,words:0};
  for(const value of lines){const line=value.message||value;if(line.kind==='narration'){counts.narration++;continue;}const category=communicationCategory(value);counts[category]++;if(category!=='system')counts.words+=line.text.trim().split(/\s+/).length;}
  return {...counts,total:counts.character+counts.command};
}
