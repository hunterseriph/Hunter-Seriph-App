#!/usr/bin/env python3
"""Psycho Nightmare voices: turns recordings into the game's voice files.

  python3 tools/psycho-voice/make.py

Put one recording per line in tools/psycho-voice/recordings, named by its id from LINES.txt (tb01.wav, tbend.m4a,
muckies_wake.mp3 ...). Each is trimmed of silence, levelled, made mono and saved as www/games/pn-voice/<id>.mp3,
and www/games/pn-voice/voices.js is written so the game knows which lines have a voice. Lines without a recording
fall back to the in-game voice setting. Needs ffmpeg.
"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(os.path.dirname(HERE))
REC = os.path.join(HERE, 'recordings'); OUT = os.path.join(APP, 'www', 'games', 'pn-voice')
ids = [r[0] for r in json.load(open(os.path.join(HERE, 'lines.json')))]
os.makedirs(OUT, exist_ok=True); have = {}
for f in sorted(os.listdir(REC)) if os.path.isdir(REC) else []:
    base, ext = os.path.splitext(f)
    if base not in ids: print('skipped (not a line id):', f); continue
    dst = os.path.join(OUT, base + '.mp3')
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(REC, f), '-ac', '1', '-ar', '44100',
           '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5',
           '-codec:a', 'libmp3lame', '-b:a', '80k', dst]
    subprocess.run(cmd, check=True); have[base] = 'pn-voice/' + base + '.mp3'; print('voice', base)
open(os.path.join(OUT, 'voices.js'), 'w').write('window.PNVOICE = ' + json.dumps(have, indent=0) + ';\n')
print(len(have), 'of', len(ids), 'lines have a voice')
