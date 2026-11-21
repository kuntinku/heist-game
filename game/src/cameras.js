// gilded-trust: security cameras — bodies on the wall, sweeping lenses,
// feed each spotted second into the alarm meter.
import { CAMERA_RANGE, CAMERA_HALF_ANGLE, CAMERA_SWEEP } from './config.js';
import { hasSight } from './level.js';

export class Camera {
  constructor(spec, seedRandom) {
    this.pos = spec.body;
    this.base = spec.dir;
    this.dir = spec.dir;
    this.rng = seedRandom;
    this.phase = this.rng() * Math.PI * 2;
    this.down = 0;             // EMP downtime, seconds
  }

  // does the lens see the thief right now?
  sees(thief) {
    if (this.down > 0 || thief.inSmoke()) return false;
    const d = Math.hypot(thief.pos.x - this.pos.x, thief.pos.y - this.pos.y);
    if (d > CAMERA_RANGE) return false;
    const ang = Math.atan2(thief.pos.y - this.pos.y, thief.pos.x - this.pos.x);
    const diff = Math.abs(angDiff(ang, this.dir));
    if (diff > CAMERA_HALF_ANGLE) return false;
    return hasSight(this.pos, thief.pos);
  }

  update(dt, thief, world) {
    if (this.down > 0) { this.down -= dt; return; }
    this.dir = this.base + Math.sin(this.phase + world.time * CAMERA_SWEEP) * 0.9;
    if (this.sees(thief)) {
      world.alarm = Math.min(100, world.alarm + 12 * dt);
      world.spottedBy = 'camera';
    }
  }
}

function angDiff(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function spawnCameras(specs, rng) {
  return specs.map((s) => new Camera(s, rng));
}
