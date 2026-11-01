/* =====================================================================================================
   SPECIAL STAGES and the seven CUM CHALICES. A giant gold ring hides on a side route in every act; jump in
   with 50 drops and you drop into a turning maze (Sonic 1 style): gravity goes round with it, A jumps away
   from the floor, OUT blocks throw you back to the act, R blocks reverse the spin, bumpers bounce. The
   chalice sits in the middle behind cream crystal blocks you break by running into them. All seven and
   Cumhead can go Super (50 drops, in the air, hold up and press B).
   ===================================================================================================== */
var SS = null, SST = 24, SSN = 27, SSC = 13;
var CHALNAME = ['THE BLOOD CHALICE', 'THE GOLD CHALICE', 'THE CREAM CHALICE', 'THE VOID CHALICE', 'THE TEAR CHALICE', 'THE ROT CHALICE', 'THE BLACK CHALICE'];
var CHALCOL = ['#ff2630', '#ffc840', '#f1e0b0', '#a040e0', '#3a8ac8', '#30c060', '#6a6070'];
function ssRing(rad) { var c = SSC, out = [], t;
  for (t = -rad; t < rad; t++) out.push([c + t, c - rad]); for (t = -rad; t < rad; t++) out.push([c + rad, c + t]);
  for (t = rad; t > -rad; t--) out.push([c + t, c + rad]); for (t = rad; t > -rad; t--) out.push([c - rad, c + t]); return out; }
