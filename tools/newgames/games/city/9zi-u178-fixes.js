/* ---------- update 178 (his asks):
   - GPS for jobs with several targets: torching TB's cars, wrecking vans, clearing gangs, the power nodes. The GPS and
     the marker go to the nearest one still left, then the next nearest, and so on, so you are led round them in order.
   - Bikes: you can knock people off their bikes (hit them with a car, punch or kick them, shoot them) and you get thrown
     off yours when you crash it hard. You tumble, take a knock and get up; the bike stays where it fell. ---------- */
(function () { var sm = stepMission; stepMission = function (dt) { sm.apply(this, arguments); if (!G.mission || !MS || G.cut) return; var s = MS.m.steps[MS.i]; if (!s) return;
    if ((s.t === 'destroy' || s.t === 'kill' || s.t === 'nodes') && G.blips && G.blips.length) { var px = P.state === 'car' && P.veh ? P.veh.x : P.x, pz = P.state === 'car' && P.veh ? P.veh.z : P.z, best = null, bd = 1e12;
      G.blips.forEach(function (b) { var d = dist2(b.x, b.z, px, pz); if (d < bd) { bd = d; best = b; } }); if (best) G.mission.mark = { x: best.x, z: best.z }; } }; })();
/* ---------------- bikes ---------------- */
function bikeKnock(v, dx, dz, power) { var d = v.driver; if (!d || d === P || !d.inVeh || v.t.cls !== 'bike') return false; var l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
  d.inVeh = null; v.driver = null; v.ai = null; v.sp = (v.sp || 0) * 0.2; v.vx = (v.vx || 0) * 0.3; v.vz = (v.vz || 0) * 0.3; v.fell = 1; v.leanF = (Math.random() < 0.5 ? -1 : 1) * 1.35;
  d.x = v.x + dx * 1.2; d.z = v.z + dz * 1.2; d.y = (v.y || groundY(v.x, v.z)) + 0.6; d.vx = dx * (3 + power * 0.35); d.vz = dz * (3 + power * 0.35); d.vy = 3 + power * 0.1; d.downT = 1.8; d.ctl = null; d.pose = null; d.state = 'flee'; d.fear = 12;
  hurtPed(d, 6 + power * 1.2, P, [dx, 0.4, dz], 1); sfx.play('hit'); return true; }
(function () {
  // your bike: a hard crash throws you off
  var sv = stepVehicle; stepVehicle = function (v, inp, dt) { var r = sv.apply(this, arguments);
    // and you can knock other riders off with your car or bike
    if (P && P.veh === v && v.t && v.t.cls !== 'heli' && v.t.cls !== 'plane') VEH.forEach(function (o) { if (o === v || !o.driver || o.driver === P || !o.t || o.t.cls !== 'bike') return; if (Math.abs(o.x - v.x) > 6 || Math.abs(o.z - v.z) > 6) return;
      var hb = typeof obbHit === 'function' ? obbHit(v, o) : null; if (!hb && Math.hypot(o.x - v.x, o.z - v.z) > v.t.len * 0.5 + 0.9) return; var rel = Math.hypot((v.vx || 0) - (o.vx || 0), (v.vz || 0) - (o.vz || 0)); if (rel > 4) bikeKnock(o, o.x - v.x, o.z - v.z, rel); });
    return r; };
  var scm = stepCamera; stepCamera = function (dt) { var T = G.bikeThrow; if (T) { G.bikeThrow = null; if (P.veh && P.veh.t.cls === 'bike') { var v = P.veh; exitVehicle(true); v.fell = 1; v.leanF = 1.35; P.x = v.x + T.vx / T.sp * 1.4; P.z = v.z + T.vz / T.sp * 1.4; P.y = Math.max(P.y, groundY(P.x, P.z) + 0.6);
      P.vx = T.vx * 0.55; P.vz = T.vz * 0.55; P.vy = 4 + T.sp * 0.12; P.ragT = 1.4; hurtPlayer(Math.min(35, T.sp * 1.3), 'bike'); toast(pick(['Over the handlebars.', 'You and the bike part ways.', 'That is going to bruise.'])); } } return scm.apply(this, arguments); };
  // punches, kicks and bats knock riders off
  var mh = meleeHit; meleeHit = function (W0) { var r = mh.apply(this, arguments); VEH.forEach(function (v) { if (!v.driver || v.driver === P || !v.t || v.t.cls !== 'bike') return; var dx = v.x - P.x, dz = v.z - P.z, d = Math.hypot(dx, dz); if (d > W0.range + 1.0) return; var dot = (dx * Math.sin(P.a) + dz * Math.cos(P.a)) / (d || 1); if (dot < 0.2 && d > 1) return; bikeKnock(v, dx, dz, 6); }); return r; };
  // shot riders come off
  var hv = hurtVeh; hurtVeh = function (v, dmg, by) { var r = hv.apply(this, arguments); if (by === P && v && v.t && v.t.cls === 'bike' && v.driver && v.driver !== P && dmg > 4) bikeKnock(v, v.x - P.x, v.z - P.z, Math.min(10, dmg * 0.3)); return r; };
})();
// a bike nobody is on after a fall lies on its side until someone picks it up
(function () { var sf = stepFun; stepFun = function (dt) { sf.apply(this, arguments);
    // a hard stop on your bike (a wall, a car, a lamp post) from one frame to the next throws you off
    var v0 = P && P.state === 'car' && P.veh && P.veh.t && P.veh.t.cls === 'bike' ? P.veh : null; if (v0) { var s1 = Math.hypot(v0.vx || 0, v0.vz || 0), L = G.bikeLast; if (L && L.v === v0 && L.s > 11 && s1 < L.s * 0.5 && !v0.air) G.bikeThrow = { vx: L.vx, vz: L.vz, sp: L.s }; G.bikeLast = { v: v0, s: s1, vx: v0.vx, vz: v0.vz }; } else G.bikeLast = null;
    VEH.forEach(function (v) { if (!v.fell) return; if (v.driver || P.veh === v) { v.fell = 0; v.roll = 0; return; } v.roll = v.leanF || 1.35; v.sp = 0; v.vx = v.vx * 0.9; v.vz = v.vz * 0.9; }); }; })();
/* the freeze he hit: something that stops you moving (a cutscene walk, a stall game, a lift, the train) could be cut off
   part-way (a job starting, being busted or wasted, a menu) and leave you unable to move. If nothing that holds you is
   running any more, you are let go after a second and a half. */
(function () { var held = 0; var sf = stepFun; stepFun = function (dt) { sf.apply(this, arguments);
  var busy = G.cut || ACT || G.turn || G.lift || G.spz || G.brs || G.ride || G.seat || G.darts || (KIT.menuOpen && KIT.menuOpen());
  if (G.talk && !busy) { held += dt; if (held > 1.5) { G.talk = 0; held = 0; } } else held = 0; }; })();
