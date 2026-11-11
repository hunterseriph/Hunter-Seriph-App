/* =====================================================================================================
   SPERMHOG ADVENTURE: Sonic Adventure our way, fully 3D (update 132, his playtest: everything 3D, decorated levels, a
   real hub world to walk round, full cutscenes, drops not coins, a physical Homunculus Garden, the last story secret).
   Four stories that cross over: Cumhead (speed, homing attack, spin dash), Greebo (glides and climbs, hunting the three
   ingredients of the ultimate cream pie with a radar), Spermaid (swims in the water stages) and Shithead Laboozie (the
   sheriff of Cum City: lock on and throw a volley of Flaming Bags of Shit, a mini boss at the end of every stage). TB is
   after the seven Cum Chalices. Between stages you walk the hubs: Cum City, Ejaculand and the Sperm Isles, with the
   stages' ways in out in the world (a fire escape, a manhole, the coaster queue, the funhouse door, the beach, the reef
   jetty, the volcano path, TB's Cumship). Story scenes play out in 3D in the hub with everyone acting. The Homunculus
   Garden is through the Clubhouse back door: hatch eggs on their nests, pick fruit off the trees and feed it to them,
   the race track, the karate ring, the Academy, the job board and the hat stand are all places in it.
   ===================================================================================================== */
var W = 480, H = 270, TSZ = 2.4;
var CHARS = {
  cumhead: { n: 'CUMHEAD', rig: 'cumhead', top: 22, acc: 16, jumpV: 9.5, moves: 'speed', col: '#f0c070' },
  greebo: { n: 'GREEBO', rig: 'greebo', top: 11, acc: 10, jumpV: 9, moves: 'hunt', col: '#ffe36a' },
  spermaid: { n: 'SPERMAID', rig: 'spermaid', top: 10, acc: 9, jumpV: 11, moves: 'swim', col: '#4adfff' },
  lab: { n: 'SHITHEAD LABOOZIE', rig: 'laboozie', top: 9, acc: 10, jumpV: 8.5, moves: 'shoot', col: '#ff7a20' },
  super: { n: 'SUPER CUMHEAD', rig: 'cumhead', top: 30, acc: 24, jumpV: 11, moves: 'super', col: '#ffe36a', gold: 1 }
};
var HUBS = {
  city: { n: 'CUM CITY', sky: [0.1, 0.02, 0.05], fog: [0.1, 0.02, 0.05], song: 'hogcity' },
  park: { n: 'EJACULAND', sky: [0.22, 0.05, 0.16], fog: [0.22, 0.05, 0.16], song: 'park' },
  isles: { n: 'THE SPERM ISLES', sky: [0.42, 0.6, 0.76], fog: [0.42, 0.6, 0.76], song: 'town' },
  garden: { n: 'THE HOMUNCULUS GARDEN', sky: [0.5, 0.25, 0.32], fog: [0.5, 0.25, 0.32], song: 'pulsar1' }
};
var STAGES = {
  rooftop: { n: 'ROOFTOP RUN', hub: 'city', theme: 'city', len: 60, kind: 'speed', foes: ['gimp', 'bat', 'rat'] },
  sewer: { n: 'THE CREAM SEWERS', hub: 'city', theme: 'sewer', len: 46, kind: 'water', foes: ['blob', 'rat', 'jelly'] },
  coaster: { n: 'THE BIG DIPPER', hub: 'park', theme: 'park', len: 64, kind: 'speed', foes: ['clown', 'balloon', 'acrobat'] },
  funhouse: { n: 'THE FUNHOUSE', hub: 'park', theme: 'funhouse', len: 30, kind: 'hunt', foes: ['clown', 'pieclown', 'balloon'] },
  beach: { n: 'SPUNK BEACH', hub: 'isles', theme: 'isles', len: 58, kind: 'speed', foes: ['crab', 'wasp', 'blob'] },
  reef: { n: 'THE CREAM REEF', hub: 'isles', theme: 'reef', len: 46, kind: 'water', foes: ['jelly', 'crab', 'blob'] },
  volcano: { n: 'MOUNT SPUNKMORE', hub: 'isles', theme: 'volcano', len: 62, kind: 'speed', foes: ['imp', 'bat', 'strongman'] },
  lair: { n: "TB'S CUMSHIP", hub: 'city', theme: 'ship', len: 70, kind: 'speed', foes: ['gimp', 'butcher', 'pusher', 'imp'] }
};
var THEMES = { // floor / wall textures from Psycho Nightmare's atlas and our own, sky and fog, the song
  city: { top: 'pave', side: 'citywall', edge: '#c4121c', sky: [0.12, 0.02, 0.05], amb: [0.62, 0.5, 0.52], song: 'hogcity' },
  sewer: { top: 'stonef', side: 'wetbrick', edge: '#c8b880', sky: [0.1, 0.09, 0.05], amb: [0.78, 0.74, 0.6], water: [0.95, 0.88, 0.7], song: 'sewer' },
  park: { top: 'parkfloor', side: 'stripes', edge: '#ffe36a', sky: [0.3, 0.08, 0.22], amb: [0.75, 0.62, 0.7], song: 'park' },
  funhouse: { top: 'checker', side: 'polka', edge: '#ff2630', sky: [0.16, 0.04, 0.12], amb: [0.7, 0.58, 0.66], song: 'park' },
  isles: { top: 'sand', side: 'rockt', edge: '#3aa8b8', sky: [0.45, 0.65, 0.8], amb: [0.85, 0.82, 0.78], water: [0.3, 0.7, 0.85], song: 'town' },
  reef: { top: 'sand', side: 'coral', edge: '#ff7ab8', sky: [0.2, 0.45, 0.6], amb: [0.7, 0.78, 0.82], water: [0.35, 0.65, 0.85], song: 'pulsar3' },
  volcano: { top: 'ash', side: 'rockt', edge: '#ff6a20', sky: [0.25, 0.06, 0.03], amb: [0.7, 0.5, 0.45], lava: 1, song: 'furnace' },
  ship: { top: 'shipdeck', side: 'hazard', edge: '#c4121c', sky: [0.04, 0.02, 0.06], amb: [0.55, 0.5, 0.58], song: 'boss' }
};
/* the foes: TB's boys are Psycho Nightmare's 3D people; the rest are built in 1b-models.js */
var FOES = { gimp: { rig: 'gimp' }, clown: { rig: 'clown' }, pieclown: { rig: 'pieclown', shoot: 1 }, acrobat: { rig: 'acrobat' }, butcher: { rig: 'butcher', held: 'weapon' }, pusher: { rig: 'pusher', shoot: 1 }, strongman: { rig: 'strongman' },
  rat: { m: 'rat' }, bat: { m: 'bat', fly: 1 }, blob: { m: 'blob' }, jelly: { m: 'jelly', fly: 1 }, balloon: { m: 'balloon', fly: 1 }, crab: { m: 'crab' }, wasp: { m: 'wasp', fly: 1, shoot: 1 }, imp: { m: 'imp', fly: 1, shoot: 1 } };
