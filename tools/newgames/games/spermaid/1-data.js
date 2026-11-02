/* =====================================================================================================
   SPERMAID SURVIVORS: Vampire Survivors style, Spermaid only. Eight places from the other games, ten
   minutes each until dawn, with two big foes on the way and the place's own boss at ten minutes.
   Weapons fire by themselves; pick upgrades at each level, find charms, open chests, evolve weapons.
   A = Tidal Wave (fills with kills), B = dash. Drops (gold) are kept and spent at Spermaid's Sanctum.
   ===================================================================================================== */
var R = KIT.R, spr = KIT.spr, text = KIT.text;
var W = 640, H = 360, DAWN = 600;
var SV = KIT.load('ss-save', null);
if (!SV) { SV = { v: 1, gold: 0, best: {}, cleared: {}, ups: {}, seen: {}, kills: {}, friends: {}, runs: 0, total: 0, opt: { nums: 1, shake: 1 } }; var oldBest = 0; try { oldBest = parseInt(localStorage.getItem('ss-best') || '0', 10) || 0; } catch (e) {} if (oldBest) SV.best.sewers = oldBest; }
['best', 'cleared', 'ups', 'seen', 'kills', 'friends', 'opt'].forEach(function (k) { if (!SV[k]) SV[k] = {}; });
if (SV.opt.nums === undefined) SV.opt.nums = 1; if (SV.opt.shake === undefined) SV.opt.shake = 1;
function persist() { KIT.save('ss-save', SV); }

/* ---------- the foes (every one from the other games) ----------
   ai: chase (default), fly (ignores the crowd), dash (charges in bursts), shoot (keeps its distance and fires),
   roll (crosses in a straight line), rise (comes up out of the ground near you). split: breaks into smaller ones.
   pop: bursts into shards. arm: takes less damage. ghost: half see-through. */
