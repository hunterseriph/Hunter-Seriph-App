"""Skeet Fighter's own art.

The four fighters, the foes and the bosses are the sprites we already have (Cumhead's atlas, Load Legacy's Spermaid and
Greebo, the homunculus breeds, tools/foes). Here they are re-cut for a fighting game:
  * every fighter frame is re-centred on the feet (so a punch frame with an arm out does not slide the body sideways)
  * fighting poses are made from their own pixels: leaning into a punch, rearing back, crouching, all by shifting whole
    rows a pixel at a time, so nothing gets blurred or redrawn in another style
  * the brainwashed homunculi are the real breeds dyed Blumhead purple (dark outline kept)
Plus new pixel art in the same outline and bevel style: weapons, food, breakables, shots, hit sparks, HUD faces.
"""
import colorsys, math
from PIL import Image
from pixelkit import Grid
import art as A

USE = ['ch_idle*', 'ch_walk*', 'ch_rn*', 'ch_attack', 'ch_jump*', 'ch_hurt0', 'ch_death*',
       'spermaid_*', 'greebo_*', 'h_gloop_adult_*', 'h_gloop_baby_idle0',
       'f_cultist_*', 'f_cultrat_*', 'f_ghoul_*', 'f_knight_*', 'f_jailer_*', 'f_mummy_*', 'f_skeleton_*', 'f_vampire_*',
       'f_clown_*', 'f_blumguard_*', 'f_wraith_*', 'f_corkbot_*', 'f_rat_*',
       'f_execu_*', 'f_ratking_*', 'f_pig_*', 'f_cowpig_*', 'f_boner_*', 'f_blum_*', 'f_blum2_*',
       'fac_*', 'steve0', 'steve1', 'p_skulls', 'p_ribs', 'p_creampool', 'p_crucible', 'p_slot', 'p_chest', 'p_walleyeshut', 'throne',
       'npc_tb', 'npc_amy', 'npc_potbelly', 'npc_saba', 'npc_kaya', 'cat']

RED = ('#ff3a44', '#c4121c', '#6a0a10'); DRED = ('#8a1a20', '#5a0a10', '#2a0408'); GOLD = ('#fff09a', '#ffc840', '#a8741a')
CREAM = ('#fffbe8', '#f1e0b0', '#b8a070'); WHITE = ('#ffffff', '#e8dcc8', '#a8987a'); IRON = ('#b0a8b0', '#6a646c', '#2a262c')
BLACK = ('#4a3a40', '#221a1e', '#0c0608'); WOOD = ('#b8743a', '#7e4a24', '#3a1a0c'); STONE = ('#8a6a6e', '#5a4044', '#2e1c20')
SEA = ('#7ae0e0', '#2aa0a8', '#0e4a52'); PINK = ('#ff9ad0', '#e0408a', '#7a1a48'); PURP = ('#d08aff', '#8a2ad8', '#34106a')
GREEN = ('#9aff5a', '#4aa82a', '#1a5a10'); BONE = ('#f8f0dc', '#d8c8a8', '#8a7a5a'); FIRE = ('#ffe36a', '#ff9a30', '#c4301a')
MEAT = ('#f08a6a', '#b04a30', '#5a2010'); GARLIC = ('#fff6d8', '#e8d0a0', '#a08a5a'); PINE = ('#ffe36a', '#d8a020', '#7a5010')

OUT = (18, 4, 10, 255)

def G(w, h): return Grid(w, h)
def hole(g, cx, cy, rx, ry):
    for y in range(g.h):
        for x in range(g.w):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            if dx * dx + dy * dy <= 1.0: g.m[y][x] = None

# ------------------------------------------------------------------ re-cutting our sprites
def B(n): return A.base()[n]

def feet_x(im):
    """the middle of what stands on the ground: the opaque pixels in the lowest fifth of the frame"""
    w, h = im.size; px = im.load(); xs = []
    for y in range(int(h * 0.8), h):
        for x in range(w):
            if px[x, y][3] > 40: xs.append(x)
    if not xs:
        bb = im.getbbox(); return (bb[0] + bb[2]) / 2 if bb else w / 2
    return (min(xs) + max(xs)) / 2

