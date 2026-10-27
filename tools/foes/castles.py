"""Foes and bosses for Load Legacy's two newer castles, in the same 16-bit style as gen.py (shaded parts, dark outline,
frames facing right). Blumhead's Castle is black, violet and sick red; Greebo's Grotto is cream, caramel and cherry,
with Sir Johnathan (Greebo's black and white cat) waiting at the end."""
import math
from pixelkit import Grid
S = math.sin; C = math.cos
BLACK = ('#3a2a30', '#1a1014', '#0c0608'); BLACKP = ('#4a3a54', '#241a2c', '#0e0a12'); VIO = ('#c08aff', '#7a2ad8', '#34106a')
BLUMR = ('#ff5a64', '#d01e2a', '#6a0a12'); GOLD = ('#fff09a', '#ffc840', '#a8741a'); BONE = ('#f1e7d0', '#c8b898', '#7a6a50')
CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); CRUST = ('#f0c070', '#c8862a', '#7a4410'); WOOD = ('#c8864a', '#8a5426', '#4a2a10')
CHERRY = ('#ff5a64', '#d01e2a', '#6a0a12'); GREY = ('#b0a8b0', '#706870', '#38323a'); GREEN = ('#9aff5a', '#4aa82a', '#1a5a10')

# ===================================================================== Blumhead's Castle: foes
def cultist(f):
    """a Blum cultist: violet hood, red eyes in the dark, a staff with a goo orb; frame 3 raises it to cast"""
    g = Grid(26, 34); sw = [0, 1, 0, -1][f]; cast = f == 3
    g.poly([(6, 33), (9, 12), (17, 12), (21, 33)], 'robe'); g.poly([(6 + sw, 33), (13, 30), (21 + sw, 33)], 'robe2')
    g.ellipse(13, 10, 6, 7, 'hood'); g.poly([(8, 8), (13, -1), (18, 8)], 'hood'); g.ellipse(14, 11, 3.5, 4, 'void'); g.put(13, 11, 'eye'); g.put(16, 11, 'eye')
    g.rect(9, 20, 9, 2, 'sash'); g.put(13, 21, 'gem')
    sx, sy = (21, 2) if cast else (22, 8)
    g.line(19, 22, sx, sy + 6, 'staff', 0.6); g.line(sx, sy + 6, sx, 33, 'staff', 0.6) if not cast else None
    g.ellipse(sx, sy + 3, 3, 3, 'orb'); g.put(sx - 1, sy + 2, 'glint')
    if cast:
        for a in range(6): g.put(sx + C(a) * 5, sy + 3 + S(a) * 5, 'spark')
    return g, {'robe': ('#5a2a7a', '#3a1458', '#1a0828'), 'robe2': ('#4a2068', '#2e1048', '#160620'), 'hood': ('#6a3a8a', '#44186a', '#200a34'), 'void': '#0a0408',
               'eye': '#ff2630', 'sash': BLUMR, 'gem': '#ffe36a', 'staff': WOOD, 'orb': VIO, 'glint': '#ffffff', 'spark': '#e0b0ff'}

def goohound(f):
    """a black hound of the keep, purple goo dripping from its jaws"""
    g = Grid(32, 22); ph = f * math.pi / 2
    g.ellipse(14, 10, 10, 5, 'fur'); g.line(5, 8, 1, 4 + (f % 2), 'fur', 1)
    for i, lx in enumerate((7, 11, 18, 22)):
        k = S(ph + i * 1.6) * 2.5; g.line(lx, 13, lx + k, 19, 'fur', 1); g.put(lx + k + 1, 20, 'claw')
    g.ellipse(25, 8, 6, 5, 'fur'); g.poly([(22, 4), (23, -1), (26, 4)], 'fur'); g.poly([(28, 7), (32, 9), (31, 12), (28, 12)], 'fur')
    g.poly([(28, 11), (31, 12), (29, 15)], 'maw'); g.put(29, 11, 'tooth'); g.put(30, 12, 'tooth')
    g.rect(26, 6, 2, 2, 'eye'); g.line(29, 15, 29, 18 + (f % 2), 'goo', 0.5)
    for (x, y) in ((10, 6), (16, 5), (13, 9)): g.put(x, y, 'spine')
    return g, {'fur': BLACK, 'claw': '#d8c8a8', 'maw': ('#ff3a44', '#a8101a', '#5a0408'), 'tooth': '#f1e7d0', 'eye': '#ff2630', 'goo': '#c08aff', 'spine': '#5a2a7a'}

def harpy(f):
    """a Blum harpy: a grey hag with violet wings and long talons"""
    g = Grid(34, 28); up = [-6, -1, 4, 0][f]
    for side in (-1, 1):
        tip = (17 + side * 16, 9 + up); mid = (17 + side * 9, 8 + up * 0.5)
        g.poly([(17 + side * 3, 10), mid, tip, (17 + side * 11, 15 + up * 0.3), (17 + side * 5, 16)], 'wing')
        for k in range(3): g.line(17 + side * (6 + k * 3), 13 + up * 0.3, 17 + side * (7 + k * 3), 18 + up * 0.2, 'feather', 0.4)
    g.ellipse(17, 14, 5, 6, 'body'); g.ellipse(17, 6, 4, 4, 'face'); g.line(13, 4, 11, 10, 'hair', 1); g.line(21, 4, 23, 10, 'hair', 1)
    g.put(16, 6, 'eye'); g.put(19, 6, 'eye'); g.line(16, 9, 19, 9, 'mouth', 0.3)
    for side in (-1, 1): g.line(17 + side * 2, 19, 17 + side * 3, 25, 'leg', 0.5); g.line(17 + side * 3, 25, 17 + side * 5, 27, 'claw', 0.4); g.line(17 + side * 3, 25, 17 + side * 1, 27, 'claw', 0.4)
    return g, {'wing': VIO, 'feather': '#34106a', 'body': GREY, 'face': ('#c8b8c0', '#8a7a82', '#4a3a42'), 'hair': ('#5a4a5a', '#2a1a2a', '#140a14'), 'eye': '#ff2630', 'mouth': '#2a0408', 'leg': GREY, 'claw': '#f1e7d0'}

