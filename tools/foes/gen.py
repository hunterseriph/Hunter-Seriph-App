#!/usr/bin/env python3
"""16-bit pixel art for Load Legacy's enemies and bosses, drawn at full resolution (no upscaling).

Run:  python3 tools/foes/gen.py   ->  tools/foes/foes.png + foes.json (+ preview.png)
Frames are named f_<id>_<n> and face right; the game flips them. Sprites with writing on them
(the Piggy brothers) also get f_<id>_<n>L so the words never read backwards.
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..'))
from pixelkit import Grid, render, pack, preview

S = math.sin; C = math.cos
BLACK = ('#3a2a30', '#1a1014', '#0c0608')

# ------------------------------------------------------------------ regular enemies
def crawler(f, neon=False):
    """a blood beetle that skitters on six legs; the neon one glows pink in Ejaculand"""
    g = Grid(32, 22); ph = f * math.pi / 2
    shell = ('#c43a46', '#8a1a24', '#4a0a12') if not neon else ('#4a2a5a', '#2a1236', '#140a1c')
    g.ellipse(15, 10, 11, 6.5, 'shell')
    g.line(5, 10, 24, 10, 'seam', 0.5)  # where the wing cases meet
    for i, lx in enumerate((8, 14, 20)):  # legs, alternating, out from under the shell
        k = S(ph + i * 2.1) * 2.2
        g.line(lx, 15, lx - 3 + k, 18, 'leg', 0.6); g.line(lx - 3 + k, 18, lx - 4 + k, 21, 'leg', 0.5)
        g.line(lx + 2, 15, lx + 4 - k, 18, 'leg', 0.6); g.line(lx + 4 - k, 18, lx + 5 - k, 21, 'leg', 0.5)
    g.ellipse(26, 12, 4.2, 4, 'head')
    g.put(28, 11, 'eye'); g.put(27, 11, 'eye'); g.put(28, 10, 'glint')
    g.line(29, 14, 31, 16 + (f % 2), 'jaw', 0.5); g.line(28, 15, 30, 18 - (f % 2), 'jaw', 0.5)  # mandibles
    for (x, y) in ((10, 7), (19, 6), (13, 13), (20, 12)): g.put(x, y, 'spot')
    if neon:
        for x in range(6, 25, 3): g.put(x, 13 + (x % 2), 'neon')
        g.line(8, 6, 22, 6, 'neon2', 0.5)
    pal = {'shell': shell, 'head': ('#5a3a40', '#2a1418', '#140a0c'), 'leg': ('#5a2a30', '#3a1418', '#1a0a0c'), 'seam': '#2a060c',
           'eye': '#ffe36a', 'glint': '#ffffff', 'jaw': '#d8c8a8', 'spot': '#ff6a70' if not neon else '#ff2a8a', 'neon': '#ff2a8a', 'neon2': '#7af0ff'}
    return g, pal

def bat(f, purple=False):
    """black bat with a red rim, four wing beats"""
    g = Grid(30, 20); up = [-6, -2, 3, -1][f]
    wing = BLACK if not purple else (('#ff9a40', '#c4421c', '#6a1a08') if purple == 'ember' else ('#4a2a5a', '#2a1236', '#140a1c'))
    for side in (-1, 1):
        tip = (15 + side * 14, 9 + up); mid = (15 + side * 8, 7 + up * 0.6)
        g.poly([(15 + side * 2, 8), mid, tip, (15 + side * 10, 12 + up * 0.3), (15 + side * 6, 13), (15 + side * 3, 12)], 'wing')
        g.line(15 + side * 2, 9, mid[0], mid[1], 'bone', 0.5); g.line(mid[0], mid[1], tip[0], tip[1], 'bone', 0.5)
    g.ellipse(15, 11, 3.6, 4.2, 'body')
    g.poly([(12, 8), (13, 4), (14, 8)], 'body'); g.poly([(16, 8), (17, 4), (18, 8)], 'body')  # ears
    g.put(13, 10, 'eye'); g.put(17, 10, 'eye'); g.put(14, 13, 'fang'); g.put(16, 13, 'fang')
    rim = '#c4121c' if not purple else ('#ffe36a' if purple == 'ember' else '#ff3a9a')
    pal = {'wing': wing, 'body': ('#3a2a30', '#1e1216', '#0c0608'), 'bone': rim, 'eye': '#ff2630', 'fang': '#f1e7d0'}
    return g, pal

def ghoul(f):
    """hunched grave ghoul, grey-green with a red rag, long arms; frame 3 is the charge lunge"""
    g = Grid(24, 34); step = [0, 1, 0, -1][f]; lunge = f == 3
    for side, ph in ((-1, step), (1, -step)):
        hip = (11 + side * 2, 21); kn = (11 + side * 2 + ph * 2, 26); ft = (11 + side * 2 + ph * 3, 33)
        g.line(hip[0], hip[1], kn[0], kn[1], 'skin', 1); g.line(kn[0], kn[1], ft[0], ft[1], 'skin', 1); g.line(ft[0], ft[1], ft[0] + 2, ft[1], 'skin', 0.6)
    g.ellipse(11, 16, 5, 6.5, 'skin')
    g.poly([(6, 14), (16, 13), (17, 22), (5, 22)], 'rag')
    for x in (6, 9, 12, 15): g.put(x, 22, 'rag'); g.put(x + 1, 23, 'rag')
    hx_ = 15 + (3 if lunge else 0)
    g.ellipse(hx_, 8, 4.6, 4.8, 'skin')
    g.put(hx_ + 2, 7, 'eye'); g.put(hx_ + 1, 7, 'eye'); g.rect(hx_ + 1, 10, 4, 1, 'mouth'); g.put(hx_ + 2, 10, 'teeth'); g.put(hx_ + 4, 10, 'teeth')
    g.line(hx_ - 4, 5, hx_ - 1, 3, 'hair', 0.5); g.line(hx_ - 3, 6, hx_ - 5, 9, 'hair', 0.5)
    a = 0.9 if lunge else 0.25 + step * 0.15
    for side in (-1, 1):
        sh = (11 + side, 12); el = (sh[0] + C(a) * 6, sh[1] + S(a) * 6 + 4); hd = (el[0] + C(a - 0.4) * 6, el[1] + S(a - 0.4) * 5)
        g.line(sh[0], sh[1], el[0], el[1], 'skin', 0.8); g.line(el[0], el[1], hd[0], hd[1], 'skin', 0.8)
        g.line(hd[0], hd[1], hd[0] + 2, hd[1] + 1, 'claw', 0.5)
    pal = {'skin': ('#a8b89a', '#6e7e62', '#3e4a36'), 'rag': ('#a8202a', '#6a0c14', '#3a060a'), 'eye': '#ffe36a', 'mouth': '#12040a', 'teeth': '#f1e7d0', 'hair': '#2a2a24', 'claw': '#e8dcc0'}
    return g, pal

def imp(f):
    """little red devil with bat wings and a fireball in its claw"""
    g = Grid(28, 26); up = [-3, 0, 3, 0][f]
    for side in (-1, 1):
        g.poly([(13 + side * 2, 10), (13 + side * 12, 4 + up), (13 + side * 11, 12 + up * 0.5), (13 + side * 6, 14)], 'wing')
        g.line(13 + side * 2, 10, 13 + side * 12, 4 + up, 'wbone', 0.5)
    g.line(12, 18, 8, 22, 'skin', 0.6); g.line(8, 22, 6, 20, 'skin', 0.5); g.put(5, 19, 'tip')  # tail
    g.ellipse(13, 15, 4, 5, 'skin'); g.ellipse(14, 8, 4.4, 4.2, 'skin')
    g.poly([(11, 5), (10, 1), (12, 4)], 'horn'); g.poly([(16, 4), (18, 0), (17, 5)], 'horn')
    g.put(15, 8, 'eye'); g.put(17, 8, 'eye'); g.rect(14, 10, 4, 1, 'mouth'); g.put(15, 10, 'teeth')
    g.line(12, 19, 11, 23, 'skin', 0.6); g.line(15, 19, 16, 23, 'skin', 0.6)
    g.line(16, 13, 20, 12, 'skin', 0.6)
    fb = 2.3 + (f % 2) * 0.5; g.ellipse(22, 11, fb, fb, 'fire'); g.put(22, 11, 'fire2'); g.put(21, 10, 'fire2')
    pal = {'skin': ('#ff5a5a', '#c41c24', '#6a0a10'), 'wing': ('#6a1a20', '#3a0a10', '#1a0408'), 'wbone': '#c41c24', 'horn': ('#f1e7d0', '#c8b890', '#7a6a50'),
           'eye': '#ffe36a', 'mouth': '#12040a', 'teeth': '#f1e7d0', 'tip': '#ffb040', 'fire': ('#fff09a', '#ffb040', '#ff5a20'), 'fire2': '#ffffff'}
    return g, pal

def golem(f):
    """the Brute: a hulking red stone giant with glowing cracks and huge fists"""
    g = Grid(38, 40); step = [0, 1, 0, -1][f]
    for side, ph in ((-1, step), (1, -step)):
        g.rect(13 + side * 5 + ph, 30, 6, 10, 'stone'); g.rect(12 + side * 5 + ph, 37, 8, 3, 'stone2')
    g.poly([(7, 12), (31, 10), (33, 30), (5, 31)], 'stone')
    g.ellipse(19, 8, 6, 5, 'stone2')
    g.rect(17, 7, 2, 2, 'eye'); g.rect(22, 7, 2, 2, 'eye'); g.rect(17, 11, 7, 1, 'mouth')
    for (x0, y0, x1, y1) in ((10, 15, 14, 20), (14, 20, 12, 25), (24, 14, 27, 19), (27, 19, 25, 24), (18, 22, 21, 27)): g.line(x0, y0, x1, y1, 'crack', 0.5)
    sw = step * 1.5
    for side in (-1, 1):
        sx = 19 + side * 13; g.rect(sx - 3, 12 + sw * side, 6, 13, 'stone'); g.ellipse(sx, 27 + sw * side, 4.5, 4, 'stone2')
        g.put(sx - 1, 26 + sw * side, 'crack')
    pal = {'stone': ('#c44a4a', '#8a1e24', '#4a0a10'), 'stone2': ('#d85a5a', '#a02a30', '#5a0e14'), 'eye': '#ffe36a', 'mouth': '#12040a', 'crack': '#ffb040'}
    return g, pal

def slime(f, col='green'):
    """a wobbling blob with a shine and a face"""
    cols = {'green': ('#8aff6a', '#3ab43a', '#1a6a1a'), 'red': ('#ff8a6a', '#e0402a', '#7a1a10'), 'blue': ('#8ac8ff', '#3a6ae0', '#1a2a7a'),
            'yellow': ('#fff07a', '#d8b42a', '#7a5a10'), 'purple': ('#d08aff', '#8a3ad8', '#4a1a7a'), 'cream': ('#fffbe8', '#f1e0b0', '#b8a070')}[col]
    g = Grid(22, 18); sq = [0, 1, 2, 1][f]
    g.ellipse(11, 11 + sq * 0.5, 9 + sq * 0.6, 6.5 - sq * 0.6, 'goo')
    g.ellipse(11, 8 + sq, 5, 3, 'goo')
    g.put(7, 8 + sq, 'shine'); g.put(8, 7 + sq, 'shine'); g.put(7, 9 + sq, 'shine')
    g.rect(12, 10 + sq, 2, 2, 'eye'); g.rect(16, 10 + sq, 2, 2, 'eye'); g.put(13, 11 + sq, 'pupil'); g.put(17, 11 + sq, 'pupil')
    g.rect(14, 14 + sq // 2, 3, 1, 'mouth')
    if col == 'red': g.put(10, 3 + sq, 'flame'); g.put(11, 2 + sq - (f % 2), 'flame'); g.put(12, 3 + sq, 'flame2')
    pal = {'goo': cols, 'shine': '#ffffff', 'eye': '#ffffff', 'pupil': '#12040a', 'mouth': '#12040a', 'flame': '#ffb040', 'flame2': '#ffe36a'}
    return g, pal

def vampire(f):
    """pale vampire in a black suit and a red-lined cape"""
    g = Grid(26, 40); fl = [0, 1, 2, 1][f]
    g.poly([(6, 12), (20, 12), (23 + fl, 38), (3 - fl, 38)], 'cape')
    g.poly([(8, 14), (18, 14), (20, 36), (6, 36)], 'lining')
    g.rect(9, 14, 8, 18, 'suit'); g.poly([(11, 14), (13, 20), (15, 14)], 'shirt'); g.put(13, 15, 'tie'); g.put(13, 16, 'tie')
    g.rect(9, 32, 3, 6, 'suit'); g.rect(14, 32, 3, 6, 'suit')
    g.ellipse(13, 8, 4.5, 5.2, 'face')
    g.poly([(8, 6), (13, 1), (18, 6), (16, 4), (13, 3), (10, 4)], 'hair'); g.poly([(12, 3), (13, 6), (14, 3)], 'hair')
    g.put(15, 8, 'eye'); g.put(11, 8, 'eye'); g.rect(12, 11, 3, 1, 'mouth'); g.put(12, 12, 'fang'); g.put(14, 12, 'fang')
    g.poly([(6, 12), (3, 7), (8, 10)], 'cape'); g.poly([(20, 12), (23, 7), (18, 10)], 'cape')  # high collar
    g.rect(18, 20, 2, 7, 'suit'); g.rect(18, 27, 2, 2, 'face')
    pal = {'cape': ('#3a2a30', '#1a1014', '#0a0406'), 'lining': ('#ff3a44', '#c4121c', '#7a0a10'), 'suit': ('#2e2a34', '#18141c', '#0a080c'),
           'shirt': '#f1e7d0', 'tie': '#c4121c', 'face': ('#ffffff', '#e0dcd8', '#a8a0a0'), 'hair': ('#3a3440', '#16121a', '#08060a'),
           'eye': '#ff2630', 'mouth': '#4a0a10', 'fang': '#ffffff'}
    return g, pal


def knight(f):
    """a hollow castle knight: dented black plate, red plume, a tall kite shield held in front"""
    g = Grid(28, 36); step = [0, 1, 0, -1][f]
    for side, ph in ((-1, step), (1, -step)):
        g.rect(11 + side * 3 + ph, 26, 4, 8, 'plate'); g.rect(10 + side * 3 + ph, 33, 6, 3, 'plate2')
    g.poly([(7, 13), (19, 13), (20, 27), (6, 27)], 'plate')
    g.rect(7, 22, 13, 2, 'belt')
    g.ellipse(13, 8, 5.5, 6, 'plate2')
    g.rect(13, 6, 6, 2, 'visor'); g.put(16, 6, 'eye'); g.put(14, 6, 'eye')
    for x in (14, 16, 18): g.put(x, 9, 'visor')
    g.poly([(10, 4), (9, 0), (6, 1), (4, 4), (8, 5)], 'plume'); g.line(9, 2, 4, 6 + (f % 2), 'plume', 0.6)
    g.line(7, 15, 4, 22, 'plate', 0.9)  # back arm
    # the shield, in front
    g.poly([(18, 11), (26, 11), (26, 24), (22, 30), (18, 24)], 'shield')
    g.line(22, 12, 22, 27, 'trim', 0.5); g.line(19, 17, 25, 17, 'trim', 0.5)
    g.put(22, 17, 'gem')
    pal = {'plate': ('#6a6070', '#3a3440', '#1a161e'), 'plate2': ('#7a7080', '#4a4250', '#22202a'), 'belt': '#5a0a10', 'visor': '#12040a', 'eye': '#ff2630',
           'plume': ('#ff3a44', '#c4121c', '#6a0a10'), 'shield': ('#4a3a40', '#2a1e24', '#140c10'), 'trim': '#c4121c', 'gem': '#ffe36a'}
    return g, pal

def wraith(f):
    """a hooded wraith of red smoke that drifts through walls"""
    g = Grid(28, 32); w = [0, 1, 2, 1][f]
    g.poly([(8, 8), (20, 8), (24, 26), (20, 24 + w), (16, 29 - w), (12, 25 + w), (7, 29 - w), (4, 24)], 'robe')
    g.ellipse(14, 9, 6.5, 7, 'robe')
    g.ellipse(15, 10, 4, 4.5, 'void')
    g.put(14, 9, 'eye'); g.put(17, 9, 'eye'); g.put(15, 9, 'eye2')
    g.line(18, 13, 24, 17 + w, 'robe', 1.6); g.line(24, 17 + w, 27, 15 + w, 'claw', 0.5); g.line(24, 18 + w, 27, 19 + w, 'claw', 0.5)
    for y in (16, 20): g.line(9, y, 13, y + 1, 'wisp', 0.5)
    pal = {'robe': ('#5a1a2a', '#3a0a18', '#1a040c'), 'void': '#08020a', 'eye': '#ff2630', 'eye2': '#ffe36a', 'claw': '#d8c8a8', 'wisp': '#8a2a3a'}
    return g, pal

def gargoyle(f):
    """a stone gargoyle; frame 0 is perched and still, 1-3 are the swoop"""
    g = Grid(32, 28); perch = f == 0; up = [0, -5, 2, -1][f]
    for side in (-1, 1):
        if perch: g.poly([(16 + side * 3, 10), (16 + side * 9, 6), (16 + side * 10, 16), (16 + side * 5, 18)], 'wing')
        else: g.poly([(16 + side * 3, 11), (16 + side * 15, 3 + up), (16 + side * 13, 14 + up * 0.4), (16 + side * 6, 17)], 'wing')
    g.ellipse(16, 16, 6, 6.5, 'stone')
    g.ellipse(17, 8, 4.8, 4.4, 'stone')
    g.poly([(13, 6), (11, 0), (15, 5)], 'horn'); g.poly([(19, 5), (22, 0), (21, 6)], 'horn')
    g.put(18, 8, 'eye'); g.put(20, 8, 'eye'); g.rect(17, 11, 5, 1, 'mouth'); g.put(18, 11, 'fang'); g.put(21, 11, 'fang')
    leg = 0 if perch else 3
    for side in (-1, 1):
        g.line(16 + side * 3, 21, 16 + side * 4, 26 - leg, 'stone2', 0.8); g.line(16 + side * 4, 26 - leg, 16 + side * 6, 27 - leg, 'claw', 0.5)
    g.line(11, 19, 6, 23, 'stone2', 0.6); g.put(5, 23, 'stone2')
    for (x, y) in ((14, 14), (18, 18), (15, 19)): g.put(x, y, 'crack')
    pal = {'stone': ('#8a8088', '#5a5058', '#2a2228'), 'stone2': ('#7a7078', '#4a4048', '#221a20'), 'wing': ('#6a6068', '#3e363c', '#1e181c'),
           'horn': ('#a89aa0', '#6a5e64', '#3a3034'), 'eye': '#ff2630' if not perch else '#7a1a20', 'mouth': '#12040a', 'fang': '#f1e7d0', 'claw': '#d8c8a8', 'crack': '#2a2228'}
    return g, pal

def crow(f):
    """a ragged roof crow with a red eye; dives at you"""
    g = Grid(26, 18); up = [-5, -1, 3, 0][f]
    g.poly([(10, 8), (5, 2 + up), (2, 4 + up), (6, 10)], 'wing')
    g.ellipse(12, 10, 6, 4, 'body')
    g.poly([(6, 9), (0, 7), (1, 11), (6, 12)], 'body')
    g.ellipse(18, 8, 3.6, 3.4, 'body')
    g.poly([(21, 7), (25, 8), (21, 10)], 'beak')
    g.put(19, 7, 'eye')
    g.poly([(12, 9), (17 - up * 0.3, 3 + up), (20, 5 + up), (15, 11)], 'wing')
    g.line(11, 14, 10, 17, 'leg', 0.5); g.line(13, 14, 14, 17, 'leg', 0.5)
    pal = {'wing': ('#3a2a40', '#1a1220', '#0a060c'), 'body': ('#3a3038', '#1e161c', '#0c080a'), 'beak': ('#ffe36a', '#d8a02a', '#7a5010'), 'eye': '#ff2630', 'leg': '#d8a02a'}
    return g, pal

def clown(f):
    """an Ejaculand clown: white face, red nose, frills; frame 3 is winding up a cream pie"""
    g = Grid(28, 36); step = [0, 1, 0, -1][f]; throw = f == 3
    for side, ph in ((-1, step), (1, -step)):
        g.rect(12 + side * 3 + ph, 27, 3, 6, 'pants'); g.ellipse(13 + side * 3 + ph + 1, 34, 3.6, 1.8, 'shoe')
    g.poly([(7, 15), (21, 15), (22, 28), (6, 28)], 'suit')
    for x in range(7, 22, 4): g.rect(x, 18, 2, 2, 'dot'); g.rect(x + 2, 23, 2, 2, 'dot')
    g.poly([(6, 14), (22, 14), (20, 17), (8, 17)], 'frill')
    g.ellipse(14, 9, 5.5, 5.5, 'face')
    g.ellipse(9, 5, 3, 3, 'hair'); g.ellipse(19, 5, 3, 3, 'hair')
    g.poly([(11, 4), (14, -1), (17, 4)], 'hat'); g.put(14, 0, 'dot')
    g.put(13, 8, 'eye'); g.put(16, 8, 'eye'); g.ellipse(17.5, 10.5, 1.6, 1.5, 'nose')
    g.line(12, 12, 18, 12, 'grin', 0.5); g.put(12, 11, 'grin'); g.put(18, 11, 'grin')
    if throw: g.line(20, 17, 23, 10, 'suit', 0.9); g.ellipse(24, 8, 3.5, 2.4, 'pie'); g.line(21, 7, 27, 7, 'cream', 0.5)
    else: g.line(20, 17, 24, 22, 'suit', 0.9); g.ellipse(25, 22, 3.5, 2.2, 'pie'); g.line(22, 21, 28, 21, 'cream', 0.5)
    g.line(8, 17, 5, 23 + step, 'suit', 0.9)
    pal = {'pants': ('#3a3038', '#1e161c', '#0c080a'), 'shoe': ('#ff3a44', '#c4121c', '#6a0a10'), 'suit': ('#2a2a30', '#141418', '#08080a'), 'dot': '#ff2630',
           'frill': ('#ffffff', '#e8dcc8', '#a8987a'), 'face': ('#ffffff', '#ece4d8', '#b0a49a'), 'hair': ('#ff3a44', '#c4121c', '#6a0a10'), 'hat': ('#ff2a8a', '#a8105a', '#5a0a30'),
           'eye': '#12040a', 'nose': '#ff2630', 'grin': '#c4121c', 'pie': ('#d8a05a', '#a0702a', '#5a3a10'), 'cream': '#fff6d8'}
    return g, pal

def balloon(f):
    """a black-and-red Ejaculand balloon with Steve's grin on it, bobbing on a string"""
    g = Grid(20, 32); sw = [0, 1, 0, -1][f]
    g.ellipse(10, 9, 8, 8.6, 'skin')
    g.poly([(8, 17), (12, 17), (10, 19)], 'knot')
    for i in range(12): g.put(10 + S(i * 0.7 + f) * 1.2 + sw * i / 12, 19 + i, 'string')
    g.put(6, 5, 'shine'); g.put(5, 6, 'shine'); g.put(6, 6, 'shine')
    g.rect(7, 7, 2, 2, 'eye'); g.rect(12, 7, 2, 2, 'eye')
    g.line(6, 11, 14, 11, 'grin', 0.5); g.line(7, 12, 13, 12, 'grin', 0.5); g.put(5, 10, 'grin'); g.put(15, 10, 'grin')
    for x in (8, 10, 12): g.put(x, 12, 'tooth')
    pal = {'skin': ('#4a3a42', '#1e1418', '#0a0608'), 'knot': '#c4121c', 'string': '#a6968f', 'shine': '#ff6a70', 'eye': '#ff2630', 'grin': '#ff2630', 'tooth': '#f1e7d0'}
    return g, pal

