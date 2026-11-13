/* =====================================================================================================
   DARK LOADS update 149: the story and the flow (his ask: where is the story, the intro, waking up somewhere safe).
   A new game opens on the prologue (how TB poured his Silly Pills into Cum City and his three lieutenants took it),
   then you wake in a coffin in the Forgotten Chapel with nobody about, messages on the floor teach the buttons, the
   first candle is at the altar. Place names come up when you walk into them, the music follows the place, fog gates
   are walls until you walk through them, shortcut doors open from one side, the Keep's gate needs three seals,
   Spermaid and Saba keep the Candlelit Square, and TB's throne is the end.
   ===================================================================================================== */
function freshSave() { return { v: 4, candle: 'chapel', lit: {}, loads: 0, lvl: 1, vig: 0, mind: 0, end: 0, str: 0, dex: 0, arc: 0, shards: 0, wpns: ['sausage'], wpn: 'sausage', rings: [], ring: null, chests: {}, bosses: {}, doors: {}, gateOpen: 0, stain: null, deaths: 0, bought: {}, won: 0, seen: {}, talked: {}, intro: 0, area: 0 }; }
function persist() { KIT.save('dk4-save', SV); }
(function () { var s4 = KIT.load('dk4-save', null); if (s4 && s4.v === 4) { SV = s4; return; }
  var old = KIT.load('dk3-save', null); SV = freshSave(); if (old) { ['vig', 'end', 'str', 'shards', 'wpns', 'wpn', 'rings', 'ring', 'bought', 'won', 'deaths'].forEach(function (k) { if (old[k] !== undefined) SV[k] = old[k]; }); SV.lvl = 1 + (SV.vig || 0) + (SV.end || 0) + (SV.str || 0); SV.intro = 0; } })();
SV.area = 0;
music.songs.dkhub = { bpm: 60, beats: 3, vol: 0.75, wet: 0.85, lead: 'organlead', bass: 'drone', acc: 'organ', drums: null, chords: 'Am F C E Am F Dm E', mel: 'a4 - - c5 - e5 | f5 - - e5 - - | e5 - - g5 - c5 | b4 - - - - - | a4 - - c5 - e5 | a5 - - g5 - f5 | f5 - e5 - d5 - | e5 - - - - -' };
/* ---------- the start of a game and coming back to a candle ---------- */
function enterArea(ai, candleId) {
  if (!R3.ok) { G.mode = 'nogl'; return; }
  buildAtlas(); buildRigs(); ownMeshes(); moreMeshes(); buildNpcRigs(); G.piv = null;
  if (!WORLD || !WORLD.RD) { WORLD = parseArea(); MESH = buildMesh(); }
  KIT.closeMenu(); G.mode = 'play';
  var c = WORLD.things.filter(function (t) { return t.k === 'candle' && t.id === candleId; })[0], wake = !c;
  if (!c) c = WORLD.things.filter(function (t) { return t.k === 'wake'; })[0];
  P = { x: tx(c.i) + (wake ? 0 : 1.2), z: tx(c.j) + (wake ? 0 : 0.4), y: th(c.i, c.j) + (wake ? 0.68 : 0), vy: 0, a: Math.PI, hp: maxHp(), sta: maxSta(), flask: flaskMax(), st: 'idle', t: 0, inv: 0, atk: null, guard: 0, hurtT: 0, ph: 0, spd: 0, roll: 0 };
  P.fp = maxFp();
  if (!wake) { var bestA = P.a, bestN = -1; for (var q = 0; q < 8; q++) { var aa = q / 8 * 6.283, n = 0; while (n < 12 && tk(tileOf(P.x + Math.sin(aa) * (n + 1) * 1.5), tileOf(P.z + Math.cos(aa) * (n + 1) * 1.5)) === 0) n++; if (n > bestN) { bestN = n; bestA = aa; } } P.a = bestA; }
  CAMY = P.a; spawnFoes(); BOSS = null; LOCK = null; SHOTS = []; FX = []; POP = []; G.inArena = false; G.fogPass = false; G.fogWalk = null; G.autoMove = null; G.cine = null; G.note = null;
  var R0 = regionAt(P.x, P.z); G.reg = R0.id; G.regT = 0; G.look = null; music.play(R0.song); G.banner = null;
  if (wake) { G.wake = 4.2; P.wakeT = 4.2; P.a = Math.PI; CAMY = Math.PI; } else G.banner = { t: 3.5, s: R0.name, place: 1 };
  persist();
}
function spawnFoes() { FOE = []; WORLD.things.forEach(function (t) { if (t.k === 'foe') { var f = mkFoe(t.f, tx(t.i), tx(t.j)); f.y = floorAt(f.x, f.z); FOE.push(f); } }); }
(function () { var sc = document.getElementById('scan'); if (sc) sc.hidden = true; })(); // no scanlines over a 3D game (they striped Cumhead's head)
(function () { var st = document.createElement('style'); st.textContent = 'html.dkcine #pad{display:none!important}'; document.head.appendChild(st); })();
KIT.canvas.addEventListener('pointerdown', function () { if (G.mode === 'intro') G.skipReq = 1; });
var __stick = KIT.stick; KIT.stick = function (i) { if (i === 0 && G.autoMove) return G.autoMove; return __stick.apply(KIT, arguments); };
/* ---------- the loop ---------- */
function update(dt) {
  document.documentElement.classList.toggle('dkcine', G.mode === 'intro' || G.wake > 0);
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; } if (G.note) { G.note.t -= dt; if (G.note.t <= 0) G.note = null; }
  if (G.mode === 'intro') { stepIntro(dt); return; }
  if (G.mode === 'dead') { G.deadT += dt; if (G.deadT > 3.2) enterArea(0, SV.candle); return; }
  if (G.mode !== 'play' || !P) return;
  if (G.wake > 0) { stepWake(dt); return; }
  if (G.hs > 0) { G.hs -= dt; return; }
  stepPlayer(dt); stepFoes(dt); stepBoss(dt);
  if (P.hp <= 0) die();
}
function stepWake(dt) { G.wake -= dt; P.wakeT = G.wake; var k = 1 - G.wake / 4.2;
  var cx = P.x, cz = P.z, an = 2.4 - k * 1.2; G.cine = { eye: [cx + Math.sin(an) * 3.4, P.y + 1.4 + k * 0.6, cz + Math.cos(an) * 3.4], at: [cx, P.y + 0.7 + k * 0.6, cz] };
  if (G.wake <= 0) { G.wake = 0; P.wakeT = 0; G.cine = null; P.y = th(tileOf(P.x), tileOf(P.z)); collide(P, 0.35, 'p'); CAMY = Math.PI; G.banner = { t: 3.5, s: 'THE FORGOTTEN CHAPEL', place: 1 }; SV.intro = 1; persist(); }
  else if (G.wake < 1.6) { P.y += (th(tileOf(P.x), tileOf(P.z)) - P.y) * Math.min(1, dt * 3); P.z += (tx(tileOf(P.z)) - 1.4 - P.z) * Math.min(1, dt * 1.6); } }
