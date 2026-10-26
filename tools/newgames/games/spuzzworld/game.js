/* =====================================================================================================
   SPUZZWORLD: CUM'S ODDYSEE. An Oddworld style escape. Blumhead has Cumhead in the dungeon under his lair,
   a bear trap clamped on his leg, hours from his execution. The homunculi are down here too, waiting to be minced
   into homuncupies. Limp out alone, or take them with you: save enough and Cumhead gets to Blumhead's throne first.
   One screen at a time: walk, run, leap, climb and drop, pull levers, ride lifts, keep still in the dark
   while the guards look, outrun blumlings, jump the mines. Homunculi are held prisoner all over the lair.
   Tell them to follow you (X), wait (Y), and hold CHANT (C / LB) next to a portal to send them home.
   Escape alone, or save every one of them. Die and the screen starts again.
   ===================================================================================================== */
var SW = 480, SH = 272, TT = 16, GRAV = 900, WALK = 56, RUN = 112; // he limps: slower than he'd like
var R = KIT.R, spr = KIT.spr, text = KIT.text;
var SV = KIT.load('sw-save', null) || { best: -1, done: 0 };
function persist() { KIT.save('sw-save', SV); }
var G = { mode: 'title', t: 0 }, P, homs, SC = {}, trail, bubbles, parts, banner, total = 0, STORY = null, SCENE = null;
var BREEDS = ['gloop', 'ember', 'frost', 'volt', 'scout', 'goldie', 'medic', 'titan', 'leech', 'blood'];

/* ---------- build the world from the screen text ---------- */
function build() {
  SC = {}; homs = []; var hid = 0; total = 0;
  SCREENS.forEach(function (s) {
    var key = s.sx + ',' + s.sy, sc = { s: s, key: key, sx: s.sx, sy: s.sy, grid: [], guards: [], blums: [], mines: [], levers: [], portals: [], lifts: [], exits: [], signs: [], bars: [], leverOn: false };
    var sign = 0;
    for (var y = 0; y < 17; y++) {
      var row = ((s.rows[y] || '') + '                              ').slice(0, 30).split('');
      for (var x = 0; x < 30; x++) {
        var c = row[x], wx = s.sx * SW + x * TT + 8, wy = s.sy * SH + (y + 1) * TT;
        if (c === '@') { sc.start = { x: wx, y: wy }; row[x] = ' '; }
        else if (c === 'H') { homs.push({ id: hid++, x: wx, y: wy, breed: BREEDS[(hid * 7) % BREEDS.length], st: 'idle', face: x < 15 ? 1 : -1, scr: key, t: Math.random() * 3 }); total++; row[x] = ' '; }
        else if (c === 'G' || c === 'g' || c === 'z') { sc.guards.push({ x: wx, y: wy, face: c === 'g' ? -1 : 1, st: c === 'z' ? 'sleep' : 'patrol', t: 0, tx: x, ty: y }); row[x] = ' '; }
        else if (c === 'B') { sc.blums.push({ x: wx, y: wy, face: -1, st: 'idle', t: 0 }); row[x] = ' '; }
        else if (c === 'M') { sc.mines.push({ x: wx, y: wy, alive: true }); row[x] = ' '; }
        else if (c === 'L') { sc.levers.push({ x: wx, y: wy }); row[x] = ' '; }
        else if (c === 'P') { sc.portals.push({ x: wx, y: wy, open: 0 }); row[x] = ' '; }
        else if (c === 'U' || c === 'V') { sc.lifts.push({ x: wx, y: wy, up: c === 'U' }); row[x] = ' '; }
        else if (c === 'X') { sc.exits.push({ x: wx, y: wy }); row[x] = ' '; }
        else if (c === 'T') { sc.signs.push({ x: wx, y: s.sy * SH + y * TT + 8, t: s.signs[sign++] || '' }); row[x] = ' '; }
      }
      sc.grid.push(row);
    }
    SC[key] = sc;
  });
  for (var k2 in SC) SC[k2].init = JSON.stringify({ guards: SC[k2].guards, blums: SC[k2].blums, mines: SC[k2].mines });
  // where each guard turns: the stop marks, walls, gates or the end of the floor
  for (var k in SC) SC[k].guards.forEach(function (g) {
    var sc = SC[k], row = sc.grid[g.ty], under = sc.grid[g.ty + 1];
    function stop(x) { return x < 0 || x > 29 || row[x] === '|' || row[x] === '#' || row[x] === 'D' || !(under[x] === '#' || under[x] === '=' || under[x] === 'h'); }
    var a = g.tx, b = g.tx; while (!stop(a - 1)) a--; while (!stop(b + 1)) b++;
    g.min = sc.sx * SW + a * TT + 8; g.max = sc.sx * SW + b * TT + 8;
  });
}
function scrAt(wx, wy) { return SC[Math.floor(wx / SW) + ',' + Math.floor(wy / SH)]; }
function tileAt(wx, wy) {
  var sx = Math.floor(wx / SW), sy = Math.floor(wy / SH), sc = SC[sx + ',' + sy];
  if (!sc) return SC[sx + ',' + (sy - 1)] ? ' ' : '#';
  var tx = Math.floor((wx - sx * SW) / TT), ty = Math.floor((wy - sy * SH) / TT); if (ty > 16) return ' ';
  return sc.grid[ty][tx];
}
function solidAt(wx, wy) { var c = tileAt(wx, wy); if (c === '#' || c === '=' || c === 'h') return true; if (c === 'D') { var sc = scrAt(wx, wy); return !sc.leverOn; } return false; }
function boxHit(x, y, hw, h) { for (var yy = y - h; yy <= y - 1; yy += 8) { if (solidAt(x - hw, yy) || solidAt(x + hw, yy)) return true; } return solidAt(x - hw, y - 1) || solidAt(x + hw, y - 1); }
function groundAt(x, y) { return solidAt(x - 5, y + 1) || solidAt(x + 5, y + 1); }

/* ---------- a fresh escape ---------- */
function newGame() { STORY = { pages: INTRO, i: 0, t: 0, done: startEscape }; G.mode = 'story'; music.play('swtitle'); }
function startEscape() {
  build(); G.clock = 240; G.seen = { '0,0': 1 }; G.grace = 0; var st = SC['0,0'].start; P = { x: st.x, y: st.y, vx: 0, vy: 0, face: 1, st: 'stand', ground: true, t: 0, fallFrom: st.y, anim: 0, chant: 0 };
  G.saved = 0; G.lost = 0; G.deaths = 0; trail = [{ x: P.x, y: P.y, d: 0 }]; bubbles = []; parts = []; G.scr = '0,0';
  snapshot(); G.mode = 'play'; banner = { t: 3, a: 'CELL 37', b: "BLUMHEAD'S DUNGEON" }; music.play('swcells');
  say(P, 'My leg... the chain snapped. The trap didn\'t.', 3);
}
/* walking back into a screen puts its guards, blumlings and mines back where they started, and nobody can see you
   for a moment, so you never come in under a gun. Guards right by the way in turn their backs. */
function resetFoes(sc) {
  var o = JSON.parse(sc.init); sc.guards = o.guards; sc.blums = o.blums; sc.mines = o.mines; G.grace = 1.6;
  sc.guards.forEach(function (g) { if (g.st !== 'sleep' && Math.abs(g.x - P.x) < 200 && Math.abs(g.y - P.y) < 20 && (P.x - g.x) * g.face > 0) { g.face = -g.face; g.st = 'patrol'; g.t = 0; } });
}
/* the screen you came into is the checkpoint: die and it all goes back to how it was */
function snapshot() {
  var dyn = {}; for (var k in SC) { var sc = SC[k]; dyn[k] = { guards: sc.guards, blums: sc.blums, mines: sc.mines, portals: sc.portals, leverOn: sc.leverOn }; }
  G.snap = JSON.stringify({ P: P, homs: homs, dyn: dyn, saved: G.saved, lost: G.lost, clock: G.clock, seen: G.seen });
  try { localStorage.setItem('sw-run', JSON.stringify({ snap: G.snap, deaths: G.deaths })); } catch (e) {}
}
function restore(snap) {
  var o = JSON.parse(snap), savedNow = {}; homs && homs.forEach(function (h) { if (h.st === 'saved') savedNow[h.id] = 1; });
  P = o.P; homs = o.homs; G.lost = o.lost; G.clock = o.clock || 240; G.seen = o.seen || {}; G.grace = 1.6; for (var k in o.dyn) { var d = o.dyn[k], sc = SC[k]; sc.guards = d.guards; sc.blums = d.blums; sc.mines = d.mines; sc.portals = d.portals; sc.leverOn = d.leverOn; }
  homs.forEach(function (h) { if (savedNow[h.id]) h.st = 'saved'; if (h.st === 'follow') { h.join = true; } }); G.saved = homs.filter(function (h) { return h.st === 'saved'; }).length;
  P.st = 'stand'; P.vx = P.vy = 0; P.ground = true; P.fallFrom = P.y; trail = [{ x: P.x, y: P.y, d: 0 }]; homs.forEach(function (h) { h.k = 0; }); bubbles = []; parts = [];
  G.scr = Math.floor(P.x / SW) + ',' + Math.floor((P.y - 1) / SH);
}
function continueGame() { var s = KIT.load('sw-run', null); if (!s) return newGame(); build(); G.deaths = s.deaths || 0; restore(s.snap); G.snap = s.snap; G.mode = 'play'; var sc = SC[G.scr]; banner = { t: 2.5, a: sc.s.name.toUpperCase(), b: ZONES[sc.s.zone].name.toUpperCase() }; music.play(['swcells', 'swworks', 'swthrone'][sc.s.zone]); }

