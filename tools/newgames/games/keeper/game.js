/* =====================================================================================================
   GOONING CAVE KEEPER: Dungeon Keeper with homunculi as the imps. You are the Keeper of a cave under Cum City. Mark rock
   and your homunculi dig it out, mine the gold seams, carry the gold home and claim the floor red. Build rooms on claimed
   floor and creatures come through the portal to live in them: a Lair to sleep, a Cream Pie Hatchery to eat, a Treasury
   for your gold, a Training Pit to get stronger. Pay them on payday or they leave. Slap them to make them work harder.
   Every few minutes heroes come through the hero gate for your Dungeon Heart: lose the heart and you lose the cave.
   Five caves; kill every hero wave (and the last hero) to win each one.
   ===================================================================================================== */
var W = 480, H = 270, KT = 16, MW = 56, MH = 40;
var SV = KIT.load('gk-save', null) || { done: 0, best: {} };
function persist() { KIT.save('gk-save', SV); }
var LEVELS = [
  { n: 'CAVE ONE', name: 'THE DAMP BIT', waves: 3, gold: 600, heroes: ['knight'], boss: null, every: 150 },
  { n: 'CAVE TWO', name: 'UNDER THE CUM CAFE', waves: 4, gold: 500, heroes: ['knight', 'harpy'], boss: null, every: 140 },
  { n: 'CAVE THREE', name: 'THE OLD SEWER', waves: 5, gold: 450, heroes: ['knight', 'harpy', 'gargoyle'], boss: 'jailer', every: 130 },
  { n: 'CAVE FOUR', name: 'BENEATH EJACULAND', waves: 5, gold: 400, heroes: ['knight', 'harpy', 'mummy', 'gargoyle'], boss: 'jailer', every: 120 },
  { n: 'CAVE FIVE', name: "SIR JOHNATHAN'S RAID", waves: 6, gold: 400, heroes: ['knight', 'harpy', 'mummy', 'gargoyle', 'jailer'], boss: 'sirj', every: 115 }
];
var BREEDS = ['gloop', 'guard', 'ember', 'frost', 'volt', 'medic', 'leech', 'scout', 'goldie', 'titan', 'blood'];
var ROOMS = {
  lair: { n: 'LAIR', cost: 25, col: '#3a1a2a', d: 'Creatures sleep here. They need a bed each.' },
  hatch: { n: 'CREAM PIE HATCHERY', cost: 35, col: '#5a4020', d: 'Cream pies grow here. Creatures eat them.' },
  treasury: { n: 'TREASURY', cost: 30, col: '#5a4a10', d: 'Your gold lives here. More room, more gold.' },
  train: { n: 'TRAINING PIT', cost: 60, col: '#4a1010', d: 'Creatures fight dummies here and grow stronger.' },
  library: { n: 'LIBRARY', cost: 70, col: '#1a2a4a', d: 'Cultists and wraiths study here. They will not come without one.' }
};
var CREATURES = {
  ghoul: { s: 'f_ghoul_', hp: 80, dmg: 8, spd: 32, pay: 30, needs: ['lair', 'hatch'], n: 'Ghoul' },
  skeleton: { s: 'f_skeleton_', hp: 70, dmg: 10, spd: 30, pay: 40, needs: ['lair', 'hatch', 'train'], n: 'Skeleton', range: 1 },
  imp: { s: 'f_imp_', hp: 60, dmg: 9, spd: 40, pay: 45, needs: ['lair', 'train'], n: 'Imp', fly: 1, range: 1 },
  cultist: { s: 'f_cultist_', hp: 70, dmg: 14, spd: 28, pay: 70, needs: ['lair', 'hatch', 'library'], n: 'Cultist', range: 1 },
  vampire: { s: 'f_vampire_', hp: 140, dmg: 16, spd: 36, pay: 110, needs: ['lair', 'library', 'train'], n: 'Vampire' },
  golem: { s: 'f_golem_', hp: 260, dmg: 22, spd: 22, pay: 140, needs: ['lair', 'hatch', 'train', 'treasury'], n: 'Golem' }
};
var HEROES = { knight: { s: 'f_knight_', hp: 120, dmg: 12, spd: 30 }, harpy: { s: 'f_harpy_', hp: 70, dmg: 9, spd: 46, fly: 1 }, gargoyle: { s: 'f_gargoyle_', hp: 110, dmg: 12, spd: 40, fly: 1 }, mummy: { s: 'f_mummy_', hp: 160, dmg: 14, spd: 24 },
  jailer: { s: 'f_jailer_', hp: 380, dmg: 22, spd: 26, big: 1 }, sirj: { s: 'f_sirj_', hp: 1400, dmg: 30, spd: 34, big: 2, n: 'SIR JOHNATHAN' } };
