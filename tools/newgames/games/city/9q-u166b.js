/* update 166 (his playtest), the world: courtyard car parks you could not drive out of, more benches (and room on them for
   you), more on the roofs, more helipads with helicopters on them. */

/* ---- car parks in the middle of a block: if there is no way for a car to reach a road from one, it becomes a courtyard
   garden (benches, planters, trees) with no cars in it ---- */
var CPOPEN = {}, BMASK = null;
function bmask() { if (BMASK) return BMASK; BMASK = new Uint8Array(MW * MH); BLD.forEach(function (b) { if (!b.solid) return; for (var j = Math.floor(b.z0 / CT); j <= Math.floor((b.z1 - 0.01) / CT); j++) for (var i = Math.floor(b.x0 / CT); i <= Math.floor((b.x1 - 0.01) / CT); i++) if (i >= 0 && j >= 0 && i < MW && j < MH) BMASK[j * MW + i] = 1; }); return BMASK; }
function carparkOpen(b) { if (CPOPEN[b.i] !== undefined) return CPOPEN[b.i]; var B = bmask(), seen = {}, q = [], n = 0, ok = false;
  for (var j = Math.floor(b.z0 / CT); j <= Math.floor(b.z1 / CT); j++) for (var i = Math.floor(b.x0 / CT); i <= Math.floor(b.x1 / CT); i++) { var t = j * MW + i; seen[t] = 1; q.push(t); }
  while (q.length && n < 900 && !ok) { var t0 = q.shift(), i0 = t0 % MW, j0 = (t0 / MW) | 0; n++;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var i = i0 + d[0], j = j0 + d[1]; if (i < 0 || j < 0 || i >= MW || j >= MH) return; var t = j * MW + i; if (seen[t] || B[t]) return; seen[t] = 1; var k = KM[t]; if (k === K_ROAD || k === K_BRIDGE) { ok = true; return; } if (k === K_WATER || k === K_SEA || k === K_CREAM) return; q.push(t); }); }
  CPOPEN[b.i] = ok; return ok; }
(function () { var cp = carpark; carpark = function (m, b) { if (carparkOpen(b)) return cp(m, b); courtyard(m, b); }; })();
function courtyard(m, b) { var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, y = groundY(cx, cz) + 0.04, w = b.x1 - b.x0, d = b.z1 - b.z0;
  m.quad([b.x0 + 0.5, y, b.z0 + 0.5], [b.x0 + 0.5, y, b.z1 - 0.5], [b.x1 - 0.5, y, b.z1 - 0.5], [b.x1 - 0.5, y, b.z0 + 0.5], uvR(w / 3, d / 3), TL('paver'), [0.5, 0.5, 0.5], [0, 1, 0]);
  // a planted bed down the middle with a tree, benches either side of it facing in
  boxC(m, cx - Math.min(4, w * 0.25), y, cz - 1, cx + Math.min(4, w * 0.25), y + 0.4, cz + 1, '#5a5458'); boxC(m, cx - Math.min(4, w * 0.25) + 0.15, y + 0.4, cz - 0.85, cx + Math.min(4, w * 0.25) - 0.15, y + 0.45, cz + 0.85, '#3a2a1a');
  for (var k = -1; k <= 1; k += 2) { var tx = cx + k * Math.min(2.5, w * 0.15); tub(m, [tx, y + 0.4, cz], [tx, y + 2.6, cz], 0.1, 0.08, '#4a3020', 6); ell(m, tx, y + 3.2, cz, 1.2, 1.0, 1.2, '#2e5a2a', 10, 6); ell(m, tx + 0.4, y + 3.6, cz - 0.2, 0.8, 0.7, 0.8, '#3a6a32', 8, 5); }
  [[cz - 3, 0], [cz + 3, Math.PI]].forEach(function (q, i) { if (d < 9) return; var bx = cx + (i ? 1.5 : -1.5); sfDraw(m, 'bench', bx, y, q[0], q[1]); addSeat(bx, q[0], q[1], 'bench', { y: y + 0.5 }); });
  if (!b.cyard) { b.cyard = 1; addOBB(cx, cz, 0, Math.min(4, w * 0.25), 1, y - 0.5, y + 0.4).top = 1; } }

