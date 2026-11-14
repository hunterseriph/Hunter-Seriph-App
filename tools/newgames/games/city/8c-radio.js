/* ---------- the radio: Hunter Seriph FM, Brothers Load Radio, PulsarOctopus Beats FM and Cum Talk. The tunes are written
   out for the game's own synth (music.js), in each station's style; real recordings can be dropped in later through
   games/ccn-radio/radio.js (window.CCNRADIO = { hs: [...], bl: [...], po: [...] } lists of mp3 paths). Between songs the
   DJs talk, read the adverts (the other games, his Twitch, his YouTube, the merch) and tell jokes. Spoken with the
   browser's own voices where there are any; the words are always on screen. ---------- */
(function () { // more sounds
  var t = sfx.tone, n = sfx.noise;
  sfx.add('select', function () { t('square', 660, 880, 0.06, 0.08); });
  sfx.add('swing', function () { n(0.12, 0.2, 900); });
  sfx.add('hurt', function () { t('sawtooth', 220, 90, 0.18, 0.18); n(0.1, 0.15, 500); });
  sfx.add('crash', function () { n(0.35, 0.5, 300); t('square', 90, 40, 0.3, 0.2); });
  sfx.add('horn', function () { t('sawtooth', 392, 392, 0.35, 0.1); t('sawtooth', 494, 494, 0.35, 0.08); });
  sfx.add('alarm', function () { for (var i = 0; i < 4; i++) { t('square', 900, 900, 0.12, 0.06, i * 0.24); t('square', 600, 600, 0.12, 0.06, i * 0.24 + 0.12); } });
  sfx.add('blip', function () { t('triangle', 880, 1320, 0.15, 0.12); });
})();
/* ---------- the songs (written as notes for music.js) ---------- */
(function () {
  var S = music.songs;
  function gen(chords, o) { // a melody out of the chords: o.pat = which chord tone on each eighth ('0','1','2','3' up, '-' hold, '.' rest), o.oct
    var NOTES = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 }, NAMES = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'];
    var bars = chords.split(' ').map(function (c, i) { var m = c.match(/^([A-G][#b]?)(m?)/), r = NOTES[m[1]], minor = m[2] === 'm', tones = [0, minor ? 3 : 4, 7, 12, minor ? 15 : 16, 19], pat = o.pats[i % o.pats.length];
      return pat.split(' ').map(function (q) { if (q === '-' || q === '.') return q; var semi = r + tones[+q] + (o.shift || 0), oct = (o.oct || 5) + Math.floor(semi / 12); return NAMES[((semi % 12) + 12) % 12] + oct; }).join(' '); });
    return bars.join(' | ');
  }
  function song(id, o) { o.mel = gen(o.chords, o); if (o.cpats) o.counter = gen(o.chords, { pats: o.cpats, oct: 4 }); S[id] = o; }
  // HUNTER SERIPH FM: heavy, gothic, red moon riffs
  song('hs1', { bpm: 150, beats: 4, vol: 0.9, wet: 0.3, lead: 'pulse', bass: 'gallop', acc: 'arp16', drums: 'rock', chords: 'Em Em C D Em Em Am B', pats: ['0 - 1 2 3 - 2 1', '0 - 2 - 3 2 1 0', '2 - 1 0 1 - 2 -', '3 - - - 2 - 1 -'], name: 'Red Moon Rising' });
  song('hs2', { bpm: 96, beats: 4, vol: 0.95, wet: 0.55, lead: 'organlead', bass: 'drone', acc: 'organ', drums: 'slow', harm: 1, chords: 'Dm Bb Gm A Dm F C A', pats: ['0 - - - 2 - 3 -', '2 - 1 - 0 - - -', '3 - 2 - 1 - 0 -', '1 - - - - - 2 -'], name: 'Hitless (No Hits Taken)' });
  song('hs3', { bpm: 168, beats: 4, vol: 0.9, wet: 0.25, lead: 'fm', bass: 'drive', acc: 'arp16', drums: 'fast', chords: 'Am F C G Am F E E', pats: ['0 1 2 3 2 1 0 1', '3 - 2 - 1 - 0 -', '0 0 2 2 3 3 2 -', '1 - 0 - . 0 1 2'], name: 'Try Finger, But Hole' });
  song('hs4', { bpm: 120, beats: 3, vol: 0.9, wet: 0.5, lead: 'xylo', bass: 'waltz', acc: 'bell', drums: 'waltz', chords: 'Cm Ab Fm G Cm Ab Db G', pats: ['0 - 2', '3 - 2', '1 - 0', '2 - -'], name: 'Bonfire Lit (Waltz of the Load)' });
  // BROTHERS LOAD RADIO: two-step country rock, boom-chick, twang
  song('bl1', { bpm: 140, beats: 4, vol: 0.9, wet: 0.15, lead: 'pulse', bass: 'walk', acc: 'stabs', drums: 'shuffle', chords: 'D D G D A A D D', pats: ['2 - 3 - 2 1 0 -', '1 - 2 - 0 - - -', '0 - 1 2 3 - 2 -', '1 0 . 1 2 - - -'], name: 'Piggy Back Ride' });
  song('bl2', { bpm: 128, beats: 4, vol: 0.9, wet: 0.15, lead: 'calliope', bass: 'walk', acc: 'stabs', drums: 'shuffle', chords: 'A A D A E D A E', pats: ['0 - 0 1 2 - 1 -', '2 - 3 - 2 - 0 -', '1 1 2 - 3 - - -', '2 - 1 - 0 - . .'], name: 'Cowboy Load' });
  song('bl3', { bpm: 104, beats: 3, vol: 0.9, wet: 0.2, lead: 'pulse', bass: 'waltz', acc: 'stabs', drums: 'waltz', chords: 'G C G D G C D G', pats: ['0 - 2', '3 - 2', '1 - -', '2 1 0'], name: 'Mama Muckies Waltz' });
  if (!S.shotrope) S.shotrope = { bpm: 142, beats: 4, vol: 0.95, wet: 0.1, lead: 'pulse', bass: 'walk', acc: 'stabs', drums: 'shuffle', chords: 'G G C G D D G G C C G Em A A D D',
    mel: 'd5 - g5 - b5 - a5 g5 | e5 - d5 - g4 - - - | e5 - g5 - c6 - b5 a5 | g5 - d5 - b4 - - - | a4 - d5 - f#5 - a5 - | g5 f#5 e5 - d5 - - - | b4 - d5 - g5 - b5 - | a5 g5 - - . . d5 - | ' +
         'e5 - e5 - g5 - c6 - | b5 - a5 - g5 - e5 - | d5 - g5 - b5 - d6 - | b5 - g5 - e5 - - - | c#5 - e5 - a5 - c#6 - | b5 - a5 - e5 - c#5 - | d5 - f#5 - a5 - c6 - | b5 - a5 - f#5 - d5 -' };
  S.shotrope.name = 'Shot Rope';
  // PULSAROCTOPUS BEATS FM: club, electro, just vibes
  song('po1', { bpm: 124, beats: 4, vol: 0.85, wet: 0.35, lead: 'fm', bass: 'pulse16', acc: 'arp16', drums: 'industrial', chords: 'Fm Fm Db Eb Fm Fm Ab Eb', pats: ['0 . 0 . 2 . 3 .', '. 2 . 1 . 0 . .', '3 - 2 - 1 - 2 -', '0 . . 0 . . 2 .'], name: 'Just Vibes' });
  song('po2', { bpm: 128, beats: 4, vol: 0.85, wet: 0.4, lead: 'soft', bass: 'pulse16', acc: 'arp8', drums: 'tribal', chords: 'Am F C G Am F G E', pats: ['0 2 3 2 0 2 3 2', '. . 1 . . . 2 .', '3 - - 2 - - 1 -', '0 0 . 0 0 . 2 1'], name: 'Eight Arms Up' });
  song('po3', { bpm: 136, beats: 4, vol: 0.85, wet: 0.3, lead: 'xylo', bass: 'pulse16', acc: 'arp16', drums: 'industrial', chords: 'Cm Cm Ab Bb Cm Cm Eb Bb', pats: ['0 1 2 3 4 3 2 1', '0 . 2 . 4 . 2 .', '5 - 4 - 3 - 2 -', '. . . . 0 0 0 0'], name: 'Free of Charge' });
  song('po4', { bpm: 110, beats: 4, vol: 0.85, wet: 0.5, lead: 'soft', bass: 'drone', acc: 'bell', drums: 'slow', chords: 'Dm Am Bb F Dm Am Gm A', pats: ['0 - - 2 - - 3 -', '2 - - - 1 - - -', '. 2 3 2 . 1 0 .', '0 - - - - - - -'], name: 'Ink in the Water' });
  // the game's own: title, the festival, the marching band
  song('ccntitle', { bpm: 88, beats: 4, vol: 0.9, wet: 0.5, lead: 'organlead', bass: 'drone', acc: 'arp8', drums: 'slow', harm: 1, chords: 'Em C G D Em C B B', pats: ['0 - - 2 3 - 2 -', '1 - - - 0 - - -', '2 - 3 - 2 1 0 -', '3 - - - - - 2 -'] });
  song('ccnfest', { bpm: 132, beats: 4, vol: 0.85, wet: 0.3, lead: 'calliope', bass: 'walk', acc: 'arp8', drums: 'tribal', chords: 'C F G C Am F G C', pats: ['0 2 3 2 0 2 3 2', '1 - 2 - 3 - 2 -', '0 0 1 1 2 2 3 -', '2 - 1 - 0 - . .'] });
  song('ccnmarch', { bpm: 116, beats: 4, vol: 0.85, wet: 0.3, lead: 'pulse', bass: 'walk', acc: 'stabs', drums: 'rock', chords: 'Bb Bb F F Bb Eb F Bb', pats: ['0 - 0 1 2 - 0 -', '3 - 2 - 1 - 0 -', '2 . 2 . 3 - 2 -', '1 - 2 - 0 - - -'] });
})();
var STATIONS = [
  { id: 'hs', name: 'HUNTER SERIPH FM', dj: 'Hunter', pitch: 0.8, rate: 1.0, songs: ['hs1', 'hs2', 'hs3', 'hs4', 'castle', 'boss', 'roof'], tag: 'Souls-like riffs from under the red moon.' },
  { id: 'bl', name: 'BROTHERS LOAD RADIO', dj: 'Cowboy Load', pitch: 0.7, rate: 0.95, songs: ['shotrope', 'bl1', 'bl2', 'bl3', 'town'], tag: 'Two brothers, one load.' },
  { id: 'po', name: 'PULSAROCTOPUS BEATS FM', dj: 'PulsarOctopus', pitch: 1.2, rate: 1.0, songs: ['po1', 'po2', 'po3', 'po4', 'park'], tag: 'Just vibes, friend. Free of charge.' },
  { id: 'talk', name: 'CUM TALK FM', dj: 'Shithead Laboozie', pitch: 1.0, rate: 1.05, songs: [], tag: 'Talk, adverts, and nothing you need to hear.' },
  { id: 'off', name: 'RADIO OFF', songs: [] }
];
var ADS = [
  'Load Legacy! Every heir dies, but the inheritance lives on. Pay TB\'s toll and get in the castle. In the Hunter Seriph app now.',
  'Cumhead Kart! Fifteen drivers, chain races, a garage full of coffins on wheels. Race your mates online. In the app.',
  'Psycho Nightmare. TB slipped you the whole bottle. Wake up four floors down. Take your pills. In the app, if you dare.',
  'Dark Loads. Try finger, but hole. Light the candles, lose your Loads, do it again. In the app.',
  'Cumheads Quest. Fifty floors. Master Bates behind a secret wall. Hire your friends at one hundred percent reputation.',
  'Spermaid Survivors! Ten minutes to dawn and every foe in Cum City wants a bite. Keep swimming, sweetie.',
  'Skeet Fighter! Beat the goo out of the homunculi of Clubhouse Row. Round one. FIGHT.',
  'The Legend of Cumhead. Amy\'s Sausage, a balloon, a Bloodmoon ring and five dungeons. It is dangerous to go alone.',
  'Hunter Seriph is live on Twitch! twitch dot tv slash hunterseriph. Souls-likes, no hits, lots of swearing. Follow him, you load.',
  'Subscribe to Hunter Seriph on YouTube! At hunterseriph. Every boss, every death, every bonfire. Hit the bell. Hit it.',
  'The Armoury! Hunter Seriph merch. Shirts like the one Cumhead wears. Look good while you die to the same boss forty times.',
  'Cum Motors, down at the docks. Spunkster GT, Dickhead Charger, the Loadsamoney Limo. Drive one home today. Or nick one. We do not ask.',
  'Load Estates! A starter home in Cum Hills, a penthouse on Clubhouse Row. Sleep somewhere that is not a bench.',
  'Ejaculand! You must be this loaded to ride. Steve is waiting at the gate. Steve is always waiting at the gate.',
  'Saba\'s Hitless Hemporium. Hitless runs only. Guns, ammo, condoms. Take a look, my friend.',
  'The Cream Wash! Police on your tail? Hundred dollars and a rinse and nobody knows your face. Or your car.',
  'Greebo\'s Gourmet Goonery. Fresh cream pies. Don\'t ask what\'s in them. Seriously. Don\'t.',
  'Meatnado Escape! Run. Just run. The meatnado does not stop and neither should you. In the app.',
  'Willy Nilly. Six restaurants, three shifts, one Kitchen Time. Mild, hot or dynamite? In the app.',
  'Potbelly Arcade. Cabinets are free, kid. Play all you like.'
];
var JOKES = [
  'Why did the homunculus cross the road? It was being chased by Sir Johnathan. Next question.',
  'Traffic report: the Cum Ring is backed up past the Bone Pit. Someone dropped a load of cream. Again.',
  'Weather: red moon tonight, chance of cream. Wear a condom. On your car.',
  'A caller asks: is pineapple on pizza a crime in Cum City? Joff says fight me. The police say no comment.',
  'News: Steve was seen waving at the Ejaculand gate. That is not news. That is every day.',
  'Breaking: a man in a gothic outfit with a cream droplet for a head has been seen doing crimes. Police say he looks familiar.',
  'Uncle Beeb says the first one is always warm. We have been asked to stop asking him why.',
  'Sports: Saba completed another hitless run. Of the supermarket. He did not get hit by a single trolley.',
  'Lost and found: a Crimson Moon Trophy, missing twenty years. If found, please do not give it to Blumhead.',
  'Health tip: TB\'s Silly Pills are not vitamins. They are not for children. They are barely for adults.',
  'Our listener of the day is Cumhead. He has stolen four cars this morning. We love the hustle.',
  'Stacked Fate drew a card for this station. It was the Fool. We are taking it personally.'
];
var DJTALK = { hs: ['That was a riff to die to. You will, a lot.', 'Hitless runs only on this station. If you skip a song, that is a hit.', 'Red moon rising over Cum City. Keep your estus warm.'], bl: ['That was the Brothers Load. Piggy says hi. The Cowboy says nothing, he is lobbing mugs.', 'Yeehaw, Cum City. Shot Rope is still number one.', 'Two brothers, one load, no regrets.'], po: ['Just vibes, friend. Free of charge.', 'Eight arms on the decks tonight. Seven on the decks, one on the kebab.', 'Feel the bass in your cream.'], talk: [] };
var RAD = { st: 0, seg: null, t: 0, on: false, q: [], useReal: false, audio: null };
function radioInit() { RAD.st = SV.radio || 0; }
function radioOn(v) { if (SV.radioOff || !v || v.t.cls === 'board') return; RAD.on = true; RAD.seg = null; RAD.t = 0; G.radioName = STATIONS[RAD.st].name; G.radioT = 3; radioNextSeg(); }
function radioOff() { RAD.on = false; RAD.seg = null; if (RAD.audio) { RAD.audio.pause(); RAD.audio = null; } if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {} if (!G.evMusic) try { music.stop(); } catch (e) {} G.radioSong = null; }
function radioNext() { RAD.st = (RAD.st + 1) % STATIONS.length; SV.radio = RAD.st; if (RAD.audio) { RAD.audio.pause(); RAD.audio = null; } if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {} try { music.stop(); } catch (e) {} G.radioName = STATIONS[RAD.st].name; G.radioT = 3; G.radioSong = STATIONS[RAD.st].tag || null; RAD.seg = null; sfx.play('blip'); if (RAD.on) radioNextSeg(); }
function radioSpecial(id) { RAD.forced = id; RAD.seg = null; if (!RAD.on) { RAD.on = true; } radioNextSeg(); }
function radioDuck(t) {}
function speak(text, st) { if (!window.speechSynthesis || SV.radioMute) return 0; try { var u = new SpeechSynthesisUtterance(text); u.pitch = st.pitch || 1; u.rate = st.rate || 1; u.volume = 0.9; var vs = speechSynthesis.getVoices().filter(function (v) { return /^en/i.test(v.lang); }); if (vs.length) u.voice = vs[(st.id || '').length % vs.length]; speechSynthesis.speak(u); return 1; } catch (e) { return 0; } }
function radioNextSeg() {
  var st = STATIONS[RAD.st]; if (!RAD.on || st.id === 'off') { G.radioSong = null; try { music.stop(); } catch (e) {} return; }
  var real = window.CCNRADIO && window.CCNRADIO[st.id] && window.CCNRADIO[st.id].length ? window.CCNRADIO[st.id] : null;
  if (RAD.forced) { var f = RAD.forced; RAD.forced = null; RAD.seg = { k: 'song', id: f, t: 150 }; music.play(f); G.radioSong = (music.songs[f] && music.songs[f].name ? music.songs[f].name : f) + ' · Brothers Load'; G.radioName = STATIONS[1].name; G.radioT = 5; return; }
  RAD.count = (RAD.count || 0) + 1;
  if (st.id === 'talk' || RAD.count % 3 === 0) { // talk: a joke, an advert, the DJ
    var line = st.id === 'talk' ? (RAD.count % 2 ? pick(ADS) : pick(JOKES)) : (RAD.count % 6 === 0 ? pick(ADS) : pick(DJTALK[st.id].concat(JOKES))); try { music.stop(); } catch (e) {}
    var dur = Math.max(5, line.length * 0.065); RAD.seg = { k: 'talk', t: dur, line: line }; speak(line, st); G.radioLine = { who: st.dj || 'Radio', s: line, t: dur }; return; }
  if (real) { var src = real[Math.floor(Math.random() * real.length)]; RAD.audio = new Audio(src); RAD.audio.volume = 0.8; RAD.audio.play().catch(function () {}); RAD.seg = { k: 'real', t: 600 }; RAD.audio.onended = function () { RAD.seg = null; radioNextSeg(); }; G.radioSong = src.split('/').pop().replace(/\.mp3$/i, '').replace(/[-_]/g, ' '); return; }
  if (st.id === 'po' && SV.mixtape && Math.random() < 0.3) st = STATIONS[2];
  var id = pick(st.songs); music.play(id); RAD.seg = { k: 'song', id: id, t: rnd(80, 130) }; G.radioSong = (music.songs[id] && music.songs[id].name ? music.songs[id].name : ({ castle: 'Castle Gates', boss: 'Boss Door', roof: 'Over the Rooftops', town: 'Town Square Two-Step', park: 'Ejaculand Waltz' }[id] || id)) + ' · ' + ({ hs: 'Hunter Seriph', bl: 'Brothers Load', po: 'PulsarOctopus' }[st.id] || '');
}
function stepRadio(dt) {
  if (!RAD.on) return; if (P && P.state !== 'car') { radioOff(); return; }
  if (RAD.seg) { RAD.seg.t -= dt; if (RAD.seg.t <= 0) { RAD.seg = null; radioNextSeg(); } }
  if (G.radioLine) { G.radioLine.t -= dt; if (G.radioLine.t <= 0) G.radioLine = null; }
}
/* the characters' lines in missions: TB's own recordings where they exist (Psycho Nightmare's), the browser's voices for the rest */
var VOICE = { tb: { pitch: 0.4, rate: 0.85 }, lab: { pitch: 0.9, rate: 1.1 }, greebo: { pitch: 1.3, rate: 1.1 }, spermaid: { pitch: 1.5, rate: 1.05 }, amy: { pitch: 1.4, rate: 1.1 }, saba: { pitch: 0.7, rate: 0.9 }, harold: { pitch: 1.1, rate: 1.15 }, pulsar: { pitch: 1.6, rate: 1.0 }, bates: { pitch: 0.8, rate: 0.85 }, beeb: { pitch: 0.6, rate: 0.95 } };
function voiceLine(who, text) {
  if (who === 'steve' || SV.voiceOff) return; if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  if (who === 'tb') { var i = TBQUOTES2.indexOf(text); if (i >= 0 && window.PNVOICE) { var id = 'tb' + (i < 9 ? '0' : '') + (i + 1); if (window.PNVOICE.indexOf ? window.PNVOICE.indexOf(id) >= 0 : window.PNVOICE[id]) { try { var a = new Audio('pn-voice/' + id + '.mp3'); a.play().catch(function () {}); return; } catch (e) {} } } }
  var v = VOICE[who] || { pitch: 1, rate: 1 }; speak(text, { pitch: v.pitch, rate: v.rate, id: who });
}
