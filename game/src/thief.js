// gilded-trust: the thief — movement, noise, loot bags, smoke bombs and the EMP.
import { SPEED_RUN, SPEED_WALK, SPEED_SNEAK, SPEED_CARRY, NOISE_RUN, NOISE_WALK, NOISE_SNEAK,
         WHISTLE_NOISE, SMOKE_RADIUS, SMOKE_TIME, SMOKE_COUNT, EMP_TIME, EMP_COUNT } from './config.js';
import { moveEntity, isCarpet, tileAt } from './level.js';

export class Thief {
  constructor(start) {
    this.pos = { x: start.x, y: start.y };
    this.r = 10;
    this.dir = 0;
    this.mode = 'walk';
    this.noise = 0;
    this.moving = false;
    this.loot = 0;
    this.smoke = SMOKE_COUNT;
    this.emp = EMP_COUNT;
    this.smokeCloud = null;      // { x, y, t } while a smoke bomb burns
    this.empTimer = 0;
  }

  get carrying() { return this.loot > 0; }

  // inside the smoke cloud nobody sees you
  inSmoke() {
    const s = this.smokeCloud;
    return !!s && s.t > 0 && Math.hypot(this.pos.x - s.x, this.pos.y - s.y) < SMOKE_RADIUS;
  }

  update(dt, input, world) {
    let vx = 0, vy = 0;
    if (input.has('KeyW') || input.has('ArrowUp')) vy -= 1;
    if (input.has('KeyS') || input.has('ArrowDown')) vy += 1;
    if (input.has('KeyA') || input.has('ArrowLeft')) vx -= 1;
    if (input.has('KeyD') || input.has('ArrowRight')) vx += 1;
    const len = Math.hypot(vx, vy) || 1;
    vx /= len; vy /= len;

    if (input.has('ShiftLeft') || input.has('ShiftRight')) this.mode = 'sneak';
    else if (input.has('Space')) this.mode = 'run';
    else this.mode = 'walk';

    let speed = this.mode === 'run' ? SPEED_RUN : this.mode === 'sneak' ? SPEED_SNEAK : SPEED_WALK;
    if (this.carrying) speed = Math.min(speed, SPEED_CARRY);

    this.moving = vx !== 0 || vy !== 0;
    if (this.moving) moveEntity(this.pos, vx * speed, vy * speed, dt, this.r);
    this.dir = Math.atan2(input.mouse.y - this.pos.y, input.mouse.x - this.pos.x);

    // marble is quiet, carpet is not: the same step is louder on the red runner
    const floorLoud = isCarpet(tileAt(this.pos.x, this.pos.y)) ? 1.35 : 1;
    this.noise = this.moving
      ? (this.mode === 'run' ? NOISE_RUN : this.mode === 'sneak' ? NOISE_SNEAK : NOISE_WALK) * floorLoud
      : 6;

    if (input.takeWhistle()) world.noiseEvents.push({ x: this.pos.x, y: this.pos.y, r: WHISTLE_NOISE });

    // tools: Q drops smoke, X fires the EMP
    if (input.takeKey('KeyQ') && this.smoke > 0) {
      this.smoke--;
      this.smokeCloud = { x: this.pos.x, y: this.pos.y, t: SMOKE_TIME };
      world.audio.smoke();
    }
    if (input.takeKey('KeyX') && this.emp > 0) {
      this.emp--;
      this.empTimer = EMP_TIME;
      world.audio.emp();
    }
    if (this.smokeCloud) {
      this.smokeCloud.t -= dt;
      if (this.smokeCloud.t <= 0) this.smokeCloud = null;
    }
    if (this.empTimer > 0) world.cameras.forEach((c) => { c.down = Math.max(c.down, this.empTimer); });

    // footsteps that guards hear
    this.stepTimer = (this.stepTimer || 0) + dt * (this.moving ? (this.mode === 'run' ? 5 : this.mode === 'sneak' ? 1.5 : 3) : 0);
    if (this.stepTimer > 1) {
      this.stepTimer = 0;
      world.noiseEvents.push({ x: this.pos.x, y: this.pos.y, r: this.noise });
    }

    for (const l of world.level.loot) {
      if (!l.taken && Math.hypot(l.x - this.pos.x, l.y - this.pos.y) < 18) {
        l.taken = true;
        this.loot++;
        world.audio.loot();
      }
    }
  }
}
