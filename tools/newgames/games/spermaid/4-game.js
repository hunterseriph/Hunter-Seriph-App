/* ---------- a run ---------- */
var G = { mode: 'title', frenzy: 0, freeze: 0, bot: false }, P, S, run, CAM = { x: 0, y: 0 };
var foes = [], shots = [], eshots = [], pools = [], rings = [], marks = [], fx = [], nums = [], loot = [], hazards = [], banner = null, FOEID = 1;
var MAXLV = 8;
function baseStats() { return { might: 1, armour: 0, hpMul: 1, regen: 0, cool: 1, area: 1, pspd: 1, dur: 1, amount: 0, move: 1, magnet: 1, luck: 1, growth: 1, greed: 1, revives: 0, rerolls: 0, skips: 0, banish: 0, waveK: 1 }; }
function calc() {
  var s = baseStats();
  POWERS.forEach(function (p) { var l = SV.ups[p.id] || 0; if (l) p.f(s, l); });
  for (var f in SV.friends) if (FRIENDS[f]) FRIENDS[f].f(s);
  if (run) run.charms.forEach(function (c) { CHARMS[c.id].f(s, c.lv); });
  S = s;
  if (P) { var k = P.hp / (P.max || 1); P.max = Math.round(120 * S.hpMul); P.hp = Math.min(P.max, Math.max(1, k * P.max)); }
}
function newRun(stageId, weapon) {
  var st = STAGE[stageId];
  run = { st: st, t: 0, kills: 0, lvl: 1, xp: 0, need: 5, gold: 0, weapons: [], charms: [], banished: {}, pending: 0, chests: [], dmg: {}, broken: {}, minis: [], miniDone: 0, bossOn: false, cleared: false, endless: false,
    nextEv: 20, nextElite: 45, nextHz: 6, nextBoss: 0, picks: {} };
  P = { x: 0, y: 0, hp: 100, max: 100, face: 1, inv: 0, walk: 0, wave: 0, dashT: 0, dashCd: 0, dvx: 0, dvy: 0, vx: 0, vy: 0, slowT: 0 };
  S = null; calc(); P.hp = P.max; run.rerolls = S.rerolls; run.skips = S.skips; run.banish = S.banish; run.revives = S.revives;
  foes = []; shots = []; eshots = []; pools = []; rings = []; marks = []; fx = []; nums = []; loot = []; hazards = []; LATER = []; G.frenzy = 0; G.freeze = 0; banner = null;
  run.minis = st.minis.map(function (m) { if (m !== '?') return m; var o = Object.keys(BOSSES).filter(function (b) { return b !== 'moon' && b !== 'mega' && st.minis.indexOf(b) < 0; }); return pick(o); });
  if (run.minis[0] === run.minis[1]) run.minis[1] = 'blum2';
  addWeapon(weapon || 'droplet');
  // the cell with a friend in it, somewhere out there
  if (!SV.friends[st.friend]) { var a = Math.random() * 6.283, d = 1100; if (st.band && st.band.y) run.cell = { x: (Math.random() < 0.5 ? -1 : 1) * d, y: rnd(-120, 120) }; else if (st.band && st.band.x) run.cell = { x: rnd(-150, 150), y: (Math.random() < 0.5 ? -1 : 1) * d }; else run.cell = { x: Math.cos(a) * d, y: Math.sin(a) * d }; run.cell.id = st.friend; run.cell.t = 0; }
  SV.runs++; persist();
  G.mode = 'play'; banner = { a: st.n, b: 'SURVIVE UNTIL DAWN', t: 3.2 }; music.play(st.song);
  for (var i = 0; i < 12; i++) spawnFoe();
}
function addWeapon(id) { var w = { id: id, lv: 1, t: 0.4 + run.weapons.length * 0.13 }; run.weapons.push(w); SV.seen[id] = 1; run.dmg[id] = run.dmg[id] || 0; return w; }
function addCharm(id) { var c = { id: id, lv: 1 }; run.charms.push(c); SV.seen[id] = 1; calc(); return c; }
function wOf(id) { for (var i = 0; i < run.weapons.length; i++) if (run.weapons[i].id === id) return run.weapons[i]; return null; }
function cOf(id) { for (var i = 0; i < run.charms.length; i++) if (run.charms[i].id === id) return run.charms[i]; return null; }
function heal(n, quiet) { if (!P) return; var was = P.hp; P.hp = Math.min(P.max, P.hp + n); if (!quiet && P.hp > was) num(P.x, P.y - 40, '+' + Math.round(P.hp - was), '#7dff3a'); }

/* ---------- the spatial grid: which foes are near a point ---------- */
var GRID = {}, GC = 48;
function rebuildGrid() { GRID = {}; for (var i = 0; i < foes.length; i++) { var e = foes[i]; if (e.dead || e.under) continue; var k = Math.floor(e.x / GC) + ',' + Math.floor(e.y / GC); (GRID[k] || (GRID[k] = [])).push(e); } }
function near(x, y, r, cb) {
  var a = Math.floor((x - r) / GC), b = Math.floor((y - r) / GC), a2 = Math.floor((x + r) / GC), b2 = Math.floor((y + r) / GC);
  for (var gy = b; gy <= b2; gy++) for (var gx = a; gx <= a2; gx++) { var c = GRID[gx + ',' + gy]; if (c) for (var i = 0; i < c.length; i++) if (!c[i].dead) cb(c[i]); }
}

