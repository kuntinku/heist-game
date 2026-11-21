// gilded-trust: renderer — art deco marble hall, camera sweeps, alarm meter,
// loot glow, smoke clouds, HUD and the getaway screens.
import { TILE, VIEW_W, VIEW_H, GUARD_RANGE, GUARD_HALF_ANGLE, CAMERA_RANGE, CAMERA_HALF_ANGLE,
         PLAYER_LIGHT_RANGE, LOOT_TOTAL, SMOKE_RADIUS } from './config.js';
import { MAP, MAP_W, MAP_H } from './level.js';

const COLORS = {
  marble: '#3a3744', marble2: '#403d4b', wall: '#2b2636', wallTop: '#463e57',
  carpet: '#5e2230', case: '#7c5a2e', rope: '#b08d3a',
  loot: '#ffd24d', van: '#59d97a', thief: '#e8b13c', guard: '#d94f4f',
  camera: '#5ad0a0',
};

export function render(ctx, game, input) {
  ctx.fillStyle = '#121019';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const cam = camera(game);
  ctx.save();
  ctx.translate(-cam.x, -cam.y);

  drawFloor(ctx, cam);
  drawTiles(ctx, cam);
  drawLoot(ctx, game);
  drawVan(ctx, game);
  drawRipples(ctx, game);
  drawCones(ctx, game, cam);
  drawGuards(ctx, game);
  drawCameras(ctx, game);
  drawThief(ctx, game);
  drawSmoke(ctx, game);

  ctx.restore();
  drawVignette(ctx);
  drawHUD(ctx, game);
  if (game.state !== 'playing') drawEndScreen(ctx, game);
}

function camera(game) {
  const p = game.thief.pos;
  return { x: Math.max(0, Math.min(p.x - VIEW_W / 2, MAP_W * TILE - VIEW_W)), y: Math.max(0, Math.min(p.y - VIEW_H / 2, MAP_H * TILE - VIEW_H)) };
}

