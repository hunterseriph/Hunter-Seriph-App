/* ---------- the save and the state ---------- */
var SV = KIT.load('lc-save', null);
function freshSave() { return { v: 135, items: {}, sel: null, hearts: 3, pieces: 0, got: {}, drops: 0, bombs: 0, chal: [], dg: {}, hp: 6, deaths: 0, won: 0, where: { k: 'in', id: 'club' }, seen: {}, inDg: null }; }
if (!SV) SV = freshSave();
if (SV.v !== 135) { SV.v = 135; SV.where = { k: 'in', id: 'club' }; SV.seen = {}; SV.inDg = null; var keepChal = SV.chal || []; SV.dg = {}; keepChal.forEach(function (d) { SV.dg[d] = { keys: 0, bk: 1, open: {}, clear: {}, chests: {}, seen: {}, chal: 1 }; }); SV.got = SV.got || {}; } // the land and the dungeons were rebuilt in update 135: wake up at home, keep everything carried
function persist() { KIT.save('lc-save', SV); }
var G = { mode: 'title', t: 0 }, P = null, SCR = null, FOE = [], SHOT = [], PICK = [], FX = [], BOSS = null, ROOM = null, DG = null, MSGBOX = null, CAM = { x: 0, y: 0 }, FADE = null;
var SPEED = 128;
function maxHp() { return SV.hearts * 2; }
function SW() { return SCR.w || COLS; } function SH() { return SCR.h || ROWS; }
function tAt(i, j) { if (i < 0 || j < 0 || i >= SW() || j >= SH()) return -1; return SCR.T[j * SW() + i]; }
function tSet(i, j, v) { if (i < 0 || j < 0 || i >= SW() || j >= SH()) return; SCR.T[j * SW() + i] = v; dirtyChunk(i, j); dirtyChunk(i, j + 1); dirtyChunk(i, j - 1); dirtyChunk(i - 1, j); dirtyChunk(i + 1, j); }
function setQ(q, v) { tSet(q % SW(), Math.floor(q / SW()), v); }
function startGame() { genWorld(); P = { x: 0, y: 0, dir: 'd', hp: SV.hp > 0 ? SV.hp : maxHp(), inv: 0, atk: 0, kx: 0, ky: 0, anim: 0, hover: 0, push: 0 }; G.mode = 'play'; KIT.closeMenu();
  var w = SV.where || { k: 'in', id: 'club' };
  if (SV.inDg !== undefined && SV.inDg !== null) enterDungeon(SV.inDg);
  else if (w.k === 'in' && INSIDE[w.id]) enterInside(w.id, w.back);
  else goWorld(w.x || TOWN.home.x, w.y || TOWN.home.y);
  if (!SV.items.sword && !SV.got.intro) { SV.got.intro = 1; say("Cumhead wakes up in the Clubhouse. Blumhead has stolen the five Cum Chalices and the sky over Cum City has gone the wrong red. Amy's Willy Chilli is on the same street. She'll know what to do.", ''); } }
/* ---------- the land ---------- */
function goWorld(x, y) { genWorld(); SV.inDg = null; DG = null; ROOM = null; BOSS = null;
  SCR = { kind: 'world', T: WT, w: WW, h: WHT, npcs: worldFolk(), key: 'w' }; FOE = []; SHOT = []; PICK = []; SPAWNS.forEach(function (s) { s.live = null; });
  GATES.forEach(function (g) { if (SV.got['g:' + g.id]) openGate(g, true); });
  P.x = x; P.y = y; P.safeX = x; P.safeY = y; P.hop = null; P.fall = 0; unstick(P); SV.where = { k: 'world', x: P.x, y: P.y }; camSnap(); G.area = null; areaCheck(); persist(); }
function worldFolk() { var X = TOWN.x, Y = TOWN.y, out = [
  { spr: 'npc_ali', x: (X + 23.5) * TS, y: (Y + 17.2) * TS, name: 'ALI', say: function () { shopAsk('nuggets', "Ali's Garlic Nuggets", 'Nuggets? Garlic bread? Everything is better with garlic. A bag of nuggets mends two hearts.', 5, function () { P.hp = Math.min(maxHp(), P.hp + 4); }); }, wander: 2 },
  { spr: 'npc_judgement', x: (X + 33.5) * TS, y: (Y + 22.2) * TS, name: 'JUDGEMENT', say: function () { say('Light or shadow. Both have a price. ' + hint(), 'JUDGEMENT'); } },
  { spr: 'npc_elden', x: (X + 20.5) * TS, y: (Y + 23.2) * TS, name: 'ELDEN', say: function () { say("Kaya's on the coffee, I'm on the grill. If you want a Cumpuccino to take with you, you'll need a bottle. She sells those too.", 'ELDEN'); }, wander: 1.5 }];
  var A = AREAINFO['0,1']; if (A && A.hub) out.push({ spr: 'steve0', x: (A.hub[0] + 2.5) * TS, y: (A.hub[1] + 2.2) * TS, name: 'STEVE', say: function () { say('...', 'STEVE'); } });
  STRUCTS.forEach(function (s) { if (s.id === 'tent') out.push({ spr: 'npc_stackedfate', x: (s.i + s.w + 1) * TS, y: (s.j + 1.2) * TS, name: 'STACKED FATE', say: function () { say('The deck was never yours. Neither was your fate. Come into the tent if you want to know what it holds.', 'STACKED FATE'); } }); });
  return out; }
function viewW() { return COLS * TS; } function viewH() { return ROWS * TS; }
function camTarget() { var vw = viewW(), vh = viewH(), x0 = 0, y0 = 0, x1 = SW() * TS, y1 = SH() * TS;
  if (SCR.kind === 'dg' && ROOM) { x0 = ROOM.ox * TS; y0 = ROOM.oy * TS; x1 = x0 + RW * TS; y1 = y0 + RH * TS; }
  var tx = x1 - x0 <= vw ? (x0 + x1 - vw) / 2 : clamp(P.x - vw / 2, x0, x1 - vw), ty = y1 - y0 <= vh ? (y0 + y1 - vh) / 2 : clamp(P.y - vh / 2, y0, y1 - vh); return [tx, ty]; }
