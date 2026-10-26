Meatnado, Mega Drive version (www/games/meatnado-md.mp3, played by Meatnado Escape).
Made from the original song: decode it to mono 22050 Hz as m.wav, then
  python3 hp.py      (splits harmonic / percussive parts: harm.wav, perc.wav)
  python3 riff.py    (riff root per eighth note -> riff.npy)
  python3 drums.py   (kick / snare / hat per sixteenth -> dr.npy)
  python3 render.py  (renders meatnado_md.wav with FM guitars, FM bass, FM lead, PSG and 8-bit DAC drums)
  ffmpeg -i meatnado_md.wav -c:a libmp3lame -b:a 128k meatnado-md.mp3
riff.npy and dr.npy are kept here, so render.py can be tweaked and re-run without the original.
Tempo 210, 126 bars plus a ringing A# chord to finish.
