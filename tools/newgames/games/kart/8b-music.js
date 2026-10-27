/* =====================================================================================================
   THE SOUNDTRACK: each course plays its place's own song from the game it comes from, sped up and given
   racing drums (and it speeds up again on the final lap). Plus a title song, the dungeon's own tune, and
   the jingles for the podium.
   ===================================================================================================== */
function remix(id, src, o) { var b = music.songs[src]; if (!b) return; var c = {}; for (var k in b) c[k] = b[k]; for (var q in o) c[q] = o[q]; music.songs[id] = c; }
remix('ck_town', 'town', { bpm: 150, drums: 'rock', bass: 'drive' });
remix('ck_park', 'park', { bpm: 186 });
remix('ck_cafe', 'mnrun', { bpm: 172 });
remix('ck_castle', 'castle', { bpm: 156, drums: 'fast' });
remix('ck_sewer', 'sewer', { bpm: 148, drums: 'rock', bass: 'drive' });
remix('ck_arcade', 'aomicro', { bpm: 166 });
remix('ck_factory', 'swworks', { bpm: 150, drums: 'industrial', bass: 'pulse16' });
remix('ck_lair', 'lair', { bpm: 148, drums: 'boss' });
remix('ck_picnic', 'gfair', { bpm: 160 });
remix('ck_void', 'jvbattle', { bpm: 158 });
remix('ck_moon', 'moonarea', { bpm: 150, drums: 'boss', bass: 'drive', acc: 'arp16' });
music.songs.ck_dungeon = { bpm: 152, beats: 4, vol: 0.88, wet: 0.35, lead: 'fm', fmbass: 1, bass: 'gallop', acc: 'arp16', drums: 'rock', chords: 'Am F G E Am F Dm E Dm Am Bb E F G Am E',
  mel: 'a4 - c5 e5 a5 - g5 e5 | f5 - a5 - c6 - a5 f5 | g5 - b5 - d6 - b5 g5 | g#5 - b5 - e6 - - - | a5 c6 e6 c6 a5 - e5 - | f5 a5 c6 a5 f5 - c5 - | d5 f5 a5 d6 c6 a5 f5 d5 | e5 - g#5 - b5 - e6 - | ' +
       'f5 - - a5 d6 - a5 - | e5 - - a5 c6 - e6 - | f5 - bb5 - d6 - f6 - | e6 - d6 - b5 - g#5 - | c6 - a5 - f5 - a5 - | d6 - b5 - g5 - b5 - | e6 - c6 - a5 - e5 - | g#5 - b5 - e6 - - -' };
music.songs.ck_title = { bpm: 140, beats: 4, vol: 0.9, wet: 0.3, lead: 'fm', harm: 1, fmbass: 1, bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'Cm Ab Bb G Cm Ab Fm G Ab Bb Cm Ab Fm G Cm G',
  mel: 'c5 - eb5 - g5 - c6 - | c6 - bb5 ab5 eb5 - c5 - | d5 - f5 - bb5 - d6 - | b5 - - - g5 - - - | c6 - eb6 - g6 - eb6 c6 | ab5 - c6 - eb6 - c6 ab5 | f5 - ab5 - c6 - f6 - | d6 - b5 - g5 - b5 - | ' +
       'ab5 - - c6 eb6 - c6 ab5 | bb5 - - d6 f6 - d6 bb5 | c6 - g5 - eb5 - g5 - | eb6 - c6 - ab5 - eb5 - | f5 - ab5 - c6 - eb6 - | d6 - c6 - b5 - g5 - | c6 - - - g5 - eb5 - | g5 - b5 - d6 - - -' };
music.songs.ck_win = { bpm: 132, beats: 4, vol: 0.88, wet: 0.3, lead: 'pulse', harm: 1, bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'C F G C Am F G C',
  mel: 'c5 - e5 - g5 - c6 - | a5 - f5 - c6 - a5 - | b5 - g5 - d6 - b5 - | c6 - - - g5 - e5 - | a5 - c6 - e6 - a6 - | f6 - c6 - a5 - f5 - | g5 - b5 - d6 - f6 - | e6 - - - c6 - - -' };
music.songs.ck_results = { bpm: 110, beats: 4, vol: 0.8, wet: 0.4, lead: 'soft', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'F Dm Bb C F Am Bb C',
  mel: 'c5 - f5 - a5 - g5 f5 | d5 - f5 - a5 - - - | bb4 - d5 - f5 - bb5 - | g5 - - - e5 - c5 - | a5 - c6 - a5 - f5 - | e5 - a5 - c6 - e6 - | d6 - bb5 - f5 - d5 - | e5 - g5 - c6 - - -' };
