/* =====================================================================================================
   DATA: classes, areas, enemies, bosses, the town and everything it sells
   ===================================================================================================== */
var CLASSES = {
  cumhead: { name: 'Cumhead', hp: 150, mana: 50, dmg: 12, spd: 1, jumps: 2, atk: 'shot', cd: 0.36, spec: 'splash', specCost: 30,
    pas: 'Second Wind', pd: 'Once per run a killing blow leaves you on 1 HP.', ad: 'Cream Shot: fires a load straight ahead.', sd: 'Spin Splash: eight shots burst out all around you.' },
  spermaid: { name: 'Spermaid', hp: 115, mana: 60, dmg: 10, spd: 1.05, jumps: 2, atk: 'whip', cd: 0.3, spec: 'song', specCost: 35,
    pas: 'Siren Song', pd: 'Every kill heals 3 HP. Longer safety after a hit. Hold jump in the air to float down.', ad: 'Tail Whip: slap, slap, then a tail spin that throws a wave.', sd: 'Siren Song: stuns every foe on screen and heals you.' },
  greebo: { name: 'Greebo', hp: 125, mana: 50, dmg: 15, spd: 0.92, jumps: 2, atk: 'pie', cd: 0.5, spec: 'cat', specCost: 40,
    pas: 'Sticky Fingers', pd: '+30% drops from everything.', ad: 'Cream Pie Blast: a big pie straight ahead, half the reach of Cumhead.', sd: 'Sir Johnathan: the cat tears across the room.' },
  homunculus: { name: 'Homunculus', hp: 100, mana: 70, dmg: 8, spd: 1.1, jumps: 3, atk: 'acid', cd: 0.2, spec: 'ooze', specCost: 25,
    pas: 'Little Legs', pd: 'Triple jump and a smaller body.', ad: 'Acid Spit: rapid spit that poisons.', sd: 'Ooze Shield: 3 seconds untouchable, healing as it lasts.' }
};
var CLASSORDER = ['cumhead', 'spermaid', 'greebo', 'homunculus'];

/* areas: grid offsets are in room cells. The castle is the hub of the map; the roof is above it, the dungeon below, the city to the right. */
var AREAS = {
  castle: { name: "Cumhead's Castle", sub: 'WHERE EVERY HEIR BEGINS', tier: 1, ox: 0, oy: 5, w: 7, h: 5, rooms: 22, boss: 'beast', music: 'castle',
    sky: null, tint: 'rgba(90,0,12,0.22)', e1: '#ff3a44', e2: '#7a0a12', wall: '#14060a', wall2: '#22080e', pool: [['crawler', 3], ['bat', 2], ['ghoul', 2], ['knight', 2], ['wraith', 1]] },
  roof: { name: 'Castle Roof', sub: 'ABOVE THE RED MOON', tier: 2, ox: 0, oy: 0, w: 7, h: 5, rooms: 20, boss: 'demon', music: 'roof',
    sky: 'rgba(40,0,20,0.35)', tint: 'rgba(50,10,60,0.30)', e1: '#ff5a8a', e2: '#5a0a3a', wall: null, pool: [['bat', 2], ['imp', 3], ['crawler', 1], ['ghoul', 1], ['gargoyle', 2], ['crow', 2]] },
  city: { name: 'Ejaculand', sub: 'THE PARK NEVER CLOSES', tier: 3, ox: 7, oy: 5, w: 7, h: 5, rooms: 21, boss: 'sperm', music: 'park',
    sky: 'rgba(60,0,10,0.25)', tint: 'rgba(120,10,40,0.24)', e1: '#ff2a8a', e2: '#6a0a3a', wall: null, pool: [['crawlerN', 2], ['slimeR', 2], ['imp', 1], ['golem', 1], ['batP', 1], ['clown', 2], ['balloon', 2]] },
  dungeon: { name: 'The Dungeon', sub: 'CHAINS IN THE DARK', tier: 4, ox: 0, oy: 10, w: 7, h: 5, rooms: 22, boss: 'pig', music: 'dungeon',
    sky: null, tint: 'rgba(30,0,0,0.45)', e1: '#c4121c', e2: '#3a0408', wall: '#0a0305', wall2: '#140508', pool: [['ghoul', 2], ['slime', 2], ['vampire', 2], ['golem', 1], ['bat', 1], ['jailer', 2], ['rat', 2]] }
};
AREAS.moon = { name: 'The Crimson Moon', sub: 'BEYOND THE PORTAL', tier: 5, ox: 20, oy: 0, w: 5, h: 4, rooms: 13, boss: 'moon', music: 'roof', secret: 1,
  sky: 'rgba(80,0,10,0.18)', tint: 'rgba(140,0,20,0.26)', e1: '#ff2630', e2: '#6a0a10', wall: '#0a0204', pool: [['vampire', 2], ['wraith', 2], ['gargoyle', 2], ['knight', 2], ['jailer', 1], ['clown', 1], ['imp', 1]] };
