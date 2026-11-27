/* ---------- update 175 (his asks):
   - Cumhead is a man: his lines are spoken by a man's voice now (new recordings in ccn-voice, and if a line has no
     recording the phone's own voice used for him is a man's one where the phone has one).
   - Subtitles: only the name is yellow; everything said is white on every line.
   - Speech bubbles use a plain, clear font (the phone's or PC's own), bigger, with no shadow.
   - Options > Sound: radio and music volume, sound effects volume, voices volume (each 0 to 100%, saved).
   - More sound: engines (idle, revving with the throttle, going up through the gears, quieter for other cars near
     you), tyre squeal when you slide or handbrake, and the city around you (traffic rumble, far horns and sirens,
     dogs, birds in the day, crickets at night; a quiet room tone indoors).
   - Options > Full screen: the game fills the whole screen. The app's back button and game name go, and on a phone the
     notification bar and the home buttons go too (swipe from an edge to see them for a moment). ---------- */
var SND = { radio: 1, sfx: 1, voice: 1 };
try { var _snd = JSON.parse(localStorage.getItem('ccn-sound') || 'null'); if (_snd) for (var _k in SND) if (typeof _snd[_k] === 'number') SND[_k] = _snd[_k]; } catch (e) {}
function sndV(k) { return SND[k] === undefined ? 1 : SND[k]; }
function sndSave() { try { localStorage.setItem('ccn-sound', JSON.stringify(SND)); } catch (e) {} sndApply(); }
function sndApply() { OPT.mus = SND.radio; try { music.setVol(); } catch (e) {} var a = sfx.audio && sfx.audio(); if (a && SFXG) SFXG.gain.value = SND.sfx; }
function soundMenu() { var N = { radio: 'RADIO AND MUSIC', sfx: 'SOUND EFFECTS', voice: 'VOICES' };
  function bar(v) { return Math.round(v * 100) + '%' + (v === 0 ? ' (OFF)' : ''); }
  KIT.menu({ title: 'Sound', items: Object.keys(N).map(function (k) { return { label: N[k] + ': ' + Math.round(SND[k] * 100) + '%', fn: function () { level(k); } }; }).concat([{ label: 'BACK', back: true, fn: optsMenu }]) });
  function level(k) { var it = []; for (var i = 10; i >= 0; i--) (function (v) { it.push({ label: bar(v), cls: Math.abs(SND[k] - v) < 0.01 ? 'hot' : '', def: Math.abs(SND[k] - v) < 0.01, fn: function () { SND[k] = v; sndSave(); if (k === 'sfx') sfx.play('coin'); soundMenu(); } }); })(i / 10);
    KIT.menu({ title: N[k], items: it.concat([{ label: 'BACK', back: true, fn: soundMenu }]) }); } }
/* the sound effects get their own volume: everything that goes into the kit's master (all the bleeps, bangs and the new
   engine and city sounds) goes through SFXG first; the music bus (its compressor) still goes straight in. */
var SFXG = null;
(function () { var oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d) { var a = sfx.audio && sfx.audio(); var cur = window.sfxCur && sfxCur(); if (a && d === a.master && cur && this !== cur && !(this instanceof DynamicsCompressorNode)) { arguments[0] = cur; return oc.apply(this, arguments); } // update 177: a sound's own level first
    if (a && d === a.master && !(this instanceof DynamicsCompressorNode) && this !== SFXG) { if (!SFXG) { SFXG = a.ctx.createGain(); SFXG.gain.value = SND.sfx; var lim = a.ctx.createDynamicsCompressor(); lim.threshold.value = -9; lim.knee.value = 6; lim.ratio.value = 10; lim.attack.value = 0.002; lim.release.value = 0.15; oc.call(SFXG, lim); oc.call(lim, a.master); } arguments[0] = SFXG; } return oc.apply(this, arguments); }; })();
