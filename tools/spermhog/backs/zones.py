"""The backdrop layers of every Spermhog zone: far, mid and near, painted as pixel art by pk.py.
Each layer has a horizon row (HZ) where its scenery stands; below that it carries on as solid scenery (walls, water, rock)
down to the bottom of the picture, and its last BAND rows repeat downwards cleanly, so no camera height ever shows an end.
Run: python3 tools/spermhog/backs/zones.py [zone]  -> out/<zone>_<layer>.png, then bake.py puts them in the game."""
import math, os, sys
import numpy as np
from pk import Layer, W, hx, mix, tohex, lighten

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
SIZE = {'far': (310, 140), 'mid': (330, 170), 'near': (230, 90)}  # height, horizon row
BAND = 32
OL = '#12040a'


def base_fill(L, y0, fn):
    """everything from row y0 to the bottom, painted by fn(mask)"""
    m = np.zeros((L.h, W), bool); m[y0:, :] = True; fn(m)


def arch(L, cx, top, w, h, fill, inner, out=OL, light=None, shade=None, depth=0):
    """a round-topped archway: a pillar block with an opening"""
    r = w / 2
    m = L.polym([(cx - r, top + r), (cx - r, top + h), (cx + r, top + h), (cx + r, top + r)]) | L.ellm(cx, top + r, r, r)
    L.shape(m, inner, out=out, light=light, shade=shade)


