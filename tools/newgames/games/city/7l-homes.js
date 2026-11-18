/* ---------- update 162 (his ask: the houses need to be bigger, more decorated, cooler looking, with more to do, and you
   can sit on the sofa and light one up). Every home has its own big room: a living area (L-shaped sofa you can sit on
   and smoke on, a big telly flicking through channels, the SprayStation under it, a rug, a coffee table, a fireplace
   with a real fire, a neon sign), a kitchen (counters, cooker, fridge to raid, an island with stools), a bed to sleep
   and save, weights to lift (a little more health once a day), a dartboard (three darts, best score kept), a radio,
   plants, posters of the other games and lamps. The two biggest have a cream hot tub. Co-op: you see each other
   inside and share the sofa. ---------- */
var HOMEDEF = [
  { w: 16, d: 12, wall: 'wallpaper', floor: 'plank', sofa: '#5a0a14', acc: '#c4121c', rug: '#3a0a10' },
  { w: 16, d: 12, wall: 'w_brick', floor: 'carpet', sofa: '#2a2a30', acc: '#ffe36a', rug: '#1a1a20' },
  { w: 18, d: 14, wall: 'wood', floor: 'checker', sofa: '#3a1a4a', acc: '#c48aff', rug: '#2a1030' },
  { w: 18, d: 14, wall: 'velvet', floor: 'carpet', sofa: '#12040a', acc: '#ff2630', rug: '#2a0408' },
  { w: 22, d: 16, wall: 'wallpaper', floor: 'tilefloor', sofa: '#e8dcc0', acc: '#c8a040', rug: '#4a3a20', tub: 1 },
  { w: 22, d: 16, wall: 'concrete', floor: 'checker', sofa: '#12040a', acc: '#4adfff', rug: '#0a1a20', tub: 1, h: 5 }];
