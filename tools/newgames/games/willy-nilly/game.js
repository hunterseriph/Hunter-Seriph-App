/* =====================================================================================================
   WILLY NILLY: a diner dash across six places. It starts at Amy's Willy Chilli; beat day 5 of a place
   and the next one opens (and its owner joins, so you can play as them anywhere):
   Amy's Willy Chilli -> Kaya & Elden's Cum Café -> Greebo's Gourmet Goonery -> Uncle Beeb's Tavern
   -> Ali's Garlic Grub -> Joff's Pineapple Pizzaria. Twenty days each, every place runs its own way.
   Seat customers, take orders, make the food at the stations (some dishes go through two), serve,
   take the bill, clear the table. A treat stall cheers people up; party poppers cheer everyone up.
   Between days: Kitchen Time, a Cooking Mama style round of making the house dish.
   Tap things (or move the cursor and press A). The host remembers up to four jobs in a row.
   ===================================================================================================== */
var W = 480, H = 270;
var SAVE_KEY = 'wn-save';
var SV = KIT.load(SAVE_KEY, null) || {};
(function migrate() { // the first version only had Amy's
  if (SV.v === 2) return; var old = SV; SV = { v: 2, places: { amy: { unl: Math.min(20, old.unlocked || 1), best: old.best || {}, stars: old.stars || {} } }, open: { amy: 1 }, host: 'amy', coins: old.coins || 0, ups: old.ups || {}, items: { popper: 1 }, last: 'amy' };
})();
(function migrateUps() { // the shop used to sell one level of six things
  SV.ups = SV.ups || {}; SV.items = SV.items || {}; SV.decor = SV.decor || {}; if (SV.uv === 2) return;
  var OLD = { shoes: 2, ladle: 3, juke: 3, cloth: 2, apron: 1, sweets: 1 }; for (var k in SV.ups) if (SV.ups[k] === true || SV.ups[k] === 1) SV.ups[k] = OLD[k] || 1; SV.uv = 2;
})();
function persist() { KIT.save(SAVE_KEY, SV); }
var R = KIT.R, spr = KIT.spr, text = KIT.text;

/* everyone we have met so far turns up to eat */
var FOLK = [
  { s: 'npc_ali', n: 'Ali' }, { s: 'npc_beebs', n: 'Uncle Beeb', tip: 1.3 }, { s: 'npc_bonjo', n: 'Bonjo' }, { s: 'npc_elden', n: 'Elden' }, { s: 'npc_greebo', n: 'Greebo', eat: 0.5 },
  { s: 'npc_harold', n: 'Harold', eat: 1.5 }, { s: 'npc_jessiah', n: 'Jessiah', eat: 0.7 }, { s: 'npc_joff', n: 'Joff' }, { s: 'npc_judgement', n: 'Judgement' }, { s: 'npc_kaya', n: 'Kaya' },
  { s: 'npc_masterbates', n: 'Master Bates', read: 2, pat: 0.8 }, { s: 'npc_nattyboro', n: 'Nattyboro' }, { s: 'npc_potbelly', n: 'Potbelly', tip: 1.6 }, { s: 'npc_pulsar', n: 'PulsarOctopus', pat: 0.7 },
  { s: 'npc_saba', n: 'Saba', pat: 0.55 }, { s: 'npc_spermaid', n: 'Spermaid', pat: 0.7 }, { s: 'npc_stackedfate', n: 'Stacked Fate' }, { s: 'npc_t', n: 'T' }, { s: 'npc_tb', n: 'TB', pat: 1.5, tip: 2 },
  { s: 'ch_idle0', n: 'Cumhead', sc: 0.7 }, { s: 'steve0', n: 'Steve', sc: 0.75, pat: 0.8 }, { s: 'npc_amy', n: 'Amy' },
  { s: 'h_gloop_adult_idle0', n: 'Homunculus', pat: 1.3, tip: 0.7 }, { s: 'h_ember_adult_idle0', n: 'Homunculus', pat: 1.3, tip: 0.7 }, { s: 'h_blood_adult_idle0', n: 'Bloodmoon Homunculus', pat: 1.2, tip: 1.5 },
  { s: 'h_frost_adult_idle0', n: 'Homunculus', pat: 1.3, tip: 0.7 }, { s: 'h_goldie_adult_idle0', n: 'Goldie Homunculus', tip: 2.2 }
].filter(function (f) { return KIT.has(f.s); });

/* ---------- the food, the stations, the places ---------- */
var DISH = {
  c: { n: 'Classic Chilli', s: 'wn_bowlc', p: 12 }, d: { n: 'Dynamite Chilli', s: 'wn_bowld', p: 18 }, k: { n: 'Cum Crackers', s: 'wn_d_k', p: 6 }, p: { n: 'Cumpuccino', s: 'wn_d_p', p: 8 },
  r: { n: 'Croissant', s: 'wn_d_r', p: 9 }, q: { n: 'Cream Pie', s: 'wn_d_q', p: 16, mid: 'wn_d_qb' }, g: { n: "Gooner's Goulash", s: 'wn_d_g', p: 14 },
  a: { n: 'Ale', s: 'wn_d_a', p: 7 }, s: { n: "Beeb's Stew", s: 'wn_d_s', p: 13 }, n: { n: 'Garlic Nuggets', s: 'wn_d_n', p: 10 }, b: { n: 'Garlic Bread', s: 'wn_d_b', p: 9 },
  z: { n: 'Plain Pizza', s: 'wn_d_z', p: 15, mid: 'wn_d_zd' }, x: { n: 'Pineapple Pizza', s: 'wn_d_x', p: 17, mid: 'wn_d_xd', tipx: 1.5 }, t: { n: 'Treat', s: 'wn_d_t' }
};
var RECIPE = { c: ['potc'], d: ['potd'], k: ['jar'], p: ['mach'], r: ['grill'], q: ['oven', 'cream'], g: ['goul'], a: ['tap'], s: ['stew'], n: ['fry'], b: ['bread'], z: ['bench', 'pizza'], x: ['pine', 'pizza'], t: ['stall'] };
// type: cook (it cooks by itself and can burn), prep (the host works at it), grab (instant)
var KIND = {
  potc: { type: 'cook', cook: 5, burn: 14, spr: 'pot', n: 'CLASSIC POT' }, potd: { type: 'cook', cook: 7, burn: 14, spr: 'pot', n: 'DYNAMITE POT' },
  jar: { type: 'grab', cook: 0.3, spr: 'wn_st_jar', n: 'CRACKER JAR' }, mach: { type: 'cook', cook: 3, burn: 9, spr: 'wn_st_mach', n: 'CUMPUCCINO', bad: 'WENT COLD' },
  grill: { type: 'cook', cook: 5, burn: 10, spr: 'wn_st_grill', n: 'GRILL' }, oven: { type: 'cook', cook: 6, burn: 12, spr: 'wn_st_oven', n: 'OVEN' },
  cream: { type: 'prep', cook: 1.4, spr: 'wn_st_cream', n: 'CREAM' }, goul: { type: 'cook', cook: 7, burn: 14, spr: 'wn_st_goul', n: 'GOULASH' },
  tap: { type: 'prep', cook: 1.1, spr: 'wn_st_tap', n: 'ALE TAP' }, stew: { type: 'cook', cook: 6, burn: 15, spr: 'wn_st_stew', n: 'STEW' },
  fry: { type: 'cook', cook: 4, burn: 7, spr: 'wn_st_fry', n: 'FRYER' }, bread: { type: 'cook', cook: 6, burn: 11, spr: 'wn_st_ovenb', n: 'BREAD OVEN' },
  bench: { type: 'prep', cook: 0.7, spr: 'wn_st_bench', n: 'DOUGH' }, pine: { type: 'prep', cook: 0.8, spr: 'wn_st_pine', n: 'PINEAPPLE' }, pizza: { type: 'cook', cook: 5.5, burn: 12, spr: 'wn_st_oven', n: 'PIZZA OVEN' },
  stall: { type: 'grab', cook: 0.3, spr: 'wn_st_stall', n: 'TREATS' }, phone: { type: 'phone', spr: 'wn_st_phone', n: 'PHONE' }, shelf: { type: 'shelf', spr: 'wn_st_shelf', n: 'TAKEAWAY' }
};
var PLACES = [
  { id: 'amy', name: "Amy's Willy Chilli", short: 'WILLY CHILLI', host: 'npc_amy', who: 'Amy', quote: 'Mild, hot or dynamite?', mains: ['c', 'd'], sides: ['k', 'p'], st: ['potc', 'potd', 'jar', 'mach'],
    th: { wall: '#3a0a10', brick: '#4a0e16', hi: '#5a141c', fl: ['#1e0a0c', '#4a0e14'], sign: '#ff2630' }, song: 'wn', twist: 'Two pots: Classic and Dynamite. Crackers and Cumpuccinos on the side.', perk: 'Pots take longer to burn' },
  { id: 'cafe', name: "Kaya & Elden's Cum Café", short: 'CUM CAFE', host: 'npc_kaya', who: 'Kaya', helper: 'npc_elden', quote: "Welcome in! Kaya's on the coffee, Elden's on the grill.", mains: ['p', 'r'], combo: 0.65, sides: ['k'], st: ['mach', 'mach', 'grill', 'jar'],
    th: { wall: '#2a1a10', brick: '#3a2414', hi: '#4a3020', fl: ['#2a1c14', '#c8b898'], sign: '#ffe36a' }, song: 'wncafe', twist: 'Most people want a Cumpuccino AND something off the grill. Coffee goes cold fast.', perk: 'Walks faster' },
  { id: 'greebo', name: "Greebo's Gourmet Goonery", short: 'GOURMET GOONERY', host: 'npc_greebo', who: 'Greebo', quote: "Fresh cream pies. Don't ask what's in them.", mains: ['q', 'g'], sides: ['k'], st: ['oven', 'cream', 'goul', 'jar'],
    th: { wall: '#1e0a2a', brick: '#2a1238', hi: '#3a1a4a', fl: ['#140820', '#3a1a4a'], sign: '#c08aff' }, song: 'wngoon', twist: 'Cream pies bake in the oven first, then get their cream on the cream station.', perk: 'Carries one more' },
  { id: 'beebs', name: "Uncle Beeb's Tavern", short: "BEEB'S TAVERN", host: 'npc_beebs', who: 'Uncle Beeb', quote: "Sit down, lad. First one's always warm.", mains: ['s', 'a'], sides: ['a'], st: ['tap', 'stew', 'stew', 'jar'], refill: 0.6,
    th: { wall: '#2a1608', brick: '#3a200c', hi: '#4a2a14', fl: ['#3a2410', '#2a1a0a'], planks: 1, sign: '#ffc840' }, song: 'wnpub', twist: 'Drinkers order another round before they pay. Ale comes straight off the tap.', perk: 'Customers wait longer' },
  { id: 'ali', name: "Ali's Garlic Grub", short: 'GARLIC GRUB', host: 'npc_ali', who: 'Ali', quote: 'Nuggets? Garlic bread? Everything is better with garlic.', mains: ['n', 'b'], sides: ['k'], st: ['fry', 'fry', 'bread', 'jar'], extra: ['phone', 'shelf'], big: 1,
    th: { wall: '#142010', brick: '#1e2c16', hi: '#2a3a20', fl: ['#141c0e', '#3a4a24'], sign: '#9aff5a' }, song: 'wngarlic', twist: 'Big groups, and the phone rings with takeaways: answer it, cook it, leave the bag on the shelf.', perk: 'Bigger tips' },
  { id: 'joff', name: "Joff's Pineapple Pizzaria", short: 'PINEAPPLE PIZZARIA', host: 'npc_joff', who: 'Joff', quote: 'Pineapple belongs on pizza. Fight me.', mains: ['z', 'x'], sides: ['k'], st: ['bench', 'pine', 'pizza', 'pizza'],
    th: { wall: '#2a0a0a', brick: '#3a1010', hi: '#4a1818', fl: ['#f1e7d0', '#c4121c'], sign: '#ffe36a' }, song: 'wnpizza', twist: 'Top the dough (plain or pineapple), then bake it. Pineapple fans tip big.', perk: 'Everything cooks faster' }
];
var PLACE = {}; PLACES.forEach(function (p, i) { p.i = i; PLACE[p.id] = p; });
var PERK = { amy: { burn: 1.5 }, cafe: { speed: 1.15 }, greebo: { hands: 1 }, beebs: { pat: 0.88 }, ali: { tip: 1.2 }, joff: { cook: 0.88 } };
var NDAYS = 20, UNLOCK_AT = 5;
/* three shifts of 20 days at every place: beat day 20 for the night shift, night 20 for the nightmare shift */
var SHIFTS = [
  { n: 'Day Shift', w: 'Day', col: '#ffe36a', d: 'The normal day.' },
  { n: 'Night Shift', w: 'Night', col: '#9adfff', d: 'More tables, more customers, shorter tempers, food spoils faster.' },
  { n: 'Nightmare Shift', w: 'Nightmare', col: '#ff2630', d: 'Packed every night, no patience at all, and the kitchen is cursed.' }
];
var TOTAL = NDAYS * SHIFTS.length;
function shiftOf(i) { return Math.floor(i / NDAYS); }
function lvName(i) { return SHIFTS[shiftOf(i)].w + ' ' + (i % NDAYS + 1); }
function levelFor(pl, i) {
  var sh = shiftOf(i); i = i % NDAYS;
  var L = { t: Math.min(6, 2 + Math.floor(i / 3)), n: Math.round(6 + i * 1.0 + pl.i * 0.5), pair: Math.min(0.7, 0.2 + i * 0.025), side: Math.min(0.55, 0.05 + i * 0.03), dyn: 0.35 + Math.min(0.25, i * 0.015) };
  var gk = Math.max(0, 1 - i * 0.03 - pl.i * 0.02); L.gap = [Math.max(3.3, 7 * gk + 1.6), Math.max(5, 10 * gk + 2)];
  if (pl.id === 'amy') L.sides = i >= 6 ? ['k', 'p'] : i >= 2 ? ['k'] : []; else L.sides = pl.sides;
  L.sh = sh; L.d = i; L.k = i + sh * 8; L.patK = 1; L.burnK = 1;
  if (sh === 1) { L.t = Math.min(6, L.t + 1); L.n = Math.round(L.n * 1.25); L.gap = [L.gap[0] * 0.85, L.gap[1] * 0.85]; L.pair = Math.min(0.8, L.pair + 0.1); L.side = Math.min(0.65, L.side + 0.1); L.patK = 1.2; L.burnK = 0.85; if (pl.id === 'amy') L.sides = ['k', 'p']; }
  if (sh === 2) { L.t = 6; L.n = Math.round(L.n * 1.5); L.gap = [L.gap[0] * 0.72, L.gap[1] * 0.72]; L.pair = Math.min(0.9, L.pair + 0.2); L.side = Math.min(0.75, L.side + 0.2); L.dyn = Math.min(0.8, L.dyn + 0.15); L.patK = 1.45; L.burnK = 0.7; if (pl.id === 'amy') L.sides = ['k', 'p']; }
  var avg = pl.mains.reduce(function (a, d) { return a + DISH[d].p; }, 0) / pl.mains.length;
  L.goal = Math.round(L.n * (36 + avg * (1 + L.pair) * 0.75 + L.k * 0.4) / 10) * 10; L.expert = Math.round(L.goal * 1.35 / 10) * 10;
  return L;
}
/* ---------- the shop: upgrades with levels, decor for each place, and supplies for the next day ---------- */
var CATS = [{ id: 'kitchen', n: 'KITCHEN', d: 'Cooking, carrying and walking' }, { id: 'service', n: 'SERVICE', d: 'Patience, the queue and the dining room' },
  { id: 'money', n: 'MONEY', d: 'Bigger bills, bigger tips' }, { id: 'treats', n: 'TREATS & PARTIES', d: 'Sweets and party poppers' }];