/* ---------- Cumhead ---------- */
function visible(e) { // in the dark you cannot be seen unless you run
  var sc = scrAt(e.x, e.y - 20); if (!sc) return true; var tx = (e.x - sc.sx * SW) / TT, ty = (e.y - 20 - sc.sy * SH) / TT;
  var dark = sc.s.shadows.some(function (r) { return tx >= r[0] && tx <= r[2] + 1 && ty >= r[1] && ty <= r[3] + 1; });
  return !dark || e.st === 'run' || e.st === 'air';
}
function running() { return KIT.held('b') || KIT.held('run'); }
function updP(dt) {
  P.t += dt; if (P.inv > 0) P.inv -= dt;
  if (P.st === 'dead') { P.deadT -= dt; if (P.deadT <= 0) { G.deaths++; restore(G.snap); } return; }
  if (P.st === 'hoist' || P.st === 'drop') { P.at += dt; var k = Math.min(1, P.at / P.dur); P.x = lerp(P.from.x, P.to.x, k); P.y = lerp(P.from.y, P.to.y, P.st === 'hoist' ? Math.sin(k * Math.PI / 2) : k * k); if (k >= 1) { P.st = 'stand'; P.ground = true; P.fallFrom = P.y; if (P.st2 === 'drop') sfx.play('land'); } recordTrail(); return; }
  if (P.st === 'lift') { P.at += dt; if (P.at < 0.6) P.y += (P.lift.up ? -1 : 1) * 160 * dt; else { var to = P.lift.to; var dx0 = P.x, dy0 = P.y; P.x = to.x; P.y = to.y; P.st = 'stand'; carry(dx0, dy0); sfx.play('door'); } return; }
  if (P.st === 'door') return;
  var ix = (KIT.held('right') ? 1 : 0) - (KIT.held('left') ? 1 : 0);
  if (P.ground) {
    if (KIT.held('lb') && Math.abs(P.vx) < 5) { chant(dt); return; } P.chant = 0;
    var sp = running() ? RUN : WALK; P.vx = ix * sp; if (ix) P.face = ix;
    P.st = ix ? (running() ? 'run' : 'walk') : 'stand';
    if (KIT.pressed('up')) { if (useUp()) return; }
    if (KIT.pressed('down')) { if (useDown()) return; }
    if (KIT.pressed('a')) { var run = running() && Math.abs(P.vx) > 10, walk = Math.abs(P.vx) > 10; P.vy = run ? -310 : walk ? -270 : -235; P.vx = run ? P.face * 180 : walk ? P.face * 115 : 0; P.ground = false; P.st = 'air'; P.fallFrom = P.y; sfx.play('jump'); }
    if (KIT.pressed('x')) speak('FOLLOW ME!'); if (KIT.pressed('y')) speak('WAIT!');
  } else P.st = 'air';
  // move
  var nx = P.x + P.vx * dt; if (!boxHit(nx, P.y, 6, 50)) P.x = nx; else { P.vx = 0; }
  if (!P.ground) { P.vy += GRAV * dt; var ny = P.y + P.vy * dt; if (P.vy > 0 && groundAt(P.x, ny - 1)) { P.y = Math.floor(ny / TT) * TT; landed(); } else if (P.vy < 0 && boxHit(P.x, ny, 6, 50)) P.vy = 0; else P.y = ny; }
  else if (!groundAt(P.x, P.y)) { P.ground = false; P.fallFrom = P.y; P.vy = 0; }
  if (P.y > (Math.floor(P.fallFrom / SH) + 1) * SH + 40 && !SC[Math.floor(P.x / SW) + ',' + Math.floor(P.y / SH)]) die('fell into the dark');
  if (P.ground && P.st !== 'stand') { var st = Math.floor(P.t * (P.st === 'run' ? 9 : 5)); if (st !== P.lastStep) { P.lastStep = st; if (st % 2) sfx.tone('square', 90, 60, 0.05, 0.03); else if (P.st === 'run') sfx.play('step'); } }
  recordTrail();
}
function landed() { P.ground = true; P.vy = 0; var fall = P.y - P.fallFrom; P.vx = 0; if (fall > 7.5 * TT) { die('fell too far'); return; } P.st = 'stand'; sfx.play('land'); }
function recordTrail() { var l = trail[trail.length - 1], d = Math.hypot(P.x - l.x, P.y - l.y); if (d > 2) { trail.push({ x: P.x, y: P.y, d: l.d + d }); if (trail.length > 3000) { trail.shift(); homs.forEach(function (h) { if (h.k) h.k--; }); } } }
function near(list, r) { var out = null; list.forEach(function (e) { if (Math.abs(e.x - P.x) < r && Math.abs(e.y - P.y) < 10) out = e; }); return out; }
function useUp() {
  var sc = scrAt(P.x, P.y - 4); if (!sc) return false;
  var lv = near(sc.levers, 14); if (lv) { sc.leverOn = !sc.leverOn; sfx.play('door'); KIT.shake(2); say(P, sc.leverOn ? 'Click.' : 'Clunk.', 1); return true; }
  var lf = near(sc.lifts, 16); if (lf && lf.up) { ride(lf, sc); return true; }
  var ex = near(sc.exits, 18); if (ex) { P.st = 'door'; ending(); return true; }
  // a yellow ledge five tiles up: climb onto it
  var hy = P.y - 5 * TT + 4;
  for (var o = 0; o <= 12; o += 6) for (var s = -1; s <= 1; s += 2) { var hx = P.x + o * s; if (tileAt(hx, hy) === 'h' && !solidAt(hx, hy - TT)) { var cx = Math.floor(hx / TT) * TT + 8; P.st = 'hoist'; P.at = 0; P.dur = 0.5; P.from = { x: P.x, y: P.y }; P.to = { x: cx, y: Math.floor(hy / TT) * TT }; P.st2 = 'hoist'; sfx.play('jump'); return true; } }
  return false;
}
function useDown() {
  var sc = scrAt(P.x, P.y - 4); if (!sc) return false;
  var lf = near(sc.lifts, 16); if (lf && !lf.up) { ride(lf, sc); return true; }
  if (tileAt(P.x, P.y + 4) === 'h') { // drop down through the climbing ledge to the floor below
    for (var d = 2; d <= 12; d++) { var y = P.y + d * TT; if (solidAt(P.x, y + 1) && !solidAt(P.x, y - 1)) { P.st = 'drop'; P.st2 = 'drop'; P.at = 0; P.dur = 0.4; P.from = { x: P.x, y: P.y }; P.to = { x: P.x, y: y }; return true; } }
  }
  return false;
}
function ride(lf, sc) {
  var tsc = SC[sc.sx + ',' + (sc.sy + (lf.up ? -1 : 1))]; if (!tsc) return; var tl = tsc.lifts.filter(function (q) { return q.up !== lf.up; })[0]; if (!tl) return;
  P.st = 'lift'; P.at = 0; P.lift = { up: lf.up, to: { x: tl.x, y: tl.y } }; P.x = lf.x; sfx.play('door');
}
function carry(ox, oy) { // followers standing close ride the lift with you
  homs.forEach(function (h) { if ((h.st === 'follow' || h.st === 'wait') && Math.abs(h.x - ox) < 110 && Math.abs(h.y - oy) < 90) { h.x = P.x - P.face * (20 + Math.random() * 30); h.y = P.y; h.k = trail.length; h.join = true; } });
  trail.push({ x: P.x, y: P.y, d: trail[trail.length - 1].d + 1 });
}
function chant(dt) {
  P.st = 'chant'; P.vx = 0; P.chant += dt; if (Math.random() < 0.2) sfx.tone('sine', 220 + Math.sin(G.t * 8) * 30, 230, 0.15, 0.03);
  if (P.chant > 0.8) { var sc = scrAt(P.x, P.y - 4); sc && sc.portals.forEach(function (p) { if (Math.abs(p.x - P.x) < 70 && Math.abs(p.y - P.y) < 20 && p.open <= 0) { p.open = 5; sfx.play('magic'); KIT.flash(0.15); } }); }
}
function speak(w) {
  say(P, w, 1.2); sfx.play(w === 'WAIT!' ? 'back' : 'select');
  var n = 0;
  homs.forEach(function (h) {
    if (h.st === 'dead' || h.st === 'saved' || h.st === 'enter') return;
    var close = Math.abs(h.x - P.x) < 150 && Math.abs(h.y - P.y) < 24 && scrAt(h.x, h.y - 4) === scrAt(P.x, P.y - 4);
    if (w === 'FOLLOW ME!' && close && h.st !== 'follow') { h.st = 'follow'; h.join = true; h.k = trail.length - 1; h.order = G.t + n * 0.01; n++; say(h, 'Okay!', 1); }
    else if (w === 'WAIT!' && (h.st === 'follow') && (close || Math.abs(h.x - P.x) < 220)) { h.st = 'wait'; say(h, 'Waiting.', 1); }
  });
}
function die(why) {
  if (P.st === 'dead') return; P.st = 'dead'; P.deadT = 1.5; P.why = why; sfx.play(why === 'blown up' ? 'boom' : 'hurt'); KIT.shake(8);
  for (var i = 0; i < 14; i++) parts.push({ x: P.x, y: P.y - 25, vx: rnd(-120, 120), vy: rnd(-200, -40), t: 0.9, c: i % 2 ? '#f1e0b0' : '#c4121c' });
  say(P, pick(['Ow.', 'Not again.', 'Bollocks.', 'Ugh.']), 1.2);
}

/* ---------- homunculi ---------- */
function updHoms(dt) {
  var foll = homs.filter(function (h) { return h.st === 'follow'; }).sort(function (a, b) { return a.order - b.order; }), lastD = trail[trail.length - 1].d;
  homs.forEach(function (h) {
    h.t += dt; if (h.st === 'dead' || h.st === 'saved') return;
    var ox = h.x, oy = h.y;
    if (h.st === 'follow') {
      var order = foll.indexOf(h), target = lastD - 28 * (order + 1);
      if (h.join) { var tp = trail[Math.min(h.k, trail.length - 1)], dx = tp.x - h.x; if (Math.abs(dx) < 3 || Math.abs(tp.y - h.y) > 30) { h.join = false; h.x = Math.abs(tp.y - h.y) > 30 ? h.x : tp.x; } else { h.x += Math.sign(dx) * Math.min(Math.abs(dx), 150 * dt); } }
      else { var rem = 175 * dt; while (rem > 0 && h.k < trail.length - 1 && trail[h.k + 1].d <= target) { var q = trail[h.k + 1], ddx = q.x - h.x, ddy = q.y - h.y, dd = Math.hypot(ddx, ddy); if (dd <= rem) { h.x = q.x; h.y = q.y; h.k++; rem -= dd; } else { h.x += ddx / dd * rem; h.y += ddy / dd * rem; rem = 0; } } }
    } else if (h.st === 'enter') { var dx2 = h.portal.x - h.x; h.x += Math.sign(dx2) * Math.min(Math.abs(dx2), 160 * dt); h.y += (h.portal.y - h.y) * Math.min(1, dt * 6); if (Math.abs(dx2) < 3) { h.st = 'saved'; G.saved++; sfx.play('coin'); for (var i = 0; i < 10; i++) parts.push({ x: h.x, y: h.y - 20, vx: rnd(-60, 60), vy: rnd(-160, -60), t: 0.8, c: '#fffbe8' }); say(P, pick(['Go!', 'Home you go.', 'Off you pop.']), 1); } }
    h.moving = Math.hypot(h.x - ox, h.y - oy) > 0.3; h.vy = h.y - oy; if (Math.abs(h.x - ox) > 0.2) h.face = h.x > ox ? 1 : -1;
    // portals pull in anyone you are leading
    var sc = scrAt(h.x, h.y - 4); if (!sc) return;
    if (h.st === 'follow' || h.st === 'wait') sc.portals.forEach(function (p) { if (p.open > 0 && Math.abs(p.x - h.x) < 220 && Math.abs(p.y - h.y) < 30) { h.st = 'enter'; h.portal = p; } });
    if (hazard(h, sc)) { h.st = 'dead'; G.lost++; sfx.play('splat'); for (var j = 0; j < 8; j++) parts.push({ x: h.x, y: h.y - 15, vx: rnd(-80, 80), vy: rnd(-150, -30), t: 0.7, c: '#c4121c' }); say(P, pick(['No!', 'Sorry, little one.', 'Oh no.']), 1.4); }
  });
}
function hazard(e, sc) { // electric barriers (and the self-switching ones)
  for (var y = 0; y < 17; y++) for (var x = 0; x < 30; x++) { var c = sc.grid[y][x]; if ((c === 'E' && !sc.leverOn) || (c === 'e' && cyc(sc))) { var bx = sc.sx * SW + x * TT + 8, by = sc.sy * SH + y * TT; if (Math.abs(e.x - bx) < 8 && e.y - 40 < by + TT && e.y > by) return true; } }
  return false;
}
function cyc(sc) { return (G.t % 4) < 2.2; }

