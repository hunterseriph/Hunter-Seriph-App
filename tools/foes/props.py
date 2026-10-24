"""Shaded props for Load Legacy (chests, doors, altars, stalls, flume boats, shrine, slot machine, cells, feast table,
chandelier, bounce pad, furnace vent, saw blade). Same pixel style as the enemies: bevel shading and the house outline.
Imported by gen.py, which packs them into foes.png as frames named p_<name>."""
import math
from pixelkit import Grid
S = math.sin; C = math.cos
WOOD = ('#a8643a', '#6e3a1e', '#3a1a0c'); WOOD2 = ('#8a4e2c', '#5a2e16', '#2e1408'); IRON = ('#9a929a', '#5a545c', '#2a262c')
GOLD = ('#fff09a', '#ffc840', '#a8741a'); STONE = ('#7a6466', '#4e3c40', '#261c20'); STONER = ('#8a3a40', '#5a1e24', '#2e0a0e')
RED = ('#ff3a44', '#c4121c', '#6a0a10'); BLUMPU = ('#c08aff', '#7a2ad8', '#34106a'); BONE = ('#fff6e0', '#e0d0b0', '#9a8a6a'); BLACK = ('#3a2a30', '#1a1014', '#0c0608')

def chest(big, opened):
    w, h = (28, 22) if big else (20, 16); g = Grid(w, h + (6 if opened else 0)); oy = 6 if opened else 0
    bh = h - (8 if big else 6)
    g.rect(1, oy + h - bh, w - 2, bh - 1, 'wood')
    for x in range(2, w - 2, 5): g.rect(x, oy + h - bh + 1, 1, bh - 3, 'grain')
    g.rect(1, oy + h - bh, w - 2, 2, 'band'); g.rect(1, oy + h - 3, w - 2, 2, 'band')
    g.rect(3, oy + h - bh, 2, bh - 1, 'band'); g.rect(w - 5, oy + h - bh, 2, bh - 1, 'band')
    if opened:
        g.poly([(1, oy + h - bh), (w - 2, oy + h - bh), (w - 4, 2), (3, 2)], 'lid')
        g.rect(3, 3, w - 7, 2, 'band')
        g.rect(4, oy + h - bh - 2, w - 8, 3, 'gold'); g.put(8, oy + h - bh - 3, 'glint'); g.put(w - 9, oy + h - bh - 3, 'glint')
    else:
        lh = 7 if big else 5
        g.ellipse(w / 2 - 0.5, oy + h - bh + 0.5, (w - 2) / 2, lh, 'lid', fn=lambda x, y: 'lid' if y < oy + h - bh else None)
        g.rect(1, oy + h - bh - 1, w - 2, 2, 'band')
        g.rect(w // 2 - 2, oy + h - bh - 1, 4, 5, 'gold'); g.put(w // 2 - 1, oy + h - bh + 1, 'keyhole')
    return g, {'wood': WOOD, 'grain': '#4a2410', 'band': IRON, 'lid': WOOD2, 'gold': GOLD, 'glint': '#ffffff', 'keyhole': '#12040a'}

def door(blum=False):
    g = Grid(56, 70)
    g.poly([(2, 70), (2, 24), (8, 10), (28, 2), (48, 10), (54, 24), (54, 70)], 'stone')
    for y in range(6, 70, 8):
        for x in range(2 + (y // 8 % 2) * 6, 54, 12): g.line(x, y, x + 9, y, 'mortar', 0.4)
    g.poly([(10, 70), (10, 28), (15, 17), (28, 11), (41, 17), (46, 28), (46, 70)], 'void')
    g.poly([(12, 70), (12, 29), (16, 19), (27, 14), (27, 70)], 'wood'); g.poly([(29, 70), (29, 14), (40, 19), (44, 29), (44, 70)], 'wood')
    for x in (16, 21, 34, 39): g.line(x, 22, x, 69, 'grain', 0.4)
    for y in (32, 54): g.rect(12, y, 33, 3, 'band')
    for y in (33, 55):
        for x in (14, 20, 25, 32, 37, 42): g.put(x, y, 'stud')
    g.rect(24, 42, 3, 4, 'ring'); g.rect(30, 42, 3, 4, 'ring')
    g.ellipse(28, 7, 6, 5.5, 'skull' if not blum else 'blumface'); g.rect(25, 11, 7, 3, 'skull' if not blum else 'blumface')
    g.put(26, 7, 'eye'); g.put(30, 7, 'eye'); g.put(25, 7, 'eye'); g.put(31, 7, 'eye')
    for x in (26, 28, 30): g.put(x, 13, 'void')
    for i, y in enumerate(range(26, 64, 9)): g.put(7, y, 'rune'); g.put(49, y + 4, 'rune')
    return g, {'stone': STONE if not blum else STONER, 'mortar': '#1a1014', 'void': '#12040a', 'wood': WOOD2 if not blum else RED, 'grain': '#2e1408' if not blum else '#5a0a10', 'band': IRON,
               'stud': '#d8d0d8', 'ring': GOLD, 'skull': BONE, 'blumface': RED, 'eye': '#ff2630', 'rune': '#ff2630'}

def altar():
    g = Grid(40, 30)
    g.rect(2, 24, 36, 6, 'stone'); g.rect(6, 18, 28, 7, 'stone'); g.rect(11, 6, 18, 13, 'stone2'); g.rect(7, 2, 26, 5, 'stone')
    for y in (9, 13): g.line(14, y, 25, y, 'rune', 0.4)
    g.put(19, 15, 'rune'); g.put(20, 15, 'rune'); g.line(4, 27, 35, 27, 'mortar', 0.4); g.line(8, 21, 31, 21, 'mortar', 0.4)
    g.rect(16, 0, 8, 3, 'gold')
    return g, {'stone': STONE, 'stone2': ('#8a7476', '#5e4a4e', '#2e2226'), 'rune': '#7a8aff', 'mortar': '#1a1014', 'gold': GOLD}

def turret():
    g = Grid(20, 18)
    g.rect(0, 2, 6, 14, 'mount'); g.ellipse(10, 9, 7, 7, 'skull'); g.rect(8, 13, 7, 4, 'skull')
    g.ellipse(8, 8, 2, 2, 'void'); g.ellipse(13, 8, 2, 2, 'void'); g.put(8, 8, 'eye'); g.put(13, 8, 'eye')
    g.rect(16, 7, 4, 5, 'barrel'); g.put(19, 9, 'void'); for_ = [g.put(x, 15, 'void') for x in (9, 11, 13)]
    return g, {'mount': IRON, 'skull': BONE, 'void': '#12040a', 'eye': '#ff2630', 'barrel': IRON}

def stall():
    g = Grid(64, 22)
    g.rect(1, 2, 62, 4, 'top'); g.rect(3, 6, 58, 15, 'cloth')
    for x in range(5, 60, 8): g.poly([(x, 6), (x + 4, 6), (x + 2, 10)], 'trim')
    g.rect(3, 19, 58, 2, 'top')
    for i, x in enumerate((8, 20, 44, 54)): g.rect(x, 0, 5, 3, ['jar', 'gold', 'jar', 'gold'][i])
    return g, {'top': WOOD, 'cloth': RED, 'trim': '#ffe36a', 'jar': ('#c4f0ff', '#6ab8d8', '#386a8a'), 'gold': GOLD}

def logboat():
    g = Grid(60, 20)
    g.ellipse(26, 12, 25, 6.5, 'log'); g.ellipse(2, 12, 2.5, 6, 'end'); g.put(2, 12, 'ring')
    for x in range(8, 44, 7): g.line(x, 7, x + 3, 7, 'bark', 0.4); g.line(x + 2, 16, x + 5, 16, 'bark', 0.4)
    g.rect(18, 5, 12, 3, 'seat')
    g.ellipse(52, 9, 6.5, 7, 'steve'); g.poly([(48, 4), (52, -1), (55, 4)], 'steve')
    g.put(51, 7, 'eye'); g.put(54, 7, 'eye'); g.line(49, 11, 56, 11, 'eye', 0.4); g.put(50, 10, 'eye'); g.put(56, 10, 'eye')
    return g, {'log': WOOD, 'end': ('#e0b080', '#b07a4a', '#6a4220'), 'ring': '#6a4220', 'bark': '#3a1a0c', 'seat': RED, 'steve': BLACK, 'eye': '#ff2630'}

def shrine(dry):
    g = Grid(44, 54)
    g.rect(14, 34, 16, 20, 'stone'); g.ellipse(22, 34, 20, 6, 'stone2'); g.ellipse(22, 33, 17, 4, 'blood' if not dry else 'dry')
    g.rect(19, 8, 6, 26, 'stone'); g.ellipse(22, 8, 8, 4, 'stone2'); g.ellipse(22, 7, 6, 2.5, 'blood' if not dry else 'dry')
    g.ellipse(22, 2, 3, 3, 'gem' if not dry else 'stone2')
    for y in (16, 24): g.line(19, y, 24, y, 'mortar', 0.4)
    if not dry:
        for x in (15, 29): g.line(x, 9, x, 30, 'blood', 0.5)
    return g, {'stone': STONE, 'stone2': ('#8a7476', '#5e4a4e', '#2e2226'), 'blood': RED, 'dry': '#2a0509', 'gem': RED, 'mortar': '#1a1014'}

def slot():
    g = Grid(34, 48)
    g.rect(2, 4, 26, 44, 'body'); g.ellipse(15, 5, 13, 5, 'body'); g.rect(4, 14, 22, 13, 'void'); g.rect(5, 15, 20, 11, 'glass')
    g.rect(4, 32, 22, 6, 'gold'); g.rect(6, 40, 18, 4, 'void'); g.rect(29, 14, 3, 18, 'lever'); g.ellipse(30.5, 12, 3, 3, 'knob')
    for x in (5, 25): g.line(x, 6, x, 46, 'trim', 0.4)
    return g, {'body': RED, 'void': '#12040a', 'glass': '#f1e7d0', 'gold': GOLD, 'lever': IRON, 'knob': RED, 'trim': '#ffe36a'}

def cell(opened):
    g = Grid(52, 58)
    g.rect(0, 0, 52, 6, 'stone'); g.rect(0, 0, 5, 58, 'stone'); g.rect(47, 0, 5, 58, 'stone')
    for y in range(8, 58, 9): g.line(0, y, 4, y, 'mortar', 0.4); g.line(47, y, 51, y, 'mortar', 0.4)
    if not opened:
        for x in range(8, 46, 6): g.rect(x, 6, 2, 52, 'bar')
        g.rect(5, 26, 42, 3, 'bar'); g.rect(22, 24, 8, 9, 'lock'); g.put(26, 28, 'void')
    else:
        g.rect(44, 6, 2, 52, 'bar'); g.rect(40, 6, 2, 52, 'bar')
    return g, {'stone': STONE, 'mortar': '#1a1014', 'bar': IRON, 'lock': GOLD, 'void': '#12040a'}

def feast(ate):
    g = Grid(86, 32)
    g.rect(2, 14, 82, 6, 'top'); g.rect(2, 18, 82, 4, 'cloth')
    for x in range(4, 82, 6): g.poly([(x, 22), (x + 3, 22), (x + 1.5, 25)], 'cloth')
    for x in (6, 76): g.rect(x, 20, 4, 12, 'leg')
    for i, x in enumerate((16, 43, 70)):
        g.ellipse(x, 13, 8, 2.5, 'plate')
        if not ate:
            col = ['meat', 'pie', 'wings'][i]; g.ellipse(x, 10, 5.5, 4, col)
            if i == 0: g.line(x + 4, 6, x + 7, 3, 'plate', 0.5)
    g.rect(29, 2, 3, 11, 'candle'); g.rect(55, 4, 3, 9, 'candle')
    return g, {'top': WOOD, 'cloth': RED, 'leg': WOOD2, 'plate': ('#ffffff', '#e8dcc8', '#a8987a'), 'meat': ('#c87a4a', '#8a4a1a', '#4a2008'), 'pie': ('#ffd890', '#c8903a', '#6a4010'),
               'wings': ('#ff7a40', '#c4421c', '#6a1a08'), 'candle': ('#ffffff', '#f1e7d0', '#a8987a')}

def chand():
    g = Grid(30, 20)
    g.rect(14, 0, 2, 6, 'chain'); g.ellipse(15, 12, 13, 3, 'gold'); g.rect(12, 6, 6, 8, 'gold'); g.ellipse(15, 17, 3, 2, 'gold')
    for x in (3, 15, 27): g.rect(x - 1, 4, 3, 7, 'candle'); g.rect(x - 2, 10, 5, 2, 'gold')
    for x in (8, 22): g.put(x, 14, 'gem')
    return g, {'chain': IRON, 'gold': GOLD, 'candle': ('#ffffff', '#f1e7d0', '#a8987a'), 'gem': '#ff2630'}

def pad(sq):
    g = Grid(24, 14)
    g.rect(1, 9, 22, 5, 'base'); top = 6 + sq * 3
    for x in (5, 11, 17): g.line(x, 9, x + 2, top + 2, 'spring', 0.6)
    g.rect(0, top, 24, 3, 'plate'); g.line(2, top, 21, top, 'shine', 0.4)
    return g, {'base': BLACK, 'spring': IRON, 'plate': RED, 'shine': '#ff9a9a'}

def vent():
    g = Grid(22, 8)
    g.rect(0, 2, 22, 6, 'iron')
    for x in range(3, 20, 4): g.rect(x, 3, 2, 4, 'glow')
    return g, {'iron': IRON, 'glow': '#ff5a20'}

def saw(f):
    g = Grid(30, 30); a0 = f * math.pi / 16
    pts = []
    for i in range(32):
        r = 14 if i % 2 == 0 else 10.5; a = a0 + i * math.pi / 16; pts.append((15 + C(a) * r, 15 + S(a) * r))
    g.poly(pts, 'blade'); g.ellipse(15, 15, 5, 5, 'hub'); g.ellipse(15, 15, 2, 2, 'bolt')
    for i in range(4): a = a0 + i * math.pi / 2; g.line(15 + C(a) * 6, 15 + S(a) * 6, 15 + C(a) * 9, 15 + S(a) * 9, 'groove', 0.4)
    return g, {'blade': ('#e8e4ec', '#a8a0aa', '#5a545c'), 'hub': IRON, 'bolt': RED, 'groove': '#3a343c'}

def creampool():
    g = Grid(40, 8)
    g.ellipse(20, 5, 19, 3, 'cream'); g.ellipse(9, 4, 6, 2.5, 'cream'); g.ellipse(30, 4.5, 7, 2.5, 'cream')
    g.ellipse(14, 4, 3, 1, 'shine'); g.ellipse(28, 4, 2, 0.8, 'shine'); g.put(20, 2, 'bubble'); g.put(33, 3, 'bubble')
    return g, {'cream': ('#fffbe8', '#f1e0b0', '#b8a070'), 'shine': '#ffffff', 'bubble': '#fffbe8'}

def skulls():
    g = Grid(34, 20)
    for (x, y, r) in ((8, 14, 5), (18, 15, 5.5), (27, 14, 5), (13, 8, 4.5), (23, 8, 4.5), (18, 3, 3.5)):
        g.ellipse(x, y, r, r * 0.9, 'bone'); g.rect(int(x - r * 0.5), int(y + r * 0.5), int(r), 2, 'bone')
        g.put(int(x - r * 0.4), int(y), 'void'); g.put(int(x + r * 0.3), int(y), 'void'); g.put(int(x), int(y + r * 0.5), 'void')
    g.line(1, 19, 33, 19, 'bone', 0.5)
    return g, {'bone': BONE, 'void': '#12040a'}

def ribs():
    g = Grid(44, 40)
    g.line(4, 39, 8, 6, 'bone', 1.2); g.line(8, 6, 22, 1, 'bone', 1.2); g.line(22, 1, 36, 6, 'bone', 1.2); g.line(36, 6, 40, 39, 'bone', 1.2)
    for i in range(4):
        y = 10 + i * 7; g.line(9 - i * 0.3, y, 18, y + 4, 'bone', 0.7); g.line(35 + i * 0.3, y, 26, y + 4, 'bone', 0.7)
    g.rect(21, 2, 2, 37, 'spine')
    for y in range(4, 38, 4): g.rect(20, y, 4, 2, 'spine')
    return g, {'bone': BONE, 'spine': ('#e0d0b0', '#b8a888', '#7a6a4a')}

def crucible():
    g = Grid(28, 24)
    g.poly([(2, 8), (26, 8), (22, 22), (6, 22)], 'iron'); g.rect(1, 6, 26, 3, 'rim')
    g.ellipse(14, 7, 11, 2, 'lava'); g.ellipse(11, 6.5, 3, 1, 'hot'); g.rect(5, 22, 3, 2, 'iron'); g.rect(20, 22, 3, 2, 'iron')
    g.rect(24, 9, 3, 5, 'lava'); g.rect(25, 14, 1, 6, 'lava')
    for x in (8, 14, 20): g.put(x, 15, 'rivet')
    return g, {'iron': ('#6a5a5a', '#3a2e2e', '#1a1212'), 'rim': ('#8a7a7a', '#4e4242', '#241c1c'), 'lava': ('#ffd060', '#ff7a20', '#a8300a'), 'hot': '#fff6d8', 'rivet': '#ffb040'}

def tallsign():
    """Steve's 'you must be this tall to ride' sign"""
    g = Grid(26, 56)
    g.rect(11, 14, 3, 42, 'post'); g.rect(7, 53, 11, 3, 'post')
    g.line(13, 24, 22, 24, 'arm', 0.7); g.rect(21, 22, 3, 4, 'arm')
    g.ellipse(12, 9, 9, 8, 'steve'); g.poly([(12, -1), (8, 4), (16, 4)], 'steve')
    g.ellipse(9, 8, 1.6, 2, 'eye'); g.ellipse(15, 8, 1.6, 2, 'eye'); g.line(7, 12, 17, 12, 'grin', 0.6); g.line(8, 13, 16, 13, 'teeth', 0.4)
    return g, {'post': ('#3a2a30', '#1a1014', '#0c0608'), 'arm': ('#3a2a30', '#1a1014', '#0c0608'), 'steve': ('#3a2a30', '#140a0e', '#060204'), 'eye': '#ff2630', 'grin': '#ff2630', 'teeth': '#f1e7d0'}

def hatchery():
    """the Homunculus Hatchery: a low brick nursery with a mossy roof, a big glass front and a heat lamp"""
    g = Grid(110, 94)
    g.rect(4, 26, 102, 68, 'brick')
    for y in range(28, 94, 6):
        for x in range(4 + (y // 6 % 2) * 6, 106, 12): g.line(x, y, x + 10, y, 'mortar', 0.4)
    g.poly([(0, 28), (55, 2), (110, 28), (104, 32), (55, 9), (6, 32)], 'roof')
    g.poly([(8, 30), (55, 10), (102, 30)], 'roof2')
    for i in range(6): g.line(14 + i * 15, 27 - (i if i < 3 else 5 - i) * 4, 18 + i * 15, 30 - (i if i < 3 else 5 - i) * 4, 'moss', 0.5)
    g.ellipse(55, 20, 6, 6, 'frame'); g.ellipse(55, 20, 4, 4, 'glass'); g.put(53, 18, 'shine')
    g.rect(14, 40, 82, 38, 'frame'); g.rect(16, 42, 78, 34, 'glass')
    for x in (42, 68): g.rect(x, 42, 2, 34, 'frame')
    g.rect(16, 70, 78, 6, 'straw'); 
    for x in range(17, 93, 3): g.put(x, 69, 'straw')
    g.line(18, 44, 26, 52, 'shine', 0.4); g.line(46, 44, 52, 50, 'shine', 0.4)
    g.rect(49, 42, 12, 4, 'lamp'); g.rect(53, 40, 4, 2, 'frame')
    g.rect(44, 80, 22, 14, 'door'); g.rect(46, 82, 18, 12, 'door2'); g.put(61, 88, 'knob')
    g.rect(10, 80, 4, 14, 'frame'); g.rect(96, 80, 4, 14, 'frame')
    return g, {'brick': ('#6a3022', '#4a1e16', '#2a0e0a'), 'mortar': '#22080a', 'roof': ('#4a8a2a', '#2a5a16', '#12300a'), 'roof2': ('#3a7a20', '#245010', '#102a06'), 'moss': '#7dff3a',
               'frame': ('#8a6a46', '#5a4632', '#2e2018'), 'glass': ('#3a5a2a', '#1e3a16', '#0e1e0a'), 'shine': '#b8ffa0', 'straw': ('#ffe080', '#d8a840', '#8a6420'), 'lamp': ('#ffe36a', '#ff9a30', '#a8501a'),
               'door': ('#5a3a24', '#3a2416', '#1e120a'), 'door2': ('#6a4630', '#4a2e1c', '#24160c'), 'knob': '#ffe36a'}

def emptylot():
    """an empty lot: a picket fence, a mound of dirt with weeds, and a FOR SALE board on a post (text drawn in game)"""
    g = Grid(84, 64)
    g.ellipse(42, 62, 40, 4, 'dirt'); g.ellipse(20, 61, 6, 2, 'dirt2'); g.ellipse(62, 61, 7, 2, 'dirt2')
    for x in range(4, 82, 8): g.poly([(x, 50), (x + 1, 47), (x + 2, 50)], 'pick'); g.rect(x, 50, 3, 13, 'pick')
    g.rect(2, 52, 80, 2, 'rail'); g.rect(2, 58, 80, 2, 'rail')
    for (x, h) in ((14, 5), (31, 4), (55, 6), (70, 4)): g.line(x, 63, x - 1, 63 - h, 'weed', 0.4); g.line(x, 63, x + 2, 63 - h + 1, 'weed', 0.4)
    g.rect(40, 22, 4, 41, 'post')
    g.rect(12, 0, 60, 24, 'board'); g.rect(14, 2, 56, 20, 'board2')
    for y in (8, 15): g.line(14, y, 69, y, 'grain', 0.3)
    for (x, y) in ((14, 2), (68, 2), (14, 20), (68, 20)): g.put(x, y, 'nail')
    return g, {'dirt': ('#4a2a1a', '#2e1a10', '#1a0c06'), 'dirt2': ('#5a3a24', '#3a2416', '#1e120a'), 'pick': ('#8a7a6a', '#5a4a3a', '#2e241c'), 'rail': ('#6a5a4a', '#4a3a2a', '#24180e'),
               'weed': '#3a6a1a', 'post': ('#6a4630', '#4a2e1c', '#24160c'), 'board': ('#8a5a2a', '#6a3e1a', '#3a200c'), 'board2': ('#7a4e24', '#5a3818', '#2e1a0a'), 'grain': '#4a2a10', 'nail': '#c8c0b0'}

def lairheart(beat):
    """a beating Blum heart, veins running into the floor"""
    g = Grid(44, 48); k = 2 if beat else 0
    for x in (6, 14, 30, 38): g.line(22, 40, x, 47, 'vein', 1)
    g.ellipse(15, 20, 11 + k, 12 + k, 'heart'); g.ellipse(29, 20, 11 + k, 12 + k, 'heart'); g.poly([(4 - k, 24), (40 + k, 24), (22, 44 + k)], 'heart')
    g.rect(16, 2 - k, 5, 10, 'tube'); g.rect(24, 4 - k, 4, 8, 'tube')
    for (x0, y0, x1, y1) in ((12, 14, 18, 30), (30, 12, 26, 32), (22, 26, 22, 40)): g.line(x0, y0, x1, y1, 'vein2', 0.5)
    g.ellipse(13, 15, 3, 2, 'shine')
    return g, {'vein': ('#c4121c', '#8a0a14', '#4a060a'), 'heart': ('#ff5a64', '#c4121c', '#5a0810'), 'tube': BLUMPU, 'vein2': '#6a0a12', 'shine': '#ffd0d4'}

def walleye(shut):
    """a huge eye grown into the wall of the lair"""
    g = Grid(56, 40)
    g.ellipse(28, 20, 27, 19, 'flesh')
    g.ellipse(28, 20, 21, 13, 'ball')
    if shut: g.ellipse(28, 20, 22, 14, 'lid'); g.line(8, 20, 48, 20, 'lash', 0.6)
    else: g.ellipse(28, 20, 9, 9, 'iris'); g.ellipse(28, 20, 4, 6, 'pupil'); g.put(25, 16, 'glint'); g.put(26, 16, 'glint')
    for (x0, y0, x1, y1) in ((8, 16, 14, 19), (48, 15, 42, 19), (12, 27, 17, 24), (44, 27, 39, 24)):
        if not shut: g.line(x0, y0, x1, y1, 'vein', 0.4)
    return g, {'flesh': ('#8a2a3a', '#5a1424', '#2a060e'), 'ball': ('#fff6e8', '#e0d0c8', '#9a7a7a'), 'lid': ('#a83a4a', '#6a1a2a', '#300810'), 'lash': '#12040a',
               'iris': BLUMPU, 'pupil': '#12040a', 'glint': '#ffffff', 'vein': '#c4121c'}

PROPS = {
    'chest': lambda: chest(False, False), 'chestopen': lambda: chest(False, True), 'bigchest': lambda: chest(True, False), 'bigchestopen': lambda: chest(True, True),
    'door': lambda: door(False), 'blumdoor': lambda: door(True), 'altar': altar, 'turret': turret, 'stall': stall, 'logboat': logboat,
    'shrine': lambda: shrine(False), 'shrinedry': lambda: shrine(True), 'slot': slot, 'cell': lambda: cell(False), 'cellopen': lambda: cell(True),
    'feast': lambda: feast(False), 'feastate': lambda: feast(True), 'chand': chand, 'pad0': lambda: pad(0), 'pad1': lambda: pad(1), 'vent': vent,
    'saw0': lambda: saw(0), 'saw1': lambda: saw(1), 'creampool': creampool, 'skulls': skulls, 'ribs': ribs, 'crucible': crucible, 'tallsign': tallsign, 'hatchery': hatchery, 'emptylot': emptylot, 'heart0': lambda: lairheart(0), 'heart1': lambda: lairheart(1), 'walleye': lambda: walleye(0), 'walleyeshut': lambda: walleye(1),
}
