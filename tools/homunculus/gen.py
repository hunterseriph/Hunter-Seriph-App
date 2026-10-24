#!/usr/bin/env python3
"""Pixel art for the homunculus: baby, teenager and adult, in ten breeds, with animation frames.

Run:  python3 tools/homunculus/gen.py
Writes tools/homunculus/hom.png + hom.json (frame name -> [x, y, w, h, footX]) and a big preview.
Load Legacy's build and Cumheads Quest both read hom.png / hom.json.

Every frame is drawn from simple shapes into a grid of materials, then shaded (light from the top
left), then outlined in the house outline colour, so all of it sits in the same style as the rest
of the games: dark outline, limited palette, no smooth gradients.
"""
import json, math, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = (18, 4, 10)

def hx(s):
    s = s.lstrip('#'); return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))

# breed palettes: skin (hi, main, shade), brain (hi, main, shade), eye glow, ooze, accent
BREEDS = {
    'gloop':  dict(name='Gloop',     skin=('#5cc7c9', '#2a8a94', '#16505a'), brain=('#c98e7c', '#9a6458', '#5e3a34'), eye='#8dff4a', ooze='#3fb43a', acc='#2a1a12'),
    'guard':  dict(name='Bulwark',   skin=('#9aa0e0', '#5a5ea8', '#30346a'), brain=('#c49aa0', '#8a6470', '#563a46'), eye='#7dffd0', ooze='#6a8aff', acc='#e9dcbc'),
    'ember':  dict(name='Embertail', skin=('#f08a44', '#b8461e', '#6a220c'), brain=('#d07a5a', '#9a4a34', '#5a2418'), eye='#ffe36a', ooze='#ff7a30', acc='#ffd040'),
    'frost':  dict(name='Frostbite', skin=('#c4f0ff', '#6ab8d8', '#386a8a'), brain=('#d8b0c0', '#a07a90', '#644a5e'), eye='#e8ffff', ooze='#9adfff', acc='#ffffff'),
    'volt':   dict(name='Voltling',  skin=('#f4e060', '#b8a020', '#6a5a0a'), brain=('#c890c8', '#8a5a8a', '#543654'), eye='#c070ff', ooze='#ffe36a', acc='#ffffff'),
    'medic':  dict(name='Mendling',  skin=('#ffa8cc', '#d86a9a', '#8a3a5e'), brain=('#e0a090', '#b06a5c', '#6a3a34'), eye='#7dffd0', ooze='#ff9ad0', acc='#ffffff'),
    'leech':  dict(name='Leechling', skin=('#a878dc', '#6a3a9a', '#3a1a5e'), brain=('#c87a8a', '#8e4a5a', '#542a36'), eye='#ff3a44', ooze='#c070ff', acc='#f1e7d0'),
    'scout':  dict(name='Peeper',    skin=('#c4e070', '#8aa83a', '#4e6a1a'), brain=('#c8987a', '#94664e', '#5a3c2c'), eye='#ffe36a', ooze='#a6e83a', acc='#12040a'),
    'goldie': dict(name='Goldie',    skin=('#ffd870', '#c8962a', '#7a5a10'), brain=('#d89a7a', '#a8684e', '#643a2a'), eye='#8dff4a', ooze='#ffd040', acc='#3a2410'),
    'titan':  dict(name='Titan',     skin=('#8a8a9a', '#565466', '#2e2c3a'), brain=('#c07a6a', '#8a4a40', '#542a24'), eye='#ff3a2a', ooze='#ff5a90', acc='#2a1a1a'),
    'blood':  dict(name='Bloodmoon', skin=('#5a4650', '#2e2228', '#150d10'), brain=('#ff3a44', '#c4121c', '#6a0a10'), eye='#ff2630', ooze='#ff2630', acc='#ff2630'),
}
ORDER = ['gloop', 'guard', 'ember', 'frost', 'volt', 'medic', 'leech', 'scout', 'goldie', 'titan', 'blood']