/* ---------- foes ---------- */
function mins() { return run.t / 60; }
function poolNow() { var m = mins() % 10, out = []; run.st.pool.forEach(function (p) { if (p[0] <= m || run.t >= DAWN) out.push(p); }); return out; }
function pickFoe() { var list = poolNow(), tot = 0; list.forEach(function (p) { tot += 1 + p[0] * 0.6; }); var r = Math.random() * tot; for (var i = 0; i < list.length; i++) { r -= 1 + list[i][0] * 0.6; if (r <= 0) return list[i][1]; } return list[0][1]; }
function spawnPos(m) {
  var b = run.st.band, a = Math.random() * 6.283, d = Math.hypot(KIT.W, H) / 2 + 30 + (m || 0), x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d;
  if (b && b.y) { x = P.x + (Math.random() < 0.5 ? -1 : 1) * (KIT.W / 2 + 30 + rnd(0, 60)); y = rnd(-b.y + 20, b.y - 20); if (Math.random() < 0.25) { x = P.x + rnd(-KIT.W / 2, KIT.W / 2); y = (Math.random() < 0.5 ? -1 : 1) * (b.y - 14); } }
  if (b && b.x) { y = P.y + (Math.random() < 0.5 ? -1 : 1) * (H / 2 + 30 + rnd(0, 60)); x = rnd(-b.x + 20, b.x - 20); }
  return { x: x, y: y };
}
function foeStats(k) { var f = FOES[k], m = Math.min(run.t, 1500) / 60, t = run.st.tier, end = run.t > DAWN ? 1 + (run.t - DAWN) / 120 : 1; return { hp: f.hp * (1 + (t - 1) * 0.12) * (1 + m * (0.4 + 0.12 * (t - 1)) + m * m * 0.035 * t) * end, dmg: f.dmg * (1 + m * 0.07) * (0.8 + 0.2 * t) * Math.sqrt(end), spd: f.spd * (1 + Math.min(m, 10) * 0.02) }; }
function spawnFoe(k, o) {
  k = k || pickFoe(); o = o || {}; var f = FOES[k], st = foeStats(k), p = o.x !== undefined ? o : spawnPos();
  if (f.ai === 'rise' && o.x === undefined) { p = { x: P.x + rnd(-130, 130), y: P.y + rnd(-90, 90) }; }
  var e = { id: FOEID++, k: k, f: f, x: p.x, y: p.y, hp: st.hp * (o.hpK || 1), mhp: st.hp * (o.hpK || 1), dmg: st.dmg * (o.dmgK || 1), spd: st.spd * (o.spdK || 1), r: f.r * (o.sc || 1), sc: o.sc || 1, t: Math.random() * 3, face: 1, kx: 0, ky: 0, flash: 0, xp: f.xp * (o.xpK || 1), elite: o.elite, shotT: rnd(1, f.cd || 3), dashT: rnd(1, 3), mode: 0 };
  if (f.ai === 'rise') { e.under = 0.9; e.life = 10; }
  if (f.ai === 'roll') { var dirx = P.x > e.x ? 1 : -1; if (run.st.band && run.st.band.x) { e.rvx = 0; e.rvy = P.y > e.y ? 1 : -1; } else { e.rvx = dirx; e.rvy = 0; } }
  if (o.vx !== undefined) { e.rvx = o.vx; e.rvy = o.vy; e.straight = 1; }
  clampBand(e); foes.push(e); return e;
}
function spawnElite() {
  var list = poolNow(), best = list[0][1]; list.forEach(function (p) { if (FOES[p[1]].hp > FOES[best].hp) best = p[1]; });
  var e = spawnFoe(best, { sc: 1.7, hpK: 16 + mins() * 2, dmgK: 1.5, xpK: 10, elite: 1 }); e.spd *= 0.9; return e;
}
function spawnBoss(id, final) {
  var B = BOSSES[id], p = spawnPos(40), base = 1500 * run.st.tier * B.hp * (1 + run.t / 60 * 0.4) * (run.endless ? 1 + (run.t - DAWN) / 200 : 1);
  var e = { id: FOEID++, k: id, boss: 1, final: final, B: B, f: { r: 30, ai: 'boss' }, x: p.x, y: p.y, hp: base, mhp: base, dmg: 18 * (0.7 + 0.3 * run.st.tier), spd: B.spd, r: 26, sc: 1, t: 0, face: 1, kx: 0, ky: 0, flash: 0, xp: 60, mv: 0, mt: 2.5, act: null };
  clampBand(e); foes.push(e); banner = { a: B.n, b: final ? 'DAWN WAITS BEHIND IT' : 'A BIG ONE', t: 3, boss: 1 }; if (B.song) music.play(B.song); sfx.play('roar'); KIT.shake(8);
  if (B.brother) { var b2 = spawnBoss(B.brother, final); b2.x = e.x + 80; b2.hp = b2.mhp = base * 0.6; banner = { a: B.n, b: 'BOTH OF THEM', t: 3, boss: 1 }; }
  run.bossOn = true; return e;
}
function clampBand(e) { var b = run.st.band; if (!b) return; if (b.y) e.y = clamp(e.y, -b.y + 12, b.y - 6); if (b.x) e.x = clamp(e.x, -b.x + 14, b.x - 14); }

