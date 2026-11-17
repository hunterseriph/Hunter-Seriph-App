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
  var A = v.ai, E = A.E, nd = railEndNode(A), opts = nd.e.filter(function (e) { return e !== E.i && RE[e].len > 8 && !RE[e].off && !RE[e].track; }); /* update 159: never down a country track: they end inside the farm or the petrol station */
  var NE = opts.length ? RE[pick(opts)] : E, nback = NE === E ? !A.back : NE.b === nd.i, cutE = railCut(E, nd), cutS = railCut(NE, nd);
  var p0 = edgeAt(E, E.len - cutE, A.back, A.lane), p3 = edgeAt(NE, cutS, nback, laneOf(NE)), k = Math.max(2, Math.hypot(p3.x - p0.x, p3.z - p0.z) * 0.45);
  var T = { p: [[p0.x, p0.z], [p0.x + p0.dx * k, p0.z + p0.dz * k], [p3.x - p3.dx * k, p3.z - p3.dz * k], [p3.x, p3.z]], NE: NE, nback: nback, cutS: cutS, node: nd.i, len: 0, lane: laneOf(NE) };
  var q = bez(T, 0); for (var i = 1; i <= 10; i++) { var r = bez(T, i / 10); T.len += Math.hypot(r.x - q.x, r.z - q.z); q = r; }
  T.bend = Math.abs(angDiff(Math.atan2(p0.dx, p0.dz), Math.atan2(p3.dx, p3.dz))); return T; }
function lockedByOther(nd, v) { var L = NLOCK[nd.i]; if (!L || L.v === v || L.v.dead || !L.v.ai || L.v.ai.phys || VEH.indexOf(L.v) < 0) { if (L && L.v !== v) delete NLOCK[nd.i]; return false; } /* a car that was despawned or towed while crossing used to keep the junction locked for ever */ return L.v.ai.turn ? L.v.ai.turn.node === nd.i : false; } // held while its car is in the junction, however long that takes
function exitBlocked(v, T) { var p = T.p[3], d = [p[0] - T.p[2][0], p[1] - T.p[2][1]], l = Math.hypot(d[0], d[1]) || 1; d[0] /= l; d[1] /= l; // a stopped car in my exit lane, just past the junction
  for (var i = 0; i < VEH.length; i++) { var o = VEH[i]; if (o === v || o.dead) continue; var dx = o.x - p[0], dz = o.z - p[1]; if (Math.abs(dx) > 14 || Math.abs(dz) > 14) continue; var fw = dx * d[0] + dz * d[1], lat = Math.abs(dx * d[1] - dz * d[0]); if (fw < -1 || fw > 9 || lat > 1.6) continue;
    var sp = o.ai && !o.ai.phys ? (o.ai.sp || 0) : Math.abs(o.sp || 0); if (sp < 2.5) return true; } return false; }