def centred(im, fx=None, W=None):
    """pad the frame so the feet sit in the middle (the game draws every frame from its bottom centre)"""
    if fx is None: fx = feet_x(im)
    w, h = im.size; half = int(math.ceil(max(fx, w - fx))) + 1
    if W: half = max(half, W // 2)
    out = Image.new('RGBA', (half * 2, h), (0, 0, 0, 0)); out.paste(im, (int(round(half - fx)), 0), im); return out

def lean(im, k):
    """lean the whole body by k pixels at the top (positive = forwards / to the right), row by row, feet fixed"""
    w, h = im.size; pad = abs(k) + 1
    out = Image.new('RGBA', (w + pad * 2, h), (0, 0, 0, 0))
    for y in range(h):
        s = int(round(k * (1 - y / max(1, h - 1))))
        out.paste(im.crop((0, y, w, y + 1)), (pad + s, y))
    return out

def squash(im, rows):
    """crouch: drop `rows` rows from the middle of the body (a pixel-art squash, no smoothing)"""
    w, h = im.size; keep = [y for y in range(h) if not (h * 0.45 <= y < h * 0.45 + rows)]
    out = Image.new('RGBA', (w, len(keep)), (0, 0, 0, 0))
    for i, y in enumerate(keep): out.paste(im.crop((0, y, w, y + 1)), (0, i))
    return out

def stretch(im, rows):
    """reach up: repeat `rows` rows of the middle of the body"""
    w, h = im.size; mid = int(h * 0.5); ys = list(range(0, mid)) + [mid] * rows + list(range(mid, h))
    out = Image.new('RGBA', (w, len(ys)), (0, 0, 0, 0))
    for i, y in enumerate(ys): out.paste(im.crop((0, y, w, y + 1)), (0, i))
    return out

def flipx(im): return im.transpose(Image.FLIP_LEFT_RIGHT)

def dye(im, hue=0.79, sat=0.75, dark=0.9):
    """Blumhead's goo: every colour turned purple, light and dark kept, the outline left alone"""
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 10: continue
            hh, ll, ss = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if ll < 0.12: continue # the outline stays
            if ll > 0.85 and ss < 0.25: # eyes and teeth: glowing goo pink
                r2, g2, b2 = colorsys.hls_to_rgb(0.86, 0.75, 1.0)
            else:
                r2, g2, b2 = colorsys.hls_to_rgb(hue + (hh - 0.5) * 0.06, min(0.8, ll * dark), max(sat, ss * 0.9))
            px[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255), a)
    return im

def outline(im):
    """a 1px dark outline round anything we built (shots, sparks)"""
    w, h = im.size; src = im.load(); out = Image.new('RGBA', (w + 2, h + 2), (0, 0, 0, 0)); o = out.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3] > 40:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)): o[x + 1 + dx, y + 1 + dy] = OUT
    out.paste(im, (1, 1), im); return out

ART = {}
def add(name):
    def deco(fn): ART[name] = fn; return fn
    return deco

# ---- CUMHEAD: his own atlas has idle, walk, run, a punch, jumps, hurt and a fall
def _cum(n, f=None, w=None): return lambda: f(centred(B(n), W=w)) if f else centred(B(n), W=w)
for i in range(7): ART['sk_cu_idle%d' % i] = _cum('ch_idle%d' % i)
for i in range(9): ART['sk_cu_walk%d' % i] = _cum('ch_walk%d' % i)
for i in range(8): ART['sk_cu_run%d' % i] = _cum('ch_rn%d' % i)
ART['sk_cu_jab'] = lambda: centred(B('ch_attack'), fx=feet_x(B('ch_attack')) - 4)
ART['sk_cu_jab2'] = lambda: centred(lean(B('ch_attack'), 3), fx=feet_x(B('ch_attack')) - 2)
ART['sk_cu_upper'] = lambda: centred(stretch(lean(B('ch_jump1'), -2), 4))
ART['sk_cu_wind'] = lambda: centred(lean(B('ch_idle0'), -4))
ART['sk_cu_crouch'] = lambda: centred(squash(B('ch_idle0'), 8))
ART['sk_cu_kick'] = lambda: centred(lean(B('ch_rn3'), 4))
for i in range(4): ART['sk_cu_jump%d' % i] = _cum('ch_jump%d' % i)
ART['sk_cu_hurt'] = lambda: centred(lean(B('ch_hurt0'), -3))
ART['sk_cu_down'] = lambda: centred(B('ch_death1'))
ART['sk_cu_fall'] = lambda: centred(B('ch_death0'))

