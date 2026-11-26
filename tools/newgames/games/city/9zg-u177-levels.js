/* ---------- update 177 (his ask: some sounds are too quiet, some too loud, some sound horrible, like the crash; sort the levels).
   Every sound effect was measured (how loud it is at its loudest moment, the way ears hear it) against the songs and the
   voices, and each one now plays at its own level so they sit together: menu clicks quiet, hits and doors clear, crashes
   and explosions the loudest, the radio's stings level with the DJ. Before this most effects were 15 to 30 dB under
   the voices and the songs, and footsteps and landings were close to silent. Your Sound volume setting still works on top.
   - The car crash is new: a heavy thump, a crunch of metal and a bit of glass, instead of the buzzy square-wave noise.
   - Car jacking had no sound (it asked for a 'punch' that was never made): it has one now.
   - Engine, tyre and city levels are in 9ze-u175-sound.js (also changed for this update: a tyre squeal instead of the
     hiss, also when you brake hard at speed, and a soft limiter so lots of sounds at once never crackle). ---------- */
var SFXLVL = {"crash": 0, "boom": 5.4, "r_id_po": 3.0, "r_weather": 8.9, "r_sports": 7.3, "r_harp": 11.6, "bell": 2.6, "r_twang": 11.5, "door": 3.5, "r_news": 9.8, "r_stars": 12.9, "roar": 8.9, "screech": 10.1, "r_cash": 8.0, "win": 11.6, "horn": 9.4, "alarm": 11.8, "r_break": 11.2, "hurt": 8.5, "lose": 8.9, "magic": 9.7, "r_id_talk": 11.4, "r_id_bl": 10.7, "r_id_hs": 11.9, "r_gossip": 15.2, "r_ring": 9.5, "r_jingle": 12.4, "r_horn": 12.6, "blip": 6.2, "power": 13.9, "no": 8.3, "splat": 10.3, "r_camera": 13.4, "coin": 11.6, "neigh": 15.5, "hit": 13.8, "r_crime": 16.2, "r_sweep": 14.9, "r_scratch": 16.0, "select": 10.8, "r_traffic": 14.3, "r_typing": 11.4, "jump": 10.9, "back": 12.5, "cook": 10.7, "pour": 10.9, "swing": 16.2, "r_thunder": 24.7, "r_click": 21.7, "shoot": 17.5, "tick": 17.0, "land": 21.0, "step": 21.1, "punch": 0};
(function () { var t = sfx.tone, n = sfx.noise;
  sfx.add('crash', function () { var a = sfx.audio(); if (!a) return; var A = a.ctx, now = A.currentTime;
    function nz(dur, vol, type, f, q, at) { var s = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(), t0 = now + (at || 0); s.buffer = a.nb; fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.8; g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); s.connect(fl); fl.connect(g); g.connect(a.master); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.05); }
    function ping(f, dur, vol, at) { var o = A.createOscillator(), g = A.createGain(), t0 = now + at; o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(a.master); o.start(t0); o.stop(t0 + dur + 0.05); }
    var k = Math.random();
    nz(0.32, 0.9, 'lowpass', 160, 0.7, 0); t('sine', 85, 38, 0.28, 0.45); // the thump
    nz(0.28, 0.35, 'bandpass', 700 + k * 300, 1.2, 0.01); nz(0.2, 0.22, 'bandpass', 1800, 1.5, 0.03); // the metal crunching
    ping(523 + k * 140, 0.35, 0.05, 0.02); ping(791 + k * 90, 0.25, 0.035, 0.05); // a panel ringing
    if (k > 0.4) { nz(0.18, 0.12, 'highpass', 4500, 0.7, 0.06); nz(0.12, 0.08, 'highpass', 6000, 0.7, 0.14); } }); // and sometimes glass
  sfx.add('punch', function () { n(0.07, 0.35, 420); t('sine', 140, 60, 0.1, 0.25); n(0.05, 0.12, 1800, 0.01); });
  // each sound at its own level
  var pl = sfx.play, CUR = null; sfx.play = function (name) { var a = sfx.audio && sfx.audio(), db = SFXLVL[name]; if (!a || db === undefined) return pl.apply(this, arguments);
    var g = a.ctx.createGain(); g.gain.value = Math.pow(10, db / 20); g.connect(a.master); CUR = g; try { return pl.apply(this, arguments); } finally { CUR = null; setTimeout(function () { try { g.disconnect(); } catch (e) {} }, 6000); } };
  window.sfxCur = function () { return CUR; };
})();
