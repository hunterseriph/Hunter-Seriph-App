/* =====================================================================================================
   THE WORLD: tile queries (floors, slopes, walls, ceilings, liquids), and everything that moves or waits in an
   act: drops, foes, their shots, springs, item boxes, platforms, hazards, checkpoints, the goal sign.
   ===================================================================================================== */
var LV = null, ENTS = [], PLATS = [], SHOTS = [], FX = [], SCAT = [], TRAPOPEN = {};
function T(cx, cy) { if (!LV || cx < 0 || cx >= LV.w) return 'W'; if (cy < 0) return '.'; if (cy >= LV.h) return '.'; return LV.t[cy * LV.w + cx]; }
function isSolid(ch, cx, cy) { if (ch === 'D') return !TRAPOPEN[cx + ',' + cy]; return ch === '#' || ch === 'X' || ch === 'W' || ch === '_' || ch === '-' || ch === 'Q'; }
function wallAt(px, py) { var cx = Math.floor(px / TS), cy = Math.floor(py / TS), ch = T(cx, cy); if (isSolid(ch, cx, cy)) return true; if (surf(ch, 0) >= 0) return py - cy * TS >= Math.max(surf(ch, 0), surf(ch, 15)) + 1; return false; }
/* the highest floor between y0 and y1 at x (tiles, slopes, platforms you can stand on); oneway: whether thin platforms count */
var STANDS = { box: 1, spring: 1, check: 1, dash: 1, vent: 1, jet: 1, goal: 1, zap: 1, ramp: 1, portal: 1, trap: 0 };
function floorAt(px, y0, y1, oneway) {
  var cx = Math.floor(px / TS), lx = Math.floor(px - cx * TS), best = null;
  for (var cy = Math.floor(y0 / TS); cy <= Math.floor(y1 / TS); cy++) {
    var ch = T(cx, cy), s = -1;
    if (isSolid(ch, cx, cy)) { if (!isSolid(T(cx, cy - 1), cx, cy - 1) && surf(T(cx, cy - 1), 0) < 0) s = 0; }
    else if (ch === '=' && oneway) s = 0;
    else s = surf(ch, lx);
    if (s >= 0) { var y = cy * TS + s; if (y >= y0 && y <= y1) { best = y; break; } }
  }
  if (oneway) for (var i = 0; i < PLATS.length; i++) { var p = PLATS[i]; if (p.gone) continue; if (px >= p.x - 2 && px <= p.x + p.w + 2 && p.y >= y0 && p.y <= y1 && (best === null || p.y < best)) best = p.y; }
  return best;
}
/* inside the ground? (he saw foes and drops phasing through the floor) */
function inGround(x, y) { var c = Math.floor(x / TS), r = Math.floor(y / TS); return isSolid(T(c, r), c, r) || (surf(T(c, r), Math.floor(x - c * TS)) >= 0 && y > r * TS + surf(T(c, r), Math.floor(x - c * TS)) + 1); }
function popUp(x, y) { // lift a point that has ended up inside the ground to the surface above it (or null if it is buried deep)
  if (!inGround(x, y - 2)) return y; for (var k = 0; k < 96; k++) { y -= 2; if (!inGround(x, y - 2)) { var f = floorAt(x, y - 2, y + 18, true); return f === null ? y : f; } } return null; }
function platUnder(px, py) { for (var i = 0; i < PLATS.length; i++) { var p = PLATS[i]; if (!p.gone && px >= p.x - 2 && px <= p.x + p.w + 2 && Math.abs(p.y - py) < 1.5) return p; } return null; }
function liquidAt(px, py) { var ch = T(Math.floor(px / TS), Math.floor(py / TS)); return ch === '~' || ch === '%' ? 'cream' : ch === 'L' || ch === 'l' ? 'lava' : null; }

