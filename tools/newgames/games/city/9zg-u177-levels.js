/* ---------- update 177 (his ask: some sounds too quiet, some too loud, some horrible; sort the levels) and update 178
   (his ask: there are still bad noises in places and some play on repeat; better noises please).
   - 178: the sounds you hear all the time are remade with proper filtering and soft envelopes instead of raw square and
     saw waves: doors (a wooden thunk with the handle), coins (a bell-like ding), menu clicks, hits and punches (a body
     thump), getting hurt, jumping, landing, footsteps, swings, gunshots, explosions (a long low rumble with debris),
     winning and losing, car alarms, horns, the horse, the roar, the demon screech, power-ups, magic, the crash.
   - 178: scraping along a wall no longer fires the crash over and over: a crash within 2.5 s of the last one is a
     metal scrape instead (quieter), so grinding along a barrier sounds like grinding.
   - Every sound plays at its own level, measured the way ears hear it against the songs and the voices (177). ---------- */
/* the sound kit used for the effects below: oscillators and noise through proper filters and soft envelopes */
function SK(A, out) { var nb = A.__nb; if (!nb) { nb = A.__nb = A.createBuffer(1, A.sampleRate * 2, A.sampleRate); var d = nb.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  var T0 = A.currentTime + 0.005;
  function env(g, t, at, dur, v) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + at); g.gain.setTargetAtTime(0.0001, t + at, dur / 4); }
  function filt(src, o, t, dur) { if (!o || !o.f) return src; var f = A.createBiquadFilter(); f.type = o.type || 'lowpass'; f.frequency.setValueAtTime(o.f, t); if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + dur); f.Q.value = o.q || 0.8; src.connect(f); return f; }
  return {
    o: function (type, f0, f1, dur, vol, delay, opt) { opt = opt || {}; var t = T0 + (delay || 0), x = A.createOscillator(), g = A.createGain(); x.type = type; x.frequency.setValueAtTime(f0, t); if (f1 !== f0) x.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      if (opt.vib) { var l = A.createOscillator(), lg = A.createGain(); l.frequency.value = opt.vib[0]; lg.gain.value = opt.vib[1]; l.connect(lg); lg.connect(x.frequency); l.start(t); l.stop(t + dur * 1.5 + 0.1); }
      var s = filt(x, opt, t, dur); env(g, t, opt.at || 0.004, dur, vol); s.connect(g); g.connect(out); x.start(t); x.stop(t + dur * 1.6 + 0.05); },
    n: function (dur, vol, delay, opt) { opt = opt || {}; var t = T0 + (delay || 0), s = A.createBufferSource(), g = A.createGain(); s.buffer = nb; var f = filt(s, { type: opt.type || 'bandpass', f: opt.f || 1000, f1: opt.f1, q: opt.q }, t, dur); env(g, t, opt.at || 0.003, dur, vol); f.connect(g); g.connect(out); s.start(t, Math.random() * 1.5); s.stop(t + dur * 1.6 + 0.05); } }; }