/* ---- benches: a second pass of benches along the pavements of the busy districts and the squares ---- */
(function () { var bs = buildStreet; buildStreet = function (M0, GLOW, x0, z0, CS, lamps, first) { bs.apply(this, arguments);
  var i0 = Math.floor(x0 / CT), j0 = Math.floor(z0 / CT), n = Math.round(CS / CT);
  for (var j = j0; j < Math.min(MH, j0 + n); j++) for (var i = i0; i < Math.min(MW, i0 + n); i++) { var t = j * MW + i; if (KM[t] !== K_PAVE) continue; var st = DIST[DM[t]].style; if (!/downtown|cafe|redlight|suburb|labs|park/.test(st)) continue;
    var r1 = hash2(i, j, 21); if (r1 < 0.085 || r1 > (st === 'cafe' || st === 'park' ? 0.15 : 0.12)) continue; var cx = i * CT + 2, cz = j * CT + 2, r = nearestRoad(cx, cz, 12); if (!r) continue;
    var nx = (cx - r.x) / (r.d || 1), nz = (cz - r.z) / (r.d || 1); if (r.d < 0.5) { nx = r.dz; nz = -r.dx; } var off = r.E.w / 2 + 2.6, px = r.x + nx * off, pz = r.z + nz * off;
    if (kAt(px, pz) !== K_PAVE || roadF(px, pz) < off - r.E.w / 2 - 0.4) continue; var e1 = [px + r.dx * 2, pz + r.dz * 2], e2 = [px - r.dx * 2, pz - r.dz * 2]; if (kAt(e1[0], e1[1]) !== K_PAVE || kAt(e2[0], e2[1]) !== K_PAVE) continue;
    if (near(BGRID, px, pz, 2).some(function (b) { return px > b.x0 - 0.9 && px < b.x1 + 0.9 && pz > b.z0 - 0.9 && pz < b.z1 + 0.9; })) continue;
    var a = Math.atan2(-nx, -nz), py = groundY(px, pz) + 0.15; sfDraw(M0, 'bench', px, py, pz, a, GLOW); if (first) { addSeat(px, pz, a, 'bench', { y: py + 0.5 }); addPost(px, pz, 0.5, py, py + 1.2); } } }; })();
/* a bench with someone already on it: you sit at the free end */
(function () { var sd = sitDown; sitDown = function (s) { if (s.kind === 'bench' && s.taken) { var u = -0.42, s2 = { x: s.x + Math.cos(s.a) * u, z: s.z - Math.sin(s.a) * u, a: s.a, kind: 'bench', y: s.y, side: 1 }; return sd(s2); } return sd(s); }; })();

