import { missions } from './missions.js?v=0.2.0';
import { createCampaign,currentNode,chooseOption,resolveMission,campaignSummary,canChoose,validateGraph,missionById } from './engine.js?v=0.2.0';
import { saveCampaign,loadCampaign,loadProfile,saveProfile } from './storage.js?v=0.2.0';
import { createFlight,advanceFlight,fireMissile,isTargetLocked } from './combat.js?v=0.2.0';
import { draw } from './draw.js?v=0.2.0';

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function createApp({document,window,storage,campaignId='jp52',now=()=>performance.now(),repeat=setInterval,stopRepeat=clearInterval,delay=setTimeout,stopDelay=clearTimeout}){
  const errors=validateGraph();if(errors.length)throw new Error(errors.join('\n'));
  const $=id=>document.getElementById(id);
  let campaignState=createCampaign({campaignId}),flight=null,ticker=null,transition=null,savedAvailable=false;
  let hidden=Boolean(document.hidden),manualPause=false,archiveOpen=false,targetSignature='';
  const keys={},profile=loadProfile(storage);
  const isPaused=()=>hidden||manualPause||archiveOpen;
  function clearKeys(){for(const key of Object.keys(keys))delete keys[key];if(flight){flight.keyL=false;flight.keyR=false;}}
  function cleanup(){
    if(ticker!==null)stopRepeat(ticker);if(transition!==null)stopDelay(transition);
    ticker=transition=null;flight=null;manualPause=false;targetSignature='';clearKeys();
  }
  function persist(){
    const result=saveCampaign(storage,campaignState);
    if(result.ok&&!campaignState.simulatorMission)savedAvailable=true;
    $('load').disabled=!savedAvailable;
    $('saveStatus').textContent=result.ok?(campaignState.simulatorMission?'Simulación guardada en su ranura independiente.':'Partida guardada. Cargar durante combate reinicia esa misión.'):`${result.message}. Puedes seguir jugando sin guardado.`;
    return result.ok;
  }
  function updateSide(){
    const summary=campaignSummary(campaignState),node=currentNode(campaignState);
    $('loyalty').textContent=campaignState.faction;$('missions').textContent=summary.missionCount;
    $('kills').textContent=summary.kills+(flight?.status==='active'?flight.kills:0);
    $('state').textContent=node.kind==='ending'?'Final alcanzado':node.kind==='mission'?(isPaused()?'Misión en pausa':'En misión'):campaignState.node==='intro'?'Introducción':'En curso';
    const active={UPEO:'UPEO',GR:'GR',NEUCOM:'NEU',OUROBOROS:'OURO'}[campaignState.faction];
    for(const id of ['UPEO','GR','NEU','OURO'])$('r'+id).classList.toggle('active',active===id);
    if($('mode'))$('mode').textContent=campaignState.simulatorMission?'SIMULADOR · Progreso independiente':campaignState.campaignId==='demo-v1'?'DEMO ANTERIOR · Compatible':'CAMPAÑA JAPONESA · 52 MISIONES';
    if($('collection'))$('collection').textContent=`${profile.missions.length}/52 misiones · ${profile.endings.length}/5 finales`;
    if($('career'))$('career').value=profile.missions.length;
    if($('chapter'))$('chapter').textContent=node.missionId?missions[node.missionId]?.name||'—':'—';
  }
  function choose(id){
    try{campaignState=chooseOption(campaignState,id);persist();render();}
    catch(error){$('saveStatus').textContent=error.message;}
  }
  function restart(){cleanup();campaignState=createCampaign({campaignId});persist();render();}
  function load(){
    const result=loadCampaign(storage);
    if(!result.ok||!result.state){$('saveStatus').textContent=result.message||'Todavía no hay una partida guardada.';return;}
    closeArchive();cleanup();campaignState=result.state;render();
    $('saveStatus').textContent=result.migrated?'Partida anterior recuperada: continúa su demo original. Nueva campaña inicia las 52 misiones.':currentNode(campaignState).kind==='mission'?'Partida cargada. La misión pendiente comienza de nuevo.':'Partida cargada.';
  }
  function sourceMarkup(node){
    const source=node.source;if(!source?.url)return '';
    return `<p class="source-note">Conversación original de esta adaptación · Basada en una transcripción comunitaria. <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Consultar capítulo original ↗</a></p>`;
  }
  function render(){
    cleanup();const node=currentNode(campaignState);updateSide();
    if(node.kind==='mission'){startMission(node.mission);return;}
    if(node.kind==='ending'){
      if(campaignState.campaignId==='jp52'&&!campaignState.simulatorMission){
        const id=campaignState.node.replace('ending-','');if(!profile.endings.includes(id)){profile.endings.push(id);saveProfile(storage,profile);}
      }
      $('main').innerHTML=`<div class="tag">FIN DE RUTA · ${escapeHtml(node.label)}</div><h2>${node.simulator?'Simulación completada':'Una de cinco posibilidades'}</h2><p>${escapeHtml(node.description)}</p>${sourceMarkup(node)}<div class="buttons"><button class="primary" id="anotherRoute">${node.simulator?'Volver a la campaña':'↻ Explorar otra ruta'}</button></div>`;
      $('anotherRoute').onclick=node.simulator?returnCampaign:restart;updateSide();return;
    }
    const dialogue=node.dialogue||[{speaker:node.speaker[0],text:node.speaker[1]}];
    const result=campaignState.results.at(-1);
    const resultMarkup=campaignState.node.endsWith('Report')&&result?`<div class="debrief">${result.completed??result.kills} objetivos principales · ${Math.round(result.integrity)}% integridad · ${Math.ceil(result.timeRemaining)}s restantes${Object.entries(result.objectives||{}).map(([id,count])=>` · ${escapeHtml(id)}: ${count}`).join('')}</div>`:'';
    $('main').innerHTML=`<div class="tag">${escapeHtml(node.tag)}</div><h2>${escapeHtml(node.title)}</h2><p>${escapeHtml(node.body)}</p>${resultMarkup}${dialogue.map(message=>`<div class="speaker"><div class="avatar">◈</div><div><b>${escapeHtml(message.speaker)}</b><p>${escapeHtml(message.text)}</p></div></div>`).join('')}${sourceMarkup(node)}<div class="buttons" id="actions"></div>`;
    for(const option of node.options){
      if(campaignState.simulatorMission&&option.next!==campaignState.simulatorMission+'Combat')continue;
      const button=document.createElement('button');button.className='choice'+(node.options.length===1?' primary':'');button.textContent='› '+option.text;
      button.disabled=!canChoose(campaignState,option);if(button.disabled)button.title='Los resultados de la misión no cumplen esta condición.';
      button.onclick=()=>choose(option.id);$('actions').appendChild(button);
    }
  }
  function updateTargets(){
    if(!$('targetActions')||!flight)return;
    const signature=flight.targets.map(target=>`${target.id}:${target.alive}:${target.hp}:${isTargetLocked(flight,target)}`).join('|');
    if(signature===targetSignature)return;targetSignature=signature;
    const focusedId=document.activeElement?.getAttribute?.('data-target-id');
    const buttons=[];
    $('targetActions').innerHTML='';
    for(const target of flight.targets.filter(target=>target.alive)){
      const button=document.createElement('button');button.className='target-action'+(target.group?' secondary':'');
      button.setAttribute?.('data-target-id',target.id);buttons.push({id:target.id,button});
      button.textContent=(target.group?'◇ ':'')+target.label+(target.hp>1?` · ${target.hp} impactos`:'');
      button.disabled=target.role==='civilian'||isTargetLocked(flight,target);
      button.onclick=()=>{
        if(!flight||isPaused()||flight.status!=='active')return;
        step();if(!flight||flight.status!=='active')return;
        if(target.role==='gate')flight.x=target.x;
        fireMissile(flight,target.x,target.y);$('combatHint').textContent=flight.feedback;step();
      };
      $('targetActions').appendChild(button);
    }
    if(focusedId){const next=buttons.find(item=>item.id===focusedId&&!item.button.disabled)||buttons.find(item=>!item.button.disabled);next?.button.focus?.();}
  }
  function startMission(id){
    cleanup();const mission=missionById(campaignState,id);
    $('main').innerHTML=`<div class="tag">${escapeHtml(mission.arc||'Simulador táctico de vuelo')} · ${escapeHtml(mission.place)}</div><h2>${escapeHtml(mission.title)}</h2><p class="fine">${escapeHtml(mission.goal)}</p><p class="fine">${escapeHtml(mission.rules?.hint||'Apunta y dispara sobre los blancos.')} ←/→ o A/D para virar. Puedes pausar y usar los botones de objetivos.</p><div class="hud"><span id="hudTarget">OBJETIVOS 0/${mission.total}</span><span id="hudLife">INTEGRIDAD 100%</span><span id="hudTime">TIEMPO ${mission.time}s</span></div>${mission.secondary?`<p class="secondary-goal" id="secondaryProgress">◇ ${escapeHtml(mission.secondary.label)}: 0/${mission.secondary.count} · Opcional: cambia la ruta</p>`:''}<canvas id="radar" width="720" height="420" aria-label="Radar táctico jugable"></canvas><div class="controls"><button id="left">◀ VIRAR</button><button id="pause">Pausar</button><button id="right">VIRAR ▶</button></div><p class="fine" id="combatHint">${escapeHtml(mission.rules?.label||'Radar táctico')} · Recarga 0,45 s · Alcance 500</p><details class="target-list"><summary>Objetivos accesibles · teclado o toque</summary><div class="buttons" id="targetActions"></div></details><div class="buttons"><button id="retry">Reiniciar misión</button></div>${sourceMarkup(mission)}`;
    flight=createFlight(id,mission,now());const currentFlight=flight,canvas=$('radar');
    canvas.onpointerdown=event=>{
      if(flight!==currentFlight||isPaused())return;step();if(flight!==currentFlight||flight.status!=='active')return;
      const rect=canvas.getBoundingClientRect();fireMissile(flight,(event.clientX-rect.left)*720/rect.width,(event.clientY-rect.top)*420/rect.height);
      $('combatHint').textContent=flight.feedback;step();
    };
    for(const [id,key] of [['left','keyL'],['right','keyR']]){
      const button=$(id);
      button.onpointerdown=event=>{if(flight!==currentFlight||flight.status!=='active'||isPaused())return;event.preventDefault();flight[key]=true;button.setPointerCapture(event.pointerId);};
      button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>{if(flight===currentFlight)flight[key]=false;};
    }
    $('pause').onclick=()=>{
      if(!flight||flight.status!=='active')return;
      if(!manualPause)step();manualPause=!manualPause;clearKeys();if(flight)flight.last=now();
      $('pause').textContent=manualPause?'Reanudar':'Pausar';updateSide();
    };
    $('retry').onclick=()=>{if(flight===currentFlight&&flight.status!=='victory')startMission(id);};
    ticker=repeat(step,33);draw(flight,canvas);updateTargets();updateSide();
  }
  function step(){
    const currentFlight=flight;if(!currentFlight||currentFlight.settled||isPaused())return;
    advanceFlight(currentFlight,now(),keys);
    $('hudTarget').textContent=`OBJETIVOS ${currentFlight.completed}/${currentFlight.m.total}`;
    $('hudLife').textContent=`INTEGRIDAD ${Math.round(currentFlight.hp)}%`;$('hudTime').textContent=`TIEMPO ${Math.ceil(currentFlight.t)}s`;
    if(currentFlight.m.secondary)$('secondaryProgress').textContent=`◇ ${currentFlight.m.secondary.label}: ${currentFlight.objectives[currentFlight.m.secondary.id]}/${currentFlight.m.secondary.count} · Opcional: cambia la ruta`;
    draw(currentFlight,$('radar'));updateTargets();
    if(currentFlight.status!=='active'){
      currentFlight.settled=true;stopRepeat(ticker);ticker=null;
      campaignState=resolveMission(campaignState,{status:currentFlight.status,kills:currentFlight.kills,integrity:currentFlight.hp,timeRemaining:currentFlight.t,
        ...(campaignState.campaignId==='jp52'?{completed:currentFlight.completed,objectives:currentFlight.objectives}:{})});
      if(currentFlight.status==='victory'&&campaignState.campaignId==='jp52'&&!profile.missions.includes(currentFlight.id)){profile.missions.push(currentFlight.id);saveProfile(storage,profile);}
      persist();clearKeys();
      if(currentFlight.status==='victory'){
        $('retry').disabled=true;transition=delay(()=>{if(flight===currentFlight)render();},650);
      }else $('combatHint').textContent='MISIÓN FALLIDA. '+currentFlight.feedback+' Reinicia para continuar.';
    }
    updateSide();
  }
  function openArchive(){
    if(!isPaused())step();archiveOpen=true;clearKeys();
    if($('archivePanel')){$('archivePanel').hidden=false;renderArchive();}updateSide();
  }
  function closeArchive(){archiveOpen=false;if($('archivePanel'))$('archivePanel').hidden=true;if(flight)flight.last=now();updateSide();}
  function renderArchive(){
    if(!$('archiveList'))return;
    const search=($('missionSearch')?.value||'').toLocaleLowerCase();
    $('archiveList').innerHTML='';
    for(const mission of Object.values(missions)){
      if(!`${mission.number} ${mission.name} ${mission.place} ${mission.arc}`.toLocaleLowerCase().includes(search))continue;
      const card=document.createElement('article');card.className='mission-card';
      card.innerHTML=`<div class="tag">${mission.number}/52 · ${escapeHtml(mission.arc)}</div><h3>${escapeHtml(mission.name)} ${profile.missions.includes(mission.id)?'✓':''}</h3><p>${escapeHtml(mission.place)} · ${escapeHtml(mission.rules.label)}</p><p class="fine">${escapeHtml(mission.goal)}</p><button id="simulate-${mission.id}">Probar misión ${mission.number}</button> <a href="${escapeHtml(mission.source.url)}" target="_blank" rel="noopener noreferrer">Fuente ↗</a>`;
      $('archiveList').appendChild(card);$('simulate-'+mission.id).onclick=()=>simulate(mission.id);
    }
  }
  function simulate(id){
    const next=createCampaign({simulatorMission:id});closeArchive();cleanup();campaignState=next;persist();render();
  }
  function returnCampaign(){
    closeArchive();cleanup();const saved=loadCampaign(storage);campaignState=saved.ok&&saved.state?saved.state:createCampaign({campaignId});render();
  }
  $('reset').onclick=restart;$('save').onclick=persist;$('load').onclick=load;
  if($('archive'))$('archive').onclick=openArchive;
  if($('closeArchive'))$('closeArchive').onclick=closeArchive;
  if($('missionSearch'))$('missionSearch').oninput=renderArchive;
  if($('returnCampaign'))$('returnCampaign').onclick=returnCampaign;
  if($('continueSimulation'))$('continueSimulation').onclick=()=>{const result=loadCampaign(storage,{simulator:true});if(result.ok&&result.state){closeArchive();cleanup();campaignState=result.state;render();}else $('saveStatus').textContent=result.message||'No hay una simulación guardada.';};
  document.addEventListener('keydown',event=>{if(!flight||flight.status!=='active'||isPaused())return;if(['ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();keys[event.code]=true;});
  document.addEventListener('keyup',event=>{delete keys[event.code];});window.addEventListener('blur',clearKeys);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!hidden&&!manualPause&&!archiveOpen)step();hidden=Boolean(document.hidden);clearKeys();if(flight)flight.last=now();updateSide();});
  const initialSave=loadCampaign(storage);savedAvailable=Boolean(initialSave.ok&&initialSave.state);$('load').disabled=!savedAvailable;
  $('saveStatus').textContent=!initialSave.ok?initialSave.message:savedAvailable?'Hay una partida guardada. Pulsa Continuar guardada.':'Autoguardado local · Campaña y simulador usan ranuras diferentes.';
  render();return {getState:()=>structuredClone(campaignState),choose,restart,load,simulate,returnCampaign,openArchive,closeArchive};
}
if(typeof document!=='undefined')createApp({document,window,storage:{getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)}});
