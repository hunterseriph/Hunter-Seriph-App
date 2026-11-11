/* =====================================================================================================
   SUPER SPUNKY BALL: Super Monkey Ball with our lot inside a see-through ball. You don't move the ball, you tilt the whole
   stage and the ball rolls. Get to the goal gate before the clock runs out, grab drops on the way (100 = a life), and
   don't fall off. Three worlds of ten stages: Cum City (red and black), Ejaculand (sweets and rides), the Sperm Isles
   (sand, sea and slopes).
   ===================================================================================================== */
var W = 480, H = 270;
var SV = KIT.load('sb-save', null) || { best: {}, open: 1, who: 'cumhead' };
function persist() { KIT.save('sb-save', SV); }
var WHO = { cumhead: { n: 'CUMHEAD', s: 'ch_idle0', col: [1, 0.85, 0.6] }, spermaid: { n: 'SPERMAID', s: 'spermaid_s0', col: [0.7, 1, 0.95] }, greebo: { n: 'GREEBO', s: 'greebo_s0', col: [1, 0.95, 0.75] }, lab: { n: 'SHITHEAD LABOOZIE', s: 'lab_idle0', col: [0.9, 0.75, 0.55] }, gloop: { n: 'GLOOP', s: 'h_gloop_adult_idle0', col: [0.75, 1, 0.7] } };
var WORLDS = [
  { n: 'CUM CITY', a: '#6a1a24', b: '#c4121c', sky: [0.12, 0.02, 0.04], fog: [0.12, 0.02, 0.04], song: 'sbcity' },
  { n: 'EJACULAND', a: '#ff7ab8', b: '#ffe36a', sky: [0.35, 0.12, 0.3], fog: [0.35, 0.12, 0.3], song: 'sbpark' },
  { n: 'THE SPERM ISLES', a: '#e8d8a8', b: '#3aa8b8', sky: [0.4, 0.6, 0.75], fog: [0.4, 0.6, 0.75], song: 'sbisle' }
];
/* ---------- the stages, built from pieces: a box is [x0, z0, x1, z1, top y]; a ramp rises from y0 to y1 along its axis ---------- */
function stage(n) {
  var w = Math.floor(n / 10), k = n % 10, rnd = srand(300 + n * 71), P = [], drops = [], movers = [], bumps = [], z = 0, y = 0, x = 0, wid = 6 - Math.min(3.5, k * 0.35);
  function ri(a) { return Math.floor(rnd() * a); }
  function box(x0, z0, x1, z1, top) { P.push({ k: 'box', x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), y: top }); }
  function drop(x, y, z) { drops.push({ x: x, y: y + 0.6, z: z }); }
  box(x - 4, z - 4, x + 4, z + 4, y); z += 4;
  var pieces = 3 + Math.floor(k / 2) + w;
  for (var p = 0; p < pieces; p++) { var t = ri(7), len = 8 + ri(8);
    if (t === 0) { box(x - wid / 2, z, x + wid / 2, z + len, y); for (var d = 0; d < 3; d++) drop(x + (d - 1) * wid * 0.25, y, z + len * (0.3 + d * 0.2)); z += len; }
    else if (t === 1) { var y1 = y + (rnd() < 0.5 ? -2 : 2) * (1 + w * 0.3); P.push({ k: 'ramp', x0: x - wid / 2, z0: z, x1: x + wid / 2, z1: z + len, y0: y, y1: y1 }); drop(x, (y + y1) / 2, z + len / 2); z += len; y = y1; }
    else if (t === 2) { var gap = 1.5 + rnd() * (0.6 + w * 0.4); z += gap; y -= 1; box(x - wid / 2 - 1, z, x + wid / 2 + 1, z + 6, y); drop(x, y, z + 3); z += 6; } // a gap: roll fast enough and you fly it onto the lower platform
    else if (t === 3) { var side = rnd() < 0.5 ? -1 : 1; box(x - wid / 2, z, x + wid / 2, z + wid, y); var nx = x + side * (len); box(Math.min(x, nx) - wid / 2, z, Math.max(x, nx) + wid / 2, z + wid, y); drop((x + nx) / 2, y, z + wid / 2); x = nx; z += wid; }
    else if (t === 4) { var mz = z, ml = 6 + ri(4); movers.push({ x0: x - 1.6, z0: mz, x1: x + 1.6, z1: mz + 3, y: y, ax: 'z', amp: ml / 2 - 1.5, ph: rnd() * 6, sp: 0.6 + w * 0.15, base: mz + ml / 2 - 1.5 }); z += ml; box(x - wid / 2, z, x + wid / 2, z + 4, y); z += 4; }
    else if (t === 5) { var bw = wid + 4; box(x - bw / 2, z, x + bw / 2, z + len + 4, y); for (var bb = 0; bb < 3 + w; bb++) bumps.push({ x: x + (rnd() - 0.5) * (bw - 2), z: z + 2 + rnd() * len, y: y, r: 0.7 }); drop(x, y, z + len / 2); z += len + 4; }
    else { var nw = Math.max(1.4, wid * 0.45); box(x - nw / 2, z, x + nw / 2, z + len, y); drop(x, y, z + len * 0.5); z += len; } // a narrow beam
  }
  box(x - 4, z, x + 4, z + 6, y); var goal = { x: x, z: z + 4, y: y };
  return { n: n, w: w, P: P, drops: drops, movers: movers, bumps: bumps, goal: goal, start: { x: 0, y: 0.6, z: 0 }, time: 60 + pieces * 4 };
}
var ST = null, B = null, G = { mode: 'title', t: 0 }, MESH = null, DYN = null, SHEETTEX = null, CAM = { yaw: 0, x: 0, y: 4, z: -8 }, TILT = { x: 0, z: 0 };
var TSZ = 2.4;
WORLDS.forEach(function (Wd, i) { PAINT['top' + i] = function (p) { for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) p.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? Wd.a : shade(Wd.a, 0.82)); p.rect(0, 0, 32, 1, shade(Wd.a, 1.2)); p.rect(0, 0, 1, 32, shade(Wd.a, 1.2)); };
  PAINT['side' + i] = function (p) { p.fill(Wd.b); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 4, 32, shade(Wd.b, 0.8)); p.rect(0, 0, 32, 3, shade(Wd.b, 1.3)); }; });
