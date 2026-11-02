/* =====================================================================================================
   THE ACTS, piece by piece. Act 1 of each zone teaches its gimmick, Act 2 pushes it and ends in the boss
   arena. Each act runs about 750 to 900 tiles (2 minutes and more for a first run), with checkpoints along the
   way and the hardest stretch near the end. m n p q are the zone's walkers, w its flyer (ZONES[].foes).
   ===================================================================================================== */
/* three-lane stretches: what runs on the high road, the street and the low road, per zone and per act
   (act 2 gets the meaner list). Gaps in the street fall to the low road, gaps on the high road fall to the street. */
function LANES(z, hard, portal) {
  var L = [
    // NIGHT CITY: rooftops and gantries / the street / the subway
    [{ top: [['run', 10], ['gaps', 2, 4], ['box', 'shoes'], ['run', 8, 'w'], ['swings', 1], ['gaps', 2, 5], ['run', 14], ['dash'], ['gaps', 2, 4], ['run', 12]],
       mid: [['run', 12, 'm'], ['fallers', 2], ['gaps', 1, 4], ['run', 10, 'n'], ['rollers2', 2], ['wires', 2], ['gaps', 1, 4, 'm'], ['run', 10, 'p'], ['ditch', 3], ['run', 12, 'n']],
       low: [['run', 14, 'n'], ['wires', 2], ['run', 10, 'm'], ['rollers2', 2], ['box', 'drops'], ['run', 12, 'n'], ['ditch', 3], ['run', 16]] },
     { top: [['run', 8], ['gaps', 3, 5], ['swings', 2], ['box', 'shield'], ['platPit', 4, 'M'], ['run', 10, 'w'], ['gaps', 2, 5], ['dash'], ['run', 14]],
       mid: [['run', 10, 'n'], ['rollers2', 3], ['fallers', 3, 'm'], ['gaps', 2, 4], ['wires', 3], ['run', 10, 'p'], ['swings', 2], ['ditch', 4, 'n'], ['run', 12]],
       low: [['run', 10, 'm'], ['wires', 3], ['ditch', 4], ['rollers2', 3], ['run', 10, 'n'], ['box', 'drops'], ['wires', 2], ['run', 14]] }],
    // CREAM SEWERS: pipes overhead / the walkway / the deep drain
    [{ top: [['run', 10], ['gaps', 2, 4], ['box', 'shoes'], ['conveyor', 14, 1], ['gaps', 2, 4], ['run', 10, 'w'], ['dash'], ['run', 14]],
       mid: [['run', 10, 'm'], ['conveyor', 16, -1, 'n'], ['fallers', 2], ['gaps', 1, 4], ['rollers2', 2], ['ditch', 3], ['run', 12, 'p']],
       low: [['run', 12, 'q'], ['conveyor', 16, 1], ['rollers2', 2], ['box', 'drops'], ['ditch', 3], ['run', 14, 'n']] },
     { top: [['run', 8], ['gaps', 3, 5], ['conveyor', 16, -1], ['box', 'shield'], ['platPit', 4, 'N'], ['run', 10, 'w'], ['gaps', 2, 5], ['run', 14]],
       mid: [['run', 10, 'n'], ['conveyor', 18, -1, 'm'], ['fallers', 3], ['gaps', 2, 4], ['rollers2', 3], ['vents', 2], ['ditch', 4, 'p'], ['run', 12]],
       low: [['run', 10, 'q'], ['conveyor', 18, -1], ['rollers2', 3], ['ditch', 4], ['box', 'drops'], ['run', 12, 'n']] }],
    // EJACULAND: the coaster track / the midway / under the boardwalk
    [{ top: [['run', 8], ['dash'], ['rollers', 2], ['gaps', 2, 5], ['box', 'shoes'], ['loop'], ['gaps', 2, 4], ['run', 12, 'w']],
       mid: [['run', 10, 'm'], ['bumpers'], ['rollers2', 2], ['swings', 2], ['run', 10, 'n'], ['wires', 2], ['run', 12, 'p']],
       low: [['run', 12, 'n'], ['wires', 2], ['rollers2', 2], ['box', 'drops'], ['ditch', 3], ['run', 14, 'p']] },
     { top: [['run', 6], ['dash'], ['loop'], ['gaps', 3, 5], ['swings', 2], ['box', 'shield'], ['platPit', 4, 'O'], ['dash'], ['run', 12]],
       mid: [['run', 8, 'n'], ['bumpers'], ['swings', 3], ['rollers2', 3], ['wires', 3], ['ditch', 4, 'm'], ['run', 10]],
       low: [['run', 10, 'm'], ['wires', 3], ['rollers2', 3], ['ditch', 4], ['box', 'drops'], ['run', 12, 'p']] }],
    // THE BONE PIT: rib bridges / the ossuary floor / the catacombs
    [{ top: [['run', 8], ['crumbleBridge', 6], ['run', 8, 'w'], ['gaps', 2, 4], ['box', 'shoes'], ['crumbleBridge', 8], ['run', 12]],
       mid: [['run', 10, 'm'], ['fallers', 3], ['ditch', 3], ['rollers2', 2], ['swings', 2], ['run', 12, 'n']],
       low: [['run', 12, 'p'], ['fallers', 2, null, 6], ['rollers2', 2], ['box', 'drops'], ['ditch', 3], ['run', 14, 'm']] },
     { top: [['run', 6], ['crumbleBridge', 8], ['gaps', 3, 5], ['swings', 2], ['box', 'shield'], ['crumbleBridge', 10], ['run', 12, 'w']],
       mid: [['run', 8, 'n'], ['fallers', 4], ['swings', 3], ['rollers2', 3], ['ditch', 4, 'm'], ['run', 10, 'p']],
       low: [['run', 10, 'm'], ['fallers', 3, null, 6], ['rollers2', 3], ['ditch', 4], ['box', 'drops'], ['run', 12, 'p']] }],
    // BLOOD FACTORY: gantries / the shop floor / the furnace tunnels
    [{ top: [['run', 8], ['conveyor', 14, 1], ['gaps', 2, 4], ['box', 'shoes'], ['jets', 2], ['gaps', 2, 4], ['run', 12, 'w']],
       mid: [['run', 10, 'm'], ['jets', 3], ['conveyor', 16, -1, 'n'], ['fallers', 2], ['rollers2', 2], ['crushers', 2], ['run', 10]],
       low: [['run', 12, 'n'], ['jets', 3], ['rollers2', 2], ['box', 'drops'], ['wires', 2], ['run', 14, 'p']] },
     { top: [['run', 6], ['conveyor', 16, -1], ['gaps', 3, 5], ['jets', 3], ['box', 'shield'], ['platPit', 4, 'M'], ['run', 12]],
       mid: [['run', 8, 'n'], ['crushers', 3], ['jets', 4], ['rollers2', 3], ['fallers', 3, 'm'], ['wires', 3], ['run', 10]],
       low: [['run', 10, 'm'], ['jets', 4], ['wires', 3], ['rollers2', 3], ['box', 'drops'], ['run', 12, 'p']] }],
    // SPUNK BRAIN: catwalks / the machine floor / the guts
    [{ top: [['run', 6], ['saws', 2], ['gaps', 2, 5], ['box', 'shield'], ['wires', 2], ['gaps', 2, 4], ['dash'], ['run', 10]],
       mid: [['run', 8, 'm'], ['electric', 3], ['swings', 2], ['trapdoors', 3], ['rollers2', 3], ['saws', 2], ['run', 10, 'n']],
       low: [['run', 10, 'n'], ['crushers', 3], ['wires', 3], ['rollers2', 2], ['box', 'drops'], ['jets', 3], ['run', 12, 'p']] },
     { top: [['run', 6], ['saws', 3], ['gaps', 3, 5], ['wires', 3], ['box', 'shield'], ['platPit', 5, 'N'], ['saws', 2], ['run', 10]],
       mid: [['run', 6, 'n'], ['electric', 4], ['swings', 3], ['trapdoors', 4], ['rollers2', 3], ['crushers', 3], ['saws', 3], ['run', 8]],
       low: [['run', 8, 'm'], ['crushers', 4], ['wires', 4], ['rollers2', 3], ['jets', 4], ['box', 'drops'], ['run', 10, 'p']] }]
  ][z], A = L[hard ? 1 : 0], B = L[1];
  // long: two lists back to back (the second always the meaner one), so a route lasts half a minute
  return { top: A.top.concat(B.top), mid: A.mid.concat(B.mid), low: A.low.concat(B.low), portal: portal || null };
}
/* every act: a stretch to warm up, a long three-lane section, single-lane set pieces with the zone's traps, a
   second three-lane section (meaner), a hard run to the sign. Act 2s end in the boss arena. */
