/* =====================================================================================================
   CUMHEAD KART: who drives, what you can pick up, and where you race.
   Every course is a place from one of our other games. Shapes are loops of control points
   [x, z, height] that a spline smooths into the road.
   ===================================================================================================== */
var SAVE_KEY = 'ck-save';
/* stats 1-5: spd top speed, acc acceleration, hnd handling, wt weight (heavy karts barge light ones about) */
var CHARS = [
  { id: 'cumhead', n: 'Cumhead', f: 'ch_idle0', side: 'ch_rn2', sc: 0.52, kart: ['#c4121c', '#12040a', '#f1e7d0'], st: [3, 3, 3, 3], from: 'Our hero. All-rounder.' },
  { id: 'spermaid', n: 'Spermaid', f: 'npc_spermaid', side: 'spermaid_s0', sc: 0.6, kart: ['#3ab4c8', '#f1e7d0', '#ff6ab4'], st: [2, 5, 4, 1], from: 'Quick off the line, handles like a dream, gets shoved about.' },
  { id: 'greebo', n: 'Greebo', f: 'npc_greebo', side: 'greebo_s0', sc: 0.62, kart: ['#f1e7d0', '#c8903a', '#c4121c'], st: [4, 2, 2, 5], from: 'Heavy as a cream pie. Hard to stop once he gets going.' },
  { id: 'amy', n: 'Amy', f: 'npc_amy', sc: 0.66, kart: ['#ff6ab4', '#c4121c', '#ffe36a'], st: [3, 4, 3, 2], from: 'Mild, hot or dynamite? Light and nippy.' },
  { id: 'tb', n: 'TB', f: 'npc_tb', sc: 0.66, kart: ['#5a3a1a', '#c8903a', '#ffe36a'], st: [5, 1, 2, 4], from: 'Flat out fast and turns like a fridge. He has a lot to say.' },
  { id: 'hom', n: 'The Homunculus', f: 'h_gloop_adult_idle0', side: 'h_gloop_adult_idle0', only: 1, sc: 0.62, kart: ['#3fb43a', '#12040a', '#9aff5a'], st: [2, 4, 5, 1], from: 'A Gloop at the wheel. Corners like nothing else.' },
  { id: 'saba', n: 'Saba', f: 'npc_saba', sc: 0.66, kart: ['#2a8a2a', '#ffe36a', '#c4121c'], st: [3, 3, 4, 2], from: 'Hitless runs only. Smooth lines through every bend.' },
  { id: 'joff', n: 'Joff', f: 'npc_joff', sc: 0.66, kart: ['#ffe36a', '#f1e7d0', '#5aa82a'], st: [4, 3, 2, 3], from: 'Pineapple belongs on pizza. Quick on the straights.' },
  { id: 'kaya', n: 'Kaya', f: 'npc_kaya', sc: 0.66, kart: ['#8a3a20', '#f1e7d0', '#c4121c'], st: [2, 5, 3, 2], from: "Kaya's on the coffee. Shoots off every start.", lock: 'Win the Cream Cup' },
  { id: 'beebs', n: 'Uncle Beeb', f: 'npc_beebs', sc: 0.66, kart: ['#a8601e', '#d0c8d0', '#ffe36a'], st: [5, 2, 2, 5], from: 'First one is always warm. A tank on wheels.', lock: 'Win the Blood Cup' },
  { id: 'ali', n: 'Ali', f: 'npc_ali', sc: 0.66, kart: ['#f1e7d0', '#3a8a2a', '#c8903a'], st: [3, 4, 4, 2], from: 'Everything is better with garlic. Even karts.', lock: 'Win the Moon Cup' },
  { id: 'potbelly', n: 'Potbelly', f: 'npc_potbelly', sc: 0.66, kart: ['#ff9ab4', '#c4121c', '#ffe36a'], st: [4, 2, 3, 4], from: 'Cabinets are free, kid. The kart is not.', lock: 'Win all three cups on Hot' },
  { id: 'blum', n: 'Blumhead', f: 'boss_blum', side: 'boss_blum', only: 1, sc: 0.95, kart: ['#5a0a3a', '#ff2630', '#c08aff'], st: [5, 3, 3, 3], from: 'The load at the end. He wants a rematch.', lock: 'Win any cup on Dynamite' },
  { id: 'kingblum', n: 'King Blumhead', f: 'f_kingblum_0', sc: 0.25, kart: ['#12040a', '#ffe36a', '#c4121c'], st: [5, 2, 2, 5], from: 'On his own ground he is king. On yours too.', lock: 'Win all three cups on Dynamite' },
  { id: 'sirj', n: 'Sir Johnathan', f: 'cat', side: 'cat', only: 1, sc: 1.0, kart: ['#12040a', '#f1e7d0', '#9adf5a'], st: [3, 5, 5, 1], from: "Greebo's cat. Nobody knows how he reached the pedals.", lock: 'Pick up 1,000 drops in races' }
];
var CH = {}; CHARS.forEach(function (c) { CH[c.id] = c; });
/* speed classes: Amy's question */
var CLASSES = [
  { id: 'mild', n: 'Mild', sub: 'For a gentle Sunday drive', spd: 1.0, ai: 0.86 },
  { id: 'hot', n: 'Hot', sub: 'Faster karts, sharper rivals', spd: 1.14, ai: 0.93 },
  { id: 'dyn', n: 'Dynamite', sub: 'Flat out. Nobody holds back', spd: 1.28, ai: 0.985, lock: 'Win any cup on Hot' }
];
/* power-ups from the item boxes. Each one does its own thing to you, so getting hit by each feels different:
   pie splats your screen, the pill does something silly, goo makes you slide, the bubble sends things back, the meatnado tosses karts in the air. */