/* ---------- guards, blumlings, mines, portals in the current screen ---------- */
function canSee(g, t) {
  if (Math.abs(t.y - g.y) > 12) return false; var dx = t.x - g.x; if (dx * g.face <= 0 || Math.abs(dx) > 230) return false;
  for (var x = g.x; Math.abs(x - g.x) < Math.abs(dx); x += 8 * g.face) if (solidAt(x, g.y - 30)) return false;
  return visible(t);
}
function updScreen(sc, dt) {
  sc.guards.forEach(function (g) {
    if (g.st === 'dead') return; g.t += dt;
    if (g.st === 'sleep') { if (P.st === 'run' && !(G.grace > 0) && Math.abs(P.x - g.x) < 170 && Math.abs(P.y - g.y) < 14) { g.st = 'wake'; g.t = 0; g.face = P.x > g.x ? 1 : -1; say(g, 'Huh?!', 1); sfx.play('roar'); } return; }
    if (g.st === 'wake') { if (g.t > 0.9) { g.st = 'patrol'; } return; }
    if (g.st === 'patrol') { g.x += g.face * 36 * dt; if (g.x <= g.min || g.x >= g.max) { g.x = clamp(g.x, g.min, g.max); g.st = 'pause'; g.t = 0; } }
    else if (g.st === 'pause') { if (g.t > 1.3) { g.face = -g.face; g.st = 'patrol'; } }
    else if (g.st === 'alert') { if (g.t > 0.55) { if (P.st !== 'dead' && canSee(g, P)) { g.st = 'shoot'; g.t = 0; g.shotX = P.x; sfx.play('boom'); die('shot by a Lair Guard'); } else { g.st = 'search'; g.t = 0; say(g, '?', 1); } } return; }
    else if (g.st === 'search') { if (g.t > 1.4) g.st = 'patrol'; return; }
    else if (g.st === 'shoot') { if (g.t > 1.5) g.st = 'patrol'; return; }
    if (P.st !== 'dead' && !(G.grace > 0) && canSee(g, P) && P.st !== 'lift') { g.st = 'alert'; g.t = 0; say(g, '!', 0.8); sfx.play('no'); }
  });
  sc.blums.forEach(function (b) {
    if (b.st === 'dead') return; b.t += dt;
    var same = Math.abs(P.y - b.y) < 14 && P.st !== 'dead';
    if (b.st === 'idle') { if (same && !(G.grace > 0) && Math.abs(P.x - b.x) < 180) { b.st = 'chase'; b.lost = 0; sfx.play('roar'); say(b, 'GRRK!', 0.8); } return; }
    if (!same) { b.lost += dt; if (b.lost > 1.6) { b.st = 'idle'; } return; } b.lost = 0;
    var dir = Math.sign(P.x - b.x) || 1, nx = b.x + dir * 150 * dt; b.face = dir;
    if (groundAt(nx + dir * 6, b.y) && !solidAt(nx + dir * 8, b.y - 8)) b.x = nx;
    if (Math.abs(P.x - b.x) < 14 && same) die('eaten by a blumling');
    homs.forEach(function (h) { if (h.st !== 'dead' && h.st !== 'saved' && Math.abs(h.x - b.x) < 12 && Math.abs(h.y - b.y) < 14) { h.st = 'dead'; G.lost++; sfx.play('splat'); } });
  });
  sc.mines.forEach(function (m) {
    if (!m.alive) return;
    var hit = (P.ground && P.st !== 'dead' && Math.abs(P.x - m.x) < 8 && Math.abs(P.y - m.y) < 4);
    homs.forEach(function (h) { if ((h.st === 'follow' || h.st === 'enter') && Math.abs(h.x - m.x) < 6 && Math.abs(h.y - m.y) < 3 && Math.abs(h.vy || 0) < 0.2) hit = true; });
    sc.guards.forEach(function (g) { if (g.st === 'patrol' && Math.abs(g.x - m.x) < 6) hit = true; }); sc.blums.forEach(function (b) { if (b.st === 'chase' && Math.abs(b.x - m.x) < 6 && Math.abs(b.y - m.y) < 4) hit = true; });
    if (hit) explode(m, sc);
  });
  sc.portals.forEach(function (p) { if (p.open > 0) p.open -= dt; });
  if (P.st !== 'dead' && hazard(P, sc)) die('fried on a barrier');
}
function explode(m, sc) {
  m.alive = false; sfx.play('boom'); KIT.shake(10); KIT.flash(0.1);
  for (var i = 0; i < 20; i++) parts.push({ x: m.x, y: m.y - 6, vx: rnd(-160, 160), vy: rnd(-260, -60), t: 0.9, c: i % 3 ? '#ffb040' : '#ff2630' });
  if (P.st !== 'dead' && Math.abs(P.x - m.x) < 30 && Math.abs(P.y - m.y) < 30) die('blown up');
  homs.forEach(function (h) { if (h.st !== 'dead' && h.st !== 'saved' && Math.abs(h.x - m.x) < 30 && Math.abs(h.y - m.y) < 30) { h.st = 'dead'; G.lost++; } });
  sc.guards.forEach(function (g) { if (Math.abs(g.x - m.x) < 30 && Math.abs(g.y - m.y) < 20) g.st = 'dead'; else if (g.st === 'sleep' && Math.abs(g.x - m.x) < 240) { g.st = 'wake'; g.t = 0; g.face = m.x > g.x ? 1 : -1; say(g, 'WHAT WAS THAT?', 1.2); } });
  sc.blums.forEach(function (b) { if (Math.abs(b.x - m.x) < 30 && Math.abs(b.y - m.y) < 20) b.st = 'dead'; });
}
function say(e, t, d) { bubbles = bubbles.filter(function (b) { return b.e !== e; }); bubbles.push({ e: e, t: t, life: d || 1.2 }); }

/* ---------- the loop ---------- */
function update(dt) {
  G.t += dt;
  if (G.mode === 'story' && STORY) { updStory(dt); return; }
  if (G.mode === 'throne' && SCENE) { updThrone(dt); return; }
  if (G.mode === 'street' && SCENE) { updStreet(dt); return; }
  if (G.mode !== 'play') return;
  if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  updP(dt); updHoms(dt);
  var key = Math.floor(P.x / SW) + ',' + Math.floor((P.y - 1) / SH);
  if (SC[key] && key !== G.scr && P.st !== 'dead') {
    G.scr = key; var sc = SC[key]; banner = { t: 2.2, a: sc.s.name.toUpperCase(), b: ZONES[sc.s.zone].name.toUpperCase() }; music.play(['swcells', 'swworks', 'swthrone'][sc.s.zone]);
    if (!G.seen[key]) { G.seen[key] = 1; G.clock = Math.max(15, G.clock - 14); }
    resetFoes(sc); snapshot();
  }
  if (G.grace > 0) G.grace -= dt;
  if (SC[G.scr]) updScreen(SC[G.scr], dt);
  bubbles.forEach(function (b) { b.life -= dt; }); bubbles = bubbles.filter(function (b) { return b.life > 0; });
  parts.forEach(function (p) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; }); parts = parts.filter(function (p) { return p.t > 0; });
}
/* ---------- the story ---------- */
var INTRO = [
  { art: 'trap', t: 'Blumhead finally caught him. Cumhead was dragged down into the dungeon under the lair and a bear trap was clamped round his leg, so he would stay put.' },
  { art: 'blum', t: '"At dawn you die, little drop. Once and for all. I want to watch."' },
  { art: 'grinder', t: 'He was not the only prisoner. Blumhead had rounded up the homunculi, every one he could find, to grind them down into mince and bake them into homuncupies.' },
  { art: 'clock', t: 'A few hours until dawn. The chain has snapped. The trap has not. Cumhead can limp out on his own... or take them with him.' }
];
var GOOD = 0.75; // the share of homunculi you must save to reach the throne room
function needed() { return Math.ceil(total * GOOD); }
function updStory(dt) {
  STORY.t += dt; var pg = STORY.pages[STORY.i], full = STORY.t * 45 >= pg.t.length;
  if (KIT.pressed('a') || KIT.ptr.tap || KIT.pressed('start')) { if (!full) STORY.t = 99; else { STORY.i++; STORY.t = 0; sfx.play('select'); if (STORY.i >= STORY.pages.length) { var d = STORY.done; STORY = null; d(); } } }
  else if (KIT.pressed('b')) { var d2 = STORY.done; STORY = null; d2(); }
}
function drawStory() {
  var pg = STORY.pages[STORY.i], cx = SW / 2;
  R('#050203', 0, 0, SW, SH); KIT.blit(vignette(), 0, 0);
  var gy = 250;
  if (pg.art === 'trap') { R('#1a1210', 0, gy, SW, 4); for (var i = 0; i < 9; i++) R('#2a1e1a', i * 56, 100, 40, gy - 100); R('rgba(0,0,0,0.5)', 0, 100, SW, gy - 100);
    for (var c = 0; c < 10; c++) R(c % 2 ? '#3a3236' : '#5a545c', cx + 14 + c * 6, gy - 4 - Math.sin(c / 3) * 2, 5, 3); spr('sw_lidle' + (Math.floor(G.t * 5) % 7), cx, gy + 1, { sc: 1.6 });
    if (Math.floor(G.t * 1.5) % 4 === 0) R('#a00a14', cx - 18, gy - 2 + (G.t * 30) % 6, 2, 2); }
  else if (pg.art === 'blum') { R('rgba(160,10,20,' + (0.18 + Math.sin(G.t * 3) * 0.06) + ')', 0, 0, SW, SH); spr('f_blum_' + (Math.floor(G.t * 4) % 2), cx, gy + 6 + Math.sin(G.t * 2) * 4, { sc: 2.2 }); }
  else if (pg.art === 'grinder') { drawGrinder(cx + 60, gy, 1.3); for (var h = 0; h < 4; h++) spr('h_' + BREEDS[h * 2] + '_teen_idle' + (Math.floor(G.t * 3 + h) % 2), cx - 150 + h * 26, gy, { flip: true });
    for (var b = 0; b < 7; b++) R('#3a343c', cx - 170 + b * 18, gy - 70, 3, 70); R('#3a343c', cx - 170, gy - 72, 112, 4); }
  else if (pg.art === 'clock') { var a = G.t * 0.4; KIT.ctx.save(); KIT.ctx.strokeStyle = '#a6968f'; KIT.ctx.lineWidth = 3; KIT.ctx.beginPath(); KIT.ctx.arc(cx, 170, 52, 0, 6.28); KIT.ctx.stroke();
    KIT.ctx.lineWidth = 2; KIT.ctx.beginPath(); KIT.ctx.moveTo(cx, 170); KIT.ctx.lineTo(cx + Math.cos(a) * 40, 170 + Math.sin(a) * 40); KIT.ctx.moveTo(cx, 170); KIT.ctx.lineTo(cx + Math.cos(a / 12 - 1.6) * 26, 170 + Math.sin(a / 12 - 1.6) * 26); KIT.ctx.stroke(); KIT.ctx.restore();
    for (var m = 0; m < 12; m++) R('#c4121c', cx + Math.cos(m / 12 * 6.28) * 46 - 1, 170 + Math.sin(m / 12 * 6.28) * 46 - 1, 3, 3); }
  var shown = pg.t.slice(0, Math.floor(STORY.t * 45)), lines = KIT.wrap(shown, SW - 60, 8, 'body');
  KIT.panel(16, 18, SW - 32, 66); lines.slice(0, 5).forEach(function (l, k) { text(l, 30, 26 + k * 11, { size: 8, font: 'body', col: '#f1e7d0' }); });
  if (STORY.t * 45 >= pg.t.length && Math.floor(G.t * 2) % 2) text('A', SW - 30, 72, { size: 8, col: '#ffe36a' });
  text((STORY.i + 1) + '/' + STORY.pages.length + '   B SKIPS', SW - 22, 90, { size: 6, align: 'right', col: '#5a4a4a' });
}

