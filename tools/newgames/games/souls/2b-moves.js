/* =====================================================================================================
   DARK LOADS update 132 (his playtest: the controls were backwards, he held the weapon wrong, it moved like Roblox, not
   Dark Souls, it needs more kinds of weapon). Movement now has weight: you speed up and slow down, turn at a set rate,
   walk / jog by how far the stick goes, sprint, roll with a recovery (and a backstep with no direction), attacks commit
   you and step you forward, buttons pressed during a move are buffered, stamina waits a moment before it comes back.
   Guard just as a hit lands to PARRY, then hit them for a RIPOSTE; hit a foe from behind before it sees you for a
   BACKSTAB. Twelve weapons in eight kinds, each with its own moves (MOVES), running attack and heavy.
   ===================================================================================================== */
var MOVES = { // wind = start-up, act = hitting window, rec = recovery (comboable), lunge = step forward m/s, arc = half angle it covers
  slashR: { wind: 0.22, act: 0.14, rec: 0.32, lunge: 2.2, arc: 1.3, pose: 'slashR' },
  slashL: { wind: 0.2, act: 0.14, rec: 0.32, lunge: 2.0, arc: 1.3, pose: 'slashL' },
  over: { wind: 0.34, act: 0.12, rec: 0.42, lunge: 2.6, arc: 0.6, dmg: 1.25, pose: 'over' },
  stab: { wind: 0.16, act: 0.1, rec: 0.28, lunge: 3.0, arc: 0.35, reach: 1.15, pose: 'stab' },
  lunge: { wind: 0.3, act: 0.2, rec: 0.45, lunge: 7.5, arc: 0.45, reach: 1.2, dmg: 1.5, pose: 'lunge' },
  sweep: { wind: 0.3, act: 0.18, rec: 0.4, lunge: 1.4, arc: 1.9, reach: 1.1, pose: 'sweep' },
  spin: { wind: 0.32, act: 0.36, rec: 0.42, lunge: 1.2, arc: 3.2, reach: 1.05, dmg: 1.3, pose: 'spin' },
  slam: { wind: 0.5, act: 0.12, rec: 0.6, lunge: 3.4, arc: 3.2, reach: 1.25, dmg: 1.8, aoe: 1, pose: 'slam', armour: 1 },
  jab: { wind: 0.08, act: 0.08, rec: 0.16, lunge: 1.4, arc: 0.6, pose: 'jab' },
  hook: { wind: 0.14, act: 0.1, rec: 0.24, lunge: 1.8, arc: 1.0, dmg: 1.3, pose: 'hook' },
  upper: { wind: 0.26, act: 0.1, rec: 0.36, lunge: 1.6, arc: 0.6, dmg: 2.0, pose: 'upper' },
  run: { wind: 0.12, act: 0.16, rec: 0.4, lunge: 6.5, arc: 0.8, dmg: 1.2, pose: 'slashR' }
};
var KINDS = { // the moves each kind of weapon does: light combo, heavy, running attack, two hands?
  club: { l: ['slashR', 'slashL', 'over'], h: 'over', r: 'run' }, dagger: { l: ['stab', 'slashR', 'stab', 'slashL'], h: 'lunge', r: 'stab' },
  heavy: { l: ['over', 'over'], h: 'slam', r: 'over', two: 1 }, axe: { l: ['slashR', 'over'], h: 'spin', r: 'run', two: 1 },
  spear: { l: ['stab', 'stab', 'stab'], h: 'lunge', r: 'lunge', two: 1 }, scythe: { l: ['sweep', 'sweep'], h: 'spin', r: 'sweep', two: 1 },
  flail: { l: ['spin', 'over'], h: 'slam', r: 'spin' }, fist: { l: ['jab', 'jab', 'hook'], h: 'upper', r: 'hook' }
};
WEAPONS = {
  sausage: { n: "Amy's Sausage", c: 'club', dmg: 24, heavy: 46, spd: 1.0, reach: 2.1, sta: 15, mesh: 'sausage', d: 'Quick and meaty. Where it all starts.' },
  pin: { n: "Greebo's Rolling Pin", c: 'club', dmg: 26, heavy: 50, spd: 0.92, reach: 2.0, sta: 15, mesh: 'pin', d: 'Four swings in a row before they know it.' },
  knife: { n: 'Knife', c: 'dagger', dmg: 17, heavy: 34, spd: 0.75, reach: 1.6, sta: 9, mesh: 'knife', crit: 3.2, d: 'Fast, cheap on stamina, vicious from behind.' },
  cleaver: { n: "The Butcher's Cleaver", c: 'dagger', dmg: 26, heavy: 48, spd: 0.85, reach: 1.7, sta: 12, mesh: 'cleaver', bleed: 1, d: 'Hits make them bleed.' },
  bat: { n: 'Baseball Bat', c: 'club', dmg: 32, heavy: 64, spd: 1.08, reach: 2.3, sta: 19, mesh: 'bat', poise: 1.4, d: 'Knocks them silly.' },
  hammer: { n: 'Hammer', c: 'heavy', dmg: 44, heavy: 90, spd: 1.2, reach: 2.0, sta: 24, mesh: 'hammer', poise: 2, d: 'Heavy hits break their stance. The heavy is a jumping smash.' },
  axe: { n: 'Fireman Axe', c: 'axe', dmg: 46, heavy: 70, spd: 1.22, reach: 2.4, sta: 26, mesh: 'fireaxe', d: 'Slow. The heavy spins you round.' },
  fork: { n: 'Gravedigger Pitchfork', c: 'spear', dmg: 30, heavy: 58, spd: 1.0, reach: 3.2, sta: 16, mesh: 'fork', d: 'Keeps them at arm\'s length. And then some.' },
  scythe: { n: "The Bride's Scythe", c: 'scythe', dmg: 40, heavy: 64, spd: 1.15, reach: 2.9, sta: 24, mesh: 'scythe', d: 'Wide sweeps that catch a crowd.' },
  guitar: { n: "Pulsar's Guitar", c: 'heavy', dmg: 48, heavy: 104, spd: 1.3, reach: 2.4, sta: 28, mesh: 'guitar', poise: 2, d: 'Plays one chord. Loudly. Into faces.' },
  flail: { n: "The Jailer's Ball", c: 'flail', dmg: 42, heavy: 92, spd: 1.25, reach: 2.6, sta: 26, mesh: 'flail', guardbreak: 1, d: 'Smashes through guards.' },
  dusters: { n: 'Knuckle Dusters', c: 'fist', dmg: 16, heavy: 40, spd: 0.7, reach: 1.3, sta: 7, mesh: null, d: 'Three punches before a knife gets one in.' }
};
CHESTS = [['w', 'bat'], ['r', 'pie'], ['w', 'cleaver'], ['shard'], ['w', 'hammer'], ['w', 'fork'], ['r', 'blood'], ['w', 'axe'], ['w', 'scythe'], ['w', 'dusters'], ['w', 'flail'], ['w', 'guitar'], ['loads']];
SHOP = [{ k: 'shard', n: 'Cream Shard', d: 'One more swig in your Cum Flask.', cost: 800, max: 3 }, { k: 'w_knife', n: 'Knife', d: WEAPONS.knife.d, cost: 900, max: 1 }, { k: 'w_pin', n: "Greebo's Rolling Pin", d: WEAPONS.pin.d, cost: 1200, max: 1 },
  { k: 'w_dusters', n: 'Knuckle Dusters', d: WEAPONS.dusters.d, cost: 1400, max: 1 }, { k: 'r_tb', n: RINGS.tb.n, d: RINGS.tb.d, cost: 1500, max: 1 }, { k: 'r_condom', n: RINGS.condom.n, d: RINGS.condom.d, cost: 2000, max: 1 }];
