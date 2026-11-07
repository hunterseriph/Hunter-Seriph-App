/* =====================================================================================================
   THE TRIP: TB's Silly Pills in your head. The more you have taken, the more the basement breathes, swims and runs
   with colour, and the more often it plays tricks (Eternal Darkness style): the walls turn to meat, the picture goes
   negative, the world flips upside down, TB stands at the end of the hall grinning (he isn't there), your hands stop
   being your hands, the sound drops out, the screen tells you it's over when it isn't.
   ===================================================================================================== */
var TRIPEV = {
  meat: { lv: 1, len: 7 }, neg: { lv: 2, len: 1.2 }, ghost: { lv: 1, len: 9 }, whisper: { lv: 0.6, len: 4 }, heads: { lv: 2, len: 12 }, mute: { lv: 2.5, len: 6 },
  stretch: { lv: 1.5, len: 4 }, reverse: { lv: 3, len: 6 }, flip: { lv: 3.5, len: 5 }, fakeover: { lv: 4, len: 3.2 }, redout: { lv: 1.5, len: 6 }, rain: { lv: 1, len: 6 }, spin: { lv: 4.5, len: 3 }, tbcall: { lv: 2, len: 3 }
};
function stepTrip(dt) {
  var L = G.trip; G.tripKick = Math.max(0, (G.tripKick || 0) - dt * 0.5);
  G.trip = Math.max(0, G.trip - dt * 0.0035); // it wears off, very slowly
  if (G.ev) { G.ev.t += dt; if (G.ev.k === 'ghost') stepGhost(dt); if (G.ev.t >= G.ev.len) { endEvent(); } return; }
  G.evT -= dt * (0.5 + L * 0.35);
  if (G.evT <= 0 && L >= 0.6 && G.mode === 'play' && !G.P.hide) {
    var opts = Object.keys(TRIPEV).filter(function (k) { return TRIPEV[k].lv <= L && k !== G.lastEv; }); if (!opts.length) { G.evT = 10; return; }
    var k = opts[Math.floor(Math.random() * opts.length)]; G.lastEv = k; G.ev = { k: k, t: 0, len: TRIPEV[k].len }; G.evT = 26 + Math.random() * 24;
    if (k === 'ghost') makeGhost(); if (k === 'whisper' || k === 'reverse') G.ev.s = k === 'reverse' ? 'your hands are not your hands' : WHISPERS[Math.floor(Math.random() * WHISPERS.length)];
    if (k === 'mute') music.stop(0.3); if (k === 'tbcall') { subtitle('TB', tbLine()); sfx.play('tblaugh'); }
    if (k === 'rain') { for (var i = 0; i < 40; i++) G.fx.push({ k: 'pillfall', x: G.P.x + (Math.random() - 0.5) * 10, z: G.P.z + (Math.random() - 0.5) * 10, y: 3 + Math.random() * 4, t: 6, c: Math.floor(Math.random() * 6) }); }
    if (k === 'fakeover') sfx.play('lose');
  }
}
function endEvent() { if (G.ev && G.ev.k === 'ghost') G.ghost = null; if (G.ev && G.ev.k === 'fakeover') { subtitle('TB', 'just kidding bro', 2.5); sfx.play('tblaugh'); } G.ev = null; }
/* the TB that isn't there: stands down the hall in front of you, grinning, and is gone when you get close or hit him */
function makeGhost() {
  var P = G.P, best = null; for (var d = 12; d >= 5; d -= 0.5) { var x = P.x + Math.sin(P.ca) * d, z = P.z + Math.cos(P.ca) * d; if (walkable(tileOf(x), tileOf(z), 'tb') && canSee(P.x, P.z, x, z)) { best = { x: x, z: z }; break; } }
  if (!best) { G.ev.len = 0.1; return; } G.ghost = { x: best.x, z: best.z, a: Math.atan2(P.x - best.x, P.z - best.z), t: 9, st: 'ghost', ph: 0, spd: 0 }; sfx.play('sting');
}
function stepGhost(dt) { var g = G.ghost, P = G.P; if (!g) return; g.a = Math.atan2(P.x - g.x, P.z - g.z); g.t -= dt; if (dist2(g, P) < 3.5 && !g.pop) { g.pop = 1; g.t = 0.5; sfx.play('tblaugh'); } if (g.t <= 0) { G.ghost = null; G.ev.t = G.ev.len; } }
/* the numbers the renderer and the camera read */
function tripLook() {
  var L = G.trip, t = KIT.t, e = G.ev, k = e ? Math.min(1, e.t / 0.6, (e.len - e.t) / 0.6) : 0, o = { warp: Math.min(0.55, L * 0.09 + G.tripKick * 0.25), hue: Math.min(0.85, Math.max(0, L - 1.2) * 0.17 + G.tripKick * 0.4), meat: 0, neg: 0, fov: 1.05 + Math.sin(t * 0.7) * 0.03 * L, roll: Math.sin(t * 0.43) * 0.022 * L, tint: null };
  if (e) {
    if (e.k === 'meat') o.meat = 0.85 * k; if (e.k === 'neg') o.neg = (Math.floor(e.t * 7) % 2) ? 1 : 0;
    if (e.k === 'stretch') o.fov = 1.05 - 0.6 * k; if (e.k === 'flip') o.roll += Math.PI * k; if (e.k === 'spin') o.roll += e.t / e.len * Math.PI * 2;
    if (e.k === 'redout') o.tint = [1.4, 0.45 + 0.55 * (1 - k), 0.5 + 0.5 * (1 - k)]; if (e.k === 'heads') o.warp += 0.1;
  }
  return o;
}