def jailer(f):
    """the dungeon jailer: fat, hooded, keys on his belt, a spiked ball on a chain"""
    g = Grid(34, 38); step = [0, 1, 0, -1][f]
    for side, ph in ((-1, step), (1, -step)):
        g.rect(13 + side * 4 + ph, 28, 5, 8, 'pants'); g.rect(12 + side * 4 + ph, 35, 7, 3, 'boot')
    g.ellipse(15, 21, 10, 9, 'skin')
    g.poly([(6, 14), (24, 14), (25, 28), (5, 28)], 'apron')
    g.rect(5, 25, 20, 2, 'belt'); g.put(9, 27, 'key'); g.put(10, 28, 'key'); g.put(12, 27, 'key')
    g.ellipse(15, 8, 6, 6.5, 'hood')
    g.poly([(10, 2), (15, -2), (20, 2)], 'hood')
    g.rect(14, 7, 6, 2, 'void'); g.put(15, 7, 'eye'); g.put(18, 7, 'eye')
    g.line(6, 16, 3, 24, 'skin', 1.2)
    # the chain arm, swinging
    a = [0.2, 0.9, 1.6, 0.9][f]
    hx0, hy0 = 24, 18; hx1, hy1 = hx0 + 4, hy0 + 4
    g.line(22, 15, hx1, hy1, 'skin', 1.2)
    cx_, cy_ = hx1 + C(a - 1.2) * 4, hy1 + S(a - 1.2) * 4 + 6
    for t in range(5): g.put(hx1 + (cx_ - hx1) * t / 4, hy1 + (cy_ - hy1) * t / 4, 'chain')
    g.ellipse(min(30, cx_), min(33, cy_ + 2), 3.4, 3.4, 'ball')
    pal = {'pants': ('#4a3a30', '#2a2018', '#14100c'), 'boot': ('#3a2a20', '#1e140e', '#0c0806'), 'skin': ('#e8a890', '#b06a5a', '#5a3028'), 'apron': ('#6a4a3a', '#4a2e22', '#24140e'),
           'belt': '#2a1a10', 'key': '#ffe36a', 'hood': ('#3a3038', '#1e161c', '#0c080a'), 'void': '#08020a', 'eye': '#ff2630', 'chain': '#a6968f', 'ball': ('#8a8088', '#4a4048', '#1e181c')}
    return g, pal

