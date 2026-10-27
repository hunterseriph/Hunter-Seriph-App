"""Meatnado Escape's own art: the drop, the power-up icons and the thrown things, and walk frames for Amy and TB.
Characters and foes come from the art we already have (Cumhead's atlas, Greebo, the homunculus breeds, tools/foes)."""
import math
from pixelkit import Grid
USE = ['ch_rn*', 'ch_jump*', 'ch_attack', 'ch_hurt0', 'ch_idle0', 'greebo_s*', 'npc_amy', 'npc_tb', 'h_*_baby_*', 'h_*_teen_*', 'h_*_adult_*', 'h_*_egg*',
       'f_rat_*', 'f_crawler_*', 'f_slime_*', 'f_skeleton_*', 'f_clown_*', 'f_cultrat_*', 'f_bonehound_*', 'f_knight_*', 'f_bat_*', 'f_crow_*', 'f_balloon_*', 'f_imp_*', 'f_creamblob_*']
CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); RED = ('#ff3a44', '#c4121c', '#6a0a10'); GOLD = ('#fff09a', '#ffc840', '#a8741a'); IRON = ('#d0c8d0', '#8a828a', '#3a343c')
BLUE = ('#9adfff', '#3a8ac8', '#14406a'); GREEN = ('#9aff5a', '#4aa82a', '#1a5a10'); PURP = ('#e0a0ff', '#9a3ad8', '#44106a')

def drop():
    g = Grid(10, 13); g.ellipse(5, 8.5, 4.2, 4.2, 'd'); g.poly([(2, 7), (5, 0), (8, 7)], 'd'); g.put(3, 7, 'hi'); g.put(3, 8, 'hi')
    return g, {'d': CREAM, 'hi': '#ffffff'}

def badge(icon):
    """a power-up: a round red badge with an icon on it"""
    g = Grid(20, 20); g.ellipse(10, 10, 9.5, 9.5, 'rim'); g.ellipse(10, 10, 7.5, 7.5, 'in')
    pal = {'rim': GOLD, 'in': ('#5a1018', '#2a060a', '#12040a')}
    if icon == 'magnet':
        g.rect(5, 5, 3, 8, 'm'); g.rect(12, 5, 3, 8, 'm'); g.rect(5, 12, 10, 3, 'm'); g.rect(5, 5, 3, 2, 'tip'); g.rect(12, 5, 3, 2, 'tip'); pal.update({'m': RED, 'tip': IRON})
    elif icon == 'shield':
        g.poly([(5, 5), (15, 5), (15, 10), (10, 16), (5, 10)], 's'); g.rect(9, 6, 2, 8, 'x'); pal.update({'s': BLUE, 'x': '#ffffff'})
    elif icon == 'rocket':
        g.poly([(10, 3), (13, 8), (13, 13), (7, 13), (7, 8)], 'r'); g.poly([(7, 11), (5, 15), (7, 14)], 'f'); g.poly([(13, 11), (15, 15), (13, 14)], 'f'); g.rect(9, 14, 2, 3, 'fl'); g.ellipse(10, 8, 1.5, 1.5, 'w')
        pal.update({'r': IRON, 'f': RED, 'fl': ('#ffe36a', '#ff9a30', '#c4301a'), 'w': '#9adfff'})
    elif icon == 'double':
        g.ellipse(7.5, 11, 3, 3, 'd'); g.poly([(5.5, 10), (7.5, 5), (9.5, 10)], 'd'); g.ellipse(12.5, 12, 3, 3, 'd'); g.poly([(10.5, 11), (12.5, 6), (14.5, 11)], 'd'); pal.update({'d': CREAM})
    elif icon == 'rapid':
        for i in range(3): g.ellipse(6 + i * 4, 10, 2, 2, 'b');
        g.rect(4, 13, 12, 1, 'l'); pal.update({'b': RED, 'l': GOLD})
    elif icon == 'cracker':
        g.rect(5, 5, 10, 10, 'c')
        for (x, y) in ((7, 7), (12, 7), (7, 12), (12, 12), (9, 10)): g.put(x, y, 'h')
        pal.update({'c': ('#f0c070', '#c8862a', '#7a4410'), 'h': '#7a4410'})
    return g, pal