var FOES = {
  rat: { n: 'Rat', hp: 6, spd: 60, dmg: 5, xp: 1, r: 7 }, cultrat: { n: 'Rat Cultist', hp: 15, spd: 40, dmg: 7, xp: 2, r: 9, ai: 'shoot', shot: 'dagger', cd: 3.4 },
  creamblob: { n: 'Cream Blob', hp: 12, spd: 42, dmg: 6, xp: 1, r: 8, split: 2 }, slime: { n: 'Slime', hp: 10, spd: 46, dmg: 6, xp: 1, r: 8 },
  slimeY: { n: 'Yellow Slime', hp: 14, spd: 52, dmg: 6, xp: 1, r: 8, split: 2 }, slimeB: { n: 'Blue Slime', hp: 18, spd: 40, dmg: 7, xp: 2, r: 8 },
  slimeR: { n: 'Red Slime', hp: 20, spd: 58, dmg: 8, xp: 2, r: 8, split: 2 }, slimeP: { n: 'Purple Slime', hp: 22, spd: 48, dmg: 8, xp: 2, r: 8 },
  crawler: { n: 'Crawler', hp: 9, spd: 50, dmg: 6, xp: 1, r: 10 }, crawlerN: { n: 'Night Crawler', hp: 16, spd: 56, dmg: 8, xp: 2, r: 10 },
  bat: { n: 'Bat', hp: 5, spd: 72, dmg: 4, xp: 1, r: 8, ai: 'fly' }, batP: { n: 'Blood Bat', hp: 9, spd: 80, dmg: 6, xp: 1, r: 8, ai: 'fly' },
  crow: { n: 'Crow', hp: 6, spd: 78, dmg: 5, xp: 1, r: 7, ai: 'fly' }, clown: { n: 'Pie Clown', hp: 24, spd: 36, dmg: 8, xp: 3, r: 10, ai: 'shoot', shot: 'pie', cd: 3.8 },
  balloon: { n: 'Steve Balloon', hp: 8, spd: 32, dmg: 5, xp: 1, r: 8, ai: 'fly', pop: 3 }, pieling: { n: 'Pieling', hp: 11, spd: 50, dmg: 6, xp: 1, r: 9 },
  skeleton: { n: 'Skeleton', hp: 14, spd: 36, dmg: 8, xp: 2, r: 9, ai: 'shoot', shot: 'bone', cd: 3.6 }, bonehound: { n: 'Bone Hound', hp: 13, spd: 50, dmg: 8, xp: 2, r: 10, ai: 'dash' },
  mummy: { n: 'Mummy', hp: 34, spd: 28, dmg: 10, xp: 3, r: 9 }, gravehand: { n: 'Grave Hand', hp: 14, spd: 0, dmg: 9, xp: 1, r: 9, ai: 'rise' },
  wraith: { n: 'Wraith', hp: 16, spd: 48, dmg: 7, xp: 2, r: 10, ai: 'fly', ghost: 1 }, magmaslug: { n: 'Magma Slug', hp: 28, spd: 26, dmg: 9, xp: 2, r: 11, trail: 1 },
  emberbat: { n: 'Ember Bat', hp: 9, spd: 76, dmg: 6, xp: 1, r: 8, ai: 'fly' }, imp: { n: 'Imp', hp: 15, spd: 42, dmg: 7, xp: 2, r: 9, ai: 'shoot', shot: 'fire', cd: 3 },
  golem: { n: 'Golem', hp: 70, spd: 25, dmg: 14, xp: 6, r: 15, arm: 0.7 }, knight: { n: 'Hollow Knight', hp: 32, spd: 32, dmg: 11, xp: 4, r: 11, arm: 0.6 },
  ghoul: { n: 'Ghoul', hp: 16, spd: 40, dmg: 9, xp: 2, r: 9 }, vampire: { n: 'Vampire', hp: 28, spd: 52, dmg: 9, xp: 3, r: 9, ai: 'fly' },
  gargoyle: { n: 'Gargoyle', hp: 32, spd: 56, dmg: 10, xp: 3, r: 12, ai: 'fly' }, jailer: { n: 'Jailer', hp: 56, spd: 30, dmg: 13, xp: 5, r: 13, arm: 0.8 },
  ant: { n: 'Ant', hp: 6, spd: 62, dmg: 5, xp: 1, r: 8 }, wasp: { n: 'Wasp', hp: 8, spd: 80, dmg: 6, xp: 1, r: 8, ai: 'fly' },
  rollingpin: { n: 'Rolling Pin', hp: 26, spd: 120, dmg: 12, xp: 2, r: 12, ai: 'roll' }, toymouse: { n: 'Toy Mouse', hp: 9, spd: 78, dmg: 6, xp: 1, r: 8, ai: 'dash' },
  thornling: { n: 'Thornling', hp: 26, spd: 30, dmg: 10, xp: 2, r: 12 }, rotfly: { n: 'Rot Fly', hp: 4, spd: 86, dmg: 4, xp: 1, r: 6, ai: 'fly' },
  feather: { n: 'Feather Fiend', hp: 9, spd: 64, dmg: 7, xp: 1, r: 9, ai: 'fly' }, corkbot: { n: 'Corkbot', hp: 22, spd: 38, dmg: 8, xp: 2, r: 9, ai: 'shoot', shot: 'cork', cd: 3.2 },
  jelly: { n: 'Jelly', hp: 18, spd: 44, dmg: 7, xp: 2, r: 9, split: 2 }, blumling: { n: 'Blumling', hp: 10, spd: 62, dmg: 7, xp: 1, r: 9 },
  blumeye: { n: 'Blum Eye', hp: 14, spd: 34, dmg: 8, xp: 2, r: 11, ai: 'shoot', shot: 'goo', cd: 2.8, fly: 1 }, blumguard: { n: 'Lair Guard', hp: 56, spd: 34, dmg: 12, xp: 5, r: 12, arm: 0.6 },
  blumspore: { n: 'Blum Spore', hp: 22, spd: 22, dmg: 8, xp: 2, r: 11, pop: 8 }, goohound: { n: 'Goo Hound', hp: 24, spd: 58, dmg: 9, xp: 2, r: 11, ai: 'dash' },
  harpy: { n: 'Harpy', hp: 14, spd: 64, dmg: 9, xp: 2, r: 12, ai: 'fly' }, stormling: { n: 'Stormling', hp: 18, spd: 40, dmg: 8, xp: 2, r: 11, ai: 'shoot', shot: 'bolt', cd: 2.6, fly: 1 },
  cultist: { n: 'Cultist', hp: 24, spd: 34, dmg: 9, xp: 3, r: 10, ai: 'shoot', shot: 'orb', cd: 3 }
};
/* the big foes. move lists are their attacks, picked in turn */
var BOSSES = {
  ratking: { n: 'Cult of the Rat', hp: 1, moves: ['summon', 'ring', 'charge'], summon: 'rat', song: 'brat', spd: 48 },
  sperm: { n: 'The Sperminator', hp: 1, moves: ['aim', 'charge', 'spiral'], song: 'bsperm', spd: 44 },
  kraken: { n: 'The Cream Kraken', hp: 2.4, moves: ['ring', 'summon', 'spiral', 'slam', 'aim'], summon: 'creamblob', song: 'boss', spd: 36 },
  cowpig: { n: 'Cow Piggy', hp: 1, moves: ['charge', 'coins', 'slam'], song: 'bpig', spd: 54 },
  cake: { n: 'The Great Cake', hp: 1.1, moves: ['ring', 'summon', 'slam'], summon: 'pieling', song: 'boss', spd: 34 },
  pig: { n: 'Brothers Load Piggy', hp: 2.4, moves: ['charge', 'coins', 'slam', 'charge', 'ring'], song: 'bpig', spd: 56, brother: 'cowpig' },
  queen: { n: 'The Pale Queen', hp: 1, moves: ['spiral', 'summon', 'aim'], summon: 'wraith', song: 'boss', spd: 40 },
  execu: { n: 'Blum Executioner', hp: 1.2, moves: ['charge', 'slam', 'aim'], song: 'blum', spd: 50 },
  boner: { n: 'The Big Boner', hp: 2.4, moves: ['aim', 'slam', 'summon', 'ring', 'spiral'], summon: 'skeleton', song: 'bboner', spd: 36 },
  demon: { n: 'Legion of Semen Demon', hp: 1, moves: ['aim', 'ring', 'charge'], song: 'bdemon', spd: 60 },
  clockmouse: { n: 'Clockwork Mouse', hp: 1.1, moves: ['charge', 'charge', 'summon'], summon: 'toymouse', song: 'boss', spd: 70 },
  hotload: { n: 'The Hot Load', hp: 2.6, moves: ['slam', 'ring', 'rain', 'aim', 'spiral'], song: 'bhot', spd: 34, fire: 1 },
  stormwing: { n: 'Stormwing', hp: 1, moves: ['rain', 'charge', 'aim'], song: 'boss', spd: 66 },
  kingblum: { n: 'King Blumhead', hp: 1.3, moves: ['ring', 'summon', 'spiral', 'slam'], summon: 'blumling', song: 'blum', spd: 40 },
  beast: { n: 'Cum-starved Beast', hp: 2.6, moves: ['charge', 'summon', 'charge', 'ring', 'slam'], summon: 'bat', song: 'bbeast', spd: 62 },
  waspqueen: { n: 'Wasp Queen', hp: 1, moves: ['summon', 'aim', 'charge'], summon: 'wasp', song: 'boss', spd: 60 },
  rotmother: { n: 'Rot Mother', hp: 1.2, moves: ['summon', 'ring', 'slam'], summon: 'rotfly', song: 'boss', spd: 32 },
  sirj: { n: 'Sir Johnathan', hp: 2.8, moves: ['charge', 'charge', 'nap', 'slam', 'aim', 'charge'], song: 'boss', spd: 80 },
  blum: { n: 'Blumhead', hp: 1.1, moves: ['ring', 'aim', 'summon'], summon: 'blumling', song: 'blum', spd: 38 },
  blum2: { n: 'Super Blumhead', hp: 1.4, moves: ['spiral', 'ring', 'rain', 'aim'], song: 'super', spd: 46 },
  mega: { n: 'Mega Blumhead', hp: 3.2, moves: ['ring', 'spiral', 'summon', 'rain', 'slam', 'aim'], summon: 'blumeye', song: 'bmega', spd: 34 },
  moon: { n: 'The Crimson Moon', hp: 3.4, moves: ['rain', 'ring', 'spiral', 'beams', 'aim'], song: 'bmoon', spd: 30 }
};
/* ---------- the places ----------
   pool: [minute it starts, foe]. band: the playfield is a corridor (y: across, x: up and down). hazard: the place's own trap.
   friend: who is locked in a cell somewhere on the map. */
