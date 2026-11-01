"""Cumhead the Spermhog's own art: the drop, Cumhead's shot and the item box icons. Cumhead is his own atlas,
the foes and bosses come from tools/foes (Load Legacy's), the saws and logs are props, the freed homunculus is a breed."""
from pixelkit import Grid
FOES = ['crawler', 'clown', 'rat', 'bat', 'balloon', 'cultrat', 'creamblob', 'crow', 'slime', 'toymouse', 'pieling', 'skeleton', 'bonehound', 'gravehand', 'wraith', 'mummy',
        'magmaslug', 'golem', 'corkbot', 'emberbat', 'imp', 'blumguard', 'blumling', 'blumeye', 'blumspore', 'knight', 'beast', 'kraken', 'pig', 'boner', 'hotload', 'blum', 'blum2']
USE = ['ch_*', 'cumface'] + ['f_%s_*' % f for f in FOES] + ['p_saw0', 'p_saw1', 'p_logboat', 'h_gloop_baby_idle*', 'fac_*']
CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); RED = ('#ff3a44', '#c4121c', '#6a0a10'); GOLD = ('#fff09a', '#ffc840', '#a8741a'); BLUE = ('#9adfff', '#3a8ac8', '#14406a')

def drop():
    g = Grid(10, 13); g.ellipse(5, 8.5, 4.2, 4.2, 'd'); g.poly([(2, 7), (5, 0), (8, 7)], 'd'); g.put(3, 7, 'hi'); g.put(3, 8, 'hi')
    return g, {'d': CREAM, 'hi': '#ffffff'}

def shot():
    g = Grid(16, 9); g.ellipse(11, 4.5, 4, 3.5, 'c'); g.poly([(0, 4), (8, 2), (8, 7)], 'c'); g.put(12, 3, 'hi')
    return g, {'c': CREAM, 'hi': '#ffffff'}

def ishield():
    g = Grid(14, 14); g.ellipse(7, 7, 6.5, 6.5, 'b'); g.ellipse(5, 5, 2, 2, 'hi'); return g, {'b': BLUE, 'hi': '#ffffff'}

def ishoes():
    g = Grid(16, 12); g.poly([(1, 4), (9, 4), (15, 8), (15, 11), (1, 11)], 's'); g.rect(1, 9, 15, 2, 'sole'); g.rect(4, 5, 2, 3, 'lace'); g.rect(7, 5, 2, 3, 'lace')
    return g, {'s': RED, 'sole': ('#ffffff', '#e8dcc8', '#a8987a'), 'lace': '#ffffff'}

def istar():
    g = Grid(15, 15); g.poly([(7.5, 0), (9.5, 5.5), (15, 5.5), (10.5, 9), (12.5, 15), (7.5, 11.5), (2.5, 15), (4.5, 9), (0, 5.5), (5.5, 5.5)], 's')
    return g, {'s': GOLD}

IRON = ('#4a3a40', '#2a1e24', '#140c10'); LAMPC = ('#fff6c0', '#ffd860', '#c08a20'); REDP = ('#ff3a44', '#c4121c', '#6a0a10')

def lamp():  # a gothic street lamp, 70 tall
    g = Grid(18, 72); g.rect(7, 14, 4, 54, 'i'); g.rect(5, 66, 8, 6, 'i'); g.rect(4, 70, 10, 2, 'i'); g.rect(6, 40, 6, 3, 'i')
    g.poly([(3, 6), (15, 6), (13, 14), (5, 14)], 'glass'); g.rect(2, 4, 14, 2, 'i'); g.poly([(5, 4), (9, 0), (13, 4)], 'i'); g.rect(4, 14, 10, 2, 'i'); g.line(9, 6, 9, 13, 'i')
    return g, {'i': IRON, 'glass': LAMPC}

def hydrant():
    g = Grid(12, 16); g.rect(3, 4, 6, 10, 'r'); g.ellipse(6, 4, 3.5, 3, 'r'); g.rect(1, 7, 10, 3, 'r'); g.rect(2, 14, 8, 2, 'r'); g.rect(5, 0, 2, 2, 'r'); g.put(4, 5, 'hi')
    return g, {'r': REDP, 'hi': '#ffd0d0'}

