/* =====================================================================================================
   BLUMHEAD'S LAIR: the last area. Beat Super Blumhead five times and, after the fight, the load drags
   your heir down into his lair. It has its own foes and room types (rising goo, the wall eye, the beating
   heart), four boss doors with powered-up versions of the four bosses, and behind them Mega Blumhead.
   ===================================================================================================== */
AREAS.lair = { name: "Blumhead's Lair", sub: 'THE FINAL LOAD', tier: 6, ox: 60, oy: 0, w: 6, h: 4, rooms: 18, boss: 'mega', music: 'lair', secret: 1,
  sky: null, tint: 'rgba(60,0,40,0.18)', e1: '#c08aff', e2: '#4a0a3a', wall: '#0a0208',
  pool: [['blumling', 3], ['blumeye', 2], ['blumguard', 2], ['blumspore', 2], ['vampire', 1]] };
ENEMIES.blumling = { name: 'Blumling', ai: 'hop', hp: 14, dmg: 12, spd: 96, w: 16, h: 16, fsp: 'blumling', nf: 4, sc: 1, drops: 2 };
ENEMIES.blumeye = { name: 'Blum Eye', ai: 'shoot', hp: 18, dmg: 13, spd: 50, w: 22, h: 26, fsp: 'blumeye', nf: 3, sc: 1, drops: 3, shotk: 'laser', shotsp: 230 };
ENEMIES.blumguard = { name: 'Lair Guard', ai: 'guard', hp: 50, dmg: 17, spd: 30, w: 20, h: 34, fsp: 'blumguard', nf: 3, sc: 1, drops: 6, shield: 1 };
ENEMIES.blumspore = { name: 'Blum Spore', ai: 'lob', hp: 26, dmg: 12, spd: 0, w: 20, h: 20, fsp: 'blumspore', nf: 3, sc: 1, drops: 3, shot: 'blob' };
ENEMIES.lheart = { name: 'Blum Heart', ai: 'heart', hp: 160, dmg: 10, spd: 0, w: 40, h: 44, fsp: 'lheart', nf: 2, sc: 1, drops: 10, onDie: heartDown };
BOSSDEF.mega = { name: 'Mega Blumhead', area: 'lair', hp: 3600, dmg: 30, sp: 'f_mega_', sc: 1, w: 96, h: 128 };
BOSSMUSIC.mega = 'bmega';
BOSSLINES.mega = ['YOU CAME ALL THE WAY DOWN HERE. INTO ME.', 'EVERY HEIR. EVERY LOAD. IT ALL ENDS IN MEGA BLUMHEAD.'];
var LAIRBOSS = { beast: 'Blumbound Beast', demon: 'Blumbound Legion', sperm: 'Blumbound Sperminator', pig: 'Blumbound Brothers' };
var LAIRFX = [];
function lairDef(id, d) { var o = {}; for (var k in d) o[k] = d[k]; o.name = LAIRBOSS[id] || ('Blumbound ' + d.name); o.area = 'lair'; return o; }

