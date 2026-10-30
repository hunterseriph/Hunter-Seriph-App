/* =====================================================================================================
   THE FULL COURSES: one per place, a long lap that drives through every part of it (zones, see 3b-zones.js),
   two laps a race, in three Tour cups. Each also has a short Sprint layout (Expedition only), and the
   Expedition runs the full ones backwards too.
   ===================================================================================================== */
var FULL = {
  clubrowF: { n: 'Round the Town', from: 'Load Legacy', hw: 9, off: 5, wallH: 2.2, laps: 2, song: 'ck_town',
    pts: [[-150, -125, 0], [-50, -130, 0], [50, -125, 0], [140, -115, 0], [205, -75, 0], [215, -15, 2], [185, 40, 4], [210, 95, 4], [175, 150, 2], [100, 160, 0], [40, 125, 0], [-15, 155, 0], [-80, 175, 0], [-150, 155, 0], [-200, 105, 0], [-185, 45, 0], [-230, -5, 0], [-230, -70, 0], [-200, -115, 0]],
    zones: [[0, 'town', { name: 'Clubhouse Row' }], [0.24, 'yard', { name: 'The Castle Courtyard', wallH: 1.2 }], [0.47, 'clubin', { name: 'Inside the Clubhouse', wallH: 7, light: [0.66, 0.54, 0.46] }], [0.7, 'alley', { name: 'The Back Alley', wallH: 6, light: [0.5, 0.42, 0.46] }]],
    boxes: [0.1, 0.33, 0.56, 0.8], boosts: [[0.2, 0], [0.62, 0], [0.92, 0.4]], ramps: [[0.42, 0.8]], drops: [[0.05, 0, 5], [0.3, 0, 4], [0.52, 0.4, 4], [0.75, -0.4, 4], [0.95, 0, 4]],
    sky: { grad: [[0, '#12040a'], [0.6, '#3a0a10'], [1, '#6a1018']], moon: { x: 140, y: 40, r: 22, col: '#c4121c' }, stars: 40, city: { col: '#1a0608', lit: '#ffb040', h: 30 } },
    fog: '#2a080c', fogR: [70, 280], light: [0.62, 0.5, 0.5] },
  parkF: { n: 'Ejaculand After Dark', from: 'Load Legacy and Meatnado Escape', hw: 9, off: 5, wallH: 1.6, laps: 2, song: 'ck_park',
    pts: [[0, -150, 0], [90, -150, 0], [170, -125, 2], [215, -70, 6], [205, -10, 10], [160, 25, 12], [120, 70, 10], [150, 120, 6], [110, 170, 2], [40, 160, 0], [-10, 120, 0], [-60, 150, 0], [-130, 165, 0], [-195, 130, 0], [-210, 65, 0], [-170, 15, 0], [-210, -40, 0], [-190, -110, 0], [-110, -150, 0]],
    zones: [[0, 'parkgate', { name: 'The Gates of Ejaculand' }], [0.2, 'coaster', { name: 'Under the Coaster', wallH: 1.2 }], [0.46, 'park', { name: 'The Midway' }], [0.72, 'flume', { name: 'The Load Flume', creamOff: 1, wallH: 1.2 }]],
    boxes: [0.08, 0.32, 0.57, 0.82], boosts: [[0.18, 0], [0.4, 0], [0.66, -0.4], [0.9, 0]], ramps: [[0.36, 1]], drops: [[0.04, 0, 5], [0.27, 0, 4], [0.5, 0, 5], [0.77, 0.4, 4], [0.94, 0, 4]],
    sky: { grad: [[0, '#0a0206'], [0.7, '#2a0810'], [1, '#5a0a14']], moon: { x: 300, y: 36, r: 18, col: '#ff2630' }, stars: 50, wheel: '#3a0a10' },
    fog: '#1a0408', fogR: [70, 270], light: [0.6, 0.48, 0.5] },
  cafeF: { n: 'The Late Shift', from: 'Willy Nilly and Meatnado Escape', hw: 8, off: 3, wallH: 3, laps: 2, song: 'ck_cafe',
    pts: [[-120, -110, 0], [-20, -115, 0], [70, -110, 0], [130, -80, 0], [140, -20, 0], [110, 25, 0], [150, 70, 6], [190, 110, 12], [160, 160, 14], [90, 165, 14], [40, 130, 10], [-10, 150, 6], [-70, 165, 2], [-130, 140, 0], [-150, 80, 0], [-110, 40, 0], [-160, -10, 0], [-190, -60, 0], [-165, -100, 0]],
    zones: [[0, 'city', { name: 'Café Street' }], [0.22, 'kitchen', { name: 'Inside the Cum Café', wallH: 6, light: [0.66, 0.56, 0.5] }], [0.4, 'roofs', { name: 'The Rooftops', wallH: 1.2 }], [0.68, 'diner', { name: 'Diner Row', wallH: 2 }]],
    boxes: [0.1, 0.3, 0.55, 0.8], boosts: [[0.18, 0.4], [0.47, 0], [0.75, -0.4]], ramps: [[0.62, 0.9]], drops: [[0.05, 0, 5], [0.26, 0, 4], [0.5, 0, 4], [0.72, 0.3, 4], [0.92, 0, 4]],
    sky: { grad: [[0, '#0a0410'], [0.6, '#2a0a1a'], [1, '#4a1a20']], stars: 30, city: { col: '#0e0608', lit: '#ffe36a', h: 50 }, nado: '#5a1a14' },
    fog: '#1e0a10', fogR: [60, 250], light: [0.58, 0.5, 0.55] },
  castleF: { n: 'Storm the Castle', from: 'Load Legacy', hw: 8, off: 3, wallH: 3, laps: 2, song: 'ck_castle',
    pts: [[-140, -120, 0], [-40, -125, 0], [60, -120, 0], [130, -95, 0], [150, -40, 0], [120, 5, 0], [140, 50, 0], [120, 100, 4], [60, 120, 10], [0, 105, 14], [-40, 140, 16], [-100, 150, 14], [-150, 115, 8], [-140, 60, 2], [-180, 20, 0], [-185, -40, 0], [-175, -95, 0]],
    zones: [[0, 'moat', { name: 'The Drawbridge', creamOff: 1, wallH: 2 }], [0.2, 'castle', { name: 'The Great Hall', wallH: 9 }], [0.44, 'battle', { name: 'The Battlements', wallH: 2.6 }], [0.72, 'cells', { name: 'The Cells', wallH: 8, light: [0.5, 0.44, 0.44] }]],
    boxes: [0.12, 0.33, 0.58, 0.82], boosts: [[0.26, 0], [0.5, 0], [0.88, 0]], ramps: [[0.07, 0.8]], drops: [[0.03, 0, 4], [0.3, 0, 4], [0.55, 0, 4], [0.78, 0, 4], [0.95, 0, 4]],
    sky: { grad: [[0, '#08020a'], [0.7, '#1a0408'], [1, '#3a0a10']], moon: { x: 380, y: 30, r: 20, col: '#c4121c' }, stars: 60, spires: '#140408' },
    fog: '#12040a', fogR: [50, 230], light: [0.56, 0.46, 0.46] },
  sewerF: { n: 'Down the Drain', from: 'Load Legacy (Endless)', hw: 8, off: 4, wallH: 7, laps: 2, song: 'ck_sewer', creamOff: 1,
    pts: [[-130, -120, 0], [-30, -125, 0], [60, -115, 0], [120, -80, -2], [130, -20, -4], [180, 20, -4], [190, 80, -2], [150, 125, 0], [90, 120, 0], [50, 160, 0], [-20, 170, 0], [-80, 140, -2], [-90, 80, -4], [-150, 50, -4], [-200, 0, -2], [-190, -70, 0]],
    zones: [[0, 'sewer', { name: 'The Sewer Tunnels', wallH: 7 }], [0.24, 'reservoir', { name: 'The Cream Reservoir', wallH: 1.5, light: [0.6, 0.58, 0.5] }], [0.5, 'ratcult', { name: 'The Rat Cult Shrine', wallH: 8, light: [0.55, 0.4, 0.38] }], [0.74, 'bonepit', { name: 'The Bone Pit', wallH: 6, creamOff: 0 }]],
    boxes: [0.1, 0.36, 0.6, 0.84], boosts: [[0.2, 0], [0.45, 0], [0.7, 0]], ramps: [], drops: [[0.05, 0, 5], [0.3, 0, 4], [0.55, 0, 4], [0.8, 0, 4], [0.95, 0, 4]],
    sky: { grad: [[0, '#0a0804'], [1, '#1a140a']] },
    fog: '#120e08', fogR: [40, 200], light: [0.55, 0.52, 0.45] },
  arcadeF: { n: 'Game On', from: "Potbelly's Arcade Overdrive", hw: 8, off: 3, wallH: 1.4, laps: 2, song: 'ck_arcade',
    pts: [[-120, -110, 0], [-20, -115, 0], [70, -110, 0], [120, -70, 0], [90, -30, 0], [130, 10, 0], [100, 50, 0], [140, 95, 0], [100, 140, 0], [30, 150, 0], [-30, 120, 0], [-90, 150, 0], [-150, 130, 0], [-170, 70, 0], [-130, 30, 0], [-180, -20, 0], [-180, -80, 0]],
    zones: [[0, 'carpark', { name: 'The Car Park', wallH: 1, light: [0.55, 0.5, 0.6] }], [0.18, 'arcade', { name: 'The Neon Floor' }], [0.46, 'prizes', { name: 'The Prize Counter', wallH: 3 }], [0.68, 'machine', { name: 'Inside the Machine', wallH: 0.8, light: [0.5, 0.62, 0.5], floating: 1 }]],
    boxes: [0.1, 0.32, 0.56, 0.8], boosts: [[0.24, 0], [0.5, 0], [0.75, 0], [0.88, 0]], ramps: [[0.71, 0.9]], drops: [[0.05, 0, 5], [0.28, 0, 3], [0.38, 0, 3], [0.6, 0, 4], [0.85, 0, 4]],
    sky: { grad: [[0, '#06020a'], [1, '#14061a']], stars: 60, city: { col: '#0a0410', lit: '#ff2a8a', h: 24 } },
    fog: '#0a0410', fogR: [60, 250], light: [0.6, 0.5, 0.62] },
  spuzzF: { n: 'Shift Change', from: "Spuzzworld: Cum's Oddysee", hw: 8, off: 3, wallH: 6, laps: 2, song: 'ck_factory',
    pts: [[-130, -110, 0], [-30, -115, 0], [70, -110, 0], [140, -90, 4], [170, -40, 8], [140, 10, 8], [170, 60, 4], [150, 115, 0], [80, 135, 0], [20, 110, 0], [-30, 140, 0], [-90, 150, 4], [-150, 120, 8], [-160, 60, 8], [-130, 15, 4], [-180, -35, 0], [-180, -90, 0]],
    zones: [[0, 'factory', { name: 'The Factory Floor' }], [0.22, 'mincer', { name: 'The Mincer Line', light: [0.62, 0.42, 0.42] }], [0.48, 'furnace', { name: 'The Furnace', creamOff: 1, light: [0.7, 0.48, 0.36], wallH: 5 }], [0.74, 'throne', { name: "Blumhead's Throne Room", wallH: 9 }]],
    boxes: [0.1, 0.34, 0.6, 0.84], boosts: [[0.2, 0], [0.55, 0], [0.92, 0]], ramps: [[0.42, 0.7]], drops: [[0.05, 0, 5], [0.3, 0, 4], [0.52, 0, 4], [0.8, 0, 4]], belts: [[0.27, 0.08]], vents: [],
    sky: { grad: [[0, '#0a0404'], [1, '#2a0806']] },
    fog: '#1a0605', fogR: [40, 210], light: [0.6, 0.45, 0.42] },
  lairF: { n: 'Into the Black Keep', from: 'Load Legacy', hw: 8, off: 4, wallH: 7, laps: 2, song: 'ck_lair',
    pts: [[-140, -120, 0], [-40, -125, 0], [60, -120, 0], [130, -90, 2], [150, -30, 4], [120, 20, 4], [160, 70, 2], [140, 130, 0], [70, 150, 0], [20, 110, 2], [-40, 130, 4], [-100, 160, 4], [-160, 130, 2], [-170, 70, 0], [-130, 20, 0], [-190, -30, 0], [-195, -90, 0]],
    zones: [[0, 'lair', { name: "Blumhead's Lair" }], [0.24, 'heart', { name: 'The Heart Chamber', wallH: 8, light: [0.66, 0.4, 0.46] }], [0.48, 'blackkeep', { name: 'The Black Keep', wallH: 4, light: [0.5, 0.42, 0.5] }], [0.74, 'crypt', { name: 'The Crypt of Blum', wallH: 7, light: [0.5, 0.44, 0.58] }]],
    boxes: [0.1, 0.35, 0.6, 0.84], boosts: [[0.18, 0], [0.44, 0], [0.7, 0], [0.92, 0]], ramps: [], drops: [[0.05, 0, 5], [0.3, 0, 4], [0.55, 0, 4], [0.8, 0, 4]], goo: [0.12, 0.3, 0.55, 0.8],
    sky: { grad: [[0, '#0a0208'], [0.7, '#2a0820'], [1, '#3a0a1a']], spires: '#0a0206', stars: 20 },
    fog: '#14040e', fogR: [40, 200], light: [0.6, 0.42, 0.55] },
  picnicF: { n: "Greebo's Day Out", from: "Load Legacy (Greebo's Grotto)", hw: 10, off: 6, wallH: 0.9, laps: 2, song: 'ck_picnic',
    pts: [[-150, -130, 0], [-40, -140, 2], [70, -130, 6], [160, -100, 8], [210, -40, 6], [190, 30, 2], [230, 90, 0], [190, 150, 0], [110, 165, 0], [50, 130, 0], [-10, 160, 0], [-80, 180, 4], [-160, 160, 8], [-220, 100, 6], [-200, 30, 2], [-240, -30, 0], [-220, -100, 0]],
    zones: [[0, 'picnic', { name: 'The Picnic Hills' }], [0.26, 'gkitchen', { name: "Greebo's Kitchen", wallH: 7, light: [0.68, 0.58, 0.5] }], [0.48, 'yarn', { name: "Sir Johnathan's Scratching Tower", wallH: 6, light: [0.64, 0.52, 0.56] }], [0.72, 'cellar', { name: 'The Cream Cellar', wallH: 7, creamOff: 1, light: [0.56, 0.54, 0.5] }]],
    boxes: [0.1, 0.36, 0.6, 0.84], boosts: [[0.2, 0], [0.42, 0], [0.66, 0], [0.93, 0.5]], ramps: [[0.14, 0.8]], drops: [[0.05, 0, 5], [0.3, 0, 4], [0.55, 0, 4], [0.8, 0, 4]], ants: 1,
    sky: { grad: [[0, '#3a1a3a'], [0.5, '#c4502a'], [1, '#ffb060']], moon: { x: 400, y: 50, r: 20, col: '#ffe9a0', glow: 'rgba(255,227,106,0.25)', dark: 'rgba(255,200,80,0.3)' }, clouds: 'rgba(255,220,180,0.35)', hills: ['#5a3a2a', '#3a5a1a'] },
    fog: '#c4703a', fogR: [90, 330], light: [0.66, 0.6, 0.52] },
  dungeonF: { n: 'Deeper Down', from: 'Cumheads Quest', hw: 7, off: 2, wallH: 8, laps: 2, song: 'ck_dungeon',
    pts: [[-130, -100, 0], [-40, -105, 0], [50, -100, 0], [110, -70, -2], [120, -10, -4], [90, 35, -6], [130, 80, -8], [110, 130, -8], [50, 135, -6], [0, 100, -4], [-50, 130, -2], [-110, 140, 0], [-160, 100, 0], [-150, 40, 2], [-190, -10, 2], [-180, -70, 0]],
    zones: [[0, 'dungeon', { name: 'Floor One' }], [0.25, 'emporium', { name: 'Master Bates Emporium', light: [0.62, 0.52, 0.42] }], [0.5, 'depths', { name: 'The Lava Depths', creamOff: 1, light: [0.72, 0.46, 0.34], wallH: 6 }], [0.74, 'caverns', { name: 'The Crystal Caverns', light: [0.46, 0.5, 0.64] }]],
    boxes: [0.12, 0.38, 0.62, 0.86], boosts: [[0.2, 0], [0.45, 0], [0.7, 0], [0.92, 0]], ramps: [], drops: [[0.05, 0, 5], [0.32, 0, 4], [0.56, 0, 4], [0.8, 0, 4]], torches: 1,
    sky: { grad: [[0, '#060406'], [1, '#14100e']] },
    fog: '#0a0606', fogR: [35, 170], light: [0.58, 0.48, 0.42] },
  voidF: { n: "Journey's End", from: 'Journey to the Void', hw: 9, off: 3, wallH: 1.2, laps: 2, song: 'ck_void',
    pts: [[-150, -140, 0], [-50, -150, 0], [60, -145, 2], [160, -120, 6], [210, -60, 10], [200, 10, 12], [230, 70, 8], [190, 130, 4], [110, 150, 0], [50, 115, 0], [-10, 150, 0], [-80, 175, 2], [-160, 150, 6], [-210, 90, 10], [-190, 25, 8], [-230, -40, 4], [-215, -110, 0]],
    zones: [[0, 'field', { name: 'The World Map', wallH: 0.6, light: [0.64, 0.6, 0.56] }], [0.24, 'jvtown', { name: 'Midgar-on-Cream', wallH: 2 }], [0.48, 'void', { name: 'The Crystal Road', floating: 1 }], [0.74, 'core', { name: 'The Void Core', floating: 1, wallH: 1, light: [0.52, 0.44, 0.66] }]],
    boxes: [0.1, 0.36, 0.6, 0.84], boosts: [[0.2, 0], [0.45, 0], [0.7, 0], [0.92, 0]], ramps: [[0.66, 0.9]], drops: [[0.05, 0, 5], [0.3, 0, 4], [0.55, 0, 4], [0.8, 0, 4]],
    sky: { grad: [[0, '#000000'], [0.6, '#0a0418'], [1, '#1a0a30']], stars: 160, hills: ['#14082a', '#0a0418'] },
    fog: '#0a0418', fogR: [90, 340], light: [0.58, 0.55, 0.66] },
  moonF: { n: 'Crimson Eclipse', from: 'Load Legacy (secret)', hw: 11, off: 7, wallH: 1.0, laps: 2, song: 'ck_moon', grav: 0.55,
    pts: [[-170, -150, 0], [-60, -160, 0], [60, -155, 0], [170, -125, 0], [230, -60, 0], [210, 10, -6], [240, 80, -12], [200, 150, -12], [120, 170, -6], [60, 130, 0], [0, 165, 0], [-80, 190, 0], [-170, 170, 0], [-230, 110, 0], [-210, 40, 0], [-250, -30, 0], [-240, -110, 0]],
    zones: [[0, 'moon', { name: 'The Red Plains' }], [0.24, 'crater', { name: 'The Great Crater', wallH: 4, light: [0.56, 0.42, 0.42] }], [0.5, 'temple', { name: 'The Eclipse Temple', wallH: 3, light: [0.5, 0.4, 0.46] }], [0.75, 'megablum', { name: "Mega Blumhead's Maw", wallH: 6, light: [0.62, 0.4, 0.48] }]],
    boxes: [0.1, 0.36, 0.62, 0.86], boosts: [[0.2, 0], [0.47, 0], [0.72, 0], [0.94, 0]], ramps: [[0.14, 1], [0.58, 1], [0.86, 1]], drops: [[0.05, 0, 5], [0.3, 0, 4], [0.55, 0, 4], [0.8, 0, 4]],
    sky: { grad: [[0, '#000000'], [1, '#1a0408']], stars: 200, moon: { x: 250, y: 50, r: 34, col: '#f1e7d0', glow: 'rgba(241,231,208,0.12)', dark: 'rgba(120,100,100,0.25)' } },
    fog: '#120406', fogR: [110, 360], light: [0.62, 0.5, 0.5] }
};
/* the Sprints: short layouts through two of a place's parts, for the Expedition */
var SPRINT = {
  clubrowF: { n: 'Courtyard Sprint', zones: [[0, 'yard', { name: 'The Castle Courtyard', wallH: 1.2 }], [0.5, 'alley', { name: 'The Back Alley', wallH: 6, light: [0.5, 0.42, 0.46] }]],
    pts: [[-80, -60, 0], [0, -65, 0], [80, -60, 0], [115, -15, 0], [90, 35, 0], [110, 75, 0], [60, 95, 0], [0, 70, 0], [-60, 95, 0], [-110, 60, 0], [-100, 5, 0], [-120, -40, 0]] },
  parkF: { n: 'Flume Sprint', zones: [[0, 'flume', { name: 'The Load Flume', creamOff: 1, wallH: 1.2 }], [0.5, 'coaster', { name: 'Under the Coaster', wallH: 1.2 }]],
    pts: [[-80, -70, 0], [10, -75, 0], [90, -60, 2], [120, -10, 6], [90, 40, 8], [110, 85, 4], [50, 105, 0], [-10, 75, 0], [-70, 100, 0], [-115, 55, 0], [-95, 0, 0], [-120, -45, 0]] },
  cafeF: { n: 'Rooftop Sprint', zones: [[0, 'roofs', { name: 'The Rooftops', wallH: 1.2 }], [0.5, 'kitchen', { name: 'Inside the Cum Café', wallH: 6, light: [0.66, 0.56, 0.5] }]],
    pts: [[-80, -60, 8], [0, -65, 10], [80, -55, 12], [110, -5, 10], [80, 40, 6], [100, 80, 2], [40, 100, 0], [-20, 70, 0], [-80, 95, 0], [-115, 50, 2], [-95, 0, 4], [-115, -40, 6]] },
  castleF: { n: 'Battlement Sprint', zones: [[0, 'battle', { name: 'The Battlements', wallH: 2.6 }], [0.5, 'cells', { name: 'The Cells', wallH: 8, light: [0.5, 0.44, 0.44] }]],
    pts: [[-80, -60, 10], [0, -65, 12], [80, -55, 12], [110, -10, 10], [85, 35, 6], [105, 80, 2], [45, 100, 0], [-15, 75, 0], [-75, 100, 0], [-115, 55, 2], [-95, 5, 6], [-115, -40, 8]] },
  sewerF: { n: 'Shrine Sprint', zones: [[0, 'ratcult', { name: 'The Rat Cult Shrine', wallH: 8, light: [0.55, 0.4, 0.38] }], [0.5, 'reservoir', { name: 'The Cream Reservoir', wallH: 1.5, light: [0.6, 0.58, 0.5] }]],
    pts: [[-85, -60, 0], [0, -65, 0], [85, -55, 0], [115, -5, -2], [85, 40, -4], [110, 85, -4], [50, 105, -2], [-10, 75, 0], [-70, 100, 0], [-115, 55, 0], [-95, 5, 0], [-115, -40, 0]] },
  arcadeF: { n: 'Machine Sprint', zones: [[0, 'machine', { name: 'Inside the Machine', wallH: 0.8, light: [0.5, 0.62, 0.5], floating: 1 }], [0.5, 'prizes', { name: 'The Prize Counter', wallH: 3 }]],
    pts: [[-80, -60, 0], [0, -65, 0], [80, -60, 0], [110, -15, 0], [80, 25, 0], [110, 65, 0], [70, 100, 0], [10, 80, 0], [-50, 100, 0], [-105, 70, 0], [-85, 20, 0], [-115, -25, 0]] },
  spuzzF: { n: 'Furnace Sprint', zones: [[0, 'furnace', { name: 'The Furnace', creamOff: 1, light: [0.7, 0.48, 0.36], wallH: 5 }], [0.5, 'mincer', { name: 'The Mincer Line', light: [0.62, 0.42, 0.42] }]],
    pts: [[-80, -60, 0], [0, -65, 0], [80, -55, 4], [115, -5, 6], [85, 40, 6], [105, 85, 2], [45, 105, 0], [-15, 75, 0], [-75, 100, 0], [-115, 55, 0], [-95, 5, 0], [-115, -40, 0]] },
  lairF: { n: 'Crypt Sprint', zones: [[0, 'crypt', { name: 'The Crypt of Blum', wallH: 7, light: [0.5, 0.44, 0.58] }], [0.5, 'blackkeep', { name: 'The Black Keep', wallH: 4, light: [0.5, 0.42, 0.5] }]],
    pts: [[-80, -60, 0], [0, -65, 0], [80, -55, 0], [115, -10, 2], [85, 35, 2], [105, 80, 0], [45, 100, 0], [-15, 70, 0], [-75, 95, 2], [-115, 50, 2], [-95, 0, 0], [-115, -40, 0]] },
  picnicF: { n: 'Tower Sprint', zones: [[0, 'yarn', { name: "Sir Johnathan's Scratching Tower", wallH: 6, light: [0.64, 0.52, 0.56] }], [0.5, 'gkitchen', { name: "Greebo's Kitchen", wallH: 7, light: [0.68, 0.58, 0.5] }]],
    pts: [[-90, -65, 0], [0, -70, 0], [90, -60, 0], [125, -10, 0], [95, 40, 0], [115, 90, 0], [50, 110, 0], [-15, 80, 0], [-80, 105, 0], [-125, 60, 0], [-105, 5, 0], [-125, -45, 0]] },
  dungeonF: { n: 'Cavern Sprint', zones: [[0, 'caverns', { name: 'The Crystal Caverns', light: [0.46, 0.5, 0.64] }], [0.5, 'depths', { name: 'The Lava Depths', creamOff: 1, light: [0.72, 0.46, 0.34], wallH: 6 }]],
    pts: [[-75, -55, 0], [0, -60, 0], [75, -50, -2], [105, -5, -4], [80, 35, -6], [100, 75, -6], [45, 95, -4], [-10, 70, -2], [-65, 90, 0], [-105, 50, 0], [-85, 5, 0], [-105, -35, 0]] },
  voidF: { n: 'Core Sprint', zones: [[0, 'core', { name: 'The Void Core', floating: 1, wallH: 1, light: [0.52, 0.44, 0.66] }], [0.5, 'field', { name: 'The World Map', wallH: 0.6, light: [0.64, 0.6, 0.56] }]],
    pts: [[-90, -65, 0], [0, -70, 2], [90, -60, 6], [125, -10, 8], [95, 40, 6], [115, 90, 2], [50, 110, 0], [-15, 80, 0], [-80, 105, 0], [-125, 60, 0], [-105, 5, 0], [-125, -45, 0]] },
  moonF: { n: 'Temple Sprint', zones: [[0, 'temple', { name: 'The Eclipse Temple', wallH: 3, light: [0.5, 0.4, 0.46] }], [0.5, 'crater', { name: 'The Great Crater', wallH: 4, light: [0.56, 0.42, 0.42] }]],
    pts: [[-100, -75, 0], [0, -80, 0], [100, -70, 0], [140, -15, -4], [105, 45, -8], [130, 100, -8], [55, 125, -4], [-20, 90, 0], [-90, 120, 0], [-140, 70, 0], [-115, 10, 0], [-140, -50, 0]] }
};
/* four sprint shapes; each place uses one, maybe mirrored, with its own hills */
var SHAPES = {
  wave: [[-80, -60], [0, -65], [80, -60], [115, -15], [90, 35], [110, 75], [60, 95], [0, 70], [-60, 95], [-110, 60], [-100, 5], [-120, -40]],
  bean: [[-90, -55], [0, -72], [90, -62], [125, -12], [115, 50], [65, 85], [22, 48], [-22, 48], [-65, 88], [-115, 62], [-125, 2]],
  pin: [[-115, -65], [0, -70], [115, -62], [138, -22], [105, 12], [0, 16], [-62, 24], [-42, 62], [42, 64], [112, 74], [125, 108], [62, 128], [-62, 122], [-128, 95], [-135, 5]],
  kid: [[-125, -42], [-42, -58], [42, -46], [122, -62], [155, -10], [124, 42], [62, 52], [32, 86], [-32, 74], [-92, 90], [-145, 42]]
};
var SHAPEFOR = { clubrowF: ['bean', 1, 0], parkF: ['pin', 1, 6], cafeF: ['kid', -1, 8], castleF: ['wave', -1, 6], sewerF: ['pin', -1, -3], arcadeF: ['kid', 1, 0], spuzzF: ['bean', -1, 5], lairF: ['kid', -1, 2], picnicF: ['wave', 1, 6], dungeonF: ['bean', 1, -5], voidF: ['pin', 1, 8], moonF: ['kid', 1, -8] };
(function () {
  Object.keys(SPRINT).forEach(function (k) { var sf = SHAPEFOR[k], sh = SHAPES[sf[0]], n = sh.length; SPRINT[k].pts = sh.map(function (q, i) { return [q[0] * sf[1], q[1], Math.round(sf[2] * (0.5 - 0.5 * Math.cos(i / n * Math.PI * 2)))]; }); });
  Object.keys(FULL).forEach(function (k) {
    var d = FULL[k], base = k.replace(/F$/, ''); d.full = 1; d.place = base; COURSES[k] = d;
    var s = SPRINT[k], sp = {}; for (var q in d) sp[q] = d[q];
    sp.n = s.n; sp.zones = s.zones; sp.pts = s.pts; sp.laps = SHAPEFOR[k][0] === 'pin' ? 2 : 3; sp.sprint = 1; sp.full = 0; sp.ramps = []; sp.boxes = [0.2, 0.7]; sp.boosts = [[0.4, 0], [0.9, 0]]; sp.drops = [[0.1, 0, 4], [0.6, 0, 4]]; sp.goo = d.goo ? [0.3, 0.8] : undefined; sp.belts = undefined;
    COURSES[k.replace(/F$/, 'S')] = sp;
  });
  CUPS.push({ id: 'ctour', n: 'Cream Tour', ic: 'it_pie', courses: ['clubrowF', 'parkF', 'cafeF', 'castleF'], lock: 'Finish the Cream Cup in the top three' });
  CUPS.push({ id: 'btour', n: 'Blood Tour', ic: 'it_vial', courses: ['sewerF', 'arcadeF', 'spuzzF', 'lairF'], lock: 'Finish the Blood Cup in the top three' });
  CUPS.push({ id: 'mtour', n: 'Moon Tour', ic: 'it_moon', courses: ['picnicF', 'dungeonF', 'voidF', 'moonF'], lock: 'Finish the Moon Cup in the top three' });
  COURSEORDER = []; CUPS.forEach(function (c) { COURSEORDER = COURSEORDER.concat(c.courses); });
})();
