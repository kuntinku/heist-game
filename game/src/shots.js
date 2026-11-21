// gilded-trust: staged deterministic screenshot scenes.
// ?shot=<name>&seed=<n> sets the room up exactly, renders a single frame, stops.
// Scenes: crossing (cover-to-cover read of the hall), cameras (CCTV sweep caught),
// vault (loot pile in the vault wing), getaway (van glowing, bag on shoulder).
import { MAP } from './level.js';
import { TILE } from './config.js';
import { render } from './render.js';

function centerOf(ch, n = 1) {
  let seen = 0;
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      if (MAP[y][x] === ch) {
        seen++;
        if (seen === n) return { x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 };
      }
    }
  }
  return null;
}

export function takeShot(ctx, game, name) {
  const g = game;
  if (name === 'crossing') {
    g.thief.pos = { ...centerOf('P', 1) };
    g.thief.dir = -0.6;
    g.thief.mode = 'sneak';
    g.guards[0].pos = { x: 15 * TILE, y: 3 * TILE };
    g.guards[0].dir = Math.PI;
    g.guards[1].pos = { x: 3 * TILE, y: 9 * TILE };
    g.guards[1].dir = 0;
    g.guards[2].pos = { x: 21 * TILE, y: 10 * TILE };
    g.guards[2].dir = Math.PI / 2;
    g.ripples = [{ x: g.thief.pos.x, y: g.thief.pos.y, t: 0.3, r: 40 }];
  } else if (name === 'cameras') {
    g.thief.pos = { x: 10 * TILE, y: 10 * TILE };
    g.thief.dir = -Math.PI / 2;
    g.cameras[0].pos = { x: 9 * TILE, y: 3.5 * TILE };
    g.cameras[0].dir = Math.PI / 2.2;
    g.guards[0].pos = { x: 11 * TILE, y: 12 * TILE };
    g.guards[0].dir = -Math.PI / 2;
    g.guards[0].state = 'suspicious';
    g.guards[0].suspicion = 0.6;
    g.guards[1].pos = { x: 5 * TILE, y: 12 * TILE };
    g.guards[1].dir = 0;
    g.guards[2].pos = { x: 21 * TILE, y: 10 * TILE };
    g.guards[2].dir = Math.PI;
    g.alarm = 42;
    g.spottedBy = 'camera';
    g.ripples = [{ x: 10 * TILE, y: 10 * TILE, t: 0.4, r: 80 }];
  } else if (name === 'vault') {
    g.thief.loot = 2;
    g.thief.pos = { x: 14 * TILE, y: 13.5 * TILE };
    g.thief.dir = -Math.PI / 2;
    g.thief.mode = 'sneak';
    g.guards[0].pos = { x: 15 * TILE, y: 3 * TILE };
    g.guards[0].dir = Math.PI / 2;
    g.guards[1].pos = { x: 3 * TILE, y: 9 * TILE };
    g.guards[1].dir = -Math.PI / 3;
    g.guards[2].pos = { x: 21 * TILE, y: 10.5 * TILE };
    g.guards[2].dir = Math.PI;
    g.cameras[2].down = 0;
    g.alarm = 18;
    g.time = 42;
  } else if (name === 'getaway') {
    g.thief.loot = 3;
    g.thief.pos = { x: 27.1 * TILE, y: 9.5 * TILE };
    g.thief.dir = 0;
    g.guards[0].pos = { x: 15 * TILE, y: 3 * TILE };
    g.guards[0].dir = Math.PI / 2;
    g.guards[1].pos = { x: 3 * TILE, y: 9 * TILE };
    g.guards[1].dir = Math.PI;
    g.guards[2].pos = { x: 21 * TILE, y: 10.5 * TILE };
    g.guards[2].dir = Math.PI;
    g.guards[2].state = 'search';
    g.alarm = 12;
    g.time = 96;
  } else if (name === 'smoke') {
    g.thief.pos = { x: 10 * TILE, y: 10 * TILE };
    g.thief.dir = 0;
    g.thief.smoke = 1;
    g.thief.smokeCloud = { x: 10 * TILE, y: 10 * TILE, t: 5 };
    g.guards[0].pos = { x: 11 * TILE, y: 12 * TILE };
    g.guards[0].dir = -Math.PI / 2;
    g.guards[1].pos = { x: 5 * TILE, y: 12 * TILE };
    g.guards[1].dir = 0;
    g.guards[2].pos = { x: 21 * TILE, y: 10 * TILE };
    g.guards[2].dir = Math.PI;
    g.alarm = 30;
    g.time = 60;
  }

  render(ctx, g, null);
}
