"""Cumhead Kart's art. The drivers are the characters we already have (Load Legacy's town folk, Cumhead's atlas, the
homunculus breeds, the bosses, Sir Johnathan); this file adds a view from behind for each of them (so you see the
back of their heads when you chase them), the item icons, and borrows scenery and items from our other games."""
import sys
from collections import Counter
from PIL import Image
from pixelkit import Grid
import art as _A

USE = ['h_gloop_egg0', 'h_gloop_baby_idle0', 'h_gloop_baby_idle1', 'ch_idle0', 'ch_rn2', 'ch_icon0', 'npc_*', 'greebo_s0', 'spermaid_s0', 'h_gloop_adult_idle0', 'h_*_adult_idle0', 'boss_blum', 'f_kingblum_0', 'f_sirj_0', 'cat', 'cumface',
       'fac_*', 'steve0', 'steve1', 'throne', 'f_blumling_*', 'f_blumeye_*', 'f_blumguard_*', 'f_rat_*', 'f_ant_*', 'f_wasp_*', 'f_skeleton_*', 'f_mummy_*', 'f_balloon_*', 'f_clown_*',
       'f_creamblob_*', 'f_cultrat_*', 'f_bat_*', 'f_crow_*', 'f_gargoyle_*', 'f_pieling_*', 'f_jelly_*', 'f_feather_*', 'f_toymouse_*', 'f_moon_*', 'f_ghost_*', 'f_imp_*', 'f_wraith_*',
       'p_*', 'f_knight_*', 'f_mega_*', 'f_lheart_*']
BORROW = {'grinding': ['it_*', 'gr_rock0', 'gr_rock1', 'gr_spikes'], 'meatnado': ['mn_drop', 'mn_pill', 'mn_sausage', 'mn_pie'], 'willy-nilly': ['wn_bubble', 'wn_plant', 'wn_table', 'wn_jukebox', 'wn_sp_*'],
          'arcade': ['ao_meat0', 'ao_meat1', 'ao_cabbig', 'ao_cab_*', 'ao_coin', 'ao_bubble'], 'void': ['jv_crys0', 'jv_crys1', 'jv_crystal', 'jv_void0', 'jv_void1', 'jv_tree', 'jv_lamp0', 'jv_lamp1', 'jv_mtn'],
          'spuzzworld': ['sw_mine1', 'sw_exit', 'sw_hob0']}
import fnmatch
ART = {}
for g, pats in BORROW.items():
    ex = _A.extra(g)[0]
    for k in ex:
        if any(fnmatch.fnmatch(k, p) for p in pats): ART[k] = (lambda im=ex[k]: im)

RED = ('#ff3a44', '#c4121c', '#6a0a10'); CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); GOLD = ('#fff09a', '#ffc840', '#a8741a'); BLUE = ('#d8f4ff', '#9adfff', '#3a8ac8'); PURP = ('#e0a0ff', '#9a3ad8', '#44106a')

def sperm():
    g = Grid(22, 12); g.ellipse(16, 6, 5, 4.2, 'h'); g.line(11, 6, 2, 4, 't', 1.1); g.line(6, 5, 1, 8, 't', 0.8); g.put(18, 4, 'e'); g.put(17, 5, 'hi')
    return g, {'h': CREAM, 't': CREAM, 'e': '#12040a', 'hi': '#ffffff'}
def bubble():
    g = Grid(18, 18); g.ellipse(9, 9, 8.2, 8.2, 'b'); g.ellipse(9, 9, 6.5, 6.5, 'in'); g.put(5, 5, 'hi'); g.put(6, 5, 'hi'); g.put(5, 6, 'hi')
    return g, {'b': BLUE, 'in': ('#2a6a9a', '#1a4a7a', '#0a2a4a'), 'hi': '#ffffff'}
def shield():
    g = Grid(40, 34)
    for a in range(0, 360, 3):
        import math
        x = 20 + math.cos(math.radians(a)) * 18; y = 17 + math.sin(math.radians(a)) * 15.5
        g.put(int(round(x)), int(round(y)), 'r')
        x2 = 20 + math.cos(math.radians(a)) * 17; y2 = 17 + math.sin(math.radians(a)) * 14.5
        if 200 < a < 260: g.put(int(round(x2)), int(round(y2)), 'hi')
    return g, {'r': BLUE, 'hi': '#ffffff'}
