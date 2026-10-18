import { writeFileSync } from 'node:fs';
import { missions } from '../src/missions.js';
import { characters } from '../src/characters.js';
import { createFlight,damageTarget } from '../src/combat.js';
import { advanceWaves } from '../src/waves.js';
import { syncRadio } from '../src/radio.js';
const spoken=lines=>lines.filter(line=>line.kind!=='narration').length;
const map='https://acecombat.fandom.com/wiki/Ace_Combat_3:_Electrosphere/Missions_(Japan)';
let text='# Revisión de las 52 misiones · v0.8\n\nRevisado el 18 de octubre de 2026: contexto, briefing, acontecimientos de combate y consecuencias en las páginas individuales de la transcripción. No es una traducción íntegra ni una certificación frase por frase. La radio está redactada en español propio; sus tiempos se condensan para el minijuego.\n\nEl índice avisa que parte de la radio se transcribió de oído y que los mensajes coloreados son avisos de pantalla, no parlamentos: [criterio de la fuente](https://w.atwiki.jp/acacac/pages/4.html). Se distinguen comunicaciones documentadas de avisos operativos originales mediante confidence/adaptation.\n\nContraste complementario: [mapa comunitario de rutas]('+map+') y [perfiles oficiales UPEO](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page03.html), [mandos](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page04.html), [GR y Neucom](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page05.html). El mapa complementa lugares y rutas; no sustituye las transcripciones para atribuir una frase. En Pursuit la transcripción nombra St. Ark y el mapa la sitúa dentro de Geofront.\n\nRecuento: 8–20 intervenciones por misión, sumando escena previa, radio efectivamente activada y cierre. Se excluyen narraciones y acotaciones. Los límites siguientes exploran 50 semillas, secundarios realizados/omitidos y avisos de daño activados/omitidos; no se agregan derrotas y victorias como si fueran un mismo recorrido. Los intentos fallidos no reciben un cierre de victoria. No hay un cupo fijo de seis réplicas por escena.\n\n';
const audit=[];
for(const m of Object.values(missions)){
  const counts=[];let radioCharacters=new Set(),fixed;
  for(let seed=0;seed<50;seed++)for(const optional of [false,true])for(const warned of [false,true]){
    const f=createFlight(m.id,m,0,undefined,{mode:'bullethell',attempt:{seed,difficulty:'normal',generator:1}});fixed=f.m.encounter.fixed;
    if(warned){f.hp=24;syncRadio(f);}
    if(optional)for(const t of f.targets.filter(t=>t.group))damageTarget(f,t,t.hp);
    while(f.status==='active'){
      const targets=f.targets.filter(t=>t.required&&t.alive&&t.active!==false);
      if(!targets.length)throw new Error(m.id+': fase vacía');
      for(const t of targets)damageTarget(f,t,t.hp);
      advanceWaves(f,1);syncRadio(f);
    }
    for(const event of f.radio)radioCharacters.add(event.message.character);
    counts.push(spoken(m.dialogue)+spoken(m.reportDialogue)+f.radio.length);
  }
  const min=Math.min(...counts),max=Math.max(...counts);
  if(min<8||max>20)throw new Error(`${m.id}: ${min}–${max}`);
  const cast=[...new Set([...m.dialogue,...m.reportDialogue].filter(line=>line.character).map(line=>line.character).concat([...radioCharacters]))].map(id=>characters[id].name);
  audit.push({id:m.id,min,max});
  text+=`## ${m.number}. ${m.name}\n\n- Lugar: ${m.place}. Interlocutores de esta adaptación: ${cast.join(', ')}.\n- Situación: ${m.research.situation}\n- Condición documentada: ${m.research.condition}\n- Consecuencias: ${m.research.consequence}\n- Recuento de victoria: **${min}–${max}**; ${spoken(m.dialogue)} antes y ${spoken(m.reportDialogue)} al cierre, más radio activada.\n- Minijuego: ${m.rules.label}. ${fixed?'Cantidad y secuencia especial fijadas.':'Encuentros variables dentro de los límites del generador.'} Radar 2D, tiempos, patrones, blindaje y distribución son adaptación; no representan las cantidades completas del original.\n- Referencia individual: [transcripción ${m.number}](${m.source.url}); confianza comunitaria, adaptación propia.\n\n`;
}
text+='## Diferencias que siguen siendo adaptaciones\n\nLas fases rápidas/lentas del original no se reproducen con sus minutos exactos. Los refuerzos de Awakening se condensan en dos fases fijas. El entrenamiento de Enter Dision se presenta en la escena y el minijuego representa la emergencia. Ghosts of the Past y Target Acquisition resumen seguimiento/reconocimiento con sensores. La instalación de Ghosts of the Past se registra en vez de reproducir su destrucción. La guía de misiles sigue siendo probabilística en Partners, donde el original exige cañón contra la central. Geofront Attack resume los diez detonadores mediante un corredor y dos soportes. Pursuit representa la persecución con navegación por pasos. Los jefes usan capas y compuertas propias; en Sole Survivor los enlaces representan interferencia, no destrucción literal de generadores. Los secundarios que abren rutas mantienen los umbrales del prototipo, sin importar sus cantidades a los encuentros aleatorios.\n\nEl regreso de Cynthia al final de Sole Survivor es una comunicación digital documentada, no una afirmación de supervivencia física. Rena aparece en la costa al final de A Canopy of Stars; su mensaje no se presenta como si estuviera pilotando en formación.\n';
writeFileSync('docs/MISSION_REVIEW.md',text);
console.log(`52 fichas; límites observados ${Math.min(...audit.map(a=>a.min))}–${Math.max(...audit.map(a=>a.max))}.`);
