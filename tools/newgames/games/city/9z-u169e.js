/* ---------- update 169: new places and things to do (his asks) ---------- */
BLIPS.act = '#4adfff'; BLIPS.rail = '#c48aff';
function rngOf(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function distCentre(id) { var sx = 0, sz = 0, n = 0, di = -1; DIST.forEach(function (d, i) { if (d.id === id) di = i; }); if (di < 0) return null; for (var t = 0; t < MW * MH; t += 7) if (DM[t] === di) { sx += t % MW; sz += Math.floor(t / MW); n++; } return n ? { x: (sx / n + 0.5) * CT, z: (sz / n + 0.5) * CT } : null; }
function tileNear(x, z, okFn, R) { var ci = Math.floor(x / CT), cj = Math.floor(z / CT); for (var r = 0; r < (R || 40); r++) for (var dj = -r; dj <= r; dj++) for (var di = -r; di <= r; di++) { if (Math.abs(di) !== r && Math.abs(dj) !== r) continue; var i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= MW || j >= MH) continue; if (okFn(KM[j * MW + i], i, j)) return { x: i * CT + 2, z: j * CT + 2 }; } return null; }
function onPave(x, z) { return tileNear(x, z, function (k) { return k === K_PAVE; }, 30) || { x: x, z: z }; }
function nearRoadPt(x, z) { var r = nearestRoad(x, z, 400); return r ? { x: r.x, z: r.z, r: r } : { x: x, z: z }; }

/* ================================ SEAMEN BEACH ================================ */
/* towels and parasols, people sunbathing on them, a beach party with a DJ, speakers, a bonfire and dancers, a beach bar,
   deckchairs and a lifeguard tower. You can lie on a free towel and sunbathe, dance at the party, and buy a drink. */
var BEACH = null;
function beachPlan() { if (BEACH) return BEACH; var bi = -1; DIST.forEach(function (d, i) { if (d.id === 'beach') bi = i; }); var tiles = [];
  for (var t = 0; t < MW * MH; t++) if (DM[t] === bi && KM[t] === K_SAND) { var i = t % MW, j = (t - i) / MW, wet = false; for (var q = -2; q <= 2 && !wet; q++) for (var r = -2; r <= 2; r++) { var n = (j + q) * MW + i + r; if (n >= 0 && n < MW * MH && isWaterK(KM[n])) { wet = true; break; } } if (!wet) tiles.push([i, j]); }
  var R = rngOf(16909), B = { towels: [], chairs: [], tiles: tiles }; if (!tiles.length) { BEACH = B; return B; }
  // the party where the beach is widest (the most dry sand round it)
  var bestN = 0, cen = tiles[0]; for (var k = 0; k < tiles.length; k += 9) { var c = tiles[k], n2 = 0; for (var k2 = 0; k2 < tiles.length; k2 += 3) { var o = tiles[k2]; if (Math.abs(o[0] - c[0]) < 7 && Math.abs(o[1] - c[1]) < 7) n2++; } if (n2 > bestN) { bestN = n2; cen = c; } }
  B.party = { x: cen[0] * CT + 2, z: cen[1] * CT + 2 };
  var ft = tiles.filter(function (c) { return Math.hypot(c[0] * CT - B.party.x, c[1] * CT - B.party.z) > 22; }); for (var q2 = 0; q2 < Math.min(70, ft.length); q2++) { var c2 = ft[Math.floor(R() * ft.length)], x = c2[0] * CT + R() * 3 + 0.5, z = c2[1] * CT + R() * 3 + 0.5;
    if (B.towels.some(function (o) { return Math.hypot(o.x - x, o.z - z) < 4; })) continue; B.towels.push({ x: x, z: z, a: R() * 6.28, c: ['#c4121c', '#f1e7d0', '#ffe36a', '#4adfff', '#ff7ab0', '#7aff6a'][Math.floor(R() * 6)], par: R() < 0.6, pc: ['#c4121c', '#ffe36a', '#4adfff', '#f1e7d0'][Math.floor(R() * 4)], who: R() < 0.72, id: q2 }); }
  for (var q3 = 0; q3 < 14; q3++) { var c3 = ft[Math.floor(R() * ft.length)]; if (!c3) break; B.chairs.push({ x: c3[0] * CT + 2, z: c3[1] * CT + 2, a: R() * 6.28 }); }
  B.bar = { x: B.party.x + 14, z: B.party.z - 6 }; B.tower = { x: B.party.x - 26, z: B.party.z + 10 }; BEACH = B; return B; }
