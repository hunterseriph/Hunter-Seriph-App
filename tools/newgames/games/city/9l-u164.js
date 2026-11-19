/* ---------- update 164 (his playtest) ---------- */

/* ---- water is deadly (his ask): a car that goes into the water sinks and is gone for good (it could be got back into
   and could not be hurt), and Cumhead drowns in deep water ---- */
(function () {
  var sv = stepVehicle; stepVehicle = function (v, inp, dt) {
    if (v.sunk && !v.boat && v.t.cls !== 'boat') { v.dead = 1; v.sinkT = (v.sinkT || 0) + dt; v.vx *= 0.9; v.vz *= 0.9; v.sp = 0; v.y -= dt * 0.9; v.pitch += (0.35 - v.pitch) * dt; v.roll += (0.2 - v.roll) * dt * 0.5;
      if (Math.random() < dt * 14) { var wy = waterY(v.x, v.z); addFx({ k: 'smoke', x: v.x + (Math.random() - 0.5) * 2, y: (wy > -50 ? wy : v.y) + 0.1, z: v.z + (Math.random() - 0.5) * 2, vy: 0.6, life: 0.6 }); }
      if (v === (P && P.veh)) G.ejectV = v;
      if (v.sinkT > 4) { if (v.driver && v.driver !== P) v.driver.dead = 1; v.gone = 1; var i = VEH.indexOf(v); if (i >= 0) VEH.splice(i, 1); }
      return; }
    var ev = exitVehicle; exitVehicle = function () { if (P.veh === v) G.ejectV = v; }; try { sv(v, inp, dt); } finally { exitVehicle = ev; } /* the old sinking code jumped out mid-step, which broke the frame */
    if (!v.sunk && !v.dead && v.t.cls !== 'boat' && v.t.cls !== 'heli' && v.t.cls !== 'plane') { var wy = waterY(v.x, v.z); if (wy > -50 && v.y < wy - 0.25 && groundY(v.x, v.z) < wy - 0.5) { v.sunk = 1; v.hp = 0; sfx.play('hurt'); if (v === (P && P.veh)) G.ejectV = v; } }
  };
  var scm = stepCamera; stepCamera = function (dt) { if (G.ejectV) { if (P.veh === G.ejectV) { exitVehicle(true); P.swim = 1; P.y = Math.min(P.y, waterY(P.x, P.z) - 0.9); } G.ejectV = null; } return scm(dt); }; /* out of a sinking car after the car step (leaving inside it broke the frame) */
  var sf = stepFoot; stepFoot = function (dt) { sf(dt);
    if (P.swim && P.state === 'foot' && !G.cut) { P.drownT = (P.drownT || 0) + dt; P.y -= dt * 0.25 * P.drownT; if (Math.random() < dt * 10) addFx({ k: 'smoke', x: P.x, y: waterY(P.x, P.z) + 0.05, z: P.z, vy: 0.5, life: 0.5 });
      if (P.drownT > 1.6) { P.drownT = 0; P.swim = 0; P.hp = 0; toast('Cumhead can\'t swim.'); wasted(); } }
    else P.drownT = 0; };
})();

/* ---- kerbs: where a pavement square is cut across the corner, standing height and furniture now follow the cut that
   is drawn (the drawn cut is a straight line between the points where the road's edge crosses the square; the height
   followed the real square-cornered road edge, so Cumhead floated near corners and hydrants and posts stood in the road) ---- */
var MESHR = {};
function inPoly(x, z, pts) { var c = false; for (var a = 0, b = pts.length - 1; a < pts.length; b = a++) { var A = pts[a], B = pts[b]; if ((A[1] > z) !== (B[1] > z) && x < (B[0] - A[0]) * (z - A[1]) / (B[1] - A[1] + 1e-9) + A[0]) c = !c; } return c; }
function clipQ(C, f, sign) { var out = []; for (var q = 0; q < 4; q++) { var a = C[q], b = C[(q + 1) % 4], fa = f[q] * sign, fb = f[(q + 1) % 4] * sign; if (fa >= 0) out.push(a); if ((fa >= 0) !== (fb >= 0)) { var t2 = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t2, a[1] + (b[1] - a[1]) * t2]); } } return out; }
/* 1 = the drawn surface here is raised pavement, 0 = it is drawn flat (road), -1 = not a cut square (leave it) */
function meshRaise(x, z) { var i = Math.floor(x / CT), j = Math.floor(z / CT); if (i < 0 || j < 0 || i >= MW || j >= MH) return -1; var t = j * MW + i, M = MESHR[t];
  if (M === undefined) { var k = KM[t]; M = null;
    if (k === K_PAVE || k === K_ROAD) { var ax = i * CT, az = j * CT, C = [[ax, az], [ax + CT, az], [ax + CT, az + CT], [ax, az + CT]], f = C.map(function (p) { return roadF(p[0], p[1]); }), allIn = f.every(function (v) { return v >= 0; }), allOut = f.every(function (v) { return v < 0; });
      var paveN = k === K_ROAD && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (q) { var ni = i + q[0], nj = j + q[1]; return ni >= 0 && nj >= 0 && ni < MW && nj < MH && KM[nj * MW + ni] === K_PAVE; });
      if (k === K_PAVE) { if (allOut) M = { v: 0 }; else if (!allIn) M = { p: clipQ(C, f, 1) }; else { var g = f.map(function (v) { return v - PAVEW; }); if (!g.every(function (v) { return v <= 0; }) && !g.every(function (v) { return v > 0; })) M = { p: clipQ(C, g, -1), outer: 1 }; } }
      else { if (allOut) M = { v: 0 }; else if (allIn) M = { v: 0 }; else M = paveN ? { p: clipQ(C, f, 1) } : { v: 0 }; } }
    MESHR[t] = M; }
  if (!M) return -1; if (M.v !== undefined) return M.v; return inPoly(x, z, M.p) ? 1 : M.outer ? -1 : 0; }
(function () { var sy = standY; standY = function (x, z, y) { var g = sy(x, z, y); if (G.interior || window.NOPAVE) return g; var r = meshRaise(x, z); if (r < 0) return g; var gy = groundY(x, z);
    if (g > gy + 0.2 || g < gy - 0.05) return g; /* a deck, a box, a bridge: leave it */ return r ? gy + 0.15 : gy; };
  if (typeof raisedAt === 'function') { var ra = raisedAt; raisedAt = function (x, z) { var r = meshRaise(x, z); return r < 0 ? ra(x, z) : !!r; }; }
  function paveSafe(x, z) { for (var q = 0; q < 5; q++) { var px = x + [0, 0.45, -0.45, 0, 0][q], pz = z + [0, 0, 0, 0.45, -0.45][q]; if (meshRaise(px, pz) === 0) return false; } return true; }
  var bs = buildStreet; buildStreet = function () { var k0 = kAt; kAt = function (x, z) { var k = k0(x, z); return k === K_PAVE && !paveSafe(x, z) ? K_ROAD : k; }; try { return bs.apply(this, arguments); } finally { kAt = k0; } };
})();

