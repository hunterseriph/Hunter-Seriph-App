/* =====================================================================================================
   THE FAP ROOMS: a Backrooms game. You noclipped out of Cum City mid-session and landed in the Lobby: endless yellow
   rooms, damp carpet, the hum of the lights. Find the EXIT on each level and get deeper (or further out?). Every level
   is laid fresh each time. Things live down here:
     the Grinner   only moves when you are not looking at it, and only in the dark (keep your torch on it)
     the Wanderer  something wearing a person; it walks the halls and runs when it sees you
     Hounds        deaf to walking, but sprinting brings them
     Steve         Ejaculand's mascot. He moves when the lights go out.
     the Chaser    on the red level it is always behind you. Run.
   Sanity drains in the dark and near them; Cumpuccinos bring it back. Lose your health and you wake at the level's start.
   ===================================================================================================== */
var W = 480, H = 270, TSZ = 2.4, WH = 2.8;
var SV = KIT.load('fr-save', null) || { lv: 0, best: 0, deaths: 0, notes: {}, sens: 1 };
function persist() { KIT.save('fr-save', SV); }
var LEVELS = [
  { id: 'lobby', n: 'LEVEL 0', name: 'THE LOBBY', wall: 'paper', wall2: 'paper2', floor: 'carpet', ceil: 'ceil', size: 44, gen: 'rooms', fog: [0.42, 0.38, 0.16], fogR: [6, 30], amb: [0.32, 0.29, 0.14], lamp: [1, 0.96, 0.7], ents: { grinner: 1, walker: 0 }, items: 9, lights: 0.35 },
  { id: 'stock', n: 'LEVEL 1', name: 'THE STOCKROOM', wall: 'conc', wall2: 'pillar', floor: 'concf', ceil: 'conc', size: 48, gen: 'garage', fog: [0.06, 0.06, 0.07], fogR: [5, 26], amb: [0.07, 0.07, 0.08], lamp: [0.8, 0.9, 1], ents: { grinner: 2, walker: 1 }, items: 10, lights: 0.18, flick: 0.4 },
  { id: 'pipes', n: 'LEVEL 2', name: 'THE PIPE DREAMS', wall: 'pipe', wall2: 'pipe', floor: 'grate', ceil: 'pipe', size: 41, gen: 'maze', fog: [0.08, 0.03, 0.02], fogR: [3, 18], amb: [0.08, 0.04, 0.03], lamp: [1, 0.55, 0.25], ents: { hound: 2, walker: 1 }, items: 10, lights: 0.12, hot: 1 },
  { id: 'pools', n: 'LEVEL 3', name: 'THE POOLROOMS', wall: 'poolwall', wall2: 'pooltile', floor: 'pooltile', ceil: 'pooltile', size: 46, gen: 'pools', fog: [0.55, 0.7, 0.72], fogR: [8, 36], amb: [0.45, 0.55, 0.58], lamp: [0.9, 1, 1], ents: { grinner: 1, hound: 2 }, items: 9, lights: 0.25 },
  { id: 'fun', n: 'LEVEL FUN =)', name: 'THE PARTY ROOM', wall: 'party', wall2: 'party', floor: 'partyf', ceil: 'ceil', size: 43, gen: 'party', fog: [0.2, 0.05, 0.12], fogR: [5, 26], amb: [0.2, 0.08, 0.15], lamp: [1, 0.6, 0.85], ents: { steve: 5, walker: 1 }, items: 10, lights: 0.3, blackout: 1 },
  { id: 'run', n: 'LEVEL !', name: 'RUN FOR YOUR LIFE', wall: 'red', wall2: 'red', floor: 'redf', ceil: 'red', size: 0, gen: 'run', fog: [0.25, 0.0, 0.02], fogR: [4, 24], amb: [0.3, 0.02, 0.04], lamp: [1, 0.1, 0.1], ents: { chaser: 1 }, items: 4, lights: 0.4, flick: 0.6 }
];
var NOTES = [
  'Day 1. I was mid-session, I swear I only leaned back in the chair. Now there is carpet. Wet carpet.',
  'The lights hum in F sharp. I have counted. I have had time to count.',
  'If you see a grin in the dark, keep your torch on it. It does not like being watched.',
  'Found a Cumpuccino in a corner. Still warm. Who is making these?',
  'The walls are the same wallpaper as my nan\'s hallway. That is the scariest part.',
  'Someone wrote EXIT on a door. The door was real. The other side was concrete and more of this.',
  'Do not sprint in the pipes. They hear you.',
  'The thing that walks the halls has a face it borrowed. It wears it wrong.',
  'I tried to finish. Every time I got close, the lights flickered. Coincidence?',
  'Steve was at the party. Steve is always at the party. Steve only moves in the dark.',
  'The pool water is warm. Too warm. Do not ask why.',
  'Level Fun =) is not fun.',
  'I think the red level is the way out. I think the thing behind me thinks so too.',
  'If you are reading this, I made it out. Or I didn\'t and I\'m still writing.',
  'Tally: 400 rooms. 0 windows. 1 working vending machine, out of order.',
  'Remember what TB said: suck your own and fuck your own. I don\'t know why that helps but it does.'
];
var K = null, MW = 0, MH = 0, LV = null, MESH = null, G = { mode: 'title', t: 0 }, P = null, ENTS = [], ITEMS = [], LIGHTS = [], EXIT = null, MSG = [];
function idx(i, j) { return j * MW + i; } function inMap(i, j) { return i >= 0 && j >= 0 && i < MW && j < MH; } function tileOf(x) { return Math.floor(x / TSZ); } function tx(i) { return (i + 0.5) * TSZ; }
function solid(i, j) { if (!inMap(i, j)) return true; var k = K[idx(i, j)]; return k === 1 || k === 2 || k === 4; }
function isWall(i, j) { if (!inMap(i, j)) return true; var k = K[idx(i, j)]; return k === 1 || k === 2; }
function srnd(seed) { return srand(seed); }

