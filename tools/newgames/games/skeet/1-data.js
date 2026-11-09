/* =====================================================================================================
   SKEET FIGHTER: a side-scrolling brawler with Street Fighter moves (his game: six stages, a boss at the end of
   each, Cumhead, Spermaid, Greebo and the Homunculus). Blumhead has brainwashed a load of homunculi with his goo and
   set them loose with his cult; beat the goo out of them (they wake up and run home) and take Blumhead down.
   This file is the data: fighters and their moves, foes, bosses, stages, weapons and food.
   ===================================================================================================== */
var FLOOR = 122, DEPTH = 64, GRAV = 980; // the walkable floor is a band from y FLOOR (far) to FLOOR + DEPTH (near)

/* a move: pose (frame), st startup, ac active, rc recovery (seconds), box [x0, x1, h0, h1] in front of the fighter
   (x forwards, h up from the feet), dmg, kb (push), lift (knocks up), kd (knocks down), stun, hs (hit stop), lunge
   (moves forwards while it comes out), arc (a swoosh), sfx, meter, inv (cannot be hit while it comes out) */
function MV(o) { var m = { st: 0.06, ac: 0.07, rc: 0.14, box: [6, 30, 20, 44], dmg: 6, kb: 30, lift: 0, kd: false, stun: 0.32, hs: 0.05, lunge: 0, sfx: 'hit', meter: 4, zr: 9 }; for (var k in o) m[k] = o[k]; return m; }