/* ---------- where you are: the place name, the music, the look ---------- */
var flowStep = stepPlayer;
stepPlayer = function (dt) {
  var p = P, fw = G.fogWalk;
  if (fw) { var ang = Math.atan2(fw.x - p.x, fw.z - p.z); CAMY = turnTo(CAMY, ang, 0.2); G.autoMove = { x: 0, y: -0.62 }; G.fogPass = true; fw.t += dt; }
  flowStep(dt); p = P; if (!p || G.mode !== 'play') return;
  if (fw) { G.prompt = null; G.act = null; if (Math.hypot(fw.x - p.x, fw.z - p.z) < 0.5 || fw.t > 3) { G.fogWalk = null; G.autoMove = null; G.fogPass = false; G.inArena = true;
      var b = WORLD.things.filter(function (q) { return q.k === 'boss' && q.f === fw.g.boss; })[0]; BOSS = mkBoss(b); LOCK = BOSS; music.play(BOSS.B.song); G.banner = { t: 3, s: BOSS.B.n }; } return; }
  var R0 = regionAt(p.x, p.z); G.regT = (G.regT || 0) + dt;
  if (R0.id !== G.reg) { G.reg = R0.id; SV.seen = SV.seen || {}; if (!SV.seen[R0.id] || G.regT > 40) G.banner = { t: 3.5, s: R0.name, place: 1 }; SV.seen[R0.id] = 1; G.regT = 0; if (!BOSS || BOSS.hp <= 0) music.play(R0.song); }
  if (BOSS && BOSS.hp <= 0 && BOSS.st === 'dead' && BOSS.t > 4 && !G.songBack) { G.songBack = 1; music.play(R0.song); } if (!BOSS || BOSS.hp > 0) G.songBack = 0;
  // what is in reach (replaces the old list: candles, chests, doors, the gate, the fog, messages, people, the throne)
  G.prompt = null; G.act = null; var best = 9;
  WORLD.things.forEach(function (t) { var d = Math.hypot(tx(t.i) - p.x, tx(t.j) - p.z); if (Math.abs(th(t.i, t.j) - p.y) > 2.2 && t.k !== 'fog') return;
    function offer(r, s, fn) { if (d < r && d < best) { best = d; G.prompt = s; G.act = fn; } }
    if (t.k === 'candle') offer(1.9, SV.lit[t.id] ? '@  REST AT THE CANDLE' : '@  LIGHT THE CANDLE', function () { if (!SV.lit[t.id]) { G.banner = { t: 3, s: 'CANDLE LIT' }; sfx.play('magic'); } rest(t); });
    else if (t.k === 'chest' && !SV.chests[t.id]) offer(1.7, '@  OPEN THE CHEST', function () { openChest(t); });
    else if (t.k === 'sdoor' && !SV.doors[t.id]) { var ok = t.side === 'e' ? p.x > tx(t.i) : t.side === 'w' ? p.x < tx(t.i) : t.side === 's' ? p.z > tx(t.j) : p.z < tx(t.j);
      offer(2.0, ok ? '@  OPEN THE DOOR' : 'IT WILL NOT OPEN FROM THIS SIDE', ok ? function () { SV.doors[t.id] = 1; persist(); sfx.play('door'); G.banner = { t: 2.5, s: 'A SHORTCUT OPENS' }; } : null); }
    else if (t.k === 'gate' && !SV.gateOpen && t.i === 61) { var n = ['muckies', 'bride', 'stag'].filter(function (b) { return SV.bosses[b]; }).length;
      offer(3.2, n >= 3 ? '@  BREAK THE THREE SEALS' : 'SEALED  ·  ' + n + ' OF 3 SEALS BROKEN', n >= 3 ? function () { SV.gateOpen = 1; persist(); sfx.play('boom'); KIT.shake(8); G.banner = { t: 3.5, s: 'THE PILL KEEP IS OPEN' }; } : null); }
    else if (t.k === 'fog' && fogUp(t) && !G.inArena) { var cx = 0, cz = 0; t.tiles.forEach(function (q) { cx += tx(q[0]); cz += tx(q[1]); }); cx /= t.tiles.length; cz /= t.tiles.length;
      var dd = t.alongX ? Math.abs(p.z - cz) : Math.abs(p.x - cx), lat = t.alongX ? Math.abs(p.x - cx) : Math.abs(p.z - cz);
      if (dd < 2.0 && lat < t.tiles.length * TSZ / 2 + 0.4 && dd < best) { best = dd; G.prompt = '@  WALK THROUGH THE FOG'; G.act = function () { var s = t.alongX ? Math.sign(cz - p.z) || 1 : Math.sign(cx - p.x) || 1;
        G.fogWalk = { g: t, t: 0, x: t.alongX ? Math.max(cx - 2, Math.min(cx + 2, p.x)) : cx + s * 2.8, z: t.alongX ? cz + s * 2.8 : Math.max(cz - 2, Math.min(cz + 2, p.z)) }; LOCK = null; sfx.play('magic'); }; } }
    else if (t.k === 'msg') offer(1.4, '@  READ THE MESSAGE', function () { G.note = { t: 6, s: keyText(t.s) }; sfx.play('tick'); });
    else if (t.k === 'npc') offer(2.4, '@  TALK TO ' + (t.who === 'saba' ? 'SABA' : 'SPERMAID'), function () { if (t.who === 'saba') sabaMenu(); else spermaidMenu(); });
    else if (t.k === 'throne' && SV.bosses.tb) offer(2.6, '@  SIT ON THE THRONE', function () { ending(); });
  });
  if (!p.atk) { var rip = FOE.filter(function (e) { return e.hp > 0 && e.parried > 0 && Math.hypot(e.x - p.x, e.z - p.z) < 1.9; })[0]; if (rip && !G.prompt) G.prompt = '%  CRITICAL HIT'; }
};
function keyText(s) { return s.replace(/\{(\w+)\}/g, function (m, k) { return keyName(k); }); }
 KEYN.pad.jump = 'A'; KEYN.pad.guard = 'LB'; KEYN.pad.flask = 'X'; KEYN.pad.lock = 'R3'; KEYN.pad.skill = 'LT';
