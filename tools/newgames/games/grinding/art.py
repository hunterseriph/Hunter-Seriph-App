"""The Grinding of Cumhead's own art: rocks, cream piles, spikes, doors, pickups, the bomb, the trapdoor, the pedestal
and an icon for every item. Same outline and bevel shading as everything else."""
import math
from pixelkit import Grid
USE = ['ch_icon0', 'cumface', 'f_bat_*', 'f_batP_*', 'f_crawler_*', 'f_slime_*', 'f_slimeR_*', 'f_imp_*', 'f_ghoul_*', 'f_rat_*', 'f_wraith_*', 'f_skeleton_*', 'f_blumling_*',
       'f_blumeye_*', 'f_blumspore_*', 'f_magmaslug_*', 'f_emberbat_*', 'f_creamblob_*', 'f_cultrat_*', 'f_vampire_*', 'f_balloon_*', 'f_crow_*', 'f_bonehound_*', 'f_golem_*',
       'f_beast_*', 'f_demon_*', 'f_sperm_*', 'f_pig_*', 'f_ratking_*', 'f_boner_*', 'f_hotload_*', 'f_moon_*', 'f_blum_*', 'f_blum2_*', 'h_*_baby_idle0', 'h_blood_adult_idle0',
       'npc_potbelly', 'npc_tb', 'npc_jessiah']
RED = ('#ff3a44', '#c4121c', '#6a0a10'); GOLD = ('#fff09a', '#ffc840', '#a8741a'); STONE = ('#8a6a6e', '#5a4044', '#2e1c20'); CREAM = ('#fffbe8', '#f1e0b0', '#b8a070')
IRON = ('#9a929a', '#5a545c', '#2a262c'); BLACK = ('#4a3a40', '#221a1e', '#0c0608'); WOOD = ('#a8643a', '#6e3a1e', '#3a1a0c'); WHITE = ('#ffffff', '#e8dcc8', '#a8987a'); PURP = ('#c08aff', '#7a2ad8', '#34106a')
GREEN = ('#9aff5a', '#4aa82a', '#1a5a10')

def rock(v):
    g = Grid(26, 24); pts = [(2, 16), (4, 6), (11, 2), (19, 3), (24, 9), (24, 19), (15, 23), (5, 22)] if v == 0 else [(1, 12), (6, 3), (16, 1), (24, 7), (25, 17), (18, 23), (6, 22)]
    g.poly(pts, 'rock'); g.line(8, 9, 13, 14, 'crack', 0.4); g.line(13, 14, 18, 12, 'crack', 0.4); g.ellipse(9, 6, 3, 2, 'hi')
    return g, {'rock': STONE, 'crack': '#2e1c20', 'hi': '#a88a8e'}

def pile(hp):
    g = Grid(24, 22); k = hp
    g.ellipse(12, 17, 11, 5, 'c')
    if k >= 2: g.ellipse(12, 12, 8, 4, 'c')
    if k >= 3: g.ellipse(12, 8, 5, 3, 'c'); g.poly([(10, 6), (13, 0), (15, 6)], 'c')
    g.ellipse(8, 15, 2, 1, 'sh'); return g, {'c': CREAM, 'sh': '#ffffff'}

def spikes():
    g = Grid(26, 26); g.rect(0, 18, 26, 8, 'base')
    for i in range(4):
        for j in range(2): x = 2 + i * 6 + j * 3; y = 18 - j * 6; g.poly([(x, y + 6), (x + 2.5, y - 6), (x + 5, y + 6)], 'spike')
    return g, {'base': BLACK, 'spike': IRON}

def door(kind, opened):
    g = Grid(40, 24)
    g.rect(0, 0, 40, 24, 'frame')
    g.rect(6, 4, 28, 20, 'void')
    col = {'n': 'wood', 'boss': 'red', 'gold': 'gold', 'shop': 'wood'}[kind]
    if not opened: g.rect(6, 4, 28, 20, col); g.rect(19, 4, 2, 20, 'seam')
    if kind == 'boss':
        for x in (3, 34): g.poly([(x, 0), (x + 1.5, -6 + 6), (x + 3, 0)], 'bone')
        g.ellipse(20, 3, 5, 3, 'skull'); g.put(18, 3, 'eye'); g.put(22, 3, 'eye')
    if kind == 'gold' and not opened: g.rect(17, 12, 6, 6, 'lock'); g.put(20, 15, 'eye')
    if kind == 'shop': g.ellipse(20, 2, 4, 2, 'gold')
    return g, {'frame': STONE if kind != 'boss' else ('#8a2a30', '#5a1018', '#2a0408'), 'void': '#12040a', 'wood': WOOD, 'red': RED, 'gold': GOLD, 'seam': '#12040a', 'bone': WHITE, 'skull': WHITE, 'eye': '#12040a', 'lock': IRON}

