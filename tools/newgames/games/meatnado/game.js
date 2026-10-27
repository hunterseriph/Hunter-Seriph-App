/* =====================================================================================================
   MEATNADO ESCAPE: the endless run through the night city with the meatnado right behind you.
   Five runners (Cumhead, Greebo, Amy, the Homunculus, TB), foes from our other games, power-ups on the
   road, and drops banked after every run to spend at Saba's on upgrades and new runners.
   Saves: mn-save (the old best score keys mne-best / mne-bestm are read once).
   ===================================================================================================== */
var W = 480, H = 270, GY = 226, PXS = 150, PW = 12, PH = 36, CATCH = 16;
var R = KIT.R, spr = KIT.spr, text = KIT.text;
(function () { var sc = document.getElementById('scan'); if (sc) sc.hidden = true; })(); // no scanlines over this one

/* ---------- save ---------- */
var SAVE_KEY = 'mn-save';
var SV = KIT.load(SAVE_KEY, null);
if (!SV) {
  SV = { v: 1, bank: 0, ups: {}, chars: { cumhead: 1 }, ch: 'cumhead', best: 0, bestm: 0, runs: 0, total: 0 };
  try { SV.best = parseInt(localStorage.getItem('mne-best') || '0', 10) || 0; SV.bestm = parseInt(localStorage.getItem('mne-bestm') || '0', 10) || 0; } catch (e) {}
}
SV.ups = SV.ups || {}; SV.chars = SV.chars || { cumhead: 1 };
function persist() { KIT.save(SAVE_KEY, SV); }
function U(id) { return SV.ups[id] || 0; }

/* ---------- art ---------- */
var IMG = {}; Object.keys(MNIMG).forEach(function (k) { var i = new Image(); i.src = MNIMG[k]; IMG[k] = i; });
function ok(i) { return i && i.complete && i.naturalWidth > 0; }

/* ---------- the runners ---------- */
var CHARS = [
  { id: 'cumhead', n: 'Cumhead', cost: 0, jumps: 2, shot: 'fire', cd: 0.42, d: 'Double jump. B throws a fireball.' },
  { id: 'greebo', n: 'Greebo', cost: 250, jumps: 2, shot: 'pie', cd: 0.62, hitK: 0.67, d: 'Throws a big cream pie that flattens every foe in a row. Tough: hits cost him a third less.' },
  { id: 'amy', n: 'Amy', cost: 450, jumps: 2, shot: 'swing', cd: 0.36, d: 'Swings the Sausage: smacks every foe in front of her and knocks thrown bones and pies out of the air.' },
  { id: 'hom', n: 'The Homunculus', cost: 700, jumps: 2, shot: 'hom', cd: 0.3, d: 'Hatches from an egg every run: usually a Gloop, sometimes another breed, now and then a Bloodmoon. Each breed has its own attack, and he grows from baby to adult as you grab drops and squash foes.' },
  { id: 'tb', n: 'TB', cost: 1200, jumps: 2, shot: 'pill', cd: 0.5, d: "Lobs TB's Silly Pills that bounce down the road and flatten everything they hit. He has a lot to say." }
];
/* TB says ONE of his lines when the run starts and each time he gets hit (same lines as Load Legacy, kept exact) */
var TBQUOTES = ['"Fuck muck"', '"Shithead Laboozie"', '"let me tighten that kynodesme"', '"dick skin"', '"whyma wimina"', '"suck your own and fuck your own"', '"suck me fuck me suck me fuck me"', '"I got lotion on my dick I\'m out here shooting my shit I\'m free man for real!"', '"Old geezer, Prick teaser"', '"I made muckies..."', '"a sissy doesn\'t deserve pleasure, a sissy is someone plaything"'];
function tbSay() { G.say = { t: 2.6, s: pick(TBQUOTES) }; }
/* the Homunculus: same breeds, odds and growth as Load Legacy (tools/homunculus art), each breed with its own attack */
var HOMB = { gloop: ['Gloop', '#3fb43a', 'Acid Spit: fast acid.'], guard: ['Bulwark', '#6a8aff', 'Headbutt: smashes what is in front. Bone plates: hits cost a quarter less.'],
  ember: ['Embertail', '#ff7a30', 'Fire Breath: bursts of fire.'], frost: ['Frostbite', '#9adfff', 'Icicles that pierce a whole row.'], volt: ['Voltling', '#ffe36a', 'Zap: the nearest foe ahead, instantly. Chains when he is grown.'],
  medic: ['Mendling', '#ff9ad0', 'Bandage Lash: long reach. Patches up: slowly pushes the meatnado back.'], leech: ['Leechling', '#c070ff', 'Bite: every kill drinks, shoving the meatnado back further.'],
  scout: ['Peeper', '#a6e83a', 'Eye Laser: a beam through everything ahead.'], goldie: ['Goldie', '#ffd040', 'Coin Toss: bouncing coins. Banks 30% more drops.'],
  titan: ['Titan', '#ff5a90', 'Ground Pound: shockwaves along the road.'], blood: ['Bloodmoon', '#ff2630', 'Blood Scythe: a wide swing that throws a crescent. The rarest and strongest.'] };
var HOMST = ['baby', 'teen', 'adult'], HOMNEED = [0, 150, 480];
function homPick() { var o = Object.keys(HOMB).filter(function (k) { return k !== 'gloop' && k !== 'blood'; }), r = Math.random(); if (r < 0.06) return 'blood'; return r < 0.53 ? 'gloop' : pick(o); }
function homGain(n) { var h = G.hom; if (!h || h.st >= 2 || P.state === 'dead') return; h.g += n; if (h.g >= HOMNEED[h.st + 1]) { h.st++; G.banner = 2; G.bannerTxt = HOMB[h.b][0].toUpperCase() + (h.st === 1 ? ' IS A TEENAGER' : ' IS FULLY GROWN'); sfx.play('pup'); poof(P.x, P.y - 20, 22, [HOMB[h.b][1], '#f1e7d0', '#ffe36a']); } }
var CH = {}; CHARS.forEach(function (c) { CH[c.id] = c; });
function me() { return CH[SV.ch] || CHARS[0]; }

/* ---------- upgrades at Saba's (bought with banked drops) ---------- */
var UPS = [
  { id: 'head', n: 'Head Start', max: 5, cost: 60, d: function (l) { return 'Start ' + l * 15 + ' further ahead of the meatnado.'; } },
  { id: 'skin', n: 'Thick Skin', max: 4, cost: 80, d: function (l) { return 'Hits let it gain ' + l * 12 + '% less.'; } },
  { id: 'jump', n: 'Spring Shoes', max: 3, cost: 90, d: function (l) { return 'Jump ' + l * 5 + '% higher.'; } },
  { id: 'fire', n: 'Quick Hands', max: 3, cost: 80, d: function (l) { return 'Fire ' + l * 10 + '% faster.'; } },
  { id: 'pupt', n: 'Long Lasting', max: 5, cost: 70, d: function (l) { return 'Power-ups last ' + l * 15 + '% longer.'; } },
  { id: 'pups', n: 'Lucky Streets', max: 5, cost: 70, d: function (l) { return 'Power-ups turn up ' + l * 10 + '% more often.'; } },
  { id: 'value', n: 'Fat Drops', max: 5, cost: 100, d: function (l) { return 'Bank ' + l * 10 + '% more drops after a run.'; } },
  { id: 'shield', n: 'Bubble Shield', max: 2, cost: 300, grow: 2.2, d: function (l) { return l === 1 ? 'Start every run with a shield.' : 'Start with a shield, and it grows back once.'; } },
  { id: 'launch', n: 'Launch Pad', max: 2, cost: 400, grow: 2, d: function (l) { return 'Start every run with a ' + l * 2 + ' s rocket.'; } },
  { id: 'revive', n: 'Second Wind', max: 1, cost: 800, d: function () { return 'Once a run, when it catches you, you burst free.'; } }
];
function upCost(u) { return Math.round(u.cost * Math.pow(u.grow || 1.7, U(u.id)) / 5) * 5; }

/* ---------- power-ups on the road ---------- */
var PUPS = {
  magnet: { n: 'MAGNET', t: 9, w: 3 }, shield: { n: 'SHIELD', w: 2 }, rocket: { n: 'ROCKET!', t: 3, w: 2 },
  double: { n: 'DOUBLE DROPS', t: 10, w: 3 }, rapid: { n: 'RAPID FIRE', t: 8, w: 2 }, cracker: { n: 'CUM CRACKER', w: 2 }
};
function pupLen(k) { return PUPS[k].t * (1 + U('pupt') * 0.15); }

