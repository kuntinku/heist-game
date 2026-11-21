// gilded-trust: guards — patrol, cone detection feeding the alarm meter,
// suspicious -> lockdown chase -> search -> calm.
import { GUARD_RANGE, GUARD_HALF_ANGLE, CATCH_RADIUS, SEARCH_TIME, ALARM_MAX } from './config.js';
import { hasSight, moveEntity } from './level.js';

export class Guard {
  constructor(waypoints, seedRandom) {
    this.pos = { x: waypoints[0].x, y: waypoints[0].y };
    this.waypoints = waypoints;
    this.wp = 1;
    this.r = 11;
    this.dir = 0;
    this.state = 'patrol';       // patrol | suspicious | lockdown | search
    this.suspicion = 0;          // own 0..1 meter, mirrors how close they are to ring it in
    this.lastSeen = null;
    this.searchTimer = 0;
    this.speed = 70;
    this.chaseSpeed = 122;
    this.rng = seedRandom;
    this.wiggle = this.rng() * Math.PI * 2;
  }

  sees(thief, world) {
    if (thief.inSmoke()) return false;
    const d = Math.hypot(thief.pos.x - this.pos.x, thief.pos.y - this.pos.y);
    if (d > GUARD_RANGE) return false;
    const ang = Math.atan2(thief.pos.y - this.pos.y, thief.pos.x - this.pos.x);
    const diff = Math.abs(angDiff(ang, this.dir));
    if (!(diff < GUARD_HALF_ANGLE || d < 30)) return false;
    if (!hasSight(this.pos, thief.pos)) return false;
    return true;
  }

  hear(ev) {
    const d = Math.hypot(ev.x - this.pos.x, ev.y - this.pos.y);
    if (d > ev.r) return;
    if (this.state === 'patrol' || this.state === 'search') {
      this.state = 'suspicious';
      this.lastSeen = { x: ev.x, y: ev.y };
      this.suspicion = Math.max(this.suspicion, 0.35);
    } else if (this.state === 'suspicious') {
      this.lastSeen = { x: ev.x, y: ev.y };
    }
  }

  update(dt, thief, world) {
    const seen = this.sees(thief, world);

    if (seen) {
      const d = Math.hypot(thief.pos.x - this.pos.x, thief.pos.y - this.pos.y);
      const rate = 0.35 * (1 - (d / GUARD_RANGE) * 0.6) * (thief.mode === 'sneak' ? 0.6 : 1);
      this.suspicion = Math.min(1, this.suspicion + rate * dt);
      this.lastSeen = { x: thief.pos.x, y: thief.pos.y };
      world.alarm = Math.min(ALARM_MAX, world.alarm + 22 * dt);
      world.spottedBy = 'guard';
    } else {
      this.suspicion = Math.max(0, this.suspicion - 0.28 * dt);
    }

    if (this.state === 'patrol') this.walkPath(dt, this.speed);
    else if (this.state === 'suspicious') {
      if (this.lastSeen && this.moveTo(dt, this.lastSeen, this.speed)) {
        this.searchTimer += dt;
        if (this.searchTimer > 2.5) { this.searchTimer = 0; this.state = 'patrol'; this.suspicion = 0.1; }
      }
      if (seen) this.dir = Math.atan2(thief.pos.y - this.pos.y, thief.pos.x - this.pos.x);
    } else if (this.state === 'lockdown') {
      if (this.moveTo(dt, this.lastSeen, this.chaseSpeed) && !seen) {
        this.state = 'search'; this.searchTimer = 0;
      }
      this.dir = Math.atan2(thief.pos.y - this.pos.y, thief.pos.x - this.pos.x);
    } else if (this.state === 'search') {
      this.searchTimer += dt;
      const t = this.searchTimer * 1.2 + this.wiggle;
      this.moveTo(dt, { x: this.lastSeen.x + Math.cos(t) * 48, y: this.lastSeen.y + Math.sin(t) * 48 }, this.speed * 0.8);
      if (this.searchTimer > SEARCH_TIME) { this.state = 'patrol'; this.suspicion = 0; }
    }

    if ((this.state === 'lockdown' || world.lockdown) && seen === false && this.state === 'lockdown') {
      // lockdown guards keep hunting the last report
    }
    if (this.state === 'lockdown' &&
        Math.hypot(thief.pos.x - this.pos.x, thief.pos.y - this.pos.y) < CATCH_RADIUS) {
      world.caught();
    }
  }

  walkPath(dt, speed) {
    const target = this.waypoints[this.wp];
    if (this.moveTo(dt, target, speed)) this.wp = (this.wp + 1) % this.waypoints.length;
  }

  moveTo(dt, target, speed) {
    const dx = target.x - this.pos.x, dy = target.y - this.pos.y;
    if (Math.hypot(dx, dy) < 6) return true;
    let vx = 0, vy = 0;
    if (Math.abs(dx) > 5) { vx = Math.sign(dx) * speed; this.dir = Math.atan2(0, Math.sign(dx)); }
    else if (Math.abs(dy) > 5) { vy = Math.sign(dy) * speed; this.dir = Math.atan2(Math.sign(dy), 0); }
    const before = { x: this.pos.x, y: this.pos.y };
    moveEntity(this.pos, vx, vy, dt, this.r);
    if (Math.abs(this.pos.x - before.x) < 0.01 && Math.abs(this.pos.y - before.y) < 0.01 && vx !== 0) {
      moveEntity(this.pos, 0, Math.sign(dy || 1) * speed, dt, this.r);
    }
    return false;
  }

  ringIn(world) {
    this.state = 'lockdown';
    if (world.lastReport) this.lastSeen = { x: world.lastReport.x, y: world.lastReport.y };
  }
}

function angDiff(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function spawnGuards(waypoints, rng) {
  return Object.keys(waypoints).sort().map((k) => new Guard(waypoints[k], rng));
}
