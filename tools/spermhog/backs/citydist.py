"""Clubhouse Row's districts painted properly (he said the red light district was a heart on a blank strip): each district is a
street of its own buildings with real rooflines (gables, chimneys, spires, cranes, towers), so the sky shows above them and no
flat band ever runs across the top of the screen. Black and red gothic only (his rule for Clubhouse Row): dark red brick,
black slate, red and cream light. Same size and horizon as the other district layers (330 tall, street at row 170).
Run: python3 tools/spermhog/backs/citydist.py [ids] -> out/d_<id>.png ; then bake.py."""
import math, os, sys
import numpy as np
from pk import Layer, W, hx, mix, tohex
from zones import SIZE, OUT, base_fill

H, HZ = SIZE['mid']
OL = '#12040a'
BR = [['#4a161c', '#42141a', '#52191f', '#3e1218'], ['#3a121a', '#34101a', '#401420', '#2e0e16'], ['#56201f', '#4a1a1c', '#5e2422', '#441618']]
MO = '#22080c'
BRL = '#7a2a30'
STN = ['#3e2224', '#38201f', '#46282a', '#33191c']
SLATE = ['#1e0a10', '#24101a', '#180810', '#2a1218']
SLL = '#3e1a24'
MT = ['#5a1e22', '#4a181c', '#3a1216', '#2a0c10']
MTL = '#8a3a3e'
RED, HOT, PINK, CREAM, BONE, WARM = '#c4121c', '#ff2630', '#ff6a72', '#f1d8a8', '#f1e7d0', '#e8a070'
DARKW = '#140508'
HAZE = '#1c0508'


def dim(c, k):
    return tohex(mix(c, HAZE, k))


# ------------------------------------------------------------------ fast helpers (no masks)
def fr(L, x, y, w, h, col):
    x, w = int(round(x)), int(round(w)); y0, y1 = max(0, int(round(y))), min(L.h, int(round(y + h)))
    if w <= 0 or y1 <= y0: return
    cols = np.arange(x, x + w) % W; c = hx(col)
    L.rgb[y0:y1][:, cols] = c; L.a[y0:y1][:, cols] = True


def dot(L, x, y, col):
    L.px(x, y, col)


def edge(m):
    return m & ~(np.roll(m, 1, 0) & np.roll(m, -1, 0) & np.roll(m, 1, 1) & np.roll(m, -1, 1))


def grow(m, n=1):
    d = m.copy()
    for _ in range(n): d = d | np.roll(d, 1, 0) | np.roll(d, -1, 0) | np.roll(d, 1, 1) | np.roll(d, -1, 1)
    return d


def halo(L, m, n, col, t=0.5):
    """a dithered glow round a lit shape (the old way to do see-through light)"""
    g = grow(m, n) & ~m
    th = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]])[L.ys % 4, L.xs % 4] / 16.0
    pick = g & (th < t); L.rgb[pick] = hx(col); L.a[pick] = True


# ------------------------------------------------------------------ pixel font for the signs
FONT = {'A': ['010', '101', '111', '101', '101'], 'B': ['110', '101', '110', '101', '110'], 'C': ['011', '100', '100', '100', '011'],
        'D': ['110', '101', '101', '101', '110'], 'E': ['111', '100', '110', '100', '111'], 'F': ['111', '100', '110', '100', '100'],
        'G': ['011', '100', '101', '101', '011'], 'H': ['101', '101', '111', '101', '101'], 'I': ['111', '010', '010', '010', '111'],
        'K': ['101', '101', '110', '101', '101'], 'L': ['100', '100', '100', '100', '111'], 'M': ['101', '111', '111', '101', '101'],
        'N': ['110', '101', '101', '101', '101'], 'O': ['010', '101', '101', '101', '010'], 'P': ['110', '101', '110', '100', '100'],
        'R': ['110', '101', '110', '101', '101'], 'S': ['011', '100', '010', '001', '110'], 'T': ['111', '010', '010', '010', '010'],
        'U': ['101', '101', '101', '101', '111'], 'V': ['101', '101', '101', '101', '010'], 'X': ['101', '101', '010', '101', '101'],
        'Y': ['101', '101', '010', '010', '010'], 'Z': ['111', '001', '010', '100', '111'], 'W': ['101', '101', '111', '111', '101'], '!': ['010', '010', '010', '000', '010'],
        '2': ['110', '001', '010', '100', '111'], '4': ['101', '101', '111', '001', '001'], '7': ['111', '001', '010', '010', '010'], ' ': ['000'] * 5}


def text(L, x, y, s, col, sc=2, vert=False):
    for i, ch in enumerate(s):
        g = FONT.get(ch, FONT[' '])
        ox, oy = (0, i * 6 * sc) if vert else (i * 4 * sc, 0)
        for r, row in enumerate(g):
            for c, b in enumerate(row):
                if b == '1': fr(L, x + ox + c * sc, y + oy + r * sc, sc, sc, col)


def sign(L, x, y, s, col=HOT, vert=False, sc=2, board=DARKW, glow=True):
    """a neon sign: dark board with an outline, tube letters, a dithered glow round it"""
    n = len(s); w = (n * 4 - 1) * sc + 6 if not vert else 3 * sc + 6; h = 5 * sc + 6 if not vert else (n * 6 - 1) * sc + 6
    m = L.rectm(x, y, w, h)
    if glow: halo(L, m, 3, '#4a0810', 0.5)
    L.shape(m, board, out=OL, light='#3a1018')
    fr(L, x + 1, y + 1, w - 2, 1, '#2a0a10')
    text(L, x + 3, y + 3, s, col, sc, vert)


def neon_shape(L, m, col=HOT, core=PINK):
    halo(L, m, 3, '#4a0810', 0.5)
    e = edge(m); e2 = edge(m & ~e)
    L.put(e, col); L.put(e2, core)


def heart(L, cx, cy, r):
    return L.ellm(cx - r * 0.5, cy, r * 0.55, r * 0.5) | L.ellm(cx + r * 0.5, cy, r * 0.55, r * 0.5) | L.polym([(cx - r * 1.02, cy + r * 0.15), (cx + r * 1.02, cy + r * 0.15), (cx, cy + r * 1.15)])


