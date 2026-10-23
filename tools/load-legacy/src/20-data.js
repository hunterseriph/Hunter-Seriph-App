/* =====================================================================================================
   DATA: classes, areas, enemies, bosses, the town and everything it sells
   ===================================================================================================== */
var CLASSES = {
  cumhead: { name: 'Cumhead', hp: 150, mana: 50, dmg: 10, spd: 1, jumps: 2, atk: 'shot', cd: 0.36, spec: 'splash', specCost: 30,
    pas: 'Second Wind', pd: 'Once per run a killing blow leaves you on 1 HP.', ad: 'Cream Shot: fires a load straight ahead.', sd: 'Spin Splash: eight shots burst out all around you.' },
  spermaid: { name: 'Spermaid', hp: 115, mana: 60, dmg: 12, spd: 1.05, jumps: 2, atk: 'whip', cd: 0.3, spec: 'song', specCost: 35,
    pas: 'Siren Song', pd: 'Every kill heals 3 HP. Longer safety after a hit.', ad: 'Tail Whip: a fast, wide slap in front of you.', sd: 'Siren Song: stuns every foe on screen and heals you.' },
  greebo: { name: 'Greebo', hp: 125, mana: 50, dmg: 15, spd: 0.92, jumps: 2, atk: 'pie', cd: 0.5, spec: 'cat', specCost: 40,
    pas: 'Sticky Fingers', pd: '+30% drops from everything.', ad: 'Cream Pie Blast: a big pie straight ahead, half the reach of Cumhead.', sd: 'Sir Johnathan: the cat tears across the room.' },
  homunculus: { name: 'Homunculus', hp: 100, mana: 70, dmg: 8, spd: 1.1, jumps: 3, atk: 'acid', cd: 0.2, spec: 'ooze', specCost: 25,
    pas: 'Little Legs', pd: 'Triple jump and a smaller body.', ad: 'Acid Spit: rapid spit that poisons.', sd: 'Ooze Shield: 3 seconds untouchable, healing as it lasts.' }
};
var CLASSORDER = ['cumhead', 'spermaid', 'greebo', 'homunculus'];

/* areas: grid offsets are in room cells. The castle is the hub of the map; the roof is above it, the dungeon below, the city to the right. */
var AREAS = {
  castle: { name: "Cumhead's Castle", sub: 'WHERE EVERY HEIR BEGINS', tier: 1, ox: 0, oy: 4, w: 6, h: 4, rooms: 16, boss: 'beast', music: 'castle',
    sky: null, tint: 'rgba(90,0,12,0.22)', e1: '#ff3a44', e2: '#7a0a12', wall: '#14060a', wall2: '#22080e', pool: [['crawler', 3], ['bat', 2], ['ghoul', 2]] },
  roof: { name: 'Castle Roof', sub: 'ABOVE THE RED MOON', tier: 2, ox: 0, oy: 0, w: 6, h: 4, rooms: 14, boss: 'demon', music: 'roof',
    sky: 'rgba(40,0,20,0.35)', tint: 'rgba(50,10,60,0.30)', e1: '#ff5a8a', e2: '#5a0a3a', wall: null, pool: [['bat', 3], ['imp', 3], ['crawler', 1], ['ghoul', 1]] },
  city: { name: 'Ejaculand', sub: 'THE PARK NEVER CLOSES', tier: 3, ox: 6, oy: 4, w: 6, h: 4, rooms: 15, boss: 'sperm', music: 'park',
    sky: 'rgba(60,0,10,0.25)', tint: 'rgba(120,10,40,0.24)', e1: '#ff2a8a', e2: '#6a0a3a', wall: null, pool: [['crawlerN', 2], ['slimeR', 2], ['imp', 2], ['golem', 1], ['batP', 1]] },
  dungeon: { name: 'The Dungeon', sub: 'CHAINS IN THE DARK', tier: 4, ox: 0, oy: 8, w: 6, h: 4, rooms: 16, boss: 'pig', music: 'dungeon',
    sky: null, tint: 'rgba(30,0,0,0.45)', e1: '#c4121c', e2: '#3a0408', wall: '#0a0305', wall2: '#140508', pool: [['ghoul', 2], ['slime', 2], ['vampire', 2], ['golem', 2], ['bat', 1]] }
};
var AREAORDER = ['castle', 'roof', 'city', 'dungeon'];

