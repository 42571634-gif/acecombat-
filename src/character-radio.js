import { dialogueLine } from './characters.js?v=0.8.1';
// Recreaciones españolas breves. Secciones y sincronización adaptada: docs/VOICE_REVIEW.md.
const lines=(...tuples)=>tuples.map(dialogueLine);
export const phaseConversations={
 m08:{0:lines(['fiona','Otra vez alguien pone en peligro a una ciudad para imponer lo que quiere. ¿Cuándo van a parar?'],['erich','Y a nosotros nos toca arreglarlo. Vamos, antes de que ese dirigible llegue a los edificios.']),1:lines(['erich','¡La embarcación se está alejando! No podemos dejarla escapar.'],['fiona','La tengo a la vista. Vamos a por ella.'])},
 m10:{0:lines(['erich','Después de lo del transporte… ¿para qué seguimos haciendo esto?'],['rena','Yo necesito seguir volando, Erich. Es lo que me queda.'])},
 m13:{1:lines(['rena','No te acerques… Me duele la cabeza. Algo está entrando en mis sistemas.'],['erich','¡Rena está contaminada! Nemo, aplica ANB sobre su avión. ¡Ahora!'])},
 m14:{0:lines(['erich','Se nota la diferencia con estos aviones de Neucom.'],['rena','También llevamos sus colores. ¿Qué creerán que están viendo desde tierra?'])},
 m17:{2:lines(['erich','Déjame terminar el ataque, Nemo. Todavía le debo esto a Rena.'])},
 m18:{2:lines(['erich','¡Se ha abierto la entrada! Park, esta vez vamos a encontrarte.'])},
 m21:{0:lines(['dision','No te distraigas con los interceptores. Lo que busco está en el hangar oculto.'])},
 m22:{0:lines(['keith','Dision tampoco aparece hoy. Nos toca demostrar que podemos hacerlo sin él.'])},
 m24:{0:lines(['keith','¿Qué tal se ve todo desde ahí arriba, Nemo? Yo me quedo con el ataque desde abajo.'])},
 m30:{2:lines(['keith','¡Dision! Sé que estás ahí. Sal de una vez y deja de esconderte detrás del Sphyrna.'])},
 m32:{2:lines(['keith','Ya no tiene la ventaja de antes. Esta vez no voy a dejar que se nos escape.']),3:lines(['control','Night Raven derribado. Se ha identificado el avión de Dision: intercepten ese segundo contacto.'],['keith','Dision sigue volando. Voy a por él; no pienso dejar esto sin resolver.'])},
 m36:{2:lines(['dision','Park, hemos llegado a tu cuartel. Tu alianza conmigo no iba a protegerte para siempre.'])},
 m37:{2:lines(['rena','Mis recuerdos… No sé quién soy. ¡Ayúdame!'],['keith','Mi avión ha quedado atrapado en el Night Raven. Nemo, tienes que disparar; es la oportunidad que nos queda.']),3:lines(['keith','Te lo dejo a ti, compañero. Hasta otra.','Última transmisión recibida antes de perder su señal.',true])},
 m45:{1:lines(['cynthia','¡El Night Raven ha atacado Megafloat! Nemo, tenemos que detener al Sphyrna.']),2:lines(['cynthia','Dision está saliendo del Sphyrna. No voy a dejar que se marche después de lo que ha hecho.'])},
 m47:{1:lines(['simon','Los generadores Aeon de la ciudad le dan esa velocidad. Destrúyelos y ya no podrá escapar de la misma manera.'],['cynthia','He localizado los generadores. Nemo, cambiamos de blanco.']),2:lines(['cynthia','¡Ya no se mueve igual! Esta es nuestra oportunidad; no le demos tiempo a recuperarse.'])},
 m48:{1:lines(['fiona','¡Cynthia, vuelve! No quiero seguir disparando para conseguir hablar contigo.'])},
 m50:{2:lines(['fiona','No voy a permitir que el Sphyrna siga haciendo esto. Nemo, terminemos el ataque.'])},
 m52:{1:lines(['simon','Voy a repetir la interferencia. Prepárate: la oportunidad dura poco.']),2:lines(['fiona','¡Ahora, Nemo! No lo dejemos escapar otra vez.']),3:lines(['control','El otro fugitivo es Dision. Sigan su avión.'],['fiona','Dision… Todo esto nos ha traído hasta ti.'],['simon','Detenlo antes de que pueda refugiarse en la Electrosphere.'])},
};
// Eventos condicionales: no exigen esperar segundos adicionales ni añaden mensajes futuros al registro.
export const contextualRadio={
 m06:[{id:'valley-memory',when:'progress',lines:lines(['rena','Este valle… recuerdo haber estado aquí con alguien. Pero no consigo recordar cuándo.'])}],
 m07:[{id:'raven-claim',when:'progress',lines:lines(['rena','Dision, el Night Raven no te pertenece. No voy a dejar que vuelvas a quitármelo.'])}],
 m16:[{id:'rena-sighting',when:'progress',lines:lines(['erich','¡Ahí está Rena! Nemo, tenemos que llegar hasta ella.'])}],
 m21:[{id:'rena-encounter',when:'progress',lines:lines(['rena','¿Dision? ¿Qué haces en este lugar?'],['dision','He venido a comprobar si aquella aeronave sigue aquí.'],['rena','Entonces… ¿todavía existe?'])}],
 m24:[{id:'keith-help',when:'secondary',lines:lines(['keith','Ya puedo quitarme al atacante de encima. Nemo, no olvidaré que has venido a ayudarme.'])}],
 m37:[{id:'dision-loss',when:'victory',lines:lines(['dision','Rena, el Night Raven, Ouroboros… Estoy perdiendo todo lo que había preparado.'])}],
 m38:[{id:'simon-revelation',when:'victory',lines:lines(['dision','Ahora lo entiendo… Simon. Tú estás detrás de esto.'])}],
};
export const sourceForRadio=id=>({url:`https://w.atwiki.jp/acacac/pages/${Number(id.slice(1))+10}.html`,title:'Comunicación de la misión original'});
export const channelForRadio=(id,message)=>message.character==='control'?'control':
 (id==='m21'&&message.character==='rena'||id==='m37'&&['rena','dision'].includes(message.character)||id==='m38'&&message.character==='dision')?'enemy':'allied';
