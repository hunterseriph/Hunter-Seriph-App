/* ---------- update 178: repaint the ground for the airport's new road (see 1a-u178-airport.js): the old road across the
   runway goes back to runway, the apron and grass; the new one is laid round the outside and into the forecourt. ---------- */
(function () { if (!window.AP178 || !AP178.ok) return;
  var OLD = [[[1260, 2472], [1241, 2517], [1218, 2561], [1200, 2600], [1200, 2700], [1200, 2856]]];
  function segD(x, z, a, b) { var vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / l2)); return Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t); }
  function nearLine(x, z, P0, r) { for (var k = 0; k < P0.length - 1; k++) if (segD(x, z, P0[k], P0[k + 1]) < r) return true; return false; }
  var NEW = []; RE.forEach(function (E) { if (E.a === 363 && E.b === 348 || E.a === 348 || E.a === AP178.join) NEW.push(E.pts); });
  for (var z = 2440; z < 2880; z += CT) for (var x = 1140; x < 1600; x += CT) { var cx = x + CT / 2, cz = z + CT / 2, t = Math.floor(cz / CT) * MW + Math.floor(cx / CT);
    var onNew = NEW.some(function (P0) { return nearLine(cx, cz, P0, 7); });
    if (onNew) { if (!isWaterK(KM[t])) KM[t] = K_ROAD; continue; }
    if (KM[t] === K_ROAD && nearLine(cx, cz, OLD[0], 9) && cz < 2800) KM[t] = cz >= 2512 && cz < 2584 && cx >= 824 && cx < 1536 ? K_RUNWAY : cz >= 2584 && cz < 2758 && cx >= 824 && cx < 1536 ? K_YARD : K_GRASS; }
  // the slip road and forecourt (west of x 1140)
  for (var z2 = 2680; z2 < 2810; z2 += CT) for (var x2 = 960; x2 < 1140; x2 += CT) { var c2 = x2 + CT / 2, d2 = z2 + CT / 2, t2 = Math.floor(d2 / CT) * MW + Math.floor(c2 / CT); if (NEW.some(function (P0) { return nearLine(c2, d2, P0, 7); }) && !isWaterK(KM[t2])) KM[t2] = K_ROAD; }
})();