def heart(half):
    g = Grid(12, 11); g.ellipse(3.5, 3.5, 3.5, 3.5, 'h'); g.ellipse(8.5, 3.5, 3.5, 3.5, 'h'); g.poly([(0, 4), (12, 4), (6, 11)], 'h')
    if half:
        for y in range(11):
            for x in range(6, 12): g.m[y][x] = 'e' if g.m[y][x] else None
    g.ellipse(3, 3, 1.2, 1, 'sh')
    return g, {'h': RED, 'e': ('#4a2a30', '#2a1418', '#1a0a0e'), 'sh': '#ffd0d4'}

def hearte():
    g = Grid(12, 11); g.ellipse(3.5, 3.5, 3.5, 3.5, 'h'); g.ellipse(8.5, 3.5, 3.5, 3.5, 'h'); g.poly([(0, 4), (12, 4), (6, 11)], 'h'); return g, {'h': ('#4a2a30', '#2a1418', '#1a0a0e')}

def shield():
    g = Grid(12, 11); g.ellipse(3.5, 3.5, 3.5, 3.5, 'h'); g.ellipse(8.5, 3.5, 3.5, 3.5, 'h'); g.poly([(0, 4), (12, 4), (6, 11)], 'h'); return g, {'h': ('#e0ecff', '#8aa8d8', '#3a4a7a')}

def coin(big):
    g = Grid(10, 10); g.ellipse(5, 5, 4.5, 4.5, 'c'); g.rect(4, 2, 2, 6, 'd')
    return g, {'c': GOLD if not big else ('#ffd0ff', '#d878ff', '#7a2ad8'), 'd': '#a8741a' if not big else '#5a1a8a'}

def key():
    g = Grid(8, 16); g.ellipse(4, 4, 3.5, 3.5, 'k'); g.ellipse(4, 4, 1.5, 1.5, None); g.put(4, 4, None); g.rect(3, 7, 2, 8, 'k'); g.rect(5, 11, 2, 1, 'k'); g.rect(5, 13, 2, 1, 'k')
    return g, {'k': GOLD}

def bomb(lit):
    g = Grid(16, 18); g.ellipse(8, 11, 7, 7, 'b'); g.rect(6, 2, 4, 3, 'cap'); g.line(8, 2, 11, 0, 'fuse', 0.4); g.ellipse(5, 8, 2, 1.5, 'sh')
    if lit: g.put(11, 0, 'spark'); g.put(12, 0, 'spark')
    return g, {'b': BLACK, 'cap': IRON, 'fuse': '#c8a050', 'sh': '#8a7a80', 'spark': '#ffe36a'}

def trapdoor():
    g = Grid(34, 26); g.ellipse(17, 13, 16, 12, 'rim'); g.ellipse(17, 13, 12, 9, 'hole'); return g, {'rim': STONE, 'hole': '#12040a'}

def pedestal():
    g = Grid(24, 20); g.rect(4, 4, 16, 14, 'p'); g.rect(1, 1, 22, 4, 'top'); g.rect(2, 16, 20, 4, 'top'); return g, {'p': STONE, 'top': ('#a88a8e', '#7a6064', '#3e2c30')}

def tear(k):
    g = Grid(10, 10); g.ellipse(5, 5, 4, 4, 't'); g.ellipse(4, 3, 1.3, 1, 'sh')
    return g, {'t': {'c': CREAM, 'r': RED, 'p': PURP, 'g': GREEN, 'f': ('#ffe36a', '#ff9a30', '#c4301a')}[k], 'sh': '#ffffff'}

# ---------- item icons (16x16-ish) ----------
def icon(fn, w=18, h=18):
    g = Grid(w, h); pal = fn(g); return g, pal
