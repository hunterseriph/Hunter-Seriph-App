/* =====================================================================================================
   JOURNEY TO THE VOID: the data. The party, their skills and gear, items, every foe and boss, where they
   turn up, the towns and their people, the dungeons, and the story.
   ===================================================================================================== */
var HEROES = {
  cumhead: { name: 'Cumhead', hp: 62, mp: 10, atk: 14, def: 8, mag: 4, spd: 9, grow: { hp: 9, mp: 1.5, atk: 2.3, def: 1.6, mag: 0.6, spd: 0.8 },
    spr: { idle: 'ch_idle0', act: 'ch_attack', hurt: 'ch_hurt0', dead: 'ch_death1' }, wpn: 'fists', arm: 'tee', el: 'cream' },
  spermaid: { name: 'Spermaid', hp: 46, mp: 24, atk: 8, def: 6, mag: 14, spd: 11, grow: { hp: 6, mp: 4, atk: 1, def: 1.1, mag: 2.3, spd: 1 },
    spr: { idle: 'spermaid_s0', act: 'spermaid_s2', hurt: 'spermaid_d', dead: 'spermaid_dead' }, wpn: 'wand', arm: 'tee', el: 'water' },
  greebo: { name: 'Greebo', hp: 52, mp: 14, atk: 12, def: 7, mag: 8, spd: 14, grow: { hp: 7, mp: 2.5, atk: 1.9, def: 1.3, mag: 1.2, spd: 1.3 },
    spr: { idle: 'greebo_s0', act: 'greebo_s2', hurt: 'greebo_d', dead: 'greebo_dead' }, wpn: 'tin', arm: 'tee', el: 'pie' }
};
/* skills: lv learned, mp, target (one/all/ally/allies/self/deadally), kind, power */
var SKILLS = {
  cumhead: [
    { id: 'loadshot', n: 'Load Shot', lv: 1, mp: 3, tg: 'one', k: 'phys', pow: 1.7, el: 'cream', d: 'A hard shot of cream.' },
    { id: 'lockin', n: 'Lock In', lv: 4, mp: 5, tg: 'self', k: 'buff', d: 'Attack up by half for three turns.' },
    { id: 'burst', n: 'Cream Burst', lv: 8, mp: 10, tg: 'all', k: 'phys', pow: 1.15, el: 'cream', d: 'Cream everywhere. Hits every foe.' },
    { id: 'super', n: 'Super Load', lv: 13, mp: 18, tg: 'one', k: 'phys', pow: 3.2, el: 'cream', d: 'Everything he has.' },
    { id: 'spin', n: 'Spermhog Spin', lv: 19, mp: 26, tg: 'all', k: 'phys', pow: 2.1, el: 'cream', d: 'Curl up and roll through them all.' }],
  spermaid: [
    { id: 'mend', n: 'Mend', lv: 1, mp: 4, tg: 'ally', k: 'heal', pow: 2.2, base: 18, d: 'Heal one friend.' },
    { id: 'splash', n: 'Splash', lv: 2, mp: 4, tg: 'one', k: 'mag', pow: 2, el: 'water', d: 'A slap of sea water.' },
    { id: 'tidal', n: 'Tidal Wave', lv: 6, mp: 9, tg: 'all', k: 'mag', pow: 1.5, el: 'water', d: 'Water hits every foe.' },
    { id: 'rise', n: 'Rise', lv: 9, mp: 14, tg: 'deadally', k: 'revive', pow: 0.4, d: 'Bring a fallen friend back.' },
    { id: 'song', n: 'Sea Song', lv: 12, mp: 15, tg: 'allies', k: 'heal', pow: 1.6, base: 20, d: 'Heal the whole party.' },
    { id: 'riptide', n: 'Riptide', lv: 18, mp: 22, tg: 'all', k: 'mag', pow: 2.6, el: 'water', d: 'The deep sea, all at once.' }],
  greebo: [
    { id: 'pietoss', n: 'Pie Toss', lv: 1, mp: 3, tg: 'one', k: 'phys', pow: 1.4, el: 'pie', st: 'blind', d: 'A pie in the face. It may blind them.' },
    { id: 'swipe', n: 'Cat Swipe', lv: 4, mp: 5, tg: 'rand3', k: 'phys', pow: 0.75, d: 'Three quick swipes at random foes.' },
    { id: 'gourmet', n: 'Gourmet', lv: 7, mp: 6, tg: 'ally', k: 'heal', pow: 1.6, base: 30, cure: 1, d: 'A proper meal. Heals and cures.' },
    { id: 'steal', n: 'Pinch Drops', lv: 9, mp: 3, tg: 'one', k: 'steal', d: 'Pinch some drops off a foe.' },
    { id: 'barrage', n: 'Cream Pie Barrage', lv: 12, mp: 13, tg: 'all', k: 'phys', pow: 1.4, el: 'pie', d: 'Pies at every foe.' },
    { id: 'nine', n: 'Nine Lives', lv: 20, mp: 24, tg: 'allies', k: 'revive', pow: 0.5, d: 'Every fallen friend gets up.' }]
};
var ITEMS = {
  puff: { n: 'Cream Puff', d: 'Heals 60 HP.', price: 20, tg: 'ally', heal: 60 },
  pie: { n: 'Big Cream Pie', d: 'Heals 220 HP.', price: 90, tg: 'ally', heal: 220 },
  cuppa: { n: 'Cumpuccino', d: 'Restores 30 MP.', price: 70, tg: 'ally', mp: 30 },
  load: { n: 'Spare Load', d: 'Brings a fallen friend back with half HP.', price: 160, tg: 'deadally', revive: 0.5 },
  garlic: { n: 'Garlic Clove', d: 'Cures poison and blindness.', price: 15, tg: 'ally', cure: 1 },
  chilli: { n: 'Willy Chilli', d: '90 fire damage to one foe.', price: 45, tg: 'one', dmg: 90 },
  dyn: { n: 'Dynamite Chilli', d: '80 fire damage to every foe.', price: 140, tg: 'all', dmg: 80 },
  feast: { n: 'Clubhouse Feast', d: 'Heals the whole party fully.', price: 320, tg: 'allies', heal: 9999 },
  pizza: { n: 'Pineapple Pizza', d: 'Heals 120 HP to everyone.', price: 110, tg: 'allies', heal: 120 },
  tea: { n: 'Mad Hatter Tea', d: 'Restores 15 MP to everyone.', price: 90, tg: 'allies', mp: 15 },
  pill: { n: "TB's Silly Pill", d: 'Who knows? Could be great. Could be awful.', price: 25, tg: 'ally', pill: 1 }
};
/* gear: who can use it (w), slot, stats */
var GEAR = {
  fists: { n: 'Cream Fists', w: 'cumhead', s: 'wpn', atk: 0 }, knuckles: { n: 'Iron Knuckles', w: 'cumhead', s: 'wpn', atk: 6, price: 110 }, blade: { n: 'Castle Blade', w: 'cumhead', s: 'wpn', atk: 13 },
  spikes: { n: 'Spermhog Spikes', w: 'cumhead', s: 'wpn', atk: 19, price: 950 }, breaker: { n: 'Load Breaker', w: 'cumhead', s: 'wpn', atk: 30 },
  wand: { n: 'Shell Wand', w: 'spermaid', s: 'wpn', atk: 0, mag: 0 }, coral: { n: 'Coral Rod', w: 'spermaid', s: 'wpn', atk: 2, mag: 5, price: 130 }, tide: { n: 'Tide Staff', w: 'spermaid', s: 'wpn', atk: 4, mag: 11, price: 850 },
  trident: { n: 'Moon Trident', w: 'spermaid', s: 'wpn', atk: 8, mag: 18 },
  tin: { n: 'Pie Tin', w: 'greebo', s: 'wpn', atk: 0 }, knife: { n: "Chef's Knife", w: 'greebo', s: 'wpn', atk: 5, price: 120 }, pin: { n: 'Rolling Pin', w: 'greebo', s: 'wpn', atk: 12, price: 800 },
  cleaver: { n: 'Gourmet Cleaver', w: 'greebo', s: 'wpn', atk: 19 },
  tee: { n: 'Clubhouse Tee', w: 'all', s: 'arm', def: 0 }, apron: { n: 'Leather Apron', w: 'all', s: 'arm', def: 4, price: 90 }, vest: { n: 'Chain Vest', w: 'all', s: 'arm', def: 9, price: 420 },
  plate: { n: 'Blum Plate', w: 'all', s: 'arm', def: 15, price: 1500 }, robe: { n: 'Moon Robe', w: 'all', s: 'arm', def: 12, mag: 8 }, voidmail: { n: 'Void Mail', w: 'all', s: 'arm', def: 20, mag: 4 }
};
/* foes. lv sets their stats; weak = element that hurts them double */
var FOES = {
  bat: { n: 'Bat', s: 'f_bat_', lv: 1, weak: 'water' }, rat: { n: 'Rat', s: 'f_rat_', lv: 1, hpk: 0.7 }, slime: { n: 'Slime', s: 'f_slime_', lv: 2, weak: 'cream' }, crawler: { n: 'Crawler', s: 'f_crawler_', lv: 2 },
  ghoul: { n: 'Ghoul', s: 'f_ghoul_', lv: 3, hpk: 0.75, atkk: 0.7, sk: ['poison'] }, imp: { n: 'Imp', s: 'f_imp_', lv: 4, sk: ['fire'], weak: 'water' }, crow: { n: 'Crow', s: 'f_crow_', lv: 3 },
  knight: { n: 'Hollow Knight', s: 'f_knight_', lv: 6, defk: 1.5, weak: 'pie' }, wraith: { n: 'Wraith', s: 'f_wraith_', lv: 6, sk: ['drain'], weak: 'cream' }, gargoyle: { n: 'Gargoyle', s: 'f_gargoyle_', lv: 6, defk: 1.4 },
  creamblob: { n: 'Cream Blob', s: 'f_creamblob_', lv: 7, weak: 'pie' }, cultrat: { n: 'Rat Cultist', s: 'f_cultrat_', lv: 7, sk: ['poison'] }, jailer: { n: 'Jailer', s: 'f_jailer_', lv: 8, hpk: 1.4, sk: ['all'] },
  clown: { n: 'Pie Clown', s: 'f_clown_', lv: 9, sk: ['blind'] }, balloon: { n: 'Steve Balloon', s: 'f_balloon_', lv: 9, hpk: 0.6, sk: ['explode'] }, crawlerN: { n: 'Neon Crawler', s: 'f_crawlerN_', lv: 9 },
  skeleton: { n: 'Skeleton', s: 'f_skeleton_', lv: 11, weak: 'cream' }, bonehound: { n: 'Bone Hound', s: 'f_bonehound_', lv: 11 }, golem: { n: 'Brute', s: 'f_golem_', lv: 12, hpk: 1.6, defk: 1.3 },
  vampire: { n: 'Vampire', s: 'f_vampire_', lv: 14, sk: ['drain', 'blizzard'] }, batP: { n: 'Night Bat', s: 'f_batP_', lv: 13 }, emberbat: { n: 'Ember Bat', s: 'f_emberbat_', lv: 14, sk: ['fire'], weak: 'water' },
  magmaslug: { n: 'Magma Slug', s: 'f_magmaslug_', lv: 15, hpk: 1.4, sk: ['fire'], weak: 'water' },
  blumling: { n: 'Blumling', s: 'f_blumling_', lv: 17 }, blumeye: { n: 'Blum Eye', s: 'f_blumeye_', lv: 18, sk: ['blizzard', 'blind'] }, blumguard: { n: 'Lair Guard', s: 'f_blumguard_', lv: 19, hpk: 1.4, defk: 1.4 },
  blumspore: { n: 'Blum Spore', s: 'f_blumspore_', lv: 18, sk: ['poison', 'all'] }, spawn: { n: 'Void Spawn', s: 'jv_spawn', lv: 22, sk: ['drain', 'blizzard'], weak: 'cream' }
};
var BOSSES = {
  beast: { n: 'Cum-starved Beast', s: 'f_beast_', lv: 6, hp: 360, sk: ['all', 'roar'], song: 'bbeast' },
  ratking: { n: 'Cult of the Rat', s: 'f_ratking_', lv: 9, hp: 900, sk: ['all', 'poison', 'summon'], summon: 'rat', song: 'brat' },
  boner: { n: 'The Big Boner', s: 'f_boner_', lv: 13, hp: 1950, sk: ['all', 'roar', 'blind'], song: 'bboner' },
  moon: { n: 'The Crimson Moon', s: 'f_moon_', lv: 17, hp: 2300, sk: ['blizzard', 'all', 'fire', 'drain'], song: 'bmoon' },
  blum: { n: 'Blumhead', s: 'f_blum_', lv: 21, hp: 3600, sk: ['all', 'fire', 'summon', 'roar'], summon: 'blumling', song: 'blum', next: 'blum2' },
  blum2: { n: 'Super Blumhead', s: 'f_blum2_', lv: 23, hp: 4000, sk: ['all', 'blizzard', 'drain', 'roar'], song: 'super' },
  void: { n: 'The Void', s: 'jv_void', lv: 27, hp: 7800, sk: ['all', 'drain', 'blizzard', 'fire', 'summon', 'nothing'], summon: 'spawn', song: 'bmega' }
};
/* who turns up where */
var ZONES = {
  plains1: { lv: [1, 3], f: [['bat', 'bat'], ['slime'], ['rat', 'rat', 'rat'], ['crawler', 'bat'], ['slime', 'slime']], bg: 'waste' },
  plains2: { lv: [2, 4], f: [['crawler', 'crawler'], ['ghoul'], ['imp', 'bat'], ['crow', 'crow', 'crow'], ['ghoul', 'slime']], bg: 'waste' },
  forest: { lv: [3, 5], f: [['ghoul', 'bat'], ['imp', 'imp'], ['crow', 'ghoul', 'crow'], ['slime', 'slime', 'imp']], bg: 'forest' },
  castle: { lv: [5, 7], f: [['knight'], ['wraith', 'bat'], ['gargoyle', 'gargoyle'], ['knight', 'wraith'], ['imp', 'gargoyle', 'imp']], bg: 'castle' },
  sewer: { lv: [7, 9], f: [['creamblob', 'creamblob'], ['cultrat', 'rat', 'rat'], ['jailer'], ['cultrat', 'creamblob'], ['rat', 'rat', 'rat', 'rat']], bg: 'sewer' },
  east: { lv: [8, 11], f: [['clown', 'balloon'], ['crawlerN', 'crawlerN'], ['balloon', 'balloon', 'balloon'], ['clown', 'clown']], bg: 'park' },
  eforest: { lv: [10, 12], f: [['bonehound', 'bonehound'], ['skeleton', 'crow'], ['clown', 'bonehound']], bg: 'forest' },
  bone: { lv: [11, 13], f: [['skeleton', 'skeleton'], ['bonehound', 'skeleton'], ['golem'], ['skeleton', 'bonehound', 'skeleton']], bg: 'bone' },
  north: { lv: [13, 15], f: [['batP', 'batP', 'batP'], ['vampire'], ['emberbat', 'batP'], ['golem', 'batP']], bg: 'waste' },
  moon: { lv: [15, 17], f: [['vampire', 'emberbat'], ['magmaslug'], ['wraith', 'vampire'], ['emberbat', 'emberbat', 'emberbat'], ['gargoyle', 'magmaslug']], bg: 'moon' },
  lair: { lv: [18, 21], f: [['blumling', 'blumling', 'blumling'], ['blumeye', 'blumling'], ['blumguard'], ['blumspore', 'blumeye'], ['blumguard', 'blumling']], bg: 'lair' },
  void: { lv: [22, 25], f: [['spawn', 'spawn'], ['spawn', 'blumeye', 'spawn'], ['blumguard', 'spawn']], bg: 'void' }
};
/* dungeons: their floors in order, the zone of foes, the boss, what the chests hold, and what the boss leaves */
var DUNGEONS = {
  K: { name: "Cumhead's Castle", floors: ['castle1', 'castle2'], zone: 'castle', boss: 'beast', chests: { castle1: [['item', 'pie'], ['gear', 'apron']], castle2: [['gear', 'blade']] }, reward: { flag: 'beast', text: 'The Beast is down. Its lair held the Castle Blade.' }, song: 'castle' },
  S: { name: 'The Cream Sewers', floors: ['sewer1', 'sewer2'], zone: 'sewer', boss: 'ratking', chests: { sewer1: [['item', 'cuppa'], ['drops', 300]], sewer2: [['gear', 'coral']] }, reward: { flag: 'keyC', text: 'THE CREAM KEY. One of three.' }, song: 'sewer' },
  B: { name: 'The Bone Pit', floors: ['bone1', 'bone2'], zone: 'bone', boss: 'boner', chests: { bone1: [['item', 'load'], ['gear', 'cleaver']], bone2: [['item', 'dyn']] }, reward: { flag: 'keyB', text: 'THE BONE KEY. Two of three.' }, song: 'bone' },
  M: { name: 'The Crimson Moon', floors: ['moon1', 'moon2'], zone: 'moon', boss: 'moon', chests: { moon1: [['gear', 'robe'], ['item', 'feast']], moon2: [['gear', 'trident']] }, reward: { flag: 'keyM', text: 'THE MOON KEY. All three.' }, song: 'moonarea' },
  L: { name: "Blumhead's Lair", floors: ['lair1', 'lair2'], zone: 'lair', boss: 'blum', chests: { lair1: [['gear', 'breaker'], ['item', 'feast']], lair2: [['gear', 'voidmail']] }, reward: { flag: 'blum', text: 'Behind Blumhead, the floor opens onto nothing at all. The Void.' }, song: 'lair', need: ['keyC', 'keyB', 'keyM'] },
  V: { name: 'The Void', floors: ['void1'], zone: 'void', boss: 'void', chests: {}, reward: { flag: 'void', text: '' }, song: 'moonarea' }
};
/* the towns: big walkable places with a path, a fountain, decorations and buildings you can go into.
   Each building has a front (an LL shop facade where one exists), and an inside with its keeper and what they do. */
