/* =====================================================================================================
   THE HENCHMEN'S ROOMS (his ask: bosses get their own separate room, and TB can't get you while you fight one).
   Reaching the way on of a part with a henchman takes you into that henchman's own room instead: a big square
   space with four pillars for cover, the henchman waiting at the far end and the way on behind them. TB stays out.
   Kill them and the way on opens; walk through it to the next part of the night.
   ===================================================================================================== */
var ARENA = {
  bar: { n: "MAMA'S NURSERY", mesh: null, floor: 'checker', wall: 'wallpaper', lamp: [1, 0.6, 0.7] },
  woods: { n: "THE STAG'S CLEARING", mesh: 'woods', floor: 'grass', lamp: [1, 0.55, 0.25] },
  park: { n: 'THE BIG TOP', mesh: 'yard', wall: 'stripes', wh: 7, floor: 'dirt', lamp: [1, 0.3, 0.3] },
  cemetery: { n: "THE BRIDE'S CHAPEL", mesh: 'yard', wall: 'crypt', wh: 8, floor: 'stonef', lamp: [0.7, 0.85, 1] },
  district: { n: "THE SISSIFIER'S PARLOUR", mesh: 'district', floor: 'asphalt', lamp: [1, 0.3, 0.65] }
};
var ARENASIZE = 27;
function genHenchArena(fi, seed) {
  var rnd = srand((seed ^ 0x5eed) >>> 0), th = FLOORS[fi], A = ARENA[th.id] || ARENA.bar, F = lvlBase(fi), K = F.K, a = 3, b = MW - 4, mid = MW >> 1;
  F.arena = 1; F.meshKind = A.mesh; F.BT = {}; F.BH = {}; F.FT = {}; F.doorRoom = {};
  var indoor = !th.kind, R = { id: 0, x: a, y: a, w: b - a + 1, h: b - a + 1, open: 1, doors: [] }; if (indoor) F.rooms.push(R);
  for (var j = a; j <= b; j++) for (var i = a; i <= b; i++) { K[idx(i, j)] = indoor ? KR : KC; if (indoor) F.RM[idx(i, j)] = 0; if (!indoor) F.FT[idx(i, j)] = A.floor; }
  if (A.wall) for (var j2 = 0; j2 < MH; j2++) for (var i2 = 0; i2 < MW; i2++) if (K[idx(i2, j2)] === KW) { F.BT[idx(i2, j2)] = A.wall; F.BH[idx(i2, j2)] = A.wh || 6; }
  // four pillars to hide behind
  [[a + 5, a + 6], [b - 6, a + 6], [a + 5, b - 7], [b - 6, b - 7]].forEach(function (p) { for (var y = 0; y < 2; y++) for (var x = 0; x < 2; x++) { var k = idx(p[0] + x, p[1] + y); K[k] = KW; F.RM[k] = -1; if (A.wall) { F.BT[k] = A.wall; F.BH[k] = A.wh || 6; } } });
  // the way in (behind you) and the way on (behind the henchman)
  for (var e = 1; e < a; e++) { K[idx(mid, e)] = indoor ? KR : KC; K[idx(mid + 1, e)] = indoor ? KR : KC; if (indoor) { F.RM[idx(mid, e)] = 0; F.RM[idx(mid + 1, e)] = 0; } }
  F.exitIn = { i: mid, j: a }; F.exitZone = [mid, 1, mid + 1, 2];
  F.start = { i: mid, j: b - 1, a: Math.PI }; F.start2 = { i: mid + 1, j: b - 1 }; F.respawn = F.start; F.cellIn = F.start; F.tb = { i: mid, j: b }; F.tbIn = F.start;
  F.foes.push({ i: mid, j: a + 4, k: th.hench, boss: 1 });
  // light: a ring of lamps and the way on glowing
  [[a + 2, a + 2], [b - 2, a + 2], [a + 2, b - 2], [b - 2, b - 2], [mid, mid], [mid, a + 3], [mid, b - 3]].forEach(function (p, n) { F.lights.push({ i: p[0], j: p[1], k: n === 4 ? 1.5 : 1.15, r: 11, fl: n === 1 ? 1 : 0, c: A.lamp, y: indoor ? undefined : 3.8, pole: !indoor && th.kind !== 'woods' ? 1 : 0, room: indoor ? 1 : 0, lantern: th.kind === 'woods' ? 1 : 0 }); });
  F.lights.push({ i: mid + 0.5, j: 1.2, k: 1.6, r: 7, fl: 0, c: [1, 0.12, 0.1], y: 2.4, exit: 1 });
  if (th.kind === 'district') for (var n2 = 0; n2 < 12; n2++) { var side = n2 % 4, s = a + 2 + Math.floor(rnd() * (b - a - 4)); F.neons.push({ i: side === 0 ? a : side === 1 ? b : s, j: side === 2 ? a : side === 3 ? b : s, d: side === 0 ? 1 : side === 1 ? 0 : side === 2 ? 3 : 2, k: ['n_girls', 'n_xxx', 'n_lips', 'n_heart', 'n_peep', 'n_cum'][n2 % 6], y: 3.4 + rnd() * 1.6, o: 0 }); }
  if (th.kind === 'park') for (var n3 = 0; n3 < 8; n3++) { var a3 = n3 / 8 * 6.283, r3 = (b - a) * 0.36; F.props.push({ i: Math.round(mid + Math.cos(a3) * r3), j: Math.round(mid + Math.sin(a3) * r3), k: n3 % 2 ? 'barrier' : 'popcorn', a: a3 }); } // the ring's edge
  F.props.forEach(function (p) { K[idx(p.i, p.j)] = KP; });
  // something to keep you going, by the way in
  ['cracker', 'cuppa', 'ammo9', 'shells'].forEach(function (k, n) { F.loot.push({ i: mid - 2 + n + (n > 1 ? 1 : 0), j: b - 2, k: k }); });
  if (indoor) { F.decals = []; for (var d = 0; d < 30; d++) { var di = a + Math.floor(rnd() * (b - a + 1)), dj = a + Math.floor(rnd() * (b - a + 1)); if (K[idx(di, dj)] === KR) F.decals.push({ i: di, j: dj, d: -1, k: rnd() < 0.5 ? 'blood1' : 'blood2', s: 0.8 + rnd(), o: rnd() * 6.28 }); }
    for (var w = a; w <= b; w += 2) [[w, a, 3], [w, b, 2], [a, w, 1], [b, w, 0]].forEach(function (q) { if (K[idx(q[0], q[1])] === KR && rnd() < 0.5) F.decals.push({ i: q[0], j: q[1], d: q[2], k: th.deco[Math.floor(rnd() * th.deco.length)], y: 0.8 + rnd(), s: 0.8 + rnd() * 0.5, o: 0 }); });
    F.clutter = []; for (var c = 0; c < 40; c++) { var ci = a + Math.floor(rnd() * (b - a + 1)), cj = a + Math.floor(rnd() * (b - a + 1)); if (K[idx(ci, cj)] === KR) F.clutter.push({ i: ci, j: cj, k: ['bottles', 'rags', 'bones', 'paper', 'candles', 'glasses'][c % 6], d: -1, o: rnd() * 6.28, s: rnd() }); } }
  return F;
}
/* ---------- a clear way to every door (he found things blocking the ways into rooms) ----------
   Runs on every level as it loads: anything solid (a prop, a locker, a dumpster, a coffin) standing on either side
   of a door is taken away, and if any open ground still cannot be reached, whatever stands between it and the rest
   is taken away too. */
