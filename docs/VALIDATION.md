# Verificación v0.3

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
