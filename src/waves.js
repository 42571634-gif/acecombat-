import { dialogueLine } from './characters.js?v=0.8.1';
import { missionContexts } from './mission-context.js?v=0.8.1';
import { phaseConversations,sourceForRadio } from './character-radio.js?v=0.8.1';
// Radio operativa original para las fases del minijuego.
const waves=(...stages)=>stages.map(([label,character,text])=>({label,message:dialogueLine([character,text]),adaptation:true}));
export const WAVE_PLANS={
  m01:waves(["Intervención de UPEO","rena","Atacaremos los objetivos de Neucom."],["Refuerzos de Neucom","control","Se detectan refuerzos. Preparen una nueva intercepción."]),
  m03:waves(["Contenedores cercanos","keith","Destruye los contenedores del primer grupo antes de que alcancen la ciudad."],["Segundo grupo","dision","Hay otro grupo de contenedores en descenso. La emergencia todavía no ha terminado."]),
  m09:waves(["Cobertura del transporte","erich","Mantente cerca del transporte. Tenemos que interceptar a los aviones de General Resource."],["Cerrar la intercepción","fiona","Quedan atacantes en aproximación al transporte. Intercéptalos para completar la escolta."]),
  m15:waves(["Sector oeste","erich","Comprueba la identificación de cada contacto. Hay civiles dentro de la zona de combate."],["Sector este","park","Quedan fuerzas de ambas compañías en el sector este. Continúen la intervención."]),
  m17:waves(["Defensas del Sphyrna","erich","Destruye las defensas exteriores del Sphyrna antes de acercarte al núcleo."],["Núcleo expuesto","erich","El núcleo del Sphyrna está expuesto. Ataca durante la apertura de la compuerta."]),
  m24:waves(["Primera intercepción","keith","Nemo, intercepta los bombarderos. Si puedes ayudarme con el atacante que me persigue, hazlo antes de terminar."],["Bombarderos restantes","dision","Quedan bombarderos en la zona. Complete la intercepción antes de regresar."]),
  m30:waves(["Defensas del portaaviones","keith","Ataca las defensas del Sphyrna. Tenemos que acceder a sus sistemas internos."],["Sphyrna vulnerable","keith","El Sphyrna es vulnerable. Si vas a atacar también al Night Raven, resuelve ese objetivo antes del último principal."]),
  m32:waves(["Abrir la defensa","keith","Destruye las defensas que protegen al Night Raven. Yo cubriré tu aproximación."],["Night Raven","keith","Night Raven vulnerable. Aprovecha la oportunidad para detenerlo."],["Amenaza de Dision","dision","Nemo, el enfrentamiento no ha terminado. Ahora tendrás que combatir conmigo."]),
  m33:waves(["Primeras señales","control","Primer grupo de Geopelia en aproximación. Intercepte los contactos."],["Segunda agrupación","archive","Segundo grupo de Geopelia detectado. No hay respuesta en el canal de Keith."],["Últimos Geopelia","control","Quedan Geopelia sobre Port Edwards. Complete la intercepción."]),
  m37:waves(["Romper la defensa","keith","Ataca los sistemas que protegen al Night Raven. Voy a ayudarte a abrir una ruta."],["Night Raven","rena","No consigo recuperar el control. Algo sigue interfiriendo conmigo."],["Sphyrna","control","Night Raven neutralizado. El núcleo del Sphyrna sigue activo."]),
  m40:waves(["Aproximación del transbordador","cynthia","Protege toda la ruta de descenso del transbordador. Los atacantes no deben alcanzar al aliado."],["Última cobertura","fiona","Quedan interceptores cerca del transbordador. Despéjalos para completar su protección."]),
  m47:waves(["Generadores Aeon","simon","Neutraliza los generadores Aeon. Son los que mejoran la capacidad de maniobra del Night Raven."],["Night Raven","cynthia","El Night Raven ha perdido su ventaja. Ahora podemos atacarlo."]),
  m48:waves(["Escolta de Ouroboros","fiona","Despeja la escolta de Ouroboros para que podamos acercarnos a Cynthia."],["Últimos interceptores","fiona","Quedan interceptores bloqueando nuestra aproximación. Necesito que me ayudes a detenerlos."]),
  m50:waves(["Defensas del Sphyrna","fiona","Ataca las defensas exteriores del Sphyrna. No podemos permitir otro ataque sobre la ciudad."],["Núcleo del Sphyrna","fiona","El núcleo del Sphyrna está expuesto. Terminemos con el portaaviones."]),
  m52:waves(["Generadores","simon","Primero debemos reducir la ventaja que proporcionan los generadores Aeon al Night Raven."],["Night Raven","fiona","Night Raven vulnerable. Nemo, ataca durante la oportunidad indicada."],["Aurora de Dision","fiona","El Night Raven ha caído. Ahora debemos detener al avión de Dision."]),
};
Object.assign(WAVE_PLANS,{
 m08:waves(['Despejar la trayectoria','erich','Despeja los obstáculos sin dañar el dirigible.'],['Embarcación en fuga','fiona','Una embarcación se ha separado del dirigible. Intercéptala antes de abandonar la zona.']),
 m13:waves(['Concentraciones de nanobots','erich','Aplica ANB sobre las concentraciones del radar.'],['Rena contaminada','erich','Los nanobots han alcanzado el avión de Rena. Aplica ANB sobre ella para detener la contaminación.']),
 m26:waves(['Cobertura Antlion','dision','Las unidades Antlion necesitan cobertura durante el asalto.'],['Cohete de Neucom','control','Se detecta el lanzamiento de Neucom. Intercepta el cohete antes de abandonar la operación.']),
 m27:waves(['Silos del desfiladero','keith','Busca los silos entre las montañas.'],['Misil en vuelo','keith','Un silo ha conseguido lanzar. Yo cubro la zona; intercepta el misil.']),
 m35:waves(['Fuerzas restantes','dision','Ataca las fuerzas de Neucom junto al Sphyrna.'],['Lanzamiento naval','dision','La flota ha lanzado un misil. Intercéptalo.']),
 m43:waves(['Base aérea','cynthia','Aproximación baja a la base. Neutraliza primero sus instalaciones.'],['Defensa de General Resource','fiona','Hay aviones defendiendo la base. Mantén cubierta la formación.']),
 m44:waves(['Acceso a la pista','dision','Despeja las tropas de tierra para permitir el aterrizaje.'],['Zona de extracción','cynthia','La pista debe quedar libre para que puedan recoger a Rena.']),
 m45:waves(['Intercepción inicial','cynthia','Primero despejemos la aproximación a Megafloat.'],['Sphyrna','cynthia','El Night Raven ha atacado Megafloat. Tenemos que destruir su plataforma.'],['Dision','cynthia','Un avión sale del Sphyrna. Es Dision; no dejes que escape.']),
});
WAVE_PLANS.m09[1]=waves(['Radio interferida','control','La radio del transporte está interferida. Mantengan la cobertura por radar y rechacen a los atacantes restantes.'])[0];
export const isActiveTarget=target=>target.alive&&target.active!==false;
export function prepareWaves(flight){
  flight.waves=(WAVE_PLANS[flight.id]||waves(['Operación','control','Objetivos adquiridos. Mantenga la aproximación y confirme cada contacto.'])).map(wave=>({...wave}));
  if(flight.m.encounter?.waveCount){
    const first=flight.waves[0];flight.waves=Array.from({length:flight.m.encounter.waveCount},(_,index)=>index?waves(['Intercepción '+(index+1),'control','Nuevo grupo en aproximación. Mantén la cobertura y confirma los blancos de esta pasada.'])[0]:first);
  }
  if(flight.m.type==='boss'){
    const original=flight.waves,cores=flight.targets.filter(t=>t.role==='boss');
    flight.waves=waves(['Defensas exteriores','control','Ataca los puntos exteriores marcados. Los sistemas internos siguen protegidos.'],['Sistemas internos','control','La primera capa está abierta. Neutraliza los sistemas internos para exponer el núcleo.'],...cores.map(t=>[t.label+' · núcleo','control','Núcleo expuesto. Dispara cuando la compuerta esté abierta; el punto vulnerable es pequeño.']));
    flight.waves[0].message=original[0].message;
  }
  if(flight.id==='m49')flight.waves=waves(['Defensa del Sphyrna','fiona','Continuemos el ataque al Sphyrna.'],['Escolta de retirada','control','El Sphyrna se retira. Intercepta a su escolta.'],['Cynthia','fiona','¡Cynthia, eres tú! Contesta, por favor. ¿No puedes oírme?']);
  if(flight.id==='m52'){
    flight.waves[0].label='Enlaces Aeon';
    flight.waves[1]=waves(['Interferencia Aeon','simon','La interferencia está activa. Completa la apertura de los enlaces marcados para alcanzar al Night Raven.'])[0];
  }
  const context=missionContexts[flight.id];
  if(context)flight.waves[0]={...flight.waves[0],message:dialogueLine([context.character,context.radio]),source:context.source,confidence:'community-transcript'};
  flight.waves=flight.waves.map((phase,index)=>{
    const recovered=phaseConversations[flight.id]?.[index];
    const source=sourceForRadio(flight.id);
    const command=['m01','m09','m26','m49'].includes(flight.id)&&index===1||index===0&&phase.message.character==='control';
    const original={...phase.message,category:phase.message.character==='control'?(command?'command':'system'):phase.message.character==='archive'?'system':'character'};
    const messages=recovered?recovered.map(message=>({...message,category:message.character==='control'?'command':'character'})):flight.m.type==='boss'&&index>0&&flight.id!=='m49'?[]:original.category==='system'?[]:[original];
    return {...phase,source,confidence:recovered?'community-transcript':phase.confidence||'operational-adaptation',messages,
      message:messages[0]||{...phase.message,category:'system'},
      systemMessage:{...dialogueLine(['control',flight.m.type==='boss'&&index>0?phase.label+': '+(index===1?'neutraliza los sistemas internos marcados.':'ataca el núcleo durante la apertura de su compuerta.'):'Fase '+(index+1)+' · '+phase.label]),category:'system'}};
  });
  flight.waveIndex=0;flight.waveTransition=0;flight.waveEvents=[{index:0,...flight.waves[0]}];
  const required=flight.targets.filter(t=>t.required);
  for(const target of flight.targets){
    if(!target.required){target.wave=0;target.active=true;continue;}
    target.wave=flight.waves.length===1?0:flight.id==='m49'?(target.role==='boss'?2:target.sequence===0?0:1):[8,13,26,27,35].includes(flight.m.number)?(target.sequence===required.length-1?1:0):flight.id==='m45'?(target.sequence>=required.length-2?target.sequence-(required.length-2)+1:0):flight.m.type==='boss'?(target.role==='boss'?2+target.sequence-(flight.m.total-(flight.m.bossCount||1)):target.depth):Math.floor(target.sequence*flight.waves.length/required.length);
    target.active=target.wave===0;
  }
}
export function checkNextWave(flight){
  if(!flight.waves||flight.waveTransition>0||flight.waveIndex>=flight.waves.length-1)return;
  if(flight.targets.some(t=>t.required&&t.wave===flight.waveIndex&&t.alive))return;
  flight.waveIndex++;flight.waveTransition=.8;
  flight.bullets=[];flight.playerBullets=[];flight.patternClock=0;
  flight.invulnerable=Math.max(flight.invulnerable,1.2);
  flight.waveEvents.push({index:flight.waveIndex,...flight.waves[flight.waveIndex]});
}
export function advanceWaves(flight,dt){
  if(!flight.waves||flight.waveTransition<=0)return;
  flight.waveTransition=Math.max(0,flight.waveTransition-dt);
  if(flight.waveTransition===0)for(const target of flight.targets)if(target.required&&target.wave===flight.waveIndex)target.active=true;
}
