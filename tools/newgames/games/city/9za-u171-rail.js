/* =====================================================================================================
   THE SPUZZRAIL, rebuilt (update 171, his ask: "make the best monorail system I've ever seen": a detailed train, a
   detailed track, detailed supports that aren't in the way, detailed stations, adverts, somewhere to sit, higher).
   Two lines, each straight down the middle of one of the two big avenues, so the track never meets a building:
     RED LINE    15 m up along the east-west avenue: Cumstruction Site, Clubhouse Row, Red Light District, The Docks
     PURPLE LINE 22 m up along the north-south avenue (it crosses over the red line): Spunk Brain Labs, Clubhouse Row,
                 The Cafe Streets, Ejaculand
   Two beams per line (one train each, back and forth). Supports straddle the road: their legs stand on the pavements
   (never in the road, never in a side street). Stations: a platform on each side with glass screen doors, a canopy,
   benches you can sit on, lit adverts, a ticket machine, the station's name; a lift tower down to the pavement at
   each side with a billboard on top. Ride: take the lift up, buy a ticket ($5, it asks first), the train comes in,
   the doors open and you get on; A skips ahead, Y swaps between the view behind the train and the driver's view.
   ===================================================================================================== */
var SPZDEF = [
  { id: 'red', name: 'RED LINE', col: '#ff2630', dk: '#8a0a14', H: 15, ax: 1446, az: 1432, t: [1, 0], len: 1334, st: [[30, 'Cumstruction Site'], [690, 'Clubhouse Row'], [936, 'Red Light District'], [1304, 'The Docks']] },
  { id: 'purple', name: 'PURPLE LINE', col: '#b06aff', dk: '#4a2080', H: 22, ax: 2088, az: 1182, t: [0, 1], len: 1098, st: [[30, 'Spunk Brain Labs'], [294, 'Clubhouse Row'], [734, 'The Cafe Streets'], [1068, 'Ejaculand']] }];
var SPZ = null, SPZBU = 2.0, SPZBW = 0.45, SPZBH = 1.7, SPZDWELL = 12, SPZVMAX = 20, SPZACC = 1.3;
var SPZDOORS = [-12.0, -8.2, -2.65, 2.65, 8.2, 12.0]; // the doors along a train (and the screen doors on a platform)
HIPAINT.spz_tix = parkSign('TICKETS', '#12040a', '#ffe36a'); HIPAINT.spz_lift = parkSign('LIFT', '#12040a', '#f1e7d0');
SPZDEF.forEach(function (D) { HIPAINT['spz_' + D.id] = parkSign('SPUZZRAIL', '#12040a', D.col); HIPAINT['spz_ln_' + D.id] = parkSign(D.name, D.col, '#12040a');
  D.st.forEach(function (q, i) { HIPAINT['spz_st_' + D.id + i] = parkSign(q[1].toUpperCase(), '#12040a', D.col); }); });
function spzW(L, s, u) { return [L.ax + L.t[0] * s + L.n[0] * u, L.az + L.t[1] * s + L.n[1] * u]; }
function spzP(L, s, u, y) { var w = spzW(L, s, u); return [w[0], y, w[1]]; }
function spzNrm(L, du, ds, dy) { return [L.n[0] * du + L.t[0] * ds, dy, L.n[1] * du + L.t[1] * ds]; }
function spzY(L, s) { var i = clamp(s / 2, 0, L.Y.length - 1.001), i0 = Math.floor(i), f = i - i0; return L.Y[i0] * (1 - f) + L.Y[Math.min(L.Y.length - 1, i0 + 1)] * f; }
/* a quad in line space: corners [s, u, y], a colour, the normal (du, ds, dy), a tile and its uv */
function spzQ(m, L, a, b, c, d, hex, n, T, uv) { var N = spzNrm(L, n[0], n[1], n[2]); m.quad(spzP(L, a[0], a[1], a[2]), spzP(L, b[0], b[1], b[2]), spzP(L, c[0], c[1], c[2]), spzP(L, d[0], d[1], d[2]), uv || UV1, TL(T || 'white'), litc(hex, N), N); }
function spzB(m, L, s0, s1, u0, u1, y0, y1, hex) { var a = spzW(L, s0, u0), b = spzW(L, s1, u1); boxC(m, Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]), hex); }
/* a flat picture standing in line space, facing (du, ds): sign textures crop to their sign (SGUV) */
function spzPic(m, L, s, u, y0, y1, w, face, tex, crop) { var fu = face[0], fs = face[1], ru, rs; // right as seen from the front
  ru = -fs; rs = fu; // facing +u: right is +s; facing +s: right is -u
  var a = [s - rs * w / 2, u - ru * w / 2, y0], b = [s + rs * w / 2, u + ru * w / 2, y0], c = [s + rs * w / 2, u + ru * w / 2, y1], d = [s - rs * w / 2, u - ru * w / 2, y1];
  var off = 0.015; [a, b, c, d].forEach(function (p) { p[0] += fs * off; p[1] += fu * off; });
  spzQ(m, L, a, b, c, d, '#ffffff', [fu, fs, 0], tex, crop ? SGUV : UV1); }
function spzOk(x, z) { var k = kAt(x, z); if (k === K_ROAD || k === K_BRIDGE) return false; if (bldAt(x, z)) return false; return roadFU(x, z) > 0.35; }
function spzOkBox(L, s, u0, u1, h) { for (var a = 0; a <= 2; a++) for (var b = 0; b <= 2; b++) { var w = spzW(L, s - h + a * h, u0 + (u1 - u0) * b / 2); if (!spzOk(w[0], w[1])) return false; } return true; }

/* ---------------- building the lines ---------------- */
function spzBuild() { if (SPZ) return SPZ; SPZ = { lines: [], trains: [], uses: [], seatsDone: false };
  SPZDEF.forEach(function (D) { var L = { id: D.id, name: D.name, col: D.col, dk: D.dk, H: D.H, ax: D.ax, az: D.az, t: D.t, n: [-D.t[1], D.t[0]], len: D.len, yaw: Math.atan2(D.t[0], D.t[1]), chunks: [], st: [], sup: [] };
    // how high: the ground's highest point near each spot, smoothed, plus the line's height; flat through the stations
    var g = []; for (var s = 0; s <= L.len + 2; s += 2) { var mx = -99; [-9, 0, 9].forEach(function (u) { var w = spzW(L, s, u); mx = Math.max(mx, groundY(w[0], w[1])); }); g.push(mx); }
    var w2 = g.map(function (v, i) { var m = -99; for (var k = Math.max(0, i - 15); k <= Math.min(g.length - 1, i + 15); k++) m = Math.max(m, g[k]); return m; });
    for (var pass = 0; pass < 6; pass++) w2 = w2.map(function (v, i) { return Math.max(v, (w2[Math.max(0, i - 1)] + v * 2 + w2[Math.min(w2.length - 1, i + 1)]) / 4); });
    L.Y = w2.map(function (v) { return v + L.H; });
    D.st.forEach(function (q, i) { var s0 = q[0], y0 = spzY(L, s0); for (var k = 0; k < L.Y.length; k++) { var s = k * 2, d = Math.abs(s - s0); if (d <= 26) L.Y[k] = y0; else if (d < 46) { var f = (d - 26) / 20; L.Y[k] = y0 * (1 - f) + L.Y[k] * f; } }
      L.st.push({ i: i, s: s0, name: q[1], L: L, y: y0, deck: y0 + 0.55, side: {} }); });
    SPZ.lines.push(L); });
  SPZ.lines.forEach(function (L) { L.st.forEach(function (S) { [-1, 1].forEach(function (sg) { spzPlanSide(L, S, sg); }); }); spzPlanSupports(L); spzMeshes(L); spzSolids(L); });
  SPZ.solidOK = 1;
  // two trains a line, one on each beam, going back and forth
  SPZ.lines.forEach(function (L) { var a = L.st[0], b = L.st[L.st.length - 1];
    SPZ.trains.push({ L: L, u: SPZBU, s: a.s, vs: 0, tgt: a.s, dir: 1, si: 0, dwell: 6, dwellT: 0 });
    SPZ.trains.push({ L: L, u: -SPZBU, s: b.s, vs: 0, tgt: b.s, dir: -1, si: L.st.length - 1, dwell: 3, dwellT: 0 }); });
  return SPZ; }
/* where each side's lift tower goes: on the pavement, clear of the road and the buildings */
function spzPlanSide(L, S, sg) { var best = null;
  [12, -12, 16, -16, 7, -7, 4, -4].some(function (o) { for (var u0 = 9.6; u0 <= 11.2; u0 += 0.4) { var sL = S.s + o, ds = sL > S.s ? -1 : 1, sm = sL + ds * 5.7; if (spzOkBox(L, sL, sg * u0, sg * (u0 + 2.5), 1.4) && spzOkBox(L, sm, sg * u0, sg * (u0 + 3.4), 4.3) && spzOkBox(L, sm - ds * 2.1, sg * u0, sg * (u0 + 3.4), 2.1)) { best = { sL: sL, u0: u0 }; return true; } } return false; });
  if (!best) [12, -12, 16, -16, 7, -7, 4, -4].some(function (o) { for (var u0 = 9.6; u0 <= 11.2; u0 += 0.4) { if (spzOkBox(L, S.s + o, sg * u0, sg * (u0 + 2.5), 1.4)) { best = { sL: S.s + o, u0: u0 }; return true; } } return false; });
  if (!best) best = { sL: S.s + 12, u0: 10.0 };
  var gs = spzW(L, best.sL - (best.sL > S.s ? -2.3 : 2.3), sg * (best.u0 + 1.25)); // the lift's street door faces along the pavement, away from the station
  S.side[sg] = { sg: sg, sL: best.sL, u0: best.u0, u1: best.u0 + 2.5, gy: groundY(spzW(L, best.sL, sg * (best.u0 + 1.25))[0], spzW(L, best.sL, sg * (best.u0 + 1.25))[1]), door: gs, doorDir: best.sL > S.s ? 1 : -1 };
  var Sd = S.side[sg], ds = -Sd.doorDir, H = S.deck - Sd.gy, n = Math.max(2, Math.ceil(H / 3.0)); if (n % 2) n++; // an even number of flights: the first starts by the lift, on the outside
  Sd.stair = { ds: ds, a: Sd.sL + ds * 1.4, b: Sd.sL + ds * 10.0, u0: Sd.u0, u1: Sd.u0 + 3.4, n: n, r: H / n };
  Sd.gA = Math.min(Sd.sL - 1.3, Sd.sL + ds * 3.1); Sd.gB = Math.max(Sd.sL + 1.3, Sd.sL + ds * 3.1); // the gap in the platform's back wall (lift and stairs)
  Sd.carY = Sd.gy; }
/* the supports: a portal frame straddling the road (a leg on each pavement), or one leg and an arm out if one side
   has no room; never in the road; one at each end of each station and in its middle */
