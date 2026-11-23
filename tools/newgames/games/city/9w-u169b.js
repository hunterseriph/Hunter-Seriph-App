/* ---------- update 169: bugs from his playtest ---------- */

/* ---- you can't walk through cars, and you can jump onto them (bonnet and boot about 0.9 m, the roof on top of that;
   standing on a moving car carries you along). Only while Cumhead is on foot (STANDCARS), so people and cars don't stand
   on each other. ---- */
function carList() { var L = VEH.slice(); var R = G.coop && G.coop.other; if (R && R.pv && L.indexOf(R.pv) < 0) L.push(R.pv); return L; }
function carSolid(v) { return !!(v && v.t && v.t.cls === 'car' && v !== P.veh); }
function carTopAt(v, lz) { var t = v.t, half = t.len / 2, cab = t.cab !== undefined ? t.cab : 0.22; // the roof over the cabin, the bonnet and boot lower
  var hgt = t.hgt || 1.45; if (/truck|van|bus|icecream|hearse|ambulance|armytruck/.test(v.type)) return Math.abs(lz) < half - 0.1 ? hgt : hgt * 0.62; return Math.abs(lz) < t.len * cab ? hgt : hgt * 0.64; }
var STANDCAR = null;
(function () {
  var sy = standY; standY = function (x, z, y) { var g = sy(x, z, y); if (!window.STANDCARS) return g; var best = g, bv = null; carList().forEach(function (v) { if (!carSolid(v) || Math.abs(v.x - x) > 7 || Math.abs(v.z - z) > 7) return;
      var c = Math.cos(v.a), s = Math.sin(v.a), dx = x - v.x, dz = z - v.z, lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) > v.t.wid / 2 - 0.05 || Math.abs(lz) > v.t.len / 2 - 0.05) return;
      var top = v.y + carTopAt(v, lz); if (y !== undefined && y < top - 0.45) return; if (top > best) { best = top; bv = v; } }); STANDCAR = bv; return best; };
  var sf = stepFoot; stepFoot = function (dt) {
    // riding along: the car under your feet moves you with it
    if (STANDCAR && P.ground && !G.seat) { var v0 = STANDCAR; P.x += (v0.vx || Math.sin(v0.a) * (v0.sp || 0)) * dt; P.z += (v0.vz || Math.cos(v0.a) * (v0.sp || 0)) * dt; }
    // getting in as the passenger comes first (he said player two just stood next to the car)
    if (KIT.pressed('y') && !G.cut && !G.talk && !G.seat && typeof canBoard === 'function' && canBoard()) { boardPass(); return; }
    window.STANDCARS = 1; STANDCAR = null; try { sf(dt); } finally { window.STANDCARS = 0; }
    if (P.state !== 'foot' || G.interior || G.seat) return;
    // pushed out of the side of any car you are not standing on
    carList().forEach(function (v) { if (!carSolid(v) || v === STANDCAR || Math.abs(v.x - P.x) > 7 || Math.abs(v.z - P.z) > 7) return; var c = Math.cos(v.a), s = Math.sin(v.a), dx = P.x - v.x, dz = P.z - v.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
      var hx = v.t.wid / 2 + 0.3, hz = v.t.len / 2 + 0.3; if (Math.abs(lx) >= hx || Math.abs(lz) >= hz) return; if (P.y > v.y + carTopAt(v, lz) - 0.3) return; if (P.y < v.y - 1.2) return;
      var px = hx - Math.abs(lx), pz = hz - Math.abs(lz); if (px < pz) lx = (lx < 0 ? -1 : 1) * hx; else lz = (lz < 0 ? -1 : 1) * hz;
      P.x = v.x + lx * c + lz * s; P.z = v.z - lx * s + lz * c; }); };
})();

/* ---- mission givers can't be killed (they shrug it off and complain) ---- */
var GIVERWHO = {}; MISSIONS.forEach(function (m) { if (m.who) GIVERWHO[m.who] = 1; });
(function () { var hp = hurtPed; hurtPed = function (p, dmg, by, dir, car) { if (p && p.who && GIVERWHO[p.who] && !p.hostile && !p.mission && !p.boss) { p.hp = Math.max(p.hp || 50, 50); p.fear = Math.max(p.fear || 0, 1); if (!(p.sayT > 0)) say(p, pick(['Oi! Watch it!', 'Do you want the job or not?', 'Not the face!', 'I bruise easy, mate.', 'Rude.'])); return; } return hp.apply(this, arguments); }; })();

/* ---- police you can see: officers with guns are drawn twice as far away as other people, and they don't shoot from further
   than you can see them (he said invisible police followed him and he couldn't get away). A police car that has not seen
   you for 40 s gives up and drives off. ---- */
