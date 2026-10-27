"""Willy Nilly's own art: Amy's Willy Chilli diner. Tables, chairs, chilli bowls, the two pots, the stove and pass,
the door, decor and the little icons (hearts, tickets, coins). Same outline and shading as the rest."""
import math
from pixelkit import Grid
USE = ['npc_*', 'greebo_s0', 'spermaid_s0', 'ch_idle0', 'ch_idle1', 'ch_icon0', 'cumface', 'steve0', 'steve1', 'h_*_adult_idle0', 'h_*_teen_idle0']
WOOD = ('#a8643a', '#6e3a1e', '#3a1a0c'); WOOD2 = ('#8a4e2c', '#5a2e16', '#2e1408'); RED = ('#ff3a44', '#c4121c', '#6a0a10'); IRON = ('#9a929a', '#5a545c', '#2a262c')
CLOTH = ('#e8303a', '#b0141e', '#5a0810'); WHITE = ('#ffffff', '#e8dcc8', '#a8987a'); BLACK = ('#3a2a30', '#1a1014', '#0c0608'); CHILLI = ('#ff6a3a', '#c4301a', '#6a1208')

def table(cloth=True):
    g = Grid(52, 34)
    g.rect(6, 22, 4, 12, 'leg'); g.rect(42, 22, 4, 12, 'leg')
    g.ellipse(26, 14, 25, 11, 'top')
    if cloth:
        g.ellipse(26, 13, 23, 9, 'cloth')
        for x in range(4, 50, 6): g.poly([(x, 18), (x + 3, 23), (x + 6, 18)], 'cloth')
        g.ellipse(26, 12, 3, 2, 'candle'); g.rect(25, 7, 2, 5, 'wax'); g.put(25, 5, 'flame'); g.put(26, 6, 'flame')
    return g, {'leg': WOOD2, 'top': WOOD, 'cloth': CLOTH, 'candle': IRON, 'wax': '#f1e7d0', 'flame': '#ffe36a'}

def chair():
    g = Grid(18, 26)
    g.rect(2, 0, 14, 12, 'back'); g.rect(4, 2, 10, 8, 'pad'); g.rect(1, 12, 16, 5, 'seat'); g.rect(2, 17, 2, 9, 'leg'); g.rect(14, 17, 2, 9, 'leg')
    return g, {'back': WOOD2, 'pad': RED, 'seat': WOOD, 'leg': WOOD2}

def bowl(dyn):
    g = Grid(20, 16)
    g.ellipse(10, 9, 9, 6, 'bowl'); g.rect(1, 6, 18, 4, 'bowl'); g.ellipse(10, 6, 8, 3, 'chilli')
    for (x, y) in ((6, 5), (11, 6), (14, 5), (8, 7)): g.put(x, y, 'bean')
    if dyn:
        g.rect(13, 0, 3, 7, 'stick'); g.put(14, 0, 'wick'); g.rect(13, 3, 3, 1, 'band')
        g.ellipse(10, 6, 8, 3, 'dchilli', over=False)
    else: g.line(3, 4, 7, 1, 'pepper', 0.7); g.put(8, 1, 'stem')
    pal = {'bowl': WHITE, 'chilli': ('#3a1008', '#5a1a0a', '#2a0804') if dyn else CHILLI, 'dchilli': BLACK, 'bean': '#ffb040' if not dyn else '#ff2630',
           'stick': RED, 'wick': '#ffe36a', 'band': '#12040a', 'pepper': RED, 'stem': '#3a8a1a'}
    if dyn: pal['chilli'] = ('#8a1a10', '#4a0a08', '#1a0404')
    return g, pal

def pot(dyn, f):
    g = Grid(40, 40); bub = [0, 1, 2, 0][f]
    g.rect(2, 26, 36, 14, 'stove'); g.rect(4, 28, 32, 3, 'grill')
    for x in (8, 18, 28): g.ellipse(x + 2, 36, 3, 2, 'fire' if f != 3 else 'stove')
    g.ellipse(20, 14, 17, 6, 'rim'); g.rect(3, 14, 34, 12, 'pot'); g.ellipse(20, 25, 17, 4, 'pot')
    g.rect(0, 16, 4, 4, 'handle'); g.rect(36, 16, 4, 4, 'handle')
    g.ellipse(20, 14, 14, 4, 'chilli')
    for i, x in enumerate((12, 20, 27)):
        if (i + bub) % 3 != 0: g.ellipse(x, 12 - ((i + bub) % 2), 2, 1.5, 'bubble')
    if dyn:
        g.poly([(14, 18), (26, 18), (24, 24), (16, 24)], 'skull'); g.put(17, 20, 'eye'); g.put(22, 20, 'eye'); g.rect(18, 22, 4, 1, 'eye')
    else:
        g.ellipse(20, 21, 5, 3, 'label'); g.put(19, 21, 'labt'); g.put(21, 21, 'labt')
    return g, {'stove': BLACK, 'grill': IRON, 'fire': ('#ffe36a', '#ff9a30', '#c4301a'), 'rim': IRON, 'pot': BLACK if dyn else RED, 'handle': IRON,
               'chilli': ('#8a1a10', '#4a0a08', '#1a0404') if dyn else CHILLI, 'bubble': '#ffb040' if not dyn else '#ff2630', 'skull': WHITE, 'eye': '#12040a', 'label': WHITE, 'labt': '#c4121c'}