var SNDX = {
  door: function (K) { K.n(0.05, 0.25, 0, { type: 'highpass', f: 2500 }); K.n(0.22, 0.9, 0.03, { type: 'lowpass', f: 260 }); K.o('sine', 120, 70, 0.22, 0.5, 0.03); K.n(0.12, 0.25, 0.06, { f: 700, q: 2 }); },
  coin: function (K) { K.o('sine', 1318, 1318, 0.25, 0.35); K.o('sine', 2636, 2636, 0.15, 0.1); K.o('sine', 1760, 1760, 0.45, 0.35, 0.07); K.o('sine', 3520, 3520, 0.2, 0.08, 0.07); },
  blip: function (K) { K.o('sine', 1046, 1046, 0.07, 0.3); K.o('sine', 2092, 2092, 0.04, 0.06); },
  select: function (K) { K.o('triangle', 784, 784, 0.07, 0.35, 0, { f: 3000 }); K.o('triangle', 1175, 1175, 0.12, 0.35, 0.06, { f: 3000 }); },
  back: function (K) { K.o('triangle', 659, 659, 0.07, 0.35, 0, { f: 2500 }); K.o('triangle', 440, 440, 0.12, 0.35, 0.06, { f: 2500 }); },
  hit: function (K) { K.n(0.16, 1, 0, { type: 'lowpass', f: 320 }); K.n(0.05, 0.5, 0, { f: 1400, q: 1 }); K.o('sine', 140, 55, 0.14, 0.6); },
  punch: function (K) { K.n(0.12, 1, 0, { type: 'lowpass', f: 400 }); K.n(0.04, 0.6, 0, { f: 2200, q: 1.2 }); K.o('sine', 160, 60, 0.1, 0.6); },
  hurt: function (K) { K.n(0.22, 0.8, 0, { f: 450, f1: 300, q: 2.5 }); K.o('triangle', 200, 120, 0.2, 0.35, 0, { f: 900 }); K.n(0.08, 0.6, 0, { type: 'lowpass', f: 300 }); },
  jump: function (K) { K.n(0.16, 0.5, 0, { f: 500, f1: 1400, q: 1.5 }); K.o('sine', 260, 420, 0.1, 0.12); },
  land: function (K) { K.n(0.12, 0.8, 0, { type: 'lowpass', f: 220 }); K.n(0.05, 0.25, 0, { f: 1500, q: 1 }); },
  step: function (K) { K.n(0.06, 0.6, 0, { type: 'lowpass', f: 350 }); K.n(0.03, 0.2, 0, { f: 2500, q: 1 }); },
  swing: function (K) { K.n(0.18, 0.7, 0, { f: 1800, f1: 450, q: 1.4, at: 0.03 }); },
  shoot: function (K) { K.n(0.08, 1, 0, { type: 'lowpass', f: 2500 }); K.n(0.25, 0.6, 0, { type: 'lowpass', f: 600 }); K.o('sine', 180, 50, 0.12, 0.5); },
  boom: function (K) { K.n(1.4, 1, 0, { type: 'lowpass', f: 180, f1: 60 }); K.n(0.35, 0.6, 0, { type: 'lowpass', f: 1200 }); K.o('sine', 70, 28, 0.9, 0.8); for (var i = 0; i < 6; i++) K.n(0.04, 0.25, 0.15 + Math.random() * 0.8, { type: 'highpass', f: 2500 }); },
  win: function (K) { [523, 659, 784, 1047].forEach(function (f, i) { K.o('triangle', f, f, 0.35, 0.3, i * 0.09, { f: 3500 }); K.o('sine', f * 2, f * 2, 0.2, 0.06, i * 0.09); }); K.o('triangle', 1047, 1047, 0.8, 0.25, 0.4, { f: 3500 }); K.o('triangle', 1319, 1319, 0.8, 0.2, 0.4, { f: 3500 }); },
  lose: function (K) { [392, 330, 262, 196].forEach(function (f, i) { K.o('triangle', f, f * 0.97, 0.4, 0.35, i * 0.22, { f: 1800, vib: [5, 4] }); }); },
  alarm: function (K) { for (var i = 0; i < 4; i++) { K.o('square', 880, 880, 0.12, 0.18, i * 0.25, { f: 2200 }); K.o('square', 620, 620, 0.12, 0.18, i * 0.25 + 0.125, { f: 2200 }); } },
  horn: function (K) { K.o('sawtooth', 392, 392, 0.4, 0.3, 0, { f: 1500, q: 1.5, vib: [6, 2], at: 0.02 }); K.o('sawtooth', 494, 494, 0.4, 0.25, 0, { f: 1500, q: 1.5, at: 0.02 }); },
  neigh: function (K) { K.o('sawtooth', 700, 420, 0.9, 0.3, 0, { type: 'bandpass', f: 1100, q: 2, vib: [16, 60], at: 0.05 }); K.n(0.8, 0.25, 0, { f: 1800, q: 2, at: 0.05 }); K.n(0.3, 0.4, 0.85, { type: 'lowpass', f: 500 }); },
  roar: function (K) { K.o('sawtooth', 110, 55, 0.9, 0.5, 0, { f: 500, vib: [9, 8], at: 0.06 }); K.n(0.9, 0.6, 0, { type: 'lowpass', f: 380, at: 0.06 }); },
  screech: function (K) { K.o('sawtooth', 1500, 600, 0.6, 0.3, 0, { type: 'bandpass', f: 1600, q: 3, vib: [22, 80], at: 0.02 }); K.n(0.5, 0.3, 0, { f: 3000, q: 2 }); },
  power: function (K) { K.o('triangle', 330, 990, 0.35, 0.3, 0, { f: 3000 }); K.o('sine', 660, 1980, 0.35, 0.1); },
  magic: function (K) { for (var i = 0; i < 6; i++) K.o('sine', 1200 + i * 220, 1300 + i * 220, 0.3, 0.12, i * 0.04); },
  tick: function (K) { K.n(0.02, 0.5, 0, { type: 'highpass', f: 3000 }); },
  crash: function (K) { var k = Math.random(); K.n(0.35, 1, 0, { type: 'lowpass', f: 170 }); K.o('sine', 85, 38, 0.3, 0.6); K.n(0.3, 0.5, 0.01, { f: 700 + k * 300, q: 1.2 }); K.n(0.22, 0.3, 0.03, { f: 1800, q: 1.5 }); K.o('triangle', 523 + k * 140, 523 + k * 140, 0.35, 0.06, 0.02); K.o('triangle', 791 + k * 90, 791 + k * 90, 0.25, 0.04, 0.05); if (k > 0.4) { K.n(0.18, 0.2, 0.06, { type: 'highpass', f: 4500 }); K.n(0.12, 0.14, 0.14, { type: 'highpass', f: 6000 }); } },
  scrape: function (K) { K.n(0.45, 0.5, 0, { f: 1300, f1: 900, q: 1.5, at: 0.03 }); K.n(0.4, 0.4, 0, { type: 'lowpass', f: 250 }); }
};

