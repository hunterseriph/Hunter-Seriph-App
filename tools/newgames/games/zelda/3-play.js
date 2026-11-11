/* ---------- the save and the state ---------- */
var SV = KIT.load('lc-save', null);
function freshSave() { return { items: {}, sel: null, hearts: 3, pieces: 0, got: {}, drops: 0, bombs: 0, chal: [], dg: {}, hp: 6, deaths: 0, won: 0, where: { k: 'in', id: 'club' }, seen: {} }; }
if (!SV) SV = freshSave();
if (!SV.where) { SV.where = { k: 'in', id: 'club' }; SV.seen = {}; SV.inDg = null; } // a save from before the land was one place wakes up at home
function persist() { KIT.save('lc-save', SV); }
var G = { mode: 'title', t: 0 }, P = null, SCR = null, FOE = [], SHOT = [], PICK = [], FX = [], BOSS = null, ROOM = null, DG = null, MSGBOX = null, TRANS = null, CAM = { x: 0, y: 0 }, FADE = null;
var SPEED = 124;
function maxHp() { return SV.hearts * 2; }
function SW() { return SCR.w || COLS; } function SH() { return SCR.h || ROWS; }
function tAt(i, j) { if (i < 0 || j < 0 || i >= SW() || j >= SH()) return -1; return SCR.T[j * SW() + i]; }
function tSet(i, j, v) { if (i < 0 || j < 0 || i >= SW() || j >= SH()) return; SCR.T[j * SW() + i] = v; if (SCR.kind === 'world') dirtyChunk(i, j); }
function startGame() { genWorld(); P = { x: 0, y: 0, dir: 'd', hp: SV.hp > 0 ? SV.hp : maxHp(), inv: 0, atk: 0, kx: 0, ky: 0, anim: 0, item: null, hover: 0 }; G.mode = 'play'; KIT.closeMenu();
  var w = SV.where || { k: 'in', id: 'club' };
  if (SV.inDg !== undefined && SV.inDg !== null) enterDungeon(SV.inDg);
  else if (w.k === 'in' && INSIDE[w.id]) enterInside(w.id, w.back);
  else goWorld(w.x || TOWN.home.x, w.y || TOWN.home.y);
  if (!SV.items.sword && !SV.got.intro) { SV.got.intro = 1; say("Cumhead wakes up in the Clubhouse. Blumhead has stolen the five Cum Chalices and the sky over Cum City has gone the wrong red. Amy's Willy Chilli is just up the street. She'll know what to do.", ''); } }
/* ---------- the land ---------- */
function goWorld(x, y) { genWorld(); SV.inDg = null; DG = null; ROOM = null; BOSS = null;
  Object.keys(DOORS).forEach(function (k) { var d = DOORS[k]; if (d.cracked && SV.got['crk:' + d.cracked]) WT[k] = 7; });
  SCR = { kind: 'world', T: WT, w: WW, h: WHT, npcs: worldFolk() }; FOE = []; SHOT = []; PICK = []; SPAWNS.forEach(function (s) { s.live = null; });
  P.x = x; P.y = y; P.lastX = x; P.lastY = y; unstick(P); SV.where = { k: 'world', x: P.x, y: P.y }; camSnap(); G.region = null; regionCheck(true); persist(); }
function worldFolk() { var X = TOWN.x, Y = TOWN.y; return [
  { spr: 'npc_ali', x: (X + 8.5) * TS, y: (Y + 12.6) * TS, name: 'ALI', say: function () { shopAsk('nuggets', "Ali's Garlic Nuggets", 'Nuggets? Garlic bread? Everything is better with garlic. A bag of nuggets mends two hearts.', 5, function () { P.hp = Math.min(maxHp(), P.hp + 4); }); }, wander: 2 },
  { spr: 'npc_judgement', x: (X + 15.2) * TS, y: (Y + 15.6) * TS, name: 'JUDGEMENT', say: function () { say('Light or shadow. Both have a price. ' + hint(), 'JUDGEMENT'); } },
  { spr: 'npc_elden', x: (X + 12) * TS, y: (Y + 24.4) * TS, name: 'ELDEN', say: function () { say("Kaya's on the coffee, I'm on the grill. If you want a Cumpuccino to take with you, you'll need a bottle. She sells those too.", 'ELDEN'); }, wander: 1.5 },
  { spr: 'steve0', sc: 0.42, x: 44.5 * TS, y: 33.4 * TS, name: 'STEVE', say: function () { say('...', 'STEVE'); } },
  { spr: 'npc_stackedfate', x: 25.5 * TS, y: 30 * TS, name: 'STACKED FATE', say: function () { say('The deck was never yours. Neither was your fate. Come into the tent if you want to know what it holds.', 'STACKED FATE'); } }]; }
function camSnap() { var Wd = SW() * TS, Hd = SH() * TS; CAM.x = Wd <= COLS * TS ? 0 : clamp(P.x - COLS * TS / 2, 0, Wd - COLS * TS); CAM.y = Hd <= ROWS * TS ? 0 : clamp(P.y - ROWS * TS / 2 + 10, 0, Hd - ROWS * TS); }
function regionCheck(force) { if (!SCR || SCR.kind !== 'world') return; var q = widx(Math.floor(P.x / TS), Math.floor(P.y / TS)), b = BKEYS[WB[q]]; if (b === 'sea' || b === 'lake') return; if (b === 'peaks' && !force) return;
  if (b !== G.region) { if (G.regionT === undefined || force || G.t - G.regionT > 0.6) { var B = BIOME[b]; G.region = b; G.regionT = G.t; if (B.n && !force) banner(B.n); else if (B.n && force && b !== 'city') banner(B.n); if (B.song && music.current !== B.song) music.play(B.song); } } else G.regionT = G.t; }