def binb():  # a dented wheelie bin, a bit of rubbish poking out
    g = Grid(16, 20); g.poly([(1, 5), (15, 5), (14, 18), (2, 18)], 'b'); g.rect(0, 3, 16, 3, 'lid'); g.ellipse(4, 19, 2, 1.5, 'w'); g.ellipse(12, 19, 2, 1.5, 'w'); g.rect(10, 1, 3, 2, 'trash'); g.rect(6, 9, 4, 2, 'lid')
    return g, {'b': ('#3a3a44', '#24242c', '#121216'), 'lid': IRON, 'w': '#0a0a0c', 'trash': ('#f1e7d0', '#c8b890', '#806848')}

def bench():
    g = Grid(30, 16); g.rect(1, 2, 28, 3, 'wood'); g.rect(1, 8, 28, 3, 'wood'); g.rect(3, 5, 2, 11, 'i'); g.rect(25, 5, 2, 11, 'i'); g.rect(3, 11, 24, 1, 'i')
    return g, {'wood': ('#8a3a2a', '#5a2018', '#2a0c08'), 'i': IRON}

def busstop():  # a bus stop sign on a pole
    g = Grid(20, 50); g.rect(9, 10, 2, 40, 'i'); g.rect(0, 0, 20, 13, 'sign'); g.text(4, 1, 'BUS', 'txt'); g.text(2, 7, 'STOP', 'txt')
    return g, {'i': IRON, 'sign': REDP, 'txt': '#f1e7d0'}

def cone():
    g = Grid(10, 12); g.poly([(5, 0), (8, 10), (2, 10)], 'o'); g.rect(0, 10, 10, 2, 'o'); g.rect(3, 5, 4, 2, 'w')
    return g, {'o': ('#ff8a3a', '#e05a10', '#80300a'), 'w': '#fffbe8'}

GEMS = [('#ff8a90', '#ff2630', '#8a0a10'), ('#fff09a', '#ffc840', '#a8741a'), ('#ffffff', '#f1e0b0', '#a89070'), ('#e0a0ff', '#a040e0', '#501880'), ('#a0e0ff', '#3a8ac8', '#14406a'), ('#a0ffb0', '#30c060', '#106030'), ('#6a6070', '#2a2030', '#100810')]

def chalice(i):
    def f():
        g = Grid(18, 22)
        g.poly([(1, 4), (17, 4), (14, 11), (4, 11)], 'gold'); g.rect(7, 11, 4, 5, 'gold'); g.rect(4, 16, 10, 2, 'gold'); g.rect(3, 18, 12, 3, 'gold')
        g.ellipse(9, 4, 8, 2.2, 'cream'); g.ellipse(5, 6, 1.3, 2, 'cream'); g.ellipse(13, 7, 1.2, 2.5, 'cream'); g.ellipse(9, 1.5, 2.5, 1.5, 'cream')
        g.ellipse(9, 8, 2.2, 2.2, 'gem'); g.put(8, 7, 'hi')
        return g, {'gold': ('#fff09a', '#ffc840', '#a8741a'), 'cream': ('#ffffff', '#fffbe8', '#d8c8a0'), 'gem': GEMS[i], 'hi': '#ffffff'}
    return f


# ---------- district street furniture (each district has its own set) ----------
GREY = ('#c8c0c8', '#8a8290', '#3a343c'); DARK = ('#4a4450', '#2a2630', '#141218'); WOOD = ('#a0703a', '#704a24', '#3a240e'); YEL = ('#ffe36a', '#d0a020', '#6a4a0a')
CR = ('#fffbe8', '#f1e0b0', '#b8a070'); GRN = ('#7aa04a', '#4a6a2a', '#1e2e10'); STONE = ('#a09a90', '#6a6660', '#2e2c28'); BLU = ('#9adfff', '#3a8ac8', '#14406a')
def phone():
    g = Grid(18, 44); g.rect(1, 4, 16, 40, 'r'); g.rect(0, 2, 18, 4, 'r'); g.rect(4, 0, 10, 3, 'r'); g.rect(3, 10, 12, 26, 'gl'); g.rect(8, 10, 2, 26, 'r'); g.rect(3, 22, 12, 1, 'r'); g.rect(4, 6, 10, 2, 'sign')
    return g, {'r': RED, 'gl': ('#ffe9a0', '#d8b860', '#7a5a20'), 'sign': '#fffbe8'}
