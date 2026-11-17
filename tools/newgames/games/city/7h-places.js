/* ---------- update 157 (his ask: the places you visit like the castle need to be enterable): you can walk into the
   keep of Cumhead's Castle (the great hall: pillars, red carpet, chandeliers, a feast table, the fireplace and the
   throne on its dais; the mayor can sit on it), Blumhead's Castle (the same hall turned black and purple, goo on the
   floor, his goons inside and King Blumhead's empty throne), Greebo's Grotto (his cave kitchen: ovens, pies cooling,
   Sir Johnathan's bed and scratching post, Greebo there with the cat) and the cemetery chapel (pews, altar, candles,
   stained glass). Each room is built with the room builder (taller rooms: ROOMS[...].h) and dressed here. ---------- */
ROOMS.keep_cum = { wall: 'stone', floor: 'stone', keeper: null, props: [], w: 24, d: 34, h: 9, place: 'keep' };
ROOMS.keep_blum = { wall: 'darkstone', floor: 'darkstone', keeper: null, props: [], w: 24, d: 34, h: 9, place: 'keep', dark2: 1 };
ROOMS.grotto_in = { wall: 'rockg', floor: 'dirt', keeper: null, props: [], w: 20, d: 18, h: 6, place: 'grotto' };
ROOMS.chapel_in = { wall: 'stone', floor: 'stone', keeper: null, props: [], w: 12, d: 22, h: 8, place: 'chapel' };
function pillar(m, x, z, h, r, tex) { tub(m, [x, 0, z], [x, h, z], r, r, '#8a8480', 10, { T: TL(tex) }); boxC(m, x - r - 0.15, 0, z - r - 0.15, x + r + 0.15, 0.4, z + r + 0.15, '#6a645e'); boxC(m, x - r - 0.15, h - 0.4, z - r - 0.15, x + r + 0.15, h, z + r + 0.15, '#6a645e'); }
function chandelier(m, gl, x, z, y) { tub(m, [x, y, z], [x, y + 3, z], 0.03, 0.03, '#2a2a2e', 4); tub(m, [x, y, z], [x, y + 0.12, z], 1.3, 1.3, '#3a3030', 12, { cap: 1, cap0: 1 }); for (var k = 0; k < 8; k++) { var a = k / 8 * 6.283, cx = x + Math.cos(a) * 1.2, cz = z + Math.sin(a) * 1.2; tub(m, [cx, y + 0.12, cz], [cx, y + 0.42, cz], 0.05, 0.05, '#f1e7d0', 5); ell(gl, cx, y + 0.52, cz, 0.06, 0.12, 0.06, '#ffb030', 4, 3); } }
var _roomMeshP = roomMesh;
roomMesh = function (id) { var RM = _roomMeshP(id), R0 = ROOMS[id]; if (!R0 || !R0.place) return RM; var m = new R3.Mesh(), gl = new R3.Mesh(), w = RM.w, d = RM.d, cx = w / 2, h = R0.h, dark = R0.dark2, L = [];
  if (R0.place === 'keep') { var tex = dark ? 'darkstone' : 'stone', run = dark ? '#3a0a4a' : '#8a0c14';
    m.quad([cx - 1.6, 0.02, 1], [cx - 1.6, 0.02, d - 6], [cx + 1.6, 0.02, d - 6], [cx + 1.6, 0.02, 1], uvR(1, 8), TL('velvet'), [0.5, 0.5, 0.5], [0, 1, 0]); // the carpet
    for (var z = 5; z < d - 6; z += 5) { pillar(m, 4, z, h, 0.6, tex); pillar(m, w - 4, z, h, 0.6, tex); RM.boxes.push([3.3, z - 0.7, 4.7, z + 0.7], [w - 4.7, z - 0.7, w - 3.3, z + 0.7]); standQ(m, 0.04, z + 2.5, Math.PI / 2, 2, 3, 7.5, TL('velvet'), 1.1, 0.2); standQ(m, w - 0.04, z + 2.5, -Math.PI / 2, 2, 3, 7.5, TL('velvet'), 1.1, 0.2); }
    // the dais and the throne
    boxC(m, cx - 4, 0, d - 6, cx + 4, 0.5, d - 0.2, '#6a645e'); boxC(m, cx - 3, 0.5, d - 4.5, cx + 3, 1.0, d - 0.2, '#5a544e'); boxC(m, cx - 1.2, 1.0, d - 2.4, cx + 1.2, 1.6, d - 1.2, dark ? '#2a0a3a' : '#7a0c14');
    boxC(m, cx - 1.3, 1.0, d - 1.2, cx + 1.3, 5.2, d - 0.8, dark ? '#1a0a1a' : '#c8a040'); boxC(m, cx - 1.0, 1.6, d - 1.25, cx + 1.0, 4.6, d - 1.15, run); [-1, 1].forEach(function (s) { boxC(m, cx + s * 1.3 - 0.2, 1.0, d - 2.4, cx + s * 1.3 + 0.2, 2.2, d - 1.2, dark ? '#1a0a1a' : '#c8a040'); ell(gl, cx + s * 1.3, 5.4, d - 1, 0.25, 0.25, 0.25, dark ? '#c040ff' : '#ffe36a', 6, 4); });
    // the feast table down one side, a fireplace on the other
    boxC(m, 6.5, 0.8, 8, 8.5, 0.9, 20, '#5a3a20'); [[6.6, 8.1], [8.4, 8.1], [6.6, 19.9], [8.4, 19.9]].forEach(function (q) { boxC(m, q[0] - 0.08, 0, q[1] - 0.08, q[0] + 0.08, 0.8, q[1] + 0.08, '#4a2a18'); }); RM.boxes.push([6.5, 8, 8.5, 20]);
    for (var t = 0; t < 6; t++) { var tz = 9 + t * 2; ell(m, 7.5, 1.0, tz, 0.3, 0.08, 0.3, '#c8c8c0', 8, 3); ell(m, 7.5, 1.08, tz, 0.18, 0.12, 0.18, ['#c4121c', '#f1e7d0', '#d8a050'][t % 3], 6, 4); tub(m, [7.0, 0.9, tz + 1], [7.0, 1.25, tz + 1], 0.04, 0.04, '#f1e7d0', 5); ell(gl, 7.0, 1.32, tz + 1, 0.04, 0.08, 0.04, '#ffb030', 4, 3); }
    boxC(m, w - 1.2, 0, 13, w - 0.05, 4.5, 18, tex === 'stone' ? '#6a645e' : '#2a2228'); boxC(m, w - 1.3, 0, 14, w - 0.6, 2.2, 17, '#0a0606'); ell(gl, w - 0.9, 0.4, 15.5, 0.5, 0.45, 1.0, dark ? '#c040ff' : '#ff7a20', 8, 4); ell(gl, w - 0.9, 0.8, 15.5, 0.3, 0.4, 0.6, '#ffe36a', 6, 4); L.push({ x: w - 2, y: 1.5, z: 15.5, r: 10, c: dark ? [0.7, 0.2, 1] : [1, 0.55, 0.2], k: 1.3 });
    for (var cz = 7; cz < d - 6; cz += 8) chandelier(m, gl, cx, cz, h - 3.4); for (var lz = 7; lz < d - 6; lz += 8) L.push({ x: cx, y: h - 3.5, z: lz, r: 12, c: dark ? [0.7, 0.35, 1] : [1, 0.75, 0.45], k: 1.0 });
    [[3, 2.5], [w - 3, 2.5]].forEach(function (q) { tub(m, [q[0], 0, q[1]], [q[0], 1.8, q[1]], 0.25, 0.3, '#9a9aa0', 8, { cap: 1 }); ell(m, q[0], 2.05, q[1], 0.28, 0.32, 0.28, '#9a9aa0', 8, 5); RM.boxes.push([q[0] - 0.4, q[1] - 0.4, q[0] + 0.4, q[1] + 0.4]); }); // suits of armour
    if (dark) [[cx - 6, 10], [cx + 5, 20], [cx - 3, 24]].forEach(function (q) { m.quad([q[0] - 1.6, 0.03, q[1] - 1.2], [q[0] - 1.6, 0.03, q[1] + 1.2], [q[0] + 1.6, 0.03, q[1] + 1.2], [q[0] + 1.6, 0.03, q[1] - 1.2], uvR(1, 1), TL('goo'), [0.5, 0.5, 0.5], [0, 1, 0]); });
    RM.throne = { x: cx, z: d - 3.2 }; }
  else if (R0.place === 'grotto') {
    for (var k = 0; k < 12; k++) { var a = k / 12 * 6.283; ell(m, cx + Math.cos(a) * 9.5, h - 0.6, d / 2 + Math.sin(a) * 8.5, 1.4, 1.8, 1.4, '#4a5a32', 7, 4); } // the cave's lumpy roof edge
    for (var o2 = 0; o2 < 3; o2++) { var ox = 3 + o2 * 3.2; boxC(m, ox - 1.2, 0, d - 1.6, ox + 1.2, 2.2, d - 0.1, '#6a3a24'); tub(m, [ox, 2.2, d - 0.85], [ox, 2.2, d - 0.85], 0, 0, '#6a3a24', 4); standQ(gl, ox, d - 1.62, Math.PI, 1.2, 0.5, 1.4, TL('black'), 0.6, 0.6); ell(gl, ox, 0.9, d - 1.55, 0.5, 0.3, 0.05, '#ff7a20', 6, 3); RM.boxes.push([ox - 1.2, d - 1.6, ox + 1.2, d]); L.push({ x: ox, y: 1, z: d - 2.5, r: 6, c: [1, 0.5, 0.2], k: 1.1 }); }
    [[cx + 2, 8], [cx + 2, 12]].forEach(function (q) { boxC(m, q[0] - 1.5, 0.85, q[1] - 0.8, q[0] + 1.5, 0.95, q[1] + 0.8, '#7a5a34'); [[-1.4, -0.7], [1.4, -0.7], [-1.4, 0.7], [1.4, 0.7]].forEach(function (l) { boxC(m, q[0] + l[0] - 0.06, 0, q[1] + l[1] - 0.06, q[0] + l[0] + 0.06, 0.85, q[1] + l[1] + 0.06, '#5a3a20'); }); RM.boxes.push([q[0] - 1.5, q[1] - 0.8, q[0] + 1.5, q[1] + 0.8]);
      for (var pi2 = 0; pi2 < 4; pi2++) { var px = q[0] - 1.1 + pi2 * 0.73; tub(m, [px, 0.95, q[1]], [px, 1.05, q[1]], 0.28, 0.26, '#d8a050', 10, { cap: 1 }); ell(m, px, 1.08, q[1], 0.22, 0.1, 0.22, '#fff6dc', 8, 3); } });
    tub(m, [3, 0, 5], [3, 0.25, 5], 1.0, 1.0, '#c4121c', 12, { cap: 1 }); ell(m, 3, 0.3, 5, 0.85, 0.12, 0.85, '#ff7ab0', 10, 3); // Sir Johnathan's bed
    tub(m, [w - 2.5, 0, 4], [w - 2.5, 3.5, 4], 0.25, 0.25, '#c8a878', 8, { T: TL('bark') }); [1.2, 2.4].forEach(function (yy) { tub(m, [w - 2.5, yy, 4], [w - 2.5, yy + 0.15, 4], 0.8, 0.8, '#c4121c', 10, { cap: 1, cap0: 1 }); }); RM.boxes.push([w - 3.3, 3.2, w - 1.7, 4.8]);
    for (var bb = 0; bb < 4; bb++) { tub(m, [1.2, 0, 9 + bb * 1.3], [1.2, 1.1, 9 + bb * 1.3], 0.5, 0.5, '#6a4a2a', 10, { cap: 1, T: TL('plank') }); } RM.boxes.push([0.6, 8.4, 1.8, 13.8]);
    L.push({ x: cx, y: 3.5, z: d / 2, r: 14, c: [1, 0.8, 0.55], k: 0.9 }); RM.greebo = { x: cx + 2, z: 10.5 }; }
  else if (R0.place === 'chapel') {
    for (var r = 0; r < 6; r++) { var pz = 4 + r * 2.2; [-1, 1].forEach(function (s) { var x0 = s < 0 ? 1 : cx + 0.9, x1 = s < 0 ? cx - 0.9 : w - 1; boxC(m, x0, 0.45, pz, x1, 0.55, pz + 0.5, '#4a2a18'); boxC(m, x0, 0.55, pz + 0.45, x1, 1.1, pz + 0.55, '#4a2a18'); boxC(m, x0, 0, pz, x0 + 0.1, 0.45, pz + 0.5, '#3a2010'); boxC(m, x1 - 0.1, 0, pz, x1, 0.45, pz + 0.5, '#3a2010'); RM.boxes.push([x0, pz, x1, pz + 0.55]); }); }
    boxC(m, cx - 2, 0, d - 3, cx + 2, 0.4, d - 0.2, '#5a544e'); boxC(m, cx - 1.4, 0.4, d - 2.2, cx + 1.4, 1.4, d - 1.4, '#e8e0d0'); RM.boxes.push([cx - 1.4, d - 2.2, cx + 1.4, d - 1.4]);
    tub(m, [cx, 1.4, d - 1.8], [cx, 2.6, d - 1.8], 0.04, 0.04, '#c8a040', 4); boxC(m, cx - 0.3, 2.2, d - 1.84, cx + 0.3, 2.28, d - 1.76, '#c8a040');
    for (var c2 = -1; c2 <= 1; c2 += 2) for (var cn = 0; cn < 4; cn++) { var ccx = cx + c2 * (1.8 + cn * 0.35); tub(m, [ccx, 0.4, d - 1.2], [ccx, 0.9 + cn * 0.2, d - 1.2], 0.05, 0.05, '#f1e7d0', 5); ell(gl, ccx, 1.0 + cn * 0.2, d - 1.2, 0.04, 0.08, 0.04, '#ffb030', 4, 3); }
    var GLASS = ['#c4121c', '#4adfff', '#ffe36a', '#7aff6a', '#c48aff']; for (var gz = 4; gz < d - 3; gz += 4) [-1, 1].forEach(function (s) { var wx = s < 0 ? 0.03 : w - 0.03; for (var q3 = 0; q3 < 4; q3++) { var col = GLASS[(q3 + gz) % 5]; m.quad; standQ(gl, wx, gz + (q3 % 2) * 0.5 - 0.25, s < 0 ? Math.PI / 2 : -Math.PI / 2, 0.5, 3 + Math.floor(q3 / 2) * 1.2, 4.2 + Math.floor(q3 / 2) * 1.2, TL('white'), 1, 0); boxC(gl, wx - 0.02 * s, 3 + Math.floor(q3 / 2) * 1.2, gz + (q3 % 2) * 0.5 - 0.5, wx + 0.01 * s, 4.2 + Math.floor(q3 / 2) * 1.2, gz + (q3 % 2) * 0.5, col); } });
    L.push({ x: cx, y: 5, z: d / 2, r: 14, c: [0.8, 0.7, 1], k: 0.9 }, { x: cx, y: 1.5, z: d - 2, r: 6, c: [1, 0.7, 0.4], k: 1.1 }); }
  RM.extra3 = m.n ? m.upload() : null; RM.glow3 = gl.n ? gl.upload() : null; RM.lights = L; return RM; };