function pc(n) { return Math.round(n) + '%'; }
var UPGRADES = [
  { id: 'shoes', cat: 'kitchen', name: 'Comfy Shoes', max: 5, cost: 250, d: function (l) { return 'Walk ' + pc(l * 10) + ' faster.'; } },
  { id: 'ladle', cat: 'kitchen', name: 'Big Ladle', max: 5, cost: 300, d: function (l) { return 'Pots, ovens, grills and fryers cook ' + pc(l * 8) + ' faster.'; } },
  { id: 'knives', cat: 'kitchen', name: 'Sharp Knives', max: 3, cost: 280, d: function (l) { return 'Hands-on jobs (cream, dough, toppings, the tap) go ' + pc(l * 15) + ' faster.'; } },
  { id: 'lamps', cat: 'kitchen', name: 'Heat Lamps', max: 3, cost: 260, d: function (l) { return 'Ready food stays good ' + pc(l * 30) + ' longer before it burns or goes cold.'; } },
  { id: 'blanket', cat: 'kitchen', name: 'Fire Blanket', max: 2, cost: 200, d: function (l) { return 'Burnt food costs ' + (10 - l * 5) + ' instead of 10.'; } },
  { id: 'apron', cat: 'kitchen', name: 'Big Apron Pockets', max: 2, cost: 600, grow: 2.5, d: function (l) { return 'Carry ' + l + ' more thing' + (l === 1 ? '' : 's') + '.'; } },
  { id: 'juke', cat: 'service', name: 'The Jukebox', max: 5, cost: 400, d: function (l) { return 'Customers lose patience ' + pc(l * 6) + ' slower.'; } },
  { id: 'sofa', cat: 'service', name: 'Comfy Waiting Sofa', max: 3, cost: 300, d: function (l) { return 'The queue loses patience ' + pc(l * 15) + ' slower.'; } },
  { id: 'menus', cat: 'service', name: 'Picture Menus', max: 3, cost: 250, d: function (l) { return 'Customers pick what they want ' + pc(l * 20) + ' faster.'; } },
  { id: 'forks', cat: 'service', name: 'Quick Forks', max: 3, cost: 300, d: function (l) { return 'Customers eat ' + pc(l * 12) + ' faster.'; } },
  { id: 'notepad', cat: 'service', name: 'Big Notepad', max: 2, cost: 450, grow: 2, d: function (l) { return 'Remember ' + (4 + l) + ' jobs in a row, not 4.'; } },
  { id: 'doorman', cat: 'service', name: 'Doorman', max: 2, cost: 500, grow: 2, d: function (l) { return 'The queue holds ' + (4 + l) + ' groups, not 4.'; } },
  { id: 'potboy', cat: 'service', name: 'Pot Boy', max: 3, cost: 700, d: function (l) { return 'Clears dirty tables by himself after ' + [0, 9, 6, 3][l] + ' seconds.'; } },
  { id: 'machine', cat: 'service', name: 'Answering Machine', max: 3, cost: 300, d: function (l) { return 'Takeaway calls ring ' + (l * 3) + ' s longer and takeaways wait ' + pc(l * 15) + ' longer.'; } },
  { id: 'cloth', cat: 'money', name: 'Fancy Tablecloths', max: 5, cost: 300, d: function (l) { return 'Every bill tips ' + (l * 2) + ' more.'; } },
  { id: 'jar', cat: 'money', name: 'Bigger Tip Jar', max: 5, cost: 350, d: function (l) { return 'Tips ' + pc(l * 10) + ' bigger.'; } },
  { id: 'prices', cat: 'money', name: 'Posh Menu Prints', max: 5, cost: 400, d: function (l) { return 'Food costs ' + pc(l * 5) + ' more, and they pay it.'; } },
  { id: 'chain', cat: 'money', name: 'Chain Gang', max: 3, cost: 350, d: function (l) { return 'Chain bonuses are ' + (5 + l * 3) + ' a step, not 5.'; } },
  { id: 'mama', cat: 'money', name: "Mama's Cookbook", max: 4, cost: 300, d: function (l) { return 'Kitchen Time pays ' + pc(l * 25) + ' more.'; } },
  { id: 'piggy', cat: 'money', name: 'Piggy Bank', max: 5, cost: 250, d: function (l) { return l * 15 + ' extra tips at the end of every day, pass or fail.'; } },
  { id: 'sweets', cat: 'treats', name: 'Better Sweets', max: 2, cost: 450, d: function (l) { return 'Treats give ' + (2 + l) + ' hearts, not 2.'; } },
  { id: 'tray', cat: 'treats', name: 'Treat Tray', max: 2, cost: 400, d: function (l) { return 'Grab ' + (1 + l) + ' treats from the stall at once (if your hands are free).'; } },
  { id: 'bang', cat: 'treats', name: 'Bigger Bang', max: 2, cost: 400, d: function (l) { return 'Party poppers give ' + (2 + l) + ' hearts to everyone, not 2.'; } },
  { id: 'subs', cat: 'treats', name: 'Popper Club', max: 3, cost: 500, d: function (l) { return pc(l * 20) + ' chance of a free party popper after every day you pass.'; } }
];
var UPG = {}; UPGRADES.forEach(function (u) { UPG[u.id] = u; });
function U(id) { return (SV.ups && SV.ups[id]) || 0; }
function upCost(u) { return Math.round(u.cost * Math.pow(u.grow || 1.6, U(u.id)) / 10) * 10; }
/* decor: three pieces for each place, bought in order; they show up in the room and only help there */
var DECOR = [
  { n: 'Wall Poster', d: 'Tips 10% bigger here.', cost: 500 },
  { n: 'Wall Lamps', d: 'Customers lose patience 10% slower here.', cost: 1000 },
  { n: 'The Showpiece', d: 'Everything cooks 10% faster here.', cost: 2000 }
];
var SHOWPIECE = { amy: 'The Golden Chilli', cafe: 'The Brass Coffee Urn', greebo: 'The Pie Tower', beebs: 'The Old Barrel', ali: 'The Giant Garlic', joff: 'The Pineapple Statue' };
function decorCost(pl, k) { return Math.round(DECOR[k].cost * (1 + pl.i * 0.4) / 10) * 10; }
function DC(k) { return G.pl && SV.decor && (SV.decor[G.pl.id] || 0) > k; }
/* supplies: used up on the next day you start */
var SUPPLIES = [
  { id: 'popper', n: 'Party Popper', d: 'Use one mid-day (Y or tap it): everyone cheers up.', cost: 150 },
  { id: 'popper5', n: 'Box of 5 Poppers', d: 'Five party poppers for the price of four.', cost: 600, give: { popper: 5 } },
  { id: 'espresso', n: 'Double Espresso', d: 'Your next day: walk 30% faster.', cost: 120, boost: 1 },
  { id: 'lucky', n: 'Lucky Coin', d: 'Your next day: tips 50% bigger.', cost: 200, boost: 1 },
  { id: 'candles', n: 'Scented Candles', d: 'Your next day: everyone loses patience 25% slower.', cost: 160, boost: 1 },
  { id: 'rush', n: 'Rush Hour Rota', d: 'Your next day: everything cooks 25% faster.', cost: 180, boost: 1 }
];
function B(k) { return G.boost && G.boost[k]; }
var POPPER_COST = 150;
var SLOTS = [[170, 176], [290, 176], [410, 176], [170, 244], [290, 244], [410, 244]];
var KX = [306, 350, 394, 438], EX = [84, 130];

var G = { mode: 'title', lv: 0 };
var host, tables, sts, groups, queue, arrivals, cursor, sel, pops, parts, chain, takeaways;
function perk(k) { return (PERK[SV.host] || {})[k]; }

function startLevel(pid, i, keep) {
  if (!keep || !G.boost) { G.boost = {}; SUPPLIES.forEach(function (it) { if (it.boost && SV.items[it.id] > 0) { SV.items[it.id]--; G.boost[it.id] = 1; } }); }
  var pl = PLACE[pid], L = levelFor(pl, i); G.pl = pl; G.lv = i; G.L = L; G.mode = 'intro'; G.t = 0; G.introT = 3; G.score = 0; G.served = 0; G.lost = 0; G.done = false; G.cheer = 0;
  SV.last = pid; persist();
  host = { x: 120, y: 120, face: 1, q: [], tickets: [], hands: [], walkT: 0, actT: 0, act: null };
  tables = []; for (var k = 0; k < L.t; k++) tables.push({ i: k, x: SLOTS[k][0], y: SLOTS[k][1], g: null, dirty: false });
  sts = []; pl.st.forEach(function (key, j) { sts.push(mkSt(key, KX[j], 94)); });
  (pl.extra || []).forEach(function (key, j) { sts.push(mkSt(key, EX[j], 102)); });
  sts.push(mkSt('stall', 252, 102));
  groups = []; queue = []; pops = []; parts = []; chain = { k: null, n: 0 }; takeaways = []; G.phoneT = 12;
  arrivals = []; var t = 1.5; for (k = 0; k < L.n; k++) { arrivals.push(t); t += rnd(L.gap[0], L.gap[1]); }
  cursor = { h: null }; sel = null; G.doorT = 0;
  music.play(pl.song);
}
function mkSt(key, x, y) { var K = KIND[key]; return { key: key, K: K, x: x, y: y, st: 'idle', t: 0, item: null, ring: 0 }; }
function speedHost() { return 130 * (1 + U('shoes') * 0.1) * (B('espresso') ? 1.3 : 1) * (perk('speed') || 1); }
function handsMax() { return 2 + U('apron') + (perk('hands') || 0); }
function placeCook() { return (perk('cook') || 1) * (DC(2) ? 0.9 : 1) * (B('rush') ? 0.75 : 1); }
function cookK() { return (1 - U('ladle') * 0.08) * placeCook(); }
function prepK() { return (1 - U('knives') * 0.15) * placeCook(); }
function tipK() { return (1 + U('jar') * 0.1) * (DC(0) ? 1.1 : 1) * (B('lucky') ? 1.5 : 1) * (perk('tip') || 1); }
function priceK() { return 1 + U('prices') * 0.05; }
function queueMax() { return 4 + U('doorman'); }
function floorRect() { var n = G.L.t; return { x0: 64, x1: n >= 3 ? 476 : 356, y0: 110, y1: n >= 4 ? 268 : 210 }; }
function done(it) { return it.step >= RECIPE[it.d].length; }

