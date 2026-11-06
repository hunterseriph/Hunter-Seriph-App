"""Cumhead the Spermhog's own art: the drop, Cumhead's shot and the item box icons. Cumhead is his own atlas,
the foes and bosses come from tools/foes (Load Legacy's), the saws and logs are props, the freed homunculus is a breed."""
from pixelkit import Grid
FOES = ['crawler', 'clown', 'rat', 'bat', 'balloon', 'cultrat', 'creamblob', 'crow', 'slime', 'toymouse', 'pieling', 'skeleton', 'bonehound', 'gravehand', 'wraith', 'mummy',
        'magmaslug', 'golem', 'corkbot', 'emberbat', 'imp', 'blumguard', 'blumling', 'blumeye', 'blumspore', 'knight', 'beast', 'kraken', 'pig', 'boner', 'hotload', 'blum', 'blum2']
USE = ['ch_*', 'cumface'] + ['f_%s_*' % f for f in FOES] + ['p_saw0', 'p_saw1', 'p_logboat', 'h_gloop_baby_idle*', 'h_*_adult_*', 'f_pig_*', 'f_cowpig_*', 'h_*_baby_idle0', 'greebo_*', 'npc_greebo', 'cat', 'fac_*', 'steve0', 'steve1', 'p_ribs', 'p_skulls', 'p_crucible', 'p_chandelier']
CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); RED = ('#ff3a44', '#c4121c', '#6a0a10'); GOLD = ('#fff09a', '#ffc840', '#a8741a'); BLUE = ('#9adfff', '#3a8ac8', '#14406a')

def drop():
    g = Grid(10, 13); g.ellipse(5, 8.5, 4.2, 4.2, 'd'); g.poly([(2, 7), (5, 0), (8, 7)], 'd'); g.put(3, 7, 'hi'); g.put(3, 8, 'hi')
    return g, {'d': CREAM, 'hi': '#ffffff'}

def shot():
    g = Grid(16, 9); g.ellipse(11, 4.5, 4, 3.5, 'c'); g.poly([(0, 4), (8, 2), (8, 7)], 'c'); g.put(12, 3, 'hi')
    return g, {'c': CREAM, 'hi': '#ffffff'}

def ishield(): # a condom packet (his ask: every shield is a condom)
    from pixelkit import condom_pack
    return condom_pack(14, 14)

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
GREY = ('#c8c0c8', '#8a8290', '#3a343c'); DARK = ('#4a4450', '#2a2630', '#141218'); WOOD = ('#7a3a2a', '#4a1e16', '#200a06'); YEL = ('#ffe36a', '#d0a020', '#6a4a0a')
CR = ('#fffbe8', '#f1e0b0', '#b8a070'); GRN = ('#5a1a20', '#3a0e14', '#1a0408'); STONE = ('#a09a90', '#6a6660', '#2e2c28'); BLU = ('#ff6a70', '#c4121c', '#5a0a10')
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
    return g, {'wd': WOOD, 'aw': RED, 'aw2': CR, 'f1': CR, 'f2': RED}
def barrier():
    g = Grid(36, 18); g.rect(0, 2, 36, 6, 'w'); g.rect(3, 8, 3, 10, 'w'); g.rect(30, 8, 3, 10, 'w')
    for x in range(0, 36, 8): g.poly([(x, 8), (x + 4, 2), (x + 8, 2), (x + 4, 8)], 'r')
    return g, {'w': ('#ffffff', '#e8dcc8', '#a8987a'), 'r': RED}
def loo():
    g = Grid(20, 44); g.rect(0, 4, 20, 40, 'b'); g.rect(0, 0, 20, 5, 'b2'); g.rect(4, 10, 12, 30, 'd'); g.rect(13, 24, 2, 4, 'k'); g.rect(6, 12, 8, 3, 'v'); return g, {'b': RED, 'b2': ('#fffbe8', '#e8dcc8', '#a8987a'), 'd': ('#8a1a20', '#5a0a10', '#2a0408'), 'k': '#12040a', 'v': '#12040a'}
def girders():
    g = Grid(44, 16)
    for i, y in enumerate((10, 5, 0)):
        g.rect(2 + i * 3, y, 40 - i * 6, 2, 'r'); g.rect(2 + i * 3, y + 4, 40 - i * 6, 1, 'r')
        for x in range(4 + i * 3, 42 - i * 3, 6): g.line(x, y + 1, x + 3, y + 4, 'r')
    return g, {'r': ('#ff6a3a', '#c43a10', '#5a1808')}
