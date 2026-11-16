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
V = {
 'lab': (LT, 51, 0.95, 1.06, ''), 'cumhead': (LT, 66, 1.0, 1.04, ''), 'greebo': (LT, 54, 0.95, 1.12, ''), 'spermaid': (LT, 9, 1.0, 1.05, ''),
 'amy': (LT, 21, 0.95, 1.0, ''), 'saba': (LT, 27, 1.1, 0.95, ''), 'joff': (LT, 57, 0.95, 1.0, ''), 'beeb': (LT, 90, 1.05, 0.95, ''),
 'harold': (LT, 105, 0.9, 1.06, ''), 'kaya': (LT, 15, 0.95, 1.0, ''), 'elden': (LT, 72, 1.0, 1.0, ''), 'ali': (LT, 78, 0.95, 1.0, ''),
 'potbelly': (LT, 102, 1.0, 0.94, ''), 'pulsar': (LT, 117, 1.12, 1.1, 'aecho=0.8:0.4:40:0.15'), 'bonjo': (LT, 69, 1.0, 1.02, ''), 't': (LT, 0, 1.12, 0.94, ''),
 'jessiah': (LT, 6, 1.05, 0.96, ''), 'natty': (LT, 114, 1.05, 0.95, ''), 'judge': (LT, 48, 1.1, 0.92, 'aecho=0.8:0.5:50:0.15'), 'fate': (LT, 60, 1.2, 0.9, 'aecho=0.8:0.5:70:0.2'),
 'bates': (LT, 24, 1.15, 0.9, ''), 'blumhead': (LT, 42, 1.1, 0.85, 'aecho=0.8:0.6:60:0.25'), 'clown': (LT, 81, 0.9, 1.15, ''),
 'tb': ('en-us-ryan-medium', None, 1.42, 0.86, 'acompressor=threshold=-20dB:ratio=3,aecho=0.8:0.5:38:0.18,bass=g=5'),
 # the radio DJs
 'hs': (LT, 81, 1.0, 0.96, 'highpass=f=120,lowpass=f=6500'), 'bl': (LT, 90, 1.08, 0.9, 'highpass=f=150,lowpass=f=5000'), 'po': (LT, 117, 1.1, 1.1, 'highpass=f=120,lowpass=f=6500'), 'talk': (LT, 51, 0.95, 1.06, 'highpass=f=150,lowpass=f=5500'),
 # people in the street and the police
 'pedM': (LT, 111, 1.0, 1.0, ''), 'pedF': (LT, 30, 1.0, 1.0, ''), 'cop': (LT, 3, 1.0, 1.0, ''),
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
def speak(text, v, out):
    model, sp, slow, pitch, fx = v; raw = out + '.raw.wav'
    cmd = [os.path.join(PIPER, 'piper', 'piper'), '--model', os.path.join(PIPER, 'v', model + '.onnx'), '--length_scale', str(slow), '--sentence_silence', '0.2', '--output_file', raw]
    if sp is not None: cmd += ['--speaker', str(sp)]
    subprocess.run(cmd, input=text.encode(), check=True, capture_output=True)
    af = 'asetrate=22050*%s,aresample=22050,atempo=%s,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5' % (pitch, min(2, max(0.5, 1 / pitch)))
    if fx: af += ',' + fx
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ac', '1', '-ar', '22050', '-b:a', '32k', out], check=True); os.remove(raw)
def main():
    os.makedirs(OUT, exist_ok=True); lines = json.load(open(LINES)); done = {}; n = 0
    for who, text in lines:
        if who == 'steve' or who not in V: continue
        k = key(who, text); out = os.path.join(OUT, k + '.mp3'); done[k] = 1
        real = [os.path.join(REC, k + e) for e in ('.wav', '.mp3', '.m4a', '.ogg') if os.path.exists(os.path.join(REC, k + e))]
        if os.path.exists(out) and not real: continue
        if real: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', real[0], '-af', 'loudnorm=I=-16:TP=-1.5', '-ac', '1', '-ar', '22050', '-b:a', '40k', out], check=True)
        else: speak(text.replace('...', ', '), V[who], out)
        n += 1
    for f in os.listdir(OUT):  # lines that are no longer in the game
        if f.endswith('.mp3') and f[:-4] not in done: os.remove(os.path.join(OUT, f))
    open(os.path.join(OUT, 'voices.js'), 'w').write('window.CCNVOICE = ' + json.dumps(done, separators=(',', ':')) + ';\n')
    size = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(n, 'made,', len(done), 'lines,', round(size / 1e6, 2), 'MB')
main()