def door(open_):
    g = Grid(40, 64)
    g.rect(0, 0, 40, 64, 'frame'); g.rect(4, 4, 32, 60, 'void')
    if not open_:
        g.rect(4, 4, 32, 60, 'door'); g.rect(8, 8, 24, 20, 'glass'); g.rect(8, 34, 24, 26, 'panel'); g.ellipse(31, 36, 2, 2, 'knob'); g.line(10, 10, 16, 16, 'shine', 0.4)
    else:
        g.poly([(4, 4), (12, 8), (12, 60), (4, 64)], 'door')
    g.rect(0, 0, 40, 4, 'top')
    return g, {'frame': WOOD2, 'void': '#12040a', 'door': RED, 'glass': ('#5a2a3a', '#2a0a14', '#12040a'), 'panel': ('#d0303a', '#a01018', '#4a060a'), 'knob': ('#fff09a', '#ffc840', '#a8741a'), 'shine': '#a06070', 'top': RED}

def counter(w):
    g = Grid(w, 22)
    g.rect(0, 0, w, 6, 'top'); g.rect(0, 6, w, 16, 'front')
    for x in range(4, w - 4, 16): g.rect(x, 9, 12, 10, 'panel')
    return g, {'top': ('#d8c8a8', '#a89878', '#5a4a3a'), 'front': RED, 'panel': ('#d0303a', '#8a0c14', '#4a060a')}

def plant():
    g = Grid(20, 34)
    g.poly([(5, 22), (15, 22), (13, 33), (7, 33)], 'potp')
    for a in range(7):
        ang = -math.pi / 2 + (a - 3) * 0.45; g.line(10, 22, 10 + math.cos(ang) * 10, 22 + math.sin(ang) * 18, 'leaf', 1)
    return g, {'potp': RED, 'leaf': ('#5aaa3a', '#2a6a1a', '#103a08')}

def jukebox():
    g = Grid(30, 46)
    g.rect(1, 12, 28, 34, 'box'); g.ellipse(15, 13, 14, 12, 'box'); g.ellipse(15, 15, 10, 8, 'glass'); g.rect(5, 24, 20, 10, 'grille')
    for x in range(7, 24, 3): g.rect(x, 25, 1, 8, 'bar')
    g.rect(1, 36, 28, 3, 'neon'); g.rect(4, 40, 22, 4, 'base')
    return g, {'box': WOOD, 'glass': ('#ffe36a', '#ff9a30', '#c4301a'), 'grille': BLACK, 'bar': '#a6968f', 'neon': ('#ff6a7a', '#ff2630', '#a0101a'), 'base': WOOD2}

def ticket():
    g = Grid(12, 14); g.rect(1, 0, 10, 13, 'paper'); g.line(3, 3, 8, 3, 'ink', 0.3); g.line(3, 6, 8, 6, 'ink', 0.3); g.line(3, 9, 6, 9, 'ink', 0.3)
    return g, {'paper': WHITE, 'ink': '#c4121c'}

def heart(full):
    g = Grid(9, 8); g.ellipse(2.5, 2.5, 2.5, 2.5, 'h'); g.ellipse(6.5, 2.5, 2.5, 2.5, 'h'); g.poly([(0, 3), (9, 3), (4.5, 8)], 'h')
    return g, {'h': ('#ff6a74', '#ff2630', '#8a0a14') if full else ('#4a2a30', '#2a1418', '#1a0a0e')}

def coin():
    g = Grid(10, 10); g.ellipse(5, 5, 4.5, 4.5, 'c'); g.rect(4, 2, 2, 6, 'd'); return g, {'c': ('#fff09a', '#ffc840', '#a8741a'), 'd': '#a8741a'}

def sign():
    g = Grid(150, 30)
    g.rect(0, 0, 150, 30, 'board'); g.rect(3, 3, 144, 24, 'inner')
    for x in range(6, 146, 8): g.put(x, 1, 'bulb'); g.put(x, 28, 'bulb')
    return g, {'board': RED, 'inner': ('#2a0a0e', '#1a0508', '#0c0204'), 'bulb': '#ffe36a'}