function stepFoes(dt) {
  var frozen = G.freeze > 0;
  for (var i = 0; i < foes.length; i++) {
    var e = foes[i]; if (e.dead) continue; e.t += dt; if (e.flash > 0) e.flash -= dt;
    if (e.under !== undefined && e.under > 0) { e.under -= dt; if (e.under <= 0) { e.under = undefined; delete e.under; puff(e.x, e.y, '#4a3e30', 8); } continue; }
    if (e.life !== undefined) { e.life -= dt; if (e.life <= 0) { e.dead = 1; continue; } }
    ['slowT', 'confT', 'burnT', 'softT', 'stunT'].forEach(function (k) { if (e[k] > 0) e[k] -= dt; });
    if (e.burnT > 0) { e.bt = (e.bt || 0) - dt; if (e.bt <= 0) { e.bt = 0.5; hurtFoe(e, 3, 'pill', 0, 0); if (e.dead) continue; } }
    // knockback
    e.x += e.kx * dt; e.y += e.ky * dt; e.kx *= Math.pow(0.002, dt); e.ky *= Math.pow(0.002, dt);
    if (e.boss) { bossStep(e, dt); clampBand(e); continue; }
    if (frozen || e.stunT > 0) continue;
    var dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, sp = e.spd * (e.slowT > 0 ? 0.4 : 1), ai = e.f.ai;
    if (e.confT > 0) { dx = -dx; dy = -dy; }
    var mx = dx / d, my = dy / d;
    if (ai === 'roll' || e.straight) { e.x += e.rvx * sp * dt; e.y += e.rvy * sp * dt; if (e.rvx) e.face = e.rvx; if (d > 1400) e.dead = 1; continue; }
    if (ai === 'rise') { if (d < e.r + 16) hurtPlayer(e.dmg, e); continue; }
    if (ai === 'shoot') { var want = d > 190 ? 1 : d < 120 ? -1 : 0.15 * Math.sin(e.t); mx *= want; my *= want; e.shotT -= dt; if (e.shotT <= 0 && d < 360) { e.shotT = e.f.cd * rnd(0.8, 1.3); eShot(e.x, e.y - 14, Math.atan2(P.y - 14 - (e.y - 14), P.x - e.x), 140, e.f.shot, e.dmg * 0.6); } }
    if (ai === 'dash') { e.dashT -= dt; if (e.mode === 0 && e.dashT <= 0) { e.mode = 1; e.dashT = 0.45; e.flash = 0.45; } else if (e.mode === 1) { mx = my = 0; if (e.dashT <= 0) { e.mode = 2; e.dashT = 0.5; e.dvx = dx / d; e.dvy = dy / d; } } else if (e.mode === 2) { mx = e.dvx * 3; my = e.dvy * 3; if (e.dashT <= 0) { e.mode = 0; e.dashT = rnd(2, 3.5); } } }
    if (ai === 'fly') { var wb = Math.sin(e.t * 3 + e.id) * 0.5; var ox = -my * wb, oy = mx * wb; mx += ox; my += oy; }
    if (e.f.trail) { e.tr = (e.tr || 0) - dt; if (e.tr <= 0) { e.tr = 1.5; hazards.push({ k: 'burn', x: e.x, y: e.y, r: 8, t: 0, life: 2, dmg: e.dmg * 0.5 }); } }
    e.x += mx * sp * dt; e.y += my * sp * dt; if (Math.abs(mx) > 0.05) e.face = mx > 0 ? 1 : -1;
    // keep the crowd from stacking into one blob
    if (ai !== 'fly' && (i + FRAME) % 2 === 0) { var c = GRID[Math.floor(e.x / GC) + ',' + Math.floor(e.y / GC)]; if (c) for (var j = 0, n = 0; j < c.length && n < 6; j++) { var o = c[j]; if (o === e || o.f.ai === 'fly') continue; n++; var ex = e.x - o.x, ey = e.y - o.y, rr = (e.r + o.r) * 0.8, dd = ex * ex + ey * ey; if (dd < rr * rr && dd > 0.01) { var dl = Math.sqrt(dd), push = (rr - dl) * 0.5; e.x += ex / dl * push; e.y += ey / dl * push; } } }
    clampBand(e);
    // touching Spermaid
    if (d < e.r + 10 && !e.under) hurtPlayer(e.dmg, e);
    // far behind: brought back round in front (Vampire Survivors style)
    if (d > KIT.W * 0.75 + 220 && !e.elite) { var p2 = spawnPos(); e.x = p2.x; e.y = p2.y; }
  }
  if (FRAME % 30 === 0) foes = foes.filter(function (e) { return !e.dead; });
}
function hurtFoe(e, dmg, src, kx, ky) {
  if (e.dead || e.under) return false;
  var d = dmg * S.might * (e.softT > 0 ? 1.5 : 1) * (e.f.arm && !e.boss ? e.f.arm : 1) * (e.napT > 0 ? 2 : 1) * (G.frenzy > 0 ? 1.15 : 1);
  if (e.boss) { kx *= 0.06; ky *= 0.06; }
  e.hp -= d; e.flash = 0.08; e.kx += kx || 0; e.ky += ky || 0; run.dmg[src] = (run.dmg[src] || 0) + d;
  if (SV.opt.nums && (d >= 1)) num(e.x + rnd(-4, 4), e.y - e.r * 2 - 6, Math.round(d), e.boss ? '#ffe36a' : '#f1e7d0');
  if (e.hp <= 0) { killFoe(e); return true; }
  return false;
}
function killFoe(e) {
  e.dead = 1; run.kills++; SV.kills[e.k] = (SV.kills[e.k] || 0) + 1; P.wave = Math.min(1, P.wave + 1 / (110 * S.waveK)); if (P.wave >= 1 && !P.waveSaid) { P.waveSaid = 1; banner = { a: 'TIDAL WAVE READY', b: 'PRESS A', t: 1.6, small: 1 }; sfx.play('power'); }
  puff(e.x, e.y - e.r, e.boss ? '#ff2630' : '#c4121c', e.boss ? 40 : 6);
  if (e.boss) { bossDown(e); return; }
  var v = e.xp; dropPearl(e.x, e.y, v);
  var luck = S.luck;
  if (e.elite) { loot.push({ k: 'chest', x: e.x, y: e.y }); dropGold(e.x + 10, e.y, 12); sfx.play('power'); }
  else { var r = Math.random(); if (r < 0.004 * luck) addLoot(pick(['cracker', 'cracker', 'shell', 'cuppa', 'egg', 'scroll']), e.x, e.y); else if (r < 0.02 * luck) dropGold(e.x, e.y, 1); }
  if (e.f.split && e.sc >= 1) for (var s = 0; s < e.f.split; s++) { var c = spawnFoe(e.k, { x: e.x + rnd(-8, 8), y: e.y + rnd(-6, 6), sc: 0.65, hpK: 0.3 }); c.kx = rnd(-120, 120); c.ky = rnd(-120, 120); c.xp = 0; }
  if (e.f.pop) for (var q = 0; q < e.f.pop; q++) { var qa = q * 6.283 / e.f.pop + rnd(0, 1); eShot(e.x + Math.cos(qa) * 8, e.y - 10 + Math.sin(qa) * 8, qa, 80, 'shard', 3); eshots[eshots.length - 1].life = 1.4; }
  if (G.garlicHeal) G.garlicHeal(e);
}
function dropPearl(x, y, v) { if (v <= 0) return; loot.push({ k: 'pearl', v: v, x: x + rnd(-3, 3), y: y + rnd(-3, 3), tier: v >= 8 ? 2 : v >= 2 ? 1 : 0 }); }
function dropGold(x, y, n) { loot.push({ k: n >= 10 ? 'gold2' : 'gold', v: n, x: x, y: y }); }
function addLoot(k, x, y) { loot.push({ k: k, x: x, y: y }); }
function puff(x, y, col, n) { for (var i = 0; i < n; i++) fx.push({ k: 'pt', x: x, y: y, vx: rnd(-80, 80), vy: rnd(-110, 30), t: 0, life: rnd(0.3, 0.6), col: col }); }
function num(x, y, s, col) { if (nums.length > 48) nums.shift(); nums.push({ x: x, y: y, s: String(s), col: col, t: 0 }); }
function eShot(x, y, a, spd, kind, dmg) { eshots.push({ x: x, y: y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, k: kind || 'orb', dmg: dmg || 8, t: 0, life: 4, r: kind === 'pie' ? 6 : 4 }); }