# ---- SPERMAID: his drawing (slim droplet, curled tip, tail). She floats; her tail does the hitting
for i in range(3): ART['sk_sp_idle%d' % i] = (lambda i: lambda: centred(B('spermaid_s%d' % i)))(i)
ART['sk_sp_front'] = lambda: centred(B('spermaid_d'))
ART['sk_sp_jab'] = lambda: centred(lean(B('spermaid_s1'), 4))
ART['sk_sp_jab2'] = lambda: centred(lean(B('spermaid_s2'), 6))
ART['sk_sp_spin'] = lambda: centred(flipx(lean(B('spermaid_s0'), 3)))
ART['sk_sp_wind'] = lambda: centred(lean(B('spermaid_s0'), -5))
ART['sk_sp_upper'] = lambda: centred(stretch(lean(B('spermaid_s2'), -2), 5))
ART['sk_sp_crouch'] = lambda: centred(squash(B('spermaid_s0'), 7))
ART['sk_sp_hurt'] = lambda: centred(lean(B('spermaid_s0'), -4))
ART['sk_sp_down'] = lambda: centred(B('spermaid_dead'))

# ---- GREEBO: a cream pie in a chef's hat; strong and slow
for i in range(3): ART['sk_gr_walk%d' % i] = (lambda i: lambda: centred(B('greebo_s%d' % i)))(i)
ART['sk_gr_idle0'] = lambda: centred(B('greebo_s0'))
ART['sk_gr_idle1'] = lambda: centred(squash(B('greebo_s0'), 1))
ART['sk_gr_front'] = lambda: centred(B('greebo_d'))
ART['sk_gr_jab'] = lambda: centred(lean(B('greebo_s1'), 5))
ART['sk_gr_jab2'] = lambda: centred(lean(B('greebo_s2'), 7))
ART['sk_gr_wind'] = lambda: centred(lean(B('greebo_s0'), -5))
ART['sk_gr_upper'] = lambda: centred(stretch(lean(B('greebo_s1'), -3), 4))
ART['sk_gr_crouch'] = lambda: centred(squash(B('greebo_s0'), 8))
ART['sk_gr_hurt'] = lambda: centred(lean(B('greebo_s0'), -4))
ART['sk_gr_down'] = lambda: centred(B('greebo_dead'))

# ---- THE HOMUNCULUS: the standard Gloop breed, full grown
ART['sk_ho_idle0'] = lambda: centred(B('h_gloop_adult_idle0')); ART['sk_ho_idle1'] = lambda: centred(B('h_gloop_adult_idle1'))
for i in range(4): ART['sk_ho_walk%d' % i] = (lambda i: lambda: centred(B('h_gloop_adult_run%d' % i)))(i)
ART['sk_ho_jab'] = lambda: centred(B('h_gloop_adult_atk'))
ART['sk_ho_jab2'] = lambda: centred(lean(B('h_gloop_adult_atk'), 4))
ART['sk_ho_wind'] = lambda: centred(lean(B('h_gloop_adult_idle0'), -4))
ART['sk_ho_upper'] = lambda: centred(stretch(B('h_gloop_adult_jump'), 4))
ART['sk_ho_jump'] = lambda: centred(B('h_gloop_adult_jump'))
ART['sk_ho_crouch'] = lambda: centred(squash(B('h_gloop_adult_idle0'), 8))
ART['sk_ho_hurt'] = lambda: centred(B('h_gloop_adult_hurt'))
ART['sk_ho_down'] = lambda: centred(lean(B('h_gloop_adult_hurt'), -6))

