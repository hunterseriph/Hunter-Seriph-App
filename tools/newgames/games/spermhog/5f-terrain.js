/* =====================================================================================================
   NEW GROUND SHAPES (part of the big update): four ways up, four ways down and four that stay level, so climbs and
   falls stop looking alike. Each swaps for its twin when the act is already near the top or bottom of its space.
   up: pillars, terraces, bluff, rampup   down: slide, skijump, chute, ledgedrop   level: dunes, halfpipe, canyon, overhang
   ===================================================================================================== */
var TWIN = { pillars: 'slide', terraces: 'ledgedrop', bluff: 'chute', rampup: 'skijump', slide: 'pillars', ledgedrop: 'terraces', chute: 'bluff', skijump: 'rampup' };
function upOK(b, r) { return b.h - r >= HMIN; } function dnOK(b, r) { return b.h + r <= HMAX; }
SEC.pillars = function (b) { // stone pillars, each two rows taller than the last, spikes between
  if (!upOK(b, 9)) return SEC.slide(b); var h0 = b.h; b.ground(4);
  for (var i = 0; i < 4; i++) { b.h = h0; for (var k = 0; k < 2; k++) { b.ground(1); b.set(b.col - 1, h0 - 1, '^'); } b.h = h0 - 2 * (i + 1); b.ground(2); b.drops(-2, 2, 2, null, 1); }
  b.ground(6); b.drops(-5, 3, 2); return b; };
SEC.terraces = function (b) { // broad terraces up a hillside, a spring at the last wall
  if (!upOK(b, 10)) return SEC.ledgedrop(b); b.ground(3); b.up(2); b.ground(7); b.drops(-6, 4, 2, 'arc', 1.3); b.up(3); b.ground(7); b.drops(-6, 4, 2, 'arc', 1.3); b.thing(-2, 'spring', 0, { pow: 1 }); b.step(-4); b.ground(8); b.drops(-7, 5, 2, null, 1.3); return b; };
SEC.bluff = function (b) { // a wall, a steep bank, another wall
  if (!upOK(b, 9)) return SEC.chute(b); b.ground(4); b.drops(-2, 2, 5); b.step(-3); b.ground(5); b.up(2, true); b.ground(4); b.drops(-3, 2, 5); b.step(-3); b.ground(6); b.drops(-5, 3, 2); return b; };
SEC.rampup = function (b) { // a dash pad and a long steep bank straight up
  if (!upOK(b, 7)) return SEC.skijump(b); b.ground(3); b.thing(-1, 'dash', 0, { dir: 1 }); b.ground(4); var c = b.col; b.up(6, true); for (var i = 0; i < 6; i++) b.ent('drop', c + i, b.h + 6 - i - 2); b.ground(10); b.drops(-8, 5, 2, null, 1.4); return b; };
SEC.slide = function (b) { // one long slide down, drops all the way
  if (!dnOK(b, 11)) return SEC.pillars(b); b.ground(3); var c = b.col, h0 = b.h; b.down(10, true); for (var i = 0; i < 10; i++) b.ent('drop', c + i, h0 + i - 1.5); b.ground(6); return b; };
SEC.skijump = function (b) { // down the bank, a kicker, over a pit and onto lower ground
  if (!dnOK(b, 8)) return SEC.rampup(b); b.ground(3); b.down(6, true); b.ground(2); b.up(2, true); b.drops(0, 4, 4, 'arc', 1.4); safePit(b, 6); b.step(3); b.ground(8); b.drops(-6, 3, 2); return b; };
SEC.chute = function (b) { // off the edge into a narrow shaft, out under the hanging rock into a low cave
  if (!dnOK(b, 10)) return SEC.bluff(b); var h0 = b.h; b.ground(4); var c0 = b.col; b.step(9); b.ground(14); var lo = b.h;
  for (var c = c0 + 3; c <= c0 + 4; c++) for (var r = h0 - 6; r <= lo - 5; r++) b.set(c, r, 'W');
  for (var c2 = c0 + 5; c2 <= c0 + 10; c2++) for (var r2 = lo - 5; r2 <= lo - 4; r2++) b.set(c2, r2, 'W');
  for (var d = 0; d < 6; d++) b.ent('drop', c0 + 1, h0 + d * 1.6); b.drops(-8, 5, 2, null, 1.2); return b; };
SEC.ledgedrop = function (b) { // the floor falls away; thin ledges step down to it
  if (!dnOK(b, 11)) return SEC.terraces(b); b.ground(4); b.step(10); b.ground(14); b.ledge(-13, 7, 4, '='); b.drops(-12, 3, 9, null, 1); b.ledge(-8, 4, 4, '='); b.drops(-7, 3, 6, null, 1); b.drops(-3, 2, 2); return b; };
SEC.dunes = function (b) { for (var i = 0; i < 6; i++) { b.ground(2); b.up(1); b.ground(1); b.drops(-1, 2, 3, 'arc', 1); b.down(1); } b.ground(3); return b; }; // little humps one after another
SEC.halfpipe = function (b) { // a U to swing through (an arch over the top if there is no room below)
  b.ground(3); if (dnOK(b, 5)) { b.down(4, true); b.ground(5); b.drops(-5, 4, 2, 'arc', 1.2); b.up(4, true); } else { b.up(4, true); b.ground(5); b.drops(-5, 4, 2, 'arc', 1.2); b.down(4, true); } b.ground(3); return b; };
SEC.canyon = function (b) { // a deep gully with a thin bridge over it: two ways across
  if (!dnOK(b, 8)) return SEC.dunes(b); var h0 = b.h; b.ground(3); var s0 = b.col; b.down(7, true); b.ground(6); b.drops(-5, 4, 2, null, 1.2); b.foe(-3, 'm'); b.up(7, true); b.ground(3);
  for (var c = s0; c < b.col - 3; c++) if (b.get(c, h0) === '.') b.set(c, h0, '='); b.drops(s0 + 2 - b.col, 8, 2, null, 1.6); return b; };
SEC.overhang = function (b) { b.ground(16); b.ceil(-14, 13, 5, 2); for (var c = b.col - 12; c < b.col - 3; c += 3) b.set(c, b.h - 4, 'v'); b.drops(-13, 8, 2, null, 1.5); return b; }; // a rock roof with fangs: do not jump into it