/* ---------- the endings ---------- */
function ending() {
  G.mode = 'end'; try { localStorage.removeItem('sw-run'); } catch (e) {}
  if (G.saved > SV.best) SV.best = G.saved; persist();
  if (G.saved >= needed()) startThrone(); else startStreet();
}
function finish(good) {
  SV.done++; if (good) SV.good = (SV.good || 0) + 1; persist(); G.mode = 'end'; music.play(good ? 'swend' : 'swsad');
  var title = good ? 'The Throne Room' : 'Nobody Left', txt = good
    ? 'Blumhead is splattered all over his own throne room. The grinders stop. Cumhead limps up into the morning with the homunculi he saved, and every one still out there gets to live.'
    : 'Cumhead got out alive. That is all. Blumhead was never stopped, and the grinders took every homunculus left in the world: the ones he left behind, the ones he saved, and all the rest.';
  KIT.menu({ title: title, sub: 'Saved ' + G.saved + ' of ' + total + '  ·  Lost ' + G.lost + '  ·  Deaths ' + G.deaths, html: '<p style="text-align:center">' + txt + '</p>' + (good ? '' : '<p style="text-align:center;color:#a6968f">Save at least ' + needed() + ' of them to reach Blumhead\'s throne.</p>'),
    items: [{ label: 'ESCAPE AGAIN', fn: function () { KIT.closeMenu(); newGame(); }, cls: 'hot', def: true }, { label: 'TITLE', fn: titleMenu, back: true }] });
}
/* the true ending: rig Blumhead's throne, hide behind a pillar, watch */
function startThrone() {
  G.mode = 'throne'; music.play('swthrone'); P.x = 40; P.y = 240; P.st = 'stand'; P.face = 1; P.t = 0; P.vx = 0; parts = []; bubbles = [];
  SCENE = { ph: 'sneak', t: 0, bx: -40, by: 214, sat: 0, rig: 0 }; banner = { t: 3, a: "BLUMHEAD'S THRONE ROOM", b: 'DAWN IS COMING' };
  say(P, 'His throne. Time to give him a send-off.', 3);
}
var THRONE_X = 392, PILLAR_X = 178;
function updThrone(dt) {
  var S2 = SCENE; S2.t += dt; if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  bubbles.forEach(function (b) { b.life -= dt; }); bubbles = bubbles.filter(function (b) { return b.life > 0; });
  parts.forEach(function (p) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; }); parts = parts.filter(function (p) { return p.t > 0; });
  P.t += dt;
  if (S2.ph === 'sneak' || S2.ph === 'hide') {
    if (S2.rigging) { S2.rig += dt; P.st = 'stand'; if (Math.random() < 0.3) parts.push({ x: THRONE_X + rnd(-8, 8), y: 222, vx: rnd(-60, 60), vy: rnd(-120, -40), t: 0.4, c: '#ffe36a' }); if (S2.rig > 1.6) { S2.rigging = 0; S2.ph = 'hide'; sfx.play('magic'); say(P, 'Two mines under the cushion. Now hide.', 2.5); } return; }
    var ix = KIT.stick(0).x; ix = ix > 0.3 ? 1 : ix < -0.3 ? -1 : 0; P.vx = ix * WALK; if (ix) P.face = ix; P.st = ix ? 'walk' : 'stand'; P.x = clamp(P.x + P.vx * dt, 20, SW - 30);
    if (KIT.pressed('up') || KIT.pressed('down') || KIT.pressed('a')) {
      if (S2.ph === 'sneak' && Math.abs(P.x - THRONE_X) < 30) { S2.rigging = 1; sfx.play('tick'); }
      else if (S2.ph === 'hide' && Math.abs(P.x - PILLAR_X) < 26) { S2.ph = 'cut'; S2.t = 0; P.hid = 1; P.x = PILLAR_X + 6; P.face = 1; sfx.play('back'); }
    }
    return;
  }
  // the cutscene
  var t = S2.t;
  if (t > 1 && t < 1.1 && !S2.door) { S2.door = 1; sfx.play('door'); KIT.shake(3); }
  if (t > 1.4 && t < 6) { S2.bx = Math.min(THRONE_X, S2.bx + 90 * dt); if (!S2.l1 && t > 2) { S2.l1 = 1; say(S2.blum, 'DAWN AT LAST. FETCH ME THE DROP.', 2.6); } if (!S2.l2 && t > 4.4) { S2.l2 = 1; say(S2.blum, 'AND A HOMUNCUPIE. WARM.', 2); } }
  if (t > 6 && !S2.sat) { S2.sat = 1; sfx.play('land'); }
  if (S2.sat && S2.by < 222) S2.by = Math.min(222, S2.by + 40 * dt);
  if (t > 7.4 && t < 9.2 && Math.floor(t * 6) !== S2.beep) { S2.beep = Math.floor(t * 6); sfx.tone('square', 1400, 1400, 0.05, 0.05); }
  if (!S2.l3 && t > 7.6) { S2.l3 = 1; say(S2.blum, '...WHAT IS THAT BEEPING?', 1.6); }
  if (t > 9.3 && !S2.boom) { S2.boom = 1; sfx.play('boom'); sfx.play('roar'); KIT.shake(16); KIT.flash(0.4);
    for (var i = 0; i < 90; i++) parts.push({ x: THRONE_X + rnd(-20, 20), y: 200 + rnd(-30, 20), vx: rnd(-300, 300), vy: rnd(-420, -60), t: rnd(0.8, 2.2), c: ['#c4121c', '#7a0a12', '#9a4aff', '#ffb040', '#ffe36a', '#f1e7d0'][i % 6], big: i % 4 === 0 }); }
  if (t > 9.6 && t < 11) KIT.shake(4);
  if (t > 12 && !S2.out) { S2.out = 1; P.hid = 0; P.x = PILLAR_X + 30; say(P, 'Have a nice sit down.', 2.4); }
  if (t > 13 && !S2.homs) { S2.homs = []; homs.filter(function (h) { return h.st === 'saved'; }).slice(0, 8).forEach(function (h, k) { S2.homs.push({ breed: h.breed, x: -20 - k * 22, t: k }); }); }
  if (S2.homs) S2.homs.forEach(function (h) { h.x = Math.min(PILLAR_X - 30 - S2.homs.indexOf(h) * 20, h.x + 80 * dt); h.t += dt; });
  if (t > 13.5 && !S2.cheer) { S2.cheer = 1; sfx.play('coin'); }
  if (t > 17 || (t > 10 && KIT.pressed('b'))) { SCENE = null; finish(true); }
}
function drawThrone() {
  var S2 = SCENE, gy = 240; drawRoom('throne');
  // the throne on its dais
  R('#12040a', THRONE_X - 40, gy - 14, 80, 14); R('#3a0a14', THRONE_X - 38, gy - 12, 76, 10);
  if (!S2.boom) { R('#12040a', THRONE_X - 26, gy - 92, 52, 80); R('#5a0a18', THRONE_X - 23, gy - 89, 46, 74); R('#c4121c', THRONE_X - 19, gy - 46, 38, 10); R('#ffc840', THRONE_X - 26, gy - 96, 52, 5);
    for (var k = 0; k < 5; k++) R('#ffc840', THRONE_X - 24 + k * 11, gy - 104, 4, 9); if (S2.ph !== 'sneak') { R('#5a545c', THRONE_X - 12, gy - 38, 8, 4); R('#5a545c', THRONE_X + 4, gy - 38, 8, 4); if (Math.floor(G.t * 3) % 2) R('#ff2630', THRONE_X - 9, gy - 40, 2, 2); } }
  else { for (var d = 0; d < 6; d++) R('#2a0a10', THRONE_X - 34 + d * 12, gy - 18 - (d % 3) * 5, 10, 6); R('rgba(160,10,20,0.6)', THRONE_X - 60, gy - 2, 120, 3); }
  // the door Blumhead comes through
  R('#12040a', 10, gy - 90, 46, 90); R(S2.door ? '#000' : '#3a2a2a', 14, gy - 86, 38, 86);
  // the pillar Cumhead hides behind
  var drawPil = function () { R('#12040a', PILLAR_X - 20, 30, 40, gy - 30); R('#3a2e30', PILLAR_X - 17, 30, 34, gy - 30); R('#4e4044', PILLAR_X - 17, 30, 6, gy - 30); R('#241a1c', PILLAR_X + 10, 30, 7, gy - 30); for (var y = 50; y < gy; y += 40) R('#12040a', PILLAR_X - 20, y, 40, 3); };
  if (S2.blum === undefined) S2.blum = { x: 0, y: 0 };
  if (S2.ph === 'cut' && !S2.boom && S2.door) { S2.blum.x = S2.bx; S2.blum.y = S2.by - 50; spr('f_blum_' + (Math.floor(G.t * 3) % 2), S2.bx, S2.by + (S2.sat ? 0 : Math.sin(G.t * 3) * 3), { sc: 1.25, flip: S2.bx > THRONE_X - 2 }); }
  if (P.hid) { drawLimper(P.x + 12, gy, 1, 'stand', G.t); drawPil(); } else { drawLimper(P.x, gy, P.face, P.st, P.t); drawPil(); }
  if (S2.homs) S2.homs.forEach(function (h) { spr('h_' + h.breed + '_teen_' + (h.x >= PILLAR_X - 40 - 140 ? 'jump' : 'run' + (Math.floor(h.t * 10) % 4)), h.x, gy - (S2.cheer ? Math.abs(Math.sin(h.t * 6)) * 8 : 0)); });
  parts.forEach(function (p) { R(p.c, p.x, p.y, p.big ? 4 : 2, p.big ? 4 : 2); });
  drawBubblesAt(function (e) { return { x: e.x, y: e.y }; });
  if (S2.ph === 'sneak') prompt(Math.abs(P.x - THRONE_X) < 30 ? 'UP: RIG THE THRONE' : 'SNEAK TO THE THRONE');
  else if (S2.ph === 'hide') prompt(Math.abs(P.x - PILLAR_X) < 26 ? 'UP: HIDE BEHIND THE PILLAR' : 'GET BEHIND THE PILLAR');
  if (banner) { var a = Math.min(1, banner.t * 2); text(banner.a, SW / 2, 64, { align: 'center', size: 24, font: 'title', col: '#ff2630', alpha: a }); text(banner.b, SW / 2, 90, { align: 'center', size: 6, alpha: a, col: '#a6968f' }); }
}
function prompt(t) { var w = KIT.tw(t, 6) + 20; KIT.panel(SW / 2 - w / 2, 30, w, 20); text(t, SW / 2, 37, { align: 'center', size: 6, col: '#ffe36a' }); }
/* the bad ending: Cumhead limps down a dead street, alone */
var SAD = ['Cumhead got out.', 'He never went back for them. He never stopped Blumhead.', 'The grinders ran day and night after that.', 'First the homunculi he left behind. Then the ones he had saved.', 'Then every homunculus left in the world.', 'There is nobody left to save.'];
function startStreet() { G.mode = 'street'; music.play('swsad'); SCENE = { t: 0, x: 0 }; parts = []; }
function updStreet(dt) { SCENE.t += dt; SCENE.x += 22 * dt; if (Math.random() < 0.9) for (var i = 0; i < 3; i++) parts.push({ x: rnd(0, SW + 60), y: -10, vx: -60, vy: 380, t: 0.9, c: 'rgba(160,170,190,0.45)' }); parts.forEach(function (p) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; }); parts = parts.filter(function (p) { return p.t > 0 && p.y < 250; });
  if (SCENE.t > SAD.length * 4.2 + 3 || (SCENE.t > 2 && KIT.pressed('b'))) { SCENE = null; finish(false); } }
