import { missions } from './missions.js?v=0.3.0';

export const endingData = {
  upeo:{label:'UPEO · Erich y Rena',mission:'m18',description:'Park ha sido derrotado y Rena sobrevive. Nemo y Erich terminan el recorrido que comenzó intentando mantener la paz desde SARF.'},
  general:{label:'General Resource · Keith',mission:'m33',description:'La derrota de Dision cuesta la vida de Keith. Tras los Geopelia, General Resource proclama su victoria, pero el recorrido de Nemo conserva una última anomalía.'},
  dision:{label:'Ouroboros · Dision',mission:'m38',description:'El duelo en la Electrosphere elimina la presencia digital de Dision. Las identidades que parecían sostener esta revolución se deshacen con su derrota.'},
  cynthia:{label:'Ouroboros · Cynthia',mission:'m47',description:'Cynthia rompe con Ouroboros y ayuda a terminar su proyecto. Los generadores y el Night Raven dejan de sostener una revolución que había convertido a las personas en instrumentos.'},
  fiona:{label:'Neucom · Fiona',mission:'m52',description:'Fiona y Nemo vencen al Night Raven y a Dision con apoyo técnico de Simon. La resolución de la guerra no elimina las pérdidas ni las preguntas que la acompañan.'},
};

export const routeEdges = {
  m01:[2],m02:[3],m03:[4],m04:[5,19],m05:[6],m06:[7,8],m07:[9,8],m08:[9],m09:[10,39],
  m10:[11],m11:[12],m12:[13],m13:[14],m14:[15],m15:[16],m16:[17],m17:[18],m18:[],
  m19:[20],m20:[21,22],m21:[23],m22:[23],m23:[24],m24:[25,26],m25:[27],m26:[28],m27:[28],m28:[29,34],
  m29:[30],m30:[31,32],m31:[32],m32:[33],m33:[],m34:[35,36],m35:[36],m36:[37],m37:[38],m38:[],
  m39:[40,41],m40:[42],m41:[43],m42:[43],m43:[44,48],m44:[45],m45:[46],m46:[47],m47:[],m48:[49,50],m49:[50],m50:[51],m51:[52],m52:[],
};
const toIntro = n => `m${String(n).padStart(2,'0')}Intro`;
const option = (id,text,next,extra={}) => ({id,text,next,...extra});
const faction = value => ({effects:{faction:value}});
const condition = (mission,id,min,max) => ({requires:{objective:{mission,id,...(min===undefined?{}:{min}),...(max===undefined?{}:{max})}}});
const performanceOptions = (mission,id,count,yes,no,yesLabel,noLabel) => [
  option('achieved',yesLabel,toIntro(yes),condition(mission,id,count)),
  option('not-achieved',noLabel,toIntro(no),condition(mission,id,undefined,count-1)),
];