def warn():
    g = Grid(22, 40); g.rect(10, 18, 2, 22, 'm'); g.poly([(11, 0), (22, 19), (0, 19)], 'y'); g.rect(10, 6, 2, 7, 'k'); g.rect(10, 15, 2, 2, 'k'); return g, {'m': DARK, 'y': RED, 'k': '#fffbe8'}
def lamp2():
    g = Grid(26, 82); g.rect(11, 8, 3, 74, 'i'); g.rect(8, 78, 9, 4, 'i'); g.rect(11, 6, 14, 3, 'i'); g.rect(19, 9, 6, 4, 'lt'); return g, {'i': DARK, 'lt': ('#fff6c0', '#ffd860', '#c08a20')}
def paper():
    g = Grid(16, 26); g.rect(0, 2, 16, 20, 'r'); g.rect(2, 6, 12, 8, 'gl'); g.rect(3, 22, 2, 4, 'm'); g.rect(11, 22, 2, 4, 'm'); g.rect(0, 0, 16, 3, 'r'); return g, {'r': RED, 'gl': CR, 'm': DARK}
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
    return g, {'t': ('#8a2a30', '#5a1418', '#2a0608'), 'g': GREY, 'k': ('#2a0608', '#2a0608', '#2a0608')}
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
    g = Grid(18, 40); g.rect(5, 0, 8, 40, 'p'); g.rect(3, 6, 12, 3, 'p'); g.rect(3, 30, 12, 3, 'p'); g.rect(6, 36, 6, 4, 'c'); return g, {'p': ('#6a5a5e', '#3a2e32', '#141012'), 'c': CR}
def grate():
    g = Grid(28, 6); g.rect(0, 0, 28, 6, 'k')
    for x in range(2, 28, 4): g.rect(x, 1, 2, 4, 'g')
    return g, {'k': DARK, 'g': ('#1a1a1e', '#0a0a0e', '#000000')}
def crashbar():
    g = Grid(48, 16); g.rect(0, 2, 48, 6, 'g'); g.rect(0, 4, 48, 2, 'k')
    for x in (4, 22, 40): g.rect(x, 8, 4, 8, 'k')
    return g, {'g': GREY, 'k': DARK}
def roadsign():
    g = Grid(30, 56); g.rect(14, 20, 3, 36, 'i'); g.rect(0, 0, 30, 20, 'gr'); g.rect(2, 2, 26, 16, 'gr2'); g.rect(6, 8, 18, 2, 'w'); g.poly([(20, 5), (25, 9), (20, 13)], 'w'); return g, {'i': DARK, 'gr': ('#ffffff', '#e8e8e8', '#8a8a8a'), 'gr2': ('#c4121c', '#8a0a10', '#3a0408'), 'w': '#ffffff'}
def grave():
    g = Grid(18, 26); g.rect(1, 8, 16, 18, 's'); g.ellipse(9, 8, 8, 7, 's'); g.rect(8, 6, 2, 10, 'k'); g.rect(5, 9, 8, 2, 'k'); g.put(2, 22, 'm'); g.put(14, 23, 'm'); return g, {'s': STONE, 'k': '#2a2620', 'm': '#c4121c'}
def fence():
    g = Grid(48, 34); g.rect(0, 10, 48, 2, 'i'); g.rect(0, 26, 48, 2, 'i')
    for x in range(1, 48, 6): g.rect(x, 4, 2, 30, 'i'); g.poly([(x - 1, 5), (x + 1, 0), (x + 3, 5)], 'i')
    return g, {'i': DARK}
def candle():
    g = Grid(10, 18); g.rect(3, 6, 4, 12, 'c'); g.ellipse(5, 3, 2, 3, 'f'); g.rect(4, 4, 2, 2, 'f2'); return g, {'c': CR, 'f': ('#ffe36a', '#ff9a30', '#c4121c'), 'f2': '#ffffff'}
def cross():
    g = Grid(18, 34); g.rect(7, 0, 4, 34, 's'); g.rect(1, 8, 16, 4, 's'); g.put(3, 30, 'm'); return g, {'s': STONE, 'm': '#c4121c'}