/* ---------- the levels ---------- */
function bfsFrom(si, sj) { var D = new Int32Array(MW * MH).fill(-1), q = [idx(si, sj)]; D[q[0]] = 0; for (var h = 0; h < q.length; h++) { var p = q[h], pi = p % MW, pj = (p / MW) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var ni = pi + d[0], nj = pj + d[1]; if (!inMap(ni, nj)) return; var k = idx(ni, nj); if (D[k] < 0 && !solid(ni, nj)) { D[k] = D[p] + 1; q.push(k); } }); } return D; }
function joinAll(si, sj, rnd) { // anything cut off gets a way dug to it
  for (var pass = 0; pass < 40; pass++) { var D = bfsFrom(si, sj), lost = -1; for (var q = 0; q < MW * MH; q++) { var i = q % MW, j = (q / MW) | 0; if (!solid(i, j) && D[q] < 0) { lost = q; break; } } if (lost < 0) return;
    var li = lost % MW, lj = (lost / MW) | 0, best = null, bd = 1e9; for (var q2 = 0; q2 < MW * MH; q2++) if (D[q2] >= 0) { var d = Math.abs(q2 % MW - li) + Math.abs(((q2 / MW) | 0) - lj); if (d < bd) { bd = d; best = q2; } }
    var ci = li, cj = lj, ti = best % MW, tj = (best / MW) | 0; while (ci !== ti || cj !== tj) { if (ci !== ti && (cj === tj || rnd() < 0.5)) ci += ci < ti ? 1 : -1; else cj += cj < tj ? 1 : -1; if (ci > 0 && cj > 0 && ci < MW - 1 && cj < MH - 1) K[idx(ci, cj)] = 0; } }
}
function genLevel(n, seed) {
  var L = LEVELS[n], rnd = srnd(seed), i, j; LV = L; ENTS = []; ITEMS = []; LIGHTS = []; EXIT = null;
  function ri(a) { return Math.floor(rnd() * a); }
  if (L.gen === 'run') { MW = 9; MH = 140; K = new Uint8Array(MW * MH).fill(1); var cx = 4; for (j = 1; j < MH - 1; j++) { if (j % 40 === 20) cx = 2 + ri(5); for (i = cx - 1; i <= cx + 1; i++) if (i > 0 && i < MW - 1) K[idx(i, j)] = 0; if (j % 40 > 15 && j % 40 < 26) for (i = 1; i < MW - 1; i++) K[idx(i, j)] = 0; }
    G.start = { i: 4, j: MH - 3 }; for (i = 1; i < MW - 1; i++) K[idx(i, MH - 2)] = K[idx(i, MH - 3)] = 0; EXIT = { i: -1, j: 1 }; for (i = 1; i < MW - 1; i++) if (!solid(i, 2)) { EXIT.i = i; break; } K[idx(EXIT.i, 1)] = 0;
  } else {
    MW = MH = L.size; K = new Uint8Array(MW * MH);
    for (j = 0; j < MH; j++) for (i = 0; i < MW; i++) K[idx(i, j)] = (i === 0 || j === 0 || i === MW - 1 || j === MH - 1) ? 1 : 0;
    if (L.gen === 'rooms') { for (var w = 0; w < MW * MH / 14; w++) { var hz = rnd() < 0.5, len = 2 + ri(8), x = 1 + ri(MW - 2), y = 1 + ri(MH - 2); for (var s = 0; s < len; s++) { var a = hz ? x + s : x, b = hz ? y : y + s; if (inMap(a, b)) K[idx(a, b)] = 1; } }
      for (var pl = 0; pl < MW * MH / 60; pl++) K[idx(1 + ri(MW - 2), 1 + ri(MH - 2))] = 2; }
    else if (L.gen === 'garage') { for (j = 3; j < MH - 1; j += 4) for (i = 3; i < MW - 1; i += 4) K[idx(i, j)] = 2; for (var w2 = 0; w2 < MW * MH / 40; w2++) { var hz2 = rnd() < 0.5, l2 = 3 + ri(10), x2 = 1 + ri(MW - 2), y2 = 1 + ri(MH - 2); for (var s2 = 0; s2 < l2; s2++) { var a2 = hz2 ? x2 + s2 : x2, b2 = hz2 ? y2 : y2 + s2; if (inMap(a2, b2) && a2 % 4 && b2 % 4) K[idx(a2, b2)] = 1; } } }
    else if (L.gen === 'maze') { for (j = 0; j < MH; j++) for (i = 0; i < MW; i++) K[idx(i, j)] = 1; var st = [[1, 1]]; K[idx(1, 1)] = 0; while (st.length) { var c = st[st.length - 1], nb = [[2, 0], [-2, 0], [0, 2], [0, -2]].filter(function (d) { var ni = c[0] + d[0], nj = c[1] + d[1]; return ni > 0 && nj > 0 && ni < MW - 1 && nj < MH - 1 && K[idx(ni, nj)] === 1; }); if (!nb.length) { st.pop(); continue; } var d = nb[ri(nb.length)]; K[idx(c[0] + d[0] / 2, c[1] + d[1] / 2)] = 0; K[idx(c[0] + d[0], c[1] + d[1])] = 0; st.push([c[0] + d[0], c[1] + d[1]]); }
      for (var br = 0; br < MW * MH / 12; br++) { var bi = 1 + ri(MW - 2), bj = 1 + ri(MH - 2); if (K[idx(bi, bj)] === 1 && ((bi % 2 === 1) !== (bj % 2 === 1))) K[idx(bi, bj)] = 0; } // loops, so it is not one long dead end
      for (var rm = 0; rm < 6; rm++) { var rx = 2 + ri(MW - 8), ry = 2 + ri(MH - 8); for (j = ry; j < ry + 4; j++) for (i = rx; i < rx + 5; i++) K[idx(i, j)] = 0; } }
    else if (L.gen === 'pools') { for (var pw = 0; pw < 14; pw++) { var px = 2 + ri(MW - 10), py = 2 + ri(MH - 10), pw2 = 3 + ri(6), ph = 3 + ri(6); for (j = py; j < py + ph; j++) for (i = px; i < px + pw2; i++) K[idx(i, j)] = 3; }
      for (var pp = 0; pp < MW * MH / 50; pp++) K[idx(1 + ri(MW - 2), 1 + ri(MH - 2))] = 2; for (var w3 = 0; w3 < MW * MH / 30; w3++) { var hz3 = rnd() < 0.5, l3 = 2 + ri(6), x3 = 1 + ri(MW - 2), y3 = 1 + ri(MH - 2); for (var s3 = 0; s3 < l3; s3++) { var a3 = hz3 ? x3 + s3 : x3, b3 = hz3 ? y3 : y3 + s3; if (inMap(a3, b3)) K[idx(a3, b3)] = 1; } } }
    else if (L.gen === 'party') { for (j = 0; j < MH; j += 6) for (i = 0; i < MW; i++) K[idx(i, Math.min(MH - 1, j))] = 1; for (i = 0; i < MW; i += 7) for (j = 0; j < MH; j++) K[idx(Math.min(MW - 1, i), j)] = 1;
      for (j = 0; j < MH - 6; j += 6) for (i = 0; i < MW - 7; i += 7) { if (j > 0) K[idx(i + 2 + ri(4), j)] = 0; if (i > 0) K[idx(i, j + 2 + ri(3))] = 0; if (rnd() < 0.4 && j > 0) K[idx(i + 2 + ri(4), j)] = 0; } }
    for (i = 0; i < MW; i++) { K[idx(i, 0)] = 1; K[idx(i, MH - 1)] = 1; K[idx(0, i)] = 1; K[idx(MW - 1, i)] = 1; }
    G.start = { i: 2, j: MH - 3 }; K[idx(2, MH - 3)] = 0; K[idx(3, MH - 3)] = 0; K[idx(2, MH - 4)] = 0;
    joinAll(2, MH - 3, rnd);
    var D = bfsFrom(2, MH - 3), far = 0, fq = 0; for (var q = 0; q < MW * MH; q++) if (D[q] > far && K[q] === 0) { var qi = q % MW, qj = (q / MW) | 0; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (dd) { return solid(qi + dd[0], qj + dd[1]); })) { far = D[q]; fq = q; } }
    EXIT = { i: fq % MW, j: (fq / MW) | 0 };
  }
  // the exit door sits in the wall beside the exit tile
  var dd2 = [[0, -1], [1, 0], [-1, 0], [0, 1]].filter(function (d) { return solid(EXIT.i + d[0], EXIT.j + d[1]); })[0] || [0, -1]; EXIT.d = dd2; EXIT.x = tx(EXIT.i) + dd2[0] * (TSZ / 2 - 0.05); EXIT.z = tx(EXIT.j) + dd2[1] * (TSZ / 2 - 0.05);
  // lights in the ceiling, some dead
  for (j = 1; j < MH - 1; j++) for (i = 1; i < MW - 1; i++) if (!solid(i, j) && ((i * 7 + j * 3) % 5 === 0 || L.gen === 'run' && j % 6 === 0 && i === 4) && rnd() < L.lights * 2.2) LIGHTS.push({ i: i, j: j, dead: rnd() < 0.08, fl: rnd() < (L.flick || 0.08), ph: rnd() * 10 });
  LIGHTS.push({ i: EXIT.i, j: EXIT.j, exit: 1 });
  // things to find
  var D2 = bfsFrom(G.start.i, G.start.j), free = []; for (var q3 = 0; q3 < MW * MH; q3++) if (D2[q3] > 6 && K[q3] === 0) free.push(q3);
  function takeFree(minD) { for (var t = 0; t < 60; t++) { var c = free[ri(free.length)]; if (c !== undefined && D2[c] >= (minD || 0)) { free.splice(free.indexOf(c), 1); return { i: c % MW, j: (c / MW) | 0 }; } } return null; }
  for (var it = 0; it < L.items; it++) { var p = takeFree(); if (p) ITEMS.push({ x: tx(p.i), z: tx(p.j), k: ['battery', 'cuppa', 'note', 'battery', 'tissue', 'almond'][it % 6], n: ri(NOTES.length) }); }
  Object.keys(L.ents).forEach(function (k) { for (var e = 0; e < L.ents[k]; e++) { var p2 = k === 'chaser' ? { i: 4, j: MH - 2 } : takeFree(14); if (!p2) continue; ENTS.push({ k: k, x: tx(p2.i), z: tx(p2.j), a: 0, st: 'idle', t: 0, spd: 0, seen: 0, cd: 0, path: null }); } });
  if (L.gen === 'run') ENTS.forEach(function (e) { e.z = tx(MH - 1) + 6; e.x = tx(4); });
  placeDecor(rnd);
}
function buildMesh() {
  var m = new R3.Mesh(), L = LV, rnd = srnd(77);
  function vc(k) { var v = 0.5 * k; return [v, v, v]; }
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) {
    var x0 = i * TSZ, z0 = j * TSZ, x1 = x0 + TSZ, z1 = z0 + TSZ, k = K[idx(i, j)];
    if (k === 1 || k === 2) { var T = TL(k === 2 ? L.wall2 : (i * 3 + j) % 4 ? L.wall : L.wall2);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { if (isWall(i + d[0], j + d[1])) return; var a, b; if (d[0] > 0) { a = [x1, z1]; b = [x1, z0]; } else if (d[0] < 0) { a = [x0, z0]; b = [x0, z1]; } else if (d[1] > 0) { a = [x0, z1]; b = [x1, z1]; } else { a = [x1, z0]; b = [x0, z0]; }
        m.quad([a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], WH, b[1]], [a[0], WH, a[1]], [0, WH / TSZ, 1, WH / TSZ, 1, 0, 0, 0], T, vc(0.9 + rnd() * 0.1), [d[0], 0, d[1]]); });
      continue; }
    var water = k === 3, fy = water ? -0.35 : 0;
    m.quad([x0, fy, z1], [x1, fy, z1], [x1, fy, z0], [x0, fy, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL(water ? 'water' : L.floor), vc(0.85 + rnd() * 0.15), [0, 1, 0]);
    if (water) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nk = inMap(i + d[0], j + d[1]) ? K[idx(i + d[0], j + d[1])] : 1; if (nk !== 0) return; var a, b; if (d[0] > 0) { a = [x1, z1]; b = [x1, z0]; } else if (d[0] < 0) { a = [x0, z0]; b = [x0, z1]; } else if (d[1] > 0) { a = [x0, z1]; b = [x1, z1]; } else { a = [x1, z0]; b = [x0, z0]; } m.quad([a[0], -0.35, a[1]], [b[0], -0.35, b[1]], [b[0], 0, b[1]], [a[0], 0, a[1]], [0, 0.15, 1, 0.15, 1, 0, 0, 0], TL('pooltile'), vc(0.8), [-d[0], 0, -d[1]]); });
    m.quad([x0, WH, z0], [x1, WH, z0], [x1, WH, z1], [x0, WH, z1], [0, 0, 1, 0, 1, 1, 0, 1], TL(L.ceil), vc(0.8), [0, -1, 0]);
  }
  LIGHTS.forEach(function (Lt) { if (Lt.exit) return; var x = tx(Lt.i), z = tx(Lt.j), h = 0.5; m.quad([x - h, WH - 0.01, z - h * 0.6], [x + h, WH - 0.01, z - h * 0.6], [x + h, WH - 0.01, z + h * 0.6], [x - h, WH - 0.01, z + h * 0.6], [0, 0, 1, 0, 1, 1, 0, 1], TL('panel'), Lt.dead ? vc(0.3) : vc(1), [0, -1, 0], Lt.dead ? 0 : 1.4); });
  // the exit door and its sign
  var e = EXIT, dx = e.d[0], dz = e.d[1], w = 0.6, sx = -dz, sz = dx, cx = e.x - dx * 0.01, cz = e.z - dz * 0.01;
  m.quad([cx - sx * w, 0, cz - sz * w], [cx + sx * w, 0, cz + sz * w], [cx + sx * w, 2.1, cz + sz * w], [cx - sx * w, 2.1, cz - sz * w], [1, 1, 0, 1, 0, 0, 1, 0], TL('exit'), vc(1), [-dx, 0, -dz]);
  m.quad([cx - sx * 0.4 - dx * 0.02, 2.2, cz - sz * 0.4 - dz * 0.02], [cx + sx * 0.4 - dx * 0.02, 2.2, cz + sz * 0.4 - dz * 0.02], [cx + sx * 0.4 - dx * 0.02, 2.6, cz + sz * 0.4 - dz * 0.02], [cx - sx * 0.4 - dx * 0.02, 2.6, cz - sz * 0.4 - dz * 0.02], (dx + dz > 0) ? [0, 1, 1, 1, 1, 0, 0, 0] : [1, 1, 0, 1, 0, 0, 1, 0], TL('exitsign'), vc(1), [-dx, 0, -dz], 2);
  buildDecor(m); MESH = m.upload(); if (DECOMESH) DECOMESH.free(); DECOMESH = buildDecals();
}