def rat(f):
    """a dungeon rat, quick and in packs"""
    g = Grid(24, 13); step = [0, 1, 0, -1][f]
    g.ellipse(11, 7, 7, 4, 'fur')
    g.ellipse(18, 7, 3.6, 3, 'fur')
    g.poly([(20, 6), (24, 8), (20, 9)], 'fur'); g.put(23, 8, 'nose')
    g.ellipse(16, 4, 1.6, 1.8, 'ear'); g.put(19, 6, 'eye')
    for i in range(7): g.put(4 - i, 7 + S(i * 0.9 + f) * 1.2, 'tail')
    for lx, ph in ((8, step), (14, -step)): g.line(lx, 10, lx + ph, 12, 'leg', 0.5)
    g.put(21, 9, 'tooth')
    pal = {'fur': ('#6a5a5a', '#3e3232', '#1e1616'), 'ear': '#c47a7a', 'eye': '#ff2630', 'nose': '#ff8a9a', 'tail': '#c47a7a', 'leg': '#c47a7a', 'tooth': '#f1e7d0'}
    return g, pal

def cultrat(f):
    """a rat in a red cult robe and hood, holding a dagger of cream"""
    g = Grid(24, 30); step = [0, 1, 0, -1][f]; throw = f == 3
    g.poly([(6, 12), (17, 12), (20, 28), (3, 28)], 'robe')
    for x in (5, 9, 13, 17): g.put(x, 28, 'robe')
    g.line(4, 26, 1, 27 - step, 'tail', 0.5); g.line(1, 27 - step, -1, 24, 'tail', 0.5)
    g.ellipse(12, 8, 6, 6, 'hood'); g.poly([(6, 6), (12, -1), (18, 6)], 'hood')
    g.ellipse(15, 9, 3.5, 3, 'fur'); g.poly([(17, 8), (22, 10), (17, 11)], 'fur'); g.put(21, 10, 'nose'); g.put(16, 8, 'eye')
    g.rect(8, 18, 8, 2, 'sash'); g.put(12, 19, 'gold')
    if throw: g.line(16, 14, 21, 9, 'fur', 0.7); g.line(21, 9, 23, 5, 'blade', 0.6)
    else: g.line(16, 15, 20, 19, 'fur', 0.7); g.line(20, 19, 23, 21, 'blade', 0.6)
    pal = {'robe': ('#a8202a', '#6a0c14', '#3a060a'), 'hood': ('#8a1a24', '#5a0a12', '#2a0408'), 'fur': ('#8a7a7a', '#4e4242', '#241c1c'), 'tail': '#c47a7a', 'nose': '#ff8a9a', 'eye': '#ffe36a',
           'sash': '#2a0408', 'gold': '#ffe36a', 'blade': '#fff6d8'}
    return g, pal

