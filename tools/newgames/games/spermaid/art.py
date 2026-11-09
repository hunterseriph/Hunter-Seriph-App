"""Spermaid Survivors' own art: weapon and charm icons, her shots, pickups, breakables and floor dressing.
Same outline and bevel shading as everything else (tools/pixelkit.py). Spermaid herself, the foes, the bosses,
the homunculus breeds, Sir Johnathan and the props come from the other games (USE)."""
import math
from pixelkit import Grid
USE = ['lab_pwalk*', 'lab_pidle*', 'lab_toss*', 'lab_bag*', 'lab_burn*', 'spermaid_*', 'npc_spermaid', 'cat', 'coin', 'steve0', 'steve1', 'cumface',
       'npc_tb', 'npc_greebo', 'npc_pulsar', 'npc_saba', 'npc_amy', 'npc_ali', 'npc_joff', 'npc_beebs', 'npc_kaya', 'npc_potbelly',
       'f_*', 'p_chest', 'p_chestopen', 'p_bigchest', 'p_bigchestopen', 'p_skulls', 'p_ribs', 'p_creampool', 'p_crucible', 'p_cell', 'p_cellopen',
       'p_walleyeshut', 'p_saw0', 'p_saw1', 'p_vent', 'p_shrinedry', 'p_tallsign',
       'h_*_baby_idle0', 'h_*_baby_run*', 'h_*_teen_run*', 'h_*_adult_run*', 'h_*_adult_idle0', 'h_*_egg0']
RED = ('#ff3a44', '#c4121c', '#6a0a10'); DRED = ('#8a1a20', '#5a0a10', '#2a0408'); GOLD = ('#fff09a', '#ffc840', '#a8741a')
CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); WHITE = ('#ffffff', '#e8dcc8', '#a8987a'); IRON = ('#9a929a', '#5a545c', '#2a262c')
BLACK = ('#4a3a40', '#221a1e', '#0c0608'); WOOD = ('#a8643a', '#6e3a1e', '#3a1a0c'); STONE = ('#8a6a6e', '#5a4044', '#2e1c20')
SEA = ('#7ae0e0', '#2aa0a8', '#0e4a52'); PINK = ('#ff9ad0', '#e0408a', '#7a1a48'); PURP = ('#c08aff', '#7a2ad8', '#34106a')
GREEN = ('#9aff5a', '#4aa82a', '#1a5a10'); BONE = ('#f8f0dc', '#d8c8a8', '#8a7a5a'); FIRE = ('#ffe36a', '#ff9a30', '#c4301a')
ICE = ('#e8faff', '#9adfff', '#3a7aa8'); GOO = ('#d88aff', '#9a3ad8', '#4a1070')

def G(w, h): return Grid(w, h)
def hole(g, cx, cy, rx, ry):
    for y in range(g.h):
        for x in range(g.w):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            if dx * dx + dy * dy <= 1.0: g.m[y][x] = None

# ---------------- weapon icons (16x16) ----------------
def w_droplet(g): g.poly([(8, 1), (13, 9), (8, 15), (3, 9)], 'c'); g.ellipse(8, 10, 5, 5, 'c'); g.ellipse(6, 8, 1.3, 1.8, 'sh'); return {'c': CREAM, 'sh': '#ffffff'}
def w_tail(g):
    g.ellipse(6, 8, 4, 6, 't'); g.poly([(8, 4), (15, 1), (12, 8), (15, 15), (8, 12)], 'f'); g.line(9, 6, 13, 3, 'ln', 0.3); g.line(9, 10, 13, 13, 'ln', 0.3)
    return {'t': SEA, 'f': PINK, 'ln': '#7a1a48'}
def w_bubble(g): g.ellipse(8, 8, 7, 7, 'b'); g.ellipse(8, 8, 5.5, 5.5, 'in'); g.ellipse(5, 5, 1.5, 1.5, 'sh'); return {'b': ICE, 'in': ('#c8f0ff', '#8ad0f0', '#4a90c0'), 'sh': '#ffffff'}
def w_swarm(g):
    for (x, y) in ((4, 4), (11, 7), (5, 12)): g.ellipse(x, y, 2.5, 2, 'h'); g.line(x - 2, y, x - 5, y + 1, 't', 0.3)
    return {'h': CREAM, 't': '#d8c8a8'}