/* ---------- the big foes ---------- */
function bossStep(e, dt) {
  var B = e.B, dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, slow = G.freeze > 0 ? 0.35 : 1;
  e.face = dx > 0 ? 1 : -1;
  if (e.napT > 0) { e.napT -= dt; if (Math.random() < dt * 2) fx.push({ k: 'z', x: e.x + 10, y: e.y - 60, t: 0, life: 1.2 }); return; }
  var a = e.act;
  if (!a) { e.x += dx / d * e.spd * 0.8 * dt * slow; e.y += dy / d * e.spd * 0.8 * dt * slow; e.mt -= dt * slow; if (e.mt <= 0) { var mv = B.moves[e.mv++ % B.moves.length]; e.act = a = { k: mv, t: 0 }; e.mt = (e.hp < e.mhp * 0.3 ? 1.5 : 2.3); } }
  if (a) {
    a.t += dt * slow;
    if (a.k === 'charge') { if (a.t < 0.6) { e.flash = 0.05; a.vx = dx / d; a.vy = dy / d; } else if (a.t < 1.4) { e.x += a.vx * e.spd * 4 * dt * slow; e.y += a.vy * e.spd * 4 * dt * slow; if (Math.random() < 0.5) puff(e.x, e.y, '#4a1a1c', 1); } else e.act = null; }
    else if (a.k === 'ring') { if (!a.done && a.t > 0.4) { a.done = 1; for (var i = 0; i < 18; i++) eShot(e.x, e.y - 30, i * 6.283 / 18 + rnd(0, 0.3), 120, B.fire ? 'fire' : 'orb', e.dmg * 0.7); sfx.play('magic'); } if (a.t > 0.8) e.act = null; }
    else if (a.k === 'aim') { if (a.t > 0.3 && (a.n || 0) < 3 && a.t > 0.3 + (a.n || 0) * 0.25) { a.n = (a.n || 0) + 1; var ang = Math.atan2(P.y - 16 - (e.y - 30), P.x - e.x); for (var j = -1; j <= 1; j++) eShot(e.x, e.y - 30, ang + j * 0.2, 190, B.fire ? 'fire' : 'orb', e.dmg * 0.7); sfx.play('shoot'); } if (a.t > 1.2) e.act = null; }
    else if (a.k === 'spiral') { a.s = (a.s || 0) - dt; if (a.s <= 0) { a.s = 0.07; a.ang = (a.ang || 0) + 0.45; eShot(e.x, e.y - 30, a.ang, 130, 'orb', e.dmg * 0.6); eShot(e.x, e.y - 30, a.ang + Math.PI, 130, 'orb', e.dmg * 0.6); } if (a.t > 2.2) e.act = null; }
    else if (a.k === 'summon') { if (!a.done) { a.done = 1; for (var s = 0; s < 6; s++) { var f = spawnFoe(B.summon || pickFoe(), { x: e.x + Math.cos(s) * 50, y: e.y + Math.sin(s) * 40 }); f.xp = 0.5; } sfx.play('roar'); } if (a.t > 0.6) e.act = null; }
    else if (a.k === 'slam') { if (!a.mk) { a.mk = 1; marks2.push({ x: e.x, y: e.y, r: 80, t: 0, at: 0.9, dmg: e.dmg, col: '#ff2630' }); } if (a.t > 1.1) { KIT.shake(6); e.act = null; } }
    else if (a.k === 'rain') { if (!a.mk) { a.mk = 1; for (var q = 0; q < 7; q++) marks2.push({ x: P.x + rnd(-110, 110), y: P.y + rnd(-80, 80), r: 22, t: -q * 0.12, at: 1, dmg: e.dmg * 0.8, col: '#ff9a30', meteor: 1 }); } if (a.t > 1.6) e.act = null; }
    else if (a.k === 'coins') { if (!a.done && a.t > 0.3) { a.done = 1; for (var c = 0; c < 12; c++) eShot(e.x, e.y - 30, rnd(0, 6.283), rnd(90, 170), 'coin', e.dmg * 0.6); sfx.play('coin'); } if (a.t > 0.7) e.act = null; }
    else if (a.k === 'nap') { e.napT = 3; e.act = null; banner = { a: 'SIR JOHNATHAN NAPS', b: 'HIT HIM WHILE HE SLEEPS', t: 1.8, small: 1 }; }
    else if (a.k === 'beams') { a.ang = (a.ang || 0) + dt * 0.9; if (a.t > 0.6) for (var b = 0; b < 4; b++) { var ba = a.ang + b * Math.PI / 2, px = P.x - e.x, py = P.y - 14 - (e.y - 30), along = px * Math.cos(ba) + py * Math.sin(ba), off = Math.abs(-px * Math.sin(ba) + py * Math.cos(ba)); if (along > 0 && off < 10) hurtPlayer(e.dmg * 0.6, e); } e.beams = a.t > 0.6 ? a.ang : null; e.beamWarn = a.t <= 0.6 ? a.ang : null; if (a.t > 3) { e.act = null; e.beams = e.beamWarn = null; } }
  }
  if (d < e.r + 14) hurtPlayer(e.dmg, e);
}
var marks2 = []; // the big foes' landing marks: warn, then hurt Spermaid
function bossDown(e) {
  sfx.play('boom'); KIT.shake(12); KIT.flash(0.25);
  for (var i = 0; i < 8; i++) dropPearl(e.x + rnd(-30, 30), e.y + rnd(-20, 20), 8);
  dropGold(e.x, e.y + 20, 25); loot.push({ k: 'chest', x: e.x, y: e.y, big: 1 });
  var left = foes.filter(function (f) { return f.boss && !f.dead; });
  if (left.length) return;
  run.bossOn = false;
  if (e.final && !run.cleared) { run.cleared = true; G.dawnQ = 2.2; banner = { a: 'DAWN BREAKS', b: run.st.n.toUpperCase() + ' SURVIVED', t: 3 }; }
  music.play(run.endless ? 'ssnight' : run.st.song);
}

