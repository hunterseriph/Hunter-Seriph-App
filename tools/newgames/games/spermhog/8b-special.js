/* =====================================================================================================
   SPECIAL STAGES and the seven CUM CHALICES: Sonic 3 & Knuckles' Blue Sphere, done properly (his ask). A gothic
   gateway hides on a side route in every act (not a ring: he said it looked too much like Sonic); walk in with 50
   drops. Cumhead runs on his own across a gently curved checkered world. LEFT / RIGHT = one turn per press, made at
   the next square; A jumps two squares. Every cream sphere you run over turns RED behind you, so you cannot cross
   your own path; run round the edge of a group of cream spheres and the whole group and its loop turn into drops.
   Clear every cream sphere for the chalice; touch red and you are out. Bumpers knock you backwards (UP to run
   forwards again), gold springs throw you over four squares. It speeds up every 30 seconds.
   ===================================================================================================== */
var SS = null, SSN = 32;
var CHALNAME = ['THE BLOOD CHALICE', 'THE GOLD CHALICE', 'THE CREAM CHALICE', 'THE VOID CHALICE', 'THE TEAR CHALICE', 'THE ROT CHALICE', 'THE BLACK CHALICE'];
var CHALCOL = ['#ff2630', '#ffc840', '#f1e0b0', '#a040e0', '#3a8ac8', '#30c060', '#6a6070'];
var SSDIR = [[0, -1], [1, 0], [0, 1], [-1, 0]];
/* SEVEN WORLDS, drawn by hand like Sonic 3's (his ask: lots more red spheres that lead you on a path, not things all
   over the place). Each is one quarter, 16 x 16, mirrored left-right and top-bottom into the 32 x 32 world, so it is
   symmetric like the real ones. Cumhead starts in the middle facing up.
   b cream sphere, r red sphere, y gold spring, u bumper, o drop, . floor */
var SSQ = [ // seven worlds made like Sonic 3's: a handful of shapes to run round, red to steer you. He said 300 cream spheres was silly: 64 to about 128 now, rising each world
  [ // THE BLOOD CHALICE (64): a block to run round, a row up the middle to start, a few to pick off
    '................', '................', '...bbb..........', '...bbb....rr....', '...bbb....rr....', '................', '........o.......', '.......ooo......', '......bbb.o.....', '................', '................', '...............b', '...............b', '...............b', '...............b', '................'],
  [ // THE GOLD CHALICE (80): a long row, red rails, two blocks, a bumper and a spring
    '................', '.bbbbbb.........', '................', '.rrrr....rrrr...', '................', '...bbb..........', '...bbb....u.....', '................', '..bbbb....y.....', '................', '.r.r.r.r........', '...............b', '...............b', '....oooo.......b', '...............b', '................'],
  [ // THE CREAM CHALICE (92): a diamond, red steps, a block, a cross of drops
    '................', '....b...........', '...bbb..........', '..bbbbb...rr....', '...bbb.....rr...', '....b.......rr..', '................', '.rr......o......', '........ooo.....', '...bbb...o......', '...bbb..........', '...............b', '...............b', '...............b', '...............b', '................'],
  [ // THE VOID CHALICE (104): a red keep wall with a gap, rows and a block, bumpers and a spring
    'rrrrrrrrrrrrrr..', 'r...............', 'r..bbbbbbbb.....', 'r...............', 'r.rrrrr..rrrrr..', 'r...............', 'r..bbbb.....u...', 'r..bbbb.........', 'r...............', 'r.....y.........', 'r..bbbbbb..ooo..', 'r..............b', 'r..u...........b', 'r..............b', 'r..............b', 'r...............'],
  [ // THE TEAR CHALICE (108): a red room with a door, a block, a slab and a nest of drops
    '................', '.rrrrrr.........', '.r....r..bbbb...', '.r.bb.r..bbbb...', '.r.bb.r.........', '.r....r.....u...', '.rrr.rr.........', '................', '...........ooo..', '...bbbbb...o....', '...bbbbb.......b', '...............b', '...............b', '...............b', '...............b', '................'],
  [ // THE ROT CHALICE (128): bumpers, two blocks behind red fences, a wide slab, a spring
    '................', '..u.....u.......', '................', '.bbbb..bbbb.....', '.bbbb..bbbb.....', '................', '.rrrr..rrrr.....', '...............b', '...y...........b', '...............b', '..bbbbbb.......b', '..bbbbbb........', '................', '...ooo....u.....', '................', '................'],
  [ // THE BLACK CHALICE (120): red fence posts, a block, a red box with a door and a drop inside, a long row, bumpers
    'r.r.r.r.r.r.r.r.', '................', 'r.bbbb..........', '..bbbb...rrrr...', 'r.bbbb...r..r...', '.........r.or...', 'r........rr.r...', '...............b', 'r..y...........b', '..bbbbbbbbb....b', 'r...............', '..u.......u.....', 'r.....bbbb......', '...............b', 'r..............b', '................']];