def train():  # the subway train, its cab end: comes through the low road with its lights on
    g = Grid(140, 46); g.rect(0, 4, 140, 38, 'b'); g.rect(0, 0, 140, 5, 'rf'); g.rect(0, 22, 140, 4, 'st')
    for x in range(6, 120, 22): g.rect(x, 8, 16, 11, 'w')
    g.poly([(120, 4), (140, 10), (140, 42), (120, 42)], 'b'); g.rect(128, 12, 8, 8, 'w'); g.rect(134, 32, 5, 4, 'lt'); g.rect(4, 40, 132, 4, 'k')
    for x in (12, 40, 96, 124): g.ellipse(x, 43, 4, 3, 'k')
    return g, {'b': ('#c8c0c8', '#8a8290', '#3a343c'), 'rf': DARK, 'st': RED, 'w': ('#fff2b0', '#e0c060', '#7a5a20'), 'lt': '#ffffff', 'k': '#12040a'}
def car():  # a boxy black cab with red trim: traffic on the street
    g = Grid(64, 28); g.rect(0, 12, 64, 12, 'b'); g.poly([(12, 12), (18, 2), (44, 2), (52, 12)], 'b'); g.rect(20, 4, 10, 8, 'w'); g.rect(33, 4, 10, 8, 'w'); g.rect(0, 16, 64, 2, 'r'); g.rect(60, 14, 4, 4, 'lt'); g.rect(0, 14, 3, 4, 'tl')
    g.ellipse(14, 24, 6, 5, 'k'); g.ellipse(50, 24, 6, 5, 'k'); g.ellipse(14, 24, 2, 2, 'hub'); g.ellipse(50, 24, 2, 2, 'hub')
    return g, {'b': ('#4a4450', '#24202a', '#0e0c12'), 'w': ('#8a2a30', '#5a1418', '#2a0608'), 'r': RED, 'lt': '#fff6c0', 'tl': '#ff2630', 'k': '#12040a', 'hub': '#8a8290'}
def awning():  # a shop awning you bounce on
    g = Grid(48, 14); g.poly([(0, 0), (48, 0), (44, 12), (4, 12)], 'a')
    for x in range(0, 48, 8): g.poly([(x, 0), (x + 4, 0), (x + 4 - (x - 24) * 0.08, 12), (x - (x - 24) * 0.08, 12)], 'a2')
    g.rect(0, 12, 48, 2, 'k'); return g, {'a': RED, 'a2': CR, 'k': DARK}
def barge():  # a cream barge on the canal
    g = Grid(64, 18); g.poly([(0, 4), (64, 4), (58, 16), (6, 16)], 'h'); g.rect(0, 2, 64, 4, 'rim'); g.rect(20, 0, 8, 4, 'c'); g.rect(36, 0, 8, 4, 'c'); return g, {'h': ('#5a3a24', '#3a2414', '#1a0e06'), 'rim': WOOD, 'c': ('#f1e0b0', '#c8b080', '#7a6040')}
def line():  # a washing line with laundry: you can stand on it
    g = Grid(64, 20); g.line(0, 2, 32, 5, 'r'); g.line(32, 5, 64, 2, 'r')
    for x, c in ((8, 'a'), (22, 'b'), (40, 'a'), (52, 'c')): g.rect(x, 4, 8, 10, c); g.rect(x + 2, 14, 4, 4, c)
    return g, {'r': CR, 'a': RED, 'b': CR, 'c': ('#4a4450', '#2a2630', '#141218')}
FURN = {'phone': phone, 'mailbox': mailbox, 'table': table, 'planter': planter, 'stall': stall, 'barrier': barrier, 'loo': loo, 'girders': girders, 'warn': warn, 'lamp2': lamp2, 'paper': paper,
        'watertower': watertower, 'ac': ac, 'antenna': antenna, 'chimney': chimney, 'dish': dish, 'subsign': subsign, 'subbench': subbench, 'poster': poster, 'pillar': pillar, 'neonarrow': neonarrow,
        'puddle': puddle, 'crate': crate, 'crates': crates, 'bollard': bollard, 'rope': rope, 'buoy': buoy, 'vent2': vent2, 'pipe': pipe, 'grate': grate, 'crashbar': crashbar, 'roadsign': roadsign,
        'grave': grave, 'fence': fence, 'candle': candle, 'cross': cross, 'train': train, 'car': car, 'awning': awning, 'barge': barge, 'washline': line}

# ---------- the other zones' furniture and set-piece machines ----------
RUST = ('#c4643a', '#8a3a1a', '#3a1408'); SLIME = ('#fffbe8', '#f1e0b0', '#a89060'); BONE = ('#f1e7d0', '#c8b898', '#6a5a44'); STEEL = ('#9a96a0', '#5a5660', '#24222a'); GOLD = ('#fff09a', '#ffc840', '#a8741a')
def valve():
    g = Grid(24, 30); g.rect(10, 10, 4, 20, 'p'); g.ellipse(12, 8, 10, 7, 'w'); g.ellipse(12, 8, 6, 4, 'k'); g.line(12, 2, 12, 14, 'w'); g.line(4, 8, 20, 8, 'w'); return g, {'p': STEEL, 'w': RED, 'k': '#12040a'}
