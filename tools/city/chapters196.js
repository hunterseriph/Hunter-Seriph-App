/* ---------- update 196 (his ask: "when the chapter changes we need the world state to really demonstrate what's going
   on"): the city itself changes with each chapter.
   Dead Loads (the zombie apocalypse): a sick green-grey fog and a blood red night, buildings on fire with smoke
   pouring off them, some burnt out and broken, barricaded windows and HELP painted on the walls, wrecked cars and
   bodies in the street, zombies everywhere (day and night), people running from them screaming, people hiding in
   doorways begging to be let in, the street lamps flickering, the red moon up.
   Rise of the Machines: an ash grey smog with ash falling, many more buildings broken down to their floors with
   rubble everywhere, craters, concrete roadblocks and burnt-out cars, searchlights sweeping the sky from the towers,
   drones hunting with spotlights, robots and big Enforcer robots on every street zapping people, the billboards all
   saying COMPLY.
   Blumhead's Plan: the city is still broken, and now it is his: a purple and toxic green sky, a beam of goo light
   from his castle into the sky, glowing goo pools, tentacles growing out of the pavements, pulsing eggs, green
   spores in the air, his goons on every corner and people being turned into goons.
   When a chapter ends the city goes back to normal. ---------- */
(function () {
  var LV = { zombie: 1, robot: 2, blum: 3 };
  function CH() { var c = G.chapter; return LV[c] ? c : null; }
  function lvl() { return LV[G.chapter] || 0; }
  window.chapterLook = CH;
  var HOUSEB = null;
  function isHouseB(b) { if (!HOUSEB) { HOUSEB = {}; (window.HOUSES || []).forEach(function (h) { if (h.b) HOUSEB[h.b.i] = 1; }); } return HOUSEB[b.i]; }
  function plain(b) { return b && !b.shop && b.style !== 'frame' && !isHouseB(b) && b.h > 0; }
  function ruined(b) { var L = lvl(); if (!L || !plain(b)) return 0; return hash2(b.i, 41, 3) < [0, 0.14, 0.34, 0.34][L]; }
  function burning(b) { var L = lvl(); if (L !== 1 && L !== 2 || !plain(b)) return 0; return hash2(b.i, 43, 5) < (L === 1 ? 0.11 : 0.07) || (ruined(b) && hash2(b.i, 47, 1) < (L === 1 ? 0.6 : 0.35)); }
  function boarded(b) { return lvl() === 1 && b && !ruined(b) && b.h > 0 && b.style !== 'frame' && hash2(b.i, 51, 2) < 0.42; }

  /* ---------- the chapter's posters, painted over the billboards and the signs for HELP ---------- */
  function sign(txt, bg, fg, font, sz, sub) { return function (g) { g.fillStyle = bg; g.fillRect(0, 8, 64, 48); g.fillStyle = '#12040a'; g.fillRect(0, 8, 64, 2); g.fillRect(0, 54, 64, 2); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    function F(s) { return font === 'p' ? s + 'px "Pirata One", serif' : 'bold ' + s + 'px "Archivo Narrow", sans-serif'; }
    var L = txt.split('\n'); L.forEach(function (l, i) { var s = sz; g.font = F(s); while (g.measureText(l).width > 60 && s > 6) { s--; g.font = F(s); } g.fillText(l, 32, 32 + (i - (L.length - 1) / 2) * (s + 1) + (sub ? -5 : 0)); });
    if (sub) { var ss = 7; g.font = 'bold 7px "Archivo Narrow", sans-serif'; while (g.measureText(sub).width > 60 && ss > 4) { ss -= 0.5; g.font = 'bold ' + ss + 'px "Archivo Narrow", sans-serif'; } g.fillText(sub, 32, 48); } }; } // the poster painter (the game's own is inside its texture code)
  var POST = {
    zombie: [sign('THE END\nIS NIGH', '#12040a', '#ff2630', 'p', 15, 'REPENT. SHOWER.'), sign('STAY\nINSIDE', '#1a2a16', '#f1e7d0', 'a', 16, 'BY ORDER OF THE SHERIFF'), sign("THEY'RE IN\nTHE CREAM", '#3a0a0a', '#f1e7d0', 'a', 13, 'DO NOT DRINK THE CREAM'), sign('BITTEN?\nTELL SOMEONE', '#2a2a1e', '#ffe36a', 'a', 13, 'THEN RUN'), sign('NO\nSANCTUARY', '#12040a', '#9adf7a', 'p', 16, 'EXCEPT SPERMAID\'S')],
    robot: [sign('COMPLY', '#12141a', '#ff2630', 'a', 20, 'SPUNK BRAIN CARES'), sign('OBEY', '#d8d8d0', '#12040a', 'a', 22, 'CLEANLINESS IS MANDATORY'), sign('YOU ARE\nBEING CLEANED', '#12141a', '#7adfff', 'a', 13, 'DO NOT RESIST'), sign('CURFEW\n24/7', '#3a0a0a', '#f1e7d0', 'a', 15, 'HUMANS INDOORS'), sign('REPORT\nMESS', '#12141a', '#ffe36a', 'a', 16, 'MESS WILL BE REMOVED')],
    blum: [sign('ALL HAIL\nBLUMHEAD', '#1a0420', '#c040ff', 'p', 15, 'THE EGG IS COMING'), sign('JOIN\nTHE GOO', '#0a1a0a', '#7aff3a', 'a', 18, 'IT IS WARM IN HERE'), sign('THE EGG\nIS COMING', '#1a0420', '#f1e7d0', 'p', 15, 'ARE YOU READY'), sign('WE ARE\nONE', '#12040a', '#c040ff', 'a', 17, 'BLUMHEAD LOVES YOU'), sign('OBEY\nTHE GOO', '#0a1a0a', '#c040ff', 'a', 17, 'RESISTANCE IS STICKY')]
  };
  HIPAINT.ch_help = function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = 'rgba(180,10,14,0.92)'; g.font = 'bold 22px "Archivo Narrow", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(32, 32); g.rotate(-0.08); g.fillText('HELP', 0, -8); g.font = 'bold 9px "Archivo Narrow", sans-serif'; g.fillText('WE ARE INSIDE', 0, 12); g.restore(); };
  HIPAINT.ch_keep = function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = 'rgba(240,236,220,0.9)'; g.font = 'bold 13px "Archivo Narrow", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(32, 32); g.rotate(0.06); g.fillText('KEEP OUT', 0, -10); g.fillText('INFECTED', 0, 8); g.restore(); g.strokeStyle = 'rgba(240,236,220,0.9)'; g.lineWidth = 3; g.strokeRect(6, 14, 52, 36); };
  HIPAINT.ch_x = function (g) { g.clearRect(0, 0, 64, 64); g.strokeStyle = 'rgba(200,20,24,0.9)'; g.lineWidth = 6; g.beginPath(); g.moveTo(10, 10); g.lineTo(54, 54); g.moveTo(54, 10); g.lineTo(10, 54); g.stroke(); };
  var ORIG = {};
  function paintTile(name, fn) { if (!ATL || !ATL.canvas) return; var uv = ATL.tile(name); if (!uv) return; var SZ = ATL.canvas.width, x = Math.round(uv[0] * SZ) - 1, y = Math.round(uv[1] * SZ) - 1, B = Math.round(uv[2] * SZ) + 2, c = ATL.canvas.getContext('2d');
    c.save(); c.clearRect(x, y, B, B); c.beginPath(); c.rect(x, y, B, B); c.clip(); c.translate(x, y); c.scale(B / 64, B / 64); try { fn(c); } catch (e) {} c.restore(); }
  function posters(ch) { if (!ATL || !ATL.canvas) return false; (window.BILLS || []).forEach(function (t, i) { if (!ORIG[t]) ORIG[t] = HIPAINT[t]; paintTile(t, ch && POST[ch] ? POST[ch][i % POST[ch].length] : ORIG[t]); });
    try { ATT = R3.texture(ATL.canvas, true); } catch (e) {} return true; }

  /* ---------- broken buildings, barricades ---------- */
  var _bld = building;
  building = function (m, night, fr, glow, b, lamps) {
    if (!ruined(b)) { var r = _bld.apply(this, arguments); if (boarded(b)) board(m, b); return r; }
    var f = (lvl() >= 2 ? 0.16 : 0.3) + 0.32 * hash2(b.i, 53, 1), b2 = {}; for (var k in b) b2[k] = b[k]; b2.h = Math.max(3, Math.round(b.h * f)); b2.roofX = 'concrete';
    var dn = new R3.Mesh(); _bld.call(this, m, dn, fr, dn, b2, []); // no lit windows in a burnt-out shell
    broken(m, b, b2); rubble(m, b, 1);
  };
  function broken(m, b, b2) { // the walls snapped off at different heights above the last floor still standing, and the floors' edges
    var top = b2.y0 + b2.h, rest = Math.max(2, (b.h - b2.h) * 0.75), n = 0, cols = ['#3a3634', '#4a4644', '#2a2422', '#1a1412'];
    function piece(x0, z0, x1, z1) { var hh = rest * Math.pow(hash2(b.i, 61 + n, 7), 1.6); n++; if (hh < 0.6) return; boxC(m, x0, top, z0, x1, top + hh, z1, cols[n % cols.length]); if (hh > 3 && hash2(b.i, 90 + n, 1) < 0.5) boxC(m, x0 - 0.05, top + hh * 0.4, z0 - 0.05, x1 + 0.05, top + hh * 0.4 + 0.25, z1 + 0.05, '#5a5450'); }
    var t = 0.45, sx = b.x1 - b.x0, sz = b.z1 - b.z0;
    for (var x = b.x0; x < b.x1 - 0.5; x += 2.2) { var x2 = Math.min(b.x1, x + 2.2); piece(x, b.z0, x2, b.z0 + t); piece(x, b.z1 - t, x2, b.z1); }
    for (var z = b.z0 + t; z < b.z1 - t - 0.5; z += 2.2) { var z2 = Math.min(b.z1 - t, z + 2.2); piece(b.x0, z, b.x0 + t, z2); piece(b.x1 - t, z, b.x1, z2); }
    for (var k = 0; k < 3; k++) { var px = b.x0 + 1 + hash2(b.i, 70 + k, 2) * (sx - 2), pz = b.z0 + 1 + hash2(b.i, 75 + k, 2) * (sz - 2); boxC(m, px - 0.3, top, pz - 0.3, px + 0.3, top + rest * hash2(b.i, 80 + k, 2), pz + 0.3, '#3a3634'); } // a few columns left inside
    for (var s2 = 0; s2 < 5; s2++) { var cx = b.x0 + hash2(b.i, 100 + s2, 4) * sx, cz = b.z0 + hash2(b.i, 110 + s2, 4) * sz; boxR(m, cx, cz, hash2(b.i, 120 + s2, 4) * 6, 0.6 + hash2(b.i, 130 + s2, 4) * 1.4, 0.4 + hash2(b.i, 140 + s2, 4), top, top + 0.3 + hash2(b.i, 150 + s2, 4) * 0.8, '#4a4644'); } // broken slabs on the floor
    // soot up the walls
    [[b.x0 - 0.04, b.z0, b.x0 - 0.02, b.z1], [b.x1 + 0.02, b.z0, b.x1 + 0.04, b.z1], [b.x0, b.z0 - 0.04, b.x1, b.z0 - 0.02], [b.x0, b.z1 + 0.02, b.x1, b.z1 + 0.04]].forEach(function (q, i) { if (hash2(b.i, 160 + i, 3) < 0.6) boxC(m, q[0], top - Math.min(4, b2.h * 0.5), q[1], q[2], top, q[3], '#140c0a'); });
  }
  function rubble(m, b, big) { // piles of broken concrete and bricks round the foot of a building
    var L = lvl(), n = big ? 8 + Math.floor(hash2(b.i, 170, 3) * 10) : 3, cols = ['#5a5450', '#4a4644', '#6a5a4a', '#3a3634', '#7a3a2a'];
    for (var k = 0; k < n; k++) { var side = Math.floor(hash2(b.i, 180 + k, 1) * 4), u = hash2(b.i, 200 + k, 1), out = 0.3 + hash2(b.i, 220 + k, 1) * (L >= 2 ? 3.4 : 2.2), x, z;
      if (side === 0) { x = lerp(b.x0, b.x1, u); z = b.z0 - out; } else if (side === 1) { x = lerp(b.x0, b.x1, u); z = b.z1 + out; } else if (side === 2) { x = b.x0 - out; z = lerp(b.z0, b.z1, u); } else { x = b.x1 + out; z = lerp(b.z0, b.z1, u); }
      var y = groundY(x, z), s = 0.35 + hash2(b.i, 240 + k, 1) * (big ? 1.2 : 0.6); boxR(m, x, z, hash2(b.i, 260 + k, 1) * 6, s, s * (0.6 + hash2(b.i, 270 + k, 1) * 0.6), y - 0.1, y + s * (0.5 + hash2(b.i, 280 + k, 1)), cols[k % cols.length]); }
  }
  function board(m, b) { // planks over the ground floor windows and doors, HELP painted above some
    var y = b.y0, W = '#6a4a2a', D = '#4a3018';
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d, si) { if (hash2(b.i, 300 + si, 2) < 0.35) return; var len = d[0] ? b.z1 - b.z0 : b.x1 - b.x0; if (len < 3) return; var cnt = Math.max(1, Math.floor(len / 6));
      for (var c = 0; c < cnt; c++) { var u = (c + 0.5) / cnt, cx = d[0] ? (d[0] < 0 ? b.x0 - 0.08 : b.x1 + 0.08) : lerp(b.x0, b.x1, u), cz = d[0] ? lerp(b.z0, b.z1, u) : (d[1] < 0 ? b.z0 - 0.08 : b.z1 + 0.08), a = d[0] ? Math.PI / 2 : 0;
        for (var p = 0; p < 3; p++) boxR(m, cx, cz, a + (p - 1) * 0.04, 1.05, 0.05, y + 0.9 + p * 0.45, y + 1.2 + p * 0.45, p % 2 ? W : D); }
      if (b.h > 6 && hash2(b.i, 320 + si, 2) < 0.5) { var mx = d[0] ? (d[0] < 0 ? b.x0 - 0.1 : b.x1 + 0.1) : (b.x0 + b.x1) / 2, mz = d[0] ? (b.z0 + b.z1) / 2 : (d[1] < 0 ? b.z0 - 0.1 : b.z1 + 0.1), ang = Math.atan2(d[0], d[1]); standQ(m, mx, mz, ang, 3.4, y + 3.2, y + 6.6, TL(['ch_help', 'ch_keep', 'ch_x'][Math.floor(hash2(b.i, 330 + si, 2) * 3)]), 1.1); } });
  }

  /* ---------- the street: wrecks, rubble, craters, roadblocks, blood, goo, tentacles, eggs (made with each 64 m chunk) ---------- */
  var SAMPLES = null; window.SAMPLES196 = null;
  function samples() { if (SAMPLES) return SAMPLES; SAMPLES = window.SAMPLES196 = {}; RE.forEach(function (E, ei) { if (E.off || E.track) return; for (var s = 6; s < E.len - 6; s += 13) { var p = null; for (var k = 0; k < E.pts.length - 1; k++) { if (E.cum[k + 1] >= s) { var t = (s - E.cum[k]) / ((E.cum[k + 1] - E.cum[k]) || 1), a = E.pts[k], b = E.pts[k + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (b[0] - a[0]) / l, (b[1] - a[1]) / l]; break; } } if (!p) continue;
      var key = Math.floor(p[0] / CS) + ',' + Math.floor(p[1] / CS); (SAMPLES[key] = SAMPLES[key] || []).push({ x: p[0], z: p[1], dx: p[2], dz: p[3], w: E.w, id: ei * 1000 + s }); } }); return SAMPLES; }
  function disc(m, x, z, r, hex, seg, lift, T) { var y = groundY(x, z) + (lift || 0.04), c = litc(hex, [0, 1, 0]); seg = seg || 10; for (var i = 0; i < seg; i++) { var a0 = i / seg * 6.283, a1 = (i + 1) / seg * 6.283, r0 = r * (0.75 + 0.25 * Math.sin(a0 * 3 + x)), r1 = r * (0.75 + 0.25 * Math.sin(a1 * 3 + x)); m.tri([x, y, z], [x + Math.sin(a1) * r1, y, z + Math.cos(a1) * r1], [x + Math.sin(a0) * r0, y, z + Math.cos(a0) * r0], [0.5, 0.5, 1, 0, 0, 1], T || TL('white'), c, [0, 1, 0]); } }
  function chunkExtras(ci, cj, L) {
    var S = samples()[ci + ',' + cj] || [], m = new R3.Mesh(), g = new R3.Mesh(), out = { m: m, g: g, wrecks: [], fires: [], tents: [], pods: [] }, any = 0, gany = 0;
    S.forEach(function (q) { var h = hash2(Math.round(q.x), Math.round(q.z), 9 + L), h2 = hash2(Math.round(q.z), Math.round(q.x), 19 + L), nx = -q.dz, nz = q.dx, side = h2 < 0.5 ? 1 : -1, ex = q.x + nx * side * (q.w / 2 - 1.4), ez = q.z + nz * side * (q.w / 2 - 1.4), px = q.x + nx * side * (q.w / 2 + 2.2), pz = q.z + nz * side * (q.w / 2 + 2.2), a = Math.atan2(q.dx, q.dz);
      var y = groundY(ex, ez);
      if (h < [0, 0.1, 0.1, 0.06][L]) { out.wrecks.push({ x: ex, z: ez, y: groundY(ex, ez), a: a + (h2 - 0.5) * 1.2, type: ['saloon', 'hatch', 'taxi', 'van', 'police', 'muscle'][Math.floor(h2 * 6)], col: Math.floor(h2 * 50), burn: h2 < 0.35 }); if (h2 < 0.35) out.fires.push({ x: ex, y: y + 1.2, z: ez, s: 1.4 }); return; }
      h -= [0, 0.1, 0.1, 0.06][L];
      if (h < [0, 0.05, 0.12, 0.06][L]) { any = 1; var n = 4 + Math.floor(h2 * 8); for (var k = 0; k < n; k++) { var rx = px + (hash2(k, Math.round(px), 3) - 0.5) * 3, rz = pz + (hash2(Math.round(pz), k, 3) - 0.5) * 3, s = 0.3 + hash2(k, Math.round(rz), 5) * 1.0, ry = groundY(rx, rz); boxR(m, rx, rz, hash2(k, 7, Math.round(rx)) * 6, s, s * 0.7, ry - 0.1, ry + s * 0.8, ['#5a5450', '#4a4644', '#6a5a4a', '#3a3634'][k % 4]); } return; }
      h -= [0, 0.05, 0.12, 0.06][L];
      if (L === 1 && h < 0.05) { any = 1; disc(m, ex, ez, 1.2 + h2 * 1.4, '#3a0406', 9); disc(m, ex + 1.5, ez + 0.6, 0.5, '#4a0608', 7); return; } // blood on the road
      if (L === 1 && h < 0.08) { any = 1; var by = groundY(px, pz); tub(m, [px, by, pz], [px, by + 1.1, pz], 0.35, 0.35, '#3a3a36', 8); out.fires.push({ x: px, y: by + 1.2, z: pz, s: 0.9 }); return; } // a burning barrel
      if (L === 1 && h < 0.11) { any = 1; [-1, 1].forEach(function (o) { var bx = ex + q.dx * o * 1.6, bz = ez + q.dz * o * 1.6, yy = groundY(bx, bz); boxR(m, bx, bz, a + Math.PI / 2, 1.2, 0.08, yy + 0.7, yy + 0.95, '#d8d0b0'); boxR(m, bx, bz, a + Math.PI / 2, 1.2, 0.081, yy + 0.4, yy + 0.55, '#c4121c'); [-1, 1].forEach(function (s3) { boxR(m, bx + Math.cos(a) * s3 * 1.0, bz - Math.sin(a) * s3 * 1.0, a, 0.06, 0.06, yy, yy + 0.95, '#8a8a80'); }); }); return; } // police sawhorses
      if (L >= 2 && h < 0.05) { any = 1; disc(m, q.x + nx * side * 2, q.z + nz * side * 2, 2.2 + h2 * 2, '#1a1614', 12, 0.05); disc(m, q.x + nx * side * 2, q.z + nz * side * 2, 1.2 + h2, '#0a0808', 10, 0.06); return; } // a crater
      if (L >= 2 && h < 0.08) { any = 1; for (var b2 = -2; b2 <= 2; b2++) { var cx = ex + q.dx * b2 * 1.5, cz = ez + q.dz * b2 * 1.5, cy = groundY(cx, cz); boxR(m, cx, cz, a, 0.25, 0.7, cy, cy + 0.9, b2 % 2 ? '#8a8680' : '#7a7670'); boxR(m, cx, cz, a, 0.36, 0.08, cy + 0.5, cy + 0.6, '#c4121c'); } return; } // a concrete roadblock
      if (L === 3 && h < 0.07) { gany = 1; disc(g, px, pz, 1.4 + h2 * 2.2, h2 < 0.5 ? '#9a2aff' : '#5adf3a', 12, 0.05); disc(g, px + 1.8, pz - 0.6, 0.7, '#c86aff', 8, 0.055); out.pods.push({ x: px, y: groundY(px, pz) + 0.3, z: pz, s: 2.4, c: h2 < 0.5 ? [0.6, 0.15, 1] : [0.3, 0.9, 0.2] }); return; } // a goo pool
      if (L === 3 && h < 0.095) { out.tents.push({ x: px, y: groundY(px, pz) - 0.2, z: pz, ph: h2 * 20, s: 0.8 + h2 * 1.1, a: h2 * 6 }); return; } // a tentacle
      if (L === 3 && h < 0.12) { any = 1; var ey = groundY(px, pz); ell(m, px, ey + 0.8, pz, 0.7, 1.0, 0.7, '#4a1458', 10, 6); ell(m, px + 0.9, ey + 0.5, pz + 0.3, 0.45, 0.6, 0.45, '#5a1a6a', 8, 5); disc(g, px, pz, 1.3, '#7a2aaa', 9, 0.05); gany = 1; out.pods.push({ x: px, y: ey + 0.9, z: pz, s: 2.6, c: [0.8, 0.2, 1], egg: 1 }); return; } // eggs
    });
    if (any) m.upload(); else m = out.m = null; if (gany) g.upload(); else out.g = null;
    return out;
  }
  var _bc = buildChunk;
  buildChunk = function (ci, cj) { var C = _bc.apply(this, arguments); try { var L = lvl(); if (L && C) C.ch196 = chunkExtras(ci, cj, L); } catch (e) { if (window.console) console.warn('ch196', e); } return C; };
  function freeX(C) { var X = C && C.ch196; if (!X) return; if (X.m) X.m.free(); if (X.g) X.g.free(); C.ch196 = null; }
  var _uc = updateChunks;
  updateChunks = function () { var before = {}; for (var k in CHUNKS) before[k] = CHUNKS[k]; var r = _uc.apply(this, arguments); for (var k2 in before) if (!CHUNKS[k2]) freeX(before[k2]); return r; };
  function resetChunks() { for (var k in CHUNKS) { var C = CHUNKS[k]; ['m', 'nat', 'veg', 'wat', 'night', 'fr', 'glow', 'furn'].forEach(function (f) { if (C[f] && C[f].free) C[f].free(); }); freeX(C); delete CHUNKS[k]; } }

  /* ---------- the sky, the light, the fog ---------- */
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  var _wl = worldLook;
  worldLook = function () { var L = _wl.apply(this, arguments), c = CH(); if (!c || G.interior) return L; var dl = L.dl;
    if (c === 'zombie') { var za = (L.amb[0] + L.amb[1] + L.amb[2]) / 3; L.amb = mix(L.amb, [za * 0.95, za, za * 0.82], 0.6).map(function (v) { return v * 0.72; }); L.fog = mix(L.fog, [0.1 + 0.22 * dl, 0.12 + 0.22 * dl, 0.08 + 0.13 * dl], 0.8); if (dl < 0.4) L.fog = mix(L.fog, [0.18, 0.03, 0.03], 0.45 * (1 - dl / 0.4)); L.fogR = [L.fogR[0] * 0.55, L.fogR[1] * 0.75]; L.sky = { top: mix(L.sky.top, dl < 0.4 ? [0.1, 0.03, 0.03] : [0.3, 0.3, 0.26], 0.7), hor: mix(L.sky.hor, dl < 0.4 ? [0.4, 0.06, 0.04] : [0.42, 0.4, 0.3], 0.7) }; }
    else if (c === 'robot') { var av = (L.amb[0] + L.amb[1] + L.amb[2]) / 3; L.amb = mix(L.amb, [av, av * 0.96, av * 0.9], 0.8).map(function (v) { return v * 0.8; }); L.fog = mix(L.fog, [0.12 + 0.28 * dl, 0.11 + 0.25 * dl, 0.1 + 0.21 * dl], 0.8); L.fogR = [L.fogR[0] * 0.45, L.fogR[1] * 0.68]; L.sky = { top: mix(L.sky.top, [0.18 + 0.2 * dl, 0.17 + 0.18 * dl, 0.16 + 0.15 * dl], 0.75), hor: mix(L.sky.hor, [0.35 + 0.2 * dl, 0.28 + 0.16 * dl, 0.22 + 0.12 * dl], 0.75) }; }
    else if (c === 'blum') { var pu = 0.5 + 0.5 * Math.sin(G.t * 0.4); L.amb = [L.amb[0] * 0.78, L.amb[1] * 0.66, L.amb[2] * 0.86]; L.fog = mix(L.fog, [0.14 + 0.12 * dl, 0.05 + 0.1 * dl * pu, 0.2 + 0.12 * dl], 0.7); L.fogR = [L.fogR[0] * 0.6, L.fogR[1] * 0.8]; L.sky = { top: mix(L.sky.top, [0.16, 0.02, 0.22], 0.8), hor: mix(L.sky.hor, [0.12 + 0.1 * pu, 0.42, 0.14], 0.65) }; }
    return L; };

  /* ---------- the lights: flickering lamps, firelight ---------- */
  var _dw = drawWorld, BURN = [], MYL = [];
  drawWorld = function (look) { var c = CH(); if (!c || G.interior) return _dw.apply(this, arguments);
    G.dynLights = G.dynLights || []; MYL.forEach(function (L) { G.dynLights.push(L); });
    var sc = R3.scene; if (c === 'zombie') R3.scene = function (o) { if (o && o.lights) o.lights.forEach(function (L, i) { if (MYL.indexOf(L) >= 0 || G.dynLights.indexOf(L) >= 0) return; var f = hash2(Math.floor(G.t * 9 + i * 7), Math.round(L.x), 5); L.k *= f < 0.12 ? 0.05 : f < 0.3 ? 0.5 : 1; }); return sc.apply(this, arguments); };
    try { return _dw.apply(this, arguments); } finally { R3.scene = sc; G.dynLights = G.dynLights.filter(function (L) { return MYL.indexOf(L) < 0; }); } };

  /* ---------- drawing it all: fires and smoke on the buildings, wrecks, tentacles, drones, searchlights, the castle beam ---------- */
  var BILLQ2 = {};
  function bill(x, y, z, s, tile, o) { var cam = R3.cam.eye, yaw = Math.atan2(cam[0] - x, cam[2] - z), m = BILLQ2[tile]; if (!m) { m = new R3.Mesh(); m.quad([-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0], [0, 1, 1, 1, 1, 0, 0, 0], TL(tile), [0.5, 0.5, 0.5], [0, 0, 1]); m.upload(); BILLQ2[tile] = m; } R3.draw(m, ATT, Object.assign({ m: MD(x, y, z, yaw, 0, 0, s), lit: false, soft: 1 }, o || {})); }
  var CONE = null, TENT = null, DRN = null, DRNG = null, BEAM = null, BLOODM = null;
  function meshes() { if (CONE) return;
    CONE = new R3.Mesh(); tub(CONE, [0, 0, 0], [0, 1, 0], 0.01, 0.13, '#ffffff', 14); CONE.upload();
    TENT = new R3.Mesh(); var prev = [0, 0, 0]; for (var i = 1; i <= 10; i++) { var t = i / 10, p = [Math.sin(t * 2.6) * 1.6 * t, t * 7, Math.sin(t * 1.4) * 0.6 * t]; tub(TENT, prev, p, 0.62 * (1 - (i - 1) / 10) + 0.06, 0.62 * (1 - t) + 0.05, i % 2 ? '#3a0a4a' : '#4a1258', 9); if (i < 9) ell(TENT, p[0] + 0.35 * (1 - t), p[1], p[2] + 0.2, 0.14 * (1 - t) + 0.05, 0.14 * (1 - t) + 0.05, 0.08, '#c86aa0', 6, 4); prev = p; } TENT.upload();
    DRN = new R3.Mesh(); boxC(DRN, -0.45, -0.12, -0.45, 0.45, 0.18, 0.45, '#2a2a30'); boxC(DRN, -1.1, 0.02, -0.08, 1.1, 0.1, 0.08, '#3a3a40'); boxC(DRN, -0.08, 0.02, -1.1, 0.08, 0.1, 1.1, '#3a3a40'); [[1.1, 0], [-1.1, 0], [0, 1.1], [0, -1.1]].forEach(function (q) { ell(DRN, q[0], 0.14, q[1], 0.45, 0.03, 0.45, '#5a5a60', 10, 2); }); DRN.upload();
    DRNG = new R3.Mesh(); ell(DRNG, 0, -0.14, 0.3, 0.16, 0.1, 0.12, '#ff2630', 8, 4); DRNG.upload();
    BLOODM = new R3.Mesh(); var bc = litc('#3a0406', [0, 1, 0]); for (var j = 0; j < 10; j++) { var a0 = j / 10 * 6.283, a1 = (j + 1) / 10 * 6.283, r0 = 0.8 + 0.25 * Math.sin(a0 * 3), r1 = 0.8 + 0.25 * Math.sin(a1 * 3); BLOODM.tri([0, 0, 0], [Math.sin(a1) * r1, 0, Math.cos(a1) * r1], [Math.sin(a0) * r0, 0, Math.cos(a0) * r0], [0.5, 0.5, 1, 0, 0, 1], TL('white'), bc, [0, 1, 0]); } BLOODM.upload();
  }
  function nearBurning() { var cam = R3.cam.eye, L = []; BLD.forEach(function (b) { if (!burning(b)) return; var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, d = dist2(cx, cz, cam[0], cam[2]); if (d < 240 * 240) L.push([d, b]); }); L.sort(function (a, b) { return a[0] - b[0]; }); return L.slice(0, 10).map(function (q) { return q[1]; }); }
  var burnT = 0;
  function topOf(b) { if (!ruined(b)) return b.y0 + b.h + (b.style === 'house' || b.style === 'suburb' ? 1.2 : 0); var f = (lvl() >= 2 ? 0.16 : 0.3) + 0.32 * hash2(b.i, 53, 1); return b.y0 + Math.max(3, Math.round(b.h * f)) + 0.5; }
  function drawFires(T) {
    if (G.t - burnT > 0.5) { burnT = G.t; BURN = nearBurning(); MYL.length = 0; BURN.slice(0, 4).forEach(function (b) { MYL.push({ x: (b.x0 + b.x1) / 2, y: topOf(b) + 2, z: (b.z0 + b.z1) / 2, r: 26, c: [1, 0.45, 0.15], k: 1.8 }); }); }
    MYL.forEach(function (L, i) { L.k = 1.5 + 0.5 * Math.sin(T * 11 + i) * Math.sin(T * 7.3 + i * 2); });
    BURN.forEach(function (b, bi) { var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; if (!inView(cx, cz, Math.max(b.x1 - b.x0, b.z1 - b.z0) + 30)) return; var top = topOf(b), w = b.x1 - b.x0, d = b.z1 - b.z0;
      var nf = Math.min(14, 5 + Math.floor((w + d) / 6));
      for (var i = 0; i < nf; i++) { var u = hash2(b.i, 400 + i, 1), v = hash2(b.i, 420 + i, 1), x = b.x0 + u * w, z = b.z0 + v * d, wall = hash2(b.i, 440 + i, 1) < 0.35 && !ruined(b), y = top;
        if (wall) { var side = Math.floor(v * 4); x = side === 0 ? b.x0 - 0.3 : side === 1 ? b.x1 + 0.3 : x; z = side === 2 ? b.z0 - 0.3 : side === 3 ? b.z1 + 0.3 : z; y = b.y0 + 3 + Math.floor(hash2(b.i, 460 + i, 1) * Math.max(1, b.h / 3.5 - 1)) * 3.5; }
        var fl = 0.75 + 0.35 * Math.sin(T * 9 + i * 2.1) + 0.2 * Math.sin(T * 23 + i), s = (wall ? 3.2 : 6.5) * fl;
        bill(x, y + s * 0.4, z, s, 'fire', { add: 1, alpha: 1 }); bill(x + 0.4, y + s * 0.95, z - 0.3, s * 0.75, 'fire', { add: 1, alpha: 0.85 }); bill(x - 0.3, y + s * 1.5, z + 0.2, s * 0.5, 'fire', { add: 1, alpha: 0.6 }); if (!wall) bill(x, y + s * 0.6, z, s * 2.6, 'halo', { add: 1, tint: [0.9, 0.35, 0.08], alpha: 0.35 * (1 - 0.7 * dayLight(G.time)) }); }
      for (var k = 0; k < 16; k++) { var ph = (T * 0.06 + k / 16 + bi * 0.13) % 1, sy = top + 3 + ph * 80, sx = cx + ph * 22 + Math.sin(ph * 6 + bi + k) * 4, sz = cz + ph * 9 + Math.cos(ph * 5 + k) * 3; bill(sx, sy, sz, 10 + ph * 34, 'halo', { tint: [0.07, 0.06, 0.06], alpha: (1 - ph) * 0.95 * Math.min(1, ph * 5) }); }
      for (var e = 0; e < 10; e++) { var pe = (T * 0.35 + e / 10 + bi * 0.37) % 1, ex = cx + (hash2(b.i, 500 + e, 3) - 0.5) * w + Math.sin(T + e) * 2, ez = cz + (hash2(b.i, 520 + e, 3) - 0.5) * d; bill(ex, top + pe * 26, ez, 0.35, 'spark', { add: 1, alpha: 1 - pe, tint: [1, 0.55, 0.2] }); } });
  }
  var DR = [];
  function drawChunksX(T) { var cam = R3.cam.eye;
    for (var k in CHUNKS) { var C = CHUNKS[k], X = C.ch196; if (!X || !inView(C.x, C.z, C.r || 50)) continue; if (Math.abs(C.x - cam[0]) > 200 || Math.abs(C.z - cam[2]) > 200) continue;
      if (X.m) R3.draw(X.m, ATT); if (X.g) R3.draw(X.g, ATT, { lit: false, tint: [0.9 + 0.3 * Math.sin(T * 2 + C.x), 0.9, 1] });
      X.wrecks.forEach(function (w) { if (dist2(w.x, w.z, cam[0], cam[2]) > 160 * 160) return; var VM = vmesh(w.type, w.col); R3.draw(VM.body, ATT, { m: MD(w.x, w.y - 0.15, w.z, w.a, 0, 0.06), tint: w.burn ? [0.2, 0.17, 0.16] : [0.45, 0.42, 0.4] }); });
      X.fires.forEach(function (f, i) { if (dist2(f.x, f.z, cam[0], cam[2]) > 120 * 120) return; var fl = 0.8 + 0.3 * Math.sin(T * 10 + i * 3 + f.x); bill(f.x, f.y + 0.5 * fl, f.z, f.s * 1.6 * fl, 'fire', { add: 1 }); bill(f.x, f.y + 3 + (T * 2 + i) % 4, f.z, 2.5, 'halo', { tint: [0.15, 0.13, 0.12], alpha: 0.35 }); });
      X.pods.forEach(function (p, i) { var pu = 0.6 + 0.4 * Math.sin(T * (p.egg ? 3 : 1.5) + i + p.x); bill(p.x, p.y, p.z, p.s * (0.8 + 0.3 * pu), 'halo', { add: 1, tint: [p.c[0] * pu, p.c[1] * pu, p.c[2] * pu], alpha: 0.8 }); });
      X.tents.forEach(function (t) { if (dist2(t.x, t.z, cam[0], cam[2]) > 140 * 140) return; R3.draw(TENT, ATT, { m: MD(t.x, t.y, t.z, t.a + Math.sin(T * 0.3 + t.ph) * 0.6, Math.sin(T * 1.1 + t.ph) * 0.28, Math.cos(T * 0.8 + t.ph) * 0.32, t.s) }); bill(t.x, t.y + 0.4, t.z, 3.5 * t.s, 'halo', { add: 1, tint: [0.5, 0.1, 0.7], alpha: 0.6 }); });
    } }
  function drawSearch(T) { var cam = R3.cam.eye, L = [];
    BLD.forEach(function (b) { if (b.h < 22 || ruined(b)) return; var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, d = dist2(cx, cz, cam[0], cam[2]); if (d < 320 * 320 && hash2(b.i, 600, 1) < 0.5) L.push([d, b]); });
    L.sort(function (a, b) { return a[0] - b[0]; }); L.slice(0, 4).forEach(function (q, i) { var b = q[1], cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, y = b.y0 + b.h;
      R3.draw(CONE, ATT, { m: MD(cx, y, cz, T * (0.35 + i * 0.08) + i * 2.1, 0.42 + 0.18 * Math.sin(T * 0.5 + i), 0, 260), lit: false, add: 1, alpha: 0.13, tint: [1, 0.95, 0.85] }); bill(cx, y + 0.5, cz, 4, 'halo', { add: 1, tint: [1, 0.95, 0.8] }); }); }
  var DRONES = [];
  function drawDrones(T, dt) { var n = CH() === 'robot' ? 4 : 0; while (DRONES.length < n) DRONES.push({ cx: P.x, cz: P.z, r: 30 + Math.random() * 40, ph: Math.random() * 6, sp: 0.15 + Math.random() * 0.15, h: 16 + Math.random() * 10 });
    DRONES.length = n; DRONES.forEach(function (d, i) { if (dist2(d.cx, d.cz, P.x, P.z) > 150 * 150) { var a = Math.random() * 6.28; d.cx = P.x + Math.sin(a) * 60; d.cz = P.z + Math.cos(a) * 60; }
      var a2 = T * d.sp + d.ph, x = d.cx + Math.sin(a2) * d.r, z = d.cz + Math.cos(a2) * d.r, y = groundY(x, z) + d.h + Math.sin(T * 1.3 + i) * 1.2; d.x = x; d.z = z; d.y = y;
      if (!inView(x, z, 30)) return; R3.draw(DRN, ATT, { m: MD(x, y, z, a2 + Math.PI / 2, 0.1, 0) }); R3.draw(DRNG, ATT, { m: MD(x, y, z, a2 + Math.PI / 2, 0.1, 0), lit: false, tint: [1.4, 0.3, 0.3] }); bill(x, y - 0.1, z, 1.6 + 0.6 * Math.sin(T * 8 + i), 'halo', { add: 1, tint: [1, 0.15, 0.15] });
      var sw = Math.sin(T * 0.9 + i * 2) * 0.35; R3.draw(CONE, ATT, { m: MD(x, y - 0.2, z, a2, Math.PI + sw, 0, d.h + 3), lit: false, add: 1, alpha: 0.18, tint: [1, 0.9, 0.85] });
      var gx = x + Math.sin(a2) * Math.sin(sw) * (d.h), gz = z + Math.cos(a2) * Math.sin(sw) * (d.h); d.gx = gx; d.gz = gz; bill(gx, groundY(gx, gz) + 0.3, gz, 7, 'halo', { add: 1, tint: [0.6, 0.55, 0.5], alpha: 0.5 }); }); }
  var CASTLE = null;
  function drawBeam(T) { if (!CASTLE) CASTLE = POIS.filter(function (p) { return p.k === 'castle'; })[0] || { x: WX / 2, z: WZ / 2, h: 0 }; if (!BEAM) { BEAM = new R3.Mesh(); tub(BEAM, [0, 0, 0], [0, 1, 0], 1, 1.6, '#ffffff', 16); BEAM.upload(); }
    var cy = groundY(CASTLE.x, CASTLE.z), pu = 0.6 + 0.4 * Math.sin(T * 1.7);
    // a beam is drawn as a squashed cylinder: radius 8, 900 m tall (scaled on y only by drawing it 9 times, stacked)
    for (var k = 0; k < 9; k++) R3.draw(BEAM, ATT, { m: MM(MD(CASTLE.x, cy + 20 + k * 100, CASTLE.z, T * 0.5, 0, 0, 1), [8, 0, 0, 0, 0, 100, 0, 0, 0, 0, 8, 0, 0, 0, 0, 1]), lit: false, add: 1, alpha: 0.22 * pu * (1 - k / 11), tint: [0.75, 0.2, 1] });
    var cam = R3.cam.eye, dx = CASTLE.x - cam[0], dz = CASTLE.z - cam[2], d = Math.hypot(dx, dz) || 1; bill(CASTLE.x, cy + 900, CASTLE.z, 380 * pu + 120, 'halo', { add: 1, tint: [0.5, 0.1, 0.8], alpha: 0.8, noDepth: 1 }); }
  var PART = [];
  function drawAir(T) { var c = CH(), cam = R3.cam.eye, n = c === 'robot' ? 70 : c === 'blum' ? 55 : 0; for (var i = 0; i < n; i++) { var h1 = hash2(i, 3, 7), h2 = hash2(i, 5, 7), h3 = hash2(i, 9, 7), B = 26;
      if (c === 'robot') { var fy = (h3 * 30 - T * (1.2 + h1)) % 30; if (fy < 0) fy += 30; var x = cam[0] + ((h1 * 2 * B + T * 0.8 + Math.sin(T * 0.7 + i)) % (2 * B)) - B, z = cam[2] + ((h2 * 2 * B + T * 0.3) % (2 * B)) - B; bill(x, cam[1] - 12 + fy, z, 0.18, 'halo', { tint: [0.6, 0.58, 0.55], alpha: 0.85 }); }
      else { var uy = (h3 * 24 + T * (0.4 + h1 * 0.5)) % 24, x2 = cam[0] + h1 * 2 * B - B + Math.sin(T * 0.5 + i) * 2, z2 = cam[2] + h2 * 2 * B - B + Math.cos(T * 0.4 + i) * 2; bill(x2, cam[1] - 8 + uy, z2, 0.35 + 0.15 * Math.sin(T * 3 + i), 'halo', { add: 1, tint: i % 3 ? [0.4, 1, 0.3] : [0.8, 0.3, 1], alpha: 0.9 }); } } }
  function drawBodies() { var cam = R3.cam.eye; PEDS.forEach(function (p) { if (!p.corpse || dist2(p.x, p.z, cam[0], cam[2]) > 70 * 70) return; R3.draw(BLOODM, ATT, { m: MD(p.x, groundY(p.x, p.z) + 0.04, p.z, p.id * 9, 0, 0, 1.1 + (p.id * 10) % 0.8) }); }); }
  var _dfx = drawFx;
  drawFx = function () { _dfx.apply(this, arguments); var c = CH(); if (!c || G.interior || !P) return; try { meshes(); var T = G.t;
      drawChunksX(T); if (c === 'zombie' || c === 'robot') drawFires(T); if (c === 'zombie') drawBodies(); if (c === 'robot') { drawSearch(T); drawDrones(T); } if (c === 'blum') drawBeam(T); drawAir(T);
    } catch (e) { if (!drawFx.warned) { drawFx.warned = 1; if (window.console) console.warn('ch196 draw', e); } } };

  /* ---------- the people: who is about, the scared, the hiding, the bodies, the monsters going after people ---------- */
  var _pt = popTarget; popTarget = function () { var n = _pt.apply(this, arguments), c = CH(); return c === 'zombie' ? Math.round(n * 1.5) : c === 'robot' ? Math.round(n * 1.25) : c === 'blum' ? Math.round(n * 1.25) : n; };
  var _tt = trafficTarget; trafficTarget = function () { var n = _tt.apply(this, arguments), c = CH(); return c === 'zombie' ? Math.round(n * 0.55) : c === 'robot' ? Math.round(n * 0.4) : c === 'blum' ? Math.round(n * 0.6) : n; };
  var HIDE = ['Is it safe? Is it gone?', 'Let us in! Please!', 'Shh. They can hear you.', 'Don\'t open the door!', 'They got my mum. They got my mum.', 'Have you been bitten? Show me your hands.', 'I am not coming out. Ever.', 'Cumhead! Get us out of here!'];
  var ROBOSAY = ['CITIZEN. YOU ARE MESSY.', 'COMPLY. CLEAN. COMPLY.', 'SCANNING... ORGANIC DETECTED.', 'HUMANS INDOORS. CURFEW.', 'RESISTANCE IS UNHYGIENIC.'], GOONSAY = ['All hail Blumhead.', 'Join the goo. It is warm.', 'The egg is coming.', 'We are one. You will be one.', 'Blumhead loves you.'];
  var fearT = 0, spawnT = 0, lastCh;
  function chapCheck() { var c = CH(); if (c === lastCh) return; var had = lastCh !== undefined; lastCh = c; HOUSEB = null; BURN = []; MYL.length = 0; DRONES.length = 0;
    if (had || c) { resetChunks(); if (P) try { updateChunks(P.x, P.z, 400); } catch (e) {} }
    if (!posters(c)) chapCheck.pend = c; else chapCheck.pend = undefined;
    G.moonBig = c === 'zombie' ? 1 : G.moonBig === 1 ? 0 : G.moonBig;
    if (!c) PEDS.forEach(function (p) { if (p.corpse || p.hider) { p.keep = 0; p.deadT = 99; if (p.hider) p.dead = 1; } }); }
  function monsters(dt) { var c = CH(); if (!c || G.interior) return;
    fearT -= dt; if (fearT <= 0) { fearT = 0.25; var mons = PEDS.filter(function (p) { return !p.dead && !p.inVeh && (p.kind === 'zombie' || p.kind === 'robot' || p.kind === 'goon') && dist2(p.x, p.z, P.x, P.z) < 110 * 110; });
      PEDS.forEach(function (p) { if (p.dead || p.inVeh || p.kind !== 'cit' || p.who || p.mission || p.keep && !p.hider) return; var best = null, bd = 18 * 18; mons.forEach(function (m) { var d = dist2(m.x, m.z, p.x, p.z); if (d < bd) { bd = d; best = m; } }); if (!best) return;
        if (p.hider) { if (p.sayT <= 0 && dist2(p.x, p.z, P.x, P.z) < 15 * 15 && Math.random() < 0.3) say(p, pick(SCREAMS)); return; }
        p.fear = 2.5; p.fx = best.x; p.fz = best.z; p.fxT = G.t; if (p.sayT <= 0 && Math.random() < 0.22) say(p, pick(SCREAMS));
        if (best.state !== 'fight' && bd > 2) { var dx = p.x - best.x, dz = p.z - best.z, l = Math.sqrt(bd) || 1; best.hunt = p; } }); }
    PEDS.forEach(function (m) { if (m.dead || !m.hunt || m.state === 'fight' || m.inVeh) { if (m) m.hunt = m && m.hunt && !m.hunt.dead ? m.hunt : null; return; } var v = m.hunt; if (v.dead || v.inVeh) { m.hunt = null; if (v.dead && m.kind === 'zombie') { m.feedT = 6; m.state = 'idle'; } return; }
      var dx = v.x - m.x, dz = v.z - m.z, d = Math.hypot(dx, dz) || 1, sp = m.kind === 'zombie' ? (dayLight(G.time) < 0.3 ? 3.2 : 2.2) : m.kind === 'robot' ? 2.8 : 3.4; if (d > 26) { m.hunt = null; return; }
      if (m.kind === 'robot' && d < 14) { if ((m.zapT = (m.zapT || 0) - dt) <= 0) { m.zapT = 1.2; addFx({ k: 'tracer', x: m.x, y: m.y + 1.5, z: m.z, ex: v.x, ey: v.y + 1.1, ez: v.z, life: 0.08 }); hurtPed(v, 14, null); sfx.play('shoot'); if (m.sayT <= 0) say(m, pick(ROBOSAY)); } m.a = Math.atan2(dx, dz); return; }
      if (d > 1.1) { if (!collide(m.x + dx / d * sp * dt, m.z + dz / d * sp * dt, 0.35, m.y, 1.6).hit) { m.x += dx / d * sp * dt; m.z += dz / d * sp * dt; } m.a = Math.atan2(dx, dz); m.sp = sp; m.ph += dt * sp * 4; }
      else { m.atkT = 0.35; if (m.kind === 'goon') { if ((m.cvT = (m.cvT || 0) + dt) > 1.5) { v.kind = 'goon'; v.rig = RIGS.goon; v.hostile = true; v.fear = 0; v.fxT = -1; addFx({ k: 'cloud', x: v.x, y: v.y + 1, z: v.z, life: 2 }); say(v, pick(GOONSAY)); m.hunt = null; m.cvT = 0; } }
        else { hurtPed(v, (m.kind === 'zombie' ? 22 : 16) * dt, null); if (Math.random() < dt * 2) addFx({ k: 'blood', x: v.x, y: v.y + 1.2, z: v.z, vx: rnd(-2, 2), vy: 3, vz: rnd(-2, 2), life: 0.6 }); if (v.sayT <= 0) say(v, pick(SCREAMS)); } } });
    PEDS.forEach(function (m) { if (m.feedT > 0) { m.feedT -= dt; m.state = 'idle'; m.sp = 0; if (m.feedT <= 0) m.state = 'walk'; } });
    spawnT -= dt; if (spawnT <= 0) { spawnT = 1.5; var lv = lvl();
      // bodies in the streets
      if (lv <= 2) { var bodies = PEDS.filter(function (p) { return p.corpse; }).length; if (bodies < (lv === 1 ? 9 : 6)) { var r = spawnPoint(30, 85); if (r) { var off = (r.E.w / 2 + 1.5) * (Math.random() < 0.5 ? 1 : -1), bx = r.x - r.dz * off, bz = r.z + r.dx * off; if (!collide(bx, bz, 0.4, groundY(bx, bz), 1.7).hit) { var b = makePed({ x: bx, z: bz, a: Math.random() * 6.28, kind: 'cit', rig: rigFor('cit') }); b.dead = 1; b.hp = 0; b.deadT = -1e9; b.corpse = 1; b.god = 1; } } } }
      // people hiding by the walls (Dead Loads)
      if (lv === 1) { var hid = PEDS.filter(function (p) { return p.hider && !p.dead; }).length; if (hid < 4) { var tryB = BLD[Math.floor(Math.random() * BLD.length)]; for (var t = 0; t < 30 && !(tryB && boarded(tryB) && dist2((tryB.x0 + tryB.x1) / 2, (tryB.z0 + tryB.z1) / 2, P.x, P.z) < 90 * 90 && dist2((tryB.x0 + tryB.x1) / 2, (tryB.z0 + tryB.z1) / 2, P.x, P.z) > 25 * 25); t++) tryB = BLD[Math.floor(Math.random() * BLD.length)];
        if (tryB && boarded(tryB)) { var sd = Math.floor(Math.random() * 4), hx = sd === 0 ? tryB.x0 - 0.7 : sd === 1 ? tryB.x1 + 0.7 : lerp(tryB.x0, tryB.x1, Math.random()), hz = sd === 2 ? tryB.z0 - 0.7 : sd === 3 ? tryB.z1 + 0.7 : lerp(tryB.z0, tryB.z1, Math.random());
          if (!collide(hx, hz, 0.35, groundY(hx, hz), 1.7).hit) { var h = makePed({ x: hx, z: hz, kind: 'cit', rig: rigFor('cit'), state: 'idle' }); h.hider = 1; h.cower = 1; h.a = sd === 0 ? -Math.PI / 2 : sd === 1 ? Math.PI / 2 : sd === 2 ? Math.PI : 0; h.a += Math.PI; h.ctl = function (q, dt2) { q.sp = 0; if (q.fear > 0) { q.ctl = null; q.cower = 0; q.state = 'flee'; return; } if (q.sayT <= 0 && dist2(q.x, q.z, P.x, P.z) < 9 * 9 && Math.random() < dt2 * 0.5) say(q, pick(HIDE)); }; } } } }
      // big Enforcer robots
      if (lv === 2) PEDS.forEach(function (p) { if (p.kind === 'robot' && p.big === undefined) { p.big = Math.random() < 0.14 ? 1 : 0; if (p.big) { p.sc = 1.7; p.hp = 260; } } });
      if (lv === 2 && Math.random() < 0.2) { var rb = PEDS.filter(function (p) { return p.kind === 'robot' && !p.dead && p.sayT <= 0 && dist2(p.x, p.z, P.x, P.z) < 30 * 30; })[0]; if (rb) say(rb, pick(ROBOSAY)); }
      if (lv === 3 && Math.random() < 0.2) { var gb = PEDS.filter(function (p) { return p.kind === 'goon' && !p.dead && p.sayT <= 0 && dist2(p.x, p.z, P.x, P.z) < 30 * 30; })[0]; if (gb) say(gb, pick(GOONSAY)); }
      if (lv === 1 && Math.random() < 0.08) sfx.play('roar'); } }
  var _sp = stepPeds;
  stepPeds = function (dt) { try { chapCheck(); if (chapCheck.pend !== undefined && ATL) { if (posters(chapCheck.pend)) chapCheck.pend = undefined; } } catch (e) {} var r = _sp.apply(this, arguments); try { monsters(dt); } catch (e) { if (!stepPeds.warned) { stepPeds.warned = 1; if (window.console) console.warn('ch196 peds', e); } } return r; };
  window.CH196 = { ruined: ruined, burning: burning, boarded: boarded, reset: resetChunks };
})();
