#!/usr/bin/env python3
"""Dark Loads (update 149): the whole world as one map, laid out like Dark Souls - a safe chapel to wake in, a hub
(the Candlelit Square) everything loops back to, big areas that climb and drop, shortcut doors back to the hub,
vistas over the places you have been and will go. Writes ../newgames/games/souls/1c-realmmap.js and a picture
of the map (realm.png) to check it by eye.

Tiles are 2 m. Kinds: '#' wall, ' ' chasm, '.' floor, '^' 'v' '<' '>' stairs climbing north / south / west / east
(their heights come from the floors at both ends), '=' low wall you can see over, 'O' low solid block (fountain,
altar), 'R' pillar, 'D' a shortcut door (opens from the side given in DOORS), 'G' the Keep's sealed gate,
'F' fog gate. Heights are metres. Regions: one letter per tile."""
import json, os, sys
W, H = 128, 128
K = [['#'] * W for _ in range(H)]
HT = [[0.0] * W for _ in range(H)]
RG = [['C'] * W for _ in range(H)]
THINGS = []
REG = 'C'


def reg(r):
    global REG
    REG = r


def fl(i0, j0, i1, j1, h, ch='.'):
    for j in range(j0, j1 + 1):
        for i in range(i0, i1 + 1):
            K[j][i] = ch; HT[j][i] = h; RG[j][i] = REG


def wall(i0, j0, i1, j1):
    for j in range(j0, j1 + 1):
        for i in range(i0, i1 + 1):
            K[j][i] = '#'; RG[j][i] = REG


def chasm(i0, j0, i1, j1):
    fl(i0, j0, i1, j1, 0, ' ')


def st(i0, j0, i1, j1, d):
    fl(i0, j0, i1, j1, 0, d)


def low(i0, j0, i1, j1):
    for j in range(j0, j1 + 1):
        for i in range(i0, i1 + 1):
            K[j][i] = '='; RG[j][i] = REG


def blk(i0, j0, i1, j1, ch='O'):
    for j in range(j0, j1 + 1):
        for i in range(i0, i1 + 1):
            h = HT[j][i]; K[j][i] = ch; HT[j][i] = h; RG[j][i] = REG


def th(k, i, j, **o):
    d = {'k': k, 'i': i, 'j': j}; d.update(o); THINGS.append(d)


def foe(f, i, j, **o):
    th('foe', i, j, f=f, **o)


# ---------------------------------------------------------------- the chapel (you wake here) and the graveyard
reg('A')
fl(58, 115, 66, 121, 0)            # the crypt
fl(61, 110, 63, 114, 0)            # the corridor up
fl(55, 94, 69, 109, 0)             # the nave
for j in (97, 100, 103, 106):
    blk(57, j, 57, j, 'R'); blk(67, j, 67, j, 'R')
blk(61, 94, 63, 94, 'O')           # the altar
fl(55, 91, 57, 93, 0)              # the doors out
th('wake', 62, 119)
th('torch', 59, 116); th('torch', 65, 116); th('torch', 59, 120); th('torch', 65, 120)
th('candle', 62, 96, id='chapel', n='THE FORGOTTEN CHAPEL')
th('torch', 56, 95); th('torch', 68, 95); th('torch', 56, 108); th('torch', 68, 108)
th('msg', 62, 117, s='Get up. {move} walks, {cam} turns the camera.')
th('msg', 62, 112, s='{dodge}: tap to roll, hold to sprint. {jump} jumps.')
th('msg', 60, 104, s='{light} hits, {heavy} for a heavy. Hold {guard} to guard.')
th('msg', 64, 99, s='Rest at candles. You heal, the flask fills, and the dead get back up.')
reg('B')
fl(46, 76, 77, 90, 0)              # the graveyard
wall(50, 79, 53, 82); wall(69, 78, 73, 81); wall(57, 85, 59, 87); wall(72, 86, 74, 88)
low(62, 83, 67, 83); low(62, 83, 62, 87)
st(47, 76, 49, 81, '^')            # up to the square
th('chest', 75, 77, id='g1')
foe('gimp', 55, 80); foe('gimp', 70, 84, sit=1)
th('msg', 61, 89, s='Watch the green bar. Every swing and roll costs stamina.')
th('msg', 48, 84, s='Up the stairs: the Candlelit Square.')
th('door', 45, 86, id='d_dep', side='w')   # opens from the Bone Depths
th('door', 78, 88, id='d_mkt', side='e')   # opens from the Lower Market
# ---------------------------------------------------------------- the hub: the Candlelit Square
reg('C')
fl(46, 52, 75, 75, 6)
blk(59, 61, 63, 64, 'O')           # the dry fountain
for (i, j) in ((49, 55), (72, 55), (49, 71), (72, 71)):
    blk(i, j, i, j, 'R')
