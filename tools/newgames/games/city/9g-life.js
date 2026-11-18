/* ---------- update 161: more life in the streets (he asked for more decorations and more animations).
   Pigeons on the pavements and squares in town that peck about and burst into the air when you come close or a car
   comes by, litter and newspapers blown along the streets by the same wind as the smoke, and flags that wave on
   poles round the squares, the park gate, the airport, the village and the castles. ---------- */
var PIGS = [], LITTER = [], LIFEM = {};
function lifeWind() { return [Math.cos(G.t * 0.03) * 0.8 + 0.6, Math.sin(G.t * 0.02) * 0.6]; }
function townAt(x, z) { return /downtown|redlight|cafe|suburb|docks|industrial|labs|park|ejac/.test(dAt(x, z).style || '') || dAt(x, z).id === 'ejac'; }
function pigeonMesh(down) { var key = 'pig' + down; if (LIFEM[key]) return LIFEM[key]; var m = new R3.Mesh();
  boxC(m, -0.06, 0.06, -0.11, 0.06, 0.17, 0.09, '#6a6a74'); boxC(m, -0.05, 0.08, -0.17, 0.05, 0.14, -0.1, '#4a4a54');
  var hy = down ? 0.1 : 0.2, hz = down ? 0.15 : 0.1; boxC(m, -0.04, hy, hz - 0.04, 0.04, hy + 0.07, hz + 0.04, '#5a5a66'); boxC(m, -0.045, hy - 0.04, hz - 0.05, 0.045, hy + 0.01, hz + 0.03, '#3a6a5a');
  boxC(m, -0.012, hy + 0.01, hz + 0.04, 0.012, hy + 0.03, hz + 0.07, '#e8a040'); boxC(m, -0.03, 0, -0.01, -0.015, 0.07, 0.01, '#c4505a'); boxC(m, 0.015, 0, -0.01, 0.03, 0.07, 0.01, '#c4505a');
  return (LIFEM[key] = m.upload()); }
function litterMesh(k) { var key = 'lit' + k; if (LIFEM[key]) return LIFEM[key]; var m = new R3.Mesh(), c = ['#e8e4d8', '#d8d0b8', '#c4121c', '#f1e7d0'][k], w = k === 2 ? 0.12 : 0.22, l = k === 2 ? 0.16 : 0.3;
  m.quad([-w, 0, -l], [-w, 0, l], [w, 0, l], [w, 0, -l], UV1, TL('white'), rgb01(c).map(function (q) { return q * 0.5; }), [0, 1, 0]);
  m.quad([w, 0, -l], [w, 0, l], [-w, 0, l], [-w, 0, -l], UV1, TL('white'), rgb01(c).map(function (q) { return q * 0.4; }), [0, -1, 0]);
  if (k === 1) for (var r = 0; r < 4; r++) m.quad([-w + 0.03, 0.002, -l + 0.05 + r * 0.12], [-w + 0.03, 0.002, -l + 0.09 + r * 0.12], [w - 0.03, 0.002, -l + 0.09 + r * 0.12], [w - 0.03, 0.002, -l + 0.05 + r * 0.12], UV1, TL('white'), [0.12, 0.12, 0.12], [0, 1, 0]);
  return (LIFEM[key] = m.upload()); }