KEYN.kb.move = 'WASD'; KEYN.kb.cam = 'the mouse (click first) or the arrows'; KEYN.kb.jump = 'F'; KEYN.kb.guard = 'L'; KEYN.kb.flask = 'R'; KEYN.kb.lock = 'Q'; KEYN.kb.skill = 'U';
KEYN.touch.move = 'the left thumb'; KEYN.touch.cam = 'the right thumb'; KEYN.touch.jump = 'A'; KEYN.touch.guard = 'LB'; KEYN.touch.flask = 'X'; KEYN.touch.lock = 'R3'; KEYN.touch.skill = 'LT'; KEYN.touch.use = 'A'; KEYN.touch.light = 'RB'; KEYN.touch.heavy = 'RT'; KEYN.touch.dodge = 'B';
KEYN.kb.move = 'WASD'; KEYN.pad.move = 'the left stick'; KEYN.pad.cam = 'the right stick';
/* only the foes near you think (the world is big now) */
var flowFoes = stepFoes;
stepFoes = function (dt) { var all = FOE; FOE = all.filter(function (f) { return Math.abs(f.x - P.x) < 46 && Math.abs(f.z - P.z) < 46; }); try { flowFoes(dt); } finally { FOE = all; }
  FOE.forEach(function (f) { if (f.st === 'dead' && !f.paid) { f.paid = 1; var bonus = Math.round(f.d.loads * discK()); if (bonus > 0) SV.loads += bonus; } }); };
