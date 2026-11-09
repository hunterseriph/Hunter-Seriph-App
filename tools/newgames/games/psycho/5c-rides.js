/* =====================================================================================================
   THE RIDES (his ask): you get out of Ejaculand on its own rides. The Load Flume in the dark with the pills playing
   tricks, the Haunted House on a rail cart, then the Crimson Coaster over the park, which comes off its rails at the
   end and throws you out at the edge of Clubhouse Row. You sit in the car (look round with the right stick, the
   torch goes where you look); things come at you and you have a moment to act: A shoves or hits, L ducks.
   Online both of you ride together; the host moves the car and each of you deals with what comes at you.
   ===================================================================================================== */
var RD = null, RIDEMESH = null, CARMESH = {};
function forceEv(k, len) { if (G.ev) endEvent(); G.ev = { k: k, t: 0, len: len || TRIPEV[k].len }; if (k === 'whisper') G.ev.s = WHISPERS[Math.floor(Math.random() * WHISPERS.length)]; if (k === 'ghost') G.ev.len = len || 3; }
function turtle(moves, x, y, z, a) { var P = [[x, y, z]]; moves.forEach(function (mv) { var n = Math.max(1, Math.ceil(mv[0] / 3)); for (var i = 0; i < n; i++) { a += (mv[1] || 0) * Math.PI / 180 / n; y += (mv[2] || 0) / n; x += Math.sin(a) * mv[0] / n; z += Math.cos(a) * mv[0] / n; P.push([x, y, z]); } }); return P; }
function samplePath(C) { // Catmull-Rom through the points, every half metre
  var raw = []; for (var i = 0; i < C.length - 1; i++) { var p0 = C[Math.max(0, i - 1)], p1 = C[i], p2 = C[i + 1], p3 = C[Math.min(C.length - 1, i + 2)];
    for (var s = 0; s < 8; s++) { var t = s / 8, t2 = t * t, t3 = t2 * t, q = [0, 1, 2].map(function (k) { return 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3); }); raw.push(q); } }
  raw.push(C[C.length - 1].slice()); var S = [], d = 0;
  for (var j = 0; j < raw.length; j++) { if (j) d += Math.hypot(raw[j][0] - raw[j - 1][0], raw[j][1] - raw[j - 1][1], raw[j][2] - raw[j - 1][2]); S.push({ x: raw[j][0], y: raw[j][1], z: raw[j][2], d: d }); }
  S.forEach(function (p, k) { var a = S[Math.max(0, k - 1)], b = S[Math.min(S.length - 1, k + 1)], h = Math.hypot(b.x - a.x, b.z - a.z) || 1; p.yaw = Math.atan2(b.x - a.x, b.z - a.z); p.pitch = Math.atan2(b.y - a.y, h); });
  return S;
}
function rideAt(d) { var S = RD.S, lo = 0, hi = S.length - 1; d = Math.max(0, Math.min(S[hi].d, d)); while (hi - lo > 1) { var m = (lo + hi) >> 1; if (S[m].d < d) lo = m; else hi = m; } var a = S[lo], b = S[hi], t = (d - a.d) / ((b.d - a.d) || 1);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, yaw: a.yaw + angDiff(b.yaw, a.yaw) * t, pitch: a.pitch + (b.pitch - a.pitch) * t }; }
/* the three rides: the path (a turtle walk: metres, turn, climb), where it is dark, and what happens along it */
var RIDES = {
  flume: { car: 'boat', speed: 3.3, w: 3.2, h: 3.6, wall: 'hauntw', floor: 'cream', roof: 'black', open: [190, 999], lamp: [1, 0.85, 0.5],
    moves: [[12, 0, 0], [22, 55, 0], [24, -95, 0], [10, 0, -3], [28, 125, 0], [22, -60, 0], [16, 0, 0], [26, 95, 0], [22, -95, 0], [14, 0, -9], [30, 0, 0]],
    ev: [[2, 'say', 'The log boat jerks off down the channel. The station lights die behind you.'], [8, 'dark', 5], [22, 'whisper'], [36, 'tbpop', -1, 9], [55, 'qte', 'a', 'CREAM HANDS! KEEP PRESSING A', 'hands', 5],
      [78, 'meat', 8], [96, 'say', 'Something is floating in the cream...'], [104, 'float'], [118, 'dark', 6], [120, 'laugh'], [138, 'qte', 'a', 'TB JUMPS FROM THE BANK! A: SHOVE HIM OFF', 'tb', 1], [160, 'neg'], [172, 'say', 'Light ahead. The channel tips over the edge...'], [176, 'drop'], [205, 'say', 'Splash down. The cart track of the Haunted House starts at the dock.']] },
  haunt: { car: 'cart', speed: 2.5, w: 3.4, h: 3.4, wall: 'hauntw', floor: 'wood', roof: 'black', open: [999, 999], lamp: [0.55, 1, 0.45],
    moves: [[10, 0, 0], [10, 90, 0], [12, -90, 0], [10, -90, 0], [14, 90, 0], [10, 90, 0], [10, -90, 0], [16, 0, 0], [10, 90, 0], [14, -90, 0], [12, -90, 0], [10, 90, 0], [12, 0, 0]],
    rooms: [[0, 'foyer'], [22, 'graves'], [46, 'mirrors'], [76, 'meat'], [104, 'clowns'], [136, 'out']],
    ev: [[3, 'say', 'The doors bang open. The cart rolls into the dark.'], [14, 'slam'], [26, 'ghost'], [40, 'qte', 'lb', 'L: DUCK!', 'blade', 14], [52, 'heads', 7], [64, 'ghost'], [80, 'qte', 'a', 'A BUTCHER IN THE MEAT! A: HIT HIM', 'butcher', 1], [96, 'meat', 6], [108, 'dark', 3], [112, 'qte', 'a', 'ONE OF THE CLOWNS IS TB! A: HIT HIM', 'tb', 1], [126, 'qte', 'lb', 'L: DUCK!', 'blade', 14], [142, 'say', 'The cart smashes out through the back doors, onto the coaster platform.']] },
  coaster: { car: 'coaster', speed: 3, w: 0, h: 0, open: [0, 999], lamp: [1, 0.2, 0.25], coaster: 1,
    moves: [[10, 0, 0], [44, 0, 24], [6, 0, 0], [26, 0, -26], [34, 180, 0], [22, 0, 9], [22, -120, -8], [26, 90, 5], [18, 0, -2], [24, 60, 0], [30, 0, 0]],
    ev: [[4, 'say', 'Click... click... click... up the lift hill.'], [30, 'say', 'From the top you can see it: Clubhouse Row, lit up red.'], [46, 'laugh'], [52, 'say', 'Down you go.'], [90, 'behind'], [124, 'qte', 'lb', 'L: DUCK!', 'beam', 16], [150, 'heads', 6], [178, 'say', 'THE TRACK ENDS!'], [190, 'derail']] }
};
function startRide(fi, how) {
  var th = FLOORS[fi], R = RIDES[th.ride]; G.fi = fi; FL = lvlBase(fi); FL.seen = new Uint8Array(MW * MH); FL.propAt = {}; FL.lockerAt = {}; FL.doorAt = {}; FL.doors = []; FL.cellLocked = 0; FL.start = { i: 0, j: 0, a: 0 }; FL.ride = 1;
  if (FRONTMESH) { FRONTMESH.free(); FRONTMESH = null; }
  var S = samplePath(turtle(R.moves, 0, R.coaster ? 2 : 0, 0, 0));
  RD = { id: th.ride, R: R, S: S, len: S[S.length - 1].d, d: 0, v: R.speed, t: 0, ev: 0, qte: null, pops: [], dark: 0, end: 0, fly: 0, hits: 0, behind: null };
  if (RIDEMESH) RIDEMESH.free(); RIDEMESH = buildRideMesh(RD);
  G.foes = []; G.loot = []; G.fx = []; G.shots = []; G.bags = []; G.burns = []; G.stash = null; G.keys = {}; G.tb = { x: -99, z: -99, st: 'gone', a: 0 }; G.ghost = null; if (G.ev) endEvent();
  var P = G.P; P.rca = 0; P.cp = -0.05; P.hide = null; P.aim = 0; P.atkT = -1; P.duck = 0;
  G.mode = 'ride'; G.banner = { s: th.name, t: 4 }; G.wake = 1.4; music.play(th.ride === 'coaster' ? 'pnchase' : 'pntitle');
  if (isHost()) netFloor(how);
}
function rideLights() { var out = [], d = RD.d, R = RD.R; if (RD.dark > 0) return out;
  // a lamp every 14 m (some dead), plus whatever the ride lights itself
  for (var k = Math.floor((d - 30) / 14) * 14; k < d + 50; k += 14) { if (k < 0 || k > RD.len) continue; if (((k / 14) | 0) % 3 === 2 && !R.coaster) continue; var p = rideAt(k), r = [-Math.cos(p.yaw), Math.sin(p.yaw)], sd = ((k / 14) | 0) % 2 ? 1 : -1;
    out.push({ x: p.x + r[0] * sd * (R.w ? R.w - 0.4 : 1.4), y: p.y + (R.coaster ? 1.5 : 2.6), z: p.z + r[1] * sd * (R.w ? R.w - 0.4 : 1.4), r: R.coaster ? 9 : 8, c: R.lamp, k: 1.3 * (((k / 14) | 0) % 5 === 1 ? 0.5 + Math.sin(KIT.t * 13) * 0.4 : 1.0), dd: Math.abs(k - d) }); }
  out.sort(function (a, b) { return a.dd - b.dd; }); return out.slice(0, 5);
}
function inOpen(d) { var o = RD.R.open; return d >= o[0] && d <= o[1]; }
function roomAt(d) { var r = RD.R.rooms, out = null; if (!r) return null; r.forEach(function (q) { if (d >= q[0]) out = q[1]; }); return out; }
function buildRideMesh(RD) {
  var m = new R3.Mesh(), R = RD.R, S = RD.S, rnd = srand(RD.len * 7 | 0);
  function vc(k) { var v = 0.5 * k; return [v, v, v]; }
  function boxM(x0, y0, z0, x1, y1, z1, T, k) { var c = vc(k || 1), cd = vc((k || 1) * 0.75), U = [0, 1, 1, 1, 1, 0, 0, 0];
    m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 0, 1, 0, 1, 1, 0, 1], T, c, [0, 1, 0]); m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], U, T, cd, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], U, T, cd, [0, 0, -1]);
    m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], U, T, cd, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], U, T, cd, [-1, 0, 0]); }
  function quadAt(a, b, sa, sb, ya0, ya1, T, k, n) { m.quad([a.x + a.r[0] * sa, a.y + ya0, a.z + a.r[1] * sa], [b.x + b.r[0] * sb, b.y + ya0, b.z + b.r[1] * sb], [b.x + b.r[0] * sb, b.y + ya1, b.z + b.r[1] * sb], [a.x + a.r[0] * sa, a.y + ya1, a.z + a.r[1] * sa], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(k), n); }
  var step = 2, P = []; for (var i = 0; i < S.length; i += step) { var p = S[i]; P.push({ x: p.x, y: p.y, z: p.z, d: p.d, yaw: p.yaw, r: [-Math.cos(p.yaw), Math.sin(p.yaw)] }); }
  for (var k = 0; k < P.length - 1; k++) { var a = P[k], b = P[k + 1], open = inOpen(a.d), room = roomAt(a.d), W = R.w;
    if (R.coaster) { // the track on its lattice, high over the dead park
      quadAt(a, b, -0.75, -0.75, 0, 0, TL('rail'), 1); m.quad([a.x - a.r[0] * 0.75, a.y, a.z - a.r[1] * 0.75], [a.x + a.r[0] * 0.75, a.y, a.z + a.r[1] * 0.75], [b.x + b.r[0] * 0.75, b.y, b.z + b.r[1] * 0.75], [b.x - b.r[0] * 0.75, b.y, b.z - b.r[1] * 0.75], [0, 0, 1, 0, 1, 1, 0, 1], TL('rail'), vc(1), [0, 1, 0]);
      if (k % 3 === 0 && a.y > 1 && a.d < RD.len - 22) boxM(a.x - 0.18, -0.2, a.z - 0.18, a.x + 0.18, a.y - 0.1, a.z + 0.18, TL('lattice'), 1);
      continue; }
    var fl = R.floor === 'cream' ? -0.35 : 0;
    // the floor (the cream of the flume sits low between wooden sides)
    m.quad([a.x - a.r[0] * W, a.y + fl, a.z - a.r[1] * W], [a.x + a.r[0] * W, a.y + fl, a.z + a.r[1] * W], [b.x + b.r[0] * W, b.y + fl, b.z + b.r[1] * W], [b.x - b.r[0] * W, b.y + fl, b.z - b.r[1] * W], [0, 0, 1, 0, 1, 1, 0, 1], TL(R.floor === 'cream' ? (open ? 'cream' : 'cream') : room === 'graves' ? 'dirt' : room === 'meat' ? 'grate' : 'wood'), vc(R.floor === 'cream' ? 0.9 : 0.8), [0, 1, 0]);
    if (R.floor === 'cream') { [-1, 1].forEach(function (sd) { quadAt(a, b, sd * 1.4, sd * 1.4, fl, 0.25, TL('wood'), 0.7); m.quad([a.x + a.r[0] * sd * 1.4, a.y + 0.25, a.z + a.r[1] * sd * 1.4], [b.x + b.r[0] * sd * 1.4, b.y + 0.25, b.z + b.r[1] * sd * 1.4], [b.x + b.r[0] * sd * W, b.y + 0.25, b.z + b.r[1] * sd * W], [a.x + a.r[0] * sd * W, a.y + 0.25, a.z + a.r[1] * sd * W], [0, 0, 1, 0, 1, 1, 0, 1], TL(open ? 'grass' : 'concf'), vc(0.7), [0, 1, 0]); }); }
    else { quadAt(a, b, -0.6, -0.6, 0.02, 0.02, TL('rail'), 1); }
    if (open) { if (k % 2 === 0) [-1, 1].forEach(function (sd) { var tx0 = a.x + a.r[0] * sd * (W + 2 + rnd() * 5), tz0 = a.z + a.r[1] * sd * (W + 2 + rnd() * 5); boxM(tx0 - 0.2, a.y - 4, tz0 - 0.2, tx0 + 0.2, a.y + 7, tz0 + 0.2, TL('bark'), 0.7); boxM(tx0 - 1.4, a.y + 3, tz0 - 1.4, tx0 + 1.4, a.y + 6.5, tz0 + 1.4, TL('leaves'), 0.6); }); continue; }
    var wt = TL(room === 'meat' ? 'meat' : room === 'mirrors' ? 'mirror' : room === 'graves' ? 'rockt' : room === 'clowns' ? 'polka' : R.wall), H = R.h;
    [-1, 1].forEach(function (sd) { quadAt(a, b, sd * W, sd * W, R.floor === 'cream' ? 0.25 : 0, H, wt, room === 'mirrors' ? 1.2 : 0.75, null); });
    m.quad([a.x + a.r[0] * W, a.y + H, a.z + a.r[1] * W], [a.x - a.r[0] * W, a.y + H, a.z - a.r[1] * W], [b.x - b.r[0] * W, b.y + H, b.z - b.r[1] * W], [b.x + b.r[0] * W, b.y + H, b.z + b.r[1] * W], [0, 0, 1, 0, 1, 1, 0, 1], TL(R.roof), vc(0.6), [0, -1, 0]);
    // dressing for each room of the haunted house, and pipes and drips in the flume
    if (k % 3 === 1) { var sd2 = rnd() < 0.5 ? -1 : 1, px = a.x + a.r[0] * sd2 * (W - 0.6), pz = a.z + a.r[1] * sd2 * (W - 0.6);
      if (room === 'graves') { boxM(px - 0.3, a.y, pz - 0.3, px + 0.3, a.y + 1.1, pz + 0.3, TL('grave'), 0.9); }
      else if (room === 'meat') { boxM(px - 0.25, a.y + 0.9, pz - 0.25, px + 0.25, a.y + 2.2, pz + 0.25, TL('meat'), 1); boxM(px - 0.02, a.y + 2.2, pz - 0.02, px + 0.02, a.y + H, pz + 0.02, TL('steel'), 0.8); }
      else if (room === 'clowns') { boxM(px - 0.3, a.y, pz - 0.3, px + 0.3, a.y + 1.3, pz + 0.3, TL('polka'), 0.8); boxM(px - 0.25, a.y + 1.3, pz - 0.25, px + 0.25, a.y + 1.8, pz + 0.25, TL('clownskin'), 0.8); boxM(px - 0.32, a.y + 1.7, pz - 0.32, px + 0.32, a.y + 1.95, pz + 0.32, TL('wigred'), 0.8); }
      else if (room === 'foyer') { boxM(px - 0.15, a.y + 1.2, pz - 0.5, px + 0.15, a.y + 2.4, pz + 0.5, TL('wallpaper'), 0.8); }
      else if (R.floor === 'cream') { boxM(px - 0.08, a.y + H - 0.5, pz - 0.08, px + 0.08, a.y + H, pz + 0.08, TL('pipe'), 0.8); } }
  }
  // the station at the start and a dock at the end
  [0, P.length - 1].forEach(function (n) { var p = P[n]; if (R.coaster && n) return; boxM(p.x - 4, p.y - 0.3 + (R.coaster ? -0.6 : 0), p.z - 4, p.x + 4, p.y - 0.25 + (R.coaster ? -0.6 : 0), p.z + 4, TL('wood'), 0.7); });
  if (R.coaster) { // the dead park far below and Clubhouse Row on the skyline
    var c0 = P[0]; m.quad([c0.x - 300, -0.2, c0.z - 300], [c0.x + 300, -0.2, c0.z - 300], [c0.x + 300, -0.2, c0.z + 300], [c0.x - 300, -0.2, c0.z + 300], [0, 0, 60, 0, 60, 60, 0, 60], TL('grass'), vc(0.45), [0, 1, 0]);
    for (var b2 = 0; b2 < 60; b2++) { var ang = b2 / 60 * 6.283, rr = 30 + rnd() * 50, bx = c0.x + Math.sin(ang) * rr, bz = c0.z + 60 + Math.cos(ang) * rr; if (Math.hypot(bx - c0.x, bz - c0.z) < 12) continue; var hh = 2.5 + rnd() * 3; boxM(bx - 2, -0.2, bz - 2, bx + 2, hh, bz + 2, TL(rnd() < 0.5 ? 'boards' : 'stripes'), 0.6); }
    for (var c = 0; c < 70; c++) { var cx = c0.x - 160 + c * 5 + rnd() * 3, cz = c0.z + 230 + rnd() * 30, ch = 10 + rnd() * 30; boxM(cx - 2, -0.2, cz - 2, cx + 2, ch, cz + 2, TL('windows'), 0.9); }
    var last = P[P.length - 1]; boxM(last.x - 0.2, -0.2, last.z - 0.2, last.x + 0.2, last.y - 2, last.z + 0.2, TL('lattice'), 1); } // the snapped end
  return m.upload();
}
function carMesh(k) { if (CARMESH[k]) return CARMESH[k]; var m = new R3.Mesh();
  function vc(q) { var v = 0.5 * q; return [v, v, v]; }
  function boxM(x0, y0, z0, x1, y1, z1, T, q) { var c = vc(q || 1), cd = vc((q || 1) * 0.75), U = [0, 1, 1, 1, 1, 0, 0, 0];
    m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 0, 1, 0, 1, 1, 0, 1], T, c, [0, 1, 0]); m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], U, T, cd, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], U, T, cd, [0, 0, -1]);
    m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], U, T, cd, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], U, T, cd, [-1, 0, 0]); }
  if (k === 'boat') { boxM(-1, -0.3, -1.6, 1, 0.45, 1.6, TL('bark'), 0.8); boxM(-0.8, 0.0, -1.4, 0.8, 0.46, 1.3, TL('black'), 1); boxM(-0.7, -0.3, 1.6, 0.7, 0.4, 2.1, TL('bark'), 0.7); boxM(-0.85, 0.2, -0.2, 0.85, 0.5, 0.0, TL('wood'), 0.8); }
  else if (k === 'cart') { boxM(-0.9, 0.1, -1.2, 0.9, 0.85, 1.2, TL('black'), 1); boxM(-0.95, 0.75, -1.25, 0.95, 0.9, 1.25, TL('carpaint'), 0.4); boxM(-0.7, 0.3, -0.9, 0.7, 0.86, 0.6, TL('velvet'), 0.8); boxM(-0.9, 0.85, 0.9, 0.9, 1.5, 1.2, TL('black'), 1); }
  else if (k === 'coaster') { boxM(-0.85, 0.1, -1.4, 0.85, 0.8, 1.4, TL('carpaint'), 0.45); boxM(-0.7, 0.3, -1.1, 0.7, 0.82, 0.9, TL('black'), 1); boxM(-0.9, 0.75, 1.1, 0.9, 1.3, 1.45, TL('carpaint'), 0.4); boxM(-0.7, 1.05, -0.1, 0.7, 1.12, 0.0, TL('steel'), 0.9); [-0.6, 0.6].forEach(function (x) { boxM(x - 0.1, -0.05, -1.1, x + 0.1, 0.15, -0.9, TL('steel'), 0.8); boxM(x - 0.1, -0.05, 0.9, x + 0.1, 0.15, 1.1, TL('steel'), 0.8); }); }
  else if (k === 'car') { // the getaway car: a long black saloon with red stripes
    boxM(-0.95, 0.3, -2.2, 0.95, 0.95, 2.2, TL('black'), 1); boxM(-0.97, 0.6, -2.22, 0.97, 0.7, 2.22, TL('carpaint'), 0.45); boxM(-0.85, 0.95, -1.0, 0.85, 1.5, 0.9, TL('windscreen'), 0.9);
    [[-0.85, -1.4], [0.85, -1.4], [-0.85, 1.4], [0.85, 1.4]].forEach(function (w) { boxM(w[0] - 0.14, 0, w[1] - 0.36, w[0] + 0.14, 0.62, w[1] + 0.36, TL('black'), 0.6); });
    boxM(-0.8, 0.55, 2.2, -0.45, 0.75, 2.24, TL('glow'), 1.3); boxM(0.45, 0.55, 2.2, 0.8, 0.75, 2.24, TL('glow'), 1.3); boxM(-0.8, 0.55, -2.24, -0.5, 0.7, -2.2, TL('carpaint'), 0.6); boxM(0.5, 0.55, -2.24, 0.8, 0.7, -2.2, TL('carpaint'), 0.6); }
  CARMESH[k] = m.upload(); return CARMESH[k];
}
/* ---------- riding ---------- */
function stepRide(dt) {
  var I = inputs(), P = G.P, R = RD.R; RD.t += dt; RD.dark = Math.max(0, RD.dark - dt);
  P.rca = Math.max(-2.6, Math.min(2.6, P.rca - I.lx * dt * 2.4)); P.cp = Math.max(-0.7, Math.min(0.5, P.cp - I.ly * dt * 1.5)); if (!I.lx) P.rca *= 1 - dt * 0.35;
  P.hurtT = Math.max(0, P.hurtT - dt); P.duck = Math.max(0, P.duck - dt); if (I.crouch) P.duck = 0.9;
  // the QTE: slow time a little, wait for the button
  var Q = RD.qte; if (Q) { Q.t += dt; var hit = Q.key === 'lb' ? P.duck > 0 : I.use; if (hit) { Q.n--; if (Q.key === 'a') { sfx.play('thud'); KIT.shake(3); } if (Q.n <= 0) { RD.qte = null; say(Q.who === 'blade' || Q.who === 'beam' ? 'It whistles over your head.' : 'Got it off you!', 2, '#ffe36a'); sfx.play(Q.key === 'lb' ? 'swing' : 'bonk'); if (Q.pop) Q.pop.t = 0.3; } }
    if (RD.qte && Q.t > Q.len) { RD.qte = null; hurtPlayer(P, Q.dmg, null, Q.who === 'tb' ? 0.6 : 0.2); say(Q.who === 'tb' ? 'TB gets his hands on you before you shove him off.' : Q.who === 'hands' ? 'The hands drag at you. Something sharp.' : 'It catches you.', 2.5, '#c4121c'); if (Q.pop) Q.pop.t = 0.3; if (Q.who === 'tb') { subtitle('TB', tbLine()); sfx.play('tblaugh'); } } }
  if (P.dead) return;
  if (!isGuest()) {
    var pp = rideAt(RD.d), slope = Math.sin(pp.pitch), want = R.speed;
    if (R.coaster) { if (RD.d < 56) want = Math.max(2.6, RD.v); RD.v = RD.d < 56 ? 2.8 : Math.max(5, RD.v - slope * 9.8 * dt * 1.4 - RD.v * 0.03 * dt); }
    else { RD.v += ((want - slope * 9) - RD.v) * Math.min(1, dt * 1.5); RD.v = Math.max(1.4, RD.v); }
    var slow = RD.qte ? 0.35 : 1; if (!RD.fly) RD.d += RD.v * dt * slow;
    while (RD.ev < R.ev.length && RD.d >= R.ev[RD.ev][0]) { rideEvent(R.ev[RD.ev]); RD.ev++; }
    if (RD.fly) { RD.fly += dt; if (RD.fly > 2.6 && !RD.end) { RD.end = 1; KIT.flash(1); KIT.shake(16); sfx.play('boom'); G.mode = 'trans'; G.trans = 0; G.transTo = G.fi + 1; netEv({ k: 'climb' }); } }
    else if (RD.d >= RD.len - 0.2 && !RD.end) { RD.end = 1; G.mode = 'trans'; G.trans = 0; G.transTo = G.fi + 1; music.stop(1); sfx.play('door'); netEv({ k: 'climb' }); }
  }
  RD.pops.forEach(function (o) { o.t -= dt; }); RD.pops = RD.pops.filter(function (o) { return o.t > 0; });
  if (RD.behind) { RD.behind.t -= dt; if (Math.abs(angDiff(P.rca, Math.PI)) < 0.9 && !RD.behind.seen) { RD.behind.seen = 1; RD.behind.t = 0.6; sfx.play('sting'); subtitle('TB', tbLine(), 2.5); } if (RD.behind.t <= 0) { if (!RD.behind.seen) { hurtPlayer(P, 10, null, 0.5); say('Hands round your neck from the seat behind. Then nothing there.', 3, '#c4121c'); } RD.behind = null; } }
  stepTrip(dt); stepFx(dt); stepBags(dt);
  if (Math.random() < dt * (R.coaster ? 3 : 1.5)) sfx.play(R.floor === 'cream' ? 'drip' : 'clack', 0.4);
}
function rideEvent(e) { var k = e[1], P = G.P;
  if (k === 'say') sayAll(e[2], 4);
  else if (k === 'dark') { RD.dark = e[2]; sfx.play('sting'); netEv({ k: 'rdark', t: e[2] }); }
  else if (k === 'laugh') { sfx.play('tblaugh'); netEv({ k: 'sfx', n: 'tblaugh' }); }
  else if (k === 'whisper' || k === 'meat' || k === 'neg' || k === 'heads') { forceEv(k, e[2]); netEv({ k: 'forceev', e: k, len: e[2] }); }
  else if (k === 'tbpop') { RD.pops.push({ d: RD.d + e[3], side: e[2], t: 7, who: 'tbclown', wave: 1 }); sfx.play('honk'); netEv({ k: 'rpop', d: RD.d + e[3], side: e[2], who: 'tbclown' }); }
  else if (k === 'ghost') { RD.pops.push({ d: RD.d + 5, side: Math.random() < 0.5 ? -1 : 1, t: 3, who: 'sheet', drop: 1 }); sfx.play('scream'); netEv({ k: 'rpop', d: RD.d + 5, side: 1, who: 'sheet' }); }
  else if (k === 'float') { RD.pops.push({ d: RD.d + 6, side: 0.3, t: 6, who: 'body' }); }
  else if (k === 'slam') { sfx.play('door'); KIT.shake(4); sayAll('A door slams somewhere behind the cart.', 2.5); }
  else if (k === 'qte') { startQte(e[2], e[3], e[4], e[5]); netEv({ k: 'qte', key: e[2], s: e[3], who: e[4], dmg: e[5] }); }
  else if (k === 'drop') { RD.v += 4; sfx.play('scream'); }
  else if (k === 'behind') { RD.behind = { t: 4.5 }; sfx.play('tblaugh'); say('Someone is breathing in the seat behind you...', 3, '#ff4a8a'); netEv({ k: 'rbehind' }); }
  else if (k === 'derail') { RD.fly = 0.01; sfx.play('scrape'); sfx.play('scream'); KIT.shake(10); sayAll('The car leaves the rails...', 3, '#c4121c'); netEv({ k: 'rfly' }); }
}
function startQte(key, s, who, dmg) { var Q = RD.qte = { key: key, s: s, who: who, dmg: who === 'tb' ? 16 : who === 'butcher' ? 14 : 12, n: key === 'a' && who === 'hands' ? dmg : 1, t: 0, len: key === 'lb' ? 1.6 : who === 'hands' ? 3.2 : 1.9 };
  if (who === 'tb' || who === 'butcher') Q.pop = { d: RD.d + 3.2, side: Math.random() < 0.5 ? -1 : 1, t: 9, who: who === 'tb' ? 'tbclown' : 'butcher', lunge: 1 }, RD.pops.push(Q.pop);
  if (who === 'hands') { Q.pop = { d: RD.d + 1, side: 0.9, t: 9, who: 'hands' }; RD.pops.push(Q.pop); }
  if (who === 'blade' || who === 'beam') { Q.pop = { d: RD.d + 4.5, side: 0, t: 9, who: who }; RD.pops.push(Q.pop); }
  sfx.play('sting'); }