def sludge():
    g = Grid(20, 26); g.rect(2, 4, 16, 22, 'b'); g.rect(1, 3, 18, 3, 'b'); g.rect(2, 10, 16, 2, 'k'); g.rect(2, 19, 16, 2, 'k'); g.ellipse(10, 4, 7, 2, 'c'); g.rect(13, 5, 3, 7, 'c'); return g, {'b': ('#4a5a4a', '#2e3a2e', '#121a12'), 'k': '#12040a', 'c': SLIME}
def ladder():
    g = Grid(18, 64); g.rect(2, 0, 2, 64, 'i'); g.rect(14, 0, 2, 64, 'i')
    for y in range(4, 64, 8): g.rect(2, y, 14, 2, 'i')
    return g, {'i': STEEL}
def fungus():
    g = Grid(22, 22); g.rect(9, 10, 4, 12, 's'); g.ellipse(11, 9, 10, 6, 'c'); g.put(7, 7, 'd'); g.put(14, 6, 'd'); g.put(11, 9, 'd'); return g, {'s': SLIME, 'c': ('#8a2a30', '#5a1418', '#2a0608'), 'd': '#fffbe8'}
def drip():
    g = Grid(14, 40); g.rect(0, 0, 14, 8, 'p'); g.rect(4, 8, 6, 4, 'p'); g.rect(6, 12, 2, 10, 'c'); g.ellipse(7, 26, 2, 3, 'c'); return g, {'p': STEEL, 'c': SLIME}
def booth():
    g = Grid(34, 50); g.rect(2, 14, 30, 36, 'r'); g.poly([(0, 14), (17, 0), (34, 14)], 'k'); g.rect(6, 20, 22, 12, 'gl'); g.rect(4, 34, 26, 3, 'g'); g.rect(13, 3, 8, 6, 'g'); return g, {'r': RED, 'k': ('#2a0a10', '#1a0608', '#0a0204'), 'gl': ('#ffe9a0', '#d8b860', '#7a5a20'), 'g': GOLD}
def popcorn():
    g = Grid(24, 40); g.rect(2, 16, 20, 24, 'r'); g.rect(4, 6, 16, 12, 'gl'); g.ellipse(12, 10, 6, 4, 'c'); g.rect(0, 2, 24, 4, 'r'); g.rect(5, 38, 4, 2, 'k'); g.rect(15, 38, 4, 2, 'k'); g.rect(4, 22, 16, 2, 'g'); return g, {'r': RED, 'gl': ('#fff6d8', '#e8d8b0', '#a89870'), 'c': CR, 'g': GOLD, 'k': '#12040a'}
def balloons():
    g = Grid(26, 56); g.rect(8, 40, 10, 16, 'r'); g.line(13, 40, 6, 14, 'k'); g.line(13, 40, 13, 10, 'k'); g.line(13, 40, 20, 14, 'k')
    for x, y, c in ((6, 10, 'r'), (13, 6, 'b'), (20, 10, 'g')): g.ellipse(x, y, 5, 6, c)
    return g, {'r': RED, 'b': ('#4a4450', '#24202a', '#0e0c12'), 'g': GOLD, 'k': '#12040a'}
def queue():
    g = Grid(48, 22); g.rect(0, 6, 48, 2, 'g'); g.line(0, 7, 24, 12, 'r'); g.line(24, 12, 48, 7, 'r')
    for x in (1, 23, 45): g.rect(x, 4, 3, 18, 'g'); g.rect(x - 1, 20, 5, 2, 'g')
    return g, {'g': GOLD, 'r': RED}
def bulbarch():
    g = Grid(60, 50); g.rect(0, 10, 4, 40, 'i'); g.rect(56, 10, 4, 40, 'i'); g.rect(0, 8, 60, 4, 'i')
    for x in range(2, 60, 6): g.ellipse(x, 10, 1.5, 1.5, 'b')
    return g, {'i': ('#2a0a10', '#1a0608', '#0a0204'), 'b': ('#fff6c0', '#ffd860', '#c08a20')}