/* ---------- customers ---------- */
function newGroup() {
  var L = G.L, pl = G.pl, size = Math.random() < L.pair ? 2 : 1; if (pl.big && Math.random() < Math.min(0.8, 0.35 + G.L.k * 0.02)) size = 3 + (Math.random() < 0.4 ? 1 : 0);
  var who = [], used = {};
  for (var k = 0; k < size; k++) { var f, tries = 0; do { f = pick(FOLK); } while (used[f.n] && tries++ < 10); used[f.n] = 1; who.push(f); }
  var main = pl.id === 'amy' ? (Math.random() < L.dyn ? 'd' : 'c') : pl.id === 'joff' ? (Math.random() < 0.45 ? 'x' : 'z') : pick(pl.mains), order = [main];
  if (pl.combo && Math.random() < pl.combo) order.push(main === 'p' ? 'r' : 'p');
  else if (L.sides.length && Math.random() < L.side) order.push(pick(L.sides));
  if (pl.id === 'beebs' && main === 's' && Math.random() < 0.5) order = ['s', 'a'];
  var pat = who.reduce(function (a, f) { return Math.max(a, f.pat || 1); }, 0), tip = who.reduce(function (a, f) { return a + (f.tip || 1); }, 0) / who.length;
  var g = { who: who, order: order, need: [], st: 'queue', t: 0, hearts: 5, pat: pat * G.L.patK * (1 - U('juke') * 0.06) * (DC(1) ? 0.9 : 1) * (B('candles') ? 0.75 : 1) * (perk('pat') || 1), tip: tip, x: -20, y: 156, table: null, spent: 0,
    read: who.reduce(function (a, f) { return Math.max(a, f.read || 1); }, 0), eat: who.reduce(function (a, f) { return a + (f.eat || 1); }, 0) / who.length, bob: Math.random() * 6 };
  groups.push(g); queue.push(g); sfx.play('bell'); G.doorT = 0.8;
}
function queuePos(k) { var gap = Math.min(31, 96 / Math.max(1, queueMax() - 1)); return { x: 32 + (k % 2) * 4, y: 152 + k * gap }; }
var DRAIN = { queue: 0.11, order: 0.14, waitfood: 0.085, bill: 0.14 };
function updGroups(dt) {
  queue = queue.filter(function (g) { return g.st === 'queue'; });
  queue.forEach(function (g, k) { var p = queuePos(k); g.x += clamp(p.x - g.x, -90 * dt, 90 * dt); g.y += clamp(p.y - g.y, -90 * dt, 90 * dt); });
  groups.forEach(function (g) {
    g.t += dt; g.bob += dt; if (g.happy > 0) g.happy -= dt;
    if (DRAIN[g.st]) { g.hearts -= DRAIN[g.st] * g.pat * (g.st === 'queue' ? 1 - U('sofa') * 0.15 : 1) * dt; if (g.hearts <= 0) angry(g); }
    if (g.st === 'walk') { var tb = tables[g.table], dx = tb.x - g.x, dy = tb.y - 2 - g.y, d = Math.hypot(dx, dy), sp = 120 * dt; if (d <= sp) { g.x = tb.x; g.y = tb.y - 2; g.st = 'menu'; g.t = 0; } else { g.x += dx / d * sp; g.y += dy / d * sp; } }
    else if (g.st === 'menu' && g.t > 3 * g.read * (1 - U('menus') * 0.2)) { g.st = 'order'; g.t = 0; sfx.play('tick'); }
    else if (g.st === 'eat' && g.t > 6 * g.eat * (1 - U('forks') * 0.12)) {
      if (G.pl.refill && !g.refilled && Math.random() < G.pl.refill) { g.refilled = 1; g.st = 'order'; g.t = 0; g.order = ['a']; pop(g.x, g.y - 64, 'ANOTHER ROUND!', '#ffc840'); sfx.play('tick'); }
      else { g.st = 'bill'; g.t = 0; sfx.play('tick'); } }
    else if (g.st === 'leave') { g.x -= 140 * dt; g.y += (156 - g.y) * Math.min(1, dt * 2); if (g.x < -40) g.gone = true; }
  });
  groups = groups.filter(function (g) { return !g.gone; });
}
function angry(g) {
  if (g.st === 'leave') return;
  var tb = g.table !== null ? tables[g.table] : null; if (tb) { tb.g = null; if (g.spent) tb.dirty = true; }
  g.st = 'leave'; g.hearts = 0; G.lost++; G.score = Math.max(0, G.score - 20); chain = { k: null, n: 0 };
  pop(g.x, g.y - 60, 'STORMED OUT  -20', '#ff2630'); sfx.play('no');
}
function seat(g, tb) { g.st = 'walk'; g.table = tb.i; tb.g = g; g.hearts = Math.min(5, g.hearts + 1); score(10, 'seat', tb.x, tb.y - 60); sfx.play('select'); }
function cheer(g, n) { g.hearts = Math.min(5, g.hearts + n); g.happy = 1.2; for (var i = 0; i < 6; i++) parts.push({ x: g.x + rnd(-14, 14), y: g.y - 40, vx: rnd(-30, 30), vy: rnd(-90, -40), t: 0.8, c: i % 2 ? '#ff6a74' : '#ffe36a' }); }

/* ---------- the host's jobs ---------- */
function stationOf(job) {
  if (job.k === 'table') { var tb = tables[job.i]; return { x: tb.x, y: tb.y + 16 }; }
  if (job.k === 'queue') return { x: job.g.x + 26, y: job.g.y };
  var s = sts[job.i]; return { x: s.x, y: s.y + 26 };
}
function addJob(job) { if (host.q.length >= 4 + U('notepad')) { sfx.play('no'); pop(host.x, host.y - 50, 'TOO MANY JOBS', '#a6968f'); return; } host.q.push(job); sfx.play('blip'); }
function updHost(dt) {
  if (host.actT > 0) { host.actT -= dt; if (host.actT <= 0 && host.act) { var a = host.act; host.act = null; a(); } return; }
  var job = host.q[0]; if (!job) return;
  if (job.k === 'queue' && job.g.st !== 'queue') { host.q.shift(); return; }
  var st = stationOf(job), dx = st.x - host.x, dy = st.y - host.y, d = Math.hypot(dx, dy), sp = speedHost() * dt;
  if (d > sp) { host.x += dx / d * sp; host.y += dy / d * sp; if (Math.abs(dx) > 2) host.face = dx > 0 ? 1 : -1; host.walkT += dt; if (Math.floor(host.walkT * 6) !== Math.floor((host.walkT - dt) * 6)) sfx.play('step'); return; }
  host.x = st.x; host.y = st.y; host.q.shift(); doJob(job); if (host.actT <= 0) host.actT = 0.2;
}
function giveTreat(g) { var ti = host.hands.findIndex(function (h) { return h.d === 't'; }); if (ti < 0) return false; host.hands.splice(ti, 1); cheer(g, 2 + U('sweets')); pop(g.x, g.y - 64, 'A TREAT!  +HAPPY', '#ff9adf'); sfx.play('power'); return true; }
function doJob(job) {
  if (job.k === 'queue') { giveTreat(job.g); return; }
  if (job.k === 'table') {
    var tb = tables[job.i], g = tb.g;
    if (tb.dirty) { tb.dirty = false; score(5, 'clear', tb.x, tb.y - 50); sfx.play('splat'); return; }
    if (!g) return;
    if (g.st !== 'leave' && g.st !== 'walk' && host.hands.some(function (h) { return h.d === 't'; }) && (g.st !== 'waitfood' || !host.hands.some(function (h) { return done(h) && g.need.indexOf(h.d) >= 0; }))) { if (giveTreat(g)) return; }
    if (g.st === 'order') { g.order.forEach(function (d) { host.tickets.push(d); }); g.need = g.order.slice(); g.st = 'waitfood'; g.t = 0; g.hearts = Math.min(5, g.hearts + 0.5); score(10, 'order', tb.x, tb.y - 60); sfx.play('select'); return; }
    if (g.st === 'waitfood') {
      var gave = 0; for (var hi = host.hands.length - 1; hi >= 0; hi--) { var h = host.hands[hi], ni = g.need.indexOf(h.d); if (done(h) && ni >= 0) { g.need.splice(ni, 1); host.hands.splice(hi, 1); g.spent += DISH[h.d].p * g.who.length * (DISH[h.d].tipx || 1) * priceK(); gave++; } }
      if (!gave) { pop(tb.x, tb.y - 60, 'NOT THEIR ORDER', '#a6968f'); sfx.play('no'); return; }
      if (!g.need.length) { g.st = 'eat'; g.t = 0; g.hearts = Math.min(5, g.hearts + 1); score(20, 'serve', tb.x, tb.y - 60); G.served++; } else { pop(tb.x, tb.y - 60, 'AND THE REST?', '#ffe36a'); sfx.play('coin'); g.hearts = Math.min(5, g.hearts + 0.5); }
      sfx.play('coin'); return;
    }
    if (g.st === 'bill') {
      var tip = Math.round((Math.max(0, g.hearts) * 2 * g.tip + U('cloth') * 2) * tipK()), pay = Math.round(g.spent) + tip;
      score(pay, 'bill', tb.x, tb.y - 60, 'BILL $' + pay); sfx.play('coin');
      for (var k = 0; k < 6; k++) parts.push({ x: tb.x, y: tb.y - 30, vx: rnd(-60, 60), vy: rnd(-120, -40), t: 0.7, c: '#ffe36a' });
      g.st = 'leave'; g.table = null; tb.g = null; tb.dirty = true; return;
    }
    return;
  }
  var s = sts[job.i], K = s.K;
  if (K.type === 'phone') { if (s.ring > 0) { s.ring = 0; var d0 = pick(G.pl.mains); takeaways.push({ d: d0, hearts: 5 }); host.tickets.push(d0); pop(s.x, s.y - 50, 'TAKEAWAY: ' + DISH[d0].n.toUpperCase(), '#9aff5a'); sfx.play('select'); } else { pop(s.x, s.y - 50, 'NOBODY THERE', '#a6968f'); } return; }
  if (K.type === 'shelf') { var hit = false; takeaways.forEach(function (tk) { if (tk.out || hit) return; var hi2 = host.hands.findIndex(function (h) { return h.d === tk.d && done(h); }); if (hi2 >= 0) { host.hands.splice(hi2, 1); tk.out = 1; hit = true; var pay2 = Math.round(DISH[tk.d].p * 2 * priceK()) + Math.round(tk.hearts * 2 * tipK()); score(pay2, 'bag', s.x, s.y - 50, 'TAKEAWAY $' + pay2); sfx.play('coin'); G.served++; } }); if (!hit) { pop(s.x, s.y - 50, 'NO TAKEAWAY READY', '#a6968f'); sfx.play('no'); } takeaways = takeaways.filter(function (t) { return !t.out; }); return; }
  if (s.st === 'ready') { if (host.hands.length >= handsMax()) { pop(s.x, s.y - 50, 'HANDS FULL', '#a6968f'); sfx.play('no'); return; } host.hands.push(s.item); s.item = null; s.st = 'idle'; sfx.play('select'); return; }
  if (s.st === 'burnt') { var lost = s.item; s.st = 'idle'; s.item = null; host.tickets.push(lost.d); pop(s.x, s.y - 50, 'BINNED IT. MAKE IT AGAIN', '#ff9a30'); sfx.play('splat'); return; }
  if (s.st === 'cook') { pop(s.x, s.y - 50, 'NOT READY YET', '#a6968f'); return; }
  // idle: carry on something you are holding, or start a ticket here
  var it = null, from = -1;
  for (var h3 = 0; h3 < host.hands.length; h3++) { var hh = host.hands[h3]; if (!done(hh) && RECIPE[hh.d][hh.step] === s.key) { it = hh; from = h3; break; } }
  if (it) host.hands.splice(from, 1);
  else if (s.key === 'stall') it = { d: 't', step: 0 };
  else { var ti2 = host.tickets.findIndex(function (d) { return RECIPE[d][0] === s.key; }); if (ti2 >= 0) { it = { d: host.tickets[ti2], step: 0 }; host.tickets.splice(ti2, 1); } }
  if (!it) { var wants = host.tickets.length ? 'NOT FOR THIS ONE' : 'NO ORDER FOR THIS'; pop(s.x, s.y - 50, wants, '#a6968f'); sfx.play('no'); return; }
  if (K.type === 'grab' || K.type === 'prep') {
    if ((K.type === 'grab' || from < 0) && host.hands.length >= handsMax()) { if (from < 0 && it.d !== 't') host.tickets.push(it.d); else if (from >= 0) host.hands.push(it); pop(s.x, s.y - 50, 'HANDS FULL', '#a6968f'); sfx.play('no'); return; }
    host.actT = K.cook * prepK(); s.st = 'busy'; sfx.play(K.type === 'grab' ? 'select' : 'pour');
    host.act = function () { it.step++; host.hands.push(it); s.st = 'idle'; if (it.d === 't') for (var tr = 0; tr < U('tray') && host.hands.length < handsMax(); tr++) host.hands.push({ d: 't', step: 1 }); }; return;
  }
  s.st = 'cook'; s.t = 0; s.item = it; s.need = K.cook * cookK(); sfx.play('pour');
}
function updSts(dt) {
  sts.forEach(function (s) {
    s.t += dt;
    if (s.st === 'cook') { if (Math.random() < 0.15) sfx.play('cook'); if (s.t >= s.need) { s.st = 'ready'; s.t = 0; s.item.step++; sfx.play('bell'); } }
    else if (s.st === 'ready' && s.K.burn && s.t > s.K.burn * G.L.burnK * (perk('burn') || 1) * (1 + U('lamps') * 0.3)) { var bp = 10 - U('blanket') * 5; s.st = 'burnt'; s.t = 0; G.score = Math.max(0, G.score - bp); pop(s.x, s.y - 50, (s.K.bad || 'BURNT!') + (bp ? '  -' + bp : ''), '#ff2630'); sfx.play('no'); }
    if (s.K.type === 'phone') { if (s.ring > 0) { s.ring -= dt; if (Math.floor(s.ring * 4) !== Math.floor((s.ring + dt) * 4)) sfx.play('tick'); if (s.ring <= 0) { G.lost++; G.score = Math.max(0, G.score - 10); pop(s.x, s.y - 50, 'MISSED A CALL  -10', '#ff2630'); } }
      else if (arrivals.length) { G.phoneT -= dt; if (G.phoneT <= 0) { G.phoneT = Math.max(8, rnd(16, 26) - G.L.k * 0.4); s.ring = 9 + U('machine') * 3; sfx.play('bell'); } } }
  });
  takeaways.forEach(function (tk) { tk.hearts -= 0.06 * dt * G.L.patK * (perk('pat') || 1) * (1 - U('machine') * 0.15); if (tk.hearts <= 0 && !tk.out) { tk.out = 1; G.lost++; G.score = Math.max(0, G.score - 20); var sh = sts.filter(function (s) { return s.key === 'shelf'; })[0]; pop(sh.x, sh.y - 50, 'TAKEAWAY CANCELLED  -20', '#ff2630'); var ti = host.tickets.indexOf(tk.d); if (ti >= 0) host.tickets.splice(ti, 1); } });
  takeaways = takeaways.filter(function (t) { return !t.out; });
}
function score(n, kind, x, y, label) {
  if (chain.k === kind) chain.n++; else chain = { k: kind, n: 1 };
  var bonus = chain.n >= 2 ? (5 + U('chain') * 3) * (chain.n - 1) : 0; G.score += n + bonus;
  pop(x, y, (label || '+' + n) + (bonus ? '  CHAIN x' + chain.n : ''), bonus ? '#ffe36a' : '#f1e7d0');
}
function pop(x, y, t, c) { pops.push({ x: x, y: y, t: t, c: c, life: 1.4 }); }
function usePopper() {
  if (!SV.items.popper || G.mode !== 'play') { sfx.play('no'); return; } SV.items.popper--; persist(); sfx.play('power'); KIT.flash(0.15); G.cheer = 1.5;
  groups.forEach(function (g) { if (g.st !== 'leave') cheer(g, 2 + U('bang')); }); takeaways.forEach(function (t) { t.hearts = Math.min(5, t.hearts + 2 + U('bang')); });
  for (var i = 0; i < 60; i++) parts.push({ x: rnd(60, W - 20), y: rnd(-20, 40), vx: rnd(-40, 40), vy: rnd(20, 120), t: 1.6, c: ['#ff2630', '#ffe36a', '#9adfff', '#9aff5a', '#ff9adf'][i % 5] });
}