function railPlace(v, ds) { var A = v.ai, q;
  if (!A.turn) { A.s += ds; var nd = railEndNode(A), cutE = railCut(A.E, nd);
    if (A.s >= A.E.len - cutE) { if (!A.plan) A.plan = railPlan(v); // update 158: never start a turn through a junction someone else is crossing, nor into a road with no room at the far side (it gridlocked)
      if (nd.e.length >= 3 && (lockedByOther(nd, v) || exitBlocked(v, A.plan))) { A.s = A.E.len - cutE; A.sp = 0; }
      else { if (nd.e.length >= 3) NLOCK[nd.i] = { v: v, t: G.t }; var over = A.s - (A.E.len - cutE); A.turn = A.plan; A.plan = null; A.tt = over; } } }
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
  function ahead(x, z, r, half, why, o) { var dx = x - v.x, dz = z - v.z, fwd = dx * f[0] + dz * f[1], lat = Math.abs(dx * f[1] - dz * f[0]); if (fwd > 0 && fwd < look + 6 && lat < r) { var g = fwd - v.t.len / 2 - (half || 0.4); if (g < gap) { gap = g; A.why = why; A.blk = o || null; } } }
  for (var j = 0; j < VEH.length; j++) { var o = VEH[j]; if (o === v || o.dead && o.t.cls === 'heli') continue; if (A.ghost > 0 && o.ai && !o.ai.phys) continue; if (A.turn && o.ai && !o.ai.phys && !o.ai.turn && (o.ai.E !== A.turn.NE || o.ai.back !== A.turn.nback)) continue; /* crossing a junction: the cars waiting at its other lines are not in the way (they waited for me, I waited for them: deadlock) */ /* a car stuck nose to nose for ages squeezes past */ if (Math.abs(o.x - v.x) > 40 || Math.abs(o.z - v.z) > 40) continue; ahead(o.x, o.z, (o.t.wid + v.t.wid) * 0.5 + (o.parked ? -0.05 : 0.2), o.t.len / 2, o.ai && !o.ai.phys ? (o.ai.sp < 0.3 ? 'carStopped' : 'car') : 'parked', o); }
  if (P.state !== 'car') ahead(P.x, P.z, v.t.wid / 2 + 0.6); else if (P.veh && P.veh !== v) {} // the player's car is in VEH already
  for (var k = 0; k < PEDS.length; k++) { var p = PEDS[k]; if (A.nudge > 0) break; if (p.inVeh || p.dead || Math.abs(p.x - v.x) > 30 || Math.abs(p.z - v.z) > 30) continue; ahead(p.x, p.z, v.t.wid / 2 + 0.5, 0.4, 'ped'); }
  if (G.coop && G.coop.others) G.coop.others.forEach(function (o) { if (!o.veh) ahead(o.x, o.z, v.t.wid / 2 + 0.6); });
  // a junction ahead: wait at the line if another car is crossing it
  if (!A.turn) { var nd = railEndNode(A), toEnd = A.E.len - railCut(A.E, nd) - A.s; if (nd.e.length >= 3 && toEnd < 9 && (lockedByOther(nd, v) || (A.plan && exitBlocked(v, A.plan)))) { if (toEnd - 0.5 < gap) { gap = toEnd - 0.5; A.why = 'lock'; } } } // update 158: slow for a busy junction; the lock itself is only taken as the turn starts (railPlace)
  if (gap >= 99) A.why = '';
  var target = gap < 99 ? Math.min(want, Math.max(0, (gap - 2.2) * 1.2)) : want;
  A.sp += clamp(target - A.sp, -11 * dt, 3.6 * dt); if (A.sp < 0) A.sp = 0;
  railPlace(v, A.sp * dt);
  if (A.sp < 0.3 && gap < 4) { A.wait = (A.wait || 0) + dt; if (A.wait > 5 && Math.random() < dt * 0.4) honk(v); if (A.wait > 12 && A.blk && A.blk.ai && Math.abs(angDiff(v.a, A.blk.a)) > 2.2) { A.ghost = 3; A.wait = 0; } /* only nose to nose: a queue waits its turn */ } else A.wait = 0; if (A.ghost > 0) A.ghost -= dt; if (A.sp < 0.3 && A.why === 'ped') { A.pedW = (A.pedW || 0) + dt; if (A.pedW > 3) { A.nudge = 3; A.pedW = 0; honk(v); } } else A.pedW = 0; if (A.nudge > 0) A.nudge -= dt; /* someone dawdling in the road: a honk, then the car edges on (they step aside) */
}
function railResume(v) { // back on the road after a knock: find the lane it is facing along
  var A = v.ai, r = nearestRoad(v.x, v.z, 5); if (!r) return false; var fa = Math.atan2(r.dx, r.dz), back = Math.abs(angDiff(v.a, fa)) > Math.PI / 2;
  if (Math.abs(angDiff(v.a, back ? fa + Math.PI : fa)) > 0.6) return false; var s = back ? r.E.len - r.s : r.s; if (s > r.E.len - 6) return false;
  A.E = r.E; A.back = back; A.s = s; A.lane = laneOf(r.E); A.turn = null; A.lastTurn = null; A.phys = 0; A.sp = 0; return true; }
function laneOf(E) { return E.w >= 11 ? E.w / 4 - 0.25 : E.w / 4; }
