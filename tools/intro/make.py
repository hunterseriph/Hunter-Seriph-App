#!/usr/bin/env python3
"""The SERIPH intro (update 185, his ask): like the Mega Drive SEGA screen in Sonic 2. Black screen, Cumhead dashes past,
a blood red SERIPH logo is left behind him, it lights up and a voice calls "SEEEERIIIIPH".

python3 tools/intro/make.py      -> www/games/seriph-intro.js (logo, Cumhead's dash frames and the voice, all inside it)

Needs: Piper (tools/city/voices.py has where it comes from) at /home/claude/piper-dl, ffmpeg, the Spermhog sprite sheet
(Cumhead's smooth run, ch_rn0..7, read out of www/games/spermhog.html), SEGA.TTF next to this file."""
import base64, io, json, os, re, subprocess, sys, tempfile
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(os.path.dirname(HERE)); GAMES = os.path.join(APP, 'www', 'games')
PIPER = '/home/claude/piper-dl'
SEGAF = os.path.join(HERE, 'SEGA.TTF')  # his SEGA logo font (he sent it so the lettering is right)


def er(m, r):  # erode by r px
    return m.filter(ImageFilter.MinFilter(r * 2 + 1)) if r > 0 else m


def di(m, r):
    out = m
    while r > 0:
        k = min(r, 5); out = out.filter(ImageFilter.MaxFilter(k * 2 + 1)); r -= k
    return out


def grad(size, top, bot):
    w, h = size; g = Image.new('RGBA', size)
    d = ImageDraw.Draw(g)
    for y in range(h):
        t = y / max(1, h - 1); d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)) + (255,))
    return g


def logo_mask():
    """SERIPH in the SEGA logo's own lettering (his SEGA.TTF): returns the letters, the letters with their cut lines
    filled in, and the thin lines cut through them (each letter on its own, so the gaps between letters stay open)"""
    f = ImageFont.truetype(SEGAF, 220); text = 'SERIPH'; W, H = 1700, 360
    big = Image.new('L', (W, H), 0); whole = Image.new('L', (W, H), 0); x = 60
    for c in text:
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).text((x, 40), c, font=f, fill=255); x += f.getlength(c) + 16
        big = ImageChops.lighter(big, m); whole = ImageChops.lighter(whole, er(di(m, 6), 6))
    bb = whole.getbbox(); bb = (bb[0] - 30, bb[1] - 30, bb[2] + 30, bb[3] + 30)
    big, whole = big.crop(bb), whole.crop(bb)
    lines = ImageChops.multiply(ImageChops.subtract(whole, big), er(whole, 4))  # not the little wedges the filling leaves in outside corners
    import numpy as np, scipy.ndimage as nd
    L = np.array(lines) > 100; lab, n = nd.label(L); sizes = nd.sum(L, lab, range(1, n + 1))
    lines = Image.fromarray(((np.isin(lab, [i + 1 for i, z in enumerate(sizes) if z >= 1000])) * 255).astype('uint8'))  # only the real cut lines, not specks or the gaps between the E's and the P's arms (update 185, he saw white there)
    return big, whole, lines


def logo(lit):
    m, whole, lines = logo_mask(); S = m.size; im = Image.new('RGBA', S, (0, 0, 0, 0))
    def put(mask, src):
        nonlocal im; src = src.copy(); src.putalpha(mask); im.alpha_composite(src)
    if lit:
        put(di(whole, 4), Image.new('RGBA', S, (40, 0, 6, 255)))
        put(m, grad(S, (255, 46, 56), (128, 0, 14)))
        put(lines, Image.new('RGBA', S, (255, 226, 214, 255)))
    else:
        put(di(whole, 4), Image.new('RGBA', S, (14, 0, 3, 255)))
        put(m, grad(S, (78, 6, 14), (38, 0, 6)))
        put(lines, Image.new('RGBA', S, (20, 2, 4, 255)))
    return im


