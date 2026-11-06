/* =====================================================================================================
   GIMMICKS II: things you ride and use (5d-gim.js has the framework). Every one carries you somewhere, throws you,
   slows you or speeds you, and every one is dressed for the zone it is in.
   ===================================================================================================== */
function gimPlat(e, x, y, w, o) { var q = { x: x, y: y, w: w, x0: x, y0: y, k: 'gimp', t: 0, dx: 0, dy: 0, ph: 0, range: 0, e: e }; for (var k in o) q[k] = o[k]; PLATS.push(q); if (!x && !y && q.mv) { q.mv(q, 0); q.x0 = q.x; q.y0 = q.y; } return q; } /* placed where it really starts, so it never jumps there on the first frame */
function onPlat(q) { var p = PL; return !!p && p.state === 'normal' && !p.air && p.x >= q.x - 2 && p.x <= q.x + q.w + 2 && Math.abs(p.y - q.y) < 2; }
function relJ(p) { p.prevJ = KIT.held('a'); }
function dropOff(p, vx, vy) { p.gl = null; p.hide = 0; p.grot = 0; p.air = true; p.vx = vx; p.vy = vy; p.gsp = vx; p.jumps = 1; relJ(p); }
function plank(g, x, y, w, L, kind) { // a platform drawn in the zone's own way
  var k = kind || L.k; x = Math.round(x); y = Math.round(y);
  if (k === 'city') { bx(x, y, w, 7, L.wood, L.main); for (var i = 6; i < w; i += 10) R(OUT, x + i, y + 1, 1, 6); }
  else if (k === 'sewer') { bx(x, y, w, 6, L.metal, L.mlite); R(L.goo, x + 2, y + 6, w - 4, 2); for (var j = 4; j < w; j += 9) R(L.goo, x + j, y + 7, 2, 3 + (j % 3)); }
  else if (k === 'park') { bx(x, y, w, 7, L.main, L.hot); for (var s = 0; s < w; s += 8) R(L.lite, x + s, y + 2, 4, 3); }
  else if (k === 'bone') { bx(x, y, w, 6, L.main, L.lite); for (var b2 = 3; b2 < w; b2 += 12) R(L.mlite, x + b2, y + 2, 6, 2); }
  else if (k === 'factory') { bx(x, y, w, 7, L.metal, L.mlite); for (var r = 3; r < w; r += 8) R(L.dark, x + r, y + 3, 2, 2); R(L.hot, x, y + 6, w, 1); }
  else { bx(x, y, w, 7, L.goo, L.lite); R(L.main, x + 3, y + 3, w - 6, 1); for (var v = 5; v < w; v += 11) R(L.main, x + v, y + 1, 1, 5); } }

/* ---------- floors that change how you move ---------- */
gimDef('sticky', { h: 0, // the floor is glue: it drags at your feet and your jumps
  lay: function (b) { b.ground(28); GT(b, -27, 'sticky', { w: 26 }); b.drops(-25, 12, 3, 'arc', 2); },
  step: function (e, dt, p) { var inA = p.x > e.x - 8 && p.x < e.x + e.w * TS - 8 && Math.abs(p.y - e.y) < 4 && !p.air && p.state === 'normal';
    if (inA && Math.abs(p.gsp) > 130) p.gsp = Math.sign(p.gsp) * 130; if (p.air && e.was && p.vy < -250) p.vy *= 0.72; e.was = inA; e.inA = inA; },
  draw: function (g, e, x, y, L) { var w = e.w * TS; R(OUT, x - 8, y - 4, w, 4); R(L.goo, x - 8, y - 3, w, 3); for (var i = 4; i < w; i += 14) { R(L.goo, x - 8 + i, y - 5 - (i % 3), 6, 3); R(L.lite, x - 6 + i, y - 4 - (i % 3), 2, 1); }
    for (var s = 0; s < 3; s++) { var t = (G.t * 0.5 + s * 0.33) % 1, bx2 = x + 20 + s * 60; R(L.goo, bx2, y - 3 - t * 6, 3, 3); } },
  over: function (g, e, x, y, L, cx) { if (!e.inA) return; var p = PL, px = p.x - cx; for (var s = -1; s <= 1; s += 2) { R(L.goo, px + s * 4, y - 10, 2, 10); R(L.goo, px + s * 7, y - 5, 2, 5); } } });

var SLICK = { city: 'wet neon', sewer: 'cream slick', park: 'dance floor', bone: 'polished marble', factory: 'oil', brain: 'slime' };
gimDef('slick', { h: 0, // a slick stretch that throws you forward faster and faster
  lay: function (b) { b.ground(38); GT(b, -37, 'slick', { w: 36 }); b.drops(-35, 22, 2, null, 1.6); },
  step: function (e, dt, p) { var inA = p.x > e.x - 8 && p.x < e.x + e.w * TS - 8 && Math.abs(p.y - e.y) < 4 && !p.air && p.state === 'normal'; if (inA && p.gsp > 0) { p.gsp = Math.min(640, p.gsp + 420 * dt); if (Math.random() < 0.5) FX.push({ k: 'bit', x: p.x - 6, y: e.y - 2, vx: -80, vy: -30, t: 0.25, c: GL().lite, g: 200 }); } },
  draw: function (g, e, x, y, L) { var w = e.w * TS; R(OUT, x - 8, y - 2, w, 2); for (var i = 0; i < w; i += 16) { var on = L.k === 'park' ? (Math.floor(G.t * 3) + i / 16) % 2 : 0; R(on ? L.hot : L.mlite, x - 8 + i, y - 2, 15, 1); }
    var gl = (G.t * 260) % w; R('#ffffff', x - 8 + gl, y - 2, 10, 1); R(L.lite, x - 8 + (gl + w / 2) % w, y - 2, 6, 1); for (var c = 10; c < w - 10; c += 32) { R(L.hot, x + c, y - 9, 2, 2); R(L.hot, x + c + 2, y - 7, 2, 2); R(L.hot, x + c, y - 5, 2, 2); } } });

gimDef('gust', { h: 6, // a big fan blows you on: jump into the wind and it carries you over the ditch
  lay: function (b) { var e = GT(b, 0, 'gust', {}); b.ground(5); SEC.ditch(b, 7); b.ground(6); SEC.ditch(b, 9); b.ground(4); SEC.ditch(b, 11); b.ground(6); e.w = b.col - e.c; b.drops(-40, 24, 4, 'arc', 1.6); },
  step: function (e, dt, p) { if (p.x < e.x || p.x > e.x + e.w * TS || p.y < e.y - 150 || p.y > e.y + 60 || p.state !== 'normal') return; if (p.air) p.vx = Math.min(560, p.vx + 640 * dt); else if (p.gsp < 480) p.gsp += 320 * dt;
    if (Math.random() < 0.6) FX.push({ k: 'bit', x: e.x + 10, y: e.y - 10 - Math.random() * 100, vx: 320 + Math.random() * 120, vy: (Math.random() - 0.5) * 40, t: 0.6, c: [GL().lite, GL().main, GL().mlite][Math.floor(Math.random() * 3)], g: 0 }); },
  draw: function (g, e, x, y, L) { bx(x - 16, y - 70, 16, 70, L.metal, L.mlite); g.fillStyle = OUT; g.beginPath(); g.arc(x - 6, y - 40, 26, 0, 6.3); g.fill(); g.fillStyle = L.dark; g.beginPath(); g.arc(x - 6, y - 40, 24, 0, 6.3); g.fill();
    for (var i = 0; i < 4; i++) { var a = G.t * 14 + i * 1.571; g.save(); g.translate(x - 6, y - 40); g.rotate(a); R(OUT, -3, -22, 7, 20); R(L.mlite, -2, -21, 5, 18); g.restore(); } motif(g, x - 6, y - 40, L);
    for (var s = 0; s < 6; s++) { var sx = x + ((G.t * 300 + s * 47) % (e.w * TS)), sy = y - 14 - (s * 19) % 90; R(L.lite, sx, sy, 8, 1); } } });

