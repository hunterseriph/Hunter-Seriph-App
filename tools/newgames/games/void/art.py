"""Journey to the Void's own art: the Void itself (the last boss) and its spawn, the places on the world map
(town, castle, cave, tower, lair, the Void gate), a save crystal, the three keys and the town buildings."""
import math
from pixelkit import Grid
USE = ['ch_idle*', 'ch_walk*', 'ch_attack', 'ch_hurt0', 'ch_death*', 'ch_icon0', 'ch_jump1', 'spermaid_*', 'greebo_*', 'npc_*', 'steve0', 'steve1', 'cumface',
       'f_*', 'p_chest', 'p_chestopen', 'p_bigchest', 'p_bigchestopen', 'p_door', 'p_blumdoor', 'p_shrine', 'h_gloop_baby_idle0', 'h_blood_adult_idle0']
RED = ('#ff3a44', '#c4121c', '#6a0a10'); GOLD = ('#fff09a', '#ffc840', '#a8741a'); BLACK = ('#4a3a40', '#221a1e', '#0c0608'); PURP = ('#c08aff', '#7a2ad8', '#34106a')
STONE = ('#8a6a6e', '#5a4044', '#2e1c20'); WHITE = ('#ffffff', '#e8dcc8', '#a8987a'); CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); WOOD = ('#a8643a', '#6e3a1e', '#3a1a0c')
VOIDC = ('#3a2a4a', '#140a1c', '#000000')

def void(f):
    g = Grid(150, 140); t = f * 0.4
    for i in range(14):  # tendrils
        a = i / 14 * math.pi * 2 + t; r0 = 40; r1 = 64 + (i % 3) * 6
        g.line(75 + math.cos(a) * r0, 70 + math.sin(a) * r0, 75 + math.cos(a + 0.3) * r1, 70 + math.sin(a + 0.3) * r1, 'ten', 3)
    g.ellipse(75, 70, 48, 46, 'ring'); g.ellipse(75, 70, 40, 38, 'void')
    for i in range(10):
        a = i / 10 * math.pi * 2 - t; g.ellipse(75 + math.cos(a) * 28, 70 + math.sin(a) * 26, 3, 3, 'star')
    g.ellipse(75, 62, 15, 11, 'white'); g.ellipse(75, 63, 6, 9, 'iris'); g.ellipse(75, 63, 2.5, 6, 'pupil'); g.put(72, 58, 'glint')
    g.poly([(52, 84), (98, 84), (92, 96), (58, 96)], 'mouth')
    for x in range(54, 96, 5): g.poly([(x, 84), (x + 2.5, 90), (x + 5, 84)], 'teeth')
    return g, {'ten': VOIDC, 'ring': PURP, 'void': VOIDC, 'star': '#ffe36a', 'white': '#fff6e8', 'iris': RED, 'pupil': '#000000', 'glint': '#ffffff', 'mouth': '#2a0408', 'teeth': '#f1e7d0'}

def spawn(f):
    g = Grid(34, 36); s = [0, 2][f]
    g.ellipse(17, 18, 14, 14 + s * 0.5, 'b'); g.ellipse(17, 16, 6, 6, 'w'); g.ellipse(17, 16, 3, 3, 'i'); g.put(17, 16, 'p')
    for i in range(4): g.line(6 + i * 7, 28, 4 + i * 8 + s, 35, 'b', 1)
    return g, {'b': VOIDC, 'w': '#fff6e8', 'i': PURP, 'p': '#000000'}