def dash_frames():
    """Cumhead's run: the smooth eight-frame run Spermhog uses now (ch_rn0..7), not the old dash frames"""
    s = open(os.path.join(GAMES, 'spermhog.html'), encoding='utf-8').read()
    spr = json.loads(re.search(r'SPR = (\{.*?\})[,;]', s).group(1))
    sheet = Image.open(io.BytesIO(base64.b64decode(re.search(r'SHEET.src = "data:image/png;base64,([^"]+)"', s).group(1)))).convert('RGBA')
    fr = []
    for i in range(8):
        x, y, w, h = spr['ch_rn%d' % i][:4]; fr.append(sheet.crop((x, y, x + w, y + h)))
    W = max(f.width for f in fr); H = max(f.height for f in fr); strip = Image.new('RGBA', (W * len(fr), H), (0, 0, 0, 0))
    for i, f in enumerate(fr): strip.alpha_composite(f, (i * W + (W - f.width) // 2, H - f.height))  # feet on one line
    return strip, W, H


def _segs(path):
    """where the voice is in a recording of "Seriph": start and end of the voiced part (the E-R-I), from the sound itself"""
    import wave, numpy as np
    w = wave.open(path); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    hop, win = int(sr * 0.005), int(sr * 0.025); E, HI = [], []
    for i in range(0, len(x) - win, hop):
        S = np.abs(np.fft.rfft(x[i:i + win] * np.hanning(win))) ** 2; fq = np.fft.rfftfreq(win, 1 / sr); e = S.sum() + 1e-12; E.append(e); HI.append(S[fq > 3500].sum() / e)
    E, HI = np.array(E), np.array(HI); v = np.where((E > E.max() * 0.02) & (HI < 0.25))[0]
    return v[0] * hop / sr, v[-1] * hop / sr, len(x) / sr


def _stretch(path, out, e_len=0.56, i_len=0.52):
    """SEEEE-RIIIII-PH: the E and the I are held, like the long vowels in the SEGA call. Each vowel's steady middle is
    stretched on its own (the S, the R and the PH stay their natural length), with short crossfades between the pieces"""
    v0, v1, T = _segs(path); L = v1 - v0
    cuts = [0, v0 + L * 0.12, v0 + L * 0.46, v0 + L * 0.58, v1 - L * 0.04, T]  # S | E | R | I | PH
    def tempo(seg, want):
        k = seg / want; f = []
        while k < 0.5: f.append('atempo=0.5'); k /= 0.5
        f.append('atempo=%.4f' % k); return ','.join(f)
    parts = []
    for n in range(5):
        a, b = cuts[n], cuts[n + 1]; f = 'atrim=%.4f:%.4f,asetpts=PTS-STARTPTS' % (a, b)
        if n == 1: f += ',' + tempo(b - a, e_len)
        if n == 3: f += ',' + tempo(b - a, i_len)
        parts.append('[0]%s[p%d]' % (f, n))
    fc = ';'.join(parts) + ';[p0][p1]acrossfade=d=0.012[q1];[q1][p2]acrossfade=d=0.012[q2];[q2][p3]acrossfade=d=0.012[q3];[q3][p4]acrossfade=d=0.012'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', path, '-filter_complex', fc, out], check=True)


def voice():
    """SEEEERIIIIPH: Seriph called by a little choir (Cumhead's voice in the middle), the E and the I held long like the
    SEGA call's SEEE and GAAA, a touch higher, in a big room"""
    tmp = tempfile.mkdtemp(); parts = []
    for k, (sp, ls) in enumerate([(50, 1.15), (57, 1.15), (51, 1.15), (102, 1.15)]):
        raw = os.path.join(tmp, 'r%d.wav' % k); out = os.path.join(tmp, 'v%d.wav' % k)
        subprocess.run([os.path.join(PIPER, 'piper', 'piper'), '--model', os.path.join(PIPER, 'v', 'en-us-libritts-high.onnx'), '--speaker', str(sp), '--length_scale', str(ls), '--noise_scale', '0.4', '--noise_w', '0.3', '--output_file', raw], input=b'Seriph.', check=True, capture_output=True)
        _stretch(raw, out); parts.append(out)
    mix = os.path.join(tmp, 'seriph.mp3')
    fc = ('[0]silenceremove=start_periods=1:start_threshold=-40dB,asetrate=22050*1.07,aresample=44100[a];'
          '[1]silenceremove=start_periods=1:start_threshold=-40dB,asetrate=22050*1.12,aresample=44100,adelay=14,volume=0.55[b];'
          '[2]silenceremove=start_periods=1:start_threshold=-40dB,asetrate=22050*1.03,aresample=44100,adelay=24,volume=0.55[c];'
          '[3]silenceremove=start_periods=1:start_threshold=-40dB,asetrate=22050*1.16,aresample=44100,adelay=8,volume=0.4[d];'
          '[a][b][c][d]amix=inputs=4:normalize=0,aecho=0.8:0.5:60|120:0.25|0.14,highpass=f=90,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-12:TP=-1,afade=t=out:st=1.6:d=0.4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error'] + sum([['-i', p] for p in parts], []) + ['-filter_complex', fc, '-ac', '1', '-ar', '44100', '-b:a', '112k', '-t', '2.1', mix], check=True)
    return open(mix, 'rb').read()


def b64png(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


if __name__ == '__main__':
    lit, dim = logo(True), logo(False)
    lit.save('/tmp/claude-0/seriph-lit.png'); dim.save('/tmp/claude-0/seriph-dim.png')
    strip, fw, fh = dash_frames()
    mp3 = voice(); open('/tmp/claude-0/seriph.mp3', 'wb').write(mp3)
    js = open(os.path.join(HERE, 'intro.js'), encoding='utf-8').read()
    data = 'var SI_DATA = %s;\n' % json.dumps({'lit': b64png(lit), 'dim': b64png(dim), 'run': b64png(strip), 'fw': fw, 'fh': fh, 'n': 8,
                                               'voice': 'data:audio/mpeg;base64,' + base64.b64encode(mp3).decode()})
    out = os.path.join(GAMES, 'seriph-intro.js'); open(out, 'w', encoding='utf-8').write(js.replace('/*SI_DATA*/', data))
    print(out, os.path.getsize(out) // 1024, 'KB')