var HEROES = {
  cumhead: { n: 'CUMHEAD', k: 'cu', hp: 130, spd: 74, run: 158, jump: 330, w: 20, ht: 50, scale: 1, col: '#ffc840',
    blurb: 'All rounder. Fireballs, a rising uppercut, a big load at the end.', stats: [3, 3, 3],
    face: 'hud_cu',
    combo: [MV({ an: 'jab', dmg: 6, box: [6, 30, 24, 44] }), MV({ an: 'cross', dmg: 7, box: [6, 32, 24, 44] }), MV({ an: 'kick', dmg: 9, st: 0.08, ac: 0.08, rc: 0.18, kb: 60, box: [4, 32, 10, 34], arc: '#f1e7d0' }),
      MV({ an: 'upper', n: 'UPPERCUT', dmg: 14, st: 0.1, ac: 0.1, rc: 0.3, kb: 110, lift: 280, kd: true, hs: 0.09, box: [2, 28, 20, 64], sfx: 'heavy', arc: '#ffc840', meter: 8 })],
    air: MV({ an: 'kick', n: 'FLYING KICK', dmg: 12, st: 0.05, ac: 0.6, rc: 0.1, kb: 150, kd: true, box: [2, 30, 4, 32], hs: 0.07 }),
    dash: MV({ an: 'kick', n: 'FLYING KICK', dmg: 13, st: 0.04, ac: 0.22, rc: 0.22, kb: 180, kd: true, lunge: 260, box: [2, 30, 8, 36], hs: 0.08, arc: '#ffc840' }),
    knee: MV({ an: 'cross', dmg: 7, st: 0.06, ac: 0.06, rc: 0.16, kb: 0, stun: 0.4 }),
    sp: { fire: { n: 'CUMHADOKEN', an: 'jab', st: 0.18, rc: 0.3, shot: { spr: 's_cream', spd: 260, dmg: 14, stun: 0.5, kb: 90 }, ex: { spr: 's_creambig', spd: 300, dmg: 24, kd: true, pierce: 1, kb: 200 } },
      rise: { n: 'SHORYU-SPURT', an: 'upper', st: 0.04, inv: true, vh: 360, fwd: 60, hits: 3, dmg: 7, kd: true, lift: 340, box: [0, 26, 10, 70] },
      dash: { n: 'DRIP DASH', an: 'kick', st: 0.06, lunge: 340, dur: 0.32, dmg: 12, kd: true, kb: 220, box: [0, 28, 6, 44] },
      ground: { n: 'PUDDLE STOMP', an: 'pound', st: 0.2, ring: 54, dmg: 11, kd: true, lift: 220, fx: 'fx_cream' },
      sup: { n: 'BIG LOAD BEAM', kind: 'beam', dmg: 70, col: '#fffbe8' } },
    quote: 'You picked the wrong droplet.' },
  spermaid: { n: 'SPERMAID', k: 'sp', hp: 105, spd: 88, run: 175, jump: 360, float: 1, w: 18, ht: 46, col: '#2aa0a8',
    blurb: 'Fast and floaty. Tail combos, waves and bubbles.', stats: [2, 5, 4],
    face: 'hud_sp',
    combo: [MV({ an: 'jab', dmg: 5, st: 0.04, ac: 0.06, rc: 0.1, box: [4, 30, 4, 30], arc: '#7ae0e0' }), MV({ an: 'cross', dmg: 5, st: 0.04, ac: 0.06, rc: 0.1, box: [4, 32, 4, 30], arc: '#7ae0e0' }),
      MV({ an: 'kick', n: 'TAIL SPIN', dmg: 6, st: 0.05, ac: 0.12, rc: 0.12, kb: 40, box: [-14, 30, 2, 34], arc: '#7ae0e0', spin: 1 }),
      MV({ an: 'cross', n: 'TIDE TAIL', dmg: 11, st: 0.08, ac: 0.08, rc: 0.28, kb: 150, kd: true, lift: 200, hs: 0.08, box: [4, 36, 4, 36], arc: '#e8ffff', sfx: 'heavy',
        shot: { spr: 's_wave', spd: 220, dmg: 8, life: 0.45, kb: 120, ground: 1 }, meter: 8 })],
    air: MV({ an: 'kick', n: 'AIR SPIN', dmg: 10, st: 0.04, ac: 0.6, rc: 0.1, kb: 130, kd: true, box: [-10, 28, 0, 30], spin: 1 }),
    dash: MV({ an: 'cross', n: 'FIN RUSH', dmg: 11, st: 0.03, ac: 0.24, rc: 0.2, kb: 170, kd: true, lunge: 300, box: [0, 30, 4, 32], arc: '#7ae0e0' }),
    knee: MV({ an: 'jab', dmg: 6, st: 0.05, ac: 0.06, rc: 0.14, kb: 0, stun: 0.4 }),
    sp: { fire: { n: 'TIDAL WAVE', an: 'cross', st: 0.16, rc: 0.28, shot: { spr: 's_wave', spd: 230, dmg: 13, kb: 160, kd: true, ground: 1, life: 1.2 }, ex: { spr: 's_wave', spd: 280, dmg: 20, kd: true, pierce: 1, ground: 1, big: 1, kb: 220, life: 1.4 } },
      rise: { n: 'WHIRLPOOL', an: 'kick', st: 0.03, inv: true, vh: 300, fwd: 30, hits: 5, dmg: 4, kd: true, lift: 300, box: [-18, 24, 0, 60], spin: 1 },
      dash: { n: 'RIPTIDE', an: 'cross', st: 0.04, lunge: 420, dur: 0.26, dmg: 9, kd: true, kb: 160, ghost: 1, box: [-6, 26, 0, 40] },
      ground: { n: 'BUBBLE TRAP', an: 'pound', st: 0.14, shot: { spr: 's_orb', spd: 120, dmg: 4, life: 1.6, bubble: 2.2, col: '#9adfff' } },
      sup: { n: 'STORM OF THE DEEP', kind: 'storm', dmg: 46, col: '#7ae0e0' } },
    quote: "Sweetie, you're all washed up." },
  greebo: { n: 'GREEBO', k: 'gr', hp: 160, spd: 60, run: 132, jump: 300, w: 24, ht: 44, armorHeavy: 1, col: '#e8d0a0',
    blurb: 'Slow, huge damage, shrugs off a hit while he swings. Pies.', stats: [5, 2, 3],
    face: 'hud_gr',
    combo: [MV({ an: 'jab', dmg: 9, st: 0.08, ac: 0.07, rc: 0.16, box: [6, 30, 12, 38], kb: 40 }), MV({ an: 'cross', dmg: 10, st: 0.08, ac: 0.08, rc: 0.18, box: [6, 32, 12, 38], kb: 50 }),
      MV({ an: 'upper', n: 'PIN SMASH', dmg: 20, st: 0.14, ac: 0.1, rc: 0.34, kb: 160, lift: 150, kd: true, hs: 0.11, box: [2, 34, 8, 60], sfx: 'heavy', arc: '#ffd890', meter: 10, armor: 1, quake: 1 })],
    air: MV({ an: 'pound', n: 'BELLY FLOP', dmg: 16, st: 0.05, ac: 0.7, rc: 0.15, kb: 160, kd: true, box: [-14, 22, -4, 20], hs: 0.09 }),
    dash: MV({ an: 'cross', n: 'BELLY BARGE', dmg: 15, st: 0.06, ac: 0.24, rc: 0.24, kb: 220, kd: true, lunge: 220, box: [0, 30, 4, 40], hs: 0.09, armor: 1 }),
    knee: MV({ an: 'jab', dmg: 10, st: 0.08, ac: 0.07, rc: 0.18, kb: 0, stun: 0.45 }),
    sp: { fire: { n: 'PIE TOSS', an: 'cross', st: 0.16, rc: 0.3, shot: { spr: 't_pie', spd: 170, arc: 260, dmg: 16, kd: true, boom: 34, splat: 1 }, ex: { spr: 't_pie', spd: 200, arc: 280, dmg: 26, kd: true, boom: 54, splat: 1, triple: 1 } },
      rise: { n: 'ROLLING PIN', an: 'upper', st: 0.06, inv: true, vh: 250, fwd: 40, hits: 2, dmg: 13, kd: true, lift: 320, box: [0, 32, 6, 64] },
      dash: { n: 'CREAM SLIDE', an: 'pound', st: 0.08, lunge: 300, dur: 0.38, dmg: 14, kd: true, kb: 120, lift: 260, box: [0, 30, -2, 18], fx: 'fx_cream' },
      ground: { n: 'GROUND POUND', an: 'pound', st: 0.26, ring: 74, dmg: 18, kd: true, lift: 260, quake: 1 },
      sup: { n: 'PIE STORM', kind: 'pies', dmg: 56, col: '#ffd890' } },
    quote: "Fresh cream pie. Don't ask what's in it." },
  homunculus: { n: 'THE HOMUNCULUS', k: 'ho', hp: 115, spd: 80, run: 168, jump: 340, w: 20, ht: 40, bite: 1, col: '#3fb43a',
    blurb: 'A Gloop, full grown. Quick claws, acid spit, bites heal him.', stats: [3, 4, 2],
    face: 'hud_ho',
    combo: [MV({ an: 'jab', dmg: 5, st: 0.04, ac: 0.06, rc: 0.1, box: [4, 28, 8, 34], arc: '#9aff5a' }), MV({ an: 'cross', dmg: 5, st: 0.04, ac: 0.06, rc: 0.1, box: [4, 28, 8, 34], arc: '#9aff5a' }),
      MV({ an: 'jab', dmg: 6, st: 0.04, ac: 0.06, rc: 0.12, box: [4, 30, 8, 34], arc: '#9aff5a' }),
      MV({ an: 'upper', n: 'GLOOP BITE', dmg: 13, st: 0.08, ac: 0.08, rc: 0.26, kb: 120, kd: true, lift: 220, hs: 0.08, box: [4, 30, 8, 46], sfx: 'heavy', heal: 4, meter: 8 })],
    air: MV({ an: 'jkick', n: 'DIVE BITE', dmg: 11, st: 0.05, ac: 0.6, rc: 0.1, kb: 140, kd: true, box: [0, 28, 0, 30] }),
    dash: MV({ an: 'cross', n: 'POUNCE', dmg: 12, st: 0.04, ac: 0.24, rc: 0.2, kb: 170, kd: true, lunge: 280, box: [0, 30, 0, 34] }),
    knee: MV({ an: 'jab', dmg: 6, st: 0.05, ac: 0.06, rc: 0.14, kb: 0, stun: 0.4, heal: 2 }),
    sp: { fire: { n: 'ACID SPIT', an: 'jab', st: 0.14, rc: 0.26, shot: { spr: 's_goo', spd: 200, arc: 160, dmg: 9, puddle: 3, col: '#9aff5a', green: 1 }, ex: { spr: 's_goo', spd: 230, arc: 170, dmg: 14, puddle: 5, triple: 1, green: 1 } },
      rise: { n: 'LEAP BITE', an: 'upper', st: 0.04, inv: true, vh: 330, fwd: 110, hits: 2, dmg: 9, kd: true, lift: 260, heal: 4, box: [0, 28, 4, 56] },
      dash: { n: 'HEADBUTT', an: 'cross', st: 0.08, lunge: 360, dur: 0.3, dmg: 13, kd: true, kb: 240, box: [0, 28, 4, 36] },
      ground: { n: 'OOZE SHIELD', an: 'pound', st: 0.08, ring: 40, dmg: 8, shield: 2.5, kd: false, kb: 160 },
      sup: { n: 'OOZE FLOOD', kind: 'flood', dmg: 52, col: '#9aff5a' } },
    quote: 'Gloop. (He means you are dead.)' },
  laboozie: { n: 'LABOOZIE', k: 'lb', hp: 120, spd: 76, run: 160, jump: 330, w: 20, ht: 48, scale: 1, col: '#8a5020',
    blurb: 'Shithead Laboozie. Flaming bags of shit: a hit poisons them, the floor burns for 8 seconds.', stats: [3, 3, 5],
    face: 'hud_lb',
    combo: [MV({ an: 'jab', dmg: 6, box: [6, 30, 24, 44] }), MV({ an: 'cross', dmg: 7, box: [6, 32, 24, 44] }), MV({ an: 'kick', dmg: 9, st: 0.08, ac: 0.08, rc: 0.18, kb: 60, box: [4, 32, 10, 34], arc: '#ff7a1a' }),
      MV({ an: 'upper', n: 'STINK UPPER', dmg: 13, st: 0.1, ac: 0.1, rc: 0.3, kb: 110, lift: 280, kd: true, hs: 0.09, box: [2, 28, 20, 64], sfx: 'heavy', arc: '#ff7a1a', meter: 8 })],
    air: MV({ an: 'kick', n: 'FLYING STOMP', dmg: 12, st: 0.05, ac: 0.6, rc: 0.1, kb: 150, kd: true, box: [2, 30, 4, 32], hs: 0.07 }),
    dash: MV({ an: 'kick', n: 'BOOT TO THE FACE', dmg: 13, st: 0.04, ac: 0.22, rc: 0.22, kb: 180, kd: true, lunge: 250, box: [2, 30, 8, 36], hs: 0.08, arc: '#ff7a1a' }),
    knee: MV({ an: 'cross', dmg: 7, st: 0.06, ac: 0.06, rc: 0.16, kb: 0, stun: 0.4 }),
    sp: { fire: { n: 'FLAMING BAG OF SHIT', an: 'fire', st: 0.16, rc: 0.3, shot: { spr: 's_bag', spd: 170, arc: 210, dmg: 10, puddle: 8, fire: 1, poison: 6 }, ex: { spr: 's_bag', spd: 200, arc: 230, dmg: 14, puddle: 8, fire: 1, poison: 8, triple: 1 } },
      rise: { n: 'HOT HOOK', an: 'upper', st: 0.04, inv: true, vh: 340, fwd: 70, hits: 3, dmg: 7, kd: true, lift: 320, box: [0, 26, 10, 66] },
      dash: { n: 'SKID MARK', an: 'dash', st: 0.06, lunge: 330, dur: 0.32, dmg: 12, kd: true, kb: 220, box: [0, 28, 6, 44] },
      ground: { n: 'FLAMING STOMP', an: 'pound', st: 0.2, ring: 52, dmg: 11, kd: true, lift: 220, fx: 'fx_cream', fire: 1 },
      sup: { n: 'SHIT STORM', kind: 'pies', dmg: 64, col: '#ff7a1a' } },
    quote: 'Smell that? It\'s shit' }
};
var HEROLIST = ['cumhead', 'spermaid', 'greebo', 'homunculus', 'laboozie'];
/* every fighter's frames come from the rig (art.py: rig.py + fighters.py): sk_<k>_<anim><i>, ANIMN frames each */
var ANIMN = { idle: 4, walk: 8, run: 6, jab: 3, cross: 3, kick: 3, rh: 3, upper: 3, sweep: 3, crouch: 1, cjab: 1, block: 1, cblock: 1, jump: 3, jkick: 1, jpunch: 1,
  hurt: 2, fall: 1, lie: 1, getup: 1, grab: 1, knee: 2, throw: 2, fire: 3, rise: 2, dash: 1, pound: 2, super: 1, win: 2, dizzy: 2 };
