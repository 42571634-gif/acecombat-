import test from 'node:test';
import assert from 'node:assert/strict';
import { missions } from '../src/legacy/missions.js';
import { createFlight, advanceFlight, fireMissile } from '../src/combat.js';

test('El reloj, la recarga y el movimiento usan tiempo transcurrido real', () => {
  const slow = createFlight('awakening', missions.awakening, 0, () => .5);
  const fast = createFlight('awakening', missions.awakening, 0, () => .5);
  slow.cooldown = fast.cooldown = .45;
  for (let time = 100; time <= 1000; time += 100) advanceFlight(fast, time, { KeyA: true });
  advanceFlight(slow, 1000, { KeyA: true });
  assert.ok(Math.abs(slow.t - fast.t) < 1e-9);
  assert.equal(slow.t, 54);
  assert.ok(Math.abs(slow.x - fast.x) < 1e-9);
  assert.ok(Math.abs(slow.targets[0].y - fast.targets[0].y) < 1e-9);
  assert.equal(slow.cooldown, 0);
});

test('Se puede ganar apuntando y la recarga impide disparos simultáneos', () => {
  const flight = createFlight('awakening', missions.awakening, 0, () => .5);
  let time = 0;
  for (const target of flight.targets) {
    assert.equal(fireMissile(flight, target.x, target.y), true);
    assert.equal(fireMissile(flight, target.x, target.y), false);
    time += 500;
    advanceFlight(flight, time);
  }
  assert.equal(flight.status, 'victory');
  assert.equal(flight.kills, 5);
});

test('El límite de tiempo bloquea disparos y un nuevo intento restablece todos los valores', () => {
  const flight = createFlight('awakening', missions.awakening, 0, () => .5);
  fireMissile(flight, flight.targets[0].x, flight.targets[0].y);
  advanceFlight(flight, 55000);
  assert.equal(flight.status, 'defeat');
  assert.equal(flight.t, 0);
  assert.equal(fireMissile(flight, flight.targets[1].x, flight.targets[1].y), false);
  const retry = createFlight('awakening', missions.awakening, 55000, () => .5);
  assert.equal(retry.kills, 0);
  assert.equal(retry.hp, 100);
  assert.equal(retry.t, 55);
  assert.equal(retry.cooldown, 0);
  assert.equal(retry.keyL, false);
});