var ITEMS = {
  pie: { n: 'Cream Pie', ic: 'it_pie', d: 'Throw it ahead (hold back to throw it behind). A hit splats cream over their screen and slows them.' },
  pie3: { n: 'Three Pies', ic: 'it_pie', n3: 3, d: 'Three pies spin round you as a shield, each one stops a hit. Throw them one at a time.' },
  pill: { n: "TB's Silly Pill", ic: 'it_pill', d: 'Drop it behind you, or push up to lob it ahead. Whoever drives over it gets something silly: back-to-front steering, shrinking, or the hiccups.' },
  sperm: { n: 'Homing Sperm', ic: 'ck_sperm', d: 'Swims after the racer in front of you and spins them out.' },
  cuppa: { n: 'Cumpuccino', ic: 'it_espresso', d: 'A shot of speed.' },
  cuppa3: { n: 'Three Cumpuccinos', ic: 'it_espresso', n3: 3, d: 'Three shots of speed.' },
  bubble: { n: "Spermaid's Bubble", ic: 'ck_bubble', d: 'Wraps you in a bubble. The next thing thrown at you bounces straight back at whoever threw it.' },
  cracker: { n: 'Cum Cracker', ic: 'ck_cracker', d: 'Three drops and a little push.' },
  meatnado: { n: 'Meatnado', ic: 'ck_nado', d: 'Become a spinning meatnado: faster, nothing can hurt you, and anyone you touch is tossed in the air.' },
  goo: { n: "Blum's Goo", ic: 'ck_goo', d: 'Drop a big puddle of goo behind you (or lob it ahead). Drive through it and you slide about and slow right down.' },
  sirj: { n: 'Sir Johnathan', ic: 'cat', d: 'He bolts down the track and pounces on whoever is winning.' },
  egg: { n: 'Homunculus Egg', ic: 'h_gloop_egg0', d: 'Hatches a little Gloop that rides on your kart for a while and bites anyone who drives beside you, stealing a drop.' },
  balloon: { n: 'Steve Balloon', ic: 'f_balloon_0', d: 'Steve lifts your kart up over everything for a few seconds: nothing on the road can touch you.' },
  beat: { n: "Pulsar's Beat Drop", ic: 'it_phones', d: 'A bass drop. The shockwave knocks every kart near you flying outward and pops their bubbles.' },
  magnet: { n: "Potbelly's Coin Magnet", ic: 'ck_magnet', d: 'For a few seconds you pull drops off every kart near you, and off the road.' }
};
/* what the boxes give, by place (1st .. 8th): rarer and nastier things the further back you are */
var ODDS = [
  { pie: 26, pill: 26, bubble: 14, cracker: 16, goo: 10, pie3: 8 },
  { pie: 20, pie3: 8, pill: 18, sperm: 10, cuppa: 10, bubble: 10, cracker: 10, goo: 8, egg: 6 },
  { pie: 14, pie3: 10, pill: 12, sperm: 14, cuppa: 14, bubble: 8, goo: 8, egg: 8, magnet: 6, cuppa3: 6 },
  { pie: 10, pie3: 10, pill: 8, sperm: 16, cuppa: 14, cuppa3: 8, bubble: 6, goo: 6, egg: 8, magnet: 8, beat: 4, meatnado: 2 },
  { pie3: 10, pill: 6, sperm: 16, cuppa: 14, cuppa3: 12, egg: 8, magnet: 8, beat: 8, balloon: 6, meatnado: 8, sirj: 2, goo: 2 },
  { pie3: 8, sperm: 16, cuppa: 10, cuppa3: 16, egg: 6, magnet: 8, beat: 10, balloon: 8, meatnado: 12, sirj: 6 },
  { sperm: 14, cuppa: 8, cuppa3: 18, beat: 12, balloon: 12, meatnado: 18, sirj: 10, magnet: 8 },
  { sperm: 10, cuppa3: 20, beat: 12, balloon: 14, meatnado: 24, sirj: 16, cuppa: 4 }
];
var POINTS = [15, 12, 10, 8, 6, 4, 2, 1];