/* resting: heal, refill, bring the dead back, then the candle's own screen */
function rest(c) { SV.candle = c.id; SV.lit[c.id] = 1; P.hp = maxHp(); P.sta = maxSta(); P.fp = maxFp(); P.flask = flaskMax(); persist(); sfx.play('magic'); spawnFoes(); SHOTS = []; LOCK = null; candleMenu(c); }
/* ---------- the prologue ---------- */
var INTRO = [
  { s: 'In the age before, Cum City burned with a thousand candles, and every soul in it carried a Load.', from: 'hub', a: 0.4, d: 15, h: 7, sp: 0.06 },
  { s: 'Then came TB. He poured his Silly Pills into the water, and the whole city drank.', from: 'keepb', a: 3.1, d: 14, h: 4, sp: 0.04 },
  { s: 'The candles went out one by one. TB crowned himself the Pill King and climbed into his Keep.', from: 'throne', a: 0.1, d: 9, h: 3, sp: 0.03, tb: 1 },
  { s: 'His three lieutenants took the rest.', from: 'bell', a: 0.9, d: 18, h: 10, sp: 0.05 },
  { s: 'Mama Muckies took the streets.', from: 'muck', a: 2.4, d: 12, h: 6, sp: 0.06, boss: 'muckies' },
  { s: 'The Gravedigger Bride took the Cathedral of Blum.', from: 'bride', a: 1.6, d: 10, h: 4, sp: 0.05, boss: 'bride' },
  { s: 'And the Stitched Stag took the Bone Depths.', from: 'stag', a: 0.3, d: 11, h: 5, sp: 0.05, boss: 'stag' },
  { s: 'Far below, in a chapel nobody remembered, one drop of cream began to stir.', from: 'wake', a: 2.6, d: 4, h: 2.2, sp: 0.04 },
  { s: 'Rise, Cumhead. Light the candles. Take back the Loads.', from: 'wake', a: 2.2, d: 2.6, h: 1.6, sp: 0.02 }
];
function introSpot(k) { var T = WORLD.things, f = function (fn) { return T.filter(fn)[0]; }, t;
  if (k === 'hub') t = f(function (q) { return q.id === 'hub'; }); else if (k === 'bell') t = f(function (q) { return q.id === 'bell'; }); else if (k === 'throne') t = f(function (q) { return q.k === 'throne'; });
  else if (k === 'keepb') return { x: tx(61), z: tx(38), y: 6 }; else if (k === 'wake') t = f(function (q) { return q.k === 'wake'; });
  else t = f(function (q) { return q.k === 'boss' && q.f === { muck: 'muckies', bride: 'bride', stag: 'stag' }[k]; });
  return { x: tx(t.i), z: tx(t.j) + (k === 'throne' ? 3 : 0), y: th(t.i, t.j) }; }
