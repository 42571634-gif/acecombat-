# Verificación v0.7

`npm run check`: 22 módulos con sintaxis válida y 59 pruebas aprobadas. Se mantienen las regresiones de combate, guardados y las 156 combinaciones de misión/dificultad. Las 477 intervenciones tienen un interlocutor registrado; no hay voz inventada para Nemo y las grabaciones de fallecidos conservan su identificación.

Pruebas editoriales: destino de Clarkson y escolta sin anticipar el cambio de orden, radio bloqueada por interferencias, Rena/Erich después de la orden de Park, explicación de sublimación, alerta del golpe posterior a la misión, generadores Aeon, despedida de Fiona y referencias visibles. Se elimina la exigencia de seis turnos exactos por escena. El contraste de fuentes es puntual y no equivale a una traducción completa; ver TEXT_REVIEW.md.

Navegador local: introducción con presentación de SARF/UPEO, nueva conversación de las hermanas y escolta de Clarkson con destino e interferencias. Vista móvil 390×844: ancho 375 y scrollWidth 375, sin desbordamiento. Sin errores ni advertencias JavaScript.

## Registro de verificación v0.6

`npm run check`: 22 módulos y 56 pruebas. Las 52 misiones se completan en las tres dificultades usando movimiento, misiles con azar reproducible, cañón y contramedidas reales. El piloto de pruebas suspende el cañón y espera nuevas pasadas cuando prioriza secundarios. No modifica la vida ni declara victorias artificiales.

Pruebas nuevas: paso y retorno de contactos sin curación ni bajas duplicadas; tipos de blancos por historia; acierto y fallo de misiles; seguimiento de transporte frente a base fija; daño y derrota del aliado independiente; cobertura con consumo y recarga; bloqueo de capas y compuerta del núcleo; controles móviles y pausa desde el archivo.

Navegador local: escolta de Clarkson con aliado visible, cobertura activada y energía; asalto al Sphyrna con dos capas completadas y transición al núcleo (3/4 objetivos). Vista móvil 390×844: ancho 375 y scrollWidth 375, sin desbordamiento; jefe y controles visibles. Sin errores ni advertencias JavaScript. La revisión automatizada confirma completabilidad, no sustituye una evaluación humana del equilibrio en teléfonos físicos.

## Registro de verificación v0.5.1

`npm run check`: 21 módulos y 49 pruebas aprobadas. Se comprueba posición de narraciones entre réplicas, contexto de la escolta y orden de Park, transición orbital, renderizado accesible sin avatar y escape de HTML. Las narraciones se excluyen del recuento de 471 intervenciones habladas y no se registran como personajes. Se conservan las pruebas de rutas, guardado y las 156 combinaciones de misión/dificultad.

## Registro de verificación v0.5

`npm run check`: **20 módulos con sintaxis válida y 47 pruebas aprobadas, cero fallos**. Conservadas las 156 combinaciones de misión/dificultad y las regresiones de rutas y guardado. Nuevas pruebas: nueve retratos, botones persistentes, respuesta al pulsar, teclado con foco, liberación de controles, ciclo único de animación, pausa, refuerzos inactivos, secundarios, orden de jefes y blindaje aplicado una sola vez.

Navegador real: retratos de Fiona y Erich cargados; primera oleada de Awakening eliminada (3/5), mensaje de Erich y dos refuerzos en fase 2, sin victoria prematura. Radio bajo el campo y controles. Vista móvil solicitada 390×844: clientWidth 375 y scrollWidth 375, sin desbordamiento horizontal. Sin errores ni advertencias JavaScript. No se ha medido latencia física en un teléfono.

## Registro de verificación v0.4

`npm run check`: **17 módulos con sintaxis válida y 40 pruebas aprobadas**. Además de las regresiones de combate, grafo, guardado y 156 combinaciones de misión/dificultad, se validan las 471 intervenciones con personajes registrados, la ausencia de voz inventada para Nemo, apariciones por ruta, grabaciones de Keith/Dision tras sus muertes y presentación de iniciales/acotaciones. Se mantiene la cantidad de intervenciones; la revisión elimina mínimos artificiales de caracteres para permitir réplicas cortas y silencios.

