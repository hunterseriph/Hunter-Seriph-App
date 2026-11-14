/* ---------- going inside: every shop has a room with its keeper and its own goods; you can rob them. Houses, garages,
   Cum Motors, Load Estates, the Cream Wash, the police station and the hospital ---------- */
var ROOMS = { // look of each room: wall, floor, props, keeper, size
  club: { wall: 'velvet', floor: 'checker', keeper: 'lab', props: ['bar', 'sofa', 'jukebox', 'table', 'bed'], w: 14, d: 12, save: 1 },
  saba: { wall: 'wood', floor: 'plank', keeper: 'saba', props: ['counter', 'rack', 'rack', 'crate'] }, pulsar: { wall: 'velvet', floor: 'checker', keeper: 'pulsar', props: ['counter', 'speaker', 'speaker', 'deck'] },
  arcade: { wall: 'wallpaper', floor: 'checker', keeper: 'potbelly', props: ['counter', 'cabinet', 'cabinet', 'cabinet', 'cabinet'] }, sanct: { wall: 'tilefloor', floor: 'tilefloor', keeper: 'spermaid', props: ['counter', 'pool', 'shelf'] },
  t: { wall: 'velvet', floor: 'carpet', keeper: 't', props: ['counter', 'sofa', 'bed', 'lamp'] }, bonjo: { wall: 'velvet', floor: 'checker', keeper: 'bonjo', props: ['counter', 'rack', 'rack', 'mirror'] },
  tb: { wall: 'velvet', floor: 'plank', keeper: 'tb', props: ['bar', 'keg', 'keg', 'table', 'radio'] }, cafe: { wall: 'w_cafe', floor: 'checker', keeper: 'kaya', keeper2: 'elden', props: ['counter', 'table', 'table', 'coffee'] },
  greebo: { wall: 'tilefloor', floor: 'checker', keeper: 'greebo', props: ['counter', 'oven', 'shelf', 'table'] }, amy: { wall: 'w_brick', floor: 'tilefloor', keeper: 'amy', props: ['counter', 'pot', 'table', 'table'] },
  joff: { wall: 'w_brick', floor: 'tilefloor', keeper: 'joff', props: ['counter', 'oven', 'table', 'table'] }, beebs: { wall: 'wood', floor: 'plank', keeper: 'beeb', props: ['bar', 'keg', 'keg', 'table', 'darts'] },
  ali: { wall: 'w_cafe', floor: 'tilefloor', keeper: 'ali', props: ['counter', 'table', 'pot'] }, harold: { wall: 'wallpaper', floor: 'carpet', keeper: 'harold', props: ['counter', 'table', 'table', 'shelf'] },
  jessiah: { wall: 'stone', floor: 'plank', keeper: 'jessiah', props: ['counter', 'table', 'keg'] }, natty: { wall: 'darkstone', floor: 'carpet', keeper: 'natty', props: ['counter', 'shelf', 'candles'] },
  judge: { wall: 'stone', floor: 'tilefloor', keeper: 'judge', props: ['counter', 'candles', 'shelf'] }, fate: { wall: 'darkstone', floor: 'carpet', keeper: 'fate', props: ['table', 'candles', 'shelf'] },
  bates: { wall: 'wallpaper', floor: 'carpet', keeper: 'bates', props: ['counter', 'shelf', 'shelf', 'sofa'] }, motors: { wall: 'w_lab', floor: 'tilefloor', keeper: 'saba', props: ['counter'], w: 22, d: 16, cars: 1 },
  estate: { wall: 'w_down2', floor: 'carpet', keeper: 'bates', props: ['counter', 'shelf'] }, cops: { wall: 'concrete', floor: 'tilefloor', keeper: 'cop', props: ['counter', 'bars'] }, hosp: { wall: 'w_lab', floor: 'tilefloor', keeper: 'judge', props: ['counter', 'bed', 'bed'] },
  gym: { wall: 'concrete', floor: 'plank', keeper: 'strongman', props: ['counter', 'weights', 'weights'] }, bank: { wall: 'stone', floor: 'tilefloor', keeper: 'bates', props: ['counter', 'counter', 'vault'] }, tattoo: { wall: 'darkstone', floor: 'checker', keeper: 'natty', props: ['counter', 'chair'] },
  home: { wall: 'wallpaper', floor: 'carpet', keeper: null, props: ['bed', 'sofa', 'table', 'tv'], save: 1 }
};
/* what each place sells: [label, price, what it does] */
function goods(id) {
  var G0 = [];
  function heal(n, price, what, extra) { G0.push({ n: what, p: price, fn: function () { P.hp = Math.min(SV.maxHp, P.hp + n); if (extra) extra(); toast(what + ': +' + n + ' health'); } }); }
  switch (id) {
    case 'saba': WORDER.forEach(function (w) { var W0 = WPN[w]; if (!W0.cost || w === 'sausage') return; G0.push({ n: SV.weapons[w] ? W0.n + ' ammo (' + W0.ammoN + ')' : W0.n, p: SV.weapons[w] ? (W0.ammoCost || 0) : W0.cost, dis: SV.weapons[w] && !W0.ammo, fn: function () { giveWeapon(w, W0.ammoN || 0); P.wpn = w; SV.wpn = w; } }); });
      G0.push({ n: 'Box of Condoms (full armour)', p: 400, fn: function () { P.armour = 100; } }); break;
    case 'cafe': heal(40, 15, 'Cumpuccino', function () { G.boost = 30; }); heal(60, 25, 'Full Load Breakfast'); break;
    case 'greebo': heal(70, 30, "Greebo's Cream Pie"); G0.push({ n: 'Pie to go (throw it at someone)', p: 40, fn: function () { giveWeapon('pills', 0); giveWeapon('bag', 0); SV.ammo.bag = (SV.ammo.bag || 0) + 1; toast('A pie for later. It flies like a bag of shit.'); } }); break;
    case 'amy': heal(30, 10, 'Mild Willy Chilli'); heal(60, 20, 'Hot Willy Chilli'); G0.push({ n: 'Dynamite Willy Chilli', p: 35, fn: function () { P.hp = SV.maxHp; G.high = Math.max(G.high || 0, 0.4); toast('DYNAMITE. Your eyes are watering.'); } }); break;
    case 'joff': heal(50, 18, 'Pineapple Pizza Slice'); heal(100, 40, 'Whole Pineapple Pizza'); break;
    case 'ali': heal(35, 12, 'Garlic Nuggets'); heal(55, 18, 'Garlic Bread', function () { G.garlic = 60; toast('You stink of garlic. Zombies and Nattyboro keep away.'); }); break;
    case 'beebs': G0.push({ n: 'A pint of Load Ale', p: 6, fn: function () { G.drunk = Math.min(1, (G.drunk || 0) + 0.35); P.hp = Math.min(SV.maxHp, P.hp + 10); } }); G0.push({ n: 'Beeb\'s Viking Mead', p: 15, fn: function () { G.drunk = Math.min(1, (G.drunk || 0) + 0.7); } }); heal(40, 14, 'Pie and Mash'); break;
    case 'harold': G0.push({ n: 'Cup of Mad Tea', p: 20, fn: function () { G.high = Math.min(1, (G.high || 0) + 0.7); P.hp = Math.min(SV.maxHp, P.hp + 25); } }); G0.push({ n: 'Potion of Healing', p: 60, fn: function () { P.hp = SV.maxHp; } }); break;
    case 'tb': G0.push({ n: "TB's Silly Pill (take one)", p: 25, fn: function () { G.pilled = Math.min(1, (G.pilled || 0) + 0.8); say(G.keeper, pick(TBQUOTES2)); } }); G0.push({ n: 'Silly Pills to throw (5)', p: 250, fn: function () { giveWeapon('pills', 5); } }); G0.push({ n: 'A drink at the bar', p: 8, fn: function () { G.drunk = Math.min(1, (G.drunk || 0) + 0.4); } }); break;
    case 't': G0.push({ n: 'A Night In (full health, full armour)', p: 120, fn: function () { G.fade = 1.5; P.hp = SV.maxHp; P.armour = 100; G.time = (G.time + 3) % 24; toast('T lets you rest. You feel brand new.'); } }); break;
    case 'bonjo': G0.push({ n: 'A Disguise (lose one wanted star)', p: 300, dis: SV.wanted === 0, fn: function () { SV.wanted = Math.max(0, SV.wanted - 1); SV.heat = [0, 0.5, 1.6, 3.6, 6, 9][SV.wanted]; } }); G0.push({ n: 'Lucky Thong (+10 max health)', p: 1500, dis: SV.thong, fn: function () { SV.thong = 1; SV.maxHp += 10; } }); break;
    case 'pulsar': G0.push({ n: 'Just vibes (free)', p: 0, fn: function () { G.high = Math.min(1, (G.high || 0) + 0.3); toast('Just vibes, friend.'); } }); G0.push({ n: 'Signed PulsarOctopus mixtape', p: 200, dis: SV.mixtape, fn: function () { SV.mixtape = 1; toast('PulsarOctopus Beats FM plays extra tracks now.'); } }); break;
    case 'arcade': G0.push({ n: 'Play a cabinet ($5 a go)', p: 5, fn: function () { arcadeGame(); }, keep: 1 }); break;
    case 'sanct': G0.push({ n: "Spermaid's Blessing (+25 max health)", p: 2000 + (SV.blessings || 0) * 1500, dis: (SV.blessings || 0) >= 4, fn: function () { SV.blessings = (SV.blessings || 0) + 1; SV.maxHp += 25; P.hp = SV.maxHp; } }); heal(100, 50, 'A healing hug'); break;
    case 'jessiah': heal(60, 20, 'Roast Haunch'); heal(30, 8, 'Hard Bread'); break;
    case 'natty': G0.push({ n: 'Enchant your fists (+1 strength)', p: 800 + (SV.str || 0) * 600, dis: (SV.str || 0) >= 5, fn: function () { SV.str = (SV.str || 0) + 1; } }); break;
    case 'judge': G0.push({ n: 'Light: wipe your wanted level', p: 800, dis: SV.wanted === 0, fn: function () { SV.wanted = 0; SV.heat = 0; } }); G0.push({ n: 'Shadow: the police ignore you for 2 minutes', p: 1200, fn: function () { G.noCops = 120; SV.wanted = 0; SV.heat = 0; } }); break;
    case 'fate': [50, 200, 1000].forEach(function (b) { G0.push({ n: 'Draw a card for $' + b, p: b, fn: function () { var win = Math.random() < 0.46; if (win) { money(b * 2); toast('The Queen of Loads. You win $' + b * 2 + '.'); } else toast('The Fool. The deck was never yours.'); }, keep: 1 }); }); break;
    case 'bates': G0.push({ n: 'Clear your head (sober up)', p: 30, fn: function () { G.drunk = 0; G.high = 0; G.pilled = 0; } }); G0.push({ n: 'Ask about the mystery', p: 100, fn: function () { mysteryHint(); } }); break;
    case 'hosp': G0.push({ n: 'Patch me up', p: 50, fn: function () { P.hp = SV.maxHp; } }); break;
    case 'cops': G0.push({ n: 'Pay your fines (clear the wanted level)', p: 250 * Math.max(1, SV.wanted), dis: SV.wanted === 0, fn: function () { SV.wanted = 0; SV.heat = 0; } }); break;
    case 'gym': G0.push({ n: 'Train (+1 strength, takes 3 hours)', p: 100, dis: (SV.str || 0) >= 8, fn: function () { SV.str = (SV.str || 0) + 1; G.time = (G.time + 3) % 24; G.fade = 1.5; } }); break;
    case 'tattoo': ['Cumhead on the chest', 'HITLESS across the knuckles', 'A red moon on the back', 'Steve on the bum'].forEach(function (t, i) { G0.push({ n: t, p: 150, dis: SV.tattoo === i + 1, fn: function () { SV.tattoo = i + 1; toast('Inked. TB\'s boys nod at you now.'); } }); }); break;
    case 'bank': G0.push({ n: 'Look at the vault (a job for later)', p: 0, fn: function () { toast('Thick door. Somebody would need a plan.'); } }); break;
    case 'estate': HOUSES.forEach(function (h) { var own = SV.houses.indexOf(h.id) >= 0; G0.push({ n: h.name + (own ? ' (yours)' : ''), p: own ? 0 : h.cost, dis: own, fn: function () { SV.houses.push(h.id); SV.lastHouse = h.id; toast('You own ' + h.name + '. Save there, sleep there, park there.'); worldSetup(); } }); }); break;
    case 'motors': Object.keys(VT).forEach(function (k) { var t = VT[k]; if (!t.cost || t.cost < 1000 && t.cls !== 'board' && t.cls !== 'bike') return; G0.push({ n: t.n, p: t.cost, fn: function () { SV.cars.push({ type: k, col: 0 }); toast('Your ' + t.n + ' is waiting outside, and in your garages from now on.'); G.deliver = k; } }); }); break;
  }
  return G0;
}
function shopMenu(id, keeper) {
  var s = SHOPS[id], name = s ? s.name : 'Home', q = (CASTLINES[CAST[keeper] ? keeper : ''] || [])[0] || '', list = goods(id);
  function back() { KIT.closeMenu(); }
  KIT.menu({ title: name, sub: q ? '"' + q + '"' : null, items: list.map(function (g0) { var can = SV.money >= g0.p && !g0.dis; return { label: g0.n + (g0.p ? '  ·  $' + g0.p.toLocaleString('en-GB') : '  ·  FREE'), dis: !can, fn: function () { if (!g0.p) { g0.fn(); sfx.play('coin'); shopMenu(id, keeper); return; }
    KIT.confirm({ title: g0.n, price: g0.p, have: Math.floor(SV.money), unit: '$', yes: function () { money(-g0.p); g0.fn(); sfx.play('coin'); persist(); if (G.interior) shopMenu(id, keeper); else KIT.closeMenu(); }, no: function () { shopMenu(id, keeper); } }); } }; })
    .concat([{ label: 'LEAVE', back: true, def: !list.length, fn: back }]) });
}
/* ---------- the rooms ---------- */
function roomMesh(id) {
  var R0 = ROOMS[id] || ROOMS.home, w = R0.w || 10, d = R0.d || 9, h = 4, m = M(), wt = TL(R0.wall), ft = TL(R0.floor);
  m.quad([0, 0, 0], [0, 0, d], [w, 0, d], [w, 0, 0], uvR(w / 2, d / 2), ft, [0.5, 0.5, 0.5], [0, 1, 0]); m.quad([0, h, 0], [w, h, 0], [w, h, d], [0, h, d], uvR(w / 3, d / 3), TL('ceil'), [0.4, 0.4, 0.4], [0, -1, 0]);
  [[[0, 0, d], [w, 0, d], [0, 0, -1], w], [[w, 0, 0], [0, 0, 0], [0, 0, 1], w], [[w, 0, d], [w, 0, 0], [-1, 0, 0], d], [[0, 0, 0], [0, 0, d], [1, 0, 0], d]].forEach(function (f) { m.quad(f[0], f[1], [f[1][0], h, f[1][2]], [f[0][0], h, f[0][2]], uvR(f[3] / 3, h / 3), wt, lit(f[2]), f[2]); });
  m.quad([w / 2 - 0.8, 0, 0.02], [w / 2 + 0.8, 0, 0.02], [w / 2 + 0.8, 2.4, 0.02], [w / 2 - 0.8, 2.4, 0.02], UV1, TL('door'), [0.5, 0.5, 0.5], [0, 0, 1]);
  var boxes = [], cx = w / 2;
  (R0.props || []).forEach(function (pr, i) { var px = 1.5 + ((i * 3.3) % (w - 3)), pz = d - 2.5 - Math.floor(i / 3) * 3;
    if (pr === 'counter' || pr === 'bar') { boxT(m, cx - 3, 0, d - 3, cx + 3, 1.1, d - 2.2, { wall: pr === 'bar' ? 'wood' : 'plank', top: 'plank', u: 1.5, v: 1.1 }); boxes.push([cx - 3, d - 3, cx + 3, d - 2.2]); if (pr === 'bar') for (var b = 0; b < 6; b++) tub(m, [cx - 2.5 + b, 1.1, d - 2.6], [cx - 2.5 + b, 1.4, d - 2.6], 0.06, 0.04, ['#3a6a2a', '#8a3a1a', '#f1e7d0'][b % 3], 6, { cap: 1 }); }
    else if (pr === 'rack' || pr === 'shelf') { boxT(m, px - 1, 0, d - 0.6, px + 1, 2.4, d, { wall: 'shelf', top: 'wood', u: 2, v: 2.4 }); boxes.push([px - 1, d - 0.6, px + 1, d]); }
    else if (pr === 'table') { var tz = 2.5 + (i % 2) * 2.2; tub(m, [px, 0, tz], [px, 0.75, tz], 0.06, 0.06, '#2a1a10', 5); tub(m, [px, 0.75, tz], [px, 0.8, tz], 0.8, 0.8, '#5a3a20', 10, { cap: 1 }); boxes.push([px - 0.7, tz - 0.7, px + 0.7, tz + 0.7]); }
    else if (pr === 'sofa') { boxC(m, 0.3, 0, 1.6, 2.4, 0.5, 4.2, '#5a0a14'); boxC(m, 0.3, 0.5, 1.6, 0.8, 1.0, 4.2, '#5a0a14'); boxes.push([0.3, 1.6, 2.4, 4.2]); }
    else if (pr === 'bed') { boxC(m, w - 2.6, 0, 1.2, w - 0.3, 0.55, 3.4, '#f1e7d0'); boxC(m, w - 2.6, 0.55, 1.2, w - 0.3, 0.6, 2.6, '#c4121c'); boxes.push([w - 2.6, 1.2, w - 0.3, 3.4]); }
    else if (pr === 'keg') { tub(m, [px, 0, d - 1.2], [px, 1, d - 1.2], 0.45, 0.45, '#5a3a20', 8, { T: TL('keg'), cap: 1 }); boxes.push([px - 0.5, d - 1.7, px + 0.5, d - 0.7]); }
    else if (pr === 'cabinet') { var ax = 1.2 + i * 1.6; boxT(m, ax - 0.6, 0, 0.8 + (i % 2) * 3, ax + 0.6, 2.0, 1.6 + (i % 2) * 3, { wall: 'black', top: 'black' }); standQ(m, ax, 1.62 + (i % 2) * 3, 0, 1.0, 1.0, 1.7, TL(BILLS[i % BILLS.length]), 1.6, 0.6); boxes.push([ax - 0.6, 0.8 + (i % 2) * 3, ax + 0.6, 1.6 + (i % 2) * 3]); }
    else if (pr === 'speaker') { boxC(m, px - 0.6, 0, d - 1.4, px + 0.6, 2.2, d - 0.4, '#12040a'); tub(m, [px, 1.4, d - 1.4], [px, 1.4, d - 1.41], 0.4, 0.4, '#3a3a3e', 10, { cap: 1 }); boxes.push([px - 0.6, d - 1.4, px + 0.6, d - 0.4]); }
    else if (pr === 'pool') { tub(m, [cx, 0.02, 3.5], [cx, 0.1, 3.5], 1.8, 1.8, '#ecdcb0', 12, { T: TL('cream'), cap: 1 }); }
    else if (pr === 'oven') { boxT(m, px - 0.8, 0, d - 1.2, px + 0.8, 1.6, d - 0.2, { wall: 'steel', top: 'steel' }); boxes.push([px - 0.8, d - 1.2, px + 0.8, d - 0.2]); }
    else if (pr === 'weights') { tub(m, [px - 0.8, 0.9, 3], [px + 0.8, 0.9, 3], 0.03, 0.03, '#8a8a8a', 6); [-0.7, 0.7].forEach(function (s) { tub(m, [px + s, 0.9, 3], [px + s * 1.1, 0.9, 3], 0.25, 0.25, '#2a2a2e', 10, { cap: 1, cap0: 1 }); }); }
    else if (pr === 'candles') for (var c = 0; c < 6; c++) { var qx = 1 + c * 0.6, qz = d - 1; tub(m, [qx, 0.9, qz], [qx, 1.15, qz], 0.04, 0.04, '#f1e7d0', 5, { cap: 1 }); ell(m, qx, 1.22, qz, 0.03, 0.05, 0.03, '#ffd040', 5, 3); }
    else if (pr === 'vault') { tub(m, [w - 1.5, 1.6, d - 0.05], [w - 1.5, 1.6, d - 0.3], 1.4, 1.4, '#8a8a8e', 16, { cap: 1 }); }
    else if (pr === 'tv') { boxC(m, cx - 1.2, 0, 0.6, cx + 1.2, 0.6, 1.2, '#2a1a10'); boxC(m, cx - 1, 0.6, 0.8, cx + 1, 1.8, 0.9, '#12040a'); standQ(m, cx, 0.91, 0, 1.8, 0.7, 1.7, TL('bb_twitch'), 1.4, 0.6); }
    else if (pr === 'jukebox') { boxC(m, w - 1.6, 0, 0.6, w - 0.4, 1.8, 1.4, '#c4121c'); ell(m, w - 1, 1.8, 1, 0.6, 0.4, 0.4, '#ffe36a', 8, 4); }
  });
  return { mesh: m.upload(), w: w, d: d, boxes: boxes, R: R0 };
}
var IMESH = {};
function enterShop(id, homeId) {
  var s = SHOPS[id], door = doorOf(s ? s.b : HOUSES.filter(function (h) { return h.id === homeId; })[0].b), key = homeId ? 'home' : id, R0 = ROOMS[key] || ROOMS.home;
  if (!IMESH[key]) IMESH[key] = roomMesh(key); var RM = IMESH[key];
  G.fade = 1.2; G.interior = { id: id, home: homeId, key: key, RM: RM, door: door, exitX: door.x + Math.sin(door.a) * 1.2, exitZ: door.z + Math.cos(door.a) * 1.2, exitA: door.a };
  P.x = RM.w / 2; P.z = 2.6; P.y = 0; P.a = 0; P.vx = P.vz = 0; CAM.yaw = 0; CAM.pit = -0.42; CAM.x = P.x; CAM.z = 0.6; CAM.y = 2.6; CAM.snap = 1;
  G.indoorUses = [{ x: RM.w / 2, z: 0.5, r: 1.6, label: 'LEAVE', fn: leaveShop }];
  // the keeper behind the counter
  PEDS = PEDS.filter(function (p) { return !p.inside; });
  var kp = R0.keeper; if (kp) { var who = kp === 'cop' ? null : kp, k = makePed({ x: RM.w / 2, z: RM.d - 1.6, a: Math.PI, kind: kp === 'cop' ? 'cop' : 'cit', who: who, rig: kp === 'cop' ? RIGS.copM : who === 'strongman' ? RIGS.strongman : rigOf(who), state: 'idle', keep: 1 }); k.inside = id; k.god = 1; k.keeper = 1; G.keeper = k;
    k.pose = function (Q, p) { if (p.handsUp) poseHandsUp(Q); }; G.indoorUses.push({ x: RM.w / 2, z: RM.d - 3.6, r: 1.8, label: 'TALK TO ' + (CAST[kp] ? CAST[kp].name.toUpperCase() : 'THE KEEPER'), fn: function () { if (k.who) say(k, (CASTLINES[k.who] || [''])[0] || pick(TBQUOTES2)); shopMenu(id, kp); } }); }
  if (R0.keeper2) { var k2 = makePed({ x: RM.w / 2 + 2, z: RM.d - 1.6, a: Math.PI, who: R0.keeper2, rig: rigOf(R0.keeper2), state: 'idle', keep: 1 }); k2.inside = id; k2.god = 1; }
  if (R0.save || homeId) G.indoorUses.push({ x: RM.w - 1.5, z: 2.3, r: 1.8, label: 'SLEEP AND SAVE', fn: sleepSave });
  if (id === 'motors') G.indoorUses.push({ x: 3, z: 3, r: 2, label: 'BROWSE THE CARS', fn: function () { shopMenu('motors', 'saba'); } });
  if (typeof onEnterShop === 'function') onEnterShop(id);
  radioOff();
}
function leaveShop() { var I = G.interior; G.interior = null; G.fade = 1.0; PEDS = PEDS.filter(function (p) { return !p.inside; }); G.keeper = null; P.x = I.exitX; P.z = I.exitZ; P.y = standY(P.x, P.z, 999); P.a = I.exitA; CAM.yaw = I.exitA; CAM.x = P.x - Math.sin(P.a) * 4; CAM.z = P.z - Math.cos(P.a) * 4; CAM.y = P.y + 2;
  if (G.robbing) { G.robbing = null; } if (G.deliver) { var t = G.deliver; G.deliver = null; var v = makeVeh(t, P.x + Math.sin(P.a) * 5, P.z + Math.cos(P.a) * 5, P.a, { owned: 1, col: 0 }); v.keep = 1; toast('Your ' + VT[t].n + ' is outside.'); } }