function stepLife(dt) { if (G.interior || !P) return; var px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z, W = lifeWind(), dl = dayLight(G.time);
  // pigeons: a flock or two on the pavements near you in town (in daylight)
  for (var i = PIGS.length - 1; i >= 0; i--) { var b = PIGS[i]; if (dist2(b.x, b.z, px, pz) > 70 * 70 || (b.fly && b.y - b.y0 > 30)) PIGS.splice(i, 1); }
  if (dl > 0.25 && G.weather !== 'storm' && PIGS.length < 16 && Math.random() < dt * 0.8) { var a0 = Math.random() * 6.283, r0 = rnd(16, 40), fx = px + Math.sin(a0) * r0, fz = pz + Math.cos(a0) * r0, k0 = kAt(fx, fz);
    if ((k0 === K_PAVE || k0 === K_PARK || k0 === K_LOT) && townAt(fx, fz)) { var n = 4 + Math.floor(Math.random() * 5);
      for (var q = 0; q < n; q++) { var x = fx + rnd(-1.8, 1.8), z = fz + rnd(-1.8, 1.8); if (kAt(x, z) !== k0) continue; var y = standY(x, z, groundY(x, z) + 1); PIGS.push({ x: x, z: z, y: y, y0: y, a: Math.random() * 6.283, t: rnd(0, 2), st: 'peck', ph: Math.random() * 6, fly: 0 }); } } }
  PIGS.forEach(function (b) { b.ph += dt * (b.fly ? 22 : 6); if (b.fly) { b.x += Math.sin(b.a) * 7 * dt; b.z += Math.cos(b.a) * 7 * dt; b.y += b.vy * dt; b.vy = Math.max(1.5, b.vy - dt * 2); return; }
    var near = dist2(b.x, b.z, P.x, P.z) < 3.2 * 3.2 || VEH.some(function (v) { return Math.abs(v.sp) > 3 && dist2(v.x, v.z, b.x, b.z) < 7 * 7; });
    if (near) { b.fly = 1; b.vy = rnd(4, 6); b.a = Math.atan2(b.x - P.x, b.z - P.z) + rnd(-0.8, 0.8); if (!G.pigSnd || G.t - G.pigSnd > 1.2) { G.pigSnd = G.t; sfx.play('swing'); } return; }
    b.t -= dt; if (b.t <= 0) { b.st = b.st === 'walk' ? 'peck' : Math.random() < 0.5 ? 'walk' : 'peck'; b.t = rnd(0.6, 2.4); if (b.st === 'walk') b.a += rnd(-1.5, 1.5); }
    if (b.st === 'walk') { var nx = b.x + Math.sin(b.a) * 0.45 * dt, nz = b.z + Math.cos(b.a) * 0.45 * dt; if (kAt(nx, nz) === kAt(b.x, b.z)) { b.x = nx; b.z = nz; b.y = standY(b.x, b.z, b.y + 0.3); } else b.a += 2; } });
  // litter in town, blown along the ground; it settles when the wind drops
  for (var j = LITTER.length - 1; j >= 0; j--) { var L = LITTER[j]; if (dist2(L.x, L.z, px, pz) > 55 * 55) LITTER.splice(j, 1); }
  if (LITTER.length < 10 && Math.random() < dt * 1.5) { var a1 = Math.random() * 6.283, r1 = rnd(10, 35), lx = px + Math.sin(a1) * r1, lz = pz + Math.cos(a1) * r1, k1 = kAt(lx, lz);
    if ((k1 === K_PAVE || k1 === K_ROAD || k1 === K_LOT) && townAt(lx, lz)) LITTER.push({ x: lx, z: lz, y: groundY(lx, lz), k: Math.floor(Math.random() * 4), a: Math.random() * 6.283, sp: 0, rot: 0, rv: 0, h: 0, vy: 0 }); }
  var gust = 0.6 + 0.6 * Math.max(0, Math.sin(G.t * 0.7) * Math.sin(G.t * 0.23)), wx = W[0] * gust, wz = W[1] * gust;
  LITTER.forEach(function (L) { var g = standY(L.x, L.z, L.y + 0.5), push = gust > 0.85 ? 1 : 0.15, kick = 0;
    VEH.forEach(function (v) { if (Math.abs(v.sp) > 6 && dist2(v.x, v.z, L.x, L.z) < 4 * 4) { kick = 1; L.vy = Math.max(L.vy, 2.5); L.kx = Math.sin(v.a) * v.sp * 0.4; L.kz = Math.cos(v.a) * v.sp * 0.4; } });
    var tx = wx * 1.6 * push + (L.kx || 0), tz = wz * 1.6 * push + (L.kz || 0); L.kx = (L.kx || 0) * Math.max(0, 1 - dt * 1.5); L.kz = (L.kz || 0) * Math.max(0, 1 - dt * 1.5);
    var nx = L.x + tx * dt, nz = L.z + tz * dt; L.x = nx; L.z = nz;
    if (gust > 1.0 && Math.random() < dt * 0.6) L.vy = Math.max(L.vy, rnd(0.6, 1.6));
    L.h = Math.max(0, L.h + L.vy * dt); L.vy -= 3.5 * dt; if (L.h <= 0) { L.h = 0; L.vy = 0; }
    L.rv += ((Math.hypot(tx, tz) > 0.5 ? 4 : 0) - L.rv) * dt * 2; L.rot += L.rv * dt; L.a += (Math.atan2(tx, tz) - L.a) * dt * 0.5; L.y = g; }); }