// voices: recorded lines, street barks and the radio DJ follow their volumes; so does the phone's own speech
(function () { var pf = playFile; playFile = function (src, vol, slot) { return pf(src, vol * (slot === 'radio' ? sndV('radio') : sndV('voice')), slot); };
  if (window.speechSynthesis) { var sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = function (u) { try { u.volume = (u.volume === undefined ? 1 : u.volume) * sndV('voice'); } catch (e) {} return sp(u); }; }
  // Cumhead's lines with no recording: a man's voice from the phone's own voices
  var sk = speak; speak = function (text, st) { if (!(st && st.id === 'cumhead') || !window.speechSynthesis || SV.radioMute) return sk(text, st);
    try { var u = new SpeechSynthesisUtterance(text), vs = speechSynthesis.getVoices().filter(function (v) { return /^en/i.test(v.lang); }), m = vs.filter(function (v) { return /\bmale\b|david|daniel|george|guy|mark|james|ryan|thomas|arthur|oliver|fred|alex\b|rishi|aaron|gordon/i.test(v.name) && !/female/i.test(v.name); });
      u.voice = m[0] || vs[0] || null; u.pitch = m[0] ? 1 : 0.6; u.rate = 1; u.volume = 0.9; speechSynthesis.speak(u); return 1; } catch (e) { return 0; } };
})();
// the DJ under a line, at the radio volume
setInterval(function () { try { if (VOX.radio) { var v = (VOX.line && !VOX.line.paused && !VOX.line.ended ? 0.25 : 0.95) * sndV('radio') * (window.RADF === undefined ? 1 : RADF); if (Math.abs(VOX.radio.volume - v) > 0.02) VOX.radio.volume = v; } } catch (e) {} }, 200);
/* ---------------- engines, tyres, the city ---------------- */
var AMB = null;
/* update 176 (his ask: more realistic revving, more city sound). An engine here is built like a real one sounds: a train of
   firing pulses (four cylinders, or a lumpy V8 in the fast cars, a diesel in the vans, a high-revving four on the bikes),
   through an exhaust resonance, with a breathy rasp, a rough edge that wobbles, real revs from a five-speed gearbox
   (speed times the gear's ratio), a dip at each gear change, the rev limiter bouncing when you hold it flat out standing
   still, and pops and crackles from the exhaust when you lift off at high revs. */
var ENGK = {
  car: { cyl: 4, idle: 850, red: 6800, gr: [3.4, 2.05, 1.42, 1.05, 0.82], lump: 0, rasp: 1, nz: 0.010, pk: 170 },
  v8: { cyl: 8, idle: 720, red: 6400, gr: [3.0, 1.95, 1.38, 1.0, 0.78], lump: 0.34, rasp: 1.2, nz: 0.012, pk: 120 },
  van: { cyl: 4, idle: 760, red: 4300, gr: [3.9, 2.3, 1.5, 1.08, 0.86], lump: 0.08, rasp: 1.6, nz: 0.016, pk: 140 },
  bike: { cyl: 4, idle: 1300, red: 11500, gr: [2.8, 1.95, 1.55, 1.3, 1.12], lump: 0.05, rasp: 0.8, nz: 0.010, pk: 260 },
  boat: { cyl: 2, idle: 950, red: 6000, gr: [1], lump: 0.18, rasp: 1.4, nz: 0.018, pk: 150 },
  fly: { cyl: 6, idle: 1600, red: 2900, gr: [1], lump: 0.45, rasp: 2.0, nz: 0.03, pk: 90 } };
