/* ---------- the save and the state ---------- */
var SV = KIT.load('lc-save', null);
function freshSave() { return { items: {}, sel: null, hearts: 3, pieces: 0, got: {}, drops: 0, bombs: 0, chal: [], dg: {}, sx: 2, sy: 4, hp: 6, deaths: 0, won: 0 }; }
if (!SV) SV = freshSave();
function persist() { KIT.save('lc-save', SV); }
var G = { mode: 'title', t: 0 }, P = null, SCR = null, FOE = [], SHOT = [], PICK = [], FX = [], BOSS = null, ROOM = null, DG = null, MSGBOX = null, TRANS = null;
function maxHp() { return SV.hearts * 2; }
function startGame() { P = { x: 10 * TS, y: 7 * TS, dir: 'u', hp: SV.hp > 0 ? SV.hp : maxHp(), inv: 0, atk: 0, kx: 0, ky: 0, anim: 0, item: null, hover: 0 }; G.mode = 'play'; KIT.closeMenu(); if (SV.inDg !== undefined && SV.inDg !== null) enterDungeon(SV.inDg); else loadOver(SV.sx, SV.sy); }
function loadOver(sx, sy) { SV.sx = sx; SV.sy = sy; SV.inDg = null; DG = null; ROOM = null; SCR = overScreen(sx, sy); if (SV.got['bomb' + sx + ',' + sy] && SCR.feat) SCR.T[SCR.feat.j * COLS + SCR.feat.i] = 7; FOE = SCR.foes.map(function (f) { return mkFoe(f.k, f.x, f.y); }); SHOT = []; PICK = []; BOSS = null; music.play('lcover'); }
function enterDungeon(di) { SV.inDg = di; DG = buildDungeon(di); SV.dg[di] = SV.dg[di] || { keys: 0, bk: 0, open: {}, clear: {}, chests: {}, seen: {} }; enterRoom(DG.start, 's'); G.banner = { t: 3, s: DG.D.n }; music.play(DG.D.song); }
function enterRoom(r, from) {
  ROOM = r; var st = SV.dg[DG.di]; st.seen[r.id] = 1; SCR = { kind: 'dg', T: roomTiles(DG, r), r: r }; FOE = []; SHOT = []; PICK = []; BOSS = null;
  if (!st.clear[r.id]) { if (r.type === 'boss') { BOSS = mkBoss(DG.D.boss); music.play(BOSSES[DG.D.boss].song); G.banner = { t: 2.5, s: BOSSES[DG.D.boss].n }; } else r.foes.forEach(function (k, n) { FOE.push(mkFoe(k, (4 + (n * 5) % 12) * TS + 12, (2 + (n * 3) % 5) * TS + 12)); }); if (FOE.length || BOSS) shutDoors(true); }
  if (r.type === 'boss' && st.clear[r.id] && !st.chal) PICK.push({ k: 'chal', x: 10 * TS, y: 5 * TS });
  if (st.clear[r.id] && r.type === 'key' && !st.gotKey) PICK.push({ k: 'key', x: 10 * TS, y: 5 * TS });
  if (st.clear[r.id] && (r.type === 'item' || r.type === 'bkey') && !st.chests[r.id]) PICK.push({ k: 'chest', x: 10 * TS, y: 4.5 * TS, room: r.id, what: r.type });
  if (r.type !== 'boss' && st.clear[r.id] && DG.D.song !== music.current) music.play(DG.D.song);
}
function shutDoors(on) { for (var q = 0; q < SCR.T.length; q++) { if (on && SCR.T[q] === 24) SCR.T[q] = 27; else if (!on && SCR.T[q] === 27) SCR.T[q] = 24; } if (on) sfx.play('door'); }
function roomCleared() { var st = SV.dg[DG.di]; st.clear[ROOM.id] = 1; shutDoors(false); sfx.play('magic'); persist();
  if (ROOM.type === 'key' && !st.gotKey) { PICK.push({ k: 'key', x: 10 * TS, y: 5 * TS }); }
  if ((ROOM.type === 'item' || ROOM.type === 'bkey') && !st.chests[ROOM.id]) PICK.push({ k: 'chest', x: 10 * TS, y: 4.5 * TS, room: ROOM.id, what: ROOM.type });
  if (ROOM.type === 'boss') { PICK.push({ k: 'heartc', x: 8 * TS, y: 5 * TS }); PICK.push({ k: 'chal', x: 12 * TS, y: 5 * TS }); music.stop(1); } }
