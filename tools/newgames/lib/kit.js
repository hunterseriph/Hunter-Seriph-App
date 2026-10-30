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
  var cv = document.getElementById('c'), main = cv.getContext('2d'), ctx = main, W = 480, H = 270, cfg = {}, S = 1;
  ctx.imageSmoothingEnabled = false;
  /* the canvas is drawn at a whole multiple of its size (up to 3x) so text stays sharp and pixel art stays square */
  function fit() {
    var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (cfg.wide && r.width > 0 && r.height > 0) { var nw = Math.max(cfg.w || 480, Math.min(cfg.wide, Math.round(H * r.width / r.height))); if (nw !== W) { W = nw; S = 0; } } // o.wide: the picture widens to fill wide screens (up to that many pixels) instead of leaving black bars
    var k = Math.min(r.width / W, r.height / H) * dpr;
    var s = Math.max(1, Math.min(3, Math.round(k))); if (!(s > 0)) s = 1;
    if (s !== S || cv.width !== W * s) { S = s; cv.width = W * S; cv.height = H * S; main.imageSmoothingEnabled = false; layers = {}; }
  }
  window.addEventListener('resize', function () { setTimeout(fit, 50); });
  /* cached layers: draw static things (floors, walls, backdrops) once into a canvas, then blit them each frame */
  var layers = {};
  function layer(key, w, h, fn) {
    var L = layers[key]; if (L) return L;
    var c = document.createElement('canvas'); c.width = Math.ceil(w * S); c.height = Math.ceil(h * S); var g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(S, 0, 0, S, 0, 0);
    var old = ctx; ctx = g; try { fn(); } finally { ctx = old; }
    c.lw = w; c.lh = h; return (layers[key] = c);
  }
  function blit(L, x, y) { ctx.drawImage(L, Math.round(x), Math.round(y), L.lw, L.lh); }
  function dropLayer(key) { if (key) delete layers[key]; else layers = {}; }
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
  /* the pixel font only looks clean when each of its pixels lands on whole screen pixels: snap its size to that */
  function fsz(sz, f) { if (f !== 'px') return sz; var d = sz * S, a = Math.max(8, Math.round(d / 8) * 8); if (Math.abs(a - d) / d > 0.25) a = Math.max(4, Math.round(d / 4) * 4); return a / S; }
  function text(s, x, y, o) {
    o = o || {}; var f = o.font || 'px', sz = fsz(o.size || 8, f);
    ctx.save(); if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    ctx.font = sz + 'px ' + FONTS[f]; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'top';
    if (o.shadow !== false) { ctx.fillStyle = o.shadowCol || '#12040a'; ctx.fillText(s, Math.round(x) + 1, Math.round(y) + 1, o.max); if (o.outline) { ctx.fillText(s, Math.round(x) - 1, Math.round(y), o.max); ctx.fillText(s, Math.round(x), Math.round(y) - 1, o.max); ctx.fillText(s, Math.round(x) + 1, Math.round(y) - 1, o.max); ctx.fillText(s, Math.round(x) - 1, Math.round(y) + 1, o.max); } }
    ctx.fillStyle = o.col || '#f1e7d0'; ctx.fillText(s, Math.round(x), Math.round(y), o.max && o.max < tw(s, o.size || 8, f) ? o.max : undefined); ctx.restore();
  }
  function tw(s, sz, f) { ctx.save(); ctx.font = fsz(sz || 8, f || 'px') + 'px ' + FONTS[f || 'px']; var w = ctx.measureText(s).width; ctx.restore(); return w; }
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
  /* ---------- on-screen controls ----------
     One touch handler for the whole pad, so several fingers work at once (move and jump, move and shoot).
     o.dpad (default on): a d-pad on the left. o.btns: face buttons. o.sticks: twin analogue sticks that
     appear wherever a thumb lands, left half moves, right half aims (for twin-stick shooting). */
  var CTL = [], touches = {}, sticks = [{ x: 0, y: 0, on: false }, { x: 0, y: 0, on: false }], vsticks = {}, padCfg = null;
  function buildPad(o) {
    var pad = document.getElementById('pad'); pad.innerHTML = ''; CTL = []; padCfg = o; if (!o || o === 'none') { pad.hidden = true; return; } pad.hidden = false;
    pad.classList.toggle('sticks', !!o.sticks);
    if (o.dpad !== false && !o.sticks) {
      var dp = document.createElement('div'); dp.className = 'dpad'; dp.innerHTML = '<i class="u"></i><i class="l"></i><i class="r"></i><i class="d"></i><b></b>'; pad.appendChild(dp);
      CTL.push({ el: dp, kind: 'dpad', map: { l: 'left', r: 'right', u: 'up', d: 'down' }, four: o.four });
    }
    if (o.sticks) { var sp = document.createElement('div'); sp.className = 'stickzone'; sp.innerHTML = '<span>MOVE</span><span>AIM</span>'; pad.appendChild(sp); }
    var acts = document.createElement('div'); acts.id = 'acts'; if ((o.btns || []).length === 1) acts.className = 'one'; pad.appendChild(acts);
    (o.btns || []).forEach(function (b) {
      var el = document.createElement('button'); el.className = 'pbtn ' + (b.cls || ''); el.innerHTML = '<span>' + b.label + '</span>' + (b.sub ? '<small>' + b.sub + '</small>' : ''); el.setAttribute('data-pad-skip', ''); el.tabIndex = -1;
      el.addEventListener('contextmenu', function (e) { e.preventDefault(); }); acts.appendChild(el); CTL.push({ el: el, kind: 'btn', k: b.k });
    });
  }
  function ctlAt(x, y) { for (var i = 0; i < CTL.length; i++) { var r = CTL[i].el.getBoundingClientRect(), m = CTL[i].kind === 'btn' ? 8 : 4; if (!r.width) continue; if (x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m) return CTL[i]; } return null; }
  function dpadSet(c, x, y) {
    var r = c.el.getBoundingClientRect(), dx = x - r.left - r.width / 2, dy = y - r.top - r.height / 2, m = Math.hypot(dx, dy), map = c.map;
    touchDown[map.l] = touchDown[map.r] = touchDown[map.u] = touchDown[map.d] = false;
    if (m < r.width * 0.12) { c.el.dataset.dir = ''; return; }
    var a = Math.atan2(dy, dx), oct = Math.round(a / (Math.PI / 4)), dirs = { 0: 'r', 1: 'rd', 2: 'd', 3: 'ld', 4: 'l', '-4': 'l', '-3': 'lu', '-2': 'u', '-1': 'ru' }, d = dirs[oct] || '';
    if (c.four) d = d.length > 1 ? (Math.abs(dx) > Math.abs(dy) ? d[0] : d[1]) : d;
    touchDown[map.l] = d.indexOf('l') >= 0; touchDown[map.r] = d.indexOf('r') >= 0; touchDown[map.u] = d.indexOf('u') >= 0; touchDown[map.d] = d.indexOf('d') >= 0; c.el.dataset.dir = d;
  }
  function release(id) {
    var t = touches[id]; if (!t) return; delete touches[id];
    if (t.c) { if (t.c.kind === 'btn') { var still = false; for (var o in touches) if (touches[o].c === t.c) still = true; if (!still) { touchDown[t.c.k] = false; t.c.el.classList.remove('on'); } } else if (t.c.kind === 'dpad') { var m = t.c.map; touchDown[m.l] = touchDown[m.r] = touchDown[m.u] = touchDown[m.d] = false; t.c.el.dataset.dir = ''; } }
    if (t.stick !== undefined) { vsticks[t.stick] = null; }
  }
  function touchStart(id, x, y, tg) {
    audioInit(); if (menuOpen()) return false;
    var c = ctlAt(x, y); if (!c && tg && tg.closest && tg.closest('button,a,input,select,#menu')) return false;
    if (c) { touches[id] = { c: c }; if (c.kind === 'btn') { touchDown[c.k] = true; c.el.classList.add('on'); } else dpadSet(c, x, y); return true; }
    if (id !== 'm' && padCfg && padCfg.sticks && padOn()) { var half = x < window.innerWidth / 2 ? 0 : 1; if (!vsticks[half]) { vsticks[half] = { ox: x, oy: y, x: x, y: y }; touches[id] = { stick: half }; return true; } }
    return false;
  }
  function touchMove(id, x, y) { var t = touches[id]; if (!t) return; if (t.c && t.c.kind === 'dpad') dpadSet(t.c, x, y); if (t.stick !== undefined && vsticks[t.stick]) { var v = vsticks[t.stick], dx = x - v.ox, dy = y - v.oy, m = Math.hypot(dx, dy), R = 56; if (m > R) { v.ox = x - dx / m * R; v.oy = y - dy / m * R; } v.x = x; v.y = y; } }
  function padOn() { return !document.documentElement.classList.contains('hs-notouch'); }
  document.addEventListener('touchstart', function (e) { var used = false; for (var i = 0; i < e.changedTouches.length; i++) { var t = e.changedTouches[i]; if (touchStart(t.identifier, t.clientX, t.clientY, e.target)) used = true; } if (used && e.cancelable) e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', function (e) { for (var i = 0; i < e.changedTouches.length; i++) { var t = e.changedTouches[i]; if (touches[t.identifier]) { touchMove(t.identifier, t.clientX, t.clientY); if (e.cancelable) e.preventDefault(); } } }, { passive: false });
  var tend = function (e) { for (var i = 0; i < e.changedTouches.length; i++) release(e.changedTouches[i].identifier); };
  document.addEventListener('touchend', tend); document.addEventListener('touchcancel', tend);
  // a mouse can click the on-screen buttons too
  document.addEventListener('mousedown', function (e) { if (e.button === 0 && touchStart('m', e.clientX, e.clientY, e.target)) e.preventDefault(); });
  document.addEventListener('mousemove', function (e) { if (touches.m) touchMove('m', e.clientX, e.clientY); });
  document.addEventListener('mouseup', function () { release('m'); });
  /* analogue sticks: 0 = move, 1 = aim. From the controller's sticks, the on-screen sticks, or the keys */
  var GP = null;
  function readPad() { var gps = navigator.getGamepads ? navigator.getGamepads() : []; GP = null; for (var i = 0; i < gps.length; i++) if (gps[i] && gps[i].connected) { GP = gps[i]; break; } }
  function dz(x, y) { var m = Math.hypot(x, y); if (m < 0.2) return { x: 0, y: 0, on: false }; if (m > 1) { x /= m; y /= m; } return { x: x, y: y, on: true }; }
  function stick(i) {
    if (vsticks[i]) { var v = vsticks[i], dx = (v.x - v.ox) / 56, dy = (v.y - v.oy) / 56; return dz(dx, dy); }
    if (GP && GP.axes) { var g = dz(GP.axes[i * 2] || 0, GP.axes[i * 2 + 1] || 0); if (g.on) return g; }
    var names = i === 0 ? ['left', 'right', 'up', 'down'] : ['sleft', 'sright', 'sup', 'sdown'], x = (held(names[1]) ? 1 : 0) - (held(names[0]) ? 1 : 0), y = (held(names[3]) ? 1 : 0) - (held(names[2]) ? 1 : 0);
    return dz(x, y);
  }
  var ringEls = [];
  function drawSticks() { // the floating sticks, as rings under the thumbs (anywhere on the screen, game or pad area)
    if (!padCfg || !padCfg.sticks) return;
    [0, 1].forEach(function (i) {
      var el = ringEls[i]; if (!el) { el = ringEls[i] = document.createElement('div'); el.className = 'vstick' + (i ? ' aim' : ''); el.innerHTML = '<b></b>'; document.body.appendChild(el); }
      var v = vsticks[i]; if (!v) { el.style.display = 'none'; return; }
      var dx = v.x - v.ox, dy = v.y - v.oy, m = Math.hypot(dx, dy); if (m > 56) { dx = dx / m * 56; dy = dy / m * 56; }
      el.style.display = 'block'; el.style.left = v.ox + 'px'; el.style.top = v.oy + 'px'; el.firstChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
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
    var bk = (o.items || []).filter(function (it) { return it && it.back; })[0];
    if (bk) { var x = document.createElement('button'); x.type = 'button'; x.className = 'mclose'; x.setAttribute('aria-label', 'Close'); x.setAttribute('data-pad-skip', ''); x.textContent = '\u2715'; x.addEventListener('click', function () { audioInit(); sfx.play('back'); if (bk.fn) bk.fn(); }); box.appendChild(x); }
    if (o.logo) { var lg = document.createElement('img'); lg.className = 'mlogo'; lg.src = o.logo; lg.alt = o.title || ''; box.appendChild(lg); }
    else if (o.title) { var h = document.createElement('h1'); h.textContent = o.title; box.appendChild(h); }
    if (o.sub) { var s = document.createElement('p'); s.className = 'msub'; s.textContent = o.sub; box.appendChild(s); }
    if (o.html) { var hh = document.createElement('div'); hh.className = 'mhtml'; hh.innerHTML = o.html; box.appendChild(hh); }
    var list = document.createElement('div'); list.className = 'mlist' + (o.grid ? ' grid' : ''); box.appendChild(list);
    (o.items || []).filter(Boolean).forEach(function (it, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mbtn ' + (it.cls || ''); if (it.dis) b.disabled = true;
      b.innerHTML = '<span>' + it.label + '</span>' + (it.sub ? '<small>' + it.sub + '</small>' : ''); if (it.back) b.setAttribute('data-back', ''); if (it.def) b.setAttribute('data-pad-default', '');
      b.addEventListener('click', function () { audioInit(); sfx.play(it.back ? 'back' : 'select'); if (it.fn) it.fn(); }); list.appendChild(b);
    });
    if (o.note) { var n = document.createElement('p'); n.className = 'mnote'; n.textContent = o.note; box.appendChild(n); }
    down = {}; touchDown = {};
  }
  function closeMenu() { menuEl.hidden = true; menuEl.innerHTML = ''; down = {}; }
  /* ---------- the loop ---------- */
  var acc = 0, last = 0, T = 0, shake = 0, flash = 0, frameN = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.1, (t - last) / 1000 || 0); last = t; acc += dt;
    var steps = 0;
    while (acc >= 1 / 60 && steps < 5) {
      acc -= 1 / 60; steps++; if (steps === 1) readPad(); snapEdges(); ptr.tap = !!ptr.tapQ && !menuOpen(); ptr.tapQ = false;
      if (!menuOpen() && cfg.update) { T += 1 / 60; cfg.update(1 / 60); } else if (cfg.idleUpdate) cfg.idleUpdate(1 / 60);
      if (shake > 0) shake = Math.max(0, shake - 1 / 60 * 30); if (flash > 0) flash -= 1 / 60;
    }
    if ((frameN++ & 31) === 0) fit();
    ctx = main; ctx.setTransform(S, 0, 0, S, 0, 0); ctx.globalAlpha = 1;
    if (shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * shake), Math.round((Math.random() - 0.5) * shake));
    if (cfg.draw) cfg.draw();
    if (flash > 0) { ctx.setTransform(S, 0, 0, S, 0, 0); ctx.fillStyle = 'rgba(255,240,230,' + Math.min(0.7, flash * 3) + ')'; ctx.fillRect(0, 0, W, H); }
    drawSticks();
  }
  function start(o) {
    cfg = o; W = o.w || 480; H = o.h || 270; S = 0; fit();
    buildPad(o.pad);
    if (window.HSPad) HSPad.setup({ menu: function () { return menuOpen() ? menuEl : null; }, keys: o.padKeys || { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', a: 'z', b: 'x', x: 'c', y: 'v', lb: 'q', rb: 'e' },
      onStart: function () { if (o.onPause) o.onPause(); }, touch: '#pad', toggleAfter: '#mute', toggleClass: 'tbtn' });
    var mb = document.getElementById('mute'); if (mb) { mb.classList.toggle('off', muted); mb.addEventListener('click', function () { sfx.setMuted(!muted); mb.classList.toggle('off', muted); if (!muted) audioInit(); }); }
    var pb = document.getElementById('pauseBtn'); if (pb) pb.addEventListener('click', function () { if (o.onPause) o.onPause(); });
    requestAnimationFrame(frame);
  }
  return { start: start, get ctx() { return ctx; }, get S() { return S; }, layer: layer, blit: blit, dropLayer: dropLayer, stick: stick, get gamepad() { return GP; }, canvas: cv, get W() { return W; }, get H() { return H; }, get t() { return T; },
    spr: spr, has: has, size: size, R: R, text: text, tw: tw, wrap: wrap, panel: panel, bar: bar,
    held: held, pressed: pressed, consume: consume, ptr: ptr, setKeymap: setKeymap, buildPad: buildPad,
    sfx: sfx, save: save, load: load, menu: menu, closeMenu: closeMenu, menuOpen: menuOpen,
    shake: function (n) { shake = Math.max(shake, n); }, flash: function (n) { flash = Math.max(flash, n || 0.12); },
    get SPR() { return SPR; }, get sheet() { return SHEET; }, get sheetReady() { return ready; }, tick: function () { readPad(); snapEdges(); ptr.tap = !!ptr.tapQ; ptr.tapQ = false; } };
})();
var sfx = KIT.sfx;
function rnd(a, b) { return a + Math.random() * (b - a); }
function rndi(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function lerp(a, b, k) { return a + (b - a) * k; }
function dist(a, b, c, d) { return Math.hypot(c - a, d - b); }
