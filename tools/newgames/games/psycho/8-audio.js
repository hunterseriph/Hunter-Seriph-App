/* =====================================================================================================
   SOUND: the basement hums (a drone per floor, wind, drips), your heart thumps when TB is near, guns are loud,
   TB laughs and rattles his pills. Music only when it matters: the title's broken music box, the chase, the way out.
   ===================================================================================================== */
(function () {
  var T = sfx.tone, N = sfx.noise;
  sfx.add('handgun', function () { N(0.18, 0.45, 900); N(0.35, 0.2, 300); T('square', 220, 60, 0.12, 0.1); });
  sfx.add('shotgun', function () { N(0.4, 0.6, 500); N(0.6, 0.3, 180); T('sawtooth', 120, 40, 0.25, 0.14); });
  sfx.add('rifle', function () { N(0.15, 0.6, 1600); N(0.7, 0.28, 260); T('square', 300, 50, 0.2, 0.12); });
  sfx.add('click', function () { T('square', 1800, 1800, 0.02, 0.04); T('square', 900, 900, 0.02, 0.03, 0.05); });
  sfx.add('swing', function () { N(0.16, 0.12, 2400); }); sfx.add('thud', function () { N(0.12, 0.3, 300); T('sine', 120, 50, 0.15, 0.2); });
  sfx.add('bonk', function () { T('triangle', 520, 300, 0.12, 0.14); N(0.1, 0.25, 900); }); sfx.add('swap', function () { T('square', 500, 700, 0.05, 0.04); N(0.05, 0.08, 3000); });
  sfx.add('step', function () { N(0.04, 0.05, 700 + Math.random() * 300); }); sfx.add('steprun', function () { N(0.05, 0.09, 600 + Math.random() * 300); });
  sfx.add('locker', function () { N(0.2, 0.2, 1400); T('square', 160, 120, 0.15, 0.05); }); sfx.add('clang', function () { T('square', 300, 280, 0.2, 0.08); N(0.15, 0.25, 2200); });
  sfx.add('pickup', function () { T('square', 660, 990, 0.08, 0.05); }); sfx.add('key', function () { [784, 988, 1175, 1568].forEach(function (f, i) { T('triangle', f, f, 0.15, 0.06, i * 0.08); }); });
  sfx.add('eat', function () { N(0.08, 0.1, 1800); N(0.08, 0.1, 1500, 0.12); N(0.08, 0.1, 1700, 0.24); }); sfx.add('pill', function () { T('sine', 400, 1600, 0.6, 0.06); T('sine', 403, 1200, 0.8, 0.05, 0.1); N(0.3, 0.06, 4000); });
  sfx.add('rattle', function () { for (var i = 0; i < 4; i++) N(0.03, 0.08, 5000, i * 0.05); });
  sfx.add('tblaugh', function () { for (var i = 0; i < 5; i++) { var f = 190 - i * 9 + Math.random() * 10; T('sawtooth', f * 1.2, f, 0.11, 0.07, i * 0.15); N(0.08, 0.05, 800, i * 0.15); } });
  sfx.add('tbhurt', function () { T('sawtooth', 160, 220, 0.3, 0.08); for (var i = 0; i < 3; i++) T('sawtooth', 210, 180, 0.1, 0.05, 0.3 + i * 0.13); });
  sfx.add('hum', function () { [196, 220, 196, 174].forEach(function (f, i) { T('triangle', f, f, 0.3, 0.025, i * 0.32); }); });
  sfx.add('snore', function () { N(0.9, 0.06, 220); T('sawtooth', 70, 60, 0.9, 0.03); });
  sfx.add('shout', function () { T('sawtooth', 240, 160, 0.4, 0.1); N(0.3, 0.1, 900); }); sfx.add('grunt', function () { T('sawtooth', 130, 90, 0.2, 0.08); });
  sfx.add('scream', function () { T('sawtooth', 600, 200, 0.8, 0.08); T('sawtooth', 640, 180, 0.8, 0.05); N(0.4, 0.1, 1500); }); sfx.add('throw', function () { N(0.12, 0.08, 3000); });
  sfx.add('grab', function () { N(0.4, 0.5, 300); T('sawtooth', 80, 40, 0.8, 0.2); T('square', 900, 200, 0.5, 0.06); });
  sfx.add('sting', function () { T('sawtooth', 70, 70, 1.4, 0.06); T('sawtooth', 74, 74, 1.4, 0.06); T('square', 1480, 1400, 0.6, 0.03); });
  sfx.add('stairs', function () { for (var i = 0; i < 8; i++) N(0.06, 0.12, 500, i * 0.22); }); sfx.add('heart', function () { T('sine', 70, 40, 0.14, 0.32); T('sine', 64, 38, 0.12, 0.24, 0.17); });
  sfx.add('engine', function () { T('sawtooth', 60, 75, 0.35, 0.05); N(0.3, 0.05, 300); });
  sfx.add('fireup', function () { N(0.6, 0.18, 1200); T('sawtooth', 90, 140, 0.4, 0.04); });
  sfx.add('honk', function () { T('square', 330, 320, 0.25, 0.06); T('square', 415, 400, 0.25, 0.05); T('square', 330, 320, 0.3, 0.06, 0.32); T('square', 415, 400, 0.3, 0.05, 0.32); });
  sfx.add('scrape', function () { N(0.5, 0.2, 3000); T('sawtooth', 900, 600, 0.4, 0.03); });
  sfx.add('swingbig', function () { N(0.28, 0.2, 1400); T('sine', 200, 90, 0.25, 0.08); });
  sfx.add('door', function () { T('sawtooth', 120, 90, 0.5, 0.03); N(0.35, 0.06, 900); });
})();
var AMB = null;
function ambience(dt) { // a low drone for the floor, wind in the pipes, your heartbeat when TB is close
  var au = sfx.audio(); if (!au) return; var ctx = au.ctx;
  if (!AMB) { var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), ns = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o1.type = 'sawtooth'; o2.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 220; g.gain.value = 0; o1.connect(f); o2.connect(f); f.connect(g); g.connect(au.master);
    ns.buffer = au.nb; ns.loop = true; nf.type = 'bandpass'; nf.frequency.value = 400; nf.Q.value = 3; ng.gain.value = 0; ns.connect(nf); nf.connect(ng); ng.connect(au.master);
    lfo.frequency.value = 0.07; lg.gain.value = 260; lfo.connect(lg); lg.connect(nf.frequency); o1.start(); o2.start(); ns.start(); lfo.start(); AMB = { o1: o1, o2: o2, f: f, g: g, ng: ng, beat: 0 }; }
  var on = G && (G.mode === 'play' || G.mode === 'catch') && !KIT.menuOpen() && !sfx.muted && !(G.ev && G.ev.k === 'mute'), t = ctx.currentTime, base = [41.2, 36.7, 46.2, 38.9][G ? G.fi : 0] || 41.2, L = G ? G.trip : 0;
  AMB.o1.frequency.setTargetAtTime(base * (1 + Math.sin(KIT.t * 0.3) * 0.004 * L), t, 0.3); AMB.o2.frequency.setTargetAtTime(base * 1.498 + L * 0.6, t, 0.3);
  AMB.g.gain.setTargetAtTime(on ? 0.05 : 0, t, 0.4); AMB.ng.gain.setTargetAtTime(on ? 0.035 : 0, t, 0.5); AMB.f.frequency.setTargetAtTime(160 + L * 40, t, 0.5);
  if (!on || !G.tb || G.tb.st === 'away') return; var d = dist2(G.tb, G.P), near = G.tb.st === 'chase' ? 1 : Math.max(0, 1 - d / 15);
  if (near > 0.05 && G.tb.st !== 'out') { AMB.beat -= dt; if (AMB.beat <= 0) { sfx.play('heart'); AMB.beat = 1.15 - near * 0.7; } }
}
(function () { var S = music.songs;
  // the title: a music box that has been left in the damp too long
  // (a 3/4 song can't use the 'bell' backing: it plays on step 14 of a 12-step bar)
  S.pntitle = { bpm: 64, beats: 3, vol: 0.85, wet: 0.65, lead: 'xylo', bass: 'drone', acc: 'arp8', drums: null, chords: 'Am Am E E F F E E Dm Am E Am',
    mel: 'e5 - a5 - c6 - | b5 - g#5 - e5 - | d5 - f5 - g#5 - | b5 - - - - - | c6 - a5 - f5 - | e5 - c5 - a4 - | g#4 - b4 - d5 - | e5 - - - . . | d5 - f5 - a5 - | c6 - b5 - a5 - | g#5 - e5 - b4 - | a4 - - - - -' };
  // when TB is coming: relentless
  S.pnchase = { bpm: 176, beats: 4, vol: 0.85, wet: 0.2, lead: 'fm', fmbass: 1, bass: 'pulse16', acc: 'arp16', drums: 'industrial', chords: 'Em Em F Em Em Em F B',
    mel: 'e5 . e5 . f5 . e5 . | g5 . f5 . e5 - - - | f5 . f5 . g#5 . f5 . | e5 - - - b4 - - - | e6 . e6 . f6 . e6 . | g6 . f6 . e6 - d6 - | c6 - f6 - a5 - f5 - | d#5 - f#5 - b5 - - -' };
  // getting out: his bar's waltz, far too cheerful
  S.pnend = { bpm: 150, beats: 3, vol: 0.85, wet: 0.35, lead: 'calliope', bass: 'waltz', acc: 'stabs', drums: 'waltz', chords: 'C C G G G G C C F F C A Dm G C C',
    mel: 'e5 - - g5 - e5 | c6 - - g5 - - | d5 - - f5 - d5 | b5 - - g5 - - | d5 - f5 b5 - d6 | c6 - b5 a5 - g5 | g5 - e5 c5 - e5 | g5 - - - - - | a5 - - c6 - a5 | f5 - - a5 - - | g5 - - e5 - c5 | c#5 - e5 a5 - - | d5 - f5 a5 - d6 | b5 - a5 g5 - f5 | e5 - d5 c5 - - | c5 - - - - -' };
})();