/* foes come from spawn points near you, never on screen, and come back a while after you kill them */
function stepSpawns(dt) { if (SCR.kind !== 'world') return; var pi = P.x / TS, pj = P.y / TS;
  SPAWNS.forEach(function (s) { s.cd = Math.max(0, s.cd - dt); var d = Math.hypot(s.i - pi, s.j - pj);
    if (s.live) { if (s.live.hp <= 0) { s.live = null; s.cd = 45; } else if (Math.hypot(s.live.x / TS - pi, s.live.y / TS - pj) > 26) { FOE.splice(FOE.indexOf(s.live), 1); s.live = null; } return; }
    if (s.cd > 0 || d > 20 || d < 6) return; var sx = (s.i + 0.5) * TS - CAM.x, sy = (s.j + 0.5) * TS - CAM.y; if (sx > -24 && sx < COLS * TS + 24 && sy > -24 && sy < ROWS * TS + 24) return;
    var f = mkFoe(s.k, (s.i + 0.5) * TS, (s.j + 0.5) * TS); f.sp = s; s.live = f; FOE.push(f); });
  FOE = FOE.filter(function (f) { return f.hp > 0 || f.hurt > 0; }); }
/* ---------- inside a shop, house or cave ---------- */
function enterInside(id, back) { var I = INSIDE[id](); SV.where = { k: 'in', id: id, back: back }; SV.inDg = null; DG = null; ROOM = null; BOSS = null;
  SCR = { kind: 'in', id: id, T: I.T, w: COLS, h: ROWS, npcs: I.npcs || [], wares: I.wares || [], chest: I.chest || null, lights: I.lights || [], dark: I.dark, label: I.label, style: I.style, bg: I.bg };
  FOE = (I.foes || []).map(function (f) { return mkFoe(f[0], f[1] * TS, f[2] * TS); }); SHOT = []; PICK = [];
  P.x = 10 * TS; P.y = (ROWS - 1.6) * TS; P.dir = 'u'; P.lastX = P.x; P.lastY = P.y; camSnap(); if (I.label) banner(I.label); music.play(I.song || 'town'); persist(); if (I.enter) I.enter(); }
function leaveInside() { var w = SV.where, b = w.back; if (!b) { var d = null; Object.keys(DOORS).forEach(function (k) { if (DOORS[k].to && DOORS[k].to.in === w.id) d = DOORS[k]; }); b = d ? d.back : TOWN.home; } fade(function () { goWorld(b.x, b.y); P.dir = 'd'; }); }
function fade(fn) { FADE = { t: 0, fn: fn, done: 0 }; }
/* ---------- dungeons ---------- */
function enterDungeon(di) { SV.inDg = di; DG = buildDungeon(di); SV.dg[di] = SV.dg[di] || { keys: 0, bk: 0, open: {}, clear: {}, chests: {}, seen: {} }; enterRoom(DG.start, 's'); G.banner = { t: 3, s: DG.D.n }; music.play(DG.D.song); P.x = 10 * TS; P.y = (ROWS - 2) * TS; P.dir = 'u'; }
function leaveDungeon() { var D = DUNGEONS[DG.di], d = null; Object.keys(DOORS).forEach(function (k) { if (DOORS[k].to && DOORS[k].to.dg === DG.di) d = DOORS[k]; }); var b = d ? d.back : TOWN.home; fade(function () { goWorld(b.x, b.y); P.dir = 'd'; }); }
function enterRoom(r, from) {
  ROOM = r; var st = SV.dg[DG.di]; st.seen[r.id] = 1; SCR = { kind: 'dg', T: roomTiles(DG, r), r: r, w: COLS, h: ROWS, npcs: [] }; FOE = []; SHOT = []; PICK = []; BOSS = null;
  if (!st.clear[r.id]) { if (r.type === 'boss') { BOSS = mkBoss(DG.D.boss); music.play(BOSSES[DG.D.boss].song); G.banner = { t: 2.5, s: BOSSES[DG.D.boss].n }; } else r.foes.forEach(function (k, n) { FOE.push(mkFoe(k, (4 + (n * 5) % 12) * TS + 12, (2 + (n * 3) % 5) * TS + 12)); }); if (FOE.length || BOSS) shutDoors(true); }
  if (r.type === 'boss' && st.clear[r.id] && !st.chal) PICK.push({ k: 'chal', x: 10 * TS, y: 5 * TS });
  if (st.clear[r.id] && r.type === 'key' && !st.gotKey) PICK.push({ k: 'key', x: 10 * TS, y: 5 * TS });
  if (st.clear[r.id] && (r.type === 'item' || r.type === 'bkey') && !st.chests[r.id]) PICK.push({ k: 'chest', x: 10 * TS, y: 4.5 * TS, room: r.id, what: r.type });
  if (r.type !== 'boss' && st.clear[r.id] && DG.D.song !== music.current) music.play(DG.D.song);
  var rr = srand(777 + r.x * 13 + r.y * 7 + DG.di * 101); SCR.lights = []; [[2, 1], [COLS - 3, 1], [2, ROWS - 2], [COLS - 3, ROWS - 2]].forEach(function (c) { if (rr() < 0.8) SCR.lights.push({ x: (c[0] + 0.5) * TS, y: (c[1] + 0.3) * TS, r: 80, c: 'rgba(255,140,70,', torch: c[1] === 1 }); });
  camSnap(); FOE.forEach(unstick); }
