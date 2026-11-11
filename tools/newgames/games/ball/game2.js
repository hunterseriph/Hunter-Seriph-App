/* ---------- update 132 (his playtest: the rider was a flat sprite again, all the 3D games must be fully 3D; the ball has
   to look like it rolls; more decorations). The riders are 3D models: Cumhead and Laboozie are Psycho Nightmare's,
   Spermaid, Greebo and Gloop are built here the same way (lit shapes, their own colours), and they run inside the ball
   facing where it rolls. The ball is a see-through shell with a red band, gold stars and a seam that turn with it
   (a real rolling rotation, kept as a matrix). Each world has its own scenery: Cum City's towers, lamps and neon,
   Ejaculand's ferris wheel, carousel, balloons and Steve, the Sperm Isles' sea, palms and rocks. ---------- */
var RIDERS = {}, BALLROT = [1, 0, 0, 0, 1, 0, 0, 0, 1], SCEN = null, SCENW = -1, SHELL = null;
function riders() { if (RIDERS.spermaid) return;
  var m = M(); // Spermaid: a slim cream droplet, the tip curls, black shell bra, teal tail curling up behind, pink fin, a wink
  ell(m, 0, 0.62, 0, 0.26, 0.36, 0.24, '#f1e0b0', 12, 8, { tip: 0.5 }); tub(m, [0, 1.02, 0], [0.08, 1.16, -0.02], 0.05, 0.015, '#f1e0b0', 6); ell(m, 0.12, 1.24, -0.02, 0.035, 0.05, 0.035, '#f1e0b0', 6, 4);
  ell(m, -0.08, 0.72, 0.21, 0.035, 0.045, 0.02, '#12040a', 6, 4); bxp(m, 0.05, 0.71, 0.2, 0.13, 0.725, 0.23, '#12040a'); tub(m, [-0.06, 0.58, 0.22], [0.06, 0.58, 0.22], 0.012, 0.012, '#12040a', 4);
  ell(m, -0.09, 0.47, 0.17, 0.07, 0.06, 0.05, '#1a1a1a', 8, 4); ell(m, 0.09, 0.47, 0.17, 0.07, 0.06, 0.05, '#1a1a1a', 8, 4);
  tub(m, [0, 0.3, 0], [0, 0.12, -0.06], 0.17, 0.12, '#2a9a9a', 10); tub(m, [0, 0.12, -0.06], [0, 0.05, -0.2], 0.12, 0.07, '#2a9a9a', 8); tub(m, [0, 0.05, -0.2], [0, 0.14, -0.34], 0.07, 0.04, '#2a9a9a', 8);
  ell(m, 0, 0.2, -0.4, 0.14, 0.08, 0.03, '#ff6aa8', 8, 4); tub(m, [-0.22, 0.6, 0], [-0.3, 0.4, 0.06], 0.04, 0.035, '#f1e0b0', 6); tub(m, [0.22, 0.6, 0], [0.3, 0.4, 0.06], 0.04, 0.035, '#f1e0b0', 6);
  RIDERS.spermaid = { mesh: m.upload(), h: 1.3 };
  m = M(); // Greebo: a cream pie for a head with his face, chef's hat, black apron with the red G, white gloves
  ell(m, 0, 0.42, 0, 0.2, 0.26, 0.15, '#1a1a1a', 10, 6); bxp(m, -0.06, 0.38, 0.14, 0.06, 0.5, 0.16, '#c4121c');
  ell(m, 0, 0.9, 0, 0.3, 0.16, 0.3, '#d8a050', 12, 6); ell(m, 0, 0.98, 0, 0.27, 0.1, 0.27, '#fff6dc', 12, 5); for (var c = 0; c < 12; c++) { var a = c / 12 * 6.283; ell(m, Math.cos(a) * 0.29, 0.9, Math.sin(a) * 0.29, 0.05, 0.05, 0.05, '#b8803a', 5, 3); }
  ell(m, -0.09, 0.9, 0.27, 0.04, 0.05, 0.02, '#12040a', 6, 4); ell(m, 0.09, 0.9, 0.27, 0.04, 0.05, 0.02, '#12040a', 6, 4); tub(m, [-0.08, 0.81, 0.29], [0.08, 0.81, 0.29], 0.014, 0.014, '#12040a', 4);
  tub(m, [0, 1.05, 0], [0, 1.25, 0], 0.15, 0.17, '#ffffff', 10, { cap: 1 }); ell(m, 0, 1.3, 0, 0.22, 0.12, 0.22, '#ffffff', 10, 5);
  tub(m, [-0.2, 0.55, 0], [-0.32, 0.32, 0.08], 0.05, 0.045, '#1a1a1a', 6); ell(m, -0.33, 0.29, 0.09, 0.07, 0.07, 0.07, '#ffffff', 6, 4); tub(m, [0.2, 0.55, 0], [0.32, 0.32, 0.08], 0.05, 0.045, '#1a1a1a', 6); ell(m, 0.33, 0.29, 0.09, 0.07, 0.07, 0.07, '#ffffff', 6, 4);
  tub(m, [-0.08, 0.2, 0], [-0.08, 0.0, 0], 0.06, 0.06, '#1a1a1a', 6); tub(m, [0.08, 0.2, 0], [0.08, 0.0, 0], 0.06, 0.06, '#1a1a1a', 6);
  RIDERS.greebo = { mesh: m.upload(), h: 1.4 };
  m = M(); // Gloop: teal blob homunculus, the brain showing on top, a big green eye, ooze
  ell(m, 0, 0.42, 0, 0.32, 0.32, 0.3, '#5cc7c9', 12, 8); ell(m, 0, 0.66, -0.02, 0.22, 0.14, 0.2, '#c98e7c', 10, 5); for (var g2 = 0; g2 < 5; g2++) tub(m, [-0.15 + g2 * 0.075, 0.72, -0.15], [-0.15 + g2 * 0.075, 0.76, 0.12], 0.012, 0.012, '#9a6458', 4);
  ell(m, 0, 0.46, 0.27, 0.11, 0.11, 0.05, '#ffffff', 8, 5); ell(m, 0, 0.46, 0.31, 0.06, 0.06, 0.02, '#8dff4a', 8, 4); ell(m, 0, 0.46, 0.33, 0.025, 0.025, 0.01, '#12040a', 6, 3); ell(m, 0.14, 0.34, 0.27, 0.03, 0.03, 0.01, '#16505a', 5, 3);
  tub(m, [-0.12, 0.14, 0], [-0.12, 0.0, 0.02], 0.08, 0.07, '#2a8a94', 6); tub(m, [0.12, 0.14, 0], [0.12, 0.0, 0.02], 0.08, 0.07, '#2a8a94', 6); ell(m, 0.2, 0.22, 0.2, 0.05, 0.08, 0.04, '#3fb43a', 6, 4);
  RIDERS.gloop = { mesh: m.upload(), h: 0.9 };
  // the shell: a sphere with its own picture so you can see it turn
  var sm = M(), seg = 18, rings = 12, T = TL('ballskin'); for (var r = 0; r < rings; r++) for (var s = 0; s < seg; s++) { function pt(ri, si) { var th = ri / rings * Math.PI, ph = si / seg * 6.283; return [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]; }
    var p0 = pt(r, s), p1 = pt(r, s + 1), p2 = pt(r + 1, s + 1), p3 = pt(r + 1, s), u0 = s / seg, u1 = (s + 1) / seg, v0 = r / rings, v1 = (r + 1) / rings; sm.quadN([p3, p2, p1, p0], [u0, v1, u1, v1, u1, v0, u0, v0], T, [0.5, 0.5, 0.5], [p3, p2, p1, p0]); }
  SHELL = sm.upload();
}
PAINT.ballskin = function (p) { p.fill('#fff6dc'); p.rect(0, 13, 32, 6, '#c4121c'); p.rect(0, 13, 32, 1, '#ff6a70'); p.rect(15, 0, 2, 32, '#e8d8b0'); [[6, 5], [24, 6], [8, 25], [22, 26]].forEach(function (q) { p.rect(q[0] - 1, q[1], 3, 1, '#ffc840'); p.rect(q[0], q[1] - 1, 1, 3, '#ffc840'); }); };
/* rolling: the shell turns round the axis across the way it moves, by the distance over the radius */
function stepRot(dt) { var vx = B.vx, vz = B.vz, sp = Math.hypot(vx, vz); if (sp < 0.01) return; var ax = vz / sp, az = -vx / sp, ang = sp * dt / 0.62, c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
  var D = [t * ax * ax + c, -s * az, t * ax * az, s * az, c, -s * ax, t * ax * az, s * ax, t * az * az + c], R0 = BALLROT, N = [];
  for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) N[i * 3 + j] = D[i * 3] * R0[j] + D[i * 3 + 1] * R0[3 + j] + D[i * 3 + 2] * R0[6 + j];
  // keep it orthonormal
  var a = [N[0], N[3], N[6]], b = [N[1], N[4], N[7]], la = Math.hypot(a[0], a[1], a[2]); a = a.map(function (v) { return v / la; }); var d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; b = [b[0] - a[0] * d, b[1] - a[1] * d, b[2] - a[2] * d]; var lb = Math.hypot(b[0], b[1], b[2]); b = b.map(function (v) { return v / lb; }); var cc = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  BALLROT = [a[0], b[0], cc[0], a[1], b[1], cc[1], a[2], b[2], cc[2]]; }