var BUILDINGS = {
  club: { n: 'The Clubhouse', fac: 'fac_club', keeper: null, home: 1, floor: ['#2a1418', '#3a1c20'], wall: '#1a0a0e', props: ['bed', 'bed', 'jukebox', 'plant', 'table'],
    say: [['', 'Home. The beds are made, the jukebox is on. Rest here for free, and save.']] },
  beebs: { n: "Uncle Beeb's Tavern", fac: 'fac_beebs', keeper: 'npc_beebs', who: 'Uncle Beeb', inn: 12, floor: ['#3a2410', '#2a1a0a'], wall: '#2a1608', props: ['taps', 'table', 'table', 'barrel', 'barrel'],
    say: [['Uncle Beeb', "Sit down, lad. First one's always warm."], ['Uncle Beeb', 'The old castle up north-west? Something hungry moved in. Good place to toughen up before the sewers.']] },
  cafe: { n: "Kaya & Elden's Cum Café", fac: 'fac_cafe', keeper: 'npc_kaya', helper: 'npc_elden', who: 'Kaya', shop: ['puff', 'garlic', 'cuppa', 'load'], floor: ['#2a1c14', '#c8b898'], wall: '#2a1a10', props: ['coffee', 'table', 'table', 'plant'],
    say: [['Kaya', "Welcome in! Kaya's on the coffee, Elden's on the grill."]] },
  natty: { n: 'Nattyboro Enchanting', fac: null, roof: '#5a2a8a', keeper: 'npc_nattyboro', who: 'Nattyboro', gear: ['knuckles', 'coral', 'knife'], floor: ['#1e1028', '#2a1838'], wall: '#140a1e', props: ['rack', 'rack', 'crystal'],
    say: [['Nattyboro', 'A blade without a bite is merely a stick.']] },
  saba: { n: "Saba's Hitless Hemporium", fac: 'fac_saba', keeper: 'npc_saba', who: 'Saba', gear: ['apron', 'vest'], floor: ['#1a2a14', '#24361c'], wall: '#14200e', props: ['plant', 'plant', 'rack'],
    say: [['Saba', 'Hitless runs only. Take a look, my friend.']] },
  harold: { n: "Harold's Mad Tea Party", fac: null, roof: '#2a8a6a', keeper: 'npc_harold', who: 'Harold', shop: ['cuppa', 'tea'], floor: ['#2a1a2a', '#3a243a'], wall: '#1e0e1e', props: ['tea', 'table', 'plant'],
    say: [['Harold', 'Potions? Tea? Same thing, really. Sit, sit!'], ['Harold', 'The Void? Oh, it is real. Blumhead keeps the way to it shut, deep in his lair, north of here behind the mountains.'], ['Harold', 'Three keys open his lair. A Cream Key, a Bone Key and a Moon Key. The Cream Sewers south of town, the Bone Pit past the blood sea, and the Crimson Moon up in the peaks.']] },
  amy: { n: "Amy's Willy Chilli", fac: 'fac_amy', keeper: 'npc_amy', who: 'Amy', shop: ['chilli', 'dyn'], floor: ['#1e0a0c', '#4a0e14'], wall: '#3a0a10', props: ['pots', 'table', 'table', 'jukebox'],
    say: [['Amy', 'Mild, hot or dynamite?'], ['Amy', 'Throw a chilli at anything that bites. Trust me.']] },
  joff: { n: "Joff's Pineapple Pizzaria", fac: 'fac_joff', keeper: 'npc_joff', who: 'Joff', give: 'pizza', shop: ['pizza'], floor: ['#f1e7d0', '#c4121c'], wall: '#2a0a0a', props: ['oven', 'table', 'table'],
    say: [['Joff', 'Pineapple belongs on pizza. Fight me.'], ['Joff', 'Going on a quest? Take a slice. Take two. Actually take the whole pizza.']] },
  arcade: { n: 'Potbelly Arcade', fac: 'fac_arcade', keeper: 'npc_potbelly', who: 'Potbelly', arcade: 1, floor: ['#0e0618', '#1a0e2a'], wall: '#0a0612', props: ['cabs'],
    say: [['Potbelly', 'Cabinets are free, kid. Play all you like.']] },
  tb: { n: "TB's Suck n' Fuck", fac: 'fac_tb', keeper: 'npc_tb', who: 'TB', tb: 1, shop: ['pill'], floor: ['#1a0a1a', '#2a102a'], wall: '#14060e', props: ['sofa', 'plant'] },
  bates: { n: 'Master Bates Emporium', fac: null, roof: '#3a3a3a', keeper: 'npc_masterbates', who: 'Master Bates', heal: 1, floor: ['#1a1a1a', '#262626'], wall: '#101010', props: ['mat', 'crystal'],
    say: [['Master Bates', "One must clear one's head before one proceeds."]] },
  greebo: { n: "Greebo's Gourmet Goonery", fac: 'fac_greebo', keeper: null, who: 'Greebo', shop: ['pie', 'puff'], floor: ['#140820', '#3a1a4a'], wall: '#1e0a2a', props: ['oven', 'table', 'table'], sign: 'Greebo is out on the road with you. The pies are on an honesty tray.',
    say: [['', 'A note on the counter, in Greebo\'s writing: "Fresh cream pies. Don\'t ask what\'s in them."']] },
  // Ejaculand
  steve: { n: "Steve's Park Hotel", fac: 'fac_sanct', keeper: 'steve0', who: 'Steve', inn: 30, floor: ['#1a0a10', '#2a0e18'], wall: '#12040a', props: ['bed', 'bed', 'plant'],
    say: [['Steve', 'WELCOME TO EJACULAND! THE PARK NEVER CLOSES. NEVER. EVER.']] },
  bonjo: { n: "Bonjo's BJ Boutique", fac: 'fac_bonjo', keeper: 'npc_bonjo', who: 'Bonjo', shop: ['puff', 'pie', 'cuppa', 'garlic', 'load', 'dyn', 'feast'], floor: ['#2a0a1e', '#3a1028'], wall: '#1e0614', props: ['rack', 'plant'],
    say: [['Bonjo', 'Welcome, welcome. Let me get the door.']] },
  fate: { n: "Stacked Fate's Table", fac: null, roof: '#1a1a3a', keeper: 'npc_stackedfate', who: 'Stacked Fate', gear: ['spikes', 'tide', 'pin', 'vest', 'plate'], floor: ['#0e1a14', '#14261c'], wall: '#0a120e', props: ['table', 'crystal'],
    say: [['Stacked Fate', 'The deck was never yours. Neither was your fate.']] },
  t: { n: "T's Hussy House", fac: 'fac_t', keeper: 'npc_t', who: 'T', floor: ['#2a0a14', '#3a101c'], wall: '#1e060e', props: ['sofa', 'plant', 'jukebox'],
    say: [['T', "Come in, darling. I'll get the doors."], ['T', 'The Crimson Moon sits up in the northern peaks. Take the road north from the bridge.']] },
  pulsar: { n: 'PulsarOctopus Beats', fac: 'fac_pulsar', keeper: 'npc_pulsar', who: 'PulsarOctopus', floor: ['#0a0a1e', '#14142a'], wall: '#06061a', props: ['jukebox', 'jukebox'],
    say: [['PulsarOctopus', 'Just vibes, friend. Free of charge.'], ['PulsarOctopus', 'The Bone Pit is south-east of the park. Big bones. Bigger one at the bottom.']] },
  judge: { n: 'Judgement Spells', fac: null, roof: '#8a8a8a', keeper: 'npc_judgement', who: 'Judgement', shop: ['cuppa', 'tea'], floor: ['#1a1a1a', '#e8e0d8'], wall: '#0e0e0e', props: ['crystal', 'crystal'],
    say: [['Judgement', 'Light or shadow. Both have a price.'], ['Judgement', 'The Void takes everything you throw at it. Make sure what you throw is heavy.']] },
  ali: { n: "Ali's Garlic Grub", fac: null, roof: '#4aa82a', keeper: 'npc_ali', who: 'Ali', give: 'garlic', shop: ['garlic'], floor: ['#141c0e', '#3a4a24'], wall: '#142010', props: ['pots', 'table'],
    say: [['Ali', 'Nuggets? Garlic bread? Everything is better with garlic.'], ['Ali', 'Have some cloves. For the road. For the poison. For everything.']] },
  jessiah: { n: "Jessiah's", fac: null, roof: '#8a4a1a', keeper: 'npc_jessiah', who: 'Jessiah', give: 'feast', floor: ['#2a1a0a', '#3a2410'], wall: '#1e1208', props: ['table', 'table', 'oven'],
    say: [['Jessiah', 'An empty stomach makes a hollow man. Eat.']] }
};
var TOWNSPEC = {
  C: { name: 'Clubhouse Row', song: 'town', w: 44, h: 32, rowA: ['club', 'beebs', 'cafe', 'natty', 'saba', 'harold'], rowB: ['amy', 'joff', 'arcade', 'tb', 'bates', 'greebo'], theme: 'red', start: 'club',
    folk: [{ s: 'npc_pulsar', n: 'PulsarOctopus', at: [18, 15], say: ['Just vibes, friend. Free of charge.'] }, { s: 'h_gloop_adult_idle0', n: 'Homunculus', at: [25, 12], say: ['Squeak!', 'The homunculus looks very pleased to see you.'] },
      { s: 'h_ember_adult_idle0', n: 'Homunculus', at: [10, 28], say: ['*warm squeak*'] }, { s: 'npc_elden', n: 'Elden', at: [30, 18], say: ["The grill's hot. So's the road. Buy puffs, you'll need them."] }] },
  E: { name: 'Ejaculand', song: 'park', w: 44, h: 32, rowA: ['steve', 'bonjo', 'fate', 't', 'pulsar', 'judge'], rowB: ['ali', 'jessiah'], theme: 'park', start: null,
    folk: [{ s: 'steve0', n: 'Steve', at: [21, 16], say: ['WELCOME TO EJACULAND!', 'Have you tried the Load Flume? It is VERY wet.'] }, { s: 'h_goldie_adult_idle0', n: 'Homunculus', at: [12, 13], say: ['*jingle*'] }, { s: 'npc_kaya', n: 'Kaya', at: [32, 28], say: ['Day off! Do not ask me for coffee.'] }] }
};
var TBQ = ['Fuck muck', 'Shithead Laboozie', 'let me tighten that kynodesme', 'dick skin', 'whyma wimina', 'suck your own and fuck your own', 'suck me fuck me suck me fuck me', "I got lotion on my dick I'm out here shooting my shit I'm free man for real!", 'Old geezer, Prick teaser', 'I made muckies...', 'a sissy doesn\'t deserve pleasure, a sissy is someone plaything'];
var STORY = {
  intro: [
    ['', 'Every night, the same dream. A hole in the world, blacker than Blumhead\'s heart, calling his name.'],
    ['', 'The Void.'],
    ['Spermaid', 'Sweetie, you were talking in your sleep again. Something about a void?'],
    ['Cumhead', 'It\'s real. I can feel it. Somewhere past the blood sea, past Blumhead. I\'m going to find it.'],
    ['Greebo', 'Then I\'m packing pies. Don\'t ask what\'s in them.'],
    ['Spermaid', 'And I\'m coming. Someone has to keep you two alive.'],
    ['', 'Harold in Clubhouse Row knows the old stories. Ask around town before you set out.']],
  keys3: [['', 'Three keys hum together. Far to the north, behind the mountains, something unlocks.']],
  blumPre: [['Blumhead', 'THE VOID? YOU WANT THE VOID? IT IS MINE. EVERY LOAD THAT FALLS IN THERE MAKES ME STRONGER.'], ['Cumhead', 'Then I\'ll take it off you.']],
  blumSuper: [['Blumhead', 'NOT LIKE THIS... THE LOAD... IT ANSWERS ME! RISE!']],
  voidPre: [['The Void', '...'], ['The Void', 'YOU CAME ALL THIS WAY TO LOOK INTO ME. EVERYONE DOES, IN THE END.'], ['Greebo', 'It talks. Why does it talk.'], ['The Void', 'EVERY LOAD THAT WAS NEVER SPENT. EVERY HEIR THAT NEVER CAME HOME. I AM FULL OF THEM. JOIN THEM.']],
  ending: [['', 'The Void folds in on itself and goes quiet.'], ['', 'Where it was, there is only a small warm light, like a candle in the clubhouse window.'],
    ['Spermaid', 'It wasn\'t empty after all. It was just... waiting for someone to come and look.'], ['Greebo', 'I\'m still not eating anything that came out of there.'],
    ['Cumhead', 'Let\'s go home. Uncle Beeb said the first one\'s always warm.'], ['', 'THE END. Thanks for playing Journey to the Void.']]
};