function camSnap() { var t = camTarget(); CAM.x = t[0]; CAM.y = t[1]; }
/* the music follows the country you're in (no name banner: he said it flashed every time) */
function areaCheck() { if (!SCR || SCR.kind !== 'world') return; var b = bioAt(P.x / TS, P.y / TS), B = BIOMES[b]; if (b !== G.area) { G.area = b; if (B.song && music.current !== B.song) music.play(B.song); } }
/* foes come from spawn points near you, never on screen, and come back a while after you kill them */
function stepSpawns(dt) { if (SCR.kind !== 'world') return; var pi = P.x / TS, pj = P.y / TS;
  SPAWNS.forEach(function (s) { s.cd = Math.max(0, s.cd - dt); var d = Math.hypot(s.i - pi, s.j - pj);
    if (s.live) { if (s.live.hp <= 0) { s.live = null; s.cd = 45; } else if (Math.hypot(s.live.x / TS - pi, s.live.y / TS - pj) > 26) { FOE.splice(FOE.indexOf(s.live), 1); s.live = null; } return; }
    if (s.cd > 0 || d > 20 || d < 7) return; var sx = (s.i + 0.5) * TS - CAM.x, sy = (s.j + 0.5) * TS - CAM.y; if (sx > -24 && sx < viewW() + 24 && sy > -24 && sy < viewH() + 24) return;
    var f = mkFoe(s.k, (s.i + 0.5) * TS, (s.j + 0.5) * TS); f.sp = s; s.live = f; FOE.push(f); });
  FOE = FOE.filter(function (f) { return f.hp > 0 || f.hurt > 0; }); }
/* ---------- gates ---------- */
function openGate(g, quiet) { g.open = 1; g.tiles.forEach(function (q) { var t = WT[q]; WT[q] = t === 18 ? 19 : t === 22 ? 22 : 0; dirtyQ(q); }); if (g.orb) { WT[widx(g.orb[0], g.orb[1])] = 20; }
  if (!quiet) { SV.got['g:' + g.id] = 1; persist(); sfx.play('magic'); KIT.shake(4); } }
function dirtyQ(q) { var w = SW(); dirtyChunk(q % w, Math.floor(q / w)); dirtyChunk(q % w, Math.floor(q / w) + 1); dirtyChunk(q % w, Math.floor(q / w) - 1); }
function gateAt(q) { for (var n = 0; n < GATES.length; n++) if (GATES[n].tiles.indexOf(q) >= 0) return GATES[n]; return null; }
function orbGate(i, j) { for (var n = 0; n < GATES.length; n++) { var g = GATES[n]; if (g.orb && g.orb[0] === i && g.orb[1] === j) return g; } return null; }
/* ---------- inside a shop, house or cave ---------- */
function enterInside(id, back) { var I = INSIDE[id](); SV.where = { k: 'in', id: id, back: back }; SV.inDg = null; DG = null; ROOM = null; BOSS = null;
  SCR = { kind: 'in', id: id, T: I.T, w: COLS, h: ROWS, npcs: I.npcs || [], wares: I.wares || [], chest: I.chest || null, lights: I.lights || [], dark: I.dark, label: I.label, style: I.style, key: 'in:' + id };
  FOE = (I.foes || []).map(function (f) { return mkFoe(f[0], f[1] * TS, f[2] * TS); }); SHOT = []; PICK = [];
  P.x = 10 * TS; P.y = (ROWS - 1.6) * TS; P.dir = 'u'; P.hop = null; P.fall = 0; P.safeX = P.x; P.safeY = P.y; camSnap(); music.play(I.song || 'town'); persist(); if (I.enter) I.enter(); }
function leaveInside() { var w = SV.where, b = w.back; if (!b) { var d = null; Object.keys(DOORS).forEach(function (k) { if (DOORS[k].to && DOORS[k].to.in === w.id) d = DOORS[k]; }); b = d ? d.back : TOWN.home; } fade(function () { goWorld(b.x, b.y); P.dir = 'd'; }); }
function fade(fn) { FADE = { t: 0, fn: fn, done: 0 }; }
/* ---------- dungeons ---------- */
function dgState(di) { return SV.dg[di] = SV.dg[di] || { keys: 0, bk: 0, open: {}, clear: {}, chests: {}, seen: {} }; }
function enterDungeon(di) { SV.inDg = di; var dg = buildDungeon(di), st = dgState(di); DG = dg;
  SCR = { kind: 'dg', T: dg.T.slice(), w: dg.w, h: dg.h, npcs: [], key: 'dg' + di }; dropChunks();
  dg.doors.forEach(function (d) { if (st.open[d.id]) openDgDoor(d, true); });
  dg.chests.forEach(function (c) { var r = dg.rooms[c.room]; if (!r.trap || st.clear[c.room]) SCR.T[c.j * dg.w + c.i] = 76; });
  FOE = []; SHOT = []; PICK = []; BOSS = null; ROOM = null;
  P.x = (dg.start.ox + 11.5) * TS; P.y = (dg.start.oy + RH - 2.2) * TS; P.dir = 'u'; P.hop = null; P.fall = 0; P.safeX = P.x; P.safeY = P.y; roomCheck(); camSnap(); music.play(DUNGEONS[di].song); persist(); }
function leaveDungeon() { var d = null; Object.keys(DOORS).forEach(function (k) { if (DOORS[k].to && DOORS[k].to.dg === DG.di) d = DOORS[k]; }); var b = d ? d.back : TOWN.home; fade(function () { goWorld(b.x, b.y); P.dir = 'd'; }); }
function roomOf(x, y) { return DG.rooms[Math.floor(x / (RW * TS)) + ',' + Math.floor(y / (RH * TS))]; }
function roomCheck() { var r = roomOf(P.x, P.y); if (!r || r === ROOM) return; var old = ROOM; ROOM = r; var st = dgState(DG.di); st.seen[r.id] = 1;
  // foes of the room you left go back to their places; the new room's wake up
  FOE = []; SHOT = SHOT.filter(function (s) { return !s.foe; }); BOSS = null; G.shut = null;
  if (!st.clear[r.id]) { if (r.type === 'boss') { BOSS = mkBoss(DUNGEONS[DG.di].boss); BOSS.x = (r.ox + 11) * TS; BOSS.y = (r.oy + 6) * TS; music.play(BOSSES[DUNGEONS[DG.di].boss].song); }
    else if (r !== DG.start && r.type !== 'secret') { var rr = srand(77 + r.x * 13 + r.y * 7 + DG.di * 101), n = r.type ? 2 : 2 + Math.floor(rr() * 3);
      for (var k = 0, t = 0; k < n && t < 80; t++) { var i = r.ox + 3 + Math.floor(rr() * (RW - 6)), j = r.oy + 4 + Math.floor(rr() * (RH - 7)); if (tAt(i, j) !== 80 && tAt(i, j) !== 99) continue; if (Math.hypot((i + 0.5) * TS - P.x, (j + 0.5) * TS - P.y) < 90) continue; var D = DUNGEONS[DG.di]; var f = mkFoe(D.foes[Math.floor(rr() * D.foes.length)], (i + 0.5) * TS, (j + 0.5) * TS); f.room = r.id; FOE.push(f); k++; } }
    if (!FOE.length && !BOSS) markClear(r, true); else if (r.trap) G.shut = { r: r, armed: 1 }; }
  if (r.type === 'boss' && st.clear[r.id] && !st.chal) PICK.push({ k: 'chal', x: (r.ox + 11) * TS, y: (r.oy + 8) * TS });
  if (r.type !== 'boss' && music.current !== DUNGEONS[DG.di].song) music.play(DUNGEONS[DG.di].song); }