# =====================================================================================================  CREAM SEWERS
def sewer_far(L, hz):
    # a far vault wall of mossy brick with deep archways, cream falls from the outflow pipes, the river at the horizon
    wall = np.zeros((L.h, W), bool); wall[10:hz, :] = True
    L.bricks(wall, ['#2a3a30', '#26362c', '#2e4034', '#243228'], '#1a261e', 20, 10, light='#34483a')
    for i in range(6):
        cx = 80 + i * 160
        arch(L, cx, 34, 96, hz - 34, '#16221a', '#16221a', out='#1a261e', light=None)
        m = L.polym([(cx - 30, 70), (cx - 30, hz), (cx + 30, hz), (cx + 30, 70)]) | L.ellm(cx, 70, 30, 30)
        L.bricks(m, ['#1e2c22', '#1c2820', '#22302a'], '#121c16', 14, 7)
        m2 = L.polym([(cx - 14, 96), (cx - 14, hz), (cx + 14, hz), (cx + 14, 96)]) | L.ellm(cx, 96, 14, 14)
        L.put(m2, '#0e1812')
        # arch voussoirs round the big opening
        for k in range(13):
            a = math.pi + k * math.pi / 12
            x0, y0 = cx + math.cos(a) * 50, 82 + math.sin(a) * 50
            L.shape(L.ellm(x0, y0, 4, 4), '#3e5444', out='#1a261e')
        # the outflow pipe and its cream fall
        pm = L.ellm(cx + 80, 52, 10, 10)
        L.shape(pm, '#3a4a40', out='#121c16', light='#5a6e60')
        L.put(L.ellm(cx + 80, 52, 6, 6), '#0e1812')
        fall = L.rectm(cx + 75, 54, 10, hz - 54)
        L.dither(fall, '#c8b080', '#f1e0b0', ((L.xs + L.ys // 3) % 4 == 0).astype(float))
    # moss tufts dripping from the top of the wall
    for x in range(0, W, 6):
        l = int(3 + L.r() * 10)
        L.put(L.rectm(x, 10, 3, l), '#3a5a3a' if L.r() < 0.6 else '#2e4a30')
    top = np.zeros((L.h, W), bool); top[0:12, :] = True
    L.bricks(top, ['#22302a', '#1e2c24'], '#141e18', 30, 6, light='#2e4034')
    # the river at the horizon, then the sewer wall under it down to the bottom
    riv = np.zeros((L.h, W), bool); riv[hz:hz + 18, :] = True
    L.bands(riv, ['#c8b080', '#a8925e', '#8a7a50'], hz, hz + 18)
    for x in range(0, W, 9):
        L.put(L.rectm(x + int(L.r() * 6), hz + 2 + int(L.r() * 12), 5 + int(L.r() * 6), 1), '#f1e0b0')
    base_fill(L, hz + 18, lambda m: L.bricks(m, ['#22302a', '#1e2c24', '#26362c'], '#16201a', 20, 8, y0=hz + 18, light='#2e4034'))


def sewer_mid(L, hz):
    # big pipes on brackets, valve wheels, a tank, grates, and a brick ledge wall
    for i, (y, w) in enumerate([(60, 16), (96, 12), (128, 20)]):
        m = L.rectm(0, y, W, w)
        L.bands(m, ['#5a6e5a', '#4a5e4a', '#3a4e3e', '#2e3e32'], y, y + w)
        L.shape(m, None, out=OL)
        for x in range((i * 70) % 120, W, 120):  # flanges and rivets
            f = L.rectm(x, y - 3, 8, w + 6)
            L.shape(f, '#6a7e6a', out=OL, light='#8a9e88', shade='#3a4a3a')
            for ry in range(y, y + w, 5):
                L.px(x + 4, ry, '#a8b8a0')
        for x in range(40 + i * 33, W, 200):  # cream weeping from a joint
            L.put(L.rectm(x, y + w, 2, 6 + int(L.r() * 10)), '#d8c890')
    for x in range(30, W, 240):  # vertical pipes down into the floor, with a valve wheel
        m = L.rectm(x, 60, 18, L.h - 60)
        L.bands(m, ['#4a5e4a', '#5a6e5a', '#4a5e4a', '#33443a'], 0, 1)
        sh = L.rectm(x, 60, 18, L.h - 60)
        L.bricks(sh, ['#4e624e', '#5a6e5a', '#465a46'], '#3a4e3e', 18, 24)
        L.shape(sh, None, out=OL)
        L.put(L.rectm(x + 2, 60, 2, L.h - 60), '#7a8e78')
        cx, cy = x + 9, 112
        ring = L.ellm(cx, cy, 15, 15) & ~L.ellm(cx, cy, 11, 11)
        L.shape(ring, '#c4121c', out=OL, light='#ff5a5a', shade='#7a0a10')
        for a in range(4):
            sp = L.linem([(cx, cy), (cx + math.cos(a * 0.785 * 2) * 12, cy + math.sin(a * 0.785 * 2) * 12)], 2)
            L.put(sp, '#a00a14')
        L.shape(L.ellm(cx, cy, 3, 3), '#ff2630', out=OL)
    for t in [150, 630]:  # a filter tank with a lit gauge
        m = L.rectm(t, 70, 70, hz - 70) | L.ellm(t + 35, 70, 35, 12)
        L.bricks(m, ['#3a4a40', '#34443a', '#40524a'], '#26342c', 70, 14, light='#56685c')
        L.shape(m, None, out=OL, light='#6a7e70')
        g = L.ellm(t + 35, 100, 9, 9)
        L.shape(g, '#f1e7d0', out=OL)
        L.put(L.linem([(t + 35, 100), (t + 40, 94)], 1), '#c4121c')
        for b in range(5):
            L.put(L.ellm(t + 15 + b * 10, 130 + (b % 2) * 6, 2, 2), '#f1e0b0')
    # the walkway ledge at the horizon and the brick wall under it, with drain grilles
    lip = L.rectm(0, hz, W, 6)
    L.shape(lip, '#5a6e5a', out=OL, light='#8a9e88', shade='#2e3e32')
    base_fill(L, hz + 6, lambda m: L.bricks(m, ['#34463a', '#2e4034', '#3a4c40', '#30423a'], '#1e2c24', 24, 8, y0=hz + 6, light='#44584a'))
    for x in range(60, W, 180):
        gm = L.rectm(x, hz + 20, 40, 24)
        L.shape(gm, '#141e18', out=OL, light=None)
        for k in range(x + 4, x + 40, 6):
            L.put(L.rectm(k, hz + 20, 2, 24), '#4a5e4a')
        L.put(L.rectm(x + 6, hz + 44, 28, 2), '#c8b080')
    # moss hanging off the ledge
    for x in range(0, W, 5):
        if L.r() < 0.5:
            L.put(L.rectm(x, hz + 6, 2, 2 + int(L.r() * 7)), '#4a6e3a')


def sewer_near(L, hz):
    # close brick piers with moss and a cream drip, chains between them, a rusty railing on the horizon
    for x in range(20, W, 320):
        m = L.rectm(x, 0, 46, L.h)
        L.bricks(m, ['#3c5040', '#344838', '#425646'], '#1e2c24', 16, 8, x0=x, light='#56705a')
        L.shape(m, None, out=OL)
        L.put(L.rectm(x, 0, 2, L.h), '#6a8a6a')
        cap = L.rectm(x - 6, 30, 58, 8)
        L.shape(cap, '#4a6050', out=OL, light='#7a9a7a', shade='#2a3a2e')
        for k in range(0, 46, 4):
            L.put(L.rectm(x + k, 38, 2, 3 + int(L.r() * 9)), '#4a7a3a')
        L.put(L.rectm(x + 30, 38, 3, 40), '#d8c890'); L.put(L.ellm(x + 31, 80, 2, 3), '#f1e0b0')
        # a chain hanging in a curve to the next pier
        pts = [(x + 46 + t * 274, 40 + 50 * 4 * t * (1 - t)) for t in np.linspace(0, 1, 60)]
        for i, (px, py) in enumerate(pts):
            if i % 2 == 0:
                L.shape(L.ellm(px, py, 2, 2), '#6a6a60' if i % 4 else '#8a8a7a', out=OL)
    rail = L.rectm(0, hz - 30, W, 4)
    L.shape(rail, '#6a5a40', out=OL, light='#9a8a60', shade='#3a2e20')
    for x in range(0, W, 20):
        L.shape(L.rectm(x, hz - 30, 3, 30), '#5a4a34', out=OL, light='#8a7a54')
    lip = L.rectm(0, hz, W, 5)
    L.shape(lip, '#46584a', out=OL, light='#6a8a6a')
    base_fill(L, hz + 5, lambda m: L.bricks(m, ['#2e4034', '#2a3a30', '#34463a'], '#18241c', 32, 16, y0=hz + 5, light='#3e5244'))


# =====================================================================================================  EJACULAND
def park_far(L, hz):
    # the far park against the red moon: a big coaster track with lit cars, the ferris wheel, the star clock tower, hills
    hill = L.polym([(x, hz - 18 - 10 * math.sin(x / 90) - 6 * math.sin(x / 37)) for x in range(0, W + 8, 8)] + [(W, L.h), (0, L.h)])
    L.bands(hill, ['#2a0c18', '#240a14', '#1e0810'], hz - 30, hz + 40)
    # coaster: a long track on trestles
    track = [(x, 70 + 34 * math.sin(x / 120) + 14 * math.sin(x / 41)) for x in range(-8, W + 16, 4)]
    for x in range(0, W, 12):
        y = 70 + 34 * math.sin(x / 120) + 14 * math.sin(x / 41)
        L.put(L.rectm(x, y, 2, hz - y), '#3a1424')
        if x % 36 == 0:
            L.put(L.linem([(x, y + 6), (x + 12, hz - 20)], 1), '#341020')
    L.shape(L.linem(track, 4), '#5a1a2e', out='#1a0610', light='#8a2a40')
    for x in range(0, W, 10):
        y = 70 + 34 * math.sin(x / 120) + 14 * math.sin(x / 41)
        L.px(x, y - 3, '#ffe36a' if (x // 10) % 2 else '#ff2630')
    # a train of cars on it
    for k in range(4):
        x = 300 + k * 13; y = 70 + 34 * math.sin(x / 120) + 14 * math.sin(x / 41)
        L.shape(L.rectm(x, y - 10, 11, 7), '#c4121c', out='#1a0610', light='#ff5a5a')
    # the ferris wheel
    cx, cy, R = 720, 86, 62
    ring = L.ellm(cx, cy, R, R) & ~L.ellm(cx, cy, R - 4, R - 4)
    L.shape(ring, '#5a1a2e', out='#1a0610', light='#8a2a40')
    for i in range(16):
        a = i / 16 * 2 * math.pi
        L.put(L.linem([(cx, cy), (cx + math.cos(a) * R, cy + math.sin(a) * R)], 1), '#4a1626')
        gx, gy = cx + math.cos(a) * R, cy + math.sin(a) * R
        L.shape(L.rectm(gx - 4, gy, 8, 7), '#c4121c' if i % 2 else '#ffb020', out='#1a0610')
        L.px(gx, gy - 2, '#ffe36a')
    L.put(L.polym([(cx - 4, cy), (cx - 40, hz - 6), (cx - 32, hz - 6)]), '#4a1626')
    L.put(L.polym([(cx + 4, cy), (cx + 40, hz - 6), (cx + 32, hz - 6)]), '#4a1626')
    L.shape(L.ellm(cx, cy, 6, 6), '#ffe36a', out='#1a0610')
    # star clock tower
    tx = 120
    t = L.rectm(tx, 40, 30, hz - 40)
    L.bricks(t, ['#3a1424', '#341020', '#40182a'], '#240a14', 10, 6, light='#5a1a2e')
    L.shape(t, None, out='#1a0610')
    L.shape(L.polym([(tx - 4, 40), (tx + 15, 8), (tx + 34, 40)]), '#5a1a2e', out='#1a0610', light='#8a2a40')
    L.shape(L.ellm(tx + 15, 56, 10, 10), '#f1e7d0', out='#1a0610')
    L.put(L.linem([(tx + 15, 56), (tx + 15, 49)], 1), '#12040a'); L.put(L.linem([(tx + 15, 56), (tx + 20, 58)], 1), '#12040a')
    star = [(tx + 15 + math.cos(-math.pi / 2 + k * math.pi / 5) * (7 if k % 2 == 0 else 3), 2 + math.sin(-math.pi / 2 + k * math.pi / 5) * (7 if k % 2 == 0 else 3)) for k in range(10)]
    L.shape(L.polym(star), '#ffe36a', out='#1a0610')
    # tent tops peeping over the hill
    for x in [260, 460, 560, 880]:
        h = 30 + int(L.r() * 16)
        for s in range(6):
            p = [(x + 30, hz - 20 - h), (x + s * 10, hz - 10), (x + s * 10 + 10, hz - 10)]
            L.put(L.polym(p), '#7a1a2a' if s % 2 else '#2a0c18')
        L.px(x + 30, hz - 22 - h, '#ffe36a')
    base_fill(L, hz + 40, lambda m: L.put(m, '#1e0810'))


def park_mid(L, hz):
    # the midway: striped tents, the carousel, bunting and string lights, popcorn and game stalls
    for x in range(0, W, 240):
        w = 140; top = hz - 110
        for s in range(10):
            p = [(x + w / 2, top), (x + s * w / 10, top + 50), (x + (s + 1) * w / 10, top + 50)]
            L.put(L.polym(p), '#c4121c' if s % 2 else '#1e0a10')
        L.shape(L.polym([(x + w / 2, top), (x, top + 50), (x + w, top + 50)]), None, out=OL)
        body = L.rectm(x + 6, top + 50, w - 12, hz - top - 50)
        L.bands(body, ['#2a0c14', '#240a10'], top + 50, hz)
        for s in range(0, w - 12, 14):
            L.put(L.rectm(x + 6 + s, top + 50, 7, hz - top - 50), '#3a0e18')
        L.shape(body, None, out=OL)
        door = L.polym([(x + w / 2 - 14, hz), (x + w / 2 - 14, top + 80), (x + w / 2, top + 66), (x + w / 2 + 14, top + 80), (x + w / 2 + 14, hz)])
        L.put(door, '#ffb84a'); L.put(L.polym([(x + w / 2 - 10, hz), (x + w / 2 - 10, top + 82), (x + w / 2, top + 72), (x + w / 2 + 10, top + 82), (x + w / 2 + 10, hz)]), '#ffe0a0')
        for k in range(11):  # scalloped valance
            L.shape(L.ellm(x + k * w / 10, top + 52, 6, 4), '#ffe36a' if k % 2 else '#c4121c', out=OL)
        L.shape(L.rectm(x + w / 2 - 1, top - 16, 2, 16), '#8a8a8a', out=None)
        L.shape(L.polym([(x + w / 2, top - 16), (x + w / 2 + 14, top - 12), (x + w / 2, top - 8)]), '#ff2630', out=OL)
        # the carousel between tents
        cx = x + 190
        L.shape(L.polym([(cx - 34, hz - 70), (cx, hz - 96), (cx + 34, hz - 70)]), '#c4121c', out=OL, light='#ff5a5a')
        L.shape(L.rectm(cx - 34, hz - 70, 68, 6), '#ffe36a', out=OL)
        for k in range(5):
            L.put(L.rectm(cx - 28 + k * 14, hz - 64, 2, 50), '#d8c090')
            L.shape(L.ellm(cx - 27 + k * 14, hz - 40 + (k % 2) * 8, 6, 4), '#f1e7d0', out=OL)
        L.shape(L.rectm(cx - 38, hz - 14, 76, 14), '#3a0e18', out=OL, light='#7a1a2a')
        for k in range(cx - 34, cx + 34, 8):
            L.px(k, hz - 8, '#ffe36a')
    # bunting and bulbs strung right across
    for x in range(0, W, 120):
        pts = [(x + t * 120, 40 + 26 * 4 * t * (1 - t)) for t in np.linspace(0, 1, 30)]
        L.put(L.linem(pts, 1), '#2a0c14')
        for i, (px, py) in enumerate(pts[1:-1:3]):
            L.shape(L.polym([(px - 3, py), (px + 3, py), (px, py + 7)]), ['#c4121c', '#ffe36a', '#f1e7d0'][i % 3], out=None)
    lip = L.rectm(0, hz, W, 5)
    L.shape(lip, '#7a1a2a', out=OL, light='#c43a4a')
    def checker(m):
        c = ((L.xs // 16 + (L.ys - hz) // 16) % 2 == 0)
        L.put(m & c, '#3a0e18'); L.put(m & ~c, '#24080e')
    base_fill(L, hz + 5, checker)


def park_near(L, hz):
    # the iron park fence with spear tips, lamp posts hung with bulbs, the fence's stone base
    for x in range(0, W, 14):
        L.shape(L.rectm(x, hz - 60, 3, 60), '#4a2a34', out=OL, light='#7a4a58')
        L.shape(L.polym([(x - 2, hz - 60), (x + 1, hz - 70), (x + 5, hz - 60)]), '#ffb020', out=OL)
    for y in [hz - 52, hz - 14]:
        L.shape(L.rectm(0, y, W, 3), '#4a2a34', out=OL, light='#7a4a58')
    for x in range(60, W, 240):
        p = L.rectm(x, 0, 8, hz)
        L.shape(p, '#3a1a24', out=OL, light='#6a3a48')
        L.shape(L.rectm(x - 6, 10, 20, 6), '#4a2a34', out=OL, light='#7a4a58')
        for side in (-1, 1):
            L.shape(L.ellm(x + 4 + side * 14, 22, 6, 7), '#ffe36a', out=OL, light='#fffbe8')
            L.put(L.rectm(x + 4 + side * 14 - 1, 13, 2, 3), '#3a1a24')
        for k in range(8):
            L.shape(L.ellm(x + 4 + (k - 4) * 26, 40 + abs(k - 4) * 3, 2, 2), '#ff2630' if k % 2 else '#ffe36a', out=None)
    def wall(m):
        L.stones(m, ['#3a1a24', '#341620', '#40202a', '#2e121c'], '#1e0a12', 16, light='#5a2a38')
    lip = L.rectm(0, hz, W, 6)
    L.shape(lip, '#5a2a38', out=OL, light='#8a4a58')
    base_fill(L, hz + 6, wall)


# =====================================================================================================  THE BONE PIT
def bone_far(L, hz):
    # a cavern wall of skulls and rock, a giant buried skeleton's skull and ribs, stalactites from the dark above
    rock = L.polym([(x, 10 + 14 * math.sin(x / 60) + 8 * math.sin(x / 17)) for x in range(0, W + 8, 8)] + [(W, L.h), (0, L.h)])
    L.stones(rock, ['#3a3226', '#342c22', '#40382a', '#2e2820'], '#221c16', 18, light='#4a4032')
    for x in range(0, W, 26):  # stalactites
        l = 12 + int(L.r() * 34)
        L.shape(L.polym([(x, 10), (x + 10, 10), (x + 5, 10 + l)]), '#4a4032', out='#1a1610', light='#5a503e')
    # skulls set into the wall
    for y in range(50, hz, 22):
        for x in range((y // 22 % 2) * 30, W, 60):
            if L.r() < 0.55:
                sk = L.ellm(x, y, 7, 6)
                L.shape(sk, '#8a7a64', out='#1a1610', light='#b8a888')
                L.put(L.ellm(x - 3, y, 2, 2), '#1a1610'); L.put(L.ellm(x + 3, y, 2, 2), '#1a1610')
                L.put(L.rectm(x - 2, y + 4, 4, 2), '#5a4e3e')
    # the big skull and its ribs
    cx = 560
    sk = L.ellm(cx, 70, 46, 40) | L.rectm(cx - 30, 80, 60, 34)
    L.shape(sk, '#b8a888', out='#1a1610', light='#e8dcc0', shade='#7a6a54')
    L.shape(L.ellm(cx - 18, 74, 11, 12), '#120c08', out=None); L.shape(L.ellm(cx + 18, 74, 11, 12), '#120c08', out=None)
    L.px(cx - 18, 76, '#ff2630'); L.px(cx + 18, 76, '#ff2630')
    L.put(L.polym([(cx - 4, 92), (cx + 4, 92), (cx, 100)]), '#120c08')
    for k in range(6):
        L.shape(L.rectm(cx - 26 + k * 9, 104, 6, 10), '#e8dcc0', out='#1a1610')
    for k in range(5):
        x = 140 + k * 46
        rib = L.linem([(x, hz), (x + 10, hz - 70), (x + 40, hz - 96)], 7)
        L.shape(rib, '#a89878', out='#1a1610', light='#d8ccb0')
    L.shape(L.linem([(120, hz - 30), (360, hz - 100)], 9), '#a89878', out='#1a1610', light='#d8ccb0')
    base_fill(L, hz, lambda m: L.stones(m, ['#2e2820', '#2a241c', '#342c22'], '#1a1610', 16, light='#3a3226'))


def bone_mid(L, hz):
    # piles of bones and skulls, crooked grave crosses, candles burning on rock shelves, a bone archway
    for x in range(0, W, 200):
        pile = L.polym([(x, hz), (x + 30, hz - 40), (x + 70, hz - 56), (x + 110, hz - 36), (x + 150, hz)])
        L.stones(pile, ['#6a5e4a', '#5a4e3e', '#7a6e58'], '#3a3226', 8, light='#9a8e74')
        L.shape(pile, None, out='#1a1610')
        for k in range(7):
            sx, sy = x + 20 + k * 17, hz - 10 - int(L.r() * 30)
            if sy > hz - 50 + abs(k - 3) * 6:
                L.shape(L.ellm(sx, sy, 6, 5), '#c8b898', out='#1a1610', light='#f1e7d0')
                L.put(L.ellm(sx - 2, sy, 1, 1), '#1a1610'); L.put(L.ellm(sx + 2, sy, 1, 1), '#1a1610')
        for k in range(3):
            bx = x + 30 + k * 40
            L.shape(L.linem([(bx, hz - 30 - k * 6), (bx + 26, hz - 46 + k * 4)], 3), '#e8dcc0', out='#1a1610')
        # a grave cross
        gx = x + 170
        L.shape(L.rectm(gx, hz - 50, 6, 50), '#5a4e3e', out='#1a1610', light='#8a7e64')
        L.shape(L.rectm(gx - 10, hz - 40, 26, 6), '#5a4e3e', out='#1a1610', light='#8a7e64')
    for x in range(100, W, 320):  # a bone arch with candles
        L.shape(L.linem([(x, hz), (x + 10, hz - 90), (x + 60, hz - 120), (x + 110, hz - 90), (x + 120, hz)], 10), '#c8b898', out='#1a1610', light='#f1e7d0', shade='#8a7a64')
        for k in range(8):
            t = k / 7
            L.put(L.rectm(x + 6 + t * 108, hz - 60 - math.sin(t * math.pi) * 56, 8, 2), '#8a7a64')
        for k in [x + 40, x + 80]:
            L.shape(L.rectm(k, hz - 16, 5, 16), '#f1e7d0', out='#1a1610')
            L.put(L.ellm(k + 2, hz - 20, 2, 3), '#ffb040'); L.px(k + 2, hz - 21, '#fff6d0')
    lip = L.rectm(0, hz, W, 5)
    L.shape(lip, '#5a4e3e', out='#1a1610', light='#8a7e64')
    base_fill(L, hz + 5, lambda m: L.stones(m, ['#3a3226', '#342c22', '#40382a'], '#221c16', 14, light='#4e4434'))
    for y in range(hz + 20, L.h - 40, 30):
        for x in range((y // 30 % 2) * 40, W, 80):
            L.shape(L.ellm(x, y, 5, 4), '#6a5e4a', out='#221c16', light='#8a7e64')


def bone_near(L, hz):
    # big stalactites and bone columns close up, a rope bridge's posts
    for x in range(40, W, 260):
        col = L.polym([(x, 0), (x + 40, 0), (x + 34, 60), (x + 38, hz), (x + 2, hz), (x + 6, 60)])
        L.stones(col, ['#4a4032', '#40382a', '#544a3a'], '#2a241c', 12, light='#6a5e4a')
        L.shape(col, None, out='#1a1610')
        L.put(L.polym([(x, 0), (x + 4, 0), (x + 6, 60), (x + 2, hz), (x, hz)]), '#7a6e58')
        for k in range(4):
            L.shape(L.ellm(x + 20, 80 + k * 30, 7, 6), '#c8b898', out='#1a1610', light='#f1e7d0')
            L.put(L.ellm(x + 17, 80 + k * 30, 1, 1), '#1a1610'); L.put(L.ellm(x + 23, 80 + k * 30, 1, 1), '#1a1610')
    for x in range(170, W, 260):
        l = 50 + int(L.r() * 30)
        L.shape(L.polym([(x, 0), (x + 24, 0), (x + 12, l)]), '#544a3a', out='#1a1610', light='#7a6e58')
    lip = L.rectm(0, hz, W, 5)
    L.shape(lip, '#5a4e3e', out='#1a1610', light='#8a7e64')
    base_fill(L, hz + 5, lambda m: L.stones(m, ['#342c22', '#2e2820', '#3a3226'], '#1a1610', 16, light='#463c2e'))


# =====================================================================================================  BLOOD FACTORY
def factory_far(L, hz):
    # smokestacks against a burning sky, glowing furnace mouths, gantry cranes, smoke drifting in hard bands
    for k in range(3):
        y = 20 + k * 22
        m = L.polym([(x, y + 6 * math.sin(x / 50 + k)) for x in range(0, W + 8, 8)] + [(W, y + 14), (0, y + 14)])
        L.put(m, ['#4a1a0e', '#3e160c', '#34120a'][k])
    for x in range(20, W, 90):
        h = 70 + int(L.r() * 50); w = 14 + int(L.r() * 8)
        s = L.rectm(x, hz - h, w, h)
        L.bricks(s, ['#4a2418', '#422014', '#52281a'], '#2a140c', 8, 6, x0=x, light='#6a3420')
        L.shape(s, None, out='#1a0806')
        L.shape(L.rectm(x - 2, hz - h, w + 4, 4), '#6a3420', out='#1a0806')
        for b in range(hz - h + 14, hz - 10, 18):
            L.put(L.rectm(x, b, w, 2), '#2a140c')
        L.put(L.rectm(x + 2, hz - h - 4, w - 4, 2), '#ff6a20')
    for x in range(60, W, 180):  # factory halls with lit windows
        hall = L.polym([(x, hz), (x, hz - 40), (x + 30, hz - 56), (x + 60, hz - 40), (x + 90, hz - 56), (x + 120, hz - 40), (x + 120, hz)])
        L.shape(hall, '#3a1a10', out='#1a0806', light='#5a2a18')
        for wx in range(x + 8, x + 116, 12):
            L.put(L.rectm(wx, hz - 32, 6, 10), '#ff8a30' if L.r() < 0.7 else '#5a2a18')
            L.put(L.rectm(wx, hz - 32, 6, 2), '#ffd060')
    L.put(L.rectm(0, hz - 6, W, 6), '#ff4a10')
    base_fill(L, hz, lambda m: L.bricks(m, ['#3a1a10', '#34160c', '#40200e'], '#200a06', 20, 10, y0=hz, light='#4a2414'))


def factory_mid(L, hz):
    # blood vats with sight glasses, a web of pipes, a big cog wheel, a gantry walkway with a hook on a chain
    for x in range(0, W, 160):
        vat = L.rectm(x + 10, hz - 110, 80, 110) | L.ellm(x + 50, hz - 110, 40, 12)
        L.bands(vat, ['#7a5040', '#6a4436', '#5a382c', '#4a2e24'], hz - 120, hz)
        L.shape(vat, None, out='#1a0806', light='#a07060')
        for ry in range(hz - 100, hz, 20):
            L.put(L.rectm(x + 10, ry, 80, 2), '#3a2018')
            for rx in range(x + 14, x + 90, 10):
                L.px(rx, ry + 1, '#c09080')
        gl = L.rectm(x + 40, hz - 96, 20, 80)
        L.shape(gl, '#2a0606', out='#1a0806')
        lv = L.rectm(x + 41, hz - 60 + int(L.r() * 20), 18, 60)
        L.put(lv & gl, '#c4121c'); L.put(L.rectm(x + 41, hz - 95, 3, 78) & gl, '#ff6a6a')
    for k, y in enumerate([40, 60, 160]):
        m = L.rectm(0, y, W, 10)
        L.bands(m, ['#8a6a5a', '#6a4a40', '#4a3028'], y, y + 10)
        L.shape(m, None, out='#1a0806')
        for x in range(k * 40, W, 100):
            L.shape(L.rectm(x, y - 2, 6, 14), '#a08070', out='#1a0806', light='#c0a090')
    cx, cy = 560, 100
    cog = L.polym([(cx + math.cos(a) * (44 if (i % 2) else 36), cy + math.sin(a) * (44 if (i % 2) else 36)) for i, a in enumerate(np.linspace(0, 2 * math.pi, 41)[:-1])])
    L.shape(cog, '#6a4a40', out='#1a0806', light='#9a7a68', shade='#3a2420')
    L.shape(L.ellm(cx, cy, 14, 14), '#3a2420', out='#1a0806')
    for a in range(6):
        L.put(L.linem([(cx, cy), (cx + math.cos(a * 1.047) * 30, cy + math.sin(a * 1.047) * 30)], 4), '#4a3028')
    L.shape(L.ellm(cx, cy, 5, 5), '#ffb040', out='#1a0806')
    walk = L.rectm(0, 18, W, 6)
    L.shape(walk, '#5a3a30', out='#1a0806', light='#8a6a58')
    for x in range(0, W, 12):
        L.put(L.linem([(x, 24), (x + 6, 32), (x + 12, 24)], 1), '#4a3028')
    for x in range(120, W, 300):
        for y in range(24, 90, 6):
            L.shape(L.ellm(x, y, 2, 3), '#7a6a60', out='#1a0806')
        L.shape(L.linem([(x, 90), (x, 100), (x + 8, 104), (x + 10, 96)], 3), '#a09088', out='#1a0806')
    lip = L.rectm(0, hz, W, 6)
    L.shape(lip, '#6a4a40', out='#1a0806', light='#a08070')
    def plates(m):
        L.bricks(m, ['#4a3028', '#422a22', '#523630'], '#2a1812', 48, 24, y0=hz + 6, light='#6a4a40')
        rv = m & (((L.ys - hz - 6) % 24 == 4) | ((L.ys - hz - 6) % 24 == 20)) & ((L.xs % 8) == 3)
        L.put(rv, '#a08070')
    base_fill(L, hz + 6, plates)


def factory_near(L, hz):
    # steel girders with rivets and cross bracing, chains with hooks, a hazard-striped rail
    for x in range(0, W, 300):
        g = L.rectm(x, 0, 24, L.h)
        L.shape(g, '#5a3a30', out='#1a0806', light='#8a6250', shade='#3a2418')
        for y in range(4, L.h, 10):
            L.px(x + 4, y, '#b08a70'); L.px(x + 19, y, '#b08a70')
        for y in range(0, hz, 50):
            L.shape(L.linem([(x + 24, y), (x + 120, y + 50)], 4), '#4a3028', out='#1a0806', light='#7a5440')
            L.shape(L.linem([(x + 120, y), (x + 24, y + 50)], 4), '#4a3028', out='#1a0806', light='#7a5440')
        L.shape(L.rectm(x + 120, 0, 10, hz), '#4a3028', out='#1a0806', light='#7a5440')
    for x in range(200, W, 300):
        for y in range(0, 70, 6):
            L.shape(L.ellm(x, y, 2, 3), '#8a8078', out='#1a0806')
        L.shape(L.linem([(x, 70), (x, 80), (x + 8, 84), (x + 10, 76)], 3), '#c0b0a0', out='#1a0806')
    rail = L.rectm(0, hz - 26, W, 6)
    st = ((L.xs + L.ys) // 6) % 2 == 0
    L.put(rail & st, '#ffb020'); L.put(rail & ~st, '#1e0e08'); L.shape(rail, None, out='#1a0806')
    for x in range(0, W, 40):
        L.shape(L.rectm(x, hz - 20, 4, 20), '#5a3a30', out='#1a0806', light='#8a6250')
    lip = L.rectm(0, hz, W, 6)
    L.shape(lip, '#5a3a30', out='#1a0806', light='#8a6250')
    base_fill(L, hz + 6, lambda m: L.bricks(m, ['#3e2620', '#38221c', '#442c24'], '#22120c', 64, 32, y0=hz + 6, light='#5a3a30'))


# =====================================================================================================  SPUNK BRAIN
def brain_far(L, hz):
    # Blumhead's tower on a hill of brain folds, sparking neurons, the moon-pale purple haze in bands
    fold = L.polym([(x, hz - 30 - 14 * math.sin(x / 70) - 8 * math.sin(x / 23)) for x in range(0, W + 8, 8)] + [(W, L.h), (0, L.h)])
    L.bands(fold, ['#4a2a4a', '#40243e', '#361e34', '#2e1a2c'], hz - 50, hz + 40)
    for k in range(40):  # brain folds: curling lines on the hill
        x = L.r() * W; y = hz - 10 + L.r() * 40
        pts = [(x + t * 30, y + 5 * math.sin(t * 7)) for t in np.linspace(0, 1, 12)]
        L.put(L.linem(pts, 1), '#5a3a5a')
    tx = 420
    tw = L.polym([(tx, hz - 20), (tx + 10, 30), (tx + 30, 30), (tx + 40, hz - 20)])
    L.shape(tw, '#3a2a48', out='#120a18', light='#5a4a70')
    L.shape(L.ellm(tx + 20, 26, 22, 16), '#4a3a5a', out='#120a18', light='#7a6a90')
    L.shape(L.ellm(tx + 20, 24, 8, 6), '#ff2630', out='#120a18', light='#ff8a8a')
    for k in range(6):
        L.put(L.rectm(tx + 14, 50 + k * 14, 12, 4), '#c08aff' if k % 2 else '#7a5aa0')
    for x in range(20, W, 70):  # towers and antennae
        if abs(x - tx) < 70:
            continue
        h = 30 + int(L.r() * 50)
        L.shape(L.rectm(x, hz - 30 - h, 16, h + 10), '#34284a', out='#120a18', light='#4a3a64')
        L.put(L.rectm(x + 7, hz - 46 - h, 2, 16), '#4a3a64'); L.px(x + 8, hz - 47 - h, '#ff2630')
        for wy in range(hz - 24 - h, hz - 24, 8):
            if L.r() < 0.5:
                L.put(L.rectm(x + 4, wy, 3, 3), '#c08aff')
    for k in range(50):
        x, y = L.r() * W, 10 + L.r() * (hz - 70)
        L.px(x, y, '#e0c0ff'); L.px(x + 1, y, '#8a6ab0')
    base_fill(L, hz + 40, lambda m: L.put(m, '#2e1a2c'))


def brain_mid(L, hz):
    # brain jars on machines, thick cables, computer banks with screens
    for x in range(0, W, 190):
        base = L.rectm(x + 10, hz - 50, 70, 50)
        L.shape(base, '#4a4456', out='#120a18', light='#7a748a', shade='#2a2436')
        for k in range(3):
            L.put(L.rectm(x + 18 + k * 18, hz - 40, 10, 6), ['#ff2630', '#ffe36a', '#3aff8a'][k])
        jar = L.rectm(x + 18, hz - 120, 54, 70) | L.ellm(x + 45, hz - 120, 27, 8)
        L.dither(jar, '#2a1a3a', '#3a2a50', ((L.ys % 6) < 2).astype(float))
        L.shape(jar, None, out='#120a18', light='#8a7aaa')
        br = L.ellm(x + 45, hz - 84, 20, 16)
        L.shape(br, '#e88aa8', out='#5a2a3a', light='#ffc0d0', shade='#a04a68')
        for k in range(6):
            L.put(L.linem([(x + 30 + k * 6, hz - 96), (x + 33 + k * 6, hz - 76)], 1), '#a04a68')
        for b in range(4):
            L.put(L.ellm(x + 26 + b * 13, hz - 60 - (b * 11) % 30, 2, 2), '#c0e0ff')
        L.shape(L.rectm(x + 14, hz - 130, 62, 6), '#6a6478', out='#120a18', light='#9a94aa')
        # a computer bank
        cb = L.rectm(x + 100, hz - 90, 70, 90)
        L.shape(cb, '#3a3446', out='#120a18', light='#5a546a', shade='#221e2c')
        scr = L.rectm(x + 108, hz - 82, 54, 30)
        L.shape(scr, '#0e2a1a', out='#120a18')
        for ly in range(hz - 78, hz - 54, 4):
            L.put(L.rectm(x + 112, ly, int(10 + L.r() * 38), 1), '#3aff8a')
        for ky in range(hz - 44, hz - 6, 8):
            for kx in range(x + 108, x + 162, 8):
                L.put(L.rectm(kx, ky, 5, 4), '#5a546a' if L.r() < 0.8 else '#ff2630')
    for k in range(4):  # cables drooping across
        y = 20 + k * 14; xo = k * 80
        pts = [(xo + t * W, y + 30 * math.sin(t * math.pi * 4) ** 2) for t in np.linspace(0, 1, 200)]
        L.shape(L.linem(pts, 3), ['#3a2a48', '#5a1a2a', '#2a3a48', '#4a3a20'][k], out='#120a18')
    lip = L.rectm(0, hz, W, 6)
    st = ((L.xs + L.ys) // 6) % 2 == 0
    L.put(lip & st, '#ff2630'); L.put(lip & ~st, '#2a0408'); L.shape(lip, None, out='#120a18')
    base_fill(L, hz + 6, lambda m: L.bricks(m, ['#3a3446', '#34303e', '#403a4c'], '#221e2c', 48, 16, y0=hz + 6, light='#5a546a'))


def brain_near(L, hz):
    # glass tubes with cream pumping up them, thick conduits, warning lights
    for x in range(30, W, 240):
        t = L.rectm(x, 0, 22, hz)
        L.shape(t, '#2a3a4a', out='#120a18', light='#8aa0c0')
        L.put(L.rectm(x + 6, 0, 10, hz), '#d8c890')
        for y in range(0, hz, 16):
            L.put(L.ellm(x + 11, y + (x % 16), 3, 3), '#fffbe8')
        L.put(L.rectm(x + 3, 0, 2, hz), '#c0d0e0')
        for y in [20, hz - 20]:
            L.shape(L.rectm(x - 4, y, 30, 8), '#5a5468', out='#120a18', light='#8a84a0')
        L.shape(L.ellm(x + 11, 10, 5, 5), '#ff2630', out='#120a18', light='#ff9a9a')
    for x in range(150, W, 240):
        c = L.rectm(x, 0, 14, hz)
        L.shape(c, '#4a2a3a', out='#120a18', light='#7a4a60')
        for y in range(0, hz, 12):
            L.put(L.rectm(x, y, 14, 2), '#2a1622')
    lip = L.rectm(0, hz, W, 6)
    L.shape(lip, '#5a5468', out='#120a18', light='#8a84a0')
    base_fill(L, hz + 6, lambda m: L.bricks(m, ['#2e2a38', '#2a2632', '#34303e'], '#18141e', 64, 32, y0=hz + 6, light='#44404e'))


# =====================================================================================================  CLUBHOUSE ROW (near only:
# the far towers and the districts are its own; it stays black and red gothic)
def city_near(L, hz):
    # a gothic iron railing with fleur tips on a red brick wall, gas lamps with dotted light
    for x in range(0, W, 12):
        L.shape(L.rectm(x, hz - 50, 3, 50), '#3a1a1e', out=OL, light='#6a2a30')
        L.shape(L.polym([(x - 2, hz - 50), (x + 1, hz - 58), (x + 5, hz - 50)]), '#6a2a30', out=OL, light='#a04a50')
    for y in [hz - 44, hz - 10]:
        L.shape(L.rectm(0, y, W, 3), '#3a1a1e', out=OL, light='#6a2a30')
    for x in range(0, W, 48):
        L.shape(L.ellm(x + 6, hz - 27, 5, 5) & ~L.ellm(x + 6, hz - 27, 3, 3), '#4a2026', out=OL)
    for x in range(90, W, 320):
        L.shape(L.rectm(x, 10, 6, hz - 10), '#2e1216', out=OL, light='#5a2228')
        L.shape(L.polym([(x - 8, 14), (x + 14, 14), (x + 10, 30), (x - 4, 30)]), '#ffb84a', out=OL, light='#fff0c0')
        L.shape(L.polym([(x - 10, 14), (x + 3, 4), (x + 16, 14)]), '#2e1216', out=OL, light='#5a2228')
    lip = L.rectm(0, hz, W, 6)
    L.shape(lip, '#5a2228', out=OL, light='#8a3a40')
    base_fill(L, hz + 6, lambda m: L.bricks(m, ['#3a1418', '#341014', '#40181c', '#2e0e12'], '#1e080a', 20, 10, y0=hz + 6, light='#4e1c20'))


FOG = {'far': 0.5, 'mid': 0.32, 'near': 0.18}
HAZE = {'sewer': '#0c1810', 'park': '#14061a', 'bone': '#100c0a', 'factory': '#200804', 'brain': '#0c0610', 'city': '#1c0508'}
ZONEPAINT = {
    'sewer': (sewer_far, sewer_mid, sewer_near), 'park': (park_far, park_mid, park_near), 'bone': (bone_far, bone_mid, bone_near),
    'factory': (factory_far, factory_mid, factory_near), 'brain': (brain_far, brain_mid, brain_near), 'city': (None, None, city_near),
}


def build(z):
    os.makedirs(OUT, exist_ok=True)
    out = []
    for kind, fn in zip(['far', 'mid', 'near'], ZONEPAINT[z]):
        if not fn:
            continue
        h, hz = SIZE[kind]
        L = Layer(h, seed=len(z) * 31 + len(kind))
        fn(L, hz)
        # depth: each layer is pulled towards the zone's haze colour (darker and duller the further back), never to black
        k = FOG[kind]; c = hx(HAZE[z]); L.rgb = (L.rgb * (1 - k) + c * k).astype(np.int16)
        p = os.path.join(OUT, '%s_%s.png' % (z, kind)); L.save(p); out.append(p)
    return out


if __name__ == '__main__':
    zs = sys.argv[1:] or list(ZONEPAINT)
    for z in zs:
        print(z, build(z))
