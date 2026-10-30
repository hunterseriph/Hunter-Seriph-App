/* =====================================================================================================
   CHAIN RACE (his idea): teams of two karts tied together by a stretchy rope of cream.
   - The rope goes slack when you are close and pulls tight when you drift apart, towing whoever is behind.
   - SLINGSHOT: when it is tight and you are the one behind, press L (the CHAIN button) and you are flung
     past your partner.
   - PASS: press L with an item and your partner gets it; press it empty-handed and you take theirs.
   - SHARED BOOST: a drift boost, a boost pad or a Cumpuccino gives your partner a share down the rope.
   - The rope is a hazard: a tight rope clotheslines any other kart that drives into it, and if it cuts across
     a corner it snags on the wall, grinds and slows you both (too long and it snaps).
   - WEAK LINKS: getting spun out by a hit usually snaps the rope for a few seconds; it clips back on by itself.
   - A team finishes when both karts are over the line; team places, team points, a Chain Grand Prix.
   Online: each machine pulls only the karts it drives; the host decides hits, snaps, item passes.
   ===================================================================================================== */
var CHAIN = { L: 7.5, MAX: 15, SNAP: 3.2, SLING: 1.15, SLINGCD: 3.5, SNAGMAX: 1.6 };
var TEAMPTS = [15, 10, 6, 3];
var CHAINPAD = { dpad: true, btns: [{ k: 'a', label: 'A', sub: 'GAS', cls: 'big' }, { k: 'x', label: 'R', sub: 'DRIFT' }, { k: 'y', label: 'Z', sub: 'ITEM', cls: 'gold' }, { k: 'b', label: 'B', sub: 'BRAKE' }, { k: 'lb', label: 'L', sub: 'CHAIN', cls: 'gold' }] };

/* called from startRace when o.chain: karts 0+1, 2+3, 4+5, 6+7 are teams */
function chainSetup(R) {
  R.chain = true; R.teams = [];
  for (var i = 0; i + 1 < R.all.length; i += 2) { var a = R.all[i], b = R.all[i + 1], t = { i: R.teams.length, a: a, b: b, snapT: 0, snagT: 0, d: 0, cd: 0 }; a.team = b.team = t; a.mate = b; b.mate = a; R.teams.push(t); }
  if (R.all.length % 2) { var lone = R.all[R.all.length - 1]; lone.team = { i: R.teams.length, a: lone, b: lone, solo: true, snapT: 0, snagT: 0, d: 0 }; R.teams.push(lone.team); }
  R.all.forEach(function (k) { k._pb = 0; k._ps = 0; k.slingCd = 0; });
}
function local(k) { return !k.remote && !k.puppet; }
function hostSide(R) { return R.net !== 'client'; }

