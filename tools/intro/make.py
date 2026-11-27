#!/usr/bin/env python3
"""The SERIPH intro (update 185, his ask): like the Mega Drive SEGA screen in Sonic 2. Black screen, Cumhead dashes past,
a blood red SERIPH logo is left behind him, it lights up and a voice calls "SEEEERIIIIPH".

python3 tools/intro/make.py      -> www/games/seriph-intro.js (logo, Cumhead's dash frames and the voice, all inside it)

Needs: Piper (tools/city/voices.py has where it comes from) at /home/claude/piper-dl, ffmpeg, the Spermhog sprite sheet
(Cumhead's ch_run0..6 dash, read out of www/games/spermhog.html), SEGA.TTF next to this file."""
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
    lines = Image.fromarray(((np.isin(lab, [i + 1 for i, z in enumerate(sizes) if z >= 400])) * 255).astype('uint8'))  # only the real cut lines, not specks
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
    s = open(os.path.join(GAMES, 'spermhog.html'), encoding='utf-8').read()
    spr = json.loads(re.search(r'SPR = (\{.*?\})[,;]', s).group(1))
    sheet = Image.open(io.BytesIO(base64.b64decode(re.search(r'SHEET.src = "data:image/png;base64,([^"]+)"', s).group(1)))).convert('RGBA')
    fr = [sheet.crop((spr['ch_run%d' % i][0], spr['ch_run%d' % i][1], spr['ch_run%d' % i][0] + spr['ch_run%d' % i][2], spr['ch_run%d' % i][1] + spr['ch_run%d' % i][3])) for i in range(7)]
    W = max(f.width for f in fr); H = max(f.height for f in fr); strip = Image.new('RGBA', (W * len(fr), H), (0, 0, 0, 0))
    for i, f in enumerate(fr): strip.alpha_composite(f, (i * W + (W - f.width) // 2, H - f.height))  # feet on one line
    return strip, W, H


def voice():
    """SEEEERIIIIPH: Seriph said slowly by three voices at once (Cumhead's in the middle), a touch higher, in a big room"""
    tmp = tempfile.mkdtemp(); parts = []
    for k, (sp, ls) in enumerate([(50, 2.6), (57, 2.5), (51, 2.7)]):
        out = os.path.join(tmp, 'v%d.wav' % k)
        subprocess.run([os.path.join(PIPER, 'piper', 'piper'), '--model', os.path.join(PIPER, 'v', 'en-us-libritts-high.onnx'), '--speaker', str(sp), '--length_scale', str(ls), '--noise_scale', '0.5', '--noise_w', '0.4', '--output_file', out], input=b'Seriph!', check=True, capture_output=True)
        parts.append(out)
    mix = os.path.join(tmp, 'seriph.mp3')
    fc = ('[0]silenceremove=start_periods=1:start_threshold=-40dB,asetrate=22050*1.06,aresample=44100[a];'
          '[1]silenceremove=start_periods=1:start_threshold=-40dB,asetrate=22050*1.1,aresample=44100,adelay=18,volume=0.6[b];'
          '[2]silenceremove=start_periods=1:start_threshold=-40dB,asetrate=22050*1.02,aresample=44100,adelay=30,volume=0.6[c];'
          '[a][b][c]amix=inputs=3:normalize=0,aecho=0.8:0.55:70|140:0.28|0.16,highpass=f=90,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-12:TP=-1,afade=t=out:st=1.5:d=0.5')
    subprocess.run(['ffmpeg', '-y', '-v', 'error'] + sum([['-i', p] for p in parts], []) + ['-filter_complex', fc, '-ac', '1', '-ar', '44100', '-b:a', '96k', '-t', '2.1', mix], check=True)
    return open(mix, 'rb').read()


def b64png(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


if __name__ == '__main__':
    lit, dim = logo(True), logo(False)
    lit.save('/tmp/claude-0/seriph-lit.png'); dim.save('/tmp/claude-0/seriph-dim.png')
    strip, fw, fh = dash_frames()
    mp3 = voice(); open('/tmp/claude-0/seriph.mp3', 'wb').write(mp3)
    js = open(os.path.join(HERE, 'intro.js'), encoding='utf-8').read()
    data = 'var SI_DATA = %s;\n' % json.dumps({'lit': b64png(lit), 'dim': b64png(dim), 'run': b64png(strip), 'fw': fw, 'fh': fh, 'n': 7,
                                               'voice': 'data:audio/mpeg;base64,' + base64.b64encode(mp3).decode()})
    out = os.path.join(GAMES, 'seriph-intro.js'); open(out, 'w', encoding='utf-8').write(js.replace('/*SI_DATA*/', data))
    print(out, os.path.getsize(out) // 1024, 'KB')