def w_puddle(g): g.ellipse(8, 11, 7.5, 3.5, 'p'); g.ellipse(5, 10, 2, 1, 'sh'); g.poly([(8, 1), (10, 5), (8, 7), (6, 5)], 'p'); return {'p': CREAM, 'sh': '#ffffff'}
def w_pie(g): g.ellipse(8, 10, 7.5, 4, 'tin'); g.ellipse(8, 8, 6.5, 3, 'cr'); g.ellipse(8, 5, 3.5, 2, 'cr'); g.put(8, 3, 'ch'); return {'tin': IRON, 'cr': CREAM, 'ch': '#ff2630'}
def w_beat(g):
    g.ellipse(8, 8, 7, 7, 'r'); hole(g, 8, 8, 5, 5); g.ellipse(8, 8, 3, 3, 'r'); hole(g, 8, 8, 1.5, 1.5)
    return {'r': PURP}
def w_pill(g): g.ellipse(5, 8, 4, 4, 'a'); g.ellipse(11, 8, 4, 4, 'b'); g.rect(5, 4, 6, 8, 'a'); g.rect(8, 4, 3, 8, 'b'); return {'a': RED, 'b': WHITE}
def w_sirj(g):
    g.ellipse(8, 10, 6, 5, 'k'); g.poly([(3, 7), (4, 1), (7, 6)], 'k'); g.poly([(9, 6), (12, 1), (13, 7)], 'k'); g.ellipse(8, 12, 3, 2, 'w'); g.put(6, 9, 'eye'); g.put(10, 9, 'eye')
    return {'k': BLACK, 'w': WHITE, 'eye': '#ffe36a'}
def w_hom(g): g.ellipse(8, 9, 5.5, 6.5, 'e'); g.line(4, 8, 7, 6, 'cr', 0.3); g.line(7, 6, 10, 8, 'cr', 0.3); g.put(6, 11, 'd'); g.put(10, 12, 'd'); return {'e': CREAM, 'cr': '#6a5a3a', 'd': '#3fb43a'}
def w_trident(g):
    g.rect(7, 4, 2, 12, 'm'); g.rect(3, 4, 10, 2, 'm'); g.rect(3, 0, 2, 5, 'm'); g.rect(11, 0, 2, 5, 'm'); g.rect(7, 0, 2, 4, 'm')
    g.put(8, 7, 'z'); g.put(9, 8, 'z'); return {'m': GOLD, 'z': '#ffffff'}
def w_garlic(g):
    g.ellipse(8, 10, 6.5, 5.5, 'g'); g.poly([(7, 4), (8, 0), (9, 4)], 'g')
    for x in (5, 8, 11): g.line(x, 6, x, 15, 'ln', 0.3)
    return {'g': WHITE, 'ln': '#c8c0b0'}
def w_sausage(g): g.line(3, 12, 13, 4, 's', 2.2); g.put(2, 13, 'end'); g.put(14, 3, 'end'); g.line(5, 9, 11, 5, 'sh', 0.3); return {'s': ('#e07a5a', '#a84a30', '#5a2010'), 'end': '#5a2010', 'sh': '#ffb090'}
WEAP = {'droplet': w_droplet, 'tail': w_tail, 'bubble': w_bubble, 'swarm': w_swarm, 'puddle': w_puddle, 'pie': w_pie, 'beat': w_beat, 'pill': w_pill,
        'sirj': w_sirj, 'hom': w_hom, 'trident': w_trident, 'garlic': w_garlic, 'sausage': w_sausage}

# ---------------- charm (passive) icons ----------------
def p_chilli(g): g.poly([(3, 3), (6, 2), (14, 12), (12, 15), (5, 8)], 'c'); g.rect(2, 1, 3, 3, 'st'); return {'c': RED, 'st': GREEN}
def p_kelp(g):
    for x in (4, 8, 12): g.line(x, 15, x + 1, 3, 'k', 1.2); g.ellipse(x + 1, 3, 1.5, 2, 'k')
    return {'k': ('#6ad06a', '#2a8a3a', '#0e3a1a')}