/* weak links: a spin-out from a real hit (not a bumper or a stall) snaps the rope (four times in ten); the host decides */
var _hitKartC = hitKart;
hitKart = function (k, by, how, p) {
  var r = _hitKartC(k, by, how, p), R = RACE;
  if (r && R && R.chain && hostSide(R) && R.phase === 'go' && k.team && !k.team.solo && k.team.snapT <= 0 && (!how || how === 'spin' || how === 'toss' || how === 'pounce') && Math.random() < 0.4) { k.team.snapT = CHAIN.SNAP; k.team.snagT = 0; snapFx(R, k.team); }
  return r;
};
/* the CHAIN button, on the machine that drives the kart */
function chainPress(k) {
  var R = RACE, t = k.team, m = k.mate; if (!t || t.solo || R.phase !== 'go' || k.done) return;
  if (t.snapT > 0) { if (k === R.me) { R.chainMsg = { s: 'ROPE SNAPPED!', t: 1 }; sfx.play('back'); } return; }
  if (chainCanSling(k)) { slingshot(k); return; }
  if (hostSide(R)) chainPass(k); else netSend({ t: 'chain' });
}
function chainCanSling(k) { var t = k.team, m = k.mate; return t && !t.solo && t.snapT <= 0 && t.d > CHAIN.L * CHAIN.SLING && k.prog < m.prog && (k.slingCd || 0) <= 0 && k.spinT <= 0; }
function slingshot(k) {
  var R = RACE, m = k.mate; k.slingT = 1.1; k.slingCd = CHAIN.SLINGCD; k.spd = Math.max(k.spd, k.top * 1.05); k.drift = 0;
  if (local(m)) m.spd *= 0.86; // the front kart takes the strain
  R.fx.push({ sent: 1, k: 'pulse', team: k.team.i, from: k === k.team.a ? 0 : 1, t: 0.45 });
  if (k === R.me || m === R.me || near(k)) sfx.play('power'); if (k === R.me) { R.flash = 0.08; R.chainMsg = { s: 'SLINGSHOT!', t: 1.1 }; KIT.shake(2); }
}
/* items down the rope (the host decides items) */
function chainPass(k) {
  var R = RACE, m = k.mate; if (!m || m === k) return;
  if (k.item && !m.item && !(m.roul > 0) && !(k.roul > 0)) { m.item = k.item; m.itemN = k.itemN; k.item = null; k.itemN = 0; m.roul = 0; passFx(k, m, 'GAVE IT TO ' + m.c.n.toUpperCase(), 'GOT ' + ITEMS[m.item].n.toUpperCase() + ' FROM ' + k.c.n.toUpperCase()); }
  else if (!k.item && m.item && !(m.roul > 0) && !(k.roul > 0)) { k.item = m.item; k.itemN = m.itemN; m.item = null; m.itemN = 0; passFx(m, k, 'TOOK IT', 'TOOK ' + ITEMS[k.item].n.toUpperCase()); }
  else if (k === R.me) { R.chainMsg = { s: k.item ? 'THEIR HANDS ARE FULL' : 'NOTHING TO SWAP', t: 0.9 }; sfx.play('back'); }
}
function passFx(from, to, sFrom, sTo) {
  var R = RACE; R.fx.push({ sent: 1, k: 'pulse', team: from.team.i, from: from === from.team.a ? 0 : 1, t: 0.45, item: 1 });
  if (from === R.me) R.chainMsg = { s: sFrom, t: 1.1 }; if (to === R.me) R.chainMsg = { s: sTo, t: 1.3 };
  if (from === R.me || to === R.me) sfx.play('select');
  if (R.net === 'host') R.chainNote = (R.chainNote || []).concat([[from.idx, to.idx]]);
}