/* move anyone out of whatever solid thing they arrived in: nearest open tile, searched outwards */
function blocked(o, r) { return solidAt(o.x - r, o.y - r * 0.5) || solidAt(o.x + r, o.y - r * 0.5) || solidAt(o.x - r, o.y + r * 0.6) || solidAt(o.x + r, o.y + r * 0.6) || [3, 23, 29].indexOf(tAt(Math.floor(o.x / TS), Math.floor(o.y / TS))) >= 0; }
function unstick(o) { if (!o || !SCR || !blocked(o, 7)) return; var bi = Math.floor(o.x / TS), bj = Math.floor(o.y / TS);
  for (var rad = 1; rad < 12; rad++) for (var dj = -rad; dj <= rad; dj++) for (var di = -rad; di <= rad; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== rad) continue; var i = bi + di, j = bj + dj; if (i < 1 || j < 1 || i >= SW() - 1 || j >= SH() - 1) continue; var t = { x: (i + 0.5) * TS, y: (j + 0.5) * TS }; if (!blocked(t, 7)) { o.x = t.x; o.y = t.y; o.lastX = o.x; o.lastY = o.y; return; } } }
function shutDoors(on) { for (var q = 0; q < SCR.T.length; q++) { if (on && SCR.T[q] === 24) SCR.T[q] = 27; else if (!on && SCR.T[q] === 27) SCR.T[q] = 24; } if (on) sfx.play('door'); }
function roomCleared() { var st = SV.dg[DG.di]; st.clear[ROOM.id] = 1; shutDoors(false); sfx.play('magic'); persist();
  if (ROOM.type === 'key' && !st.gotKey) { PICK.push({ k: 'key', x: 10 * TS, y: 5 * TS }); }
  if ((ROOM.type === 'item' || ROOM.type === 'bkey') && !st.chests[ROOM.id]) PICK.push({ k: 'chest', x: 10 * TS, y: 4.5 * TS, room: ROOM.id, what: ROOM.type });
  if (ROOM.type === 'boss') { PICK.push({ k: 'heartc', x: 8 * TS, y: 5 * TS }); PICK.push({ k: 'chal', x: 12 * TS, y: 5 * TS }); music.stop(1); } }
/* ---------- foes ---------- */
function mkFoe(k, x, y) { var d = FOES[k]; return { k: k, d: d, x: x, y: y, hp: d.hp, vx: 0, vy: 0, t: Math.random() * 2, dir: 0, hurt: 0, stun: 0, cd: 1 + Math.random() }; }
function mkBoss(k) { var B = BOSSES[k]; return { k: k, B: B, x: 10 * TS, y: 3 * TS, hp: B.hp, mhp: B.hp, st: 'idle', t: 0, mi: 0, hurt: 0, marks: [], vx: 0, vy: 0, r: 22 }; }
function solidAt(x, y, flyer, who) { var i = Math.floor(x / TS), j = Math.floor(y / TS), t = tAt(i, j); if (t < 0) return true;
  if (flyer) return t === 21 || t === 1 || t === 6 || t === 34 || t === 39 || t === 51 || t === 61 || t === 69;
  if (t === 23) return true; if (SOLID[t]) return true;
  if (who === P && SCR.npcs) for (var n = 0; n < SCR.npcs.length; n++) { var c = SCR.npcs[n]; if (Math.abs(x - c.x) < 9 && y > c.y - 12 && y < c.y + 3) return true; }
  return false; }
function moveBox(o, dx, dy, r, flyer) { function hit() { return solidAt(o.x - r, o.y - r * 0.5, flyer, o) || solidAt(o.x + r, o.y - r * 0.5, flyer, o) || solidAt(o.x - r, o.y + r * 0.6, flyer, o) || solidAt(o.x + r, o.y + r * 0.6, flyer, o); }
  o.x += dx; if (hit()) { o.x -= dx; o.bump = 1; if (o === P && dx && !dy) slide(o, dx, r, flyer, 'x'); } o.y += dy; if (hit()) { o.y -= dy; o.bump = 1; if (o === P && dy && !dx) slide(o, dy, r, flyer, 'y'); } }
/* corner slip: walking into the edge of something nudges you round it, so you don't snag on every tree */
function slide(o, d, r, flyer, ax) { for (var s = 1; s <= 9; s++) for (var sg = -1; sg <= 1; sg += 2) { var ox = o.x, oy = o.y; if (ax === 'x') { o.y += sg * s; o.x += d; } else { o.x += sg * s; o.y += d; }
  var bad = solidAt(o.x - r, o.y - r * 0.5, flyer, o) || solidAt(o.x + r, o.y - r * 0.5, flyer, o) || solidAt(o.x - r, o.y + r * 0.6, flyer, o) || solidAt(o.x + r, o.y + r * 0.6, flyer, o); o.x = ox; o.y = oy;
  if (!bad) { if (ax === 'x') o.y += sg * Math.min(s, 1.2); else o.x += sg * Math.min(s, 1.2); return; } } }