/* ---------- foes (all from our other games) ---------- */
var FOES = {
  rat: { s: 'f_rat_', air: 0, v: 70, w: 18, h: 10, at: 0, pts: 20 },
  crawler: { s: 'f_crawler_', air: 0, v: 24, w: 24, h: 16, flip: 1, at: 0, pts: 25 },
  slime: { s: 'f_slime_', air: 0, v: 20, w: 18, h: 14, flip: 1, at: 6, pts: 25, hop: 1 },
  bat: { s: 'f_bat_', air: 1, v: 34, w: 20, h: 12, at: 12, pts: 30 },
  skeleton: { s: 'f_skeleton_', air: 0, v: 14, w: 14, h: 30, at: 18, pts: 35, throws: 'bone' },
  crow: { s: 'f_crow_', air: 1, v: 40, w: 18, h: 12, flip: 1, at: 25, pts: 35, dive: 1 },
  clown: { s: 'f_clown_', air: 0, v: 0, w: 18, h: 30, flip: 1, at: 32, pts: 40, throws: 'pie' },
  bonehound: { s: 'f_bonehound_', air: 0, v: 40, w: 26, h: 14, flip: 1, at: 40, pts: 40, charge: 1 },
  balloon: { s: 'f_balloon_', air: 1, v: 10, w: 14, h: 20, at: 48, pts: 40, pops: 1 },
  knight: { s: 'f_knight_', air: 0, v: 12, w: 18, h: 30, flip: 1, at: 56, pts: 60, shield: 1 },
  imp: { s: 'f_imp_', air: 1, v: 55, w: 20, h: 18, flip: 1, at: 64, pts: 45 },
  creamblob: { s: 'f_creamblob_', air: 0, v: 22, w: 18, h: 14, at: 72, pts: 30, splits: 1 },
  cultrat: { s: 'f_cultrat_', air: 0, v: 46, w: 16, h: 26, flip: 1, at: 80, pts: 45 }
};
function foePool(air) { var t = G.time; return Object.keys(FOES).filter(function (k) { return FOES[k].air === air && FOES[k].at <= t; }); }

/* ---------- state ---------- */
var G = { mode: 'title', t: 0, time: 0, cam: 0, v: 150, gap: 175, drops: 0, total: 0, kills: 0, dist: 0, score: 0, nextMark: 500, flash: 0, flashT: 5, banner: 0, bannerTxt: '', shake: 0, stumble: 0, caught: false, rainT: 9, pupT: 10, pw: {} };
var P, pits, obs, drops, ledges, shots, eshots, parts, pups, genX, lastMix, rain = [], orbit = [], wind = [];
(function () { for (var i = 0; i < 16; i++) orbit.push({ a: Math.random() * 6.283, w: 1.6 + Math.random() * 2.2, rx: 58 + Math.random() * 62, y: 12 + Math.random() * 230, ry: 7 + Math.random() * 11, s: i % NB.s.length, tilt: (Math.random() - 0.5) * 0.8 });
  for (i = 0; i < 14; i++) wind.push({ x: Math.random() * 600, y: 20 + Math.random() * 200, l: 18 + Math.random() * 40, v: 260 + Math.random() * 260 }); })();
function headStart() { return U('head') * 15; }
function maxGap() { return 235 + headStart() - Math.min(75, G.time * 0.9); }
function resetPlayer(x) {
  P = { x: x || 0, y: GY, vy: 0, onGround: true, coyote: 0, jumpBuf: 0, jumpHeld: false, jumps: 0, state: 'normal', wasG: true, lsf: 0, hurtT: 0, inv: 0, deadT: 0, attackT: 0, atkCd: 0, anim: 0, jumpStartT: 0, prevJump: false, shield: 0, regrow: 0, revive: 0, floatT: 0 };
}
resetPlayer(0); pits = []; obs = []; drops = []; ledges = []; shots = []; eshots = []; parts = []; pups = [];

/* ---------- sound ---------- */
var st = sfx.tone, sn = sfx.noise, lastPick = -9, combo = 0, lastStep = 0;
sfx.add('mjump', function () { st('square', 250, 640, 0.15, 0.07); });
sfx.add('mdbl', function () { st('square', 420, 980, 0.12, 0.07); st('triangle', 840, 1400, 0.08, 0.05, 0.04); });
sfx.add('whoosh', function () { sn(0.7, 0.09, 500); st('sawtooth', 95, 60, 0.7, 0.035); });
sfx.add('mland', function () { sn(0.07, 0.16, 500); st('sine', 120, 60, 0.07, 0.1); });
sfx.add('mshoot', function () { st('sawtooth', 1000, 180, 0.14, 0.06); sn(0.1, 0.05, 2500); });
sfx.add('stomp', function () { st('square', 180, 520, 0.12, 0.08); sn(0.08, 0.1, 900); });
sfx.add('kill', function () { sn(0.2, 0.14, 1800); st('triangle', 520, 90, 0.18, 0.1); });
sfx.add('tink', function () { st('square', 1500, 1200, 0.05, 0.05); });
sfx.add('pop', function () { sn(0.12, 0.2, 2400); st('square', 900, 200, 0.1, 0.06); });
sfx.add('pup', function () { [659, 784, 1319, 1175, 1319, 1568].forEach(function (f, i) { st('square', f, f, 0.09, 0.05, i * 0.06); }); });
sfx.add('check', function () { st('triangle', 523, 523, 0.22, 0.12); st('triangle', 784, 784, 0.22, 0.12, 0.1); });
function pickSound() { combo = (G.t - lastPick < 0.5) ? Math.min(combo + 1, 10) : 0; lastPick = G.t; var f = 988 * Math.pow(2, combo / 12); st('square', f, f, 0.05, 0.045); st('square', f * 1.5, f * 1.5, 0.09, 0.045, 0.05); }
var rumble = (function () { var g = null; return function (l) { var a = sfx.audio(); if (!a) return; if (!g) { var s = a.ctx.createBufferSource(); s.buffer = a.nb; s.loop = true; var f = a.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220; g = a.ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(a.master); s.start(); } g.gain.setTargetAtTime(sfx.muted ? 0 : l * 0.2, a.ctx.currentTime, 0.12); }; })();

/* ---------- world generation ---------- */
function addDrop(x, y) { drops.push({ x: x, y: y, fly: false, vx: 0, vy: 0, age: 0 }); }
function dRow(x0, x1, y, n) { for (var i = 0; i < n; i++) addDrop(x0 + (n === 1 ? 0 : (x1 - x0) * i / (n - 1)), y); }
function dArc(x0, x1, y, h, n) { for (var i = 0; i < n; i++) { var u = n === 1 ? 0.5 : i / (n - 1); addDrop(x0 + (x1 - x0) * u, y - 4 * h * u * (1 - u)); } }
function spikes(x, w) { obs.push({ k: 's', x: x, w: w }); }
function foe(x, kind, y) {
  var F = FOES[kind]; if (!F) return; var fy = y !== undefined ? y : F.air ? GY - 26 - Math.random() * 30 : GY;
  obs.push({ k: 'f', f: kind, F: F, x: x, y: fy, by: fy, vy: 0, ph: Math.random() * 6, alive: true, t: Math.random() * 2, cd: 1 + Math.random() * 1.5, sc: 1 });
}
function addPit(x, w) { pits.push([x, x + w]); }
var PAT = {
  drops: function (x, v) { var n = 5 + Math.floor(Math.random() * 4); dRow(x, x + n * 16, GY - 22, n); return n * 16; },
  spikes: function (x, v) { var w = pick([24, 32, 32, 40]); spikes(x + 24, w); dArc(x + 8, x + 40 + w, GY - 18, 52, 6); return w + 60; },
  ground: function (x, v) { foe(x + 30, pick(foePool(0))); dRow(x + 70, x + 150, GY - 40, 4); return 150; },
  pit: function (x, v) { var w = Math.round(v * 0.7 * rnd(0.42, 0.62)); addPit(x + 20, w); dArc(x + 8, x + 32 + w, GY - 18, 54, 6); return w + 44; },
  air: function (x, v) { var p = foePool(1); if (!p.length) return PAT.ground(x, v); foe(x + 40, pick(p)); dRow(x + 90, x + 150, GY - 22, 4); return 150; },
  ledge: function (x, v) { var w = pick([70, 90, 110]); ledges.push([x + 30, GY - 48, w]); dRow(x + 40, x + 20 + w, GY - 66, Math.max(3, Math.floor(w / 22))); if (Math.random() < 0.6) spikes(x + 30 + w / 2 - 16, 32); return w + 70; },
  spikes2: function (x, v) { spikes(x + 20, 24); spikes(x + 44 + Math.round(v * 0.52), 24); dRow(x + 50, x + 40 + Math.round(v * 0.52), GY - 66, 4); return 48 + Math.round(v * 0.52) + 50; },
  pitair: function (x, v) { var w = Math.round(v * 0.7 * 0.45), p = foePool(1); addPit(x + 20, w); if (p.length) foe(x + 100 + w, pick(p)); return w + 160; },
  ground2: function (x, v) { var p = foePool(0); foe(x + 30, pick(p)); foe(x + 30 + Math.round(v * 0.62), pick(p)); return Math.round(v * 0.62) + 70; }
};
function choose() {
  var t = G.time, pool = ['drops', 'spikes', 'ground'];
  if (t > 9) pool.push('ledge', 'pit');
  if (t > 12) pool.push('air');
  if (t > 28) pool.push('spikes2', 'ground', 'air');
  if (t > 40) pool.push('ground2', 'pitair', 'pit');
  var p = pick(pool); if (p === lastMix && pool.length > 2) p = pick(pool); lastMix = p; return p;
}
function generate() {
  while (genX < G.cam + W + 260) {
    var v = G.v + 12, name = G.time < 2.5 ? 'drops' : choose();
    genX += PAT[name](genX, v) + v * 0.52 + 36 + rnd(0, 46) * (1 - Math.min(0.6, G.time / 150));
  }
}
function cull() {
  var lo = G.cam - 140;
  pits = pits.filter(function (p) { return p[1] > lo; }); obs = obs.filter(function (o) { return o.x + (o.w || 0) > lo; });
  drops = drops.filter(function (d) { return d.x > lo && d.y < H + 40; }); ledges = ledges.filter(function (l) { return l[0] + l[2] > lo; });
  pups = pups.filter(function (p) { return p.x > lo && !p.got; }); eshots = eshots.filter(function (s) { return s.x > lo && s.y < H + 20 && s.life > 0; });
}