# ---- BLUMWASHED HOMUNCULI: Blumhead's goo got into them. Real breed art, dyed his purple
WASHED = ['gloop', 'frost', 'volt', 'ember', 'titan', 'leech', 'goldie', 'blood', 'scout', 'guard', 'medic']
for br in WASHED:
    for st in ('teen', 'adult'):
        for fr in ('idle0', 'run0', 'run1', 'run2', 'run3', 'atk', 'hurt', 'jump'):
            n = 'h_%s_%s_%s' % (br, st, fr)
            if n in A.base(): ART['wb_%s_%s_%s' % (br, st, fr)] = (lambda n: lambda: centred(dye(B(n))))(n)
# the boss: a whole Titan full of goo, twice the size, made in the game by drawing at sc 2

# ---- foes re-centred so a lunge frame does not slide
FOEPICK = ['cultist', 'cultrat', 'ghoul', 'knight', 'jailer', 'mummy', 'skeleton', 'vampire', 'clown', 'blumguard', 'wraith', 'corkbot']
for f in FOEPICK:
    for i in range(4): ART['sf_%s_%d' % (f, i)] = (lambda n: lambda: centred(B(n)))('f_%s_%d' % (f, i))
    ART['sf_%s_lean' % f] = (lambda n: lambda: centred(lean(B(n), 4)))('f_%s_1' % f)
    ART['sf_%s_wind' % f] = (lambda n: lambda: centred(lean(B(n), -4)))('f_%s_0' % f)

# ------------------------------------------------------------------ new pixel art
def icon(fn, w=16, h=16):
    def go():
        g = G(w, h); pal = fn(g); return g, pal
    return go

# weapons (drawn held out to the right, the grip at the left end)
def w_sausage(g): g.line(2, 8, 18, 3, 's', 2.4); g.put(1, 9, 'e'); g.put(19, 2, 'e'); g.line(5, 6, 15, 3, 'sh', 0.3); return {'s': MEAT, 'e': '#5a2010', 'sh': '#ffb090'}
def w_pin(g): g.rect(4, 4, 14, 5, 'w'); g.line(0, 6, 4, 6, 'h', 0.9); g.line(18, 6, 22, 6, 'h', 0.9); g.line(5, 5, 16, 5, 'sh', 0.3); return {'w': ('#f0c890', '#c08a50', '#6a4020'), 'h': WOOD, 'sh': '#ffe8c0'}
def w_bone(g): g.line(3, 7, 17, 4, 'b', 1.6); g.ellipse(2, 6, 2, 2, 'b'); g.ellipse(3, 9, 2, 2, 'b'); g.ellipse(18, 3, 2, 2, 'b'); g.ellipse(19, 6, 2, 2, 'b'); return {'b': BONE}
def w_chain(g):
    for i in range(5): g.ellipse(2 + i * 3, 9, 1.4, 1.1, 'c')
    g.ellipse(19, 8, 4.5, 4.5, 'ball'); g.put(17, 6, 'sh'); g.put(15, 4, 'sp'); g.put(22, 4, 'sp'); g.put(19, 13, 'sp'); return {'c': IRON, 'ball': BLACK, 'sh': '#a0969a', 'sp': IRON}
def w_sword(g): g.rect(0, 7, 4, 3, 'grip'); g.rect(4, 4, 2, 9, 'guard'); g.poly([(6, 6), (21, 7), (23, 8), (21, 9), (6, 10)], 'bl'); g.line(7, 7, 20, 7, 'sh', 0.3); return {'grip': ('#8a1a20', '#5a0a10', '#2a0408'), 'guard': GOLD, 'bl': ('#ffffff', '#b8b0c0', '#5a5468'), 'sh': '#ffffff'}
def w_guitar(g): g.rect(0, 6, 12, 2, 'neck'); g.ellipse(16, 7, 5, 4.5, 'body'); g.ellipse(16, 7, 1.5, 1.5, 'hole'); g.rect(0, 5, 2, 4, 'head'); return {'neck': BLACK, 'body': RED, 'hole': '#12040a', 'head': GOLD}
for n, fn, w, h in (('w_sausage', w_sausage, 22, 12), ('w_pin', w_pin, 24, 12), ('w_bone', w_bone, 22, 12), ('w_chain', w_chain, 25, 16), ('w_sword', w_sword, 24, 16), ('w_guitar', w_guitar, 22, 14)):
    ART[n] = icon(fn, w, h)