/* ---------- loading an act ---------- */
function loadAct(ai) {
  LV = buildAct(ACTS[ai]); LV.ai = ai; ENTS = []; PLATS = []; SHOTS = []; FX = []; SCAT = []; TRAPOPEN = {};
  TILESET = buildTileset(LV.zone); TILESETS = {}; KIT.dropLayer();
  LV.ents.forEach(function (e) {
    var o = { k: e.k, x: e.x, y: e.y, x0: e.x, y0: e.y, t: 0, alive: true, ph: e.ph || 0 };
    for (var q in e) if (!(q in o)) o[q] = e[q];
    if (e.k === 'start') { LV.sx = e.x; LV.sy = e.y; return; }
    if (e.k === 'foe') { var key = LV.zone.foes[e.f] || e.f, F = FOES[key]; o.F = F; o.key = key; o.hp = F.hp; o.dir = -1; o.cd = 1.5 + Math.random() * 2; o.y0 = e.y; if (F.beh === 'fly' || F.beh === 'dive' || F.beh === 'float') { o.y -= 40; o.y0 = o.y; } }
    if (e.k === 'line') { PLATS.push({ x: e.x - TS / 2, y: e.y, w: 4 * TS, x0: e.x - TS / 2, y0: e.y, k: 'line', t: 0, dx: 0, dy: 0, ph: 0, range: 0 }); return; }
    if (e.k === 'movh' || e.k === 'movv' || e.k === 'crumble' || e.k === 'circle') { var p = { x: e.x - TS / 2, y: e.y, w: (e.w || 3) * TS, x0: e.x - TS / 2, y0: e.y, k: e.k, range: (e.range || 3) * TS, log: e.log, ph: Math.random() * 6, t: 0, dx: 0, dy: 0 }; PLATS.push(p); o.plat = p; o.alive = false; }
    if (e.k === 'arena') LV.arena = o;
    if (e.k === 'foe' && !(o.F.beh === 'fly' || o.F.beh === 'dive' || o.F.beh === 'float')) { // ground foes stand on the ground: settle onto the floor below, or leave them out
      var up = popUp(o.x, o.y); if (up === null) return; o.y = up; var fy = floorAt(o.x, o.y - 6, o.y + TS * 12, true); if (fy === null) return; o.y = o.y0 = fy; }
    if (e.k === 'drop') { var dy = popUp(o.x, o.y - 4); if (dy === null) return; if (dy !== o.y - 4) o.y = o.y0 = dy - 2; }
    // things that stand on the ground really stand on it: boxes, springs, checkpoints, pads, vents, jets, the sign
    if (STANDS[e.k]) { var sy = floorAt(o.x, o.y - TS * 1.5, o.y + TS * (e.k === 'portal' ? 40 : 4), true); if (sy !== null) o.y = o.y0 = sy; } // the gateway is stone: it always finds the ground
    if (e.k === 'awning') { var gy = null; for (var sh = 0; sh < 6 && gy === null; sh++) { gy = floorAt(o.x + sh * TS, o.y + 6, o.y + TS * 12, true); if (gy !== null) o.x = o.x0 = o.x + sh * TS; } o.gy = gy === null ? o.y + 48 : gy; } // its poles go all the way down
    ENTS.push(o);
  });
  LV.props = LV.dists && LV.dists.length ? distProps() : LV.zone.id === 'city' ? cityProps() : [];
  LV.ents = null; G.check = null; G.boss = null; G.lock = null;
}