/* every frame, after the karts have moved */
function chainStep(R, dt) {
  var host = hostSide(R);
  R.all.forEach(function (k) { if (k.slingCd > 0) k.slingCd -= dt; });
  R.teams.forEach(function (t) {
    if (t.solo) return; var a = t.a, b = t.b;
    // weak links: a spin-out snaps the rope (the host decides)
    if (t.snapT > 0) { t.snapT -= dt; if (t.snapT <= 0) { t.snapT = 0; if (a === R.me || b === R.me) { sfx.play('select'); R.chainMsg = { s: 'ROPE BACK ON', t: 0.9 }; } } }
    var dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 0.001; t.d = d;
    if (t.snapT > 0 || R.phase !== 'go' && R.phase !== 'done') { a._pb = a.boostT; b._pb = b.boostT; return; }
    var nx = dx / d, nz = dz / d, wa = b.wt / (a.wt + b.wt), wb = 1 - wa;
    if (d > CHAIN.L) {
      var ex = Math.min(d - CHAIN.L, 10), corr = ex * Math.min(1, dt * 5.5);
      if (d > CHAIN.MAX) corr = d - CHAIN.MAX + corr * 0.2; // it only stretches so far
      corr = Math.min(corr, 40 * dt); // (and after a snap it reels you back in, it doesn't teleport you)
      if (local(a)) { a.x += nx * corr * wa; a.z += nz * corr * wa; }
      if (local(b)) { b.x -= nx * corr * wb; b.z -= nz * corr * wb; }
      var back = a.prog < b.prog ? a : b, front = back === a ? b : a; // tension tows the one behind and holds the one in front back
      if (local(back) && !back.done) back.spd = Math.min(back.top * 1.25, back.spd + ex * 2.6 * dt);
      if (local(front) && !front.done) front.spd -= Math.min(front.spd, ex * 1.1 * dt);
    }
    // shared boost: a fresh boost of half a second or more sends a short one down the rope
    var ga = a.boostT - (a._pb || 0), gb = b.boostT - (b._pb || 0);
    if (ga >= 0.5 && local(b) && !b.done) { b.boostT = Math.max(b.boostT, 0.45); R.fx.push({ sent: 1, k: 'pulse', team: t.i, from: 0, t: 0.4 }); if (b === R.me) sfx.play('select'); }
    if (gb >= 0.5 && local(a) && !a.done) { a.boostT = Math.max(a.boostT, 0.45); R.fx.push({ sent: 1, k: 'pulse', team: t.i, from: 1, t: 0.4 }); if (a === R.me) sfx.play('select'); }
    a._pb = a.boostT; b._pb = b.boostT;
    // snag: the rope cutting across a corner catches on the wall and grinds
    var mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, q = R.T.locate(mx, mz, a.seg); t.snag = d > CHAIN.L * 0.9 && Math.abs(q.lat) > R.T.edge + 0.4 && Math.abs(a.lat) < R.T.edge && Math.abs(b.lat) < R.T.edge && !a.floatT && !b.floatT;
    if (t.snag) {
      t.snagT += dt; [a, b].forEach(function (k) { if (local(k) && !k.done) k.spd *= Math.pow(0.55, dt); });
      var sd = Math.sign(q.lat), ex2 = mx - q.s.nx * sd * (Math.abs(q.lat) - R.T.edge), ez2 = mz - q.s.nz * sd * (Math.abs(q.lat) - R.T.edge);
      if (Math.random() < 0.5) R.fx.push({ k: 'grind', x: ex2, y: q.y + 0.6, z: ez2, t: 0.25, vx: (Math.random() - 0.5) * 6, vy: 3 + Math.random() * 3, vz: (Math.random() - 0.5) * 6 });
      if ((a === R.me || b === R.me) && !R.snagSnd) { R.snagSnd = 0.25; sfx.play('land'); }
      if (host && t.snagT > CHAIN.SNAGMAX) { t.snapT = CHAIN.SNAP; t.snagT = 0; snapFx(R, t); }
    } else t.snagT = Math.max(0, t.snagT - dt * 2);
    // clothesline: a tight rope knocks over anyone from another team who drives into it
    if (host && d > CHAIN.L * 0.8 && R.phase === 'go') R.karts.forEach(function (o) {
      if (o.team === t || o.done || o.invT > 0 || o.floatT > 0) return;
      var px = o.x - a.x, pz = o.z - a.z, s = (px * nx + pz * nz) / d; if (s < 0.12 || s > 0.88) return;
      var ox = a.x + nx * d * s, oz = a.z + nz * d * s, off = Math.hypot(o.x - ox, o.z - oz), ry = a.y + (b.y - a.y) * s;
      if (off < 0.95 && Math.abs(o.y - ry) < 1.6) { var by = a.spd > b.spd ? a : b; if (hitKart(o, by, 'spin')) { R.fx.push({ k: 'pop', x: o.x, y: o.y + 1, z: o.z, t: 0.4 }); if (by === R.me || by.mate === R.me) R.chainMsg = { s: 'CLOTHESLINED ' + o.c.n.toUpperCase() + '!', t: 1.3 }; } }
    });
  });
  if (R.snagSnd > 0) R.snagSnd -= dt;
  if (R.chainMsg) { R.chainMsg.t -= dt; if (R.chainMsg.t <= 0) R.chainMsg = null; }
  // the AI: slingshots when it can, and now and then hands its item to a human partner who has none
  if (host) R.karts.forEach(function (k) {
    if (!k.ai || k.done || !k.team || k.team.solo) return;
    if (chainCanSling(k) && Math.random() < dt * 0.9) slingshot(k);
    var m = k.mate; if (!m.ai && k.item && !m.item && !(m.roul > 0) && !(k.roul > 0) && k.itemT > 0.3 && Math.random() < dt * 0.12) chainPass(k);
  });
}
function snapFx(R, t) {
  var a = t.a, b = t.b; R.fx.push({ k: 'pop', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 0.6, z: (a.z + b.z) / 2, t: 0.5, col: '#f1e7d0' });
  if (a === R.me || b === R.me) { sfx.play('splat'); R.chainMsg = { s: 'ROPE SNAPPED!', t: 1.2 }; }
}
/* team places: a team is as far on as its slower kart; finished teams by the later of their two times */
function chainPlaces(R) {
  var ts = R.teams.slice();
  function done(t) { return t.a.done && t.b.done; }
  function tm(t) { return Math.max(t.a.time, t.b.time); }
  function pr(t) { return Math.min(t.a.prog, t.b.prog); }
  ts.sort(function (p, q) { if (done(p) && done(q)) return tm(p) - tm(q); if (done(p)) return -1; if (done(q)) return 1; return pr(q) - pr(p); });
  ts.forEach(function (t, i) { t.place = i + 1; });
}
/* the race only finishes for you when your partner is over the line too */
function chainFinished(R, k) { var m = k.mate; return !m || m === k || m.done; }

