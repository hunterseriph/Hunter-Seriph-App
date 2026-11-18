/* ---------- update 160: in co-op, player two IS Shithead Laboozie. The townsperson version of him is not in the
   world while a second player is, and his lines in cutscenes are said by player two: the camera goes to him. ---------- */
function coopLab() { return !!(NET && NET.role && G.coop && (G.guest || (G.coop.other && G.coop.other.tg))); }
(function () {
  var cf = castFor; castFor = function (lines) { if (coopLab()) lines = lines.filter(function (l) { return l[0] !== 'lab'; }); return cf(lines); };
  var sc = stepCut; stepCut = function (dt) { var C = G.cut, R = G.coop && G.coop.other; if (!C || C.who !== 'lab' || !coopLab() || !R || G.guest) return sc(dt);
    C.t = (C.t || 0) + dt; if ((KIT.pressed('a') || KIT.pressed('x') || KIT.pressed('y') || (KIT.ptr && KIT.ptr.tap)) && C.t > 0.25) { C.t = 0; cutNext(); return; }
    var tg = R.pv ? { x: R.pv.x, y: R.pv.y, z: R.pv.z } : R, dx = P.x - tg.x, dz = P.z - tg.z, d = Math.hypot(dx, dz) || 1, ex, ey, ez;
    if (d < 30) { dx /= d; dz /= d; ex = P.x + dx * 2.2 + dz * 1.3; ez = P.z + dz * 2.2 - dx * 1.3; ey = P.y + 2.0; } else { ex = tg.x + 3; ez = tg.z + 3; ey = (tg.y || 0) + 2.2; }
    if (rayBlock(tg.x, (tg.y || 0) + 1.5, tg.z, ex, ey, ez) < 1) { ex = (ex + tg.x) / 2; ez = (ez + tg.z) / 2; ey += 1.5; }
    var k = C.t < 0.05 ? 1 : Math.min(1, dt * 6); CAM.x += (ex - CAM.x) * k; CAM.y += (ey - CAM.y) * k; CAM.z += (ez - CAM.z) * k; CAM.at = [tg.x, (tg.y || 0) + 1.45, tg.z]; };
  // nobody else walks round as him while he is being played
  var nt = netStep; netStep = function (dt) { nt(dt); if (!coopLab()) return; for (var i = PEDS.length - 1; i >= 0; i--) { var p = PEDS[i]; if ((p.who === 'lab' || p.cutWho === 'lab') && !p.inVeh) PEDS.splice(i, 1); } };
})();