/* ---- Ejaculand: every ride can be ridden (his ask: some would not let you): the teacups, the swings, the pirate ship,
   the helter skelter, the dodgems and the ghost train join the coaster, the wheel, the drop tower and the carousel; the
   place you board from is pushed out of anything solid the first time you come near, and has a wider reach ---- */
(function () {
  RIDEN.teacups = ['THE CUPS OF CUM', 22]; RIDEN.swings = ['THE CHAIR SWINGS', 24]; RIDEN.pirate = ['THE PIRATE SHIP', 24]; RIDEN.helter = ['THE HELTER SKELTER', 12]; RIDEN.dodgems = ['THE DODGEMS', 26]; RIDEN.ghost = ['THE GHOST TRAIN', 30];
  var ENTRY = { teacups: [0, 13.5], swings: [0, 11.5], pirate: [0, 6], helter: [0, 5.5], dodgems: [0, 9.5], ghost: [0, 9.5], carousel: [0, 11.5], dropper: [0, 4.5] };
  var ru = rideUses; rideUses = function () { var U = ru(); U.forEach(function (u) { if (!/^RIDE /.test(u.label || '')) return; u.r = 4.5; u.ride = 1; }); 
    U.forEach(function (u) { var k = Object.keys(RIDEN).filter(function (q) { return u.label === 'RIDE ' + RIDEN[q][0] + ' ($5)'; })[0]; if (!k || !ENTRY[k]) return; poisOf(k).forEach(function (p) { if (Math.hypot(u.x - p.x, u.z - p.z) < 16) { u.x = p.x + ENTRY[k][0]; u.z = p.z + ENTRY[k][1]; } }); });
    return U; };
  var sf = stepFoot; stepFoot = function (dt) { sf(dt); if (!G.uses || G.interior) return; G.uses.forEach(function (u) { if (!u.ride || u.fixed || dist2(u.x, u.z, P.x, P.z) > 60 * 60) return; u.fixed = 1; var y = groundY(u.x, u.z);
      for (var n = 0; n < 6; n++) { var c = collide(u.x, u.z, 0.9, y, 1.8); if (!c.hit) break; u.x += c.x * 1.4; u.z += c.z * 1.4; } }); };
  var rc = rideCam; rideCam = function (dt) { var R0 = G.ride, k = R0.k; if (!{ teacups: 1, swings: 1, pirate: 1, helter: 1, dodgems: 1, ghost: 1 }[k]) return rc(dt);
    var p = R0.p, y = p.h, t = R0.t + dt, e, at; R0.t = t;
    if (k === 'teacups') { var a = t * 0.5, cx = p.x + Math.cos(a) * 6.5, cz = p.z + Math.sin(a) * 6.5, s = t * 2.2; e = [cx + Math.cos(s) * 0.8, y + 2.1, cz + Math.sin(s) * 0.8]; at = [cx + Math.cos(s + 1.2) * 20, y + 1.5, cz + Math.sin(s + 1.2) * 20]; }
    else if (k === 'swings') { var sp = Math.min(1, t / 4) * Math.min(1, (RIDEN.swings[1] - t) / 3 + 0.2), a2 = t * 1.4 * Math.max(0.3, sp), out = 5 + 4 * sp; e = [p.x + Math.cos(a2) * out, y + 5.8 + 2.5 * sp, p.z + Math.sin(a2) * out]; at = [p.x + Math.cos(a2 + 0.5) * 40, y + 2, p.z + Math.sin(a2 + 0.5) * 40]; }
    else if (k === 'pirate') { var sw = Math.sin(t * 0.9) * Math.min(1, t / 6), ang = sw * 1.0; e = [p.x + Math.sin(ang) * 9.5 + 5 * Math.cos(ang) * 0.0, y + 11 - Math.cos(ang) * 9.2, p.z]; at = [e[0] + Math.cos(ang) * 30, e[1] + Math.sin(ang) * 20 - 4, p.z + 6]; }
    else if (k === 'helter') { var u = Math.min(1, t / 10), a3 = u * 6.283 * 2.6, h = y + 16.6 - u * 15.6, r = 4.1 - u * 0.8; e = [p.x + Math.cos(a3) * r, h, p.z + Math.sin(a3) * r]; at = [p.x + Math.cos(a3 + 0.6) * 12, h - 2, p.z + Math.sin(a3 + 0.6) * 12]; if (t > 10.2) { R0.t = 99; } }
    else if (k === 'dodgems') { var dx = Math.sin(t * 0.7) * 8 + Math.sin(t * 1.9) * 1.2, dz = Math.sin(t * 0.5 + 1) * 4.5, hd = Math.atan2(Math.cos(t * 0.7) * 5.6, Math.cos(t * 0.5 + 1) * 2.25); e = [p.x + dx, y + 1.3, p.z + dz]; at = [e[0] + Math.sin(hd) * 10, y + 1, e[2] + Math.cos(hd) * 10]; if (Math.sin(t * 2.3) > 0.97) CAM.shake = 0.3; }
    else { var path = [[0, 9], [0, 4], [-6, 4], [-6, -4], [0, -4], [6, -4], [6, 4], [2, 4], [2, 9]], L = path.length - 1, f = Math.min(L - 0.001, t / RIDEN.ghost[1] * L), i = Math.floor(f), q = f - i, A = path[i], B = path[i + 1], C = path[Math.min(L, i + 2)];
      e = [p.x + A[0] + (B[0] - A[0]) * q, y + 1.4, p.z + A[1] + (B[1] - A[1]) * q]; at = [p.x + C[0], y + 1.3 + Math.sin(t * 3) * 0.2, p.z + C[1]]; G.ghostRide = 1; if (Math.random() < dt * 0.4) { CAM.shake = 0.5; sfx.play('hurt'); } }
    CAM.x = e[0]; CAM.y = e[1]; CAM.z = e[2]; CAM.at = at; P.x = R0.back[0]; P.z = R0.back[1];
    var any = KIT.pressed('a') || KIT.pressed('b') || KIT.pressed('x') || KIT.pressed('y'); if (R0.t > RIDEN[k][1] || (any && R0.t > 1.5)) { G.ride = null; G.ghostRide = 0; G.fade = 0.8; P.y = groundY(P.x, P.z); CAM.x = P.x - 4; CAM.z = P.z - 4; CAM.y = P.y + 3; toast(pick(['What a ride.', 'Your legs have gone to jelly.', 'Steve waves at you. He always waves.'])); } };
})();

/* ---- Steve rebuilt from his drawing (tools/load-legacy/steve0.svg; he said the model looked all wrong and the statue
   worse): a black droplet whose tip rises and curls over, a thick red outline all round (a red shell drawn inside out
   behind him), red eyes and brows, the big open grin with a red tongue, thin black arms and legs outlined in red,
   one hand up waving, the other out, flat black feet. The statue in the park is the same Steve, three times the size,
   on a black and red plinth ---- */