def bubble():
    g = Grid(24, 22); g.ellipse(12, 9, 11, 9, 'b'); g.poly([(8, 15), (12, 21), (14, 15)], 'b'); return g, {'b': WHITE}

def dish():
    g = Grid(18, 10); g.ellipse(9, 5, 8, 4, 'p'); g.ellipse(9, 4, 5, 2, 'f'); return g, {'p': WHITE, 'f': ('#a8643a', '#6e3a1e', '#3a1a0c')}

ART = {'wn_table': lambda: table(True), 'wn_chair': chair, 'wn_bowlc': lambda: bowl(False), 'wn_bowld': lambda: bowl(True),
       'wn_potc0': lambda: pot(False, 0), 'wn_potc1': lambda: pot(False, 1), 'wn_potc2': lambda: pot(False, 2), 'wn_potd0': lambda: pot(True, 0), 'wn_potd1': lambda: pot(True, 1), 'wn_potd2': lambda: pot(True, 2),
       'wn_potcoff': lambda: pot(False, 3), 'wn_potdoff': lambda: pot(True, 3),
       'wn_door': lambda: door(False), 'wn_dooropen': lambda: door(True), 'wn_counter': lambda: counter(160), 'wn_plant': plant, 'wn_jukebox': jukebox,
       'wn_ticket': ticket, 'wn_heart': lambda: heart(True), 'wn_heart0': lambda: heart(False), 'wn_coin': coin, 'wn_sign': sign, 'wn_bubble': bubble, 'wn_dish': dish}

# ======================================================================================= the other five places
GOLD = ('#fff09a', '#ffc840', '#a8741a'); CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); BREAD = ('#f0c070', '#c8862a', '#7a4410'); COFFEE = ('#a8643a', '#5a2a10', '#2a1008')
GREEN = ('#9aff5a', '#4aa82a', '#1a5a10'); BLUE = ('#9adfff', '#3a8ac8', '#14406a'); PURP = ('#c08aff', '#7a2ad8', '#34106a'); PINE = ('#ffe36a', '#e0b020', '#8a6008')

# ---- dishes (what Amy carries and what customers want) ----
def d_crackers():
    g = Grid(20, 14); g.ellipse(10, 9, 9, 4, 'plate')
    for (x, y) in ((4, 4), (9, 3), (13, 5)): g.rect(x, y, 5, 5, 'cr'); g.put(x + 1, y + 1, 'hole'); g.put(x + 3, y + 3, 'hole')
    g.ellipse(11, 3, 2, 1.5, 'cream'); return g, {'plate': WHITE, 'cr': BREAD, 'hole': '#7a4410', 'cream': CREAM}
