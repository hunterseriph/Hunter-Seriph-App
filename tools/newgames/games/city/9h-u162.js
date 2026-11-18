/* ---------- update 162 (his playtest): dying always kills you, you wake at the nearest clinic (never back inside the
   place you died in), the river is the Jizz River ---------- */
(function () {
  // dying while getting into a car: the car lets go of you, and nothing can sit a dead man in it afterwards
  var wa = wasted; wasted = function () { if (P && P.ent) { var v = P.ent.v; if (v) { if (v.ai) v.ai.hold = 0; v.door = 0; } P.ent = null; } G.deathAt = { x: P.x, z: P.z, room: G.interior || null }; return wa.apply(this, arguments); };
  var ts = takeSeat; takeSeat = function (v, j) { if (!P || P.state === 'dead' || P.hp <= 0) return; return ts.apply(this, arguments); };
  var se = stepEnter; stepEnter = function (dt) { if (P.hp <= 0) { P.hp = 0; wasted(); return; } return se(dt); };
  var sf = stepFx; stepFx = function (dt) { sf(dt); if (G.mode === 'play' && P && P.hp <= 0 && P.state !== 'dead' && !G.cut && !G.god) { P.hp = 0; wasted(); } };
  // wake at the nearest clinic, first aid tent or the hospital; dying indoors counts from the door you went in by
  var rs = respawn; respawn = function () {
    if (G.respawnAt === 'cops') { if (G.interior) leaveShop(); return rs(); }
    var at = G.deathAt || { x: P.x, z: P.z }; if (at.room) { at = { x: at.room.exitX, z: at.room.exitZ }; }
    if (G.interior) leaveShop(); G.fade = 1;
    var C = typeof nearestClinic === 'function' ? nearestClinic(at.x, at.z) : null; if (!C || C.k === 'hosp') return rs();
    var loss = Math.min(1000, Math.floor(SV.money * 0.08)); money(-loss); SV.wanted = 0; SV.heat = 0;
    VEH = VEH.filter(function (v) { return !(v.ai && v.ai.cop); }); PEDS = PEDS.filter(function (p) { return !p.cop; });
    var d = C.door; newPlayer(d.x + Math.sin(d.a) * 1.5, d.z + Math.cos(d.a) * 1.5, d.a); P.hp = SV.maxHp; G.time = (G.time + 6) % 24; G.deathAt = null;
    toast((loss ? '$' + loss + ' to get you back on your feet at ' + C.name + '. ' : '') + 'You are fine. Mostly.'); persist(); };
  var wb = bigText; bigText = function (t, sub) { if (t === 'WASTED' && P && typeof nearestClinic === 'function') { var at = G.interior ? { x: G.interior.exitX, z: G.interior.exitZ } : P, C = nearestClinic(at.x, at.z); if (C) arguments[1] = 'Sent to ' + C.name; } return wb.apply(this, arguments); };
})();
/* the river has a name: the Jizz River (Hunter Seriph wrote Rivers of Cum about it) */
(function () { var dn = districtName; districtName = function (x, z) { var k = kAt(x, z); if (k === K_CREAM) return 'Jizz River';
  if (k === K_BRIDGE || isWaterK(k)) { for (var a = 0; a < 8; a++) if (kAt(x + Math.sin(a * 0.785) * 16, z + Math.cos(a * 0.785) * 16) === K_CREAM) return 'Jizz River'; } return dn(x, z); }; })();