/* shut the room's doors once you're properly inside it */
function stepShut() { var s = G.shut; if (!s || !s.armed) return; var r = s.r, lx = P.x / TS - r.ox, ly = P.y / TS - r.oy; if (lx < 2 || lx > RW - 2 || ly < 4 || ly > RH - 2) return;
  s.armed = 0; s.tiles = []; Object.keys(r.doors).forEach(function (side) { var e = r.doors[side]; if (e.k === 'exit') return; doorTiles(r, side).forEach(function (q) { if (SCR.T[q] === 88) { SCR.T[q] = 91; s.tiles.push(q); dirtyQ(q); } }); }); if (s.tiles.length) sfx.play('door'); }
function markClear(r, quiet) { var st = dgState(DG.di); st.clear[r.id] = 1; if (G.shut && G.shut.r === r && G.shut.tiles) { G.shut.tiles.forEach(function (q) { SCR.T[q] = 88; dirtyQ(q); }); } G.shut = null;
  DG.chests.forEach(function (c) { if (c.room === r.id && !st.chests[r.id + c.kind] && SCR.T[c.j * DG.w + c.i] !== 76) { SCR.T[c.j * DG.w + c.i] = 76; dirtyQ(c.j * DG.w + c.i); if (!quiet) { sfx.play('magic'); for (var k = 0; k < 12; k++) FX.push({ x: (c.i + 0.5) * TS, y: (c.j + 0.5) * TS, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, t: 0.5, col: '#ffe36a' }); } } });
  if (!quiet) { sfx.play('magic'); persist(); }
  if (r.type === 'boss') { PICK.push({ k: 'heartc', x: (r.ox + 9) * TS, y: (r.oy + 8) * TS }); PICK.push({ k: 'chal', x: (r.ox + 13) * TS, y: (r.oy + 8) * TS }); music.stop(1); } }
function openDgDoor(d, quiet) { var st = dgState(DG.di); st.open[d.id] = 1; d.tiles.forEach(function (q) { SCR.T[q] = d.kind === 'pegs' ? 95 : 88; dirtyQ(q); }); if (!quiet) { persist(); sfx.play('door'); KIT.shake(3); } }
function dgDoorAt(q) { if (!DG) return null; for (var n = 0; n < DG.doors.length; n++) if (DG.doors[n].tiles.indexOf(q) >= 0) return DG.doors[n]; return null; }
/* move anyone out of whatever solid thing they arrived in: nearest open tile, searched outwards */
function blocked(o, r) { return solidAt(o.x - r, o.y - r * 0.5) || solidAt(o.x + r, o.y - r * 0.5) || solidAt(o.x - r, o.y + r * 0.6) || solidAt(o.x + r, o.y + r * 0.6) || isPit(tAt(Math.floor(o.x / TS), Math.floor(o.y / TS))); }
function unstick(o) { if (!o || !SCR || !blocked(o, 7)) return; var bi = Math.floor(o.x / TS), bj = Math.floor(o.y / TS);
  for (var rad = 1; rad < 14; rad++) for (var dj = -rad; dj <= rad; dj++) for (var di = -rad; di <= rad; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== rad) continue; var i = bi + di, j = bj + dj; if (i < 1 || j < 1 || i >= SW() - 1 || j >= SH() - 1) continue; var t = { x: (i + 0.5) * TS, y: (j + 0.5) * TS }; if (!blocked(t, 7)) { o.x = t.x; o.y = t.y; o.safeX = o.x; o.safeY = o.y; return; } } }
function isPit(t) { return t === 22 || t === 82; } function isWater(t) { return t === 3 || t === 83; }
/* ---------- foes ---------- */
function mkFoe(k, x, y) { var d = FOES[k]; return { k: k, d: d, x: x, y: y, hp: d.hp, vx: 0, vy: 0, t: Math.random() * 2, dir: 0, hurt: 0, stun: 0, cd: 1 + Math.random() }; }
function mkBoss(k) { var B = BOSSES[k]; return { k: k, B: B, x: 10 * TS, y: 3 * TS, hp: B.hp, mhp: B.hp, st: 'idle', t: 0, mi: 0, hurt: 0, marks: [], vx: 0, vy: 0, r: B.r || 24 }; }
function solidAt(x, y, flyer, who) { var i = Math.floor(x / TS), j = Math.floor(y / TS), t = tAt(i, j); if (t < 0) return true;
  if (flyer) return !!FLYSOLID[t];
  if (who === P && P.hover > 0 && (isWater(t) || isPit(t))) return false;
  if (isWater(t)) return true; if (who && who !== P && isPit(t)) return true;
  if (SOLID[t]) return true;
  if (who && who !== P && (t === 98 || t === 88 && SCR.kind === 'dg' && who.room && roomOf(x, y) && roomOf(x, y).id !== who.room)) return true;
  if (who && who.room && SCR.kind === 'dg') { var r = roomOf(x, y); if (!r || r.id !== who.room) return true; }
  if (who === P && SCR.npcs) for (var n = 0; n < SCR.npcs.length; n++) { var c = SCR.npcs[n]; if (Math.abs(x - c.x) < 10 && y > c.y - 12 && y < c.y + 4) return true; }
  return false; }