function stepFoes(dt) {
  FOE.forEach(function (f) {
    var d = f.d, dx = P.x - f.x, dy = P.y - f.y, dist = Math.hypot(dx, dy) || 1; f.t += dt; f.hurt = Math.max(0, f.hurt - dt); f.cd -= dt;
    if (f.hp <= 0) return; if (f.stun > 0) { f.stun -= dt; return; } if (f.kb) { moveBox(f, f.kx * dt, f.ky * dt, 8, d.ai === 'fly'); f.kb -= dt; if (f.kb <= 0) f.kb = 0; return; }
    var sp = d.spd * dt, wild = SCR.kind === 'world', aware = !wild || dist < 170 || f.angry;
    if (wild && dist < 170) f.angry = 1; if (wild && dist > 300) f.angry = 0;
    if (!aware) { if (f.t > 2 || f.bump) { f.t = 0; f.bump = 0; var a0 = Math.floor(Math.random() * 5); f.mx = [1, -1, 0, 0, 0][a0]; f.my = [0, 0, 1, -1, 0][a0]; } moveBox(f, (f.mx || 0) * sp * 0.5, (f.my || 0) * sp * 0.5, 8, d.ai === 'fly'); }
    else if (d.ai === 'chase') moveBox(f, dx / dist * sp, dy / dist * sp, 8);
    else if (d.ai === 'fly') { moveBox(f, dx / dist * sp + Math.sin(f.t * 3) * 0.5, dy / dist * sp + Math.cos(f.t * 2.4) * 0.5, 6, true); }
    else if (d.ai === 'hop') { if (f.t % 1.2 < 0.5) moveBox(f, dx / dist * sp * 2, dy / dist * sp * 2, 8); }
    else if (d.ai === 'wander' || d.ai === 'shoot') { if (f.t > 1.5 || f.bump) { f.t = 0; f.bump = 0; var a = Math.floor(Math.random() * 4); f.mx = [1, -1, 0, 0][a]; f.my = [0, 0, 1, -1][a]; } moveBox(f, (f.mx || 0) * sp, (f.my || 0) * sp, 8);
      if (d.ai === 'shoot' && f.cd <= 0 && dist < 200) { f.cd = 2 + Math.random(); SHOT.push({ x: f.x, y: f.y, vx: dx / dist * 120, vy: dy / dist * 120, t: 3, dmg: d.dmg, foe: 1 }); sfx.play('shoot'); } }
    else if (d.ai === 'charge') { if (!f.ch && f.cd <= 0 && (Math.abs(dx) < 12 || Math.abs(dy) < 12)) { f.ch = 0.8; f.cx = Math.abs(dx) < 12 ? 0 : Math.sign(dx); f.cy = Math.abs(dx) < 12 ? Math.sign(dy) : 0; } if (f.ch) { moveBox(f, f.cx * 170 * dt, f.cy * 170 * dt, 8); f.ch -= dt; if (f.ch <= 0 || f.bump) { f.ch = 0; f.bump = 0; f.cd = 1.2; } } else moveBox(f, Math.sign(dx) * sp * 0.5, Math.sign(dy) * sp * 0.5, 8); }
    // no walking through Cumhead: touching him hurts him and bounces the foe back off
    dx = P.x - f.x; dy = P.y - f.y; dist = Math.hypot(dx, dy) || 1;
    if (dist < 16) { if (P.inv <= 0) hurtP(d.dmg, f.x, f.y); moveBox(f, -dx / dist * (16 - dist), -dy / dist * (16 - dist), 8, d.ai === 'fly'); }
  });
  // and foes don't stack up on each other
  for (var a = 0; a < FOE.length; a++) for (var b = a + 1; b < FOE.length; b++) { var A = FOE[a], B = FOE[b]; if (A.hp <= 0 || B.hp <= 0) continue; var ex = B.x - A.x, ey = B.y - A.y, e = Math.hypot(ex, ey); if (e > 0.01 && e < 15) { var push = (15 - e) / 2; moveBox(A, -ex / e * push, -ey / e * push, 8, A.d.ai === 'fly'); moveBox(B, ex / e * push, ey / e * push, 8, B.d.ai === 'fly'); } }
  SHOT.forEach(function (s) { s.t -= dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.foe && Math.hypot(s.x - P.x, s.y - P.y) < 10) { if ((P.atk > 0 || SV.items.condom) && facingShot(s)) { s.t = 0; sfx.play('no'); } else { hurtP(s.dmg, s.x - s.vx, s.y - s.vy); s.t = 0; } }
    if (!s.foe) { FOE.forEach(function (f) { if (f.hp > 0 && Math.hypot(f.x - s.x, f.y - s.y) < 12) { hitFoe(f, s.dmg, s.x - s.vx * 0.1, s.y - s.vy * 0.1); s.t = 0; } }); if (BOSS && BOSS.hp > 0 && Math.hypot(BOSS.x - s.x, BOSS.y - s.y) < BOSS.r) { hitBoss(s.dmg); s.t = 0; } }
    if (solidAt(s.x, s.y, true)) s.t = 0; });
  SHOT = SHOT.filter(function (s) { return s.t > 0; });
}
function facingShot(s) { var dx = s.x - P.x, dy = s.y - P.y; return (P.dir === 'r' && dx > 0) || (P.dir === 'l' && dx < 0) || (P.dir === 'd' && dy > 0) || (P.dir === 'u' && dy < 0); }
function hitFoe(f, dmg, fx, fy, stun) {
  if (f.d.shield && !stun) { if (f.hurt <= 0 && Math.random() < 0.5) { sfx.play('no'); f.kb = 0.15; var a0 = Math.atan2(f.y - fy, f.x - fx); f.kx = Math.cos(a0) * 120; f.ky = Math.sin(a0) * 120; return; } }
  if (stun && f.d.hp <= 1) dmg = 1; else if (stun) { f.stun = 2; sfx.play('tick'); if (!dmg) return; }
  f.hp -= dmg; f.hurt = 0.25; f.angry = 1; var a = Math.atan2(f.y - fy, f.x - fx); f.kb = 0.18; f.kx = Math.cos(a) * 180; f.ky = Math.sin(a) * 180; sfx.play('hit');
  if (f.hp <= 0) { sfx.play(f.d.pop ? 'splat' : 'hit'); for (var i = 0; i < 8; i++) FX.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, t: 0.4, col: f.d.pop ? ['#ff2630', '#ffe36a', '#4adfff'][i % 3] : '#f1e7d0' });
    var r = Math.random(); if (r < 0.35) PICK.push({ k: 'drop', x: f.x, y: f.y, n: Math.random() < 0.2 ? 5 : 1, t: 9 }); else if (r < 0.5) PICK.push({ k: 'heart', x: f.x, y: f.y, t: 9 }); else if (r < 0.57 && SV.items.bombs) PICK.push({ k: 'bomb', x: f.x, y: f.y, t: 9 });
    if (SCR.kind === 'dg' && FOE.every(function (o) { return o.hp <= 0; }) && !BOSS) roomCleared(); }
}
function hurtP(dmg, fx, fy) { if (P.inv > 0 || G.pillInv > 0) return; P.hp -= SV.items.ring ? Math.max(1, Math.ceil(dmg / 2)) : dmg; P.inv = 1; var a = Math.atan2(P.y - fy, P.x - fx); P.kx = Math.cos(a) * 200; P.ky = Math.sin(a) * 200; P.kb = 0.15; sfx.play('hurt'); KIT.shake(4); if (P.hp <= 0) { if (SV.bottle === 'full') { SV.bottle = 'empty'; P.hp = maxHp(); banner('THE CUMPUCCINO SAVED YOU'); sfx.play('power'); persist(); } else die(); } }
/* ---------- bosses ---------- */
function stepBoss(dt) {
  var b = BOSS; if (!b || b.hp <= 0) return; b.t += dt; b.hurt = Math.max(0, b.hurt - dt); var B = b.B, dx = P.x - b.x, dy = P.y - b.y, dist = Math.hypot(dx, dy) || 1, ph2 = b.hp < b.mhp / 2, sp = ph2 ? 1.3 : 1;
  if (b.stun > 0) { b.stun -= dt; return; }
  if (b.st === 'idle') { b.x += dx / dist * 30 * dt * sp; b.y += dy / dist * 20 * dt * sp; if (b.t > 1.4 / sp) { b.st = B.moves[b.mi++ % B.moves.length]; b.t = 0; b.n = 0; if (b.st === 'spears') { b.marks = []; for (var i = 0; i < (ph2 ? 5 : 3); i++) b.marks.push({ x: P.x + (Math.random() - 0.5) * 120, y: P.y + (Math.random() - 0.5) * 80, t: 0.8 + i * 0.3 }); } } }
  else if (b.st === 'ring') { if (b.t > 0.5 && !b.n) { b.n = 1; for (var k = 0; k < (ph2 ? 14 : 10); k++) { var a = k / (ph2 ? 14 : 10) * 6.283; SHOT.push({ x: b.x, y: b.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, t: 3, dmg: 2, foe: 1 }); } sfx.play('shoot'); } if (b.t > 1.2) { b.st = 'idle'; b.t = 0; } }
  else if (b.st === 'aim' || b.st === 'coins') { if (b.t > 0.4 + b.n * 0.3 && b.n < 3) { b.n++; SHOT.push({ x: b.x, y: b.y, vx: dx / dist * 170, vy: dy / dist * 170, t: 3, dmg: 2, foe: 1 }); sfx.play('shoot'); } if (b.t > 1.6) { b.st = 'idle'; b.t = 0; } }
  else if (b.st === 'charge' || b.st === 'dive') { if (b.t < 0.6) { b.cx = dx / dist; b.cy = dy / dist; } else { b.x += b.cx * 260 * dt * sp; b.y += b.cy * 260 * dt * sp; if (b.x < TS * 2 || b.x > (COLS - 2) * TS || b.y < TS * 2 || b.y > (ROWS - 2) * TS || b.t > 1.6) { b.x = clamp(b.x, TS * 2, (COLS - 2) * TS); b.y = clamp(b.y, TS * 2, (ROWS - 2) * TS); b.st = 'idle'; b.t = -0.4; KIT.shake(6); sfx.play('boom'); } } }
  else if (b.st === 'spears') { b.marks.forEach(function (m) { m.t -= dt; if (m.t <= 0 && !m.done) { m.done = 1; if (Math.hypot(P.x - m.x, P.y - m.y) < 18) hurtP(2, m.x, m.y); FX.push({ k: 'spear', x: m.x, y: m.y, t: 0.4 }); sfx.play('hit'); } }); if (b.marks.every(function (m) { return m.done; })) { b.st = 'idle'; b.t = 0; b.marks = []; } }
  else if (b.st === 'summon') { if (!b.n) { b.n = 1; for (var s = 0; s < 3; s++) FOE.push(mkFoe('blumling', b.x + (s - 1) * 30, b.y + 30)); } if (b.t > 1) { b.st = 'idle'; b.t = 0; } }
  if (dist < b.r && P.inv <= 0) hurtP(2, b.x, b.y);
  if (dist < b.r + 2) { P.x = b.x + dx / dist * (b.r + 2); P.y = b.y + dy / dist * (b.r + 2); }
}
function hitBoss(dmg, stun) { var b = BOSS; if (stun) { b.stun = 1.2; sfx.play('tick'); return; } b.hp -= dmg; b.hurt = 0.2; sfx.play('hit'); if (b.hp <= 0) { b.hp = 0; BOSS = null; KIT.shake(12); sfx.play('win'); for (var i = 0; i < 30; i++) FX.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 240, vy: (Math.random() - 0.5) * 240, t: 0.8, col: '#ff2630' }); FOE.forEach(function (f) { f.hp = 0; }); roomCleared(); if (DG.di === DUNGEONS.length - 1) setTimeout(ending, 2500); } }
/* ---------- Cumhead ---------- */
var DIRV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
function swingDmg() { return 1 + (SV.items.sharp ? 1 : 0) + (SV.won ? 1 : 0); }
function stepPlayer(dt) {
  var p = P, mv = KIT.stick(0); p.inv = Math.max(0, p.inv - dt); p.atk = Math.max(0, p.atk - dt); p.hover = Math.max(0, p.hover - dt); G.pillInv = Math.max(0, (G.pillInv || 0) - dt);
  if (p.kb > 0) { p.kb -= dt; moveBox(p, p.kx * dt, p.ky * dt, 7); return; }
  var vx = Math.abs(mv.x) > 0.3 ? Math.sign(mv.x) : 0, vy = Math.abs(mv.y) > 0.3 ? Math.sign(mv.y) : 0; p.moving = !!(vx || vy);
  if (p.atk <= 0) { if (vx || vy) { if (vx && (!vy || Math.abs(mv.x) > Math.abs(mv.y))) p.dir = vx > 0 ? 'r' : 'l'; else p.dir = vy > 0 ? 'd' : 'u'; } var sp = SPEED * (G.pillFast > 0 ? 1.4 : 1) * dt * (vx && vy ? 0.74 : 1);
    if (p.hover > 0) { SOLID[23] = 0; SOLID[29] = 0; SOLID[3] = 0; } moveBox(p, vx * sp, vy * sp, 7); if (p.hover > 0) { SOLID[23] = 1; SOLID[29] = 1; SOLID[3] = 1; } if (vx || vy) p.anim += dt * 9; }
  G.pillFast = Math.max(0, (G.pillFast || 0) - dt);
  // the sea and deep water, once the balloon runs out
  var ti = Math.floor(p.x / TS), tj = Math.floor(p.y / TS), tt = tAt(ti, tj); if ((tt === 23 || tt === 29 || tt === 3) && p.hover <= 0) { p.hp -= 1; p.x = p.lastX; p.y = p.lastY; p.inv = 1; sfx.play('hurt'); if (p.hp <= 0) die(); } else if (tt !== 23 && tt !== 29 && tt !== 3) { p.lastX = p.x; p.lastY = p.y; }
  if (KIT.pressed('a') && p.atk <= 0 && interact()) {} else if (KIT.pressed('a') && SV.items.sword && p.atk <= 0) { p.atk = 0.24; sfx.play('step'); sfx.tone('triangle', 400, 150, 0.1, 0.04); var v = DIRV[p.dir], hx = p.x + v[0] * 18, hy = p.y + v[1] * 18;
    FOE.forEach(function (f) { if (f.hp > 0 && Math.hypot(f.x - hx, f.y - hy) < 22) hitFoe(f, swingDmg(), p.x, p.y); }); if (BOSS && Math.hypot(BOSS.x - hx, BOSS.y - hy) < BOSS.r + 10) hitBoss(swingDmg());
    [[0, 0], [v[1] * 10, v[0] * 10], [-v[1] * 10, -v[0] * 10]].forEach(function (o) { var bi = Math.floor((hx + o[0]) / TS), bj = Math.floor((hy + o[1]) / TS), bt = tAt(bi, bj); if (bt === 5 || bt === 42 || bt === 52) cutBush(bi, bj, bt); }); }
  else if (KIT.pressed('a') && !SV.items.sword && p.atk <= 0) { if (!MSGBOX) say("Cumhead has nothing to swing. Amy's Willy Chilli is up the street from the Clubhouse.", ''); }
  if (KIT.pressed('b') && p.atk <= 0) useItem();
  if (KIT.pressed('y') || KIT.pressed('x')) cycleItem();
  // pickups
  PICK.forEach(function (k) { if (k.t !== undefined) { k.t -= dt; } if (k.got || Math.hypot(k.x - p.x, k.y - p.y) > 16) return;
    if (k.k === 'chest') { k.got = 1; openChest(k); return; }
    k.got = 1; sfx.play('coin');
    if (k.k === 'drop') SV.drops = Math.min(999, SV.drops + (k.n || 1)); else if (k.k === 'heart') p.hp = Math.min(maxHp(), p.hp + 2); else if (k.k === 'bomb') SV.bombs = Math.min(bombMax(), SV.bombs + 2);
    else if (k.k === 'key') { SV.dg[DG.di].keys++; SV.dg[DG.di].gotKey = 1; banner('A SMALL KEY'); }
    else if (k.k === 'heartc') { SV.hearts++; p.hp = maxHp(); banner('HEART CONTAINER'); sfx.play('power'); }
    else if (k.k === 'chal') { SV.dg[DG.di].chal = 1; if (SV.chal.indexOf(DG.di) < 0) SV.chal.push(DG.di); sfx.play('win'); banner('CUM CHALICE ' + SV.chal.length + ' OF 5'); persist(); setTimeout(function () { if (G.mode === 'play' && DG) leaveDungeon(); }, 2200); }
    persist(); });
  PICK = PICK.filter(function (k) { return !k.got && (k.t === undefined || k.t > 0); });
  if (SCR.kind === 'world') stepWorldBits(dt);
  else if (SCR.kind === 'in') { if (p.y > (ROWS - 1.25) * TS && tAt(Math.floor(p.x / TS), ROWS - 1) === 70 && p.dir === 'd' && !FADE) leaveInside(); p.x = clamp(p.x, 4, COLS * TS - 4); p.y = clamp(p.y, 4, ROWS * TS - 4); }
  else stepDungeonDoors(p);
  if (SCR.kind === 'world') { p.x = clamp(p.x, 8, WW * TS - 8); p.y = clamp(p.y, 8, WHT * TS - 8); }
}
function cutBush(bi, bj, bt) { tSet(bi, bj, SCR.kind === 'world' && WB[widx(bi, bj)] === 1 ? 36 : 0); sfx.play('step'); for (var i = 0; i < 6; i++) FX.push({ x: (bi + 0.5) * TS, y: (bj + 0.5) * TS, vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100, t: 0.4, col: bt === 42 ? ['#c8b070', '#6a5a2a'][i % 2] : ['#ff2630', '#2e1216'][i % 2] }); if (Math.random() < (bt === 5 ? 0.3 : 0.12)) PICK.push({ k: Math.random() < 0.55 ? 'drop' : 'heart', x: (bi + 0.5) * TS, y: (bj + 0.5) * TS, n: 1, t: 9 }); }
function stepWorldBits(dt) { var p = P;
  // walk up into a door, a cave mouth or a dungeon gate to go in
  if (p.dir === 'u' && !FADE) { var di = Math.floor(p.x / TS), dj = Math.floor((p.y - 11) / TS), q = widx(di, dj), D = DOORS[q], t = WT[q];
    if (D && (t === 7 || t === 8 || t === 40) && Math.abs(p.x - (di + 0.5) * TS) < 13 && p.moving) {
      if (D.to.dg !== undefined) { var DD = DUNGEONS[D.to.dg]; if (DD.seal && SV.chal.length < DD.seal) { if (!MSGBOX) { say('A seal of goo covers the gate. It wants ' + DD.seal + ' Cum Chalices. You have ' + SV.chal.length + '.'); p.y += 6; } } else { var dgi = D.to.dg; fade(function () { enterDungeon(dgi); }); } }
      else { var id = D.to.in; fade(function () { enterInside(id, D.back); }); } }
    else if (D && t === 12 && Math.abs(p.x - (di + 0.5) * TS) < 13 && p.moving && !MSGBOX) { say('A crack in the rock. Something hollow behind it. A bomb would open it.'); p.y += 6; } }
  // heart pieces lying out in the land
  WITEMS.forEach(function (it) { if (SV.got['wp:' + it.id]) return; if (Math.hypot((it.i + 0.5) * TS - p.x, (it.j + 0.5) * TS - p.y) < 14) { SV.got['wp:' + it.id] = 1; givePiece(); } });
  SV.where = { k: 'world', x: p.x, y: p.y }; var ck = Math.floor(p.x / TS / 16) + ',' + Math.floor(p.y / TS / 10); if (!SV.seen[ck]) { SV.seen[ck] = 1; persist(); }
  regionCheck(); }