HIPAINT.f_steve2 = face(function (g) { g.fillStyle = '#0a0506'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#d81820'; g.beginPath(); g.ellipse(46, 54, 9, 14, 0, 0, 6.3); g.ellipse(82, 54, 9, 14, 0, 0, 6.3); g.fill();
  g.strokeStyle = '#c4121c'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(34, 34); g.quadraticCurveTo(45, 24, 56, 34); g.moveTo(72, 34); g.quadraticCurveTo(83, 24, 94, 34); g.stroke();
  g.beginPath(); g.moveTo(32, 76); g.quadraticCurveTo(64, 72, 96, 74); g.quadraticCurveTo(92, 108, 64, 110); g.quadraticCurveTo(36, 108, 32, 76); g.closePath(); g.fillStyle = '#1a0608'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#c4121c'; g.stroke();
  g.fillStyle = '#8a0c12'; g.beginPath(); g.ellipse(64, 100, 14, 6, 0, 3.14, 6.28); g.fill(); }, '#0a0506');
var STEVE = null;
function steveBuild() { if (STEVE) return STEVE; var BK = '#0a0506', RD = '#c4121c';
  function body(m, g, col, face, mt) { mt = mt || m; var fo = face ? { face: 'f_steve2', fz: 0.25, fw: 0.82, fh: 0.82, fdv: -0.06 } : {}; ell(m, 0, 0.74, 0, 0.42 + g, 0.45 + g, 0.36 + g, col, 18, 11, fo);
    var tp = [[0.02, 1.02, 0, 0.3], [-0.07, 1.28, -0.01, 0.19], [-0.08, 1.46, -0.02, 0.1], [-0.01, 1.6, -0.03, 0.035], [0.07, 1.66, -0.03, 0.0]];
    for (var k = 0; k < tp.length - 1; k++) { var A = tp[k], B = tp[k + 1]; tub(mt, [A[0], A[1], A[2]], [B[0], B[1] + (k === tp.length - 2 ? g * 0.6 : 0), B[2]], A[3] + g * (k ? 0.6 : 1), Math.max(0.006, B[3] + g * (k === tp.length - 2 ? 0.4 : 0.6)), col, 12, { cap: k === tp.length - 2 }); if (k) ell(m, A[0], A[1], A[2], A[3] + g * 0.6, A[3] + g * 0.6, A[3] + g * 0.6, col, 10, 5); }
    g = g * 0.55; [-1, 1].forEach(function (s) { tub(mt, [s * 0.15, 0.36, 0.02], [s * 0.19, 0.08, 0.04], 0.05 + g, 0.045 + g, col, 8); ell(m, s * 0.21, 0.05, 0.1, 0.13 + g, 0.05 + g, 0.17 + g, col, 12, 5); });
    tub(mt, [0.38, 0.66, 0.04], [0.68, 0.6, 0.06], 0.045 + g, 0.04 + g, col, 8); tub(mt, [0.68, 0.6, 0.06], [0.92, 0.63, 0.06], 0.04 + g, 0.036 + g, col, 8); hand(m, 0.98, 0.64, 0.06, g, col, 0, mt); }
  function hand(m, x, y, z, g, col, up, mt) { mt = mt || m; ell(m, x, y, z, 0.065 + g, 0.06 + g, 0.06 + g, col, 10, 6); for (var f = 0; f < 3; f++) { var a = (f - 1) * 0.5; if (up) tub(mt, [x + Math.sin(a) * 0.04, y + 0.04, z], [x + Math.sin(a) * 0.09, y + 0.13, z + 0.01], 0.022 + g, 0.018 + g, col, 6, { cap: 1 }); else tub(mt, [x + 0.04, y + Math.sin(a) * 0.04, z], [x + 0.12, y + Math.sin(a) * 0.07, z + 0.01], 0.022 + g, 0.018 + g, col, 6, { cap: 1 }); } }
  function wave(m, g, col, mt) { mt = mt || m; tub(mt, [0, 0, 0], [-0.2, 0.16, 0.02], 0.045 + g, 0.04 + g, col, 8); tub(mt, [-0.2, 0.16, 0.02], [-0.22, 0.42, 0.04], 0.04 + g, 0.036 + g, col, 8); hand(m, -0.22, 0.48, 0.04, g, col, 1, mt); }
  var b = new R3.Mesh(), h = new R3.Mesh(), ht = new R3.Mesh(), w = new R3.Mesh(), wh = new R3.Mesh(), wht = new R3.Mesh(); body(b, 0, BK, 1); body(h, 0.03, RD, 0, ht); wave(w, 0, BK); wave(wh, 0.017, RD, wht); /* tubes wind the other way to ellipsoids, so their shells are culled the other way */
  STEVE = { b: b.upload(), h: h.upload(), ht: ht.upload(), w: w.upload(), wh: wh.upload(), wht: wht.upload() }; return STEVE; }
function drawSteve(x, y, z, yaw, sc, t, o) { var S = steveBuild(), base = MD(x, y, z, yaw, 0, 0, sc); o = o || {};
  R3.draw(S.h, ATT, { m: base, cull: 2, lit: false }); R3.draw(S.ht, ATT, { m: base, cull: 1, lit: false }); R3.draw(S.b, ATT, { m: base, rim: 0.4 });
  var wm = MM(base, MD(-0.38, 0.8, 0.04, 0, 0, 0.35 * Math.sin(t * 5))); R3.draw(S.wh, ATT, { m: wm, cull: 2, lit: false }); R3.draw(S.wht, ATT, { m: wm, cull: 1, lit: false }); R3.draw(S.w, ATT, { m: wm, rim: 0.4 }); }
(function () {
  var dp = drawPerson; drawPerson = function (rig, x, y, z, yaw, Q, o) { if (rig === 'steve' || (rig && rig === RIGS.steve)) { o = o || {}; var bob = Math.abs(Math.sin(G.t * 6 + x)) * 0.06; drawSteve(x, y + bob, z, yaw, (o.sc || 1) * 1.05, G.t + x, o);
      if (!o.noShadow) R3.draw(RIGS.shadowC, ATT, { m: MD(x, groundY(x, z) + 0.02, z, 0, 0, 0, 1.1), soft: 1, lit: false, alpha: 0.7 }); return {}; } return dp(rig, x, y, z, yaw, Q, o); };
  LMBUILD.steve = function (o, p) { var y = p.h; boxT(o.m, p.x - 2.6, y, p.z - 2.6, p.x + 2.6, y + 0.5, p.z + 2.6, { wall: 'stone', top: 'stone', u: 1, v: 1 }); boxC(o.m, p.x - 2.0, y + 0.5, p.z - 2.0, p.x + 2.0, y + 1.9, p.z + 2.0, '#12040a'); boxC(o.m, p.x - 2.2, y + 1.9, p.z - 2.2, p.x + 2.2, y + 2.15, p.z + 2.2, '#c4121c');
    boxC(o.glow, p.x - 1.3, y + 0.85, p.z + 2.01, p.x + 1.3, y + 1.45, p.z + 2.03, '#c4121c'); if (typeof sign === 'function') { /* the plaque says STEVE */ }
    var sc = 3.4, mb = MD(p.x, y + 2.15, p.z, 0, 0, 0, sc), S = steveBuild();
    o.parts.push({ m: S.h, f: function () { return mb; }, cull: 2, lit: false }); o.parts.push({ m: S.ht, f: function () { return mb; }, cull: 1, lit: false });
    o.parts.push({ m: S.b, f: function () { return mb; }, rim: 0.5 });
    var wm = MM(mb, MD(-0.38, 0.8, 0.04, 0, 0, 0.25));
    o.parts.push({ m: S.wh, f: function () { return wm; }, cull: 2, lit: false }); o.parts.push({ m: S.wht, f: function () { return wm; }, cull: 1, lit: false });
    o.parts.push({ m: S.w, f: function () { return wm; }, rim: 0.5 });
    addBox(p.x - 2.6, p.z - 2.6, p.x + 2.6, p.z + 2.6, y, y + 2.15); addPost(p.x, p.z, 1.6, y + 2.15, y + 8); o.r = 50; o.lights = [{ x: p.x, y: y + 4, z: p.z + 4, c: [1, 0.2, 0.25], r: 14 }]; };
})();