/* ---------- things that carry you ---------- */
gimDef('magnet', { h: 7, // a magnet rail: jump up to it and it pulls you along over the spikes (A lets go)
  lay: function (b) { var c0 = b.col; b.ground(4); SEC.ditch(b, 26); b.ground(4); GT(b, c0 + 2 - b.col, 'magnet', { c1: b.col - 3 }, 6, 'gimh'); },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; var x1 = e.c1 * TS + 8; if (!p.gl && e.cd <= 0 && p.state === 'normal' && p.air && p.x > e.x && p.x < x1 - 12 && Math.abs((p.y - PH) - (e.y + 6)) < 16) { p.gl = { e: e }; sfx.play('clink'); } },
  ride: function (p, s, dt) { var e = s.e, x1 = e.c1 * TS + 8; p.y = e.y + 6 + PH; p.x += 300 * dt; p.vx = 300; p.vy = 0; p.air = true; p.face = 1; if (Math.random() < 0.5) FX.push({ k: 'bit', x: p.x, y: e.y + 4, vx: -60, vy: 40, t: 0.3, c: GL().hot, g: 300 });
    if (KIT.pressed('a') || p.x >= x1 - 6) { var j = KIT.pressed('a'); dropOff(p, 300, j ? -280 : -60); e.cd = 0.5; } relJ(p); },
  draw: function (g, e, x, y, L, cx, cy) { var x1 = e.c1 * TS + 8 - cx; postD(x - 6, y + 96, 100, L, 6); postD(x1 + 6, y + 96, 100, L, 6); bx(x - 8, y - 4, x1 - x + 16, 8, L.metal, L.mlite);
    for (var m = x; m < x1; m += 32) { R(L.main, m, y + 4, 10, 3); R(L.hot, m, y + 4, 3, 3); R(L.mlite, m + 7, y + 4, 3, 3); } motif(g, x - 6, y - 8, L); motif(g, x1 + 6, y - 8, L);
    if (PL && PL.gl && PL.gl.e === e) { var px = PL.x - cx; R(OUT, px - 8, y + 4, 16, 8); R(L.main, px - 7, y + 5, 14, 3); R(L.mlite, px - 7, y + 8, 3, 3); R(L.mlite, px + 4, y + 8, 3, 3); } } });

gimDef('sinkers', { h: 2, // rafts that sink while you stand on them: keep moving
  lay: function (b) { GT(b, 0, 'sinkers', { w: 22 }, 0, 'gimh'); safePit(b, 22); },
  init: function (e) { for (var i = 0; i < 5; i++) gimPlat(e, e.x - 8 + 16 + i * 64, e.y, 48, { sink: 0, mv: function (q, dt) { q.sink = onPlat(q) ? Math.min(56, q.sink + 34 * dt) : Math.max(0, q.sink - 46 * dt); q.y = q.y0 + q.sink; if (q.sink > 4 && Math.random() < 0.2) bits(q.x + Math.random() * q.w, q.y + 6, 1, [GL().goo], 30, 100); },
      draw: function (g, x, y, q) { var L = GL(); plank(g, x, y, q.w, L); if (q.sink > 30 && Math.floor(G.t * 10) % 2) R(L.hot, x + q.w / 2 - 1, y - 6, 2, 3); } }); },
  draw: function (g, e, x, y, L) { R(OUT, x - 8, y + 72, e.w * TS, 2); } });

gimDef('catapult', { h: 13, big: 1.4, // step on the end of the plank and the weight drops on the other: up you go to the ledge
  lay: function (b) { GT(b, 0, 'catapult', {}); b.ground(6); b.ledge(6, 9, 12, '='); b.drops(7, 8, 11, null, 1.3); b.thing(13, 'box', 9, { item: 'drops' }); b.ground(20); },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (e.flip > 0) e.flip -= dt;
    if (e.cd <= 0 && !p.air && p.state === 'normal' && p.x > e.x - 12 && p.x < e.x + 8 && Math.abs(p.y - e.y) < 6) { p.air = true; p.vy = -660; p.vx = 200; p.gsp = 200; p.jumps = 1; p.spring = 0.7; e.flip = 0.6; e.cd = 1.2; sfx.play('spring'); sfx.play('thud', 0.5); G.shake = Math.max(G.shake, 2); } },
  draw: function (g, e, x, y, L) { var px = x + 16; g.fillStyle = OUT; g.beginPath(); g.moveTo(px - 9, y); g.lineTo(px, y - 12); g.lineTo(px + 9, y); g.fill(); g.fillStyle = L.stone; g.beginPath(); g.moveTo(px - 7, y - 1); g.lineTo(px, y - 10); g.lineTo(px + 7, y - 1); g.fill();
    var a = e.flip > 0 ? -0.36 : 0.36; g.save(); g.translate(px, y - 12); g.rotate(a); bx(-28, -3, 56, 5, L.wood, L.mlite); R(L.hot, -28, -3, 6, 1); g.restore();
    var wy = e.flip > 0 ? y - 12 - Math.sin(-a) * 28 - 14 : y - 12 - Math.sin(-a) * 28 - 14 - 40; bx(px + 18, wy, 16, 14, L.metal, L.mlite); motif(g, px + 26, wy + 7, L); if (e.flip <= 0) R(OUT, px + 25, wy - 40, 2, 40); } });

gimDef('barrel', { h: 7, big: 1.6, // a barrel cannon: climb in, it aims, and fires you over the ditch
  lay: function (b) { GT(b, 0, 'barrel', {}); b.ground(3); SEC.ditch(b, 16); b.ground(6); b.drops(-24, 10, 7, 'arc', 2); },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (e.kick > 0) e.kick -= dt; if (!p.gl && e.cd <= 0 && p.state === 'normal' && Math.abs(p.x - e.x) < 12 && Math.abs(p.y - e.y) < 20) { p.gl = { e: e, t: 0 }; p.hide = 1; sfx.play('clink'); } },
  ride: function (p, s, dt) { var e = s.e; s.t += dt; p.x = e.x; p.y = e.y - 6; p.vx = 0; p.vy = 0; p.air = true; relJ(p);
    if (s.t > 0.75) { dropOff(p, 430, -470); p.spring = 0.7; e.cd = 1.2; e.kick = 0.3; sfx.play('dash'); sfx.play('thud'); G.shake = Math.max(G.shake, 3); bits(e.x + 16, e.y - 30, 12, ['#5a4a4a', '#8a7a7a', GL().fire[1]], 140, -20); } },
  draw: function (g, e, x, y, L) { bx(x - 12, y - 8, 24, 8, L.stone, L.slite); var held = PL && PL.gl && PL.gl.e === e, a = -0.8 + (held ? Math.sin(G.t * 8) * 0.12 : 0) - (e.kick > 0 ? 0.1 : 0);
    g.save(); g.translate(x, y - 14); g.rotate(a); bx(-12, -10, 30, 20, L.wood, L.mlite); R(L.metal, -6, -10, 3, 20); R(L.metal, 8, -10, 3, 20); R(OUT, 17, -8, 3, 16); g.restore(); motif(g, x - 8, y - 16, L);
    if (held && Math.random() < 0.5) FX.push({ k: 'bit', x: e.x - 10, y: e.y - 22, vx: -20, vy: -60, t: 0.3, c: GL().fire[1], g: 0 }); } });

function tubeP(e, u) { var x0 = e.x, y0 = e.y - 12, x3 = e.c1 * TS + 8, y3 = y0, x1 = x0 + 30, y1 = y0 - 120, x2 = x3 - 30, y2 = y1, v = 1 - u;
  return { x: v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3, y: v * v * v * y0 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3 }; }
gimDef('tube', { h: 6, // a pipe: run into its mouth and it shoots you over the hazard and out the far end
  lay: function (b) { var e = GT(b, 0, 'tube', {}); b.ground(3); SEC.ditch(b, 22); b.ground(2); e.c1 = b.col; b.ground(5); b.drops(-4, 3, 2); },
  init: function (e) { var l = 0, a = tubeP(e, 0); for (var i = 1; i <= 20; i++) { var b2 = tubeP(e, i / 20); l += Math.hypot(b2.x - a.x, b2.y - a.y); a = b2; } e.len = l; },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (!p.gl && e.cd <= 0 && p.state === 'normal' && Math.abs(p.x - e.x) < 10 && Math.abs(p.y - e.y) < 10 && (p.air ? p.vx : p.gsp) >= 0) { p.gl = { e: e, u: 0 }; p.hide = 1; sfx.play('dash'); } },
  ride: function (p, s, dt) { var e = s.e; s.u += dt * 560 / e.len; relJ(p); if (s.u >= 1) { p.gl = null; p.hide = 0; p.x = e.c1 * TS + 18; p.y = e.y; p.air = false; p.gsp = 520; p.vx = 520; p.vy = 0; e.cd = 1; sfx.play('spring'); return; }
    var q = tubeP(e, s.u); p.x = q.x; p.y = q.y + 18; p.vx = 0; p.vy = 0; p.air = true; },
  draw: function (g, e, x, y, L, cx, cy) { var pts = []; for (var i = 0; i <= 24; i++) { var q = tubeP(e, i / 24); pts.push([q.x - cx, q.y - cy]); }
    [[22, OUT], [18, L.metal], [6, L.mlite]].forEach(function (s, k) { g.strokeStyle = s[1]; g.lineWidth = s[0]; g.beginPath(); pts.forEach(function (q, i) { if (i) g.lineTo(q[0], q[1] - (k === 2 ? 5 : 0)); else g.moveTo(q[0], q[1] - (k === 2 ? 5 : 0)); }); g.stroke(); });
    for (var j = 2; j < 24; j += 4) R(L.dark, pts[j][0] - 1, pts[j][1] - 9, 2, 18);
    [pts[0], pts[24]].forEach(function (q) { R(OUT, q[0] - 4, q[1] - 14, 8, 28); R(L.mlite, q[0] - 3, q[1] - 13, 6, 26); R(OUT, q[0] - 1, q[1] - 10, 2, 20); });
    if (PL && PL.gl && PL.gl.e === e) { var q2 = tubeP(e, PL.gl.u); g.fillStyle = OUT; g.beginPath(); g.arc(q2.x - cx, q2.y - cy, 12, 0, 6.3); g.fill(); g.fillStyle = L.lite; g.beginPath(); g.arc(q2.x - cx, q2.y - cy, 10, 0, 6.3); g.fill(); motif(g, q2.x - cx, q2.y - cy, L); } } });