function spzPlanSupports(L) { var want = [];
  L.st.forEach(function (S) { want.push({ s: S.s - 21, st: 1 }, { s: S.s, st: 1 }, { s: S.s + 21, st: 1 }); });
  want.push({ s: 5, st: 1 }, { s: L.len - 5, st: 1 }); want.sort(function (a, b) { return a.s - b.s; });
  var all = []; for (var k = 0; k < want.length; k++) { all.push(want[k]); var nx = want[k + 1]; if (!nx) break; var gap = nx.s - want[k].s, n = Math.floor(gap / 30); for (var q = 1; q <= n; q++) { var s = want[k].s + gap * q / (n + 1); if (gap / (n + 1) > 12) all.push({ s: s }); } }
  var lifts = []; L.st.forEach(function (S) { [-1, 1].forEach(function (sg) { lifts.push(S.side[sg]); }); });
  all.forEach(function (c) { var shifts = c.st ? [0, 1.5, -1.5, 3, -3] : [0, 2, -2, 4, -4, 6, -6, 8, -8], done = null;
    for (var q = 0; q < shifts.length && !done; q++) { var s = c.s + shifts[q]; if (s < 2 || s > L.len - 2) continue; var legs = {};
      [-1, 1].forEach(function (sg) { for (var u = 7.4; u <= 11.5; u += 0.25) { var okL = spzOkBox(L, s, sg * (u - 0.7), sg * (u + 0.7), 0.7) && !lifts.some(function (Lf) { if (Lf.sg !== sg || u + 0.7 <= Lf.u0 - 0.3) return false; if (Math.abs(Lf.sL - s) < 2.4) return true; var St = Lf.stair; return St && s > Math.min(St.a, St.b) - 1.2 && s < Math.max(St.a, St.b) + 1.2; }); if (okL) { legs[sg] = u; break; } } });
      if (legs[-1] && legs[1]) done = { s: s, legs: [legs[-1], legs[1]] }; else if (q === shifts.length - 1 || !c.st && q > 6) { if (legs[-1] || legs[1]) done = { s: s + 0, one: legs[1] ? 1 : -1, u: legs[1] || legs[-1] }; } }
    if (!done) { // try again for one leg at the first shift that has one
      for (var q2 = 0; q2 < shifts.length && !done; q2++) { var s2 = c.s + shifts[q2]; [-1, 1].some(function (sg) { for (var u = 7.4; u <= 11.5; u += 0.25) if (spzOkBox(L, s2, sg * (u - 0.7), sg * (u + 0.7), 0.7)) { done = { s: s2, one: sg, u: u }; return true; } return false; }); } }
    if (done) L.sup.push(done); }); }

/* ---------------- the meshes ---------------- */
function spzChunk(L, s) { var k = Math.max(0, Math.floor(s / 80)); if (!L.chunks[k]) { var w = spzW(L, k * 80 + 40, 0); L.chunks[k] = { m: new R3.Mesh(), gl: new R3.Mesh(), gs: new R3.Mesh(), x: w[0], z: w[1], k: k }; } return L.chunks[k]; }
function spzMeshes(L) {
  // the two beams, 4 m at a time
  for (var s = 0; s < L.len; s += 4) { var s1 = Math.min(L.len, s + 4), C = spzChunk(L, s), m = C.m, gl = C.gl, ya = spzY(L, s), yb = spzY(L, s1);
    [-1, 1].forEach(function (bs) { var u = bs * SPZBU, uo = u + bs * SPZBW, ui = u - bs * SPZBW, w = SPZBW, top = 0.24;
      // concrete body: both sides and the bottom
      [[u + w, 1], [u - w, -1]].forEach(function (e) { spzQ(m, L, [s, e[0], ya - SPZBH], [s1, e[0], yb - SPZBH], [s1, e[0], yb - top], [s, e[0], ya - top], '#b4aca2', [e[1], 0, 0], 'concrete', uvR(1, 0.5)); });
      spzQ(m, L, [s, u - w, ya - SPZBH], [s1, u - w, yb - SPZBH], [s1, u + w, yb - SPZBH], [s, u + w, ya - SPZBH], '#8a847c', [0, 0, -1], 'concrete');
      // the steel running plate on top, a little wider than the beam
      spzQ(m, L, [s, u - w - 0.06, ya], [s1, u - w - 0.06, yb], [s1, u + w + 0.06, yb], [s, u + w + 0.06, ya], '#6a6a72', [0, 0, 1], 'steel', uvR(1, 1));
      [[u + w + 0.06, 1], [u - w - 0.06, -1]].forEach(function (e) { spzQ(m, L, [s, e[0], ya - top], [s1, e[0], yb - top], [s1, e[0], yb], [s, e[0], ya], '#4a4a52', [e[1], 0, 0], 'steel'); spzQ(m, L, [s, e[0] - e[1] * 0.06, ya - top], [s1, e[0] - e[1] * 0.06, yb - top], [s1, e[0], yb - top], [s, e[0], ya - top], '#3a3a42', [0, 0, -1]); });
      // guide rails, the power rail (gold) and the line's light strip on the outer face
      [[u + w + 0.04, 1], [u - w - 0.04, -1]].forEach(function (e) { spzQ(m, L, [s, e[0], ya - 0.78], [s1, e[0], yb - 0.78], [s1, e[0], yb - 0.6], [s, e[0], ya - 0.6], '#2a2a30', [e[1], 0, 0]);
        spzQ(m, L, [s, e[0] + e[1] * 0.02, ya - 1.08], [s1, e[0] + e[1] * 0.02, yb - 1.08], [s1, e[0] + e[1] * 0.02, yb - 0.98], [s, e[0] + e[1] * 0.02, ya - 0.98], '#d0a848', [e[1], 0, 0]); });
      spzQ(gl, L, [s, uo + bs * 0.03, ya - 1.42], [s1, uo + bs * 0.03, yb - 1.42], [s1, uo + bs * 0.03, yb - 1.34], [s, uo + bs * 0.03, ya - 1.34], L.col, [bs, 0, 0]);
      if (s % 24 === 0) [[u + w + 0.005, 1], [u - w - 0.005, -1]].forEach(function (e) { spzQ(m, L, [s - 0.04, e[0], ya - SPZBH], [s + 0.04, e[0], ya - SPZBH], [s + 0.04, e[0], ya - 0.26], [s - 0.04, e[0], ya - 0.26], '#4a4640', [e[1], 0, 0]); }); // expansion joints
      if (s % 12 === 0) spzB(gl, L, s - 0.15, s + 0.15, u - 0.12, u + 0.12, ya - SPZBH - 0.06, ya - SPZBH, '#fff0d0'); // lights underneath
    }); }
  // buffer stops at the ends of each beam
  [0, L.len].forEach(function (s, e) { var C = spzChunk(L, s), y = spzY(L, s), d = e ? -1 : 1; [-1, 1].forEach(function (bs) { var u = bs * SPZBU;
    spzB(C.m, L, s, s + d * 0.15, u - SPZBW, u + SPZBW, y - SPZBH, y, '#8a847c');
    spzB(C.m, L, s + d * 0.2, s + d * 1.6, u - 0.6, u + 0.6, y, y + 0.9, '#2a2a30'); for (var k = 0; k < 4; k++) spzB(C.m, L, s + d * 1.58, s + d * 1.66, u - 0.6 + k * 0.3, u - 0.45 + k * 0.3, y + 0.1, y + 0.8, k % 2 ? '#ffe36a' : '#12040a');
    spzB(C.gl, L, s + d * 0.8, s + d * 1.0, u - 0.12, u + 0.12, y + 0.9, y + 1.15, '#ff2630'); }); });
  L.sup.forEach(function (S) { spzSupport(L, S); });
  L.st.forEach(function (S) { spzStation(L, S); });
  L.chunks.forEach(function (C) { if (!C) return; C.m.upload(); C.gl.upload(); C.gs.upload(); });
}
function spzSupport(L, S) { var C = spzChunk(L, S.s), m = C.m, gl = C.gl, s = S.s, Y = spzY(L, s), yb = Y - SPZBH, cb0 = yb - 1.0, legs = S.legs ? [[-1, S.legs[0]], [1, S.legs[1]]] : [[S.one, S.u]], umin, umax;
  if (S.legs) { umin = -S.legs[0] - 0.5; umax = S.legs[1] + 0.5; } else if (S.one > 0) { umin = -SPZBU - 1.1; umax = S.u + 0.5; } else { umin = -S.u - 0.5; umax = SPZBU + 1.1; }
  legs.forEach(function (q) { var sg = q[0], u = sg * q[1], w = spzW(L, s, u), gy = groundY(w[0], w[1]); if (isWaterK(kAt(w[0], w[1]))) gy = Math.min(gy, 0) - 3;
    spzB(m, L, s - 0.75, s + 0.75, u - 0.75, u + 0.75, gy - 0.4, gy + 0.5, '#9a948c'); spzB(m, L, s - 0.6, s + 0.6, u - 0.6, u + 0.6, gy + 0.5, gy + 0.62, '#7a746c'); // plinth
    tub(m, [w[0], gy + 0.62, w[1]], [w[0], cb0 - 0.4, w[1]], 0.44, 0.36, '#26262c', 14); // the leg
    [[2.4, 2.9], [cb0 - gy - 1.6, cb0 - gy - 1.3]].forEach(function (b) { tub(m, [w[0], gy + b[0], w[1]], [w[0], gy + b[1], w[1]], 0.45, 0.45, L.dk, 14, { cap: 1, cap0: 1 }); }); // painted bands in the line's colour
    spzB(m, L, s - 0.55, s + 0.55, u - 0.55, u + 0.55, cb0 - 0.4, cb0, '#3a3a42'); // the head
    var kn = spzW(L, s, u - sg * 3.2); tub(m, [w[0], cb0 - 3.6, w[1]], [kn[0], cb0 + 0.02, kn[1]], 0.14, 0.12, '#33333a', 6); // knee brace
    addPost(w[0], w[1], 0.5, gy - 1, cb0); });
  // the cross beam, an I-section with stiffeners; bearings under each running beam
  spzB(m, L, s - 0.45, s + 0.45, umin, umax, yb - 0.12, yb, '#3e3e46'); spzB(m, L, s - 0.12, s + 0.12, umin, umax, cb0 + 0.12, yb - 0.12, '#34343c'); spzB(m, L, s - 0.45, s + 0.45, umin, umax, cb0, cb0 + 0.12, '#3e3e46');
  for (var u = Math.ceil(umin) + 0.5; u < umax - 0.5; u += 1.6) spzB(m, L, s - 0.42, s + 0.42, u - 0.04, u + 0.04, cb0 + 0.12, yb - 0.12, '#2e2e36');
  spzB(m, L, s - 0.47, s + 0.47, umin, umax, cb0 + 0.36, cb0 + 0.44, L.dk); // a stripe of the line's colour along the beam
  [-1, 1].forEach(function (bs) { if ((bs * SPZBU) < umin || (bs * SPZBU) > umax) return; spzB(m, L, s - 0.7, s + 0.7, bs * SPZBU - 0.6, bs * SPZBU + 0.6, yb - 0.02, yb + 0.28, '#22222a'); spzB(gl, L, s - 0.05, s + 0.05, bs * SPZBU - 0.62, bs * SPZBU + 0.62, yb + 0.12, yb + 0.18, L.col); });
  if (!S.legs) { var o = spzW(L, s, S.one * (S.u - 0.6)), e = spzW(L, s, -S.one * (SPZBU - 0.4)); tub(m, [o[0], cb0 - 5.5, o[1]], [e[0], cb0 + 0.05, e[1]], 0.2, 0.16, '#33333a', 8); } // the arm's brace
  spzB(gl, L, s - 0.2, s + 0.2, -0.3, 0.3, cb0 - 0.08, cb0, '#fff4dc'); // a downlight
  // an advert hanging under every third frame, both ways, over the road
  if (S.legs && Math.round(S.s / 30) % 3 === 0 && !L.st.some(function (q) { return Math.abs(q.s - S.s) < 30; })) { var bk = BILLS[(Math.round(S.s) + (L.id === 'red' ? 0 : 5)) % BILLS.length];
    spzB(m, L, s - 0.1, s + 0.1, -2.7, 2.7, cb0 - 2.6, cb0 - 0.1, '#1a1a1e'); [-1, 1].forEach(function (d) { spzPic(gl, L, s + d * 0.1, 0, cb0 - 2.5, cb0 - 0.2, 5.0, [0, d], bk); });
    [-2.2, 2.2].forEach(function (u2) { var w2 = spzW(L, s, u2); tub(m, [w2[0], cb0 - 0.1, w2[1]], [w2[0], cb0, w2[1]], 0.05, 0.05, '#2a2a30', 5); }); } }