/* ---------- drawing: the rope of cream ---------- */
var CREAM = [0.47, 0.45, 0.4], CREAMHOT = [0.55, 0.42, 0.3];
function drawChains(R, m, soft, glow, A) {
  var cr = R3.cam.right;
  R.teams.forEach(function (t) {
    if (t.solo) return; var a = t.a, b = t.b, ya = a.y + (a.floatY || 0) + 0.55, yb = b.y + (b.floatY || 0) + 0.55, dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 0.001, nx = dx / d, nz = dz / d;
    if (Math.abs(a.x - R3.cam.eye[0]) + Math.abs(a.z - R3.cam.eye[2]) > 220) return;
    var ax = a.x + nx * 0.9, az = a.z + nz * 0.9, bx = b.x - nx * 0.9, bz = b.z - nz * 0.9, len = Math.max(0.1, d - 1.8);
    if (t.snapT > 0) { // two dripping ends dragged behind
      rope(m, [[ax, ya, az], [ax + nx * 1.4, ya - 0.3, az + nz * 1.4], [ax + nx * 2.6, a.y + 0.12, az + nz * 2.6]], CREAM, 0.13);
      rope(m, [[bx, yb, bz], [bx - nx * 1.4, yb - 0.3, bz - nz * 1.4], [bx - nx * 2.6, b.y + 0.12, bz - nz * 2.6]], CREAM, 0.13);
      return;
    }
    var slack = Math.max(0, CHAIN.L - d) / CHAIN.L, tight = clamp((d - CHAIN.L) / 4, 0, 1), pts = [], n = 10;
    for (var i = 0; i <= n; i++) {
      var s = i / n, x = ax + (bx - ax) * s, z = az + (bz - az) * s, y = ya + (yb - ya) * s - (0.15 + slack * 1.6) * 4 * s * (1 - s) + Math.sin(R.t * 9 + s * 6 + t.i) * 0.04 * (1 - tight);
      var g = R.T.locate(x, z, a.seg).y + 0.1; if (y < g) y = g; pts.push([x, y, z]);
    }
    var col = [CREAM[0] + (CREAMHOT[0] - CREAM[0]) * tight, CREAM[1] + (CREAMHOT[1] - CREAM[1]) * tight, CREAM[2] + (CREAMHOT[2] - CREAM[2]) * tight];
    rope(m, pts, col, 0.19 - tight * 0.06);
    if (t.snag) spark(glow, A, (ax + bx) / 2, (ya + yb) / 2, (az + bz) / 2, 0.6, 'halo', [0.6, 0.4, 0.15]);
    if (Math.random() < 0.08 * (1 - tight) + 0.02) { var k = 2 + Math.floor(Math.random() * 7), p = pts[k]; R.fx.push({ k: 'drip', x: p[0], y: p[1] - 0.1, z: p[2], t: 0.5, vx: 0, vy: -1, vz: 0, sent: 1 }); }
    // a glowing blob running down the rope when something is sent along it
    R.fx.forEach(function (f) { if (f.k !== 'pulse' || f.team !== t.i) return; var s = 1 - f.t / 0.45; if (f.from) s = 1 - s; var p = pts[Math.max(0, Math.min(n, Math.round(s * n)))]; spark(glow, A, p[0], p[1], p[2], f.item ? 0.7 : 0.55, 'halo', f.item ? [0.6, 0.5, 0.15] : [0.55, 0.5, 0.4]); });
  });
}
function rope(m, pts, col, w) { // a camera-facing strip with a darker underside, so it reads as round
  var tile = RACE.A.tile('white'), f = R3.cam.fwd;
  for (var i = 0; i + 1 < pts.length; i++) {
    var p = pts[i], q = pts[i + 1], sx = q[0] - p[0], sy = q[1] - p[1], sz = q[2] - p[2];
    var ox = sy * f[2] - sz * f[1], oy = sz * f[0] - sx * f[2], oz = sx * f[1] - sy * f[0], ol = Math.hypot(ox, oy, oz) || 1; ox *= w / ol; oy *= w / ol; oz *= w / ol;
    m.quad([p[0] - ox, p[1] - oy, p[2] - oz], [q[0] - ox, q[1] - oy, q[2] - oz], [q[0], q[1], q[2]], [p[0], p[1], p[2]], [0, 0, 1, 0, 1, 1, 0, 1], tile, mulc(col, 0.72));
    m.quad([p[0], p[1], p[2]], [q[0], q[1], q[2]], [q[0] + ox, q[1] + oy, q[2] + oz], [p[0] + ox, p[1] + oy, p[2] + oz], [0, 0, 1, 0, 1, 1, 0, 1], tile, col);
  }
}
function drawChainFx(R, soft, A) { R.fx.forEach(function (f) { if (f.k === 'drip') spark(soft, A, f.x, f.y, f.z, 0.09, 'puff', [0.6, 0.58, 0.52]); else if (f.k === 'grind') spark(soft, A, f.x, f.y, f.z, 0.08, 'halo', [0.7, 0.55, 0.25]); }); }