def stormling(f):
    """a little thundercloud with a mean face; frame 3 lets a bolt go"""
    g = Grid(26, 26); b = [0, 1, 0, 1][f]
    for (x, y, r) in ((8, 10, 6), (14, 7, 7), (20, 10, 6), (13, 12, 7)): g.ellipse(x, y + b, r, r * 0.8, 'cloud')
    g.rect(9, 9 + b, 2, 2, 'eye'); g.rect(16, 9 + b, 2, 2, 'eye'); g.line(8, 7 + b, 11, 8 + b, 'brow', 0.4); g.line(19, 7 + b, 16, 8 + b, 'brow', 0.4)
    g.line(11, 15 + b, 16, 15 + b, 'mouth', 0.4)
    if f == 3: g.line(13, 18, 11, 21, 'bolt', 0.6); g.line(11, 21, 15, 22, 'bolt', 0.6); g.line(15, 22, 12, 25, 'bolt', 0.6)
    else:
        for x in (8, 14, 20): g.put(x, 18 + ((x + f) % 3), 'rain')
    return g, {'cloud': ('#6a5a7a', '#3a2c4a', '#1a1024'), 'eye': '#ffe36a', 'brow': '#0a0408', 'mouth': '#0a0408', 'bolt': ('#ffffff', '#ffe36a', '#c08aff'), 'rain': '#9a7aff'}

def mummy(f):
    """a mummy of the crypt: rotting bandages, glowing violet eyes, one arm reaching out"""
    g = Grid(22, 36); step = [0, 1, 0, -1][f]
    for side, ph in ((-1, step), (1, -step)): g.rect(9 + side * 3 + ph, 24, 4, 11, 'wrap')
    g.rect(6, 12, 11, 14, 'wrap'); g.ellipse(11, 7, 6, 6, 'wrap')
    for y in range(3, 34, 3): g.line(5, y + (y % 2), 17, y - 1, 'band', 0.3)
    g.rect(8, 5, 7, 3, 'void'); g.put(10, 6, 'eye'); g.put(13, 6, 'eye')
    g.line(16, 14, 21, 14 + (f % 2), 'wrap', 1.2); g.line(6, 16, 3, 22, 'wrap', 1)
    g.line(4, 22, 1, 29 + step, 'loose', 0.4)
    return g, {'wrap': ('#e8dcc0', '#b0a080', '#5a4e3a'), 'band': '#7a6a50', 'void': '#12040a', 'eye': '#c08aff', 'loose': '#d0c4a4'}

def gravehand(f):
    """a hand clawing up out of a grave mound; it rises higher each frame"""
    g = Grid(22, 26); h = [4, 10, 16, 20][f]
    g.ellipse(11, 23, 10, 4, 'dirt'); g.rect(1, 23, 21, 3, 'dirt')
    top = 24 - h
    g.rect(8, top + 5, 6, h - 4, 'arm')
    for i, x in enumerate((7, 9, 11, 13)): g.line(x + 0.5, top + 5, x + (i - 1.5) * 0.8, top + 1 - (i % 2), 'arm', 0.5); g.put(x + (i - 1.5) * 0.8, top + 0 - (i % 2), 'nail')
    g.line(14, top + 7, 16, top + 4, 'arm', 0.5)
    for (x, y) in ((4, 22), (17, 21), (12, 24)): g.put(x, y, 'clod')
    return g, {'dirt': ('#4a3a2e', '#2e2218', '#160e08'), 'arm': ('#a8b89a', '#6a7a5a', '#2e3a26'), 'nail': '#f1e7d0', 'clod': '#5a4a3a'}

def thornling(f):
    """a walking thorn bush with red berry eyes on root legs"""
    g = Grid(28, 28); step = [0, 1, 0, -1][f]
    for side, ph in ((-1, step), (1, -step)): g.line(14 + side * 4, 20, 14 + side * 6 + ph, 27, 'root', 0.8)
    g.ellipse(14, 13, 11, 9, 'bush')
    for a in range(12):
        x = 14 + C(a * 0.52) * 11; y = 13 + S(a * 0.52) * 9; g.line(x, y, 14 + C(a * 0.52) * 14, 13 + S(a * 0.52) * 12, 'thorn', 0.4)
    g.ellipse(16, 10, 2.2, 2.2, 'berry'); g.ellipse(22, 10, 2.2, 2.2, 'berry'); g.put(16, 9, 'glint'); g.put(22, 9, 'glint')
    g.line(15, 16, 23, 15, 'mouth', 0.5); g.put(17, 17, 'mouth'); g.put(21, 16, 'mouth')
    return g, {'root': WOOD, 'bush': ('#4a6a2a', '#2a4214', '#122008'), 'thorn': '#c8b898', 'berry': BLUMR, 'glint': '#ffffff', 'mouth': '#120a04'}

