/* ---------- update 163 (his playtest) ---------- */

/* ---- bridges: the deck meets the road exactly at both ends (the ground was reshaped after the deck was laid, so the
   deck started a step above or below the road: the gap he saw and the bump cars hit) ---- */
(function () { BSPAN.forEach(function (S) { var P2 = S.pts, n = P2.length, hw = S.hw;
  function gMax(p) { var nx = -p.dz, nz = p.dx, g = -1e9; [-hw + 0.3, 0, hw - 0.3].forEach(function (o) { var x = p.x + nx * o, z = p.z + nz * o; if (!isWaterK(kAt(x, z))) g = Math.max(g, groundY(x, z)); }); return g; }
  [0, n - 1].forEach(function (e) { var p0 = P2[e]; if (isWaterK(kAt(p0.x, p0.z))) return; var d0 = groundY(p0.x, p0.z) - p0.y;
    for (var q = 0; q < n; q++) { var d = Math.abs(P2[q].s - p0.s); if (d > 12) continue; var w = 1 - d / 12; w = w * w * (3 - 2 * w); P2[q].y += d0 * w; } });
  var G0 = P2.map(gMax); for (var pass = 0; pass < 4; pass++) { for (var q2 = 0; q2 < n; q2++) if (G0[q2] > P2[q2].y - 0.02) P2[q2].y = G0[q2] + 0.02; /* the ground never pokes up through the deck */
    if (pass < 3) for (var q3 = 1; q3 < n - 1; q3++) P2[q3].y = (P2[q3 - 1].y + P2[q3].y * 2 + P2[q3 + 1].y) / 4; } }); })();

/* ---- people walk on pavements, never on grass, verges or off cliffs; at the end of the pavement they turn round ---- */
function paveOK(x, z) { var k = kAt(x, z); if (k === K_PAVE || k === K_LOT || k === K_YARD || k === K_PIER) return true; if (k === K_PARK && dAt(x, z).id === 'ejac') return true; return false; }
function pedPt(p, E, s, back, side) { return edgeAt(E, clamp(s, 0, E.len), back, side * (E.w / 2 + 2.0)); }
(function () {
  var sp = spawnPeds; spawnPeds = function () { var n0 = PEDS.length; sp(); for (var i = PEDS.length - 1; i >= n0; i--) { var p = PEDS[i]; if (p.E && !p.inVeh && !paveOK(p.x, p.z)) PEDS.splice(i, 1); } };
  function reverse(p) { p.back = !p.back; p.s = Math.max(0, p.E.len - p.s); p.side = -p.side; }
  var st = stepPeds; stepPeds = function (dt) {
    for (var i = 0; i < PEDS.length; i++) { var p = PEDS[i]; if (!p.E || p.inVeh || p.dead || p.ctl || p.hostile || p.angry || p.fear > 0 || p.state !== 'walk' || p.cop) continue; var E = p.E;
      if (p.s > E.len - 1.5) { var nd = RN[p.back ? E.a : E.b]; if (!nd) { reverse(p); continue; } var opts = nd.e.filter(function (e) { if (e === E.i) return false; var ne = RE[e]; if (!ne || ne.off || ne.track) return false; var bk = ne.b === nd.i, q = pedPt(p, ne, 2, bk, p.side); return paveOK(q.x, q.z); });
        if (!opts.length) { reverse(p); continue; } var ne2 = RE[pick(opts)]; p.back = ne2.b === nd.i; p.E = ne2; p.s = 0; continue; }
      var a = pedPt(p, E, p.s + 2.2, p.back, p.side); if (!paveOK(a.x, a.z)) reverse(p); }
    st(dt);
    // anyone who still ends up off the pavement (pushed, scared) walks back onto it when calm
    for (var j = 0; j < PEDS.length; j++) { var q = PEDS[j]; if (!q.E || q.inVeh || q.dead || q.ctl || q.state !== 'walk' || q.fear > 0) continue; if (!paveOK(q.x, q.z) && Math.random() < dt * 0.5) { var b = pedPt(q, q.E, q.s, q.back, q.side); if (paveOK(b.x, b.z) && Math.hypot(b.x - q.x, b.z - q.z) < 8) { q.x += (b.x - q.x) * 0.2; q.z += (b.z - q.z) * 0.2; } } } };
})();