/* ---------- Spermaid ---------- */
function hurtPlayer(dmg, by) {
  if (P.inv > 0 || P.dashT > 0 || G.mode !== 'play') return;
  var d = Math.max(1, dmg * 0.85 - S.armour); P.hp -= d; P.inv = 0.4; P.hurtT = 0.2; if (SV.opt.shake) KIT.shake(4); sfx.play('hurt'); num(P.x, P.y - 50, '-' + Math.round(d), '#ff2630');
  if (P.hp <= 0) {
    if (run.revives > 0) { run.revives--; P.hp = P.max * 0.5; P.inv = 2; rings.push({ x: P.x, y: P.y - 14, r: 0, R: 300, dmg: 200, t: 0, life: 0.6, hit: {}, w: 'wave', kb: 500, col: '#ffe36a' }); banner = { a: 'BACK FROM THE DEEP', b: 'REVIVED', t: 2 }; sfx.play('win'); return; }
    run.by = by && (by.B ? by.B.n : by.f && FOES[by.k] ? FOES[by.k].n : by.k) || 'the dark'; die();
  }
}
function stepPlayer(dt) {
  var mv = KIT.stick(0), sp = 120 * S.move * (G.frenzy > 0 ? 1.3 : 1) * (P.slowT > 0 ? 0.55 : 1);
  if (G.bot) mv = botMove();
  if (P.slowT > 0) P.slowT -= dt;
  if (P.dashT > 0) { P.dashT -= dt; P.x += P.dvx * 430 * dt; P.y += P.dvy * 430 * dt; if (Math.random() < 0.6) fx.push({ k: 'bub', x: P.x + rnd(-6, 6), y: P.y - rnd(4, 24), t: 0, life: 0.5 }); }
  else { P.vx = mv.x * sp; P.vy = mv.y * sp; P.x += P.vx * dt; P.y += P.vy * dt; }
  if (mv.on && Math.abs(mv.x) > 0.15) P.face = mv.x > 0 ? 1 : -1;
  P.walk += (mv.on ? Math.hypot(mv.x, mv.y) : 0.25) * dt * 9;
  P.moving = mv.on;
  if (P.inv > 0) P.inv -= dt; if (P.hurtT > 0) P.hurtT -= dt; if (P.dashCd > 0) P.dashCd -= dt;
  var b = run.st.band; if (b && b.y) P.y = clamp(P.y, -b.y + 16, b.y - 4); if (b && b.x) P.x = clamp(P.x, -b.x + 16, b.x - 16);
  if (S.regen) heal(S.regen * dt, true);
  if ((KIT.pressed('b') || G.botDash) && P.dashCd <= 0) { G.botDash = 0; var dl = Math.hypot(mv.x, mv.y); P.dvx = dl > 0.2 ? mv.x / dl : P.face; P.dvy = dl > 0.2 ? mv.y / dl : 0; P.dashT = 0.17; P.dashCd = 1.8; P.inv = Math.max(P.inv, 0.32); sfx.play('jump'); }
  if ((KIT.pressed('a') || G.botWave) && P.wave >= 1) { G.botWave = 0; tidalWave(); }
}
function tidalWave() {
  P.wave = 0; P.waveSaid = 0; KIT.flash(0.2); KIT.shake(10); sfx.play('boom'); sfx.play('pour');
  rings.push({ x: P.x, y: P.y - 14, r: 0, R: 460, dmg: 60 + run.lvl * 5, t: 0, life: 0.9, hit: {}, w: 'wave', kb: 700, col: '#2aa0a8', big: 1 });
  eshots = [];
}

/* ---------- pickups ---------- */
function stepLoot(dt) {
  var mr = 46 * S.magnet, pearls = 0;
  for (var i = loot.length - 1; i >= 0; i--) {
    var o = loot[i], dx = P.x - o.x, dy = P.y - 10 - o.y, d = Math.hypot(dx, dy) || 1;
    if (o.k === 'pearl') pearls++;
    var pull = o.mag || (o.k === 'pearl' || o.k === 'gold' || o.k === 'gold2') && d < mr;
    if (pull) { o.mag = 1; o.sp = Math.min(520, (o.sp || 60) + dt * 900); o.x += dx / d * o.sp * dt; o.y += dy / d * o.sp * dt; }
    if (d < 14) { takeLoot(o); loot.splice(i, 1); }
  }
  // too many pearls lying about: the far ones merge into one big pearl
  if (pearls > 380) { var far = loot.filter(function (o) { return o.k === 'pearl' && !o.mag; }).sort(function (a, b) { return Math.hypot(b.x - P.x, b.y - P.y) - Math.hypot(a.x - P.x, a.y - P.y); }).slice(0, 120), v = 0;
    far.forEach(function (o) { v += o.v; o.k = 'gone'; }); loot = loot.filter(function (o) { return o.k !== 'gone'; }); if (far.length) loot.push({ k: 'pearl', v: v, tier: 2, x: far[0].x, y: far[0].y, big: 1 }); }
}
function takeLoot(o) {
  if (o.k === 'pearl') { gainXP(o.v); if (Math.random() < 0.3) sfx.add('pearl', function () { sfx.tone('sine', 1500 + Math.random() * 400, 1800, 0.05, 0.03); }), sfx.play('pearl'); return; }
  run.picks[o.k] = (run.picks[o.k] || 0) + 1; SV.seen['pk_' + o.k] = 1;
  if (o.k === 'gold' || o.k === 'gold2') { run.gold += o.v * S.greed; sfx.play('coin'); return; }
  if (o.k === 'cracker') { heal(30); sfx.play('power'); }
  if (o.k === 'shell') { loot.forEach(function (q) { if (q.k === 'pearl') q.mag = 1; }); sfx.play('magic'); banner = { a: 'SIREN SHELL', b: 'EVERY PEARL COMES TO HER', t: 1.5, small: 1 }; }
  if (o.k === 'cuppa') { G.frenzy = 10 * S.dur; sfx.play('power'); banner = { a: 'CUMPUCCINO', b: 'FRENZY', t: 1.5, small: 1 }; }
  if (o.k === 'egg') { G.freeze = 6 * S.dur; sfx.play('magic'); banner = { a: 'FROSTBITE EGG', b: 'EVERYTHING FREEZES', t: 1.5, small: 1 }; }
  if (o.k === 'scroll') { fx.push({ k: 'nado', x: CAM.x - 60, y: P.y, t: 0, life: 1.6 }); sfx.play('roar'); onScreenFoes().forEach(function (e, i) { setTimeout0(0.2 + (e.x - CAM.x) / KIT.W * 1.2, function () { if (e.boss) hurtFoe(e, e.mhp * 0.12, 'scroll', 0, 0); else hurtFoe(e, 99999, 'scroll', 0, -200); }); }); banner = { a: 'MEATNADO', b: 'IT TAKES EVERYTHING', t: 1.5, small: 1 }; }
  if (o.k === 'chest') { run.chests.push(o.big ? 1 : 0); sfx.play('door'); }
}
function needFor(lv) { return lv < 20 ? 5 + (lv - 1) * 8 : lv < 40 ? 157 + (lv - 20) * 12 : 397 + (lv - 40) * 16; }
function gainXP(v) { run.xp += v * S.growth; while (run.xp >= run.need) { run.xp -= run.need; run.lvl++; run.need = needFor(run.lvl); run.pending++; } }