def p_lungs(g): g.ellipse(5, 9, 4, 6, 'l'); g.ellipse(11, 9, 4, 6, 'l'); g.rect(7, 1, 2, 6, 'tr'); return {'l': PINK, 'tr': ('#ffd0e0', '#d890a8', '#7a3a50')}
def p_cracker(g): g.rect(2, 3, 12, 11, 'c'); g.put(5, 6, 'h'); g.put(8, 6, 'h'); g.put(11, 6, 'h'); g.put(5, 10, 'h'); g.put(8, 10, 'h'); g.put(11, 10, 'h'); return {'c': ('#ffe0a0', '#e0b060', '#8a6020'), 'h': '#8a6020'}
def p_headphones(g): g.ellipse(8, 7, 7, 7, 'band'); hole(g, 8, 7, 5, 5); g.rect(0, 7, 4, 7, 'cup'); g.rect(12, 7, 4, 7, 'cup'); g.rect(1, 8, 2, 5, 'gl'); g.rect(13, 8, 2, 5, 'gl'); return {'band': BLACK, 'cup': PURP, 'gl': '#7af0ff'}
def p_shell(g):
    g.poly([(8, 1), (1, 13), (15, 13)], 's'); g.rect(6, 13, 4, 2, 's')
    for x in (4, 8, 12): g.line(8, 2, x, 13, 'ln', 0.3)
    return {'s': ('#ffd0e0', '#ff8ab0', '#a03a60'), 'ln': '#a03a60'}
def p_lotion(g): g.rect(4, 5, 8, 11, 'b'); g.rect(6, 1, 4, 4, 'cap'); g.rect(5, 8, 6, 4, 'lab'); return {'b': CREAM, 'cap': RED, 'lab': '#c4121c'}
def p_cuppa(g): g.rect(2, 6, 10, 9, 'cup'); g.ellipse(13, 10, 3, 3, 'cup'); hole(g, 13, 10, 1.4, 1.4); g.ellipse(7, 6, 5, 2, 'cof'); g.ellipse(7, 5, 3, 1, 'foam'); return {'cup': WHITE, 'cof': ('#8a5a3a', '#5a3a1e', '#2a1a0c'), 'foam': CREAM}
def p_pearl(g): g.ellipse(8, 8, 6.5, 6.5, 'p'); g.ellipse(6, 6, 2, 2, 'sh'); return {'p': ('#ffd0d8', '#ff6a7a', '#a01a30'), 'sh': '#ffffff'}
def p_siren(g):
    g.poly([(2, 4), (13, 1), (15, 8), (13, 15), (2, 12)], 's'); g.ellipse(3, 8, 2, 4, 'in')
    for y in (4, 8, 12): g.line(5, y, 13, 8, 'ln', 0.3)
    return {'s': SEA, 'in': '#0e4a52', 'ln': '#0e4a52'}
def p_cards(g): g.rect(1, 3, 9, 12, 'c'); g.rect(6, 1, 9, 12, 'c'); g.ellipse(10, 6, 2, 2, 'su'); g.poly([(8, 7), (12, 7), (10, 10)], 'su'); return {'c': WHITE, 'su': '#c4121c'}
def p_crown(g): g.poly([(1, 14), (1, 4), (5, 9), (8, 2), (11, 9), (15, 4), (15, 14)], 'c'); g.put(8, 6, 'gem'); g.put(4, 11, 'gem'); g.put(12, 11, 'gem'); return {'c': CREAM, 'gem': '#ff2630'}
def p_boot(g): g.rect(3, 1, 6, 11, 'b'); g.rect(3, 10, 12, 5, 'b'); g.rect(3, 14, 13, 2, 'sole'); return {'b': RED, 'sole': BLACK}
PASS = {'chilli': p_chilli, 'kelp': p_kelp, 'lungs': p_lungs, 'cracker': p_cracker, 'headphones': p_headphones, 'shell': p_shell, 'lotion': p_lotion, 'cuppa': p_cuppa,
        'pearl': p_pearl, 'siren': p_siren, 'cards': p_cards, 'crown': p_crown, 'boot': p_boot}

def icon(fn, w=16, h=16):
    g = G(w, h); pal = fn(g); return g, pal

# ---------------- shots ----------------
def drop():
    g = G(8, 10); g.poly([(4, 0), (7, 5), (4, 9), (1, 5)], 'c'); g.ellipse(4, 6, 3, 3, 'c'); g.put(3, 5, 'sh'); return g, {'c': CREAM, 'sh': '#ffffff'}
