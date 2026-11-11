/* ---------- update 132: the land made his (he said: he starts inside a bush and can't move, make it more Hunter Seriph).
   Black and blood red under the red moon: dead trees with red leaves, thorn bushes, graves, iron fences, lamps and candles
   that throw real light, bones, the gates of Cum City with the shop fronts on the first screen, TB loitering by them.
   Every time you arrive on a screen or in a room you are moved out of anything solid (`unstick`). ---------- */
BIOME.fields = { n: 'THE CRIMSON MOORS', g: '#1d0d11', g2: '#2a1218', t: '#7a0a14', tr: '#120406', path: '#3a2c2a', water: '#5a0a10', blood: 1, foes: ['slime', 'bat', 'rat', 'crawler'] };
BIOME.swamp = { n: 'THE CREAM MARSH', g: '#1e1612', g2: '#2a2018', t: '#5a4a2a', tr: '#140e08', path: '#3e3426', water: '#d8c898', cream: 1, foes: ['creamblob', 'slimeB', 'rat', 'cultrat'] };
BIOME.bones = { n: 'THE BONE FIELDS', g: '#2a2220', g2: '#362c28', t: '#4a3a30', tr: '#1a120e', path: '#5a4c40', water: '#1a0606', tar: 1, foes: ['skeleton', 'bonehound', 'mummy', 'bat'] };
BIOME.park = { n: "EJACULAND'S BACK LOT", g: '#1a0810', g2: '#26101a', t: '#c4121c', tr: '#12040a', path: '#3a1a26', water: '#c4121c', blood: 1, foes: ['clown', 'balloon', 'ghoul', 'imp'] };
BIOME.lair = { n: 'THE BLUM WASTES', g: '#160612', g2: '#20091a', t: '#5a1a6a', tr: '#0a0206', path: '#2e1028', water: '#5a1a6a', foes: ['blumling', 'blumeye', 'wraith', 'knight'] };
/* new tiles: 13 grave, 14 lamp post, 15 bones, 16 candles, 17 iron fence, 19 skull pile, 31 cross, 32 roses, 33 puddle, 34 city wall, 35 signpost */
[13, 14, 17, 19, 31, 34, 35].forEach(function (t) { SOLID[t] = 1; });
var SIGNS = { '2,4': 'NORTH: THE LAND. SOUTH: CUM CITY (CLOSED TILL THE CHALICES ARE BACK)', '2,3': 'THE CRIMSON MOORS. KEEP TO THE PATH. OR DON\'T.', '1,3': 'CREAM MARSH. DO NOT DRINK.', '4,3': 'THE BONE FIELDS. MIND THE HOUNDS.', '1,1': "EJACULAND THIS WAY. STEVE SAYS HI.", '3,1': 'TURN BACK. -- B.', '5,2': 'THE BONE PIT IS DOWN THE ROAD. NOBODY COMES BACK. (SOME DO.)' };
var _overScreen = overScreen;
overScreen = function (sx, sy) {
  var S = _overScreen(sx, sy), T = S.T, b = S.b, rnd = srand(sx * 71 + sy * 313 + 99), i, j;
  function get(i, j) { return i >= 0 && j >= 0 && i < COLS && j < ROWS ? T[j * COLS + i] : 1; } function set(i, j, v) { if (i >= 0 && j >= 0 && i < COLS && j < ROWS) T[j * COLS + i] = v; }
  function free(i, j) { return get(i, j) === 0 && get(i, j - 1) !== 4 && get(i, j + 1) !== 4 && get(i - 1, j) !== 4 && get(i + 1, j) !== 4; }
  var deco = { fields: [13, 13, 31, 32, 32, 16, 15, 14], swamp: [33, 33, 15, 16, 14, 31], bones: [15, 15, 19, 13, 31, 16], park: [14, 14, 32, 16, 13, 33], lair: [19, 16, 33, 15, 31] }[b];
  // graveyards: a row of graves fenced in
  if ((b === 'fields' || b === 'bones') && rnd() < 0.6) { var gx = 3 + Math.floor(rnd() * 10), gy = 2 + Math.floor(rnd() * 3), ok = true; for (j = gy - 1; j <= gy + 2; j++) for (i = gx - 1; i <= gx + 4; i++) if (get(i, j) !== 0) ok = false;
    if (ok) { for (i = gx - 1; i <= gx + 4; i++) { set(i, gy - 1, 17); } for (i = gx; i <= gx + 3; i++) set(i, gy, i % 2 ? 31 : 13); for (i = gx; i <= gx + 3; i++) if (rnd() < 0.6) set(i, gy + 1, 32); } }
  var n = 8 + Math.floor(rnd() * 8); for (var k = 0; k < n; k++) { i = 1 + Math.floor(rnd() * (COLS - 2)); j = 1 + Math.floor(rnd() * (ROWS - 2)); if (free(i, j)) set(i, j, deco[Math.floor(rnd() * deco.length)]); }
  // lamps along the path now and then
  for (j = 1; j < ROWS - 1; j++) for (i = 1; i < COLS - 1; i++) if (get(i, j) === 0 && (get(i + 1, j) === 4 || get(i, j + 1) === 4) && rnd() < 0.05 && b !== 'lair') set(i, j, 14);
  var sg = SIGNS[sx + ',' + sy]; S.sign = null; if (sg) { for (var q = 0; q < 40; q++) { i = 8 + Math.floor(rnd() * 5); j = 5 + Math.floor(rnd() * 3); if (get(i, j) === 0 && get(i, j + 1) !== 1) { set(i, j, 35); S.sign = { i: i, j: j, s: sg }; break; } } }
  // the first screen is the gates of Cum City: a city wall with the shop fronts along the bottom, TB hanging about
  if (sx === 2 && sy === 4) { for (i = 1; i < COLS - 1; i++) { set(i, ROWS - 2, 34); set(i, ROWS - 1, 34); } for (i = 8; i <= 12; i++) for (j = 5; j <= 7; j++) if (SOLID[get(i, j)] || get(i, j) === 3) set(i, j, 4); S.city = 1; S.tb = { x: 15.5 * TS, y: 6.5 * TS }; }
  if (sx === 1 && sy === 1) S.steve = { x: 15 * TS, y: 3.5 * TS };
  // the lights on this screen (lamps, candles) for the night overlay
  S.lights = []; for (q = 0; q < T.length; q++) { if (T[q] === 14) S.lights.push({ x: (q % COLS + 0.5) * TS, y: ((q / COLS | 0) + 0.1) * TS, r: 70, c: 'rgba(255,170,90,' }); else if (T[q] === 16) S.lights.push({ x: (q % COLS + 0.5) * TS, y: ((q / COLS | 0) + 0.5) * TS, r: 40, c: 'rgba(255,120,60,' }); }
  if (S.feat) S.lights.push({ x: (S.feat.i + 0.5) * TS, y: (S.feat.j + 0.8) * TS, r: 46, c: S.feat.k === 'dungeon' ? 'rgba(255,38,48,' : 'rgba(255,190,110,' });
  return S;
};
/* painting: the old tiles redrawn darker and the new ones */
var _paintTile = paintTile;
paintTile = function (t, x, y, B, D, i, j) {
  var g = KIT.ctx, v = (i * 7 + j * 13) % 5;
  if (t === 29) { R('#c8b880', x, y, TS, TS); R('#fff6dc', x + (KIT.t * 8 + i * 5) % TS, y + 6, 6, 1); R('#a89860', x + (KIT.t * 5 + j * 9) % TS, y + 15, 5, 1); return; }
  if (t >= 20 && t <= 29) { _paintTile(t, x, y, B, D, i, j); if (t === 20) { var h = (i * 31 + j * 17) % 23; if (h === 0) { R('#4a0608', x + 6, y + 9, 9, 5); R('#6a0a10', x + 8, y + 10, 5, 3); } else if (h === 5) { R('#e8dcc8', x + 7, y + 12, 6, 5); R('#12040a', x + 8, y + 13, 1, 1); R('#12040a', x + 11, y + 13, 1, 1); } else if (h === 11) { R('#3a3036', x + 4, y + 4, 16, 1); R('#3a3036', x + 4, y + 4, 1, 12); } } return; }
  function ground() { R(B.g, x, y, TS, TS); R(B.g2, x + 3 + v * 4, y + 5, 2, 4); R(B.g2, x + 15 - v, y + 15, 3, 2); if (v === 3) R('#3a0a10', x + 10, y + 9, 2, 2); }
  if (t === 3) { R(B.water, x, y, TS, TS); var hi = B.cream ? '#fff6dc' : B.tar ? '#3a2020' : '#a8141e'; R(hi, x + 3 + v * 3, y + 7, 7, 1); R(hi, x + 12, y + 16, 6, 1); if (B.cream && v === 1) { R('#fff6dc', x + 8, y + 10, 3, 3); } return; }
  if (t === 4) { R(B.path, x, y, TS, TS); var c = shadeHex(B.path, 0.7), c2 = shadeHex(B.path, 1.2); R(c, x, y + 7, TS, 1); R(c, x, y + 16, TS, 1); R(c, x + (j % 2 ? 6 : 14), y, 1, 7); R(c, x + (j % 2 ? 16 : 4), y + 8, 1, 8); R(c, x + (j % 2 ? 10 : 20), y + 17, 1, 7); R(c2, x + 2, y + 1, 4, 1); R(c2, x + 12, y + 9, 3, 1); return; }
  if (t === 1 || t === 5 || t === 0 || t === 10 || t >= 13) ground();
  if (t === 1) { // a dead tree: black twisted trunk, a crown of blood-red leaves
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + 12, y + 10, 11.5, 0, 6.3); g.fill(); g.fillStyle = shadeHex(B.t, 0.55); g.beginPath(); g.arc(x + 12, y + 10, 10.5, 0, 6.3); g.fill();
    g.fillStyle = B.t; g.beginPath(); g.arc(x + 10, y + 8, 7, 0, 6.3); g.fill(); g.fillStyle = shadeHex(B.t, 1.35); g.beginPath(); g.arc(x + 8, y + 6, 3, 0, 6.3); g.fill();
    R('#12040a', x + 10, y + 15, 4, 9); R('#2a1a18', x + 11, y + 16, 2, 8); R('#12040a', x + 6, y + 13, 5, 2); R('#12040a', x + 13, y + 12, 6, 2); R('#12040a', x + 4, y + 11, 2, 3); R('#12040a', x + 18, y + 10, 2, 3); return; }
  if (t === 5) { // a thorn bush with red berries
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + 12, y + 13, 10, 0, 6.3); g.fill(); g.fillStyle = '#1e0a0c'; g.beginPath(); g.arc(x + 12, y + 13, 9, 0, 6.3); g.fill(); g.fillStyle = '#2e1216'; g.beginPath(); g.arc(x + 10, y + 11, 5, 0, 6.3); g.fill();
    R('#0a0204', x + 4, y + 9, 3, 1); R('#0a0204', x + 17, y + 12, 3, 1); R('#0a0204', x + 11, y + 4, 1, 3); R('#0a0204', x + 13, y + 20, 1, 3); R('#ff2630', x + 8, y + 9, 2, 2); R('#ff2630', x + 15, y + 14, 2, 2); R('#c4121c', x + 11, y + 17, 2, 2); R('#ffb0b0', x + 8, y + 9, 1, 1); return; }
  if (t === 2) { _paintTile(t, x, y, B, D, i, j); R('#2a2a26', x + 6, y + 15, 6, 2); return; }
  if (t === 10 || t === 32) { R('#12040a', x + 5, y + 7, 4, 4); R('#c4121c', x + 6, y + 7, 3, 3); R('#ff2630', x + 6, y + 7, 1, 1); R('#1a3a1a', x + 7, y + 10, 1, 4); R('#12040a', x + 14, y + 13, 4, 4); R('#8a0a14', x + 15, y + 13, 3, 3); R('#1a3a1a', x + 16, y + 16, 1, 4); if (v > 2) { R('#c4121c', x + 9, y + 17, 3, 3); R('#ff2630', x + 9, y + 17, 1, 1); } return; }
  if (t === 13) { R('#12040a', x + 4, y + 3, 16, 19); R('#4a4246', x + 5, y + 4, 14, 17); g.fillStyle = '#4a4246'; g.beginPath(); g.arc(x + 12, y + 7, 7, Math.PI, 0); g.fill(); R('#6a6266', x + 6, y + 4, 3, 14); R('#2a2226', x + 8, y + 9, 8, 1); R('#2a2226', x + 8, y + 12, 8, 1); R('#2a2226', x + 8, y + 15, 5, 1); R('#3a2a1a', x + 3, y + 21, 18, 3); return; }
  if (t === 31) { R('#12040a', x + 9, y + 2, 7, 21); R('#12040a', x + 4, y + 6, 17, 6); R('#5a5258', x + 10, y + 3, 5, 19); R('#5a5258', x + 5, y + 7, 15, 4); R('#7a7278', x + 10, y + 3, 1, 19); R('#3a2a1a', x + 6, y + 21, 13, 3); return; }
  if (t === 14) { R('#12040a', x + 10, y + 4, 4, 20); R('#2a2228', x + 11, y + 5, 2, 18); R('#12040a', x + 6, y + 0, 12, 7); R('#ffd27a', x + 7, y + 1, 10, 5); R('#fff6dc', x + 9, y + 2, 4, 2); R('#12040a', x + 8, y + 22, 8, 2); return; }
  if (t === 15) { R('#e8dcc8', x + 5, y + 12, 10, 2); R('#e8dcc8', x + 4, y + 11, 2, 4); R('#e8dcc8', x + 14, y + 11, 2, 4); R('#c8bca8', x + 12, y + 17, 8, 2); R('#e8dcc8', x + 7, y + 5, 6, 5); R('#12040a', x + 8, y + 7, 1, 1); R('#12040a', x + 11, y + 7, 1, 1); return; }
  if (t === 16) { [[6, 14], [12, 11], [17, 15]].forEach(function (c) { R('#12040a', x + c[0] - 1, y + c[1] - 1, 4, 9); R('#f1e7d0', x + c[0], y + c[1], 2, 7); R('#ffb040', x + c[0], y + c[1] - 3, 2, 3); R('#fff6dc', x + c[0], y + c[1] - 2, 1, 1); }); R('#c4121c', x + 4, y + 20, 16, 2); return; }
  if (t === 17) { R('#12040a', x, y + 8, TS, 3); R('#12040a', x, y + 17, TS, 3); for (var f = 2; f < TS; f += 6) { R('#12040a', x + f, y + 2, 3, 21); R('#3a3438', x + f + 1, y + 4, 1, 18); R('#12040a', x + f, y, 3, 3); } return; }
  if (t === 19) { [[6, 14], [14, 14], [10, 8]].forEach(function (c) { R('#12040a', x + c[0] - 4, y + c[1] - 4, 9, 9); R('#e8dcc8', x + c[0] - 3, y + c[1] - 3, 7, 6); R('#12040a', x + c[0] - 2, y + c[1] - 1, 2, 2); R('#12040a', x + c[0] + 1, y + c[1] - 1, 2, 2); R('#c8bca8', x + c[0] - 2, y + c[1] + 3, 5, 2); }); return; }
  if (t === 33) { g.fillStyle = B.cream ? '#d8c898' : B.tar ? '#120606' : '#6a0a10'; g.beginPath(); g.ellipse(x + 12, y + 13, 9, 5, 0, 0, 6.3); g.fill(); R(B.cream ? '#fff6dc' : '#c4121c', x + 8, y + 11, 4, 1); return; }
  if (t === 34) { R('#1a0a0c', x, y, TS, TS); var row = (y / 8) | 0; for (var by = 0; by < 3; by++) { R('#12040a', x, y + by * 8, TS, 1); R('#12040a', x + ((by + j) % 2 ? 4 : 16), y + by * 8, 1, 8); R('#2a1014', x + 1, y + by * 8 + 1, TS - 2, 1); } if (j === ROWS - 2) { R('#c4121c', x, y, TS, 2); R('#3a0a10', x, y + 2, TS, 1); } return; }
  if (t === 35) { R('#12040a', x + 10, y + 8, 4, 16); R('#4a2a1a', x + 11, y + 9, 2, 14); R('#12040a', x + 2, y + 2, 20, 10); R('#6a3a1e', x + 3, y + 3, 18, 8); R('#8a5a2e', x + 3, y + 3, 18, 1); R('#2a1208', x + 6, y + 6, 12, 1); R('#2a1208', x + 6, y + 8, 8, 1); return; }
  if (t === 0) return;
  _paintTile(t, x, y, B, D, i, j);
};
/* move anyone out of whatever solid thing they arrived in: nearest open tile, searched outwards */
function blocked(o, r) { return solidAt(o.x - r, o.y - r * 0.5) || solidAt(o.x + r, o.y - r * 0.5) || solidAt(o.x - r, o.y + r * 0.6) || solidAt(o.x + r, o.y + r * 0.6) || [3, 23, 29].indexOf(SCR.T[Math.floor(o.y / TS) * COLS + Math.floor(o.x / TS)]) >= 0; }
function unstick(o) { if (!o || !SCR || !blocked(o, 7)) return; var bi = Math.floor(o.x / TS), bj = Math.floor(o.y / TS);
  for (var rad = 1; rad < 12; rad++) for (var dj = -rad; dj <= rad; dj++) for (var di = -rad; di <= rad; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== rad) continue; var i = bi + di, j = bj + dj; if (i < 1 || j < 1 || i >= COLS - 1 || j >= ROWS - 1) continue; var t = { x: (i + 0.5) * TS, y: (j + 0.5) * TS }; if (!blocked(t, 7)) { o.x = t.x; o.y = t.y; o.lastX = o.x; o.lastY = o.y; return; } } }
