/* ---------- update 172 (his ask: some of the rides at Ejaculand are broken or you go the wrong way, there are collision
   problems, and every ride and stall needs to be usable with staff standing at it).
   - The ride views now come off the ride's own moving model at the same clock, so you go round the way the ride goes and
     you are where your seat is: the teacups, the chair swings, the carousel, the pirate ship and the dodgems (the dodgem
     cars now face the way they drive).
   - The ghost train has an inside now (a track, a cart, ghosts, skeletons, coffins) and comes back out of its own door.
   - New rides: the log flume (a log you ride up the lift and down the drop), the big top (a show in the ring) and the
     hall of mirrors (you walk through it and there are dozens of you).
   - Every ride asks before it takes the $5.
   - Every game stall (hook a duck, coconut shy, shooting gallery, candy floss), every food stall and every balloon cart can
     be used, and the high striker, ring toss, shooting gallery and candy floss by the lake have stalls of their own now.
   - Collision: the balloon carts, the ferris wheel legs, the bottom of the helter skelter slide and the low end of the flume
     are solid; the dodgem floor can be stepped onto.
   - Staff stand at every ride, stall and cart (9zb ejStaffStep spawns them when you are near). ---------- */
function xf(m, v) { return [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]]; }
function ejHex(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
function lmOf(p) { for (var i = 0; i < LMK.length; i++) if (LMK[i].p === p) return LMK[i]; return null; }
HIPAINT.pk_striker = parkSign('HIGH STRIKER', '#c4121c', '#ffe36a'); HIPAINT.pk_rings = parkSign('RING TOSS', '#7aff6a', '#12040a'); HIPAINT.pk_balloon = parkSign('BALLOONS', '#ffe36a', '#c4121c');
RIDEN.flume = ['THE LOG FLUME', 17]; RIDEN.bigtop = ['THE BIG TOP SHOW', 32]; RIDEN.mirrors = ['THE HALL OF MIRRORS', 19];
var EJR = null; // everything built once at world setup: { stalls:[{x,z,a,game}], staff:[{x,z,a}], m, gl, ... }
var EJGAMES = {
  duck: { label: 'HOOK A DUCK ($3)', price: 3, go: function () { startTiming('Hook a duck', 30, 3); } },
  shy: { label: 'COCONUT SHY ($3)', price: 3, go: function () { startTiming('Coconut shy', 45, 3); } },
  shoot: { label: 'SHOOTING GALLERY ($5)', price: 5, go: function () { startTiming('Shooting gallery', 60, 5); } },
  candy: { label: 'CANDY FLOSS ($4)', price: 4, go: function () { P.hp = Math.min(SV.maxHp, P.hp + 25); toast('Pink, sticky, gone in a second.'); } },
  food: { label: 'CREAM DOG ($6)', price: 6, go: function () { P.hp = Math.min(SV.maxHp, P.hp + 40); toast(pick(['A cream dog. Do not ask what is in it.', 'Hot, wet and gone in three bites.'])); } },
  balloon: { label: 'BUY A BALLOON ($2)', price: 2, go: function () { G.balloonT = 240; G.balloonC = pick(['#c4121c', '#ffe36a', '#ff7ab0', '#4adfff', '#7aff6a']); toast('A balloon on a string. It follows you about for a bit.'); } },
  striker: { label: 'HIGH STRIKER ($3)', price: 3, go: function () { startTiming('High striker', 40, 3); } },
  rings: { label: 'RING TOSS ($3)', price: 3, go: function () { startTiming('Ring toss', 35, 4); } }
};
function ejGameUse(x, z, g) { var G0 = EJGAMES[g]; return { x: x, z: z, r: 2.3, label: G0.label, blip: 'act', icon: '?', ejStall: 1, fn: function () { if (window.ACT) { toast('Finish what you are doing first.'); return; } payFor(G0.price, function () { sfx.play('coin'); G0.go(); }); } }; }
function ejBuild() { if (EJR) return EJR; var R = EJR = { uses: [], staff: [], m: new R3.Mesh(), gl: new R3.Mesh() }, signG = { pk_duck: 'duck', pk_shy: 'shy', pk_shoot: 'shoot', pk_candy: 'candy' };
  function staffAt(x, z, a) { R.staff.push({ x: x, z: z, a: a }); }
  // the game stalls: three to a plot, facing +z; the person running it stands at the front corner
  poisOf('stalls').forEach(function (p) { if (!ejIn(p)) return; var signs = ['pk_duck', 'pk_shy', 'pk_shoot', 'pk_candy']; for (var k = 0; k < 3; k++) { var q = (k + p.seed) % 4, sx = p.x - 8 + k * 8; R.uses.push(ejGameUse(sx, p.z + 2.5, signG[signs[q]])); staffAt(sx + 2.05, p.z + 1.25, 0); } });
  poisOf('food').forEach(function (p) { if (!ejIn(p)) return; R.uses.push(ejGameUse(p.x - 6, p.z - 1.5, 'food')); staffAt(p.x - 3.95, p.z - 2.75, 0); R.uses.push(ejGameUse(p.x + 6, p.z - 1.5, 'candy')); staffAt(p.x + 8.05, p.z - 2.75, 0); });
  poisOf('balloons').forEach(function (p) { if (!ejIn(p)) return; var y = p.h; for (var c = 0; c < 3; c++) { var cx = p.x - 8 + c * 8; addBox(cx - 1.05, p.z - 0.7, cx + 1.05, p.z + 0.7, y - 1, y + 1.4); R.uses.push(ejGameUse(cx, p.z + 2.0, 'balloon')); staffAt(cx + 1.7, p.z + 0.9, 0);
    standQ(R.gl, cx, p.z + 0.62, 0, 1.8, y + 0.55, y + 1.2, TL('pk_balloon'), 1.2, 0.4, [0, 0.69, 1, 0.69, 1, 0.31, 0, 0.31]); } });
  // the four games by the lake had nothing there: a row of stalls of their own on the lawn between the carousel and the teacups
  var row = [['pk_striker', 'striker', '#c4121c'], ['pk_rings', 'rings', '#7aff6a'], ['pk_shoot', 'shoot', '#12040a'], ['pk_candy', 'candy', '#ff7ab0']], bz = 2562;
  row.forEach(function (r, k) { var x = 2035 + k * 7.3, y = groundY(x, bz); parkStall(R.m, R.gl, x, y, bz, 0, r[0], r[2]); addBox(x - 1.6, bz - 1, x + 1.6, bz + 1, y - 1, y + 2.6); staffAt(x + 2.05, bz + 1.25, 0); R.lakeRow = R.lakeRow || []; R.lakeRow.push({ x: x, z: bz + 2.5, g: r[1] }); });
  // collision the park was missing
  poisOf('ferris').forEach(function (p) { if (!ejIn(p)) return; [-6, 6].forEach(function (dx) { [-2, 2].forEach(function (dz) { addPost(p.x + dx, p.z + dz, 0.4, p.h - 1, p.h + 4); addPost(p.x + dx * 0.6, p.z + dz, 0.35, p.h, p.h + 8); }); }); });
  poisOf('helter').forEach(function (p) { if (!ejIn(p)) return; addPost(p.x, p.z, 4.6, p.h - 1, p.h + 5); });
  poisOf('flume').forEach(function (p) { if (!ejIn(p)) return; for (var k = 0; k < 30; k++) { var t = k / 30, x = p.x - 40 + t * 70, h = p.h + 1 + (t < 0.5 ? t * 30 : (1 - t) * 30) * 0.6; if (h - p.h < 2.6) addBox(x, p.z - 2.4, x + 2.4, p.z + 2.4, p.h - 1, h + 0.8); } });
  SOLID && near(SOLID, 2086, 2756, 14).forEach(function (b) { poisOf('dodgems').forEach(function (p) { if (b.x0 !== undefined && Math.abs(b.x0 - (p.x - 11)) < 0.1 && Math.abs(b.z0 - (p.z - 7)) < 0.1 && b.y1 - b.y0 < 1) b.top = 1; }); });
  // the people at the rides: beside the place you get on, facing out
  G.uses.forEach(function (u) { if (!u.ride) return; var k = u.rideK, p = u.rideP; if (!p || !ejIn(p)) return; var ax = u.x - p.x, az = u.z - p.z, l = Math.hypot(ax, az) || 1, nx = az / l, nz = -ax / l, a = Math.atan2(ax, az);
    for (var s = 1; s >= -1; s -= 2) { var sx = u.x + nx * 1.9 * s, sz = u.z + nz * 1.9 * s; if (!collide(sx, sz, 0.4, groundY(sx, sz) + 0.3, 1.6).hit) { staffAt(sx, sz, a); break; } } });
  R.m = R.m.upload(); R.gl = R.gl.upload(); return R; }
function ejIn(p) { var t = Math.floor(p.z / CT) * MW + Math.floor(p.x / CT); return DM[t] === DISTID.ejac || Math.hypot(p.x - 2080, p.z - 2600) < 300; }
window.EJRSTAFF = function () { return EJR ? EJR.staff : []; };
/* ---------------- ride views tied to the models ---------------- */
function rideAhead(f, L, at0, look) { var m = f(G.t), m2 = f(G.t + 0.12), e = xf(m, L), e2 = xf(m2, L), dx = e2[0] - e[0], dz = e2[2] - e[2], l = Math.hypot(dx, dz) || 1; return { e: e, at: [e[0] + dx / l * 20 + (look ? look[0] : 0), e[1] - 1.5, e[2] + dz / l * 20 + (look ? look[1] : 0)] }; }
var GHOSTPATH = [[-0.7, 10], [-0.7, 4.5], [-6.5, 4.5], [-6.5, -4.5], [6.5, -4.5], [6.5, 2.5], [0.7, 2.5], [0.7, 10]];
function pathAt(P0, f) { var L = [0]; for (var i = 1; i < P0.length; i++) L.push(L[i - 1] + Math.hypot(P0[i][0] - P0[i - 1][0], P0[i][1] - P0[i - 1][1])); var d = clamp(f, 0, 1) * L[L.length - 1];
  for (var j = 1; j < P0.length; j++) if (d <= L[j] || j === P0.length - 1) { var q = (d - L[j - 1]) / ((L[j] - L[j - 1]) || 1); return [P0[j - 1][0] + (P0[j][0] - P0[j - 1][0]) * q, P0[j - 1][1] + (P0[j][1] - P0[j - 1][1]) * q]; } return P0[0]; }
function flumeAt(p, t) { var s = t < 1 ? 0 : t < 11 ? (t - 1) / 10 * 0.5 : t < 13.5 ? 0.5 + Math.pow((t - 11) / 2.5, 1.6) * 0.5 : 1, x = p.x - 40 + s * 70 + 1.2, h = p.h + 1 + (s < 0.5 ? s * 30 : (1 - s) * 30) * 0.6; if (s >= 1) x += Math.min(4, (t - 13.5) * 2.4); return { s: s, x: x, h: h, sl: s < 0.5 ? 0.257 : s < 1 ? -0.257 : 0 }; }
function mirrorPath(t) { var P0 = [[0, 8], [0, 3], [-5, 3], [-5, -3], [5, -3], [5, 3], [2.4, 3], [2.4, 8]]; return pathAt(P0, clamp((t - 0.5) / (RIDEN.mirrors[1] - 1.5), 0, 1)); }
(function () {
  // dodgem cars face where they are going
  var bl = buildLandmarks; buildLandmarks = function () { var had = LMK.length; bl.apply(this, arguments); if (had) return;
    LMK.forEach(function (o) { var p = o.p; if (p.k === 'dodgems') { var w = 11, d = 7, y = p.h, n = 0; o.parts.forEach(function (q, i) { var k = n++; q.f = function (t) { var u = t * 0.35 + k * 1.05, x = Math.sin(u * 1.3 + k) * (w - 2), z = Math.sin(u * 0.9 + k * 2) * (d - 2), vx = Math.cos(u * 1.3 + k) * 1.3 * (w - 2), vz = Math.cos(u * 0.9 + k * 2) * 0.9 * (d - 2); return MD(p.x + x, y, p.z + z, Math.atan2(vx, vz), 0, 0); }; }); }
      if (p.k === 'flume') { var lg = new R3.Mesh(); boxC(lg, -1.5, 0, -0.85, 1.5, 0.55, 0.85, '#6a4424'); boxC(lg, -1.2, 0.2, -0.65, 1.2, 0.62, 0.65, '#2a1a10'); boxC(lg, -1.75, 0.1, -0.7, -1.4, 0.9, 0.7, '#7a5030'); boxC(lg, 1.4, 0.1, -0.7, 1.75, 0.9, 0.7, '#7a5030');
        var lm = lg.upload(); o.flLog = lm; o.parts.push({ m: lm, f: function (t) { var c = t % 18, a = flumeAt(p, c < 1 ? 1 : c); return MD(a.x, a.h + 0.05, p.z, Math.PI / 2, 0, -Math.atan(a.sl)); } }); } }); };
  var ru = rideUses; rideUses = function () { var U = ru(); var E = { flume: function (p) { return [p.x - 41, p.z + 5]; }, bigtop: function (p) { return [p.x, p.z + 14]; }, mirrors: function (p) { return [p.x, p.z + 7.6]; } };
    U.forEach(function (u) { var k = Object.keys(RIDEN).filter(function (q) { return u.label === 'RIDE ' + RIDEN[q][0] + ' ($5)'; })[0]; if (!k) return; var best = null; poisOf(k).forEach(function (p) { if (!best || Math.hypot(u.x - p.x, u.z - p.z) < Math.hypot(u.x - best.x, u.z - best.z)) best = p; });
      u.rideK = k; u.rideP = best; u.ride = 1; u.r = u.r || 4.5; if (E[k] && best) { var e = E[k](best); u.x = e[0]; u.z = e[1]; }
      if (k === 'bigtop') u.label = 'WATCH THE BIG TOP SHOW ($5)'; if (k === 'mirrors') u.label = 'GO IN THE HALL OF MIRRORS ($5)';
      u.fn = function () { if (G.ride) return; payFor(5, function () { sfx.play('coin'); G.ride = { k: k, p: best, t: 0, back: [P.x, P.z, P.a] }; G.fade = 0.8; if (k === 'bigtop') ejShow(1); }); }; });
    return U; };
  var ws = worldSetup; worldSetup = function () { ws(); try { EJR = null; var R = ejBuild();
      // the four games that were on the lake shore move to their new stalls; the stalls get their uses
      G.uses.forEach(function (u) { var lr = (R.lakeRow || []).filter(function (q) { return EJGAMES[q.g].label === u.label; })[0]; if (lr && Math.hypot(u.x - 2050, u.z - 2590) < 60) { u.x = lr.x; u.z = lr.z; u.r = 2.3; } });
      G.uses = G.uses.concat(R.uses); } catch (e) { console.warn('ejrides', e); } };
  var rc = rideCam; rideCam = function (dt) { var R0 = G.ride, k = R0.k, p = R0.p, o = lmOf(p); if (!{ teacups: 1, swings: 1, carousel: 1, pirate: 1, dodgems: 1, ghost: 1, flume: 1, bigtop: 1, mirrors: 1 }[k] || !o) return rc(dt);
    var t = R0.t += dt, y = p.h, e, at, f0 = o.parts[0] && o.parts[0].f, r;
    if (k === 'teacups') { var s = G.t * 1.6; e = xf(f0(G.t), [6.5 + Math.cos(s) * 0.45, 2.0, Math.sin(s) * 0.45]); at = xf(f0(G.t), [6.5 + Math.cos(s) * 20, 1.0, Math.sin(s) * 20]); }
    else if (k === 'swings') { r = rideAhead(f0, [9, 6.3, 0], null, null); e = r.e; at = [r.at[0] + (p.x - e[0]) * 0.2, y + 3, r.at[2] + (p.z - e[2]) * 0.2]; }
    else if (k === 'carousel') { r = rideAhead(f0, [6.5, 2.95 + Math.sin(G.t * 2) * 0.25, 0]); e = r.e; at = [r.at[0] + (p.x - e[0]) * 0.4, y + 2, r.at[2] + (p.z - e[2]) * 0.4]; }
    else if (k === 'pirate') { var m = f0(G.t); e = xf(m, [5.6, -6.7, 0.7]); at = xf(m, [-40, 1, 0.7]); }
    else if (k === 'dodgems') { var m2 = o.parts[0].f(G.t); e = xf(m2, [0, 1.35, -0.3]); at = xf(m2, [0, 0.9, 10]); if (Math.sin(G.t * 2.3) > 0.97) CAM.shake = 0.3; }
    else if (k === 'ghost') { var q0 = pathAt(GHOSTPATH, t / RIDEN.ghost[1]), q1 = pathAt(GHOSTPATH, (t + 1.2) / RIDEN.ghost[1]); e = [p.x + q0[0], y + 1.5, p.z + q0[1]]; at = [p.x + q1[0], y + 1.3 + Math.sin(t * 3) * 0.15, p.z + q1[1]]; if (at[0] === e[0] && at[2] === e[2]) at[2] += 1;
      R0.car = [e[0], e[2], Math.atan2(at[0] - e[0], at[2] - e[2])]; G.ghostRide = 1; if (Math.random() < dt * 0.4) { CAM.shake = 0.5; sfx.play('hurt'); } }
    else if (k === 'flume') { var A = flumeAt(p, t); e = [A.x - 0.4, A.h + 1.55, p.z]; at = [A.x + 20, A.h + 1.2 + A.sl * 20 - (A.sl < 0 ? 3 : 0), p.z]; R0.log = A; if (A.s >= 1 && !R0.splash) { R0.splash = 1; CAM.shake = 0.8; sfx.play('crash'); toast('SPLOOSH.'); } }
    else if (k === 'bigtop') { var a = Math.PI / 2 + Math.sin(t * 0.15) * 0.35; e = [p.x + Math.cos(a) * 9.2, y + 2.6, p.z + Math.sin(a) * 9.2]; at = [p.x, y + 1.3, p.z]; }
    else if (k === 'mirrors') { var m0 = mirrorPath(t), m1 = mirrorPath(t + 0.4), ha = Math.atan2(m1[0] - m0[0], m1[1] - m0[1]); if (m1[0] === m0[0] && m1[1] === m0[1]) ha = R0.ha || 0; R0.ha = ha; R0.me = [p.x + m0[0], p.z + m0[1], ha, t < RIDEN.mirrors[1] - 1.2 ? 1 : 0];
      e = [p.x + m0[0] - Math.sin(ha) * 2.4, y + 2.1, p.z + m0[1] - Math.cos(ha) * 2.4]; at = [p.x + m0[0] + Math.sin(ha) * 2, y + 1.2, p.z + m0[1] + Math.cos(ha) * 2]; }
    CAM.x = e[0]; CAM.y = e[1]; CAM.z = e[2]; CAM.at = at; P.x = R0.back[0]; P.z = R0.back[1];
    var any = KIT.pressed('a') || KIT.pressed('b') || KIT.pressed('x') || KIT.pressed('y'); if (R0.t > RIDEN[k][1] || (any && R0.t > 1.5)) { G.ride = null; G.ghostRide = 0; G.fade = 0.8; if (k === 'bigtop') ejShow(0); P.y = groundY(P.x, P.z); CAM.x = P.x - 4; CAM.z = P.z - 4; CAM.y = P.y + 3; CAM.at = null; toast(pick(['What a ride.', 'Your legs have gone to jelly.', 'Steve waves at you. He always waves.'])); } };
})();
/* ---------------- the insides: the ghost train, the big top, the hall of mirrors ---------------- */
var EJIN = {};
function ejGhostIn(p) { if (EJIN['g' + p.x]) return EJIN['g' + p.x]; var m = new R3.Mesh(), gl = new R3.Mesh(), y = p.h, w = 9, d = 7;
  boxC(m, p.x - w + 0.1, y + 0.02, p.z - d + 0.1, p.x + w - 0.1, y + 0.08, p.z + d - 0.1, '#141016'); boxC(m, p.x - w + 0.1, y + 8.8, p.z - d + 0.1, p.x + w - 0.1, y + 8.9, p.z + d - 0.1, '#0a080a');
  [[-w + 0.12, 0], [w - 0.12, 0]].forEach(function (q) { boxC(m, p.x + q[0] - 0.05, y, p.z - d, p.x + q[0] + 0.05, y + 8.8, p.z + d, '#1a1218'); }); boxC(m, p.x - w, y, p.z - d + 0.07, p.x + w, y + 8.8, p.z - d + 0.17, '#1a1218'); boxC(m, p.x - w, y, p.z + d - 0.17, p.x - 1.6, y + 8.8, p.z + d - 0.07, '#1a1218'); boxC(m, p.x + 1.6, y, p.z + d - 0.17, p.x + w, y + 8.8, p.z + d - 0.07, '#1a1218'); boxC(m, p.x - 1.6, y + 3.4, p.z + d - 0.17, p.x + 1.6, y + 8.8, p.z + d - 0.07, '#1a1218');
  for (var i = 1; i < GHOSTPATH.length; i++) { var A = GHOSTPATH[i - 1], B = GHOSTPATH[i], dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz), nx = -dz / l, nz = dx / l;
    [-0.5, 0.5].forEach(function (o) { tub(m, [p.x + A[0] + nx * o, y + 0.15, p.z + A[1] + nz * o], [p.x + B[0] + nx * o, y + 0.15, p.z + B[1] + nz * o], 0.05, 0.05, '#6a6a72', 4); }); }
  // ghosts and skeletons along the way, coffins in the corners, red lamps
  [[-3.5, 6.2], [-8, 0], [-3, -6.2], [3, -6.2], [8, -1], [3.5, 1]].forEach(function (q, i) { var gx = p.x + q[0], gz = p.z + q[1], gy = y + 2.2 + (i % 2) * 0.8;
    if (i % 2 === 0) { ell(gl, gx, gy, gz, 0.6, 0.85, 0.6, '#d8e8e0', 8, 5); tub(gl, [gx, gy - 0.6, gz], [gx, gy - 1.8, gz], 0.6, 0.15, '#c8d8d0', 8); ell(gl, gx - 0.22, gy + 0.15, gz + 0.5, 0.1, 0.14, 0.05, '#ff2630', 5, 3); ell(gl, gx + 0.22, gy + 0.15, gz + 0.5, 0.1, 0.14, 0.05, '#ff2630', 5, 3); }
    else { ell(m, gx, y + 2.6, gz, 0.3, 0.36, 0.3, '#e8e0c8', 7, 5); tub(m, [gx, y + 2.3, gz], [gx, y + 1.1, gz], 0.06, 0.06, '#e8e0c8', 4); for (var r = 0; r < 4; r++) boxC(m, gx - 0.3, y + 2.1 - r * 0.22, gz - 0.05, gx + 0.3, y + 2.15 - r * 0.22, gz + 0.05, '#e8e0c8'); [-1, 1].forEach(function (s) { tub(m, [gx + s * 0.1, y + 1.1, gz], [gx + s * 0.18, y, gz], 0.05, 0.05, '#e8e0c8', 4); tub(m, [gx + s * 0.3, y + 2.1, gz], [gx + s * 0.6, y + 1.3, gz + 0.3], 0.04, 0.04, '#e8e0c8', 4); }); ell(gl, gx - 0.1, y + 2.62, gz + 0.27, 0.06, 0.06, 0.03, '#7aff6a', 4, 3); ell(gl, gx + 0.1, y + 2.62, gz + 0.27, 0.06, 0.06, 0.03, '#7aff6a', 4, 3); } });
  [[-8, 6], [8, -6], [-8, -6]].forEach(function (q) { boxR(m, p.x + q[0], p.z + q[1], 0.4, 0.5, 1.1, y, y + 0.6, '#3a2018'); boxR(m, p.x + q[0], p.z + q[1], 0.4, 0.55, 1.15, y + 0.6, y + 0.7, '#5a3020'); });
  for (var L = 0; L < 6; L++) ell(gl, p.x - 7 + L * 2.8, y + 8.4, p.z + (L % 2 ? -3 : 3), 0.18, 0.18, 0.18, '#ff2630', 5, 3);
  var car = new R3.Mesh(); boxC(car, -0.8, 0.2, -1.0, 0.8, 0.8, 1.1, '#7a1018'); boxC(car, -0.8, 0.8, 0.6, 0.8, 1.15, 1.1, '#12040a'); ell(car, 0, 0.75, 1.15, 0.25, 0.25, 0.12, '#f1e7d0', 6, 4); ell(car, -0.09, 0.8, 1.27, 0.05, 0.05, 0.02, '#ff2630', 4, 3); ell(car, 0.09, 0.8, 1.27, 0.05, 0.05, 0.02, '#ff2630', 4, 3);
  return EJIN['g' + p.x] = { m: m.upload(), gl: gl.upload(), car: car.upload() }; }
