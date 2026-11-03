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
/* drawing: a real little planet, like Blue Sphere. Every square, sphere and drop goes through ONE projection (ssP), so
   nothing slides about: the squares are laid on a ball of radius SSR, the camera sits behind and above Cumhead, and the
   far side and the sides both curve away over the horizon */
var SSR = 7, SSCH = 6, SSCD = 3, SSPITCH = 0.65; // a small planet, the camera up high behind him looking down, like Blue Sphere
function ssP(l, f, up, W, H) { // l: squares to his right, f: squares ahead, up: height above the ground (squares)
  var al = l / SSR, af = f / SSR, ca = Math.cos(al), r = SSR + (up || 0);
  var nx = Math.sin(al), ny = ca * Math.cos(af), nz = ca * Math.sin(af); // the ground's normal there (also its direction from the centre)
  var x = nx * r, y = ny * r - SSR, z = nz * r; // Cumhead stands at (0,0,0) on top
  var vx = x, vy0 = y - SSCH, vz0 = z + SSCD, cp = Math.cos(SSPITCH), sp = Math.sin(SSPITCH), vz = vz0 * cp - vy0 * sp, vy = vy0 * cp + vz0 * sp; // from the camera, tipped down
  if (vz < 0.25) return null;
  var bx = nx * SSR, by = ny * SSR - SSR, bz = nz * SSR; if (nx * (-bx) + ny * (SSCH - by) + nz * (-SSCD - bz) < 0) return null; // round the back of the ball: hidden
  var F = Math.min(H * 1.2, W * 0.75); return { x: W / 2 + vx * F / vz, y: H * 0.72 - 0.59 * F - vy * F / vz, s: F / vz, d: vz };
}
function drawSpecial() {
  var g = KIT.ctx, W = KIT.W, H = KIT.H, S = SS, cam = S.cam, ca = Math.cos(cam), sa = Math.sin(cam);
  // sky: hard bands of red night; the stars and the moon turn with him
  var bands = ['#060104', '#0a0206', '#10030a', '#18050c', '#22070e', '#2c0a10', '#360c12'];
  for (var b = 0; b < bands.length; b++) R(bands[b], 0, b * H * 0.08, W, H * 0.08 + 1);
  R('#360c12', 0, H * 0.56, W, H * 0.44);
  for (var i = 0; i < 46; i++) { var sx = ((i * 97 - cam * 160) % W + W) % W; R(i % 5 ? '#6a3a40' : '#f1e7d0', sx, (i * 37) % (H * 0.42), 1, 1); }
  var mx = ((W * 0.75 - cam * 160) % (W + 120) + W + 120) % (W + 120) - 60; g.fillStyle = '#c4121c'; g.beginPath(); g.arc(mx, H * 0.16, 16, 0, 6.3); g.fill(); g.fillStyle = '#ff2630'; g.beginPath(); g.arc(mx - 3, H * 0.16 - 3, 11, 0, 6.3); g.fill();
  var px = S.x, py = S.y, tiles = [], things = [];
  function local(wx, wy) { var dx = wx - px, dy = wy - py; return { l: dx * ca + dy * sa, f: dx * sa - dy * ca }; } // f: ahead along the way he faces
  var N = 11;
  for (var ty = Math.floor(py) - N; ty <= Math.floor(py) + N + 1; ty++) for (var tx = Math.floor(px) - N; tx <= Math.floor(px) + N + 1; tx++) {
    var cc = local(tx, ty); if (cc.f < -3.2 || Math.abs(cc.l) > SSR * 1.45 || cc.f > SSR * 1.5) continue;
    var cs = [local(tx - 0.5, ty - 0.5), local(tx + 0.5, ty - 0.5), local(tx + 0.5, ty + 0.5), local(tx - 0.5, ty + 0.5)].map(function (c) { return ssP(c.l, c.f, 0, W, H); });
    if (cs.some(function (p) { return !p; })) continue;
    var d = cs[0].d + cs[1].d + cs[2].d + cs[3].d, far = Math.min(1, Math.max(0, (Math.hypot(cc.l, cc.f) - 2) / (SSR * 1.4)));
    tiles.push({ d: d, q: cs, dark: ((tx + ty) % 2 + 2) % 2, far: far });
    var ch = ssAt(S, tx, ty); if (ch !== '.') things.push({ ch: ch, l: cc.l, f: cc.f, far: far });
  }
  tiles.sort(function (a, b) { return b.d - a.d; });
  var LIGHT = ['#c4121c', '#a00e18', '#7a0a12', '#560810'], DARK = ['#3a0a10', '#2e080c', '#22060a', '#180408'];
  tiles.forEach(function (t) { var q = t.q, k = Math.min(3, Math.floor(t.far * 4)); g.fillStyle = t.dark ? DARK[k] : LIGHT[k]; g.beginPath(); g.moveTo(q[0].x, q[0].y); for (var n = 1; n < 4; n++) g.lineTo(q[n].x, q[n].y); g.closePath(); g.fill(); });
  // spheres, bumpers, springs and drops, each standing on its own square, far ones first
  things.forEach(function (o) { o.p = ssP(o.l, o.f, 0, W, H); }); things = things.filter(function (o) { return o.p; }).sort(function (a, b) { return b.p.d - a.p.d; });
  function drawThing(o) {
    var ch = o.ch, base = o.p;
    if (ch === 'c') { g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(base.x, base.y, base.s * 0.28, base.s * 0.1, 0, 0, 6.3); g.fill(); return; } // where a sphere was
    var rr = ch === 'o' ? 0.17 : 0.34, P = ssP(o.l, o.f, rr, W, H); if (!P) return; var r = Math.max(1.5, rr * P.s);
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(base.x, base.y, r * 0.95, r * 0.32, 0, 0, 6.3); g.fill(); // its shadow on the square
    if (ch === 'o') { // a cream drop, point up
      g.fillStyle = '#12040a'; g.beginPath(); g.arc(P.x, P.y, r + 1, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(P.x - r * 0.7, P.y - r * 0.5); g.lineTo(P.x, P.y - r * 2.1); g.lineTo(P.x + r * 0.7, P.y - r * 0.5); g.fill();
      g.fillStyle = '#f1e7d0'; g.beginPath(); g.arc(P.x, P.y, r, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(P.x - r * 0.6, P.y - r * 0.5); g.lineTo(P.x, P.y - r * 1.85); g.lineTo(P.x + r * 0.6, P.y - r * 0.5); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(P.x - r * 0.35, P.y - r * 0.3, r * 0.28, 0, 6.3); g.fill(); return;
    }
    var col = ch === 'b' ? ['#fffbe8', '#f1e0b0', '#c8a868', '#7a5a30'] : ch === 'r' ? ['#ffb0b8', '#ff2630', '#c4121c', '#5a0810'] : ch === 'u' ? ['#ffffff', '#d8d0e0', '#a098b0', '#4a4058'] : ['#fff6b0', '#ffe36a', '#d8a030', '#7a5010'];
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(P.x, P.y, r + Math.max(1, r * 0.08), 0, 6.3); g.fill();
    // hard Mega Drive shading: dark rim, body, lit side, highlight
    g.fillStyle = col[3]; g.beginPath(); g.arc(P.x, P.y, r, 0, 6.3); g.fill();
    g.fillStyle = col[2]; g.beginPath(); g.arc(P.x - r * 0.08, P.y - r * 0.08, r * 0.88, 0, 6.3); g.fill();
    g.fillStyle = col[1]; g.beginPath(); g.arc(P.x - r * 0.2, P.y - r * 0.2, r * 0.66, 0, 6.3); g.fill();
    g.fillStyle = col[0]; g.beginPath(); g.arc(P.x - r * 0.38, P.y - r * 0.38, r * 0.24, 0, 6.3); g.fill();
    if (ch === 'u') { g.fillStyle = '#c4121c'; g.beginPath(); g.arc(P.x, P.y, r * 0.42, 0, 6.3); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(P.x - r * 0.24, P.y - r * 0.06, r * 0.48, r * 0.12); } // a bumper
    if (ch === 'y') { g.strokeStyle = '#7a5010'; g.lineWidth = Math.max(1, r * 0.12); for (var sp = -1; sp <= 1; sp++) { g.beginPath(); g.moveTo(P.x - r * 0.6, P.y + sp * r * 0.3); g.lineTo(P.x + r * 0.6, P.y + sp * r * 0.3); g.stroke(); } } // a spring
  }
  var me = ssP(0, 0, 0, W, H); things.forEach(function (o) { if (o.p.d >= me.d) drawThing(o); }); // behind him first
  // Cumhead from behind, hopping when he jumps
  var jy = S.jump > 0 ? Math.sin(Math.min(1, (0.62 - Math.min(0.62, S.jump)) / 0.62) * Math.PI) * 26 : 0; if (S.jump > 0.62) jy = 30 + Math.sin(S.t * 10) * 2;
  var base = ssP(0, 0, 0, W, H), sz = KIT.size('chb_u0'), csc = Math.max(1, (0.95 * base.s) / Math.max(1, sz.h)); g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(base.x, base.y, base.s * 0.3, base.s * 0.1, 0, 0, 6.3); g.fill();
  if (S.state !== 'fail' || Math.floor(S.st * 12) % 2) spr('chb_u' + (Math.floor(S.anim * 2.5) % 4), base.x, base.y - jy * base.s / 60, { sc: csc });
  things.forEach(function (o) { if (o.p.d < me.d) drawThing(o); }); // then whatever is between him and the camera
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