/* ---- smoking (his ask: nowhere near correct, people tossed the joint in the air): the joint is drawn in the smoking
   hand itself (the hand matrix the rig just drew), held between the fingers, and smoke comes off its lit end ---- */
function mPt(M, x, y, z) { return [M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]]; }
window.drawJoint = function (x, y, z, a, t) { var H = window.LASTHAND; if (!H) return;
  if (!RIGS.jointM2) { var m = new R3.Mesh(); tub(m, [0, 0, -0.03], [0, 0, 0.11], 0.011, 0.016, '#f1e7d0', 6, { cap: 1, cap0: 1 }); tub(m, [0, 0, 0.11], [0, 0, 0.122], 0.016, 0.016, '#ff5a1e', 6, { cap: 1 }); RIGS.jointM2 = m.upload(); }
  var J = MM(H, MD(0, 0.03, 0.05, 0, -0.4, 0)); R3.draw(RIGS.jointM2, ATT, { m: J });
  var tip = mPt(J, 0, 0, 0.125); if (Math.random() < 0.1) addFx({ k: 'puff', x: tip[0], y: tip[1], z: tip[2], vy: 0.3, vx: 0, vz: 0, life: 1.6, s0: 0.04, grow: 0.22, col: [0.9, 0.9, 0.9], a0: 0.3 }); addFx({ k: 'ember', x: tip[0], y: tip[1], z: tip[2], life: 0.02 }); };

/* ---- THE FAPLING HOOK (his ask): a grappling hook on a white line. Aim (LB) and fire (X) like a gun, or fire
   without aiming along the camera. What it catches decides what happens:
     a wall or a box -> you are hauled to it and up over the top onto the roof (scale any building);
     a car or a truck -> you are hauled onto its roof and ride it (A jumps off, Y drags the driver out and takes it);
     a helicopter or a plane -> you are hauled up, throw the pilot out and take it;
     a person -> they are yanked off their feet to you.
   Everyone has it (no ammo). Roofs of buildings can now be stood on (standY counts the building under you once you are
   up there). ---- */