function ejTopIn(p) { if (EJIN['t' + p.x]) return EJIN['t' + p.x]; var m = new R3.Mesh(), gl = new R3.Mesh(), y = p.h;
  tub(m, [p.x, y, p.z], [p.x, y + 0.04, p.z], 11.8, 11.8, '#6a4a2a', 18, { cap: 1 }); tub(m, [p.x, y + 0.04, p.z], [p.x, y + 0.08, p.z], 5, 5, '#c8a870', 18, { cap: 1 }); tub(m, [p.x, y, p.z], [p.x, y + 0.45, p.z], 5.2, 5.2, '#c4121c', 18); tub(m, [p.x, y, p.z], [p.x, y + 0.45, p.z], 5.0, 5.0, '#c4121c', 18);
  ring(m, p.x, 0, p.z, 5.1, 18, function (x, z, a, k) { if (k % 2) ell(gl, x, y + 0.5, z, 0.12, 0.12, 0.12, '#ffe36a', 4, 3); });
  for (var tier = 0; tier < 3; tier++) { var r0 = 7.4 + tier * 1.3, hy = y + 0.45 + tier * 0.55; for (var s = 0; s < 14; s++) { var a0 = s / 14 * 6.283, a1 = (s + 0.85) / 14 * 6.283; if (Math.abs(Math.atan2(Math.sin(a0 - Math.PI / 2), Math.cos(a0 - Math.PI / 2))) < 0.35) continue;
      var A = [p.x + Math.cos(a0) * r0, p.z + Math.sin(a0) * r0], B = [p.x + Math.cos(a1) * r0, p.z + Math.sin(a1) * r0]; tub(m, [A[0], hy, A[1]], [B[0], hy, B[1]], 0.3, 0.3, tier % 2 ? '#3a2a5a' : '#5a1a2a', 4); } }
  tub(m, [p.x, y, p.z], [p.x, y + 14, p.z], 0.18, 0.18, '#c8c8d0', 6); for (var k = 0; k < 6; k++) { var an = k / 6 * 6.283; tub(m, [p.x, y + 12, p.z], [p.x + Math.cos(an) * 11.5, y + 6, p.z + Math.sin(an) * 11.5], 0.03, 0.03, '#c8c8d0', 3); ell(gl, p.x + Math.cos(an) * 6, y + 9, p.z + Math.sin(an) * 6, 0.3, 0.3, 0.3, ['#ffe36a', '#ff7ab0', '#4adfff'][k % 3], 5, 3); }
  boxC(m, p.x - 0.05, y + 4.5, p.z - 3, p.x + 0.05, y + 4.55, p.z + 3, '#c8c8d0'); // the high wire
  return EJIN['t' + p.x] = { m: m.upload(), gl: gl.upload() }; }
