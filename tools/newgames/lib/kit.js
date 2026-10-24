/* =====================================================================================================
   KIT: the shared engine for the newer games. One low-res canvas scaled up crisp, sprites from the game's
   own packed sheet, pixel text, Hunter's dark gothic windows, keyboard + controller (through padkit) +
   on-screen buttons + taps, a small synth for sound effects, Load Legacy's music engine, saves, and HTML
   menus that padkit can drive with a controller.
   A game calls KIT.start({ w, h, pad, update(dt), draw(), onPause() }) once.
   ===================================================================================================== */
var OPT = { mus: 1 };
var KIT = (function () {
  'use strict';
  var cv = document.getElementById('c'), ctx = cv.getContext('2d'), W = 480, H = 270, cfg = {};
  ctx.imageSmoothingEnabled = false;
  /* ---------- sprites ---------- */
  var SHEET = new Image(), SPR = /*@SPR@*/{}, ready = false, whites = {};
  SHEET.onload = function () { ready = true; }; SHEET.src = /*@SHEET@*/'';
  function has(n) { return !!SPR[n]; }
  function size(n) { var f = SPR[n]; return f ? { w: f[2], h: f[3] } : { w: 0, h: 0 }; }
  function white(n) { // a white silhouette of a frame, for hit flashes
    if (whites[n]) return whites[n]; var f = SPR[n], c = document.createElement('canvas'); c.width = f[2]; c.height = f[3];
    var g = c.getContext('2d'); g.drawImage(SHEET, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, f[2], f[3]); return (whites[n] = c);
  }
  /* spr(name, x, y, {flip, sc, alpha, anchor: 'b' (bottom centre, default) | 'c' | 'tl', rot, flash}) */
  function spr(n, x, y, o) {
    var f = SPR[n]; if (!f || !ready) return; o = o || {};
    var sc = o.sc || 1, w = f[2] * sc, h = f[3] * sc, an = o.anchor || 'b';
    var dx = an === 'tl' ? 0 : -w / 2, dy = an === 'b' ? -h : an === 'c' ? -h / 2 : 0;
    ctx.save(); if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    ctx.translate(Math.round(x), Math.round(y)); if (o.rot) ctx.rotate(o.rot); if (o.flip) ctx.scale(-1, 1);
    if (o.flash) ctx.drawImage(white(n), Math.round(dx), Math.round(dy), w, h); else ctx.drawImage(SHEET, f[0], f[1], f[2], f[3], Math.round(dx), Math.round(dy), w, h);
    ctx.restore();
  }
  /* ---------- drawing helpers ---------- */
  function R(c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  var FONTS = { px: '"Press Start 2P", monospace', title: '"Pirata One", serif', body: '"Archivo Narrow", sans-serif' };
  /* text(s, x, y, {size, col, align, font, shadow, alpha, max}) - pixel font sizes should be multiples of 8 (or 4/6 for tiny) */
  function text(s, x, y, o) {
    o = o || {}; var sz = o.size || 8, f = o.font || 'px';
    ctx.save(); if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    ctx.font = sz + 'px ' + FONTS[f]; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'top';
    if (o.shadow !== false) { ctx.fillStyle = o.shadowCol || '#12040a'; ctx.fillText(s, Math.round(x) + 1, Math.round(y) + 1, o.max); if (o.outline) { ctx.fillText(s, Math.round(x) - 1, Math.round(y), o.max); ctx.fillText(s, Math.round(x), Math.round(y) - 1, o.max); ctx.fillText(s, Math.round(x) + 1, Math.round(y) - 1, o.max); ctx.fillText(s, Math.round(x) - 1, Math.round(y) + 1, o.max); } }
    ctx.fillStyle = o.col || '#f1e7d0'; ctx.fillText(s, Math.round(x), Math.round(y), o.max); ctx.restore();
  }
  function tw(s, sz, f) { ctx.save(); ctx.font = (sz || 8) + 'px ' + FONTS[f || 'px']; var w = ctx.measureText(s).width; ctx.restore(); return w; }
  /* wrap text into lines that fit a width */
  function wrap(s, maxW, sz, f) {
    var out = []; String(s).split('\n').forEach(function (para) {
      var words = para.split(' '), line = '';
      words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (tw(t, sz, f) > maxW && line) { out.push(line); line = w; } else line = t; });
      out.push(line);
    }); return out;
  }
  /* a window in Hunter's style: near-black panel, blood red edge, a darker inner line, notched corners */
  function panel(x, y, w, h, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    var edge = o.edge || '#c4121c', fill = o.fill || 'rgba(14,7,8,0.94)';
    R('#12040a', x + 2, y, w - 4, h); R('#12040a', x, y + 2, w, h - 4); R('#12040a', x + 1, y + 1, w - 2, h - 2);
    R(edge, x + 3, y + 1, w - 6, h - 2); R(edge, x + 1, y + 3, w - 2, h - 6); R(edge, x + 2, y + 2, w - 4, h - 4);
    R(fill === 'solid' ? '#0e0708' : fill, x + 3, y + 3, w - 6, h - 6);
    R(o.line || '#4a1a1c', x + 4, y + 4, w - 8, 1); R('rgba(0,0,0,0.35)', x + 4, y + h - 5, w - 8, 1);
  }
  function bar(x, y, w, h, k, col, back) { R('#12040a', x - 1, y - 1, w + 2, h + 2); R(back || '#2a0a0e', x, y, w, h); R(col || '#c4121c', x, y, Math.max(0, Math.min(1, k)) * w, h); R('rgba(255,255,255,0.25)', x, y, Math.max(0, Math.min(1, k)) * w, 1); }
  /* ---------- input: keyboard (padkit presses keys for the controller), on-screen buttons, taps ---------- */
  var KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    KeyZ: 'a', Space: 'a', KeyJ: 'a', KeyX: 'b', KeyK: 'b', KeyC: 'x', KeyL: 'x', KeyV: 'y', KeyI: 'y', Enter: 'start', Escape: 'pause', KeyP: 'pause', KeyQ: 'lb', KeyE: 'rb', ShiftLeft: 'run', ShiftRight: 'run' };
  var down = {}, prevDown = {}, edge = {}, touchDown = {};
  function setKeymap(m) { for (var k in m) KEYMAP[k] = m[k]; }
  window.addEventListener('keydown', function (e) {
    var k = KEYMAP[e.code] || KEYMAP[e.key]; if (!k) return; if (menuOpen()) return; e.preventDefault(); down[k] = true; audioInit();
    if (k === 'pause' || (k === 'start' && cfg.startPauses)) { if (cfg.onPause) cfg.onPause(); }
  });
  window.addEventListener('keyup', function (e) { var k = KEYMAP[e.code] || KEYMAP[e.key]; if (!k) return; down[k] = false; });
  window.addEventListener('blur', function () { down = {}; touchDown = {}; });
  function held(k) { return !!(down[k] || touchDown[k]); }
  function pressed(k) { return !!edge[k]; }
  function snapEdges() { var all = {}; for (var k in down) all[k] = 1; for (k in touchDown) all[k] = 1; for (k in prevDown) all[k] = 1; edge = {}; for (k in all) { var h = held(k); if (h && !prevDown[k]) edge[k] = true; prevDown[k] = h; } }
  function consume(k) { edge[k] = false; }
  /* pointer (taps and clicks) in canvas pixels */
  var ptr = { x: -99, y: -99, down: false, tap: false, moved: false };
  function toCanvas(e) { var r = cv.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H), ox = r.left + (r.width - W * s) / 2, oy = r.top + (r.height - H * s) / 2; return { x: (e.clientX - ox) / s, y: (e.clientY - oy) / s }; }
  cv.addEventListener('pointerdown', function (e) { audioInit(); var p = toCanvas(e); ptr.x = p.x; ptr.y = p.y; ptr.down = true; ptr.tapQ = true; });
  cv.addEventListener('pointermove', function (e) { var p = toCanvas(e); ptr.x = p.x; ptr.y = p.y; ptr.moved = true; });
  window.addEventListener('pointerup', function () { ptr.down = false; });
  /* the on-screen pad: a d-pad (or stick) and the face buttons the game asks for */
  function buildPad(o) {
    var pad = document.getElementById('pad'); pad.innerHTML = ''; if (!o || o === 'none') { pad.hidden = true; return; } pad.hidden = false;
    function mkPad(map, four) {
      var dp = document.createElement('div'); dp.className = 'dpad'; dp.innerHTML = '<i class="u"></i><i class="l"></i><i class="r"></i><i class="d"></i><b></b>'; pad.appendChild(dp);
      var clear = function () { touchDown[map.l] = touchDown[map.r] = touchDown[map.u] = touchDown[map.d] = false; };
      var upd = function (e) {
        var r = dp.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2, m = Math.hypot(x, y);
        clear(); if (m < 8) { dp.dataset.dir = ''; return; }
        var a = Math.atan2(y, x), oct = Math.round(a / (Math.PI / 4)), dirs = { 0: 'r', 1: 'rd', 2: 'd', 3: 'ld', 4: 'l', '-4': 'l', '-3': 'lu', '-2': 'u', '-1': 'ru' }, d = dirs[oct] || '';
        if (four) d = d.length > 1 ? (Math.abs(x) > Math.abs(y) ? d[0] : d[1]) : d;
        touchDown[map.l] = d.indexOf('l') >= 0; touchDown[map.r] = d.indexOf('r') >= 0; touchDown[map.u] = d.indexOf('u') >= 0; touchDown[map.d] = d.indexOf('d') >= 0; dp.dataset.dir = d;
      };
      dp.addEventListener('pointerdown', function (e) { audioInit(); dp.setPointerCapture(e.pointerId); upd(e); e.preventDefault(); });
      dp.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch') upd(e); });
      var off = function () { clear(); dp.dataset.dir = ''; };
      dp.addEventListener('pointerup', off); dp.addEventListener('pointercancel', off);
      return dp;
    }
    if (o.dpad !== false) mkPad({ l: 'left', r: 'right', u: 'up', d: 'down' }, o.four);
    var acts = document.createElement('div'); acts.id = 'acts'; pad.appendChild(acts);
    (o.btns || []).forEach(function (b) {
      var el = document.createElement('button'); el.className = 'pbtn ' + (b.cls || ''); el.innerHTML = '<span>' + b.label + '</span>' + (b.sub ? '<small>' + b.sub + '</small>' : ''); el.setAttribute('data-pad-skip', '');
      el.addEventListener('pointerdown', function (e) { audioInit(); touchDown[b.k] = true; el.classList.add('on'); el.setPointerCapture(e.pointerId); e.preventDefault(); });
      var up = function () { touchDown[b.k] = false; el.classList.remove('on'); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      acts.appendChild(el);
    });
    if (o.shootPad) { var sp = mkPad({ l: 'sleft', r: 'sright', u: 'sup', d: 'sdown' }, true); sp.classList.add('shoot'); }
  }
  /* ---------- sound: a little synth for effects ---------- */
  var A = null, master = null, muted = false, nb = null;
  try { muted = localStorage.getItem('hs-muted') === '1'; } catch (e) {}
  function audioInit() {
    if (A) { if (A.state === 'suspended') A.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { A = new AC(); master = A.createGain(); master.gain.value = muted ? 0 : 0.7; master.connect(A.destination);
      nb = A.createBuffer(1, A.sampleRate, A.sampleRate); var d = nb.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } catch (e) { A = null; }
  }
  function tone(type, f0, f1, dur, vol, delay) {
    if (!A || muted) return; var t = A.currentTime + (delay || 0), o = A.createOscillator(), g = A.createGain(); o.type = type;
    o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, freq, delay) {
    if (!A || muted) return; var t = A.currentTime + (delay || 0), s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
    s.buffer = nb; f.type = 'bandpass'; f.frequency.value = freq || 1200; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  var SFX = {
    blip: function () { tone('square', 660, 660, 0.05, 0.05); }, select: function () { tone('square', 520, 880, 0.08, 0.06); },
    back: function () { tone('square', 500, 300, 0.08, 0.05); }, no: function () { tone('square', 180, 140, 0.15, 0.07); },
    coin: function () { tone('square', 988, 988, 0.06, 0.05); tone('square', 1319, 1319, 0.12, 0.05, 0.06); },
    jump: function () { tone('square', 300, 600, 0.12, 0.05); }, land: function () { noise(0.08, 0.12, 300); },
    hit: function () { noise(0.1, 0.2, 900); tone('square', 220, 90, 0.1, 0.06); }, hurt: function () { tone('sawtooth', 400, 80, 0.25, 0.08); noise(0.15, 0.12, 600); },
    shoot: function () { tone('square', 900, 400, 0.07, 0.035); }, splat: function () { noise(0.18, 0.18, 500); tone('sine', 200, 60, 0.15, 0.08); },
    boom: function () { noise(0.5, 0.35, 200); tone('sine', 120, 30, 0.4, 0.2); }, power: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone('square', f, f, 0.08, 0.05, i * 0.07); }); },
    door: function () { noise(0.25, 0.12, 250); tone('sine', 90, 60, 0.3, 0.12); }, step: function () { noise(0.03, 0.04, 2000); },
    win: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone('square', f, f, 0.12, 0.06, i * 0.1); }); },
    lose: function () { [392, 330, 262, 196].forEach(function (f, i) { tone('triangle', f, f * 0.98, 0.25, 0.09, i * 0.2); }); },
    roar: function () { tone('sawtooth', 160, 60, 0.6, 0.12); noise(0.5, 0.2, 400); }, magic: function () { [880, 1175, 1568].forEach(function (f, i) { tone('sine', f, f * 1.5, 0.25, 0.05, i * 0.05); }); },
    tick: function () { tone('square', 1200, 1200, 0.03, 0.03); }, bell: function () { tone('sine', 1568, 1568, 0.5, 0.08); tone('sine', 3136, 3136, 0.2, 0.03); },
    cook: function () { noise(0.3, 0.06, 3000); }, pour: function () { noise(0.25, 0.08, 700); tone('sine', 300, 500, 0.2, 0.03); }
  };
  var sfx = { play: function (n) { audioInit(); if (SFX[n]) SFX[n](); }, add: function (n, fn) { SFX[n] = fn; }, tone: tone, noise: noise,
    audio: function () { return A ? { ctx: A, master: master, nb: nb } : null }, get muted() { return muted; },
    setMuted: function (m) { muted = m; try { localStorage.setItem('hs-muted', m ? '1' : '0'); } catch (e) {} if (master) master.gain.value = m ? 0 : 0.7; } };
  /* ---------- saves ---------- */
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : d; } catch (e) { return d; } }
  /* ---------- HTML menus (padkit drives them with a controller) ---------- */
  var menuEl = document.getElementById('menu');
  function menuOpen() { return menuEl && !menuEl.hidden; }
  /* menu({title, sub, note, items: [{label, sub, fn, back, dis, cls}], art, wide}) */
  function menu(o) {
    menuEl.innerHTML = ''; menuEl.hidden = false; menuEl.className = o.cls || '';
    var box = document.createElement('div'); box.className = 'mbox' + (o.wide ? ' wide' : ''); menuEl.appendChild(box);
    if (o.art) { var a = document.createElement('div'); a.className = 'mart'; a.innerHTML = o.art; box.appendChild(a); }
    if (o.title) { var h = document.createElement('h1'); h.textContent = o.title; box.appendChild(h); }
    if (o.sub) { var s = document.createElement('p'); s.className = 'msub'; s.textContent = o.sub; box.appendChild(s); }
    if (o.html) { var hh = document.createElement('div'); hh.className = 'mhtml'; hh.innerHTML = o.html; box.appendChild(hh); }
    var list = document.createElement('div'); list.className = 'mlist' + (o.grid ? ' grid' : ''); box.appendChild(list);
    (o.items || []).forEach(function (it, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mbtn ' + (it.cls || ''); if (it.dis) b.disabled = true;
      b.innerHTML = '<span>' + it.label + '</span>' + (it.sub ? '<small>' + it.sub + '</small>' : ''); if (it.back) b.setAttribute('data-back', ''); if (it.def) b.setAttribute('data-pad-default', '');
      b.addEventListener('click', function () { audioInit(); sfx.play(it.back ? 'back' : 'select'); if (it.fn) it.fn(); }); list.appendChild(b);
    });
    if (o.note) { var n = document.createElement('p'); n.className = 'mnote'; n.textContent = o.note; box.appendChild(n); }
    down = {}; touchDown = {};
  }
  function closeMenu() { menuEl.hidden = true; menuEl.innerHTML = ''; down = {}; }
  /* ---------- the loop ---------- */
  var acc = 0, last = 0, T = 0, shake = 0, flash = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.1, (t - last) / 1000 || 0); last = t; acc += dt;
    var steps = 0;
    while (acc >= 1 / 60 && steps < 5) {
      acc -= 1 / 60; steps++; snapEdges(); ptr.tap = !!ptr.tapQ && !menuOpen(); ptr.tapQ = false;
      if (!menuOpen() && cfg.update) { T += 1 / 60; cfg.update(1 / 60); } else if (cfg.idleUpdate) cfg.idleUpdate(1 / 60);
      if (shake > 0) shake = Math.max(0, shake - 1 / 60 * 30); if (flash > 0) flash -= 1 / 60;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    if (shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * shake), Math.round((Math.random() - 0.5) * shake));
    if (cfg.draw) cfg.draw();
    if (flash > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,240,230,' + Math.min(0.7, flash * 3) + ')'; ctx.fillRect(0, 0, W, H); }
  }
  function start(o) {
    cfg = o; W = o.w || 480; H = o.h || 270; cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;
    buildPad(o.pad);
    if (window.HSPad) HSPad.setup({ menu: function () { return menuOpen() ? menuEl : null; }, keys: o.padKeys || { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', a: 'z', b: 'x', x: 'c', y: 'v', lb: 'q', rb: 'e' },
      onStart: function () { if (o.onPause) o.onPause(); }, touch: '#pad', toggleAfter: '#mute', toggleClass: 'tbtn' });
    var mb = document.getElementById('mute'); if (mb) { mb.classList.toggle('off', muted); mb.addEventListener('click', function () { sfx.setMuted(!muted); mb.classList.toggle('off', muted); if (!muted) audioInit(); }); }
    var pb = document.getElementById('pauseBtn'); if (pb) pb.addEventListener('click', function () { if (o.onPause) o.onPause(); });
    requestAnimationFrame(frame);
  }
  return { start: start, ctx: ctx, canvas: cv, get W() { return W; }, get H() { return H; }, get t() { return T; },
    spr: spr, has: has, size: size, R: R, text: text, tw: tw, wrap: wrap, panel: panel, bar: bar,
    held: held, pressed: pressed, consume: consume, ptr: ptr, setKeymap: setKeymap, buildPad: buildPad,
    sfx: sfx, save: save, load: load, menu: menu, closeMenu: closeMenu, menuOpen: menuOpen,
    shake: function (n) { shake = Math.max(shake, n); }, flash: function (n) { flash = Math.max(flash, n || 0.12); },
    get SPR() { return SPR; }, tick: function () { snapEdges(); ptr.tap = !!ptr.tapQ; ptr.tapQ = false; } };
})();
var sfx = KIT.sfx;
function rnd(a, b) { return a + Math.random() * (b - a); }
function rndi(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function lerp(a, b, k) { return a + (b - a) * k; }
function dist(a, b, c, d) { return Math.hypot(c - a, d - b); }
