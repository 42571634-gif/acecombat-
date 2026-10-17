# Retratos y gráficos

Retratos incorporados por petición explícita del usuario, consultados el 17 de octubre de 2026. Autoría y derechos: Namco / Bandai Namco Entertainment. Su publicación en estas fuentes no se presenta como una licencia libre. Son las únicas imágenes del elenco incorporadas: no se añaden cinemáticas, música ni modelos del juego. Los archivos se sirven desde el propio proyecto para evitar dependencias de carga externa.

| Personaje | Archivo local | Fuente |
|---|---|---|
| Rena Hirose | assets/portraits/rena.jpg | [Perfil oficial](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page03.html) |
| Fiona Chris Fitzgerald | assets/portraits/fiona.jpg | [Perfil oficial](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page03.html) |
| Erich Jager | assets/portraits/erich.jpg | [Perfil oficial](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page03.html) |
| Gabriel W. Clarkson | assets/portraits/clarkson.jpg | [Perfil oficial](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page04.html) |
| Gilbert Park | assets/portraits/park.jpg | [Perfil oficial](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page04.html) |
| Abyssal Dision | assets/portraits/dision.jpg | [Perfil oficial](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page05.html) |
| Keith Bryan | assets/portraits/keith.jpg | [Perfil oficial](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page05.html) |
| Cynthia Bridgitte Fitzgerald | assets/portraits/cynthia.jpg | [Perfil oficial](https://www.bandainamcoent.co.jp/cs/list/acecombat3/page05.html) |
| Simon Orestes Cohen | assets/portraits/simon.webp | [Acepedia, retrato Simons-ace3](https://acecombat.fandom.com/wiki/Simon_Orestes_Cohen) |

Los ocho retratos oficiales se conservaron como JPEG sin retocarlos. Simon se descargó en WebP desde el retrato mostrado por el navegador; el servidor rechazó la descarga directa. Los encuadres de interfaz usan CSS. Si falla una imagen, quedan las iniciales del personaje. Control y Registro automático conservan símbolos tipográficos, sin atribuirles una cara inventada.

`assets/portraits/sources.json` conserva las URL directas y sus créditos. `scripts/download-portraits.mjs` documenta la descarga y reutiliza los archivos existentes; el servidor de Simon puede exigir descargar su imagen desde el navegador.

Las siluetas Dardo, Manta y Lince se dibujan con trazados de canvas en `src/enemy-types.js`. Son diseños originales de la adaptación, no reproducciones de modelos de Ace Combat. Su silueta, movimiento, resistencia y patrón de fuego se distinguen en pantalla y en la lista accesible.