function engKind(v) { var t = v.t || {}, c = t.cls; return c === 'bike' ? 'bike' : c === 'boat' ? 'boat' : c === 'heli' || c === 'plane' ? 'fly' : (t.hgt || 1.4) > 1.8 ? 'van' : (t.top || 40) > 52 || t.cop ? 'v8' : 'car'; }
function ambInit() { var a = sfx.audio && sfx.audio(); if (!a || AMB) return AMB; var A = a.ctx, out = A.createGain(); out.gain.value = 1.6; out.connect(a.master); // update 177: the city and the engines up a bit
  var nbuf = A.createBuffer(1, A.sampleRate * 2, A.sampleRate), nd = nbuf.getChannelData(0); for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  var N = 40, re = new Float32Array(N), im = new Float32Array(N); for (var h = 1; h < N; h++) im[h] = Math.pow(h, -0.75) * (h % 2 ? 1 : 0.62) * (1 + 0.35 * Math.sin(h * 1.7)); var pw = A.createPeriodicWave(re, im);
  function src() { var s = A.createBufferSource(); s.buffer = nbuf; s.loop = true; s.start(0, Math.random() * 1.9); return s; }
  function eng() { var o = A.createOscillator(), sub = A.createOscillator(), subG = A.createGain(), shp = A.createWaveShaper(), lp = A.createBiquadFilter(), pk = A.createBiquadFilter(), amp = A.createGain(), g = A.createGain();
    var c = new Float32Array(256); for (var i = 0; i < 256; i++) { var x = i / 128 - 1; c[i] = Math.tanh(x * 2.2); } shp.curve = c; o.setPeriodicWave(pw); sub.type = 'sine'; subG.gain.value = 0.5;
    o.connect(shp); sub.connect(subG); subG.connect(shp); lp.type = 'lowpass'; lp.Q.value = 1.2; pk.type = 'peaking'; pk.gain.value = 6; pk.Q.value = 1.4; shp.connect(lp); lp.connect(pk); pk.connect(amp); amp.connect(g); g.gain.value = 0; g.connect(out);
    var r = src(), rl = A.createBiquadFilter(), rg = A.createGain(); rl.type = 'lowpass'; rl.frequency.value = 28; rg.gain.value = 0.35; r.connect(rl); rl.connect(rg); rg.connect(amp.gain); // the rough, never-quite-even edge
    var lump = A.createOscillator(), lg = A.createGain(); lump.type = 'sine'; lg.gain.value = 0; lump.connect(lg); lg.connect(amp.gain); amp.gain.value = 1; // a V8's lope
    var ns = src(), bp = A.createBiquadFilter(), ng = A.createGain(); bp.type = 'bandpass'; bp.Q.value = 1.1; ng.gain.value = 0; ns.connect(bp); bp.connect(ng); ng.connect(out); // breath of the exhaust
    o.start(); sub.start(); lump.start(); return { o: o, sub: sub, lp: lp, pk: pk, g: g, lump: lump, lg: lg, bp: bp, ng: ng, rpm: 900, gear: 0, load: 0, thr0: 0, kind: '' }; }
  function squeal() { var o1 = A.createOscillator(), o2 = A.createOscillator(), j = A.createOscillator(), jg = A.createGain(), bp = A.createBiquadFilter(), g = A.createGain(), r = src(), rf = A.createBiquadFilter(), rg = A.createGain();
    o1.type = 'sawtooth'; o2.type = 'sawtooth'; o1.frequency.value = 880; o2.frequency.value = 1190; j.frequency.value = 13; jg.gain.value = 40; j.connect(jg); jg.connect(o1.frequency); jg.connect(o2.frequency);
    bp.type = 'bandpass'; bp.frequency.value = 1050; bp.Q.value = 5; o1.connect(bp); o2.connect(bp); rf.type = 'bandpass'; rf.frequency.value = 1400; rf.Q.value = 2; rg.gain.value = 0.35; r.connect(rf); rf.connect(rg); rg.connect(bp);
    var wob = src(), wl = A.createBiquadFilter(), wg2 = A.createGain(); wl.type = 'lowpass'; wl.frequency.value = 9; wg2.gain.value = 300; wob.connect(wl); wl.connect(wg2); wg2.connect(o1.detune); wg2.connect(o2.detune); // never a steady note
    g.gain.value = 0; bp.connect(g); g.connect(out); o1.start(); o2.start(); j.start(); return { g: g, o1: o1, o2: o2 }; }
  function nz(f, q, kind) { var s = src(), fl = A.createBiquadFilter(), g = A.createGain(); fl.type = kind || (f < 600 ? 'lowpass' : 'bandpass'); fl.frequency.value = f; fl.Q.value = q || 0.7; g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(out); return { s: s, f: fl, g: g }; }
  function brown(f) { var b = A.createBuffer(1, A.sampleRate * 3, A.sampleRate), d = b.getChannelData(0), l = 0; for (var i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; }
    var s = A.createBufferSource(); s.buffer = b; s.loop = true; s.start(); var fl = A.createBiquadFilter(), g = A.createGain(); fl.type = 'lowpass'; fl.frequency.value = f; g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(out); return { s: s, f: fl, g: g }; }
  // slow swells for the water and the crowd
  function swell(node, rate, depth) { var l = A.createOscillator(), lg = A.createGain(); l.frequency.value = rate; lg.gain.value = depth; l.connect(lg); lg.connect(node.g.gain); l.start(); }
  var water = brown(520), crowd = nz(900, 0.9), cr2 = src(), crl = A.createBiquadFilter(), crg = A.createGain(); crl.type = 'lowpass'; crl.frequency.value = 6; crg.gain.value = 0; cr2.connect(crl); crl.connect(crg); crg.connect(crowd.g.gain); // syllables
  var rain = nz(3200, 0.4, 'highpass'), rain2 = nz(900, 0.6), train = brown(160), whine = A.createOscillator(), wg = A.createGain(); whine.type = 'sine'; wg.gain.value = 0; whine.connect(wg); wg.connect(out); whine.start();
  swell(water, 0.23, 0.0);
  AMB = { A: A, out: out, src: src, me: eng(), them: [eng(), eng(), eng()], skid: squeal(), city: brown(280), room: brown(160), wind: nz(700, 0.5), water: water, crowd: crowd, crg: crg, rain: rain, rain2: rain2, train: train, whine: whine, wg: wg, nextEv: 0, nextThump: 0 }; return AMB; }