def pie():
    g = Grid(18, 10); g.ellipse(9, 6, 8, 3.5, 'tin'); g.ellipse(9, 4, 7, 3, 'cream'); g.put(9, 1, 'cherry'); g.put(10, 1, 'cherry')
    return g, {'tin': IRON, 'cream': CREAM, 'cherry': RED}

def wave():
    g = Grid(16, 16)
    for i in range(3): g.line(4 + i * 3, 2, 10 + i * 2, 8, 'w', 0.8); g.line(10 + i * 2, 8, 4 + i * 3, 14, 'w', 0.8)
    return g, {'w': BLUE}

def acid():
    g = Grid(12, 10); g.ellipse(6, 5, 5, 4, 'a'); g.put(4, 3, 'hi'); return g, {'a': GREEN, 'hi': '#eaffd0'}

def balloonshot():
    g = Grid(12, 18); g.ellipse(6, 6, 5.5, 6, 'b'); g.put(4, 6, 'e'); g.put(8, 6, 'e'); g.line(4, 9, 8, 9, 'm', 0.3); g.line(6, 12, 6, 17, 's', 0.3)
    return g, {'b': ('#3a2a30', '#1a1014', '#0c0608'), 'e': '#ff2630', 'm': '#ff2630', 's': '#a6968f'}

def bone():
    g = Grid(14, 8); g.rect(3, 3, 8, 2, 'b'); g.ellipse(2.5, 2.5, 2, 2, 'b'); g.ellipse(2.5, 5.5, 2, 2, 'b'); g.ellipse(11.5, 2.5, 2, 2, 'b'); g.ellipse(11.5, 5.5, 2, 2, 'b')
    return g, {'b': CREAM}

ART = {'mn_drop': drop, 'mn_pie': pie, 'mn_wave': wave, 'mn_acid': acid, 'mn_bshot': balloonshot, 'mn_bone': bone}
for _k in ('magnet', 'shield', 'rocket', 'double', 'rapid', 'cracker'): ART['mn_p_' + _k] = (lambda k=_k: badge(k))

def pill():
    g = Grid(14, 8); g.ellipse(4, 4, 3.5, 3.5, 'a'); g.ellipse(10, 4, 3.5, 3.5, 'b'); g.rect(4, 1, 6, 6, 'a'); g.rect(7, 1, 3, 6, 'b'); g.put(3, 2, 'hi')
    return g, {'a': ('#fff09a', '#ffc840', '#a8741a'), 'b': RED, 'hi': '#ffffff'}
def sausage():
    g = Grid(26, 9); g.ellipse(13, 4.5, 12, 3.8, 's'); g.line(5, 3, 20, 3, 'hi', 0.3); g.put(0, 4, 'end'); g.put(25, 4, 'end')
    return g, {'s': ('#e0604a', '#a8301e', '#5a1208'), 'hi': '#ffb0a0', 'end': '#5a1208'}
ART.update({'mn_pill': pill, 'mn_sausage': sausage})

# Amy and TB walk: the legs swing and the body bobs (built from their own sprites, like Willy Nilly's hosts)
from PIL import Image
import art as _A
def walkframe(name, f):
    src = _A.base()[name].convert('RGBA'); W, H = src.size; out = Image.new('RGBA', (W, H + 1), (0, 0, 0, 0)); hip = H - 9
    body = src.crop((0, 0, W, hip)); legs = src.crop((0, hip, W, H)); lw = W // 2
    left, right = legs.crop((0, 0, lw, legs.height)), legs.crop((lw, 0, W, legs.height))
    ly, ry = [0, -1, 0, 0][f], [0, 0, 0, -1][f]; lx, rx = [0, 1, 0, -1][f], [0, -1, 0, 1][f]; bob = [0, 1, 0, 1][f]
    out.alpha_composite(left, (max(0, lx), hip + 1 + ly)); out.alpha_composite(right, (lw + min(0, rx) if rx < 0 else lw + rx, hip + 1 + ry))
    out.alpha_composite(body, (0, bob)); return out
for _h in ('npc_amy', 'npc_tb'):
    for _f in range(4): ART[_h + '_w' + str(_f)] = (lambda h=_h, f=_f: walkframe(h, f))