/* areas that only show up in Endless mode */
AREAS.sewer = { name: 'The Cream Sewers', sub: 'ENDLESS', tier: 2, ox: 40, oy: 0, w: 1, h: 1, rooms: 0, boss: 'ratking', music: 'dungeon', endless: 1,
  sky: null, tint: 'rgba(30,60,10,0.22)', e1: '#a6e83a', e2: '#2a4a0a', wall: '#060a04', pool: [['slime', 3], ['rat', 3], ['crawler', 1], ['imp', 1], ['jailer', 1]] };
AREAS.bone = { name: 'The Bone Pit', sub: 'ENDLESS', tier: 3, ox: 41, oy: 0, w: 1, h: 1, rooms: 0, boss: 'boner', music: 'castle', endless: 1,
  sky: null, tint: 'rgba(60,50,40,0.22)', e1: '#f1e7d0', e2: '#5a4a3a', wall: '#0c0a08', pool: [['ghoul', 3], ['knight', 2], ['wraith', 2], ['golem', 1], ['bat', 1]] };
AREAS.furnace = { name: 'The Furnace', sub: 'ENDLESS', tier: 4, ox: 42, oy: 0, w: 1, h: 1, rooms: 0, boss: 'hotload', music: 'boss', endless: 1,
  sky: null, tint: 'rgba(120,40,0,0.22)', e1: '#ffb040', e2: '#6a2000', wall: '#0c0402', pool: [['slimeR', 3], ['imp', 2], ['golem', 1], ['crawlerN', 1], ['batP', 2]] };
var ENDLESSAREAS = ['castle', 'roof', 'city', 'dungeon', 'moon', 'sewer', 'bone', 'furnace'];
var AREAORDER = ['castle', 'roof', 'city', 'dungeon'];

