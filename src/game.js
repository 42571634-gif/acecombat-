import { missions } from './missions.js?v=0.8.1';
import { createCampaign,currentNode,chooseOption,resolveMission,campaignSummary,canChoose,validateGraph,missionById,beginAttempt,retryMission } from './engine.js?v=0.8.1';
import { saveCampaign,loadCampaign,loadProfile,saveProfile } from './storage.js?v=0.8.1';
import { createFlight,advanceFlight,fireMissile,isTargetLocked,useBomb,DIFFICULTIES } from './combat.js?v=0.8.1';
import { draw } from './draw.js?v=0.8.1';
import { messageMarkup,bindPortraits } from './dialogue-view.js?v=0.8.1';
import { ENEMY_TYPES } from './enemy-types.js?v=0.8.1';
import { isActiveTarget } from './waves.js?v=0.8.1';
import { missileHitChance,coreOpen } from './operations.js?v=0.8.1';
import { toggleAutoFire } from './bullet-hell.js?v=0.8.1';
import { newAttempt,generateEncounter } from './attempts.js?v=0.8.1';
import { createMissionLog } from './mission-log.js?v=0.8.1';
import { communicationCategory,filterCommunications } from './communications.js?v=0.8.1';

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function createApp({document,window,storage,campaignId='jp52',battleMode='bullethell',attemptFactory=newAttempt,now=()=>performance.now(),repeat=setInterval,stopRepeat=clearInterval,delay=setTimeout,stopDelay=clearTimeout,requestFrame=window.requestAnimationFrame?.bind(window),cancelFrame=window.cancelAnimationFrame?.bind(window)}){
  const errors=validateGraph();if(errors.length)throw new Error(errors.join('\n'));
  const $=id=>document.getElementById(id);
  let campaignState=createCampaign({campaignId}),flight=null,ticker=null,transition=null,savedAvailable=false;
  let hidden=Boolean(document.hidden),manualPause=false,archiveOpen=false,logOpen=false,radioCount=0,sideSignature='',logView=0;
  let radioDatabase;try{radioDatabase=window.indexedDB;}catch{}
  const logs=createMissionLog(radioDatabase);
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
  const isPaused=()=>hidden||manualPause||archiveOpen||logOpen;
  function clearKeys(){for(const key of Object.keys(keys))delete keys[key];if(flight){flight.keyL=false;flight.keyR=false;flight.keyU=false;flight.keyD=false;flight.drag=null;}}
  function cleanup(){
    stopTicker();if(transition!==null)stopDelay(transition);
    transition=null;flight=null;manualPause=false;logOpen=false;logView++;radioCount=0;sideSignature='';targetButtons.clear();clearKeys();if($('difficulty'))$('difficulty').disabled=false;
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
    $('saveStatus').textContent=result.migrated?(campaignState.campaignId==='demo-v1'?'Demo anterior recuperada con sus decisiones y resultados.':'Partida actualizada conservando decisiones y resultados.'):currentNode(campaignState).kind==='mission'?'Partida cargada. La misión pendiente comienza de nuevo.':'Partida cargada.';
  }
  function sourceMarkup(node){
    const source=node.source;if(!source?.url)return '';
    return `<p class="source-note">Texto adaptado en español. <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Fuente de esta misión ↗</a></p>`;
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
    let dialogue=node.dialogue||[{speaker:node.speaker[0],text:node.speaker[1]}];
    if(node.missionId==='m51'&&campaignState.node.endsWith('Intro')&&!campaignState.results.some(result=>result.mission==='m49'&&result.status==='victory'))dialogue=[...dialogue.slice(0,1),{kind:'narration',label:'Tras la caída del Sphyrna',text:'Cynthia no ha salido del portaaviones. Fiona no recibió una respuesta de su hermana antes de que la plataforma cayera.',adaptation:true},...dialogue.slice(1)];
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
    if(radioCount!==flight.radio.length){
      radioCount=flight.radio.length;
      const conversation=filterCommunications(flight.radio).slice(-2);
      $('radioMessages').innerHTML=conversation.length?conversation.map(event=>`<p class="fine">${Math.floor(event.time)}s · ${escapeHtml(event.channel==='enemy'?'Enemigo':communicationCategory(event)==='command'?'Mando':'Aliado')}</p>${messageMarkup({...event.message,category:communicationCategory(event)})}`).join(''):'<p class="fine">Sin nuevas comunicaciones de personajes o mando.</p>';
      const alerts=filterCommunications(flight.radio,'system').filter(event=>!event.id.startsWith('phase-system-')).slice(-2);
      setText('radioSystemStatus',alerts.map(event=>event.message.text).join(' · '));
      bindPortraits($('radioMessages'));saveRadio(flight);
    }
  }
  function radioRecord(owner){return {formatVersion:2,mission:owner.id,name:owner.m.name||owner.m.title,mode:owner.logMode,result:owner.status,startedAt:owner.startedAt,duration:owner.elapsed,attempt:owner.attempt,participants:[...new Set(filterCommunications(owner.radio).map(event=>event.message.speaker))],messages:structuredClone(owner.radio)};}
  function saveRadio(owner){
    logs.save(radioRecord(owner)).then(saved=>{if(flight===owner&&$('logStatus'))$('logStatus').textContent=saved?'Registro guardado en este dispositivo.':'Registro disponible en esta sesión; no se pudo guardar en el dispositivo.';});
  }
  async function showLog(id=flight?.id){
    const returnFocus=document.activeElement;
    if(!isPaused())step();logOpen=true;clearKeys();const view=++logView;
    let panel=$('missionLogPanel');if(!panel){const wrapper=document.createElement('div');wrapper.innerHTML='<section id="missionLogPanel" class="mission-log-panel" role="dialog" aria-modal="true" aria-label="Registro de misión"></section>';$('main').appendChild(wrapper);panel=$('missionLogPanel');}
    panel.hidden=false;panel.innerHTML='<h3>Registro de misión</h3><p>Cargando mensajes…</p><button id="closeMissionLog">Cerrar registro</button>';
    const close=()=>{logView++;logOpen=false;panel.hidden=true;if(flight)flight.last=now();returnFocus?.focus?.();updateSide();};
    $('closeMissionLog').onclick=close;$('closeMissionLog').focus?.();
    const records=await logs.list(id);
    if(view!==logView)return;
    if(flight?.id===id){const live=radioRecord(flight);records.unshift({...live,key:'current'});}
    let selected='conversations';const expanded=new Set(records.filter(record=>record.key==='current').map(record=>record.key));
    const refresh=()=>{
      panel.innerHTML=`<h3>Registro de misión</h3><p class="fine">${logs.persistent?'Historial local del dispositivo.':'Almacenamiento no disponible: solo se conserva esta sesión.'}</p><div class="log-filters" role="group" aria-label="Filtrar registro"><button id="filterConversations" aria-pressed="${selected==='conversations'}">Conversaciones</button><button id="filterSystem" aria-pressed="${selected==='system'}">Sistema</button><button id="filterAll" aria-pressed="${selected==='all'}">Todo</button></div>${records.length?records.map((record,index)=>{
        const messages=filterCommunications(record.messages,selected);
        return `<details id="logRecord-${index}" ${expanded.has(record.key)?'open':''}><summary>${escapeHtml(record.name)} · ${record.mode==='simulator'?'Simulador':'Campaña'} · ${record.key==='current'?'Actual':record.key.endsWith('victory')?'Última victoria':'Último intento'} · ${escapeHtml({active:'En curso',victory:'Victoria',defeat:'Derrota'}[record.result]||record.result)} · ${Math.floor(record.duration)}s</summary><p class="fine">${escapeHtml(record.participants.join(', '))}</p>${messages.length?messages.map(event=>`<p class="fine">${Math.floor(event.time)}s · ${escapeHtml(communicationCategory(event)==='system'?'Sistema':event.channel==='enemy'?'Enemigo':communicationCategory(event)==='command'?'Mando':'Aliado')}</p>${messageMarkup({...event.message,category:communicationCategory(event)})}${communicationCategory(event)==='system'?'':`<p class="fine">${event.confidence==='operational-adaptation'?'Comunicación recreada para la adaptación':'Adaptación de la comunicación documentada'}${event.source?.url?` · <a href="${escapeHtml(event.source.url)}" target="_blank" rel="noopener noreferrer">Fuente ↗</a>`:''}</p>`}`).join(''):'<p class="fine">No hay mensajes de esta categoría en este intento.</p>'}</details>`;
      }).join(''):'<p>Aún no hay mensajes registrados para esta misión.</p>'}<button id="closeMissionLog">Cerrar registro</button>`;
      for(const [button,filter] of [['filterConversations','conversations'],['filterSystem','system'],['filterAll','all']])$(button).onclick=()=>{for(const [index,record] of records.entries())if($('logRecord-'+index)?.open)expanded.add(record.key);else expanded.delete(record.key);selected=filter;refresh();$(button).focus?.();};
      $('closeMissionLog').onclick=close;bindPortraits(panel);
    };
    refresh();$('closeMissionLog').focus?.();updateSide();
  }
  function nudge(key){
    if(flight?.mode!=='bullethell'||flight.status!=='active'||isPaused())return;
    const [dx,dy]={keyL:[-4,0],keyR:[4,0],keyU:[0,-4],keyD:[0,4]}[key];
    flight.x=Math.max(15,Math.min(705,flight.x+dx));flight.y=Math.max(285,Math.min(403,flight.y+dy));draw(flight,$('radar'));
  }
  function startMission(id){
    cleanup();const base=missionById(campaignState,id);
    const procedural=battleMode==='bullethell'&&campaignState.campaignId==='jp52';
    if(procedural&&!campaignState.pendingAttempt){campaignState=beginAttempt(campaignState,attemptFactory(difficulty));persist();}
    const attempt=procedural?campaignState.pendingAttempt:null;
    if(attempt){difficulty=attempt.difficulty;if($('difficulty'))$('difficulty').value=difficulty;}
    const mission=attempt?generateEncounter(base,attempt):base;
    $('main').innerHTML=`<div class="tag">${escapeHtml(mission.arc||'Simulador táctico de vuelo')} · ${escapeHtml(mission.place)}</div><h2>${escapeHtml(mission.title)}</h2><p class="fine">${escapeHtml(mission.goal)}</p><p class="fine">${escapeHtml(mission.rules?.hint||'Apunta y dispara sobre los blancos.')} Disparo automático en bullet hell. Flechas/WASD para moverte; Shift reduce la velocidad; X activa una contramedida. En celular, arrastra dentro del campo o usa los botones. Toca blancos o usa la lista para misiles y sensores. Puedes pausar.</p><div class="hud"><span id="hudTarget">OBJETIVOS 0/${mission.total}</span><span id="hudLife">INTEGRIDAD 100%</span><span id="hudTime">TIEMPO ${mission.time}s</span></div>${mission.secondary?`<p class="secondary-goal" id="secondaryProgress">◇ ${escapeHtml(mission.secondary.label)}: 0/${mission.secondary.count} · Opcional: cambia la ruta</p>`:''}<canvas id="radar" width="720" height="420" aria-label="Radar táctico jugable"></canvas><div class="controls"><button id="left">◀ VIRAR</button><button id="pause">Pausar</button><button id="right">VIRAR ▶</button></div><p class="fine" id="combatHint">${escapeHtml(mission.rules?.label||'Radar táctico')} · Misil 0,45 s · Alcance 500 · 3 contramedidas por intento</p><details class="target-list"><summary>Objetivos accesibles · teclado o toque</summary><div class="buttons" id="targetActions"></div></details><div class="buttons"><button id="retry">Reiniciar misión</button></div>${sourceMarkup(mission)}`;
    flight=createFlight(id,base,now(),undefined,{mode:battleMode,difficulty,attempt});const currentFlight=flight,canvas=$('radar');
    flight.startedAt=Date.now();flight.logMode=campaignState.simulatorMission?'simulator':'campaign';
    const logControls=document.createElement('div');logControls.innerHTML='<button id="viewMissionLog">Registro de misión</button><p class="fine" id="logStatus"></p><div id="resultSummary" hidden></div>';$('main').appendChild(logControls);
    $('viewMissionLog').onclick=()=>showLog(id);
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
      radio.innerHTML='<p class="phase-status" id="waveStatus"></p><div class="enemy-key" aria-label="Tipos de enemigo"><span>▲ Dardo · ágil / dirigido</span><span>◀▶ Manta · blindado / cortina</span><span>⬡ Lince · dron / anillos</span></div><section class="battle-radio" aria-label="Radio de combate"><h3>Radio de combate</h3><div id="radioMessages" role="log" aria-live="polite" aria-relevant="additions"></div><p id="radioSystemStatus" class="system-message" role="status" aria-live="polite"></p></section>';
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
    $('retry').onclick=()=>{
      if(flight!==currentFlight)return;
      if(flight.status==='victory'&&campaignState.campaignId==='jp52')campaignState=retryMission(campaignState);
      if(campaignState.pendingAttempt)campaignState=beginAttempt(campaignState,attemptFactory(difficulty));
      startMission(id);
    };
    if(requestFrame){const frame=()=>{if(flight!==currentFlight)return;ticker=null;step();if(flight===currentFlight&&(!currentFlight.settled||currentFlight.presentation))ticker=requestFrame(frame);};ticker=requestFrame(frame);}
    else ticker=repeat(step,16);
    draw(flight,canvas);updateTargets();updateBattleRadio();updateSide();
  }
  function step(){
    const currentFlight=flight;if(!currentFlight||isPaused())return;
    if(currentFlight.presentation){
      const presentation=currentFlight.presentation;presentation.elapsed+=Math.max(0,(now()-currentFlight.last)/1000);currentFlight.last=now();
      if(presentation.elapsed>=presentation.duration){finishPresentation(currentFlight);return;}
      draw(currentFlight,$('radar'));return;
    }
    if(currentFlight.settled)return;
    advanceFlight(currentFlight,now(),keys);
    setText('hudTarget',`OBJETIVOS ${currentFlight.completed}/${currentFlight.m.total}`);
    setText('hudLife',`INTEGRIDAD ${Math.round(currentFlight.hp)}%`);setText('hudTime',`TIEMPO ${Math.ceil(currentFlight.t)}s`);
    if(currentFlight.m.secondary)setText('secondaryProgress',`◇ ${currentFlight.m.secondary.label}: ${currentFlight.objectives[currentFlight.m.secondary.id]}/${currentFlight.m.secondary.count} · Opcional: cambia la ruta`);
    draw(currentFlight,$('radar'));updateTargets();updateBattleRadio();
    if(currentFlight.feedback)setText('combatHint',currentFlight.feedback);
    if($('bomb')){$('bomb').textContent=`Contramedida (${currentFlight.bombs})`;$('bomb').disabled=currentFlight.bombs<=0||currentFlight.status!=='active';}
    if(currentFlight.status!=='active'){
      currentFlight.settled=true;
      for(const id of ['pause','left','right','up','down','cover','gun'])if($(id))$(id).disabled=true;
      if($('difficulty'))$('difficulty').disabled=false;
      campaignState=resolveMission(campaignState,{status:currentFlight.status,kills:currentFlight.kills,integrity:Math.min(currentFlight.hp,currentFlight.protected?.hp??100),timeRemaining:currentFlight.t,
        ...(campaignState.campaignId==='jp52'?{completed:currentFlight.completed,objectives:currentFlight.objectives,...(currentFlight.attempt?{attempt:currentFlight.attempt}:{})}:{})});
      if(currentFlight.status==='victory'&&campaignState.campaignId==='jp52'&&!profile.missions.includes(currentFlight.id)){profile.missions.push(currentFlight.id);saveProfile(storage,profile);}
      persist();clearKeys();saveRadio(currentFlight);
      if(campaignState.campaignId==='jp52'){
        currentFlight.presentation={elapsed:0,duration:currentFlight.status==='victory'?1.8:2};currentFlight.last=now();
        $('retry').disabled=true;
        $('resultSummary').hidden=false;$('resultSummary').innerHTML='<button id="skipOutcome">Omitir animación</button>';
        $('skipOutcome').onclick=()=>finishPresentation(currentFlight);
        if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)finishPresentation(currentFlight);
      }else if(currentFlight.status==='victory'){
        stopTicker();
        $('retry').disabled=true;transition=delay(()=>{if(flight===currentFlight)render();},650);
      }else {stopTicker();$('combatHint').textContent='MISIÓN FALLIDA. '+currentFlight.feedback+' Reinicia para continuar.';}
    }
    updateSide();
  }
  function finishPresentation(owner){
    if(flight!==owner||!owner.presentation)return;
    owner.finalPresentation={...owner.presentation,elapsed:owner.presentation.duration};owner.presentation=null;stopTicker();$('retry').disabled=false;
    const victory=owner.status==='victory';
    $('resultSummary').hidden=false;$('resultSummary').innerHTML=`<h3>${victory?'Misión completada':'Misión fallida'}</h3><p>${owner.completed}/${owner.m.total} objetivos · ${Math.round(Math.min(owner.hp,owner.protected?.hp??100))}% integridad · ${Math.ceil(owner.t)}s restantes</p><p>${escapeHtml(owner.feedback)}</p>${victory?'<button id="continueOutcome" class="primary">Continuar al informe</button>':''}`;
    if(victory)$('continueOutcome').onclick=()=>{if(flight===owner)render();};
    setText('combatHint',victory?'Operación completada. Consulta el registro o continúa al informe.':'MISIÓN FALLIDA. '+owner.feedback+' Puedes consultar el registro y reintentar.');
    draw(owner,$('radar'));updateSide();
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
      const logButton=document.createElement('button');logButton.textContent='Ver registros';logButton.onclick=()=>showLog(mission.id);card.appendChild(logButton);
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
    if(logOpen){if(event.code==='Escape'){$('closeMissionLog')?.onclick?.();event.preventDefault();}else if(event.code==='Tab'){const focusable=$('missionLogPanel')?.querySelectorAll?.('button, a, summary');if(focusable?.length){const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){last.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===last){first.focus();event.preventDefault();}}}return;}
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
