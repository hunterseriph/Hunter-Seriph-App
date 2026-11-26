/* ---------- update 176 (his ask: the radio stations play all the time, so getting in a car tunes in to whatever is on
   right now instead of starting it again; and you can hear the car's radio very faintly from outside the car).
   - Every station runs on its own clock (real time) whether anyone is listening or not: songs, the DJ, adverts, news.
     Tuning in drops you into the middle of whatever is on, at the right point in it (his songs, the made-up songs and
     the recorded talk all pick up part-way through).
   - The Shot Rope gig (TB at the docks) still puts Shot Rope on Brothers Load Radio there and then.
   - Get out of a car with the radio on and it keeps playing in the car: faint, fading out as you walk away (gone by
     about 30 m). Get back in and it comes up to full again; any other car tunes in to the same station live.
   - The song lengths are in ccn-radio/radio.js (CCNRADIO_DUR) and the recorded lines' lengths in ccn-voice/durs.js. ---------- */
var LIVE = {}, RADF = 1;
(function () { var s = document.createElement('script'); s.src = 'ccn-voice/durs.js'; s.onerror = function () {}; document.head.appendChild(s); })();
function liveNow() { return Date.now() / 1000; }
function liveSongName(st, id) { return (music.songs && music.songs[id] && music.songs[id].name ? music.songs[id].name : ({ castle: 'Castle Gates', boss: 'Boss Door', roof: 'Over the Rooftops', town: 'Town Square Two-Step', park: 'Ejaculand Waltz' }[id] || id)) + ' · ' + ({ hs: 'Hunter Seriph', bl: 'Brothers Load', po: 'PulsarOctopus' }[st.id] || ''); }
function liveLineDur(who, s) { var k = voiceKey(who, s), f = voiceFile(who, s); if (!f) return Math.max(3, s.length * 0.06); var d = window.CCNVDUR && CCNVDUR[k]; return (d || s.length * 0.08 + 0.6) + 0.5; }
// the next thing on a station (nothing is played here: this is only the schedule)
function liveGen(L, st) { var real = radReal(st); if (real && st.songs && st.songs.length) st.songs = []; // his own songs only on his stations
  L.count = (L.count || 0) + 1;
  if (st.id === 'talk' || L.count % 2 === 0) { var parts = radioTalkSeg(st), at = 0.3, P0 = [];
    parts.forEach(function (p) { var d = p.sfx ? p.t : liveLineDur(p.who, p.s); P0.push({ sfx: p.sfx, who: p.who, s: p.s, at: at, d: d }); at += d; });
    var bed = parts.bed && st.songs.length ? radioDeal('bed' + st.id, st.songs) : parts.bed && st.id === 'talk' ? pick(['town', 'park', 'roof']) : null;
    return { k: 'talk', parts: P0, bed: bed, dur: at + 0.4 }; }
  if (real) { var src = radioDeal('real' + st.id, real); return { k: 'real', src: src, dur: (window.CCNRADIO_DUR && CCNRADIO_DUR[src]) || 200 }; }
  if (!st.songs.length) return { k: 'talk', parts: [], dur: 5 };
  return { k: 'song', id: radioDeal('song' + st.id, st.songs), dur: rnd(70, 110), jingle: Math.random() < 0.6 }; }
function liveGet(st) { var now = liveNow(), L = LIVE[st.id];
  if (!L) { L = LIVE[st.id] = { count: Math.floor(Math.random() * 2) }; L.item = liveGen(L, st); L.start = now - Math.random() * L.item.dur * 0.85; } // you join every station part-way through something
  var n = 0; while (now >= L.start + L.item.dur && n++ < 400) { L.start += L.item.dur; L.item = liveGen(L, st); }
  if (now - L.start > L.item.dur) L.start = now; return L; }
var LBLOB = { src: null, url: null };
function liveBlob(src, cb) { if (LBLOB.src === src && LBLOB.url) { cb(LBLOB.url); return; }
  fetch(src).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (b) { if (LBLOB.url) try { URL.revokeObjectURL(LBLOB.url); } catch (e) {} LBLOB.src = src; LBLOB.url = URL.createObjectURL(b); cb(LBLOB.url); }).catch(function () { cb(src); }); }
