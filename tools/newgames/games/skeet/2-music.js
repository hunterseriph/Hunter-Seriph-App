/* =====================================================================================================
   SKEET FIGHTER's own songs, written out for Load Legacy's synth (the other stages and the bosses use Load Legacy's
   own themes for those places: sewer, park, bone, furnace, castle, and the boss songs).
   ===================================================================================================== */
(function () {
  var S = music.songs;
  // the title: a hard minor riff, galloping bass, then the hook goes up a gear
  S.sktitle = { bpm: 152, beats: 4, vol: 0.92, wet: 0.3, lead: 'fm', bass: 'gallop', acc: 'stabs', drums: 'boss', chords: 'Am F C G Am F E E Dm Am F G Am F E Am',
    mel: 'a4 - c5 - e5 - a5 - | f5 - e5 - c5 - a4 - | g4 - c5 - e5 - g5 - | b5 - - - g5 - d5 - | a5 - c6 - b5 a5 g5 e5 | f5 - a5 - c6 - a5 - | g#5 - b5 - e6 - d6 - | e6 - - - b5 - g#5 - | ' +
         'd6 - - c6 a5 - f5 - | e5 - a5 - c6 - e6 - | f6 - e6 - c6 - a5 - | b5 - d6 - g6 - - - | a5 - c6 - e6 - a6 - | f6 - e6 - d6 - c6 - | b5 - g#5 - e5 - b5 - | a5 - - - - - . .',
    counter: 'a3 . a3 . e4 . a3 . | f3 . f3 . c4 . f3 . | c4 . c4 . g4 . c4 . | g3 . g3 . d4 . g3 . | a3 . a3 . e4 . a3 . | f3 . f3 . c4 . f3 . | e3 . e3 . b3 . e3 . | e3 . e3 . g#3 . e3 . | ' +
             'd4 . d4 . a4 . d4 . | a3 . a3 . e4 . a3 . | f3 . f3 . c4 . f3 . | g3 . g3 . d4 . g3 . | a3 . a3 . e4 . a3 . | f3 . f3 . c4 . f3 . | e3 . e3 . b3 . e3 . | a3 . a3 . e4 . a3 .' };
  // CLUBHOUSE ROW: night street beat-em-up funk, a bassline you can walk to and a lead that swaggers
  S.skstreet = { bpm: 126, beats: 4, vol: 0.9, wet: 0.32, lead: 'pulse', bass: 'drive', acc: 'arp16', drums: 'rock', chords: 'Dm Dm Bb C Dm Dm Gm A Bb C Am Dm Gm C A A',
    mel: 'd5 - - f5 - a5 - g5 | f5 - e5 - d5 - c5 - | d5 - f5 - bb5 - a5 g5 | g5 - - - e5 - c5 - | d5 - - f5 - a5 - c6 | d6 - c6 - a5 - f5 - | g5 - bb5 - d6 - c6 bb5 | a5 - - - c#6 - e6 - | ' +
         'f6 - - d6 - bb5 - f5 | e5 - g5 - c6 - e6 - | e6 - d6 - c6 - a5 - | f5 - a5 - d6 - - - | d6 - bb5 - g5 - d5 - | e5 - g5 - c6 - bb5 - | a5 - c#6 - e6 - g6 - | a6 - - - - - . .',
    counter: 'd4 . . d4 . f4 . a3 | d4 . . d4 . f4 . a3 | bb3 . . bb3 . d4 . f4 | c4 . . c4 . e4 . g4 | d4 . . d4 . f4 . a3 | d4 . . d4 . f4 . a3 | g3 . . g3 . bb3 . d4 | a3 . . a3 . c#4 . e4 | ' +
             'bb3 . . bb3 . d4 . f4 | c4 . . c4 . e4 . g4 | a3 . . a3 . c4 . e4 | d4 . . d4 . f4 . a4 | g3 . . g3 . bb3 . d4 | c4 . . c4 . e4 . g4 | a3 . . a3 . c#4 . e4 | a3 . . a3 . c#4 . e4' };
  // STAGE CLEAR: a short fanfare (loops quietly while the tally counts up)
  S.skclear = { bpm: 140, beats: 4, vol: 0.85, wet: 0.35, lead: 'pulse', bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'C F G C',
    mel: 'c5 e5 g5 c6 - e6 - c6 | a5 - c6 - f6 - - - | g5 - b5 - d6 - g6 - | c6 - - - - - . .', harm: 1 };
  // THE END: slow and warm, the homunculi go home
  S.skend = { bpm: 96, beats: 4, vol: 0.85, wet: 0.5, lead: 'organlead', bass: 'walk', acc: 'bell', drums: 'slow', chords: 'C Am F G C Am F G Am F C G F G C C',
    mel: 'e5 - - - g5 - c6 - | a5 - - - e5 - - - | f5 - a5 - c6 - a5 - | g5 - - - d5 - - - | e5 - - - g5 - c6 - | e6 - d6 - c6 - a5 - | f5 - a5 - c6 - f6 - | d6 - - - b5 - - - | ' +
         'c6 - - - a5 - e5 - | f5 - a5 - c6 - - - | e6 - - - c6 - g5 - | d6 - - - b5 - g5 - | a5 - - - c6 - f6 - | d6 - - - g5 - b5 - | c6 - - - - - - - | c6 - - - . . . .' };
})();