gimDef('grind', { h: 3, // a rail: land on it and you grind along it in sparks (A jumps off)
  lay: function (b) { var e = GT(b, 0, 'grind', {}); b.ground(2); SEC.ditch(b, 28); b.ground(2); e.c1 = b.col; b.ground(3); b.drops(-34, 18, 4, null, 1.7); },
  step: function (e, dt, p) { var x1 = e.c1 * TS + 8, ry = e.y - 30; if (!p.gl && p.state === 'normal' && p.air && p.vy >= 0 && p.x > e.x && p.x < x1 - 8 && p.y >= ry - 3 && p.y - p.vy * dt <= ry + 6) { p.gl = { e: e, v: Math.max(380, Math.abs(p.vx)) }; sfx.play('clink'); } },
  ride: function (p, s, dt) { var e = s.e, x1 = e.c1 * TS + 8, ry = e.y - 30; p.y = ry; p.x += s.v * dt; p.vx = s.v; p.vy = 0; p.air = true; p.face = 1; p.grot = 0.12; p.dist = (p.dist || 0) + s.v * dt;
    if (Math.random() < 0.8) FX.push({ k: 'bit', x: p.x - 4, y: ry, vx: -100 - Math.random() * 80, vy: -40 - Math.random() * 60, t: 0.3, c: Math.random() < 0.5 ? '#ffe36a' : GL().hot, g: 400 });
    if (KIT.pressed('a')) { dropOff(p, s.v, -PHYS.jumpv * 1.15); sfx.play('jump'); return; } if (p.x >= x1) { dropOff(p, s.v + 60, -200); return; } relJ(p); },
  draw: function (g, e, x, y, L, cx) { var x1 = e.c1 * TS + 8 - cx; for (var px = x; px <= x1; px += 64) postD(px, y + 34, 64, L, 4); postD(x1, y + 34, 64, L, 4); bx(x - 2, y - 32, x1 - x + 4, 3, L.mlite, '#ffffff'); R(L.metal, x - 2, y - 29, x1 - x + 4, 1); motif(g, x, y - 36, L); } });

gimDef('swingbar', { h: 5, // bars over the ditch: catch one, swing round it and be thrown high
  lay: function (b) { GT(b, 0, 'swingbar', {}); b.ground(2); SEC.ditch(b, 26); b.ground(3); b.drops(-26, 14, 7, 'arc', 1.8); },
  init: function (e) { e.bars = [5, 11, 17, 23, 29].map(function (c, i) { return [e.x + c * TS, e.y - 58 - (i % 2) * 16]; }); },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (p.gl || e.cd > 0 || !p.air || p.state !== 'normal') return; e.bars.forEach(function (bb) { if (!p.gl && Math.hypot(p.x - bb[0], p.y - 20 - bb[1]) < 18) { var a = Math.atan2(p.y - 20 - bb[1], p.x - bb[0]); p.gl = { e: e, b: bb, a: a, a0: a }; sfx.play('clink'); } }); },
  ride: function (p, s, dt) { s.a += 12 * dt; p.x = s.b[0] + Math.cos(s.a) * 20; p.y = s.b[1] + Math.sin(s.a) * 20 + 20; p.grot = s.a - Math.PI / 2; p.vx = 0; p.vy = 0; p.air = true; relJ(p);
    if (s.a - s.a0 > 6.283 * 0.92) { dropOff(p, 380, -560); p.spring = 0.5; s.e.cd = 0.6; sfx.play('spring'); } },
  draw: function (g, e, x, y, L, cx, cy) { (e.bars || []).forEach(function (bb) { var bx2 = Math.round(bb[0] - cx), by = Math.round(bb[1] - cy); postD(bx2 - 10, y + 32, y + 32 - by, L, 3); postD(bx2 + 10, y + 32, y + 32 - by, L, 3); bx(bx2 - 11, by - 2, 22, 4, L.mlite, '#ffffff'); motif(g, bx2 - 10, by - 6, L); motif(g, bx2 + 10, by - 6, L); }); } });

gimDef('trampoline', { h: 12, // trampolines: each bounce in a row goes higher
  lay: function (b) { for (var i = 0; i < 6; i++) { b.ground(3); GT(b, 0, 'trampoline', { n: i }); b.ground(4); b.drops(-4, 3, 7 + Math.min(i, 2) * 3, 'arc', 1); } b.ground(3); },
  step: function (e, dt, p) { if (e.sq > 0) e.sq -= dt; var nc = e.x + 16, ny = e.y - 10; if (p.state !== 'normal' || Math.abs(p.x - nc) > 22) return;
    var hit = (p.air && p.vy > 0 && p.y >= ny - 3 && p.y - p.vy * dt <= ny + 4) || (!p.air && Math.abs(p.y - e.y) < 3);
    if (hit) { G.tch = G.t - (G.tram || -9) < 1.6 ? Math.min(2, (G.tch || 0) + 1) : 0; G.tram = G.t; p.vy = -[520, 640, 760][G.tch]; p.y = ny; p.air = true; p.jumps = 1; p.spring = 0.5; p.vx = Math.max(p.vx, p.gsp, 140); e.sq = 0.25; sfx.play('spring'); } },
  draw: function (g, e, x, y, L) { var nx = x - 6, sq = e.sq > 0 ? 5 : 0; bx(nx - 2, y - 12, 4, 12, L.metal, L.mlite); bx(nx + 42, y - 12, 4, 12, L.metal, L.mlite);
    R(OUT, nx, y - 12 + sq, 44, 4); for (var s = 0; s < 44; s += 6) R(s % 12 ? L.main : L.hot, nx + s, y - 11 + sq, 5, 2); for (var z = 0; z < 3; z++) { R(L.mlite, nx + 2 + z * 2, y - 8 + sq, 1, 2); R(L.mlite, nx + 38 + z * 2, y - 8 + sq, 1, 2); } motif(g, nx + 22, y - 4, L); } });

var BALLOON = { city: 'heart', sewer: 'bubble', park: 'steve', bone: 'ghost', factory: 'patch', brain: 'brain' };
function balloonD(g, x, y, L) { var k = BALLOON[L.k]; x = Math.round(x); y = Math.round(y);
  g.fillStyle = OUT; g.beginPath(); g.ellipse(x, y, 15, 18, 0, 0, 6.3); g.fill();
  g.fillStyle = k === 'steve' ? '#12040a' : k === 'bubble' ? '#e8d4a0' : k === 'ghost' ? '#f4ecdc' : k === 'patch' ? L.main : k === 'brain' ? L.goo : L.main; g.beginPath(); g.ellipse(x, y, 13, 16, 0, 0, 6.3); g.fill();
  if (k === 'steve') { R(L.main, x - 13, y - 1, 1, 2); R('#ff2630', x - 6, y - 5, 4, 4); R('#ff2630', x + 2, y - 5, 4, 4); R('#ffffff', x - 7, y + 3, 14, 3); R(OUT, x - 5, y + 4, 10, 1); }
  else if (k === 'heart') { R(L.hot, x - 8, y - 8, 6, 6); R(L.hot, x + 2, y - 8, 6, 6); R(L.lite, x - 6, y - 7, 2, 2); }
  else if (k === 'ghost') { R(OUT, x - 6, y - 4, 4, 5); R(OUT, x + 2, y - 4, 4, 5); R(OUT, x - 3, y + 4, 6, 3); }
  else if (k === 'patch') { R(L.lite, x - 7, y - 6, 6, 6); R(L.dark, x + 3, y + 2, 5, 5); R(L.hot, x - 13, y + 6, 26, 2); }
  else if (k === 'brain') { R(L.main, x - 1, y - 14, 2, 28); R(L.main, x - 10, y - 4, 7, 1); R(L.main, x + 3, y + 4, 7, 1); }
  else R('#fffbe8', x - 7, y - 9, 4, 4);
  R(OUT, x - 2, y + 17, 4, 3); }
