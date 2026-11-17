/* ---------- update 157 (his ask: objectives need GPS lines to show you the way): the shortest way along the roads from
   you to the mission marker (or your own waypoint, or Cumhead's marker in co-op) is worked out with A* over the road
   graph (RN nodes, RE edges) and drawn as a line on the radar and on the map, GTA style: yellow for a mission, purple for
   your own waypoint. It is worked out again when the target moves or you leave the line. ---------- */
var GPS = { path: null, key: '', t: 0 };
function gpsTarget() { var m = G.mission && G.mission.mark; if (m && m.x !== undefined) return { x: m.x, z: m.z, c: '#ffe36a' }; if (G.coopMark) return { x: G.coopMark.x, z: G.coopMark.z, c: '#ffe36a' }; if (SV.way) return { x: SV.way[0], z: SV.way[1], c: '#c48aff' }; return null; }
function gpsNode(x, z) { var r = nearestRoad(x, z, 400); if (!r) return null; var A = RN[r.E.a], B = RN[r.E.b]; return { r: r, n: Math.hypot(A.x - r.x, A.z - r.z) < Math.hypot(B.x - r.x, B.z - r.z) ? A.i : B.i, other: Math.hypot(A.x - r.x, A.z - r.z) < Math.hypot(B.x - r.x, B.z - r.z) ? B.i : A.i }; }
function gpsRoute(sx, sz, tx, tz) { var S = gpsNode(sx, sz), T = gpsNode(tx, tz); if (!S || !T) return null;
  // A* from both ends of my road to both ends of the target's road
  var open = [], g = {}, from = {}, closed = {}, goal = {}; goal[T.n] = 1; goal[T.other] = 1;
  [S.n, S.other].forEach(function (n) { g[n] = Math.hypot(RN[n].x - sx, RN[n].z - sz); open.push(n); from[n] = -1; });
  var h = function (n) { return Math.hypot(RN[n].x - tx, RN[n].z - tz); }, end = null, guard = 0;
  while (open.length && guard++ < 6000) { var bi = 0; for (var i = 1; i < open.length; i++) if (g[open[i]] + h(open[i]) < g[open[bi]] + h(open[bi])) bi = i; var cur = open.splice(bi, 1)[0]; if (closed[cur]) continue; closed[cur] = 1; if (goal[cur]) { end = cur; break; }
    RN[cur].e.forEach(function (ei) { var E = RE[ei]; if (E.off) return; var nb = E.a === cur ? E.b : E.a; if (closed[nb]) return; var ng = g[cur] + E.len; if (g[nb] === undefined || ng < g[nb]) { g[nb] = ng; from[nb] = cur; from[nb + ':e'] = ei; open.push(nb); } }); }
  if (end === null) return null;
  var nodes = []; for (var c = end; c !== -1 && c !== undefined; c = from[c]) nodes.unshift(c);
  var pts = [[sx, sz], [S.r.x, S.r.z]]; for (var k = 0; k < nodes.length; k++) { var ei = from[nodes[k] + ':e']; if (ei !== undefined && k > 0) { var E = RE[ei], fwd = E.a === nodes[k - 1]; var ps = fwd ? E.pts : E.pts.slice().reverse(); ps.forEach(function (p) { pts.push(p); }); } else pts.push([RN[nodes[k]].x, RN[nodes[k]].z]); }
  pts.push([T.r.x, T.r.z]); pts.push([tx, tz]); return pts; }
function stepGps(dt) { var T = gpsTarget(); if (!T || !P) { GPS.path = null; return; } var px = P.state === 'car' && P.veh ? P.veh.x : P.x, pz = P.state === 'car' && P.veh ? P.veh.z : P.z, key = Math.round(T.x / 8) + ',' + Math.round(T.z / 8);
  GPS.t -= dt; var off = GPS.path ? gpsOff(px, pz) : 999; if (key !== GPS.key || off > 25 || GPS.t <= 0) { GPS.key = key; GPS.t = 3; GPS.path = Math.hypot(T.x - px, T.z - pz) < 30 ? null : gpsRoute(px, pz, T.x, T.z); GPS.c = T.c; }
  if (GPS.path) { GPS.path[0] = [px, pz]; } }
function gpsOff(x, z) { var P0 = GPS.path, best = 1e9; for (var i = 1; i < Math.min(P0.length, 40); i++) { var a = P0[i - 1], b = P0[i], dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1, t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / l, 0, 1), d = Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z); if (d < best) best = d; } return best; }
function gpsDraw(ctx, W2S, width) { if (!GPS.path) return; ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); GPS.path.forEach(function (p, i) { var s = W2S(p[0], p[1]); if (i) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]); });
  ctx.strokeStyle = '#12040a'; ctx.lineWidth = width + 2; ctx.stroke(); ctx.strokeStyle = GPS.c || '#ffe36a'; ctx.lineWidth = width; ctx.stroke(); ctx.restore(); }