def d_cumpuccino():
    g = Grid(16, 18); g.rect(2, 6, 11, 10, 'cup'); g.ellipse(7.5, 6, 6, 2, 'foam'); g.rect(12, 8, 3, 5, 'cup'); g.ellipse(8, 16, 7, 2, 'plate')
    g.put(6, 5, 'art'); g.put(8, 6, 'art'); g.put(9, 5, 'art')
    for y in (0, 2): g.put(5 + y, y, 'steam'); g.put(9 - y // 2, y + 1, 'steam')
    return g, {'cup': WHITE, 'foam': CREAM, 'art': COFFEE, 'plate': WHITE, 'steam': '#d8d0c8'}
def d_croissant():
    g = Grid(20, 12); g.ellipse(10, 7, 8, 4, 'b'); g.ellipse(3, 8, 3, 2, 'b'); g.ellipse(17, 8, 3, 2, 'b')
    for x in (7, 10, 13): g.line(x, 4, x - 1, 10, 'line', 0.3)
    return g, {'b': BREAD, 'line': '#7a4410'}
def d_pie(cream):
    g = Grid(22, 14); g.ellipse(11, 9, 10, 4, 'crust'); g.rect(1, 7, 20, 3, 'crust'); g.ellipse(11, 7, 9, 3, 'fill' if not cream else 'cream')
    if cream:
        for x in (5, 9, 13, 17): g.ellipse(x, 5, 2, 2, 'cream')
        g.ellipse(11, 3, 2, 2, 'cream'); g.put(11, 1, 'cherry'); g.put(12, 2, 'cherry')
    return g, {'crust': BREAD, 'fill': ('#d84a5a', '#a01828', '#5a0810'), 'cream': CREAM, 'cherry': '#c4121c'}
def d_goulash():
    g = Grid(20, 16); g.ellipse(10, 9, 9, 6, 'bowl'); g.rect(1, 6, 18, 4, 'bowl'); g.ellipse(10, 6, 8, 3, 'stew')
    for (x, y) in ((6, 5), (11, 6), (14, 5)): g.put(x, y, 'meat')
    g.put(9, 4, 'cream'); g.put(10, 4, 'cream'); return g, {'bowl': PURP, 'stew': ('#a8643a', '#6e3a1e', '#3a1a0c'), 'meat': '#5a1a10', 'cream': '#fffbe8'}
def d_ale():
    g = Grid(14, 20); g.rect(1, 4, 10, 15, 'glass'); g.rect(2, 6, 8, 12, 'ale'); g.ellipse(6, 4, 6, 2.5, 'foam'); g.rect(10, 8, 4, 2, 'glass'); g.rect(12, 8, 2, 7, 'glass'); g.rect(10, 13, 4, 2, 'glass')
    g.put(4, 9, 'bub'); g.put(7, 12, 'bub'); return g, {'glass': ('#e8e0d8', '#a89a90', '#5a4a44'), 'ale': GOLD, 'foam': CREAM, 'bub': '#ffffff'}
def d_stew():
    g = Grid(20, 16); g.ellipse(10, 9, 9, 6, 'bowl'); g.rect(1, 6, 18, 4, 'bowl'); g.ellipse(10, 6, 8, 3, 'stew')
    for (x, y) in ((6, 5), (12, 6), (15, 5)): g.put(x, y, 'veg')
    g.rect(14, 0, 3, 6, 'bread'); return g, {'bowl': ('#a8643a', '#6e3a1e', '#3a1a0c'), 'stew': ('#c8703a', '#8a4418', '#4a2008'), 'veg': '#f0a030', 'bread': BREAD}
def d_nuggets():
    g = Grid(20, 14); g.poly([(2, 4), (18, 4), (16, 13), (4, 13)], 'box'); g.rect(4, 7, 12, 2, 'stripe')
    for (x, y) in ((5, 2), (9, 1), (13, 2), (7, 4)): g.ellipse(x + 1, y + 1, 2.5, 2, 'nug')
    return g, {'box': ('#ff6a5a', '#c4121c', '#6a0a10'), 'stripe': WHITE, 'nug': BREAD}
def d_bread():
    g = Grid(22, 12); g.ellipse(11, 7, 10, 4, 'b'); g.rect(1, 6, 20, 3, 'b')
    for x in (5, 10, 15): g.line(x, 4, x + 3, 7, 'cut', 0.3)
    g.put(7, 5, 'garlic'); g.put(13, 5, 'garlic'); g.put(16, 6, 'herb'); g.put(9, 6, 'herb'); return g, {'b': BREAD, 'cut': '#7a4410', 'garlic': '#fffbe8', 'herb': '#4aa82a'}
def d_pizza(pine):
    g = Grid(24, 14); g.ellipse(12, 8, 11, 5, 'crust'); g.ellipse(12, 7.5, 9, 4, 'sauce'); g.ellipse(12, 7, 8, 3.5, 'cheese')
    for (x, y) in ((7, 6), (12, 8), (16, 6), (10, 5)): g.put(x, y, 'pep')
    if pine:
        for (x, y) in ((8, 8), (14, 6), (17, 8), (11, 6)): g.rect(x, y, 2, 2, 'pine')
    return g, {'crust': BREAD, 'sauce': '#c4121c', 'cheese': ('#ffe890', '#f0c040', '#a07010'), 'pep': '#8a0a10', 'pine': PINE}
def d_dough(pine):
    g = Grid(24, 12); g.ellipse(12, 7, 11, 4.5, 'd'); g.ellipse(12, 6.5, 9, 3.5, 'sauce')
    if pine:
        for (x, y) in ((8, 6), (14, 5), (16, 7), (11, 7)): g.rect(x, y, 2, 2, 'pine')
    return g, {'d': CREAM, 'sauce': '#c4121c', 'pine': PINE}
def d_treat():
    g = Grid(12, 12); g.ellipse(6, 6, 5, 5, 'w'); g.ellipse(6, 6, 3, 3, 'c'); g.put(5, 4, 'hi'); return g, {'w': ('#ff9adf', '#e040a0', '#8a1060'), 'c': CREAM, 'hi': '#ffffff'}

# ---- stations ----
def st_machine(on):  # the coffee machine
    g = Grid(34, 40); g.rect(2, 4, 30, 30, 'body'); g.rect(4, 6, 26, 8, 'top'); g.rect(10, 16, 14, 4, 'head'); g.rect(15, 20, 4, 4, 'spout')
    g.rect(2, 34, 30, 6, 'base'); g.rect(12, 28, 10, 6, 'cup'); g.ellipse(26, 9, 2, 2, 'lamp')
    if on:
        for y in (24, 26): g.put(17, y, 'drip')
    return g, {'body': IRON, 'top': ('#e8e0e8', '#b8b0b8', '#5a545c'), 'head': BLACK, 'spout': BLACK, 'base': BLACK, 'cup': WHITE, 'lamp': '#ff2630' if on else '#5a0a10', 'drip': COFFEE[1]}
def st_grill(on):
    g = Grid(40, 34); g.rect(2, 12, 36, 22, 'body'); g.rect(4, 8, 32, 6, 'plate')
    for x in range(6, 36, 5): g.rect(x, 9, 2, 4, 'bar')
    if on:
        for x in (10, 20, 30): g.ellipse(x, 30, 3, 2, 'fire')
    return g, {'body': BLACK, 'plate': IRON, 'bar': '#2a262c', 'fire': ('#ffe36a', '#ff9a30', '#c4301a')}
def st_oven(on, tint=None):
    g = Grid(40, 40); g.rect(1, 4, 38, 36, 'brick'); g.ellipse(20, 6, 18, 6, 'brick'); g.ellipse(20, 22, 12, 10, 'mouth'); g.rect(8, 22, 24, 10, 'mouth')
    if on: g.ellipse(20, 28, 9, 4, 'fire'); g.ellipse(20, 30, 6, 2, 'glow')
    for y in range(8, 40, 6):
        for x in range(1 + (y // 6 % 2) * 4, 39, 8): g.put(x, y, 'line')
    return g, {'brick': tint or ('#c8703a', '#8a4418', '#4a2008'), 'mouth': '#12040a', 'fire': ('#ffe36a', '#ff9a30', '#c4301a'), 'glow': '#fff6d8', 'line': '#3a1a08'}
def st_cream(on):
    g = Grid(30, 40); g.rect(4, 26, 22, 14, 'table'); g.poly([(6, 4), (24, 4), (17, 18), (13, 18)], 'bag'); g.rect(14, 18, 2, 5, 'nozzle'); g.ellipse(15, 4, 9, 2, 'top')
    if on: g.ellipse(15, 24, 3, 2, 'cream')
    return g, {'table': WHITE, 'bag': CREAM, 'nozzle': IRON, 'top': ('#e8e0d8', '#c8b8a0', '#8a7a60'), 'cream': CREAM}
def st_tap(on):
    g = Grid(30, 40); g.rect(0, 28, 30, 12, 'bar'); g.rect(4, 4, 22, 6, 'pipe'); g.rect(13, 0, 4, 18, 'tap'); g.rect(11, 0, 8, 4, 'handle'); g.ellipse(15, 26, 6, 2, 'tray')
    if on: g.rect(14, 18, 2, 8, 'ale')
    return g, {'bar': WOOD, 'pipe': GOLD, 'tap': GOLD, 'handle': BLACK, 'tray': IRON, 'ale': GOLD}
def st_kettle(on, col):
    g = Grid(40, 40); g.rect(2, 26, 36, 14, 'stove'); g.ellipse(20, 14, 17, 6, 'rim'); g.rect(3, 14, 34, 12, 'pot'); g.ellipse(20, 25, 17, 4, 'pot'); g.ellipse(20, 14, 14, 4, 'stew')
    if on:
        for x in (8, 18, 28): g.ellipse(x + 2, 36, 3, 2, 'fire')
        g.ellipse(14, 12, 2, 1.5, 'bub'); g.ellipse(25, 12, 2, 1.5, 'bub')
    return g, {'stove': BLACK, 'rim': IRON, 'pot': col, 'stew': ('#c8703a', '#8a4418', '#4a2008'), 'fire': ('#ffe36a', '#ff9a30', '#c4301a'), 'bub': '#f0a030'}
def st_fryer(on):
    g = Grid(40, 36); g.rect(2, 10, 36, 26, 'body'); g.rect(5, 8, 30, 8, 'oil'); g.rect(8, 2, 10, 8, 'basket'); g.rect(22, 2, 10, 8, 'basket')
    for x in range(9, 18, 2): g.put(x, 4, 'wire')
    if on:
        for x in (8, 15, 24, 30): g.put(x, 9, 'bub')
    return g, {'body': IRON, 'oil': GOLD if on else ('#c8a040', '#8a6a20', '#4a3a10'), 'basket': BLACK, 'wire': '#9a929a', 'bub': '#ffffff'}
def st_bench(pine):
    g = Grid(40, 30); g.rect(2, 10, 36, 20, 'table'); g.rect(0, 8, 40, 4, 'top'); g.ellipse(20, 8, 10, 3, 'dough')
    if pine: g.ellipse(32, 4, 5, 4, 'pine'); g.poly([(30, 0), (32, -4), (34, 0)], 'leaf'); g.rect(29, 0, 6, 2, 'leaf')
    else: g.ellipse(32, 5, 4, 3, 'bowl'); g.ellipse(32, 4, 3, 1, 'sauce')
    return g, {'table': WOOD2, 'top': WOOD, 'dough': CREAM, 'pine': PINE, 'leaf': GREEN, 'bowl': WHITE, 'sauce': '#c4121c'}
def st_jar():
    g = Grid(24, 32); g.rect(3, 6, 18, 24, 'glass'); g.rect(5, 2, 14, 5, 'lid')
    for (x, y) in ((6, 22), (11, 24), (15, 21), (8, 16), (13, 18), (7, 11)): g.rect(x, y, 4, 4, 'cr')
    g.rect(5, 12, 14, 5, 'label'); return g, {'glass': ('#d8e8f0', '#9ab0bc', '#4a5a64'), 'lid': RED, 'cr': BREAD, 'label': WHITE}
def st_stall():  # the treat stall: free sweets that cheer people up
    g = Grid(44, 50); g.rect(4, 26, 36, 24, 'box'); g.rect(2, 22, 40, 5, 'top'); g.rect(4, 2, 3, 22, 'pole'); g.rect(37, 2, 3, 22, 'pole')
    for i in range(6): g.rect(2 + i * 7, 0, 7, 8, 'aw' + str(i % 2))
    for (x, y) in ((10, 17), (17, 16), (24, 17), (31, 16)): g.ellipse(x, y, 3, 3, 'sweet' + str(x % 3))
    g.rect(10, 32, 24, 8, 'sign'); return g, {'box': ('#ff9adf', '#e040a0', '#8a1060'), 'top': WHITE, 'pole': WHITE, 'aw0': ('#ff6a74', '#ff2630', '#8a0a14'), 'aw1': WHITE,
                                                'sweet0': ('#ffe36a', '#e0b020', '#8a6008'), 'sweet1': ('#9adfff', '#3a8ac8', '#14406a'), 'sweet2': ('#9aff5a', '#4aa82a', '#1a5a10'), 'sign': CREAM}
def st_phone(ring):
    g = Grid(24, 26); g.rect(2, 16, 20, 10, 'shelf'); g.rect(5, 8, 14, 9, 'phone'); g.rect(3, 4, 18, 5, 'hand'); g.rect(9, 10, 6, 5, 'dial')
    if ring:
        for (x, y) in ((0, 2), (22, 2), (0, 7), (22, 7)): g.put(x, y, 'ring')
    return g, {'shelf': WOOD2, 'phone': RED, 'hand': RED, 'dial': WHITE, 'ring': '#ffe36a'}
def st_shelf():
    g = Grid(40, 30); g.rect(0, 0, 40, 4, 'top'); g.rect(2, 4, 3, 26, 'leg'); g.rect(35, 4, 3, 26, 'leg'); g.rect(0, 16, 40, 3, 'top'); g.rect(10, -2 + 10, 20, 0, 'top')
    return g, {'top': WOOD, 'leg': WOOD2}
def bag():
    g = Grid(16, 18); g.rect(2, 4, 12, 14, 'bag'); g.rect(4, 0, 2, 5, 'h'); g.rect(10, 0, 2, 5, 'h'); g.rect(4, 0, 8, 2, 'h'); g.rect(4, 9, 8, 4, 'logo')
    return g, {'bag': ('#e8d0a0', '#c8a870', '#7a5a30'), 'h': ('#e8d0a0', '#c8a870', '#7a5a30'), 'logo': RED}
def popper():
    g = Grid(14, 16); g.poly([(2, 15), (7, 3), (12, 15)], 'cone'); g.rect(2, 13, 10, 3, 'band')
    for (x, y) in ((4, 1), (8, 0), (11, 2), (6, 2)): g.put(x, y, 'c' + str(x % 3))
    return g, {'cone': GOLD, 'band': RED, 'c0': '#ff2630', 'c1': '#9adfff', 'c2': '#9aff5a'}

ART.update({
  'wn_d_k': d_crackers, 'wn_d_p': d_cumpuccino, 'wn_d_r': d_croissant, 'wn_d_q': lambda: d_pie(True), 'wn_d_qb': lambda: d_pie(False), 'wn_d_g': d_goulash,
  'wn_d_a': d_ale, 'wn_d_s': d_stew, 'wn_d_n': d_nuggets, 'wn_d_b': d_bread, 'wn_d_z': lambda: d_pizza(False), 'wn_d_x': lambda: d_pizza(True),
  'wn_d_zd': lambda: d_dough(False), 'wn_d_xd': lambda: d_dough(True), 'wn_d_t': d_treat, 'wn_bag': bag, 'wn_popper': popper,
  'wn_st_mach0': lambda: st_machine(False), 'wn_st_mach1': lambda: st_machine(True), 'wn_st_grill0': lambda: st_grill(False), 'wn_st_grill1': lambda: st_grill(True),
  'wn_st_oven0': lambda: st_oven(False), 'wn_st_oven1': lambda: st_oven(True), 'wn_st_ovenb0': lambda: st_oven(False, ('#8a8a9a', '#5a5a6a', '#2a2a3a')), 'wn_st_ovenb1': lambda: st_oven(True, ('#8a8a9a', '#5a5a6a', '#2a2a3a')),
  'wn_st_cream0': lambda: st_cream(False), 'wn_st_cream1': lambda: st_cream(True), 'wn_st_tap0': lambda: st_tap(False), 'wn_st_tap1': lambda: st_tap(True),
  'wn_st_stew0': lambda: st_kettle(False, ('#a8643a', '#6e3a1e', '#3a1a0c')), 'wn_st_stew1': lambda: st_kettle(True, ('#a8643a', '#6e3a1e', '#3a1a0c')),
  'wn_st_goul0': lambda: st_kettle(False, PURP), 'wn_st_goul1': lambda: st_kettle(True, PURP),
  'wn_st_fry0': lambda: st_fryer(False), 'wn_st_fry1': lambda: st_fryer(True), 'wn_st_bench0': lambda: st_bench(False), 'wn_st_bench1': lambda: st_bench(False),
  'wn_st_pine0': lambda: st_bench(True), 'wn_st_pine1': lambda: st_bench(True), 'wn_st_jar0': st_jar, 'wn_st_jar1': st_jar, 'wn_st_stall0': st_stall, 'wn_st_stall1': st_stall,
  'wn_st_phone0': lambda: st_phone(False), 'wn_st_phone1': lambda: st_phone(True), 'wn_st_shelf0': st_shelf, 'wn_st_shelf1': st_shelf,
})

# ---- the hosts walk: legs swing, the body bobs (built from their own sprites) ----
from PIL import Image
import art as _A
def walkframe(name, f):
    src = _A.base()[name].convert('RGBA'); W, H = src.size; out = Image.new('RGBA', (W, H + 1), (0, 0, 0, 0)); hip = H - 9
    body = src.crop((0, 0, W, hip)); legs = src.crop((0, hip, W, H)); lw = W // 2
    left, right = legs.crop((0, 0, lw, legs.height)), legs.crop((lw, 0, W, legs.height))
    ly, ry = [0, -1, 0, 0][f], [0, 0, 0, -1][f]; lx, rx = [0, 1, 0, -1][f], [0, -1, 0, 1][f]; bob = [0, 1, 0, 1][f]
    out.alpha_composite(left, (max(0, lx), hip + 1 + ly)); out.alpha_composite(right, (lw + min(0, rx) if rx < 0 else lw + rx, hip + 1 + ry))
    out.alpha_composite(body, (0, bob)); return out
for _h in ('npc_amy', 'npc_kaya', 'npc_greebo', 'npc_beebs', 'npc_ali', 'npc_joff'):
    for _f in range(4): ART[_h + '_w' + str(_f)] = (lambda h=_h, f=_f: walkframe(h, f))
def chilli():
    g = Grid(18, 10); g.ellipse(9, 5, 8, 4, 'c'); g.poly([(14, 2), (18, 5), (14, 8)], 'c'); g.rect(0, 4, 3, 2, 'stem'); g.put(6, 3, 'hi'); g.put(7, 3, 'hi')
    return g, {'c': RED, 'stem': ('#9aff5a', '#4aa82a', '#1a5a10'), 'hi': '#ffd0c0'}
def garlic():
    g = Grid(14, 14); g.ellipse(7, 8, 6, 5, 'g'); g.poly([(5, 4), (7, 0), (9, 4)], 'g'); g.line(7, 4, 7, 12, 'l', 0.3); g.line(4, 6, 4, 11, 'l', 0.3); g.line(10, 6, 10, 11, 'l', 0.3)
    return g, {'g': ('#ffffff', '#ece0d0', '#a89a88'), 'l': '#c8b8a0'}
def pineapple():
    g = Grid(14, 20); g.ellipse(7, 13, 6, 7, 'p'); g.poly([(3, 7), (7, 0), (11, 7)], 'leaf')
    for y in range(9, 19, 3):
        for x in range(3, 12, 3): g.put(x + (y // 3) % 2, y, 'd')
    return g, {'p': PINE, 'leaf': GREEN, 'd': '#8a6008'}
ART.update({'wn_chilli': chilli, 'wn_garlic': garlic, 'wn_pineapple': pineapple})

# ---- decor from the shop: wall lamps and a showpiece for each place ----
BRASS = ('#ffe39a', '#c8962a', '#6a4410')
def sconce(lit):
    g = Grid(14, 18); g.rect(5, 0, 4, 3, 'plate'); g.rect(6, 3, 2, 4, 'arm'); g.poly([(1, 7), (13, 7), (11, 15), (3, 15)], 'shade'); g.rect(3, 15, 8, 2, 'rim')
    if lit: g.ellipse(7, 12, 3, 2, 'glow')
    return g, {'plate': BRASS, 'arm': BRASS, 'shade': ('#ff6a74', '#c4121c', '#5a0810'), 'rim': BRASS, 'glow': '#ffe36a'}
def plinth(g, w=26):
    x = (g.w - w) // 2; g.rect(x, g.h - 8, w, 8, 'plinth'); g.rect(x + 2, g.h - 10, w - 4, 2, 'plinth')
def sp_chilli():
    g = Grid(30, 46); plinth(g)
    g.poly([(10, 6), (20, 6), (24, 16), (22, 30), (15, 37), (8, 30), (6, 16)], 'chilli'); g.rect(13, 1, 4, 6, 'stem'); g.line(9, 12, 10, 26, 'hi', 0.6)
    return g, {'chilli': GOLD, 'stem': ('#9aff5a', '#4aa82a', '#1a5a10'), 'hi': '#fff8d0', 'plinth': BLACK}
def sp_urn():
    g = Grid(32, 46); g.rect(5, 38, 22, 8, 'base'); g.rect(9, 34, 14, 4, 'leg')
    g.ellipse(16, 22, 12, 13, 'urn'); g.rect(13, 3, 6, 6, 'cap'); g.ellipse(16, 3, 4, 2, 'cap'); g.rect(0, 18, 4, 8, 'h'); g.rect(28, 18, 4, 8, 'h')
    g.rect(21, 30, 6, 2, 'tap'); g.rect(25, 30, 2, 4, 'tap'); g.ellipse(16, 20, 5, 4, 'badge'); g.line(10, 14, 11, 26, 'hi', 0.6)
    return g, {'base': BLACK, 'leg': BRASS, 'urn': BRASS, 'cap': BRASS, 'h': BRASS, 'tap': IRON, 'badge': RED, 'hi': '#fff8d0'}
def sp_pies():
    g = Grid(30, 46); g.rect(14, 8, 2, 38, 'pole'); g.rect(6, 44, 18, 2, 'pole')
    for y, w in ((36, 13), (24, 11), (12, 9)):
        g.ellipse(15, y + 3, w + 1, 2, 'plate'); g.rect(15 - w + 2, y - 2, (w - 2) * 2, 4, 'crust'); g.ellipse(15, y - 2, w - 2, 2.5, 'cream')
    g.ellipse(15, 3, 3, 3, 'cherry')
    return g, {'pole': BRASS, 'plate': WHITE, 'crust': BREAD, 'cream': CREAM, 'cherry': RED}
def sp_barrel():
    g = Grid(34, 44); g.rect(2, 38, 30, 6, 'rack'); g.rect(4, 30, 4, 8, 'rack'); g.rect(26, 30, 4, 8, 'rack')
    g.ellipse(17, 20, 15, 15, 'wood'); g.ellipse(17, 20, 11, 11, 'end')
    for r in (14.5, 11.5): 
        for a in range(0, 360, 6): g.put(17 + math.cos(math.radians(a)) * r, 20 + math.sin(math.radians(a)) * r, 'hoop')
    g.rect(15, 30, 4, 4, 'tap'); g.put(16, 35, 'drip')
    return g, {'rack': WOOD2, 'wood': WOOD, 'end': WOOD2, 'hoop': IRON, 'tap': BRASS, 'drip': '#ffc840'}
def sp_garlic():
    g = Grid(32, 46); plinth(g, 28)
    g.ellipse(16, 25, 13, 12, 'g'); g.poly([(12, 14), (16, 2), (20, 14)], 'g')
    for x in (9, 16, 23): g.line(x, 16, x + (x - 16) * 0.2, 34, 'l', 0.4)
    g.rect(13, 0, 6, 2, 'root')
    return g, {'g': ('#ffffff', '#ece0d0', '#a89a88'), 'l': '#c8b8a0', 'root': '#a89a88', 'plinth': ('#5aaa3a', '#2a6a1a', '#103a08')}
def sp_pineapple():
    g = Grid(30, 46); plinth(g)
    g.ellipse(15, 26, 10, 12, 'p'); g.poly([(9, 15), (15, 0), (21, 15)], 'leaf'); g.poly([(5, 12), (11, 4), (13, 15)], 'leaf'); g.poly([(17, 15), (19, 4), (25, 12)], 'leaf')
    for y in range(17, 37, 4):
        for x in range(8, 23, 4): g.put(x + (y // 4) % 2 * 2, y, 'd')
    return g, {'p': PINE, 'leaf': GREEN, 'd': '#8a6008', 'plinth': RED}
ART.update({'wn_sconce0': lambda: sconce(False), 'wn_sconce1': lambda: sconce(True), 'wn_sp_amy': sp_chilli, 'wn_sp_cafe': sp_urn, 'wn_sp_greebo': sp_pies,
            'wn_sp_beebs': sp_barrel, 'wn_sp_ali': sp_garlic, 'wn_sp_joff': sp_pineapple})
