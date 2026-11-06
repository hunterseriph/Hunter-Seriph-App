"""Every district of every Spermhog zone gets its own painted middle layer (he said the level looked the same all the way
along). A library of pixel-art pieces (walls, arches, falls, pipes, tanks, cages, tents, vats, jars...) drawn in the zone's
palette, and a recipe per district that picks its own pieces, layout and tint. Same size and horizon as a zone's mid layer.
Run: python3 tools/spermhog/backs/districts.py [ids]  -> out/d_<id>.png ; then bake.py."""
import math, os, sys
import numpy as np
from pk import Layer, W, hx, mix, tohex
from zones import SIZE, OUT, FOG, HAZE, base_fill

H, HZ = SIZE['mid']
PAL = {
    'sewer': dict(st=['#34463a', '#2e4034', '#3a4c40'], mo='#1e2c24', lt='#56705a', dk='#121c16', mt=['#5a6e5a', '#4a5e4a', '#3a4e3e', '#2e3e32'], ml='#8a9e88', acc='#d8c890', acc2='#c4121c', glow='#f1e0b0', out='#12040a'),
    'park': dict(st=['#3a1a24', '#341620', '#40202a'], mo='#1e0a12', lt='#6a3a48', dk='#1a0610', mt=['#7a1a2a', '#5a1420', '#3a0e18', '#2a0a12'], ml='#c43a4a', acc='#ffe36a', acc2='#c4121c', glow='#ffb84a', out='#12040a'),
    'bone': dict(st=['#3a3226', '#342c22', '#40382a'], mo='#221c16', lt='#5a503e', dk='#120e0a', mt=['#8a7a64', '#7a6a54', '#5a4e3e', '#4a4032'], ml='#c8b898', acc='#f1e7d0', acc2='#ff2630', glow='#ffb040', out='#1a1610'),
    'factory': dict(st=['#4a2418', '#422014', '#52281a'], mo='#2a140c', lt='#6a3420', dk='#160804', mt=['#8a6a5a', '#6a4a40', '#5a3a30', '#4a3028'], ml='#c0a090', acc='#ffb020', acc2='#c4121c', glow='#ff8a30', out='#1a0806'),
    'brain': dict(st=['#3a3446', '#34303e', '#403a4c'], mo='#221e2c', lt='#5a546a', dk='#100c16', mt=['#5a5468', '#4a4456', '#3a3446', '#2a2436'], ml='#8a84a0', acc='#c08aff', acc2='#ff2630', glow='#3aff8a', out='#120a18'),
}


def tinted(P, tint, k):
    if not tint:
        return P
    T = {}
    for key, v in P.items():
        if key == 'out':
            T[key] = v
        elif isinstance(v, list):
            T[key] = [tohex(mix(c, tint, k)) for c in v]
        else:
            T[key] = tohex(mix(v, tint, k))
    return T