def skeleton(f):
    """a skeleton warrior that lobs bones"""
    g = Grid(22, 34); step = [0, 1, 0, -1][f]; throw = f == 3
    for side, ph in ((-1, step), (1, -step)): g.line(11 + side * 2, 21, 11 + side * 2 + ph * 2, 27, 'bone', 0.6); g.line(11 + side * 2 + ph * 2, 27, 11 + side * 2 + ph * 3, 33, 'bone', 0.6); g.put(11 + side * 2 + ph * 3 + 1, 33, 'bone')
    g.rect(10, 11, 2, 10, 'bone'); g.ellipse(11, 21, 4, 1.6, 'bone')
    for i in range(3): g.line(7, 12 + i * 3, 15, 12 + i * 3, 'bone', 0.5)
    g.ellipse(12, 6, 5, 5, 'bone'); g.rect(9, 9, 6, 3, 'bone'); g.ellipse(10, 6, 1.4, 1.6, 'void'); g.ellipse(14, 6, 1.4, 1.6, 'void'); g.put(10, 6, 'eye'); g.put(14, 6, 'eye')
    for x in (10, 12, 14): g.put(x, 10, 'void')
    if throw: g.line(15, 12, 19, 7, 'bone', 0.5); g.line(19, 7, 21, 2, 'bone', 0.5); g.ellipse(21, 2, 1.5, 1.5, 'bone')
    else: g.line(15, 12, 18, 18, 'bone', 0.5)
    g.line(7, 12, 5, 19 + step, 'bone', 0.5)
    pal = {'bone': ('#ffffff', '#e8dcc0', '#9a8a6a'), 'void': '#12040a', 'eye': '#ff2630'}
    return g, pal

def bonehound(f):
    """a skeletal hound; frame 3 is the lunge"""
    g = Grid(32, 20); step = [0, 2, 0, -2][f]; lunge = f == 3
    g.line(6, 8, 22, 8, 'bone', 0.7)
    for i in range(5): g.line(9 + i * 3, 8, 9 + i * 3 + 1, 13, 'bone', 0.5)
    for lx, ph in ((8, step), (20, -step)): g.line(lx, 9, lx + ph, 15, 'bone', 0.6); g.line(lx + ph, 15, lx + ph + 1, 19, 'bone', 0.6)
    g.line(6, 8, 1, 4 - (f % 2), 'bone', 0.5)
    hx_ = 26 + (2 if lunge else 0); g.ellipse(hx_, 7, 4.5, 3.5, 'bone'); g.poly([(hx_ + 2, 6), (hx_ + 7, 8), (hx_ + 2, 10)], 'bone'); g.poly([(hx_ - 2, 4), (hx_ - 1, 0), (hx_ + 1, 4)], 'bone')
    g.put(hx_ + 1, 6, 'eye'); g.line(hx_ + 2, 9, hx_ + 6, 9, 'void', 0.4)
    pal = {'bone': ('#ffffff', '#e0d4b8', '#8a7a5a'), 'eye': '#ff2630', 'void': '#12040a'}
    return g, pal