(function () {
  var sh = shoot; shoot = function (who, W0) { if (who && who !== P && who.cop && !who.inVeh && Math.hypot(who.x - P.x, who.z - P.z) > 60) return; return sh(who, W0); };
  var dfs = drawFun; drawFun = function () { dfs(); if (G.interior) return; PEDS.forEach(function (p) { if (p.inVeh || p.inside || !(p.cop || p.hostile) || p.dead) return; var d = dist2(p.x, p.z, CAM.x, CAM.z); if (d <= 75 * 75 || d > 150 * 150 || !inView(p.x, p.z, 3)) return; drawPed(p); }); };
  var cd = copDrive; copDrive = function (v, dt) { var me = P.state === 'car' && P.veh ? P.veh : P; if (Math.hypot(v.x - me.x, v.z - me.z) < 70) v.ai.seenT = 0; else v.ai.seenT = (v.ai.seenT || 0) + dt;
    if (v.ai.seenT > 40 && !v.ai.copHeli && v.type !== 'tank') { v.ai.cop = 0; v.ai.flee = 1; v.keep = 0; v.siren = 0; var r = nearestRoad(v.x, v.z, 40); if (r) { v.ai.E = r.E; v.ai.s = r.s; v.ai.back = false; v.ai.lane = r.E.w / 4; v.ai.want = 12; } return; } return cd(v, dt); };
})();

/* ---- co-op ---- */
/* the other player is seen inside a shop when you are both in the same room (he said you couldn't see each other indoors) */
function roomKey() { var I = G.interior; return I ? (I.id || '') + '|' + (I.home || '') + '|' + (I.key || '') : ''; }
(function () {
  var pk = packMe; packMe = function () { var o = pk(); o.rk = roomKey(); return o; };
  var dws = drawWorldStuff; drawWorldStuff = function () { var R = G.coop && G.coop.other;
    if (R && R.tg && (R.tg.rk || '') !== roomKey()) { var tg = R.tg, pv = R.pv; R.tg = null; R.pv = null; try { dws(); } finally { R.tg = tg; R.pv = pv; } return; } // in different places: not drawn at all
    if (R && R.tg && G.interior && R.tg.rk === roomKey()) { dws(); var rig = RIGS[isGuest() ? 'cumhead' : 'laboozie'], Q = pose0(); if (R.sp > 0.3) poseWalk(Q, R.ph || 0, Math.min(1, R.sp / 5)); var W0 = WPN[R.w] || WPN.fists; if (R.aim && !W0.melee) { Q.sh[0] = [1.5, 0.1, 0]; Q.el[0] = 0.1; }
      drawPerson(rig, R.x, R.y, R.z, R.a, Q, { held: W0.mesh ? RIGS[W0.mesh] : null, heldP: W0.swing ? -Math.PI / 2 - 0.2 : -Math.PI / 2 }); return; }
    return dws(); };
})();
/* player two's cars no longer double up: a car he takes out of the traffic is never made again from the host's picture
   (the picture can still hold it for a moment before the host has taken it away), and it can be driven at once */
var TAKEN = {};
(function () {
  var gc = guestCars; guestCars = function () { var v = P.state === 'enter' && P.ent && P.ent.v; if (v && v.pup && !v.mis) { TAKEN[v.nid] = G.t; v.rest = 0; v.ai = null; } gc(); };
  // bikes, boards and boats are hopped onto at once (no 'enter'): take those over too, or they stay the host's frozen copy
  var gc2 = guestCars; guestCars = function () { var v = (P.state === 'car' || P.state === 'pass') && P.veh; if (v && v.pup && !v.mis && P.state === 'car') { netSendOther({ t: 'take', id: v.nid }); TAKEN[v.nid] = G.t; delete PUPV[v.nid]; v.pup = 0; v.tg = null; v.mine = 1; v.rest = 0; v.ai = null; } if (P.state === 'car' && P.veh) P.veh.rest = 0; gc2(); };
  var gp = guestPop; guestPop = function (m) { if (m && m.v) m.v = m.v.filter(function (q) { return !(TAKEN[q[0]] && G.t - TAKEN[q[0]] < 30); }); return gp(m); };
  // the host never sends back a car player two is sitting in (it is player two's own until he leaves it)
  var pp = packPop; packPop = function () { var m = pp(); var R = coopOther(); if (m.v && R && R.pv) m.v = m.v.filter(function (q) { var dx = q[3] - R.pv.x, dz = q[5] - R.pv.z; return dx * dx + dz * dz > 4; }); return m; };
})();
/* people are shoved by cars as before, but Cumhead standing on top of a car is not shoved off it */
vehPush = function (o, r) { VEH.forEach(function (v) { if (v === o.veh) return; var c = Math.cos(v.a), s = Math.sin(v.a), dx = o.x - v.x, dz = o.z - v.z, lx = dx * c - dz * s, lz = dx * s + dz * c, hw = v.t.wid / 2 + r, hl = v.t.len / 2 + r;
    if (Math.abs(lx) < hw && Math.abs(lz) < hl && o.y < v.y + v.t.hgt && o.y + 1.6 > v.y) { if (o === P && v.t.cls === 'car' && o.y > v.y + carTopAt(v, lz) - 0.3) return;
      var px = hw - Math.abs(lx), pz = hl - Math.abs(lz); if (px < pz) lx += Math.sign(lx || 1) * px; else lz += Math.sign(lz || 1) * pz; o.x = v.x + lx * c + lz * s; o.z = v.z - lx * s + lz * c;
      var sp = Math.hypot(v.vx || 0, v.vz || 0); if (sp > 5 && o === P && P.state === 'foot') { hurtPlayer(sp * 2.5, v.driver); P.ragT = 1.2; P.vx = v.vx * 0.8; P.vz = v.vz * 0.8; P.vy = 4; } } }); };