def mailbox():
    g = Grid(12, 30); g.rect(2, 6, 8, 24, 'r'); g.ellipse(6, 6, 5, 4, 'r'); g.rect(3, 10, 6, 2, 'k'); g.rect(1, 28, 10, 2, 'r'); return g, {'r': RED, 'k': '#12040a'}
def table():
    g = Grid(30, 34); g.poly([(0, 10), (15, 0), (30, 10)], 'um'); g.rect(14, 10, 2, 22, 'm'); g.rect(6, 20, 18, 3, 'w'); g.rect(8, 23, 2, 10, 'm'); g.rect(20, 23, 2, 10, 'm'); g.rect(0, 26, 3, 8, 'm'); g.rect(27, 26, 3, 8, 'm')
    for x in range(0, 30, 6): g.rect(x, 9, 3, 2, 'um2')
    return g, {'um': RED, 'um2': CR, 'm': DARK, 'w': CR}
def planter():
    g = Grid(20, 22); g.rect(1, 12, 18, 10, 'wd'); g.rect(0, 11, 20, 2, 'wd'); g.ellipse(6, 8, 5, 5, 'lf'); g.ellipse(13, 6, 6, 6, 'lf'); g.put(5, 6, 'fl'); g.put(13, 3, 'fl'); g.put(16, 7, 'fl'); return g, {'wd': WOOD, 'lf': GRN, 'fl': '#ff2630'}
def stall():
    g = Grid(42, 40); g.rect(2, 12, 2, 28, 'wd'); g.rect(38, 12, 2, 28, 'wd'); g.rect(0, 22, 42, 6, 'wd'); g.rect(0, 0, 42, 12, 'aw'); g.rect(2, 18, 10, 4, 'f1'); g.rect(14, 18, 10, 4, 'f2'); g.rect(28, 18, 10, 4, 'f1')
    for x in range(0, 42, 8): g.rect(x, 0, 4, 12, 'aw2')
    return g, {'wd': WOOD, 'aw': RED, 'aw2': CR, 'f1': YEL, 'f2': GRN}
def barrier():
    g = Grid(36, 18); g.rect(0, 2, 36, 6, 'w'); g.rect(3, 8, 3, 10, 'w'); g.rect(30, 8, 3, 10, 'w')
    for x in range(0, 36, 8): g.poly([(x, 8), (x + 4, 2), (x + 8, 2), (x + 4, 8)], 'r')
    return g, {'w': ('#ffffff', '#e8dcc8', '#a8987a'), 'r': RED}
def loo():
    g = Grid(20, 44); g.rect(0, 4, 20, 40, 'b'); g.rect(0, 0, 20, 5, 'b2'); g.rect(4, 10, 12, 30, 'd'); g.rect(13, 24, 2, 4, 'k'); g.rect(6, 12, 8, 3, 'v'); return g, {'b': BLU, 'b2': ('#ffffff', '#c8d8e8', '#6a7a8a'), 'd': ('#6ab0e8', '#2a6aa8', '#0a2a50'), 'k': '#12040a', 'v': '#12040a'}
def girders():
    g = Grid(44, 16)
    for i, y in enumerate((10, 5, 0)):
        g.rect(2 + i * 3, y, 40 - i * 6, 2, 'r'); g.rect(2 + i * 3, y + 4, 40 - i * 6, 1, 'r')
        for x in range(4 + i * 3, 42 - i * 3, 6): g.line(x, y + 1, x + 3, y + 4, 'r')
    return g, {'r': ('#ff6a3a', '#c43a10', '#5a1808')}