function sleepSave() { G.fade = 2; var wake = G.time < 7 ? 8 : G.time > 20 ? 8 + 24 : G.time + 6; if (wake > 24) { G.day++; wake -= 24; } G.time = wake; P.hp = SV.maxHp; G.drunk = G.high = G.pilled = 0; SV.wanted = 0; SV.heat = 0; if (G.interior && G.interior.home) SV.lastHouse = G.interior.home; persist(); toast('Saved. You wake up feeling fresh.'); }
/* inside: the room's own floor and walls */
function interiorCollide(x, z, r) { var RM = G.interior.RM, px = 0, pz = 0; if (x - r < 0.3) px = 0.3 - (x - r); if (x + r > RM.w - 0.3) px = RM.w - 0.3 - (x + r); if (z - r < 0.3) pz = 0.3 - (z - r); if (z + r > RM.d - 0.3) pz = RM.d - 0.3 - (z + r);
  RM.boxes.forEach(function (b) { var cx = clamp(x + px, b[0], b[2]), cz = clamp(z + pz, b[1], b[3]), ex = x + px - cx, ez = z + pz - cz, d = Math.hypot(ex, ez); if (d < r && d > 0.0001) { px += ex / d * (r - d); pz += ez / d * (r - d); } }); return { x: px, z: pz, hit: px || pz ? 1 : null }; }