/* ---------- the courses ---------- */
var CUPS = [
  { id: 'cream', n: 'Cream Cup', ic: 'it_pie', courses: ['clubrow', 'park', 'cafe', 'castle'] },
  { id: 'blood', n: 'Blood Cup', ic: 'it_vial', courses: ['sewer', 'arcade', 'spuzz', 'lair'], lock: 'Finish the Cream Cup in the top three' },
  { id: 'moon', n: 'Moon Cup', ic: 'it_moon', courses: ['picnic', 'dungeon', 'void', 'moon'], lock: 'Finish the Blood Cup in the top three' }
];
/* ramps: [where along the lap (0..1), how hard it throws you up]. boosts: [where, across (-1..1)]. boxes: [where]. drops: [where, across, how many]. */
var COURSES = {
  clubrow: { n: 'Clubhouse Row', from: 'Load Legacy', hw: 9, off: 7, wallH: 2.2, laps: 3, song: 'ck_town',
    pts: [[-90, -40, 0], [0, -45, 0], [90, -40, 0], [120, -10, 0], [115, 30, 0], [80, 50, 0], [40, 40, 0], [10, 55, 0], [-30, 60, 0], [-80, 55, 0], [-115, 25, 0], [-120, -15, 0]],
    boxes: [0.2, 0.55, 0.82], boosts: [[0.33, 0], [0.68, -0.5]], ramps: [], drops: [[0.1, 0, 5], [0.45, 0.5, 4], [0.62, -0.5, 4], [0.9, 0, 5]],
    sky: { grad: [[0, '#12040a'], [0.6, '#3a0a10'], [1, '#6a1018']], moon: { x: 140, y: 40, r: 22, col: '#c4121c' }, stars: 40, city: { col: '#1a0608', lit: '#ffb040', h: 30 } },
    fog: '#2a080c', fogR: [60, 260], light: [0.62, 0.5, 0.5], theme: 'town' },
  park: { n: 'Ejaculand', from: 'Load Legacy and Meatnado Escape', hw: 9, off: 6, wallH: 1.6, laps: 3, song: 'ck_park',
    pts: [[0, -80, 0], [70, -85, 0], [120, -60, 2], [130, -10, 6], [110, 30, 8], [60, 40, 8], [20, 20, 4], [-20, 0, 0], [-60, 20, 0], [-90, 60, 0], [-130, 50, 0], [-140, 0, 0], [-110, -50, 0], [-60, -75, 0]],
    boxes: [0.15, 0.48, 0.78], boosts: [[0.42, 0], [0.9, 0.4]], ramps: [[0.47, 1]], drops: [[0.05, 0, 5], [0.3, 0, 5], [0.6, -0.4, 4], [0.7, 0.4, 4]],
    sky: { grad: [[0, '#0a0206'], [0.7, '#2a0810'], [1, '#5a0a14']], moon: { x: 300, y: 36, r: 18, col: '#ff2630' }, stars: 50, wheel: '#3a0a10' },
    fog: '#1a0408', fogR: [60, 250], light: [0.6, 0.48, 0.5], theme: 'park' },
  cafe: { n: 'Cum Café Run', from: 'Willy Nilly and Meatnado Escape', hw: 8, off: 3, wallH: 3, laps: 3, song: 'ck_cafe',
    pts: [[0, -60, 0], [80, -60, 0], [100, -50, 0], [110, -30, 0], [110, 20, 0], [100, 40, 0], [80, 50, 0], [40, 50, 0], [20, 40, 0], [10, 20, 0], [-10, 10, 0], [-40, 10, 0], [-60, 25, 0], [-70, 50, 0], [-90, 60, 0], [-120, 50, 0], [-130, 20, 0], [-125, -30, 0], [-100, -55, 0], [-60, -62, 0]],
    boxes: [0.12, 0.45, 0.75], boosts: [[0.24, 0.5], [0.62, -0.5]], ramps: [], drops: [[0.06, 0, 5], [0.35, 0, 4], [0.55, 0, 4], [0.86, 0.4, 5]],
    sky: { grad: [[0, '#0a0410'], [0.6, '#2a0a1a'], [1, '#4a1a20']], stars: 30, city: { col: '#0e0608', lit: '#ffe36a', h: 50 }, nado: '#5a1a14' },
    fog: '#1e0a10', fogR: [40, 220], light: [0.58, 0.5, 0.55], theme: 'city' },
  castle: { n: "Cumhead's Castle", from: 'Load Legacy', hw: 8, off: 2, wallH: 9, laps: 3, song: 'ck_castle',
    pts: [[0, -70, 0], [70, -70, 0], [100, -50, 0], [105, -10, 0], [90, 20, 3], [60, 30, 5], [20, 30, 5], [-10, 45, 5], [-20, 75, 3], [-50, 90, 0], [-90, 80, 0], [-110, 50, 0], [-100, 10, 0], [-110, -30, 0], [-80, -65, 0]],
    boxes: [0.15, 0.5, 0.8], boosts: [[0.3, 0], [0.88, 0]], ramps: [[0.58, 0.8]], drops: [[0.05, 0, 5], [0.4, 0, 4], [0.68, 0, 4]],
    sky: { grad: [[0, '#08020a'], [1, '#1a0408']] }, indoor: 1,
    fog: '#0e0306', fogR: [40, 180], light: [0.55, 0.45, 0.45], theme: 'castle' },
  sewer: { n: 'The Cream Sewers', from: 'Load Legacy (Endless)', hw: 8, off: 4, wallH: 8, laps: 3, song: 'ck_sewer',
    pts: [[0, -90, 0], [60, -90, 0], [100, -70, 0], [110, -30, 0], [80, 0, 0], [50, 10, 0], [40, 40, 0], [70, 70, 0], [60, 100, 0], [20, 110, 0], [-20, 90, 0], [-30, 50, 0], [-60, 30, 0], [-100, 40, 0], [-130, 10, 0], [-120, -40, 0], [-80, -70, 0], [-40, -90, 0]],
    boxes: [0.16, 0.5, 0.82], boosts: [[0.38, 0], [0.7, 0]], ramps: [], drops: [[0.08, 0, 5], [0.28, 0, 4], [0.6, 0, 5], [0.92, 0, 4]], creamOff: 1,
    sky: { grad: [[0, '#0a0804'], [1, '#1a140a']] }, indoor: 1,
    fog: '#120e08', fogR: [30, 160], light: [0.55, 0.52, 0.45], theme: 'sewer' },
  arcade: { n: 'Potbelly Arcade', from: "Potbelly's Arcade Overdrive", hw: 8, off: 3, wallH: 1.4, laps: 3, song: 'ck_arcade',
    pts: [[0, -70, 0], [60, -70, 0], [90, -40, 0], [60, -10, 0], [90, 20, 0], [60, 50, 0], [90, 80, 0], [50, 110, 0], [0, 100, 0], [-30, 70, 0], [-70, 90, 0], [-110, 60, 0], [-100, 20, 0], [-120, -20, 0], [-90, -60, 0], [-40, -75, 0]],
    boxes: [0.12, 0.46, 0.76], boosts: [[0.53, 0], [0.92, 0]], ramps: [], drops: [[0.05, 0, 5], [0.25, 0, 3], [0.36, 0, 3], [0.65, 0, 4]], bumpers: 1,
    sky: { grad: [[0, '#06020a'], [1, '#14061a']], stars: 60 }, indoor: 1,
    fog: '#0a0410', fogR: [50, 220], light: [0.6, 0.5, 0.62], theme: 'arcade' },
  spuzz: { n: 'Spuzzworld Factory', from: "Spuzzworld: Cum's Oddysee", hw: 8, off: 3, wallH: 6, laps: 3, song: 'ck_factory',
    pts: [[0, -60, 0], [70, -60, 0], [110, -40, 4], [120, 0, 8], [100, 40, 8], [60, 50, 8], [30, 30, 4], [0, 10, 0], [-30, 30, 0], [-50, 60, 4], [-90, 70, 8], [-120, 40, 8], [-120, 0, 4], [-100, -40, 0], [-60, -62, 0]],
    boxes: [0.1, 0.47, 0.78], boosts: [[0.53, 0], [0.95, 0]], ramps: [[0.36, 0.7]], drops: [[0.05, 0, 5], [0.25, 0, 4], [0.65, 0, 4]], belts: [[0.18, 0.08], [0.72, 0.08]], vents: [0.3, 0.6, 0.86],
    sky: { grad: [[0, '#0a0404'], [1, '#2a0806']] }, indoor: 1,
    fog: '#1a0605', fogR: [30, 170], light: [0.6, 0.45, 0.42], theme: 'factory' },
  lair: { n: "Blumhead's Lair", from: 'Load Legacy', hw: 8, off: 4, wallH: 7, laps: 3, song: 'ck_lair',
    pts: [[0, -90, 0], [50, -95, 0], [90, -80, 2], [110, -40, 4], [90, -10, 4], [100, 30, 2], [130, 60, 0], [110, 100, 0], [60, 100, 0], [30, 70, 2], [0, 90, 4], [-40, 110, 4], [-80, 90, 2], [-90, 50, 0], [-60, 20, 0], [-90, -10, 0], [-120, -50, 0], [-90, -85, 0], [-40, -95, 0]],
    boxes: [0.14, 0.44, 0.74], boosts: [[0.3, 0], [0.6, 0], [0.92, 0]], ramps: [], drops: [[0.06, 0, 5], [0.22, 0, 4], [0.52, 0, 4], [0.82, 0, 4]], goo: [0.2, 0.39, 0.66, 0.86],
    sky: { grad: [[0, '#0a0208'], [1, '#2a0820']] }, indoor: 1,
    fog: '#14040e', fogR: [30, 170], light: [0.6, 0.42, 0.55], theme: 'lair' },
  picnic: { n: "Greebo's Picnic", from: "Load Legacy (Greebo's Grotto)", hw: 10, off: 8, wallH: 0.9, laps: 3, song: 'ck_picnic',
    pts: [[0, -80, 0], [60, -90, 2], [110, -70, 6], [140, -20, 8], [130, 30, 4], [90, 60, 0], [40, 50, 2], [0, 70, 4], [-50, 90, 6], [-100, 70, 4], [-130, 20, 0], [-110, -30, 0], [-60, -70, 0]],
    boxes: [0.16, 0.5, 0.8], boosts: [[0.35, 0], [0.66, 0.5]], ramps: [[0.25, 0.8], [0.58, 0.8]], drops: [[0.05, 0, 5], [0.42, 0, 4], [0.72, 0, 4], [0.9, -0.5, 4]], ants: 1,
    sky: { grad: [[0, '#3a1a3a'], [0.5, '#c4502a'], [1, '#ffb060']], moon: { x: 400, y: 50, r: 20, col: '#ffe9a0', glow: 'rgba(255,227,106,0.25)', dark: 'rgba(255,200,80,0.3)' }, clouds: 'rgba(255,220,180,0.35)', hills: ['#5a3a2a', '#3a5a1a'] },
    fog: '#c4703a', fogR: [80, 300], light: [0.66, 0.6, 0.52], theme: 'picnic' },
  dungeon: { n: 'The Cumheads Quest Dungeon', from: 'Cumheads Quest', hw: 7, off: 2, wallH: 8, laps: 3, song: 'ck_dungeon',
    pts: [[0, -60, 0], [60, -60, 0], [80, -40, 0], [80, 0, -2], [100, 20, -4], [120, 40, -4], [110, 70, -4], [70, 80, -2], [40, 60, 0], [20, 80, 0], [-20, 90, 0], [-50, 70, 0], [-50, 30, 2], [-80, 10, 2], [-100, -20, 2], [-80, -50, 0], [-40, -62, 0]],
    boxes: [0.14, 0.46, 0.76], boosts: [[0.3, 0], [0.62, 0]], ramps: [], drops: [[0.06, 0, 5], [0.38, 0, 4], [0.56, 0, 4], [0.86, 0, 4]], torches: 1,
    sky: { grad: [[0, '#060406'], [1, '#14100e']] }, indoor: 1,
    fog: '#0a0606', fogR: [25, 140], light: [0.58, 0.48, 0.42], theme: 'dungeon' },
  void: { n: 'Journey to the Void', from: 'Journey to the Void', hw: 9, off: 2, wallH: 1.2, laps: 3, song: 'ck_void',
    pts: [[0, -100, 0], [80, -100, 4], [140, -60, 10], [150, 0, 14], [110, 50, 10], [60, 60, 6], [30, 100, 2], [-30, 120, 0], [-90, 100, 4], [-130, 50, 8], [-120, 0, 6], [-90, -40, 2], [-50, -90, 0]],
    boxes: [0.12, 0.45, 0.78], boosts: [[0.28, 0], [0.55, 0], [0.9, 0]], ramps: [[0.68, 0.9]], drops: [[0.05, 0, 5], [0.35, 0, 4], [0.62, 0, 4], [0.84, 0, 4]], floating: 1,
    sky: { grad: [[0, '#000000'], [0.6, '#0a0418'], [1, '#1a0a30']], stars: 160 },
    fog: '#0a0418', fogR: [80, 320], light: [0.58, 0.55, 0.66], theme: 'void' },
  moon: { n: 'The Crimson Moon', from: 'Load Legacy (secret)', hw: 11, off: 8, wallH: 1.0, laps: 3, song: 'ck_moon', grav: 0.55,
    pts: [[0, -110, 0], [90, -110, 0], [150, -70, 0], [160, -10, 0], [130, 40, 0], [80, 50, 0], [60, 90, 0], [0, 110, 0], [-60, 90, 0], [-80, 40, 0], [-130, 20, 0], [-160, -30, 0], [-130, -80, 0], [-70, -110, 0]],
    boxes: [0.14, 0.42, 0.74], boosts: [[0.08, 0], [0.5, 0]], ramps: [[0.22, 1], [0.6, 1], [0.86, 1]], drops: [[0.3, 0, 5], [0.66, 0, 4], [0.94, 0, 4]],
    sky: { grad: [[0, '#000000'], [1, '#1a0408']], stars: 200, moon: { x: 250, y: 50, r: 34, col: '#f1e7d0', glow: 'rgba(241,231,208,0.12)', dark: 'rgba(120,100,100,0.25)' } },
    fog: '#120406', fogR: [100, 340], light: [0.62, 0.5, 0.5], theme: 'moon' }
};
var COURSEORDER = []; CUPS.forEach(function (c) { COURSEORDER = COURSEORDER.concat(c.courses); });
