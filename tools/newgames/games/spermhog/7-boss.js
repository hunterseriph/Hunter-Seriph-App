/* =====================================================================================================
   BOSSES: one at the end of every Act 2, in a locked arena. Eight hits (stomp them or shoot them), and they
   get faster under three. Each has its own moves; Blumhead comes back as Super Blumhead when he goes down.
   ===================================================================================================== */
var BOSSES = {
  beast: { name: 'THE CUM-STARVED BEAST', spr: 'f_beast_', hp: 8, moves: ['charge', 'leap', 'charge', 'roar'], song: 'hogboss' },
  kraken: { name: 'THE CREAM KRAKEN', spr: 'f_kraken_', hp: 8, moves: ['slam', 'bubbles', 'slam', 'bubbles'], song: 'hogboss', fixed: 1 },
  pig: { name: 'BROTHERS LOAD PIGGY', spr: 'f_pig_', hp: 5, moves: ['charge', 'leap', 'charge'], song: 'hogboss', two: 1 },
  boner: { name: 'THE BIG BONER', spr: 'f_boner_', hp: 8, moves: ['bones', 'pound', 'bones', 'leap'], song: 'hogboss' },
  hotload: { name: 'THE HOT LOAD', spr: 'f_hotload_', hp: 8, moves: ['rain', 'wave', 'leap', 'wave'], song: 'hogboss' },
  blum: { name: 'BLUMHEAD', spr: 'f_blum_', hp: 8, moves: ['orbs', 'leap', 'rain', 'charge'], song: 'hogfinal', next: 'blum2' },
  blum2: { name: 'SUPER BLUMHEAD', spr: 'f_blum2_', hp: 8, moves: ['orbs', 'rain', 'leap', 'wave', 'charge'], song: 'hogfinal', fast: 1.25 }
};
function startBoss(e) {
  var x0 = e.c0 * TS, x1 = e.c1 * TS; G.lock = { x0: x0, x1: x1, cam: Math.max(0, (x0 + x1) / 2 - KIT.W / 2) };
  var B = BOSSES[e.boss]; G.boss = mkBoss(e.boss, x1 - 70, e.y); if (B.two) G.boss2 = mkBoss(e.boss, x1 - 150, e.y); else G.boss2 = null;
  G.bossName = B.name; G.banner = 2.4; G.bannerTxt = B.name; music.play(B.song); G.arena = e;
}
function mkBoss(id, x, y) { var B = BOSSES[id], f = KIT.SPR[B.spr + '0'] || [0, 0, 80, 80]; return { id: id, B: B, x: x, y: y, w: f[2] * 0.42, h: f[3] * 0.9, hp: B.hp, alive: true, st: 'intro', t: 1.6, mi: 0, dir: -1, vy: 0, hitT: 0, flash: 0, fx: 0 }; }
function bossList() { return [G.boss, G.boss2].filter(function (b) { return b && b.alive; }); }
function bossHitBy(x, y) { var hit = null; bossList().forEach(function (b) { if (!hit && b.hitT <= 0 && Math.abs(x - b.x) < b.w && y > b.y - b.h && y < b.y) hit = b; }); G.lastBossHit = hit; return !!hit; }
function hitBoss(n, b) {
  b = b || G.lastBossHit; if (!b || b.hitT > 0) return; b.hp -= n; b.hitT = 0.9; sfx.play('bosshit'); G.shake = 4;
  if (b.hp <= 0) { b.alive = false; b.dead = 2.2; G.score += 1000; sfx.play('boom');
    if (!bossList().length) { var nx = b.B.next; if (nx) { G.pendingBoss = { id: nx, x: b.x, y: b.y, t: 2.2 }; } else { G.bossDone = 2.6; } } }
}
function stepBoss(dt) {
  [G.boss, G.boss2].forEach(function (b) { if (!b) return; if (b.dead > 0) { b.dead -= dt; if (Math.random() < 0.5) poof(b.x + (Math.random() - 0.5) * b.w * 2, b.y - Math.random() * b.h, 4, ['#ff2630', '#ffe36a', '#f1e7d0']); return; } if (b.alive) stepOne(b, dt); });
  if (G.bossDone > 0) { G.bossDone -= dt; if (G.bossDone <= 0) { G.bossDone = 0; freeCage(); } }
}
function stepOne(b, dt) {
  var p = PL, L = G.lock, sp = (b.hp <= 3 ? 1.35 : 1) * (b.B.fast || 1), fl = function (x) { var f = floorAt(x, b.y - 60, b.y + 60, false); return f === null ? b.y : f; };
  if (b.hitT > 0) b.hitT -= dt; b.t -= dt * sp; b.fx += dt;
  if (b.st === 'intro' || b.st === 'idle') { b.dir = p.x < b.x ? -1 : 1; if (b.t <= 0) { b.st = b.B.moves[b.mi % b.B.moves.length]; b.mi++; b.t = 0; b.s = 0; } }
  else if (b.st === 'charge') { if (!b.s) { b.s = 1; b.t = 0.6; b.cdir = p.x < b.x ? -1 : 1; b.dir = b.cdir; } if (b.t <= 0) { b.x += b.cdir * 270 * sp * dt; b.y = fl(b.x); if ((b.cdir < 0 && b.x < L.x0 + b.w + 6) || (b.cdir > 0 && b.x > L.x1 - b.w - 6)) { b.x = Math.max(L.x0 + b.w + 6, Math.min(L.x1 - b.w - 6, b.x)); G.shake = 4; sfx.play('thud'); idle(b, 1.0); } } }
  else if (b.st === 'leap') { if (!b.s) { b.s = 1; b.vy = -520; b.vx = (p.x - b.x) / 1.05; b.air = true; sfx.play('jump'); } b.vy += 990 * dt; b.x += b.vx * dt; b.x = Math.max(L.x0 + b.w, Math.min(L.x1 - b.w, b.x)); b.y += b.vy * dt; var f = fl(b.x); if (b.vy > 0 && b.y >= f) { b.y = f; G.shake = 6; sfx.play('thud'); wave(b.x, b.y); idle(b, 1.1); } }
  else if (b.st === 'roar') { if (!b.s) { b.s = 1; b.t = 1.4; sfx.play('roar'); } if (Math.random() < dt * 6) SHOTS.push({ x: L.x0 + Math.random() * (L.x1 - L.x0), y: b.y - 260, vx: 0, vy: 60, g: 500, life: 3, k: 'rock' }); if (b.t <= 0) idle(b, 0.8); }
  else if (b.st === 'slam') { if (!b.s) { b.s = 1; b.t = 0.9; b.tx = p.x; } if (b.t <= 0 && b.s === 1) { b.s = 2; b.t = 0.5; G.shake = 5; sfx.play('thud'); FX.push({ k: 'pillar', x: b.tx, y: b.y, t: 0.5 }); if (Math.abs(p.x - b.tx) < 18) hurt(b.tx); } if (b.s === 2 && b.t <= 0) idle(b, 0.9); }
  else if (b.st === 'bubbles') { if (!b.s) { b.s = 1; b.n = 0; b.t = 0.2; } if (b.t <= 0) { b.t = 0.35; b.n++; var a = Math.atan2(p.y - 20 - (b.y - b.h * 0.6), p.x - b.x); SHOTS.push({ x: b.x, y: b.y - b.h * 0.6, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, life: 4, k: 'bubble', ghost: 1 }); sfx.play('throw'); if (b.n >= 5) idle(b, 1.2); } }
  else if (b.st === 'bones') { if (!b.s) { b.s = 1; b.n = 0; b.t = 0.3; } if (b.t <= 0) { b.t = 0.45; b.n++; SHOTS.push({ x: b.x, y: b.y - b.h * 0.8, vx: (p.x - b.x) / 1.1 + (b.n - 2) * 30, vy: -330, g: 560, life: 3, k: 'bone' }); sfx.play('throw'); if (b.n >= 3) idle(b, 1); } }
  else if (b.st === 'pound') { if (!b.s) { b.s = 1; b.t = 0.7; b.ox = b.x; } if (b.s === 1) { b.y -= 260 * dt; b.x += (p.x - b.x) * Math.min(1, dt * 3); if (b.t <= 0) { b.s = 2; b.vy = 0; } } else { b.vy += 1600 * dt; b.y += b.vy * dt; var f2 = fl(b.x); if (b.y >= f2) { b.y = f2; G.shake = 7; sfx.play('thud'); wave(b.x, b.y); idle(b, 1.2); } } }
  else if (b.st === 'rain') { if (!b.s) { b.s = 1; b.t = 2.6; } if (Math.random() < dt * 5) { var rx = L.x0 + 20 + Math.random() * (L.x1 - L.x0 - 40); FX.push({ k: 'warn', x: rx, y: b.y, t: 0.7 }); SHOTS.push({ x: rx, y: b.y - 300, vx: 0, vy: 260, life: 2.2, k: b.id === 'hotload' ? 'ember' : 'goo', ghost: 1, delay: 0.7 }); } if (b.t <= 0) idle(b, 0.8); }
  else if (b.st === 'wave') { if (!b.s) { b.s = 1; b.t = 0.5; } if (b.t <= 0 && b.s === 1) { b.s = 2; wave(b.x, b.y); b.t = 0.9; } if (b.s === 2 && b.t <= 0) idle(b, 0.7); }
  else if (b.st === 'orbs') { if (!b.s) { b.s = 1; b.t = 0.5; } if (b.t <= 0 && b.s === 1) { b.s = 2; for (var i = -2; i <= 2; i++) { var a2 = Math.atan2(p.y - 20 - (b.y - b.h * 0.6), p.x - b.x) + i * 0.28; SHOTS.push({ x: b.x, y: b.y - b.h * 0.6, vx: Math.cos(a2) * 170, vy: Math.sin(a2) * 170, life: 3, k: 'orb', ghost: 1 }); } sfx.play('throw'); b.t = 0.6; } if (b.s === 2 && b.t <= 0) idle(b, 1); }
  // touching
  if (p.state === 'normal' && Math.abs(p.x - b.x) < b.w + PHW && p.y > b.y - b.h && p.y - PH < b.y) {
    if (p.vy > 60 && p.y - p.vy / 60 <= b.y - b.h + 14 && b.hitT <= 0) { hitBoss(1, b); p.vy = -380; p.vx = (p.x < b.x ? -1 : 1) * 140; }
    else if (b.hitT <= 0.5 || G.star > 0) { if (G.star > 0 && b.hitT <= 0) hitBoss(1, b); else hurt(b.x); }
  }
}
function idle(b, t) { b.st = 'idle'; b.t = t; b.s = 0; }
function wave(x, y) { [-1, 1].forEach(function (d) { SHOTS.push({ x: x + d * 20, y: y - 6, vx: d * 200, vy: 0, life: 2.2, k: 'wave', ghost: 0 }); }); }
function freeCage() { var e = G.arena, p = PL; FX.push({ k: 'cage', x: (G.lock.x0 + G.lock.x1) / 2, y: e.y, t: 3 }); sfx.play('goal'); actClear(true); }
