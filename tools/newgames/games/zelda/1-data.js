/* =====================================================================================================
   THE LEGEND OF CUMHEAD: a top-down Zelda. Blumhead has hidden the five Cum Chalices in five dungeons round Cum City.
   Update 135 (his playtest: too basic, samey, an open field, dungeons still flicked screen to screen, art clashing):
   the land is 48 walled areas laid out by hand (2-world.js) joined by passages, and the way on is shut by things only a
   dungeon's item opens: bushes (the Sausage), cracked rocks (bombs), red pegs (hit the orb past them with the Garlic
   Bread), stone eyes (the Cream Pistol), chasms (float over on the Steve Balloon) and blood boulders (the Bloodmoon
   Ring). Ledges you can hop down make the shortcuts home. Dungeons are one scrolling map of rooms (2b-dungeon.js) with
   keys, a gate that needs that dungeon's item, the Boss Key behind it and the boss. Every tile, prop and building is a
   sprite from tiles.py, drawn at the game's own pixel size.
   ===================================================================================================== */
var W = 480, H = 270, TS = 24, COLS = 20, ROWS = 10, OY = 30;
var DUNGEONS = [
  { n: 'THE CREAM SEWERS', look: 'sewer', boss: 'kraken', item: 'bread', gate: 'pegs', foes: ['creamblob', 'slime', 'rat', 'cultrat', 'bat'], song: 'sewer', rooms: 11 },
  { n: 'THE BONE PIT', look: 'skull', boss: 'boner', item: 'pistol', gate: 'eye', foes: ['skeleton', 'bonehound', 'mummy', 'bat', 'ghoul'], song: 'bone', rooms: 12 },
  { n: 'THE EJACULAND FUNHOUSE', look: 'funhouse', boss: 'pig', item: 'balloon', gate: 'pit', foes: ['clown', 'balloon', 'imp', 'ghoul', 'knight'], song: 'park', rooms: 13 },
  { n: 'THE BLOOD FACTORY', look: 'factory', boss: 'execu', item: 'ring', gate: 'heavy', foes: ['magmaslug', 'knight', 'imp', 'mummy', 'wraith'], song: 'furnace', rooms: 13 },
  { n: "BLUMHEAD'S LAIR", look: 'lair', boss: 'blum', item: null, gate: 'pit', gate2: 'heavy', foes: ['blumling', 'blumeye', 'wraith', 'knight', 'cultist'], song: 'lair', rooms: 15, seal: 4 }
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
  kraken: { n: 'THE CREAM KRAKEN', s: 'f_kraken_', hp: 22, moves: ['ring', 'aim', 'dive'], song: 'bsperm', r: 34 },
  boner: { n: 'THE BIG BONER', s: 'f_boner_', hp: 28, moves: ['spears', 'aim', 'charge'], song: 'bboner', r: 26 },
  pig: { n: 'BROTHERS LOAD PIGGY', s: 'f_pig_', hp: 32, moves: ['charge', 'coins', 'charge'], song: 'bpig', r: 26 },
  execu: { n: 'THE BLUM EXECUTIONER', s: 'f_execu_', hp: 36, moves: ['charge', 'ring', 'spears'], song: 'bbeast', r: 26 },
  blum: { n: 'BLUMHEAD', s: 'f_blum_', hp: 48, moves: ['ring', 'aim', 'charge', 'spears', 'summon'], song: 'blum', r: 26 }
};
var ITEMS = {
  sword: { n: "Amy's Sausage", d: 'Swing it with A. It cuts bushes and tall grass.', icon: 'lc_sausage' },
  bombs: { n: 'Bombs', d: 'Blow open cracked rocks and cracked walls.', icon: 'gr_bomb' },
  bread: { n: "Ali's Garlic Bread", d: 'Throw it and it comes back. It flies over the red pegs and knocks the orb behind them, stuns foes and fetches drops.', icon: 'it_bread' },
  pistol: { n: 'Cream Pistol', d: 'Shoots cream a long way. Stone eyes open when you hit them. A drop a shot.', icon: 'it_cup' },
  balloon: { n: 'Steve Balloon', d: 'Float over chasms, pits and water for a moment.', icon: 'it_balloon' },
  ring: { n: 'Bloodmoon Ring', d: 'Half damage, and the strength to shove blood boulders and heavy blocks to bits (walk into them).', icon: 'it_moon' }
};