def place(kind):
    g = Grid(24, 24)
    if kind == 'town':
        for x0, h in ((1, 10), (9, 14), (16, 9)):
            g.rect(x0, 23 - h, 7, h, 'wall'); g.poly([(x0 - 1, 23 - h), (x0 + 3.5, 18 - h), (x0 + 8, 23 - h)], 'roof'); g.rect(x0 + 2, 19, 2, 4, 'door')
        return g, {'wall': ('#d8c0a0', '#a88a6a', '#5a4a3a'), 'roof': RED, 'door': '#12040a'}
    if kind == 'park':
        g.ellipse(12, 12, 10, 10, 'wheel'); g.ellipse(12, 12, 8, 8, None); g.line(12, 2, 12, 22, 'wheel', 0.4); g.line(2, 12, 22, 12, 'wheel', 0.4); g.poly([(6, 23), (12, 12), (18, 23)], 'leg')
        for a in range(8): g.put(12 + math.cos(a * 0.785) * 10, 12 + math.sin(a * 0.785) * 10, 'bulb')
        return g, {'wheel': RED, 'leg': BLACK, 'bulb': '#ffe36a'}
    if kind == 'castle':
        g.rect(2, 10, 20, 13, 'w'); g.rect(1, 4, 6, 19, 'w'); g.rect(17, 4, 6, 19, 'w')
        for x in (1, 3, 5, 17, 19, 21): g.rect(x, 2, 1, 2, 'w')
        g.rect(9, 15, 6, 8, 'door'); g.rect(3, 8, 2, 3, 'win'); g.rect(19, 8, 2, 3, 'win'); return g, {'w': STONE, 'door': '#12040a', 'win': '#ffe36a'}
    if kind == 'cave':
        g.ellipse(12, 16, 11, 9, 'rock'); g.ellipse(12, 19, 6, 6, 'hole'); g.rect(6, 19, 12, 5, 'hole'); return g, {'rock': STONE, 'hole': '#12040a'}
    if kind == 'sewer':
        g.ellipse(12, 14, 10, 10, 'pipe'); g.ellipse(12, 14, 7, 7, 'hole'); g.rect(5, 18, 14, 6, 'cream'); return g, {'pipe': ('#9a929a', '#5a545c', '#2a262c'), 'hole': '#12040a', 'cream': CREAM}
    if kind == 'bone':
        g.ellipse(12, 14, 9, 9, 'skull'); g.rect(8, 18, 8, 5, 'skull'); g.ellipse(9, 13, 2.5, 3, 'eye'); g.ellipse(15, 13, 2.5, 3, 'eye'); g.rect(11, 19, 2, 4, 'eye'); return g, {'skull': WHITE, 'eye': '#12040a'}
    if kind == 'tower':
        g.rect(8, 6, 8, 17, 'w'); g.poly([(6, 7), (12, 0), (18, 7)], 'roof'); g.ellipse(12, 3, 3, 3, 'moon'); g.rect(10, 16, 4, 7, 'door'); return g, {'w': ('#6a2a3a', '#4a1424', '#24060e'), 'roof': BLACK, 'moon': RED, 'door': '#12040a'}
    if kind == 'lair':
        g.ellipse(12, 15, 11, 9, 'flesh'); g.ellipse(12, 18, 5, 5, 'hole'); g.rect(7, 18, 10, 6, 'hole'); g.ellipse(7, 11, 2, 2, 'eye'); g.ellipse(17, 11, 2, 2, 'eye'); return g, {'flesh': ('#a83a5a', '#6a1a3a', '#30081a'), 'hole': '#12040a', 'eye': '#ffe36a'}
    if kind == 'gate':
        g.ellipse(12, 12, 11, 11, 'ring'); g.ellipse(12, 12, 8, 8, 'v'); g.put(12, 12, 'star'); return g, {'ring': PURP, 'v': VOIDC, 'star': '#ffe36a'}
    if kind == 'clubhouse':
        g.rect(2, 9, 20, 14, 'wall'); g.poly([(0, 10), (12, 1), (24, 10)], 'roof'); g.rect(10, 16, 4, 7, 'door'); g.rect(4, 12, 4, 3, 'win'); g.rect(16, 12, 4, 3, 'win'); return g, {'wall': ('#d8c0a0', '#a88a6a', '#5a4a3a'), 'roof': RED, 'door': '#12040a', 'win': '#ffe36a'}

def crystal(f):
    g = Grid(18, 30); y0 = f
    g.poly([(9, 0 + y0), (17, 12 + y0), (9, 24 + y0), (1, 12 + y0)], 'c'); g.line(9, 1 + y0, 9, 23 + y0, 'hi', 0.3); g.ellipse(9, 28, 7, 2, 'base')
    return g, {'c': ('#ffd0d0', '#ff3a44', '#8a0a14'), 'hi': '#ffffff', 'base': BLACK}

def key(col):
    g = Grid(10, 20); g.ellipse(5, 5, 4.5, 4.5, 'k'); g.ellipse(5, 5, 1.8, 1.8, None); g.rect(4, 9, 2, 10, 'k'); g.rect(6, 14, 3, 1, 'k'); g.rect(6, 17, 3, 1, 'k')
    return g, {'k': col}

def house(w, h, roof):
    g = Grid(w, h)
    g.rect(2, h // 3, w - 4, h - h // 3, 'wall'); g.poly([(0, h // 3 + 1), (w / 2, 0), (w, h // 3 + 1)], 'roof')
    g.rect(w // 2 - 4, h - 14, 8, 14, 'door'); g.rect(6, h // 3 + 8, 8, 7, 'win'); g.rect(w - 14, h // 3 + 8, 8, 7, 'win')
    for x in range(4, w - 4, 8): g.rect(x, h // 3 + 2, 1, h - h // 3 - 2, 'beam')
    return g, {'wall': ('#d8c0a0', '#a88a6a', '#5a4a3a'), 'roof': roof, 'door': WOOD, 'win': '#ffe36a', 'beam': '#6e3a1e'}

def tree():
    g = Grid(18, 24); g.rect(8, 12, 3, 12, 'trunk')
    for a, l in ((-2.2, 8), (-1.7, 9), (-1.2, 8), (-0.9, 7)): g.line(9, 13, 9 + math.cos(a) * l, 13 + math.sin(a) * l, 'trunk', 0.6); g.line(9, 13, 9 - math.cos(a) * l * 0.8, 13 + math.sin(a) * l, 'trunk', 0.6)
    return g, {'trunk': BLACK}

def mountain():
    g = Grid(18, 16); g.poly([(0, 16), (9, 1), (18, 16)], 'm'); g.poly([(6, 6), (9, 1), (12, 6), (9, 5)], 'snow'); return g, {'m': ('#6a4a5a', '#4a2a3a', '#24101a'), 'snow': '#f1e7d0'}

ART = {'jv_void0': lambda: void(0), 'jv_void1': lambda: void(1), 'jv_spawn0': lambda: spawn(0), 'jv_spawn1': lambda: spawn(1),
       'jv_crys0': lambda: crystal(0), 'jv_crys1': lambda: crystal(1), 'jv_keyc': lambda: key(CREAM), 'jv_keyb': lambda: key(WHITE), 'jv_keym': lambda: key(RED),
       'jv_houser': lambda: house(48, 44, RED), 'jv_housep': lambda: house(48, 44, PURP), 'jv_houseb': lambda: house(56, 48, ('#5a7aaa', '#2a4a7a', '#0a1a3a')), 'jv_tree': tree, 'jv_mtn': mountain}
for k in ('town', 'park', 'castle', 'cave', 'sewer', 'bone', 'tower', 'lair', 'gate', 'clubhouse'): ART['jv_pl_' + k] = (lambda k=k: place(k))