/* ---------- each step ---------- */
function stepWorld(dt) {
  var p = PL;
  // platforms
  PLATS.forEach(function (q) {
    q.t += dt; var ox = q.x, oy = q.y;
    if (q.k === 'movh') q.x = q.x0 + Math.sin(q.t * 1.1 + q.ph) * q.range;
    else if (q.k === 'movv') q.y = q.y0 + Math.sin(q.t * 1.0 + q.ph) * q.range;
    else if (q.k === 'crumble') {
      if (q.fall) { q.vy = (q.vy || 0) + 900 * dt; q.y += q.vy * dt; q.fallT += dt; if (q.fallT > 4.5) { q.fall = false; q.gone = false; q.y = q.y0; q.vy = 0; q.touch = 0; } else if (q.fallT > 1.2) q.gone = true; }
      else if (q.touch > 0) { q.touch += dt; if (q.touch > 0.45) { q.fall = true; q.fallT = 0; sfx.play('crumble'); } }
    }
    q.dx = q.x - ox; q.dy = q.y - oy;
  });
  // trapdoors, electric floors and the rest of the hazards run on their own clocks
  ENTS.forEach(function (e) {
    if (e.k === 'trap') { var c = (G.t + e.ph * 3) % 3.2, open = c > 2.1; var cx = Math.floor(e.x / TS), cy = Math.floor(e.y / TS); for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) if (T(cx + dx, cy + dy) === 'D') TRAPOPEN[(cx + dx) + ',' + (cy + dy)] = open; e.open = open; e.warn = c > 1.6 && c <= 2.1; }
  });
  // traps
  if (p) ENTS.forEach(function (e) { if (TRAPKINDS[e.k] && Math.abs(e.x - G.cam - KIT.W / 2) < KIT.W * 1.2) trapStep(e, dt); else if (SETPIECE[e.k] && Math.abs(e.x - G.cam - KIT.W / 2) < KIT.W * 3) SETPIECE[e.k](e, dt); });
  // foes
  ENTS.forEach(function (e) { if (e.k === 'foe' && e.alive) stepFoe(e, dt); });
  // things you touch
  if (p && p.state !== 'dead') ENTS.forEach(function (e) { touch(e, dt); });
  // shots
  SHOTS.forEach(function (s) {
    if (s.delay > 0) { s.delay -= dt; return; }
    s.life -= dt; s.vy += (s.g || 0) * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.mine) { ENTS.forEach(function (e) { if (e.k === 'foe' && e.alive && Math.abs(e.x - s.x) < (e.w || 12) && s.y > e.y - (e.h || 24) - 4 && s.y < e.y + 4) { if (e.F.shield && Math.sign(s.vx) === -e.dir) { s.vx = -s.vx * 0.6; s.vy = -120; s.mine = false; s.life = 0.4; sfx.play('clink'); } else { hitFoe(e, 1); s.life = 0; } } if (e.k === 'box' && e.alive && Math.abs(e.x - s.x) < 12 && Math.abs(e.y - 12 - s.y) < 14) { openBox(e); s.life = 0; } }); if (G.boss && G.boss.alive && bossHitBy(s.x, s.y)) { hitBoss(1); s.life = 0; } }
    else if (p && p.state === 'normal' && Math.abs(p.x - s.x) < 7 && s.y > p.y - PH + 6 && s.y < p.y - 1) { hurt(s.x); s.life = 0; } // a hurt box a little inside Cumhead
    if (wallAt(s.x, s.y) && !s.ghost) s.life = 0;
  });
  SHOTS = SHOTS.filter(function (s) { return s.life > 0; });
  // scattered drops you can grab back
  SCAT.forEach(function (d) { d.t += dt; d.vy += 600 * dt; var ox = d.x; d.x += d.vx * dt; if (inGround(d.x, d.y - 4)) { d.x = ox; d.vx = -d.vx * 0.7; } var ny = d.y + d.vy * dt; if (d.vy < 0 && inGround(d.x, ny - 6)) { ny = d.y; d.vy = 40; } var f = floorAt(d.x, d.y - 12, ny + 1, true); if (f !== null && d.vy > 0 && f >= d.y - 12) { d.y = f; d.vy = -d.vy * 0.6; if (Math.abs(d.vy) < 40) d.vy = 0; } else d.y = ny; if (inGround(d.x, d.y - 2)) { var u = popUp(d.x, d.y); if (u !== null) { d.y = u; d.vy = 0; } } if (wallAt(d.x, d.y - 4)) d.vx = -d.vx;
    if (p && p.state === 'normal' && d.t > 0.6 && Math.abs(p.x - d.x) < 12 && d.y > p.y - PH - 4 && d.y < p.y + 6) { d.t = 99; gotDrop(); } });
  SCAT = SCAT.filter(function (d) { return d.t < 3.5; });
  FX.forEach(function (f) { f.t -= dt; if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.g === undefined ? 300 : f.g) * dt; } });
  FX = FX.filter(function (f) { return f.t > 0; });
}
/* ---------- foes ---------- */
function stepFoe(e, dt) {
  var F = e.F, p = PL; e.t += dt; if (e.hitT > 0) e.hitT -= dt;
  if (Math.abs(e.x - G.cam - KIT.W / 2) > KIT.W) return; // asleep off screen
  var near = p && Math.abs(p.x - e.x) < 220 && Math.abs(p.y - e.y) < 140;
  if (F.beh === 'walk') {
    var v = F.v * (F.charge && near && Math.sign(p.x - e.x) === e.dir ? 3 : 1), nx = e.x + e.dir * v * dt, f = floorAt(nx + e.dir * 8, e.y - 10, e.y + 18, true);
    if (floorAt(e.x, e.y - 6, e.y + 3, true) === null) { e.vy = (e.vy || 0) + 900 * dt; var fy = floorAt(e.x, e.y - 2, e.y + e.vy * dt + 2, true); if (fy !== null) { e.y = fy; e.vy = 0; } else e.y += e.vy * dt; if (e.y > LV.h * TS + 40) e.alive = false; } // nothing underfoot (its floor crumbled or moved): it falls
    else if (f === null || wallAt(nx + e.dir * 10, e.y - 8)) e.dir = -e.dir; else { var fo = floorAt(nx, e.y - 12, e.y + 18, true); e.x = nx; e.y = fo !== null ? fo : f; }
    if (F.trail && Math.random() < dt * 1.2) FX.push({ k: 'fire', x: e.x, y: e.y, t: 2.2, hurt: 1 });
  } else if (F.beh === 'hop') {
    e.vy = (e.vy || 0) + 900 * dt; var ny = e.y + e.vy * dt, nx2 = e.x + e.dir * F.v * dt * (e.air ? 1 : 0), f2 = floorAt(nx2, Math.min(e.y, ny) - 12, ny + 1, true);
    if (wallAt(nx2 + e.dir * 10, e.y - 8)) e.dir = -e.dir; else e.x = nx2;
    if (f2 !== null && e.vy >= 0 && f2 >= e.y - 12) { e.y = f2; e.vy = 0; e.air = false; e.cd -= dt; if (e.cd <= 0) { e.cd = 0.6 + Math.random() * 0.8; e.vy = -300; e.air = true; if (!floorAt(e.x + e.dir * 30, e.y - 10, e.y + 40, true)) e.dir = -e.dir; if (p && near && Math.random() < 0.6) e.dir = Math.sign(p.x - e.x) || 1; } } else { e.y = ny; e.air = true; }
    if (e.y > LV.h * TS + 40) e.alive = false;
  } else if (F.beh === 'fly') { e.x = e.x0 + Math.sin(e.t * 0.9) * 50; e.y = e.y0 + Math.sin(e.t * 2.3) * 12; e.dir = Math.cos(e.t * 0.9) > 0 ? 1 : -1; if (F.drips && near && Math.random() < dt * 0.8) SHOTS.push({ x: e.x, y: e.y, vx: 0, vy: 40, g: 400, life: 2, k: 'ember' }); }
  else if (F.beh === 'dive') {
    if (!e.diving) { e.x = e.x0 + Math.sin(e.t * 0.8) * 40; e.y = e.y0 + Math.sin(e.t * 2) * 8; e.dir = p && p.x > e.x ? 1 : -1; if (near && Math.abs(p.x - e.x) < 110 && e.t > 1.5) { e.diving = true; e.dv = { x: (p.x - e.x), y: (p.y - 20 - e.y) }; var m = Math.hypot(e.dv.x, e.dv.y) || 1; e.dv.x *= 150 / m; e.dv.y *= 150 / m; e.dt2 = 0; } }
    else { e.dt2 += dt; if (e.dt2 < 0.9) { e.x += e.dv.x * dt; e.y += e.dv.y * dt; } else { e.x += (e.x0 - e.x) * dt * 1.5; e.y += (e.y0 - e.y) * dt * 1.5; if (e.dt2 > 2.6) { e.diving = false; e.t = 0; } } }
  } else if (F.beh === 'float') { e.x = e.x0 + Math.sin(e.t * 0.6) * 30; e.y = e.y0 + Math.sin(e.t * 1.4) * 16; }
  else if (F.beh === 'pop') { // grave hands: the earth shakes, clods jump and the fingertips show first (he said they came out of nowhere)
    var dx = p ? Math.abs(p.x - e.x) : 999, close = near && dx < 190;
    e.warn = close ? Math.min(1.2, (e.warn || 0) + dt) : Math.max(0, (e.warn || 0) - dt * 0.6);
    if (close && e.warn > 0.1 && Math.random() < dt * (16 + e.warn * 30)) FX.push({ k: 'bit', x: e.x - 14 + Math.random() * 28, y: e.y - 4, vx: (Math.random() - 0.5) * 80, vy: -110 - Math.random() * 120, t: 0.6, c: Math.random() < 0.5 ? '#7a6044' : '#4a3624' });
    if (close && e.warn > 0.3 && !e.groan) { e.groan = 1; sfx.play('roar', 0.35); }
    if (!close) e.groan = 0;
    var tgt = close && e.warn >= 1 && dx < 110 ? 1 : 0; e.rise = Math.max(0, Math.min(1, (e.rise || 0) + (tgt ? 2.2 : -1.5) * dt)); e.dir = p && p.x > e.x ? 1 : -1; }
  else if (F.beh === 'turret') e.dir = p && p.x > e.x ? 1 : -1;
  if (F.throws && near) { e.cd -= dt; if (e.cd <= 0) { e.cd = 2.2 + Math.random() * 1.5; var dx = p.x - e.x, tt = 0.9; e.dir = Math.sign(dx) || e.dir;
    if (F.throws === 'orb' || F.throws === 'dagger') { var m2 = Math.hypot(dx, p.y - 20 - (e.y - 20)) || 1; SHOTS.push({ x: e.x, y: e.y - 20, vx: dx / m2 * 150, vy: (p.y - 20 - (e.y - 20)) / m2 * 150, life: 3, k: F.throws }); }
    else SHOTS.push({ x: e.x, y: e.y - 24, vx: dx / tt, vy: -260, g: 560, life: 3, k: F.throws }); sfx.play('throw'); } }
}
function hitFoe(e, n, stomp) {
  e.hp -= n; e.hitT = 0.15;
  if (e.hp <= 0) { e.alive = false; G.score += e.F.pts; G.kills++; poof(e.x, e.y - 12, 12, ['#ff2630', '#f1e7d0', '#ffe36a']); sfx.play('pop');
    if (e.F.split && !e.small) for (var i = -1; i <= 1; i += 2) ENTS.push({ k: 'foe', F: e.F, key: e.key, x: e.x + i * 10, y: e.y, x0: e.x, y0: e.y, t: 0, alive: true, hp: 1, dir: i, cd: 3, small: true });
    if (e.F.burst) poof(e.x, e.y - 14, 14, ['#ff2630', '#12040a', '#f1e7d0']); // balloons pop into confetti, no shrapnel (he said it killed runs)
    FX.push({ k: 'score', x: e.x, y: e.y - 30, t: 0.8, s: '' + e.F.pts, vx: 0, vy: -30, g: 0 });
  } else sfx.play('hit');
}
/* ---------- touching things ---------- */
function touch(e, dt) {
  var p = PL, px = p.x, py = p.y, k = e.k;
  if (k === 'drop' && e.alive && p.loop) { // round a loop he is sideways or upside down: his body points at the loop's middle, so the pickup box turns with him
    var Lc = p.loop.e, lx = Lc.x - px, ly = Lc.y - LOOPR - py, ll = Math.hypot(lx, ly) || 1, bx = px + lx / ll * PH * 0.45, by = py + ly / ll * PH * 0.45;
    if (Math.hypot(e.x - bx, e.y - 6 - by) < PH * 0.5 + 9) { e.alive = false; gotDrop(); FX.push({ k: 'spark', x: e.x, y: e.y - 6, t: 0.25 }); } return; }
  if (k === 'drop') { if (e.alive && Math.abs(px - e.x) < 11 && e.y - 6 > py - PH - 4 && e.y - 6 < py + 4) { e.alive = false; gotDrop(); FX.push({ k: 'spark', x: e.x, y: e.y - 6, t: 0.25 }); } return; }
  if (k === 'foe') {
    if (!e.alive || p.state !== 'normal') return; var F = e.F, w = e.small ? 8 : 11, h = e.small ? 14 : 24;
    if (F.beh === 'pop' && (e.rise || 0) < 0.4) return;
    if (Math.abs(px - e.x) < w + PHW && py > e.y - h - 4 && py - PH < e.y) {
      if (G.star > 0) { hitFoe(e, 99); return; }
      if (p.vy > 40 && py - p.vy / 60 <= e.y - h + 6) { hitFoe(e, F.shield ? 2 : 1, true); p.vy = KIT.held('a') ? -440 : -330; p.air = true; return; }
      // hurt only on a real overlap: a box a little inside both of you (the stomp above still uses the full box)
      if (Math.abs(px - e.x) < w * 0.8 + PHW - 2 && py > e.y - h + 4 && py - PH + 6 < e.y) hurt(e.x);
    }
    return;
  }
  if (k === 'spring') { if (Math.abs(px - e.x) < 12 && py >= e.y - 10 && py <= e.y + 2 && (p.vy >= 0 || !p.air)) { p.vy = -(e.pow === 2 ? 820 : 640); p.air = true; p.jumps = 1; p.spring = 0.5; e.t = 0.25; sfx.play('spring'); } if (e.t > 0) e.t -= dt; return; }
  if (k === 'dash') { if (!p.air && Math.abs(px - e.x) < 14 && Math.abs(py - e.y) < 6) { p.gsp = Math.max(Math.abs(p.gsp), 700) * (e.dir || 1); p.face = e.dir || 1; p.lock = 0.3; if (!e.snd || G.t - e.snd > 0.5) { sfx.play('dash'); e.snd = G.t; } } return; }
  if (k === 'bumper') { var dx = px - e.x, dy = (py - 18) - (e.y - 10), d = Math.hypot(dx, dy); if (d < 24) { var dir = Math.abs(p.vx) > 40 ? Math.sign(p.vx) : (dx >= 0 ? 1 : -1); p.vx = dir * Math.max(230, Math.min(330, Math.abs(p.vx))); p.vy = dy > 4 ? 260 : -500; p.gsp = p.vx; p.air = true; p.jumps = 1; e.t = 0.2; G.score += 10; sfx.play('bump'); } if (e.t > 0) e.t -= dt; return; }
  if (k === 'box') { if (e.alive && Math.abs(px - e.x) < 14 && py > e.y - 26 && py - PH < e.y) { if (p.air || Math.abs(p.gsp) > 200) { openBox(e); if (p.vy > 0) p.vy = -280; } else if (px < e.x) { p.x = e.x - 14 - PHW; p.gsp = 0; } else { p.x = e.x + 14 + PHW; p.gsp = 0; } } return; }
  if (k === 'check') { if (!e.on && Math.abs(px - e.x) < 14 && py > e.y - 40) { e.on = true; G.check = { x: e.x, y: e.y }; sfx.play('check'); FX.push({ k: 'ring', x: e.x, y: e.y - 40, t: 0.5 }); } return; }
  if (k === 'goal') { if (!e.hit && px > e.x) { e.hit = true; e.spin = 2.4; sfx.play('goal'); G.lock = { x0: -1e9, x1: 1e9, cam: Math.max(0, e.x - KIT.W * 0.5) }; actClear(); } /* the camera stays on the sign and he runs off screen */ if (e.spin > 0) e.spin -= dt; return; }
  if (k === 'awning') { awningTouch(e, dt); return; }
  if (k === 'ramp') { rampTouch(e, dt); return; }
  if (k === 'portal') { // the giant ring into a special stage: 50 drops to open it, once per act
    if (e.used || gateUsed(e) || chalCount() >= 7) return; if (Math.abs(px - e.x) < 22 && py > e.y - 46 && py - PH < e.y + 6) { if (G.drops >= 50) { e.used = true; useGate(e); startSpecial(e); } else if (!e.told) { e.told = 1; G.banner = 1.6; G.bannerTxt = '50 DROPS TO ENTER'; } } else e.told = 0; return; }
  if (k === 'arena') { if (!G.lock && px > e.c0 * TS + 80) startBoss(e); return; }
  // hazards
  if (k === 'jet') { var c = (G.t + e.ph * 2) % 3, on = c > 2.0; e.on = on; e.warn = c > 1.6 && c <= 2.0; if (on && Math.abs(px - e.x) < 10 && py > e.y - 56) hurt(e.x); return; }
  if (k === 'crusher') { var c2 = (G.t + e.ph * 2) % 3, top = e.y0 - 4, bot = e.yb || (e.yb = (function () { var f = floorAt(e.x, e.y0, e.y0 + 9 * TS, false); return f === null ? e.y0 + 7 * TS : f; })());
    e.cy = c2 < 1.2 ? top : c2 < 1.42 ? top + (bot - top) * ((c2 - 1.2) / 0.22) : c2 < 2.0 ? bot : bot - (bot - top) * ((c2 - 2.0) / 1.0); if (c2 >= 1.42 && c2 < 1.47 && !e.thud) { e.thud = 1; if (Math.abs(px - e.x) < 260) { sfx.play('thud'); G.shake = 3; } } if (c2 < 1.42) e.thud = 0;
    if (Math.abs(px - e.x) < 16 + PHW && py > e.cy - 26 && py - PH < e.cy) { if (c2 > 1.2 && c2 < 2.0) hurt(e.x); } return; }
  if (k === 'zap') { var c3 = (G.t + e.ph * 2) % 3, on2 = c3 > 1.7; e.on = on2; e.warn = c3 > 1.4 && c3 <= 1.7; if (on2 && !p.air && Math.abs(px - e.x) < 26 && Math.abs(py - e.y) < 4) hurt(e.x); return; }
  if (k === 'saw') { var off = Math.sin(G.t * 1.6 + e.ph) * 44; e.sx = e.x + (e.vert ? 0 : off); e.sy = e.y - 14 - (e.vert ? 30 + off * 0.8 : 0); if (Math.hypot(px - e.sx, py - 18 - e.sy) < 13 + 10) hurt(e.sx); return; }
}
function openBox(e) {
  e.alive = false; poof(e.x, e.y - 12, 10, ['#f1e7d0', '#ffe36a']); sfx.play('box'); var it = e.item || 'drops', p = PL;
  if (it === 'drops') { for (var i = 0; i < 10; i++) gotDrop(true); sfx.play('drop'); }
  else if (it === 'shield') p.shield = 1;
  else if (it === 'shoes') G.shoes = 15;
  else if (it === 'star') { G.star = 15; }
  else if (it === 'life') { G.lives++; sfx.play('life'); }
  FX.push({ k: 'item', x: e.x, y: e.y - 30, t: 1.2, s: ITEMS[it], vx: 0, vy: -20, g: 0 });
}
function gotDrop(quiet) { G.drops++; if (!quiet) sfx.play('drop'); if (G.drops >= G.nextLife) { G.nextLife += 100; G.lives++; sfx.play('life'); FX.push({ k: 'item', x: PL.x, y: PL.y - 50, t: 1.4, s: 'EXTRA LIFE', vx: 0, vy: -20, g: 0 }); } }
function poof(x, y, n, cols) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = 40 + Math.random() * 100; FX.push({ k: 'bit', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, t: 0.4 + Math.random() * 0.3, c: cols[i % cols.length] }); } }

