"""Cumhead the Spermhog's own art: the drop, Cumhead's shot and the item box icons. Cumhead is his own atlas,
the foes and bosses come from tools/foes (Load Legacy's), the saws and logs are props, the freed homunculus is a breed."""
from pixelkit import Grid
FOES = ['crawler', 'clown', 'rat', 'bat', 'balloon', 'cultrat', 'creamblob', 'crow', 'slime', 'toymouse', 'pieling', 'skeleton', 'bonehound', 'gravehand', 'wraith', 'mummy',
        'magmaslug', 'golem', 'corkbot', 'emberbat', 'imp', 'blumguard', 'blumling', 'blumeye', 'blumspore', 'knight', 'beast', 'kraken', 'pig', 'boner', 'hotload', 'blum', 'blum2']
USE = ['ch_*', 'cumface'] + ['f_%s_*' % f for f in FOES] + ['p_saw0', 'p_saw1', 'p_logboat', 'h_gloop_baby_idle*']
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

ART = {'hog_drop': drop, 'hog_shot': shot, 'hog_ishield': ishield, 'hog_ishoes': ishoes, 'hog_istar': istar}
