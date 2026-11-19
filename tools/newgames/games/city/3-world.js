/* ---------- the world, built in 64 m chunks as you get near (terrain, roads, buildings, trees, props), and the landmarks ---------- */
var CS = 64, CTN = CS / CT, CXN = Math.ceil(WX / CS), CZN = Math.ceil(WZ / CS);
var CHUNKS = {}, SOLIDDONE = {}, VIEWR = 300, LMK = [];
var SUN = (function () { var v = [0.45, 0.8, 0.35], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();
function cLit(i, j) { var hx = cornerH(i + 1, j) - cornerH(i - 1, j), hz = cornerH(i, j + 1) - cornerH(i, j - 1), l = Math.hypot(hx, 2 * CT, hz); return lit([-hx / l, 2 * CT / l, -hz / l]); }
function lit(n, k) { var d = Math.max(0, n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2]); k = (k || 1) * (0.62 + 0.42 * d) * 0.5; return [k, k, k]; }
function litc(hex, n, k) { var c = rgb01(hex), s = lit(n, k); return [c[0] * s[0] * 2, c[1] * s[1] * 2, c[2] * s[2] * 2]; }
var UV1 = [0, 1, 1, 1, 1, 0, 0, 0], UVR1 = [1, 1, 1, 0, 0, 0, 0, 1];
function uvR(u, v) { return [0, v, u, v, u, 0, 0, 0]; }
/* a box with its own texture per face group: o.wall, o.top, o.u (metres per tile across), o.v (metres per tile up) */
function boxT(m, x0, y0, z0, x1, y1, z1, o) {
  var tw = TL(o.wall || 'concrete'), tt = TL(o.top || o.wall || 'roof'), su = o.u || 4, sv = o.v || 3.5, k = o.k || 1, g = o.g || 0;
  var col = o.col ? function (n) { return litc(o.col, n, k); } : function (n) { return lit(n, k); };
  function side(a, b, c, d, n, len) { m.quad(a, b, c, d, uvR(len / su, (y1 - y0) / sv), tw, col(n), n, g); }
  side([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], x1 - x0); side([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], x1 - x0);
  side([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], z1 - z0); side([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], z1 - z0);
  if (!o.noTop) m.quad([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], uvR((x1 - x0) / (o.tu || 4), (z1 - z0) / (o.tu || 4)), tt, col([0, 1, 0]), [0, 1, 0], g);
}
/* a box in one colour (for small things) */
function boxC(m, x0, y0, z0, x1, y1, z1, hex, g) { var T = TL('white'); [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]], [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0]]].forEach(function (f) { m.quad(f[0], f[1], f[2], f[3], UV1, T, litc(hex, f[4]), f[4], g || 0); }); }
/* a box turned by angle a round (cx, cz) */
function boxR(m, cx, cz, a, hw, hd, y0, y1, hex, T, g) { var c = Math.cos(a), s = Math.sin(a); function P(x, z, y) { return [cx + x * c + z * s, y, cz - x * s + z * c]; } T = T ? TL(T) : TL('white');
  var F = [[[-hw, hd], [hw, hd], [0, 0, 1]], [[hw, -hd], [-hw, -hd], [0, 0, -1]], [[hw, hd], [hw, -hd], [1, 0, 0]], [[-hw, -hd], [-hw, hd], [-1, 0, 0]]];
  F.forEach(function (f) { var n = [f[2][0] * c + f[2][2] * s, 0, -f[2][0] * s + f[2][2] * c]; m.quad(P(f[0][0], f[0][1], y0), P(f[1][0], f[1][1], y0), P(f[1][0], f[1][1], y1), P(f[0][0], f[0][1], y1), UV1, T, litc(hex, n), n, g || 0); });
  m.quad(P(-hw, -hd, y1), P(-hw, hd, y1), P(hw, hd, y1), P(hw, -hd, y1), UV1, T, litc(hex, [0, 1, 0]), [0, 1, 0], g || 0); }
/* a quad standing up facing direction a (a sign, a front, a billboard) */
function standQ(m, cx, cz, a, w, y0, y1, T, k, g, u) { var c = Math.cos(a), s = Math.sin(a), dx = c * w / 2, dz = -s * w / 2, n = [s, 0, c]; m.quad([cx - dx, y0, cz - dz], [cx + dx, y0, cz + dz], [cx + dx, y1, cz + dz], [cx - dx, y1, cz - dz], u || UV1, T, lit(n, k || 1.1), n, g || 0); }
/* ---------- what the ground looks like ---------- */
function groundTile(k, d) {
  var st = d.style;
  switch (k) {
    case K_ROAD: return st === 'redlight' ? 'asphaltw' : 'asphalt'; case K_BRIDGE: return 'asphalt';
    case K_PAVE: return st === 'redlight' || st === 'castle' || st === 'darkcastle' ? 'paver' : st === 'park' ? 'paver' : 'pave';
    case K_LOT: return 'concrete'; case K_YARD: return 'concrete'; case K_RUNWAY: return 'runway'; case K_PIER: return 'pier';
    case K_GRASS: return st === 'isles' ? 'grass' : 'grass'; case K_PARK: return 'grass'; case K_FOREST: return 'forest'; case K_FIELD: return 'field';
    case K_SAND: return 'sand'; case K_ROCK: return st === 'darkcastle' ? 'darkstone' : 'rockg'; case K_DIRT: return st === 'quarry' ? 'bone' : 'dirt'; case K_GRAVE: return 'gravegrass';
    default: return 'sand';
  }
}
var CLR = (function () { var m = new Uint8Array(MW * MH); (CITY.clear || []).forEach(function (r) { for (var j = Math.max(0, r[1]); j < Math.min(MH, r[3]); j++) for (var i = Math.max(0, r[0]); i < Math.min(MW, r[2]); i++) m[j * MW + i] = 1; }); return m; })(); // update 158: no trees or rocks on the country places
function natural(k) { return k === K_GRASS || k === K_PARK || k === K_FOREST || k === K_FIELD || k === K_GRAVE; }
/* ---------- the chunk builder ---------- */
var BSTY = {
  downtown: { wall: ['w_down', 'w_down2', 'w_glass'], roof: 'roof', shop: 'w_shop' }, redlight: { wall: ['w_redbrick'], roof: 'roof', shop: 'w_shop' }, cafe: { wall: ['w_cafe', 'w_brick'], roof: 'roof', shop: 'w_shop' },
  house: { wall: ['w_house', 'w_house2'], roof: 'roofr' }, suburb: { wall: ['w_house', 'w_house2'], roof: 'roofr' }, shed: { wall: ['w_shed'], roof: 'roofs' }, industrial: { wall: ['w_shed', 'w_dock'], roof: 'roofs' },
  docks: { wall: ['w_dock', 'w_shed'], roof: 'roofs' }, lab: { wall: ['w_lab'], roof: 'roof' }, labs: { wall: ['w_lab'], roof: 'roof' }, frame: { wall: ['w_frame'], roof: 'concrete' }, park: { wall: ['w_cafe'], roof: 'roof' }, airport: { wall: ['w_lab'], roof: 'roofs' }
};
var NEONS = ['neon_girls', 'neon_xxx', 'neon_open', 'neon_cum', 'neon_live', 'neon_bar', 'neon_heart', 'neon_peep', 'neon_sex', 'neon_cock', 'neon_dance'];
/* update 156 (his ask: the city needs to look cooler, more neon): blade signs that stick out from the wall and read
   top to bottom, and neon tubes along the roof line and round the ground floor, in the busy districts. */