var BEACHM = null;
function beachMesh() { if (BEACHM) return BEACHM; var B = beachPlan(), m = new R3.Mesh(), gl = new R3.Mesh();
  function flat(x, z, a, w, d, col, lift) { var c = Math.cos(a), s = Math.sin(a), y = groundY(x, z) + (lift || 0.03); function P2(u, v) { return [x + u * c + v * s, y, z - u * s + v * c]; } m.quad(P2(-w, -d), P2(-w, d), P2(w, d), P2(w, -d), UV1, TL('cloth'), (function () { var h = col.replace('#', ''); return [parseInt(h.substr(0, 2), 16) / 510 + 0.1, parseInt(h.substr(2, 2), 16) / 510 + 0.1, parseInt(h.substr(4, 2), 16) / 510 + 0.1]; })(), [0, 1, 0]); }
  B.towels.forEach(function (T) { flat(T.x, T.z, T.a, 0.55, 1.0, T.c); boxR(m, T.x, T.z, T.a, 0.5, 0.06, groundY(T.x, T.z) + 0.03, groundY(T.x, T.z) + 0.06, T.c); // the towel and a rolled end
    if (T.par) { var px = T.x + Math.cos(T.a) * 0.9, pz = T.z - Math.sin(T.a) * 0.9, gy = groundY(px, pz); tub(m, [px, gy, pz], [px, gy + 2.3, pz], 0.03, 0.03, '#f1e7d0', 5); for (var k = 0; k < 8; k++) { var a0 = k / 8 * 6.283, a1 = (k + 1) / 8 * 6.283; m.tri([px, gy + 2.5, pz], [px + Math.cos(a1) * 1.4, gy + 2.05, pz + Math.sin(a1) * 1.4], [px + Math.cos(a0) * 1.4, gy + 2.05, pz + Math.sin(a0) * 1.4], [0.5, 0, 1, 1, 0, 1], TL('cloth'), k % 2 ? [0.6, 0.6, 0.6] : [0.45, 0.2, 0.2], [0, 1, 0]); } } });
  B.chairs.forEach(function (C) { var gy = groundY(C.x, C.z); boxR(m, C.x, C.z, C.a, 0.3, 0.6, gy + 0.25, gy + 0.3, '#f1e7d0'); boxR(m, C.x - Math.sin(C.a) * 0.55, C.z - Math.cos(C.a) * 0.55, C.a, 0.3, 0.08, gy + 0.3, gy + 0.9, '#4adfff'); [[-0.25, -0.5], [0.25, -0.5], [-0.25, 0.5], [0.25, 0.5]].forEach(function (l) { var lx = C.x + l[0] * Math.cos(C.a) + l[1] * Math.sin(C.a), lz = C.z - l[0] * Math.sin(C.a) + l[1] * Math.cos(C.a); tub(m, [lx, gy, lz], [lx, gy + 0.27, lz], 0.02, 0.02, '#c8c8c0', 4); }); });
  // the party: a DJ booth on a deck, two speaker stacks, lights on poles and a bonfire
  var Pp = B.party, py = groundY(Pp.x, Pp.z); boxC(m, Pp.x - 5, py, Pp.z + 6, Pp.x + 5, py + 0.4, Pp.z + 10, '#6a4a2a'); boxC(m, Pp.x - 1.6, py + 0.4, Pp.z + 7, Pp.x + 1.6, py + 1.4, Pp.z + 8, '#12040a'); boxC(gl, Pp.x - 1.6, py + 1.35, Pp.z + 6.98, Pp.x + 1.6, py + 1.42, Pp.z + 7.02, '#ff7ab0');
  [-1, 1].forEach(function (s) { var sx = Pp.x + s * 4; for (var lv = 0; lv < 2; lv++) { boxC(m, sx - 0.7, py + 0.4 + lv * 1.2, Pp.z + 7.2, sx + 0.7, py + 1.5 + lv * 1.2, Pp.z + 8.4, '#0e0e10'); tub(m, [sx, py + 0.95 + lv * 1.2, Pp.z + 7.18], [sx, py + 0.95 + lv * 1.2, Pp.z + 7.12], 0.38, 0.3, '#2a2a2e', 12, { cap: 1 }); }
    tub(m, [sx + s * 1.4, py, Pp.z + 6], [sx + s * 1.4, py + 5, Pp.z + 6], 0.06, 0.06, '#2a2a2e', 5); ell(gl, sx + s * 1.4, py + 5.1, Pp.z + 6, 0.25, 0.2, 0.25, s < 0 ? '#ff2630' : '#4adfff', 6, 4); });
  for (var lg = 0; lg < 6; lg++) { var la = lg / 6 * 6.283; tub(m, [Pp.x + Math.cos(la) * 0.7, py, Pp.z - 2 + Math.sin(la) * 0.7], [Pp.x - Math.cos(la) * 0.3, py + 0.5, Pp.z - 2 - Math.sin(la) * 0.3], 0.1, 0.08, '#4a2a18', 5); } // the bonfire's logs
  [[-6, -6], [6, -6], [-7, 2], [7, 2]].forEach(function (q) { var x = Pp.x + q[0], z = Pp.z + q[1], gy = groundY(x, z); tub(m, [x, gy, z], [x, gy + 2.4, z], 0.07, 0.06, '#5a3a20', 5); ell(gl, x, gy + 2.5, z, 0.12, 0.2, 0.12, '#ffb030', 5, 4); }); // tiki torches
  // the beach bar: a thatched hut with a counter and stools
  var Bb = B.bar, by = groundY(Bb.x, Bb.z); boxC(m, Bb.x - 3, by, Bb.z - 1.2, Bb.x + 3, by + 1.1, Bb.z - 0.5, '#7a5a34'); boxC(m, Bb.x - 3.2, by + 1.1, Bb.z - 1.3, Bb.x + 3.2, by + 1.18, Bb.z - 0.4, '#5a3a20');
  [[-2.9, -2.6], [2.9, -2.6], [-2.9, 0.4], [2.9, 0.4]].forEach(function (q) { tub(m, [Bb.x + q[0], by, Bb.z + q[1]], [Bb.x + q[0], by + 2.6, Bb.z + q[1]], 0.08, 0.08, '#6a4a2a', 5); }); roofP(m, Bb.x - 3.4, Bb.z - 3.0, Bb.x + 3.4, Bb.z + 0.8, by + 2.6, 1.2, 'leaves', true, 'plank');
  for (var st = 0; st < 4; st++) { var sx2 = Bb.x - 2.2 + st * 1.45; tub(m, [sx2, by, Bb.z + 0.3], [sx2, by + 0.75, Bb.z + 0.3], 0.04, 0.04, '#5a3a20', 4); tub(m, [sx2, by + 0.75, Bb.z + 0.3], [sx2, by + 0.8, Bb.z + 0.3], 0.22, 0.22, '#c4121c', 8, { cap: 1 }); }
  sign(m, null, Bb.x, Bb.z - 1.3, Math.PI, by + 2.0, 'sg_bbar', 2.6);
  // the lifeguard tower
  var Tw = B.tower, ty = groundY(Tw.x, Tw.z); [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(function (q) { tub(m, [Tw.x + q[0], ty, Tw.z + q[1]], [Tw.x + q[0] * 0.7, ty + 3, Tw.z + q[1] * 0.7], 0.07, 0.06, '#f1e7d0', 5); });
  boxC(m, Tw.x - 1.2, ty + 3, Tw.z - 1.2, Tw.x + 1.2, ty + 3.15, Tw.z + 1.2, '#c4121c'); boxC(m, Tw.x - 1.1, ty + 3.15, Tw.z - 1.1, Tw.x + 1.1, ty + 4.6, Tw.z - 1.0, '#c4121c'); boxC(m, Tw.x - 1.25, ty + 4.6, Tw.z - 1.25, Tw.x + 1.25, ty + 4.75, Tw.z + 1.25, '#f1e7d0');
  BEACHM = { m: m.upload(), gl: gl.upload() }; return BEACHM; }
HIPAINT.sg_bbar = parkSign('THE SALTY LOAD', '#12040a', '#ffe36a'); HIPAINT.sg_mall = parkSign('SPERM WORLD', '#12040a', '#ff7ab0'); HIPAINT.sg_rail = parkSign('SPUZZRAIL', '#12040a', '#c48aff');
var BEACHP = [], BEACHON = false;
function beachPeople(on) { if (on === BEACHON) return; BEACHON = on; PEDS = PEDS.filter(function (p) { return !p.beach; }); BEACHP = []; if (!on || (G.guest && G.netSync)) return; var B = beachPlan(), R = rngOf(4242);
  B.towels.forEach(function (T) { if (!T.who) return; var p = makePed({ x: T.x, z: T.z, a: T.a, kind: 'cit', rig: rigFor('cit'), state: 'idle', keep: 1 }); p.beach = 1; p.towel = T; T.taken = p; p.y = groundY(T.x, T.z) + 0.08; var face = R() < 0.3;
    p.pose = function (Q) { poseDown(Q, 1, face); Q.sh[0] = [0.4, 1.9, 0]; Q.sh[1] = [0.4, 1.9, 0]; }; p.ctl = function (q) { q.vx = q.vz = 0; q.x = T.x; q.z = T.z; q.a = T.a; }; BEACHP.push(p); });
  for (var k = 0; k < 14; k++) { var a = k / 14 * 6.283, r = 3.5 + R() * 2.5, x = B.party.x + Math.cos(a) * r, z = B.party.z + Math.sin(a) * r + 1; var p2 = makePed({ x: x, z: z, a: Math.atan2(B.party.x - x, B.party.z + 7 - z), kind: 'cit', rig: rigFor('cit'), state: 'idle', keep: 1 }); p2.beach = 1; p2.danceT = 1e9;
    (function (px, pz) { p2.ctl = function (q) { q.vx = q.vz = 0; q.x = px; q.z = pz; }; })(x, z); BEACHP.push(p2); }
  var dj = makePed({ x: B.party.x, z: B.party.z + 8.2, a: Math.PI, kind: 'cit', who: 'pulsar', rig: rigOf('pulsar'), state: 'idle', keep: 1 }); dj.beach = 1; dj.god = 1; dj.y = groundY(B.party.x, B.party.z) + 0.4; dj.danceT = 1e9; dj.ctl = function (q) { q.vx = q.vz = 0; q.x = B.party.x; q.z = B.party.z + 8.2; q.a = Math.PI; }; BEACHP.push(dj);
  var bk = makePed({ x: B.bar.x, z: B.bar.z - 2, a: 0, kind: 'cit', rig: rigFor('cit'), state: 'idle', keep: 1 }); bk.beach = 1; bk.god = 1; bk.ctl = function (q) { q.vx = q.vz = 0; q.x = B.bar.x; q.z = B.bar.z - 2; q.a = 0; }; BEACHP.push(bk);
  B.chairs.forEach(function (C) { addSeat(C.x, C.z, C.a, 'chair', { y: groundY(C.x, C.z) + 0.32 }); }); }
var FIREM = null;
function stepBeach(dt) { if (G.interior) { beachPeople(false); return; } var B = beachPlan(); if (!B.party) return; var d = Math.hypot(P.x - B.party.x, P.z - B.party.z); beachPeople(d < 260);
  // the party's music comes out of the speakers when you are on foot near it
  var near = d < 45 && P.state !== 'car'; if (near && !G.partyRadio && !RAD.on) { var idx = 1; STATIONS.forEach(function (s, i) { if (s.id === 'bl') idx = i; }); RAD.st = idx; RAD.on = true; RAD.seg = null; G.partyRadio = 1; try { radioNextSeg(); } catch (e) {} }
  else if (!near && G.partyRadio) { G.partyRadio = 0; radioOff(); }
  if (G.sunT) { G.sunT -= dt; P.hp = Math.min(SV.maxHp, P.hp + dt * 4); if (G.sunT <= 0 || Math.hypot(KIT.stick(0).x, KIT.stick(0).y) > 0.6) { G.sunT = 0; G.sunTowel = null; P.y = standY(P.x, P.z, P.y + 1); toast('That was lovely. You smell of coconut.'); } } }
(function () { var sr = stepRadio; stepRadio = function (dt) { if (G.partyRadio && RAD.on && P.state !== 'car') { var st = P.state; P.state = 'car'; try { return sr(dt); } finally { P.state = st; } } return sr(dt); }; })();

/* ================================ SPERM WORLD (the mall) ================================ */
var MALL = null;
function mallSite() { if (MALL) return MALL; var cw = 24, ch = 18, best = { i: 408, j: 424 }; // open country by the main road, south side on the road

  var x0 = best.i * CT + 3, z0 = best.j * CT + 3, x1 = (best.i + cw) * CT - 3, z1 = (best.j + ch) * CT - 3; MALL = { x0: x0, z0: z0, x1: x1, z1: z1, y: groundY((x0 + x1) / 2, z1), door: { x: (x0 + x1) / 2, z: z1 + 1.6 } }; return MALL; }
var MALLM = null;
function mallExterior() { if (MALLM) return MALLM; var M0 = mallSite(), m = new R3.Mesh(), gl = new R3.Mesh(), x0 = M0.x0, z0 = M0.z0, x1 = M0.x1, z1 = M0.z1, cx = (x0 + x1) / 2, y = M0.y, H = 16;
  boxT(m, x0, y - 2, z0, x1, y + H, z1, { wall: 'w_down2', top: 'concrete', u: (x1 - x0) / 6, v: (H + 2) / 6 }); // the main hall
  boxC(m, x0 - 0.3, y + H, z0 - 0.3, x1 + 0.3, y + H + 0.8, z1 + 0.3, '#12040a'); boxC(gl, x0 - 0.32, y + H + 0.3, z1 + 0.28, x1 + 0.32, y + H + 0.45, z1 + 0.34, '#ff7ab0'); // parapet and a pink light line
  // the glass atrium over the entrance, a canopy and the big sign
  boxT(m, cx - 14, y, z1, cx + 14, y + H + 4, z1 + 3, { wall: 'w_glass', top: 'steel', u: 7, v: 5 }); boxC(gl, cx - 14.1, y + H + 3.6, z1 + 2.9, cx + 14.1, y + H + 4.1, z1 + 3.1, '#4adfff');
  boxC(m, cx - 9, y + 4.2, z1 + 3, cx + 9, y + 4.6, z1 + 9, '#1a1a1e'); boxC(gl, cx - 9, y + 4.15, z1 + 8.9, cx + 9, y + 4.25, z1 + 9.05, '#ff7ab0'); [-8, -3, 3, 8].forEach(function (o) { tub(m, [cx + o, y, z1 + 8.6], [cx + o, y + 4.2, z1 + 8.6], 0.15, 0.15, '#c8c8c0', 8); });
  for (var q = 0; q < 6; q++) { var sx = cx - 3.6 + q * 1.44; boxC(m, sx - 0.65, y, z1 + 3.0, sx + 0.65, y + 3.2, z1 + 3.12, '#2a3848'); boxC(gl, sx - 0.02, y + 0.2, z1 + 3.13, sx + 0.02, y + 3.0, z1 + 3.16, '#c8e8ff'); } // the doors
  boxC(m, cx - 9.4, y + H - 4.2, z1 + 3.0, cx + 9.4, y + H + 3.8, z1 + 3.15, '#12040a'); standQ(gl, cx, z1 + 3.2, 0, 18, y + H - 4, y + H + 3.56, TL('sg_mall'), 0, 0, SGUV);
  // a big cream droplet on the roof
  var dx = cx, dz = (z0 + z1) / 2; ell(m, dx, y + H + 6, dz, 4, 5, 4, '#f1e7d0', 14, 10); tub(m, [dx, y + H + 10.5, dz], [dx + 1.2, y + H + 13, dz + 0.4], 1.4, 0.2, '#f1e7d0', 10, { cap: 1 }); ell(gl, dx - 1.2, y + H + 6.6, dz + 3.6, 0.5, 0.7, 0.2, '#12040a', 6, 4); ell(gl, dx + 1.2, y + H + 6.6, dz + 3.6, 0.5, 0.7, 0.2, '#12040a', 6, 4);
  tub(m, [dx, y + H, dz], [dx, y + H + 1.2, dz], 3, 3, '#3a3a3e', 14, { cap: 1 });
  // the car park in front: lines and lamps
  for (var k = -6; k <= 6; k++) { if (Math.abs(k) < 2) continue; var lx = cx + k * 3.4; m.quad([lx - 0.06, y + 0.06, z1 + 10], [lx - 0.06, y + 0.06, z1 + 15], [lx + 0.06, y + 0.06, z1 + 15], [lx + 0.06, y + 0.06, z1 + 10], UV1, TL('white'), [0.6, 0.6, 0.6], [0, 1, 0]); }
  addBox(x0, z0, x1, z1, y - 2, y + H); addBox(cx - 14, z1, cx - 2.5, z1 + 3, y, y + H + 4); addBox(cx + 2.5, z1, cx + 14, z1 + 3, y, y + H + 4);
  MALLM = { m: m.upload(), gl: gl.upload() }; return MALLM; }
ROOMS.mall = { wall: 'tilew', floor: 'marble', keeper: null, props: [], w: 44, d: 60, h: 11, place: 'mall' };
var MALLSHOPS = [
  { n: "DRIPPY'S DONUTS", c: '#ff7ab0', items: [['A glazed Drippy (+30 health)', 8, function () { P.hp = Math.min(SV.maxHp, P.hp + 30); }], ['A box of twelve (full health)', 30, function () { P.hp = SV.maxHp; }]] },
  { n: 'LOAD & CO', c: '#f1e7d0', items: [['A smart new coat (armour +40)', 120, function () { P.armour = Math.min(100, (P.armour || 0) + 40); }], ['Lucky socks (+5 max health)', 400, function () { SV.maxHp = (SV.maxHp || 100) + 5; }, 'socks']] },
  { n: 'SPUNK ELECTRONICS', c: '#4adfff', items: [['A phone charger (nothing happens)', 15, function () { toast('It does not fit your phone. Of course it doesn\'t.'); }], ['Noise-cancelling headphones (radio louder)', 90, function () { toast('The radio sounds amazing now. Probably.'); }]] },
  { n: 'THE AMMO SHACK', c: '#c4121c', items: [['Pistol rounds (30)', 60, function () { SV.ammo['9mm'] = (SV.ammo['9mm'] || 0) + 30; }], ['Shells (12)', 80, function () { SV.ammo.shells = (SV.ammo.shells || 0) + 12; }]] },
  { n: 'CONDOM CASTLE', c: '#ffe36a', items: [['A pack of condoms (armour +25)', 40, function () { P.armour = Math.min(100, (P.armour || 0) + 25); }]] },
  { n: 'SABA EXPRESS', c: '#7aff6a', items: [['Hemp Joints (5)', 40, function () { SV.joints = (SV.joints || 0) + 5; }]] },
  { n: 'CREAM CINEMA', c: '#c48aff', items: [['Watch a film (two hours pass, you feel rested)', 12, function () { G.fade = 1.4; G.time = (G.time + 2) % 24; P.hp = SV.maxHp; toast('Cumhead Kart: The Movie. Four stars.'); }]] },
  { n: 'STICKY TOYS', c: '#ff2630', items: [['A Cumhead plushie (a souvenir)', 25, function () { SV.plush = (SV.plush || 0) + 1; toast('You now own ' + SV.plush + ' Cumhead plushie' + (SV.plush > 1 ? 's' : '') + '.'); }]] },
  { n: 'GREEBO\'S PIE STAND', c: '#d8a050', items: [['A cream pie (+40 health)', 10, function () { P.hp = Math.min(SV.maxHp, P.hp + 40); }]] },
  { n: 'SEAMEN SURF', c: '#4adfff', items: [['A beach towel (sunbathe anywhere on the beach)', 20, function () { SV.towel = 1; }]] }];
MALLSHOPS.forEach(function (S, i) { HIPAINT['sg_ms' + i] = parkSign(S.n, '#12040a', S.c); });
(function () { var rmP = roomMesh; roomMesh = function (id) { var RM = rmP(id), R0 = ROOMS[id]; if (!R0 || R0.place !== 'mall') return RM; var m = new R3.Mesh(), gl = new R3.Mesh(), w = RM.w, d = RM.d, h = R0.h, cx = w / 2, L = [];
  // shop units down both sides: a glass front, a lit name board, a counter inside
  RM.units = []; for (var k = 0; k < 10; k++) { var side = k < 5 ? -1 : 1, z = 8 + (k % 5) * 9.5, x0 = side < 0 ? 0 : w - 7, x1 = side < 0 ? 7 : w, fx = side < 0 ? 7 : w - 7, S = MALLSHOPS[k];
    boxC(m, Math.min(x0, x1), 0, z - 4.2, Math.max(x0, x1), h, z - 4.0, '#e8e4dc'); boxC(m, Math.min(x0, x1), 0, z + 4.0, Math.max(x0, x1), h, z + 4.2, '#e8e4dc');
    boxC(m, fx - 0.1, 3.4, z - 4.2, fx + 0.1, h, z + 4.2, '#e8e4dc'); boxC(gl, fx - 0.15 * side, 3.6, z - 3.6, fx - 0.15 * side - 0.02 * side, 4.6, z + 3.6, S.c); standQ(gl, fx - 0.2 * side, z, side < 0 ? Math.PI / 2 : -Math.PI / 2, 4.05, 3.45, 5.15, TL('sg_ms' + k), 0, 0, SGUV);
    [-1, 1].forEach(function (e) { boxC(m, fx - 0.06, 0, z + e * 3.9 - 0.06, fx + 0.06, 3.4, z + e * 3.9 + 0.06, '#c8c8c0'); }); boxC(m, fx - 0.03, 0, z - 3.85, fx + 0.03, 3.3, z - 1.4, '#3a4a5a'); boxC(m, fx - 0.03, 0, z + 1.4, fx + 0.03, 3.3, z + 3.85, '#3a4a5a');
    var cxx = side < 0 ? 2.2 : w - 2.2; boxC(m, cxx - 0.6, 0, z - 2.5, cxx + 0.6, 1.1, z + 2.5, '#2a2a2e'); boxC(gl, cxx - 0.62, 1.05, z - 2.5, cxx + 0.62, 1.1, z + 2.5, S.c); RM.boxes.push([cxx - 0.6, z - 2.5, cxx + 0.6, z + 2.5]);
    for (var sh = 0; sh < 3; sh++) boxC(m, side < 0 ? 0.05 : w - 0.6, 0.6 + sh * 0.8, z - 3.5, side < 0 ? 0.6 : w - 0.05, 0.66 + sh * 0.8, z + 3.5, '#5a3a20');
    RM.units.push({ k: k, x: side < 0 ? 4.6 : w - 4.6, z: z, kx: cxx + (side < 0 ? -0.1 : 0.1), side: side }); L.push({ x: side < 0 ? 3.5 : w - 3.5, y: 3.2, z: z, r: 7, c: [1, 0.95, 0.9], k: 0.8 }); }
  // the fountain with a cream droplet, benches round it, palms in pots, the escalators to the gallery
  var fz = 22; tub(m, [cx, 0, fz], [cx, 0.6, fz], 4, 4, '#c8c4bc', 20, { cap: 1 }); tub(gl, [cx, 0.62, fz], [cx, 0.64, fz], 3.7, 3.7, '#4aa8ff', 20, { cap: 1 }); ell(m, cx, 2.2, fz, 1.0, 1.3, 1.0, '#f1e7d0', 12, 8); tub(m, [cx, 3.3, fz], [cx + 0.4, 4.0, fz], 0.35, 0.05, '#f1e7d0', 8, { cap: 1 }); RM.boxes.push([cx - 4, fz - 4, cx + 4, fz + 4]);
  [[cx - 6, fz, Math.PI / 2], [cx + 6, fz, -Math.PI / 2], [cx, fz - 6, 0], [cx, fz + 6, Math.PI]].forEach(function (b) { boxR(m, b[0], b[1], b[2], 1.2, 0.3, 0.4, 0.48, '#5a3a20'); });
  [[11, 6], [w - 11, 6], [11, 40], [w - 11, 40]].forEach(function (q) { tub(m, [q[0], 0, q[1]], [q[0], 0.8, q[1]], 0.5, 0.4, '#3a3a3e', 10, { cap: 1 }); tub(m, [q[0], 0.8, q[1]], [q[0], 3.2, q[1]], 0.12, 0.1, '#6a4a2a', 6); for (var f = 0; f < 6; f++) { var fa = f / 6 * 6.283; tub(m, [q[0], 3.2, q[1]], [q[0] + Math.cos(fa) * 1.4, 2.6, q[1] + Math.sin(fa) * 1.4], 0.15, 0.02, '#3a7a2a', 4); } RM.boxes.push([q[0] - 0.5, q[1] - 0.5, q[0] + 0.5, q[1] + 0.5]); });
  // the gallery round the top with a glass rail, and escalators up to it (for show)
  [[0, 7.5], [w - 7.5, w]].forEach(function (r) { boxC(m, r[0], 5.2, 2, r[1], 5.5, d - 8, '#e8e4dc'); boxC(gl, r[0] === 0 ? 7.45 : w - 7.55, 5.5, 2, r[0] === 0 ? 7.55 : w - 7.45, 6.5, d - 8, '#bfe2ff'); });
  [cx - 3, cx + 3].forEach(function (ex, i) { var z0 = 30, z1 = 38; m.quad([ex - 0.6, 0.02, z0], [ex - 0.6, 5.2, z1], [ex + 0.6, 5.2, z1], [ex + 0.6, 0.02, z0], uvR(1, 8), TL('grate'), [0.55, 0.55, 0.55], [0, 0.8, -0.6]); [-0.65, 0.65].forEach(function (s) { boxC(gl, ex + s - 0.03, 0.9, z0, ex + s + 0.03, 1.0, z0 + 0.1, '#4adfff'); }); RM.boxes.push([ex - 0.7, z0, ex + 0.7, z1]); });
  // the food court at the back: tables with stools and a big screen
  RM.food = []; for (var tx = 0; tx < 4; tx++) for (var tz = 0; tz < 2; tz++) { var X = 12 + tx * 6.5, Z = 46 + tz * 5; tub(m, [X, 0, Z], [X, 0.75, Z], 0.08, 0.08, '#2a2a2e', 6); tub(m, [X, 0.75, Z], [X, 0.8, Z], 0.9, 0.9, '#f1e7d0', 12, { cap: 1 }); RM.boxes.push([X - 0.9, Z - 0.9, X + 0.9, Z + 0.9]);
    [[1.4, 0], [-1.4, 0]].forEach(function (o) { tub(m, [X + o[0], 0, Z], [X + o[0], 0.5, Z], 0.05, 0.05, '#2a2a2e', 5); tub(m, [X + o[0], 0.5, Z], [X + o[0], 0.56, Z], 0.3, 0.3, '#c4121c', 8, { cap: 1 }); RM.food.push({ x: X + o[0], z: Z, a: o[0] > 0 ? -Math.PI / 2 : Math.PI / 2 }); }); }
  standQ(gl, cx, d - 0.1, Math.PI, 14, 4, 11, TL('bb_twitch'), 0, 0);
  for (var lz = 6; lz < d - 4; lz += 10) L.push({ x: cx, y: h - 1, z: lz, r: 16, c: [1, 0.95, 0.9], k: 0.9 }); L.push({ x: cx, y: 2.5, z: fz, r: 8, c: [0.5, 0.8, 1], k: 0.8 });
  for (var sk = 0; sk < 4; sk++) m.quad([cx - 6, h - 0.02, 6 + sk * 12], [cx + 6, h - 0.02, 6 + sk * 12], [cx + 6, h - 0.02, 12 + sk * 12], [cx - 6, h - 0.02, 12 + sk * 12], UV1, TL('w_glass'), [0.8, 0.9, 1], [0, -1, 0]); // skylights
  RM.extra3 = m.upload(); RM.glow3 = gl.upload(); RM.lights = L; return RM; }; })();
function mallShopMenu(k) { var S = MALLSHOPS[k]; KIT.menu({ title: S.n, sub: 'Sperm World', items: S.items.map(function (it) { var owned = it[3] && SV[it[3]]; return { label: it[0] + '  ·  $' + it[1], dis: SV.money < it[1] || owned, fn: function () { KIT.confirm({ title: it[0], price: it[1], have: Math.floor(SV.money), unit: '$', yes: function () { money(-it[1]); it[2](); if (it[3]) SV[it[3]] = 1; sfx.play('coin'); persist(); mallShopMenu(k); }, no: function () { mallShopMenu(k); } }); } }; }).concat([{ label: 'BACK', back: true, fn: KIT.closeMenu }]) }); }
(function () { var es = enterShop; enterShop = function (id, homeId, special) { var r = es.apply(this, arguments); var I = G.interior; if (special !== 'mall' || !I) return r; var RM = I.RM, M0 = mallSite();
  I.exitX = M0.door.x; I.exitZ = M0.door.z + 1.5; I.exitA = 0; G.indoorUses = [{ x: RM.w / 2, z: 0.6, r: 2.4, label: 'LEAVE SPERM WORLD', fn: leaveShop }];
  RM.units.forEach(function (u) { var kp = makePed({ x: u.kx, z: u.z, a: u.side < 0 ? Math.PI / 2 : -Math.PI / 2, kind: 'cit', rig: rigFor('cit'), state: 'idle', keep: 1 }); kp.inside = 'mall'; kp.god = 1; kp.ctl = function (q) { q.vx = q.vz = 0; q.x = u.kx; q.z = u.z; q.y = 0; }; kp.y = 0;
    G.indoorUses.push({ x: u.x, z: u.z, r: 2.2, label: 'SHOP AT ' + MALLSHOPS[u.k].n, fn: function () { mallShopMenu(u.k); } }); });
  RM.food.forEach(function (s, i) { G.indoorUses.push({ x: s.x, z: s.z, r: 0.8, label: 'SIT DOWN', fn: function () { sitDown({ id: 'mall' + i, x: s.x, z: s.z, a: s.a, kind: 'chair', y: 0.56 }); } }); });
  for (var k = 0; k < 22; k++) { var sx = 10 + Math.random() * (RM.w - 20), sz = 4 + Math.random() * 40, sp = makePed({ x: sx, z: sz, kind: 'cit', rig: rigFor('cit'), state: 'walk', keep: 1 }); sp.inside = 'mall'; sp.god = 1;
    (function (q0) { var tx = sx, tz = sz; q0.y = 0; q0.ctl = function (q, dt) { q.y = 0; if (Math.hypot(tx - q.x, tz - q.z) < 1) { tx = 9 + Math.random() * (RM.w - 18); tz = 3 + Math.random() * 42; if (Math.abs(tx - RM.w / 2) < 5 && Math.abs(tz - 22) < 5) tx += 7; } var a = Math.atan2(tx - q.x, tz - q.z); q.a += angDiff(q.a, a) * Math.min(1, dt * 4); q.vx = Math.sin(q.a) * 1.2; q.vz = Math.cos(q.a) * 1.2; }; })(sp); }
  return r; }; })();

/* ================================ THE SPUZZRAIL (monorail) ================================ */
/* An elevated monorail loop along the main roads: Clubhouse Row, the Red Light District, the Docks, Seamen Beach,
   Ejaculand, the Cafe Streets, Sperm World, Cum Hills, the Cumstruction Site and Spunk Brain Labs. A train runs round it
   all the time. At any station (stairs up from the street) pay $5 and ride to any other: you ride in the front car with
   the city going by below; A skips to the stop. */
var RAIL = null, RAILY = 9.5;
function railBuild() { if (RAIL) return RAIL; var order = ['club', 'red', 'docks', 'beach', 'ejac', 'cafe', 'mall', 'hills', 'site', 'brain'], names = { club: 'Clubhouse Row', red: 'Red Light District', docks: 'The Docks', beach: 'Seamen Beach', ejac: 'Ejaculand', cafe: 'The Cafe Streets', mall: 'Sperm World', hills: 'Cum Hills', site: 'The Cumstruction Site', brain: 'Spunk Brain Labs' };
  var st = []; order.forEach(function (id) { var c = id === 'mall' ? (function () { var M0 = mallSite(); return { x: M0.door.x, z: M0.door.z + 12 }; })() : id === 'beach' ? (function () { var B = beachPlan(); return B.party ? { x: B.party.x, z: B.party.z } : distCentre('beach'); })() : distCentre(id); if (!c) return; var r = nearRoadPt(c.x, c.z); st.push({ id: id, name: names[id], x: r.x, z: r.z }); });
  // the line: road routes between stations, joined into one loop, thinned and smoothed
  var pts = []; for (var i = 0; i < st.length; i++) { var A = st[i], B2 = st[(i + 1) % st.length], R = gpsRoute(A.x, A.z, B2.x, B2.z) || [[A.x, A.z], [B2.x, B2.z]]; A.at = pts.length; R.forEach(function (p) { var l = pts[pts.length - 1]; if (!l || Math.hypot(l[0] - p[0], l[1] - p[1]) > 6) pts.push([p[0], p[1]]); }); }
  // the line runs over the pavement, not down the middle of the road, so the pillars stand on the pavement
  pts = pts.map(function (p, k) { var a = pts[(k - 1 + pts.length) % pts.length], b = pts[(k + 1) % pts.length], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = dz / l, nz = -dx / l;
    for (var d = 4; d <= 14; d += 0.5) { var x = p[0] + nx * d, z = p[1] + nz * d; if (roadF(x, z) > 0.6) return [x, z]; } return [p[0] + nx * 7, p[1] + nz * 7]; });
  for (var pass = 0; pass < 3; pass++) pts = pts.map(function (p, k) { var a = pts[(k - 1 + pts.length) % pts.length], b = pts[(k + 1) % pts.length]; return [(a[0] + 2 * p[0] + b[0]) / 4, (a[1] + 2 * p[1] + b[1]) / 4]; });
  var S = [0]; for (var k = 1; k <= pts.length; k++) { var p0 = pts[k - 1], p1 = pts[k % pts.length]; S.push(S[k - 1] + Math.hypot(p1[0] - p0[0], p1[1] - p0[1])); }
  var Y = pts.map(function (p) { return groundY(p[0], p[1]); }); for (var sm = 0; sm < 30; sm++) Y = Y.map(function (y, k) { return Math.max(groundY(pts[k][0], pts[k][1]), (Y[(k - 1 + Y.length) % Y.length] + y * 2 + Y[(k + 1) % Y.length]) / 4); });
  st.forEach(function (s) { var bi = 0, bd = 1e9; pts.forEach(function (p, k) { var d = Math.hypot(p[0] - s.x, p[1] - s.z); if (d < bd) { bd = d; bi = k; } }); s.k = bi; s.s = S[bi]; var p = pts[bi], q = pts[(bi + 1) % pts.length], a = Math.atan2(q[0] - p[0], q[1] - p[1]); s.a = a; s.px = p[0]; s.pz = p[1];
    var side = 3.4; s.gx = p[0] + Math.cos(a) * side; s.gz = p[1] - Math.sin(a) * side; s.y = Y[bi] + RAILY; });
  RAIL = { st: st, pts: pts, S: S, len: S[S.length - 1], Y: Y, chunks: [], t: 0 }; railMesh(RAIL); return RAIL; }
function railAt(R, s) { s = ((s % R.len) + R.len) % R.len; var lo = 0, hi = R.S.length - 1; while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (R.S[mid] <= s) lo = mid; else hi = mid; } var p0 = R.pts[lo % R.pts.length], p1 = R.pts[(lo + 1) % R.pts.length], f = (s - R.S[lo]) / ((R.S[lo + 1] - R.S[lo]) || 1), y0 = R.Y[lo % R.pts.length], y1 = R.Y[(lo + 1) % R.pts.length];
  return { x: p0[0] + (p1[0] - p0[0]) * f, z: p0[1] + (p1[1] - p0[1]) * f, y: y0 + (y1 - y0) * f + RAILY, a: Math.atan2(p1[0] - p0[0], p1[1] - p0[1]) }; }