WPN.hook = { n: 'Fapling Hook', hook: 1, dmg: 6, rate: 0.55, range: 70, mesh: 'hookM', cost: 0, ammo: 'hook' }; WORDER.splice(WORDER.indexOf('sausage') + 1, 0, 'hook');
(function () {
  /* update 166: the hook is earned now (Shithead Laboozie's job) and takes claws (ammo) */
  var bcr = buildCityRigs; buildCityRigs = function () { var r = bcr.apply(this, arguments); var m = new R3.Mesh(); boxC(m, -0.035, -0.03, -0.06, 0.035, 0.06, 0.2, '#e8e2d6'); boxC(m, -0.026, -0.13, -0.03, 0.026, 0.0, 0.03, '#1a1a1c'); boxC(m, -0.045, -0.04, 0.2, 0.045, 0.07, 0.25, '#c4121c');
    [-1, 1].forEach(function (s) { tub(m, [s * 0.02, 0.02, 0.25], [s * 0.06, 0.05, 0.32], 0.012, 0.008, '#d8d8dc', 5, { cap: 1 }); }); tub(m, [0, 0.06, 0.25], [0, 0.1, 0.32], 0.012, 0.008, '#d8d8dc', 5, { cap: 1 }); RIGS.hookM = m.upload();
    var r2 = new R3.Mesh(); tub(r2, [0, 0, 0], [0, 0, 1], 1, 1, '#ffffff', 6); RIGS.ropeM = r2.upload();
    var h2 = new R3.Mesh(); ell(h2, 0, 0, 0, 0.07, 0.07, 0.1, '#d8d8dc', 8, 5); [0, 2.1, 4.2].forEach(function (a) { tub(h2, [0, 0, 0.05], [Math.cos(a) * 0.14, Math.sin(a) * 0.14, -0.06], 0.02, 0.012, '#d8d8dc', 5, { cap: 1 }); }); RIGS.hookHeadM = h2.upload(); return r; };
  /* standing on roofs */
  var sy = standY; standY = function (x, z, y) { var g = sy(x, z, y); if (G.interior || y === undefined) return g; var L = near(BGRID, x, z, 0.5);
    for (var k = 0; k < L.length; k++) { var b = L[k]; if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) continue; var t = b.y0 + b.h; if (t <= y + 0.7 && t > g) g = t; } return g; };
  function roofOf(x, z) { var L = near(BGRID, x, z, 1.2); for (var k = 0; k < L.length; k++) { var b = L[k]; if (x > b.x0 - 1 && x < b.x1 + 1 && z > b.z0 - 1 && z < b.z1 + 1) return b; } return null; }
  function boxOf(x, y, z) { var L = near(SOLID, x, z, 1.2); for (var k = 0; k < L.length; k++) { var b = L[k]; if (b.o && b.o.deck) continue; if (x > b.x0 - 0.6 && x < b.x1 + 0.6 && z > b.z0 - 0.6 && z < b.z1 + 0.6 && y > b.y0 - 0.5 && y < b.y1 + 0.5) return b; } return null; }
  function hand() { var H = window.PHAND; return H && P.state === 'foot' ? mPt(MM(H, MD(0, 0, 0, 0, -Math.PI / 2, 0)), 0, 0.02, 0.32) : muzzle(P); }
  window.HOOK = null;
  window.__fireHook = function () { fireHook(); }; window.__hookVeh = function (v) { HOOK = { mode: "pull", v: v, l: [0, v.t.hgt * 0.9, 0], hit: { veh: v }, at: [v.x, v.y, v.z], from: hand(), s: 0, len: 1 }; }; /* for tests */ function fireHook() { if (!SV.ammo || (SV.ammo.hook || 0) <= 0) { toast('Out of hook claws. Saba sells them.'); sfx.play('back'); return; } SV.ammo.hook--; var R = WPN.hook.range, c = [CAM.x, CAM.y, CAM.z], f = R3.cam.fwd, d, t, hit = null, pt;
    if (P.target && !P.target.dead) { var T0 = P.target; pt = [T0.x, (T0.y || 0) + 1.1, T0.z]; hit = { ped: T0 }; }
    else { d = [f[0], f[1], f[2]]; var wt = rayBlock(c[0], c[1], c[2], c[0] + d[0] * R, c[1] + d[1] * R, c[2] + d[2] * R); hit = rayHit(c, d, R * wt, P); t = hit ? hit.t : R * wt; pt = [c[0] + d[0] * t, c[1] + d[1] * t, c[2] + d[2] * t]; if (!hit || !hit.veh) { /* help with vehicles: anything close to the line of aim is caught */ var bv = null, bs = 0.975; VEH.forEach(function (v) { if (v === P.veh || v.dead) return; var vx = v.x - c[0], vy = v.y + v.t.hgt * 0.7 - c[1], vz = v.z - c[2], L = Math.hypot(vx, vy, vz); if (L > R || L < 3) return; var dot = (vx * d[0] + vy * d[1] + vz * d[2]) / L; if (dot > bs && (!hit || L < t + 2)) { bs = dot; bv = v; } }); if (bv) { hit = { veh: bv }; pt = [bv.x, bv.y + bv.t.hgt * 0.9, bv.z]; } }
      if (!hit && wt >= 0.999) hit = { miss: 1 }; else if (!hit) hit = { wall: 1 }; }
    var m = hand(); HOOK = { mode: 'fly', from: m, at: pt, s: 0, len: Math.hypot(pt[0] - m[0], pt[1] - m[1], pt[2] - m[2]), hit: hit };
    if (hit.veh) { var v = hit.veh, ca = Math.cos(v.a), sa = Math.sin(v.a), dx = pt[0] - v.x, dz = pt[2] - v.z; HOOK.v = v; HOOK.l = [dx * ca - dz * sa, pt[1] - v.y, dx * sa + dz * ca]; }
    sfx.play('jump'); P.cool = WPN.hook.rate; P.kick = 1; }
  function anchor() { var H = HOOK; if (H.v) { var v = H.v, ca = Math.cos(v.a), sa = Math.sin(v.a), l = H.l; return [v.x + l[0] * ca + l[2] * sa, v.y + l[1], v.z - l[0] * sa + l[2] * ca]; } if (H.hit.ped && !H.yanked) { var p = H.hit.ped; return [p.x, (p.y || 0) + 1.1, p.z]; } return H.at; }
  function done() { HOOK = null; P.vy = 0; }
  var sw = stepWeapon; stepWeapon = function (dt, mi) { var W0 = WPN[P.wpn];
    if (P.wpn !== 'hook' || HOOK) { if (P.wpn === 'hook') { P.cool -= dt; P.kick = Math.max(0, P.kick - dt * 6); P.aim = (KIT.held('lb') || gpHeld(6)) ? 1 : 0; } else sw(dt, mi); return; }
    sw(dt, mi); /* aiming and lock-on as for a gun; the fire button is ours */ };
  /* fire is read here so it works with the aim, the trigger and the touch button */
  var sf = stepFoot; stepFoot = function (dt) {
    if (!SV.hookTold && G.t > 6 && !G.cut && !G.mission) { SV.hookTold = 1; toast('New: the Fapling Hook. Swap to it, aim and fire at a wall, a car, a chopper or a person.', 6); }
    if (P.wpn === 'hook' && !HOOK && P.state === 'foot' && !G.cut && !G.talk && !P.swim && P.cool <= 0 && (KIT.pressed('x') || gpPressed(7))) fireHook();
    if (!HOOK) { if (P.roofV) return rideRoof(dt); return sf(dt); }
    var H = HOOK, A = anchor();
    if (H.mode === 'fly') { H.s += dt * 110; H.from = hand(); if (H.s >= H.len) { H.s = H.len;
        if (H.hit.miss) { H.mode = 'back'; } else if (H.hit.ped) { H.mode = 'yank'; H.yanked = 1; var p = H.hit.ped; p.ctl = function () {}; p.state = 'flee'; sfx.play('hit'); } else { H.mode = 'pull'; sfx.play('hit'); CAM.shake = 0.2; } }
      sf(dt); return; }
    if (H.mode === 'back') { H.s -= dt * 140; H.from = hand(); if (H.s <= 0) done(); sf(dt); return; }
    if (H.mode === 'yank') { var p2 = H.hit.ped, m = hand(), dx = m[0] - p2.x, dz = m[2] - p2.z, dd = Math.hypot(dx, dz); H.from = m;
      if (dd < 1.3 || p2.dead) { p2.ctl = null; p2.y = groundY(p2.x, p2.z); hurtPed(p2, 12, P, [dx / (dd || 1), 0, dz / (dd || 1)]); done(); } else { var spd = Math.min(dd, dt * 20); p2.x += dx / dd * spd; p2.z += dz / dd * spd; p2.y = groundY(p2.x, p2.z) + Math.sin(Math.min(1, dd / 12) * 3.14) * 0.6; H.at = [p2.x, p2.y + 1.1, p2.z]; }
      sf(dt); return; }
    if (H.mode === 'pull') { var tx = A[0], ty = A[1] - 1.1, tz = A[2], ex = tx - P.x, ey = ty - P.y, ez = tz - P.z, L = Math.hypot(ex, ey, ez); H.from = hand(); H.at = A; P.a = Math.atan2(ex, ez); P.vy = 0; P.ground = 0;
      if (L < 1.2) { arrive(H); return; }
      var st = Math.min(L, dt * (H.v ? 30 : 24)); P.x += ex / L * st; P.y += ey / L * st; P.z += ez / L * st; P.hookPull = 1; return; }
    if (H.mode === 'climb') { var c2 = H.climb; c2.t += dt; var k = Math.min(1, c2.t / 0.45); P.x = c2.a[0] + (c2.b[0] - c2.a[0]) * k; P.z = c2.a[2] + (c2.b[2] - c2.a[2]) * k; P.y = c2.a[1] + (c2.b[1] - c2.a[1]) * Math.min(1, k * 1.6); if (k >= 1) { P.y = c2.b[1]; P.ground = 1; P.hookPull = 0; done(); } return; }
    sf(dt); };
  function arrive(H) { P.hookPull = 0; var hit = H.hit;
    if (H.v) { var v = H.v; if (v.t.cls === 'heli' || v.t.cls === 'plane' || v.t.cls === 'boat') { if (v.driver && v.driver !== P) { var d = v.driver; d.inVeh = null; v.driver = null; d.x = v.x + 1.5; d.z = v.z; d.y = v.y; d.vy = 0; hurtPed(d, v.t.cls === 'boat' ? 20 : 999, P, [1, 0, 0]); crime('steal', v.x, v.z); } done(); takeSeat(v, true); toast('Yoink. ' + (v.t.n || 'It') + ' is yours.'); return; }
      done(); P.roofV = v; var ca = Math.cos(v.a), sa = Math.sin(v.a), dx = P.x - v.x, dz = P.z - v.z; P.roofL = [clamp(dx * ca - dz * sa, -v.t.wid * 0.3, v.t.wid * 0.3), clamp(dx * sa + dz * ca, -v.t.len * 0.25, v.t.len * 0.25)]; toast('On the roof. A jumps off, Y takes it.'); return; }
    /* a wall: over the top */
    var b = roofOf(H.at[0], H.at[2]), top = null, bx = null;
    if (b) top = b.y0 + b.h; else { bx = boxOf(H.at[0], H.at[1], H.at[2]); if (bx) top = bx.y1; }
    if (top !== null && top - H.at[1] < 60) { var B = b || bx, cx = clamp(H.at[0], B.x0 + 0.8, B.x1 - 0.8), cz = clamp(H.at[2], B.z0 + 0.8, B.z1 - 0.8);
      if (top - P.y > 1.5) { HOOK = { mode: 'pull', at: [P.x + (cx - P.x) * 0.15, top + 1.2, P.z + (cz - P.z) * 0.15], hit: { wall: 1 }, from: hand(), s: 0, len: 1 }; HOOK.at[0] = H.at[0]; HOOK.at[2] = H.at[2]; HOOK.wallUp = 1; return; }
      HOOK = { mode: 'climb', climb: { t: 0, a: [P.x, P.y, P.z], b: [cx, top, cz] }, hit: { wall: 1 }, at: [cx, top, cz], from: hand(), s: 0, len: 0 }; HOOK.s = 0; sfx.play('jump'); return; }
    done(); }
  function rideRoof(dt) { var v = P.roofV; if (!v || v.dead || v.gone || VEH.indexOf(v) < 0) { P.roofV = null; return; } var ca = Math.cos(v.a), sa = Math.sin(v.a), l = P.roofL;
    P.x = v.x + l[0] * ca + l[1] * sa; P.z = v.z - l[0] * sa + l[1] * ca; P.y = v.y + v.t.hgt + 0.05; P.vy = 0; P.ground = 1; P.a = v.a; P.vx = v.vx || 0; P.vz = v.vz || 0;
    if (KIT.pressed('a')) { P.roofV = null; P.vy = 6.5; P.ground = 0; P.y += 0.2; sfx.play('jump'); return; }
    if (KIT.pressed('y') || gpPressed(3)) { P.roofV = null; if (v.driver && v.driver !== P && typeof jackStart === 'function') { P.y = groundY(P.x, P.z); jackStart(v); } else takeSeat(v, false); return; }
    if (Math.abs(v.sp || 0) > 4 && Math.random() < dt * 0.02 * Math.abs(v.sp)) { P.roofV = null; P.vy = 3; P.ground = 0; toast('Thrown off the roof!'); } }
  /* the line, the claw */
  function line(a, b, r) { var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-3, z = [dx / L, dy / L, dz / L], up = Math.abs(z[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], x = [up[1] * z[2] - up[2] * z[1], up[2] * z[0] - up[0] * z[2], up[0] * z[1] - up[1] * z[0]], xl = Math.hypot(x[0], x[1], x[2]); x = [x[0] / xl, x[1] / xl, x[2] / xl]; var y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return [x[0] * r, x[1] * r, x[2] * r, 0, y[0] * r, y[1] * r, y[2] * r, 0, dx, dy, dz, 0, a[0], a[1], a[2], 1]; }
  window.drawHookLine = function () { var H = HOOK; if (!H || !RIGS.ropeM) return; var a = H.from || hand(), A = H.mode === 'fly' || H.mode === 'back' ? (function () { var e = H.at, L = Math.hypot(e[0] - a[0], e[1] - a[1], e[2] - a[2]) || 1, k = Math.min(1, H.s / L); return [a[0] + (e[0] - a[0]) * k, a[1] + (e[1] - a[1]) * k, a[2] + (e[2] - a[2]) * k]; })() : H.mode === 'climb' ? null : anchor();
    if (!A) return; R3.draw(RIGS.ropeM, ATT, { m: line(a, A, 0.018), lit: false, tint: [1.2, 1.2, 1.2] }); R3.draw(RIGS.hookHeadM, ATT, { m: MD(A[0], A[1], A[2], Math.atan2(A[0] - a[0], A[2] - a[2]), 0, 0, 1), lit: false }); };
  var dpl = drawPlayer; drawPlayer = function () { dpl(); window.PHAND = window.LASTHAND; drawHookLine(); };
  var po = poseOfPlayer; poseOfPlayer = function () { var Q = po(); if (P.wpn === 'hook' && (P.aim || HOOK)) poseAim(Q, 'handgun', P.kick || 0); if (P.hookPull && HOOK && HOOK.mode === 'pull') { Q.hip[0] = 0.6; Q.hip[1] = -0.2; Q.kn[0] = 1.1; Q.kn[1] = 0.4; } if (P.roofV) { Q.y = -0.25; Q.lean = 0.3; Q.kn[0] = Q.kn[1] = 0.7; Q.hip[0] = Q.hip[1] = 0.6; } return Q; };
  var wd = window.wasted; if (typeof wasted === 'function') { var w0 = wasted; wasted = function () { HOOK = null; P.roofV = null; P.hookPull = 0; return w0.apply(this, arguments); }; }
})();
(function () { var wi = wIcon; wIcon = function (ctx, id, x, y, s) { if (id !== 'hook') return wi(ctx, id, x, y, s);
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 16, s / 16); ctx.fillStyle = '#12040a'; ctx.fillRect(1, 7, 9, 5); ctx.fillRect(3, 11, 3, 4); ctx.fillStyle = '#e8e2d6'; ctx.fillRect(2, 8, 7, 3); ctx.fillStyle = '#c4121c'; ctx.fillRect(9, 7, 2, 5);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(11, 9.5); ctx.quadraticCurveTo(13, 4, 14, 2); ctx.stroke(); ctx.strokeStyle = '#d8d8dc'; ctx.beginPath(); ctx.moveTo(12.5, 1); ctx.lineTo(14, 2.5); ctx.lineTo(15.5, 1); ctx.moveTo(14, 2.5); ctx.lineTo(14, 4); ctx.stroke(); ctx.restore(); }; })();