var STAGES = [
  { id: 'sewers', n: 'The Cream Sewers', tier: 1, song: 'sewer', ground: 'sewer', br: 'br_sewer', band: { y: 290 }, hazard: 'flush', minis: ['ratking', 'sperm'], boss: 'kraken', unlock: 'swarm', friend: 'tb',
    pool: [[0, 'rat'], [0, 'creamblob'], [1, 'crawler'], [2, 'cultrat'], [3, 'slime'], [4, 'bat'], [5, 'slimeY'], [6, 'crawlerN'], [7, 'jelly'], [8, 'slimeB']], tint: '#f1e0b0' },
  { id: 'park', n: 'Ejaculand After Dark', tier: 1.25, song: 'park', ground: 'park', br: 'br_park', hazard: 'coaster', minis: ['cowpig', 'cake'], boss: 'pig', unlock: 'pill', friend: 'potbelly',
    pool: [[0, 'balloon'], [0, 'crow'], [1, 'pieling'], [2, 'clown'], [3, 'bat'], [4, 'crawler'], [5, 'balloon'], [6, 'batP'], [7, 'clown'], [8, 'toymouse']], tint: '#ff2630' },
  { id: 'bone', n: 'The Bone Pit', tier: 1.55, song: 'bone', ground: 'bone', br: 'br_bone', hazard: 'hands', minis: ['queen', 'execu'], boss: 'boner', unlock: 'sausage', friend: 'saba',
    pool: [[0, 'skeleton'], [0, 'bat'], [1, 'bonehound'], [2, 'gravehand'], [3, 'wraith'], [4, 'mummy'], [5, 'crow'], [6, 'ghoul'], [7, 'bonehound'], [8, 'mummy']], tint: '#d8c8a8' },
  { id: 'furnace', n: 'The Furnace', tier: 1.9, song: 'furnace', ground: 'furnace', br: 'br_furnace', hazard: 'vents', minis: ['demon', 'clockmouse'], boss: 'hotload', unlock: 'trident', friend: 'pulsar',
    pool: [[0, 'emberbat'], [0, 'magmaslug'], [1, 'imp'], [2, 'slimeR'], [3, 'corkbot'], [4, 'golem'], [5, 'emberbat'], [6, 'imp'], [7, 'golem'], [8, 'slimeR']], tint: '#ff9a30' },
  { id: 'castle', n: "Cumhead's Castle", tier: 2.3, song: 'castle', ground: 'castle', br: 'br_castle', band: { x: 330 }, hazard: 'chand', minis: ['stormwing', 'kingblum'], boss: 'beast', unlock: 'sirj', friend: 'greebo',
    pool: [[0, 'bat'], [0, 'ghoul'], [1, 'knight'], [2, 'vampire'], [3, 'wraith'], [4, 'gargoyle'], [5, 'jailer'], [6, 'batP'], [7, 'knight'], [8, 'jailer']], tint: '#c4121c' },
  { id: 'picnic', n: "Greebo's Picnic", tier: 2.75, song: 'sspicnic', ground: 'picnic', br: 'br_picnic', hazard: 'pins', minis: ['waspqueen', 'rotmother'], boss: 'sirj', unlock: 'hom', friend: 'amy',
    pool: [[0, 'ant'], [0, 'wasp'], [1, 'toymouse'], [2, 'pieling'], [3, 'rollingpin'], [4, 'thornling'], [5, 'rotfly'], [6, 'feather'], [7, 'rollingpin'], [8, 'thornling']], tint: '#9aff5a' },
  { id: 'lair', n: "Blumhead's Lair", tier: 3.25, song: 'lair', ground: 'lair', br: 'br_lair', hazard: 'goo', minis: ['blum', 'blum2'], boss: 'mega', unlock: null, friend: 'ali',
    pool: [[0, 'blumling'], [0, 'blumeye'], [1, 'jelly'], [2, 'goohound'], [3, 'blumspore'], [4, 'blumguard'], [5, 'slimeP'], [6, 'goohound'], [7, 'blumguard'], [8, 'blumeye']], tint: '#c08aff' },
  { id: 'moon', n: 'The Crimson Moon', tier: 3.8, song: 'moonarea', ground: 'moon', br: 'br_moon', hazard: 'meteors', minis: ['?', '?'], boss: 'moon', unlock: null, friend: 'joff',
    pool: [[0, 'harpy'], [0, 'feather'], [1, 'stormling'], [2, 'cultist'], [3, 'wraith'], [4, 'gargoyle'], [5, 'vampire'], [6, 'harpy'], [7, 'cultist'], [8, 'gargoyle']], tint: '#ff2630' }
];
var STAGE = {}; STAGES.forEach(function (s, i) { s.i = i; STAGE[s.id] = s; });
function stageOpen(i) { return i === 0 || !!SV.cleared[STAGES[i - 1].id]; }