/* ---- street life: people standing about chatting with their hands, on the phone, sitting on the benches (some
   smoking), dancing outside the red light bars at night, a busker on Clubhouse Row ---- */
function poseChat(Q, p) { var t = G.t + p.id * 9, a = Math.sin(t * 2.3), b = Math.sin(t * 1.7 + 1); Q.sh[0] = [0.5 + 0.4 * Math.max(0, a), 0.2 + 0.2 * b, 0]; Q.el[0] = 1.1 + 0.4 * a; Q.sh[1] = [0.3 + 0.3 * Math.max(0, -a), 0.15, 0]; Q.el[1] = 0.9; Q.hy = 0.15 * Math.sin(t * 0.9); Q.y = 0.01 * Math.sin(t * 4); }
function posePhoneP(Q, p) { var t = G.t + p.id * 5; Q.sh[1] = [2.2, -0.1, 0.4]; Q.el[1] = 2.3; Q.sh[0] = [0.4 + 0.3 * Math.max(0, Math.sin(t * 1.5)), 0.2, 0]; Q.el[0] = 0.9; Q.hy = 0.2 * Math.sin(t * 0.6); }
function poseBusk(Q, p) { var t = G.t * 6 + p.id; Q.sh[0] = [1.2, 0.3, 0.3]; Q.el[0] = 1.6; Q.sh[1] = [1.0, -0.2, 0.5 + 0.25 * Math.sin(t)]; Q.el[1] = 1.2; Q.y = 0.02 * Math.abs(Math.sin(t * 0.5)); Q.hy = 0.15 * Math.sin(t * 0.5); }
var LIFE2 = { t: 0 };
function stepStreetLife(dt) { if (G.interior || !P || G.mode !== 'play') return; LIFE2.t -= dt; if (LIFE2.t > 0) return; LIFE2.t = 1.2;
  var mine = PEDS.filter(function (p) { return p.life2; }); mine.forEach(function (p) { if (dist2(p.x, p.z, P.x, P.z) > 110 * 110) { p.dead = 1; p.deadT = 99; PEDS.splice(PEDS.indexOf(p), 1); } });
  mine = PEDS.filter(function (p) { return p.life2 && !p.dead; }); if (mine.length >= 14) return;
  var dl = dayLight(G.time), night = dl < 0.35, a0 = Math.random() * 6.283, r0 = rnd(25, 60), x = P.x + Math.sin(a0) * r0, z = P.z + Math.cos(a0) * r0;
  if (!paveOK(x, z) || inView(x, z, 1) && dist2(x, z, CAM.x, CAM.z) < 35 * 35) return; var st = dAt(x, z).style || '', y = standY(x, z, groundY(x, z) + 1);
  function mk(dx, dz, a, pose, extra) { var p = makePed({ x: x + dx, z: z + dz, a: a, kind: 'cit', rig: rigFor('cit'), state: 'idle' }); p.y = y; p.life2 = 1; p.pose = pose; p.ctl = function (q) { if (q.fixY !== undefined) q.y = q.fixY; q.vx = q.vz = 0; q.sp = 0; q.ph += 0; }; for (var k in (extra || {})) p[k] = extra[k]; return p; }
  var roll = Math.random();
  // a bench nearby: sit on it (maybe with a joint)
  if (roll < 0.3 && typeof SEATS !== 'undefined') { var best = null; SEATS.forEach(function (s) { if (s.kind === 'bench' && !s.taken && Math.abs(s.x - x) < 30 && Math.abs(s.z - z) < 30) best = best || s; });
    if (best) { best.taken = 1; var smoke = Math.random() < 0.35; mk(best.x - x - Math.sin(best.a) * 0.08, best.z - z - Math.cos(best.a) * 0.08, best.a, function (Q, p) { var S = sitPose('bench', p.smoke, G.t + p.id * 3, 0, 0); for (var k in S) Q[k] = S[k]; }, { fixY: best.y, smoke: smoke, seat: best }); return; } }
  if (roll < 0.55) { var n = 2 + (Math.random() < 0.4 ? 1 : 0); for (var i = 0; i < n; i++) { var ang = i / n * 6.283, ox = Math.sin(ang) * 0.75, oz = Math.cos(ang) * 0.75; mk(ox, oz, Math.atan2(-ox, -oz), poseChat); } return; }
  if (roll < 0.72) { mk(0, 0, Math.random() * 6.283, posePhoneP); return; }
  if (roll < 0.86 && night && st === 'redlight') { for (var d2 = 0; d2 < 3; d2++) { var pd = mk(rnd(-1.5, 1.5), rnd(-1.5, 1.5), Math.random() * 6.283, null); pd.danceT = 1e9; } return; }
  if (roll < 0.95 && (st === 'downtown' || st === 'cafe') && !mine.some(function (p) { return p.busk; })) { mk(0, 0, Math.random() * 6.283, poseBusk, { busk: 1, holding: 'guitar' in RIGS ? 'guitar' : null }); return; }
}
(function () { var sl = stepFun; stepFun = function (dt) { sl(dt); stepStreetLife(dt); if (!window.SMOKE165 && Math.random() < dt * 0.6) PEDS.forEach(function (p) { if (p.life2 && p.smoke && dist2(p.x, p.z, CAM.x, CAM.z) < 40 * 40) addFx({ k: 'puff', x: p.x + Math.sin(p.a) * 0.3, y: p.y + 0.75, z: p.z + Math.cos(p.a) * 0.3, vx: 0, vy: 0.4, vz: 0, life: 2, s0: 0.12, grow: 0.4, col: [0.85, 0.85, 0.82], a0: 0.4 }); }); };
  var dp = drawPed; drawPed = function (p) { dp(p); if (p.life2 && p.smoke && typeof drawJoint === 'function') drawJoint(p.x, p.y, p.z, p.a, G.t + p.id * 3); };
  var df = despawnFar; despawnFar = function () { df(); if (typeof SEATS !== 'undefined') SEATS.forEach(function (s) { if (s.taken && !PEDS.some(function (p) { return p.seat === s; })) s.taken = 0; }); };
  // shoved or scared: they stop what they were doing
  var hp = hurtPed; if (typeof hp === 'function') hurtPed = function (p) { if (p.life2) { p.pose = null; p.danceT = 0; p.ctl = null; p.fixY = undefined; p.smoke = 0; if (p.seat) { p.seat.taken = 0; p.seat = null; } p.state = 'walk'; } return hp.apply(this, arguments); };
})();