function moveBox(o, dx, dy, r, flyer) { function hit() { return solidAt(o.x - r, o.y - r * 0.5, flyer, o) || solidAt(o.x + r, o.y - r * 0.5, flyer, o) || solidAt(o.x - r, o.y + r * 0.6, flyer, o) || solidAt(o.x + r, o.y + r * 0.6, flyer, o); }
  o.bumpT = null; o.x += dx; if (hit()) { o.x -= dx; o.bump = 1; o.bumpT = [Math.floor((o.x + Math.sign(dx) * (r + 2)) / TS), Math.floor(o.y / TS)]; if (o === P && dx && !dy) slide(o, dx, r, flyer, 'x'); }
  o.y += dy; if (hit()) { o.y -= dy; o.bump = 1; o.bumpT = [Math.floor(o.x / TS), Math.floor((o.y + (dy > 0 ? r * 0.6 + 2 : -r * 0.5 - 2)) / TS)]; if (o === P && dy && !dx) slide(o, dy, r, flyer, 'y'); } }
/* corner slip: walking into the edge of something nudges you round it, so you never snag on a corner or a doorway's edge */
function slide(o, d, r, flyer, ax) { for (var s = 1; s <= 12; s++) for (var sg = -1; sg <= 1; sg += 2) { var ox = o.x, oy = o.y; if (ax === 'x') { o.y += sg * s; o.x += d; } else { o.x += sg * s; o.y += d; }
  var bad = solidAt(o.x - r, o.y - r * 0.5, flyer, o) || solidAt(o.x + r, o.y - r * 0.5, flyer, o) || solidAt(o.x - r, o.y + r * 0.6, flyer, o) || solidAt(o.x + r, o.y + r * 0.6, flyer, o); o.x = ox; o.y = oy;
  if (!bad) { if (ax === 'x') o.y += sg * Math.min(s, 1.5); else o.x += sg * Math.min(s, 1.5); return; } } }
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
    // nobody walks through Cumhead: touching him hurts him and pushes the foe back off
    dx = P.x - f.x; dy = P.y - f.y; dist = Math.hypot(dx, dy) || 1;
    if (dist < 17 && !P.hop) { if (P.inv <= 0) hurtP(d.dmg, f.x, f.y); moveBox(f, -dx / dist * (17 - dist), -dy / dist * (17 - dist), 8, d.ai === 'fly'); }
  });
  for (var a = 0; a < FOE.length; a++) for (var b = a + 1; b < FOE.length; b++) { var A = FOE[a], B = FOE[b]; if (A.hp <= 0 || B.hp <= 0) continue; var ex = B.x - A.x, ey = B.y - A.y, e = Math.hypot(ex, ey); if (e > 0.01 && e < 15) { var push = (15 - e) / 2; moveBox(A, -ex / e * push, -ey / e * push, 8, A.d.ai === 'fly'); moveBox(B, ex / e * push, ey / e * push, 8, B.d.ai === 'fly'); } }
  SHOT.forEach(function (s) { s.t -= dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.foe && Math.hypot(s.x - P.x, s.y - P.y) < 10 && !P.hop) { if ((P.atk > 0 || SV.items.condom) && facingShot(s)) { s.t = 0; sfx.play('no'); } else { hurtP(s.dmg, s.x - s.vx, s.y - s.vy); s.t = 0; } }
    if (!s.foe) { FOE.forEach(function (f) { if (f.hp > 0 && !s.bread && Math.hypot(f.x - s.x, f.y - s.y) < 12) { hitFoe(f, s.dmg, s.x - s.vx * 0.1, s.y - s.vy * 0.1); s.t = 0; } }); if (BOSS && BOSS.hp > 0 && !s.bread && Math.hypot(BOSS.x - s.x, BOSS.y - s.y) < BOSS.r) { hitBoss(s.dmg); s.t = 0; } shotHitsTile(s); }
    if (solidAt(s.x, s.y, true) && !s.bread) s.t = 0; if (s.bread && solidAt(s.x, s.y, true)) s.back = 1; });
  SHOT = SHOT.filter(function (s) { return s.t > 0; });
}
/* what a thrown or fired thing does to the tile it reaches: orbs, stone eyes */
function shotHitsTile(s) { var i = Math.floor(s.x / TS), j = Math.floor(s.y / TS), t = tAt(i, j);
  if (t === 20 && SCR.kind === 'world') { var g = orbGate(i, j); if (g && !g.open) { openGate(g); FX.push({ k: 'ring', x: (i + 0.5) * TS, y: (j + 0.5) * TS, t: 0.5 }); } s.back = 1; if (!s.bread) s.t = 0; }
  if (t === 96 && SCR.kind === 'dg') { DG.orbs.forEach(function (o) { if (o.x === i && o.y === j) { var d = DG.doors.filter(function (d) { return d.id === o.door; })[0]; if (d && !dgState(DG.di).open[d.id]) { openDgDoor(d); SCR.T[j * DG.w + i] = 80; dirtyQ(j * DG.w + i); FX.push({ k: 'ring', x: (i + 0.5) * TS, y: (j + 0.5) * TS, t: 0.5 }); } } }); s.back = 1; if (!s.bread) s.t = 0; }
  if (s.pistol && (t === 21 || t === 97)) { if (t === 21) { var g2 = gateAt(j * WW + i); if (g2 && !g2.open) { openGate(g2); for (var k = 0; k < 16; k++) FX.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160, t: 0.6, col: k % 2 ? '#c4121c' : '#f1e7d0' }); } }
    else { var d2 = dgDoorAt(j * DG.w + i); if (d2) openDgDoor(d2); } s.t = 0; } }