low(50, 75, 75, 75); low(46, 75, 46, 75)  # look down on the graveyard
th('candle', 61, 67, id='hub', n='THE CANDLELIT SQUARE')
th('npc', 56, 66, who='spermaid'); th('npc', 69, 57, who='saba')
for (i, j) in ((47, 53), (74, 53), (47, 74), (74, 74), (58, 53), (65, 53)):
    th('torch', i, j)
th('msg', 64, 70, s='Spermaid will level you up. Saba sells. Both are good company.')
fl(59, 47, 64, 51, 6)              # the Keep gate
for i in range(59, 65):
    K[48][i] = 'G'
th('msg', 61, 50, s='Three seals on the gate. Three lieutenants hold them.')
fl(40, 62, 45, 65, 6)              # west, to the Bone Depths
fl(76, 62, 84, 65, 6)              # east, to the ruins
th('door', 76, 53, id='d_cath', side='e')   # the shortcut down from the Cathedral
# ---------------------------------------------------------------- the ruins of Cum City
reg('D')
fl(77, 26, 79, 53, 6)              # the shortcut from the Cathedral comes down here (stairs over it below)
fl(85, 55, 98, 71, 6)              # Plaza of the Hanged
blk(90, 62, 92, 64, 'O')
wall(85, 55, 87, 57); wall(96, 69, 98, 71)
foe('gimp', 89, 58); foe('gimp', 95, 67); foe('pusher', 97, 59)
th('msg', 88, 64, s='Doors that will not open from this side are shortcuts. Find the other side.')
fl(90, 44, 93, 54, 6)              # the north alley
foe('butcher', 91, 47)
st(90, 40, 93, 43, '^')
fl(86, 34, 108, 39, 9)             # the upper street
fl(98, 34, 108, 44, 9)             # the Bell Square
blk(102, 36, 103, 37, 'O')
th('candle', 104, 42, id='bell', n='THE BELL SQUARE')
foe('gimp', 88, 36); foe('acrobat', 96, 37); foe('butcher', 107, 35)
th('chest', 86, 38, id='r1')
st(104, 45, 107, 49, 'v')          # up to the approach
fl(104, 50, 112, 53, 12)
fl(113, 50, 124, 58, 12)           # the approach
foe('strongman', 119, 55); foe('gimp', 115, 52)
th('msg', 118, 51, s='Fog ahead. Something big lives behind it.')
for i in range(116, 121):
    K[49][i] = 'F'; HT[49][i] = 12; RG[49][i] = 'D'
th('fog', 118, 49, boss='muckies')
fl(111, 35, 125, 48, 12)           # Mama Muckies' yard
th('boss', 118, 39, f='muckies')
fl(116, 30, 120, 34, 12)           # on to the Cathedral
# the low road: down from the plaza to the market and round the east side back up to the approach
st(89, 72, 92, 76, '^')
fl(84, 77, 97, 84, 3)              # Butcher's Row
foe('butcher', 93, 80); foe('gimp', 86, 79)
st(86, 85, 88, 86, '^')
fl(79, 87, 121, 104, 0)            # the Lower Market
wall(84, 92, 89, 96); wall(95, 90, 100, 94); wall(108, 93, 113, 98); wall(91, 99, 97, 103); wall(116, 88, 121, 91)
th('candle', 103, 101, id='market', n='THE LOWER MARKET')
th('chest', 120, 103, id='r2')
foe('pusher', 92, 89); foe('gimp', 104, 92); foe('gimp', 81, 100); foe('acrobat', 115, 101); foe('butcher', 110, 89)
st(114, 81, 119, 86, '^')
fl(112, 71, 121, 80, 6)            # the east yard
foe('strongman', 116, 75); foe('pusher', 113, 72)
st(114, 59, 119, 70, '^')          # the long stair up to the approach
# ---------------------------------------------------------------- the Cathedral of Blum
reg('E')
fl(91, 7, 121, 29, 12)             # the nave
for j in range(11, 28, 4):
    blk(96, j, 96, j, 'R'); blk(116, j, 116, j, 'R')
