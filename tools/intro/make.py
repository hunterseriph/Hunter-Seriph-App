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
sys.path.insert(0, HERE)
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


def voice(hold=-9, step=-4):
    """SEERIIIPH to his spec (updates 188-192): sung by seriph_voice.py (SEEEE held for 0.7 s on G#3, then RIIIIPH
    down a major third, ding-dong, with a long IIIII, cut off dead at 1.25 s), with a soft early-90s console sample
    sound: a gentle presence lift, light squash, a lower sample rate and a little 8-bit grit, at half the old loudness."""
    import seriph_voice
    tmp = tempfile.mkdtemp(); sung = os.path.join(tmp, 'sung.wav'); mix = os.path.join(tmp, 'seriph.mp3'); seriph_voice.make(sung, hold, step)
    af = ('highpass=f=110,equalizer=f=1000:t=q:w=1.0:g=2,equalizer=f=3500:t=q:w=1.2:g=1.5,'  # update 192 (he said too loud and harsh): softer top, no exciter
          'acompressor=threshold=-24dB:ratio=3.5:attack=3:release=60:makeup=3,'
          'aresample=16000:filter_size=8,acrusher=bits=8:mode=lin:mix=0.12,aresample=44100,lowpass=f=6800,'
          'alimiter=limit=0.8,loudnorm=I=-16:TP=-3')  # half as loud as update 191 (-10 LUFS: 6 dB down)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', sung, '-af', af, '-ac', '1', '-ar', '44100', '-b:a', '128k', mix], check=True)
    return open(mix, 'rb').read()


def b64png(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


if __name__ == '__main__':
    lit, dim = logo(True), logo(False)
    lit.save('/tmp/claude-0/seriph-lit.png'); dim.save('/tmp/claude-0/seriph-dim.png')
    strip, fw, fh = dash_frames()
    # update 193: he made the voice himself (tools/intro/seriph.mp3): it is used as it is, and started early by the
    # silence at its front so the SEERIIIPH lands as the logo lights up. Without that file, the sung one below.
    own = os.path.join(HERE, 'seriph.mp3'); lead = 0.0
    if os.path.exists(own):
        mp3 = open(own, 'rb').read()
        r = subprocess.run(['ffmpeg', '-v', 'info', '-i', own, '-af', 'silencedetect=n=-45dB:d=0.1', '-f', 'null', '-'], capture_output=True, text=True).stderr
        ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', r)]; starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', r)]
        lead = max([e for e, s in zip(ends, starts) if s < 0.9 and e < 1.2] or [0.0])  # where the voice itself starts
    else:
        mp3 = voice()
    js = open(os.path.join(HERE, 'intro.js'), encoding='utf-8').read()
    data = 'var SI_DATA = %s;\n' % json.dumps({'lit': b64png(lit), 'dim': b64png(dim), 'run': b64png(strip), 'fw': fw, 'fh': fh, 'n': 8,
                                               'voice': 'data:audio/mpeg;base64,' + base64.b64encode(mp3).decode(), 'lead': round(lead, 3)})
    out = os.path.join(GAMES, 'seriph-intro.js'); open(out, 'w', encoding='utf-8').write(js.replace('/*SI_DATA*/', data))
    print(out, os.path.getsize(out) // 1024, 'KB')
