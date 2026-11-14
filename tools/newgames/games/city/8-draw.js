/* ---------- drawing: the sky (time of day, seasons, weather), the chunks, the landmarks, then everything that moves ---------- */
var SKY = null, STARS = null, SEAM = null, SPRQ = null;
function skyMesh() { var m = new R3.Mesh(), R0 = 800, seg = 16, rings = 8, T = TL('white');
  for (var r = 0; r < rings; r++) for (var i = 0; i < seg; i++) { var b0 = r / rings * Math.PI * 0.55, b1 = (r + 1) / rings * Math.PI * 0.55, a0 = i / seg * 6.283, a1 = (i + 1) / seg * 6.283;
    function V(a, b) { return [Math.sin(b) * Math.cos(a) * R0, Math.cos(b) * R0 - 60, Math.sin(b) * Math.sin(a) * R0]; } var c0 = [r / rings, 0, 0], c1 = [(r + 1) / rings, 0, 0]; // red channel = how far down (coloured in the shader by tint/flash? no: per frame we rebuild the colours)
    m.quad(V(a0, b0), V(a1, b0), V(a1, b1), V(a0, b1), UV1, T, [c0, c0, c1, c1], [0, -1, 0]); }
  return m; }
var SKYCOL = { // [zenith, horizon] by hour
  0: ['#0c0614', '#3a1222'], 5: ['#100a1e', '#4a1e30'], 6: ['#2a3a6a', '#e08a5a'], 8: ['#3a6aa8', '#a8c8e0'], 12: ['#3a6ab8', '#b8d4e8'], 17: ['#3a5a98', '#d8b890'], 19: ['#3a2a5a', '#e0603a'], 20: ['#1a0c2a', '#6a1e2e'], 22: ['#0e0718', '#3e1424'], 24: ['#0c0614', '#3a1222'] };
