/* =====================================================================================================
   SPECIAL STAGES and the seven CUM CHALICES (his ask: like Blue Sphere in Sonic 3 & Knuckles, and easier than the
   old turning maze). A giant gold ring hides on a side route in every act; jump in with 50 drops. Cumhead runs on
   his own across a round checkered world: LEFT and RIGHT turn at the next square, A jumps. Run over every cream
   sphere and the chalice is yours; touch a red one and you are out (spheres you have taken stay safe, easier than Blue Sphere).
   Bumpers knock you back the way you came, gold springs throw you over a few squares, drops are just drops.
   It speeds up a little every 30 seconds. All seven and Cumhead can go Super (50 drops, in the air, hold up + B).
   ===================================================================================================== */
var SS = null, SSN = 32;
var CHALNAME = ['THE BLOOD CHALICE', 'THE GOLD CHALICE', 'THE CREAM CHALICE', 'THE VOID CHALICE', 'THE TEAR CHALICE', 'THE ROT CHALICE', 'THE BLACK CHALICE'];
var CHALCOL = ['#ff2630', '#ffc840', '#f1e0b0', '#a040e0', '#3a8ac8', '#30c060', '#6a6070'];
var SSDIR = [[0, -1], [1, 0], [0, 1], [-1, 0]];
/* a world: rings of cream spheres to clear, a few red ones in the way, drops between. Gets busier stage by stage, gently */
function ssWorld(lv, seed) {
  var s = seed * 7919 + 17; function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  var m = []; for (var y = 0; y < SSN; y++) { m.push([]); for (var x = 0; x < SSN; x++) m[y].push('.'); }
  function at(x, y) { return m[((y % SSN) + SSN) % SSN][((x % SSN) + SSN) % SSN]; }
  function put(x, y, ch) { m[((y % SSN) + SSN) % SSN][((x % SSN) + SSN) % SSN] = ch; }
  var shapes = 3 + Math.floor(lv * 0.7), spots = [];
  for (var k = 0; k < shapes; k++) {
    var cx = 4 + Math.floor(r() * (SSN - 8)), cy = 4 + Math.floor(r() * (SSN - 8)), sz = 2 + Math.floor(r() * 2) + (lv > 3 ? 1 : 0), kind = Math.floor(r() * 3);
    if (Math.abs(cx - 16) < 4 && cy > 20) continue; // keep the start clear
    if (kind === 0) for (var i = -sz; i <= sz; i++) { put(cx + i, cy - sz, 'b'); put(cx + i, cy + sz, 'b'); put(cx - sz, cy + i, 'b'); put(cx + sz, cy + i, 'b'); } // a square ring
    else if (kind === 1) for (var j = -sz - 1; j <= sz + 1; j++) put(cx + j, cy, 'b'); // a row
    else for (var q = -sz; q <= sz; q++) put(cx, cy + q, 'b'); // a column
    if (lv > 0 && r() < 0.35 + lv * 0.08) put(cx, cy, 'r'); // a red one in the middle of some shapes
    spots.push([cx, cy]);
  }
  for (var n = 0; n < 2 + lv; n++) { var rx = Math.floor(r() * SSN), ry = Math.floor(r() * SSN); if (at(rx, ry) === '.' && !(Math.abs(rx - 16) < 3 && ry > 22)) put(rx, ry, 'r'); }
  for (var u = 0; u < 3; u++) { var ux = Math.floor(r() * SSN), uy = Math.floor(r() * SSN); if (at(ux, uy) === '.') put(ux, uy, u === 2 ? 'y' : 'u'); }
  for (var d = 0; d < 26; d++) { var dx = Math.floor(r() * SSN), dy = Math.floor(r() * SSN); if (at(dx, dy) === '.') put(dx, dy, 'o'); }
  var nb = 0; m.forEach(function (row) { row.forEach(function (ch) { if (ch === 'b') nb++; }); });
  return { m: m, nb: nb };
}
function ssAt(S, x, y) { return S.m[((y % SSN) + SSN) % SSN][((x % SSN) + SSN) % SSN]; }
function ssPut(S, x, y, ch) { S.m[((y % SSN) + SSN) % SSN][((x % SSN) + SSN) % SSN] = ch; }
function startSpecial(portal) {
  var lv = 0; while (SV.chal[lv] && lv < 6) lv++;
  var w = ssWorld(lv, 31 + lv * 13 + (G.ai * 7));
  SS = { lv: lv, m: w.m, left: w.nb, total: w.nb, x: 16, y: 28, d: 0, cam: 0, spd: 2.6 + lv * 0.15, t: 0, drops: 0, state: 'in', st: 0, want: 0, jump: 0, back: 0, portal: portal, anim: 0, tx: 16, ty: 27 };
  G.ssBack = { mode: G.mode }; G.mode = 'special'; G.super = 0; music.play('hogspecial'); sfx.play('warp'); KIT.closeMenu && KIT.menuOpen() && KIT.closeMenu();
}
function stepSpecial(dt) {
  var S = SS; S.t += dt; S.st += dt;
  if (S.state === 'in') { if (S.st > 1.4) { S.state = 'play'; S.st = 0; } return; }
  if (S.state === 'win' || S.state === 'fail') { if (S.st > 4 || (S.st > 1.2 && (KIT.pressed('a') || KIT.pressed('start')))) endSpecial(); return; }
  var inp = pIn(); if (inp.dir) S.want = inp.dir; // remembered until the next square
  if (KIT.pressed('a') && S.jump <= 0) { S.jump = 0.62; sfx.play('jump'); }
  if (S.jump > 0) S.jump -= dt;
  S.cam += (S.d * Math.PI / 2 - S.cam) * Math.min(1, dt * 14); // the world turns smoothly round him
  var spd = Math.min(4.4, S.spd + Math.floor(S.t / 30) * 0.3); S.anim += Math.abs(spd) * dt;
  var D = SSDIR[S.d], before = S.d === 0 || S.d === 2 ? S.y : S.x;
  S.x += D[0] * spd * dt; S.y += D[1] * spd * dt;
  var after = S.d === 0 || S.d === 2 ? S.y : S.x;
  if (Math.floor(before) !== Math.floor(after) || Math.floor(before + 0.5) !== Math.floor(after + 0.5)) { // crossed the middle of a square
    var cx = Math.round(S.x), cy = Math.round(S.y);
    if (Math.abs((S.d === 0 || S.d === 2 ? S.y : S.x) - (S.d === 0 || S.d === 2 ? cy : cx)) < 0.25 && S.last !== cx + ',' + cy) { S.last = cx + ',' + cy;
      if (S.jump <= 0) {
        var ch = ssAt(S, cx, cy);
        if (ch === 'b') { ssPut(S, cx, cy, 'c'); S.left--; sfx.play('drop'); G.score += 10; if (S.left <= 0) { S.state = 'win'; S.st = 0; SV.chal[S.lv] = 1; persist(); sfx.play('chalice'); music.stop(0.2); return; } }
        else if (ch === 'r') { S.state = 'fail'; S.st = 0; sfx.play('die'); music.play('hogclear'); return; }
        else if (ch === 'o') { ssPut(S, cx, cy, '.'); S.drops++; G.drops++; sfx.play('drop'); if (S.drops === 50) { G.lives++; sfx.play('life'); } }
        else if (ch === 'u') { S.d = (S.d + 2) % 4; S.want = 0; sfx.play('bump'); }
        else if (ch === 'y') { S.jump = 1.25; sfx.play('spring'); }
      }
      if (S.want) { S.x = cx; S.y = cy; S.d = (S.d + (S.want > 0 ? 1 : 3)) % 4; if (S.want > 0 && S.cam < S.d * Math.PI / 2 - Math.PI) S.cam += Math.PI * 2; if (S.want < 0 && S.cam > S.d * Math.PI / 2 + Math.PI) S.cam -= Math.PI * 2; S.want = 0; }
    }
  }
  if (S.cam > Math.PI * 4) S.cam -= Math.PI * 2; if (S.cam < -Math.PI * 2) S.cam += Math.PI * 2;
  if (Math.abs(S.cam - S.d * Math.PI / 2) > Math.PI) S.cam += S.cam < S.d * Math.PI / 2 ? Math.PI * 2 : -Math.PI * 2;
}
/* drawing: the ground is the top of a ball. Each square is projected onto it in front of Cumhead, so the far side
   curves away over the horizon like Blue Sphere */