function railMesh(R) { var n = R.pts.length, per = 24;
  for (var c0 = 0; c0 < n; c0 += per) { var m = new R3.Mesh(), gl = new R3.Mesh(), sx = 0, sz = 0, cnt = 0;
    for (var k = c0; k < Math.min(n, c0 + per); k++) { var a = R.pts[k], b = R.pts[(k + 1) % n], ya = R.Y[k] + RAILY, yb = R.Y[(k + 1) % n] + RAILY, dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = dz / l * 0.55, nz = -dx / l * 0.55; sx += a[0]; sz += a[1]; cnt++;
      // the beam (a box along the line) and a glowing strip on its side
      m.quad([a[0] - nx, ya, a[1] - nz], [b[0] - nx, yb, b[1] - nz], [b[0] + nx, yb, b[1] + nz], [a[0] + nx, ya, a[1] + nz], uvR(l / 4, 1), TL('concrete'), [0.55, 0.55, 0.55], [0, 1, 0]);
      [-1, 1].forEach(function (s) { var ox = nx * s, oz = nz * s, nn = [ox / 0.55, 0, oz / 0.55]; m.quad([a[0] + ox, ya - 1.1, a[1] + oz], [b[0] + ox, yb - 1.1, b[1] + oz], [b[0] + ox, yb, b[1] + oz], [a[0] + ox, ya, a[1] + oz], uvR(l / 4, 0.3), TL('concrete'), lit(nn, 0.85), nn); gl.quad([a[0] + ox * 1.02, ya - 0.5, a[1] + oz * 1.02], [b[0] + ox * 1.02, yb - 0.5, b[1] + oz * 1.02], [b[0] + ox * 1.02, yb - 0.4, b[1] + oz * 1.02], [a[0] + ox * 1.02, ya - 0.4, a[1] + oz * 1.02], UV1, TL('white'), [0.77, 0.54, 1], nn); });
      m.quad([a[0] + nx, ya - 1.1, a[1] + nz], [b[0] + nx, yb - 1.1, b[1] + nz], [b[0] - nx, yb - 1.1, b[1] - nz], [a[0] - nx, ya - 1.1, a[1] - nz], uvR(l / 4, 1), TL('concrete'), [0.3, 0.3, 0.3], [0, -1, 0]);
      // a pillar every 24 m (where the ground is under it)
      if (Math.floor(R.S[k] / 24) !== Math.floor(R.S[k + 1] / 24) && roadF(a[0], a[1]) > 0.3 && !isWaterK(kAt(a[0], a[1]))) { var gy = groundY(a[0], a[1]); addBox(a[0] - 0.55, a[1] - 0.55, a[0] + 0.55, a[1] + 0.55, gy - 1, ya - 1.1); tub(m, [a[0], gy, a[1]], [a[0], ya - 1.1, a[1]], 0.55, 0.45, '#8a8480', 10); boxC(m, a[0] - 0.9, ya - 1.5, a[1] - 0.9, a[0] + 0.9, ya - 1.1, a[1] + 0.9, '#6a645e'); } }
    R.chunks.push({ m: m.upload(), gl: gl.upload(), x: sx / cnt, z: sz / cnt }); }
  // the stations: a platform beside the beam, a roof, stairs down to the street, the SPUZZRAIL sign
  var m2 = new R3.Mesh(), g2 = new R3.Mesh(); R.st.forEach(function (s) { var c = Math.cos(s.a), sn = Math.sin(s.a); function L(u, v) { return [s.px + u * c + v * sn, s.pz - u * sn + v * c]; } var y = s.y - 1.1, gy = groundY(L(2.2, -9)[0], L(2.2, -9)[1]);
    var q = [L(-3.4, -12), L(-0.7, -12), L(-0.7, 12), L(-3.4, 12)]; m2.quad([q[0][0], y + 0.3, q[0][1]], [q[3][0], y + 0.3, q[3][1]], [q[2][0], y + 0.3, q[2][1]], [q[1][0], y + 0.3, q[1][1]], uvR(2, 8), TL('tilefloor'), [0.6, 0.6, 0.6], [0, 1, 0]);
    boxR(m2, L(-2.05, 0)[0], L(-2.05, 0)[1], s.a, 1.35, 12, y - 0.3, y + 0.3, '#6a645e'); boxR(g2, L(-0.75, 0)[0], L(-0.75, 0)[1], s.a, 0.05, 12, y + 0.3, y + 0.34, '#ffe36a'); boxR(g2, L(-3.4, 0)[0], L(-3.4, 0)[1], s.a, 0.04, 12, y + 0.3, y + 1.3, '#bfe2ff');
    boxR(m2, L(-2.05, 0)[0], L(-2.05, 0)[1], s.a, 1.6, 12.2, y + 3.4, y + 3.6, '#12040a'); [[-3.3, -10], [-3.3, 10], [-3.3, 0]].forEach(function (o) { var p = L(o[0], o[1]); tub(m2, [p[0], y + 0.3, p[1]], [p[0], y + 3.4, p[1]], 0.08, 0.08, '#2a2a2e', 6); });
    // the lift tower on the pavement (glass sides, a lit top), joined to the platform by a bridge under the beam
    var lt = L(2.2, -9); boxR(m2, lt[0], lt[1], s.a, 1.1, 1.1, gy, gy + 0.2, '#6a645e'); boxR(g2, lt[0], lt[1], s.a, 1.0, 1.0, gy + 0.2, y + 3.0, '#bfe2ff'); boxR(m2, lt[0], lt[1], s.a, 1.15, 1.15, y + 3.0, y + 3.4, '#c48aff'); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (o) { var c2 = L(2.2 + o[0] * 1.05, -9 + o[1] * 1.05); tub(m2, [c2[0], gy, c2[1]], [c2[0], y + 3.0, c2[1]], 0.07, 0.07, '#2a2a2e', 5); });
    boxR(m2, L(0, -9)[0], L(0, -9)[1], s.a, 1.2, 1.0, y - 1.55, y - 1.3, '#6a645e'); addOBB(lt[0], lt[1], s.a, 1.1, 1.1, gy - 1, y + 3.4); var ld = L(2.2, -11); s.gx = ld[0]; s.gz = ld[1];
    var sg = L(-2.05, 0); standQ(g2, sg[0], sg[1], s.a + Math.PI / 2, 2.2, y + 2.4, y + 3.32, TL('sg_rail'), 0, 0, SGUV); standQ(g2, sg[0], sg[1], s.a - Math.PI / 2, 2.2, y + 2.4, y + 3.32, TL('sg_rail'), 0, 0, SGUV); });
  R.stm = { m: m2.upload(), gl: g2.upload() };
  var car = new R3.Mesh(), cg = new R3.Mesh(); boxC(car, -1.3, 0, -5, 1.3, 2.6, 5, '#c4121c'); boxC(car, -1.32, 1.3, -4.6, 1.32, 2.2, 4.6, '#1a2838'); boxC(cg, -1.34, 1.32, -4.5, -1.33, 2.18, 4.5, '#bfe2ff'); boxC(cg, 1.33, 1.32, -4.5, 1.34, 2.18, 4.5, '#bfe2ff'); boxC(car, -1.2, 2.6, -4.8, 1.2, 2.8, 4.8, '#12040a'); boxC(cg, -1.31, 0.4, -5, -1.3, 0.55, 5, '#c48aff'); boxC(cg, 1.3, 0.4, -5, 1.31, 0.55, 5, '#c48aff'); boxC(car, -1.0, -0.6, -4, 1.0, 0, 4, '#2a2a2e');
  var nose = new R3.Mesh(); ell(nose, 0, 1.3, 5, 1.3, 1.3, 1.6, '#c4121c', 12, 8); ell(cg, 0, 1.8, 5.9, 0.8, 0.5, 0.6, '#1a2838', 8, 4); R.car = car.upload(); R.carg = cg.upload(); R.nose = nose.upload(); }
