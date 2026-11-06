/* =====================================================================================================
   EJACULAND'S BOSS (his idea): riding the Load Flume. A train of log boats runs down the cream channel, always to the
   right, down a slope, along the flat, down again. Brothers Load (Piggy, and his brother in the cowboy hat) hop from boat
   to boat: Piggy lands like a bomb and charges, the cowboy hops and lobs mugs. Stomp them both; falling in the cream
   hurts and throws you back up. Then the ride ends: you hop off at the station, Steve's camera takes the ride photo, and
   you run into the Bone Pit.
   Its own little scene (G.mode 'flume', state in FL): x runs along the ride, trackY(x) is the cream's surface.
   ===================================================================================================== */
var FL = null;
var FLSEG = [[520, 0], [640, 0.34], [420, 0], [760, 0.3], [480, 0], [700, 0.36], [440, 0], [820, 0.3]]; // [length, drop per px]: slanted, flat, slanted
var FLCAR = { n: 5, L: 74, gap: 26, h: 9 }; // boats: count, length, gap, deck above the cream
function trackY(x) { // the cream's surface at x (repeats the pattern for as long as the fight lasts)
  var y = 0, d = Math.max(0, x - FL.x0), tot = 0; FLSEG.forEach(function (s) { tot += s[0]; });
  var laps = Math.floor(d / tot), drop1 = 0; FLSEG.forEach(function (s) { drop1 += s[0] * s[1]; }); y = laps * drop1; d -= laps * tot;
  for (var i = 0; i < FLSEG.length; i++) { var s = FLSEG[i]; if (d <= s[0]) { y += d * s[1]; break; } y += s[0] * s[1]; d -= s[0]; }
  if (FL.endX && x > FL.endX) return FL.endY; // the station: flat from there on
  return FL.y0 + y;
}
function trackG(x) { return (trackY(x + 4) - trackY(x - 4)) / 8; }
function carX(i) { return FL.tx - i * (FLCAR.L + FLCAR.gap); } // front edge of boat i (0 = the front boat)
function carAt(x) { for (var i = 0; i < FLCAR.n; i++) { var a = carX(i) - FLCAR.L; if (x >= a && x <= carX(i)) return i; } return -1; }
function deckY(x) { return trackY(x) - FLCAR.h; }

