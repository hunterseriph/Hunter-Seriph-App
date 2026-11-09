/* =====================================================================================================
   PSYCHO NIGHTMARE: the numbers. Four floors of TB's basement (you start at the bottom, B4, and climb out),
   the weapons, TB's boys, the Silly Pills, the notes TB left lying about.
   ===================================================================================================== */
var SAVE_KEY = 'pn-save';
var TSZ = 2.4, CEIL = 3.0, MW = 41, MH = 41; // a tile is 2.4 m, the maze is 41 x 41 tiles a floor
var FLOORS = [
  { id: 'cells', n: 'B4', name: 'THE CELLS', key: 'Cell Block Key', size: 29,
    wall: 'conc', wall2: 'concd', floor: 'concf', ceil: 'ceil', room: 'brick', roomf: 'concd', fog: [0.012, 0.014, 0.012], amb: [0.05, 0.048, 0.044], lamp: [1, 0.78, 0.45],
    props: ['bed', 'bed', 'crate', 'locker', 'barrel', 'chair', 'cage', 'crate'], clutter: ['bucket', 'rags', 'bones', 'chains', 'paper', 'mattress', 'bottles', 'candles'], deco: ['blood1', 'blood2', 'g_count', 'g_tb', 'hand', 'g_run', 'smear', 'poster'],
    foes: ['gimp', 'gimp', 'gimp', 'butcher'], loot: ['plank', 'handgun', 'knife', 'ammo9', 'ammo9', 'ammo9', 'cracker', 'cracker', 'cracker', 'pill'] },
  { id: 'meat', n: 'B3', name: 'THE MEAT LOCKER', key: 'Meat Hook Key', size: 29,
    wall: 'tilew', wall2: 'tileg', floor: 'tileg', ceil: 'steel', room: 'meat', roomf: 'grate', fog: [0.03, 0.006, 0.01], amb: [0.06, 0.04, 0.045], lamp: [0.6, 0.8, 1],
    props: ['hook', 'hook', 'table', 'crate', 'barrel', 'locker', 'freezer', 'cage'], clutter: ['meatbits', 'bones', 'bucket', 'chains', 'rags', 'meatbits', 'paper'], deco: ['blood1', 'blood2', 'smear', 'hand', 'g_muck', 'g_noexit', 'poster'],
    foes: ['gimp', 'gimp', 'butcher', 'butcher', 'pusher'], loot: ['bat', 'shotgun', 'hammer', 'shells', 'shells', 'ammo9', 'ammo9', 'cracker', 'cracker', 'cuppa', 'pill', 'pill'] },
  { id: 'lab', n: 'B2', name: 'THE PILL LAB', key: 'Pill Lab Keycard', size: 29,
    wall: 'tilep', wall2: 'tilew', floor: 'checker', ceil: 'ceil', room: 'tilep', roomf: 'tilew', fog: [0.02, 0.008, 0.03], amb: [0.06, 0.045, 0.07], lamp: [1, 0.45, 0.85],
    props: ['shelf', 'shelf', 'table', 'bed', 'locker', 'crate', 'vat', 'freezer'], clutter: ['pillpot', 'syringes', 'pillpot', 'paper', 'bottles', 'tv', 'bucket'], deco: ['g_pills', 'g_smile', 'poster2', 'blood2', 'g_suck', 'smear', 'poster2'],
    foes: ['gimp', 'pusher', 'pusher', 'pusher', 'butcher', 'gimp'], loot: ['rifle', 'fireaxe', 'riflea', 'riflea', 'shells', 'ammo9', 'ammo9', 'cracker', 'cracker', 'cuppa', 'cuppa', 'pill', 'pill', 'pill'] },
  { id: 'bar', n: 'B1', name: 'THE CELLAR BAR', key: "TB's Front Door Key", size: 29, hench: 'muckies',
    wall: 'velvet', wall2: 'brick', floor: 'wood', ceil: 'ceil', room: 'wallpaper', roomf: 'checker', fog: [0.025, 0.012, 0.006], amb: [0.065, 0.045, 0.035], lamp: [1, 0.55, 0.25],
    props: ['keg', 'keg', 'crate', 'table', 'chair', 'locker', 'barrel', 'speaker', 'sofa', 'jukebox'], clutter: ['bottles', 'glasses', 'bottles', 'paper', 'candles', 'tv', 'rags', 'glasses'], deco: ['g_bro', 'poster', 'g_tb', 'blood1', 'g_suck', 'g_muck', 'smear', 'poster2'],
    foes: ['gimp', 'gimp', 'butcher', 'butcher', 'pusher', 'pusher', 'gimp'], loot: ['ammo9', 'ammo9', 'shells', 'shells', 'riflea', 'cracker', 'cracker', 'cracker', 'cuppa', 'pill', 'pill'] },
  /* past the basement: out of the club, the getaway, the woods, Clubhouse Row's red light district, the Clubhouse itself */
  { id: 'drive', n: '', name: 'THE GETAWAY', kind: 'drive', fog: [0.03, 0.006, 0.012], amb: [0.1, 0.06, 0.07], lamp: [1, 0.5, 0.3] },
  { id: 'woods', n: '', name: 'THE WOODS', kind: 'woods', key: '', hench: 'stag', wall: 'bark', wall2: 'bark', floor: 'grass', ceil: 'ceil', room: 'bark', roomf: 'dirt', fog: [0.01, 0.018, 0.016], amb: [0.07, 0.085, 0.095], lamp: [1, 0.55, 0.25],
    props: ['log', 'stump', 'rock', 'tent', 'stump', 'rock'], deco: [], foes: ['gimp', 'gimp', 'butcher', 'pusher', 'gimp'], loot: ['ammo9', 'ammo9', 'shells', 'riflea', 'cracker', 'cracker', 'cuppa', 'pill', 'knife', 'hammer'] },
  { id: 'park', n: '', name: 'EJACULAND', kind: 'park', key: '', size: 49, hench: 'smiles', fog: [0.035, 0.008, 0.02], amb: [0.085, 0.05, 0.07], lamp: [1, 0.2, 0.25],
    props: ['stall', 'bin', 'clownhead', 'teacup', 'barrier', 'popcorn'], foes: ['clown', 'pieclown', 'strongman', 'acrobat', 'clown', 'pieclown', 'acrobat', 'clown', 'strongman', 'gimp', 'pieclown', 'acrobat'], loot: ['ammo9', 'ammo9', 'shells', 'shells', 'riflea', 'cracker', 'cracker', 'cuppa', 'cuppa', 'pill', 'bat', 'fireaxe'] },
  { id: 'flume', n: '', name: 'THE LOAD FLUME', kind: 'ride', ride: 'flume', fog: [0.006, 0.004, 0.008], amb: [0.03, 0.025, 0.03], lamp: [1, 0.85, 0.6] },
  { id: 'haunt', n: '', name: 'THE HAUNTED HOUSE', kind: 'ride', ride: 'haunt', fog: [0.012, 0.004, 0.012], amb: [0.04, 0.02, 0.04], lamp: [0.6, 1, 0.5] },
  { id: 'coaster', n: '', name: 'THE CRIMSON COASTER', kind: 'ride', ride: 'coaster', fog: [0.05, 0.01, 0.025], amb: [0.1, 0.05, 0.07], lamp: [1, 0.2, 0.25] },
  /* CUM CITY, five big parts one after another: the red light district (TB crashes into T's Hussy House half way), the
     cemetery, the cumstruction site, the cafe streets and Clubhouse Row (the Clubhouse at the end, then TB himself) */
  { id: 'redlight', n: 'CUM CITY', name: 'THE RED LIGHT DISTRICT', kind: 'district', key: '', size: 57, wall: 'citywall', wall2: 'citywall', floor: 'asphalt', ceil: 'ceil', room: 'wallpaper', roomf: 'wood', fog: [0.05, 0.004, 0.012], amb: [0.11, 0.05, 0.065], lamp: [1, 0.12, 0.2],
    city: { fronts: ['fac_bonjo', 'fac_tb'], hussy: 1, closed: 12, neons: ['n_girls', 'n_xxx', 'n_live', 'n_peep', 'n_open', 'n_heart', 'n_lips', 'n_cum'], lamps: [[1, 0.1, 0.18], [1, 0.3, 0.65]], exit: 'The neon runs out at the cemetery railings.' },
    props: ['car', 'dumpster', 'barrier', 'bin'], deco: [], foes: ['gimp', 'gimp', 'gimp', 'butcher', 'butcher', 'pusher', 'pusher', 'gimp', 'butcher', 'pusher', 'gimp', 'gimp', 'butcher', 'pusher'], loot: ['ammo9', 'ammo9', 'ammo9', 'shells', 'shells', 'riflea', 'cracker', 'cracker', 'cracker', 'cuppa', 'cuppa', 'pill', 'pill', 'knife'] },
  { id: 'cemetery', n: 'CUM CITY', name: 'THE CEMETERY', kind: 'cemetery', key: '', size: 49, burnt: 1, hench: 'bride', wall: 'stonewall', wall2: 'stonewall', floor: 'grass', ceil: 'ceil', room: 'crypt', roomf: 'stonef', fog: [0.02, 0.022, 0.03], amb: [0.075, 0.08, 0.1], lamp: [0.7, 0.85, 1],
    props: ['grave', 'grave', 'grave', 'tomb', 'angel', 'deadtree', 'grave', 'cross'], deco: [], foes: ['gimp', 'butcher', 'gimp', 'pusher', 'butcher', 'gimp', 'pusher', 'gimp', 'butcher', 'gimp'], loot: ['ammo9', 'ammo9', 'shells', 'shells', 'riflea', 'cracker', 'cracker', 'cuppa', 'pill', 'hammer', 'fireaxe'] },
  { id: 'site', n: 'CUM CITY', name: 'THE CUMSTRUCTION SITE', kind: 'site', key: '', size: 49, burnt: 1, wall: 'hoarding', wall2: 'hoarding', floor: 'dirt', ceil: 'ceil', room: 'cabin', roomf: 'plywood', fog: [0.045, 0.035, 0.015], amb: [0.15, 0.13, 0.095], lamp: [1, 0.75, 0.3],
    props: ['girders', 'pipes', 'mixer', 'cones', 'skip', 'digger', 'pallets', 'cones'], deco: [], foes: ['gimp', 'gimp', 'butcher', 'butcher', 'pusher', 'gimp', 'butcher', 'pusher', 'gimp', 'gimp', 'butcher'], loot: ['ammo9', 'ammo9', 'shells', 'shells', 'riflea', 'riflea', 'cracker', 'cracker', 'cuppa', 'pill', 'plank', 'hammer'] },
  { id: 'cafe', n: 'CUM CITY', name: 'THE CAFE STREETS', kind: 'district', key: '', size: 57, burnt: 1, wall: 'citywall', wall2: 'citywall', floor: 'cobble', ceil: 'ceil', room: 'wallpaper', roomf: 'wood', fog: [0.04, 0.016, 0.01], amb: [0.11, 0.07, 0.055], lamp: [1, 0.55, 0.25],
    city: { fronts: ['fac_cafe', 'fac_greebo', 'fac_amy', 'fac_joff', 'fac_beebs'], closed: 12, neons: ['n_open', 'n_cafe', 'n_cuppa', 'n_eat', 'n_pizza', 'n_chilli'], lamps: [[1, 0.6, 0.25], [1, 0.4, 0.2]], tables: 1, win: 'windowsw', glow: 'shopgloww', exit: 'At the end of the cafe streets the sign says CLUBHOUSE ROW.' },
    props: ['car', 'dumpster', 'barrier', 'bin'], deco: [], foes: ['gimp', 'gimp', 'butcher', 'pusher', 'gimp', 'butcher', 'pusher', 'gimp', 'gimp', 'butcher', 'pusher', 'gimp'], loot: ['ammo9', 'ammo9', 'ammo9', 'shells', 'shells', 'riflea', 'cracker', 'cracker', 'cracker', 'cuppa', 'cuppa', 'cuppa', 'pill'] },
  { id: 'district', n: 'CUM CITY', name: 'CLUBHOUSE ROW', kind: 'district', key: '', size: 57, burnt: 1, hench: 'sissifier', wall: 'citywall', wall2: 'citywall', floor: 'asphalt', ceil: 'ceil', room: 'wallpaper', roomf: 'wood', fog: [0.05, 0.004, 0.012], amb: [0.11, 0.05, 0.065], lamp: [1, 0.12, 0.2],
    city: { fronts: ['fac_saba', 'fac_pulsar', 'fac_arcade', 'fac_sanct'], club: 1, closed: 12, neons: ['n_girls', 'n_xxx', 'n_open', 'n_heart', 'n_lips', 'n_cum'], lamps: [[1, 0.1, 0.18], [1, 0.3, 0.65]] },
    props: ['car', 'dumpster', 'barrier', 'bin'], deco: [], foes: ['gimp', 'gimp', 'gimp', 'butcher', 'butcher', 'pusher', 'pusher', 'gimp', 'butcher', 'pusher', 'gimp', 'gimp', 'butcher', 'pusher', 'gimp', 'butcher'], loot: ['ammo9', 'ammo9', 'ammo9', 'ammo9', 'shells', 'shells', 'shells', 'riflea', 'riflea', 'cracker', 'cracker', 'cracker', 'cracker', 'cuppa', 'cuppa', 'pill', 'pill'] },
  { id: 'boss', n: 'CUM CITY', name: 'THE CLUBHOUSE', kind: 'boss', key: '', wall: 'citywall', wall2: 'citywall', floor: 'asphalt', ceil: 'ceil', room: 'citywall', roomf: 'pave', fog: [0.06, 0.004, 0.01], amb: [0.14, 0.06, 0.07], lamp: [1, 0.12, 0.18],
    props: [], deco: [], foes: [], loot: ['ammo9', 'ammo9', 'shells', 'riflea', 'cracker', 'cracker', 'cuppa'] }
];
var BASEMENT = 4; // floors 0-3 are the basement
/* weapons. melee: reach and swing; guns: ammo type, spread, pellets, how loud (metres TB hears it from) */
var WEAP = {
  bag: { n: 'Flaming Bag of Shit', short: 'FLAMING BAG', throw: 1, rate: 0.85, noise: 5 }, // Shithead Laboozie's: hits = covered in it (poison), floor = it burns there for 8 s
  fists: { n: 'Fists', melee: 1, dmg: 7, reach: 1.35, rate: 0.42, ko: 14, noise: 2 },
  plank: { n: '2x4 with a Rusty Nail', short: '2X4', melee: 1, dmg: 15, reach: 1.9, rate: 0.62, bleed: 5, bleedT: 6, ko: 8, noise: 3 },
  knife: { n: 'Knife', short: 'KNIFE', melee: 1, dmg: 11, reach: 1.35, rate: 0.3, bleed: 3, bleedT: 4, ko: 0, noise: 1, stab: 1 }, // quick and quiet; from behind it kills
  hammer: { n: 'Hammer', short: 'HAMMER', melee: 1, dmg: 19, reach: 1.6, rate: 0.58, ko: 34, noise: 3, daze: 1 }, // cracks skulls: dazes them
  fireaxe: { n: 'Fireman Axe', short: 'FIRE AXE', melee: 1, dmg: 36, reach: 2.15, rate: 1.1, bleed: 4, bleedT: 5, ko: 10, noise: 4, cleave: 1, heavy: 1 }, // slow, huge, cuts through a crowd
  bat: { n: 'Baseball Bat', short: 'BAT', melee: 1, dmg: 13, reach: 2.0, rate: 0.72, ko: 46, noise: 3 },
  handgun: { n: 'Handgun', short: 'HANDGUN', gun: 1, ammo: '9mm', dmg: 24, rate: 0.36, spread: 0.02, pellets: 1, noise: 24, kick: 0.8 },
  shotgun: { n: 'Shotgun', short: 'SHOTGUN', gun: 1, ammo: 'shells', dmg: 13, rate: 1.05, spread: 0.11, pellets: 7, noise: 34, kick: 2.2, knock: 1 },
  rifle: { n: 'Rifle', short: 'RIFLE', gun: 1, ammo: 'rifle', dmg: 80, rate: 1.35, spread: 0.004, pellets: 1, noise: 40, kick: 2.6, pierce: 1 }
};
var WORDER = ['fists', 'knife', 'plank', 'hammer', 'bat', 'fireaxe', 'bag', 'handgun', 'shotgun', 'rifle'];
var AMMO = { '9mm': { n: '9MM', give: 10 }, shells: { n: 'SHELLS', give: 5 }, rifle: { n: 'RIFLE ROUNDS', give: 4 } };
/* pickups: what you find lying about */
var LOOT = {
  plank: { n: '2x4 with a Rusty Nail', tile: 'i_plank', weap: 'plank' }, knife: { n: 'Knife', tile: 'i_knife', weap: 'knife' }, hammer: { n: 'Hammer', tile: 'i_hammer', weap: 'hammer' }, fireaxe: { n: 'Fireman Axe', tile: 'i_fireaxe', weap: 'fireaxe' }, bat: { n: 'Baseball Bat', tile: 'i_bat', weap: 'bat' },
  handgun: { n: 'Handgun', tile: 'i_handgun', weap: 'handgun', ammo: '9mm', give: 8 }, shotgun: { n: 'Shotgun', tile: 'i_shotgun', weap: 'shotgun', ammo: 'shells', give: 4 }, rifle: { n: 'Rifle', tile: 'i_riflew', weap: 'rifle', ammo: 'rifle', give: 3 },
  ammo9: { n: '9MM Rounds', tile: 'i_ammo9', ammo: '9mm' }, shells: { n: 'Shotgun Shells', tile: 'i_shells', ammo: 'shells' }, riflea: { n: 'Rifle Rounds', tile: 'i_rifle', ammo: 'rifle' },
  cracker: { n: 'Cum Cracker', tile: 'i_cracker', item: 'cracker' }, cuppa: { n: 'Cumpuccino', tile: 'i_cuppa', item: 'cuppa' }, pill: { n: "TB's Silly Pill", tile: 'i_pill', item: 'pill' },
  key: { n: 'Key', tile: 'i_key', key: 1 }, note: { n: 'A note', tile: 'i_note', note: 1 }, bag: { n: 'Your Stuff', tile: 'i_bag', bag: 1 }
};
var ITEMS = { cracker: { n: 'Cum Cracker', d: 'Heals 40.' }, cuppa: { n: 'Cumpuccino', d: 'Heals 30 and clears your head a little.' }, pill: { n: "TB's Silly Pill", d: 'Who knows. Could make you stronger. Could make it all worse.' } };
/* TB's boys. You can kill these. sight: metres they see you from in the light */
var FOES = {
  gimp: { n: 'Gimp', hp: 30, walk: 1.6, run: 3.7, dmg: 8, reach: 1.3, rate: 0.9, sight: 15, h: 1.82, ko: 60 },
  butcher: { n: 'Butcher', hp: 80, walk: 1.2, run: 2.6, dmg: 19, reach: 1.7, rate: 1.5, sight: 12, h: 2.0, ko: 130 },
  pusher: { n: 'Pill Pusher', hp: 36, walk: 1.4, run: 3.0, dmg: 6, reach: 1.4, rate: 1.1, sight: 14, h: 1.78, ko: 70, dose: 1, throws: 1 },
  /* Ejaculand's circus: what's left of the big top, still in the make-up */
  clown: { n: 'Killer Clown', hp: 34, walk: 1.7, run: 3.9, dmg: 9, reach: 1.35, rate: 0.8, sight: 15, h: 1.8, ko: 60, honk: 1 },
  pieclown: { n: 'Pie Clown', hp: 30, walk: 1.5, run: 3.3, dmg: 6, reach: 1.3, rate: 1.0, sight: 15, h: 1.75, ko: 60, throws: 1, pie: 1 }, // a pie in the face: you can't see for a bit
  strongman: { n: 'Strongman', hp: 130, walk: 1.0, run: 2.3, dmg: 24, reach: 1.9, rate: 1.8, sight: 11, h: 2.05, ko: 190, slam: 1 }, // the dumbbell comes down and the floor shakes
  acrobat: { n: 'Acrobat', hp: 26, walk: 2.0, run: 4.6, dmg: 7, reach: 1.3, rate: 0.7, sight: 16, h: 1.7, ko: 50, leap: 1 }, // springs at you from a way off
  /* the henchmen: one at the end of each part, every one of them TB's own work. The way on stays shut until they are dead */
  muckies: { n: 'Mama Muckies', hp: 520, walk: 1.0, run: 2.4, dmg: 20, reach: 2.0, rate: 1.6, sight: 14, h: 2.4, ko: 1e9, boss: 1, sc: 1.35, rad: 0.75, hr: 0.8 },
  stag: { n: 'The Stitched Stag', hp: 460, walk: 1.6, run: 4.3, dmg: 18, reach: 1.9, rate: 1.2, sight: 18, h: 2.3, ko: 1e9, boss: 1, sc: 1.25, rad: 0.6, hr: 0.65 },
  smiles: { n: 'The Smiles Twins', hp: 600, walk: 1.4, run: 3.2, dmg: 16, reach: 1.9, rate: 1.1, sight: 16, h: 2.2, ko: 1e9, boss: 1, sc: 1.25, rad: 0.7, hr: 0.75 },
  bride: { n: 'The Gravedigger Bride', hp: 560, walk: 1.3, run: 3.0, dmg: 19, reach: 2.1, rate: 1.3, sight: 16, h: 2.3, ko: 1e9, boss: 1, sc: 1.3, rad: 0.6, hr: 0.65 },
  sissifier: { n: 'The Sissifier', hp: 720, walk: 1.5, run: 3.5, dmg: 18, reach: 2.0, rate: 1.1, sight: 18, h: 2.5, ko: 1e9, boss: 1, sc: 1.4, rad: 0.6, hr: 0.7 }
};
/* TB. He cannot die. He walks, he hunts, now and then he takes his own pills and checks out for a while */
var TBK = { walk: 1.9, hunt: 2.6, chase: 3.95, sight: 20, out: [24, 40], gap: [70, 140], grab: 1.15 };
/* what a Silly Pill does to you: always more of a trip, and then either a lift or more trip */
var BUFFS = {
  gut: { n: 'IRON GUT', d: 'More health' }, rage: { n: 'PILL RAGE', d: 'Hit harder up close' }, feet: { n: 'QUICK FEET', d: 'Faster on your feet' },
  hands: { n: 'STEADY HANDS', d: 'Your shots hit harder' }, eyes: { n: 'CAT EYES', d: 'Your torch reaches further' }, lungs: { n: 'BIG LUNGS', d: 'Run for longer' }
};
var BUFFORDER = ['gut', 'rage', 'feet', 'hands', 'eyes', 'lungs'];
var TRIPMAX = 6;
var TRIPNAME = ['SOBER-ISH', 'TINGLY', 'WOBBLY', 'MELTING', 'GONE', 'BEYOND', 'TB-BRAINED'];
/* TB's quotes: exactly as he says them (one random one each time) */
var TBQUOTES = ['Fuck muck', 'Shithead Laboozie', 'let me tighten that kynodesme', 'dick skin', 'whyma wimina', 'suck your own and fuck your own', 'suck me fuck me suck me fuck me',
  "I got lotion on my dick I'm out here shooting my shit I'm free man for real!", 'Old geezer, Prick teaser', 'I made muckies...', 'a sissy doesn\'t deserve pleasure, a sissy is somebody\'s play thing',
  'you shoot real hard huh?', 'Im a fuckin piggy', 'who\'s ready for shithead pudding', 'holy shit!', 'Cock rinse', 'you suck, ill spray', 'where the fuck do you think you\'re goin? Prick!', 'Oh god im pushing piss out of my dick', 'im so fucked right now', 'who\'s ready for sissification? I\'ll make you pretty, so pretty...', 'Im a tucker fucker!'];