function stepRail(dt) { var R = railBuild(); R.t += dt; var Rd = G.rail; if (Rd) { Rd.t += dt; var go = Rd.s1 - Rd.s0; if (go < 0) go += R.len; var sp = Math.min(46, 8 + Rd.t * 8); Rd.d = Math.min(go, (Rd.d || 0) + sp * dt * (Rd.d > go - 60 ? Math.max(0.25, (go - Rd.d) / 60) : 1));
    if (KIT.pressed('a') || KIT.pressed('x') || (KIT.ptr && KIT.ptr.tap)) Rd.d = go; if (Rd.d >= go - 0.05) { var s = Rd.to; G.rail = null; G.talk = 0; P.x = s.gx; P.z = s.gz; P.y = standY(P.x, P.z, 999); P.a = s.a; CAM.snap = 1; G.fade = 1.2; toast(s.name + '. Mind the gap.'); } } }
function drawRail() { var R = railBuild(); R.chunks.forEach(function (c) { if (dist2(c.x, c.z, CAM.x, CAM.z) > 520 * 520 || !inView(c.x, c.z, 70)) return; R3.draw(c.m, ATT); R3.draw(c.gl, ATT, { lit: false }); }); R3.draw(R.stm.m, ATT); R3.draw(R.stm.gl, ATT, { lit: false });
  // the train: round and round, slowing into each station and waiting
  var s0 = (R.t * 14) % R.len; if (G.rail) s0 = (G.rail.s0 + G.rail.d) % R.len; for (var k = 0; k < 3; k++) { var p = railAt(R, s0 - k * 10.6), q = railAt(R, s0 - k * 10.6 + 2), a = Math.atan2(q.x - p.x, q.z - p.z); if (dist2(p.x, p.z, CAM.x, CAM.z) > 400 * 400) continue; var M1 = MD(p.x, p.y + 0.6, p.z, a, 0, 0);
    R3.draw(R.car, ATT, { m: M1 }); R3.draw(R.carg, ATT, { m: M1, lit: false }); if (k === 0) R3.draw(R.nose, ATT, { m: M1 }); } }