function setG(g, v, k) { g.gain.setTargetAtTime(v, AMB.A.currentTime, k || 0.08); }
function engPops(E, n) { var C = AMB.A, t = C.currentTime; for (var i = 0; i < n; i++) { var s = AMB.src(), f = C.createBiquadFilter(), g = C.createGain(), at = t + 0.05 + i * (0.05 + Math.random() * 0.12), v = 0.05 + Math.random() * 0.06;
    f.type = 'lowpass'; f.frequency.value = 900 + Math.random() * 900; g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(v, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05 + Math.random() * 0.05);
    s.connect(f); f.connect(g); g.connect(AMB.out); s.stop(at + 0.2); } }
function engDrive(E, v, isMe, near, dt) { var t = v.t || {}, kk = engKind(v), K = ENGK[kk], top = t.top || 40, sp = Math.abs(v.sp || 0), thr = isMe ? Math.max(0, v.thrIn || 0) : Math.min(1, 0.25 + sp / top * 0.6), now = AMB.A.currentTime;
  if (E.kind !== kk) { E.kind = kk; E.rpm = K.idle; E.gear = 0; }
  var gr = K.gr, last = gr.length - 1, Kf = 0.92 * K.red / (top * gr[last]), want;
  if (kk === 'fly' || kk === 'boat') want = K.idle + (K.red - K.idle) * Math.min(1, 0.15 + thr * 0.6 + sp / top * 0.35);
  else { var r = sp * gr[E.gear] * Kf; // up and down the box
    if (r > K.red * 0.9 && E.gear < last && thr > 0.25) { E.gear++; E.shift = 0.14; } else if (r < K.red * 0.38 && E.gear > 0) E.gear--;
    r = sp * gr[E.gear] * Kf; if (sp < 2.5) want = K.idle + thr * (K.red * 0.97 - K.idle); else want = Math.max(K.idle, r) * (1 + thr * 0.04); }
  if (v.dead) want = 0; var up = want > E.rpm, rate = up ? (sp < 2.5 ? 9000 : 5500) * (0.4 + thr) : 3800; E.rpm += Math.max(-rate * dt, Math.min(rate * dt, want - E.rpm));
  var limit = E.rpm > K.red * 0.965 && thr > 0.8; if (limit) E.rpm -= 350 * Math.random();
  E.load += ((thr > 0.05 ? 0.35 + thr * 0.65 : 0.08) - E.load) * Math.min(1, dt * 7);
  if (isMe && E.thr0 > 0.5 && thr < 0.1 && E.rpm > K.red * 0.55 && kk !== 'fly') engPops(E, 2 + Math.floor(Math.random() * 4)); E.thr0 = thr;
  var rn = (E.rpm - K.idle) / (K.red - K.idle), fire = Math.max(8, E.rpm / 60 * K.cyl / 2);
  E.o.frequency.setTargetAtTime(fire, now, 0.03); E.sub.frequency.setTargetAtTime(fire / 2, now, 0.03); E.lump.frequency.setTargetAtTime(fire / K.cyl * 2, now, 0.05); E.lg.gain.setTargetAtTime(K.lump * (1 - rn * 0.7), now, 0.1);
  E.lp.frequency.setTargetAtTime(220 + E.load * 1500 + rn * 2400, now, 0.04); E.pk.frequency.setTargetAtTime(K.pk + rn * 90, now, 0.1); E.bp.frequency.setTargetAtTime(fire * 3.2, now, 0.05);
  if (E.shift > 0) E.shift -= dt; var dip = E.shift > 0 ? 0.35 : 1, chop = limit && Math.random() < 0.5 ? 0.3 : 1;
  var vol = (isMe ? 0.028 + E.load * 0.045 + rn * 0.018 : 0.016 + rn * 0.012) * 1.5 * near * dip * chop; setG(E.g, v.dead ? 0 : vol, limit ? 0.01 : 0.04); setG({ gain: E.ng.gain }, (K.nz * E.load * (0.3 + rn)) * K.rasp * near * dip, 0.05); }
