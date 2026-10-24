/* =====================================================================================================
   ENDLESS MODE: one long run to the right. You cannot go up, down or back. Each screen is a random area
   (any of the castle's areas, the Crimson Moon, or one of three areas found only here) and a random room
   type. The way on locks until the screen is clear. Every tenth screen has a boss behind a door, including
   three bosses that only live in Endless. It never ends; everything gets harder the further you go.
   Runs are recorded on a leaderboard with a proof code, like Cumheads Quest.
   ===================================================================================================== */
var ENDLESS_BOSSES = ['ratking', 'boner', 'hotload', 'beast', 'demon', 'sperm', 'pig', 'moon', 'blum'];
var ENDLESS_TYPES = ['shrine', 'gamble', 'merchant', 'powerup', 'saws', 'crumble', 'cell', 'feast', 'trap', 'ambush', 'challenge', 'illusion', 'flume'];
var EROW = 60;
function genEndless(seed) { var W = { seed: seed, rooms: {}, list: [], endless: 1, next: 0, count: 0 }; WORLD = W; ensureEndless(4); W.start = key2(0, EROW); return W; }
function ensureEndless(n) {
  var W = WORLD;
  while (W.count < n) {
    var i = W.count, r = mulberry(hash2(W.seed, i, 777)), prev = W.list[W.list.length - 1];
    var area = i === 0 ? 'castle' : ENDLESSAREAS[Math.floor(r() * ENDLESSAREAS.length)];
    if (prev && area === prev.area && r() < 0.6) area = ENDLESSAREAS[Math.floor(r() * ENDLESSAREAS.length)];
    var type = 'normal', boss = null, cw = 1;
    if (i === 0) type = 'egate';
    else if (i % 10 === 0) { // a boss every ten screens: the three Endless bosses first, then anyone
      type = 'bossdoor'; var order = shuffle(ENDLESS_BOSSES.slice(), mulberry(hash2(W.seed, 99, 5)));
      boss = i <= 30 ? ['ratking', 'boner', 'hotload'][i / 10 - 1] : order[(i / 10 - 4) % order.length]; area = BOSSDEF[boss].area; }
    else if (r() < 0.42 && !(prev && prev.type !== 'normal')) { type = ENDLESS_TYPES[Math.floor(r() * ENDLESS_TYPES.length)]; if (type === 'flume') area = 'city'; }
    if (type === 'normal' && i > 1 && r() < 0.2) cw = 2;
    var rm = { cx: W.next, cy: EROW, area: area, type: type, ex: { l: 1, r: 1 }, exits: [{ d: 'l', i: 0 }, { d: 'r', i: 0 }], idx: i, endless: 1, cw: cw, ch: 1, boss: boss, id: i };
    if (cw === 2) rm.big = 'wide';
    W.rooms[key2(W.next, EROW)] = rm; if (cw === 2) W.rooms[key2(W.next + 1, EROW)] = rm;
    W.list.push(rm); W.next += cw; W.count++;
  }
}
function endlessTier(n) { return 1 + n * 0.12; } // keeps climbing for ever
function startEndless(cls) {
  var seed = (Math.random() * 1e9) | 0;
  RUN = { v: 1, seed: seed, cls: cls, card: null, provEff: {}, provNames: [], powers: [], drops: 0, rs: {}, t: 0, kills: 0, revive: 0, sw: false, room: null, endless: { n: 0, tier: 1 } };
  META.started = true; saveMeta();
  genEndless(seed); ST = calcStats(); RUN.hp = ST.mhp; RUN.mana = ST.mmana;
  newPlayer(); G.mode = 'play'; G.msg = null; enterRoom(WORLD.start, null);
  if (homOn()) { homHatchStart(); return; }
  G.banner = 3; G.bannerTxt = 'ENDLESS'; G.bannerSub = CLASSES[cls].name.toUpperCase() + '  ·  ONLY ONE WAY: RIGHT';
}
/* called at the end of enterRoom */
function endlessEnter() {
  if (!RUN || !RUN.endless || L.arena) return;
  var rm = G.rm, rs = rsOf(G.roomKey); ensureEndless(rm.idx + 4);
  RUN.endless.n = rm.idx; RUN.endless.tier = endlessTier(rm.idx); if (rm.idx > (RUN.endless.max || 0)) RUN.endless.max = rm.idx;
  ST = calcStats();
  G.banner = 1.6; G.bannerTxt = 'SCREEN ' + rm.idx; G.bannerSub = AREAS[rm.area].name.toUpperCase() + (rm.type === 'bossdoor' && !rs.bossDone ? '  ·  ' + BOSSDEF[rm.boss].name.toUpperCase() : '');
  G.eLock = false; G.eLockDue = false;
  if (rm.type === 'bossdoor' && !rs.bossDone) { for (var y = 12; y <= 14; y++) L.tiles[y * L.w + L.w - 1] = TW; G.layer = null; } // the way on opens when the boss is dead
  else if (enemies.length && rm.type !== 'challenge') G.eLockDue = true; // the doors shut once you are properly inside, not on top of you
}
function endlessStep(dt) {
  if (!RUN || !RUN.endless || L.arena) return;
  if (G.eLockDue) { if (!enemies.length) G.eLockDue = false; else if (P.x > 5 * T && P.x < L.w * T - 5 * T && P.onGround) { G.eLockDue = false; G.eLock = true; G.lock = true; G.layer = null; lockExits(true); sfx.lock(); } }
  if (G.eLock && !G.chal && !enemies.length) { G.eLock = false; G.lock = false; lockExits(false); G.layer = null; sfx.goal(); G.banner = 1.2; G.bannerTxt = 'CLEAR'; G.bannerSub = 'KEEP GOING RIGHT'; }
}
function endlessBossDown(b) {
  var rs = rsOf(G.retKey); rs.bossDone = 1; G.lock = false; G.layer = null; sfx.goal();
  RUN.drops += Math.round(150 * RUN.endless.tier); G.findDue = 3.2;
  var pw = shuffle(POWERS.slice())[0]; RUN.powers.push(pw.id); ST = calcStats();
  G.banner = 3; G.bannerTxt = b.d.name.toUpperCase() + ' DEFEATED'; G.bannerSub = 'YOU TAKE ' + pw.name.toUpperCase() + '  ·  THE WAY ON IS OPEN'; saveRun();
}
function endlessHud() {
  var n = RUN.endless.n, best = META.lb.length ? Math.max.apply(null, META.lb.map(function (r) { return r.screen; })) : 0, x0 = VW - 92, y0 = 6;
  R(ctx, 'rgba(7,4,5,0.75)', x0 - 3, y0 - 3, 92, 28); R(ctx, '#4a1a1c', x0 - 3, y0 - 3, 92, 1);
  text('SCREEN ' + n, x0 + 2, y0 + 8, 'left', '#ffe36a', 7); text('BEST ' + best + '  ·  BOSS ' + (Math.floor(n / 10) * 10 + 10), x0 + 2, y0 + 19, 'left', '#a6968f', 5);
}

