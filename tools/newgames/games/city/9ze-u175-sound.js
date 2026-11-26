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
  AudioNode.prototype.connect = function (d) { var a = sfx.audio && sfx.audio(); if (a && d === a.master && !(this instanceof DynamicsCompressorNode) && this !== SFXG) { if (!SFXG) { SFXG = a.ctx.createGain(); SFXG.gain.value = SND.sfx; oc.call(SFXG, a.master); } arguments[0] = SFXG; } return oc.apply(this, arguments); }; })();
// voices: recorded lines, street barks and the radio DJ follow their volumes; so does the phone's own speech
(function () { var pf = playFile; playFile = function (src, vol, slot) { return pf(src, vol * (slot === 'radio' ? sndV('radio') : sndV('voice')), slot); };
  if (window.speechSynthesis) { var sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = function (u) { try { u.volume = (u.volume === undefined ? 1 : u.volume) * sndV('voice'); } catch (e) {} return sp(u); }; }
  // Cumhead's lines with no recording: a man's voice from the phone's own voices
  var sk = speak; speak = function (text, st) { if (!(st && st.id === 'cumhead') || !window.speechSynthesis || SV.radioMute) return sk(text, st);
    try { var u = new SpeechSynthesisUtterance(text), vs = speechSynthesis.getVoices().filter(function (v) { return /^en/i.test(v.lang); }), m = vs.filter(function (v) { return /\bmale\b|david|daniel|george|guy|mark|james|ryan|thomas|arthur|oliver|fred|alex\b|rishi|aaron|gordon/i.test(v.name) && !/female/i.test(v.name); });
      u.voice = m[0] || vs[0] || null; u.pitch = m[0] ? 1 : 0.6; u.rate = 1; u.volume = 0.9; speechSynthesis.speak(u); return 1; } catch (e) { return 0; } };
})();
// the DJ under a line, at the radio volume
setInterval(function () { try { if (VOX.radio) { var v = (VOX.line && !VOX.line.paused && !VOX.line.ended ? 0.25 : 0.95) * sndV('radio'); if (Math.abs(VOX.radio.volume - v) > 0.02) VOX.radio.volume = v; } } catch (e) {} }, 200);
/* ---------------- engines, tyres, the city ---------------- */
var AMB = null;
function ambInit() { var a = sfx.audio && sfx.audio(); if (!a || AMB) return AMB; var A = a.ctx, out = A.createGain(); out.gain.value = 1; out.connect(a.master);
  function eng() { var o1 = A.createOscillator(), o2 = A.createOscillator(), o3 = A.createOscillator(), lp = A.createBiquadFilter(), g = A.createGain(), ws = A.createWaveShaper(), c = new Float32Array(128);
    for (var i = 0; i < 128; i++) { var x = i / 64 - 1; c[i] = Math.tanh(x * 3); } ws.curve = c; o1.type = 'sawtooth'; o2.type = 'square'; o3.type = 'sine'; o2.detune.value = 7;
    var g1 = A.createGain(), g2 = A.createGain(), g3 = A.createGain(); g1.gain.value = 0.5; g2.gain.value = 0.35; g3.gain.value = 0.9; o1.connect(g1); o2.connect(g2); o3.connect(g3); g1.connect(ws); g2.connect(ws); g3.connect(ws);
    lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 2.5; ws.connect(lp); lp.connect(g); g.gain.value = 0; g.connect(out); o1.start(); o2.start(); o3.start(); return { o1: o1, o2: o2, o3: o3, lp: lp, g: g, rpm: 0.2 }; }
  function nz(type, f, q) { var s = A.createBufferSource(), b = A.createBuffer(1, A.sampleRate * 2, A.sampleRate), d = b.getChannelData(0), last = 0; for (var i = 0; i < d.length; i++) { var w = Math.random() * 2 - 1; last = type === 'brown' ? (last + 0.02 * w) / 1.02 : w; d[i] = type === 'brown' ? last * 3.5 : w; }
    s.buffer = b; s.loop = true; var fl = A.createBiquadFilter(), g = A.createGain(); fl.type = f < 600 ? 'lowpass' : 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 0.7; g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(out); s.start(); return { s: s, f: fl, g: g }; }
  AMB = { A: A, out: out, me: eng(), them: [eng(), eng()], skid: nz('white', 1900, 3), city: nz('brown', 280, 0.6), room: nz('brown', 160, 0.5), wind: nz('white', 700, 0.5), nextEv: 0 }; return AMB; }