/* ---------- the HUD ---------- */
function fitSpr(n, cx, by, size) { var f = KIT.SPR[n]; if (!f) return; spr(n, cx, by, { sc: size / Math.max(f[2], f[3]) }); }
function chainHud(R) {
  var k = R.me, t = k.team; if (!t || t.solo) return; var m = k.mate, ctx = KIT.ctx;
  // partner card under the item box: their face, their item, and the rope
  var x = 8, y = 46; KIT.panel(x, y, 88, 30, { edge: t.snapT > 0 ? '#ff2630' : '#4a1a1c' });
  fitSpr(m.c.f, x + 15, y + 28, 24);
  text(m.tag && !m.ai ? m.tag.toUpperCase().slice(0, 8) : m.c.n.toUpperCase().replace(/^(THE|UNCLE|SIR|KING) /, '').split(' ')[0].slice(0, 8), x + 30, y + 5, { size: 6, col: '#f1e7d0' });
  if (m.roul > 0) text('?', x + 76, y + 9, { size: 8, col: '#ffe36a', align: 'center' }); else if (m.item) fitSpr(ITEMS[m.item].ic, x + 76, y + 26, 18); else text('-', x + 76, y + 9, { size: 8, col: '#a6968f', align: 'center' });
  var ten = clamp((t.d - CHAIN.L * 0.5) / (CHAIN.MAX - CHAIN.L * 0.5), 0, 1);
  ctx.fillStyle = '#12040a'; ctx.fillRect(x + 30, y + 17, 32, 5); ctx.fillStyle = t.snapT > 0 ? '#4a1a1c' : ten > 0.6 ? '#ff2630' : '#f1e7d0'; ctx.fillRect(x + 30, y + 17, t.snapT > 0 ? 32 * (1 - t.snapT / CHAIN.SNAP) : 32 * ten, 5);
  text(t.snapT > 0 ? 'SNAPPED' : 'ROPE', x + 30, y + 24, { size: 5, col: t.snapT > 0 ? '#ff2630' : '#a6968f' });
  if (chainCanSling(k) && Math.floor(R.t * 4) % 2) text('L: SLINGSHOT!', KIT.W / 2, 86, { size: 8, align: 'center', col: '#ffe36a', outline: true });
  if (R.chainMsg) text(R.chainMsg.s, KIT.W / 2, 72, { size: 10, align: 'center', col: '#ffe36a', outline: true, alpha: Math.min(1, R.chainMsg.t * 3) });
}