PAINT.tape = function (p) { for (var x = 0; x < 32; x += 8) { p.rect(x, 0, 4, 32, '#ffe36a'); p.rect(x + 4, 0, 4, 32, '#12040a'); } }; PAINT.bump = function (p) { p.fill('#ff2630'); p.rect(0, 12, 32, 8, '#ffffff'); };
function sheetTex() { if (!SHEETTEX && KIT.sheetReady) SHEETTEX = R3.texture(KIT.sheet); return SHEETTEX; }
function sprRect(n) { var f = KIT.SPR[n], im = KIT.sheet; if (!f || !im || !im.width) return null; return { t: [(f[0] + 0.02) / im.width, (f[1] + 0.02) / im.height, (f[2] - 0.04) / im.width, (f[3] - 0.04) / im.height], w: f[2], h: f[3] }; }
function boxMesh(m, x0, y0, z0, x1, y1, z1, top, side, c) { c = c || [0.5, 0.5, 0.5]; var sd = [c[0] * 0.75, c[1] * 0.75, c[2] * 0.75], w = (x1 - x0) / 2, d = (z1 - z0) / 2, h = (y1 - y0) / 2;
  m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 0, w, 0, w, d, 0, d], top, c, [0, 1, 0]);
  m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, h, w, h, w, 0, 0, 0], side, sd, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, h, w, h, w, 0, 0, 0], side, sd, [0, 0, -1]);
  m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [0, h, d, h, d, 0, 0, 0], side, sd, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [0, h, d, h, d, 0, 0, 0], side, sd, [-1, 0, 0]); }