# throwables / guns
def t_pie(g): g.ellipse(8, 8, 7.5, 3.5, 'tin'); g.ellipse(8, 6, 6.5, 3, 'cr'); g.ellipse(8, 4, 3, 1.5, 'cr'); g.put(8, 2, 'ch'); return {'tin': IRON, 'cr': CREAM, 'ch': '#ff2630'}
def t_pills(g): g.rect(4, 4, 8, 11, 'b'); g.rect(4, 1, 8, 3, 'cap'); g.rect(5, 7, 6, 4, 'lab'); g.put(7, 9, 'x'); g.put(8, 9, 'x'); return {'b': ('#ffd0e0', '#e08aa8', '#7a3a50'), 'cap': WHITE, 'lab': WHITE, 'x': '#c4121c'}
def t_bread(g): g.ellipse(8, 8, 7.5, 4, 'br'); g.line(4, 6, 6, 9, 'cut', 0.3); g.line(8, 5, 10, 9, 'cut', 0.3); g.line(12, 6, 13, 8, 'cut', 0.3); g.put(6, 6, 'g'); g.put(11, 7, 'g'); return {'br': ('#ffd890', '#d89a40', '#7a4a10'), 'cut': '#7a4a10', 'g': GREEN}
def t_pine(g): g.ellipse(8, 10, 5, 6, 'p'); [g.put(x, y, 'x') for y in range(6, 16, 3) for x in range(5, 12, 3)]; g.poly([(8, 0), (5, 5), (11, 5)], 'l'); g.poly([(4, 1), (7, 5), (6, 5)], 'l'); g.poly([(12, 1), (9, 5), (10, 5)], 'l'); return {'p': PINE, 'x': '#7a5010', 'l': GREEN}
def t_pistol(g): g.rect(2, 3, 14, 5, 'body'); g.rect(4, 7, 4, 7, 'grip'); g.rect(15, 4, 3, 3, 'tip'); g.ellipse(9, 3, 3, 2, 'tank'); return {'body': RED, 'grip': BLACK, 'tip': CREAM, 'tank': CREAM}
for n, fn, w, h in (('t_pie', t_pie, 16, 12), ('t_pills', t_pills, 16, 16), ('t_bread', t_bread, 16, 13), ('t_pine', t_pine, 16, 17), ('t_pistol', t_pistol, 19, 15)):
    ART[n] = icon(fn, w, h)