var TBEND = 'take it easy bro, come back again soon!';
var TBWOODS = 'make me your pretty vocaloid pig'; // what he shouts in the woods (his words, exactly)
/* what each shop in Clubhouse Row has inside (every front can be walked into; nobody is about, it's the middle of the night) */
var SHOPIN = {
  fac_cafe: { room: 'wallpaper', floor: 'checker', props: ['table', 'chair', 'table', 'chair', 'counter'], loot: ['cuppa', 'cuppa'] },
  fac_amy: { room: 'brick', floor: 'tilew', props: ['counter', 'table', 'chair', 'pot'], loot: ['cracker'] },
  fac_beebs: { room: 'velvet', floor: 'wood', props: ['counter', 'keg', 'keg', 'table', 'chair'], loot: ['cuppa'] },
  fac_bonjo: { room: 'velvet', floor: 'checker', props: ['rack', 'rack', 'counter', 'bed'], loot: ['pill'] },
  fac_joff: { room: 'brick', floor: 'tilew', props: ['counter', 'oven', 'table', 'chair'], loot: ['cracker'] },
  fac_saba: { room: 'wood', floor: 'wood', props: ['shelf', 'shelf', 'counter', 'crate'], loot: ['ammo9', 'shells'] },
  fac_greebo: { room: 'tilew', floor: 'checker', props: ['counter', 'oven', 'shelf', 'table'], loot: ['cracker', 'cracker'] },
  fac_pulsar: { room: 'velvet', floor: 'checker', props: ['speaker', 'speaker', 'counter', 'chair'], loot: ['riflea'] },
  fac_arcade: { room: 'wallpaper', floor: 'checker', props: ['cabinet', 'cabinet', 'cabinet', 'cabinet', 'counter'], loot: ['ammo9'] },
  fac_sanct: { room: 'tilep', floor: 'tilew', props: ['shelf', 'counter', 'shelf', 'crate'], loot: ['cuppa'] },
  fac_tb: { room: 'velvet', floor: 'wood', props: ['counter', 'keg', 'table', 'chair', 'bed'], loot: ['pill', 'pill', 'shells'] },
  fac_t: { room: 'velvet', floor: 'checker', props: ['bed', 'bed', 'rack', 'counter'], loot: ['cracker'] },
  closed: { room: 'brick', floor: 'concd', props: ['crate', 'crate', 'shelf', 'barrel'], loot: [] }
};
var INTRO = ["Cumhead only went into TB's Suck n' Fuck for one drink.", 'TB slipped him a Silly Pill. Then another. Then the whole bottle.', 'He woke up in a cell, four floors under the bar, and the walls were breathing.', 'Somewhere in the dark, TB is laughing.', 'GET OUT.'];
/* the notes, one or two on every floor: TB's own hand */
var NOTES = [
  'Rule one of the Suck n\' Fuck: nobody leaves without a smile.\nRule two: I decide what a smile is.',
  'The new guy thinks the walls are breathing.\nBro. The walls ARE breathing. I built them that way.',
  'Shopping list:\nlotion\nmore lotion\nrope\n400 Silly Pills (pink ones. NOT the yellow ones, the yellow ones make them scream in colours)',
  'The boys keep asking why I never lock the front door.\nBecause nobody ever finds it, bro. Nobody ever finds it.',
  'Note to self: the meat locker is for meat.\nStop putting guests in the meat locker.\nUnless they are meat.',
  'Every guest gets the special. Every guest comes back.\nI tell them every time. Take it easy bro. Come back again soon.',
  'Cumhead came in for ONE drink. One.\nNow he\'s my favourite guest. He doesn\'t know the stairs only go one way.',
  'If you can read this you got past my boys.\nDon\'t worry. I\'m right behind you.\nI\'m always right behind you.',
  'Pill count: 3 for a laugh. 6 for a cry. 9 and they start talking to the walls. 12 and the walls talk back.',
  'Took a handful myself last night. Saw God. He wanted a lap dance. I said take a number, bro.',
  'Gave the Gimps the night off. They didn\'t leave. They never leave. I think they like it down here.',
  'Somebody keeps writing RUN on the walls. It\'s me. I keep writing it. It\'s funnier when they do.',
  'Mama Muckies wants more bottles. I said bro, you are forty-five. He cried until the bulbs blew.\nGave him the bottles.',
  'Rule three: if a guest finds the key, move the key.\nRule four: if a guest finds the stairs, move the stairs.\nRule five: I can\'t move stairs. Hire someone who can move stairs.',
  'Dear diary. Today I made muckies. Nobody asked me to. That\'s the beauty of it.',
  'The pink ones make you happy. The blue ones make you honest. The green ones make you see me everywhere.\nI only stock the green ones now.',
  'Reminder: lotion is not a food group.\nReminder: lotion is not NOT a food group.',
  'Customer complaint: "there is a man in the walls."\nResponse: there are several men in the walls, sir. Tip your server.',
  'Bought a second fridge for the meat locker. The first fridge got lonely. I could hear it.',
  'Shithead Laboozie came in last week and set fire to the gents. Best night we ever had. Lifetime membership.',
  'If you\'re reading this, you\'ve got further than the last six. Well done, bro.\nThe last six are in the walls. Say hello.',
  'The Butchers asked for a pay rise. I gave them bigger cleavers. Nobody\'s asked since.',
  'I tried to quit the pills once. Worst eleven minutes of my life.',
  'Cum City council wrote to me about the noise. I wrote back. In the council man. With a pen.',
  'Note for the Gimps: zip UP before you go upstairs. Customers are starting to talk.',
  'The Sissifier says he\'s bored. I promised him the next pretty one. Cumhead is very pretty.',
  'Ejaculand shut down after the Load Flume incident. I still have the season pass. It still works if you climb the fence.',
  'The Smiles twins used to be two people. Then they met me.\nNow they\'re two people, but closer.',
  'Bought a deer off a guy in the woods. Sewed it onto another guy. Turned out great. The guy disagrees, but the guy is a deer now.',
  'Pill count update: 15 and you start to like it here.\n20 and you never want to leave. Nobody has ever left.',
  'Somebody keeps leaving the cellar lights on. Then off. Then on. Then they scream.\nOh. That\'s the pills. Carry on.',
  'Things that go in the Suck n\' Fuck special:\nwhisky\nmore whisky\n9 Silly Pills\na secret ingredient (it\'s me. I spit in it.)',
  'Cumhead keeps saying he only came in for one drink. Bro. Nobody comes in for one drink. You come in for ONE NIGHT. The night just doesn\'t end.',
  'The Bride buried her husband in the cemetery behind Clubhouse Row. Then dug him up. Then buried him. She does it every night. Love is beautiful.',
  'Who\'s ready for shithead pudding? Not a question. A menu item. Wednesdays.',
  'I\'m always one step behind you. Sometimes two. Never three. Three is for amateurs.',
  'Gave the Pill Pushers a training day. Lesson one: needles go IN. Lesson two: see lesson one.',
  'The walls in B3 have started sweating. I told them to stop. They told me to stop. We\'re in counselling.',
  'Clubhouse Row closes at 2. The Clubhouse never closes. I\'ve got the key. I am the key, bro.',
  'Note to the boys: if Cumhead gets out, nobody panics. I\'ll drive. I always drive.\nI\'ve never passed my test.',
  'The Cumstruction site was meant to be a second Suck n\' Fuck. Ran out of money. Spent it on pills. No regrets.',
  'Every time a guest escapes, a Gimp gets his wings.\nNo guest has ever escaped. The Gimps are very upset.',
  'Reasons to stay:\n1. the music\n2. the company\n3. the door is locked\n4. I\'m standing in front of it.',
  'Took 3 pills and watched the ceiling for 9 hours. The ceiling won. Rematch Tuesday.',
  'Strongman wants a day off. I said lift this. He lifted it. I said now put it down. He\'s still holding it. Good lad.',
  'Lost the Front Door Key again. Checked my pockets. Checked the Gimps. Checked inside the Butcher. Found two keys and a shoe.',
  'To whoever keeps eating the Cum Crackers off the floor: same. Respect.',
  'Oh god I\'m pushing piss out of my dick. Wrote it down so I\'d remember. I will never forget.',
  'Shopping list part 2:\nmore rope\nbin bags (the big ones)\nwig (blonde)\nwig (also blonde, backup)\nlipstick for the Sissifier\nmore lotion obviously',
  'You can hide in the lockers. I let you. It\'s cute. I can hear you breathing.',
  'The Pie Clowns are not funny. They have never been funny. That\'s why they kept the pies.',
  'Cock rinse. That\'s it. That\'s the note.',
  'Mood board for the new extension:\nmeat\nneon\nmore meat\nme, but bigger, on a wall, laughing',
  'The light in the corridor flickers so you think you see me. Sometimes you do. Sometimes it\'s the Gimp in the TB mask. He loves that mask.',
  'I\'m a tucker fucker. Nobody knows what it means. I don\'t either. Feels right though.',
  'Cumhead\'s mum rang. I said he\'s having the time of his life. Not technically a lie.',
  'If found, return this note to TB\'s Suck n\' Fuck. Or don\'t. You\'ll be back. They always come back.',
  'Holy shit. Holy shit. Holy shit. Took the yellow ones by mistake. Everything\'s screaming in colours again. Writing this so I know it happened.'
];
/* the notes come out in a different order every run, so nobody reads the same ones twice */
function noteDeck(seed) { var r = srand((seed || 1) * 31 + 17), a = NOTES.map(function (_, i) { return i; }); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), q = a[i]; a[i] = a[j]; a[j] = q; } return a; }
var NOTESPER = 4; // how many lie about on each part of the night
function noteFor(fi, k) { var d = noteDeck(G && G.seed), n = fi * NOTESPER + k; return d[n % d.length]; }
/* the little lines the madness whispers at you */
var WHISPERS = ['he can see you', 'the walls are hungry', 'you took the pill', 'stay a while', 'bro', 'he is behind you', 'nobody leaves', 'come back again soon', 'your hands are not your hands', 'the floor is breathing', 'one more pill', 'he knows where you are', 'smile', "it's lotion o'clock"];