def ridesign():
    g = Grid(30, 56); g.rect(13, 20, 4, 36, 'i'); g.ellipse(15, 11, 14, 10, 'r'); g.ellipse(15, 11, 10, 7, 'k'); g.poly([(10, 11), (20, 5), (20, 17)], 'g'); return g, {'i': DARK, 'r': GOLD, 'k': ('#2a0a10', '#1a0608', '#0a0204'), 'g': RED}
def skullpile():
    g = Grid(30, 20)
    for x, y in ((5, 14), (15, 14), (25, 14), (10, 7), (20, 7), (15, 1)): g.ellipse(x, y + 3, 4.5, 4, 'b'); g.put(x - 2, y + 3, 'k'); g.put(x + 1, y + 3, 'k')
    return g, {'b': BONE, 'k': '#12040a'}
def bonefence():
    g = Grid(46, 30)
    for x in range(2, 46, 8): g.rect(x, 4, 3, 26, 'b'); g.ellipse(x + 1, 3, 3, 2.5, 'b')
    g.rect(0, 12, 46, 2, 'b'); g.rect(0, 22, 46, 2, 'b'); return g, {'b': BONE}
def coffinup():
    g = Grid(20, 44); g.poly([(6, 0), (14, 0), (20, 12), (16, 44), (4, 44), (0, 12)], 'w'); g.rect(9, 10, 2, 16, 'k'); g.rect(5, 15, 10, 2, 'k'); return g, {'w': ('#5a2a20', '#3a1610', '#1a0806'), 'k': '#c8b898'}
def lantern():
    g = Grid(14, 50); g.rect(6, 14, 2, 36, 'i'); g.rect(2, 2, 10, 12, 'i'); g.rect(4, 4, 6, 8, 'f'); g.rect(4, 0, 6, 2, 'i'); return g, {'i': DARK, 'f': ('#ff9a6a', '#ff2630', '#8a0a10')}
def barrels():
    g = Grid(40, 30)
    for x, y in ((0, 12), (20, 12), (10, 0)): g.rect(x + 1, y, 18, 18, 'b'); g.rect(x, y + 3, 20, 2, 'k'); g.rect(x, y + 13, 20, 2, 'k')
    return g, {'b': RUST, 'k': ('#2a0a06', '#2a0a06', '#2a0a06')}
def gastank():
    g = Grid(30, 50); g.rect(3, 8, 24, 38, 't'); g.ellipse(15, 8, 12, 6, 't'); g.rect(13, 0, 4, 4, 'k'); g.rect(3, 20, 24, 3, 'r'); g.rect(6, 46, 4, 4, 'k'); g.rect(20, 46, 4, 4, 'k'); return g, {'t': STEEL, 'r': RED, 'k': '#12040a'}
def pallet():
    g = Grid(32, 26); g.rect(0, 20, 32, 6, 'w'); g.rect(2, 2, 28, 18, 'box'); g.line(2, 2, 30, 19, 'k'); g.rect(2, 10, 28, 1, 'k'); return g, {'w': WOOD, 'box': ('#c8b898', '#8a7a64', '#3a2e24'), 'k': '#3a2e24'}
def gauge():
    g = Grid(26, 40); g.rect(11, 18, 4, 22, 'p'); g.ellipse(13, 10, 11, 10, 's'); g.ellipse(13, 10, 8, 7, 'w'); g.line(13, 10, 18, 5, 'r'); g.rect(4, 26, 18, 4, 's'); return g, {'p': STEEL, 's': STEEL, 'w': CR, 'r': RED}
def hoist():
    g = Grid(20, 80); g.rect(9, 0, 2, 60, 'c')
    for y in range(0, 60, 4): g.rect(8, y, 4, 2, 'c')
    g.poly([(4, 60), (16, 60), (14, 70), (6, 70)], 'h'); g.rect(8, 70, 4, 8, 'h'); return g, {'c': STEEL, 'h': RUST}
def anvil():
    g = Grid(30, 20); g.poly([(0, 2), (30, 2), (24, 8), (6, 8)], 's'); g.rect(10, 8, 10, 8, 's'); g.rect(6, 16, 18, 4, 's'); return g, {'s': DARK}
def terminal():
    g = Grid(28, 40); g.rect(2, 14, 24, 26, 's'); g.rect(0, 0, 28, 16, 's'); g.rect(3, 3, 22, 10, 'sc'); g.rect(5, 5, 10, 1, 'r'); g.rect(5, 8, 14, 1, 'r'); g.rect(6, 20, 4, 3, 'r'); g.rect(14, 20, 4, 3, 'g'); return g, {'s': STEEL, 'sc': ('#2a0a10', '#1a0608', '#0a0204'), 'r': '#ff2630', 'g': '#ffe36a'}