def dropr():
    g = G(8, 10); g.poly([(4, 0), (7, 5), (4, 9), (1, 5)], 'c'); g.ellipse(4, 6, 3, 3, 'c'); g.put(3, 5, 'sh'); return g, {'c': RED, 'sh': '#ffd0d4'}
def wave():
    g = G(16, 26); g.ellipse(6, 13, 7, 12, 'w'); hole(g, 2, 13, 6, 10); [g.put(x, y, 'foam') for y in range(26) for x in range(16) if g.get(x, y) == 'w' and g.get(x - 1, y) is None and x > 3]; return g, {'w': SEA, 'foam': '#e8ffff'}
def sperm():
    g = G(14, 7); g.ellipse(10, 3.5, 3.5, 2.8, 'h'); g.line(1, 2, 7, 3.5, 't', 0.4); g.line(1, 5, 4, 3.5, 't', 0.4); g.put(11, 2, 'sh'); return g, {'h': CREAM, 't': '#e8dcc8', 'sh': '#ffffff'}
def pie():
    g = G(16, 11); g.ellipse(8, 7, 7.5, 3.5, 'tin'); g.ellipse(8, 5, 6.5, 3, 'cr'); g.ellipse(8, 3, 3, 1.5, 'cr'); g.put(8, 1, 'ch'); return g, {'tin': IRON, 'cr': CREAM, 'ch': '#ff2630'}
def pill(big):
    s = 2 if big else 1; g = G(10 * s, 6 * s); g.ellipse(3 * s, 3 * s, 3 * s, 2.8 * s, 'a'); g.ellipse(7 * s, 3 * s, 3 * s, 2.8 * s, 'b'); g.rect(3 * s, 0.3 * s, 2 * s, 5.4 * s, 'a')
    return g, {'a': RED if not big else PURP, 'b': WHITE}
def sausage():
    g = G(18, 8); g.line(2, 4, 15, 4, 's', 2.6); g.put(1, 4, 'e'); g.put(16, 4, 'e'); g.line(4, 3, 13, 3, 'sh', 0.3); return g, {'s': ('#e07a5a', '#a84a30', '#5a2010'), 'e': '#5a2010', 'sh': '#ffb090'}
def crescent():
    g = G(20, 20); g.ellipse(10, 10, 9, 9, 'r'); hole(g, 13, 8, 8, 8); return g, {'r': RED}
def splat():
    g = G(22, 12)
    for (x, y, r) in ((11, 6, 5), (5, 7, 3), (17, 5, 3.5), (3, 4, 1.5), (19, 9, 1.5), (8, 3, 2)): g.ellipse(x, y, r * 1.3, r, 'c')
    return g, {'c': CREAM}

# ---------------- pickups ----------------
def pearl(k):
    s = [2.6, 3.4, 4.4][k]; n = int(s * 2 + 2); g = G(n, n); g.ellipse(n / 2, n / 2, s, s, 'p'); g.put(n / 2 - s / 2, n / 2 - s / 2, 'sh')
    return g, {'p': [WHITE, ('#ff8a94', '#e0202c', '#7a0a12'), GOLD][k], 'sh': '#ffffff'}
def gdrop(big):
    s = 1.5 if big else 1; g = G(int(9 * s), int(12 * s)); g.poly([(4.5 * s, 0), (8 * s, 6.5 * s), (4.5 * s, 11.5 * s), (1 * s, 6.5 * s)], 'g'); g.ellipse(4.5 * s, 7.5 * s, 3.5 * s, 3.5 * s, 'g'); g.put(3 * s, 6 * s, 'sh')
    return g, {'g': GOLD, 'sh': '#ffffff'}
def cracker(): g = G(14, 12); g.rect(1, 1, 12, 10, 'c'); [g.put(x, y, 'h') for x in (4, 7, 10) for y in (4, 8)]; return g, {'c': ('#ffe0a0', '#e0b060', '#8a6020'), 'h': '#8a6020'}
def shellpk():
    g = G(16, 14); g.poly([(8, 0), (1, 11), (15, 11)], 's'); g.rect(6, 11, 4, 3, 's')
    for x in (4, 8, 12): g.line(8, 1, x, 11, 'ln', 0.3)
    return g, {'s': SEA, 'ln': '#0e4a52'}
