/* =====================================================================================================
   LOAD LEGACY. Rogue Legacy style: every run is a new heir, the castle rebuilds itself, drops are kept.
   Built on the Cumhead the Spermhog engine (physics, drops, stomps, sound) with tiled rooms that link
   in four directions. Art for Spermaid, Greebo, the homunculus, the shopkeepers, the shop fronts and the
   bosses is rendered from Cumheads Quest into SPR (one packed sheet).
   ===================================================================================================== */
var T = 16, CW = 32, CH = 16, VH = CH * T, STEP = 1 / 60;
var VW = 400, M = 2;
var cv = document.getElementById('c'), ctx = cv.getContext('2d'), view = document.getElementById('view');
function el(id) { return document.getElementById(id); }
function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function R(g, col, x, y, w, h) { g.fillStyle = col; g.fillRect(x, y, w, h); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function ov(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) { return ax0 < bx1 && ax1 > bx0 && ay0 < by1 && ay1 > by0; }
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(a, b, c) { var h = (a * 374761393 + b * 668265263 + (c || 0) * 2246822519) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function shuffle(a, r) { r = r || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function fmtN(n) { return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

/* ---------- images: Spermhog's Cumhead atlas and city backdrops, plus the Cumheads Quest sprite sheet ---------- */
var ATLAS = /*@ATLAS@*/{};
var SRC = /*@SRC@*/{};
var SPR = /*@SPR@*/{};
var ICONS = /*@ICONS@*/{};
var imgs = {};
Object.keys(SRC).forEach(function (k) { var i = new Image(); i.src = SRC[k]; imgs[k] = i; });
function ok(i) { return i && i.complete && i.naturalWidth > 0; }
/* draw a sheet sprite with its feet at (x, y), centred */
function spr(name, x, y, flip, sc, alpha) {
  var f = SPR[name], a = f && f[4] ? (f[4] === 2 ? imgs.foe : imgs.hom) : imgs.sheet; if (!f || !ok(a)) return;
  sc = sc || 1; var w = f[2] * sc, h = f[3] * sc;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (flip) ctx.scale(-1, 1); if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.drawImage(a, f[0], f[1], f[2], f[3], -Math.round(w / 2), -Math.round(h), Math.round(w), Math.round(h));
  ctx.restore();
}
function sprCanvas(name, sc) {
  var f = SPR[name], a = f && f[4] ? (f[4] === 2 ? imgs.foe : imgs.hom) : imgs.sheet; if (!f || !ok(a)) return null; sc = sc || 1;
  var c = mk(Math.round(f[2] * sc), Math.round(f[3] * sc)), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(a, f[0], f[1], f[2], f[3], 0, 0, c.width, c.height); return c;
}
/* Cumhead's own frames from the Spermhog atlas */
function cspr(name, x, y, flip, alpha) {
  var f = ATLAS[name], a = imgs.atlas; if (!f || !ok(a)) return;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (flip) ctx.scale(-1, 1); if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.drawImage(a, f[0], f[1], f[2], f[3], -Math.floor(f[2] / 2), -(f[3] - 1), f[2], f[3]);
  ctx.restore();
}
function cumCanvas(name) { var f = ATLAS[name || 'idle0'], a = imgs.atlas; if (!f || !ok(a)) return null; var c = mk(f[2], f[3]); c.getContext('2d').drawImage(a, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]); return c; }

/* ---------- small procedural sprites (from Spermhog): drops, crawler, bat ---------- */
var dropImg = (function () {
  var c = mk(9, 11), g = c.getContext('2d'), half = [0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 2];
  for (var y = 0; y < 11; y++) { var h = half[y]; for (var x = 4 - h; x <= 4 + h; x++) { var edge = (x === 4 - h || x === 4 + h || y === 0 || y === 10); R(g, edge ? '#8a1219' : '#f1e0a8', x, y, 1, 1); } }
  R(g, '#fff6d8', 3, 5, 1, 2); R(g, '#d9b36a', 5, 8, 2, 1); return c;
})();
/* the Cum Cracker: a golden cracker with a blob of cream on top. Enemies drop them; each one heals */
var crackerImg = (function () {
  var c = mk(12, 12), g = c.getContext('2d'), O = '#12040a';
  R(g, O, 0, 3, 12, 9); R(g, '#c8862a', 1, 4, 10, 7); R(g, '#e8b04a', 1, 4, 10, 2); R(g, '#9a5a14', 1, 10, 10, 1);
  [[3, 7], [6, 8], [9, 7], [4, 9], [8, 9]].forEach(function (p) { R(g, '#7a4410', p[0], p[1], 1, 1); });
  R(g, O, 3, 0, 6, 5); R(g, '#f1e0a8', 4, 1, 4, 4); R(g, '#fff6d8', 4, 1, 2, 2); R(g, '#f1e0a8', 3, 4, 7, 2); R(g, '#d9b36a', 7, 5, 2, 1);
  return c;
})();
function makeCrawler(f, body, dark) {
  var c = mk(16, 13), g = c.getContext('2d'), half = [4, 6, 7, 8, 8, 8, 8, 8];
  for (var i = 0; i < 8; i++) { var y = 3 + i, h = half[i]; for (var x = 8 - h; x < 8 + h; x++) { var edge = (i === 0 || x === 8 - h || x === 8 + h - 1); R(g, edge ? dark : body, x, y, 1, 1); } }
  R(g, '#ff2630', 7, 0, 2, 3); R(g, '#ff2630', 3, 2, 2, 2); R(g, '#ff2630', 11, 2, 2, 2);
  R(g, '#f1e7d0', 4, 6, 3, 3); R(g, '#f1e7d0', 9, 6, 3, 3); R(g, '#070405', 5, 7, 1, 2); R(g, '#070405', 10, 7, 1, 2);
  var lx = f ? [4, 7, 10, 13] : [3, 6, 9, 12]; for (var j = 0; j < 4; j++) R(g, dark, lx[j], 11, 1, 2);
  return c;
}
/* black bats with a thin red rim so they read against the dark */
function makeBat(f, body, rim) {
  var core = makeBat0(f, body), c = mk(18, 12), g = c.getContext('2d'), red = mk(16, 10), rg = red.getContext('2d');
  rg.drawImage(core, 0, 0); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = rim; rg.fillRect(0, 0, 16, 10);
  [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(function (o) { g.drawImage(red, o[0], o[1]); }); g.drawImage(core, 1, 1);
  R(g, '#ff2630', 7, 5, 1, 1); R(g, '#ff2630', 10, 5, 1, 1); return c;
}
function makeBat0(f, body) {
  var c = mk(16, 10), g = c.getContext('2d');
  R(g, body, 6, 3, 4, 5); R(g, '#2a0509', 6, 2, 1, 1); R(g, '#2a0509', 9, 2, 1, 1); R(g, '#ff2630', 6, 4, 1, 1); R(g, '#ff2630', 9, 4, 1, 1);
  if (f) { R(g, body, 1, 5, 5, 3); R(g, body, 10, 5, 5, 3); R(g, '#2a0509', 0, 7, 2, 2); R(g, '#2a0509', 14, 7, 2, 2); }
  else { R(g, body, 1, 1, 5, 4); R(g, body, 10, 1, 5, 4); R(g, '#2a0509', 0, 0, 2, 2); R(g, '#2a0509', 14, 0, 2, 2); }
  return c;
}
var PROC = {
  crawler: [makeCrawler(0, '#b3121c', '#2a0509'), makeCrawler(1, '#b3121c', '#2a0509')],
  crawlerN: [makeCrawler(0, '#e0207a', '#3a0420'), makeCrawler(1, '#e0207a', '#3a0420')],
  bat: [makeBat(0, '#0c0406', '#c4121c'), makeBat(1, '#0c0406', '#c4121c')],
  batP: [makeBat(0, '#0c0406', '#ff2630'), makeBat(1, '#0c0406', '#ff2630')]
};

/* ---------- sound (synthesised, no files; Spermhog's set plus a few) ---------- */
var sfx = (function () {
  var A = null, master = null, muted = false, noiseBuf = null, lastPick = -9, combo = 0, lastStep = 0;
  try { muted = localStorage.getItem('ll-muted') === '1'; } catch (e) {}
  function init() {
    if (A) { if (A.state === 'suspended') A.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { A = new AC(); master = A.createGain(); master.gain.value = muted ? 0 : 0.7; master.connect(A.destination);
      noiseBuf = A.createBuffer(1, A.sampleRate, A.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { A = null; }
  }
  function tone(type, f0, f1, dur, vol, delay) {
    if (!A || muted) return;
    var t = A.currentTime + (delay || 0), o = A.createOscillator(), g = A.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, freq, type, delay) {
    if (!A || muted) return;
    var t = A.currentTime + (delay || 0), s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
    s.buffer = noiseBuf; f.type = type || 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  function seq(type, notes, gap, dur, vol) { for (var i = 0; i < notes.length; i++) tone(type, notes[i], notes[i], dur, vol, i * gap); }
  return {
    init: init, audio: function () { return A ? { ctx: A, master: master, nb: noiseBuf } : null },
    get muted() { return muted; },
    setMuted: function (m) { muted = m; try { localStorage.setItem('ll-muted', m ? '1' : '0'); } catch (e) {} if (master) master.gain.value = m ? 0 : 0.7; },
    suspend: function () { if (A && A.state === 'running') A.suspend(); },
    jump: function () { tone('square', 250, 640, 0.15, 0.07); },
    dbl: function () { tone('square', 420, 980, 0.12, 0.07); tone('triangle', 840, 1400, 0.08, 0.05, 0.04); },
    land: function () { noise(0.07, 0.16, 500, 'lowpass'); tone('sine', 120, 60, 0.07, 0.1); },
    step: function (t) { if (t - lastStep < 0.09) return; lastStep = t; noise(0.035, 0.06, 1400, 'bandpass'); },
    shoot: function () { tone('sawtooth', 1000, 180, 0.14, 0.06); noise(0.1, 0.05, 2500, 'highpass'); },
    whip: function () { noise(0.12, 0.12, 3000, 'bandpass'); tone('triangle', 900, 300, 0.1, 0.05); },
    lob: function () { tone('triangle', 300, 600, 0.16, 0.08); },
    spit: function () { noise(0.08, 0.08, 1800, 'highpass'); tone('square', 700, 400, 0.06, 0.04); },
    splat: function () { noise(0.16, 0.14, 700, 'lowpass'); tone('sine', 200, 70, 0.14, 0.1); },
    stomp: function () { tone('square', 180, 520, 0.12, 0.08); noise(0.08, 0.1, 900, 'lowpass'); },
    hit: function () { noise(0.07, 0.1, 1600, 'lowpass'); tone('square', 300, 150, 0.06, 0.05); },
    kill: function () { noise(0.2, 0.14, 1800, 'lowpass'); tone('triangle', 520, 90, 0.18, 0.1); },
    pick: function (t) { combo = (t - lastPick < 0.5) ? Math.min(combo + 1, 10) : 0; lastPick = t; var f = 988 * Math.pow(2, combo / 12); tone('square', f, f, 0.05, 0.045); tone('square', f * 1.5, f * 1.5, 0.09, 0.045, 0.05); },
    hurt: function () { tone('sawtooth', 420, 70, 0.32, 0.09); noise(0.22, 0.12, 700, 'lowpass'); },
    die: function () { seq('triangle', [392, 330, 262, 196], 0.13, 0.2, 0.12); noise(0.3, 0.08, 500, 'lowpass'); },
    oneup: function () { seq('square', [659, 784, 1319, 1175, 1319, 1568], 0.07, 0.09, 0.06); },
    chest: function () { seq('square', [523, 659, 784, 1047], 0.06, 0.12, 0.06); },
    door: function () { noise(0.4, 0.14, 300, 'lowpass'); tone('sawtooth', 90, 50, 0.4, 0.06); },
    lock: function () { tone('square', 160, 160, 0.12, 0.08); tone('square', 120, 120, 0.2, 0.08, 0.1); },
    magic: function () { seq('sine', [880, 1175, 1568, 2093], 0.05, 0.18, 0.06); },
    roar: function () { noise(0.7, 0.2, 400, 'lowpass'); tone('sawtooth', 140, 60, 0.7, 0.08); },
    fire: function () { noise(0.18, 0.08, 1200, 'bandpass'); tone('sawtooth', 300, 120, 0.15, 0.04); },
    goal: function () { seq('square', [523, 659, 784, 1047, 784, 1047, 1319], 0.1, 0.16, 0.06); seq('triangle', [262, 330, 392, 523], 0.2, 0.3, 0.1); },
    over: function () { seq('sawtooth', [330, 311, 294, 220], 0.28, 0.4, 0.06); },
    click: function () { tone('square', 440, 880, 0.07, 0.06); },
    buy: function () { seq('square', [784, 1047, 1319], 0.05, 0.09, 0.05); },
    no: function () { tone('square', 200, 140, 0.15, 0.06); }
  };
})();
var OPT = { mus: 1 };
/* music: see 15-music.js */

/* ---------- permanent progress ---------- */
var META_KEY = 'll-meta', RUN_KEY = 'll-run';
function freshMeta() {
  return { v: 1, bank: 0, up: {}, built: { club: 1, greebo: 1, fate: 1, arcade: 1, hatch: 1 }, gear: { weapon: 0, armour: 0, helm: 0 }, gearOwn: { weapon: 0, armour: 0, helm: 0 },
    runes: {}, runeOn: [], found: { weapon: 0, armour: 0, helm: 0, runes: {} }, lb: [], bosses: {}, blumWins: 0, superWins: 0, cwins: {}, ng: 0, last: null, runs: 0, legacy: [], prov: {}, card: null, started: false, totalDrops: 0, seenTown: 0 };
}
var META = (function () { var d = freshMeta(); try { var s = JSON.parse(localStorage.getItem(META_KEY) || 'null'); if (s && s.v === 1) for (var k in s) d[k] = s[k]; } catch (e) {} return d; })();
// older saves: anything already bought counts as found
(function () { var f = META.found || (META.found = { weapon: 0, armour: 0, helm: 0, runes: {} }); if (!f.runes) f.runes = {}; ['weapon', 'armour', 'helm'].forEach(function (s) { f[s] = Math.max(f[s] || 0, (META.gearOwn || {})[s] || 0); }); for (var r in META.runes || {}) f.runes[r] = 1; if (!META.lb) META.lb = []; if (!META.cwins) META.cwins = {}; META.built.hatch = 1; })();
function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(META)); } catch (e) {} }

/* ---------- input: keyboard, touch pad, gamepad ---------- */
var keys = { l: false, r: false, j: false, a: false, s: false, u: false, d: false }, pad = { l: false, r: false, j: false, a: false, s: false, d: false }, gp = { l: false, r: false, j: false, a: false, s: false, d: false };
var input = { l: false, r: false, j: false, a: false, s: false, d: false };
function key(e, down) {
  var k = e.key;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.l = down;
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.r = down;
  else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W' || k === 'z' || k === 'Z') keys.j = down;
  else if (k === 'ArrowDown' || k === 's' || k === 'S') keys.d = down;
  else if (k === 'x' || k === 'X' || k === 'k' || k === 'K' || k === 'e' || k === 'E' || k === 'b' || k === 'B' || k === 'Enter') keys.a = down; // B on the keyboard matches the B button
  else if (k === 'c' || k === 'C' || k === 'Shift' || k === 'l' || k === 'L') keys.s = down;
  else return;
  e.preventDefault();
}
window.addEventListener('keydown', function (e) { if (menuKey(e)) return; key(e, true); });
window.addEventListener('keyup', function (e) { key(e, false); });
window.addEventListener('blur', function () { for (var k in keys) keys[k] = false; for (k in pad) pad[k] = false; });
document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
function bindBtn(node, prop) {
  var id = null;
  node.addEventListener('pointerdown', function (e) { e.preventDefault(); id = e.pointerId; try { node.setPointerCapture(id); } catch (x) {} pad[prop] = true; node.classList.add('on'); });
  function up(e) { if (e.pointerId !== id) return; id = null; pad[prop] = false; node.classList.remove('on'); }
  node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up); node.addEventListener('lostpointercapture', up);
}
bindBtn(el('bA'), 'j'); bindBtn(el('bB'), 'a'); bindBtn(el('bC'), 's');
(function () {
  var dp = el('dpad'), id = null;
  function setDir(e) { var r = dp.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; pad.d = y > 0.62 && x > 0.28 && x < 0.72; pad.l = !pad.d && x < 0.45; pad.r = !pad.d && x > 0.55; dp.setAttribute('data-dir', pad.d ? 'D' : pad.l ? 'L' : (pad.r ? 'R' : '')); }
  dp.addEventListener('pointerdown', function (e) { e.preventDefault(); id = e.pointerId; try { dp.setPointerCapture(id); } catch (x) {} setDir(e); });
  dp.addEventListener('pointermove', function (e) { if (e.pointerId === id) setDir(e); });
  function up(e) { if (e.pointerId !== id) return; id = null; pad.l = pad.r = pad.d = false; dp.setAttribute('data-dir', ''); }
  dp.addEventListener('pointerup', up); dp.addEventListener('pointercancel', up); dp.addEventListener('lostpointercapture', up);
})();
var gpPrev = {};
function pollPad() {
  var pads = navigator.getGamepads ? navigator.getGamepads() : [], p = null;
  for (var i = 0; i < pads.length; i++) if (pads[i]) { p = pads[i]; break; }
  if (!p) { gp.l = gp.r = gp.j = gp.a = gp.s = gp.d = false; return; }
  var ax = p.axes[0] || 0, b = function (n) { return !!(p.buttons[n] && p.buttons[n].pressed); };
  gp.l = ax < -0.4 || b(14); gp.r = ax > 0.4 || b(15); gp.j = b(0); gp.a = b(2) || b(1); gp.s = b(3) || b(5);
  var up = (p.axes[1] || 0) < -0.5 || b(12), dn = (p.axes[1] || 0) > 0.5 || b(13);
  gp.d = dn;
  // menus, the title, game over and the cabinet are driven by padkit.js (shared by every game)
}