th('candle', 118, 27, id='cath', n='THE NAVE OF BLUM')
foe('pusher', 100, 12); foe('acrobat', 108, 18); foe('gimp', 99, 24); foe('butcher', 112, 9); foe('gimp', 104, 27)
fl(90, 1, 121, 4, 16.5)            # the gallery
low(91, 5, 117, 6)
st(118, 5, 121, 9, '^')
th('chest', 105, 2, id='c1')
foe('acrobat', 100, 2); foe('pusher', 112, 3)
fl(77, 1, 89, 3, 16.5)             # the gallery runs out over the side
st(77, 4, 79, 25, '^')             # and all the way down to the square: the shortcut
th('msg', 80, 2, s='All the way down there? That is the Candlelit Square.')
for j in range(16, 21):
    K[j][90] = 'F'; HT[j][90] = 12; RG[j][90] = 'E'
th('fog', 90, 18, boss='bride')
fl(81, 9, 89, 28, 12)              # the Bride's chapel
th('boss', 84, 18, f='bride')
# ---------------------------------------------------------------- the Bone Depths
reg('G')
fl(28, 60, 39, 67, 6)              # the broken stair
th('msg', 36, 63, s='It only gets worse down there. The streets are kinder.')
fl(8, 60, 27, 61, 6)               # a ledge along the cliff
th('chest', 9, 60, id='b1'); foe('gimp', 16, 61)
st(30, 68, 33, 79, '^')
fl(19, 80, 44, 92, 0)              # the Ossuary
chasm(29, 84, 36, 89); fl(32, 84, 33, 89, 0)
blk(22, 89, 24, 91, 'O')
th('candle', 24, 83, id='ossuary', n='THE OSSUARY')
foe('gimp', 38, 82); foe('butcher', 40, 90); foe('pusher', 27, 86); foe('gimp', 31, 86)
fl(8, 62, 11, 79, 3)               # the drop from the ledge
st(8, 80, 11, 81, '^')
fl(8, 82, 18, 86, 0)
st(20, 93, 23, 102, '^')
fl(6, 103, 30, 110, -4.5)          # the Pit
chasm(10, 105, 14, 108); chasm(22, 104, 25, 107)
th('candle', 27, 104, id='pit', n='THE PIT')
foe('strongman', 17, 106); foe('acrobat', 8, 109); foe('butcher', 26, 109)
st(12, 111, 15, 112, '^')
for i in range(12, 16):
    K[113][i] = 'F'; HT[113][i] = -7.5; RG[113][i] = 'G'
th('fog', 13, 113, boss='stag')
fl(4, 114, 24, 125, -7.5)          # the Stag's pit
th('boss', 14, 120, f='stag')
# ---------------------------------------------------------------- the Pill Keep
reg('F')
chasm(44, 24, 75, 46)
fl(59, 30, 64, 46, 6)              # the bridge
low(59, 30, 59, 46); low(64, 30, 64, 46)
th('msg', 61, 44, s="Don't look down.")
foe('gimp', 61, 38); foe('acrobat', 62, 32)
st(59, 22, 64, 29, '^')
fl(46, 10, 74, 21, 13.5)           # the courtyard
blk(52, 14, 54, 16, 'O'); blk(69, 14, 71, 16, 'O')
th('candle', 61, 20, id='keep', n='THE PILL KEEP')
foe('strongman', 50, 12); foe('butcher', 72, 13); foe('pusher', 61, 13); foe('acrobat', 56, 18); foe('acrobat', 67, 18)
th('chest', 47, 11, id='k1'); th('chest', 73, 11, id='k2')
st(59, 8, 64, 11, '^')
for i in range(59, 65):
    K[7][i] = 'F'; HT[7][i] = 18; RG[7][i] = 'F'
th('fog', 61, 7, boss='tb')
fl(50, 0, 73, 6, 18)               # TB's throne room
th('boss', 61, 3, f='tb')
th('throne', 61, 0)

# ---------------------------------------------------------------- lamps and things standing about (update 149)
def deco(d, i, j, **o):
    th('deco', i, j, d=d, **o)