gimDef('balloon', { h: 9, // grab the balloon and it floats you over the ditch until it pops
  lay: function (b) { GT(b, 0, 'balloon', {}); b.ground(3); SEC.ditch(b, 32); b.ground(6); b.drops(-36, 16, 7, null, 2.2); },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (!p.gl && e.cd <= 0 && pCirc(e.x + 10, e.y - 34, 14)) { p.gl = { e: e, t: 0 }; sfx.play('clink'); } },
  ride: function (p, s, dt) { s.t += dt; p.x += 140 * dt; p.y = Math.max(s.e.y - 120, p.y - 52 * dt); p.vx = 140; p.vy = 0; p.air = true; p.face = 1;
    if (s.t > 4.6 || KIT.pressed('a')) { var j = KIT.pressed('a'); dropOff(p, 140, j ? -200 : 0); s.e.cd = 4; sfx.play('pop'); bits(p.x, p.y - PH - 20, 12, [GL().main, GL().lite, GL().hot], 160); return; } relJ(p); },
  draw: function (g, e, x, y, L, cx, cy) { var held = PL && PL.gl && PL.gl.e === e; if (held) { var hx = PL.x - cx, hy = PL.y - PH - cy; R(L.lite, hx, hy - 22, 1, 22); balloonD(g, hx, hy - 40 + Math.sin(G.t * 3) * 2, L); return; }
    if (e.cd > 0) { R(OUT, x + 8, y - 4, 4, 4); return; } var by = y - 62 + Math.sin(G.t * 2 + e.x) * 3; R(OUT, x + 8, y - 4, 4, 4); R(L.lite, x + 10, by + 18, 1, y - 4 - by - 18); balloonD(g, x + 10, by, L); } });

gimDef('flippers', { h: 7, // pinball flippers bat you forward
  lay: function (b) { b.ground(2); GT(b, 0, 'flippers', {}); b.ground(34); b.drops(-32, 20, 6, 'arc', 1.4); },
  step: function (e, dt, p) { [0, 1, 2, 3].forEach(function (i) { var fx = e.x + i * 88, k = 'f' + i; e[k] = (e[k] || 0) - dt; if (e[k] > 0 || p.state !== 'normal' || Math.abs(p.x - fx) > 12) return;
      if ((!p.air && Math.abs(p.y - e.y) < 4) || (p.air && p.vy > 0 && p.y >= e.y - 8 && p.y < e.y + 2)) { p.air = true; p.vy = -600; p.vx = Math.max(p.vx, p.gsp, 360); p.gsp = p.vx; p.jumps = 1; p.spring = 0.4; e[k] = 0.5; sfx.play('bump'); } }); },
  draw: function (g, e, x, y, L) { [0, 1, 2, 3].forEach(function (i) { var fx = x + i * 88, up = (e['f' + i] || 0) > 0.2; g.fillStyle = OUT; g.beginPath(); g.arc(fx - 8, y - 6, 6, 0, 6.3); g.fill(); g.fillStyle = L.metal; g.beginPath(); g.arc(fx - 8, y - 6, 5, 0, 6.3); g.fill();
      g.save(); g.translate(fx - 8, y - 6); g.rotate(up ? -0.55 : 0.3); bx(-2, -4, 28, 7, L.main, L.hot); R(L.lite, 0, -3, 22, 1); g.restore(); R(Math.floor(G.t * 6 + i) % 2 ? L.hot : L.dark, fx - 10, y - 8, 4, 4); }); } });

gimDef('corkscrew', { h: 4, // a corkscrew: hit it fast and you roll right round it, faster still
  lay: function (b) { b.ground(38); GT(b, -37, 'corkscrew', { w: 36 }); b.drops(-35, 20, 2, null, 1.7); },
  step: function (e, dt, p) { var x0 = e.x - 8, w = e.w * TS, inA = !p.air && p.state === 'normal' && p.x > x0 && p.x < x0 + w && Math.abs(p.y - e.y) < 4;
    if (inA && p.gsp > 300) { p.grot = (p.x - x0) / 144 * 6.283; p.gsp = Math.min(700, p.gsp + 140 * dt); e.on = 1; } else if (e.on) { p.grot = 0; e.on = 0; } },
  draw: function (g, e, x, y, L) { cork(g, e, x, y, L, false); }, over: function (g, e, x, y, L) { cork(g, e, x, y, L, true); } });
function cork(g, e, x, y, L, front) { var w = e.w * TS, x0 = x - 8; if (!front) { postD(x0, y, 60, L, 6); postD(x0 + w, y, 60, L, 6); motif(g, x0, y - 62, L); motif(g, x0 + w, y - 62, L); }
  for (var s = 0; s < w; s += 3) { var ph = s / 144 * 6.283, c = Math.cos(ph); if ((c >= 0) !== front) continue; var yy = y - 30 + Math.sin(ph) * 26; R(OUT, x0 + s, yy - 5, 4, 10); R(front ? L.main : L.metal, x0 + s, yy - 4, 3, 8); R(front ? L.hot : L.mlite, x0 + s, yy - 4, 3, 2); if (Math.floor(s / 12) % 2) R(L.dark, x0 + s, yy, 3, 2); } }

var HOOP = { city: 'neon', sewer: 'cream', park: 'fire', bone: 'bone', factory: 'fire', brain: 'pulse' };
gimDef('hoops', { h: 5, // big hoops: go through one and it throws you on faster
  lay: function (b) { b.ground(40); for (var i = 0; i < 6; i++) GT(b, -37 + i * 6, 'hoops', { up: i % 2 ? 4 : 2 }, i % 2 ? 4 : 2, 'gimh'); b.drops(-38, 4, 2, null, 1); },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (e.fl > 0) e.fl -= dt; if (e.cd <= 0 && p.state === 'normal' && Math.hypot(p.x - e.x, p.y - 20 - e.y) < 15) { e.cd = 1; e.fl = 0.3; if (p.air) p.vx = Math.max(p.vx, 460); else p.gsp = Math.max(p.gsp, 520); G.score += 50; gotDrop(); sfx.play('dash'); } },
  draw: function (g, e, x, y, L) { var k = HOOP[L.k], fy = y + e.up * TS; postD(x, fy, fy - y - 18, L, 4); var r = 18 + (e.fl > 0 ? 2 : 0);
    g.lineWidth = 6; g.strokeStyle = OUT; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.stroke(); g.lineWidth = 4; g.strokeStyle = k === 'cream' ? '#e8d4a0' : k === 'bone' ? L.main : k === 'pulse' && Math.floor(G.t * 4) % 2 ? L.hot : L.main; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.stroke();
    if (k === 'fire') for (var f = 0; f < 10; f++) { var a = f / 10 * 6.283 + G.t * 2; flame(x + Math.cos(a) * r, y + Math.sin(a) * r, 2, L, f); }
    else if (k === 'neon') { g.lineWidth = 1; g.strokeStyle = '#ffd0d0'; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.stroke(); } else if (k === 'bone') for (var b2 = 0; b2 < 6; b2++) { var a2 = b2 / 6 * 6.283; R(L.lite, x + Math.cos(a2) * r - 2, y + Math.sin(a2) * r - 2, 4, 4); } } });

