/* =====================================================================================================
   VOICES (his ask: TB needs a voice). Two ways, picked in Options (TB'S VOICE):
   SPOKEN: the device reads his line out loud in the deepest, slowest voice it has (speechSynthesis: works on the PC;
           many phone web views have no speech, and then it falls back to the growl), with a growl under it.
   GROWL:  our own synth talks in his rhythm: a low, gravelly buzz pushed through vowel formants syllable by
           syllable, hissed consonants, a wet laugh at the end. Works everywhere.
   The henchmen get the growl, each at their own pitch.
   ===================================================================================================== */
var VOICES = {
  TB: { f: 92, jit: 0.22, rate: 1, grit: 2.4, laugh: 0.45, speech: 1 },
  'Mama Muckies': { f: 150, jit: 0.4, rate: 0.85, grit: 1.4, laugh: 0, wah: 1 },
  'The Stitched Stag': { f: 70, jit: 0.6, rate: 0.7, grit: 4, laugh: 0, scream: 1 },
  'The Smiles Twins': { f: 210, jit: 0.3, rate: 1.25, grit: 1.2, laugh: 0.8, twin: 1 },
  'The Gravedigger Bride': { f: 240, jit: 0.15, rate: 0.75, grit: 0.8, laugh: 0, breath: 1 },
  'The Sissifier': { f: 175, jit: 0.25, rate: 1.05, grit: 1.6, laugh: 0.4 }
};
var FORM = { a: [800, 1200], e: [450, 1900], i: [320, 2300], o: [480, 820], u: [340, 760], y: [320, 2100] };
function voiceMode() { return SV.voice || 'spoken'; }
function canSpeak() { try { return !!(window.speechSynthesis && window.SpeechSynthesisUtterance && speechSynthesis.getVoices().length); } catch (e) { return false; } }
var SPEECHV = null;
function speakLine(s) {
  try { var vs = speechSynthesis.getVoices(); if (!SPEECHV) SPEECHV = vs.filter(function (v) { return /^en/i.test(v.lang) && /male|david|george|mark|daniel|fred|guy|ryan|thomas|james/i.test(v.name) && !/female|zira|hazel|susan|samantha|karen/i.test(v.name); })[0] || vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || vs[0];
    speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(s.replace(/\.\.\./g, ', ')); u.voice = SPEECHV; u.pitch = 0.05; u.rate = 0.82; u.volume = sfx.muted ? 0 : 1; speechSynthesis.speak(u); return true; } catch (e) { return false; }
}
function growl(s, V, vol) {
  var au = sfx.audio && sfx.audio(); if (!au || sfx.muted) return; var A = au.ctx, out = au.master, t0 = A.currentTime + 0.02;
  // a shared grit (distortion) and a short dirty echo
  var sh = A.createWaveShaper(), cv = new Float32Array(256); for (var i = 0; i < 256; i++) { var x = i / 128 - 1; cv[i] = Math.tanh(x * V.grit); } sh.curve = cv;
  var g = A.createGain(); g.gain.value = vol || 0.5; var dl = A.createDelay(); dl.delayTime.value = 0.11; var fb = A.createGain(); fb.gain.value = 0.25; sh.connect(g); g.connect(out); g.connect(dl); dl.connect(fb); fb.connect(dl); fb.connect(out);
  var words = s.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean), t = t0, n = 0, sylT = 0.12 / V.rate;
  words.forEach(function (w) {
    var syl = w.match(/[^aeiouy]*[aeiouy]+[^aeiouy]*/g) || [w];
    syl.forEach(function (sy, k) { if (n > 60) return; n++;
      var vw = (sy.match(/[aeiouy]/) || ['a'])[0], F = FORM[vw], len = sylT * (0.8 + Math.min(4, sy.length) * 0.15), f = V.f * (1 + (Math.random() - 0.5) * V.jit) * (k === 0 ? 1.08 : 1);
      if (/^[sfzcxh]/.test(sy) || /(sh|ss|ck|tt|k)$/.test(sy)) noiseAt(A, au.nb, g, t, 0.05, 0.25, /^[sfzcx]/.test(sy) ? 4200 : 1800);
      var o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * (0.86 + Math.random() * 0.1), t + len);
      var lfo = A.createOscillator(), lg = A.createGain(); lfo.frequency.value = 6 + Math.random() * 3; lg.gain.value = f * 0.04; lfo.connect(lg); lg.connect(o.frequency);
      var env = A.createGain(); env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(1, t + 0.02); env.gain.setValueAtTime(1, t + len * 0.7); env.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(env); [F[0], F[1], 2600].forEach(function (ff, m) { var bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff * (V.f > 180 ? 1.15 : 1); bp.Q.value = m === 2 ? 3 : 7; var bg = A.createGain(); bg.gain.value = m === 0 ? 1.6 : m === 1 ? 0.9 : 0.25; env.connect(bp); bp.connect(bg); bg.connect(sh); });
      if (V.twin) { var o2 = A.createOscillator(); o2.type = 'square'; o2.frequency.value = f * 1.5; var e2 = A.createGain(); e2.gain.setValueAtTime(0.0001, t); e2.gain.exponentialRampToValueAtTime(0.25, t + 0.02); e2.gain.exponentialRampToValueAtTime(0.0001, t + len); o2.connect(e2); e2.connect(sh); o2.start(t); o2.stop(t + len + 0.02); }
      o.start(t); lfo.start(t); o.stop(t + len + 0.02); lfo.stop(t + len + 0.02); t += len + 0.015;
    }); t += 0.07 / V.rate; });
  if (V.breath) noiseAt(A, au.nb, g, t, 0.5, 0.15, 900);
  if (V.scream) { var o3 = A.createOscillator(); o3.type = 'sawtooth'; o3.frequency.setValueAtTime(420, t); o3.frequency.exponentialRampToValueAtTime(140, t + 0.8); var e3 = A.createGain(); e3.gain.setValueAtTime(0.5, t); e3.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); o3.connect(e3); e3.connect(sh); o3.start(t); o3.stop(t + 0.85); }
  if (V.laugh && Math.random() < V.laugh) for (var h = 0; h < 4; h++) { var lt = t + h * 0.14, lf = V.f * 1.6 - h * 6, lo = A.createOscillator(), le = A.createGain(); lo.type = 'sawtooth'; lo.frequency.setValueAtTime(lf, lt); lo.frequency.exponentialRampToValueAtTime(lf * 0.8, lt + 0.1); le.gain.setValueAtTime(0.8, lt); le.gain.exponentialRampToValueAtTime(0.0001, lt + 0.11); var lb = A.createBiquadFilter(); lb.type = 'bandpass'; lb.frequency.value = 700; lb.Q.value = 4; lo.connect(le); le.connect(lb); lb.connect(sh); lo.start(lt); lo.stop(lt + 0.12); }
}
function noiseAt(A, nb, dest, t, dur, vol, freq) { var s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); s.buffer = nb; f.type = 'bandpass'; f.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02); }
/* RECORDED LINES: real voice files win over everything. www/games/pn-voice/voices.js (written by
   tools/psycho-voice/make.py from the recordings) sets window.PNVOICE = { id: 'pn-voice/<id>.mp3' }. The ids:
   TB's quotes tb01..tb22 in TBQUOTES order, tbend, tbwoods, tbkid ('just kidding bro'), and each henchman's
   <key>_wake / <key>_p2 / <key>_die, plus sissifier_pretty. A line with no file falls back to the settings below. */