# ---------------------------------------------------------------- grid painting
class Grid:
    def __init__(self, w, h):
        self.w, self.h = w, h; self.m = [[None] * w for _ in range(h)]
    def put(self, x, y, mat, over=True):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h and (over or self.m[y][x] is None): self.m[y][x] = mat
    def get(self, x, y):
        return self.m[y][x] if 0 <= x < self.w and 0 <= y < self.h else None
    def ellipse(self, cx, cy, rx, ry, mat, over=True, fn=None):
        for y in range(self.h):
            for x in range(self.w):
                dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
                if dx * dx + dy * dy <= 1.0:
                    self.put(x, y, fn(x, y) if fn else mat, over)
    def line(self, x0, y0, x1, y1, mat, r=0.5, over=True):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
        for i in range(n + 1):
            t = i / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            if r <= 0.5: self.put(x, y, mat, over)
            else:
                rr = int(math.ceil(r))
                for yy in range(-rr, rr + 1):
                    for xx in range(-rr, rr + 1):
                        if xx * xx + yy * yy <= r * r: self.put(x + xx, y + yy, mat, over)
    def rect(self, x, y, w, h, mat, over=True):
        for yy in range(h):
            for xx in range(w): self.put(x + xx, y + yy, mat, over)

# materials that get 3-tone shading, and flat ones
SHADED = {'skin', 'brain', 'bone', 'gold', 'ice', 'horn'}

