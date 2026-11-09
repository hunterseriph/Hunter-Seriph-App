/* =====================================================================================================
   TB'S HENCHMEN: one at the end of every part of the night (B1 by the stairs out of the Suck n' Fuck, the woods,
   Ejaculand, the cemetery, Clubhouse Row before the Clubhouse). Each one waits by the way on, wakes when it sees you,
   and the way on stays shut until it is dead. Their moves are data: wind-up (a red tell), then the move.
   Also the circus foes' tricks (the Strongman's slam, the Acrobat's leap, the Pie Clown's pies) and the hazards on
   the floor (telegraph rings, puke, fire, grave hands).
   ===================================================================================================== */
var HENCH = {
  muckies: { wake: 'Mama made muckies... and you get to EAT them.', p2: 'Wahhh! Waaaahhh! MAMA WANTS HIS BOTTLE!', die: 'Mama... Mama made... muckies...', summon: ['gimp', 'gimp'],
    moves: { slam: { w: 3, max: 3.4, wind: 1.0, r: 3.3, dmg: 22 }, puke: { w: 3, min: 2, max: 10, wind: 0.8, kind: 'lob', hz: 'puke', r: 2.2, t: 7, dps: 9, dose: 0.06, n: 3 }, charge: { w: 2, min: 4, max: 16, wind: 0.9, v: 9.5, t: 2.4, dmg: 22 }, swipe: { w: 3, max: 2.4, wind: 0.6, dmg: 18, reach: 2.5 } } },
  stag: { wake: '*a scream that is half a man and half a deer*', p2: '*it tears at its own stitches and comes faster*', die: '*it lies down in the leaves and stops*', summon: ['gimp', 'butcher'],
    moves: { charge: { w: 4, min: 3, max: 18, wind: 0.7, v: 12.5, t: 2.2, dmg: 24 }, swipe: { w: 3, max: 2.4, wind: 0.45, dmg: 17, reach: 2.4 }, leap: { w: 2, min: 3, max: 10, wind: 0.5, air: 0.75, r: 2.2, dmg: 20 }, howl: { w: 1, min: 0, max: 30, wind: 0.3, t: 1.6 } } },
  smiles: { wake: 'Two heads are better than one! Let us make you SMILE, ear to ear!', p2: 'Hold still! We want to see your insides smile too!', die: 'Not... funny... any... more...', summon: ['clown', 'pieclown'],
    moves: { juggle: { w: 3, min: 3, max: 13, wind: 0.7, kind: 'volley', n: 5, spread: 0.2, v: 11, dmg: 7, tex: 'i_knife', sz: 0.2 }, spin: { w: 3, max: 9, wind: 0.6, t: 2.6, v: 5.5, r: 1.8, dps: 26 }, pies: { w: 2, min: 3, max: 12, wind: 0.6, kind: 'volley', n: 3, spread: 0.3, v: 9, dmg: 3, splat: 1, tex: 'splat', sz: 0.22 }, swipe: { w: 3, max: 2.4, wind: 0.5, dmg: 16, reach: 2.4 } } },
  bride: { wake: 'You will do. Till death do us part. Yours.', p2: 'My husband is lonely down there. Go and keep him company!', die: 'I... do...', summon: ['gimp', 'butcher'],
    moves: { burrow: { w: 3, min: 3, max: 30, wind: 0.6, under: 1.8, r: 2.0, dmg: 24 }, hands: { w: 3, min: 0, max: 30, wind: 0.8, n: 4, delay: 1.1, r: 1.2, dmg: 15 }, swipe: { w: 3, max: 2.6, wind: 0.6, dmg: 20, reach: 2.7 }, slam: { w: 1, max: 3.0, wind: 0.9, r: 2.8, dmg: 18 } } },
  sissifier: { wake: 'TB said I could keep whatever is left of you. Lipstick on, pretty. Hold still.', p2: 'Oh you made me SMUDGE it! Now I will make you pretty, so pretty...', die: 'I was... so... pretty...', summon: ['gimp', 'pusher'],
    moves: { lipstick: { w: 3, min: 3, max: 14, wind: 0.6, kind: 'volley', n: 4, spread: 0.16, v: 12, dmg: 5, dose: 0.3, tex: 'pinkgoo', sz: 0.12 }, grab: { w: 3, max: 4, wind: 0.5, reach: 2.6, dmg: 16, dose: 1 }, charge: { w: 2, min: 4, max: 16, wind: 0.8, v: 11, t: 2.2, dmg: 22 }, swipe: { w: 3, max: 2.5, wind: 0.5, dmg: 17, reach: 2.5 }, perfume: { w: 2, min: 2, max: 10, wind: 0.7, kind: 'lob', hz: 'puke', r: 2.0, t: 6, dps: 6, dose: 0.08, n: 2 } } }
};
function henchAlive() { return (G.foes || []).some(function (f) { return f.d && f.d.boss && f.st !== 'dead'; }); }
function henchName() { var f = (G.foes || []).filter(function (f) { return f.d && f.d.boss && f.st !== 'dead'; })[0]; return f ? f.d.n : ''; }
function henchBlock() { if (!henchAlive()) return false; sayAll(henchName() + ' is still standing. The way on stays shut.', 3, '#c4121c'); sfx.play('no'); return true; }
/* where the henchman waits: a few tiles back from the way on, on open ground */
function henchSpot(F) {
  var to = F.exitIn || F.exit || F.club; if (!to) return null; var D = bfs(F, to.i, to.j, function (k) { return k === KC || k === KR || k === KD; }), best = null, bs = -1;
  for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) { var d = D[idx(i, j)], k = F.K[idx(i, j)]; if (d < 3 || d > 9 || (k !== KC && k !== KR)) continue; var open = 0; for (var b = -1; b <= 1; b++) for (var a = -1; a <= 1; a++) { var kk = F.K[idx(i + a, j + b)]; if (kk === KC || kk === KR) open++; } var s = open * 2 - Math.abs(d - 5); if (s > bs) { bs = s; best = { i: i, j: j }; } }
  return best;
}
function placeHench(F, fi) { var k = FLOORS[fi].hench; if (!k) return; var s = henchSpot(F); if (!s) return; F.foes.push({ i: s.i, j: s.j, k: k, boss: 1 }); }
function stepHench(f, dt) {
  var d = f.d, H = HENCH[f.k], P = nearestPlayer(f); if (!P) return; var pd = dist2(f, P); f.spd = 0; f.wind = 0;
  if (f.st !== 'fight') { // waiting by the way on: wakes when it sees you, or when you hurt it
    f.a += angDiff(Math.atan2(P.x - f.x, P.z - f.z), f.a) * Math.min(1, dt * 0.6);
    if ((pd < 12 && canSee(f.x, f.z, P.x, P.z) && !P.hide) || f.hp < f.max || f.st === 'chase') { f.st = 'fight'; f.cd = 1.6; if (G.botIn || G.noScenes) { G.banner = { s: d.n.toUpperCase(), t: 3.5 }; subtitle(d.n, H.wake, 4); sfx.play('sting'); } else sceneHench(f); sfx.play('shout'); }
    return;
  }
  if (!f.p2 && f.hp < f.max * 0.5) { f.p2 = 1; subtitle(d.n, H.p2, 3.5); sfx.play('scream'); (H.summon || []).forEach(function (k, n) { var g = randomNear(tileOf(f.x), tileOf(f.z), 6), fd = FOES[k]; if (!g) return; G.foes.push({ id: G.foes.length, k: k, d: fd, x: tx(g.i), z: tx(g.j), a: 0, hp: fd.hp, st: 'chase', sus: 1, home: { i: g.i, j: g.j }, ph: 0, t: 0, atk: -1, cool: 1, ko: 0, bleed: 0, poison: 0, daze: 0, goal: null, spd: 0, hurt: 0, wait: 0, tgt: nearestPlayer({ x: tx(g.i), z: tx(g.j) }) }); }); }
  var sp = f.p2 ? 1.25 : 1; if (f.howlT > 0) { f.howlT -= dt; sp *= 1.3; }
  var m = f.mv;
  if (!m) {
    f.cd -= dt * sp; f.a += angDiff(Math.atan2(P.x - f.x, P.z - f.z), f.a) * Math.min(1, dt * 5);
    if (pd > 1.9) { if (canSee(f.x, f.z, P.x, P.z) && pd < 6) steer(f, (P.x - f.x) / pd, (P.z - f.z) / pd, d.run * sp, dt, 'foe'); else followFlow(f, tileFlow(f, tileOf(P.x), tileOf(P.z)), d.run * sp, dt, 'foe'); }
    if (f.cd <= 0) { var opts = [], tot = 0; Object.keys(H.moves).forEach(function (k) { var M = H.moves[k]; if (pd < (M.min || 0) || pd > (M.max || 99)) return; if (k === 'howl' && f.howlT > 0) return; opts.push(k); tot += M.w; });
      if (opts.length) { var r = Math.random() * tot, pick = opts[0]; for (var o = 0; o < opts.length; o++) { r -= H.moves[opts[o]].w; if (r <= 0) { pick = opts[o]; break; } } f.mv = { k: pick, M: H.moves[pick], t: 0, tgt: P, to: { x: P.x, z: P.z } }; f.cd = (f.p2 ? 0.9 : 1.5) + Math.random() * 0.8; sfx.play('grunt'); }
      else f.cd = 0.3; }
    f.ph += f.spd * dt * 2.4; return;
  }
  m.t += dt * sp; var M = m.M, T = m.tgt || P, k = m.k, kind = M.kind || k;
  if (m.t < M.wind) { f.wind = m.t / M.wind; if (kind !== 'burrow') f.a += angDiff(Math.atan2(T.x - f.x, T.z - f.z), f.a) * Math.min(1, dt * 7); m.to = { x: T.x, z: T.z }; if (kind === 'slam' || kind === 'leap') { if (!m.mk) { m.mk = 1; G.hazards.push({ x: kind === 'leap' ? T.x : f.x, z: kind === 'leap' ? T.z : f.z, r: M.r, t: M.wind - m.t + 0.25, delay: M.wind - m.t, k: 'tell' }); } } return; }
  var mt = m.t - M.wind;
  if (kind === 'swipe') { if (!m.hit) { m.hit = 1; sfx.play('swingbig'); players().forEach(function (pl) { if (!pl.dead && dist2(f, pl) < (M.reach || 2.3) && Math.abs(angDiff(Math.atan2(pl.x - f.x, pl.z - f.z), f.a)) < 1.2) hurtPlayer(pl, M.dmg, f, M.dose || 0); }); } if (mt > 0.45) f.mv = null; return; }
  if (kind === 'slam') { if (!m.hit) { m.hit = 1; KIT.shake(12); sfx.play('boom'); players().forEach(function (pl) { if (!pl.dead && dist2(f, pl) < M.r) hurtPlayer(pl, M.dmg, f, 0); }); for (var i = 0; i < 12; i++) G.fx.push({ k: 'smoke', x: f.x + Math.cos(i) * M.r * 0.6, y: 0.2, z: f.z + Math.sin(i) * M.r * 0.6, t: 1.2, vy: 0.6 }); } if (mt > 0.6) f.mv = null; return; }
  if (kind === 'charge') { var v = M.v * sp, ox = f.x, oz = f.z; f.x += Math.sin(f.a) * v * dt; f.z += Math.cos(f.a) * v * dt; collide(f, d.rad || 0.5, 'foe'); f.spd = v; f.ph += v * dt * 2.4;
    players().forEach(function (pl) { if (!m.hitP && !pl.dead && dist2(f, pl) < (d.rad || 0.5) + 0.6) { m.hitP = 1; hurtPlayer(pl, M.dmg, f, 0); } });
    if (Math.hypot(f.x - ox, f.z - oz) < v * dt * 0.4) { f.mv = null; f.stun = 2.0; KIT.shake(9); sfx.play('bonk'); sayAll(d.n + ' smacks into the wall. Hit it now!', 2.2, '#ffe36a'); return; }
    if (mt > M.t) f.mv = null; return; }
  if (kind === 'volley') { if (!m.hit) { m.hit = 1; var a0 = Math.atan2(T.x - f.x, T.z - f.z); for (var s = 0; s < M.n; s++) { var a = a0 + (s - (M.n - 1) / 2) * M.spread; G.shots.push({ x: f.x, z: f.z, y: 1.5, vx: Math.sin(a) * M.v, vz: Math.cos(a) * M.v, t: 1.8, dmg: M.dmg, dose: M.dose || 0, splat: M.splat, tex: M.tex, sz: M.sz }); } sfx.play('throw'); } if (mt > 0.5) f.mv = null; return; }
  if (kind === 'lob') { if (!m.hit) { m.hit = 1; m.spots = []; for (var q = 0; q < (M.n || 1); q++) { var ang = Math.random() * 6.28, rr = q ? 1.6 + Math.random() * 2 : 0; m.spots.push({ x: m.to.x + Math.cos(ang) * rr, z: m.to.z + Math.sin(ang) * rr }); } m.spots.forEach(function (s2) { G.hazards.push({ x: s2.x, z: s2.z, r: M.r, t: 0.9, delay: 0.9, k: 'tell' }); }); sfx.play('throw'); }
    if (mt > 0.9 && !m.land) { m.land = 1; m.spots.forEach(function (s2) { G.hazards.push({ x: s2.x, z: s2.z, r: M.r, t: M.t, k: M.hz, dps: M.dps, dose: M.dose }); }); sfx.play('splat'); } if (mt > 1.1) f.mv = null; return; }
  if (kind === 'leap') { if (!m.from) m.from = { x: f.x, z: f.z }; var k2 = Math.min(1, mt / M.air); f.x = m.from.x + (m.to.x - m.from.x) * k2; f.z = m.from.z + (m.to.z - m.from.z) * k2; f.y = Math.sin(k2 * Math.PI) * 2.6; f.spd = 6;
    if (k2 >= 1 && !m.hit) { m.hit = 1; f.y = 0; collide(f, d.rad || 0.5, 'foe'); KIT.shake(10); sfx.play('boom'); players().forEach(function (pl) { if (!pl.dead && dist2(f, pl) < M.r) hurtPlayer(pl, M.dmg, f, 0); }); } if (mt > M.air + 0.4) { f.mv = null; f.y = 0; } return; }
  if (kind === 'howl') { if (!m.hit) { m.hit = 1; sfx.play('scream'); makeNoise(f.x, f.z, 60, 'shout'); f.howlT = 8; sayAll('The howl carries through the trees. Something big is coming.', 2.5, '#c4121c'); } if (mt > M.t) f.mv = null; return; }
  if (kind === 'spin') { f.spinT = mt; var v2 = M.v * sp, dx = T.x - f.x, dz = T.z - f.z, l = Math.hypot(dx, dz) || 1; steer(f, dx / l, dz / l, v2, dt, 'foe'); f.a += dt * 14; f.spd = v2;
    players().forEach(function (pl) { if (!pl.dead && dist2(f, pl) < M.r && Math.random() < dt * 3) hurtPlayer(pl, M.dps / 3, f, 0); }); if (mt > M.t) { f.mv = null; f.spinT = 0; f.stun = 1.0; } return; }
  if (kind === 'burrow') { if (!m.down) { m.down = 1; f.under = 1; sfx.play('scrape'); } if (f.under) { var tgt = { x: T.x, z: T.z }; f.x += (tgt.x - f.x) * Math.min(1, dt * 2.2); f.z += (tgt.z - f.z) * Math.min(1, dt * 2.2); if (!m.mk && mt > M.under - 0.8) { m.mk = 1; m.at = { x: f.x, z: f.z }; G.hazards.push({ x: f.x, z: f.z, r: M.r, t: 0.85, delay: 0.8, k: 'tell' }); } if (m.at) { f.x = m.at.x; f.z = m.at.z; } }
    if (mt > M.under && !m.hit) { m.hit = 1; f.under = 0; collide(f, d.rad || 0.5, 'foe'); KIT.shake(10); sfx.play('boom'); players().forEach(function (pl) { if (!pl.dead && dist2(f, pl) < M.r) hurtPlayer(pl, M.dmg, f, 0); }); for (var i2 = 0; i2 < 10; i2++) G.fx.push({ k: 'smoke', x: f.x, y: 0.4, z: f.z, t: 1.4, vy: 1 + Math.random() }); }
    if (mt > M.under + 0.6) f.mv = null; return; }
  if (kind === 'hands') { if (!m.hit) { m.hit = 1; sfx.play('scrape'); players().forEach(function (pl) { if (pl.dead) return; for (var h = 0; h < M.n; h++) { var a3 = Math.random() * 6.28, r3 = h ? 1 + Math.random() * 2.2 : 0; G.hazards.push({ x: pl.x + Math.cos(a3) * r3, z: pl.z + Math.sin(a3) * r3, r: M.r, t: M.delay + 0.9, delay: M.delay, k: 'hand', hit: M.dmg }); } }); } if (mt > 0.8) f.mv = null; return; }
  if (kind === 'grab') { var v3 = 8 * sp; if (mt < 0.35) { f.x += Math.sin(f.a) * v3 * dt; f.z += Math.cos(f.a) * v3 * dt; collide(f, d.rad || 0.5, 'foe'); f.spd = v3; }
    if (!m.hit && mt > 0.3) { m.hit = 1; players().forEach(function (pl) { if (!pl.dead && dist2(f, pl) < M.reach && Math.abs(angDiff(Math.atan2(pl.x - f.x, pl.z - f.z), f.a)) < 1.1) { hurtPlayer(pl, M.dmg, f, M.dose); subtitle(d.n, 'Pretty, pretty, PRETTY!', 2); sfx.play('tblaugh'); } }); } if (mt > 0.9) f.mv = null; return; }
  f.mv = null;
}
/* the floor: telegraphs (red rings that go off when they close), puke, perfume, fire, grave hands */
function stepHazards(dt) {
  var H = G.hazards; if (!H) return;
  for (var i = H.length - 1; i >= 0; i--) { var h = H[i]; h.t -= dt; if (h.delay > 0) { h.delay -= dt; if (h.delay <= 0 && h.hit) { players().forEach(function (pl) { if (!pl.dead && !pl.hide && Math.hypot(pl.x - h.x, pl.z - h.z) < h.r) hurtPlayer(pl, h.hit, h, 0); }); sfx.play('grunt'); } }
    else if (h.dps) players().forEach(function (pl) { if (!pl.dead && !pl.hide && Math.hypot(pl.x - h.x, pl.z - h.z) < h.r && Math.random() < dt * 3) hurtPlayer(pl, h.dps / 3, null, h.dose || 0); });
    if (h.t <= 0) H.splice(i, 1); }
}
function drawHazards(m, add) { // add: the glowing pass (telegraph rings); else the solid pass (puke, hands)
  (G.hazards || []).forEach(function (h) { var x = h.x, z = h.z, s = h.r;
    if (add && h.k === 'tell') { var k = 0.25 + 0.5 * (1 - Math.max(0, h.delay) / 1.2); s *= 1 + Math.sin(KIT.t * 20) * 0.03; m.quad([x - s, 0.05, z - s], [x + s, 0.05, z - s], [x + s, 0.05, z + s], [x - s, 0.05, z + s], [0, 0, 1, 0, 1, 1, 0, 1], TL('ring'), [0.6 * k + 0.2, 0.05, 0.05], [0, 1, 0], 1); }
    if (add && h.k === 'hand' && h.delay > 0) m.quad([x - s, 0.05, z - s], [x + s, 0.05, z - s], [x + s, 0.05, z + s], [x - s, 0.05, z + s], [0, 0, 1, 0, 1, 1, 0, 1], TL('ring'), [0.5, 0.45, 0.4], [0, 1, 0], 1);
    if (!add && h.k === 'puke') m.quad([x - s, 0.035, z - s], [x + s, 0.035, z - s], [x + s, 0.035, z + s], [x - s, 0.035, z + s], [0, 0, 1, 0, 1, 1, 0, 1], TL('splat'), [0.3, 0.4, 0.15], [0, 1, 0], 0.3);
    if (!add && h.k === 'hand' && h.delay <= 0) { var up = Math.min(1, (-h.delay) * 6); bill(m, x, 0.5 * up, z, 0.35, 0.55 * up + 0.01, TL('creamhand'), [0.32, 0.34, 0.3], 0); }
  });
}
/* the henchman's bar along the top of the screen while you fight it */
function drawHenchHud() { var f = (G.foes || []).filter(function (f) { return f.d && f.d.boss && (f.st === 'fight' || f.st === 'chase') && f.hp > 0; })[0]; if (!f || G.mode !== 'play') return;
  var W = KIT.W, w = Math.min(280, W - 60), x = (W - w) / 2, y = W < 600 ? 104 : 30, ctx = KIT.ctx, k = Math.max(0, f.hp / (f.max || f.d.hp));
  ctx.fillStyle = 'rgba(7,4,5,0.85)'; ctx.fillRect(x - 3, y - 3, w + 6, 14); ctx.fillStyle = '#4a1a1c'; ctx.fillRect(x, y, w, 8); ctx.fillStyle = f.p2 ? '#ff2630' : '#c4121c'; ctx.fillRect(x, y, w * k, 8);
  KIT.text(f.d.n.toUpperCase(), W / 2, y + 12, { size: 8, col: '#f1e7d0', align: 'center' }); }