function facingShot(s) { var dx = s.x - P.x, dy = s.y - P.y; return (P.dir === 'r' && dx > 0) || (P.dir === 'l' && dx < 0) || (P.dir === 'd' && dy > 0) || (P.dir === 'u' && dy < 0); }
function hitFoe(f, dmg, fx, fy, stun) {
  if (f.d.shield && !stun) { if (f.hurt <= 0 && Math.random() < 0.5) { sfx.play('no'); f.kb = 0.15; var a0 = Math.atan2(f.y - fy, f.x - fx); f.kx = Math.cos(a0) * 120; f.ky = Math.sin(a0) * 120; return; } }
  if (stun && f.d.hp <= 1) dmg = 1; else if (stun) { f.stun = 2; sfx.play('tick'); if (!dmg) return; }
  f.hp -= dmg; f.hurt = 0.25; f.angry = 1; var a = Math.atan2(f.y - fy, f.x - fx); f.kb = 0.18; f.kx = Math.cos(a) * 180; f.ky = Math.sin(a) * 180; sfx.play('hit');
  if (f.hp <= 0) { sfx.play(f.d.pop ? 'splat' : 'hit'); for (var i = 0; i < 8; i++) FX.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, t: 0.4, col: f.d.pop ? ['#ff2630', '#ffe36a', '#f1e7d0'][i % 3] : '#f1e7d0' });
    var r = Math.random(); if (r < 0.35) PICK.push({ k: 'drop', x: f.x, y: f.y, n: Math.random() < 0.2 ? 5 : 1, t: 9 }); else if (r < 0.5) PICK.push({ k: 'heart', x: f.x, y: f.y, t: 9 }); else if (r < 0.57 && SV.items.bombs) PICK.push({ k: 'bomb', x: f.x, y: f.y, t: 9 });
    if (SCR.kind === 'dg' && ROOM && !BOSS && FOE.every(function (o) { return o.hp <= 0; })) markClear(ROOM); }
}
function hurtP(dmg, fx, fy) { if (P.inv > 0 || G.pillInv > 0) return; P.hp -= SV.items.ring ? Math.max(1, Math.ceil(dmg / 2)) : dmg; P.inv = 1; var a = Math.atan2(P.y - fy, P.x - fx); P.kx = Math.cos(a) * 200; P.ky = Math.sin(a) * 200; P.kb = 0.15; sfx.play('hurt'); KIT.shake(4); if (P.hp <= 0) { if (SV.bottle === 'full') { SV.bottle = 'empty'; P.hp = maxHp(); banner('THE CUMPUCCINO SAVED YOU'); sfx.play('power'); persist(); } else die(); } }
/* ---------- bosses ---------- */
function stepBoss(dt) {
  var b = BOSS; if (!b || b.hp <= 0) return; b.t += dt; b.hurt = Math.max(0, b.hurt - dt); var B = b.B, dx = P.x - b.x, dy = P.y - b.y, dist = Math.hypot(dx, dy) || 1, ph2 = b.hp < b.mhp / 2, sp = ph2 ? 1.3 : 1;
  var x0 = (ROOM.ox + 2) * TS, x1 = (ROOM.ox + RW - 2) * TS, y0 = (ROOM.oy + 4) * TS, y1 = (ROOM.oy + RH - 2) * TS;
  if (b.stun > 0) { b.stun -= dt; return; }
  if (b.st === 'idle') { b.x += dx / dist * 30 * dt * sp; b.y += dy / dist * 20 * dt * sp; if (b.t > 1.4 / sp) { b.st = B.moves[b.mi++ % B.moves.length]; b.t = 0; b.n = 0; if (b.st === 'spears') { b.marks = []; for (var i = 0; i < (ph2 ? 5 : 3); i++) b.marks.push({ x: P.x + (Math.random() - 0.5) * 120, y: P.y + (Math.random() - 0.5) * 80, t: 0.8 + i * 0.3 }); } } }
  else if (b.st === 'ring') { if (b.t > 0.5 && !b.n) { b.n = 1; for (var k = 0; k < (ph2 ? 14 : 10); k++) { var a = k / (ph2 ? 14 : 10) * 6.283; SHOT.push({ x: b.x, y: b.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, t: 3, dmg: 2, foe: 1 }); } sfx.play('shoot'); } if (b.t > 1.2) { b.st = 'idle'; b.t = 0; } }
  else if (b.st === 'aim' || b.st === 'coins') { if (b.t > 0.4 + b.n * 0.3 && b.n < 3) { b.n++; SHOT.push({ x: b.x, y: b.y, vx: dx / dist * 170, vy: dy / dist * 170, t: 3, dmg: 2, foe: 1 }); sfx.play('shoot'); } if (b.t > 1.6) { b.st = 'idle'; b.t = 0; } }
  else if (b.st === 'charge' || b.st === 'dive') { if (b.t < 0.6) { b.cx = dx / dist; b.cy = dy / dist; } else { b.x += b.cx * 260 * dt * sp; b.y += b.cy * 260 * dt * sp; if (b.x < x0 || b.x > x1 || b.y < y0 || b.y > y1 || b.t > 1.6) { b.x = clamp(b.x, x0, x1); b.y = clamp(b.y, y0, y1); b.st = 'idle'; b.t = -0.4; KIT.shake(6); sfx.play('boom'); } } }
  else if (b.st === 'spears') { b.marks.forEach(function (m) { m.t -= dt; if (m.t <= 0 && !m.done) { m.done = 1; if (Math.hypot(P.x - m.x, P.y - m.y) < 18) hurtP(2, m.x, m.y); FX.push({ k: 'spear', x: m.x, y: m.y, t: 0.4 }); sfx.play('hit'); } }); if (b.marks.every(function (m) { return m.done; })) { b.st = 'idle'; b.t = 0; b.marks = []; } }
  else if (b.st === 'summon') { if (!b.n) { b.n = 1; for (var s = 0; s < 3; s++) { var f = mkFoe('blumling', b.x + (s - 1) * 30, b.y + 30); f.room = ROOM.id; FOE.push(f); } } if (b.t > 1) { b.st = 'idle'; b.t = 0; } }
  b.x = clamp(b.x, x0, x1); b.y = clamp(b.y, y0, y1);
  if (dist < b.r && P.inv <= 0) hurtP(2, b.x, b.y);
  if (dist < b.r + 2) { var nx = b.x + dx / dist * (b.r + 2), ny = b.y + dy / dist * (b.r + 2); if (!blocked({ x: nx, y: ny }, 7)) { P.x = nx; P.y = ny; } }
}
function hitBoss(dmg, stun) { var b = BOSS; if (stun) { b.stun = 1.2; sfx.play('tick'); return; } b.hp -= dmg; b.hurt = 0.2; sfx.play('hit'); if (b.hp <= 0) { b.hp = 0; BOSS = null; KIT.shake(12); sfx.play('win'); for (var i = 0; i < 30; i++) FX.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 240, vy: (Math.random() - 0.5) * 240, t: 0.8, col: '#ff2630' }); FOE.forEach(function (f) { f.hp = 0; }); markClear(ROOM); if (DG.di === DUNGEONS.length - 1) setTimeout(ending, 2500); } }
/* ---------- Cumhead ---------- */
var DIRV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
function swingDmg() { return 1 + (SV.items.sharp ? 1 : 0) + (SV.won ? 1 : 0); }
function stepPlayer(dt) {
  var p = P, mv = KIT.stick(0); p.inv = Math.max(0, p.inv - dt); p.atk = Math.max(0, p.atk - dt); p.hover = Math.max(0, p.hover - dt); G.pillInv = Math.max(0, (G.pillInv || 0) - dt); G.pillFast = Math.max(0, (G.pillFast || 0) - dt);
  // hopping down a ledge
  if (p.hop) { p.hop.t += dt; var k = Math.min(1, p.hop.t / 0.42); p.y = p.hop.y0 + (p.hop.y1 - p.hop.y0) * k; p.z = Math.sin(k * Math.PI) * 14; if (k >= 1) { p.hop = null; p.z = 0; sfx.play('step'); p.safeX = p.x; p.safeY = p.y; } return; }
  // falling into a chasm or the water
  if (p.fall > 0) { p.fall -= dt; if (p.fall <= 0) { p.x = p.safeX; p.y = p.safeY; p.hp -= 1; p.inv = 1.2; sfx.play('hurt'); if (p.hp <= 0) die(); } return; }
  if (p.kb > 0) { p.kb -= dt; moveBox(p, p.kx * dt, p.ky * dt, 7); return; }
  var vx = Math.abs(mv.x) > 0.3 ? Math.sign(mv.x) : 0, vy = Math.abs(mv.y) > 0.3 ? Math.sign(mv.y) : 0; p.moving = !!(vx || vy);
  if (p.atk <= 0) { if (vx || vy) { if (vx && (!vy || Math.abs(mv.x) > Math.abs(mv.y))) p.dir = vx > 0 ? 'r' : 'l'; else p.dir = vy > 0 ? 'd' : 'u'; }
    var sp = SPEED * (G.pillFast > 0 ? 1.4 : 1) * dt * (vx && vy ? 0.74 : 1);
    moveBox(p, vx * sp, vy * sp, 7); if (vx || vy) p.anim += dt * 9;
    // a ledge under your feet when you walk down: hop it
    if (vy > 0 && !vx) { var li = Math.floor(p.x / TS), lj = Math.floor((p.y + 12) / TS); if (tAt(li, lj) === 9 && walkable(tAt(li, lj + 1)) && walkable(tAt(li, lj + 2))) { p.hop = { t: 0, y0: p.y, y1: (lj + 1.6) * TS }; sfx.play('blip'); return; } }
    // shoving something heavy with the ring on
    if (p.bump && p.bumpT && p.moving) { var bt = tAt(p.bumpT[0], p.bumpT[1]); if (bt === 23 || bt === 85) { if (SV.items.ring) { p.push = Math.max(0, p.push) + dt; if (p.push > 0.35) { p.push = 0; shatter(p.bumpT[0], p.bumpT[1], bt); } } else if (!MSGBOX && G.lastMsg !== 'heavy') { G.lastMsg = 'heavy'; say(GATEMSG.h); } } else p.push = 0; } else p.push = 0;
    p.bump = 0; }
  // pits and water under your feet
  var ti = Math.floor(p.x / TS), tj = Math.floor((p.y + 4) / TS), tt = tAt(ti, tj);
  if ((isPit(tt) || isWater(tt)) && p.hover <= 0) { p.fall = 0.45; p.fallK = isWater(tt) ? 'water' : 'pit'; sfx.play(isWater(tt) ? 'splat' : 'lose'); return; }
  if (!isPit(tt) && !isWater(tt) && p.hover <= 0) { var ok = true; for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) { var t2 = tAt(Math.floor((p.x + a * 9) / TS), Math.floor((p.y + b * 9) / TS)); if (isPit(t2) || isWater(t2)) ok = false; } if (ok) { p.safeX = p.x; p.safeY = p.y; } }
  if (tt === 98 && p.inv <= 0) hurtP(1, p.x, p.y - 20);
  if (KIT.pressed('a') && p.atk <= 0 && interact()) {} else if (KIT.pressed('a') && SV.items.sword && p.atk <= 0) { p.atk = 0.24; sfx.play('step'); sfx.tone('triangle', 400, 150, 0.1, 0.04); var v = DIRV[p.dir], hx = p.x + v[0] * 18, hy = p.y + v[1] * 18;
    FOE.forEach(function (f) { if (f.hp > 0 && Math.hypot(f.x - hx, f.y - hy) < 22) hitFoe(f, swingDmg(), p.x, p.y); }); if (BOSS && Math.hypot(BOSS.x - hx, BOSS.y - hy) < BOSS.r + 10) hitBoss(swingDmg());
    [[0, 0], [v[1] * 10, v[0] * 10], [-v[1] * 10, -v[0] * 10]].forEach(function (o) { var bi = Math.floor((hx + o[0]) / TS), bj = Math.floor((hy + o[1]) / TS), bt2 = tAt(bi, bj); if (bt2 === 5 || bt2 === 30) cutBush(bi, bj, bt2); if (bt2 === 20 || bt2 === 96) shotHitsTile({ x: (bi + 0.5) * TS, y: (bj + 0.5) * TS, t: 1, back: 0 }); }); }
  else if (KIT.pressed('a') && !SV.items.sword && p.atk <= 0) { if (!MSGBOX) say("Cumhead has nothing to swing. Amy's Willy Chilli is on the same street as the Clubhouse.", ''); }
  if (KIT.pressed('b') && p.atk <= 0) useItem();
  if (KIT.pressed('y') || KIT.pressed('x')) cycleItem();
  // pickups
  PICK.forEach(function (k) { if (k.t !== undefined) { k.t -= dt; } if (k.got || Math.hypot(k.x - p.x, k.y - p.y) > 16) return;
    k.got = 1; sfx.play('coin');
    if (k.k === 'drop') SV.drops = Math.min(999, SV.drops + (k.n || 1)); else if (k.k === 'heart') p.hp = Math.min(maxHp(), p.hp + 2); else if (k.k === 'bomb') SV.bombs = Math.min(bombMax(), SV.bombs + 2);
    else if (k.k === 'heartc') { SV.hearts++; p.hp = maxHp(); banner('HEART CONTAINER'); sfx.play('power'); }
    else if (k.k === 'chal') { var st = dgState(DG.di); st.chal = 1; if (SV.chal.indexOf(DG.di) < 0) SV.chal.push(DG.di); sfx.play('win'); banner('CUM CHALICE ' + SV.chal.length + ' OF 5'); persist(); setTimeout(function () { if (G.mode === 'play' && DG) leaveDungeon(); }, 2200); }
    persist(); });
  PICK = PICK.filter(function (k) { return !k.got && (k.t === undefined || k.t > 0); });
  if (SCR.kind === 'world') { stepWorldBits(dt); p.x = clamp(p.x, 8, WW * TS - 8); p.y = clamp(p.y, 8, WHT * TS - 8); }
  else if (SCR.kind === 'in') { if (p.y > (ROWS - 1.25) * TS && tAt(Math.floor(p.x / TS), ROWS - 1) === 70 && p.dir === 'd' && !FADE) leaveInside(); p.x = clamp(p.x, 4, COLS * TS - 4); p.y = clamp(p.y, 4, ROWS * TS - 4); }
  else stepDungeonBits(p);
}
function shatter(i, j, t) { if (SCR.kind === 'world') { var g = gateAt(widx(i, j)); if (g) openGate(g); else tSet(i, j, 0); } else { var d = dgDoorAt(j * DG.w + i); if (d) openDgDoor(d); else tSet(i, j, 80); }
  sfx.play('boom'); KIT.shake(6); for (var k = 0; k < 18; k++) FX.push({ x: (i + 0.5) * TS, y: (j + 0.5) * TS, vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200, t: 0.5, col: k % 2 ? '#c4121c' : '#5a0a10' }); }