function ssMaze(level, seed) {
  var s = seed * 7919 + 17; function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  var m = []; for (var y = 0; y < SSN; y++) { m.push([]); for (var x = 0; x < SSN; x++) m[y].push('.'); }
  function set(p, ch) { m[p[1]][p[0]] = ch; }
  ssRing(12).forEach(function (p) { set(p, '#'); }); ssRing(13).forEach(function (p) { set(p, '#'); });
  [9, 6, 3].forEach(function (rad, ri) {
    var cells = ssRing(rad), L = cells.length, gaps = [], i, k;
    cells.forEach(function (p) { set(p, '#'); });
    var ng = ri === 2 ? 1 : 2; for (k = 0; k < ng; k++) { var at = Math.floor(r() * L); gaps.push(at); set(cells[at], '.'); set(cells[(at + 1) % L], '.'); }
    function nearGap(i) { return gaps.some(function (g) { var d = Math.abs(i - g); d = Math.min(d, L - d); return d < 3; }); }
    var ngoal = Math.min(L - 8, 2 + level + (2 - ri)); for (k = 0, i = 0; k < ngoal && i < 200; i++) { var gi = Math.floor(r() * L); if (!nearGap(gi) && m[cells[gi][1]][cells[gi][0]] === '#') { set(cells[gi], 'G'); k++; } }
    for (k = 0; k < 1 + (level > 2 ? 1 : 0); k++) { var ri2 = Math.floor(r() * L); if (!nearGap(ri2) && m[cells[ri2][1]][cells[ri2][0]] === '#') set(cells[ri2], 'R'); }
  });
  // drops along the corridors, a few bumpers, crystal round the chalice
  [11, 10, 8, 7, 5, 4, 2].forEach(function (rad) { ssRing(rad).forEach(function (p, i) { if (m[p[1]][p[0]] !== '.') return; if ((rad === 11 || rad === 7 || rad === 4) && i % 3 === 0 && r() < 0.8) set(p, 'o'); else if ((rad === 8 || rad === 10) && r() < 0.05 + level * 0.008) set(p, 'B'); }); });
  ssRing(1).forEach(function (p) { set(p, 'X'); }); m[SSC][SSC] = 'C';
  for (var yy = 2; yy <= 3; yy++) for (var xx = SSC - 1; xx <= SSC + 1; xx++) m[yy][xx] = '.'; // the start is clear
  return m;
}
function ssSolid(ch) { return ch === '#' || ch === 'G' || ch === 'R' || ch === 'X' || ch === 'B'; }
function startSpecial(portal) {
  var lv = 0; while (SV.chal[lv] && lv < 6) lv++;
  SS = { lv: lv, m: ssMaze(lv, 31 + lv * 13 + (G.ai * 7)), x: SSC * SST + SST / 2, y: 3 * SST + 2, vx: 0, vy: 0, th: 0, om: 0.42 * (1 + lv * 0.1), rcd: 0, ground: false, t: 0, drops: 0, state: 'in', st: 0, dist: 0, face: 1, prevJ: true, portal: portal, spin: 0 };
  G.ssBack = { mode: G.mode }; G.mode = 'special'; G.super = 0; music.play('hogspecial'); sfx.play('warp'); KIT.closeMenu && KIT.menuOpen() && KIT.closeMenu();
}
function stepSpecial(dt) {
  var S = SS; S.t += dt; S.st += dt;
  if (S.state === 'in') { if (S.st > 1.2) { S.state = 'play'; S.st = 0; } return; }
  if (S.state === 'win' || S.state === 'fail') { if (S.st > 4 || (S.st > 1.2 && (KIT.pressed('a') || KIT.pressed('start')))) endSpecial(); return; }
  if (S.state === 'out') { S.th += S.om * 6 * dt; if (S.st > 1.1) { S.state = 'fail'; S.st = 0; music.play('hogclear'); } return; }
  S.th += S.om * dt; if (S.rcd > 0) S.rcd -= dt;
  var c = Math.cos(S.th), sn = Math.sin(S.th), GR = 520, gx = GR * sn, gy = GR * c; // gravity in maze terms
  var inp = pIn(), dir = inp.dir, jp = inp.j && !S.prevJ; S.prevJ = inp.j;
  var ax = dir * c, ay = -dir * sn, acc = S.ground ? 520 : 300; // screen left/right, turned into the maze
  S.vx += (gx + ax * acc) * dt; S.vy += (gy + ay * acc) * dt;
  if (jp && S.ground) { S.vx -= sn * 330; S.vy -= c * 330; sfx.play('jump'); }
  if (S.ground && !dir) { S.vx -= S.vx * 1.2 * dt; S.vy -= S.vy * 1.2 * dt; }
  var sp = Math.hypot(S.vx, S.vy); if (sp > 430) { S.vx *= 430 / sp; S.vy *= 430 / sp; }
  S.x += S.vx * dt; S.y += S.vy * dt; S.ground = false;
  var R0 = 10, m = S.m;
  for (var it = 0; it < 2; it++) for (var ty = Math.floor((S.y - R0) / SST); ty <= Math.floor((S.y + R0) / SST); ty++) for (var tx = Math.floor((S.x - R0) / SST); tx <= Math.floor((S.x + R0) / SST); tx++) {
    if (ty < 0 || tx < 0 || ty >= SSN || tx >= SSN) continue; var ch = m[ty][tx]; if (!ssSolid(ch)) continue;
    var qx = Math.max(tx * SST, Math.min(S.x, tx * SST + SST)), qy = Math.max(ty * SST, Math.min(S.y, ty * SST + SST)), dx = S.x - qx, dy = S.y - qy, d2 = dx * dx + dy * dy;
    if (d2 >= R0 * R0) continue; var d = Math.sqrt(d2) || 0.01, nx = d2 ? dx / d : -sn, ny = d2 ? dy / d : -c;
    S.x += nx * (R0 - d); S.y += ny * (R0 - d); var vn = S.vx * nx + S.vy * ny;
    if (ch === 'G') { S.state = 'out'; S.st = 0; sfx.play('die'); return; }
    if (ch === 'B') { S.vx = nx * 400; S.vy = ny * 400; sfx.play('bump'); continue; }
    if (ch === 'X') { m[ty][tx] = '.'; sfx.play('clink'); G.score += 100; for (var k = 0; k < 6; k++) FXS.push({ x: tx * SST + 12, y: ty * SST + 12, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160, t: 0.5 }); }
    if (ch === 'R' && S.rcd <= 0) { S.om = -S.om; S.rcd = 0.8; sfx.play('spring'); }
    if (vn < 0) { S.vx -= vn * nx * (ch === 'X' ? 1.6 : 1); S.vy -= vn * ny * (ch === 'X' ? 1.6 : 1); }
    if (-(nx * sn + ny * c) > 0.5) S.ground = true;
  }
  var cx = Math.floor(S.x / SST), cy = Math.floor(S.y / SST), here = m[cy] && m[cy][cx];
  if (here === 'o') { m[cy][cx] = '.'; S.drops++; G.drops++; sfx.play('drop'); if (S.drops === 50) { G.lives++; sfx.play('life'); } }
  if (here === 'C') { m[cy][cx] = '.'; SV.chal[S.lv] = 1; persist(); S.state = 'win'; S.st = 0; sfx.play('chalice'); music.stop(0.2); }
  var vsx = S.vx * c - S.vy * sn; if (Math.abs(vsx) > 20) S.face = vsx > 0 ? 1 : -1; S.dist += Math.abs(vsx) * dt; S.spin += sp * dt * 0.05;
  FXS.forEach(function (f) { f.t -= dt; f.x += f.vx * dt; f.y += f.vy * dt; }); FXS = FXS.filter(function (f) { return f.t > 0; });
}
var FXS = [], SSTILE = null;
function ssTiles(lv) {
  var col = CHALCOL[lv], out = {};
  function mk(fn) { var c = document.createElement('canvas'); c.width = SST; c.height = SST; fn(c.getContext('2d')); return c; }
  out['#'] = mk(function (g) { g.fillStyle = '#12040a'; g.fillRect(0, 0, 24, 24); g.fillStyle = col; g.beginPath(); g.moveTo(12, 1); g.lineTo(23, 12); g.lineTo(12, 23); g.lineTo(1, 12); g.fill(); g.fillStyle = '#2a0a10'; g.beginPath(); g.moveTo(12, 6); g.lineTo(18, 12); g.lineTo(12, 18); g.lineTo(6, 12); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(11, 3, 2, 3); });
  out.G = mk(function (g) { g.fillStyle = '#12040a'; g.fillRect(0, 0, 24, 24); g.fillStyle = '#c4121c'; g.fillRect(1, 1, 22, 22); g.fillStyle = '#ff2630'; g.fillRect(1, 1, 22, 3); g.fillStyle = '#f1e7d0'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('OUT', 12, 15); });
  out.R = mk(function (g) { g.fillStyle = '#12040a'; g.fillRect(0, 0, 24, 24); g.fillStyle = '#ffc840'; g.fillRect(1, 1, 22, 22); g.strokeStyle = '#12040a'; g.lineWidth = 2; g.beginPath(); g.arc(12, 12, 6, 0.6, 5.6); g.stroke(); g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(18, 6); g.lineTo(18, 13); g.lineTo(13, 9); g.fill(); });
  out.X = mk(function (g) { g.fillStyle = '#12040a'; g.fillRect(0, 0, 24, 24); g.fillStyle = '#fffbe8'; g.fillRect(2, 2, 20, 20); g.fillStyle = '#d8c8a0'; g.beginPath(); g.moveTo(22, 2); g.lineTo(22, 22); g.lineTo(2, 22); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(5, 5, 5, 3); });
  out.B = mk(function (g) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(12, 12, 11, 0, 6.3); g.fill(); g.fillStyle = '#c4121c'; g.beginPath(); g.arc(12, 12, 10, 0, 6.3); g.fill(); g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(12, 12, 5, 0, 6.3); g.fill(); });
  return out;
}
function drawSpecial() {
  var g = KIT.ctx, W = KIT.W, H = KIT.H, S = SS; if (!SSTILE || SSTILE.lv !== S.lv) { SSTILE = ssTiles(S.lv); SSTILE.lv = S.lv; }
  // a slow red whirl behind
  g.fillStyle = '#0a0204'; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, H / 2); g.rotate(-S.th * 0.4 + S.t * 0.1);
  for (var i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#1c0508' : '#2c0a10'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, W, i / 16 * 6.283, (i + 1) / 16 * 6.283); g.fill(); }
  g.restore();
  // the maze, turned round Cumhead
  g.save(); g.translate(Math.round(W / 2), Math.round(H / 2)); g.rotate(S.th); g.translate(-S.x, -S.y);
  var m = S.m, reach = Math.hypot(W, H) / 2 + SST;
  for (var y = 0; y < SSN; y++) for (var x = 0; x < SSN; x++) { var ch = m[y][x]; if (ch === '.') continue; var px = x * SST, py = y * SST; if (Math.abs(px + 12 - S.x) > reach || Math.abs(py + 12 - S.y) > reach) continue;
    if (ch === 'o') { g.save(); g.translate(px + 12, py + 12); g.rotate(-S.th); spr('hog_drop', 0, 6, {}); g.restore(); continue; }
    if (ch === 'C') { g.save(); g.translate(px + 12, py + 12); g.rotate(-S.th); spr('hog_chal' + S.lv, 0, 11 + Math.sin(S.t * 3) * 2, {}); g.restore(); continue; }
    g.drawImage(SSTILE[ch], px, py); }
  FXS.forEach(function (f) { g.fillStyle = '#fffbe8'; g.fillRect(f.x - 1, f.y - 1, 3, 3); });
  g.restore();
  // Cumhead, always the right way up
  if (S.state !== 'out' || Math.floor(S.st * 12) % 2) {
    var n = S.ground ? (Math.abs(S.vx) + Math.abs(S.vy) > 40 ? 'ch_rn' + (Math.floor(S.dist / 6) % 8) : 'ch_idle' + (Math.floor(S.t * 6) % 7)) : 'ch_jump' + (Math.floor(S.t * 10) % 4);
    spr(n, W / 2, H / 2 + 10 + 1, { sc: 0.55, flip: S.face < 0 });
  }
  // HUD
  text('DROPS', 12, 12, { size: 8, col: '#ffe36a', outline: true }); text(String(S.drops), 70, 12, { size: 8, outline: true });
  for (var k = 0; k < 7; k++) spr('hog_chal' + k, 20 + k * 20, 46, { alpha: SV.chal[k] ? 1 : 0.22 });
  if (S.state === 'in') { var a = Math.min(1, S.st * 3); g.fillStyle = 'rgba(255,255,255,' + (1 - a).toFixed(2) + ')'; g.fillRect(0, 0, W, H); text('FIND ' + CHALNAME[S.lv], W / 2, H * 0.3, { size: 16, align: 'center', col: CHALCOL[S.lv], font: 'title', outline: true }); }
  if (S.state === 'play' && S.st < 2.5) text('FIND ' + CHALNAME[S.lv], W / 2, H * 0.22, { size: 14, align: 'center', col: CHALCOL[S.lv], font: 'title', outline: true, alpha: Math.min(1, 2.5 - S.st) });
  if (S.state === 'win' || S.state === 'fail') {
    g.fillStyle = 'rgba(7,4,5,0.75)'; g.fillRect(0, 0, W, H); var win = S.state === 'win';
    text(win ? 'CUMHEAD GOT' : 'NO CHALICE', W / 2, H * 0.24, { size: 20, align: 'center', col: '#f1e7d0', font: 'title', outline: true });
    text(win ? CHALNAME[S.lv] : 'THIS TIME', W / 2, H * 0.24 + 30, { size: 20, align: 'center', col: win ? CHALCOL[S.lv] : '#ff2630', font: 'title', outline: true });
    for (var j = 0; j < 7; j++) spr('hog_chal' + j, W / 2 + (j - 3) * 30, H * 0.66 + (win && j === S.lv ? Math.sin(S.t * 6) * 3 : 0), { sc: 1.3, alpha: SV.chal[j] ? 1 : 0.2 });
    if (win && chalCount() >= 7) text('ALL SEVEN! 50 DROPS, JUMP, HOLD UP + B: SUPER CUMHEAD', W / 2, H * 0.84, { size: 7, align: 'center', col: '#ffe36a', outline: true });
  }
}
function endSpecial() {
  var S = SS; SS = null; G.mode = 'play'; music.play(LV.zone.song); FXS = [];
  PL.vx = PL.vy = PL.gsp = 0; PL.inv = 1.2; PL.state = 'normal';
}