def rotfly(f):
    """a fat rot fly, violet and buzzing"""
    g = Grid(18, 14); w = [0, -2, 0, 2][f]
    g.ellipse(9, 9, 5.5, 3.5, 'body')
    g.ellipse(6, 3 + w * 0.5, 4, 2.5, 'wing'); g.ellipse(11, 2 + w * 0.5, 4, 2.5, 'wing'); g.ellipse(15, 8, 3, 3, 'head'); g.rect(15, 7, 2, 2, 'eye')
    for x in (5, 8, 11): g.line(x, 12, x - 1, 13, 'leg', 0.3)
    g.line(4, 8, 4, 11, 'stripe', 0.4); g.line(8, 7, 8, 12, 'stripe', 0.4)
    return g, {'wing': ('#e0d8f0', '#a8a0c0', '#5a5070'), 'body': VIO, 'head': BLACK, 'eye': '#ff2630', 'leg': '#1a1014', 'stripe': '#34106a'}

# ===================================================================== Greebo's Grotto: foes
def pieling(f):
    """a cream pie on little legs with a cherry on top; it squashes as it hops"""
    g = Grid(24, 20); sq = [0, 1, 2, 1][f]
    for side in (-1, 1): g.line(12 + side * 5, 15, 12 + side * 6, 19, 'leg', 0.5)
    g.ellipse(12, 13 + sq * 0.4, 11 + sq * 0.5, 4, 'crust'); g.rect(2, 10 + sq * 0.6, 21, 4, 'crust')
    g.ellipse(12, 9 + sq * 0.6, 10, 3.5 - sq * 0.3, 'cream')
    for x in (4, 8, 16, 20): g.ellipse(x, 11 + sq * 0.6, 1.5, 2, 'cream')
    g.ellipse(12, 5 + sq, 2.5, 2.5, 'cherry'); g.line(12, 3 + sq, 14, 0 + sq, 'stem', 0.3)
    g.put(9, 12, 'eye'); g.put(15, 12, 'eye'); g.line(10, 14, 14, 14, 'mouth', 0.3)
    return g, {'leg': '#7a4410', 'crust': CRUST, 'cream': CREAM, 'cherry': CHERRY, 'stem': '#3a8a1a', 'eye': '#12040a', 'mouth': '#7a4410'}

def rollingpin(f):
    """a rolling pin with a grumpy face, rolling at you"""
    g = Grid(32, 14); r = f
    g.rect(0, 6, 4, 3, 'handle'); g.rect(28, 6, 4, 3, 'handle')
    g.rect(4, 2, 24, 11, 'pin'); g.ellipse(4, 7.5, 1.5, 5.5, 'pin'); g.ellipse(28, 7.5, 1.5, 5.5, 'pin')
    for k in range(4): x = 6 + ((k * 6 + r * 2) % 22); g.line(x, 3, x + 1, 12, 'grain', 0.3)
    g.rect(19, 5, 2, 2, 'eye'); g.rect(23, 5, 2, 2, 'eye'); g.line(18, 4, 21, 5, 'brow', 0.3); g.line(25, 4, 22, 5, 'brow', 0.3); g.line(20, 10, 24, 9, 'mouth', 0.3)
    g.ellipse(10, 4, 3, 1, 'flour')
    return g, {'handle': ('#a86a3a', '#6e3a1e', '#3a1a0c'), 'pin': WOOD, 'grain': '#6e3a1e', 'eye': '#12040a', 'brow': '#12040a', 'mouth': '#3a1a0c', 'flour': '#fffbe8'}

def toymouse(f):
    """a clockwork mouse: tin grey, pink ears, the key on its back turning"""
    g = Grid(24, 16); k = f
    g.line(2, 11, 0, 8 - (f % 2), 'tail', 0.4)
    g.ellipse(11, 10, 9, 5, 'tin'); g.poly([(17, 7), (23, 11), (17, 14)], 'tin'); g.put(23, 11, 'nose')
    g.ellipse(16, 5, 3, 3, 'ear'); g.ellipse(16, 5, 1.5, 1.5, 'ear2'); g.put(19, 9, 'eye')
    for x in (6, 15): g.ellipse(x, 15, 2, 1.5, 'wheel')
    kx = 8; g.line(kx, 5, kx, 2, 'key', 0.4); g.line(kx - [3, 1, 3, 1][k], 1, kx + [3, 1, 3, 1][k], 1, 'key', 0.6)
    g.line(5, 9, 13, 9, 'seam', 0.3)
    return g, {'tail': '#ff9ab0', 'tin': GREY, 'nose': '#ff6a8a', 'ear': GREY, 'ear2': '#ff9ab0', 'eye': '#12040a', 'wheel': BLACK, 'key': GOLD, 'seam': '#38323a'}

def feather(f):
    """a feather toy flying loose from its wand: bright plumes and a bell"""
    g = Grid(22, 28); w = [0, 2, 0, -2][f]
    g.line(11, 27, 11, 14, 'stick', 0.6)
    for i, (dx, col) in enumerate(((-6, 'p1'), (-2, 'p2'), (2, 'p3'), (6, 'p1'))):
        g.line(11, 14, 11 + dx + w * (0.5 if i % 2 else -0.5), 2 + abs(dx) * 0.5, col, 1.4)
    g.ellipse(11, 16, 2.5, 2.5, 'bell'); g.put(11, 17, 'clap')
    return g, {'stick': WOOD, 'p1': ('#ff9ad0', '#e040a0', '#8a1060'), 'p2': ('#9adfff', '#3a8ac8', '#14406a'), 'p3': ('#fff09a', '#ffc840', '#a8741a'), 'bell': GOLD, 'clap': '#7a4410'}