/* after Super Blumhead falls, with five wins behind you: the floor opens */
function lairTeleport() {
  G.winT = 0; eshots = []; waves = [];
  cutPlay({ focus: function () { return { x: P.x }; }, lines: [
    { who: 'Super Blumhead', say: 'FIVE TIMES... FIVE TIMES YOU PUT ME DOWN...', col: '#c070ff', fx: function () { G.shake = 6; sfx.roar(); } },
    { who: 'Super Blumhead', say: 'THEN COME HOME WITH ME, LITTLE DROP. COME DOWN WHERE THE LOAD IS MADE.', col: '#c070ff', fx: function () { G.shake = 12; G.flash = 0.4; } },
    { who: '', say: 'The floor of the arena turns to goo. You sink, and keep sinking.', dur: 2.6, each: function () { G.shake = Math.max(G.shake, 3); if (Math.random() < 0.6) parts.push({ x: P.x + (Math.random() - 0.5) * 80, y: 15 * T - 2, vx: 0, vy: -60 - Math.random() * 60, life: 0.6, c: Math.random() < 0.5 ? '#9a4aff' : '#ff2630' }); } }
  ], onEnd: function () {
    RUN.lair = { seals: {} }; G.lairFight = false; G.lock = false;
    enterRoom(WORLD.lairEntry, null, null); P.x = 6 * T; P.y = 15 * T; P.vx = 0; P.vy = 0; camSnap();
    healP(Math.round(ST.mhp * 0.5), true); G.fade = 0.6; poof(P.x, P.y - 16, 30, ['#9a4aff', '#ff2630', '#12040a']);
    META.lairSeen = 1; saveMeta();
    G.banner = 3.4; G.bannerTxt = "BLUMHEAD'S LAIR"; G.bannerSub = 'FOUR DOORS. THEN MEGA BLUMHEAD.'; saveRun();
  } });
}
function lairSeals() { return RUN && RUN.lair ? Object.keys(RUN.lair.seals).length : 0; }
function lairDoor(e) {
  if (e.boss === 'mega') {
    var n = lairSeals(); if (n < 4) { sfx.lock(); toast('THE LAST DOOR  ·  ' + n + '/4 GUARDIANS DOWN'); return; }
    sfx.door(); enterArena('mega', true); return;
  }
  if (RUN.lair && RUN.lair.seals[e.boss]) { sfx.click(); toast(LAIRBOSS[e.boss].toUpperCase() + ' IS DEAD.'); return; }
  sfx.door(); enterArena(e.boss, true);
}
/* a guardian of the lair is down: a seal on the last door, drops and a powerup */
function lairBossDown(b) {
  var id = b.id === 'cowpig' ? 'pig' : b.id;
  RUN.lair.seals[id] = 1; G.lock = false; G.layer = null; sfx.goal(); LAIRFX = [];
  var pw = shuffle(POWERS.slice())[0]; grantPower(pw.id); ST = calcStats();
  G.banner = 3; G.bannerTxt = LAIRBOSS[id].toUpperCase() + ' DEFEATED'; G.bannerSub = lairSeals() + ' OF 4  ·  YOU TAKE ' + pw.name.toUpperCase(); saveRun();
  if (lairSeals() >= 4) cutPlay({ focus: function () { return { x: P.x }; }, lines: [{ who: '', say: 'Deep in the lair something huge wakes up. The last door is open.', dur: 2.8, fx: function () { G.shake = 10; sfx.roar(); } }] });
}
function megaDown(b) {
  META.megaWins = (META.megaWins || 0) + 1; saveMeta(); LAIRFX = [];
  G.winT = 5; G.winKind = 3; sfx.goal();
  cutPlay({ focus: { x: b.x }, lines: [
    { who: 'Mega Blumhead', say: 'NO... THE LOAD... IT WAS MEANT TO BE ME...', col: '#ff2630', fx: function () { G.shake = 14; } },
    { who: '', say: 'The lair goes quiet. For the first time in a long time, nothing is dripping.', dur: 3 }
  ], onEnd: function () { G.banner = 3.5; G.bannerTxt = 'MEGA BLUMHEAD FALLS'; G.bannerSub = 'THE LEGACY IS COMPLETE'; } });
}

/* powered-up bosses: they run faster, hit harder, and keep throwing Blumhead's goo about */
function lairExtra(b, dt) {
  b.lx = (b.lx || 2.5) - dt;
  if (b.lx <= 0) {
    b.lx = b.fury ? 3 : 4.5; var n = b.id === 'demon' ? 5 : 10, off = Math.random();
    for (var i = 0; i < n; i++) bshot(b.x, b.y - b.h / 2, off + i / n * Math.PI * 2, 125, b.dmg * 0.5, 'blob', LAIRBOSS[b.id === 'cowpig' ? 'pig' : b.id] || 'Blumhead\'s goo');
    sfx.fire();
    if (b.id !== 'demon' && enemies.length < 2 && Math.random() < 0.5) { var e = mkEnemy('blumling', clamp(b.x + (Math.random() < 0.5 ? -60 : 60), 40, L.w * T - 40), 15 * T, -1); enemies.push(e); poof(e.x, e.y - 8, 10, ['#9a4aff', '#ff2630']); }
  }
}