def warn():
    g = Grid(22, 40); g.rect(10, 18, 2, 22, 'm'); g.poly([(11, 0), (22, 19), (0, 19)], 'y'); g.rect(10, 6, 2, 7, 'k'); g.rect(10, 15, 2, 2, 'k'); return g, {'m': DARK, 'y': YEL, 'k': '#12040a'}
def lamp2():
    g = Grid(26, 82); g.rect(11, 8, 3, 74, 'i'); g.rect(8, 78, 9, 4, 'i'); g.rect(11, 6, 14, 3, 'i'); g.rect(19, 9, 6, 4, 'lt'); return g, {'i': DARK, 'lt': ('#fff6c0', '#ffd860', '#c08a20')}
def paper():
    g = Grid(16, 26); g.rect(0, 2, 16, 20, 'r'); g.rect(2, 6, 12, 8, 'gl'); g.rect(3, 22, 2, 4, 'm'); g.rect(11, 22, 2, 4, 'm'); g.rect(0, 0, 16, 3, 'r'); return g, {'r': ('#ffd860', '#c89a20', '#5a4008'), 'gl': CR, 'm': DARK}
def watertower():
    g = Grid(40, 70); g.rect(4, 30, 3, 40, 'i'); g.rect(33, 30, 3, 40, 'i'); g.line(6, 40, 34, 66, 'i'); g.line(34, 40, 6, 66, 'i'); g.rect(2, 8, 36, 24, 'wd'); g.poly([(0, 9), (20, 0), (40, 9)], 'rf')
    for x in range(4, 38, 5): g.rect(x, 9, 1, 22, 'band')
    g.rect(2, 16, 36, 1, 'band'); g.rect(2, 26, 36, 1, 'band'); return g, {'i': DARK, 'wd': WOOD, 'rf': DARK, 'band': ('#3a240e', '#3a240e', '#3a240e')}
def ac():
    g = Grid(30, 22); g.rect(0, 2, 30, 20, 'g'); g.ellipse(10, 12, 7, 7, 'k'); g.ellipse(10, 12, 2, 2, 'g'); g.line(4, 12, 16, 12, 'g'); g.line(10, 6, 10, 18, 'g')
    for y in range(5, 20, 3): g.rect(20, y, 8, 1, 'k')
    return g, {'g': GREY, 'k': ('#2a262c', '#1a161c', '#0a080c')}