/* ---------- runs ---------- */
function startRun() {
  KIT.closeMenu(); var c = me();
  G.mode = 'play'; G.time = 0; G.drops = 0; G.total = 0; G.kills = 0; G.dist = 0; G.score = 0; G.nextMark = 500; G.v = 150; G.gap = 175 + headStart(); G.stumble = 0; G.caught = false; G.rainT = 9;
  G.pupT = 8; G.pw = {}; rain = []; pits = []; obs = []; drops = []; ledges = []; shots = []; eshots = []; parts = []; pups = []; lastMix = '';
  resetPlayer(0); P.shield = U('shield') ? 1 : 0; P.regrow = U('shield') >= 2 ? 1 : 0; P.revive = U('revive');
  if (U('launch')) G.pw.rocket = U('launch') * 2;
  G.cam = P.x - PXS; genX = P.x + 260; G.banner = 1.8; G.bannerTxt = 'RUN!';
  generate(); music.play('mnrun'); sfx.play('select'); G.char = c; G.say = null; G.hom = null; G.fx = [];
  if (c.id === 'hom') { G.hom = { b: homPick(), st: 0, g: 0 }; G.bannerTxt = 'A BABY ' + HOMB[G.hom.b][0].toUpperCase() + ' HATCHES'; G.banner = 2.4; poof(P.x, P.y - 10, 20, ['#f1e7d0', '#fff6d8', HOMB[G.hom.b][1]]); }
  if (c.id === 'tb') tbSay();
}
function poof(x, y, n, cols) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = 40 + Math.random() * 90; parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.5 + Math.random() * 0.3, c: cols[i % cols.length] }); } }
var BLOOD = ['#ff2630', '#b3121c', '#f1e7d0'];
function killPlayer(fall) {
  if (P.state === 'dead') return;
  if (P.revive > 0) { // Second Wind
    P.revive--; G.gap = Math.max(G.gap, CATCH + 110); P.inv = 2.5; P.state = 'normal'; G.banner = 1.6; G.bannerTxt = 'SECOND WIND!'; sfx.play('pup'); KIT.flash(0.2); poof(P.x, P.y - 20, 20, ['#ffe36a', '#f1e7d0']);
    if (fall) { P.y = GY - 120; P.vy = -100; P.onGround = false; } return;
  }
  G.caught = G.gap <= CATCH + 2 && !fall; sfx.play('lose'); P.state = 'dead'; P.deadT = 0; P.attackT = 0; G.shake = 5;
  P.vy = fall ? 0 : -250; P.fell = !!fall; if (G.caught) P.vy = -120;
}
function hurtPlayer(srcx) {
  if (P.inv > 0 || P.state !== 'normal' || G.pw.rocket > 0) return;
  if (P.shield > 0) { P.shield--; P.inv = 1.2; sfx.play('pop'); poof(P.x, P.y - 18, 14, ['#9adfff', '#ffffff']); if (P.regrow > 0 && !P.shield) { P.regrow--; P.regrowT = 12; } return; }
  G.shake = 5; sfx.play('hurt'); G.stumble = 0.5; if (G.char.id === 'tb') tbSay();
  var loss = (G.drops > 0 ? 24 : 40) * (1 - U('skin') * 0.12) * (G.char.hitK || 1) * (G.hom && G.hom.b === 'guard' ? 0.75 : 1); G.gap -= loss;
  if (G.gap <= CATCH) { killPlayer(false); return; }
  if (G.drops > 0) { var n = Math.min(G.drops, 10); for (var i = 0; i < n; i++) { var a = -Math.PI * (0.15 + 0.7 * (i / Math.max(1, n - 1))), s = 110 + Math.random() * 70; drops.push({ x: P.x, y: P.y - 20, fly: true, vx: Math.cos(a) * s * 0.6, vy: Math.sin(a) * s, age: 0 }); } G.drops = 0; }
  P.state = 'hurt'; P.hurtT = 0.4; P.vy = -170; P.inv = 1.6; P.onGround = false;
}
function ov(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) { return ax0 < bx1 && ax1 > bx0 && ay0 < by1 && ay1 > by0; }
var GRAV = 950, JCUT = 125, TERM = 430;
function supported(x) { for (var i = 0; i < pits.length; i++) if (x - 4 > pits[i][0] && x + 4 < pits[i][1]) return false; return true; }
function movePlayer(dt) {
  var prevY = P.y, i; P.y += P.vy * dt; P.onGround = false;
  if (P.vy >= 0 && prevY <= GY + 0.01 && P.y >= GY && (supported(P.x) || G.pw.rocket > 0)) { P.y = GY; P.vy = 0; P.onGround = true; }
  for (i = 0; i < ledges.length; i++) { var l = ledges[i]; if (P.vy >= 0 && prevY <= l[1] + 0.01 && P.y >= l[1] && P.x + PW / 2 > l[0] && P.x - PW / 2 < l[0] + l[2]) { P.y = l[1]; P.vy = 0; P.onGround = true; } }
  if (P.y > GY + 10 && !P.onGround && P.state !== 'dead') { // fell in a pit: climb out, lose ground
    var ex = P.x + 20; for (i = 0; i < pits.length; i++) if (P.x > pits[i][0] - 6 && P.x < pits[i][1] + 6) ex = pits[i][1] + 14;
    P.x = ex; P.y = GY; P.vy = 0; P.onGround = true; P.state = 'hurt'; P.hurtT = 0.4; P.inv = 1.8; G.stumble = 0.55; G.shake = 6; sfx.play('hurt');
    G.gap -= 70 * (1 - U('skin') * 0.12); if (G.gap <= CATCH) killPlayer(false);
  }
}
function fire() {
  var c = G.char, k = c.shot; sfx.play('mshoot'); P.attackT = 0.2;
  P.atkCd = c.cd * (1 - U('fire') * 0.1) * (G.pw.rapid > 0 ? 0.35 : 1);
  if (k === 'fire') shots.push({ k: k, x: P.x + 12, y: P.y - 24, vx: G.v + 280, vy: 0, life: 0.6 });
  else if (k === 'pie') shots.push({ k: k, x: P.x + 12, y: P.y - 22, vx: G.v + 230, vy: 0, life: 0.42, pierce: 1 });
  else if (k === 'swing') { shots.push({ k: 'swing', x: P.x + 22, y: P.y - 18, follow: 22, vx: 0, vy: 0, life: 0.16, w: 30, h: 30, pierce: 1, deflect: 1 }); sfx.play('stomp'); }
  else if (k === 'pill') shots.push({ k: k, x: P.x + 10, y: P.y - 26, vx: G.v + 170, vy: -170, grav: 650, life: 1.6, pierce: 1, bounce: 2 });
  else if (k === 'hom') homFire();
}
var HOMCD = { gloop: 0.7, guard: 1.1, ember: 1.25, frost: 1, volt: 1.4, medic: 1.1, leech: 1.1, scout: 1.6, goldie: 1.1, titan: 1.5, blood: 0.9 };
function homFire() {
  var h = G.hom, b = h.b, st = h.st, col = HOMB[b][1], y = P.y - 18, big = 1 + st * 0.35;
  P.atkCd = G.char.cd * HOMCD[b] * (1 - U('fire') * 0.1) * (G.pw.rapid > 0 ? 0.35 : 1);
  function blob(o) { o.col = col; o.r = (o.r || 3) * big; shots.push(o); }
  if (b === 'gloop') blob({ k: 'blob', x: P.x + 10, y: y, vx: G.v + 300, vy: 0, life: 0.45 + st * 0.12 });
  else if (b === 'ember') for (var i = 0; i < 3; i++) blob({ k: 'blob', x: P.x + 10, y: y, vx: G.v + 210 + i * 30, vy: (i - 1) * 45, life: 0.22 + st * 0.08, pierce: 1, r: 4 });
  else if (b === 'frost') blob({ k: 'ice', x: P.x + 10, y: y, vx: G.v + 340, vy: 0, life: 0.55 + st * 0.15, pierce: 1 });
  else if (b === 'goldie') blob({ k: 'coin', x: P.x + 10, y: y - 6, vx: G.v + 160, vy: -160, grav: 650, life: 1.4, pierce: 1, bounce: 2 });
  else if (b === 'titan') blob({ k: 'shock', x: P.x + 12, y: GY - 6, vx: G.v + 200, vy: 0, life: 0.7 + st * 0.15, pierce: 1, r: 5 });
  else if (b === 'guard' || b === 'leech' || b === 'medic' || b === 'blood') {
    var reach = (b === 'medic' ? 54 : b === 'blood' ? 40 : 26) * (1 + st * 0.25);
    shots.push({ k: 'swing', x: P.x + 8 + reach / 2, y: P.y - 18, follow: 8 + reach / 2, vx: 0, vy: 0, life: 0.16, w: reach, h: 28 + st * 6, pierce: 1, col: col, deflect: b === 'blood' });
    if (b === 'blood') blob({ k: 'cres', x: P.x + 14, y: y, vx: G.v + 260, vy: 0, life: 0.45 + st * 0.1, pierce: 1, r: 5 });
    sfx.play('stomp');
  } else if (b === 'volt' || b === 'scout') {
    var reachX = b === 'scout' ? 300 : 180 + st * 40;
    var ahead = obs.filter(function (o) { return o.k === 'f' && o.alive && o.bx0 !== undefined && o.x > P.x && o.x - P.x < reachX && (b === 'volt' || Math.abs((o.by0 + o.by1) / 2 - y) < 18 + st * 6); }).sort(function (a, q) { return a.x - q.x; });
    var n = b === 'scout' ? ahead.length : 1 + st;
    ahead.slice(0, n).forEach(function (o) { G.fx.push({ k: b, x0: P.x + 10, y0: y, x1: o.x, y1: (o.by0 + o.by1) / 2, t: 0.14, col: col }); killFoe(o, 'shot'); });
    if (b === 'scout' || !ahead.length) G.fx.push({ k: b, x0: P.x + 10, y0: y, x1: P.x + (b === 'scout' ? 300 : 120), y1: y, t: 0.12, col: col });
  }
}
function input() { return { j: KIT.held('a') || KIT.held('up') || (KIT.ptr.down && G.mode === 'play'), jp: KIT.pressed('a') || KIT.pressed('up') || KIT.ptr.tap, f: KIT.held('b') || KIT.held('x') }; }
function updatePlayer(dt) {
  var c = G.char, inp = input(), jumpPressed = inp.jp;
  if (P.inv > 0) P.inv -= dt; if (P.atkCd > 0) P.atkCd -= dt; if (P.attackT > 0) P.attackT -= dt; if (P.jumpStartT > 0) P.jumpStartT -= dt;
  if (P.regrowT > 0) { P.regrowT -= dt; if (P.regrowT <= 0 && !P.shield) { P.shield = 1; sfx.play('magic'); } }
  var jv = 335 * (1 + U('jump') * 0.05), jv2 = 290 * (1 + U('jump') * 0.05);
  if (P.state === 'dead') { P.deadT += dt; P.vy = Math.min(TERM, P.vy + GRAV * dt); P.y += P.vy * dt; if (P.deadT > 1.1 && G.mode === 'play') endRun(); return; }
  if (P.state === 'hurt') { P.hurtT -= dt; P.vy = Math.min(TERM, P.vy + GRAV * dt); movePlayer(dt); if (P.hurtT <= 0) P.state = 'normal'; }
  else {
    if (P.onGround) { P.coyote = 0.09; P.jumps = 0; } else P.coyote -= dt;
    if (jumpPressed) P.jumpBuf = 0.12; else P.jumpBuf -= dt;
    if (P.jumpBuf > 0 && P.coyote > 0) { sfx.play('mjump'); P.vy = -jv; P.onGround = false; P.coyote = 0; P.jumpBuf = 0; P.jumpStartT = 0.07; P.jumpHeld = true; P.jumps = 1; }
    else if (P.jumpBuf > 0 && !P.onGround && P.jumps < c.jumps && P.coyote <= 0) { sfx.play('mdbl'); P.vy = -jv2; P.jumpBuf = 0; P.jumpStartT = 0.07; P.jumpHeld = true; P.jumps++; poof(P.x, P.y - 4, 6, ['#f1e7d0', '#ff2630']); }
    if (P.jumpHeld && !inp.j && P.vy < -JCUT) { P.vy = -JCUT; P.jumpHeld = false; }
    if (P.vy >= 0) P.jumpHeld = false;
    if (inp.f && P.atkCd <= 0) fire();
    var g = GRAV; P.floating = false;
    if (c.float && inp.j && !P.onGround && P.vy > 0 && !P.jumpHeld) { g = GRAV * 0.12; P.vy = Math.min(P.vy, 55); P.floating = true; }
    P.vy = Math.min(TERM, P.vy + g * dt); movePlayer(dt);
  }
  if (P.onGround && !P.wasG && P.state === 'normal') sfx.play('mland');
  P.wasG = P.onGround;
  if (P.onGround && P.state === 'normal') { P.anim += dt * Math.min(G.v * 0.154, 34); var sf = Math.floor(P.anim * 0.5); if (sf !== P.lsf) { P.lsf = sf; if (G.t - lastStep > 0.09) { lastStep = G.t; sfx.play('step'); } } }
}
function killFoe(o, how) {
  o.alive = false; G.kills++; homGain(10); if (G.hom && G.hom.b === 'leech') G.gap = Math.min(maxGap(), G.gap + 6); G.score += o.F.pts; G.gap = Math.min(maxGap(), G.gap + 8 * (how === 'stomp' && G.char.stompK ? G.char.stompK : 1));
  sfx.play(how === 'stomp' ? 'stomp' : 'kill'); poof(o.x, o.y - o.F.h / 2, 9, o.F.s === 'f_creamblob_' ? ['#f1e7d0', '#fffbe8'] : BLOOD);
  if (o.F.pops) { sfx.play('pop'); for (var i = 0; i < 6; i++) { var a = -Math.PI * (i / 5); eshots.push({ k: 'shard', x: o.x, y: o.y - 10, vx: Math.cos(a) * 140 - 40, vy: Math.sin(a) * 140, grav: 300, life: 1.2, hurts: how !== 'stomp' }); } }
  if (o.F.splits && o.sc > 0.7) for (var j = 0; j < 2; j++) { foe(o.x + (j ? 18 : -6), 'creamblob'); var b = obs[obs.length - 1]; b.sc = 0.6; b.vy = -160; b.y = o.y - 4; }
}
function updateWorld(dt) {
  var i, j, o, d, s, px0 = P.x - PW / 2 + 1, px1 = P.x + PW / 2 - 1, py0 = P.y - PH, py1 = P.y, alive = P.state !== 'dead';
  for (i = 0; i < obs.length; i++) {
    o = obs[i];
    if (o.k === 's') { if (alive && ov(px0 + 1, py0, px1 - 1, py1, o.x + 2, GY - 8, o.x + o.w - 2, GY)) hurtPlayer(o.x + o.w / 2); continue; }
    if (!o.alive) continue;
    var F = o.F, sx = o.x - G.cam; o.t += dt;
    var v = F.v; if (F.charge && sx < W - 20) v = 150; o.x -= v * dt;
    if (F.air) { if (F.dive && sx < 260 && !o.diving && P.x < o.x) { o.diving = 1; } if (o.diving) { o.y += clamp((P.y - 18) - o.y, -120 * dt, 120 * dt); o.x -= 60 * dt; } else o.y = o.by + Math.sin(o.t * 3 + o.ph) * 7; }
    else { if (F.hop) { o.vy += 700 * dt; o.y += o.vy * dt; if (o.y >= GY) { o.y = GY; o.vy = o.t % 2 < 1 ? 0 : -220; } } else if (o.vy) { o.vy += 700 * dt; o.y += o.vy * dt; if (o.y >= GY) { o.y = GY; o.vy = 0; } } }
    if (F.throws && sx < W - 10 && sx > 40) { o.cd -= dt; if (o.cd <= 0) { o.cd = 2 + Math.random() * 1.2; var tx = (P.x + G.v * 0.9) - o.x, tt = 0.9; eshots.push({ k: F.throws, x: o.x - 6, y: o.y - F.h, vx: tx / tt, vy: -260, grav: 560, life: 2, hurts: 1, spin: 0 }); sfx.play('tick'); } }
    var w = F.w * o.sc, h = F.h * o.sc; o.bx0 = o.x - w / 2; o.bx1 = o.x + w / 2; o.by0 = (F.air ? o.y - h / 2 : o.y - h); o.by1 = F.air ? o.y + h / 2 : o.y;
    if (!alive) continue;
    if (ov(px0, py0, px1, py1, o.bx0, o.by0, o.bx1, o.by1)) {
      if (G.pw.rocket > 0) { killFoe(o, 'rocket'); continue; }
      if (P.vy > 30 && P.y - 6 < o.by0 + 8 && P.state === 'normal') {
        killFoe(o, 'stomp'); var big = G.char.stompK ? 1.35 : 1; if (F.pops) big *= 1.3;
        P.vy = (input().j ? -310 : -225) * big; P.onGround = false; P.jumpHeld = input().j; P.jumps = 1;
      } else hurtPlayer(o.x);
    }
  }
  for (i = 0; i < shots.length; i++) {
    s = shots[i]; s.life -= dt; if (s.follow !== undefined) { s.x = P.x + s.follow; s.y = P.y - 18; } else { s.x += s.vx * dt; s.y += s.vy * dt; if (s.grav) s.vy += s.grav * dt; }
    if (s.bounce !== undefined && s.y > GY - 5 && s.vy > 0) { if (s.bounce > 0) { s.bounce--; s.y = GY - 5; s.vy = -s.vy * 0.6; } else s.life = 0; }
    if (s.deflect) for (j = 0; j < eshots.length; j++) { var e2 = eshots[j]; if (e2.life > 0 && Math.abs(e2.x - s.x) < s.w / 2 + 6 && Math.abs(e2.y - s.y) < s.h / 2 + 6) { e2.life = 0; poof(e2.x, e2.y, 5, ['#f1e7d0']); sfx.play('tink'); } }
    if (s.hit === undefined) s.hit = [];
    var hw = s.w ? s.w / 2 : s.r ? s.r + 3 : 7, hh = s.h ? s.h / 2 : s.r ? s.r + 3 : 8;
    if (false) { if (s.life < 0.05 && !s.popped) { s.popped = 1; sfx.play('pop'); poof(s.x, s.y, 10, ['#3a2a30', '#ff2630']); obs.forEach(function (q) { if (q.k === 'f' && q.alive && Math.hypot(q.x - s.x, q.y - s.y) < 46) killFoe(q, 'shot'); }); } }
    for (j = 0; j < obs.length; j++) {
      o = obs[j]; if (o.k === 's' || !o.alive || o.bx0 === undefined) continue;
      if (s.hit.indexOf(o) < 0 && ov(s.x - hw, s.y - hh, s.x + hw, s.y + hh, o.bx0, o.by0, o.bx1, o.by1)) {
        s.hit.push(o);
        if (o.F.shield && s.k !== 'swing' && s.k !== 'shock') { s.life = 0; sfx.play('tink'); poof(s.x, s.y, 4, ['#d0c8d0']); break; }
        if (!s.pierce) s.life = 0; killFoe(o, 'shot');
        if (!s.pierce) break;
      }
    }
  }
  shots = shots.filter(function (q) { return q.life > 0; });
  obs = obs.filter(function (q) { return q.k === 's' || q.alive; });
  for (i = 0; i < eshots.length; i++) {
    s = eshots[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += (s.grav || 0) * dt; s.life -= dt; s.spin = (s.spin || 0) + dt * 10;
    if (s.y > GY - 4 && s.k !== 'shard') { s.life = 0; poof(s.x, GY - 4, 4, s.k === 'pie' ? ['#f1e7d0', '#fffbe8'] : ['#f1e7d0']); continue; }
    if (alive && s.hurts && ov(px0, py0, px1, py1, s.x - 5, s.y - 4, s.x + 5, s.y + 4)) { s.life = 0; hurtPlayer(s.x); }
  }
  // drops (the magnet pulls them in)
  var keep = [], mag = G.pw.magnet > 0;
  for (i = 0; i < drops.length; i++) {
    d = drops[i]; d.age += dt;
    if (d.fly) { d.vy += 700 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.y > GY - 5 && supported(d.x)) { d.y = GY - 5; d.vy *= -0.55; d.vx *= 0.8; } if (d.age > 4.5 || d.y > H + 30) continue; }
    var dx = d.x - P.x, dy = d.y - (P.y - PH / 2);
    if (mag && alive && dx < 170 && dx > -40 && (!d.fly || d.age > 0.5)) { var dd = Math.hypot(dx, dy) || 1, sp = 420 * dt; d.x -= dx / dd * Math.min(sp, dd); d.y -= dy / dd * Math.min(sp, dd); d.fly = false; dx = d.x - P.x; dy = d.y - (P.y - PH / 2); }
    if (alive && (!d.fly || d.age > 0.5) && dx * dx + dy * dy < 15 * 15) { var n = G.pw.double > 0 ? 2 : 1; G.drops += n; G.total += n; G.gap = Math.min(maxGap(), G.gap + 2); homGain(2); pickSound(); continue; }
    keep.push(d);
  }
  drops = keep;
  // power-ups
  pups.forEach(function (p) {
    p.t += dt; var py = p.y + Math.sin(p.t * 4) * 4;
    if (alive && Math.abs(p.x - P.x) < 18 && Math.abs(py - (P.y - PH / 2)) < 26) { p.got = 1; takePup(p.k); }
  });
  for (var k in G.pw) if (G.pw[k] > 0) G.pw[k] -= dt;
  if (G.say) { G.say.t -= dt; if (G.say.t <= 0) G.say = null; }
  if (G.fx) { G.fx.forEach(function (f) { f.t -= dt; }); G.fx = G.fx.filter(function (f) { return f.t > 0; }); }
  if (G.hom && G.hom.b === 'medic' && alive) G.gap = Math.min(maxGap(), G.gap + 2.5 * dt);
  for (i = 0; i < parts.length; i++) { var q = parts[i]; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 360 * dt; q.life -= dt; }
  parts = parts.filter(function (q) { return q.life > 0; });
}
function takePup(k) {
  sfx.play('pup'); G.banner = 1.2; G.bannerTxt = PUPS[k].n; poof(P.x, P.y - 20, 14, ['#ffe36a', '#f1e7d0', '#ff2630']);
  if (k === 'shield') P.shield = 1;
  else if (k === 'cracker') G.gap = Math.min(maxGap() + 20, G.gap + 60);
  else G.pw[k] = pupLen(k);
}
function spawnPup() {
  var keys = Object.keys(PUPS), tot = 0; keys.forEach(function (k) { tot += PUPS[k].w; }); var r = Math.random() * tot, k0 = keys[0];
  for (var i = 0; i < keys.length; i++) { r -= PUPS[keys[i]].w; if (r <= 0) { k0 = keys[i]; break; } }
  if (k0 === 'shield' && P.shield) k0 = 'magnet';
  pups.push({ k: k0, x: G.cam + W + 30, y: GY - 46 - Math.random() * 30, t: 0 });
}
function stepRain(dt) {
  if (G.mode !== 'play' || P.state === 'dead') return;
  if (G.time > 16) { G.rainT -= dt; if (G.rainT <= 0) { G.rainT = Math.max(3.2, 8 - G.time / 25) + Math.random() * 3; rain.push({ x: P.x + G.v * 1.25, t: 0, s: Math.floor(Math.random() * NB.s.length) }); sfx.play('whoosh'); } }
  rain.forEach(function (r) { r.t += dt; if (r.t > 1.0 && !r.hit0) { r.hit0 = true; sfx.play('mland'); G.shake = Math.max(G.shake, 2); } if (r.t > 1.0 && r.t < 1.35 && P.state === 'normal' && Math.abs(P.x - r.x) < 13 && P.y > GY - 16) hurtPlayer(r.x); });
  rain = rain.filter(function (q) { return q.t < 1.6 && q.x > G.cam - 60; });
}
function update(dt) {
  G.t += dt; G.flashT -= dt; if (G.flashT <= 0) { G.flash = 0.16; G.flashT = 4 + Math.random() * 5; } if (G.flash > 0) G.flash -= dt;
  if (G.shake > 0) G.shake -= dt * 20; if (G.banner > 0) G.banner -= dt;
  if (G.mode === 'title' || G.mode === 'over') { G.cam += 46 * dt; P.x = G.cam + PXS; P.anim += dt * 6; P.onGround = true; P.y = GY; P.state = 'normal'; G.gap = 150; rumble(0); return; }
  if (G.mode !== 'play') return;
  var target = 150 + 140 * (1 - Math.exp(-G.time / 55));
  if (G.pw.rocket > 0) target *= 1.6;
  if (G.stumble > 0) { G.stumble -= dt; target *= 0.5; }
  var nv;
  if (P.state === 'dead') { G.v = Math.max(0, G.v - 380 * dt); nv = 210; }
  else { G.v += (target - G.v) * Math.min(1, dt * (G.stumble > 0 ? 7 : 2)); nv = (150 + 140 * (1 - Math.exp(-G.time / 55))) * (0.95 + 0.1 * (1 - Math.exp(-G.time / 60))); }
  G.gap += (G.v - nv) * dt;
  if (P.state !== 'dead') G.gap = Math.min(G.gap, maxGap() + (G.pw.rocket > 0 ? 40 : 0));
  if (P.state !== 'dead') { G.time += dt; G.pupT -= dt; if (G.pupT <= 0) { G.pupT = rnd(13, 19) * (1 - U('pups') * 0.08); spawnPup(); } }
  if (P.state !== 'dead' && G.gap <= CATCH) killPlayer(false);
  if (P.state === 'dead') G.gap = Math.max(-10, G.caught ? Math.min(G.gap, CATCH - 4) : G.gap);
  stepRain(dt);
  rumble(P.state === 'dead' ? 0.5 : Math.max(0, Math.min(1, 1 - (G.gap - CATCH) / 200)));
  updatePlayer(dt);
  P.x += G.v * dt; G.dist = P.x; G.cam = P.x - PXS;
  if (P.state !== 'dead') G.score = Math.floor(G.dist / 20) + G.total * 10 + G.kills * 25;
  if (G.dist / 20 >= G.nextMark) { G.banner = 1.3; G.bannerTxt = G.nextMark + 'M'; G.nextMark += 500; sfx.play('check'); }
  if (G.pw.rocket > 0 && Math.random() < 0.7) parts.push({ x: P.x - 10, y: P.y - 12 + rnd(-6, 6), vx: -120 - Math.random() * 60, vy: rnd(-20, 20), life: 0.35, c: pick(['#ffe36a', '#ff9a30', '#ff2630']) });
  updateWorld(dt); generate(); cull();
}
function endRun() {
  G.mode = 'over'; rumble(0);
  var m = Math.floor(G.dist / 20), newBest = G.score > SV.best, earned = bankOf();
  if (newBest) SV.best = G.score; if (m > SV.bestm) SV.bestm = m;
  SV.bank += earned; SV.total = (SV.total || 0) + earned; SV.runs = (SV.runs || 0) + 1; persist();
  G.last = { score: G.score, m: m, drops: G.total, earned: earned, kills: G.kills, newBest: newBest };
  music.play('mntitle'); setTimeout(overMenu, 500);
}