def specimen():  # a jar with a sleeping homunculus in it
    g = Grid(26, 50); g.rect(1, 44, 24, 6, 's'); g.rect(1, 0, 24, 6, 's'); g.rect(3, 6, 20, 38, 'gl'); g.ellipse(13, 26, 7, 9, 'h'); g.put(10, 23, 'k'); g.put(15, 23, 'k'); g.rect(6, 10, 2, 30, 'hi')
    return g, {'s': STEEL, 'gl': ('#5a1a20', '#3a0e14', '#1a0408'), 'h': ('#c8f0a0', '#80c060', '#3a6a20'), 'k': '#12040a', 'hi': '#ff8a90'}
def rack():
    g = Grid(24, 60); g.rect(0, 0, 24, 60, 's')
    for y in range(4, 56, 6): g.rect(3, y, 18, 4, 'k'); g.put(5, y + 1, 'r'); g.put(8, y + 1, 'g')
    return g, {'s': STEEL, 'k': ('#1a161c', '#1a161c', '#0a080c'), 'r': '#ff2630', 'g': '#ffe36a'}
def cables():
    g = Grid(40, 14)
    for i, c in enumerate(('a', 'b', 'a')): g.line(0, 4 + i * 3, 40, 8 + i * 2, c, 1)
    return g, {'a': ('#2a2630', '#141218', '#0a080c'), 'b': RED}
def blumbanner():
    g = Grid(28, 60); g.rect(12, 0, 4, 60, 'i'); g.rect(2, 4, 24, 34, 'r'); g.poly([(2, 38), (14, 46), (26, 38)], 'r'); g.ellipse(14, 20, 7, 8, 'p'); g.put(11, 18, 'k'); g.put(17, 18, 'k'); return g, {'i': DARK, 'r': ('#8a1a20', '#5a0a10', '#2a0408'), 'p': ('#c080ff', '#8a40d0', '#3a1060'), 'k': '#12040a'}
# set-piece machines
def minecart():
    g = Grid(44, 30); g.poly([(0, 2), (44, 2), (38, 22), (6, 22)], 'r'); g.rect(0, 0, 44, 4, 's'); g.ellipse(14, 4, 5, 3, 'ore'); g.ellipse(26, 3, 6, 3, 'ore'); g.ellipse(12, 25, 5, 5, 'k'); g.ellipse(32, 25, 5, 5, 'k'); return g, {'r': RUST, 's': STEEL, 'ore': BONE, 'k': '#12040a'}
def bumpercar():
    g = Grid(46, 30); g.rect(0, 14, 46, 12, 'r'); g.ellipse(23, 14, 18, 8, 'r'); g.rect(0, 22, 46, 4, 'bump'); g.rect(22, 0, 2, 12, 's'); g.rect(18, 0, 10, 2, 'g'); g.ellipse(23, 10, 5, 4, 'seat'); return g, {'r': RED, 'bump': ('#4a4450', '#2a2630', '#141218'), 's': STEEL, 'g': GOLD, 'seat': ('#2a0a10', '#1a0608', '#0a0204')}
def forklift():
    g = Grid(54, 40); g.rect(10, 14, 32, 18, 'y'); g.rect(14, 2, 2, 14, 'k'); g.rect(32, 2, 2, 14, 'k'); g.rect(14, 2, 20, 2, 'k'); g.rect(0, 4, 4, 30, 'k'); g.rect(0, 30, 12, 3, 'k'); g.ellipse(18, 34, 6, 6, 'k'); g.ellipse(38, 34, 5, 5, 'k'); g.rect(44, 18, 6, 12, 'y'); return g, {'y': RUST, 'k': ('#2a2630', '#141218', '#0a080c')}
def coaster():
    g = Grid(70, 34); g.poly([(0, 6), (60, 6), (70, 14), (70, 26), (0, 26)], 'r'); g.rect(0, 2, 60, 5, 'g'); g.rect(10, 0, 4, 8, 'k'); g.rect(30, 0, 4, 8, 'k'); g.rect(0, 16, 70, 3, 'g'); g.ellipse(14, 29, 5, 5, 'k'); g.ellipse(52, 29, 5, 5, 'k'); return g, {'r': RED, 'g': GOLD, 'k': '#12040a'}