function liveStop() { var Q = RAD.playing; RAD.playing = null; if (RAD.audio) { RAD.audio.onended = null; RAD.audio.pause(); RAD.audio = null; } if (VOX.radio) { VOX.radio.pause(); VOX.radio = null; } if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  RAD.bedOn = 0; G.radioLine = null; return Q; }
function liveStart(st, L, tuned) { var it = L.item, off = Math.max(0, liveNow() - L.start), Q = RAD.playing = { st: st.id, item: it, done: {} };
  if (it.k === 'real') { try { music.stop(); } catch (e) {} var M = (window.CCNRADIO_META || {})[it.src] || {}, a = RAD.audio = new Audio(); a.volume = radVol() * RADF;
    // the song is read in whole first (a blob), so it can be joined part-way through on the phone and the PC alike
    var go = function (url) { if (RAD.audio !== a) return; a.src = url; var seek = function () { try { var o = liveNow() - L.start; if (o > 0.5) a.currentTime = Math.min(o, Math.max(0, (a.duration || it.dur) - 1)); } catch (e) {} };
      a.addEventListener('loadedmetadata', seek); a.play().catch(function () {}); };
    liveBlob(it.src, go);
    a.onerror = function () { if (RAD.audio === a && a.src) L.item.dur = Math.max(1, liveNow() - L.start + 0.5); };
    G.radioSong = (M.t || it.src.split('/').pop()) + ' · ' + (M.by || ({ hs: 'Hunter Seriph', bl: 'Brothers Load', po: 'PulsarOctopus' }[st.id] || '')) + (M.a ? ' · ' + M.a : ''); G.radioArt = M.art || null; radArt(G.radioArt); }
  else if (it.k === 'song') { if (it.jingle && off < 0.5 && RADF > 0.5) sfx.play('r_id_' + st.id); try { music.play(it.id); if (music.seek) music.seek(off); } catch (e) {} G.radioSong = liveSongName(st, it.id); G.radioArt = null; }
  else { if (it.bed) { try { music.play(it.bed); if (music.seek) music.seek(off); } catch (e) {} RAD.bedOn = 1; } else { try { music.stop(); } catch (e) {} } G.radioSong = st.tag || null; G.radioArt = null;
    it.parts.forEach(function (p, i) { if (p.at + p.d <= off) Q.done[i] = 1; }); } // what was said before you tuned in is gone
  G.radioName = st.name; G.radioT = tuned ? 4 : 6; duckApply(); }
// the talk: each line when its time comes; a line already under way when you tune in starts at that point
function liveTalk(st, L) { var Q = RAD.playing, off = liveNow() - L.start; if (!Q || Q.item.k !== 'talk') return;
  Q.item.parts.forEach(function (p, i) { if (Q.done[i] || off < p.at) return; Q.done[i] = 1; var into = off - p.at;
    if (p.sfx) { if (into < 0.4 && RADF > 0.5) sfx.play(p.sfx); return; }
    var ok = radioSay(p.who, p.s); if (ok && VOX.radio) { if (into > 0.4) { var a = VOX.radio; var sk = function () { try { a.currentTime = into; } catch (e) {} }; a.addEventListener('loadedmetadata', sk); sk(); } }
    else if (RADF > 0.5) G.radioLine = { who: st.dj || 'Radio', s: p.s, t: Math.max(1.5, p.d - into) }; }); }
