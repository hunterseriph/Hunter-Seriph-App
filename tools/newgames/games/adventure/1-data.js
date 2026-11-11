/* =====================================================================================================
   SPERMHOG ADVENTURE: Sonic Adventure our way. Four stories that cross over: Cumhead (speed, homing attack, spin dash:
   the most stages), Greebo (glides and climbs, hunting the three ingredients of the ultimate cream pie with a radar),
   Spermaid (swims in water stages, hops on land) and Shithead Laboozie (the sheriff of Cum City: lock on and throw a
   volley of Flaming Bags of Shit, a mini boss at the end of every stage). TB is after the seven Cum Chalices. Finish
   all four and the last story opens: TB has swallowed the chalices and become SUPER TB on their bad side; Cumhead takes
   the good side and goes Super for the final fight. Between stages you walk the hub: Cum City, Ejaculand and the Sperm
   Isles. The Homunculus Garden (instead of a chao garden): hatch every breed, raise them, race them, enter them in
   karate tournaments, send them to the Academy, give them jobs and hats.
   Everyone is drawn from their own sprites standing up in a 3D world, Saturn style.
   ===================================================================================================== */
var W = 480, H = 270;
var CHARS = {
  cumhead: { n: 'CUMHEAD', run: 'ch_rn', nrun: 8, idle: 'ch_idle', nidle: 7, jp: 'ch_jump', njump: 4, hurt: 'ch_hurt0', h: 1.45, top: 22, acc: 16, moves: 'speed', col: '#f0c070' },
  greebo: { n: 'GREEBO', run: 'greebo_s', nrun: 3, idle: 'greebo_s', nidle: 1, jumpS: 'greebo_s1', h: 1.3, top: 11, acc: 10, moves: 'hunt', col: '#ffe36a' },
  spermaid: { n: 'SPERMAID', run: 'spermaid_s', nrun: 3, idle: 'spermaid_s', nidle: 1, jumpS: 'spermaid_s2', h: 1.4, top: 10, acc: 9, moves: 'swim', col: '#4adfff' },
  lab: { n: 'SHITHEAD LABOOZIE', run: 'lab_run', nrun: 6, idle: 'lab_idle', nidle: 4, jp: 'lab_jump', njump: 3, h: 1.45, top: 9, acc: 10, moves: 'shoot', col: '#ff7a20' },
  super: { n: 'SUPER CUMHEAD', run: 'ch_rn', nrun: 8, idle: 'ch_idle', nidle: 7, jp: 'ch_jump', njump: 4, h: 1.45, top: 30, acc: 24, moves: 'super', col: '#ffe36a', gold: 1 }
};
fix(); function fix() { CHARS.cumhead.jumpV = 9.5; CHARS.greebo.jumpV = 9; CHARS.spermaid.jumpV = 11; CHARS.lab.jumpV = 8.5; CHARS.super.jumpV = 11; }
var HUBS = {
  city: { n: 'CUM CITY', sky: [0.1, 0.02, 0.04], ground: '#2a1a1e', ground2: '#3a2228', wall: '#1a0a10', fog: [0.1, 0.02, 0.04], song: 'hogcity', fronts: ['fac_cafe', 'fac_amy', 'fac_tb', 'fac_saba', 'fac_greebo', 'fac_pulsar', 'fac_arcade', 'fac_club'] },
  park: { n: 'EJACULAND', sky: [0.25, 0.06, 0.18], ground: '#3a1a2a', ground2: '#5a2a3a', wall: '#2a0a1a', fog: [0.25, 0.06, 0.18], song: 'park', fronts: ['fac_joff', 'fac_bonjo', 'fac_beebs'] },
  isles: { n: 'THE SPERM ISLES', sky: [0.45, 0.62, 0.78], ground: '#d8c898', ground2: '#c8b888', wall: '#6a5a3a', fog: [0.45, 0.62, 0.78], song: 'town', fronts: ['fac_sanct', 'fac_t'] }
};
/* the action stages: one layout each, played by whoever's story it is (like Sonic Adventure, the same place again with another job) */
var STAGES = {
  rooftop: { n: 'ROOFTOP RUN', hub: 'city', theme: 'city', len: 40, kind: 'speed', foes: ['crawler', 'bat', 'knight'] },
  sewer: { n: 'THE CREAM SEWERS', hub: 'city', theme: 'sewer', len: 30, kind: 'water', foes: ['creamblob', 'rat', 'jelly'] },
  coaster: { n: 'THE BIG DIPPER', hub: 'park', theme: 'park', len: 44, kind: 'speed', foes: ['clown', 'balloon', 'imp'] },
  funhouse: { n: 'THE FUNHOUSE', hub: 'park', theme: 'park', len: 24, kind: 'hunt', foes: ['clown', 'balloon', 'corkbot'] },
  beach: { n: 'SPUNK BEACH', hub: 'isles', theme: 'isles', len: 38, kind: 'speed', foes: ['crawler', 'wasp', 'harpy'] },
  reef: { n: 'THE CREAM REEF', hub: 'isles', theme: 'reef', len: 30, kind: 'water', foes: ['jelly', 'creamblob', 'harpy'] },
  volcano: { n: 'MOUNT SPUNKMORE', hub: 'isles', theme: 'volcano', len: 42, kind: 'speed', foes: ['imp', 'skeleton', 'knight'] },
  lair: { n: "TB'S CUMSHIP", hub: 'city', theme: 'ship', len: 46, kind: 'speed', foes: ['knight', 'corkbot', 'imp', 'skeleton'] }
};
var THEMES = {
  city: { top: '#3a1a22', top2: '#2a1218', side: '#c4121c', sky: [0.12, 0.02, 0.05], fog: [0.12, 0.02, 0.05], song: 'hogcity' },
  sewer: { top: '#5a4a32', top2: '#4a3c28', side: '#3a2e20', sky: [0.08, 0.07, 0.04], fog: [0.08, 0.07, 0.04], water: [0.95, 0.88, 0.7], song: 'sewer' },
  park: { top: '#ff7ab8', top2: '#e05a98', side: '#ffe36a', sky: [0.3, 0.08, 0.22], fog: [0.3, 0.08, 0.22], song: 'park' },
  isles: { top: '#e8d8a8', top2: '#d8c898', side: '#3aa8b8', sky: [0.45, 0.65, 0.8], fog: [0.45, 0.65, 0.8], water: [0.3, 0.7, 0.85], song: 'town' },
  reef: { top: '#e8b8a0', top2: '#d8a890', side: '#4a8aa8', sky: [0.2, 0.45, 0.6], fog: [0.2, 0.45, 0.6], water: [0.35, 0.65, 0.85], song: 'pulsar3' },
  volcano: { top: '#4a2a1a', top2: '#3a2014', side: '#ff6a20', sky: [0.25, 0.06, 0.03], fog: [0.25, 0.06, 0.03], song: 'furnace' },
  ship: { top: '#4a4a52', top2: '#3a3a42', side: '#c4121c', sky: [0.04, 0.02, 0.06], fog: [0.04, 0.02, 0.06], song: 'boss' }
};
var FOES = { crawler: 'f_crawler_', bat: 'f_bat_', knight: 'f_knight_', creamblob: 'f_creamblob_', rat: 'f_rat_', jelly: 'f_jelly_', clown: 'f_clown_', balloon: 'f_balloon_', imp: 'f_imp_', corkbot: 'f_corkbot_', wasp: 'f_wasp_', harpy: 'f_harpy_', skeleton: 'f_skeleton_', slime: 'f_slime_' };
var FLY = { bat: 1, balloon: 1, imp: 1, wasp: 1, harpy: 1, jelly: 1 };
var BOSSES = {
  beast: { n: 'THE CUM-STARVED BEAST', s: 'f_beast_', hp: 8, sc: 4, moves: ['charge', 'shots', 'charge', 'jump'] },
  pig: { n: 'BROTHERS LOAD PIGGY', s: 'f_pig_', hp: 8, sc: 3.4, moves: ['charge', 'coins', 'jump'] },
  kraken: { n: 'THE CREAM KRAKEN', s: 'f_kraken_', hp: 8, sc: 3.6, moves: ['shots', 'ring', 'shots'] },
  golem: { n: 'THE PIE GOLEM', s: 'f_golem_', hp: 8, sc: 4, moves: ['charge', 'jump', 'ring'] },
  hotload: { n: 'THE HOT LOAD', s: 'f_hotload_', hp: 8, sc: 3.4, moves: ['ring', 'shots', 'jump'] },
  execu: { n: 'THE BLUM EXECUTIONER', s: 'f_execu_', hp: 10, sc: 3.4, moves: ['charge', 'ring', 'jump'] },
  mega: { n: 'MEGA TB-BOT', s: 'f_mega_', hp: 12, sc: 2.6, moves: ['shots', 'ring', 'charge', 'jump'] },
  tb: { n: 'TB', s: 'npc_tb', hp: 10, sc: 4.5, moves: ['charge', 'pills', 'jump', 'pills'] },
  supertb: { n: 'SUPER TB', s: 'npc_tb', hp: 16, sc: 7, moves: ['pills', 'ring', 'charge', 'pills', 'ring'], dark: 1 }
};
/* the stories. 'say' lines are spoken over a picture of who says them; TB only ever says his own lines */
var STORIES = {
  cumhead: { n: "CUMHEAD'S STORY", ev: [
    { say: [['CUMHEAD', 'Something just fell out of the sky on Clubhouse Row. Something gold, shaped like a cup.'], ['TB', 'holy shit!']] },
    { stage: 'rooftop' }, { boss: 'beast', hub: 'city' },
    { say: [['CUMHEAD', 'A Cum Chalice. TB is after all seven. Ejaculand next.']] }, { stage: 'coaster' }, { boss: 'pig', hub: 'park' },
    { say: [['GREEBO', 'Cumhead! The Isles! I saw TB down by the beach!']] }, { stage: 'beach' }, { stage: 'volcano' },
    { say: [['TB', 'where the fuck do you think you\'re goin? Prick!']] }, { stage: 'lair' }, { boss: 'tb', hub: 'city' }] },
  greebo: { n: "GREEBO'S STORY", ev: [
    { say: [['GREEBO', 'The ultimate cream pie. Three ingredients nobody has ever found. The recipe was my nan\'s.'], ['GREEBO', 'Fresh cream pies. Don\'t ask what\'s in them.']] },
    { stage: 'funhouse' }, { stage: 'sewer' }, { boss: 'golem', hub: 'park' }, { stage: 'reef' },
    { say: [['GREEBO', 'All three. Now I just need an oven big enough... and that chalice TB keeps waving about would make a lovely pie dish.']] }] },
  spermaid: { n: "SPERMAID'S STORY", ev: [
    { say: [['SPERMAID', 'Sweetie! Even down here I keep a little stall. But TB has poured something black into my sea.']] },
    { stage: 'reef' }, { boss: 'kraken', hub: 'isles' }, { stage: 'sewer' }, { stage: 'beach' }, { boss: 'hotload', hub: 'isles' },
    { say: [['SPERMAID', 'The sea is clean again. Now to find Cumhead before TB does.']] }] },
  lab: { n: "SHITHEAD LABOOZIE'S STORY", ev: [
    { say: [['LABOOZIE', 'Sheriff of Cum City. TB has his boys on every roof. Time to clean up the town.']] },
    { stage: 'rooftop' }, { stage: 'coaster' }, { boss: 'execu', hub: 'park' }, { stage: 'volcano' }, { boss: 'mega', hub: 'city' },
    { say: [['LABOOZIE', 'Town\'s clean. Now where did TB run off to with all them cups?']] }] },
  super: { n: 'THE LAST STORY', ev: [
    { say: [['TB', 'Im a fuckin piggy'], ['CUMHEAD', 'He has swallowed all seven chalices. He is pulling the bad half out of them...'], ['GREEBO', 'Then you take the good half, Cumhead!'], ['SPERMAID', 'Go on, sweetie!'], ['LABOOZIE', 'We got your back.']] },
    { boss: 'supertb', hub: 'city', who: 'super' },
    { say: [['CUMHEAD', 'It\'s over. The chalices are just cups again.'], ['TB', 'im so fucked right now']] }] }
};
var BREEDS = ['gloop', 'guard', 'ember', 'frost', 'volt', 'medic', 'leech', 'scout', 'goldie', 'titan', 'blood'];
var BREEDN = { gloop: 'Gloop', guard: 'Bulwark', ember: 'Embertail', frost: 'Frostbite', volt: 'Voltling', medic: 'Mendling', leech: 'Leechling', scout: 'Peeper', goldie: 'Goldie', titan: 'Titan', blood: 'Bloodmoon' };