ART['ck_shield'] = shield
def kartside():  # a kart seen from the side, for the Games card
    g = Grid(44, 20)
    g.rect(6, 9, 32, 5, 'b'); g.poly([(36, 9), (43, 11), (43, 14), (36, 14)], 'n'); g.rect(10, 4, 4, 6, 's'); g.rect(2, 8, 6, 4, 'e'); g.rect(0, 9, 3, 2, 'm')
    for cx in (11, 34): g.ellipse(cx, 15.5, 4, 4, 't'); g.ellipse(cx, 15.5, 1.6, 1.6, 'h')
    g.line(28, 9, 31, 4, 'm', 0.6); g.rect(30, 3, 3, 2, 'm')
    return g, {'b': RED, 'n': ('#f1e7d0', '#c8b898', '#7a6a58'), 's': ('#3a3440', '#2a2228', '#12040a'), 'e': ('#d0c8d0', '#8a828a', '#3a343c'), 'm': ('#d0c8d0', '#8a828a', '#3a343c'), 't': ('#3a3440', '#2a2228', '#12040a'), 'h': '#a6968f'}
ART['ck_kart'] = kartside
def magnet():  # Potbelly's coin magnet: a red horseshoe with silver tips and a coin
    g = Grid(18, 18)
    for a in range(0, 181, 6):
        import math
        x = 9 + math.cos(math.radians(a)) * 6; y = 8 - math.sin(math.radians(-a)) * 6
        g.ellipse(x, y, 2, 2, 'm')
    g.rect(1, 2, 4, 6, 'm'); g.rect(13, 2, 4, 6, 'm'); g.rect(1, 1, 4, 3, 's'); g.rect(13, 1, 4, 3, 's')
    return g, {'m': RED, 's': ('#ffffff', '#c8c0c8', '#6a646c')}
ART['ck_magnet'] = magnet
def cracker():
    g = Grid(18, 18); g.rect(2, 2, 14, 14, 'c')
    for (x, y) in ((5, 5), (11, 5), (5, 11), (11, 11), (8, 8)): g.put(x, y, 'h')
    return g, {'c': ('#f0c070', '#c8862a', '#7a4410'), 'h': '#7a4410'}
def nado():
    g = Grid(18, 20)
    for y in range(18):
        w = 1.5 + y * 0.42; g.line(9 - w, y + 1, 9 + w, y + 1, 'n' if y % 3 else 'm', 0.6)
    g.ellipse(5, 6, 1.6, 1.2, 's'); g.ellipse(13, 12, 1.6, 1.2, 's')
    return g, {'n': ('#c87060', '#8a3a2a', '#4a1a10'), 'm': ('#ff9a8a', '#c4504a', '#6a1a10'), 's': RED}
def goo():
    g = Grid(18, 18); g.ellipse(9, 7, 6, 5, 'g'); g.poly([(4, 8), (6, 16), (8, 9)], 'g'); g.poly([(10, 9), (12, 17), (14, 8)], 'g'); g.put(7, 5, 'hi'); g.put(8, 4, 'hi')
    return g, {'g': PURP, 'hi': '#ffffff'}
def flame(f):
    def fn():
        g = Grid(8, 12); g.ellipse(4, 8, 3, 3.5, 'o'); g.poly([(1, 8), (4, 0 + f), (7, 8)], 'o'); g.ellipse(4, 9, 1.6, 2, 'y'); g.put(4 - f, 4, 'y')
        return g, {'o': ('#ffb040', '#ff7a20', '#c4301a'), 'y': '#fff6a0'}
    return fn
ART.update({'ck_flame': flame(0), 'ck_flame0': flame(0), 'ck_flame1': flame(1)})
def star():
    g = Grid(12, 12); g.poly([(6, 0), (8, 4), (12, 5), (9, 8), (10, 12), (6, 10), (2, 12), (3, 8), (0, 5), (4, 4)], 's'); return g, {'s': GOLD}
