/* =====================================================================================================
   DISTRICTS: Night City is a trip across town, west to east, and no two stretches look alike. Each district
   has its own ground (fill + edge), its own backdrop, its own street furniture, its own shops (every shop
   appears once in the whole zone) and its own trap, which you meet nowhere else. Three-lane districts give
   the high road, the street and the low road a look each (top / mid / low).
   ===================================================================================================== */
var DIST = {
  row:     { name: 'CLUBHOUSE ROW',      fill: 'brick',   top: 'curb',    pal: ['#7a2a2e', '#4e1418', '#24080a'], edge: ['#b8a8a0', '#6a5a58', '#2a1e1e'], back: 'terraces', props: ['bench', 'phone', 'hydrant', 'bin', 'mailbox'], shops: ['fac_club', 'fac_greebo', 'fac_amy'] },
  cafe:    { name: 'THE CAFE QUARTER',   fill: 'cobble',  top: 'curb',    pal: ['#7a6458', '#54423a', '#2a201c'], edge: ['#e8dcc8', '#a89880', '#3a2e24'], back: 'cafe', props: ['table', 'planter', 'stall', 'table', 'planter'], shops: ['fac_cafe', 'fac_saba'] },
  site:    { name: 'THE BUILDING SITE',  fill: 'concrete', top: 'hazard', pal: ['#6a6460', '#4a4440', '#221e1c'], edge: ['#ffe36a', '#c89a20', '#3a2a04'], back: 'cranes', props: ['cone', 'barrier', 'loo', 'girders', 'warn'], shops: [] },
  downtown:{ name: 'DOWNTOWN',           fill: 'paving',  top: 'curb',    pal: ['#6a6670', '#46424c', '#201e24'], edge: ['#d8d0d8', '#8a8290', '#2a262c'], back: 'towers', props: ['lamp2', 'hydrant', 'bin', 'busstop', 'paper'], shops: ['fac_beebs'],
             topS: { fill: 'tar', top: 'parapet', pal: ['#3e3a40', '#2a2630', '#141218'], edge: ['#c8c0c8', '#7a7280', '#2a262c'], props: ['watertower', 'ac', 'antenna', 'chimney', 'dish'] },
             lowS: { fill: 'tile', top: 'platform', pal: ['#c8c0a8', '#9a9480', '#4a463c'], edge: ['#ffe36a', '#c8a020', '#3a2a04'], props: ['subsign', 'subbench', 'poster', 'pillar'] } },
  plaza:   { name: 'POTBELLY PLAZA',     fill: 'checker', top: 'curb',    pal: ['#5a1418', '#2a0a0c', '#12040a'], edge: ['#ffe36a', '#c4121c', '#3a0408'], back: 'neon', props: ['lamp2', 'planter', 'bench'], shops: ['fac_arcade'] },
  alley:   { name: 'RED LIGHT ALLEY',    fill: 'wetbrick', top: 'curb',   pal: ['#4a1a22', '#2e0e14', '#140608'], edge: ['#a08890', '#5a4048', '#1e1014'], back: 'alley', props: ['neonarrow', 'bin', 'puddle', 'crate', 'neonarrow'], shops: ['fac_t', 'fac_tb', 'fac_bonjo'] },
  docks:   { name: 'THE CREAM DOCKS',    fill: 'plank',   top: 'plankedge', pal: ['#7a5232', '#543620', '#2a1a0e'], edge: ['#c8a070', '#8a6a44', '#2e2010'], back: 'docks', props: ['bollard', 'rope', 'crates', 'buoy'], shops: ['fac_joff', 'fac_pulsar'],
             topS: { fill: 'container', top: 'rim', pal: ['#8a2a22', '#5a1814', '#2a0a08'], edge: ['#d86a50', '#8a3a2a', '#2a0a08'], props: ['vent2', 'crates'] },
             lowS: { fill: 'stone', top: 'slime', pal: ['#4a5246', '#2e342c', '#141812'], edge: ['#fffbe8', '#f1e0b0', '#8a7a50'], props: ['pipe', 'grate'] } },
  highway: { name: 'THE OVERPASS',       fill: 'asphalt', top: 'road',    pal: ['#3a3a40', '#26262c', '#121216'], edge: ['#f1e7d0', '#8a8a90', '#1a1a1e'], back: 'highway', props: ['crashbar', 'roadsign', 'lamp2', 'crashbar'], shops: [] },
  oldtown: { name: 'OLD TOWN',           fill: 'stone',   top: 'moss',    pal: ['#5a5650', '#3a3632', '#1a1816'], edge: ['#7a8a4a', '#4a5a2a', '#1a2010'], back: 'church', props: ['grave', 'fence', 'candle', 'grave', 'cross'], shops: ['fac_sanct'] },
  drain:   { name: 'THE STORM DRAIN',    fill: 'stone',   top: 'slime',   pal: ['#3a4440', '#262e2a', '#101412'], edge: ['#fffbe8', '#f1e0b0', '#8a7a50'], back: 'drain', props: ['pipe', 'grate'], shops: [] }
};
/* which district a column is in, and which look a cell uses (the high road, street or low road of a three-lane stretch) */
function distAt(c) { var d = LV.distCol; if (!d) return null; return d[Math.max(0, Math.min(d.length - 1, c))]; }
function bandAt(c, r) { var b = LV.bands; if (!b) return 'mid'; for (var i = 0; i < b.length; i++) { var q = b[i]; if (c >= q.c0 && c < q.c1) return r < q.H - 4 ? 'top' : r > q.H + 2 ? 'low' : 'mid'; } return 'mid'; }
function styleOf(id, band) { var d = DIST[id]; if (!d) return null; if (band === 'top' && d.topS) return d.topS; if (band === 'low' && d.lowS) return d.lowS; return d; }
var TILESETS = {};
function tilesFor(c, r) {
  var id = distAt(c); if (!id) return TILESET; var band = bandAt(c, r), key = id + ':' + band, t = TILESETS[key];
  if (!t) { var s = styleOf(id, band), Z = {}; for (var q in LV.zone) Z[q] = LV.zone[q]; Z.fill = s.fill; Z.top = s.top; Z.pal = s.pal; Z.edge = s.edge; t = TILESETS[key] = buildTileset(Z); }
  return t;
}