# food
def f_cracker(g): g.rect(1, 1, 12, 10, 'c'); [g.put(x, y, 'h') for x in (4, 7, 10) for y in (4, 8)]; return {'c': ('#ffe0a0', '#e0b060', '#8a6020'), 'h': '#8a6020'}
def f_cuppa(g): g.rect(2, 5, 9, 9, 'cup'); g.ellipse(12, 9, 2.5, 2.5, 'cup'); hole(g, 12, 9, 1, 1); g.ellipse(6.5, 5, 4.5, 1.8, 'cof'); g.line(5, 3, 6, 0, 'st', 0.3); g.line(8, 3, 7, 0, 'st', 0.3); return {'cup': RED, 'cof': ('#8a5a3a', '#5a3a1e', '#2a1a0c'), 'st': '#a6968f'}
def f_pie(g): g.ellipse(9, 9, 8.5, 4, 'tin'); g.ellipse(9, 7, 7.5, 3.5, 'crust'); g.ellipse(9, 6, 6, 2.5, 'cr'); g.ellipse(7, 4, 2.5, 1.4, 'cr'); g.put(9, 3, 'ch'); return {'tin': IRON, 'crust': ('#ffd890', '#d89a40', '#7a4a10'), 'cr': CREAM, 'ch': '#ff2630'}
def f_chilli(g): g.ellipse(9, 10, 8, 4, 'bowl'); g.ellipse(9, 7, 7, 2.5, 'ch'); g.put(6, 6, 'b'); g.put(11, 7, 'b'); g.poly([(14, 2), (16, 1), (13, 7)], 'pep'); return {'bowl': BLACK, 'ch': RED, 'b': '#5a1a0a', 'pep': GREEN}
def f_nuggets(g): g.rect(2, 5, 12, 9, 'box'); g.rect(2, 5, 12, 2, 'rim'); [g.ellipse(x, 4, 2, 1.8, 'n') for x in (5, 8, 11)]; g.text(4, 8, 'AL', 'lab'); return {'box': RED, 'rim': WHITE, 'n': ('#ffd890', '#d89a40', '#7a4a10'), 'lab': '#ffffff'}
def f_drop(g): g.poly([(4.5, 0), (8, 6.5), (4.5, 11.5), (1, 6.5)], 'g'); g.ellipse(4.5, 7.5, 3.5, 3.5, 'g'); g.put(3, 6, 'sh'); return {'g': GOLD, 'sh': '#ffffff'}
def f_life(g): g.ellipse(8, 9, 6.5, 6.5, 'c'); g.poly([(8, 0), (12, 6), (4, 6)], 'c'); g.ellipse(6, 9, 1, 1.5, 'e'); g.ellipse(10, 9, 1, 1.5, 'e'); g.line(5, 12, 11, 12, 'e', 0.3); return {'c': CREAM, 'e': '#12040a'}
for n, fn, w, h in (('f_cracker', f_cracker, 14, 12), ('f_cuppa', f_cuppa, 15, 14), ('f_pie', f_pie, 18, 13), ('f_chilli', f_chilli, 18, 14), ('f_nuggets', f_nuggets, 16, 14), ('f_drop', f_drop, 9, 12), ('f_life', f_life, 16, 16)):
    ART[n] = icon(fn, w, h)

# breakables: a crate, a bin, a barrel, a coffin, a crate of cream, and their bits
def b_crate(g): g.rect(0, 0, 22, 20, 'w'); g.rect(0, 0, 22, 2, 'edge'); g.rect(0, 18, 22, 2, 'edge'); g.rect(0, 0, 2, 20, 'edge'); g.rect(20, 0, 2, 20, 'edge'); g.line(2, 2, 19, 17, 'edge', 0.9); return {'w': WOOD, 'edge': ('#8a5a30', '#5a3418', '#2a140a')}
def b_bin(g): g.rect(2, 4, 16, 18, 'b'); g.rect(1, 2, 18, 3, 'lid'); g.rect(8, 0, 4, 2, 'lid'); [g.rect(x, 7, 1, 13, 'ln') for x in (6, 10, 14)]; return {'b': IRON, 'lid': ('#8a828a', '#4a444c', '#1a161c'), 'ln': '#2a262c'}
def b_barrel(g): g.ellipse(9, 12, 8, 10, 'w'); g.rect(1, 5, 16, 14, 'w'); g.rect(1, 7, 16, 2, 'hoop'); g.rect(1, 16, 16, 2, 'hoop'); g.ellipse(9, 3, 7, 2.5, 'top'); return {'w': ('#b84a3a', '#7a2a1e', '#3a0c08'), 'hoop': IRON, 'top': ('#9a3a2a', '#6a1a10', '#3a0a08')}
def b_coffin(g): g.poly([(5, 0), (15, 0), (19, 7), (15, 30), (5, 30), (1, 7)], 'w'); g.rect(9, 6, 2, 12, 'x'); g.rect(6, 9, 8, 2, 'x'); return {'w': ('#5a3a40', '#3a2228', '#1a0c10'), 'x': GOLD}
def b_cream(g): g.rect(0, 6, 22, 14, 'w'); g.ellipse(11, 6, 11, 4, 'cr'); g.ellipse(6, 4, 4, 3, 'cr'); g.ellipse(15, 3, 5, 3.5, 'cr'); g.rect(0, 10, 22, 2, 'edge'); return {'w': WOOD, 'cr': CREAM, 'edge': ('#8a5a30', '#5a3418', '#2a140a')}
def bits(g): g.rect(0, 1, 6, 3, 'w'); g.rect(8, 0, 3, 6, 'w'); g.rect(4, 6, 5, 2, 'w'); return {'w': WOOD}
for n, fn, w, h in (('b_crate', b_crate, 22, 20), ('b_bin', b_bin, 20, 22), ('b_barrel', b_barrel, 18, 22), ('b_coffin', b_coffin, 20, 31), ('b_cream', b_cream, 22, 20), ('b_bits', bits, 12, 8)):
    ART[n] = icon(fn, w, h)