def cup(col):
    def f():
        g = Grid(26, 26); g.ellipse(13, 7, 9, 3, 'c'); g.poly([(4, 7), (22, 7), (18, 15), (8, 15)], 'c'); g.rect(11, 15, 4, 5, 'c'); g.rect(7, 20, 12, 3, 'c'); g.rect(8, 23, 10, 2, 'b')
        g.line(4, 8, 1, 4, 'c', 0.6); g.line(1, 4, 4, 11, 'c', 0.6); g.line(22, 8, 25, 4, 'c', 0.6); g.line(25, 4, 22, 11, 'c', 0.6); g.put(9, 9, 'hi'); g.put(9, 10, 'hi')
        return g, {'c': col, 'b': ('#5a3a1a', '#3a2010', '#1a0a04'), 'hi': '#ffffff'}
    return f
ART.update({'ck_sperm': sperm, 'ck_bubble': bubble, 'ck_cracker': cracker, 'ck_nado': nado, 'ck_goo': goo, 'ck_star': star,
            'ck_gold': cup(GOLD), 'ck_silver': cup(('#ffffff', '#c8c0c8', '#6a646c')), 'ck_bronze': cup(('#f0b080', '#c07a3a', '#6a3a14'))})

# ---------- the view from behind: same outline and legs, the head filled with hair (hats kept), the body with the shirt ----------
# [front sprite, rows of hat to keep, neck row, hair colour, shirt colour, legs row]
BACKS = {
    'cumhead': ('ch_idle0', 0, 25, '#f0c070', '#2a1418', 46), 'spermaid': ('npc_spermaid', 0, 27, '#f1e7d0', None, 48), 'greebo': ('npc_greebo', 10, 24, '#c8862a', '#f1e7d0', 36),
    'amy': ('npc_amy', 0, 18, '#ff8ac0', '#c4121c', 29), 'tb': ('npc_tb', 10, 17, '#4a2e18', '#5a3a20', 29), 'saba': ('npc_saba', 8, 18, '#e8e0d8', '#3a8a2a', 29),
    'joff': ('npc_joff', 8, 17, '#3a2418', '#f1e7d0', 29), 'kaya': ('npc_kaya', 0, 18, '#8a3a20', '#c4121c', 29), 'beebs': ('npc_beebs', 8, 17, '#c8702a', '#7a4a20', 29),
    'ali': ('npc_ali', 0, 18, '#3a2418', '#f1e7d0', 29), 'potbelly': ('npc_potbelly', 0, 18, '#ff9ab4', '#c4121c', 29), 'kingblum': ('f_kingblum_0', 26, 70, '#c4121c', '#12040a', 104),
    'hom': ('h_gloop_adult_idle0', 0, 0, None, None, 0), 'blum': ('boss_blum', 0, 0, None, None, 0), 'sirj': ('cat', 0, 0, None, None, 0)
}
def hexc(h): h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)
def back(cid):
    name, hat, neck, hair, shirt, legs = BACKS[cid]; src = _A.base()[name].convert('RGBA'); W, H = src.size; px = src.load(); out = src.copy(); po = out.load()
    if hair is None: return out
    solid = lambda x, y: 0 <= x < W and 0 <= y < H and px[x, y][3] > 0
    def edge(x, y): return any(not solid(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    hc, sc = hexc(hair), (hexc(shirt) if shirt else None)
    def tone(c, k): return (max(0, min(255, int(c[0] * k))), max(0, min(255, int(c[1] * k))), max(0, min(255, int(c[2] * k))), 255)
    for y in range(H):
        xs = [x for x in range(W) if solid(x, y)]
        if not xs: continue
        x0, x1 = xs[0], xs[-1]
        for x in xs:
            if edge(x, y): continue
            if y < hat: continue
            if y < neck:
                k = 1.18 if (y == hat or y == hat + 1) else 0.78 if y >= neck - 2 else 1.0
                k *= 0.88 if x <= x0 + 2 or x >= x1 - 2 else 1.0
                po[x, y] = tone(hc, k)
            elif sc and y < legs and x0 + 3 <= x <= x1 - 3:
                k = 0.82 if (x == (x0 + x1) // 2) else 0.75 if y >= legs - 1 else 1.0
                po[x, y] = tone(sc, k)
    # a dark line where head meets body
    if neck:
        for x in range(W):
            if solid(x, neck) and not edge(x, neck) and solid(x, neck - 1): po[x, neck] = (18, 4, 10, 255)
    return out
for _c in BACKS: ART['ckb_' + _c] = (lambda c=_c: back(c))
