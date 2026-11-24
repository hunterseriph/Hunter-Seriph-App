/* =====================================================================================================
   EJACULAND (update 172, his asks): a big fence all the way round with turnstiles at the entrance ($30 to get in;
   the city's money is dollars), a big car park, a path from the Spuzzrail station to the entrance, the rides fixed
   (in step with their models, the right way round), every ride and stall usable with staff standing at it.
   ===================================================================================================== */
var EJGATE = null; function ejGate() { if (!EJGATE) EJGATE = POIS.filter(function (p) { return p.k === 'gate'; })[0] || { x: 2080, z: 2404, h: groundY(2080, 2404) }; return EJGATE; }
/* ---------------- the fence: 3 m steel railings on every edge between Ejaculand's land and the outside ---------------- */
var EJFSEG = null;
function ejFenceSegs() { if (EJFSEG) return EJFSEG; EJFSEG = []; var id = DISTID.ejac, g = ejGate(); if (id === undefined) return EJFSEG;
  for (var t = 0; t < KM.length; t++) { if (DM[t] !== id || isWaterK(KM[t])) continue; var i = t % MW, j = (t - i) / MW;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var nt = nj * MW + ni; if (DM[nt] === id) return; if (KM[nt] === K_PIER) return;
      var ex = i * CT + 2 + q[0] * 2, ez = j * CT + 2 + q[1] * 2, ax = q[1] ? 1 : 0, az = q[0] ? 1 : 0; // the edge's middle, and its direction
      if (Math.abs(ex - g.x) < 7.9 && Math.abs(ez - g.z) < 12) return; // the opening at the gate (the turnstiles close it)
      EJFSEG.push({ x: ex, z: ez, ax: ax, az: az, i: i, j: j }); }); }
  return EJFSEG; }
function ejFence(M0, x0, z0, CS, first) { var S = ejFenceSegs(); S.forEach(function (e) { if (e.x < x0 || e.x >= x0 + CS || e.z < z0 || e.z >= z0 + CS) return; ejFenceRun(M0, e.x - e.ax * 2, e.z - e.az * 2, e.x + e.ax * 2, e.z + e.az * 2, first, (e.i + e.j) % 2); }); }
function ejFenceRun(M0, xa, za, xb, zb, first, odd) { var ya = groundY(xa, za), yb = groundY(xb, zb), H = 3.0, dx = xb - xa, dz = zb - za, l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, len = l;
  // the bars: a panel each side (see-through), top and bottom rails, a post at the start with a red cap
  [1, -1].forEach(function (sd) { var o = sd * 0.02; M0.quad([xa + nx * o, ya + 0.12, za + nz * o], [xb + nx * o, yb + 0.12, zb + nz * o], [xb + nx * o, yb + H - 0.15, zb + nz * o], [xa + nx * o, ya + H - 0.15, za + nz * o], uvR(len / 1.2, 2.4), TL('bars'), litc('#1a1416', [nx * sd, 0, nz * sd]), [nx * sd, 0, nz * sd]); });
  [[0.12, 0.2], [H - 0.25, H - 0.15], [H * 0.5, H * 0.5 + 0.06]].forEach(function (r) { M0.quad([xa, ya + r[1], za], [xb, yb + r[1], zb], [xb + nx * 0.05, yb + r[1], zb + nz * 0.05], [xa + nx * 0.05, ya + r[1], za + nz * 0.05], UV1, TL('white'), litc('#1a1416', [0, 1, 0]), [0, 1, 0]);
    [1, -1].forEach(function (sd) { M0.quad([xa + nx * 0.04 * sd, ya + r[0], za + nz * 0.04 * sd], [xb + nx * 0.04 * sd, yb + r[0], zb + nz * 0.04 * sd], [xb + nx * 0.04 * sd, yb + r[1], zb + nz * 0.04 * sd], [xa + nx * 0.04 * sd, ya + r[1], za + nz * 0.04 * sd], UV1, TL('white'), litc('#2a1a1e', [nx * sd, 0, nz * sd]), [nx * sd, 0, nz * sd]); }); });
  boxC(M0, xa - 0.08, ya - 0.1, za - 0.08, xa + 0.08, ya + H + 0.1, za + 0.08, '#141012'); ell(M0, xa, ya + H + 0.2, za, 0.11, 0.14, 0.11, odd ? '#c4121c' : '#8a1016', 5, 3);
  if (first) addBox(Math.min(xa, xb) - 0.1, Math.min(za, zb) - 0.1, Math.max(xa, xb) + 0.1, Math.max(za, zb) + 0.1, Math.min(ya, yb) - 1, Math.max(ya, yb) + H); }