function mixHex(a, b, t) { var A = rgb01(a), B = rgb01(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; }
function skyAt(h) { var ks = Object.keys(SKYCOL).map(Number).sort(function (a, b) { return a - b; }), a = 0, b = 24; for (var i = 0; i < ks.length - 1; i++) if (h >= ks[i] && h <= ks[i + 1]) { a = ks[i]; b = ks[i + 1]; break; } var t = (h - a) / ((b - a) || 1); return { top: mixHex(SKYCOL[a][0], SKYCOL[b][0], t), hor: mixHex(SKYCOL[a][1], SKYCOL[b][1], t) }; }
function dayLight(h) { var s = Math.sin((h - 6) / 12 * Math.PI); return clamp(s * 1.6 + 0.1, 0, 1); } // 0 night .. 1 noon
var SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
function season() { return Math.floor((G.day || 0) / 7) % 4; }
function seasonLook() { var s = season(); return s === 0 ? { veg: [0.95, 1.08, 0.95], vegAdd: [0.04, 0, 0.02], nat: [1, 1.04, 1], natAdd: [0, 0, 0] } : s === 1 ? { veg: [1, 1, 1], vegAdd: [0, 0, 0], nat: [1.05, 1.02, 0.9], natAdd: [0, 0, 0] }
  : s === 2 ? { veg: [1.6, 0.85, 0.42], vegAdd: [0.03, 0.01, 0], nat: [1.2, 0.95, 0.7], natAdd: [0, 0, 0] } : { veg: [0.7, 0.75, 0.8], vegAdd: [0.3, 0.32, 0.36], nat: [0.6, 0.62, 0.66], natAdd: [0.42, 0.44, 0.48] }; }
/* the look of the world right now: light, fog, sky */
function worldLook() {
  var h = G.time, dl = dayLight(h), sk = skyAt(h), wx = G.weather || 'clear', in2 = G.interior;
  var amb = [0.3 + 0.7 * dl, 0.27 + 0.69 * dl, 0.38 + 0.58 * dl];
  if (wx === 'rain' || wx === 'storm') amb = amb.map(function (v) { return v * 0.72; }); if (wx === 'fog') amb = amb.map(function (v) { return v * 0.85; });
  var fog = [sk.hor[0], sk.hor[1], sk.hor[2]], fr = [VIEWR * 0.45, VIEWR];
  if (wx === 'rain' || wx === 'storm') { fog = fog.map(function (v) { return v * 0.7 + 0.12; }); fr = [VIEWR * 0.25, VIEWR * 0.8]; }
  if (wx === 'fog') { fog = [0.55 * dl + 0.12, 0.55 * dl + 0.12, 0.58 * dl + 0.14]; fr = [20, 140]; }
  if (wx === 'snow') { fog = fog.map(function (v) { return v * 0.6 + 0.3 * dl; }); fr = [VIEWR * 0.3, VIEWR * 0.85]; }
  if (in2) { amb = [0.85, 0.8, 0.8]; fog = [0.02, 0.01, 0.02]; fr = [30, 80]; }
  return { dl: dl, sky: sk, amb: amb, fog: fog, fogR: fr };
}
var FX = [];
function addFx(o) { FX.push(o); if (FX.length > 260) FX.shift(); return o; }
function camForward() { return R3.cam.fwd; }
function inView(x, z, r) { var c = R3.cam, dx = x - c.eye[0], dz = z - c.eye[2], d = Math.hypot(dx, dz); if (d - r > VIEWR) return false; if (d < r + 20) return true; var f = c.fwd, fl = Math.hypot(f[0], f[2]) || 1; return (dx * f[0] + dz * f[2]) / (d * fl) > Math.cos(1.25) - r / d; }
function drawWorld(look) {
  var dl = look.dl, sl = seasonLook(), night = dl < 0.45, T = G.t;
  // lights: the nearest lit street lamps, shops, landmarks, the car's headlights as the torch
  var cam = R3.cam.eye, Ls = [];
  if (night || G.interior) { for (var k in CHUNKS) { var C = CHUNKS[k]; if (Math.abs(C.x - cam[0]) > 130 || Math.abs(C.z - cam[2]) > 130) continue; C.lamps.forEach(function (L) { var d = dist2(L.x, L.z, cam[0], cam[2]); if (d < 110 * 110) Ls.push({ x: L.x, y: L.y, z: L.z, r: L.shop ? 9 : 14, c: L.shop ? [1, 0.45, 0.4] : [1, 0.82, 0.55], k: (1 - dl) * 1.15, d: d }); }); } }
  LMK.forEach(function (o) { (o.lights || []).forEach(function (L) { var d = dist2(L.x, L.z, cam[0], cam[2]); if (d < 160 * 160) Ls.push({ x: L.x, y: L.y, z: L.z, r: L.r, c: L.c, k: 0.4 + (1 - dl) * 1.0, d: d }); }); });
  (G.dynLights || []).forEach(function (L) { L.d = dist2(L.x, L.z, cam[0], cam[2]); Ls.push(L); });
  Ls.sort(function (a, b) { return a.d - b.d; });
  var torch = { p: [0, -999, 0], d: [0, -1, 0], c: [0, 0, 0] };
  if (G.headlight) torch = G.headlight;
  R3.scene({ fog: look.fog, fogR: look.fogR, amb: look.amb, lights: Ls.slice(0, NL), torch: torch, t: T, hue: G.fxHue || 0, warp: G.fxWarp || 0, meat: G.fxMeat || 0, neg: G.fxNeg || 0 });
  // the sea round everything
  if (!G.interior) { if (!SEAM) { SEAM = new R3.Mesh(); var S = 1600; SEAM.quad([-S, 0, -S], [-S, 0, S], [S, 0, S], [S, 0, -S], uvR(S / 2, S / 2), TL('water'), [0.5, 0.5, 0.5], [0, 1, 0]); SEAM.upload(); }
    R3.draw(SEAM, ATT, { m: MD(Math.round(cam[0] / 8) * 8, -0.06, Math.round(cam[2] / 8) * 8, 0, 0, 0) }); }
  for (var k2 in CHUNKS) { var C2 = CHUNKS[k2]; if (!inView(C2.x, C2.z, 50)) continue;
    if (C2.m) R3.draw(C2.m, ATT); if (C2.nat) R3.draw(C2.nat, ATT, { tint: sl.nat, flash: sl.natAdd }); if (C2.veg) R3.draw(C2.veg, ATT, { tint: sl.veg, flash: sl.vegAdd });
    if (C2.fr && sheetTex()) R3.draw(C2.fr, sheetTex()); if (C2.wat) R3.draw(C2.wat, ATT, { tint: [1, 1, 1] });
    if (C2.glow) R3.draw(C2.glow, ATT, { lit: false, tint: night ? [1.1, 1.1, 1.1] : [0.85, 0.85, 0.85] });
    if (C2.night && dl < 0.6) R3.draw(C2.night, ATT, { lit: false, alpha: clamp((0.6 - dl) * 3, 0, 1) }); }
  LMK.forEach(function (o) { if (!inView(o.x, o.z, o.r)) return; if (o.m) R3.draw(o.m, ATT); if (o.glow) R3.draw(o.glow, ATT, { lit: false }); o.parts.forEach(function (q) { R3.draw(q.m, ATT, { m: q.f(T) }); }); });
}
var SHTEX2 = null;
function sheetTex() { if (!SHTEX2 && KIT.sheetReady) SHTEX2 = R3.texture(KIT.sheet); return SHTEX2; }
function drawSky(look) {
  var cam = R3.cam.eye, sk = look.sky;
  if (!SKY) { SKY = skyMesh(); } // colours set per frame: rebuild cheaply (small mesh)
  var m = new R3.Mesh(), R0 = 800, seg = 16, rings = 8, T = TL('white');
  function V(a, b) { return [Math.sin(b) * Math.cos(a) * R0, Math.cos(b) * R0 - 80, Math.sin(b) * Math.sin(a) * R0]; }
  for (var r = 0; r < rings; r++) { var t0 = Math.pow(r / rings, 1.6), t1 = Math.pow((r + 1) / rings, 1.6), c0 = [lerp(sk.top[0], look.fog[0], t0) / 2, lerp(sk.top[1], look.fog[1], t0) / 2, lerp(sk.top[2], look.fog[2], t0) / 2], c1 = [lerp(sk.top[0], look.fog[0], t1) / 2, lerp(sk.top[1], look.fog[1], t1) / 2, lerp(sk.top[2], look.fog[2], t1) / 2];
    for (var i = 0; i < seg; i++) { var b0 = r / rings * Math.PI * 0.56, b1 = (r + 1) / rings * Math.PI * 0.56, a0 = i / seg * 6.283, a1 = (i + 1) / seg * 6.283; m.quad(V(a0, b0), V(a1, b0), V(a1, b1), V(a0, b1), UV1, T, [c0, c0, c1, c1], [0, -1, 0]); } }
  R3.scene({ fog: look.fog, fogR: [5000, 6000], amb: [1, 1, 1], lights: [], torch: { p: [0, -999, 0], d: [0, -1, 0], c: [0, 0, 0] }, t: G.t });
  gl3d().disable(gl3d().DEPTH_TEST); gl3d().depthMask(false);
  R3.draw(m, ATT, { m: MD(cam[0], cam[1], cam[2], 0, 0, 0), lit: false, noDepth: 1 });
  // sun or the red moon, stars at night
  var h = G.time, sa = (h - 6) / 12 * Math.PI, sunDir = [Math.cos(sa) * 0.8, Math.sin(sa), 0.35], moonDir = [-sunDir[0], -sunDir[1], -0.3];
  if (!SPRQ) { SPRQ = new R3.Mesh(); SPRQ.quad([-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0], [0, 1, 1, 1, 1, 0, 0, 0], TL('sun'), [0.5, 0.5, 0.5], [0, 0, 1]); SPRQ.upload(); }
  function bill(dir, tile, size, alpha) { var l = Math.hypot(dir[0], dir[1], dir[2]), x = cam[0] + dir[0] / l * 700, y = cam[1] + dir[1] / l * 700, z = cam[2] + dir[2] / l * 700, yaw = Math.atan2(cam[0] - x, cam[2] - z), pit = Math.atan2(y - cam[1], Math.hypot(x - cam[0], z - cam[2]));
    var q = new R3.Mesh(); q.quad([-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0], [0, 1, 1, 1, 1, 0, 0, 0], TL(tile), [0.5, 0.5, 0.5], [0, 0, 1]); R3.draw(q, ATT, { m: MD(x, y, z, yaw, pit, 0, size), lit: false, soft: 1, add: 1, alpha: alpha, noDepth: 1 }); }
  if (sunDir[1] > -0.15) bill(sunDir, 'sun', 70, clamp(sunDir[1] * 4 + 0.6, 0, 1));
  if (moonDir[1] > -0.15) bill(moonDir, 'moon', G.moonBig ? 110 : 48, clamp(moonDir[1] * 4 + 0.6, 0, 1));
  if (look.dl < 0.35) { if (!STARS) { STARS = new R3.Mesh(); for (var s = 0; s < 260; s++) { var a = Math.random() * 6.283, b = Math.random() * 1.3, d = 700, x = Math.sin(b) * Math.cos(a) * d, y = Math.cos(b) * d, z = Math.sin(b) * Math.sin(a) * d, sz = 1 + Math.random() * 1.6; STARS.quad([x - sz, y, z], [x + sz, y, z], [x + sz, y + sz * 2, z], [x - sz, y + sz * 2, z], UV1, TL('white'), [0.5, 0.5, 0.5], [0, -1, 0]); } STARS.upload(); }
    if (G.weather === 'clear' || !G.weather) R3.draw(STARS, ATT, { m: MD(cam[0], cam[1], cam[2], G.t * 0.002, 0, 0), lit: false, alpha: clamp((0.35 - look.dl) * 4, 0, 1), noDepth: 1 }); }
  gl3d().enable(gl3d().DEPTH_TEST); gl3d().depthMask(true);
}
function gl3d() { return R3.gl; }
