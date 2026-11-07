/* =====================================================================================================
   PSYCHO NIGHTMARE: the numbers. Four floors of TB's basement (you start at the bottom, B4, and climb out),
   the weapons, TB's boys, the Silly Pills, the notes TB left lying about.
   ===================================================================================================== */
var SAVE_KEY = 'pn-save';
var TSZ = 2.4, CEIL = 3.0, MW = 41, MH = 41; // a tile is 2.4 m, the maze is 41 x 41 tiles a floor
var FLOORS = [
  { id: 'cells', n: 'B4', name: 'THE CELLS', key: 'Cell Block Key',
    wall: 'conc', wall2: 'concd', floor: 'concf', ceil: 'ceil', room: 'brick', roomf: 'concd', fog: [0.012, 0.014, 0.012], amb: [0.05, 0.048, 0.044], lamp: [1, 0.78, 0.45],
    props: ['bed', 'bed', 'crate', 'locker', 'barrel', 'chair'], deco: ['blood1', 'blood2', 'g_count', 'g_tb', 'hand', 'g_run', 'smear', 'poster'],
    foes: ['gimp', 'gimp', 'gimp', 'butcher'], loot: ['plank', 'handgun', 'ammo9', 'ammo9', 'ammo9', 'cracker', 'cracker', 'cracker', 'pill'] },
  { id: 'meat', n: 'B3', name: 'THE MEAT LOCKER', key: 'Meat Hook Key',
    wall: 'tilew', wall2: 'tileg', floor: 'tileg', ceil: 'steel', room: 'meat', roomf: 'grate', fog: [0.03, 0.006, 0.01], amb: [0.06, 0.04, 0.045], lamp: [0.6, 0.8, 1],
    props: ['hook', 'hook', 'table', 'crate', 'barrel', 'locker'], deco: ['blood1', 'blood2', 'smear', 'hand', 'g_muck', 'g_noexit', 'poster'],
    foes: ['gimp', 'gimp', 'butcher', 'butcher', 'pusher'], loot: ['bat', 'shotgun', 'shells', 'shells', 'ammo9', 'ammo9', 'cracker', 'cracker', 'cuppa', 'pill', 'pill'] },
  { id: 'lab', n: 'B2', name: 'THE PILL LAB', key: 'Pill Lab Keycard',
    wall: 'tilep', wall2: 'tilew', floor: 'checker', ceil: 'ceil', room: 'tilep', roomf: 'tilew', fog: [0.02, 0.008, 0.03], amb: [0.06, 0.045, 0.07], lamp: [1, 0.45, 0.85],
    props: ['shelf', 'shelf', 'table', 'bed', 'locker', 'crate'], deco: ['g_pills', 'g_smile', 'poster2', 'blood2', 'g_suck', 'smear', 'poster2'],
    foes: ['gimp', 'pusher', 'pusher', 'pusher', 'butcher', 'gimp'], loot: ['rifle', 'riflea', 'riflea', 'shells', 'ammo9', 'ammo9', 'cracker', 'cracker', 'cuppa', 'cuppa', 'pill', 'pill', 'pill'] },
  { id: 'bar', n: 'B1', name: 'THE CELLAR BAR', key: "TB's Front Door Key",
    wall: 'velvet', wall2: 'brick', floor: 'wood', ceil: 'ceil', room: 'wallpaper', roomf: 'checker', fog: [0.025, 0.012, 0.006], amb: [0.065, 0.045, 0.035], lamp: [1, 0.55, 0.25],
    props: ['keg', 'keg', 'crate', 'table', 'chair', 'locker', 'barrel'], deco: ['g_bro', 'poster', 'g_tb', 'blood1', 'g_suck', 'g_muck', 'smear', 'poster2'],
    foes: ['gimp', 'gimp', 'butcher', 'butcher', 'pusher', 'pusher', 'gimp'], loot: ['ammo9', 'ammo9', 'shells', 'shells', 'riflea', 'cracker', 'cracker', 'cracker', 'cuppa', 'pill', 'pill'] }
];
/* weapons. melee: reach and swing; guns: ammo type, spread, pellets, how loud (metres TB hears it from) */
var WEAP = {
  fists: { n: 'Fists', melee: 1, dmg: 7, reach: 1.35, rate: 0.42, ko: 14, noise: 2 },
  plank: { n: '2x4 with a Rusty Nail', short: '2X4', melee: 1, dmg: 15, reach: 1.9, rate: 0.62, bleed: 5, bleedT: 6, ko: 8, noise: 3 },
  bat: { n: 'Baseball Bat', short: 'BAT', melee: 1, dmg: 13, reach: 2.0, rate: 0.72, ko: 46, noise: 3 },
  handgun: { n: 'Handgun', short: 'HANDGUN', gun: 1, ammo: '9mm', dmg: 24, rate: 0.36, spread: 0.02, pellets: 1, noise: 24, kick: 0.8 },
  shotgun: { n: 'Shotgun', short: 'SHOTGUN', gun: 1, ammo: 'shells', dmg: 13, rate: 1.05, spread: 0.11, pellets: 7, noise: 34, kick: 2.2, knock: 1 },
  rifle: { n: 'Rifle', short: 'RIFLE', gun: 1, ammo: 'rifle', dmg: 80, rate: 1.35, spread: 0.004, pellets: 1, noise: 40, kick: 2.6, pierce: 1 }
};
var WORDER = ['fists', 'plank', 'bat', 'handgun', 'shotgun', 'rifle'];
var AMMO = { '9mm': { n: '9MM', give: 10 }, shells: { n: 'SHELLS', give: 5 }, rifle: { n: 'RIFLE ROUNDS', give: 4 } };
/* pickups: what you find lying about */
var LOOT = {
  plank: { n: '2x4 with a Rusty Nail', tile: 'i_plank', weap: 'plank' }, bat: { n: 'Baseball Bat', tile: 'i_bat', weap: 'bat' },
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
  pusher: { n: 'Pill Pusher', hp: 36, walk: 1.4, run: 3.0, dmg: 6, reach: 1.4, rate: 1.1, sight: 14, h: 1.78, ko: 70, dose: 1, throws: 1 }
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
  "I got lotion on my dick I'm out here shooting my shit I'm free man for real!", 'Old geezer, Prick teaser', 'I made muckies...', 'a sissy doesn\'t deserve pleasure, a sissy is someone plaything'];
var TBEND = 'take it easy bro, come back again soon!';
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
  'Somebody keeps writing RUN on the walls. It\'s me. I keep writing it. It\'s funnier when they do.'
];
/* the little lines the madness whispers at you */
var WHISPERS = ['he can see you', 'the walls are hungry', 'you took the pill', 'stay a while', 'bro', 'he is behind you', 'nobody leaves', 'come back again soon', 'your hands are not your hands', 'the floor is breathing', 'one more pill', 'he knows where you are', 'smile', "it's lotion o'clock"];