/* a station: both platforms, everything on them, the lift towers */
function spzStation(L, S) { var C = spzChunk(L, S.s), m = C.m, gl = C.gl, gs = C.gs, s0 = S.s, dk = S.deck, h = 22;
  [-1, 1].forEach(function (sg) { var Sd = S.side[sg], ui = sg * 3.55, uo = sg * 7.45, um = sg * 5.5, sL = Sd.sL;
    function U(v) { return sg * v; }
    // the deck: tiles on top, edges, the underside and the steel girders under it
    spzQ(m, L, [s0 - h, ui, dk], [s0 + h, ui, dk], [s0 + h, uo, dk], [s0 - h, uo, dk], '#a8a29a', [0, 0, 1], 'paver', uvR(2, 11));
    spzQ(m, L, [s0 - h, ui, dk - 0.45], [s0 + h, ui, dk - 0.45], [s0 + h, uo, dk - 0.45], [s0 - h, uo, dk - 0.45], '#4a4a52', [0, 0, -1]);
    [[ui, -1], [uo, 1]].forEach(function (e) { spzQ(m, L, [s0 - h, e[0], dk - 0.45], [s0 + h, e[0], dk - 0.45], [s0 + h, e[0], dk], [s0 - h, e[0], dk], '#9a948c', [sg * e[1], 0, 0], 'concrete', uvR(10, 0.2)); });
    [-h, h].forEach(function (ds) { spzQ(m, L, [s0 + ds, ui, dk - 0.45], [s0 + ds, uo, dk - 0.45], [s0 + ds, uo, dk], [s0 + ds, ui, dk], '#9a948c', [0, ds > 0 ? 1 : -1, 0]); });
    [4.1, 6.9].forEach(function (u) { spzB(m, L, s0 - h, s0 + h, U(u) - 0.18, U(u) + 0.18, dk - 1.0, dk - 0.45, '#3a3a42'); });
    [-21, 0, 21].forEach(function (ds) { [4.1, 6.9].forEach(function (u) { spzB(m, L, s0 + ds - 0.15, s0 + ds + 0.15, U(u) - 0.15, U(u) + 0.15, S.y - SPZBH - 0.1, dk - 1.0, '#33333a'); }); });
    // the yellow line and the bumpy strip at the edge
    spzQ(m, L, [s0 - h, U(3.62), dk + 0.012], [s0 + h, U(3.62), dk + 0.012], [s0 + h, U(3.82), dk + 0.012], [s0 - h, U(3.82), dk + 0.012], '#ffe36a', [0, 0, 1]);
    spzQ(m, L, [s0 - h, U(3.82), dk + 0.008], [s0 + h, U(3.82), dk + 0.008], [s0 + h, U(4.25), dk + 0.008], [s0 - h, U(4.25), dk + 0.008], '#b8a878', [0, 0, 1], 'grate', uvR(44, 1));
    // platform screen doors: posts, a lit header, glass panels; the door leaves are drawn separately (they open)
    var posts = [-h + 0.3, h - 0.3]; SPZDOORS.forEach(function (d) { posts.push(d - 0.7, d + 0.7); }); for (var p = -h + 2; p < h - 1; p += 1.8) if (!SPZDOORS.some(function (d) { return Math.abs(p - d) < 1.4; })) posts.push(p); posts.sort(function (a, b) { return a - b; });
    posts.forEach(function (p) { spzB(m, L, s0 + p - 0.05, s0 + p + 0.05, U(3.58) - 0.05, U(3.58) + 0.05, dk, dk + 2.05, '#c8c8d0'); });
    spzB(m, L, s0 - h, s0 + h, U(3.58) - 0.09, U(3.58) + 0.09, dk + 2.05, dk + 2.35, '#2a2a32'); spzQ(gl, L, [s0 - h, U(3.58) + U(0.1), dk + 2.14], [s0 + h, U(3.58) + U(0.1), dk + 2.14], [s0 + h, U(3.58) + U(0.1), dk + 2.24], [s0 - h, U(3.58) + U(0.1), dk + 2.24], L.col, [sg, 0, 0]);
    for (var k = 0; k < posts.length - 1; k++) { var a = posts[k], b = posts[k + 1]; if (SPZDOORS.some(function (d) { return Math.abs((a + b) / 2 - d) < 0.5; })) continue; spzQ(gs, L, [s0 + a + 0.05, U(3.58), dk + 0.1], [s0 + b - 0.05, U(3.58), dk + 0.1], [s0 + b - 0.05, U(3.58), dk + 2.0], [s0 + a + 0.05, U(3.58), dk + 2.0], '#9cc8e0', [sg, 0, 0]); }
    // the canopy: roof, its lit edge in the line's colour, posts, lights underneath
    spzB(m, L, s0 - h + 1, s0 + h - 1, U(3.35) - (sg < 0 ? 0 : 0), U(7.65), dk + 4.5, dk + 4.68, '#2a2a30');
    spzB(m, L, s0 - h + 1, s0 + h - 1, U(3.35) - 0.06 * sg, U(3.35) + 0.06 * sg, dk + 4.15, dk + 4.68, L.dk);
    spzQ(gl, L, [s0 - h + 1, U(3.27), dk + 4.25], [s0 + h - 1, U(3.27), dk + 4.25], [s0 + h - 1, U(3.27), dk + 4.32], [s0 - h + 1, U(3.27), dk + 4.32], L.col, [-sg, 0, 0]);
    spzQ(m, L, [s0 - h + 1, U(3.4), dk + 4.49], [s0 + h - 1, U(3.4), dk + 4.49], [s0 + h - 1, U(7.6), dk + 4.49], [s0 - h + 1, U(7.6), dk + 4.49], '#cfc8bc', [0, 0, -1], 'concrete', uvR(1, 6));
    for (var q = -h + 3; q <= h - 3; q += 6.2) { var pw = spzW(L, s0 + q, U(7.15)); tub(m, [pw[0], dk, pw[1]], [pw[0], dk + 4.5, pw[1]], 0.1, 0.1, '#2a2a30', 8); }
    for (var q2 = -h + 2.5; q2 <= h - 2.5; q2 += 4) spzB(gl, L, s0 + q2 - 0.9, s0 + q2 + 0.9, U(5.3) - 0.08, U(5.3) + 0.08, dk + 4.44, dk + 4.49, '#fff2d8');
    // the back wall: dark panels, the station's name, three lit adverts; a gap for the lift
    var gA = Sd.gA, gB = Sd.gB, segs = [[s0 - h, gA], [gB, s0 + h]]; function inGap(x, m) { return s0 + x > gA - m && s0 + x < gB + m; }
    segs.forEach(function (g2) { if (g2[1] - g2[0] < 0.2) return; spzB(m, L, g2[0], g2[1], U(7.38) - 0.06, U(7.38) + 0.06, dk, dk + 2.9, '#1e1e24'); spzB(m, L, g2[0], g2[1], U(7.38) - 0.08, U(7.38) + 0.08, dk + 2.9, dk + 3.05, L.dk); });
    var spots = []; for (var a2 = -h + 2.5; a2 <= h - 2.5; a2 += 0.5) spots.push(a2);
    var adAt = [-15, -1, 14].map(function (a3) { var best = null; spots.forEach(function (x) { if (inGap(x, 1.9)) return; if (best === null || Math.abs(x - a3) < Math.abs(best - a3)) best = x; }); return best; });
    adAt.forEach(function (x, n) { var bk = BILLS[(S.i * 3 + n + (sg > 0 ? 6 : 0) + (L.id === 'red' ? 0 : 2)) % BILLS.length]; spzB(m, L, s0 + x - 1.45, s0 + x + 1.45, U(7.3) - 0.04, U(7.3) + 0.04, dk + 0.85, dk + 2.25, '#3a3a42'); spzPic(gl, L, s0 + x, U(7.25), dk + 0.92, dk + 2.18, 2.6, [-sg, 0], bk); });
    [-8, 6].forEach(function (x) { var xx = x; for (var g = 0; g < 12 && inGap(xx, 1.2); g++) xx += x < 0 ? -1 : 1; spzPic(gl, L, s0 + xx, U(7.3), dk + 2.3, dk + 2.82, 1.95, [-sg, 0], 'spz_st_' + L.id + S.i, 1); });
    // hanging name signs, both faces
    [-10, 10].forEach(function (x) { spzB(m, L, s0 + x - 1.35, s0 + x + 1.35, U(5.5) - 0.06, U(5.5) + 0.06, dk + 3.75, dk + 4.25, '#12040a'); [-1, 1].forEach(function (f) { spzPic(gl, L, s0 + x, U(5.5) + f * 0.07, dk + 3.77, dk + 4.23, 1.3 * 2.6 / 2.6 * 2, [f, 0], 'spz_st_' + L.id + S.i, 1); });
      [-1.1, 1.1].forEach(function (o) { var w = spzW(L, s0 + x + o, U(5.5)); tub(m, [w[0], dk + 4.25, w[1]], [w[0], dk + 4.49, w[1]], 0.02, 0.02, '#2a2a30', 4); }); });
    // benches (sit on them), bins
    [-17.5, -6.5, 6.5, 17.5].forEach(function (x) { var xx = x; if (inGap(xx, 1.1)) { var a1 = gA - 1.2 - s0, b1x = gB + 1.2 - s0; xx = (Math.abs(a1 - x) < Math.abs(b1x - x) && a1 > -h + 1) || b1x > h - 1 ? a1 : b1x; } var bs = s0 + xx;
      spzB(m, L, bs - 0.9, bs + 0.9, U(6.55) - 0.22, U(6.55) + 0.22, dk + 0.42, dk + 0.5, '#7a4a2a'); spzB(m, L, bs - 0.9, bs + 0.9, U(6.82) - 0.04, U(6.82) + 0.04, dk + 0.5, dk + 0.95, '#7a4a2a');
      [-0.75, 0.75].forEach(function (o) { spzB(m, L, bs + o - 0.04, bs + o + 0.04, U(6.55) - 0.2, U(6.55) + 0.2, dk, dk + 0.42, '#2a2a30'); });
      var sw = spzW(L, bs, U(6.5)); S.side[sg].seats = S.side[sg].seats || []; S.side[sg].seats.push({ x: sw[0], z: sw[1], a: Math.atan2(-sg * L.n[0], -sg * L.n[1]) }); });
    [-12.2, 12.2].forEach(function (x) { var w = spzW(L, s0 + x, U(6.9)); tub(m, [w[0], dk, w[1]], [w[0], dk + 0.85, w[1]], 0.24, 0.24, '#2a2a30', 10, { cap: 1 }); tub(m, [w[0], dk + 0.85, w[1]], [w[0], dk + 0.9, w[1]], 0.26, 0.26, L.dk, 10, { cap: 1 }); });
    // the ticket machine beside the lift
    var tS = sL - Sd.stair.ds * 2.4; if (Math.abs(tS - s0) > h - 1) tS = sL + Sd.stair.ds * 4.0; spzB(m, L, tS - 0.4, tS + 0.4, U(6.95) - 0.25, U(6.95) + 0.25, dk, dk + 1.75, '#2a2a32'); spzB(m, L, tS - 0.42, tS + 0.42, U(6.95) - 0.27, U(6.95) + 0.27, dk + 1.75, dk + 1.85, L.dk);
    spzPic(gl, L, tS, U(6.68), dk + 1.0, dk + 1.45, 0.55, [-sg, 0], 'white'); spzPic(gl, L, tS, U(6.68), dk + 1.5, dk + 1.72, 0.6, [-sg, 0], 'spz_tix', 1);
    S.side[sg].tix = spzW(L, tS, U(5.9));
    // end railings
    [-h, h].forEach(function (ds) { spzB(m, L, s0 + ds - 0.05, s0 + ds + 0.05, U(3.6), U(7.45), dk + 1.05, dk + 1.12, '#c8c8d0'); spzQ(gs, L, [s0 + ds, U(3.6), dk + 0.05], [s0 + ds, U(7.45), dk + 0.05], [s0 + ds, U(7.45), dk + 1.05], [s0 + ds, U(3.6), dk + 1.05], '#9cc8e0', [0, ds > 0 ? 1 : -1, 0]); });
    // the bridge over to the lift: floor, glass sides, roof
    var b0 = 7.45, b1 = Sd.u0, bA = Math.min(sL - 1.2, sL + Sd.stair.ds * 3.0), bB = Math.max(sL + 1.2, sL + Sd.stair.ds * 3.0); Sd.bA = bA; Sd.bB = bB;
    spzQ(m, L, [bA, U(b0), dk], [bB, U(b0), dk], [bB, U(b1), dk], [bA, U(b1), dk], '#a8a29a', [0, 0, 1], 'paver', uvR(2, 3));
    spzB(m, L, bA, bB, U(b0), U(b1), dk - 0.5, dk, '#4a4a52');
    [bA, bB].forEach(function (o) { spzB(m, L, o - 0.05, o + 0.05, U(b0), U(b1), dk + 1.05, dk + 1.12, '#c8c8d0'); spzQ(gs, L, [o, U(b0), dk], [o, U(b1), dk], [o, U(b1), dk + 1.05], [o, U(b0), dk + 1.05], '#9cc8e0', [0, o > sL ? 1 : -1, 0]); });
    spzB(m, L, bA - 0.15, bB + 0.15, U(b0 - 0.2), U(b1), dk + 4, dk + 4.15, '#2a2a30');
    // the lift tower: steel frame, tinted glass, the lift car at the bottom, a machine room with signs, a billboard on top
    var u0 = Sd.u0, u1 = Sd.u1, gy = Sd.gy, top = dk + 4.5;
    spzB(m, L, sL - 1.3, sL + 1.3, U(u0) - 0.05 * sg, U(u1) + 0.05 * sg, gy - 0.3, gy + 0.25, '#7a746c');
    [[-1.25, u0], [1.25, u0], [-1.25, u1], [1.25, u1]].forEach(function (c) { spzB(m, L, sL + c[0] - 0.1, sL + c[0] + 0.1, U(c[1]) - 0.1, U(c[1]) + 0.1, gy, top, '#2e2e36'); });
    for (var yy = gy + 3; yy < top; yy += 3) spzB(m, L, sL - 1.25, sL + 1.25, U(u0), U(u1), yy - 0.06, yy, '#2e2e36'); // floor bands
    [[sL - 1.25, -1], [sL + 1.25, 1]].forEach(function (e) { spzQ(gs, L, [e[0], U(u0), gy + 0.25], [e[0], U(u1), gy + 0.25], [e[0], U(u1), top], [e[0], U(u0), top], '#1e2c36', [0, e[1], 0]); });
    [[u0, -1], [u1, 1]].forEach(function (e) { spzQ(gs, L, [sL - 1.25, U(e[0]), gy + 0.25], [sL + 1.25, U(e[0]), gy + 0.25], [sL + 1.25, U(e[0]), top], [sL - 1.25, U(e[0]), top], '#1e2c36', [sg * e[1], 0, 0]); });
    spzStairs(C, L, S, sg); // the stair tower beside it (the lift car is drawn on its own: it moves)
    spzB(m, L, sL - 1.35, sL + 1.35, U(u0) - 0.1 * sg, U(u1) + 0.1 * sg, top, top + 1.1, '#1e1e24'); spzB(m, L, sL - 1.4, sL + 1.4, U(u0) - 0.12 * sg, U(u1) + 0.12 * sg, top + 1.1, top + 1.22, L.dk);
    [[-1, 0], [1, 0]].forEach(function (f) { spzPic(gl, L, sL + f[0] * 1.36, U((u0 + u1) / 2), top + 0.25, top + 0.95, 1.9, [0, f[0]], 'spz_' + L.id, 1); });
    spzPic(gl, L, sL, U(u1) + 0.11 * sg, top + 0.25, top + 0.95, 1.9, [sg, 0], 'spz_' + L.id, 1);
    var bk2 = BILLS[(S.i + (sg > 0 ? 3 : 8) + (L.id === 'red' ? 1 : 4)) % BILLS.length]; // the billboard on the roof, facing up and down the road
    [-0.9, 0.9].forEach(function (o) { var w = spzW(L, sL, U((u0 + u1) / 2 + o)); tub(m, [w[0], top + 1.22, w[1]], [w[0], top + 2.0, w[1]], 0.06, 0.06, '#2a2a30', 6); });
    spzB(m, L, sL - 0.08, sL + 0.08, U((u0 + u1) / 2 - 2.3), U((u0 + u1) / 2 + 2.3), top + 2.0, top + 4.3, '#1a1a1e'); [-1, 1].forEach(function (f) { spzPic(gl, L, sL + f * 0.08, U((u0 + u1) / 2), top + 2.08, top + 4.22, 4.4, [0, f], bk2); });
    // the street door: a frame, a lit LIFT sign, and a sign post with the station's name
    var dS = sL + Sd.doorDir * 1.26, dirS = Sd.doorDir; spzB(m, L, dS - 0.06 * dirS, dS + 0.06 * dirS, U(u0 + 0.35), U(u1 - 0.35), gy + 0.25, gy + 2.5, '#3a3a42');
    spzQ(m, L, [dS + 0.07 * dirS, U(u0 + 0.55), gy + 0.25], [dS + 0.07 * dirS, U(u1 - 0.55), gy + 0.25], [dS + 0.07 * dirS, U(u1 - 0.55), gy + 2.3], [dS + 0.07 * dirS, U(u0 + 0.55), gy + 2.3], '#4a5058', [0, dirS, 0]);
    spzPic(gl, L, dS + 0.08 * dirS, U((u0 + u1) / 2), gy + 2.35, gy + 2.72, 0.9, [0, dirS], 'spz_lift', 1);
    var tp = spzW(L, dS + dirS * 2.6, U(u1 - 0.3)); tub(m, [tp[0], gy, tp[1]], [tp[0], gy + 3.1, tp[1]], 0.07, 0.07, '#2a2a30', 6);
    var tS2 = dS + dirS * 2.6; spzB(m, L, tS2 - 0.06, tS2 + 0.06, U(u1 - 1.4), U(u1 + 0.8), gy + 2.3, gy + 3.25, '#12040a'); [-1, 1].forEach(function (f) { spzPic(gl, L, tS2 + f * 0.07, U(u1 - 0.3), gy + 2.35, gy + 3.2, 2.1, [0, f], 'spz_st_' + L.id + S.i, 1); });
    Sd.ground = spzW(L, dS + dirS * 1.2, U((u0 + u1) / 2)); Sd.top = spzW(L, sL, U((b0 + b1) / 2)); Sd.inG = spzW(L, sL, U((u0 + u1) / 2)); Sd.doorS = dS; Sd.topA = Math.atan2(-sg * L.n[0], -sg * L.n[1]);
  });
  // the gap between the beams under the station: a lit walkway grating between the two tracks (maintenance)
  spzQ(m, L, [s0 - h, -SPZBU + 0.55, S.y - 0.3], [s0 + h, -SPZBU + 0.55, S.y - 0.3], [s0 + h, SPZBU - 0.55, S.y - 0.3], [s0 - h, SPZBU - 0.55, S.y - 0.3], '#4a4a52', [0, 0, 1], 'grate', uvR(1, 22));
}
/* walls and floors you can stand on, posts you bump into */
function spzSolids(L) { var yaw = L.yaw;
  function obb(s, u, hs, hu, y0, y1, top) { var w = spzW(L, s, u), b = addOBB(w[0], w[1], yaw, hu, hs, y0, y1); if (top) b.top = 1; return b; }
  L.st.forEach(function (S) { var dk = S.deck;
    [-1, 1].forEach(function (sg) { var Sd = S.side[sg], sL = Sd.sL;
      obb(S.s, sg * 5.5, 22, 1.95, dk - 0.45, dk, 1); // the platform
      obb(S.s, sg * 3.6, 22, 0.08, dk, dk + 2.3); // the screen doors
      obb(S.s - 22, sg * 5.5, 0.08, 1.95, dk, dk + 1.2); obb(S.s + 22, sg * 5.5, 0.08, 1.95, dk, dk + 1.2); // end rails
      var a0 = S.s - 22, a1 = Sd.gA + 0.05, b0 = Sd.gB - 0.05, b1 = S.s + 22; if (a1 > a0) obb((a0 + a1) / 2, sg * 7.38, (a1 - a0) / 2, 0.08, dk, dk + 3); if (b1 > b0) obb((b0 + b1) / 2, sg * 7.38, (b1 - b0) / 2, 0.08, dk, dk + 3);
      var bu = (7.45 + Sd.u0) / 2, bh = (Sd.u0 - 7.45) / 2 + 0.05, bA = Math.min(sL - 1.2, sL + Sd.stair.ds * 3.0), bB = Math.max(sL + 1.2, sL + Sd.stair.ds * 3.0); obb((bA + bB) / 2, sg * bu, (bB - bA) / 2, bh, dk - 0.5, dk, 1); obb(bA - 0.02, sg * bu, 0.06, bh, dk, dk + 1.2); obb(bB + 0.02, sg * bu, 0.06, bh, dk, dk + 1.2);
      spzStairSolids(L, S, sg);
      obb(sL, sg * (Sd.u0 + Sd.u1) / 2, 1.3, 1.3, Sd.gy - 1, dk + 4.4); // the lift tower
      spzSeats(Sd, dk); }); }); }