/* ---------- menus, results and the Chain Grand Prix ---------- */
function chainRoster(me, mate) {
  if (!mate || mate === me || !CH[mate]) mate = SV.mate = CHARS.filter(function (c) { return c.id !== me && charOpen(c.id); })[0].id;
  var rest = rivalsFor(me).filter(function (c) { return c !== mate; });
  return [me, mate].concat(rest.slice(0, 6));
}
function chainMenu() {
  var back = function () { titleMenu('single'); };
  screen({ title: 'Chain Race', back: back, redo: chainMenu,
    html: '<div class="ckg" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));max-width:560px;margin:0 auto">' +
      '<button type="button" class="ckbtn ckc" data-act="race" data-pad-default><b>Single Race</b></button>' +
      '<button type="button" class="ckbtn ckc" data-act="gp"><b>Grand Prix</b></button></div>',
    acts: {
      race: function flow() { function mate() { pickMate(co, function () { pickChar(mate, flow); }); } function co() { pickCourse(beginChain, mate); } pickClass(function () { pickChar(mate, flow); }, chainMenu); },
      gp: function flow2() { function mate() { pickMate(cup, function () { pickChar(mate, flow2); }); } function cup() { pickCup(beginChainGP, mate); } pickClass(function () { pickChar(mate, flow2); }, chainMenu); }
    } });
}
var CHAINHELP = '<b>L</b> (LB on a pad, Q on a keyboard) is the CHAIN button. When the rope is tight and you are behind, it <b>slingshots</b> you past your partner. Otherwise it <b>passes</b> your item to them, or takes theirs if you have none.<br>Drift boosts and boost pads send your partner a <b>shared boost</b> down the rope.<br>A tight rope <b>clotheslines</b> anyone who drives into it. Cut a corner and it <b>snags</b> on the wall. Spin out and it <b>snaps</b> for a few seconds.<br>Your team finishes when you are both over the line.';
function pickMate(next, back) {
  var me = SV.ch, keep = SV.ch; if (!SV.mate || SV.mate === me || !charOpen(SV.mate)) SV.mate = CHARS.filter(function (c) { return c.id !== me && charOpen(c.id); })[0].id;
  SV.ch = SV.mate; pickChar.title = 'Who is your partner?';
  pickChar(function () { pickChar.title = null; var m = SV.ch; SV.ch = keep; if (m === keep) { SV.ch = keep; pickMate(next, back); return; } SV.mate = m; persist(); next(); }, function () { pickChar.title = null; SV.ch = keep; back(); });
}
function beginChain(course) { GP = null; go({ course: course, cls: SV.cls, player: SV.ch, rivals: chainRoster(SV.ch, SV.mate).slice(1), mode: 'race', chain: true }); }
function beginChainGP(cup) {
  var r = chainRoster(SV.ch, SV.mate), roster = typeof mpRoster === 'function' ? mpRoster(SV.ch, r.slice(1), 8) : null;
  if (!roster) roster = { ch: r, names: [], humans: [0] };
  GP = { chain: true, cup: cup, cls: SV.cls, roster: roster.ch, names: roster.names, humans: roster.humans, n: 0, pts: roster.ch.map(function () { return 0; }), grid: null }; gpRace();
}
function teamRows(R) {
  return R.teams.slice().sort(function (p, q) { return p.place - q.place; }).map(function (t) {
    var mine = t === R.me.team, pts = GP && GP.chain ? TEAMPTS[t.place - 1] || 0 : null;
    if (GP && GP.chain) { GP.pts[t.a.idx] += pts; if (!t.solo) GP.pts[t.b.idx] += pts; }
    return { place: t.place, a: t.a, b: t.solo ? null : t.b, me: mine, time: fmtTime(Math.max(t.a.time, t.b.time)), pts: pts !== null ? '+' + pts : null };
  });
}
function teamRowsHtml(rows) {
  function nm(k) { var R = RACE; return k === R.me ? meName() : !k.ai && k.tag ? k.tag : CH[k.ch].n; }
  return '<div class="ckres">' + rows.map(function (r) {
    return '<div class="ckr' + (r.me ? ' me' : '') + '" style="grid-template-columns:auto 40px 40px 1fr auto auto"><span class="pl">' + r.place + '</span>' + pic(r.a.ch, 40) + (r.b ? pic(r.b.ch, 40) : '<span></span>') + '<span class="nm">' + esc(nm(r.a)) + (r.b ? ' &amp; ' + esc(nm(r.b)) : '') + '<small>TEAM ' + (r.a.team.i + 1) + '</small></span><span class="tm">' + r.time + '</span><span class="pt">' + (r.pts || '') + '</span></div>';
  }).join('') + '</div>';
}
function chainEnd(R) {
  chainPlaces(R); var rows = teamRows(R), html = teamRowsHtml(rows), tp = R.me.team.place;
  var wire = rows.map(function (r) { return { place: r.place, a: r.a.idx, b: r.b ? r.b.idx : -1, time: r.time, pts: r.pts }; });
  if (GP) {
    if (R.net === 'host') netBroadcast({ t: 'end', kind: 'chain', title: R.def.n, sub: 'Race ' + (GP.n + 1) + ' of 4', teams: wire, names: R.all.map(function (k) { return [k.ch, k.ai ? null : k.tag]; }) });
    GP.grid = R.teams.slice().sort(function (p, q) { return p.place - q.place; }).reduce(function (g, t) { g.push(R.all.indexOf(t.a)); if (!t.solo) g.push(R.all.indexOf(t.b)); return g; }, []).reverse(); GP.n++;
    screen({ cls: 'solid', title: R.def.n, sub: 'Race ' + GP.n + ' of 4  ·  your team came ' + ordinal(tp), html: html + '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="next" data-pad-default>' + (GP.n < 4 ? 'STANDINGS' : 'FINAL STANDINGS') + '</button></div>', acts: { next: chainStandings }, foot: false });
  } else {
    if (R.net === 'host') netBroadcast({ t: 'end', kind: 'chain', title: R.def.n, sub: 'Chain race', teams: wire, names: R.all.map(function (k) { return [k.ch, k.ai ? null : k.tag]; }) });
    screen({ cls: 'solid', title: R.def.n, sub: 'Your team came ' + ordinal(tp), back: function () { RACE = null; titleMenu(); },
      html: html + '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="again" data-pad-default>RACE AGAIN</button><button type="button" class="ckbtn" data-act="other">ANOTHER COURSE</button><button type="button" class="ckbtn" data-act="title">TITLE</button></div>',
      acts: { again: function () { beginChain(R.o.course); }, other: function () { pickCourse(beginChain, function () { RACE = null; titleMenu(); }); }, title: function () { RACE = null; titleMenu(); } }, foot: false });
  }
}
function chainStandings() {
  var n = GP.roster.length, teams = []; for (var i = 0; i < n; i += 2) teams.push({ a: i, b: i + 1 < n ? i + 1 : -1, pts: GP.pts[i] });
  teams.sort(function (p, q) { return q.pts - p.pts || p.a - q.a; }); var place = teams.findIndex(function (t) { return t.a === 0; }) + 1;
  function nm(i) { return i === 0 ? meName() : GP.names[i] || CH[GP.roster[i]].n; }
  var html = '<div class="ckres">' + teams.map(function (t, j) { return '<div class="ckr' + (t.a === 0 ? ' me' : '') + '" style="grid-template-columns:auto 40px 40px 1fr auto"><span class="pl">' + (j + 1) + '</span>' + pic(GP.roster[t.a], 40) + (t.b >= 0 ? pic(GP.roster[t.b], 40) : '<span></span>') + '<span class="nm">' + esc(nm(t.a)) + (t.b >= 0 ? ' &amp; ' + esc(nm(t.b)) : '') + '</span><span class="pt">' + t.pts + ' PTS</span></div>'; }).join('') + '</div>';
  if (NET.role === 'host') netBroadcast({ t: 'end', kind: 'chainst', title: GP.n < 4 ? 'Team standings' : 'Final team standings', sub: GP.cup.n, html: html.replace(' me"', '"') });
  if (GP.n < 4) {
    screen({ cls: 'solid', title: 'Team standings', sub: esc(GP.cup.n) + '  ·  next: ' + esc(COURSES[GP.cup.courses[GP.n]].n), html: html + '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="next" data-pad-default>NEXT RACE</button><button type="button" class="ckbtn" data-act="quit">QUIT THE CUP</button></div>', acts: { next: gpRace, quit: function () { RACE = null; titleMenu(); } }, foot: false });
    return;
  }
  var key = 'chain_' + GP.cup.id + '_' + GP.cls, prev = SV.cups[key]; if (!prev || place < prev) SV.cups[key] = place; persist();
  var tro = place === 1 ? 'ck_gold' : place === 2 ? 'ck_silver' : place === 3 ? 'ck_bronze' : null; music.play(place <= 3 ? 'ck_win' : 'ck_results');
  screen({ cls: 'solid', title: place === 1 ? 'Your team wins the ' + GP.cup.n : 'Your team finishes ' + ordinal(place), sub: clsName(GP.cls) + ' class  ·  Chain Grand Prix',
    html: (tro ? '<div style="text-align:center"><img src="' + portrait(tro, 96, '#0e0708') + '" width="96" height="96" style="image-rendering:pixelated" alt=""></div>' : '') + html + '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="t" data-pad-default>BACK TO THE TITLE</button></div>',
    acts: { t: function () { RACE = null; GP = null; titleMenu(); } }, foot: false });
}
/* a guest's copy of the team results */
function chainClientEnd(m) {
  var me = NET.meIdx, h;
  if (m.kind === 'chainst') h = m.html;
  else h = '<div class="ckres">' + m.teams.map(function (r) {
    var mine = r.a === me || r.b === me, nm = function (i) { if (i < 0) return ''; var n = m.names[i]; return i === me ? meName() : (n[1] || CH[n[0]].n); };
    return '<div class="ckr' + (mine ? ' me' : '') + '" style="grid-template-columns:auto 40px 40px 1fr auto auto"><span class="pl">' + r.place + '</span>' + pic(m.names[r.a][0], 40) + (r.b >= 0 ? pic(m.names[r.b][0], 40) : '<span></span>') + '<span class="nm">' + esc(nm(r.a)) + (r.b >= 0 ? ' &amp; ' + esc(nm(r.b)) : '') + '</span><span class="tm">' + r.time + '</span><span class="pt">' + (r.pts || '') + '</span></div>';
  }).join('') + '</div>';
  screen({ cls: 'solid', title: m.title || 'Results', sub: m.sub || '', foot: false,
    html: h + '<div class="ckmsg" style="margin-top:12px;font-size:18px">Waiting for the host…</div><div class="ckacts" style="margin-top:10px"><button type="button" class="ckbtn" data-act="leave" data-pad-default>LEAVE THE ROOM</button></div>',
    acts: { leave: function () { netLeave(); RACE = null; mpMenu(); } } });
}
