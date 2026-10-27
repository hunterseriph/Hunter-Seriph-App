"""Game logos, in the style of the Cumheads Quest logo: a mascot on top of chunky, outlined, extruded lettering.

python3 tools/logos/make.py            -> www/assets/<id>-logo.webp for every game
python3 tools/logos/make.py ll wn      -> only those

Each game has its own colours and extras (drips, rivets, neon, stars) so they don't all look the same.
"""
import math, os, random, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); TOOLS = os.path.dirname(HERE); APP = os.path.dirname(TOOLS)
ASSETS = os.path.join(APP, 'www', 'assets')
sys.path.insert(0, os.path.join(TOOLS, 'newgames'))
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
INK = (18, 4, 10, 255)


def hexc(h, a=255):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def dilate(mask, r):
    if r <= 0: return mask
    out = mask
    while r > 0:
        k = min(r, 4); out = out.filter(ImageFilter.MaxFilter(k * 2 + 1)); r -= k
    return out


def solid(mask, col):
    im = Image.new('RGBA', mask.size, col); im.putalpha(ImageChops.multiply(mask, Image.new('L', mask.size, col[3]))); return im


def word_mask(text, size, stretch=1.18, shear=0.0, arc=0.0, track=-0.02):
    f = ImageFont.truetype(FONT, size)
    # draw letter by letter for tighter tracking
    widths = [f.getlength(c) for c in text]; W = int(sum(widths) + size * track * len(text) + size); H = int(size * 1.4)
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m); x = size * 0.3
    for c, w in zip(text, widths):
        d.text((x, size * 0.1), c, font=f, fill=255); x += w + size * track
    m = m.crop(m.getbbox())
    m = m.resize((m.width, int(m.height * stretch)), Image.LANCZOS)
    if shear:
        pad = int(abs(shear) * m.height) + 2; big = Image.new('L', (m.width + pad, m.height), 0); big.paste(m, (pad if shear > 0 else 0, 0))
        m = big.transform(big.size, Image.AFFINE, (1, shear, -shear * m.height if shear > 0 else 0, 0, 1, 0), Image.BICUBIC)
        m = m.crop(m.getbbox())
    if arc:
        a = int(abs(arc)) + 2; out = Image.new('L', (m.width, m.height + a * 2), 0)
        for x in range(m.width):
            t = (x / max(1, m.width - 1)) * 2 - 1; dy = int(round(arc * (1 - t * t)))
            out.paste(m.crop((x, 0, x + 1, m.height)), (x, a - dy))
        m = out.crop(out.getbbox())
    return m


def gradient(size, stops):
    w, h = size; g = Image.new('RGBA', (1, h)); px = g.load()
    for y in range(h):
        t = y / max(1, h - 1)
        for i in range(len(stops) - 1):
            t0, c0 = stops[i]; t1, c1 = stops[i + 1]
            if t0 <= t <= t1:
                k = (t - t0) / max(1e-6, t1 - t0); px[0, y] = tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(4)); break
    return g.resize((w, h))