# shots
def s_cream(g): g.ellipse(9, 6, 8, 5, 'c'); g.ellipse(4, 6, 4, 3, 'c'); g.poly([(0, 6), (6, 2), (6, 10)], 'c'); g.ellipse(11, 4, 3, 1.5, 'sh'); return {'c': CREAM, 'sh': '#ffffff'}
def s_creambig(g): g.ellipse(16, 11, 15, 10, 'c'); g.poly([(0, 11), (12, 2), (12, 20)], 'c'); g.ellipse(20, 7, 6, 3, 'sh'); g.ellipse(16, 11, 9, 6, 'in'); return {'c': CREAM, 'sh': '#ffffff', 'in': ('#ffffff', '#fffbe8', '#f1e0b0')}
def s_wave(g): g.ellipse(6, 13, 7, 12, 'w'); hole(g, 2, 13, 6, 10); return {'w': SEA}
def s_orb(g): g.ellipse(6, 6, 5.5, 5.5, 'o'); g.ellipse(4, 4, 1.6, 1.6, 'sh'); return {'o': PURP, 'sh': '#ffd0ff'}
def s_goo(g): g.ellipse(7, 7, 6.5, 6, 'o'); g.ellipse(4, 9, 3, 3, 'o'); g.ellipse(5, 5, 1.5, 1.5, 'sh'); return {'o': ('#d88aff', '#9a3ad8', '#4a1070'), 'sh': '#ffffff'}
def s_dagger(g): g.rect(0, 2, 4, 2, 'h'); g.poly([(4, 1), (13, 3), (4, 5)], 'b'); return {'h': WOOD, 'b': ('#ffffff', '#b8b0c0', '#5a5468')}
def s_bone(g): g.line(2, 4, 12, 4, 'b', 1.2); g.ellipse(2, 3, 1.6, 1.6, 'b'); g.ellipse(2, 6, 1.6, 1.6, 'b'); g.ellipse(13, 3, 1.6, 1.6, 'b'); g.ellipse(13, 6, 1.6, 1.6, 'b'); return {'b': BONE}
def s_mug(g): g.rect(1, 2, 9, 10, 'g'); g.ellipse(11, 7, 2.5, 3, 'g'); hole(g, 11, 7, 1, 1.4); g.ellipse(5.5, 2, 5, 2, 'foam'); g.rect(2, 5, 7, 6, 'beer'); return {'g': ('#e8f0f0', '#a8b8b8', '#4a5a5a'), 'foam': WHITE, 'beer': GOLD}
def s_rock(g): g.poly([(3, 0), (10, 1), (13, 6), (10, 11), (3, 11), (0, 5)], 'r'); g.put(4, 3, 'sh'); return {'r': STONE, 'sh': '#b89aa0'}
def s_spear(g): g.poly([(0, 30), (4, 0), (8, 30)], 'b'); g.line(4, 4, 4, 28, 'sh', 0.3); return {'b': BONE, 'sh': '#ffffff'}
def s_fire(g): g.ellipse(7, 9, 6, 5, 'f'); g.poly([(2, 8), (7, 0), (12, 8)], 'f'); g.ellipse(7, 9, 3, 2.5, 'in'); return {'f': FIRE, 'in': ('#ffffff', '#fff6b0', '#ffe36a')}
def s_beam(g): g.rect(0, 0, 32, 14, 'b'); g.rect(0, 4, 32, 6, 'in'); return {'b': PURP, 'in': ('#ffffff', '#ffd0ff', '#d08aff')}
for n, fn, w, h in (('s_cream', s_cream, 18, 12), ('s_creambig', s_creambig, 32, 22), ('s_wave', s_wave, 14, 26), ('s_orb', s_orb, 12, 12), ('s_goo', s_goo, 14, 14), ('s_dagger', s_dagger, 14, 7),
                    ('s_bone', s_bone, 15, 8), ('s_mug', s_mug, 14, 13), ('s_rock', s_rock, 14, 12), ('s_spear', s_spear, 9, 31), ('s_fire', s_fire, 14, 14), ('s_beam', s_beam, 32, 14)):
    ART[n] = icon(fn, w, h)