def cuppa(): g = G(14, 14); g.rect(2, 5, 9, 9, 'cup'); g.ellipse(12, 9, 2.5, 2.5, 'cup'); hole(g, 12, 9, 1, 1); g.ellipse(6.5, 5, 4.5, 1.8, 'cof'); g.line(5, 3, 6, 0, 'st', 0.3); g.line(8, 3, 7, 0, 'st', 0.3); return g, {'cup': RED, 'cof': ('#8a5a3a', '#5a3a1e', '#2a1a0c'), 'st': '#a6968f'}
def scroll(): g = G(14, 16); g.rect(3, 2, 8, 12, 'p'); g.ellipse(7, 2, 5, 2, 'roll'); g.ellipse(7, 14, 5, 2, 'roll'); g.ellipse(7, 8, 2.5, 3, 'meat'); return g, {'p': CREAM, 'roll': WOOD, 'meat': ('#e07a5a', '#a84a30', '#5a2010')}
def frostegg(): g = G(12, 15); g.ellipse(6, 8, 5, 6.5, 'e'); g.line(2, 7, 5, 5, 'cr', 0.3); g.line(5, 5, 8, 7, 'cr', 0.3); g.put(4, 10, 'd'); g.put(8, 11, 'd'); return g, {'e': ICE, 'cr': '#3a7aa8', 'd': '#ffffff'}
def heartpk(): g = G(12, 11); g.ellipse(3.5, 3.5, 3.5, 3.5, 'h'); g.ellipse(8.5, 3.5, 3.5, 3.5, 'h'); g.poly([(0, 4), (12, 4), (6, 11)], 'h'); g.ellipse(3, 3, 1.2, 1, 'sh'); return g, {'h': RED, 'sh': '#ffd0d4'}
def magnetpk():
    g = G(14, 14); g.ellipse(7, 7, 6.5, 6.5, 'r'); g.ellipse(7, 7, 4, 4, 'in'); g.put(7, 7, 'c'); return g, {'r': PURP, 'in': SEA, 'c': '#ffffff'}

# ---------------- breakables (one kind per place) ----------------
def br_barrel():
    g = G(18, 22); g.ellipse(9, 12, 8, 9, 'w'); g.rect(1, 6, 16, 12, 'w'); g.rect(1, 7, 16, 2, 'hoop'); g.rect(1, 16, 16, 2, 'hoop'); g.ellipse(9, 4, 7, 2.5, 'top'); g.ellipse(9, 4, 5, 1.5, 'cr')
    g.rect(12, 4, 3, 7, 'cr'); return g, {'w': WOOD, 'hoop': IRON, 'top': WOOD, 'cr': CREAM}
def br_balloons():
    g = G(22, 34)
    for (x, y, c) in ((6, 7, 'a'), (15, 6, 'b'), (11, 12, 'c')): g.ellipse(x, y, 5, 6, c); g.line(x, y + 6, 11, 33, 'str', 0.3)
    g.put(6, 6, 'eye'); g.put(15, 5, 'eye'); return g, {'a': BLACK, 'b': RED, 'c': BLACK, 'str': '#a6968f', 'eye': '#ff2630'}
def br_candle():
    g = G(18, 26); g.ellipse(9, 20, 8, 6, 'sk'); g.put(6, 20, 'eye'); g.put(12, 20, 'eye'); g.put(5, 21, 'eye'); g.put(13, 21, 'eye'); g.rect(7, 6, 4, 11, 'wax'); g.ellipse(9, 4, 2, 3, 'fl'); g.put(9, 3, 'hot')
    return g, {'sk': BONE, 'eye': '#12040a', 'wax': CREAM, 'fl': FIRE, 'hot': '#ffffff'}
def br_brazier():
    g = G(20, 22); g.poly([(2, 8), (18, 8), (14, 16), (6, 16)], 'b'); g.rect(8, 16, 4, 4, 'b'); g.rect(4, 19, 12, 3, 'b')
    for x in (5, 9, 13): g.ellipse(x + 1, 6, 2.5, 3, 'coal')
    g.ellipse(10, 4, 4, 4, 'fl'); g.ellipse(10, 3, 2, 2.5, 'hot'); return g, {'b': IRON, 'coal': BLACK, 'fl': FIRE, 'hot': '#fff09a'}
