#!/usr/bin/env python3
"""Cum City Nights: every line spoken (update 156, his ask: the radio needs spoken words, not subtitles, and everything
people say should be spoken). Stand-in voices made with Piper until real recordings replace them.

  node /home/claude/tools/ccvoicelines.js          (dumps every line in the game to /home/claude/ck/ccn/lines.json)
  python3 tools/city/voices.py [lines.json] [piper folder]

Writes www/games/ccn-voice/<id>.mp3 (mono, small) and www/games/ccn-voice/voices.js (window.CCNVOICE = {id: 1}).
The id is 'v' + FNV-1a of "who|text" in base 36, the same sum the game works out (voiceKey in 8c-radio.js), so a line
whose words change just gets a new file. A real recording put in tools/city/voice-rec/<id>.(wav|mp3|m4a|ogg) wins.
TB's own lines use Psycho Nightmare's (pn-voice) and are skipped here.

Piper: github.com/rhasspy/piper release 2023.11.14-2; voices from its v0.0.2 release: en-us-ryan-medium and
en-us-libritts-high (by speaker number; males and females picked by measuring their pitch).
"""
import json, os, subprocess, sys, hashlib
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
LINES = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ck/ccn/lines.json'
PIPER = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/piper-dl'
OUT = os.path.join(ROOT, 'www', 'games', 'ccn-voice'); REC = os.path.join(HERE, 'voice-rec')
LT = 'en-us-libritts-high'
# who: (model, speaker, slowness, pitch, extra ffmpeg filters)
V = { # update 157 (he said people sounded robotic and weird): no pitch shifting any more (it smeared the voices), natural
  # pace, a little more expression from Piper (noise settings in speak), and each character keeps one real speaker.
 'lab': (LT, 51, 1.0, 1.0, ''), 'cumhead': (LT, 50, 1.0, 1.0, ''), 'greebo': (LT, 54, 0.98, 1.0, ''), 'spermaid': (LT, 9, 1.0, 1.0, ''),
 'amy': (LT, 21, 0.98, 1.0, ''), 'saba': (LT, 27, 1.06, 1.0, ''), 'joff': (LT, 57, 0.98, 1.0, ''), 'beeb': (LT, 90, 1.04, 1.0, ''),
 'harold': (LT, 105, 0.95, 1.0, ''), 'kaya': (LT, 15, 0.98, 1.0, ''), 'elden': (LT, 72, 1.0, 1.0, ''), 'ali': (LT, 78, 0.98, 1.0, ''),
 'potbelly': (LT, 102, 1.02, 1.0, ''), 'pulsar': (LT, 117, 1.08, 1.0, ''), 'bonjo': (LT, 18, 1.0, 1.0, ''), 't': (LT, 0, 1.08, 1.0, ''),
 'jessiah': (LT, 6, 1.04, 1.0, ''), 'natty': (LT, 114, 1.04, 1.0, ''), 'judge': (LT, 48, 1.08, 1.0, 'aecho=0.8:0.4:40:0.1'), 'fate': (LT, 60, 1.12, 1.0, 'aecho=0.8:0.4:60:0.12'),
 'bates': (LT, 24, 1.1, 1.0, ''), 'blumhead': (LT, 42, 1.08, 1.0, 'aecho=0.8:0.5:50:0.18'), 'clown': (LT, 81, 0.95, 1.0, ''),
 'tb': ('en-us-ryan-medium', None, 1.42, 0.86, 'acompressor=threshold=-20dB:ratio=3,aecho=0.8:0.5:38:0.18,bass=g=5'),
 # the radio: DJs by station, the news desk
 'hs': (LT, 81, 1.0, 1.0, 'highpass=f=100,lowpass=f=7000'), 'bl': (LT, 90, 1.05, 1.0, 'highpass=f=120,lowpass=f=6000'), 'po': (LT, 117, 1.08, 1.0, 'highpass=f=100,lowpass=f=7000'), 'talk': (LT, 51, 1.0, 1.0, 'highpass=f=120,lowpass=f=6500'),
 'news': (LT, 39, 0.98, 1.0, 'highpass=f=100,lowpass=f=7500'), 'traffic': (LT, 24, 0.95, 1.0, 'highpass=f=300,lowpass=f=3400'), 'weather': (LT, 45, 1.0, 1.0, 'highpass=f=100,lowpass=f=7500'), 'sports': (LT, 3, 0.96, 1.0, 'highpass=f=100,lowpass=f=7500'),
 # people in the street (three of each), callers and the police
 'pedM0': (LT, 111, 1.0, 1.0, ''), 'pedM1': (LT, 57, 1.0, 1.0, ''), 'pedM2': (LT, 6, 1.0, 1.0, 'highpass=f=300,lowpass=f=3400'), 'pedF0': (LT, 30, 1.0, 1.0, ''), 'pedF1': (LT, 75, 1.0, 1.0, ''), 'pedF2': (LT, 84, 1.0, 1.0, 'highpass=f=300,lowpass=f=3400'),
 'cop': (LT, 3, 1.0, 1.0, ''),
 # update 165: the Knights of Cum-a-lot speak through their helmets, Uncle Spooge is slow and wheezy
 'worker': (LT, 30, 1.05, 1.0, ''), 'knight': (LT, 72, 1.02, 1.0, 'lowpass=f=3800,aecho=0.8:0.35:18:0.3'), 'spooge': (LT, 111, 1.14, 1.0, 'lowpass=f=6000'),
}
def key(who, text):
    h = 0x811c9dc5; s = (who + '|' + text).encode('utf-16-le')
    for i in range(0, len(s), 2):
        h ^= s[i] | (s[i + 1] << 8); h = (h * 0x01000193) & 0xffffffff
    n, out, abc = h, '', '0123456789abcdefghijklmnopqrstuvwxyz'
    while True:
        out = abc[n % 36] + out; n //= 36
        if not n: break
    return 'v' + out