/* ---------- drawing ---------- */
function S() { return KIT.S; }
function layerOf(key, img, w, h, flip) {
  if (!ok(img)) return null;
  return KIT.layer('mn-' + key, w, h, function () { var c = KIT.ctx; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; if (flip) { c.save(); c.translate(w, 0); c.scale(-1, 1); } c.drawImage(img, 0, 0, w, h); if (flip) c.restore(); });
}
function put(L, x, y, alpha) { var c = KIT.ctx, s = S(); if (alpha !== undefined) c.globalAlpha = alpha; c.drawImage(L, Math.round(x * s) / s, Math.round(y * s) / s, L.lw, L.lh); c.globalAlpha = 1; }
function tile(L, L2, par, y, off, alpha) { if (!L) return; var w = L.lw, span = L2 ? w * 2 : w, x0 = -(((G.cam * par + off) % span) + span) % span; for (var x = x0, i = 0; x < W + w; x += w, i++) put(L2 && i % 2 ? L2 : L, x, y, alpha); }
function drawBack() {
  var c = KIT.ctx, sky = IMG.sky, sh = GY + 8;
  if (ok(sky)) { var sw = Math.round(sky.naturalWidth * sh / sky.naturalHeight); tile(layerOf('sky', sky, sw, sh), layerOf('skyM', sky, sw, sh, true), 0.04, 0, 0); }
  // the red moon
  c.save(); var mg = c.createRadialGradient(78, 50, 2, 78, 50, 24); mg.addColorStop(0, '#d8141f'); mg.addColorStop(0.8, '#8e0c14'); mg.addColorStop(1, '#5a070c');
  c.shadowColor = 'rgba(255,30,40,0.7)'; c.shadowBlur = 24; c.fillStyle = mg; c.beginPath(); c.arc(78, 50, 22, 0, 6.2832); c.fill(); c.restore();
  if (ok(IMG.clouds)) { var cl = layerOf('clouds', IMG.clouds, 653, 52); tile(cl, null, 0.08, 4, G.t * 5, 1); tile(cl, null, 0.15, 34, 260 + G.t * 9, 0.85); }
  if (G.flash > 0) R('rgba(255,50,60,' + (G.flash / 0.16 * 0.26).toFixed(3) + ')', 0, 0, W, GY);
  if (ok(IMG.skyline)) tile(layerOf('skyline', IMG.skyline, 266, 90), null, 0.25, GY - 90, 0);
  if (ok(IMG.city)) { var ch = 132, cw = Math.round(IMG.city.naturalWidth * ch / IMG.city.naturalHeight); tile(layerOf('city', IMG.city, cw, ch), null, 0.5, GY - ch + 2, 0); }
}
function brickRect(x, y, w, h, ledge) {
  var sx = Math.round(x - G.cam); if (sx > W || sx + w < 0) return;
  var c = KIT.ctx; c.save(); c.beginPath(); c.rect(sx, y, w, h); c.clip(); R('#1a0507', sx, y, w, h);
  var L = layerOf('bricks', IMG.bricks, 445, 40);
  if (L) { var i0 = Math.floor(x / 445), i1 = Math.ceil((x + w) / 445); for (var i = i0; i < i1; i++) for (var yy = y; yy < y + h; yy += 40) put(L, i * 445 - G.cam, yy); }
  c.restore(); R('#ff3a44', sx, y, w, 1); R('#9a0f18', sx, y + 1, w, 2); if (ledge) R('rgba(0,0,0,0.55)', sx, y + h, w, 3);
}
function drawGround() {
  var x = G.cam - 4, end = G.cam + W + 4, a = x, list = pits.slice().sort(function (p, q) { return p[0] - q[0]; });
  list.forEach(function (p) { if (p[1] < x || p[0] > end) return; if (p[0] > a) brickRect(a, GY, p[0] - a, H - GY + 4); a = Math.max(a, p[1]); });
  if (a < end) brickRect(a, GY, end - a, H - GY + 4);
  list.forEach(function (q) { var s0 = Math.round(q[0] - G.cam), s1 = Math.round(q[1] - G.cam); if (s1 < 0 || s0 > W) return; R('#000', s0, GY, s1 - s0, H - GY + 4); R('rgba(120,10,16,0.35)', s0, GY + 3, 1, H - GY); R('rgba(120,10,16,0.35)', s1 - 1, GY + 3, 1, H - GY); });
}
/* the meatnado: its sausage-flecked body sways in strips, sausages orbit it, and it spits sausages ahead of you */
function nadoGeom() { var sc = 0.8, w = NB.bw * sc; return { sc: sc, w: w, h: NB.bh * sc, cx: PXS + 14 - w / 2 - (G.gap - CATCH) * 0.37 }; }
function drawSaus(idx, x, y, ang, sc, alpha) {
  var f = NB.s[idx % NB.s.length], c = KIT.ctx; if (!ok(IMG.saus)) return; c.save(); c.imageSmoothingEnabled = true; c.translate(x, y); c.rotate(ang); if (alpha !== undefined) c.globalAlpha = alpha;
  c.drawImage(IMG.saus, f[0], f[1], f[2], f[3], -f[2] * sc / 2, -f[3] * sc / 2, f[2] * sc, f[3] * sc); c.restore();
}
function drawOrbit(front, g) {
  orbit.forEach(function (o) { var a = o.a + o.w * G.t, d = Math.sin(a); if ((d > 0) !== front) return; var hh = o.y / 200, rx = o.rx * 1.3 * (0.4 + 0.6 * hh);
    drawSaus(o.s, g.cx + Math.cos(a) * rx, GY - 6 - o.y + d * o.ry, Math.atan2(Math.cos(a) * o.ry, -Math.sin(a) * rx) + o.tilt, 0.55 + 0.18 * (d + 1) / 2); });
}
function drawNadoBody(g) {
  var img = IMG.nado, c = KIT.ctx; if (!ok(img)) return; var bottom = GY + 5, sway = Math.sin(G.t * 1.7) * 3;
  var gl = c.createRadialGradient(g.cx, bottom - g.h * 0.5, 10, g.cx, bottom - g.h * 0.5, g.h * 0.75); gl.addColorStop(0, 'rgba(120,10,20,0.42)'); gl.addColorStop(1, 'rgba(120,10,20,0)');
  c.fillStyle = gl; c.fillRect(g.cx - g.h, 0, g.h * 2, H);
  c.save(); c.imageSmoothingEnabled = true;
  for (var y = 0; y < NB.bh; y += 3) { var u = y / NB.bh, hs = Math.min(4, NB.bh - y), dx = Math.sin(G.t * 6 + y * 0.05) * (1 + 3.5 * u * u) + sway * u * u * 1.4; c.drawImage(img, 0, y, NB.bw, hs, g.cx - g.w / 2 + dx, bottom - g.h + y * g.sc, g.w, hs * g.sc); }
  c.restore();
}
function drawRain() {
  rain.forEach(function (r) { var sx = r.x - G.cam;
    if (r.t < 1.0) { var c = KIT.ctx, pulse = 0.35 + 0.35 * Math.abs(Math.sin(r.t * 14)); c.fillStyle = 'rgba(255,38,48,' + pulse.toFixed(2) + ')'; c.beginPath(); c.ellipse(sx, GY + 1, 14, 3.5, 0, 0, 6.2832); c.fill(); }
    if (r.t > 0.78 && r.t < 1.0) drawSaus(r.s, sx, GY - 190 + (r.t - 0.78) / 0.22 * 182, 1.35, 0.6); else if (r.t >= 1.0) drawSaus(r.s, sx, GY - 6, 0.12, 0.6, Math.max(0, 1 - (r.t - 1.2) / 0.4)); });
}
function drawWind() { var close = clamp(1 - (G.gap - CATCH) / 200, 0, 1), n = Math.floor(4 + close * 10), span = W + 90;
  for (var i = 0; i < n && i < wind.length; i++) { var w = wind[i], x = (((w.x - w.v * G.t) % span) + span) % span - 40; R('rgba(255,110,110,' + (0.1 + close * 0.3).toFixed(2) + ')', x, w.y, w.l, 1); } }