function spzSeats(Sd, dk) { (Sd.seats || []).forEach(function (q) { addSeat(q.x, q.z, q.a, 'bench', { y: dk + 0.5 }); var s2 = SEATG[Math.round(q.x * 2) + ',' + Math.round(q.z * 2)]; if (s2) s2.spz = 1; }); }

/* ---------------- the trains ---------------- */
var SPZCARS = {};
function spzCarMeshes(L) { if (SPZCARS[L.id]) return SPZCARS[L.id];
  function build(nose) { var m = new R3.Mesh(), gl = new R3.Mesh(), dr = new R3.Mesh(), hl = new R3.Mesh();
    var PR = [[1.2, -1.0], [1.45, -0.62], [1.45, 0.9], [1.45, 1.02], [1.45, 2.45], [1.45, 2.58], [1.34, 3.05], [1.05, 3.36], [-1.05, 3.36], [-1.34, 3.05], [-1.45, 2.58], [-1.45, 2.45], [-1.45, 1.02], [-1.45, 0.9], [-1.45, -0.62], [-1.2, -1.0]];
    function band(y) { return y < -0.62 ? '#1c1c22' : y < 0.9 ? L.col : y < 1.02 ? '#f1e7d0' : y < 2.45 ? '#101016' : y < 2.58 ? L.dk : '#ece6da'; }
    var secs = [{ z: -5.3, sx: 1, sy: 1 }];
    if (nose) { secs.push({ z: 2.6, sx: 1, sy: 1 }); [0.4, 0.8, 1.15, 1.5, 1.8, 2.05, 2.28, 2.45, 2.56].forEach(function (dz) { var f = dz / 2.6; secs.push({ z: 2.6 + dz, sx: 0.3 + 0.7 * Math.sqrt(Math.max(0, 1 - f * f)), sy: 1 - 0.6 * Math.pow(f, 1.5) }); }); }
    else secs.push({ z: 5.3, sx: 1, sy: 1 });
    function PT(p, S) { return [p[0] * S.sx, p[1] <= 0.9 ? p[1] : 0.9 + (p[1] - 0.9) * S.sy, S.z]; }
    for (var k = 0; k < secs.length - 1; k++) { var A = secs[k], B = secs[k + 1];
      for (var i = 0; i < PR.length; i++) { var p = PR[i], q = PR[(i + 1) % PR.length], a = PT(p, A), b = PT(q, A), c = PT(q, B), d = PT(p, B), n = faceN(a, b, c);
        var mx = (a[0] + b[0] + c[0] + d[0]) / 4, my = (a[1] + b[1] + c[1] + d[1]) / 4, mz = (a[2] + b[2] + c[2] + d[2]) / 4; if (n[0] * mx + n[1] * (my - 1.2) + n[2] * (nose ? mz - 1.5 : 0) < 0) n = [-n[0], -n[1], -n[2]];
        var hex = i === PR.length - 1 ? '#141418' : band((p[1] + q[1]) / 2); m.quad(a, b, c, d, UV1, TL('white'), litc(hex, n), n); } }
    function cap(S, out) { for (var i = 0; i < PR.length; i++) { var p = PT(PR[i], S), q = PT(PR[(i + 1) % PR.length], S), c = [0, 0.9 + (1.2 - 0.9) * S.sy, S.z], n = [0, 0, out]; var hex = S.sx < 0.5 ? band((PR[i][1] + PR[(i + 1) % PR.length][1]) / 2) : '#26262c'; m.tri(p, q, c, [0, 0, 1, 0, 0.5, 1], TL('white'), litc(hex, n), n); } }
    cap(secs[0], -1); cap(secs[secs.length - 1], 1);
    // the gangway bellows at the coupled ends
    boxC(m, -1.15, -0.3, -5.62, 1.15, 3.05, -5.3, '#18181c'); if (!nose) boxC(m, -1.15, -0.3, 5.3, 1.15, 3.05, 5.62, '#18181c');
    // roof pods
    (nose ? [-3.3, 0.3] : [-2.6, 2.6]).forEach(function (z) { boxC(m, -0.72, 3.34, z - 0.85, 0.72, 3.6, z + 0.85, '#c4c4c8'); boxC(m, -0.6, 3.6, z - 0.7, 0.6, 3.63, z + 0.7, '#2a2a30'); });
    // windows: lit from inside
    var doors = nose ? [-2.9, 0.9] : [-2.65, 2.65], panes = nose ? [[-5.0, -3.75], [-2.05, 0.05], [1.75, 2.55]] : [[-4.95, -3.5], [-1.85, -0.12], [0.12, 1.85], [3.5, 4.95]];
    [-1, 1].forEach(function (sd) { var x = sd * 1.457;
      panes.forEach(function (z) { gl.quad([x, 1.14, z[0]], [x, 1.14, z[1]], [x, 2.33, z[1]], [x, 2.33, z[0]], UV1, TL('white'), [0.3, 0.29, 0.27], [sd, 0, 0]); });
      doors.forEach(function (dz) { m.quad([sd * 1.452, 0.58, dz - 0.68], [sd * 1.452, 0.58, dz + 0.68], [sd * 1.452, 2.56, dz + 0.68], [sd * 1.452, 2.56, dz - 0.68], UV1, TL('white'), [0.03, 0.03, 0.04], [sd, 0, 0]);
        [[dz - 0.66, dz - 0.01], [dz + 0.01, dz + 0.66]].forEach(function (lz) { dr.quad([sd * 1.463, 0.6, lz[0]], [sd * 1.463, 0.6, lz[1]], [sd * 1.463, 2.54, lz[1]], [sd * 1.463, 2.54, lz[0]], UV1, TL('white'), litc('#bcbcc6', [sd, 0, 0]), [sd, 0, 0]);
          dr.quad([sd * 1.466, 1.35, lz[0] + 0.1], [sd * 1.466, 1.35, lz[1] - 0.1], [sd * 1.466, 2.3, lz[1] - 0.1], [sd * 1.466, 2.3, lz[0] + 0.1], UV1, TL('white'), [0.1, 0.1, 0.13], [sd, 0, 0]); });
        dr.quad([sd * 1.467, 2.5, dz - 0.66], [sd * 1.467, 2.5, dz + 0.66], [sd * 1.467, 2.54, dz + 0.66], [sd * 1.467, 2.54, dz - 0.66], UV1, TL('white'), litc('#ffe36a', [sd, 0, 0]), [sd, 0, 0]); });
      // the name on the nose cars, an advert on the middle one; read the right way round from each side
      function pic(z0, z1, y0, y1, tex, crop) { var uv = crop ? SGUV : UV1, a = sd > 0 ? [x + sd * 0.012, y0, z1] : [x + sd * 0.012, y0, z0], b = sd > 0 ? [x + sd * 0.012, y0, z0] : [x + sd * 0.012, y0, z1], c = [b[0], y1, b[2]], d = [a[0], y1, a[2]]; gl.quad(a, b, c, d, uv, TL(tex), [0.5, 0.5, 0.5], [sd, 0, 0]); }
      if (nose) pic(-2.05, 0.1, 0.02, 0.86, 'spz_' + L.id, 1); else pic(-1.45, 1.45, -0.52, 0.82, BILLS[L.id === 'red' ? 2 : 9]); });
    if (nose) { // headlights and a light bar on the nose (drawn white at the front, red at the back)
      [-0.62, 0.62].forEach(function (x) { hl.quad([x - 0.2, 0.28, 4.86], [x + 0.2, 0.28, 4.86], [x + 0.2, 0.56, 4.86], [x - 0.2, 0.56, 4.86], UV1, TL('white'), [0.9, 0.9, 0.85], [0, 0, 1]); });
      hl.quad([-0.55, 0.68, 4.82], [0.55, 0.68, 4.82], [0.55, 0.74, 4.82], [-0.55, 0.74, 4.82], UV1, TL('white'), [0.8, 0.8, 0.75], [0, 0, 1]);
      gl.quad([-0.7, 2.62, 3.75], [0.7, 2.62, 3.75], [0.7, 2.84, 3.6], [-0.7, 2.84, 3.6], SGUV, TL('spz_ln_' + L.id), [0.55, 0.55, 0.55], [0, 0.6, 0.8]); } // the line's name above the windscreen
    return { m: m.upload(), gl: gl.upload(), dr: dr.upload(), hl: hl.upload() }; }
  SPZCARS[L.id] = { nose: build(true), mid: build(false) }; return SPZCARS[L.id]; }