/* ---- the townsfolk's faces repainted (his ask: NPC models should look better): shaded skin, blushed cheeks, almond eyes
   with whites, a coloured iris, pupil and two catchlights under a lash line, tapered brows, a shaded nose, two-tone lips.
   Same people, same colours and options (shades, moustache, beard, eye colour) as before ---- */
function shadeHex(h, k) { var n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function f(c) { return Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k))); } return '#' + [f(r), f(g), f(b)].map(function (c) { return (c < 16 ? '0' : '') + c.toString(16); }).join(''); }
function personFace2(skin, o) { o = o || {}; return face(function (g) {
  var rg = g.createRadialGradient(64, 58, 18, 64, 66, 86); rg.addColorStop(0, shadeHex(skin, 0.06)); rg.addColorStop(0.7, skin); rg.addColorStop(1, shadeHex(skin, -0.22)); g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  g.globalAlpha = 0.22; g.fillStyle = '#ff6a7a'; g.beginPath(); g.ellipse(34, 84, 13, 8, 0, 0, 6.3); g.ellipse(94, 84, 13, 8, 0, 0, 6.3); g.fill(); g.globalAlpha = 1;
  var iris = o.eye || '#3a2414', brow = o.brow || (o.beard && o.beard !== '#e8e0d8' ? o.beard : '#2a1a12');
  [[44, 1], [84, -1]].forEach(function (E) { var x = E[0], y = 62, s = E[1];
    g.fillStyle = shadeHex(skin, -0.12); g.beginPath(); g.ellipse(x, y - 2, 15, 11, 0, 0, 6.3); g.fill();
    g.beginPath(); g.moveTo(x - 13, y + 1); g.quadraticCurveTo(x, y - 13, x + 13, y + 1); g.quadraticCurveTo(x, y + 10, x - 13, y + 1); g.closePath(); g.fillStyle = '#fbf6ee'; g.fill(); g.save(); g.clip();
    var ig = g.createRadialGradient(x, y, 1, x, y, 8); ig.addColorStop(0, shadeHex(iris, 0.35)); ig.addColorStop(1, shadeHex(iris, -0.35)); g.fillStyle = ig; g.beginPath(); g.arc(x, y, 7.5, 0, 6.3); g.fill();
    g.fillStyle = '#0a0506'; g.beginPath(); g.arc(x, y, 3.4, 0, 6.3); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 14, y - 12, 28, 6); g.restore();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x - 2.6, y - 2.6, 2.2, 0, 6.3); g.arc(x + 2.8, y + 2.4, 1, 0, 6.3); g.fill();
    g.strokeStyle = '#140808'; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 14, y + 1); g.quadraticCurveTo(x, y - 14, x + 14, y + 1); g.stroke();
    g.lineWidth = 1.2; g.strokeStyle = shadeHex(skin, -0.4); g.beginPath(); g.moveTo(x - 10, y + 5); g.quadraticCurveTo(x, y + 10, x + 10, y + 5); g.stroke();
    g.fillStyle = brow; g.beginPath(); g.moveTo(x - 15 * s, y - 15); g.quadraticCurveTo(x, y - 25, x + 15 * s, y - 19); g.lineTo(x + 14 * s, y - 16); g.quadraticCurveTo(x, y - 21, x - 15 * s, y - 12); g.closePath(); g.fill(); });
  g.strokeStyle = shadeHex(skin, -0.35); g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(66, 64); g.quadraticCurveTo(70, 80, 66, 86); g.quadraticCurveTo(62, 88, 58, 85); g.stroke();
  g.fillStyle = shadeHex(skin, 0.3); g.beginPath(); g.ellipse(63, 76, 3, 6, 0, 0, 6.3); g.fill(); g.fillStyle = shadeHex(skin, -0.45); g.beginPath(); g.ellipse(58, 87, 2.4, 1.4, 0, 0, 6.3); g.ellipse(69, 87, 2.4, 1.4, 0, 0, 6.3); g.fill();
  if (o.tache) fShape(g, [[44, 94], [64, 86, 84, 94], [64, 100, 44, 94]], o.tache, '#12040a', 2);
  g.fillStyle = '#8a3a42'; g.beginPath(); g.moveTo(48, 101); g.quadraticCurveTo(56, 96, 64, 99); g.quadraticCurveTo(72, 96, 80, 101); g.quadraticCurveTo(64, 104, 48, 101); g.fill();
  g.fillStyle = '#b8505a'; g.beginPath(); g.moveTo(50, 102); g.quadraticCurveTo(64, 104, 78, 102); g.quadraticCurveTo(64, 114, 50, 102); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(64, 107, 6, 1.6, 0, 0, 6.3); g.fill();
  g.strokeStyle = '#3a1014'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(47, 101); g.quadraticCurveTo(64, 105, 81, 101); g.stroke();
  if (o.shades) { g.fillStyle = '#0c0608'; g.beginPath(); g.ellipse(44, 62, 17, 12, 0, 0, 6.3); g.ellipse(84, 62, 17, 12, 0, 0, 6.3); g.fill(); g.fillRect(58, 58, 12, 4); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(38, 57, 5, 2.5, -0.5, 0, 6.3); g.ellipse(78, 57, 5, 2.5, -0.5, 0, 6.3); g.fill(); }
  if (o.beard) { g.fillStyle = o.beard; g.beginPath(); g.moveTo(10, 66); g.quadraticCurveTo(14, 128, 64, 130); g.quadraticCurveTo(114, 128, 118, 66); g.lineTo(106, 70); g.quadraticCurveTo(100, 96, 84, 96); g.quadraticCurveTo(64, 92, 44, 96); g.quadraticCurveTo(28, 96, 22, 70); g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,0.18)'; for (var q = 0; q < 40; q++) { var bx = 20 + (q * 37) % 88, by = 100 + (q * 13) % 24; g.fillRect(bx, by, 1.5, 4); } g.fillStyle = '#b8505a'; g.beginPath(); g.ellipse(64, 104, 9, 3, 0, 0, 6.3); g.fill(); }
}, skin); }
(function () {
  var F = {
    f_amy: personFace2('#f0c8a0', {}), f_saba: personFace2('#e0b090', { shades: 1, beard: '#e8e0d8' }), f_joff: personFace2('#f0c8a0', { tache: '#3a2418' }), f_beeb: personFace2('#f0c8a0', { beard: '#c86a2a' }),
    f_harold: personFace2('#f0c8a0', { beard: '#6a3a1e' }), f_kaya: personFace2('#f0c8a0', {}), f_ali: personFace2('#d8a880', {}), f_pig: personFace2('#ff9ab4', {}),
    f_elden: personFace2('#f0c8a0', { beard: '#4a2a18' }), f_bonjo: personFace2('#f0d0b8', { eye: '#4a1a5a' }), f_t: personFace2('#f0d0c0', { eye: '#6a1a6a' }), f_jessiah: personFace2('#d8c8c0', { eye: '#4a6a8a' }),
    f_natty: personFace2('#e8e0e8', { eye: '#c4121c' }), f_judge: personFace2('#5a3826', { eye: '#2a1a14', beard: '#140a08' }), f_fate: personFace2('#2a3a2a', { eye: '#7aff6a' }), f_bates: personFace2('#f0c8a0', {}),
    f_cop: personFace2('#e8c0a0', { tache: '#3a2418' }), f_cop2: personFace2('#8a5a3a', {}), f_zombie: personFace2('#8aa878', { eye: '#ff3a2a' }), f_goon: personFace2('#5a3a6a', { eye: '#c040ff', shades: 1 }),
    f_robot: face(function (g) { g.fillStyle = '#1a1a1e'; g.fillRect(16, 40, 96, 34); g.fillStyle = '#ff2630'; g.fillRect(24, 50, 80, 12); g.fillStyle = '#ffb0a0'; g.fillRect(30, 53, 20, 5); g.fillStyle = '#5a5a60'; for (var i = 0; i < 6; i++) g.fillRect(36 + i * 10, 88, 6, 14); }, '#9a9ca2'),
    f_pulsar: face(function (g) { g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(64, 58, 44, 22, 0, 0, 6.3); g.fill(); g.fillStyle = '#4adfff'; g.fillRect(34, 50, 22, 8); g.fillRect(72, 50, 22, 8); fShape(g, [[48, 96], [64, 106, 80, 96], [64, 100, 48, 96]], '#3a1a5a', '#12040a', 2); }, '#8a5ad8')
  };
  var skins = ['#f0c8a0', '#e0b090', '#c89068', '#8a5a3a', '#5a3a24', '#f4d8c0'];
  for (var i = 0; i < 8; i++) F['f_cit' + i] = personFace2(skins[i % skins.length], { eye: ['#2a1a14', '#3a5a8a', '#4a6a3a', '#2a1a14'][i % 4], tache: i === 3 ? '#3a2418' : null, beard: i === 5 ? '#2a1a10' : i === 6 ? '#8a6a4a' : null, shades: i === 7 });
  for (var k in F) HIPAINT[k] = F[k];
})();