/* ---------- moving about ---------- */
function collide(o, r) {
  var i0 = tileOf(o.x - r), i1 = tileOf(o.x + r), j0 = tileOf(o.z - r), j1 = tileOf(o.z + r);
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { if (!solid(i, j)) continue; var bx0 = i * TSZ, bz0 = j * TSZ, bx1 = bx0 + TSZ, bz1 = bz0 + TSZ, nx = Math.max(bx0, Math.min(o.x, bx1)), nz = Math.max(bz0, Math.min(o.z, bz1)), dx = o.x - nx, dz = o.z - nz, d = Math.hypot(dx, dz);
    if (d < r) { if (d < 1e-5) { o.x = tx(i) + (o.x > tx(i) ? 1 : -1) * (TSZ / 2 + r); } else { o.x = nx + dx / d * r; o.z = nz + dz / d * r; } } }
}
function canSee(ax, az, bx, bz, range) { var dx = bx - ax, dz = bz - az, d = Math.hypot(dx, dz); if (range && d > range) return false; var n = Math.ceil(d / 0.6); for (var s = 1; s < n; s++) { var t = s / n; if (isWall(tileOf(ax + dx * t), tileOf(az + dz * t))) return false; } return true; }
function flow(ti, tj) { var D = bfsFrom(ti, tj); return D; }
function stepToward(e, D, spd, dt) { // roll downhill on a distance field towards the player
  var i = tileOf(e.x), j = tileOf(e.z), best = null, bd = D[idx(i, j)]; if (bd < 0) return;
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var ni = i + d[0], nj = j + d[1]; if (!inMap(ni, nj)) return; var v = D[idx(ni, nj)]; if (v >= 0 && v < bd) { bd = v; best = [ni, nj]; } });
  var gx = best ? tx(best[0]) : P.x, gz = best ? tx(best[1]) : P.z; if (bd <= 1) { gx = P.x; gz = P.z; }
  var dx = gx - e.x, dz = gz - e.z, l = Math.hypot(dx, dz) || 1; e.x += dx / l * spd * dt; e.z += dz / l * spd * dt; e.a = Math.atan2(dx, dz); collide(e, 0.35);
}
function lightAt(x, z) { var best = 0; LIGHTS.forEach(function (L) { if (L.dead || L.off) return; var d = Math.hypot(tx(L.i) - x, tx(L.j) - z); best = Math.max(best, 1 - d / 7); }); return best; }
function msg(s, col) { MSG.push({ s: s, t: 4, col: col || '#f1e7d0' }); if (MSG.length > 3) MSG.shift(); }
function startLevel(n, fresh) {
  if (!R3.ok) { G.mode = 'nogl'; return; }
  buildAtlas(); G.lv = n; G.seed = (fresh || !G.seed ? (Math.random() * 1e9) | 0 : G.seed); genLevel(n, G.seed); if (MESH) MESH.free(); buildMesh();
  P = { x: tx(G.start.i), z: tx(G.start.j), a: Math.PI, p: 0, hp: P && !fresh && P.hp > 0 ? Math.max(P.hp, 60) : 100, san: P && !fresh && P.san > 0 ? Math.max(P.san, 60) : 100, sta: 100, bat: P && !fresh ? Math.max(P.bat, 50) : 100, batts: P && !fresh ? (P.batts || 0) : 1, almond: P && !fresh ? (P.almond || 0) : 0, torch: 1, cups: P && !fresh ? P.cups : 1, bob: 0, hurt: 0, scare: 0 };
  G.mode = 'play'; G.lvT = G.t; G.banner = { t: 4, a: LV.n, b: LV.name }; G.blk = 0; G.flowT = 0; MSG = []; KIT.closeMenu(); music.play(LV.gen === 'run' ? 'frrun' : 'frdrone'); hum(true);
  if (n > SV.best) SV.best = n; SV.lv = n; persist();
}
var HUM = null;
function hum(on) { var a = sfx.audio(); if (!a) return; if (on && !HUM) { var o = a.ctx.createOscillator(), o2 = a.ctx.createOscillator(), g = a.ctx.createGain(), f = a.ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 92.5; o2.type = 'square'; o2.frequency.value = 185.3; f.type = 'lowpass'; f.frequency.value = 700; g.gain.value = 0.018; o.connect(f); o2.connect(f); f.connect(g); g.connect(a.master); o.start(); o2.start(); HUM = { o: o, o2: o2, g: g }; }
  if (!on && HUM) { try { HUM.o.stop(); HUM.o2.stop(); } catch (e) {} HUM = null; } if (HUM) HUM.g.gain.value = LV && LV.gen === 'run' ? 0 : 0.018 * (G.blk > 0 ? 0 : 1); }