/* ---------- places to reach ---------- */
gimDef('timedgate', { h: 6, // step on the plate: the vault's gate lifts for seven seconds. Get in before it drops
  lay: function (b) { GT(b, 0, 'timedgate', {}); b.ground(14); var v0 = b.col; b.ground(10);
    for (var c = v0; c < v0 + 8; c++) for (var r = 1; r <= 2; r++) b.set(c, b.h - r, '#');
    for (var r2 = 3; r2 <= 5; r2++) { b.set(v0 + 2, b.h - r2, 'Z'); b.set(v0 + 7, b.h - r2, 'X'); } /* a cracked back wall: you can always smash your way out */ for (var c2 = v0 + 2; c2 < v0 + 8; c2++) b.set(c2, b.h - 6, '#');
    b.ent('box', v0 + 5, b.h - 2, { item: 'life' }); for (var d = 3; d < 7; d++) b.ent('drop', v0 + d, b.h - 4); b.ground(6); },
  init: function (e) { e.zs = []; var c0 = Math.floor(e.x / TS); for (var c = c0; c < c0 + 30; c++) for (var r = 0; r < LV.h; r++) if (T(c, r) === 'Z') e.zs.push([c, r]); e.open = 0; e.vx = e.zs.length ? e.zs[0][0] * TS + 40 : e.x + 300; },
  step: function (e, dt, p) { var was = e.open > 0; if (!p.air && p.state === 'normal' && Math.abs(p.x - e.x) < 10 && Math.abs(p.y - e.y) < 5 && e.open < 6.5) { e.open = 7; if (!was) { sfx.play('check'); G.banner = 1; G.bannerTxt = 'THE VAULT IS OPEN'; } }
    if (e.open > 0) { var s0 = Math.ceil(e.open); e.open -= dt; if (Math.ceil(e.open) !== s0) sfx.play('clink'); }
    var open = e.open > 0; e.zs.forEach(function (z) { var i = z[1] * LV.w + z[0]; if (open) LV.t[i] = '.'; else if (LV.t[i] !== 'Z') { var px = z[0] * TS + 8, py = z[1] * TS + 8; if (!(Math.abs(p.x - px) < 14 && py > p.y - PH && py < p.y + 4)) LV.t[i] = 'Z'; } }); },
  draw: function (g, e, x, y, L, cx) { R(OUT, x - 9, y - 3, 18, 3); R(e.open > 0 ? L.hot : L.mlite, x - 8, y - (e.open > 0 ? 1 : 2), 16, 1); motif(g, x, y - 8, L);
    if (e.open > 0) { var vx = Math.round(e.vx - cx); bx(vx - 12, y - 128, 24, 16, L.dark, L.mlite); text(String(Math.ceil(e.open)), vx, y - 124, { size: 8, align: 'center', col: e.open < 3 ? L.hot : L.lite }); } } });

gimDef('lift', { h: 10, // a lift: stand on it and it takes you up to the ledge
  lay: function (b) { GT(b, 0, 'lift', {}); b.ground(4); b.ledge(0, 9, 9, '#'); b.drops(1, 6, 11, null, 1.3); b.thing(6, 'box', 9, { item: 'shield' }); b.ground(12); },
  init: function (e) { e.q = gimPlat(e, e.x - 8, e.y, 48, { st: 'rest', tt: 0, mv: function (q, dt) { var top = q.y0 - 144;
      if (q.st === 'rest') { if (onPlat(q)) { q.tt += dt; if (q.tt > 0.25) { q.st = 'up'; sfx.play('rumble', 0.4); } } else q.tt = 0; }
      else if (q.st === 'up') { q.y = Math.max(top, q.y - 90 * dt); if (q.y <= top) { q.st = 'top'; q.tt = 1.6; sfx.play('thud', 0.4); } }
      else if (q.st === 'top') { q.tt -= dt; if (q.tt <= 0) q.st = 'down'; }
      else { q.y = Math.min(q.y0, q.y + 90 * dt); if (q.y >= q.y0) { q.st = 'rest'; q.tt = 0; } } },
    draw: function (g, x, y, q) { var L = GL(); bx(x, y, q.w, 6, L.metal, L.mlite); R(L.hot, x, y + 5, q.w, 1); for (var b2 = 4; b2 < q.w; b2 += 10) R(L.dark, x + b2, y + 2, 4, 2); } }); },
  draw: function (g, e, x, y, L, cx, cy) { postD(x - 12, y, 170, L, 6); postD(x + 44, y, 170, L, 6); bx(x - 14, y - 172, 60, 6, L.metal, L.mlite); var py = e.q ? Math.round(e.q.y - cy) : y;
    g.fillStyle = OUT; g.beginPath(); g.arc(x + 16, y - 176, 9, 0, 6.3); g.fill(); g.fillStyle = L.mlite; g.beginPath(); g.arc(x + 16, y - 176, 7, 0, 6.3); g.fill(); motif(g, x + 16, y - 176, L);
    R(OUT, x - 1, y - 172, 2, py - (y - 172)); R(OUT, x + 33, y - 172, 2, py - (y - 172)); var cw = y - 172 + (y - py) * 0.6 + 20; bx(x + 50, Math.round(cw), 10, 16, L.stone, L.slite); } });

gimDef('escalator', { h: 7, // moving stairs carry you up the bank and down the other side
  lay: function (b) { GT(b, 0, 'escalator', {}); b.up(5, true); b.ground(6); b.down(5, true); b.ground(2); },
  step: function (e, dt, p) { if (p.air || p.state !== 'normal') return; var a0 = e.x - 8, a1 = a0 + 5 * TS, d0 = a0 + 11 * TS, d1 = d0 + 5 * TS;
    if ((p.x > a0 && p.x < a1 && Math.abs(p.y - (e.y - (p.x - a0))) < 20) || (p.x > d0 && p.x < d1)) p.gsp = Math.min(460, p.gsp + 600 * dt); },
  draw: function (g, e, x, y, L) { var a0 = x - 8; [[a0, -1], [a0 + 11 * TS, 1]].forEach(function (s) { for (var i = 0; i < 6; i++) { var u = ((G.t * 0.8 + i / 6) % 1) * 5 * TS, sx = s[0] + u, sy = s[1] < 0 ? y - u - 2 : y - 5 * TS + u - 2; R(OUT, sx - 4, sy - 2, 8, 3); R(L.mlite, sx - 3, sy - 1, 6, 1); }
      var hy0 = s[1] < 0 ? y - 30 : y - 5 * TS - 30, hy1 = s[1] < 0 ? y - 5 * TS - 30 : y - 30; g.strokeStyle = OUT; g.lineWidth = 4; g.beginPath(); g.moveTo(s[0], hy0); g.lineTo(s[0] + 5 * TS, hy1); g.stroke(); g.strokeStyle = L.main; g.lineWidth = 2; g.stroke(); postD(s[0], hy0 + 30, 30, L, 3); postD(s[0] + 5 * TS, hy1 + 30, 30, L, 3); }); } });

var RAPID = { city: ['#8a0a14', '#c4121c'], sewer: ['#d8c490', '#f1e0b0'], park: ['#c43a8a', '#ff6ad0'], bone: ['#4a3a5a', '#6a5a8a'], factory: ['#c42a08', '#ff6a10'], brain: ['#8a0a10', '#ff2630'] };
gimDef('rapids', { h: 2, // a fast stream runs along the floor: it carries you, and what floats in it gets in the way
  lay: function (b) { b.ground(40); GT(b, -39, 'rapids', { w: 38 }); b.drops(-37, 16, 4, 'arc', 2.2); },
  init: function (e) { e.fl = [70, 150, 230, 310, 390, 470, 550].map(function (o, i) { return { x: e.x + o, ph: i * 1.7 }; }); },
  step: function (e, dt, p) { var inA = !p.air && p.state === 'normal' && p.x > e.x - 8 && p.x < e.x + e.w * TS - 8 && Math.abs(p.y - e.y) < 4; if (inA) { if (p.gsp >= 0) p.gsp = Math.min(560, p.gsp + 380 * dt); }
    e.fl.forEach(function (q) { q.by = Math.sin(G.t * 3 + q.ph) * 2; if (pCirc(q.x, e.y - 8 + q.by, 9)) hurt(q.x); }); },
  draw: function (g, e, x, y, L, cx) { var w = e.w * TS, c = RAPID[L.k]; R(OUT, x - 8, y - 7, w, 7); R(c[0], x - 8, y - 6, w, 6); for (var s = 0; s < w; s += 12) { var o = (s + G.t * 220) % w; R(c[1], x - 8 + o, y - 6 + (s / 12) % 3 * 2, 8, 1); }
    (e.fl || []).forEach(function (q) { var qx = Math.round(q.x - cx), qy = Math.round(y - 8 + (q.by || 0)); if (L.k === 'bone') { bx(qx - 7, qy - 7, 14, 12, L.main, L.lite); R(OUT, qx - 4, qy - 4, 3, 3); R(OUT, qx + 1, qy - 4, 3, 3); }
      else if (L.k === 'brain') { g.fillStyle = OUT; g.beginPath(); g.arc(qx, qy, 8, 0, 6.3); g.fill(); g.fillStyle = '#f0e0e0'; g.beginPath(); g.arc(qx, qy, 7, 0, 6.3); g.fill(); R(L.hot, qx - 2, qy - 2, 4, 4); }
      else { bx(qx - 8, qy - 8, 16, 14, L.k === 'park' ? L.wood : L.metal, L.mlite); R(OUT, qx - 8, qy - 3, 16, 1); R(OUT, qx - 8, qy + 2, 16, 1); } R(c[1], qx - 10, y - 7, 20, 1); }); } });