/* ---- getting high: the whole picture sways and swims as one (he saw a second floor under the floor and shop fronts going
   behind walls: the old wobble bent every mesh by itself, so layers drawn on top of each other came apart). The 3D
   wobble is off; the finished picture is swayed, skewed and breathed instead, so it is only ever the layer you see. ---- */
(function () { var dw = drawWorld; drawWorld = function (look) { var w = Math.min(1.4, G.fxWarp || 0); G.fxWarp = 0; G.wob = w; return dw(look); };
  var cv = null, last = '';
  var dfs = drawFun; drawFun = function () { dfs(); if (!cv) cv = document.getElementById('gl'); if (!cv) return; var w = G.interior ? Math.min(1.4, (G.high || 0) * 0.55 + (G.pilled || 0) * 1.5) : (G.wob || 0), t = G.t || 0, tr = '';
    if (w > 0.02 && G.mode === 'play') { var k = Math.min(1, w); tr = 'rotate(' + (Math.sin(t * 0.6) * 1.6 * k).toFixed(2) + 'deg) skewX(' + (Math.sin(t * 1.05) * 3.2 * k).toFixed(2) + 'deg) skewY(' + (Math.sin(t * 0.83 + 1) * 1.4 * k).toFixed(2) + 'deg) scale(' + (1.04 + 0.025 * k * Math.sin(t * 1.4)).toFixed(3) + ')'; }
    if (tr !== last) { cv.style.transform = tr; last = tr; } };
  var dwi = drawInterior; drawInterior = function (look) { G.fxWarp = 0; return dwi(look); };
})();
/* ---- the fishing jetties: proper handrails down both sides of the ramp and the deck (posts every 2 m standing on the
   planks, a top rail and a middle rail) and you can't walk through them ---- */
(function () { var j1 = LMBUILD.jetty; LMBUILD.jetty = function (o, p) { j1(o, p); var a = p.a || 0, c = Math.sin(a), s = Math.cos(a), y = Math.max(1.4, p.h + 0.4), L = 32, X = p.x, Z = p.z, L0 = -9;
  function Pt(u, v) { return [X + c * v + s * u, Z + s * v - c * u]; } var g0 = groundY(Pt(0, L0)[0], Pt(0, L0)[1]);
  function deckY(v) { return v >= 0 ? y : g0 + (y - g0) * clamp((v - L0) / (-0.6 - L0), 0, 1); }
  var W = '#5a3a20', Wd = '#3a2414';
  [-1, 1].forEach(function (side) { var uu = function (v) { return side * (v >= 0 ? 1.45 : 1.25); };
    for (var v = L0 + 0.5; v <= L - 0.2; v += 2) { var q = Pt(uu(v), v), yy = deckY(v); tub(o.m, [q[0], yy, q[1]], [q[0], yy + 1.05, q[1]], 0.055, 0.05, Wd, 6, { cap: 1 }); }
    for (var v2 = L0 + 0.5; v2 < L - 0.2; v2 += 2) { var v3 = Math.min(L - 0.2, v2 + 2), q0 = Pt(uu(v2), v2), q1 = Pt(uu(v3), v3), y0 = deckY(v2), y1 = deckY(v3);
      tub(o.m, [q0[0], y0 + 1.05, q0[1]], [q1[0], y1 + 1.05, q1[1]], 0.045, 0.045, W, 6); tub(o.m, [q0[0], y0 + 0.55, q0[1]], [q1[0], y1 + 0.55, q1[1]], 0.035, 0.035, W, 6);
      var m = Pt(uu((v2 + v3) / 2) + side * 0.02, (v2 + v3) / 2); addOBB(m[0], m[1], a, 0.08, (v3 - v2) / 2 + 0.05, Math.min(y0, y1) - 0.3, Math.max(y0, y1) + 1.1); } });
  // the end across, with a gap in the middle for the rod
  [-1, 1].forEach(function (side) { var q0 = Pt(side * 1.45, L - 0.2), q1 = Pt(side * 0.6, L - 0.2); tub(o.m, [q0[0], y + 1.05, q0[1]], [q1[0], y + 1.05, q1[1]], 0.045, 0.045, W, 6); tub(o.m, [q1[0], y, q1[1]], [q1[0], y + 1.05, q1[1]], 0.055, 0.05, Wd, 6, { cap: 1 });
    var m2 = Pt(side * 1.02, L - 0.2); addOBB(m2[0], m2[1], a, 0.45, 0.08, y - 0.3, y + 1.1); }); }; })();