/* each world has its own floor (light square, dark square) and sky, like each Blue Sphere stage */
var SSFLOOR = [['#6a2a7a', '#1e0a26'], ['#a8701a', '#2a1806'], ['#2a7a8a', '#0a2028'], ['#7a3a9a', '#1a0a26'], ['#2a6aaa', '#081a30'], ['#2a8a40', '#0a2410'], ['#6a6a7a', '#141418']];
var SSSKY = [['#0a0410', '#1e0a2a'], ['#100804', '#2a1806'], ['#040c10', '#0a2a30'], ['#08040e', '#24103a'], ['#040810', '#0e2440'], ['#040a06', '#0e2a14'], ['#050506', '#1e1e26']];
function ssWorld(lv) {
  var q = SSQ[Math.min(6, lv)], m = [], nb = 0;
  for (var y = 0; y < SSN; y++) { m.push([]); var qy = y < 16 ? y : 31 - y; for (var x = 0; x < SSN; x++) { var qx = x < 16 ? x : 31 - x, ch = q[qy].charAt(qx) || '.'; m[y].push(ch); if (ch === 'b') nb++; } }
  return { m: m, nb: nb };
}
function ssAt(S, x, y) { return S.m[((y % SSN) + SSN) % SSN][((x % SSN) + SSN) % SSN]; }
function ssPut(S, x, y, ch) { S.m[((y % SSN) + SSN) % SSN][((x % SSN) + SSN) % SSN] = ch; }
function startSpecial(portal) {
  var lv = 0; while (SV.chal[lv] && lv < 6) lv++;
  var w = ssWorld(lv);
  SS = { lv: lv, m: w.m, left: w.nb, total: w.nb, x: 16, y: 16, p: 0, d: 0, rev: false, cam: 0, spd: 3.0 + lv * 0.12, t: 0, drops: 0, state: 'in', st: 0, turn: 0, air: 0, airT: 0, portal: portal, anim: 0, flash: 0 };
  G.ssBack = { mode: G.mode }; G.mode = 'special'; G.super = 0; music.play('hogspecial'); sfx.play('warp'); KIT.closeMenu && KIT.menuOpen() && KIT.closeMenu();
}
/* a sphere just turned red behind him: if it closed a loop round a group of cream spheres, the group and its loop
   become drops (Blue Sphere's rings). The loop has to be his own trail, all the way round, corners too */