/* ---------- what a tap or the cursor can pick ---------- */
function hotspots() {
  var hs = [];
  queue.forEach(function (g) { hs.push({ k: 'group', g: g, x: g.x, y: g.y - 20, r: [g.x - 18, g.y - 46, 36, 48] }); });
  tables.forEach(function (tb) { hs.push({ k: 'table', i: tb.i, x: tb.x, y: tb.y - 18, r: [tb.x - 50, tb.y - 56, 100, 66] }); });
  sts.forEach(function (s, j) { hs.push({ k: 'st', i: j, x: s.x, y: s.y - 18, r: [s.x - 22, s.y - 46, 44, 58] }); });
  hs.push({ k: 'popper', x: 30, y: 52, r: [4, 40, 54, 24] });
  return hs;
}
function same(a, b) { return a && b && a.k === b.k && (a.k === 'group' ? a.g === b.g : a.i === b.i); }
function activate(h) {
  if (!h) return;
  if (h.k === 'popper') { usePopper(); return; }
  if (h.k === 'group') { if (host.hands.some(function (x) { return x.d === 't'; })) { addJob({ k: 'queue', g: h.g }); return; } sel = sel === h.g ? null : h.g; sfx.play('blip'); return; }
  if (h.k === 'table') {
    var tb = tables[h.i];
    if (!tb.g && !tb.dirty) { var g = sel || queue[0]; if (g && g.st === 'queue') { seat(g, tb); sel = null; return; } }
    if (sel) sel = null;
    addJob({ k: 'table', i: h.i }); return;
  }
  if (h.k === 'st') addJob({ k: 'st', i: h.i });
}
function inputs() {
  var hs = hotspots();
  if (KIT.ptr.tap) { var p = KIT.ptr, hit = null; hs.forEach(function (h) { if (p.x >= h.r[0] && p.x <= h.r[0] + h.r[2] && p.y >= h.r[1] && p.y <= h.r[1] + h.r[3]) hit = h; }); if (hit) { cursor.h = hit; activate(hit); } G.usedPtr = true; }
  var dir = KIT.pressed('left') ? [-1, 0] : KIT.pressed('right') ? [1, 0] : KIT.pressed('up') ? [0, -1] : KIT.pressed('down') ? [0, 1] : null;
  if (dir) {
    G.usedPtr = false; var cur = cursor.h && hs.filter(function (h) { return same(h, cursor.h); })[0];
    if (!cur) cursor.h = hs.filter(function (h) { return h.k === 'table'; })[0];
    else { var best = null, bd = 1e9; hs.forEach(function (h) { if (h === cur) return; var dx = h.x - cur.x, dy = h.y - cur.y, along = dx * dir[0] + dy * dir[1], across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]); if (along <= 4) return; var s = along + across * 2; if (s < bd) { bd = s; best = h; } }); if (best) { cursor.h = best; sfx.play('tick'); } }
  }
  if (cursor.h) { var still = hs.filter(function (h) { return same(h, cursor.h); })[0]; cursor.h = still || null; }
  if (KIT.pressed('a')) { if (!cursor.h) cursor.h = hs.filter(function (h) { return h.k === 'table'; })[0]; else activate(cursor.h); }
  if (KIT.pressed('b')) { if (sel) { sel = null; sfx.play('back'); } else if (host.q.length) { host.q.pop(); sfx.play('back'); } }
  if (KIT.pressed('y')) usePopper();
}

/* ---------- the loop ---------- */
function update(dt) {
  if (G.mode === 'mama') { mamaUpdate(dt); return; }
  if (G.mode === 'intro') { G.introT -= dt; if (G.introT <= 0 || KIT.pressed('a') || KIT.ptr.tap) G.mode = 'play'; return; }
  if (G.mode !== 'play') return;
  G.t += dt; if (G.doorT > 0) G.doorT -= dt; if (G.cheer > 0) G.cheer -= dt;
  while (arrivals.length && G.t >= arrivals[0]) { arrivals.shift(); if (queue.length < queueMax()) newGroup(); else { G.lost++; pop(40, 140, 'THE QUEUE WAS FULL', '#ff2630'); } }
  inputs(); updHost(dt); updGroups(dt); updSts(dt); potBoy(dt);
  pops.forEach(function (p) { p.life -= dt; p.y -= 18 * dt; }); pops = pops.filter(function (p) { return p.life > 0; });
  parts.forEach(function (p) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; }); parts = parts.filter(function (p) { return p.t > 0; });
  var ringing = sts.some(function (s) { return s.ring > 0; });
  if (!arrivals.length && !groups.length && !takeaways.length && !ringing && !G.done) { G.done = true; G.endT = 0.9; }
  if (G.done && G.endT > 0) { G.endT -= dt; if (G.endT <= 0) endLevel(); }
}
function potBoy(dt) {
  var lv = U('potboy'); if (!lv) return;
  tables.forEach(function (tb) { if (!tb.dirty) { tb.dt = 0; return; } tb.dt = (tb.dt || 0) + dt; if (tb.dt > [0, 9, 6, 3][lv]) { tb.dirty = false; tb.dt = 0; G.score += 5; pop(tb.x, tb.y - 50, 'POT BOY CLEARED IT  +5', '#9adfff'); sfx.play('splat'); } });
}
function endLevel() {
  var L = G.L, st = G.score >= L.expert ? 3 : G.score >= L.goal ? 2 : G.score >= L.goal * 0.6 ? 1 : 0, pass = G.score >= L.goal, pd = SV.places[G.pl.id];
  SV.coins += G.score; if ((pd.best[G.lv] || 0) < G.score) pd.best[G.lv] = G.score; if ((pd.stars[G.lv] || 0) < st && pass) pd.stars[G.lv] = st;
  if (pass && pd.unl < G.lv + 2) pd.unl = Math.min(TOTAL, G.lv + 2);
  var nxt = PLACES[G.pl.i + 1], newPlace = null; if (pass && G.lv + 1 >= UNLOCK_AT && nxt && !SV.open[nxt.id]) { SV.open[nxt.id] = 1; SV.places[nxt.id] = SV.places[nxt.id] || { unl: 1, best: {}, stars: {} }; newPlace = nxt; }
  var piggy = U('piggy') * 15; SV.coins += piggy; var club = pass && Math.random() < U('subs') * 0.2; if (club) SV.items.popper = (SV.items.popper || 0) + 1;
  persist(); sfx.play(pass ? 'win' : 'lose');
  G.result = { st: st, pass: pass, newPlace: newPlace, bonus: 0, piggy: piggy, club: club };
  if (pass) startMama(); else showResult();
}
function showResult() {
  var r = G.result, L = G.L, last = G.lv === TOTAL - 1, shEnd = r.pass && G.lv % NDAYS === NDAYS - 1 && !last, nsh = SHIFTS[shiftOf(G.lv) + 1]; G.mode = 'over'; music.play('wntitle');
  KIT.menu({ title: r.pass ? (r.st === 3 ? 'Expert Service!' : 'Day Done!') : 'Not Enough Tips', sub: G.pl.name + '  ·  ' + lvName(G.lv) + '  ·  ' + L.t + ' tables',
    html: '<p style="text-align:center;margin:0">Score <b>' + G.score + '</b>  ·  Goal ' + L.goal + '  ·  Expert ' + L.expert + '<br>Served ' + G.served + '  ·  Stormed out ' + G.lost + '<br>' + starStr(r.pass ? r.st : 0) +
      (r.bonus ? '<br>Kitchen Time: <b>' + r.mama + '</b>  +' + r.bonus + ' tips' : '') + (r.piggy ? '<br>Piggy Bank: +' + r.piggy + ' tips' : '') + (r.club ? '<br>Popper Club sent you a free party popper!' : '') + '<br>Tips in the jar: <b>' + SV.coins + '</b></p>' +
      (r.newPlace ? '<p style="text-align:center;color:#ffe36a">NEW PLACE: <b>' + r.newPlace.name + '</b> is open, and ' + r.newPlace.who + ' can work any kitchen now.</p>' : '') +
      (shEnd ? '<p style="text-align:center;color:' + nsh.col + '">' + nsh.n.toUpperCase() + ' IS OPEN at ' + G.pl.name + '. ' + nsh.d + '</p>' : '') +
      (r.pass && last ? '<p style="text-align:center;color:#ffe36a">' + G.pl.name + ' survived the Nightmare Shift. The busiest place in town, day and night. "' + G.pl.quote + '"</p>' : ''),
    items: [r.pass && !last ? { label: shEnd ? 'START THE ' + nsh.n.toUpperCase() : 'NEXT DAY', sub: lvName(G.lv + 1), fn: function () { KIT.closeMenu(); startLevel(G.pl.id, G.lv + 1); }, cls: 'hot', def: true } : null,
      r.newPlace ? { label: 'GO TO ' + r.newPlace.short, fn: function () { KIT.closeMenu(); startLevel(r.newPlace.id, 0); } } : null,
      { label: 'TRY AGAIN', fn: function () { KIT.closeMenu(); startLevel(G.pl.id, G.lv); }, def: !r.pass },
      { label: 'SHOP', sub: 'Upgrades and party poppers', fn: function () { upgradesMenu(showResult); } }, { label: 'PLACES', fn: placesMenu, back: true }].filter(Boolean) });
}
function starStr(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '<b>★</b>' : '<span style="color:#4a1a1c">★</span>'; return '<span style="font-size:22px;letter-spacing:6px">' + s + '</span>'; }