def letters(mask, st):
    """outline + extrusion + gradient fill + shine for one line of lettering"""
    o, rim, dep = st.get('outline', 10), st.get('rim', 4), st.get('depth', 12)
    pad = o + dep + 8; W, H = mask.width + pad * 2, mask.height + pad * 2
    m = Image.new('L', (W, H), 0); m.paste(mask, (pad, pad))
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    # extrusion: stacked copies down and to the right
    ex = Image.new('L', (W, H), 0)
    for i in range(dep + 1): ex = ImageChops.lighter(ex, ImageChops.offset(m, int(i * st.get('dx', 0.45)), i))
    out.alpha_composite(solid(dilate(ex, o), INK))
    exg = gradient((W, H), [(0, hexc(st['side'][0])), (1, hexc(st['side'][1]))]); exg.putalpha(dilate(ex, rim // 2)); out.alpha_composite(exg)
    # rim and face
    out.alpha_composite(solid(dilate(m, rim), hexc(st.get('rimc', '#12040a'))))
    out.alpha_composite(solid(dilate(m, max(1, rim - 2)), INK)) if st.get('rimc') else None
    face = gradient((W, H), [(t, hexc(c)) for t, c in st['face']]); top = pad; bot = pad + mask.height
    face = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fg = gradient((W, mask.height), [(t, hexc(c)) for t, c in st['face']]); face.paste(fg, (0, top))
    face.putalpha(m); out.alpha_composite(face)
    # shine: a soft light band near the top of each letter, and a dark lip at the bottom
    sh = ImageChops.multiply(m, ImageChops.offset(ImageChops.invert(m), 0, int(mask.height * 0.16)))
    hl = solid(sh, hexc(st.get('shine', '#ffffff'), 120)); out.alpha_composite(hl)
    lip = ImageChops.multiply(m, ImageChops.offset(ImageChops.invert(m), 0, -int(mask.height * 0.08)))
    out.alpha_composite(solid(lip, (0, 0, 0, 110)))
    return out


def stripes(width, height, st, n=3, side='both'):
    """CQ-style speed stripes beside a line"""
    im = Image.new('L', (width, height), 0); d = ImageDraw.Draw(im); gap = height / (n * 2 - 1)
    for i in range(n):
        y0 = int(i * gap * 2); y1 = int(y0 + gap)
        x0 = int(width * (0.18 + 0.2 * i)) if side == 'left' else 0
        x1 = width if side == 'left' else int(width * (0.82 - 0.2 * i))
        d.polygon([(x0, y0), (x1, y0), (x1 - (y1 - y0) * 0.5, y1), (x0 - (y1 - y0) * 0.5, y1)], fill=255)
    return im


def pixel_sprite(name, scale):
    import art
    im = art.base()[name].convert('RGBA'); im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    pad = scale * 2; big = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0)); big.alpha_composite(im, (pad, pad))
    a = big.getchannel('A').point(lambda v: 255 if v > 40 else 0); ol = solid(dilate(a, max(2, scale // 2)), INK)
    ol.alpha_composite(big); return ol


def art(name, h):
    im = Image.open(os.path.join(ASSETS, name)).convert('RGBA'); w = int(im.width * h / im.height); return im.resize((w, h), Image.LANCZOS)


def glow(img, col, r):
    a = img.getchannel('A').filter(ImageFilter.GaussianBlur(r)); g = Image.new('RGBA', img.size, hexc(col)); g.putalpha(a.point(lambda v: min(255, int(v * 1.6)))); return g


def compose(lines, st, mascot=None, mascot_y=0.62, extras=None, W=900):
    """lines: [(text, size, opts)], mascot: RGBA placed above, overlapping the first line by mascot_y of the line height"""
    rendered = []
    for text, size, opt in lines:
        mk = word_mask(text, size, stretch=opt.get('stretch', 1.18), shear=opt.get('shear', st.get('shear', 0)), arc=opt.get('arc', 0))
        s2 = dict(st); s2.update(opt.get('st', {})); rendered.append((letters(mk, s2), opt))
    tw = max(r.width for r, _ in rendered); H = 40
    mh = mascot.height if mascot else 0
    total = H + (mh if mascot else 0)
    for r, opt in rendered: total += r.height + opt.get('gap', -28)
    canvas = Image.new('RGBA', (max(W, tw + 80), total + 80), (0, 0, 0, 0)); cw = canvas.width
    y = 30
    layers = []
    if mascot:
        my = y; y += int(mh * mascot_y)
        layers.append(('mascot', mascot, ((cw - mascot.width) // 2 + st.get('mascot_dx', 0), my)))
    for r, opt in rendered:
        x = (cw - r.width) // 2 + opt.get('dx', 0)
        if opt.get('stripes'):
            sh = int(r.height * 0.42); sw = int(min(170, (cw - r.width) / 2 + 60))
            sm = stripes(sw, sh, st, side='left'); smr = sm.transpose(Image.FLIP_LEFT_RIGHT)
            for mk, sx in ((sm, x - sw + 40), (smr, x + r.width - 40)):
                lm = Image.new('L', (mk.width + 30, mk.height + 30), 0); lm.paste(mk, (15, 15))
                o = Image.new('RGBA', lm.size, (0, 0, 0, 0)); o.alpha_composite(solid(dilate(lm, 7), INK))
                fg = gradient(lm.size, [(t, hexc(c)) for t, c in st['face']]); fg.putalpha(lm); o.alpha_composite(fg)
                layers.append(('stripe', o, (sx - 15, y + int(r.height * 0.36) - 15)))
        layers.append(('text', r, (x, y))); y += r.height + opt.get('gap', -28)
    if extras: extras(canvas, layers, st)
    # mascot behind the lettering, stripes behind both
    for kind in ('stripe', 'mascot', 'text'):
        for k, im, pos in layers:
            if k == kind: canvas.alpha_composite(im, pos)
    if st.get('after'): st['after'](canvas, layers)
    return canvas.crop(canvas.getbbox())


# ---------------------------------------------------------------- styles
RED = dict(face=[(0, '#ff6a5a'), (0.45, '#ff2630'), (1, '#9a0a12')], side=['#5a0a10', '#2a0408'], shine='#ffd0c0', outline=11, rim=3, depth=14)


def drips(col, n=7, seed=3):
    def f(canvas, layers, st):
        rnd = random.Random(seed)
        for k, im, (x, y) in [l for l in layers if l[0] == 'text'][-1:]:
            d = Image.new('L', canvas.size, 0); dr = ImageDraw.Draw(d)
            for i in range(n):
                bb = im.getbbox(); cx = x + rnd.randint(bb[0] + 40, bb[2] - 40); top = y + bb[3] - 26; ln = rnd.randint(18, 62); w = rnd.randint(9, 15)
                dr.rectangle((cx - w // 2, top, cx + w // 2, top + ln), fill=255); dr.ellipse((cx - w // 2 - 3, top + ln - w // 2, cx + w // 2 + 3, top + ln + w), fill=255)
            o = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); o.alpha_composite(solid(dilate(d, 6), INK)); o.alpha_composite(solid(d, hexc(col)))
            hl = ImageChops.multiply(d, ImageChops.offset(ImageChops.invert(d), 3, 0)); o.alpha_composite(solid(hl, (255, 255, 255, 90)))
            layers.insert(0, ('stripe', o, (0, 0)))
    return f


def make_ll():
    st = dict(face=[(0, '#fff6e0'), (0.5, '#f1e7d0'), (1, '#b89c78')], side=['#7a0a12', '#2a0408'], shine='#ffffff', outline=11, rim=3, depth=14)
    head = art('gothhead.webp', 300).crop((0, 0, 250 * 300 // 625 * 2 + 40, 175))
    head = art('gothhead.webp', 560); head = head.crop((0, 0, head.width, 330))
    crown = Image.new('RGBA', (180, 90), (0, 0, 0, 0)); d = ImageDraw.Draw(crown)
    pts = [(10, 85), (10, 30), (45, 60), (90, 8), (135, 60), (170, 30), (170, 85)]
    d.polygon(pts, fill=INK); d.polygon([(18, 78), (18, 44), (46, 68), (90, 22), (134, 68), (162, 44), (162, 78)], fill=hexc('#ffe36a')); d.rectangle((18, 70, 162, 78), fill=hexc('#c99a2a'))
    for cx in (46, 90, 134): d.ellipse((cx - 7, 52, cx + 7, 66), fill=hexc('#c4121c'), outline=INK, width=3)
    m = Image.new('RGBA', (head.width, head.height + 30), (0, 0, 0, 0)); m.alpha_composite(head, (0, 30)); crown = crown.rotate(-12, expand=True, resample=Image.BICUBIC); m.alpha_composite(crown, (head.width // 2 - 20, 70))
    return compose([('LOAD', 150, dict(stripes=True, arc=10)), ('LEGACY', 132, dict(st=dict(face=RED['face'], side=RED['side'], shine=RED['shine'])))], st, mascot=m, mascot_y=0.8)


def make_hog():
    st = dict(face=[(0, '#fff3a0'), (0.5, '#ffe36a'), (1, '#d08a10')], side=['#7a0a12', '#2a0408'], shine='#ffffff', outline=11, rim=3, depth=12, shear=-0.18)
    head = art('droplet.webp', 340)
    def ex(canvas, layers, st):
        for k, im, pos in list(layers):  # golden rings around him
            if k == 'mascot':
                d = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(d); cx, cy = pos[0] + im.width // 2, pos[1] + im.height // 2
                for i, (a, r) in enumerate(((0.3, 230), (1.4, 250), (2.6, 220), (3.5, 240), (4.6, 235), (5.6, 225))):
                    x, y = cx + math.cos(a) * r, cy + math.sin(a) * r * 0.55
                    dr.ellipse((x - 26, y - 26, x + 26, y + 26), fill=INK); dr.ellipse((x - 20, y - 20, x + 20, y + 20), fill=hexc('#ffe36a')); dr.ellipse((x - 10, y - 12, x + 10, y + 12), fill=INK)
                    dr.ellipse((x - 15, y - 15, x - 4, y - 4), fill=(255, 255, 255, 200))
                layers.insert(0, ('stripe', d, (0, 0)))
    return compose([('CUMHEAD', 104, dict(st=dict(face=RED['face'], side=RED['side'], shine=RED['shine']))), ('THE SPERMHOG', 96, dict(stripes=True))], st, mascot=head, mascot_y=0.66, extras=ex)


def make_meat():
    st = dict(RED, shear=-0.12)
    head = art('droplet.webp', 330)
    def ex(canvas, layers, st):
        d = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(d); cx = canvas.width // 2
        for i in range(9):
            w = 120 + i * 34; y = 10 + i * 22; dr.arc((cx - w // 2, y, cx + w // 2, y + 46), 200, 520, fill=INK, width=14); dr.arc((cx - w // 2, y, cx + w // 2, y + 46), 200, 520, fill=hexc('#7a1018' if i % 2 else '#b0303a'), width=8)
        layers.insert(0, ('stripe', d, (0, 0)))
    return compose([('MEATNADO', 128, dict(arc=12)), ('ESCAPE', 104, dict(stripes=True, st=dict(face=[(0, '#fff6e0'), (1, '#c8b08a')])))], st, mascot=head, mascot_y=0.7, extras=ex)


def make_surv():
    st = dict(face=[(0, '#9ff0ff'), (0.5, '#2fb8d8'), (1, '#1a5a9a')], side=['#0a2a4a', '#04101e'], shine='#ffffff', outline=11, rim=3, depth=12)
    m = art('spermaid.webp', 400)
    return compose([('SPERMAID', 124, dict(arc=10)), ('SURVIVORS', 108, dict(stripes=True, st=dict(face=RED['face'], side=RED['side'], shine=RED['shine'])))], st, mascot=m, mascot_y=0.72)


def make_wn():
    st = dict(face=[(0, '#fff3a0'), (0.5, '#ffd23a'), (1, '#e07a10')], side=['#7a2a0a', '#2a0a04'], shine='#ffffff', outline=11, rim=3, depth=12, shear=-0.1)
    amy = pixel_sprite('npc_amy0', 10) if 'npc_amy0' in __import__('art').base() else pixel_sprite([k for k in __import__('art').base() if k.startswith('npc_amy')][0], 7)
    def ex(canvas, layers, st):  # a chilli on each side
        for k, im, (x, y) in [l for l in layers if l[0] == 'text'][:1]:
            for sx, fl in ((x - 70, False), (x + im.width - 40, True)):
                c = Image.new('RGBA', (110, 150), (0, 0, 0, 0)); dr = ImageDraw.Draw(c)
                dr.ellipse((14, 30, 96, 146), fill=INK); dr.ellipse((22, 38, 88, 138), fill=hexc('#c4121c')); dr.ellipse((34, 50, 52, 96), fill=hexc('#ff6a5a'))
                dr.rectangle((46, 4, 64, 40), fill=INK); dr.rectangle((51, 8, 59, 40), fill=hexc('#3a9a2a'))
                c = c.rotate(28 if fl else -28, expand=True, resample=Image.BICUBIC); layers.insert(0, ('stripe', c, (sx, y - 10)))
    return compose([('WILLY', 140, dict(arc=14, st=dict(face=RED['face'], side=RED['side'], shine=RED['shine']))), ('NILLY', 140, dict(stripes=True))], st, mascot=amy, mascot_y=0.8, extras=ex)


def make_sw():
    st = dict(face=[(0, '#e8c890'), (0.4, '#b07a3a'), (1, '#4a2410')], side=['#2a1408', '#0a0402'], shine='#fff0d0', outline=11, rim=3, depth=14)
    m = art('on_the_floor.webp', 380)
    # a bear trap on his leg, chains
    def after(canvas, layers):
        for k, im, (x, y) in layers:
            if k == 'text':
                d = ImageDraw.Draw(canvas)
                for i in range(0, im.width, 46):  # rivets along the top of the lettering
                    pass
        return canvas
    def ex(canvas, layers, st):
        rnd = random.Random(7); d = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(d)
        # cogs behind
        for cx, cy, r in ((150, 180, 90), (canvas.width - 170, 150, 110), (canvas.width // 2 + 210, 60, 60)):
            n = 12
            pts = []
            for i in range(n * 2):
                a = i * math.pi / n; rr = r if i % 2 == 0 else r * 0.8; pts += [(cx + math.cos(a - 0.12) * rr, cy + math.sin(a - 0.12) * rr), (cx + math.cos(a + 0.12) * rr, cy + math.sin(a + 0.12) * rr)]
            dr.polygon(pts, fill=hexc('#2a1a12')); dr.ellipse((cx - r * 0.35, cy - r * 0.35, cx + r * 0.35, cy + r * 0.35), fill=(0, 0, 0, 0))
            dr.ellipse((cx - r * 0.3, cy - r * 0.3, cx + r * 0.3, cy + r * 0.3), fill=hexc('#12040a'))
        # blood splatter
        for i in range(40):
            x = rnd.randint(60, canvas.width - 60); y = rnd.randint(40, canvas.height - 40); r = rnd.choice([3, 4, 6, 9, 14])
            dr.ellipse((x - r, y - r, x + r, y + r), fill=hexc('#7a0a12', 200))
        layers.insert(0, ('stripe', d, (0, 0)))
        # rivets on the lettering
        for k, im, (x, y) in [l for l in layers if l[0] == 'text']:
            rv = ImageDraw.Draw(im); a = im.getchannel('A')
            for i in range(20, im.width - 20, 38):
                for yy in (int(im.height * 0.3),):
                    if a.getpixel((i, yy)) > 200 and a.getpixel((i, yy + 8)) > 200: rv.ellipse((i - 4, yy - 4, i + 4, yy + 4), fill=hexc('#2a1408')); rv.ellipse((i - 3, yy - 3, i + 1, yy + 1), fill=hexc('#f0d8a0'))
    return compose([('SPUZZWORLD', 120, dict(st=dict(face=[(0, '#d8d0c8'), (0.45, '#8a8078'), (1, '#3a3430')], side=['#2a0408', '#0a0204']))),
                    ("CUM'S ODDYSEE", 74, dict(stripes=True, stretch=1.25, st=dict(face=[(0, '#ff6a5a'), (0.5, '#c4121c'), (1, '#5a0408')])))], st, mascot=m, mascot_y=0.75, extras=ex)


def make_gr():
    st = dict(face=[(0, '#ff8a7a'), (0.4, '#d8202a'), (1, '#6a0408')], side=['#3a0408', '#120204'], shine='#ffd0c0', outline=11, rim=3, depth=10)
    head = art('droplet.webp', 330)
    # tears
    d = ImageDraw.Draw(head)
    for cx, cy in ((head.width * 0.36, head.height * 0.62), (head.width * 0.66, head.height * 0.64)):
        d.ellipse((cx - 9, cy, cx + 9, cy + 22), fill=hexc('#9fe0ff'), outline=INK, width=3)
    return compose([('THE GRINDING', 92, dict(stretch=1.25, st=dict(face=[(0, '#fff6e0'), (1, '#c8b08a')]))), ('OF CUMHEAD', 118, dict(stripes=True))], st, mascot=head, mascot_y=0.68, extras=drips('#a00a14'))


def make_ao():
    st = dict(face=[(0, '#ffffff'), (0.35, '#ff7af0'), (1, '#8a10c0')], side=['#2a0a5a', '#0a0420'], shine='#ffffff', outline=11, rim=3, depth=12, shear=-0.16)
    head = art('droplet.webp', 300)
    def after(canvas, layers): pass
    def ex(canvas, layers, st):
        for k, im, pos in list(layers):
            if k == 'text': layers.insert(0, ('stripe', glow(im, '#ff40e0', 18), pos))
        d = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(d); cx = canvas.width // 2
        cy = 190
        for i in range(20):  # sunburst, fading out
            a0 = i * math.pi / 10; dr.polygon([(cx, cy), (cx + math.cos(a0) * 420, cy + math.sin(a0) * 300), (cx + math.cos(a0 + 0.14) * 420, cy + math.sin(a0 + 0.14) * 300)], fill=hexc('#ffe36a' if i % 2 else '#ff40e0', 90))
        r = Image.new('L', canvas.size, 0); ImageDraw.Draw(r).ellipse((cx - 400, cy - 280, cx + 400, cy + 280), fill=255); r = r.filter(ImageFilter.GaussianBlur(70))
        d.putalpha(ImageChops.multiply(d.getchannel('A'), r)); layers.insert(0, ('stripe', d, (0, 0)))
    return compose([("POTBELLY'S", 78, dict(stretch=1.3, st=dict(face=[(0, '#fff3a0'), (1, '#e0a010')], side=['#5a3a0a', '#1a0a02']))),
                    ('ARCADE', 132, dict(arc=12)), ('OVERDRIVE', 104, dict(stripes=True, st=dict(face=[(0, '#c0ffff'), (0.5, '#30d8ff'), (1, '#1050c0')], side=['#0a2a5a', '#040a20'])))], st, mascot=head, mascot_y=0.7, extras=ex)


def make_jv():
    st = dict(face=[(0, '#ffffff'), (0.4, '#c8a0ff'), (1, '#4a1088')], side=['#1a0a3a', '#06020e'], shine='#ffffff', outline=11, rim=3, depth=14)
    import art as A
    b = A.base()
    party = Image.new('RGBA', (640, 330), (0, 0, 0, 0))
    sm = art('spermaid.webp', 250); party.alpha_composite(sm, (10, 70))
    gk = [k for k in b if k.startswith('greebo_s')][0]; gb = pixel_sprite(gk, 8); party.alpha_composite(gb, (640 - gb.width - 10, 330 - gb.height))
    hd = art('droplet.webp', 290); party.alpha_composite(hd, ((640 - hd.width) // 2, 10))
    def ex(canvas, layers, st):
        d = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(d); cx, cy = canvas.width // 2, int(canvas.height * 0.62)
        for i in range(14, 0, -1):
            r = i * 30; dr.ellipse((cx - r * 1.5, cy - r * 0.55, cx + r * 1.5, cy + r * 0.55), fill=(10 + i * 5, 0, 20 + i * 7, 255 if i == 14 else 0) if False else None, outline=hexc('#6a20c0', 20 + i * 5), width=4)
        rnd = random.Random(5)
        for i in range(60):
            x = rnd.randint(0, canvas.width); y = rnd.randint(0, canvas.height); s = rnd.choice([2, 2, 3, 5])
            dr.rectangle((x - s, y, x + s, y), fill=(255, 255, 255, 200)); dr.rectangle((x, y - s, x, y + s), fill=(255, 255, 255, 200))
        layers.insert(0, ('stripe', d, (0, 0)))
    return compose([('JOURNEY', 120, dict(arc=10, st=dict(face=RED['face'], side=RED['side'], shine=RED['shine']))), ('TO THE', 60, dict(stretch=1.2, gap=-18, st=dict(face=[(0, '#fff6e0'), (1, '#c8b08a')]))), ('VOID', 170, dict(stripes=True))], st, mascot=party, mascot_y=0.74, extras=ex)


def make_ck():
    st = dict(face=[(0, '#fff3a0'), (0.5, '#ffe36a'), (1, '#d08a10')], side=['#7a0a12', '#2a0408'], shine='#ffffff', outline=11, rim=3, depth=14, shear=-0.2)
    head = art('droplet.webp', 300)
    def flag(w, h, n, wave):
        f = Image.new('RGBA', (w + 40, h + 60), (0, 0, 0, 0)); d = ImageDraw.Draw(f); cs = w // n
        for j in range(h // cs):
            for i in range(n):
                off = int(math.sin(i / n * math.pi * 2) * wave)
                d.rectangle((20 + i * cs, 20 + j * cs + off, 20 + i * cs + cs, 20 + j * cs + cs + off), fill=hexc('#f1e7d0') if (i + j) % 2 else hexc('#12040a'))
        m = f.getchannel('A'); o = Image.new('RGBA', f.size, (0, 0, 0, 0)); o.alpha_composite(solid(dilate(m, 6), INK)); o.alpha_composite(f); return o
    def ex(canvas, layers, st):
        for k, im, (x, y) in [l for l in layers if l[0] == 'mascot']:
            cx = x + im.width // 2
            for side in (-1, 1):
                fl = flag(200, 140, 8, 10)
                pole = Image.new('RGBA', (fl.width, fl.height + 160), (0, 0, 0, 0)); pd = ImageDraw.Draw(pole)
                pd.rectangle((6, 10, 22, fl.height + 150), fill=INK); pd.rectangle((10, 14, 18, fl.height + 146), fill=hexc('#a6968f')); pole.alpha_composite(fl, (10, 0))
                pole = pole.rotate(-28 * side, expand=True, resample=Image.BICUBIC)
                if side < 0: pole = pole.transpose(Image.FLIP_LEFT_RIGHT)
                layers.insert(0, ('stripe', pole, (cx - pole.width + 40 if side < 0 else cx - 40, y - 30)))
        d = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(d)
        for k, im, (x, y) in [l for l in layers if l[0] == 'text'][-1:]:
            for i in range(5):  # speed lines off the back of KART
                yy = y + 40 + i * 26; dr.rectangle((x - 140 + i * 18, yy, x + 10, yy + 9), fill=INK); dr.rectangle((x - 134 + i * 18, yy + 2, x + 4, yy + 7), fill=hexc('#ff2630' if i % 2 else '#ffe36a'))
        layers.insert(0, ('stripe', d, (0, 0)))
    return compose([('CUMHEAD', 112, dict(arc=10, st=dict(face=RED['face'], side=RED['side'], shine=RED['shine']))), ('KART', 176, dict(stripes=True))], st, mascot=head, mascot_y=0.7, extras=ex)


LOGOS = {'ck': make_ck, 'll': make_ll, 'hog': make_hog, 'meat': make_meat, 'surv': make_surv, 'wn': make_wn, 'sw': make_sw, 'gr': make_gr, 'ao': make_ao, 'jv': make_jv}

if __name__ == '__main__':
    want = sys.argv[1:] or list(LOGOS)
    for k in want:
        im = LOGOS[k](); s = 760 / im.width if im.width > 760 else 1
        if s != 1: im = im.resize((760, int(im.height * s)), Image.LANCZOS)
        p = os.path.join(ASSETS, k + '-logo.webp'); im.save(p, 'WEBP', quality=88, method=6); print(p, im.size, os.path.getsize(p) // 1024, 'KB')