SAYAS = [('Kaya', 'Kai-ya'), ('KAYA', 'Kai-ya')]  # update 162: how names are said (he said Kaya is pronounced kai-ya)
def speak(text, v, out):
    for a, b in SAYAS: text = text.replace(a, b)
    model, sp, slow, pitch, fx = v; raw = out + '.raw.wav'
    cmd = [os.path.join(PIPER, 'piper', 'piper'), '--model', os.path.join(PIPER, 'v', model + '.onnx'), '--length_scale', str(slow), '--noise_scale', '0.75', '--noise_w', '0.9', '--sentence_silence', '0.28', '--output_file', raw]
    if sp is not None: cmd += ['--speaker', str(sp)]
    subprocess.run(cmd, input=text.encode(), check=True, capture_output=True)
    af = ('asetrate=22050*%s,aresample=22050,atempo=%s,' % (pitch, min(2, max(0.5, 1 / pitch))) if pitch != 1.0 else '') + 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5'
    if fx: af += ',' + fx
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ac', '1', '-ar', '22050', '-b:a', '32k', out], check=True); os.remove(raw)
def job(q):
    who, text, out, real = q
    try:
        if real: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', real, '-af', 'loudnorm=I=-16:TP=-1.5', '-ac', '1', '-ar', '22050', '-b:a', '40k', out], check=True)
        else: speak(text.replace('...', ', '), V[who], out)
    except Exception as e: return str(e)
def main():
    import multiprocessing
    os.makedirs(OUT, exist_ok=True); lines = json.load(open(LINES)); done = {}; todo = []
    for who, text in lines:
        if who == 'steve' or who not in V: continue
        k = key(who, text); out = os.path.join(OUT, k + '.mp3'); done[k] = 1
        real = [os.path.join(REC, k + e) for e in ('.wav', '.mp3', '.m4a', '.ogg') if os.path.exists(os.path.join(REC, k + e))]
        redo = os.environ.get('REDO'); import re as _re
        if os.path.exists(out) and not real and '--all' not in sys.argv and not (redo and _re.search(redo, text)) and who not in os.environ.get('REDOWHO', '').split(','): continue
        todo.append((who, text, out, real[0] if real else None))
    with multiprocessing.Pool(int(os.environ.get('JOBS', '3'))) as pool:
        errs = [e for e in pool.map(job, todo) if e]
    for f in os.listdir(OUT):  # lines that are no longer in the game
        if f.endswith('.mp3') and f[:-4] not in done: os.remove(os.path.join(OUT, f))
    open(os.path.join(OUT, 'voices.js'), 'w').write('window.CCNVOICE = ' + json.dumps(done, separators=(',', ':')) + ';\n')
    size = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(len(todo), 'made,', len(done), 'lines,', round(size / 1e6, 2), 'MB', 'errors', errs[:3])
main()