/* ---- nothing standing in front of a garage or inside a stunt ramp ---- */
(function () { function clr(x, z) { var i = Math.floor(x / CT), j = Math.floor(z / CT); if (i >= 0 && j >= 0 && i < MW && j < MH) CLR[j * MW + i] = 1; }
  HOUSES.forEach(function (h) { if (!(h.b.style === 'house' || h.b.style === 'suburb')) return; var g = homeGarage(h.b); if (g.under) return; for (var s = -1; s <= 9; s += 1.5) for (var t = -2.4; t <= 2.4; t += 1.2) clr(g.door[0] + g.nx * s + g.ux * t, g.door[1] + g.nz * s + g.uz * t); });
  STUNTS.forEach(function (s) { var c = Math.cos(s.a), sn = Math.sin(s.a); for (var v = -8; v <= 30; v += 1.5) for (var u = -3; u <= 3; u += 1.5) clr(s.x + sn * v + c * u, s.z + Math.cos(s.a) * v - sn * u); }); })();

/* ---- fishing jetties: a ramp of planks from the bank up onto the deck ---- */
(function () { var j0 = LMBUILD.jetty; LMBUILD.jetty = function (o, p) { j0(o, p); var a = p.a || 0, c = Math.sin(a), s = Math.cos(a), y = Math.max(1.4, p.h + 0.4), X = p.x, Z = p.z;
  function Pt(u, v) { return [X + c * v + s * u, Z + s * v - c * u]; } var L0 = -9, g0 = groundY(Pt(0, L0)[0], Pt(0, L0)[1]);
  function hAt(v) { return g0 + (y - g0) * clamp((v - L0) / (-0.6 - L0), 0, 1); }
  for (var v = L0; v < 0; v += 1) { var A = Pt(-1.3, v), B = Pt(1.3, v), C2 = Pt(1.3, v + 1), D = Pt(-1.3, v + 1), ya = hAt(v), yb = hAt(v + 1);
    o.m.quad([A[0], ya, A[1]], [D[0], yb, D[1]], [C2[0], yb, C2[1]], [B[0], ya, B[1]], uvR(1, 0.5), TL('plank'), lit([0, 1, 0]), [0, 1, 0]);
    [-1.3, 1.3].forEach(function (u) { var q = Pt(u, v + 0.5), gy = groundY(q[0], q[1]); if (hAt(v + 0.5) - gy > 0.15) tub(o.m, [q[0], gy - 0.3, q[1]], [q[0], hAt(v + 0.5), q[1]], 0.1, 0.1, '#4a3020', 5); }); }
  [-1.3, 1.3].forEach(function (u) { var q0 = Pt(u, L0 + 1), q1 = Pt(u, 0); tub(o.m, [q0[0], hAt(L0 + 1) + 1.0, q0[1]], [q1[0], y + 1.0, q1[1]], 0.05, 0.05, '#5a3a20', 4); });
  var e0 = Pt(-1.6, L0), e1 = Pt(1.6, 0.4), bx = addBox(Math.min(e0[0], e1[0], Pt(-1.6, 0.4)[0], Pt(1.6, L0)[0]), Math.min(e0[1], e1[1], Pt(-1.6, 0.4)[1], Pt(1.6, L0)[1]), Math.max(e0[0], e1[0], Pt(-1.6, 0.4)[0], Pt(1.6, L0)[0]), Math.max(e0[1], e1[1], Pt(-1.6, 0.4)[1], Pt(1.6, L0)[1]), g0 - 0.5, g0 - 0.4, { deck: 1 });
  bx.ramp = function (x, z) { var dx = x - X, dz = z - Z, v = dx * c + dz * s, u = dx * s - dz * c; if (Math.abs(u) > 1.5 || v < L0 || v > 0.4) return -999; return hAt(v) + 0.02; };
  for (var vv = L0 - 2; vv <= 2; vv += 1.5) for (var uu = -2; uu <= 2; uu += 1.5) { var q2 = Pt(uu, vv); var ti = Math.floor(q2[0] / CT), tj = Math.floor(q2[1] / CT); if (ti >= 0 && tj >= 0 && ti < MW && tj < MH) CLR[tj * MW + ti] = 1; } }; })();