/* the runner */
function drawRunner(id, x, y, o) {
  o = o || {}; var dead = P.state === 'hurt' || P.state === 'dead', air = !P.onGround, f, fl = o.flash;
  if (id === 'cumhead') {
    if (dead) f = 'ch_hurt0'; else if (P.attackT > 0) f = 'ch_attack'; else if (air) f = P.jumpStartT > 0 ? 'ch_jump0' : P.vy < -70 ? 'ch_jump1' : P.vy < 70 ? 'ch_jump2' : 'ch_jump3'; else f = 'ch_rn' + (Math.floor(P.anim) % 8);
    spr(f, x, y + 1, { flash: fl, rot: dead && P.state === 'dead' ? P.deadT * 4 : 0 }); return;
  }
  if (id === 'hom') {
    var h = G.hom || { b: 'gloop', st: 2 }, base = 'h_' + h.b + '_' + HOMST[h.st] + '_', f2;
    if (dead) f2 = base + 'hurt'; else if (P.attackT > 0) f2 = base + 'atk'; else if (air) f2 = base + 'jump'; else f2 = base + 'run' + (Math.floor(P.anim * 0.7) % 4);
    spr(f2, x, y + 1, { flash: fl, rot: P.state === 'dead' ? P.deadT * 3 : 0 }); return;
  }
  if (id === 'amy' || id === 'tb') {
    var nm = 'npc_' + id, w = air || dead ? nm : nm + '_w' + (Math.floor(P.anim * 0.7) % 4);
    spr(w, x, y + 1, { sc: 1.35, flash: fl, rot: dead ? 0.5 : air ? -0.12 : 0 });
    if (id === 'amy') { var sw = P.attackT > 0 ? (0.2 - P.attackT) / 0.2 : 0; spr('mn_sausage', x + 10 + Math.sin(sw * 3) * 10, y - 30 + sw * 14, { anchor: 'c', rot: -1.2 + sw * 2.6 }); }
    return;
  }
  spr('greebo_s' + (air ? 1 : Math.floor(P.anim * 0.6) % 3), x, y - (!air && Math.floor(P.anim * 0.6) % 3 === 1 ? 1 : 0), { sc: 1.3, flash: fl, rot: dead ? 0.5 : air ? -0.15 : 0, flip: true });
}
function drawFoe(o) {
  var F = o.F, x = Math.round(o.x - G.cam); if (x < -60 || x > W + 60) return;
  var fr = F.s + (Math.floor(o.t * (F.air ? 8 : 6)) % 4); if (!KIT.has(fr)) fr = F.s + '0';
  spr(fr, x, F.air ? o.y + KIT.size(fr).h * o.sc / 2 : o.y + 1, { flip: !!F.flip, sc: o.sc });
}
var SHOTSPR = { pie: 'mn_pie', wave: 'mn_wave', acid: 'mn_acid', balloon: 'mn_bshot', bone: 'mn_bone' };
function draw() {
  var c = KIT.ctx; R('#070405', 0, 0, W, H);
  c.save(); if (G.shake > 0) c.translate(Math.round((Math.random() - 0.5) * G.shake), Math.round((Math.random() - 0.5) * G.shake));
  drawBack(); drawGround(); ledges.forEach(function (l) { brickRect(l[0], l[1], l[2], 10, true); });
  obs.forEach(function (o) { if (o.k !== 's') return; var ox = Math.round(o.x - G.cam); if (ox > W || ox + o.w < 0) return;
    for (var k = 0; k < o.w; k += 8) { c.fillStyle = '#2a0509'; c.beginPath(); c.moveTo(ox + k - 1, GY); c.lineTo(ox + k + 4, GY - 9); c.lineTo(ox + k + 9, GY); c.fill(); c.fillStyle = '#e0202a'; c.beginPath(); c.moveTo(ox + k, GY); c.lineTo(ox + k + 4, GY - 8); c.lineTo(ox + k + 8, GY); c.fill(); } });
  drops.forEach(function (d) { var bob = d.fly ? 0 : Math.sin(G.t * 4 + d.x * 0.05) * 1.5, x = d.x - G.cam; if (x < -12 || x > W + 12) return; if (d.fly && d.age > 3.2 && Math.floor(G.t * 14) % 2 === 0) return; spr('mn_drop', x, d.y + bob + 6); });
  pups.forEach(function (p) { var x = p.x - G.cam, y = p.y + Math.sin(p.t * 4) * 4; R('rgba(255,227,106,' + (0.12 + 0.08 * Math.sin(p.t * 8)).toFixed(2) + ')', x - 13, y - 13, 26, 26); spr('mn_p_' + p.k, x, y, { anchor: 'c' }); });
  obs.forEach(function (o) { if (o.k === 'f' && o.alive) drawFoe(o); });
  shots.forEach(function (s) { var x = s.x - G.cam;
    if (s.k === 'fire') { c.save(); c.translate(Math.round(x), Math.round(s.y)); c.shadowColor = '#ff2630'; c.shadowBlur = 10; c.fillStyle = '#ff3a44'; c.beginPath(); c.arc(-3, 0, 8, -1.05, 1.05); c.arc(-7, 0, 7, 1.0, -1.0, true); c.closePath(); c.fill(); c.restore(); }
    else if (s.k === 'swing') { var k2 = 1 - s.life / 0.16; c.save(); c.strokeStyle = s.col || '#ff9a80'; c.globalAlpha = 0.8 * (1 - k2); c.lineWidth = 3; c.beginPath(); c.arc(Math.round(x - s.w / 2), Math.round(s.y), s.w, -1.2, 1.0); c.stroke(); c.restore(); }
    else if (s.k === 'pill') spr('mn_pill', x, s.y, { anchor: 'c', rot: G.t * 14 });
    else if (s.k === 'coin') { var cr = s.r; R('#12040a', x - cr - 1, s.y - cr - 1, cr * 2 + 2, cr * 2 + 2); R('#ffc840', x - cr, s.y - cr, cr * 2, cr * 2); R('#fff09a', x - cr, s.y - cr, cr, 1); }
    else if (s.k === 'blob' || s.k === 'cres') { var rr = s.r; c.save(); c.fillStyle = '#12040a'; c.beginPath(); c.arc(x, s.y, rr + 1, 0, 6.28); c.fill(); c.fillStyle = s.col; c.beginPath(); if (s.k === 'cres') { c.arc(x, s.y, rr + 2, -1.3, 1.3); c.arc(x - 3, s.y, rr, 1.3, -1.3, true); } else c.arc(x, s.y, rr, 0, 6.28); c.fill(); c.restore(); }
    else if (s.k === 'ice') { R('#12040a', x - 9, s.y - 3, 18, 6); R(s.col, x - 8, s.y - 2, 16, 4); R('#ffffff', x - 2, s.y - 2, 9, 1); }
    else if (s.k === 'shock') { R(s.col, x - 6, s.y - 8 - Math.sin(G.t * 30) * 2, 4, 12); R('#f1e7d0', x - 1, s.y - 12, 3, 16); R(s.col, x + 3, s.y - 6, 4, 10); }
    else spr(SHOTSPR[s.k], x, s.y, { anchor: 'c', sc: s.k === 'pie' ? 1.4 : 1, rot: s.k === 'pie' ? Math.sin(G.t * 20) * 0.1 : 0 }); });
  (G.fx || []).forEach(function (f) { c.save(); c.strokeStyle = f.col; c.lineWidth = f.k === 'scout' ? 3 : 2; c.globalAlpha = Math.min(1, f.t * 10); c.beginPath(); c.moveTo(f.x0 - G.cam, f.y0);
    if (f.k === 'volt') { for (var q = 1; q <= 6; q++) c.lineTo(f.x0 + (f.x1 - f.x0) * q / 6 - G.cam, f.y0 + (f.y1 - f.y0) * q / 6 + (q < 6 ? rnd(-6, 6) : 0)); } else c.lineTo(f.x1 - G.cam, f.y1);
    c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.stroke(); c.restore(); });
  eshots.forEach(function (s) { var x = s.x - G.cam; if (s.k === 'shard') { R('#12040a', x - 2, s.y - 2, 5, 5); R('#ff2630', x - 1, s.y - 1, 3, 3); } else spr(SHOTSPR[s.k] || 'mn_bone', x, s.y, { anchor: 'c', rot: s.spin }); });
  drawRain();
  var g = nadoGeom(); drawOrbit(false, g); if (!(G.caught && P.state === 'dead')) drawNadoBody(g);
  var blink = P.inv > 0 && P.state !== 'dead' && Math.floor(G.t * 20) % 2 === 0;
  if (!blink && P.y < H + 60) {
    var px = P.x - G.cam;
    if (G.pw.rocket > 0) { R('rgba(255,154,48,0.25)', px - 22, P.y - 46, 44, 50); }
    drawRunner(G.mode === 'play' || G.mode === 'over' ? (G.char || me()).id : me().id, px, P.y);
    if (P.shield > 0) { c.save(); c.strokeStyle = 'rgba(154,223,255,' + (0.55 + 0.25 * Math.sin(G.t * 6)).toFixed(2) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(px, P.y - 20, 20, 26, 0, 0, 6.2832); c.stroke(); c.restore(); }
    if (G.pw.magnet > 0) { var mr = 22 + (G.t * 40) % 30; c.save(); c.strokeStyle = 'rgba(255,58,68,' + (0.5 * (1 - (mr - 22) / 30)).toFixed(2) + ')'; c.beginPath(); c.arc(px, P.y - 18, mr, 0, 6.2832); c.stroke(); c.restore(); }
  }
  if (G.say && G.mode === 'play') { var lines = KIT.wrap(G.say.s, 150, 6), bw = 0; lines.forEach(function (l) { bw = Math.max(bw, KIT.tw(l, 6)); }); var bx = clamp(P.x - G.cam - bw / 2, 4, W - bw - 12), by = P.y - 74 - lines.length * 9;
    R('#12040a', bx - 1, by - 1, bw + 12, lines.length * 9 + 8); R('#f1e7d0', bx, by, bw + 10, lines.length * 9 + 6); R('#f1e7d0', P.x - G.cam - 2, by + lines.length * 9 + 6, 5, 4);
    lines.forEach(function (l, i) { text(l, bx + 5, by + 4 + i * 9, { size: 6, col: '#12040a', shadow: false }); }); }
  if (G.caught && P.state === 'dead') drawNadoBody(g); drawOrbit(true, g); drawWind();
  parts.forEach(function (q) { R(q.c, q.x - G.cam, q.y, 2, 2); });
  c.restore();
  // vignette + danger glow
  var closeA = clamp(1 - (G.gap - CATCH) / 160, 0, 1);
  if (closeA > 0.02 && G.mode === 'play') { var og = c.createLinearGradient(0, 0, W * 0.7, 0); og.addColorStop(0, 'rgba(90,0,8,' + (closeA * 0.5).toFixed(3) + ')'); og.addColorStop(1, 'rgba(90,0,8,0)'); c.fillStyle = og; c.fillRect(0, 0, W, H); }
  if (G.mode === 'play') drawHud();
  if (G.banner > 0 && G.mode === 'play') text(G.bannerTxt, W / 2, 70, { align: 'center', size: 30, font: 'title', col: '#ff2630', alpha: Math.min(1, G.banner / 0.5), max: W - 60 });
}
function drawHud() {
  var fr = clamp(1 - (G.gap - CATCH) / (235 + headStart() - CATCH), 0, 1), danger = fr > 0.7 && Math.floor(G.t * 8) % 2 === 0;
  spr('mn_drop', 14, 18); text('x' + (G.drops < 10 ? '0' : '') + G.drops, 24, 8, { size: 8 });
  KIT.bar(10, 24, 72, 5, fr, danger ? '#ffffff' : '#ff2630', '#2a0509'); text('MEATNADO', 10, 33, { size: 6, col: fr > 0.7 ? '#ff2630' : '#a6968f' });
  text(String(G.score), 100, 8, { size: 8 }); text(Math.floor(G.dist / 20) + 'M', 100, 20, { size: 8, col: '#a6968f' });
  var x = 10; ['rocket', 'magnet', 'double', 'rapid'].forEach(function (k) { if (!(G.pw[k] > 0)) return; spr('mn_p_' + k, x + 9, 52, { anchor: 'c', sc: 0.8 }); KIT.bar(x + 1, 62, 16, 2, G.pw[k] / pupLen(k === 'rocket' && !PUPS.rocket.t ? 'rocket' : k), '#ffe36a'); x += 22; });
  if (P.shield > 0) { spr('mn_p_shield', x + 9, 52, { anchor: 'c', sc: 0.8 }); x += 22; }
  if (P.revive > 0) text('2ND WIND', 10, 70, { size: 6, col: '#ffe36a' });
  if (G.hom) { var h = G.hom, gf = h.st >= 2 ? 1 : (h.g - HOMNEED[h.st]) / (HOMNEED[h.st + 1] - HOMNEED[h.st]); text(HOMB[h.b][0].toUpperCase() + ' · ' + ['BABY', 'TEEN', 'ADULT'][h.st], 180, 8, { size: 6, col: HOMB[h.b][1] }); KIT.bar(180, 18, 80, 3, gf, HOMB[h.b][1]); }
}

