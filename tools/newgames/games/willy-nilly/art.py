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