/* ---- cars have insides: the glass is see-through, there are seats, a dashboard and a wheel, and you can see who
   is driving (you, Shithead Laboozie, the townsfolk at the wheel of the traffic, sometimes a passenger) ---- */
var CABIN = {};
function cabinOf(type) { if (CABIN[type] !== undefined) return CABIN[type]; var t = VT[type], lo = t && LOFT[t.body]; if (!lo || t.cls !== 'car') return (CABIN[type] = null);
  var L = t.len / 2, Wd = t.wid / 2, H = lo.cab ? 2.65 : t.hgt, zs = lo.st.filter(function (s) { return s[1] === 'H'; }).map(function (s) { return s[0] * L; }); if (!zs.length) return (CABIN[type] = null);
  var zf = Math.max.apply(null, zs), zb = Math.min.apply(null, zs), low = lo.low, belt = lo.belt, m = new R3.Mesh(), seat = '#2a1418', dash = '#12040a';
  var fz = zf - 0.35, sy = low + 0.18, rear = zf - zb > 1.3 && !lo.cab;
  m.quad([-Wd + 0.12, low + 0.05, zb - 0.2], [-Wd + 0.12, low + 0.05, zf + 0.5], [Wd - 0.12, low + 0.05, zf + 0.5], [Wd - 0.12, low + 0.05, zb - 0.2], UV1, TL('white'), [0.06, 0.05, 0.05], [0, 1, 0]);
  [-1, 1].forEach(function (sd) { var x = sd * Wd * 0.42; boxC(m, x - 0.26, low + 0.05, fz - 0.28, x + 0.26, sy, fz + 0.22, seat); boxC(m, x - 0.25, sy, fz - 0.36, x + 0.25, sy + 0.62, fz - 0.24, seat); boxC(m, x - 0.12, sy + 0.62, fz - 0.36, x + 0.12, sy + 0.8, fz - 0.28, seat); });
  if (rear) { var rz = zb + 0.35; boxC(m, -Wd + 0.2, low + 0.05, rz - 0.25, Wd - 0.2, sy, rz + 0.25, seat); boxC(m, -Wd + 0.2, sy, rz - 0.35, Wd - 0.2, sy + 0.55, rz - 0.25, seat); }
  boxC(m, -Wd + 0.12, belt - 0.25, zf + 0.2, Wd - 0.12, belt + 0.05, zf + 0.55, dash); boxC(m, -Wd * 0.7, belt + 0.02, zf + 0.22, -Wd * 0.15, belt + 0.06, zf + 0.3, '#3a1418');
  /* update 164: a proper inside, so nothing under the bonnet, the boot or the wheels shows through the glass: door cards
     down both sides, a firewall and bonnet top under the windscreen, a parcel shelf under the back window */
  var gz = [], st = lo.st; st.forEach(function (q, i) { if (q[3] === 'g' && st[i + 1]) { gz.push(q[0] * L, st[i + 1][0] * L); } }); var gMax = Math.max.apply(null, gz.concat([zf])) + 0.15, gMin = Math.min.apply(null, gz.concat([zb])) - 0.15, iw = Wd - 0.08, trim = '#1c1014';
  [-1, 1].forEach(function (sd) { boxC(m, sd > 0 ? iw - 0.06 : -iw, low, gMin, sd > 0 ? iw : -iw + 0.06, belt + 0.02, gMax, trim); boxC(m, sd > 0 ? iw - 0.1 : -iw, belt - 0.32, zb, sd > 0 ? iw : -iw + 0.1, belt - 0.26, zf, '#3a1418'); });
  boxC(m, -iw, low, zf + 0.5, iw, belt + 0.02, zf + 0.56, trim); boxC(m, -iw, belt - 0.04, zf + 0.5, iw, belt + 0.02, gMax, '#14080a');
  boxC(m, -iw, low, zb - 0.26, iw, belt + 0.02, zb - 0.2, trim); boxC(m, -iw, belt - 0.04, gMin, iw, belt + 0.02, zb - 0.2, '#14080a');
  var wx = -Wd * 0.42, wz = zf + 0.08, wy = belt - 0.02; tub(m, [wx, wy - 0.02, wz + 0.04], [wx, wy + 0.02, wz - 0.03], 0.19, 0.19, '#1a1a1e', 12); tub(m, [wx, wy - 0.05, wz + 0.25], [wx, wy, wz], 0.03, 0.03, '#1a1a1e', 5);
  return (CABIN[type] = { m: m.upload(), drv: [-Wd * 0.42, sy + 0.04, fz - 0.05], pas: [Wd * 0.42, sy + 0.04, fz - 0.05], back: rear ? [Wd * 0.3, sy + 0.04, zb + 0.3] : null, roof: H }); }