/* ---------- the leaderboard: every run carries a proof code that cannot be typed in by hand ---------- */
function cyrbL(str, seed) { var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed; for (var i = 0; i < str.length; i++) { var ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return [h1 >>> 0, h2 >>> 0]; }
function macL(str) {
  var salt = ['ll', 'Lg', '4c', 'Q7', 'mz', '91'].join('~'), a = cyrbL(salt + '|' + str + '|' + salt.split('').reverse().join(''), 23), b = cyrbL(a[0] + ':' + str + ':' + salt, a[1] & 0xffff), A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ', out = '', n = [a[0], a[1], b[0], b[1]];
  for (var k = 0; k < 10; k++) out += A.charAt(((n[k % 4] >>> ((k * 5) % 27)) ^ (n[(k + 1) % 4] >>> 3)) & 31);
  return out.slice(0, 5) + '-' + out.slice(5);
}
function lbText(name, heir, screen, sec) { return [String(name).trim().toUpperCase(), String(heir).trim().toUpperCase(), screen, sec].join('|'); }
function lbSig(r) { return macL(lbText(r.name, r.heir, r.screen, Math.floor(r.ms / 1000))); }
function lbOk(r) { return !!r.sig && r.sig === lbSig(r); }
function recordEndless() {
  var rec = { name: META.name || 'HUNTER', heir: CLASSES[RUN.cls].name + (RUN.hom ? ' (' + homName() + ')' : ''), screen: RUN.endless.max || RUN.endless.n, ms: Math.round(RUN.t * 1000), kills: RUN.kills, date: Date.now() };
  rec.sig = lbSig(rec); META.lb.push(rec); META.lb.sort(function (a, b) { return b.screen - a.screen || a.ms - b.ms; }); META.lb = META.lb.slice(0, 20); META.lastEndless = rec; saveMeta(); return rec;
}

/* ---------- menus: the Endless Door in the Clubhouse basement ---------- */
function openEndlessMenu() {
  openMenu({ title: 'The Endless Door', note: 'No map, no way back. The doors lock until every foe is dead. A boss every ten screens.', pic: null, bank: 'none', rebuild: function () {
    var b = META.lb[0];
    return [
      { name: b ? 'BEST: SCREEN ' + b.screen + ' AS ' + b.heir.toUpperCase() : 'NO RUNS YET', cls: 'head' },
      { icon: 'scrollWarp', name: 'GO IN', sub: 'Choose any heir. Your Clubhouse levels, gear and runes come with you.', cls: 'sec', fn: openEndlessHeirs },
      { icon: 'deck', name: 'YOUR NAME: ' + (META.name || 'HUNTER'), sub: 'The name that goes on the leaderboard', fn: askName },
      { icon: 'coin', name: 'LEADERBOARD', sub: 'Names, heirs, screens and proof codes', fn: openLeaderboard },
      { icon: 'holy', name: 'VERIFY A SCREENSHOT', sub: 'Check a leaderboard screenshot is real', fn: openVerify }
    ];
  } });
}
function askName() {
  openMenu({ title: 'Your Name', note: 'Up to 12 letters.', bank: 'none', rows: [], back: openEndlessMenu, custom: function (list) {
    var inp = document.createElement('input'); inp.type = 'text'; inp.maxLength = 12; inp.value = META.name || 'HUNTER'; inp.className = 'llinput';
    inp.addEventListener('input', function () { META.name = inp.value.trim().toUpperCase().slice(0, 12) || 'HUNTER'; saveMeta(); });
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') openEndlessMenu(); });
    list.appendChild(inp); setTimeout(function () { inp.focus(); inp.select(); }, 30);
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'row sec'; ok.innerHTML = '<span class="t"><b>DONE</b></span>'; ok.addEventListener('click', openEndlessMenu); list.appendChild(ok);
  } });
}
function openLeaderboard() {
  var rows = [{ name: 'PLAYER  ·  HEIR  ·  SCREEN  ·  TIME', cls: 'head' }];
  if (!META.lb.length) rows.push({ name: 'NO RUNS YET', sub: 'Go through the Endless Door in the Clubhouse', cls: 'off' });
  META.lb.slice(0, 10).forEach(function (r, i) { var ok = lbOk(r); rows.push({ icon: i === 0 ? 'holy' : 'coin', name: (i + 1) + '. ' + r.name + '  ·  ' + r.heir.toUpperCase() + '  ·  SCREEN ' + r.screen + '  ·  ' + fmtT(r.ms / 1000), sub: ok ? 'PROOF ' + r.sig + '  ·  ' + new Date(r.date).toLocaleDateString() + '  ·  ' + r.kills + ' foes' : 'UNSIGNED OR EDITED: NOT VALID', cls: ok ? '' : 'off' }); });
  openMenu({ title: 'Endless Leaderboard', note: 'Screen taken ' + new Date().toLocaleString(), bank: 'none', rows: rows, back: openEndlessMenu });
}
function openVerify() {
  openMenu({ title: 'Verify a Run', note: 'Type what the screenshot shows. Fakes do not pass.', bank: 'none', rows: [], back: openEndlessMenu, custom: function (list) {
    var f = {};
    [['PLAYER', 'name', 'HUNTER'], ['HEIR', 'heir', 'CUMHEAD'], ['SCREEN', 'screen', '23'], ['TIME', 'time', '12:03'], ['PROOF', 'code', 'XXXXX-XXXXX']].forEach(function (q) {
      var w = document.createElement('label'); w.className = 'llfield'; var s = document.createElement('span'); s.textContent = q[0]; var inp = document.createElement('input'); inp.type = 'text'; inp.placeholder = q[2]; inp.maxLength = 24; inp.className = 'llinput';
      inp.addEventListener('keydown', function (e) { e.stopPropagation(); }); w.appendChild(s); w.appendChild(inp); list.appendChild(w); f[q[1]] = inp;
    });
    var res = document.createElement('p'); res.className = 'llres';
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'row sec'; ok.innerHTML = '<span class="t"><b>CHECK</b><i>Checks the proof code against the details</i></span>';
    ok.addEventListener('click', function () {
      var tm = f.time.value.trim().split(':'), sec = tm.length === 2 ? parseInt(tm[0], 10) * 60 + parseInt(tm[1], 10) : NaN, sc = parseInt(f.screen.value, 10);
      if (!(sec >= 0) || !(sc >= 0) || !f.name.value.trim()) { res.style.color = '#ffcf80'; res.textContent = 'Fill in player, heir, screen, time (m:ss) and the proof code.'; return; }
      var good = macL(lbText(f.name.value, f.heir.value, sc, sec)) === f.code.value.trim().toUpperCase().replace(/\s/g, '');
      res.style.color = good ? '#7dff9a' : '#ff6a70'; res.textContent = good ? 'VALID. This run is real.' : 'NOT VALID. The details do not match the proof code.'; sfx.click();
    });
    list.appendChild(ok); list.appendChild(res);
  } });
}
function openEndlessHeirs() {
  openMenu({ title: 'Who Goes In?', note: 'Any heir can take the Endless Door.', pic: null, bank: 'none', rows: [], back: openEndlessMenu, custom: function (list) {
    var wrap = document.createElement('div'); wrap.className = 'heirs four';
    CLASSORDER.forEach(function (cls) {
      var c = CLASSES[cls], b = document.createElement('button'); b.type = 'button'; b.className = 'heir';
      var cv2 = heirPic(cls) || mk(1, 1); b.appendChild(cv2);
      var h = document.createElement('b'); h.textContent = c.name; b.appendChild(h);
      var p = document.createElement('span'); p.textContent = 'HP ' + c.hp + '  ·  DMG ' + c.dmg; b.appendChild(p);
      b.addEventListener('click', function () { sfx.goal(); closeMenu(); startEndless(cls); });
      wrap.appendChild(b);
    });
    list.appendChild(wrap); list.style.display = 'flex';
  } });
}

/* ---------- the three endless bosses ---------- */
BOSSLINES.ratking = ['THE CULT OF THE RAT WELCOMES YOU. SQUEAK.', 'BROTHERS! SISTERS! THE FLOOR IS YOURS!'];
BOSSLINES.boner = ['I HAVE BEEN WAITING DOWN HERE A LONG TIME.', 'TIME TO PICK A BONE WITH YOU.'];
BOSSLINES.hotload = ['HOT. HOT. HOT.', 'COME CLOSER, LITTLE DROP. LET ME WARM YOU UP.'];
BRAIN.ratking = function (b, dt, W, ph) {
  var f = towardP(b);
  if (b.st === 'idle') { b.face = f; b.vx = f * 80; b.cd -= dt; if (b.cd <= 0) { var o = ['charge', 'leap', 'rats', 'swarm', 'tail', 'swarm']; if (enemies.length >= 5) o = ['charge', 'leap', 'tail']; b.nx = o[Math.floor(Math.random() * o.length)]; b.st = 'tell'; b.t2 = 0.5; } }
  else if (b.st === 'tell') { b.vx = 0; b.face = f; b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'charge') { b.st = 'charge'; sfx.roar(); }
    else if (b.nx === 'leap') { b.st = 'air'; b.vy = -440; b.vx = clamp((P.x - b.x) * 1.1, -260, 260); }
    else if (b.nx === 'swarm') { b.st = 'swarm'; b.t2 = 0; b.n = 0; b.sdir = P.x < W / 2 ? 1 : -1; sfx.roar(); G.banner = 1; G.bannerTxt = 'THE SWARM'; G.bannerSub = 'JUMP!'; }
    else if (b.nx === 'rats') { for (var k = 0; k < (ph === 2 ? 4 : 3); k++) { var e = mkEnemy('rat', clamp(b.x + (k - 1.5) * 30, 40, W - 40), b.y, -1); e.vy = -200; enemies.push(e); } sfx.roar(); b.st = 'idle'; b.cd = 1.4; }
    else { b.st = 'idle'; b.cd = 1.2; G.shake = 6; sfx.whip(); for (var s = -1; s <= 1; s += 2) waves.push({ x: b.x + s * 40, y: b.y, dir: s, life: 1.8, dmg: b.dmg * 0.7, by: 'the Rat King\'s tail' }); } } }
  else if (b.st === 'swarm') { // the cult pours across the floor from one wall to the other: jump it
    b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.07; b.n++; var sr = mkEnemy('rat', b.sdir > 0 ? 40 : W - 40, 15 * T, -1); sr.swarm = b.sdir; sr.hp = sr.mhp = Math.max(1, Math.round(sr.mhp * 0.5)); enemies.push(sr); if (b.n % 4 === 0) sfx.step(G.t + b.n); if (b.n >= (ph === 2 ? 22 : 15)) { b.st = 'idle'; b.cd = 1.6; } } }
  else if (b.st === 'charge') { b.vx = b.face * (ph === 2 ? 320 : 270); if (b.hitWall || b.x <= b.w / 2 + 18 || b.x >= W - b.w / 2 - 18) { b.st = 'stun'; b.t2 = 0.8; G.shake = 8; sfx.land(); } }
  else if (b.st === 'stun') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.st = 'idle'; b.cd = ph === 2 ? 0.8 : 1.2; } }
  var wasG = b.onGround; moveBody(b, dt, GRAV);
  if (b.st === 'air' && b.onGround && !wasG) { b.st = 'idle'; b.cd = 1; G.shake = 9; sfx.land(); for (var q = -1; q <= 1; q += 2) waves.push({ x: b.x + q * 34, y: b.y, dir: q, life: 2, dmg: b.dmg * 0.8, by: 'the Rat King' }); }
};
BRAIN.boner = function (b, dt, W, ph) {
  var f = towardP(b), dist = Math.abs(P.x - b.x);
  if (b.st === 'idle') { b.face = f; b.vx = dist > 120 ? f * 45 : 0; b.cd -= dt; if (b.cd <= 0) { var o = dist < 110 ? ['club', 'club', 'bones'] : ['bones', 'bones', 'club', 'raise']; if (ph === 2) o.push('raise'); if (enemies.length >= 4) o = ['bones', 'club']; b.nx = o[Math.floor(Math.random() * o.length)]; b.st = 'tell'; b.t2 = b.nx === 'club' ? 0.55 : 0.4; } }
  else if (b.st === 'tell') { b.vx = 0; b.face = f; b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'club') { b.st = 'rest'; b.t2 = 0.7; G.shake = 10; sfx.land(); var sx0 = b.face > 0 ? b.x : b.x - 90, sx1 = b.face > 0 ? b.x + 90 : b.x; fx.push({ k: 'ring', x: b.x + b.face * 50, y: b.y - 10, age: 0, c: '#e8dcc0' }); if (P.state !== 'dead' && ov(P.x - P.w / 2, P.y - P.h, P.x + P.w / 2, P.y, sx0, b.y - 40, sx1, b.y)) hurtP(b.dmg * 1.2, b.x, 'the Big Boner\'s club'); waves.push({ x: b.x + b.face * 50, y: b.y, dir: b.face, life: 2, dmg: b.dmg * 0.7, by: 'the Big Boner' }); }
    else if (b.nx === 'bones') { b.st = 'throw'; b.n = 0; b.t2 = 0; }
    else { b.st = 'rest'; b.t2 = 0.8; sfx.roar(); for (var k = 0; k < 2; k++) { var e = mkEnemy(ph === 2 ? 'knight' : 'ghoul', clamp(b.x + (k ? 80 : -80), 40, W - 40), b.y, -1); enemies.push(e); poof(e.x, e.y - 10, 12, ['#e8dcc0', '#a8202a']); } } } }
  else if (b.st === 'throw') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.3; b.n++; var tx = P.x + (Math.random() - 0.5) * 60, tt = 0.9, g = 600; eshots.push({ x: b.x, y: b.y - 70, vx: (tx - b.x) / tt, vy: (P.y - 10 - (b.y - 70) - 0.5 * g * tt * tt) / tt, g: g, life: 3, r: 5, dmg: b.dmg * 0.6, k: 'bone', by: 'a thrown bone' }); sfx.lob(); if (b.n >= (ph === 2 ? 5 : 3)) { b.st = 'idle'; b.cd = 1.2; } } }
  else if (b.st === 'rest') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.st = 'idle'; b.cd = ph === 2 ? 0.8 : 1.2; } }
  moveBody(b, dt, GRAV);
};
BRAIN.hotload = function (b, dt, W, ph) {
  var f = towardP(b);
  if (b.st === 'idle') { b.face = f; b.vx = f * 50; b.cd -= dt; if (b.cd <= 0) { var o = ['hop', 'hop', 'rain', 'spit']; if (ph === 2) o.push('split'); if (enemies.length >= 4 && b.nx === 'split') o = ['hop', 'rain']; b.nx = o[Math.floor(Math.random() * o.length)]; b.st = 'tell'; b.t2 = 0.45; b.n = 0; } }
  else if (b.st === 'tell') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'hop') { b.st = 'air'; b.vy = -480; b.vx = clamp((P.x - b.x) * 1.2, -280, 280); b.n++; }
    else if (b.nx === 'rain') { b.st = 'rain'; b.t2 = 0; b.n = 0; sfx.roar(); }
    else if (b.nx === 'spit') { var a = Math.atan2((P.y - 18) - (b.y - 40), P.x - b.x); for (var k = -2; k <= 2; k++) bshot(b.x, b.y - 40, a + k * 0.16, 200, b.dmg * 0.6, 'fire', b.d.name); sfx.fire(); b.st = 'idle'; b.cd = 1.2; }
    else { for (var s = 0; s < 3; s++) { var e = mkEnemy('slimeR', clamp(b.x + (s - 1) * 40, 40, W - 40), b.y - 20, -1); e.vy = -260; enemies.push(e); } sfx.splat(); b.st = 'idle'; b.cd = 1.4; } } }
  else if (b.st === 'rain') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.15; b.n++; var rx = clamp(P.x + (Math.random() - 0.5) * 240, 20, W - 20); eshots.push({ x: rx, y: -20, vx: 0, vy: 200, g: 300, life: 3, r: 5, dmg: b.dmg * 0.6, k: 'fire', by: 'falling fire' }); if (b.n >= (ph === 2 ? 14 : 9)) { b.st = 'idle'; b.cd = 1.2; } } }
  var wasG = b.onGround; moveBody(b, dt, GRAV);
  if (b.st === 'air' && b.onGround && !wasG) { G.shake = 9; sfx.land(); for (var q = -1; q <= 1; q += 2) waves.push({ x: b.x + q * 34, y: b.y, dir: q, life: 2, dmg: b.dmg * 0.7, by: 'the Hot Load' }); if (b.n < (ph === 2 ? 3 : 2)) { b.st = 'tell'; b.nx = 'hop'; b.t2 = 0.25; } else { b.st = 'idle'; b.cd = 1.1; } }
};

