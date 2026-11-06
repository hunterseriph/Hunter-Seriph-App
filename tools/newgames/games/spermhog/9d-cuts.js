/* ---------- zone to zone cutscenes (his ask: you should see yourself going into the next area) ----------
   Played between act 2's tally and the next zone's title card: down a manhole into the Cream Sewers, shot up a cream geyser
   into Ejaculand, down the skull's throat and the pit into the Bone Pit, a runaway mine cart into the Blood Factory, the cage
   lift up into Spunk Brain. Hard-edged pixel shapes in each place's colours, the character being played as the star.
   A or START skips after a moment. G.mode 'cut', state in CUT. */
var CUT = null, CUTLEN = { city: 5.4, sewer: 5.2, park: 5.4, bone: 5.4, factory: 5.4 };
function startCut(from, then) { CUT = { k: from, t: 0, then: then, fx: [] }; G.mode = 'cut'; music.play(from === 'factory' ? 'hogbrain' : ({ city: 'hogsewer', sewer: 'hogpark', park: 'hogbone', bone: 'hogfactory' })[from] || 'hogclear'); KIT.closeMenu(); }
function stepCut(dt) {
  if (!CUT) return; CUT.t += dt; CUT.fx = CUT.fx.filter(function (q) { q.t -= dt; q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; return q.t > 0; });
  if (CUT.t > CUTLEN[CUT.k] || (CUT.t > 0.8 && (KIT.pressed('a') || KIT.pressed('start')))) { var f = CUT.then; CUT = null; f(); }
}
function cutChar(x, y, st, face, rot, sp) { // the character being played, posed
  var p = { state: 'normal', air: st === 'jump' || st === 'fall', vy: st === 'fall' ? 300 : -200, dist: G.t * 260, atkT: 0 };
  var n = frameFor(CHR(), p, st === 'run' ? 260 : st === 'walk' ? 80 : 0), sc = CHR().sc || 1;
  if (G.super) { var gf = superImg(n), g = KIT.ctx; if (gf) { g.save(); g.translate(Math.round(x), Math.round(y)); if (rot) g.rotate(rot); if (face < 0) g.scale(-1, 1); g.drawImage(gf, -gf.width * sc / 2, -gf.height * sc, gf.width * sc, gf.height * sc); g.restore(); return; } }
  spr(n, x, y, { flip: face < 0, rot: rot || 0, sc: sc });
  var C = CHR(); if (C.fol && st !== 'fall') spr(C.fol === 'cat' ? 'cat' : 'h_' + C.fol + '_adult_' + (st === 'run' ? 'run' + (Math.floor(G.t * 12) % 4) : 'idle0'), x - face * 26, y, { flip: face < 0, sc: C.fol === 'cat' ? 1 : 0.8 });
}
function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
function cutMoon(g, x, y, r) { g.fillStyle = '#c4121c'; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); g.fillStyle = '#8a0a14'; g.beginPath(); g.arc(x + r * 0.3, y - r * 0.25, r * 0.3, 0, 6.3); g.fill(); g.fillStyle = '#ff2630'; g.fillRect(x - r * 0.5, y + r * 0.2, r * 0.25, r * 0.12); }
function cutSkyline(g, W, base, col, seed, hmin, hmax, ox) { var x = -((ox || 0) % 60) - 60, k = seed; while (x < W + 60) { k = (k * 9301 + 49297) % 233280; var w = 26 + (k % 40), h = hmin + (k % (hmax - hmin)); R(col, x, base - h, w, h); if (k % 3 === 0) { g.fillStyle = col; g.beginPath(); g.moveTo(x, base - h); g.lineTo(x + w / 2, base - h - 18); g.lineTo(x + w, base - h); g.fill(); }
  for (var wy = base - h + 6; wy < base - 6; wy += 9) for (var wx = x + 4; wx < x + w - 4; wx += 7) if (((wx * 7 + wy * 13 + k) % 11) < 2) R(((wx + wy) % 3) ? '#ff2630' : '#f1d8a8', wx, wy, 3, 4); x += w + 2; } }
