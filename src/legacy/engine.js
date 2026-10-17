import { story } from './story.js?v=0.4.0';
import { missions } from './missions.js?v=0.4.0';

export const SAVE_VERSION = 1;
export const FACTIONS = ['UPEO', 'GR', 'NEUCOM', 'OUROBOROS'];

const validFactionRule = rule => rule && Object.keys(rule).length === 1 && FACTIONS.includes(rule.faction);

export function validateGraph(nodes = story, catalog = missions) {
  const errors = [];
  const edges = new Map();
  if (!nodes.intro) errors.push('Falta el nodo inicial intro.');
  for (const [id, node] of Object.entries(nodes)) {
    const destinations = [];
    if (node.kind === 'dialogue') {
      if (!Array.isArray(node.options) || !node.options.length) errors.push(`${id}: diálogo sin opciones.`);
      const ids = new Set();
      for (const option of Array.isArray(node.options) ? node.options : []) {
        if (!option.id || ids.has(option.id)) errors.push(`${id}: opción duplicada o sin identificador.`);
        ids.add(option.id);
        if (typeof option.text !== 'string' || !option.text.trim()) errors.push(`${id}: opción sin texto.`);
        if (option.effects && !validFactionRule(option.effects)) errors.push(`${id}: efectos inválidos.`);
        if (option.requires && !validFactionRule(option.requires)) errors.push(`${id}: condiciones inválidas.`);
        destinations.push(option.next);
      }
    } else if (node.kind === 'mission') {
      const mission = catalog[node.mission];
      if (!mission || !Number.isInteger(mission.total) || mission.total <= 0 || !Number.isFinite(mission.time) || mission.time <= 0)
        errors.push(`${id}: misión inexistente o inválida.`);
      destinations.push(node.next);
    } else if (node.kind === 'ending') {
      if (!node.label || !node.description) errors.push(`${id}: final incompleto.`);
      if (node.next || node.options) errors.push(`${id}: un final no puede tener salidas.`);
    } else errors.push(`${id}: tipo desconocido.`);
    for (const next of destinations) if (!Object.hasOwn(nodes, next)) errors.push(`${id}: destino inexistente ${next}.`);
    edges.set(id, destinations);
  }
  const reached = new Set();
  const visit = id => {
    if (reached.has(id) || !Object.hasOwn(nodes, id)) return;
    reached.add(id);
    for (const next of edges.get(id) || []) visit(next);
  };
  visit('intro');
  for (const id of Object.keys(nodes)) if (!reached.has(id)) errors.push(`${id}: nodo inaccesible.`);
  return errors;
}

export function createCampaign() {
  return { version: SAVE_VERSION, node: 'intro', faction: 'UPEO', decisions: [], results: [], history: [] };
}

export function currentNode(state) {
  if (!Object.hasOwn(story, state.node)) throw new Error(`Nodo inexistente: ${state.node}`);
  return story[state.node];
}

export function canChoose(state, option) {
  return !option.requires || state.faction === option.requires.faction;
}

export function chooseOption(state, optionId) {
  const node = currentNode(state);
  if (node.kind !== 'dialogue') throw new Error('No hay decisiones disponibles en este nodo.');
  const option = node.options.find(item => item.id === optionId);
  if (!option || !canChoose(state, option)) throw new Error('Decisión inexistente o no disponible.');
  if (!Object.hasOwn(story, option.next)) throw new Error(`Destino inexistente: ${option.next}`);
  const faction = option.effects?.faction || state.faction;
  return {
    ...state, node: option.next, faction,
    decisions: [...state.decisions, { node: state.node, option: option.id, factionBefore: state.faction, factionAfter: faction }],
    history: [...state.history, { type: 'choice', node: state.node, option: option.id }],
  };
}

export function resolveMission(state, outcome) {
  const node = currentNode(state);
  if (node.kind !== 'mission') throw new Error('No hay una misión en curso.');
  const mission = missions[node.mission];
  if (!outcome || !['victory', 'defeat'].includes(outcome.status) ||
      !Number.isInteger(outcome.kills) || outcome.kills < 0 || outcome.kills > mission.total ||
      !Number.isFinite(outcome.integrity) || outcome.integrity < 0 || outcome.integrity > 100 ||
      !Number.isFinite(outcome.timeRemaining) || outcome.timeRemaining < 0 || outcome.timeRemaining > mission.time ||
      (outcome.status === 'victory' && (outcome.kills !== mission.total || outcome.integrity <= 0 || outcome.timeRemaining <= 0)) ||
      (outcome.status === 'defeat' && (outcome.kills === mission.total || (outcome.timeRemaining > 0 && outcome.integrity > 0))))
    throw new Error('Resultado de misión inválido.');
  const result = { mission: node.mission, status: outcome.status, kills: outcome.kills, integrity: outcome.integrity, timeRemaining: outcome.timeRemaining };
  return {
    ...state, node: outcome.status === 'victory' ? node.next : state.node,
    results: [...state.results, result],
    history: [...state.history, { type: 'mission', node: state.node, result }],
  };
}

export function campaignSummary(state) {
  const completed = state.results.filter(result => result.status === 'victory');
  return { missionCount: completed.length, kills: completed.reduce((sum, result) => sum + result.kills, 0) };
}

// Reproducir el historial detecta nodos imposibles, decisiones manipuladas y contadores incoherentes.
export function validateCampaign(candidate) {
  if (!candidate || candidate.version !== SAVE_VERSION) throw new Error('Versión de partida no compatible.');
  if (!Array.isArray(candidate.history) || candidate.history.length > 1000) throw new Error('Historial inválido.');
  let replay = createCampaign();
  for (const event of candidate.history) {
    if (!event || event.node !== replay.node) throw new Error('El historial no corresponde a la ruta.');
    if (event.type === 'choice') replay = chooseOption(replay, event.option);
    else if (event.type === 'mission') replay = resolveMission(replay, event.result);
    else throw new Error('Evento de historial desconocido.');
  }
  const stable = value => JSON.stringify(value, function (key, item) {
    if (item && typeof item === 'object' && !Array.isArray(item))
      return Object.fromEntries(Object.keys(item).sort().map(name => [name, item[name]]));
    return item;
  });
  if (stable(replay) !== stable(candidate)) throw new Error('La partida contiene datos incoherentes.');
  return replay;
}