def corkbot(f):
    """a fizzy bottle on stubby legs; frame 3 pops its cork"""
    g = Grid(18, 32); pop = f == 3; b = [0, 1, 0, 0][f]
    g.rect(4, 12 + b, 10, 16, 'glass'); g.ellipse(9, 12 + b, 5, 3, 'glass'); g.rect(7, 4 + b, 4, 8, 'glass')
    g.rect(6, 16 + b, 6, 7, 'label'); g.put(8, 19 + b, 'eye'); g.put(11, 19 + b, 'eye'); g.line(8, 21 + b, 11, 21 + b, 'mouth', 0.3)
    if not pop: g.rect(7, 0 + b, 4, 4, 'cork')
    else:
        g.rect(7, 0, 4, 2, 'cork')
        for x in (6, 9, 12): g.put(x, 2 + (x % 3), 'fizz')
    for side in (-1, 1): g.rect(9 + side * 3 - 1, 28, 2, 4, 'leg')
    g.line(5, 14 + b, 5, 25 + b, 'shine', 0.3)
    return g, {'glass': ('#7adf8a', '#2a8a3a', '#104a1a'), 'label': CREAM, 'eye': '#12040a', 'mouth': '#7a4410', 'cork': WOOD, 'fizz': '#fffbe8', 'leg': '#2a1a10', 'shine': '#d0ffd0'}

def jelly(f):
    """a cherry jelly from a mould, wobbling"""
    g = Grid(22, 20); wob = [0, 1, 0, -1][f]
    g.poly([(3 + wob, 19), (5 + wob * 0.5, 4), (17 - wob * 0.5, 4), (19 - wob, 19)], 'jelly'); g.ellipse(11, 4, 6, 2, 'jelly')
    for y in (8, 12, 16): g.line(4 + wob * 0.3, y, 18 - wob * 0.3, y, 'ridge', 0.3)
    g.put(8, 10, 'eye'); g.put(14, 10, 'eye'); g.line(9, 13, 13, 13, 'mouth', 0.3); g.line(6, 6, 6, 15, 'shine', 0.4)
    return g, {'jelly': ('#ff6a8a', '#d01e4a', '#6a0a22'), 'ridge': '#a0103a', 'eye': '#12040a', 'mouth': '#4a0414', 'shine': '#ffd0e0'}

def wasp(f):
    """a picnic wasp: yellow and black, stinger out"""
    g = Grid(22, 16); w = [0, -2, 1, -1][f]
    g.ellipse(9, 4 + w * 0.5, 5, 3, 'wing'); g.ellipse(13, 3 + w * 0.5, 4, 3, 'wing')
    g.ellipse(8, 10, 6, 4, 'body'); g.ellipse(16, 9, 3, 3, 'thorax'); g.ellipse(19, 8, 2.5, 2.5, 'head'); g.put(20, 7, 'eye')
    for x in (5, 8, 11): g.line(x, 7, x, 13, 'stripe', 0.6)
    g.poly([(2, 10), (-1, 11), (2, 12)], 'sting')
    return g, {'wing': ('#ffffff', '#c8e0f0', '#7a8a9a'), 'body': ('#fff09a', '#ffc840', '#a8741a'), 'thorax': BLACK, 'head': BLACK, 'eye': '#ff2630', 'stripe': '#1a1014', 'sting': '#f1e7d0'}

def ant(f):
    """a red picnic ant carrying a crumb on its back"""
    g = Grid(22, 16); ph = f * math.pi / 2
    for i, lx in enumerate((7, 11, 15)):
        k = S(ph + i * 2) * 1.6; g.line(lx, 11, lx - 2 + k, 15, 'leg', 0.4); g.line(lx, 11, lx + 2 - k, 15, 'leg', 0.4)
    g.ellipse(5, 10, 4, 3, 'body'); g.ellipse(11, 10, 3, 2.5, 'body'); g.ellipse(17, 9, 3.5, 3, 'body')
    g.line(18, 6, 20, 2, 'leg', 0.3); g.put(19, 8, 'eye'); g.put(21, 10, 'jaw')
    g.rect(6, 2, 8, 5, 'crumb'); g.put(8, 3, 'seed'); g.put(11, 4, 'seed')
    return g, {'leg': '#3a0a10', 'body': BLUMR, 'eye': '#12040a', 'jaw': '#f1e7d0', 'crumb': CRUST, 'seed': '#7a4410'}