function AN(H, a) { var o = []; for (var i = 0; i < (ANIMN[a] || 1); i++) o.push('sk_' + H.k + '_' + a + i); return o; }
HEROLIST.forEach(function (id) {
  var H = HEROES[id]; H.A = {}; for (var a in ANIMN) H.A[a] = AN(H, a);
  H.idle = H.A.idle; H.idleF = id === 'greebo' ? 4 : 6; H.walkF = id === 'greebo' ? 13 : 15;
  H.air.an = 'jkick'; H.dash.an = 'dash'; H.knee.an = 'knee'; H.sp.fire.an = 'fire'; H.sp.rise.an = 'rise'; H.sp.dash.an = 'dash'; H.sp.ground.an = 'pound';
});
HEROES.cumhead.dash.an = 'jkick'; HEROES.spermaid.combo[3].an = 'rh'; HEROES.greebo.sp.dash.an = 'sweep'; HEROES.homunculus.combo[2].an = 'kick';

/* FOES: walking frames sf_<id>_0-3, a lean (attacking) and a wind-up frame from art.py.
   ai: brawler, caster (orbs), thrower (straight), lobber (arcs), shield (blocks from the front), heavy (armour, long
   reach), grabber (holds you, mash to get out), fast (dashes in behind you), leaper (the brainwashed homunculi) */