/* ---------------- the entrance: turnstiles across the opening in the fence, a ticket kiosk at each end ----------------
   $30 to get in (it asks first; once paid you can come and go for the rest of the day; free while you are on a job);
   leaving is free. You walk through, the turnstile turns. */
HIPAINT.ej_entry = parkSign('EJACULAND  ·  ENTRY $30', '#12040a', '#ffe36a'); HIPAINT.ej_tix = parkSign('TICKETS', '#c4121c', '#f1e7d0'); HIPAINT.ej_exit = parkSign('WAY OUT', '#12040a', '#7aff6a');
var EJT = null;
function ejTurn() { if (EJT) return EJT; var g = ejGate(), z = 2400, xa = g.x - 8, xb = g.x + 8, y = groundY(g.x, z), m = new R3.Mesh(), gl = new R3.Mesh(), gs = new R3.Mesh(), lanes = [], la = xa + 2.6, lb = xb - 2.6, n = 6, w = (lb - la) / n;
  boxC(m, xa - 0.2, y - 0.2, z - 2.6, xb + 0.2, y + 0.06, z + 2.6, '#6a6460'); // a concrete apron under it
  for (var k = 0; k <= n; k++) { var x = la + k * w; boxC(m, x - 0.14, y, z - 0.75, x + 0.14, y + 1.0, z + 0.75, '#c8c8d0'); boxC(m, x - 0.15, y + 1.0, z - 0.77, x + 0.15, y + 1.06, z + 0.77, '#2a2a30'); boxC(gl, x - 0.155, y + 0.7, z - 0.3, x + 0.155, y + 0.8, z + 0.3, k % 2 ? '#7aff6a' : '#ff2630');
    if (k < n) lanes.push({ x: x + w / 2, px: x + 0.15, a: 0, spin: 0 }); }
  [[xa, la], [lb, xb]].forEach(function (q, e) { var cx = (q[0] + q[1]) / 2; addBox(q[0], z - 1.5, q[1], z + 1.5, y - 1, y + 2.85); boxC(m, q[0], y, z - 1.2, q[1], y + 2.6, z + 1.2, '#2a1a1e'); boxC(m, q[0] - 0.15, y + 2.6, z - 1.5, q[1] + 0.15, y + 2.85, z + 1.5, '#c4121c');
    standQ(gs, cx, z - 1.22, Math.PI, q[1] - q[0] - 0.5, y + 1.0, y + 2.3, TL('white'), 0.6, 0.6); standQ(gl, cx, z - 1.24, Math.PI, 2.0, y + 2.32, y + 2.58, TL('ej_tix'), 1.2, 0.4, SGUV); boxC(m, q[0] + 0.1, y + 0.95, z - 1.45, q[1] - 0.1, y + 1.02, z - 1.2, '#5a3a20'); });
  [la - 0.1, lb + 0.1].forEach(function (x) { tub(m, [x, y, z + 1.0], [x, y + 4.3, z + 1.0], 0.1, 0.1, '#1a1a1e', 6); }); boxC(m, la - 0.1, y + 3.3, z + 0.92, lb + 0.1, y + 4.3, z + 1.08, '#12040a');
  standQ(gl, g.x, z + 0.9, Math.PI, lb - la - 0.4, y + 3.35, y + 4.25, TL('ej_entry'), 1.2, 0.4, SGUV); standQ(gl, g.x, z + 1.1, 0, lb - la - 0.4, y + 3.35, y + 4.25, TL('ej_exit'), 1.2, 0.4, SGUV);
  var rot = new R3.Mesh(); tub(rot, [0, 0, 0], [0, 1.05, 0], 0.07, 0.07, '#8a8a92', 8); for (var a = 0; a < 3; a++) { var an = a / 3 * 6.283; tub(rot, [0, 0.98, 0], [Math.cos(an) * 0.78, 0.98, Math.sin(an) * 0.78], 0.035, 0.035, '#d8d8e0', 5); }
  var b = addOBB(g.x, z, 0, 8, 0.75, y - 1, y + 3.2); // closed until you pay
  EJT = { m: m.upload(), gl: gl.upload(), gs: gs.upload(), rot: rot.upload(), lanes: lanes, y: y, z: z, xa: xa, xb: xb, booth: [(xa + la) / 2, (lb + xb) / 2] }; return EJT; }