export const story = {
  intro:{kind:'dialogue',tag:'Campaña japonesa · 52 misiones entre rutas',title:'Una guerra que cambia con tus decisiones',
    body:'Nemo entra en SARF mientras UPEO intenta contener la guerra entre General Resource y Neucom. La campaña conserva las 52 misiones repartidas entre rutas y cinco finales. Los combates y conversaciones son adaptaciones originales en español.',
    speaker:['Terminal de Nemo','Cada misión guarda sus fuentes. Algunas bifurcaciones dependen de tu respuesta; otras, de objetivos secundarios.'],
    dialogue:[{speaker:'Terminal de Nemo',text:'Cada misión guarda sus fuentes. Algunas bifurcaciones dependen de tu respuesta; otras, de objetivos secundarios.'},{speaker:'Archivo de campaña',text:'UPEO intenta contener un conflicto que las corporaciones describen según sus propios intereses. Nemo comienza en SARF; los compañeros de cada vuelo también tendrán algo que perder cuando las órdenes cambien.'},{speaker:'Terminal de Nemo',text:'Conserva los informes y escucha antes de elegir. Una campaña recorre una parte de las 52 misiones; volver a empezar permite conocer otras decisiones y otros finales sin borrar el archivo personal.'}],
    options:[option('choice-1','Comenzar con SARF','m01Intro')],adaptation:true,confidence:'community-transcript',source:{url:'https://w.atwiki.jp/acacac/pages/4.html',title:'Índice japonés de transcripciones'}},
};
for (const mission of Object.values(missions)) {
  const {id,name,source,confidence,adaptation} = mission;
  const meta = {source,confidence,adaptation,missionId:id};
  const briefingOptions=[option('choice-1','Despegar · '+mission.rules.label,id+'Combat')];
  if(id==='m07') briefingOptions.push(option('return','Obedecer el regreso · Fragile Cargo',toIntro(8)));
  story[id+'Intro']={kind:'dialogue',tag:`${mission.arc} · ${mission.number}/52`,title:name,body:mission.briefing,dialogue:mission.dialogue,
    speaker:[mission.dialogue[0].speaker,mission.dialogue[0].text],options:briefingOptions,...meta};
  story[id+'Combat']={kind:'mission',mission:id,next:id+'Report',...meta};
  let options=routeEdges[id].map(n=>option('choice-1','Continuar · '+missions['m'+String(n).padStart(2,'0')].name,toIntro(n)));
  if(id==='m04') options=[option('stay','Permanecer en UPEO',toIntro(5)),option('dision','Ingresar en General Resource',toIntro(19),faction('GR'))];
  if(id==='m06') options=performanceOptions(id,'facility',1,7,8,'Instalación descubierta · Investigar con Rena','Sin hallazgo · Atender la emergencia de Axel Bay');
  if(id==='m07') options=[option('choice-1','Continuar · Scylla and Charybdis',toIntro(9))];
  if(id==='m09') options=[option('obey','Obedecer a Park · Permitir el derribo del transporte',toIntro(10)),option('fiona','Defender a Fiona y Clarkson · Desertar a Neucom',toIntro(39),faction('NEUCOM'))];
  if(id==='m20') options=performanceOptions(id,'hydrofoil',1,21,22,'Información recuperada · Target Acquisition','Sin información · Partners');
  if(id==='m24') options=performanceOptions(id,'keith',1,25,26,'Keith auxiliado · Welcoming Committee','Prioridad a bombarderos · Technology Transfer');
  if(id==='m28') options=[option('keith','Permanecer con Keith',toIntro(29)),option('dision','Seguir a Dision a Ouroboros',toIntro(34),faction('OUROBOROS'))];
  if(id==='m30') options=performanceOptions(id,'raven',1,31,32,'Night Raven presionado · Geofront Attack','Night Raven escapó · Casualties of War');
  if(id==='m34') options=performanceOptions(id,'helicopters',3,36,35,'Evacuación interceptada · Archnemesis','Helicópteros escaparon · Liquidation');
  if(id==='m39') options=performanceOptions(id,'infrastructure',7,40,41,'Siete instalaciones neutralizadas · Guardian Angel','Instalaciones restantes · Zero Gravity');
  if(id==='m43') options=[option('cynthia','Seguir a Cynthia a Ouroboros',toIntro(44),faction('OUROBOROS')),option('fiona','Permanecer con Fiona en Neucom',toIntro(48))];
  if(id==='m44') options=[option('choice-1','Romper con Ouroboros · Counterrevolution',toIntro(45),faction('NEUCOM'))];
  if(id==='m48') options=performanceOptions(id,'sphyrna',3,49,50,'Sphyrna muy dañado · Radio Silence','Presión insuficiente · Revenge');
  const ending=Object.entries(endingData).find(([,data])=>data.mission===id);
  if(ending) options=[option('choice-1','Concluir esta ruta','ending-'+ending[0])];
  story[id+'Report']={kind:'dialogue',tag:'Informe de misión · '+name,title:'Consecuencias de la operación',body:mission.report,
    dialogue:mission.reportDialogue,
    speaker:['Nemo · registro de vuelo','Resultado incorporado al historial. La ruta disponible se calcula con las decisiones y objetivos registrados.'],options,...meta};
}
for(const [id,ending] of Object.entries(endingData)) story['ending-'+id]={kind:'ending',...ending,
  source:missions[ending.mission].source,confidence:'community-transcript',adaptation:true};