var FOES = {
  cultist: { n: 'CULTIST', hp: 34, dmg: 8, spd: 46, ai: 'caster', w: 18, ht: 34, shot: { spr: 's_orb', spd: 140, dmg: 9 }, reach: 26, score: 200 },
  cultrat: { n: 'RAT CULTIST', hp: 28, dmg: 7, spd: 62, ai: 'thrower', w: 16, ht: 30, shot: { spr: 's_dagger', spd: 230, dmg: 8 }, reach: 24, score: 200 },
  ghoul: { n: 'GHOUL', hp: 40, dmg: 9, spd: 40, ai: 'brawler', w: 18, ht: 34, reach: 26, hits: 2, score: 250 },
  knight: { n: 'HOLLOW KNIGHT', hp: 60, dmg: 11, spd: 36, ai: 'shield', w: 20, ht: 36, reach: 32, score: 400 },
  jailer: { n: 'JAILER', hp: 80, dmg: 14, spd: 34, ai: 'heavy', w: 24, ht: 38, reach: 54, armor: 1, score: 500 },
  mummy: { n: 'MUMMY', hp: 50, dmg: 5, spd: 34, ai: 'grabber', w: 18, ht: 36, reach: 22, score: 350 },
  skeleton: { n: 'SKELETON', hp: 30, dmg: 8, spd: 52, ai: 'lobber', w: 16, ht: 34, shot: { spr: 's_bone', spd: 150, arc: 220, dmg: 9, spin: 1 }, reach: 24, score: 250 },
  vampire: { n: 'VAMPIRE', hp: 55, dmg: 11, spd: 58, ai: 'fast', w: 18, ht: 40, reach: 28, drain: 1, score: 450 },
  clown: { n: 'PIE CLOWN', hp: 36, dmg: 7, spd: 46, ai: 'lobber', w: 18, ht: 36, shot: { spr: 't_pie', spd: 140, arc: 240, dmg: 8, splat: 1 }, reach: 24, score: 300 },
  blumguard: { n: 'LAIR GUARD', hp: 90, dmg: 13, spd: 40, ai: 'heavy', w: 22, ht: 36, reach: 34, armor: 1, hits: 3, score: 600 },
  wraith: { n: 'WRAITH', hp: 42, dmg: 10, spd: 64, ai: 'fast', w: 18, ht: 32, reach: 26, ghost: 1, score: 400 },
  corkbot: { n: 'CORKBOT', hp: 26, dmg: 8, spd: 58, ai: 'thrower', w: 14, ht: 32, shot: { spr: 's_dagger', spd: 260, dmg: 7 }, reach: 20, score: 200 }
};
/* the brainwashed homunculi: the real breeds dyed purple (art.py wb_<breed>_<stage>_*). Beat them and the goo comes
   out: they turn back to their own colours and run home happy (no killing them, they are victims) */