def antenna():
    g = Grid(24, 70); g.rect(11, 0, 2, 70, 'i')
    for y, w in ((8, 22), (18, 16), (28, 12), (38, 8)): g.rect(12 - w // 2, y, w, 2, 'i')
    g.rect(10, 0, 4, 3, 'red'); return g, {'i': DARK, 'red': '#ff2630'}
def chimney():
    g = Grid(18, 34); g.rect(1, 4, 16, 30, 'b'); g.rect(0, 0, 18, 5, 'b')
    for y in range(8, 34, 5): g.rect(1, y, 16, 1, 'm')
    return g, {'b': ('#9a3a2a', '#6a2418', '#2a0c08'), 'm': '#2a0c08'}
def dish():
    g = Grid(26, 30); g.ellipse(13, 10, 12, 9, 'g'); g.ellipse(14, 10, 8, 6, 'g2'); g.line(13, 10, 20, 2, 'k'); g.rect(12, 18, 3, 12, 'k'); g.rect(6, 28, 14, 2, 'k'); return g, {'g': GREY, 'g2': ('#e8e0e8', '#b8b0b8', '#6a626a'), 'k': DARK}
def subsign():  # the Night City Metro sign: a cream drop in a red square
    g = Grid(24, 60); g.rect(11, 22, 3, 38, 'i'); g.rect(0, 0, 24, 22, 'r'); g.rect(3, 3, 18, 16, 'k'); g.ellipse(12, 13, 5, 5, 'w'); g.poly([(8, 11), (12, 4), (16, 11)], 'w'); return g, {'i': DARK, 'r': RED, 'w': CR, 'k': ('#2a0a10', '#1a0608', '#0a0204')}
def subbench():
    g = Grid(34, 16); g.rect(0, 4, 34, 3, 'g'); g.rect(0, 0, 34, 3, 'g'); g.rect(3, 7, 3, 9, 'k'); g.rect(28, 7, 3, 9, 'k'); return g, {'g': GREY, 'k': DARK}
def poster():
    g = Grid(26, 40); g.rect(0, 0, 26, 34, 'f'); g.rect(2, 2, 22, 30, 'p'); g.ellipse(13, 14, 7, 8, 'c'); g.rect(4, 25, 18, 2, 'r'); g.rect(4, 28, 12, 2, 'r'); g.rect(4, 34, 2, 6, 'f'); g.rect(20, 34, 2, 6, 'f')
    return g, {'f': DARK, 'p': ('#2a0a10', '#2a0a10', '#2a0a10'), 'c': CR, 'r': '#ff2630'}
def pillar():
    g = Grid(20, 96); g.rect(2, 0, 16, 96, 't'); g.rect(0, 0, 20, 6, 'g'); g.rect(0, 90, 20, 6, 'g')
    for y in range(8, 90, 8): g.rect(2, y, 16, 1, 'k')
    return g, {'t': ('#e8e0c8', '#b8b098', '#6a6450'), 'g': GREY, 'k': ('#8a846c', '#8a846c', '#8a846c')}
def neonarrow():
    g = Grid(34, 64); g.rect(5, 16, 3, 48, 'i'); g.poly([(0, 2), (26, 2), (34, 9), (26, 16), (0, 16)], 'bx'); g.poly([(4, 6), (24, 6), (28, 9), (24, 12), (4, 12)], 'neo'); return g, {'i': DARK, 'bx': ('#2a0a10', '#1a0608', '#0a0204'), 'neo': ('#ff9ad8', '#ff2a8a', '#8a0a4a')}
def puddle():
    g = Grid(30, 5); g.ellipse(15, 2.5, 15, 2.5, 'w'); g.rect(6, 1, 6, 1, 'hi'); return g, {'w': ('#5a1a2a', '#3a0e1a', '#1a0408'), 'hi': '#ff6a8a'}
def crate():
    g = Grid(20, 20); g.rect(0, 0, 20, 20, 'wd'); g.line(1, 1, 18, 18, 'm'); g.line(18, 1, 1, 18, 'm'); g.rect(0, 0, 20, 2, 'm'); g.rect(0, 18, 20, 2, 'm'); return g, {'wd': WOOD, 'm': ('#5a3a1a', '#5a3a1a', '#3a240e')}
def crates():
    g = Grid(40, 38)
    for x, y in ((0, 18), (20, 18), (10, 0)):
        g.rect(x, y, 20, 20, 'wd'); g.line(x + 1, y + 1, x + 18, y + 18, 'm'); g.rect(x, y, 20, 2, 'm'); g.rect(x, y + 18, 20, 2, 'm')
    return g, {'wd': WOOD, 'm': ('#5a3a1a', '#5a3a1a', '#3a240e')}
def bollard():
    g = Grid(14, 18); g.rect(2, 4, 10, 14, 'i'); g.ellipse(7, 4, 6, 3, 'i'); g.rect(0, 6, 14, 2, 'i'); return g, {'i': DARK}
def rope():
    g = Grid(20, 10); g.ellipse(10, 6, 9, 4, 'r'); g.ellipse(10, 6, 5, 2, 'k'); g.line(18, 6, 20, 2, 'r'); return g, {'r': ('#e8c88a', '#b8984a', '#6a5020'), 'k': ('#3a2a14', '#3a2a14', '#3a2a14')}
def buoy():
    g = Grid(16, 22); g.ellipse(8, 14, 7, 7, 'r'); g.rect(1, 12, 14, 3, 'w'); g.rect(7, 0, 2, 8, 'k'); g.rect(5, 0, 6, 3, 'y'); return g, {'r': RED, 'w': CR, 'k': DARK, 'y': YEL}
def vent2():
    g = Grid(20, 26); g.rect(6, 8, 8, 18, 'g'); g.poly([(2, 8), (10, 0), (18, 8)], 'g'); g.rect(2, 8, 16, 2, 'k'); return g, {'g': GREY, 'k': DARK}
def pipe():
    g = Grid(18, 40); g.rect(5, 0, 8, 40, 'p'); g.rect(3, 6, 12, 3, 'p'); g.rect(3, 30, 12, 3, 'p'); g.rect(6, 36, 6, 4, 'c'); return g, {'p': ('#7a8a6a', '#4a5a3a', '#1a2412'), 'c': CR}
def grate():
    g = Grid(28, 6); g.rect(0, 0, 28, 6, 'k')
    for x in range(2, 28, 4): g.rect(x, 1, 2, 4, 'g')
    return g, {'k': DARK, 'g': ('#1a1a1e', '#0a0a0e', '#000000')}
def crashbar():
    g = Grid(48, 16); g.rect(0, 2, 48, 6, 'g'); g.rect(0, 4, 48, 2, 'k')
    for x in (4, 22, 40): g.rect(x, 8, 4, 8, 'k')
    return g, {'g': GREY, 'k': DARK}
def roadsign():
    g = Grid(30, 56); g.rect(14, 20, 3, 36, 'i'); g.rect(0, 0, 30, 20, 'gr'); g.rect(2, 2, 26, 16, 'gr2'); g.rect(6, 8, 18, 2, 'w'); g.poly([(20, 5), (25, 9), (20, 13)], 'w'); return g, {'i': DARK, 'gr': ('#ffffff', '#e8e8e8', '#8a8a8a'), 'gr2': ('#3a8a4a', '#1a6a2a', '#0a3a14'), 'w': '#ffffff'}
def grave():
    g = Grid(18, 26); g.rect(1, 8, 16, 18, 's'); g.ellipse(9, 8, 8, 7, 's'); g.rect(8, 6, 2, 10, 'k'); g.rect(5, 9, 8, 2, 'k'); g.put(2, 22, 'm'); g.put(14, 23, 'm'); return g, {'s': STONE, 'k': '#2a2620', 'm': '#6a8a3a'}
def fence():
    g = Grid(48, 34); g.rect(0, 10, 48, 2, 'i'); g.rect(0, 26, 48, 2, 'i')
    for x in range(1, 48, 6): g.rect(x, 4, 2, 30, 'i'); g.poly([(x - 1, 5), (x + 1, 0), (x + 3, 5)], 'i')
    return g, {'i': DARK}
def candle():
    g = Grid(10, 18); g.rect(3, 6, 4, 12, 'c'); g.ellipse(5, 3, 2, 3, 'f'); g.rect(4, 4, 2, 2, 'f2'); return g, {'c': CR, 'f': ('#ffe36a', '#ff9a30', '#c4121c'), 'f2': '#ffffff'}
def cross():
    g = Grid(18, 34); g.rect(7, 0, 4, 34, 's'); g.rect(1, 8, 16, 4, 's'); g.put(3, 30, 'm'); return g, {'s': STONE, 'm': '#6a8a3a'}
def train():  # the subway train, its cab end: comes through the low road with its lights on
    g = Grid(140, 46); g.rect(0, 4, 140, 38, 'b'); g.rect(0, 0, 140, 5, 'rf'); g.rect(0, 22, 140, 4, 'st')
    for x in range(6, 120, 22): g.rect(x, 8, 16, 11, 'w')
    g.poly([(120, 4), (140, 10), (140, 42), (120, 42)], 'b'); g.rect(128, 12, 8, 8, 'w'); g.rect(134, 32, 5, 4, 'lt'); g.rect(4, 40, 132, 4, 'k')
    for x in (12, 40, 96, 124): g.ellipse(x, 43, 4, 3, 'k')
    return g, {'b': ('#c8c0c8', '#8a8290', '#3a343c'), 'rf': DARK, 'st': RED, 'w': ('#fff2b0', '#e0c060', '#7a5a20'), 'lt': '#ffffff', 'k': '#12040a'}
def car():  # a boxy black cab with red trim: traffic on the street
    g = Grid(64, 28); g.rect(0, 12, 64, 12, 'b'); g.poly([(12, 12), (18, 2), (44, 2), (52, 12)], 'b'); g.rect(20, 4, 10, 8, 'w'); g.rect(33, 4, 10, 8, 'w'); g.rect(0, 16, 64, 2, 'r'); g.rect(60, 14, 4, 4, 'lt'); g.rect(0, 14, 3, 4, 'tl')
    g.ellipse(14, 24, 6, 5, 'k'); g.ellipse(50, 24, 6, 5, 'k'); g.ellipse(14, 24, 2, 2, 'hub'); g.ellipse(50, 24, 2, 2, 'hub')
    return g, {'b': ('#4a4450', '#24202a', '#0e0c12'), 'w': ('#bfe8ff', '#6aa8c8', '#2a4a6a'), 'r': RED, 'lt': '#fff6c0', 'tl': '#ff2630', 'k': '#12040a', 'hub': '#8a8290'}
def awning():  # a shop awning you bounce on
    g = Grid(48, 14); g.poly([(0, 0), (48, 0), (44, 12), (4, 12)], 'a')
    for x in range(0, 48, 8): g.poly([(x, 0), (x + 4, 0), (x + 4 - (x - 24) * 0.08, 12), (x - (x - 24) * 0.08, 12)], 'a2')
    g.rect(0, 12, 48, 2, 'k'); return g, {'a': RED, 'a2': CR, 'k': DARK}
def barge():  # a cream barge on the canal
    g = Grid(64, 18); g.poly([(0, 4), (64, 4), (58, 16), (6, 16)], 'h'); g.rect(0, 2, 64, 4, 'rim'); g.rect(20, 0, 8, 4, 'c'); g.rect(36, 0, 8, 4, 'c'); return g, {'h': ('#5a3a24', '#3a2414', '#1a0e06'), 'rim': WOOD, 'c': ('#f1e0b0', '#c8b080', '#7a6040')}
def line():  # a washing line with laundry: you can stand on it
    g = Grid(64, 20); g.line(0, 2, 32, 5, 'r'); g.line(32, 5, 64, 2, 'r')
    for x, c in ((8, 'a'), (22, 'b'), (40, 'a'), (52, 'c')): g.rect(x, 4, 8, 10, c); g.rect(x + 2, 14, 4, 4, c)
    return g, {'r': CR, 'a': RED, 'b': CR, 'c': ('#9a7ac8', '#6a4a98', '#2a1a48')}
FURN = {'phone': phone, 'mailbox': mailbox, 'table': table, 'planter': planter, 'stall': stall, 'barrier': barrier, 'loo': loo, 'girders': girders, 'warn': warn, 'lamp2': lamp2, 'paper': paper,
        'watertower': watertower, 'ac': ac, 'antenna': antenna, 'chimney': chimney, 'dish': dish, 'subsign': subsign, 'subbench': subbench, 'poster': poster, 'pillar': pillar, 'neonarrow': neonarrow,
        'puddle': puddle, 'crate': crate, 'crates': crates, 'bollard': bollard, 'rope': rope, 'buoy': buoy, 'vent2': vent2, 'pipe': pipe, 'grate': grate, 'crashbar': crashbar, 'roadsign': roadsign,
        'grave': grave, 'fence': fence, 'candle': candle, 'cross': cross, 'train': train, 'car': car, 'awning': awning, 'barge': barge, 'washline': line}

ART = {'hog_chal0': chalice(0), 'hog_chal1': chalice(1), 'hog_chal2': chalice(2), 'hog_chal3': chalice(3), 'hog_chal4': chalice(4), 'hog_chal5': chalice(5), 'hog_chal6': chalice(6), 'hog_lamp': lamp, 'hog_hydrant': hydrant, 'hog_bin': binb, 'hog_bench': bench, 'hog_bus': busstop, 'hog_cone': cone, 'hog_drop': drop, 'hog_shot': shot, 'hog_ishield': ishield, 'hog_ishoes': ishoes, 'hog_istar': istar}
ART.update({'hog_' + k: f for k, f in FURN.items()})
