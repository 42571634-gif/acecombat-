# Mecánicas v0.6

El escenario avanza a 38 unidades lógicas por segundo (12 en jefes). Los blancos aéreos, terrestres, navales y de carga atraviesan la zona superior a velocidades distintas. Al salir de pantalla esperan 1,2 segundos y vuelven por arriba en una nueva pasada. Conservan identificación y resistencia: nunca se resucita un blanco destruido ni se suman bajas por escapar. El reloj no se reinicia. Los contenedores que alcancen la zona causan 20 puntos de daño antes de llegar otra carga. Sensores, ANB y pasos conservan su activación específica. La repetición de pasadas es una simplificación jugable, no un bucle temporal del guion.

Misiles: recarga de 0,45 segundos, daño de 3, alcance 500. Acierto base Fácil/Normal/Experto: 94/86/78%; Dardo resta 8 puntos, Lince 12, núcleo 22; blancos terrestres y navales suman 6, con máximo 98%. El porcentaje aparece en la lista accesible. Un fallo consume recarga y deja intacto el blanco, con trazo naranja y aviso. Sensores, pasos y ANB no tienen fallo aleatorio. El cañón conserva colisiones físicas; puede suspenderse con su botón para no resolver principales mientras buscas secundarios. No acumula disparos mientras está detenido.

Escoltas: unidades móviles en 08, 09, 26, 40 y 42 siguen al jugador con retraso y 33 unidades de separación vertical; bases de 05 y 11 permanecen fijas. El fuego enemigo alterna apuntado al jugador y al aliado. Sus integridades son independientes. Perder cualquiera implica derrota; ganar requiere resolver los objetivos con ambos vivos. La integridad del informe usa el menor valor de ambos. Permanecer delante permite interceptar proyectiles; Cobertura (botón táctil o Shift cerca del aliado) protege en un radio de 31, a distancia inferior a 90, consumiendo 8 unidades de energía por segundo y 12 por impacto. Se recuperan 12 por segundo al desactivar la cobertura. Cada impacto sin cobertura causa el 60% del daño de dificultad al aliado, con un segundo de protección ante impactos repetidos. La formación, escudo y velocidades son ayudas originales de esta adaptación.

Jefes: todos usan defensas exteriores, sistemas internos y uno o dos núcleos secuenciales. Las partes existentes se reparten entre capas: no se aumenta el total de objetivos ni se cambian umbrales narrativos. Una transición de 0,8 segundos separa cada capa. El núcleo se mueve lateralmente, tiene radio de impacto de 9 y abre durante 1,4 segundos de cada ciclo de 3,2. Cerrado rechaza cañón y misil; abierto mantiene menor probabilidad de acierto del misil. La pausa congela movimiento, cobertura, pasadas y compuertas. Las operaciones duran 90 segundos; con secundarios, 110; jefes, 150. Se mantienen las derrotas por tiempo, integridad y fuego civil. Cargar o reintentar vuelve al principio de la misión.

## Registro de mecánicas v0.5

Los enemigos aéreos comunes tienen tres diseños originales: Dardo (silueta delta roja, ágil, fuego dirigido, blindaje base 6), Manta (alas anchas ámbar, dos motores, cortinas, blindaje 10) y Lince (dron hexagonal violeta, anillos, blindaje 8). El blindaje se multiplica una sola vez por la dificultad y por la resistencia táctica original del blanco. Instalaciones, sensores y jefes conservan sus reglas especiales. Los patrones alternados descritos para v0.3 quedan como respaldo para blancos sin arquetipo.

Quince misiones usan dos o tres fases: 01, 03, 09, 15, 17, 24, 30, 32, 33, 37, 40, 47, 48, 50 y 52. Al eliminar los objetivos principales activos aparece el mensaje de radio de la siguiente fase y sus refuerzos llegan tras 0,8 segundos de simulación. Se limpian proyectiles y se concede protección breve; integridad, tiempo y contramedidas no se reinician. Pausar congela la transición. No se puede atacar un refuerzo antes de que llegue. Los secundarios permanecen disponibles y deben resolverse antes del último principal para modificar la ruta. Victoria al completar todos los principales; derrota por las condiciones anteriores de integridad, tiempo o civiles. No cambian decisiones ni finales. Cargar o reintentar reinicia la misión completa.

La radio bajo los controles añade intervenciones originales específicas por fase. Los objetivos responden a pointerdown y conservan su botón entre impactos. Los controles direccionales dan un desplazamiento inicial al pulsar y movimiento continuo mientras se mantienen; teclado también funciona con botones enfocados. El navegador anima con requestAnimationFrame; los entornos sin esa API usan temporizador de 16 ms. La recarga del misil se indica en pantalla: no es retardo del control. No se ha medido latencia en dispositivos físicos.

