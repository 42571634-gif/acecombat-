// Texto original conservado. Adaptación abreviada; no es un guion canónico verificado.
export const story = {
  "intro": {
    "tag": "Prólogo · Strangereal, 2040",
    "title": "Una guerra sin países",
    "body": "General Resource y Neucom compiten por el poder tecnológico y económico. UPEO intenta mantener la paz, mientras su escuadrón SARF prepara una nueva operación. Tú eres Nemo, un piloto del que nadie sabe demasiado.",
    "speaker": [
      "Fiona Chris Fitzgerald",
      "Nemo, tenemos actividad aérea no autorizada sobre Expo City. Prepárate para la primera salida."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Iniciar la campaña",
        "next": "awakeningIntro"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "awakeningCombat": {
    "kind": "mission",
    "mission": "awakening",
    "next": "afterAwakening",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "awakeningIntro": {
    "tag": "UPEO · Expediente 01",
    "title": "Awakening",
    "body": "La tensión entre corporaciones escala cuando aparatos de Neucom entran en una zona restringida. Rena Hirose dirige al equipo; Erich y Fiona acompañan al nuevo piloto.",
    "speaker": [
      "Rena Hirose",
      "Las órdenes son claras: interceptar y evitar que esto se convierta en una guerra abierta."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Despegar · misión aérea",
        "next": "awakeningCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "afterAwakening": {
    "tag": "Informe de misión",
    "title": "La primera escaramuza",
    "body": "El incidente ha terminado, pero la tensión crece. El alto mando incorpora al equipo a SARF, la fuerza de reacción de UPEO. Una señal electrónica afecta las rutas aéreas.",
    "speaker": [
      "Erich Jaeger",
      "No parece un incidente aislado. Nos están empujando a tomar partido."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Continuar · Bravado",
        "next": "bravadoIntro"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "bravadoCombat": {
    "kind": "mission",
    "mission": "bravado",
    "next": "afterBravado",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "bravadoIntro": {
    "tag": "UPEO · Expediente 02",
    "title": "Bravado",
    "body": "Una instalación vinculada a Neucom interfiere con el tráfico en una región montañosa. SARF recibe órdenes de neutralizar los sistemas.",
    "speaker": [
      "Fiona Chris Fitzgerald",
      "Si cancelamos la interferencia podremos proteger el tráfico civil."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Despegar · neutralización",
        "next": "bravadoCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "afterBravado": {
    "tag": "Informe de misión",
    "title": "El as de General Resource",
    "body": "El piloto Abyssal Dision es presentado como aliado temporal. Su reputación impresiona a UPEO, pero sus convicciones parecen distantes de las del mando.",
    "speaker": [
      "Abyssal Dision",
      "No todos los conflictos se resuelven esperando instrucciones de una autoridad."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Conocer a Dision",
        "next": "enterIntro"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "enterCombat": {
    "kind": "mission",
    "mission": "enter",
    "next": "afterEnter",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "enterIntro": {
    "tag": "UPEO · Expediente 03",
    "title": "Enter Dision",
    "body": "Una práctica con Dision y Keith Bryan se convierte en misión real cuando se detectan contenedores peligrosos en el cielo.",
    "speaker": [
      "Keith Bryan",
      "Evitemos daños en tierra. El objetivo no es lucirse, es proteger la ciudad."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Despegar · operación precisa",
        "next": "enterCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "afterEnter": {
    "tag": "Transmisión entrante",
    "title": "Fragilidad del alto el fuego",
    "body": "Aunque los encuentros terminan, ambas empresas concentran sus fuerzas. UPEO prepara una operación decisiva cerca de Megafloat.",
    "speaker": [
      "Rena Hirose",
      "Con cada misión aumentan las preguntas y disminuyen las respuestas."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Continuar · Paper Tiger",
        "next": "paperIntro"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "paperCombat": {
    "kind": "mission",
    "mission": "paper",
    "next": "turning",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "paperIntro": {
    "tag": "UPEO · Punto de inflexión",
    "title": "Paper Tiger",
    "body": "SARF y pilotos de General Resource enfrentan una concentración militar de Neucom. El resultado provoca nuevas negociaciones, pero Dision rechaza el papel de los políticos.",
    "speaker": [
      "Abyssal Dision",
      "Cuando esto termine, tendrás que decidir de qué lado quieres volar."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Despegar · combate",
        "next": "paperCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "turning": {
    "tag": "Decisión importante",
    "title": "¿A quién seguirás?",
    "body": "Tras el alto el fuego, Dision invita a Nemo a abandonar UPEO y unirse a General Resource. Es el primer gran punto de decisión de la edición japonesa.",
    "speaker": [
      "Abyssal Dision",
      "Quiero pilotos que actúen, no que obedezcan sin preguntarse por qué."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Mantener la lealtad a UPEO",
        "next": "upeoIntro",
        "effects": {
          "faction": "UPEO"
        }
      },
      {
        "id": "choice-2",
        "text": "Seguir a Dision a General Resource",
        "next": "generalIntro",
        "effects": {
          "faction": "GR"
        }
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "upeoCombat": {
    "kind": "mission",
    "mission": "upeo",
    "next": "upeoChoice",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "upeoIntro": {
    "tag": "Ruta UPEO",
    "title": "Lealtad bajo sospecha",
    "body": "Las fisuras internas de UPEO y las maniobras de Ouroboros amenazan a SARF. La confianza en sus superiores se debilita. En esta adaptación se condensa una serie de misiones posteriores.",
    "speaker": [
      "Erich Jaeger",
      "No me preocupa solo el enemigo que vemos. También las órdenes que recibimos."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Volver al combate",
        "next": "upeoCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "upeoChoiceEnding": {
    "kind": "ending",
    "label": "UPEO",
    "description": "La supervivencia del escuadrón abre una posibilidad de reconstrucción. Sin embargo, el origen de la guerra sigue oculto.",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "upeoChoice": {
    "tag": "Ruta UPEO · Epílogo",
    "title": "El precio de obedecer",
    "body": "Nemo puede sostener su compromiso con UPEO y enfrentar la conspiración desde dentro, o explorar otra perspectiva corporativa en una nueva partida.",
    "speaker": [
      "Rena Hirose",
      "Una institución puede fallar. Eso no significa que toda persona dentro de ella deba fallar también."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Concluir ruta UPEO",
        "next": "upeoChoiceEnding"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "generalCombat": {
    "kind": "mission",
    "mission": "general",
    "next": "generalChoice",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "generalIntro": {
    "tag": "Ruta General Resource",
    "title": "Una lealtad corporativa",
    "body": "Nemo acompaña a Dision y Keith en operaciones contra Neucom. La promesa de controlar el conflicto empieza a parecer una justificación para agravarlo.",
    "speaker": [
      "Keith Bryan",
      "La compañía nos llama defensores de su seguridad. ¿Hasta dónde seguirá siendo cierto?"
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Despegar · Petrol Coast",
        "next": "generalCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "generalChoiceEnding": {
    "kind": "ending",
    "label": "General Resource",
    "description": "Nemo permanece junto a Keith y combate una guerra de empresas, descubriendo que sus victorias militares no resuelven la tragedia política.",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "generalChoice": {
    "tag": "Segundo punto de inflexión",
    "title": "Disión rompe filas",
    "body": "Dision te propone abandonar General Resource y unirte a Ouroboros, organización que pretende provocar una transformación radical del mundo.",
    "speaker": [
      "Abyssal Dision",
      "No se trata de elegir entre dos compañías. Se trata de cambiar las reglas."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Permanecer con Keith en General Resource",
        "next": "generalChoiceEnding",
        "requires": {
          "faction": "GR"
        }
      },
      {
        "id": "choice-2",
        "text": "Seguir a Dision hacia Ouroboros",
        "next": "ourodisIntro",
        "effects": {
          "faction": "OUROBOROS"
        },
        "requires": {
          "faction": "GR"
        }
      },
      {
        "id": "choice-3",
        "text": "Explorar la perspectiva Neucom (ruta abreviada)",
        "next": "neucomIntro",
        "effects": {
          "faction": "NEUCOM"
        },
        "requires": {
          "faction": "GR"
        }
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "neucomCombat": {
    "kind": "mission",
    "mission": "neucom",
    "next": "neucomChoice",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "neucomIntro": {
    "tag": "Ruta Neucom · Adaptación abreviada",
    "title": "Otro orden mundial",
    "body": "En el videojuego original, llegar a Neucom exige una secuencia de deserciones distinta. Aquí existe un acceso abreviado para probar la mecánica. Fiona y Cynthia muestran visiones opuestas del futuro.",
    "speaker": [
      "Cynthia Bridgitte Fitzgerald",
      "Una tecnología revolucionaria no sirve de nada si dejamos que otros decidan cómo utilizarla."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Despegar · White Valley",
        "next": "neucomCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "neucomChoiceEnding": {
    "kind": "ending",
    "label": "Neucom",
    "description": "Nemo sigue con Fiona y ayuda a frenar la escalada. La innovación ha demostrado ser tan capaz de destruir como de construir.",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "neucomChoice": {
    "tag": "Ruta Neucom · Decisión",
    "title": "La ruptura de Cynthia",
    "body": "Ouroboros irrumpe en el conflicto. Fiona y Cynthia discrepan profundamente sobre qué hacer a continuación.",
    "speaker": [
      "Fiona Chris Fitzgerald",
      "No quiero que nuestras decisiones terminen destruyendo aquello que intentamos proteger."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Permanecer con Fiona en Neucom",
        "next": "neucomChoiceEnding",
        "requires": {
          "faction": "NEUCOM"
        }
      },
      {
        "id": "choice-2",
        "text": "Seguir a Cynthia hacia Ouroboros",
        "next": "ourocynIntro",
        "effects": {
          "faction": "OUROBOROS"
        },
        "requires": {
          "faction": "NEUCOM"
        }
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "ourodisCombat": {
    "kind": "mission",
    "mission": "ourodis",
    "next": "ourodisEnd",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "ourodisIntro": {
    "tag": "Ruta Ouroboros · Dision",
    "title": "Revolución artificial",
    "body": "Bajo el liderazgo de Ouroboros, Nemo descubre que el proyecto de Dision implica tecnologías que desdibujan el límite entre mente, máquina y realidad.",
    "speaker": [
      "Abyssal Dision",
      "Los cuerpos se extinguen. Las ideas pueden encontrar otros medios para sobrevivir."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Despegar · Geofront",
        "next": "ourodisCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "ourodisEndEnding": {
    "kind": "ending",
    "label": "Ouroboros · Dision",
    "description": "La revolución alcanza su punto crítico, pero la voluntad de Dision enfrenta límites que él mismo no anticipó.",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "ourodisEnd": {
    "tag": "Ruta Ouroboros · Epílogo",
    "title": "La paradoja del revolucionario",
    "body": "La campaña termina revelando que ni la identidad ni la autonomía son conceptos estables en un mundo de inteligencia digitalizada.",
    "speaker": [
      "Nemo · Sistema",
      "La información recibida es incompatible con la versión oficial."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Concluir ruta Ouroboros (Dision)",
        "next": "ourodisEndEnding"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "ourocynCombat": {
    "kind": "mission",
    "mission": "ourocyn",
    "next": "ourocynEnd",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "ourocynIntro": {
    "tag": "Ruta Ouroboros · Cynthia",
    "title": "Distorsión de la realidad",
    "body": "Cynthia se enfrenta a las consecuencias del proyecto Ouroboros y la utilización de Rena y su aeronave experimental Night Raven.",
    "speaker": [
      "Cynthia Bridgitte Fitzgerald",
      "Si olvidamos a las personas, ¿qué sentido tendría alcanzar un nuevo nivel de existencia?"
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Despegar · Interceptar drones",
        "next": "ourocynCombat"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "ourocynEndEnding": {
    "kind": "ending",
    "label": "Ouroboros · Cynthia",
    "description": "Una alianza improbable evita una catástrofe, aunque deja abierta la pregunta sobre la verdadera naturaleza de Nemo.",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  },
  "ourocynEnd": {
    "tag": "Ruta Ouroboros · Epílogo",
    "title": "Conciencia y consecuencia",
    "body": "Nemo y Cynthia tienen que confrontar las ambiciones de Ouroboros, el Night Raven y las decisiones que los llevaron hasta aquí.",
    "speaker": [
      "Cynthia Bridgitte Fitzgerald",
      "Una elección solo importa si estamos dispuestos a vivir con sus consecuencias."
    ],
    "options": [
      {
        "id": "choice-1",
        "text": "Concluir ruta Ouroboros (Cynthia)",
        "next": "ourocynEndEnding"
      }
    ],
    "kind": "dialogue",
    "source": "Prototipo original; contenido canónico pendiente de verificación",
    "confidence": "unverified",
    "adaptation": true
  }
};