def magmaslug(f):
    """a slow slug of molten rock with a cracked shell"""
    g = Grid(30, 16); w = [0, 1, 2, 1][f]
    g.ellipse(14, 11 - w * 0.3, 13 + w * 0.5, 4.5, 'magma')
    g.ellipse(12, 7 - w * 0.3, 8, 5, 'crust')
    for (x0, y0, x1, y1) in ((8, 5, 11, 9), (13, 4, 15, 8), (17, 6, 14, 10)): g.line(x0, y0, x1, y1, 'glow', 0.4)
    g.line(24, 8, 27, 3 + (f % 2), 'magma', 0.5); g.line(26, 9, 29, 5 - (f % 2), 'magma', 0.5); g.put(27, 3 + (f % 2), 'eye'); g.put(29, 5 - (f % 2), 'eye')
    pal = {'magma': ('#ffd060', '#ff7a20', '#a8300a'), 'crust': ('#4a2a20', '#2a1410', '#120604'), 'glow': '#ffb040', 'eye': '#12040a'}
    return g, pal


ENEMIES = {
    'crawler': (lambda f: crawler(f), 4), 'crawlerN': (lambda f: crawler(f, True), 4),
    'bat': (lambda f: bat(f), 4), 'batP': (lambda f: bat(f, True), 4),
    'ghoul': (ghoul, 4), 'imp': (imp, 4), 'golem': (golem, 4),
    'slime': (lambda f: slime(f), 4), 'slimeR': (lambda f: slime(f, 'red'), 4), 'slimeB': (lambda f: slime(f, 'blue'), 4),
    'slimeY': (lambda f: slime(f, 'yellow'), 4), 'creamblob': (lambda f: slime(f, 'cream'), 4), 'emberbat': (lambda f: bat(f, 'ember'), 4), 'slimeP': (lambda f: slime(f, 'purple'), 4),
    'vampire': (vampire, 4),
    'knight': (knight, 4), 'wraith': (wraith, 4), 'gargoyle': (gargoyle, 4), 'crow': (crow, 4),
    'clown': (clown, 4), 'balloon': (balloon, 4), 'jailer': (jailer, 4), 'rat': (rat, 4),
    'cultrat': (cultrat, 4), 'skeleton': (skeleton, 4), 'bonehound': (bonehound, 4), 'magmaslug': (magmaslug, 4),
}

# ------------------------------------------------------------------ bosses
def beast(f):
    """the Cum-starved Beast: a charcoal hellhound with a spiked back and a red, drooling maw"""
    g = Grid(100, 60); st = [0, 1][f]
    legs = [(30, 1), (40, -1), (66, -1), (76, 1)]
    for i, (lx, ph) in enumerate(legs):
        k = (2 if st else -2) * ph
        g.line(lx, 36, lx + k, 48, 'fur', 2.2); g.line(lx + k, 48, lx + k - 1, 56, 'fur', 1.8); g.rect(lx + k - 3, 56, 7, 3, 'fur2')
        for c in range(3): g.put(lx + k + 2 + c * 1 - 1, 59, 'claw')
    g.line(18, 30, 6, 22 - st * 2, 'fur', 2); g.line(6, 22 - st * 2, 3, 14 - st * 2, 'fur', 1.4)  # tail
    g.ellipse(52, 32, 30, 13, 'fur')
    g.ellipse(70, 30, 14, 14, 'fur')  # big chest
    for i in range(9):  # spikes down the back
        x = 28 + i * 6; h = 7 + (i % 3) * 2
        g.poly([(x - 3, 21 - (i * 0.3)), (x + 1, 21 - h - (i * 0.3)), (x + 3, 21 - (i * 0.3))], 'spike')
    hx, hy = 86, 26 + st
    g.ellipse(hx, hy, 10, 9, 'fur')
    g.poly([(hx - 6, hy - 6), (hx - 9, hy - 18), (hx - 1, hy - 8)], 'fur2')  # ear
    g.poly([(hx + 2, hy - 2), (hx + 14, hy + 1), (hx + 13, hy + 4), (hx + 2, hy + 5)], 'fur')  # snout
    g.poly([(hx + 1, hy + 5), (hx + 13, hy + 5), (hx + 11, hy + 14 + st * 2), (hx + 2, hy + 11)], 'maw')  # open jaw
    for x in range(hx + 3, hx + 13, 2): g.put(x, hy + 5, 'tooth'); g.put(x + 1, hy + 6, 'tooth')
    g.line(hx + 4, hy + 11, hx + 4, hy + 15 + st * 2, 'drool', 0.5); g.line(hx + 8, hy + 12, hx + 8, hy + 16, 'drool', 0.5)
    g.rect(hx + 3, hy - 4, 3, 2, 'eye'); g.put(hx + 5, hy - 4, 'glint'); g.line(hx + 1, hy - 6, hx + 7, hy - 5, 'brow', 0.5)
    g.put(hx + 13, hy, 'nose'); g.put(hx + 12, hy, 'nose')
    for (x, y) in ((44, 30), (56, 36), (62, 26), (36, 34)): g.line(x, y, x + 3, y + 2, 'scar', 0.5)
    pal = {'fur': ('#5a5e66', '#33363e', '#16181e'), 'fur2': ('#4a4e56', '#2a2c34', '#121418'), 'spike': ('#8a8e96', '#5a5e66', '#2a2c34'),
           'maw': ('#ff3a44', '#a8101a', '#5a0408'), 'tooth': '#f1e7d0', 'drool': '#f1e7d0', 'eye': '#ff9a2a', 'glint': '#fff6a0', 'brow': '#0c0d10',
           'nose': '#0c0d10', 'claw': '#d8ccb0', 'scar': '#7a2a30'}
    return g, pal

def demon(f):
    """one of the Legion of Semen Demon: a winged brown fiend with horns and a barbed tail"""
    g = Grid(46, 38); up = [-5, 3][f]
    for side in (-1, 1):
        base = (23 + side * 4, 15)
        tips = [(23 + side * 22, 4 + up), (23 + side * 21, 14 + up * 0.6), (23 + side * 16, 22 + up * 0.2)]
        g.poly([base, tips[0], tips[1], tips[2], (23 + side * 6, 21)], 'wing')
        for t in tips: g.line(base[0], base[1], t[0], t[1], 'wbone', 0.5)
    g.line(20, 26, 14, 33, 'skin', 0.8); g.line(14, 33, 10, 31, 'skin', 0.6); g.poly([(8, 29), (11, 31), (9, 33)], 'barb')
    g.ellipse(23, 21, 6, 7, 'skin'); g.ellipse(24, 12, 6, 5.5, 'skin')
    g.poly([(19, 9), (15, 2), (21, 7)], 'horn'); g.poly([(28, 8), (33, 1), (29, 10)], 'horn')
    g.rect(25, 11, 2, 2, 'eye'); g.rect(29, 11, 2, 2, 'eye'); g.rect(25, 15, 6, 2, 'mouth'); g.put(26, 15, 'teeth'); g.put(29, 15, 'teeth')
    for side in (-1, 1): g.line(23 + side * 5, 18, 23 + side * 9, 25, 'skin', 0.8); g.line(23 + side * 9, 25, 23 + side * 10, 27, 'claw', 0.5)
    g.line(21, 27, 20, 33, 'skin', 0.8); g.line(26, 27, 27, 33, 'skin', 0.8)
    pal = {'wing': ('#8a4a2a', '#5a2a14', '#2e140a'), 'wbone': '#3a1a0a', 'skin': ('#b86a3a', '#7a3a1a', '#3e1a0a'), 'horn': ('#f1e7d0', '#c8b890', '#6a5a40'),
           'eye': '#ff2630', 'mouth': '#12040a', 'teeth': '#f1e7d0', 'barb': '#c4121c', 'claw': '#f1e7d0'}
    return g, pal