function railMenu(s) { var R = railBuild(); KIT.menu({ title: 'SPUZZRAIL', sub: s.name + ' station  ·  $5 to anywhere on the loop', items: R.st.filter(function (o) { return o !== s; }).map(function (o) { return { label: o.name.toUpperCase(), dis: SV.money < 5, fn: function () { KIT.confirm({ title: 'Ride to ' + o.name, price: 5, have: Math.floor(SV.money), unit: '$', yes: function () { money(-5); KIT.closeMenu(); G.rail = { from: s, to: o, s0: s.s, s1: o.s, t: 0, d: 0 }; G.talk = 1; sfx.play('door'); }, no: function () { railMenu(s); } }); } }; }).concat([{ label: 'BACK', back: true, fn: KIT.closeMenu }]) }); }
(function () {
  var sc = stepCamera; stepCamera = function (dt) { var r = sc(dt); if (G.rail) { var R = railBuild(), Rd = G.rail, p = railAt(R, Rd.s0 + Rd.d), q = railAt(R, Rd.s0 + Rd.d + 30), a = Math.atan2(q.x - p.x, q.z - p.z); P.x = p.x; P.z = p.z; P.y = p.y + 0.6; var bk = railAt(R, Rd.s0 + Rd.d - 34); CAM.x = bk.x; CAM.z = bk.z; CAM.y = Math.max(bk.y + 7, groundY(bk.x, bk.z) + 3); CAM.at = [q.x, q.y, q.z]; } return r; };
  var dp = drawPlayer; drawPlayer = function () { if (G.rail) return; return dp(); };
  var sf = stepFoot; stepFoot = function (dt) { if (G.craneT) { var C = G.craneT; C.t -= dt; P.vx = P.vz = P.vy = 0; P.x = C.x; P.z = C.z; P.y = C.y; P.a += dt * 0.4; if (C.t <= 0) { G.craneT = null; P.x = C.x + 4; P.z = C.z + 4; P.y = standY(P.x, P.z, 999); G.fade = 1; } return; } if (G.rail) { P.vx = P.vz = 0; P.sp = 0; return; } if (G.sunTowel) { P.vx = P.vz = 0; P.sp = 0; var T = G.sunTowel; P.x = T.x; P.z = T.z; P.y = groundY(T.x, T.z) + 0.1; P.a = T.a; return; } return sf(dt); };
  var po = poseOfPlayer; poseOfPlayer = function () { var Q = po(); if (G.sunTowel) { poseDown(Q, 1, 0); Q.sh[0] = [0.4, 1.9, 0]; Q.sh[1] = [0.4, 1.9, 0]; } return Q; };
})();

