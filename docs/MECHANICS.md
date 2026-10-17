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