def sperm(f):
    """the Sperminator: a chrome endoskeleton with burning red eyes and a glowing load in its chest"""
    g = Grid(52, 90); st = [0, 1][f]
    for side, ph in ((-1, st), (1, -st)):  # legs: thigh, knee joint, shin, foot
        hx = 24 + side * 6
        g.rect(hx - 2, 54, 4, 14, 'metal'); g.ellipse(hx + ph, 69, 3.2, 3.2, 'joint'); g.rect(hx - 2 + ph, 71, 4, 14, 'metal')
        g.rect(hx - 5 + ph, 85, 10, 4, 'metal2'); g.line(hx - 1, 56, hx - 1, 66, 'piston', 0.5)
    g.poly([(15, 48), (33, 48), (36, 56), (12, 56)], 'metal2')  # pelvis
    g.rect(22, 34, 4, 15, 'metal')  # spine
    for i in range(5):  # ribs
        y = 22 + i * 4; g.line(24, y, 13 + i, y + 3, 'metal', 0.8); g.line(24, y, 35 - i, y + 3, 'metal', 0.8)
    g.ellipse(24, 30, 4.5, 5, 'core'); g.put(23, 28, 'coreh'); g.line(24, 34, 22, 40, 'core', 0.6); g.line(22, 40, 25, 44, 'core', 0.5)  # the glowing load, with its tail
    g.rect(13, 18, 22, 4, 'metal2')  # shoulders
    g.rect(22, 13, 4, 5, 'piston')  # neck
    g.ellipse(24, 8, 7.5, 7.5, 'skull'); g.rect(19, 12, 10, 4, 'skull')
    g.rect(19, 6, 4, 3, 'socket'); g.rect(26, 6, 4, 3, 'socket'); g.put(20, 7, 'eye'); g.put(27, 7, 'eye'); g.put(21, 7, 'eye'); g.put(28, 7, 'eye')
    for x in range(20, 29, 2): g.put(x, 14, 'socket')
    # arms: one down, one holding a red blaster
    g.line(13, 20, 10, 32, 'metal', 1); g.line(10, 32, 11, 44, 'metal', 1); g.ellipse(10, 32, 2, 2, 'joint')
    g.line(35, 20, 40, 30, 'metal', 1); g.line(40, 30, 46, 34 - st, 'metal', 1); g.ellipse(40, 30, 2, 2, 'joint')
    g.rect(42, 31 - st, 10, 4, 'gun'); g.rect(44, 35 - st, 3, 4, 'gun'); g.put(51, 32 - st, 'muzzle')
    pal = {'metal': ('#e8ecf4', '#a8acb8', '#5a5e6a'), 'metal2': ('#c8ccd8', '#8a8e9a', '#44464e'), 'joint': ('#8a8e9a', '#5a5e6a', '#2a2c34'),
           'piston': ('#b8bcc8', '#6a6e7a', '#34363e'), 'skull': ('#f4f6fa', '#c0c4cc', '#6a6e78'), 'socket': '#12040a', 'eye': '#ff2630',
           'core': ('#fff6d8', '#f1e7d0', '#c8b890'), 'coreh': '#ffffff', 'gun': ('#ff5a5a', '#c4121c', '#5a0408'), 'muzzle': '#ffe36a'}
    return g, pal

def pig(f, left=False):
    """Big Brother of the Brothers Load Piggy: a huge cream pig in a top hat and a monocle"""
    g = Grid(108, 66); st = [0, 1][f]
    for i, (lx, ph) in enumerate(((26, 1), (36, -1), (70, -1), (80, 1))):
        k = 2 * ph * (1 if st else -1)
        g.rect(lx - 4 + k, 50, 9, 12, 'skin'); g.rect(lx - 4 + k, 61, 9, 4, 'hoof')
    g.line(14, 34, 8, 30, 'skin', 1); g.ellipse(6, 28, 2.5, 2.5, 'skin'); g.put(6, 28, 'skin2')  # curly tail
    g.ellipse(52, 38, 40, 18, 'skin')
    g.ellipse(88, 32, 15, 15, 'skin')
    g.ellipse(100, 36, 7, 6, 'snout'); g.rect(98, 34, 2, 3, 'nostril'); g.rect(102, 34, 2, 3, 'nostril')
    g.poly([(80, 20), (78, 10), (88, 18)], 'ear'); g.poly([(90, 19), (94, 9), (96, 20)], 'ear')
    g.rect(90, 27, 3, 3, 'eye'); g.put(91, 27, 'glint')
    g.ellipse(91.5, 28.5, 4, 4, None)
    for a in range(0, 360, 20):  # monocle ring and its chain
        g.put(91.5 + C(math.radians(a)) * 4, 28.5 + S(math.radians(a)) * 4, 'gold')
    g.line(95, 31, 96, 42, 'gold', 0.5)
    g.rect(80, 4, 16, 14, 'hat'); g.rect(76, 16, 24, 4, 'hat'); g.rect(80, 13, 16, 3, 'band')  # top hat
    g.rect(92, 41, 6, 2, 'mouth')
    for (x, y) in ((40, 28), (60, 42), (30, 40)): g.ellipse(x, y, 2, 1.5, 'skin2')
    if left: g = g.flip()
    tx = 34 if not left else 108 - 34 - 26
    g.rect(tx - 2, 30, 30, 16, 'shirt')
    g.text(tx, 32, 'BROTHERS', 'ink'); g.text(tx + 8, 39, 'LOAD', 'ink')
    pal = {'skin': ('#fff4e4', '#f1dcc4', '#c8a890'), 'skin2': '#e8b8a8', 'snout': ('#ffc0c0', '#f0a0a8', '#c07078'), 'nostril': '#7a3a40', 'hoof': ('#5a4a44', '#3a2a24', '#1a1210'),
           'ear': ('#ffd0c8', '#f0b0b0', '#c08080'), 'eye': '#12040a', 'glint': '#ffffff', 'gold': '#ffd040', 'hat': ('#3a3440', '#16121a', '#08060a'), 'band': '#c4121c',
           'mouth': '#7a3a40', 'shirt': ('#fffaf0', '#f4ecdc', '#d8c8b0'), 'ink': '#12040a'}
    return g, pal