function ejPay(fn) { var free = G.mission || G.ejDay === G.day; if (free) { fn(G.mission ? 'The staff wave you through. You are on a job.' : 'Your wristband is good all day.'); return; }
  KIT.confirm({ title: 'Ejaculand: a day ticket', price: 30, have: Math.floor(SV.money), unit: '$', yes: function () { KIT.closeMenu(); if (SV.money < 30) { toast('Not enough money. $30 to get in.'); return; } money(-30); G.ejDay = G.day; sfx.play('coin'); fn('Wristband on. Come and go all day.'); }, no: KIT.closeMenu }); }
function ejThrough(dir) { var T = ejTurn(), best = T.lanes[0]; T.lanes.forEach(function (l) { if (Math.abs(l.x - P.x) < Math.abs(best.x - P.x)) best = l; }); G.turn = { dir: dir, t: 0, lane: best, from: [P.x, P.z] }; G.talk = 1; }
function ejTurnStep(dt) { var T = EJT; if (!T) return; T.lanes.forEach(function (l) { if (l.spin > 0) { var d = Math.min(l.spin, dt * 3.2); l.a += d; l.spin -= d; } }); var Q = G.turn; if (!Q) return; Q.t += dt;
  var l = Q.lane, z0 = T.z - Q.dir * 1.9, z1 = T.z + Q.dir * 2.2, t = Q.t;
  function go(A, B, f) { var k = clamp(f, 0, 1); P.x = A[0] + (B[0] - A[0]) * k; P.z = A[1] + (B[1] - A[1]) * k; P.y = groundY(P.x, P.z); P.sp = 2.0; P.ph += dt * 4.8; P.a = Math.atan2(B[0] - A[0], B[1] - A[1]); P.ground = true; }
  if (t < 0.7) go(Q.from, [l.x, z0], t / 0.7); else if (t < 1.9) { if (!Q.clk) { Q.clk = 1; l.spin = 2.094; sfx.play('select'); } go([l.x, z0], [l.x, z1], (t - 0.7) / 1.2); }
  else { P.sp = 0; G.turn = null; G.talk = 0; } }