Verificación en navegador real: nueva introducción, selección de Utopian Dreams desde el archivo, seis intervenciones entre las hermanas con identidad visual y acotación. Ancho móvil solicitado 390 px: clientWidth 375 y scrollWidth 375, sin desbordamiento. Sin errores ni advertencias JavaScript en la revisión. El combate no cambia en esta entrega.

La continuidad automatizada verifica presencias y estructura; la coherencia emocional es una decisión editorial revisada contra los perfiles oficiales y las escenas de las bifurcaciones. Ver CHARACTER_BIBLE.md para fuentes y límites de interpretación.

## Registro de verificación v0.3

`npm run check`: **14 módulos con sintaxis válida y 37 pruebas aprobadas**. El piloto automático de pruebas completa las 52 misiones en las tres dificultades (156 combinaciones), usando movimiento, esquiva prevista, disparos y contramedidas reales; no cambia vida ni declara victorias artificiales. La ayuda de alineación de túneles coincide con la lista accesible de la interfaz. Se prueban secundarios, generadores y jefes secuenciales, colisión, invulnerabilidad, límite de contramedidas, disparo automático y protección de civiles, controles y preferencia persistente.

Las pruebas tácticas anteriores se conservan en modo explícito `tactical` para comparar rutas, guardados y regresiones. La interfaz pública usa `bullethell` por defecto. Estas pruebas de simulación confirman que las misiones son completables; no sustituyen una evaluación humana del equilibrio de dificultad.

Se comprueban seis intervenciones de briefing y tres de informe por misión, 208 nuevas intervenciones previas distintas y metadatos de adaptación. Incluida la introducción, el total pasa de 157 a 471.

Navegador real: combate Experto con proyectiles y cañón automático, pausa sin consumir tiempo, selector bloqueado en vuelo, seis intervenciones en Awakening y controles táctiles visibles. Diseño móvil solicitado 390×844: ancho CSS 375, scrollWidth 375, sin desbordamiento horizontal. Sin errores ni advertencias JavaScript durante la comprobación.

## Registro de verificación v0.2

Fecha: 17 de octubre de 2026.

## Comprobaciones automatizadas

Comando: npm run check.

Resultado: **11 módulos con sintaxis válida y 29 pruebas aprobadas; cero fallos**.

- Las 52 misiones se completan utilizando createFlight, advanceFlight y fireMissile, con sus reglas y resistencias reales de esta adaptación; no se sustituyen por victorias ficticias en esa prueba.
- El grafo se recorre con los extremos de los objetivos secundarios y todas las decisiones disponibles: alcanza las 52 misiones y cinco finales.
- Se prueban los límites parciales de las siete bifurcaciones por objetivos, incluida infraestructura de Power for Life con seis y siete instalaciones.
- La interfaz completa una campaña UPEO nueva de 17 misiones con DOM y reloj controlados. También conserva las regresiones de la demo anterior.
- Se comprueban guardados corruptos, migración versión 1, ranuras independientes y perfil persistente.
- Se comprueban civiles, escoltas, jefes secuenciales, reconocimiento sin bajas, soporte destructible de Geofront, pausas y transiciones antiguas canceladas.

## Navegador real

- Recuperada una partida del Hito 1 y verificada su indicación de demo compatible.
- Archivo con 52 expedientes, búsqueda y apertura directa de Sole Survivor.
- Completada Sole Survivor con los botones accesibles: generadores, Night Raven y Aurora; el perfil registró su final de simulación sin sumar un final de campaña.
- Detectada y corregida la reutilización de CSS antiguo con identificadores de versión para estilos y módulos.
- Verificada la cuadrícula de tres columnas en escritorio y una columna móvil, con ancho solicitado de 390 px: ancho CSS efectivo 375 px y scrollWidth 375 px, sin desbordamiento horizontal.
- Sin errores JavaScript en la consola durante la revisión final.

Las pruebas automatizadas usan reloj controlado. La revisión en navegador no sustituye una sesión física en móvil ni una evaluación de fidelidad por parte del editor del juego. El contenido se presenta como adaptación apoyada en transcripciones comunitarias.