/* ---------- the endless areas' backdrops ---------- */
function sewerBack(gx) { // brick arches, rusty outfall pipes pouring cream, a cream river below, cream dripping off the vaults
  var sp = 180, x0 = -((gx * 0.5) % sp) - sp, t = G.t;
  for (var x = x0; x < VW + sp; x += sp) {
    var px = Math.round(x);
    // a brick arch: dark recess with a lighter brick rim, stepped (no smooth curves)
    for (var st = 0; st < 8; st++) { var ah = Math.round(Math.sqrt(1 - Math.pow((st - 3.5) / 4, 2)) * 26); R(ctx, '#1e1812', px + 40 + st * 12, 40 - ah, 12, VH); R(ctx, '#0c0a08', px + 42 + st * 12, 44 - ah, 8, VH); }
    for (var st2 = 0; st2 < 8; st2++) { var ah2 = Math.round(Math.sqrt(1 - Math.pow((st2 - 3.5) / 4, 2)) * 26); R(ctx, '#4a3e30', px + 40 + st2 * 12, 38 - ah2, 11, 3); R(ctx, '#6a5a44', px + 40 + st2 * 12, 38 - ah2, 11, 1); }
    // cream stalactites off the vault, one of them dripping
    for (var c = 0; c < 4; c++) { var cx2 = px + 52 + c * 22, cl = 4 + (c * 7) % 9; R(ctx, '#12040a', cx2 - 1, 40, 5, cl + 1); R(ctx, '#e6cf98', cx2, 40, 3, cl); R(ctx, '#fff6d8', cx2, 40, 1, cl - 1); }
    var dd = (t * 50 + px * 3) % 160; R(ctx, '#fff6d8', px + 75, 52 + dd, 2, 3);
    // an outfall pipe in the wall pouring a stream of cream
    var py = 110 + (Math.abs(px) % 3) * 12, pxx = px + 20;
    R(ctx, '#12040a', pxx - 2, py - 2, 26, 22); R(ctx, '#5a4632', pxx, py, 22, 18); R(ctx, '#8a6a46', pxx, py, 22, 3); R(ctx, '#3a2a1c', pxx, py + 15, 22, 3); R(ctx, '#12040a', pxx + 4, py + 4, 14, 10); R(ctx, '#e6cf98', pxx + 5, py + 10, 12, 4);
    for (var r2 = 0; r2 < 3; r2++) R(ctx, '#c8903a', pxx + 2 + r2 * 8, py + 1, 2, 2);
    for (var fy = py + 14; fy < VH - 30; fy += 3) { var wob = Math.round(Math.sin(fy * 0.3 - t * 14) * 1); R(ctx, ((fy / 3) | 0) % 2 ? '#fff6d8' : '#f1e0b0', pxx + 7 + wob, fy, 8, 3); R(ctx, '#ffffff', pxx + 8 + wob, fy, 2, 3); }
    // a grate low in the wall, cream oozing out under it
    R(ctx, '#12040a', px + 120, 170, 40, 30); R(ctx, '#2a2218', px + 122, 172, 36, 26); for (var b = 0; b < 5; b++) R(ctx, '#5a4a3a', px + 124 + b * 7, 172, 3, 26); R(ctx, '#e6cf98', px + 122, 194, 36, 4);
  }
  // the cream river along the bottom of the backdrop, in bands with moving crests
  var ry = VH - 34; R(ctx, '#d4b878', 0, ry, VW, 34); R(ctx, '#e6cf98', 0, ry, VW, 8); R(ctx, '#f4e4b8', 0, ry, VW, 3);
  for (var wx = 0; wx < VW; wx += 4) { var wv = Math.sin((wx + gx * 0.5) * 0.09 - t * 3); if (wv > 0.6) R(ctx, '#ffffff', wx, ry - 1, 4, 2); }
  ctx.fillStyle = 'rgba(30,20,10,0.15)'; ctx.fillRect(0, 0, VW, VH); // push it all back behind the play area
}
function boneBack(gx) {
  var sp = 120, x0 = -((gx * 0.6) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var px = Math.round(x);
    // a giant ribcage half-buried in the wall behind the niches
    if ((Math.round(x - x0) / sp) % 2 === 0) { for (var rb = 0; rb < 5; rb++) { var rx = px + 20 + rb * 18, top = 34 + Math.abs(rb - 2) * 10; R(ctx, '#12040a', rx - 1, top - 1, 8, VH - top + 1); R(ctx, '#4a4234', rx, top, 6, VH - top); R(ctx, '#6a604e', rx + 1, top, 2, VH - top); } R(ctx, '#12040a', px + 13, 29, 92, 8); R(ctx, '#4a4234', px + 14, 30, 90, 6); R(ctx, '#6a604e', px + 14, 30, 90, 2); }
    for (var row = 0; row < 3; row++) { var y = 50 + row * 50; R(ctx, '#060402', px + 10, y, 90, 34); for (var k = 0; k < 4; k++) { var sx = px + 16 + k * 22, sy = y + 10 + ((k + row) % 2) * 4; R(ctx, '#3a342a', sx, sy, 14, 12); R(ctx, '#0a0806', sx + 3, sy + 4, 3, 3); R(ctx, '#0a0806', sx + 8, sy + 4, 3, 3); R(ctx, '#2a2620', sx + 3, sy + 10, 8, 2); } }
  }
}
function boneChains(gx) { var sp = 140, x0 = -((gx * 0.8) % sp) - sp; for (var x = x0; x < VW + sp; x += sp) { var px = Math.round(x) + 60, len = 30 + (Math.abs(Math.round(x)) % 4) * 12; for (var cy = 0; cy < len; cy += 4) R(ctx, cy % 8 ? '#3a342a' : '#5a5040', px, cy, 2, 3); R(ctx, '#12040a', px - 5, len, 12, 11); R(ctx, '#e8dcc0', px - 4, len + 1, 10, 9); R(ctx, '#12040a', px - 2, len + 4, 2, 2); R(ctx, '#12040a', px + 2, len + 4, 2, 2); R(ctx, '#9a8a6a', px - 2, len + 8, 6, 1); } }
function furnaceBack(gx) {
  var g = ctx.createLinearGradient(0, VH * 0.5, 0, VH); g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(1, 'rgba(255,90,20,0.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  var sp = 170, x0 = -((gx * 0.6) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) { var px = Math.round(x); R(ctx, '#140604', px + 30, 70, 70, 90); R(ctx, '#2a0c06', px + 34, 74, 62, 82); var fl = 0.6 + Math.sin(G.t * 6 + px) * 0.2; ctx.fillStyle = 'rgba(255,120,30,' + fl.toFixed(2) + ')'; ctx.fillRect(px + 40, 120, 50, 30); R(ctx, '#ffe36a', px + 55, 132, 20, 10); for (var b = 0; b < 6; b++) R(ctx, '#140604', px + 38 + b * 10, 116, 4, 40); }
  for (var i = 0; i < 6; i++) { var ex = (i * 83 + G.t * 20 * (1 + i % 3)) % VW, ey = VH - ((G.t * 40 + i * 47) % VH); R(ctx, i % 2 ? '#ffb040' : '#ff5a20', Math.round(ex), Math.round(ey), 1, 1); }
}
/* furnace vents: smoke, then a column of fire */
function ventStep(e, dt) {
  e.t = (e.t + dt) % 3.4;
  if (e.t > 2.6 && P.state !== 'dead' && Math.abs(P.x - e.x) < 11 && P.y > e.y - 56) hurtP(10 + 4 * tierOf(), e.x, 'a furnace vent');
}
function drawVent(x, e) {
  var y = e.y; spr('p_vent', x, y + 1, false, 1);
  if (e.t > 2.2 && e.t <= 2.6) { if (Math.random() < 0.5) parts.push({ x: e.x + (Math.random() - 0.5) * 8, y: y - 4, vx: 0, vy: -50, life: 0.5, c: '#5a4a4a', spark: 0 }); }
  else if (e.t > 2.6) { var h = 56 + Math.round(Math.sin(G.t * 30) * 4); ctx.save(); ctx.shadowColor = '#ff7a30'; ctx.shadowBlur = 12; R(ctx, '#12040a', x - 8, y - h - 1, 16, h); R(ctx, '#c4121c', x - 7, y - h, 14, h); R(ctx, '#ff5a20', x - 6, y - h + 3, 12, h - 3); R(ctx, '#ffb040', x - 4, y - h + 8, 8, h - 8); R(ctx, '#fff09a', x - 2, y - h + 16, 4, h - 16); ctx.restore(); }
}