var mouse = { dx: 0, dy: 0 };
document.addEventListener('mousemove', function (e) { if (document.pointerLockElement) { mouse.dx += e.movementX; mouse.dy += e.movementY; } });
KIT.canvas.addEventListener('click', function () { if (G.mode === 'play' && !('ontouchstart' in window) && KIT.canvas.requestPointerLock) try { KIT.canvas.requestPointerLock(); } catch (e) {} });
function update(dt) {
  G.t += dt; MSG.forEach(function (m) { m.t -= dt; }); MSG = MSG.filter(function (m) { m.t > 0; return m.t > 0; });
  if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.mode === 'fall') { G.fallT += dt; if (G.fallT > 2.2) startLevel(G.lv + 1, false); return; }
  if (G.mode === 'dead') { G.deadT += dt; return; }
  if (G.mode !== 'play') return;
  var mv = KIT.stick(0), lk = KIT.stick(1), sens = SV.sens || 1;
  P.a -= (lk.x * 2.6 * dt + mouse.dx * 0.0035) * sens; P.p = Math.max(-1.1, Math.min(1.1, P.p - (lk.y * 1.8 * dt + mouse.dy * 0.0035) * sens)); mouse.dx = mouse.dy = 0;
  if (KIT.held('lb')) P.a += 2.2 * dt; if (KIT.held('rb')) P.a -= 2.2 * dt;
  var run = (KIT.held('b') || KIT.held('run')) && P.sta > 0 && (mv.x || mv.y), wet = K[idx(tileOf(P.x), tileOf(P.z))] === 3, spd = (run ? 5.4 : 2.9) * (wet ? 0.6 : 1) * (P.san < 25 ? 0.85 : 1);
  if (run) P.sta = Math.max(0, P.sta - (LV.gen === 'run' ? 11 : 22) * dt); else P.sta = Math.min(100, P.sta + 14 * dt);
  var fx = Math.sin(P.a), fz = Math.cos(P.a), rx = -Math.cos(P.a), rz = Math.sin(P.a), mx = -mv.y, my = mv.x;
  var vx = (fx * mx + rx * my) * spd, vz = (fz * mx + rz * my) * spd; P.x += vx * dt; P.z += vz * dt; collide(P, 0.3); var moving = Math.abs(mx) + Math.abs(my) > 0.1;
  if (moving) { P.bob += dt * (run ? 11 : 7); if (Math.sin(P.bob) < -0.98 && !P.stepW) { P.stepW = 1; sfx.noise(0.04, run ? 0.07 : 0.035, wet ? 600 : 1800); } else if (Math.sin(P.bob) > 0) P.stepW = 0; }
  G.noise = run && moving ? 16 : moving ? 4 : 0;
  // torch
  if (KIT.pressed('x')) { P.torch = P.torch ? 0 : 1; sfx.play('tick'); }
  if (P.torch) { P.bat = Math.max(0, P.bat - dt * 0.33); if (P.bat <= 0) { if (P.batts > 0) { P.batts--; P.bat = 100; sfx.play('tick'); msg('YOU SWAP IN A SPARE BATTERY (' + P.batts + ' LEFT)', '#ffe36a'); } else { P.torch = 0; msg('THE TORCH IS DEAD. FIND BATTERIES.', '#ff2630'); } } }
  if (KIT.pressed('y') && P.cups > 0) { P.cups--; P.san = Math.min(100, P.san + 40); P.hp = Math.min(100, P.hp + 25); sfx.play('pour'); msg('A WARM CUMPUCCINO. YOU FEEL MORE REAL.', '#ffe36a'); }
  // sanity: the dark and the things in it
  var lit = lightAt(P.x, P.z), near = 99; ENTS.forEach(function (e) { near = Math.min(near, Math.hypot(e.x - P.x, e.z - P.z)); });
  P.san = Math.max(0, Math.min(100, P.san - dt * ((lit < 0.15 ? 0.9 : 0.15) + (near < 8 ? (8 - near) * 0.45 : 0)) + (lit > 0.5 && near > 12 ? dt * 0.25 : 0)));
  if (LV.hot && !wet) P.hp = Math.max(1, P.hp - dt * 0.15);
  if (P.san <= 0) { P.hp -= dt * 2.5; }
  P.hurt = Math.max(0, P.hurt - dt); P.scare = Math.max(0, P.scare - dt);
  // the lights: flicker, and on Level Fun the blackouts
  G.blk = Math.max(0, (G.blk || 0) - dt); if (LV.blackout) { G.blT = (G.blT || 6) - dt; if (G.blT <= 0) { G.blT = 5 + Math.random() * 5; G.blk = 1.1; sfx.play('door'); } }
  LIGHTS.forEach(function (L) { L.off = G.blk > 0 || (L.fl && Math.sin(G.t * 9 + L.ph * 3) + Math.sin(G.t * 23 + L.ph) > 1.3); }); hum(true);
  // pickups
  ITEMS.forEach(function (it) { if (it.got || Math.hypot(it.x - P.x, it.z - P.z) > 0.9) return; it.got = 1; sfx.play('coin');
    if (it.k === 'cuppa') { P.cups++; msg('CUMPUCCINO (Y TO DRINK)', '#ffe36a'); } else if (it.k === 'battery') { if (P.bat < 55) { P.bat = 100; msg('BATTERIES. THE TORCH IS FULL.', '#ffe36a'); } else { P.batts = Math.min(9, (P.batts || 0) + 1); msg('SPARE BATTERY (' + P.batts + ')', '#ffe36a'); } } else if (it.k === 'almond') { P.almond = (P.almond || 0) + 1; msg('ALMOND WATER (IN YOUR BAG)', '#4adfff'); } else if (it.k === 'tissue') { P.hp = Math.min(100, P.hp + 15); msg('TISSUES. YOU CLEAN UP A BIT.', '#4adfff'); }
    else { SV.notes[it.n] = 1; persist(); G.note = NOTES[it.n]; G.noteT = 6; } });
  if (G.noteT > 0) G.noteT -= dt;
  // the exit
  G.prompt = null; if (Math.hypot(EXIT.x - P.x, EXIT.z - P.z) < 1.5) { G.prompt = LV.gen === 'run' ? 'A  GET OUT' : 'A  OPEN THE EXIT'; if (KIT.pressed('a')) { if (G.lv >= LEVELS.length - 1) { ending(); return; } G.mode = 'fall'; G.fallT = 0; sfx.play('door'); sfx.play('magic'); music.stop(1); } }
  if (LV.gen === 'run' && P.z < tx(2)) { ending(); return; }
  stepUncanny(dt); if (KIT.pressed('a') && !G.prompt) useProp(); if (G.stay > 0) G.stay -= dt;
  stepEnts(dt);
  if (P.hp <= 0) { G.mode = 'dead'; G.deadT = 0; SV.deaths++; persist(); sfx.play('lose'); music.stop(1); hum(false); setTimeout(deadMenu, 1600); }
}
function seenBy(e) { // is the player looking at e, and can see it
  var dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz), f = (Math.sin(P.a) * dx + Math.cos(P.a) * dz) / (d || 1); if (f < 0.72 || d > 22) return false; if (!canSee(P.x, P.z, e.x, e.z)) return false; return P.torch && P.bat > 0 && d < 14 || lightAt(e.x, e.z) > 0.3;
}
function stepEnts(dt) {
  G.flowT -= dt; if (G.flowT <= 0) { G.flowT = 0.4; G.D = flow(tileOf(P.x), tileOf(P.z)); }
  ENTS.forEach(function (e) {
    var d = Math.hypot(e.x - P.x, e.z - P.z); e.cd = Math.max(0, e.cd - dt);
    if (e.k === 'grinner') { var seen = seenBy(e), dark = lightAt(e.x, e.z) < 0.3; e.seen = seen; if (!seen && d < 26) { stepToward(e, G.D, dark ? 3.4 : 1.6, dt); if (Math.random() < dt * 0.3) giggle(); } }
    else if (e.k === 'steve') { e.seen = seenBy(e); if (G.blk > 0 && d < 30) stepToward(e, G.D, 7, dt); }
    else if (e.k === 'walker') { var sees = canSee(e.x, e.z, P.x, P.z, 15); if (sees) { e.st = 'chase'; e.lost = 5; } else if (e.st === 'chase') { e.lost -= dt; if (e.lost <= 0) e.st = 'idle'; }
      if (e.st === 'chase') stepToward(e, G.D, 4.4, dt); else { if (!e.wp || Math.hypot(e.wp[0] - e.x, e.wp[1] - e.z) < 1) { var tries = 0; do { e.wp = [tx(1 + Math.floor(Math.random() * (MW - 2))), tx(1 + Math.floor(Math.random() * (MH - 2)))]; } while (solid(tileOf(e.wp[0]), tileOf(e.wp[1])) && ++tries < 20); e.wD = flow(tileOf(e.wp[0]), tileOf(e.wp[1])); } var save = P; stepTo(e, e.wD, e.wp, 1.6, dt); } }
    else if (e.k === 'hound') { if (G.noise && d < G.noise) { e.st = 'chase'; e.lost = 3; } if (e.st === 'chase') { e.lost -= dt; stepToward(e, G.D, 6.2, dt); if (e.lost <= 0) e.st = 'idle'; } }
    else if (e.k === 'chaser') { var sp = 3.7 + Math.min(0.5, (G.t - (G.lvT || 0)) * 0.005); e.z -= sp * dt; e.x += (P.x - e.x) * dt; if (e.z - P.z > 14) e.z = P.z + 14; }
    // contact
    if (d < (e.k === 'chaser' ? 1.6 : 0.95) && e.cd <= 0) { e.cd = 1.5;
      if (e.k === 'grinner' || e.k === 'steve') { P.san = Math.max(0, P.san - 45); P.hp -= 20; P.scare = 1; jump(); var away = pickFar(); e.x = away[0]; e.z = away[1]; }
      else { P.hp -= e.k === 'chaser' ? 100 : e.k === 'hound' ? 25 : 40; P.hurt = 0.5; P.scare = 0.6; jump(); KIT.shake(8); } }
  });
}
function stepTo(e, D, wp, spd, dt) { if (!D) return; var save = { x: P.x, z: P.z }; P.x = wp[0]; P.z = wp[1]; stepToward(e, D, spd, dt); P.x = save.x; P.z = save.z; }
function pickFar() { for (var t = 0; t < 50; t++) { var i = 1 + Math.floor(Math.random() * (MW - 2)), j = 1 + Math.floor(Math.random() * (MH - 2)); if (!solid(i, j) && Math.hypot(tx(i) - P.x, tx(j) - P.z) > 20) return [tx(i), tx(j)]; } return [tx(1), tx(1)]; }
function giggle() { var f = 700 + Math.random() * 300; for (var i = 0; i < 4; i++) sfx.tone('triangle', f + i * 40, f - 80, 0.07, 0.02, i * 0.09); }
function jump() { sfx.play('hurt'); sfx.tone('sawtooth', 120, 60, 0.6, 0.1); sfx.noise(0.5, 0.25, 900); KIT.flash(0.15); }

