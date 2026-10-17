import { missions } from './missions.js?v=0.6.0';
import { createCampaign,currentNode,chooseOption,resolveMission,campaignSummary,canChoose,validateGraph,missionById } from './engine.js?v=0.6.0';
import { saveCampaign,loadCampaign,loadProfile,saveProfile } from './storage.js?v=0.6.0';
import { createFlight,advanceFlight,fireMissile,isTargetLocked,useBomb,DIFFICULTIES } from './combat.js?v=0.6.0';
import { draw } from './draw.js?v=0.6.0';
import { messageMarkup,bindPortraits } from './dialogue-view.js?v=0.6.0';
import { ENEMY_TYPES } from './enemy-types.js?v=0.6.0';
import { isActiveTarget } from './waves.js?v=0.6.0';
import { missileHitChance,coreOpen } from './operations.js?v=0.6.0';
import { toggleAutoFire } from './bullet-hell.js?v=0.6.0';

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function createApp({document,window,storage,campaignId='jp52',battleMode='bullethell',now=()=>performance.now(),repeat=setInterval,stopRepeat=clearInterval,delay=setTimeout,stopDelay=clearTimeout,requestFrame=window.requestAnimationFrame?.bind(window),cancelFrame=window.cancelAnimationFrame?.bind(window)}){
  const errors=validateGraph();if(errors.length)throw new Error(errors.join('\n'));
  const $=id=>document.getElementById(id);
  let campaignState=createCampaign({campaignId}),flight=null,ticker=null,transition=null,savedAvailable=false;
  let hidden=Boolean(document.hidden),manualPause=false,archiveOpen=false,radioCount=0,sideSignature='';
  const keys={},profile=loadProfile(storage),targetButtons=new Map();
  function setText(id,value){const element=$(id);if(element&&element.textContent!==value)element.textContent=value;}
  function stopTicker(){if(ticker!==null){if(requestFrame)cancelFrame?.(ticker);else stopRepeat(ticker);ticker=null;}}
  let difficulty='normal';
  try{const saved=storage.getItem('electrosphere.difficulty');if(Object.hasOwn(DIFFICULTIES,saved))difficulty=saved;}catch{}
  if($('difficulty')){
    $('difficulty').value=difficulty;
    $('difficulty').onchange=()=>{
      difficulty=Object.hasOwn(DIFFICULTIES,$('difficulty').value)?$('difficulty').value:'normal';
      try{storage.setItem('electrosphere.difficulty',difficulty);}catch{}
      if(flight?.status==='defeat')startMission(flight.id);
    };
  }
  const isPaused=()=>hidden||manualPause||archiveOpen;
  function clearKeys(){for(const key of Object.keys(keys))delete keys[key];if(flight){flight.keyL=false;flight.keyR=false;flight.keyU=false;flight.keyD=false;flight.drag=null;}}
  function cleanup(){
    stopTicker();if(transition!==null)stopDelay(transition);
    transition=null;flight=null;manualPause=false;radioCount=0;sideSignature='';targetButtons.clear();clearKeys();if($('difficulty'))$('difficulty').disabled=false;
  }
  function persist(){
    const result=saveCampaign(storage,campaignState);
    if(result.ok&&!campaignState.simulatorMission)savedAvailable=true;
    $('load').disabled=!savedAvailable;
    $('saveStatus').textContent=result.ok?(campaignState.simulatorMission?'Simulación guardada en su ranura independiente.':'Partida guardada. Cargar durante combate reinicia esa misión.'):`${result.message}. Puedes seguir jugando sin guardado.`;
    return result.ok;
  }
  function updateSide(){
    const signature=[campaignState.node,campaignState.faction,campaignState.results.length,flight?.kills,flight?.status,isPaused(),profile.missions.length,profile.endings.length].join('|');
    if(signature===sideSignature)return;sideSignature=signature;
    const summary=campaignSummary(campaignState),node=currentNode(campaignState);
    $('loyalty').textContent=campaignState.faction;$('missions').textContent=summary.missionCount;
    $('kills').textContent=summary.kills+(flight?.status==='active'?flight.kills:0);
    $('state').textContent=node.kind==='ending'?'Final alcanzado':node.kind==='mission'?(flight?.status==='defeat'?'Misión fallida':isPaused()?'Misión en pausa':'En misión'):campaignState.node==='intro'?'Introducción':'En curso';
    const active={UPEO:'UPEO',GR:'GR',NEUCOM:'NEU',OUROBOROS:'OURO'}[campaignState.faction];
    for(const id of ['UPEO','GR','NEU','OURO'])$('r'+id).classList.toggle('active',active===id);
    if($('mode'))$('mode').textContent=campaignState.simulatorMission?'SIMULADOR · Progreso independiente':campaignState.campaignId==='demo-v1'?'DEMO ANTERIOR · Compatible':'CAMPAÑA JAPONESA · 52 MISIONES';
    if($('collection'))$('collection').textContent=`${profile.missions.length}/52 misiones · ${profile.endings.length}/5 finales`;
    if($('career'))$('career').value=profile.missions.length;
    if($('chapter'))$('chapter').textContent=node.missionId?missions[node.missionId]?.name||'—':'—';
  }
  function choose(id){
    try{campaignState=chooseOption(campaignState,id);persist();render();$('main').scrollIntoView?.({block:'start'});}
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
    $('main').innerHTML=`<div class="tag">${escapeHtml(node.tag)}</div><h2>${escapeHtml(node.title)}</h2><p>${escapeHtml(node.body)}</p>${resultMarkup}${dialogue.map(messageMarkup).join('')}${sourceMarkup(node)}<div class="buttons" id="actions"></div>`;
    bindPortraits($('main'));
    for(const option of node.options){
      if(campaignState.simulatorMission&&option.next!==campaignState.simulatorMission+'Combat')continue;
      const button=document.createElement('button');button.className='choice'+(node.options.length===1?' primary':'');button.textContent='› '+option.text;
      button.disabled=!canChoose(campaignState,option);if(button.disabled)button.title='Los resultados de la misión no cumplen esta condición.';
      button.onclick=()=>choose(option.id);$('actions').appendChild(button);
    }
  }
  function updateTargets(){
    if(!$('targetActions')||!flight)return;
    for(const target of flight.targets){
      let button=targetButtons.get(target.id);
      if(!button&&isActiveTarget(target)){
        const owner=flight;button=document.createElement('button');button.className='target-action'+(target.group?' secondary':'');
        button.setAttribute?.('data-target-id',target.id);
        const attack=()=>{
          if(flight!==owner||isPaused()||flight.status!=='active')return;
          step();if(flight!==owner||flight.status!=='active'||!isActiveTarget(target)||isTargetLocked(flight,target))return;
          if(target.role==='gate')flight.x=target.x;
          fireMissile(flight,target.x,target.y);setText('combatHint',flight.feedback);step();
        };
        button.onpointerdown=event=>{if(event.button!==undefined&&event.button!==0)return;event.preventDefault();attack();};
        button.onclick=event=>{if(event?.detail>0)return;attack();};
        targetButtons.set(target.id,button);$('targetActions').appendChild(button);
      }
      if(!button)continue;
      const title=(target.group?'◇ ':'')+(target.enemyType?ENEMY_TYPES[target.enemyType].name+' · ':'')+target.label+(target.hp>1?` · Blindaje ${target.hp}`:'')+(flight.mode==='bullethell'?target.inView===false?' · Próxima pasada':!coreOpen(flight,target)?' · Compuerta cerrada':` · Acierto ${Math.round(missileHitChance(flight,target)*100)}%`:'');
      if(button.textContent!==title)button.textContent=title;
      button.hidden=!isActiveTarget(target);button.disabled=!isActiveTarget(target)||target.role==='civilian'||isTargetLocked(flight,target)||!coreOpen(flight,target);
    }
  }
  function updateBattleRadio(){
    if(!flight?.waves||!$('radioMessages'))return;
    setText('waveStatus',`FASE ${flight.waveIndex+1}/${flight.waves.length} · ${flight.waves[flight.waveIndex].label}${flight.waveTransition>0?' · En aproximación':''} · ${flight.cooldown>0?'Misil: '+Math.ceil(flight.cooldown*10)/10+' s':'Misil listo'}`);
    if(flight.protected)setText('escortStatus',`${flight.protected.label}: ${Math.ceil(flight.protected.hp)}% · Cobertura ${Math.floor(flight.coverEnergy)}% · ${flight.protected.mobile?'Te sigue':'Posición fija'}`);
    if($('cover')){$('cover').textContent=flight.coverEscort?'Desactivar cobertura':'Activar cobertura';$('cover').setAttribute?.('aria-pressed',String(flight.coverEscort));}
    if($('gun')){$('gun').textContent=flight.gunEnabled?'Cañón: automático':'Cañón: en espera';$('gun').setAttribute?.('aria-pressed',String(flight.gunEnabled));}
    while(radioCount<flight.waveEvents.length){
      const event=flight.waveEvents[radioCount++],entry=document.createElement('div');
      entry.innerHTML=messageMarkup(event.message);$('radioMessages').appendChild(entry);bindPortraits(entry);
    }
  }
  function nudge(key){
    if(flight?.mode!=='bullethell'||flight.status!=='active'||isPaused())return;
    const [dx,dy]={keyL:[-4,0],keyR:[4,0],keyU:[0,-4],keyD:[0,4]}[key];
    flight.x=Math.max(15,Math.min(705,flight.x+dx));flight.y=Math.max(285,Math.min(403,flight.y+dy));draw(flight,$('radar'));
  }
  function startMission(id){
    cleanup();const mission=missionById(campaignState,id);
    $('main').innerHTML=`<div class="tag">${escapeHtml(mission.arc||'Simulador táctico de vuelo')} · ${escapeHtml(mission.place)}</div><h2>${escapeHtml(mission.title)}</h2><p class="fine">${escapeHtml(mission.goal)}</p><p class="fine">${escapeHtml(mission.rules?.hint||'Apunta y dispara sobre los blancos.')} Disparo automático en bullet hell. Flechas/WASD para moverte; Shift reduce la velocidad; X activa una contramedida. En celular, arrastra dentro del campo o usa los botones. Toca blancos o usa la lista para misiles y sensores. Puedes pausar.</p><div class="hud"><span id="hudTarget">OBJETIVOS 0/${mission.total}</span><span id="hudLife">INTEGRIDAD 100%</span><span id="hudTime">TIEMPO ${mission.time}s</span></div>${mission.secondary?`<p class="secondary-goal" id="secondaryProgress">◇ ${escapeHtml(mission.secondary.label)}: 0/${mission.secondary.count} · Opcional: cambia la ruta</p>`:''}<canvas id="radar" width="720" height="420" aria-label="Radar táctico jugable"></canvas><div class="controls"><button id="left">◀ VIRAR</button><button id="pause">Pausar</button><button id="right">VIRAR ▶</button></div><p class="fine" id="combatHint">${escapeHtml(mission.rules?.label||'Radar táctico')} · Misil 0,45 s · Alcance 500 · 3 contramedidas por intento</p><details class="target-list"><summary>Objetivos accesibles · teclado o toque</summary><div class="buttons" id="targetActions"></div></details><div class="buttons"><button id="retry">Reiniciar misión</button></div>${sourceMarkup(mission)}`;
    flight=createFlight(id,mission,now(),undefined,{mode:battleMode,difficulty});const currentFlight=flight,canvas=$('radar');
    function bindDirection(id,key){
      const button=$(id);let pointer=null;
      button.onpointerdown=event=>{
        if(flight!==currentFlight||flight.status!=='active'||isPaused()||pointer!==null&&flight[key])return;
        event.preventDefault();step();if(flight!==currentFlight||flight.status!=='active')return;
        pointer=event.pointerId;flight[key]=true;button.setPointerCapture(event.pointerId);nudge(key);
      };
      const release=event=>{
        if(event?.pointerId!==undefined&&pointer!==event.pointerId)return;
        if(flight===currentFlight){if(!isPaused())step();if(flight===currentFlight)flight[key]=false;}pointer=null;
      };
      button.onpointerup=button.onpointercancel=button.onlostpointercapture=release;
      button.onclick=event=>{if(event?.detail===0&&flight===currentFlight){step();nudge(key);}};
    }
    if($('difficulty'))$('difficulty').disabled=true;
    if(battleMode==='bullethell'){
      $('combatHint').textContent=`${DIFFICULTIES[difficulty].label} · Disparo automático · Arrastra para esquivar · Toca un blanco para misil/sensor · Shift: precisión · X: contramedida`;
      const controls=document.createElement('div');controls.className='controls';
      controls.innerHTML='<button id="up">▲ SUBIR</button><button id="bomb">Contramedida (3)</button><button id="down">BAJAR ▼</button><button id="gun" aria-pressed="true">Cañón: automático</button>';
      $('main').insertBefore(controls,$('combatHint'));
      $('gun').onclick=()=>{if(flight!==currentFlight||isPaused())return;step();toggleAutoFire(flight);updateBattleRadio();};
      if(flight.protected){const escort=document.createElement('div');escort.innerHTML='<p class="phase-status" id="escortStatus" role="status"></p><button id="cover" aria-pressed="false">Activar cobertura</button>';$('main').insertBefore(escort,$('combatHint'));$('cover').onclick=()=>{if(flight!==currentFlight||isPaused())return;step();flight.coverEscort=!flight.coverEscort;updateBattleRadio();};}
      const radio=document.createElement('div');
      radio.innerHTML='<p class="phase-status" id="waveStatus"></p><div class="enemy-key" aria-label="Tipos de enemigo"><span>▲ Dardo · ágil / dirigido</span><span>◀▶ Manta · blindado / cortina</span><span>⬡ Lince · dron / anillos</span></div><section class="battle-radio" aria-label="Radio de combate"><h3>Radio de combate</h3><div id="radioMessages" role="log" aria-live="polite" aria-relevant="additions"></div></section>';
      $('main').insertBefore(radio,$('combatHint'));
      $('bomb').onclick=()=>{if(!isPaused()&&flight===currentFlight){step();if(useBomb(flight))$('combatHint').textContent=flight.feedback;step();}};
      for(const [button,key] of [['up','keyU'],['down','keyD']])bindDirection(button,key);
      canvas.onpointermove=event=>{
        if(flight!==currentFlight||!flight.drag||flight.drag.id!==event.pointerId||isPaused()||flight.status!=='active')return;
        step();if(flight.status!=='active')return;
        const rect=canvas.getBoundingClientRect();
        flight.x=Math.max(15,Math.min(705,flight.x+(event.clientX-flight.drag.x)*720/rect.width));
        flight.y=Math.max(285,Math.min(403,flight.y+(event.clientY-flight.drag.y)*420/rect.height));
        flight.drag={id:event.pointerId,x:event.clientX,y:event.clientY};draw(flight,canvas);
      };
      canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=()=>{if(flight===currentFlight)flight.drag=null;};
    }
    canvas.onpointerdown=event=>{
      if(flight!==currentFlight||isPaused())return;step();if(flight!==currentFlight||flight.status!=='active')return;
      const rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left)*720/rect.width,y=(event.clientY-rect.top)*420/rect.height;
      if(flight.mode!=='bullethell'||y<280)fireMissile(flight,x,y);
      if(flight.mode==='bullethell'){event.preventDefault();canvas.setPointerCapture(event.pointerId);flight.drag={id:event.pointerId,x:event.clientX,y:event.clientY};}
      $('combatHint').textContent=flight.feedback;step();
    };
    for(const [id,key] of [['left','keyL'],['right','keyR']])bindDirection(id,key);
    $('pause').onclick=()=>{
      if(!flight||flight.status!=='active')return;
      if(!manualPause)step();manualPause=!manualPause;clearKeys();if(flight)flight.last=now();
      $('pause').textContent=manualPause?'Reanudar':'Pausar';updateSide();
    };
    $('retry').onclick=()=>{if(flight===currentFlight&&flight.status!=='victory')startMission(id);};
    if(requestFrame){const frame=()=>{if(flight!==currentFlight)return;ticker=null;step();if(flight===currentFlight&&!currentFlight.settled)ticker=requestFrame(frame);};ticker=requestFrame(frame);}
    else ticker=repeat(step,16);
    draw(flight,canvas);updateTargets();updateBattleRadio();updateSide();
  }
  function step(){
    const currentFlight=flight;if(!currentFlight||currentFlight.settled||isPaused())return;
    advanceFlight(currentFlight,now(),keys);
    setText('hudTarget',`OBJETIVOS ${currentFlight.completed}/${currentFlight.m.total}`);
    setText('hudLife',`INTEGRIDAD ${Math.round(currentFlight.hp)}%`);setText('hudTime',`TIEMPO ${Math.ceil(currentFlight.t)}s`);
    if(currentFlight.m.secondary)setText('secondaryProgress',`◇ ${currentFlight.m.secondary.label}: ${currentFlight.objectives[currentFlight.m.secondary.id]}/${currentFlight.m.secondary.count} · Opcional: cambia la ruta`);
    draw(currentFlight,$('radar'));updateTargets();updateBattleRadio();
    if(currentFlight.feedback)setText('combatHint',currentFlight.feedback);
    if($('bomb')){$('bomb').textContent=`Contramedida (${currentFlight.bombs})`;$('bomb').disabled=currentFlight.bombs<=0||currentFlight.status!=='active';}
    if(currentFlight.status!=='active'){
      currentFlight.settled=true;stopTicker();
      for(const id of ['pause','left','right','up','down','cover','gun'])if($(id))$(id).disabled=true;
      if($('difficulty'))$('difficulty').disabled=false;
      campaignState=resolveMission(campaignState,{status:currentFlight.status,kills:currentFlight.kills,integrity:Math.min(currentFlight.hp,currentFlight.protected?.hp??100),timeRemaining:currentFlight.t,
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
  document.addEventListener('keydown',event=>{
    if(!flight||flight.status!=='active'||isPaused()||['INPUT','SELECT','TEXTAREA'].includes(event.target?.tagName))return;
    const direction={ArrowLeft:'keyL',KeyA:'keyL',ArrowRight:'keyR',KeyD:'keyR',ArrowUp:'keyU',KeyW:'keyU',ArrowDown:'keyD',KeyS:'keyD'}[event.code];
    if(direction){event.preventDefault();step();if(!keys[event.code])nudge(direction);}
    keys[event.code]=true;if(event.code==='KeyX'&&!event.repeat&&useBomb(flight))setText('combatHint',flight.feedback);
  });
  document.addEventListener('keyup',event=>{if(flight&&!isPaused())step();delete keys[event.code];});window.addEventListener('blur',clearKeys);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!hidden&&!manualPause&&!archiveOpen)step();hidden=Boolean(document.hidden);clearKeys();if(flight)flight.last=now();updateSide();});
  const initialSave=loadCampaign(storage);savedAvailable=Boolean(initialSave.ok&&initialSave.state);$('load').disabled=!savedAvailable;
  $('saveStatus').textContent=!initialSave.ok?initialSave.message:savedAvailable?'Hay una partida guardada. Pulsa Continuar guardada.':'Autoguardado local · Campaña y simulador usan ranuras diferentes.';
  render();return {getState:()=>structuredClone(campaignState),choose,restart,load,simulate,returnCampaign,openArchive,closeArchive};
}
if(typeof document!=='undefined')createApp({document,window,storage:{getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)}});