function spzTrainStep(T, dt) { var L = T.L;
  if (T.dwell > 0) { T.dwellT += dt; T.dwell -= dt; T.open = T.dwellT > 1.0 && T.dwell > 1.6; if (T.open && !T.chimed) { T.chimed = 1; if (dist2(spzW(L, T.s, T.u)[0], spzW(L, T.s, T.u)[1], P.x, P.z) < 60 * 60) sfx.play('select'); }
    if (T.dwell <= 0) { T.open = false; T.chimed = 0; if (T.call !== undefined) { T.tgt = L.st[T.call].s; T.si = T.call; T.call = undefined; T.hold = 9; return; } if (T.express !== undefined) { T.tgt = L.st[T.express].s; T.si = T.express; T.express = undefined; return; }
      var ni = T.si + T.dir; if (ni < 0 || ni >= L.st.length) { T.dir = -T.dir; ni = T.si + T.dir; } T.si = ni; T.tgt = L.st[ni].s; } return; }
  var dist = T.tgt - T.s, stop = T.vs * T.vs / (2 * SPZACC), want = dist > 0 ? SPZVMAX : -SPZVMAX; if (Math.abs(dist) <= stop + 0.6 && (dist > 0) === (T.vs > 0)) want = 0;
  if (T.vs < want) T.vs = Math.min(want, T.vs + SPZACC * dt * (T.vs < 0 ? 1.6 : 1)); else T.vs = Math.max(want, T.vs - SPZACC * dt * (T.vs > 0 ? 1.6 : 1));
  if (Math.abs(dist) < 6 && Math.abs(T.vs) < 0.8) T.vs = (dist > 0 ? 1 : -1) * Math.max(Math.abs(T.vs), 0.8); // creep in the last few metres, never stall short
  T.s += T.vs * dt; if (T.vs !== 0) T.face = T.vs > 0 ? 1 : -1;
  if (Math.abs(T.tgt - T.s) < 0.25 || (T.tgt - T.s) * dist < 0) { T.s = T.tgt; T.vs = 0; T.dwell = T.hold || SPZDWELL; T.hold = 0; T.dwellT = 0; T.arrived = (T.arrived || 0) + 1; } }