/* ---------- friends locked in cells (one per place). Freeing one is for good: a small gift every run after ---------- */
var TBQUOTES = ['"Fuck muck"', '"Shithead Laboozie"', '"let me tighten that kynodesme"', '"dick skin"', '"whyma wimina"', '"suck your own and fuck your own"', '"suck me fuck me suck me fuck me"', '"I got lotion on my dick I\'m out here shooting my shit I\'m free man for real!"', '"Old geezer, Prick teaser"', '"I made muckies..."', '"a sissy doesn\'t deserve pleasure, a sissy is someone plaything"'];
var FRIENDS = {
  tb: { n: 'TB', spr: 'npc_tb', q: null, gift: '+1 reroll every run', f: function (s) { s.rerolls += 1; } },
  potbelly: { n: 'Potbelly', spr: 'npc_potbelly', q: '"Cabinets are free, kid. Play all you like."', gift: '+10% drops', f: function (s) { s.greed += 0.1; } },
  saba: { n: 'Saba', spr: 'npc_saba', q: '"Hitless runs only. Take a look, my friend."', gift: '+1 armour', f: function (s) { s.armour += 1; } },
  pulsar: { n: 'PulsarOctopus', spr: 'npc_pulsar', q: '"Just vibes, friend. Free of charge."', gift: '5% faster weapons', f: function (s) { s.cool *= 0.95; } },
  greebo: { n: 'Greebo', spr: 'npc_greebo', q: '"Fresh cream pies. Don\'t ask what\'s in them."', gift: '+10% health', f: function (s) { s.hpMul += 0.1; } },
  amy: { n: 'Amy', spr: 'npc_amy', q: '"Mild, hot or dynamite?"', gift: '+5% damage', f: function (s) { s.might += 0.05; } },
  ali: { n: 'Ali', spr: 'npc_ali', q: '"Nuggets? Garlic bread? Everything is better with garlic."', gift: '+8% area', f: function (s) { s.area += 0.08; } },
  joff: { n: 'Joff', spr: 'npc_joff', q: '"Pineapple belongs on pizza. Fight me."', gift: '+1 skip every run', f: function (s) { s.skips += 1; } }
};