function setG(g, v, k) { g.gain.setTargetAtTime(v, AMB.A.currentTime, k || 0.08); }
function engDrive(E, v, isMe, near) { var t = v.t || {}, cl = t.cls, top = t.top || 40, s = Math.min(1.2, Math.abs(v.sp || 0) / top), thr = isMe ? (v.thrIn || 0) : 0.4, bike = cl === 'bike', boat = cl === 'boat', fly = cl === 'heli' || cl === 'plane';
  // a five-gear box: the revs climb through each gear and drop at the change; foot down while still = a rev
  var gears = boat || fly ? 1 : 5, gp = s * gears, gi = Math.min(gears - 1, Math.floor(gp)), fr = gp - gi, want = gears === 1 ? 0.25 + s * 0.7 : 0.28 + fr * 0.62 + gi * 0.03;
  if (thr > 0.1 && s < 0.08) want = 0.35 + thr * 0.55; if (v.dead) want = 0;
  E.rpm += (want - E.rpm) * (want > E.rpm ? 0.25 : 0.12); var base = bike ? 70 : boat ? 42 : fly ? 30 : t.top > 55 ? 48 : t.cls === 'car' && (t.hgt || 1.4) > 1.8 ? 30 : 38, f = base + E.rpm * base * 2.6, now = AMB.A.currentTime;
  E.o1.frequency.setTargetAtTime(f, now, 0.05); E.o2.frequency.setTargetAtTime(f * 0.5, now, 0.05); E.o3.frequency.setTargetAtTime(f * 0.5, now, 0.05); E.lp.frequency.setTargetAtTime(300 + E.rpm * 1400 + thr * 500, now, 0.06);
  var vol = (isMe ? 0.03 + thr * 0.035 + E.rpm * 0.02 : 0.02) * near; setG(E.g, v.dead ? 0 : vol, 0.06); }
function ambStep() { var A = ambInit(); if (!A || !G) return; var play = G.mode === 'play' && P && !(KIT.menuOpen && KIT.menuOpen()) && !document.hidden, now = A.A.currentTime;
  var my = play && P.state === 'car' && P.veh && !P.veh.dead && P.veh.t && P.veh.t.cls !== 'board' ? P.veh : null;
  if (my) engDrive(A.me, my, true, 1); else setG(A.me.g, 0, 0.15);
  // tyres: sliding sideways or the handbrake at speed, on the road
  var slip = 0; if (my && my.t.cls !== 'boat' && !my.air) { var fx = Math.sin(my.a), fz = Math.cos(my.a), ls = Math.abs(my.vx * fz - my.vz * fx); slip = Math.max(0, Math.min(1, (ls - 3) / 8)); if (my.handIn && Math.abs(my.sp) > 8) slip = Math.max(slip, 0.6); }
  setG(A.skid.g, slip * 0.06, 0.05);
  // the two nearest cars somebody else is driving
  var cars = play && !G.interior ? VEH.filter(function (v) { return v !== my && !v.dead && v.driver && Math.abs(v.sp || 0) > 0.5 && v.t && v.t.cls !== 'board' && dist2(v.x, v.z, P.x, P.z) < 45 * 45; }).sort(function (a, b) { return dist2(a.x, a.z, P.x, P.z) - dist2(b.x, b.z, P.x, P.z); }) : [];
  A.them.forEach(function (E, i) { var v = cars[i]; if (v) engDrive(E, v, false, Math.max(0, 1 - Math.sqrt(dist2(v.x, v.z, P.x, P.z)) / 45)); else setG(E.g, 0, 0.2); });
  // the city: a rumble of traffic (more by day, in the middle of town), wind up high, a room tone indoors
  var out = play && !G.interior, day = G.time > 7 && G.time < 20 ? 1 : 0.55, alt = out ? Math.max(0, Math.min(1, (P.y - groundY(P.x, P.z) - 12) / 40)) : 0;
  setG(A.city.g, out ? 0.05 * day * (1 - alt * 0.7) : 0, 0.5); setG(A.wind.g, out ? 0.006 + alt * 0.03 : 0, 0.5); setG(A.room.g, play && G.interior ? 0.025 : 0, 0.5);
  if (out && now > A.nextEv) { A.nextEv = now + 4 + Math.random() * 9; ambEvent(A, G.time > 6 && G.time < 20); } }