function drawFloor(ctx, cam) {
  for (let y = Math.floor(cam.y / TILE); y <= (cam.y + VIEW_H) / TILE; y++) {
    for (let x = Math.floor(cam.x / TILE); x <= (cam.x + VIEW_W) / TILE; x++) {
      if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
      const c = MAP[y][x];
      if (c === 'R') ctx.fillStyle = COLORS.carpet;
      else ctx.fillStyle = (x + y) % 2 ? COLORS.marble : COLORS.marble2;
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
}

function drawTiles(ctx, cam) {
  for (let y = Math.floor(cam.y / TILE); y <= (cam.y + VIEW_H) / TILE; y++) {
    for (let x = Math.floor(cam.x / TILE); x <= (cam.x + VIEW_W) / TILE; x++) {
      if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
      const c = MAP[y][x];
      if (c === '#') {
        ctx.fillStyle = COLORS.wall; ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        ctx.fillStyle = COLORS.wallTop; ctx.fillRect(x * TILE, y * TILE, TILE, 6);
      } else if (c === 'C') {
        ctx.fillStyle = COLORS.case; ctx.fillRect(x * TILE + 3, y * TILE + 3, TILE - 6, TILE - 6);
        ctx.strokeStyle = '#5c431f'; ctx.strokeRect(x * TILE + 3.5, y * TILE + 3.5, TILE - 7, TILE - 7);
      } else if (c === 'V') {
        ctx.strokeStyle = COLORS.rope; ctx.beginPath();
        ctx.moveTo(x * TILE + 4, y * TILE + TILE / 2); ctx.lineTo(x * TILE + TILE - 4, y * TILE + TILE / 2);
        ctx.stroke();
      } else if (c === 'D') {
        ctx.fillStyle = '#8c7440'; ctx.fillRect(x * TILE, y * TILE + 8, TILE, TILE - 16);
        ctx.fillStyle = '#5e4c26'; ctx.fillRect(x * TILE + 8, y * TILE + 8, 4, TILE - 16);
      }
    }
  }
}

function drawLoot(ctx, game) {
  for (const l of game.level.loot) {
    if (l.taken) continue;
    const pulse = 4 + Math.sin(game.time * 4) * 2;
    ctx.fillStyle = COLORS.loot;
    ctx.beginPath(); ctx.arc(l.x, l.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COLORS.loot; ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(l.x, l.y, 12 + pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawVan(ctx, game) {
  const open = game.thief.loot >= LOOT_TOTAL;
  for (const ex of game.level.exits) {
    ctx.fillStyle = open ? COLORS.van : '#2c4a37';
    ctx.fillRect(ex.x - TILE / 2 + 2, ex.y - TILE / 2 + 2, TILE - 4, TILE - 4);
    if (open) {
      const glow = ctx.createRadialGradient(ex.x, ex.y, 4, ex.x, ex.y, 60);
      glow.addColorStop(0, 'rgba(89,217,122,0.5)');
      glow.addColorStop(1, 'rgba(89,217,122,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(ex.x - 60, ex.y - 60, 120, 120);
      ctx.fillStyle = '#08240f';
      ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
      ctx.fillText('VAN', ex.x, ex.y + 4);
      ctx.textAlign = 'left';
    }
  }
}

function drawRipples(ctx, game) {
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  for (const ev of game.ripples || []) {
    ctx.beginPath(); ctx.arc(ev.x, ev.y, ev.r * (1 - ev.t / 0.6) + 10, 0, Math.PI * 2); ctx.stroke();
  }
}

// darkness, the thief's glow, then every cone that hunts the thief
function drawCones(ctx, game, cam) {
  ctx.save();
  ctx.fillStyle = 'rgba(4,5,12,0.6)';
  ctx.fillRect(cam.x, cam.y, VIEW_W, VIEW_H);
  const p = game.thief.pos;
  if (!game.thief.inSmoke()) {
    const hole = ctx.createRadialGradient(p.x, p.y, 20, p.x, p.y, PLAYER_LIGHT_RANGE);
    hole.addColorStop(0, 'rgba(0,0,0,1)');
    hole.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = hole;
    ctx.beginPath();
    ctx.arc(p.x, p.y, PLAYER_LIGHT_RANGE, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  for (const c of game.cameras) {
    if (c.down > 0) continue;
    const grad = ctx.createRadialGradient(c.pos.x, c.pos.y, 10, c.pos.x, c.pos.y, CAMERA_RANGE);
    grad.addColorStop(0, 'rgba(90,208,160,0.3)');
    grad.addColorStop(1, 'rgba(90,208,160,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(c.pos.x, c.pos.y);
    ctx.arc(c.pos.x, c.pos.y, CAMERA_RANGE, c.dir - CAMERA_HALF_ANGLE, c.dir + CAMERA_HALF_ANGLE);
    ctx.closePath();
    ctx.fill();
  }
  for (const g of game.guards) {
    const tint = g.state === 'lockdown' ? '255,60,60' : g.state === 'suspicious' ? '255,190,60' : '255,225,150';
    const grad = ctx.createRadialGradient(g.pos.x, g.pos.y, 10, g.pos.x, g.pos.y, GUARD_RANGE);
    grad.addColorStop(0, `rgba(${tint},0.35)`);
    grad.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(g.pos.x, g.pos.y);
    ctx.arc(g.pos.x, g.pos.y, GUARD_RANGE, g.dir - GUARD_HALF_ANGLE, g.dir + GUARD_HALF_ANGLE);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawGuards(ctx, game) {
  for (const g of game.guards) {
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath(); ctx.arc(g.pos.x, g.pos.y, g.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.pos.x, g.pos.y);
    ctx.lineTo(g.pos.x + Math.cos(g.dir) * 14, g.pos.y + Math.sin(g.dir) * 14);
    ctx.stroke();
    ctx.fillStyle = g.state === 'lockdown' ? '#ff3030' : g.state === 'suspicious' ? '#ffcc33' : '#66dd88';
    ctx.beginPath(); ctx.arc(g.pos.x, g.pos.y - 16, 4, 0, Math.PI * 2); ctx.fill();
    if (g.suspicion > 0.02) {
      ctx.fillStyle = '#000'; ctx.fillRect(g.pos.x - 14, g.pos.y - 24, 28, 5);
      ctx.fillStyle = '#ff4040'; ctx.fillRect(g.pos.x - 13, g.pos.y - 23, 26 * g.suspicion, 3);
    }
  }
}

function drawCameras(ctx, game) {
  for (const c of game.cameras) {
    const dead = c.down > 0;
    ctx.fillStyle = dead ? '#3a4a44' : COLORS.camera;
    ctx.beginPath(); ctx.arc(c.pos.x, c.pos.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = dead ? '#31413b' : '#a8ffe0'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.pos.x, c.pos.y);
    ctx.lineTo(c.pos.x + Math.cos(c.dir) * 12, c.pos.y + Math.sin(c.dir) * 12);
    ctx.stroke();
    ctx.font = '9px monospace'; ctx.fillStyle = dead ? '#6b7a73' : COLORS.camera;
    ctx.fillText(dead ? 'EMP' : 'CCTV', c.pos.x - 12, c.pos.y - 12);
  }
}

function drawThief(ctx, game) {
  const t = game.thief;
  if (t.inSmoke()) return;
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath(); ctx.arc(t.pos.x, t.pos.y, t.r, 0, Math.PI * 2); ctx.fill();
  if (t.carrying) {   // the duffel bag rides behind the thief
    ctx.fillStyle = '#8c6a2f';
    ctx.beginPath(); ctx.arc(t.pos.x - Math.cos(t.dir) * 10, t.pos.y - Math.sin(t.dir) * 10, 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(t.pos.x, t.pos.y);
  ctx.lineTo(t.pos.x + Math.cos(t.dir) * 13, t.pos.y + Math.sin(t.dir) * 13);
  ctx.stroke();
}

function drawSmoke(ctx, game) {
  const s = game.thief.smokeCloud;
  if (!s) return;
  const a = Math.min(1, s.t / 2);
  const g = ctx.createRadialGradient(s.x, s.y, 10, s.x, s.y, SMOKE_RADIUS);
  g.addColorStop(0, `rgba(210,210,220,${0.65 * a})`);
  g.addColorStop(1, `rgba(210,210,220,0)`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(s.x, s.y, SMOKE_RADIUS, 0, Math.PI * 2); ctx.fill();
}

function drawVignette(ctx) {
  const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H / 3, VIEW_W / 2, VIEW_H / 2, VIEW_H);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(6,4,12,0.5)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawHUD(ctx, game) {
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(10,8,18,0.8)';
  ctx.fillRect(0, 0, VIEW_W, 54);
  ctx.fillRect(0, VIEW_H - 34, VIEW_W, 34);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#e8dfc8';
  ctx.fillText('GILDED TRUST — MARBLE HALL', 12, 21);

  ctx.fillStyle = COLORS.loot;
  ctx.fillText(`LOOT ${game.thief.loot}/${LOOT_TOTAL}`, 12, 41);

  // the alarm meter, always in frame
  ctx.fillStyle = '#000'; ctx.fillRect(110, 8, 300, 18);
  const w = 296 * (game.alarm / 100);
  ctx.fillStyle = game.alarm > 70 ? '#ff3030' : game.alarm > 35 ? '#ffcc33' : '#5f8f6f';
  ctx.fillRect(112, 10, w, 14);
  ctx.fillStyle = '#e8dfc8'; ctx.font = '11px monospace';
  ctx.fillText(game.lockdown ? 'LOCKDOWN — EVERY GUARD HUNTS' : game.spottedBy ? `SPOTTED BY ${game.spottedBy.toUpperCase()}!` : 'ALARM', 130, 21);

  // tool counters
  ctx.fillStyle = '#cfc6b0'; ctx.font = '11px monospace';
  ctx.fillText(`smoke x${game.thief.smoke} [Q]   emp x${game.thief.emp} [X]`, 110, 40);

  ctx.fillStyle = game.thief.loot >= LOOT_TOTAL ? COLORS.van : '#9aa0bb';
  ctx.font = '13px monospace';
  ctx.fillText(game.thief.loot >= LOOT_TOTAL ? 'OBJECTIVE: get to the VAN' : 'OBJECTIVE: bag 3 loot piles, stay off the lenses', 480, 21);
  ctx.fillStyle = '#8f8ba3'; ctx.font = '11px monospace';
  ctx.fillText('WASD move · SHIFT sneak · E whistle · Q smoke · X emp · R restart', 480, 41);

  if (game.lockdown) {
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255,40,40,${0.5 + Math.sin(game.time * 8) * 0.3})`;
    ctx.font = 'bold 18px monospace';
    ctx.fillText('ALARM — LOSE THEM AND LET THE METER COOL', VIEW_W / 2, VIEW_H - 12);
    ctx.textAlign = 'left';
  }
}

function drawEndScreen(ctx, game) {
  ctx.fillStyle = 'rgba(3,3,8,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  const won = game.state === 'escaped';
  ctx.font = 'bold 44px monospace';
  ctx.fillStyle = won ? COLORS.van : COLORS.guard;
  ctx.fillText(won ? 'CLEAN GETAWAY' : 'CAUGHT', VIEW_W / 2, VIEW_H / 2 - 30);
  ctx.font = '15px monospace';
  ctx.fillStyle = '#e8dfc8';
  ctx.fillText(game.endReason, VIEW_W / 2, VIEW_H / 2 + 6);
  ctx.fillText(`loot ${game.thief.loot}/${LOOT_TOTAL} · time ${game.time.toFixed(1)}s · alarm ${Math.round(game.alarm)}`, VIEW_W / 2, VIEW_H / 2 + 30);
  ctx.font = '13px monospace';
  ctx.fillStyle = '#8f8ba3';
  ctx.fillText('press R to run the job again', VIEW_W / 2, VIEW_H / 2 + 60);
  ctx.textAlign = 'left';
}
