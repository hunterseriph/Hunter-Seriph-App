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
  pizza: { n: 'Pineapple Pizza', d: 'Heals 120 HP to everyone.', price: 0, tg: 'allies', heal: 120 }
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
  ghoul: { n: 'Ghoul', s: 'f_ghoul_', lv: 4, sk: ['poison'] }, imp: { n: 'Imp', s: 'f_imp_', lv: 4, sk: ['fire'], weak: 'water' }, crow: { n: 'Crow', s: 'f_crow_', lv: 3 },
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
  plains2: { lv: [3, 5], f: [['crawler', 'crawler'], ['ghoul'], ['imp', 'bat'], ['crow', 'crow', 'crow'], ['ghoul', 'slime']], bg: 'waste' },
  forest: { lv: [4, 6], f: [['ghoul', 'ghoul'], ['imp', 'imp'], ['crow', 'ghoul', 'crow'], ['slime', 'slime', 'imp']], bg: 'forest' },
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
/* the towns. h = houses (3x3), letters are people */
var TOWNS = {
  C: { name: 'Clubhouse Row', song: 'town', rows: [
    '##############################',
    '#............................#',
    '#..hhh....hhh....hhh....hhh..#',
    '#..hhh....hhh....hhh....hhh..#',
    '#..hhh....hhh....hhh....hhh..#',
    '#...b......k......n......j...#',
    '#............................#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    '#............................#',
    '#..a.....t......r....s.......#',
    '#......................p.....#',
    '#..hhh..............hhh......#',
    '#..hhh....l.........hhh....m.#',
    '#..hhh..............hhh......#',
    '#............................#',
    '##############################'],
    people: {
      b: { s: 'npc_beebs', n: 'Uncle Beeb', inn: 12, say: ['Sit down, lad. First one\'s always warm.'] },
      k: { s: 'npc_kaya', n: 'Kaya', shop: ['puff', 'garlic', 'cuppa', 'chilli', 'load'], say: ["Welcome in! Kaya's on the coffee, Elden's on the grill."] },
      n: { s: 'npc_nattyboro', n: 'Nattyboro', gear: ['knuckles', 'coral', 'knife', 'apron'], say: ['A blade without a bite is merely a stick.'] },
      j: { s: 'npc_joff', n: 'Joff', give: 'pizza', say: ['Pineapple belongs on pizza. Fight me.', 'Going on a quest? Take a slice. Take two. Actually take the whole pizza.'] },
      a: { s: 'npc_amy', n: 'Amy', say: ['Mild, hot or dynamite?', 'The Cream Sewers are south of here, past the road. Smells like my kitchen on a bad day.'] },
      t: { s: 'npc_tb', n: 'TB', tb: 1 },
      r: { s: 'npc_harold', n: 'Harold', say: ['Potions? Tea? Same thing, really. Sit, sit!', 'The Void? Oh, it is real. Blumhead keeps the way to it shut, deep in his lair, north of here behind the mountains.', 'Three keys open his lair. A Cream Key, a Bone Key and a Moon Key. Sewers, the Bone Pit past the sea, and the Crimson Moon up in the peaks.'] },
      s: { s: 'npc_saba', n: 'Saba', say: ['Hitless runs only. Take a look, my friend.', "Your old castle is north-west. Something hungry lives there now. Good place to toughen up."] },
      p: { s: 'npc_potbelly', n: 'Potbelly', say: ['Cabinets are free, kid. Play all you like.', 'Watch the bridge east. Past the blood sea it gets nasty.'] },
      l: { s: 'npc_elden', n: 'Elden', say: ["The grill's hot. So's the road. Buy puffs, you'll need them."] },
      m: { s: 'npc_masterbates', n: 'Master Bates', heal: 1, say: ['One must clear one\'s head before one proceeds.'] }
    } },
  E: { name: 'Ejaculand', song: 'park', rows: [
    '##############################',
    '#............................#',
    '#..hhh....hhh.........hhh....#',
    '#..hhh....hhh.........hhh....#',
    '#..hhh....hhh.........hhh....#',
    '#...v......o...........f.....#',
    '#............................#',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#.......u....................#',
    '#..q.............g.....w.....#',
    '#............................#',
    '#..hhh.............hhh.......#',
    '#..hhh....e........hhh.......#',
    '#..hhh.............hhh.......#',
    '#............................#',
    '##############################'],
    people: {
      v: { s: 'steve0', n: 'Steve', inn: 30, say: ['WELCOME TO EJACULAND! THE PARK NEVER CLOSES. NEVER. EVER.'] },
      o: { s: 'npc_bonjo', n: 'Bonjo', shop: ['puff', 'pie', 'cuppa', 'garlic', 'load', 'dyn', 'feast'], say: ['Welcome, welcome. Let me get the door.'] },
      f: { s: 'npc_stackedfate', n: 'Stacked Fate', gear: ['spikes', 'tide', 'pin', 'vest', 'plate'], say: ['The deck was never yours. Neither was your fate.'] },
      u: { s: 'npc_pulsar', n: 'PulsarOctopus', say: ['Just vibes, friend. Free of charge.', 'The Bone Pit is south-east of the park. Big bones. Bigger one at the bottom.'] },
      q: { s: 'npc_t', n: 'T', say: ["Come in, darling. I'll get the doors.", 'The Crimson Moon sits up in the northern peaks. Take the road north from the bridge.'] },
      g: { s: 'npc_judgement', n: 'Judgement', say: ['Light or shadow. Both have a price.', 'The Void takes everything you throw at it. Make sure what you throw is heavy.'] },
      w: { s: 'npc_ali', n: 'Ali', give: 'garlic', say: ['Nuggets? Garlic bread? Everything is better with garlic.', 'Have some cloves. For the road. For the poison. For everything.'] },
      e: { s: 'npc_jessiah', n: 'Jessiah', give: 'feast', say: ['An empty stomach makes a hollow man. Eat.'] },
    } }
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