/* enemies: hp/dmg are tier 1 values, scaled by the area tier and New Game+ */
var ENEMIES = {
  crawler: { name: 'Crawler', ai: 'walk', hp: 14, dmg: 10, spd: 34, w: 26, h: 22, fsp: 'crawler', nf: 4, sc: 1, drops: 2 },
  crawlerN: { name: 'Neon Crawler', ai: 'walk', hp: 16, dmg: 12, spd: 52, w: 26, h: 22, fsp: 'crawlerN', nf: 4, sc: 1, drops: 2 },
  bat: { name: 'Bat', ai: 'fly', hp: 9, dmg: 8, spd: 46, w: 24, h: 15, fsp: 'bat', nf: 4, sc: 1, drops: 2 },
  batP: { name: 'Night Bat', ai: 'fly', hp: 11, dmg: 10, spd: 60, w: 24, h: 15, fsp: 'batP', nf: 4, sc: 1, drops: 2 },
  ghoul: { name: 'Ghoul', ai: 'charge', hp: 24, dmg: 14, spd: 36, w: 14, h: 26, fsp: 'ghoul', nf: 4, sc: 1, drops: 3 },
  imp: { name: 'Imp', ai: 'shoot', hp: 16, dmg: 10, spd: 40, w: 16, h: 16, fsp: 'imp', nf: 4, sc: 1, drops: 3, fly: 1 },
  golem: { name: 'Brute', ai: 'heavy', hp: 60, dmg: 20, spd: 22, w: 26, h: 30, fsp: 'golem', nf: 4, sc: 1, drops: 6, heavy: 1 },
  slime: { name: 'Slime', ai: 'hop', hp: 18, dmg: 12, spd: 70, w: 16, h: 12, fsp: 'slime', nf: 4, sc: 1, drops: 2, split: 1 },
  slimeR: { name: 'Ember Slime', ai: 'hop', hp: 20, dmg: 13, spd: 80, w: 16, h: 12, fsp: 'slimeR', nf: 4, sc: 1, drops: 2, split: 1, burn: 1 },
  vampire: { name: 'Vampire', ai: 'tele', hp: 34, dmg: 14, spd: 0, w: 16, h: 30, fsp: 'vampire', nf: 4, sc: 1, drops: 6 },
  // newer foes: each area has two of its own
  knight: { name: 'Hollow Knight', ai: 'guard', hp: 34, dmg: 14, spd: 26, w: 18, h: 32, fsp: 'knight', nf: 4, sc: 1, drops: 5, shield: 1 },
  wraith: { name: 'Wraith', ai: 'phase', hp: 20, dmg: 12, spd: 30, w: 18, h: 26, fsp: 'wraith', nf: 4, sc: 1, drops: 4, fly: 1 },
  gargoyle: { name: 'Gargoyle', ai: 'perch', hp: 26, dmg: 14, spd: 190, w: 22, h: 22, fsp: 'gargoyle', nf: 4, sc: 1, drops: 4, fly: 1 },
  crow: { name: 'Crow', ai: 'dive', hp: 8, dmg: 9, spd: 70, w: 18, h: 12, fsp: 'crow', nf: 4, sc: 1, drops: 2, fly: 1 },
  clown: { name: 'Pie Clown', ai: 'lob', hp: 22, dmg: 11, spd: 30, w: 16, h: 32, fsp: 'clown', nf: 3, sc: 1, drops: 4 },
  balloon: { name: 'Steve Balloon', ai: 'float', hp: 4, dmg: 12, spd: 22, w: 16, h: 30, fsp: 'balloon', nf: 4, sc: 1, drops: 2, fly: 1, burst: 1 },
  jailer: { name: 'Jailer', ai: 'flail', hp: 70, dmg: 18, spd: 22, w: 22, h: 36, fsp: 'jailer', nf: 4, sc: 1, drops: 7, heavy: 1 },
  rat: { name: 'Rat', ai: 'walk', hp: 6, dmg: 7, spd: 88, w: 18, h: 10, fsp: 'rat', nf: 4, sc: 1, drops: 1, pack: 3 }
};
function isFlyer(d) { return d.ai === 'fly' || d.ai === 'shoot' || !!d.fly; }

var BOSSDEF = {
  beast: { name: 'Cum-starved Beast', area: 'castle', hp: 700, dmg: 20, sp: 'f_beast_', sc: 1, w: 70, h: 44 },
  demon: { name: 'Legion of Semen Demon', area: 'roof', hp: 190, dmg: 18, sp: 'f_demon_', sc: 1, w: 34, h: 30, count: 4 },
  sperm: { name: 'The Sperminator', area: 'city', hp: 1000, dmg: 22, sp: 'f_sperm_', sc: 1, w: 36, h: 76 },
  pig: { name: 'Brothers Load Piggy', area: 'dungeon', hp: 900, dmg: 24, sp: 'f_pig_', sc: 1, w: 80, h: 48 },
  blum: { name: 'Blumhead', area: 'castle', hp: 1300, dmg: 24, sp: 'f_blum_', sc: 1, w: 56, h: 64 },
  ratking: { name: 'The Rat King', area: 'sewer', hp: 1100, dmg: 22, sp: 'f_ratking_', sc: 1, w: 80, h: 46 },
  boner: { name: 'The Big Boner', area: 'bone', hp: 1300, dmg: 24, sp: 'f_boner_', sc: 1, w: 50, h: 88 },
  hotload: { name: 'The Hot Load', area: 'furnace', hp: 1400, dmg: 26, sp: 'f_hotload_', sc: 1, w: 66, h: 66 },
  moon: { name: 'The Crimson Moon', area: 'moon', hp: 2000, dmg: 26, sp: 'f_moon_', sc: 1, w: 70, h: 76 },
  blum2: { name: 'Super Blumhead', area: 'castle', hp: 2000, dmg: 28, sp: 'f_blum2_', sc: 1, w: 70, h: 80 }
};

/* ---------- the town ---------- */
/* the Clubhouse levels: one stat per level, and every level makes the next one dearer whichever stat it went into,
   so stats rise together. No caps: the costs and the castle keep climbing for as long as you play. */