def i_cup(g): g.rect(3, 6, 10, 9, 'cup'); g.ellipse(14, 10, 3, 3, 'cup'); g.ellipse(14, 10, 1.5, 1.5, None); g.ellipse(8, 6, 5, 2, 'cof'); g.line(6, 3, 7, 0, 'steam', 0.3); g.line(10, 3, 9, 0, 'steam', 0.3); return {'cup': WHITE, 'cof': ('#8a5a3a', '#5a3a1e', '#2a1a0c'), 'steam': '#a6968f'}
def i_chilli(g, dyn=False):
    g.ellipse(9, 11, 8, 5, 'bowl'); g.rect(1, 8, 16, 3, 'bowl'); g.ellipse(9, 8, 7, 2.5, 'ch')
    if dyn: g.rect(12, 1, 3, 7, 'st'); g.put(13, 0, 'sp')
    return {'bowl': WHITE, 'ch': ('#ff6a3a', '#c4301a', '#6a1208') if not dyn else BLACK, 'st': RED, 'sp': '#ffe36a'}
def i_pizza(g): g.poly([(2, 2), (16, 2), (9, 16)], 'z'); g.rect(2, 1, 14, 3, 'crust'); g.put(7, 6, 'pine'); g.put(11, 5, 'pine'); g.put(9, 10, 'pine'); return {'z': ('#ffe080', '#ffc040', '#c08020'), 'crust': WOOD, 'pine': '#ffe36a'}
def i_bread(g): g.ellipse(9, 10, 8, 5, 'b'); g.line(5, 8, 7, 12, 'cut', 0.3); g.line(9, 8, 11, 12, 'cut', 0.3); g.line(13, 8, 15, 11, 'cut', 0.3); return {'b': ('#ffd080', '#d89040', '#8a5010'), 'cut': '#6e3a1e'}
def i_tea(g): g.ellipse(8, 11, 6, 4, 'cup'); g.rect(2, 7, 12, 4, 'cup'); g.ellipse(15, 9, 2.5, 2.5, 'cup'); g.ellipse(15, 9, 1, 1, None); g.ellipse(9, 15, 8, 2, 'cup'); g.ellipse(8, 7, 5, 1.5, 'tea'); return {'cup': ('#ffd0f0', '#d878c0', '#7a2a6a'), 'tea': ('#c8803a', '#8a501a', '#4a2a0a')}
def i_pill(g): g.ellipse(5, 9, 4, 4, 'a'); g.ellipse(13, 9, 4, 4, 'b'); g.rect(5, 5, 8, 8, 'a'); g.rect(9, 5, 4, 8, 'b'); return {'a': RED, 'b': ('#ffffff', '#c8c0e0', '#6a6080')}
def i_pie(g): g.ellipse(9, 11, 8, 4, 'tin'); g.ellipse(9, 9, 7, 3, 'cr'); g.ellipse(9, 6, 4, 2, 'cr'); g.put(9, 4, 'cherry'); return {'tin': IRON, 'cr': CREAM, 'cherry': '#ff2630'}
def i_lotion(g): g.rect(5, 6, 8, 11, 'b'); g.rect(7, 2, 4, 4, 'cap'); g.rect(8, 0, 2, 2, 'cap'); g.rect(6, 9, 6, 4, 'lab'); return {'b': CREAM, 'cap': RED, 'lab': '#c4121c'}
def i_shell(g):
    g.poly([(9, 2), (2, 14), (16, 14)], 's')
    for x in (5, 9, 13): g.line(9, 3, x, 14, 'ln', 0.3)
    return {'s': ('#ffd0e0', '#ff8ab0', '#a03a60'), 'ln': '#a03a60'}
def i_tin(g):
    for i in range(3): g.ellipse(5 + i * 4, 12 - i * 3, 5, 2.5, 'tin'); g.ellipse(5 + i * 4, 11 - i * 3, 4, 1.5, 'cr')
    return {'tin': IRON, 'cr': CREAM}