/* ---- the townsfolk's bodies and heads (his ask): a chest and waist instead of one egg, shoulder caps, a collar, a
   belt with a buckle, buttons, ears, a nose, and hair that covers the top of the head (it was only a cap at the back).
   person() is the shared builder (adventure/1b-models.js); this wraps it and swaps in the new torso, hips and head. ---- */
(function () { var p0 = person; person = function (o) { var R = p0(o), D = R.D, P = R.P;
  var to = M(), sh = o.shirt, dk = shadeHex(sh, -0.3);
  ell(to, 0, D.tor * 0.66, 0, 0.215, D.tor * 0.36, 0.15, sh, 12, 7); ell(to, 0, D.tor * 0.3, 0, 0.185, D.tor * 0.36, 0.13, sh, 12, 6);
  [-1, 1].forEach(function (s) { ell(to, s * 0.19, D.tor * 0.9, 0, 0.075, 0.07, 0.08, sh, 8, 5); });
  tub(to, [0, D.tor * 0.94, 0], [0, D.tor * 1.02, 0], 0.085, 0.07, dk, 10);
  if (o.apron) { ell(to, 0, D.tor * 0.38, 0.05, 0.17, D.tor * 0.45, 0.12, o.apron, 10, 5); if (o.emblem) ell(to, 0, D.tor * 0.45, 0.17, 0.05, 0.05, 0.01, o.emblem, 6, 3); [-1, 1].forEach(function (s) { tub(to, [s * 0.12, D.tor * 0.72, 0.1], [s * 0.07, D.tor * 0.98, 0.06], 0.012, 0.012, o.apron, 5); }); }
  else { for (var b = 0; b < 3; b++) ell(to, 0, D.tor * (0.42 + b * 0.16), 0.142 - b * 0.004, 0.012, 0.012, 0.008, dk, 6, 3); ell(to, 0.09, D.tor * 0.68, 0.13, 0.04, 0.03, 0.012, dk, 6, 3); }
  if (o.belly) ell(to, 0, D.tor * 0.32, 0.07, 0.2, 0.2, 0.16, sh, 12, 7);
  ell(to, 0, D.tor * 0.04, 0, 0.19, 0.035, 0.14, '#1a1012', 14, 4); boxC(to, -0.025, D.tor * 0.02, 0.135, 0.025, D.tor * 0.07, 0.15, '#c8a040');
  P.torso = to.upload();
  var hp = M(); ell(hp, 0, 0, 0, 0.175, 0.11, 0.13, o.legs, 10, 5); P.hips = hp.upload();
  if (!o.headFn) { var hd = M(), sk = o.skin; ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, sk, 14, 9, { face: o.face, fz: 0.25, fw: 0.82, fh: 0.8, fdv: 0.02 });
    [-1, 1].forEach(function (s) { ell(hd, s * 0.195, 0.21, -0.01, 0.03, 0.055, 0.04, shadeHex(sk, -0.08), 8, 5); }); ell(hd, 0, 0.17, 0.185, 0.03, 0.04, 0.03, shadeHex(sk, -0.04), 8, 5);
    tub(hd, [0, -0.04, 0], [0, 0.04, 0], 0.075, 0.08, sk, 10);
    var hc = o.hair; if (hc) { ell(hd, 0, 0.29, -0.025, 0.218, 0.19, 0.205, hc, 14, 7, { b1: 1.5 }); ell(hd, 0, 0.27, -0.04, 0.214, 0.2, 0.19, hc, 14, 7, { only: 'back' }); [-1, 1].forEach(function (s) { ell(hd, s * 0.19, 0.25, 0.03, 0.03, 0.08, 0.05, hc, 6, 4); }); if (o.long) { ell(hd, 0, 0.12, -0.08, 0.225, 0.27, 0.15, hc, 12, 7); [-1, 1].forEach(function (s) { ell(hd, s * 0.17, 0.1, 0.03, 0.05, 0.2, 0.06, hc, 6, 5); }); } if (o.fringe) ell(hd, 0.02, 0.38, 0.08, 0.17, 0.065, 0.12, hc, 12, 4); }
    if (o.hat === 'top') { tub(hd, [0, 0.38, 0], [0, 0.42, 0], 0.32, 0.32, '#12040a', 14, { cap: 1 }); tub(hd, [0, 0.42, 0], [0, 0.72, 0], 0.17, 0.18, '#1a1a1e', 14, { cap: 1 }); tub(hd, [0, 0.44, 0], [0, 0.5, 0], 0.18, 0.18, '#ffe36a', 14); }
    else if (o.hat === 'beanie') { ell(hd, 0, 0.36, -0.01, 0.225, 0.17, 0.215, '#c4121c', 12, 6, { b1: 1.7 }); tub(hd, [0, 0.3, 0], [0, 0.34, 0], 0.222, 0.222, '#8a0a12', 14); ell(hd, 0, 0.54, 0, 0.055, 0.055, 0.055, '#ffe36a', 6, 4); }
    else if (o.hat === 'chef') { tub(hd, [0, 0.38, 0], [0, 0.56, 0], 0.17, 0.2, '#f6f0e4', 12); ell(hd, 0, 0.6, 0, 0.24, 0.12, 0.24, '#f6f0e4', 12, 6); }
    else if (o.hat === 'cowboy') { tub(hd, [0, 0.38, 0], [0, 0.4, 0], 0.36, 0.36, '#5a3a1a', 14, { cap: 1 }); ell(hd, 0, 0.47, 0, 0.18, 0.14, 0.17, '#5a3a1a', 12, 6); tub(hd, [0, 0.4, 0], [0, 0.44, 0], 0.185, 0.185, '#2a1a0a', 12); }
    else if (o.hat) { /* other hats keep the old head */ return R; }
    if (o.specs) [-1, 1].forEach(function (s) { tub(hd, [s * 0.08, 0.25, 0.19], [s * 0.08, 0.25, 0.205], 0.05, 0.05, '#ffc840', 12); });
    P.head = hd.upload(); }
  return R; }; })();