gimDef('bubbles', { h: 9, // bubbles rise out of the pit: ride them across before they pop
  lay: function (b) { GT(b, 0, 'bubbles', { w: 26 }, 0, 'gimh'); safePit(b, 26); },
  init: function (e) { for (var i = 0; i < 7; i++) gimPlat(e, e.x - 8 + 12 + i * 56, e.y + 70 - (i * 37) % 150, 32, { mv: function (q, dt) { q.y -= 46 * dt; if (q.y < q.e.y - 84) { bits(q.x + 16, q.y + 12, 10, [GL().goo, GL().lite], 120); sfx.play('pop', 0.3); q.y = q.e.y + 76; } },
      draw: function (g, x, y, q) { var L = GL(), c = L.k === 'sewer' ? '#e8d4a0' : L.goo; g.fillStyle = OUT; g.beginPath(); g.arc(x + 16, y + 13, 17, 0, 6.3); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x + 16, y + 13, 15, 0, 6.3); g.fill(); R('#ffffff', x + 8, y + 5, 4, 4); R(L.lite, x + 22, y + 18, 3, 3); } }); },
  draw: function (g, e, x, y, L) { } });

gimDef('vine', { h: 8, // ropes over a long ditch: catch one, swing, and let it throw you to the next
  lay: function (b) { GT(b, 0, 'vine', {}); b.ground(3); SEC.ditch(b, 30); b.ground(3); b.drops(-30, 12, 4, 'arc', 2.2); },
  init: function (e) { e.L = 84; e.pv = [10, 21, 31].map(function (c) { return { x: e.x + c * TS, y: e.y - 128, ph: c * 0.4 }; }); },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; e.pv.forEach(function (v) { v.th = Math.sin(G.t * 1.6 + v.ph) * 0.6; var ex = v.x + Math.sin(v.th) * e.L, ey = v.y + Math.cos(v.th) * e.L;
      if (!p.gl && e.cd <= 0 && p.air && p.state === 'normal' && Math.hypot(p.x - ex, p.y - 26 - ey) < 22) { p.gl = { e: e, v: v, th: v.th, w: Math.max(2.2, p.vx / e.L), t: 0 }; sfx.play('clink'); } }); },
  ride: function (p, s, dt) { var e = s.e, v = s.v; s.t += dt; s.w += -(990 / e.L) * Math.sin(s.th) * dt; s.th += s.w * dt; p.x = v.x + Math.sin(s.th) * e.L; p.y = v.y + Math.cos(s.th) * e.L + 26; p.grot = -s.th * 0.8; p.face = s.w >= 0 ? 1 : -1; p.vx = 0; p.vy = 0; p.air = true;
    if (KIT.pressed('a') || (s.th > 0.5 && s.w > 0) || s.t > 3) { dropOff(p, e.L * Math.cos(s.th) * s.w * 1.15 + 60, -e.L * Math.sin(s.th) * s.w * 1.1 - 140); p.spring = 0.3; e.cd = 0.5; sfx.play('jump'); return; } relJ(p); },
  draw: function (g, e, x, y, L, cx, cy) { if (!e.pv) return; var py = Math.round(e.pv[0].y - cy); postD(x + 4 * TS, y, y - py, L, 6); postD(x + 38 * TS, y, y - py, L, 6); bx(x + 4 * TS - 4, py - 4, 34 * TS + 8, 6, L.wood, L.mlite);
    e.pv.forEach(function (v) { var px = Math.round(v.x - cx), held = PL && PL.gl && PL.gl.v === v, th = held ? PL.gl.th : (v.th || 0), ex = px + Math.sin(th) * e.L, ey = py + Math.cos(th) * e.L; motif(g, px, py - 8, L);
      g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(px, py); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = L.k === 'brain' ? L.goo : L.k === 'factory' || L.k === 'city' ? L.mlite : L.lite; g.lineWidth = 1; g.stroke(); if (!held) R(OUT, ex - 3, ey - 2, 6, 6); }); } });
var SMASH = { city: 'glass', sewer: 'brick', park: 'paper', bone: 'bones', factory: 'crates', brain: 'membrane' };
gimDef('smashwalls', { h: 6, // thin walls in a row: hit them fast (or jump into them) and smash straight through
  lay: function (b) { b.ground(2); b.thing(0, 'dash', 0, { dir: 1 }); b.ground(5); var e = GT(b, 0, 'smashwalls', {}); e.cols = [];
    for (var i = 0; i < 7; i++) { b.ground(4); for (var y = 1; y <= 6; y++) b.set(b.col, b.h - y, 'X'); e.cols.push(b.col); b.ground(1); b.drops(-4, 2, 2); } b.ground(5); },
  step: function (e, dt, p) { var r0 = Math.floor(e.y / TS), v = p.air ? p.vx : p.gsp; if (p.state !== 'normal') return; /* smash it at speed or by jumping into it, whatever height you hit it at */
    e.cols.forEach(function (c) { if (T(c, r0 - 1) !== 'X') return; var wx = c * TS; if (p.x + PHW + 4 + Math.max(0, v) * dt * 2 >= wx && p.x < wx + 8 && p.y > (r0 - 5) * TS && (Math.abs(v) >= 140 || p.air || G.super)) { breakWall(c, r0 - 1); p.gsp = Math.max(p.gsp, p.air ? p.gsp : 260); } }); },
  draw: function (g, e, x, y, L, cx) { var k = SMASH[L.k], r0 = Math.floor(e.y / TS); (e.cols || []).forEach(function (c) { if (T(c, r0 - 1) !== 'X') return; var wx = c * TS - cx;
      if (k === 'glass') { bx(wx, y - 96, 16, 96, '#2a0c12', L.slite); R(L.hot, wx + 2, y - 60, 1, 56); R(L.hot, wx + 4, y - 40, 8, 1); R('#ffd0d0', wx + 10, y - 54, 2, 10); }
      else if (k === 'paper') { bx(wx, y - 96, 16, 96, '#fff6e8', '#ffffff'); for (var s = 0; s < 6; s++) R(s % 2 ? L.main : L.hot, wx + 4, y - 90 + s * 14, 8, 8); }
      else if (k === 'bones') { bx(wx, y - 96, 16, 96, L.stone, L.slite); for (var b2 = 0; b2 < 12; b2++) R(L.main, wx + 2 + (b2 % 2) * 6, y - 94 + b2 * 8, 6, 3); }
      else if (k === 'crates') { for (var c2 = 0; c2 < 6; c2++) { bx(wx, y - 96 + c2 * 16, 16, 15, L.wood, L.mlite); R(L.dark, wx + 7, y - 95 + c2 * 16, 2, 14); } }
      else if (k === 'membrane') { bx(wx, y - 96, 16, 96, L.goo, L.lite); for (var v = 0; v < 8; v++) R(L.main, wx + 3 + (v * 5) % 10, y - 92 + v * 12, 1, 10); }
      else { bx(wx, y - 96, 16, 96, L.stone, L.slite); for (var r = 0; r < 12; r++) R(OUT, wx, y - 96 + r * 8, 16, 1); R("#e8d4a0", wx + 6, y - 40, 3, 40); } }); } });

gimDef('beatblocks', { h: 3, // blocks that come and go on the beat (PulsarOctopus on the decks)
  lay: function (b) { GT(b, 0, 'beatblocks', { w: 30 }, 0, 'gimh'); safePit(b, 30); },
  init: function (e) { for (var i = 0; i < 10; i++) gimPlat(e, e.x - 8 + 6 + i * 48, e.y - (i % 3 === 1 ? 16 : 0), 32, { i: i, mv: function (q) { var beat = Math.floor(G.t / 0.9) % 2; q.gone = (q.i % 2) !== beat; q.warn = (G.t % 0.9) > 0.62; },
      draw: function (g, x, y, q) { var L = GL(); if (q.gone) { for (var d = 0; d < q.w; d += 4) { R(L.mlite, x + d, y, 2, 1); R(L.mlite, x + d, y + 9, 2, 1); } return; }
        bx(x, y, q.w, 10, L.main, L.hot); if (q.warn && Math.floor(G.t * 20) % 2) R('#ffffff', x, y, q.w, 2); R(OUT, x + 13, y + 3, 2, 4); R(OUT, x + 13, y + 3, 5, 1); } }); },
  draw: function (g, e, x, y, L) { var pulse = (G.t % 0.9) < 0.12 ? 2 : 0; bx(x - 30, y - 34, 22, 34, L.metal, L.mlite); g.fillStyle = OUT; g.beginPath(); g.arc(x - 19, y - 22, 7 + pulse, 0, 6.3); g.fill(); g.fillStyle = L.dark; g.beginPath(); g.arc(x - 19, y - 22, 5 + pulse, 0, 6.3); g.fill(); R(L.hot, x - 21, y - 9, 4, 4); motif(g, x - 19, y - 38, L); } });

