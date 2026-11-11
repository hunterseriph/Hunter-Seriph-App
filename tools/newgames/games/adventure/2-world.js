/* ---------- the world: boxes you stand on (their sides are walls), ramps, water, and the things in it ---------- */
var LV = null; // { boxes, ramps, water, rings, foes, springs, pads, loops, goal, ingredients, targets, start, theme }
function newLevel(theme) { return { boxes: [], ramps: [], water: [], rings: [], foes: [], springs: [], pads: [], loops: [], items: [], targets: [], fronts: [], npcs: [], portals: [], theme: theme, start: { x: 0, y: 0, z: 0, a: 0 } }; }
function bx(L, x0, y0, z0, x1, y1, z1, o) { var b = { x0: Math.min(x0, x1), y0: y0, z0: Math.min(z0, z1), x1: Math.max(x0, x1), y1: y1, z1: Math.max(z0, z1) }; if (o) for (var k in o) b[k] = o[k]; L.boxes.push(b); return b; }
function rp(L, x0, z0, x1, z1, ya, yb, ax) { L.ramps.push({ x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), ya: ya, yb: yb, ax: ax || 'z' }); }
function ringLine(L, x, y, z, dx, dz, n) { for (var i = 0; i < n; i++) L.rings.push({ x: x + dx * i, y: y + 1, z: z + dz * i }); }
function buildStage(id, who) {
  var S = STAGES[id], L = newLevel(S.theme), rnd = srand(9000 + id.length * 131 + id.charCodeAt(0) * 7 + id.charCodeAt(1)), kind = S.kind; L.id = id;
  function ri(a) { return Math.floor(rnd() * a); }
  var job = who === 'greebo' ? 'hunt' : who === 'spermaid' ? 'water' : who === 'lab' ? 'shoot' : kind === 'hunt' || kind === 'water' ? 'speed' : kind; L.job = job;
  var x = 0, y = 0, z = 0, wid = job === 'shoot' ? 14 : 9, pieces = Math.round(S.len / (job === 'speed' ? 4 : 5));
  bx(L, -8, y - 4, -8, 8, y, 8); L.start = { x: 0, y: 0, z: -3, a: 0 }; z = 8;
  if (job === 'hunt') { // a big open place with towers, ledges and three ingredients to find
    var R = 34; bx(L, -R, -4, 8, R, 0, 8 + R * 2); for (var t = 0; t < 14; t++) { var tx = (rnd() - 0.5) * R * 1.6, tz = 14 + rnd() * R * 1.8, tw = 3 + rnd() * 4, th = 3 + rnd() * 9; bx(L, tx - tw / 2, 0, tz - tw / 2, tx + tw / 2, th, tz + tw / 2, { climb: 1 }); if (rnd() < 0.5) bx(L, tx + tw / 2, th - 0.5, tz - 1.5, tx + tw / 2 + 5, th, tz + 1.5); }
    [0, 1, 3].forEach(function (w) { bx(L, [-R - 2, R, -R, -R][w], 0, [8, 8, 6, 8 + R * 2][w], [-R, R + 2, R, R][w], 7, [8 + R * 2, 8 + R * 2, 8, 8 + R * 2 + 2][w], { climb: 1 }); });
    var spots = L.boxes.filter(function (b) { return b.y1 > 2 && b.y1 < 6.5; }); for (var k = 0; k < 3; k++) { var b = spots[(k * 5 + 3) % spots.length]; L.items.push({ k: 'ingr', n: k, x: (b.x0 + b.x1) / 2, y: b.y1 + 0.8, z: (b.z0 + b.z1) / 2 }); }
    for (var r2 = 0; r2 < 40; r2++) L.rings.push({ x: (rnd() - 0.5) * R * 1.7, y: 1, z: 12 + rnd() * R * 1.8 }); for (var f = 0; f < 10; f++) L.foes.push(mkFoe(S.foes[ri(S.foes.length)], (rnd() - 0.5) * R * 1.5, 0, 16 + rnd() * R * 1.7));
    L.goal = null; return L; }
  for (var p = 0; p < pieces; p++) { var r = rnd(), len = 10 + ri(10);
    if (job === 'water' && p % 2 === 1) { // a pool: the floor drops and the water fills it
      var deep = 6; bx(L, x - wid / 2 - 4, y - deep - 2, z, x + wid / 2 + 4, y - deep, z + len + 6); bx(L, x - wid / 2 - 5, y - deep, z, x - wid / 2 - 4, y + 0.5, z + len + 6); bx(L, x + wid / 2 + 4, y - deep, z, x + wid / 2 + 5, y + 0.5, z + len + 6);
      L.water.push({ x0: x - wid / 2 - 4, y0: y - deep, z0: z, x1: x + wid / 2 + 4, y1: y - 0.4, z1: z + len + 6 }); ringLine(L, x, y - 4, z + 2, 0, 1.6, 8); L.foes.push(mkFoe('jelly', x + 2, y - 3, z + len / 2)); z += len + 6; continue; }
    if (r < 0.25) { bx(L, x - wid / 2, y - 4, z, x + wid / 2, y, z + len); ringLine(L, x, y, z + 2, 0, 1.5, Math.min(8, len / 1.5)); if (job !== 'shoot' && rnd() < 0.6) L.pads.push({ x: x, y: y, z: z + 1, dx: 0, dz: 1 }); for (var e = 0; e < 1 + ri(2); e++) L.foes.push(mkFoe(S.foes[ri(S.foes.length)], x + (rnd() - 0.5) * wid * 0.6, y, z + 4 + rnd() * (len - 6))); z += len; }
    else if (r < 0.45) { var dy = (rnd() < 0.5 ? -1 : 1) * (2 + ri(3)); rp(L, x - wid / 2, z, x + wid / 2, z + len, y, y + dy); bx(L, x - wid / 2, Math.min(y, y + dy) - 4, z, x + wid / 2, Math.min(y, y + dy), z + len); ringLine(L, x, y + dy / 2, z + 2, 0, 1.6, 5); z += len; y += dy; }
    else if (r < 0.58) { var side = rnd() < 0.5 ? -1 : 1; bx(L, x - wid / 2, y - 4, z, x + wid / 2, y, z + wid); var nx = x + side * (len + 4); bx(L, Math.min(x, nx) - wid / 2, y - 4, z, Math.max(x, nx) + wid / 2, y, z + wid); ringLine(L, x + side * 2, y, z + wid / 2, side * 1.6, 0, 6); x = nx; z += wid; }
    else if (r < 0.7 && job === 'speed') { // a loop: run into it fast and it carries you round
      bx(L, x - wid / 2, y - 4, z, x + wid / 2, y, z + 14); L.pads.push({ x: x, y: y, z: z + 1, dx: 0, dz: 1 }); L.loops.push({ x: x, y: y, z: z + 9, r: 4.5 }); z += 14; }
    else if (r < 0.82) { // a spring up to a high road, or a gap you jump
      if (rnd() < 0.5) { bx(L, x - wid / 2, y - 4, z, x + wid / 2, y, z + 4); L.springs.push({ x: x, y: y, z: z + 2, vy: 16, vz: 6 }); var hy = y + 6; bx(L, x - wid / 2, hy - 1, z + 8, x + wid / 2, hy, z + 8 + len); ringLine(L, x, hy, z + 9, 0, 1.5, 6); bx(L, x - wid / 2, y - 4, z + 4, x + wid / 2, y, z + 8 + len); z += 8 + len; y = y; }
      else { var gap = 4 + ri(3); bx(L, x - wid / 2, y - 4, z, x + wid / 2, y, z + 4); z += 4 + gap; bx(L, x - wid / 2, y - 4, z, x + wid / 2, y, z + 6); ringLine(L, x, y + 2, z - gap + 1, 0, 1.2, gap); z += 6; } }
    else { var nw = 3.2; bx(L, x - nw / 2, y - 4, z, x + nw / 2, y, z + len); ringLine(L, x, y, z + 2, 0, 1.6, 6); if (rnd() < 0.5) L.foes.push(mkFoe(S.foes[ri(S.foes.length)], x, y, z + len / 2)); z += len; }
  }
  if (job === 'shoot') { L.targets = L.foes; bx(L, x - 12, y - 4, z, x + 12, y, z + 24); L.mini = { x: x, y: y, z: z + 16, at: z + 2 }; z += 24; }
  bx(L, x - wid / 2, y - 4, z, x + wid / 2, y, z + 10); L.goal = { x: x, y: y, z: z + 7 };
  return L;
}
function buildArena(boss) { var L = newLevel(boss === 'beast' || boss === 'execu' ? 'city' : boss === 'pig' ? 'park' : boss === 'kraken' || boss === 'hotload' || boss === 'golem' ? 'isles' : 'ship'); bx(L, -18, -4, -18, 18, 0, 18); for (var w = 0; w < 4; w++) bx(L, [-20, 18, -18, -18][w], 0, [-18, -18, -20, 18][w], [-18, 20, 18, 18][w], 1.2, [18, 18, -18, 20][w]); L.start = { x: 0, y: 0, z: -12, a: 0 }; L.boss = boss; for (var r = 0; r < 16; r++) { var a = r / 16 * 6.283; L.rings.push({ x: Math.cos(a) * 11, y: 1, z: Math.sin(a) * 11 }); } return L; }
function buildHub(h) { var Hb = HUBS[h], L = newLevel(h === 'isles' ? 'isles' : h === 'park' ? 'park' : 'city'); L.hub = h; bx(L, -30, -4, -20, 30, 0, 20);
  for (var w = 0; w < 4; w++) bx(L, [-32, 30, -30, -30][w], 0, [-20, -20, -22, 20][w], [-30, 32, 30, 30][w], 4, [20, 20, -20, 22][w]);
  Hb.fronts.forEach(function (f, i) { L.fronts.push({ s: f, x: -24 + i * (48 / Math.max(1, Hb.fronts.length - 1)), z: 19.6 }); });
  if (h === 'city') { L.npcs.push({ s: 'npc_amy', x: -8, z: 12, say: 'Mild, hot or dynamite?' }); L.npcs.push({ s: 'npc_saba', x: 14, z: 10, say: 'Hitless runs only. Take a look, my friend.' }); }
  if (h === 'park') { L.npcs.push({ s: 'steve0', x: 0, z: 14, say: 'Steve waves. Steve always waves.' }); L.npcs.push({ s: 'npc_potbelly', x: 12, z: 10, say: 'Cabinets are free, kid. Play all you like.' }); }
  if (h === 'isles') { L.npcs.push({ s: 'npc_spermaid', x: -10, z: 12, say: 'Sweetie! Even down here I keep a little stall.' }); L.npcs.push({ s: 'npc_pulsar', x: 10, z: 12, say: 'Just vibes, friend. Free of charge.' }); L.water.push({ x0: -30, y0: -4, z0: -20, x1: -18, y1: -0.3, z1: -8 }); }
  var others = Object.keys(HUBS).filter(function (k) { return k !== h; }); others.forEach(function (o, i) { L.portals.push({ k: 'hub', to: o, x: i ? 26 : -26, z: -14, n: HUBS[o].n }); });
  if (h === 'city') L.portals.push({ k: 'garden', x: 0, z: -16, n: 'HOMUNCULUS GARDEN' });
  Object.keys(STAGES).forEach(function (id, i) { if (STAGES[id].hub !== h) return; var n = L.portals.filter(function (p) { return p.k === 'stage'; }).length; L.portals.push({ k: 'stage', id: id, x: -16 + n * 10, z: 2, n: STAGES[id].n }); });
  L.start = { x: 0, y: 0, z: -8, a: 0 }; return L; }