def i_egg(g): g.ellipse(9, 10, 6, 7, 'e'); g.line(4, 9, 7, 7, 'crk', 0.3); g.line(7, 7, 10, 9, 'crk', 0.3); g.put(7, 12, 'dot'); g.put(11, 13, 'dot'); return {'e': CREAM, 'crk': '#6a5a3a', 'dot': '#7dff3a'}
def i_fang(g): g.poly([(4, 2), (14, 2), (9, 17)], 'f'); g.rect(3, 1, 12, 3, 'gum'); return {'f': WHITE, 'gum': RED}
def i_cards(g): g.rect(2, 4, 10, 13, 'c'); g.rect(6, 2, 10, 13, 'c2'); g.ellipse(11, 8, 2, 2, 'suit'); g.poly([(9, 9), (13, 9), (11, 12)], 'suit'); return {'c': WHITE, 'c2': WHITE, 'suit': '#c4121c'}
def i_phones(g): g.ellipse(9, 8, 7, 7, 'band'); g.ellipse(9, 8, 5, 5, None); g.rect(1, 8, 4, 7, 'cup'); g.rect(13, 8, 4, 7, 'cup'); g.rect(2, 9, 2, 5, 'glow'); g.rect(14, 9, 2, 5, 'glow'); return {'band': BLACK, 'cup': PURP, 'glow': '#7af0ff'}
def i_robe(g): g.poly([(6, 1), (12, 1), (16, 17), (2, 17)], 'r'); g.rect(8, 1, 2, 16, 'trim'); g.rect(4, 8, 10, 2, 'belt'); return {'r': ('#ffffff', '#c8c0d0', '#6a6070'), 'trim': '#ffe36a', 'belt': '#c4121c'}
def i_charm(g): g.ellipse(9, 10, 6, 6, 'c'); g.ellipse(9, 10, 3, 3, 'gem'); g.line(9, 0, 9, 4, 'str', 0.3); return {'c': GOLD, 'gem': GREEN, 'str': '#a6968f'}
def i_balloon(g): g.ellipse(9, 7, 6, 7, 'b'); g.line(9, 14, 10, 17, 'str', 0.3); g.put(7, 6, 'eye'); g.put(11, 6, 'eye'); g.line(6, 9, 12, 9, 'eye', 0.3); return {'b': BLACK, 'str': '#a6968f', 'eye': '#ff2630'}
def i_sword(g): g.line(3, 15, 14, 2, 'bl', 0.8); g.line(3, 11, 7, 15, 'hilt', 0.6); g.put(2, 16, 'hilt'); return {'bl': IRON, 'hilt': GOLD}
def i_scales(g): g.rect(8, 2, 2, 14, 'p'); g.rect(2, 4, 14, 1, 'p'); g.ellipse(3, 10, 3, 1.5, 'pan'); g.ellipse(15, 10, 3, 1.5, 'pan'); g.line(3, 5, 1, 9, 'p', 0.3); g.line(15, 5, 17, 9, 'p', 0.3); g.rect(5, 15, 8, 2, 'p'); return {'p': GOLD, 'pan': ('#ffffff', '#c8c0d0', '#6a6070')}
def i_pineapple(g):
    g.ellipse(9, 12, 5, 6, 'p')
    for i in range(3): g.poly([(6 + i * 2, 6), (7 + i * 2, 0), (8 + i * 2, 6)], 'leaf')
    g.line(5, 10, 13, 14, 'ln', 0.3); g.line(5, 14, 13, 10, 'ln', 0.3); return {'p': ('#ffe080', '#ffc040', '#a87020'), 'leaf': GREEN, 'ln': '#a87020'}
def i_pint(g): g.rect(4, 4, 10, 13, 'gl'); g.rect(5, 7, 8, 9, 'beer'); g.rect(4, 3, 10, 4, 'foam'); g.ellipse(15, 10, 2.5, 3, 'gl'); return {'gl': ('#e0e8f0', '#a0b0c0', '#506070'), 'beer': ('#ffd060', '#e0a020', '#8a5a10'), 'foam': WHITE}
def i_espresso(g): g.ellipse(9, 12, 5, 4, 'cup'); g.rect(4, 8, 10, 4, 'cup'); g.ellipse(9, 8, 4, 1.5, 'cof'); g.ellipse(9, 16, 7, 1.5, 'cup'); g.line(9, 5, 10, 1, 'st', 0.3); return {'cup': RED, 'cof': ('#5a3a1e', '#3a2410', '#1a0c04'), 'st': '#a6968f'}
def i_tongs(g): g.line(3, 16, 13, 2, 'm', 0.6); g.line(7, 16, 15, 3, 'm', 0.6); g.ellipse(14, 2, 2, 2, 'fire'); return {'m': IRON, 'fire': ('#ffe36a', '#ff9a30', '#c4301a')}
def i_garlic(g):
    g.ellipse(9, 11, 7, 6, 'g'); g.poly([(8, 5), (9, 0), (10, 5)], 'g')
    for x in (6, 9, 12): g.line(x, 6, x, 16, 'ln', 0.3)
    return {'g': ('#ffffff', '#e8e0d0', '#a8a090'), 'ln': '#c8c0b0'}