gimDef('lowgrav', { h: 12, // the air goes thin for a long stretch: you float, walls you could never jump are easy, rocks drift, mines hang in the air
  lay: function (b) { var e = GT(b, 0, 'lowgrav', {}); b.ground(8);
    function wall(n) { for (var x = 0; x < 2; x++) for (var y = 1; y <= n; y++) b.set(b.col + x, b.h - y, '#'); b.ground(2); b.drops(-1, 4, n + 3, 'arc', 1.2); }
    wall(5); b.ground(10); SEC.ditch(b, 10); b.ground(6); wall(8); b.ground(12); b.drops(-10, 6, 9, 'arc', 1.6); SEC.ditch(b, 12); b.ground(8); wall(11); b.ground(14); b.drops(-12, 7, 6, 'arc', 1.6); e.w = b.col - e.c; },
  init: function (e) { var w = e.w * TS; e.rk = []; for (var i = 0; i < 6; i++) e.rk.push(gimPlat(e, e.x + 60 + i * (w - 120) / 6, e.y - 112 - (i % 3) * 36, 40, { ph: i * 1.3, mv: function (q) { q.x = q.x0 + Math.sin(G.t * 0.5 + q.ph) * 28; q.y = q.y0 + Math.sin(G.t * 0.8 + q.ph) * 14; },
      draw: function (g, x, y, q) { var L = GL(); bx(x, y, q.w, 8, L.stone, L.slite); R(L.slite, x + 4, y + 8, q.w - 8, 4); R(L.stone, x + 10, y + 12, q.w - 20, 3); if (Math.floor(G.t * 3 + q.ph) % 4 === 0) R(L.glow, x + q.w / 2, y + 16, 1, 1); } }));
    e.mn = []; for (var k = 0; k < 4; k++) e.mn.push({ x0: e.x + 140 + k * (w - 240) / 4, y0: e.y - 70 - (k % 2) * 60, ph: k * 1.7 }); },
  step: function (e, dt, p) { (e.mn || []).forEach(function (m) { m.x = m.x0 + Math.sin(G.t * 0.6 + m.ph) * 40; m.y = m.y0 + Math.cos(G.t * 0.9 + m.ph) * 22; if (pCirc(m.x, m.y, 9)) hurt(m.x); });
    if (p.x < e.x - 8 || p.x > e.x + e.w * TS || p.y < e.y - 420 || p.state !== 'normal') return; if (p.air) p.vy -= 990 * 0.58 * dt; if (Math.random() < 0.4) FX.push({ k: 'bit', x: p.x + (Math.random() - 0.5) * 40, y: p.y - Math.random() * 40, vx: 0, vy: -20, t: 0.8, c: GL().glow, g: 0 }); },
  draw: function (g, e, x, y, L, cx, cy) { var w = e.w * TS; [x - 8, x - 8 + w].forEach(function (cxx) { for (var d = 0; d < 260; d += 6) if ((Math.floor(G.t * 10) + d / 6) % 3 === 0) R(L.glow, cxx, y - d, 1, 3); text('LOW GRAVITY', cxx, y - 270, { size: 4, align: 'center', col: L.glow }); });
    for (var s = 0; s < 40; s++) { var sx = x + (s * 53) % w, sy = y - 10 - ((G.t * 14 + s * 31) % 250); R(s % 3 ? L.lite : L.glow, sx, sy, 1, s % 5 ? 1 : 2); }
    for (var r = 0; r < 10; r++) { var rx = x + 30 + r * (w - 60) / 10, ry = y - 40 - (r * 29) % 160 + Math.sin(G.t * 1.2 + r) * 8; g.save(); g.translate(rx, ry); g.rotate(G.t * 0.4 + r); bx(-4, -3, 8 + r % 3 * 3, 6, L.stone, L.slite); g.restore(); }
    (e.mn || []).forEach(function (m) { spikeBall(g, m.x - cx, m.y - cy, 7, L); R(L.hot, m.x - cx - 1, m.y - cy - 1, 2, 2); }); } });
var DOOR = { city: 'red', sewer: 'hatch', park: 'mirror', bone: 'crypt', factory: 'blast', brain: 'iris' };
function doorD(g, x, y, L, open) { var k = DOOR[L.k]; x = Math.round(x); y = Math.round(y); bx(x - 12, y - 42, 24, 42, L.stone, L.slite); var w = Math.round(18 * (1 - open));
  if (k === 'iris') { g.fillStyle = OUT; g.beginPath(); g.arc(x, y - 21, 11, 0, 6.3); g.fill(); g.fillStyle = open > 0.3 ? L.glow : L.metal; g.beginPath(); g.arc(x, y - 21, 9 * (1 - open * 0.7), 0, 6.3); g.fill(); return; }
  R(OUT, x - 9, y - 38, 18, 38); R(open > 0 ? L.glow : L.dark, x - 8, y - 37, 16, 37);
  if (w > 0) { var c = k === 'mirror' ? '#c8c0d8' : k === 'red' ? L.main : k === 'crypt' ? L.wood : L.metal; R(c, x - 8, y - 37, w, 37); R(OUT, x - 8 + w - 1, y - 37, 1, 37);
    if (k === 'mirror') R('#ffffff', x - 6, y - 34, 2, 12); else if (k === 'red') R(L.lite, x - 8 + w - 4, y - 20, 2, 2); else if (k === 'blast') { for (var s = 0; s < 37; s += 8) R(L.hot, x - 8, y - 37 + s, w, 2); } else if (k === 'hatch') R(L.mlite, x - 6, y - 24, w - 4, 3); else R(L.mlite, x - 6, y - 30, 2, 20); }
  motif(g, x, y - 46, L); }
gimDef('doors', { h: 8, // a door: walk in, and you come out of the other one up on the ledge (over the spikes)
  lay: function (b) { var e = GT(b, 0, 'doors', {}); var c0 = b.col; b.ground(24); b.spikes(c0 + 4 - b.col, 3); b.spikes(c0 + 12 - b.col, 3); b.ledge(c0 + 8 - b.col, 7, 12, '#'); e.c2 = c0 + 10; e.r2 = b.h - 7; b.drops(c0 + 12 - b.col, 6, 9, null, 1.2); b.thing(c0 + 17 - b.col, 'box', 7, { item: 'drops' }); b.ground(2); },
  init: function (e) { e.bx = e.c2 * TS + 8; e.by = e.y - (e.row - e.r2) * TS; },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (!p.gl && e.cd <= 0 && !p.air && p.state === 'normal' && Math.abs(p.x - e.x) < 8 && Math.abs(p.y - e.y) < 5) { p.gl = { e: e, t: 0 }; sfx.play('check'); } },
  ride: function (p, s, dt) { var e = s.e; s.t += dt; p.gsp = 0; p.vx = 0; p.vy = 0; relJ(p); if (s.t < 0.3) { p.x = e.x; p.y = e.y; p.hide = s.t > 0.15 ? 1 : 0; p.air = false; return; }
    p.x = e.bx; p.y = e.by; p.air = false; p.hide = s.t < 0.45 ? 1 : 0; if (s.t > 0.6) { p.gl = null; p.hide = 0; p.gsp = 140; e.cd = 1.5; } },
  draw: function (g, e, x, y, L, cx, cy) { var t = PL && PL.gl && PL.gl.e === e ? PL.gl.t : 9; doorD(g, x, y, L, t < 0.3 ? Math.min(1, t / 0.12) : 0); if (e.bx !== undefined) doorD(g, e.bx - cx, e.by - cy, L, t >= 0.3 && t < 0.6 ? 1 : 0); } });