# ===================================================================== Blumhead's Castle: bosses
def execu(f):
    """the Blum Executioner: a huge black-hooded headsman with a violet-edged axe"""
    g = Grid(86, 88); up = f
    for side, ph in ((-1, up), (1, -up)): g.rect(36 + side * 9 + ph, 62, 9, 22, 'pants'); g.rect(34 + side * 9 + ph, 82, 13, 5, 'boot')
    g.ellipse(41, 48, 20, 18, 'skin'); g.rect(22, 46, 38, 18, 'skin')
    g.rect(22, 58, 38, 7, 'belt'); g.rect(38, 58, 6, 7, 'buckle')
    g.ellipse(41, 22, 14, 15, 'hood'); g.poly([(30, 14), (41, -1), (52, 14)], 'hood'); g.rect(34, 18, 15, 6, 'void'); g.put(37, 20, 'eye'); g.put(45, 20, 'eye'); g.put(38, 20, 'eye'); g.put(46, 20, 'eye')
    for (x, y) in ((32, 50), (48, 44), (40, 56)): g.line(x, y, x + 4, y + 3, 'scar', 0.5)
    ax = 66 + up * 2; g.line(56, 46, ax, 8 + up * 4, 'handle', 1.4)
    g.poly([(ax - 2, 4 + up * 4), (ax + 16, 2 + up * 4), (ax + 18, 22 + up * 4), (ax - 2, 20 + up * 4)], 'blade'); g.line(ax + 16, 3 + up * 4, ax + 18, 21 + up * 4, 'edge', 0.6)
    g.line(24, 50, 16, 64, 'skin', 4); g.ellipse(15, 66, 5, 5, 'skin')
    return g, {'pants': BLACK, 'boot': ('#3a2a20', '#1e1410', '#0c0806'), 'skin': ('#c8a0a8', '#8a6a72', '#4a3238'), 'belt': BLACK, 'buckle': GOLD, 'hood': BLACKP, 'void': '#0a0408',
               'eye': '#c08aff', 'scar': '#5a2a32', 'handle': WOOD, 'blade': ('#d0c8d8', '#7a7088', '#3a3448'), 'edge': '#c08aff'}

def stormwing(f):
    """Stormwing: a black storm bird as big as a cart, violet lightning crackling on its crest"""
    g = Grid(110, 74); up = [-10, 8][f]
    for side in (-1, 1):
        tip = (55 + side * 52, 22 + up); mid = (55 + side * 30, 18 + up * 0.6)
        g.poly([(55 + side * 8, 28), mid, tip, (55 + side * 40, 40 + up * 0.4), (55 + side * 24, 44), (55 + side * 12, 42)], 'wing')
        for k in range(5): g.line(55 + side * (14 + k * 7), 34 + up * 0.3, 55 + side * (17 + k * 7), 40 + up * 0.25, 'feather', 0.6)
    g.ellipse(55, 40, 14, 16, 'body'); g.ellipse(55, 46, 8, 9, 'chest')
    g.ellipse(70, 26, 10, 9, 'body'); g.poly([(77, 24), (92, 28), (77, 31)], 'beak'); g.rect(70, 22, 4, 3, 'eye'); g.put(72, 22, 'glint')
    for i in range(4): g.line(64 + i * 3, 18, 60 + i * 4, 6 - (i % 2) * 3, 'crest', 0.8)
    g.line(62, 2, 66, 8, 'bolt', 0.5); g.line(66, 8, 63, 12, 'bolt', 0.5)
    for side in (-1, 1): g.line(55 + side * 5, 55, 55 + side * 6, 66, 'leg', 1); g.line(55 + side * 6, 66, 55 + side * 10, 70, 'claw', 0.5); g.line(55 + side * 6, 66, 55 + side * 2, 70, 'claw', 0.5)
    g.poly([(42, 50), (32, 64), (40, 58), (44, 66), (48, 56)], 'tail')
    return g, {'wing': BLACKP, 'feather': VIO, 'body': BLACK, 'chest': ('#5a4a64', '#342640', '#18101e'), 'beak': GOLD, 'eye': '#ff2630', 'glint': '#ffffff',
               'crest': VIO, 'bolt': '#ffe36a', 'leg': GREY, 'claw': '#f1e7d0', 'tail': BLACKP}

def queen(f):
    """the Pale Queen: a vampire queen in a high red collar and a black gown, a crown of bone"""
    g = Grid(60, 84); sw = [0, 2][f]
    g.poly([(14 - sw, 83), (24, 34), (36, 34), (46 + sw, 83)], 'gown'); g.poly([(18 - sw, 83), (30, 50), (42 + sw, 83)], 'gown2')
    g.poly([(14, 20), (30, 30), (46, 20), (42, 40), (18, 40)], 'collar')
    g.rect(24, 30, 12, 14, 'bodice'); g.put(30, 34, 'gem')
    g.ellipse(30, 20, 8, 10, 'face'); g.poly([(22, 14), (30, 4), (38, 14)], 'hair'); g.line(22, 14, 21, 30, 'hair', 1.5); g.line(38, 14, 39, 30, 'hair', 1.5)
    for x in (24, 28, 32, 36): g.poly([(x - 1, 9), (x, 2 + (x % 8 == 0) * -2), (x + 1, 9)], 'crown')
    g.put(27, 19, 'eye'); g.put(33, 19, 'eye'); g.line(28, 25, 32, 25, 'lip', 0.4); g.put(28, 26, 'fang'); g.put(32, 26, 'fang')
    for side in (-1, 1): g.line(30 + side * 8, 36, 30 + side * 16, 48 - sw * side, 'sleeve', 2); g.ellipse(30 + side * 17, 50 - sw * side, 3, 3, 'face')
    return g, {'gown': BLACK, 'gown2': ('#6a0a14', '#3a0408', '#1a0204'), 'collar': BLUMR, 'bodice': ('#8a1a24', '#5a0a12', '#2a0408'), 'gem': '#ffe36a',
               'face': ('#ffffff', '#e0d8e8', '#9a90a8'), 'hair': BLACK, 'crown': BONE, 'eye': '#ff2630', 'lip': '#c4121c', 'fang': '#ffffff', 'sleeve': BLACK}

