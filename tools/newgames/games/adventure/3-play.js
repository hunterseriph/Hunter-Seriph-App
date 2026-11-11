/* ---------- playing a stage ---------- */
var SV = KIT.load('sa-save', null);
function freshSave() { return { done: {}, prog: { cumhead: 0, greebo: 0, spermaid: 0, lab: 0, super: 0 }, stars: {}, drops: 0, lives: 5, homs: [], eggs: 1, fruit: 3, hats: {}, garden: { t: 0 }, seen: {} }; }
if (!SV) SV = freshSave();
function persist() { KIT.save('sa-save', SV); }
var G = { mode: 'title', t: 0 }, P = null, CAMS = { yaw: 0, pitch: 0.25, x: 0, y: 3, z: -8 }, FX = [], SHOTS = [], BOSS = null, RUN = null;
function mkFoe(k, x, y, z) { return { k: k, s: FOES[k] || 'f_crawler_', x: x, y: y + (FLY[k] ? 1.6 : 0), z: z, hx: x, hz: z, hp: 1, t: Math.random() * 6, dead: 0, fly: !!FLY[k], cd: 2 + Math.random() * 2 }; }
function startRun(o) { // o: { who, stage | boss | hub, ev }
  if (!R3.ok) { G.mode = 'nogl'; return; }
  buildAtlas(); RUN = o; var who = o.who; BOSS = null; FX = []; SHOTS = [];
  LV = o.stage ? buildStage(o.stage, who) : o.boss ? buildArena(o.boss) : buildHub(o.hub);
  if (o.boss) BOSS = mkBoss(o.boss);
  buildMesh(); KIT.closeMenu();
  var C = CHARS[who]; P = { who: who, C: C, x: LV.start.x, y: LV.start.y + 0.1, z: LV.start.z, vx: 0, vy: 0, vz: 0, a: LV.start.a, ground: 1, rings: 0, t: 0, inv: 0, ball: 0, spin: 0, homing: 0, glide: 0, climb: null, swim: 0, lock: [], anim: 0, hurtT: 0, face: 1, got: 0 };
  CAMS.yaw = 0; CAMS.x = P.x; CAMS.z = P.z - 7; CAMS.y = P.y + 3; G.mode = 'play'; G.time = 0; G.found = 0; G.check = { x: P.x, y: P.y, z: P.z };
  var song = o.boss ? (o.boss === 'supertb' ? 'super' : 'hogboss') : o.stage ? THEMES[LV.theme].song : HUBS[o.hub].song; music.play(song);
  G.banner = { t: 3, s: o.stage ? STAGES[o.stage].n : o.boss ? BOSSES[o.boss].n : HUBS[o.hub].n, b: o.stage ? jobLine(LV.job) : o.boss ? 'BOSS' : '' };
}
function jobLine(j) { return j === 'hunt' ? 'FIND THE THREE INGREDIENTS' : j === 'water' ? 'SWIM TO THE END' : j === 'shoot' ? 'CLEAN UP THE STREETS' : 'RUN TO THE CHALICE'; }
function camAxes() { return { f: [Math.sin(CAMS.yaw), Math.cos(CAMS.yaw)], r: [-Math.cos(CAMS.yaw), Math.sin(CAMS.yaw)] }; }
function stepPlayer(dt) {
  var p = P, C = p.C, mv = KIT.stick(0), ax = camAxes(), wx = ax.f[0] * -mv.y + ax.r[0] * mv.x, wz = ax.f[1] * -mv.y + ax.r[1] * mv.x, wl = Math.hypot(wx, wz);
  p.t += dt; p.inv = Math.max(0, p.inv - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.homing = Math.max(0, p.homing - dt);
  var water = inWater(p.x, p.y + 0.6, p.z), job = LV.job;
  if (p.loop) { var Lp = p.loop; Lp.t += dt * 1.6; var a = Lp.t * Math.PI * 2; p.z = Lp.z + Math.sin(a) * Lp.r * 0.9; p.y = Lp.y + Lp.r - Math.cos(a) * Lp.r; p.x = Lp.x + Lp.t * 1.2; if (Lp.t >= 1) { p.loop = null; p.vz = 26; p.vy = 0; p.z = Lp.z + 0.5; p.y = Lp.y; } return; }
  // swimming (Spermaid swims anywhere there is water; the rest float and paddle)
  if (water) { p.swim = 1; var sw = p.who === 'spermaid' ? 9 : 4; p.vx += (wx * sw - p.vx) * Math.min(1, dt * 4); p.vz += (wz * sw - p.vz) * Math.min(1, dt * 4); var up = (KIT.held('a') ? 1 : 0) - (KIT.held('b') ? 1 : 0); if (p.who === 'spermaid') p.vy += (up * 6 - p.vy) * Math.min(1, dt * 4); else { p.vy += (up > 0 ? 8 : -2) * dt; p.vy *= 0.92; }
    if (KIT.pressed('a') && p.y > water.y1 - 1.2) { p.vy = C.jumpV * 1.1; } if (wl > 0.2) p.a = Math.atan2(wx, wz); }
  else { p.swim = 0;
    var spd = Math.hypot(p.vx, p.vz), top = C.top * (p.boost > 0 ? 1.6 : 1), acc = p.ground ? C.acc : C.acc * 0.55;
    if (wl > 0.2) { var tx = wx / Math.max(1, wl), tz = wz / Math.max(1, wl); p.vx += tx * acc * dt; p.vz += tz * acc * dt; var s2 = Math.hypot(p.vx, p.vz); if (s2 > top) { p.vx *= top / s2; p.vz *= top / s2; } p.a = Math.atan2(p.vx, p.vz); }
    else if (p.ground) { var f = Math.max(0, 1 - dt * (p.ball ? 1.2 : 7)); p.vx *= f; p.vz *= f; }
    p.boost = Math.max(0, (p.boost || 0) - dt);
    p.vy -= (p.glide && p.vy < 0 ? 4 : 26) * dt; if (p.glide && p.vy < -2) p.vy = -2;
    // A: jump; in the air: Cumhead homing attack, Greebo glides (hold), Laboozie hovers a little
    if (KIT.pressed('a')) { if (p.ground || p.climb) { p.vy = C.jumpV; p.ground = 0; p.ball = 1; if (p.climb) { p.vx = -Math.sin(p.a) * 5; p.vz = -Math.cos(p.a) * 5; p.climb = null; } sfx.play('jump'); }
      else if ((p.who === 'cumhead' || p.who === 'super') && !p.homed) { var tg = homingTarget(); p.homed = 1; if (tg) { var dx = tg.x - p.x, dy = tg.y + 0.5 - p.y, dz = tg.z - p.z, d = Math.hypot(dx, dy, dz); p.vx = dx / d * 26; p.vy = dy / d * 26; p.vz = dz / d * 26; p.homing = 0.5; } else { p.vx += Math.sin(p.a) * 12; p.vz += Math.cos(p.a) * 12; } sfx.play('shoot'); }
      else if (p.who === 'greebo') p.glide = 1; }
    if (!KIT.held('a')) p.glide = 0;
    // B: Cumhead spin dash (hold, let go), Greebo punch, Spermaid tail spin, Laboozie lock on and throw bags (hold to lock, let go to throw)
    if (p.who === 'cumhead' || p.who === 'super') { if (KIT.held('b') && p.ground) { p.charge = Math.min(1, (p.charge || 0) + dt * 1.5); p.vx *= 0.9; p.vz *= 0.9; p.ball = 1; } else if (p.charge) { p.vx = Math.sin(p.a) * (14 + p.charge * 22); p.vz = Math.cos(p.a) * (14 + p.charge * 22); p.charge = 0; p.ball = 1; p.boost = 1; sfx.play('power'); } }
    else if (p.who === 'lab') { if (KIT.held('b')) { p.locking = 1; var cand = LV.foes.concat(BOSS ? [BOSS] : []).filter(function (e) { if (e.dead || e.hp <= 0) return false; var dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz); if (d > 22) return false; var ang = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - p.a), Math.cos(Math.atan2(dx, dz) - p.a))); return ang < 0.8; }); cand.forEach(function (e) { if (p.lock.indexOf(e) < 0 && p.lock.length < 6) { p.lock.push(e); sfx.play('tick'); } }); }
      else if (p.locking) { p.locking = 0; (p.lock.length ? p.lock : [null]).forEach(function (e, i) { SHOTS.push({ x: p.x, y: p.y + 1.2, z: p.z, tgt: e, vx: Math.sin(p.a) * 18, vy: 2, vz: Math.cos(p.a) * 18, t: 2, mine: 1, delay: i * 0.08 }); }); p.lock = []; sfx.play('shoot'); } }
    else if (KIT.pressed('b') && !p.atkT) { p.atkT = 0.35; sfx.play('step'); }
    if (p.atkT) { p.atkT = Math.max(0, p.atkT - dt); if (p.atkT > 0.15) attackNear(p.who === 'greebo' ? 2.2 : 2.6); }
  }
  // move, walls, ground
  var ox = p.x, oz = p.z; p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
  var wall = pushWalls(p, 0.45);
  if (wall && p.who === 'greebo' && wall.climb && !p.ground && !water) { p.climb = wall; p.vy = 0; } // Greebo grabs the wall
  if (p.climb) { p.vy = -mv.y * -4; if (!KIT.stick(0).on) p.vy = 0; p.glide = 0; if (p.y > p.climb.y1 - 0.2) { p.y = p.climb.y1; p.climb = null; p.vx = Math.sin(p.a) * 3; p.vz = Math.cos(p.a) * 3; } }
  var g = groundAt(p.x, p.z, p.y); if (p.vy <= 0 && p.y <= g.y && g.y > -900) { p.y = g.y; if (!p.ground && p.vy < -6) sfx.play('land'); p.vy = 0; p.ground = 1; p.ball = p.charge ? 1 : 0; p.homed = 0; p.glide = 0; p.climb = null; if (g.src && g.src.ya !== undefined) { var sl = (g.src.yb - g.src.ya) / ((g.src.ax === 'z' ? g.src.z1 - g.src.z0 : g.src.x1 - g.src.x0) || 1); p.vz -= sl * 18 * dt * (g.src.ax === 'z' ? 1 : 0); } }
  else if (p.y > g.y + 0.05) p.ground = 0;
  if (p.y < -30) { hurt(true); }
  p.anim += Math.hypot(p.x - ox, p.z - oz) * 0.9;
  // springs, pads, loops, rings
  LV.springs.forEach(function (s) { if (Math.hypot(s.x - p.x, s.z - p.z) < 1.2 && Math.abs(s.y - p.y) < 1) { p.vy = s.vy; p.vz = s.vz; p.ground = 0; p.ball = 1; sfx.play('jump'); } });
  LV.pads.forEach(function (d) { if (Math.hypot(d.x - p.x, d.z - p.z) < 1.5 && Math.abs(d.y - p.y) < 1) { p.vx = d.dx * 28; p.vz = d.dz * 28; p.boost = 1.2; p.a = Math.atan2(d.dx, d.dz); sfx.play('power'); } });
  LV.loops.forEach(function (L2) { if (!p.loop && Math.abs(p.z - (L2.z - 4)) < 1 && Math.abs(p.x - L2.x) < 3 && p.vz > 14 && Math.abs(p.y - L2.y) < 1) { p.loop = { x: p.x, y: L2.y, z: L2.z - 4, r: L2.r, t: 0 }; } });
  LV.rings.forEach(function (r) { if (!r.got && Math.hypot(r.x - p.x, r.y - (p.y + 0.7), r.z - p.z) < 1.1) { r.got = 1; p.rings++; sfx.play('coin'); } });
  LV.items.forEach(function (it) { if (!it.got && Math.hypot(it.x - p.x, it.y - p.y - 0.7, it.z - p.z) < 1.4) { it.got = 1; G.found++; sfx.play('power'); G.banner = { t: 2.5, s: ['THE DOUBLE CREAM', 'THE BLOODMOON CHERRY', 'THE PASTRY OF THE GODS'][it.n] + '!', b: G.found + ' OF 3' }; if (G.found >= 3) finish(); } });
  if (LV.goal && Math.hypot(LV.goal.x - p.x, LV.goal.z - p.z) < 2 && Math.abs(LV.goal.y - p.y) < 3 && (!LV.mini || LV.mini.dead)) finish();
  if (LV.mini && !LV.mini.on && p.z > LV.mini.at) { LV.mini.on = 1; BOSS = mkBoss(['beast', 'golem', 'execu', 'hotload'][(LV.id.length) % 4], LV.mini); BOSS.mini = 1; G.banner = { t: 2.5, s: 'MINI BOSS', b: BOSS.B.n }; music.play('hogboss'); }
  // the hub: portals and people
  if (LV.hub !== undefined) hubStep(dt);
  // foes
  LV.foes.forEach(function (e) { if (e.dead) { e.dt = (e.dt || 0) + dt; return; } e.t += dt; if (e.fly) { e.y = e.y + Math.sin(e.t * 2) * 0.01; e.x = e.hx + Math.sin(e.t * 0.8) * 2; } else { e.z = e.hz + Math.sin(e.t * 0.6) * 2.5; }
    e.cd -= dt; if (e.cd <= 0 && Math.hypot(e.x - p.x, e.z - p.z) < 18 && (e.k === 'imp' || e.k === 'skeleton' || e.k === 'clown' || e.k === 'knight')) { e.cd = 3; var dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz) || 1; SHOTS.push({ x: e.x, y: e.y + 1, z: e.z, vx: dx / d * 9, vy: 0, vz: dz / d * 9, t: 3, foe: 1 }); }
    var d2 = Math.hypot(e.x - p.x, e.y + 0.6 - (p.y + 0.7), e.z - p.z); if (d2 < 1.3) { if (p.ball || p.homing > 0 || p.atkT > 0.1 || p.who === 'super' || (p.vy < -1 && p.y > e.y + 0.3)) { killFoe(e); if (!p.ground) { p.vy = 8; p.homed = 0; } } else hurt(); } });
  stepShots(dt);
  if (BOSS) stepBoss(dt);
  if (p.who === 'super') { G.superT = (G.superT || 0) + dt; if (G.superT > 1) { G.superT = 0; p.rings = Math.max(0, p.rings - 1); if (p.rings <= 0 && BOSS && BOSS.hp > 0) hurt(true); } }
}
function homingTarget() { var best = null, bd = 12; LV.foes.concat(BOSS && BOSS.hp > 0 ? [BOSS] : []).forEach(function (e) { if (e.dead) return; var dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz, e.y - P.y); if (d > bd) return; var ang = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - P.a), Math.cos(Math.atan2(dx, dz) - P.a))); if (ang < 1.2) { bd = d; best = e; } }); return best; }
function attackNear(r) { LV.foes.forEach(function (e) { if (!e.dead && Math.hypot(e.x - P.x, e.z - P.z) < r && Math.abs(e.y - P.y) < 2) killFoe(e); }); if (BOSS && BOSS.hp > 0 && Math.hypot(BOSS.x - P.x, BOSS.z - P.z) < r + BOSS.r && !BOSS.hitCd) hitBoss(); }
function killFoe(e) { e.dead = 1; e.dt = 0; sfx.play('hit'); KIT.shake(2); for (var i = 0; i < 10; i++) FX.push({ x: e.x, y: e.y + 0.8, z: e.z, vx: (Math.random() - 0.5) * 6, vy: Math.random() * 6, vz: (Math.random() - 0.5) * 6, t: 0.6, c: [0.6, 0.5, 0.2] }); if (Math.random() < 0.5) LV.rings.push({ x: e.x, y: e.y, z: e.z }); }
function hurt(fall) {
  var p = P; if (!fall && p.inv > 0) return; if (fall) { SV.lives--; p.x = G.check.x; p.y = G.check.y + 1; p.z = G.check.z; p.vx = p.vy = p.vz = 0; p.rings = 0; p.inv = 2; sfx.play('lose'); if (SV.lives <= 0) { SV.lives = 3; G.banner = { t: 3, s: 'GAME OVER', b: 'BACK TO THE START' }; } persist(); return; }
  if (p.rings <= 0) { hurt(true); return; } var n = Math.min(20, p.rings); p.rings = 0; for (var i = 0; i < n; i++) { var a = i / n * 6.283; FX.push({ ring: 1, x: p.x, y: p.y + 1, z: p.z, vx: Math.cos(a) * 5, vy: 6, vz: Math.sin(a) * 5, t: 4 }); }
  p.inv = 1.8; p.hurtT = 0.5; p.vy = 6; p.vx = -Math.sin(p.a) * 5; p.vz = -Math.cos(p.a) * 5; sfx.play('hurt'); KIT.shake(4);
}
function stepShots(dt) { SHOTS.forEach(function (s) { if (s.delay > 0) { s.delay -= dt; s.x = P.x; s.y = P.y + 1.2; s.z = P.z; return; } s.t -= dt;
    if (s.tgt && !s.tgt.dead && (s.tgt.hp === undefined || s.tgt.hp > 0)) { var dx = s.tgt.x - s.x, dy = s.tgt.y + (s.tgt.boss ? s.tgt.r : 0.6) - s.y, dz = s.tgt.z - s.z, d = Math.hypot(dx, dy, dz) || 1; s.vx = dx / d * 22; s.vy = dy / d * 22; s.vz = dz / d * 22; if (d < 1) { if (s.tgt.boss) hitBoss(); else killFoe(s.tgt); s.t = 0; FX.push({ fire: 1, x: s.x, y: s.y, z: s.z, t: 0.8 }); } }
    s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; if (s.foe && Math.hypot(s.x - P.x, s.y - P.y - 0.7, s.z - P.z) < 0.8) { hurt(); s.t = 0; }
    if (s.mine && !s.tgt) { LV.foes.forEach(function (e) { if (!e.dead && Math.hypot(e.x - s.x, e.z - s.z) < 1.2) { killFoe(e); s.t = 0; } }); if (BOSS && BOSS.hp > 0 && Math.hypot(BOSS.x - s.x, BOSS.z - s.z) < BOSS.r + 0.5) { hitBoss(); s.t = 0; } } });
  SHOTS = SHOTS.filter(function (s) { return s.t > 0; });
  FX.forEach(function (f) { if (f.ring) { f.vy -= 14 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.z += f.vz * dt; var g = groundAt(f.x, f.z, f.y); if (f.y < g.y) { f.y = g.y; f.vy = Math.abs(f.vy) * 0.6; } if (f.t < 3.2 && Math.hypot(f.x - P.x, f.y - P.y - 0.7, f.z - P.z) < 1.2) { f.t = 0; P.rings++; sfx.play('coin'); } } }); }