def cowpig(f, left=False):
    """the Cowboy Brother: stands on two legs, hat, bandana, BROTHERS LOAD shirt, a pint in his hand"""
    g = Grid(60, 64); st = [0, 1][f]; o = 4
    for side, ph in ((-1, st), (1, -st)):
        g.rect(o + 20 + side * 6 + ph, 46, 8, 13, 'jeans'); g.rect(o + 19 + side * 6 + ph, 58, 10, 5, 'boot')
    g.rect(o + 9, 44, 30, 3, 'belt'); g.rect(o + 22, 44, 4, 3, 'buckle')
    g.ellipse(o + 24, 34, 17, 12, 'shirt')
    g.ellipse(o + 26, 15, 10, 9, 'skin')
    g.ellipse(o + 33, 18, 5, 4, 'snout'); g.put(o + 32, 17, 'nostril'); g.put(o + 35, 17, 'nostril')
    g.rect(o + 27, 12, 2, 2, 'eye'); g.rect(o + 22, 12, 2, 2, 'eye')
    g.poly([(o + 18, 8), (o + 16, 2), (o + 22, 8)], 'ear')
    g.poly([(o + 10, 8), (o + 42, 8), (o + 40, 5), (o + 35, 5), (o + 33, 0), (o + 19, 0), (o + 17, 5), (o + 12, 5)], 'hat'); g.rect(o + 17, 4, 16, 2, 'band')
    g.poly([(o + 18, 23), (o + 34, 23), (o + 26, 29)], 'bandana')
    g.line(o + 8, 30, o + 3, 42, 'skin', 1.4)  # arm down
    g.line(o + 40, 30, o + 45, 37 - st, 'skin', 1.4); g.rect(o + 44, 31 - st, 8, 9, 'pint'); g.rect(o + 44, 31 - st, 8, 2, 'foam'); g.rect(o + 51, 33 - st, 2, 4, 'pint')
    if left: g = g.flip()
    tx = o + 9 if not left else 60 - (o + 9) - 31
    g.text(tx, 31, 'BROTHERS', 'ink'); g.text(tx + 8, 38, 'LOAD', 'ink')
    pal = {'skin': ('#fff4e4', '#f1dcc4', '#c8a890'), 'snout': ('#ffc0c0', '#f0a0a8', '#c07078'), 'nostril': '#7a3a40', 'eye': '#12040a', 'ear': ('#ffd0c8', '#f0b0b0', '#c08080'),
           'hat': ('#c8945a', '#8a5a2a', '#4a2a10'), 'band': '#3a1a0a', 'bandana': ('#ff5a5a', '#c4121c', '#6a0a10'), 'shirt': ('#fffaf0', '#f4ecdc', '#d8c8b0'),
           'jeans': ('#5a7ab8', '#3a5488', '#1e2c4a'), 'boot': ('#8a5a2a', '#5a3414', '#2a1408'), 'belt': '#3a1a0a', 'buckle': '#ffd040',
           'pint': ('#ffd860', '#d8a020', '#8a5a10'), 'foam': '#ffffff', 'ink': '#12040a'}
    return g, pal

def blum(f, sup=False):
    """Blumhead: a giant red droplet of a man with a curled drip on his head; Super Blumhead is violet, horned and crowned in drips"""
    g = Grid(84, 104); st = [0, 1][f]
    for side, ph in ((-1, st), (1, -st)):
        g.ellipse(42 + side * 12 + ph * 2, 92, 8, 9, 'body'); g.ellipse(42 + side * 13 + ph * 2, 100, 10, 4, 'body2')
    g.ellipse(42, 70, 22, 20, 'body')
    for side in (-1, 1):  # arms
        sx = 42 + side * 20; g.line(sx, 60, sx + side * 10, 72 + st * side, 'body', 4); g.ellipse(sx + side * 11, 76 + st * side, 6, 6, 'body2')
    # the head: a big drop with its tip curling over
    g.ellipse(42, 36, 24, 22, 'body')
    g.poly([(26, 22), (42, 2), (58, 22)], 'body')
    g.ellipse(48, 4, 5, 5, 'body'); g.ellipse(53, 7, 3, 3, None)
    g.put(53, 7, None)
    # face: angry eyes and a wide grin
    for side in (-1, 1):
        ex = 42 + side * 9; g.ellipse(ex, 34, 5, 6, 'white'); g.ellipse(ex + 1, 35, 2.5, 3.5, 'pupil'); g.put(ex, 33, 'glint')
        g.line(ex - 5 * side, 26, ex + 4 * side, 29, 'brow', 1)
    g.poly([(26, 44), (58, 44), (54, 54), (30, 54)], 'mouth')
    for x in range(28, 57, 4): g.poly([(x, 44), (x + 2, 48), (x + 4, 44)], 'teeth')
    g.ellipse(42, 52, 7, 2, 'tongue')
    g.ellipse(30, 28, 4, 3, 'shine')  # the shine on a drop
    if sup:
        for side in (-1, 1): g.poly([(42 + side * 14, 18), (42 + side * 26, 0), (42 + side * 20, 22)], 'horn')
        for i, x in enumerate(range(20, 66, 7)): g.line(x, 58 + (i % 2) * 2, x, 64 + (i % 3) * 2 + st, 'drip', 1)
    body = ('#ff5a64', '#d01e2a', '#6a0a12') if not sup else ('#c08aff', '#7a2ad8', '#34106a')
    body2 = ('#ff4a54', '#b0141e', '#5a0810') if not sup else ('#a070f0', '#6020c0', '#2a0c5a')
    pal = {'body': body, 'body2': body2, 'white': '#fff6e8', 'pupil': '#12040a' if not sup else '#ffe36a', 'glint': '#ffffff', 'brow': '#12040a',
           'mouth': '#2a0408', 'teeth': '#f1e7d0', 'tongue': '#ff8a9a', 'shine': ('#ffffff', '#ffd0d4', '#ff8a94') if not sup else ('#ffffff', '#e0d0ff', '#b090ff'),
           'horn': ('#3a3440', '#1a1420', '#0a080c'), 'drip': ('#e0b0ff', '#a060ff', '#5020a0')}
    return g, pal

def moon(f):
    """The Crimson Moon: the secret boss behind the portal. A huge red moon with a face, craters and a grin."""
    g = Grid(84, 84); cx, cy = 42, 42
    g.ellipse(cx, cy, 38, 38, 'rock')
    for (x, y, r) in ((24, 22, 6), (58, 20, 4), (64, 52, 7), (20, 56, 5), (44, 66, 4), (34, 14, 3)): g.ellipse(x, y, r, r * 0.8, 'crater'); g.ellipse(x - 1, y - 1, r * 0.6, r * 0.45, 'pit')
    for side in (-1, 1):  # angry eyes
        ex = cx + side * 13
        g.poly([(ex - 7, 34), (ex + 7, 34 + side * -3), (ex + 6, 41), (ex - 6, 41)], 'void')
        g.ellipse(ex + side * -1, 38, 2.6, 2.2, 'eye' if f == 0 else 'eye2'); g.put(ex + side * -2, 37, 'glint')
    g.poly([(18, 52), (66, 52), (60, 64), (42, 70), (24, 64)], 'void')  # the grin
    for i in range(7):
        x = 22 + i * 6.4; g.poly([(x, 52), (x + 5, 52), (x + 2.5, 57 + (i % 2))], 'tooth'); g.poly([(x + 3, 66 - abs(i - 3) * 1.2), (x + 7, 66 - abs(i - 3) * 1.2), (x + 5, 61)], 'tooth')
    if f == 1: g.ellipse(42, 62, 6, 2.5, 'drip')
    for (x, y) in ((70, 34), (14, 40), (52, 76)): g.line(x, y, x + 3, y + 5, 'pit', 0.5)
    pal = {'rock': ('#ff5a5a', '#c4121c', '#5a0a10'), 'crater': ('#a01820', '#7a0c14', '#4a060c'), 'pit': '#3a0408', 'void': '#12040a',
           'eye': '#ffe36a', 'eye2': '#ffffff', 'glint': '#ffffff', 'tooth': ('#ffffff', '#f1e7d0', '#a6968f'), 'drip': '#ff2630'}
    return g, pal

def ratking(f):
    """The Rat King: a huge sewer rat in a dented gold crown, tail curling behind him"""
    g = Grid(92, 52); st = [0, 2][f]
    for i in range(16): g.put(14 - i * 0.8, 34 - S(i * 0.5 + f) * 3 - i * 0.6, 'tail')
    g.ellipse(40, 32, 26, 15, 'fur'); g.ellipse(30, 36, 14, 10, 'fur')
    for lx, ph in ((24, st), (40, -st), (54, st)): g.rect(lx + ph, 42, 6, 9, 'fur2'); g.line(lx + ph, 50, lx + ph + 7, 50, 'claw', 0.6)
    g.ellipse(68, 28, 15, 12, 'fur'); g.poly([(78, 24), (91, 31), (78, 36)], 'fur'); g.ellipse(90, 31, 2, 2, 'nose')
    g.ellipse(62, 15, 5, 6, 'ear'); g.ellipse(62, 16, 3, 4, 'ear2')
    g.rect(70, 23, 4, 3, 'eye'); g.put(72, 23, 'glint')
    g.poly([(80, 35), (84, 35), (82, 41)], 'tooth'); g.poly([(85, 35), (88, 35), (86, 40)], 'tooth')
    g.poly([(58, 14), (76, 14), (78, 4), (73, 9), (67, 2), (62, 9), (57, 4)], 'gold'); g.put(67, 9, 'gem'); g.put(62, 11, 'gem2'); g.put(73, 11, 'gem2')
    for (x, y) in ((30, 24), (44, 22), (36, 30)): g.put(x, y, 'scar')
    pal = {'fur': ('#8a7a7a', '#4e4242', '#241c1c'), 'fur2': ('#6a5a5a', '#3e3232', '#1e1616'), 'tail': '#c47a7a', 'claw': '#d8c8a8', 'nose': '#ff8a9a', 'ear': ('#8a7a7a', '#4e4242', '#241c1c'), 'ear2': '#c47a7a',
           'eye': '#ff2630', 'glint': '#ffffff', 'tooth': ('#ffffff', '#f1e7d0', '#a6968f'), 'gold': ('#fff09a', '#ffc840', '#a8741a'), 'gem': '#ff2630', 'gem2': '#7a8aff', 'scar': '#2a1418'}
    return g, pal