def rotmother(f):
    """the Rot Mother: a giant rotten flower on a fat bulb, a toothy bloom and thorned vines"""
    g = Grid(96, 84); op = f
    g.ellipse(48, 70, 30, 14, 'bulb'); g.rect(18, 66, 60, 18, 'bulb')
    for side in (-1, 1):
        for k in range(3): g.line(48 + side * (10 + k * 8), 70, 48 + side * (30 + k * 6), 78 - k * 8 + op * 2, 'vine', 1.2)
    g.line(48, 62, 50, 36, 'stalk', 3)
    for a in range(8): ang = a * math.pi / 4 + op * 0.2; g.ellipse(50 + C(ang) * 16, 26 + S(ang) * 14, 9, 6, 'petal')
    g.ellipse(50, 26, 13, 12, 'mouth'); g.ellipse(50, 26 + op, 9, 8 - op, 'void')
    for a in range(10): ang = a * math.pi / 5; g.poly([(50 + C(ang) * 9, 26 + S(ang) * 8), (50 + C(ang) * 5, 26 + S(ang) * 4.5), (50 + C(ang + 0.3) * 9, 26 + S(ang + 0.3) * 8)], 'tooth')
    for (x, y) in ((30, 72), (62, 74), (46, 78)): g.ellipse(x, y, 3, 2, 'spot')
    for side in (-1, 1): g.ellipse(48 + side * 18, 62, 4, 3, 'eye'); g.put(48 + side * 18, 62, 'pupil')
    return g, {'bulb': ('#6a8a3a', '#3a5a1a', '#18280a'), 'vine': ('#5a7a2a', '#2e4a12', '#142206'), 'stalk': ('#5a7a2a', '#2e4a12', '#142206'),
               'petal': ('#c070a0', '#8a2a6a', '#401030'), 'mouth': BLUMR, 'void': '#1a0408', 'tooth': '#f1e7d0', 'spot': '#c08aff', 'eye': '#ffe36a', 'pupil': '#12040a'}

def kingblum(f):
    """King Blumhead: Blumhead on his own ground, in a gold crown and a black and red royal cape, sceptre in hand"""
    g = Grid(100, 112); st = f
    g.poly([(18, 108), (34, 44), (66, 44), (82, 108)], 'cape'); g.poly([(24, 108), (40, 60), (60, 60), (76, 108)], 'lining')
    for side, ph in ((-1, st), (1, -st)): g.ellipse(50 + side * 12 + ph * 2, 98, 8, 9, 'body'); g.ellipse(50 + side * 13 + ph * 2, 106, 10, 4, 'body2')
    g.ellipse(50, 76, 22, 20, 'body')
    g.rect(28, 60, 44, 6, 'fur'); [g.put(x, 62 + (x % 2), 'spot') for x in range(30, 71, 4)]
    g.line(70, 70, 82, 76 + st, 'body', 4); g.ellipse(83, 78 + st, 6, 6, 'body2'); g.line(84, 92, 86, 40, 'sceptre', 1); g.ellipse(86, 38, 5, 5, 'orb'); g.put(85, 37, 'glint')
    g.line(30, 70, 22, 82 - st, 'body', 4); g.ellipse(21, 84 - st, 6, 6, 'body2')
    g.ellipse(50, 42, 24, 22, 'body'); g.poly([(34, 28), (50, 10), (66, 28)], 'body')
    g.poly([(30, 26), (70, 26), (72, 8), (63, 16), (56, 4), (50, 14), (44, 4), (37, 16), (28, 8)], 'crown'); g.put(50, 18, 'gem'); g.put(40, 20, 'gem2'); g.put(60, 20, 'gem2')
    for side in (-1, 1):
        ex = 50 + side * 9; g.ellipse(ex, 40, 5, 6, 'white'); g.ellipse(ex + 1, 41, 2.5, 3.5, 'pupil'); g.line(ex - 5 * side, 32, ex + 4 * side, 35, 'brow', 1)
    g.poly([(34, 50), (66, 50), (62, 60), (38, 60)], 'mouth'); [g.poly([(x, 50), (x + 2, 54), (x + 4, 50)], 'teeth') for x in range(36, 64, 4)]
    g.ellipse(38, 34, 4, 3, 'shine')
    return g, {'cape': BLACK, 'lining': ('#c4121c', '#8a0a14', '#4a040a'), 'body': BLUMR, 'body2': ('#ff4a54', '#b0141e', '#5a0810'), 'fur': ('#ffffff', '#e0d8d0', '#a09890'), 'spot': '#12040a',
               'sceptre': GOLD, 'orb': VIO, 'glint': '#ffffff', 'crown': GOLD, 'gem': '#c08aff', 'gem2': '#ff2630', 'white': '#fff6e8', 'pupil': '#12040a', 'brow': '#12040a',
               'mouth': '#2a0408', 'teeth': '#f1e7d0', 'shine': ('#ffffff', '#ffd0d4', '#ff8a94')}