/* ---------- drawing ---------- */
var DYN = null;
function bill(m, x, y, z, w, h, T, col, g) { var R = R3.cam.right, U = [0, 1, 0]; m.quad([x - R[0] * w, y - h, z - R[2] * w], [x + R[0] * w, y - h, z + R[2] * w], [x + R[0] * w, y + h, z + R[2] * w], [x - R[0] * w, y + h, z - R[2] * w], [0, 1, 1, 1, 1, 0, 0, 0], T, col || [0.5, 0.5, 0.5], [-R3.cam.fwd[0], 0, -R3.cam.fwd[2]], g || 0); }
function draw() {
  var ctx = KIT.ctx;
  if (G.mode === 'nogl') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, KIT.H); KIT.text('THIS DEVICE CANNOT DRAW 3D (NO WEBGL)', W / 2, KIT.H / 2, { align: 'center', size: 8 }); return; }
  if (!P || !MESH) { R3.ok && R3.begin([0.05, 0.04, 0.02]); ctx.clearRect(0, 0, KIT.W, KIT.H); titleBack(); return; }
  ctx.clearRect(0, 0, KIT.W, KIT.H);
  var bob = Math.sin(P.bob) * 0.05, eye = [P.x, 1.6 + bob, P.z], f = [Math.sin(P.a) * Math.cos(P.p), Math.sin(P.p), Math.cos(P.a) * Math.cos(P.p)], at = [eye[0] + f[0], eye[1] + f[1], eye[2] + f[2]];
  if (G.mode === 'fall') { eye[1] -= G.fallT * G.fallT * 3; }
  var san = P.san / 100, sway = (1 - san) * 0.06 * Math.sin(G.t * 1.3), fog = LV.fog;
  R3.begin(G.blk > 0 ? [0, 0, 0] : fog); R3.setCam(eye, at, (KIT.W < KIT.H ? 1.25 : 1.05) + (1 - san) * 0.2 * Math.sin(G.t * 0.7), [Math.sin(sway), 1, 0]);
  var lights = []; LIGHTS.forEach(function (L) { if (L.dead || L.off) return; var x = tx(L.i), z = tx(L.j), d = Math.hypot(x - P.x, z - P.z); if (d < 20) lights.push({ x: x, y: WH - 0.3, z: z, r: L.exit ? 6 : 7.5, c: L.exit ? [0.3, 1, 0.4] : LV.lamp, k: L.exit ? 1.3 : 0.95, d: d }); });
  lights.sort(function (a, b) { return a.d - b.d; });
  var amb = G.blk > 0 ? [0.01, 0.01, 0.01] : LV.amb, tk = P.torch && P.bat > 0 ? 1.5 * Math.min(1, P.bat / 15 + 0.3) : 0;
  R3.scene({ fog: G.blk > 0 ? [0, 0, 0] : fog, fogR: G.blk > 0 ? [2, 10] : LV.fogR, amb: amb, lights: G.blk > 0 ? [] : lights.slice(0, 8), torch: { p: [P.x, 1.45, P.z], d: f, c: [tk, tk * 0.95, tk * 0.8] }, t: G.t, hue: (1 - san) * 0.25, warp: san < 0.3 ? (0.3 - san) * 2 : 0, neg: P.scare > 0.4 ? 0.6 : 0, meat: LV.gen === 'run' ? 0.15 : 0 });
  R3.draw(MESH, ATT); if (DECOMESH) R3.draw(DECOMESH, ATT, { soft: true, offset: 2, decal: true });
  if (!DYN) DYN = new R3.Mesh(); DYN.clear();
  ITEMS.forEach(function (it) { if (it.got || Math.hypot(it.x - P.x, it.z - P.z) > 24) return; bill(DYN, it.x, 0.35 + Math.sin(G.t * 2 + it.x) * 0.05, it.z, 0.3, 0.3, TL(it.k), [0.6, 0.6, 0.6], 0.4); });
  ENTS.forEach(function (e) { var d = Math.hypot(e.x - P.x, e.z - P.z); if (d > 30) return; var T = TL(e.k), s = e.k === 'chaser' ? 1.6 : e.k === 'hound' ? 0.7 : e.k === 'steve' ? 0.75 : 0.95, y = e.k === 'hound' ? 0.6 : e.k === 'chaser' ? 1.5 : e.k === 'steve' ? 0.8 : 1.05;
    bill(DYN, e.x + (e.k === 'walker' ? Math.sin(G.t * 7) * 0.03 : 0), y, e.z, e.k === 'walker' ? 0.5 : s, e.k === 'walker' ? 1.05 : s, T, [0.5, 0.5, 0.5], e.k === 'grinner' ? 0.6 : 0); });
  decoDyn(DYN); if (G.stay > 0 && EXIT) { var e = EXIT, dx = e.d[0], dz = e.d[1], sx = -dz, sz = dx, cx = e.x - dx * 0.04, cz = e.z - dz * 0.04; DYN.quad([cx - sx * 0.4, 2.2, cz - sz * 0.4], [cx + sx * 0.4, 2.2, cz + sz * 0.4], [cx + sx * 0.4, 2.6, cz + sz * 0.4], [cx - sx * 0.4, 2.6, cz - sz * 0.4], (dx + dz > 0) ? [0, 1, 1, 1, 1, 0, 0, 0] : [1, 1, 0, 1, 0, 0, 1, 0], TL('stay'), [0.5, 0.5, 0.5], [-dx, 0, -dz], 2); }
  R3.draw(DYN, ATT, { soft: true });
  hud();
}
function titleBack() { var ctx = KIT.ctx, t = G.t; for (var y = 0; y < KIT.H; y += 3) { ctx.fillStyle = 'rgb(' + (60 + Math.sin(y * 0.05 + t) * 8 | 0) + ',' + (52 + Math.sin(y * 0.05 + t) * 6 | 0) + ',18)'; ctx.fillRect(0, y, KIT.W, 3); } ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (var x = 0; x < KIT.W; x += 40) ctx.fillRect(x, 0, 2, KIT.H); }
function hud() {
  var ctx = KIT.ctx, Wd = KIT.W, Hd = KIT.H;
  if (P.san < 40) { ctx.fillStyle = 'rgba(0,0,0,' + ((40 - P.san) / 40 * 0.5) + ')'; ctx.fillRect(0, 0, Wd, Hd); for (var i = 0; i < 40 - P.san; i++) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(Math.random() * Wd, Math.random() * Hd, 2, 2); } }
  if (P.hurt > 0) { ctx.fillStyle = 'rgba(160,0,0,' + P.hurt * 0.6 + ')'; ctx.fillRect(0, 0, Wd, Hd); }
  KIT.R('rgba(255,255,255,0.5)', Wd / 2 - 1, Hd / 2 - 1, 2, 2);
  var y = Hd - 34; KIT.panel(6, y - 6, 132, 36); KIT.text('HEALTH', 12, y, { size: 6, col: '#a6968f' }); KIT.bar(52, y + 1, 78, 4, P.hp / 100, '#c4121c'); KIT.text('SANITY', 12, y + 9, { size: 6, col: '#a6968f' }); KIT.bar(52, y + 10, 78, 4, P.san / 100, '#c04aff'); KIT.text('BREATH', 12, y + 18, { size: 6, col: '#a6968f' }); KIT.bar(52, y + 19, 78, 4, P.sta / 100, '#4adfff');
  KIT.panel(6, 6, 100, 44); KIT.text(LV.n, 14, 13, { size: 6, col: '#a6968f' }); KIT.text('TORCH ' + Math.round(P.bat) + '%' + (P.torch ? '' : ' OFF'), 14, 24, { size: 6, col: P.bat < 20 ? '#ff2630' : '#ffe36a' }); KIT.text('SPARES ' + (P.batts || 0) + '  CUPS ' + P.cups, 14, 35, { size: 6, col: '#f1e7d0' });
  if (G.banner) { var a = Math.min(1, G.banner.t, 4 - G.banner.t); KIT.text(G.banner.a, Wd / 2, Hd * 0.3, { align: 'center', size: 8, col: '#a6968f', alpha: a }); KIT.text(G.banner.b, Wd / 2, Hd * 0.3 + 12, { align: 'center', font: 'title', size: 30, col: '#ffe36a', alpha: a, outline: 1 }); }
  if (G.prompt) KIT.text(G.prompt, Wd / 2, Hd * 0.62, { align: 'center', size: 8, col: '#7aff6a', outline: 1 });
  MSG.forEach(function (m, n) { KIT.text(m.s, Wd / 2, Hd - 66 - n * 11, { align: 'center', size: 6, col: m.col, alpha: Math.min(1, m.t), outline: 1 }); });
  if (G.noteT > 0) { var lines = KIT.wrap('"' + G.note + '"', Math.min(300, Wd - 40), 13, 'body'); KIT.panel(Wd / 2 - 160, 30, 320, 20 + lines.length * 15); lines.forEach(function (s, n) { KIT.text(s, Wd / 2, 40 + n * 15, { align: 'center', font: 'body', size: 13, col: '#f1e7d0' }); }); }
  if (G.mode === 'fall') { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, G.fallT / 1.6) + ')'; ctx.fillRect(0, 0, Wd, Hd); KIT.text('NOCLIPPING...', Wd / 2, Hd / 2, { align: 'center', size: 8, col: '#a6968f', alpha: Math.min(1, G.fallT) }); }
  if (G.mode === 'dead') { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(0.9, G.deadT) + ')'; ctx.fillRect(0, 0, Wd, Hd); KIT.text('YOU GOT EDGED OUT', Wd / 2, Hd * 0.4, { align: 'center', font: 'title', size: 34, col: '#c4121c', alpha: Math.min(1, G.deadT) }); }
  if (G.blk > 0) KIT.text('THE LIGHTS ARE OUT', Wd / 2, 20, { align: 'center', size: 6, col: '#ff2630' });
}