def ghosttrain():
    g = Grid(110, 44); g.rect(0, 6, 110, 32, 'b'); g.rect(0, 2, 110, 6, 'k')
    for x in range(8, 100, 24): g.ellipse(x + 6, 18, 6, 7, 'w'); g.put(x + 4, 17, 'k'); g.put(x + 8, 17, 'k')
    for x in (14, 50, 90): g.ellipse(x, 40, 5, 4, 'k')
    return g, {'b': ('#3a1a2a', '#24101a', '#10060a'), 'k': '#12040a', 'w': BONE}
def oretrain():
    g = Grid(110, 40); g.rect(0, 10, 110, 24, 'r'); g.ellipse(25, 10, 18, 6, 'o'); g.ellipse(80, 10, 20, 6, 'o'); g.rect(0, 26, 110, 3, 'k')
    for x in (14, 44, 70, 100): g.ellipse(x, 36, 5, 4, 'k')
    return g, {'r': RUST, 'o': ('#ff9a6a', '#ff5a10', '#a02a04'), 'k': '#12040a'}
def missile():
    g = Grid(70, 24); g.poly([(0, 12), (14, 4), (14, 20)], 'r'); g.rect(14, 4, 46, 16, 's'); g.poly([(60, 4), (70, 0), (70, 24), (60, 20)], 'r'); g.rect(26, 8, 20, 2, 'r'); g.ellipse(36, 14, 4, 3, 'p'); return g, {'r': RED, 's': STEEL, 'p': ('#c080ff', '#8a40d0', '#3a1060')}
def creamwave():
    g = Grid(60, 60); g.poly([(0, 60), (8, 10), (24, 0), (40, 8), (52, 4), (60, 20), (60, 60)], 'c'); g.ellipse(22, 8, 6, 3, 'hi'); g.ellipse(46, 10, 4, 2, 'hi'); return g, {'c': SLIME, 'hi': '#ffffff'}
def mushroom():
    g = Grid(44, 18); g.ellipse(22, 9, 22, 9, 'c'); g.rect(0, 9, 44, 9, None) if False else None
    for x, y in ((10, 5), (22, 3), (32, 6)): g.ellipse(x, y, 3, 2, 'd')
    return g, {'c': ('#8a2a30', '#5a1418', '#2a0608'), 'd': SLIME}
def drum():
    g = Grid(44, 18); g.rect(2, 4, 40, 14, 'r'); g.ellipse(22, 4, 20, 4, 'skin'); for_x = None
    for x in range(4, 42, 6): g.line(x, 6, x + 3, 16, 'g')
    return g, {'r': RED, 'skin': CR, 'g': GOLD}
def coffinlid():
    g = Grid(44, 14); g.poly([(0, 7), (8, 0), (36, 0), (44, 7), (36, 14), (8, 14)], 'w'); g.rect(14, 6, 16, 2, 'k'); g.rect(21, 2, 2, 10, 'k'); return g, {'w': ('#5a2a20', '#3a1610', '#1a0806'), 'k': BONE}
def pad():
    g = Grid(44, 14); g.rect(0, 6, 44, 8, 's'); g.rect(4, 0, 36, 6, 'r')
    for x in range(4, 40, 8): g.rect(x, 0, 4, 6, 'k')
    return g, {'s': STEEL, 'r': RED, 'k': ('#12040a', '#12040a', '#12040a')}
FURN2 = {'valve': valve, 'sludge': sludge, 'ladder': ladder, 'fungus': fungus, 'drip': drip, 'booth': booth, 'popcorn': popcorn, 'balloons': balloons, 'queue': queue, 'bulbarch': bulbarch, 'ridesign': ridesign,
         'skullpile': skullpile, 'bonefence': bonefence, 'coffinup': coffinup, 'lantern': lantern, 'barrels': barrels, 'gastank': gastank, 'pallet': pallet, 'gauge': gauge, 'hoist': hoist, 'anvil': anvil,
         'terminal': terminal, 'specimen': specimen, 'rack': rack, 'cables': cables, 'blumbanner': blumbanner,
         'minecart': minecart, 'bumpercar': bumpercar, 'forklift': forklift, 'coaster': coaster, 'ghosttrain': ghosttrain, 'oretrain': oretrain, 'missile': missile, 'creamwave': creamwave,
         'mushroom': mushroom, 'drum': drum, 'coffinlid': coffinlid, 'pad': pad}