(function () {
  var vm = vmesh; vmesh = function (type, colI) { var key = type + ':' + colI, t = VT[type], lo = t && LOFT[t.body], fresh = !(VMESH[key] && VMESH[key].lofted); if (fresh && lo && t.cls === 'car') lo._gm = new R3.Mesh(); var o = vm(type, colI);
    if (lo && lo._gm) { if (lo._gm.n) o.glassM = lo._gm.upload(); lo._gm = null; } return o; };
  function seatPerson(rig, v, local, hands) { var c = Math.cos(v.a), s = Math.sin(v.a), x = v.x + local[0] * c + local[2] * s, z = v.z - local[0] * s + local[2] * c, y = v.y + local[1] + 0.02 - Math.sin(v.pitch || 0) * local[2];
    if (typeof rig === 'string') rig = rigOf(rig); if (!rig || !rig.D) return; var Q = pose0(); poseSit(Q); var CBx = cabinOf(v.type), roofIn = (CBx ? CBx.roof : 1.4) - 0.1, hipAt = local[1] + 0.02, hh = rig.drip ? 0.95 : 0.34, upper = (rig.D.tor + rig.D.neck + hh) * 0.93, sc = clamp((roofIn - hipAt) / upper, 0.45, 0.86);
    Q.y = -(rig.D.lu + rig.D.ll); Q.kn[0] = Q.kn[1] = 0.25; Q.hip[0] = Q.hip[1] = 1.4; Q.lean = -0.38; /* update 164: hips on the seat, legs out in the footwell, leaning back, sized so the head never comes through the roof */ if (hands) { Q.sh[0] = [1.25, 0.12, 0]; Q.sh[1] = [1.25, 0.12, 0]; Q.el[0] = Q.el[1] = 0.7 + 0.08 * Math.sin(G.t * 2 + v.id * 9); } else { Q.sh[0][0] = 0.4; Q.sh[1][0] = 0.4; Q.hy = 0.2 * Math.sin(G.t * 0.5 + v.id * 7); }
    drawPerson(rig, x, y, z, v.a, Q, { noShadow: 1, sc: sc, noDrip: 1, still: 1 }); }
  var dv = drawVeh; drawVeh = function (v) { dv(v); var VM = vmesh(v.type, v.col); if (!VM.glassM) return; var cd2 = (v.x - CAM.x) * (v.x - CAM.x) + (v.z - CAM.z) * (v.z - CAM.z); if (cd2 > 190 * 190 && v !== (P && P.veh)) return;
    var m = MD(v.x, v.y, v.z, v.a, v.pitch, v.roll), near = cd2 < 40 * 40 && !v.dead, CB = near ? cabinOf(v.type) : null;
    if (CB) { R3.draw(CB.m, ATT, { m: m });
      var dr = v.driver; if (dr === P && P.state === 'car') seatPerson(RIGS[P.rig || 'cumhead'], v, CB.drv, 1); else if (dr && dr.rig) seatPerson(dr.rig, v, CB.drv, 1);
      var R = G.coop && G.coop.other; if (R && R.pv === v) seatPerson(RIGS[isGuest() ? 'cumhead' : 'laboozie'], v, CB.drv, 1);
      if (v.passRig === undefined) v.passRig = v.owned || v.mission || Math.random() > 0.3 ? null : rigFor('cit'); if (v.passRig && v.driver) seatPerson(v.passRig, v, CB.pas, 0);
      if (G.ally && G.ally.inVeh === v && G.ally.rig) seatPerson(G.ally.rig, v, CB.pas, 0); }
    R3.draw(VM.glassM, ATT, { m: m, tint: v.dead ? [0.25, 0.22, 0.22] : [0.82, 0.82, 0.82], alpha: CB ? 0.38 : 1 }); };
  // the player's own body is now drawn inside the car, so the old 'nobody in the car' rule stays (drawPlayer returns early)
})();

