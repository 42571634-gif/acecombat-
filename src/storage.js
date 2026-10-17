import { validateCampaign } from './engine.js?v=0.2.0';
import { missions } from './missions.js?v=0.2.0';
import { endingData } from './story.js?v=0.2.0';
export const SAVE_KEY='electrosphere.campaign';
export const SIMULATOR_KEY='electrosphere.simulator';
export const PROFILE_KEY='electrosphere.profile';
export function saveCampaign(storage,state){
  try{const valid=validateCampaign(state);storage.setItem(valid.simulatorMission?SIMULATOR_KEY:SAVE_KEY,JSON.stringify(valid));return {ok:true};}
  catch(error){return {ok:false,message:`No se pudo guardar: ${error.message}`};}
}
export function loadCampaign(storage,{simulator=false}={}){
  try{
    const raw=storage.getItem(simulator?SIMULATOR_KEY:SAVE_KEY);
    if(raw===null)return {ok:true,state:null};
    if(typeof raw!=='string'||raw.length>500000)throw new Error('Tamaño de partida inválido.');
    const parsed=JSON.parse(raw),state=validateCampaign(parsed);
    if(Boolean(state.simulatorMission)!==simulator)throw new Error('La ranura no corresponde al modo de juego.');
    return {ok:true,state,...(parsed.version===1?{migrated:true}:{})};
  }catch(error){return {ok:false,state:null,message:`No se pudo cargar: ${error.message}`};}
}
export function loadProfile(storage){
  try{
    const raw=storage.getItem(PROFILE_KEY);
    if(raw===null)return {version:1,missions:[],endings:[]};
    if(raw.length>20000)throw new Error('Perfil inválido.');
    const data=JSON.parse(raw);
    if(data.version!==1||!Array.isArray(data.missions)||!Array.isArray(data.endings))throw new Error('Perfil inválido.');
    return {version:1,missions:[...new Set(data.missions.filter(id=>Object.hasOwn(missions,id)))],endings:[...new Set(data.endings.filter(id=>Object.hasOwn(endingData,id)))]};
  }catch{return {version:1,missions:[],endings:[]};}
}
export function saveProfile(storage,profile){try{storage.setItem(PROFILE_KEY,JSON.stringify(profile));return true;}catch{return false;}}