var BOSSES = {
  beast: { n: 'THE CUM-STARVED BEAST', rig: 'stag', sc: 2.2, tint: [0.9, 0.75, 0.7], hp: 8, moves: ['charge', 'shots', 'charge', 'jump'] },
  pig: { n: 'BROTHERS LOAD PIGGY', m: 'pig', sc: 2.6, hp: 8, moves: ['charge', 'coins', 'jump'] },
  kraken: { n: 'THE CREAM KRAKEN', m: 'kraken', sc: 2.4, hp: 8, moves: ['shots', 'ring', 'shots'] },
  golem: { n: 'THE PIE GOLEM', rig: 'strongman', sc: 2.4, tint: [1, 0.9, 0.7], hp: 8, moves: ['charge', 'jump', 'ring'] },
  hotload: { n: 'THE HOT LOAD', m: 'hotload', sc: 2.2, hp: 8, moves: ['ring', 'shots', 'jump'] },
  execu: { n: 'THE BLUM EXECUTIONER', rig: 'butcher', sc: 2.3, tint: [0.75, 0.6, 0.9], hp: 10, moves: ['charge', 'ring', 'jump'] },
  mega: { n: 'MEGA TB-BOT', rig: 'tbmad', sc: 2.5, tint: [0.75, 0.8, 0.9], hp: 12, moves: ['shots', 'ring', 'charge', 'jump'] },
  tb: { n: 'TB', rig: 'tbmad', sc: 1.5, hp: 10, moves: ['charge', 'pills', 'jump', 'pills'] },
  supertb: { n: 'SUPER TB', rig: 'tbmad', sc: 3.2, tint: [0.45, 0.2, 0.35], hp: 16, moves: ['pills', 'ring', 'charge', 'pills', 'ring'], dark: 1 }
};
/* the stories. Story scenes are played out in 3D (5-hub.js): 'at' is the place, 'cast' who stands there, 'fx' what happens;
   each line is spoken by its speaker with the camera on them. TB only ever says his own lines. */