function cutBush(bi, bj, bt) { var q = bj * SW() + bi, g = SCR.kind === 'world' ? gateAt(q) : null; tSet(bi, bj, SCR.kind === 'world' && bioAt(bi, bj) === 'C' ? 4 : 0); sfx.play('step');
  if (g && g.tiles.every(function (qq) { return WT[qq] !== 5; })) { SV.got['g:' + g.id] = 1; g.open = 1; persist(); }
  for (var i = 0; i < 6; i++) FX.push({ x: (bi + 0.5) * TS, y: (bj + 0.5) * TS, vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100, t: 0.4, col: bt === 30 ? ['#7a2428', '#3a1416'][i % 2] : ['#ff2630', '#2e1216'][i % 2] }); if (Math.random() < (bt === 5 ? 0.3 : 0.15)) PICK.push({ k: Math.random() < 0.6 ? 'drop' : 'heart', x: (bi + 0.5) * TS, y: (bj + 0.5) * TS, n: 1, t: 9 }); }
function stepWorldBits(dt) { var p = P;
  // walk up into a door or a cave mouth to go in
  if (p.dir === 'u' && !FADE && p.moving) { var di = Math.floor(p.x / TS), dj = Math.floor((p.y - 11) / TS), q = widx(di, dj), D = DOORS[q], t = WT[q];
    if (D && (t === 41 || t === 42) && Math.abs(p.x - (di + 0.5) * TS) < 14) {
      if (D.cracked && !SV.got['crk:' + D.cracked]) { if (!MSGBOX) { say('The rock here is cracked. Something hollow behind it. A bomb would open it.'); p.y += 6; } }
      else if (D.to.dg !== undefined) { var DD = DUNGEONS[D.to.dg]; if (DD.seal && SV.chal.length < DD.seal) { if (!MSGBOX) { say('A seal of goo covers the gate. It wants ' + DD.seal + ' Cum Chalices. You have ' + SV.chal.length + '.'); p.y += 6; } } else { var dgi = D.to.dg; fade(function () { enterDungeon(dgi); }); } }
      else { var id = D.to.in; fade(function () { enterInside(id, D.back); }); } } }
  // walking into a gate tells you what it needs, once
  if (p.bump && p.bumpT && !MSGBOX) { var gt = tAt(p.bumpT[0], p.bumpT[1]); if ((gt === 12 || gt === 18 || gt === 21) && G.lastMsg !== gt + ':' + p.bumpT) { G.lastMsg = gt + ':' + p.bumpT; say(GATEMSG[{ 12: 'k', 18: 'o', 21: 'e' }[gt]]); } }
  WITEMS.forEach(function (it) { if (SV.got['wp:' + it.id]) return; if (Math.hypot((it.i + 0.5) * TS - p.x, (it.j + 0.5) * TS - p.y) < 14) { SV.got['wp:' + it.id] = 1; givePiece(); } });
  SV.where = { k: 'world', x: p.safeX || p.x, y: p.safeY || p.y }; var ck = Math.floor(p.x / TS / 9) + ',' + Math.floor(p.y / TS / 7); if (!SV.seen[ck]) { SV.seen[ck] = 1; persist(); }
  areaCheck(); }