/* ================================ THINGS TO DO (every area) ================================ */
/* Three kinds of little job or game, each started at a spot on the map (a blue blip): TIMING (stop the needle in the
   red three times: the high striker, ring toss and coconut shy, the beach party's dance-off), COLLECT (things to walk or
   drive over against the clock: lawns to mow, mushrooms, shells, litter, treasure) and CARRY (back and forth between two
   marks with a load: bricks up the scaffold, crates off the ship). Each pays out, more for a better run. */
var ACT = null;
function actFinish(score, max, pay) { var k = clamp(score / max, 0, 1), cash = Math.round(pay * (0.25 + 0.75 * k)); if (score <= 0) { toast('No luck this time.'); } else { money(cash); bigText(k >= 1 ? 'PERFECT!' : k > 0.5 ? 'NICE ONE' : 'NOT BAD', '+$' + cash, '#ffe36a', 2.2); } ACT = null; G.talk = 0; persist(); }
function startTiming(name, pay, rounds) { ACT = { k: 'timing', name: name, pay: pay, n: rounds || 3, r: 0, score: 0, t: 0, pos: 0, dir: 1, zone: 0.22, cx: 0.3 + Math.random() * 0.4, cool: 0 }; G.talk = 1; toast(name + ': stop the needle in the red (A).'); }
function startCollect(name, pay, pts, secs, msg) { ACT = { k: 'collect', name: name, pay: pay, pts: pts.map(function (p) { return { x: p.x, z: p.z, got: 0 }; }), left: secs, max: pts.length }; toast(msg || name + ': get to every blue ring before time runs out.'); }
function startCarry(name, pay, A, B, n, secs, msg) { ACT = { k: 'carry', name: name, pay: pay, A: A, B: B, n: n, done: 0, holding: 0, left: secs }; toast(msg || name + ': pick up at the blue ring, drop at the red one. ' + n + ' trips.'); }
function stepAct(dt) { var a = ACT; if (!a) return; if (P.state === 'dead') { ACT = null; G.talk = 0; return; }
  if (a.k === 'timing') { a.t += dt; a.cool -= dt; var sp = 1.1 + a.r * 0.45; a.pos += a.dir * sp * dt; if (a.pos > 1) { a.pos = 1; a.dir = -1; } if (a.pos < 0) { a.pos = 0; a.dir = 1; }
    if (a.cool <= 0 && (KIT.pressed('a') || KIT.pressed('x') || (KIT.ptr && KIT.ptr.tap) || gpPressed(0))) { var hit = Math.abs(a.pos - a.cx) < a.zone / 2; a.score += hit ? 1 : 0; sfx.play(hit ? 'coin' : 'back'); a.r++; a.cool = 0.4; a.zone *= 0.8; a.cx = 0.2 + Math.random() * 0.6; if (a.r >= a.n) actFinish(a.score, a.n, a.pay); } return; }
  a.left -= dt; if (a.left <= 0) { if (a.k === 'collect') actFinish(a.pts.filter(function (p) { return p.got; }).length, a.max, a.pay); else actFinish(a.done, a.n, a.pay); return; }
  var me = P.state === 'car' && P.veh ? P.veh : P, R = P.state === 'car' ? 4 : 2.2;
  if (a.k === 'collect') { a.pts.forEach(function (p) { if (!p.got && Math.hypot(p.x - me.x, p.z - me.z) < R) { p.got = 1; sfx.play('coin'); } }); if (a.pts.every(function (p) { return p.got; })) actFinish(a.max, a.max, a.pay); }
  else if (a.k === 'carry') { var tg = a.holding ? a.B : a.A; if (Math.hypot(tg.x - me.x, tg.z - me.z) < R) { if (a.holding) { a.holding = 0; a.done++; sfx.play('coin'); if (a.done >= a.n) actFinish(a.n, a.n, a.pay); } else { a.holding = 1; sfx.play('select'); } } }
  G.blips = (G.blips || []).filter(function (b) { return !b.act; }); if (a.k === 'collect') a.pts.forEach(function (p) { if (!p.got) G.blips.push({ x: p.x, z: p.z, c: '#4adfff', act: 1 }); }); else if (a.k === 'carry') { var t2 = a.holding ? a.B : a.A; G.blips.push({ x: t2.x, z: t2.z, c: a.holding ? '#ff2630' : '#4adfff', big: 1, act: 1 }); } }