/* ---------------- the car park ---------------- */
HIPAINT.ej_cp = parkSign('EJACULAND CAR PARK', '#12040a', '#f1e7d0'); HIPAINT.ej_pay = parkSign('PAY HERE', '#ffe36a', '#12040a');
var EJCPM = null, EJBAYS = [];
function ejCarPark() { if (EJCPM) return EJCPM; var R = EJCP_RECT, m = new R3.Mesh(), gl = new R3.Mesh(), white = [0.62, 0.62, 0.6], yel = [0.62, 0.52, 0.2];
  function line(x0, z0, x1, z1, w, col) { var dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) || 1, nx = -dz / l * w / 2, nz = dx / l * w / 2, n = Math.max(1, Math.ceil(l / 4));
    for (var k = 0; k < n; k++) { var a = k / n, b = (k + 1) / n, ax = x0 + dx * a, az = z0 + dz * a, bx = x0 + dx * b, bz = z0 + dz * b; m.quad([ax - nx, groundY(ax, az) + 0.04, az - nz], [bx - nx, groundY(bx, bz) + 0.04, bz - nz], [bx + nx, groundY(bx, bz) + 0.04, bz + nz], [ax + nx, groundY(ax, az) + 0.04, az + nz], UV1, TL('white'), col, [0, 1, 0]); } }
  // bays: four double rows, a cross aisle down the middle; cars face the aisle
  var BW = 2.6, BD = 5.0, xs0 = R.x0 + 2, xs1 = R.x1 - 2, cross = [1996, 2002];
  for (var r = 0; r < 4; r++) { var z0 = R.z0 + 2 + r * 16; [[z0, z0 + BD, 1], [z0 + BD, z0 + 2 * BD, -1]].forEach(function (row) { // a row of bays: from its back line to its front
      line(xs0, row[2] > 0 ? row[0] : row[1], xs1, row[2] > 0 ? row[0] : row[1], 0.14, white);
      for (var x = xs0; x <= xs1 + 0.01; x += BW) { if (x > cross[0] - 0.1 && x < cross[1] + BW) continue; line(x, row[0], x, row[1], 0.12, white);
        if (x + BW <= xs1 + 0.01 && !(x + BW > cross[0] && x < cross[1])) EJBAYS.push({ x: x + BW / 2, z: (row[0] + row[1]) / 2, a: row[2] > 0 ? Math.PI : 0, r: r }); } });
    var az = z0 + 2 * BD + 3; for (var ax = xs0 + 6; ax < xs1; ax += 10) line(ax, az, ax + 2.2, az, 0.18, yel); // arrows down the aisles
    for (var lx = xs0 + 8; lx < xs1; lx += 20) { var ly = groundY(lx, z0 + BD); tub(m, [lx, ly, z0 + BD], [lx, ly + 7, z0 + BD], 0.09, 0.07, '#3a3a42', 6); boxC(m, lx - 0.08, ly + 6.85, z0 + BD - 1.2, lx + 0.08, ly + 7.0, z0 + BD + 1.2, '#3a3a42');
      addPost(lx, z0 + BD, 0.15, ly, ly + 7); [-1, 1].forEach(function (s) { boxC(gl, lx - 0.25, ly + 6.75, z0 + BD + s * 1.15 - 0.3, lx + 0.25, ly + 6.85, z0 + BD + s * 1.15 + 0.3, '#fff4dc'); }); } }
  // a low kerb all round, a gap for the way in (south side) and for people (east side)
  function kerb(x0, z0, x1, z1) { var n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 4)); for (var k = 0; k < n; k++) { var ax = x0 + (x1 - x0) * k / n, az = z0 + (z1 - z0) * k / n, bx = x0 + (x1 - x0) * (k + 1) / n, bz = z0 + (z1 - z0) * (k + 1) / n, y = groundY((ax + bx) / 2, (az + bz) / 2);
    boxC(m, Math.min(ax, bx) - 0.15, y - 0.1, Math.min(az, bz) - 0.15, Math.max(ax, bx) + 0.15, y + 0.15, Math.max(az, bz) + 0.15, '#9a948c'); } }
  kerb(R.x0, R.z0, R.x1, R.z0); kerb(R.x0, R.z0, R.x0, R.z1); kerb(R.x0, R.z1, 1990, R.z1); kerb(2010, R.z1, R.x1, R.z1); kerb(R.x1, R.z0, R.x1, 2294); kerb(R.x1, 2300, R.x1, R.z1);
  // the booth and barrier at the way in, the big sign, pay machines
  var by = groundY(2012, R.z1 - 2); boxC(m, 2010.5, by, R.z1 - 3.4, 2013.5, by + 2.6, R.z1 - 0.6, '#2a1a1e'); boxC(m, 2010.3, by + 2.6, R.z1 - 3.6, 2013.7, by + 2.8, R.z1 - 0.4, '#c4121c'); standQ(gl, 2010.45, R.z1 - 2, -Math.PI / 2, 2.0, by + 1.0, by + 2.2, TL('white'), 0.6, 0.6);
  tub(m, [2009.8, by, R.z1 - 0.8], [2009.8, by + 1.1, R.z1 - 0.8], 0.12, 0.12, '#ffe36a', 6); tub(m, [2009.8, by + 1.1, R.z1 - 0.8], [2009.6, by + 5.2, R.z1 - 0.9], 0.05, 0.05, '#c4121c', 5); // the barrier arm, up
  [[2000, R.z1 + 1.5, 0], [R.x1 + 1.5, 2282, Math.PI / 2]].forEach(function (q) { var y = groundY(q[0], q[1]), c = Math.cos(q[2]), s = Math.sin(q[2]); [-2.6, 2.6].forEach(function (o) { tub(m, [q[0] + o * c, y, q[1] - o * s], [q[0] + o * c, y + 5.2, q[1] - o * s], 0.1, 0.1, '#1a1a1e', 6); addPost(q[0] + o * c, q[1] - o * s, 0.14, y, y + 5.2); });
    boxR(m, q[0], q[1], q[2], 3.2, 0.1, y + 3.4, y + 5.4, '#12040a'); standQ(gl, q[0] + Math.sin(q[2]) * 0.12, q[1] + Math.cos(q[2]) * 0.12, q[2], 6.2, y + 3.45, y + 5.35, TL('ej_cp'), 1.2, 0.4, SGUV); standQ(gl, q[0] - Math.sin(q[2]) * 0.12, q[1] - Math.cos(q[2]) * 0.12, q[2] + Math.PI, 6.2, y + 3.45, y + 5.35, TL('ej_cp'), 1.2, 0.4, SGUV); });
  [[1998, 2299], [2020, 2299]].forEach(function (q) { var y = groundY(q[0], q[1]); boxC(m, q[0] - 0.3, y, q[1] - 0.2, q[0] + 0.3, y + 1.6, q[1] + 0.2, '#2a2a32'); standQ(gl, q[0], q[1] + 0.21, 0, 0.5, y + 0.9, y + 1.3, TL('white'), 0.6, 0.6); standQ(gl, q[0], q[1] + 0.22, 0, 0.55, y + 1.35, y + 1.55, TL('ej_pay'), 1.2, 0.4, SGUV); addBox(q[0] - 0.3, q[1] - 0.2, q[0] + 0.3, q[1] + 0.2, y, y + 1.6); });
  addBox(2010.5, R.z1 - 3.4, 2013.5, R.z1 - 0.6, by - 1, by + 2.6);
  EJCPM = { m: m.upload(), gl: gl.upload(), booth: [2011.2, R.z1 - 2], boothA: -Math.PI / 2 }; return EJCPM; }