/* ---- places to eat and drink get proper tables with chairs you can sit on (his ask: Uncle Beeb's had one table, too
   close to the bar) ---- */
var DINE = { beebs: [16, 14], tb: [14, 12], amy: [14, 12], joff: [14, 12], greebo: [14, 12], ali: [14, 12], harold: [14, 12], jessiah: [14, 12] };
Object.keys(DINE).forEach(function (k) { var R0 = ROOMS[k]; if (!R0) return; R0.w = Math.max(R0.w || 10, DINE[k][0]); R0.d = Math.max(R0.d || 9, DINE[k][1]); });
(function () {
  var rm = roomMesh; roomMesh = function (id) { var R0 = ROOMS[id]; if (!R0 || !DINE[id]) return rm(id); var keep = R0.props; R0.props = keep.filter(function (p) { return p !== 'table'; }); var RM = rm(id); R0.props = keep;
    var m = new R3.Mesh(), w = RM.w, d = RM.d, seats = [], wood = id === 'beebs' || id === 'jessiah' || id === 'tb' ? '#5a3a20' : '#3a2a2a', cloth = { amy: '#c4121c', joff: '#f1e7d0', greebo: '#f1e7d0', harold: '#3a1a4a', ali: '#e8c070' }[id];
    var cols = [2.6, 5.6, w - 5.6, w - 2.6], rows = []; for (var z = 3.2; z <= d - 5.6; z += 2.9) rows.push(z);
    rows.forEach(function (tz, ri) { cols.forEach(function (tx, ci) { if (rows.length * cols.length > 8 && ri === rows.length - 1 && (ci === 1 || ci === 2)) return;
      tub(m, [tx, 0, tz], [tx, 0.74, tz], 0.06, 0.06, '#2a1a10', 6); tub(m, [tx, 0.0, tz], [tx, 0.04, tz], 0.3, 0.3, '#2a1a10', 8, { cap: 1 }); tub(m, [tx, 0.74, tz], [tx, 0.8, tz], 0.62, 0.62, cloth || wood, 12, { cap: 1 }); RM.boxes.push([tx - 0.55, tz - 0.55, tx + 0.55, tz + 0.55]);
      // what is on the table: pints in the tavern, plates elsewhere, a candle
      if (id === 'beebs' || id === 'tb') { tub(m, [tx - 0.2, 0.8, tz + 0.1], [tx - 0.2, 0.98, tz + 0.1], 0.06, 0.07, '#c88a20', 6, { cap: 1 }); ell(m, tx - 0.2, 1.0, tz + 0.1, 0.07, 0.03, 0.07, '#f1e7d0', 6, 3); tub(m, [tx + 0.18, 0.8, tz - 0.15], [tx + 0.18, 0.96, tz - 0.15], 0.06, 0.07, '#3a1a0a', 6, { cap: 1 }); }
      else { ell(m, tx - 0.22, 0.81, tz, 0.17, 0.02, 0.17, '#e8e4dc', 8, 2); ell(m, tx + 0.22, 0.81, tz, 0.17, 0.02, 0.17, '#e8e4dc', 8, 2); }
      tub(m, [tx, 0.8, tz], [tx, 0.92, tz], 0.03, 0.03, '#f1e7d0', 5, { cap: 1 });
      [[-1, Math.PI / 2], [1, -Math.PI / 2]].forEach(function (q, k) { var cx = tx + q[0] * 0.95, a = q[1]; boxC(m, cx - 0.22, 0.42, tz - 0.22, cx + 0.22, 0.48, tz + 0.22, wood); [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(function (l) { boxC(m, cx + l[0] - 0.03, 0, tz + l[1] - 0.03, cx + l[0] + 0.03, 0.42, tz + l[1] + 0.03, '#2a1a10'); });
        var bx = cx - q[0] * 0.2; boxC(m, bx - 0.03 * 1, 0.48, tz - 0.22, bx + 0.03, 1.05, tz + 0.22, wood); seats.push({ id: 'ch' + ri + ci + k, x: cx + q[0] * 0.02, z: tz, a: a, kind: 'chair', y: 0.5 }); }); }); });
    if (id === 'beebs') { // a booth along the left wall and a fire for the cold nights
      boxC(m, 0.1, 0, d - 4.6, 0.9, 1.4, d - 2.2, '#4a1a14'); boxC(m, 0.1, 0, d - 4.6, 1.4, 0.45, d - 2.2, '#5a2018'); seats.push({ id: 'booth', x: 1.05, z: d - 3.4, a: Math.PI / 2, kind: 'sofa', y: 0.48 });
      boxC(m, w - 0.6, 0, 2.2, w, 1.6, 4.2, '#4a4440'); boxC(m, w - 0.5, 0, 2.6, w - 0.02, 1.0, 3.8, '#0a0606'); RM.fire = { x: w - 0.35, z: 3.2 }; }
    RM.extra4 = m.upload(); RM.dseats = seats; return RM; };
  var es = enterShop; enterShop = function (id) { var r = es.apply(this, arguments); var I = G.interior; if (I && I.RM && I.RM.dseats && !I.home) I.RM.dseats.forEach(function (s) { G.indoorUses.push({ x: s.x, z: s.z, r: 0.75, label: 'SIT DOWN', fn: function () { sitDown(s); } }); }); return r; };
  var FL = null;
  var di = drawInterior; drawInterior = function (look) { di(look); var I = G.interior; if (!I || !I.RM || !I.RM.extra4) return; R3.draw(I.RM.extra4, ATT);
    if (I.RM.fire) { if (!FL) { var f = new R3.Mesh(); ell(f, 0, 0.5, 0, 0.3, 0.6, 0.3, '#ff8a20', 8, 5); FL = f.upload(); } for (var k = 0; k < 3; k++) { var ph = G.t * (5 + k) + k; R3.draw(FL, ATT, { lit: false, m: MD(I.RM.fire.x, 0.05, I.RM.fire.z - 0.4 + k * 0.4, ph * 0.1, 0, 0, 0.35 + 0.08 * Math.sin(ph)) }); } } };
})();

/* ---- gaps: where a raised piece of pavement meets lower ground along the edge of its square, close it with a kerb
   face (the cut pavement pieces had none, so the sky showed through a slit) ---- */
function raisedAt(x, z) { var i = Math.floor(x / CT), j = Math.floor(z / CT); if (i < 0 || j < 0 || i >= MW || j >= MH) return false; var pk = paveKind(i, j); if (pk === 3) return false; if (pk === 1) return true; var rf = roadF(x, z); return rf >= 0 && (pk !== 4 || rf <= PAVEW); }
function cutSkirts(M0, i, j) { var ax = i * CT, az = j * CT;
  [[0, -1, ax, az, ax + CT, az], [1, 0, ax + CT, az, ax + CT, az + CT], [0, 1, ax + CT, az + CT, ax, az + CT], [-1, 0, ax, az + CT, ax, az]].forEach(function (s) { var n = 4, nn = [s[0], 0, s[1]];
    for (var q = 0; q < n; q++) { var x0 = s[2] + (s[4] - s[2]) * q / n, z0 = s[3] + (s[5] - s[3]) * q / n, x1 = s[2] + (s[4] - s[2]) * (q + 1) / n, z1 = s[3] + (s[5] - s[3]) * (q + 1) / n, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      if (!raisedAt(mx - s[0] * 0.08, mz - s[1] * 0.08) || raisedAt(mx + s[0] * 0.08, mz + s[1] * 0.08)) continue; var nk = kAt(mx + s[0] * 0.08, mz + s[1] * 0.08); if (nk === K_ROAD && roadF(mx + s[0] * 0.08, mz + s[1] * 0.08) < 0) { /* road: the kerb is drawn along the cut already */ }
      var y0 = groundY(x0, z0), y1 = groundY(x1, z1); M0.quad([x0, y0 - 0.25, z0], [x1, y1 - 0.25, z1], [x1, y1 + 0.15, z1], [x0, y0 + 0.15, z0], uvR(1, 0.1), TL('kerb'), lit(nn), nn); } }); }