function drawCut() {
  var g = KIT.ctx, W = KIT.W, H = KIT.H, t = CUT.t, k = CUT.k;
  ({ city: cutManhole, sewer: cutGeyser, park: cutPit, bone: cutCart, factory: cutLift })[k](g, t, W, H);
  CUT.fx.forEach(function (q) { R(q.c, q.x - 1, q.y - 1, q.s || 3, q.s || 3); });
  // letterbox bars, a fade in and out
  R('#000', 0, 0, W, 18); R('#000', 0, H - 18, W, 18);
  var L = CUTLEN[k], a = t < 0.35 ? 1 - t / 0.35 : t > L - 0.45 ? (t - (L - 0.45)) / 0.45 : 0; if (a > 0) { g.fillStyle = 'rgba(0,0,0,' + Math.min(1, a).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  if (t > 0.8) text('A  SKIP', W - 10, H - 13, { size: 5, align: 'right', col: '#4a1a1c' });
}
/* Clubhouse Row -> the Cream Sewers: lift the manhole, drop down the shaft, splash into the cream */
function cutManhole(g, t, W, H) {
  var gy = H * 0.72, rv = gy + H * 2.1 + H * 0.55, mfy = t < 1.6 ? gy : gy - 30 + ease((t - 1.6) / 2.0) * (rv - gy + 30); // where he is: he drops down the shaft to the river
  var dn = Math.max(0, Math.min(rv - H * 0.68, mfy - H * 0.55)); // the camera follows him down
  g.save(); g.translate(0, -dn);
  skyBands(g, ['#070204', '#12040a', '#1e060c', '#2c0a10'], W, H); cutMoon(g, W * 0.72, H * 0.26, 26);
  cutSkyline(g, W, H * 0.62, '#16060a', 7, 50, 120); cutSkyline(g, W, H * 0.7, '#22080e', 3, 30, 80, 30);
  R('#12040a', 0, gy, W, H * 2.6); R('#3a1214', 0, gy, W, 6); R('#5a2024', 0, gy, W, 2);
  for (var bx = 0; bx < W; bx += 24) R('#2a0c10', bx, gy + 8, 1, 24);
  // street lamp with a dotted pool of light
  R('#0a0204', W * 0.2, gy - 90, 4, 90); R('#0a0204', W * 0.2, gy - 90, 18, 3); R('#f1d8a8', W * 0.2 + 12, gy - 87, 8, 4);
  for (var ly = 0; ly < 84; ly += 3) for (var lx = -ly * 0.4; lx < ly * 0.4; lx += 3) if ((lx + ly) % 6 === 0) R('#3a1a12', W * 0.2 + 16 + lx, gy - 84 + ly, 1, 1);
  var mx = W * 0.5, lift = ease((t - 1.0) / 0.35), lx2 = mx + lift * 46, ly2 = gy - Math.sin(lift * Math.PI) * 30;
  R('#000', mx - 18, gy - 1, 36, 6); // the hole
  if (t > 1.0 && t < 1.05 && !CUT.clang) { CUT.clang = 1; sfx.play('clink'); sfx.play('thud'); }
  g.save(); g.translate(lx2, ly2); g.rotate(lift * 3.1); R('#12040a', -19, -3, 38, 6); R('#4a3a34', -18, -2, 36, 4); R('#6a5a50', -18, -2, 36, 1); for (var q = -14; q < 16; q += 6) R('#2a1a18', q, -1, 2, 3); g.restore();
  // him: runs to the hole, lifts the lid, hops in and falls
  var cx = t < 1.0 ? -30 + ease(t / 1.0) * (mx - 10 + 30) : mx - 10;
  if (t < 1.6) cutChar(cx, gy, t < 0.95 ? 'run' : 'idle', 1);
  else { var ft = t - 1.6, cy = mfy; cutChar(mx, cy, ft >= 2 ? 'idle' : 'fall', 1, ft < 2 ? Math.sin(ft * 9) * 0.25 : 0);
    if (Math.random() < 0.5 && ft < 2) CUT.fx.push({ x: mx + (Math.random() - 0.5) * 30, y: cy - dn - 40, vx: 0, vy: -200, t: 0.3, c: '#5a2a24', s: 2 }); }
  // the shaft: brick walls, a ladder, drips, then the sewer's arches and the cream river
  var s0 = gy + 6, s1 = gy + H * 2.1; R('#1a0a0a', mx - 44, s0, 88, s1 - s0);
  for (var yy = s0; yy < s1; yy += 8) for (var xx = mx - 44; xx < mx + 44; xx += 16) { var off = ((yy / 8) % 2) * 8; R('#2a1410', xx + off, yy, 15, 7); }
  R('#0a0404', mx - 18, s0, 36, s1 - s0); for (var ry = s0; ry < s1; ry += 10) R('#5a4a3a', mx + 10, ry, 8, 2); R('#3a2a20', mx + 10, s0, 2, s1 - s0); R('#3a2a20', mx + 16, s0, 2, s1 - s0);
  R('#0e1a12', 0, s1, W, H); R('#16261a', 0, s1, W, 30);
  for (var ax = -40; ax < W + 80; ax += 110) { g.fillStyle = '#26382a'; g.beginPath(); g.arc(ax + 55, s1 + 70, 50, Math.PI, 0); g.lineTo(ax + 105, s1 + 140); g.lineTo(ax + 5, s1 + 140); g.fill(); g.fillStyle = '#0a1208'; g.beginPath(); g.arc(ax + 55, s1 + 76, 38, Math.PI, 0); g.lineTo(ax + 93, s1 + 140); g.lineTo(ax + 17, s1 + 140); g.fill(); }
  R('#e8d4a0', 0, rv, W, H); R('#f1e0b0', 0, rv, W, 4); for (var wv = 0; wv < W; wv += 14) R('#fffbe8', (wv + t * 40) % W, rv + 1, 6, 1);
  if (t > 3.58 && !CUT.splash) { CUT.splash = 1; sfx.play('splash'); for (var i = 0; i < 26; i++) CUT.fx.push({ x: mx, y: rv - dn, vx: (Math.random() - 0.5) * 260, vy: -150 - Math.random() * 260, g: 600, t: 1.2, c: i % 2 ? '#fffbe8' : '#f1e0b0' }); }
  g.restore();
}
/* the Cream Sewers -> Ejaculand: a cream geyser blasts him up out of a grate into the park at night */
function cutGeyser(g, t, W, H) {
  var sy0 = H * 0.76, top0 = -H * 1.5, gy0 = top0 + H * 1.08, pyw = t < 1.45 ? sy0 : t < 3.0 ? Math.max(top0 + H * 0.75, sy0 - (t - 1.45) * 900) : Math.min(gy0, top0 + H * 0.75 + (t - 3.0) * (t - 3.0) * 500);
  var up = Math.max(0, Math.min(H * 1.5, H * 0.62 - pyw)); g.save(); g.translate(0, up);
  // the park above (seen as the camera rises): sky, fireworks, the gates, the big wheel
  var top = -H * 1.5; R('#08030a', 0, top, W, H * 1.5);
  for (var sb = 0; sb < 6; sb++) R(['#08030a', '#10040c', '#1a0610', '#260812', '#320a16', '#3e0c1a'][sb], 0, top + sb * H * 0.2, W, H * 0.2 + 1);
  cutMoon(g, W * 0.2, top + H * 0.28, 22);
  g.strokeStyle = '#2a0c14'; g.lineWidth = 3; var wx = W * 0.78, wy = top + H * 0.62, wr = 70; g.beginPath(); g.arc(wx, wy, wr, 0, 6.3); g.stroke();
  for (var sp = 0; sp < 12; sp++) { var a = sp / 12 * 6.28 + t * 0.4; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); g.stroke(); R(sp % 2 ? '#ff2630' : '#ffe36a', wx + Math.cos(a) * wr - 3, wy + Math.sin(a) * wr - 3, 6, 6); }
  R('#2a0c14', wx - 3, wy, 6, H * 0.4);
  var gy = top + H * 1.08; R('#12040a', 0, gy, W, H * 0.5); R('#c4121c', 0, gy, W, 3);
  // the gates
  var gx = W * 0.5; R('#12040a', gx - 110, gy - 120, 24, 120); R('#12040a', gx + 86, gy - 120, 24, 120); g.fillStyle = '#12040a'; g.beginPath(); g.arc(gx, gy - 120, 110, Math.PI, 0); g.lineTo(gx + 86, gy - 120); g.arc(gx, gy - 120, 86, 0, Math.PI, true); g.fill();
  for (var bl = 0; bl < 15; bl++) { var ba = Math.PI + bl / 14 * Math.PI; R(Math.floor(t * 6 + bl) % 2 ? '#ffe36a' : '#ff2630', gx + Math.cos(ba) * 98 - 2, gy - 120 + Math.sin(ba) * 98 - 2, 4, 4); }
  R('#c4121c', gx - 66, gy - 186, 132, 22); R('#12040a', gx - 64, gy - 184, 128, 18); text('EJACULAND', gx, gy - 180, { size: 8, align: 'center', col: '#ffe36a' });
  for (var bar = gx - 84; bar < gx + 86; bar += 12) R('#2a0c10', bar, gy - 116, 3, 116);
  spr(Math.floor(t * 3) % 2 ? 'steve0' : 'steve1', gx + 140, gy, { sc: 0.45 });
  // fireworks once he is up
  if (t > 2.6 && Math.random() < 0.08) { var fxx = Math.random() * W, fyy = top + H * 0.15 + Math.random() * H * 0.4 + up; var cc = Math.random() < 0.5 ? '#ffe36a' : '#ff2630'; for (var fi = 0; fi < 18; fi++) { var fa = fi / 18 * 6.28; CUT.fx.push({ x: fxx, y: fyy, vx: Math.cos(fa) * 90, vy: Math.sin(fa) * 90, g: 60, t: 0.9, c: cc, s: 2, cam: 1 }); } sfx.play('pop'); }
  // the sewer below: the tunnel and the grate he stands on
  R('#0e1a12', 0, 0, W, H); for (var ax = -20; ax < W; ax += 90) { g.fillStyle = '#1a2a1e'; g.beginPath(); g.arc(ax + 45, H * 0.5, 44, Math.PI, 0); g.lineTo(ax + 89, H); g.lineTo(ax + 1, H); g.fill(); }
  R('#26382a', 0, 0, W, 10); var sy = H * 0.76; R('#2c3a2e', 0, sy, W, H - sy); R('#4a5a4a', 0, sy, W, 3);
  var mx = W * 0.5; R('#000', mx - 22, sy - 2, 44, 6); for (var gb = mx - 20; gb < mx + 20; gb += 6) R('#5a5a4a', gb, sy - 2, 3, 6);
  // the geyser: rumble, then a column of cream
  if (t < 1.5) { var sh = t > 0.6 ? (Math.random() - 0.5) * 3 : 0; g.translate(sh, 0); if (t > 0.7 && Math.random() < 0.4) CUT.fx.push({ x: mx + (Math.random() - 0.5) * 30, y: sy, vx: (Math.random() - 0.5) * 40, vy: -60 - Math.random() * 60, g: 300, t: 0.5, c: '#f1e0b0', s: 2 }); if (t > 0.6 && !CUT.rum) { CUT.rum = 1; sfx.play('rumble'); } }
  var gt = t - 1.4, py;
  if (gt > 0) { var colTop = Math.max(top + H * 0.9, sy - gt * 900); R('#e8d4a0', mx - 14, colTop, 28, sy - colTop); R('#fffbe8', mx - 6, colTop, 8, sy - colTop); R('#f1e0b0', mx - 20, colTop - 6, 40, 12);
    if (!CUT.blast) { CUT.blast = 1; sfx.play('spring'); sfx.play('splash'); } }
  py = pyw;
  var px = t < 3.0 ? mx : mx + Math.min(70, (t - 3.0) * 90);
  cutChar(px, py, t < 1.45 ? 'idle' : py < gy - 1 ? 'jump' : 'idle', 1, t > 1.45 && t < 3.0 ? (t - 1.45) * 8 : 0);
  if (py >= gy - 1 && t > 3 && !CUT.land) { CUT.land = 1; sfx.play('thud'); }
  g.restore();
}
/* Ejaculand -> the Bone Pit: down the skull's throat, the floor gives, a long fall past ribs and eyes in the walls */
function cutPit(g, t, W, H) {
  var pfy = H * 0.74, pbot = pfy + H * 2.4 + H * 0.2, ppy = t < 1.9 ? pfy : Math.min(pbot - 4, pfy + (t - 1.9) * (t - 1.9) * 520);
  var fall = Math.max(0, Math.min(pbot - H * 0.8, ppy - H * 0.55)); g.save(); g.translate(0, -fall);
  // the throat: a tunnel of bone with torches scrolling past
  R('#120a08', 0, 0, W, H * 3.6); var sc = Math.min(t, 1.8) * 220;
  for (var rb = -((sc) % 60); rb < W + 60; rb += 60) { g.strokeStyle = '#3a2e24'; g.lineWidth = 6; g.beginPath(); g.arc(rb, H * 0.55, 90, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.strokeStyle = '#5a4a3a'; g.lineWidth = 2; g.beginPath(); g.arc(rb, H * 0.55, 92, Math.PI * 1.1, Math.PI * 1.5); g.stroke(); }
  for (var tx = -((sc * 1.0) % 160); tx < W + 160; tx += 160) { R('#2a1a10', tx, H * 0.4, 4, 16); var fl = 4 + Math.sin(G.t * 20 + tx) * 2; R('#ff2630', tx - 2, H * 0.4 - fl - 4, 8, fl + 4); R('#ffb040', tx, H * 0.4 - fl, 4, fl); }
  var fy = H * 0.74; R('#3a2e24', 0, fy, W, 8); R('#8a7a64', 0, fy, W, 2);
  for (var sk = -((sc) % 40); sk < W; sk += 40) { R('#c8b89a', sk + 4, fy + 2, 10, 6); R('#12040a', sk + 6, fy + 4, 2, 2); R('#12040a', sk + 10, fy + 4, 2, 2); }
  var hx = W * 0.42;
  if (t < 1.55) cutChar(hx, fy, 'run', 1);
  else if (t < 1.9) { var sh = (Math.random() - 0.5) * 3; cutChar(hx + sh, fy, 'idle', 1); if (!CUT.crk) { CUT.crk = 1; sfx.play('crumble'); }
    for (var c2 = 0; c2 < 5; c2++) R('#000', hx - 30 + c2 * 14, fy, 8, 3 + (t - 1.55) * 30); }
  if (t >= 1.9) { R('#000', hx - 40, fy, 80, H * 3); // the hole, then the pit: walls of bone either side
    var pw = 150, cxp = hx; for (var wy = fy; wy < fy + H * 2.8; wy += 24) { var j = (wy * 7) % 13; R('#2a2018', 0, wy, cxp - pw / 2 - j, 24); R('#2a2018', cxp + pw / 2 + j, wy, W, 24);
      R('#4a3e30', cxp - pw / 2 - j - 6, wy, 6, 24); R('#4a3e30', cxp + pw / 2 + j, wy, 6, 24);
      if ((wy / 24) % 3 === 0) { for (var r2 = 0; r2 < 4; r2++) R('#c8b89a', cxp - pw / 2 - j - 40, wy + 4 + r2 * 5, 34, 2); }
      if ((wy / 24) % 4 === 1) { var blink = Math.floor(G.t * 2 + wy) % 5; if (blink) { R('#ff2630', cxp + pw / 2 + j + 18, wy + 8, 4, 3); R('#ff2630', cxp + pw / 2 + j + 28, wy + 8, 4, 3); } }
      if ((wy / 24) % 5 === 2) { R('#e8dcc0', cxp - pw / 2 - j - 26, wy + 2, 16, 14); R('#12040a', cxp - pw / 2 - j - 23, wy + 6, 4, 4); R('#12040a', cxp - pw / 2 - j - 16, wy + 6, 4, 4); } }
    var bot = fy + H * 2.4 + H * 0.2; R('#4e4234', 0, bot, W, H); for (var hp = 0; hp < W; hp += 18) { R('#c8b89a', hp, bot - 6 - (hp * 3) % 8, 14, 10); R('#12040a', hp + 3, bot - 3 - (hp * 3) % 8, 2, 2); R('#12040a', hp + 8, bot - 3 - (hp * 3) % 8, 2, 2); }
    var ft = t - 1.9, py = ppy; cutChar(cxp, py, py >= bot - 4 ? 'idle' : 'fall', 1, py < bot - 4 ? ft * 5 : 0);
    if (py >= bot - 4 && !CUT.land) { CUT.land = 1; sfx.play('thud'); G.shake = 6; for (var d = 0; d < 20; d++) CUT.fx.push({ x: cxp, y: bot - 4 - fall, vx: (Math.random() - 0.5) * 220, vy: -60 - Math.random() * 120, g: 400, t: 0.8, c: d % 2 ? '#c8b89a' : '#8a7a64' }); }
    // the dark of the pit: a dotted ring of light round him near the bottom
    if (py > fy + H) { for (var dy2 = 0; dy2 < H * 1.2; dy2 += 4) for (var dx2 = 0; dx2 < W; dx2 += 4) { var dd = Math.hypot(dx2 - cxp, dy2 + (py - 30 - H * 0.6) - (py - 30)); if (dd > 150 && ((dx2 + dy2) % 8 === 0)) R('rgba(0,0,0,0.5)', dx2, dy2 + py - 30 - H * 0.6, 4, 4); } } }
  g.restore();
}
/* the Bone Pit -> the Blood Factory: a runaway mine cart up and out of the pit, through the factory gate */
function cutCart(g, t, W, H) {
  var s = t < 0.9 ? 0 : (t - 0.9) * (t - 0.9) * 180 + (t - 0.9) * 120, out = t > 3.0;
  // sky: the factory's red smog (seen once out of the tunnel)
  for (var b = 0; b < 6; b++) R(['#160606', '#240808', '#320a0a', '#420e0c', '#52120e', '#621610'][b], 0, b * H * 0.15, W, H * 0.15 + 1); R('#621610', 0, H * 0.9, W, H * 0.1);
  // the factory: stacks belching smoke, lit windows, pipes
  var fx0 = W * 0.4 - Math.max(0, s - 400) * 0.3;
  for (var st = 0; st < 5; st++) { var sx = fx0 + st * 70, sh = 120 + (st * 37) % 60; R('#1a0a08', sx, H * 0.75 - sh, 18, sh); R('#c4121c', sx, H * 0.75 - sh + 8, 18, 3);
    if (Math.random() < 0.4) CUT.fx.push({ x: sx + 9, y: H * 0.75 - sh, vx: 20 + Math.random() * 20, vy: -30 - Math.random() * 20, t: 1.4, c: Math.random() < 0.5 ? '#3a1010' : '#5a1a14', s: 6 }); }
  R('#12040a', fx0 - 30, H * 0.48, 380, H * 0.3); for (var fw = 0; fw < 360; fw += 16) for (var fh = 0; fh < 50; fh += 14) if ((fw + fh) % 3 === 0) R(fw % 32 ? '#ff2630' : '#ffb040', fx0 - 22 + fw, H * 0.52 + fh, 8, 6);
  R('#2a0c0a', fx0 - 30, H * 0.46, 380, 6); for (var pp = 0; pp < 380; pp += 40) R('#4a1a14', fx0 - 30 + pp, H * 0.4, 8, H * 0.08);
  // the gate he smashes through
  var gateX = W * 0.86 - Math.max(0, s - 400) * 0.6, gy = H * 0.78; if (!CUT.smash) { R('#3a1410', gateX, gy - 70, 10, 70); R('#3a1410', gateX + 34, gy - 70, 10, 70); for (var gb = 0; gb < 5; gb++) R('#5a2018', gateX - 4, gy - 64 + gb * 13, 52, 6); }
  // the tunnel out of the pit (before he is out)
  if (!out) { var tx = Math.max(-W, W * 0.2 - s * 0.6); R('#201a14', tx - W, 0, W * 1.4, H); g.fillStyle = '#000'; g.beginPath(); g.arc(tx + W * 0.4, H * 0.8, H * 0.55, Math.PI, 0); g.fill(); for (var rb = 0; rb < 8; rb++) R('#c8b89a', tx - W + rb * 60, H * 0.7, 40, 3); }
  // the rails, sloping up out of the pit then flat
  var ry = function (x) { return out ? gy : gy + Math.max(0, (W * 0.5 - x)) * 0.12; };
  for (var rx = 0; rx < W; rx += 4) { R('#3a2e24', rx, ry(rx), 4, 3); if (Math.floor((rx + s) / 14) % 2) R('#2a1a10', rx, ry(rx) + 3, 4, 3); }
  // the cart and him in it
  var cx = Math.min(W * 0.5 + Math.max(0, t - 3.3) * 260, W * 0.2 + s * 0.4), cyy = ry(cx) - 2, tilt = out ? 0 : -0.12, bump = Math.sin(G.t * 30) * (t > 0.9 ? 1 : 0);
  if (!CUT.smash && cx > gateX - 26) { CUT.smash = 1; sfx.play('crumble'); sfx.play('thud'); G.shake = 6; for (var sp = 0; sp < 24; sp++) CUT.fx.push({ x: gateX + 20, y: gy - 30 - Math.random() * 40, vx: 60 + Math.random() * 240, vy: -200 + Math.random() * 160, g: 600, t: 1.2, c: sp % 2 ? '#5a2018' : '#3a1410', s: 4 }); }
  g.save(); g.translate(cx, cyy + bump); g.rotate(tilt);
  cutChar(0, -14, t < 0.7 ? 'idle' : 'jump', 1, 0);
  R('#12040a', -22, -20, 44, 20); R('#4a3a30', -20, -18, 40, 16); R('#6a5a4a', -20, -18, 40, 2); R('#2a1a14', -20, -10, 40, 2);
  for (var wh = -14; wh <= 14; wh += 28) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(wh, 0, 6, 0, 6.3); g.fill(); g.fillStyle = '#6a5a4a'; g.beginPath(); g.arc(wh, 0, 3, 0, 6.3); g.fill(); }
  g.restore();
  if (t > 0.9 && Math.random() < 0.6) CUT.fx.push({ x: cx - 20, y: cyy, vx: -100, vy: -30 - Math.random() * 40, g: 300, t: 0.3, c: '#ffe36a', s: 2 });
  if (t > 0.9 && !CUT.go) { CUT.go = 1; sfx.play('dash'); }
}
/* the Blood Factory -> Spunk Brain: the cage lift, up past pipes and warning lights, the doors part on the brain */
function cutLift(g, t, W, H) {
  var up = t < 0.9 ? 0 : t < 3.4 ? (t - 0.9) * (t - 0.9) * 120 + (t - 0.9) * 60 : 0, arrived = t >= 3.4;
  var mx = W * 0.5;
  if (!arrived) {
    R('#160c0a', 0, 0, W, H); var s = up * 3;
    for (var y = -((s) % 60) - 60; y < H + 60; y += 60) { R('#3a2420', mx - 120, y, 240, 6); R('#6a4a40', mx - 120, y, 240, 1); R(Math.floor(G.t * 4 + y) % 2 ? '#ff2630' : '#5a0a10', mx - 110, y + 14, 6, 6); R(Math.floor(G.t * 4 + y) % 2 ? '#5a0a10' : '#ff2630', mx + 104, y + 14, 6, 6); }
    for (var px = 0; px < 4; px++) { R('#2a1814', mx - 150 + px * 8, 0, 5, H); R('#2a1814', mx + 130 + px * 8, 0, 5, H); }
    for (var y2 = -((s * 1.3) % 90) - 90; y2 < H + 90; y2 += 90) { R('#4a0a10', mx - 152, y2, 36, 10); R('#4a0a10', mx + 118, y2 + 40, 36, 10); }
    // the cage
    var cyy = H * 0.62 - (t < 0.9 ? 0 : Math.min(40, (t - 0.9) * 40)); R('#12040a', mx - 50, cyy - 80, 100, 4); R('#12040a', mx - 50, cyy, 100, 6); R('#5a4a40', mx - 48, cyy + 1, 96, 3);
    for (var b = mx - 50; b <= mx + 50; b += 10) R('#2a1a18', b, cyy - 80, 2, 80); R('#12040a', mx - 1, 0, 2, cyy - 80);
    cutChar(mx, cyy, t < 0.5 ? 'walk' : 'idle', 1);
    if (t > 0.9 && !CUT.clunk) { CUT.clunk = 1; sfx.play('thud'); sfx.play('rumble'); }
    if (Math.random() < 0.3) CUT.fx.push({ x: mx + (Math.random() < 0.5 ? -60 : 60), y: cyy - 80, vx: (Math.random() - 0.5) * 40, vy: 200, t: 0.6, c: '#ffb040', s: 2 });
  } else {
    var a2 = t - 3.4, open = ease(a2 / 0.9);
    // Spunk Brain: the lair's hall with the great brain in its jar, tubes glowing
    for (var bb = 0; bb < 6; bb++) R(['#030204', '#08060c', '#0e0a14', '#14101c', '#1a1424', '#20182c'][bb], 0, bb * H * 0.17, W, H * 0.17 + 1);
    var jx = mx, jy = H * 0.46, pulse = 1 + Math.sin(G.t * 4) * 0.04; R('#34303a', jx - 70, jy + 60, 140, 14); R('#5a5460', jx - 70, jy + 60, 140, 2);
    g.fillStyle = 'rgba(120,20,40,0.35)'; g.fillRect(jx - 60, jy - 70, 120, 130); R('#5a5460', jx - 62, jy - 72, 124, 3);
    g.fillStyle = '#d86a8a'; g.beginPath(); g.ellipse(jx, jy, 46 * pulse, 34 * pulse, 0, 0, 6.3); g.fill(); g.strokeStyle = '#8a2a4a'; g.lineWidth = 2;
    for (var f2 = -3; f2 <= 3; f2++) { g.beginPath(); g.moveTo(jx + f2 * 12, jy - 30); g.quadraticCurveTo(jx + f2 * 12 + 8, jy, jx + f2 * 10, jy + 28); g.stroke(); }
    for (var tb = 0; tb < 4; tb++) { var tx = jx - 160 + tb * 100 + (tb > 1 ? 20 : 0); R('#14121a', tx, H * 0.2, 10, H * 0.6); R(Math.floor(G.t * 6 + tb) % 3 ? '#ff2630' : '#8a0a10', tx + 3, H * 0.2 + ((G.t * 120 + tb * 40) % (H * 0.6)), 4, 10); }
    R('#14121a', 0, H * 0.82, W, H * 0.2); R('#ff2630', 0, H * 0.82, W, 2); for (var hz = 0; hz < W; hz += 20) R('#ffe36a', hz, H * 0.83, 10, 3);
    cutChar(mx - 30 + Math.min(1, a2) * 30, H * 0.82, a2 < 1 ? 'walk' : 'idle', 1);
    // the lift doors sliding apart
    R('#3a2420', 0, 0, mx - open * mx, H); R('#3a2420', mx + open * mx, 0, W, H); R('#6a4a40', mx - open * mx - 3, 0, 3, H); R('#6a4a40', mx + open * mx, 0, 3, H);
    if (!CUT.ding) { CUT.ding = 1; sfx.play('check'); }
  }
}
(function () { // between zones: the cutscene, then the next zone's title card
  var nA = nextAct; nextAct = function () {
    var a = ACTS[G.ai], b = ACTS[G.ai + 1]; if (b && a && b.z !== a.z && CUTLEN[ZONES[a.z].id]) { startCut(ZONES[a.z].id, function () { nA(); }); return; }
    nA(); };
})();