/* ---------- weapons. lv: what each level adds (level 1 is getting it). evo: the charm it needs at level 8 ---------- */
var WEAPONS = {
  droplet: { n: 'Cream Droplets', d: 'Fires at the nearest foe', evo: 'chilli', en: 'Cream Torrent', ed: 'A piercing stream of cream',
    lv: ['+1 droplet', '+5 damage', '+1 droplet', 'Pierces 1 more', '+1 droplet', '+5 damage', 'Pierces 1 more'] },
  tail: { n: 'Tail Slap', d: 'Slaps whatever is beside her', evo: 'shell', en: 'Tidal Tail', ed: 'Both sides, and every slap throws a wave',
    lv: ['Slaps behind too', '+6 damage', '+15% size', '+6 damage', '10% faster', '+15% size', '+8 damage'] },
  bubble: { n: 'Bubble Guard', d: 'Bubbles circle her', evo: 'cuppa', en: 'Bubble Fortress', ed: 'The bubbles never pop',
    lv: ['+1 bubble', 'Last longer', '+5 damage', '+1 bubble', 'Spin faster', '+5 damage', '+1 bubble'] },
  swarm: { n: 'Sperm Swarm', d: 'Homing sperm', evo: 'pearl', en: 'Swarm of Millions', ed: 'An endless swarm',
    lv: ['+1 sperm', '+4 damage', '+1 sperm', '15% faster', '+1 sperm', '+4 damage', '+2 sperm'] },
  puddle: { n: 'Cream Puddle', d: 'Leaves pools that burn foes', evo: 'kelp', en: 'Cream Flood', ed: 'A trail of cream that holds foes still',
    lv: ['+1 pool', 'Bigger pools', '+2 damage', 'Last longer', '+1 pool', 'Bigger pools', '+3 damage'] },
  pie: { n: "Greebo's Pies", d: 'Lobs pies high', evo: 'lungs', en: 'Pie Storm', ed: 'Pies rain from the sky',
    lv: ['+1 pie', '+10 damage', 'Bigger splat', '+1 pie', '+10 damage', '15% faster', '+1 pie'] },
  beat: { n: "Pulsar's Beat Drop", d: 'A pulse that knocks foes back', evo: 'headphones', en: 'Bass Cannon', ed: 'Huge pulses that stun',
    lv: ['Wider', '+6 damage', '15% faster', 'Wider', '+8 damage', '15% faster', 'Wider'] },
  pill: { n: "TB's Silly Pills", d: 'Pills that bounce off the edges', evo: 'lotion', en: 'Overdose', ed: 'Huge pills with silly side effects',
    lv: ['+1 pill', '+5 damage', 'Last longer', '+1 pill', '+5 damage', 'Bigger', '+1 pill'] },
  sirj: { n: 'Sir Johnathan', d: 'He pounces on foes', evo: 'cards', en: 'Nine Lives', ed: 'Nine of him',
    lv: ['+1 pounce', '+10 damage', 'Faster', '+1 pounce', '+12 damage', 'Bigger landing', '+1 pounce'] },
  hom: { n: 'Homunculus', d: 'A pet that hatches and bites', evo: 'cracker', en: 'Bloodmoon', ed: 'A grown Bloodmoon that drinks blood',
    lv: ['+5 damage', 'He grows', 'Bites faster', '+6 damage', 'He grows', 'Bites faster', '+8 damage'] },
  trident: { n: "Spermaid's Trident", d: 'Lightning on random foes', evo: 'crown', en: 'Storm of the Deep', ed: 'Every bolt chains',
    lv: ['+1 bolt', '+8 damage', 'Bigger strike', '+1 bolt', '10% faster', '+10 damage', '+2 bolts'] },
  garlic: { n: "Ali's Garlic Breath", d: 'Hurts everything close', evo: 'siren', en: 'Garlic Grub', ed: 'Huge cloud, kills in it heal',
    lv: ['Wider', '+2 damage', 'Wider', '+2 damage', 'Faster', 'Wider', '+3 damage'] },
  sausage: { n: "Amy's Sausage", d: 'Thrown, and it comes back', evo: 'boot', en: 'Meatnado', ed: 'A spinning storm of meat',
    lv: ['+1 sausage', '+8 damage', 'Bigger', '+1 sausage', '+8 damage', 'Faster', '+1 sausage'] }
};
var WID = Object.keys(WEAPONS);
var STARTWEAP = ['droplet', 'tail', 'bubble', 'puddle', 'pie', 'beat', 'garlic'];
function weapOpen(id) { if (STARTWEAP.indexOf(id) >= 0) return true; for (var i = 0; i < STAGES.length; i++) if (STAGES[i].unlock === id) return !!SV.cleared[STAGES[i].id]; return false; }
/* ---------- charms (passives), 5 levels each ---------- */
var CHARMS = {
  chilli: { n: 'Willy Chilli', d: '+10% damage', f: function (s, l) { s.might += 0.1 * l; } },
  kelp: { n: 'Kelp Armour', d: '+1 armour', f: function (s, l) { s.armour += l; } },
  lungs: { n: 'Bubble Lungs', d: '+20% health', f: function (s, l) { s.hpMul += 0.2 * l; } },
  cracker: { n: 'Cracker Tin', d: 'Heal 0.2 a second', f: function (s, l) { s.regen += 0.2 * l; } },
  headphones: { n: "Pulsar's Headphones", d: 'Weapons 8% faster', f: function (s, l) { s.cool *= Math.pow(0.92, l); } },
  shell: { n: 'Seashell', d: '+10% size', f: function (s, l) { s.area += 0.1 * l; } },
  lotion: { n: 'Lotion', d: 'Shots fly 10% faster', f: function (s, l) { s.pspd += 0.1 * l; } },
  cuppa: { n: 'Cumpuccino', d: 'Effects last 10% longer', f: function (s, l) { s.dur += 0.1 * l; } },
  pearl: { n: 'Moon Pearl', d: '+1 shot for every weapon', max: 2, f: function (s, l) { s.amount += l; } },
  siren: { n: 'Siren Song', d: 'Pick things up from 25% further', f: function (s, l) { s.magnet *= 1 + 0.25 * l; } },
  cards: { n: 'Stacked Deck', d: '+10% luck', f: function (s, l) { s.luck += 0.1 * l; } },
  crown: { n: 'Cream Crown', d: '+8% experience', f: function (s, l) { s.growth += 0.08 * l; } },
  boot: { n: "Bonjo's Boot", d: 'Swim 10% faster', f: function (s, l) { s.move += 0.1 * l; } }
};
var CID = Object.keys(CHARMS);
function charmMax(id) { return CHARMS[id].max || 5; }