/* ---------- Mega Blumhead ---------- */
BRAIN.mega = function (b, dt, W, ph) {
  var hx = clamp(P.x + Math.sin(b.t * 0.6) * 160, 100, W - 100), hy = 120 + Math.sin(b.t * 1.4) * 16, cx = b.x, cy = b.y - b.h / 2;
  var third = b.hp < b.mhp * 0.33;
  if (b.st === 'idle') {
    b.x += (hx - b.x) * Math.min(1, dt * 0.8); b.y += (hy - b.y) * Math.min(1, dt * 1.4); b.face = towardP(b); b.cd -= dt;
    if (b.cd <= 0) {
      var o = ['ring', 'aim', 'slam', 'eye', 'rain']; if (ph === 2) o.push('spiral', 'summon', 'goo'); if (third) o.push('eye', 'flood');
      b.st = o[Math.floor(Math.random() * o.length)]; if (b.st === 'summon' && enemies.length >= 3) b.st = 'ring'; b.n = 0; b.t2 = 0.4;
    }
  } else if (b.st === 'ring') { b.t2 -= dt; if (b.t2 <= 0) { var nr = 16 + (ph === 2 ? 6 : 0), off = Math.random(); for (var i = 0; i < nr; i++) bshot(cx, cy, off + i / nr * Math.PI * 2, 125, b.dmg * 0.6, 'blob', b.d.name); sfx.fire(); b.n++; b.t2 = 0.6; if (b.n >= 3) { b.st = 'idle'; b.cd = 1.2; } } }
  else if (b.st === 'aim') { b.t2 -= dt; if (b.t2 <= 0) { var a = Math.atan2((P.y - 18) - cy, P.x - cx); for (var k = -2; k <= 2; k++) bshot(cx, cy, a + k * 0.15, 220, b.dmg * 0.6, 'blob', b.d.name); sfx.fire(); b.n++; b.t2 = 0.4; if (b.n >= 4) { b.st = 'idle'; b.cd = 1.1; } } }
  else if (b.st === 'spiral') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.06; b.n++; var a2 = b.n * 0.38; for (var q = 0; q < 3; q++) bshot(cx, cy, a2 + q * Math.PI * 2 / 3, 135, b.dmg * 0.5, 'blob', b.d.name); if (b.n % 6 === 0) sfx.fire(); if (b.n >= 48) { b.st = 'idle'; b.cd = 1.3; } } }
  else if (b.st === 'eye') { // the third eye: a red line warns, then a beam sweeps down the room
    if (b.n === 0) { b.n = 1; b.t2 = 0.8; b.bx0 = P.x; sfx.roar(); LAIRFX.push({ k: 'warn', x: P.x, t: 0.8 }); }
    b.t2 -= dt; if (b.t2 <= 0 && b.n === 1) { b.n = 2; b.t2 = 1.1; LAIRFX.push({ k: 'sweep', x: b.bx0, dir: P.x > b.bx0 ? 1 : -1, t: 1.1, dmg: b.dmg * 0.9 }); G.shake = 6; }
    if (b.n === 2 && b.t2 <= 0) { b.st = 'idle'; b.cd = 1.2; }
  }
  else if (b.st === 'rain') { b.t2 -= dt; if (b.t2 <= 0) { b.n++; b.t2 = 0.16; var rx = clamp(P.x + (Math.random() - 0.5) * 300, 20, W - 20); eshots.push({ x: rx, y: -20, vx: 0, vy: 260, life: 3, r: 6, dmg: b.dmg * 0.6, k: 'blob', by: 'goo from above' }); if (b.n === 1) sfx.roar(); if (b.n >= (ph === 2 ? 16 : 10)) { b.st = 'idle'; b.cd = 1.2; } } }
  else if (b.st === 'summon') { ['blumling', 'blumeye'].forEach(function (k2, s) { var e = mkEnemy(k2, clamp(b.x + (s ? 100 : -100), 60, W - 60), s ? 140 : 15 * T, -1); enemies.push(e); poof(e.x, e.y - 10, 12, ['#9a4aff', '#ff2630']); }); sfx.roar(); b.st = 'idle'; b.cd = 1.4; }
  else if (b.st === 'goo') { // goo floods the floor for a while: get up on the ledges
    if (b.n === 0) { b.n = 1; LAIRFX.push({ k: 'flood', t: 4.2, dmg: b.dmg * 0.5 }); G.banner = 1.2; G.bannerTxt = 'THE GOO RISES'; G.bannerSub = 'GET UP HIGH'; sfx.roar(); b.t2 = 1.2; }
    b.t2 -= dt; if (b.t2 <= 0) { b.st = 'ring'; b.n = 0; b.t2 = 0.3; }
  }
  else if (b.st === 'flood') { b.st = 'goo'; b.n = 0; }
  else if (b.st === 'slam') {
    if (b.n === 0) { b.tx = P.x; b.n = 1; b.t2 = 0.55; }
    if (b.n === 1) { b.x += clamp(b.tx - b.x, -280 * dt, 280 * dt); b.y += (90 - b.y) * Math.min(1, dt * 3); b.t2 -= dt; if (b.t2 <= 0) { b.n = 2; b.vy = 0; } }
    else if (b.n === 2) { b.vy += 1600 * dt; b.y += b.vy * dt; if (b.y >= 15 * T) { b.y = 15 * T; b.n = 3; b.t2 = 0.7; G.shake = 16; sfx.land(); for (var s2 = -1; s2 <= 1; s2 += 2) { waves.push({ x: b.x + s2 * 44, y: 15 * T, dir: s2, life: 2.6, dmg: b.dmg * 0.8, by: b.d.name }); if (third) waves.push({ x: b.x + s2 * 44, y: 15 * T, dir: s2, life: 2.6, dmg: b.dmg * 0.6, by: b.d.name, slow: 1 }); } } }
    else { b.t2 -= dt; if (b.t2 < 0.4) b.y += (hy - b.y) * Math.min(1, dt * 2); if (b.t2 <= 0) { b.st = 'idle'; b.cd = 1.2; } }
  }
};
function lairFxStep(dt) {
  LAIRFX.forEach(function (f) {
    f.t -= dt;
    if (f.k === 'sweep') { f.x += f.dir * 340 * dt; if (P.state !== 'dead' && Math.abs(P.x - f.x) < 14) hurtP(f.dmg, f.x, "Mega Blumhead's third eye"); if (Math.random() < 0.6) poof(f.x, 15 * T - 2, 2, ['#c08aff', '#ff2630']); }
    if (f.k === 'flood') { var lv = floodY(f); if (P.state !== 'dead' && P.y > lv + 6 && P.inv <= 0) { hurtP(f.dmg, P.x - P.face, "Blumhead's goo"); P.vy = -400; } }
  });
  LAIRFX = LAIRFX.filter(function (f) { return f.t > 0; });
}
function floodY(f) { var k = f.t > 3.4 ? (4.2 - f.t) / 0.8 : f.t < 0.8 ? f.t / 0.8 : 1; return 15 * T - k * 4.6 * T; }
function drawLairFx(cx) {
  LAIRFX.forEach(function (f) {
    var x = Math.round(f.x - cx), gy = 15 * T;
    if (f.k === 'warn') R(ctx, Math.floor(G.t * 14) % 2 ? '#ff2630' : '#9a4aff', x - 1, 0, 2, gy);
    else if (f.k === 'sweep') { ctx.save(); ctx.shadowColor = '#9a4aff'; ctx.shadowBlur = 16; R(ctx, '#9a4aff', x - 10, 0, 20, gy); R(ctx, '#ffd0ff', x - 4, 0, 8, gy); ctx.restore(); }
    else if (f.k === 'flood') { var y = Math.round(floodY(f)); R(ctx, '#34106a', 0, y, VW, gy - y + 4); R(ctx, '#7a2ad8', 0, y, VW, 3); for (var wx = 0; wx < VW; wx += 4) if (Math.sin((wx + cx) * 0.1 - G.t * 5) > 0.5) R(ctx, '#c08aff', wx, y - 1, 4, 2); }
  });
}