function ballMatrix(sc) { var R0 = BALLROT, m = new Float32Array(16); for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) m[c * 4 + r] = R0[r * 3 + c] * sc; m[12] = B.x; m[13] = B.y; m[14] = B.z; m[15] = 1; return m; }
function drawRider() {
  var sp = Math.hypot(B.vx, B.vz); if (sp > 0.4) B.face = turnA(B.face || 0, Math.atan2(B.vx, B.vz), 0.15); B.ph = (B.ph || 0) + sp / 60 * 3.2;
  var sc = 0.47, y = B.y - 0.5, who = SV.who;
  if (who === 'cumhead' || who === 'lab') { var Q = pose0(); poseWalk(Q, B.ph, Math.min(1, sp / 3), sp > 4); Q.lean += Math.min(0.35, sp * 0.05); drawRig(who === 'lab' ? RIGS.laboozie : RIGS.cumhead, B.x, y, B.z, B.face || 0, Q, { sc: sc, noShadow: 1 }); return; }
  var Rr = RIDERS[who] || RIDERS.gloop, bob = Math.abs(Math.sin(B.ph)) * 0.04, tilt = Math.min(0.35, sp * 0.05);
  R3.draw(Rr.mesh, ATT, { m: R3.model(B.x, y + bob, B.z, B.face || 0, tilt, Math.sin(B.ph) * 0.12, sc * 1.45 * 0.7 / Rr.h * 1.6) });
}
function turnA(a, b, k) { var d = Math.atan2(Math.sin(b - a), Math.cos(b - a)); return a + d * k; }
/* scenery: what stands round each world (static, it does not tilt with the stage) */
function buildScenery(wi) {
  if (SCENW === wi && SCEN) return SCEN; if (SCEN) SCEN.free(); SCENW = wi; var m = M(), rnd = srand(77 + wi * 13), lo = lowest() - 6;
  var minZ = -20, maxZ = 20; ST.P.forEach(function (p) { maxZ = Math.max(maxZ, p.z1 + 10); });
  function tower(x, z, w, h, col, T) { bxp(m, x - w, lo - 20, z - w, x + w, h, z + w, col, T); }
  if (wi === 0) { // Cum City: black towers with lit windows both sides, a red moon, neon
    for (var zz = minZ; zz < maxZ + 40; zz += 7 + rnd() * 6) [-1, 1].forEach(function (sd) { var x = sd * (22 + rnd() * 30), h = 4 + rnd() * 26; tower(x, zz, 2.5 + rnd() * 3, h, '#2a1418', TL('windows')); if (rnd() < 0.4) bxp(m, x - 2, h, zz - 0.2, x + 2, h + 1.6, zz + 0.2, '#ffffff', TL(['n_xxx', 'n_live', 'n_cum', 'n_open', 'n_girls'][Math.floor(rnd() * 5)])); });
    ell(m, 30, 50, maxZ + 60, 14, 14, 2, '#c4121c', 16, 8); }
  else if (wi === 1) { // Ejaculand: the ferris wheel, the carousel, striped tents, balloons
    var fz = maxZ * 0.5, fx = -34; for (var k = 0; k < 16; k++) { var a = k / 16 * 6.283; tub(m, [fx, 18, fz], [fx + Math.cos(a) * 14, 18 + Math.sin(a) * 14, fz], 0.2, 0.2, '#ffe36a', 5); bxp(m, fx + Math.cos(a) * 14 - 1, 18 + Math.sin(a) * 14 - 1.6, fz - 1, fx + Math.cos(a) * 14 + 1, 18 + Math.sin(a) * 14, fz + 1, ['#c4121c', '#ff7ab8', '#4adfff'][k % 3]); } tub(m, [fx - 3, lo, fz], [fx, 18, fz], 0.5, 0.4, '#3a1a2a', 6); tub(m, [fx + 3, lo, fz], [fx, 18, fz], 0.5, 0.4, '#3a1a2a', 6);
    var cx = 30, cz = maxZ * 0.3; tub(m, [cx, lo, cz], [cx, 2, cz], 6, 6, '#c4121c', 14, { T: TL('stripes') }); tub(m, [cx, 2, cz], [cx, 7, cz], 7, 0.3, '#ffe36a', 14, { T: TL('stripes') }); for (var h2 = 0; h2 < 6; h2++) { var a2 = h2 / 6 * 6.283; ell(m, cx + Math.cos(a2) * 4.5, 0.6, cz + Math.sin(a2) * 4.5, 0.6, 0.8, 1.2, '#f1e7d0', 8, 4); }
    for (var b = 0; b < 30; b++) { var bx2 = (rnd() - 0.5) * 80, bz = minZ + rnd() * (maxZ - minZ + 40), by = 4 + rnd() * 18; if (Math.abs(bx2) < 12) bx2 += bx2 < 0 ? -14 : 14; ell(m, bx2, by, bz, 0.7, 0.85, 0.7, ['#c4121c', '#ffe36a', '#4adfff', '#ff7ab8'][b % 4], 8, 6); tub(m, [bx2, by - 0.85, bz], [bx2, by - 3, bz], 0.02, 0.02, '#f1e7d0', 3); }
    for (var tt = 0; tt < 8; tt++) { var tx2 = (tt % 2 ? 1 : -1) * (18 + rnd() * 12), tz = minZ + tt * (maxZ - minZ) / 8; tub(m, [tx2, lo, tz], [tx2, 1, tz], 3, 3, '#ff7ab8', 10, { T: TL('stripes') }); tub(m, [tx2, 1, tz], [tx2, 4, tz], 3.4, 0.1, '#ffe36a', 10, { T: TL('stripes') }); } }
  else { // the Sperm Isles: the sea, islands with palms, rocks
    m.quad([-400, lo + 4, -200], [400, lo + 4, -200], [400, lo + 4, maxZ + 300], [-400, lo + 4, maxZ + 300], [0, 0, 40, 0, 40, 40, 0, 40], TL('water'), [0.5, 0.5, 0.5], [0, 1, 0]);
    for (var is = 0; is < 14; is++) { var ix = (is % 2 ? 1 : -1) * (16 + rnd() * 40), iz = minZ + rnd() * (maxZ - minZ + 60), ir = 3 + rnd() * 5; ell(m, ix, lo + 4, iz, ir, 1.4, ir, '#e8d8a8', 12, 5, { b1: 1.6 });
      for (var pl = 0; pl < 2; pl++) { var px = ix + (rnd() - 0.5) * ir, pz = iz + (rnd() - 0.5) * ir, ph = 4 + rnd() * 3; tub(m, [px, lo + 5, pz], [px + 0.8, lo + 5 + ph, pz], 0.25, 0.18, '#8a6a3a', 6, { T: TL('bark') }); for (var lf = 0; lf < 6; lf++) { var la = lf / 6 * 6.283; tub(m, [px + 0.8, lo + 5 + ph, pz], [px + 0.8 + Math.cos(la) * 2.4, lo + 4.2 + ph, pz + Math.sin(la) * 2.4], 0.35, 0.05, '#3a8a2a', 4); } }
      if (rnd() < 0.5) ell(m, ix + ir, lo + 4.5, iz, 1.4, 1.8, 1.2, '#7a7a74', 7, 4); } }
  SCEN = m.upload(); return SCEN;
}
/* things on the stages themselves: lamp posts and neon in the city, candy canes in Ejaculand, buoys and shells on the isles (they tilt with the stage) */
function stageDeco(m, wi) { var rnd = srand(900 + ST.n);
  ST.P.forEach(function (p, n) { if (p.k !== 'box' || (p.x1 - p.x0) < 3) return; [[p.x0 + 0.3, p.z0 + 0.3], [p.x1 - 0.3, p.z1 - 0.3]].forEach(function (c, k) { if (rnd() < 0.45) return; var x = c[0], z = c[1], y = p.y;
    if (wi === 0) { tub(m, [x, y, z], [x, y + 2.2, z], 0.06, 0.05, '#12040a', 6); ell(m, x, y + 2.3, z, 0.2, 0.14, 0.2, '#ffd27a', 8, 4); }
    else if (wi === 1) { tub(m, [x, y, z], [x, y + 1.6, z], 0.1, 0.1, '#ffffff', 8, { T: TL('stripes') }); tub(m, [x, y + 1.6, z], [x + 0.35, y + 1.9, z], 0.1, 0.1, '#c4121c', 6); }
    else { ell(m, x, y + 0.3, z, 0.35, 0.3, 0.35, ['#ff7a2a', '#ffffff', '#c4121c'][k % 3], 8, 5); } }); });
}

function whoMenu() { KIT.inv({ title: 'Who Rides', cols: 5, slots: Object.keys(WHO).map(function (k) { return { spr: WHO[k].s, name: WHO[k].n, desc: { cumhead: 'Runs inside it like a hamster.', spermaid: 'Swims round the inside of the shell.', greebo: 'Keeps his hat on somehow.', lab: 'The ball needs a wash after.', gloop: 'Gets dizzy. Loves it.' }[k] || '', gold: SV.who === k, def: SV.who === k, tag: SV.who === k ? 'IN' : null, act: SV.who === k ? 'RIDING' : 'RIDE', dis: SV.who === k, fn: function () { SV.who = k; persist(); whoMenu(); } }; }), close: titleMenu }); }
PAINT.water = PAINT.water || function (p) { p.fill('#ffffff'); for (var i = 0; i < 30; i++) p.rect(Math.floor(p.rnd() * 28), Math.floor(p.rnd() * 32), 4, 1, '#e0e8f0'); };