/* ---------- standing and walls ---------- */
function groundAt(x, z, y) { var best = -999, src = null;
  for (var i = 0; i < LV.boxes.length; i++) { var b = LV.boxes[i]; if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) continue; if (b.y1 <= y + 0.65 && b.y1 > best) { best = b.y1; src = b; } }
  for (var j = 0; j < LV.ramps.length; j++) { var r = LV.ramps[j]; if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue; var t = r.ax === 'z' ? (z - r.z0) / (r.z1 - r.z0) : (x - r.x0) / (r.x1 - r.x0), h = r.ya + (r.yb - r.ya) * t; if (h <= y + 0.9 && h > best) { best = h; src = r; } }
  return { y: best, src: src }; }
function pushWalls(o, rad) { var climb = null; for (var i = 0; i < LV.boxes.length; i++) { var b = LV.boxes[i]; if (b.y1 <= o.y + 0.65 || b.y0 >= o.y + 1.2) continue; var nx = Math.max(b.x0, Math.min(o.x, b.x1)), nz = Math.max(b.z0, Math.min(o.z, b.z1)), dx = o.x - nx, dz = o.z - nz, d = Math.hypot(dx, dz);
    if (d < rad) { if (d < 1e-4) { var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; dx = o.x - cx; dz = o.z - cz; d = Math.hypot(dx, dz) || 1; } o.x = nx + dx / d * rad; o.z = nz + dz / d * rad; climb = b; } } return climb; }
function inWater(x, y, z) { for (var i = 0; i < LV.water.length; i++) { var w = LV.water[i]; if (x > w.x0 && x < w.x1 && z > w.z0 && z < w.z1 && y < w.y1 && y > w.y0 - 1) return w; } return null; }