var EJSHOW = null;
function ejShow(on) { if (!on) { if (EJSHOW) PEDS = PEDS.filter(function (q) { return EJSHOW.indexOf(q) < 0; }); EJSHOW = null; return; }
  var p = poisOf('bigtop').filter(ejIn)[0]; if (!p || EJSHOW) return; EJSHOW = [0, 1, 2, 3].map(function (k) { var q = makePed({ x: p.x, z: p.z, kind: 'cit', rig: rigFor('cit'), state: 'idle', keep: 1 }); q.god = 1; q.show = 1;
    q.ctl = function (pp) { var t = G.t; pp.vx = pp.vz = 0; if (k === 0) { var a = t * 0.9; pp.x = p.x + Math.cos(a) * 3.6; pp.z = p.z + Math.sin(a) * 3.6; pp.a = a + Math.PI; pp.sp = 3.5; pp.ph += 1 / 60 * 8; pp.y = p.h + Math.abs(Math.sin(t * 4)) * 0.5; }
      else if (k === 1) { pp.x = p.x + Math.sin(t * 0.5) * 2.6; pp.z = p.z; pp.y = p.h + 4.55; pp.a = Math.PI / 2; pp.sp = 0.6; pp.ph += 1 / 60 * 2; }
      else { pp.x = p.x + (k - 2.5) * 2.2; pp.z = p.z + 1.4; pp.y = p.h + Math.abs(Math.sin(t * 3 + k)) * 0.9; pp.a = 0; pp.danceT = 0.5; } };
    return q; }); }
