# Electrosphere 2040 · 52 misiones · v0.5

Adaptación fan no oficial en español de la campaña japonesa de Ace Combat 3. Incluye **52 misiones distribuidas entre rutas y cinco finales**, con briefing, conversación recreada, objetivo jugable e informe para cada misión. No es una reproducción íntegra del guion ni del simulador de vuelo original.

La v0.5 incorpora **nueve retratos locales**, controles con respuesta al pulsar y animación sincronizada con el navegador. **Quince misiones tienen dos o tres oleadas**, con radio contextual bajo el campo de combate. Tres enemigos originales se distinguen por silueta, color y comportamiento: Dardo (ágil, disparo dirigido), Manta (blindado, cortinas) y Lince (dron, anillos). Fuentes y créditos de retratos en [ASSETS.md](docs/ASSETS.md).

La v0.4 reescribe las 471 intervenciones como escenas con voces diferenciadas: Fiona competitiva y afectuosa, Erich inseguro que aprende a decidir, Rena reservada, Keith orgulloso y leal, Cynthia brillante y arrogante, Dision seductor y autoritario, Simon clínico. La [biblia de personajes](docs/CHARACTER_BIBLE.md) distingue los perfiles oficiales de las decisiones creativas. Incluye acotaciones, intercambio entre compañeros y grabaciones identificadas; Nemo conserva su silencio. No cambian rutas, guardados ni bullet hell.

Jugar en GitHub Pages: https://42571634-gif.github.io/acecombat-/ (requiere que Pages esté activado sobre `main` / raíz).

La versión 0.3 incorpora **bullet hell con tres dificultades** y triplica las intervenciones de la campaña: 471 frente a 157, contando introducción, briefings e informes. Cada misión tiene seis intervenciones previas y tres posteriores, con escritura específica para el capítulo y sin copiar los diálogos originales.

Elige **Fácil, Normal o Experto** antes de despegar. El cañón dispara automáticamente; usa flechas/WASD o arrastre táctil para esquivar. Shift activa movimiento de precisión; X o el botón Contramedida limpia los proyectiles (tres usos por intento). Toca los blancos de la zona superior o usa la lista accesible para misiles, sensores, ANB y pasos. Los controles de subir/bajar y virar permiten jugar sin arrastrar. La preferencia de dificultad se conserva en el navegador; queda bloqueada durante el combate y puede cambiarse tras una derrota, reiniciando el intento.

## Ejecutar

Requiere Python 3 y un navegador moderno. No hay dependencias que instalar ni compilación.

~~~bash
npm start
~~~

Abrir http://127.0.0.1:8000. El comando usa python; si tu equipo utiliza python3, ejecuta python3 -m http.server 8000 --bind 127.0.0.1.

Los módulos JavaScript nativos requieren HTTP. Abrir index.html mediante file:// no es compatible. Para conservar partidas, utiliza siempre el mismo navegador, host y puerto.

## Jugar

- **Campaña:** comienza en SARF y toma decisiones. Las 52 misiones se reparten entre rutas; una partida recorre solo una selección.
- **Archivo de 52 misiones:** consulta cualquier expediente, filtra por nombre/número/lugar/ruta y abre su fuente. Abrir el archivo pausa el combate actual.
- **Simulador:** permite probar cualquiera de las 52 misiones. Usa una ranura propia y no cambia la campaña. Volver a la campaña recupera su último punto guardado, reiniciando un combate pendiente.
- **Objetivos azules:** son secundarios. Debes completarlos antes del último objetivo principal si quieres que cambien tu siguiente misión. El informe habilita únicamente la continuación obtenida.
- **Controles:** apunta con clic/toque o usa la lista de objetivos accesibles; ←/→, A/D o botones táctiles para virar. Pausar/Reanudar congela la operación. Ocultar la pestaña también pausa.
- **Navegación:** alinea la aeronave con el paso y actívalo. La lista accesible permite alinear y cruzar con un botón.
- **Asaltos por fases:** elimina los generadores y después los núcleos en orden. Los jefes requieren varios impactos.
- **Registro personal:** conserva misiones únicas completadas y finales entre nuevas campañas. Las simulaciones cuentan como misiones probadas, pero no desbloquean finales de campaña.

## Guardado y compatibilidad

Se guarda después de decisiones y resultados; Guardar partida permite hacerlo manualmente. Se recupera la escena o el inicio de una misión pendiente, sin radar parcial. Una derrota se conserva como intento; sus bajas no aumentan los contadores consolidados.

El esquema actual es **versión 2**. Las partidas versión 1 del Hito 1 se validan y migran a una campaña demo compatible, conservando íntegramente sus decisiones y resultados. No se inventa un equivalente de sus capítulos abreviados dentro de la campaña nueva. Nueva campaña inicia el recorrido de 52 misiones. La demo anterior contiene nueve misiones; esas partidas siguen su propio recorrido.

Las claves son electrosphere.campaign, electrosphere.simulator y electrosphere.profile. Nueva campaña reemplaza la campaña activa, conservando el perfil y el simulador. Los guardados corruptos o incoherentes se rechazan sin borrarlos. Si localStorage está bloqueado, se puede jugar en memoria.

## Fuentes y alcance

Se consultaron transcripciones japonesas por misión y se contrastaron puntos concretos con transcripciones en inglés atribuidas a Project Nemo. Cada expediente enlaza su referencia. **Todas las conversaciones que se muestran son texto original de esta adaptación**, no traducciones literales. Los metadatos community-transcript expresan evidencia comunitaria, no una validación oficial.

Los tiempos, cantidades, radar y condiciones operativas se simplifican. Por ejemplo, ciertos eventos que en el original aparecen después de una fase o un umbral temporal están disponibles aquí como objetivos secundarios desde el inicio. Ver [investigación y equivalencias](docs/RESEARCH.md).

## Verificar

Con Node.js 18 o superior:

~~~bash
npm run check
~~~

Comprueba la sintaxis de todos los módulos y ejecuta las pruebas. Incluyen las 52 misiones mediante su combate real, todas las variantes del grafo hasta los cinco finales, condiciones de bifurcación, civiles, jefes, migración de guardados, ranuras independientes y regresiones de interfaz.

## Estructura

- src/campaign-data.js: contenido adaptado y fuente individual de los 52 capítulos.
- src/missions.js: catálogo jugable, reglas y objetivos secundarios.
- src/story.js: briefing, combate, informes, decisiones y finales del grafo.
- src/engine.js: transiciones, validación de decisiones y reproducción de historiales.
- src/combat.js / src/draw.js: simulación y radar.
- src/game.js: interfaz, archivo, controles y ciclo de vida.
- src/storage.js: guardados y perfil local.
- src/legacy/: datos y reglas de compatibilidad del Hito 1.
- tests/: regresiones de la demo anterior y pruebas de la campaña ampliada.
- docs/RESEARCH.md, docs/CAMPAIGN_MAP.md y docs/STORY_SCHEMA.md: referencias, mapa y contrato técnico.

Proyecto experimental sin afiliación con Bandai Namco. Retratos © Namco / Bandai Namco Entertainment, con procedencia documentada. Diálogos adaptados y gráficos de combate originales; no contiene ROM, audio ni cinemáticas del juego.