// parked cars: real cars (you can take one), about two thirds of the bays, while you are near
var EJPV = [];
function ejParked(dt) { if ((G.ejpT = (G.ejpT || 0) - dt) > 0 || G.interior) return; G.ejpT = 1.0; ejCarPark(); var cx = (EJCP_RECT.x0 + EJCP_RECT.x1) / 2, cz = (EJCP_RECT.z0 + EJCP_RECT.z1) / 2, d = Math.hypot(P.x - cx, P.z - cz);
  var types = ['hatch', 'saloon', 'saloon', 'muscle', 'hatch', 'sports', 'saloon', 'van'];
  EJBAYS.forEach(function (b, i) { if (hash2(Math.round(b.x), Math.round(b.z), 31) > 0.42) return; var v = EJPV[i];
    if (d < 120 && !v && !(G.guest && G.netSync)) { var tp = types[Math.floor(hash2(i, 3, 5) * types.length)]; if (!VT[tp]) tp = 'saloon'; var nv = makeVeh(tp, b.x, b.z, b.a, {}); nv.y = groundY(b.x, b.z); nv.parked = 1; nv.keep = 0; nv.ejp = i; nv.home = [b.x, b.z]; EJPV[i] = nv; }
    else if (v && (VEH.indexOf(v) < 0 || d > 220)) { if (VEH.indexOf(v) >= 0 && Math.hypot(v.x - v.home[0], v.z - v.home[1]) < 2 && v !== P.veh) VEH.splice(VEH.indexOf(v), 1); if (VEH.indexOf(v) < 0 || Math.hypot(v.x - v.home[0], v.z - v.home[1]) >= 2) EJPV[i] = null; } }); }
(function () { var df = despawnFar; despawnFar = function () { var keep = VEH.filter(function (v) { return v.ejp !== undefined && v !== P.veh; }); df(); keep.forEach(function (v) { if (VEH.indexOf(v) < 0 && EJPV[v.ejp] === v && Math.hypot(v.x - P.x, v.z - P.z) < 220) VEH.push(v); }); }; })();
/* ---------------- the footpaths: from both sides of the Ejaculand station (lifts and stairs) down to the entrance,
   a path from the car park, a paved square in front of the gate; lamps along them, a crossing over the side road ---- */
