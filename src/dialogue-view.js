import { characters } from './characters.js?v=0.8.0';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function messageMarkup(message){
  if(message.kind==='narration')return `<aside class="scene-narration" aria-label="Narración"><span>${escape(message.label||'Escena')}</span><p>${escape(message.text)}</p></aside>`;
  const character=characters[message.character],portrait=character?.portrait;
  return `<div class="speaker" data-character="${escape(message.character||'legacy')}"><div class="avatar" aria-hidden="true"><span>${escape(character?.initials||'◈')}</span>${portrait?`<img data-portrait src="${escape(portrait)}" alt="" width="72" height="72" loading="lazy" decoding="async">`:''}</div><div><b>${escape(message.speaker)}${message.recorded?' · grabación':''}</b>${message.direction?`<p class="direction">${escape(message.direction)}</p>`:''}<p>${escape(message.text)}</p></div></div>`;
}
export function bindPortraits(root){
  for(const img of root?.querySelectorAll?.('img[data-portrait]')||[]){
    img.onerror=()=>{img.hidden=true;};
    if(img.complete&&img.naturalWidth===0)img.hidden=true;
  }
}