/* ---------- Spermaid's Sanctum: lasting upgrades bought with drops ---------- */
var POWERS = [
  { id: 'might', n: 'Might', d: '+5% damage', max: 5, cost: 200, f: function (s, l) { s.might += 0.05 * l; } },
  { id: 'armour', n: 'Armour', d: '+1 armour', max: 3, cost: 600, f: function (s, l) { s.armour += l; } },
  { id: 'health', n: 'Max Health', d: '+10% health', max: 3, cost: 200, f: function (s, l) { s.hpMul += 0.1 * l; } },
  { id: 'regen', n: 'Recovery', d: 'Heal 0.1 a second', max: 5, cost: 200, f: function (s, l) { s.regen += 0.1 * l; } },
  { id: 'cool', n: 'Cooldown', d: 'Weapons 2.5% faster', max: 2, cost: 900, f: function (s, l) { s.cool *= Math.pow(0.975, l); } },
  { id: 'area', n: 'Area', d: '+5% size', max: 2, cost: 300, f: function (s, l) { s.area += 0.05 * l; } },
  { id: 'pspd', n: 'Speed', d: 'Shots fly 10% faster', max: 2, cost: 160, f: function (s, l) { s.pspd += 0.1 * l; } },
  { id: 'dur', n: 'Duration', d: 'Effects last 15% longer', max: 2, cost: 300, f: function (s, l) { s.dur += 0.15 * l; } },
  { id: 'amount', n: 'Amount', d: '+1 shot for every weapon', max: 1, cost: 5000, f: function (s, l) { s.amount += l; } },
  { id: 'move', n: 'Swim Speed', d: '+5% speed', max: 2, cost: 300, f: function (s, l) { s.move += 0.05 * l; } },
  { id: 'magnet', n: 'Magnet', d: 'Pick up from 25% further', max: 2, cost: 300, f: function (s, l) { s.magnet *= 1 + 0.25 * l; } },
  { id: 'luck', n: 'Luck', d: '+10% luck', max: 3, cost: 600, f: function (s, l) { s.luck += 0.1 * l; } },
  { id: 'growth', n: 'Growth', d: '+3% experience', max: 5, cost: 900, f: function (s, l) { s.growth += 0.03 * l; } },
  { id: 'greed', n: 'Greed', d: '+10% drops', max: 5, cost: 200, f: function (s, l) { s.greed += 0.1 * l; } },
  { id: 'revive', n: 'Revival', d: 'Come back once with half health', max: 1, cost: 10000, f: function (s, l) { s.revives += l; } },
  { id: 'reroll', n: 'Reroll', d: '+2 rerolls a run', max: 5, cost: 1000, f: function (s, l) { s.rerolls += 2 * l; } },
  { id: 'skip', n: 'Skip', d: '+2 skips a run', max: 5, cost: 100, f: function (s, l) { s.skips += 2 * l; } },
  { id: 'banish', n: 'Banish', d: '+1 banish a run', max: 5, cost: 100, f: function (s, l) { s.banish += l; } },
  { id: 'wave', n: 'Tidal Wave', d: 'The wave fills 15% faster', max: 3, cost: 500, f: function (s, l) { s.waveK *= Math.pow(0.85, l); } }
];
function boughtTotal() { var n = 0; for (var k in SV.ups) n += SV.ups[k]; return n; }
function powerCost(p) { var l = SV.ups[p.id] || 0; return Math.round(p.cost * (l + 1) * (1 + 0.1 * boughtTotal())); }

