/* =====================================================================================================
   THE SOUNDTRACK: written out note by note for Load Legacy's synth (pulse and FM leads, slap bass, noise drums).
   Upbeat and hummable on purpose: a hook in the first two bars of every zone, a second half that lifts.
   Melody tokens are eighth notes ('-' holds, '.' rests), one chord per bar.
   ===================================================================================================== */
(function () {
  var S = music.songs;
  S.hogtitle = { bpm: 140, beats: 4, vol: 0.9, wet: 0.3, lead: 'pulse', bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'C G Am F C G F G',
    mel: 'c5 - e5 g5 c6 - b5 a5 | g5 - - - d5 - g5 - | a5 - c6 - e6 - d6 c6 | f5 - a5 - c6 - - - | e5 - g5 c6 e6 - d6 c6 | b5 - g5 - d6 - b5 - | a5 - c6 - f6 - e6 d6 | d6 - - - g5 - b5 d6' };
  // NIGHT CITY: the first thing you hear, so the catchiest: a funky minor hook that climbs into a big major lift
  S.hogcity = { bpm: 150, beats: 4, vol: 0.88, wet: 0.28, lead: 'pulse', bass: 'drive', acc: 'arp16', drums: 'fast', chords: 'Am F G Em Am F G E Dm Am Dm E F G Am Am',
    mel: 'e5 - a5 - c6 b5 a5 g5 | a5 - - f5 - - c5 - | d5 - g5 - b5 a5 g5 f5 | e5 - - - b4 - e5 - | e5 - a5 - c6 b5 a5 g5 | a5 - c6 - f6 - e6 - | d6 - b5 - g5 - d6 - | e6 - - - g#5 - b5 - | ' +
         'f5 - a5 - d6 - c6 a5 | e5 - a5 - c6 - - - | f5 - a5 - d6 - f6 - | e6 - d6 - b5 - g#5 - | a5 - c6 - f6 - e6 d6 | b5 - d6 - g6 - f6 e6 | e6 - c6 - a5 - e5 - | a5 - - - - - . .',
    counter: 'a4 . a4 . e4 . a4 . | f4 . f4 . c5 . f4 . | g4 . g4 . d4 . g4 . | e4 . e4 . b4 . e4 . | a4 . a4 . e4 . a4 . | f4 . f4 . c5 . f4 . | g4 . g4 . d4 . g4 . | e4 . e4 . g#4 . e4 . | ' +
             'd4 . d4 . a4 . d4 . | a4 . a4 . e4 . a4 . | d4 . d4 . a4 . d4 . | e4 . e4 . b4 . e4 . | f4 . f4 . c5 . f4 . | g4 . g4 . d5 . g4 . | a4 . a4 . e4 . a4 . | a4 . a4 . e4 . a4 .' };
  S.hogsewer = { bpm: 132, beats: 4, vol: 0.9, wet: 0.5, lead: 'fm', fmbass: 1, bass: 'walk', acc: 'bell', drums: 'shuffle', chords: 'Em C D B Em C Am B C D Em Em C D B B',
    mel: 'b4 - e5 - g5 - f#5 e5 | g5 - - e5 c5 - - - | d5 - f#5 - a5 - g5 f#5 | d#5 - - - b4 - - - | e5 - g5 - b5 - a5 g5 | c6 - b5 - g5 - e5 - | a5 - c6 - e6 - d6 c6 | b5 - - - d#5 - f#5 - | ' +
         'g5 - e5 - c5 - e5 g5 | a5 - f#5 - d5 - f#5 a5 | b5 - - g5 e5 - g5 b5 | e6 - - - - - . . | c6 - b5 a5 g5 - e5 - | d5 - e5 f#5 a5 - g5 f#5 | d#5 - f#5 - b5 - a5 g5 | f#5 - - - d#5 - - -' };
  // EJACULAND: a calliope carnival tune at full gallop
  S.hogpark = { bpm: 160, beats: 4, vol: 0.86, wet: 0.32, lead: 'calliope', bass: 'walk', acc: 'stabs', drums: 'rock', chords: 'Cm Ab Bb G Cm Ab Fm G Ab Bb Cm Cm Fm G Cm G',
    mel: 'g5 - c6 - eb6 - d6 c6 | ab5 - c6 - eb6 - - - | f5 - bb5 - d6 - c6 bb5 | b5 - d6 - g6 - - - | g6 - eb6 - c6 - g5 - | ab5 - c6 - eb6 - ab6 - | g6 f6 eb6 d6 c6 - ab5 - | b5 - - - d6 - g5 - | ' +
         'c6 - eb6 - ab6 - g6 f6 | d6 - f6 - bb6 - ab6 g6 | eb6 - g6 - c7 - - - | g6 - eb6 - c6 - g5 - | ab5 - c6 - f6 - eb6 d6 | b5 - d6 - g6 - f6 d6 | eb6 - d6 - c6 - g5 - | b5 - - - g5 - - -' };
  S.hogbone = { bpm: 144, beats: 4, vol: 0.86, wet: 0.4, lead: 'xylo', bass: 'walk', acc: 'stabs', drums: 'shuffle', chords: 'Dm Dm Bb A Dm Dm Gm A Bb C Dm Dm Gm A Dm A',
    mel: 'd5 - f5 - a5 - g5 f5 | e5 f5 g5 - a5 - - - | bb5 - a5 - g5 - f5 - | e5 - c#5 - a4 - - - | d5 - f5 - a5 - d6 - | c6 bb5 a5 - g5 - f5 - | g5 - bb5 - d6 - c6 bb5 | a5 - - - c#6 - e6 - | ' +
         'f6 - d6 - bb5 - f5 - | e6 - c6 - g5 - e5 - | f5 - a5 - d6 - f6 - | e6 - d6 - a5 - - - | bb5 - d6 - g6 - f6 e6 | c#6 - e6 - a6 - g6 f6 | e6 - d6 - a5 - f5 - | e5 - c#5 - a4 - - -' };
  S.hogfactory = { bpm: 156, beats: 4, vol: 0.9, wet: 0.22, lead: 'fm', fmbass: 1, bass: 'pulse16', acc: 'arp16', drums: 'industrial', chords: 'Fm Fm Db Eb Fm Fm Bbm C Db Eb Fm Ab Db Eb C C',
    mel: 'f5 . f5 . ab5 . f5 c6 | bb5 ab5 g5 ab5 f5 - - - | db6 - c6 - bb5 - ab5 - | g5 - bb5 - eb6 - - - | f6 . f6 . eb6 . c6 ab5 | bb5 c6 ab5 bb5 f5 - - - | bb5 - db6 - f6 - eb6 db6 | c6 - e6 - g6 - - - | ' +
         'ab6 - f6 - db6 - ab5 - | g5 - bb5 - eb6 - g6 - | f6 - c6 - ab5 - f5 - | eb6 - c6 - ab5 - c6 - | db6 - f6 - ab6 - g6 f6 | eb6 - g6 - bb6 - ab6 g6 | g6 - e6 - c6 - g5 - | c6 - - - e6 - g6 -' };
  // SPUNK BRAIN: the Scrap Brain one. Relentless sixteenths, an octave-doubled lead, alarms in the arps
  S.hogbrain = { bpm: 168, beats: 4, vol: 0.9, wet: 0.24, lead: 'pulse', harm: 1, bass: 'pulse16', acc: 'arp16', drums: 'industrial', chords: 'Em C D Bm Em C Am B Em G D A C D B B',
    mel: 'e5 g5 b5 e6 d6 b5 g5 b5 | c6 - b5 - g5 - e5 - | d5 f#5 a5 d6 c#6 a5 f#5 a5 | b5 - - - f#5 - d5 - | e5 g5 b5 e6 f#6 e6 d6 b5 | c6 - e6 - g6 - e6 c6 | a5 - c6 - e6 - d6 c6 | b5 - d#6 - f#6 - - - | ' +
         'g6 - f#6 e6 b5 - e6 - | d6 - b5 - g5 - d6 - | f#6 - e6 d6 a5 - d6 - | c#6 - a5 - e5 - c#6 - | e6 - d6 c6 g5 - c6 - | f#6 - e6 d6 a5 - f#5 - | b5 - d#6 - f#6 - b6 - | a6 - f#6 - d#6 - b5 -' };
  S.hogboss = { bpm: 172, beats: 4, vol: 0.9, wet: 0.2, lead: 'pulse', harm: 1, bass: 'pulse16', acc: 'arp16', drums: 'boss', chords: 'Am Am F G Am Am Bb E',
    mel: 'a5 a5 . a5 c6 . a5 e6 | d6 c6 b5 c6 a5 - - - | f5 a5 c6 f6 e6 - d6 c6 | g5 b5 d6 g6 f6 - e6 d6 | a5 a5 . a5 c6 . e6 a6 | g6 f6 e6 f6 e6 - - - | f6 - d6 - bb5 - f5 - | g#5 - b5 - e6 - g#6 -' };
  S.hogfinal = { bpm: 176, beats: 4, vol: 0.92, wet: 0.22, lead: 'fm', harm: 1, fmbass: 1, bass: 'pulse16', acc: 'organ', drums: 'boss', chords: 'Cm Cm Ab Bb Cm Cm Db G Fm Cm Ab G Cm Ab Bb G',
    mel: 'c5 eb5 g5 c6 b5 c6 d6 eb6 | d6 c6 g5 eb5 c5 - - - | ab5 - c6 - eb6 - d6 c6 | bb5 - d6 - f6 - eb6 d6 | c6 eb6 g6 c7 b6 g6 eb6 c6 | g6 - f6 eb6 d6 - c6 - | db6 - f6 - ab6 - g6 f6 | f6 - d6 - b5 - g5 - | ' +
         'f5 - ab5 - c6 - f6 - | eb6 - c6 - g5 - eb5 - | ab5 - c6 - eb6 - ab6 - | g6 - f6 - d6 - b5 - | c6 - eb6 - g6 - c7 - | ab6 - g6 - f6 - eb6 - | f6 - eb6 - d6 - bb5 - | b5 - d6 - g6 - b6 -' };
  S.hogclear = { bpm: 150, beats: 4, vol: 0.9, wet: 0.3, lead: 'pulse', bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'C G C C',
    mel: 'c5 e5 g5 c6 - e6 - - | d6 - b5 - g5 - d6 - | e6 - - - c6 - - - | . . . . . . . .' };
})();