var BREEDNAME = { gloop: 'GLOOP', frost: 'FROSTBITE', volt: 'VOLTLING', ember: 'EMBERTAIL', titan: 'TITAN', leech: 'LEECHLING', goldie: 'GOLDIE', blood: 'BLOODMOON', scout: 'PEEPER', guard: 'BULWARK', medic: 'MENDLING' };
var WASHSHOT = { ember: { spr: 's_fire', spd: 180, dmg: 9 }, frost: { spr: 's_orb', spd: 170, dmg: 7, col: '#9adfff' }, volt: { spr: 's_orb', spd: 260, dmg: 7, col: '#ffe36a' }, scout: { spr: 's_orb', spd: 300, dmg: 6, col: '#ff2630' } };
function washed(breed, stage) {
  var adult = stage === 'adult';
  return { n: 'BLUMWASHED ' + BREEDNAME[breed], hp: adult ? 50 : 32, dmg: adult ? 10 : 7, spd: adult ? 60 : 72, ai: 'leaper', w: adult ? 20 : 16, ht: adult ? 40 : 30, reach: 24,
    washed: breed, wst: stage, shot: WASHSHOT[breed], score: adult ? 400 : 250, armor: breed === 'titan' || breed === 'guard' ? 1 : 0 };
}

/* BOSSES: each has its own moves (6-foes.js bossAI). spr: the frames; sc: drawn bigger; hp before the stage scaling */
var BOSSES = {
  execu: { n: 'BLUM EXECUTIONER', spr: ['f_execu_0', 'f_execu_1'], sc: 1, hp: 460, dmg: 16, spd: 44, w: 40, ht: 84, song: 'bdemon',
    moves: ['sweep', 'chop', 'charge', 'sweep', 'grab'], intro: 'The axe is for the homunculi. You are a bonus.' },
  ratking: { n: 'THE RAT KING', spr: ['f_ratking_0', 'f_ratking_1'], sc: 1.15, hp: 420, dmg: 14, spd: 70, w: 70, ht: 50, song: 'brat',
    moves: ['charge', 'swarm', 'bite', 'summon', 'charge'], intro: 'Squeak. (The sewers are ours.)' },
  brothers: { n: 'BROTHERS LOAD', twin: true, hp: 300, dmg: 13, song: 'bpig', intro: 'Two pigs. One load. No refunds.' },
  pig: { n: 'PIGGY LOAD', spr: ['f_pig_0', 'f_pig_1'], sc: 1, hp: 300, dmg: 14, spd: 60, w: 80, ht: 60, moves: ['belly', 'charge', 'bounce', 'belly'] },
  cowpig: { n: 'COWBOY LOAD', spr: ['f_cowpig_0', 'f_cowpig_1'], sc: 1, hp: 260, dmg: 11, spd: 50, w: 40, ht: 62, moves: ['mugs', 'punch', 'mugs', 'lasso'] },
  boner: { n: 'THE BIG BONER', spr: ['f_boner_0', 'f_boner_1'], sc: 1, hp: 480, dmg: 15, spd: 46, w: 44, ht: 90, song: 'bboner',
    moves: ['spears', 'slam', 'bones', 'sweep', 'spears'], intro: 'Rattle me bones. Go on.' },
  titan: { n: 'MIND-MELTED TITAN', spr: ['wb_titan_adult_idle0', 'wb_titan_adult_run0', 'wb_titan_adult_run1', 'wb_titan_adult_run2', 'wb_titan_adult_run3'], atk: 'wb_titan_adult_atk', hurt: 'wb_titan_adult_hurt', sc: 2.2, hp: 560, dmg: 17, spd: 50, w: 52, ht: 88, song: 'bbeast',
    moves: ['pound', 'rocks', 'leap', 'pound', 'charge'], intro: 'GOO... IN... MY... HEAD...', washed: 1 },
  blum: { n: 'BLUMHEAD', spr: ['f_blum_0', 'f_blum_1'], sc: 1, hp: 640, dmg: 16, spd: 56, w: 56, ht: 100, song: 'blum',
    moves: ['goo', 'teleport', 'summon', 'goo', 'slam'], intro: 'My homunculi. My goo. My Cum City. Kneel.', super: { n: 'SUPER BLUMHEAD', spr: ['f_blum2_0', 'f_blum2_1'], song: 'super', moves: ['beam', 'rain', 'teleport', 'goo', 'slam', 'beam'] } }
};

