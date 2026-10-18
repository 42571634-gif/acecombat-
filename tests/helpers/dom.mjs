import assert from 'node:assert/strict';
import { createApp } from '../../src/game.js';
// DOM y reloj controlados: se ejercitan los mismos eventos de la interfaz sin dependencias.
export function environment(storage, {campaignId="jp52",battleMode='tactical',animation=false,reducedMotion=false}={}) {
  const values = new Map();
  storage ||= { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const elements = new Map();
  const listeners = new Map();
  const intervals = new Map();
  const delays = new Map();
  const frames = new Map();
  let clock = 0, sequence = 0, attemptSequence=0;
  const drawing = { targets: [], x: 360 };
  const ctx = new Proxy({}, { get: (_, name) => (...args) => {
    if (name === 'clearRect') drawing.targets = [];
    if (name === 'strokeRect') drawing.targets.push({ x: args[0] + 13, y: args[1] + 13 });
    if (name === 'translate'&&args[1]>=280) drawing.x = args[0];
  }});
  function element(id) {
    let html = '';
    const item = {
      textContent: '', value: '', hidden:true, children: [], disabled: false,
      classList: { toggle() {} }, appendChild(child) { this.children.push(child); }, insertBefore(child) { this.children.push(child); },
      getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width: 720, height: 420 }),
      setPointerCapture() {},
      get innerHTML() { return html; },
      set innerHTML(value) {
        html = value;
        item.children = [];
        for (const match of value.matchAll(/id="([^"]+)"/g)) elements.set(match[1], element(match[1]));
      },
    };
    if (id) elements.set(id, item);
    return item;
  }
  for (const id of ['main', 'loyalty', 'missions', 'kills', 'state', 'save', 'load', 'reset', 'saveStatus', 'rUPEO', 'rGR', 'rNEU', 'rOURO', 'mode', 'chapter', 'collection', 'career', 'archive', 'archivePanel', 'closeArchive', 'archiveList', 'missionSearch', 'returnCampaign', 'continueSimulation']) element(id);
  const document = { hidden: false, getElementById: id => elements.get(id), createElement: () => element(),
    addEventListener: (event, callback) => listeners.set(event, callback) };
  element('difficulty');
  const app = createApp({ document, campaignId, battleMode, window: { addEventListener: (event, callback) => listeners.set(event, callback),matchMedia:()=>({matches:reducedMotion}) }, storage,
    attemptFactory:difficulty=>({seed:++attemptSequence,difficulty,generator:1}),
    requestFrame:animation?callback=>{const id=++sequence;frames.set(id,callback);return id;}:undefined,
    cancelFrame:animation?id=>frames.delete(id):undefined,
    now: () => clock, repeat: callback => { const id = ++sequence; intervals.set(id, callback); return id; },
    stopRepeat: id => intervals.delete(id), delay: callback => { const id = ++sequence; delays.set(id, callback); return id; },
    stopDelay: id => delays.delete(id),
  });
  const env = { app, document, storage, drawing, listeners, intervals, delays,frames,
    get: id => elements.get(id),
    tick(ms = 0) { clock += ms; for (const callback of [...intervals.values()]) callback(); },
    frame(ms=16){clock+=ms;const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(clock);},
    flush() { for (const [id, callback] of [...delays]) { delays.delete(id); callback(); } elements.get('skipOutcome')?.onclick?.();elements.get('continueOutcome')?.onclick?.(); },
    clickChoice(index = 0) { elements.get('actions').children[index].onclick(); },
    actTarget(predicate=()=>true) {
      env.tick(500);
      const button = elements.get("targetActions").children.find(button=>!button.disabled && predicate(button));
      assert.ok(button,"Debe haber un objetivo disponible.");
      button.onclick();
    },
    shoot() {
      env.tick(500);
      const target = drawing.targets[0];
      assert.ok(target, 'Debe haber un blanco visible.');
      elements.get('radar').onpointerdown({ clientX: target.x, clientY: target.y });
    },
  };
  return env;
}

