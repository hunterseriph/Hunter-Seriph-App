/* ---------- update 162 (his ask: more hospitals to respawn at, always the nearest one; in Ejaculand a first aid tent).
   A small Cum City Clinic is put in every part of the map (on open ground beside a road, never on a road, a building
   or another place), Ejaculand gets a first aid tent by its gate, and WASTED takes you to whichever is nearest
   (the old Cum City Hospital counts too). ---------- */
var CLINICS = [];
HIPAINT.sg_clinic = parkSign('CUM CITY CLINIC', '#f1e7d0', '#c4121c');
HIPAINT.sg_firstaid = parkSign('FIRST AID', '#f1e7d0', '#c4121c');
HIPAINT.redcross = function (g) { g.fillStyle = '#f1e7d0'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#c4121c'; g.fillRect(24, 8, 16, 48); g.fillRect(8, 24, 48, 16); g.strokeStyle = '#12040a'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 61, 61); };
function placeClinics() { if (CLINICS.length) return;
  var OK = [K_GRASS, K_PARK, K_LOT, K_PAVE, K_FIELD, K_DIRT, K_SAND];
  function free(x, z, R) { var i0 = Math.floor((x - R) / CT), i1 = Math.floor((x + R) / CT), j0 = Math.floor((z - R) / CT), j1 = Math.floor((z + R) / CT), lo = 1e9, hi = -1e9;
    for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { if (i < 0 || j < 0 || i >= MW || j >= MH) return false; var k = KM[j * MW + i]; if (OK.indexOf(k) < 0) return false; var h = groundY(i * CT + 2, j * CT + 2); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    if (hi - lo > 1.6) return false;
    if (near(BGRID, x, z, R + 4).some(function (b) { return x > b.x0 - R - 1.5 && x < b.x1 + R + 1.5 && z > b.z0 - R - 1.5 && z < b.z1 + R + 1.5; })) return false;
    if (POIS.some(function (p) { return dist2(p.x, p.z, x, z) < (p.k === 'castle' || p.k === 'grotto' ? 90 : 26) * (p.k === 'castle' || p.k === 'grotto' ? 90 : 26); })) return false;
    if (CLINICS.some(function (c) { return dist2(c.x, c.z, x, z) < 140 * 140; })) return false;
    var r = nearestRoad(x, z, 34); if (!r || roadF(x, z) < R + 1 || (r.E && r.E.track)) return false;
    return r; }
  function place(cx, cz, kind, name, R, maxR) { for (var rad = 8; rad < (maxR || 300); rad += 6) for (var k = 0; k < 28; k++) { var a = k / 28 * 6.283 + rad * 0.37, x = cx + Math.sin(a) * rad, z = cz + Math.cos(a) * rad, r = free(x, z, R); if (!r) continue;
      var q = edgeAt(r.E, r.s, false, 0), ang = Math.atan2(q.x - x, q.z - z), y = groundY(x, z);
      var C = { k: kind, x: x, z: z, a: ang, y: y, name: name, h: y, door: { x: x + Math.sin(ang) * (R + 1.2), z: z + Math.cos(ang) * (R + 1.2), a: ang } }; CLINICS.push(C); POIS.push(C);
      for (var j = Math.floor((z - R - 2) / CT); j <= Math.floor((z + R + 2) / CT); j++) for (var i = Math.floor((x - R - 2) / CT); i <= Math.floor((x + R + 2) / CT); i++) if (i >= 0 && j >= 0 && i < MW && j < MH) CLR[j * MW + i] = 1;
      return C; } return null; }
  var H = SHOPS.hosp && doorOf(SHOPS.hosp.b); if (H) CLINICS.push({ k: 'hosp', x: H.x, z: H.z, door: H, name: 'Cum City Hospital' });
  DIST.forEach(function (d) { if (!(d.cx > 0) || d.id === 'sea' || d.id === 'ejac' || d.id === 'cafe') return; if (!place(d.cx, d.cz, 'clinic', d.name + ' Clinic', 6, d.id === 'isles' ? 160 : 420)) place(d.cx, d.cz, 'clinic', d.name + ' Clinic', 4.5, 420); });
  poisOf('village').concat(poisOf('motel')).forEach(function (p) { place(p.x, p.z, 'clinic', 'Country Clinic', 6, 120); });
  var gate = poisOf('gate')[0], ej = DIST.filter(function (d) { return d.id === 'ejac'; })[0]; if (gate || ej) place((gate || ej).x || ej.cx, (gate || ej).z || ej.cz, 'firstaid', 'First Aid Tent', 3.5, 200);
}
(function () { var bl = buildLandmarks; buildLandmarks = function () { placeClinics(); return bl.apply(this, arguments); }; })();
LMBUILD.clinic = function (o, p) { o.r = 20; var m = o.m, a = p.a, y = p.y, c = Math.cos(a), s = Math.sin(a), fx = Math.sin(a), fz = Math.cos(a);
  function at(u, v) { return [p.x + c * u + fx * v, p.z - s * u + fz * v]; } // u across the front, v towards the road
  boxR(m, p.x, p.z, a, 6, 4.5, y - 1.5, y + 4.2, '#e8e4dc'); boxR(m, p.x, p.z, a, 6.1, 4.6, y + 2.9, y + 3.5, '#c4121c'); boxR(m, p.x, p.z, a, 6.3, 4.8, y + 4.2, y + 4.55, '#5a5458');
  addBox(Math.min(at(-6, -4.5)[0], at(6, 4.5)[0], at(-6, 4.5)[0], at(6, -4.5)[0]), Math.min(at(-6, -4.5)[1], at(6, 4.5)[1], at(-6, 4.5)[1], at(6, -4.5)[1]), Math.max(at(-6, -4.5)[0], at(6, 4.5)[0], at(-6, 4.5)[0], at(6, -4.5)[0]), Math.max(at(-6, -4.5)[1], at(6, 4.5)[1], at(-6, 4.5)[1], at(6, -4.5)[1]), y - 2, y + 4.5);
  var D = at(0, 4.55); standQ(m, D[0], D[1], a, 2.6, y, y + 2.6, TL('door'), 1.1); var W1 = at(-3.6, 4.55), W2 = at(3.6, 4.55); standQ(m, W1[0], W1[1], a, 2.4, y + 0.9, y + 2.4, TL('litwin'), 1.2); standQ(m, W2[0], W2[1], a, 2.4, y + 0.9, y + 2.4, TL('litwin'), 1.2);
  var S = at(0, 4.62); standQ(o.glow, S[0], S[1], a, 5.6, y + 2.9, y + 3.5, TL('sg_clinic'), 1.4, 0.3, SGUV);
  [-1, 1].forEach(function (sd) { var Q = at(0, 0); standQ(o.glow, Q[0] + fx * sd * 4.56, Q[1] + fz * sd * 4.56, a + (sd < 0 ? Math.PI : 0), 2.2, y + 4.6, y + 6.8, TL('redcross'), 1.4); });
  boxR(m, at(0, 0)[0], at(0, 0)[1], a, 0.1, 0.1, y + 4.5, y + 6.9, '#3a3a3e');
  // the canopy over the door, a bench, an ambulance waiting out front
  var Cn = at(0, 5.6); boxR(m, Cn[0], Cn[1], a, 2.2, 1.1, y + 2.75, y + 2.95, '#c4121c'); [-2, 2].forEach(function (u) { var q = at(u, 6.5); tub(m, [q[0], y, q[1]], [q[0], y + 2.8, q[1]], 0.06, 0.06, '#3a3a3e', 5); });
  var B = at(-4.5, 5.6); boxR(m, B[0], B[1], a, 0.9, 0.25, y + 0.42, y + 0.5, '#6a4a2a');
  var A = at(4.8, 8.5); car3(m, A[0], A[1], a + Math.PI / 2, y, '#f1e7d0'); boxR(m, A[0], A[1], a + Math.PI / 2, 0.92, 0.6, y + 1.52, y + 1.62, '#c4121c');
  o.flick = []; };
LMBUILD.firstaid = function (o, p) { o.r = 12; var m = o.m, a = p.a, y = p.y, fx = Math.sin(a), fz = Math.cos(a);
  boxR(m, p.x, p.z, a, 3.2, 3.2, y - 0.5, y + 2.2, '#f1e7d0'); tub(m, [p.x, y + 2.2, p.z], [p.x, y + 4.4, p.z], 4.4, 0.05, '#e8e4dc', 4, { cap: 1 });
  [[0, 0], [1, 1], [2, 0], [3, 1]].forEach(function (q) { var aa = a + Math.PI / 4 + q[0] * Math.PI / 2; tub(m, [p.x, y + 4.4, p.z], [p.x + Math.sin(aa) * 4.4, y + 2.2, p.z + Math.cos(aa) * 4.4], 0.08, 0.08, '#c4121c', 4); });
  addBox(p.x - 3.2, p.z - 3.2, p.x + 3.2, p.z + 3.2, y - 1, y + 4);
  standQ(o.glow, p.x + fx * 3.25, p.z + fz * 3.25, a, 2.4, y + 0.8, y + 2.0, TL('redcross'), 1.4); standQ(o.glow, p.x + fx * 3.3, p.z + fz * 3.3, a, 3.6, y + 2.3, y + 2.9, TL('sg_firstaid'), 1.4, 0.3, SGUV);
  var F = [p.x - fx * 3.25, p.z - fz * 3.25]; standQ(o.glow, F[0], F[1], a + Math.PI, 2.4, y + 0.8, y + 2.0, TL('redcross'), 1.4);
  tub(m, [p.x + fx * 4 + fz * 3, y, p.z + fz * 4 - fx * 3], [p.x + fx * 4 + fz * 3, y + 3, p.z + fz * 4 - fx * 3], 0.05, 0.05, '#3a3a3e', 5); };
/* the nearest one to where you fell */
function nearestClinic(x, z) { placeClinics(); var best = null, bd = 1e18; CLINICS.forEach(function (c) { var d = dist2(c.door.x, c.door.z, x, z); if (d < bd) { bd = d; best = c; } }); return best; }