def render(g, pal):
    """materials -> RGBA image with top-left light and a dark outline."""
    P = {
        'skin': [hx(c) for c in pal['skin']], 'brain': [hx(c) for c in pal['brain']],
        'bone': [hx('#fff6e0'), hx('#e0d0b0'), hx('#9a8a6a')], 'gold': [hx('#fff09a'), hx('#ffc840'), hx('#a8741a')],
        'ice': [hx('#ffffff'), hx('#c4f0ff'), hx('#6ab8d8')], 'horn': [hx('#b8a490'), hx('#7a6858'), hx('#463a30')],
    }
    flat = {
        'eye': hx(pal['eye']), 'pupil': OUT, 'glint': hx('#ffffff'), 'mouth': hx('#0a0204'), 'teeth': hx('#f1e7d0'),
        'ooze': hx(pal['ooze']), 'oozed': tuple(max(0, int(c * 0.6)) for c in hx(pal['ooze'])), 'fold': hx(pal['brain'][2]),
        'seam': hx(pal['skin'][2]), 'mole': hx('#3a2018'), 'flame': hx('#ff7a30'), 'flame2': hx('#ffe36a'), 'spark': hx('#fff6a0'),
        'heart': hx('#ff3a6a'), 'band': hx('#f1e7d0'), 'red': hx('#ff2630'), 'scar': hx(pal['skin'][2]), 'claw': hx('#bfae8e'),
        'brow': hx(pal['skin'][2]), 'cheek': hx('#ff8aa0'),
    }
    img = Image.new('RGBA', (g.w, g.h), (0, 0, 0, 0)); px = img.load()
    def solid(x, y): return g.get(x, y) is not None
    for y in range(g.h):
        for x in range(g.w):
            m = g.m[y][x]
            if m is None: continue
            if m in SHADED:
                tone = 1
                if not solid(x + 1, y) or not solid(x, y + 1) or (not solid(x + 1, y + 1)): tone = 2
                if (not solid(x - 1, y) or not solid(x, y - 1)) and tone == 1: tone = 0
                if m != g.get(x, y + 1) and g.get(x, y + 1) in SHADED and tone == 1: tone = 2
                c = P[m][tone]
            else: c = flat.get(m, (255, 0, 255))
            px[x, y] = c + (255,)
    # outline: transparent pixels next to the figure
    out = img.copy(); po = out.load()
    for y in range(g.h):
        for x in range(g.w):
            if g.m[y][x] is None and any(solid(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                po[x, y] = OUT + (255,)
    return out

# ---------------------------------------------------------------- the creature
STAGES = {
    # canvas, head centre & radii, torso centre & radii, limb thickness, leg length, arm length
    'baby':  dict(W=22, H=22, head=(11.5, 8.5, 7.2, 6.4), body=(11, 15.5, 3.4, 3.2), lt=0.5, leg=3.0, arm=3.0, eye=3, foot=21),
    'teen':  dict(W=26, H=32, head=(14.0, 8.5, 6.8, 6.0), body=(12.5, 18.5, 3.6, 5.2), lt=0.9, leg=7.5, arm=7.0, eye=2, foot=31),
    'adult': dict(W=34, H=42, head=(21.0, 10.0, 7.6, 6.8), body=(15.5, 23.0, 5.0, 7.0), lt=1.6, leg=10.5, arm=12.0, eye=2, foot=41),
}
FRAMES = ['idle0', 'idle1', 'run0', 'run1', 'run2', 'run3', 'jump', 'atk', 'hurt']

def pose(frame):
    """returns offsets: bob, head lean, leg phases (front, back), arm swing, mouth open"""
    p = dict(bob=0, lean=0, legs=(0.0, 0.0), arms=(0.0, 0.0), mouth=0, tuck=0, recoil=0)
    if frame == 'idle1': p['bob'] = 1; p['arms'] = (0.15, -0.1)
    elif frame.startswith('run'):
        k = int(frame[3]); ph = [0.9, 0.0, -0.9, 0.0][k]; p['legs'] = (ph, -ph); p['arms'] = (-ph * 0.8, ph * 0.8); p['bob'] = 0 if k % 2 == 0 else 1; p['lean'] = 1
    elif frame == 'jump': p['tuck'] = 1; p['arms'] = (-1.1, -0.9); p['bob'] = -1
    elif frame == 'atk': p['lean'] = 2; p['mouth'] = 1; p['arms'] = (0.9, -0.6)
    elif frame == 'hurt': p['recoil'] = 1; p['arms'] = (-1.3, 1.2); p['mouth'] = 1; p['lean'] = -2
    return p

def creature(stage, breed, frame):
    S, B = STAGES[stage], BREEDS[breed]; W, H = S['W'], S['H']; g = Grid(W, H); p = pose(frame)
    hx0, hy0, hrx, hry = S['head']; bx, by, brx, bry = S['body']
    lean, bob = p['lean'], p['bob']
    hxc, hyc = hx0 + lean, hy0 + bob + (1 if p['recoil'] else 0)
    foot = S['foot']
    lt = S['lt']
    # ---- legs (behind first, so the front leg overlaps)
    hip_y = by + bry * 0.6 + bob
    for side, ph in ((-1, p['legs'][1]), (1, p['legs'][0])):
        hip = (bx + side * brx * 0.45, hip_y)
        if p['tuck']:
            knee = (hip[0] + 2 + side, hip[1] + S['leg'] * 0.35); ft = (hip[0] - 1 + side, hip[1] + S['leg'] * 0.6)
        else:
            sw = ph * S['leg'] * 0.45
            knee = (hip[0] + sw * 0.6 + (1.2 if stage == 'adult' else 0.4), hip[1] + S['leg'] * 0.5 - abs(ph) * 0.6)
            ft = (hip[0] + sw, foot - 1 - (1 if ph > 0.5 else 0))
        g.line(hip[0], hip[1], knee[0], knee[1], 'skin', lt)
        g.line(knee[0], knee[1], ft[0], ft[1], 'skin', lt)
        g.line(ft[0], ft[1], ft[0] + (2 if stage != 'baby' else 1), ft[1], 'skin', max(0.5, lt - 0.4))  # toes forward
    # ---- torso
    def tor(x, y):
        return 'skin'
    if stage == 'adult':
        g.ellipse(bx, by + 2 + bob, brx * 0.85, bry * 0.75, 'skin')        # belly
        g.ellipse(bx + 2.5, by - 3 + bob, brx * 1.1, bry * 0.7, 'skin')    # big hunched chest
    else:
        g.ellipse(bx, by + bob, brx, bry, 'skin')
    # belly ooze spots
    for (ox, oy) in ((0.3, 0.3), (-0.3, 0.7)):
        g.put(bx + ox * brx, by + oy * bry + bob, 'ooze')
    # ---- back arm
    sh = (bx - brx * 0.2 + (2 if stage == 'adult' else 0), by - bry * 0.55 + bob)
    def arm(shoulder, sw, front):
        L = S['arm']
        a = math.pi / 2 - 0.15 + sw * 0.75  # hanging down, swung by sw
        el = (shoulder[0] + math.cos(a) * L * 0.5, shoulder[1] + math.sin(a) * L * 0.5)
        a2 = a - 0.5 + (0.4 if not front else 0)
        hd = (el[0] + math.cos(a2) * L * 0.55, el[1] + math.sin(a2) * L * 0.55)
        g.line(shoulder[0], shoulder[1], el[0], el[1], 'skin', lt)
        g.line(el[0], el[1], hd[0], hd[1], 'skin', lt)
        if stage != 'baby':  # two short claws
            for c in (-0.45, 0.35):
                g.line(hd[0], hd[1], hd[0] + math.cos(a2 + c) * (1.6 if stage == 'teen' else 2.4), hd[1] + math.sin(a2 + c) * (1.6 if stage == 'teen' else 2.4), 'claw', 0.5)
    arm(sh, p['arms'][1], False)
    # ---- head: skin face at the front, the exposed brain at the back
    seam = lambda x, y: (x + 0.5) < hxc - hrx * 0.15 + (y + 0.5 - hyc) * 0.35
    def headmat(x, y):
        if seam(x, y): return 'brain'
        return 'skin'
    g.ellipse(hxc, hyc, hrx, hry, None, fn=headmat)
    # jaw sticking forward a little (teen/adult)
    if stage != 'baby':
        g.ellipse(hxc + hrx * 0.45, hyc + hry * 0.55, hrx * 0.5, hry * 0.38, 'skin')
    # brain folds
    for y in range(H):
        for x in range(W):
            if g.get(x, y) == 'brain':
                v = math.sin(x * 1.25 + y * 0.55) + math.sin(y * 1.6 - x * 0.4)
                if v > 1.25 and g.get(x - 1, y) is not None and g.get(x + 1, y) is not None: g.put(x, y, 'fold')
    # seam stitches between brain and skin
    for y in range(H):
        for x in range(W):
            if g.get(x, y) == 'skin' and g.get(x - 1, y) in ('brain', 'fold') and (y % 2 == 0): g.put(x, y, 'seam')
    # ---- face
    ex, ey = int(round(hxc + hrx * 0.38)), int(round(hyc - 1))
    if breed == 'scout':  # Peeper: one huge eye
        g.ellipse(ex + 0.5, ey + 0.5, 2.6 if stage != 'baby' else 3.0, 2.4 if stage != 'baby' else 2.8, 'eye')
        g.put(ex + 1, ey, 'pupil'); g.put(ex + 1, ey + 1, 'pupil'); g.put(ex - 1, ey - 1, 'glint')
        g.line(ex - 2, ey - 3, ex + 3, ey - 3, 'brow', 0.5)
    else:
        es = S['eye']
        if stage == 'baby':
            g.rect(ex - 1, ey - 1, 3, 3, 'eye'); g.put(ex, ey, 'pupil'); g.put(ex + 1, ey, 'pupil'); g.put(ex - 1, ey - 1, 'glint')
            g.rect(ex - 5, ey, 2, 2, 'eye'); g.put(ex - 4, ey + 1, 'pupil')  # the far eye peeks round the head
        else:
            g.rect(ex - 1, ey, 3, 2, 'eye'); g.put(ex + 1, ey + 1, 'pupil'); g.put(ex - 1, ey, 'glint')
            g.line(ex - 2, ey - 1, ex + 2, ey - 2 if stage == 'adult' else ey - 1, 'brow', 0.5)  # angry brow
    # mouth
    mx, my = int(round(hxc + hrx * 0.55)), int(round(hyc + hry * 0.45))
    mw = {'baby': 2, 'teen': 4, 'adult': 6}[stage]
    open_ = p['mouth']
    g.rect(mx - mw // 2, my, mw, 1 + open_ + (1 if stage == 'adult' else 0), 'mouth')
    if stage != 'baby':
        for i in range(mx - mw // 2, mx - mw // 2 + mw, 2): g.put(i, my, 'teeth')
        if stage == 'adult':
            for i in range(mx - mw // 2 + 1, mx - mw // 2 + mw, 2): g.put(i, my + 1 + open_, 'teeth')
    if open_ or stage == 'teen':  # a drip of ooze from the mouth
        g.put(mx, my + 2 + open_, 'ooze'); g.put(mx, my + 3 + open_, 'oozed')
    if stage == 'baby': g.put(ex - 1, ey + 3, 'cheek')
    # ---- breed features
    top = int(round(hyc - hry))
    bk = int(round(hxc - hrx * 0.5))
    fr = FRAMES.index(frame)
    if breed == 'gloop':
        g.put(ex + 2, my - 2, 'mole')  # the classic has a mole on its cheek
    elif breed == 'guard':
        for i, (dx, dy) in enumerate(((-4, 1), (-2, 0), (0, 0), (2, 1))):  # bone plates over the brain
            g.ellipse(hxc + dx - 1, top + dy + 1, 1.6, 1.3, 'bone')
        if stage == 'adult': g.ellipse(bx + 2, by - 7 + bob, 3.5, 2, 'bone')
    elif breed == 'ember':
        fl = [(0, -2), (1, -3), (-1, -3), (0, -4 - fr % 2)]
        for dx, dy in fl: g.put(bk + 2 + dx, top + dy + 1, 'flame')
        g.put(bk + 2, top - 1, 'flame2'); g.put(bk + 2 + (fr % 2), top - 3, 'flame2')
        tx, ty = bx - brx - 1, by + bry * 0.5 + bob  # tail flame
        g.line(tx + 1, ty, tx - 2, ty - 2, 'skin', 0.5); g.put(tx - 3, ty - 3, 'flame'); g.put(tx - 3, ty - 4 - fr % 2, 'flame2')
    elif breed == 'frost':
        for i, dx in enumerate((-5, -2, 1)):
            h = 3 if stage == 'baby' else 4
            for k in range(h): g.put(hxc + dx - k * 0.4, top - k + 1, 'ice')
    elif breed == 'volt':
        for i, dx in enumerate((-2, 2)):
            ax, ay = hxc + dx, top
            g.line(ax, ay, ax + dx * 0.6, ay - 4, 'horn', 0.5)
            g.put(ax + dx * 0.6, ay - 5, 'spark' if (fr + i) % 2 else 'eye')
    elif breed == 'medic':
        cx_, cy_ = int(hxc - 2), top + 2  # a stitched cross bandage on the brain
        g.rect(cx_ - 1, cy_, 3, 1, 'band'); g.rect(cx_, cy_ - 1, 1, 3, 'band'); g.put(cx_, cy_, 'heart')
        g.put(ex + 1, ey + 3, 'cheek')
    elif breed == 'leech':
        g.put(mx - mw // 2, my + 1 + open_, 'teeth'); g.put(mx - mw // 2, my + 2 + open_, 'teeth')
        g.put(mx + mw // 2 - 1, my + 1 + open_, 'teeth'); g.put(mx + mw // 2 - 1, my + 2 + open_, 'teeth')
        g.line(mx - 1, my + 2, mx - 3, my + 4 + fr % 2, 'skin', 0.5)  # chin tendril
    elif breed == 'goldie':
        g.put(mx - mw // 2 + (1 if mw > 2 else 0), my, 'gold')  # gold tooth
        g.put(ex + 2, my - 1, 'mole'); g.put(ex - 2, ey + 3, 'gold'); g.put(ex + 1, ey + 3, 'gold')  # mole and gold freckles
    elif breed == 'titan':
        for side in (-1, 1):  # curled horns
            base = (hxc + side * 2.5 - 1, top + 1)
            g.line(base[0], base[1], base[0] - 2, base[1] - 3, 'horn', 0.9 if stage != 'baby' else 0.5)
            g.line(base[0] - 2, base[1] - 3, base[0] + (0 if side < 0 else 1), base[1] - 5, 'horn', 0.5)
        g.line(ex - 2, ey - 2, ex + 1, ey + 3, 'scar', 0.5)
    elif breed == 'blood':  # the rare one: black and red, horns like a crescent moon, red spines down the back
        for side in (-1, 1):
            base = (hxc + side * 2 - 0.5, top + 1)
            g.line(base[0], base[1], base[0] + side * 2, base[1] - 3, 'red', 0.6 if stage != 'baby' else 0.5)
            g.line(base[0] + side * 2, base[1] - 3, base[0] + side * 1, base[1] - 5, 'red', 0.5)
        for k in range(3 if stage == 'baby' else 4):  # spines
            g.put(bk - 1 - k * 0.6, top + 3 + k * 2, 'red')
        if stage != 'baby':
            for k in range(3): g.put(bx - brx - 0.5 + k * 0.4, by - bry * 0.4 + k * 2 + bob, 'red')
        g.put(ex - 2, ey + 2, 'red'); g.put(ex - 3, ey + 3, 'red'); g.put(ex - 2, ey + 3, 'red')  # a red crescent under the eye
    # ---- front arm, over everything
    sh2 = (bx + brx * 0.35 + (2 if stage == 'adult' else 0), by - bry * 0.5 + bob)
    arm(sh2, p['arms'][0] + (0.5 if frame == 'atk' else 0), True)
    return g

def egg(breed, crack):
    """the egg he hatches from: cream with spots in his breed's ooze colour, cracking 0..3"""
    g = Grid(16, 18); B = BREEDS[breed]
    g.ellipse(8, 10, 6.2, 7.6, 'skin' if breed == 'blood' else 'bone')  # the Bloodmoon egg is black
    for (x, y) in ((5, 7), (10, 6), (8, 12), (11, 13), (5, 13)): g.put(x, y, 'ooze'); g.put(x + 1, y, 'ooze')
    cracks = [[], [(8, 4), (9, 5), (8, 6)], [(8, 4), (9, 5), (8, 6), (7, 7), (8, 8), (10, 6), (11, 7)], [(8, 4), (9, 5), (8, 6), (7, 7), (8, 8), (10, 6), (11, 7), (6, 8), (5, 9), (12, 8), (9, 9)]]
    for (x, y) in cracks[crack]: g.put(x, y, 'mouth')
    return g

def main():
    frames = {}
    for b in ORDER:
        for st in STAGES:
            for f in FRAMES:
                frames['h_%s_%s_%s' % (b, st, f)] = render(creature(st, b, f), BREEDS[b])
        for c in range(4):
            frames['h_%s_egg%d' % (b, c)] = render(egg(b, c), BREEDS[b])
    # pack: one row per breed+stage
    names = list(frames); x = y = rowh = 0; W = 1024; pos = {}
    for n in names:
        im = frames[n]
        if x + im.width > W: x = 0; y += rowh + 1; rowh = 0
        pos[n] = [x, y, im.width, im.height]; x += im.width + 1; rowh = max(rowh, im.height)
    sheet = Image.new('RGBA', (W, y + rowh + 1), (0, 0, 0, 0))
    for n, (px, py, w, h) in pos.items(): sheet.paste(frames[n], (px, py))
    sheet.save(os.path.join(HERE, 'hom.png'), optimize=True)
    meta = {'frames': pos, 'breeds': {k: {'name': BREEDS[k]['name'], 'ooze': BREEDS[k]['ooze'], 'eye': BREEDS[k]['eye']} for k in ORDER}, 'order': ORDER}
    json.dump(meta, open(os.path.join(HERE, 'hom.json'), 'w'), separators=(',', ':'))
    # preview: each breed, each stage, a few frames, 5x
    rows = []
    for b in ORDER:
        tiles = [frames['h_%s_egg0' % b], frames['h_%s_egg3' % b]] + [frames['h_%s_%s_%s' % (b, st, f)] for st in STAGES for f in ('idle0', 'run0', 'run2', 'jump', 'atk')]
        rows.append(tiles)
    S = 5; rh = max(max(t.height for t in r) for r in rows) * S + 6
    rw = max(sum(t.width * S + 6 for t in r) for r in rows)
    pv = Image.new('RGBA', (rw, rh * len(rows)), (34, 20, 22, 255))
    for i, r in enumerate(rows):
        x = 0
        for t in r:
            big = t.resize((t.width * S, t.height * S), Image.NEAREST); pv.paste(big, (x, i * rh + rh - big.height - 3), big); x += big.width + 6
    pv.save(os.path.join(HERE, 'preview.png'))
    print('frames', len(frames), 'sheet', sheet.size)

if __name__ == '__main__':
    main()
