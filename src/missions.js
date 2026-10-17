import { chapterList } from './campaign-data.js?v=0.5.0';

export const TYPE_RULES = {
  intercept:{label:'Intercepción',verb:'Destruir',hint:'Blancos rojos: interceptar antes de que alcancen el corredor.'},
  ground:{label:'Ataque a instalaciones',verb:'Destruir',hint:'Instalaciones ámbar: neutralizar. Los secundarios azules son opcionales.'},
  naval:{label:'Operación naval',verb:'Destruir',hint:'Prioriza los buques marcados. Los contactos verdes son civiles y no deben recibir fuego.'},
  train:{label:'Interdicción ferroviaria',verb:'Detener',hint:'El convoy se desplaza lateralmente; neutraliza sus segmentos antes del límite.'},
  escort:{label:'Protección',verb:'Interceptar',hint:'Protege el contacto verde. Los blancos que cruzan el corredor dañan su integridad.'},
  recon:{label:'Reconocimiento',verb:'Registrar',hint:'Los puntos cian se registran con sensores, sin destruirlos. Investiga las señales azules antes de terminar.'},
  containers:{label:'Contenedores en descenso',verb:'Interceptar',hint:'Neutraliza los contenedores antes de que alcancen el suelo; cada fuga daña la zona protegida.'},
  containment:{label:'Contención ANB',verb:'Neutralizar',hint:'Los pulsos ANB desactivan nubes de nanobots. El campo residual no cuenta como derribo.'},
  tunnel:{label:'Navegación por corredor',verb:'Cruzar',hint:'Alinea tu aeronave con la puerta iluminada y pulsa sobre ella. Los botones de objetivos también permiten alinear el paso.'},
  orbital:{label:'Intercepción orbital',verb:'Desactivar',hint:'Desactiva los satélites. Su blindaje depende de la dificultad; combina cañón automático y misiles.'},
  boss:{label:'Asalto por fases',verb:'Atacar',hint:'Neutraliza primero los generadores ámbar. Los núcleos magenta se desbloquean por fases y tienen más blindaje.'},
};

const secondary = {
  m06:{id:'facility',label:'Señal de instalación secreta',count:1,kind:'scan'},
  m20:{id:'hydrofoil',label:'Lancha con información',count:1,kind:'hostile'},
  m24:{id:'keith',label:'Atacante de Keith',count:1,kind:'hostile'},
  m30:{id:'raven',label:'Presión sobre Night Raven',count:1,kind:'hostile',hp:3},
  m34:{id:'helicopters',label:'Helicópteros de evacuación',count:3,kind:'hostile'},
  m39:{id:'infrastructure',label:'Radares y depósitos',count:7,kind:'facility'},
  m48:{id:'sphyrna',label:'Sectores del Sphyrna',count:3,kind:'hostile'},
};

export const missions = Object.fromEntries(chapterList.map(chapter => {
  const {id,number,type} = chapter;
  const total = number===33 ? 8 : number===41 ? 4 : type==='recon' ? 3 : type==='boss' ? ([32,37,52].includes(number) ? 6 : 4) : 4+number%3;
  const bossNames={m17:['Sphyrna'],m18:['Centro de mando de Park'],m30:['Sphyrna'],m32:['Night Raven','Aurora de Dision'],m36:['Centro de mando de Park'],m37:['Night Raven','Sphyrna'],m38:['Dision · Electrosphere'],m47:['Night Raven'],m49:['Cynthia'],m50:['Sphyrna'],m52:['Night Raven','Aurora de Dision']};
  const hasCivilians = [4,15,20].includes(number);
  return [id,{
    ...chapter, title:`${String(number).padStart(2,'0')} · ${chapter.name.toUpperCase()}`,
    total, time:type==='boss' || secondary[id] ? 100 : 75,
    secondary:secondary[id] || null, civilianCount:hasCivilians?1:0,
    supportCount:number===31?2:0, bossCount:bossNames[id]?.length||1, bossNames:bossNames[id]||[], seed:number*7919,
    rules:TYPE_RULES[type],
    adaptationNote:'Objetivos, tiempos y radar simplificados para esta adaptación. La fuente enlazada documenta la misión original.',
  }];
}));