var _loadOver = loadOver;
loadOver = function (sx, sy) { var was = SCR && SCR.kind === 'over' ? SCR.b : null; _loadOver(sx, sy); FOE.forEach(unstick);
  if (BIOME[SCR.b].n && was !== SCR.b) G.banner = { t: 2.6, s: SCR.city ? 'THE GATES OF CUM CITY' : BIOME[SCR.b].n };
  setTimeout(function () { if (P && SCR) unstick(P); }, 0); };
var _enterRoom = enterRoom;
enterRoom = function (r, from) { _enterRoom(r, from); FOE.forEach(unstick); setTimeout(function () { if (P && SCR) unstick(P); }, 0);
  var rr = srand(777 + r.x * 13 + r.y * 7 + DG.di * 101); SCR.lights = []; [[2, 1], [COLS - 3, 1], [2, ROWS - 2], [COLS - 3, ROWS - 2]].forEach(function (c) { if (rr() < 0.8) SCR.lights.push({ x: (c[0] + 0.5) * TS, y: (c[1] + 0.3) * TS, r: 80, c: 'rgba(255,140,70,', torch: c[1] === 1 }); }); };
/* night: the land is lit by its lamps and candles, ash drifts, Cumhead carries a little glow */
var ASH = []; for (var q = 0; q < 40; q++) ASH.push({ x: Math.random() * 480, y: Math.random() * 240, s: 6 + Math.random() * 14, w: Math.random() * 6 });
var NIGHT = null;
function drawNight(ox) {
  if (!SCR || !P) return; var g = KIT.ctx, Wd = COLS * TS, Hd = ROWS * TS;
  if (!NIGHT) { NIGHT = document.createElement('canvas'); NIGHT.width = Wd; NIGHT.height = Hd; }
  var n = NIGHT.getContext('2d'); n.globalCompositeOperation = 'source-over'; n.clearRect(0, 0, Wd, Hd); n.fillStyle = SCR.kind === 'dg' ? 'rgba(6,0,4,0.62)' : 'rgba(10,0,8,0.5)'; n.fillRect(0, 0, Wd, Hd);
  n.globalCompositeOperation = 'destination-out'; function hole(x, y, r) { var gr = n.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); n.fillStyle = gr; n.beginPath(); n.arc(x, y, r, 0, 6.3); n.fill(); }
  hole(P.x, P.y, 96); (SCR.lights || []).forEach(function (L) { hole(L.x, L.y, L.r * (0.95 + Math.sin(G.t * 9 + L.x) * 0.04)); });
  g.drawImage(NIGHT, ox, OY);
  g.save(); g.globalCompositeOperation = 'lighter'; (SCR.lights || []).forEach(function (L) { var gr = g.createRadialGradient(ox + L.x, OY + L.y, 0, ox + L.x, OY + L.y, L.r * 0.7); gr.addColorStop(0, L.c + '0.22)'); gr.addColorStop(1, L.c + '0)'); g.fillStyle = gr; g.fillRect(ox + L.x - L.r, OY + L.y - L.r, L.r * 2, L.r * 2); }); g.restore();
  if (SCR.kind === 'dg') (SCR.lights || []).forEach(function (L) { if (!L.torch) return; var fx = ox + L.x, fy = OY + L.y; R('#12040a', fx - 2, fy - 2, 5, 9); R('#5a3a1e', fx - 1, fy - 1, 3, 7); var fl = Math.sin(G.t * 14 + L.x) * 1.5; R('#ff7a2a', fx - 2, fy - 8 + fl, 5, 6); R('#ffe36a', fx - 1, fy - 6 + fl, 3, 3); });
  if (SCR.kind === 'over') { g.fillStyle = 'rgba(200,120,110,0.5)'; ASH.forEach(function (a) { a.y += a.s / 60; a.x += Math.sin(G.t + a.w) * 0.3 - 0.2; if (a.y > Hd) { a.y = -4; a.x = Math.random() * Wd; } if (a.x < 0) a.x += Wd; g.fillRect(ox + (a.x | 0), OY + (a.y | 0), 1, 1); }); }
  var vg = g.createRadialGradient(ox + Wd / 2, OY + Hd / 2, Hd * 0.45, ox + Wd / 2, OY + Hd / 2, Wd * 0.62); vg.addColorStop(0, 'rgba(60,0,8,0)'); vg.addColorStop(1, 'rgba(60,0,8,0.45)'); g.fillStyle = vg; g.fillRect(ox, OY, Wd, Hd);
}
/* the people and things standing on the land */
function drawLandBits(ox) {
  if (!SCR || SCR.kind !== 'over') return; var g = KIT.ctx; g.save(); g.beginPath(); g.rect(ox, OY, COLS * TS, ROWS * TS); g.clip(); g.translate(ox, OY);
  if (SCR.city) { var fr = ['fac_amy', 'fac_tb', 'fac_beebs', 'fac_greebo', 'fac_joff', 'fac_saba', 'fac_t', 'fac_cafe']; var xx = 6; fr.forEach(function (f) { var s = KIT.SPR && KIT.SPR[f]; var w = s ? s[2] * 0.7 : 40; if (xx + w > COLS * TS - 6) return; KIT.spr(f, xx + w / 2, ROWS * TS - 2, { sc: 0.7 }); xx += w + 4; }); }
  if (SCR.tb) KIT.spr('npc_tb', SCR.tb.x, SCR.tb.y + 14, { sc: 0.85, flip: P.x < SCR.tb.x });
  if (SCR.steve) KIT.spr('steve0', SCR.steve.x, SCR.steve.y + 14 + Math.sin(G.t * 3) * 2, { sc: 0.4 });
  g.restore();
}
var TBSAY = ['Fuck muck', 'Shithead Laboozie', 'dick skin', 'whyma wimina', 'suck your own and fuck your own', 'holy shit!', 'Cock rinse', 'where the fuck do you think you\'re goin? Prick!', 'im so fucked right now', 'Im a tucker fucker!', 'you shoot real hard huh?', 'who\'s ready for shithead pudding', 'you\'ll make a good sissy'];
function talkNear() { if (!SCR || SCR.kind !== 'over' || MSGBOX) return false; var p = P;
  if (SCR.tb && Math.hypot(SCR.tb.x - p.x, SCR.tb.y - p.y) < 30) { say(TBSAY[Math.floor(Math.random() * TBSAY.length)], 'TB'); sfx.play('blip'); return true; }
  if (SCR.steve && Math.hypot(SCR.steve.x - p.x, SCR.steve.y - p.y) < 30) { say('...', 'STEVE'); sfx.play('blip'); return true; }
  if (SCR.sign) { var v = DIRV[p.dir], hi = Math.floor((p.x + v[0] * 16) / TS), hj = Math.floor((p.y + v[1] * 16) / TS); if (hi === SCR.sign.i && hj === SCR.sign.j) { say(SCR.sign.s, 'SIGN'); sfx.play('blip'); return true; } }
  return false; }
/* TB and Steve are solid */
var _solidAt = solidAt;
solidAt = function (x, y, flyer) { if (!flyer && SCR && SCR.kind === 'over') { if (SCR.tb && Math.abs(x - SCR.tb.x) < 9 && Math.abs(y - SCR.tb.y) < 9) return true; } return _solidAt(x, y, flyer); };