function drawInterior(look) { var I = G.interior; R3.scene({ fog: [0, 0, 0], fogR: [40, 90], amb: [0.55, 0.5, 0.5], lights: [{ x: I.RM.w / 2, y: 3.6, z: I.RM.d / 2, r: 14, c: [1, 0.8, 0.6], k: 1.1 }, { x: 2, y: 3, z: 2, r: 8, c: [1, 0.3, 0.3], k: 0.8 }], torch: { p: [0, -99, 0], d: [0, -1, 0], c: [0, 0, 0] }, t: G.t, hue: G.fxHue || 0, warp: G.fxWarp || 0 }); R3.draw(I.RM.mesh, ATT); }
/* ---------- robbing a shop: aim a gun at the keeper ---------- */
function stepRobbery(dt) {
  var I = G.interior, k = G.keeper; if (!I || !k || I.home || ['cops', 'hosp', 'estate', 'motors', 'club'].indexOf(I.id) >= 0) return;
  var aiming = P.aim && P.target === k && !WPN[P.wpn].melee;
  if (aiming) { if (!G.robbing) { G.robbing = { t: 0, take: 0 }; k.handsUp = 1; say(k, pick(['Alright, alright!', 'Not the face!', 'Take it, take it!', I.id === 'tb' ? 'you shoot real hard huh?' : 'Hitless runs only... please...'])); crime('rob', P.x, P.z); }
    G.robbing.t += dt; G.robbing.take = Math.floor(G.robbing.t * 90); G.counter = 'ROBBING: $' + G.robbing.take; if (G.robbing.t > 8) { money(G.robbing.take); SV.stats.robbed++; toast('You took $' + G.robbing.take + '. Now get out of here.'); G.robbing.done = 1; G.counter = null; k.handsUp = 0; SV.wanted = Math.max(SV.wanted, 2); SV.heat = Math.max(SV.heat, 1.6); P.aim = 0; P.target = null; G.robbing = { t: -999, take: 0, done: 1 }; } }
  else if (G.robbing && !G.robbing.done && G.robbing.t > 0) { k.handsUp = 0; G.counter = null; G.robbing = null; }
}
function onEnterShop(id) { G.robbing = null; }
/* the arcade: Potbelly's cabinet, stop the bar on the red */
function arcadeGame() { KIT.closeMenu(); G.arcade = { t: 0, x: 0, d: 1, round: 0, score: 0 }; }
function stepArcade(dt) { var A = G.arcade; if (!A) return; A.t += dt; A.x += A.d * dt * (0.8 + A.round * 0.35); if (A.x > 1) { A.x = 1; A.d = -1; } if (A.x < 0) { A.x = 0; A.d = 1; }
  if (KIT.pressed('a') || KIT.pressed('x') || (KIT.ptr && KIT.ptr.tap)) { var hit = Math.abs(A.x - 0.5) < 0.08; if (hit) { A.round++; A.score += 10 * A.round; sfx.play('coin'); if (A.round >= 6) { money(60); toast('High score! Potbelly pays out $60.'); G.arcade = null; } } else { toast('Game over. Score ' + A.score + (A.score ? ', $' + Math.floor(A.score / 4) : '')); money(Math.floor(A.score / 4)); G.arcade = null; sfx.play('lose'); } } }
function drawArcade() { var A = G.arcade; if (!A) return; var ctx = KIT.ctx, w = KIT.W * 0.6, x = KIT.W * 0.2, y = KIT.H * 0.42; ctx.fillStyle = '#070405'; ctx.fillRect(x - 10, y - 30, w + 20, 70); ctx.strokeStyle = '#c4121c'; ctx.strokeRect(x - 10, y - 30, w + 20, 70); tx("POTBELLY'S LOAD STOPPER · ROUND " + (A.round + 1), x, y - 24, { col: '#ffe36a', size: 8 });
  ctx.fillStyle = '#2a0a0e'; ctx.fillRect(x, y, w, 14); ctx.fillStyle = '#c4121c'; ctx.fillRect(x + w * 0.42, y, w * 0.16, 14); ctx.fillStyle = '#f1e7d0'; ctx.fillRect(x + w * A.x - 2, y - 3, 4, 20); tx('A / TAP ON THE RED', x, y + 22, { col: '#a6968f', size: 7 }); }