var _drawInteriorP = drawInterior;
drawInterior = function (look) { var I = G.interior, R0 = I && ROOMS[I.key]; if (R0 && R0.place) { var RM = I.RM;
    R3.scene({ fog: [0, 0, 0], fogR: [40, 90], amb: R0.dark2 ? [0.42, 0.34, 0.5] : [0.42, 0.38, 0.36], lights: RM.lights.slice(0, 7).concat([{ x: RM.w / 2, y: 2.5, z: 3, r: 10, c: [1, 0.85, 0.7], k: 0.6 }]), torch: { p: [0, -99, 0], d: [0, -1, 0], c: [0, 0, 0] }, t: G.t, hue: G.fxHue || 0, warp: G.fxWarp || 0 });
    R3.draw(RM.mesh, ATT); if (RM.extra3) R3.draw(RM.extra3, ATT); if (RM.glow3) R3.draw(RM.glow3, ATT, { lit: false }); return; } _drawInteriorP(look); };
var _enterShopPl = enterShop;
enterShop = function (id, homeId, special) { var r = _enterShopPl.apply(this, arguments); var I = G.interior, R0 = I && ROOMS[I.key]; if (!special || !R0 || !R0.place) return r;
  G.indoorUses = G.indoorUses.filter(function (u) { return u.label !== 'SEARCH'; }); var RM = I.RM;
  if (R0.place === 'keep' && !R0.dark2) G.indoorUses.push({ x: RM.throne.x, z: RM.throne.z - 1.8, r: 1.6, label: 'SIT ON THE THRONE', fn: function () { P.x = RM.throne.x; P.z = RM.throne.z + 0.2; P.y = 1.0; P.a = Math.PI; CAM.yaw = Math.PI; G.sitting = 3; bigText('MAYOR OF CUM CITY', 'Long may he drip', '#ffe36a', 3); sfx.play('coin'); } });
  if (R0.place === 'keep' && R0.dark2) { for (var k = 0; k < 5; k++) { var g = makePed({ x: 5 + (k % 3) * 7, z: 10 + Math.floor(k / 3) * 9, kind: 'goon', rig: RIGS.goon || RIGS.pusher, hostile: 1, hp: 70, wpn: 'pistol', keep: 1 }); g.inside = I.key; g.angry = 1; }
    G.indoorUses.push({ x: RM.throne.x, z: RM.throne.z - 1.8, r: 1.6, label: 'SEARCH THE THRONE', fn: function () { if (I.looted) { toast('Just goo.'); return; } I.looted = 1; money(1500); toast('Behind the throne: $1,500 and a note. "BACK SOON. DO NOT TOUCH MY THRONE. -K.B."'); } }); }
  if (R0.place === 'grotto') { var gr = makePed({ x: RM.greebo.x, z: RM.greebo.z + 2, a: Math.PI, who: 'greebo', rig: rigOf('greebo'), state: 'idle', keep: 1 }); gr.inside = I.key; gr.god = 1;
    G.indoorUses.push({ x: RM.greebo.x, z: RM.greebo.z + 3.4, r: 1.6, label: 'TALK TO GREEBO', fn: function () { var L = ['Fresh cream pies. Don\'t ask what\'s in them.', 'Sir Johnathan, off the counter! Sorry, Mister Mayor.', 'Welcome to the grotto. Wipe your feet. Not on the pies.']; var s = pick(L); say(gr, s); voiceLine('greebo', s); } });
    G.indoorUses.push({ x: 3, z: 6.4, r: 1.4, label: 'STROKE SIR JOHNATHAN', fn: function () { toast('Sir Johnathan purrs like a diesel engine.'); P.hp = Math.min(SV.maxHp, P.hp + 15); sfx.play('blip'); } }); }
  if (R0.place === 'chapel') G.indoorUses.push({ x: RM.w / 2, z: RM.d - 3.6, r: 1.6, label: 'PRAY', fn: function () { if (SV.wanted > 0) { SV.wanted = Math.max(0, SV.wanted - 1); toast('Sanctuary. One star forgiven.'); } else toast('You feel a little less sticky.'); P.hp = SV.maxHp; } });
  return r; };