var BLADES = [['HOTEL', '#ff2630'], ['BAR', '#ffe36a'], ['XXX', '#ff3aa0'], ['GIRLS', '#ff7ab0'], ['DINER', '#4adfff'], ['PIZZA', '#ffb030'], ['LIVE', '#7aff6a'], ['MOTEL', '#ff2630'], ['CLUB', '#c48aff'], ['LOADS', '#f1e7d0'], ['24HRS', '#7aff6a'], ['TATTOO', '#ff2630'], ['PAWN', '#ffe36a'], ['KARAOKE', '#4adfff'], ['NOODLES', '#ffb030'], ['VAPES', '#7aff6a']];
var NEONCOL = ['#ff2630', '#ff3aa0', '#4adfff', '#ffe36a', '#c48aff', '#7aff6a', '#ff7ab0'];
(function () { BLADES.forEach(function (b, i) { HIPAINT['bl_' + i] = function (g) { g.fillStyle = '#12040a'; g.fillRect(8, 0, 48, 64); g.strokeStyle = b[1]; g.lineWidth = 2; g.strokeRect(10, 1, 44, 62); var L = b[0].split(''), sz = Math.min(14, Math.floor(60 / L.length)); g.fillStyle = b[1]; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold ' + sz + 'px "Archivo Narrow", sans-serif'; L.forEach(function (c, k) { g.fillText(c, 32, 32 + (k - (L.length - 1) / 2) * sz * 0.98); }); }; }); })();
function neonDress(m, glow, b, F, fw, yt, r) { var st = b.style, busy = st === 'redlight' ? 1 : st === 'cafe' ? 0.7 : st === 'downtown' ? 0.45 : st === 'suburb' || st === 'docks' || st === 'industrial' ? 0.12 : 0; if (!busy || fw < 5) return;
  var c = Math.cos(F.a), s = Math.sin(F.a), col = NEONCOL[Math.floor(hash2(b.i, 7, 7) * NEONCOL.length)], ex = F.n[0], ez = F.n[2];
  // a blade sign by one corner of the front
  if (hash2(b.i, 8, 8) < busy) { var u = hash2(b.i, 9, 9) < 0.5 ? 0.2 : 0.8, bx = F.L[0] + (F.R[0] - F.L[0]) * u + ex * 0.9, bz = F.L[1] + (F.R[1] - F.L[1]) * u + ez * 0.9, h0 = b.y0 + 4.6, h1 = Math.min(yt - 0.4, h0 + 6.5), bl = 'bl_' + Math.floor(hash2(b.i, 10, 10) * BLADES.length);
    if (h1 - h0 > 2.5) { boxC(m, bx - ex * 0.8 - 0.05, h0 + 0.3, bz - ez * 0.8 - 0.05, bx + 0.05, h0 + 0.42, bz + 0.05, '#1a1a1e'); boxC(m, bx - ex * 0.8 - 0.05, h1 - 0.42, bz - ez * 0.8 - 0.05, bx + 0.05, h1 - 0.3, bz + 0.05, '#1a1a1e');
      var px = Math.cos(F.a), pz = -Math.sin(F.a); /* update 166: the two faces stand 9 cm apart either side of a dark blade (they were in the same place: flicker, and the back read through backwards) */
      boxR(m, bx, bz, F.a, 0.07, 0.78, h0 - 0.05, h1 + 0.05, '#12040a');
      standQ(glow, bx + px * 0.09, bz + pz * 0.09, F.a + Math.PI / 2, 1.5, h0, h1, TL(bl), 1.4, 1.2); standQ(glow, bx - px * 0.09, bz - pz * 0.09, F.a - Math.PI / 2, 1.5, h0, h1, TL(bl), 1.4, 1.2); } }
  // a neon tube along the roof line of the front
  if (hash2(b.i, 11, 11) < busy && fw < 26 && /redlight|cafe|downtown/.test(st)) { var tx = ex * 0.08, tz = ez * 0.08; boxC(glow, Math.min(F.L[0], F.R[0]) + tx - (ex ? 0.04 : 0), yt - 0.18, Math.min(F.L[1], F.R[1]) + tz - (ez ? 0.04 : 0), Math.max(F.L[0], F.R[0]) + tx + (ex ? 0.04 : 0), yt - 0.06, Math.max(F.L[1], F.R[1]) + tz + (ez ? 0.04 : 0), col); }
  // and one over the ground floor
  if (hash2(b.i, 12, 12) < busy * 0.8) { var col2 = NEONCOL[Math.floor(hash2(b.i, 13, 13) * NEONCOL.length)], tx2 = ex * 0.1, tz2 = ez * 0.1; boxC(glow, Math.min(F.L[0], F.R[0]) + tx2 - (ex ? 0.04 : 0), b.y0 + 4.25, Math.min(F.L[1], F.R[1]) + tz2 - (ez ? 0.04 : 0), Math.max(F.L[0], F.R[0]) + tx2 + (ex ? 0.04 : 0), b.y0 + 4.35, Math.max(F.L[1], F.R[1]) + tz2 + (ez ? 0.04 : 0), col2); }
}
var SIGNOF = { ali: 'sign_ali', harold: 'sign_harold', jessiah: 'sign_jessiah', natty: 'sign_natty', judge: 'sign_judge', fate: 'sign_fate', bates: 'sign_bates', motors: 'sign_motors', estate: 'sign_estate', wash: 'sign_wash', wash2: 'sign_wash2', cops: 'sign_cops', hosp: 'sign_hosp', gym: 'sign_gym', bank: 'sign_bank', tattoo: 'sign_tattoo' };
var FACOF = { club: 'fac_club', saba: 'fac_saba', pulsar: 'fac_pulsar', arcade: 'fac_arcade', sanct: 'fac_sanct', t: 'fac_t', bonjo: 'fac_bonjo', tb: 'fac_tb', cafe: 'fac_cafe', greebo: 'fac_greebo', amy: 'fac_amy', joff: 'fac_joff', beebs: 'fac_beebs' };
function frontFace(b) { // the corners of the front face, left to right as you look at it, and the way it faces
  switch (b.front) { case 0: return { L: [b.x1, b.z0], R: [b.x0, b.z0], a: Math.PI, n: [0, 0, -1] }; case 1: return { L: [b.x1, b.z1], R: [b.x1, b.z0], a: Math.PI / 2, n: [1, 0, 0] };
    case 2: return { L: [b.x0, b.z1], R: [b.x1, b.z1], a: 0, n: [0, 0, 1] }; default: return { L: [b.x0, b.z0], R: [b.x0, b.z1], a: -Math.PI / 2, n: [-1, 0, 0] }; } }
function buildChunk(ci, cj) {
  var M0 = new R3.Mesh(), NAT = new R3.Mesh(), VEG = new R3.Mesh(), WAT = new R3.Mesh(), NIGHT = new R3.Mesh(), FR = new R3.Mesh(), GLOW = new R3.Mesh();
  var x0 = ci * CS, z0 = cj * CS, i0 = ci * CTN, j0 = cj * CTN, lamps = [], first = !SOLIDDONE[ci + ',' + cj], FURN = new R3.Mesh(); CUR_FURN = FURN; CUR_KP = [];
  for (var j = j0; j < Math.min(MH, j0 + CTN); j++) for (var i = i0; i < Math.min(MW, i0 + CTN); i++) {
    var t = j * MW + i, k = KM[t], d = DIST[DM[t]], ax = i * CT, az = j * CT, bx = ax + CT, bz = az + CT;
    var h00 = cornerH(i, j), h10 = cornerH(i + 1, j), h01 = cornerH(i, j + 1), h11 = cornerH(i + 1, j + 1);
    if (isWaterK(k)) {
      var wy = k === K_CREAM ? CREAMY : WATERY;
      if (k !== K_SEA) WAT.quad([ax, wy, az], [ax, wy, bz], [bx, wy, bz], [bx, wy, az], UV1, TL(k === K_CREAM ? 'cream' : 'water'), k === K_CREAM ? [0.55, 0.55, 0.55] : [0.5, 0.5, 0.5], [0, 1, 0], k === K_CREAM ? 0.15 : 0);
      if (k !== K_SEA) { var bedT = TL(k === K_CREAM ? 'dirt' : 'sand'), bedC = [0.3, 0.3, 0.3]; if (Math.max(h00, h10, h01, h11) > wy - 0.02) { /* update 161: where the bank rises out of the water inside this square, it is the bank's own ground, not a brown step */ for (var nb = 0; nb < 8; nb++) { var ni2 = i + [1, -1, 0, 0, 1, 1, -1, -1][nb], nj2 = j + [0, 0, 1, -1, 1, -1, 1, -1][nb]; if (ni2 < 0 || nj2 < 0 || ni2 >= MW || nj2 >= MH) continue; var nk2 = KM[nj2 * MW + ni2]; if (!isWaterK(nk2) && nk2 !== K_ROAD && nk2 !== K_PAVE && nk2 !== K_BRIDGE && nk2 !== K_PIER) { bedT = TL(groundTile(nk2, DIST[DM[nj2 * MW + ni2]])); bedC = [cLit(i, j), cLit(i, j + 1), cLit(i + 1, j + 1), cLit(i + 1, j)]; break; } } }
        if (Math.abs(h00 - h11) > Math.abs(h10 - h01) + 0.01) M0.quad([ax, h01, bz], [bx, h11, bz], [bx, h10, az], [ax, h00, az], UVR1, bedT, bedC.length === 4 ? [bedC[1], bedC[2], bedC[3], bedC[0]] : bedC, [0, 1, 0]); else M0.quad([ax, h00, az], [ax, h01, bz], [bx, h11, bz], [bx, h10, az], UV1, bedT, bedC, [0, 1, 0]); }
      continue;
    }
    if (typeof SHOREWL !== 'undefined' && SHOREWL[t] > -50 && Math.min(h00, h10, h01, h11) < SHOREWL[t]) { var swl = SHOREWL[t], sc = Math.abs(swl - CREAMY) < 0.01; WAT.quad([ax, swl, az], [ax, swl, bz], [bx, swl, bz], [bx, swl, az], UV1, TL(sc ? 'cream' : 'water'), sc ? [0.55, 0.55, 0.55] : [0.5, 0.5, 0.5], [0, 1, 0], sc ? 0.15 : 0); } // update 161: the water runs up the smoothed shore
    var raise = k === K_PAVE && !window.RIBBON ? 0.15 : 0, n = groundN(ax + 2, az + 2), T = TL(groundTile(k, d)), col = lit(n);
    if (k === K_BRIDGE && typeof BCOV !== 'undefined' && BCOV[t]) { underBridge(WAT, M0, i, j); continue; } // update 160: a smooth deck along the road is drawn instead (bridgeDress)
    if (k === K_BRIDGE) { // the deck, a girder down each open side, railings, a pier every few tiles
      M0.quad([ax, h00, az], [ax, h01, bz], [bx, h11, bz], [bx, h10, az], UV1, T, lit([0, 1, 0]), [0, 1, 0]);
      [[0, -1, ax, az, bx, az], [1, 0, bx, az, bx, bz], [0, 1, bx, bz, ax, bz], [-1, 0, ax, bz, ax, az]].forEach(function (s) { var ni = i + s[0], nj = j + s[1], nk = ni >= 0 && nj >= 0 && ni < MW && nj < MH ? KM[nj * MW + ni] : K_SEA; if (nk === K_BRIDGE || nk === K_ROAD) return;
        var ya = groundY(s[2] + (s[2] === bx ? -0.01 : 0.01), s[3] + (s[3] === bz ? -0.01 : 0.01)), yb = groundY(s[4] + (s[4] === bx ? -0.01 : 0.01), s[5] + (s[5] === bz ? -0.01 : 0.01)), nn = [s[0], 0, s[1]];
        M0.quad([s[2], ya - 1.4, s[3]], [s[4], yb - 1.4, s[5]], [s[4], yb, s[5]], [s[2], ya, s[3]], uvR(1, 0.4), TL('metal'), litc('#7a2a24', nn), nn);
        M0.quad([s[2], ya, s[3]], [s[4], yb, s[5]], [s[4], yb + 1.0, s[5]], [s[2], ya + 1.0, s[3]], uvR(1, 0.3), TL('bars'), litc('#c4121c', nn), nn);
        if (first && false) addBox(Math.min(s[2], s[4]) - (s[0] ? 0 : 0) - (s[0] < 0 ? 0.3 : 0), Math.min(s[3], s[5]) - (s[1] < 0 ? 0.3 : 0), Math.max(s[2], s[4]) + (s[0] > 0 ? 0.3 : 0), Math.max(s[3], s[5]) + (s[1] > 0 ? 0.3 : 0), Math.min(ya, yb) - 1.4, Math.max(ya, yb) + 1.0, { rail: 1 }); });
      if ((i + j) % 6 === 0) boxC(M0, ax + 1.4, -6, az + 1.4, ax + 2.6, Math.min(h00, h11) - 1.3, az + 2.6, '#5a4a44');
      continue;
    }
    if (window.RIBBON && (k === K_ROAD || k === K_PAVE)) { ribbonTile(M0, NAT, i, j, k, d, h00, h10, h01, h11); continue; }
    if (window.RIBBON && grassPave(M0, NAT, i, j, k, d)) continue; /* update 165: roads are drawn as smooth surfaces along the road graph (roadRibbons) */
    var outK = k, cutT = false; if (k === K_ROAD) { outK = -1; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var nk = KM[nj * MW + ni]; if (nk === K_PAVE) outK = K_PAVE; else if (outK < 0 && (nk === K_GRASS || nk === K_FIELD || nk === K_DIRT || nk === K_SAND || nk === K_LOT || nk === K_PARK || nk === K_ROCK || nk === K_FOREST || nk === K_GRAVE)) outK = nk; }); if (outK < 0) for (var rr = 1; rr <= 2 && outK < 0; rr++) for (var qj = -rr; qj <= rr && outK < 0; qj++) for (var qi = -rr; qi <= rr; qi++) { var ni3 = i + qi, nj3 = j + qj; if (ni3 < 0 || nj3 < 0 || ni3 >= MW || nj3 >= MH) continue; var nk3 = KM[nj3 * MW + ni3]; if (nk3 === K_PAVE) break; if (nk3 === K_GRASS || nk3 === K_FIELD || nk3 === K_DIRT || nk3 === K_SAND || nk3 === K_PARK || nk3 === K_ROCK || nk3 === K_FOREST || nk3 === K_GRAVE) { outK = nk3; break; } } /* update 161: a road square past the road's real edge with road all round it still gets cut (they stuck out as teeth) */ }
    else if (k === K_GRASS || k === K_FIELD || k === K_DIRT || k === K_SAND || k === K_LOT || k === K_PARK || k === K_ROCK || k === K_FOREST || k === K_GRAVE) { var nr = false; [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (ni >= 0 && nj >= 0 && ni < MW && nj < MH && KM[nj * MW + ni] === K_ROAD) nr = true; }); /* update 161: corner neighbours too, so the road's edge has no teeth */ if (!nr) outK = -1; }
    if (!window.RIBBON && (k === K_PAVE || outK >= 0) && (k === K_ROAD || k === K_PAVE || outK >= 0)) cutT = pavePiece(M0, i, j, k, d, [h00, h10, h01, h11], first, k === K_ROAD ? outK : k, NAT); if (cutT && typeof cutSkirts === 'function') cutSkirts(M0, i, j); if (cutT && k === K_ROAD) continue;
    if (!cutT && k === K_PAVE && paveOuter(M0, NAT, i, j, d, [h00, h10, h01, h11])) { if (typeof cutSkirts === 'function') cutSkirts(M0, i, j); continue; } // update 160: the back of the pavement follows the road's curve
    if (!cutT && typeof softPiece === 'function' && softPiece(M0, NAT, i, j, k, d, [h00, h10, h01, h11])) cutT = 1; // update 161: soft edges between ground kinds
    if (!cutT && (natural(k) || k === K_SAND || k === K_ROCK || k === K_DIRT)) col = [cLit(i, j), cLit(i, j + 1), cLit(i + 1, j + 1), cLit(i + 1, j)]; /* update 161: smooth shading across the hills, not a flat shade per square */
    if (!cutT) { if (Math.abs(h00 - h11) > Math.abs(h10 - h01) + 0.01) (natural(k) ? NAT : M0).quad([ax, h01 + raise, bz], [bx, h11 + raise, bz], [bx, h10 + raise, az], [ax, h00 + raise, az], UVR1, T, col.length === 4 ? [col[1], col[2], col[3], col[0]] : col, n); /* update 161: split each square along its flatter diagonal, so slopes and shores have no zigzags */ else (natural(k) ? NAT : M0).quad([ax, h00 + raise, az], [ax, h01 + raise, bz], [bx, h11 + raise, bz], [bx, h10 + raise, az], UV1, T, col, n); }
    if (k === K_PAVE && !cutT) [[0, -1, ax, az, bx, az, h00, h10], [1, 0, bx, az, bx, bz, h10, h11], [0, 1, bx, bz, ax, bz, h11, h01], [-1, 0, ax, bz, ax, az, h01, h00]].forEach(function (s) { var ni = i + s[0], nj = j + s[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var nk = KM[nj * MW + ni]; if (nk === K_PAVE || nk === K_ROAD || nk === K_BRIDGE) return; var nn = [s[0], 0, s[1]]; // update 160: the pavement's edge against grass, lots and yards gets a face too (there was a slit under it)
      M0.quad([s[2], s[6] - 0.25, s[3]], [s[4], s[7] - 0.25, s[5]], [s[4], s[7] + 0.15, s[5]], [s[2], s[6] + 0.15, s[3]], uvR(1, 0.1), TL('kerb'), lit(nn), nn); });
    // the kerb: a little step where pavement meets road
    if (k === K_PAVE && !cutT) [[0, -1, ax, az, bx, az, h00, h10], [1, 0, bx, az, bx, bz, h10, h11], [0, 1, bx, bz, ax, bz, h11, h01], [-1, 0, ax, bz, ax, az, h01, h00]].forEach(function (s) { var ni = i + s[0], nj = j + s[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var nk = KM[nj * MW + ni]; if (nk !== K_ROAD && nk !== K_BRIDGE) return; if (nk === K_ROAD && roadF((s[2] + s[4]) / 2 + s[0] * 0.3, (s[3] + s[5]) / 2 + s[1] * 0.3) > 0.1) return; var nn = [s[0], 0, s[1]];
      M0.quad([s[2], s[6] - 0.25, s[3]], [s[4], s[7] - 0.25, s[5]], [s[4], s[7] + 0.15, s[5]], [s[2], s[6] + 0.15, s[3]], uvR(1, 0.1), TL('kerb'), lit(nn), nn); });
    // trees in the forest and parks (season-tinted), graves, rocks, hedges
    var r1 = CLR[t] ? 1 : hash2(i, j, 1), r2 = hash2(i, j, 2), r3 = hash2(i, j, 3);
    if ((outK < 0 || roadF(ax + 0.6 + r2 * 2.8, az + 0.6 + r3 * 2.8) > 2.5) && (typeof SHOREWL === 'undefined' || SHOREWL[t] < -50 || Math.min(h00, h10, h01, h11) > SHOREWL[t] + 0.2)) if (k === K_FOREST || (k === K_PARK && d.id !== 'ejac' && r1 < 0.18) || (k === K_GRASS && r1 < 0.065 && d.style !== 'suburb') || (k === K_FIELD && r1 < 0.01)) {
      var tx = ax + 0.6 + r2 * 2.8, tz = az + 0.6 + r3 * 2.8, ty = groundY(tx, tz), pine = d.style === 'forest' || d.style === 'haunted' ? r1 < 0.75 : d.style === 'castle' || d.style === 'peak' || d.style === 'darkcastle' ? r1 < 0.6 : r1 < 0.2;
      tree(VEG, tx, ty, tz, pine, 0.75 + hash2(i, j, 4) * 0.6, d.style === 'haunted' || d.style === 'darkcastle' || d.style === 'cemetery', d.style === 'isles' && !pine);
      if (first) addPost(tx, tz, 0.35, ty, ty + 6);
      if (k === K_FOREST && r1 < 0.35) { var bx2 = ax + hash2(i, j, 9) * 4, bz2 = az + hash2(i, j, 10) * 4; ell(VEG, bx2, groundY(bx2, bz2) + 0.3, bz2, 0.7, 0.5, 0.7, '#2e4e22', 6, 3); }
    }
    if ((k === K_GRASS || k === K_FIELD) && r1 >= 0.065 && r1 < 0.16 && d.style !== 'suburb') { var gx2 = ax + 0.5 + r2 * 3, gz2 = az + 0.5 + r3 * 3, gy2 = groundY(gx2, gz2), q4 = hash2(i, j, 5); // update 156: the countryside was empty
      if (q4 < 0.45) { ell(VEG, gx2, gy2 + 0.35, gz2, 0.8 + r2 * 0.5, 0.55, 0.8, '#2e5222', 6, 3); ell(VEG, gx2 + 0.6, gy2 + 0.3, gz2 + 0.3, 0.6, 0.45, 0.6, '#3a6a2a', 6, 3); }
      else if (q4 < 0.75) { for (var fl = 0; fl < 5; fl++) ell(VEG, gx2 + Math.cos(fl * 1.3) * 0.7, gy2 + 0.12, gz2 + Math.sin(fl * 1.3) * 0.7, 0.14, 0.1, 0.14, ['#ffe36a', '#f1e7d0', '#c4121c', '#c48aff'][(fl + i) % 4], 4, 2); }
      else if (q4 < 0.9) { ell(NAT, gx2, gy2, gz2, 0.9 + r3, 0.6 + r2 * 0.6, 0.8, '#6a625c', 6, 3); if (first) addPost(gx2, gz2, 0.8, gy2, gy2 + 1); }
      else if (k === K_FIELD) { tub(VEG, [gx2, gy2, gz2], [gx2, gy2 + 1.2, gz2], 0.7, 0.7, '#c8a850', 8, { cap: 1 }); if (first) addPost(gx2, gz2, 0.7, gy2, gy2 + 1.2); }
      else { boxC(VEG, gx2 - 1.5, gy2 + 0.6, gz2 - 0.05, gx2 + 1.5, gy2 + 0.68, gz2 + 0.05, '#6a4a2a'); boxC(VEG, gx2 - 1.5, gy2 + 0.25, gz2 - 0.05, gx2 + 1.5, gy2 + 0.33, gz2 + 0.05, '#6a4a2a'); boxC(VEG, gx2 - 1.5, gy2, gz2 - 0.06, gx2 - 1.38, gy2 + 0.8, gz2 + 0.06, '#5a3a20'); boxC(VEG, gx2 + 1.38, gy2, gz2 - 0.06, gx2 + 1.5, gy2 + 0.8, gz2 + 0.06, '#5a3a20'); } }
    if (k === K_DIRT && d.style === 'quarry' && r1 < 0.08) { var bx3 = ax + 2, bz3 = az + 2, by3 = groundY(bx3, bz3); ell(M0, bx3, by3 + 0.35, bz3, 0.5, 0.45, 0.55, '#e0d4b8', 7, 4); ell(M0, bx3 + 0.6, by3 + 0.1, bz3 + 0.4, 0.6, 0.1, 0.12, '#d4c8a8', 5, 3); }
    if (k === K_GRAVE && r1 < 0.55 && (i % 2 === 0)) { var gx = ax + 2, gz = az + 1.5, gy = groundY(gx, gz); if (r2 < 0.6) boxT(M0, gx - 0.4, gy, gz - 0.1, gx + 0.4, gy + 0.9 + r3 * 0.4, gz + 0.12, { wall: 'stone', top: 'stone', u: 1, v: 1 }); else { boxC(M0, gx - 0.08, gy, gz - 0.08, gx + 0.08, gy + 1.4, gz + 0.08, '#6a6460'); boxC(M0, gx - 0.4, gy + 0.85, gz - 0.08, gx + 0.4, gy + 1.0, gz + 0.08, '#6a6460'); } }
    if (k === K_ROCK && r1 < 0.08) { var rx = ax + 2, rz = az + 2; ell(M0, rx, groundY(rx, rz), rz, 1 + r2, 0.8 + r3, 1.1, d.style === 'darkcastle' ? '#2a2228' : '#6a625c', 6, 3); if (first) addPost(rx, rz, 1.0, 0, 99); }
    if (k === K_SAND && d.style === 'beach' && r1 < 0.03) { var ux = ax + 2, uz = az + 2, uy = groundY(ux, uz); boxC(M0, ux - 0.04, uy, uz - 0.04, ux + 0.04, uy + 2.2, uz + 0.04, '#d8d0c0'); tub(M0, [ux, uy + 2.2, uz], [ux, uy + 2.7, uz], 1.3, 0.05, r2 < 0.5 ? '#c4121c' : '#f1e7d0', 8); }
    if (k === K_SAND && d.style === 'isles' && r1 < 0.05) { var px2 = ax + 2, pz2 = az + 2; palm(VEG, px2, groundY(px2, pz2), pz2, r2); if (first) addPost(px2, pz2, 0.3, 0, 99); }
  }
  if (window.RIBBON) roadRibbons(M0, x0, z0, CS, first);
  // roads: centre lines, edge lines and crossings
  near(EGRID, x0 + CS / 2, z0 + CS / 2, CS * 0.75).forEach(function (E) {
    if (window.RIBBON && (E.off || E.track)) return; /* update 165: switched-off edges are not drawn, so no lines or crossings on them */
    var step = 6, double = E.w >= 11;
    for (var s = 2; s < E.len - 2; s += step) { var p = edgeAt(E, s, false, 0); if (p.x < x0 || p.x >= x0 + CS || p.z < z0 || p.z >= z0 + CS) continue;
      var a0 = RN[E.a], a1 = RN[E.b]; if (Math.hypot(p.x - a0.x, p.z - a0.z) < E.w * 0.8 || Math.hypot(p.x - a1.x, p.z - a1.z) < E.w * 0.8) continue;
      var y = groundY(p.x, p.z) + 0.085, ca = p.dz, sa = -p.dx, l = 1.6, wd = double ? 0.5 : 0.18, T = TL(double ? 'yline' : 'dash');
      M0.quad([p.x - ca * wd - p.dx * l, y, p.z - sa * wd - p.dz * l], [p.x + ca * wd - p.dx * l, y, p.z + sa * wd - p.dz * l], [p.x + ca * wd + p.dx * l, y, p.z + sa * wd + p.dz * l], [p.x - ca * wd + p.dx * l, y, p.z - sa * wd + p.dz * l], [0, 1, 1, 1, 1, 0, 0, 0], T, [0.55, 0.55, 0.55], [0, 1, 0]); }
    [[E.a, false], [E.b, true]].forEach(function (q) { var nd = RN[q[0]]; if (nd.e.length < 3) return; var p = edgeAt(E, E.w * 0.75 + 1.5, q[1], 0); if (p.x < x0 || p.x >= x0 + CS || p.z < z0 || p.z >= z0 + CS) return; if (kAt(p.x, p.z) !== K_ROAD) return;
      var y = groundY(p.x, p.z) + 0.09, ca = p.dz, sa = -p.dx, hw = E.w / 2 - 0.3, l = 1.4;
      M0.quad([p.x - ca * hw - p.dx * l, y, p.z - sa * hw - p.dz * l], [p.x + ca * hw - p.dx * l, y, p.z + sa * hw - p.dz * l], [p.x + ca * hw + p.dx * l, y, p.z + sa * hw + p.dz * l], [p.x - ca * hw + p.dx * l, y, p.z - sa * hw + p.dz * l], [0, 0, hw / 2, 0, hw / 2, 1, 0, 1], TL('zebra'), [0.55, 0.55, 0.55], [0, 1, 0]); });
  });
  // buildings whose middle is in this chunk
  near(BGRID, x0 + CS / 2, z0 + CS / 2, CS * 0.75).forEach(function (b) { var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; if (cx < x0 || cx >= x0 + CS || cz < z0 || cz >= z0 + CS) return; building(M0, NIGHT, FR, GLOW, b, lamps); });
  BLD.forEach(function (b) { if (b.solid || b.style !== 'carpark') return; var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; if (cx < x0 || cx >= x0 + CS || cz < z0 || cz >= z0 + CS) return; carpark(M0, b); });
  if (typeof bridgeDress === 'function') bridgeDress(M0, x0, z0, CS, first);
  buildStreet(M0, GLOW, x0, z0, CS, lamps, first);
  if (typeof parkDress === 'function') { parkDress(M0, GLOW, x0, z0, CS, lamps, first); alleyDress(M0, GLOW, x0, z0, CS, first); }
  SOLIDDONE[ci + ',' + cj] = 1; var kpl = CUR_KP; CUR_FURN = null; CUR_KP = null;
  function up(m) { return m.n ? m.upload() : null; }
  return { ci: ci, cj: cj, x: x0 + CS / 2, z: z0 + CS / 2, r: typeof chunkR === 'function' ? chunkR(x0, z0, CS) : 50, m: up(M0), nat: up(NAT), veg: up(VEG), wat: up(WAT), night: up(NIGHT), fr: up(FR), glow: up(GLOW), furn: up(FURN), kp: kpl, lamps: lamps };
}
function tree(m, x, y, z, pine, s, dead, palmy) {
  if (dead) { tub(m, [x, y, z], [x, y + 4 * s, z], 0.22 * s, 0.1 * s, '#2a2220', 5); [0, 2.1, 4.2].forEach(function (a) { tub(m, [x, y + 3 * s, z], [x + Math.cos(a) * 1.4 * s, y + 4.4 * s, z + Math.sin(a) * 1.4 * s], 0.08 * s, 0.02, '#2a2220', 4); }); return; }
  tub(m, [x, y - 0.2, z], [x, y + (pine ? 1.6 : 2.4) * s, z], 0.2 * s, 0.14 * s, '#4a3424', 5, { T: TL('bark') });
  if (pine) { tub(m, [x, y + 1.2 * s, z], [x, y + 4.2 * s, z], 1.5 * s, 0.6 * s, '#24462a', 7, { T: TL('pine') }); tub(m, [x, y + 3.2 * s, z], [x, y + 6.6 * s, z], 1.0 * s, 0.0, '#2a5030', 7, { T: TL('pine'), cap: 1 }); }
  else ell(m, x, y + 3.6 * s, z, 1.9 * s, 1.6 * s, 1.9 * s, '#3e6e2c', 7, 4, { T: TL('leaves') });
}
function palm(m, x, y, z, r) { var lx = x + 0.8, lz = z + 0.3; tub(m, [x, y, z], [lx, y + 5, lz], 0.2, 0.14, '#7a5a3a', 5, { T: TL('bark') }); for (var k = 0; k < 6; k++) { var a = k / 6 * 6.28 + r; tub(m, [lx, y + 5, lz], [lx + Math.cos(a) * 2.4, y + 4.2, lz + Math.sin(a) * 2.4], 0.25, 0.04, '#3a7a2a', 4); } }
function carpark(m, b) { // painted bays and a few dead cars
  var y = groundY((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2) + 0.03;
  for (var x = b.x0 + 1; x < b.x1 - 1; x += 3) { m.quad([x, y, b.z0 + 1], [x, y, b.z0 + 6], [x + 0.12, y, b.z0 + 6], [x + 0.12, y, b.z0 + 1], UV1, TL('paint'), [0.5, 0.5, 0.5], [0, 1, 0]); m.quad([x, y, b.z1 - 6], [x, y, b.z1 - 1], [x + 0.12, y, b.z1 - 1], [x + 0.12, y, b.z1 - 6], UV1, TL('paint'), [0.5, 0.5, 0.5], [0, 1, 0]); }
}
/* a building: walls by style (shops get a shop front at the ground), roof clutter, signs, neon, lit windows at night */
function building(m, night, fr, glow, b, lamps) {
  var sty = BSTY[b.style] || BSTY.downtown, h = b.h, y0 = b.y0 - 1, yt = b.y0 + h, r = hash2(b.i, 7, 1), wall = b.wallX || sty.wall[Math.floor(r * sty.wall.length)];
  if (b.style === 'frame') { // the half-built towers of the site: storeys of concrete slab on posts, the frame texture between
    for (var f = 0; f * 3.5 < h; f++) { var fy = b.y0 + f * 3.5; boxC(m, b.x0, fy - 0.3, b.z0, b.x1, fy, b.z1, '#8a8a86'); [[b.x0, b.z0], [b.x1 - 0.5, b.z0], [b.x0, b.z1 - 0.5], [b.x1 - 0.5, b.z1 - 0.5]].forEach(function (c) { boxC(m, c[0], fy, c[1], c[0] + 0.5, fy + 3.5, c[1] + 0.5, '#8a8a86'); }); }
    boxT(m, b.x0 + 0.05, b.y0, b.z0 + 0.05, b.x1 - 0.05, yt, b.z1 - 0.05, { wall: 'w_frame', noTop: 1 }); return;
  }
  if (b.style === 'house' || b.style === 'suburb') { // walls, a pitched roof along the long side, chimney, door, garden hedge
    boxT(m, b.x0, y0, b.z0, b.x1, yt, b.z1, { wall: wall, noTop: 1, v: h > 6 ? 3.5 : 5 }); var along = b.x1 - b.x0 >= b.z1 - b.z0, rh = 2.6, rT = TL(b.roofX || 'roofr');
    if (along) { var zm = (b.z0 + b.z1) / 2; m.quad([b.x0 - 0.4, yt, b.z0 - 0.4], [b.x0 - 0.4, yt + rh, zm], [b.x1 + 0.4, yt + rh, zm], [b.x1 + 0.4, yt, b.z0 - 0.4], uvR((b.x1 - b.x0) / 3, 1.5), rT, lit([0, 0.7, -0.7]), [0, 0.7, -0.7]); m.quad([b.x0 - 0.4, yt, b.z1 + 0.4], [b.x0 - 0.4, yt + rh, zm], [b.x1 + 0.4, yt + rh, zm], [b.x1 + 0.4, yt, b.z1 + 0.4], uvR((b.x1 - b.x0) / 3, 1.5), rT, lit([0, 0.7, 0.7]), [0, 0.7, 0.7]); m.tri([b.x0, yt, b.z0], [b.x0, yt + rh, zm], [b.x0, yt, b.z1], [0, 1, 0.5, 0, 1, 1], TL(wall), lit([-1, 0, 0]), [-1, 0, 0]); m.tri([b.x1, yt, b.z0], [b.x1, yt + rh, zm], [b.x1, yt, b.z1], [0, 1, 0.5, 0, 1, 1], TL(wall), lit([1, 0, 0]), [1, 0, 0]); }
    else { var xm = (b.x0 + b.x1) / 2; m.quad([b.x0 - 0.4, yt, b.z0 - 0.4], [xm, yt + rh, b.z0 - 0.4], [xm, yt + rh, b.z1 + 0.4], [b.x0 - 0.4, yt, b.z1 + 0.4], uvR(1.5, (b.z1 - b.z0) / 3), rT, lit([-0.7, 0.7, 0]), [-0.7, 0.7, 0]); m.quad([b.x1 + 0.4, yt, b.z0 - 0.4], [xm, yt + rh, b.z0 - 0.4], [xm, yt + rh, b.z1 + 0.4], [b.x1 + 0.4, yt, b.z1 + 0.4], uvR(1.5, (b.z1 - b.z0) / 3), rT, lit([0.7, 0.7, 0]), [0.7, 0.7, 0]); m.tri([b.x0, yt, b.z0], [xm, yt + rh, b.z0], [b.x1, yt, b.z0], [0, 1, 0.5, 0, 1, 1], TL(wall), lit([0, 0, -1]), [0, 0, -1]); m.tri([b.x0, yt, b.z1], [xm, yt + rh, b.z1], [b.x1, yt, b.z1], [0, 1, 0.5, 0, 1, 1], TL(wall), lit([0, 0, 1]), [0, 0, 1]); }
    boxC(m, b.x1 - 1.6, yt + 0.5, b.z0 + 1, b.x1 - 1, yt + 3.2, b.z0 + 1.6, '#6a3a30');
    var F = frontFace(b), dm = [(F.L[0] + F.R[0]) / 2 + F.n[0] * 0.05, (F.L[1] + F.R[1]) / 2 + F.n[2] * 0.05]; standQ(m, dm[0], dm[1], F.a, 1.1, b.y0, b.y0 + 2.2, TL('door'), 1);
    if (b.shop && b.shop.indexOf('home') === 0) { var sx = dm[0] + F.n[0] * 2.6, sz = dm[1] + F.n[2] * 2.6; boxC(m, sx - 0.05, b.y0, sz - 0.05, sx + 0.05, b.y0 + 1.6, sz + 0.05, '#5a3a20'); standQ(m, sx + F.n[0] * 0.08, sz + F.n[2] * 0.08, F.a, 1.3, b.y0 + 1.0, b.y0 + 2.1, TL('sign_home'), 1.2, 0.2); }
    if (hash2(b.i, 3, 3) < 0.6) [[b.x0 - 1.5, b.z0 - 1.5, b.x1 + 1.5, b.z0 - 1.2], [b.x0 - 1.5, b.z1 + 1.2, b.x1 + 1.5, b.z1 + 1.5]].forEach(function (q, qi) { if ((qi === 0 && b.front === 0) || (qi === 1 && b.front === 2)) return; var gy = groundY((q[0] + q[2]) / 2, (q[1] + q[3]) / 2); boxT(m, q[0], gy, q[1], q[2], gy + 1.0, q[3], { wall: 'hedge', top: 'hedge', u: 2, v: 1 }); });
    windowsAtNight(night, b, 1, wall); return;
  }
  // the ground floor (a shop front band) and the floors above
  var shopTex = sty.shop, gh = shopTex ? Math.min(4, h) : 0;
  if (gh) boxT(m, b.x0, y0, b.z0, b.x1, b.y0 + gh, b.z1, { wall: shopTex, noTop: 1, v: gh + 1 });
  var tall = b.style === 'downtown' && h > 34;
  var hs = 0, ins = 0; if (tall) { hs = h * 0.72; boxT(m, b.x0, b.y0 + gh, b.z0, b.x1, b.y0 + hs, b.z1, { wall: wall, top: 'roof' }); ins = Math.min(2.5, (b.x1 - b.x0) * 0.2); boxT(m, b.x0 + ins, b.y0 + hs, b.z0 + ins, b.x1 - ins, yt, b.z1 - ins, { wall: 'w_glass', top: 'roof' }); tub(m, [(b.x0 + b.x1) / 2, yt, (b.z0 + b.z1) / 2], [(b.x0 + b.x1) / 2, yt + 9, (b.z0 + b.z1) / 2], 0.25, 0.05, '#3a3a3e', 5); boxC(glow, (b.x0 + b.x1) / 2 - 0.25, yt + 9, (b.z0 + b.z1) / 2 - 0.25, (b.x0 + b.x1) / 2 + 0.25, yt + 9.5, (b.z0 + b.z1) / 2 + 0.25, '#ff2630', 0); }
  else boxT(m, b.x0, b.y0 + gh, b.z0, b.x1, yt, b.z1, { wall: wall, top: sty.roof });
  // a parapet and roof clutter
  if (!tall && b.style !== 'shed' && b.style !== 'industrial') { var SHI = [0, 2, 3, 1]; [[b.x0, b.z0, b.x1, b.z0 + 0.3], [b.x0, b.z1 - 0.3, b.x1, b.z1], [b.x0, b.z0, b.x0 + 0.3, b.z1], [b.x1 - 0.3, b.z0, b.x1, b.z1]].forEach(function (q, qi) { if (b.sh && b.sh[SHI[qi]]) return; boxC(m, q[0], yt, q[1], q[2], yt + 0.7, q[3], '#4a4446'); }); // update 158: no parapet on a wall shared with the next building (it fought with its wall)
    if (r < 0.5) boxC(m, b.x0 + 1, yt, b.z0 + 1, b.x0 + 2.4, yt + 1.2, b.z0 + 2, '#7a7a7a'); if (r > 0.7 && b.x1 - b.x0 > 8) { tub(m, [b.x1 - 3, yt, b.z1 - 3], [b.x1 - 3, yt + 2.8, b.z1 - 3], 1.1, 1.1, '#5a4030', 8, { cap: 1 }); } }
  if ((b.style === 'industrial' || b.style === 'shed') && r < 0.4) tub(m, [b.x1 - 2, yt, b.z0 + 2], [b.x1 - 2, yt + 8, b.z0 + 2], 0.6, 0.5, '#4a4446', 6);
  var F = frontFace(b), fw = Math.hypot(F.R[0] - F.L[0], F.R[1] - F.L[1]), mx = (F.L[0] + F.R[0]) / 2, mz = (F.L[1] + F.R[1]) / 2;
  // red light neon and billboards on the roofs downtown
  if (b.style === 'redlight') { var nt = NEONS[Math.floor(hash2(b.i, 5, 5) * NEONS.length)], ny0 = b.y0 + 5; /* update 166: over a shop front the neon sits above the front so its name shows (he liked HOT LOADS but it hid Bonjo's) */
    if (b.shop && FACOF[b.shop] && KIT.SPR[FACOF[b.shop]]) { var s0 = KIT.SPR[FACOF[b.shop]], wd0 = Math.min(fw - 0.4, b.shop === 'club' ? 9 : 7.2); ny0 = Math.max(ny0, b.y0 + wd0 * s0[3] / s0[2] + 0.4); }
    if (ny0 + 3 < yt + 2.5) { boxC(m, mx + F.n[0] * 0.1 - 0.06, ny0 - 0.1, mz + F.n[2] * 0.1 - 0.06, mx + F.n[0] * 0.1 + 0.06, ny0 + 3.1, mz + F.n[2] * 0.1 + 0.06, '#1a1a1e'); standQ(glow, mx + F.n[0] * 0.3, mz + F.n[2] * 0.3, F.a, Math.min(4, fw - 1), ny0, ny0 + 3, TL(nt), 2.0, 1.2); } }
  if (b.style === 'downtown' && !tall && r < 0.25) { var bb = BILLS[Math.floor(hash2(b.i, 6, 6) * BILLS.length)]; boxC(m, mx - 0.1, yt, mz - 0.1, mx + 0.1, yt + 3, mz + 0.1, '#2a2a2e'); standQ(m, mx + F.n[0] * 0.2, mz + F.n[2] * 0.2, F.a, 8, yt + 2, yt + 6, TL(bb), 1.2, 0.3); boxR(m, mx + F.n[0] * 0.08, mz + F.n[2] * 0.08, F.a, 4.15, 0.1, yt + 1.9, yt + 6.1, '#2a2a2e'); /* update 166: a back to the board so it never reads backwards from behind */ }
  if (!b.shop) genericFronts(m, glow, night, b, F, fw, gh);
  if (!tall) neonDress(m, glow, b, F, fw, yt, r);
  // shops: their front, or a painted name board
  if (b.shop && FACOF[b.shop] && KIT.SPR[FACOF[b.shop]]) { var s = KIT.SPR[FACOF[b.shop]], wd = Math.min(fw - 0.4, b.shop === 'club' ? 9 : 7.2), ht = wd * s[3] / s[2]; b.frontTop = b.y0 + ht; frontQuad(fr, s, mx + F.n[0] * 0.06, mz + F.n[2] * 0.06, F.a, wd, b.y0, b.y0 + ht); }
  else if (b.shop && SIGNOF[b.shop]) { standQ(glow, mx + F.n[0] * 0.08, mz + F.n[2] * 0.08, F.a, Math.min(6, fw - 0.6), b.y0 + 2.8, b.y0 + 5.2, TL(SIGNOF[b.shop]), 1.3, 0.25); standQ(m, mx + F.n[0] * 0.05, mz + F.n[2] * 0.05, F.a, 1.6, b.y0, b.y0 + 2.5, TL('door'), 1); }
  if (b.shop) lamps.push({ x: mx + F.n[0] * 2, y: b.y0 + 3, z: mz + F.n[2] * 2, shop: 1 });
  windowsAtNight(night, b, gh ? 1 : 0, wall, tall ? hs : 0, tall ? ins : 0);
}
function awning(m, F, y, fw) { var w = Math.min(fw - 1, 6), c = Math.cos(F.a), s = Math.sin(F.a), mx = (F.L[0] + F.R[0]) / 2, mz = (F.L[1] + F.R[1]) / 2, dx = c * w / 2, dz = -s * w / 2, ox = F.n[0] * 1.6, oz = F.n[2] * 1.6, n = [F.n[0] * 0.5, 0.86, F.n[2] * 0.5];
  m.quad([mx - dx, y + 0.8, mz - dz], [mx + dx, y + 0.8, mz + dz], [mx + dx + ox, y, mz + dz + oz], [mx - dx + ox, y, mz - dz + oz], uvR(w / 2, 1), TL('stripes'), [0.6, 0.3, 0.3], n); }
function frontQuad(m, s, cx, cz, a, w, y0, y1) { var W2 = KIT.sheet.width, H2 = KIT.sheet.height, T = [(s[0] + 0.5) / W2, (s[1] + 0.5) / H2, (s[2] - 1) / W2, (s[3] - 1) / H2], c = Math.cos(a), sn = Math.sin(a), dx = c * w / 2, dz = -sn * w / 2, n = [sn, 0, c];
  m.quad([cx - dx, y0, cz - dz], [cx + dx, y0, cz + dz], [cx + dx, y1, cz + dz], [cx - dx, y1, cz - dz], [0, 1, 1, 1, 1, 0, 0, 0], T, [0.5, 0.5, 0.5], n, 0.15); }
/* update 158 (his screenshots: the lit windows did not sit on the windows, they looked skewed): at night each wall gets a
   see-through copy laid over it with the same texture mapping as the wall, painted with that wall texture's own windows
   lit (n_<wall>: a 4 x 4 block of tiles, two patterns), so a lit window is always exactly a window. */
var WINR = { w_down: [[3, 4, 12, 20], [17, 4, 12, 20]], w_down2: [[4, 6, 10, 18], [18, 6, 10, 18]], w_glass: [[1, 2, 7, 26], [9, 2, 7, 26], [17, 2, 7, 26], [25, 2, 7, 26]], w_brick: [[6, 7, 8, 14], [18, 7, 8, 14]],
  w_redbrick: [[5, 6, 9, 16], [18, 6, 9, 16]], w_cafe: [[5, 6, 9, 15], [18, 6, 9, 15]], w_house: [[9, 8, 14, 13]], w_house2: [[9, 8, 14, 13]], w_home0: [[9, 8, 14, 13]], w_home1: [[9, 8, 14, 13]], w_home2: [[9, 8, 14, 13]], w_home3: [[9, 8, 14, 13]], w_home4: [[9, 8, 14, 13]], w_lab: [[2, 8, 28, 10]] };
(function () { Object.keys(WINR).forEach(function (w) { [0, 1].forEach(function (v) { var fn = function (g) { g.clearRect(0, 0, 64, 64); var warm = w === 'w_redbrick' ? ['#ff8aa8', '#ff5a7a', '#ffc0d0'] : w === 'w_lab' ? ['#a8d8ff', '#e0f0ff', '#80c0ff'] : ['#ffd890', '#ffe8b0', '#ffb860', '#f0d0a0'];
      for (var cy = 0; cy < 4; cy++) for (var cx = 0; cx < 4; cx++) WINR[w].forEach(function (r, ri) { var h = hash2(cx * 7 + ri * 3 + v * 41, cy * 5 + v * 13, w.length); if (h > (w === 'w_glass' ? 0.3 : 0.4)) return; var x = cx * 16 + (r[0] + 1) / 2, y = cy * 16 + (r[1] + 1) / 2, ww = (r[2] - 2) / 2, hh = (r[3] - 2) / 2;
        g.fillStyle = warm[Math.floor(hash2(cx, cy + ri, 9 + v) * warm.length)]; g.fillRect(x, y, ww, hh); if (h < 0.12) { g.fillStyle = 'rgba(40,20,20,0.55)'; g.fillRect(x + ww * 0.55, y + hh * 0.35, ww * 0.3, hh * 0.65); g.fillRect(x + ww * 0.6, y + hh * 0.2, ww * 0.2, hh * 0.18); } else if (h < 0.25) { g.fillStyle = 'rgba(120,40,30,0.45)'; g.fillRect(x, y, ww * 0.28, hh); g.fillRect(x + ww * 0.72, y, ww * 0.28, hh); } }); }; fn.big = 1; HIPAINT['n_' + w + v] = fn; }); }); })();
function nightWall(night, b, wall, y0, y1, x0, z0, x1, z1, sv) { if (!WINR[wall]) return; var T = TL('n_' + wall + (b.i % 2)), su = 16, sv4 = (sv || 3.5) * 4, H0 = y1 - y0, o = 0.05, FF = [2, 0, 1, 3];
  [[[x0, z1 + o], [x1, z1 + o], [0, 0, 1]], [[x1, z0 - o], [x0, z0 - o], [0, 0, -1]], [[x1 + o, z1], [x1 + o, z0], [1, 0, 0]], [[x0 - o, z0], [x0 - o, z1], [-1, 0, 0]]].forEach(function (f, fi) { var L = Math.hypot(f[1][0] - f[0][0], f[1][1] - f[0][1]), ya = y0;
    if (b.frontTop && FF[fi] === b.front) ya = Math.max(y0, b.frontTop + 0.3); if (ya >= y1 - 0.5) return; var va = (y1 - ya) / sv4; // the shop front sprite covers the bottom of its face: no windows over it
    night.quad([f[0][0], ya, f[0][1]], [f[1][0], ya, f[1][1]], [f[1][0], y1, f[1][1]], [f[0][0], y1, f[0][1]], uvR(L / su, va), T, [0.5, 0.5, 0.5], f[2]); }); }
function windowsAtNight(night, b, skip, wall, tallHs, ins) { var h = b.h, yt = b.y0 + h;
  if (b.style === 'house' || b.style === 'suburb') { nightWall(night, b, wall, b.y0 - 1, yt, b.x0, b.z0, b.x1, b.z1, h > 6 ? 3.5 : 5); return; }
  var gh = skip ? Math.min(4, h) : 0;
  if (tallHs) { nightWall(night, b, wall, b.y0 + gh, b.y0 + tallHs, b.x0, b.z0, b.x1, b.z1, 3.5); nightWall(night, b, 'w_glass', b.y0 + tallHs, yt, b.x0 + ins, b.z0 + ins, b.x1 - ins, b.z1 - ins, 3.5); return; }
  nightWall(night, b, wall, b.y0 + gh, yt, b.x0, b.z0, b.x1, b.z1, 3.5); }
/* ---------- streaming ---------- */
function chunkKey(ci, cj) { return ci + ',' + cj; }
function updateChunks(cx, cz, budget) {
  var R = VIEWR + 40, ci0 = Math.floor((cx - R) / CS), ci1 = Math.floor((cx + R) / CS), cj0 = Math.floor((cz - R) / CS), cj1 = Math.floor((cz + R) / CS), want = [];
  for (var cj = Math.max(0, cj0); cj <= Math.min(CZN - 1, cj1); cj++) for (var ci = Math.max(0, ci0); ci <= Math.min(CXN - 1, ci1); ci++) { var k = chunkKey(ci, cj), d = Math.hypot((ci + 0.5) * CS - cx, (cj + 0.5) * CS - cz); if (d < R && !CHUNKS[k]) want.push([d, ci, cj, k]); }
  want.sort(function (a, b) { return a[0] - b[0]; });
  var t0 = performance.now();
  for (var w = 0; w < want.length; w++) { CHUNKS[want[w][3]] = buildChunk(want[w][1], want[w][2]); if (performance.now() - t0 > (budget || 8)) break; }
  for (var k2 in CHUNKS) { var C = CHUNKS[k2]; if (Math.hypot(C.x - cx, C.z - cz) > R + 60) { ['m', 'nat', 'veg', 'wat', 'night', 'fr', 'glow', 'furn'].forEach(function (f) { if (C[f]) C[f].free(); }); delete CHUNKS[k2]; } }
  return want.length;
}
function solidsAround(x, z, r) { // the collisions of chunks that have not been drawn yet (a car far from you never needs them)
  for (var cj = Math.floor((z - r) / CS); cj <= Math.floor((z + r) / CS); cj++) for (var ci = Math.floor((x - r) / CS); ci <= Math.floor((x + r) / CS); ci++) if (ci >= 0 && cj >= 0 && ci < CXN && cj < CZN && !CHUNKS[chunkKey(ci, cj)]) CHUNKS[chunkKey(ci, cj)] = buildChunk(ci, cj);
}