function ambStep(dt) { var A = ambInit(); if (!A || !G) return; dt = dt || 0.05; var play = G.mode === 'play' && P && !(KIT.menuOpen && KIT.menuOpen()) && !document.hidden, now = A.A.currentTime;
  var my = play && P.state === 'car' && P.veh && !P.veh.dead && P.veh.t && P.veh.t.cls !== 'board' ? P.veh : null;
  if (my) engDrive(A.me, my, true, 1, dt); else setG(A.me.g, 0, 0.15), setG({ gain: A.me.ng.gain }, 0, 0.15);
  var slip = 0; if (my && my.t.cls !== 'boat' && !my.air) { var fx = Math.sin(my.a), fz = Math.cos(my.a), ls = Math.abs(my.vx * fz - my.vz * fx); slip = Math.max(0, Math.min(1, (ls - 3) / 8)); if (my.handIn && Math.abs(my.sp) > 8) slip = Math.max(slip, 0.6); if ((my.brkIn || 0) > 0.5 && my.sp > 12) slip = Math.max(slip, 0.45 * Math.min(1, (my.sp - 12) / 12)); }
  setG(A.skid.g, slip * 0.035, 0.05); if (slip > 0) { A.skid.o1.frequency.setTargetAtTime(760 + slip * 260, now, 0.1); A.skid.o2.frequency.setTargetAtTime(1040 + slip * 300, now, 0.1); }
  var cars = play && !G.interior ? VEH.filter(function (v) { return v !== my && !v.dead && v.driver && Math.abs(v.sp || 0) > 0.5 && v.t && v.t.cls !== 'board' && dist2(v.x, v.z, P.x, P.z) < 50 * 50; }).sort(function (a, b) { return dist2(a.x, a.z, P.x, P.z) - dist2(b.x, b.z, P.x, P.z); }) : [];
  A.them.forEach(function (E, i) { var v = cars[i]; if (v) engDrive(E, v, false, Math.pow(Math.max(0, 1 - Math.sqrt(dist2(v.x, v.z, P.x, P.z)) / 50), 1.5), dt); else { setG(E.g, 0, 0.2); setG({ gain: E.ng.gain }, 0, 0.2); } });
  // the city around you
  var out = play && !G.interior, day = G.time > 7 && G.time < 20, night = G.time < 5.5 || G.time > 21, alt = out ? Math.max(0, Math.min(1, (P.y - groundY(P.x, P.z) - 12) / 40)) : 0, low = 1 - alt * 0.75;
  var busy = 0; if (out) VEH.forEach(function (v) { if (Math.abs(v.sp || 0) > 2 && dist2(v.x, v.z, P.x, P.z) < 120 * 120) busy++; });
  setG(A.city.g, out ? (0.025 + Math.min(1, busy / 14) * 0.04) * (day ? 1 : 0.6) * low : 0, 0.6); setG(A.wind.g, out ? 0.006 + alt * 0.03 : 0, 0.5); setG(A.room.g, play && G.interior ? 0.025 : 0, 0.5);
  // water lapping by the sea, the river and the docks
  var wet = 0; if (out) for (var k = 0; k < 8; k++) { var an = k / 8 * 6.283; [10, 22].forEach(function (rr) { if (isWaterK(kAt(P.x + Math.cos(an) * rr, P.z + Math.sin(an) * rr))) wet += rr === 10 ? 0.1 : 0.05; }); }
  setG(A.water.g, Math.min(1, wet) * 0.07 * low, 0.6);
  // people talking: more of them, louder; quieter at night
  var ppl = 0; if (out) PEDS.forEach(function (p) { if (!p.dead && !p.inside && dist2(p.x, p.z, P.x, P.z) < 22 * 22) ppl++; }); var cv = Math.min(1, ppl / 10) * (night ? 0.5 : 1) * low; setG(A.crowd.g, cv * 0.012, 0.8); A.crg.gain.setTargetAtTime(cv * 0.02, now, 0.8);
  // rain on everything
  var rv = out && (G.weather === 'rain' || G.weather === 'storm') ? (G.weather === 'storm' ? 1 : 0.65) : play && G.interior && (G.weather === 'rain' || G.weather === 'storm') ? 0.2 : 0;
  setG(A.rain.g, rv * 0.035, 1.2); setG(A.rain2.g, rv * 0.03, 1.2);
  // the Spuzzrail going past
  var tr = 0, tv = 0; if (out && window.SPZ && SPZ.trains) SPZ.trains.forEach(function (T) { try { var w = spzW(T.L, T.s, T.u), d = Math.hypot(w[0] - P.x, w[1] - P.z); var f = Math.max(0, 1 - d / 90) * Math.min(1, Math.abs(T.vs || 0) / 6); if (f > tr) { tr = f; tv = Math.abs(T.vs || 0); } } catch (e) {} });
  setG(A.train.g, tr * 0.09, 0.4); A.wg.gain.setTargetAtTime(tr * 0.006, now, 0.4); A.whine.frequency.setTargetAtTime(220 + tv * 28, now, 0.3);
  // a club's bass through the walls at night
  if (out && (night || G.time > 20) && now > A.nextThump) { var cl = ['club', 'tb', 'pulsar'].map(function (id) { var b = SHOPS[id] && SHOPS[id].b; return b ? Math.hypot((b.x0 + b.x1) / 2 - P.x, (b.z0 + b.z1) / 2 - P.z) : 999; }).sort(function (a, b) { return a - b; })[0];
    if (cl < 70) { var cv2 = (1 - cl / 70) * 0.09, C = A.A, tt = now + 0.05; for (var bt = 0; bt < 4; bt++) { var o = C.createOscillator(), g = C.createGain(), at = tt + bt * 0.5; o.frequency.setValueAtTime(110, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.12); g.gain.setValueAtTime(cv2, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22); o.connect(g); g.connect(A.out); o.start(at); o.stop(at + 0.25); } A.nextThump = now + 2; } else A.nextThump = now + 1; }
  if (out && now > A.nextEv) { A.nextEv = now + 5 + Math.random() * 10; ambEvent(A, day, night, wet > 0.2, low); } /* update 178: less often, never the same twice running */ }