function ACT(z, act, seed, a, b, c, d) {
  var plan = [['start']].concat(a, [['check'], ['lanes', LANES(z, act === 2, act === 1 ? 'top' : null)], ['check']], b, [['check'], ['lanes', LANES(z, true, act === 2 ? 'low' : null)], ['check']], c);
  plan = plan.concat(act === 2 ? [['run', 12], ['arena', ZONES[z].boss]] : [['goal']]);
  return { z: z, act: act, seed: seed, plan: plan };
}
var ACTS = [
  // NIGHT CITY act 1: west to the middle of town. Clubhouse Row, the cafe quarter, the building site, downtown (rooftops, the street, the
  // subway), Potbelly Plaza. Every district has its own look, shops and trap; nothing repeats
  { z: 0, act: 1, seed: 11, plan: [['district', 'row'], ['start'], ['run', 18, 'm'], ['rollers', 2], ['box', 'drops'], ['run', 14, 'n'], ['valley', 3], ['run', 12], ['loop'], ['springTower', 'p'], ['run', 16, 'n'], ['dash'], ['rollers', 3], ['run', 12, 'm'], ['check'],
    ['district', 'cafe'], ['run', 14, 'w'], ['awnings', 3], ['run', 12, 'm'], ['stairs', 2, 'up'], ['awnings', 2], ['run', 10, 'w'], ['box', 'shield'], ['stairs', 2, 'down'], ['run', 10, 'n'], ['awnings', 4], ['run', 14], ['check'],
    ['district', 'site'], ['run', 8, 'p'], ['swings', 2], ['run', 10], ['platPit', 4, 'N', null, 1], ['run', 8, 'm'], ['fallers', 3], ['climb', 9, 'n'], ['platPit', 4, 'M', null, 1], ['run', 8], ['swings', 1], ['fallers', 2], ['drop', 6], ['run', 10, 'p'], ['check'],
    ['district', 'downtown'], ['lanes', { top: [['run', 12], ['gaps', 2, 4], ['vents', 2], ['run', 10, 'w'], ['gaps', 2, 5], ['box', 'shoes'], ['run', 12], ['gaps', 2, 4], ['run', 10], ['vents', 3], ['gaps', 3, 4], ['run', 10, 'w'], ['gaps', 2, 5], ['run', 14]],
      mid: [['run', 8, 'm'], ['traffic', 40, 'n'], ['run', 8], ['box', 'drops'], ['traffic', 46, 'p'], ['run', 10, 'm'], ['traffic', 50, 'n'], ['run', 12]],
      low: [['run', 6, 'n'], ['subway', 50], ['run', 6, 'm'], ['wires', 2], ['subway', 44], ['box', 'drops'], ['run', 8, 'n'], ['subway', 46], ['wires', 2], ['run', 10]], portal: 'top' }], ['check'],
    ['district', 'plaza'], ['run', 16], ['dash'], ['run', 20], ['goal']] },
  // NIGHT CITY act 2: the middle of town to the storm drain. Red Light Alley, the cream docks (containers, the pier, the canal), the overpass,
  // old town, and the Beast waiting in the drain
  { z: 0, act: 2, seed: 12, plan: [['district', 'alley'], ['start'], ['run', 14, 'n'], ['washlines', 3], ['run', 10, 'm'], ['rollers2', 3], ['run', 12, 'n'], ['box', 'shoes'], ['washlines', 2], ['stairs', 2, 'up'], ['rollers2', 2], ['stairs', 2, 'down'], ['washlines', 3], ['run', 12], ['check'],
    ['district', 'docks'], ['lanes', { top: [['run', 10], ['crumbleBridge', 6], ['run', 8, 'w'], ['gaps', 2, 4], ['crumbleBridge', 8], ['box', 'shield'], ['run', 10], ['gaps', 3, 4], ['crumbleBridge', 10], ['run', 8, 'w'], ['gaps', 2, 5], ['run', 12]],
      mid: [['run', 10, 'm'], ['gaps', 2, 4, 'n'], ['run', 12, 'p'], ['gaps', 2, 5], ['run', 14, 'm'], ['box', 'drops'], ['run', 10, 'n'], ['gaps', 3, 4, 'p'], ['run', 12, 'm'], ['gaps', 2, 5], ['run', 12]],
      low: [['run', 6], ['pool', 34, 1], ['run', 8, 'q'], ['pool', 30, 1], ['run', 8, 'n'], ['box', 'drops'], ['pool', 36, 1], ['run', 10]], portal: 'low' }], ['check'],
    ['district', 'highway'], ['run', 10], ['dash'], ['loop'], ['ramps', 2], ['rollers', 3], ['dash'], ['loop'], ['ramps', 1], ['valley', 5], ['dash'], ['ramps', 2], ['loop'], ['run', 12], ['check'],
    ['district', 'oldtown'], ['run', 12, 'w'], ['graves', 4], ['run', 10, 'm'], ['valley', 4], ['box', 'shield'], ['stairs', 3, 'up'], ['graves', 3], ['run', 10, 'w'], ['stairs', 3, 'down'], ['graves', 2], ['run', 12, 'w'], ['check'],
    ['district', 'drain'], ['run', 12], ['arena', 'beast']] },
  // CREAM SEWERS act 1: down the outfall, through the pump room, along the main canal (pipes / walkway / the cream river), the rat nest, the weir
  { z: 1, act: 1, seed: 21, plan: [['district', 's_outfall'], ['start'], ['run', 14, 'm'], ['valley', 4], ['pool', 18], ['run', 10, 'n'], ['dash'], ['valley', 3], ['box', 'drops'], ['run', 12, 'w'], ['check'],
    ['district', 's_pumps'], ['run', 8], ['platPit', 4, 'N', null, 1], ['vents', 3], ['climb', 9, 'p'], ['run', 10], ['platPit', 3, 'M', null, 1], ['run', 8], ['check'],
    ['district', 's_canal'], ['lanes', { top: [['run', 10], ['crumbleBridge', 6], ['gaps', 2, 4], ['run', 8, 'w'], ['box', 'shoes'], ['crumbleBridge', 8], ['run', 10], ['gaps', 2, 5], ['run', 12]],
      mid: [['run', 10, 'm'], ['conveyor', 18, 1, 'n'], ['run', 8], ['rollers2', 2], ['conveyor', 16, -1, 'p'], ['run', 10, 'm'], ['conveyor', 18, 1], ['run', 10]],
      low: [['run', 6], ['pool', 30, 1], ['run', 8, 'q'], ['pool', 26, 1], ['run', 8, 'n'], ['box', 'drops'], ['pool', 24, 1], ['run', 8]], portal: 'top' }], ['check'],
    ['district', 's_rats'], ['run', 8, 'n'], ['traffic', 40, 'm', 'rats'], ['run', 8], ['fallers', 2], ['traffic', 36, 'p', 'rats'], ['box', 'shield'], ['run', 10], ['check'],
    ['district', 's_weir'], ['run', 8], ['awnings', 3, 'mushroom'], ['pool', 22, 1], ['springTower', 'w'], ['run', 10], ['goal']] },
  // CREAM SEWERS act 2: the old vaults, the filter beds, the flood tunnel (it flushes), the great cistern, the Kraken
  { z: 1, act: 2, seed: 22, plan: [['district', 's_vault'], ['start'], ['run', 14, 'n'], ['swings', 2], ['run', 10, 'm'], ['tunnel', 26, ['m', 'spike', 'n']], ['rollers', 2], ['box', 'drops'], ['run', 10], ['check'],
    ['district', 's_filters'], ['conveyor', 18, -1, 'm'], ['electric', 3], ['run', 10], ['platPit', 4, 'M', null, 1], ['conveyor', 16, 1, 'n'], ['box', 'shoes'], ['run', 8], ['check'],
    ['district', 's_flood'], ['lanes', { top: [['run', 8], ['gaps', 2, 4], ['crumbleBridge', 6], ['run', 10, 'w'], ['gaps', 2, 5], ['run', 10], ['crumbleBridge', 6], ['run', 12]],
      mid: [['run', 8, 'm'], ['fallers', 3], ['run', 8, 'n'], ['vents', 2], ['run', 10, 'p'], ['fallers', 2], ['run', 12]],
      low: [['run', 6], ['subway', 50, 'wave'], ['run', 6, 'n'], ['subway', 46, 'wave'], ['box', 'drops'], ['run', 8]], portal: 'low' }], ['check'],
    ['district', 's_cistern'], ['run', 8], ['platPit', 5, 'O', null, 1], ['pool', 30, 1], ['jets', 3], ['climb', 9, 'm'], ['run', 8], ['check'],
    ['district', 's_lair'], ['run', 12], ['arena', 'kraken']] },
  // EJACULAND act 1: through the gates, the midway, the coaster (track / queue / maintenance), the carousel, the Load Flume
  { z: 2, act: 1, seed: 31, plan: [['district', 'p_gates'], ['start'], ['run', 16, 'm'], ['rollers', 3], ['box', 'drops'], ['loop'], ['run', 10, 'n'], ['dash'], ['run', 10], ['check'],
    ['district', 'p_midway'], ['run', 8, 'p'], ['awnings', 3, 'drum'], ['rollers2', 2], ['run', 10, 'm'], ['bumpers'], ['run', 10, 'n'], ['check'],
    ['district', 'p_coaster'], ['lanes', { top: [['run', 6], ['subway', 44, 'coaster'], ['dash'], ['loop'], ['subway', 40, 'coaster'], ['run', 10]],
      mid: [['run', 8, 'n'], ['swings', 2], ['run', 8], ['wires', 2], ['run', 10, 'p'], ['box', 'shoes'], ['swings', 1], ['run', 10]],
      low: [['run', 8, 'm'], ['crushers', 3], ['run', 8], ['box', 'drops'], ['rollers2', 2], ['run', 10, 'n'], ['crushers', 2], ['run', 8]], portal: 'top' }], ['check'],
    ['district', 'p_carousel'], ['run', 8], ['platPit', 5, 'N', null, 1], ['run', 8, 'w'], ['platPit', 4, 'O', null, 1], ['box', 'shield'], ['run', 8], ['check'],
    ['district', 'p_flume'], ['run', 6], ['pool', 34, 1], ['run', 8, 'n'], ['pool', 30, 1], ['dash'], ['run', 10], ['goal']] },
  // EJACULAND act 2: the fun house, the bumper cars, the big wheel, the big top (trapeze / ring / under the stands), the pig pen
  { z: 2, act: 2, seed: 32, plan: [['district', 'p_funhouse'], ['start'], ['run', 12, 'm'], ['bumpers'], ['crumbleBridge', 8], ['stairs', 2, 'up'], ['spikeRun', 3], ['stairs', 2, 'down'], ['run', 10, 'n'], ['check'],
    ['district', 'p_bumpcars'], ['traffic', 40, 'n', 'bumper'], ['run', 8], ['traffic', 44, 'm', 'bumper'], ['box', 'shoes'], ['run', 8], ['check'],
    ['district', 'p_wheel'], ['run', 8], ['platPit', 6, 'O', null, 1], ['springTower', 'w'], ['run', 8], ['check'],
    ['district', 'p_bigtop'], ['lanes', { top: [['run', 8], ['swings', 2], ['gaps', 2, 5], ['awnings', 2, 'drum'], ['run', 10], ['gaps', 2, 4], ['run', 10]],
      mid: [['run', 8, 'm'], ['awnings', 3, 'drum'], ['run', 8], ['rollers2', 2], ['run', 10, 'p'], ['box', 'drops'], ['run', 8]],
      low: [['run', 6], ['wires', 2], ['run', 8, 'n'], ['ditch', 4], ['run', 8, 'm'], ['wires', 2], ['run', 8]], portal: 'low' }], ['check'],
    ['district', 'p_pen'], ['run', 12], ['arena', 'pig']] },
  // THE BONE PIT act 1: the ossuary, the boneyard, the old mine (scaffold / the cart track / the flooded crypt), the chasm, the catacombs
  { z: 3, act: 1, seed: 41, plan: [['district', 'b_ossuary'], ['start'], ['run', 14, 'm'], ['crumbleBridge', 8], ['run', 10, 'p'], ['stairs', 3, 'down'], ['box', 'drops'], ['run', 10], ['check'],
    ['district', 'b_graves'], ['run', 8, 'w'], ['graves', 4], ['run', 8, 'n'], ['valley', 4], ['run', 10], ['check'],
    ['district', 'b_mine'], ['lanes', { top: [['run', 8], ['crumbleBridge', 6], ['gaps', 2, 4], ['crumbleBridge', 8], ['run', 10, 'w'], ['box', 'shoes'], ['run', 10]],
      mid: [['run', 6, 'm'], ['traffic', 40, 'n', 'cart'], ['run', 6], ['traffic', 36, 'p', 'cart'], ['run', 8], ['box', 'drops'], ['run', 8]],
      low: [['run', 6], ['fallers', 3, null, 5], ['run', 8, 'n'], ['rollers2', 2], ['run', 8, 'm'], ['fallers', 2, null, 5], ['run', 8]], portal: 'top' }], ['check'],
    ['district', 'b_chasm'], ['run', 8], ['swings', 3], ['climb', 9, 'm'], ['fallers', 3], ['drop', 6], ['run', 8], ['check'],
    ['district', 'b_catacomb'], ['tunnel', 30, ['m', 'spike', 'n']], ['rollers2', 3], ['run', 10], ['goal']] },
  // THE BONE PIT act 2: the crypt, the reliquary, the ghost line (graves / the platform / the tracks), the great spine, the Big Boner
  { z: 3, act: 2, seed: 42, plan: [['district', 'b_crypt'], ['start'], ['run', 12, 'n'], ['awnings', 3, 'coffinlid'], ['run', 8], ['spikeRun', 3], ['run', 8, 'm'], ['check'],
    ['district', 'b_reliquary'], ['jets', 4], ['run', 8, 'm'], ['platPit', 4, 'N', null, 1], ['box', 'shoes'], ['run', 8], ['check'],
    ['district', 'b_ghostline'], ['lanes', { top: [['run', 8], ['gaps', 2, 4], ['crumbleBridge', 6], ['run', 10, 'w'], ['gaps', 2, 5], ['run', 10]],
      mid: [['run', 8, 'm'], ['graves', 3], ['run', 8, 'n'], ['swings', 2], ['run', 10]],
      low: [['run', 6], ['subway', 50, 'ghost'], ['run', 6], ['subway', 44, 'ghost'], ['box', 'drops'], ['run', 8]], portal: 'low' }], ['check'],
    ['district', 'b_spine'], ['valley', 5], ['rollers', 3], ['climb', 9, 'p'], ['drop', 8], ['run', 10, 'w'], ['check'],
    ['district', 'b_pitarena'], ['run', 12], ['arena', 'boner']] },
  // BLOOD FACTORY act 1: the loading bay, the foundry, the assembly line (gantries / the belts / the furnace tunnel), the presses, the boilers
  { z: 4, act: 1, seed: 51, plan: [['district', 'f_bay'], ['start'], ['run', 14, 'm'], ['traffic', 40, 'n', 'forklift'], ['box', 'drops'], ['traffic', 36, 'p', 'forklift'], ['run', 8], ['check'],
    ['district', 'f_foundry'], ['run', 8], ['pool', 18], ['fallers', 3], ['jets', 3], ['run', 8, 'm'], ['check'],
    ['district', 'f_assembly'], ['lanes', { top: [['run', 8], ['swings', 2], ['gaps', 2, 4], ['conveyor', 14, 1], ['run', 10, 'w'], ['box', 'shoes'], ['run', 8]],
      mid: [['run', 6, 'm'], ['conveyor', 20, 1, 'n'], ['crushers', 3], ['conveyor', 18, -1], ['run', 8, 'p'], ['run', 8]],
      low: [['run', 6], ['jets', 4], ['run', 8, 'n'], ['rollers2', 2], ['box', 'drops'], ['run', 8]], portal: 'top' }], ['check'],
    ['district', 'f_press'], ['crushers', 4], ['run', 8, 'p'], ['platPit', 4, 'M', null, 1], ['crushers', 3], ['run', 8], ['check'],
    ['district', 'f_boiler'], ['vents', 3], ['climb', 9, 'm'], ['vents', 2], ['run', 10], ['goal']] },
  // BLOOD FACTORY act 2: the smelter, the pipeworks, the rail yard (cars / the yard / the ore line), the blood vats, the Hot Load
  { z: 4, act: 2, seed: 52, plan: [['district', 'f_smelter'], ['start'], ['run', 12, 'n'], ['pool', 24, 1], ['jets', 4], ['run', 8], ['check'],
    ['district', 'f_pipes'], ['wires', 3], ['climb', 9, 'm'], ['platPit', 4, 'N', null, 1], ['run', 8], ['check'],
    ['district', 'f_rail'], ['lanes', { top: [['run', 8], ['gaps', 2, 4], ['crumbleBridge', 6], ['run', 8, 'w'], ['gaps', 2, 5], ['run', 10]],
      mid: [['run', 6, 'm'], ['fallers', 3], ['rollers2', 2], ['run', 8, 'n'], ['box', 'shoes'], ['run', 8]],
      low: [['run', 6], ['subway', 50, 'ore'], ['run', 6, 'n'], ['subway', 44, 'ore'], ['run', 8]], portal: 'low' }], ['check'],
    ['district', 'f_vats'], ['pool', 30, 1], ['platPit', 5, 'O', null, 1], ['pool', 26, 1], ['box', 'shield'], ['run', 8], ['check'],
    ['district', 'f_furnace'], ['run', 12], ['arena', 'hotload']] },
  // SPUNK BRAIN act 1: the gate, the reactor, the labs (catwalks / the floor / the missile run), the crusher hall, the core
  { z: 5, act: 1, seed: 61, plan: [['district', 'x_gate'], ['start'], ['run', 12, 'm'], ['wires', 3], ['saws', 3], ['run', 8], ['box', 'shield'], ['check'],
    ['district', 'x_reactor'], ['electric', 4], ['jets', 3], ['run', 8, 'n'], ['platPit', 4, 'N', null, 1], ['run', 8], ['check'],
    ['district', 'x_labs'], ['lanes', { top: [['run', 6], ['saws', 2], ['gaps', 2, 4], ['run', 8, 'w'], ['saws', 2, 1], ['run', 10]],
      mid: [['run', 6, 'm'], ['conveyor', 18, 1], ['trapdoors', 3], ['conveyor', 16, -1, 'n'], ['run', 8], ['box', 'drops'], ['run', 8]],
      low: [['run', 6], ['subway', 50, 'missile'], ['run', 6], ['crushers', 3], ['run', 8]], portal: 'top' }], ['check'],
    ['district', 'x_crush'], ['crushers', 5], ['run', 8, 'p'], ['platPit', 4, 'M', null, 1], ['run', 8], ['check'],
    ['district', 'x_core'], ['swings', 2], ['rollers2', 3], ['electric', 3], ['run', 10], ['goal']] },
  // SPUNK BRAIN act 2: the spawning vats, the barracks, the spire (everything at once), the final approach, Blumhead's throne
  { z: 5, act: 2, seed: 62, plan: [['district', 'x_vats'], ['start'], ['run', 10, 'n'], ['pool', 26, 1], ['jets', 4], ['box', 'shield'], ['run', 8], ['check'],
    ['district', 'x_barracks'], ['run', 8, 'm'], ['subway', 44, 'missile'], ['run', 8, 'n'], ['saws', 3], ['run', 8], ['check'],
    ['district', 'x_spire'], ['lanes', { top: [['saws', 3], ['gaps', 2, 5], ['wires', 2], ['run', 8], ['gaps', 2, 4], ['run', 8]],
      mid: [['electric', 4], ['swings', 2], ['trapdoors', 3], ['run', 8, 'm'], ['box', 'drops'], ['run', 8]],
      low: [['crushers', 4], ['jets', 4], ['rollers2', 3], ['run', 8]], portal: 'low' }], ['check'],
    ['district', 'x_approach'], ['saws', 4, 1], ['wires', 3], ['crushers', 3], ['platPit', 5, 'M', null, 1], ['electric', 4], ['run', 8], ['check'],
    ['district', 'x_throne'], ['run', 12], ['arena', 'blum']] }
];
/* the zones after the first: every district gets a second, different stretch of ground (a climb, a dip, a spring
   up to a ledge...) and its own gimmick again in a new arrangement, and the three-lane stretches run twice as long,
   so a district has room to breathe and no two screens of it match */