function ambEvent(A, day) { var C = A.A, t = C.currentTime, pan = C.createStereoPanner ? C.createStereoPanner() : null, g = C.createGain(); if (pan) { pan.pan.value = Math.random() * 1.6 - 0.8; g.connect(pan); pan.connect(A.out); } else g.connect(A.out);
  function o(type, f0, f1, t0, d, v) { var x = C.createOscillator(), e = C.createGain(); x.type = type; x.frequency.setValueAtTime(f0, t + t0); x.frequency.linearRampToValueAtTime(f1, t + t0 + d); e.gain.setValueAtTime(0.0001, t + t0); e.gain.linearRampToValueAtTime(v, t + t0 + Math.min(0.03, d / 4)); e.gain.setValueAtTime(v, t + t0 + d * 0.8); e.gain.linearRampToValueAtTime(0.0001, t + t0 + d); x.connect(e); e.connect(g); x.start(t + t0); x.stop(t + t0 + d + 0.05); }
  var lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; var g2 = g; g = C.createGain(); g.connect(lp); lp.connect(g2);
  var r = Math.random(), k = day ? (r < 0.3 ? 'horn' : r < 0.45 ? 'siren' : r < 0.6 ? 'dog' : r < 0.85 ? 'birds' : 'horn') : (r < 0.3 ? 'horn' : r < 0.5 ? 'siren' : r < 0.65 ? 'dog' : 'crickets');
  if (k === 'horn') { var f = 330 + Math.random() * 120, n = Math.random() < 0.5 ? 1 : 2; for (var i = 0; i < n; i++) { o('square', f, f, i * 0.32, 0.22 + Math.random() * 0.3, 0.012); o('square', f * 1.26, f * 1.26, i * 0.32, 0.22, 0.008); } }
  else if (k === 'siren') { for (var j = 0; j < 4; j++) { o('sine', 650, 950, j * 1.1, 0.55, 0.008); o('sine', 950, 650, j * 1.1 + 0.55, 0.55, 0.008); } }
  else if (k === 'dog') { lp.frequency.value = 1200; for (var b = 0; b < 2 + Math.floor(Math.random() * 3); b++) { o('sawtooth', 520, 260, b * 0.38, 0.12, 0.016); o('square', 300, 180, b * 0.38, 0.1, 0.01); } }
  else if (k === 'birds') { lp.frequency.value = 8000; for (var c = 0; c < 5; c++) { var f2 = 2600 + Math.random() * 1600; o('sine', f2, f2 * 1.35, c * 0.17, 0.08, 0.01); } }
  else { lp.frequency.value = 6000; for (var q = 0; q < 14; q++) o('sine', 4400, 4500, q * 0.11, 0.045, 0.006); } }
(function () { var sv = stepVehicle; stepVehicle = function (v, inp, dt) { if (inp) { v.thrIn = inp.thr || 0; v.handIn = !!inp.hand; } return sv.apply(this, arguments); };
  setInterval(function () { try { ambStep(); } catch (e) { if (!window.__ambE) { window.__ambE = 1; console.warn(e); } } }, 50); })();
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
