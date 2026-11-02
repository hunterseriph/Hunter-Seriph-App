/* =====================================================================================================
   DISTRICTS for the other five zones (see 1c-districts.js). Each keeps its zone's colours but every stretch
   has its own ground, scenery, furniture and set piece. Palettes: sewers black-green and cream, Ejaculand
   black, red and gold bulbs, the Bone Pit bone and black, the factory rust and black, Spunk Brain steel and red.
   ===================================================================================================== */
(function () {
  var SEW = ['#3a4a3e', '#24302a', '#101612'], SEWE = ['#fffbe8', '#f1e0b0', '#8a7a50'], MET = ['#4a4a44', '#2e2e2a', '#141412'], CREAMT = ['#fffbe8', '#f1e0b0', '#a89060'];
  var PARK = ['#c4121c', '#1a0a0c', '#0a0405'], PARKE = ['#ffe36a', '#c4121c', '#3a0408'], BONEP = ['#8a7a64', '#4e4234', '#201a14'], BONEE = ['#f1e7d0', '#b8a888', '#4a3e2e'];
  var RUSTP = ['#6a4a40', '#3a2420', '#160c0a'], RUSTE = ['#ffb040', '#a04a10', '#3a1404'], STL = ['#5a5460', '#34303a', '#14121a'], STLE = ['#ff2630', '#8a0a10', '#2a0408'];
  function D(name, fill, top, pal, edge, back, props, extra) { var d = { name: name, fill: fill, top: top, pal: pal, edge: edge, back: back, props: props, shops: [] }; for (var k in extra || {}) d[k] = extra[k]; return d; }
  var X = {
    // CREAM SEWERS
    s_outfall: D('', 'sewer', 'slime', SEW, SEWE, 'outfall', ['pipe', 'valve', 'grate', 'drip']),
    s_pumps: D('', 'metal', 'grate', MET, ['#c8c0a0', '#6a6650', '#2a2a20'], 'pumproom', ['gauge', 'valve', 'ladder', 'gastank']),
    s_canal: D('', 'sewer', 'slime', SEW, SEWE, 'channel', ['sludge', 'fungus', 'grate'], { topS: { fill: 'metal', top: 'grate', pal: MET, edge: ['#c8c0a0', '#6a6650', '#2a2a20'], props: ['valve', 'pipe'] }, lowS: { fill: 'stone', top: 'slime', pal: ['#2a3a30', '#1a241e', '#0a0e0c'], edge: CREAMT, props: ['fungus', 'sludge'] } }),
    s_rats: D('', 'brick', 'slime', ['#3a2a24', '#241814', '#100a08'], SEWE, 'ratnest', ['sludge', 'barrels', 'skullpile', 'fungus']),
    s_weir: D('', 'stone', 'slime', ['#3a4440', '#262e2a', '#101412'], SEWE, 'weir', ['fungus', 'drip', 'pipe']),
    s_vault: D('', 'sewer', 'slime', ['#2e3a32', '#1c2620', '#0c100e'], SEWE, 'vaults', ['lantern', 'grate', 'fungus']),
    s_filters: D('', 'tile', 'platform', ['#4a5a4a', '#2e3a2e', '#141a14'], ['#fffbe8', '#c8b080', '#4a3a20'], 'filters', ['gastank', 'valve', 'gauge']),
    s_flood: D('', 'sewer', 'slime', SEW, SEWE, 'floodtunnel', ['grate', 'drip', 'sludge'], { topS: { fill: 'metal', top: 'rim', pal: MET, edge: ['#c8c0a0', '#6a6650', '#2a2a20'], props: ['valve', 'ladder'] }, lowS: { fill: 'stone', top: 'slime', pal: ['#2a3a30', '#1a241e', '#0a0e0c'], edge: CREAMT, props: ['fungus'] } }),
    s_cistern: D('', 'stone', 'slime', ['#34403a', '#222a26', '#0e1210'], SEWE, 'cistern', ['lantern', 'fungus', 'drip']),
    s_lair: D('', 'stone', 'slime', ['#2a3430', '#1a2220', '#0a0e0c'], SEWE, 'krakenlair', ['fungus']),
    // EJACULAND
    p_gates: D('', 'checker', 'bulbs', PARK, PARKE, 'parkgates', ['booth', 'balloons', 'queue', 'bulbarch']),
    p_midway: D('', 'stripe', 'bulbs', PARK, PARKE, 'midway', ['popcorn', 'balloons', 'ridesign', 'booth']),
    p_coaster: D('', 'stripe', 'bulbs', PARK, PARKE, 'coasterback', ['queue', 'ridesign', 'balloons'], { topS: { fill: 'metal', top: 'rim', pal: ['#5a1418', '#3a0a0e', '#1a0406'], edge: ['#ffe36a', '#c4121c', '#3a0408'], props: [] }, lowS: { fill: 'concrete', top: 'hazard', pal: ['#3a2a2c', '#24181a', '#100a0c'], edge: ['#ffe36a', '#8a0a10', '#1a0408'], props: ['ladder', 'barrels'] } }),
    p_carousel: D('', 'checker', 'bulbs', ['#ffe36a', '#1a0a0c', '#0a0405'], PARKE, 'carousel', ['balloons', 'popcorn', 'bulbarch']),
    p_flume: D('', 'plank', 'plankedge', ['#5a2420', '#3a1412', '#1a0806'], ['#ffe36a', '#8a3a30', '#200806'], 'flume', ['queue', 'ridesign', 'buoy']),
    p_funhouse: D('', 'checker', 'bulbs', ['#c4121c', '#5a0a10', '#120406'], PARKE, 'funhouse', ['balloons', 'ridesign']),
    p_bumpcars: D('', 'asphalt', 'bulbs', ['#2a1a1e', '#1a0e12', '#0a0406'], PARKE, 'arenalights', ['queue', 'booth']),
    p_wheel: D('', 'stripe', 'bulbs', PARK, PARKE, 'ferriswheel', ['popcorn', 'balloons', 'booth']),
    p_bigtop: D('', 'plank', 'bulbs', ['#6a1a1c', '#3a0a0e', '#1a0406'], PARKE, 'bigtop', ['drum', 'balloons']),
    p_pen: D('', 'stripe', 'bulbs', PARK, PARKE, 'pigpen', ['queue']),
    // THE BONE PIT
    b_ossuary: D('', 'bone', 'skulls', BONEP, BONEE, 'ossuary', ['skullpile', 'candle', 'bonefence']),
    b_graves: D('', 'stone', 'skulls', ['#4a4440', '#2e2a26', '#141210'], BONEE, 'boneyard', ['grave', 'cross', 'lantern', 'bonefence']),
    b_mine: D('', 'stone', 'skulls', ['#4a3e34', '#2e2620', '#14100c'], BONEE, 'mineshaft', ['lantern', 'barrels', 'ladder'], { topS: { fill: 'plank', top: 'plankedge', pal: ['#5a3a24', '#3a2414', '#1a0e06'], edge: ['#a08060', '#6a5030', '#2a1a0a'], props: ['lantern'] }, lowS: { fill: 'bone', top: 'skulls', pal: ['#5a5044', '#3a3228', '#18140e'], edge: BONEE, props: ['skullpile', 'candle'] } }),
    b_chasm: D('', 'bone', 'skulls', ['#6a5e4e', '#3e3428', '#1a1610'], BONEE, 'chasm', ['skullpile', 'candle']),
    b_catacomb: D('', 'stone', 'skulls', ['#3a342e', '#24201c', '#100e0c'], BONEE, 'catacombs', ['coffinup', 'candle', 'skullpile']),
    b_crypt: D('', 'stone', 'skulls', ['#3e3040', '#261e28', '#100c12'], BONEE, 'crypt', ['coffinup', 'lantern', 'cross']),
    b_reliquary: D('', 'tile', 'skulls', ['#5a4a3a', '#3a2e24', '#18120e'], BONEE, 'reliquary', ['candle', 'cross', 'skullpile']),
    b_ghostline: D('', 'bone', 'skulls', BONEP, BONEE, 'ghostline', ['lantern', 'bonefence'], { topS: { fill: 'stone', top: 'skulls', pal: ['#4a4440', '#2e2a26', '#141210'], edge: BONEE, props: ['grave'] }, lowS: { fill: 'tile', top: 'platform', pal: ['#3a2a30', '#24181e', '#100a0c'], edge: BONEE, props: ['lantern', 'coffinup'] } }),
    b_spine: D('', 'bone', 'skulls', ['#a09078', '#6a5a48', '#2a2218'], BONEE, 'spine', ['skullpile', 'candle']),
    b_pitarena: D('', 'bone', 'skulls', BONEP, BONEE, 'bonearena', ['skullpile']),
    // BLOOD FACTORY
    f_bay: D('', 'concrete', 'hazard', ['#4a3a34', '#2e2420', '#140e0c'], RUSTE, 'loadingbay', ['pallet', 'barrels', 'gastank']),
    f_foundry: D('', 'metal', 'grate', RUSTP, RUSTE, 'foundry', ['anvil', 'barrels', 'gauge']),
    f_assembly: D('', 'metal', 'grate', RUSTP, RUSTE, 'assembly', ['pallet', 'gauge', 'hoist'], { topS: { fill: 'metal', top: 'rim', pal: ['#5a3a30', '#3a2420', '#1a0e0a'], edge: RUSTE, props: ['hoist'] }, lowS: { fill: 'stone', top: 'grate', pal: ['#3a1a10', '#24100a', '#100604'], edge: ['#ff9a40', '#a03a10', '#3a1004'], props: ['anvil'] } }),
    f_press: D('', 'plate', 'hazard', ['#5a4a40', '#3a2e28', '#181210'], RUSTE, 'presses', ['gauge', 'barrels']),
    f_boiler: D('', 'metal', 'rim', ['#6a3a2a', '#3a2018', '#180c08'], RUSTE, 'boilers', ['gastank', 'valve', 'gauge']),
    f_smelter: D('', 'stone', 'grate', ['#5a2a1a', '#3a1810', '#180804'], RUSTE, 'smelter', ['anvil', 'barrels']),
    f_pipes: D('', 'metal', 'rim', ['#4a4440', '#2e2a28', '#141210'], RUSTE, 'pipeworks', ['valve', 'gauge', 'ladder']),
    f_rail: D('', 'asphalt', 'road', ['#3a2a24', '#241a16', '#100a08'], ['#ffb040', '#6a3a1a', '#1a0a04'], 'railyard', ['barrels', 'pallet', 'roadsign'], { topS: { fill: 'container', top: 'rim', pal: ['#6a2a1a', '#3a1a10', '#1a0a06'], edge: RUSTE, props: ['barrels'] }, lowS: { fill: 'stone', top: 'grate', pal: ['#3a2418', '#24160e', '#100a06'], edge: RUSTE, props: ['anvil'] } }),
    f_vats: D('', 'plate', 'grate', ['#5a1a1a', '#3a0e0e', '#180606'], ['#ff6a50', '#a01a10', '#3a0604'], 'bloodvats', ['gastank', 'gauge', 'valve']),
    f_furnace: D('', 'metal', 'grate', RUSTP, RUSTE, 'furnacearena', ['anvil']),
    // SPUNK BRAIN
    x_gate: D('', 'plate', 'hazard', STL, STLE, 'brgate', ['terminal', 'cables', 'blumbanner']),
    x_reactor: D('', 'plate', 'hazard', ['#4a4450', '#2e2a34', '#121016'], STLE, 'reactor', ['gauge', 'cables', 'rack']),
    x_labs: D('', 'tile', 'platform', ['#5a5660', '#3a3640', '#1a181e'], ['#ff2630', '#c4121c', '#2a0408'], 'labs', ['specimen', 'terminal', 'rack'], { topS: { fill: 'metal', top: 'rim', pal: STL, edge: STLE, props: ['cables'] }, lowS: { fill: 'plate', top: 'hazard', pal: ['#3a3440', '#24202a', '#100e14'], edge: STLE, props: ['rack', 'cables'] } }),
    x_crush: D('', 'metal', 'hazard', ['#4a4448', '#2e2a2e', '#141214'], STLE, 'machinery', ['gauge', 'cables']),
    x_core: D('', 'plate', 'hazard', ['#5a3a44', '#3a2228', '#180c10'], STLE, 'brcore', ['specimen', 'blumbanner', 'terminal']),
    x_vats: D('', 'tile', 'platform', ['#4a3a4a', '#2e222e', '#140e14'], STLE, 'spawnvats', ['specimen', 'gastank']),
    x_barracks: D('', 'plate', 'hazard', STL, STLE, 'barracks', ['blumbanner', 'rack', 'terminal']),
    x_spire: D('', 'plate', 'hazard', STL, STLE, 'spire', ['cables', 'terminal'], { topS: { fill: 'metal', top: 'rim', pal: STL, edge: STLE, props: ['blumbanner'] }, lowS: { fill: 'plate', top: 'hazard', pal: ['#3a2a30', '#24181e', '#100a0c'], edge: STLE, props: ['rack'] } }),
    x_approach: D('', 'plate', 'hazard', ['#3a3440', '#24202a', '#100e14'], STLE, 'approach', ['blumbanner', 'specimen']),
    x_throne: D('', 'plate', 'hazard', ['#3a2a34', '#24161e', '#10080c'], STLE, 'thronehall', ['blumbanner'])
  };
  for (var k in X) DIST[k] = X[k];
})();
