import { story } from './story.js?v=0.3.0';
import { missions } from './missions.js?v=0.3.0';
import * as legacy from './legacy/engine.js?v=0.3.0';
import { story as legacyStory } from './legacy/story.js?v=0.3.0';
import { missions as legacyMissions } from './legacy/missions.js?v=0.3.0';

export const SAVE_VERSION = 2;
export const FACTIONS = ['UPEO','GR','NEUCOM','OUROBOROS'];
const graphs={jp52:{story,missions},'demo-v1':{story:legacyStory,missions:legacyMissions}};
const own=(object,key)=>Object.hasOwn(object,key);
const factionRule=rule=>rule && Object.keys(rule).length===1 && FACTIONS.includes(rule.faction);
function validRequirement(rule,catalog) {
  if(factionRule(rule)) return true;
  if(!rule || Object.keys(rule).length!==1 || !rule.objective) return false;
  const value=rule.objective, secondary=catalog[value.mission]?.secondary;
  return secondary?.id===value.id && Object.keys(value).every(key=>['mission','id','min','max'].includes(key)) &&
    (value.min!==undefined || value.max!==undefined) && ['min','max'].every(key=>value[key]===undefined || Number.isInteger(value[key]) && value[key]>=0 && value[key]<=secondary.count) &&
    !(value.min!==undefined && value.max!==undefined && value.min>value.max);
}
export function validateGraph(nodes=story,catalog=missions) {
  const errors=[],edges=new Map();
  if(!own(nodes,'intro')) errors.push('Falta el nodo inicial intro.');
  for(const [id,node] of Object.entries(nodes)) {
    const destinations=[];
    if(!node || typeof node!=='object'){errors.push(`${id}: nodo inválido.`);continue;}
    if(node.kind==='dialogue'){
      if(!Array.isArray(node.options)||!node.options.length) errors.push(`${id}: diálogo sin opciones.`);
      const ids=new Set();
      for(const option of Array.isArray(node.options)?node.options:[]){
        if(!option){errors.push(`${id}: opción inválida.`);continue;}
        if(!option.id || ids.has(option.id))errors.push(`${id}: opción duplicada o sin identificador.`);
        ids.add(option.id);
        if(typeof option.text!=='string'||!option.text.trim()) errors.push(`${id}: opción sin texto.`);
        if(option.effects&&!factionRule(option.effects)) errors.push(`${id}: efectos inválidos.`);
        if(option.requires&&!validRequirement(option.requires,catalog)) errors.push(`${id}: condiciones inválidas.`);
        destinations.push(option.next);
      }
    }else if(node.kind==='mission'){
      const mission=catalog[node.mission];
      if(!mission||!Number.isInteger(mission.total)||mission.total<=0||!Number.isFinite(mission.time)||mission.time<=0) errors.push(`${id}: misión inexistente o inválida.`);
      destinations.push(node.next);
    }else if(node.kind==='ending'){
      if(!node.label||!node.description) errors.push(`${id}: final incompleto.`);
      if(node.next||node.options) errors.push(`${id}: un final no puede tener salidas.`);
    }else errors.push(`${id}: tipo desconocido.`);
    for(const next of destinations) if(!own(nodes,next)) errors.push(`${id}: destino inexistente ${next}.`);
    edges.set(id,destinations);
  }
  const reached=new Set(),active=new Set(),done=new Set();
  function visit(id){
    if(!own(nodes,id)) return;
    reached.add(id);
    if(active.has(id)){errors.push(`${id}: ciclo narrativo.`);return;}
    if(done.has(id)) return;
    active.add(id);
    for(const next of edges.get(id)||[]) visit(next);
    active.delete(id);done.add(id);
  }
  visit('intro');
  for(const id of Object.keys(nodes)) if(!reached.has(id)) errors.push(`${id}: nodo inaccesible.`);
  return errors;
}
function graph(state){
  if(!own(graphs,state.campaignId)) throw new Error('Campaña desconocida.');
  return graphs[state.campaignId];
}
export function createCampaign({campaignId='jp52',simulatorMission=null}={}){
  if(!own(graphs,campaignId)) throw new Error('Campaña desconocida.');
  if(simulatorMission!==null && (campaignId!=='jp52'||!own(missions,simulatorMission))) throw new Error('Misión de simulador inexistente.');
  const base=legacy.createCampaign();
  return {...base,version:SAVE_VERSION,campaignId,simulatorMission,
    node:simulatorMission?simulatorMission+'Intro':'intro',faction:simulatorMission?missions[simulatorMission].faction:'UPEO'};
}
export function missionById(state,id){
  const catalog=graph(state).missions;
  if(!own(catalog,id)) throw new Error(`Misión inexistente: ${id}`);
  return catalog[id];
}
export function currentNode(state){
  if(state.simulatorMission && state.node==='simulatorComplete')return {kind:'ending',label:'Simulación completada',description:`Has completado ${missions[state.simulatorMission].name}. Puedes volver a la campaña o elegir otra misión.`,simulator:true};
  const nodes=graph(state).story;
  if(!own(nodes,state.node)) throw new Error(`Nodo inexistente: ${state.node}`);
  return nodes[state.node];
}
export function canChoose(state,option){
  if(!option.requires)return true;
  if(option.requires.faction)return state.faction===option.requires.faction;
  const requirement=option.requires.objective;
  if(!requirement)return false;
  const result=state.results.findLast(result=>result.mission===requirement.mission && result.status==='victory');
  if(!result)return false;
  const count=result.objectives?.[requirement.id]||0;
  return (requirement.min===undefined||count>=requirement.min)&&(requirement.max===undefined||count<=requirement.max);
}
export function chooseOption(state,optionId){
  if(state.campaignId==='demo-v1')return legacy.chooseOption(state,optionId);
  const node=currentNode(state);
  if(node.kind!=='dialogue')throw new Error('No hay decisiones disponibles en este nodo.');
  const option=node.options.find(item=>item.id===optionId);
  if(!option||!canChoose(state,option))throw new Error('Decisión inexistente o no disponible.');
  if(state.simulatorMission && option.next!==state.simulatorMission+'Combat')throw new Error('El simulador no puede cambiar la ruta de campaña.');
  if(!own(story,option.next))throw new Error(`Destino inexistente: ${option.next}`);
  const faction=option.effects?.faction||state.faction;
  return {...state,node:option.next,faction,
    decisions:[...state.decisions,{node:state.node,option:option.id,factionBefore:state.faction,factionAfter:faction}],
    history:[...state.history,{type:'choice',node:state.node,option:option.id}]};
}
export function resolveMission(state,outcome){
  if(state.campaignId==='demo-v1')return legacy.resolveMission(state,outcome);
  const node=currentNode(state);
  if(node.kind!=='mission')throw new Error('No hay una misión en curso.');
  const mission=missionById(state,node.mission),maxKills=mission.total+(mission.secondary?.kind==='scan'?0:mission.secondary?.count||0);
  const completed=outcome?.completed,objectives=outcome?.objectives;
  const validObjectives=objectives && typeof objectives==='object' && !Array.isArray(objectives) && Object.keys(objectives).every(id=>id===mission.secondary?.id) &&
    (!mission.secondary || Number.isInteger(objectives[mission.secondary.id]) && objectives[mission.secondary.id]>=0 && objectives[mission.secondary.id]<=mission.secondary.count);
  if(!outcome || !['victory','defeat'].includes(outcome.status) || !Number.isInteger(completed)||completed<0||completed>mission.total ||
    !Number.isInteger(outcome.kills)||outcome.kills<0||outcome.kills>maxKills||!validObjectives ||
    !Number.isFinite(outcome.integrity)||outcome.integrity<0||outcome.integrity>100||
    !Number.isFinite(outcome.timeRemaining)||outcome.timeRemaining<0||outcome.timeRemaining>mission.time||
    (outcome.status==='victory'&&(completed!==mission.total||outcome.integrity<=0||outcome.timeRemaining<=0))||
    (outcome.status==='defeat'&&(completed===mission.total||(outcome.timeRemaining>0&&outcome.integrity>0))))throw new Error('Resultado de misión inválido.');
  const expectedKills=['recon','containment'].includes(mission.type)?0:mission.type==='tunnel'?Math.max(0,completed-(mission.total-(mission.supportCount||0))):completed;
  const optionalKills=mission.secondary&&mission.secondary.kind!=='scan'?objectives[mission.secondary.id]:0;
  if(outcome.kills!==expectedKills+optionalKills)throw new Error('Bajas incompatibles con los objetivos registrados.');
  const result={mission:node.mission,status:outcome.status,kills:outcome.kills,completed,objectives:{...objectives},integrity:outcome.integrity,timeRemaining:outcome.timeRemaining};
  return {...state,node:outcome.status==='victory'?(state.simulatorMission?'simulatorComplete':node.next):state.node,
    results:[...state.results,result],history:[...state.history,{type:'mission',node:state.node,result}]};
}
export function campaignSummary(state){return legacy.campaignSummary(state);}
const stable=value=>JSON.stringify(value,function(key,item){return item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(name=>[name,item[name]])):item;});
export function validateCampaign(candidate){
  if(candidate?.version===1){
    const old=legacy.validateCampaign(candidate);
    return {...old,version:SAVE_VERSION,campaignId:'demo-v1',simulatorMission:null};
  }
  if(!candidate||candidate.version!==SAVE_VERSION)throw new Error('Versión de partida no compatible.');
  if(!Array.isArray(candidate.history)||candidate.history.length>1000)throw new Error('Historial inválido.');
  let replay=createCampaign({campaignId:candidate.campaignId,simulatorMission:candidate.simulatorMission});
  for(const event of candidate.history){
    if(!event||event.node!==replay.node)throw new Error('El historial no corresponde a la ruta.');
    if(event.type==='choice')replay=chooseOption(replay,event.option);
    else if(event.type==='mission')replay=resolveMission(replay,event.result);
    else throw new Error('Evento de historial desconocido.');
  }
  if(stable(replay)!==stable(candidate))throw new Error('La partida contiene datos incoherentes.');
  return replay;
}
