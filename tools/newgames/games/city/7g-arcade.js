/* ---------- update 157 (his asks): Potbelly's arcades look like arcades. The cabinets stand along the side walls, spaced
   out and facing into the room; each is dressed for its own game: its logo lit up in the marquee, the body and side art
   in that game's colours, an attract screen, a stick and buttons, coin door and a glowing trim. Neon strips run round
   the walls, the carpet is the black cinema kind with neon shapes, posters of the games hang between the cabinets,
   Potbelly stands at a prize counter with plushies on the shelf behind him, and a change machine sits by the door.
   The Clubhouse gets a cartridge shelf by the telly: every cartridge you own stands on it with its game's logo on the
   label. Logos come from the app's own logo pictures (assets/<id>-logo.webp), painted into the texture sheet as they
   load (`LOGO`, `logoTile`). ---------- */
var GAMEART = { // logo file id, body colour, accent
  meatnado: ['meat', '#5a120c', '#ff7a3a'], spermhog: ['hog', '#14205a', '#ffe36a'], survivors: ['surv', '#0a3442', '#4adfff'], willy: ['wn', '#4a1608', '#ffb030'], spuzz: ['sw', '#2e2416', '#7aff6a'],
  grinding: ['gr', '#2a0a10', '#ff2630'], overdrive: ['ao', '#2a0a3a', '#ff3aa0'], void: ['jv', '#0a1a4a', '#4adfff'], kart: ['ck', '#4a0a0a', '#ffe36a'], skeet: ['sk', '#3a0a0a', '#ffb030'],
  psycho: ['pn', '#0a1a0a', '#7aff6a'], adv: ['sa', '#0a2a5a', '#ffe36a'], dark: ['dk', '#1a1418', '#c8a040'], legend: ['lc', '#0a3a1a', '#ffe36a'], cumstein: ['c3', '#2e2e30', '#ff2630'],
  faprooms: ['fr', '#4a4418', '#ffe8a0'], keeper: ['gk', '#2a1a0a', '#ff7a20'], spunky: ['sb', '#3a0a4a', '#4adfff'], octo: ['ob', '#2a0a4a', '#ff3aa0'], cq: ['cq', '#12040a', '#c4121c'], ll: ['ll', '#12040a', '#ffe36a']
};
var LOGO = {};
(function () { Object.keys(GAMEART).forEach(function (g) { var im = new Image(); im.onload = function () { im.ok = 1; logoRefresh(g); }; im.src = '../assets/' + GAMEART[g][0] + '-logo.webp'; LOGO[g] = im; });
  // the logo tile: the game's logo on its colour, or its name until the picture has loaded (painted big: 128 px)
  Object.keys(GAMEART).forEach(function (g) { var f = function (c) { logoPaint(c, g); }; f.big = 1; HIPAINT['logo_' + g] = f;
    HIPAINT['scr_' + g] = function (c) { var A = GAMEART[g]; c.fillStyle = '#05070c'; c.fillRect(0, 0, 64, 64); var gr = c.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, A[1]); gr.addColorStop(1, '#05070c'); c.fillStyle = gr; c.fillRect(2, 2, 60, 46);
      for (var i = 0; i < 14; i++) { c.fillStyle = i % 3 ? A[2] : '#f1e7d0'; c.fillRect(6 + (i * 37) % 50, 8 + (i * 23) % 34, 3 + i % 3, 3); } c.fillStyle = A[2]; c.fillRect(8, 40, 48, 2);
      c.fillStyle = '#f1e7d0'; c.font = 'bold 7px "Archivo Narrow", sans-serif'; c.textAlign = 'center'; c.fillText(Math.floor(Date.now() / 1) % 2 ? 'INSERT COIN' : 'INSERT COIN', 32, 57); };
    HIPAINT['side_' + g] = function (c) { var A = GAMEART[g]; c.fillStyle = A[1]; c.fillRect(0, 0, 64, 64); c.fillStyle = A[2]; c.beginPath(); c.moveTo(0, 40); c.lineTo(64, 8); c.lineTo(64, 24); c.lineTo(0, 56); c.fill(); c.fillStyle = '#12040a'; c.fillRect(0, 0, 64, 3); c.fillRect(0, 61, 64, 3);
      c.fillStyle = 'rgba(255,255,255,0.12)'; for (var i = 0; i < 6; i++) c.fillRect(6 + i * 10, 46 - i * 5, 4, 4); };
    HIPAINT['cart_' + g] = function (c) { var A = GAMEART[g]; c.fillStyle = '#2a2a2e'; c.fillRect(0, 0, 64, 64); c.fillStyle = A[1]; c.fillRect(6, 6, 52, 40); c.fillStyle = A[2]; c.fillRect(6, 40, 52, 6); c.fillStyle = '#1a1a1e'; for (var i = 0; i < 8; i++) c.fillRect(8 + i * 6, 54, 3, 8); };
  });
  HIPAINT.arcwall = function (c) { c.fillStyle = '#140818'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#1e0c24'; for (var y = 0; y < 64; y += 8) c.fillRect(0, y, 64, 4); c.fillStyle = '#c4121c'; c.fillRect(0, 40, 64, 2); c.fillStyle = '#ff3aa0'; c.fillRect(0, 44, 64, 1); c.fillStyle = '#0a040c'; c.fillRect(0, 46, 64, 18); };
  HIPAINT.arcarpet = function (c) { c.fillStyle = '#0a070e'; c.fillRect(0, 0, 64, 64); var cols = ['#7a1a5a', '#1a5a7a', '#7a6a1a', '#2a6a2a', '#6a0a10']; for (var i = 0; i < 22; i++) { c.fillStyle = cols[i % 5]; var x = (i * 29 + (i >> 2) * 7) % 62, y = (i * 17 + (i >> 1) * 11) % 62; if (i % 3 === 0) { c.beginPath(); c.arc(x + 1, y + 1, 1.2, 0, 6.3); c.fill(); } else if (i % 3 === 1) { c.fillRect(x, y + 1, 3, 1); c.fillRect(x + 1, y, 1, 3); } else { c.beginPath(); c.moveTo(x, y + 2.5); c.lineTo(x + 1.5, y); c.lineTo(x + 3, y + 2.5); c.fill(); } } };
  HIPAINT.change = function (c) { c.fillStyle = '#c8c8c0'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#12040a'; c.fillRect(6, 6, 52, 14); c.fillStyle = '#ffe36a'; c.font = 'bold 9px "Archivo Narrow", sans-serif'; c.textAlign = 'center'; c.fillText('CHANGE', 32, 16); c.fillStyle = '#2a2a2e'; c.fillRect(20, 28, 24, 6); c.fillRect(24, 44, 16, 10); };
})();
function logoPaint(c, g) { var A = GAMEART[g], im = LOGO[g]; c.fillStyle = A[1]; c.fillRect(0, 0, 64, 64); c.fillStyle = A[2]; c.fillRect(0, 0, 64, 2); c.fillRect(0, 62, 64, 2);
  if (im && im.ok) { var s = Math.min(60 / im.width, 56 / im.height), w = im.width * s, h = im.height * s; c.drawImage(im, 32 - w / 2, 32 - h / 2, w, h); }
  else { c.fillStyle = '#f1e7d0'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '11px "Pirata One", serif'; var L = SPRAYGAMES[g][0].split(' '); L.forEach(function (l, k) { c.fillText(l, 32, 32 + (k - (L.length - 1) / 2) * 11); }); } }
function logoRefresh(g) { // a logo that loaded after the texture sheet was made: paint it into its slot and send the sheet again
  if (!ATL || !ATL.canvas) return; var uv = ATL.tile('logo_' + g); if (!uv) return; var SZ = ATL.canvas.width, x = Math.round(uv[0] * SZ) - 1, y = Math.round(uv[1] * SZ) - 1, B = Math.round(uv[2] * SZ) + 2, c = ATL.canvas.getContext('2d');
  c.save(); c.clearRect(x, y, B, B); c.beginPath(); c.rect(x, y, B, B); c.clip(); c.translate(x, y); c.scale(B / 64, B / 64); logoPaint(c, g); c.restore();
  clearTimeout(logoRefresh.t); logoRefresh.t = setTimeout(function () { try { ATT = R3.texture(ATL.canvas, true); } catch (e) {} }, 300); }
var _buildAtlasL = buildAtlas;
buildAtlas = function () { var had = !!ATL; _buildAtlasL(); if (!had && ATL) Object.keys(LOGO).forEach(function (g) { if (LOGO[g].ok) logoRefresh(g); }); };
/* where the cabinets stand: down both side walls, facing in */
function cabSpots(id, RM) { var cabs = ARCADES[id].games, w = RM.w, d = RM.d, L = [], nL = Math.ceil(cabs.length / 2);
  cabs.forEach(function (g, i) { var left = i < nL, k = left ? i : i - nL, n = left ? nL : cabs.length - nL, z = 3.2 + k * ((d - 6.8) / Math.max(1, n - 1)); if (n === 1) z = d / 2;
    L.push({ g: g, x: left ? 0.75 : w - 0.75, z: z, a: left ? Math.PI / 2 : -Math.PI / 2 }); }); return L; }
function cabinet(m, gl, c) { var g = c.g, A = GAMEART[g], a = c.a, cs = Math.cos(a), sn = Math.sin(a);
  function P(u, v) { return [c.x + sn * v + cs * u, c.z + Math.cos(a) * v - sn * u]; } // u across, v forward (towards the player)
  function box(u0, v0, u1, v1, y0, y1, col, T) { var p = P((u0 + u1) / 2, (v0 + v1) / 2); boxR(m, p[0], p[1], a, (u1 - u0) / 2, (v1 - v0) / 2, y0, y1, col, T); }
  box(-0.42, -0.35, 0.42, 0.25, 0, 0.95, A[1]); box(-0.42, -0.35, 0.42, -0.05, 0.95, 2.05, A[1]); box(-0.45, -0.38, 0.45, 0.28, 2.05, 2.12, '#0a0a0c');
  [-1, 1].forEach(function (s) { var p = P(s * 0.43, -0.05); standQ(m, p[0], p[1], a + s * Math.PI / 2, 0.62, 0.05, 2.0, TL('side_' + g), 1.2, 0.2); });
  var mq = P(0, -0.04); boxR(m, mq[0], mq[1], a, 0.42, 0.06, 1.78, 2.05, '#0a0a0c'); standQ(gl, mq[0] + sn * 0.07, mq[1] + Math.cos(a) * 0.07, a, 0.8, 1.79, 2.04, TL('logo_' + g), 1.5, 0.9);
  var sc = P(0, -0.02); standQ(gl, sc[0] + sn * 0.04, sc[1] + Math.cos(a) * 0.04, a, 0.66, 1.12, 1.66, TL('scr_' + g), 1.4, 0.8); box(-0.4, -0.05, 0.4, 0.02, 1.08, 1.12, '#0a0a0c'); box(-0.4, -0.05, 0.4, 0.02, 1.66, 1.72, '#0a0a0c');
  box(-0.42, -0.05, 0.42, 0.32, 0.95, 1.02, '#1a1a1e'); var st = P(-0.18, 0.15); tub(m, [st[0], 1.02, st[1]], [st[0], 1.14, st[1]], 0.012, 0.012, '#c8c8c0', 4); ell(gl, st[0], 1.16, st[1], 0.035, 0.035, 0.035, '#ff2630', 6, 4);
  [0.04, 0.14, 0.24].forEach(function (u, k) { var b = P(u, 0.12 + (k % 2) * 0.05); ell(gl, b[0], 1.03, b[1], 0.03, 0.012, 0.03, [A[2], '#f1e7d0', '#ff3aa0'][k], 6, 3); });
  var cd = P(0, 0.26); standQ(m, cd[0], cd[1], a, 0.3, 0.3, 0.6, TL('black'), 1, 0); ell(gl, cd[0] + sn * 0.01 - cs * 0.06, 0.48, cd[1] + Math.cos(a) * 0.01 + sn * 0.06, 0.015, 0.03, 0.006, '#ffe36a', 4, 2); ell(gl, cd[0] + sn * 0.01 + cs * 0.06, 0.48, cd[1] + Math.cos(a) * 0.01 - sn * 0.06, 0.015, 0.03, 0.006, '#ffe36a', 4, 2);
  [-1, 1].forEach(function (s) { box(s * 0.43 - 0.012, -0.35, s * 0.43 + 0.012, 0.25, 0.94, 0.96, A[2]); }); // the trim
}
var _roomMeshA = roomMesh;
roomMesh = function (id) { var RM = _roomMeshA(id), R0 = ROOMS[id]; if (!R0 || (!R0.arcade && id !== 'club')) return RM;
  var m = new R3.Mesh(), gl = new R3.Mesh(), w = RM.w, d = RM.d, cx = w / 2;
  if (R0.arcade) {
    cabSpots(id, RM).forEach(function (c) { cabinet(m, gl, c); RM.boxes.push([c.x - 0.45, c.z - 0.45, c.x + 0.45, c.z + 0.45]); });
    // posters between them, high on the side walls
    var gs = ARCADES[id].games; gs.forEach(function (g, i) { var left = i % 2 === 0, z = 4.3 + (i >> 1) * 2.4; if (z > d - 3) return; standQ(m, left ? 0.03 : w - 0.03, z, left ? Math.PI / 2 : -Math.PI / 2, 1.0, 2.5, 3.5, TL('logo_' + g), 1.3, 0.5); });
    // neon strips round the walls, near the top and above the skirting
    var NC = ['#ff3aa0', '#4adfff', '#ffe36a', '#c4121c']; [3.6, 0.35].forEach(function (y, k) { var col = NC[(k + id.length) % 4]; boxC(gl, 0.02, y, 0.2, 0.08, y + 0.06, d - 0.2, col); boxC(gl, w - 0.08, y, 0.2, w - 0.02, y + 0.06, d - 0.2, col); boxC(gl, 0.2, y, d - 0.08, w - 0.2, y + 0.06, d - 0.02, NC[(k + 1) % 4]); });
    // the prize counter, Potbelly behind it, plushies on the shelf
    boxT(m, cx - 3, 0, d - 3, cx + 3, 1.1, d - 2.2, { wall: 'black', top: 'plank', u: 1.5, v: 1.1 }); boxC(gl, cx - 3, 1.0, d - 2.22, cx + 3, 1.05, d - 2.18, '#ff3aa0'); RM.boxes.push([cx - 3, d - 3, cx + 3, d - 2.2]);
    boxC(m, cx - 3.2, 1.5, d - 0.5, cx + 3.2, 1.58, d - 0.05, '#3a2418'); boxC(m, cx - 3.2, 2.3, d - 0.5, cx + 3.2, 2.38, d - 0.05, '#3a2418');
    for (var q = 0; q < 10; q++) { var px = cx - 2.8 + q * 0.62, py = q % 2 ? 1.58 : 2.38, col = ['#12040a', '#f1e7d0', '#ff9ab4', '#c4121c', '#ffe36a'][q % 5]; ell(m, px, py + 0.2, d - 0.28, 0.2, 0.22, 0.17, col, 8, 5); ell(m, px, py + 0.48, d - 0.28, 0.14, 0.14, 0.13, col, 8, 5); if (q % 5 === 0) { ell(gl, px - 0.05, py + 0.5, d - 0.15, 0.025, 0.03, 0.01, '#ff2630', 4, 3); ell(gl, px + 0.05, py + 0.5, d - 0.15, 0.025, 0.03, 0.01, '#ff2630', 4, 3); } }
    // the change machine by the door
    boxC(m, w - 2.4, 0, 0.1, w - 1.6, 1.7, 0.6, '#9a9a96'); standQ(m, w - 2.0, 0.61, 0, 0.7, 0.3, 1.6, TL('change'), 1.3, 0.3); RM.boxes.push([w - 2.4, 0.1, w - 1.6, 0.6]);
    // lights in the ceiling
    for (var lx = 3; lx < w; lx += 5) for (var lz = 3; lz < d; lz += 4) ell(gl, lx, 3.96, lz, 0.25, 0.03, 0.25, '#fff2d0', 6, 2);
  }
  if (id === 'club') { // the cartridge shelf, on the wall beside the telly: three shelves, eight cartridges a shelf, labels facing out
    var sx = 0.06, z0 = 8.6, SL = 3.0; [0.9, 1.55, 2.2, 2.85].forEach(function (y) { boxC(m, sx, y, z0, sx + 0.36, y + 0.05, z0 + SL, '#3a2418'); }); boxC(m, sx, 0.9, z0 - 0.05, sx + 0.36, 2.9, z0, '#2a1810'); boxC(m, sx, 0.9, z0 + SL, sx + 0.36, 2.9, z0 + SL + 0.05, '#2a1810');
    var own = Object.keys(SPRAYGAMES).filter(function (g) { return SV.carts && SV.carts[g]; }); own.forEach(function (g, i) { var row = Math.floor(i / 8), k = i % 8, z = z0 + 0.08 + k * 0.36, y = [0.95, 1.6, 2.25][row]; if (row > 2) return;
      boxC(m, sx + 0.04, y, z, sx + 0.3, y + 0.5, z + 0.32, '#2a2a2e'); boxC(m, sx + 0.04, y + 0.5, z + 0.02, sx + 0.3, y + 0.54, z + 0.3, '#1a1a1e'); standQ(gl, sx + 0.31, z + 0.16, Math.PI / 2, 0.28, y + 0.06, y + 0.46, TL('logo_' + g), 1.3, 0.4); });
    RM.club.shelf = { x: 0.9, z: z0 + SL / 2 }; RM.boxes.push([0, z0, 0.42, z0 + SL]); }
  RM.extra2 = m.n ? m.upload() : null; RM.glow2 = gl.n ? gl.upload() : null; return RM; };
var _drawInteriorA = drawInterior;
drawInterior = function (look) { var I = G.interior; if (I && ROOMS[I.key] && ROOMS[I.key].arcade) { // the arcade: dim, with the neon and the screens doing the lighting
    var RM = I.RM; R3.scene({ fog: [0, 0, 0], fogR: [40, 90], amb: [0.32, 0.26, 0.38], lights: [{ x: RM.w / 2, y: 3.6, z: RM.d / 2, r: 12, c: [1, 0.85, 0.75], k: 0.8 }, { x: 1, y: 2.2, z: RM.d / 2, r: 8, c: [1, 0.25, 0.7], k: 1.0 }, { x: RM.w - 1, y: 2.2, z: RM.d / 2, r: 8, c: [0.3, 0.8, 1], k: 1.0 }, { x: RM.w / 2, y: 2.5, z: RM.d - 2, r: 6, c: [1, 0.9, 0.4], k: 0.8 }], torch: { p: [0, -99, 0], d: [0, -1, 0], c: [0, 0, 0] }, t: G.t, hue: G.fxHue || 0, warp: G.fxWarp || 0 });
    R3.draw(RM.mesh, ATT); if (RM.extra) R3.draw(RM.extra, ATT); } else _drawInteriorA(look);
  if (I && I.RM.extra2) R3.draw(I.RM.extra2, ATT); if (I && I.RM.glow2) R3.draw(I.RM.glow2, ATT, { lit: false }); };
function arcadeUses(id, I) { cabSpots(id, I.RM).forEach(function (c) { var g = c.g; G.indoorUses.push({ x: c.x + Math.sin(c.a) * 1.0, z: c.z + Math.cos(c.a) * 1.0, r: 0.8, label: 'PLAY ' + SPRAYGAMES[g][0].toUpperCase() + ' ($5)', fn: function () { if (SV.money < 5) { toast('A go is $5.'); return; } money(-5); sprayOpen(g, 'cabinet'); } }); });
  if (G.keeper) say(G.keeper, pick(['Cabinets are free, kid. Play all you like.', 'Cartridges for the SprayStation, right here.', 'Five drops a go. Bargain.'])); }
// the Clubhouse shelf changes with what you own: build its room again each time you go in
var _enterShopA = enterShop;
enterShop = function (id, homeId, special) { if (id === 'club' && typeof IMESH !== 'undefined') delete IMESH.club; return _enterShopA.apply(this, arguments); };