/* STAGES: each is a run of sections. The camera stops at a section, the waves come in from both sides, beat them and
   GO on. Then the boss in a locked arena. back: the painter in 3-back.js */
var STAGES = [
  { n: 'CLUBHOUSE ROW', sub: 'Stage 1', back: 'street', song: 'skstreet', boss: 'execu', tint: '#c4121c',
    pool: ['cultist', 'cultrat', 'ghoul', 'wb:gloop:teen', 'wb:volt:teen'],
    secs: [{ len: 560, waves: [['cultist', 'wb:gloop:teen', 'cultrat'], ['ghoul', 'wb:gloop:teen', 'cultist', 'wb:gloop:teen']], props: [['b_bin', 'f_cracker'], ['b_crate', 'w_pin'], ['b_bin', 'f_drop']] },
      { len: 620, waves: [['cultrat', 'cultrat', 'ghoul'], ['wb:volt:teen', 'cultist', 'ghoul', 'wb:gloop:teen'], ['cultist', 'cultist', 'wb:gloop:teen', 'cultrat', 'ghoul']], props: [['b_crate', 'f_cuppa'], ['b_bin', 't_pie'], ['b_barrel', 'f_drop']] },
      { len: 600, waves: [['ghoul', 'ghoul', 'wb:volt:teen', 'cultrat'], ['cultist', 'wb:gloop:teen', 'wb:gloop:teen', 'ghoul', 'cultrat', 'cultist']], props: [['b_bin', 'w_sausage'], ['b_crate', 'f_cracker']] }] },
  { n: 'THE CREAM SEWERS', sub: 'Stage 2', back: 'sewer', song: 'sewer', boss: 'ratking', tint: '#f1e0b0',
    secs: [{ len: 600, waves: [['cultrat', 'cultrat', 'wb:frost:teen'], ['ghoul', 'mummy', 'cultrat', 'wb:frost:teen']], props: [['b_barrel', 'f_cracker'], ['b_crate', 't_bread'], ['b_cream', 'f_drop']] },
      { len: 640, waves: [['mummy', 'ghoul', 'wb:volt:teen'], ['cultrat', 'cultrat', 'wb:frost:adult', 'ghoul'], ['mummy', 'mummy', 'cultrat', 'wb:volt:teen', 'cultist']], props: [['b_barrel', 'w_bone'], ['b_cream', 'f_pie'], ['b_crate', 'f_drop']] },
      { len: 600, waves: [['wb:frost:adult', 'wb:volt:teen', 'ghoul', 'cultrat'], ['mummy', 'ghoul', 'cultist', 'wb:frost:teen', 'cultrat', 'wb:volt:adult']], props: [['b_cream', 'f_cuppa'], ['b_barrel', 't_pills']] }] },
  { n: 'EJACULAND', sub: 'Stage 3', back: 'park', song: 'park', boss: 'brothers', tint: '#ff2630',
    secs: [{ len: 620, waves: [['clown', 'clown', 'wb:ember:teen'], ['knight', 'clown', 'wb:goldie:teen', 'cultrat']], props: [['b_crate', 'f_nuggets'], ['b_barrel', 'w_guitar'], ['b_crate', 'f_drop']] },
      { len: 660, waves: [['knight', 'wb:ember:adult', 'clown'], ['clown', 'clown', 'clown', 'wb:goldie:teen'], ['knight', 'knight', 'wb:ember:teen', 'clown', 'skeleton']], props: [['b_crate', 't_pine'], ['b_barrel', 'f_cuppa'], ['b_bin', 'f_drop']] },
      { len: 620, waves: [['wb:goldie:adult', 'wb:ember:adult', 'clown', 'knight'], ['knight', 'clown', 'clown', 'wb:ember:teen', 'wb:goldie:teen', 'skeleton']], props: [['b_crate', 'f_pie'], ['b_barrel', 'w_sword']] }] },
  { n: 'THE BONE PIT', sub: 'Stage 4', back: 'bone', song: 'bone', boss: 'boner', tint: '#f8f0dc',
    secs: [{ len: 620, waves: [['skeleton', 'skeleton', 'mummy'], ['jailer', 'skeleton', 'wb:titan:teen', 'ghoul']], props: [['b_coffin', 'f_cracker'], ['b_coffin', 'w_bone'], ['b_crate', 'f_drop']] },
      { len: 660, waves: [['jailer', 'mummy', 'wb:leech:teen'], ['skeleton', 'skeleton', 'skeleton', 'wb:titan:teen', 'mummy'], ['jailer', 'ghoul', 'wb:leech:adult', 'skeleton', 'mummy']], props: [['b_coffin', 'f_chilli'], ['b_coffin', 'w_chain'], ['b_crate', 't_pills']] },
      { len: 620, waves: [['wb:titan:adult', 'skeleton', 'mummy', 'jailer'], ['wb:leech:adult', 'skeleton', 'skeleton', 'jailer', 'ghoul', 'wb:titan:teen']], props: [['b_coffin', 'f_pie'], ['b_coffin', 'f_cuppa']] }] },
  { n: 'THE BLOOD FACTORY', sub: 'Stage 5', back: 'factory', song: 'furnace', boss: 'titan', tint: '#ff9a30',
    secs: [{ len: 640, waves: [['blumguard', 'corkbot', 'corkbot'], ['wb:scout:adult', 'vampire', 'corkbot', 'jailer']], props: [['b_barrel', 'f_cracker'], ['b_crate', 't_pistol'], ['b_barrel', 'f_drop']] },
      { len: 680, waves: [['vampire', 'vampire', 'wb:guard:adult'], ['blumguard', 'jailer', 'corkbot', 'wb:medic:adult'], ['wb:scout:adult', 'wb:guard:adult', 'vampire', 'corkbot', 'blumguard']], props: [['b_barrel', 'f_pie'], ['b_crate', 'w_chain'], ['b_barrel', 'f_cuppa']] },
      { len: 640, waves: [['blumguard', 'blumguard', 'vampire', 'wb:medic:adult'], ['jailer', 'vampire', 'corkbot', 'corkbot', 'wb:scout:adult', 'wb:guard:adult']], props: [['b_crate', 'f_chilli'], ['b_barrel', 't_pine']] }] },
  { n: "BLUMHEAD'S THRONE", sub: 'Stage 6', back: 'throne', song: 'castle', boss: 'blum', tint: '#a040e0',
    secs: [{ len: 660, waves: [['wraith', 'wraith', 'wb:blood:teen'], ['knight', 'blumguard', 'wb:blood:adult', 'wraith']], props: [['b_coffin', 'f_cracker'], ['b_crate', 'w_sword'], ['b_coffin', 'f_drop']] },
      { len: 700, waves: [['vampire', 'wraith', 'wb:blood:adult'], ['blumguard', 'knight', 'wraith', 'wb:blood:teen', 'cultist'], ['vampire', 'vampire', 'wb:blood:adult', 'wb:blood:adult', 'knight']], props: [['b_coffin', 'f_pie'], ['b_crate', 't_pine'], ['b_coffin', 'f_cuppa']] },
      { len: 660, waves: [['blumguard', 'blumguard', 'wraith', 'wraith', 'wb:blood:adult'], ['knight', 'vampire', 'cultist', 'cultist', 'wb:blood:adult', 'wb:blood:teen', 'blumguard']], props: [['b_coffin', 'f_chilli'], ['b_crate', 'f_pie']] }] }
];

