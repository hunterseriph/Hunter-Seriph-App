/* =====================================================================================================
   THE LEGEND OF CUMHEAD: a top-down Zelda on The Grinding of Cumhead's engine art. Blumhead has hidden the five
   Cum Chalices in five dungeons round the land outside Cum City. Walk the land (one big scrolling place since update
   134), go into every shop and cave, cut bushes, bomb cracked rocks for secrets, and clear the dungeons one by one:
   each holds a new item and a chalice. The Lair's seal opens when you hold the other four.
   ===================================================================================================== */
var W = 480, H = 270, TS = 24, COLS = 20, ROWS = 10, OY = 30;
var DUNGEONS = [
  { n: 'THE CREAM SEWERS', look: 'sewer', wx: 24, wy: 78, boss: 'kraken', item: 'bread', floor: '#3a3428', wall: '#5a4a32', water: 1, foes: ['creamblob', 'slime', 'rat', 'cultrat', 'bat'], song: 'sewer', rooms: 10 },
  { n: 'THE BONE PIT', look: 'skull', wx: 132, wy: 58, boss: 'boner', item: 'pistol', floor: '#4a4234', wall: '#7a6a52', foes: ['skeleton', 'bonehound', 'mummy', 'bat', 'ghoul'], song: 'bone', rooms: 11 },
  { n: 'THE EJACULAND FUNHOUSE', look: 'funhouse', wx: 33, wy: 25, boss: 'pig', item: 'balloon', floor: '#3a1a2a', wall: '#6a2a3a', foes: ['clown', 'balloon', 'imp', 'ghoul', 'knight'], song: 'park', rooms: 12 },
  { n: 'THE BLOOD FACTORY', look: 'factory', wx: 131, wy: 35, boss: 'execu', item: 'ring', floor: '#2a1210', wall: '#5a2218', pits: 1, foes: ['magmaslug', 'knight', 'imp', 'mummy', 'wraith'], song: 'furnace', rooms: 12 },
  { n: "BLUMHEAD'S LAIR", look: 'lair', wx: 88, wy: 23, boss: 'blum', item: null, floor: '#200410', wall: '#5a1a3a', pits: 1, foes: ['blumling', 'blumeye', 'wraith', 'knight', 'cultist'], song: 'lair', rooms: 13, seal: 4 }
];
var FOES = {
  slime: { s: 'f_slime_', hp: 2, spd: 40, ai: 'hop', dmg: 1 }, slimeB: { s: 'f_slimeB_', hp: 3, spd: 45, ai: 'hop', dmg: 1 }, creamblob: { s: 'f_creamblob_', hp: 3, spd: 45, ai: 'hop', dmg: 1 },
  bat: { s: 'f_bat_', hp: 1, spd: 70, ai: 'fly', dmg: 1 }, rat: { s: 'f_rat_', hp: 1, spd: 75, ai: 'wander', dmg: 1 }, crawler: { s: 'f_crawler_', hp: 3, spd: 35, ai: 'chase', dmg: 1 },
  cultrat: { s: 'f_cultrat_', hp: 3, spd: 30, ai: 'shoot', dmg: 1 }, skeleton: { s: 'f_skeleton_', hp: 4, spd: 30, ai: 'shoot', dmg: 2 }, bonehound: { s: 'f_bonehound_', hp: 3, spd: 70, ai: 'charge', dmg: 2 },
  mummy: { s: 'f_mummy_', hp: 6, spd: 25, ai: 'chase', dmg: 2 }, ghoul: { s: 'f_ghoul_', hp: 4, spd: 38, ai: 'chase', dmg: 2 }, clown: { s: 'f_clown_', hp: 4, spd: 35, ai: 'shoot', dmg: 2 },
  balloon: { s: 'f_balloon_', hp: 1, spd: 30, ai: 'fly', dmg: 1, pop: 1 }, imp: { s: 'f_imp_', hp: 3, spd: 45, ai: 'shoot', dmg: 1 }, knight: { s: 'f_knight_', hp: 8, spd: 32, ai: 'chase', dmg: 2, shield: 1 },
  magmaslug: { s: 'f_magmaslug_', hp: 6, spd: 22, ai: 'chase', dmg: 2 }, wraith: { s: 'f_wraith_', hp: 5, spd: 40, ai: 'fly', dmg: 2 }, blumling: { s: 'f_blumling_', hp: 3, spd: 60, ai: 'hop', dmg: 2 },
  blumeye: { s: 'f_blumeye_', hp: 5, spd: 30, ai: 'shoot', dmg: 2, nf: 3 }, cultist: { s: 'f_cultist_', hp: 5, spd: 30, ai: 'shoot', dmg: 2 }
};
var BOSSES = {
  kraken: { n: 'THE CREAM KRAKEN', s: 'f_kraken_', hp: 22, moves: ['ring', 'aim', 'dive'], song: 'bsperm', sc: 0.8 },
  boner: { n: 'THE BIG BONER', s: 'f_boner_', hp: 28, moves: ['spears', 'aim', 'charge'], song: 'bboner', sc: 0.75 },
  pig: { n: 'BROTHERS LOAD PIGGY', s: 'f_pig_', hp: 32, moves: ['charge', 'coins', 'charge'], song: 'bpig', sc: 0.7 },
  execu: { n: 'THE BLUM EXECUTIONER', s: 'f_execu_', hp: 36, moves: ['charge', 'ring', 'spears'], song: 'bbeast', sc: 0.7 },
  blum: { n: 'BLUMHEAD', s: 'f_blum_', hp: 48, moves: ['ring', 'aim', 'charge', 'spears', 'summon'], song: 'blum', sc: 0.75 }
};
var ITEMS = {
  sword: { n: "Amy's Sausage", d: 'Swing it with A.', icon: 'lc_sausage' },
  bombs: { n: 'Bombs', d: 'Blow open cracked rocks and walls.', icon: 'gr_bomb' },
  bread: { n: "Ali's Garlic Bread", d: 'Throw it and it comes back. Stuns, and grabs drops.', icon: 'it_bread' },
  pistol: { n: 'Cream Pistol', d: 'Shoots cream. Each shot costs a drop.', icon: 'it_cup' },
  balloon: { n: 'Steve Balloon', d: 'Float over pits and water for a moment.', icon: 'it_balloon' },
  ring: { n: 'Bloodmoon Ring', d: 'You take half damage.', icon: 'it_moon' }
};
var NPCSAY = {
  amy: "It's dangerous to go alone! Take this. Mild, hot or dynamite?",
  saba: "Hitless runs only. Take a look, my friend.",
  harold: "Potions? Tea? Same thing, really. Sit, sit!",
  greebo: "Fresh cream pies. Don't ask what's in them.",
  spermaid: "Sweetie! Even down here I keep a little stall.",
  tb: "suck your own and fuck your own"
};