# ------------------------------------------------------------------ pieces. Each takes (L, P, **o)
def wall(L, P, top=20, kind='bricks', bw=20, bh=10, upto=HZ):
    roof = top <= 30  # an indoor wall runs right up past the top of the picture (no band across the top of the screen)
    if roof: top = 0
    m = np.zeros((L.h, W), bool); m[top:upto, :] = True
    if kind == 'bricks': L.bricks(m, P['st'], P['mo'], bw, bh, light=P['lt'])
    elif kind == 'stones': L.stones(m, P['st'], P['mo'], bh + 6, light=P['lt'])
    elif kind == 'plates':
        L.bricks(m, P['st'], P['mo'], bw * 3, bh * 2, light=P['lt']); rv = m & ((L.ys % (bh * 2) == 4) & (L.xs % 8 == 3)); L.put(rv, P['ml'])
    elif kind == 'tiles':
        c = ((L.xs // bw + L.ys // bw) % 2 == 0); L.put(m & c, P['st'][0]); L.put(m & ~c, P['st'][1]); L.put(m & (L.xs % bw == 0), P['mo'])
    if not roof:
        lip = L.rectm(0, top - 4, W, 4); L.shape(lip, P['mt'][1], out=P['out'], light=P['ml'])


def arcade(L, P, n=6, top=40, w=90, deep=True):
    for i in range(n):
        cx = (i + 0.5) * W / n
        m = L.polym([(cx - w / 2, top + w / 2), (cx - w / 2, HZ), (cx + w / 2, HZ), (cx + w / 2, top + w / 2)]) | L.ellm(cx, top + w / 2, w / 2, w / 2)
        L.put(m, P['dk'])
        if deep:
            m2 = L.polym([(cx - w / 4, top + w * 0.7), (cx - w / 4, HZ), (cx + w / 4, HZ), (cx + w / 4, top + w * 0.7)]) | L.ellm(cx, top + w * 0.7, w / 4, w / 4)
            L.bricks(m2, [tohex(mix(c, P['dk'], 0.6)) for c in P['st']], P['dk'], 12, 6)
        for k in range(13):
            a = math.pi + k * math.pi / 12
            L.shape(L.ellm(cx + math.cos(a) * (w / 2 + 3), top + w / 2 + math.sin(a) * (w / 2 + 3), 4, 4), P['lt'], out=P['out'])


def falls(L, P, n=4, y=60, w=10, off=0):
    for i in range(n):
        x = (i + 0.5) * W / n + off
        L.shape(L.ellm(x, y, w, w * 0.8), P['mt'][1], out=P['out'], light=P['ml']); L.put(L.ellm(x, y, w * 0.6, w * 0.5), P['dk'])
        f = L.rectm(x - w / 2, y + 2, w, HZ - y - 2)
        L.dither(f, P['acc'], P['glow'], ((L.xs + L.ys // 3) % 4 == 0).astype(float))
        for k in range(5):
            L.put(L.ellm(x + (k - 2) * 5, HZ - 2, 4, 2), P['glow'])


def pipes(L, P, rows=(60, 100), w=14, flange=110):
    for i, y in enumerate(rows):
        m = L.rectm(0, y, W, w); L.bands(m, P['mt'], y, y + w); L.shape(m, None, out=P['out'])
        for x in range((i * 47) % flange, W, flange):
            L.shape(L.rectm(x, y - 3, 8, w + 6), P['mt'][0], out=P['out'], light=P['ml'], shade=P['mt'][3])
        for x in range(30 + i * 61, W, 190):
            L.put(L.rectm(x, y + w, 2, 6 + (x % 9)), P['acc'])


def valves(L, P, n=3, y=110):
    for i in range(n):
        cx = (i + 0.5) * W / n + 30
        L.shape(L.rectm(cx - 9, y - 40, 18, HZ - y + 40), P['mt'][1], out=P['out'], light=P['ml'])
        ring = L.ellm(cx, y, 15, 15) & ~L.ellm(cx, y, 11, 11); L.shape(ring, P['acc2'], out=P['out'], light='#ff5a5a')
        for a in range(4):
            L.put(L.linem([(cx, y), (cx + math.cos(a * 1.57) * 12, y + math.sin(a * 1.57) * 12)], 2), P['acc2'])


def tanks(L, P, n=3, h=90, w=70):
    for i in range(n):
        x = int((i + 0.5) * W / n - w / 2)
        m = L.rectm(x, HZ - h, w, h) | L.ellm(x + w / 2, HZ - h, w / 2, 12)
        L.bricks(m, P['mt'][1:], P['mt'][3], w, 14, light=P['ml']); L.shape(m, None, out=P['out'], light=P['ml'])
        L.shape(L.ellm(x + w / 2, HZ - h + 30, 9, 9), '#f1e7d0', out=P['out']); L.put(L.linem([(x + w / 2, HZ - h + 30), (x + w / 2 + 5, HZ - h + 24)], 1), P['acc2'])
        gl = L.rectm(x + w - 16, HZ - h + 10, 8, h - 20); L.shape(gl, P['dk'], out=P['out']); L.put(L.rectm(x + w - 15, HZ - h * 0.5, 6, h * 0.5 - 10) & gl, P['acc'])


def columns(L, P, n=5, w=34):
    for i in range(n):
        x = int((i + 0.5) * W / n - w / 2)
        m = L.rectm(x, 0, w, L.h); L.bricks(m, P['st'], P['mo'], w, 10, x0=int(x), light=P['lt']); L.shape(m, None, out=P['out'])
        L.put(L.rectm(x, 0, 2, L.h), P['lt'])
        for y in (34, HZ - 8):
            L.shape(L.rectm(x - 6, y, w + 12, 8), P['mt'][0], out=P['out'], light=P['ml'], shade=P['mt'][3])


def chains(L, P, n=5, l=90, hook=True):
    for i in range(n):
        x = (i + 0.5) * W / n + 17; ln = l + (i * 23) % 40
        for y in range(0, ln, 6):
            L.shape(L.ellm(x, y, 2, 3), P['ml'] if (y // 6) % 2 else P['mt'][1], out=P['out'])
        if hook:
            L.shape(L.linem([(x, ln), (x, ln + 10), (x + 8, ln + 14), (x + 10, ln + 6)], 3), P['ml'], out=P['out'])


def cages(L, P, n=3, l=50):
    for i in range(n):
        x = (i + 0.5) * W / n - 14; ln = l + (i * 31) % 30
        L.put(L.rectm(x + 13, 0, 2, ln), P['mt'][1])
        body = L.rectm(x, ln, 28, 38); L.put(body, P['dk'])
        for bx in range(0, 29, 6): L.put(L.rectm(x + bx, ln, 2, 38), P['ml'])
        L.shape(L.rectm(x - 2, ln - 2, 32, 4), P['mt'][0], out=P['out']); L.shape(L.rectm(x - 2, ln + 37, 32, 4), P['mt'][0], out=P['out'])
        L.shape(L.ellm(x + 14, ln + 24, 5, 4), P['acc'], out=P['out'])  # something sad inside


def grates(L, P, n=4, y=None, w=46, h=40, eyes=False):
    y = HZ - h - 10 if y is None else y
    for i in range(n):
        x = int((i + 0.5) * W / n - w / 2)
        L.shape(L.rectm(x - 4, y - 4, w + 8, h + 8), P['mt'][1], out=P['out'], light=P['ml'])
        L.put(L.rectm(x, y, w, h), P['dk'])
        if eyes:
            for k in range(2):
                ex, ey = x + 10 + k * 22, y + 16 + (k * 7) % 12
                L.put(L.rectm(ex, ey, 3, 2), P['acc2']); L.put(L.rectm(ex + 6, ey, 3, 2), P['acc2'])
        for bx in range(x + 4, x + w, 7): L.put(L.rectm(bx, y, 2, h), P['mt'][0])


def eyes(L, P, n=12):
    for i in range(n):
        x = (i * 83 + 41) % W; y = 50 + (i * 47) % (HZ - 80)
        L.put(L.ellm(x + 4, y + 1, 9, 6), P['dk'])
        L.put(L.rectm(x, y, 3, 2), P['acc2']); L.put(L.rectm(x + 6, y, 3, 2), P['acc2'])


def bones(L, P, n=5):
    for i in range(n):
        x = (i + 0.5) * W / n - 70
        pile = L.polym([(x, HZ), (x + 30, HZ - 36), (x + 70, HZ - 52), (x + 110, HZ - 32), (x + 140, HZ)])
        L.stones(pile, P['mt'][1:], P['mt'][3], 8, light=P['ml']); L.shape(pile, None, out=P['out'])
        for k in range(6):
            sx, sy = x + 20 + k * 18, HZ - 8 - (k * 13) % 28
            L.shape(L.ellm(sx, sy, 6, 5), P['acc'], out=P['out'], light='#ffffff'); L.put(L.ellm(sx - 2, sy, 1, 1), P['out']); L.put(L.ellm(sx + 2, sy, 1, 1), P['out'])


def wheels(L, P, n=2, r=44, y=100):
    for i in range(n):
        cx = (i + 0.5) * W / n
        cog = L.polym([(cx + math.cos(a) * (r if j % 2 else r - 8), y + math.sin(a) * (r if j % 2 else r - 8)) for j, a in enumerate(np.linspace(0, 2 * math.pi, 41)[:-1])])
        L.shape(cog, P['mt'][1], out=P['out'], light=P['ml'], shade=P['mt'][3]); L.shape(L.ellm(cx, y, r * 0.32, r * 0.32), P['mt'][3], out=P['out'])
        for a in range(6): L.put(L.linem([(cx, y), (cx + math.cos(a * 1.047) * r * 0.7, y + math.sin(a * 1.047) * r * 0.7)], 4), P['mt'][2])
        L.shape(L.ellm(cx, y, 5, 5), P['glow'], out=P['out'])


def ladders(L, P, n=3):
    for i in range(n):
        x = (i + 0.5) * W / n + 50
        for s in (0, 18): L.shape(L.rectm(x + s, 30, 3, HZ - 30), P['mt'][0], out=P['out'], light=P['ml'])
        for y in range(36, HZ, 12): L.put(L.rectm(x, y, 21, 2), P['mt'][1])


def banners(L, P, n=6, l=70, emblem='drop'):
    for i in range(n):
        x = (i + 0.5) * W / n - 12
        m = L.polym([(x, 20), (x + 24, 20), (x + 24, 20 + l), (x + 12, 12 + l), (x, 20 + l)])
        L.shape(m, P['acc2'], out=P['out'], light='#ff5a5a', shade='#7a0a10')
        L.shape(L.rectm(x - 4, 16, 32, 4), P['mt'][0], out=P['out'])
        if emblem == 'drop': L.shape(L.ellm(x + 12, 20 + l * 0.45, 6, 7) | L.polym([(x + 7, 20 + l * 0.4), (x + 12, 10 + l * 0.3), (x + 17, 20 + l * 0.4)]), P['glow'], out=P['out'])
        else: L.shape(L.ellm(x + 12, 20 + l * 0.45, 7, 7), P['acc'], out=P['out'])


def lamps(L, P, n=5, l=60):
    for i in range(n):
        x = (i + 0.5) * W / n + 24; ln = l + (i * 17) % 30
        L.put(L.rectm(x, 0, 2, ln), P['mt'][1])
        L.shape(L.polym([(x - 8, ln), (x + 10, ln), (x + 6, ln + 12), (x - 4, ln + 12)]), P['glow'], out=P['out'], light='#fffbe8')
        for k in range(6):  # dotted cone of light
            for j in range(-k, k + 1, 2): L.px(x + 1 + j * 3, ln + 16 + k * 6, P['glow'])


def tents(L, P, n=3, h=110, w=140):
    for i in range(n):
        x = (i + 0.5) * W / n - w / 2; top = HZ - h
        for s in range(10):
            L.put(L.polym([(x + w / 2, top), (x + s * w / 10, top + 50), (x + (s + 1) * w / 10, top + 50)]), P['acc2'] if s % 2 else P['dk'])
        L.shape(L.polym([(x + w / 2, top), (x, top + 50), (x + w, top + 50)]), None, out=P['out'])
        body = L.rectm(x + 6, top + 50, w - 12, h - 50); L.bands(body, P['st'], top + 50, HZ); L.shape(body, None, out=P['out'])
        L.put(L.polym([(x + w / 2 - 14, HZ), (x + w / 2 - 14, top + 80), (x + w / 2, top + 66), (x + w / 2 + 14, top + 80), (x + w / 2 + 14, HZ)]), P['glow'])
        for k in range(11): L.shape(L.ellm(x + k * w / 10, top + 52, 6, 4), P['acc'] if k % 2 else P['acc2'], out=P['out'])


def bunting(L, P, y=40, span=120):
    for x in range(0, W, span):
        pts = [(x + t * span, y + 26 * 4 * t * (1 - t)) for t in np.linspace(0, 1, 30)]
        L.put(L.linem(pts, 1), P['dk'])
        for i, (px, py) in enumerate(pts[1:-1:3]):
            L.put(L.polym([(px - 3, py), (px + 3, py), (px, py + 7)]), [P['acc2'], P['acc'], P['glow']][i % 3])


def ferris(L, P, cx=480, cy=90, r=70):
    ring = L.ellm(cx, cy, r, r) & ~L.ellm(cx, cy, r - 4, r - 4); L.shape(ring, P['mt'][0], out=P['out'], light=P['ml'])
    for i in range(16):
        a = i / 16 * 2 * math.pi; L.put(L.linem([(cx, cy), (cx + math.cos(a) * r, cy + math.sin(a) * r)], 1), P['mt'][2])
        L.shape(L.rectm(cx + math.cos(a) * r - 5, cy + math.sin(a) * r, 10, 8), P['acc2'] if i % 2 else P['acc'], out=P['out'])
    L.put(L.polym([(cx - 4, cy), (cx - 46, HZ), (cx - 36, HZ)]), P['mt'][2]); L.put(L.polym([(cx + 4, cy), (cx + 46, HZ), (cx + 36, HZ)]), P['mt'][2])
    L.shape(L.ellm(cx, cy, 7, 7), P['acc'], out=P['out'])


def coaster(L, P, y=80, amp=40, cars=True):
    f = lambda x: y + amp * math.sin(x / 110) + 12 * math.sin(x / 37)
    for x in range(0, W, 12):
        L.put(L.rectm(x, f(x), 3, HZ - f(x)), P['mt'][2])
        if x % 48 == 0: L.put(L.linem([(x, f(x) + 8), (x + 12, HZ)], 1), P['mt'][3])
    L.shape(L.linem([(x, f(x)) for x in range(-8, W + 16, 4)], 5), P['mt'][0], out=P['out'], light=P['ml'])
    for x in range(0, W, 10): L.px(x, f(x) - 4, P['acc'] if (x // 10) % 2 else P['acc2'])
    if cars:
        for k in range(4):
            x = 300 + k * 15; L.shape(L.rectm(x, f(x) - 12, 13, 8), P['acc2'], out=P['out'], light='#ff5a5a')


def carousel(L, P, n=2):
    for i in range(n):
        cx = (i + 0.5) * W / n
        L.shape(L.polym([(cx - 50, HZ - 90), (cx, HZ - 124), (cx + 50, HZ - 90)]), P['acc2'], out=P['out'], light='#ff5a5a')
        L.shape(L.rectm(cx - 50, HZ - 90, 100, 8), P['acc'], out=P['out'])
        for k in range(7):
            L.put(L.rectm(cx - 42 + k * 14, HZ - 82, 2, 64), '#d8c090'); L.shape(L.ellm(cx - 41 + k * 14, HZ - 48 + (k % 2) * 10, 7, 5), '#f1e7d0', out=P['out'])
        L.shape(L.rectm(cx - 56, HZ - 16, 112, 16), P['st'][0], out=P['out'], light=P['lt'])


def crosses(L, P, n=8):
    for i in range(n):
        x = (i + 0.5) * W / n + (i * 13) % 20; h = 40 + (i * 17) % 30; tilt = ((i % 3) - 1) * 3
        L.shape(L.polym([(x, HZ), (x + 6, HZ), (x + 6 + tilt, HZ - h), (x + tilt, HZ - h)]), P['mt'][2], out=P['out'], light=P['ml'])
        L.shape(L.rectm(x - 10 + tilt, HZ - h + 10, 26, 6), P['mt'][2], out=P['out'], light=P['ml'])
        L.shape(L.ellm(x + 3, HZ, 16, 5), P['st'][0], out=P['out'])


def skullwall(L, P, top=30):
    for y in range(top, HZ, 22):
        for x in range((y // 22 % 2) * 30, W, 60):
            L.shape(L.ellm(x, y, 8, 7), P['acc'], out=P['out'], light='#ffffff')
            L.put(L.ellm(x - 3, y, 2, 2), P['out']); L.put(L.ellm(x + 3, y, 2, 2), P['out']); L.put(L.rectm(x - 2, y + 4, 4, 2), P['mt'][2])


def stalactites(L, P, n=30, top=0):
    for i in range(n):
        x = (i * 37 + 11) % W; l = 20 + (i * 29) % 50
        L.shape(L.polym([(x, top), (x + 14, top), (x + 7, top + l)]), P['st'][2], out=P['out'], light=P['lt'])


def girders(L, P, n=3):
    for i in range(n):
        x = i * W / n + 20
        for gx in (x, x + 110):
            g = L.rectm(gx, 0, 16, HZ); L.shape(g, P['mt'][2], out=P['out'], light=P['ml'], shade=P['mt'][3])
            for y in range(6, HZ, 10): L.px(gx + 4, y, P['ml']); L.px(gx + 11, y, P['ml'])
        for y in range(0, HZ, 50):
            L.shape(L.linem([(x + 16, y), (x + 110, y + 50)], 4), P['mt'][3], out=P['out'], light=P['mt'][1])
            L.shape(L.linem([(x + 110, y), (x + 16, y + 50)], 4), P['mt'][3], out=P['out'], light=P['mt'][1])


def vats(L, P, n=4, h=100, liquid='#c4121c'):
    for i in range(n):
        x = (i + 0.5) * W / n - 40
        vat = L.rectm(x, HZ - h, 80, h) | L.ellm(x + 40, HZ - h, 40, 12)
        L.bands(vat, P['mt'], HZ - h - 10, HZ); L.shape(vat, None, out=P['out'], light=P['ml'])
        for ry in range(HZ - h + 10, HZ, 20):
            L.put(L.rectm(x, ry, 80, 2), P['mt'][3])
        gl = L.rectm(x + 30, HZ - h + 14, 20, h - 30); L.shape(gl, P['dk'], out=P['out'])
        L.put(L.rectm(x + 31, HZ - h * 0.55, 18, h * 0.55 - 16) & gl, liquid); L.put(L.rectm(x + 31, HZ - h + 15, 3, h - 32) & gl, '#ffffff')


def furnaces(L, P, n=3):
    for i in range(n):
        x = (i + 0.5) * W / n - 50
        body = L.polym([(x, HZ), (x + 10, HZ - 110), (x + 90, HZ - 110), (x + 100, HZ)])
        L.bricks(body, P['st'], P['mo'], 14, 7, light=P['lt']); L.shape(body, None, out=P['out'])
        mouth = L.polym([(x + 25, HZ), (x + 25, HZ - 40), (x + 50, HZ - 58), (x + 75, HZ - 40), (x + 75, HZ)])
        L.bands(mouth, ['#fff0a0', '#ffb040', '#ff6a20', '#c4121c'], HZ - 58, HZ); L.shape(mouth, None, out=P['out'])
        L.shape(L.rectm(x + 30, HZ - 140, 40, 30), P['st'][0], out=P['out'], light=P['lt'])
        L.put(L.rectm(x + 36, HZ - 146, 28, 6), P['glow'])


def crates(L, P, n=5):
    for i in range(n):
        x = (i + 0.5) * W / n - 30
        for j, (dx, dy) in enumerate([(0, 0), (30, 0), (14, -28)][:1 + (i % 3)]):
            m = L.rectm(x + dx, HZ - 28 + dy, 28, 28); L.shape(m, P['mt'][1], out=P['out'], light=P['ml'], shade=P['mt'][3])
            L.put(L.linem([(x + dx + 2, HZ - 26 + dy), (x + dx + 26, HZ - 2 + dy)], 2), P['mt'][2])


def rails(L, P, y=None, carts=True):
    y = HZ - 30 if y is None else y
    for x in range(0, W, 20): L.shape(L.rectm(x, y, 4, HZ - y), P['mt'][2], out=P['out'])
    L.shape(L.rectm(0, y - 4, W, 4), P['ml'], out=P['out'])
    if carts:
        for i in range(3):
            x = i * 320 + 80; c = L.polym([(x, y - 30), (x + 50, y - 30), (x + 44, y - 6), (x + 6, y - 6)])
            L.shape(c, P['mt'][1], out=P['out'], light=P['ml'])
            L.shape(L.ellm(x + 12, y - 5, 5, 5), P['mt'][3], out=P['out']); L.shape(L.ellm(x + 38, y - 5, 5, 5), P['mt'][3], out=P['out'])
            L.put(L.ellm(x + 25, y - 32, 18, 5), P['acc'])


def steps(L, P, n=5):
    for i in range(n):  # a stepped weir: cream pours over each step
        x = i * W / n; y = 80 + i * 12 % 36
        m = L.rectm(x, y, W / n + 1, HZ - y); L.stones(m, P['st'], P['mo'], 12, light=P['lt']); L.shape(m, None, out=P['out'])
        f = L.rectm(x + 4, y, W / n - 8, 6); L.dither(f, P['acc'], P['glow'], ((L.xs + L.ys) % 3 == 0).astype(float))
        L.put(L.rectm(x, y - 2, W / n, 2), P['glow'])


def screens(L, P, n=4):
    for i in range(n):
        x = int((i + 0.5) * W / n - 35)
        cb = L.rectm(x, HZ - 90, 70, 90); L.shape(cb, P['mt'][2], out=P['out'], light=P['ml'], shade=P['mt'][3])
        sc = L.rectm(x + 8, HZ - 82, 54, 30); L.shape(sc, '#0e2a1a', out=P['out'])
        for ly in range(HZ - 78, HZ - 54, 4): L.put(L.rectm(x + 12, ly, 10 + (ly * 7 + i * 13) % 38, 1), P['glow'])
        for ky in range(HZ - 44, HZ - 6, 8):
            for kx in range(x + 8, x + 62, 8): L.put(L.rectm(kx, ky, 5, 4), P['acc2'] if (kx + ky) % 5 == 0 else P['mt'][0])


def jars(L, P, n=4):
    for i in range(n):
        x = (i + 0.5) * W / n - 27
        L.shape(L.rectm(x - 4, HZ - 50, 62, 50), P['mt'][1], out=P['out'], light=P['ml'])
        jar = L.rectm(x, HZ - 120, 54, 70) | L.ellm(x + 27, HZ - 120, 27, 8)
        L.dither(jar, P['dk'], P['mt'][3], ((L.ys % 6) < 2).astype(float)); L.shape(jar, None, out=P['out'], light=P['ml'])
        L.shape(L.ellm(x + 27, HZ - 84, 20, 16), '#e88aa8', out='#5a2a3a', light='#ffc0d0', shade='#a04a68')
        for k in range(6): L.put(L.linem([(x + 12 + k * 6, HZ - 96), (x + 15 + k * 6, HZ - 76)], 1), '#a04a68')
        L.shape(L.rectm(x - 4, HZ - 130, 62, 6), P['mt'][0], out=P['out'], light=P['ml'])


def cables(L, P, n=4):
    for k in range(n):
        y = 18 + k * 14; xo = k * 80
        pts = [(xo + t * W, y + 30 * math.sin(t * math.pi * 4) ** 2) for t in np.linspace(0, 1, 200)]
        L.shape(L.linem(pts, 3), [P['mt'][2], P['acc2'], P['mt'][1], P['acc']][k % 4], out=P['out'])


def tubes(L, P, n=4):
    for i in range(n):
        x = (i + 0.5) * W / n - 11
        t = L.rectm(x, 0, 22, HZ); L.shape(t, P['mt'][3], out=P['out'], light='#8aa0c0')
        L.put(L.rectm(x + 6, 0, 10, HZ), P['acc'])
        for y in range(0, HZ, 16): L.put(L.ellm(x + 11, y + (i * 7) % 16, 3, 3), '#fffbe8')
        for y in (20, HZ - 20): L.shape(L.rectm(x - 4, y, 30, 8), P['mt'][0], out=P['out'], light=P['ml'])


def spire(L, P, cx=480):
    tw = L.polym([(cx - 30, HZ), (cx - 14, 26), (cx + 14, 26), (cx + 30, HZ)]); L.shape(tw, P['mt'][2], out=P['out'], light=P['ml'])
    L.shape(L.ellm(cx, 22, 26, 18), P['mt'][1], out=P['out'], light=P['ml']); L.shape(L.ellm(cx, 20, 10, 7), P['acc2'], out=P['out'], light='#ff8a8a')
    for k in range(7): L.put(L.rectm(cx - 8, 50 + k * 16, 16, 5), P['acc'] if k % 2 else P['glow'])


def throne(L, P, cx=480):
    L.shape(L.rectm(cx - 60, HZ - 30, 120, 30), P['st'][0], out=P['out'], light=P['lt'])
    back = L.polym([(cx - 40, HZ - 30), (cx - 40, HZ - 140), (cx, HZ - 170), (cx + 40, HZ - 140), (cx + 40, HZ - 30)])
    L.shape(back, P['acc2'], out=P['out'], light='#ff5a5a', shade='#5a0a10')
    L.shape(L.rectm(cx - 28, HZ - 70, 56, 40), P['mt'][1], out=P['out'], light=P['ml'])
    L.shape(L.ellm(cx, HZ - 120, 12, 12), P['acc'], out=P['out'])


def floor(L, P, kind='bricks'):
    lip = L.rectm(0, HZ, W, 6); L.shape(lip, P['mt'][1], out=P['out'], light=P['ml'], shade=P['mt'][3])
    def f(m):
        if kind == 'stones': L.stones(m, P['st'], P['mo'], 14, light=P['lt'])
        elif kind == 'plates': L.bricks(m, P['st'], P['mo'], 48, 24, y0=HZ + 6, light=P['lt'])
        elif kind == 'checker':
            c = ((L.xs // 16 + (L.ys - HZ) // 16) % 2 == 0); L.put(m & c, P['st'][0]); L.put(m & ~c, P['dk'])
        else: L.bricks(m, P['st'], P['mo'], 24, 8, y0=HZ + 6, light=P['lt'])
    base_fill(L, HZ + 6, f)


# ------------------------------------------------------------------ the recipes: zone, tint (colour, strength), floor, pieces
D = {
    # CREAM SEWERS
    's_canal':   ('sewer', None, 'bricks', [('arcade', dict(n=5, top=30, w=100)), ('falls', dict(n=5, y=56, off=96)), ('pipes', dict(rows=(28,), w=10))]),
    's_cistern': ('sewer', ('#2a4a5a', 0.25), 'stones', [('wall', dict(top=14, kind='stones', bh=10)), ('columns', dict(n=6, w=30)), ('lamps', dict(n=6, l=40))]),
    's_filters': ('sewer', None, 'plates', [('wall', dict(top=24, kind='plates')), ('tanks', dict(n=4, h=96, w=74)), ('pipes', dict(rows=(40,), w=12))]),
    's_flood':   ('sewer', ('#c8b080', 0.15), 'bricks', [('falls', dict(n=8, y=40, w=12)), ('pipes', dict(rows=(30, 120), w=16)), ('chains', dict(n=4, l=50, hook=False))]),
    's_lair':    ('sewer', ('#5a0a10', 0.35), 'stones', [('wall', dict(top=10, kind='stones', bh=12)), ('eyes', dict(n=16)), ('bones', dict(n=4)), ('chains', dict(n=6, l=80))]),
    's_outfall': ('sewer', None, 'bricks', [('wall', dict(top=30, kind='bricks', bw=26, bh=12)), ('falls', dict(n=3, y=80, w=22)), ('grates', dict(n=3, y=HZ - 40, w=40, h=28))]),
    's_pumps':   ('sewer', ('#4a4a3a', 0.2), 'plates', [('wheels', dict(n=3, r=46, y=96)), ('pipes', dict(rows=(36, 150), w=12)), ('valves', dict(n=3, y=150))]),
    's_rats':    ('sewer', ('#3a2a1a', 0.3), 'bricks', [('wall', dict(top=20, kind='bricks', bw=16, bh=8)), ('grates', dict(n=6, w=38, h=30, eyes=True)), ('cages', dict(n=3, l=30))]),
    's_vault':   ('sewer', ('#1a2a3a', 0.2), 'stones', [('arcade', dict(n=3, top=20, w=170)), ('banners', dict(n=6, l=50)), ('lamps', dict(n=3, l=70))]),
    's_weir':    ('sewer', None, 'stones', [('steps', dict(n=6)), ('ladders', dict(n=2)), ('pipes', dict(rows=(30,), w=10))]),
    # EJACULAND
    'p_bigtop':   ('park', None, 'checker', [('tents', dict(n=2, h=140, w=220)), ('bunting', dict(y=24, span=160))]),
    'p_bumpcars': ('park', ('#2a1a4a', 0.2), 'tiles', [('wall', dict(top=40, kind='tiles', bw=24)), ('lamps', dict(n=8, l=20)), ('bunting', dict(y=48, span=96))]),
    'p_carousel': ('park', None, 'checker', [('carousel', dict(n=2)), ('bunting', dict(y=30, span=120)), ('lamps', dict(n=4, l=10))]),
    'p_coaster':  ('park', None, 'stones', [('coaster', dict(y=70, amp=46)), ('coaster', dict(y=120, amp=20, cars=False))]),
    'p_flume':    ('park', ('#2a3a5a', 0.15), 'stones', [('steps', dict(n=5)), ('coaster', dict(y=40, amp=20, cars=False)), ('bunting', dict(y=20, span=140))]),
    'p_funhouse': ('park', ('#5a1a5a', 0.25), 'checker', [('wall', dict(top=20, kind='tiles', bw=20)), ('eyes', dict(n=10)), ('banners', dict(n=5, l=60, emblem='ball'))]),
    'p_gates':    ('park', None, 'stones', [('columns', dict(n=4, w=40)), ('banners', dict(n=8, l=60)), ('lamps', dict(n=4, l=50))]),
    'p_midway':   ('park', None, 'checker', [('tents', dict(n=4, h=100, w=120)), ('bunting', dict(y=36, span=120)), ('crates', dict(n=4))]),
    'p_pen':      ('park', ('#3a2a1a', 0.25), 'stones', [('crates', dict(n=6)), ('cages', dict(n=4, l=40)), ('lamps', dict(n=3, l=30))]),
    'p_wheel':    ('park', None, 'checker', [('ferris', dict(cx=480, cy=86, r=78)), ('tents', dict(n=2, h=70, w=90)), ('bunting', dict(y=20, span=200))]),
    # THE BONE PIT
    'b_catacomb': ('bone', None, 'stones', [('wall', dict(top=10, kind='stones', bh=10)), ('skullwall', dict(top=24)), ('lamps', dict(n=4, l=20))]),
    'b_chasm':    ('bone', ('#1a1a2a', 0.2), 'stones', [('stalactites', dict(n=40)), ('chains', dict(n=3, l=120, hook=False)), ('bones', dict(n=3))]),
    'b_crypt':    ('bone', ('#2a1a3a', 0.2), 'stones', [('arcade', dict(n=4, top=26, w=120)), ('crosses', dict(n=4)), ('lamps', dict(n=4, l=30))]),
    'b_ghostline':('bone', ('#2a3a4a', 0.2), 'stones', [('rails', dict(y=HZ - 34)), ('lamps', dict(n=6, l=40)), ('stalactites', dict(n=20))]),
    'b_graves':   ('bone', None, 'stones', [('crosses', dict(n=10)), ('bones', dict(n=2))]),
    'b_mine':     ('bone', ('#3a2a1a', 0.2), 'stones', [('girders', dict(n=3)), ('rails', dict(y=HZ - 30)), ('lamps', dict(n=5, l=20))]),
    'b_ossuary':  ('bone', None, 'stones', [('wall', dict(top=10, kind='stones', bh=14)), ('skullwall', dict(top=20)), ('bones', dict(n=5))]),
    'b_pitarena': ('bone', ('#4a0a0a', 0.25), 'stones', [('columns', dict(n=5, w=36)), ('banners', dict(n=5, l=80, emblem='ball')), ('bones', dict(n=3))]),
    'b_reliquary':('bone', ('#4a3a1a', 0.2), 'stones', [('arcade', dict(n=3, top=30, w=150)), ('cages', dict(n=3, l=50)), ('lamps', dict(n=6, l=20))]),
    'b_spine':    ('bone', None, 'stones', [('stalactites', dict(n=24)), ('wheels', dict(n=2, r=60, y=96)), ('bones', dict(n=4))]),
    # BLOOD FACTORY
    'f_assembly': ('factory', None, 'plates', [('rails', dict(y=HZ - 50)), ('crates', dict(n=6)), ('lamps', dict(n=6, l=30))]),
    'f_bay':      ('factory', ('#3a3a3a', 0.2), 'plates', [('wall', dict(top=30, kind='plates')), ('crates', dict(n=8)), ('chains', dict(n=4, l=60))]),
    'f_boiler':   ('factory', None, 'bricks', [('tanks', dict(n=3, h=120, w=90)), ('pipes', dict(rows=(30, 60), w=14)), ('valves', dict(n=3, y=140))]),
    'f_foundry':  ('factory', ('#5a2a0a', 0.2), 'bricks', [('furnaces', dict(n=3)), ('chains', dict(n=5, l=50))]),
    'f_furnace':  ('factory', ('#7a2a0a', 0.25), 'bricks', [('wall', dict(top=20, kind='bricks', bw=16, bh=8)), ('furnaces', dict(n=4)), ('pipes', dict(rows=(30,), w=10))]),
    'f_pipes':    ('factory', None, 'plates', [('pipes', dict(rows=(24, 60, 96, 132), w=14, flange=90)), ('valves', dict(n=4, y=114))]),
    'f_press':    ('factory', ('#3a3a3a', 0.15), 'plates', [('girders', dict(n=3)), ('wheels', dict(n=2, r=50, y=80)), ('chains', dict(n=3, l=80))]),
    'f_rail':     ('factory', None, 'plates', [('girders', dict(n=2)), ('rails', dict(y=HZ - 36)), ('rails', dict(y=70, carts=False))]),
    'f_smelter':  ('factory', ('#6a3a0a', 0.2), 'bricks', [('vats', dict(n=3, h=110, liquid='#ffb020')), ('chains', dict(n=6, l=40))]),
    'f_vats':     ('factory', None, 'plates', [('vats', dict(n=4, h=100)), ('pipes', dict(rows=(30,), w=12))]),
    # SPUNK BRAIN
    'x_approach': ('brain', None, 'plates', [('spire', dict(cx=480)), ('cables', dict(n=3)), ('lamps', dict(n=4, l=40))]),
    'x_barracks': ('brain', ('#3a3a2a', 0.2), 'plates', [('wall', dict(top=30, kind='plates')), ('banners', dict(n=8, l=70)), ('crates', dict(n=4))]),
    'x_core':     ('brain', ('#1a4a3a', 0.2), 'plates', [('tubes', dict(n=6)), ('wheels', dict(n=2, r=40, y=90)), ('cables', dict(n=2))]),
    'x_crush':    ('brain', None, 'plates', [('girders', dict(n=3)), ('chains', dict(n=4, l=70))]),
    'x_gate':     ('brain', ('#4a0a1a', 0.2), 'stones', [('columns', dict(n=4, w=44)), ('banners', dict(n=6, l=90)), ('lamps', dict(n=4, l=30))]),
    'x_labs':     ('brain', None, 'tiles', [('wall', dict(top=24, kind='tiles', bw=16)), ('jars', dict(n=4)), ('screens', dict(n=2))]),
    'x_reactor':  ('brain', ('#1a5a2a', 0.25), 'plates', [('tanks', dict(n=3, h=120, w=90)), ('tubes', dict(n=3)), ('cables', dict(n=3))]),
    'x_spire':    ('brain', None, 'plates', [('spire', dict(cx=240)), ('spire', dict(cx=720)), ('cables', dict(n=2))]),
    'x_throne':   ('brain', ('#5a0a1a', 0.3), 'stones', [('wall', dict(top=10, kind='stones', bh=12)), ('throne', dict(cx=480)), ('banners', dict(n=6, l=100)), ('lamps', dict(n=4, l=20))]),
    'x_vats':     ('brain', None, 'plates', [('jars', dict(n=6)), ('cables', dict(n=3))]),
}


def build(did):
    zone, tint, fl, pieces = D[did]
    P = tinted(PAL[zone], tint[0] if tint else None, tint[1] if tint else 0)
    L = Layer(H, seed=sum(map(ord, did)))
    for name, o in pieces:
        globals()[name](L, P, **o)
    floor(L, P, fl)
    k = FOG['mid']; c = hx(HAZE[zone]); L.rgb = (L.rgb * (1 - k) + c * k).astype(np.int16)
    os.makedirs(OUT, exist_ok=True); p = os.path.join(OUT, 'd_%s.png' % did); L.save(p); return p


if __name__ == '__main__':
    ids = sys.argv[1:] or list(D)
    for d in ids:
        build(d)
    print(len(ids), 'district layers')
