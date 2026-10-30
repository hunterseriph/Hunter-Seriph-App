/* =====================================================================================================
   ZONES: a full course drives through several parts of its place. def.zones = [[from, themeId, overrides], ...]
   (from: where along the lap the zone starts, 0..1, first one 0). Each zone paints its own tiles (named
   'z<n>:<tile>' in the shared atlas), builds its own walls, light and scenery over its own stretch of road,
   and brings its own hazards. A gateway marks every border, and the zone's name comes up as you drive in.
   ===================================================================================================== */
function zoneAtlas(A, zi) {
  return { canvas: A.canvas, slots: A.slots,
    add: function (n, fn, o) { var had = A.slots[n], t = A.add('z' + zi + ':' + n, fn, o); if (!had) A.slots[n] = t; else A.slots[n] = had; return t; }, // a theme's own tiles stay findable by plain name (moving things look them up that way)
    tile: function (n) { return A.slots['z' + zi + ':' + n] || A.slots[n] || A.slots.white; } };
}
/* the track as one zone sees it: samples counted from the zone's start, at()/fractions inside the zone, its own box */
function zoneView(T, Z) {
  var o = Object.create(T), S2 = [], N = T.N, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (var k = 0; k < N; k++) S2.push(T.S[(Z.s + k) % N]);
  for (var j = 0; j < Z.n; j++) { var q = S2[j]; x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); }
  o.S = S2; o.N = Z.n; o.def = Z.def; o.zone = Z; o.box = [x0, z0, x1, z1];
  o.at = function (f) { return S2[Math.max(0, Math.min(Z.n - 1, Math.round(f * (Z.n - 1))))]; };
  o.idx = function (f) { return (Z.s + Math.max(0, Math.min(Z.n - 1, Math.round(f * (Z.n - 1))))) % N; };
  return o;
}
function setupZones(T, def, A) {
  var N = T.N, list = def.zones.map(function (z, i) { return { i: i, f: z[0], th: z[1], o: z[2] || {} }; });
  T.zones = list.map(function (z, i) {
    var s = Math.round(z.f * N) % N, e = i + 1 < list.length ? Math.round(list[i + 1].f * N) : N, d = {}; for (var k in def) d[k] = def[k]; delete d.zones; for (var q in z.o) d[q] = z.o[q];
    return { i: i, s: s, n: Math.max(1, e - s), TH: THEMES[z.th], th: z.th, def: d, A: zoneAtlas(A, i), name: z.o.name || '' };
  });
  var map = new Int16Array(N); T.zones.forEach(function (Z) { for (var k = 0; k < Z.n; k++) map[(Z.s + k) % N] = Z.i; });
  T.zoneMap = map; T.zoneAt = function (i) { return T.zones[map[((i % N) + N) % N]]; };
  T.zones.forEach(function (Z) { Z.TH.tiles(Z.A, Z.def); });
}
/* every zone builds its scenery on its own stretch; everything they make is gathered into one builder */
function zoneScenery(T, A, m) {
  var B = Builder(T, A, m), skip = { T: 1, A: 1, m: 1, rnd: 1 };
  T.zones.forEach(function (Z) {
    var Bz = Builder(T, Z.A, m, Z); if (Z.TH.scen) Z.TH.scen(Bz, Z.def);
    Object.keys(Bz).forEach(function (k) { var v = Bz[k]; if (skip[k] || typeof v === 'function') return; if (Array.isArray(v)) B[k] = (B[k] || []).concat(v); else if (B[k] === undefined) B[k] = v; });
    zoneGate(B, Z, T);
  });
  return B;
}
/* the gateway at the start of a zone: two pillars and a lintel over the road, lit, in the new zone's stone */
function zoneGate(B, Z, T) {
  if (T.zones.length < 2) return; var q = T.S[Z.s], prev = T.zones[(Z.i - 1 + T.zones.length) % T.zones.length], h = Math.max(Z.def.wallH, prev.def.wallH, 2) + 4.5;
  var e = T.edge + 0.7, ry = Math.atan2(q.tz, q.tx), A = Z.A, L = Z.def.light, Bx = Builder(T, A, B.m);
  [1, -1].forEach(function (sd) { var x = q.x + q.nx * (e + 1) * sd, z = q.z + q.nz * (e + 1) * sd; Bx.box(x, q.y - 0.5, z, 2.4, 2.4, h + 0.5, ry, 'wall', 'trim', L); });
  Bx.box(q.x, q.y + h - 1.6, q.z, 2.6, (e + 2.2) * 2, 1.8, ry, 'trim', 'trim', mulc(L, 1.1));
  [1, -1].forEach(function (sd) { B.light(q.x + q.nx * (e - 1) * sd, q.y + h - 2.2, q.z + q.nz * (e - 1) * sd, 12, Z.def.gateLight || [0.8, 0.55, 0.25], Z.def.gateHalo || '#ffc060'); });
}
/* the hooks of all the zones' themes, run together */
function zoneTheme(T) {
  var ths = []; T.zones.forEach(function (Z) { if (ths.indexOf(Z.TH) < 0) ths.push(Z.TH); });
  function all(name) { var fs = []; ths.forEach(function (t) { if (t[name] && fs.indexOf(t[name]) < 0) fs.push(t[name]); }); return fs.length ? function () { var a = arguments; fs.forEach(function (f) { f.apply(null, a); }); } : null; }
  return { dust: T.zones[0].TH.dust, init: all('init'), step: all('step'), kartStep: all('kartStep'), drawDyn: all('drawDyn'), drawBills: all('drawBills'), zoned: true };
}
/* the HUD banner as you drive into a zone, and the light round your kart */
function zoneTick(R) {
  var T = R.T; if (!T.zones || R.phase !== 'go') return; var Z = T.zoneAt(R.me.seg);
  if (R.zoneNow !== Z.i) { if (R.zoneNow !== undefined && Z.name) R.zoneBanner = { n: Z.name, t: 2.4 }; R.zoneNow = Z.i; }
}
function kartLight(R, k) { var T = R.T; return T.zoneAt && k.seg >= 0 ? T.zoneAt(k.seg).def.light : R.def.light; }