def drop(L, cx, cy, r):
    return L.ellm(cx, cy + r * 0.4, r * 0.7, r * 0.7) | L.polym([(cx - r * 0.66, cy + r * 0.2), (cx + r * 0.66, cy + r * 0.2), (cx, cy - r)])


# ------------------------------------------------------------------ buildings
def window(L, x, y, w, h, lit, kind='plain', frame=OL):
    fr(L, x - 1, y - 1, w + 2, h + 2, frame)
    if lit:
        fr(L, x, y, w, h, lit)
        if kind == 'curtain':  # red light: drapes either side, a lamp glow in the middle
            fr(L, x, y, 1, h, '#5a0a12'); fr(L, x + w - 1, y, 1, h, '#5a0a12'); fr(L, x, y, w, 1, '#7a0a14')
            if w > 4: fr(L, x + w // 2 - 1, y + h // 2 - 1, 2, 2, PINK)
        else:
            fr(L, x, y + h // 2, w, 1, tohex(mix(lit, '#000000', 0.35)))
            if w >= 6: fr(L, x + w // 2, y, 1, h, tohex(mix(lit, '#000000', 0.35)))
            fr(L, x, y, 1, 1, tohex(mix(lit, '#ffffff', 0.4)))
    else:
        fr(L, x, y, w, h, DARKW); fr(L, x, y, 1, max(1, h // 3), '#3a1218')
    fr(L, x - 1, y + h + 1, w + 2, 1, '#5a2a2c')  # sill


def building(L, x, w, top, roof='gable', bricks=0, depth=0.0, wins=None, door=True, chimney=True, seed=0, slab=False):
    """one house: brick body, a roof of black slate, outline, lit top-left edge, windows from wins(L, x, top, w) or a grid"""
    r = np.random.RandomState(abs(int(seed)) % (2 ** 31))
    cols = [dim(c, depth) for c in (BR[bricks % 3] if not slab else STN)]
    body = L.rectm(x, top, w, HZ - top)
    if roof == 'gable': rf = L.polym([(x - 3, top + 1), (x + w / 2, top - w * 0.42), (x + w + 3, top + 1)])
    elif roof == 'steep': rf = L.polym([(x - 3, top + 1), (x + w / 2, top - w * 0.9), (x + w + 3, top + 1)])
    elif roof == 'mansard': rf = L.polym([(x - 3, top + 1), (x + 6, top - 16), (x + w - 6, top - 16), (x + w + 3, top + 1)])
    elif roof == 'dutch':
        s = max(6, w // 6); pts = [(x, top + 1)]
        for k in range(3): pts += [(x + k * s, top - k * 8 - 8), (x + (k + 1) * s, top - k * 8 - 8)]
        pts += [(x + w - 3 * s, top - 30), (x + w - 3 * s, top - 30)]
        for k in range(2, -1, -1): pts += [(x + w - (k + 1) * s, top - k * 8 - 8), (x + w - k * s, top - k * 8 - 8)]
        pts += [(x + w, top + 1)]; rf = L.polym(pts)
    else: rf = L.rectm(x - 2, top - 5, w + 4, 6)  # flat: a parapet
    if slab: L.stones(body, cols, dim(MO, depth), 12, light=dim(BRL, depth))
    else: L.bricks(body, cols, dim(MO, depth), 12, 6, x0=int(x), light=dim(BRL, depth))
    L.bricks(rf, [dim(c, depth) for c in SLATE], dim('#0c0406', depth), 8, 4, light=dim(SLL, depth))
    L.shape(body | rf, None, out=OL, light=dim(BRL, depth * 0.5), shade=dim('#1a0608', depth))
    if roof == 'flat':
        for k in range(int(x), int(x + w), 8): fr(L, k, top - 7, 4, 2, dim(MT[1], depth))
    # string course under the roof and between floors
    fr(L, x, top + 2, w, 2, dim(STN[2], depth)); fr(L, x, top + 4, w, 1, OL)
    if chimney and roof in ('gable', 'mansard', 'flat') and w > 34:
        cx = x + w * (0.2 + r.rand() * 0.6); ct = top - (w * 0.42 if roof == 'gable' else 16) * 0.6 - 10
        cm = L.rectm(cx, ct, 8, top - ct + 2); L.bricks(cm, cols, dim(MO, depth), 4, 3); L.shape(cm, None, out=OL, light=dim(BRL, depth))
        fr(L, cx - 1, ct - 2, 10, 2, dim(STN[2], depth)); fr(L, cx + 1, ct - 5, 2, 3, dim(MT[2], depth)); fr(L, cx + 5, ct - 4, 2, 2, dim(MT[2], depth))
    if wins: wins(L, x, top, w, depth, r)
    if door:
        dx = x + w * (0.15 + 0.5 * r.rand()); dw = 10
        fr(L, dx - 2, HZ - 22, dw + 4, 22, OL); fr(L, dx, HZ - 20, dw, 20, '#2a0a0e'); fr(L, dx + 1, HZ - 19, dw - 2, 9, '#3a1014'); fr(L, dx + 1, HZ - 9, dw - 2, 8, '#3a1014')
        fr(L, dx - 1, HZ - 24, dw + 2, 2, dim(STN[2], depth)); fr(L, dx + dw - 3, HZ - 11, 1, 2, CREAM)
        fr(L, dx - 3, HZ - 2, dw + 6, 2, dim(STN[0], depth))
    return body | rf


def grid(lit=0.35, cols_=(HOT, CREAM, RED), kind='plain', ww=6, wh=10, sx=14, sy=20, low=26):
    def f(L, x, top, w, depth, r):
        n = max(1, int((w - 8) // sx)); off = x + (w - (n - 1) * sx - ww) / 2
        for yy in range(int(top + 12), HZ - low, sy):
            for i in range(n):
                q = r.rand(); c = cols_[r.randint(len(cols_))] if q < lit else None
                window(L, off + i * sx, yy, ww, wh, dim(c, depth * 0.6) if c else None, kind if c == HOT or c == RED else 'plain')
    return f


def street(L, x0, x1, hmin, hmax, wmin, wmax, roofs, depth=0.0, wins=None, seed=1, door=True, gap=0):
    r = np.random.RandomState(seed); x = x0; out = []
    while x < x1:
        w = int(wmin + r.rand() * (wmax - wmin)); top = int(HZ - (hmin + r.rand() * (hmax - hmin)))
        building(L, x, w, top, roofs[r.randint(len(roofs))], r.randint(3), depth, wins or grid(), door, True, seed * 31 + int(x))
        out.append((x, w, top)); x += w + gap + (r.randint(3) if gap else 0)
    return out


def towers(L, depth=0.55, seed=3, hmin=110, hmax=160):
    """a back row of tall dark towers so every street has a skyline behind it (never flat)"""
    r = np.random.RandomState(seed); x = 0
    while x < W:
        w = int(40 + r.rand() * 50); top = int(HZ - hmin - r.rand() * (hmax - hmin))
        m = L.rectm(x, top, w, HZ - top)
        kind = r.randint(4)
        if kind == 0: m |= L.polym([(x, top), (x + w / 2, top - 40 - r.rand() * 30), (x + w, top)])
        elif kind == 1: m |= L.rectm(x + w * 0.3, top - 14, w * 0.4, 15) | L.rectm(x + w / 2 - 1, top - 34, 2, 22)
        elif kind == 2: m |= L.rectm(x + 4, top - 8, w - 8, 9) | L.rectm(x + 10, top - 16, w - 20, 9)
        L.put(m, dim('#2a0c12', depth * 0.6)); L.shape(m, None, out=OL, light=dim('#4a1820', depth * 0.5))
        for yy in range(top + 6, HZ - 10, 9):
            for xx in range(int(x) + 4, int(x + w) - 4, 7):
                q = r.rand()
                if q < 0.16: fr(L, xx, yy, 3, 4, dim(HOT if q < 0.07 else CREAM, depth))
                elif q < 0.5: fr(L, xx, yy, 3, 4, dim('#3a1218', depth * 0.4))
        if kind == 1: fr(L, x + w / 2 - 2, top - 37, 4, 3, HOT)
        x += w + r.randint(4)


# ------------------------------------------------------------------ dressing
def wire(L, x0, x1, y, sag, col='#0c0406'):
    pts = []
    for k in range(int(x1 - x0) + 1):
        t = k / max(1, (x1 - x0)); yy = y + sag * 4 * t * (1 - t); fr(L, x0 + k, yy, 1, 1, col); pts.append((x0 + k, yy))
    return pts


def lanterns(L, x0, x1, y, sag, n, col=RED):
    pts = wire(L, x0, x1, y, sag)
    for i in range(1, n + 1):
        px_, py_ = pts[int(i * (len(pts) - 1) / (n + 1))]
        m = L.ellm(px_, py_ + 6, 3, 4); halo(L, m, 2, '#4a0810', 0.5)
        L.shape(m, col, out=OL, light=PINK); fr(L, px_ - 1, py_ + 1, 3, 1, '#2a0a0e'); fr(L, px_, py_ + 11, 1, 2, '#2a0a0e')


def bulbs(L, x0, x1, y, sag, step=8, col=CREAM):
    pts = wire(L, x0, x1, y, sag)
    for k in range(0, len(pts), step):
        px_, py_ = pts[k]; fr(L, px_, py_ + 1, 2, 2, col); fr(L, px_, py_ + 3, 2, 1, '#8a5a3a')


def firescape(L, x, top, floors, w=22):
    for i in range(floors):
        y = top + i * 20
        fr(L, x, y, w, 2, MT[1]); fr(L, x, y + 2, w, 1, OL)
        for k in range(0, w, 3): fr(L, x + k, y - 6, 1, 6, MT[2])
        fr(L, x, y - 7, w, 1, MT[1])
        if i < floors - 1:
            for k in range(18): fr(L, x + 2 + k, y + 2 + k, 2, 1, MT[2])


def awning(L, x, y, w, cols=(RED, '#2a0a0e'), d=10):
    m = L.polym([(x, y), (x + w, y), (x + w + 4, y + d), (x - 4, y + d)])
    stripe = ((L.xs - int(x)) // 6) % 2 == 0
    L.put(m & stripe, cols[0]); L.put(m & ~stripe, cols[1]); L.shape(m, None, out=OL, light=PINK)
    for k in range(int(x - 4), int(x + w + 4), 6): fr(L, k, y + d, 4, 2, cols[0]); fr(L, k + 1, y + d + 2, 2, 1, cols[0])


def shopfront(L, x, w, lit=CREAM):
    """big lit shop window at street level with a door and a fascia"""
    fr(L, x, HZ - 40, w, 40, OL); fr(L, x + 2, HZ - 38, w - 4, 8, '#2a0a0e')
    fr(L, x + 3, HZ - 28, w - 18, 24, lit); fr(L, x + 3, HZ - 28, w - 18, 2, tohex(mix(lit, '#000000', 0.3)))
    for k in range(int(x + 3), int(x + w - 15), 10): fr(L, k, HZ - 28, 1, 24, '#2a0a0e')
    fr(L, x + w - 13, HZ - 28, 10, 28, '#2a0a0e'); fr(L, x + w - 12, HZ - 27, 8, 12, '#4a1418')
    fr(L, x + 3, HZ - 6, w - 18, 2, '#3a1218')
    # silhouettes at a table inside
    for k in range(int(x + 10), int(x + w - 22), 22): fr(L, k, HZ - 16, 4, 6, '#5a2418'); fr(L, k + 1, HZ - 19, 2, 3, '#5a2418'); fr(L, k + 6, HZ - 12, 8, 2, '#5a2418')


def billboard(L, x, y, w, h, art='drop'):
    for px_ in (x + 6, x + w - 10): fr(L, px_, y + h, 4, HZ - y - h, MT[2]); fr(L, px_, y + h, 1, HZ - y - h, MT[0])
    for k in range(int(y + h + 8), HZ - 4, 12): fr(L, x + 6, k, w - 12, 1, MT[3])
    m = L.rectm(x, y, w, h); L.shape(m, '#2a0a0e', out=OL, light='#5a1a20')
    fr(L, x + 3, y + 3, w - 6, h - 6, RED); fr(L, x + 3, y + 3, w - 6, 2, HOT)
    if art == 'drop':
        L.shape(drop(L, x + 18, y + h / 2, 10), CREAM, out=OL, light='#fffbe8'); fr(L, x + 15, y + h / 2 + 1, 2, 2, OL); fr(L, x + 20, y + h / 2 + 1, 2, 2, OL)
    for k in range(3): fr(L, x + 34, y + 8 + k * 7, w - 44 - k * 8, 3, CREAM if k == 0 else '#ff8a8a')
    for k in range(int(x + 4), int(x + w - 4), 12): fr(L, k, y - 3, 2, 3, MT[1]); fr(L, k - 1, y - 4, 4, 1, CREAM)


def crane(L, x, top, jib=180, flip=False):
    for yy in range(top, HZ, 1): fr(L, x, yy, 2, 1, '#8a0a14'); fr(L, x + 12, yy, 2, 1, '#8a0a14')
    for yy in range(top, HZ - 12, 12):
        for k in range(12): fr(L, x + k, yy + k, 1, 1, '#6a0a10'); fr(L, x + 12 - k, yy + k, 1, 1, '#6a0a10')
        fr(L, x, yy, 14, 1, '#6a0a10')
    s = -1 if flip else 1; jx0, jx1 = (x - 40, x + jib) if not flip else (x - jib + 14, x + 54)
    fr(L, jx0, top - 4, jx1 - jx0, 2, '#8a0a14'); fr(L, jx0, top + 4, jx1 - jx0, 2, '#8a0a14')
    for k in range(int(jx0), int(jx1), 8):
        for j in range(8): fr(L, k + j, top - 2 + j, 1, 1, '#6a0a10')
    fr(L, x - 2, top - 22, 18, 18, MT[0]); fr(L, x - 2, top - 22, 18, 1, MTL); fr(L, x, top - 18, 14, 6, '#e8a070')
    fr(L, x + 4, top - 36, 6, 14, '#6a0a10'); fr(L, x + 6, top - 40, 2, 4, HOT)
    hx_ = (jx1 - 30) if not flip else (jx0 + 30); fr(L, hx_, top + 6, 1, 70, '#0c0406'); fr(L, hx_ - 3, top + 76, 7, 4, '#8a0a14'); fr(L, hx_ - 1, top + 80, 3, 4, '#6a0a10')
    cw = jx0 + 4 if not flip else jx1 - 18; fr(L, cw, top + 6, 14, 12, '#2a0c10'); fr(L, cw, top + 6, 14, 1, MTL)
    fr(L, jx1 - 3 if not flip else jx0, top - 6, 3, 3, HOT)


def scaffold(L, x, w, top, tarp=RED):
    for k in range(int(x), int(x + w) + 1, 24): fr(L, k, top, 2, HZ - top, MT[1])
    for yy in range(top, HZ, 22):
        fr(L, x, yy, w + 2, 2, MT[1]); fr(L, x, yy + 2, w + 2, 2, '#4a2a1a')
        for k in range(int(x), int(x + w), 24):
            for j in range(22): fr(L, k + j, yy + j, 1, 1, MT[2])
    tm = L.rectm(x + 26, top + 24, 46, HZ - top - 50); L.dither(tm, tarp, '#7a0a12', 0.35); L.shape(tm, None, out=OL, light=PINK)
    for yy in range(top + 30, HZ - 30, 10): fr(L, x + 26, yy, 46, 1, '#7a0a12')


def container(L, x, y, w, h, col):
    m = L.rectm(x, y, w, h); L.shape(m, col, out=OL, light=tohex(mix(col, '#ffffff', 0.25)), shade=tohex(mix(col, '#000000', 0.4)))
    for k in range(int(x) + 3, int(x + w) - 2, 4): fr(L, k, y + 2, 1, h - 4, tohex(mix(col, '#000000', 0.35)))
    fr(L, x + w - 12, y + 3, 1, h - 6, OL); fr(L, x + w - 8, y + h / 2, 3, 1, MTL)


def gravestone(L, x, h=14, cross=False):
    if cross:
        m = L.rectm(x + 3, HZ - h - 4, 3, h + 4) | L.rectm(x, HZ - h, 9, 3)
    else:
        m = L.rectm(x, HZ - h, 10, h) | L.ellm(x + 5, HZ - h, 5, 4)
    L.shape(m, STN[0], out=OL, light=STN[2])


def deadtree(L, x, h=70):
    def br(x0, y0, a, l, d):
        if d == 0 or l < 4: return
        x1, y1 = x0 + math.cos(a) * l, y0 - math.sin(a) * l
        for k in range(int(l)):
            t = k / l; fr(L, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, max(1, d - 1), 1, '#0c0406')
        br(x1, y1, a + 0.5, l * 0.7, d - 1); br(x1, y1, a - 0.45, l * 0.65, d - 1)
    fr(L, x - 2, HZ - h * 0.45, 4, h * 0.45, '#0c0406'); br(x, HZ - h * 0.45, math.pi / 2 + 0.1, h * 0.3, 4)


def ironfence(L, x0, x1, h=16):
    fr(L, x0, HZ - h + 2, x1 - x0, 1, '#0c0406'); fr(L, x0, HZ - 4, x1 - x0, 1, '#0c0406')
    for k in range(int(x0), int(x1), 4): fr(L, k, HZ - h, 1, h, '#0c0406'); fr(L, k - 1, HZ - h - 1, 3, 1, '#0c0406'); fr(L, k, HZ - h - 2, 1, 1, '#0c0406')


def floor(L, kind='paving', wet=False):
    lip = L.rectm(0, HZ, W, 5); L.shape(lip, STN[2], out=OL, light='#6a3a3a', shade=STN[3])
    def f(m):
        if kind == 'cobble': L.stones(m, STN, '#1a0a0c', 7, light='#5a3434')
        elif kind == 'plank': L.bricks(m, ['#4a2018', '#3e1a14', '#52241a'], '#1a0806', 40, 6, y0=HZ + 5, light='#6a3424')
        elif kind == 'asphalt': L.noise(m, ['#24101a', '#2a1418', '#1e0c12', '#2e161a'], 0.6, 1); fr(L, 0, HZ + 18, W, 1, '#3a1a1e')
        else: L.bricks(m, STN, '#1a0a0c', 24, 8, y0=HZ + 5, light='#5a3434')
    base_fill(L, HZ + 5, f)
    if wet:  # red neon smeared in the wet street
        for x in range(0, W, 2):
            c = L.rgb[HZ - 30:HZ - 6, x]; lit = c[:, 0] > 180
            if lit.any():
                for k in range(0, 40, 3):
                    if (x + k) % 4 == 0: fr(L, x, HZ + 6 + k, 1, 1, tohex(mix(c[lit][0], '#1a0608', 0.4 + k / 70)))


# ------------------------------------------------------------------ the districts
def d_row(L):  # Clubhouse Row: gothic terraces, gables and chimneys, warm windows, doors on steps
    towers(L, seed=11)
    street(L, -10, W - 10, 70, 120, 56, 92, ['gable', 'gable', 'steep', 'mansard', 'dutch'], wins=grid(0.45, (CREAM, HOT, WARM)), seed=12)
    for x in range(40, W, 160): fr(L, x, HZ - 70, 1, 70, '#0c0406'); fr(L, x - 3, HZ - 76, 7, 6, '#0c0406'); fr(L, x - 2, HZ - 75, 5, 4, CREAM)
    floor(L, 'paving')


def d_cafe(L):  # the cafe quarter: shopfronts with striped awnings, string lights between the houses, hanging signs
    towers(L, seed=21, hmin=100)
    bs = street(L, -10, W - 10, 80, 120, 70, 110, ['gable', 'mansard', 'flat', 'dutch'], wins=grid(0.4, (CREAM, WARM, HOT), low=48), seed=22, door=False)
    for i, (x, w, top) in enumerate(bs):
        shopfront(L, x + 4, w - 8, [CREAM, WARM, '#f1b890'][i % 3]); awning(L, x + 4, HZ - 50, w - 8, (RED, '#2a0a0e') if i % 2 else ('#7a0a12', '#f1d8a8'))
        fr(L, x + 6, top + 30, w - 12, 3, '#2a0a0e')
        for k in range(int(x + 8), int(x + w - 8), 5): fr(L, k, top + 28, 2, 2, HOT if (k // 5) % 2 else '#7a0a12')
        if i % 2 == 0:
            fr(L, x + w - 4, HZ - 70, 14, 1, MT[1]); m = L.rectm(x + w - 2, HZ - 68, 12, 12); L.shape(m, '#2a0a0e', out=OL, light='#5a1a20')
            fr(L, x + w + 1, HZ - 65, 6, 6, CREAM); fr(L, x + w + 7, HZ - 64, 2, 3, CREAM)
        if i + 1 < len(bs): bulbs(L, x + w * 0.5, bs[i + 1][0] + bs[i + 1][1] * 0.5, top + 40, 14)
    sign(L, bs[1][0] + 10, bs[1][2] + 46, 'CAFE', CREAM); sign(L, bs[4][0] + 10, bs[4][2] + 46, 'OPEN', HOT)
    floor(L, 'cobble')


def d_site(L):  # the building site: a concrete frame going up, scaffolding with red tarps, tower cranes, a hoarding
    towers(L, seed=31, hmin=90)
    for x0, w, top in ((60, 150, 30), (210, 150, 60), (520, 110, 50), (630, 190, 24)):  # the frame goes up in steps, never one flat top
        for yy in range(top, HZ, 30): fr(L, x0, yy, w, 6, STN[0]); fr(L, x0, yy, w, 1, '#6a3a3a'); fr(L, x0, yy + 6, w, 1, OL)
        for k in range(x0, x0 + w + 1, 50): fr(L, k, top, 8, HZ - top, STN[1]); fr(L, k, top, 1, HZ - top, '#6a3a3a'); fr(L, k + 8, top, 1, HZ - top, OL)
        for yy in range(top + 7, HZ, 30):
            for k in range(x0 + 8, x0 + w, 50): fr(L, k, yy, 42, 23, '#1a0608'); fr(L, k + 4, yy + 18, 10, 5, '#2a0e10')
        for k in range(x0, x0 + w, 50): fr(L, k + 3, top - 14, 2, 14, MT[2])  # rebar
        if w > 140: scaffold(L, x0 + 40, 96, top + 30)
        fr(L, x0 + 20, top + 37, 3, 3, HOT); fr(L, x0 + w - 30, top + 67, 3, 3, CREAM)
    crane(L, 440, 22, 220); crane(L, 860, 40, 170, True)
    for x in range(0, W, 48):  # the hoarding with posters
        fr(L, x, HZ - 30, 46, 30, '#2a0c10'); fr(L, x, HZ - 30, 46, 1, '#5a1a20'); fr(L, x + 46, HZ - 30, 2, 30, OL)
        if (x // 48) % 3 == 0: fr(L, x + 8, HZ - 26, 22, 18, RED); fr(L, x + 10, HZ - 24, 18, 3, CREAM); fr(L, x + 14, HZ - 18, 10, 8, '#7a0a12')
        elif (x // 48) % 3 == 1:
            for k in range(0, 46, 8): fr(L, x + k, HZ - 8, 4, 4, HOT)
    floor(L, 'asphalt')


def d_downtown(L):  # downtown: tall towers, window grids, water tanks and aerials on the roofs, red billboards
    towers(L, seed=41, hmin=130, hmax=165)
    r = np.random.RandomState(42); x = -10; bs = []
    while x < W - 10:
        w = int(64 + r.rand() * 60); top = int(20 + r.rand() * 60)
        building(L, x, w, top, ['flat', 'flat', 'mansard'][r.randint(3)], r.randint(3), 0.0, grid(0.3, (CREAM, HOT, WARM), ww=4, wh=8, sx=9, sy=13, low=30), True, False, int(x), slab=r.rand() < 0.4)
        bs.append((x, w, top)); x += w
    for i, (x, w, top) in enumerate(bs):
        if i % 3 == 0:  # water tank on legs
            tx = x + w * 0.6; fr(L, tx, top - 10, 2, 10, MT[2]); fr(L, tx + 14, top - 10, 2, 10, MT[2])
            m = L.rectm(tx - 2, top - 30, 20, 20) | L.polym([(tx - 4, top - 30), (tx + 8, top - 40), (tx + 20, top - 30)])
            L.shape(m, '#3a1a14', out=OL, light='#6a3424')
            for k in range(int(top - 28), int(top - 10), 4): fr(L, tx - 2, k, 20, 1, '#2a0e0c')
        elif i % 3 == 1:
            ax = x + w * 0.3; fr(L, ax, top - 40, 2, 40, MT[1]); fr(L, ax - 4, top - 26, 10, 1, MT[1]); fr(L, ax - 1, top - 43, 4, 3, HOT)
    billboard(L, 200, 60, 110, 34); billboard(L, 680, 46, 120, 36)
    sign(L, bs[2][0] + 6, bs[2][2] + 30, 'HOTEL', HOT, vert=True)
    floor(L, 'paving')


def d_plaza(L):  # Potbelly Plaza: an old picture palace with a bulb marquee, an arcade hall, neon everywhere
    towers(L, seed=51)
    street(L, -10, 330, 80, 110, 56, 80, ['gable', 'dutch', 'mansard'], wins=grid(0.5, (HOT, CREAM)), seed=52)
    street(L, 640, W - 10, 80, 110, 56, 80, ['gable', 'steep', 'mansard'], wins=grid(0.5, (HOT, CREAM)), seed=53)
    # the theatre in the middle
    x0, w, top = 330, 310, 40
    m = L.rectm(x0, top, w, HZ - top) | L.polym([(x0 + 40, top), (x0 + w / 2, top - 34), (x0 + w - 40, top)])
    L.stones(m, STN, '#1a0a0c', 12, light='#5a3434'); L.shape(m, None, out=OL, light=BRL, shade='#1a0608')
    for k in range(4):  # tall arched windows lit red
        wx = x0 + 34 + k * 70; fr(L, wx - 1, top + 14, 22, 46, OL); fr(L, wx, top + 20, 20, 40, RED); L.shape(L.ellm(wx + 10, top + 20, 10, 8), RED, out=OL)
        fr(L, wx + 9, top + 14, 2, 46, '#5a0a12'); fr(L, wx, top + 40, 20, 2, '#5a0a12')
    mq = L.rectm(x0 + 20, HZ - 74, w - 40, 26); L.shape(mq, '#2a0a0e', out=OL, light='#5a1a20')
    for k in range(int(x0 + 22), int(x0 + w - 22), 5): fr(L, k, HZ - 73, 2, 2, CREAM); fr(L, k, HZ - 51, 2, 2, CREAM)
    text(L, x0 + 86, HZ - 67, 'POTBELLY', HOT, 2)
    sign(L, x0 + w / 2 - 22, top - 2, 'PLAZA', CREAM)
    for k in range(int(x0 + 30), int(x0 + w - 30), 40): fr(L, k, HZ - 46, 30, 46, OL); fr(L, k + 2, HZ - 44, 26, 44, '#3a1014'); fr(L, k + 2, HZ - 44, 26, 4, CREAM)
    neon_shape(L, drop(L, 120, 70, 16)); neon_shape(L, drop(L, 850, 66, 14))
    sign(L, 40, HZ - 70, 'ARCADE', CREAM); sign(L, 700, HZ - 70, 'BAR', HOT)
    for x in range(0, W, 120): bulbs(L, x, x + 120, 20 if x % 240 else 26, 18, 6)
    floor(L, 'paving')


def d_alley(L):  # Red Light Alley: narrow tall houses packed close, every window red behind drapes, blade signs, neon, fire escapes, lanterns
    towers(L, seed=61, hmin=120)
    bs = street(L, -10, W - 10, 100, 150, 46, 74, ['flat', 'steep', 'mansard', 'gable'], wins=grid(0.75, (HOT, RED, HOT, PINK), kind='curtain', ww=8, wh=11, sx=15, sy=19, low=40), seed=62, door=False)
    for i, (x, w, top) in enumerate(bs):
        # doorway at the street with a red glow and a bead curtain, a step, a lamp over it
        dx = x + w / 2 - 8; fr(L, dx - 2, HZ - 30, 20, 30, OL); fr(L, dx, HZ - 28, 16, 28, '#7a0a12')
        for k in range(int(dx + 1), int(dx + 16), 2): fr(L, k, HZ - 28, 1, 26, HOT if k % 4 else PINK)
        L.shape(L.ellm(dx + 8, HZ - 28, 9, 5), '#7a0a12', out=OL); fr(L, dx + 6, HZ - 38, 4, 4, HOT); halo(L, L.rectm(dx + 6, HZ - 38, 4, 4), 3, '#5a0a12')
        if i % 3 == 1: firescape(L, x + w - 26, top + 22, max(2, int((HZ - top - 60) / 20)))
        if i % 4 == 0: neon_shape(L, heart(L, x + w / 2, top + 24, 9))
        if i % 4 == 2: sign(L, x + w - 4, top + 34, ['XXX', 'LIVE', 'PEEP', 'GIRLS', 'LOVE', 'HOTEL'][i % 6], [HOT, PINK, CREAM][i % 3], vert=True)
        if i + 1 < len(bs) and i % 2 == 0: lanterns(L, x + w * 0.4, bs[i + 1][0] + bs[i + 1][1] * 0.6, min(top, bs[i + 1][2]) + 30, 18, 4)
    sign(L, 300, HZ - 60, 'OPEN 24', HOT); sign(L, 760, HZ - 56, 'XXX', PINK)
    floor(L, 'cobble', wet=True)


def d_docks(L):  # the cream docks: warehouses with big doors, stacked containers, a gantry crane and a ship's funnel behind
    towers(L, seed=71, hmin=80, hmax=120)
    m = L.polym([(560, HZ - 40), (900, HZ - 40), (880, HZ - 10), (580, HZ - 10)]) | L.rectm(680, HZ - 96, 30, 60) | L.rectm(760, HZ - 80, 26, 44)
    L.put(m, dim('#2a0a10', 0.3)); L.shape(m, None, out=OL, light='#4a1a20'); fr(L, 680, HZ - 90, 30, 4, RED); fr(L, 760, HZ - 74, 26, 4, RED)
    for k in range(600, 860, 14): fr(L, k, HZ - 34, 6, 4, CREAM)
    for x0, w, top in ((-10, 230, 90), (300, 200, 70), (640, 250, 96)):
        mm = L.rectm(x0, top, w, HZ - top) | L.polym([(x0 - 4, top + 1), (x0 + w / 2, top - 30), (x0 + w + 4, top + 1)])
        L.put(mm, '#3a1216')
        for k in range(int(x0), int(x0 + w), 4): fr(L, k, top - 30, 1, HZ - top + 30, '#2a0c10')
        L.shape(mm, None, out=OL, light=BRL, shade='#1a0608')
        for dxx in (x0 + 30, x0 + w - 90):
            fr(L, dxx - 2, HZ - 64, 64, 64, OL); fr(L, dxx, HZ - 62, 60, 62, '#2a0c10')
            for k in range(int(dxx), int(dxx + 60), 6): fr(L, k, HZ - 62, 1, 62, '#4a1a1e')
            fr(L, dxx, HZ - 34, 60, 2, OL); fr(L, dxx + 26, HZ - 20, 10, 20, '#e8a070')
        for k in range(int(x0 + 20), int(x0 + w - 20), 30): window(L, k, top + 10, 14, 8, CREAM if (k // 30) % 3 == 0 else None)
        text(L, x0 + 30, top + 26, ['DOCK 2', 'DOCK 4', 'DOCK 7'][(x0 // 300) % 3], CREAM, 2)
    for x, y, c in ((220, HZ - 24, RED), (220, HZ - 48, '#5a1a1e'), (260, HZ - 24, '#7a2a20'), (520, HZ - 24, '#3a1a1e'), (500, HZ - 48, RED), (560, HZ - 24, '#5a1a1e')):
        container(L, x, y, 70, 24, c)
    for gx in (140, 600):  # gantry crane
        for lx in (gx, gx + 90):
            for yy in range(30, HZ, 10):
                for k in range(10): fr(L, lx + (k if (yy // 10) % 2 else 9 - k), yy + k, 1, 1, RED)
            fr(L, lx, 30, 2, HZ - 30, '#7a0a12'); fr(L, lx + 9, 30, 2, HZ - 30, '#7a0a12')
        fr(L, gx - 30, 24, 160, 8, '#7a0a12'); fr(L, gx - 30, 24, 160, 1, HOT); fr(L, gx + 40, 32, 18, 12, '#2a0c10'); fr(L, gx + 43, 35, 12, 5, CREAM)
        fr(L, gx + 48, 44, 1, 60, '#0c0406'); fr(L, gx + 44, 104, 9, 4, MT[1])
    floor(L, 'plank')


def d_highway(L):  # the overpass: a raised road on pillars, lamps and signs on it, the city behind and under it
    towers(L, seed=81, hmin=110, hmax=160)
    street(L, -10, W - 10, 40, 70, 50, 80, ['gable', 'flat', 'mansard'], depth=0.3, wins=grid(0.35, (HOT, CREAM)), seed=82, door=False)
    dy = 70
    for px_ in range(40, W, 200):  # pillars
        m = L.rectm(px_, dy + 22, 30, HZ - dy - 22) | L.polym([(px_ - 10, dy + 22), (px_ + 40, dy + 22), (px_ + 30, dy + 40), (px_, dy + 40)])
        L.stones(m, STN, '#1a0a0c', 10, light='#5a3434'); L.shape(m, None, out=OL, light='#6a3a3a', shade='#1a0608')
        fr(L, px_ + 6, dy + 60, 18, 24, '#2a0a0e'); text(L, px_ + 8, dy + 64, 'X', HOT, 2); fr(L, px_ + 4, HZ - 30, 22, 4, '#7a0a12')
    m = L.rectm(0, dy, W, 22); L.bricks(m, STN, '#1a0a0c', 40, 11, light='#6a3a3a'); L.shape(m, None, out=OL, light='#6a3a3a')
    fr(L, 0, dy + 20, W, 2, OL); fr(L, 0, dy + 22, W, 4, '#1a0608')
    fr(L, 0, dy - 10, W, 2, MT[1]); fr(L, 0, dy - 4, W, 1, MT[2])
    for k in range(0, W, 6): fr(L, k, dy - 10, 1, 10, MT[2])
    for k in range(0, W, 16): fr(L, k, dy + 10, 8, 2, CREAM if (k // 16) % 2 else '#7a0a12')
    for lx in range(100, W, 120):  # lamps on the deck
        fr(L, lx, dy - 44, 2, 44, '#0c0406'); fr(L, lx, dy - 44, 12, 2, '#0c0406'); fr(L, lx + 8, dy - 42, 8, 3, CREAM); halo(L, L.rectm(lx + 8, dy - 42, 8, 3), 3, '#5a2a1a')
    for sx in (260, 700):  # road signs hanging off the deck
        fr(L, sx + 10, dy + 26, 2, 8, MT[1]); fr(L, sx + 60, dy + 26, 2, 8, MT[1]); m = L.rectm(sx, dy + 34, 72, 24); L.shape(m, '#7a0a12', out=OL, light=HOT)
        fr(L, sx + 3, dy + 37, 66, 18, '#5a0a10'); text(L, sx + 6, dy + 40, 'EXIT 4' if sx == 260 else 'ROW 7', CREAM, 2)
    for x in range(0, W, 60): fr(L, x, HZ - 6, 30, 2, CREAM)
    floor(L, 'asphalt')


def d_oldtown(L):  # old town: the gothic church with its spire and rose window, crooked timber houses, graves, dead trees
    towers(L, seed=91, hmin=90, hmax=120)
    street(L, -10, 330, 70, 110, 44, 66, ['steep', 'gable', 'steep'], wins=grid(0.35, (CREAM, HOT, WARM)), seed=92)
    street(L, 690, W - 10, 70, 110, 44, 66, ['steep', 'gable', 'steep'], wins=grid(0.35, (CREAM, HOT, WARM)), seed=93)
    cx, top = 510, 88
    nave = L.rectm(cx - 150, top + 30, 300, HZ - top - 30) | L.polym([(cx - 156, top + 31), (cx, top - 20), (cx + 156, top + 31)])
    L.stones(nave, STN, '#1a0a0c', 11, light='#5a3434'); L.shape(nave, None, out=OL, light='#6a3a3a', shade='#1a0608')
    tw = L.rectm(cx - 26, top - 10, 52, HZ - top + 10); L.stones(tw, STN, '#1a0a0c', 11, light='#5a3434'); L.shape(tw, None, out=OL, light='#6a3a3a')
    sp = L.polym([(cx - 30, top - 9), (cx, top - 58 - 0), (cx + 30, top - 9)]) | L.polym([(cx - 4, top - 56), (cx + 4, top - 56), (cx, top - 60)])
    L.bricks(sp, SLATE, '#0c0406', 6, 4, light=SLL); L.shape(sp, None, out=OL, light=SLL)
    rose = L.ellm(cx, top + 20, 16, 16); L.shape(rose, RED, out=OL, light=HOT)
    for k in range(8):
        a = k * math.pi / 4
        for j in range(15): fr(L, cx + math.cos(a) * j, top + 20 + math.sin(a) * j, 1, 1, '#2a0a0e')
    fr(L, cx - 3, top + 17, 6, 6, CREAM)
    for k in (-110, -70, 50, 90):  # lancet windows lit red
        wx = cx + k; fr(L, wx - 1, top + 50, 14, 50, OL); fr(L, wx, top + 56, 12, 44, RED); L.shape(L.polym([(wx, top + 57), (wx + 6, top + 47), (wx + 12, top + 57)]), RED, out=OL)
        fr(L, wx + 5, top + 52, 2, 48, '#5a0a12')
    for k in (-150, -100, 100, 150): bm = L.polym([(cx + k - 6, HZ), (cx + k - 6, top + 60), (cx + k, top + 50), (cx + k + 6, top + 60), (cx + k + 6, HZ)]); L.stones(bm, STN, '#1a0a0c', 9); L.shape(bm, None, out=OL, light='#6a3a3a')
    fr(L, cx - 14, HZ - 40, 28, 40, OL); fr(L, cx - 12, HZ - 38, 24, 38, '#3a1014'); L.shape(L.ellm(cx, HZ - 38, 12, 8), '#3a1014', out=OL); fr(L, cx - 1, HZ - 40, 2, 40, OL)
    fr(L, cx - 10, HZ - 30, 8, 30, '#5a1a1a'); fr(L, cx + 2, HZ - 30, 8, 30, '#5a1a1a')
    fr(L, cx - 2, top - 74, 4, 16, OL); fr(L, cx - 7, top - 68, 14, 4, OL); fr(L, cx - 1, top - 73, 2, 14, '#6a3a3a'); fr(L, cx - 6, top - 67, 12, 2, '#6a3a3a')
    for k in range(10): gravestone(L, 340 + k * 34 + (k % 2) * 8, 10 + (k * 7) % 8, k % 3 == 0)
    ironfence(L, 330, 690)
    deadtree(L, 360, 90); deadtree(L, 660, 80); deadtree(L, 880, 60)
    floor(L, 'cobble')


def d_drain(L):  # the storm drain: the city wall with houses on top and the great barred arch the Beast lives in
    towers(L, seed=101)
    street(L, -10, W - 10, 140, 165, 50, 80, ['gable', 'steep', 'mansard', 'flat'], depth=0.25, wins=grid(0.4, (HOT, CREAM)), seed=102, door=False)
    wt = 70
    m = L.rectm(0, wt, W, HZ - wt); L.stones(m, STN, '#1a0a0c', 14, light='#5a3434'); L.shape(m, None, out=OL, light='#6a3a3a')
    for k in range(0, W, 24): cm = L.rectm(k, wt - 8, 14, 9); L.shape(cm, STN[2], out=OL, light='#6a3a3a')
    cx = 480; arch = L.rectm(cx - 120, HZ - 70, 240, 70) | L.ellm(cx, HZ - 70, 120, 66)
    L.shape(grow(arch, 6) & ~arch, STN[2], out=OL, light='#7a4a4a'); L.put(arch, '#0a0305')
    inner = L.rectm(cx - 90, HZ - 60, 180, 60) | L.ellm(cx, HZ - 60, 90, 46); L.put(inner, '#160608')
    for k in range(-108, 110, 18):
        for yy in range(HZ - 136, HZ):
            if arch[yy, (cx + k) % W]: fr(L, cx + k, yy, 4, 1, MT[1]); fr(L, cx + k, yy, 1, 1, MTL)
    for yy in (HZ - 90, HZ - 44): fr(L, cx - 118, yy, 236, 3, MT[1])
    for k in range(-30, 31, 3): fr(L, cx + k, HZ - 8, 2, 8, CREAM if k % 2 else '#d8c890')
    for ex, ey in ((cx - 70, HZ - 92), (cx + 60, HZ - 86)): fr(L, ex, ey, 4, 3, HOT); fr(L, ex + 10, ey, 4, 3, HOT)
    for px_ in (120, 820):
        pm = L.ellm(px_, wt + 40, 14, 14); L.shape(grow(pm, 3) & ~pm, MT[1], out=OL, light=MTL); L.put(pm, '#0a0305')
        for yy in range(wt + 54, HZ): fr(L, px_ - 4 + (yy % 3), yy, 8 - (yy % 2), 1, CREAM if yy % 4 else '#d8c890')
    for lx in (230, 700):
        for yy in range(wt, HZ, 6): fr(L, lx, yy, 12, 1, MT[1])
        fr(L, lx, wt, 1, HZ - wt, MT[1]); fr(L, lx + 11, wt, 1, HZ - wt, MT[1])
    sign(L, 300, HZ - 54, 'KEEP OUT', HOT)
    floor(L, 'paving')


DIST = {k[2:]: v for k, v in list(globals().items()) if k.startswith('d_') and callable(v)}


def build(did):
    L = Layer(H, seed=sum(map(ord, did)))
    DIST[did](L)
    k = 0.1; c = hx(HAZE); L.rgb = (L.rgb * (1 - k) + c * k).astype(np.int16)
    os.makedirs(OUT, exist_ok=True); p = os.path.join(OUT, 'd_%s.png' % did); L.save(p); return p


if __name__ == '__main__':
    ids = sys.argv[1:] or list(DIST)
    for d in ids:
        build(d); print(d)
