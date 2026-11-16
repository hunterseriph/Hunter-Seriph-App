/* ---------- update 156 (his ask: the radio needs spoken words, not subtitles, and everyone should be spoken because the
   words are hard to read): every line has a recorded voice in games/ccn-voice (made by tools/city/voices.py, listed in
   ccn-voice/voices.js as window.CCNVOICE). Radio talk is spoken by the station's DJ with no caption; mission and cutscene
   lines are spoken with the subtitle kept (bigger now); people in the street speak their bubbles when you are near.
   TB's own lines are Psycho Nightmare's recordings. Where a line has no file the browser's voice is tried. ---------- */
function voiceKey(who, text) { var h = 0x811c9dc5, s = who + '|' + text; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return 'v' + h.toString(36); }
function voiceFile(who, text) { var k = voiceKey(who, text); return window.CCNVOICE && window.CCNVOICE[k] ? 'ccn-voice/' + k + '.mp3' : null; }
var VOX = { line: null, bark: null, radio: null, barkT: 0 };
function playFile(src, vol, slot) { try { if (VOX[slot]) { VOX[slot].pause(); VOX[slot] = null; } if (sfx.muted || G.spray) return null; var a = new Audio(src); a.volume = Math.max(0, Math.min(1, vol)); a.play().catch(function () {}); VOX[slot] = a; return a; } catch (e) { return null; } }
// the radio DJ
var _speakR = speak;
speak = function (text, st) { if (SV.radioMute) return 0; var f = st && st.id ? voiceFile(st.id, text) : null;
  if (f) { var a = playFile(f, 0.95, 'radio'); if (a) { if (G.radioLine) G.radioLine.spoken = 1; a.onloadedmetadata = function () { if (RAD.seg && RAD.seg.k === 'talk' && isFinite(a.duration)) { RAD.seg.t = a.duration + 0.8; if (G.radioLine) G.radioLine.t = RAD.seg.t; } }; return 1; } }
  return _speakR(text, st); };
var _radioNextSegV = radioNextSeg;
radioNextSeg = function () { _radioNextSegV(); if (RAD.seg && RAD.seg.k === 'talk' && G.radioLine && VOX.radio && !VOX.radio.paused) G.radioLine.spoken = 1; };
var _radioOffV = radioOff; radioOff = function () { if (VOX.radio) { VOX.radio.pause(); VOX.radio = null; } return _radioOffV(); };
var _radioNextV = radioNext; radioNext = function () { if (VOX.radio) { VOX.radio.pause(); VOX.radio = null; } return _radioNextV(); };
// mission and cutscene lines
var _voiceLineV = voiceLine;
voiceLine = function (who, text) { if (SV.voiceOff) return; if (VOX.line) { VOX.line.pause(); VOX.line = null; }
  if (who !== 'tb' || TBQUOTES2.indexOf(text) < 0) { var f = voiceFile(who, text); if (f) { if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {} if (VOX.radio) VOX.radio.volume = 0.25; var a = playFile(f, 1, 'line'); if (a) a.onended = function () { if (VOX.radio) VOX.radio.volume = 0.95; }; return; } }
  return _voiceLineV(who, text); };
// people in the street: a bubble near you is spoken too
var _sayV = say;
say = function (p, txt) { _sayV(p, txt); if (!p.said || SV.voiceOff || G.cut || p.cutWho) return; var d = Math.hypot(p.x - P.x, p.z - P.z); if (d > 18 || G.t < VOX.barkT) return;
  if ((G.interior ? G.interior.id : null) !== (p.inside || null)) return;
  var who = p.who && CAST[p.who] ? p.who : (p.cop ? 'cop' : (p.id < 0.5 ? 'pedM' : 'pedF')), f = p.who === 'tb' ? null : voiceFile(who, p.said) || voiceFile('pedM', p.said);
  if (p.who === 'tb') { var i = TBQUOTES2.indexOf(p.said); if (i >= 0) f = 'pn-voice/tb' + (i < 9 ? '0' : '') + (i + 1) + '.mp3'; }
  if (!f) return; VOX.barkT = G.t + 1.2; playFile(f, Math.max(0.15, 1 - d / 20), 'bark'); };
document.addEventListener('visibilitychange', function () { if (document.hidden) ['line', 'bark', 'radio'].forEach(function (k) { if (VOX[k]) { VOX[k].pause(); VOX[k] = null; } }); });
(function () { var s = document.createElement('script'); s.src = 'ccn-voice/voices.js'; s.onerror = function () {}; document.head.appendChild(s); })();