/* ---- roofs: tanks, air conditioning, dishes, aerials, vents, skylights, hatches, solar panels ---- */
function roofDress(m, glow, b) { if (!b.solid || b.style === 'house' || b.style === 'suburb' || b.style === 'carpark' || b.style === 'shed' || b.pad) return; var w = b.x1 - b.x0, d = b.z1 - b.z0; if (w < 6 || d < 6) return;
  var tall = b.style === 'downtown' && b.h > 34, ins = tall ? Math.min(2.5, w * 0.2) : 0, x0 = b.x0 + ins + 1.2, x1 = b.x1 - ins - 1.2, z0 = b.z0 + ins + 1.2, z1 = b.z1 - ins - 1.2, y = b.y0 + b.h;
  if (x1 - x0 < 3 || z1 - z0 < 3) return; var R = srand(5000 + b.i), N = 2 + Math.floor(R() * Math.min(6, (x1 - x0) * (z1 - z0) / 30)), used = [];
  function spot(r) { for (var k = 0; k < 8; k++) { var x = x0 + r + R() * (x1 - x0 - 2 * r), z = z0 + r + R() * (z1 - z0 - 2 * r); if (x1 - x0 < 2 * r || z1 - z0 < 2 * r) return null; if (used.every(function (u) { return Math.hypot(u[0] - x, u[1] - z) > u[2] + r + 0.4; })) { used.push([x, z, r]); return [x, z]; } } return null; }
  var kinds = b.style === 'labs' ? ['solar', 'solar', 'ac', 'dish', 'vent', 'aerial', 'hatch'] : b.style === 'industrial' || b.style === 'docks' ? ['vent', 'vent', 'ac', 'pipes', 'tank2', 'hatch'] : ['tank', 'ac', 'ac', 'dish', 'aerial', 'vent', 'skylight', 'hatch', 'pipes'];
  for (var n = 0; n < N; n++) { var k = kinds[Math.floor(R() * kinds.length)];
    if (k === 'tank') { var p = spot(1.5); if (!p) continue; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { tub(m, [p[0] + q[0] * 0.9, y, p[1] + q[1] * 0.9], [p[0] + q[0] * 0.9, y + 2.2, p[1] + q[1] * 0.9], 0.07, 0.07, '#3a3a3e', 5); }); boxC(m, p[0] - 1.1, y + 2.2, p[1] - 1.1, p[0] + 1.1, y + 2.35, p[1] + 1.1, '#3a3a3e');
      tub(m, [p[0], y + 2.35, p[1]], [p[0], y + 4.6, p[1]], 1.25, 1.25, '#6a4a30', 14, { T: TL('plank') }); for (var hb = 0; hb < 3; hb++) tub(m, [p[0], y + 2.6 + hb * 0.8, p[1]], [p[0], y + 2.68 + hb * 0.8, p[1]], 1.28, 1.28, '#2a2a2e', 14); tub(m, [p[0], y + 4.6, p[1]], [p[0], y + 5.5, p[1]], 1.32, 0.05, '#3a2a20', 14); }
    else if (k === 'tank2') { var p2 = spot(1.6); if (!p2) continue; tub(m, [p2[0], y, p2[1]], [p2[0], y + 3.2, p2[1]], 1.5, 1.5, '#8a8a86', 14, { cap: 1 }); tub(m, [p2[0], y + 1.0, p2[1]], [p2[0], y + 1.08, p2[1]], 1.53, 1.53, '#5a5a5e', 14); tub(m, [p2[0] + 1.5, y, p2[1]], [p2[0] + 1.5, y + 3.4, p2[1]], 0.04, 0.04, '#c8a040', 4); }
    else if (k === 'ac') { var p3 = spot(0.9); if (!p3) continue; boxC(m, p3[0] - 0.8, y, p3[1] - 0.55, p3[0] + 0.8, y + 0.9, p3[1] + 0.55, '#a8aaa6'); boxC(m, p3[0] - 0.84, y + 0.9, p3[1] - 0.59, p3[0] + 0.84, y + 0.95, p3[1] + 0.59, '#7a7c7a');
      tub(m, [p3[0], y + 0.95, p3[1]], [p3[0], y + 0.97, p3[1]], 0.42, 0.42, '#2a2a2e', 12, { cap: 1 }); boxC(m, p3[0] - 0.4, y + 0.97, p3[1] - 0.025, p3[0] + 0.4, y + 0.99, p3[1] + 0.025, '#5a5a5e'); boxC(m, p3[0] - 0.025, y + 0.97, p3[1] - 0.4, p3[0] + 0.025, y + 0.99, p3[1] + 0.4, '#5a5a5e');
      tub(m, [p3[0] + 0.8, y + 0.3, p3[1]], [p3[0] + 1.6, y + 0.3, p3[1]], 0.07, 0.07, '#6a6a6e', 6); }
    else if (k === 'dish') { var p4 = spot(0.8); if (!p4) continue; var da = R() * 6.28; tub(m, [p4[0], y, p4[1]], [p4[0], y + 1.1, p4[1]], 0.05, 0.05, '#5a5a5e', 6); boxC(m, p4[0] - 0.2, y, p4[1] - 0.2, p4[0] + 0.2, y + 0.06, p4[1] + 0.2, '#4a4a4e');
      var dx = Math.sin(da) * 0.15, dz = Math.cos(da) * 0.15; tub(m, [p4[0] + dx, y + 1.25, p4[1] + dz], [p4[0] + dx * 1.8, y + 1.3, p4[1] + dz * 1.8], 0.48, 0.06, '#d8d8d4', 14, { cap0: 1 }); tub(m, [p4[0] + dx, y + 1.25, p4[1] + dz], [p4[0] + dx * 5, y + 1.4, p4[1] + dz * 5], 0.012, 0.012, '#3a3a3e', 4); }
    else if (k === 'aerial') { var p5 = spot(0.4); if (!p5) continue; var ah = 3 + R() * 4; tub(m, [p5[0], y, p5[1]], [p5[0], y + ah, p5[1]], 0.05, 0.03, '#3a3a3e', 5); for (var c = 0; c < 4; c++) tub(m, [p5[0] - 0.5 + c * 0.05, y + ah * (0.55 + c * 0.1), p5[1]], [p5[0] + 0.5 - c * 0.05, y + ah * (0.55 + c * 0.1), p5[1]], 0.012, 0.012, '#3a3a3e', 3);
      ell(glow, p5[0], y + ah + 0.05, p5[1], 0.08, 0.08, 0.08, '#ff2630', 6, 3); }
    else if (k === 'vent') { var p6 = spot(0.5); if (!p6) continue; var vh = 0.8 + R() * 1.2; tub(m, [p6[0], y, p6[1]], [p6[0], y + vh, p6[1]], 0.22, 0.22, '#8a8c8a', 10); tub(m, [p6[0], y + vh, p6[1]], [p6[0], y + vh + 0.25, p6[1]], 0.36, 0.1, '#6a6c6a', 10); if (R() < 0.4) b.steam = 1; }
    else if (k === 'skylight') { var p7 = spot(1.0); if (!p7) continue; boxC(m, p7[0] - 0.9, y, p7[1] - 0.7, p7[0] + 0.9, y + 0.35, p7[1] + 0.7, '#5a5458'); m.quad([p7[0] - 0.85, y + 0.37, p7[1] - 0.65], [p7[0] - 0.85, y + 0.37, p7[1] + 0.65], [p7[0] + 0.85, y + 0.6, p7[1] + 0.65], [p7[0] + 0.85, y + 0.6, p7[1] - 0.65], UV1, TL('glassg'), [0.5, 0.5, 0.5], [-0.3, 0.95, 0]);
      boxC(m, p7[0] - 0.9, y + 0.35, p7[1] - 0.7, p7[0] + 0.9, y + 0.38, p7[1] - 0.64, '#2a2a2e'); }
    else if (k === 'hatch') { var p8 = spot(0.8); if (!p8) continue; boxC(m, p8[0] - 0.7, y, p8[1] - 0.7, p8[0] + 0.7, y + 2.2, p8[1] + 0.7, '#6a6466'); standQ(m, p8[0], p8[1] + 0.71, 0, 0.8, y, y + 1.9, TL('door'), 1); boxC(m, p8[0] - 0.75, y + 2.2, p8[1] - 0.75, p8[0] + 0.75, y + 2.3, p8[1] + 0.75, '#3a3438'); ell(glow, p8[0], y + 2.0, p8[1] + 0.74, 0.07, 0.05, 0.03, '#ffd890', 6, 3); }
    else if (k === 'solar') { var p9 = spot(1.6); if (!p9) continue; for (var sr = 0; sr < 2; sr++) { var zz = p9[1] - 0.8 + sr * 1.6; m.quad([p9[0] - 1.4, y + 0.3, zz - 0.6], [p9[0] - 1.4, y + 0.9, zz + 0.6], [p9[0] + 1.4, y + 0.9, zz + 0.6], [p9[0] + 1.4, y + 0.3, zz - 0.6], uvR(4, 2), TL('glasspane'), [0.25, 0.3, 0.5], [0, 0.89, -0.45]); tub(m, [p9[0] - 1.2, y, zz + 0.5], [p9[0] - 1.2, y + 0.85, zz + 0.5], 0.03, 0.03, '#5a5a5e', 4); tub(m, [p9[0] + 1.2, y, zz + 0.5], [p9[0] + 1.2, y + 0.85, zz + 0.5], 0.03, 0.03, '#5a5a5e', 4); } }
    else if (k === 'pipes') { var zp = z0 + R() * (z1 - z0); tub(m, [x0, y + 0.35, zp], [x1, y + 0.35, zp], 0.09, 0.09, '#7a6a5a', 8); for (var xp = x0 + 1; xp < x1; xp += 2.5) boxC(m, xp - 0.05, y, zp - 0.05, xp + 0.05, y + 0.3, zp + 0.05, '#3a3a3e'); }
  }
  // tall towers: a ring of aerials and a blinking light for planes
  if (tall) { var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; tub(m, [cx, y, cz], [cx, y + 8, cz], 0.12, 0.05, '#3a3a3e', 6); ell(glow, cx, y + 8.1, cz, 0.15, 0.15, 0.15, '#ff2630', 8, 4); }
}
(function () { var bd = building; building = function (m, night, fr, glow, b, lamps) { bd(m, night, fr, glow, b, lamps); try { roofDress(m, glow, b); } catch (e) { } }; })();