(function () { try { var s = document.createElement('script'); s.src = 'pn-voice/voices.js'; s.onerror = function () {}; document.head.appendChild(s); } catch (e) {} })();
function voiceId(who, s) {
  if (who === 'TB') { var i = TBQUOTES.indexOf(s); if (i >= 0) return 'tb' + ('0' + (i + 1)).slice(-2); if (s === TBEND) return 'tbend'; if (s === TBWOODS) return 'tbwoods'; if (s === 'just kidding bro') return 'tbkid'; return null; }
  for (var k in HENCH) { var H = HENCH[k]; if (FOES[k].n !== who) continue; if (s === H.wake) return k + '_wake'; if (s === H.p2) return k + '_p2'; if (s === H.die) return k + '_die'; if (k === 'sissifier' && /^Pretty/.test(s)) return 'sissifier_pretty'; }
  return null;
}
var VOICEAUD = null;
function playRecorded(who, s) {
  var id = voiceId(who, s), map = window.PNVOICE; if (!id || !map || !map[id] || sfx.muted) return false;
  try { if (VOICEAUD) { VOICEAUD.pause(); } var a = VOICEAUD = new Audio(map[id]); a.volume = 1; var pr = a.play(); if (pr && pr.catch) pr.catch(function () {}); return true; } catch (e) { return false; }
}
/* who says it decides how it sounds */
function voice(who, s) {
  var m = voiceMode(), V = VOICES[who]; if (!V || m === 'off' || !s) return;
  if (playRecorded(who, s)) return;
  if (V.speech && m === 'spoken' && canSpeak() && speakLine(s)) { growl(s, V, 0.12); return; }
  growl(s, V, 0.55);
}
function voiceItem(back) { var m = voiceMode(), lab = { spoken: 'SPOKEN', growl: 'GROWL', off: 'OFF' }; return { label: "TB'S VOICE: " + lab[m], fn: function () { SV.voice = m === 'spoken' ? 'growl' : m === 'growl' ? 'off' : 'spoken'; persist(); voice('TB', 'who is ready for shithead pudding'); back(); } }; }
try { if (window.speechSynthesis) speechSynthesis.getVoices(); } catch (e) {}
