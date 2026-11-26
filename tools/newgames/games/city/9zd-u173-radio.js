/* ---------- update 173 (his ask: put his real songs on Hunter Seriph FM in place of the made-up ones; update 174: the same
   for Brothers Load Radio, with Piggy Bussy and the single Shot Rope). The songs and the
   list are in games/ccn-radio/ (radio.js: CCNRADIO.hs and CCNRADIO_META, title / album / cover for each file).
   - The station plays only his songs, shuffled, every song once before any repeats; the DJ talk in between stays.
   - When a song starts, its name and album come up at the top with the album cover (Sweet Release, The Second Cumming).
   - The songs follow the mute button, go quieter under people talking, and stop when the app goes to the background. ---------- */
var RADART = {};
function radArt(src) { if (!src) return null; var im = RADART[src]; if (!im) { im = RADART[src] = new Image(); im.onload = function () { im.ok = 1; }; im.src = src; } return im.ok ? im : null; }
function radReal(st) { return window.CCNRADIO && CCNRADIO[st.id] && CCNRADIO[st.id].length ? CCNRADIO[st.id] : null; }
function radVol() { return sfx.muted ? 0 : (DUCK.line || DUCK.bark ? 0.3 : 0.8) * sndV('radio'); } // update 175: times the radio volume setting
(function () {
  function radPlay(src, st) { if (RAD.audio) { RAD.audio.onended = null; RAD.audio.pause(); }
    var M = (window.CCNRADIO_META || {})[src] || {}, a = RAD.audio = new Audio(src); a.volume = radVol(); a.play().catch(function () {});
    a.onended = function () { if (RAD.audio !== a) return; RAD.seg = null; radioNextSeg(); };
    a.onerror = function () { if (RAD.audio !== a) return; RAD.seg = { k: 'real', t: 0.5 }; };
    RAD.seg = { k: 'real', t: 900 }; G.radioSong = (M.t || src.split('/').pop()) + ' · ' + (M.by || ({ hs: 'Hunter Seriph', bl: 'Brothers Load', po: 'PulsarOctopus' }[st.id] || '')) + (M.a ? ' · ' + M.a : ''); G.radioArt = M.art || null; radArt(G.radioArt); G.radioName = st.name; G.radioT = 6; }
  var rn = radioNextSeg; radioNextSeg = function () { var st = STATIONS[RAD.st], real = st ? radReal(st) : null, SR = 'ccn-radio/bl/shot-rope.mp3';
    // the Shot Rope mission (TB at the docks gig) plays the real recording when it is there
    if (RAD.forced === 'shotrope' && window.CCNRADIO && CCNRADIO.bl && CCNRADIO.bl.indexOf(SR) >= 0) { RAD.forced = null; try { music.stop(); } catch (e) {} radPlay(SR, STATIONS.filter(function (q) { return q.id === 'bl'; })[0] || st); return; }
    if (real && st.songs && st.songs.length) st.songs = []; // nothing made-up under the DJ either
    rn(); if (!real || !RAD.seg || RAD.seg.k !== 'real') return;
    radPlay(radioDeal('real' + st.id, real), st); };
  var sr = stepRadio; stepRadio = function (dt) { sr(dt); if (RAD.audio) { var v = radVol(); if (Math.abs(RAD.audio.volume - v) > 0.01) RAD.audio.volume = v; } };
  var nx = radioNext; radioNext = function () { G.radioArt = null; return nx.apply(this, arguments); };
  document.addEventListener('visibilitychange', function () { if (!RAD.audio) return; if (document.hidden) RAD.audio.pause(); else if (RAD.on) RAD.audio.play().catch(function () {}); });
  var dh = drawHud; drawHud = function () { dh.apply(this, arguments); if (!G.radioArt || !(G.radioT > 0) || !G.radioName || G.mode !== 'play') return; var im = radArt(G.radioArt); if (!im) return;
    var ctx = KIT.ctx, Wd = KIT.W, w = Math.max(tw2(G.radioName, 10), G.radioSong ? tw2(G.radioSong, 6) : 0), s = 26, x = Math.min(Wd / 2 + w / 2 + 6, Wd - s - 4), y = Wd / 2 + w / 2 + 6 > Wd - s - 4 ? 42 : 19;
    ctx.globalAlpha = Math.min(1, G.radioT); ctx.fillStyle = '#c4121c'; ctx.fillRect(x - 1, y - 1, s + 2, s + 2); ctx.drawImage(im, x, y, s, s); ctx.globalAlpha = 1; };
})();