var RINGM = null, CRATEM = null;
function drawAct() { var a = ACT; if (!a || G.interior) return; if (!RINGM) { var m = new R3.Mesh(); tub(m, [0, 0, 0], [0, 0.12, 0], 1, 1, '#ffffff', 20); tub(m, [0, 0.12, 0], [0, 3, 0], 1, 1.0, '#ffffff', 20); RINGM = m.upload(); var c = new R3.Mesh(); boxC(c, -0.3, -0.25, -0.3, 0.3, 0.25, 0.3, '#8a6a3a', 0); CRATEM = c.upload(); }
  function ring(p, col) { var y = groundY(p.x, p.z); R3.draw(RINGM, ATT, { lit: false, m: MD(p.x, y, p.z, G.t, 0, 0, 1.3), tint: col, alpha: 0.35 }); }
  if (a.k === 'collect') a.pts.forEach(function (p) { if (!p.got && dist2(p.x, p.z, CAM.x, CAM.z) < 250 * 250) ring(p, [0.3, 0.9, 1]); });
  if (a.k === 'carry') { ring(a.holding ? a.B : a.A, a.holding ? [1, 0.2, 0.2] : [0.3, 0.9, 1]); if (a.holding && P.state === 'foot') R3.draw(CRATEM, ATT, { m: MD(P.x + Math.sin(P.a) * 0.45, P.y + 1.15, P.z + Math.cos(P.a) * 0.45, P.a, 0, 0) }); } }
function drawActHud(ctx) { var a = ACT; if (!a) return; var W = KIT.W, H = KIT.H, tx = KIT.text || null;
  if (a.k === 'timing') { var bw = Math.min(260, W * 0.6), bx = (W - bw) / 2, by = H * 0.62; KIT.panel(bx - 8, by - 26, bw + 16, 44); ctx.fillStyle = '#2a1a1c'; ctx.fillRect(bx, by, bw, 10); ctx.fillStyle = '#c4121c'; ctx.fillRect(bx + (a.cx - a.zone / 2) * bw, by, a.zone * bw, 10); ctx.fillStyle = '#ffe36a'; ctx.fillRect(bx + a.pos * bw - 1, by - 4, 3, 18);
    var t1 = a.name.toUpperCase() + '  ' + a.score + '/' + a.r + '  (A)'; tx(t1, W / 2 - tw2(t1, 7) / 2, by - 18, { col: '#f1e7d0', size: 7 }); return; }
  var s = a.name.toUpperCase() + '  ' + (a.k === 'collect' ? a.pts.filter(function (p) { return p.got; }).length + '/' + a.max : a.done + '/' + a.n + (a.holding ? '  CARRYING' : '')) + '  ' + Math.ceil(a.left) + 's'; tx(s, W / 2 - tw2(s, 8) / 2, 30, { col: '#4adfff', size: 8 }); }