function ambEvent(A, day, night, nearWater, low) { var C = A.A, pan = C.createStereoPanner ? C.createStereoPanner() : null, g0 = C.createGain(), lp = C.createBiquadFilter(); g0.gain.value = low * 0.5;
  if (pan) { pan.pan.value = Math.random() * 1.6 - 0.8; g0.connect(pan); pan.connect(A.out); } else g0.connect(A.out); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.connect(g0); // far away: soft at the top
  var K = SK(C, lp), r0 = Math.random, P0 = [['horn', 3], ['siren', 1.2], ['dog', 1.2], ['alarm', 0.5], ['moto', 1.2], ['plane', 0.5], ['heli', 0.5], ['slam', 1]];
  if (day) P0 = P0.concat([['birds', 2.5], ['pigeons', 1], ['build', 0.8]]); if (night) P0 = P0.concat([['crickets', 2], ['bottle', 0.6], ['owl', 0.4]]); if (nearWater && day) P0.push(['gulls', 3]); if (nearWater) P0.push(['bell', 0.6]); if (G.weather === 'storm') P0.push(['thunder', 3]);
  var tot = 0; P0.forEach(function (q) { tot += q[1]; }); var r = r0() * tot, k = 'horn'; for (var i = 0; i < P0.length; i++) { r -= P0[i][1]; if (r <= 0) { k = P0[i][0]; break; } }
  if (k === A.lastEv && r0() < 0.7) return; A.lastEv = k; // the same thing twice running is what sounds like a loop
  if (k === 'horn') { var f = 330 + r0() * 140, n = r0() < 0.6 ? 1 : 2; for (var h = 0; h < n; h++) { var d = 0.2 + r0() * 0.4; K.o('sawtooth', f, f, d, 0.06, h * 0.35, { f: 1300, q: 1.2, at: 0.02 }); K.o('sawtooth', f * 1.26, f * 1.26, d, 0.045, h * 0.35, { f: 1300, q: 1.2, at: 0.02 }); } }
  else if (k === 'siren') { var up = r0() < 0.5, v = 0.04 + r0() * 0.03, base = r0() < 0.5 ? 650 : 520; for (var j = 0; j < 6; j++) { var dp = up ? 1 + j * 0.015 : 1.08 - j * 0.015; K.o('sine', base * dp, base * 1.45 * dp, 0.5, v, j, { at: 0.1 }); K.o('sine', base * 1.45 * dp, base * dp, 0.5, v, j + 0.5, { at: 0.05 }); } }
  else if (k === 'dog') { var nb = 1 + Math.floor(r0() * 3), pf = 0.8 + r0() * 0.5; for (var b = 0; b < nb; b++) { var t0 = b * (0.32 + r0() * 0.15); K.n(0.14, 0.5, t0, { f: 650 * pf, f1: 420 * pf, q: 3, at: 0.01 }); K.n(0.1, 0.3, t0, { f: 1500 * pf, q: 4, at: 0.01 }); K.o('triangle', 380 * pf, 260 * pf, 0.12, 0.08, t0, { f: 900 }); } }
  else if (k === 'alarm') { for (var a2 = 0; a2 < 8; a2++) K.o('square', a2 % 2 ? 1200 : 850, a2 % 2 ? 850 : 1200, 0.3, 0.025, a2 * 0.32, { f: 1800 }); }
  else if (k === 'moto') { K.o('sawtooth', 70, 150, 1.4, 0.07, 0, { f: 700, vib: [28, 6], at: 0.3 }); K.o('sawtooth', 150, 110, 1.4, 0.06, 1.3, { f: 600, vib: [28, 5], at: 0.05 }); K.n(2.4, 0.1, 0, { f: 400, q: 1, at: 0.6 }); }
  else if (k === 'plane') { K.n(8, 0.35, 0, { type: 'lowpass', f: 300, at: 3 }); K.o('sawtooth', 75, 66, 8, 0.02, 0, { f: 250, at: 3 }); }
  else if (k === 'heli') { for (var c = 0; c < 46; c++) K.n(0.07, 0.25 * Math.sin(c / 46 * Math.PI), c * 0.085, { type: 'lowpass', f: 380 }); }
  else if (k === 'slam') { K.n(0.25, 0.6, 0, { type: 'lowpass', f: 220 }); K.n(0.04, 0.2, 0, { f: 1800, q: 1 }); }
  else if (k === 'birds') { lp.frequency.value = 9000; var nn = 3 + Math.floor(r0() * 5); for (var bb = 0; bb < nn; bb++) { var f2 = 2400 + r0() * 2200; K.o('sine', f2, f2 * (1.1 + r0() * 0.4), 0.06 + r0() * 0.06, 0.05, bb * (0.1 + r0() * 0.12)); } }
  else if (k === 'pigeons') { lp.frequency.value = 900; for (var pc = 0; pc < 2 + Math.floor(r0() * 2); pc++) { K.o('sine', 430, 360, 0.3, 0.08, pc * 0.7, { at: 0.06, vib: [24, 15] }); K.o('sine', 360, 420, 0.25, 0.06, pc * 0.7 + 0.32, { at: 0.04, vib: [24, 12] }); } }
  else if (k === 'build') { lp.frequency.value = 4000; var nh = 4 + Math.floor(r0() * 5); for (var hm = 0; hm < nh; hm++) { K.n(0.06, 0.3, hm * 0.45, { f: 2200, q: 3 }); K.o('triangle', 1760, 1700, 0.15, 0.015, hm * 0.45); K.n(0.05, 0.25, hm * 0.45, { type: 'lowpass', f: 300 }); } }
  else if (k === 'crickets') { lp.frequency.value = 8000; for (var q = 0; q < 3; q++) for (var cc = 0; cc < 4; cc++) K.o('sine', 4300, 4350, 0.03, 0.03, q * 0.55 + cc * 0.06); }
  else if (k === 'bottle') { lp.frequency.value = 9000; K.n(0.3, 0.3, 0, { type: 'highpass', f: 3500 }); for (var sh = 0; sh < 6; sh++) K.o('sine', 2500 + r0() * 3000, 2400 + r0() * 2500, 0.08, 0.03, 0.02 + sh * 0.05); }
  else if (k === 'owl') { lp.frequency.value = 900; K.o('sine', 390, 370, 0.4, 0.08, 0, { at: 0.08 }); K.o('sine', 380, 350, 0.6, 0.08, 0.7, { at: 0.1 }); }
  else if (k === 'gulls') { lp.frequency.value = 5000; for (var gl = 0; gl < 2 + Math.floor(r0() * 4); gl++) { var gf = 1100 + r0() * 400; K.o('sawtooth', gf, gf * 0.7, 0.25, 0.03, gl * 0.32, { type: 'bandpass', f: 1500, q: 2, at: 0.03 }); K.o('sine', gf * 1.5, gf, 0.22, 0.05, gl * 0.32, { at: 0.03 }); } }
  else if (k === 'bell') { lp.frequency.value = 4000; K.o('sine', 420, 420, 3, 0.08); K.o('sine', 1130, 1130, 1.5, 0.025); K.o('sine', 840, 840, 2, 0.03); }
  else if (k === 'thunder') { lp.frequency.value = 500; K.n(4, 0.9, 0, { type: 'lowpass', f: 140, at: 0.05 }); K.n(2.5, 0.5, 0.3, { type: 'lowpass', f: 260 }); } }
