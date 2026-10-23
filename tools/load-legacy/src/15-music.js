/* =====================================================================================================
   MUSIC: Load Legacy's own soundtrack. Written out note by note (melodies, chords, basslines and drums),
   played by a small 16-bit style synth: pulse-wave leads with vibrato, a pipe organ, a calliope for
   Ejaculand, a punchy bass and a noise drum kit. Melody tokens are eighth notes: a note like 'c#5',
   '-' to hold, '.' for a rest. Chords are one per bar.
   music.play(id) / music.stop(seconds) as before. Ids: title, town, castle, roof, park, dungeon, boss, blum, super.
   ===================================================================================================== */
var music = (function () {
  var A = null, bus = null, dl = null, tg = null, send = null, cur = null, want = null, song = null, nextT = 0, stepI = 0, nb = null, waves = {};
  var SONGS = {
    title: { bpm: 72, beats: 4, vol: 0.9, wet: 0.5, lead: 'organlead', bass: 'drone', acc: 'organ', drums: null,
      chords: 'Dm Bb Gm A Dm F C A',
      mel: 'd5 - - - a5 - - - | bb5 - a5 - g5 - f5 - | g5 - - - bb5 - d6 - | c#6 - - - e5 - - - | f5 - - - a5 - d6 - | c6 - - - a5 - f5 - | g5 - e5 - c5 - e5 g5 | a5 - - - - - - -' },
    town: { bpm: 112, beats: 4, vol: 0.85, wet: 0.3, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'shuffle',
      chords: 'F C Dm Bb F C Bb C',
      mel: 'c5 - a4 c5 f5 - e5 f5 | g5 - e5 - c5 - - - | d5 - f5 a5 g5 f5 e5 d5 | f5 - - - d5 - - - | c5 - a4 c5 f5 - a5 - | g5 f5 e5 f5 g5 - c6 - | bb5 - a5 g5 f5 - d5 - | e5 - g5 - c5 - - -',
      counter: 'a4 - - - c5 - - - | e4 - - - g4 - - - | f4 - - - a4 - - - | d4 - - - f4 - - - | a4 - - - c5 - - - | e4 - - - g4 - - - | d4 - - - f4 - - - | g4 - - - e4 - - -' },
    castle: { bpm: 132, beats: 4, vol: 0.9, wet: 0.28, lead: 'pulse', bass: 'drive', acc: 'arp16', drums: 'rock',
      chords: 'Am Am F G Am Am Dm E F G Em Am Dm E Am E',
      mel: 'a4 - c5 e5 a5 - g5 e5 | f5 e5 d5 e5 c5 - b4 - | a4 - c5 f5 a5 - g5 f5 | g5 f5 e5 d5 b4 - g4 - | a4 - c5 e5 a5 - b5 c6 | b5 a5 g5 a5 e5 - - - | f5 - e5 d5 a5 - f5 d5 | e5 - g#5 - b5 - e5 - | ' +
           'c6 - - b5 a5 - f5 - | d6 - - c6 b5 - g5 - | b5 - g5 - e5 - g5 b5 | c6 - b5 a5 e5 - - - | d5 f5 a5 d6 c6 a5 f5 a5 | b5 g#5 e5 g#5 b5 - - - | a5 - e5 - c5 - e5 - | g#5 - b5 - e6 - - -' },
    roof: { bpm: 144, beats: 4, vol: 0.85, wet: 0.42, lead: 'pulse', bass: 'gallop', acc: 'arp16', drums: 'fast',
      chords: 'Em F Em D Em F G F',
      mel: 'e5 - - f5 g5 - b5 - | a5 - g5 f5 e5 - - - | e5 - b4 - e5 f5 g5 a5 | f#5 - a5 - d6 - c6 - | b5 - - - e6 - d6 - | c6 - a5 - f5 - a5 c6 | d6 - b5 - g5 - b5 d6 | c6 - b5 - a5 - g5 f5' },
    park: { bpm: 156, beats: 3, vol: 0.85, wet: 0.35, lead: 'calliope', bass: 'waltz', acc: 'stabs', drums: 'waltz',
      chords: 'Cm Cm G G Cm Cm Fm G Ab Ab Fm Fm Cm G Cm G',
      mel: 'g5 - - c6 - eb6 | d6 - c6 b5 - c6 | d6 - - g5 - - | f5 - eb5 d5 - b4 | c5 - eb5 g5 - c6 | eb6 - d6 c6 - g5 | ab5 - g5 f5 - ab5 | g5 - - - - - | ' +
           'c6 - - eb6 - c6 | ab5 - - c6 - ab5 | f5 - ab5 c6 - f6 | eb6 - d6 c6 - ab5 | g5 - c6 eb6 - g6 | f6 - eb6 d6 - b5 | c6 - g5 eb5 - g5 | b5 - - d6 - -' },
    dungeon: { bpm: 84, beats: 4, vol: 1, wet: 0.6, lead: 'soft', bass: 'drone', acc: 'bell', drums: 'slow',
      chords: 'Bm Bm C Bm G F# Bm F#',
      mel: 'f#4 - - - - - b4 - | d5 - - c#5 - - b4 - | c5 - - - e5 - - - | d5 - c#5 - b4 - - - | d5 - - - g5 - f#5 - | e5 - - - a#4 - c#5 - | b4 - - - - - - - | . . . . . . . .' },
    boss: { bpm: 164, beats: 4, vol: 0.9, wet: 0.22, lead: 'pulse', bass: 'pulse16', acc: 'arp16', drums: 'boss',
      chords: 'F#m F#m D E F#m F#m G C#',
      mel: 'f#5 f#5 . f#5 a5 . f#5 c#6 | b5 a5 g#5 a5 f#5 - - - | f#5 f#5 . f#5 a5 . d6 c#6 | b5 - g#5 - e5 - b4 - | c#6 - c#6 d6 c#6 b5 a5 f#5 | a5 - g#5 - f#5 - c#5 - | d6 - b5 - g5 - d6 - | c#6 - f5 - g#5 - c#6 -' },
    blum: { bpm: 150, beats: 4, vol: 0.9, wet: 0.3, lead: 'pulse', bass: 'drive', acc: 'organ', drums: 'boss',
      chords: 'Dm Bb Gm A Dm Bb Eb A Gm Dm Bb A Dm Gm A Dm',
      mel: 'd5 - f5 - a5 - d6 - | c#6 d6 c#6 bb5 a5 - f5 - | g5 - bb5 - d6 - g6 - | f6 - e6 - c#6 - a5 - | d6 - - a5 f5 - d5 - | bb5 - - f5 d5 - bb4 - | eb5 - g5 - bb5 - eb6 - | c#6 - - - e6 - - - | ' +
           'd6 - bb5 - g5 - d5 - | f5 - a5 - d6 - f6 - | e6 d6 c#6 d6 bb5 - f5 - | a5 - c#6 - e6 - a6 - | f6 - e6 d6 a5 - d6 - | bb5 - g5 - d5 - g5 - | e5 - a5 - c#6 - e6 - | d6 - - - - - - -' }
  };
  // Pulsar's tracks: he changes up the tunes when you visit his stall
  SONGS.pulsar1 = { bpm: 88, beats: 4, vol: 0.85, wet: 0.5, lead: 'soft', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'F Am Bb C F Am Gm C',
    mel: 'a5 - - g5 a5 - c6 - | e5 - - - - - . . | f5 - g5 - a5 - c6 - | bb5 - a5 - g5 - . . | a5 - - g5 a5 - c6 - | e6 - d6 - c6 - a5 - | g5 - f5 - d5 - f5 - | e5 - - - - - . .' };
  SONGS.pulsar2 = { bpm: 116, beats: 4, vol: 0.85, wet: 0.45, lead: 'pulse', bass: 'drive', acc: 'arp16', drums: 'rock', chords: 'Am F C G Am F C E',
    mel: 'e5 - a5 - c6 - b5 a5 | c6 - - - a5 - - - | g5 - e5 - g5 - c6 - | b5 - - - g5 - - - | e5 - a5 - c6 - e6 - | f6 - e6 - c6 - a5 - | g5 - c6 - e6 - g6 - | g#5 - b5 - e6 - - -' };
  SONGS.pulsar3 = { bpm: 76, beats: 4, vol: 1, wet: 0.7, lead: 'soft', bass: 'walk', acc: 'bell', drums: 'slow', chords: 'Dm Dm Gm A Dm Bb Gm A',
    mel: 'd5 - - - f5 - a5 - | . . c6 - a5 - - - | bb5 - - - g5 - d5 - | e5 - - - c#5 - - - | d5 - f5 - a5 - d6 - | . . bb5 - f5 - - - | g5 - bb5 - d6 - g5 - | a5 - - - - - . .' };
  SONGS.super = (function () { var s = {}; for (var k in SONGS.blum) s[k] = SONGS.blum[k]; s.bpm = 166; s.shift = 1; s.harm = 1; return s; })();
  // drum kits: one bar each, 16th notes (12 for a waltz). k kick, s snare, h hat, o open hat, t tom, '.' nothing
  var KITS = {
    rock: ['k.h.s.h.k.k.s.h.', 'k.h.s.h.k.khs.hh'],
    shuffle: ['k..h..s..h.kk..h', 'k..h..s..h.ks.hh'],
    fast: ['khhhshhhkhkhshhh', 'khhhshhhkhkhshto'],
    slow: ['k.......s.......', 'k.......s...t.t.'],
    boss: ['kkhkskhkkkhkskhk', 'kkhkskhkkkhkstto'],
    waltz: ['k...h...h...', 'k...h.h.h...']
  };
  var NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  function midi(tok) { var m = /^([a-g])(#|b)?(-?\d)$/.exec(tok); if (!m) return null; return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
  function chord(sym) {
    var m = /^([A-G])(#|b)?(m|dim)?$/.exec(sym), r = NOTE[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    var q = m[3] === 'm' ? [0, 3, 7] : m[3] === 'dim' ? [0, 3, 6] : [0, 4, 7]; return { r: r, q: q };
  }
  function mf(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function line(src, spb, shift) { // melody text -> [{s: step, n: midi, d: steps}]
    var toks = src.replace(/\|/g, ' ').trim().split(/\s+/), out = [], last = null;
    toks.forEach(function (t, i) { if (t === '-') { if (last) last.d += spb; } else if (t === '.') last = null; else { var n = midi(t); if (n !== null) { last = { s: i * spb, n: n + shift, d: spb }; out.push(last); } } });
    return { notes: out, len: toks.length * spb };
  }
  function compile(sp) {
    var bar = sp.beats * 4, shift = sp.shift || 0, ch = sp.chords.split(/\s+/).map(chord), L = line(sp.mel, 2, shift);
    var len = Math.max(L.len, ch.length * bar), ev = []; for (var i = 0; i < len; i++) ev.push([]);
    L.notes.forEach(function (n) { ev[n.s % len].push({ k: 'lead', n: n.n, d: n.d }); if (sp.harm) ev[n.s % len].push({ k: 'harm', n: n.n - 12, d: n.d }); });
    if (sp.counter) line(sp.counter, 2, shift).notes.forEach(function (n) { ev[n.s % len].push({ k: 'counter', n: n.n, d: n.d }); });
    var R = 1;
    for (var b = 0; b < len / bar; b++) {
      var c = ch[b % ch.length], root = 36 + ((c.r + shift) % 12 + 12) % 12, base = b * bar, tones = c.q.map(function (x) { return root + 24 + x; });
      if (root < 40) root += 12; // keep the bass out of the mud
      var bs = sp.bass, s;
      if (bs === 'drive') for (s = 0; s < bar; s += 2) ev[base + s].push({ k: 'bass', n: root + (s % 8 === 6 ? 12 : 0), d: 1.6 });
      else if (bs === 'gallop') for (s = 0; s < bar; s++) { if (s % 4 !== 1) ev[base + s].push({ k: 'bass', n: root, d: 0.9 }); }
      else if (bs === 'pulse16') for (s = 0; s < bar; s++) ev[base + s].push({ k: 'bass', n: root + (s % 8 === 7 ? 12 : 0), d: 0.85 });
      else if (bs === 'walk') [0, 4, 8, 12].forEach(function (s2, i) { ev[base + s2].push({ k: 'bass', n: root + [0, 7, 12, 7][i], d: 3.4 }); });
      else if (bs === 'drone') { ev[base].push({ k: 'bass', n: root, d: bar }); }
      else if (bs === 'waltz') { ev[base].push({ k: 'bass', n: root, d: 3.5 }); ev[base + 8].push({ k: 'bass', n: root + 7, d: 2 }); }
      var ac = sp.acc;
      if (ac === 'arp16') for (s = 0; s < bar; s++) ev[base + s].push({ k: 'arp', n: tones[[0, 1, 2, 1][s % 4]] + (s % 8 >= 4 ? 12 : 0), d: 0.9 });
      else if (ac === 'arp8') for (s = 0; s < bar; s += 2) ev[base + s].push({ k: 'arp', n: tones[[0, 1, 2, 1][(s / 2) % 4]] + 12, d: 1.8 });
      else if (ac === 'organ') ev[base].push({ k: 'organ', ns: tones.map(function (t) { return t - 12; }), d: bar });
      else if (ac === 'stabs') { [4, 8].forEach(function (s2) { ev[base + s2].push({ k: 'stab', ns: tones, d: 2.5 }); }); }
      else if (ac === 'bell') { R = (R * 9301 + 49297) % 233280; if (R % 3 !== 0) ev[base + 6].push({ k: 'bell', n: tones[R % 3] + 12, d: 6 }); R = (R * 9301 + 49297) % 233280; if (R % 2) ev[base + 14].push({ k: 'bell', n: tones[R % 3] + 24, d: 6 }); }
      if (sp.drums) { var kit = KITS[sp.drums], pat = kit[(b % 4 === 3) ? 1 : 0]; for (s = 0; s < bar; s++) { var dch = pat[s % pat.length]; if (dch !== '.') ev[base + s].push({ k: 'drum', t: dch }); } }
      if (sp.acc === 'organ' && sp.bass === 'drone') ev[base].push({ k: 'organ', ns: [root + 12], d: bar });
    }
    return { sp: sp, ev: ev, len: len };
  }
  /* ---------- instruments ---------- */
  function pulse(duty) {
    if (waves[duty]) return waves[duty];
    var n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (var i = 1; i < n; i++) { re[i] = 0; im[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty); }
    return (waves[duty] = A.createPeriodicWave(re, im));
  }
  function env(g, t, a, peak, dur, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setValueAtTime(peak, t + Math.max(a, dur - rel)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.01); }
  function osc(type, f, t, dur, vol, o) {
    o = o || {}; var os = A.createOscillator(), g = A.createGain(), out = g;
    if (type === 'p25' || type === 'p12') os.setPeriodicWave(pulse(type === 'p25' ? 0.25 : 0.125)); else os.type = type;
    os.frequency.value = f; if (o.det) os.detune.value = o.det;
    if (o.vib) { var lf = A.createOscillator(), lg = A.createGain(); lf.frequency.value = o.vibF || 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(o.vib, t + Math.min(0.25, dur * 0.6)); lf.connect(lg); lg.connect(os.detune); lf.start(t); lf.stop(t + dur + 0.1); }
    if (o.lp) { var fl = A.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; os.connect(fl); fl.connect(g); } else os.connect(g);
    env(g, t, o.atk || 0.008, vol, dur, o.rel || Math.min(0.12, dur * 0.4));
    out.connect(o.dest || tg); os.start(t); os.stop(t + dur + 0.08);
  }
  function play1(e, t, sd) {
    var d = e.d * sd, kind = song.sp.lead;
    if (e.k === 'lead' || e.k === 'harm') {
      var v = e.k === 'harm' ? 0.6 : 1, f = mf(e.n);
      if (kind === 'pulse') { osc('p25', f, t, d * 0.95, 0.05 * v, { vib: 9, det: -4 }); osc('p12', f, t, d * 0.95, 0.03 * v, { det: 5, vib: 7 }); }
      else if (kind === 'calliope') { osc('sine', f, t, d * 0.9, 0.07 * v, { vib: 22, vibF: 7.5, atk: 0.02 }); osc('triangle', f * 2, t, d * 0.9, 0.025 * v, { vib: 20, vibF: 7.5 }); }
      else if (kind === 'organlead') { [1, 2, 4].forEach(function (h, i) { osc('sine', f * h, t, d, [0.05, 0.025, 0.012][i] * v, { atk: 0.04, vib: 5 }); }); }
      else { osc('triangle', f, t, d, 0.07 * v, { atk: 0.05, vib: 12, rel: 0.3 }); osc('sine', f * 2, t, d, 0.015 * v, { atk: 0.06 }); }
    } else if (e.k === 'counter') osc('triangle', mf(e.n), t, d * 0.9, 0.045, { atk: 0.02, vib: 6 });
    else if (e.k === 'bass') { osc('triangle', mf(e.n), t, d, 0.11, { atk: 0.005 }); osc('p25', mf(e.n), t, d * 0.9, 0.025, { lp: 700 }); }
    else if (e.k === 'arp') osc('p12', mf(e.n), t, d, 0.016, { lp: 3200 });
    else if (e.k === 'organ') e.ns.forEach(function (n) { [1, 2, 3].forEach(function (h, i) { osc('sine', mf(n) * h, t, d, [0.022, 0.012, 0.006][i], { atk: 0.12, rel: 0.4 }); }); });
    else if (e.k === 'stab') e.ns.forEach(function (n) { osc('sine', mf(n), t, d, 0.03, { atk: 0.01, vib: 18, vibF: 7.5 }); osc('square', mf(n), t, d * 0.5, 0.008, { lp: 1800 }); });
    else if (e.k === 'bell') { osc('sine', mf(e.n), t, d, 0.05, { atk: 0.003, rel: d * 0.9 }); osc('sine', mf(e.n) * 2.76, t, d * 0.4, 0.012, { atk: 0.003, rel: d * 0.35 }); }
    else if (e.k === 'drum') drum(e.t, t);
  }
  function drum(k, t) {
    if (k === 'k' || k === 't') {
      var os = A.createOscillator(), g = A.createGain(), f0 = k === 'k' ? 160 : 220, f1 = k === 'k' ? 42 : 90;
      os.frequency.setValueAtTime(f0, t); os.frequency.exponentialRampToValueAtTime(f1, t + 0.14); g.gain.setValueAtTime(k === 'k' ? 0.22 : 0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      os.connect(g); g.connect(tg); os.start(t); os.stop(t + 0.2); return;
    }
    var s = A.createBufferSource(), f = A.createBiquadFilter(), g2 = A.createGain(), len = k === 's' ? 0.16 : k === 'o' ? 0.22 : 0.045;
    s.buffer = nb; f.type = k === 's' ? 'bandpass' : 'highpass'; f.frequency.value = k === 's' ? 1700 : 8000; if (k === 's') f.Q.value = 0.8;
    g2.gain.setValueAtTime(k === 's' ? 0.1 : k === 'o' ? 0.035 : 0.028, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + len);
    s.connect(f); f.connect(g2); g2.connect(tg); s.start(t, Math.random() * 0.4); s.stop(t + len + 0.02);
    if (k === 's') { var o2 = A.createOscillator(), g3 = A.createGain(); o2.frequency.value = 190; g3.gain.setValueAtTime(0.05, t); g3.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); o2.connect(g3); g3.connect(tg); o2.start(t); o2.stop(t + 0.1); }
  }
  /* ---------- transport ---------- */
  var cache = {};
  function setup(a) {
    A = a.ctx; nb = a.nb;
    var comp = A.createDynamicsCompressor(); bus = A.createGain(); bus.gain.value = 0.6 * OPT.mus; bus.connect(comp); comp.connect(a.master);
    dl = A.createDelay(1.5); dl.delayTime.value = 0.33; var fb = A.createGain(); fb.gain.value = 0.38; var lp = A.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2200; dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(bus);
  }
  function tick() {
    if (!A) { var a = sfx.audio && sfx.audio(); if (!a) return; setup(a); if (want) { var w = want; want = null; cur = null; play(w); } }
    if (!song || !tg || sfx.muted || A.state !== 'running') return;
    var sd = 60 / song.sp.bpm / 4;
    if (nextT < A.currentTime - 0.4) nextT = A.currentTime + 0.05;
    while (nextT < A.currentTime + 0.3) { var evs = song.ev[stepI % song.len]; for (var i = 0; i < evs.length; i++) play1(evs[i], nextT, sd); nextT += sd; stepI++; }
  }
  var ALIAS = { b0: 'castle', b2: 'roof', b8: 'park', b6: 'dungeon', b7: 'town', b3: 'blum', b4: 'boss' };
  function play(id) {
    id = ALIAS[id] || id; if (!SONGS[id]) return;
    if (!A) { want = id; return; }
    if (cur === id) return;
    fadeOut(0.7);
    if (!cache[id]) cache[id] = compile(SONGS[id]);
    cur = id; song = cache[id];
    tg = A.createGain(); tg.gain.setValueAtTime(0.0001, A.currentTime); tg.gain.linearRampToValueAtTime(song.sp.vol || 1, A.currentTime + 0.8);
    tg.connect(bus); send = A.createGain(); send.gain.value = song.sp.wet; tg.connect(send); send.connect(dl);
    stepI = 0; nextT = A.currentTime + 0.12;
  }
  function fadeOut(sec) {
    if (!tg) return; var g = tg, sn = send, now = A.currentTime;
    g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), now); g.gain.linearRampToValueAtTime(0.0001, now + sec);
    setTimeout(function () { try { g.disconnect(); sn.disconnect(); } catch (e) {} }, sec * 1000 + 3000);
    tg = null; send = null;
  }
  function stop(sec) { want = null; if (A) fadeOut(sec || 1); cur = null; song = null; }
  setInterval(tick, 40);
  return { play: play, stop: stop, setVol: function () { if (bus) bus.gain.value = 0.6 * OPT.mus; }, get current() { return cur; }, get steps() { return stepI; }, songs: SONGS, compile: compile };
})();