/* WEAPONS you pick up. melee: swings, dur = hits before it breaks. throw/gun: ammo. Knocked down = you drop it */
var WEAPONS = {
  w_sausage: { n: "AMY'S SAUSAGE", kind: 'melee', dur: 14, dmg: 15, reach: 40, kb: 130, kd: 1, spd: 0.26, col: '#f08a6a', sfx: 'thwack' },
  w_pin: { n: 'ROLLING PIN', kind: 'melee', dur: 12, dmg: 14, reach: 34, kb: 110, kd: 0, spd: 0.22, col: '#f0c890', sfx: 'thwack' },
  w_bone: { n: 'BONE CLUB', kind: 'melee', dur: 12, dmg: 16, reach: 34, kb: 120, kd: 0, spd: 0.24, col: '#f8f0dc', sfx: 'thwack' },
  w_chain: { n: "JAILER'S BALL", kind: 'melee', dur: 9, dmg: 24, reach: 54, kb: 200, kd: 1, spd: 0.42, col: '#6a646c', sfx: 'heavy', wide: 1 },
  w_sword: { n: "KNIGHT'S SWORD", kind: 'melee', dur: 12, dmg: 19, reach: 44, kb: 140, kd: 0, spd: 0.24, col: '#e8e8f0', sfx: 'slash' },
  w_guitar: { n: "PULSAR'S GUITAR", kind: 'melee', dur: 8, dmg: 22, reach: 40, kb: 180, kd: 1, spd: 0.32, col: '#ff2630', sfx: 'chord' },
  t_pie: { n: 'CREAM PIES', kind: 'throw', dur: 4, shot: { spr: 't_pie', spd: 170, arc: 240, dmg: 14, kd: true, boom: 30, splat: 1 } },
  t_pills: { n: "TB'S SILLY PILLS", kind: 'throw', dur: 5, shot: { spr: 's_orb', spd: 220, dmg: 10, bounce: 3, col: '#ff9ad0', silly: 1 } },
  t_bread: { n: "ALI'S GARLIC BREAD", kind: 'throw', dur: 4, shot: { spr: 't_bread', spd: 260, dmg: 12, boomer: 1, pierce: 1, spin: 1 } },
  t_pine: { n: "JOFF'S PINEAPPLE", kind: 'throw', dur: 2, shot: { spr: 't_pine', spd: 160, arc: 260, dmg: 30, kd: true, boom: 60, fuse: 1 } },
  t_pistol: { n: 'CREAM PISTOL', kind: 'gun', dur: 16, rate: 0.16, shot: { spr: 's_cream', spd: 340, dmg: 6, stun: 0.25, kb: 50 } }
};
var FOOD = {
  f_cracker: { n: 'CUM CRACKER', heal: 30 }, f_cuppa: { n: 'CUMPUCCINO', heal: 35, fast: 8 }, f_pie: { n: "GREEBO'S CREAM PIE", heal: 70 },
  f_chilli: { n: "AMY'S DYNAMITE CHILLI", heal: 999, fire: 10 }, f_nuggets: { n: "ALI'S GARLIC NUGGETS", heal: 40 },
  f_drop: { n: 'DROP', score: 500 }, f_life: { n: '1 UP', life: 1 }
};
var RANDOMDROP = ['f_cracker', 'f_cracker', 'f_drop', 'f_drop', 'f_cuppa', 'f_nuggets'];
var GRADES = [['S', 60000], ['A', 40000], ['B', 25000], ['C', 12000], ['D', 0]];
