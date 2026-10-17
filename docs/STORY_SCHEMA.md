# Modelo narrativo y persistencia · versión 2

## Campañas

El estado identifica campaignId: jp52 (campaña nueva) o demo-v1 (recorrido abreviado anterior). src/legacy conserva los datos y reglas anteriores exclusivamente para compatibilidad. Las transiciones no convierten acontecimientos de una campaña en equivalentes inventados de la otra.

## Grafo

src/campaign-data.js contiene 52 capítulos; src/missions.js define sus parámetros jugables. src/story.js genera 52 briefings, 52 nodos de combate, 52 informes, introducción y cinco finales: **162 nodos**.

Los nodos dialogue contienen texto y opciones declarativas; mission identifica una misión y su informe siguiente; ending cierra una ruta. Todas las fuentes de los capítulos son referencias comunitarias y sus conversaciones son adaptaciones originales.

Las opciones tienen id, text y next. effects: {faction} cambia alianza. requires puede restringir una facción o un objetivo: {objective:{mission,id,min,max}}. El motor consulta el último resultado victorioso de esa misión y bloquea las opciones cuyo rango no se cumple.

validateGraph comprueba destinos, tipos, misiones, opciones únicas, condiciones válidas, accesibilidad y ausencia de ciclos. Las pruebas recorren además las condiciones reales para evitar nodos alcanzables solo en apariencia.

## campaignState

- version: 2.
- campaignId: jp52 o demo-v1.
- simulatorMission: null o identificador de la misión de simulador.
- node, faction: posición y alianza actuales.
- decisions: nodo, opción y facción antes/después.
- results: misión, victoria/derrota, bajas, objetivos principales completados, objetivos secundarios, integridad y tiempo restante. La campaña demo conserva su formato histórico de resultados.
- history: decisiones y resultados reproducibles.

Los contadores se calculan desde victorias. Reconocimiento, contención ANB y pasos de navegación completan objetivos sin producir bajas. Los dos soportes de Geofront Attack se destruyen después de cruzar el corredor y sí cuentan como blancos destruidos. Los grupos secundarios guardan conteos con máximos definidos por misión; las bajas deben ser compatibles con el tipo y los objetivos.

validateCampaign reconstruye el estado desde su inicio y compara todos sus campos con el candidato. La versión 1 se valida primero con el motor histórico y se migra a versión 2 con campaignId demo-v1. Versiones desconocidas, historiales incoherentes y resultados imposibles se rechazan.

## Ranuras

- electrosphere.campaign: campaña narrativa.
- electrosphere.simulator: una simulación independiente; solo permite su briefing, combate y cierre, sin tomar salidas de campaña.
- electrosphere.profile: misiones únicas y finales del archivo personal. Se conservan al iniciar otra campaña. Las simulaciones no suman finales.

Guardar durante combate conserva el punto de inicio de la misión; una carga reinicia el intento. Tras victoria se guarda de inmediato el informe siguiente. Un intervalo o callback de transición antiguo no puede afectar una misión nueva.

## Reloj y controles

La simulación usa tiempo transcurrido real. Pausa manual, pestaña oculta y archivo abierto congelan el tiempo y liberan controles. La lista de objetivos permite jugar con teclado/toque y mantiene el foco al actualizarse. Los núcleos de jefe se desbloquean después de los generadores y en orden.