function drawLife() { if (G.interior) return;
  PIGS.forEach(function (b) { if (dist2(b.x, b.z, CAM.x, CAM.z) > 60 * 60 || !inView(b.x, b.z, 1)) return;
    if (b.fly) { var M2 = birdMeshes(), fl = Math.floor(b.ph) % 2; R3.draw(M2[fl], ATT, { m: MD(b.x, b.y + 0.15, b.z, b.a + Math.PI, -0.2, 0, 0.42), lit: false, tint: [2.0, 2.0, 2.2] }); return; }
    var down = b.st === 'peck' && Math.sin(b.ph * 1.6) > 0.2 ? 1 : 0, bob = b.st === 'walk' ? Math.abs(Math.sin(b.ph * 2)) * 0.02 : 0; R3.draw(pigeonMesh(down), ATT, { m: MD(b.x, b.y + bob, b.z, b.a, 0, 0) }); });
  LITTER.forEach(function (L) { if (dist2(L.x, L.z, CAM.x, CAM.z) > 45 * 45 || !inView(L.x, L.z, 1)) return; var air = L.h > 0.02, lift = air ? Math.sin(L.rot) * 1.2 : 0; /* update 164: lying flat a little above the highest ground under it (they tilted into the ground and flickered at kerbs) */
    var gy = Math.max(L.y, standY(L.x + 0.3, L.z, L.y + 0.5), standY(L.x - 0.3, L.z, L.y + 0.5), standY(L.x, L.z + 0.3, L.y + 0.5), standY(L.x, L.z - 0.3, L.y + 0.5));
    R3.draw(litterMesh(L.k), ATT, { m: MD(L.x, gy + 0.06 + L.h, L.z, L.a, lift, air ? Math.cos(L.rot * 0.7) * 0.8 : 0) }); });
  drawFlags(); }
/* flags: a pole with a cloth that ripples in the wind (the cloth is rebuilt each frame, a few dozen triangles) */
var FLAGS = null, FLAGPOLE = null, FLAGCOL = [['#12040a', '#c4121c'], ['#12040a', '#c4121c'], ['#12040a', '#c4121c'], ['#12040a', '#c4121c']]; /* update 163: the Cum City flag is black, red, black (his rule) */
function flagSpots() { if (FLAGS) return FLAGS; FLAGS = []; function add(x, z, h, c) { if (!(x > 0 && z > 0)) return; var k = kAt(x, z); if (isWaterK(k) || k === K_ROAD || k === K_BRIDGE) return; for (var i = 0; i < FLAGS.length; i++) if (dist2(FLAGS[i].x, FLAGS[i].z, x, z) < 9) return; if (near(BGRID, x, z, 3).some(function (b) { return x > b.x0 - 1.5 && x < b.x1 + 1.5 && z > b.z0 - 1.5 && z < b.z1 + 1.5; }) || near(SOLID, x, z, 2).some(function (b) { return x > b.x0 - 0.8 && x < b.x1 + 0.8 && z > b.z0 - 0.8 && z < b.z1 + 0.8; })) return; FLAGS.push({ x: x, z: z, y: groundY(x, z), h: h || 9, c: c || 0, ph: Math.random() * 6 }); }
  poisOf('statue').forEach(function (p) { add(p.x + 6.5, p.z + 6.5, 10, 0); add(p.x - 6.5, p.z + 6.5, 10, 1); add(p.x + 6.5, p.z - 6.5, 10, 1); add(p.x - 6.5, p.z - 6.5, 10, 0); });
  poisOf('gate').forEach(function (p) { add(p.x + 12, p.z, 11, 3); add(p.x - 12, p.z, 11, 3); });
  poisOf('terminal').forEach(function (p) { for (var i = -1; i <= 1; i++) add(p.x + i * 6, p.z + 24, 12, 2); });
  poisOf('village').forEach(function (p) { add(p.x + 5, p.z - 5, 8, 2); });
  poisOf('castle').forEach(function (p) { add(p.x + 26, p.z + 54, 12, 1); add(p.x - 26, p.z + 54, 12, 1); });
  poisOf('church').forEach(function (p) { add(p.x + 8, p.z + 8, 8, 2); });
  poisOf('motel').forEach(function (p) { add(p.x + 10, p.z + 10, 9, 0); });
  poisOf('petrol').forEach(function (p) { add(p.x + 7, p.z - 7, 9, 3); });
  return FLAGS; }
