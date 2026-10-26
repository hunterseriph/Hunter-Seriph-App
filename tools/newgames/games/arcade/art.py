"""Potbelly's Arcade Overdrive art: the arcade cabinets (and the one that goes Overdrive), plus the bits the micro
games need: meat chunks, pills, a lever, gate bars, targets, slot symbols, arrows, stairs and floor tiles."""
import math
from pixelkit import Grid
USE = ['ch_*', 'cumface', 'npc_*', 'spermaid_s*', 'greebo_s*', 'f_crawler_*', 'f_bat_*', 'f_batP_*', 'f_blumling_*', 'f_blum_*', 'f_blum2_*', 'f_slime_*', 'f_ghoul_*', 'f_blumguard_*', 'f_vampire_*', 'f_imp_*',
       'f_sperm_*', 'f_pig_0', 'f_pig_1', 'f_demon_*', 'f_golem_*', 'f_beast_*', 'f_ratking_*',
       'p_logboat', 'p_slot', 'p_chest', 'p_chestopen', 'h_gloop_egg*', 'h_blood_egg*', 'h_gloop_baby_idle0', 'h_blood_baby_idle0', 'h_ember_baby_idle0', 'steve0', 'steve1']
RED = ('#ff3a44', '#c4121c', '#6a0a10'); GOLD = ('#fff09a', '#ffc840', '#a8741a'); BLACK = ('#4a3a40', '#221a1e', '#0c0608'); IRON = ('#9a929a', '#5a545c', '#2a262c')
WHITE = ('#ffffff', '#e8dcc8', '#a8987a'); WOOD = ('#a8643a', '#6e3a1e', '#3a1a0c'); PURP = ('#c08aff', '#7a2ad8', '#34106a')

def cabinet(col, big=False):
    w, h = (96, 160) if big else (56, 96); g = Grid(w, h)
    s = w / 56.0
    g.poly([(4 * s, 0), (52 * s, 0), (52 * s, h), (4 * s, h)], 'body')
    g.rect(2 * s, 0, 52 * s, 14 * s, 'marq'); g.rect(6 * s, 3 * s, 44 * s, 8 * s, 'mlit')
    g.rect(8 * s, 18 * s, 40 * s, 30 * s, 'bez'); g.rect(11 * s, 21 * s, 34 * s, 24 * s, 'scr')
    g.poly([(2 * s, 52 * s), (54 * s, 52 * s), (56 * s, 62 * s), (0, 62 * s)], 'deck')
    g.ellipse(16 * s, 56 * s, 3 * s, 2 * s, 'stick'); g.rect(15 * s, 50 * s, 2 * s, 6 * s, 'stem'); g.ellipse(16 * s, 50 * s, 2.5 * s, 2.5 * s, 'ball')
    for i, c in enumerate(('b1', 'b2', 'b3')): g.ellipse((30 + i * 7) * s, 57 * s, 2.2 * s, 1.6 * s, c)
    g.rect(22 * s, 70 * s, 12 * s, 10 * s, 'slot'); g.rect(26 * s, 73 * s, 4 * s, 4 * s, 'coin')
    g.rect(4 * s, 62 * s, 2 * s, h - 62 * s, 'trim'); g.rect(50 * s, 62 * s, 2 * s, h - 62 * s, 'trim')
    return g, {'body': col, 'marq': BLACK, 'mlit': GOLD, 'bez': BLACK, 'scr': ('#3a6aaa', '#1a3a6a', '#0a1a3a'), 'deck': BLACK, 'stick': IRON, 'stem': IRON, 'ball': RED,
               'b1': RED, 'b2': GOLD, 'b3': ('#7af0ff', '#2aa0d0', '#0a4a6a'), 'slot': BLACK, 'coin': '#ff2630', 'trim': GOLD}

def coin():
    g = Grid(14, 14); g.ellipse(7, 7, 6.5, 6.5, 'c'); g.ellipse(7, 7, 4, 4, 'in'); g.rect(6, 4, 2, 6, 'd'); return g, {'c': GOLD, 'in': ('#fff6c0', '#ffd860', '#c8902a'), 'd': '#a8741a'}