function ssProject(lx, lf, W, H) { // lx: squares to the right, lf: squares ahead of Cumhead; the camera sits a little behind him and above
  var RAD = 9, a = (lf + 1.5) / RAD; if (a < 0.03 || a > 1.2) return null;
  var z = Math.sin(a) * RAD, y = (Math.cos(a) - 1) * RAD, K = H * 0.333, hc = 3;
  return { x: W / 2 + lx * K / z, y: H * 0.103 + (hc - y) * K / z, s: K / z };
}
function drawSpecial() {
  var g = KIT.ctx, W = KIT.W, H = KIT.H, S = SS, cam = S.cam, ca = Math.cos(cam), sa = Math.sin(cam);
  // sky: hard bands of red night, the stars turn with him
  var bands = ['#060104', '#0a0206', '#10030a', '#18050c', '#22070e', '#2c0a10'];
  for (var b = 0; b < bands.length; b++) R(bands[b], 0, b * H * 0.1, W, H * 0.1 + 1);
  R('#2c0a10', 0, H * 0.6, W, H * 0.4);
  for (var i = 0; i < 40; i++) { var sx = ((i * 97 - cam * 160) % W + W) % W; R(i % 5 ? '#6a3a40' : '#f1e7d0', sx, (i * 37) % (H * 0.45), 1, 1); }
  var mx = ((W * 0.75 - cam * 160) % (W + 120) + W + 120) % (W + 120) - 60; g.fillStyle = '#c4121c'; g.beginPath(); g.arc(mx, H * 0.16, 16, 0, 6.3); g.fill(); g.fillStyle = '#ff2630'; g.beginPath(); g.arc(mx - 3, H * 0.16 - 3, 11, 0, 6.3); g.fill();
  // the checkered ball: squares from far to near
  var px = S.x, py = S.y, items = [];
  function local(wx, wy) { var dx = wx - px, dy = wy - py; return { l: dx * ca + dy * sa, f: -(-dx * sa + dy * ca) }; } // f: ahead along the way he faces
  for (var ty = Math.floor(py) - 16; ty <= Math.floor(py) + 16; ty++) for (var tx = Math.floor(px) - 16; tx <= Math.floor(px) + 16; tx++) {
    var c0 = local(tx - 0.5, ty - 0.5), c1 = local(tx + 0.5, ty - 0.5), c2 = local(tx + 0.5, ty + 0.5), c3 = local(tx - 0.5, ty + 0.5);
    var P0 = ssProject(c0.l, c0.f, W, H), P1 = ssProject(c1.l, c1.f, W, H), P2 = ssProject(c2.l, c2.f, W, H), P3 = ssProject(c3.l, c3.f, W, H); if (!P0 || !P1 || !P2 || !P3) continue;
    var cc = local(tx, ty), dep = cc.f; items.push({ dep: dep, quad: [P0, P1, P2, P3], dark: ((tx + ty) % 2 + 2) % 2, tx: tx, ty: ty, cl: cc.l, cf: cc.f });
  }
  items.sort(function (a, b) { return b.dep - a.dep; });
  var lit = CHALCOL[S.lv];
  items.forEach(function (it) { var q = it.quad; g.fillStyle = it.dark ? '#140408' : '#4a0a12'; g.beginPath(); g.moveTo(Math.round(q[0].x), Math.round(q[0].y)); for (var k = 1; k < 4; k++) g.lineTo(Math.round(q[k].x), Math.round(q[k].y)); g.closePath(); g.fill(); });
  items.forEach(function (it) { var ch = ssAt(S, it.tx, it.ty); if (ch === '.') return; var P = ssProject(it.cl, it.cf, W, H); if (!P) return; var r = Math.max(1.5, P.s * 0.3), y = P.y - r;
    if (ch === 'c') { g.fillStyle = '#6a0a10'; g.beginPath(); g.ellipse(Math.round(P.x), Math.round(P.y - 1), Math.max(1, r * 0.7), Math.max(1, r * 0.3), 0, 0, 6.3); g.fill(); return; }
    if (ch === 'o') { spr('hog_drop', P.x, P.y, { sc: Math.max(0.3, P.s / 34) }); return; }
    var col = ch === 'b' ? ['#fffbe8', '#e8d8a8', '#8a7a50'] : ch === 'r' ? ['#ff8a94', '#ff2630', '#6a0a10'] : ch === 'u' ? ['#ffffff', '#c8c0d0', '#5a5060'] : ['#fff09a', '#ffc840', '#a8741a'];
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(Math.round(P.x), Math.round(y), r + 1, 0, 6.3); g.fill();
    g.fillStyle = col[2]; g.beginPath(); g.arc(Math.round(P.x), Math.round(y), r, 0, 6.3); g.fill();
    g.fillStyle = col[1]; g.beginPath(); g.arc(Math.round(P.x - r * 0.12), Math.round(y - r * 0.12), r * 0.82, 0, 6.3); g.fill();
    g.fillStyle = col[0]; g.beginPath(); g.arc(Math.round(P.x - r * 0.38), Math.round(y - r * 0.38), r * 0.3, 0, 6.3); g.fill();
    if (ch === 'u') { g.fillStyle = '#c4121c'; g.fillRect(Math.round(P.x - r * 0.5), Math.round(y - 1), Math.round(r), 2); } });
  // Cumhead from behind, hopping when he jumps
  var jy = S.jump > 0 ? Math.sin(Math.min(1, (0.62 - Math.min(0.62, S.jump)) / 0.62) * Math.PI) * 26 : 0; if (S.jump > 0.62) jy = 30 + Math.sin(S.t * 10) * 2;
  var base = ssProject(0, 0, W, H); R('rgba(0,0,0,0.4)', W / 2 - 10, base.y - 2, 20, 4);
  if (S.state !== 'fail' || Math.floor(S.st * 12) % 2) spr('chb_u' + (Math.floor(S.anim * 2.5) % 4), W / 2, base.y - jy, { sc: 1.5 });
  // the count, Blue Sphere style: spheres left and drops
  KIT.panel(8, 6, 150, 26); g.fillStyle = '#e8d8a8'; g.beginPath(); g.arc(24, 19, 6, 0, 6.3); g.fill(); text(String(S.left), 36, 13, { size: 8 }); spr('hog_drop', 92, 28, {}); text(String(S.drops), 104, 13, { size: 8, col: '#ffe36a' });
  for (var c7 = 0; c7 < 7; c7++) spr('hog_chal' + c7, 20 + c7 * 20, 56, { alpha: SV.chal[c7] ? 1 : 0.22 });
  if (S.state === 'in') { var a = Math.min(1, S.st * 3); g.fillStyle = 'rgba(255,255,255,' + (1 - a).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  if (S.state === 'in' || (S.state === 'play' && S.st < 2.5)) { text('GET ' + S.total + ' CREAM SPHERES', W / 2, H * 0.3, { size: 14, align: 'center', col: '#f1e7d0', font: 'title', outline: true }); text('AVOID THE RED ONES', W / 2, H * 0.3 + 22, { size: 8, align: 'center', col: '#ff2630', outline: true }); }
  if (S.state === 'win' || S.state === 'fail') {
    R('rgba(7,4,5,0.75)', 0, 0, W, H); var win = S.state === 'win';
    text(win ? 'CUMHEAD GOT' : 'NO CHALICE', W / 2, H * 0.24, { size: 20, align: 'center', col: '#f1e7d0', font: 'title', outline: true });
    text(win ? CHALNAME[S.lv] : 'THIS TIME', W / 2, H * 0.24 + 30, { size: 20, align: 'center', col: win ? CHALCOL[S.lv] : '#ff2630', font: 'title', outline: true });
    for (var j = 0; j < 7; j++) spr('hog_chal' + j, W / 2 + (j - 3) * 30, H * 0.66 + (win && j === S.lv ? Math.sin(S.t * 6) * 3 : 0), { sc: 1.3, alpha: SV.chal[j] ? 1 : 0.2 });
    if (win && chalCount() >= 7) text('ALL SEVEN! 50 DROPS, JUMP, HOLD UP + B: SUPER CUMHEAD', W / 2, H * 0.84, { size: 7, align: 'center', col: '#ffe36a', outline: true });
  }
}
var FXS = [];
function endSpecial() {
  var S = SS; SS = null; G.mode = 'play'; music.play(LV.zone.song); FXS = [];
  PL.vx = PL.vy = PL.gsp = 0; PL.inv = 1.2; PL.state = 'normal';
}