function buildMesh() { var m = new R3.Mesh(), wi = ST.w, top = TL('top' + wi), side = TL('side' + wi);
  ST.P.forEach(function (p) { if (p.k === 'box') boxMesh(m, p.x0, p.y - 1.2, p.z0, p.x1, p.y, p.z1, top, side); else { var c = [0.5, 0.5, 0.5], w = (p.x1 - p.x0) / 2, d = (p.z1 - p.z0) / 2; m.quad([p.x0, p.y0, p.z0], [p.x1, p.y0, p.z0], [p.x1, p.y1, p.z1], [p.x0, p.y1, p.z1], [0, 0, w, 0, w, d, 0, d], top, c, faceN([p.x0, p.y0, p.z0], [p.x1, p.y0, p.z0], [p.x1, p.y1, p.z1]));
      m.quad([p.x0, Math.min(p.y0, p.y1) - 1.2, p.z0], [p.x0, Math.min(p.y0, p.y1) - 1.2, p.z1], [p.x0, p.y1, p.z1], [p.x0, p.y0, p.z0], [0, 1, d, 1, d, 0, 0, 0], side, [0.37, 0.37, 0.37], [-1, 0, 0]); m.quad([p.x1, Math.min(p.y0, p.y1) - 1.2, p.z1], [p.x1, Math.min(p.y0, p.y1) - 1.2, p.z0], [p.x1, p.y0, p.z0], [p.x1, p.y1, p.z1], [0, 1, d, 1, d, 0, 0, 0], side, [0.37, 0.37, 0.37], [1, 0, 0]); } });
  var g = ST.goal; boxMesh(m, g.x - 2.4, g.y, g.z - 0.15, g.x - 2.0, g.y + 2.6, g.z + 0.15, TL('tape'), TL('tape')); boxMesh(m, g.x + 2.0, g.y, g.z - 0.15, g.x + 2.4, g.y + 2.6, g.z + 0.15, TL('tape'), TL('tape')); boxMesh(m, g.x - 2.4, g.y + 2.4, g.z - 0.15, g.x + 2.4, g.y + 2.7, g.z + 0.15, TL('tape'), TL('tape'));
  ST.bumps.forEach(function (b) { for (var s = 0; s < 10; s++) { var a0 = s / 10 * 6.283, a1 = (s + 1) / 10 * 6.283; m.quad([b.x + Math.cos(a0) * b.r, b.y, b.z + Math.sin(a0) * b.r], [b.x + Math.cos(a1) * b.r, b.y, b.z + Math.sin(a1) * b.r], [b.x + Math.cos(a1) * b.r, b.y + 1, b.z + Math.sin(a1) * b.r], [b.x + Math.cos(a0) * b.r, b.y + 1, b.z + Math.sin(a0) * b.r], [0, 1, 1, 1, 1, 0, 0, 0], TL('bump'), [0.5, 0.5, 0.5], [Math.cos(a0), 0, Math.sin(a0)]); } });
  stageDeco(m, ST.w);
  return m.upload(); }