def br_candelabra():
    g = G(22, 30); g.rect(10, 8, 2, 20, 'm'); g.rect(6, 27, 10, 3, 'm'); g.line(3, 12, 10, 16, 'm', 0.6); g.line(19, 12, 12, 16, 'm', 0.6)
    for x in (3, 11, 19): g.rect(x - 1, 4 if x == 11 else 8, 3, 5, 'wax'); g.ellipse(x, 2 if x == 11 else 6, 1.5, 2, 'fl')
    return g, {'m': GOLD, 'wax': CREAM, 'fl': FIRE}
def br_basket():
    g = G(22, 18); g.rect(2, 7, 18, 10, 'w'); g.ellipse(11, 7, 8, 6, 'handle'); hole(g, 11, 7, 6.5, 4.6); g.rect(2, 8, 18, 9, 'w')
    for x in range(3, 20, 4): g.line(x, 8, x, 16, 'ln', 0.3)
    g.rect(2, 9, 18, 2, 'cloth'); return g, {'w': WOOD, 'handle': WOOD, 'ln': '#3a1a0c', 'cloth': RED}
def br_pod():
    g = G(20, 22); g.ellipse(10, 13, 8, 9, 'p'); g.ellipse(10, 12, 4, 4, 'eye'); g.ellipse(10, 12, 1.8, 2.4, 'pu'); g.line(4, 6, 2, 1, 'p', 0.8); g.line(16, 6, 18, 1, 'p', 0.8)
    return g, {'p': GOO, 'eye': WHITE, 'pu': '#12040a'}
def br_crystal():
    g = G(18, 26); g.poly([(9, 0), (15, 9), (12, 25), (6, 25), (3, 9)], 'c'); g.poly([(4, 12), (0, 18), (4, 25), (7, 25)], 'c'); g.line(9, 2, 9, 23, 'ln', 0.3)
    return g, {'c': RED, 'ln': '#ffd0d4'}

# ---------------- floor dressing ----------------
def grate():
    g = G(26, 16); g.rect(0, 0, 26, 16, 'f'); [g.rect(3 + i * 4, 3, 2, 10, 'h') for i in range(5)]; return g, {'f': IRON, 'h': '#12040a'}
def bones():
    g = G(16, 10); g.line(2, 7, 13, 2, 'b', 0.9); g.ellipse(2, 7, 1.6, 1.6, 'b'); g.ellipse(13, 2, 1.6, 1.6, 'b'); g.line(4, 2, 12, 8, 'b', 0.7); return g, {'b': BONE}
def flower(c):
    g = G(9, 11); g.line(4, 5, 4, 10, 'st', 0.3); [g.ellipse(4 + dx, 3 + dy, 1.6, 1.6, 'p') for dx, dy in ((-2, 0), (2, 0), (0, -2), (0, 2))]; g.put(4, 3, 'c')
    return g, {'st': GREEN, 'p': [RED, WHITE, ('#fff09a', '#ffd040', '#a87020')][c], 'c': '#ffe36a'}
def grave():
    g = G(16, 20); g.ellipse(8, 6, 7, 6, 's'); g.rect(1, 6, 14, 12, 's'); g.rect(0, 17, 16, 3, 'dirt'); g.rect(7, 4, 2, 8, 'x'); g.rect(5, 6, 6, 2, 'x'); return g, {'s': STONE, 'dirt': ('#4a2a20', '#2a1810', '#120804'), 'x': '#2e1c20'}
def mushroom():
    g = G(14, 14); g.rect(5, 7, 4, 7, 'st'); g.ellipse(7, 6, 7, 5, 'cap'); g.put(4, 4, 'dot'); g.put(9, 3, 'dot'); g.put(7, 6, 'dot'); return g, {'st': CREAM, 'cap': RED, 'dot': '#ffffff'}
def pillar():
    g = G(26, 44); g.rect(3, 6, 20, 34, 'p'); g.rect(0, 0, 26, 7, 'cap'); g.rect(0, 38, 26, 6, 'cap')
    for x in (7, 12, 17): g.line(x, 8, x, 37, 'ln', 0.3)
    return g, {'p': STONE, 'cap': ('#a88a8e', '#7a6064', '#3e2c30'), 'ln': '#2e1c20'}
def tentacle():
    g = G(14, 26)
    for i in range(12): g.ellipse(7 + math.sin(i * 0.6) * 3, 24 - i * 2, 4 - i * 0.25, 2.2, 't')
    return g, {'t': GOO}