/* where everything is */
function ptsAround(x, z, n, r, okK, seed) { var R = rngOf(seed), L = [], tries = 0; while (L.length < n && tries++ < 4000) { var a = R() * 6.283, d = 6 + R() * r, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d, k = kAt(px, pz); if (!okK(k) || bldAt(px, pz) || L.some(function (o) { return Math.hypot(o.x - px, o.z - pz) < 7; })) continue; L.push({ x: px, z: pz }); } return L; }
function payFor(price, fn) { KIT.confirm({ title: 'That will be $' + price, price: price, have: Math.floor(SV.money), unit: '$', yes: function () { KIT.closeMenu(); if (SV.money < price) { toast('Not enough money.'); return; } money(-price); fn(); }, no: KIT.closeMenu }); }
function actSpots() { var U = [], C;
  function spot(x, z, label, fn, icon) { U.push({ x: x, z: z, r: 2.6, label: label, blip: 'act', icon: icon || '?', fn: function () { if (ACT) { toast('Finish what you are doing first.'); return; } fn(x, z); } }); }
  function isGrass(k) { return k === K_GRASS || k === K_PARK || k === K_YARD; }
  // Cum Hills: mow the front lawns, a garage sale, a barbecue
  if ((C = distCentre('hills'))) { var h1 = onPave(C.x, C.z); spot(h1.x, h1.z, 'MOW THE LAWNS ($90)', function (x, z) { startCollect('Lawn mowing', 90, ptsAround(x, z, 8, 70, isGrass, 77), 75, 'Lawn mowing: walk over every blue lawn ring. 75 seconds.'); }, 'M');
    var h2 = onPave(C.x + 60, C.z - 40); spot(h2.x, h2.z, 'GARAGE SALE', function () { KIT.menu({ title: 'Garage Sale', sub: 'Everything must go. Including the cat.', items: [['A slightly used bat', 15, function () { SV.weapons.bat = 1; }], ['Some old ammo (20 rounds)', 20, function () { SV.ammo['9mm'] = (SV.ammo['9mm'] || 0) + 20; }], ['A dented helmet (armour +20)', 25, function () { P.armour = Math.min(100, (P.armour || 0) + 20); }], ['A bag of crisps (+15 health)', 2, function () { P.hp = Math.min(SV.maxHp, P.hp + 15); }]].map(function (it) { return { label: it[0] + '  ·  $' + it[1], dis: SV.money < it[1], fn: function () { KIT.confirm({ title: it[0], price: it[1], have: Math.floor(SV.money), unit: '$', yes: function () { money(-it[1]); it[2](); sfx.play('coin'); KIT.closeMenu(); }, no: KIT.closeMenu }); } }; }).concat([{ label: 'BACK', back: true, fn: KIT.closeMenu }]) }); }, '$');
    var h3 = onPave(C.x - 50, C.z + 50); spot(h3.x, h3.z, 'JOIN THE BARBECUE', function () { P.hp = SV.maxHp; toast(pick(['A neighbour hands you a burger. It is mostly charcoal. Lovely.', 'You get a sausage and a lecture about fences.', 'Somebody\'s dad lets you turn the steaks. Proudest moment of your term.'])); }, 'B'); }
  // the Cumstruction Site: carry bricks up, smash the rubble, climb the crane
  if ((C = distCentre('site'))) { var s1 = onPave(C.x, C.z), s2 = tileNear(C.x + 25, C.z + 10, function (k) { return k !== K_ROAD && k !== K_PAVE && !isWaterK(k); }, 20) || { x: C.x + 25, z: C.z + 10 };
    spot(s1.x, s1.z, 'BRICK RUN ($120)', function (x, z) { var far = ptsAround(x, z, 12, 45, function (k) { return k !== K_ROAD && !isWaterK(k); }, 57).filter(function (p) { return Math.hypot(p.x - x, p.z - z) > 25; })[0] || s2; startCarry('Brick run', 120, { x: x + 4, z: z }, far, 5, 100, 'Brick run: carry five loads of bricks from the pallet (blue) to the scaffold (red). 100 seconds.'); }, 'B');
    spot(s1.x + 6, s1.z + 6, 'CLEAR THE RUBBLE ($100)', function (x, z) { startCollect('Rubble', 100, ptsAround(x, z, 7, 45, function (k) { return k !== K_ROAD && !isWaterK(k); }, 91), 60, 'Clear the rubble: get to each pile and kick it about. 60 seconds.'); }, 'R');
    var cr = poisOf('crane')[0] || C; spot(cr.x + 4, cr.z + 4, 'CLIMB THE CRANE', function () { G.fade = 1; var y0 = P.y; P.x = cr.x; P.z = cr.z; P.y = groundY(cr.x, cr.z) + 38; P.vy = 0; G.craneT = { t: 6, x: cr.x, z: cr.z, y: P.y }; if (!SV.craneDone) { SV.craneDone = 1; money(150); toast('The whole of Cum City from the top of the crane. Someone left $150 up here.'); } else toast('Cum City from the top of the crane. Do not look down.');  }, 'C'); }
  // Ejaculand: the high striker, ring toss and a coconut shy
  if ((C = distCentre('ejac'))) { var e1 = tileNear(C.x - 20, C.z + 10, function (k) { return k === K_PARK || k === K_PAVE || k === K_LOT; }, 20) || C;
    spot(e1.x, e1.z, 'HIGH STRIKER ($3)', function () { payFor(3, function () { startTiming('High striker', 40, 3); }); }, 'H'); spot(e1.x + 8, e1.z, 'RING TOSS ($3)', function () { payFor(3, function () { startTiming('Ring toss', 35, 4); }); }, 'R'); spot(e1.x + 16, e1.z, 'SHOOTING GALLERY ($5)', function () { payFor(5, function () { startTiming('Shooting gallery', 60, 5); }); }, 'S');
    spot(e1.x + 24, e1.z, 'CANDY FLOSS ($4)', function () { payFor(4, function () { P.hp = Math.min(SV.maxHp, P.hp + 25); toast('Pink, sticky, gone in a second.'); }); }, 'C'); }
  // the Sperm Isles: treasure on the islands, a coconut shy by the huts
  if ((C = distCentre('isles'))) { var hut = poisOf('hut')[0] || C; spot(hut.x + 3, hut.z + 3, 'TREASURE HUNT ($400)', function () { var pts = poisOf('hut').concat(poisOf('cove'), poisOf('lighthouse'), poisOf('volcano')).slice(0, 7).map(function (p) { return { x: p.x + 6, z: p.z - 6 }; }); startCollect('Treasure hunt', 400, pts, 420, 'Treasure hunt: seven chests hidden round the Sperm Isles. Seven minutes. A boat helps.'); }, 'T');
    spot(hut.x - 4, hut.z + 3, 'COCONUT SHY ($3)', function () { payFor(3, function () { startTiming('Coconut shy', 45, 3); }); }, 'C'); }
  // the Docks: unload the ship, sell your catch
  if ((C = distCentre('docks'))) { var d1 = onPave(C.x, C.z), d2 = (poisOf('containers')[3] || { x: C.x + 30, z: C.z }); spot(d1.x, d1.z, 'UNLOAD THE SHIP ($150)', function (x, z) { var q = poisOf('boats')[0] || poisOf('pierend')[0] || { x: x + 40, z: z + 20 }; var dd = Math.hypot(x - q.x, z - q.z) || 1, f = Math.min(1, 50 / dd), dst = { x: q.x + (x - q.x) * f, z: q.z + (z - q.z) * f }; startCarry('Unloading', 150, { x: q.x, z: q.z }, dst, 6, 150, 'Unload the ship: carry six crates from the quay (blue) to the containers (red). Drive a forklift if you can find one.'); }, 'U');
    spot(d1.x + 6, d1.z, 'FISH MARKET', function () { var n = (SV.fish || 0) - (SV.fishMkt || 0); if (n <= 0) { toast('The fishmonger wants proof. Catch some fish off a jetty first.'); return; } SV.fishMkt = SV.fish; money(n * 6); toast('The fishmonger pays a bonus of $6 a fish for the ' + n + ' you caught. $' + n * 6 + '.'); persist(); }, 'F'); }
  // the Forest: mushrooms, the Cumsquatch, the campfire
  if ((C = distCentre('forest'))) { var f1 = tileNear(C.x, C.z, function (k) { return k === K_DIRT || k === K_GRASS; }, 30) || C;
    spot(f1.x, f1.z, 'PICK MUSHROOMS ($80)', function (x, z) { startCollect('Mushrooms', 80, ptsAround(x, z, 8, 80, function (k) { return k === K_FOREST || k === K_GRASS || k === K_DIRT; }, 13), 120, 'Mushrooms: pick eight before they rot. Two minutes. Do not eat them.'); }, 'M');
    spot(f1.x + 8, f1.z + 4, 'FOLLOW THE BIG FOOTPRINTS', function (x, z) { var L = []; for (var k = 0; k < 6; k++) L.push({ x: x + 30 + k * 28, z: z + Math.sin(k) * 25 }); startCollect('Cumsquatch tracks', 500, L, 240, 'Big, hairy footprints. Follow them to the end. Four minutes.'); }, '?');
    spot(f1.x - 6, f1.z + 2, 'SIT BY THE CAMPFIRE', function () { P.hp = SV.maxHp; G.time = (G.time + 1) % 24; toast('The fire crackles. An hour goes by like nothing.'); }, 'F'); }
  // Seamen Beach: sunbathe, the dance-off, the bar, the litter pick
  var B = beachPlan(); if (B.party) { spot(B.party.x, B.party.z + 3, 'DANCE-OFF AT THE PARTY', function () { startTiming('Dance-off', 70, 6); }, 'D');
    spot(B.bar.x, B.bar.z + 1.5, 'THE SALTY LOAD BAR', function () { KIT.menu({ title: 'The Salty Load', sub: 'Cocktails with umbrellas in. Umbrellas extra.', items: [['A Sex on Seamen Beach', 9, function () { G.drunk = Math.min(1, (G.drunk || 0) + 0.3); P.hp = Math.min(SV.maxHp, P.hp + 15); }], ['A coconut with a straw', 5, function () { P.hp = Math.min(SV.maxHp, P.hp + 20); }]].map(function (it) { return { label: it[0] + '  ·  $' + it[1], dis: SV.money < it[1], fn: function () { KIT.confirm({ title: it[0], price: it[1], have: Math.floor(SV.money), unit: '$', yes: function () { money(-it[1]); it[2](); sfx.play('coin'); KIT.closeMenu(); }, no: KIT.closeMenu }); } }; }).concat([{ label: 'BACK', back: true, fn: KIT.closeMenu }]) }); }, 'B');
    spot(B.tower.x + 2, B.tower.z, 'BEACH LITTER PICK ($70)', function (x, z) { startCollect('Litter pick', 70, ptsAround(x, z, 9, 90, function (k) { return k === K_SAND; }, 31), 90, 'Pick up the litter before the tide does. 90 seconds.'); }, 'L');
    B.towels.forEach(function (T) { if (T.who) return; U.push({ x: T.x, z: T.z, r: 1.4, label: 'SUNBATHE', fn: function () { G.sunTowel = T; G.sunT = 20; toast('You lie down in the sun. Move to get up.'); } }); }); }
  // Sperm World and the Spuzzrail stations
  var M0 = mallSite(); U.push({ x: M0.door.x, z: M0.door.z + 1, r: 3.2, label: 'ENTER SPERM WORLD', blip: 'shop', icon: 'W', fn: function () { enterShop(null, null, 'mall'); } });
  railBuild().st.forEach(function (s) { U.push({ x: s.gx, z: s.gz, r: 3, label: 'SPUZZRAIL: ' + s.name.toUpperCase(), blip: 'rail', icon: 'R', fn: function () { railMenu(s); } }); });
  return U; }
(function () {
  var ws = worldSetup; worldSetup = function () { ws(); try { G.uses = G.uses.concat(actSpots()); } catch (e) { console.warn('actSpots', e); } };
  var sf = stepFun; stepFun = function (dt) { sf(dt); try { stepAct(dt); stepBeach(dt); stepRail(dt); } catch (e) { if (!window.__u169e) { window.__u169e = 1; console.warn(e); } } };
  var df = drawFun; drawFun = function () { df(); if (G.interior) return; try { var B = beachPlan(); if (B.party && dist2(B.party.x, B.party.z, CAM.x, CAM.z) < 500 * 500) { var M = beachMesh(); R3.draw(M.m, ATT); R3.draw(M.gl, ATT, { lit: false });
      if (!FIREM) { var fm = new R3.Mesh(); ell(fm, 0, 0.5, 0, 0.5, 0.8, 0.5, '#ff7a20', 8, 5); FIREM = fm.upload(); } for (var k = 0; k < 3; k++) { var ph = G.t * (5 + k) + k; R3.draw(FIREM, ATT, { lit: false, m: MD(B.party.x + (k - 1) * 0.25, groundY(B.party.x, B.party.z - 2) + 0.1, B.party.z - 2, ph * 0.1, 0, 0, 0.8 + 0.15 * Math.sin(ph)) }); } }
    var M0 = mallSite(); if (dist2((M0.x0 + M0.x1) / 2, M0.z1, CAM.x, CAM.z) < 700 * 700) { var ME = mallExterior(); R3.draw(ME.m, ATT); R3.draw(ME.gl, ATT, { lit: false }); }
    drawRail(); drawAct(); } catch (e) { if (!window.__u169d) { window.__u169d = 1; console.warn(e); } } };
  var dh = drawHud; drawHud = function () { var r = dh.apply(this, arguments); try { drawActHud(KIT.ctx); } catch (e) {} return r; };
})();
