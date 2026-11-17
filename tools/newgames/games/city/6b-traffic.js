/* ---------- update 156: traffic on rails (he said everyone drove drunk, crashed all the time and a lot drove backwards).
   A traffic car no longer steers itself with the car physics. It rides its lane exactly: along the road at `A.s`,
   and through a junction on a smooth curve (`A.turn`, a cubic from the end of its lane to the start of the next).
   It speeds up and slows down (`A.sp`), keeps a gap to whatever is ahead in its lane (cars, you, people crossing),
   and only one car crosses a junction at a time (`NLOCK`). Dead ends turn round on a curve too.
   The moment you hit it, or its driver is hurt, scared off or killed, it drops onto the real car physics (`A.phys`);
   once it has stopped and the road is near it climbs back onto its lane (`railResume`). Cheap: no collision tests. ---------- */
var NLOCK = {};
function nodeR(nd) { var w = 6; nd.e.forEach(function (ei) { w = Math.max(w, RE[ei].w); }); return w * 0.62 + 1.2; }
function bez(T, t) { var u = 1 - t, P0 = T.p[0], P1 = T.p[1], P2 = T.p[2], P3 = T.p[3], a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  var x = a * P0[0] + b * P1[0] + c * P2[0] + d * P3[0], z = a * P0[1] + b * P1[1] + c * P2[1] + d * P3[1];
  var dx = 3 * u * u * (P1[0] - P0[0]) + 6 * u * t * (P2[0] - P1[0]) + 3 * t * t * (P3[0] - P2[0]), dz = 3 * u * u * (P1[1] - P0[1]) + 6 * u * t * (P2[1] - P1[1]) + 3 * t * t * (P3[1] - P2[1]), l = Math.hypot(dx, dz) || 1;
  return { x: x, z: z, dx: dx / l, dz: dz / l }; }
function railEndNode(A) { return RN[A.back ? A.E.a : A.E.b]; }
function railCut(E, nd) { return Math.min(nodeR(nd), E.len * 0.42); }
function railPlan(v) { // the curve through the junction ahead
  var A = v.ai, E = A.E, nd = railEndNode(A), opts = nd.e.filter(function (e) { return e !== E.i && RE[e].len > 8 && !RE[e].off; });
  var NE = opts.length ? RE[pick(opts)] : E, nback = NE === E ? !A.back : NE.b === nd.i, cutE = railCut(E, nd), cutS = railCut(NE, nd);
  var p0 = edgeAt(E, E.len - cutE, A.back, A.lane), p3 = edgeAt(NE, cutS, nback, laneOf(NE)), k = Math.max(2, Math.hypot(p3.x - p0.x, p3.z - p0.z) * 0.45);
  var T = { p: [[p0.x, p0.z], [p0.x + p0.dx * k, p0.z + p0.dz * k], [p3.x - p3.dx * k, p3.z - p3.dz * k], [p3.x, p3.z]], NE: NE, nback: nback, cutS: cutS, node: nd.i, len: 0, lane: laneOf(NE) };
  var q = bez(T, 0); for (var i = 1; i <= 10; i++) { var r = bez(T, i / 10); T.len += Math.hypot(r.x - q.x, r.z - q.z); q = r; }
  T.bend = Math.abs(angDiff(Math.atan2(p0.dx, p0.dz), Math.atan2(p3.dx, p3.dz))); return T; }
function railPlace(v, ds) { var A = v.ai, q;
  if (!A.turn) { A.s += ds; var nd = railEndNode(A), cutE = railCut(A.E, nd);
    if (A.s >= A.E.len - cutE) { var over = A.s - (A.E.len - cutE); A.turn = railPlan(v); A.tt = over; } }
  if (A.turn) { A.tt += A.turn === A.lastTurn ? ds : 0; A.lastTurn = A.turn; if (A.tt >= A.turn.len) { var T = A.turn; A.E = T.NE; A.back = T.nback; A.lane = T.lane; A.s = T.cutS + (A.tt - T.len); A.turn = null; A.lastTurn = null; if (NLOCK[T.node] && NLOCK[T.node].v === v) delete NLOCK[T.node]; A.want = (A.E.w > 11 ? 19 : 13) + rnd(-2, 2); } }
  if (A.turn) q = bez(A.turn, clamp(A.tt / A.turn.len, 0, 1)); else q = edgeAt(A.E, A.s, A.back, A.lane);
  var na = Math.atan2(q.dx, q.dz), da = angDiff(v.a, na); v.steer = clamp(da * 8, -1, 1); v.a = na; v.x = q.x; v.z = q.z;
  var gy = groundY(q.x, q.z), gf = groundY(q.x + q.dx * 1.6, q.z + q.dz * 1.6), gb = groundY(q.x - q.dx * 1.6, q.z - q.dz * 1.6); v.y = gy; v.pitch = Math.atan2(gf - gb, 3.2) * -1; v.roll = 0; v.air = 0;
  v.sp = A.sp || 0; v.vx = q.dx * v.sp; v.vz = q.dz * v.sp; v.wheelA = (v.wheelA || 0) + ds / 0.35; }