# Mecánicas de la adaptación

## Combate actual: bullet hell (v0.3)

La interfaz inicia todas las misiones con proyectiles enemigos y disparo automático doble a 10 ráfagas por segundo. El jugador se mueve en la franja inferior (x 15–705, y 285–403) con flechas/WASD, arrastre relativo con captura de puntero o botones táctiles. Shift baja la velocidad de 240 a 100 unidades/segundo. La hitbox es el punto blanco central, menor que la silueta. Las diagonales están normalizadas. La pausa manual, el archivo y ocultar la pestaña detienen el reloj y la simulación; al volver no hay salto de tiempo ni botones retenidos.

Los emisores alternan abanico dirigido a la posición del jugador, cortina descendente y anillo radial. Son patrones originales, también en reconocimiento, contención y túneles: representan peligro de la zona, no nuevos acontecimientos del guion. Los blancos se mantienen arriba; su desplazamiento vertical anterior se reemplaza por proyectiles. En escoltas y contenedores la integridad de la operación depende ahora de sobrevivir al fuego, además de completar sus tareas. Los túneles conservan el daño por desalineación.

| Dificultad | Intervalo de patrón | Velocidad | Abanico / anillo | Daño | Invulnerabilidad | Hitbox |
|---|---|---|---|---|---|---|
| Fácil | 1,5 s | 85 u/s | 3 / 9 | 10 | 1,6 s | radio 4 |
| Normal | 1 s | 115 u/s | 5 / 15 | 20 | 1,2 s | radio 5 |
| Experto | 0,65 s | 150 u/s | 7 / 21 | 25 | 0,9 s | radio 6 |

El cañón causa un punto por proyectil. Los enemigos básicos tienen 7 puntos por impacto táctico original y los núcleos 30, multiplicados por 0,8 / 1 / 1,25 según dificultad, redondeando hacia arriba. Un misil dirigido causa tres puntos, con recarga de 0,45 s y alcance 500; no se añaden límites de munición. Los blancos muestran barra de resistencia. Generadores y jefes secuenciales conservan sus bloqueos. Sensores, ANB y pasos requieren una activación dirigida; no se destruyen con cañón ni suman bajas. El cañón usa identificación amiga y no daña civiles o escoltas; seleccionarlos explícitamente con el misil sigue provocando derrota. En la franja de maniobra el toque solo inicia el arrastre para evitar disparar sobre el transporte al mover la aeronave.

X o Contramedida elimina todos los proyectiles enemigos presentes y concede al menos un segundo de invulnerabilidad. Hay tres usos por intento; reiniciar recupera vida, tiempo y cargas. La contramedida no destruye blancos, no completa secundarios y no cambia directamente la historia. La dificultad se guarda aparte (`electrosphere.difficulty`), no modifica el esquema de campaña y no puede cambiarse durante un combate activo.

Victoria: completar todos los principales con vida y tiempo. Derrota: integridad cero, tiempo agotado, daño acumulado del corredor o fuego dirigido sobre protegidos. Los secundarios deben resolverse antes del último principal. Se mantienen las mismas siete bifurcaciones por desempeño y las decisiones narrativas; completar una simulación no cambia la campaña. La colisión usa segmentos y subpasos de 1/120 s; una interrupción larga procesa hasta dos segundos de movimiento y descuenta todo el tiempo real del reloj.

## Referencia táctica anterior (v0.2)

La tabla siguiente describe el modo táctico conservado en la API y sus pruebas de regresión. En la interfaz v0.3 se aplican los cambios de resistencia, proyectiles y protección explicados arriba.

Todas usan el radar 720×420 escalado a la pantalla. Apuntar: clic/toque o lista de objetivos; virar: ←/→, A/D o botones táctiles. Pausar/Reanudar congela la operación y abrir el archivo u ocultar la pestaña también la pausa. El alcance es 500 unidades y la recarga 0,45 segundos. Las cantidades y los tiempos son de esta adaptación.