/* ---------- drawing a ride ---------- */
function seatPose(rig) { var Q = pose0(), D = RIGS[rig].D; Q.y = -D.lu * 0.95; Q.hip = [1.45, 1.45]; Q.kn = [1.5, 1.5]; Q.sh = [[0.5, 0.15], [0.5, 0.15]]; Q.el = [0.9, 0.9]; return Q; }
function drawRide() {
  var P = G.P, R = RD.R, T = tripLook(), d = RD.d, p = rideAt(d), fly = RD.fly;
  var base = [p.x, p.y, p.z], yaw = p.yaw, pitch = p.pitch;
  if (fly) { var t = fly; base = [p.x + Math.sin(yaw) * RD.v * t, p.y + 4 * t - 5 * t * t, p.z + Math.cos(yaw) * RD.v * t]; pitch = -0.4 * t; }
  var la = yaw + P.rca, f = [Math.sin(la) * Math.cos(P.cp + pitch * 0.5), Math.sin(P.cp + pitch * 0.5), Math.cos(la) * Math.cos(P.cp + pitch * 0.5)];
  var duck = P.duck > 0 ? 0.5 : 0, seat = [base[0], base[1] + 0.55 - duck * 0.4, base[2]];
  var rgt = [-Math.cos(la), Math.sin(la)], eye = [seat[0] - f[0] * 1.9 + rgt[0] * 0.75, seat[1] + 1.45 - duck * 0.3, seat[2] - f[2] * 1.9 + rgt[1] * 0.75]; if (R.h) eye[1] = Math.min(eye[1], base[1] + R.h - 0.3);
  var fog = FLOORS[G.fi].fog; if (T.meat > 0.2) fog = [0.12 * T.meat, 0.01, 0.02];
  R3.begin(fog); R3.setCam(eye, [eye[0] + f[0] * 8, eye[1] + f[1] * 8, eye[2] + f[2] * 8], T.fov * (KIT.W < KIT.H ? 1.3 : 1), upVec(T.roll, f));
  var lights = rideLights(); RD.pops.forEach(function (o) { if (o.who === 'tbclown' && o.wave) { var q = rideAt(o.d), r = [-Math.cos(q.yaw), Math.sin(q.yaw)]; lights.push({ x: q.x + r[0] * o.side * 2.2, y: q.y + 2.6, z: q.z + r[1] * o.side * 2.2, r: 4, c: [1, 0.2, 0.2], k: 1.2 }); } });
  var amb = FLOORS[G.fi].amb, dk = RD.dark > 0 ? 0.25 : 2.4, tk = 1.9 * (RD.dark > 0 && Math.sin(KIT.t * 23) > 0.6 ? 0.2 : 1);
  R3.scene({ fog: fog, fogR: R.coaster ? [30, 160] : inOpen(d) ? [12, 60] : [6, 26], amb: [amb[0] * 1.6 * dk, amb[1] * 1.6 * dk, amb[2] * 1.6 * dk], lights: lights, torch: { p: [seat[0] + f[0] * 0.3, seat[1] + 0.85, seat[2] + f[2] * 0.3], d: f, c: [tk, tk * 0.92, tk * 0.76] }, t: KIT.t, warp: T.warp, hue: T.hue, meat: T.meat, neg: T.neg });
  R3.draw(RIDEMESH, ATT, { tint: T.tint });
  var cm = R3.model(base[0], base[1], base[2], yaw, -pitch, 0); R3.draw(carMesh(R.car), ATT, { m: cm, tint: T.tint });
  var heads = G.ev && G.ev.k === 'heads', who = P.who === 'lab' ? 'laboozie' : 'cumhead', rr = [-Math.cos(yaw), Math.sin(yaw)], side = G.R ? (isGuest() ? -0.4 : 0.4) : 0;
  function rider(rig, sd, pl) { var Q = seatPose(rig); if (pl.duck > 0) { Q.lean = 0.9; Q.y -= 0.15; } if (pl.hurtT > 0) poseHurt(Q, pl.hurtT * 2.5); Q.hy = pl === P ? Math.max(-1.2, Math.min(1.2, P.rca)) : 0; drawRig(RIGS[rig], base[0] + rr[0] * sd, base[1] + 0.55, base[2] + rr[1] * sd, yaw, Q, { noShadow: 1, tint: T.tint, head: heads && pl !== P ? RIGS.tbmad.P.head : null }); }
  rider(who, side, P); if (G.R) rider(G.R.who === 'lab' ? 'laboozie' : 'cumhead', -side, G.R);
  RD.pops.forEach(function (o) { var q = rideAt(o.d), r = [-Math.cos(q.yaw), Math.sin(q.yaw)], off = o.side * (o.lunge ? Math.max(0.9, 2.4 - (9 - o.t) * 1.3) : 2.2), x = q.x + r[0] * off, z = q.z + r[1] * off, a = Math.atan2(base[0] - x, base[2] - z), Q = pose0();
    if (o.who === 'tbclown' || o.who === 'butcher') { if (o.lunge) poseGrab(Q, 1); else if (o.wave) { Q.sh[0] = [2.6, 0.2 + Math.sin(KIT.t * 8) * 0.3, 0]; Q.el[0] = 0.4; } drawRig(o.who === 'tbclown' ? RIGS.tbclown : RIGS.butcher, x, q.y + (R.floor === 'cream' ? 0.25 : 0), z, a, Q, { tint: T.tint, alpha: o.t < 0.3 ? o.t / 0.3 : 1 }); }
    else if (o.who === 'body') { poseDown(Q, 1, 1); drawRig(RIGS.gimp, x, q.y - 0.3, z, q.yaw, Q, { tint: T.tint, noShadow: 1 }); } });
  if (RD.behind && !RD.behind.seen || RD.behind && RD.behind.t > 0) { var bx = base[0] - Math.sin(yaw) * 1.5, bz = base[2] - Math.cos(yaw) * 1.5, Q2 = seatPose('tbclown'); Q2.sh[0] = [1.6, 0.1, 0.2]; Q2.sh[1] = [1.6, 0.1, -0.2]; drawRig(RIGS.tbclown, bx, base[1] + 0.55, bz, yaw, Q2, { noShadow: 1, tint: T.tint }); }
  var m = DYN || (DYN = new R3.Mesh()); m.clear();
  RD.pops.forEach(function (o) { var q = rideAt(o.d), r = [-Math.cos(q.yaw), Math.sin(q.yaw)];
    if (o.who === 'sheet') bill(m, q.x + r[0] * o.side * 1.2, q.y + 1.2 + Math.max(0, o.t - 1.5) * 1.2, q.z + r[1] * o.side * 1.2, 0.7, 0.9, TL('ghost'), [0.5, 0.5, 0.5], 0.6);
    else if (o.who === 'hands') for (var h = 0; h < 6; h++) { var sd = h % 2 ? 1 : -1; bill(m, base[0] + rr[0] * sd * (0.95 + Math.sin(KIT.t * 5 + h) * 0.1) + Math.sin(yaw) * (h - 2.5) * 0.4, base[1] + 0.25 + Math.abs(Math.sin(KIT.t * 3 + h)) * 0.4, base[2] + rr[1] * sd * 0.95 + Math.cos(yaw) * (h - 2.5) * 0.4, 0.22, 0.34, TL('creamhand'), [0.5, 0.5, 0.5], 0.2); }
    else if (o.who === 'blade' || o.who === 'beam') { var sw = o.who === 'blade' ? Math.sin(KIT.t * 4) * 1.2 : 0, cx = q.x + r[0] * sw, cz = q.z + r[1] * sw, yy = q.y + 1.55; m.quad([cx - r[0] * 1.6, yy - 0.08, cz - r[1] * 1.6], [cx + r[0] * 1.6, yy - 0.08, cz + r[1] * 1.6], [cx + r[0] * 1.6, yy + 0.12, cz + r[1] * 1.6], [cx - r[0] * 1.6, yy + 0.12, cz - r[1] * 1.6], [0, 1, 1, 1, 1, 0, 0, 0], TL(o.who === 'blade' ? 'steel' : 'rust'), [0.5, 0.5, 0.5], [0, 1, 0], 0.2); } });
  drawBagsFx(m); R3.draw(m, ATT, { tint: T.tint });
}