function spzDrawTrain(T) { var L = T.L, M = spzCarMeshes(L), f = T.face || T.dir || 1;
  [-11.1, 0, 11.1].forEach(function (o, k) { var s = T.s + o, w = spzW(L, s, T.u); if (dist2(w[0], w[1], CAM.x, CAM.z) > 900 * 900 || !inView(w[0], w[1], 12)) return;
    var y = spzY(L, s), mid = k === 1, back = (o * f) < 0, flip = mid ? f < 0 : (back ? f > 0 : f < 0), yaw = L.yaw + (flip ? Math.PI : 0), pitch = -Math.atan2((spzY(L, s + 2) - spzY(L, s - 2)) * (flip ? -1 : 1), 4);
    var Mx = MD(w[0], y, w[1], yaw, pitch, 0), C = mid ? M.mid : M.nose; R3.draw(C.m, ATT, { m: Mx }); R3.draw(C.gl, ATT, { m: Mx, lit: false }); if (!T.open) R3.draw(C.dr, ATT, { m: Mx });
    if (!mid) R3.draw(C.hl, ATT, { m: Mx, lit: false, tint: back ? [1, 0.12, 0.1] : [1, 1, 1] }); }); }


/* ---------------- update 172 (his ask): stairs up to every station, and the lift is a little cutscene ----------------
   A stair tower stands on the pavement beside each lift: steel flights that go back and forth (about 3 m up each),
   a landing at every turn, handrails, glass sides, lit landings, a STAIRS sign over the way in at street level. The
   top landing opens onto the bridge to the platform (the bridge is wider now to meet it). Every flight and landing
   can be walked on; the glass and the middle wall keep you inside. */
HIPAINT.spz_stairs = parkSign('STAIRS', '#12040a', '#f1e7d0');
function spzFlights(Sd) { var St = Sd.stair, F = [], a = St.a, ds = St.ds, inL = [St.u0, St.u0 + 1.6], outL = [St.u0 + 1.8, St.u0 + 3.4];
  for (var k = 1; k <= St.n; k++) { var toNear = (St.n - k) % 2 === 0, lane = toNear ? inL : outL, sNear = a + ds * 1.6, sFar = a + ds * 7.0;
    F.push({ k: k, lane: lane, s0: toNear ? sFar : sNear, s1: toNear ? sNear : sFar, y0: Sd.gy + (k - 1) * St.r, y1: Sd.gy + k * St.r, end: toNear ? 'near' : 'far' }); }
  return F; }
function spzStairs(C, L, S, sg) { var Sd = S.side[sg], St = Sd.stair, m = C.m, gl = C.gl, gs = C.gs, a = St.a, b = St.b, ds = St.ds, u0 = St.u0, u1 = St.u1, gy = Sd.gy, dk = S.deck;
  function U(v) { return sg * v; } var sLo = Math.min(a, b), sHi = Math.max(a, b), nearA = Math.min(a, a + ds * 1.6), nearB = Math.max(a, a + ds * 1.6), farA = Math.min(a + ds * 7.0, b), farB = Math.max(a + ds * 7.0, b);
  spzB(m, L, sLo - 0.1, sHi + 0.1, U(u0) - 0.1 * sg, U(u1) + 0.1 * sg, gy - 0.3, gy + 0.08, '#7a746c'); // its base
  spzFlights(Sd).forEach(function (F) { var n = Math.max(10, Math.round((F.y1 - F.y0) / 0.18)), dir = F.s1 > F.s0 ? 1 : -1, len = Math.abs(F.s1 - F.s0), l0 = F.lane[0], l1 = F.lane[1];
    for (var i = 0; i < n; i++) { var sa = F.s0 + dir * len * i / n, sb = F.s0 + dir * len * (i + 1) / n, y = F.y0 + (F.y1 - F.y0) * (i + 1) / n;
      spzB(m, L, Math.min(sa, sb), Math.max(sa, sb), U(l0 + 0.06), U(l1 - 0.06), y - 0.06, y, '#5a5a62'); spzB(gl, L, Math.min(sa, sb) + (dir > 0 ? 0 : len / n - 0.04), Math.min(sa, sb) + (dir > 0 ? 0.04 : len / n), U(l0 + 0.06), U(l1 - 0.06), y - 0.008, y + 0.004, '#ffe36a'); } // the treads, a yellow nosing on each
    [l0, l1].forEach(function (lu) { var su = lu === l0 ? -1 : 1; // stringers and handrails
      spzQ(m, L, [F.s0, U(lu), F.y0 - 0.35], [F.s1, U(lu), F.y1 - 0.35], [F.s1, U(lu), F.y1 + 0.02], [F.s0, U(lu), F.y0 + 0.02], '#3a3a42', [sg * su, 0, 0]);
      var p0 = spzP(L, F.s0, U(lu - su * 0.05), F.y0 + 0.95), p1 = spzP(L, F.s1, U(lu - su * 0.05), F.y1 + 0.95); tub(m, p0, p1, 0.035, 0.035, '#c8c8d0', 5);
      for (var q = 0; q <= 3; q++) { var t = q / 3, ss = F.s0 + (F.s1 - F.s0) * t, yy = F.y0 + (F.y1 - F.y0) * t, pp = spzW(L, ss, U(lu - su * 0.05)); tub(m, [pp[0], yy, pp[1]], [pp[0], yy + 0.95, pp[1]], 0.02, 0.02, '#c8c8d0', 4); } });
    // the landing this flight arrives at
    var ly = F.y1, LA = F.end === 'near' ? nearA : farA, LB = F.end === 'near' ? nearB : farB; spzB(m, L, LA, LB, U(u0 + 0.02), U(u1 - 0.02), ly - 0.18, ly, '#5a5a62');
    spzQ(m, L, [LA, U(u0 + 0.02), ly + 0.006], [LB, U(u0 + 0.02), ly + 0.006], [LB, U(u1 - 0.02), ly + 0.006], [LA, U(u1 - 0.02), ly + 0.006], '#8a8478', [0, 0, 1], 'grate', uvR(2, 1));
    spzB(gl, L, LA + 0.3, LB - 0.3, U((u0 + u1) / 2) - 0.08, U((u0 + u1) / 2) + 0.08, ly - 0.22, ly - 0.18, '#fff2d8'); });
  // the middle wall between the two flights, the frame, glass all round (a door-sized way in at the bottom), a roof
  spzB(m, L, Math.min(a + ds * 1.6, a + ds * 7.0), Math.max(a + ds * 1.6, a + ds * 7.0), U(u0 + 1.62), U(u0 + 1.78), gy, dk, '#8a8480');
  var top = dk + 3.2; [[a, u0], [a, u1], [b, u0], [b, u1], [a + ds * 4.3, u0], [a + ds * 4.3, u1]].forEach(function (c) { spzB(m, L, c[0] - 0.09, c[0] + 0.09, U(c[1]) - 0.09, U(c[1]) + 0.09, gy, top, '#2e2e36'); });
  for (var k2 = 1; k2 <= St.n; k2++) { var yb = gy + k2 * St.r; [[u0, -1], [u1, 1]].forEach(function (e) { spzB(m, L, sLo, sHi, U(e[0]) - 0.05, U(e[0]) + 0.05, yb - 0.25, yb - 0.12, L.dk); }); }
  function glass(sA, sB, u, y0, y1, nrm) { if (sB - sA < 0.05 || y1 - y0 < 0.05) return; spzQ(gs, L, [sA, U(u), y0], [sB, U(u), y0], [sB, U(u), y1], [sA, U(u), y1], '#1e2c36', nrm); }
  glass(sLo, sHi, u1, gy + 2.4, top, [sg, 0, 0]); glass(Math.min(farA, nearA) === farA ? farA : nearB, Math.min(farA, nearA) === farA ? nearA : farB, u1, gy + 0.08, gy + 2.4, [sg, 0, 0]); // the outer side; open at the bottom by the lift
  glass(Math.min(nearB, farA) === nearB ? nearB : farB, Math.max(nearB, farA) === farA ? farB : nearA, u0, gy + 0.08, top, [-sg, 0, 0]); glass(nearA, nearB, u0, gy + 0.08, dk - 0.05, [-sg, 0, 0]); glass(nearA, nearB, u0, dk + 2.6, top, [-sg, 0, 0]);
  [[b, ds], [a, -ds]].forEach(function (e) { spzQ(gs, L, [e[0], U(u0), gy + 0.08], [e[0], U(u1), gy + 0.08], [e[0], U(u1), top], [e[0], U(u0), top], '#1e2c36', [0, e[1], 0]); });
  spzB(m, L, sLo - 0.15, sHi + 0.15, U(u0) - 0.15 * sg, U(u1) + 0.15 * sg, top, top + 0.2, '#1e1e24'); spzB(m, L, sLo - 0.17, sHi + 0.17, U(u0) - 0.17 * sg, U(u1) + 0.17 * sg, top + 0.2, top + 0.3, L.dk);
  spzB(m, L, nearA, nearB, U(u1) - 0.06 * sg, U(u1) + 0.06 * sg, gy + 2.4, gy + 2.6, '#2e2e36'); spzPic(gl, L, (nearA + nearB) / 2, U(u1) + 0.07 * sg, gy + 2.62, gy + 3.12, 1.25, [sg, 0], 'spz_stairs', 1); // the way in
  Sd.stairIn = spzW(L, (nearA + nearB) / 2, U(u1 + 1.2)); }
