// Excepciones editoriales explícitas: nunca se inventan réplicas para cumplir un cupo.
export const editorialExceptions={
 m06:'Reconocimiento: el recuerdo de Rena depende del avance; los avisos de sensores quedan fuera del diálogo.',
 m16:'La aproximación puede resolverse antes del avistamiento por radio; el informe conserva el destino de Rena.',
 m22:'Se conserva la ausencia de Dision; no se añade una conversación para compensar los avisos de navegación.',
 m25:'La información táctica queda en el sistema; siete intervenciones explican la operación sin repetir sus instrucciones.',
 m31:'Transición breve de persecución; no se alarga el intercambio con instrucciones de combate ficticias.',
 m33:'Tras la pérdida de Keith predominan órdenes documentadas y silencio. No se inventa otro compañero.',
 m34:'Cambio de lealtad breve: se mantiene la voz de Dision sin convertir el entrenamiento en una conversación inventada.',
 m41:'Nemo vuela solo. Simon habla por enlace privado antes y después; no se inventa un acompañante en órbita.',
 m46:'La persecución por el corredor mantiene el intercambio breve con Cynthia y separa los avisos de navegación.',
 m51:'La persecución con Fiona conserva instrucciones técnicas como sistema, sin añadir réplicas de relleno.'
};
export const extendedNarratives={}; // 21–30 solo tras justificar una misión concreta.
export function assessNarrative(id,count,{defeat=false}={}){
 if(defeat)return {valid:true,reason:'Una derrota temprana no necesita completar el diálogo de victoria.'};
 if(count>=8&&count<=20)return {valid:true,reason:'Dentro de la guía de 8–20 intervenciones narrativas.'};
 const reason=count<8?editorialExceptions[id]:extendedNarratives[id];
 return {valid:Boolean(reason)&&count>0&&count<=30,reason:reason||'Requiere revisión y justificación editorial; no recortar ni rellenar automáticamente.'};
}