var EJPATHM = null;
function ejPaths() { if (EJPATHM) return EJPATHM; var m = new R3.Mesh(), gl = new R3.Mesh(), T = TL('paver'), g = ejGate(), L = spzBuild().lines[1], S = L.st[L.st.length - 1], W = [];
  [-1, 1].forEach(function (sg) { var Sd = S.side[sg], st = Sd.stairIn, lg = Sd.ground, x = sg > 0 ? 2072 : 2104; W.push([[lg[0], lg[1]], [x, lg[1] + 1.5], [x, 2392], [g.x + (sg > 0 ? -6 : 6), 2395]]); W.push([[st[0], st[1]], [x, st[1] + 0.5]]); });
  W.push([[EJCP_RECT.x1 + 0.5, 2297], [2072, 2297]]); // from the car park's people gap
  function strip(pts, w) { for (var k = 0; k < pts.length - 1; k++) { var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l * w / 2, nz = dx / l * w / 2, n = Math.max(1, Math.ceil(l / 2));
      for (var q = 0; q < n; q++) { var f0 = q / n, f1 = (q + 1) / n, ax = a[0] + dx * f0, az = a[1] + dz * f0, bx = a[0] + dx * f1, bz = a[1] + dz * f1, ya = groundY(ax, az) + 0.09, yb = groundY(bx, bz) + 0.09, u0 = (k * 50 + l * f0) / 2, u1 = (k * 50 + l * f1) / 2;
        m.quad([ax - nx, ya, az - nz], [bx - nx, yb, bz - nz], [bx + nx, yb, bz + nz], [ax + nx, ya, az + nz], [0, u0, 0, u1, w / 2, u1, w / 2, u0], T, lit([0, 1, 0]), [0, 1, 0]);
        [-1, 1].forEach(function (sd) { m.quad([ax + nx * sd, ya - 0.08, az + nz * sd], [bx + nx * sd, yb - 0.08, bz + nz * sd], [bx + nx * sd * 1.06, yb + 0.03, bz + nz * sd * 1.06], [ax + nx * sd * 1.06, ya + 0.03, az + nz * sd * 1.06], UV1, TL('kerb'), lit([0, 1, 0]), [0, 1, 0]); }); } } }
  W.forEach(function (pts) { strip(pts, 3.2); });
  // the square in front of the gate
  for (var x = g.x - 16; x < g.x + 16; x += 2) for (var z = 2388; z < 2399.5; z += 2) { var y00 = groundY(x, z) + 0.1, y10 = groundY(x + 2, z) + 0.1, y01 = groundY(x, z + 2) + 0.1, y11 = groundY(x + 2, z + 2) + 0.1; m.quad([x, y00, z], [x, y01, z + 2], [x + 2, y11, z + 2], [x + 2, y10, z], [0, 0, 0, 1, 1, 1, 1, 0], T, lit([0, 1, 0]), [0, 1, 0]); }
  // lamps along the long paths
  W.forEach(function (pts) { var acc = 0; for (var k = 0; k < pts.length - 1; k++) { var a = pts[k], b = pts[k + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); for (var s = 9 - (acc % 18); s < l; s += 18) { var f = s / l, px = a[0] + (b[0] - a[0]) * f + 2.0, pz = a[1] + (b[1] - a[1]) * f, y = groundY(px, pz);
      tub(m, [px, y, pz], [px, y + 4.4, pz], 0.07, 0.06, '#1a1416', 6); ell(gl, px, y + 4.5, pz, 0.28, 0.32, 0.28, '#fff0c8', 6, 4); ell(m, px, y + 4.75, pz, 0.32, 0.1, 0.32, '#c4121c', 6, 3); addPost(px, pz, 0.12, y, y + 4.5); } acc += l; } });
  // a zebra crossing where the west path crosses the side road
  var rz = null; for (var z2 = 2320; z2 < 2350; z2 += 0.5) if (kAt(2072, z2) === K_ROAD) { if (rz === null) rz = [z2, z2]; rz[1] = z2; }
  if (rz) for (var x2 = 2070.6; x2 < 2073.6; x2 += 0.6) { var y2 = groundY(x2, rz[0]); m.quad([x2, y2 + 0.07, rz[0] - 0.5], [x2, y2 + 0.07, rz[1] + 0.5], [x2 + 0.35, y2 + 0.07, rz[1] + 0.5], [x2 + 0.35, y2 + 0.07, rz[0] - 0.5], UV1, TL('white'), [0.6, 0.6, 0.58], [0, 1, 0]); }
  EJPATHM = { m: m.upload(), gl: gl.upload() }; return EJPATHM; }