/* enemies: hp/dmg are tier 1 values, scaled by the area tier and New Game+ */
var ENEMIES = {
  crawler: { name: 'Crawler', ai: 'walk', hp: 14, dmg: 10, spd: 34, w: 26, h: 22, proc: 'crawler', sc: 2, drops: 2 },
  crawlerN: { name: 'Neon Crawler', ai: 'walk', hp: 16, dmg: 12, spd: 52, w: 26, h: 22, proc: 'crawlerN', sc: 2, drops: 2 },
  bat: { name: 'Bat', ai: 'fly', hp: 9, dmg: 8, spd: 46, w: 24, h: 15, proc: 'bat', sc: 1.7, drops: 2 },
  batP: { name: 'Night Bat', ai: 'fly', hp: 11, dmg: 10, spd: 60, w: 24, h: 15, proc: 'batP', sc: 1.7, drops: 2 },
  ghoul: { name: 'Ghoul', ai: 'charge', hp: 24, dmg: 14, spd: 36, w: 14, h: 26, sp: 'm_ghoul', sc: 1.4, drops: 3 },
  imp: { name: 'Imp', ai: 'shoot', hp: 16, dmg: 10, spd: 40, w: 16, h: 16, sp: 'm_imp', sc: 1.3, drops: 3, fly: 1 },
  golem: { name: 'Brute', ai: 'heavy', hp: 60, dmg: 20, spd: 22, w: 26, h: 30, sp: 'm_golem', sc: 1.25, drops: 6, heavy: 1 },
  slime: { name: 'Slime', ai: 'hop', hp: 18, dmg: 12, spd: 70, w: 16, h: 12, sp: 'm_slime', sc: 1.5, drops: 2, split: 1 },
  slimeR: { name: 'Ember Slime', ai: 'hop', hp: 20, dmg: 13, spd: 80, w: 16, h: 12, sp: 'm_slimeR', sc: 1.5, drops: 2, split: 1, burn: 1 },
  vampire: { name: 'Vampire', ai: 'tele', hp: 34, dmg: 14, spd: 0, w: 16, h: 30, sp: 'm_vampire', sc: 1.3, drops: 6 }
};

var BOSSDEF = {
  beast: { name: 'Cum-starved Beast', area: 'castle', hp: 320, dmg: 18, sp: 'boss_beast', sc: 1.6, w: 70, h: 44 },
  demon: { name: 'Legion of Semen Demon', area: 'roof', hp: 90, dmg: 16, sp: 'boss_demon', sc: 1.25, w: 34, h: 30, count: 4 },
  sperm: { name: 'The Sperminator', area: 'city', hp: 480, dmg: 20, sp: 'boss_sperm', sc: 1.45, w: 36, h: 76 },
  pig: { name: 'Brothers Load Piggy', area: 'dungeon', hp: 440, dmg: 22, sp: 'boss_pig', sc: 1.5, w: 80, h: 48 },
  blum: { name: 'Blumhead', area: 'castle', hp: 700, dmg: 22, sp: 'boss_blum', sc: 3.4, w: 56, h: 64 },
  blum2: { name: 'Super Blumhead', area: 'castle', hp: 1100, dmg: 26, sp: 'boss_blum2', sc: 4.2, w: 70, h: 80 }
};

/* ---------- the town ---------- */
var UPGRADES = [
  { id: 'vit', name: 'Vitality', d: '+12 max HP', base: 60, max: 25, icon: 'elixir' },
  { id: 'str', name: 'Strength', d: '+2 damage', base: 70, max: 25, icon: 'cleaver' },
  { id: 'spi', name: 'Spirit', d: '+10 max mana', base: 60, max: 15, icon: 'sage' },
  { id: 'arm', name: 'Armour', d: '+3% damage blocked', base: 90, max: 15, icon: 'kite' },
  { id: 'gre', name: 'Greed', d: '+8% drops', base: 80, max: 12, icon: 'luck' },
  { id: 'agi', name: 'Agility', d: '+4% move speed', base: 100, max: 8, icon: 'swift' }
];
function upCost(u, lvl) { return Math.round(u.base * Math.pow(1.32, lvl) + lvl * 20); }