/* ---------- the lair's rooms ---------- */
/* the beating heart: kill it and a chest drops out of it; while it lives it spits out blumlings */
function heartDown(e) {
  rsOf(G.roomKey).heartDone = 1; L.ents.push({ k: 'chest', x: e.x, y: 15 * T, big: 1, i: 'lh', open: false }); G.banner = 1.6; G.bannerTxt = 'THE HEART STOPS'; G.bannerSub = ''; G.shake = 8; sfx.goal();
  enemies.forEach(function (o) { if (o.alive && o.k === 'blumling' && o.fromHeart) hurtE(o, 1e6, 'boom'); });
}
function lairSpawn(rs) { // a heart you already killed leaves its chest behind
  if (!rs.heartDone || L.ents.some(function (q) { return q.i === 'lh'; })) return; var h = L.ents.filter(function (q) { return q.k === 'enemy' && q.e === 'lheart'; })[0]; if (h) L.ents.push({ k: 'chest', x: h.x, y: 15 * T, big: 1, i: 'lh', open: !!rs.c.lh });
}
function heartAI(e, dt) {
  e.vx = 0; e.cd -= dt; e.fr = Math.floor(e.t * 2.4) % 2;
  if (e.cd <= 0) { e.cd = 3.2; var mine = enemies.filter(function (o) { return o.alive && o.fromHeart; }).length; if (mine < 3) { var m = mkEnemy('blumling', e.x + (Math.random() < 0.5 ? -24 : 24), e.y, -1); m.vy = -260; m.fromHeart = 1; m.safe = 0.4; enemies.push(m); sfx.splat(); poof(e.x, e.y - 30, 10, ['#ff2630', '#9a4aff']); } }
  moveBody(e, dt, GRAV);
}
/* rising goo rooms and the wall eye */
function lairStep(dt) {
  if (!G.rm || G.rm.area !== 'lair' || L.arena) return;
  L.ents.forEach(function (e) {
    if (e.k === 'goo') {
      e.t = (e.t + dt) % 11; var k = e.t < 4 ? 0 : e.t < 6 ? (e.t - 4) / 2 : e.t < 8.5 ? 1 : e.t < 10.5 ? 1 - (e.t - 8.5) / 2 : 0;
      e.lv = 15 * T - k * e.top * T; e.warn = e.t > 3 && e.t < 4;
      if (e.warn && !e.said) { e.said = 1; pop(P.x, P.y - P.h - 8, 'THE GOO RISES', '#c08aff'); sfx.roar(); } if (e.t < 3) e.said = 0;
      if (k > 0.05 && P.state === 'normal' && P.inv <= 0 && P.y > e.lv + 6) { sfx.splat(); hurtP(8 + 3 * tierOf(), P.x - P.face, "Blumhead's goo"); P.vy = -420; }
    } else if (e.k === 'walleye') {
      e.t += dt; var cyc = e.t % 4.2;
      e.open = cyc > 1.4; e.aim = cyc > 1.4 && cyc < 2.4; e.fire = cyc >= 2.4 && cyc < 2.75;
      if (e.aim) e.by = P.y - P.h / 2;
      if (e.fire && !e.hit && P.state !== 'dead' && Math.abs((P.y - P.h / 2) - e.by) < 10) { e.hit = 1; hurtP(12 + 4 * tierOf(), e.x, 'the wall eye'); }
      if (cyc < 2.4) e.hit = 0;
      if (e.fire && !e.boom) { e.boom = 1; sfx.fire(); G.shake = Math.max(G.shake, 4); } if (!e.fire) e.boom = 0;
    }
  });
}
function drawLairBack(cx) { // drawn behind the foes
  if (!G.rm || G.rm.area !== 'lair' || L.arena) return;
  L.ents.forEach(function (e) {
    var x = Math.round(e.x - cx);
    if (e.k === 'walleye') { spr(e.open ? 'p_walleye' : 'p_walleyeshut', x, e.y + 20, false, 1); }
    else if (e.k === 'deco' && e.d === 'lairsign') drawLairSign(x, e.y);
  });
}
function drawLairFront(cx) { // the goo and the eye's beam go over everything
  if (!G.rm || G.rm.area !== 'lair' || L.arena) return;
  L.ents.forEach(function (e) {
    if (e.k === 'goo') {
      var y = Math.round(e.lv); if (e.warn) for (var b = 0; b < 8; b++) R(ctx, '#c08aff', Math.round((b * 61 + G.t * 40) % VW), 15 * T - 3 - (Math.floor(G.t * 8 + b) % 3), 2, 2);
      if (y < 15 * T - 1) { R(ctx, '#34106a', 0, y, VW, 15 * T - y); R(ctx, '#7a2ad8', 0, y, VW, 3); R(ctx, '#5a1aa8', 0, y + 3, VW, 4); for (var wx = 0; wx < VW; wx += 4) if (Math.sin((wx + cx) * 0.12 - G.t * 4) > 0.55) R(ctx, '#e0b0ff', wx, y - 1, 4, 2); }
    } else if (e.k === 'walleye' && (e.aim || e.fire)) {
      var by = Math.round(e.by);
      if (e.aim) { if (Math.floor(G.t * 14) % 2) R(ctx, '#ff2630', 0, by, VW, 1); }
      else { ctx.save(); ctx.shadowColor = '#9a4aff'; ctx.shadowBlur = 14; R(ctx, '#9a4aff', 0, by - 6, VW, 12); R(ctx, '#ffd0ff', 0, by - 2, VW, 4); ctx.restore(); }
    }
  });
}
function drawLairSign(x, y) {
  ctx.save(); ctx.shadowColor = '#9a4aff'; ctx.shadowBlur = 12 + Math.sin(G.t * 5) * 3; ctx.strokeStyle = '#9a4aff'; ctx.lineWidth = 2; ctx.strokeRect(x - 100, y, 200, 30); ctx.restore();
  R(ctx, 'rgba(10,2,8,0.88)', x - 99, y + 1, 198, 28); ctx.save(); ctx.font = '22px "Pirata One", serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#c08aff'; ctx.shadowColor = '#9a4aff'; ctx.shadowBlur = 8; ctx.fillText("BLUMHEAD'S LAIR", x, y + 22); ctx.restore();
}
/* the backdrop: walls of dark flesh, pulsing veins and Blumhead's face carved huge in the gloom */
function lairBack(gx) {
  ctx.fillStyle = '#0a0208'; ctx.fillRect(0, 0, VW, VH);
  var pulse = 0.5 + Math.sin(G.t * 2.4) * 0.5, sp = 160, x0 = -((gx * 0.35) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var px = Math.round(x), n = segN(gx, 0.35, sp, x, x0);
    R(ctx, '#1a0614', px + 10, 0, 50, VH); R(ctx, '#240a1c', px + 14, 0, 10, VH); R(ctx, '#12040c', px + 54, 0, 6, VH); // a fleshy column
    for (var vy = 0; vy < VH; vy += 6) { var vx = px + 70 + Math.round(Math.sin(vy * 0.08 + n * 2.3) * 8); R(ctx, pulse > 0.6 ? '#7a0a1a' : '#4a0612', vx, vy, 2, 6); } // a vein
    R(ctx, '#12040c', px + 100, 120, 40, 60); R(ctx, '#2a0820', px + 102, 122, 36, 56); R(ctx, pulse > 0.7 ? '#9a4aff' : '#5a1a8a', px + 116, 140, 8, 8); // a pod in the wall
  }
  // the carved face far behind
  var fsp = 640, fx2 = VW / 2 + 60 - (((gx * 0.08) % fsp) + fsp) % fsp; if (fx2 < -140) fx2 += fsp; ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#5a0a2a'; ctx.beginPath(); ctx.ellipse(fx2, 120, 120, 100, 0, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#0a0208'; ctx.beginPath(); ctx.ellipse(fx2 - 40, 100, 18, 22, 0, 0, 6.28); ctx.ellipse(fx2 + 40, 100, 18, 22, 0, 0, 6.28); ctx.fill(); ctx.fillRect(fx2 - 60, 150, 120, 26);
  ctx.globalAlpha = 1;
  for (var i = 0; i < 10; i++) { var dx = (i * 97 + G.t * 12) % VW, dy = (G.t * 30 + i * 41) % VH; R(ctx, i % 2 ? '#9a4aff' : '#ff2630', Math.round(dx), Math.round(dy), 1, 2); }
}