def meat(v):
    g = Grid(22, 18); g.ellipse(11, 10, 9 + v, 7, 'm'); g.ellipse(8, 8, 3, 2, 'fat'); g.rect(17, 3, 4, 6, 'bone'); g.ellipse(20, 3, 2, 2, 'bone')
    return g, {'m': ('#ff8a7a', '#c43a2a', '#6a1208'), 'fat': '#ffe0d0', 'bone': WHITE}
def pill():
    g = Grid(16, 10); g.ellipse(5, 5, 4.5, 4.5, 'a'); g.ellipse(11, 5, 4.5, 4.5, 'b'); g.rect(5, 1, 6, 9, 'a'); g.rect(8, 1, 3, 9, 'b'); return g, {'a': ('#ff8ad0', '#d040a0', '#6a1050'), 'b': WHITE}
def lever(on):
    g = Grid(24, 30); g.rect(4, 22, 16, 8, 'base'); a = -0.6 if not on else 0.6; x1, y1 = 12 + math.sin(a) * 16, 24 - math.cos(a) * 16
    g.line(12, 24, x1, y1, 'stick', 1); g.ellipse(x1, y1, 3.5, 3.5, 'knob'); return g, {'base': IRON, 'stick': IRON, 'knob': RED}
def bars():
    g = Grid(40, 48); g.rect(0, 0, 40, 4, 'f'); g.rect(0, 44, 40, 4, 'f')
    for x in range(2, 40, 7): g.rect(x, 0, 3, 48, 'b')
    return g, {'f': IRON, 'b': IRON}
def target():
    g = Grid(22, 22); g.ellipse(11, 11, 10, 10, 'a'); g.ellipse(11, 11, 7, 7, 'b'); g.ellipse(11, 11, 4, 4, 'a'); g.ellipse(11, 11, 1.5, 1.5, 'b'); return g, {'a': RED, 'b': WHITE}
def sym(k):
    g = Grid(24, 24)
    if k == '7': g.rect(4, 3, 16, 4, 's'); g.line(19, 6, 10, 21, 's', 1.5)
    elif k == 'cherry': g.ellipse(7, 16, 5, 5, 's'); g.ellipse(16, 17, 5, 5, 's'); g.line(7, 11, 13, 3, 'st', 0.5); g.line(16, 12, 13, 3, 'st', 0.5)
    elif k == 'skull': g.ellipse(12, 10, 9, 8, 'b'); g.rect(7, 15, 10, 6, 'b'); g.ellipse(8, 10, 2.5, 3, 'e'); g.ellipse(16, 10, 2.5, 3, 'e'); g.rect(9, 18, 1, 3, 'e'); g.rect(12, 18, 1, 3, 'e'); g.rect(15, 18, 1, 3, 'e')
    else: g.ellipse(12, 13, 9, 9, 'd'); g.poly([(10, 6), (12, 1), (14, 6)], 'd'); g.ellipse(9, 11, 2, 2, 'sh')
    return g, {'s': RED, 'st': ('#5aaa3a', '#2a6a1a', '#103a08'), 'b': WHITE, 'e': '#12040a', 'd': ('#fff6d8', '#f1e0b0', '#b8a070'), 'sh': '#ffffff'}
def arrow():
    g = Grid(20, 20); g.poly([(10, 1), (19, 10), (13, 10), (13, 19), (7, 19), (7, 10), (1, 10)], 'a'); return g, {'a': GOLD}
def stairs():
    g = Grid(24, 24); g.rect(0, 0, 24, 24, 'f')
    for i in range(4): g.rect(2 + i * 3, 4 + i * 5, 20 - i * 6, 4, 'st')
    return g, {'f': ('#2a1418', '#1a0a0e', '#0c0406'), 'st': ('#c8a888', '#8a6a5a', '#4a3a2a')}
def wall():
    g = Grid(24, 24); g.rect(0, 0, 24, 24, 'w'); g.rect(0, 11, 24, 1, 'm'); g.rect(11, 0, 1, 11, 'm'); g.rect(5, 12, 1, 12, 'm'); g.rect(17, 12, 1, 12, 'm'); return g, {'w': ('#7a2a30', '#5a141c', '#2e080c'), 'm': '#1a0408'}