/* ---- helipads: on the hospital, the police station and the tallest flat roofs across town, each with a helicopter that
   is there to take (it comes back when you have gone) ---- */
var HPADS = null;
function placeHelipads() { if (HPADS) return; HPADS = []; var cand = BLD.filter(function (b) { return b.solid && (b.x1 - b.x0) >= 13 && (b.z1 - b.z0) >= 13 && /downtown|labs|industrial|docks/.test(b.style) && b.h >= 12 && !b.shop; });
  ['hosp', 'cops', 'bank'].forEach(function (k) { if (SHOPS[k] && SHOPS[k].b) cand.unshift(SHOPS[k].b); });
  cand.sort(function (a, b) { return (b.h + (b.shop ? 999 : 0)) - (a.h + (a.shop ? 999 : 0)); });
  cand.forEach(function (b) { if (HPADS.length >= 16) return; var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; if (HPADS.some(function (p) { return dist2(p.x, p.z, cx, cz) < 220 * 220; })) return; if ((b.x1 - b.x0) < 13 || (b.z1 - b.z0) < 13) return;
    var tall = b.style === 'downtown' && b.h > 34; if (tall && Math.min(b.x1 - b.x0, b.z1 - b.z0) < 18) return; b.pad = 1; var top = b.y0 + b.h; var P0 = { k: 'helipad', x: cx, z: cz, h: top, roof: 0, a: 0, name: 'Helipad', b: b }; POIS.push(P0); HPADS.push(P0); }); }