def anthill():
    g = G(22, 12); g.poly([(0, 12), (8, 2), (14, 2), (22, 12)], 'd'); g.ellipse(11, 3, 2, 1, 'h'); return g, {'d': ('#a8643a', '#6e3a1e', '#3a1a0c'), 'h': '#12040a'}
def lamp():
    g = G(12, 40); g.rect(5, 8, 2, 30, 'm'); g.rect(2, 37, 8, 3, 'm'); g.rect(2, 2, 8, 8, 'gl'); g.rect(1, 0, 10, 3, 'm'); return g, {'m': BLACK, 'gl': FIRE}
def coaster():
    g = G(30, 16); g.rect(1, 3, 28, 10, 'car'); g.rect(4, 0, 6, 4, 'seat'); g.rect(18, 0, 6, 4, 'seat'); g.ellipse(6, 14, 3, 2, 'wh'); g.ellipse(24, 14, 3, 2, 'wh'); g.rect(1, 7, 28, 2, 'stripe')
    return g, {'car': RED, 'seat': BLACK, 'wh': IRON, 'stripe': '#ffe36a'}
def rpin():
    g = G(40, 14); g.rect(6, 1, 28, 12, 'w'); g.rect(0, 5, 7, 4, 'h'); g.rect(33, 5, 7, 4, 'h'); g.line(8, 3, 32, 3, 'sh', 0.3); return g, {'w': ('#f0c890', '#c89050', '#6e4a1e'), 'h': WOOD, 'sh': '#fff0d0'}
def meteor():
    g = G(18, 18); g.ellipse(9, 9, 8, 8, 'r'); g.ellipse(6, 6, 2, 2, 'cr'); g.ellipse(12, 11, 2.5, 2, 'cr'); return g, {'r': DRED, 'cr': '#12040a'}
def chand():
    g = G(36, 22); g.ellipse(18, 8, 16, 4, 'r'); hole(g, 18, 8, 12, 2.5); g.rect(17, 0, 2, 8, 'r')
    for x in (4, 11, 18, 25, 32): g.rect(x - 1, 2, 2, 5, 'wax'); g.put(x, 1, 'fl')
    for x in (8, 18, 28): g.line(x, 11, x, 18, 'r', 0.4); g.put(x, 19, 'gem')
    return g, {'r': GOLD, 'wax': CREAM, 'fl': '#ffe36a', 'gem': '#ff2630'}

ART = {
    'sv_drop': drop, 'sv_dropr': dropr, 'sv_wave': wave, 'sv_sperm': sperm, 'sv_pie': pie, 'sv_pill': lambda: pill(False), 'sv_pillb': lambda: pill(True),
    'sv_sausage': sausage, 'sv_crescent': crescent, 'sv_splat': splat,
    'pk_pearl0': lambda: pearl(0), 'pk_pearl1': lambda: pearl(1), 'pk_pearl2': lambda: pearl(2), 'pk_gold': lambda: gdrop(False), 'pk_gold2': lambda: gdrop(True),
    'pk_cracker': cracker, 'pk_shell': shellpk, 'pk_cuppa': cuppa, 'pk_scroll': scroll, 'pk_egg': frostegg, 'pk_heart': heartpk, 'pk_magnet': magnetpk,
    'br_sewer': br_barrel, 'br_park': br_balloons, 'br_bone': br_candle, 'br_furnace': br_brazier, 'br_castle': br_candelabra, 'br_picnic': br_basket, 'br_lair': br_pod, 'br_moon': br_crystal,
    'dc_grate': grate, 'dc_bones': bones, 'dc_flower0': lambda: flower(0), 'dc_flower1': lambda: flower(1), 'dc_flower2': lambda: flower(2), 'dc_grave': grave, 'dc_mush': mushroom,
    'dc_pillar': pillar, 'dc_tent': tentacle, 'dc_anthill': anthill, 'dc_lamp': lamp, 'hz_coaster': coaster, 'hz_pin': rpin, 'hz_meteor': meteor, 'hz_chand': chand,
}
for k, fn in WEAP.items(): ART['ic_' + k] = (lambda fn=fn: icon(fn))
for k, fn in PASS.items(): ART['ic_' + k] = (lambda fn=fn: icon(fn))