function startFlume(e) {
  var x0 = e.c0 * TS;
  FL = { x0: x0, y0: e.y, tx: x0 + 520, v: 0, t: 0, st: 'board', ps: [], pcd: 0, st2: 0, shots: [], fx: [], photo: null, flash: 0, done: false,
    p: { x: 0, y: 0, vx: 0, vy: 0, air: false, face: 1, jumps: 0, inv: 0, dist: 0, atkT: 0 }, foes: [] };
  var p = FL.p; FL.stX = carX(FLCAR.n - 1) - FLCAR.L - 8; FL.stY = FL.y0 - 22; p.x = FL.stX - 430; p.y = FL.stY; p.face = 1; /* he walks in through the ride's entrance and hops on the back boat */
  FL.foes.push({ id: 'pig', spr: 'f_pig_', sc: 0.62, car: 0, ox: 0.5, y: 0, vy: 0, air: false, hp: 6, hitT: 0, st: 'idle', t: 2.4, w: 30, h: 36, dir: -1, mi: 0 });
  FL.foes.push({ id: 'cow', spr: 'f_cowpig_', sc: 0.8, car: 1, ox: 0.5, y: 0, vy: 0, air: false, hp: 6, hitT: 0, st: 'idle', t: 3.2, w: 20, h: 44, dir: -1, mi: 0 });
  FL.foes.forEach(function (f) { f.x = carX(f.car) - FLCAR.L * f.ox; f.y = deckY(f.x); });
  G.mode = 'flume'; G.lock = null; FL.foes.forEach(function (f) { f.hide = 1; });
}
function flHurt(srcx) {
  var p = FL.p; if (p.inv > 0 || G.star > 0 || G.super || FL.st !== 'fight') return;
  if (PL.shield) { PL.shield = 0; p.inv = 1.2; sfx.play('pop'); return; }
  if (G.drops <= 0) { // out: back to the checkpoint, like any death
    FL.st = 'dead'; FL.deadT = 0; p.vy = -420; p.air = true; sfx.play('die'); music.stop(0.4); return; }
  for (var i = 0; i < Math.min(G.drops, 16); i++) FL.fx.push({ x: p.x, y: p.y - 20, vx: (Math.random() - 0.5) * 300, vy: -200 - Math.random() * 200, t: 1, c: '#f1e7d0', drop: 1 });
  G.drops = 0; sfx.play('scatter'); p.inv = 2; p.vy = -300; p.air = true; p.vx = (p.x < srcx ? -1 : 1) * 120;
}
function stepFlume(dt) {
  var F = FL, p = F.p, W = KIT.W; F.t += dt; if (F.flash > 0) F.flash -= dt;
  // the boats: faster down the slopes
  var g0 = trackG(F.tx - 200), tv = F.st === 'photo' || F.st === 'off' || F.st === 'board' ? 0 : 120 + g0 * 260; F.v += (tv - F.v) * Math.min(1, dt * 1.5); var mv = F.v * dt; F.tx += mv;
  if (F.st === 'dead') { F.deadT += dt; p.vy += 900 * dt; p.y += p.vy * dt; p.x += mv; if (F.deadT > 1.6) { var a = G.arena; FL = null; G.mode = 'play'; PL.state = 'normal'; die(false); PL.deadT = 1.5; } return; }
  if (F.st === 'board') { // in through the entrance, along the platform, a hop onto the back boat, then the ride sets off
    var seat = carX(FLCAR.n - 2) - FLCAR.L / 2;
    if (!F.hopB) { p.x += 110 * dt; p.dist += 110 * dt; p.y = F.stY; p.air = false; if (p.x >= F.stX - 6) { F.hopB = { x0: p.x, t: 0 }; p.vy = -420; p.air = true; sfx.play('jump'); } }
    else { F.hopB.t += dt; var hk = Math.min(1, F.hopB.t / 0.75); p.x = F.hopB.x0 + (seat - F.hopB.x0) * hk; p.vy += 1000 * dt; p.y += p.vy * dt; var dk = deckY(p.x); if (hk >= 1 && p.y >= dk) { p.y = dk; p.air = false; p.vy = 0; p.jumps = 0; p.vx = 0; F.st = 'intro'; F.t = 0; F.foes.forEach(function (f) { f.hide = 0; }); G.bossName = BOSSES.pig.name; G.banner = 2.4; G.bannerTxt = BOSSES.pig.name; music.play('hogboss'); sfx.play('roar'); sfx.play('splash'); } }
    var tgb = p.x - W * 0.4; F.cx = F.cx == null ? tgb : F.cx + (tgb - F.cx) * Math.min(1, dt * 4); F.cy = F.stY - KIT.H * 0.62; F.foes.forEach(function (f) { f.x = carX(f.car) - FLCAR.L * f.ox; f.y = deckY(f.x); }); return; }
  // the shot (B), same as on foot: it hurts the brothers too
  F.pcd -= dt; var inpS = pIn(); if (inpS.at && F.pcd <= 0 && (F.st === 'fight' || F.st === 'intro')) { F.pcd = 0.32; p.atkT = 0.2; F.ps.push({ x: p.x + p.face * 14, y: p.y - 24, vx: p.face * 360, life: 0.6 }); sfx.play('shoot'); }
  if (p.atkT > 0) p.atkT -= dt;
  F.ps = F.ps.filter(function (s) { s.life -= dt; s.x += (s.vx + F.v) * dt; if (F.st === 'fight') for (var i = 0; i < F.foes.length; i++) { var f = F.foes[i]; if (f.hp > 0 && f.hitT <= 0 && Math.abs(s.x - f.x) < f.w && s.y > f.y - f.h - 4 && s.y < f.y + 2) { f.hp--; f.hitT = 1; sfx.play('bosshit'); G.shake = 3; G.score += 100; if (f.hp <= 0) { f.vy = -300; sfx.play('boom'); G.score += 1000; } return false; } } return s.life > 0; });
  // the player (own simple physics, carried along by the boat he stands on)
  var inp = pIn(), K = G.super ? 1.35 : 1;
  if (F.st === 'fight' || F.st === 'intro' || F.st === 'won') {
    var want = (inp.dir || 0) * 150 * K; p.vx += (want - p.vx) * Math.min(1, dt * (p.air ? 5 : 10)); if (inp.dir) p.face = inp.dir;
    if (!p.air) { p.x += mv; p.dist += Math.abs(p.vx * dt); }
    if (p.air && p.vy < -200 && !inp.j) p.vy = -200; // let go early for a short hop
    if (KIT.pressed('a')) { if (!p.air) { p.vy = -430 * (G.super ? 1.1 : 1); p.air = true; p.jumps = 1; sfx.play('jump'); } else if (p.jumps < 2) { p.vy = -380; p.jumps = 2; sfx.play('jump'); } }
    p.x += p.vx * dt; if (p.air) { p.x += mv * 0.98; p.vy += 1000 * dt; p.y += p.vy * dt; }
    var lo = carX(FLCAR.n - 1) - FLCAR.L - 14, hi = carX(0) + 14; p.x = Math.max(lo, Math.min(hi, p.x));
    var ci = carAt(p.x);
    if (p.air && p.vy >= 0 && ci >= 0 && p.y >= deckY(p.x) - 2 && p.y - p.vy * dt <= deckY(p.x) + 6) { p.y = deckY(p.x); p.air = false; p.vy = 0; p.jumps = 0; }
    if (!p.air) { if (ci < 0) p.air = true; else p.y = deckY(p.x); }
    if (p.air && p.y > trackY(p.x) + 6) { // into the cream: it hurts, and it throws you back up
      for (var k = 0; k < 10; k++) F.fx.push({ x: p.x, y: trackY(p.x), vx: (Math.random() - 0.5) * 160, vy: -120 - Math.random() * 160, t: 0.6, c: k % 2 ? '#f1e0b0' : '#fffbe8' });
      sfx.play('splash'); if (F.st === 'fight') flHurt(p.x + 1); if (FL.st === 'dead') return; p.y = trackY(p.x) + 6; p.vy = -620; p.air = true; p.jumps = 1;
      var best = 0, bd = 1e9; for (var c = 0; c < FLCAR.n; c++) { var m = carX(c) - FLCAR.L / 2, d2 = Math.abs(m - p.x); if (d2 < bd) { bd = d2; best = m; } } p.vx = (best - p.x) * 1.4; }
    if (p.inv > 0) p.inv -= dt;
  }
  if (F.st === 'intro' && F.t > 2.2) F.st = 'fight';
  // Brothers Load
  F.foes.forEach(function (f) { stepFlFoe(f, dt, mv); });
  if (F.st === 'fight' && F.foes.every(function (f) { return f.hp <= 0 && f.gone; })) { F.st = 'won'; F.st2 = 0; G.bossName = null; G.score += 2000; music.play('hogclear'); }
  // mugs
  F.shots = F.shots.filter(function (s) { s.vy += 620 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r = (s.r || 0) + dt * 10;
    if (F.st === 'fight' && Math.abs(s.x - p.x) < 10 && s.y > p.y - 34 && s.y < p.y) { flHurt(s.x); return false; }
    if (s.y > trackY(s.x) - 2) { var ci2 = carAt(s.x); for (var k = 0; k < 5; k++) F.fx.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 90, t: 0.4, c: ci2 >= 0 ? '#ffe36a' : '#f1e0b0' }); sfx.play('thud'); return false; }
    return true; });
  F.fx = F.fx.filter(function (q) { q.t -= dt; q.vy += 500 * dt; q.x += q.vx * dt + mv * 0.5; q.y += q.vy * dt; return q.t > 0; });
  // the end of the ride: the station, the photo, then off into the Bone Pit
  if (F.st === 'won') { F.st2 += dt; if (F.st2 > 2.5 && !F.endX) { F.endX = F.tx + 260; F.endY = trackY(F.endX); } // the channel levels out at the station
    if (F.endX && carX(0) > F.endX - 30) { F.st = 'hop'; F.st2 = 0; p.air = true; p.vy = -460; p.vx = 0; F.hopFrom = p.x; F.hopTo = F.endX + 70; sfx.play('jump'); } }
  else if (F.st === 'hop') { F.st2 += dt; var k2 = Math.min(1, F.st2 / 0.9); p.x = F.hopFrom + (F.hopTo - F.hopFrom) * k2 + mv * 0; p.vy += 1000 * dt; p.y += p.vy * dt; var dk = F.endY - 22;
    if (p.y >= dk && p.vy > 0) { p.y = dk; p.air = false; } if (k2 >= 1 && !p.air) { F.st = 'walk'; F.st2 = 0; p.face = 1; } }
  else if (F.st === 'walk') { F.st2 += dt; p.x += 90 * dt; p.dist += 90 * dt; if (p.x >= F.endX + 200) { F.st = 'photo'; F.st2 = 0; } }
  else if (F.st === 'photo') { F.st2 += dt;
    if (F.st2 > 0.35 && !F.photo) { F.flash = 0.25; sfx.play('shutter'); F.snapAt = 1; } // Steve's camera goes off
    if (F.st2 > 3.4) { F.st = 'run'; F.st2 = 0; } }
  else if (F.st === 'run') { F.st2 += dt; p.x += 280 * dt; p.dist += 280 * dt; if (F.st2 > 1.6 && !F.done) { F.done = true; G.flumeDone = 1; G.mode = 'play'; PL.state = 'normal'; actClear(true); } }
  // camera: the train in the middle (the station once it is over)
  var tgt = F.st === 'walk' || F.st === 'photo' || F.st === 'run' ? Math.min(p.x - W * 0.45, F.endX + 160) : (carX(0) + carX(FLCAR.n - 1) - FLCAR.L) / 2 - W / 2;
  F.cx = F.cx == null ? tgt : F.cx + (tgt - F.cx) * Math.min(1, dt * 3); F.cy = trackY(F.cx + W / 2) - KIT.H * 0.6;
}
function stepFlFoe(f, dt, mv) {
  var F = FL, p = F.p;
  if (f.hp <= 0) { if (!f.gone) { f.vy += 900 * dt; f.y += f.vy * dt; f.x += mv; if (f.y > trackY(f.x) + 30) { f.gone = 1; for (var k = 0; k < 16; k++) F.fx.push({ x: f.x, y: trackY(f.x), vx: (Math.random() - 0.5) * 220, vy: -200 - Math.random() * 200, t: 0.8, c: '#f1e0b0' }); sfx.play('splash'); } } return; }
  if (f.hitT > 0) f.hitT -= dt;
  var other = F.foes.filter(function (o) { return o !== f && o.hp > 0; })[0], fast = other ? 1 : 1.45; // the one left gets angry
  if (F.st !== 'fight') { f.x = carX(f.car) - FLCAR.L * f.ox; f.y = deckY(f.x) - (F.st === 'intro' ? Math.max(0, 1 - (F.t - 0.4 * (f.id === 'cow' ? 2 : 1)) / 0.6) * 220 : 0); return; } /* they drop in from the sky as the ride sets off */
  f.t -= dt * fast; f.dir = p.x < f.x ? -1 : 1;
  if (f.st === 'idle') { f.x = carX(f.car) - FLCAR.L * f.ox; f.y = deckY(f.x);
    if (f.t <= 0) { var mv2 = f.id === 'pig' ? ['hop', 'charge', 'hop'] : ['hop', 'mugs', 'mugs', 'hop']; f.st = mv2[f.mi++ % mv2.length]; f.s = 0; } }
  else if (f.st === 'hop') { // jump to the next boat, towards you (never onto the boat the other brother is on)
    if (!f.s) { var pc = carAt(p.x), dirc = pc >= 0 && pc !== f.car ? (pc > f.car ? 1 : -1) : (f.car === 0 ? 1 : f.car === FLCAR.n - 1 ? -1 : (Math.random() < 0.5 ? 1 : -1)), nc = f.car + dirc;
      if (other && other.car === nc) nc = f.car - dirc; nc = Math.max(0, Math.min(FLCAR.n - 1, nc)); f.s = 1; f.from = f.car; f.car = nc; f.ox = 0.3 + Math.random() * 0.4; f.hk = 0; f.hy0 = f.y; sfx.play('jump'); }
    f.hk = Math.min(1, f.hk + dt * 1.25 * fast); var tx = carX(f.car) - FLCAR.L * f.ox, fx0 = carX(f.from) - FLCAR.L * 0.5; f.x = fx0 + (tx - fx0) * f.hk; f.y = deckY(f.x) - Math.sin(f.hk * Math.PI) * 120;
    if (f.hk >= 1) { f.y = deckY(f.x); f.st = 'idle'; f.t = f.id === 'pig' ? 1.3 : 1.0; G.shake = f.id === 'pig' ? 6 : 3; sfx.play('thud');
      for (var k = 0; k < 8; k++) F.fx.push({ x: f.x + (Math.random() - 0.5) * 40, y: f.y, vx: (Math.random() - 0.5) * 120, vy: -80 - Math.random() * 80, t: 0.4, c: '#a6968f' });
      if (f.id === 'pig' && !p.air && carAt(p.x) === f.car) flHurt(f.x); } } // Piggy lands like a bomb: be in the air or be on another boat
  else if (f.st === 'charge') { if (!f.s) { f.s = 1; f.t = 0.5; f.cd = p.x < f.x ? -1 : 1; sfx.play('roar'); }
    if (f.t <= 0) { f.ox -= f.cd * dt * 2.6 * fast; if (f.ox < 0.12 || f.ox > 0.88) { f.ox = Math.max(0.12, Math.min(0.88, f.ox)); f.st = 'idle'; f.t = 1.1; } }
    f.x = carX(f.car) - FLCAR.L * f.ox; f.y = deckY(f.x); }
  else if (f.st === 'mugs') { if (!f.s) { f.s = 1; f.n = 0; f.t = 0.3; }
    f.x = carX(f.car) - FLCAR.L * f.ox; f.y = deckY(f.x);
    if (f.t <= 0) { f.t = 0.45; f.n++; var dx = p.x - f.x + (Math.random() - 0.5) * 30, tt = 0.85; F.shots.push({ x: f.x, y: f.y - 40, vx: dx / tt, vy: -320 }); sfx.play('throw'); if (f.n >= 3) { f.st = 'idle'; f.t = 1.6; } } }
  // stomp them; touching them otherwise hurts
  var top = f.y - f.h;
  if (Math.abs(p.x - f.x) < f.w + 6 && p.y > top - 4 && p.y - 30 < f.y) {
    if (p.air && p.vy > 0 && p.y < top + 16 && f.hitT <= 0) { f.hp--; f.hitT = 1; p.vy = -440; p.jumps = 1; sfx.play('bosshit'); G.shake = 4; G.score += 100;
      if (f.hp <= 0) { f.vy = -300; sfx.play('boom'); G.score += 1000; } }
    else if (f.hitT <= 0.6) flHurt(f.x);
  }
}
function drawFlume() {
  var F = FL, g = KIT.ctx, W = KIT.W, H = KIT.H, cx = Math.round(F.cx || 0), cy = Math.round(F.cy || 0);
  // Ejaculand behind (the park's own backdrop, drifting down as the ride drops)
  drawBack(g, LV.zone, F.x0 + (cx - F.x0) * 0.6, LV.sy - KIT.H * 0.62 + Math.min(60, (cy - F.y0 + KIT.H * 0.6) * 0.15), W, H);
  // trestles under the channel, then the channel itself, then the cream
  for (var x = Math.floor(cx / 48) * 48; x < cx + W + 48; x += 48) { var ty = trackY(x) - cy + 18;
    R('#12040a', x - cx - 3, ty, 6, H - ty); R('#3a1418', x - cx - 2, ty, 4, H - ty);
    for (var by = ty + 20; by < H; by += 34) { for (var k = 0; k < 24; k++) { R('#2a0c10', x - cx - 2 + k, by + k * 0.6, 2, 2); } } }
  for (var sx = -4; sx < W + 8; sx += 4) { var wx = cx + sx, y = Math.round(trackY(wx) - cy);
    R('#12040a', sx, y - 8, 4, 28); R('#5a2018', sx, y - 7, 4, 3); R('#3a1410', sx, y - 4, 4, 22); if (Math.floor(wx / 16) % 2) R('#2a0c0a', sx, y + 2, 1, 16);
    R('#e8d4a0', sx, y - 5, 4, 6); R('#f1e0b0', sx, y - 6, 4, 3); if (Math.floor((wx + F.t * 70) / 12) % 3 === 0) R('#fffbe8', sx, y - 6, 3, 1); }
  // the boats
  for (var i = FLCAR.n - 1; i >= 0; i--) { var bx = carX(i) - FLCAR.L / 2, by = trackY(bx) + 3, a = Math.atan(trackG(bx));
    if (bx - cx < -80 || bx - cx > W + 80) continue; spr('p_logboat', bx - cx, by - cy, { sc: FLCAR.L / 60, rot: a }); }
  drawFlEntrance(g, cx, cy, W, H);
  F.ps.forEach(function (s) { spr('hog_shot', s.x - cx, s.y - cy, { anchor: 'c', flip: s.vx < 0 }); });
  // the station and the way into the Bone Pit (in front of the channel: the boats slide in under the dock)
  if (F.endX) drawFlStation(g, cx, cy, W, H);
  // a follower rides along in the back boat
  var C = CHR(); if (C.fol && F.st !== 'walk' && F.st !== 'photo' && F.st !== 'run') { var fb = carX(FLCAR.n - 1) - FLCAR.L * 0.7; spr(C.fol === 'cat' ? 'cat' : 'h_' + C.fol + '_adult_idle' + (Math.floor(G.t * 3) % 2), fb - cx, deckY(fb) - cy + 1, { sc: C.fol === 'cat' ? 1 : 0.8 }); }
  // Brothers Load
  F.foes.forEach(function (f) { if (f.gone || f.hide) return; var fr = f.spr + (Math.floor(F.t * 4) % 2) + (f.dir < 0 ? 'L' : ''), fl = f.hitT > 0 && Math.floor(f.hitT * 16) % 2;
    if (f.hp <= 0) fl = Math.floor(F.t * 12) % 2; if (!KIT.SPR[fr]) fr = f.spr + '0';
    if (f.st === 'hop' && f.hk < 0.15) R('#ff2630', f.x - cx - 2, f.y - f.h - cy - 14, 4, 8); // a tell before each hop
    spr(fr, f.x - cx, f.y - cy + 2, { sc: f.sc, flash: fl, rot: f.hp <= 0 ? F.t * 6 : 0 }); });
  F.shots.forEach(function (s) { var gx = KIT.ctx; gx.save(); gx.translate(s.x - cx, s.y - cy); gx.rotate(s.r); R('#12040a', -5, -6, 10, 12); R('#ffe36a', -4, -5, 7, 10); R('#fffbe8', -4, -5, 7, 3); R('#12040a', 3, -2, 3, 5); gx.restore(); });
  // the player
  var p = F.p, sp = p.air ? 0 : Math.abs(p.vx) + (F.st === 'walk' ? 90 : F.st === 'run' ? 300 : F.st === 'board' ? 110 : 0);
  if (!(p.inv > 0 && Math.floor(G.t * 20) % 2)) { var n = frameFor(CHR(), { state: F.st === 'dead' ? 'dead' : 'normal', air: p.air, vy: p.vy, dist: p.dist, atkT: p.atkT || 0, deadT: F.deadT || 0 }, sp);
    var rot = !p.air && F.st !== 'walk' && F.st !== 'photo' && F.st !== 'run' && F.st !== 'board' ? Math.atan(trackG(p.x)) : 0, sc = CHR().sc || 1;
    if (G.super) { var gf = superImg(n); if (gf) { g.save(); g.translate(Math.round(p.x - cx), Math.round(p.y - cy) + 1); g.rotate(rot); if (p.face < 0) g.scale(-1, 1); g.drawImage(gf, -gf.width * sc / 2, -gf.height * sc, gf.width * sc, gf.height * sc); g.restore(); } }
    else spr(n, p.x - cx, p.y - cy + 1, { flip: p.face < 0, rot: rot, sc: sc }); }
  F.fx.forEach(function (q) { if (q.drop) spr('hog_drop', q.x - cx, q.y - cy, {}); else R(q.c, q.x - cx - 1, q.y - cy - 1, 3, 3); });
  // the ride photo: the flash, then the picture pops up like the print at the end of a real flume
  if (F.snapAt) { F.snapAt = 0; var c = document.createElement('canvas'), sw = Math.min(260, W * 0.6), shh = sw * 0.62; c.width = Math.round(sw); c.height = Math.round(shh);
    var CV = KIT.ctx.canvas, S = CV.width / W, sxp = (p.x - cx - sw * 0.5) * S, syp = (p.y - cy - shh * 0.78) * S; try { c.getContext('2d').drawImage(CV, sxp, syp, sw * S, shh * S, 0, 0, c.width, c.height); } catch (e) {} F.photo = c; }
  if (F.flash > 0) { g.fillStyle = 'rgba(255,251,232,' + Math.min(1, F.flash * 5).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  if (F.photo && (F.st === 'photo' || F.st === 'run')) { var k = Math.min(1, (F.st === 'photo' ? F.st2 - 0.5 : 3) * 3); if (k > 0) {
    var pw = F.photo.width, ph = F.photo.height, px = W / 2 - pw / 2 - 8, py = H * 0.12 + (1 - k) * -H, gy = KIT.ctx;
    gy.save(); gy.translate(px + pw / 2 + 8, py + ph / 2 + 16); gy.rotate(-0.04); gy.translate(-(pw / 2 + 8), -(ph / 2 + 16));
    R('#12040a', -2, -2, pw + 20, ph + 40); R('#f1e7d0', 0, 0, pw + 16, ph + 36); R('#12040a', 7, 7, pw + 2, ph + 2); gy.drawImage(F.photo, 8, 8);
    text('THE LOAD FLUME', 8, ph + 14, { size: 6, col: '#c4121c' }); text('SAY CREAM!', pw + 8, ph + 14, { size: 6, align: 'right', col: '#12040a' });
    text('ON-RIDE PHOTO  #' + (1000 + (G.score % 9000)), 8, ph + 24, { size: 4, col: '#6a5a50' }); gy.restore(); } }
  if (F.st === 'run' && F.st2 > 0.9) { g.fillStyle = 'rgba(0,0,0,' + Math.min(1, (F.st2 - 0.9) * 1.6).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  if (F.st === 'dead' && F.deadT > 0.8) { g.fillStyle = 'rgba(0,0,0,' + Math.min(1, (F.deadT - 0.8) * 1.4).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
}
function drawFlEntrance(g, cx, cy, W, H) { // where the ride starts: the platform you walk along, the LOAD FLUME gate with bulbs, queue rails, Steve's height sign
  var F = FL, x1 = F.stX - cx, y = F.stY - cy, x0 = x1 - 520; if (x1 < -40 || x0 > W + 40) return;
  R('#12040a', x0 - 2, y - 2, x1 - x0 + 4, 8); R('#7a1a14', x0, y, x1 - x0, 4); R('#c4121c', x0, y, x1 - x0, 1); for (var k = 0; k < x1 - x0; k += 14) R('#4a1410', x0 + k, y + 1, 1, 3);
  for (var k2 = 10; k2 < x1 - x0; k2 += 60) { R('#12040a', x0 + k2 - 1, y + 6, 6, H - y); R('#3a1418', x0 + k2, y + 6, 4, H - y); }
  var gx = x1 - 300;
  [gx - 46, gx + 34].forEach(function (px) { R('#12040a', px, y - 110, 14, 110); R('#3a1418', px + 2, y - 108, 10, 108); for (var b = 0; b < 7; b++) R(Math.floor(G.t * 6 + b + px) % 2 ? '#ffe36a' : '#ff2630', px + 5, y - 102 + b * 15, 4, 4); });
  R('#12040a', gx - 58, y - 140, 120, 32); R('#c4121c', gx - 56, y - 138, 116, 28); R('#12040a', gx - 53, y - 135, 110, 22); text('THE LOAD FLUME', gx + 2, y - 130, { size: 6, align: 'center', col: '#ffe36a' });
  for (var b2 = 0; b2 < 12; b2++) R(Math.floor(G.t * 5 + b2) % 2 ? '#ffe36a' : '#ff2630', gx - 54 + b2 * 10, y - 144, 4, 4);
  for (var q = 0; q < 5; q++) R('#12040a', gx + 70 + q * 28, y - 18, 2, 18); R('#12040a', gx + 70, y - 18, 114, 2); R('#c4121c', gx + 70, y - 17, 114, 1);
  var sx = gx - 110; R('#12040a', sx - 1, y - 76, 3, 76); R('#12040a', sx - 22, y - 94, 44, 24); R('#f1e7d0', sx - 21, y - 93, 42, 22); text('MUST BE', sx, y - 90, { size: 4, align: 'center', col: '#12040a' }); text('THIS LOADED', sx, y - 82, { size: 4, align: 'center', col: '#c4121c' }); R('#c4121c', sx + 2, y - 58, 14, 2);
  spr(Math.floor(G.t * 2) % 2 ? 'steve0' : 'steve1', sx + 34, y, { sc: 0.5 });
  R('#12040a', x1 - 12, y - 4, 12, 6); R('#ffe36a', x1 - 10, y - 3, 8, 2);
}
function drawFlStation(g, cx, cy, W, H) {
  var F = FL, x0 = F.endX + 30 - cx, y = F.endY - 22 - cy;
  // the platform: red planks on posts
  R('#12040a', x0 - 2, y - 2, 900, 8); R('#7a1a14', x0, y, 900, 4); R('#c4121c', x0, y, 900, 1);
  for (var k = 0; k < 900; k += 14) R('#4a1410', x0 + k, y + 1, 1, 3);
  for (var k2 = 10; k2 < 900; k2 += 60) { R('#12040a', x0 + k2 - 1, y + 6, 6, H - y); R('#3a1418', x0 + k2, y + 6, 4, H - y); }
  // queue rails and Steve waving
  for (var q = 0; q < 3; q++) { R('#12040a', x0 + 40 + q * 26, y - 16, 2, 16); } R('#12040a', x0 + 40, y - 16, 56, 2);
  spr(Math.floor(G.t * 2) % 2 ? 'steve0' : 'steve1', x0 + 130, y, { sc: 0.5 });
  // Steve's camera on its pole, pointing at the spot where you stop
  var cxm = F.endX + 200 - cx + 70; R('#12040a', cxm - 1, y - 60, 3, 60); R('#12040a', cxm - 10, y - 74, 22, 15); R('#3a1418', cxm - 9, y - 73, 20, 13); R('#12040a', cxm - 14, y - 70, 6, 7); R('#ffe36a', cxm - 13, y - 69, 3, 3);
  if (F.flash > 0) { R('#fffbe8', cxm - 16, y - 72, 8, 10); }
  R('#c4121c', cxm + 4, y - 72, 3, 3);
  // the way into the Bone Pit: a skull of a cave mouth at the end of the platform
  var mx = F.endX + 560 - cx; if (mx < W + 160) {
    g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(mx - 90, y); g.lineTo(mx - 70, y - 120); g.lineTo(mx + 20, y - 150); g.lineTo(mx + 200, y - 160); g.lineTo(mx + 400, y - 160); g.lineTo(mx + 400, y); g.fill();
    g.fillStyle = '#3a2a24'; g.beginPath(); g.moveTo(mx - 80, y); g.lineTo(mx - 62, y - 112); g.lineTo(mx + 20, y - 140); g.lineTo(mx + 400, y - 150); g.lineTo(mx + 400, y); g.fill();
    g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(mx + 30, y - 70, 52, Math.PI, 0); g.lineTo(mx + 82, y); g.lineTo(mx - 22, y); g.fill(); // the skull's brow
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(mx + 30, y - 40, 40, Math.PI, 0); g.lineTo(mx + 70, y); g.lineTo(mx - 10, y); g.fill(); // the mouth you run into
    R('#12040a', mx + 2, y - 104, 16, 14); R('#12040a', mx + 42, y - 104, 16, 14); R('#c4121c', mx + 7, y - 99, 5, 5); R('#c4121c', mx + 47, y - 99, 5, 5);
    for (var t2 = 0; t2 < 6; t2++) R('#e8dcc0', mx - 6 + t2 * 12, y - 80 + 0, 7, 10); // teeth hanging over the way in
  }
}
(function () { // the Ejaculand arena is now the flume ride
  var sB = startBoss; startBoss = function (e) { if (e.boss === 'pig') { if (G.flumeDone) return; G.arena = e; startFlume(e); return; } sB(e); };
  var bA = beginAct; beginAct = function (ai, fc) { FL = null; G.flumeDone = 0; bA(ai, fc); };
})();