function ejMirIn(p) { if (EJIN['m' + p.x]) return EJIN['m' + p.x]; var m = new R3.Mesh(), gl = new R3.Mesh(), y = p.h, w = 8, d = 6, P0 = [[0, 8], [0, 3], [-5, 3], [-5, -3], [5, -3], [5, 3], [2.4, 3], [2.4, 8]];
  for (var z = -d; z < d; z += 1) for (var x = -w; x < w; x += 1) boxC(m, p.x + x, y + 0.02, p.z + z, p.x + x + 1, y + 0.06, p.z + z + 1, (Math.floor(x) + Math.floor(z)) % 2 ? '#12040a' : '#f1e7d0');
  boxC(m, p.x - w + 0.1, y + 3.4, p.z - d + 0.1, p.x + w - 0.1, y + 3.5, p.z + d - 0.1, '#2a1a3a'); for (var L = 0; L < 8; L++) ell(gl, p.x - 6 + (L % 4) * 4, y + 3.35, p.z + (L < 4 ? -3 : 3), 0.25, 0.08, 0.25, '#ff7ab0', 6, 3);
  var pan = [];
  for (var i = 1; i < P0.length; i++) { var A = P0[i - 1], B = P0[i], dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz), nx = -dz / l, nz = dx / l; if (A[1] > 6 && B[1] > 6) continue;
    [-1.25, 1.25].forEach(function (o) { var ax = A[0] + nx * o, az = Math.min(d - 0.2, A[1]) + nz * o, bx = B[0] + nx * o, bz = Math.min(d - 0.2, B[1]) + nz * o; pan.push({ ax: ax, az: az, bx: bx, bz: bz, nx: nx * Math.sign(o), nz: nz * Math.sign(o) });
      for (var s = 0; s < 2; s++) { var o2 = s ? 0.03 : -0.03; gl.quad([p.x + ax + nx * o2, y + 0.1, p.z + az + nz * o2], [p.x + bx + nx * o2, y + 0.1, p.z + bz + nz * o2], [p.x + bx + nx * o2, y + 3.3, p.z + bz + nz * o2], [p.x + ax + nx * o2, y + 3.3, p.z + az + nz * o2], UV1, TL('white'), [0.75, 0.82, 0.9], [nx, 0, nz]); }
      boxC(m, p.x + Math.min(ax, bx) - 0.06, y + 3.25, p.z + Math.min(az, bz) - 0.06, p.x + Math.max(ax, bx) + 0.06, y + 3.4, p.z + Math.max(az, bz) + 0.06, '#c4a040'); }); }
  return EJIN['m' + p.x] = { m: m.upload(), gl: gl.upload(), pan: pan }; }