# hit sparks: a white and gold star in four sizes, a cream splash, goo splash
def spark(k):
    def fn(g):
        r = [3, 6, 9, 7][k]; c = 10
        for a in range(8):
            ang = a * math.pi / 4 + (0.4 if k % 2 else 0); L = r * (1.0 if a % 2 == 0 else 0.55)
            g.line(c, c, c + math.cos(ang) * L, c + math.sin(ang) * L, 's', 0.9 if a % 2 == 0 else 0.5)
        g.ellipse(c, c, max(1.5, r * 0.35), max(1.5, r * 0.35), 'in')
        if k == 3: hole(g, c, c, 3, 3)
        return {'s': GOLD, 'in': '#ffffff'}
    return fn
for k in range(4): ART['fx_spark%d' % k] = icon(spark(k), 21, 21)
def splash(col):
    def fn(g):
        for (x, y, r) in ((10, 8, 5), (4, 9, 3), (16, 7, 3.5), (3, 4, 1.5), (18, 12, 1.5), (8, 3, 2), (13, 2, 1.4)): g.ellipse(x, y, r * 1.2, r, 'c')
        return {'c': col}
    return fn
ART['fx_cream'] = icon(splash(CREAM), 22, 15); ART['fx_goo'] = icon(splash(('#d88aff', '#9a3ad8', '#4a1070')), 22, 15); ART['fx_blood'] = icon(splash(RED), 22, 15)
def dust(g): g.ellipse(6, 6, 5, 4, 'd'); g.ellipse(11, 7, 4, 3, 'd'); g.ellipse(3, 8, 3, 2, 'd'); return {'d': ('#a6968f', '#6a5a58', '#3a2c2c')}
ART['fx_dust'] = icon(dust, 16, 11)
def heart(g): g.ellipse(3.5, 3.5, 3.5, 3.5, 'h'); g.ellipse(8.5, 3.5, 3.5, 3.5, 'h'); g.poly([(0, 4), (12, 4), (6, 11)], 'h'); g.ellipse(3, 3, 1.2, 1, 'sh'); return {'h': RED, 'sh': '#ffd0d4'}
ART['fx_heart'] = icon(heart, 12, 11)
def koStar(g): g.poly([(6, 0), (7.5, 4.5), (12, 4.5), (8.5, 7.5), (10, 12), (6, 9), (2, 12), (3.5, 7.5), (0, 4.5), (4.5, 4.5)], 's'); return {'s': GOLD}
ART['fx_star'] = icon(koStar, 12, 12)

# HUD faces: the head out of each fighter's own sprite
def face(n, box, size=26):
    def go():
        im = B(n).crop(box); w, h = im.size; s = size / max(w, h)
        im = im.resize((max(1, int(round(w * s))), max(1, int(round(h * s)))), Image.NEAREST)
        out = Image.new('RGBA', (size, size), (0, 0, 0, 0)); out.paste(im, ((size - im.width) // 2, size - im.height), im); return out
    return go
ART['hud_cu'] = face('ch_idle0', (0, 0, 30, 30)); ART['hud_sp'] = face('spermaid_d', (4, 0, 30, 26)); ART['hud_gr'] = face('greebo_d', (2, 0, 34, 30)); ART['hud_ho'] = face('h_gloop_adult_idle0', (4, 0, 30, 22))
