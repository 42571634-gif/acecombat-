import { dialogueLine } from './characters.js?v=0.5.0';
// Agrupación jugable de los objetivos existentes. No añade bajas ni sucesos al canon.
const waves=(...stages)=>stages.map(([label,character,text])=>({label,message:dialogueLine([character,text]),adaptation:true}));
export const WAVE_PLANS={
  m01:waves(['Primera intercepción','fiona','Nemo, esos vienen primero. No dejes que Erich y yo acaparemos toda la bienvenida.'],['Contactos restantes','erich','Hay otro grupo entrando. Lo tengo. Esta vez no necesito volver a contarlo.']),
  m03:waves(['Contenedores cercanos','keith','Empieza por los que ya tenemos encima de la ciudad. Lo que caiga no va a esperar un segundo intento.'],['Segundo grupo','dision','Todavía quedan trayectorias en descenso. Nemo, mantén la precisión hasta la última.']),
  m09:waves(['Cobertura del transporte','erich','Lo tengo a mi lado. No voy a separarme del transporte por perseguir un contacto.'],['Cerrar la intercepción','fiona','Aquí seguimos. Despejadnos ese último grupo y luego podéis discutir quién ha volado mejor.']),
  m15:waves(['Sector oeste','erich','Hay civiles entre los contactos. Te sigo la aproximación, Nemo. Comprueba la identificación.'],['Sector este','park','La operación no ha terminado. Reduzcan las fuerzas que permanecen sobre la ciudad.']),
  m17:waves(['Defensas del Sphyrna','erich','Primero lo que lo protege. Quiero llegar a ese núcleo con los dos aviones todavía enteros.'],['Núcleo expuesto','erich','Ahí está. Ya no tenemos que imaginar la abertura. Nemo, entro contigo.']),
  m24:waves(['Primera intercepción','keith','Bombarderos arriba y yo aquí abajo. Si encuentras un segundo libre, me vendría estupendamente.'],['Bombarderos restantes','dision','Quedan contactos de gran altitud. Nemo, cierra la intercepción antes de regresar.']),
  m30:waves(['Defensas del portaaviones','keith','El Sphyrna no va a dejar que nos acerquemos por educación. Hay que abrirlo.'],['Sphyrna vulnerable','keith','Defensas fuera. Si vas a presionar al Night Raven, no te guardes la oportunidad para el informe.']),
  m32:waves(['Abrir la defensa','keith','No te enganches al primer blanco. Necesitamos una abertura para el Night Raven.'],['Night Raven','keith','Ahora sí podemos alcanzarlo. Mantente conmigo hasta que deje de responder.'],['Amenaza de Dision','dision','¿De verdad creías que todo lo que has aprendido terminaba derribando esa máquina?']),
  m33:waves(['Primeras señales','control','Geopelia en aproximación. Intercepte el primer grupo.'],['Segunda agrupación','archive','Continúan entrando señales. El segundo puesto de la formación sigue sin respuesta.'],['Últimos Geopelia','control','Quedan contactos sobre Port Edwards. Mantenga la intercepción.']),
  m37:waves(['Romper la defensa','keith','Voy a abrirte sitio. Procura que todo este ruido nos sirva para algo.'],['Night Raven','rena','No consigo apartarlo... Hay alguien donde no debería estar.'],['Sphyrna','control','Night Raven neutralizado. El Sphyrna conserva su núcleo operativo.']),
  m40:waves(['Aproximación del transbordador','cynthia','Quiero su trayectoria despejada. Entera. La tripulación no puede elegir otro cielo.'],['Última cobertura','fiona','Ya casi lo tienen. Un poco más, Nemo. No les hagamos aprender a aterrizar esquivando misiles.']),
  m47:waves(['Generadores Aeon','simon','Esos generadores. Ahí tienes la diferencia entre perseguirlo y poder alcanzarlo.'],['Night Raven','cynthia','Ya no se mueve igual. Nemo, esta oportunidad la aprovechamos nosotros.']),
  m48:waves(['Escolta de Ouroboros','fiona','Necesito pasar. Si mi hermana está ahí, quiero que todavía pueda oírme cuando me acerque.'],['Últimos interceptores','fiona','Siguen cerrando el camino. No me digas que espere, Nemo. Ayúdame a abrirlo.']),
  m50:waves(['Defensas del Sphyrna','fiona','Que me pongan todas sus defensas delante. Al menos sé por dónde tengo que empezar.'],['Núcleo del Sphyrna','fiona','Ahí. No voy a volver a mirar cómo se lleva otra ciudad por delante.']),
  m52:waves(['Generadores','simon','Alimentación primero. Quiero al Night Raven sin esa ventaja. Concéntrate.'],['Night Raven','fiona','Ahora es nuestro turno. Nemo, no dejes que vuelva a cerrarnos el cielo.'],['Aurora de Dision','fiona','Dision. Se acabó hacerme seguirte. Esta vez vas a quedarte hasta que termine.']),
};
export const isActiveTarget=target=>target.alive&&target.active!==false;
export function prepareWaves(flight){
  flight.waves=WAVE_PLANS[flight.id]||waves(['Operación','control','Objetivos adquiridos. Mantenga la aproximación y confirme cada contacto.']);
  flight.waveIndex=0;flight.waveTransition=0;flight.waveEvents=[{index:0,...flight.waves[0]}];
  const required=flight.targets.filter(t=>t.required);
  for(const target of flight.targets){
    if(!target.required){target.wave=0;target.active=true;continue;}
    target.wave=flight.waves.length===1?0:flight.m.type==='boss'?(target.role==='boss'?1+target.sequence-(flight.m.total-(flight.m.bossCount||1)):0):Math.floor(target.sequence*flight.waves.length/required.length);
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
