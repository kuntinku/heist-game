// gilded-trust: the job's state machine — read the room, take the loot, get out.
import { ALARM_MAX, ALARM_TRIGGER, LOOT_TOTAL } from './config.js';
import { parseLevel } from './level.js';
import { Thief } from './thief.js';
import { spawnGuards } from './guards.js';
import { spawnCameras } from './cameras.js';
import { Audio } from './audio.js';

export class Game {
  constructor(seedRandom) {
    this.rng = seedRandom;
    this.audio = new Audio();
    this.reset();
  }

  reset() {
    this.level = parseLevel();
    this.thief = new Thief(this.level.start);
    this.guards = spawnGuards(this.level.waypoints, this.rng);
    this.cameras = spawnCameras(this.level.cameras, this.rng);
    this.noiseEvents = [];
    this.ripples = [];
    this.alarm = 0;               // 0..100, the meter the judge reads in one frame
    this.spottedBy = null;
    this.lastReport = null;
    this.lockdown = false;        // alarm hit 100: the whole floor hunts you
    this.state = 'playing';       // playing | escaped | caught
    this.endReason = '';
    this.time = 0;
  }

  caught() {
    if (this.state !== 'playing') return;
    this.state = 'caught';
    this.endReason = 'Collared by security — the job went loud.';
    this.audio.lose();
  }

  update(dt, input) {
    if (this.state !== 'playing') {
      if (input.has('KeyR')) this.reset();
      input.endFrame();
      return;
    }
    this.time += dt;
    this.thief.update(dt, input, this);
    this.spottedBy = null;

    for (const ev of this.noiseEvents) {
      for (const g of this.guards) g.hear(ev);
      if (ev.r > 40) this.ripples.push({ x: ev.x, y: ev.y, t: 0.6, r: ev.r });
    }
    this.noiseEvents = [];
    this.ripples = this.ripples.filter((r) => (r.t -= dt) > 0);

    for (const c of this.cameras) c.update(dt, this.thief, this);
    for (const g of this.guards) g.update(dt, this.thief, this);

    // alarm cools while nothing sees you
    if (!this.spottedBy) this.alarm = Math.max(0, this.alarm - 9 * dt);

    // full meter = lockdown: every guard joins the hunt
    if (this.alarm >= ALARM_TRIGGER && !this.lockdown) {
      this.lockdown = true;
      const s = this.thief.pos;
      this.lastReport = { x: s.x, y: s.y };
      for (const g of this.guards) g.ringIn(this);
      this.audio.alarm();
    }

    // getaway: reach the van with the loot
    if (this.thief.loot >= LOOT_TOTAL) {
      for (const ex of this.level.exits) {
        if (Math.hypot(ex.x - this.thief.pos.x, ex.y - this.thief.pos.y) < 24) {
          this.state = 'escaped';
          this.endReason = 'Van doors shut, engine gone — clean score.';
          this.audio.win();
        }
      }
    }
    input.endFrame();
  }
}