function spzStairSolids(L, S, sg) { var Sd = S.side[sg], St = Sd.stair, a = St.a, b = St.b, ds = St.ds, u0 = St.u0, u1 = St.u1, gy = Sd.gy, dk = S.deck, yaw = L.yaw;
  function obb(sA, sB, uA, uB, y0, y1) { var sm = (sA + sB) / 2, um = (uA + uB) / 2, w = spzW(L, sm, sg * um); return addOBB(w[0], w[1], yaw, Math.abs(uB - uA) / 2, Math.abs(sB - sA) / 2, y0, y1); }
  function floorFn(sA, sB, uA, uB, hf) { var c0 = spzW(L, sA, sg * uA), c1 = spzW(L, sB, sg * uB), bx = addBox(Math.min(c0[0], c1[0]), Math.min(c0[1], c1[1]), Math.max(c0[0], c1[0]), Math.max(c0[1], c1[1]), gy - 1, gy - 0.9, { deck: 1 });
    bx.ramp = function (x, z) { var dx = x - L.ax, dz = z - L.az, s = dx * L.t[0] + dz * L.t[1], u = (dx * L.n[0] + dz * L.n[1]) * sg; if (s < Math.min(sA, sB) - 0.02 || s > Math.max(sA, sB) + 0.02 || u < Math.min(uA, uB) - 0.02 || u > Math.max(uA, uB) + 0.02) return -999; return hf(s) + 0.02; }; }
  var nearA = Math.min(a, a + ds * 1.6), nearB = Math.max(a, a + ds * 1.6), farA = Math.min(a + ds * 7.0, b), farB = Math.max(a + ds * 7.0, b), runA = Math.min(a + ds * 1.6, a + ds * 7.0), runB = Math.max(a + ds * 1.6, a + ds * 7.0);
  spzFlights(Sd).forEach(function (F) { floorFn(F.s0, F.s1, F.lane[0], F.lane[1], function (s) { var t = clamp((s - F.s0) / (F.s1 - F.s0), 0, 1); return F.y0 + (F.y1 - F.y0) * t; });
    var LA = F.end === 'near' ? nearA : farA, LB = F.end === 'near' ? nearB : farB; floorFn(LA, LB, u0, u1, function () { return F.y1; }); });
  obb(runA, farB, u1, u1 + 0.1, gy - 0.5, dk + 3.2); obb(nearA, nearB, u1, u1 + 0.1, gy + 2.4, dk + 3.2); // outer side (open at the bottom by the lift)
  obb(runA, farB, u0 - 0.1, u0, gy - 0.5, dk + 3.2); obb(nearA, nearB, u0 - 0.1, u0, gy - 0.5, dk - 0.1); // inner side (open at the top onto the bridge)
  obb(ds > 0 ? b - 0.05 : b, ds > 0 ? b : b + 0.05, u0, u1, gy - 0.5, dk + 3.2); obb(ds > 0 ? a : a - 0.05, ds > 0 ? a + 0.05 : a, u0, u1, gy - 0.5, dk + 3.2); // the ends
  obb(runA, runB, u0 + 1.6, u0 + 1.8, gy - 0.5, dk); } // the middle wall
/* the lift car: a glass box with a lit ceiling; it moves up and down its tower, you ride in it */
var SPZLIFT = null;
function spzLiftMesh() { if (SPZLIFT) return SPZLIFT; var m = new R3.Mesh(), gl = new R3.Mesh(), gs = new R3.Mesh(), h = 0.95;
  boxC(m, -h, 0, -h, h, 0.15, h, '#5c5c66'); boxC(m, -h, 2.45, -h, h, 2.6, h, '#5c5c66'); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { boxC(m, c[0] * h - 0.06, 0.15, c[1] * h - 0.06, c[0] * h + 0.06, 2.45, c[1] * h + 0.06, '#2e2e36'); });
  boxC(m, -h, 0.95, -h - 0.02, h, 1.0, -h + 0.02, '#c8c8d0'); boxC(m, -h - 0.02, 0.95, -h, -h + 0.02, 1.0, h, '#c8c8d0'); // handrails
  boxC(gl, -0.8, 2.42, -0.8, 0.8, 2.45, 0.8, '#fff4dc');
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (f) { var a = f[0] ? [f[0] * h, 0.15, -h] : [-h, 0.15, f[1] * h], b = f[0] ? [f[0] * h, 0.15, h] : [h, 0.15, f[1] * h]; gs.quad(a, b, [b[0], 2.45, b[2]], [a[0], 2.45, a[2]], UV1, TL('white'), [0.35, 0.45, 0.5], [f[0], 0, f[1]]); });
  SPZLIFT = { m: m.upload(), gl: gl.upload(), gs: gs.upload() }; return SPZLIFT; }
function spzLiftStart(L, S, Sd, dir) { G.lift = { L: L, S: S, Sd: Sd, dir: dir, t: 0, from: [P.x, P.z, P.y] }; G.talk = 1; P.vx = P.vz = 0; }
function spzLiftStep(dt) { var Q = G.lift; if (!Q) return; var Sd = Q.Sd, S = Q.S, L = Q.L; Q.t += dt; var t = Q.t, up = Q.dir > 0, yLo = Sd.gy + 0.15, yHi = S.deck + 0.02;
  function walk(A, B, f, y) { var k = clamp(f, 0, 1); P.x = A[0] + (B[0] - A[0]) * k; P.z = A[1] + (B[1] - A[1]) * k; P.y = y; P.sp = f > 0 && f < 1 ? 2.2 : 0; P.ph += dt * P.sp * 2.4; if (f < 1) P.a = Math.atan2(B[0] - A[0], B[1] - A[1]); P.ground = true; }
  var outA = up ? Sd.ground : Sd.top, outB = up ? Sd.top : Sd.ground, yA = up ? yLo : yHi, yB = up ? yHi : yLo;
  if (t < 1.3) { Sd.carY = yA - 0.15; walk([Q.from[0], Q.from[1]], Sd.inG, t / 1.3, yA); if (t > 1.2 && !Q.d1) { Q.d1 = 1; sfx.play('door'); } }
  else if (t < 4.7) { var f = clamp((t - 1.5) / 3.0, 0, 1), e = f * f * (3 - 2 * f), y = yA + (yB - yA) * e; Sd.carY = y - 0.15; P.x = Sd.inG[0]; P.z = Sd.inG[1]; P.y = y; P.sp = 0; P.a = Math.atan2(outB[0] - Sd.inG[0], outB[1] - Sd.inG[1]); if (!Q.hum) { Q.hum = 1; sfx.tone('sine', 110, 140, 3.0, 0.05); } }
  else if (t < 6.0) { if (!Q.d2) { Q.d2 = 1; sfx.play('select'); } Sd.carY = yB - 0.15; walk(Sd.inG, outB, (t - 4.8) / 1.1, yB); }
  else { P.sp = 0; P.x = outB[0]; P.z = outB[1]; P.y = up ? S.deck : standY(outB[0], outB[1], yB + 1); P.vy = 0; G.lift = null; G.talk = 0; CAM.snap = 1; } }
function spzLiftCam() { var Q = G.lift, Sd = Q.Sd, L = Q.L, sg = Sd.sg, cy = Sd.carY + 1.3, ds = Sd.doorDir || 1; var e = spzW(L, Sd.sL + ds * 7.5, sg * (Sd.u1 + 3.2)), at = spzW(L, Sd.sL, sg * ((Sd.u0 + Sd.u1) / 2));
  CAM.x = e[0]; CAM.z = e[1]; CAM.y = cy + 2.2; CAM.at = [at[0], cy, at[1]]; }

/* ---------------- riding ---------------- */
function spzOnPlatform() { if (!SPZ || G.interior) return null; var best = null;
  SPZ.lines.forEach(function (L) { L.st.forEach(function (S) { if (Math.abs(P.y - S.deck) > 1.5) return; [-1, 1].forEach(function (sg) { var dx = P.x - L.ax, dz = P.z - L.az, s = dx * L.t[0] + dz * L.t[1], u = dx * L.n[0] + dz * L.n[1];
    if (Math.abs(s - S.s) < 23.5 && u * sg > 3.3 && u * sg < 10.5) best = { L: L, S: S, sg: sg }; }); }); }); return best; }
/* update 172 (his ask: the camera cut through the station roof): on a platform the camera stays under the canopy and
   in front of the back wall */
function spzCamRoof() { if (G.spz && G.spz.phase === 'ride' || G.lift || G.cut || G.interior) return; var o = spzOnPlatform(); if (!o) return; var L = o.L, S = o.S, sg = o.sg;
  var dx = CAM.x - L.ax, dz = CAM.z - L.az, s = dx * L.t[0] + dz * L.t[1], u = dx * L.n[0] + dz * L.n[1], ch = false;
  if (Math.abs(s - S.s) < 24) { if (u * sg > 7.15) { u = sg * 7.15; ch = true; } var roof = S.deck + 4.2; if (CAM.y > roof) { CAM.y = roof; ch = true; } }
  else { var cs = S.s + Math.sign(s - S.s) * 23.5; s = cs; ch = true; if (CAM.y > S.deck + 4.2) CAM.y = S.deck + 4.2; if (u * sg > 7.15) u = sg * 7.15; }
  if (ch) { var w = spzW(L, s, u); CAM.x = w[0]; CAM.z = w[1]; } }
function spzTrainFor(L, sg) { return SPZ.trains.filter(function (T) { return T.L === L && T.u === sg * SPZBU; })[0]; }
function spzTicket(L, S, sg) { KIT.menu({ title: 'SPUZZRAIL · ' + L.name, sub: S.name + ' · $5 to any stop on this line' + (S.name === 'Clubhouse Row' ? ' · change here for the other line (its Clubhouse Row station is round the corner)' : ''),
  items: L.st.filter(function (o) { return o !== S; }).map(function (o) { return { label: o.name.toUpperCase(), dis: SV.money < 5, fn: function () { KIT.confirm({ title: 'A ticket to ' + o.name, price: 5, have: Math.floor(SV.money), unit: '$', yes: function () { KIT.closeMenu(); money(-5); sfx.play('coin'); spzCall(L, S, sg, o); }, no: function () { spzTicket(L, S, sg); } }); } }; }).concat([{ label: 'BACK', back: true, fn: KIT.closeMenu }]) }); }
function spzCall(L, S, sg, to) { var T = spzTrainFor(L, sg); G.spz = { L: L, S: S, sg: sg, to: to, T: T, phase: 'wait', t: 0 };
  if (T.dwell > 0 && T.s === S.s) { T.dwell = Math.max(T.dwell, 6); T.express = to.i; toast('Your train is in. Doors open.'); return; }
  var w = spzW(L, T.s, T.u), seen = dist2(w[0], w[1], CAM.x, CAM.z) < 380 * 380 && inView(w[0], w[1], 20);
  if (!seen) { var side = T.s < S.s ? -1 : 1; if (S.s + side * 330 < 0 || S.s + side * 330 > L.len) side = -side; T.s = clamp(S.s + side * 330, 0, L.len); T.vs = -side * SPZVMAX; T.dwell = 0; }
  else if (T.dwell > 0) { T.dwell = Math.min(T.dwell, 2.0); T.call = S.i; T.express = to.i; G.spz.eta = Math.abs(T.s - S.s) / SPZVMAX + 10; toast('The train is on its way. Wait on the platform.'); return; }
  T.tgt = S.s; T.si = S.i; T.express = to.i; T.hold = 9; T.dwellT = 0; G.spz.eta = Math.max(8, Math.abs(T.s - S.s) / SPZVMAX + 6); toast('The train is on its way. Wait on the platform.'); }