ART = {'hog_chal0': chalice(0), 'hog_chal1': chalice(1), 'hog_chal2': chalice(2), 'hog_chal3': chalice(3), 'hog_chal4': chalice(4), 'hog_chal5': chalice(5), 'hog_chal6': chalice(6), 'hog_lamp': lamp, 'hog_hydrant': hydrant, 'hog_bin': binb, 'hog_bench': bench, 'hog_bus': busstop, 'hog_cone': cone, 'hog_drop': drop, 'hog_shot': shot, 'hog_ishield': ishield, 'hog_ishoes': ishoes, 'hog_istar': istar}
ART.update({'hog_' + k: f for k, f in FURN.items()})
ART.update({'hog_' + k: f for k, f in FURN2.items()})
import chibi
ART.update({k: v for k, v in chibi.frames().items() if k.startswith('chb_u')})  # Cumhead from behind, for the special stage

# ---------- every character seen from behind, for the special stages (he said only Cumhead was in them) ----------
def _backs():
    import json, os
    from PIL import Image
    T = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
    hom = Image.open(os.path.join(T, 'homunculus', 'hom.png')).convert('RGBA'); HJ = json.load(open(os.path.join(T, 'homunculus', 'hom.json'))); HJ = HJ.get('frames', HJ)
    ll = Image.open(os.path.join(T, 'load-legacy', 'sprites.png')).convert('RGBA'); LJ = json.load(open(os.path.join(T, 'load-legacy', 'sprites.json'))); LJ = LJ.get('frames', LJ)
    def crop(im, J, k): v = J[k]; return im.crop((v[0], v[1], v[0] + v[2], v[1] + v[3]))
    def lum(c): return (c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15) / 255
    def back(src, keep_top=0.0):
        w, h = src.size; s = src.load(); m = src.transpose(Image.FLIP_LEFT_RIGHT).load()
        cols = {}
        for y in range(h):
            for x in range(w):
                c = s[x, y]
                if c[3] > 128 and 0.14 < lum(c) < 0.8: cols[c[:3]] = cols.get(c[:3], 0) + 1
        body = max(cols, key=cols.get) if cols else (120, 80, 80)
        dark = tuple(int(v * 0.62) for v in body); lit = tuple(min(255, int(v * 1.18 + 12)) for v in body)
        A = [[(s[x, y][3] > 128 or m[x, y][3] > 128) for x in range(w)] for y in range(h)]
        out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); o = out.load()
        for y in range(h):
            for x in range(w):
                if not A[y][x]: continue
                edge = any(not (0 <= x + dx < w and 0 <= y + dy < h and A[y + dy][x + dx]) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
                if edge: o[x, y] = (18, 4, 10, 255); continue
                a, b = s[x, y], m[x, y]; c = a if a[3] > 128 else b
                if y < h * keep_top and c[3] > 128: o[x, y] = c; continue # hats and horns keep their colours
                # keep features that stick out in their own colour (horns, flames, spines, plates): strongly coloured and not skin-like
                cc = c[:3]; sat = max(cc) - min(cc)
                if c[3] > 128 and sat > 70 and abs(cc[0] - body[0]) + abs(cc[1] - body[1]) + abs(cc[2] - body[2]) > 160 and lum(c) < 0.75: o[x, y] = c; continue
                o[x, y] = (lit if x < w * 0.42 else dark if x > w * 0.62 else body) + (255,)
        # a spine line down the back
        for y in range(int(h * 0.3), int(h * 0.8)):
            x = w // 2
            if A[y][x] and o[x, y][:3] != (18, 4, 10): o[x, y] = dark + (255,)
        return out
    def run(img):
        fr = []
        w, h = img.size
        for k in range(4):
            f = Image.new('RGBA', (w + 2, h + 1), (0, 0, 0, 0)); bob = 1 if k % 2 else 0
            top = img.crop((0, 0, w, int(h * 0.72))); legs = img.crop((0, int(h * 0.72), w, h))
            f.alpha_composite(top, (1, bob)); f.alpha_composite(legs, (1 + (1 if k == 1 else -1 if k == 3 else 0), int(h * 0.72) + bob))
            fr.append(f)
        return fr
    out = {}
    for b in ['gloop', 'guard', 'ember', 'frost', 'volt', 'medic', 'leech', 'scout', 'goldie', 'titan', 'blood']:
        for i, f in enumerate(run(back(crop(hom, HJ, 'h_%s_adult_idle0' % b))) ): out['bk_%s%d' % (b, i)] = f
    for i, f in enumerate(run(back(crop(ll, LJ, 'npc_greebo'), keep_top=0.42))): out['bk_greebo%d' % i] = f
    return out
for _k, _v in _backs().items(): ART[_k] = (lambda v: (lambda: v))(_v)
