/* =====================================================================================================
   TRAPS THAT ARE NOT HOLES (he said the acts leaned on death pits): wrecking balls on chains, steam vents that
   throw you up, things that drop when you pass under (flowerpots, rocks, weights), things that roll at you
   (bins, barrels, boulders), live wires that spark across the path, spiked ditches (tiles), and loops.
   Every zone dresses them its own way (TRAPLOOK).
   ===================================================================================================== */
var TRAPLOOK = {
  city: { ball: '#2a2a30', chain: '#5a545c', drop: 'crate', roll: 'bin', wire: '#ff2630' },
  sewer: { ball: '#3a4a3a', chain: '#4a5a4a', drop: 'rock', roll: 'barrel', wire: '#c8ff9a' },
  park: { ball: '#c4121c', chain: '#ffe36a', drop: 'pie', roll: 'ball', wire: '#ff6ad0' },
  bone: { ball: '#d8ccb0', chain: '#8a7a64', drop: 'rock', roll: 'skull', wire: '#d8b0ff' },
  factory: { ball: '#5a3a30', chain: '#a04a10', drop: 'weight', roll: 'barrel', wire: '#ffb040' },
  brain: { ball: '#5a5460', chain: '#8a0a10', drop: 'weight', roll: 'spike', wire: '#ff2630' }
};
function trapStep(e, dt) {
  var p = PL, k = e.k;
  if (k === 'swing') { var a = Math.sin(G.t * 1.7 + e.ph) * 1.15; e.px = e.x; e.py = e.y - 112; e.bx = e.px + Math.sin(a) * 80; e.by = e.py + Math.cos(a) * 80;
    if (p.state === 'normal' && Math.hypot(p.x - e.bx, p.y - 18 - e.by) < 12 + 11) hurt(e.bx); return; }
  if (k === 'vent') { var c = (G.t + e.ph * 2) % 2.6; e.warn = c > 1.6 && c < 2.0; e.on = c >= 2.0;
    if (e.on && Math.abs(p.x - e.x) < 14 && p.y <= e.y + 2 && p.y > e.y - 90 && p.state === 'normal') { p.vy = -720; p.air = true; p.jumps = 1; p.spring = 0.5; if (!e.snd || G.t - e.snd > 0.6) { sfx.play('dash'); e.snd = G.t; } }
    if (e.on && Math.random() < 0.6) FX.push({ k: 'bit', x: e.x + (Math.random() - 0.5) * 12, y: e.y - 4, vx: (Math.random() - 0.5) * 30, vy: -260 - Math.random() * 120, t: 0.45, c: Math.random() < 0.5 ? '#f1e7d0' : '#a6968f', g: 0 });
    if (e.warn && Math.random() < 0.3) FX.push({ k: 'bit', x: e.x + (Math.random() - 0.5) * 10, y: e.y - 4, vx: 0, vy: -60, t: 0.3, c: '#a6968f', g: 0 }); return; }
  if (k === 'faller') {
    if (e.gy === undefined) { var f = floorAt(e.x, e.y0 + 8, e.y0 + TS * 14, false); e.gy = f === null ? e.y0 + 9 * TS : f; e.st = 'hang'; e.fy = e.y0; }
    if (e.st === 'hang') { if (Math.abs(p.x - e.x) < 40 && p.y > e.fy && p.y < e.gy + 4) { e.st = 'shake'; e.t2 = 0.35; } }
    else if (e.st === 'shake') { e.t2 -= dt; if (e.t2 <= 0) { e.st = 'fall'; e.vy = 0; } }
    else if (e.st === 'fall') { e.vy += 1100 * dt; e.fy += e.vy * dt; if (e.fy >= e.gy - 6) { e.st = 'gone'; e.t2 = 3; poof(e.x, e.gy - 6, 10, ['#c4121c', '#7a6a6a', '#f1e7d0']); sfx.play('crumble'); }
      if (p.state === 'normal' && Math.abs(p.x - e.x) < 12 + PHW && e.fy > p.y - PH - 8 && e.fy < p.y) hurt(e.x); }
    else if (e.st === 'gone') { e.t2 -= dt; if (e.t2 <= 0) { e.st = 'hang'; e.fy = e.y0; } }
    return; }
  if (k === 'roller') {
    if (!e.balls) { e.balls = []; e.left = e.n || 2; e.cd = 0; }
    if (!e.armed && p.x < e.x && e.x - p.x < 330 && Math.abs(p.y - e.y) < 120) e.armed = true;
    if (e.armed && e.left > 0) { e.cd -= dt; if (e.cd <= 0) { e.cd = 1.5; e.left--; e.balls.push({ x: e.x, y: e.y, vx: -150, vy: 0, rot: 0, alive: true }); sfx.play('thud'); } }
    e.balls.forEach(function (b) { if (!b.alive) return; b.x += b.vx * dt; b.rot += b.vx * dt / 10;
      var f2 = floorAt(b.x, b.y - 18, b.y + 20, true); if (f2 !== null && b.vy >= 0) { b.y = f2; b.vy = 0; } else { b.vy += 900 * dt; b.y += b.vy * dt; }
      if (wallAt(b.x + Math.sign(b.vx) * 11, b.y - 8)) b.vx = -b.vx; if (b.y > LV.h * TS || Math.abs(b.x - p.x) > 700) b.alive = false;
      if (p.state === 'normal' && Math.abs(p.x - b.x) < 11 + PHW && p.y > b.y - 22 && p.y - PH < b.y) {
        if (p.vy > 40 && p.y - p.vy / 60 <= b.y - 14) { b.alive = false; poof(b.x, b.y - 10, 10, ['#7a6a6a', '#f1e7d0']); sfx.play('pop'); G.score += 100; p.vy = -330; } else hurt(b.x); } });
    if (e.left <= 0 && e.balls.every(function (b) { return !b.alive; }) && Math.abs(p.x - e.x) > 500) { e.armed = false; e.left = e.n || 2; e.balls = []; }
    return; }
  if (k === 'arc') { var c2 = (G.t + e.ph * 2) % 3; e.warn = c2 > 1.5 && c2 < 1.9; e.on = c2 >= 1.9 && c2 < 2.6; var x1 = e.x + (e.w || 4) * TS;
    if (e.on && p.state === 'normal' && p.x > e.x && p.x < x1 && p.y > e.y - 26) hurt(p.x); return; }
}
var TRAPKINDS = { swing: 1, vent: 1, faller: 1, roller: 1, arc: 1 };
var SETKINDS = { traffic: 1, train: 1, awning: 1, ramp: 1 };
function drawTrap(g, e, cx, cy) {
  var L = TRAPLOOK[LV.zone.id] || TRAPLOOK.city, k = e.k, x = Math.round(e.x - cx), y = Math.round(e.y - cy);
  if (k === 'swing' && e.bx !== undefined) { var px = Math.round(e.px - cx), py = Math.round(e.py - cy), bx = e.bx - cx, by = e.by - cy;
    R('#12040a', px - 46, py - 6, 60, 8); R(L.chain, px - 45, py - 5, 58, 6); R('#12040a', px - 46, py - 6, 6, 118); R(L.chain, px - 45, py - 5, 4, 117); // the gantry
    for (var i = 1; i < 8; i++) { var t = i / 8; R('#12040a', px + (bx - px) * t - 2, py + (by - py) * t - 2, 4, 4); R(L.chain, px + (bx - px) * t - 1, py + (by - py) * t - 1, 2, 2); }
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(bx, by, 13, 0, 6.3); g.fill(); g.fillStyle = L.ball; g.beginPath(); g.arc(bx, by, 12, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(bx - 4, by - 4, 4, 0, 6.3); g.fill();
    for (var s = 0; s < 8; s++) { var a = s / 8 * 6.283 + G.t; R('#a6968f', bx + Math.cos(a) * 13 - 1, by + Math.sin(a) * 13 - 1, 3, 3); } return; }
  if (k === 'vent') { R('#12040a', x - 10, y - 4, 20, 5); R('#5a545c', x - 9, y - 3, 18, 3); for (var v = -6; v <= 6; v += 4) R('#12040a', x + v, y - 3, 1, 3); if (e.warn) R('#ff9a30', x - 9, y - 4, 18, 1); return; }
  if (k === 'faller') { if (e.st === 'gone' || e.fy === undefined) return; var fy = Math.round(e.fy - cy), sh = e.st === 'shake' ? Math.round(Math.sin(G.t * 60) * 2) : 0;
    if (e.st !== 'fall') { var ropeTop = Math.max(-4, Math.round(e.y0 - cy - 220)); R('#12040a', x - 1 + sh, ropeTop, 3, fy - 20 - ropeTop); R(L.chain, x + sh, ropeTop, 1, fy - 20 - ropeTop); } // it hangs on a rope from above (a crane, a pulley); the rope snaps when you pass
    var fx = x + sh, d = L.drop;
    if (d === 'crate') { R('#12040a', fx - 11, fy - 22, 22, 22); R('#8a5a2a', fx - 10, fy - 21, 20, 20); R('#5a3a1a', fx - 10, fy - 13, 20, 3); R('#5a3a1a', fx - 2, fy - 21, 3, 20); R('#c08a4a', fx - 10, fy - 21, 20, 2); }
    else if (d === 'pot') { R('#12040a', x - 8 + sh, fy - 18, 16, 16); R('#a04a2a', x - 7 + sh, fy - 12, 14, 9); R('#c46a3a', x - 8 + sh, fy - 14, 16, 3); R('#3a8a3a', x - 5 + sh, fy - 20, 3, 6); R('#3a8a3a', x + 1 + sh, fy - 21, 3, 7); R('#ff2630', x - 1 + sh, fy - 24, 4, 4); }
    else if (d === 'pie') { R('#12040a', fx - 10, fy - 12, 20, 10); R('#c88a4a', fx - 9, fy - 9, 18, 6); R('#fffbe8', fx - 9, fy - 12, 18, 4); }
    else if (d === 'weight') { R('#12040a', fx - 10, fy - 20, 20, 18); R('#3a343c', fx - 9, fy - 19, 18, 16); text('1T', fx, fy - 15, { size: 6, align: 'center', col: '#f1e7d0' }); }
    else { g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(fx - 9, fy - 2); g.lineTo(fx + 9, fy - 2); g.lineTo(fx, fy + 16); g.fill(); g.fillStyle = L.ball; g.beginPath(); g.moveTo(fx - 7, fy - 1); g.lineTo(fx + 7, fy - 1); g.lineTo(fx, fy + 13); g.fill(); }
    if (e.st !== 'hang' || Math.abs(PL.x - e.x) < 90) { var gy = Math.round(e.gy - cy), w = 6 + 8 * Math.min(1, (e.fy - e.y0 + 40) / Math.max(1, e.gy - e.y0)); g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(x, gy - 1, w, 2.5, 0, 0, 6.3); g.fill(); }
    return; }
  if (k === 'roller') { (e.balls || []).forEach(function (b) { if (!b.alive) return; var bx = Math.round(b.x - cx), by = Math.round(b.y - cy);
    if (L.roll === 'bin') { spr('hog_bin', bx, by - 10, { anchor: 'c', rot: b.rot }); return; }
    g.save(); g.translate(bx, by - 11); g.rotate(b.rot); g.fillStyle = '#12040a'; g.beginPath(); g.arc(0, 0, 12, 0, 6.3); g.fill(); g.fillStyle = L.roll === 'skull' ? '#d8ccb0' : L.roll === 'ball' ? '#c4121c' : L.ball; g.beginPath(); g.arc(0, 0, 11, 0, 6.3); g.fill();
    if (L.roll === 'barrel') { R('#12040a', -11, -4, 22, 2); R('#12040a', -11, 3, 22, 2); } else if (L.roll === 'skull') { R('#12040a', -6, -4, 4, 4); R('#12040a', 2, -4, 4, 4); R('#12040a', -3, 4, 6, 2); }
    else if (L.roll === 'ball') { R('#ffe36a', -11, -2, 22, 4); } else if (L.roll === 'spike') { for (var s2 = 0; s2 < 6; s2++) { var a2 = s2 / 6 * 6.283; R('#d0c8d0', Math.cos(a2) * 13 - 2, Math.sin(a2) * 13 - 2, 4, 4); } }
    g.restore(); }); return; }
  if (k === 'arc') { var x1 = x + (e.w || 4) * TS; [x, x1].forEach(function (pxx) { R('#12040a', pxx - 3, y - 34, 6, 34); R('#5a545c', pxx - 2, y - 33, 4, 33); R(e.warn || e.on ? L.wire : '#3a343c', pxx - 3, y - 26, 6, 4); });
    if (e.on) { g.strokeStyle = L.wire; g.lineWidth = 2; for (var j = 0; j < 2; j++) { g.beginPath(); g.moveTo(x, y - 24); for (var q = 1; q <= 8; q++) g.lineTo(x + (x1 - x) * q / 8, y - 24 + (q < 8 ? (Math.random() - 0.5) * 14 : 0)); g.stroke(); } }
    else if (e.warn && Math.floor(G.t * 20) % 2) { R(L.wire, x + 2, y - 25, 3, 2); R(L.wire, x1 - 5, y - 25, 3, 2); }
    return; }
}
/* ---------- loops: run in fast enough and he goes all the way round ---------- */
var LOOPR = 112; // big enough to feel like a Sonic loop (14 tiles tall)
function loopStart(p) {
  var px0 = p.lastX === undefined ? p.x : p.lastX; p.lastX = p.x;
  if (p.loop || p.air || p.loopCd > 0 || p.gsp < 230) return false;
  // caught when he crosses the entry point this frame, however fast he is going (a fixed window let fast runs skip straight past)
  for (var i = 0; i < ENTS.length; i++) { var e = ENTS[i]; if (e.k !== 'loop') continue; if (px0 <= e.x + 2 && p.x + p.gsp / 60 >= e.x - 2 && p.x < e.x + 40 && Math.abs(p.y - e.y) < 10) { p.loop = { e: e, a: 0 }; p.x = e.x; return true; } }
  return false;
}
function loopStep(p, dt) { // round the circle, feet on the track, then out the far side the way he came in
  var L = p.loop, e = L.e, sp = Math.max(330, p.gsp - 60 * Math.sin(L.a) * dt * 10); // gravity slows the climb a little, the way down gives it back
  p.gsp = sp; L.a += sp / LOOPR * dt; var cx = e.x, cyy = e.y - LOOPR;
  if (L.a >= Math.PI * 2) { p.loop = null; p.loopCd = 0.6; p.x = cx + 2; p.y = e.y; p.rot = 0; p.gsp = Math.max(p.gsp, 560); return; }
  p.x = cx + Math.sin(L.a) * LOOPR; p.y = cyy + Math.cos(L.a) * LOOPR; p.rot = -L.a; p.air = false; p.face = 1; p.dist = (p.dist || 0) + sp * dt;
}
function drawLoop(g, e, cx, cy, front) { // the ring: its far half behind Cumhead, a strip of near track in front at the bottom
  var x = e.x - cx, y = e.y - cy - LOOPR, L = TRAPLOOK[LV.zone.id] || TRAPLOOK.city, col = LV.zone.edge[1];
  g.lineWidth = 10; g.strokeStyle = '#12040a'; g.beginPath(); g.arc(x, y, LOOPR + 5, 0, 6.3); g.stroke();
  g.lineWidth = 7; g.strokeStyle = col; g.beginPath(); g.arc(x, y, LOOPR + 5, 0, 6.3); g.stroke();
  g.lineWidth = 2; g.strokeStyle = LV.zone.edge[0]; g.beginPath(); g.arc(x, y, LOOPR + 2, 0, 6.3); g.stroke();
  for (var i = 0; i < 16; i++) { var a = i / 16 * 6.283; R('#12040a', x + Math.cos(a) * (LOOPR + 5) - 1, y + Math.sin(a) * (LOOPR + 5) - 1, 3, 3); }
}
/* ---------- Night City set pieces: each lives in one district only ---------- */
// traffic on the downtown street: cabs come at you from the right; jump them or bounce off their roofs
var TRAFFIC = { car: { spr: 'hog_car', w: 30, h: 26, v: 300 }, rats: { rats: 1, w: 34, h: 16, v: 240 }, cart: { spr: 'hog_minecart', w: 22, h: 28, v: 280 }, bumper: { spr: 'hog_bumpercar', w: 22, h: 26, v: 220 }, forklift: { spr: 'hog_forklift', w: 26, h: 38, v: 200 } };
var SWEEP = { train: { spr: 'hog_train', n: 3, len: 142, h: 44, v: 560 }, wave: { wave: 1, n: 1, len: 300, h: 40, v: 360 }, coaster: { spr: 'hog_coaster', n: 4, len: 72, h: 32, v: 520 }, ghost: { spr: 'hog_ghosttrain', n: 3, len: 112, h: 42, v: 480 }, ore: { spr: 'hog_oretrain', n: 3, len: 112, h: 38, v: 460 }, missile: { spr: 'hog_missile', n: 1, len: 70, h: 22, v: 700 } };
function trafficStep(e, dt) {
  var p = PL; if (!e.cars) { e.cars = []; e.cd = 1; }
  if (Math.abs(p.x - e.x) < (e.w || 40) * TS && Math.abs(p.y - e.y) < 60) { e.cd -= dt; if (e.cd <= 0) { e.cd = 3.2 + Math.random() * 1.6; e.warn = 0.9; e.cars.push({ x: p.x + KIT.W * 0.75 + 40, y: e.y, delay: 0.9, alive: true }); } }
  if (e.warn > 0) e.warn -= dt;
  var TK = TRAFFIC[e.kind || 'car']; e.cars.forEach(function (c) { if (c.delay > 0) { c.delay -= dt; return; } c.x -= TK.v * dt; if (c.x < e.x - 60 || c.x < p.x - KIT.W) c.alive = false;
    if (c.alive && p.state === 'normal' && Math.abs(p.x - c.x) < TK.w + PHW && p.y > c.y - TK.h && p.y - PH < c.y) { if (p.vy > 40 && p.y - p.vy / 60 <= c.y - TK.h + 8) { p.vy = -520; p.air = true; sfx.play('spring'); G.score += 100; } else hurt(c.x); } });
  e.cars = e.cars.filter(function (c) { return c.alive; });
}
// the subway: a warning light and horn, then a train sweeps the tracks. Wait up on the platforms
function trainStep(e, dt) {
  var p = PL; if (e.t2 === undefined) { e.t2 = 2 + e.ph; e.tx = null; }
  var near = Math.abs(p.x - e.x) < (e.w || 40) * TS / 2 + 200 && Math.abs(p.y - e.y) < 60;
  if (e.tx === null) { if (near) { e.t2 -= dt; e.warn = e.t2 < 1.4; if (e.t2 <= 0) { e.tx = p.x + KIT.W * 0.7 + 60; sfx.play('roar'); } } else e.warn = false; }
  else { var SK = SWEEP[e.kind || 'train']; e.tx -= SK.v * dt; e.warn = false; if (e.tx < p.x - KIT.W - 600) { e.tx = null; e.t2 = 4.5 + Math.random() * 2; }
    if (p.state === 'normal' && p.x > e.tx - 10 && p.x < e.tx + SK.n * SK.len && p.y > e.y - SK.h && p.y - PH < e.y) hurt(p.x + 30); }
}
// awnings on the cafe fronts: land on one and it throws you high
function awningTouch(e, dt) { var p = PL; if (p.state === 'normal' && p.vy > 0 && Math.abs(p.x - e.x) < 24 && p.y >= e.y - 14 && p.y - p.vy / 60 <= e.y - 10) { p.y = e.y - 14; p.vy = -600; p.air = true; p.jumps = 1; e.t = 0.2; sfx.play('bump'); } if (e.t > 0) e.t -= dt; }
// highway ramps: hit one at speed and you fly
function rampTouch(e, dt) { var p = PL; if (!p.air && p.state === 'normal' && p.gsp > 120 && Math.abs(p.x - e.x) < 10 && Math.abs(p.y - e.y) < 8) { p.vx = Math.max(p.gsp, 430); p.gsp = p.vx; p.vy = -560; p.air = true; p.jumps = 1; p.spring = 0.4; sfx.play('dash'); } }
var SETPIECE = { traffic: trafficStep, train: trainStep };
function drawSetpiece(g, e, cx, cy) {
  var x = Math.round(e.x - cx), y = Math.round(e.y - cy);
  if (e.k === 'traffic') { (e.cars || []).forEach(function (c) { if (c.delay > 0) { var wx = KIT.W - 18, a = Math.floor(G.t * 10) % 2; if (a) { g.fillStyle = 'rgba(255,246,192,0.8)'; g.beginPath(); g.arc(wx, c.y - cy - 10, 8, 0, 6.3); g.fill(); } text('!', wx, c.y - cy - 40, { size: 12, align: 'center', col: '#ffe36a', outline: true }); return; }
      var TK = TRAFFIC[e.kind || 'car'];
      if (TK.rats) { for (var ri = 0; ri < 3; ri++) spr('f_rat_' + (Math.floor(G.t * 12 + ri) % 4), c.x - cx + ri * 16 - 16, c.y - cy + 1, { flip: false }); return; }
      spr(TK.spr, c.x - cx, c.y - cy + 1, { flip: true }); if ((e.kind || 'car') === 'car') { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,240,180,0.18)'; g.beginPath(); g.moveTo(c.x - cx - 30, c.y - cy - 10); g.lineTo(c.x - cx - 110, c.y - cy - 24); g.lineTo(c.x - cx - 110, c.y - cy); g.fill(); g.restore(); } }); return; }
  if (e.k === 'train') { // the warning light on the wall, then the train
    var lx = Math.min(KIT.W - 20, Math.max(20, x)), on = e.warn && Math.floor(G.t * 8) % 2; R('#12040a', lx - 6, y - 64, 12, 18); R(on ? '#ff2630' : '#3a0a10', lx - 4, y - 62, 8, 6); R(e.warn && !on ? '#ffe36a' : '#3a3010', lx - 4, y - 54, 8, 6);
    var SK = SWEEP[e.kind || 'train'];
    if (e.tx !== null && e.tx !== undefined) { if (SK.wave) { var wx0 = e.tx - cx; R('rgba(241,224,176,0.85)', wx0 + 30, y - 40, SK.len, 42); spr('hog_creamwave', wx0 + 30, y + 2, { sc: 0.8 }); for (var f = 0; f < 3; f++) FX.push({ k: 'bit', x: e.tx + 20 + Math.random() * 30, y: e.y - 40 - Math.random() * 20, vx: -60, vy: -60, t: 0.4, c: '#fffbe8' }); }
      else for (var i = 0; i < SK.n; i++) spr(SK.spr, e.tx - cx + SK.len / 2 + i * SK.len, y + 2, { flip: (e.kind || 'train') === 'missile' }); }
    return; }
  if (e.k === 'awning') { var ak = e.kind || 'awning'; spr('hog_' + ak, x, y - (e.t > 0 ? 3 : 0) + (ak === 'awning' ? 0 : 4), { anchor: 'b' }); var pl = Math.max(4, Math.round((e.gy || e.y + 48) - e.y)); if (ak === 'awning') { [-21, 19].forEach(function (px) { R('#12040a', x + px - 1, y - 2, 4, pl + 2); R('#6a5a58', x + px, y - 2, 2, pl + 1); }); R('#12040a', x - 24, y + pl - 2, 9, 3); R('#12040a', x + 16, y + pl - 2, 9, 3); } else { var pc = ak === 'mushroom' ? '#f1e0b0' : '#6a5a58'; R('#12040a', x - 3, y + 2, 6, pl - 1); R(pc, x - 2, y + 3, 4, pl - 2); } return; } // poles reach the ground under it
  if (e.k === 'ramp') { var gq = KIT.ctx; gq.fillStyle = '#12040a'; gq.beginPath(); gq.moveTo(x - 30, y); gq.lineTo(x + 10, y - 22); gq.lineTo(x + 10, y); gq.fill(); gq.fillStyle = '#c4121c'; gq.beginPath(); gq.moveTo(x - 27, y - 1); gq.lineTo(x + 8, y - 20); gq.lineTo(x + 8, y - 1); gq.fill(); for (var s = 0; s < 4; s++) { gq.fillStyle = '#12040a'; gq.fillRect(x - 18 + s * 7, y - 6 - s * 4, 4, 3); } return; }
}
