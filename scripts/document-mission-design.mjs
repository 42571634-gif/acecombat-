import { writeFileSync } from 'node:fs';
import { missions } from '../src/missions.js';
import { createFlight } from '../src/combat.js';
const rows=Object.values(missions).map(m=>{
  const f=createFlight(m.id,m,0,undefined,{mode:'bullethell'});
  const domains=[...new Set(f.targets.filter(t=>t.required).map(t=>t.domain))].map(d=>({air:'aéreo',ground:'terrestre',sea:'naval',cargo:'carga',structure:'estructura'}[d]||d)).join(', ');
  const system=m.type==='boss'?f.waves.map(w=>w.label).join(' → '):f.protected?f.protected.label+' · '+(f.protected.mobile?'sigue a Nemo':'posición fija')+' · cobertura':m.type==='recon'?'sensores; sin bajas':m.type==='containment'?'pulsos ANB':m.type==='tunnel'?'alineación de pasos y soportes':m.type==='orbital'?'desactivar satélites':'pasadas de blancos supervivientes';
  return '| '+String(m.number).padStart(2,'0')+' · '+m.name+' | '+domains+' | '+system+' | '+m.goal+' | [Fuente]('+m.source.url+') |';
});
writeFileSync('docs/MISSION_DESIGN.md','# Diseño de operaciones v0.6\n\nTodas las mecánicas son adaptaciones originales. La fuente de cada capítulo sustenta su contexto; no certifica escudos, pasadas, porcentajes, partes ni tiempos de esta versión. Se conservan cantidades, secundarios, decisiones y finales. El escenario y los contactos avanzan; sensores y pasos mantienen sus reglas propias.\n\n| Misión | Blancos principales | Mecánica | Objetivo narrativo | Referencia |\n|---|---|---|---|---|\n'+rows.join('\n')+'\n');