for (i, j) in ((58, 60), (64, 60), (58, 66), (64, 65), (86, 60), (97, 66), (88, 70), (99, 35), (107, 43), (82, 88), (96, 98), (110, 103), (100, 88), (120, 95),
               (116, 51), (123, 57), (113, 73), (120, 79), (47, 20), (73, 20), (52, 11), (70, 11), (20, 81), (43, 91), (7, 104), (29, 109), (5, 115), (23, 115), (5, 124), (23, 124),
               (112, 36), (124, 36), (112, 47), (124, 47), (82, 10), (88, 10), (82, 27), (88, 27), (51, 1), (72, 1), (51, 5), (72, 5), (85, 78), (96, 83), (91, 45), (60, 31), (63, 31), (60, 45), (63, 45)):
    th('torch', i, j)
deco('statue', 61, 62, top=1); deco('statue', 91, 63, top=1)
for (d, i, j) in (('barrel', 73, 59), ('crates', 72, 61), ('crates', 48, 60), ('candles', 66, 71), ('candles', 55, 71), ('statue', 47, 64), ('barrel', 75, 70),
                  ('candles', 54, 78), ('candles', 66, 89), ('statue', 60, 80), ('grave', 64, 86), ('grave', 66, 86),
                  ('barrel', 94, 58), ('crates', 86, 66), ('rubble', 93, 69), ('crates', 99, 42), ('barrel', 101, 35), ('rubble', 95, 36),
                  ('crates', 83, 101), ('barrel', 87, 89), ('crates', 102, 96), ('barrel', 106, 89), ('rubble', 112, 101), ('cage', 118, 99),
                  ('skulls', 26, 90), ('ribs', 41, 81), ('cage', 9, 108), ('coffin', 28, 107), ('pills', 49, 19), ('pills', 72, 19), ('chains', 61, 12)):
    deco(d, i, j)

for t in THINGS:
    if t['k'] == 'torch' and K[t['j']][t['i']] == '#':
        print('torch in a wall', t)

# ---------------------------------------------------------------- write it out
NAMES = {'A': 'THE FORGOTTEN CHAPEL', 'B': 'THE CHAPEL GRAVEYARD', 'C': 'THE CANDLELIT SQUARE', 'D': 'THE CUM CITY RUINS', 'E': 'THE CATHEDRAL OF BLUM', 'F': 'THE PILL KEEP', 'G': 'THE BONE DEPTHS'}


def hc(h):
    return chr(48 + int(round((h + 12) * 2)))   # half metres from -12 m


out = {'W': W, 'H': H, 'k': [''.join(r) for r in K], 'h': [''.join(hc(h) for h in r) for r in HT], 'r': [''.join(r) for r in RG], 'things': THINGS}
here = os.path.dirname(os.path.abspath(__file__))
dst = os.path.join(here, '..', 'newgames', 'games', 'souls', '1c-realmmap.js')
with open(dst, 'w') as f:
    f.write('/* the world map, written by tools/dark-loads/realm.py (do not edit by hand) */\nvar REALMMAP = ' + json.dumps(out, separators=(',', ':')) + ';\n')
try:
    from PIL import Image, ImageDraw
    S = 6; im = Image.new('RGB', (W * S, H * S)); d = ImageDraw.Draw(im)
    col = {'A': (90, 70, 60), 'B': (60, 80, 60), 'C': (120, 90, 40), 'D': (90, 50, 50), 'E': (70, 60, 100), 'F': (100, 40, 80), 'G': (80, 75, 55)}
    for j in range(H):
        for i in range(W):
            k = K[j][i]; c = (10, 6, 8)
            if k == ' ': c = (0, 0, 0)
            elif k != '#':
                b = col[RG[j][i]]; f = 0.45 + (HT[j][i] + 8) / 40; c = tuple(min(255, int(v * f * 1.4)) for v in b)
                if k in '^v<>': c = (200, 200, 120)
                if k == '=': c = (160, 160, 160)
                if k in 'OR': c = (60, 60, 60)
                if k == 'F': c = (240, 240, 240)
                if k == 'G': c = (255, 200, 0)
            d.rectangle([i * S, j * S, i * S + S - 1, j * S + S - 1], fill=c)
    for t in THINGS:
        c = {'candle': (255, 220, 60), 'foe': (255, 30, 30), 'chest': (60, 200, 255), 'msg': (255, 140, 0), 'door': (0, 255, 0), 'npc': (255, 120, 220), 'boss': (255, 0, 255), 'wake': (255, 255, 255)}.get(t['k'])
        if c: d.ellipse([t['i'] * S, t['j'] * S, t['i'] * S + S - 1, t['j'] * S + S - 1], fill=c)
    im = im.resize((W * S, H * S)); im.save(sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ck/realm.png')
except ImportError:
    pass
print('ok', len(THINGS), 'things')