function ssLoop(S, px, py) {
  var got = 0, seen = {};
  for (var k = 0; k < 8; k++) {
    var sx = px + [0, 1, 1, 1, 0, -1, -1, -1][k], sy = py + [-1, -1, 0, 1, 1, 1, 0, -1][k];
    if (ssAt(S, sx, sy) !== 'b' || seen[((sy + SSN) % SSN) * SSN + ((sx + SSN) % SSN)]) continue;
    var reg = [], st = [[sx, sy]], mark = {}, leak = false;
    while (st.length && !leak) { var c = st.pop(), cx = ((c[0] % SSN) + SSN) % SSN, cy = ((c[1] % SSN) + SSN) % SSN, key = cy * SSN + cx; if (mark[key]) continue; mark[key] = 1; seen[key] = 1; reg.push([cx, cy]); if (reg.length > 120) { leak = true; break; }
      for (var j = 0; j < 8; j++) { var nx = cx + [0, 1, 1, 1, 0, -1, -1, -1][j], ny = cy + [-1, -1, 0, 1, 1, 1, 0, -1][j], ch = ssAt(S, nx, ny); if (ch === 'b') { if (j % 2 === 0) st.push([nx, ny]); else if (!mark[(((ny % SSN) + SSN) % SSN) * SSN + (((nx % SSN) + SSN) % SSN)]) st.push([nx, ny]); } else if (ch !== 'R') leak = true; } }
    if (leak) continue;
    reg.forEach(function (c) { for (var j = 0; j < 8; j++) { var nx = c[0] + [0, 1, 1, 1, 0, -1, -1, -1][j], ny = c[1] + [-1, -1, 0, 1, 1, 1, 0, -1][j]; if (ssAt(S, nx, ny) === 'R') ssPut(S, nx, ny, 'o'); } ssPut(S, c[0], c[1], 'o'); });
    S.left -= reg.length; got += reg.length;
  }
  if (got) { S.flash = 0.5; sfx.play('chalice'); G.score += got * 50; }
}
function ssArrive(S) {
  var ch = ssAt(S, S.x, S.y);
  if (ch === 'r' || ch === 'R') { S.state = 'fail'; S.st = 0; sfx.play('die'); music.play('hogclear'); return; }
  if (ch === 'b') { ssPut(S, S.x, S.y, 'R'); S.left--; sfx.play('drop'); G.score += 10; ssLoop(S, S.x, S.y); if (S.left <= 0) { S.state = 'win'; S.st = 0; SV.chal[S.lv] = 1; persist(); sfx.play('chalice'); music.stop(0.2); } return; }
  if (ch === 'o') { ssPut(S, S.x, S.y, '.'); S.drops++; G.drops++; sfx.play('drop'); if (S.drops === 50) { G.lives++; sfx.play('life'); } return; }
  if (ch === 'u') { S.rev = !S.rev; sfx.play('bump'); return; } // knocked back: he runs backwards until you press up
  if (ch === 'y') { S.air = S.airT = 4.2 / S.spd; sfx.play('spring'); }
}
function stepSpecial(dt) {
  var S = SS; S.t += dt; S.st += dt; if (S.flash > 0) S.flash -= dt;
  if (S.state === 'in') { if (S.st > 1.4) { S.state = 'play'; S.st = 0; } return; }
  if (S.state === 'win' || S.state === 'fail') { if (S.st > 4 || (S.st > 1.2 && (KIT.pressed('a') || KIT.pressed('start')))) endSpecial(); return; }
  // ONE turn per press, made at the next square (holding a direction no longer turns him again and again)
  if (KIT.pressed('left')) S.turn = -1; else if (KIT.pressed('right')) S.turn = 1;
  if (S.rev && KIT.pressed('up')) { var D0 = SSDIR[S.d]; S.x -= D0[0]; S.y -= D0[1]; S.p = 1 - S.p; S.rev = false; }
  if (KIT.pressed('a') && S.air <= 0) { S.air = S.airT = 1.9 / S.spd; sfx.play('jump'); }
  var lvUp = Math.floor(S.t / 15); if (lvUp > (S.lvUp || 0)) { S.lvUp = lvUp; S.fast = 1.4; sfx.play('dash'); } if (S.fast > 0) S.fast -= dt; // faster every 15 seconds (he said it needed to speed up)
  var spd = S.spd = Math.min(7, 3.2 + S.lv * 0.15 + lvUp * 0.5); S.anim += spd * dt;
  S.p += spd * dt;
  if (S.air > 0) { S.air -= dt; if (S.air <= 0) S.air = 0; }
  while (S.p >= 1 && S.state === 'play') {
    S.p -= 1; var D = SSDIR[S.d], m = S.rev ? -1 : 1; S.x = (S.x + D[0] * m + SSN) % SSN; S.y = (S.y + D[1] * m + SSN) % SSN;
    if (S.air <= 0) ssArrive(S);
    if (S.turn && S.air <= 0 && S.state === 'play') { S.d = (S.d + (S.turn > 0 ? 1 : 3)) % 4; S.turn = 0; }
  }
  // the view turns smoothly to his new way
  var want = S.d * Math.PI / 2; while (want - S.cam > Math.PI) want -= Math.PI * 2; while (S.cam - want > Math.PI) want += Math.PI * 2;
  S.cam += (want - S.cam) * Math.min(1, dt * 12);
}
/* drawing: a real little planet, like Blue Sphere. Every square, sphere and drop goes through ONE projection (ssP), so
   nothing slides about: the squares are laid on a ball of radius SSR, the camera sits behind and above Cumhead, and the
   far side and the sides both curve away over the horizon */