var SFXLVL = {"door": -9.6, "coin": -10.4, "blip": -3.7, "select": -5.1, "back": -4.6, "hit": -6.9, "punch": -6, "hurt": -1.7, "jump": 2, "land": 1.3, "step": 0.6, "swing": -0.7, "shoot": -9.2, "boom": -9.5, "win": -7.1, "lose": -5.7, "alarm": 0.3, "horn": -1.8, "neigh": 1.1, "roar": -5.5, "screech": 1.2, "power": -4.6, "magic": -2.9, "tick": -8.2, "crash": -5.8, "scrape": -2.4, "r_id_po": 3.0, "r_weather": 8.9, "r_sports": 7.3, "r_harp": 11.6, "bell": 2.6, "r_twang": 11.5, "r_news": 9.8, "r_stars": 12.9, "r_cash": 8.0, "r_break": 11.2, "r_id_talk": 11.4, "r_id_bl": 10.7, "r_id_hs": 11.9, "r_gossip": 15.2, "r_ring": 9.5, "r_jingle": 12.4, "r_horn": 12.6, "no": 8.3, "splat": 10.3, "r_camera": 13.4, "r_crime": 16.2, "r_sweep": 14.9, "r_scratch": 16.0, "r_traffic": 14.3, "r_typing": 11.4, "cook": 10.7, "pour": 10.9, "r_thunder": 24.7, "r_click": 21.7};
(function () {
  Object.keys(SNDX).forEach(function (k) { sfx.add(k, function () { var a = sfx.audio(); if (!a) return; SNDX[k](SK(a.ctx, a.master)); }); });
  var pl = sfx.play, CUR = null, lastCrash = -9;
  sfx.play = function (name) { var a = sfx.audio && sfx.audio(); if (name === 'crash') { var now = a ? a.ctx.currentTime : 0; if (now - lastCrash < 2.5) { name = 'scrape'; if (now - (sfx.__scr || -9) < 0.5) return; sfx.__scr = now; } else lastCrash = now; arguments[0] = name; }
    var db = SFXLVL[name]; if (!a || db === undefined) return pl.apply(this, arguments);
    var g = a.ctx.createGain(); g.gain.value = Math.pow(10, db / 20); g.connect(a.master); CUR = g; try { return pl.apply(this, arguments); } finally { CUR = null; setTimeout(function () { try { g.disconnect(); } catch (e) {} }, 6000); } };
  window.sfxCur = function () { return CUR; };
})();