/* ---------- Kitchen Time: make the house dish between days, Cooking Mama style ---------- */
/* Kitchen Time: every step is a tap (A, or touch anywhere): no swiping, no holding */
var MAMA = {
  amy: { dish: 'Dynamite Chilli', show: 'wn_bowld', steps: [{ k: 'chop', l: 'CHOP THE CHILLIES', s: 'wn_chilli' }, { k: 'rapid', l: 'STIR THE POT', s: 'wn_potd1' }, { k: 'meter', l: 'ADD THE DYNAMITE', s: 'wn_bowld' }] },
  cafe: { dish: 'Cumpuccino', show: 'wn_d_p', steps: [{ k: 'rapid', l: 'GRIND THE BEANS', s: 'wn_st_mach0' }, { k: 'pour', l: 'POUR THE CREAM', s: 'wn_d_p' }, { k: 'ring', l: 'FROTH IT', s: 'wn_d_p' }] },
  greebo: { dish: 'Cream Pie', show: 'wn_d_q', steps: [{ k: 'rapid', l: 'ROLL THE PASTRY', s: 'wn_d_qb' }, { k: 'meter', l: 'BAKE IT', s: 'wn_st_oven1' }, { k: 'ring', l: 'PIPE THE CREAM', s: 'wn_d_q' }] },
  beebs: { dish: 'A Pint and a Stew', show: 'wn_d_a', steps: [{ k: 'pour', l: 'PULL THE PINT', s: 'wn_d_a' }, { k: 'chop', l: 'CHOP THE VEG', s: 'wn_d_s' }, { k: 'rapid', l: 'STIR THE STEW', s: 'wn_st_stew1' }] },
  ali: { dish: 'Garlic Nuggets', show: 'wn_d_n', steps: [{ k: 'rapid', l: 'PEEL THE GARLIC', s: 'wn_garlic' }, { k: 'chop', l: 'CHOP THE GARLIC', s: 'wn_garlic' }, { k: 'flip', l: 'TOSS THE NUGGETS', s: 'wn_d_n' }] },
  joff: { dish: 'Pineapple Pizza', show: 'wn_d_x', steps: [{ k: 'flip', l: 'SPIN THE DOUGH', s: 'wn_d_zd' }, { k: 'chop', l: 'PINEAPPLE ON', s: 'wn_pineapple' }, { k: 'meter', l: 'BAKE IT', s: 'wn_st_oven1' }] }
};
var MAMAHELP = { chop: 'TAP WHEN IT IS UNDER THE KNIFE', rapid: 'TAP AS FAST AS YOU CAN!', meter: 'TAP IN THE MIDDLE', pour: 'TAP TO STOP AT THE LINE', ring: 'TAP WHEN THE RING HITS THE CIRCLE', flip: 'TAP AS IT LANDS IN THE PAN' };
var MM = null;
function startMama() { G.mode = 'mama'; MM = { def: MAMA[G.pl.id], i: 0, scores: [], t: 0, ph: 'title' }; music.play('wnmama'); mamaStep(); }
function mamaStep() { var s = MM.def.steps[MM.i]; MM.s = { k: s.k, l: s.l, spr: s.s, t: 0, v: 0, dir: 1, n: 0, items: [], fill: 0, done: 0, score: 0, ph: 'show', got: [], wob: 0 };
  var hard = G.L.k * 0.03 + G.pl.i * 0.04;
  if (s.k === 'chop') for (var i = 0; i < 6; i++) MM.s.items.push({ x: W + 40 + i * 74, hit: 0 });
  MM.s.spd = 120 + G.L.k * 4 + G.pl.i * 6; MM.s.vs = Math.min(1.7, 0.9 + G.L.k * 0.03);
  MM.s.rt = 1.5 / (1 + hard); MM.s.r = 64; MM.s.h = 0; MM.s.vy = 0; MM.s.up = 0; }
function mamaTap() { return KIT.pressed('a') || KIT.ptr.tap; }
function flipToss(s) { s.vy = 260 + Math.random() * 60; s.h = 0.01; s.up = 1; }
function mamaUpdate(dt) {
  var s = MM.s; s.t += dt; var tap = mamaTap(); if (s.wob > 0) s.wob -= dt; if (s.knife > 0) s.knife -= dt;
  if (KIT.pressed('b') && !s.done) { MM.scores = MM.def.steps.map(function () { return 0.5; }); return mamaFinish(); }
  if (s.ph === 'show') { if (s.t > 1.2) { s.ph = 'go'; s.t = 0; if (s.k === 'flip') flipToss(s); } return; }
  if (s.done) { s.done += dt; if (s.done > 1.3) { MM.scores.push(s.score); MM.i++; if (MM.i >= MM.def.steps.length) mamaFinish(); else mamaStep(); } return; }
  if (s.k === 'chop') {
    s.items.forEach(function (it) { it.x -= s.spd * dt; if (!it.hit && it.x < W / 2 - 26) { it.hit = -1; } });
    if (tap) { var c = s.items.filter(function (it) { return !it.hit && Math.abs(it.x - W / 2) < 22; })[0]; s.knife = 0.12; if (c) { var d = Math.abs(c.x - W / 2); c.hit = d < 8 ? 2 : 1; sfx.play('hit'); } else sfx.play('tick'); }
    if (s.items.every(function (it) { return it.hit; })) { s.score = s.items.reduce(function (a, it) { return a + (it.hit === 2 ? 1 : it.hit === 1 ? 0.7 : 0); }, 0) / s.items.length; s.done = 0.01; }
  } else if (s.k === 'rapid') {
    if (tap) { s.n++; s.dir = -s.dir; s.wob = 0.1; sfx.play('step'); }
    if (s.t > 4) { s.score = Math.min(1, s.n / 22); s.done = 0.01; }
  } else if (s.k === 'meter') {
    s.v += s.dir * s.vs * dt; if (s.v > 1) { s.v = 1; s.dir = -1; } if (s.v < 0) { s.v = 0; s.dir = 1; }
    if (tap) { s.score = clamp(1 - Math.abs(s.v - 0.5) * 3, 0, 1); s.done = 0.01; sfx.play(s.score > 0.8 ? 'power' : 'select'); }
  } else if (s.k === 'pour') { // it pours by itself: tap to stop it at the line
    s.fill += dt * (0.3 + G.L.k * 0.01); if (Math.random() < 0.3) sfx.play('pour');
    if (s.fill > 1.05) { s.score = 0; s.done = 0.01; sfx.play('no'); }
    else if (tap) { s.score = clamp(1 - Math.abs(s.fill - 0.8) * 4, 0, 1); s.done = 0.01; sfx.play(s.score > 0.8 ? 'power' : 'select'); }
  } else if (s.k === 'ring') { // three rings shrink onto the target: tap as each one meets it
    s.r -= dt * 64 / s.rt;
    var res = null; if (tap) res = clamp(1 - Math.abs(s.r - 16) / 18, 0, 1); else if (s.r < -2) res = 0;
    if (res !== null) { s.got.push(res); s.flash = 0.2; sfx.play(res > 0.7 ? 'coin' : res > 0 ? 'select' : 'no'); s.r = 64; if (s.got.length >= 3) { s.score = s.got.reduce(function (a, b) { return a + b; }, 0) / 3; s.done = 0.01; } }
  } else if (s.k === 'flip') { // three tosses: tap when it drops back into the pan
    if (s.up) { s.h += s.vy * dt; s.vy -= 420 * (1 + G.L.k * 0.02) * dt;
      var r2 = null; if (tap && s.vy < 0) r2 = s.h < 10 ? 1 : s.h < 28 ? 0.6 : s.h < 50 ? 0.25 : 0; else if (tap) r2 = 0; else if (s.h < -24) r2 = 0;
      if (r2 !== null) { s.got.push(r2); s.up = 0; s.h = 0; s.t = 0; sfx.play(r2 > 0.7 ? 'coin' : r2 > 0 ? 'select' : 'no'); if (s.got.length >= 3) { s.score = s.got.reduce(function (a, b) { return a + b; }, 0) / 3; s.done = 0.01; } } }
    else if (s.t > 0.5) flipToss(s);
  }
}
function mamaFinish() {
  var tot = MM.scores.reduce(function (a, b) { return a + b; }, 0) / MM.scores.length;
  G.result.mama = tot >= 0.9 ? 'PERFECT' : tot >= 0.7 ? 'GREAT' : tot >= 0.45 ? 'GOOD' : 'ER... EDIBLE'; G.result.bonus = Math.round(tot * 80 * (1 + U('mama') * 0.25)); SV.coins += G.result.bonus; persist();
  MM.end = { tot: tot, t: 0 }; G.mode = 'mamaend'; sfx.play(tot >= 0.7 ? 'win' : 'select');
  setTimeout(function () { if (G.mode === 'mamaend') showResult(); }, 1800);
}
function drawMama() {
  var th = G.pl.th; R('#0c0606', 0, 0, W, H); for (var y = 0; y < H; y += 20) for (var x = 0; x < W; x += 20) R(((x + y) / 20) % 2 ? th.fl[0] : th.fl[1], x, y, 20, 20); R('rgba(10,4,6,0.55)', 0, 0, W, H);
  R('#5a3a24', 40, 120, 400, 110); R('#a8643a', 40, 116, 400, 8); R('#6e3a1e', 40, 226, 400, 6); // the counter
  spr(G.pl.host, 430, 112, { sc: 2, flip: true });
  text('KITCHEN TIME', W / 2, 8, { align: 'center', size: 20, font: 'title', col: th.sign });
  if (G.mode === 'mamaend') { var e = MM.end; spr(MM.def.show, W / 2, 196, { sc: 4 }); text(G.result.mama, W / 2, 60, { align: 'center', size: 32, font: 'title', col: e.tot >= 0.7 ? '#ffe36a' : '#ff9a30' }); text('+' + G.result.bonus + ' TIPS', W / 2, 98, { align: 'center', size: 8, col: '#f1e7d0' }); return; }
  var s = MM.s; text(s.l, W / 2, 36, { align: 'center', size: 18, font: 'title', col: '#f1e7d0' }); text('STEP ' + (MM.i + 1) + '/' + MM.def.steps.length + '   B SKIPS', W / 2, 60, { align: 'center', size: 6, col: '#a6968f' });
  if (s.ph === 'show') { spr(s.spr, W / 2, 200, { sc: 3 }); return; }
  if (s.k === 'chop') { R('#c8a878', 80, 150, 320, 60); R('#a88858', 80, 206, 320, 4); s.items.forEach(function (it) { if (it.hit > 0) { spr(s.spr, it.x - 8, 196, { sc: 2, rot: -0.3 }); spr(s.spr, it.x + 10, 198, { sc: 2, rot: 0.3 }); } else if (it.x < W + 30) spr(s.spr, it.x, 196, { sc: 2.4, alpha: it.hit < 0 ? 0.4 : 1 }); });
    var ky = s.knife > 0 ? 150 : 96; R('#12040a', W / 2 - 4, ky - 60, 8, 40); R('#c8c0c8', W / 2 - 18, ky - 22, 36, 30); R('#ffffff', W / 2 - 18, ky + 6, 36, 2); R('rgba(255,227,106,0.3)', W / 2 - 22, 210, 44, 4); }
  else if (s.k === 'rapid') { var wob = s.wob > 0 ? s.dir * 6 : 0; spr(s.spr, W / 2 + wob, 210, { sc: 3, rot: wob * 0.02 }); KIT.bar(140, 236, 200, 8, Math.min(1, s.n / 22), '#ffe36a'); text(Math.max(0, 4 - s.t).toFixed(1), W / 2, 224, { align: 'center', size: 6, col: '#f1e7d0' }); }
  else if (s.k === 'meter') { spr(s.spr, W / 2, 200, { sc: 3 }); R('#12040a', 90, 80, 300, 16); R('#3a1a10', 92, 82, 296, 12); R('#ff9a30', 92 + 296 * 0.33, 82, 296 * 0.34, 12); R('#ffe36a', 92 + 296 * 0.45, 82, 296 * 0.1, 12); R('#ffffff', 92 + 296 * s.v - 2, 76, 4, 24); }
  else if (s.k === 'pour') { var cx = W / 2, liq = G.pl.id === 'beebs' ? '#ffc840' : '#f1e0b0'; R('#12040a', cx - 34, 110, 68, 110); R('#e8e0d8', cx - 32, 112, 64, 106); var f = Math.min(1, s.fill); R(liq, cx - 32, 218 - 106 * f, 64, 106 * f); R('#ff2630', cx - 40, 218 - 106 * 0.8, 80, 2); if (s.fill > 0.95) R('rgba(255,255,255,0.6)', cx - 34, 100, 68, 14);
    if (!s.done) R(liq, cx - 3, 90, 6, 128 - 106 * f); }
  else if (s.k === 'ring') { var ctx = KIT.ctx, cy = 172; spr(s.spr, W / 2, cy + 22, { sc: 2.5 });
    ctx.lineWidth = 3; ctx.strokeStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(W / 2, cy, 16, 0, Math.PI * 2); ctx.stroke();
    if (!s.done && s.r > 0) { ctx.lineWidth = 2; ctx.strokeStyle = Math.abs(s.r - 16) < 6 ? '#9aff5a' : '#f1e7d0'; ctx.beginPath(); ctx.arc(W / 2, cy, Math.max(1, s.r), 0, Math.PI * 2); ctx.stroke(); }
    for (var gi = 0; gi < 3; gi++) R(gi < s.got.length ? (s.got[gi] > 0.7 ? '#ffe36a' : s.got[gi] > 0 ? '#ff9a30' : '#ff2630') : '#3a1a1c', W / 2 - 22 + gi * 16, 222, 12, 6); }
  else if (s.k === 'flip') { var py = 206; spr('wn_st_grill0', W / 2, py + 28, { sc: 1.5 }); R('#12040a', W / 2 - 34, py - 4, 68, 8); R('#3a2a30', W / 2 - 32, py - 3, 64, 5); R('#12040a', W / 2 + 32, py - 2, 40, 4);
    spr(s.spr, W / 2, py - 2 - Math.max(-20, s.h), { sc: 2.4, rot: s.up ? s.h * 0.05 : 0 });
    for (var fi = 0; fi < 3; fi++) R(fi < s.got.length ? (s.got[fi] > 0.7 ? '#ffe36a' : s.got[fi] > 0 ? '#ff9a30' : '#ff2630') : '#3a1a1c', W / 2 - 22 + fi * 16, 236, 12, 6); }
  if (!s.done && s.ph === 'go') text(MAMAHELP[s.k] + '  (A OR TOUCH)', W / 2, 246, { align: 'center', size: 6, col: '#a6968f' });
  if (s.done) text(s.score >= 0.9 ? 'PERFECT!' : s.score >= 0.6 ? 'NICE!' : s.score > 0.2 ? 'OK...' : 'OOPS', W / 2, 100, { align: 'center', size: 28, font: 'title', col: s.score >= 0.6 ? '#ffe36a' : '#ff2630' });
}