(function () { var sv = stepVehicle; stepVehicle = function (v, inp, dt) { if (inp) { v.thrIn = inp.thr || 0; v.handIn = !!inp.hand; v.brkIn = inp.brk || 0; } return sv.apply(this, arguments); };
  var last = 0; setInterval(function () { try { var n = performance.now(), d = last ? Math.min(0.2, (n - last) / 1000) : 0.05; last = n; ambStep(d); } catch (e) { if (!window.__ambE) { window.__ambE = 1; console.warn(e); } } }, 50); })();
/* ---------------- bubbles and subtitles ---------------- */
var BUBF = '600 10px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
function drawBubble(said, sx, sy) { var ctx = KIT.ctx; ctx.save(); ctx.font = BUBF; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; var L = [], line = '';
  String(said).split(' ').forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > 170 && line) { L.push(line); line = w; } else line = t; }); L.push(line);
  var w = 0; L.forEach(function (l) { w = Math.max(w, ctx.measureText(l).width); }); w += 12; var lh = 12, h = L.length * lh + 6, x = Math.round(Math.max(4, Math.min(KIT.W - w - 4, sx - w / 2))), y = Math.round(Math.max(4, sy - h - 6)); sx = Math.max(x + 8, Math.min(x + w - 8, sx));
  ctx.fillStyle = 'rgba(241,231,208,0.97)'; ctx.strokeStyle = '#12040a'; ctx.lineWidth = 1; ctx.beginPath(); var r = 4; ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(sx + 4, y + h); ctx.lineTo(sx, y + h + 5); ctx.lineTo(sx - 4, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#12040a'; L.forEach(function (l, i) { ctx.fillText(l, Math.round(x + w / 2 - ctx.measureText(l).width / 2), y + 4 + i * lh); }); ctx.restore(); }
function subLine(l, who, x, y, size) { if (who && l.indexOf(who) === 0) { tx(who, x, y, { col: '#ffe36a', size: size }); tx(l.slice(who.length), x + tw2(who, size), y, { col: '#f1e7d0', size: size }); } else tx(l, x, y, { col: '#f1e7d0', size: size }); }
/* ---------------- full screen ---------------- */
function fullOn() { try { return localStorage.getItem('hs-fullscreen') === '1'; } catch (e) { return false; } }
function fullSet(on) { try { localStorage.setItem('hs-fullscreen', on ? '1' : '0'); } catch (e) {} try { if (parent && parent !== window && parent.hsFull) parent.hsFull(on, true); } catch (e) {} }
(function () { function poke() { if (!fullOn()) return; try { if (parent && parent !== window && parent.hsFull) parent.hsFull(true, false); } catch (e) {} }
  poke(); ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { document.addEventListener(ev, poke, true); }); })();
sndApply();