function givePiece() { SV.pieces++; if (SV.pieces >= 2) { SV.pieces = 0; SV.hearts++; P.hp = maxHp(); banner('HEART CONTAINER'); } else banner('A PIECE OF HEART (2 MAKE A HEART)'); sfx.play('power'); persist(); }
function stepDungeonBits(p) { var st = dgState(DG.di); roomCheck(); stepShut();
  // locked doors and the boss door open when you walk into them with the key
  if (p.bump && p.bumpT) { var q = p.bumpT[1] * DG.w + p.bumpT[0], t = SCR.T[q], d = dgDoorAt(q);
    if (d && t === 89) { if (st.keys > 0) { st.keys--; openDgDoor(d); } else if (!MSGBOX) say('Locked. It wants a small key.'); }
    else if (d && t === 90) { if (st.bk) openDgDoor(d); else if (!MSGBOX) say('A great door with a skull for a lock. It wants the Boss Key.'); }
    else if (d && t === 97 && !MSGBOX && G.lastMsg !== q) { G.lastMsg = q; say('A stone eye is set in the door. It does not blink.'); }
    else if (d && t === 94 && !MSGBOX && G.lastMsg !== q) { G.lastMsg = q; say('Red pegs block the doorway. There is an orb past them.'); }
    else if (t === 92 && !MSGBOX && G.lastMsg !== q) { G.lastMsg = q; say('This wall is cracked.'); }
    p.bump = 0; }
  // out of the front door
  if (ROOM === DG.start && p.y > (DG.start.oy + RH - 0.7) * TS && !FADE) leaveDungeon(); }
