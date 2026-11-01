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

ART = {'hog_chal0': chalice(0), 'hog_chal1': chalice(1), 'hog_chal2': chalice(2), 'hog_chal3': chalice(3), 'hog_chal4': chalice(4), 'hog_chal5': chalice(5), 'hog_chal6': chalice(6), 'hog_lamp': lamp, 'hog_hydrant': hydrant, 'hog_bin': binb, 'hog_bench': bench, 'hog_bus': busstop, 'hog_cone': cone, 'hog_drop': drop, 'hog_shot': shot, 'hog_ishield': ishield, 'hog_ishoes': ishoes, 'hog_istar': istar}