/* breakable things on the floor (world keyed: same place every run) and the friend's cell */
var BCELL = 230;
function breakablesNear() { var out = [], a = Math.floor((CAM.x - 40) / BCELL), b = Math.floor((CAM.y - 40) / BCELL), a2 = Math.floor((CAM.x + KIT.W + 40) / BCELL), b2 = Math.floor((CAM.y + H + 40) / BCELL);
  for (var y = b; y <= b2; y++) for (var x = a; x <= a2; x++) { if (hh(x, y, 201) > 0.24 || run.broken[x + ',' + y]) continue; var bx = x * BCELL + 30 + hh(x, y, 202) * (BCELL - 60), by = y * BCELL + 30 + hh(x, y, 203) * (BCELL - 60); if (!inBand(bx, by, 30)) continue; out.push({ key: x + ',' + y, x: bx, y: by }); } return out; }
function stepBreakables() {
  breakablesNear().forEach(function (b) {
    var hit = Math.hypot(P.x - b.x, P.y - b.y) < 20;
    for (var i = 0; !hit && i < shots.length; i++) if (Math.hypot(shots[i].x - b.x, shots[i].y - (b.y - 10)) < shots[i].r + 10) hit = true;
    for (i = 0; !hit && i < rings.length; i++) if (Math.abs(Math.hypot(rings[i].x - b.x, rings[i].y - b.y) - rings[i].r) < 16) hit = true;
    var gw = wOf('garlic'); if (!hit && gw && gw.rad && Math.hypot(P.x - b.x, P.y - b.y) < gw.rad) hit = true;
    for (i = 0; !hit && i < fx.length; i++) if (fx[i].k === 'slap' && Math.abs(fx[i].y - b.y + 10) < fx[i].h && (fx[i].dir > 0 ? b.x > fx[i].x && b.x < fx[i].x + fx[i].w : b.x < fx[i].x && b.x > fx[i].x - fx[i].w)) hit = true;
    if (!hit) return;
    run.broken[b.key] = 1; puff(b.x, b.y - 10, run.st.tint, 10); sfx.play('hit');
    var r = Math.random() / S.luck;
    if (r < 0.28) addLoot('cracker', b.x, b.y); else if (r < 0.34) addLoot('shell', b.x, b.y); else if (r < 0.39) addLoot('cuppa', b.x, b.y); else if (r < 0.43) addLoot('egg', b.x, b.y); else if (r < 0.46) addLoot('scroll', b.x, b.y);
    else if (r < 0.52) dropGold(b.x, b.y, 10); else dropGold(b.x, b.y, rndi(1, 3));
  });
  var c = run.cell; if (c && !c.freed) {
    if (Math.hypot(P.x - c.x, P.y - c.y) < 46) { c.t += 1 / 60; if (c.t >= 1.4) freeFriend(c); } else c.t = Math.max(0, c.t - 1 / 30);
  }
}
function freeFriend(c) {
  c.freed = true; SV.friends[c.id] = 1; persist(); calc(); var F = FRIENDS[c.id];
  banner = { a: F.n.toUpperCase() + ' IS FREE', b: (F.q || pick(TBQUOTES)), t: 3.5, quote: 1 }; sfx.play('win'); loot.push({ k: 'chest', x: c.x + 60, y: c.y + 30 });
  num(c.x, c.y - 60, F.gift.toUpperCase(), '#ffe36a');
}

