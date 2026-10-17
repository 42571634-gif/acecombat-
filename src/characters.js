// Rasgos documentados separados de decisiones de escritura originales.
const official='https://www.bandainamcoent.co.jp/cs/list/acecombat3/';
const profile=(name,initials,source,documented,voice,want,fear)=>({name,initials,source,documented,voice,want,fear,adaptation:true,interpretation:true});
export const characters={
  fiona:profile('Fiona Chris Fitzgerald','FI',official+'page03.html','Competitiva, afectuosa, rival de Nemo; ama a su hermana pese a sus diferencias.','Rápida, bromista, impaciente. Al perder seguridad, acusa, se contradice y pide afecto sin admitirlo.','Que la elijan sin tener que parecerse a Cynthia.','Que su hermana la deje atrás.'),
  erich:profile('Erich Jager','EJ',official+'page03.html','Novato instruido, indeciso, poco seguro de sí mismo y ansioso por esa inseguridad.','Se corrige, se refugia en el procedimiento; después consigue terminar frases y asumir decisiones.','Ser un compañero en quien se pueda confiar.','Equivocarse cuando otro depende de él.'),
  rena:profile('Rena Hirose','RH',official+'page03.html','As reservada, enfermedad Silverstone y restricciones físicas; anhela libertad y oculta sus inquietudes.','Frases pequeñas, silencios concretos, percepción del cuerpo y del cielo. Su firmeza no equivale a frialdad.','Elegir una salida que de verdad sea suya.','Que otros administren su cuerpo y sus recuerdos.'),
  keith:profile('Keith Bryan','KB',official+'page05.html','Piloto hecho a sí mismo, obstinado, competitivo, ambicioso y capaz de reconocer la habilidad ajena.','Áspero, práctico y burlón. Respeta con desafíos; expresa cariño como cobertura y regaños.','Demostrar su valor y conservar un compañero que responda.','Que lo abandonen o lo traten como prescindible.'),
  dision:profile('Abyssal Dision','AD',official+'page05.html','As misterioso, lógico, seguro y de porte frío, con una faceta romántica.','Cortés al seducir, íntimo al reclutar; convierte su deseo en destino. Al resistírsele, pierde el aplomo.','Que otros reconozcan como inevitable el mundo que desea imponer.','Volver a perder lo que ama y descubrir límites a su poder.'),
  cynthia:profile('Cynthia Bridgitte Fitzgerald','CF',official+'page05.html','Hermana mayor de Fiona, rebelde ante una familia conservadora, privilegiada y de fuerte conciencia elitista.','Brillante, exigente, vanidosa. Habla del futuro como de un lugar al que tiene derecho a entrar primero.','Superar sus límites y descubrir el siguiente mundo.','Que su excepcionalidad sea una fantasía y Fiona tenga razón.'),
  park:profile('Gilbert Park','GP',official+'page04.html','Ex General Resource, responsable militar de UPEO, rodeado de sospechas.','Imperativos y eufemismos. Se apropia de la institución; ante el peligro personal se le rompe la sintaxis.','Conservar el mando y decidir quién merece obediencia.','Que una orden deje de producir sumisión.'),
  clarkson:profile('Gabriel W. Clarkson','GC',official+'page04.html','Representante de UPEO que busca resolver los conflictos por medios políticos.','Comedido y específico: pide tiempo para negociar, incluso cuando incomoda a quienes lo protegen.','Mantener abierta una negociación.','Que la fuerza haga imposible volver a hablar.'),
  simon:profile('Simon Orestes Cohen','SC','https://w.atwiki.jp/acacac/pages/57.html','Investigador de Neucom; informa sobre los generadores y expresa interés instrumental en los sujetos del experimento.','Precisión clínica, impaciencia y satisfacción impropia. La ayuda parece un favor hasta que asoma la posesión.','Obtener el desenlace que busca sin perder el control del experimento.','Que el resultado escape a su diseño.'),
  control:profile('Control de operación','CO',official+'page03.html','Canal operativo de la adaptación, sin biografía individual canónica.','Breve, localizado y concreto. Solo órdenes y estado de la operación.','Mantener la operación coordinada.','Perder una confirmación crítica.'),
  archive:profile('Registro automático','REC','https://w.atwiki.jp/acacac/pages/4.html','Recurso editorial de la adaptación; no es voz de Nemo.','Datos y silencios. Nunca explica al jugador lo que debe sentir.','Conservar el rastro de cada vuelo.','Sin psicología: es una interfaz.'),
};
export function dialogueLine([character,text,direction='',recorded=false]){
  const voice=characters[character];
  if(!voice)throw new Error('Personaje desconocido: '+character);
  return {character,speaker:voice.name,text,direction,recorded};
}
for(const id of ['fiona','erich','rena','keith','dision','cynthia','park','clarkson','simon']){
  characters[id].portrait='./assets/portraits/'+id+(id==='simon'?'.webp':'.jpg');
}