function startIntro() { enterArea(0, null); G.mode = 'intro'; G.ii = 0; G.it = 0; G.wake = 0; P.wakeT = 4.2; music.play('dkcath'); KIT.closeMenu(); stepIntro(0); }
function stepIntro(dt) { var sh = INTRO[G.ii]; G.it += dt; var len = 3.2 + sh.s.length * 0.055;
  if (KIT.pressed('a') || KIT.pressed('b') || KIT.pressed('y') || KIT.pressed('rb') || G.skipReq) { G.skipReq = 0; if (G.ii < INTRO.length - 1) { G.ii = INTRO.length - 1; G.it = 0; sh = INTRO[G.ii]; len = 3.2 + sh.s.length * 0.055; } else G.it = len; }
  if (G.it >= len) { G.it = 0; G.ii++; if (G.ii >= INTRO.length) { G.mode = 'play'; G.wake = 4.2; P.wakeT = 4.2; G.skipT = 0; music.play('dkcath'); return; } sh = INTRO[G.ii]; }
  var c = introSpot(sh.from), an = sh.a + G.it * sh.sp, d = sh.d - G.it * 0.15; G.cine = { eye: [c.x + Math.sin(an) * d, c.y + sh.h, c.z + Math.cos(an) * d], at: [c.x, c.y + (sh.from === 'wake' ? 0.6 : 1.8), c.z], text: sh.s, a: Math.min(1, G.it * 1.5, (len - G.it) * 1.5), boss: sh.boss, tb: sh.tb };
}
/* the camera and HUD in the cutscenes */
var flowCam = camPose;
camPose = function () { if (G.cine) return G.cine; return flowCam(); };
var flowHud = hud;
hud = function () { var Wd = KIT.W, Hd = KIT.H, R = KIT.R;
  if (G.mode === 'intro' || G.wake > 0) { var bh = Math.round(Hd * 0.12); R('#000', 0, 0, Wd, bh); R('#000', 0, Hd - bh, Wd, bh);
    if (G.mode === 'intro' && G.cine) { var a = Math.max(0, G.cine.a); if (G.ii === 0 && G.it < 1.2) R('rgba(0,0,0,' + (1 - G.it / 1.2) + ')', 0, 0, Wd, Hd);
      wrapText(G.cine.text, Wd / 2, Hd - bh - 26, Wd - 40, { align: 'center', size: 8, col: '#f1e7d0', alpha: a, outline: 1 });
      KIT.text('PRESS ANY BUTTON TO SKIP', Wd - 8, Hd - bh + 6, { align: 'right', size: 6, col: '#6a5a50' }); }
    else { var k = G.wake / 4.2; if (k > 0.8) R('rgba(0,0,0,' + (k - 0.8) * 5 + ')', 0, 0, Wd, Hd); }
    return; }
  flowHud();
  if (G.note) { var s = G.note.s, a2 = Math.min(1, G.note.t * 2, (6 - G.note.t) * 4), w = Math.min(Wd - 16, 400), lines = splitText(s, w - 20, 7), h = lines.length * 11 + 22, x = (Wd - w) / 2, y = Hd * 0.18;
    KIT.ctx.globalAlpha = a2; R('rgba(10,4,4,0.86)', x, y, w, h); R('#c48a3a', x, y, w, 1); R('#c48a3a', x, y + h - 1, w, 1); R('#c48a3a', x, y, 1, h); R('#c48a3a', x + w - 1, y, 1, h); KIT.ctx.globalAlpha = 1;
    KIT.text('A MESSAGE SCRATCHED INTO THE FLOOR', Wd / 2, y + 5, { align: 'center', size: 6, col: '#c48a3a', alpha: a2 }); lines.forEach(function (l, i) { KIT.text(l, Wd / 2, y + 16 + i * 11, { align: 'center', size: 7, col: '#f1e7d0', alpha: a2 }); }); }
  if (G.banner && G.banner.place && G.banner.t > 0) { var a3 = Math.min(1, G.banner.t, 3.5 - G.banner.t), cy = Hd * 0.3; R('rgba(255,227,106,' + 0.55 * a3 + ')', Wd / 2 - 110, cy + 32, 220, 1); }
};
function splitText(s, w, size) { var words = s.split(' '), out = [], cur = ''; words.forEach(function (wd) { var t = cur ? cur + ' ' + wd : wd; if (KIT.tw(t, size) > w && cur) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out; }
function wrapText(s, x, y, w, o) { var ls = splitText(s, w, o.size || 7); ls.forEach(function (l, i) { KIT.text(l, x, y - (ls.length - 1 - i) * ((o.size || 7) + 5), o); }); }
/* the boss falls: the fog lifts for good, the music comes back, a seal breaks */
var flowHurtBoss = hurtBoss;
hurtBoss = function (dmg, heavy) { var was = BOSS && BOSS.hp > 0; flowHurtBoss(dmg, heavy); if (was && BOSS && BOSS.hp <= 0) { var id = BOSS.B === BOSSES.tb ? 'tb' : Object.keys(BOSSES).filter(function (k) { return BOSSES[k] === BOSS.B; })[0]; SV.bosses[id] = 1; persist();
    if (id !== 'tb') setTimeout(function () { var n = ['muckies', 'bride', 'stag'].filter(function (b) { return SV.bosses[b]; }).length; G.banner = { t: 3.5, s: 'A SEAL BREAKS  ·  ' + n + ' OF 3' }; }, 4200); } };