/* ---------- menus ---------- */
function ending() {
  G.mode = 'end'; hum(false); music.play('frdrone'); SV.won = (SV.won || 0) + 1; persist(); sfx.play('win');
  KIT.menu({ title: 'Daylight', html: '<p>The red corridor ends in a fire door. You hit the bar and fall out onto wet tarmac behind TB\'s Suck n\' Fuck, still holding your trousers up. Cum City. Real rain. A bin. Somewhere a neon sign buzzes in F sharp.</p><p style="color:#a6968f">Deaths ' + SV.deaths + ' · Notes found ' + Object.keys(SV.notes).length + ' of ' + NOTES.length + '</p>',
    items: [{ label: 'GO BACK IN', def: true, fn: function () { P = null; startLevel(0, true); } }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
function deadMenu() { KIT.menu({ title: 'Edged Out', sub: LV.n + ': ' + LV.name, items: [{ label: 'WAKE UP AGAIN', sub: 'Start this level over', def: true, fn: function () { var n = G.lv; P = null; startLevel(n, true); } }, { label: 'TITLE', back: true, fn: titleMenu }] }); }
function notesMenu() { var inPlay = G.mode === 'play'; KIT.menu({ title: 'Notes Found', wide: true, html: NOTES.map(function (s, i) { return '<p style="margin:4px 0;color:' + (SV.notes[i] ? '#f1e7d0' : '#4a1a1c') + '">' + (SV.notes[i] ? s : '???') + '</p>'; }).join(''), items: [{ label: 'BACK', back: true, fn: inPlay ? bagMenu : titleMenu }] }); }
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> left stick / WASD. <b>Look</b> right stick, the arrow keys or the mouse (click the picture). <b>B</b> or Shift sprint. <b>X</b> torch on and off. <b>Y</b> drink a Cumpuccino. <b>A</b> use.</p><p>Find the glowing EXIT door on each level. The Grinner only moves when you are not looking (keep your torch on it). Hounds hear you sprint. Steve moves when the lights go out. Sanity drains in the dark and near them: drink Cumpuccinos.</p>',
  items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') sysMenu(); else titleMenu(); } }] }); }
function optsMenu() { KIT.menu({ title: 'Options', items: [{ label: 'LOOK SPEED: ' + (SV.sens || 1).toFixed(1), fn: function () { SV.sens = (SV.sens || 1) >= 2 ? 0.5 : Math.round(((SV.sens || 1) + 0.25) * 100) / 100; persist(); optsMenu(); } }, R3.ok ? R3.resItem(optsMenu) : null, { label: 'BACK', back: true, fn: function () { if (G.mode === 'play') sysMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode !== 'play') return; bagMenu(); }
function titleMenu() {
  G.mode = 'title'; P = null; hum(false); music.play('frdrone');
  KIT.menu({ cls: 'clear', logo: '../assets/fr-logo.webp', title: 'The Fap Rooms', items: [{ label: SV.lv > 0 ? 'CARRY ON: ' + LEVELS[SV.lv].n : 'NOCLIP IN', cls: 'hot', def: true, fn: function () { startLevel(SV.lv || 0, true); } }, SV.lv > 0 ? { label: 'START OVER', fn: function () { startLevel(0, true); } } : null, { label: 'NOTES FOUND', fn: notesMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }] });
}
music.songs.frdrone = { bpm: 60, beats: 4, vol: 0.55, wet: 0.8, lead: 'soft', bass: 'drone', acc: 'bell', drums: null, chords: 'F#m F#m D D F#m F#m E E', mel: 'f#4 - - - - - - - | . . . . . . . . | a4 - - - - - g#4 - | . . . . . . . . | c#5 - - - - - - - | . . . . . . . . | b4 - - - a4 - - - | . . . . . . . .' };
music.songs.frrun = { bpm: 172, beats: 4, vol: 0.9, wet: 0.2, lead: 'fm', fmbass: 1, bass: 'pulse16', acc: 'stabs', drums: 'industrial', chords: 'Cm Cm Ab G Cm Cm Db G', mel: 'c5 . c5 . eb5 . c5 g5 | f#5 . g5 . c5 - - - | ab5 . ab5 . g5 . f5 eb5 | d5 - g4 - b4 - d5 - | c6 . c6 . bb5 . g5 eb5 | f#5 g5 eb5 c5 g4 - - - | db6 - c6 - ab5 - f5 - | g5 - b5 - d6 - g6 -' };
KIT.start({ w: W, h: H, flex: 720, update: update, draw: draw, onPause: pauseMenu, startPauses: true,
  pad: { sticks: true, btns: [{ k: 'a', label: 'A', sub: 'USE', cls: 'big' }, { k: 'b', label: 'B', sub: 'RUN' }, { k: 'x', label: 'X', sub: 'TORCH' }, { k: 'y', label: 'Y', sub: 'DRINK' }] },
  padKeys: { l: 'a', r: 'd', u: 'w', d: 's', a: 'z', b: 'x', x: 'c', y: 'v', lb: 'q', rb: 'e' } });
KIT.setKeymap({ ArrowLeft: 'sleft', ArrowRight: 'sright', ArrowUp: 'sup', ArrowDown: 'sdown', KeyF: 'x', KeyR: 'y', KeyE: 'a' });
titleMenu();
window.__fr = { G: G, get P() { return P; }, get ENTS() { return ENTS; }, get EXIT() { return EXIT; }, LEVELS: LEVELS, startLevel: startLevel, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, solid: solid, tx: tx, get MW() { return MW; }, get MH() { return MH; }, bfsFrom: bfsFrom, tileOf: tileOf };
