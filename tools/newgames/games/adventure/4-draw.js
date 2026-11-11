/* ---------- drawing the 3D places ---------- */
var ATL = null, ATT = null, SHEETTEX = null, MESH = null, DYN = null;
var PAINT = { white: function (p) { p.fill('#ffffff'); }, glow: function (p) { p.fill('#ffffff'); },
  water: function (p) { p.fill('#ffffff'); for (var i = 0; i < 30; i++) p.rect(Math.floor(p.rnd() * 28), Math.floor(p.rnd() * 32), 4, 1, '#e0e8f0'); },
  spring: function (p) { p.fill('#ffe36a'); p.rect(0, 12, 32, 8, '#c4121c'); }, pad: function (p) { p.fill('#2a2a30'); for (var y = 0; y < 32; y += 10) { p.rect(8, y, 16, 4, '#ffe36a'); p.rect(12, y + 4, 8, 3, '#ffe36a'); } },
  loop: function (p) { p.fill('#c4121c'); p.rect(0, 0, 32, 4, '#ffe36a'); p.rect(0, 28, 32, 4, '#ffe36a'); }, portal: function (p) { p.fill('#ffe36a'); } };
function buildAtlas() { if (ATL) return; Object.keys(THEMES).forEach(function (k) { var T = THEMES[k]; PAINT['top_' + k] = function (p) { for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) p.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? T.top : T.top2); p.rect(0, 0, 32, 1, shade(T.top, 1.25)); };
    PAINT['side_' + k] = function (p) { p.fill(T.side); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 1, 32, shade(T.side, 0.7)); p.rect(0, 0, 32, 3, shade(T.side, 1.3)); p.speck([shade(T.side, 0.85)], 60); }; });
  ATL = Atlas(13, 1024); Object.keys(PAINT).forEach(function (k) { ATL.add(k, PAINT[k], { flat: k === 'white' || k === 'glow' || k === 'portal' }); }); ATT = R3.texture(ATL.canvas, true); }
function TL(n) { return ATL.tile(n); }
function sheetTex() { if (!SHEETTEX && KIT.sheetReady) SHEETTEX = R3.texture(KIT.sheet); return SHEETTEX; }
function sprRect(n) { var f = KIT.SPR[n], im = KIT.sheet; if (!f || !im || !im.width) return null; return { t: [(f[0] + 0.02) / im.width, (f[1] + 0.02) / im.height, (f[2] - 0.04) / im.width, (f[3] - 0.04) / im.height], w: f[2], h: f[3] }; }
function boxM(m, b, top, side) { var c = [0.5, 0.5, 0.5], sd = [0.4, 0.4, 0.4], w = (b.x1 - b.x0) / 2, d = (b.z1 - b.z0) / 2, h = (b.y1 - b.y0) / 2;
  m.quad([b.x0, b.y1, b.z0], [b.x1, b.y1, b.z0], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1], [0, 0, w, 0, w, d, 0, d], top, c, [0, 1, 0]);
  m.quad([b.x0, b.y0, b.z1], [b.x1, b.y0, b.z1], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1], [0, h, w, h, w, 0, 0, 0], side, sd, [0, 0, 1]); m.quad([b.x1, b.y0, b.z0], [b.x0, b.y0, b.z0], [b.x0, b.y1, b.z0], [b.x1, b.y1, b.z0], [0, h, w, h, w, 0, 0, 0], side, sd, [0, 0, -1]);
  m.quad([b.x1, b.y0, b.z1], [b.x1, b.y0, b.z0], [b.x1, b.y1, b.z0], [b.x1, b.y1, b.z1], [0, h, d, h, d, 0, 0, 0], side, [0.45, 0.45, 0.45], [1, 0, 0]); m.quad([b.x0, b.y0, b.z0], [b.x0, b.y0, b.z1], [b.x0, b.y1, b.z1], [b.x0, b.y1, b.z0], [0, h, d, h, d, 0, 0, 0], side, [0.45, 0.45, 0.45], [-1, 0, 0]); }
