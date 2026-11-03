#!/usr/bin/env python3
"""Spermaid's sprites, made from Hunter's own original drawing (original.png), so every game shows her as he drew her:
a slim cream droplet with a curled tip and a little drop above it, a wink, black shell bra, teal scaly tail, hot pink fin.

The drawing is shrunk in two steps (to twice the size, colours snapped to her palette, then halved keeping the dark
outline wherever any of the four pixels had it), so the lines survive at sprite size. Frames:
  front  (waving, the pose he drew)      swim0-2 (the same pose, the tail swishing)      dead (lying on her side, X eyes)
Run:  python3 tools/spermaid/make.py   -> writes frames.png / frames.json here and patches Load Legacy's sprite sheets.
"""
import json, math, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = Image.open(os.path.join(HERE, 'original.png')).convert('RGBA')
SRC = SRC.crop(SRC.getbbox())

K = (18, 4, 10)  # the house outline colour
PAL = [K, (255, 244, 222), (238, 222, 190), (214, 190, 150), (26, 26, 30), (26, 160, 176), (10, 112, 136), (58, 196, 196), (16, 72, 150),
       (240, 16, 120), (160, 10, 96), (255, 120, 170), (232, 200, 120)]
DARK = {0, 4}
FEAT = 0.16


def near(c):
    best, bi = 1e9, 0
    for i, p in enumerate(PAL):
        d = (c[0] - p[0]) ** 2 * 0.3 + (c[1] - p[1]) ** 2 * 0.59 + (c[2] - p[2]) ** 2 * 0.11
        if d < best: best, bi = d, i
    return bi


def shrink(img, h, feat=False, face='open'):
    """img (RGBA) -> pixel sprite h tall. Each sprite pixel takes the colour most of its block has (cream, teal, pink, bra);
    a block that is mostly the drawing's black line becomes the outline. Thin inner lines drop out (they only make mush at
    this size) and the face is drawn back on by hand (FACE)."""
    import numpy as np
    a = np.asarray(img).astype(np.float32); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    lum = r * 0.3 + g * 0.59 + b * 0.11; H0, W0 = lum.shape
    cls = np.full(lum.shape, -1, np.int8)                       # -1 none, 0 dark line, 1 cream, 2 cream shade, 5 teal, 9 pink
    op = al > 128
    pink = op & (r > 150) & (g < 110) & (b > 50)
    cls[op & (lum < 90) & ~pink] = 0; cls[pink] = 9
    teal = op & (b > r + 20) & (g > r) & (lum >= 60); cls[teal] = 5
    cream = op & (lum >= 150) & ~pink & ~teal; cls[cream] = 1
    shade = cream & (b < g - 30); cls[shade] = 2
    w = max(2, round(W0 * h / H0)); sy, sx = H0 / h, W0 / w
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); px = out.load()
    tl_y0 = None
    for y in range(h):
        for x in range(w):
            blk = cls[int(y * sy):int((y + 1) * sy), int(x * sx):int((x + 1) * sx)]; n = blk.size
            cov = (blk >= 0).sum() / n
            if cov < 0.42: continue
            cnt = {c: int((blk == c).sum()) for c in (0, 1, 2, 5, 9)}
            col = max((1, 2, 5, 9), key=lambda c: cnt[c])
            if cnt[col] < n * 0.22: v = 0
            elif feat and col in (1, 2) and y < h * 0.5 and cnt[0] > n * FEAT and 0.25 * w < x < 0.8 * w: v = 0  # the face: eyes, brows, smile
            elif col == 9 and cnt[0] > n * 0.3: v = 10   # the fin's stripes
            elif col == 5 and cnt[0] > n * 0.3: v = 6    # the tail's scales
            else: v = col
            if v == 5 and False:  # teal: lighter at the top of the tail, darker underneath
                v = 7 if y < h * 0.74 else 5 if y < h * 0.86 else 6
            if v == 2 and cnt[1] > cnt[2] * 0.6: v = 1
            px[x, y] = PAL[{0: 0, 1: 1, 2: 3, 5: 5, 6: 6, 7: 7, 9: 9, 10: 10}[v]] + (255,)
    # the bra: the dark band across her chest, drawn in its own black
    for y in range(h):
        for x in range(w):
            if px[x, y][3] and px[x, y][:3] == K and 0.52 * h <= y <= 0.62 * h and 0.3 * w <= x <= 0.72 * w: px[x, y] = PAL[4] + (255,)
    # a line where her waist meets the tail
    for y in range(1, h):
        for x in range(w):
            if px[x, y][3] and px[x, y][:3] in (PAL[5], PAL[6], PAL[7]) and px[x, y - 1][3] and px[x, y - 1][:3] in (PAL[1], PAL[2], PAL[3]): px[x, y] = K + (255,)
    if face: drawFace(px, w, h, W0, H0, face)
    o2 = out.copy(); p2 = o2.load()
    for y in range(h):
        for x in range(w):
            if px[x, y][3]: continue
            if any(0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] and px[x + dx, y + dy][:3] != K for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                p2[x, y] = K + (255,)
    return o2