/* the homunculus breeds (same odds as Load Legacy) */
var HOMB = { gloop: ['Gloop', '#3fb43a'], guard: ['Bulwark', '#6a8aff'], ember: ['Embertail', '#ff7a30'], frost: ['Frostbite', '#9adfff'], volt: ['Voltling', '#ffe36a'],
  medic: ['Mendling', '#ff9ad0'], leech: ['Leechling', '#c070ff'], scout: ['Peeper', '#a6e83a'], goldie: ['Goldie', '#ffd040'], titan: ['Titan', '#ff5a90'], blood: ['Bloodmoon', '#ff2630'] };
function homPick() { var o = Object.keys(HOMB).filter(function (k) { return k !== 'gloop' && k !== 'blood'; }), r = Math.random(); if (r < 0.06) return 'blood'; return r < 0.53 ? 'gloop' : pick(o); }

/* pickups on the floor */
var PICKS = {
  cracker: { n: 'Cum Cracker', spr: 'pk_cracker', d: 'Heals 30' }, shell: { n: 'Siren Shell', spr: 'pk_shell', d: 'Pulls in every pearl' },
  cuppa: { n: 'Cumpuccino', spr: 'pk_cuppa', d: 'Ten seconds of frenzy' }, egg: { n: 'Frostbite Egg', spr: 'pk_egg', d: 'Freezes every foe' },
  scroll: { n: 'Meatnado Scroll', spr: 'pk_scroll', d: 'A meatnado tears across the screen' }, gold: { n: 'Drop', spr: 'pk_gold', d: 'Kept for the Sanctum' },
  gold2: { n: 'Bag of Drops', spr: 'pk_gold2', d: 'Kept for the Sanctum' }, chest: { n: 'Chest', spr: 'p_chest', d: 'Upgrades, and evolutions' }
};