function buildMesh() { if (MESH) MESH.free(); var m = new R3.Mesh(), th = LV.theme, top = TL('top_' + th), side = TL('side_' + th);
  LV.boxes.forEach(function (b) { boxM(m, b, top, side); });
  LV.ramps.forEach(function (r) { var c = [0.5, 0.5, 0.5], w = (r.x1 - r.x0) / 2, d = (r.z1 - r.z0) / 2; if (r.ax === 'z') m.quad([r.x0, r.ya, r.z0], [r.x1, r.ya, r.z0], [r.x1, r.yb, r.z1], [r.x0, r.yb, r.z1], [0, 0, w, 0, w, d, 0, d], top, c); else m.quad([r.x0, r.ya, r.z0], [r.x0, r.ya, r.z1], [r.x1, r.yb, r.z1], [r.x1, r.yb, r.z0], [0, 0, d, 0, d, w, 0, w], top, c); });
  LV.springs.forEach(function (s) { boxM(m, { x0: s.x - 0.6, y0: s.y, z0: s.z - 0.6, x1: s.x + 0.6, y1: s.y + 0.35, z1: s.z + 0.6 }, TL('spring'), TL('spring')); });
  LV.pads.forEach(function (d) { m.quad([d.x - 1.2, d.y + 0.03, d.z - 1.2], [d.x + 1.2, d.y + 0.03, d.z - 1.2], [d.x + 1.2, d.y + 0.03, d.z + 1.2], [d.x - 1.2, d.y + 0.03, d.z + 1.2], [1, 1, 0, 1, 0, 0, 1, 0], TL('pad'), [0.5, 0.5, 0.5], [0, 1, 0], 1); });
  LV.loops.forEach(function (L) { var n = 18; for (var i = 0; i < n; i++) { var a0 = i / n * 6.283, a1 = (i + 1) / n * 6.283; function pt(a, s) { return [L.x + s, L.y + L.r - Math.cos(a) * L.r, L.z + Math.sin(a) * L.r]; } m.quad(pt(a0, -1.6), pt(a1, -1.6), pt(a1, 1.6), pt(a0, 1.6), [0, 0, 1, 0, 1, 1, 0, 1], TL('loop'), [0.5, 0.5, 0.5]); } });
  if (LV.goal) boxM(m, { x0: LV.goal.x - 0.4, y0: LV.goal.y, z0: LV.goal.z - 0.4, x1: LV.goal.x + 0.4, y1: LV.goal.y + 1.2, z1: LV.goal.z + 0.4 }, TL('side_' + th), TL('side_' + th));
  MESH = m.upload(); }