var SPH = null;
function sphere() { if (SPH) return SPH; var m = new R3.Mesh(), seg = 14, rings = 9; for (var r = 0; r < rings; r++) for (var s = 0; s < seg; s++) { function pt(ri, si) { var th = ri / rings * Math.PI, ph = si / seg * 6.283; return [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]; } var a = pt(r, s), b = pt(r, s + 1), c = pt(r + 1, s + 1), d = pt(r + 1, s); m.quadN([a, b, c, d], [0, 0, 1, 0, 1, 1, 0, 1], TL('ball'), [0.5, 0.5, 0.5], [a, b, c, d]); } return (SPH = m.upload()); }
function startStage(n) {
  if (!R3.ok) { G.mode = 'nogl'; return; } buildAtlas(); buildRigs(); riders(); ST = stage(n); G.n = n; if (MESH) MESH.free(); MESH = buildMesh(); KIT.closeMenu();
  B = { x: ST.start.x, y: ST.start.y, z: ST.start.z, vx: 0, vy: 0, vz: 0, r: 0.5, spin: 0, ax: 0, az: 0 }; CAM.yaw = 0; CAM.x = 0; CAM.y = 4; CAM.z = -8; G.time = ST.time; G.mode = 'ready'; G.readyT = 2; G.got = 0; ST.drops.forEach(function (d) { d.got = 0; }); TILT.x = TILT.z = 0;
  music.play(WORLDS[ST.w].song);
}
/* ---------- the ball ---------- */
function surfaceUnder(x, z, y) { // the highest floor under (x, z) at or below y + a bit
  var best = -99, n = null; ST.P.forEach(function (p) { if (x < p.x0 || x > p.x1 || z < p.z0 || z > p.z1) return; var h = p.k === 'box' ? p.y : p.y0 + (p.y1 - p.y0) * (z - p.z0) / (p.z1 - p.z0); if (h <= y + 0.7 && h > best) { best = h; n = p; } });
  ST.movers.forEach(function (mv) { var o = moverPos(mv); if (x < o.x0 || x > o.x1 || z < o.z0 || z > o.z1) return; if (mv.y <= y + 0.7 && mv.y > best) { best = mv.y; n = { mv: mv }; } }); return { y: best, p: n };
}
function moverPos(mv) { var o = Math.sin(G.t * mv.sp + mv.ph) * mv.amp; return mv.ax === 'z' ? { x0: mv.x0, x1: mv.x1, z0: mv.base + o, z1: mv.base + o + 3, dz: Math.cos(G.t * mv.sp + mv.ph) * mv.amp * mv.sp } : { x0: mv.x0 + o, x1: mv.x1 + o, z0: mv.z0, z1: mv.z1, dz: 0 }; }
function update(dt) {
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.mode === 'ready') { G.readyT -= dt; if (G.readyT <= 0) G.mode = 'play'; return; }
  if (G.mode === 'fall') { G.fallT += dt; B.vy -= 20 * dt; B.y += B.vy * dt; B.x += B.vx * dt; B.z += B.vz * dt; if (G.fallT > 1.6) { if (SV.lives <= 0) gameOver(); else startStage(G.n); } return; }
  if (G.mode === 'goal') { G.goalT += dt; B.vx *= 0.95; B.vz *= 0.95; B.x += B.vx * dt; B.z += B.vz * dt; B.vy += 9 * dt; B.y += B.vy * dt; if (G.goalT > 2.4) cleared(); return; }
  if (G.mode !== 'play') return;
  G.time -= dt; if (G.time <= 0) { G.time = 0; SV.lives--; G.mode = 'fall'; G.fallT = 0; G.banner = { t: 2, s: 'TIME OVER' }; sfx.play('lose'); return; }
  var mv = KIT.stick(0), cy = Math.cos(CAM.yaw), sy = Math.sin(CAM.yaw), ix = mv.x, iz = -mv.y; // tilt relative to the camera
  var tx = -cy * ix + sy * iz, tz = sy * ix + cy * iz; if (G.bot) { tx = G.bot[0]; tz = G.bot[1]; } TILT.x += (tx - TILT.x) * Math.min(1, dt * 8); TILT.z += (tz - TILT.z) * Math.min(1, dt * 8); // right is (-cos, sin), forward (sin, cos)
  var acc = 13; for (var sub = 0; sub < 4; sub++) { var h = dt / 4;
    B.vx += TILT.x * acc * h; B.vz += TILT.z * acc * h; B.vy -= 22 * h;
    B.vx *= 1 - 0.25 * h; B.vz *= 1 - 0.25 * h; B.x += B.vx * h; B.y += B.vy * h; B.z += B.vz * h;
    var s = surfaceUnder(B.x, B.z, B.y - B.r); if (s.p && B.y - B.r < s.y) { B.y = s.y + B.r; if (s.p.k === 'ramp') { var slope = (s.p.y1 - s.p.y0) / (s.p.z1 - s.p.z0); B.vz -= slope * 14 * h; } if (B.vy < -6) sfx.play('land'); B.vy = Math.max(0, B.vy * -0.15); if (s.p.mv) B.z += moverPos(s.p.mv).dz * h; B.onG = 1; } else B.onG = 0;
    ST.bumps.forEach(function (b) { var dx = B.x - b.x, dz = B.z - b.z, d = Math.hypot(dx, dz); if (d < b.r + B.r && Math.abs(B.y - b.y - 0.5) < 1) { B.vx = dx / d * 9; B.vz = dz / d * 9; B.x = b.x + dx / d * (b.r + B.r + 0.01); B.z = b.z + dz / d * (b.r + B.r + 0.01); sfx.play('boom'); KIT.shake(3); } });
  }
  B.spin += Math.hypot(B.vx, B.vz) * dt / B.r; stepRot(dt);
  ST.drops.forEach(function (d) { if (!d.got && Math.hypot(d.x - B.x, d.y - B.y, d.z - B.z) < 1) { d.got = 1; G.got++; SV.drops = (SV.drops || 0) + 1; sfx.play('coin'); if (SV.drops >= 100) { SV.drops -= 100; SV.lives++; G.banner = { t: 2, s: '1 UP' }; sfx.play('power'); } } });
  var g = ST.goal; if (Math.abs(B.z - g.z) < 0.4 && Math.abs(B.x - g.x) < 2 && Math.abs(B.y - g.y - 0.5) < 1.5) { G.mode = 'goal'; G.goalT = 0; B.vy = 2; sfx.play('win'); G.banner = { t: 3, s: 'GOAL!' }; music.play('sbgoal'); }
  if (B.y < -14 + Math.min(0, lowest())) { SV.lives--; G.mode = 'fall'; G.fallT = 0; G.banner = { t: 1.6, s: 'FALL OUT' }; sfx.play('lose'); persist(); }
  // the camera swings round behind the way you roll
  var sp = Math.hypot(B.vx, B.vz); if (sp > 1.2) CAM.yaw += Math.atan2(Math.sin(Math.atan2(B.vx, B.vz) - CAM.yaw), Math.cos(Math.atan2(B.vx, B.vz) - CAM.yaw)) * Math.min(1, dt * 1.6);
  var lk = KIT.stick(1); CAM.yaw += lk.x * dt * 2;
}
function lowest() { var m = 0; ST.P.forEach(function (p) { m = Math.min(m, p.k === 'box' ? p.y : Math.min(p.y0, p.y1)); }); return m; }
function cleared() { var key = 's' + G.n, t = ST.time - G.time; var b = SV.best[key]; if (!b || t < b) SV.best[key] = Math.round(t * 100) / 100; SV.open = Math.max(SV.open, G.n + 2); persist(); if (G.mode === 'goal') G.mode = 'res';
  KIT.menu({ title: 'Stage ' + (G.n + 1) + ' Clear', sub: WORLDS[ST.w].n, html: '<p style="text-align:center;font-size:18px">TIME ' + t.toFixed(2) + 's<br>DROPS ' + G.got + ' / ' + ST.drops.length + '</p>', items: [G.n < 29 ? { label: 'NEXT STAGE', def: true, fn: function () { startStage(G.n + 1); } } : { label: 'THE END', def: true, fn: ending }, { label: 'STAGE SELECT', fn: stageMenu }, { label: 'TITLE', back: true, fn: titleMenu }] }); }