/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; G.char = me(); music.play('mntitle'); resetPlayer(G.cam + PXS); pits = []; obs = []; drops = []; ledges = []; shots = []; eshots = []; pups = []; rain = [];
  KIT.menu({ cls: 'clear', logo: '../assets/meat-logo.webp', title: 'Meatnado Escape', sub: 'The meatnado is right behind you. Run, grab drops, spend them at Saba\'s.',
    items: [{ label: 'RUN', sub: 'As ' + me().n + (SV.best ? '  ·  best ' + SV.best + ' pts, ' + SV.bestm + 'm' : ''), cls: 'hot', def: true, fn: startRun },
      { label: 'RUNNERS', sub: CHARS.filter(function (c) { return SV.chars[c.id]; }).length + ' of ' + CHARS.length + ' unlocked', fn: function () { charsMenu(titleMenu); } },
      { label: "SABA'S", sub: 'Spend your drops: ' + SV.bank, fn: function () { shopMenu(titleMenu); } },
      { label: 'HOW TO PLAY', fn: helpMenu }] });
}
function charsMenu(back, focus) {
  KIT.menu({ title: 'Runners', sub: 'Drops in the bank: ' + SV.bank,
    items: CHARS.map(function (c) { var own = SV.chars[c.id], on = SV.ch === c.id;
      return { label: c.n.toUpperCase() + (on || own ? '' : '  ·  ' + c.cost + ' DROPS'), sub: c.d, cls: on ? 'done' : '', dis: !own && SV.bank < c.cost, def: focus === c.id,
        fn: function () { if (!own) { SV.bank -= c.cost; SV.chars[c.id] = 1; sfx.play('power'); } else sfx.play('select'); SV.ch = c.id; G.char = c; persist(); charsMenu(back, c.id); } }; })
      .concat([{ label: 'BACK', back: true, fn: back }]) });
}
function shopMenu(back, focus) {
  KIT.menu({ title: "Saba's Hitless Hemporium", sub: '"Hitless runs only. Take a look, my friend."  Drops in the bank: ' + SV.bank,
    items: UPS.map(function (u) { var l = U(u.id), full = l >= u.max, cost = upCost(u);
      return { label: u.n.toUpperCase() + '  ·  ' + l + '/' + u.max + (full ? '' : '  ·  ' + cost + ' DROPS'), sub: full ? u.d(l) : (l ? 'Now: ' + u.d(l) + ' Next: ' + u.d(l + 1) : u.d(1)), cls: full ? 'done' : '', dis: full || SV.bank < cost, def: focus === u.id,
        fn: function () { SV.bank -= cost; SV.ups[u.id] = l + 1; persist(); sfx.play('power'); var box = document.querySelector('#menu .mbox'), y = box ? box.scrollTop : 0; shopMenu(back, u.id); box = document.querySelector('#menu .mbox'); if (box) box.scrollTop = y; } }; })
      .concat([{ label: 'BACK', back: true, fn: back }]) });
}
function overMenu() {
  var r = G.last;
  KIT.menu({ cls: 'clear', title: 'Meatnadoed', sub: (G.hom ? HOMB[G.hom.b][0] + ' the Homunculus' : (G.char || me()).n) + '  ·  ' + r.m + 'm',
    html: '<p style="text-align:center;margin:0">Score <b>' + r.score + '</b>' + (r.newBest ? '  ·  <b>NEW BEST!</b>' : '  ·  best ' + SV.best) + '<br>Drops grabbed ' + r.drops + '  ·  foes ' + r.kills +
      '<br>Banked <b>+' + r.earned + '</b> drops  ·  in the bank: <b>' + SV.bank + '</b></p>',
    items: [{ label: 'RUN AGAIN', cls: 'hot', def: true, fn: startRun }, { label: "SABA'S", sub: 'Spend your drops: ' + SV.bank, fn: function () { shopMenu(overMenu); } },
      { label: 'RUNNERS', fn: function () { charsMenu(overMenu); } }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p>You run by yourself. <b>A</b> (or tap the screen) jumps, press it again in the air to double jump. Hold it for a higher jump. <b>B</b> fires (hold it to keep firing).</p>' +
    '<p>The <b>meatnado</b> is behind you. Every hit, pit and sausage it throws lets it catch up; drops and kills push it back. When it catches you, the run is over.</p>' +
    '<p>Jump on foes to squash them. Knights block shots from the front: jump on them. Steve balloons burst into bits when shot.</p>' +
    '<p><b>Power-ups</b> on the road: Magnet, Shield, Rocket, Double Drops, Rapid Fire and Cum Crackers (pushes it right back).</p>' +
    '<p>Every drop you grab goes in the bank. Spend them at <b>Saba\'s</b> on upgrades, and on new runners: Greebo, Amy, the Homunculus and TB.</p>',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] });
}
function pauseMenu() {
  if (G.mode !== 'play' || P.state === 'dead') return;
  KIT.menu({ cls: 'clear', title: 'Paused', sub: G.score + ' pts  ·  ' + Math.floor(G.dist / 20) + 'm', items: [{ label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, { label: 'START AGAIN', fn: startRun }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT TO TITLE', fn: function () { endRunQuiet(); titleMenu(); } }] });
}
function bankOf() { return Math.round(G.total * (1 + U('value') * 0.1) * (G.hom && G.hom.b === 'goldie' ? 1.3 : 1)); }
function endRunQuiet() { var earned = bankOf(); SV.bank += earned; persist(); }

/* ---------- music: Mega Drive style FM ---------- */
music.songs.mnrun = { bpm: 184, beats: 4, vol: 0.9, wet: 0.2, lead: 'fm', fmbass: 1, harm: 1, bass: 'pulse16', acc: 'arp16', drums: 'fast',
  chords: 'Em C D B Em C Am B Am Em F B Em C Am B',
  mel: 'e5 . e5 g5 . e5 b5 a5 | g5 e5 c5 e5 g5 - c6 b5 | a5 . a5 f#5 . d5 a5 g5 | f#5 d#5 b4 d#5 f#5 - b5 - | e6 . e6 d6 . b5 g5 e5 | c6 . c6 b5 . g5 e5 c5 | a5 c6 e6 c6 a5 e5 c5 e5 | d#5 f#5 b5 f#5 d#6 - b5 - | ' +
       'a5 - - b5 c6 - a5 - | g5 - - a5 b5 - g5 - | f5 - a5 - c6 - f6 - | d#6 - c6 - b5 - a5 - | e5 g5 b5 e6 g6 e6 b5 g5 | c6 e6 g6 e6 c6 g5 e5 c5 | a5 c6 e6 a6 e6 c6 a5 f#5 | b5 - d#6 - f#6 - b6 -' };
music.songs.mntitle = { bpm: 108, beats: 4, vol: 0.85, wet: 0.4, lead: 'fm', fmbass: 1, bass: 'drive', acc: 'stabs', drums: 'rock',
  chords: 'Em Em C B Em Em Am B',
  mel: 'e5 - - - g5 - f#5 e5 | b4 - - - - - . . | c5 - e5 - g5 - c6 - | b5 - - - d#5 - - - | e5 - g5 - b5 - e6 - | d6 - b5 - g5 - e5 - | a5 - c6 - e6 - a5 - | b5 - - - d#6 - - -' };

KIT.start({ w: W, h: H, update: update, draw: draw, onPause: pauseMenu, idleUpdate: function (dt) { if (G.mode === 'title' || G.mode === 'over') update(dt); },
  pad: { dpad: false, btns: [{ k: 'a', label: 'A', sub: 'JUMP', cls: 'big' }, { k: 'b', label: 'B', sub: 'FIRE' }] } });
titleMenu();
window.__mn = { G: G, get P() { return P; }, SV: SV, CHARS: CHARS, UPS: UPS, startRun: startRun, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, get obs() { return obs; }, get pups() { return pups; }, spawnPup: spawnPup, takePup: takePup, foe: foe, endRun: endRun };