/* ---------- bosses: stun them, then hit them (jump on them, homing attack, punches, tail, bags) ---------- */
function mkBoss(k, at) { var B = BOSSES[k], sz = KIT.size(B.s.slice(-1) === '_' ? B.s + '0' : B.s), h = sz.h / 32 * B.sc * 0.5; return { boss: 1, k: k, B: B, x: at ? at.x : 0, y: at ? at.y : 0, z: at ? at.z : 8, hp: B.hp, mhp: B.hp, st: 'idle', t: 0, mi: 0, r: Math.max(1.2, h * 0.35), h: h, stun: 0, hitCd: 0, vy: 0 }; }
function stepBoss(dt) {
  var b = BOSS, p = P; if (b.hp <= 0) { b.dt = (b.dt || 0) + dt; return; } b.t += dt; b.hitCd = Math.max(0, b.hitCd - dt); var dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz) || 1, sp = b.hp < b.mhp / 2 ? 1.3 : 1;
  if (b.stun > 0) { b.stun -= dt; } else if (b.st === 'idle') { b.x += dx / d * 3 * dt * sp; b.z += dz / d * 3 * dt * sp; if (b.t > 1.6 / sp) { b.st = b.B.moves[b.mi++ % b.B.moves.length]; b.t = 0; b.n = 0; } }
  else if (b.st === 'charge') { if (b.t < 0.7) { b.cx = dx / d; b.cz = dz / d; } else { b.x += b.cx * 16 * dt * sp; b.z += b.cz * 16 * dt * sp; if (b.t > 2) { b.st = 'idle'; b.t = 0; b.stun = 1.6; } } }
  else if (b.st === 'jump') { if (b.t < 0.5) { b.tx = p.x; b.tz = p.z; } else if (!b.air) { b.air = 1; b.vy = 14; } if (b.air) { b.vy -= 26 * dt; b.y += b.vy * dt; b.x += (b.tx - b.x) * dt * 2; b.z += (b.tz - b.z) * dt * 2; var gy = groundAt(b.x, b.z, b.y).y; if (b.y <= gy && b.vy < 0) { b.y = gy; b.air = 0; b.st = 'idle'; b.t = 0; b.stun = 2; KIT.shake(8); sfx.play('boom'); FX.push({ wave: 1, x: b.x, y: b.y, z: b.z, t: 0.8 }); if (d < 6 && p.ground) hurt(); } } }
  else if (b.st === 'shots' || b.st === 'coins' || b.st === 'pills') { if (b.t > 0.4 + b.n * 0.35 && b.n < (b.B.dark ? 6 : 4)) { b.n++; SHOTS.push({ x: b.x, y: b.y + b.h * 0.6, z: b.z, vx: dx / d * 11, vy: b.st === 'coins' ? 5 : 0, vz: dz / d * 11, t: 3, foe: 1, pill: b.st === 'pills' }); sfx.play('shoot'); } if (b.t > 2.2) { b.st = 'idle'; b.t = 0; b.stun = b.B.dark ? 0.8 : 1.2; } }
  else if (b.st === 'ring') { if (!b.n) { b.n = 1; for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283; SHOTS.push({ x: b.x, y: b.y + 1, z: b.z, vx: Math.cos(a) * 9, vy: 0, vz: Math.sin(a) * 9, t: 3, foe: 1 }); } sfx.play('shoot'); } if (b.t > 1.4) { b.st = 'idle'; b.t = 0; b.stun = 1; } }
  pushWalls(b, b.r); var g = groundAt(b.x, b.z, b.y + 1); if (!b.air && g.y > -900) b.y = g.y;
  var dd = Math.hypot(b.x - p.x, b.z - p.z); if (dd < b.r + 0.6 && Math.abs(p.y - b.y) < b.h) { if ((p.y > b.y + b.h * 0.6 && p.vy < 0) || p.homing > 0 || (p.ball && b.stun > 0) || p.who === 'super') { if (!b.hitCd) { hitBoss(); p.vy = 10; p.vx = -dx / d * 8; p.vz = -dz / d * 8; p.homing = 0; } } else if (b.stun <= 0) hurt(); }
}
function hitBoss() { var b = BOSS; if (b.hitCd > 0 || b.hp <= 0) return; b.hp--; b.hitCd = 0.8; b.stun = 0.4; sfx.play('hit'); KIT.shake(5); FX.push({ flashB: 1, t: 0.15 });
  if (b.hp <= 0) { sfx.play('win'); KIT.shake(12); for (var i = 0; i < 40; i++) FX.push({ x: b.x, y: b.y + b.h / 2, z: b.z, vx: (Math.random() - 0.5) * 16, vy: Math.random() * 12, vz: (Math.random() - 0.5) * 16, t: 1, c: [0.6, 0.1, 0.1] }); if (b.mini) { LV.mini.dead = 1; G.banner = { t: 2, s: 'MINI BOSS DOWN' }; music.play(THEMES[LV.theme].song); } else setTimeout(finish, 1800); } }
function finish() { if (G.mode !== 'play') return; G.mode = 'clear'; sfx.play('win'); music.stop(1); SV.drops += P.rings; var key = RUN.stage ? RUN.who + ':' + RUN.stage : RUN.boss ? RUN.who + ':' + RUN.boss : null;
  if (key && !SV.stars[key]) { SV.stars[key] = 1; } if (Math.random() < 0.35) { SV.eggs++; G.egg = 1; } else G.egg = 0; persist(); setTimeout(clearMenu, 1400); }