def boner(f):
    """The Big Boner: a towering skeleton with a red cape and a club made of a femur"""
    g = Grid(64, 92); sw = [0, 1][f]
    for side in (-1, 1):  # legs
        g.line(30 + side * 5, 58, 30 + side * 7, 74, 'bone', 1.3); g.line(30 + side * 7, 74, 30 + side * 6, 89, 'bone', 1.3); g.rect(30 + side * 6 - 3, 88, 8, 3, 'bone')
    g.poly([(18, 26), (42, 26), (48, 70), (12, 70)], 'cape')
    g.rect(29, 28, 3, 30, 'bone')  # spine
    for i in range(5): g.line(21, 30 + i * 5, 39, 30 + i * 5, 'bone', 0.7); g.line(21, 30 + i * 5, 23, 33 + i * 5, 'bone', 0.5); g.line(39, 30 + i * 5, 37, 33 + i * 5, 'bone', 0.5)
    g.ellipse(30, 58, 9, 4, 'bone')  # pelvis
    g.ellipse(30, 14, 11, 12, 'bone'); g.rect(24, 22, 12, 6, 'bone')
    g.ellipse(26, 13, 3, 3.4, 'void'); g.ellipse(35, 13, 3, 3.4, 'void'); g.put(26, 13, 'eye'); g.put(35, 13, 'eye')
    g.poly([(30, 17), (28, 20), (32, 20)], 'void'); g.rect(25, 23, 11, 2, 'void')
    for x in range(25, 36, 2): g.put(x, 23, 'bone')
    g.poly([(19, 4), (16, -2), (24, 3)], 'horn'); g.poly([(41, 4), (44, -2), (36, 3)], 'horn')
    g.line(18, 30, 10, 46, 'bone', 1); g.line(10, 46, 12 + sw * 2, 58, 'bone', 1)  # back arm
    a = 0.3 + sw * 0.6; hx_, hy_ = 44 + C(a) * 8, 46 + S(a) * 6
    g.line(42, 30, 48, 42, 'bone', 1); g.line(48, 42, hx_, hy_, 'bone', 1)
    g.line(hx_, hy_, hx_ + 12, hy_ - 22 + sw * 6, 'club', 2.4); g.ellipse(hx_ + 13, hy_ - 24 + sw * 6, 4, 4, 'club')
    pal = {'bone': ('#ffffff', '#e8dcc0', '#9a8a6a'), 'void': '#12040a', 'eye': '#ff2630', 'cape': ('#a8202a', '#6a0c14', '#3a060a'), 'horn': ('#3a3440', '#1a1420', '#0a080c'), 'club': ('#fff6e0', '#d8c8a0', '#8a7a5a')}
    return g, pal

def hotload(f):
    """The Hot Load: a blob of molten cream with a cracked black crust, dripping fire"""
    g = Grid(78, 74); wob = [0, 1.5][f]
    g.ellipse(39, 44, 32 + wob, 28 - wob, 'magma')
    for (x, y, rx, ry) in ((15, 34, 7, 8), (63, 34, 7, 8), (20, 60, 8, 5), (58, 62, 8, 5), (39, 22, 9, 4)): g.ellipse(x, y, rx, ry, 'crust')
    for (x0, y0, x1, y1) in ((12, 30, 18, 40), (66, 30, 60, 40), (34, 22, 44, 23), (18, 60, 24, 61)): g.line(x0, y0, x1, y1, 'magma', 0.5)
    g.poly([(24, 33), (35, 36), (34, 41), (25, 41)], 'void'); g.poly([(54, 33), (43, 36), (44, 41), (53, 41)], 'void'); g.put(30, 38, 'eye'); g.put(48, 38, 'eye'); g.put(31, 37, 'eye'); g.put(49, 37, 'eye')
    g.poly([(26, 48), (52, 48), (46, 56), (32, 56)], 'void'); g.put(39, 54, 'magma')
    for x in (30, 36, 42, 48): g.poly([(x, 48), (x + 3, 48), (x + 1.5, 51)], 'tooth')
    for i, x in enumerate((20, 34, 46, 60)): g.poly([(x - 3, 20 - (i % 2) * 2 - f * 2), (x, 6 + (i % 2) * 4 - f * 3), (x + 3, 20 - (i % 2) * 2 - f * 2)], 'flame')
    for x in (22, 40, 58): g.line(x, 70, x + (f * 2 - 1), 73, 'drip', 0.6)
    pal = {'magma': ('#fff09a', '#ffb040', '#ff5a20'), 'crust': ('#4a2a20', '#2a1410', '#120604'), 'void': '#12040a', 'eye': '#fff6d8', 'tooth': '#f1e7d0', 'flame': ('#ffe36a', '#ff7a30', '#c4121c'), 'drip': '#ffb040'}
    return g, pal

BOSSES = {
    'beast': (beast, 2), 'demon': (demon, 2), 'sperm': (sperm, 2), 'pig': (pig, 2), 'cowpig': (cowpig, 2),
    'blum': (lambda f: blum(f), 2), 'blum2': (lambda f: blum(f, True), 2), 'moon': (moon, 2), 'ratking': (ratking, 2), 'boner': (boner, 2), 'hotload': (hotload, 2),
}
LEFTY = {'pig': pig, 'cowpig': cowpig}  # writing on them: separate left-facing frames

from props import PROPS

def main():
    frames = {}; rows = []
    for k, fn in PROPS.items():
        g, pal = fn(); frames['p_' + k] = render(g, pal)
    for k, (fn, n) in ENEMIES.items():
        row = []
        for i in range(n):
            g, pal = fn(i); im = render(g, pal); frames['f_%s_%d' % (k, i)] = im; row.append(im)
        rows.append(row)
    brow = []
    for k, (fn, n) in BOSSES.items():
        for i in range(n):
            g, pal = fn(i); im = render(g, pal); frames['f_%s_%d' % (k, i)] = im; brow.append(im)
            if k in LEFTY:
                g2, pal2 = LEFTY[k](i, True); frames['f_%s_%dL' % (k, i)] = render(g2, pal2)
    sheet, pos = pack(frames)
    sheet.save(os.path.join(HERE, 'foes.png'), optimize=True)
    json.dump({'frames': pos}, open(os.path.join(HERE, 'foes.json'), 'w'), separators=(',', ':'))
    # preview: rows of 4 enemies side by side
    flat = []; cur = []
    for r in rows:
        cur += r + []
        if len(cur) >= 16: flat.append(cur); cur = []
    if cur: flat.append(cur)
    preview(flat, os.path.join(HERE, 'preview.png'), 4)
    preview([brow[:6], brow[6:10] + [frames['f_pig_0L'], frames['f_cowpig_0L']], brow[10:]], os.path.join(HERE, 'preview_bosses.png'), 3)
    pk = [frames['p_' + k] for k in PROPS]; preview([pk[:8], pk[8:16], pk[16:]], os.path.join(HERE, 'preview_props.png'), 3)
    print('frames', len(frames), 'sheet', sheet.size)

if __name__ == '__main__':
    main()
