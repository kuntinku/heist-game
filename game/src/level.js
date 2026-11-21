// gilded-trust: the Marble Hall of the Gilded Trust bank — grid, collision,
// line of sight, vault door, loot and the getaway van outside.
// Legend: # wall, . marble floor, R red carpet (louder steps), C case/blocks sight,
//         V velvet rope (blocks nothing), D vault door, L loot, X van (getaway),
//         P thief start, digits = guard patrol waypoints, a/b/c = camera bodies
import { TILE } from './config.js';
export { TILE };

export const MAP = [
  '##############################',
  '#...1......R......R....1..X..#',
  '#.####.C...R..R.....1.#.####.#',
  '#.#..#...a...C.....1.#.#..#..#',
  '#.#..#..R.......P....#.#..#..#',
  '#.#..#....####.###...D.#..#..#',
  '#.####....#LL..#......###..###',
  '#.....b...#..C.#.............#',
  '#..2.C..R...###....####C####.#',
  '#.2..........C....#...c.....X#',
  '#...........R.....#..3....L..#',
  '#..P........R.....#....3....##',
  '#....2...####..####D.....3...#',
  '#..C.....#.........#..C..R...#',
  '#........#....L....#.........#',
  '##############################',
  '#....R........C.......R......#',
  '#..C.......R.............C...#',
  '##############################',
];

export const MAP_W = MAP[0].length;
export const MAP_H = MAP.length;

export function isWall(c) { return c === '#'; }
export function blocksSight(c) { return c === '#' || c === 'C'; }
export function isCarpet(c) { return c === 'R'; }

export function tileAt(x, y) {
  const cx = Math.floor(x / TILE), cy = Math.floor(y / TILE);
  if (cx < 0 || cy < 0 || cx >= MAP_W || cy >= MAP_H) return '#';
  return MAP[cy][cx];
}

export function collide(pos, r) {
  for (const [dx, dy] of [[-r, 0], [r, 0], [0, -r], [0, r], [-r * .7, -r * .7], [r * .7, -r * .7], [-r * .7, r * .7], [r * .7, r * .7]]) {
    if (isWall(tileAt(pos.x + dx, pos.y + dy))) return true;
  }
  return false;
}

export function moveEntity(pos, vx, vy, dt, r) {
  const nx = pos.x + vx * dt;
  if (!collide({ x: nx, y: pos.y }, r)) pos.x = nx;
  const ny = pos.y + vy * dt;
  if (!collide({ x: pos.x, y: ny }, r)) pos.y = ny;
}

export function hasSight(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const steps = Math.ceil(dist / (TILE / 2));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (blocksSight(tileAt(a.x + dx * t, a.y + dy * t))) return false;
  }
  return true;
}

export function parseLevel() {
  const loot = [], exits = [], waypoints = {}, cameras = [];
  const start = { x: 64, y: 64 };
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const c = MAP[y][x];
      const px = x * TILE + TILE / 2, py = y * TILE + TILE / 2;
      if (c === 'P') start.x = px, start.y = py;
      else if (c === 'L') loot.push({ x: px, y: py, taken: false });
      else if (c === 'X') exits.push({ x: px, y: py });
      else if (c === 'D') cameras.push({ door: { x: px, y: py } });
      else if (c >= '1' && c <= '9') (waypoints[c] = waypoints[c] || []).push({ x: px, y: py });
      else if (c === 'a') cameras.push({ body: { x: px, y: py }, dir: 0 });
      else if (c === 'b') cameras.push({ body: { x: px, y: py }, dir: Math.PI / 2 });
      else if (c === 'c') cameras.push({ body: { x: px, y: py }, dir: Math.PI });
    }
  }
  const vaultDoor = cameras.find((c) => c.door)?.door || null;
  return { start, loot, exits, waypoints, cameras: cameras.filter((c) => c.body), vaultDoor };
}