/* ---------- each place's own trap ---------- */
function stepHazards(dt) {
  var st = run.st;
  run.nextHz -= dt;
  if (run.nextHz <= 0 && !G.dawnQ) {
    var k = st.hazard;
    if (k === 'flush') { run.nextHz = 24; hazards.push({ k: 'flush', x: CAM.x - 200, t: 0, warn: 1.6, life: 6, dir: Math.random() < 0.5 ? 1 : -1 }); var hz = hazards[hazards.length - 1]; if (hz.dir < 0) hz.x = CAM.x + KIT.W + 200; banner = { a: 'CREAM SURGE', b: hz.dir > 0 ? 'FROM THE LEFT' : 'FROM THE RIGHT', t: 1.5, small: 1 }; sfx.play('pour'); }
    if (k === 'coaster') { run.nextHz = 15; var dir = Math.random() < 0.5 ? 1 : -1; hazards.push({ k: 'coaster', y: P.y + rnd(-30, 30), x: dir > 0 ? CAM.x - 160 : CAM.x + KIT.W + 160, dir: dir, t: 0, warn: 1.4, life: 4.5 }); sfx.play('bell'); }
    if (k === 'hands') { run.nextHz = 5.5; for (var i = 0; i < 3 + Math.floor(mins() / 3); i++) hazards.push({ k: 'hand', x: P.x + rnd(-100, 100) + P.vx * 0.7, y: P.y + rnd(-70, 70) + P.vy * 0.7, r: 18, t: 0, warn: 1, life: 1.6, dmg: 12 }); }
    if (k === 'vents') { run.nextHz = 8; for (var j = 0; j < 4; j++) hazards.push({ k: 'vent', x: P.x + rnd(-150, 150), y: P.y + rnd(-90, 90), r: 20, t: 0, warn: 1.2, life: 2.8, dmg: 10 }); }
    if (k === 'chand') { run.nextHz = 6.5; hazards.push({ k: 'chand', x: P.x + P.vx * 1.1 + rnd(-20, 20), y: P.y + P.vy * 1.1 + rnd(-10, 10), r: 32, t: 0, warn: 1.2, life: 1.9, dmg: 18 }); }
    if (k === 'pins') { run.nextHz = 14; var dy = Math.random() < 0.5 ? 1 : -1; hazards.push({ k: 'pin', x: P.x + rnd(-40, 40), y: dy > 0 ? CAM.y - 60 : CAM.y + H + 60, dir: dy, t: 0, warn: 1.4, life: 4 }); sfx.play('bell'); }
    if (k === 'goo') { run.nextHz = 4.5; hazards.push({ k: 'goo', x: P.x + rnd(-110, 110), y: P.y + rnd(-80, 80), r: 30, t: 0, warn: 0.6, life: 9 }); }
    if (k === 'meteors') { run.nextHz = 4; for (var m = 0; m < 2 + Math.floor(mins() / 3); m++) marks2.push({ x: P.x + rnd(-140, 140), y: P.y + rnd(-90, 90), r: 26, t: -m * 0.2, at: 1.2, dmg: 16, col: '#ff2630', meteor: 1, foes: 1 }); }
  }
  for (var h = hazards.length - 1; h >= 0; h--) {
    var z = hazards[h]; z.t += dt; var live = z.t > (z.warn || 0);
    if (z.k === 'burn') { if (Math.hypot(P.x - z.x, P.y - z.y) < z.r + 6) hurtPlayer(z.dmg, { k: 'magmaslug', f: FOES.magmaslug }); }
    else if (z.k === 'flush' && live) { z.x += z.dir * 300 * dt; var dxp = P.x - z.x; if (Math.abs(dxp) < 60) { P.x += z.dir * 240 * dt; } near(z.x, 0, 0, function () {}); foes.forEach(function (e) { if (!e.dead && !e.boss && Math.abs(e.x - z.x) < 60) { e.x += z.dir * 260 * dt; if (!e.fl) { e.fl = z; hurtFoe(e, 30 * run.st.tier, 'surge', 0, 0); } } }); }
    else if (z.k === 'coaster' && live) { z.x += z.dir * 560 * dt; for (var c = 0; c < 3; c++) { var cx = z.x - z.dir * c * 34; if (Math.abs(P.x - cx) < 18 && Math.abs(P.y - z.y) < 14) hurtPlayer(20, { k: 'coaster', B: { n: 'the coaster' } }); near(cx, z.y, 30, function (e) { if (!e.boss && Math.abs(e.x - cx) < 18 && Math.abs(e.y - z.y) < 16) hurtFoe(e, 300, 'coaster', 0, -260); }); } }
    else if ((z.k === 'hand' || z.k === 'vent' || z.k === 'chand') && live && !z.done) {
      if (z.k !== 'vent') z.done = 1; else { z.tk = (z.tk || 0) - dt; if (z.tk > 0) continue; z.tk = 0.4; }
      if (Math.hypot(P.x - z.x, P.y - z.y) < z.r + 6) hurtPlayer(z.dmg, { k: z.k, B: { n: z.k === 'hand' ? 'a grave hand' : z.k === 'vent' ? 'the furnace' : 'a chandelier' } });
      circleHit(z.x, z.y + 10, z.r, 60 * run.st.tier, 'trap', 0, 80); if (z.k === 'chand') { KIT.shake(5); sfx.play('boom'); puff(z.x, z.y, '#ffc840', 12); } if (z.k === 'hand') sfx.play('hit');
    }
    else if (z.k === 'pin' && live) { z.y += z.dir * 300 * dt; if (Math.abs(P.y - z.y) < 18 && Math.abs(P.x - z.x) < 80) hurtPlayer(16, { k: 'pin', B: { n: 'a giant rolling pin' } }); near(z.x, z.y, 90, function (e) { if (!e.boss && Math.abs(e.y - z.y) < 18 && Math.abs(e.x - z.x) < 80) hurtFoe(e, 250, 'trap', 0, z.dir * 200); }); }
    else if (z.k === 'goo' && live) { if (Math.hypot(P.x - z.x, (P.y - z.y) * 1.6) < z.r) P.slowT = 0.2; }
    if (z.t > z.life) hazards.splice(h, 1);
  }
  for (var q = marks2.length - 1; q >= 0; q--) { var mk = marks2[q]; mk.t += dt; if (mk.t >= mk.at) { if (Math.hypot(P.x - mk.x, P.y - mk.y) < mk.r + 6) hurtPlayer(mk.dmg, { k: 'meteor', B: { n: mk.meteor ? 'a falling star' : 'a slam' } }); if (mk.foes) circleHit(mk.x, mk.y + 10, mk.r, 50 * run.st.tier, 'trap', 0, 80); fx.push({ k: 'ring', x: mk.x, y: mk.y, r: mk.r, t: 0, life: 0.3, col: mk.col }); puff(mk.x, mk.y, mk.col, 8); if (SV.opt.shake) KIT.shake(3); marks2.splice(q, 1); } }
}

