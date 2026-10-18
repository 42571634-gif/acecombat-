# v0.7.1 — contraste directo de Awakening

- Corregida la primera misión contra la página indicada por el usuario: Rena participa y Neucom realiza la ofensiva.
- Sustituidos los transportes intrusos añadidos por contactos de Neucom; radio de refuerzos y cierre con mensajes de Fiona y Rena.
- Documentada la diferencia entre la condición temporal del original y las dos oleadas obligatorias del minijuego. Referencia al índice de 52 capítulos del mismo archivo.
- Conservados combate, rutas y guardados. 60 pruebas aprobadas.

# v0.7 — español claro y continuidad

- Reescritas las 52 escenas y sus informes, introducción, cierres y radio de combate con nombres, acciones y motivos explícitos.
- Ampliadas las escenas 09, 43 y 47 sin imponer una longitud fija. Total: 477 intervenciones habladas.
- Corregidas interferencias y papel de Rena en 09, ruptura de Cynthia en 44 y salida final de Fiona en 52. Separados los acontecimientos previos del golpe posterior en 43.
- Dos citas breves traducidas, con atribución y alcance documentados en TEXT_REVIEW.md; enlaces de fuente por misión.
- Conservados combate, objetivos, rutas y esquema de guardado. 59 pruebas aprobadas.

# v0.6 — operaciones según su objetivo

- Terreno en avance y retorno de blancos supervivientes conservando daño e identidad, sin duplicar bajas.
- Instalaciones, buques, tren, contenedores, satélites y aviones diferenciados; operación 43 con blancos aéreos y flota de 29 con grupos aéreos.
- Misiles con acierto por dificultad y evasión del blanco; fallo visible, recarga consumida y sensores sin azar.
- Transportes aliados que siguen al jugador, bases fijas, integridad independiente y cobertura de proximidad con energía limitada. Corregida la ocultación visual del aliado.
- Todos los jefes con capas exteriores/interiores, núcleos pequeños móviles y compuertas temporizadas; jefes dobles secuenciales.
- Control táctil del cañón automático y de cobertura. Plazos de 90/110/150 segundos para operaciones regulares, con secundarios y jefes.
- Rutas, cantidades de objetivos y guardados conservados. 56 pruebas, incluidas 156 combinaciones de misión/dificultad.

# v0.5.1 — continuidad de escenas

- Narración intercalada sin retrato para cambios de lugar, canal, organización y operaciones posteriores.
- Aclarada la disposición de Fiona, Clarkson, Erich y Nemo durante la escolta; diálogo sin referencias ambiguas a una conversación o a «ella».
- Separada la primera intercepción de la orden de Park, manteniendo el transporte en vuelo.
- Conservados guardados, decisiones y combate. 49 pruebas aprobadas.

# v0.5 — retratos, respuesta y oleadas

- Nueve retratos locales con fuentes y créditos; iniciales como respaldo si falla una imagen.
- Respuesta de objetivos al pulsar, botones persistentes, movimiento inmediato y un único ciclo requestAnimationFrame. Menos reconstrucciones del DOM y recarga de misil visible.
- Quince misiones de dos o tres fases, refuerzos tras eliminar el grupo anterior y radio contextual con retratos bajo el campo.
- Tres enemigos originales: Dardo ágil con disparo dirigido, Manta blindado con cortinas y Lince dron con anillos; siluetas, colores y movimiento propios.
- Conservadas rutas, secundarios, guardados y modo táctico. 47 pruebas aprobadas, incluidas las 156 combinaciones de misión y dificultad.

# v0.4 — voces y guion dramático

- Reescritas las 471 intervenciones de introducción, briefings e informes con rivalidad, afecto, subtexto, contradicciones y voces diferenciadas.
- Investigados perfiles oficiales de Namco y escenas comunitarias clave; añadidas biblia de personajes y fuentes, separando hechos de interpretación creativa.
- Sustituidos los monólogos de Nemo por interlocutores; Nemo permanece silencioso. Control y Registro automático tienen funciones delimitadas.
- Incorporadas iniciales, colores por interlocutor, acotaciones y rótulo de grabación. No se hace hablar en presente a los personajes muertos.
- Añadidos controles de continuidad por ruta y soporte visual probado. Conservados seis turnos previos y tres posteriores en las 52 misiones.
- Combate, dificultades, grafo de decisiones y formato de guardado conservados. Recursos versionados como 0.4.0.