function givePiece() { SV.pieces++; if (SV.pieces >= 2) { SV.pieces = 0; SV.hearts++; P.hp = maxHp(); banner('HEART CONTAINER'); } else banner('A PIECE OF HEART (2 MAKE A HEART)'); sfx.play('power'); persist(); }
function stepDungeonDoors(p) {
  var st = SV.dg[DG.di], r = ROOM;
  var side = p.y < TS * 1.2 ? 'n' : p.y > (ROWS - 1.2) * TS ? 's' : p.x < TS * 1.2 ? 'w' : p.x > (COLS - 1.2) * TS ? 'e' : null;
  if (side && r.doors[side]) { var v = r.doors[side], k = r.id + side, isOpen = v === 'open' || st.open[k];
    if (v === 'exit' && side === 's') { if (!FADE) leaveDungeon(); return; }
    if (!isOpen && v === 'locked' && st.keys > 0 && FOE.every(function (f) { return f.hp <= 0; })) { st.keys--; openDoor(r, side); sfx.play('door'); }
    else if (!isOpen && v === 'boss' && st.bk) { openDoor(r, side); sfx.play('door'); }
    else if (!isOpen && !MSGBOX && p.hp > 0) { say(v === 'boss' ? 'A great door with a skull lock. It needs the Boss Key.' : 'Locked. It needs a small key.'); p.y += side === 'n' ? 10 : side === 's' ? -10 : 0; p.x += side === 'w' ? 10 : side === 'e' ? -10 : 0; }
    var edge = p.y < 4 || p.y > ROWS * TS - 4 || p.x < 4 || p.x > COLS * TS - 4;
    if (edge && (isOpen || st.open[k]) && FOE.every(function (f) { return f.hp <= 0; }) && !BOSS) { var d2 = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[side], nr = DG.rooms[(r.x + d2[0]) + ',' + (r.y + d2[1])]; if (nr) { TRANS = { dx: d2[0], dy: d2[1], t: 0, from: SCR }; enterRoom(nr, side); p.x = d2[0] > 0 ? 14 : d2[0] < 0 ? COLS * TS - 14 : p.x; p.y = d2[1] > 0 ? 14 : d2[1] < 0 ? ROWS * TS - 14 : p.y; } } }
  p.x = clamp(p.x, 4, COLS * TS - 4); p.y = clamp(p.y, 4, ROWS * TS - 4);
}
function openDoor(r, side) { var st = SV.dg[DG.di], d = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[side], o = { n: 's', s: 'n', w: 'e', e: 'w' }[side], nr = DG.rooms[(r.x + d[0]) + ',' + (r.y + d[1])]; st.open[r.id + side] = 1; if (nr) st.open[nr.id + o] = 1; SCR.T = roomTiles(DG, r); persist(); }
function openChest(k) { if (k.inside) { k.inside(); return; } var st = SV.dg[DG.di]; st.chests[k.room] = 1; if (k.what === 'bkey') { st.bk = 1; banner('THE BOSS KEY'); } else { var it = DG.D.item; if (it) { SV.items[it] = 1; if (!SV.sel) SV.sel = it; banner(ITEMS[it].n.toUpperCase()); say(ITEMS[it].n + '! ' + ITEMS[it].d); } } sfx.play('power'); persist(); }
function cycleItem() { var own = ['bombs', 'bread', 'pistol', 'balloon', 'bottle'].filter(function (k) { return k === 'bottle' ? SV.bottle : SV.items[k]; }); if (!own.length) return; var i = own.indexOf(SV.sel); SV.sel = own[(i + 1) % own.length]; sfx.play('blip'); }
function bombMax() { return SV.items.bigbag ? 16 : 8; }
function useItem() {
  var p = P, it = SV.sel, v = DIRV[p.dir]; if (!it) return;
  if (it === 'bombs') { if (SV.bombs <= 0) { sfx.play('no'); return; } SV.bombs--; FX.push({ k: 'bomb', x: p.x + v[0] * 16, y: p.y + v[1] * 16, t: 1.4 }); }
  else if (it === 'bread') { if (SHOT.some(function (s) { return s.bread; })) return; SHOT.push({ x: p.x, y: p.y, vx: v[0] * 230, vy: v[1] * 230, t: 1.2, bread: 1, dmg: 0, back: 0 }); sfx.play('shoot'); }
  else if (it === 'pistol') { if (SV.drops <= 0) { sfx.play('no'); return; } SV.drops--; SHOT.push({ x: p.x + v[0] * 10, y: p.y + v[1] * 10, vx: v[0] * 300, vy: v[1] * 300, t: 1, dmg: 2 }); sfx.play('shoot'); }
  else if (it === 'balloon') { p.hover = 1.6; sfx.play('magic'); }
  else if (it === 'bottle') { if (SV.bottle !== 'full') { sfx.play('no'); if (!MSGBOX) say('The bottle is empty. Kaya fills it at the Cum Café.'); return; } SV.bottle = 'empty'; P.hp = maxHp(); sfx.play('pour'); banner('CUMPUCCINO! ALL HEARTS BACK'); persist(); }
}
function stepBits(dt) {
  SHOT.forEach(function (s) { if (!s.bread) return; s.t2 = (s.t2 || 0) + dt; if (s.t2 > 0.45 && !s.back) s.back = 1; if (s.back) { var dx = P.x - s.x, dy = P.y - s.y, d = Math.hypot(dx, dy) || 1; s.vx = dx / d * 240; s.vy = dy / d * 240; if (d < 10) s.t = 0; s.t = Math.max(s.t, 0.1); }
    FOE.forEach(function (f) { if (f.hp > 0 && Math.hypot(f.x - s.x, f.y - s.y) < 14) { hitFoe(f, f.d.hp <= 1 ? 1 : 0, s.x, s.y, true); s.back = 1; } }); if (BOSS && Math.hypot(BOSS.x - s.x, BOSS.y - s.y) < BOSS.r) { hitBoss(0, true); s.back = 1; }
    PICK.forEach(function (k) { if ((k.k === 'drop' || k.k === 'heart' || k.k === 'key' || k.k === 'bomb') && Math.hypot(k.x - s.x, k.y - s.y) < 14) { k.x = s.x; k.y = s.y; } }); });
  FX.forEach(function (f) { if (f.k === 'bomb') { f.t -= dt; if (f.t <= 0 && !f.boom) { f.boom = 1; sfx.play('boom'); KIT.shake(8); for (var i = 0; i < 16; i++) FX.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, t: 0.5, col: ['#ffe36a', '#ff7a2a', '#c4121c'][i % 3] });
        FOE.forEach(function (e) { if (Math.hypot(e.x - f.x, e.y - f.y) < 40) hitFoe(e, 4, f.x, f.y); }); if (BOSS && Math.hypot(BOSS.x - f.x, BOSS.y - f.y) < 50) hitBoss(4); if (Math.hypot(P.x - f.x, P.y - f.y) < 30) hurtP(2, f.x, f.y);
        var ci = Math.floor(f.x / TS), cj = Math.floor(f.y / TS); for (var dj = -2; dj <= 2; dj++) for (var di = -2; di <= 2; di++) { var x = ci + di, y = cj + dj, t = tAt(x, y); if (Math.hypot((x + 0.5) * TS - f.x, (y + 0.5) * TS - f.y) > 34) continue;
          if (t === 2 || t === 5) tSet(x, y, 0); if (t === 12 && SCR.kind === 'world') { var D = DOORS[widx(x, y)]; if (D && D.cracked) { tSet(x, y, 7); SV.got['crk:' + D.cracked] = 1; sfx.play('magic'); banner('A SECRET CAVE'); persist(); } } } } } });
}
function banner(s) { G.banner = { t: 2.6, s: s }; }
function say(s, who) { MSGBOX = { s: s, who: who || '', t: 0 }; }
function die() { G.mode = 'dead'; G.deadT = 0; SV.deaths++; music.stop(1); sfx.play('lose'); }