function clearDoors(F) {
  var K = F.K, removed = 0;
  function ground(k) { return F.RM[k] >= 0 ? KR : KC; }
  function free(i, j) { if (!inMap(i, j)) return; var k = idx(i, j), kk = K[k];
    if (kk === KP) { F.props = F.props.filter(function (p) { return !(p.i === i && p.j === j); }); K[k] = ground(k); removed++; }
    else if (kk === KL) { F.lockers = F.lockers.filter(function (L) { return !(L.i === i && L.j === j); }); K[k] = ground(k); removed++; } }
  for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) { var kd = K[idx(i, j)]; if (kd !== KD && kd !== KB) continue;
    DIRS.forEach(function (q) { var a = i + q[0], b = j + q[1]; if (!inMap(a, b)) return; var kn = K[idx(a, b)]; if (kn === KP || kn === KL) free(a, b); if (kn !== KW) { var a2 = a + q[0], b2 = b + q[1]; if (inMap(a2, b2) && (K[idx(a2, b2)] === KP || K[idx(a2, b2)] === KL) && !(F.lockers.some(function (L) { return L.i === a2 && L.j === b2 && L.indoor; }))) { /* keep wardrobes against back walls */ if (DIRS.every(function (r) { var kk = inMap(a2 + r[0], b2 + r[1]) ? K[idx(a2 + r[0], b2 + r[1])] : KW; return kk !== KC && kk !== KR || (a2 + r[0] === a && b2 + r[1] === b); })) free(a2, b2); } } }); }
  // then: every open tile must be reachable from the start; anything solid between is taken away
  var s = F.start; if (!s) return removed;
  function pass(k) { return k === KC || k === KR || k === KD || k === KB; }
  var skip = new Uint8Array(MW * MH);
  for (var guard = 0; guard < 60; guard++) {
    var D = bfs(F, s.i, s.j, pass), lost = -1;
    for (var p = 0; p < MW * MH; p++) { var kp = K[p]; if ((kp === KC || kp === KR) && D[p] < 0 && !skip[p]) { var pi = p % MW, pj = (p / MW) | 0; if (pi > 0 && pj > 0 && pi < MW - 1 && pj < MH - 1) { lost = p; break; } } }
    if (lost < 0) break;
    // walk out from the lost tile through props/lockers until reaching reached ground, removing what is in the way
    var prev = new Int32Array(MW * MH).fill(-2), q2 = [lost], hit = -1; prev[lost] = -1;
    for (var h = 0; h < q2.length && hit < 0; h++) { var c = q2[h], ci = c % MW, cj = (c / MW) | 0;
      for (var d = 0; d < 4; d++) { var ni = ci + DIRS[d][0], nj = cj + DIRS[d][1]; if (!inMap(ni, nj)) continue; var nk = idx(ni, nj); if (prev[nk] !== -2) continue; var kk2 = K[nk];
        if (D[nk] >= 0) { prev[nk] = c; hit = nk; break; } if (kk2 === KC || kk2 === KR || kk2 === KD || kk2 === KP || kk2 === KL) { prev[nk] = c; q2.push(nk); } } }
    if (hit < 0) { // truly walled in (scenery): leave it, but nothing to pick up or fight in there
      var D2 = bfs(F, lost % MW, (lost / MW) | 0, pass); for (var z = 0; z < MW * MH; z++) if (D2[z] >= 0) skip[z] = 1; F.loot = F.loot.filter(function (l) { return !skip[idx(l.i, l.j)]; }); F.foes = F.foes.filter(function (f) { return !skip[idx(f.i, f.j)]; }); F.notes = F.notes.filter(function (l) { return !skip[idx(l.i, l.j)]; }); continue; }
    for (var bk = prev[hit]; bk >= 0; bk = prev[bk]) { var kb = K[bk]; if (kb === KP || kb === KL) free(bk % MW, (bk / MW) | 0); }
  }
  return removed;
}