# v0.3 — bullet hell y conversaciones ampliadas

- Combate por defecto con cañón automático, proyectiles enemigos por abanicos dirigidos, cortinas y anillos, movimiento en dos ejes y hitbox visible.
- Tres dificultades con velocidad, densidad, blindaje, daño y ventana de invulnerabilidad diferentes; preferencia local independiente de las partidas.
- Tres contramedidas por intento; precisión con Shift, movimiento táctil por arrastre y botones de cuatro direcciones.
- Conservadas las condiciones de las 52 misiones, objetivos secundarios y cinco finales. El núcleo táctico anterior sigue disponible para las regresiones del motor; la interfaz utiliza bullet hell.
- Triplicadas las intervenciones: introducción 1→3, cada briefing 2→6 y cada informe 1→3 (157→471). Textos originales específicos, fuentes y marcas de adaptación conservadas.
- Versionados recursos como 0.3.0 para actualizar móviles sin reutilizar módulos antiguos.

# v0.2 — campaña japonesa de 52 misiones

- Añadidos 52 capítulos adaptados, 162 nodos y cinco finales con fuentes por misión.
- Sustituido el acceso abreviado General Resource→Neucom por la bifurcación de Scylla and Charybdis en la campaña nueva.
- Añadidas condiciones por objetivos secundarios para las bifurcaciones 06, 20, 24, 30, 34, 39 y 48.
- Añadidas reglas de reconocimiento, escolta, navales, tren, contención, contenedores, órbita, navegación y asaltos por fases, además de intercepción e instalaciones.
- Añadidos archivo con búsqueda, prueba individual de misiones, pausa manual y lista de objetivos accesibles.
- Añadidos guardado separado de simulador y perfil persistente de misiones/finales.
- Migración de esquema 1→2 que conserva la demo anterior como campaña compatible.
- Documentadas fuentes comunitarias, adaptaciones de umbrales y límites de reproducción en RESEARCH.md.

La simulación y las conversaciones son adaptaciones, con objetivos y tiempos simplificados. No se han incorporado transcripciones completas ni recursos del juego.

# Hito 1 — arquitectura, guardado y validación

- Separados datos narrativos y misiones; el motor aplica decisiones declarativas y devuelve estados nuevos.
- Añadido estado de campaña con ruta, decisiones, resultados e historial reproducible.
- Añadidos autoguardado y controles Guardar partida/Continuar guardada con esquema versión 1.
- Añadido rechazo de guardados corruptos, incompatibles o incoherentes y tolerancia a almacenamiento bloqueado.
- Conservados los textos, las nueve misiones y los cinco finales del prototipo, incluido el acceso abreviado a Neucom.
- Corregidos tiempo fijo por fotograma, bajas acumuladas al reintentar, controles retenidos y transiciones pendientes tras reiniciar/cargar.
- El combate se pausa al ocultar la pestaña; cargar durante una misión la reinicia desde su comienzo.
- Migración a módulos JavaScript nativos: se requiere servidor HTTP local o alojamiento estático; no hay dependencias nuevas.

## Verificación

npm run check: comprobación sintáctica de los siete módulos y 18 pruebas automáticas. Incluyen las cinco rutas, una campaña UPEO completa mediante eventos de interfaz, guardado/carga y regresiones de combate.

Comprobación adicional en navegador real: inicio, decisión, recarga, recuperación de escena, carga de misión pendiente, radar y controles visibles. Consola sin errores JavaScript durante la revisión. Vista móvil de 390 px: paneles apilados y sin desbordamiento horizontal. La comprobación de tacto físico en un dispositivo móvil no se ha realizado.

La versión 0.2 incorpora identificadores de versión en CSS y módulos para evitar reutilizar recursos de la demo desde la caché del navegador.