(function () {
  var TERRAIN = [[['rollers', 2], ['box', 'drops']], [['valley', 4]], [['stairs', 2, 'up'], ['run', 8, 'n'], ['stairs', 2, 'down']], [['springTower', 'w']], [['climb', 9, 'n'], ['run', 6], ['drop', 6]], [['dash'], ['rollers', 3]]];
  var BORING = { run: 1, box: 1, check: 1, start: 1, district: 1, dash: 1, rollers: 1, valley: 1, stairs: 1 };
  ACTS.forEach(function (a, ai) { if (a.z === 0) return; var out = [], seg = [], ti = ai;
    function flush() { if (!seg.length) return; out.push.apply(out, seg);
      var isLanes = seg.some(function (p) { return p[0] === 'lanes'; }), isArena = seg.some(function (p) { return p[0] === 'arena' || p[0] === 'goal'; });
      if (!isLanes && !isArena) { var gim = seg.filter(function (p) { return !BORING[p[0]]; });
        var extra = TERRAIN[ti++ % TERRAIN.length].slice(); if (gim.length) { var g2 = gim[gim.length - 1].slice(); if (typeof g2[1] === 'number' && g2[0] !== 'pool' && g2[0] !== 'traffic' && g2[0] !== 'subway' && g2[0] !== 'conveyor' && g2[0] !== 'tunnel') g2[1] = g2[1] + 1; extra.push(['run', 6, 'm'], g2); }
        out.push.apply(out, extra); }
      seg = []; }
    a.plan.forEach(function (p) { if (p[0] === 'check') { flush(); out.push(p); } else if (p[0] === 'lanes') { var L = p[1], q = { portal: L.portal }; ['top', 'mid', 'low'].forEach(function (k) { q[k] = L[k].concat(L[k]); }); seg.push(['lanes', q]); } else seg.push(p); });
    // the last stretch (before the goal or arena): its extra goes before the goal piece
    var tail = seg; seg = []; var end = tail.filter(function (p) { return p[0] === 'goal' || p[0] === 'arena'; }), body = tail.filter(function (p) { return !(p[0] === 'goal' || p[0] === 'arena'); });
    seg = body; flush(); out.push.apply(out, end.length && end[0][0] === 'arena' ? [['run', 12]].concat(end) : end);
    a.plan = out; });
})();
/* HEIGHT (his ask: Sonic levels are vertical, not flat left to right): every district gets its own way up or down
   straight after it starts, and another before its checkpoint, each district a different shape */