var UPGRADES = [
  { id: 'vit', name: 'Vitality', d: '+12 max HP', icon: 'elixir' },
  { id: 'str', name: 'Strength', d: '+2 damage', icon: 'cleaver' },
  { id: 'spi', name: 'Spirit', d: '+10 max mana', icon: 'sage' },
  { id: 'arm', name: 'Armour', d: 'blocks more damage (less each level)', icon: 'kite' },
  { id: 'gre', name: 'Greed', d: '+6% drops', icon: 'luck' },
  { id: 'agi', name: 'Agility', d: 'faster (less each level)', icon: 'swift' }
];
function heirLevel() { var n = 0; for (var k in META.up) n += META.up[k] || 0; return n; }
function upCost(u, lvl) { var L = heirLevel(); return Math.round((120 + 18 * L) * Math.pow(1.02, L) / 5) * 5; }
function upArm(l) { return 0.45 * (1 - Math.pow(0.96, l || 0)); }   // tends towards 45%
function upAgi(l) { return 0.3 * (1 - Math.pow(0.92, l || 0)); }    // tends towards +30%

/* buildings in the town street, left to right. cost 0 = there from the start */
var BUILDINGS = [
  { id: 'club', name: "Cumhead's Clubhouse", fac: 'fac_club', npc: null, cost: 0, kind: 'club', quote: '' },
  { id: 'greebo', name: "Greebo's Gourmet Goonery", fac: 'fac_greebo', npc: 'npc_greebo', cost: 0, kind: 'gear', quote: '"Fresh cream pies. Don\'t ask what\'s in them."' },
  { id: 'fate', name: "Stacked Fate's Table", fac: null, npc: 'npc_stackedfate', cost: 0, kind: 'fate', quote: '"The deck was never yours. Neither was your fate."' },
  { id: 'sanct', name: 'Spermaid Sanctum', fac: 'fac_sanct', npc: 'npc_spermaid', cost: 1200, kind: 'runes', quote: '' },
  { id: 'joff', name: "Joff's Pineapple Pizzaria", fac: 'fac_joff', npc: 'npc_joff', cost: 700, kind: 'prov', slot: 'food', quote: '"Pineapple belongs on pizza. Fight me."' },
  { id: 'beebs', name: "Uncle Beeb's Tavern", fac: 'fac_beebs', npc: 'npc_beebs', cost: 1000, kind: 'prov', slot: 'drink', quote: '"Sit down, lad. First one\'s always warm."' },
  { id: 'cafe', name: "Kaya & Elden's Cum Café", fac: 'fac_cafe', npc: 'npc_kaya', npc2: 'npc_elden', cost: 1300, kind: 'prov', slot: 'cafe', quote: '"Welcome in! Kaya\'s on the coffee, Elden\'s on the grill."' },
  { id: 'amy', name: "Amy's Willy Chilli", fac: 'fac_amy', npc: 'npc_amy', cost: 1700, kind: 'prov', slot: 'chilli', quote: '"Mild, hot or dynamite?"' },
  { id: 't', name: "T's Hussy House", fac: 'fac_t', npc: 'npc_t', cost: 2400, kind: 'prov', slot: 'revive', quote: '"Come in, darling. I\'ll get the doors."' },
  { id: 'saba', name: "Saba's Hitless Hemporium", fac: 'fac_saba', npc: 'npc_saba', cost: 2100, kind: 'prov', slot: 'ward', quote: '"Hitless runs only. Take a look, my friend."' },
  { id: 'arcade', name: 'Potbelly Arcade', fac: 'fac_arcade', npc: 'npc_potbelly', cost: 0, kind: 'arcade', quote: '"Cabinets are free, kid. Play all you like."' }
];
/* one-run provisions bought in town, used up when the next run starts. One per slot. */
var PROV = {
  food: [{ id: 'ppz', name: 'Pineapple on Pizza', d: '+30 max HP next run', cost: 90, icon: 'ppz', eff: { hp: 30 } },
         { id: 'hpz', name: 'Ham and Pineapple Pizza', d: '+60 max HP next run', cost: 220, icon: 'hpz', eff: { hp: 60 } }],
  drink: [{ id: 'ale', name: "Uncle Beeb's Ale", d: '+20% damage next run', cost: 160, icon: 'ale', eff: { dmgP: 0.2 } },
          { id: 'barrel', name: "Beeb's Barrel", d: '+35% damage next run', cost: 380, icon: 'brute', eff: { dmgP: 0.35 } }],
  cafe: [{ id: 'cumpuccino', name: 'Cumpuccino', d: 'Mana refills twice as fast next run', cost: 150, icon: 'cumpuccino', eff: { manaRegen: 2 } },
         { id: 'croissant', name: 'Cream Croissant', d: '+30 max mana next run', cost: 140, icon: 'croissant', eff: { mana: 30 } },
         { id: 'plate', name: "Elden's Full Plate", d: 'Regenerate 1 HP every 2 seconds next run', cost: 360, icon: 'stew', eff: { regen: 0.5 } }],
  chilli: [{ id: 'wchili', name: 'Classic Willy Chilli', d: 'Your hits set foes on fire next run', cost: 240, icon: 'wchili', eff: { burn: 1 } },
           { id: 'dchili', name: 'Dynamite Willy Chilli', d: 'Fire hits, and foes explode when they die', cost: 560, icon: 'dchili', eff: { burn: 1, boom: 1 } }],
  revive: [{ id: 'doors', name: 'Have the Doors Opened', d: 'Come back once at full HP when you die next run', cost: 500, icon: 'elixir', eff: { revive: 1 } }],
  ward: [{ id: 'hitless', name: 'Hitless Charm', d: 'The first hit in every room is cancelled next run', cost: 380, icon: 'iron', eff: { ward: 1 } }]
};
/* Greebo's gear: buy a tier and it is equipped for good */
var GEAR = {
  weapon: [{ name: 'Bone Knife', icon: 'knife', cost: 0, dmg: 0 }, { name: 'Rusty Dagger', icon: 'dagger', cost: 500, dmg: 4 }, { name: 'Night Katana', icon: 'katana', cost: 1400, dmg: 9 },
           { name: 'Moonblade', icon: 'moonblade', cost: 3200, dmg: 15 }, { name: 'Void Hammer', icon: 'voidhammer', cost: 6800, dmg: 24 }],
  armour: [{ name: 'Black Hoodie', icon: 'hoodie', cost: 0, hp: 0, arm: 0 }, { name: 'Red Jacket', icon: 'jacket', cost: 440, hp: 15, arm: 0.03 }, { name: 'Chain Vest', icon: 'vest', cost: 1300, hp: 30, arm: 0.06 },
           { name: 'Iron Plate', icon: 'plate', cost: 3000, hp: 50, arm: 0.1 }, { name: 'Moonweave', icon: 'moonweave', cost: 6000, hp: 75, arm: 0.14 }, { name: 'Void Mantle', icon: 'voidmantle', cost: 10400, hp: 110, arm: 0.18 }],
  helm: [{ name: 'Wool Cap', icon: 'wcap', cost: 0, mana: 0, crit: 0 }, { name: 'Knight Helm', icon: 'knighthelm', cost: 1000, mana: 15, crit: 0.04 }, { name: 'Moon Crown', icon: 'moonhelm', cost: 3600, mana: 30, crit: 0.08 }]
};
var GEARNAME = { weapon: 'Weapon', armour: 'Armour', helm: 'Helm' };
var RUNES = [
  { id: 'vault', name: 'Vault Rune', d: '+1 jump', cost: 1300, icon: 'swift' },
  { id: 'haste', name: 'Haste Rune', d: '+12% move speed', cost: 840, icon: 'stim' },
  { id: 'siphon', name: 'Siphon Rune', d: 'Hits give back 2 mana', cost: 1040, icon: 'sage' },
  { id: 'vamp', name: 'Vampire Rune', d: 'Heal 3% of the damage you deal', cost: 1800, icon: 'bloodpack' },
  { id: 'greed', name: 'Greed Rune', d: '+15% drops', cost: 960, icon: 'luck' },
  { id: 'grace', name: 'Grace Rune', d: 'Half a second more safety after a hit', cost: 1200, icon: 'regen' },
  { id: 'fury', name: 'Fury Rune', d: '+15% attack speed', cost: 1500, icon: 'ale' }
];
/* Stacked Fate's cards: one run-altering effect per run */
var CARDS = [
  { id: 'glass', name: 'Glass Cannon', d: '+60% damage, -40% max HP' },
  { id: 'bigload', name: 'Big Load', d: 'Double drops. Foes have +50% HP' },
  { id: 'moon', name: 'Moon Gravity', d: 'Floaty jumps. Fall slower' },
  { id: 'tiny', name: 'Tiny Heir', d: 'Smaller body and +12% speed. -20% max HP' },
  { id: 'allin', name: 'All In', d: 'You deal and take double damage' },
  { id: 'vampnight', name: 'Vampire Night', d: '6% lifesteal. Healing pickups do nothing' },
  { id: 'speed', name: 'Speed Demon', d: '+30% speed, +20% attack speed, -15% max HP' },
  { id: 'haunted', name: 'Haunted Sight', d: 'Illusion walls show themselves. +1 chest per area' },
  { id: 'hard', name: 'Hard Load', d: 'Foes hit 30% harder. Drops x1.6' },
  { id: 'blessed', name: 'Blessed', d: 'Start with a free revive and +20 max HP' }
];
/* powerups found in the castle: altars, challenge chests and merchants. Stack for the run. */
var POWERS = [
  { id: 'thick', name: 'Thick Load', d: '+20% damage', icon: 'brute' },
  { id: 'heart', name: 'Big Heart', d: '+25 max HP and heal 25', icon: 'elixir' },
  { id: 'jump', name: 'Extra Jump', d: '+1 jump', icon: 'swift' },
  { id: 'quick', name: 'Quick Hands', d: '+20% attack speed', icon: 'stim' },
  { id: 'leech', name: 'Leech', d: 'Heal 3% of damage dealt', icon: 'bloodpack' },
  { id: 'flow', name: 'Mana Flow', d: 'Mana refills faster', icon: 'sage' },
  { id: 'crit', name: 'Crit Splash', d: '+10% critical hits', icon: 'deck' },
  { id: 'greedy', name: 'Greedy', d: '+25% drops', icon: 'luck' },
  { id: 'iron', name: 'Iron Skin', d: '+8% damage blocked', icon: 'iron' },
  { id: 'swift', name: 'Swift Feet', d: '+10% move speed', icon: 'swift' },
  { id: 'thorns', name: 'Spiked Skin', d: 'Foes that bump into you get hurt', icon: 'bloodbrace' },
  { id: 'magnet', name: 'Drop Magnet', d: 'Drops fly to you from much further away', icon: 'lid' },
  { id: 'snack', name: 'Pocket Snack', d: 'Heal 4 HP every time you enter a room', icon: 'garlicbread' },
  { id: 'boots', name: 'Heavy Boots', d: 'Stomps hit twice as hard', icon: 'lgreaves' },
  { id: 'bigshot', name: 'Big Load', d: 'Bigger attacks that hit 10% harder', icon: 'maul' },
  { id: 'echo', name: 'Echo', d: '25% chance an attack goes off twice', icon: 'scrollStorm' },
  { id: 'soul', name: 'Soul Eater', d: 'Kills give back 10 mana', icon: 'holy' },
  { id: 'berserk', name: 'Berserk', d: '+40% damage while under 40% HP', icon: 'curse' },
  { id: 'lucky', name: 'Lucky Drop', d: 'Kills sometimes heal you 10%', icon: 'luck' },
  { id: 'volatile', name: 'Volatile', d: 'Foes explode when they die', icon: 'dchili' },
  { id: 'cold', name: 'Cold Touch', d: 'Hits can freeze foes for a moment', icon: 'tonic' },
  { id: 'bubble', name: 'Bubble Guard', d: 'A bubble blocks one hit, and comes back after 12 seconds', icon: 'moonaegis' },
  { id: 'slayer', name: 'Giant Slayer', d: '+35% damage to bosses', icon: 'katana' }
];
function powerById(id) { for (var i = 0; i < POWERS.length; i++) if (POWERS[i].id === id) return POWERS[i]; return null; }
/* merchant rooms: a random shopkeeper sells these for drops */
var MERCH = ['npc_joff', 'npc_beebs', 'npc_kaya', 'npc_elden', 'npc_amy', 'npc_t', 'npc_saba', 'npc_tb', 'npc_pulsar', 'npc_bonjo', 'npc_harold', 'npc_ali', 'npc_judgement', 'npc_nattyboro', 'npc_jessiah'];
var MERCHNAME = { npc_joff: 'Joff', npc_beebs: 'Uncle Beeb', npc_kaya: 'Kaya', npc_elden: 'Elden', npc_amy: 'Amy', npc_t: 'T', npc_saba: 'Saba', npc_tb: 'TB', npc_pulsar: 'Pulsar', npc_bonjo: 'Bonjo', npc_harold: 'Harold', npc_ali: 'Ali', npc_judgement: 'Judgement', npc_nattyboro: 'Nattyboro', npc_jessiah: 'Jessiah' };