function openChest(c) { var st = dgState(DG.di); st.chests[c.room + c.kind] = 1; sfx.play('power');
  if (c.kind === 'key') { st.keys++; banner('A SMALL KEY'); }
  else if (c.kind === 'bkey') { st.bk = 1; banner('THE BOSS KEY'); say('The Boss Key! The skull door at the far end of ' + DG.D.n + ' will open for it now.'); }
  else if (c.kind === 'item') { var it = DG.D.item; if (it) { SV.items[it] = 1; if (!SV.sel) SV.sel = it; banner(ITEMS[it].n.toUpperCase()); say(ITEMS[it].n + '! ' + ITEMS[it].d); } }
  else if (c.kind === 'secret') { SV.drops += 50; givePiece(); }
  else { SV.drops += 20; banner('20 DROPS'); }
  persist(); }
function cycleItem() { var own = ['bombs', 'bread', 'pistol', 'balloon', 'bottle'].filter(function (k) { return k === 'bottle' ? SV.bottle : SV.items[k]; }); if (!own.length) return; var i = own.indexOf(SV.sel); SV.sel = own[(i + 1) % own.length]; sfx.play('blip'); }
function bombMax() { return SV.items.bigbag ? 16 : 8; }
function useItem() {
  var p = P, it = SV.sel, v = DIRV[p.dir]; if (!it) return;
  if (it === 'bombs') { if (SV.bombs <= 0) { sfx.play('no'); return; } SV.bombs--; FX.push({ k: 'bomb', x: p.x + v[0] * 16, y: p.y + v[1] * 16, t: 1.4 }); }
  else if (it === 'bread') { if (SHOT.some(function (s) { return s.bread; })) return; SHOT.push({ x: p.x, y: p.y, vx: v[0] * 240, vy: v[1] * 240, t: 1.6, bread: 1, dmg: 0, back: 0 }); sfx.play('shoot'); }
  else if (it === 'pistol') { if (SV.drops <= 0) { sfx.play('no'); return; } SV.drops--; SHOT.push({ x: p.x + v[0] * 10, y: p.y + v[1] * 10, vx: v[0] * 320, vy: v[1] * 320, t: 1.1, dmg: 2, pistol: 1 }); sfx.play('shoot'); }
  else if (it === 'balloon') { p.hover = 1.7; sfx.play('magic'); }
  else if (it === 'bottle') { if (SV.bottle !== 'full') { sfx.play('no'); if (!MSGBOX) say('The bottle is empty. Kaya fills it at the Cum Café.'); return; } SV.bottle = 'empty'; P.hp = maxHp(); sfx.play('pour'); banner('CUMPUCCINO! ALL HEARTS BACK'); persist(); }
}
function stepBits(dt) {
  SHOT.forEach(function (s) { if (!s.bread) return; s.t2 = (s.t2 || 0) + dt; if (s.t2 > 0.5 && !s.back) s.back = 1; shotHitsTile(s); if (s.back) { var dx = P.x - s.x, dy = P.y - s.y, d = Math.hypot(dx, dy) || 1; s.vx = dx / d * 250; s.vy = dy / d * 250; if (d < 10) s.t = 0; s.t = Math.max(s.t, 0.1); }
    FOE.forEach(function (f) { if (f.hp > 0 && Math.hypot(f.x - s.x, f.y - s.y) < 14) { hitFoe(f, f.d.hp <= 1 ? 1 : 0, s.x, s.y, true); s.back = 1; } }); if (BOSS && Math.hypot(BOSS.x - s.x, BOSS.y - s.y) < BOSS.r) { hitBoss(0, true); s.back = 1; }
    PICK.forEach(function (k) { if ((k.k === 'drop' || k.k === 'heart' || k.k === 'bomb') && Math.hypot(k.x - s.x, k.y - s.y) < 14) { k.x = s.x; k.y = s.y; } }); });
  FX.forEach(function (f) { if (f.k === 'bomb') { f.t -= dt; if (f.t <= 0 && !f.boom) { f.boom = 1; sfx.play('boom'); KIT.shake(8); for (var i = 0; i < 16; i++) FX.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, t: 0.5, col: ['#ffe36a', '#ff7a2a', '#c4121c'][i % 3] });
        FOE.forEach(function (e) { if (Math.hypot(e.x - f.x, e.y - f.y) < 40) hitFoe(e, 4, f.x, f.y); }); if (BOSS && Math.hypot(BOSS.x - f.x, BOSS.y - f.y) < 50) hitBoss(4); if (Math.hypot(P.x - f.x, P.y - f.y) < 30) hurtP(2, f.x, f.y);
        var ci = Math.floor(f.x / TS), cj = Math.floor(f.y / TS); for (var dj = -2; dj <= 2; dj++) for (var di = -2; di <= 2; di++) { var x = ci + di, y = cj + dj, t = tAt(x, y); if (Math.hypot((x + 0.5) * TS - f.x, (y + 0.5) * TS - f.y) > 42) continue;
          if (SCR.kind === 'world') { if (t === 2 || t === 5 || t === 30) tSet(x, y, 0); if (t === 12) { var g = gateAt(widx(x, y)); if (g) openGate(g); else tSet(x, y, 0); } if (t === 42) { var D = DOORS[widx(x, y)]; if (D && D.cracked && !SV.got['crk:' + D.cracked]) { SV.got['crk:' + D.cracked] = 1; dirtyQ(widx(x, y)); sfx.play('magic'); banner('A SECRET CAVE'); persist(); } } }
          else if (SCR.kind === 'dg' && t === 92) { var d2 = dgDoorAt(y * DG.w + x); if (d2) openDgDoor(d2); } } } } });
}
function banner(s) { G.banner = { t: 2.6, s: s }; }
function say(s, who) { MSGBOX = { s: s, who: who || '', t: 0 }; }
function die() { G.mode = 'dead'; G.deadT = 0; SV.deaths++; music.stop(1); sfx.play('lose'); }