(function () { var bl = buildLandmarks; buildLandmarks = function () { placeHelipads(); return bl.apply(this, arguments); }; })();
function stepHelipads(dt) { if (!HPADS || G.interior) return; if ((G.hpadT = (G.hpadT || 0) - dt) > 0) return; G.hpadT = 2;
  HPADS.forEach(function (p) { var d = Math.hypot(p.x - P.x, p.z - P.z); if (d > 260) { if (p.v && p.v !== P.veh && !p.v.owned && dist2(p.v.x, p.v.z, P.x, P.z) > 300 * 300) { var i = VEH.indexOf(p.v); if (i >= 0 && !p.v.driver) VEH.splice(i, 1); p.v = null; } return; }
    if (p.v && VEH.indexOf(p.v) >= 0 && !p.v.dead) return; if (p.v && (p.v.dead || VEH.indexOf(p.v) < 0)) { if (d < 200) return; } if (d < 60) return;
    var y = p.h + 0.06, v = makeVeh(p.b === (SHOPS.cops && SHOPS.cops.b) ? 'heli' : 'heli', p.x, p.z, (p.b.i % 4) * Math.PI / 2, { col: p.b === (SHOPS.hosp && SHOPS.hosp.b) ? 0 : (p.b.i % 3) }); v.y = y; v.ground = 1; v.keep = 1; v.pad = p; p.v = v; }); }
(function () { var sf = stepFun; stepFun = function (dt) { sf(dt); try { stepHelipads(dt); } catch (e) { } }; })();