# ===================================================================== Greebo's Grotto: bosses
def cake(f):
    """the Great Cake: three tiers of sponge and cream with a face, candles burning on top"""
    g = Grid(84, 90); sq = f
    g.rect(8, 64 + sq, 68, 24 - sq, 'sponge'); g.rect(8, 60 + sq, 68, 6, 'cream')
    g.rect(16, 40 + sq * 2, 52, 22 - sq, 'sponge'); g.rect(16, 36 + sq * 2, 52, 6, 'cream')
    g.rect(26, 18 + sq * 3, 32, 20 - sq, 'sponge'); g.rect(26, 14 + sq * 3, 32, 6, 'cream')
    for x in range(10, 76, 6): g.ellipse(x, 66 + sq, 2, 3, 'cream')
    for x in range(18, 68, 6): g.ellipse(x, 42 + sq * 2, 2, 3, 'cream')
    for i, x in enumerate((32, 42, 52)):
        g.rect(x - 1, 4 + sq * 3, 3, 10, 'candle'); g.poly([(x - 2, 4 + sq * 3), (x + 0.5, -2 + sq * 3 - (i + f) % 2), (x + 3, 4 + sq * 3)], 'flame')
    g.ellipse(42, 12 + sq * 3, 4, 4, 'cherry')
    for side in (-1, 1): g.ellipse(42 + side * 12, 50 + sq * 2, 4, 5, 'white'); g.put(42 + side * 12 + 1, 51 + sq * 2, 'pupil'); g.line(42 + side * 16, 44 + sq * 2, 42 + side * 8, 46 + sq * 2, 'brow', 0.6)
    g.poly([(28, 72 + sq), (56, 72 + sq), (50, 82), (34, 82)], 'mouth'); [g.poly([(x, 72 + sq), (x + 2, 75 + sq), (x + 4, 72 + sq)], 'teeth') for x in range(30, 54, 4)]
    for (x, y) in ((14, 76), (70, 74), (22, 50), (62, 52)): g.rect(x, y + sq, 3, 2, 'sprinkle')
    return g, {'sponge': ('#f8d8a0', '#d8a868', '#8a6030'), 'cream': CREAM, 'candle': ('#ff9ad0', '#e040a0', '#8a1060'), 'flame': ('#fff09a', '#ffb040', '#ff5a20'), 'cherry': CHERRY,
               'white': '#ffffff', 'pupil': '#12040a', 'brow': '#7a4410', 'mouth': '#4a1408', 'teeth': '#ffffff', 'sprinkle': '#9adfff'}

def clockmouse(f):
    """the Clockwork Mouse: Sir Johnathan's biggest toy, tin and rivets, a great key turning in its back"""
    g = Grid(96, 62); k = f
    for i in range(18): g.put(10 - i * 0.6, 40 - S(i * 0.5 + f) * 3 - i * 0.8, 'tail')
    g.ellipse(44, 36, 30, 18, 'tin'); g.poly([(66, 26), (94, 38), (66, 50)], 'tin'); g.ellipse(94, 38, 3, 3, 'nose')
    g.ellipse(64, 16, 10, 10, 'tin'); g.ellipse(64, 16, 6, 6, 'ear')
    g.rect(74, 30, 5, 5, 'eye'); g.put(76, 31, 'glint')
    for x in range(20, 70, 8): g.put(x, 28, 'rivet'); g.put(x + 4, 46, 'rivet')
    g.line(18, 36, 70, 36, 'seam', 0.4)
    for x in (24, 60): g.ellipse(x, 56, 7, 5, 'wheel'); g.ellipse(x, 56, 2, 2, 'hub')
    kx = 38; g.rect(kx - 2, 6, 5, 12, 'key'); bw = 12 if k == 0 else 5; g.ellipse(kx + 0.5, 4, bw, 5, 'key'); g.ellipse(kx + 0.5, 4, max(1, bw - 6), 2, 'keyin')
    for x in (82, 86): g.line(x, 40, x + 8, 37 + (x - 82), 'whisker', 0.3)
    return g, {'tail': '#ff9ab0', 'tin': GREY, 'nose': '#ff6a8a', 'ear': '#ff9ab0', 'eye': '#12040a', 'glint': '#ffffff', 'rivet': '#e8e0e8', 'seam': '#38323a',
               'wheel': BLACK, 'hub': GOLD, 'key': GOLD, 'keyin': '#5a3a10', 'whisker': '#f1e7d0'}

def kraken(f):
    """the Cream Kraken: a cream octopus heaving up out of a copper vat, tentacles everywhere"""
    g = Grid(96, 88); w = [0, 1][f]
    for i in range(6):
        side = -1 if i < 3 else 1; k = i % 3
        x0 = 48 + side * (8 + k * 6); pts = [(x0 + side * (j * 5), 50 - j * 6 + S(j * 0.9 + f * 1.4 + i) * 4) for j in range(7)]
        for a, b in zip(pts, pts[1:]): g.line(a[0], a[1], b[0], b[1], 'tent', 2.4 - k * 0.3)
        for a in pts[1::2]: g.put(a[0] + side, a[1] + 2, 'sucker')
    g.ellipse(48, 34 - w, 20, 22, 'head'); g.ellipse(48, 22 - w, 14, 12, 'head')
    for side in (-1, 1): g.ellipse(48 + side * 9, 38 - w, 5, 6, 'white'); g.rect(47 + side * 9, 37 - w, 3, 4, 'pupil')
    g.line(40, 48 - w, 56, 48 - w, 'mouth', 0.6)
    g.rect(14, 58, 68, 30, 'vat'); g.rect(10, 56, 76, 6, 'rim'); for_x = [g.put(x, 70, 'rivet') for x in range(18, 80, 10)]
    g.ellipse(48, 58, 34, 3, 'cream')
    return g, {'tent': CREAM, 'sucker': '#c8a878', 'head': CREAM, 'white': '#ffffff', 'pupil': '#12040a', 'mouth': '#8a6a3a',
               'vat': ('#e8904a', '#a8582a', '#5a2a10'), 'rim': ('#f8b06a', '#c8783a', '#6a3814'), 'rivet': '#fff09a', 'cream': ('#ffffff', '#fffbe8', '#f1e0b0')}