/* ---------- drawing ---------- */
function drawRoom() {
  var fr = floorRect(), th = G.pl.th, pl = G.pl;
  var dec = SV.decor[pl.id] || 0;
  KIT.blit(KIT.layer('wn-room-' + pl.id + '-' + G.L.t + '-' + dec, W, H, function () {
    R('#0a0506', 0, 0, W, H);
    R(th.wall, 0, 0, W, 110);
    if (th.planks) { for (var y0 = 0; y0 < 110; y0 += 12) { R(th.brick, 0, y0 + 1, W, 10); R(th.hi, 0, y0 + 1, W, 1); } for (var bx = 20; bx < W; bx += 90) R('#1a0e04', bx, 0, 10, 110); }
    else for (var y = 0; y < 110; y += 8) for (var x = (y / 8) % 2 ? -8 : 0; x < W; x += 16) { R(th.brick, x + 1, y + 1, 14, 6); R(th.hi, x + 1, y + 1, 14, 1); }
    R('rgba(0,0,0,0.3)', 0, 102, W, 8);
    for (var ty = fr.y0; ty < fr.y1; ty += 16) for (var tx = fr.x0; tx < fr.x1; tx += 16) {
      if (th.planks) { R(((ty - fr.y0) / 16) % 2 ? th.fl[0] : th.fl[1], tx, ty, 16, 16); R('rgba(0,0,0,0.25)', tx, ty + 15, 16, 1); if (((tx + ty * 3) / 16) % 5 === 0) R('rgba(0,0,0,0.3)', tx + 15, ty, 1, 16); }
      else { var on = ((tx - fr.x0) / 16 + (ty - fr.y0) / 16) % 2 === 0; R(on ? th.fl[0] : th.fl[1], tx, ty, 16, 16); R('rgba(255,255,255,0.04)', tx, ty, 16, 1); } }
    R('rgba(0,0,0,0.25)', fr.x0, fr.y0, fr.x1 - fr.x0, 4);
    if (fr.x1 < 476) { R('#140808', fr.x1, 110, W - fr.x1, H - 110); for (var bx2 = fr.x1 + 4; bx2 < W; bx2 += 30) { R('#5a3a24', bx2, 126, 24, 120); R('#3a2416', bx2, 126, 2, 120); } text('CLOSED FOR', fr.x1 + (W - fr.x1) / 2, 166, { align: 'center', size: 8, col: '#a6968f' }); text('EXPANSION', fr.x1 + (W - fr.x1) / 2, 178, { align: 'center', size: 8, col: '#a6968f' }); }
    if (fr.y1 < 268) { R('#140808', 0, fr.y1, W, H - fr.y1); for (var by2 = fr.y1 + 6; by2 < H; by2 += 18) { R('#5a3a24', 70, by2, W - 80, 12); R('#3a2416', 70, by2, W - 80, 2); } text('MORE TABLES SOON', W / 2 + 30, fr.y1 + 26, { align: 'center', size: 8, col: '#a6968f' }); }
    R('#12040a', 0, 110, 60, H - 110); R('#1e0a0c', 4, 110, 52, H - 110); for (var q = 0; q < 4; q++) R('#2a0e10', 8, 158 + q * 26, 44, 2); // the waiting area
    // the kitchen counter along the back
    R('#1a0a0c', 282, 50, W - 282, 60); R('#2a0e10', 282, 50, W - 282, 2); R('#5a4a3a', 282, 104, W - 282, 6); R('#8a7a6a', 282, 104, W - 282, 2);
    // the sign
    R('#12040a', 108, 14, 140, 28); R(th.sign, 110, 16, 136, 24); R('#0a0204', 113, 19, 130, 18);
    if (dec >= 1) { // the wall poster
      R('#12040a', 254, 4, 40, 42); R('#6e3a1e', 255, 5, 38, 40); R('#a8643a', 255, 5, 38, 1); R('#1a0a0c', 258, 8, 32, 34); R(th.sign, 258, 8, 32, 3);
      spr(DISH[pl.mains[pl.mains.length - 1]].s, 274, 34, { sc: 1.2 }); text('NO.1', 274, 35, { align: 'center', size: 6, col: th.sign });
    }
    if (dec >= 2) for (var sx = 0; sx < 2; sx++) { R('rgba(255,227,106,0.06)', 136 + sx * 60, 46, 28, 30); R('rgba(255,227,106,0.06)', 140 + sx * 60, 50, 20, 22); }
  }), 0, 0);
  if (G.L.sh === 1) { R('rgba(8,12,40,0.5)', 0, 0, W, 110); R('rgba(8,12,40,0.28)', 0, 110, W, H - 110); }
  if (G.L.sh === 2) { var fl = Math.sin(KIT.t * 9) > 0.96 ? 0.15 : 0; R('rgba(50,0,6,' + (0.55 + fl) + ')', 0, 0, W, 110); R('rgba(40,0,6,' + (0.32 + fl) + ')', 0, 110, W, H - 110); }
  if (dec >= 2) for (var sc2 = 0; sc2 < 2; sc2++) spr(Math.floor(KIT.t * 7 + sc2 * 3) % 23 ? 'wn_sconce1' : 'wn_sconce0', 150 + sc2 * 60, 64);
  if (dec >= 3) { R('rgba(0,0,0,0.35)', 166, 106, 28, 3); spr('wn_sp_' + pl.id, 180, 108); }
  for (var b = 0; b < 17; b++) R(Math.floor(KIT.t * 3 + b) % 3 ? th.sign : '#ffffff', 112 + b * 8, 14, 2, 2);
  text(pl.short, 178, 22, { align: 'center', size: 13, font: 'title', col: th.sign, max: 126 });
  spr(G.doorT > 0 ? 'wn_dooropen' : 'wn_door', 30, 110, {});
  if (!pl.extra) { spr('wn_plant', 76, 108); spr('wn_jukebox', 112, 108); }
  if (pl.helper) { spr(pl.helper, 372, 70, { sc: 0.9 }); }
}
function drawSt(s) {
  var K = s.K, on = s.st === 'cook' || s.st === 'busy' || (K.type === 'phone' && s.ring > 0);
  var f = K.spr === 'pot' ? 'wn_pot' + (s.key === 'potd' ? 'd' : 'c') + (s.st === 'cook' ? Math.floor(KIT.t * 6) % 3 : s.st === 'idle' ? 'off' : 0) : K.spr + (on ? 1 : 0);
  var shake = K.type === 'phone' && s.ring > 0 ? Math.round(Math.sin(KIT.t * 50)) : 0;
  spr(f, s.x + shake, s.y + 8);
  if (s.st === 'cook') { KIT.bar(s.x - 16, s.y - 42, 32, 4, s.t / s.need, '#ffb040'); if (Math.random() < 0.25) parts.push({ x: s.x + rnd(-10, 10), y: s.y - 26, vx: 0, vy: -20, t: 0.8, c: 'rgba(200,180,170,0.6)', smoke: 1 }); }
  if (s.st === 'busy') KIT.bar(s.x - 16, s.y - 42, 32, 4, 1 - host.actT / (K.cook * prepK()), '#9aff5a');
  if (s.st === 'ready') { var it = s.item; spr(done(it) ? DISH[it.d].s : DISH[it.d].mid || DISH[it.d].s, s.x, s.y - 26 + Math.sin(KIT.t * 6) * 1.5); text(done(it) ? 'READY' : 'NEXT STEP', s.x, s.y - 50, { align: 'center', size: 6, col: '#ffe36a' }); if (K.burn && s.t > K.burn * G.L.burnK * (perk('burn') || 1) * (1 + U('lamps') * 0.3) * 0.6) R(Math.floor(KIT.t * 8) % 2 ? '#ff2630' : '#ffb040', s.x - 14, s.y - 54, 28, 2); }
  if (s.st === 'burnt') { R('#12040a', s.x - 14, s.y - 40, 28, 10); text(K.bad ? 'COLD' : 'BURNT', s.x, s.y - 38, { align: 'center', size: 6, col: '#ff2630' }); if (Math.random() < 0.5) parts.push({ x: s.x + rnd(-10, 10), y: s.y - 26, vx: 0, vy: -26, t: 1, c: 'rgba(40,30,30,0.8)', smoke: 1 }); }
  if (K.type === 'phone' && s.ring > 0) text('RING!', s.x, s.y - 36 - Math.abs(Math.sin(KIT.t * 12)) * 3, { align: 'center', size: 6, col: '#ffe36a' });
  if (K.type === 'shelf') takeaways.forEach(function (tk, j) { spr('wn_bag', s.x - 12 + j * 12, s.y - 2, { alpha: 0.4 }); spr(DISH[tk.d].s, s.x - 12 + j * 12, s.y - 18, { sc: 0.6 }); KIT.bar(s.x - 18 + j * 12, s.y - 30, 10, 2, tk.hearts / 5, '#ff2630'); });
  // what it makes, small, on the counter front
  var mk = s.key === 'stall' ? 't' : Object.keys(RECIPE).filter(function (d) { return RECIPE[d].indexOf(s.key) >= 0 && (G.pl.mains.indexOf(d) >= 0 || G.L.sides.indexOf(d) >= 0 || (G.pl.combo && G.pl.mains.indexOf(d) >= 0)); })[0];
  if (mk && K.type !== 'phone' && K.type !== 'shelf') { var fin = RECIPE[mk].indexOf(s.key) === RECIPE[mk].length - 1; spr(fin ? DISH[mk].s : (DISH[mk].mid || DISH[mk].s), s.x, s.y + 24, { sc: 0.6 }); }
}
function seatPos(g, k) { var tb = tables[g.table], n = g.who.length; if (n <= 2) return { x: tb.x + (k ? 34 : -34), y: tb.y - 6, flip: k === 1 }; return { x: tb.x + [-34, 34, -14, 14][k], y: tb.y - (k > 1 ? 18 : 6), flip: k % 2 === 1 }; }
function drawGroup(g, seated) {
  var moving = g.st === 'walk' || g.st === 'leave', bob = moving ? Math.abs(Math.sin(g.bob * 10)) * 2 : 0;
  g.who.forEach(function (f, k) {
    var p = seated ? seatPos(g, k) : { x: g.x + k * 14 - (g.who.length - 1) * 7, y: g.y, flip: false };
    var eat = seated && g.st === 'eat' ? Math.abs(Math.sin(g.t * 6 + k)) * 2 : 0, happy = g.happy > 0 ? Math.abs(Math.sin(g.happy * 14)) * 3 : 0, mad = g.hearts < 1.5 && g.st !== 'leave' ? Math.round(Math.sin(KIT.t * 30)) : 0;
    spr(f.s, p.x + mad, p.y - bob - happy + eat * 0.5, { sc: f.sc || 1, flip: p.flip });
    if (g.hearts < 1.5 && g.st !== 'leave' && Math.floor(KIT.t * 3 + k) % 2) R('rgba(255,38,48,0.7)', p.x - 4 + mad, p.y - 46, 8, 2); // fuming
  });
}
function bubbleFor(g, x, y, onTable) {
  if (g.st === 'menu') { spr('wn_bubble', x, y); text('...', x, y - 16, { align: 'center', size: 8, col: '#12040a', shadow: false }); }
  else if (g.st === 'order') { spr('wn_bubble', x, y + Math.sin(KIT.t * 8) * 2); text('!', x, y - 17, { align: 'center', size: 8, col: '#c4121c', shadow: false }); }
  else if (g.st === 'waitfood') { spr('wn_bubble', x, y, { sc: g.need.length > 1 ? 1.4 : 1 }); g.need.forEach(function (d, k) { spr(DISH[d].s, x + (k - (g.need.length - 1) / 2) * 14, y - 6, { sc: g.need.length > 1 ? 0.6 : 0.8 }); }); }
  else if (g.st === 'eat') { text(Math.floor(KIT.t * 3) % 2 ? 'NOM' : 'nom', x, y - 12, { align: 'center', size: 6, col: '#ffe36a' }); }
  else if (g.st === 'bill') { spr('wn_bubble', x, y + Math.sin(KIT.t * 8) * 2); spr('wn_coin', x, y - 9); text('$', x, y - 17, { align: 'center', size: 6, col: '#12040a', shadow: false }); }
  if (g.st !== 'leave' && g.st !== 'walk') { if (onTable) { for (var h = 0; h < 5; h++) spr(g.hearts > h + 0.5 ? 'wn_heart' : 'wn_heart0', x - 24 + h * 10, y + 20, { anchor: 'tl' }); } else { R('#12040a', x - 44, y + 30, 28, 4); R(g.hearts > 2 ? '#ff6a74' : '#ff2630', x - 43, y + 31, 26 * Math.max(0, g.hearts) / 5, 2); } }
}
function draw() {
  var ctx = KIT.ctx;
  if (G.mode === 'title' || !G.pl) { drawTitle(); return; }
  if (G.mode === 'mama' || G.mode === 'mamaend') { drawMama(); return; }
  drawRoom();
  sts.forEach(drawSt);
  var list = [];
  tables.forEach(function (tb) { list.push({ y: tb.y, d: function () {
    var n = tb.g ? tb.g.who.length : 2; spr('wn_chair', tb.x - 34, tb.y - 2); spr('wn_chair', tb.x + 34, tb.y - 2, { flip: true });
    if (tb.g && tb.g.st !== 'walk') drawGroup(tb.g, true);
    spr('wn_table', tb.x, tb.y + 6);
    if (tb.g && tb.g.st === 'eat') tb.g.order.forEach(function (d, k) { spr(DISH[d].s, tb.x - 10 + k * 18, tb.y - 6, { sc: 0.75 }); });
    if (tb.dirty) { spr('wn_dish', tb.x - 8, tb.y - 10); spr('wn_dish', tb.x + 9, tb.y - 8); }
    if (tb.g && tb.g.st !== 'walk' && tb.g.st !== 'leave') bubbleFor(tb.g, tb.x, tb.y - 8 - (n > 2 ? 12 : 0), true);
  } }); });
  groups.forEach(function (g) { if (g.st === 'queue' || g.st === 'walk' || g.st === 'leave') list.push({ y: g.y, d: function () { if (g === sel) { R('#ffe36a', g.x - 16, g.y - 1, 32, 2); } drawGroup(g, false); if (g.st === 'queue') bubbleFor(g, g.x + 30, g.y - 34); if (g.st === 'leave' && g.hearts <= 0) text('GRR', g.x, g.y - 52, { align: 'center', size: 6, col: '#ff2630' }); } }); });
  list.push({ y: host.y, d: drawHost });
  list.sort(function (a, b) { return a.y - b.y; }).forEach(function (o) { o.d(); });
  parts.forEach(function (p) { R(p.c, p.x, p.y, p.smoke ? 3 : 2, p.smoke ? 3 : 2); });
  if (cursor.h && !G.usedPtr && G.mode === 'play') { var h = cursor.h, r = h.r, on = Math.floor(KIT.t * 4) % 2; ctx.strokeStyle = on ? '#ffe36a' : '#ff9a30'; ctx.lineWidth = 2; ctx.strokeRect(r[0] + 0.5, r[1] + 0.5, r[2], r[3]); }
  host.q.forEach(function (j, k) { var s = stationOf(j); R('#12040a', s.x - 6, s.y - 2, 12, 11); R('#c4121c', s.x - 5, s.y - 1, 10, 9); text(String(k + 1), s.x, s.y, { align: 'center', size: 6 }); });
  pops.forEach(function (p) { text(p.t, p.x, p.y, { align: 'center', size: 6, col: p.c, alpha: Math.min(1, p.life * 2) }); });
  drawHud();
  if (G.cheer > 0) text('PARTY!', W / 2, 120, { align: 'center', size: 32, font: 'title', col: '#ffe36a', alpha: Math.min(1, G.cheer) });
  if (G.mode === 'intro') { var bl = SUPPLIES.filter(function (it) { return B(it.id); }).map(function (it) { return it.n.toUpperCase(); }); KIT.panel(W / 2 - 160, 84, 320, bl.length ? 118 : 104);
    if (bl.length) text('TODAY: ' + bl.join(' · '), W / 2, 188, { align: 'center', size: 6, col: '#9aff5a', max: 300 }); text(G.pl.name.toUpperCase(), W / 2, 92, { align: 'center', size: 6, col: G.pl.th.sign }); text(lvName(G.lv).toUpperCase(), W / 2, 104, { align: 'center', size: 24, font: 'title', col: G.L.sh ? SHIFTS[G.L.sh].col : '#ff2630' });
    text(G.L.t + ' TABLES  ·  ' + G.L.n + ' CUSTOMERS', W / 2, 134, { align: 'center', size: 6 }); text('GOAL ' + G.L.goal + '   EXPERT ' + G.L.expert, W / 2, 146, { align: 'center', size: 6, col: '#ffe36a' });
    var tw2 = KIT.wrap(G.lv % NDAYS === 0 && G.L.sh ? SHIFTS[G.L.sh].d : G.lv === 0 ? G.pl.twist : '"' + G.pl.quote + '"', 290, 10, 'body'); tw2.slice(0, 2).forEach(function (l, i) { text(l, W / 2, 158 + i * 12, { align: 'center', size: 10, font: 'body', col: '#a6968f' }); }); }
}
function drawHost() {
  var walking = host.q.length && host.actT <= 0, f = walking ? Math.floor(host.walkT * 8) % 4 : 0, name = PLACE[SV.host].host, wk = name + '_w' + f;
  R('rgba(0,0,0,0.35)', host.x - 10, host.y - 1, 20, 3);
  var busy = host.actT > 0 ? Math.round(Math.sin(KIT.t * 30)) : 0;
  spr(walking && KIT.has(wk) ? wk : name, host.x + busy, host.y, { flip: host.face < 0 });
  host.hands.forEach(function (it, k) { var sp = done(it) ? DISH[it.d].s : (DISH[it.d].mid || DISH[it.d].s); spr(sp, host.x + (k - (host.hands.length - 1) / 2) * 16, host.y - 40 - (walking ? f % 2 : 0), { sc: 0.85 }); });
  if (host.tickets.length) { spr('wn_ticket', host.x + 16, host.y - 22, { anchor: 'tl' }); text('x' + host.tickets.length, host.x + 29, host.y - 18, { size: 6 }); }
}
function drawHud() {
  var L = G.L; KIT.panel(4, 4, 100, 34, { fill: 'rgba(14,7,8,0.85)' });
  text(lvName(G.lv).toUpperCase() + ' $' + G.score, 10, 10, { size: 6, col: SHIFTS[G.L.sh].col, max: 90 });
  var k = Math.min(1, G.score / L.expert); KIT.bar(10, 24, 88, 6, k, G.score >= L.goal ? '#ffe36a' : '#c4121c'); R('#f1e7d0', 10 + 88 * L.goal / L.expert, 22, 1, 10);
  KIT.panel(300, 4, 176, 40, { fill: 'rgba(14,7,8,0.85)' });
  text('WAITING ' + queue.length + '  TO COME ' + arrivals.length, 306, 9, { size: 6, col: '#a6968f' });
  if (host.tickets.length) { var cnt = {}; host.tickets.forEach(function (d) { cnt[d] = (cnt[d] || 0) + 1; }); var x = 306; Object.keys(cnt).forEach(function (d) { spr(DISH[d].s, x + 8, 38, { sc: 0.7 }); text('x' + cnt[d], x + 18, 28, { size: 6 }); x += 40; }); }
  else text('NO ORDERS ON THE PAD', 306, 24, { size: 6, col: '#5a4a4a' });
  if (sel) text('SEAT ' + sel.who.map(function (f) { return f.n.toUpperCase(); }).join(' & ') + ': PICK A TABLE', 64, 98, { size: 6, col: '#ffe36a', max: 210 });
  // party poppers
  KIT.panel(4, 40, 54, 24, { fill: 'rgba(14,7,8,0.85)' }); spr('wn_popper', 16, 62, { alpha: SV.items.popper ? 1 : 0.3 }); text('x' + (SV.items.popper || 0), 28, 46, { size: 6, col: SV.items.popper ? '#ffe36a' : '#5a4a4a' }); text('Y', 28, 55, { size: 6, col: '#a6968f' });
}
function drawTitle() {
  R('#0a0506', 0, 0, W, H); var t = KIT.t;
  for (var y = 0; y < H; y += 16) for (var x = 0; x < W; x += 16) R(((x + y) / 16) % 2 ? '#1e0a0c' : '#3a0a10', x, y, 16, 16);
  R('rgba(7,4,5,0.6)', 0, 0, W, H);
  PLACES.forEach(function (p, i) { if (!SV.open[p.id]) return; spr(p.host, 60 + i * 72, 250 + Math.sin(t * 3 + i) * 2, { sc: 1.4 }); });
  ['wn_bowld', 'wn_d_p', 'wn_d_q', 'wn_d_a', 'wn_d_n', 'wn_d_x'].forEach(function (s, i) { spr(s, 40 + i * 80, 40 + Math.sin(t * 2 + i) * 4, { sc: 1.5 }); });
}