def i_boot(g): g.rect(4, 1, 6, 12, 'b'); g.rect(4, 11, 12, 5, 'b'); g.rect(4, 15, 13, 2, 'sole'); return {'b': WOOD, 'sole': BLACK}
def i_boa(g):
    for i in range(7): g.ellipse(3 + i * 2, 9 + math.sin(i) * 4, 3, 3, 'f')
    return {'f': ('#ffd0f0', '#ff8ad0', '#a03a80')}
def i_token(g): g.ellipse(9, 9, 7, 7, 't'); g.ellipse(9, 9, 4, 4, 'in'); g.put(9, 9, 'c'); return {'t': GOLD, 'in': ('#ff6a74', '#c4121c', '#6a0a10'), 'c': '#ffe36a'}
def i_moon(g): g.ellipse(9, 9, 7, 7, 'm'); g.ellipse(12, 7, 6, 6, None); return {'m': RED}
def i_dice(g): g.rect(3, 3, 12, 12, 'd'); g.put(6, 6, 'p'); g.put(9, 9, 'p'); g.put(12, 12, 'p'); return {'d': WHITE, 'p': '#c4121c'}
def i_bloodvial(g): g.rect(6, 4, 6, 12, 'gl'); g.rect(7, 8, 4, 7, 'bl'); g.rect(6, 2, 6, 2, 'cork'); return {'gl': ('#e0e8f0', '#a0b0c0', '#506070'), 'bl': RED, 'cork': WOOD}
def i_eye(g): g.ellipse(9, 9, 8, 6, 'w'); g.ellipse(9, 9, 3.5, 3.5, 'i'); g.put(9, 9, 'p'); return {'w': WHITE, 'i': PURP, 'p': '#12040a'}

ITEMS = {'cup': i_cup, 'chilli': i_chilli, 'dchilli': lambda g: i_chilli(g, True), 'pizza': i_pizza, 'bread': i_bread, 'tea': i_tea, 'pill': i_pill, 'pie': i_pie, 'lotion': i_lotion,
         'shell': i_shell, 'tin': i_tin, 'egg': i_egg, 'fang': i_fang, 'cards': i_cards, 'phones': i_phones, 'robe': i_robe, 'charm': i_charm, 'balloon': i_balloon, 'sword': i_sword,
         'scales': i_scales, 'pineapple': i_pineapple, 'pint': i_pint, 'espresso': i_espresso, 'tongs': i_tongs, 'garlic': i_garlic, 'boot': i_boot, 'boa': i_boa, 'token': i_token,
         'moon': i_moon, 'dice': i_dice, 'vial': i_bloodvial, 'eye': i_eye}
ART = {'gr_rock0': lambda: rock(0), 'gr_rock1': lambda: rock(1), 'gr_pile1': lambda: pile(1), 'gr_pile2': lambda: pile(2), 'gr_pile3': lambda: pile(3), 'gr_spikes': spikes,
       'gr_heart': lambda: heart(False), 'gr_hearth': lambda: heart(True), 'gr_hearte': hearte, 'gr_shield': shield, 'gr_coin': lambda: coin(False), 'gr_coin5': lambda: coin(True), 'gr_key': key,
       'gr_bomb': lambda: bomb(False), 'gr_bombl': lambda: bomb(True), 'gr_trap': trapdoor, 'gr_ped': pedestal,
       'gr_tearc': lambda: tear('c'), 'gr_tearr': lambda: tear('r'), 'gr_tearp': lambda: tear('p'), 'gr_tearg': lambda: tear('g'), 'gr_tearf': lambda: tear('f')}
for k in ('n', 'boss', 'gold', 'shop'):
    ART['gr_door_' + k] = (lambda k=k: door(k, False)); ART['gr_door_' + k + 'o'] = (lambda k=k: door(k, True))
for k, fn in ITEMS.items(): ART['it_' + k] = (lambda fn=fn: icon(fn))