// tuning in (getting in, changing station, a phone or house radio): pick up whatever the station is doing now
radioNextSeg = function () { var st = STATIONS[RAD.st];
  if (RAD.forced) { var f = RAD.forced, bi = STATIONS.map(function (q) { return q.id; }).indexOf('bl'); RAD.forced = null; if (bi >= 0) { RAD.st = bi; SV.radio = bi; st = STATIONS[bi]; }
    var SR = 'ccn-radio/bl/shot-rope.mp3', L = liveGet(st), real = window.CCNRADIO && CCNRADIO.bl && CCNRADIO.bl.indexOf(SR) >= 0;
    L.item = real ? { k: 'real', src: SR, dur: (window.CCNRADIO_DUR && CCNRADIO_DUR[SR]) || 200 } : { k: 'song', id: f, dur: 150 }; L.start = liveNow(); liveStop(); liveStart(st, L, false); RAD.seg = null; return; }
  RAD.seg = null; if (!RAD.on || !st || st.id === 'off') { liveStop(); G.radioSong = null; G.radioArt = null; try { music.stop(); } catch (e) {} return; }
  var L = liveGet(st); if (RAD.playing && RAD.playing.st === st.id && RAD.playing.item === L.item) { G.radioName = st.name; G.radioT = 3; return; } // already on: carry on
  liveStop(); liveStart(st, L, true); };
duckApply = function () { var talk = DUCK.line || DUCK.bark, radioTalk = DUCK.radio, bed = RAD.bedOn && RAD.playing && RAD.playing.item.k === 'talk';
  try { if (music.duck) music.duck((talk ? 0.35 : radioTalk ? (bed ? 0.3 : 0.45) : bed ? 0.5 : 1) * (RAD.on ? RADF : 1)); } catch (e) {} };
function liveStep(dt) { var st = STATIONS[RAD.st]; if (!RAD.on || !st || st.id === 'off') return; var L = liveGet(st);
  if (!RAD.playing || RAD.playing.item !== L.item || RAD.playing.st !== st.id) { liveStop(); liveStart(st, L, false); }
  liveTalk(st, L); var a = RAD.audio; if (a) { var v = radVol() * RADF; if (Math.abs(a.volume - v) > 0.01) a.volume = v;
    // keep the song where the station is (a file that could not be jumped into until it had loaded, or after a pause)
    if (RAD.playing && RAD.playing.item.k === 'real' && !a.seeking && a.readyState >= 2) { var want = liveNow() - L.start; if (Math.abs(a.currentTime - want) > 3 && want < (a.duration || 1e9) - 1) { try { var sk = a.seekable; if (sk.length && sk.end(sk.length - 1) >= want) a.currentTime = want; } catch (e) {} } } } }
(function () {
  var ro = radioOn; radioOn = function (v) { var wasOn = RAD.on; RAD.car = v && VEH.indexOf(v) >= 0 ? v : null; if (wasOn && RAD.playing) { RADF = 1; duckApply(); } return ro.apply(this, arguments); };
  var rf = radioOff; radioOff = function () { RAD.car = null; RADF = 1; liveStop(); var r = rf.apply(this, arguments); duckApply(); return r; };
  var rn = radioNext; radioNext = function () { liveStop(); return rn.apply(this, arguments); };
  var sr = stepRadio; stepRadio = function (dt) {
    // out of the car with its radio still on: faint, fading as you walk away
    if (RAD.on && RAD.car && P && P.state !== 'car' && !G.interior && !G.partyRadio && !G.pulsarRadio && !G.homeRadio) { var c = RAD.car, d = Math.hypot(c.x - P.x, c.z - P.z);
      if (c.dead || VEH.indexOf(c) < 0 || d > 30 || G.mode !== 'play') { radioOff(); return; }
      var f = 0.16 * Math.pow(1 - d / 30, 1.4); if (Math.abs(f - RADF) > 0.01) { RADF = f; duckApply(); } RAD.seg = null; liveStep(dt); if (G.radioLine) { G.radioLine.t -= dt; if (G.radioLine.t <= 0) G.radioLine = null; } return; }
    if (RADF !== 1 && P && P.state === 'car') { RADF = 1; duckApply(); }
    RAD.seg = null; sr(dt); if (RAD.on) liveStep(dt); };
  // back from the background: pick the station up where it has got to
  document.addEventListener('visibilitychange', function () { if (!document.hidden && RAD.on) { liveStop(); } });
})();