/* ---------- the clock: what turns up when ---------- */
function stepDirector(dt) {
  var t = run.t, m = mins();
  var target = Math.min(340, 12 + m * 10 + m * m * 1.3 + (run.st.tier - 1) * 4 + (run.endless ? (t - DAWN) / 4 : 0)) * (run.bossOn ? 0.7 : 1);
  if (G.dawnQ) target = 0;
  var alive = 0; for (var i = 0; i < foes.length; i++) if (!foes[i].dead) alive++;
  run.spawnAcc = (run.spawnAcc || 0) + dt * (alive < target ? 8 + m * 3 : 0.8);
  while (run.spawnAcc >= 1 && alive < target + 4) { run.spawnAcc -= 1; spawnFoe(); alive++; }
  if (run.spawnAcc > 3) run.spawnAcc = 3;
  if (G.dawnQ) return;
  // events
  if (t >= run.nextEv) { run.nextEv += 60; fireEvent(Math.floor(t / 60)); }
  if (t >= run.nextElite) { run.nextElite += 60; spawnElite(); banner = { a: 'A NASTY ONE', b: 'IT CARRIES A CHEST', t: 1.6, small: 1 }; }
  // the big foes
  if (!run.endless) {
    if (run.miniDone === 0 && t >= 210) { run.miniDone = 1; spawnBoss(run.minis[0], false); }
    if (run.miniDone === 1 && t >= 420) { run.miniDone = 2; spawnBoss(run.minis[1], false); }
    if (run.miniDone === 2 && t >= DAWN) { run.miniDone = 3; spawnBoss(run.st.boss, true); }
  } else if (t >= run.nextBoss) { run.nextBoss = t + 120; spawnBoss(pick(Object.keys(BOSSES)), false); }
}
function fireEvent(n) {
  var list = poolNow(), flyers = list.filter(function (p) { return FOES[p[1]].ai === 'fly'; }), kind = ['swarm', 'ring', 'horde'][n % 3], k;
  if (kind === 'swarm' && flyers.length) { k = pick(flyers)[1]; var dir = Math.random() < 0.5 ? 1 : -1, band = run.st.band, vert = band && band.x;
    for (var i = 0; i < 26 + n * 2; i++) { var x = vert ? P.x + rnd(-200, 200) : P.x - dir * (KIT.W / 2 + 40 + i * 9), y = vert ? P.y - dir * (H / 2 + 40 + i * 9) : P.y + rnd(-150, 150); spawnFoe(k, { x: x, y: y, vx: vert ? 0 : dir, vy: vert ? dir : 0, spdK: 1.6, hpK: 0.8 }); }
    banner = { a: 'A SWARM', b: FOES[k].n.toUpperCase() + 'S', t: 1.6, small: 1 }; return; }
  if (kind === 'ring') { k = pickFoe(); if (FOES[k].ai === 'rise' || FOES[k].ai === 'roll') k = list[0][1]; var n2 = 30 + n * 2; for (var j = 0; j < n2; j++) { var a = j * 6.283 / n2; spawnFoe(k, { x: P.x + Math.cos(a) * 260, y: P.y + Math.sin(a) * 200, spdK: 0.8 }); } banner = { a: 'SURROUNDED', b: 'BREAK OUT', t: 1.6, small: 1 }; return; }
  for (var h = 0; h < 30 + n * 3; h++) spawnFoe(); banner = { a: 'THE HORDE', b: 'HOLD ON', t: 1.6, small: 1 };
}

/* ---------- the main step ---------- */
var FRAME = 0;
function update(dt) {
  H = KIT.H;
  if (G.mode !== 'play') { if (G.mode === 'title') titleStep(dt); return; }
  FRAME++; run.t += dt;
  if (G.frenzy > 0) G.frenzy -= dt; if (G.freeze > 0) G.freeze -= dt;
  stepPlayer(dt);
  rebuildGrid();
  run.weapons.forEach(function (w) { WB[w.id].step(w, dt); });
  stepShots(dt);
  stepFoes(dt);
  stepEShots(dt);
  stepLoot(dt);
  stepBreakables();
  stepHazards(dt);
  stepDirector(dt);
  for (var i = fx.length - 1; i >= 0; i--) { var f = fx[i]; f.t += dt; if (f.k === 'pt') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 300 * dt; } if (f.t > f.life) fx.splice(i, 1); }
  for (i = nums.length - 1; i >= 0; i--) { nums[i].t += dt; nums[i].y -= 22 * dt; if (nums[i].t > 0.7) nums.splice(i, 1); }
  if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  CAM.x = P.x - KIT.W / 2; CAM.y = P.y - H / 2 - 12;
  var bd = run.st.band; // the corridor places keep the walls in view, centred when the screen is bigger than the corridor
  if (bd && bd.y) CAM.y = 2 * bd.y + 120 < H ? -H / 2 : clamp(CAM.y, -bd.y - 60, bd.y + 60 - H);
  if (bd && bd.x) CAM.x = 2 * bd.x + 140 < KIT.W ? -KIT.W / 2 : clamp(CAM.x, -bd.x - 70, bd.x + 70 - KIT.W);
  if (G.dawnQ) { G.dawnQ -= dt; if (G.dawnQ <= 0) { G.dawnQ = 0; dawnMenu(); return; } }
  if (run.chests.length && !KIT.menuOpen()) { openChest(run.chests.shift()); return; }
  if (run.pending > 0 && !KIT.menuOpen()) { levelUpMenu(); return; }
}
function stepEShots(dt) {
  for (var i = eshots.length - 1; i >= 0; i--) { var s = eshots[i]; if (G.freeze > 0) continue; s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (Math.hypot(P.x - s.x, P.y - 16 - s.y) < s.r + 8) { hurtPlayer(s.dmg, { k: s.k, B: { n: 'a stray shot' } }); eshots.splice(i, 1); continue; }
    if (s.t > s.life) eshots.splice(i, 1); }
}
function die() {
  G.mode = 'dead'; sfx.play('lose'); music.stop(1.5); bank();
  setTimeout(function () { resultsMenu(false); }, 900);
}
function bank() {
  if (run.banked) return; run.banked = 1;
  var g = Math.round(run.gold); SV.gold += g; SV.total += g;
  var id = run.st.id, secs = Math.floor(run.t); if (secs > (SV.best[id] || 0)) SV.best[id] = secs;
  if (run.cleared) SV.cleared[id] = 1;
  persist();
}