(function () {
  var df = drawFun; drawFun = function () { df(); if (G.interior) return; try { if (EJR && dist2(2050, 2565, CAM.x, CAM.z) < 400 * 400) { R3.draw(EJR.m, ATT); R3.draw(EJR.gl, ATT, { lit: false }); }
    var R0 = G.ride; if (!R0) { if (G.balloonT > 0 && P.state === 'foot') { var bx = P.x + Math.sin(G.t * 0.7) * 0.3, bz = P.z - 0.3, by = P.y + 3.4 + Math.sin(G.t * 1.3) * 0.1; if (!window.__blM) { var bm = new R3.Mesh(); ell(bm, 0, 0, 0, 0.35, 0.42, 0.35, '#ffffff', 8, 6); tub(bm, [0, -0.42, 0], [0, -2.2, 0], 0.008, 0.008, '#f1e7d0', 3); window.__blM = bm.upload(); } R3.draw(__blM, ATT, { m: MD(bx, by, bz, 0, 0, 0), tint: ejHex(G.balloonC || '#c4121c') }); } return; }
    var p = R0.p, k = R0.k;
    if (k === 'ghost') { var gi = ejGhostIn(p); R3.draw(gi.m, ATT, { tint: [0.45, 0.4, 0.5] }); R3.draw(gi.gl, ATT, { lit: false }); if (R0.car) R3.draw(gi.car, ATT, { m: MD(R0.car[0], p.h, R0.car[1], R0.car[2], 0, 0), tint: [0.6, 0.55, 0.6] }); }
    if (k === 'bigtop') { var ti = ejTopIn(p); R3.draw(ti.m, ATT); R3.draw(ti.gl, ATT, { lit: false }); }
    if (k === 'flume' && R0.log) { var o = lmOf(p); if (o && o.flLog) R3.draw(o.flLog, ATT, { m: MD(R0.log.x, R0.log.h + 0.05, p.z, Math.PI / 2, 0, -Math.atan(R0.log.sl)) }); }
    if (k === 'mirrors' && R0.me) { var mi = ejMirIn(p), me = R0.me, Q = poseOfPlayer(), rig = RIGS[P.rig || 'cumhead']; P.sp = me[3] ? 1.6 : 0; P.ph += me[3] ? 1 / 60 * 4.4 : 0; if (me[3]) poseWalk(Q, P.ph, 1, false); R3.draw(mi.m, ATT);
      var X = me[0] - p.x, Z = me[1] - p.z, copies = [[X, Z, me[2]]];
      mi.pan.forEach(function (q) { var dx = q.bx - q.ax, dz = q.bz - q.az, l2 = dx * dx + dz * dz, s = ((X - q.ax) * dx + (Z - q.az) * dz) / l2; if (s < -0.3 || s > 1.3) return; var dd = (X - q.ax) * q.nx + (Z - q.az) * q.nz; if (dd > 0 || dd < -3) return;
        var rx = X - 2 * dd * q.nx, rz = Z - 2 * dd * q.nz, fa = Math.sin(me[2]), fc = Math.cos(me[2]), fd = fa * q.nx + fc * q.nz; copies.push([rx, rz, Math.atan2(fa - 2 * fd * q.nx, fc - 2 * fd * q.nz)]);
        copies.push([rx + q.nx * 2.5, rz + q.nz * 2.5, Math.atan2(fa - 2 * fd * q.nx, fc - 2 * fd * q.nz) + 0.4]); copies.push([rx - q.nx * 0.0 + dx / Math.sqrt(l2) * 1.4, rz + dz / Math.sqrt(l2) * 1.4, me[2] + 2.6]); });
      copies.forEach(function (c, i) { drawPerson(rig, p.x + c[0], p.h + 0.06, p.z + c[1], c[2], Q, { noShadow: i > 0, alpha: i ? 0.9 : 1 }); });
      R3.draw(mi.gl, ATT, { lit: false, alpha: 0.28 }); }
  } catch (e) { if (!window.__ejR) { window.__ejR = 1; console.warn(e); } } };
  var sf = stepFun; stepFun = function (dt) { sf(dt); if (G.balloonT > 0) G.balloonT -= dt; };
})();