function flagPole(h) { FLAGPOLE = FLAGPOLE || {}; if (FLAGPOLE[h]) return FLAGPOLE[h]; var m = new R3.Mesh(); tub(m, [0, 0, 0], [0, h, 0], 0.08, 0.05, '#2a2a30', 8); boxC(m, -0.14, 0, -0.14, 0.14, 0.3, 0.14, '#3a3a40'); boxC(m, -0.07, h, -0.07, 0.07, h + 0.12, 0.07, '#ffe36a'); return (FLAGPOLE[h] = m.upload()); }
function drawFlags() { var W = lifeWind(), wa = Math.atan2(W[0], W[1]) + Math.PI, ws = Math.hypot(W[0], W[1]);
  flagSpots().forEach(function (F) { if (dist2(F.x, F.z, CAM.x, CAM.z) > 160 * 160 || !inView(F.x, F.z, 4)) return;
    R3.draw(flagPole(F.h), ATT, { m: MD(F.x, F.y, F.z, 0, 0, 0) });
    var m = new R3.Mesh(), C = FLAGCOL[F.c], NX = 7, NY = 3, L = 2.6, Hh = 1.6, top = F.y + F.h - 0.1, T = TL('white'), t = G.t * (2.4 + ws) + F.ph;
    function pt(u, v) { var s = u * L, wave = Math.sin(t - u * 5.5) * 0.28 * u + Math.sin(t * 1.7 - u * 9 + v * 2) * 0.06 * u, droop = (1 - Math.min(1, ws)) * u * 0.6; return [F.x + Math.sin(wa) * s + Math.cos(wa) * wave, top - v * Hh - droop * u, F.z + Math.cos(wa) * s - Math.sin(wa) * wave]; }
    for (var i = 0; i < NX; i++) for (var j = 0; j < NY; j++) { var u0 = i / NX, u1 = (i + 1) / NX, v0 = j / NY, v1 = (j + 1) / NY, hex = j === 1 ? C[1] : C[0], sh = 0.42 + 0.12 * Math.sin(t - (u0 + u1) * 2.75);
      var c = rgb01(hex).map(function (q) { return q * sh; }), a = pt(u0, v0), b = pt(u1, v0), cc = pt(u1, v1), d = pt(u0, v1);
      m.quad(a, b, cc, d, UV1, T, c, [Math.cos(wa), 0, -Math.sin(wa)]); m.quad(d, cc, b, a, UV1, T, c, [-Math.cos(wa), 0, Math.sin(wa)]); }
    R3.draw(m, ATT, { lit: false }); }); }
(function () { var sf = stepFun; stepFun = function (dt) { sf(dt); stepLife(dt); }; var df = drawFun; drawFun = function () { df(); drawLife(); }; })();