(function () {
  var VERT = [[['ascent', 14, 'm']], [['bigHill', 10]], [['springShaft', 16]], [['descent', 14, 'n']], [['ridge', 'm']], [['plunge', 14]], [['bigHill', 8], ['loop']], [['ascent', 9], ['plunge', 12]],
              [['descent', 10], ['loop']], [['springShaft', 13], ['ridge']], [['ridge'], ['descent', 12]], [['ascent', 12], ['bigHill', 6]]];
  ACTS.forEach(function (a, ai) { var out = [], k = ai * 5, p = a.plan, arenaDist = false;
    for (var i = 0; i < p.length; i++) { var q = p[i];
      if (q[0] === 'district') { arenaDist = p.slice(i + 1, i + 4).some(function (x) { return x[0] === 'arena'; }); }
      if (q[0] === 'check' && !arenaDist && p[i - 1] && p[i - 1][0] !== 'lanes') out.push.apply(out, VERT[(k++) % VERT.length]);
      out.push(q);
      if ((q[0] === 'district' && !(p[i + 1] && p[i + 1][0] === 'start')) || q[0] === 'start') { if (!arenaDist) out.push.apply(out, VERT[(k++) % VERT.length]); }
    }
    a.plan = out; });
})();
/* lay an act's tiles: returns the finished level (tile grid, things, size) */
function buildAct(a) {
  var Z = ZONES[a.z], b = Builder(Z, a.seed);
  a.plan.forEach(function (p) { var f = SEC[p[0]]; if (!f) throw new Error('no piece ' + p[0]); f.apply(null, [b].concat(p.slice(1))); });
  // crop to what is used: a little sky above the highest thing, a few rows under the lowest ground
  var lo = b.ROWS, hi = 0; b.top.forEach(function (t) { if (t !== null && t !== undefined) { lo = Math.min(lo, t); hi = Math.max(hi, t); } });
  b.ents.forEach(function (e) { lo = Math.min(lo, e.row); hi = Math.max(hi, e.row); });
  b.cols.forEach(function (col) { for (var y = b.ROWS - 1; y > 0; y--) if (col[y] !== '#') { hi = Math.max(hi, y); break; } }); // the low roads
  b.cols.forEach(function (col) { for (var y = 0; y < b.ROWS; y++) if (col[y] !== '.' && col[y] !== '#') { lo = Math.min(lo, y); break; } });
  var y0 = Math.max(0, Math.floor(lo) - 14), y1 = Math.min(b.ROWS, hi + 5), H = y1 - y0, W = b.cols.length;
  var t = new Array(W * H);
  for (var x = 0; x < W; x++) for (var y = 0; y < H; y++) t[y * W + x] = b.cols[x][y + y0];
  b.ents.forEach(function (e) { e.x = e.c * TS + TS / 2; e.y = (e.row - y0) * TS; }); // y: the top of that tile row (where a thing standing there has its feet)
  var dc = null; if (b.dists.length) { dc = new Array(W); var di = 0, cur = b.dists[0].id; for (var cx = 0; cx < W; cx++) { while (di < b.dists.length && b.dists[di].c <= cx) { cur = b.dists[di].id; di++; } dc[cx] = cur; } }
  return { w: W, h: H, t: t, ents: b.ents, zone: Z, act: a, distCol: dc, dists: b.dists, bands: b.bands.map(function (q) { return { c0: q.c0, c1: q.c1, H: q.H - y0 }; }) };
}
