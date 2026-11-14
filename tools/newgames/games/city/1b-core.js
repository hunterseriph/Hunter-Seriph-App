/* =====================================================================================================
   CUM CITY NIGHTS (update 154, his ask: a GTA of our own over the whole of Cum City). The core: the map read back from
   CITY (tools/city/mapgen.py), ground heights, what stands where, and the little helpers everything else uses.
   Units are metres. x runs east, z runs south, y is up. A map tile is 4 m.
   ===================================================================================================== */
var W = 480, H = 270, TSZ = 2.4; window.GLNEAR = 0.3; window.GLFAR = 1200; // TSZ is Psycho's tile size, its rigs read it
var G = { interior: null }; // the game state (filled in by 9-main.js)
var CT = CITY.T, MW = CITY.W, MH = CITY.H, WX = MW * CT, WZ = MH * CT;
var K_SEA = 0, K_WATER = 1, K_SAND = 2, K_GRASS = 3, K_FOREST = 4, K_ROAD = 5, K_PAVE = 6, K_LOT = 7, K_PARK = 8, K_ROCK = 9, K_DIRT = 10, K_RUNWAY = 11, K_GRAVE = 12, K_BRIDGE = 13, K_CREAM = 14, K_PIER = 15, K_YARD = 16, K_FIELD = 17;
function unrle(s, n) { var b = atob(s), o = new Uint8Array(n), p = 0; for (var i = 0; i < b.length; i += 2) { var c = b.charCodeAt(i), v = b.charCodeAt(i + 1); o.fill(v, p, p + c); p += c; } return o; }
var KM = unrle(CITY.K, MW * MH), DM = unrle(CITY.D, MW * MH), HT = (function () { var q = unrle(CITY.Hq, MW * MH), h = new Float32Array(MW * MH); for (var i = 0; i < q.length; i++) h[i] = q[i] / 4 - 4; return h; })();
var DIST = CITY.dist.map(function (d, i) { return { i: i, id: d[0], name: d[1], style: d[2] }; }), DISTID = {}; DIST.forEach(function (d) { DISTID[d.id] = d.i; });
function kAt(x, z) { var i = Math.floor(x / CT), j = Math.floor(z / CT); if (i < 0 || j < 0 || i >= MW || j >= MH) return K_SEA; return KM[j * MW + i]; }
function dAt(x, z) { var i = Math.floor(x / CT), j = Math.floor(z / CT); if (i < 0 || j < 0 || i >= MW || j >= MH) return DIST[0]; return DIST[DM[j * MW + i]]; }
function isWaterK(k) { return k === K_SEA || k === K_WATER || k === K_CREAM; }
function isHardK(k) { return k === K_ROAD || k === K_PAVE || k === K_BRIDGE || k === K_YARD || k === K_RUNWAY || k === K_LOT || k === K_PIER; }
/* corner heights: the average of the tiles round a corner, but where roads meet the roads win so they stay flat */
var CH = (function () {
  var c = new Float32Array((MW + 1) * (MH + 1));
  for (var j = 0; j <= MH; j++) for (var i = 0; i <= MW; i++) {
    var s = 0, n = 0, rs = 0, rn = 0, ws = 0, wn = 0;
    for (var dj = -1; dj <= 0; dj++) for (var di = -1; di <= 0; di++) { var a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= MW || b >= MH) continue; var t = b * MW + a, k = KM[t], h = HT[t];
      if (k === K_ROAD || k === K_BRIDGE || k === K_PIER) { rs += h; rn++; } else if (isWaterK(k)) { ws += h; wn++; } else { s += h; n++; } }
    c[j * (MW + 1) + i] = rn ? rs / rn : n ? s / n : wn ? ws / wn : -3;
  }
  return c;
})();
function cornerH(i, j) { if (i < 0) i = 0; if (j < 0) j = 0; if (i > MW) i = MW; if (j > MH) j = MH; return CH[j * (MW + 1) + i]; }
/* the ground under a point (the same surface the terrain is drawn with) */
function groundY(x, z) {
  var fx = x / CT, fz = z / CT, i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
  var a = cornerH(i, j), b = cornerH(i + 1, j), c = cornerH(i, j + 1), d = cornerH(i + 1, j + 1);
  return tx + tz < 1 ? a + (b - a) * tx + (c - a) * tz : d + (c - d) * (1 - tx) + (b - d) * (1 - tz);
}
function groundN(x, z) { var e = 0.6, hx = groundY(x + e, z) - groundY(x - e, z), hz = groundY(x, z + e) - groundY(x, z - e), l = Math.hypot(hx, 2 * e, hz); return [-hx / l, 2 * e / l, -hz / l]; }
var WATERY = 0.0, CREAMY = 0.35;
function waterY(x, z) { if (G.interior) return -99; var k = kAt(x, z); return k === K_CREAM ? CREAMY : isWaterK(k) ? WATERY : -99; }
/* a cheap hash so trees, graves, benches and the rest come back in the same place every time */
function hash2(i, j, s) { var h = (i * 374761393 + j * 668265263 + (s || 0) * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function angDiff(a, b) { var d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
function dist2(ax, az, bx, bz) { var dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function pick(l) { return l[Math.floor(Math.random() * l.length)]; }
/* ---------- buildings: boxes in metres, with a spatial grid for collisions ---------- */
var BLD = CITY.bld.map(function (b, i) {
  var x0 = b[0] * CT, z0 = b[1] * CT, x1 = b[2] * CT, z1 = b[3] * CT, g = Math.min(groundY(x0 + 0.5, z0 + 0.5), groundY(x1 - 0.5, z0 + 0.5), groundY(x0 + 0.5, z1 - 0.5), groundY(x1 - 0.5, z1 - 0.5));
  return { i: i, x0: x0 + 0.4, z0: z0 + 0.4, x1: x1 - 0.4, z1: z1 - 0.4, h: b[4], style: b[5], front: b[6], shop: b[7], y0: g, solid: b[4] > 0 };
});
var BG = 32, BGW = Math.ceil(WX / BG), BGRID = {};
function gridAdd(G, x0, z0, x1, z1, o) { for (var j = Math.floor(z0 / BG); j <= Math.floor(z1 / BG); j++) for (var i = Math.floor(x0 / BG); i <= Math.floor(x1 / BG); i++) { var k = j * BGW + i; (G[k] || (G[k] = [])).push(o); } }
BLD.forEach(function (b) { if (b.solid) gridAdd(BGRID, b.x0, b.z0, b.x1, b.z1, b); });
/* other solid things (castle walls, rides, containers, trees, lamps...) are added as boxes or posts by the world builder */
var SOLID = {};
function addBox(x0, z0, x1, z1, y0, y1, o) { var b = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), y0: y0, y1: y1, o: o }; gridAdd(SOLID, b.x0, b.z0, b.x1, b.z1, b); return b; }
function addPost(x, z, r, y0, y1, o) { var b = { post: 1, x: x, z: z, r: r, x0: x - r, z0: z - r, x1: x + r, z1: z + r, y0: y0, y1: y1, o: o }; gridAdd(SOLID, b.x0, b.z0, b.x1, b.z1, b); return b; }
function near(G, x, z, r) { var out = []; for (var j = Math.floor((z - r) / BG); j <= Math.floor((z + r) / BG); j++) for (var i = Math.floor((x - r) / BG); i <= Math.floor((x + r) / BG); i++) { var l = G[j * BGW + i]; if (l) for (var k = 0; k < l.length; k++) if (out.indexOf(l[k]) < 0) out.push(l[k]); } return out; }
/* push a circle (x, z, radius) at height y..y+hh out of everything solid; returns the push and what it hit */
function collide(x, z, r, y, hh) {
  if (G.interior) return interiorCollide(x, z, r);
  var px = 0, pz = 0, hit = null, L = near(BGRID, x, z, r + 1);
  for (var n = 0; n < 2; n++) {
    var ls = n ? near(SOLID, x, z, r + 1) : L;
    for (var k = 0; k < ls.length; k++) { var b = ls[k], top = n ? b.y1 : b.y0 + b.h, bot = n ? b.y0 : b.y0 - 2; if (y + (hh || 1.6) < bot || y > top - 0.05) continue;
      if (b.post) { var dx = x + px - b.x, dz = z + pz - b.z, d = Math.hypot(dx, dz), m = r + b.r; if (d < m && d > 0.0001) { px += dx / d * (m - d); pz += dz / d * (m - d); hit = b; } continue; }
      var cx = clamp(x + px, b.x0, b.x1), cz = clamp(z + pz, b.z0, b.z1), ex = x + px - cx, ez = z + pz - cz, dd = Math.hypot(ex, ez);
      if (dd < r) { if (dd < 0.0001) { var l = x + px - b.x0, rr = b.x1 - x - px, t = z + pz - b.z0, bb = b.z1 - z - pz, mn = Math.min(l, rr, t, bb); if (mn === l) px -= l + r; else if (mn === rr) px += rr + r; else if (mn === t) pz -= t + r; else pz += bb + r; }
        else { px += ex / dd * (r - dd); pz += ez / dd * (r - dd); } hit = b; }
    }
  }
  return { x: px, z: pz, hit: hit };
}
/* the top of whatever you stand on (roofs of boxes you can stand on, ramps, ground) */
function standY(x, z, y) {
  if (G.interior) return 0;
  var g = groundY(x, z), ls = near(SOLID, x, z, 0.6);
  for (var k = 0; k < ls.length; k++) { var b = ls[k]; if (!b.top && !b.ramp) continue; if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) continue; var t = b.ramp ? b.ramp(x, z) : b.y1; if (t <= y + 0.7 && t > g) g = t; }
  return g;
}
/* a ray against the buildings and boxes: the distance to the first hit (for the camera and bullets) */
function rayBlock(ax, ay, az, bx, by, bz) {
  if (G.interior) { var RM = G.interior.RM, tt = 1; [[bx, 0.3, ax], [bx, RM.w - 0.3, ax], [bz, 0.3, az], [bz, RM.d - 0.3, az], [by, 0.3, ay], [by, 3.7, ay]].forEach(function (q, i) { var lim = q[1], b = q[0], a = q[2], lo = i % 2 === 0; if ((lo && b < lim) || (!lo && b > lim)) { var t = (lim - a) / ((b - a) || 1e-6); if (t >= 0 && t < tt) tt = t; } }); return tt; }
  var dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz), best = 1;
  if (L < 0.001) return 1;
  var steps = Math.ceil(L / 8), cand = [];
  for (var s = 0; s <= steps; s++) { var t = s / steps, l1 = near(BGRID, ax + dx * t, az + dz * t, 4), l2 = near(SOLID, ax + dx * t, az + dz * t, 4); l1.forEach(function (b) { if (cand.indexOf(b) < 0) cand.push(b); }); l2.forEach(function (b) { if (cand.indexOf(b) < 0) cand.push(b); }); }
  cand.forEach(function (b) { var y0 = b.y1 !== undefined ? b.y0 : b.y0 - 2, y1 = b.y1 !== undefined ? b.y1 : b.y0 + b.h; if (b.post) { /* posts: treat as a box */ }
    var tmin = 0, tmax = 1, o = [ax, ay, az], d = [dx, dy, dz], lo = [b.x0, y0, b.z0], hi = [b.x1, y1, b.z1];
    for (var a = 0; a < 3; a++) { if (Math.abs(d[a]) < 1e-6) { if (o[a] < lo[a] || o[a] > hi[a]) return; continue; } var t1 = (lo[a] - o[a]) / d[a], t2 = (hi[a] - o[a]) / d[a]; if (t1 > t2) { var q = t1; t1 = t2; t2 = q; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) return; }
    if (tmin < best) best = tmin; });
  // the ground
  for (var g = 1; g <= 16; g++) { var t2 = g / 16; if (t2 > best) break; if (ay + dy * t2 < groundY(ax + dx * t2, az + dz * t2)) { best = Math.max(0, t2 - 1 / 16); break; } }
  return best;
}
/* ---------- the road graph (the traffic and the people on the pavements follow it) ---------- */
var RN = CITY.nodes.map(function (n, i) { return { i: i, x: n[0] * CT, z: n[1] * CT, e: [] }; });
var RE = CITY.edges.map(function (e, i) {
  var pts = [[RN[e[0]].x, RN[e[0]].z]].concat(e[3].map(function (p) { return [p[0] * CT, p[1] * CT]; })).concat([[RN[e[1]].x, RN[e[1]].z]]), L = 0, cum = [0];
  for (var k = 1; k < pts.length; k++) { L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); cum.push(L); }
  var E = { i: i, a: e[0], b: e[1], w: e[2] * CT, pts: pts, cum: cum, len: L, hs: e[4] }; RN[e[0]].e.push(i); RN[e[1]].e.push(i); return E;
});
/* a point along an edge: s metres from a (or from b when back), lane offset to the right of the way of travel */
function edgeAt(E, s, back, off) {
  if (back) s = E.len - s; s = clamp(s, 0, E.len); var k = 1; while (k < E.cum.length - 1 && E.cum[k] < s) k++;
  var a = E.pts[k - 1], b = E.pts[k], seg = E.cum[k] - E.cum[k - 1] || 1, t = (s - E.cum[k - 1]) / seg, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, dx = (b[0] - a[0]) / seg, dz = (b[1] - a[1]) / seg;
  if (back) { dx = -dx; dz = -dz; } var o = off || 0; return { x: x - dz * o, z: z + dx * o, dx: dx, dz: dz, a: Math.atan2(dx, dz) };
}
var EGRID = {}; RE.forEach(function (E) { for (var k = 0; k < E.pts.length - 1; k++) { var a = E.pts[k], b = E.pts[k + 1]; gridAdd(EGRID, Math.min(a[0], b[0]) - 8, Math.min(a[1], b[1]) - 8, Math.max(a[0], b[0]) + 8, Math.max(a[1], b[1]) + 8, E); } });
/* the nearest road to a point: { E, s (metres along), d (distance), side } */
function nearestRoad(x, z, maxd) {
  var best = null, bd = (maxd || 60) * (maxd || 60), r = maxd || 60, ls = near(EGRID, x, z, Math.min(r, 64));
  ls.forEach(function (E) { for (var k = 0; k < E.pts.length - 1; k++) { var a = E.pts[k], b = E.pts[k + 1], vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / l2, 0, 1), px = a[0] + vx * t, pz = a[1] + vz * t, d = dist2(x, z, px, pz);
    if (d < bd) { bd = d; best = { E: E, s: E.cum[k] + Math.sqrt(l2) * t, d: Math.sqrt(d), x: px, z: pz, side: (vx * (z - a[1]) - vz * (x - a[0])) > 0 ? 1 : -1, dx: vx / Math.sqrt(l2), dz: vz / Math.sqrt(l2) }; } } });
  return best;
}
/* ---------- places ---------- */
var POIS = CITY.poi.map(function (p) { var o = {}; for (var k in p) o[k] = p[k]; o.x = p.x * CT; o.z = p.z * CT; if (o.x0 !== undefined) { o.x0 *= CT; o.x1 *= CT; o.z0 *= CT; o.z1 *= CT; } return o; });
function poisOf(k) { return POIS.filter(function (p) { return p.k === k; }); }
function poiNamed(k, n) { return POIS.filter(function (p) { return p.k === k && (!n || p.name === n); })[0]; }
var SHOPS = {}; CITY.shops.forEach(function (s) { if (s[2] < 0) return; var b = BLD[s[2]]; SHOPS[s[0]] = { id: s[0], name: s[1], b: b }; b.shopName = s[1]; });
/* the door of a building: the middle of its front face, a step out onto the pavement */
function doorOf(b) { var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; return [{ x: cx, z: b.z0 - 1.2, a: Math.PI }, { x: b.x1 + 1.2, z: cz, a: Math.PI / 2 }, { x: cx, z: b.z1 + 1.2, a: 0 }, { x: b.x0 - 1.2, z: cz, a: -Math.PI / 2 }][b.front]; }
var HOUSES = CITY.houses.map(function (h) { return { id: h.id, name: h.name, cost: h.cost, b: BLD[h.b] }; });
function districtName(x, z) { var d = dAt(x, z); return d.id === 'sea' ? 'Open Sea' : d.name; }