function drawStreet() {
  var t = SCENE.t, off = SCENE.x * 1.6, gy = 236;
  R('#0a0a0e', 0, 0, SW, SH); R('#141418', 0, 0, SW, 120); R('#1c1a20', 0, 80, SW, 40);
  for (var i = -1; i < 8; i++) { var bx = i * 120 - (off * 0.4) % 120, h = 80 + ((i + Math.floor(off * 0.4 / 120)) * 37 % 3 + 3) % 3 * 26; R('#111014', bx, gy - 40 - h, 100, h + 40); for (var w = 0; w < 3; w++) for (var r2 = 0; r2 < 3; r2++) { var lit = ((i + w + r2 + Math.floor(off * 0.4 / 120)) % 7 === 0); R(lit ? '#3a2a14' : '#060608', bx + 12 + w * 28, gy - 30 - h + r2 * 30, 14, 18); if (!lit && (w + r2) % 2) { R('#2a1e14', bx + 10 + w * 28, gy - 22 - h + r2 * 30, 18, 3); } } }
  // the near side: boarded shops, a broken lamp, the pie shop
  for (var j = -1; j < 4; j++) { var nx = j * 220 - off % 220, k = j + Math.floor(off / 220);
    R('#18141a', nx, gy - 120, 180, 120); R('#0c0a0e', nx + 20, gy - 80, 60, 80); for (var b = 0; b < 4; b++) R('#3a2a1e', nx + 16, gy - 74 + b * 18, 68, 6);
    if (k % 3 === 1) { R('#2a0a10', nx + 96, gy - 110, 76, 18); text('HOMUNCUPIES', nx + 134, gy - 106, { align: 'center', size: 6, col: Math.floor(G.t * 4) % 5 ? '#c4121c' : '#3a0a10' }); R('#2a2018', nx + 100, gy - 80, 66, 40); for (var q = 0; q < 4; q++) { R('#c8862a', nx + 106 + q * 15, gy - 52, 12, 6); R('#e8b04a', nx + 107 + q * 15, gy - 53, 10, 2); } }
    else if (k % 3 === 2) { R('#2a262c', nx + 120, gy - 40, 30, 40); for (var c = 0; c < 5; c++) R('#5a545c', nx + 121 + c * 7, gy - 40, 2, 40); R('#5a545c', nx + 120, gy - 41, 30, 2); R('#3a343c', nx + 128, gy - 20, 14, 2); }
    R('#2a262c', nx + 196, gy - 110, 4, 110); R('#2a262c', nx + 186, gy - 112, 22, 4); if ((Math.floor(G.t * 7) + k) % 9 < 2) { R('#ffe36a', nx + 192, gy - 108, 10, 4); R('rgba(255,227,106,0.08)', nx + 150, gy - 104, 90, 104); } }
  R('#141216', 0, gy, SW, SH - gy); R('#1e1a20', 0, gy, SW, 3); for (var l = 0; l < 12; l++) R('#0c0a0e', l * 48 - (off % 48), gy + 14, 24, 3);
  parts.forEach(function (p) { R(p.c, p.x, p.y, 1, 6); });
  drawLimper(150 + Math.min(80, t * 4), gy, 1, 'walk', t * 0.75, 1, true);
  var li = Math.floor(t / 4.2); if (li < SAD.length) { var a = Math.min(1, (t - li * 4.2) * 2, (li * 4.2 + 4.2 - t) * 2); text(SAD[li], SW / 2, 40, { align: 'center', size: 14, font: 'body', col: '#d8ccc0', alpha: Math.max(0, a) }); }
  R('rgba(0,0,0,' + Math.max(0, 1 - t / 2) + ')', 0, 0, SW, SH);
}
/* Cumhead with the trap on his leg and its broken chain dragging behind */
function drawLimper(x, y, face, st, t, alpha, sad) {
  var f = st === 'run' ? 'sw_hob' + (Math.floor(t * 10) % 6) : st === 'walk' ? 'sw_limp' + (Math.floor(t * 8) % 8) : 'sw_lidle' + (Math.floor(t * 6) % 7);
  var cx = x - face * 14; for (var c = 0; c < 6; c++) { var lx = cx - face * c * 5, ly = y - 3 + Math.min(c, 2) + (c % 2); R('#12040a', lx - 1, ly - 1, 5, 4); R(c % 2 ? '#5a545c' : '#8a828a', lx, ly, 3, 2); }
  spr(f, x, y + 2, { flip: face < 0, alpha: alpha });
  if (sad) { R('rgba(10,10,14,0.25)', x - 20, y - 66, 40, 66); }
}
function drawBubblesAt() {
  bubbles.forEach(function (b) { var e = b.e, w = KIT.tw(b.t, 6) + 10, x = clamp(e.x - w / 2, 2, SW - w - 2), y = e.y - (e === P ? 72 : 52); R('#12040a', x - 1, y - 1, w + 2, 14); R('#f1e7d0', x, y, w, 12); text(b.t, x + 5, y + 3, { size: 6, col: '#12040a', shadow: false }); });
}