/* ---------------- staff: in the ticket kiosks, at the car park booth ---------------- */
var EJSTAFF = [];
function ejStaffPlaces() { var T = ejTurn(), C = ejCarPark(); return [{ x: T.booth[0], z: T.z, a: Math.PI }, { x: T.booth[1], z: T.z, a: Math.PI }, { x: C.booth[0] + 0.4, z: C.booth[1], a: C.boothA }].concat(window.EJRSTAFF ? EJRSTAFF() : []); }
// each person is there while you are within 110 m of their spot (and put back if a doorway cleared the street)
function ejStaffStep() { if (G.interior || (G.guest && G.netSync)) return; if ((G.ejsT = (G.ejsT || 0) - 1 / 60) > 0) return; G.ejsT = 0.5; var L = ejStaffPlaces();
  L.forEach(function (q, i) { var p = EJSTAFF[i], d = Math.hypot(P.x - q.x, P.z - q.z); if (p && PEDS.indexOf(p) < 0) p = EJSTAFF[i] = null;
    if (!p && d < 110) { p = makePed({ x: q.x, z: q.z, a: q.a, kind: 'cit', rig: rigFor('cit'), state: 'idle', keep: 1 }); p.god = 1; p.staff = 1; p.y = groundY(q.x, q.z);
      p.ctl = function (pp) { pp.vx = pp.vz = 0; pp.x = q.x; pp.z = q.z; pp.a = q.a; pp.sp = 0; pp.y = groundY(q.x, q.z); }; EJSTAFF[i] = p; }
    else if (p && d > 140) { PEDS.splice(PEDS.indexOf(p), 1); EJSTAFF[i] = null; } }); }
(function () {
  var ws = worldSetup; worldSetup = function () { ws(); try { var T = ejTurn(), g = ejGate();
    G.uses.push({ x: g.x, z: T.z - 2.6, r: 3.5, label: 'ENTER EJACULAND ($30 DAY TICKET)', fn: function () { ejPay(function (msg) { toast(msg); ejThrough(1); }); } });
    G.uses.push({ x: g.x, z: T.z + 2.6, r: 3.5, label: 'LEAVE EJACULAND', fn: function () { ejThrough(-1); } }); } catch (e) { console.warn('ej', e); } };
  var sf = stepFun; stepFun = function (dt) { sf(dt); try { ejTurnStep(dt); ejParked(dt); ejStaffStep(); } catch (e) { if (!window.__ejE) { window.__ejE = 1; console.warn(e); } } };
  var sfo = stepFoot; stepFoot = function (dt) { if (G.turn) { P.vx = P.vz = 0; return; } return sfo(dt); };
  var df = drawFun; drawFun = function () { df(); if (G.interior) return; try { var g = ejGate(); if (dist2(g.x, g.z, CAM.x, CAM.z) < 600 * 600) { var T = ejTurn(); R3.draw(T.m, ATT); R3.draw(T.gl, ATT, { lit: false }); T.lanes.forEach(function (l) { R3.draw(T.rot, ATT, { m: MD(l.px, T.y, T.z, l.a, 0, 0) }); }); R3.draw(T.gs, ATT, { alpha: 0.35 });
      var C = ejCarPark(), Pm = ejPaths(); R3.draw(C.m, ATT); R3.draw(C.gl, ATT, { lit: false }); R3.draw(Pm.m, ATT); R3.draw(Pm.gl, ATT, { lit: false }); } } catch (e) { if (!window.__ejD) { window.__ejD = 1; console.warn(e); } } };
})();