gimDef('ferris', { h: 10, // a little wheel of platforms turns you up to a ledge
  lay: function (b) { GT(b, 0, 'ferris', {}); b.ground(10); b.ledge(0, 8, 7, '#'); b.drops(1, 5, 10, null, 1.2); b.thing(4, 'box', 8, { item: 'drops' }); b.ground(14); },
  init: function (e) { e.hx = e.x + 5 * TS; e.hy = e.y - 72; for (var i = 0; i < 4; i++) gimPlat(e, 0, 0, 40, { i: i, mv: function (q) { var a = G.t * 0.55 + q.i * 1.5708; q.x = q.e.hx + Math.cos(a) * 56 - 20; q.y = q.e.hy + Math.sin(a) * 56; },
      draw: function (g, x, y, q) { var L = GL(); plank(g, x, y, q.w, L); bx(x + 8, y + 7, q.w - 16, 10, L.k === 'park' ? L.hot : L.metal, L.mlite); } }); },
  draw: function (g, e, x, y, L, cx, cy) { var hx = Math.round(e.hx - cx), hy = Math.round(e.hy - cy); g.strokeStyle = OUT; g.lineWidth = 4; g.beginPath(); g.moveTo(hx - 30, y); g.lineTo(hx, hy); g.lineTo(hx + 30, y); g.stroke(); g.strokeStyle = L.metal; g.lineWidth = 2; g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.arc(hx, hy, 56, 0, 6.3); g.stroke(); g.strokeStyle = L.main; g.lineWidth = 1; g.stroke();
    for (var i = 0; i < 8; i++) { var a = G.t * 0.55 + i * 0.785; R(L.mlite, hx + Math.cos(a) * 28 - 1, hy + Math.sin(a) * 28 - 1, 2, 2); R(Math.floor(G.t * 4 + i) % 2 ? L.hot : L.lite, hx + Math.cos(a) * 56 - 1, hy + Math.sin(a) * 56 - 1, 3, 3); } motif(g, hx, hy, L); } });

var HOOK = { city: 'crane', sewer: 'bucket', park: 'chair', bone: 'hand', factory: 'meat', brain: 'claw' };
gimDef('hooks', { h: 7, // hooks run along an overhead track: jump up and hang on over the spikes
  lay: function (b) { var e = GT(b, 0, 'hooks', {}); b.ground(3); SEC.ditch(b, 30); b.ground(3); e.c1 = b.col; b.ground(2); },
  hk: function (e, i) { var len = e.c1 * TS - e.x; return { x: e.x + ((G.t * 140 + i * len / 5) % len), y: e.y - 66 }; },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (p.gl || e.cd > 0 || !p.air || p.state !== 'normal') return; for (var i = 0; i < 5; i++) { var h = GIM.hooks.hk(e, i); if (h.x < e.c1 * TS - 30 && Math.hypot(p.x - h.x, p.y - PH - h.y) < 18) { p.gl = { e: e, i: i }; sfx.play('clink'); return; } } },
  ride: function (p, s, dt) { var e = s.e, h = GIM.hooks.hk(e, s.i); p.x = h.x; p.y = h.y + PH + 2; p.vx = 140; p.vy = 0; p.air = true; p.face = 1; if (KIT.pressed('a') || h.x > e.c1 * TS - 12) { dropOff(p, 200, KIT.pressed('a') ? -300 : -100); e.cd = 0.5; return; } relJ(p); },
  draw: function (g, e, x, y, L, cx, cy) { var x1 = e.c1 * TS - cx, ty = y - 96; postD(x, y, 96, L, 6); postD(x1, y, 96, L, 6); bx(x - 4, ty - 4, x1 - x + 8, 8, L.metal, L.mlite); R(OUT, x - 4, ty, x1 - x + 8, 1); var k = HOOK[L.k];
    for (var i = 0; i < 5; i++) { var h = GIM.hooks.hk(e, i), hx = Math.round(h.x - cx), hy = Math.round(h.y - cy); R(OUT, hx - 4, ty + 3, 8, 4); R(OUT, hx - 1, ty + 6, 2, hy - ty - 6); R(L.mlite, hx, ty + 6, 1, hy - ty - 6);
      if (k === 'chair') { bx(hx - 10, hy, 20, 4, L.main, L.hot); R(OUT, hx - 10, hy - 8, 2, 8); }
      else if (k === 'bucket') { bx(hx - 6, hy, 12, 10, L.metal, L.mlite); R('#e8d4a0', hx - 5, hy + 1, 10, 2); }
      else if (k === 'hand') { bx(hx - 5, hy, 10, 6, L.main, L.lite); for (var f = 0; f < 4; f++) R(L.main, hx - 5 + f * 3, hy + 6, 2, 5); }
      else if (k === 'claw') { R(OUT, hx - 7, hy, 14, 4); R(L.mlite, hx - 7, hy + 3, 2, 7); R(L.mlite, hx + 5, hy + 3, 2, 7); R(L.hot, hx - 1, hy + 1, 2, 2); }
      else { g.strokeStyle = OUT; g.lineWidth = 4; g.beginPath(); g.arc(hx + 3, hy + 6, 6, Math.PI * 0.9, Math.PI * 2.4); g.stroke(); g.strokeStyle = k === 'meat' ? L.mlite : L.main; g.lineWidth = 2; g.stroke(); } } } });

gimDef('swingplats', { h: 8, // platforms on chains swing over the pit
  lay: function (b) { GT(b, 0, 'swingplats', { w: 26 }, 0, 'gimh'); safePit(b, 26); },
  init: function (e) { for (var i = 0; i < 5; i++) gimPlat(e, 0, 0, 40, { i: i, ax: e.x - 8 + 40 + i * 72, ay: e.y - 128, mv: function (q) { var th = Math.sin(G.t * 1.4 + q.i * 1.3) * 0.45; q.th = th; q.x = q.ax + Math.sin(th) * 112 - 20; q.y = q.ay + Math.cos(th) * 112; },
      draw: function (g, x, y, q) { var L = GL(), ax = Math.round(q.ax - CAM.x), ay = Math.round(q.ay - CAM.y); g.strokeStyle = OUT; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.lineTo(x + 4, y); g.moveTo(ax, ay); g.lineTo(x + q.w - 4, y); g.stroke();
        if (L.k === 'city') { bx(x, y, q.w, 5, L.metal, L.mlite); for (var c = 4; c < q.w; c += 9) { R(L.lite, c + x, y - 6, 2, 6); R(L.hot, c + x, y - 8, 2, 2); } } else plank(g, x, y, q.w, L); } }); },
  draw: function (g, e, x, y, L) { var w = e.w * TS; postD(x - 8, y, 132, L, 6); postD(x - 8 + w, y, 132, L, 6); bx(x - 10, y - 134, w + 4, 6, L.metal, L.mlite); motif(g, x - 8, y - 138, L); motif(g, x - 8 + w, y - 138, L); } });

gimDef('seesaw', { h: 3, // a seesaw over the pit: your weight tips it
  lay: function (b) { for (var i = 0; i < 2; i++) { GT(b, 0, 'seesaw', { w: 14 }, 0, 'gimh'); safePit(b, 14); b.ground(4); b.drops(-3, 2, 2); } },
  init: function (e) { e.k2 = 0; var px = e.x - 8 + 7 * TS; e.pvx = px; var A = gimPlat(e, px - 92, e.y, 48, { side: 1, mv: function (q, dt) { var on = onPlat(q) ? 1 : onPlat(q.other) ? -1 : 0; q.e.k2 += ((on || 0) - q.e.k2) * Math.min(1, dt * (on ? 2.2 : 0.8)); q.y = q.y0 + q.e.k2 * 22; } });
    var B = gimPlat(e, px + 44, e.y, 48, { side: -1, mv: function (q) { q.y = q.y0 - q.e.k2 * 22; } }); A.other = B; A.draw = B.draw = function (g, x, y, q) { plank(g, x, y, q.w, GL()); }; },
  draw: function (g, e, x, y, L, cx, cy) { var px = Math.round(e.pvx - cx), k = e.k2 || 0; bx(px - 3, y + 6, 6, 70, L.metal, L.mlite); g.fillStyle = OUT; g.beginPath(); g.moveTo(px - 10, y + 10); g.lineTo(px, y - 2); g.lineTo(px + 10, y + 10); g.fill(); g.fillStyle = L.stone; g.beginPath(); g.moveTo(px - 8, y + 9); g.lineTo(px, y); g.lineTo(px + 8, y + 9); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 5; g.beginPath(); g.moveTo(px - 68, y + 4 + k * 22); g.lineTo(px + 68, y + 4 - k * 22); g.stroke(); g.strokeStyle = L.wood; g.lineWidth = 3; g.stroke(); motif(g, px, y + 2, L); } });