HIPAINT.neon_home = function (g) { g.fillStyle = '#000'; g.fillRect(0, 0, 64, 64); g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff2630'; g.shadowBlur = 6; g.fillStyle = '#ff6a70'; g.font = '15px "Pirata One", serif'; g.fillText('Home Sweet', 32, 22); g.fillText('Load', 32, 42); };
HIPAINT.dartboard = function (g) { var c = 32; [[30, '#12040a'], [27, '#f1e7d0'], [22, '#c4121c'], [17, '#f1e7d0'], [12, '#12040a'], [7, '#c4121c'], [3, '#ffe36a']].forEach(function (r, i) { g.fillStyle = r[1]; g.beginPath(); g.arc(c, c, r[0], 0, 6.3); g.fill(); });
  g.strokeStyle = '#3a3a3e'; g.lineWidth = 1; for (var k = 0; k < 10; k++) { var a = k / 10 * Math.PI; g.beginPath(); g.moveTo(c + Math.cos(a) * 27, c + Math.sin(a) * 27); g.lineTo(c - Math.cos(a) * 27, c - Math.sin(a) * 27); g.stroke(); } };
HOMEDEF.forEach(function (H, i) { ROOMS['home' + i] = { wall: H.wall, floor: H.floor, keeper: null, props: [], w: H.w, d: H.d, h: H.h || 4.4, save: 1, place: 'home', look: i }; });
function homeLookOf(id) { var k = +String(id).replace(/\D/g, ''); return isNaN(k) ? 0 : k % HOMEDEF.length; }
(function () {
  var rmPrev = roomMesh; roomMesh = function (id) { var RM = rmPrev(id), R0 = ROOMS[id]; if (!R0 || R0.place !== 'home') return RM;
    var H = HOMEDEF[R0.look], m = new R3.Mesh(), gl = new R3.Mesh(), w = RM.w, d = RM.d, h = R0.h, L = [], B = RM.boxes, seats = [], uses = [], c = d * 0.52;
    function rug(x0, z0, x1, z1, col) { m.quad([x0, 0.015, z0], [x0, 0.015, z1], [x1, 0.015, z1], [x1, 0.015, z0], uvR((x1 - x0) / 2, (z1 - z0) / 2), TL('velvet'), rgb01(col).map(function (q) { return q * 1.2; }), [0, 1, 0]); }
    function plant(x, z, s) { tub(m, [x, 0, z], [x, 0.55 * s, z], 0.28 * s, 0.22 * s, '#5a3a24', 8, { cap: 1 }); for (var k = 0; k < 6; k++) { var a = k * 1.05; ell(m, x + Math.cos(a) * 0.18 * s, 0.75 * s + (k % 2) * 0.2 * s, z + Math.sin(a) * 0.18 * s, 0.22 * s, 0.32 * s, 0.22 * s, k % 2 ? '#2a5a2a' : '#3a7a32', 6, 4); } B.push([x - 0.35, z - 0.35, x + 0.35, z + 0.35]); }
    function lamp(x, z) { tub(m, [x, 0, z], [x, 0.04, z], 0.25, 0.25, '#2a2a2e', 8, { cap: 1 }); tub(m, [x, 0, z], [x, 1.55, z], 0.03, 0.03, '#2a2a2e', 5); tub(gl, [x, 1.5, z], [x, 1.85, z], 0.32, 0.2, '#ffd890', 8); L.push({ x: x, y: 1.7, z: z, r: 6, c: [1, 0.8, 0.55], k: 0.9 }); }
    // skirting and a picture rail round the room, ceiling lights
    [[0.04, 0, 0.04, d, Math.PI / 2], [w - 0.04, 0, w - 0.04, d, -Math.PI / 2], [0, d - 0.04, w, d - 0.04, Math.PI]].forEach(function (q) { var cx2 = (q[0] + q[2]) / 2, cz2 = (q[1] + q[3]) / 2, len = Math.hypot(q[2] - q[0], q[3] - q[1]); standQ(m, cx2, cz2, q[4], len, 0, 0.18, TL('wood'), 0.8); standQ(m, cx2, cz2, q[4], len, h - 0.8, h - 0.72, TL('wood'), 0.9); });
    for (var lx = w * 0.25; lx < w; lx += w * 0.5) for (var lz = d * 0.3; lz < d; lz += d * 0.42) { tub(gl, [lx, h - 0.05, lz], [lx, h - 0.15, lz], 0.4, 0.4, '#fff0d0', 10, { cap: 1, cap0: 1 }); L.push({ x: lx, y: h - 0.4, z: lz, r: 9, c: [1, 0.86, 0.68], k: 0.8 }); }
    // the living area: telly on the left wall, the SprayStation under it, rug, coffee table, L-shaped sofa facing it
    boxC(m, 0.2, 0, c - 1.6, 0.9, 0.6, c + 1.6, '#2a1a10'); boxC(m, 0.15, 0.85, c - 1.45, 0.28, 2.45, c + 1.45, '#0a0606'); RM.tv = { x: 0.3, z: c, w: 2.7, y0: 0.95, y1: 2.35 };
    boxC(m, 0.35, 0.6, c - 0.35, 0.75, 0.72, c + 0.35, '#12040a'); boxC(gl, 0.74, 0.63, c - 0.2, 0.76, 0.66, c + 0.2, H.acc); B.push([0.2, c - 1.6, 0.9, c + 1.6]);
    uses.push({ x: 2.0, z: c + 2.2, r: 1.2, label: 'PLAY THE SPRAYSTATION', fn: function () { if (typeof sprayMenu === 'function') sprayMenu(); } });
    rug(1.4, c - 2.6, 6.2, c + 2.6, H.rug); boxC(m, 2.5, 0.38, c - 0.8, 3.5, 0.46, c + 0.8, '#3a2210'); [[2.6, c - 0.7], [3.4, c - 0.7], [2.6, c + 0.7], [3.4, c + 0.7]].forEach(function (q) { boxC(m, q[0] - 0.04, 0, q[1] - 0.04, q[0] + 0.04, 0.38, q[1] + 0.04, '#2a1a10'); }); B.push([2.5, c - 0.8, 3.5, c + 0.8]);
    ell(m, 3.0, 0.5, c - 0.3, 0.12, 0.05, 0.12, '#c8c8c0', 6, 3); tub(m, [3.1, 0.46, c + 0.3], [3.1, 0.62, c + 0.3], 0.05, 0.04, '#c4121c', 6, { cap: 1 });
    boxC(m, 4.4, 0, c - 1.9, 5.5, 0.45, c + 1.9, H.sofa); boxC(m, 5.15, 0.45, c - 1.9, 5.5, 1.1, c + 1.9, H.sofa); boxC(m, 4.4, 0.45, c - 1.9, 5.5, 0.75, c - 1.65, H.sofa); boxC(m, 4.4, 0.45, c + 1.65, 5.5, 0.75, c + 1.9, H.sofa);
    [-1, 0, 1].forEach(function (q) { boxC(m, 4.45, 0.45, c + q * 0.9 - 0.42, 5.12, 0.58, c + q * 0.9 + 0.42, H.sofa); }); ell(m, 5.05, 0.75, c - 1.2, 0.12, 0.25, 0.3, H.acc, 6, 4); ell(m, 5.05, 0.75, c + 1.2, 0.12, 0.25, 0.3, H.acc, 6, 4);
    boxC(m, 2.0, 0, c + 2.3, 5.5, 0.45, c + 3.3, H.sofa); boxC(m, 2.0, 0.45, c + 3.0, 5.5, 1.1, c + 3.3, H.sofa); B.push([4.4, c - 1.9, 5.5, c + 1.9], [2.0, c + 2.3, 5.5, c + 3.3]);
    seats.push({ id: 'sofa0', x: 4.82, z: c - 0.75, a: -Math.PI / 2, kind: 'sofa', y: 0.48 }, { id: 'sofa1', x: 4.82, z: c + 0.75, a: -Math.PI / 2, kind: 'sofa', y: 0.48 }, { id: 'sofa2', x: 3.0, z: c + 2.75, a: Math.PI, kind: 'sofa', y: 0.48 });
    lamp(5.9, c - 2.4); plant(0.6, 0.8, 1.2); plant(0.6, d - 0.8, 1.4);
    // the fireplace on the back wall with the neon over it; posters of the games on the walls
    boxC(m, 1.6, 0, d - 0.7, 4.6, 1.5, d, '#4a4440'); boxC(m, 1.4, 1.5, d - 0.85, 4.8, 1.65, d, '#2a2420'); boxC(m, 2.3, 0, d - 0.72, 3.9, 1.0, d - 0.1, '#0a0606'); RM.fire = { x: 3.1, z: d - 0.4 }; L.push({ x: 3.1, y: 0.8, z: d - 1.2, r: 7, c: [1, 0.55, 0.25], k: 1.0 }); B.push([1.6, d - 0.7, 4.6, d]);
    standQ(gl, 3.1, d - 0.03, Math.PI, 2.2, 2.0, 3.0, TL('neon_home'), 1.5); boxC(m, 1.8, 1.65, d - 0.4, 2.0, 1.95, d - 0.2, '#c8a040'); boxC(m, 4.2, 1.65, d - 0.4, 4.4, 1.85, d - 0.2, H.acc);
    [[0.03, 2.3, Math.PI / 2], [0.03, d - 2.4, Math.PI / 2]].forEach(function (q, i) { standQ(m, q[0], q[1], q[2], 1.6, 1.6, 2.9, TL(BILLS[(R0.look * 3 + i) % BILLS.length]), 1.3); });
    standQ(m, w * 0.5 + 2.6, d - 0.03, Math.PI, 1.6, 1.6, 2.9, TL(BILLS[(R0.look * 3 + 5) % BILLS.length]), 1.3);
    // the kitchen on the back right: counters, cooker, sink, fridge, an island with two stools
    var kx0 = w - 7.2, kz = d - 0.9; boxT(m, kx0, 0, kz, w - 1.4, 0.92, d, { wall: 'plank', top: 'steel' }); boxC(m, kx0, 0.92, kz, w - 1.4, 0.97, d, '#2a2a2e'); B.push([kx0, kz, w - 1.4, d]);
    boxC(m, kx0 + 2.2, 0.97, kz + 0.1, kx0 + 3.0, 0.99, d - 0.1, '#0a0a0a'); [[2.4, 0.3], [2.8, 0.3], [2.4, 0.65], [2.8, 0.65]].forEach(function (q) { tub(gl, [kx0 + q[0], 0.99, kz + q[1]], [kx0 + q[0], 1.0, kz + q[1]], 0.1, 0.1, '#c4121c', 8, { cap: 1 }); });
    boxC(m, kx0 + 4.3, 0.9, kz + 0.15, kx0 + 5.1, 0.98, d - 0.15, '#9a9aa0'); tub(m, [kx0 + 4.7, 0.97, d - 0.1], [kx0 + 4.7, 1.3, d - 0.25], 0.025, 0.025, '#c8ccd2', 5);
    boxC(m, kx0, 1.6, d - 0.45, w - 1.4, 2.4, d, '#3a2a1a'); boxC(m, w - 1.3, 0, d - 1.0, w - 0.15, 2.1, d, '#e8e4dc'); boxC(m, w - 1.32, 1.3, d - 1.02, w - 1.28, 1.6, d - 0.9, '#3a3a3e'); B.push([w - 1.3, d - 1.0, w - 0.15, d]);
    uses.push({ x: w - 0.75, z: d - 1.8, r: 1.1, label: 'RAID THE FRIDGE', fn: function () { var I = G.interior; if (I.fridge) { toast('Just a lemon and some mustard left.'); return; } I.fridge = 1; P.hp = Math.min(SV.maxHp, P.hp + 40); sfx.play('blip'); toast(pick(['Cold pizza. Joff would be proud.', 'A whole cream pie. Greebo\'s, by the look of it.', 'Leftover Willy Chilli. Dynamite. Your mouth is on fire.', 'Garlic nuggets from Ali\'s. Still good. Probably.'])); } });
    var iz = d - 3.4; boxT(m, w - 6.2, 0, iz - 0.5, w - 3.2, 0.95, iz + 0.5, { wall: 'wood', top: 'steel' }); B.push([w - 6.2, iz - 0.5, w - 3.2, iz + 0.5]);
    [w - 5.4, w - 4.0].forEach(function (sx, i) { var sz = iz - 1.1; tub(m, [sx, 0, sz], [sx, 0.72, sz], 0.04, 0.04, '#3a3a3e', 5); tub(m, [sx, 0.72, sz], [sx, 0.78, sz], 0.24, 0.24, H.acc, 10, { cap: 1, cap0: 1 }); seats.push({ id: 'stool' + i, x: sx, z: sz - 0.05, a: 0, kind: 'stool', y: 0.78 }); });
    // the bed by the right wall at the front, with a lamp and a wardrobe
    var bz = 1.4; boxC(m, w - 2.8, 0, bz, w - 0.2, 0.45, bz + 2.4, '#3a2a1a'); boxC(m, w - 2.75, 0.45, bz + 0.05, w - 0.25, 0.65, bz + 2.35, '#f1e7d0'); boxC(m, w - 2.75, 0.65, bz + 0.05, w - 0.9, 0.7, bz + 2.35, H.acc); ell(m, w - 0.55, 0.75, bz + 1.2, 0.25, 0.12, 0.7, '#f1e7d0', 6, 3); boxC(m, w - 0.25, 0, bz - 0.1, w - 0.05, 1.3, bz + 2.5, '#2a1a10'); B.push([w - 2.8, bz, w - 0.2, bz + 2.4]);
    boxC(m, w - 0.9, 0, bz + 2.6, w - 0.2, 0.55, bz + 3.2, '#3a2a1a'); lamp(w - 0.55, bz + 2.9); boxT(m, w - 1.0, 0, bz + 3.6, w - 0.1, 2.3, bz + 5.4, { wall: 'wood', top: 'wood' }); B.push([w - 1.0, bz + 3.6, w - 0.1, bz + 5.4]);
    uses.push({ x: w - 3.4, z: bz + 1.2, r: 1.3, label: 'SLEEP AND SAVE', fn: sleepSave });
    // the weights by the front wall, the dartboard on the back wall, the radio on a cabinet
    var wx = 2.3; boxC(m, wx - 0.3, 0, 1.3, wx + 0.3, 0.45, 2.7, '#2a2a2e'); tub(m, [wx - 0.9, 1.1, 2.6], [wx + 0.9, 1.1, 2.6], 0.025, 0.025, '#c8ccd2', 5); [-0.75, 0.75].forEach(function (s) { tub(m, [wx + s, 1.1, 2.6], [wx + s * 1.12, 1.1, 2.6], 0.22, 0.22, '#12040a', 10, { cap: 1, cap0: 1 }); }); B.push([wx - 0.35, 1.3, wx + 0.35, 2.7]);
    uses.push({ x: wx + 1.2, z: 2.0, r: 1.1, label: 'LIFT WEIGHTS', fn: function () { G.lift = { t: 0, reps: 0 }; P.x = wx + 0.9; P.z = 2.0; P.a = -Math.PI / 2; } });
    var dx = w * 0.5 + 0.6; standQ(m, dx, d - 0.04, Math.PI, 0.9, 1.35, 2.25, TL('dartboard'), 1.3); RM.darts = { x: dx, z: d };
    uses.push({ x: dx, z: d - 3.2, r: 1.1, label: 'THROW DARTS', fn: function () { G.darts = { n: 3, score: 0, t: 0, last: null, show: 0 }; P.x = dx; P.z = d - 3.2; P.a = 0; } });
    boxC(m, 0.2, 0, 2.2, 0.8, 0.9, 3.4, '#3a2210'); boxC(m, 0.3, 0.9, 2.4, 0.7, 1.05, 3.2, '#12040a'); tub(m, [0.5, 1.05, 2.8], [0.5, 1.07, 2.8], 0.25, 0.25, '#0a0a0a', 12, { cap: 1 }); B.push([0.2, 2.2, 0.8, 3.4]);
    uses.push({ x: 1.4, z: 2.8, r: 1.0, label: 'THE RADIO', fn: function () { if (RAD.on) { radioOff(); G.homeRadio = 0; toast('Radio off.'); } else { radioOn({ t: { cls: 'car' } }); G.homeRadio = 1; toast('Radio on. RB changes the station.'); } } });
    // the hot tub of cream in the big houses
    if (H.tub) { var tx = w - 5.0, tz = 6.6; tub(m, [tx, 0, tz], [tx, 0.75, tz], 1.7, 1.7, '#3a3a40', 16, { cap: 0 }); for (var rk = 0; rk < 16; rk++) { var ra = rk / 16 * 6.283, rb = (rk + 1) / 16 * 6.283; m.quad([tx + Math.cos(ra) * 1.6, 0.78, tz + Math.sin(ra) * 1.6], [tx + Math.cos(rb) * 1.6, 0.78, tz + Math.sin(rb) * 1.6], [tx + Math.cos(rb) * 1.9, 0.78, tz + Math.sin(rb) * 1.9], [tx + Math.cos(ra) * 1.9, 0.78, tz + Math.sin(ra) * 1.9], UV1, TL('white'), rgb01('#8a8a90').map(function (q) { return q * 0.6; }), [0, 1, 0]); } tub(m, [tx, 0.75, tz], [tx, 0.78, tz], 1.9, 1.9, '#6a6a70', 16, {}); tub(gl, [tx, 0.66, tz], [tx, 0.68, tz], 1.62, 1.62, '#e8dcc0', 16, { cap: 1, T: TL('cream') }); B.push([tx - 1.8, tz - 1.8, tx + 1.8, tz + 1.8]); RM.tub = { x: tx, z: tz };
      seats.push({ id: 'tub0', x: tx - 1.05, z: tz, a: Math.PI / 2, kind: 'tub', y: 0.45 }, { id: 'tub1', x: tx + 1.05, z: tz, a: -Math.PI / 2, kind: 'tub', y: 0.45 }); L.push({ x: tx, y: 1.2, z: tz, r: 5, c: [0.6, 0.9, 1], k: 0.6 }); plant(tx + 2.5, tz + 2.2, 1.5); }
    else { plant(w - 4, 5.8, 1.1); }
    plant(w * 0.5 - 1.6, 0.7, 1.0); plant(w * 0.5 + 1.6, 0.7, 1.0);
    RM.extra3 = m.upload(); RM.glow3 = gl.n ? gl.upload() : null; RM.lights = L; RM.seats = seats; RM.huses = uses; return RM; };
  // homes use their own room (by which house it is)
  var es = enterShop; enterShop = function (id, homeId, special) { if (homeId && !special) { var k = 'home' + homeLookOf(homeId); if (!IMESH[k]) IMESH[k] = roomMesh(k); IMESH.home = IMESH[k]; ROOMS.home = ROOMS[k]; }
    var r = es.apply(this, arguments); var I = G.interior; if (!I || !I.home) return r; var RM = I.RM; I.key = 'home' + homeLookOf(homeId);
    G.indoorUses = G.indoorUses.filter(function (u) { return u.label !== 'SLEEP AND SAVE'; }).concat(RM.huses);
    RM.seats.forEach(function (s) { G.indoorUses.push({ x: s.x + Math.sin(s.a) * 0.6, z: s.z + Math.cos(s.a) * 0.6, r: 0.9, label: s.kind === 'tub' ? 'GET IN THE HOT TUB' : s.kind === 'stool' ? 'SIT AT THE ISLAND' : 'SIT ON THE SOFA', fn: function () { sitDown(s); } }); });
    return r; };
  var ls = leaveShop; leaveShop = function () { if (G.seat) G.seat = null; G.lift = G.darts = null; if (G.homeRadio) { G.homeRadio = 0; radioOff(); } return ls.apply(this, arguments); };
  // live bits: the telly flicks through channels, the fire burns, the hot tub bubbles, the other player is there too
  var TVM = {}, FLAME = null;
  var di = drawInterior; drawInterior = function (look) { di(look); var I = G.interior; if (!I || !I.home) return; var RM = I.RM;
    if (RM.tv) { var ch = Math.floor(G.t / 6) % BILLS.length, key = I.key + ':' + ch; if (!TVM[key]) { var mm = new R3.Mesh(); standQ(mm, RM.tv.x, RM.tv.z, Math.PI / 2, RM.tv.w, RM.tv.y0, RM.tv.y1, TL(BILLS[ch]), 1.6); TVM[key] = mm.upload(); } R3.draw(TVM[key], ATT, { lit: false, tint: G.t % 6 < 0.15 ? [2.5, 2.5, 2.5] : [1, 1, 1] }); }
    if (!FLAME) { var fm = new R3.Mesh(); ell(fm, 0, 0.5, 0, 0.35, 0.6, 0.35, '#ff7a20', 8, 5); FLAME = [fm.upload()]; var f2 = new R3.Mesh(); ell(f2, 0, 0.5, 0, 0.25, 0.5, 0.25, '#ffe36a', 8, 5); FLAME.push(f2.upload()); }
    if (RM.fire) for (var k = 0; k < 4; k++) { var ph = G.t * (5 + k) + k * 1.7, s = 0.18 + 0.05 * Math.sin(ph), hh = 0.35 + 0.15 * Math.sin(ph * 1.3); R3.draw(FLAME[k % 2], ATT, { lit: false, m: MD(RM.fire.x - 0.45 + k * 0.3, 0.05, RM.fire.z, ph * 0.1, 0, 0, s + hh * 0.5) }); }
    if (RM.tub && Math.random() < 0.3) addFx({ k: 'puff', x: RM.tub.x + rnd(-1.2, 1.2), y: 0.75, z: RM.tub.z + rnd(-1.2, 1.2), vy: 0.4, vx: 0, vz: 0, life: 1.6, s0: 0.15, grow: 0.5, col: [0.95, 0.92, 0.85], a0: 0.25 });
    var R = G.coop && G.coop.other; if (R && R.tg && R.tg.in === (I.home || I.key) && !R.pv) { if (!drawMateSeated(R)) { var Q = pose0(); if (R.sp > 0.3) poseWalk(Q, R.ph, Math.min(1, R.sp / 5)); drawPerson(RIGS[isGuest() ? 'cumhead' : 'laboozie'], R.x, R.y, R.z, R.a, Q, {}); } } };
  // lifting weights and darts: what you do, and how it looks
  var sf = stepFoot; stepFoot = function (dt) {
    if (G.lift) { var Lf = G.lift; Lf.t += dt; P.vx = P.vz = 0; P.sp = 0; var rep = Math.floor(Lf.t / 1.2); if (rep > Lf.reps) { Lf.reps = rep; sfx.play('hit'); }
      if (Lf.t > 7.5 || KIT.pressed('b') || KIT.pressed('y')) { var day = G.day, gain = SV.gymDay !== day && Lf.reps >= 5; if (gain) { SV.gymDay = day; SV.maxHp = Math.min(200, (SV.maxHp || 100) + 2); } toast(Lf.reps + ' reps.' + (gain ? ' Max health +2 (' + SV.maxHp + '). Come back tomorrow.' : ' You feel the burn.')); G.lift = null; persist(); } return; }
    if (G.darts) { var Dr = G.darts; Dr.t += dt; P.vx = P.vz = 0; P.sp = 0; if (Dr.show > 0) { Dr.show -= dt; return; }
      if (KIT.pressed('b') || KIT.pressed('y')) { G.darts = null; return; }
      if (KIT.pressed('a') || KIT.pressed('x') || (KIT.ptr && KIT.ptr.tap)) { var ax = Math.sin(Dr.t * 2.3) * 0.9, ay = Math.sin(Dr.t * 3.1 + 1) * 0.9, r = Math.hypot(ax, ay), pts = r < 0.08 ? 50 : r < 0.17 ? 25 : r < 0.42 ? 20 - Math.floor(r * 20) : r < 0.55 ? 60 - Math.floor(r * 40) : r < 0.9 ? Math.max(1, 12 - Math.floor(r * 10)) : 0;
        Dr.score += pts; Dr.n--; Dr.last = { x: ax, y: ay, p: pts }; Dr.show = 0.7; sfx.play('hit');
        if (Dr.n <= 0) { var best = SV.dartsBest || 0; if (Dr.score > best) SV.dartsBest = Dr.score; toast('Darts: ' + Dr.score + (Dr.score > best ? '. New best!' : '. Best ' + best + '.')); G.darts = null; persist(); } }
      return; }
    return sf(dt); };
  var po = poseOfPlayer; poseOfPlayer = function () { var Q = po(); if (G.lift) { var c = (G.lift.t % 1.2) / 1.2, up = Math.sin(c * Math.PI); Q.y = -0.3; Q.sh[0] = [1.4 + up * 1.4, 0.3, 0]; Q.sh[1] = [1.4 + up * 1.4, 0.3, 0]; Q.el[0] = Q.el[1] = 1.4 - up * 1.2; Q.lean = -0.5; }
    else if (G.darts) { var th = G.darts.show > 0 ? Math.max(0, G.darts.show - 0.4) / 0.3 : 0; Q.sh[1] = [1.6 + th * 0.8, -0.2, 0]; Q.el[1] = 1.4 - th * 1.3; } return Q; };
  var dh = drawHud; drawHud = function () { dh(); var Dr = G.darts; if (!Dr || G.mode !== 'play') return; var ctx = KIT.ctx, W2 = KIT.W, H2 = KIT.H, R = Math.min(W2, H2) * 0.28, cx = W2 / 2, cy = H2 * 0.45;
    var rings = [[1, '#12040a'], [0.9, '#f1e7d0'], [0.73, '#c4121c'], [0.57, '#f1e7d0'], [0.4, '#12040a'], [0.17, '#c4121c'], [0.08, '#ffe36a']]; ctx.save(); ctx.globalAlpha = 0.92; rings.forEach(function (q) { ctx.fillStyle = q[1]; ctx.beginPath(); ctx.arc(cx, cy, R * q[0], 0, 6.3); ctx.fill(); }); ctx.globalAlpha = 1;
    var ax = Dr.show > 0 && Dr.last ? Dr.last.x : Math.sin(Dr.t * 2.3) * 0.9, ay = Dr.show > 0 && Dr.last ? Dr.last.y : Math.sin(Dr.t * 3.1 + 1) * 0.9, px = cx + ax * R, py = cy + ay * R;
    ctx.strokeStyle = Dr.show > 0 ? '#ffe36a' : '#4adfff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 6, 0, 6.3); ctx.moveTo(px - 10, py); ctx.lineTo(px + 10, py); ctx.moveTo(px, py - 10); ctx.lineTo(px, py + 10); ctx.stroke(); ctx.restore();
    tx('DARTS ' + (3 - Dr.n) + '/3   SCORE ' + Dr.score + (Dr.show > 0 && Dr.last ? '   +' + Dr.last.p : ''), cx - tw2('DARTS 0/3   SCORE 000   +00', 9) / 2, cy + R + 10, { size: 9, col: '#ffe36a' });
    tx('A THROW   B STOP', cx - tw2('A THROW   B STOP', 7) / 2, cy + R + 24, { size: 7, col: '#f1e7d0' }); };
})();