/* buildings in the town street, left to right. cost 0 = there from the start */
var BUILDINGS = [
  { id: 'club', name: "Cumhead's Clubhouse", fac: 'fac_club', npc: null, cost: 0, kind: 'club', quote: '' },
  { id: 'greebo', name: "Greebo's Gourmet Goonery", fac: 'fac_greebo', npc: 'npc_greebo', cost: 0, kind: 'gear', quote: '"Fresh cream pies. Don\'t ask what\'s in them."' },
  { id: 'fate', name: "Stacked Fate's Table", fac: null, npc: 'npc_stackedfate', cost: 0, kind: 'fate', quote: '"The deck was never yours. Neither was your fate."' },
  { id: 'sanct', name: 'Spermaid Sanctum', fac: 'fac_sanct', npc: 'npc_spermaid', cost: 400, kind: 'runes', quote: '' },
  { id: 'joff', name: "Joff's Pineapple Pizzaria", fac: 'fac_joff', npc: 'npc_joff', cost: 250, kind: 'prov', slot: 'food', quote: '"Pineapple belongs on pizza. Fight me."' },
  { id: 'beebs', name: "Uncle Beeb's Tavern", fac: 'fac_beebs', npc: 'npc_beebs', cost: 350, kind: 'prov', slot: 'drink', quote: '"Sit down, lad. First one\'s always warm."' },
  { id: 'cafe', name: "Kaya & Elden's Cum Café", fac: 'fac_cafe', npc: 'npc_kaya', npc2: 'npc_elden', cost: 450, kind: 'prov', slot: 'cafe', quote: '"Welcome in! Kaya\'s on the coffee, Elden\'s on the grill."' },
  { id: 'amy', name: "Amy's Willy Chilli", fac: 'fac_amy', npc: 'npc_amy', cost: 600, kind: 'prov', slot: 'chilli', quote: '"Mild, hot or dynamite?"' },
  { id: 't', name: "T's Hussy House", fac: 'fac_t', npc: 'npc_t', cost: 800, kind: 'prov', slot: 'revive', quote: '"Come in, darling. I\'ll get the doors."' },
  { id: 'saba', name: "Saba's Hitless Hemporium", fac: 'fac_saba', npc: 'npc_saba', cost: 700, kind: 'prov', slot: 'ward', quote: '"Hitless runs only. Take a look, my friend."' },
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
  weapon: [{ name: 'Bone Knife', icon: 'knife', cost: 0, dmg: 0 }, { name: 'Rusty Dagger', icon: 'dagger', cost: 250, dmg: 4 }, { name: 'Night Katana', icon: 'katana', cost: 700, dmg: 9 },
           { name: 'Moonblade', icon: 'moonblade', cost: 1600, dmg: 15 }, { name: 'Void Hammer', icon: 'voidhammer', cost: 3400, dmg: 24 }],
  armour: [{ name: 'Black Hoodie', icon: 'hoodie', cost: 0, hp: 0, arm: 0 }, { name: 'Red Jacket', icon: 'jacket', cost: 220, hp: 15, arm: 0.03 }, { name: 'Chain Vest', icon: 'vest', cost: 650, hp: 30, arm: 0.06 },
           { name: 'Iron Plate', icon: 'plate', cost: 1500, hp: 50, arm: 0.1 }, { name: 'Moonweave', icon: 'moonweave', cost: 3000, hp: 75, arm: 0.14 }, { name: 'Void Mantle', icon: 'voidmantle', cost: 5200, hp: 110, arm: 0.18 }],
  helm: [{ name: 'Wool Cap', icon: 'wcap', cost: 0, mana: 0, crit: 0 }, { name: 'Knight Helm', icon: 'knighthelm', cost: 500, mana: 15, crit: 0.04 }, { name: 'Moon Crown', icon: 'moonhelm', cost: 1800, mana: 30, crit: 0.08 }]
};
var GEARNAME = { weapon: 'Weapon', armour: 'Armour', helm: 'Helm' };
var RUNES = [
  { id: 'vault', name: 'Vault Rune', d: '+1 jump', cost: 650, icon: 'swift' },
  { id: 'haste', name: 'Haste Rune', d: '+12% move speed', cost: 420, icon: 'stim' },
  { id: 'siphon', name: 'Siphon Rune', d: 'Hits give back 2 mana', cost: 520, icon: 'sage' },
  { id: 'vamp', name: 'Vampire Rune', d: 'Heal 3% of the damage you deal', cost: 900, icon: 'bloodpack' },
  { id: 'greed', name: 'Greed Rune', d: '+15% drops', cost: 480, icon: 'luck' },
  { id: 'grace', name: 'Grace Rune', d: 'Half a second more safety after a hit', cost: 600, icon: 'regen' },
  { id: 'fury', name: 'Fury Rune', d: '+15% attack speed', cost: 750, icon: 'ale' }
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
  { id: 'swift', name: 'Swift Feet', d: '+10% move speed', icon: 'swift' }
];
function powerById(id) { for (var i = 0; i < POWERS.length; i++) if (POWERS[i].id === id) return POWERS[i]; return null; }
/* merchant rooms: a random shopkeeper sells these for drops */
var MERCH = ['npc_joff', 'npc_beebs', 'npc_kaya', 'npc_elden', 'npc_amy', 'npc_t', 'npc_saba', 'npc_tb', 'npc_pulsar', 'npc_bonjo', 'npc_harold', 'npc_ali', 'npc_judgement', 'npc_nattyboro', 'npc_jessiah'];
var MERCHNAME = { npc_joff: 'Joff', npc_beebs: 'Uncle Beeb', npc_kaya: 'Kaya', npc_elden: 'Elden', npc_amy: 'Amy', npc_t: 'T', npc_saba: 'Saba', npc_tb: 'TB', npc_pulsar: 'Pulsar', npc_bonjo: 'Bonjo', npc_harold: 'Harold', npc_ali: 'Ali', npc_judgement: 'Judgement', npc_nattyboro: 'Nattyboro', npc_jessiah: 'Jessiah' };