function railStep(v, dt) { var A = v.ai, dr = v.driver;
  if (A.sp === undefined) A.sp = Math.max(0, v.sp || 0);
  if (!dr || dr.dead || dr.inVeh !== v) { A.phys = 1; return; }
  var want = A.want; if (dr.fear > 0 || A.flee) want = 24; if (A.turn) want = Math.min(want, A.turn.bend > 1.2 ? 7 : A.turn.bend > 0.4 ? 10 : want);
  // what is ahead in my lane
  var f = [Math.sin(v.a), Math.cos(v.a)], gap = 99, look = 10 + A.sp * 1.4;
  function ahead(x, z, r, half, why) { var dx = x - v.x, dz = z - v.z, fwd = dx * f[0] + dz * f[1], lat = Math.abs(dx * f[1] - dz * f[0]); if (fwd > 0 && fwd < look + 6 && lat < r) { var g = fwd - v.t.len / 2 - (half || 0.4); if (g < gap) { gap = g; A.why = why; } } }
  for (var j = 0; j < VEH.length; j++) { var o = VEH[j]; if (o === v || o.dead && o.t.cls === 'heli') continue; if (Math.abs(o.x - v.x) > 40 || Math.abs(o.z - v.z) > 40) continue; ahead(o.x, o.z, (o.t.wid + v.t.wid) * 0.5 + (o.parked ? -0.05 : 0.2), o.t.len / 2, o.ai && !o.ai.phys ? (o.ai.sp < 0.3 ? 'carStopped' : 'car') : 'parked'); }
  if (P.state !== 'car') ahead(P.x, P.z, v.t.wid / 2 + 0.6); else if (P.veh && P.veh !== v) {} // the player's car is in VEH already
  for (var k = 0; k < PEDS.length; k++) { var p = PEDS[k]; if (p.inVeh || p.dead || Math.abs(p.x - v.x) > 30 || Math.abs(p.z - v.z) > 30) continue; ahead(p.x, p.z, v.t.wid / 2 + 0.5, 0.4, 'ped'); }
  if (G.coop && G.coop.others) G.coop.others.forEach(function (o) { if (!o.veh) ahead(o.x, o.z, v.t.wid / 2 + 0.6); });
  // a junction ahead: wait at the line if another car is crossing it
  if (!A.turn) { var nd = railEndNode(A), toEnd = A.E.len - railCut(A.E, nd) - A.s; if (nd.e.length >= 3 && toEnd < 9) { var L = NLOCK[nd.i]; if (L && L.v !== v && !L.v.dead && L.v.ai && L.v.ai.turn && G.t - L.t < 6) { if (toEnd - 0.5 < gap) { gap = toEnd - 0.5; A.why = 'lock'; } } else if (toEnd < 3) NLOCK[nd.i] = { v: v, t: G.t }; } }
  if (gap >= 99) A.why = '';
  var target = gap < 99 ? Math.min(want, Math.max(0, (gap - 2.2) * 1.2)) : want;
  A.sp += clamp(target - A.sp, -11 * dt, 3.6 * dt); if (A.sp < 0) A.sp = 0;
  railPlace(v, A.sp * dt);
  if (A.sp < 0.3 && gap < 4) { A.wait = (A.wait || 0) + dt; if (A.wait > 5 && Math.random() < dt * 0.4) honk(v); } else A.wait = 0;
}
function railResume(v) { // back on the road after a knock: find the lane it is facing along
  var A = v.ai, r = nearestRoad(v.x, v.z, 5); if (!r) return false; var fa = Math.atan2(r.dx, r.dz), back = Math.abs(angDiff(v.a, fa)) > Math.PI / 2;
  if (Math.abs(angDiff(v.a, back ? fa + Math.PI : fa)) > 0.6) return false; var s = back ? r.E.len - r.s : r.s; if (s > r.E.len - 6) return false;
  A.E = r.E; A.back = back; A.s = s; A.lane = laneOf(r.E); A.turn = null; A.lastTurn = null; A.phys = 0; A.sp = 0; return true; }
function laneOf(E) { return E.w >= 11 ? E.w / 4 - 0.25 : E.w / 4; }