var STORIES = {
  cumhead: { n: "CUMHEAD'S STORY", ev: [
    { at: 'city', cast: ['cumhead', 'tb'], fx: 'chalice', say: [['CUMHEAD', 'Something just fell out of the sky on Clubhouse Row. Something gold, shaped like a cup.'], ['TB', 'holy shit!']] },
    { stage: 'rooftop' }, { boss: 'beast', hub: 'city' },
    { at: 'city', cast: ['cumhead'], fx: 'hold', say: [['CUMHEAD', 'A Cum Chalice. TB is after all seven. Ejaculand next.']] }, { stage: 'coaster' }, { boss: 'pig', hub: 'park' },
    { at: 'park', cast: ['cumhead', 'greebo'], fx: 'run', say: [['GREEBO', 'Cumhead! The Isles! I saw TB down by the beach!']] }, { stage: 'beach' }, { stage: 'volcano' },
    { at: 'isles', cast: ['cumhead', 'tb'], fx: 'ship', say: [['TB', 'where the fuck do you think you\'re goin? Prick!']] }, { stage: 'lair' }, { boss: 'tb', hub: 'city' }] },
  greebo: { n: "GREEBO'S STORY", ev: [
    { at: 'city', cast: ['greebo'], fx: 'pie', say: [['GREEBO', 'The ultimate cream pie. Three ingredients nobody has ever found. The recipe was my nan\'s.'], ['GREEBO', 'Fresh cream pies. Don\'t ask what\'s in them.']] },
    { stage: 'funhouse' }, { stage: 'sewer' }, { boss: 'golem', hub: 'park' }, { stage: 'reef' },
    { at: 'isles', cast: ['greebo'], fx: 'pie', say: [['GREEBO', 'All three. Now I just need an oven big enough... and that chalice TB keeps waving about would make a lovely pie dish.']] }] },
  spermaid: { n: "SPERMAID'S STORY", ev: [
    { at: 'isles', cast: ['spermaid', 'tb'], fx: 'blacksea', say: [['SPERMAID', 'Sweetie! Even down here I keep a little stall. But TB has poured something black into my sea.']] },
    { stage: 'reef' }, { boss: 'kraken', hub: 'isles' }, { stage: 'sewer' }, { stage: 'beach' }, { boss: 'hotload', hub: 'isles' },
    { at: 'isles', cast: ['spermaid'], fx: 'clean', say: [['SPERMAID', 'The sea is clean again. Now to find Cumhead before TB does.']] }] },
  lab: { n: "SHITHEAD LABOOZIE'S STORY", ev: [
    { at: 'city', cast: ['lab', 'gimp', 'gimp'], fx: 'roofs', say: [['LABOOZIE', 'Sheriff of Cum City. TB has his boys on every roof. Time to clean up the town.']] },
    { stage: 'rooftop' }, { stage: 'coaster' }, { boss: 'execu', hub: 'park' }, { stage: 'volcano' }, { boss: 'mega', hub: 'city' },
    { at: 'city', cast: ['lab'], fx: 'hold', say: [['LABOOZIE', 'Town\'s clean. Now where did TB run off to with all them cups?']] }] },
  super: { n: 'THE LAST STORY', ev: [
    { at: 'city', cast: ['tb', 'cumhead', 'greebo', 'spermaid', 'lab'], fx: 'supertb', say: [['TB', 'Im a fuckin piggy'], ['CUMHEAD', 'He has swallowed all seven chalices. He is pulling the bad half out of them...'], ['GREEBO', 'Then you take the good half, Cumhead!'], ['SPERMAID', 'Go on, sweetie!'], ['LABOOZIE', 'We got your back.'], ['CUMHEAD', '...'], ['CUMHEAD', 'All right. Let\'s go.']] },
    { boss: 'supertb', hub: 'city', who: 'super' },
    { at: 'city', cast: ['cumhead', 'tb', 'greebo', 'spermaid', 'lab'], fx: 'end', say: [['CUMHEAD', 'It\'s over. The chalices are just cups again.'], ['TB', 'im so fucked right now']] }] }
};
var BREEDS = ['gloop', 'guard', 'ember', 'frost', 'volt', 'medic', 'leech', 'scout', 'goldie', 'titan', 'blood'];
var BREEDN = { gloop: 'Gloop', guard: 'Bulwark', ember: 'Embertail', frost: 'Frostbite', volt: 'Voltling', medic: 'Mendling', leech: 'Leechling', scout: 'Peeper', goldie: 'Goldie', titan: 'Titan', blood: 'Bloodmoon' };
