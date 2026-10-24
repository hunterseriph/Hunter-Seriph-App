/* =====================================================================================================
   BOSSES. Each area's boss door leads to a two-screen arena. The Blumhead door in the starting room
   opens once all four seals (bosses) are broken. Beat Blumhead five times and Super Blumhead rises after him.
   ===================================================================================================== */
function toast(t) { G.msg = { t: t, age: 0 }; }
function sealCount() { var n = 0; AREAORDER.forEach(function (a) { if (META.bosses[a]) n++; }); return n; }
function openDoor(e) {
  if (e.boss === 'blum') {
    var n = sealCount();
    if (n < 4) { sfx.lock(); toast('THE BLUMHEAD DOOR  ·  SEALS BROKEN ' + n + '/4'); return; }
    sfx.door(); enterArena('blum'); return;
  }
  if (e.boss === 'moon') { if (RUN.moonDown) { sfx.click(); toast('THE CRIMSON MOON IS DARK. FOR THIS HEIR.'); return; } sfx.door(); enterArena('moon'); return; }
  var area = BOSSDEF[e.boss].area;
  if (META.bosses[area]) { sfx.click(); toast(BOSSDEF[e.boss].name.toUpperCase() + ' IS DEAD. ITS SEAL IS BROKEN.'); return; }
  sfx.door(); enterArena(e.boss);
}
function enterArena(id) {
  G.retKey = G.roomKey; L = buildArena(id); G.lock = true; G.layer = null; G.near = null; G.winT = 0;
  enemies = []; pshots = []; eshots = []; drops = []; parts = []; pops = []; fx = []; bosses = []; waves = []; G.crumble = {};
  P.x = 3 * T; P.y = 15 * T; P.vx = 0; P.vy = 0; P.face = 1; camSnap();
  G.superDue = id === 'blum' && META.blumWins >= 5; G.broSpawned = 0; MOONFX = []; G.eclipse = 0;
  spawnBoss(id);
  G.banner = 0; bossIntro(id);
  music.play(id === 'blum2' ? 'super' : id === 'blum' ? 'blum' : 'boss'); saveRun();
}
function leaveArena() { var k = G.retKey; enterRoom(k, null, null); var dr = L.ents.filter(function (e) { return e.k === 'door'; })[0]; if (dr) { P.x = dr.x + 34; P.y = 15 * T; camSnap(); } }
function mkBoss(id, x, y, hpMul) {
  // bosses keep up with how strong the heir is, so a fight never melts in seconds
  var d = BOSSDEF[id], pw = Math.max(1, Math.pow(ST.dmg / Math.max(1, CLASSES[RUN.cls].dmg), 0.7));
  var hp = Math.round(d.hp * (hpMul || 1) * pw * (1 + 0.6 * META.ng) * (RUN.card === 'bigload' ? 1.5 : 1));
  return { boss: true, id: id, d: d, x: x, y: y, vx: 0, vy: 0, w: d.w, h: d.h, hp: hp, mhp: hp, dmg: d.dmg * (1 + 0.35 * META.ng), face: -1, st: 'intro', t: 0, cd: 1.6, flash: 0, stun: 0, alive: true, burn: 0, poison: 0, ph: 1 };
}
function spawnBoss(id) {
  var W = L.w * T;
  if (id === 'demon') { for (var i = 0; i < 4; i++) { var b = mkBoss('demon', W / 2, 120); b.slot = i; b.fly = true; b.cd = 1.5 + i * 0.9; bosses.push(b); } }
  else if (id === 'moon') { var mb = mkBoss('moon', W / 2, 110); mb.fly = true; bosses.push(mb); }
  else if (id === 'blum' || id === 'blum2') { var bb = mkBoss(id, W - 200, 150); bb.fly = true; bosses.push(bb); }
  else { var b2 = mkBoss(id, W - 160, 15 * T); bosses.push(b2); }
  G.bossGroup = id;
}
function bossDown(b) {
  sfx.kill(); poof(b.x, b.y - b.h / 2, 30, ['#ff2630', '#ffe36a', '#f1e7d0', '#b3121c']); G.shake = 10;
  // Brothers Load: both brothers have to go down. If the big one falls before his brother turns up, the brother turns up anyway.
  if (b.id === 'pig' && !G.broSpawned) { G.broSpawned = 1; brother(); }
  var left = bosses.filter(function (q) { return q.alive; }).length;
  if ((b.id === 'cowpig' || b.id === 'pig') && left > 0) { G.banner = 1.4; G.bannerTxt = 'ONE BROTHER DOWN'; G.bannerSub = 'NOW THE OTHER ONE'; return; }
  if (b.id === 'cowpig') b = { id: 'pig', d: BOSSDEF.pig, x: b.x, y: b.y, h: b.h };
  if (b.id === 'demon' && left > 0) { G.banner = 1.2; G.bannerTxt = left + ' LEFT'; G.bannerSub = ''; bosses.forEach(function (q) { if (q.alive) q.rage = (q.rage || 0) + 1; }); return; }
  if (left > 0) return;
  bosses.forEach(function (q) { if (q.alive) { q.alive = false; poof(q.x, q.y - q.h / 2, 20, ['#ff2630', '#f1e7d0']); } });
  eshots = []; waves = []; enemies.forEach(function (e) { e.alive = false; });
  var t = b.id === 'blum2' ? 6 : (b.id === 'blum' ? 5 : AREAS[BOSSDEF[b.id].area].tier);
  for (var i = 0; i < 40; i++) { var a = -Math.PI * (0.1 + 0.8 * (i / 39)), sp = 90 + Math.random() * 140; drops.push({ x: b.x, y: b.y - b.h / 2, fly: true, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, val: Math.round(dropVal() * 2) }); }
  RUN.drops += 120 * t * (1 + 0.3 * META.ng);
  if (b.id === 'blum') {
    META.blumWins++; saveMeta();
    if (G.superDue) { superTransform(b); return; } // a secret: nothing tells you he is coming
    G.winT = 4; G.winKind = 1; sfx.goal();
    blumFallScene(function () { G.banner = 3.5; G.bannerTxt = 'BLUMHEAD FALLS'; G.bannerSub = META.superWins ? 'LEGACY COMPLETE' : 'THE LOAD IS SPENT. FOR NOW.'; });
    return;
  }
  if (b.id === 'blum2') { META.superWins++; saveMeta(); G.banner = 3.5; G.bannerTxt = 'SUPER BLUMHEAD FALLS'; G.bannerSub = 'THE LOAD IS LIFTED'; G.winT = 4; G.winKind = 2; sfx.goal(); return; }
  if (b.id === 'moon') { moonDown(b); return; }
  var area = BOSSDEF[b.id].area; META.bosses[area] = 1; saveMeta();
  G.lock = false; G.layer = null; sfx.goal(); G.banner = 3; G.bannerTxt = b.d.name.toUpperCase() + ' DEFEATED'; G.bannerSub = 'SEAL ' + sealCount() + ' OF 4 BROKEN'; saveRun();
  G.sealDue = { n: sealCount(), t: 1.8 };
}
function finishLegacy(kind) {
  META.ng++; META.bosses = {}; var bonus = Math.round((kind === 2 ? 2500 : 1200) * META.ng); RUN.drops += bonus; saveMeta(); runOver(kind);
}