function spzStep(dt) { var Z = spzBuild(); Z.trains.forEach(function (T) { spzTrainStep(T, dt); }); spzLiftStep(dt);
  // a few people waiting on the platforms you are near
  Z.lines.forEach(function (L) { L.st.forEach(function (S) { var w = spzW(L, S.s, 0), near = !G.interior && dist2(w[0], w[1], P.x, P.z) < 170 * 170;
    if (near && !S.peds) { S.peds = []; [-1, 1].forEach(function (sg) { for (var k = 0; k < 3; k++) { var s = S.s - 16 + Math.random() * 32, u = sg * (4.6 + Math.random() * 1.6), q = spzW(L, s, u), p = makePed({ x: q[0], z: q[1], a: Math.atan2(-sg * L.n[0], -sg * L.n[1]) + (Math.random() - 0.5), kind: 'cit', rig: rigFor('cit'), state: 'idle', keep: 1 });
      p.y = S.deck; p.spzP = 1; p.god = 1; (function (px, pz, py) { p.ctl = function (pp) { pp.vx = pp.vz = 0; pp.x = px; pp.z = pz; pp.y = py; }; })(q[0], q[1], S.deck); S.peds.push(p); } }); }
    else if (!near && S.peds) { PEDS = PEDS.filter(function (p) { return S.peds.indexOf(p) < 0; }); S.peds = null; } }); });
  var R = G.spz; if (!R) return; R.t += dt; var T = R.T, L = R.L;
  if (R.phase === 'wait') { R.eta = Math.max(0, (R.eta || 0) - dt);
    if (!spzOnPlatform() || spzOnPlatform().S !== R.S) { if (R.t > 2) { toast('You left the platform. The train goes without you.'); T.express = undefined; G.spz = null; } return; }
    if (T.dwell > 0 && T.s === R.S.s && T.open && T.dwellT > 1.6) { R.phase = 'ride'; G.fade = 0.8; G.talk = 1; CAM.snap = 1; T.dwell = Math.min(T.dwell, 3.2); T.express = R.to.i; toast('All aboard. ' + L.name + ' to ' + R.to.name + '.'); } return; }
  if (R.phase === 'ride') { var w = spzW(L, T.s, T.u); P.x = w[0]; P.z = w[1]; P.y = spzY(L, T.s) + 0.6; P.vx = P.vz = 0;
    if (KIT.pressed('y')) R.cab = !R.cab;
    if (KIT.pressed('a') && T.tgt === R.to.s && T.dwell <= 0) { var d = R.to.s - T.s; if (Math.abs(d) > 70) { T.s = R.to.s - Math.sign(d) * 60; T.vs = Math.sign(d) * 11; G.fade = 0.6; CAM.snap = 1; } }
    if (T.s === R.to.s && T.dwell > 0 && T.dwellT > 1.3) { var pw = spzW(L, R.to.s + 2.65, R.sg * 4.7); P.x = pw[0]; P.z = pw[1]; P.y = R.to.deck; P.a = Math.atan2(R.sg * L.n[0], R.sg * L.n[1]); P.vy = 0; G.spz = null; G.talk = 0; G.fade = 0.8; CAM.snap = 1; toast(R.to.name + '. Mind the gap.'); } } }
function spzDraw() { var Z = spzBuild();
  Z.lines.forEach(function (L) { L.chunks.forEach(function (C) { if (!C || dist2(C.x, C.z, CAM.x, CAM.z) > 950 * 950 || !inView(C.x, C.z, 75)) return; R3.draw(C.m, ATT); R3.draw(C.gl, ATT, { lit: false }); }); });
  Z.trains.forEach(spzDrawTrain);
  var LM = spzLiftMesh(); Z.lines.forEach(function (L) { L.st.forEach(function (S) { [-1, 1].forEach(function (sg) { var Sd = S.side[sg], w = spzW(L, Sd.sL, sg * (Sd.u0 + Sd.u1) / 2); if (dist2(w[0], w[1], CAM.x, CAM.z) > 400 * 400 || !inView(w[0], w[1], 6)) return; var Mx = MD(w[0], Sd.carY, w[1], 0, 0, 0); R3.draw(LM.m, ATT, { m: Mx }); R3.draw(LM.gl, ATT, { m: Mx, lit: false }); Sd._lm = Mx; }); }); });
  // the screen-door leaves (gone while a train stands there with its doors open), then all the glass
  Z.lines.forEach(function (L) { L.st.forEach(function (S) { var w = spzW(L, S.s, 0); if (dist2(w[0], w[1], CAM.x, CAM.z) > 500 * 500 || !inView(w[0], w[1], 40)) return; if (!S.doorM) S.doorM = spzDoorMesh(L, S);
    [-1, 1].forEach(function (sg) { var T = spzTrainFor(L, sg); if (T && T.open && T.s === S.s) return; R3.draw(S.doorM[sg], ATT, { alpha: 0.4 }); }); }); });
  Z.lines.forEach(function (L) { L.chunks.forEach(function (C) { if (!C || dist2(C.x, C.z, CAM.x, CAM.z) > 700 * 700 || !inView(C.x, C.z, 75)) return; R3.draw(C.gs, ATT, { alpha: 0.32 }); }); });
  Z.lines.forEach(function (L) { L.st.forEach(function (S) { [-1, 1].forEach(function (sg) { var Sd = S.side[sg]; if (Sd._lm) { R3.draw(LM.gs, ATT, { m: Sd._lm, alpha: 0.3 }); Sd._lm = null; } }); }); }); }
function spzDoorMesh(L, S) { var out = {}; [-1, 1].forEach(function (sg) { var m = new R3.Mesh(); SPZDOORS.forEach(function (d) { [[-0.64, -0.01], [0.01, 0.64]].forEach(function (q) { spzQ(m, L, [S.s + d + q[0], sg * 3.6, S.deck + 0.08], [S.s + d + q[1], sg * 3.6, S.deck + 0.08], [S.s + d + q[1], sg * 3.6, S.deck + 2.0], [S.s + d + q[0], sg * 3.6, S.deck + 2.0], '#9cc8e0', [sg, 0, 0]); }); }); out[sg] = m.upload(); }); return out; }
function spzUses() { var Z = spzBuild(), L0 = []; if (G.interior || G.lift || G.spz && G.spz.phase === 'ride') return L0;
  Z.lines.forEach(function (L) { L.st.forEach(function (S) { [-1, 1].forEach(function (sg) { var Sd = S.side[sg];
    L0.push({ x: Sd.ground[0], z: Sd.ground[1], r: 2.0, top: Sd.gy, label: 'SPUZZRAIL ' + L.name + ': ' + S.name.toUpperCase() + ' · LIFT UP', fn: function () { spzLiftStart(L, S, Sd, 1); } });
    L0.push({ x: Sd.top[0], z: Sd.top[1], r: 1.6, top: S.deck, label: 'LIFT DOWN TO THE STREET', fn: function () { if (G.spz && G.spz.S === S) { G.spz = null; } spzLiftStart(L, S, Sd, -1); } });
    L0.push({ x: Sd.tix[0], z: Sd.tix[1], r: 1.6, top: S.deck, label: G.spz ? 'TRAIN COMING' : 'BUY A TICKET (' + L.name + ')', fn: function () { if (G.spz) { toast('Your train is on its way.'); return; } spzTicket(L, S, sg); } }); }); }); });
  return L0; }
(function () {
  var ws = worldSetup; worldSetup = function () { ws(); try { var Z = spzBuild(); Z.lines.forEach(function (L) { L.st.forEach(function (S) { [-1, 1].forEach(function (sg) { var g = S.side[sg].ground; G.uses.push({ x: g[0], z: g[1], r: 0, blip: 'rail', icon: 'M', fn: function () {} }); }); }); }); } catch (e) { console.warn('spz', e); } };
  var sf = stepFun; stepFun = function (dt) { sf(dt); try { spzStep(dt); } catch (e) { if (!window.__spzE) { window.__spzE = 1; console.warn(e); } } };
  var df = drawFun; drawFun = function () { df(); if (G.interior) return; try { spzDraw(); } catch (e) { if (!window.__spzD) { window.__spzD = 1; console.warn(e); } } };
  var nu = nearestUse; nearestUse = function () { if (G.spz && G.spz.phase === 'ride') return null; var u = nu(); if (u && u.blip === 'rail') u = null; if (G.interior || P.state !== 'foot' || G.seat) return u; var best = null, bd = 1e9;
    spzUses().forEach(function (q) { if (Math.abs(P.y - q.top) > 2) return; var d = dist2(P.x, P.z, q.x, q.z); if (d < q.r * q.r && d < bd) { bd = d; best = q; } });
    if (u && spzOnPlatform() && Math.abs(P.y - (u.top !== undefined ? u.top : groundY(u.x, u.z))) > 3) u = null; // nothing down on the street works from up on a platform
    if (best && (!u || bd < dist2(P.x, P.z, u.x, u.z))) return best; return u; };
  var sn = seatNear; seatNear = function () { var s = sn(); if (s && (s.spz || spzOnPlatform()) && Math.abs(P.y - s.y) > 2.5) return null; return s; }; // a bench up on a platform is not a bench on the street
  var sfo = stepFoot; stepFoot = function (dt) { if (G.lift || G.spz && G.spz.phase === 'ride') { P.vx = P.vz = 0; P.sp = 0; return; } return sfo(dt); };
  var dp = drawPlayer; drawPlayer = function () { if (G.spz && G.spz.phase === 'ride') return; return dp(); };
  var sc = stepCamera; stepCamera = function (dt) { var r = sc(dt); var R = G.spz; if (G.lift) { spzLiftCam(); return r; } spzCamRoof(); if (R && R.phase === 'ride') { var T = R.T, L = R.L, f = T.face || (R.to.s > T.s ? 1 : -1);
      if (R.cab) { var nose = T.s + f * 16.2, e = spzW(L, nose, T.u), a = spzW(L, nose + f * 40, T.u); CAM.x = e[0]; CAM.z = e[1]; CAM.y = spzY(L, nose) + 2.3; CAM.at = [a[0], spzY(L, nose + f * 40) + 0.6, a[1]]; }
      else { var b = spzW(L, T.s - f * 34, T.u + R.sg * 7), a2 = spzW(L, T.s + f * 12, T.u); CAM.x = b[0]; CAM.z = b[1]; CAM.y = spzY(L, T.s) + 7.5; CAM.at = [a2[0], spzY(L, T.s) + 1.2, a2[1]]; } } return r; };
  var dh = drawHud; drawHud = function () { var r = dh.apply(this, arguments); try { var R = G.spz; if (!R) return r; var W = KIT.W, s1, s2;
      if (R.phase === 'wait') { s1 = R.L.name + ' TO ' + R.to.name.toUpperCase(); s2 = R.T.dwell > 0 && R.T.s === R.S.s ? 'BOARDING...' : 'TRAIN DUE IN ' + Math.ceil(Math.max(1, R.eta || 1)) + 's'; }
      else { s1 = R.L.name + ' · NEXT STOP: ' + R.to.name.toUpperCase(); s2 = 'A: SKIP AHEAD   Y: ' + (R.cab ? 'OUTSIDE VIEW' : "DRIVER'S VIEW"); }
      tx(s1, W / 2 - tw2(s1, 8) / 2, 26, { col: R.L.col, size: 8 }); tx(s2, W / 2 - tw2(s2, 7) / 2, 40, { col: '#f1e7d0', size: 7 }); } catch (e) {} return r; };
})();