function gameOver() { G.mode = 'over'; SV.lives = 3; persist(); KIT.menu({ title: 'Game Over', items: [{ label: 'TRY AGAIN', def: true, fn: function () { startStage(G.n); } }, { label: 'STAGE SELECT', fn: stageMenu }, { label: 'TITLE', back: true, fn: titleMenu }] }); }
function ending() { G.mode = 'end'; KIT.menu({ title: 'All Thirty', html: '<p>Every stage rolled. ' + WHO[SV.who].n + ' climbs out of the ball, very dizzy, and is sick on Steve.</p>', items: [{ label: 'TITLE', back: true, def: true, fn: titleMenu }] }); }
/* ---------- drawing ---------- */
function pivotM(pitch, roll) { return R3.mul(R3.model(B.x, B.y, B.z, 0, pitch, roll), R3.model(-B.x, -B.y, -B.z, 0, 0, 0)); }
function draw() {
  var ctx = KIT.ctx; ctx.clearRect(0, 0, KIT.W, KIT.H);
  if (G.mode === 'nogl') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, KIT.W, KIT.H); KIT.text('THIS DEVICE CANNOT DRAW 3D (NO WEBGL)', KIT.W / 2, KIT.H / 2, { align: 'center' }); return; }
  if (!ST) { if (R3.ok) R3.begin([0.12, 0.02, 0.04]); return; }
  var Wd = WORLDS[ST.w], wantX = B.x - Math.sin(CAM.yaw) * 6.5, wantZ = B.z - Math.cos(CAM.yaw) * 6.5, wantY = B.y + 3.2; CAM.x += (wantX - CAM.x) * 0.15; CAM.z += (wantZ - CAM.z) * 0.15; CAM.y += (wantY - CAM.y) * 0.1;
  R3.begin(Wd.sky); R3.setCam([CAM.x, CAM.y, CAM.z], [B.x, B.y + 0.6, B.z], KIT.W < KIT.H ? 1.25 : 1.0);
  R3.scene({ fog: Wd.fog, fogR: [40, 160], amb: [0.62, 0.6, 0.6], lights: [{ x: B.x + 6, y: B.y + 12, z: B.z - 4, r: 60, c: [1, 0.95, 0.85], k: 0.7 }], torch: { p: [0, -99, 0], d: [0, 1, 0], c: [0, 0, 0] }, t: G.t });
  R3.draw(buildScenery(ST.w), ATT, {});
  var tm = pivotM(TILT.z * 0.18, -TILT.x * 0.18); // the stage tilts round the ball
  R3.draw(MESH, ATT, { m: tm, lit: false });
  if (!DYN) DYN = new R3.Mesh(); DYN.clear();
  ST.movers.forEach(function (mv) { var o = moverPos(mv); boxMesh(DYN, o.x0, mv.y - 0.4, o.z0, o.x1, mv.y, o.z1, TL('top' + ST.w), TL('side' + ST.w), [0.6, 0.6, 0.6]); }); R3.draw(DYN, ATT, { m: tm, lit: false });
  var st = sheetTex(); if (st) { DYN.clear(); var Rr = R3.cam.right; function bb(n, x, y, z, hgt) { var r = sprRect(n); if (!r) return; var w = hgt * r.w / r.h / 2; DYN.quad([x - Rr[0] * w, y, z - Rr[2] * w], [x + Rr[0] * w, y, z + Rr[2] * w], [x + Rr[0] * w, y + hgt, z + Rr[2] * w], [x - Rr[0] * w, y + hgt, z - Rr[2] * w], [0, 1, 1, 1, 1, 0, 0, 0], r.t, [0.5, 0.5, 0.5], [0, 0, 1]); }
    ST.drops.forEach(function (d) { if (!d.got) bb('sb_drop', d.x, d.y - 0.3 + Math.sin(G.t * 3 + d.z) * 0.1, d.z, 0.6); }); R3.draw(DYN, st, { m: tm, lit: false });
  }
  drawRider();
  R3.draw(SHELL, ATT, { m: ballMatrix(0.62), alpha: 0.42, lit: false, tint: WHO[SV.who].col });
  hud();
}
function hud() {
  var Wd = KIT.W, Hd = KIT.H; KIT.panel(Wd / 2 - 40, 4, 80, 30); KIT.text(G.time.toFixed(2), Wd / 2, 12, { align: 'center', size: 16, col: G.time < 10 ? '#ff2630' : '#ffe36a' });
  KIT.text('STAGE ' + (G.n + 1), 8, 8, { size: 8 }); KIT.text(WORLDS[ST.w].n, 8, 20, { size: 6, col: '#a6968f' });
  KIT.spr('sb_drop', 8, Hd - 23, { anchor: 'tl' }); KIT.text((SV.drops || 0) + '', 22, Hd - 20, { size: 8, col: '#ffe36a' }); KIT.text('LIVES ' + SV.lives, 70, Hd - 20, { size: 8 });
  var sp = Math.round(Math.hypot(B.vx, B.vz) * 3.6); KIT.text(sp + ' KM/H', Wd - 8, Hd - 20, { align: 'right', size: 8, col: '#a6968f' });
  if (G.mode === 'ready') KIT.text(G.readyT > 1 ? 'READY' : 'GO!', Wd / 2, Hd * 0.4, { align: 'center', font: 'title', size: 40, col: '#ffe36a', outline: 1 });
  if (G.banner) KIT.text(G.banner.s, Wd / 2, Hd * 0.4, { align: 'center', font: 'title', size: 40, col: '#ffe36a', outline: 1, alpha: Math.min(1, G.banner.t * 2) });
}
/* ---------- menus ---------- */
function stageMenu() { G.mode = 'menu'; ST = null; music.play('sbtitle'); KIT.menu({ title: 'Stage Select', wide: true, grid: true, items: Array.apply(null, Array(30)).map(function (_, n) { var b = SV.best['s' + n]; return { label: (n + 1) + (b ? '  ' + b + 's' : ''), dis: n >= SV.open, fn: function () { if (!SV.lives || SV.lives < 1) SV.lives = 3; startStage(n); } }; }).concat([{ label: 'BACK', back: true, fn: titleMenu }]), note: '1 to 10 Cum City · 11 to 20 Ejaculand · 21 to 30 The Sperm Isles' }); }
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p>Tilt the stage with the left stick / d-pad / WASD and the ball rolls. Roll through the goal gate before the clock runs out. Drops: a hundred gives you a life. Fall off and you lose one. The right stick turns the camera.</p>', items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if ((G.mode !== 'play' && G.mode !== 'ready')) return; KIT.menu({ cls: 'clear', title: 'Paused', items: [{ label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, { label: 'RETRY', fn: function () { SV.lives--; startStage(G.n); } }, { label: 'STAGE SELECT', fn: stageMenu }, R3.ok ? R3.resItem(pauseMenu) : null, { label: 'QUIT', fn: titleMenu }] }); }
function titleMenu() { G.mode = 'title'; ST = null; music.play('sbtitle'); KIT.menu({ cls: 'clear', logo: '../assets/sb-logo.webp', title: 'Super Spunky Ball', items: [{ label: 'PLAY', cls: 'hot', def: true, fn: function () { SV.lives = 3; startStage(Math.max(0, SV.open - 1)); } }, { label: 'STAGE SELECT', fn: stageMenu }, { label: 'WHO RIDES: ' + WHO[SV.who].n, fn: whoMenu }, { label: 'HOW TO PLAY', fn: helpMenu }] }); }
music.songs.sbtitle = { bpm: 132, beats: 4, vol: 0.85, wet: 0.3, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'C Am F G C Am Dm G', mel: 'g5 - e5 - c5 - e5 g5 | a5 - - - e5 - - - | f5 - a5 - c6 - a5 - | g5 - - - d5 - - - | e5 g5 c6 - b5 - g5 - | a5 - c6 - e6 - - - | d6 - c6 - a5 - f5 - | g5 - b5 - d6 - - -' };
music.songs.sbcity = { bpm: 140, beats: 4, vol: 0.85, wet: 0.25, lead: 'fm', fmbass: 1, bass: 'pulse16', acc: 'stabs', drums: 'rock', chords: 'Em C D B Em C Am B', mel: 'e5 - b4 - e5 - g5 - | c6 - - - g5 - - - | d5 - f#5 - a5 - d6 - | b5 - - - d#5 - - - | e5 - g5 b5 e6 - d6 - | c6 - b5 - g5 - e5 - | a5 - c6 - e6 - c6 - | b5 - d#6 - b5 - - -' };
music.songs.sbpark = music.songs.park; music.songs.sbisle = music.songs.sewer || music.songs.town; music.songs.sbgoal = music.songs.town;
KIT.start({ w: W, h: H, flex: 720, update: update, draw: draw, onPause: pauseMenu, startPauses: true, pad: { sticks: true, btns: [] }, padKeys: { l: 'a', r: 'd', u: 'w', d: 's', a: 'z', b: 'x', x: 'c', y: 'v', lb: 'q', rb: 'e' } });
KIT.setKeymap({ ArrowLeft: 'sleft', ArrowRight: 'sright', ArrowUp: 'up', ArrowDown: 'down' });
if (!SV.lives) SV.lives = 3;
titleMenu();
window.__sb = { G: G, get B() { return B; }, get ST() { return ST; }, startStage: startStage, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, stage: stage, TILT: TILT };