# her face, traced from the drawing (in the cropped drawing's own coordinates) and drawn back on at sprite size
FACE = {'browR': [(556, 368), (586, 336), (618, 344)], 'browL': [(326, 488), (364, 458), (404, 446)], 'wink': [(318, 522), (362, 502), (408, 514)],
        'smile': [(392, 602), (446, 628), (506, 630), (566, 600)], 'eyeR': (568, 474, 34, 62), 'nose': (396, 574)}


def drawFace(px, w, h, W0, H0, kind):
    kx, ky = w / W0, h / H0
    def P(x, y, c=K):
        x, y = int(x), int(y)
        if 0 <= x < w and 0 <= y < h and px[x, y][3]: px[x, y] = c + (255,)
    def line(pts):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = 24
            for i in range(n + 1): P((x0 + (x1 - x0) * i / n) * kx, (y0 + (y1 - y0) * i / n) * ky)
    cx, cy, rx, ry = FACE['eyeR']; ex, ey = cx * kx, cy * ky
    if kind == 'dead':
        for (ax, ay) in ((ex, ey), (360 * kx, 505 * ky)):
            for k in (-1, 0, 1): P(ax + k, ay + k); P(ax + k, ay - k)
        line([(420, 612), (540, 612)]); return
    line(FACE['browR']); line(FACE['browL']); line(FACE['wink']); line(FACE['smile'])
    ew, eh = max(2, round(rx * 2 * kx)), max(3, round(ry * 2 * ky))
    x0, y0 = int(round(ex - ew / 2)), int(round(ey - eh / 2))
    for y in range(y0, y0 + eh):
        for x in range(x0, x0 + ew): P(x, y)
    P(x0, y0, (255, 255, 255))
    P(FACE['nose'][0] * kx, FACE['nose'][1] * ky)