def bowl(dyn):
    g = Grid(28, 20); g.ellipse(14, 12, 13, 7, 'bowl'); g.rect(1, 8, 26, 4, 'bowl'); g.ellipse(14, 8, 11, 3.5, 'ch')
    if dyn: g.rect(18, 0, 4, 8, 'st'); g.put(19, 0, 'sp'); g.put(20, 0, 'sp')
    return g, {'bowl': WHITE, 'ch': ('#ff6a3a', '#c4301a', '#6a1208') if not dyn else BLACK, 'st': RED, 'sp': '#ffe36a'}
def bigbubble():
    g = Grid(44, 36); g.ellipse(22, 15, 21, 15, 'b'); g.poly([(14, 26), (18, 35), (24, 28)], 'b'); return g, {'b': WHITE}
def heart():
    g = Grid(14, 13); g.ellipse(4, 4, 4, 4, 'h'); g.ellipse(10, 4, 4, 4, 'h'); g.poly([(0, 5), (14, 5), (7, 13)], 'h'); return g, {'h': RED}
def heart0():
    g = Grid(14, 13); g.ellipse(4, 4, 4, 4, 'h'); g.ellipse(10, 4, 4, 4, 'h'); g.poly([(0, 5), (14, 5), (7, 13)], 'h'); return g, {'h': ('#4a2a30', '#2a1418', '#1a0a0e')}
def drop():
    g = Grid(12, 16); g.ellipse(6, 10, 5, 5, 'd'); g.poly([(2, 9), (6, 0), (10, 9)], 'd'); g.ellipse(4, 9, 1.4, 2, 'sh'); return g, {'d': ('#fffbe8', '#f1e0b0', '#b8a070'), 'sh': '#ffffff'}

ART = {'ao_cab_r': lambda: cabinet(RED), 'ao_cab_p': lambda: cabinet(PURP), 'ao_cab_b': lambda: cabinet(('#7af0ff', '#2aa0d0', '#0a4a6a')), 'ao_cab_g': lambda: cabinet(('#9aff5a', '#4aa82a', '#1a5a10')),
       'ao_cabbig': lambda: cabinet(GOLD, True), 'ao_coin': coin, 'ao_meat0': lambda: meat(0), 'ao_meat1': lambda: meat(2), 'ao_pill': pill, 'ao_lever0': lambda: lever(False), 'ao_lever1': lambda: lever(True),
       'ao_bars': bars, 'ao_target': target, 'ao_s7': lambda: sym('7'), 'ao_scherry': lambda: sym('cherry'), 'ao_sskull': lambda: sym('skull'), 'ao_sdrop': lambda: sym('drop'),
       'ao_arrow': arrow, 'ao_stairs': stairs, 'ao_wall': wall, 'ao_bowlc': lambda: bowl(False), 'ao_bowld': lambda: bowl(True), 'ao_bubble': bigbubble, 'ao_heart': heart, 'ao_heart0': heart0, 'ao_drop': drop}

# borrowed: Grinding's rock and bomb, Spuzzworld's mine, the chibi Cumhead, and a chilli for Willy Nilly's games
import importlib.util as _iu, os as _os
def _load(game):
    p = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))), game, 'art.py'); sp = _iu.spec_from_file_location('_a_' + game, p); m = _iu.module_from_spec(sp); sp.loader.exec_module(m); return m.ART
_gr = _load('grinding'); _sw = _load('spuzzworld')
for _k in ('gr_rock0', 'gr_bomb', 'gr_bombl'): ART[_k] = _gr[_k]
ART['ao_mine'] = _sw['sw_mine1']
import chibi as _ch
ART.update(_ch.frames())
def chilli():
    g = Grid(18, 10); g.ellipse(9, 5, 8, 4, 'c'); g.poly([(14, 2), (18, 5), (14, 8)], 'c'); g.rect(0, 4, 3, 2, 'stem'); g.put(6, 3, 'hi'); g.put(7, 3, 'hi')
    return g, {'c': RED, 'stem': ('#9aff5a', '#4aa82a', '#1a5a10'), 'hi': '#ffd0c0'}
ART['ao_chilli'] = chilli