function draw() {
  var ctx = KIT.ctx; ctx.clearRect(0, 0, KIT.W, KIT.H);
  if (G.mode === 'garden') { drawGarden(); return; }
  if (G.mode === 'nogl') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, KIT.W, KIT.H); KIT.text('THIS DEVICE CANNOT DRAW 3D (NO WEBGL)', KIT.W / 2, KIT.H / 2, { align: 'center' }); return; }
  if (G.mode === 'say') { drawSay(); return; }
  if (!LV || !P) { if (R3.ok) R3.begin([0.1, 0.02, 0.04]); titleArt(); return; }
  var T = THEMES[LV.theme], p = P, lk = KIT.stick(1);
  CAMS.yaw -= lk.x * 0.04; var mv = Math.hypot(p.vx, p.vz); if (mv > 3 && !lk.on) CAMS.yaw += Math.atan2(Math.sin(Math.atan2(p.vx, p.vz) - CAMS.yaw), Math.cos(Math.atan2(p.vx, p.vz) - CAMS.yaw)) * 0.03;
  var dist = 6 + Math.min(4, mv * 0.15), wx = p.x - Math.sin(CAMS.yaw) * dist, wz = p.z - Math.cos(CAMS.yaw) * dist, wy = p.y + 3.2 + Math.max(0, lk.y) * 2;
  CAMS.x += (wx - CAMS.x) * 0.18; CAMS.y += (wy - CAMS.y) * 0.12; CAMS.z += (wz - CAMS.z) * 0.18;
  var sky = BOSS && BOSS.B.dark ? [0.04, 0, 0.02] : T.sky; R3.begin(sky); R3.setCam([CAMS.x, CAMS.y, CAMS.z], [p.x, p.y + 1.2, p.z], KIT.W < KIT.H ? 1.25 : 1.05);
  R3.scene({ fog: sky, fogR: [30, 110], amb: [0.85, 0.82, 0.8], lights: [], torch: { p: [0, -99, 0], d: [0, 1, 0], c: [0, 0, 0] }, t: G.t });
  R3.draw(MESH, ATT, { lit: false });
  if (!DYN) DYN = new R3.Mesh(); DYN.clear();
  LV.water.forEach(function (w) { var c = T.water || [0.3, 0.6, 0.8]; DYN.quad([w.x0, w.y1, w.z0], [w.x1, w.y1, w.z0], [w.x1, w.y1, w.z1], [w.x0, w.y1, w.z1], [0, 0, (w.x1 - w.x0) / 3, 0, (w.x1 - w.x0) / 3, (w.z1 - w.z0) / 3, 0, (w.z1 - w.z0) / 3], TL('water'), [c[0] * 0.5, c[1] * 0.5, c[2] * 0.5], [0, 1, 0]); });
  if (DYN.n) R3.draw(DYN, ATT, { alpha: 0.55, lit: false });
  var st = sheetTex(); if (!st) { hud(); return; }
  DYN.clear(); var Rr = R3.cam.right;
  function bb(n, x, y, z, hgt, flip, col, rot) { var r = sprRect(n); if (!r) return; var w = hgt * r.w / r.h / 2, uv = flip ? [1, 1, 0, 1, 0, 0, 1, 0] : [0, 1, 1, 1, 1, 0, 0, 0]; DYN.quad([x - Rr[0] * w, y, z - Rr[2] * w], [x + Rr[0] * w, y, z + Rr[2] * w], [x + Rr[0] * w, y + hgt, z + Rr[2] * w], [x - Rr[0] * w, y + hgt, z - Rr[2] * w], uv, r.t, col || [0.5, 0.5, 0.5], [0, 0, 1]); }
  LV.rings.forEach(function (r) { if (!r.got && Math.hypot(r.x - p.x, r.z - p.z) < 70) bb('gr_coin', r.x, r.y - 0.2 + Math.sin(G.t * 3 + r.z) * 0.1, r.z, 0.6); });
  FX.forEach(function (f) { if (f.ring && f.t > 0 && (f.t > 1 || Math.floor(G.t * 10) % 2)) bb('gr_coin', f.x, f.y, f.z, 0.5); });
  LV.items.forEach(function (it) { if (!it.got) bb(['it_cup', 'it_moon', 'it_pie'][it.n], it.x, it.y - 0.4 + Math.sin(G.t * 2) * 0.15, it.z, 1); });
  LV.fronts.forEach(function (f) { bb(f.s, f.x, 0, f.z, 7); });
  LV.npcs.forEach(function (n2) { bb(n2.s, n2.x, 0, n2.z, n2.s === 'steve0' ? 2.4 : 1.8); });
  LV.portals.forEach(function (po) { bb('it_balloon', po.x, 2.6 + Math.sin(G.t * 2 + po.x) * 0.2, po.z, 0.8); });
  LV.foes.forEach(function (e) { if (e.dead && e.dt > 0.3) return; if (Math.hypot(e.x - p.x, e.z - p.z) > 60) return; var fr = e.s + (Math.floor(G.t * 6 + e.hx) % 4); bb(fr, e.x, e.y, e.z, e.dead ? 1.6 * (1 - e.dt * 3) : 1.7, (e.x - p.x) * Rr[0] + (e.z - p.z) * Rr[2] > 0, P.lock.indexOf(e) >= 0 ? [0.7, 0.3, 0.3] : null); });
  if (BOSS && (BOSS.hp > 0 || BOSS.dt < 1.5)) { var b = BOSS, bn = b.B.s.slice(-1) === '_' ? b.B.s + (Math.floor(G.t * 3) % 2) : b.B.s, flash = (b.stun > 0 && Math.floor(G.t * 10) % 2) || b.hitCd > 0.6; bb(bn, b.x, b.y, b.z, b.h * 2, (b.x - p.x) * Rr[0] + (b.z - p.z) * Rr[2] > 0, b.B.dark ? [0.15, 0.05, 0.1] : flash ? [0.9, 0.9, 0.9] : null); }
  // the player
  var C = p.C, n, flipP = (p.vx * Rr[0] + p.vz * Rr[2]) < 0;
  if (p.ball || p.homing > 0) n = (C.jp || C.jumpS) + (C.jp ? Math.floor(G.t * 20) % C.njump : '');
  else if (!p.ground && !p.swim) n = C.jp ? C.jp + (p.vy > 0 ? 1 : 3) : C.jumpS;
  else if (Math.hypot(p.vx, p.vz) > 1) n = C.run + (Math.floor(p.anim * (C.nrun > 4 ? 1.2 : 0.8)) % C.nrun);
  else n = C.idle + (C.nidle > 1 ? Math.floor(G.t * 6) % C.nidle : '0');
  if (C.idle === 'greebo_s' && n === 'greebo_s') n = 'greebo_s0'; if (C.idle === 'spermaid_s' && n === 'spermaid_s') n = 'spermaid_s0';
  if (!(p.inv > 0 && Math.floor(G.t * 16) % 2)) bb(n, p.x, p.y, p.z, C.h * 1.4 * (p.ball ? 0.8 : 1), flipP, C.gold ? [0.75, 0.65, 0.2] : null);
  R3.draw(DYN, st, { lit: false });
  // glows: shots, sparks, portals, the goal
  DYN.clear(); function glow(x, y, z, s, c) { DYN.quad([x - Rr[0] * s, y - s, z - Rr[2] * s], [x + Rr[0] * s, y - s, z + Rr[2] * s], [x + Rr[0] * s, y + s, z + Rr[2] * s], [x - Rr[0] * s, y + s, z - Rr[2] * s], [0, 1, 1, 1, 1, 0, 0, 0], TL('glow'), c, [0, 0, 1], 2); }
  SHOTS.forEach(function (s) { glow(s.x, s.y, s.z, s.mine ? 0.3 : 0.25, s.mine ? [0.6, 0.3, 0.05] : s.pill ? [0.6, 0.2, 0.4] : [0.55, 0.1, 0.1]); });
  FX.forEach(function (f) { if (f.c) { f.vy -= 14 / 60; f.x += f.vx / 60; f.y += f.vy / 60; f.z += f.vz / 60; glow(f.x, f.y, f.z, 0.08, f.c); } if (f.fire) glow(f.x, f.y, f.z, 0.8 * f.t, [0.6, 0.3, 0.05]); if (f.wave) glow(f.x, f.y + 0.2, f.z, 6 * (1 - f.t), [0.3, 0.25, 0.2]); });
  LV.portals.forEach(function (po) { for (var k = 0; k < 6; k++) glow(po.x + Math.cos(G.t + k) * 1.2, 1 + k * 0.3, po.z + Math.sin(G.t + k) * 1.2, 0.2, po.k === 'stage' && storyWants(po) ? [0.6, 0.05, 0.05] : [0.5, 0.45, 0.2]); });
  if (LV.goal) glow(LV.goal.x, LV.goal.y + 2, LV.goal.z, 0.9 + Math.sin(G.t * 4) * 0.1, [0.6, 0.5, 0.2]);
  if (p.who === 'super') glow(p.x, p.y + 0.8, p.z, 1.2, [0.4, 0.35, 0.1]);
  R3.draw(DYN, ATT, { lit: false, add: 1 }); FX.forEach(function (f) { f.t -= 1 / 60; }); FX = FX.filter(function (f) { return f.t > 0; });
  hud();
}
function hud() {
  var Wd = KIT.W, Hd = KIT.H, p = P;
  KIT.spr('gr_coin', 10, 10, { anchor: 'tl' }); KIT.text(String(p.rings), 26, 12, { size: 16, col: p.rings ? '#ffe36a' : (Math.floor(G.t * 4) % 2 ? '#ff2630' : '#ffe36a') });
  if (LV.hub === undefined) { var t = G.time; KIT.text(Math.floor(t / 60) + ':' + ('0' + Math.floor(t % 60)).slice(-2), 10, 32, { size: 8 }); }
  KIT.text(p.C.n + '  x' + SV.lives, 10, Hd - 14, { size: 6, col: p.C.col });
  if (LV.job === 'hunt') { var best = 99; LV.items.forEach(function (it) { if (!it.got) best = Math.min(best, Math.hypot(it.x - p.x, it.y - p.y, it.z - p.z)); }); var lvl = best < 8 ? 3 : best < 18 ? 2 : best < 35 ? 1 : 0; for (var i = 0; i < 3; i++) KIT.R(i < lvl ? ['#4adfff', '#ffe36a', '#ff2630'][i] : '#2a1a1c', Wd / 2 - 24 + i * 18, Hd - 18, 14, 8); KIT.text('RADAR', Wd / 2, Hd - 28, { align: 'center', size: 6, col: '#a6968f' }); }
  if (p.lock.length) KIT.text('LOCKED ' + p.lock.length, Wd / 2, Hd * 0.62, { align: 'center', size: 8, col: '#ff7a20', outline: 1 });
  if (BOSS && BOSS.hp > 0) { var bw = Math.min(260, Wd - 80); KIT.text(BOSS.B.n, Wd / 2, 8, { align: 'center', size: 6 }); KIT.R('#12040a', Wd / 2 - bw / 2 - 1, 17, bw + 2, 6); KIT.R('#c4121c', Wd / 2 - bw / 2, 18, bw * BOSS.hp / BOSS.mhp, 4); }
  if (G.prompt) KIT.text(G.prompt, Wd / 2, Hd * 0.7, { align: 'center', size: 8, outline: 1 });
  if (G.banner) { var a = Math.min(1, G.banner.t, 3 - G.banner.t); if (G.banner.b) KIT.text(G.banner.b, Wd / 2, Hd * 0.3, { align: 'center', size: 6, col: '#a6968f', alpha: a }); KIT.text(G.banner.s, Wd / 2, Hd * 0.3 + 10, { align: 'center', font: 'title', size: 28, col: '#ffe36a', alpha: a, outline: 1 }); }
  if (G.mode === 'clear') KIT.text(LV.job === 'hunt' ? 'ALL THREE FOUND!' : RUN.boss ? 'BOSS DOWN!' : 'STAGE CLEAR!', Wd / 2, Hd * 0.42, { align: 'center', font: 'title', size: 36, col: '#ffe36a', outline: 1 });
}
function titleArt() { var c = KIT.ctx, Wd = KIT.W, Hd = KIT.H; for (var y = 0; y < Hd; y += 6) { c.fillStyle = y < Hd * 0.6 ? 'rgb(' + (40 + y / 3 | 0) + ',8,20)' : '#1a0a10'; c.fillRect(0, y, Wd, 6); } c.fillStyle = '#c4121c'; c.beginPath(); c.arc(Wd * 0.7, 70, 34, 0, 6.3); c.fill(); }
