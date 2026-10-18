// Puentes editoriales originales: no fijan horas, destinos o desplazamientos no documentados.
export const narration = (text,label='Escena') => ({kind:'narration',label,text,adaptation:true});
const bridges={
  1:[[0,'Nemo, Erich, Fiona y Rena participan en la intervención sobre Expo City.','Formación de SARF']],
  3:[[3,'La alerta interrumpe el entrenamiento conjunto. Los canales de los pilotos pasan a coordinar la emergencia sobre Chopinburg.','Cambio de operación']],
  5:[[4,'La conversación da paso a la coordinación de vuelo: Erich anuncia a Nemo el lado que va a cubrir.','Formación de escolta']],
  6:[[0,'En el enlace de reconocimiento, Rena observa las imágenes del valle de Hatties Range junto a la información que recibe Nemo.','Reconocimiento']],
  7:[[0,'Tras el hallazgo de la instalación, Rena continúa su investigación cerca de Expo City. La orden de Park llega por radio.','Otra salida · Expo City']],
  9:[[0,'Clarkson y Fiona viajan en el transporte. Nemo y Erich pilotan los cazas de escolta; al comenzar, todos comparten el canal de radio.','Montañas Lambert · Escolta'],[4,'Las interferencias interrumpen la comunicación con el transporte. Erich intenta volver a contactar con Fiona.','Interferencias en la radio']],
  10:[[0,'En la siguiente operación de esta ruta, Nemo vuelve a volar con Erich y Rena. Fiona y Clarkson ya no están en la formación. Park transmite las órdenes desde el mando.','Más adelante · White Valley']],
  19:[[0,'Tras aceptar la oferta de Dision, Nemo se incorpora a una operación de General Resource. Dision y Keith son ahora sus compañeros de formación.','Nueva organización · General Resource']],
  34:[[0,'Nemo ha elegido seguir a Dision. El siguiente enlace operativo ya pertenece a Ouroboros.','Cambio de lealtad']],
  39:[[0,'Después de proteger el transporte y romper con Park, Nemo y Fiona se incorporan a Neucom. Cynthia coordina su nueva operación.','Más adelante · Neucom']],
  41:[[0,'La operación se traslada fuera de la atmósfera. Nemo recibe instrucciones por el enlace de Neucom Space para atacar los satélites.','Cambio de escenario · Órbita']],
  43:[[0,'Las hermanas utilizan un canal compartido con Nemo antes de entrar en combate.','Antes de la salida'],[8,'La conversación termina por ahora. La formación se prepara para atacar las fuerzas de General Resource en White Valley.','Comienzo de la operación']],
  44:[[0,'Tras seguir a Cynthia, Nemo participa en una operación de Ouroboros sobre Expo City. Dision dirige la captura de Rena.','Nueva operación · Expo City']],
  46:[[0,'La persecución del Night Raven entra en Geofront. Cynthia y Nemo mantienen el contacto por radio dentro del corredor.','Cambio de escenario · Geofront']],
  47:[[0,'La persecución alcanza Port Edwards. Simon se incorpora al enlace de Cynthia y Nemo con información sobre la energía del Night Raven.','Nuevo interlocutor · Simon']],
  48:[[0,'Nemo ha decidido quedarse con Fiona en Neucom. Cynthia ha tomado otro rumbo; su voz ya no está en el canal de esta operación.','Tras la separación']],
  51:[[0,'Después del combate contra el Sphyrna, la persecución continúa en los corredores de Geofront. Fiona y Nemo siguen enlazados por radio.','Cambio de escenario · Geofront']],
  52:[[0,'Al final de la persecución por Geofront, Simon entra en el enlace de Fiona y Nemo. La operación exige neutralizar los generadores y después los dos aparatos.','Continuación de la persecución']],
};
export function situateScene(number,lines){
  const additions=bridges[number]||[];
  return [...lines.flatMap((line,index)=>[...additions.filter(([before])=>before===index).map(([,text,label])=>narration(text,label)),line]),...additions.filter(([before])=>before===lines.length).map(([,text,label])=>narration(text,label))];
}