| Mecánica | Objetivo jugable | Victoria | Derrota | Efecto narrativo |
|---|---|---|---|---|
| Intercepción | Neutralizar blancos aéreos | Todos los principales | Tiempo, integridad o fuego a civiles | Abre informe; 24 y 48 consultan secundarios |
| Instalaciones | Destruir blancos estacionarios | Todos los principales | Tiempo o integridad | 34 y 39 consultan secundarios |
| Naval | Neutralizar buques marcados y distinguir civiles | Todos los principales | Tiempo, integridad o fuego a civiles | La lancha de 20 abre otra misión |
| Tren | Detener segmentos en movimiento lateral | Todos los segmentos | Tiempo o integridad | Continúa 12→13 |
| Escolta | Interceptar amenazas del corredor protegido | Todos los principales con integridad positiva | Tres penetraciones del corredor, tiempo o integridad | En 09 abre la decisión sobre el transporte |
| Reconocimiento | Registrar puntos sin destruirlos | Todos los registros principales | Tiempo | En 06 descubrir la señal secundaria abre 07 |
| Contenedores | Interceptar antes del suelo | Todos los principales | Las fugas consumen integridad; tiempo | Continúa el arco común |
| Contención ANB | Neutralizar concentraciones | Todas las nubes | Tiempo | Continúa sin sumar derribos |
| Navegación | Cruzar pasos en orden | Todos los pasos y, en 31, sus soportes | Daño al permanecer fuera del corredor o tiempo | Continúa Geofront; no reproduce vuelo 3D |
| Orbital | Desactivar satélites de dos impactos | Cuatro satélites | Tiempo | 41→43 |
| Asalto por fases | Eliminar generadores y núcleos secuenciales de tres impactos | Todos los principales | Tiempo o integridad | 30 consulta el daño secundario al Night Raven; otros cierran etapas/finales |

Los contactos civiles verdes pueden aparecer en 04, 15 y 20. El contacto protegido de escolta se representa de forma separada de los blancos; dispararle causa derrota. En Fragile Cargo los obstáculos son estacionarios. Los objetivos que atraviesan el corredor reducen la integridad y reaparecen, para permitir recuperar un intento que todavía tenga margen.

Los objetivos secundarios se ofrecen desde el inicio, incluso cuando el evento equivalente era una fase posterior del original. Completa los secundarios antes del último principal. Al ganar se termina la misión y se fija el resultado; no puedes seguir acumulándolos desde el informe.

## v0.8 · Radio, desenlace y encuentros

Registro de misión abre un panel que pausa combate y animación. Solo muestra comunicaciones activadas; el archivo ofrece última victoria y último intento por campaña/simulador. Cerrar el panel restablece el reloj. La radio visible conserva dos avisos recientes y el registro conserva todo el intento. Advertencias únicas de integridad: 50 % y 25 %.

Victoria: salida animada de 1,8 s y explosiones en estructuras; derrota: humo/daño durante 2 s. Controles y daño se detienen al resolver; el renderizado continúa. Omitir animación y movimiento reducido llevan al resumen. Continuar al informe requiere pulsación; Reiniciar misión genera un intento nuevo. La demo histórica conserva su transición original.

Los encuentros ordinarios pueden variar ±1 enemigo, mínimo 3, y 1–3 oleadas con al menos dos por oleada. Se añade 15 s por enemigo adicional y 8 s por oleada adicional, con techo de 25 % sobre la base. Reconocimiento, contención, escoltas, orbitales, túneles y jefes conservan sus condiciones; las operaciones con blancos narrativos específicos también fijan sus fases. Secundarios, civiles y secuencia de jefes no varían. Cada semilla tiene flujos separados de terreno, encuentros y misiles.

Los fondos originales de Canvas se generan una vez por intento y cubren también la franja inferior. Ciudad, montaña, costa, instalaciones, órbita, túnel y red digital son decorativos: los objetos de colisión siguen siendo los contactos marcados.

Se añaden fases específicas: embarcación de Fragile Cargo, ANB sobre Rena en Bug Hunt, cohete en Technology Transfer, misil de Claustrophobia y Liquidation, base/defensa aérea en Utopian Dreams y extracción terrestre en Reality Distortion. Counterrevolution encadena aproximación, Sphyrna y Dision. Radio Silence reserva Cynthia para la última fase. Los enlaces Aeon de Sole Survivor representan interferencia. Ver MISSION_REVIEW.md para diferencias respecto del original.


## v0.8.1 · Prioridad de comunicaciones

Bajo el campo aparecen las dos últimas intervenciones de personajes o mando argumental. Los cambios procedurales se muestran en el indicador de fase; integridad y confirmaciones ocupan una franja compacta separada. Estos avisos no expulsan a los personajes del panel ni usan retratos. Se mantiene formación, cobertura, objetivo e intercepción cuando ayudan a dar una orden concreta.

Registro de misión ofrece Conversaciones (personajes y mando), Sistema y Todo. Cambiar filtro conserva pausa y paneles desplegados. El orden y el tiempo son los del intento; ningún filtro activa mensajes nuevos. Los snapshots antiguos se clasifican al consultar, sin modificar el texto guardado. No se cambian controles, condiciones de victoria/derrota ni bifurcaciones.