/* tiles: 0 rock, 1 hard rock, 2 gold seam, 3 dug floor (not yours), 4 claimed floor, 5 heart, 6 portal, 7 hero gate, 8 lava */
var G = { mode: 'title', t: 0 }, T, ROOMAT, MARK, OWN = [], CRE = [], HER = [], FX = [], CUR = { x: 0, y: 0 }, CAM = { x: 0, y: 0 }, HAND = [], L = null, HEART = null, PORTAL = null, GATE = null, BUILD = null;
function idx(i, j) { return j * MW + i; } function inMap(i, j) { return i >= 0 && j >= 0 && i < MW && j < MH; }
function srand(seed) { var s = seed >>> 0 || 1; return function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function walk(i, j, fly) { if (!inMap(i, j)) return false; var t = T[idx(i, j)]; return t >= 3 && t <= 7 || (fly && t === 8); }
function startLevel(n) {
  L = LEVELS[n]; G.lv = n; var rnd = srand(777 + n * 131), i, j; function ri(a) { return Math.floor(rnd() * a); }
  T = new Uint8Array(MW * MH); ROOMAT = new Array(MW * MH).fill(null); MARK = new Uint8Array(MW * MH);
  for (j = 0; j < MH; j++) for (i = 0; i < MW; i++) T[idx(i, j)] = (i < 1 || j < 1 || i >= MW - 1 || j >= MH - 1) ? 1 : 0;
  for (var g = 0; g < 14; g++) { var gx = 3 + ri(MW - 8), gy = 3 + ri(MH - 8); for (var k = 0; k < 8; k++) { var a = gx + ri(4), b = gy + ri(3); if (T[idx(a, b)] === 0) T[idx(a, b)] = 2; } }
  for (var h = 0; h < 10 + n * 3; h++) { var hx = 2 + ri(MW - 6), hy = 2 + ri(MH - 6); for (var k2 = 0; k2 < 5; k2++) T[idx(hx + ri(3), hy + ri(3))] = 1; }
  for (var lv = 0; lv < n; lv++) { var lx = 6 + ri(MW - 14), ly = 6 + ri(MH - 12); for (var k3 = 0; k3 < 6; k3++) T[idx(lx + ri(3), ly + ri(2))] = 8; }
  var hx0 = 8, hy0 = MH - 9; for (j = hy0 - 3; j <= hy0 + 3; j++) for (i = hx0 - 3; i <= hx0 + 3; i++) T[idx(i, j)] = 4; T[idx(hx0, hy0)] = 5; HEART = { i: hx0, j: hy0, hp: 1000, mhp: 1000 };
  var px = 20 + ri(8), py = MH - 10 + ri(4); for (j = py - 1; j <= py + 1; j++) for (i = px - 1; i <= px + 1; i++) T[idx(i, j)] = 3; T[idx(px, py)] = 6; PORTAL = { i: px, j: py, claimed: 0 };
  var gx2 = MW - 8, gy2 = 6; for (j = gy2 - 2; j <= gy2 + 2; j++) for (i = gx2 - 2; i <= gx2 + 2; i++) T[idx(i, j)] = 3; T[idx(gx2, gy2)] = 7; GATE = { i: gx2, j: gy2 };
  OWN = []; CRE = []; HER = []; FX = []; HAND = []; G.gold = L.gold; G.wave = 0; G.waveT = L.every * 0.8; G.payT = 120; G.hatchT = 0; G.pies = 0; G.imps = 0; G.lose = 0; G.attract = 0;
  for (var w = 0; w < 4; w++) OWN.push(mkImp(hx0 + (w % 2 ? 1 : -1), hy0 + (w < 2 ? 1 : -1)));
  CUR.x = hx0 * KT; CUR.y = (hy0 - 4) * KT; G.mode = 'play'; KIT.closeMenu(); G.banner = { t: 3.5, s: L.name, b: L.n }; music.play('gktheme');
}
function mkImp(i, j) { var br = BREEDS[(G.imps++ + G.lv) % BREEDS.length]; return { k: 'imp', br: br, x: (i + 0.5) * KT, y: (j + 0.5) * KT, path: null, job: null, carry: 0, t: 0, slap: 0, hp: 40, face: 1 }; }
/* ---------- paths ---------- */
function bfs(si, sj, goal, fly, max) { var D = {}, q = [[si, sj]], prev = {}; D[si + ',' + sj] = 1; for (var h = 0; h < q.length && h < (max || 4000); h++) { var c = q[h]; if (goal(c[0], c[1])) { var path = [c], k = c[0] + ',' + c[1]; while (prev[k]) { path.unshift(prev[k]); k = prev[k][0] + ',' + prev[k][1]; } return path; }
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var ni = c[0] + d[0], nj = c[1] + d[1], key = ni + ',' + nj; if (D[key]) return; D[key] = 1; if (!walk(ni, nj, fly)) { if (goal(ni, nj)) { prev[key] = c; q.push([ni, nj]); } return; } prev[key] = c; q.push([ni, nj]); }); } return null; }
function follow(o, spd, dt) { if (!o.path || !o.path.length) return true; var n = o.path[0], tx = (n[0] + 0.5) * KT, ty = (n[1] + 0.5) * KT, dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy); if (d < 2) { o.path.shift(); return !o.path.length; } o.x += dx / d * Math.min(d, spd * dt); o.y += dy / d * Math.min(d, spd * dt); if (Math.abs(dx) > 0.5) o.face = dx > 0 ? 1 : -1; return false; }
function nextTo(i, j, k) { return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { return inMap(i + d[0], j + d[1]) && T[idx(i + d[0], j + d[1])] === k; }); }
function nearClaimed(i, j) { return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { var t = inMap(i + d[0], j + d[1]) ? T[idx(i + d[0], j + d[1])] : 0; return t === 4 || t === 5; }); }
/* ---------- the homunculi: dig what you mark, mine gold, carry it home, claim floor ---------- */
function stepImps(dt) {
  OWN.forEach(function (m) { m.t += dt; var sp = m.slap > 0 ? 70 : 46; m.slap = Math.max(0, m.slap - dt); var ci = Math.floor(m.x / KT), cj = Math.floor(m.y / KT);
    if (m.held) return;
    if (m.job && m.job.t === 'carry') { if (follow(m, sp, dt)) { G.gold += m.carry; FX.push({ k: 'txt', x: m.x, y: m.y - 10, s: '+' + m.carry, t: 1, col: '#ffe36a' }); m.carry = 0; m.job = null; sfx.play('coin'); } return; }
    if (m.job && m.path && m.path.length) { follow(m, sp, dt); return; }
    if (m.job) { var J = m.job, k = idx(J.i, J.j);
      if (J.t === 'dig') { if (!MARK[k] && T[k] !== 2) { m.job = null; return; } m.work = (m.work || 0) + dt * (m.slap > 0 ? 2 : 1); if (m.work > (T[k] === 2 ? 1.2 : 0.8)) { m.work = 0; var was = T[k]; T[k] = 3; MARK[k] = 0; sfx.noise(0.06, 0.08, 500); for (var q = 0; q < 4; q++) FX.push({ k: 'dust', x: (J.i + 0.5) * KT, y: (J.j + 0.5) * KT, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, t: 0.4 });
          if (was === 2) { m.carry = 40; var home = homeTile(ci, cj); if (home) { m.job = { t: 'carry' }; m.path = home; } else { G.gold += 40; m.carry = 0; m.job = null; } } else m.job = null; } return; }
      if (J.t === 'claim') { m.work = (m.work || 0) + dt * (m.slap > 0 ? 2 : 1); if (m.work > 0.9) { m.work = 0; if (T[k] === 3 || T[k] === 6) { if (T[k] === 6) PORTAL.claimed = 1; else T[k] = 4; } m.job = null; } return; }
    }
    // find work: marked rock first, then gold next to your floor, then floor to claim
    var p = bfs(ci, cj, function (i, j) { var k = idx(i, j); return MARK[k] && (T[k] === 0 || T[k] === 2) && !OWN.some(function (o) { return o !== m && o.job && o.job.i === i && o.job.j === j; }); }, false, 2500);
    if (p) { var tgt = p.pop(); m.job = { t: 'dig', i: tgt[0], j: tgt[1] }; m.path = p.slice(1); return; }
    p = bfs(ci, cj, function (i, j) { var t = T[idx(i, j)]; return (t === 3 || (t === 6 && !PORTAL.claimed)) && nearClaimed(i, j) && !OWN.some(function (o) { return o !== m && o.job && o.job.i === i && o.job.j === j; }); }, false, 2500);
    if (p) { var c = p[p.length - 1]; m.job = { t: 'claim', i: c[0], j: c[1] }; m.path = p.slice(1); return; }
    if (Math.random() < dt) { m.path = [[ci + (Math.random() < 0.5 ? 1 : -1), cj]].filter(function (q) { return walk(q[0], q[1]); }); }
    else follow(m, sp * 0.4, dt);
  });
}
function homeTile(ci, cj) { var tre = bfs(ci, cj, function (i, j) { var r = ROOMAT[idx(i, j)]; return r === 'treasury'; }, false, 3000); if (tre) return tre.slice(1); var h = bfs(ci, cj, function (i, j) { return T[idx(i, j)] === 5; }, false, 3000); return h ? h.slice(1) : null; }
/* ---------- creatures: come through the portal when you have their rooms, eat, sleep, train, want paying ---------- */
function roomCount(k) { var n = 0; for (var q = 0; q < ROOMAT.length; q++) if (ROOMAT[q] === k) n++; return n; }
function stepCreatures(dt) {
  if (PORTAL.claimed && CRE.length < 2 + roomCount('lair')) { G.attract += dt; if (G.attract > 12) { G.attract = 0; var opts = Object.keys(CREATURES).filter(function (k) { return CREATURES[k].needs.every(function (r) { return roomCount(r) >= 4; }); }); if (opts.length) { var k = opts[Math.floor(Math.random() * opts.length)], c = CREATURES[k]; CRE.push({ k: k, d: c, x: (PORTAL.i + 0.5) * KT, y: (PORTAL.j + 0.5) * KT, hp: c.hp, lv: 1, xp: 0, hunger: 0, tired: 0, mood: 1, t: 0, path: null, act: null, face: 1, cd: 0 }); G.banner = { t: 2, s: 'A ' + c.n.toUpperCase() + ' HAS COME' }; sfx.play('magic'); } } }
  CRE.forEach(function (c) { if (c.held) return; c.t += dt; c.cd -= dt; c.hunger += dt / 60; c.tired += dt / 80; c.slap = Math.max(0, (c.slap || 0) - dt); var ci = Math.floor(c.x / KT), cj = Math.floor(c.y / KT), sp = c.d.spd * (c.slap > 0 ? 1.5 : 1);
    // heroes nearby: fight
    var foe = HER.filter(function (h) { return h.hp > 0 && Math.hypot(h.x - c.x, h.y - c.y) < 140; }).sort(function (a, b) { return Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y); })[0];
    if (foe) { var d = Math.hypot(foe.x - c.x, foe.y - c.y), rng = c.d.range ? 70 : 14; if (d > rng) { if (!c.path || !c.path.length || c.t > 1) { c.t = 0; c.path = bfs(ci, cj, function (i, j) { return Math.abs(i - Math.floor(foe.x / KT)) + Math.abs(j - Math.floor(foe.y / KT)) <= 1; }, c.d.fly, 2500); if (c.path) c.path.shift(); } follow(c, sp, dt); } else if (c.cd <= 0) { c.cd = 1; var dmg = c.d.dmg * (1 + c.lv * 0.15); foe.hp -= dmg; FX.push({ k: c.d.range ? 'bolt' : 'hit', x: foe.x, y: foe.y, fx: c.x, fy: c.y, t: 0.2 }); sfx.play('hit'); c.face = foe.x > c.x ? 1 : -1; } return; }
    var want = c.hunger > 1 && roomCount('hatch') ? 'hatch' : c.tired > 1 && roomCount('lair') ? 'lair' : roomCount('train') ? 'train' : roomCount('library') && (c.k === 'cultist' || c.k === 'vampire') ? 'library' : 'lair';
    if (c.act !== want || !c.path) { c.act = want; c.path = bfs(ci, cj, function (i, j) { return ROOMAT[idx(i, j)] === want && Math.random() < 0.3; }, c.d.fly, 3000); if (c.path) c.path.shift(); }
    if (follow(c, sp, dt) && ROOMAT[idx(ci, cj)] === want) { if (want === 'hatch' && G.pies > 0) { G.pies--; c.hunger = 0; sfx.play('splat'); c.path = null; } else if (want === 'lair') { c.tired = Math.max(0, c.tired - dt * 0.5); } else if (want === 'train') { c.xp += dt * (c.slap > 0 ? 2 : 1); if (c.xp > 20 * c.lv) { c.xp = 0; c.lv++; FX.push({ k: 'txt', x: c.x, y: c.y - 14, s: 'LEVEL ' + c.lv, t: 1.2, col: '#7aff6a' }); } } else c.path = null; if (Math.random() < dt * 0.2) c.path = null; }
    c.mood = Math.max(0, Math.min(1, 1 - Math.max(0, c.hunger - 1.5) * 0.3 - (c.unpaid || 0) * 0.4 - (c.slaps || 0) * 0.05));
    if (c.mood <= 0.05) { c.leave = 1; }
  });
  CRE = CRE.filter(function (c) { if (c.hp <= 0) { G.banner = { t: 2, s: 'A ' + c.d.n.toUpperCase() + ' DIED' }; return false; } if (c.leave) { G.banner = { t: 2, s: 'A ' + c.d.n.toUpperCase() + ' LEFT YOU' }; return false; } return true; });
  // the hatchery grows pies; payday
  G.hatchT += dt * roomCount('hatch') * 0.04; while (G.hatchT > 1) { G.hatchT--; G.pies = Math.min(roomCount('hatch') * 2, G.pies + 1); }
  G.payT -= dt; if (G.payT <= 0) { G.payT = 120; var bill = 0; CRE.forEach(function (c) { var w = c.d.pay * (1 + (c.lv - 1) * 0.3); if (G.gold >= w) { G.gold -= w; bill += w; c.unpaid = 0; } else c.unpaid = (c.unpaid || 0) + 1; }); G.banner = { t: 2.5, s: 'PAYDAY: ' + Math.round(bill) + ' GOLD' }; sfx.play('coin'); }
  var cap = 1000 + roomCount('treasury') * 250; if (G.gold > cap) G.gold = cap;
}
/* ---------- the heroes ---------- */
function stepHeroes(dt) {
  G.waveT -= dt; if (G.wave < L.waves && G.waveT <= 0) { G.wave++; G.waveT = L.every; var n = 2 + G.wave + G.lv; for (var k = 0; k < n; k++) spawnHero(L.heroes[k % L.heroes.length]); if (G.wave === L.waves && L.boss) spawnHero(L.boss); G.banner = { t: 3, s: G.wave === L.waves ? 'THE LAST WAVE' : 'HEROES ARE COMING', b: 'WAVE ' + G.wave + ' OF ' + L.waves }; sfx.play('roar'); }
  HER.forEach(function (h) { if (h.hp <= 0) return; h.t += dt; h.cd -= dt; var ci = Math.floor(h.x / KT), cj = Math.floor(h.y / KT);
    var tgt = CRE.concat(OWN).filter(function (o) { return !o.held && Math.hypot(o.x - h.x, o.y - h.y) < 100; }).sort(function (a, b) { return Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y); })[0];
    var gx = tgt ? tgt.x : (HEART.i + 0.5) * KT, gy = tgt ? tgt.y : (HEART.j + 0.5) * KT, d = Math.hypot(gx - h.x, gy - h.y);
    if (d < 16 + (h.d.big ? 10 : 0)) { if (h.cd <= 0) { h.cd = 1.1; if (tgt) { tgt.hp -= h.d.dmg; if (tgt.k === 'imp' && tgt.hp <= 0) tgt.dead = 1; } else { HEART.hp -= h.d.dmg; KIT.shake(3); } FX.push({ k: 'hit', x: gx, y: gy, t: 0.2 }); sfx.play('hit'); } return; }
    if (!h.path || !h.path.length || h.t > 1.2) { h.t = 0; var ti = Math.floor(gx / KT), tj = Math.floor(gy / KT); h.path = bfs(ci, cj, function (i, j) { return Math.abs(i - ti) + Math.abs(j - tj) <= 1; }, h.d.fly, 4000); if (h.path) h.path.shift(); }
    if (!h.path) { // no way in: they dig towards the heart (heroes are stubborn)
      var dx = Math.sign(HEART.i - ci), dy = Math.sign(HEART.j - cj), ni = ci + (dx || 0), nj = cj + (dx ? 0 : dy), k = idx(ni, nj); if (inMap(ni, nj) && T[k] === 0) { h.dig = (h.dig || 0) + dt; if (h.dig > 2.5) { h.dig = 0; T[k] = 3; } } else h.path = [[ni, nj]]; }
    follow(h, h.d.spd, dt); });
  OWN = OWN.filter(function (o) { return !o.dead; });
  HER = HER.filter(function (h) { if (h.hp <= 0) { G.gold += 40; FX.push({ k: 'txt', x: h.x, y: h.y - 10, s: '+40', t: 1, col: '#ffe36a' }); for (var i = 0; i < 8; i++) FX.push({ k: 'dust', x: h.x, y: h.y, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, t: 0.5, col: '#c4121c' }); return false; } return true; });
  if (HEART.hp <= 0 && !G.lose) { G.lose = 1; sfx.play('lose'); music.stop(1); setTimeout(loseMenu, 1500); }
  if (G.wave >= L.waves && !HER.length && !G.won) { G.won = 1; sfx.play('win'); SV.done = Math.max(SV.done, G.lv + 1); persist(); setTimeout(winMenu, 1500); }
}
function spawnHero(k) { var d = HEROES[k]; HER.push({ k: k, d: d, x: (GATE.i + 0.5) * KT + (Math.random() - 0.5) * 20, y: (GATE.j + 0.5) * KT + (Math.random() - 0.5) * 20, hp: d.hp, t: 0, cd: 0, path: null, face: -1 }); }
/* ---------- the hand ---------- */
function update(dt) {
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.mode !== 'play') return;
  var mv = KIT.stick(0), sp = 180 * dt; CUR.x = Math.max(8, Math.min(MW * KT - 8, CUR.x + mv.x * sp)); CUR.y = Math.max(8, Math.min(MH * KT - 8, CUR.y + mv.y * sp));
  if (KIT.ptr.tap) { CUR.x = KIT.ptr.x + CAM.x; CUR.y = KIT.ptr.y + CAM.y; act(); } else if (KIT.pressed('a')) act();
  if (KIT.pressed('b')) drop(); if (KIT.pressed('x')) slap(); if (KIT.pressed('y')) buildMenu();
  if (KIT.held('a') && BUILD && KIT.held('a')) paint();
  stepImps(dt); stepCreatures(dt); stepHeroes(dt);
  FX.forEach(function (f) { f.t -= dt; if (f.vx) { f.x += f.vx * dt; f.y += f.vy * dt; } }); FX = FX.filter(function (f) { return f.t > 0; });
  CAM.x += (CUR.x - KIT.W / 2 - CAM.x) * 0.15; CAM.y += (CUR.y - H / 2 - CAM.y) * 0.15; CAM.x = Math.max(0, Math.min(MW * KT - KIT.W, CAM.x)); CAM.y = Math.max(-24, Math.min(MH * KT - H + 24, CAM.y));
}
function curTile() { return [Math.floor(CUR.x / KT), Math.floor(CUR.y / KT)]; }
function act() {
  var c = curTile(), k = idx(c[0], c[1]);
  if (BUILD) { paint(); return; }
  var who = OWN.concat(CRE).filter(function (o) { return Math.hypot(o.x - CUR.x, o.y - CUR.y) < 12; })[0];
  if (who && HAND.length < 8) { who.held = 1; who.path = null; who.job = null; HAND.push(who); sfx.play('blip'); return; }
  if (T[k] === 0 || T[k] === 2) { MARK[k] = MARK[k] ? 0 : 1; sfx.play('tick'); }
}
function drop() { if (!HAND.length) return; var c = curTile(); if (!walk(c[0], c[1])) { sfx.play('no'); return; } var o = HAND.pop(); o.held = 0; o.x = CUR.x; o.y = CUR.y; o.path = null; o.job = null; sfx.play('land'); }
function slap() { var who = OWN.concat(CRE).filter(function (o) { return !o.held && Math.hypot(o.x - CUR.x, o.y - CUR.y) < 14; })[0]; if (!who) return; who.slap = 8; who.hp -= 4; who.slaps = (who.slaps || 0) + 1; sfx.play('hit'); FX.push({ k: 'txt', x: who.x, y: who.y - 12, s: 'SLAP!', t: 0.6, col: '#ff2630' }); KIT.shake(2); }
function paint() { var c = curTile(), k = idx(c[0], c[1]); if (T[k] !== 4 || ROOMAT[k] === BUILD) return; var R0 = ROOMS[BUILD]; if (G.gold < R0.cost) { sfx.play('no'); return; } G.gold -= R0.cost; ROOMAT[k] = BUILD; sfx.play('step'); }
function draw() {
  R('#070405', 0, 0, KIT.W, H); if (!T) { titleBack(); return; }
  var x0 = Math.floor(CAM.x / KT), y0 = Math.floor(CAM.y / KT), g = KIT.ctx;
  for (var j = y0; j < y0 + Math.ceil(H / KT) + 2; j++) for (var i = x0; i < x0 + Math.ceil(KIT.W / KT) + 2; i++) { if (!inMap(i, j)) continue; var t = T[idx(i, j)], sx = i * KT - CAM.x, sy = j * KT - CAM.y, v = (i * 7 + j * 13) % 5;
    if (t === 0 || t === 2) { R('#3a2a24', sx, sy, KT, KT); R('#4a362e', sx + 1, sy + 1, KT - 2, 4); R('#2a1e1a', sx, sy + KT - 3, KT, 3); if (v === 1) R('#2a1e1a', sx + 5, sy + 7, 4, 2); if (t === 2) { R('#ffc840', sx + 3, sy + 4, 3, 3); R('#ffe36a', sx + 9, sy + 9, 3, 2); R('#a8741a', sx + 6, sy + 11, 2, 2); }
      if (MARK[idx(i, j)]) { R('rgba(255,227,106,0.25)', sx, sy, KT, KT); R('#ffe36a', sx, sy, KT, 1); R('#ffe36a', sx, sy, 1, KT); } }
    else if (t === 1) { R('#1a1414', sx, sy, KT, KT); R('#2a2222', sx + 2, sy + 2, 5, 4); R('#100a0a', sx + 8, sy + 9, 6, 5); }
    else if (t === 8) { R('#c4301a', sx, sy, KT, KT); R('#ffb030', sx + (G.t * 10 + i * 3) % 12, sy + 5, 4, 2); }
    else { var own = t === 4 || t === 5; R(own ? '#2a0a0e' : '#241a16', sx, sy, KT, KT); R(own ? '#3a0e14' : '#2e221c', sx + 1, sy + 1, KT - 2, KT - 2); if (own && v === 0) R('#6a0a10', sx + 6, sy + 6, 4, 4);
      var rm = ROOMAT[idx(i, j)]; if (rm) { R(ROOMS[rm].col, sx + 1, sy + 1, KT - 2, KT - 2); if (rm === 'treasury' && v < 3) R('#ffe36a', sx + 5, sy + 6, 5, 4); if (rm === 'hatch' && v < 2) KIT.spr('it_pie', sx + 8, sy + 8, { anchor: 'c', sc: 0.6 }); if (rm === 'lair' && v === 0) R('#5a3a4a', sx + 3, sy + 4, 10, 8); if (rm === 'train' && v === 0) { R('#a8743a', sx + 7, sy + 3, 2, 11); R('#a8743a', sx + 4, sy + 6, 8, 2); } if (rm === 'library' && v < 2) { R('#6a0a10', sx + 3, sy + 3, 3, 9); R('#1a3a6a', sx + 7, sy + 3, 3, 9); } } } }
  // the heart, the portal, the gate
  var hx = (HEART.i + 0.5) * KT - CAM.x, hy = (HEART.j + 0.5) * KT - CAM.y; KIT.spr('p_heart' + (Math.floor(G.t * 2) % 2), hx, hy + 12, { sc: 0.55 + Math.sin(G.t * 4) * 0.02 });
  var px = (PORTAL.i + 0.5) * KT - CAM.x, py = (PORTAL.j + 0.5) * KT - CAM.y; g.fillStyle = PORTAL.claimed ? '#c04aff' : '#4a3a4a'; g.beginPath(); g.arc(px, py, 18 + Math.sin(G.t * 3) * 2, 0, 6.3); g.fill(); g.fillStyle = '#12040a'; g.beginPath(); g.arc(px, py, 10, 0, 6.3); g.fill();
  var gx = (GATE.i + 0.5) * KT - CAM.x, gy = (GATE.j + 0.5) * KT - CAM.y; R('#c8c0b0', gx - 14, gy - 20, 28, 34); R('#f1e7d0', gx - 10, gy - 16, 20, 30); R('#ffe36a', gx - 2, gy - 22, 4, 6);
  function who(o, sprite) { var sx = o.x - CAM.x, sy = o.y - CAM.y; if (sx < -30 || sx > KIT.W + 30 || sy < -30 || sy > H + 40) return; KIT.spr(sprite, sx, sy + 7, { flip: o.face < 0, sc: o.sc || 0.7, flash: o.slap > 7.8 }); }
  OWN.forEach(function (m) { if (m.held) return; who(m, 'h_' + m.br + '_baby_' + (m.path && m.path.length ? 'run' + (Math.floor(G.t * 8) % 4) : 'idle0')); if (m.carry) KIT.spr('gr_coin', m.x - CAM.x, m.y - CAM.y - 14, { anchor: 'c' }); if (m.job && m.job.t === 'dig' && !(m.path && m.path.length)) R('#f1e7d0', m.x - CAM.x + m.face * 6, m.y - CAM.y - 4 - (Math.floor(G.t * 8) % 2) * 3, 2, 4); });
  CRE.forEach(function (c) { if (c.held) return; who(c, c.d.s + (Math.floor(G.t * 6 + c.x) % 4)); if (c.lv > 1) KIT.text('' + c.lv, c.x - CAM.x + 6, c.y - CAM.y - 18, { size: 6, col: '#7aff6a' }); if (c.mood < 0.4) KIT.text('!', c.x - CAM.x - 2, c.y - CAM.y - 22, { size: 8, col: '#ff2630' }); });
  HER.forEach(function (h) { var o = { x: h.x, y: h.y, face: h.face, sc: h.d.big === 2 ? 0.55 : h.d.big ? 1 : 0.75 }; who(o, h.d.s + (Math.floor(G.t * 6 + h.x) % (h.d.big === 2 ? 2 : 4))); R('#12040a', h.x - CAM.x - 9, h.y - CAM.y - 22, 18, 3); R('#f1e7d0', h.x - CAM.x - 8, h.y - CAM.y - 21, 16 * h.hp / h.d.hp, 1); });
  FX.forEach(function (f) { var sx = f.x - CAM.x, sy = f.y - CAM.y; if (f.k === 'txt') KIT.text(f.s, sx, sy - (1 - f.t) * 10, { align: 'center', size: 6, col: f.col, outline: 1 }); else if (f.k === 'hit') R('#ff2630', sx - 3, sy - 3, 6, 6); else if (f.k === 'bolt') { g.strokeStyle = '#c04aff'; g.lineWidth = 2; g.beginPath(); g.moveTo(f.fx - CAM.x, f.fy - CAM.y); g.lineTo(sx, sy); g.stroke(); } else R(f.col || '#6a5a4a', sx, sy, 2, 2); });
  // the hand
  var cx = CUR.x - CAM.x, cy = CUR.y - CAM.y; var c = curTile(); R('rgba(255,255,255,0.12)', c[0] * KT - CAM.x, c[1] * KT - CAM.y, KT, KT);
  g.fillStyle = '#12040a'; g.fillRect(cx - 1, cy - 1, 12, 14); g.fillStyle = BUILD ? '#ffe36a' : '#f1e7d0'; g.fillRect(cx, cy, 10, 12); g.fillStyle = '#c4121c'; g.fillRect(cx, cy + 10, 10, 3); for (var n = 0; n < HAND.length; n++) R('#7aff6a', cx + 12 + n * 3, cy, 2, 2);
  hud();
}
function titleBack() { var g = KIT.ctx; for (var j = 0; j < H; j += 16) for (var i = 0; i < KIT.W; i += 16) R(((i + j) / 16) % 3 ? '#2a1e1a' : '#3a2a24', i, j, 15, 15); g.fillStyle = '#c4121c'; g.beginPath(); g.arc(KIT.W / 2, 80, 30, 0, 6.3); g.fill(); }
function hud() {
  R('#0e0708', 0, 0, KIT.W, 22); R('#4a1a1c', 0, 22, KIT.W, 1); if (KIT.W < 460) R('#0e0708', 0, 0, KIT.W, 0);
  KIT.spr('gr_coin', 8, 6, { anchor: 'tl' }); KIT.text(String(Math.round(G.gold)), 22, 8, { size: 8, col: '#ffe36a' });
  KIT.text('HEART', 90, 4, { size: 6, col: '#a6968f' }); KIT.bar(90, 13, 70, 4, HEART.hp / HEART.mhp, '#c4121c');
  var nar = KIT.W < 460; KIT.text('HOMUNCULI ' + OWN.length + '  CREATURES ' + CRE.length + '  PIES ' + G.pies, nar ? 8 : 172, nar ? 40 : 8, { size: 6, outline: nar ? 1 : 0 });
  KIT.text(G.wave < L.waves ? 'NEXT WAVE ' + Math.max(0, Math.ceil(G.waveT)) + 'S' : 'LAST WAVE', 8, KIT.W < 460 ? 52 : 28, { size: 6, col: '#ff2630', outline: 1 });
  if (BUILD) KIT.text('BUILDING: ' + ROOMS[BUILD].n, 8, H - 12, { size: 6, col: '#ffe36a' });
  if (HAND.length) KIT.text('IN YOUR HAND: ' + HAND.length + '  (B TO DROP)', KIT.W - 8, H - 12, { align: 'right', size: 6, col: '#7aff6a' });
  if (G.banner) { var a = Math.min(1, G.banner.t, 3.5 - G.banner.t); if (G.banner.b) KIT.text(G.banner.b, KIT.W / 2, H * 0.32, { align: 'center', size: 6, col: '#a6968f', alpha: a }); KIT.text(G.banner.s, KIT.W / 2, H * 0.32 + 10, { align: 'center', font: 'title', size: 24, col: '#ffe36a', alpha: a, outline: 1 }); }
}
/* ---------- menus ---------- */
function winMenu() { KIT.menu({ title: 'Cave Held', sub: L.n + ': ' + L.name, html: '<p>The last hero is dragged off to the Training Pit. Your homunculi throw a little party in the Hatchery.</p>', items: [G.lv < LEVELS.length - 1 ? { label: 'NEXT CAVE', def: true, fn: function () { startLevel(G.lv + 1); } } : { label: 'THE END', def: true, fn: ending }, { label: 'TITLE', back: true, fn: titleMenu }] }); }
function loseMenu() { KIT.menu({ title: 'Heart Destroyed', sub: 'The heroes take your cave.', items: [{ label: 'TRY AGAIN', def: true, fn: function () { startLevel(G.lv); } }, { label: 'TITLE', back: true, fn: titleMenu }] }); }
function ending() { G.mode = 'end'; KIT.menu({ title: 'Keeper of Cum City', html: '<p>Sir Johnathan limps home, hissing. Nobody comes down to the caves any more. Your homunculi have dug a hot tub. You have earned it.</p>', items: [{ label: 'TITLE', back: true, def: true, fn: titleMenu }] }); }
function caveMenu() { KIT.menu({ title: 'Pick a Cave', items: LEVELS.map(function (l, n) { return { label: l.n + '  ' + l.name, dis: n > SV.done, fn: function () { startLevel(n); } }; }).concat([{ label: 'BACK', back: true, fn: titleMenu }]) }); }
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p><b>The hand</b>: move it with the stick / d-pad / WASD, or tap the screen. <b>A</b> on rock marks it for digging (gold seams too); A on a homunculus or creature picks it up. <b>B</b> drops what you hold. <b>X</b> slaps (they work faster for a while, but they do not like it). <b>Y</b> the build menu: paint rooms on your red floor, or hatch more homunculi.</p><p>Your homunculi dig what you mark, mine gold, carry it to the Treasury (or the Heart) and claim floor red. Claim the purple portal and creatures come, if you have the rooms they want (four tiles of each). Feed them (Hatchery), give them beds (Lair), pay them (payday every two minutes). Heroes come through the white gate: keep them off your Heart.</p><p><b>The camera</b>: turn it with the right stick, Q / E or the shoulder buttons, or twist two fingers on the screen; zoom with the right stick, R / F, the mouse wheel or a pinch. The hand moves the way the camera looks.</p>',
  items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode !== 'play') return; KIT.menu({ cls: 'clear', title: 'Paused', sub: L.n + ': ' + L.name, items: [{ label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, { label: 'BUILD', fn: buildMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT', fn: titleMenu }] }); }
function titleMenu() { G.mode = 'title'; T = null; music.play('gktheme'); KIT.menu({ cls: 'clear', logo: '../assets/gk-logo.webp', title: 'Gooning Cave Keeper', items: [{ label: SV.done ? 'CARRY ON' : 'START', cls: 'hot', def: true, fn: function () { startLevel(Math.min(SV.done, LEVELS.length - 1)); } }, SV.done ? { label: 'PICK A CAVE', fn: caveMenu } : null, { label: 'HOW TO PLAY', fn: helpMenu }] }); }
music.songs.gktheme = { bpm: 92, beats: 4, vol: 0.85, wet: 0.5, lead: 'organlead', bass: 'walk', acc: 'bell', drums: 'slow', chords: 'Gm Gm Eb D Gm Cm D D', mel: 'g4 - bb4 - d5 - g5 - | f5 - d5 - bb4 - - - | eb5 - g5 - bb5 - g5 - | f#5 - - - d5 - - - | g5 - - - bb5 - a5 g5 | c6 - bb5 - g5 - eb5 - | d5 - f#5 - a5 - c6 - | bb5 - a5 - g5 - f#5 -' };
KIT.start({ w: W, h: H, flex: 720, update: update, draw: draw, onPause: pauseMenu, startPauses: true, pad: { btns: [{ k: 'a', label: 'A', sub: 'DIG / GRAB', cls: 'big' }, { k: 'b', label: 'B', sub: 'DROP' }, { k: 'x', label: 'X', sub: 'SLAP' }, { k: 'y', label: 'Y', sub: 'BUILD' }] } });
KIT.setKeymap({ KeyR: 'zin', KeyF: 'zout', Equal: 'zin', Minus: 'zout', PageUp: 'zin', PageDown: 'zout', ArrowLeft: 'sleft', ArrowRight: 'sright', ArrowUp: 'sup', ArrowDown: 'sdown' });
titleMenu();
window.__gk = { G: G, get OWN() { return OWN; }, get CRE() { return CRE; }, get HER() { return HER; }, get HEART() { return HEART; }, get T() { return T; }, get MARK() { return MARK; }, get ROOMAT() { return ROOMAT; }, get PORTAL() { return PORTAL; }, CUR: CUR, startLevel: startLevel, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, idx: idx, spawnHero: spawnHero };