/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; G.pl = null; music.play('wntitle'); var last = PLACE[SV.last] || PLACES[0], pd = SV.places[last.id];
  KIT.menu({ cls: 'clear', logo: '../assets/wn-logo.webp', title: 'Willy Nilly', sub: 'Six places to run: a day shift, a night shift and a nightmare shift each. Seat them, feed them, take their money.',
    items: [{ label: 'PLAY', sub: last.name + ' · ' + lvName(Math.min(pd.unl, TOTAL) - 1), fn: function () { KIT.closeMenu(); startLevel(last.id, Math.min(pd.unl, TOTAL) - 1); }, cls: 'hot', def: true },
      { label: 'PLACES', sub: Object.keys(SV.open).length + ' of ' + PLACES.length + ' open', fn: placesMenu }, { label: 'WHO IS WORKING', sub: PLACE[SV.host].who + ': ' + PLACE[SV.host].perk, fn: hostsMenu },
      { label: 'SHOP', sub: 'Tips in the jar: ' + SV.coins, fn: function () { upgradesMenu(titleMenu); } }, { label: 'HOW TO PLAY', fn: helpMenu }] });
}
function placesMenu() {
  G.mode = 'title'; G.pl = null;
  KIT.menu({ title: 'Places', items: PLACES.map(function (p, i) { var open = SV.open[p.id], pd = SV.places[p.id]; return { label: p.name.toUpperCase(), sub: open ? lvName(Math.min(pd.unl, TOTAL) - 1) + ' · ' + Math.min(pd.unl, TOTAL) + ' of ' + TOTAL + ' · ' + countStars(pd) + '★' : 'Beat day ' + UNLOCK_AT + ' at ' + PLACES[i - 1].name + ' to open it', dis: !open, fn: function () { shiftsMenu(p.id); } }; }).concat([{ label: 'BACK', back: true, fn: titleMenu }]) });
}
function countStars(pd) { var n = 0; for (var k in pd.stars) n += pd.stars[k]; return n; }
function shiftsMenu(pid) {
  var p = PLACE[pid], pd = SV.places[pid]; if (pd.unl <= NDAYS) return daysMenu(pid, 0);
  KIT.menu({ title: p.name, sub: '"' + p.quote + '"', items: SHIFTS.map(function (sh, k) { var open = pd.unl > k * NDAYS, st = 0, done = 0; for (var i = k * NDAYS; i < (k + 1) * NDAYS; i++) { st += pd.stars[i] || 0; if (pd.stars[i]) done++; }
    return { label: sh.n.toUpperCase() + (open ? '  ·  ' + st + '★' : ''), sub: open ? done + ' of ' + NDAYS + ' passed. ' + sh.d : 'Beat ' + SHIFTS[k - 1].w + ' ' + NDAYS + ' to open it.', dis: !open, def: open && pd.unl <= (k + 1) * NDAYS, cls: done >= NDAYS ? 'done' : '', fn: function () { daysMenu(pid, k); } }; })
    .concat([{ label: 'BACK', back: true, fn: placesMenu }]) });
}
function daysMenu(pid, sh) {
  var p = PLACE[pid], pd = SV.places[pid]; sh = sh || 0; var base = sh * NDAYS;
  KIT.menu({ title: sh ? SHIFTS[sh].n : p.name, sub: sh ? p.name + '. ' + SHIFTS[sh].d : '"' + p.quote + '"  ' + p.twist, grid: true, items: Array.from({ length: NDAYS }, function (_, j) { var i = base + j, lock = i + 1 > pd.unl, st = pd.stars[i] || 0; return { label: lvName(i).toUpperCase() + (lock ? '' : ' ' + '★★★'.slice(0, st)), sub: lock ? 'Locked' : levelFor(p, i).t + ' tables · best $' + (pd.best[i] || 0), dis: lock, fn: function () { KIT.closeMenu(); startLevel(pid, i); } }; })
    .concat([{ label: 'BACK', back: true, fn: function () { if (pd.unl > NDAYS) shiftsMenu(pid); else placesMenu(); } }]) });
}
function hostsMenu() {
  KIT.menu({ title: 'Who Is Working', sub: 'Open a place and its owner joins. Anyone can work any kitchen.', items: PLACES.map(function (p) { var open = SV.open[p.id]; return { label: p.who.toUpperCase() + (SV.host === p.id ? '  ✓' : ''), sub: open ? p.perk : 'Opens with ' + p.name, dis: !open, cls: SV.host === p.id ? 'done' : '', fn: function () { SV.host = p.id; persist(); sfx.play('select'); hostsMenu(); } }; }).concat([{ label: 'BACK', back: true, fn: titleMenu }]) });
}
var shopBack = null;
function keepScroll(fn) { var box = document.querySelector('#menu .mbox'), y = box ? box.scrollTop : 0; fn(); box = document.querySelector('#menu .mbox'); if (box) box.scrollTop = y; }
function upgradesMenu(back) {
  if (back) shopBack = back; back = shopBack || titleMenu;
  var lv = 0, mx = 0; UPGRADES.forEach(function (u) { lv += U(u.id); mx += u.max; });
  var dl = 0; PLACES.forEach(function (p) { dl += (SV.decor[p.id] || 0); });
  KIT.menu({ title: 'Shop', sub: 'Tips in the jar: $' + SV.coins + '  ·  upgrades ' + lv + ' of ' + mx + '  ·  decor ' + dl + ' of ' + PLACES.length * DECOR.length,
    items: CATS.map(function (c) { var n = 0, m = 0; UPGRADES.forEach(function (u) { if (u.cat === c.id) { n += U(u.id); m += u.max; } }); return { label: c.n + '  ·  ' + n + '/' + m, sub: c.d, cls: n >= m ? 'done' : '', fn: function () { catMenu(c.id); } }; })
      .concat([{ label: 'DECOR  ·  ' + dl + '/' + PLACES.length * DECOR.length, sub: 'Do up each place. It shows, and it only helps there.', fn: decorPlaces },
        { label: 'SUPPLIES', sub: 'Party poppers, and boosts for your next day. Poppers ' + (SV.items.popper || 0), fn: function () { suppliesMenu(); } },
        { label: 'BACK', back: true, fn: back }]) });
}
function catMenu(cid, focus) {
  var c = CATS.filter(function (x) { return x.id === cid; })[0];
  KIT.menu({ title: c.n.charAt(0) + c.n.slice(1).toLowerCase(), sub: 'Tips in the jar: $' + SV.coins,
    items: UPGRADES.filter(function (u) { return u.cat === cid; }).map(function (u) {
      var l = U(u.id), full = l >= u.max, cost = upCost(u);
      return { label: u.name.toUpperCase() + '  ·  ' + l + '/' + u.max + (full ? '' : '  ·  $' + cost), sub: full ? u.d(l) : (l ? 'Now: ' + u.d(l) + ' Next: ' + u.d(l + 1) : u.d(1)), cls: full ? 'done' : '', dis: full || SV.coins < cost, def: focus === u.id,
        fn: function () { SV.coins -= cost; SV.ups[u.id] = l + 1; persist(); sfx.play('power'); keepScroll(function () { catMenu(cid, u.id); }); } };
    }).concat([{ label: 'BACK', back: true, fn: function () { upgradesMenu(); } }]) });
}
function decorPlaces() {
  KIT.menu({ title: 'Decor', sub: 'Tips in the jar: $' + SV.coins, items: PLACES.map(function (p) { var open = SV.open[p.id], n = SV.decor[p.id] || 0;
    return { label: p.name.toUpperCase() + '  ·  ' + n + '/' + DECOR.length, sub: open ? (n < DECOR.length ? 'Next: ' + decorName(p, n) + ' · $' + decorCost(p, n) : 'All done up') : 'Not open yet', dis: !open, cls: n >= DECOR.length ? 'done' : '', fn: function () { decorMenu(p.id); } }; })
    .concat([{ label: 'BACK', back: true, fn: function () { upgradesMenu(); } }]) });
}
function decorName(p, k) { return k === 2 ? SHOWPIECE[p.id] : DECOR[k].n; }
function decorMenu(pid) {
  var p = PLACE[pid], n = SV.decor[pid] || 0;
  KIT.menu({ title: p.name, sub: 'Tips in the jar: $' + SV.coins, items: DECOR.map(function (dc, k) { var own = n > k, cost = decorCost(p, k), next = k === n;
    return { label: decorName(p, k).toUpperCase() + (own ? '' : '  ·  $' + cost), sub: dc.d + (own || next ? '' : ' Buy the ' + decorName(p, k - 1) + ' first.'), cls: own ? 'done' : '', dis: own || !next || SV.coins < cost, def: next,
      fn: function () { SV.coins -= cost; SV.decor[pid] = k + 1; persist(); sfx.play('power'); decorMenu(pid); } }; })
    .concat([{ label: 'BACK', back: true, fn: decorPlaces }]) });
}
function suppliesMenu(focus) {
  KIT.menu({ title: 'Supplies', sub: 'Tips in the jar: $' + SV.coins + '  ·  boosts are used up on the next day you start',
    items: SUPPLIES.map(function (it) { var have = SV.items[it.id] || 0, show = it.give ? SV.items.popper || 0 : have;
      return { label: it.n.toUpperCase() + '  ·  $' + it.cost, sub: it.d + (it.give || it.id === 'popper' ? ' You have ' + show + ' poppers.' : have ? ' You have ' + have + ' ready.' : ''), dis: SV.coins < it.cost, def: focus === it.id,
        fn: function () { SV.coins -= it.cost; if (it.give) for (var k in it.give) SV.items[k] = (SV.items[k] || 0) + it.give[k]; else SV.items[it.id] = have + 1; persist(); sfx.play('coin'); keepScroll(function () { suppliesMenu(it.id); }); } }; })
    .concat([{ label: 'BACK', back: true, fn: function () { upgradesMenu(); } }]) });
}
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p>Tap a customer in the queue, then a free table to seat them. (With a controller or keys: move the cursor and press A.)</p><p>When they put a hand up (<b>!</b>) tap their table to take the order. Tap the right station to make each thing: some dishes go through two (a cream pie bakes, then gets its cream; a pizza gets its topping, then bakes). When it says READY, tap it to pick it up, then tap the table to serve.</p><p>When they want the bill (<b>$</b>), tap the table to get paid, then tap it again to clear the plates.</p><p>The <b>treat stall</b> by the sign gives out sweets: pick one up and tap a customer to cheer them up. A <b>party popper</b> (Y, or tap it bottom left) cheers up everyone at once; buy them in the shop.</p><p>You remember up to 4 jobs in a row. The same job twice in a row is a CHAIN bonus. Hearts are patience. Leave food too long and it burns. B cancels the last job.</p><p>Beat day ' + UNLOCK_AT + ' at a place to open the next one. Between days there is Kitchen Time: make the house dish for extra tips.</p>',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play' || G.mode === 'intro') pauseMenu(); else titleMenu(); } }] });
}
function pauseMenu() {
  if (G.mode !== 'play' && G.mode !== 'intro') return;
  KIT.menu({ cls: 'clear', title: 'Paused', sub: G.pl.name + '  ·  ' + lvName(G.lv) + '  ·  $' + G.score, items: [{ label: 'CARRY ON', fn: KIT.closeMenu, back: true, def: true }, { label: 'START THE DAY AGAIN', fn: function () { KIT.closeMenu(); startLevel(G.pl.id, G.lv, true); } }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT TO TITLE', fn: titleMenu }] });
}

/* ---------- music: every place has its own ---------- */
music.songs.wn = { bpm: 138, beats: 4, vol: 0.85, wet: 0.25, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'C Am F G C Am D G E Am F G C F G C',
  mel: 'e5 - g5 - c6 - g5 e5 | a5 - - - e5 - c5 - | f5 - a5 - c6 - a5 f5 | g5 - b5 - d6 - - - | e6 - d6 c6 g5 - e5 - | a5 - c6 - e6 - - - | f#5 - a5 - d6 - c6 a5 | b5 - - - g5 - - - | ' +
       'g#5 - b5 - e6 - - - | c6 - b5 a5 e5 - c5 - | a5 - c6 - f6 - e6 d6 | b5 - d6 - g6 - f6 d6 | e6 - c6 - g5 - e5 - | f5 - a5 - c6 - a5 - | g5 - b5 - d6 - b5 g5 | c6 - - - - - - -' };
music.songs.wntitle = { bpm: 112, beats: 4, vol: 0.8, wet: 0.35, lead: 'calliope', bass: 'walk', acc: 'stabs', drums: 'shuffle', chords: 'F Dm Bb C F Dm G C',
  mel: 'c5 - f5 - a5 - c6 - | d6 - c6 - a5 - f5 - | d5 - f5 - bb5 - d6 - | c6 - - - - - . . | c5 - f5 - a5 - c6 - | f6 - e6 - d6 - a5 - | g5 - b5 - d6 - f6 - | e6 - - - c6 - - -' };
music.songs.wncafe = { bpm: 96, beats: 4, vol: 0.8, wet: 0.45, lead: 'soft', bass: 'walk', acc: 'bell', drums: 'shuffle', chords: 'F Em Dm G F Em Am D',
  mel: 'a5 - c6 - e6 - - - | d6 - b5 - g5 - - - | f5 - a5 - c6 - a5 - | b5 - - - g5 - - - | a5 - c6 - e6 - g6 - | e6 - d6 - b5 - - - | c6 - a5 - e5 - c6 - | b5 - a5 - f#5 - - -' };
music.songs.wngoon = { bpm: 120, beats: 4, vol: 0.85, wet: 0.35, lead: 'organlead', bass: 'walk', acc: 'organ', drums: 'shuffle', chords: 'Dm Gm A Dm Bb Gm A A',
  mel: 'd5 - f5 - a5 - d6 - | c6 - bb5 - g5 - - - | a5 - c#6 - e6 - c#6 - | d6 - - - a5 - - - | bb5 - d6 - f6 - d6 - | g5 - bb5 - d6 - - - | e6 - c#6 - a5 - e5 - | a5 - - - - - . .' };
music.songs.wnpub = { bpm: 150, beats: 3, vol: 0.85, wet: 0.3, lead: 'calliope', bass: 'waltz', acc: 'stabs', drums: 'waltz', chords: 'G G C D G Em Am D',
  mel: 'd5 - g5 - b5 - | d6 - - b5 - g5 | c6 - e6 - c6 - | a5 - - - - - | b5 - d6 - b5 - | g5 - e5 - g5 - | a5 - c6 - f#5 - | g5 - - - - -' };
music.songs.wngarlic = { bpm: 126, beats: 4, vol: 0.85, wet: 0.3, lead: 'fm', bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'Em Em D D C C B B',
  mel: 'e5 - g5 a5 b5 - a5 g5 | e5 - - - b4 - - - | d5 - f#5 g5 a5 - g5 f#5 | d5 - - - a4 - - - | c5 - e5 f#5 g5 - f#5 e5 | c5 - - - g5 - - - | b4 - d#5 f#5 b5 - a5 f#5 | d#5 - - - - - . .' };
music.songs.wnpizza = { bpm: 144, beats: 4, vol: 0.85, wet: 0.25, lead: 'calliope', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'C C G G G G C C F F C C G G C C',
  mel: 'e5 - g5 - c6 - - - | e6 - d6 - c6 - - - | d5 - f5 - b5 - - - | d6 - c6 - b5 - - - | d5 - f5 - b5 - d6 - | f6 - e6 - d6 - - - | e6 - c6 - g5 - e5 - | c5 - - - - - - - | ' +
       'f5 - a5 - c6 - - - | f6 - e6 - c6 - - - | e5 - g5 - c6 - - - | e6 - d6 - c6 - - - | d5 - f5 - b5 - d6 - | g6 - f6 - d6 - b5 - | c6 - e6 - g6 - e6 - | c6 - - - - - - -' };
music.songs.wnmama = { bpm: 150, beats: 4, vol: 0.85, wet: 0.2, lead: 'pulse', bass: 'pulse16', acc: 'arp16', drums: 'fast', chords: 'C F G C', mel: 'c6 . e6 . g6 . e6 . | f6 . a6 . c6 . a5 . | g5 . b5 . d6 . f6 . | e6 - c6 - - - . .' };

KIT.start({ w: W, h: H, pad: 'none', update: update, draw: draw, onPause: pauseMenu, startPauses: false, idleUpdate: function () {} });
titleMenu();
window.__wn = { get cursor() { return cursor; }, get sel() { return sel; }, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, G: G, get host() { return host; }, get amy() { return host; }, get groups() { return groups; }, get tables() { return tables; }, get sts() { return sts; }, get queue() { return queue; },
  get takeaways() { return takeaways; }, startLevel: function (a, b) { if (typeof a === 'number') return startLevel('amy', a); startLevel(a, b); }, doJob: doJob, seat: seat, newGroup: newGroup, endLevel: endLevel, SV: SV, PLACES: PLACES, levelFor: levelFor, activate: activate, hotspots: hotspots, usePopper: usePopper, startMama: function () { G.result = { st: 2, pass: true, bonus: 0 }; startMama(); }, get MM() { return MM; } };