/* Night City street furniture: lamps every so often along the pavement, and bins, hydrants, benches, cones and
   bus stops between them, only on flat ground with nothing else standing there */
function cityProps() {
  var out = [], last = -99, lastLamp = -99, busy = {}, shopEnd = -99, si = Math.floor(hash2(LV.ai, 7, 3) * SHOPS.length);
  ENTS.forEach(function (e) { if (e.k !== 'drop') busy[Math.floor(e.x / TS)] = 1; });
  function open(ch) { return ch === '.'; }
  function topAt(c) { for (var r = 1; r < LV.h; r++) { var ch = T(c, r); if (open(ch)) continue; if ((ch === '#' || ch === '_' || ch === '-') && isSolid(T(c, r + 1), c, r + 1)) return r; return null; } return null; }
  function deep(c, r) { for (var y = r; y < Math.min(LV.h, r + 6); y++) if (T(c, y) !== '#') return false; return true; } // real ground, not a bridge or a slab over the low road
  function flat(c, n) { var r = topAt(c); if (r === null) return null; for (var i = -1; i <= n; i++) if (topAt(c + i) !== r || !deep(c + i, r) || busy[c + i]) return null; return r; }
  for (var c = 6; c < LV.w - 6; c++) {
    // one of the town's shops now and then, standing on a long flat bit of solid street
    if (c - shopEnd > 34) { var id = SHOPS[si % SHOPS.length], f = KIT.SPR[id]; if (f) { var sc = shopSc(f), wc = Math.ceil(f[2] * sc / TS) + 1, rs = flat(c, wc);
      if (rs !== null) { out.push({ shop: id, sc: sc, x: c * TS + (wc * TS) / 2, y: rs * TS }); shopEnd = c + wc; si++; lastLamp = c + wc - 10; c += wc; continue; } } }
    var r = topAt(c); if (r === null || topAt(c - 1) !== r || topAt(c + 1) !== r || topAt(c + 2) !== r || busy[c] || busy[c + 1] || busy[c - 1]) continue;
    var h = hash2(c, r, 41), y = r * TS;
    if (c - lastLamp >= 14) { out.push({ k: 'hog_lamp', x: c * TS + 8, y: y, lamp: 1 }); lastLamp = last = c; continue; }
    if (c - last >= 5 && h < 0.3) { out.push({ k: ['hog_bin', 'hog_hydrant', 'hog_bench', 'hog_bus', 'hog_cone', 'hog_bin', 'hog_hydrant'][Math.floor(hash2(c, 3, 9) * 7)], x: c * TS + 8, y: y, flip: hash2(c, 5, 2) < 0.5 }); last = c; }
  }
  return out.sort(function (a, b) { return (b.shop ? 1 : 0) - (a.shop ? 1 : 0); }); // buildings first, street things in front
}
/* the town's shop fronts from Load Legacy (same scale rule as its street), names in their marquees */
var SHOPS = ['fac_cafe', 'fac_arcade', 'fac_amy', 'fac_club', 'fac_beebs', 'fac_t', 'fac_tb', 'fac_greebo', 'fac_saba', 'fac_joff', 'fac_sanct', 'fac_pulsar', 'fac_bonjo'];
var SHOPNEON = {}; // names are baked into every shop front's marquee (tools/load-legacy/facnames.py): never draw them on top
function shopSc(f) { return Math.min(1.7, 150 / f[3], 112 / f[2]); }