/* ---------- boss brains ---------- */
function bshot(x, y, a, sp, dmg, k, by) { eshots.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 4, r: k === 'big' ? 7 : 5, dmg: dmg, k: k || 'fire', by: by }); }
function updateBosses(dt) {
  if (G.superIn > 0) { G.superIn -= dt; if (G.superIn <= 0) { var sb = mkBoss('blum2', L.w * T / 2, 140); sb.fly = true; bosses = [sb]; G.bossGroup = 'blum2'; sfx.roar(); G.shake = 12; music.play('super'); } }
  if (G.winT > 0) { G.winT -= dt; if (G.winT <= 0) finishLegacy(G.winKind); }
  var W = L.w * T;
  for (var i = 0; i < bosses.length; i++) {
    var b = bosses[i]; if (!b.alive) continue; b.t += dt; if (b.flash > 0) b.flash -= dt;
    if (b.burn > 0) { b.burnT = (b.burnT || 0) - dt; if (b.burnT <= 0) { b.burnT = 0.5; b.burn--; hurtE(b, Math.max(1, ST.dmg * 0.25), 'burn'); if (!b.alive) continue; } }
    if (b.poison > 0) { b.poisT = (b.poisT || 0) - dt; if (b.poisT <= 0) { b.poisT = 0.5; b.poison--; hurtE(b, Math.max(1, ST.dmg * 0.3), 'poison'); if (!b.alive) continue; } }
    var ph = b.hp < b.mhp * 0.5 ? 2 : 1; if (ph !== b.ph) { b.ph = ph; if (b.id !== 'demon') { G.banner = 1.4; G.bannerTxt = 'ENRAGED'; G.bannerSub = ''; sfx.roar(); } if (b.id === 'pig' && !G.broSpawned) { G.broSpawned = 1; brother(); } }
    if (b.stun > 0) { b.stun -= dt; if (!b.fly) moveBody(b, dt, GRAV); continue; }
    if (b.st === 'intro') { b.cd -= dt; if (!b.fly) moveBody(b, dt, GRAV); if (b.cd <= 0) { b.st = 'idle'; b.cd = 0.6; } continue; }
    if (b.hp < b.mhp * 0.25) { if (!b.fury) { b.fury = 1; if (b.id !== 'demon') { G.banner = 1.4; G.bannerTxt = 'DESPERATE'; G.bannerSub = 'IT FIGHTS FASTER'; sfx.roar(); G.shake = 8; } } if (b.cd > 0) b.cd -= dt * 0.6; }
    var fn = BRAIN[b.id]; if (fn) fn(b, dt, W, ph);
    b.x = clamp(b.x, b.w / 2 + 16, W - b.w / 2 - 16);
    if (P.state === 'dead') continue;
    if (ov(P.x - P.w / 2, P.y - P.h, P.x + P.w / 2, P.y, b.x - b.w / 2 + 4, b.y - b.h + 4, b.x + b.w / 2 - 4, b.y)) {
      if (P.vy > 30 && P.y - 8 < b.y - b.h + 12 && P.state === 'normal') { stompBounce(); if (!b.stompT || G.t - b.stompT > 0.5) { b.stompT = G.t; hurtE(b, ST.dmg * 1.3, 'stomp'); } }
      else if (P.ooze > 0) { if (!b.oozeHit || G.t - b.oozeHit > 0.5) { b.oozeHit = G.t; hurtE(b, ST.dmg * 0.6, 'ooze'); } }
      else hurtP(b.dmg, b.x, b.d.name);
    }
  }
}
function brother() { var c = mkBoss('pig', L.w * T / 2, 7 * T, 0.4); c.id = 'cowpig'; c.d = { name: 'Cowboy Brother', sp: 'f_cowpig_', sc: 1, w: 30, h: 50 }; c.w = 30; c.h = 50; c.dmg *= 0.8; c.st = 'idle'; c.cd = 1; bosses.push(c); poof(c.x, c.y - 20, 20, ['#c8a050', '#f1e7d0']); brotherIntro(c); }
function towardP(b) { return P.x < b.x ? -1 : 1; }
var BRAIN = {
  beast: function (b, dt, W, ph) {
    var f = towardP(b), sp = ph === 2 ? 1.35 : 1;
    if (b.st === 'idle') { b.face = f; b.vx = f * 70 * sp; b.cd -= dt; if (b.cd <= 0) { var o = ['charge', 'leap', 'charge', 'howl']; if (Math.abs(P.x - b.x) < 100) o = ['swipe', 'swipe', 'leap']; b.nx = o[Math.floor(Math.random() * o.length)]; if (b.nx === 'howl' && enemies.length >= 3) b.nx = 'leap'; b.st = 'tell'; b.t2 = b.nx === 'swipe' ? 0.4 : 0.55; } }
    else if (b.st === 'tell') { b.vx = 0; b.face = f; b.t2 -= dt; if (b.t2 <= 0) { if (b.nx === 'charge') { b.st = 'charge'; sfx.roar(); } else if (b.nx === 'leap') { b.st = 'air'; b.vy = -430; b.vx = clamp((P.x - b.x) * 1.1, -260, 260); } else if (b.nx === 'swipe') { b.st = 'swipe'; b.t2 = 0.25; sfx.whip(); var sx0 = b.face > 0 ? b.x : b.x - 80, sx1 = b.face > 0 ? b.x + 80 : b.x; fx.push({ k: 'ring', x: b.x + b.face * 40, y: b.y - 20, age: 0, c: '#ff2630' }); if (P.state !== 'dead' && ov(P.x - P.w / 2, P.y - P.h, P.x + P.w / 2, P.y, sx0, b.y - 50, sx1, b.y)) hurtP(b.dmg * 1.1, b.x, 'the Beast\'s claws'); } else { b.st = 'howl'; b.t2 = 0.9; sfx.roar(); for (var k = 0; k < 2; k++) enemies.push(mkEnemy(ph === 2 ? 'ghoul' : 'bat', b.x + (k ? 40 : -40), ph === 2 ? b.y : b.y - 70, -1)); } } }
    else if (b.st === 'charge') { b.vx = b.face * 260 * sp; if (b.hitWall || b.x <= b.w / 2 + 18 || b.x >= W - b.w / 2 - 18) { b.st = 'stun'; b.t2 = 0.8; G.shake = 8; sfx.land(); } }
    else if (b.st === 'stun' || b.st === 'howl' || b.st === 'swipe') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.st = 'idle'; b.cd = (ph === 2 ? 0.9 : 1.4); } }
    var wasG = b.onGround; moveBody(b, dt, GRAV);
    if (b.st === 'air' && b.onGround && !wasG) { b.st = 'idle'; b.cd = 1.2; G.shake = 9; sfx.land(); waves.push({ x: b.x - 30, y: b.y, dir: -1, life: 2, dmg: b.dmg * 0.8, by: 'the Beast' }, { x: b.x + 30, y: b.y, dir: 1, life: 2, dmg: b.dmg * 0.8, by: 'the Beast' }); }
  },
  demon: function (b, dt, W, ph) {
    var rage = b.rage || 0, ang = G.t * (0.6 + rage * 0.25) + b.slot * Math.PI / 2, hx = W / 2 + Math.cos(ang) * 260, hy = 92 + Math.sin(ang * 2) * 26;
    if (b.st === 'idle') {
      b.x += (hx - b.x) * Math.min(1, dt * 2.2); b.y += (hy - b.y) * Math.min(1, dt * 2.2); b.face = towardP(b); b.cd -= dt;
      if (b.cd <= 0) { if (Math.random() < 0.5) { b.st = 'dive'; b.tx = P.x; b.ty = P.y - 8; b.t2 = 1.2; sfx.roar(); } else { b.cd = 2.2 - rage * 0.3; var a = Math.atan2((P.y - 18) - (b.y - 15), P.x - b.x); bshot(b.x, b.y - 15, a, 165, b.dmg * 0.8, 'fire', 'a semen demon'); if (rage >= 2) { bshot(b.x, b.y - 15, a - 0.3, 165, b.dmg * 0.8); bshot(b.x, b.y - 15, a + 0.3, 165, b.dmg * 0.8); } sfx.fire(); } }
    } else if (b.st === 'dive') {
      b.x += clamp(b.tx - b.x, -280 * dt, 280 * dt); b.y += clamp(b.ty - b.y, -280 * dt, 280 * dt); b.t2 -= dt; b.face = b.tx > b.x ? 1 : -1;
      if (b.t2 <= 0 || (Math.abs(b.tx - b.x) < 4 && Math.abs(b.ty - b.y) < 4)) { b.st = 'idle'; b.cd = 2.2 - rage * 0.35 + Math.random(); if (rage >= 1) { for (var q = 0; q < 3 + rage; q++) bshot(b.x, b.y - 15, -Math.PI / 2 - 0.9 + q * 1.8 / (2 + rage), 150, b.dmg * 0.6, 'fire', 'a semen demon'); sfx.fire(); } }
    }
  },
  sperm: function (b, dt, W, ph) {
    var f = towardP(b), dist = Math.abs(P.x - b.x);
    if (b.st === 'idle') { b.face = f; b.vx = dist > 190 ? f * 55 : (dist < 110 ? -f * 45 : 0); b.cd -= dt; if (b.cd <= 0) { var o = ph === 2 ? ['laser', 'missile', 'dash', 'swarm', 'laser'] : ['laser', 'missile', 'laser', 'swarm']; b.nx = o[Math.floor(Math.random() * o.length)]; b.st = 'tell'; b.t2 = 0.5; } }
    else if (b.st === 'tell') { b.vx = 0; b.face = f; b.t2 -= dt; if (b.t2 <= 0) { b.st = b.nx; b.n = 0; b.t2 = 0; if (b.nx === 'dash') { b.t2 = 0.7; sfx.roar(); } } }
    else if (b.st === 'laser') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.22; b.n++; eshots.push({ x: b.x + b.face * 18, y: b.y - 50 + (b.n % 2) * 26, vx: b.face * 300, vy: 0, life: 4, r: 4, dmg: b.dmg * 0.7, k: 'laser', by: 'the Sperminator' }); sfx.shoot(); if (b.n >= (ph === 2 ? 6 : 4)) { b.st = 'idle'; b.cd = 1.2; } } }
    else if (b.st === 'missile') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.35; b.n++; var tx = P.x + (Math.random() - 0.5) * 80, tt = 1.1, vx = (tx - b.x) / tt, vy = -(0.5 * 520 * tt) ; eshots.push({ x: b.x, y: b.y - 70, vx: vx, vy: vy + ((P.y - (b.y - 70)) / tt), g: 520, life: 3, r: 6, dmg: b.dmg * 0.8, k: 'big', by: 'a Sperminator missile' }); sfx.lob(); if (b.n >= 3) { b.st = 'idle'; b.cd = 1.3; } } }
    else if (b.st === 'swarm') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.16; b.n++; eshots.push({ x: b.x, y: b.y - 60, vx: (Math.random() - 0.5) * 200, vy: -160, life: 3, r: 4, dmg: b.dmg * 0.5, k: 'bolt', home: 1, by: 'a Sperminator swimmer' }); sfx.spit(); if (b.n >= (ph === 2 ? 7 : 5)) { b.st = 'idle'; b.cd = 1.4; } } }
    else if (b.st === 'dash') { b.vx = b.face * 330; b.t2 -= dt; if (b.t2 <= 0 || b.hitWall) { b.st = 'idle'; b.cd = 1; b.vx = 0; } }
    moveBody(b, dt, GRAV);
  },
  pig: function (b, dt, W, ph) {
    var f = towardP(b);
    if (b.st === 'idle') { b.face = f; b.vx = f * 60; b.cd -= dt; if (b.cd <= 0) { var o = ['charge', 'pound', 'coins', 'charge']; b.nx = o[Math.floor(Math.random() * o.length)]; b.st = 'tell'; b.t2 = 0.6; } }
    else if (b.st === 'tell') { b.vx = 0; b.face = f; b.t2 -= dt; if (b.t2 <= 0) { if (b.nx === 'charge') { b.st = 'charge'; sfx.roar(); } else if (b.nx === 'pound') { b.st = 'air'; b.vy = -470; b.vx = clamp((P.x - b.x) * 0.9, -200, 200); } else { b.st = 'coins'; b.n = 0; b.t2 = 0; } } }
    else if (b.st === 'charge') { b.vx = b.face * (ph === 2 ? 300 : 250); if (b.hitWall || b.x <= b.w / 2 + 18 || b.x >= W - b.w / 2 - 18) { b.st = 'stun'; b.t2 = 0.9; G.shake = 8; sfx.land(); } }
    else if (b.st === 'stun') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.st = 'idle'; b.cd = ph === 2 ? 0.9 : 1.4; } }
    else if (b.st === 'coins') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.18; b.n++; eshots.push({ x: b.x + b.face * 20, y: b.y - 40, vx: b.face * (80 + Math.random() * 180), vy: -260 - Math.random() * 120, g: 600, life: 3, r: 5, dmg: b.dmg * 0.6, k: 'coin', by: 'a flying coin' }); sfx.pick(G.t); if (b.n >= (ph === 2 ? 8 : 5)) { b.st = 'idle'; b.cd = 1.2; } } }
    var wasG = b.onGround; moveBody(b, dt, GRAV);
    if (b.st === 'air' && b.onGround && !wasG) { b.st = 'idle'; b.cd = 1.1; G.shake = 11; sfx.land(); for (var s = -1; s <= 1; s += 2) waves.push({ x: b.x + s * 40, y: b.y, dir: s, life: 2.2, dmg: b.dmg * 0.8, by: 'Brothers Load' }); if (ph === 2) for (s = -1; s <= 1; s += 2) waves.push({ x: b.x + s * 40, y: b.y, dir: s, life: 2.2, dmg: b.dmg * 0.6, by: 'Brothers Load', slow: 1 }); }
  },
  cowpig: function (b, dt, W) {
    b.face = towardP(b);
    if (b.st === 'idle') { b.cd -= dt; if (b.cd <= 0) { b.st = 'shoot'; b.n = 0; b.t2 = 0.2; } }
    else if (b.st === 'shoot') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.3; b.n++; var a = Math.atan2((P.y - 20) - (b.y - 30), P.x - b.x); bshot(b.x + b.face * 12, b.y - 30, a, 230, b.dmg * 0.6, 'bolt', 'the Cowboy Brother'); sfx.shoot(); if (b.n >= 3) { b.st = 'hop'; b.vy = -380; b.vx = (Math.random() < 0.5 ? -1 : 1) * 150; } } }
    else if (b.st === 'hop') { if (b.onGround && b.vy === 0) { b.st = 'idle'; b.cd = 1.6; b.vx = 0; } }
    moveBody(b, dt, GRAV);
  },
  blum: function (b, dt, W, ph) { blumBrain(b, dt, W, ph, false); },
  blum2: function (b, dt, W, ph) { blumBrain(b, dt, W, ph, true); }
};
function blumBrain(b, dt, W, ph, sup) {
  var hx = clamp(P.x + Math.sin(b.t * 0.7) * 150, 80, W - 80), hy = 96 + Math.sin(b.t * 1.7) * 20, cx = b.x, cy = b.y - b.h / 2;
  if (b.st === 'idle') {
    b.x += (hx - b.x) * Math.min(1, dt * 0.9); b.y += (hy - b.y) * Math.min(1, dt * 1.5); b.face = towardP(b); b.cd -= dt;
    if (b.cd <= 0) { var o = sup ? ['ring', 'spiral', 'aim', 'summon', 'slam', 'tele'] : ['ring', 'aim', 'summon', 'slam']; b.st = o[Math.floor(Math.random() * o.length)]; if (b.st === 'summon' && enemies.length >= 3) b.st = 'ring'; b.n = 0; b.t2 = 0.4; }
  } else if (b.st === 'ring') { b.t2 -= dt; if (b.t2 <= 0) { var nr = (sup ? 18 : 12) + (ph === 2 ? 4 : 0), off = Math.random(); for (var i = 0; i < nr; i++) bshot(cx, cy, off + i / nr * Math.PI * 2, 120, b.dmg * 0.7, 'blob', b.d.name); sfx.fire(); b.n++; b.t2 = 0.7; if (b.n >= (ph === 2 ? 3 : 2)) { b.st = 'idle'; b.cd = 1.4; } } }
  else if (b.st === 'aim') { b.t2 -= dt; if (b.t2 <= 0) { var a = Math.atan2((P.y - 18) - cy, P.x - cx); for (var k = -1; k <= 1; k++) bshot(cx, cy, a + k * 0.18, 210, b.dmg * 0.7, 'blob', b.d.name); sfx.fire(); b.n++; b.t2 = 0.45; if (b.n >= (sup ? 5 : 3)) { b.st = 'idle'; b.cd = 1.2; } } }
  else if (b.st === 'spiral') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.07; b.n++; var a2 = b.n * 0.42; bshot(cx, cy, a2, 135, b.dmg * 0.6, 'blob', b.d.name); bshot(cx, cy, a2 + Math.PI, 135, b.dmg * 0.6, 'blob', b.d.name); if (b.n % 6 === 0) sfx.fire(); if (b.n >= 40) { b.st = 'idle'; b.cd = 1.3; } } }
  else if (b.st === 'summon') { var ks = sup ? ['vampire', 'slimeR'] : ['slime', 'crawler']; for (var s = 0; s < 2; s++) { var e = mkEnemy(ks[s], clamp(b.x + (s ? 90 : -90), 60, W - 60), 15 * T, -1); enemies.push(e); poof(e.x, e.y - 10, 12, ['#ff2630', '#5a1a8a']); } sfx.roar(); b.st = 'idle'; b.cd = 1.6; }
  else if (b.st === 'slam') { if (b.n === 0) { b.vy = 0; b.tx = P.x; b.n = 1; b.t2 = 0.5; } if (b.n === 1) { b.x += clamp(b.tx - b.x, -260 * dt, 260 * dt); b.t2 -= dt; if (b.t2 <= 0) b.n = 2; } else if (b.n === 2) { b.vy += 1400 * dt; b.y += b.vy * dt; if (b.y >= 15 * T) { b.y = 15 * T; b.n = 3; b.t2 = 0.6; G.shake = 12; sfx.land(); for (var q = -1; q <= 1; q += 2) waves.push({ x: b.x + q * 30, y: 15 * T, dir: q, life: 2.5, dmg: b.dmg * 0.8, by: b.d.name }); } } else { b.t2 -= dt; b.y += (hy - b.y) * Math.min(1, dt * 2); if (b.t2 <= 0) { b.st = 'idle'; b.cd = 1.2; } } }
  else if (b.st === 'tele') { poof(b.x, b.y - 30, 16, ['#7a2aff', '#ff2630']); b.x = P.x < W / 2 ? W - 140 : 140; b.y = 110; poof(b.x, b.y - 30, 16, ['#7a2aff', '#ff2630']); b.st = 'ring'; b.n = 0; b.t2 = 0.3; }
}
