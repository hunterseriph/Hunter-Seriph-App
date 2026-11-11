#!/usr/bin/env python3
"""Psycho Nightmare: stand-in voices made with Piper (a text-to-speech program), until real recordings replace them.

  python3 tools/psycho-voice/tts.py /path/to/piper-folder     (holds piper/piper and v/*.onnx)
  python3 tools/psycho-voice/make.py

Piper: github.com/rhasspy/piper release 2023.11.14-2 (piper_linux_x86_64.tar.gz); voices from its v0.0.2 release:
voice-en-us-ryan-medium (TB) and voice-en-us-libritts-high (the henchmen, by speaker number).
The words below are only how the lines are SAID (a southern drawl spelt out for the machine). What is shown on
screen is always the exact line from the game. A real recording dropped into recordings/ with the same id replaces one.
The Stitched Stag has no words, so it keeps the in-game growl.
"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); REC = os.path.join(HERE, 'recordings')
PIPER = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/piper-dl'
SAY = {  # the drawl: how TB's lines are spelt for the machine
 'tb01': 'Fuuck. muck.', 'tb02': 'Shit head. La boozy.', 'tb03': 'Lemme tighten that kye-no-dez-mee.', 'tb04': 'Dick. skin.',
 'tb05': 'Why ma. wimmina.', 'tb06': "Suck yer own, an' fuck yer own.", 'tb07': 'Suck me, fuck me, suck me, fuck me.',
 'tb08': "Ah got lotion on mah dick. Ah'm out here shootin' mah shit. Ah'm free, man, fer real!", 'tb09': 'Ol\' geezer. Prick teaser.',
 'tb10': 'Ah made muckies...', 'tb11': "A sissy don't deserve pleasure. A sissy is somebody's play thang.", 'tb12': 'Yew shoot real hard, huh?',
 'tb13': "Ah'm a fuckin' piggy.", 'tb14': "Who's ready fer shit head puddin'?", 'tb15': 'Hoh-lee shit!', 'tb16': 'Cock. rinse.',
 'tb17': "Yew suck, ah'll spray.", 'tb18': "Where the fuck d'yew think yer goin'? Prick!", 'tb19': "Oh gawd, ah'm pushin' piss outta mah dick.",
 'tb20': "Ah'm so fucked raht now.", 'tb21': "Who's ready fer sissy-fi-cation? Ah'll make yew pretty. So pretty...", 'tb22': "Ah'm a tucker fucker!", 'tb23': "Yew'll make a good sissy.",
 'tbend': "Take it easy, bro. Come back agin soon!", 'tbwoods': 'Make me yer pretty vocaloid pig.', 'tbkid': "Just kiddin', bro.",
}
# who speaks: model, speaker, slowness, pitch (1 = as made), extra ffmpeg filters
TB = dict(model='en-us-ryan-medium', sp=None, slow=1.42, pitch=0.86, fx='acompressor=threshold=-20dB:ratio=3,aecho=0.8:0.5:38:0.18,bass=g=5')
WHO = {
 'muckies': dict(model='en-us-libritts-high', sp=42, slow=1.3, pitch=0.9, fx='aecho=0.8:0.6:60:0.25,bass=g=6'),
 'smiles': dict(model='en-us-libritts-high', sp=4, slow=1.05, pitch=1.1, fx='aecho=0.8:0.7:22:0.35', twin=dict(sp=26, pitch=0.92, delay=70)),
 'bride': dict(model='en-us-libritts-high', sp=12, slow=1.45, pitch=0.93, fx='aecho=0.8:0.7:120|240:0.3|0.18'),
 'sissifier': dict(model='en-us-libritts-high', sp=24, slow=1.15, pitch=1.1, fx='aecho=0.8:0.5:30:0.2,treble=g=3'),
}
def speak(text, v, out, sp=None, pitch=None):
    sp = v['sp'] if sp is None else sp; pitch = pitch or v['pitch']; raw = out + '.raw.wav'
    cmd = [os.path.join(PIPER, 'piper', 'piper'), '--model', os.path.join(PIPER, 'v', v['model'] + '.onnx'), '--length_scale', str(v['slow']), '--sentence_silence', '0.28', '--output_file', raw]
    if sp is not None: cmd += ['--speaker', str(sp)]
    subprocess.run(cmd, input=text.encode(), check=True, capture_output=True)
    # pitch: play the samples slower or faster, then put the speed back
    af = 'asetrate=22050*%s,aresample=44100,atempo=%s,%s' % (pitch, min(2, max(0.5, 1 / pitch)), v['fx'])
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, out], check=True); os.remove(raw)
os.makedirs(REC, exist_ok=True); n = 0
for id_, who, line in json.load(open(os.path.join(HERE, 'lines.json'))):
    out = os.path.join(REC, id_ + '.wav'); key = id_.split('_')[0]
    if any(os.path.exists(os.path.join(REC, id_ + e)) for e in ('.mp3', '.m4a', '.ogg', '.flac')): print('kept the real recording:', id_); continue
    if id_ in SAY: speak(SAY[id_], TB, out)
    elif key in WHO:
        v = WHO[key]; speak(line, v, out)
        if v.get('twin'):  # the second head says it too, a breath behind
            t = v['twin']; b = out + '.b.wav'; speak(line, v, b, sp=t['sp'], pitch=t['pitch']); m = out + '.m.wav'
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', out, '-i', b, '-filter_complex', '[1]adelay=%d[b];[0][b]amix=inputs=2:duration=longest:normalize=0' % t['delay'], m], check=True); os.replace(m, out); os.remove(b)
    else: continue
    n += 1; print('spoke', id_)
print(n, 'lines spoken')