def waspqueen(f):
    """the Wasp Queen: a huge wasp in a little gold crown, stinger like a spear"""
    g = Grid(90, 66); w = [-6, 4][f]
    g.ellipse(36, 18 + w * 0.5, 22, 12, 'wing'); g.ellipse(54, 14 + w * 0.5, 20, 11, 'wing')
    g.ellipse(30, 42, 24, 16, 'body'); g.ellipse(58, 38, 11, 10, 'thorax'); g.ellipse(74, 32, 10, 10, 'head')
    for x in (16, 26, 36, 44): g.line(x, 28, x - 2, 56, 'stripe', 2)
    g.poly([(8, 40), (-1, 46), (8, 50)], 'sting')
    g.ellipse(78, 30, 4, 5, 'eye'); g.put(79, 29, 'glint')
    g.poly([(68, 24), (82, 24), (84, 14), (79, 19), (75, 12), (71, 19), (66, 14)], 'crown')
    for i, x in enumerate((50, 58, 66)): g.line(x, 46, x - 4 + i, 60, 'leg', 0.6)
    g.line(80, 26, 86, 18, 'leg', 0.4)
    return g, {'wing': ('#ffffff', '#c8e0f0', '#7a8a9a'), 'body': ('#fff09a', '#ffc840', '#a8741a'), 'thorax': BLACK, 'head': BLACK, 'stripe': '#1a1014', 'sting': BONE,
               'eye': '#ff2630', 'glint': '#ffffff', 'crown': GOLD, 'leg': '#1a1014'}

def sirj(f):
    """Sir Johnathan: Greebo's black and white tuxedo cat, grown huge on the Grotto's cream. Green eyes, pink nose,
    white chest and paws, a knight's red collar with a gold medal. Frame 1 bares the claws."""
    g = Grid(116, 84); st = f
    for i in range(22): a = i / 21 * 3.6; g.ellipse(22 - S(a) * 14 + (i > 16) * (i - 16) * 1.5, 54 - i * 2.1, 3.6, 3.6, 'fur')  # the tail, up and curling over at the tip
    g.ellipse(52, 56, 34, 20, 'fur'); g.ellipse(56, 70, 14, 5, 'white')
    for i, (lx, ph) in enumerate(((28, st), (40, -st), (66, st), (78, -st))):
        g.rect(lx + ph * 2, 64, 9, 16, 'fur'); g.ellipse(lx + ph * 2 + 4, 80, 7, 4, 'white')
        if f: [g.line(lx + ph * 2 + 1 + c * 3, 81, lx + ph * 2 + 2 + c * 3, 84, 'claw', 0.3) for c in range(3)]
    g.ellipse(88, 36, 20, 18, 'fur'); g.ellipse(92, 46, 11, 9, 'white')
    g.poly([(72, 26), (74, 4), (84, 20)], 'fur'); g.poly([(76, 22), (76, 10), (82, 20)], 'ear')
    g.poly([(94, 20), (102, 2), (106, 24)], 'fur'); g.poly([(98, 20), (102, 8), (104, 22)], 'ear')
    for side in (-1, 1): ex = 90 + side * 8; g.ellipse(ex, 34, 4, 4.5, 'eye'); g.rect(ex - 0.5, 31, 2, 7, 'slit'); g.put(ex - 2, 32, 'glint')
    g.poly([(95, 41), (99, 41), (97, 44)], 'nose'); g.line(97, 44, 94, 47 + st, 'mouth', 0.4); g.line(97, 44, 100, 47 + st, 'mouth', 0.4)
    for k in range(3): g.line(104, 42 + k * 2, 115, 40 + k * 3, 'whisker', 0.3); g.line(86, 42 + k * 2, 76, 40 + k * 3, 'whisker', 0.3)
    g.rect(72, 50, 26, 4, 'collar'); g.ellipse(86, 57, 4, 4, 'medal'); g.put(86, 56, 'glint')
    return g, {'fur': ('#3a3440', '#1a1620', '#0a080c'), 'white': ('#ffffff', '#e8e4e8', '#a8a0a8'), 'claw': '#ffffff', 'ear': '#ff9ab0', 'eye': ('#c8ff9a', '#7adf3a', '#2a8a10'),
               'slit': '#0a080c', 'glint': '#ffffff', 'nose': '#ff8aa8', 'mouth': '#0a080c', 'whisker': '#f1e7d0', 'collar': BLUMR, 'medal': GOLD}

CASTLE_ENEMIES = {'cultist': (cultist, 4), 'goohound': (goohound, 4), 'harpy': (harpy, 4), 'stormling': (stormling, 4), 'mummy': (mummy, 4), 'gravehand': (gravehand, 4),
                  'thornling': (thornling, 4), 'rotfly': (rotfly, 4), 'pieling': (pieling, 4), 'rollingpin': (rollingpin, 4), 'toymouse': (toymouse, 4), 'feather': (feather, 4),
                  'corkbot': (corkbot, 4), 'jelly': (jelly, 4), 'wasp': (wasp, 4), 'ant': (ant, 4)}
CASTLE_BOSSES = {'execu': (execu, 2), 'stormwing': (stormwing, 2), 'queen': (queen, 2), 'rotmother': (rotmother, 2), 'kingblum': (kingblum, 2),
                 'cake': (cake, 2), 'clockmouse': (clockmouse, 2), 'kraken': (kraken, 2), 'waspqueen': (waspqueen, 2), 'sirj': (sirj, 2)}