var SSR = 20, SSCH = 4.8, SSCD = 3.6, SSPITCH = 0.55; // a gentle planet (he said the first was far too curved), camera up behind him, horizon a third of the way down like Blue Sphere
var SSK0 = (function () { var vy0 = -SSCH, vz0 = SSCD, cp = Math.cos(SSPITCH), sp = Math.sin(SSPITCH); return { k: (vy0 * cp + vz0 * sp) / (vz0 * cp - vy0 * sp), s: 1 / (vz0 * cp - vy0 * sp) }; })(); // where his feet land on screen
function ssP(l, f, up, W, H) { // l: squares to his right, f: squares ahead, up: height above the ground (squares)
  var al = l / SSR, af = f / SSR, ca = Math.cos(al), r = SSR + (up || 0);
  var nx = Math.sin(al), ny = ca * Math.cos(af), nz = ca * Math.sin(af); // the ground's normal there (also its direction from the centre)
  var x = nx * r, y = ny * r - SSR, z = nz * r; // Cumhead stands at (0,0,0) on top
  var vx = x, vy0 = y - SSCH, vz0 = z + SSCD, cp = Math.cos(SSPITCH), sp = Math.sin(SSPITCH), vz = vz0 * cp - vy0 * sp, vy = vy0 * cp + vz0 * sp; // from the camera, tipped down
  if (vz < 0.25) return null;
  var bx = nx * SSR, by = ny * SSR - SSR, bz = nz * SSR; if (nx * (-bx) + ny * (SSCH - by) + nz * (-SSCD - bz) < 0) return null; // round the back of the ball: hidden
  var F = Math.min(W * 0.16, H * 0.285) / SSK0.s; // a touch further out than 108 (he asked) // a square under his feet is about a sixth of the screen wide (he said they were small)
  return { x: W / 2 + vx * F / vz, y: H * 0.8 - (vy / vz - SSK0.k) * F, s: F / vz, d: vz };
}
function drawSpecial() {
  var g = KIT.ctx, W = KIT.W, H = KIT.H, S = SS, cam = S.cam, ca = Math.cos(cam), sa = Math.sin(cam);
  // sky: hard bands of red night; the stars and the moon turn with him
  var SK = SSSKY[S.lv] || SSSKY[0], bands = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return mixHex(SK[0], SK[1], i / 6); });
  for (var b = 0; b < bands.length; b++) R(bands[b], 0, b * H * 0.08, W, H * 0.08 + 1);
  R(bands[6], 0, H * 0.56, W, H * 0.44);
  for (var i = 0; i < 46; i++) { var sx = ((i * 97 - cam * 160) % W + W) % W; R(i % 5 ? '#6a3a40' : '#f1e7d0', sx, (i * 37) % (H * 0.42), 1, 1); }
  var mx = ((W * 0.75 - cam * 160) % (W + 120) + W + 120) % (W + 120) - 60; g.fillStyle = '#c4121c'; g.beginPath(); g.arc(mx, H * 0.16, 16, 0, 6.3); g.fill(); g.fillStyle = '#ff2630'; g.beginPath(); g.arc(mx - 3, H * 0.16 - 3, 11, 0, 6.3); g.fill();
  var DD = SSDIR[S.d], mv = S.rev ? -1 : 1, px = S.x + DD[0] * mv * S.p, py = S.y + DD[1] * mv * S.p, tiles = [], things = [];
  function local(wx, wy) { var dx = wx - px, dy = wy - py; return { l: dx * ca + dy * sa, f: dx * sa - dy * ca }; } // f: ahead along the way he faces
  var N = 16;
  for (var ty = Math.floor(py) - N; ty <= Math.floor(py) + N + 1; ty++) for (var tx = Math.floor(px) - N; tx <= Math.floor(px) + N + 1; tx++) {
    var cc = local(tx, ty); if (cc.f < -3.2 || Math.abs(cc.l) > 13 || cc.f > 17) continue;
    var cs = [local(tx, ty), local(tx + 1, ty), local(tx + 1, ty + 1), local(tx, ty + 1)].map(function (c) { return ssP(c.l, c.f, 0, W, H); });
    if (cs.some(function (p) { return !p; })) continue;
    var d = cs[0].d + cs[1].d + cs[2].d + cs[3].d, far = Math.min(1, Math.max(0, (Math.hypot(cc.l, cc.f) - 3) / 13));
    tiles.push({ d: d, q: cs, dark: ((tx + ty) % 2 + 2) % 2, far: far });
    var ch = ssAt(S, tx, ty); if (ch !== '.') things.push({ ch: ch, l: cc.l, f: cc.f, far: far });
  }
  tiles.sort(function (a, b) { return b.d - a.d; });
  var FL = SSFLOOR[S.lv] || SSFLOOR[0], LIGHT = [0, 0.18, 0.36, 0.54].map(function (k) { return shadeHex(FL[0], k); }), DARK = [0, 0.18, 0.36, 0.54].map(function (k) { return shadeHex(FL[1], k); });
  tiles.forEach(function (t) { var q = t.q, k = Math.min(3, Math.floor(t.far * 4)); g.fillStyle = t.dark ? DARK[k] : LIGHT[k]; g.beginPath(); g.moveTo(q[0].x, q[0].y); for (var n = 1; n < 4; n++) g.lineTo(q[n].x, q[n].y); g.closePath(); g.fill(); });
  // spheres, bumpers, springs and drops, each standing on its own square, far ones first
  things.forEach(function (o) { o.p = ssP(o.l, o.f, 0, W, H); }); things = things.filter(function (o) { return o.p; }).sort(function (a, b) { return b.p.d - a.p.d; });
  function drawThing(o) {
    var ch = o.ch, base = o.p;
    var rr = ch === 'o' ? 0.11 : 0.16, /* smaller next to the squares, as in Sonic 3 */ P = ssP(o.l, o.f, rr, W, H); if (!P) return; var r = Math.max(1.5, rr * P.s);
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(base.x, base.y, r * 0.95, r * 0.32, 0, 0, 6.3); g.fill(); // its shadow on the square
    if (ch === 'o') { // a cream drop, point up
      g.fillStyle = '#12040a'; g.beginPath(); g.arc(P.x, P.y, r + 1, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(P.x - r * 0.7, P.y - r * 0.5); g.lineTo(P.x, P.y - r * 2.1); g.lineTo(P.x + r * 0.7, P.y - r * 0.5); g.fill();
      g.fillStyle = '#f1e7d0'; g.beginPath(); g.arc(P.x, P.y, r, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(P.x - r * 0.6, P.y - r * 0.5); g.lineTo(P.x, P.y - r * 1.85); g.lineTo(P.x + r * 0.6, P.y - r * 0.5); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(P.x - r * 0.35, P.y - r * 0.3, r * 0.28, 0, 6.3); g.fill(); return;
    }
    var col = ch === 'R' ? ['#ffb0b8', '#ff2630', '#c4121c', '#5a0810'] : ch === 'b' ? ['#fffbe8', '#f1e0b0', '#c8a868', '#7a5a30'] : ch === 'r' ? ['#ffb0b8', '#ff2630', '#c4121c', '#5a0810'] : ch === 'u' ? ['#ffffff', '#d8d0e0', '#a098b0', '#4a4058'] : ['#fff6b0', '#ffe36a', '#d8a030', '#7a5010'];
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(P.x, P.y, r + Math.max(1, r * 0.08), 0, 6.3); g.fill();
    // hard Mega Drive shading: dark rim, body, lit side, highlight
    g.fillStyle = col[3]; g.beginPath(); g.arc(P.x, P.y, r, 0, 6.3); g.fill();
    g.fillStyle = col[2]; g.beginPath(); g.arc(P.x - r * 0.08, P.y - r * 0.08, r * 0.88, 0, 6.3); g.fill();
    g.fillStyle = col[1]; g.beginPath(); g.arc(P.x - r * 0.2, P.y - r * 0.2, r * 0.66, 0, 6.3); g.fill();
    g.fillStyle = col[0]; g.beginPath(); g.arc(P.x - r * 0.38, P.y - r * 0.38, r * 0.24, 0, 6.3); g.fill();
    if (ch === 'u') { g.fillStyle = '#c4121c'; g.beginPath(); g.arc(P.x, P.y, r * 0.42, 0, 6.3); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(P.x - r * 0.24, P.y - r * 0.06, r * 0.48, r * 0.12); } // a bumper
    if (ch === 'y') { g.strokeStyle = '#7a5010'; g.lineWidth = Math.max(1, r * 0.12); for (var sp = -1; sp <= 1; sp++) { g.beginPath(); g.moveTo(P.x - r * 0.6, P.y + sp * r * 0.3); g.lineTo(P.x + r * 0.6, P.y + sp * r * 0.3); g.stroke(); } } // a spring
  }
  things = things.filter(function (o) { return !(Math.abs(o.l) < 0.45 && o.f > -0.7 && o.f < 0.35 && o.ch === 'R'); }); // the sphere he is standing on hides under him
  things.forEach(drawThing); // every sphere, far ones first; Cumhead goes on top of them all, like Sonic does
  // Cumhead from behind, hopping when he jumps
  var jh = S.air > 0 ? Math.sin((1 - S.air / S.airT) * Math.PI) * (S.airT * S.spd > 3 ? 2.6 : 1.5) : 0; // jump height in squares (he said the jump was a mild float)
  var base = ssP(0, 0, 0, W, H), sz = KIT.size('chb_u0'), csc = Math.max(1, (0.72 * base.s) / Math.max(1, sz.h)); g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(base.x, base.y, base.s * 0.3 / (1 + jh * 0.5), base.s * 0.1 / (1 + jh * 0.5), 0, 0, 6.3); g.fill();
  if (S.state !== 'fail' || Math.floor(S.st * 12) % 2) { var bn = ssBack(Math.floor(S.anim * 2.5) % 4), bsz = KIT.size(bn), bsc = Math.max(1, (0.72 * base.s) / Math.max(1, bsz.h)); // whoever is being played, from behind
    if (G.super) { var gf = superImg(bn); if (gf) g.drawImage(gf, Math.round(base.x - gf.width * bsc / 2), Math.round(base.y - jh * base.s - gf.height * bsc), gf.width * bsc, gf.height * bsc); }
    else spr(bn, base.x, base.y - jh * base.s, { sc: bsc });
    var C = CHR(); if (C.fol && C.kind !== 'hom') { var fn = C.fol === 'cat' ? 'cat' : 'bk_' + C.fol + (Math.floor(S.anim * 2.5 + 2) % 4), fsz = KIT.size(fn); spr(fn, base.x - base.s * 0.42, base.y - base.s * 0.12 - jh * base.s * 0.8, { sc: Math.max(1, ((C.fol === 'cat' ? 0.3 : 0.5) * base.s) / Math.max(1, fsz.h)) }); } } // the follower runs alongside
  // the count, Blue Sphere style: spheres left and drops
  KIT.panel(8, 6, 92, 34); g.fillStyle = '#12040a'; g.beginPath(); g.arc(28, 23, 11, 0, 6.3); g.fill(); g.fillStyle = '#c8a868'; g.beginPath(); g.arc(28, 23, 10, 0, 6.3); g.fill(); g.fillStyle = '#f1e0b0'; g.beginPath(); g.arc(26, 21, 7, 0, 6.3); g.fill(); g.fillStyle = '#fffbe8'; g.fillRect(22, 16, 3, 3);
  text(String(S.left), 46, 15, { size: 14, col: '#f1e7d0' });
  var dw = 92; KIT.panel(W - dw - 96, 6, dw, 34); spr('hog_drop', W - dw - 74, 36, { sc: 1.6 }); text(String(S.drops), W - dw - 58, 15, { size: 14, col: '#ffe36a' });
  for (var c7 = 0; c7 < 7; c7++) spr('hog_chal' + c7, 112 + c7 * 18, 32, { alpha: SV.chal[c7] ? 1 : 0.22 });
  if (S.state === 'in') { var a = Math.min(1, S.st * 3); g.fillStyle = 'rgba(255,255,255,' + (1 - a).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  if (S.state === 'in' || (S.state === 'play' && S.st < 2.5)) { text('GET ' + S.total + ' CREAM SPHERES', W / 2, H * 0.3, { size: 14, align: 'center', col: '#f1e7d0', font: 'title', outline: true }); text('AVOID THE RED ONES', W / 2, H * 0.3 + 22, { size: 8, align: 'center', col: '#ff2630', outline: true }); }
  if (S.state === 'play' && S.fast > 0 && Math.floor(S.fast * 8) % 2) text('SPEED UP!', W / 2, H * 0.34, { size: 16, align: 'center', col: '#ffe36a', font: 'title', outline: true });
  if (S.state === 'win' || S.state === 'fail') {
    R('rgba(7,4,5,0.75)', 0, 0, W, H); var win = S.state === 'win';
    text(win ? 'CUMHEAD GOT' : 'NO CHALICE', W / 2, H * 0.24, { size: 20, align: 'center', col: '#f1e7d0', font: 'title', outline: true });
    text(win ? CHALNAME[S.lv] : 'THIS TIME', W / 2, H * 0.24 + 30, { size: 20, align: 'center', col: win ? CHALCOL[S.lv] : '#ff2630', font: 'title', outline: true });
    for (var j = 0; j < 7; j++) spr('hog_chal' + j, W / 2 + (j - 3) * 30, H * 0.66 + (win && j === S.lv ? Math.sin(S.t * 6) * 3 : 0), { sc: 1.3, alpha: SV.chal[j] ? 1 : 0.2 });
    if (win && chalCount() >= 7) text('ALL SEVEN! 50 DROPS, THEN JUMP, DOUBLE JUMP AND JUMP AGAIN: SUPER CUMHEAD', W / 2, H * 0.84, { size: 7, align: 'center', col: '#ffe36a', outline: true });
  }
}
var FXS = [];
function endSpecial() {
  var S = SS; SS = null; G.mode = 'play'; music.play(LV.zone.song); FXS = [];
  PL.vx = PL.vy = PL.gsp = 0; PL.inv = 1.2; PL.state = 'normal';
}
function shadeHex(h, k) { var c = hexRgb(h); return 'rgb(' + c.map(function (v) { return Math.round(v * (1 - k)); }).join(',') + ')'; }
function mixHex(a, b, t) { var A = hexRgb(a), B = hexRgb(b); return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')'; }