/* ---------- foes ---------- */
function mkFoe(k, x, y) { var d = FOES[k]; return { k: k, d: d, x: x, y: y, hp: d.hp, vx: 0, vy: 0, t: Math.random() * 2, dir: 0, hurt: 0, stun: 0, cd: 1 + Math.random() }; }
function mkBoss(k) { var B = BOSSES[k]; return { k: k, B: B, x: 10 * TS, y: 3 * TS, hp: B.hp, mhp: B.hp, st: 'idle', t: 0, mi: 0, hurt: 0, marks: [], vx: 0, vy: 0, r: 22 }; }
function solidAt(x, y, flyer) { var i = Math.floor(x / TS), j = Math.floor(y / TS); if (i < 0 || j < 0 || i >= COLS || j >= ROWS) return !flyer; var t = SCR.T[j * COLS + i]; if (flyer) return t === 21 || t === 1 || t === 6; if (t === 23) return true; return !!SOLID[t]; }
function moveBox(o, dx, dy, r, flyer) { o.x += dx; if (solidAt(o.x - r, o.y - r * 0.5, flyer) || solidAt(o.x + r, o.y - r * 0.5, flyer) || solidAt(o.x - r, o.y + r * 0.6, flyer) || solidAt(o.x + r, o.y + r * 0.6, flyer)) { o.x -= dx; o.bump = 1; } o.y += dy; if (solidAt(o.x - r, o.y - r * 0.5, flyer) || solidAt(o.x + r, o.y - r * 0.5, flyer) || solidAt(o.x - r, o.y + r * 0.6, flyer) || solidAt(o.x + r, o.y + r * 0.6, flyer)) { o.y -= dy; o.bump = 1; } }
function stepFoes(dt) {
  FOE.forEach(function (f) {
    var d = f.d, dx = P.x - f.x, dy = P.y - f.y, dist = Math.hypot(dx, dy) || 1; f.t += dt; f.hurt = Math.max(0, f.hurt - dt); f.cd -= dt;
    if (f.hp <= 0) return; if (f.stun > 0) { f.stun -= dt; return; } if (f.kb) { moveBox(f, f.kx * dt, f.ky * dt, 8, d.ai === 'fly'); f.kb -= dt; if (f.kb <= 0) f.kb = 0; return; }
    var sp = d.spd * dt;
    if (d.ai === 'chase') moveBox(f, dx / dist * sp, dy / dist * sp, 8);
    else if (d.ai === 'fly') { f.x += (dx / dist * sp) + Math.sin(f.t * 3) * 0.5; f.y += (dy / dist * sp) + Math.cos(f.t * 2.4) * 0.5; }
    else if (d.ai === 'hop') { if (f.t % 1.2 < 0.5) moveBox(f, dx / dist * sp * 2, dy / dist * sp * 2, 8); }
    else if (d.ai === 'wander' || d.ai === 'shoot') { if (f.t > 1.5 || f.bump) { f.t = 0; f.bump = 0; var a = Math.floor(Math.random() * 4); f.mx = [1, -1, 0, 0][a]; f.my = [0, 0, 1, -1][a]; } moveBox(f, (f.mx || 0) * sp, (f.my || 0) * sp, 8);
      if (d.ai === 'shoot' && f.cd <= 0 && dist < 200) { f.cd = 2 + Math.random(); SHOT.push({ x: f.x, y: f.y, vx: dx / dist * 120, vy: dy / dist * 120, t: 3, dmg: d.dmg, foe: 1 }); sfx.play('shoot'); } }
    else if (d.ai === 'charge') { if (!f.ch && f.cd <= 0 && (Math.abs(dx) < 12 || Math.abs(dy) < 12)) { f.ch = 0.8; f.cx = Math.abs(dx) < 12 ? 0 : Math.sign(dx); f.cy = Math.abs(dx) < 12 ? Math.sign(dy) : 0; } if (f.ch) { moveBox(f, f.cx * 170 * dt, f.cy * 170 * dt, 8); f.ch -= dt; if (f.ch <= 0 || f.bump) { f.ch = 0; f.bump = 0; f.cd = 1.2; } } else moveBox(f, Math.sign(dx) * sp * 0.5, Math.sign(dy) * sp * 0.5, 8); }
    if (dist < 14 && P.inv <= 0) hurtP(d.dmg, f.x, f.y);
  });
  SHOT.forEach(function (s) { s.t -= dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.foe && Math.hypot(s.x - P.x, s.y - P.y) < 10) { if (P.atk > 0 && facingShot(s)) { s.t = 0; sfx.play('no'); } else { hurtP(s.dmg, s.x - s.vx, s.y - s.vy); s.t = 0; } }
    if (!s.foe) { FOE.forEach(function (f) { if (f.hp > 0 && Math.hypot(f.x - s.x, f.y - s.y) < 12) { hitFoe(f, s.dmg, s.x - s.vx * 0.1, s.y - s.vy * 0.1); s.t = 0; } }); if (BOSS && BOSS.hp > 0 && Math.hypot(BOSS.x - s.x, BOSS.y - s.y) < BOSS.r) { hitBoss(s.dmg); s.t = 0; } }
    if (solidAt(s.x, s.y, true)) s.t = 0; });
  SHOT = SHOT.filter(function (s) { return s.t > 0; });
}
function facingShot(s) { var dx = s.x - P.x, dy = s.y - P.y; return (P.dir === 'r' && dx > 0) || (P.dir === 'l' && dx < 0) || (P.dir === 'd' && dy > 0) || (P.dir === 'u' && dy < 0); }
function hitFoe(f, dmg, fx, fy, stun) {
  if (f.d.shield && !stun) { var dx = P.x - f.x, dy = P.y - f.y, toward = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : -1) : 0; if (f.hurt <= 0 && Math.random() < 0.5) { sfx.play('no'); f.kb = 0.15; var a0 = Math.atan2(f.y - fy, f.x - fx); f.kx = Math.cos(a0) * 120; f.ky = Math.sin(a0) * 120; return; } }
  if (stun && f.d.hp <= 1) dmg = 1; else if (stun) { f.stun = 2; sfx.play('tick'); if (!dmg) return; }
  f.hp -= dmg; f.hurt = 0.25; var a = Math.atan2(f.y - fy, f.x - fx); f.kb = 0.18; f.kx = Math.cos(a) * 180; f.ky = Math.sin(a) * 180; sfx.play('hit');
  if (f.hp <= 0) { sfx.play(f.d.pop ? 'splat' : 'hit'); for (var i = 0; i < 8; i++) FX.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, t: 0.4, col: f.d.pop ? ['#ff2630', '#ffe36a', '#4adfff'][i % 3] : '#f1e7d0' });
    var r = Math.random(); if (r < 0.3) PICK.push({ k: 'drop', x: f.x, y: f.y, n: Math.random() < 0.2 ? 5 : 1, t: 8 }); else if (r < 0.45) PICK.push({ k: 'heart', x: f.x, y: f.y, t: 8 }); else if (r < 0.52 && SV.items.bombs) PICK.push({ k: 'bomb', x: f.x, y: f.y, t: 8 });
    if (SCR.kind === 'dg' && FOE.every(function (o) { return o.hp <= 0; }) && !BOSS) roomCleared(); }
}
function hurtP(dmg, fx, fy) { if (P.inv > 0) return; P.hp -= SV.items.ring ? Math.max(1, Math.ceil(dmg / 2)) : dmg; P.inv = 1; var a = Math.atan2(P.y - fy, P.x - fx); P.kx = Math.cos(a) * 200; P.ky = Math.sin(a) * 200; P.kb = 0.15; sfx.play('hurt'); KIT.shake(4); if (P.hp <= 0) die(); }
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
}
function hitBoss(dmg, stun) { var b = BOSS; if (stun) { b.stun = 1.2; sfx.play('tick'); return; } b.hp -= dmg; b.hurt = 0.2; sfx.play('hit'); if (b.hp <= 0) { b.hp = 0; BOSS = null; KIT.shake(12); sfx.play('win'); for (var i = 0; i < 30; i++) FX.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 240, vy: (Math.random() - 0.5) * 240, t: 0.8, col: '#ff2630' }); FOE.forEach(function (f) { f.hp = 0; }); roomCleared(); if (DG.di === DUNGEONS.length - 1) setTimeout(ending, 2500); } }
/* ---------- Cumhead ---------- */
var DIRV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
function stepPlayer(dt) {
  var p = P, mv = KIT.stick(0); p.inv = Math.max(0, p.inv - dt); p.atk = Math.max(0, p.atk - dt); p.hover = Math.max(0, p.hover - dt);
  if (p.kb > 0) { p.kb -= dt; moveBox(p, p.kx * dt, p.ky * dt, 7); return; }
  var vx = Math.abs(mv.x) > 0.3 ? Math.sign(mv.x) : 0, vy = Math.abs(mv.y) > 0.3 ? Math.sign(mv.y) : 0;
  if (p.atk <= 0) { if (vx || vy) { if (vx && (!vy || Math.abs(mv.x) > Math.abs(mv.y))) p.dir = vx > 0 ? 'r' : 'l'; else p.dir = vy > 0 ? 'd' : 'u'; } var sp = 92 * dt * (vx && vy ? 0.72 : 1);
    var save = SOLID[23]; if (p.hover > 0) { SOLID[23] = 0; SOLID[29] = 0; SOLID[3] = 0; } moveBox(p, vx * sp, vy * sp, 7); if (p.hover > 0) { SOLID[23] = 1; SOLID[29] = 1; SOLID[3] = 1; } if (vx || vy) p.anim += dt * 8; }
  // falling into a pit once the balloon runs out
  var ti = Math.floor(p.x / TS), tj = Math.floor(p.y / TS), tt = SCR.T[tj * COLS + ti]; if ((tt === 23 || tt === 29 || tt === 3) && p.hover <= 0) { p.hp -= 1; p.x = p.lastX; p.y = p.lastY; p.inv = 1; sfx.play('hurt'); if (p.hp <= 0) die(); } else if (tt !== 23 && tt !== 29 && tt !== 3) { p.lastX = p.x; p.lastY = p.y; }
  if (KIT.pressed('a') && SV.items.sword && p.atk <= 0) { p.atk = 0.26; sfx.play('step'); sfx.tone('triangle', 400, 150, 0.1, 0.04); var v = DIRV[p.dir], hx = p.x + v[0] * 18, hy = p.y + v[1] * 18;
    FOE.forEach(function (f) { if (f.hp > 0 && Math.hypot(f.x - hx, f.y - hy) < 20) hitFoe(f, 1 + (SV.won ? 1 : 0), p.x, p.y); }); if (BOSS && Math.hypot(BOSS.x - hx, BOSS.y - hy) < BOSS.r + 10) hitBoss(1);
    var bi = Math.floor(hx / TS), bj = Math.floor(hy / TS); if (SCR.T[bj * COLS + bi] === 5) { SCR.T[bj * COLS + bi] = 0; sfx.play('step'); for (var i = 0; i < 6; i++) FX.push({ x: (bi + 0.5) * TS, y: (bj + 0.5) * TS, vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100, t: 0.4, col: '#4aa82a' }); if (Math.random() < 0.3) PICK.push({ k: Math.random() < 0.5 ? 'drop' : 'heart', x: (bi + 0.5) * TS, y: (bj + 0.5) * TS, n: 1, t: 8 }); } }
  if (KIT.pressed('b') && p.atk <= 0) useItem();
  if (KIT.pressed('y') || KIT.pressed('x')) cycleItem();
  // pickups
  PICK.forEach(function (k) { if (k.t !== undefined) { k.t -= dt; } if (k.got || Math.hypot(k.x - p.x, k.y - p.y) > 16) return;
    if (k.k === 'chest') { if (KIT.pressed('a') || true) { k.got = 1; openChest(k); } return; }
    k.got = 1; sfx.play('coin');
    if (k.k === 'drop') SV.drops = Math.min(999, SV.drops + (k.n || 1)); else if (k.k === 'heart') p.hp = Math.min(maxHp(), p.hp + 2); else if (k.k === 'bomb') SV.bombs = Math.min(8, SV.bombs + 2);
    else if (k.k === 'key') { SV.dg[DG.di].keys++; SV.dg[DG.di].gotKey = 1; banner('A SMALL KEY'); }
    else if (k.k === 'heartc') { SV.hearts++; p.hp = maxHp(); banner('HEART CONTAINER'); sfx.play('power'); }
    else if (k.k === 'chal') { SV.dg[DG.di].chal = 1; if (SV.chal.indexOf(DG.di) < 0) SV.chal.push(DG.di); sfx.play('win'); banner('CUM CHALICE ' + SV.chal.length + ' OF 5'); persist(); setTimeout(function () { if (G.mode === 'play' && SV.inDg !== null) { var at = DUNGEONS[DG.di].at; SV.inDg = null; loadOver(at[0], at[1]); P.x = 10 * TS + 12; P.y = 4 * TS; } }, 2200); }
    persist(); });
  PICK = PICK.filter(function (k) { return !k.got && (k.t === undefined || k.t > 0); });
  // doors, caves, edges
  var tile = SCR.T[Math.floor(p.y / TS) * COLS + Math.floor(p.x / TS)];
  if (SCR.kind === 'over') {
    if (SCR.feat && Math.abs(p.x - (SCR.feat.i + 0.5) * TS) < 14 && Math.abs(p.y - (SCR.feat.j + 1) * TS) < 10 && p.dir === 'u') {
      var F = SCR.feat; if (F.k === 'dungeon') { var D = DUNGEONS[F.d]; if (D.seal && SV.chal.length < D.seal) { if (!MSGBOX) say('A seal of goo covers the door. It wants ' + D.seal + ' Cum Chalices. You have ' + SV.chal.length + '.'); } else { enterDungeon(F.d); P.x = 10 * TS; P.y = (ROWS - 2) * TS; } }
      else if (F.k === 'heart' && !SV.got['bomb' + SV.sx + ',' + SV.sy]) { if (!MSGBOX) say('A cracked rock. A bomb would open it.'); }
      else cave(F.k);
    }
    var ns = null; if (p.x < 4) ns = [-1, 0]; else if (p.x > COLS * TS - 4) ns = [1, 0]; else if (p.y < 4) ns = [0, -1]; else if (p.y > ROWS * TS - 4) ns = [0, 1];
    if (ns) { var nx = SV.sx + ns[0], ny = SV.sy + ns[1]; if (nx >= 0 && ny >= 0 && nx < MAPW && ny < MAPH) { TRANS = { dx: ns[0], dy: ns[1], t: 0, from: SCR }; loadOver(nx, ny); p.x = ns[0] > 0 ? 8 : ns[0] < 0 ? COLS * TS - 8 : p.x; p.y = ns[1] > 0 ? 8 : ns[1] < 0 ? ROWS * TS - 8 : p.y; persist(); } else { p.x = clamp(p.x, 6, COLS * TS - 6); p.y = clamp(p.y, 6, ROWS * TS - 6); } }
  } else {
    var st = SV.dg[DG.di], r = ROOM;
    var side = p.y < TS * 1.2 ? 'n' : p.y > (ROWS - 1.2) * TS ? 's' : p.x < TS * 1.2 ? 'w' : p.x > (COLS - 1.2) * TS ? 'e' : null;
    if (side && r.doors[side]) { var v = r.doors[side], k = r.id + side, isOpen = v === 'open' || st.open[k];
      if (v === 'exit' && side === 's') { var at = DG.D.at; loadOver(at[0], at[1]); p.x = 10 * TS + 12; p.y = 4 * TS; persist(); return; }
      if (!isOpen && v === 'locked' && st.keys > 0 && FOE.every(function (f) { return f.hp <= 0; })) { st.keys--; openDoor(r, side); sfx.play('door'); }
      else if (!isOpen && v === 'boss' && st.bk) { openDoor(r, side); sfx.play('door'); }
      else if (!isOpen && !MSGBOX && p.hp > 0) { say(v === 'boss' ? 'A great door with a skull lock. It needs the Boss Key.' : 'Locked. It needs a small key.'); p.y += side === 'n' ? 10 : side === 's' ? -10 : 0; p.x += side === 'w' ? 10 : side === 'e' ? -10 : 0; }
      var edge = p.y < 4 || p.y > ROWS * TS - 4 || p.x < 4 || p.x > COLS * TS - 4;
      if (edge && (isOpen || st.open[k]) && FOE.every(function (f) { return f.hp <= 0; }) && !BOSS) { var d2 = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[side], nr = DG.rooms[(r.x + d2[0]) + ',' + (r.y + d2[1])]; if (nr) { TRANS = { dx: d2[0], dy: d2[1], t: 0, from: SCR }; enterRoom(nr, side); p.x = d2[0] > 0 ? 14 : d2[0] < 0 ? COLS * TS - 14 : p.x; p.y = d2[1] > 0 ? 14 : d2[1] < 0 ? ROWS * TS - 14 : p.y; } } }
    p.x = clamp(p.x, 4, COLS * TS - 4); p.y = clamp(p.y, 4, ROWS * TS - 4);
  }
}
function openDoor(r, side) { var st = SV.dg[DG.di], d = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[side], o = { n: 's', s: 'n', w: 'e', e: 'w' }[side], nr = DG.rooms[(r.x + d[0]) + ',' + (r.y + d[1])]; st.open[r.id + side] = 1; if (nr) st.open[nr.id + o] = 1; SCR.T = roomTiles(DG, r); persist(); }
function openChest(k) { var st = SV.dg[DG.di]; st.chests[k.room] = 1; if (k.what === 'bkey') { st.bk = 1; banner('THE BOSS KEY'); } else { var it = DG.D.item; if (it) { SV.items[it] = 1; if (!SV.sel) SV.sel = it; banner(ITEMS[it].n.toUpperCase()); say(ITEMS[it].n + '! ' + ITEMS[it].d); } } sfx.play('power'); persist(); }
function cycleItem() { var own = ['bombs', 'bread', 'pistol', 'balloon'].filter(function (k) { return SV.items[k]; }); if (!own.length) return; var i = own.indexOf(SV.sel); SV.sel = own[(i + 1) % own.length]; sfx.play('blip'); }
function useItem() {
  var p = P, it = SV.sel, v = DIRV[p.dir]; if (!it) return;
  if (it === 'bombs') { if (SV.bombs <= 0) { sfx.play('no'); return; } SV.bombs--; FX.push({ k: 'bomb', x: p.x + v[0] * 16, y: p.y + v[1] * 16, t: 1.4 }); }
  else if (it === 'bread') { if (SHOT.some(function (s) { return s.bread; })) return; SHOT.push({ x: p.x, y: p.y, vx: v[0] * 220, vy: v[1] * 220, t: 1.2, bread: 1, dmg: 0, back: 0 }); sfx.play('shoot'); }
  else if (it === 'pistol') { if (SV.drops <= 0) { sfx.play('no'); return; } SV.drops--; SHOT.push({ x: p.x + v[0] * 10, y: p.y + v[1] * 10, vx: v[0] * 300, vy: v[1] * 300, t: 1, dmg: 2 }); sfx.play('shoot'); }
  else if (it === 'balloon') { p.hover = 1.6; sfx.play('magic'); }
}
function stepBits(dt) {
  SHOT.forEach(function (s) { if (!s.bread) return; s.t2 = (s.t2 || 0) + dt; if (s.t2 > 0.45 && !s.back) s.back = 1; if (s.back) { var dx = P.x - s.x, dy = P.y - s.y, d = Math.hypot(dx, dy) || 1; s.vx = dx / d * 240; s.vy = dy / d * 240; if (d < 10) s.t = 0; s.t = Math.max(s.t, 0.1); }
    FOE.forEach(function (f) { if (f.hp > 0 && Math.hypot(f.x - s.x, f.y - s.y) < 14) { hitFoe(f, f.d.hp <= 1 ? 1 : 0, s.x, s.y, true); s.back = 1; } }); if (BOSS && Math.hypot(BOSS.x - s.x, BOSS.y - s.y) < BOSS.r) { hitBoss(0, true); s.back = 1; }
    PICK.forEach(function (k) { if ((k.k === 'drop' || k.k === 'heart' || k.k === 'key' || k.k === 'bomb') && Math.hypot(k.x - s.x, k.y - s.y) < 14) { k.x = s.x; k.y = s.y; } }); });
  FX.forEach(function (f) { if (f.k === 'bomb') { f.t -= dt; if (f.t <= 0 && !f.boom) { f.boom = 1; sfx.play('boom'); KIT.shake(8); for (var i = 0; i < 16; i++) FX.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, t: 0.5, col: ['#ffe36a', '#ff7a2a', '#c4121c'][i % 3] });
        FOE.forEach(function (e) { if (Math.hypot(e.x - f.x, e.y - f.y) < 40) hitFoe(e, 4, f.x, f.y); }); if (BOSS && Math.hypot(BOSS.x - f.x, BOSS.y - f.y) < 50) hitBoss(4); if (Math.hypot(P.x - f.x, P.y - f.y) < 30) hurtP(2, f.x, f.y);
        if (SCR.kind === 'over' && SCR.feat && SCR.feat.k === 'heart' && Math.hypot((SCR.feat.i + 0.5) * TS - f.x, (SCR.feat.j + 1) * TS - f.y) < 40) { SCR.T[SCR.feat.j * COLS + SCR.feat.i] = 7; SV.got['bomb' + SV.sx + ',' + SV.sy] = 1; sfx.play('magic'); persist(); }
        for (var q = 0; q < SCR.T.length; q++) if (SCR.T[q] === 2 && Math.hypot((q % COLS + 0.5) * TS - f.x, ((q / COLS | 0) + 0.5) * TS - f.y) < 30) SCR.T[q] = 0; } } });
}
function banner(s) { G.banner = { t: 2.6, s: s }; }
function say(s, who) { MSGBOX = { s: s, who: who || '', t: 0 }; }
function cave(k) {
  if (k === 'amy') { if (!SV.items.sword) { SV.items.sword = 1; say(NPCSAY.amy, 'AMY'); banner("AMY'S SAUSAGE"); sfx.play('power'); persist(); } else say('Go on then. The land is that way. Mind the slime.', 'AMY'); }
  else if (k === 'saba') shopMenu();
  else if (k === 'harold') { KIT.confirm({ title: "Harold's Tea", sub: NPCSAY.harold + ' A pot of tea fills every heart.', price: 10, have: SV.drops, unit: 'DROPS', yes: function () { SV.drops -= 10; P.hp = maxHp(); persist(); sfx.play('pour'); KIT.closeMenu(); }, no: KIT.closeMenu }); P.y += 12; }
  else if (k === 'greebo') { if (!SV.got.greebo) { SV.got.greebo = 1; SV.hearts++; P.hp = maxHp(); say(NPCSAY.greebo + ' Here, a whole pie. Your heart feels bigger.', 'GREEBO'); banner('HEART CONTAINER'); persist(); } else say(NPCSAY.greebo, 'GREEBO'); }
  else if (k === 'spermaid') { say(NPCSAY.spermaid + ' The Lair is up at the top of the land. You need four chalices to break its seal.', 'SPERMAID'); }
  else if (k === 'heart') { var key = 'hp' + SV.sx + ',' + SV.sy; if (!SV.got[key]) { SV.got[key] = 1; SV.pieces++; if (SV.pieces >= 2) { SV.pieces = 0; SV.hearts++; P.hp = maxHp(); banner('HEART CONTAINER'); } else banner('A PIECE OF HEART'); sfx.play('power'); persist(); } else say('Nothing else down here.'); }
  P.y += 14;
}
function die() { G.mode = 'dead'; G.deadT = 0; SV.deaths++; music.stop(1); sfx.play('lose'); }