/* ---------- drawing: a filthy, bloody steam factory under the lair ---------- */
function hash(a, b) { var h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return h - Math.floor(h); }
function vignette() { return KIT.layer('sw-vig', SW, SH, function () { var c = KIT.ctx, g = c.createRadialGradient(SW / 2, SH / 2, 80, SW / 2, SH / 2, 300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)'); c.fillStyle = g; c.fillRect(0, 0, SW, SH); }); }
function gear(x, y, r, a, col) { var c = KIT.ctx, n = Math.max(6, Math.round(r / 2.2)); c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#0a0606'; for (var i = 0; i < n; i++) { c.rotate(6.2832 / n); c.fillRect(-r * 0.16 - 1, -r - 3, r * 0.32 + 2, 6); }
  c.beginPath(); c.arc(0, 0, r + 1, 0, 6.28); c.fill(); c.fillStyle = col; for (i = 0; i < n; i++) { c.rotate(6.2832 / n); c.fillRect(-r * 0.16, -r - 2, r * 0.32, 4); } c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill();
  c.fillStyle = '#0a0606'; c.beginPath(); c.arc(0, 0, r * 0.62, 0, 6.28); c.fill(); c.fillStyle = col; for (i = 0; i < 4; i++) { c.rotate(1.5708); c.fillRect(-1.5, 0, 3, r * 0.62); } c.beginPath(); c.arc(0, 0, r * 0.2, 0, 6.28); c.fill(); c.restore(); }
function drawGrinder(x, y, k) { // a mincer: hopper on top, a crank, a chute dripping red
  var c = KIT.ctx; c.save(); c.translate(x, y); c.scale(k, k);
  R('#0a0606', -34, -70, 68, 70); R('#3a2e2a', -32, -68, 64, 66); R('#4e3e36', -32, -68, 64, 4); for (var i = 0; i < 4; i++) { R('#1a1210', -28 + i * 18, -60, 3, 3); R('#1a1210', -28 + i * 18, -10, 3, 3); }
  c.fillStyle = '#0a0606'; c.beginPath(); c.moveTo(-40, -110); c.lineTo(40, -110); c.lineTo(16, -70); c.lineTo(-16, -70); c.fill(); c.fillStyle = '#5a4a40'; c.beginPath(); c.moveTo(-36, -108); c.lineTo(36, -108); c.lineTo(14, -72); c.lineTo(-14, -72); c.fill();
  R('#7a0a12', -30, -108, 60, 5); R('#0a0606', 34, -40, 26, 12); R('#5a4a40', 34, -38, 24, 8); R('#7a0a12', 52, -30, 6, 30 + Math.sin(G.t * 4) * 2);
  var a = G.t * 2.4; R('#0a0606', -46, -50, 12, 12); c.save(); c.translate(-40, -44); c.rotate(a); R('#8a7a70', -2, -22, 4, 22); R('#c4121c', -4, -26, 8, 6); c.restore();
  R('rgba(255,38,48,' + (0.4 + Math.sin(G.t * 5) * 0.2) + ')', -6, -56, 12, 6); c.restore();
}
var ZSTYLE = [
  { name: 'cells', wall: '#120c0c', panel: ['#1e1614', '#241a17', '#1a1311'], seam: '#080505', rivet: '#3a2e28', rust: '#3a1a0c', pipe: ['#3a3236', '#524a4e', '#1e1a1c'], blood: 0.25, light: '#ffb040', block: ['#2e2622', '#3e342e', '#16100e'], ledge: '#4a423e' },
  { name: 'works', wall: '#0e0b08', panel: ['#1e1810', '#261e14', '#18130c'], seam: '#060403', rivet: '#5a4628', rust: '#4a2a0c', pipe: ['#6a4a24', '#9a6e34', '#2e1e0c'], blood: 0.45, light: '#ff7a20', block: ['#33281a', '#4a3a24', '#18120a'], ledge: '#5a4a32' },
  { name: 'deep', wall: '#100406', panel: ['#200a0c', '#2a0e10', '#180608'], seam: '#060102', rivet: '#4a1a1c', rust: '#5a0a10', pipe: ['#4a1418', '#6a1e22', '#22080a'], blood: 0.9, light: '#ff2630', block: ['#3a1416', '#4e1c1e', '#1c0a0a'], ledge: '#5a2a2c' },
  { name: 'throne', wall: '#0c0306', panel: ['#1e0810', '#260a14', '#16050a'], seam: '#050102', rivet: '#6a5020', rust: '#4a0a10', pipe: ['#5a4018', '#8a6a2a', '#2a1a08'], blood: 0.6, light: '#ffc840', block: ['#2a0e14', '#3a141c', '#14060a'], ledge: '#4a2a2c' }
];
function drawRoom(key, sc) { // the static part of a screen, drawn once and kept
  var zs = sc ? ZSTYLE[sc.s.zone] : ZSTYLE[3], seed = sc ? sc.sx * 7 + sc.sy * 13 : 99;
  KIT.blit(KIT.layer('sw-' + key, SW, SH, function () { paintWall(zs, seed); if (sc) paintTiles(sc, zs); else { R('#0a0406', 0, 240, SW, 32); for (var x = 0; x < SW; x += 32) { R('#2a0e14', x, 240, 30, 6); R('#14060a', x, 246, 30, 26); } R('#5a0a18', 120, 236, 240, 4); } }), 0, 0);
  drawLive(zs, seed, sc);
}
function paintWall(zs, seed) {
  R(zs.wall, 0, 0, SW, SH);
  for (var y = 0; y < SH; y += 34) for (var x = -((y / 34) % 2) * 24; x < SW; x += 48) { // riveted iron panels
    var h = hash(x + seed, y), c = zs.panel[Math.floor(h * 3)]; R(zs.seam, x, y, 48, 34); R(c, x + 1, y + 1, 46, 32); R('rgba(255,255,255,0.03)', x + 1, y + 1, 46, 2);
    [[4, 4], [42, 4], [4, 28], [42, 28]].forEach(function (r) { R(zs.rivet, x + r[0], y + r[1], 2, 2); if (hash(x + r[0], y + seed) < 0.4) R(zs.rust, x + r[0], y + r[1] + 2, 1, 4 + Math.floor(h * 8)); });
    if (h < 0.18) { R(zs.rust, x + 10 + h * 80, y + 8, 8, 5); R('rgba(0,0,0,0.25)', x + 12 + h * 80, y + 10, 4, 14); }
    if (hash(y, x + seed) < zs.blood * 0.35) { var bx = x + 6 + hash(x, y) * 34, bl = 6 + hash(y, x) * 24; R('#5a0a10', bx, y + 2, 3, bl); R('#7a0a12', bx, y + 2, 2, bl - 3); R('#5a0a10', bx - 1, y + 1, 5, 3); }
  }
  // big pipes with flanges, a valve wheel, a pressure gauge
  for (var i = 0; i < 3; i++) { var px = 30 + Math.floor(hash(seed, i) * 26) * 16; R('#060404', px - 1, 0, 14, SH); R(zs.pipe[0], px, 0, 12, SH); R(zs.pipe[1], px + 2, 0, 3, SH); R(zs.pipe[2], px + 9, 0, 3, SH); for (var j = 20 + i * 13; j < SH; j += 56) { R('#060404', px - 3, j, 18, 6); R(zs.pipe[1], px - 2, j + 1, 16, 4); } }
  var hy = 40 + Math.floor(hash(seed, 9) * 4) * 12; R('#060404', 0, hy - 1, SW, 12); R(zs.pipe[0], 0, hy, SW, 10); R(zs.pipe[1], 0, hy + 1, SW, 3); R(zs.pipe[2], 0, hy + 7, SW, 3); for (var f = 18; f < SW; f += 64) { R('#060404', f, hy - 3, 6, 16); R(zs.pipe[1], f + 1, hy - 2, 4, 14); }
  var vx = 60 + hash(seed, 4) * 360; KIT.ctx.strokeStyle = '#8a1218'; KIT.ctx.lineWidth = 3; KIT.ctx.beginPath(); KIT.ctx.arc(vx, hy + 5, 9, 0, 6.28); KIT.ctx.stroke(); R('#8a1218', vx - 9, hy + 4, 18, 2); R('#8a1218', vx - 1, hy - 4, 2, 18);
  var gx = 100 + hash(seed, 5) * 280, gy2 = hy + 30; R('#060404', gx - 9, gy2 - 9, 18, 18); R('#c8c0b0', gx - 7, gy2 - 7, 14, 14); R('#12040a', gx, gy2 - 5, 1, 5); R('#c4121c', gx, gy2, 5, 1);
  // hanging chains and meat hooks
  for (var k = 0; k < 5; k++) { var cx = Math.floor(hash(k, seed) * 30) * 16 + 8, len = 30 + hash(seed, k) * 70; for (var cy = 0; cy < len; cy += 5) R(cy % 10 ? '#2a2426' : '#3e3638', cx, cy, 3, 4);
    R('#5a545c', cx - 2, len, 2, 6); R('#5a545c', cx - 2, len + 5, 6, 2); R('#5a545c', cx + 3, len + 2, 2, 4); if (zs.blood > 0.5 && k % 2) { R('#4a0a10', cx - 5, len + 6, 12, 18); R('#7a1418', cx - 4, len + 7, 10, 6); R('#d8a890', cx - 2, len + 14, 4, 3); } }
}
function paintTiles(sc, zs) {
  for (var y = 0; y < 17; y++) for (var x = 0; x < 30; x++) {
    var c = sc.grid[y][x], px = x * TT, py = y * TT, up = y > 0 ? sc.grid[y - 1][x] : '#';
    if (c === '#') {
      var air = up !== '#' && up !== 'F'; R(zs.block[2], px, py, TT, TT); R(zs.block[0], px + 1, py + 1, TT - 2, TT - 2); R(zs.block[1], px + 1, py + 1, TT - 2, 2); R(zs.block[1], px + 1, py + 1, 2, TT - 2);
      R('#0a0606', px + 3, py + 4, 1, 1); R('#0a0606', px + 12, py + 4, 1, 1); R('#0a0606', px + 3, py + 12, 1, 1); R('#0a0606', px + 12, py + 12, 1, 1);
      if (hash(x + sc.sx * 30, y) < 0.22) R(zs.rust, px + 5, py + 6, 5, 3);
      if (air) { R('#0a0606', px, py, TT, 3); R(zs.ledge, px, py, TT, 2); if (hash(x, y + sc.sy) < zs.blood * 0.5) { R('#7a0a12', px + 2 + hash(y, x) * 8, py, 6, 2); R('#5a0a10', px + 4 + hash(y, x) * 8, py + 2, 2, 3 + hash(x, x) * 5); } }
    } else if (c === '=' || c === 'h') {
      R('#0a0606', px, py, TT, 7); R(zs.ledge, px, py + 1, TT, 5); R('rgba(255,255,255,0.15)', px, py + 1, TT, 1); for (var g = 2; g < TT; g += 4) R('#0a0606', px + g, py + 3, 2, 2);
      if (c === 'h') { for (var s2 = 0; s2 < 4; s2++) R(s2 % 2 ? '#12040a' : '#ffc840', px + s2 * 4, py + 1, 4, 2); R('#ffc840', px + 6, py + 6, 4, 3); }
    } else if (c === 'b') { R('#12040a', px + 6, py, 4, TT); R('#5a545c', px + 7, py, 2, TT); }
  }
}
function drawLive(zs, seed, sc) { // the moving parts: gears, steam, drips, flickering lamps, the pie belt
  var a = G.t * 0.8; gear(380 + hash(seed, 1) * 60, 70 + hash(seed, 2) * 40, 22, a, zs.pipe[0]); gear(380 + hash(seed, 1) * 60 + 33, 70 + hash(seed, 2) * 40 + 18, 13, -a * 1.7 + 0.3, zs.pipe[1]);
  if (hash(seed, 3) < 0.6) gear(40 + hash(seed, 6) * 80, 150, 16, -a * 1.3, zs.pipe[2]);
  for (var d = 0; d < 5; d++) { var dx = Math.floor(hash(d, seed + 1) * 30) * 16 + 6, dy = (G.t * 70 + d * 61) % 200; R(zs.blood > 0.5 ? '#9a0a14' : '#5a4a3a', dx, 20 + dy, 2, 3); }
  for (var st = 0; st < 2; st++) { var sx = 40 + hash(seed, 7 + st) * 400, k = (G.t * 0.7 + st * 0.5) % 1; KIT.ctx.fillStyle = 'rgba(200,190,180,' + (0.12 * (1 - k)) + ')'; KIT.ctx.beginPath(); KIT.ctx.arc(sx + k * 10, 60 - k * 50, 6 + k * 20, 0, 6.28); KIT.ctx.fill(); }
  var fl = Math.sin(G.t * 9 + seed) > 0.85 || Math.sin(G.t * 23 + seed) > 0.95; R(fl ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0)', 0, 0, SW, SH);
  if (sc && sc.s.zone === 1) { var by = 196; R('#0a0606', 0, by, SW, 8); R('#2a2420', 0, by + 1, SW, 5); for (var r = 0; r < SW; r += 12) R('#12100e', r - (G.t * 20) % 12, by + 2, 6, 3); for (var p = 0; p < 8; p++) { var x = (p * 70 + G.t * 20) % (SW + 40) - 20; R('#7a4410', x, by - 5, 14, 5); R('#c8862a', x + 1, by - 6, 12, 3); R('#e8b04a', x + 2, by - 7, 10, 2); } }
}
function drawTiles(sc) { // only the tiles that change: gates, barriers and fake walls
  var zs = ZSTYLE[sc.s.zone], ox = sc.sx * SW, fakeNear = Math.abs(P.x - ox) < 40 || true;
  for (var y = 0; y < 17; y++) for (var x = 0; x < 30; x++) {
    var c = sc.grid[y][x], px = x * TT, py = y * TT;
    if (c === 'F') { var nearF = Math.abs(P.x - (ox + px + 8)) < 30 && Math.abs(P.y - (sc.sy * SH + py)) < 60; KIT.ctx.globalAlpha = nearF ? 0.45 : 1; R(zs.block[2], px, py, TT, TT); R(zs.block[0], px + 1, py + 1, TT - 2, TT - 2); R(zs.block[1], px + 1, py + 1, TT - 2, 2); KIT.ctx.globalAlpha = 1; }
    else if (c === 'D') {
      if (!sc.leverOn) { R('#12040a', px + 2, py, 12, TT); for (var b = 0; b < 3; b++) R('#9a929a', px + 3 + b * 4, py, 2, TT); }
      else { R('rgba(154,146,154,0.25)', px + 3, py, 10, 3); }
    } else if (c === 'E' || c === 'e') {
      var on = c === 'E' ? !sc.leverOn : cyc(sc);
      R('#3a343c', px + 4, py, 8, 2); if (on) { var f = Math.floor(G.t * 20); R('rgba(122,240,255,0.35)', px + 3, py, 10, TT); R('#e0ffff', px + 7 + (f % 3) - 1, py, 2, TT); if (f % 2) R('#7af0ff', px + 5, py + (f * 5) % TT, 6, 2); }
      else if (c === 'e' && (G.t % 4) > 3.5) { if (Math.floor(G.t * 16) % 2) R('rgba(122,240,255,0.25)', px + 6, py, 4, TT); }
    }
  }
}
function drawEnts(sc) {
  var ox = sc.sx * SW, oy = sc.sy * SH;
  sc.signs.forEach(function (s) { spr('sw_plate', s.x - ox, s.y - oy + 8); });
  sc.portals.forEach(function (p) {
    var x = p.x - ox, y = p.y - oy - 2;
    if (p.open > 0) { var k = Math.min(1, (5 - p.open) * 4, p.open * 2); for (var i = 0; i < 5; i++) { KIT.ctx.strokeStyle = i % 2 ? '#fffbe8' : '#ffc840'; KIT.ctx.lineWidth = 2; KIT.ctx.beginPath(); KIT.ctx.ellipse(x, y - 30, (22 - i * 4) * k, (34 - i * 6) * k, G.t * (i % 2 ? 3 : -3), 0, 6.28); KIT.ctx.stroke(); } }
    else { KIT.ctx.strokeStyle = 'rgba(255,251,232,' + (0.3 + Math.sin(G.t * 3) * 0.15) + ')'; KIT.ctx.lineWidth = 1; KIT.ctx.beginPath(); KIT.ctx.ellipse(x, y, 18, 4, 0, 0, 6.28); KIT.ctx.stroke(); R('rgba(255,251,232,0.25)', x - 1, y - 24, 2, 20); }
  });
  sc.levers.forEach(function (l) { spr(sc.leverOn ? 'sw_lever1' : 'sw_lever0', l.x - ox, l.y - oy); });
  sc.lifts.forEach(function (l) { var x = l.x - ox, y = l.y - oy; R('#2a262c', x - 18, 0, 2, y - 4); R('#2a262c', x + 16, 0, 2, y - 4); spr('sw_lift', x, y + 2); text(l.up ? 'UP' : 'DOWN', x, y - 64, { align: 'center', size: 6, col: '#ffc840' }); });
  sc.exits.forEach(function (e) { spr('sw_exit', e.x - ox, e.y - oy); text('EXIT', e.x - ox, e.y - oy - 68, { align: 'center', size: 6, col: '#12040a', shadow: false }); });
  sc.mines.forEach(function (m) { if (m.alive) spr(Math.floor(G.t * 3) % 2 ? 'sw_mine1' : 'sw_mine0', m.x - ox, m.y - oy); });
  // homunculi: the ones still waiting cower and shake
  homs.forEach(function (h) {
    if (h.st === 'saved' || h.st === 'dead' || scrAt(h.x, h.y - 4) !== sc) return;
    var base = 'h_' + h.breed + '_teen_', f = h.st === 'idle' ? base + 'hurt' : h.moving ? (Math.abs(h.vy) > 0.5 ? base + 'jump' : base + 'run' + (Math.floor(h.t * 10) % 4)) : base + 'idle' + (Math.floor(h.t * 2) % 2);
    if (!KIT.has(f)) f = base + 'idle0'; if (!KIT.has(f)) f = 'h_gloop_teen_idle0';
    var shake = h.st === 'idle' ? Math.round(Math.sin(h.t * 40) * 0.8) : 0;
    spr(f, h.x - ox + shake, h.y - oy, { flip: h.face < 0, sc: 1.15 });
    if (h.st === 'idle') { R('#3a343c', h.x - ox - 6, h.y - oy - 4, 12, 2); for (var c = 0; c < 4; c++) R('#5a545c', h.x - ox + 6 + c * 3, h.y - oy - 3 + (c % 2), 2, 2); } // shackled
    if (h.st === 'wait') text('W', h.x - ox, h.y - oy - 44, { align: 'center', size: 6, col: '#a6968f' });
  });
  sc.guards.forEach(function (g) {
    var x = g.x - ox, y = g.y - oy;
    if (g.st === 'dead') { spr('f_blumguard_0', x, y + 6, { flip: g.face < 0, alpha: 0.4, rot: g.face * 1.4, sc: 1.35 }); return; }
    var f = g.st === 'patrol' ? 'f_blumguard_' + (Math.floor(g.t * 6) % 3) : g.st === 'alert' || g.st === 'shoot' ? 'f_blumguard_3' : 'f_blumguard_0';
    spr(f, x, y, { flip: g.face < 0, sc: 1.35 });
    if (g.st !== 'sleep' && g.st !== 'dead') { KIT.ctx.fillStyle = g.st === 'alert' ? 'rgba(255,38,48,0.16)' : 'rgba(255,200,120,0.05)'; KIT.ctx.beginPath(); KIT.ctx.moveTo(x + g.face * 8, y - 36); KIT.ctx.lineTo(x + g.face * 200, y - 60); KIT.ctx.lineTo(x + g.face * 200, y); KIT.ctx.fill(); } // the guard's torch beam
    if (g.st === 'sleep') text('z' + (Math.floor(G.t * 2) % 2 ? 'Z' : ''), x + 8, y - 46 - (G.t * 10) % 6, { size: 6, col: '#a6968f' });
    if (g.st === 'shoot' && g.t < 0.12) { R('#ffe36a', Math.min(x, g.shotX - ox), y - 22, Math.abs(g.shotX - ox - x), 2); }
  });
  sc.blums.forEach(function (b) { if (b.st === 'dead') return; spr('f_blumling_' + (b.st === 'chase' ? Math.floor(b.t * 12) % 4 : 0), b.x - ox, b.y - oy, { flip: b.face > 0, sc: 1.4 }); if (b.st === 'idle') text('...', b.x - ox, b.y - oy - 26, { align: 'center', size: 6, col: '#a6968f' }); });
}
function drawP(sc) {
  var ox = sc.sx * SW, oy = sc.sy * SH, x = P.x - ox, y = P.y - oy, f;
  if (P.st === 'chant') { var k = Math.min(1, P.chant); KIT.ctx.save(); KIT.ctx.globalAlpha = 0.35 * k; KIT.ctx.fillStyle = '#ffe36a'; KIT.ctx.beginPath(); KIT.ctx.ellipse(x, y - 28, 22 + Math.sin(G.t * 20) * 3, 36, 0, 0, 6.28); KIT.ctx.fill(); KIT.ctx.restore(); for (var i = 0; i < 2; i++) parts.push({ x: P.x + rnd(-18, 18), y: P.y - rnd(0, 50), vx: 0, vy: -60, t: 0.4, c: '#ffe36a' }); }
  if (P.st === 'walk' || P.st === 'run' || P.st === 'stand' || P.st === 'chant' || P.st === 'door') { drawLimper(x, y, P.face, P.st === 'walk' || P.st === 'run' ? P.st : 'stand', P.t); return; }
  if (P.st === 'dead') { f = P.deadT > 1 ? 'ch_hurt0' : 'ch_death' + (P.deadT > 0.6 ? 0 : 1); if (P.why === 'blown up' || P.why === 'eaten by a blumling') return; }
  else if (P.st === 'hoist' || P.st === 'drop' || P.st === 'lift') f = 'ch_jump2';
  else f = P.vy < -60 ? 'ch_jump1' : P.vy < 100 ? 'ch_jump2' : 'ch_jump3';
  spr(f, x, y + 1, { flip: P.face < 0 }); spr('sw_trap', x - P.face * 8, y + 1, { flip: P.face < 0 });
}
function drawShadows(sc) { sc.s.shadows.forEach(function (r) { R('rgba(2,0,2,0.78)', r[0] * TT, r[1] * TT, (r[2] - r[0] + 1) * TT, (r[3] - r[1] + 1) * TT); }); }
function drawBubbles(sc) {
  var ox = sc.sx * SW, oy = sc.sy * SH;
  bubbles.forEach(function (b) { var e = b.e; if (scrAt(e.x, e.y - 4) !== sc) return; var w = KIT.tw(b.t, 6) + 10, x = clamp(e.x - ox - w / 2, 2, SW - w - 2), y = e.y - oy - (e === P ? 72 : 52); R('#12040a', x - 1, y - 1, w + 2, 14); R('#f1e7d0', x, y, w, 12); text(b.t, x + 5, y + 3, { size: 6, col: '#12040a', shadow: false }); });
}
function draw() {
  if (G.mode === 'story' && STORY) { drawStory(); return; }
  if (G.mode === 'throne' && SCENE) { drawThrone(); KIT.blit(vignette(), 0, 0); return; }
  if (G.mode === 'street' && SCENE) { drawStreet(); KIT.blit(vignette(), 0, 0); return; }
  if (G.mode === 'title' || !P || (G.mode === 'end' && !SC[G.scr])) { drawTitle(); return; }
  var sc = SC[G.scr] || scrAt(P.x, P.y - 4); if (!sc) return;
  drawRoom(sc.key, sc); drawTiles(sc); drawEnts(sc); drawP(sc); drawShadows(sc);
  parts.forEach(function (p) { R(p.c, p.x - sc.sx * SW, p.y - sc.sy * SH, 2, 2); });
  KIT.blit(vignette(), 0, 0);
  drawBubbles(sc);
  sc.signs.forEach(function (s) { if (Math.abs(s.x - P.x) < 60 && Math.abs(s.y - P.y + 40) < 90) { var w = Math.min(440, KIT.tw(s.t, 6) + 24); KIT.panel(SW / 2 - w / 2, 40, w, 22); text(s.t, SW / 2, 48, { align: 'center', size: 6, col: '#ffe36a' }); } });
  // HUD: who you've saved, and how long until dawn
  KIT.panel(4, 4, 168, 26); spr('h_gloop_teen_idle0', 18, 28, { sc: 0.55 }); text('SAVED ' + G.saved + '/' + total, 32, 9, { size: 6, col: G.saved >= needed() ? '#7dff9a' : '#ffe36a' }); text('LOST ' + G.lost, 32, 19, { size: 6, col: '#ff2630' });
  var foll = homs.filter(function (h) { return h.st === 'follow'; }).length; if (foll) text('FOLLOWING ' + foll, 96, 19, { size: 6, col: '#a6968f' });
  var cl = Math.max(0, G.clock | 0); KIT.panel(4, 32, 120, 16); text('DAWN IN ' + Math.floor(cl / 60) + ':' + ('0' + cl % 60).slice(-2), 64, 36, { align: 'center', size: 6, col: cl < 60 ? '#ff2630' : '#a6968f' });
  if (banner) { var a = Math.min(1, banner.t * 2); text(banner.a, SW / 2, 74, { align: 'center', size: 24, font: 'title', col: '#ff2630', alpha: a }); text(banner.b, SW / 2, 100, { align: 'center', size: 6, alpha: a, col: '#a6968f' }); }
  if (P.st === 'dead' && P.deadT < 1.1) { R('rgba(0,0,0,' + (1 - P.deadT / 1.1) + ')', 0, 0, SW, SH); text(P.why ? P.why.toUpperCase() : '', SW / 2, SH / 2, { align: 'center', size: 8, col: '#ff2630' }); }
}
function drawTitle() {
  drawRoom('title');
  drawGrinder(380, 236, 1);
  drawLimper(150, 236, 1, 'stand', G.t); spr('h_gloop_teen_hurt', 205, 236, { flip: true }); spr('h_blood_teen_hurt', 232, 236, { flip: true });
  KIT.blit(vignette(), 0, 0);
}

/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; music.play('swtitle'); var cont = KIT.load('sw-run', null);
  KIT.menu({ cls: 'clear', logo: '../assets/sw-logo.webp', title: "Spuzzworld: Cum's Oddysee", sub: "Blumhead has Cumhead in his dungeon with a bear trap on his leg. Execution at dawn. The homunculi are down here too, waiting for the mincer. Limp out alone, or take them with you.",
    items: [cont ? { label: 'CARRY ON', sub: 'From the last screen you reached', fn: function () { KIT.closeMenu(); continueGame(); }, cls: 'hot', def: true } : null,
      { label: cont ? 'START OVER' : 'BEGIN', fn: function () { KIT.closeMenu(); newGame(); }, cls: cont ? '' : 'hot', def: !cont }, { label: 'HOW TO PLAY', fn: helpMenu }].filter(Boolean),
    note: SV.done ? 'Escapes ' + SV.done + '  ·  Most saved ' + SV.best + ' of ' + SCREENS.reduce(function (n, s) { return n + s.rows.join('').split('H').length - 1; }, 0) : '' });
}
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> left and right. Hold <b>B</b> (X key) to run. <b>A</b> (Z) jumps: standing, walking and running jumps go further each time. <b>Up</b> under a yellow ledge climbs, <b>down</b> on one drops. Up at a lever pulls it. Up/down on a lift rides it.</p><p><b>X</b> (C key): FOLLOW ME. <b>Y</b> (V key): WAIT. Hold <b>LB</b> (Q key, or the C button) next to a portal ring to chant it open; anyone following you jumps in and is home.</p><p>The bear trap stays on his leg the whole way, so Cumhead limps: his run is a hobble. Save at least three quarters of the homunculi to reach Blumhead&rsquo;s throne room before dawn. Leave them, and nobody is left at all.</p><p>Guards shoot what they see. In the dark they cannot see you unless you run. Sleeping guards wake if you run past. Blumlings chase you but cannot climb. Mines go off underfoot. Die and the screen starts again.</p>',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] });
}
function pauseMenu() {
  if (G.mode !== 'play' || KIT.menuOpen()) return;
  KIT.menu({ cls: 'clear', title: 'Paused', sub: 'Saved ' + G.saved + ' of ' + total + '  ·  Lost ' + G.lost, items: [{ label: 'CARRY ON', fn: KIT.closeMenu, back: true, def: true }, { label: 'RESTART THIS SCREEN', fn: function () { KIT.closeMenu(); restore(G.snap); } }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT TO TITLE', sub: 'Your place is kept', fn: titleMenu }] });
}
music.songs.swtitle = { bpm: 70, beats: 4, vol: 0.95, wet: 0.6, lead: 'soft', bass: 'drone', acc: 'bell', drums: null, chords: 'Dm Dm Bb A Dm Gm A A', mel: 'a4 - - - d5 - - - | f5 - e5 - d5 - - - | f5 - - - bb5 - - - | a5 - - - - - . . | d6 - - - a5 - - - | bb5 - a5 - g5 - - - | e5 - - - c#5 - - - | a4 - - - - - . .' };
music.songs.swcells = { bpm: 80, beats: 4, vol: 0.85, wet: 0.65, lead: 'soft', bass: 'drone', acc: 'bell', drums: 'slow', chords: 'Am Am F E', mel: 'e5 - - - . . a4 - | c5 - - - b4 - - - | a4 - - - c5 - f5 - | e5 - - - - - . .' };
music.songs.swworks = { bpm: 96, beats: 4, vol: 0.85, wet: 0.5, lead: 'fm', fmbass: 1, bass: 'walk', acc: 'bell', drums: 'industrial', chords: 'Em Em C B', mel: 'e4 . e4 . g4 . e4 . | b4 - - - a4 - - - | c5 . c5 . e5 . c5 . | b4 - - - d#5 - - -' };
music.songs.swthrone = { bpm: 108, beats: 4, vol: 0.9, wet: 0.45, lead: 'organlead', harm: 1, bass: 'drone', acc: 'organ', drums: 'tribal', chords: 'Cm Ab Fm G', mel: 'c5 - eb5 - g5 - c6 - | ab5 - - - eb5 - - - | f5 - ab5 - c6 - f6 - | d6 - - - b5 - - -' };
music.songs.swsad = { bpm: 60, beats: 4, vol: 0.85, wet: 0.75, lead: 'soft', bass: 'drone', acc: 'bell', drums: null, chords: 'Am Am Dm E Am F Dm E', mel: 'e5 - - - - - d5 - | c5 - - - b4 - - - | a4 - - - f5 - - - | e5 - - - - - . . | c5 - - - b4 - a4 - | a4 - - - c5 - - - | d5 - - - c5 - b4 - | a4 - - - - - . .' };
music.songs.swend = { bpm: 84, beats: 4, vol: 0.9, wet: 0.5, lead: 'calliope', bass: 'walk', acc: 'arp8', drums: 'slow', chords: 'F C Dm Bb F C Bb C', mel: 'a5 - - - g5 - f5 - | e5 - - - c5 - - - | d5 - f5 - a5 - d6 - | c6 - - - bb5 - - - | a5 - c6 - f6 - - - | e6 - - - c6 - - - | d6 - c6 - bb5 - a5 - | g5 - - - - - . .' };

KIT.start({ w: SW, h: SH, update: update, draw: draw, onPause: pauseMenu,
  pad: { four: false, btns: [{ k: 'a', label: 'A', sub: 'JUMP' }, { k: 'b', label: 'B', sub: 'RUN' }, { k: 'x', label: 'X', sub: 'FOLLOW' }, { k: 'y', label: 'Y', sub: 'WAIT' }, { k: 'lb', label: 'C', sub: 'CHANT', cls: 'gold' }] } });
titleMenu();
window.__sw = { G: G, get P() { return P; }, get homs() { return homs; }, SC: function () { return SC; }, newGame: function () { newGame(); STORY = null; startEscape(); }, story: newGame, ending: ending, get total() { return total; }, finish: finish, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, restore: restore, speak: speak, useUp: useUp, useDown: useDown, die: die,
  tp: function (key, tx, ty) { var s = SC[key]; P.x = s.sx * SW + tx * TT + 8; P.y = s.sy * SH + (ty + 1) * TT; P.st = 'stand'; P.ground = true; P.fallFrom = P.y; } };