if (!WEAPONS[SV.wpn]) SV.wpn = 'sausage'; SV.wpns = SV.wpns.filter(function (w) { return WEAPONS[w]; }); if (!SV.wpns.length) SV.wpns = ['sausage'];
function kindOf(w) { return KINDS[WEAPONS[w || SV.wpn].c] || KINDS.club; }
/* the new weapons' meshes (grip at the origin, pointing up +y like Psycho's) */
function moreMeshes() { if (OWN.pin) return; var m;
  m = M(); tub(m, [0, -0.12, 0], [0, 0.02, 0], 0.018, 0.018, '#8a5a30', 6, { cap0: 1 }); tub(m, [0, 0.02, 0], [0, 0.52, 0], 0.055, 0.055, '#d8b080', 10, { cap: 1, cap0: 1 }); tub(m, [0, 0.52, 0], [0, 0.66, 0], 0.018, 0.018, '#8a5a30', 6, { cap: 1 }); OWN.pin = m.upload();
  OWN.cleaver = RIGS.butcher && RIGS.butcher.P.weapon;
  m = M(); tub(m, [0, -0.7, 0], [0, 1.25, 0], 0.022, 0.022, '#6a4a2a', 6, { cap0: 1 }); bxp(m, -0.14, 1.22, -0.015, 0.14, 1.27, 0.015, '#7a7a80', TL('steel')); [-0.12, 0, 0.12].forEach(function (x) { tub(m, [x, 1.25, 0], [x, 1.58, 0], 0.012, 0.004, '#a0a0a8', 4); }); OWN.fork = m.upload();
  m = M(); tub(m, [0, -0.6, 0], [0, 1.25, 0], 0.024, 0.024, '#2a1a10', 6, { cap0: 1 }); tub(m, [0, 0.2, 0], [0.12, 0.24, 0], 0.014, 0.014, '#2a1a10', 4); bxp(m, -0.012, 1.1, 0.0, 0.012, 1.24, 0.75, '#c8c8d0', TL('steel')); bxp(m, -0.01, 1.04, 0.5, 0.01, 1.12, 0.8, '#e0e0e8'); OWN.scythe = m.upload();
  m = M(); tub(m, [0, -0.08, 0], [0, 0.55, 0], 0.03, 0.03, '#2a1a10', 6, { cap0: 1 }); bxp(m, -0.035, 0.5, -0.05, 0.035, 0.62, 0.05, '#1a1a1a'); ell(m, 0, 0.82, 0, 0.2, 0.24, 0.05, '#c4121c', 10, 5); ell(m, 0, 1.02, 0, 0.16, 0.16, 0.05, '#c4121c', 10, 5); ell(m, 0, 0.84, 0.045, 0.05, 0.05, 0.01, '#12040a', 8, 3); bxp(m, -0.06, 0.66, 0.04, 0.06, 0.7, 0.06, '#ffe36a'); OWN.guitar = m.upload();
  m = M(); tub(m, [0, -0.1, 0], [0, 0.3, 0], 0.024, 0.024, '#3a2a1a', 6, { cap0: 1 }); for (var i = 0; i < 6; i++) ell(m, 0, 0.36 + i * 0.08, 0, 0.022, 0.035, 0.022, '#5a5a60', 5, 3); ell(m, 0, 0.92, 0, 0.16, 0.16, 0.16, '#3a3a40', 10, 6); for (var s = 0; s < 6; s++) { var a = s / 6 * 6.283; tub(m, [Math.cos(a) * 0.14, 0.92, Math.sin(a) * 0.14], [Math.cos(a) * 0.24, 0.92, Math.sin(a) * 0.24], 0.03, 0.002, '#8a8a90', 4); } tub(m, [0, 1.06, 0], [0, 1.16, 0], 0.03, 0.002, '#8a8a90', 4); OWN.flail = m.upload();
}
/* ---------- Cumhead, with weight ---------- */
function stepPlayer(dt) {
  var p = P, mv = KIT.stick(0), W0 = WEAPONS[SV.wpn], KD = kindOf(); p.t += dt; p.inv = Math.max(0, p.inv - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.staWait = Math.max(0, (p.staWait || 0) - dt); p.vx = p.vx || 0; p.vz = p.vz || 0;
  var f = camFwd(), r = [-f[1], f[0]], wx = (-mv.y) * f[0] + mv.x * r[0], wz = (-mv.y) * f[1] + mv.x * r[1], wl = Math.min(1, Math.hypot(wx, wz)), wa = Math.atan2(wx, wz);
  // buffer: a button pressed while busy happens as soon as you are free
  if (KIT.pressed('x')) p.buf = { k: 'x', t: 0.4 }; else if (KIT.pressed('y')) p.buf = { k: 'y', t: 0.4 }; else if (KIT.pressed('b')) p.buf = { k: 'b', t: 0.3 };
  if (p.buf) { p.buf.t -= dt; if (p.buf.t <= 0) p.buf = null; }
  p.holdA = KIT.held('a') ? (p.holdA || 0) + dt : 0; if (KIT.pressed('a')) p.tapA = 1;
  var released = p.tapA && !KIT.held('a'), quickTap = released && p.lastHold < 0.25; if (released) p.tapA = 0; if (KIT.held('a')) p.lastHold = p.holdA;
  var busy = p.atk || p.st === 'roll' || p.st === 'back' || p.hurtT > 0.25 || p.st === 'drink' || p.fall;
  var wasGuard = p.guard; p.guard = !busy && KIT.held('lb') && p.sta > 0; if (p.guard && !wasGuard) p.guardT = 0; if (p.guard) p.guardT = (p.guardT || 0) + dt;
  var sprint = !busy && !p.guard && KIT.held('a') && p.holdA > 0.25 && wl > 0.3 && p.sta > 0;
  if (p.staWait <= 0 && !busy && !sprint) p.sta = Math.min(maxSta(), p.sta + dt * (p.guard ? 12 : SV.ring === 'pie' ? 52 : 38));
  if (sprint) { p.sta -= dt * 13; p.staWait = 0.35; if (p.sta <= 0) p.sta = 0; }
  var tvx = 0, tvz = 0, acc = 14;
  if (p.st === 'roll' || p.st === 'back') { p.roll -= dt; var len = p.st === 'roll' ? 0.62 : 0.4, k = 1 - p.roll / len, sp = p.st === 'roll' ? (k < 0.65 ? 6.6 : 6.6 * (1 - (k - 0.65) / 0.35)) : -5.2 * (1 - k);
    tvx = Math.sin(p.a) * sp; tvz = Math.cos(p.a) * sp; acc = 60; p.inv = (p.st === 'roll' ? (k > 0.05 && k < 0.62) : (k < 0.5)) ? 0.02 : p.inv; if (p.roll <= 0) p.st = 'idle'; }
  else if (p.st === 'drink') { p.drinkT -= dt; if (p.drinkT < 0.55 && !p.drank) { p.drank = 1; p.hp = Math.min(maxHp(), p.hp + Math.round(maxHp() * 0.45)); sfx.play('pour'); FX.push({ k: 'heal', x: p.x, y: p.y + 1, z: p.z, t: 0.8 }); } if (p.drinkT <= 0) p.st = 'idle'; if (wl > 0.2) { tvx = wx * 1.0; tvz = wz * 1.0; } }
  else if (p.atk) { var A = p.atk, Mv = MOVES[A.m], spd = W0.spd, wnd = Mv.wind * spd, act = Mv.act * spd, rec = Mv.rec * spd; A.t += dt;
    if (A.t < wnd) { if (LOCK && LOCK.hp > 0) p.a = turnTo(p.a, Math.atan2(LOCK.x - p.x, LOCK.z - p.z), dt * 5); else if (wl > 0.3) p.a = turnTo(p.a, wa, dt * 4); }
    if (A.t < wnd + act) { var lg = Mv.lunge * (A.t < wnd ? 0.35 : 1); if (LOCK && LOCK.hp > 0 && Math.hypot(LOCK.x - p.x, LOCK.z - p.z) < 1.3) lg = 0; tvx = Math.sin(p.a) * lg; tvz = Math.cos(p.a) * lg; acc = 40; }
    if (Mv.pose === 'slam') { var sk = A.t / (wnd + act); A.jy = sk < 1 ? Math.sin(Math.min(1, sk) * Math.PI) * 0.9 : 0; }
    if (A.t >= wnd && A.t < wnd + act) swing(A, Mv); if (A.t >= wnd + act && !A.landed && Mv.aoe) { A.landed = 1; KIT.shake(7); sfx.play('boom'); FX.push({ k: 'ring', x: p.x + Math.sin(p.a) * 1.2, y: p.y + 0.1, z: p.z + Math.cos(p.a) * 1.2, r: 2.6, t: 0.4 }); }
    if (A.t >= wnd + act && p.buf && p.buf.k === 'x' && A.light && p.sta > 0) { p.buf = null; startAtk(false, A.combo + 1); }
    else if (A.t >= wnd + act && p.buf && p.buf.k === 'y' && p.sta > 0) { p.buf = null; startAtk(true, 0); }
    else if (A.t >= wnd + act + rec * 0.55 && quickTap && p.sta > 0) { p.atk = null; doRoll(wl, wa); }
    else if (A.t >= wnd + act + rec) p.atk = null; }
  else if (!p.fall) {
    var locked = LOCK && LOCK.hp > 0, spd2 = p.guard ? 1.7 : sprint ? 6.4 : locked ? (wl > 0.6 ? 3.0 : 1.6) : wl > 0.62 ? 4.3 : 1.9;
    if (wl > 0.15) { tvx = wx / Math.max(0.0001, Math.hypot(wx, wz)) * spd2; tvz = wz / Math.max(0.0001, Math.hypot(wx, wz)) * spd2; }
    if (locked && !sprint) p.a = turnTo(p.a, Math.atan2(LOCK.x - p.x, LOCK.z - p.z), dt * 8); else if (wl > 0.15) p.a = turnTo(p.a, wa, dt * (sprint ? 4.2 : 7.5));
    acc = wl > 0.15 ? (sprint ? 8 : 12) : 16;
    if (quickTap && !G.prompt && p.sta > 0) doRoll(wl, wa); else if (quickTap && G.prompt && G.act) G.act();
    if (p.buf && p.sta > 0) { var bk = p.buf.k; if (bk === 'x') { p.buf = null; if (sprint || Math.hypot(p.vx, p.vz) > 5.5) startRun(); else startAtk(false, 0); } else if (bk === 'y') { p.buf = null; startAtk(true, 0); } else if (bk === 'b' && p.flask > 0 && p.hp < maxHp()) { p.buf = null; p.flask--; p.st = 'drink'; p.drinkT = 1.25; p.drank = 0; } }
  }
  if (p.hurtT > 0.25) { tvx = p.kx || 0; tvz = p.kz || 0; acc = 30; }
  // momentum: the body gets up to speed and slows down, it does not snap
  var ax = tvx - p.vx, az = tvz - p.vz, al = Math.hypot(ax, az), mx = acc * dt; if (al > mx) { ax = ax / al * mx; az = az / al * mx; } p.vx += ax; p.vz += az;
  var ox = p.x, oz = p.z; p.x += p.vx * dt; p.z += p.vz * dt; collide(p, 0.35, 'p'); propPush(p, 0.35); p.spd = Math.hypot(p.x - ox, p.z - oz) / dt; if (p.spd < Math.hypot(p.vx, p.vz) * 0.5) { p.vx *= 0.5; p.vz *= 0.5; } p.ph += p.spd * dt * 2.0;
  p.lean = (p.lean || 0) + ((Math.hypot(tvx, tvz) - Math.hypot(p.vx, p.vz)) * 0.04 - (p.lean || 0)) * Math.min(1, dt * 8);
  var fh = floorAt(p.x, p.z);
  if (!p.fall && fh < p.y - 0.6) { p.fall = 1; p.vy = 0; }
  if (p.fall) { p.vy -= 22 * dt; p.y += p.vy * dt; if (p.y <= fh) { var drop = p.fy0 - fh; p.y = fh; p.fall = 0; p.hurtT = Math.max(p.hurtT, drop > 2 ? 0.35 : 0); if (drop > 4) { p.hp -= (drop - 4) * 14; sfx.play('land'); } } if (p.y < -12) p.hp = 0; } else { p.fy0 = p.y; p.y += (fh - p.y) * Math.min(1, dt * 18); }
  if (KIT.pressed('rb')) toggleLock();
  if (LOCK && (LOCK.hp <= 0 || Math.hypot(LOCK.x - p.x, LOCK.z - p.z) > 18)) LOCK = null;
  G.prompt = null; G.act = null;
  WORLD.things.forEach(function (t) { var d = Math.hypot(tx(t.i) - p.x, tx(t.j) - p.z);
    if (t.k === 'candle' && d < 1.8) { G.prompt = SV.lit[t.id] ? 'A  REST AT THE CANDLE' : 'A  LIGHT THE CANDLE'; G.act = function () { if (!SV.lit[t.id]) G.banner = { t: 3, s: 'CANDLE LIT' }; rest(t); }; }
    else if (t.k === 'chest' && !SV.chests[t.id] && d < 1.6) { G.prompt = 'A  OPEN'; G.act = function () { openChest(t); }; }
    else if (t.k === 'door' && !SV.doors[t.id] && d < 1.8) { var side = p.z < tx(t.j) ? -1 : 1; if (side === t.from) { G.prompt = 'A  OPEN THE DOOR'; G.act = function () { SV.doors[t.id] = 1; persist(); sfx.play('door'); G.banner = { t: 2.5, s: 'A SHORTCUT' }; }; } else G.prompt = 'IT OPENS FROM THE OTHER SIDE'; }
    else if (t.k === 'exit' && d < 1.8 && SV.bosses[WORLD.A.boss]) { G.prompt = 'A  GO ON'; G.act = function () { if (SV.area < AREAS.length - 1) { var nid = AREAS[SV.area + 1].id + '0'; SV.lit[nid] = 1; SV.candle = nid; enterArea(SV.area + 1, nid); } else ending(); }; }
    else if (t.k === 'fog' && G.fogShut && !G.inArena && d < 1.6) { G.prompt = 'A  WALK THROUGH THE FOG'; G.act = function () { G.inArena = true; p.z -= 2.4; var b = WORLD.things.filter(function (q) { return q.k === 'boss'; })[0]; BOSS = mkBoss(b); LOCK = BOSS; music.play(BOSS.B.song); G.banner = { t: 3, s: BOSS.B.n }; }; }
  });
  // a riposte: a parried foe in front of you
  if (!p.atk) { var rip = FOE.filter(function (e) { return e.hp > 0 && e.parried > 0 && Math.hypot(e.x - p.x, e.z - p.z) < 1.9; })[0]; if (rip && !G.prompt) G.prompt = 'X  RIPOSTE'; }
  var stn = SV.stain; if (stn && stn.area === SV.area && Math.hypot(stn.x - p.x, stn.z - p.z) < 1.2) { SV.loads += stn.loads; POP.push({ x: p.x, y: p.y + 2.2, z: p.z, s: '+' + stn.loads + ' LOADS', t: 1.6, col: '#ffe36a' }); SV.stain = null; persist(); sfx.play('power'); }
}
function doRoll(wl, wa) { var p = P; p.sta -= 18; p.staWait = 0.5; if (wl > 0.2) { p.st = 'roll'; p.roll = 0.62; p.a = wa; } else { p.st = 'back'; p.roll = 0.4; } sfx.play('step'); sfx.noise(0.12, 0.05, 700); }
function startAtk(heavy, combo) {
  var p = P, W0 = WEAPONS[SV.wpn], KD = kindOf(); if (p.sta <= 0) return; var list = KD.l, m = heavy ? KD.h : list[(combo || 0) % list.length];
  // riposte or backstab: a big hit with the light attack
  if (!heavy) { var rip = FOE.filter(function (e) { return e.hp > 0 && e.parried > 0 && Math.hypot(e.x - p.x, e.z - p.z) < 1.9; })[0]; if (rip) { m = 'stab'; p.crit = rip; } else { var bs = FOE.filter(function (e) { if (e.hp <= 0 || e.st === 'chase' || e.st === 'wind' || e.st === 'strike') return false; var dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz); if (d > 1.7) return false; var ang = Math.atan2(Math.sin(Math.atan2(dx, dz) - e.a), Math.cos(Math.atan2(dx, dz) - e.a)); return Math.abs(ang) > 2.2; })[0]; if (bs) { m = 'stab'; p.crit = bs; } } }
  p.sta -= W0.sta * (heavy ? 1.6 : 1) * (MOVES[m].dmg || 1) * 0.9; p.staWait = 0.55;
  p.atk = { m: m, heavy: heavy, light: !heavy, t: 0, combo: combo || 0, hitList: [], crit: p.crit || null }; p.crit = null; sfx.tone('triangle', 180, 120, 0.06, 0.03);
}
function startRun() { var p = P, KD = kindOf(); p.sta -= WEAPONS[SV.wpn].sta * 1.2; p.staWait = 0.55; p.atk = { m: KD.r === 'run' ? 'run' : KD.r, heavy: false, light: true, t: 0, combo: 0, hitList: [], run: 1 }; }
function swing(A, Mv) {
  var W0 = WEAPONS[SV.wpn], p = P, reach = W0.reach * (Mv.reach || 1), base = (A.heavy ? W0.heavy : W0.dmg) * dmgK() * (Mv.dmg && !A.heavy ? Mv.dmg : 1) * (A.combo >= 2 ? 1.12 : 1), hitAny = false;
  if (!A.sw) { A.sw = 1; sfx.tone('triangle', 300, 110, 0.14, 0.05); sfx.noise(0.1, 0.04, 2500); }
  FOE.concat(BOSS && BOSS.hp > 0 ? [BOSS] : []).forEach(function (e) { if (e.hp <= 0 || A.hitList.indexOf(e) >= 0) return; var dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz), rr = e.boss ? 1.1 * e.B.sc * 0.6 : 0.4; if (d > reach + rr || Math.abs(e.y - p.y) > 1.8) return;
    var ang = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - p.a), Math.cos(Math.atan2(dx, dz) - p.a))); if (ang > Mv.arc && d > rr + 0.5) return; A.hitList.push(e);
    var dmg = base, crit = A.crit === e;
    if (crit) { dmg *= W0.crit || 2.6; e.parried = 0; G.banner = { t: 1.6, s: e.st === 'stagger' ? 'RIPOSTE' : 'BACKSTAB' }; KIT.shake(8); G.hs = 0.22; }
    if (e.boss) hurtBoss(dmg, A.heavy || Mv.armour); else { hurtFoe(e, dmg, A.heavy || W0.poise > 1.5, W0.poise || 1); if (W0.bleed && e.hp > 0) { e.bleed = (e.bleed || 0) + 34; if (e.bleed >= 100) { e.bleed = 0; hurtFoe(e, e.d.hp * 0.25, false, 0); POP.push({ x: e.x, y: e.y + 2.6, z: e.z, s: 'BLEED', t: 1, col: '#ff2630' }); } } }
    hitAny = true; });
  if (hitAny) { G.hs = Math.max(G.hs || 0, A.heavy ? 0.09 : 0.05); if (SV.ring === 'blood') p.hp = Math.min(maxHp(), p.hp + 4); KIT.shake(A.heavy ? 4 : 2); }
}
var _hurtFoe = hurtFoe;
hurtFoe = function (f, dmg, heavy, pk) { _hurtFoe(f, dmg, heavy); if (pk && f.hp > 0 && f.st !== 'stagger') { f.poise -= (pk - 1) * 12; if (f.poise <= 0) { f.st = 'stagger'; f.t = 0; f.poise = f.d.poise; } } };
/* parry: the guard just went up as the hit lands */
var _hurtPlayer = hurtPlayer;
hurtPlayer = function (dmg, fx, fz, unblock) {
  var p = P; if (p.inv > 0 || p.hp <= 0) return;
  if (p.guard && p.guardT < 0.2 && !unblock) { var src = null, bd = 9; FOE.forEach(function (e) { var d = Math.hypot(e.x - fx, e.z - fz); if (e.hp > 0 && d < bd) { bd = d; src = e; } }); if (src && bd < 0.5) { src.st = 'stagger'; src.t = -0.8; src.parried = 2.2; POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'PARRIED', t: 1, col: '#ffe36a' }); sfx.play('block'); sfx.tone('square', 1400, 900, 0.12, 0.06); G.hs = 0.15; FX.push({ k: 'spark', x: p.x + Math.sin(p.a) * 0.7, y: p.y + 1.3, z: p.z + Math.cos(p.a) * 0.7, t: 0.35 }); return; } }
  var arm = p.atk && MOVES[p.atk.m] && MOVES[p.atk.m].armour && p.atk.t > 0.1; var oldT = p.hurtT; _hurtPlayer(dmg, fx, fz, unblock); if (arm && p.hp > 0) { p.hurtT = oldT; } else p.buf = null;
};
/* solid furniture: you walk round it */
var SOLIDS = [];
function propPush(o, r) { for (var i = 0; i < SOLIDS.length; i++) { var s = SOLIDS[i], dx = o.x - s.x, dz = o.z - s.z, d = Math.hypot(dx, dz), m = r + s.r; if (d < m && d > 1e-4 && Math.abs((o.y || 0) - s.y) < 1.5) { o.x = s.x + dx / d * m; o.z = s.z + dz / d * m; } } }
var _stepFoes = stepFoes;
stepFoes = function (dt) { FOE.forEach(function (f) { if (f.parried > 0) f.parried -= dt; }); _stepFoes(dt); FOE.forEach(function (f) { if (f.hp > 0) propPush(f, 0.4); }); };
/* the attack poses: each move goes from its wind-up to its strike and settles (k 0..1 over the whole move) */
function lerpA(a, b, k) { return a.map(function (v, i) { return v + (b[i] - v) * k; }); }
var MPOSE = { // update 151 (his ask: he swung like he was punching): [shoulder R [forward, out, sweep], elbow, body twist, lean] at the wind-up and the strike, hw/hs = the blade's angle in his fist then.
  // The arm sweeps round the shoulder (the third number turns it across the body), and on the strike the blade swings out to carry on the line of the arm, so it cuts an arc instead of being pushed forward
  // update 152 (he said it still looked like punching): keyed swings, [forward, out, sweep, elbow, twist, lean, blade] each; the first key is the wind-up, the rest are passed through on the strike.
  // Picked from shots taken from behind (the game's camera): the sword is cocked over his shoulder, comes out to his right with the blade up, and cuts down across to his left, so the blade is on screen the whole way.
  slashR: { k: [[0.5, 2.4, -0.3, 1.6, -0.55, 0, -3.0], [1.0, 1.3, 0.0, 0.15, -0.25, 0.15, -2.0], [1.3, 0.6, 0.5, 0.15, 0.3, 0.2, -2.0], [1.0, -0.3, 1.0, 0.25, 0.55, 0.2, -2.2]] },
  slashL: { k: [[0.9, -0.1, 1.2, 0.3, 0.55, 0.05, -1.4], [1.3, 0.6, 0.5, 0.15, 0.25, 0.15, -2.0], [1.0, 1.3, 0.0, 0.15, -0.25, 0.2, -2.0], [0.8, 1.8, -0.3, 0.3, -0.5, 0.2, -1.6]] },
  over: { k: [[2.9, 0.7, -0.2, 1.6, -0.2, -0.25, -4.4], [2.1, 0.65, -0.1, 0.4, -0.05, 0.1, -2.9], [1.2, 0.45, 0.0, 0.1, 0.0, 0.35, -2.2], [0.7, 0.35, 0.0, 0.1, 0.0, 0.45, -1.95]] },
  stab: { w: [[0.45, 0.1, -0.25], 1.95, -0.5, -0.05], s: [[1.55, 0.0, 0.1], 0.0, 0.35, 0.28], hw: -1.6, hs: -3.1 },
  lunge: { w: [[0.45, 0.1, -0.3], 2.0, -0.6, -0.1], s: [[1.6, 0.0, 0.1], 0.0, 0.45, 0.5], hw: -1.6, hs: -3.1 },
  sweep: { k: [[0.6, 2.2, -0.4, 1.0, -0.6, 0.1, -2.6], [0.9, 1.5, 0.0, 0.15, -0.3, 0.3, -2.0], [1.1, 0.7, 0.6, 0.15, 0.3, 0.35, -2.0], [0.9, -0.2, 1.1, 0.25, 0.6, 0.35, -2.1]] },
  spin: { k: [[0.8, 1.6, -0.2, 0.4, -0.5, 0.05, -2.0], [0.9, 1.5, 0.0, 0.15, 0.0, 0.15, -2.0], [0.9, 1.5, 0.0, 0.15, 0.0, 0.15, -2.0]] },
  slam: { k: [[3.0, 0.6, -0.2, 1.5, -0.2, -0.3, -4.5], [2.1, 0.5, -0.1, 0.4, 0.0, 0.15, -2.9], [1.1, 0.3, 0.0, 0.1, 0.0, 0.5, -2.2], [0.5, 0.2, 0.0, 0.05, 0.0, 0.6, -1.9]] },
  jab: { w: [[0.8, 0.05, 0.0], 1.8, -0.2, 0.0], s: [[1.55, 0.05, 0.0], 0.05, 0.3, 0.12] },
  hook: { w: [[1.2, -0.9, -0.5], 1.6, -0.5, 0.0], s: [[1.4, 0.6, 0.8], 1.3, 0.55, 0.12] },
  upper: { w: [[0.2, 0.1, 0.0], 2.2, -0.35, 0.15], s: [[2.6, 0.1, 0.0], 1.6, 0.25, -0.2] }
};
var HELD0 = -Math.PI / 2 - 0.2;
function poseMove(Q, A) {
  var Mv = MOVES[A.m], spd = WEAPONS[SV.wpn].spd, wnd = Mv.wind * spd, act = Mv.act * spd, rec = Mv.rec * spd, t = A.t, D = MPOSE[Mv.pose] || MPOSE.slashR, sh, el, tw, ln;
  var hw = D.hw === undefined ? HELD0 : D.hw, hs = D.hs === undefined ? HELD0 : D.hs, ha;
  if (D.k) { var K = D.k, R0 = [0.6, 0.15, 0.1, 0.5, 0, 0, HELD0], v;
    var mix = function (A0, B0, e) { return A0.map(function (x, i) { return x + (B0[i] - x) * e; }); };
    if (t < wnd) { var kw = t / wnd; v = mix(R0, K[0], kw * kw * (3 - 2 * kw)); }
    else if (t < wnd + act) { var ka = (t - wnd) / act; ka = 1 - (1 - ka) * (1 - ka); var f = ka * (K.length - 1), j = Math.min(K.length - 2, Math.floor(f)); v = mix(K[j], K[j + 1], f - j); }
    else { var kr = Math.min(1, (t - wnd - act) / rec); v = mix(K[K.length - 1], R0, kr * kr * (3 - 2 * kr)); }
    sh = [v[0], v[1], v[2]]; el = v[3]; tw = v[4]; ln = v[5]; ha = v[6];
  }
  else if (t < wnd) { var k = t / wnd, e = k * k * (3 - 2 * k); sh = lerpA([0.6, 0.15, 0.1], D.w[0], e); el = 0.5 + (D.w[1] - 0.5) * e; tw = D.w[2] * e; ln = D.w[3] * e; ha = HELD0 + (hw - HELD0) * e; }
  else if (t < wnd + act) { var k2 = (t - wnd) / act; k2 = 1 - (1 - k2) * (1 - k2); sh = lerpA(D.w[0], D.s[0], k2); el = D.w[1] + (D.s[1] - D.w[1]) * k2; tw = D.w[2] + (D.s[2] - D.w[2]) * k2; ln = D.w[3] + (D.s[3] - D.w[3]) * k2; ha = hw + (hs - hw) * Math.min(1, k2 * 1.6); }
  else { var k3 = Math.min(1, (t - wnd - act) / rec), e3 = k3 * k3 * (3 - 2 * k3); sh = lerpA(D.s[0], [0.6, 0.15, 0.1], e3); el = D.s[1] + (0.5 - D.s[1]) * e3; tw = D.s[2] * (1 - e3); ln = D.s[3] * (1 - e3); ha = hs + (HELD0 - hs) * e3; }
  Q.heldA = ha;
  Q.sh[1] = sh; Q.el[1] = el; Q.twist = tw; Q.lean = (Q.lean || 0) * 0.3 + ln;
  if (Mv.pose === 'lunge' || Mv.pose === 'stab') { Q.hip = [0.7 * Math.min(1, t / (wnd + act)), -0.35]; Q.kn = [0.5, 0.2]; }
  if (Mv.pose === 'slam') { Q.hip = [0.6, 0.6]; Q.kn = [0.9, 0.9]; }
  if (Mv.pose === 'sweep') { Q.y = -0.15; Q.kn = [0.6, 0.6]; Q.hip = [0.4, 0.4]; }
  if (kindOf().two || Mv.pose === 'slam') { Q.sh[0] = [sh[0] * 0.95, -sh[1] * 0.25 + 0.45, -sh[2] * 0.3 + 0.55]; Q.el[0] = el + 0.6; }
  else if (Mv.pose === 'jab' || Mv.pose === 'hook' || Mv.pose === 'upper') { Q.sh[0] = [0.9, 0.2, 0.2]; Q.el[0] = 1.8; }
  else { Q.sh[0] = [0.35 - tw * 0.3, 0.35, 0.0]; Q.el[0] = 0.7; }
  A.spin = Mv.pose === 'spin' && t >= wnd ? Math.min(1, (t - wnd) / (act + rec * 0.4)) * Math.PI * 2 : 0;
}
function poseHold(Q, p) { // walking with a weapon: the arm carries it, not a limp hang
  var two = kindOf().two;
  if (p.guard) { Q.sh[1] = [1.25, 0.35, 0.7]; Q.el[1] = 1.3; Q.sh[0] = [1.25, -0.15, -0.5]; Q.el[0] = 1.2; Q.lean = 0.12; Q.y = -0.06; Q.kn = [0.35, 0.35]; Q.hip = [0.3, 0.3]; return; }
  var sw = Q.sh[1][0] * 0.35; Q.sh[1] = [0.55 + sw, 0.18, 0.15]; Q.el[1] = 0.55;
  if (two) { Q.sh[0] = [0.7, 0.5, 0.6]; Q.el[0] = 1.1; }
  if (!p.spd || p.spd < 0.3) { Q.y = -0.04; Q.kn = [0.18, 0.12]; Q.hip = [0.12, -0.05]; }
}