def place(spr, W, H):
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.paste(spr, ((W - spr.width) // 2, H - spr.height), spr); return c


def armDown(img):
    """the swimming frames: her waving arm tucked away (the other hand stays on her hip)"""
    from PIL import ImageDraw
    img = img.copy(); m = Image.new('L', img.size, 0); ImageDraw.Draw(m).polygon([(0, 280), (262, 280), (272, 560), (292, 690), (336, 790), (240, 800), (0, 800)], fill=255)
    img.paste((0, 0, 0, 0), (0, 0), m)
    # her left arm hangs relaxed down her side instead (outline first, then cream)
    d = ImageDraw.Draw(img)
    d.line([(318, 770), (262, 930)], fill=(18, 4, 10, 255), width=78); d.ellipse((214, 900, 306, 992), fill=(18, 4, 10, 255))
    d.line([(318, 770), (262, 930)], fill=(255, 244, 222, 255), width=44); d.ellipse((232, 918, 288, 974), fill=(255, 244, 222, 255))
    return img


def swish(a, arm=True):
    """her pose with the tail swung by angle a (degrees): the tail (below the waist) turns about the hip"""
    img = SRC.copy() if arm else armDown(SRC); waist = int(img.height * 0.62)
    top = img.crop((0, 0, img.width, waist)); tail = img.crop((0, waist - 40, img.width, img.height))
    pv = (int(img.width * 0.42), 40)
    tail = tail.rotate(a, resample=Image.BICUBIC, center=pv, expand=False)
    out = Image.new('RGBA', img.size, (0, 0, 0, 0)); out.paste(tail, (0, waist - 40), tail); out.paste(top, (0, 0), top)
    return out


def frames():
    F = {}
    F['front'] = place(shrink(armDown(SRC), 46), 34, 48)   # standing: arms down (NOT waving)
    F['wave'] = place(shrink(SRC, 46), 34, 48)             # the greeting only, when you walk up to her
    for i, a in enumerate((0, 7, -6)): F['swim%d' % i] = place(shrink(swish(a, False), 46), 34, 48)
    # dead: lying on her side with crosses for eyes
    s = shrink(armDown(SRC), 46, face='dead').rotate(90, expand=True)
    dead = Image.new('RGBA', (52, 37), (0, 0, 0, 0)); dead.paste(s, ((52 - s.width) // 2, 37 - s.height), s)
    F['dead'] = dead
    # Cumheads Quest draws her at 32x46 and a little one at 26x38
    F['cq'] = place(shrink(armDown(SRC), 44), 32, 46)
    F['cqwave'] = place(shrink(SRC, 44), 32, 46)
    F['cqs'] = place(shrink(swish(4, False), 44), 32, 46)
    F['cqsmall'] = place(shrink(armDown(SRC), 37), 26, 38)
    F['cqback'] = place(shrink(armDown(SRC), 44, face=None), 32, 46)
    F['cqdead'] = place(shrink(armDown(SRC), 44, face='dead'), 32, 46)
    return F


def patch_ll(F):
    js = json.load(open(os.path.join(ROOT, 'tools/load-legacy/sprites.json')))
    fr = js.get('frames', js)
    use = {'npc_spermaid': 'front', 'spermaid_d': 'front', 'spermaid_s0': 'swim0', 'spermaid_s1': 'swim1', 'spermaid_s2': 'swim2', 'spermaid_dead': 'dead'}
    for sheet in ('sprites-base.png', 'sprites.png'):
        p = os.path.join(ROOT, 'tools/load-legacy', sheet); im = Image.open(p).convert('RGBA')
        for k, f in use.items():
            x, y, w, h = fr[k]; im.paste((0, 0, 0, 0), (x, y, x + w, y + h)); s = F[f]
            if s.size != (w, h): s = place(s, w, h) if s.width <= w and s.height <= h else s.resize((w, h), Image.NEAREST)
            im.paste(s, (x, y), s)
        im.save(p)


def enc(im):
    """a frame as text: a palette, then one letter per pixel ('.' = clear)"""
    cols, out = [], []
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            c = px[x, y]
            if c[3] < 128: out.append('.'); continue
            h = '#%02x%02x%02x' % c[:3]
            if h not in cols: cols.append(h)
            out.append(chr(65 + cols.index(h)))
    return {'w': im.width, 'h': im.height, 'p': cols, 'd': ''.join(out)}


def patch_cq(F):
    import base64, io, re
    p = os.path.join(ROOT, 'www/games/cumheads-quest.html'); h = open(p, encoding='utf-8').read()
    b = io.BytesIO(); F['cqsmall'].save(b, 'PNG'); h = re.sub(r'"spermaid": "[A-Za-z0-9+/=]+"', '"spermaid": "' + base64.b64encode(b.getvalue()).decode() + '"', h, 1)
    data = {k: enc(F[v]) for k, v in (('d', 'cq'), ('s', 'cqs'), ('u', 'cqback'), ('f', 'cq'), ('x', 'cqdead'), ('w', 'cqwave'))}
    blk = ('/* SPERMAID-PIX: her sprites made from Hunter\'s original drawing (tools/spermaid/make.py writes this block) */\n'
           'var SPERMPIX = ' + json.dumps(data, separators=(',', ':')) + ';\n'
           "function spermV(v, dead) { var f = SPERMPIX[dead ? 'x' : v === 'd' || v === 's' || v === 'u' ? v : 'f'], c = mk(f.w, f.h), g = c.getContext('2d'), im = g.createImageData(f.w, f.h), q = im.data;\n"
           "  var P = f.p.map(function (h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; });\n"
           "  for (var i = 0; i < f.d.length; i++) { var ch = f.d.charCodeAt(i); if (ch === 46) continue; var col = P[ch - 65]; q[i * 4] = col[0]; q[i * 4 + 1] = col[1]; q[i * 4 + 2] = col[2]; q[i * 4 + 3] = 255; }\n"
           "  g.putImageData(im, 0, 0); return c; }\n/* /SPERMAID-PIX */\n")
    h = re.sub(r'/\* SPERMAID-PIX:.*?/\* /SPERMAID-PIX \*/\n', '', h, flags=re.S)
    i = h.index('function bigSprV('); i = h.index('\n', i) + 1; h = h[:i] + blk + h[i:]  # same scope as the old spermV, after it, so this one wins
    open(p, 'w', encoding='utf-8').write(h)


if __name__ == '__main__':
    F = frames()
    names = list(F); W = sum(F[n].width + 2 for n in names); H = max(F[n].height for n in names)
    sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0)); meta = {}; x = 0
    for n in names: sheet.paste(F[n], (x, 0)); meta[n] = [x, 0, F[n].width, F[n].height]; x += F[n].width + 2
    sheet.save(os.path.join(HERE, 'frames.png')); json.dump(meta, open(os.path.join(HERE, 'frames.json'), 'w'))
    if '--ll' in sys.argv: patch_ll(F)
    if '--cq' in sys.argv: patch_cq(F)
    print('ok', meta)