var _worldSetupP = worldSetup;
worldSetup = function () { _worldSetupP();
  POIS.forEach(function (p) { if (p.k === 'castle' && p.door) G.uses.push({ x: p.door.x, z: p.door.z, r: 3, label: 'ENTER THE KEEP OF ' + p.name.toUpperCase(), icon: 'K', fn: function () { enterShop(null, null, p.dark ? 'keep_blum' : 'keep_cum'); G.interior.exitX = p.door.x; G.interior.exitZ = p.door.z + 2; G.interior.exitA = 0; } });
    if (p.k === 'grotto') G.uses.push({ x: p.x, z: p.z + 8.5, r: 3, label: 'ENTER GREEBO\'S GROTTO', icon: 'G', fn: function () { enterShop(null, null, 'grotto_in'); G.interior.exitX = p.x; G.interior.exitZ = p.z + 10; G.interior.exitA = 0; } });
    if (p.k === 'chapel') G.uses.push({ x: p.x, z: p.z + 6.5, r: 3, label: 'ENTER THE CHAPEL', icon: '+', fn: function () { enterShop(null, null, 'chapel_in'); G.interior.exitX = p.x; G.interior.exitZ = p.z + 8; G.interior.exitA = 0; } }); }); };
var _poseOfPlayerPl = poseOfPlayer;
poseOfPlayer = function () { var Q = _poseOfPlayerPl(); if (G.sitting > 0 && G.interior) { var s = KIT.stick(0); if (Math.hypot(s.x, s.y) > 0.5) { G.sitting = 0; P.y = 0; P.z -= 1.6; } else { poseSit(Q); Q.y = -0.45; } } return Q; };