/* street furniture district by district: each district's own things (the high road and the low road have
   theirs), never the same thing twice in a row, its own shops spread along its longest flat stretches */
function distProps() {
  var out = [], busy = {}, lastK = null, last = -99, lastLamp = -99;
  var hard = {}; ENTS.forEach(function (e) { if (e.k !== 'drop') { var c = Math.floor(e.x / TS); busy[c] = busy[c - 1] = busy[c + 1] = 1; if (e.k !== 'foe' && e.k !== 'box') hard[c] = hard[c - 1] = hard[c + 1] = 1; } }); // shops may stand behind foes and boxes
  function inCave(c) { return (LV.caves || []).some(function (q) { return c >= q.c0 - 2 && c <= q.c1 + 2; }); }
  function surfAt(c, r) { if (inCave(c)) return false; var ch = T(c, r); return (ch === '#' || ch === '_' || ch === '-') && (T(c, r - 1) === '.' || T(c, r - 1) === 'k') && isSolid(T(c, r + 1), c, r + 1); }
  function deep(c, r) { for (var y = r; y < Math.min(LV.h, r + 3); y++) if (T(c, y) !== '#') return false; return true; } // the street over the low road counts
  // shops first: in each district, the flat solid stretches long enough, spread out
  LV.dists.forEach(function (d, i) { var D = DIST[d.id], c1 = i + 1 < LV.dists.length ? LV.dists[i + 1].c : LV.w; if (!D || !D.shops.length) return;
    var spots = [];
    for (var c = d.c + 8; c < c1 - 8; c++) { var r = null; for (var y = 1; y < LV.h; y++) if (surfAt(c, y)) { r = y; break; } if (r === null || bandAt(c, r) !== 'mid') continue;
      var f = KIT.SPR[D.shops[0]], w = f ? Math.ceil(f[2] * shopSc(f) / TS) : 7, ok = true; for (var k = 0; k < w; k++) if (!surfAt(c + k, r) || !deep(c + k, r) || hard[c + k]) { ok = false; break; } if (ok) spots.push([c, r]); }
    var n = D.shops.length, used = [];
    D.shops.forEach(function (id, j) { var want = d.c + (c1 - d.c) * (j + 0.5) / n, best = null; spots.forEach(function (s) { if (used.some(function (u) { return Math.abs(u - s[0]) < 14; })) return; if (!best || Math.abs(s[0] - want) < Math.abs(best[0] - want)) best = s; });
      if (!best) return; used.push(best[0]); var f = KIT.SPR[id]; if (!f) return; var sc = shopSc(f), wc = Math.ceil(f[2] * sc / TS);
      out.push({ shop: id, sc: sc, x: best[0] * TS + wc * TS / 2, y: best[1] * TS }); for (var k = -2; k <= wc + 2; k++) busy[best[0] + k] = 1; });
  });
  // then the furniture, on every walkable surface, high road and low road included
  for (var c = 4; c < LV.w - 4; c++) { var id = distAt(c); if (!id) continue;
    for (var r = 1; r < LV.h; r++) { if (!surfAt(c, r) || !surfAt(c + 1, r) || !surfAt(c - 1, r) || busy[c]) continue;
      var band = bandAt(c, r), S = styleOf(id, band), list = S.props || [], h = hash2(c, r, 61), lampy = band === 'mid' && (id === 'row' || id === 'cafe' || id === 'plaza' || id === 'downtown');
      if (lampy && c - lastLamp >= 15 && surfAt(c - 2, r) && surfAt(c + 2, r)) { out.push({ k: id === 'downtown' || id === 'plaza' ? 'hog_lamp2' : 'hog_lamp', x: c * TS + 8, y: r * TS, lamp: 1 }); lastLamp = c; busy[c] = busy[c + 1] = 1; continue; }
      if (c - last < 5 || h > 0.32 || !list.length) continue;
      var k2 = list[Math.floor(hash2(c, 7, 3) * list.length)]; if (k2 === lastK) k2 = list[(list.indexOf(k2) + 1) % list.length];
      var fp = KIT.SPR['hog_' + k2], half = fp ? Math.ceil(fp[2] / 2 / TS) : 1, flat = true; for (var fx = -half; fx <= half; fx++) if (!surfAt(c + fx, r) || busy[c + fx]) { flat = false; break; } if (!flat) continue; // its whole width stands on flat ground
      lastK = k2; last = c;
      out.push({ k: 'hog_' + k2, x: c * TS + 8, y: r * TS + (k2 === 'puddle' || k2 === 'grate' ? 3 : 0), flip: hash2(c, 5, 2) < 0.5 && k2 !== 'subsign' && k2 !== 'roadsign' && k2 !== 'neonarrow' }); for (var bk = -half - 1; bk <= half + 1; bk++) busy[c + bk] = 1;
    } }
  return out.sort(function (a, b) { return (b.shop ? 1 : 0) - (a.shop ? 1 : 0); });
}
