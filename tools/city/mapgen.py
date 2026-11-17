#!/usr/bin/env python3
"""Cum City Nights: lays out the whole of Cum City and writes tools/newgames/games/city/1-map.js (CITY) and a preview.

  python3 tools/city/mapgen.py            writes the map and /home/claude/ck/citymap.png

One tile is 4 m. The map is 896 x 768 tiles (3.6 x 3.1 km): the main island (Clubhouse Row downtown, the Red Light
District, the Cafe Streets, the Cumstruction Site, Cum Hills (houses for sale), the Blood Factory, the Docks, Spunk
Brain Labs, the Cream River, the Forest, the haunted Cumwood Asylum, the Cemetery, the Bone Pit, the Airport, Ejaculand
and its pier, Seamen Beach, the castle hills in the north: Cumhead's Castle, Blumhead's Castle, Greebo's Grotto and the
Crimson Moon altar on the peak) and the Sperm Isles to the east (Spermaid's Sanctum, the village, the volcano, the
lighthouse, Pirate Cove). Roads are a graph (nodes, edges with bends) that the traffic follows; buildings are boxes.

Update 158 (his ask: the map felt basic, blocky wonky roads and jagged ones, big empty spaces, Ejaculand a grid):
  * downtown is a straight grid (no more jitter) of blocks that differ by district: a boulevard and a main street,
    narrow lanes through the red light district, big campus blocks at the labs, yards at the docks, a square by the
    Clubhouse; blocks are built up on all four sides round a yard.
  * Cum Hills is a real suburb: a loop road, a crescent through the middle and closes off them that end in turning
    circles, houses set back along every road facing it.
  * every road out of town is a smooth curve (Catmull-Rom through a few points), the ring road too, so nothing zig-zags.
  * the countryside is filled: farms, a village with a pub and a church, a petrol station and diner, a motel, a caravan
    park, a campsite, a logging camp, a ranger lookout, a radio mast, wind turbines, a windmill, a scrapyard, a stone
    circle, picnic spots, fishing jetties, a hunting cabin, an observatory, each with a track to the road.
  * Ejaculand is a park, not a grid: a gate and a plaza with the clock tower, a promenade that winds round a lake, the
    rides in their own plots off it, lawns, and a car park outside.
  * flattened ground (castles, the asylum, the chapel...) blends into the hills round it instead of a cliff.
"""
import json, math, os, random, base64
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(APP, 'tools', 'newgames', 'games', 'city', '1-map.js')
W, H = 896, 768
R = random.Random(1987)
np.random.seed(1987)

SEA, WATER, SAND, GRASS, FOREST, ROAD, PAVE, LOT, PARK, ROCK, DIRT, RUNWAY, GRAVE, BRIDGE, CREAM, PIER, YARD, FIELD = range(18)
KCOL = {SEA: (12, 18, 40), WATER: (24, 44, 80), SAND: (214, 196, 150), GRASS: (54, 92, 40), FOREST: (22, 58, 26), ROAD: (40, 38, 40), PAVE: (120, 112, 108),
        LOT: (90, 84, 80), PARK: (70, 120, 50), ROCK: (100, 90, 84), DIRT: (130, 100, 70), RUNWAY: (60, 60, 64), GRAVE: (60, 80, 52), BRIDGE: (150, 60, 50),
        CREAM: (236, 222, 180), PIER: (130, 90, 50), YARD: (100, 100, 96), FIELD: (120, 130, 60)}

# ---------------------------------------------------------------- districts
EJ = (520, 650, 74, 48)  # Ejaculand: centre and half sizes of the park (tiles)
def blob(cx, cz, rx, rz, n=18, wob=0.08, seed=0):
    rr = random.Random(seed); return [(cx + math.cos(k / n * 6.283) * rx * (1 + rr.uniform(-wob, wob)), cz + math.sin(k / n * 6.283) * rz * (1 + rr.uniform(-wob, wob))) for k in range(n)]
DIST = [
    ('sea', 'Open Sea', 'sea', None),
    ('club', 'Clubhouse Row', 'downtown', [(456, 304), (500, 296), (560, 302), (570, 340), (562, 384), (568, 420), (520, 426), (470, 418), (452, 380), (458, 340)]),
    ('red', 'Red Light District', 'redlight', [(560, 302), (612, 296), (664, 306), (668, 352), (656, 404), (606, 398), (568, 420), (562, 384), (570, 340)]),
    ('cafe', 'The Cafe Streets', 'cafe', [(470, 418), (520, 426), (568, 420), (574, 470), (566, 528), (510, 534), (458, 524), (448, 472)]),
    ('site', 'The Cumstruction Site', 'site', [(300, 284), (412, 284), (412, 380), (300, 380)]),
    ('hills', 'Cum Hills', 'suburb', [(300, 380), (412, 380), (412, 440), (406, 500), (384, 540), (330, 548), (296, 520), (286, 460), (292, 410)]),
    ('factory', 'The Blood Factory', 'industrial', [(566, 196), (630, 182), (684, 196), (694, 250), (686, 300), (664, 306), (612, 296), (560, 302), (562, 250)]),
    ('docks', 'The Docks', 'docks', [(664, 352), (706, 380), (712, 470), (716, 560), (660, 566), (600, 562), (574, 532), (574, 470), (606, 398), (656, 404)]),
    ('brain', 'Spunk Brain Labs', 'labs', [(460, 220), (512, 208), (562, 214), (566, 250), (560, 302), (500, 296), (456, 304), (452, 262)]),
    ('forest', 'The Forest', 'forest', [(96, 176), (150, 188), (196, 182), (250, 196), (292, 214), (304, 262), (296, 280), (296, 352), (284, 404), (230, 408), (170, 404), (130, 396), (96, 360), (84, 300), (90, 236)]),
    ('asylum', 'Cumwood Asylum', 'haunted', [(184, 276), (232, 272), (244, 300), (232, 330), (186, 328), (176, 300)]),
    ('cemetery', 'The Cemetery', 'cemetery', [(112, 416), (170, 408), (230, 414), (238, 452), (226, 494), (160, 498), (110, 488), (104, 450)]),
    ('bone', 'The Bone Pit', 'quarry', [(100, 500), (160, 498), (222, 502), (230, 548), (220, 594), (160, 604), (110, 596), (96, 548)]),
    ('airport', 'Cum City Airport', 'airport', [(196, 606), (300, 598), (392, 604), (396, 650), (390, 700), (300, 704), (204, 698), (192, 650)]),
    ('ejac', 'Ejaculand', 'park', blob(EJ[0], EJ[1], EJ[2] + 3, EJ[3] + 3, 24, 0.0)),
    ('beach', 'Seamen Beach', 'beach', [(616, 568), (700, 560), (704, 630), (690, 704), (612, 704), (600, 650)]),
    ('castle', "Cumhead's Castle", 'castle', [(272, 80), (330, 66), (392, 80), (396, 130), (380, 172), (320, 178), (276, 160), (266, 120)]),
    ('blumc', "Blumhead's Castle", 'darkcastle', [(564, 78), (620, 62), (668, 86), (672, 140), (650, 180), (590, 182), (562, 150)]),
    ('grotto', "Greebo's Grotto", 'grotto', [(144, 116), (200, 104), (252, 118), (262, 160), (230, 186), (170, 184), (140, 156)]),
    ('peak', 'Crimson Peak', 'peak', [(404, 50), (470, 36), (536, 50), (540, 110), (520, 160), (470, 170), (420, 158), (400, 110)]),
    ('isles', 'The Sperm Isles', 'isles', [(712, 60), (890, 60), (890, 700), (712, 700)]),
    ('country', 'The Outskirts', 'country', None),
]
DID = {d[0]: i for i, d in enumerate(DIST)}

def poly_mask(pts, val=1):
    im = Image.new('L', (W, H), 0); ImageDraw.Draw(im).polygon([tuple(p) for p in pts], fill=val); return np.array(im) > 0

def noise(scale, octaves=4, seed=0):
    rs = np.random.RandomState(seed); out = np.zeros((H, W)); amp = 1.0; tot = 0
    for o in range(octaves):
        s = max(2, int(scale / (2 ** o))); gh, gw = H // s + 2, W // s + 2; g = rs.rand(gh, gw)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((gw * s, gh * s), Image.BICUBIC)
        out += np.array(im, dtype=float)[:H, :W] / 255.0 * amp; tot += amp; amp *= 0.5
    return out / tot
YY, XX = np.mgrid[0:H, 0:W]

# ---------------------------------------------------------------- land
MAIN = [(120, 64), (210, 52), (300, 40), (420, 30), (520, 34), (610, 50), (676, 92), (704, 170), (712, 260), (700, 340), (710, 430), (716, 520), (704, 610),
        (690, 706), (600, 722), (480, 726), (390, 712), (280, 714), (190, 704), (120, 650), (90, 560), (72, 470), (78, 380), (64, 300), (70, 210), (86, 130)]
ISLES = [
    [(744, 150), (800, 120), (860, 140), (878, 210), (866, 300), (820, 340), (760, 330), (736, 260)],
    [(770, 400), (830, 380), (880, 420), (884, 490), (840, 530), (780, 520), (752, 460)],
    [(744, 580), (790, 560), (830, 590), (826, 650), (780, 676), (740, 640)],
    [(846, 70), (874, 66), (884, 92), (864, 108), (842, 96)],
    [(724, 368), (738, 362), (744, 378), (728, 384)], [(860, 560), (872, 556), (878, 570), (864, 576)],
]
land = poly_mask(MAIN)
for p in ISLES: land |= poly_mask(p)
n1 = noise(48, 4, 3)
dist_in = ndi.distance_transform_edt(land); dist_out = ndi.distance_transform_edt(~land)
signed = dist_in - dist_out + (n1 - 0.5) * 22
land = signed > 0
coast = ndi.distance_transform_edt(land)

K = np.full((H, W), SEA, np.uint8)
K[land] = GRASS
K[(~land) & (ndi.distance_transform_edt(~land) < 14)] = WATER
K[land & (coast < 4)] = SAND

hgt = np.zeros((H, W)); hn = noise(80, 5, 11); hn2 = noise(24, 3, 12)
hgt[land] = 2.0 + np.minimum(coast[land], 40) * 0.08 + (hn[land] - 0.5) * 6
def bump(cx, cz, r, hh, sharp=2.0):
    d = np.hypot(XX - cx, YY - cz) / r
    return hh * np.clip(1 - d, 0, 1) ** sharp
NORTH = bump(330, 110, 110, 36, 1.4) + bump(470, 90, 80, 62, 1.2) + bump(610, 120, 70, 40, 1.5) + bump(200, 140, 80, 26, 1.5) + bump(210, 260, 120, 12, 1.5)
NORTH += bump(800, 450, 46, 44, 1.3)
NORTH += bump(800, 230, 60, 10, 1.5) + bump(780, 620, 34, 12, 1.4)
NORTH += bump(150, 330, 50, 10, 1.6) + bump(250, 560, 40, 6, 1.5)  # update 158: gentle hills in the west for the lookout and the turbines
hgt += NORTH * land
hgt += (hn2 - 0.5) * 3 * land

D = np.full((H, W), DID['country'], np.uint8); D[~land] = DID['sea']
for i, d in enumerate(DIST):
    if d[3] is None: continue
    m = poly_mask(d[3]) & land
    D[m] = i
isle = np.zeros((H, W), bool)
for p in ISLES: isle |= poly_mask(p)
isle = ndi.binary_dilation(isle, iterations=8) & land
D[isle] = DID['isles']
def dmask(k): return D == DID[k]

CITYD = ['club', 'red', 'cafe', 'site', 'hills', 'factory', 'docks', 'brain', 'airport', 'ejac']
city = np.zeros((H, W), bool)
for k in CITYD: city |= dmask(k)
cs = ndi.gaussian_filter(city.astype(float), 10)
base = 3.0 + (hn - 0.5) * 2 + np.clip((300 - YY) / 60.0, 0, 3)
hgt = hgt * (1 - cs) + base * cs
# Ejaculand sits low by the sea so its lake can hold water
ejm = dmask('ejac'); es = ndi.gaussian_filter(ejm.astype(float), 6)
hgt = hgt * (1 - es) + 1.9 * es
hgt[~land] = -2

# soft flattening: a level pad that blends into the land round it (update 158: no more cliffs and ramps round castles)
def flat(x0, z0, x1, z1, h=None, kind=None, fall=16):
    sub = hgt[z0:z1, x0:x1]; hh = float(np.median(sub)) if h is None else h
    dx = np.maximum(np.maximum(x0 - XX, XX - (x1 - 1)), 0); dz = np.maximum(np.maximum(z0 - YY, YY - (z1 - 1)), 0); d = np.hypot(dx, dz)
    t = np.clip(d / fall, 0, 1); t = t * t * (3 - 2 * t); m = (t < 1) & land
    hgt[m] = hh * (1 - t[m]) + hgt[m] * t[m]
    if kind is not None: K[z0:z1, x0:x1] = kind
    return hh

K[dmask('forest') & (K == GRASS) & (noise(26, 3, 41) > 0.36)] = FOREST
K[dmask('grotto') & (K == GRASS) & (noise(20, 2, 5) > 0.45)] = FOREST
fn = noise(30, 3, 7)
K[(D == DID['country']) & (K == GRASS) & (fn > 0.64)] = FOREST
K[dmask('isles') & (K == GRASS) & (fn > 0.55)] = FOREST
K[dmask('cemetery') & (K == GRASS)] = GRAVE
bp = poly_mask([(124, 512), (206, 510), (212, 580), (128, 588)])
bpd = ndi.distance_transform_edt(bp)
hgt[bp] = hgt[bp] - np.minimum(bpd[bp] * 1.2, 16)
K[dmask('bone') & land] = DIRT

# ---------------------------------------------------------------- the Cream River
RIVER = [(452, 150), (440, 200), (428, 250), (430, 300), (424, 340), (430, 380), (440, 420), (436, 470), (428, 520), (420, 570), (410, 620), (404, 680), (400, 740)]
riv = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(riv); dr.line(RIVER, fill=255, width=12, joint='curve')
dr.ellipse((436, 128, 482, 164), fill=255)
riv = np.array(riv) > 0
K[riv & land] = CREAM; hgt[riv] = np.minimum(hgt[riv], 0.4)
bank = ndi.binary_dilation(riv, iterations=3) & ~riv & land
hgt[bank] = np.minimum(hgt[bank], 2.2)

# ---------------------------------------------------------------- curves
def cr(ctrl, step=1.2, closed=False):
    """Catmull-Rom through the control points, a point every `step` tiles"""
    P = [tuple(map(float, c)) for c in ctrl]
    if closed: P = [P[-1]] + P + [P[0], P[1]]
    else: P = [(2 * P[0][0] - P[1][0], 2 * P[0][1] - P[1][1])] + P + [(2 * P[-1][0] - P[-2][0], 2 * P[-1][1] - P[-2][1])]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]; L = math.hypot(p2[0] - p1[0], p2[1] - p1[1]); n = max(1, int(L / step))
        for s in range(n):
            t = s / n; t2 = t * t; t3 = t2 * t
            out.append(tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in range(2)))
    out.append(P[-2] if not closed else P[-2])
    return out
def bend(a, b, amp=6, n=2, seed=0):
    """a gentle curve from a to b: n points between, pushed sideways by a smooth amount"""
    rr = random.Random(seed); pts = [a]; dx, dz = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dz) or 1; nx, nz = -dz / L, dx / L
    ph = rr.uniform(0, 6.28); k = rr.choice([1, 1, 2])
    for i in range(1, n + 1):
        t = i / (n + 1); o = math.sin(t * math.pi * k + ph * 0) * amp * (1 if k == 1 else 0.7) * (1 if rr.random() < 0.5 or i > 1 else 1)
        pts.append((a[0] + dx * t + nx * o, a[1] + dz * t + nz * o))
    pts.append(b); return pts

# ---------------------------------------------------------------- the road network (polylines split at junctions)
NODES = []; EDGES = []; BULB = set()
def node(x, z):
    for i, n in enumerate(NODES):
        if abs(n[0] - x) < 1.5 and abs(n[1] - z) < 1.5: return i
    NODES.append([float(x), float(z)]); return len(NODES) - 1
def edge(a, b, w=2.5, pts=None):
    if a == b: return
    for e in EDGES:
        if (e['a'] == a and e['b'] == b) or (e['a'] == b and e['b'] == a):
            if not pts or not e['p']: return
    EDGES.append({'a': a, 'b': b, 'w': w, 'p': [list(p) for p in (pts or [])]})
LINES = []  # polylines: {'pts': dense points, 'w': width, 'cut': set of indices that become nodes, 'closed'}
def line(pts, w=2.5, closed=False):
    L = {'pts': list(pts), 'w': w, 'cut': {0, len(pts) - 1} if not closed else {0}, 'closed': closed}; LINES.append(L); return L
def nearest_on(L, x, z):
    best, bi = 1e18, 0
    for i, p in enumerate(L['pts']):
        d = (p[0] - x) ** 2 + (p[1] - z) ** 2
        if d < best: best, bi = d, i
    return bi, math.sqrt(best)
def attach(L, x, z):
    """the point on line L nearest (x, z) becomes a junction; returns its position"""
    i, d = nearest_on(L, x, z)
    # keep junctions apart along a line
    for c in L['cut']:
        if abs(c - i) < 4 and c not in (0, len(L['pts']) - 1): i = c; break
    L['cut'].add(i); return L['pts'][i]
def flush():
    for L in LINES:
        cuts = sorted(L['cut']); P = L['pts']
        if L['closed']:
            cuts = cuts + [len(P)]; P = P + [P[0]]
        for a, b in zip(cuts, cuts[1:]):
            na = node(*P[a]); nb = node(*P[b]); edge(na, nb, L['w'], P[a + 1:b])

# ---- the city: a straight grid east of the river
XS = [456, 478, 500, 522, 546, 568, 590, 612, 634, 656, 678, 700]
ZS = [204, 226, 248, 270, 292, 314, 336, 358, 380, 402, 424, 446, 468, 490, 512, 534, 556]
EASTD = {DID[k] for k in ('club', 'red', 'cafe', 'factory', 'docks', 'brain')}
BOULEVARD_X, MAIN_Z = 522, 358
def cell_d(ci, rj):
    x = (XS[ci] + XS[ci + 1]) // 2; z = (ZS[rj] + ZS[rj + 1]) // 2
    if not land[z, x] or K[z, x] in (CREAM, WATER, SEA): return None
    if (riv[ZS[rj]:ZS[rj + 1], XS[ci]:XS[ci + 1]]).any(): return None
    d = D[z, x]; return d if d in EASTD else None
NC, NR = len(XS) - 1, len(ZS) - 1
CELL = {(ci, rj): cell_d(ci, rj) for ci in range(NC) for rj in range(NR)}
CELL = {k: v for k, v in CELL.items() if v is not None}
# superblocks: cells that share a group have no road between them
GRP = {}
for (ci, rj), d in CELL.items():
    sty = DIST[d][2]
    if sty == 'docks': GRP[(ci, rj)] = ('dk', ci // 2, rj // 2)
    elif sty == 'labs': GRP[(ci, rj)] = ('lb', ci // 2, rj)
    elif sty == 'industrial': GRP[(ci, rj)] = ('in', ci // 2, rj)
    elif sty == 'downtown' and (ci * 7 + rj * 3) % 9 == 0 and XS[ci + 1] != BOULEVARD_X: GRP[(ci, rj)] = ('dt', ci // 2 * 2, rj)
    else: GRP[(ci, rj)] = ('c', ci, rj)
def gsame(a, b): return a in GRP and b in GRP and GRP[a] == GRP[b]
def wid(axis, v, d1, d2):
    if axis == 'x' and v == BOULEVARD_X: return 4.0
    if axis == 'z' and v == MAIN_Z: return 3.5
    s = {DIST[d][2] for d in (d1, d2) if d is not None}
    if 'docks' in s or 'industrial' in s: return 3.0
    return 2.5
SEGL = {}
for ci in range(NC + 1):  # north-south segments on x line ci
    for rj in range(NR):
        L, Rr = (ci - 1, rj), (ci, rj)
        if L not in CELL and Rr not in CELL: continue
        if gsame(L, Rr): continue
        SEGL[('x', ci, rj)] = line([(XS[ci], ZS[rj]), (XS[ci], ZS[rj + 1])], wid('x', XS[ci], CELL.get(L), CELL.get(Rr)))
for rj in range(NR + 1):
    for ci in range(NC):
        A, B = (ci, rj - 1), (ci, rj)
        if A not in CELL and B not in CELL: continue
        if gsame(A, B): continue
        SEGL[('z', ci, rj)] = line([(XS[ci], ZS[rj]), (XS[ci + 1], ZS[rj])], wid('z', ZS[rj], CELL.get(A), CELL.get(B)))
def tee(key, p):  # update 158: a lane meets the road it joins at a real junction (it used to end on top of it, so cars turned round there)
    L = SEGL.get(key)
    if not L: return
    a, b = L['pts'][0], L['pts'][-1]; pts = sorted(L['pts'] + [p], key=lambda q: (q[0] - a[0]) ** 2 + (q[1] - a[1]) ** 2); L['pts'] = pts; L['cut'] = {pts.index(q) for q in pts}
# narrow lanes through the red light district and some cafe blocks (a block cut in two)
LANES = []
for (ci, rj), d in CELL.items():
    sty = DIST[d][2]; x0, x1, z0, z1 = XS[ci], XS[ci + 1], ZS[rj], ZS[rj + 1]
    if sty == 'redlight' or (sty == 'cafe' and (ci + rj) % 3 == 0):
        if (ci + rj) % 2: mx = (x0 + x1) // 2; line([(mx, z0), (mx, z1)], 2.0); LANES.append(('x', mx, z0, z1, ci, rj)); tee(('z', ci, rj), (mx, z0)); tee(('z', ci, rj + 1), (mx, z1))
        else: mz = (z0 + z1) // 2; line([(x0, mz), (x1, mz)], 2.0); LANES.append(('z', mz, x0, x1, ci, rj)); tee(('x', ci, rj), (x0, mz)); tee(('x', ci + 1, rj), (x1, mz))
# ---- across the river: the Cumstruction Site (big dirt blocks) and the bridges
XSW = [304, 330, 356, 382, 408]; ZSW = [292, 314, 336, 358, 380]
for x in XSW:
    for a, b in zip(ZSW, ZSW[1:]): line([(x, a), (x, b)], 2.5 if x not in (304, 408) else 3.0)
for z in (292, 336, 380):
    for a, b in zip(XSW, XSW[1:]): line([(a, z), (b, z)], 2.5)
for z in (314, 358):
    for a, b in zip(XSW, XSW[1:]): line([(a, z), (b, z)], 3.5 if z == MAIN_Z else 2.5)
for z, w in ((314, 2.5), (358, 3.5), (446, 2.5), (512, 2.5)):
    xe = XS[0]; xw = 408
    line([(xw, z), (xe, z)], w)  # straight over the river: a bridge
# ---- the ring road round the island (smooth)
RING = [(150, 120), (260, 92), (400, 70), (520, 68), (640, 120), (690, 220), (690, 320), (700, 420), (690, 560), (660, 650), (560, 700), (420, 704), (300, 714), (190, 690), (130, 620), (110, 520), (100, 420), (100, 320), (104, 220)]
ringL = line(cr(RING, 1.5, closed=True), 3.0, closed=True)
# ---- Cum Hills: a loop, a crescent, closes with turning circles
HL = [(400, 392), (370, 388), (338, 392), (314, 404), (302, 432), (304, 466), (316, 500), (340, 524), (372, 528), (396, 508), (404, 476), (404, 440)]
hillL = line(cr(HL, 1.2, closed=True), 2.5, closed=True)
cres = cr([(400, 446), (378, 452), (356, 446), (334, 456), (306, 452)], 1.2)
hcL = line(cres, 2.5)
for (x, z) in (cres[0], cres[-1]): attach(hillL, x, z)
# the site's roads run down into the hills loop, the bridges join it
for x in (330, 382): p = attach(hillL, x, 392); line([(x, 380), p], 2.5)
for z in (446, 512): p = attach(hillL, 404, z); line([(408, z), p], 2.5)
CLOSES = []
def closes_off(L, every, side_seed, inward_c=None):
    pts = L['pts']; n = len(pts); rr = random.Random(side_seed)
    for i in range(every // 2, n - 4, every):
        a = pts[i]; b = pts[min(n - 1, i + 2)]; tx, tz = b[0] - a[0], b[1] - a[1]; l = math.hypot(tx, tz) or 1; tx, tz = tx / l, tz / l
        for s in (1, -1):
            nx, nz = -tz * s, tx * s; ang = rr.uniform(-0.35, 0.35); c, sn = math.cos(ang), math.sin(ang); dx, dz = nx * c - nz * sn, nx * sn + nz * c
            ln = rr.uniform(14, 24); e = (a[0] + dx * ln, a[1] + dz * ln); m = (a[0] + dx * ln * 0.5 + tx * rr.uniform(-4, 4), a[1] + dz * ln * 0.5 + tz * rr.uniform(-4, 4))
            ok = dmask('hills')[int(e[1]), int(e[0])] and land[int(e[1]), int(e[0])]
            if not ok: continue
            # keep clear of other roads (except where it starts)
            ctr = cr([a, m, e], 1.0)
            clear = True
            for qi, q in enumerate(ctr[4:]):
                for L2 in LINES:
                    if L2 is L and qi < 8: continue
                    for p2 in L2['pts'][::2]:
                        if (p2[0] - q[0]) ** 2 + (p2[1] - q[1]) ** 2 < 10 ** 2: clear = False; break
                    if not clear: break
                if not clear: break
                for (cx, cz) in CLOSES:
                    if (cx - q[0]) ** 2 + (cz - q[1]) ** 2 < 14 ** 2: clear = False; break
                if not clear: break
            if not clear: continue
            p = attach(L, a[0], a[1]); ctr[0] = p; line(ctr, 2.0); CLOSES.append(e)
closes_off(hillL, 16, 5); closes_off(hcL, 12, 6)
# ---- arterials: smooth roads out of town to the ring road
def gnode(x, z):
    best, bd = None, 1e9
    for L in LINES[:]:
        if L['w'] > 4: continue
    for (ci, rj) in CELL:
        for (xx, zz) in ((XS[ci], ZS[rj]), (XS[ci + 1], ZS[rj]), (XS[ci], ZS[rj + 1]), (XS[ci + 1], ZS[rj + 1])):
            d = math.hypot(xx - x, zz - z)
            if d < bd: bd, best = d, (xx, zz)
    return best
def art(a, b, w=2.5, amp=6, n=2, seed=0, toL=None, fromL=None):
    if fromL is not None: a = attach(fromL, *a)
    if toL is not None: b = attach(toL, *b)
    pts = cr(bend(a, b, amp, n, seed), 1.5); pts[0] = a; pts[-1] = b; return line(pts, w)
RP = ringL['pts']
def ringat(x, z): return RP[nearest_on(ringL, x, z)[0]]
art(gnode(456, 226), ringat(300, 80), 2.5, 10, 2, 3, toL=ringL)          # north-west out of the labs
art(gnode(546, 204), ringat(520, 68), 2.5, 6, 2, 4, toL=ringL)           # north to the peak road
art(gnode(678, 248), ringat(690, 240), 2.5, 2, 1, 5, toL=ringL)
art(gnode(700, 380), ringat(696, 390), 2.5, 2, 1, 6, toL=ringL)
art(gnode(700, 534), ringat(694, 540), 2.5, 2, 1, 7, toL=ringL)
bvL = art(gnode(522, 556), (522, 600), 4.0, 0, 1, 8)                         # the boulevard runs on to Ejaculand's gate
art((304, 292), ringat(150, 300), 2.5, 12, 2, 9, toL=ringL)                 # the site to the forest and the asylum
art((302, 466), ringat(100, 460), 2.5, 8, 2, 10, fromL=hillL, toL=ringL)    # the hills west to the ring
art((340, 524), (300, 650), 3.0, 8, 2, 11, fromL=hillL)                     # the hills south to the airport
art((300, 650), ringat(300, 712), 3.0, 4, 1, 12, toL=ringL)
art(gnode(456, 534), ringat(420, 704), 2.5, 10, 2, 14, toL=ringL)
art(gnode(700, 556), ringat(660, 650), 2.5, 6, 1, 15, toL=ringL)
art((522, 584), (420, 610), 2.5, 6, 1, 16, fromL=bvL)                       # west from the boulevard before the car parks
art((420, 610), ringat(420, 704), 2.5, 6, 1, 17, toL=ringL)
# up to the castles and the peak
cast = (331, 152); art(ringat(260, 92), cast, 2.5, 6, 2, 21, fromL=ringL); art(ringat(400, 70), cast, 2.5, 6, 2, 22, fromL=ringL)
blum = (611, 156); art(ringat(640, 120), blum, 2.5, 6, 2, 23, fromL=ringL)
grot = (196, 168); art(ringat(150, 120), grot, 2.5, 6, 2, 24, fromL=ringL)
peak = (472, 98); art(ringat(520, 68), peak, 2.0, 10, 3, 25, fromL=ringL)
asy = (210, 322); art(ringat(104, 300), asy, 2.0, 10, 3, 26, fromL=ringL); art(asy, (304, 314), 2.0, 8, 2, 27)
cem = (170, 462); art(ringat(100, 460), cem, 2.5, 4, 1, 28, fromL=ringL)
bon = (168, 548); art(ringat(110, 548), bon, 2.5, 4, 1, 29, fromL=ringL)
air = (300, 650)
# the bridge to the Sperm Isles and the island roads
br0 = attach(ringL, 690, 228); br1 = (752, 236)
line([br0, (712, 226), (732, 230), br1], 3.0)
isle_c = (800, 230); art(br1, isle_c, 2.5, 8, 2, 35); vil = (830, 300); art(isle_c, vil, 2.5, 8, 2, 36); san = (820, 186); art(isle_c, san, 2.5, 8, 2, 37)
# ---- villages and places in the country get their own little roads (added below once the spots are chosen)

# ---------------------------------------------------------------- Ejaculand: a park with a winding promenade
EJX, EJZ, EJRX, EJRZ = EJ
ej_in = ejm & land
PATH = np.zeros((H, W), bool); PPATHS = []; PDISCS = []
def paint_path(pts, r):
    if len(pts) > 1: PPATHS.append([round(r * 2, 2), [[round(p[0], 2), round(p[1], 2)] for p in pts]])
    else: PDISCS.append([round(pts[0][0], 2), round(pts[0][1], 2), r])
    for (x, z) in pts:
        x0, x1, z0, z1 = int(x - r - 1), int(x + r + 2), int(z - r - 1), int(z + r + 2)
        sub = (XX[z0:z1, x0:x1] + 0.5 - x) ** 2 + (YY[z0:z1, x0:x1] + 0.5 - z) ** 2 <= r * r
        PATH[z0:z1, x0:x1] |= sub
gate_z = EJZ - EJRZ - 1
loop = [(EJX + math.cos(k / 40 * 6.283) * (38 + 3 * math.sin(k / 40 * 6.283 * 3 + 1)), EJZ + 4 + math.sin(k / 40 * 6.283) * (25 + 2 * math.cos(k / 40 * 6.283 * 2))) for k in range(40)]
loopP = cr(loop, 0.8, closed=True); paint_path(loopP, 1.6)
paint_path(cr([(EJX, gate_z), (EJX, EJZ - 18)], 0.8), 2.2)                  # the avenue in from the gate
plaza = (EJX, gate_z + 9); paint_path([plaza], 7)                           # the plaza with the clock tower
lake = ((XX - EJX) / 17.0) ** 2 + ((YY - (EJZ + 6)) / 10.0) ** 2 < 1
# spurs from the promenade out to the plots
SLOTS = []  # (kind, x, z, half w, half d in tiles, side)
BIG = [('coaster', 0.15, 'out', 12, 7), ('ferris', 3.14, 'out', 6, 5), ('bigtop', 2.2, 'out', 5, 5), ('dropper', 0.75, 'out', 3, 3), ('carousel', 4.0, 'in', 4, 4), ('flume', 1.57, 'in', 11, 2)]
SMALL = ['teacups', 'swings', 'pirate', 'helter', 'dodgems', 'ghost', 'stalls', 'food', 'steve', 'fountain2', 'mirrors', 'balloons', 'arcadehall', 'stalls', 'food', 'teacups', 'swings', 'balloons', 'food', 'stalls', 'fountain2', 'helter']
SSZ = {'teacups': (4, 4), 'swings': (3, 3), 'pirate': (3, 2), 'helter': (2, 2), 'dodgems': (3, 2), 'ghost': (3, 2), 'stalls': (3, 2), 'food': (3, 2), 'steve': (2, 2),
       'fountain2': (2, 2), 'mirrors': (2, 2), 'balloons': (3, 1), 'arcadehall': (3, 2)}
occE = np.zeros((H, W), bool); occE |= lake; occE |= PATH
def put_slot(kind, a, side, hw, hd):
    # walk out from the loop at angle a until the plot fits
    lx = EJX + math.cos(a) * (38 + 3 * math.sin(a * 3 + 1)); lz = EJZ + 4 + math.sin(a) * (25 + 2 * math.cos(a * 2))
    dx, dz = (lx - EJX), (lz - EJZ - 4); l = math.hypot(dx, dz) or 1; dx, dz = dx / l, dz / l
    if side == 'in': dx, dz = -dx, -dz
    ext = abs(dx) * hw + abs(dz) * hd
    for s in range(2, 34):
        cx, cz = lx + dx * (s + ext), lz + dz * (s + ext); x0, x1, z0, z1 = int(cx - hw), int(cx + hw), int(cz - hd), int(cz + hd)
        if x0 < 2 or z0 < 2: break
        sub = ej_in[z0 - 1:z1 + 2, x0 - 1:x1 + 2]
        if sub.size and sub.all() and not occE[z0 - 1:z1 + 2, x0 - 1:x1 + 2].any():
            occE[z0 - 1:z1 + 2, x0 - 1:x1 + 2] = True
            paint_path(cr([(lx, lz), (cx - dx * ext, cz - dz * ext)], 0.8), 1.1)  # the spur
            SLOTS.append((kind, cx, cz, hw, hd)); return True
    return False
for k, a, side, hw, hd in BIG: put_slot(k, a, side, hw, hd)
ang = [i / len(SMALL) * 6.283 + 0.4 for i in range(len(SMALL))]
for i, k in enumerate(SMALL):
    hw, hd = SSZ[k]
    if not put_slot(k, ang[i], 'out' if i % 3 else 'in', hw, hd): put_slot(k, ang[i] + 0.2, 'in' if i % 3 else 'out', hw, hd)

# ---------------------------------------------------------------- rasterise the roads
flush()
def epoints(e):
    pts = [NODES[e['a']]] + e['p'] + [NODES[e['b']]]; out = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]; L = math.hypot(b[0] - a[0], b[1] - a[1]); n = max(1, int(L / 0.5))
        for s in range(n): t = s / n; out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    out.append(tuple(pts[-1])); return out
def hat(x, z):
    xi, zi = int(min(W - 1, max(0, x))), int(min(H - 1, max(0, z))); return hgt[zi, xi]
deg = {}
for e in EDGES: deg[e['a']] = deg.get(e['a'], 0) + 1; deg[e['b']] = deg.get(e['b'], 0) + 1
for i in deg:
    if deg[i] == 1 and dmask('hills')[int(NODES[i][1]), int(NODES[i][0])]: BULB.add(i)
PAVED = ('downtown', 'redlight', 'cafe', 'suburb', 'labs', 'site', 'docks', 'industrial')
roadm = np.zeros((H, W), bool); pavem = np.zeros((H, W), bool); roadh = np.full((H, W), np.nan); bridgem = np.zeros((H, W), bool)
def stamp(x, z, h, r, rp):
    x0, x1, z0, z1 = int(x - rp - 1), int(x + rp + 2), int(z - rp - 1), int(z + rp + 2)
    for zz in range(max(0, z0), min(H, z1)):
        for xx in range(max(0, x0), min(W, x1)):
            d = math.hypot(xx + 0.5 - x, zz + 0.5 - z)
            if d <= r:
                if K[zz, xx] in (SEA, WATER, CREAM) or bridgem[zz, xx]: bridgem[zz, xx] = True
                roadm[zz, xx] = True
                roadh[zz, xx] = h if np.isnan(roadh[zz, xx]) else (roadh[zz, xx] + h) / 2
            elif d <= rp: pavem[zz, xx] = True; roadh[zz, xx] = h if np.isnan(roadh[zz, xx]) else roadh[zz, xx]
for e in EDGES:
    pts = epoints(e); hs = []
    for (x, z) in pts:
        k = K[int(z), int(x)] if 0 <= int(z) < H and 0 <= int(x) < W else SEA
        hs.append(max(hat(x, z), 0.8) if k not in (SEA, WATER, CREAM) else None)
    known = [h for h in hs if h is not None] or [3]
    for i in range(len(hs)):
        if hs[i] is None: hs[i] = max(6.5, max(known[0], known[-1]))
    hs = np.convolve(np.pad(hs, 30, mode='edge'), np.ones(61) / 61, mode='same')[30:-30]  # update 158: smoother grades
    e['hs'] = [round(float(h), 2) for h in hs[::8]] + [round(float(hs[-1]), 2)]
    mid = pts[len(pts) // 2]; sty = DIST[D[int(mid[1]) % H, int(mid[0]) % W]][2]
    r = e['w'] / 2; rp = r + (1.6 if sty in PAVED else 0)
    for (x, z), h in zip(pts, hs): stamp(x, z, h, r, rp)
for i in BULB:  # turning circles at the end of each close
    x, z = NODES[i]; stamp(x, z, hat(x, z), 3.0, 4.6)
rm = ~np.isnan(roadh)
hgt[rm & ~bridgem] = roadh[rm & ~bridgem]
near = ndi.binary_dilation(rm, iterations=8) & ~rm
idx = ndi.distance_transform_edt(~rm, return_distances=False, return_indices=True)
nh = roadh[idx[0], idx[1]]; dd = ndi.distance_transform_edt(~rm)
blend = np.clip(dd / 9.0, 0, 1); blend = blend * blend * (3 - 2 * blend)
ok = near & ~np.isnan(nh) & land
hgt[ok] = nh[ok] * (1 - blend[ok]) + hgt[ok] * blend[ok]
K[pavem & ~roadm & land & (K != CREAM)] = PAVE
hgt[bridgem] = roadh[bridgem]
K[roadm & ~bridgem] = ROAD
K[bridgem] = BRIDGE
# Ejaculand's ground: lawns, the promenade, the lake, the plots paved
EJP = ej_in & ~roadm & ~pavem
K[EJP] = PARK
K[EJP & PATH] = PARK   # update 158: the paths are drawn as smooth ribbons in the game (CITY.ppaths), the tiles stay grass
for (kind, cx, cz, hw, hd) in SLOTS: K[int(cz - hd):int(cz + hd) + 1, int(cx - hw):int(cx + hw) + 1] = PAVE
lk = lake & EJP; K[lk] = WATER; hgt[lk] = -1.2
lb = ndi.binary_dilation(lk, iterations=2) & ~lk & EJP; hgt[lb] = np.minimum(hgt[lb], 1.0)

# ---------------------------------------------------------------- buildings
B = []  # [x0, z0, x1, z1, h, style, front dir (0 n,1 e,2 s,3 w), shop id or '']
occ = np.zeros((H, W), bool)
def free(x0, z0, x1, z1, kinds=(GRASS, LOT, FIELD, FOREST, DIRT, YARD, PARK, SAND, GRAVE)):
    if x0 < 1 or z0 < 1 or x1 >= W - 1 or z1 >= H - 1: return False
    sub = K[z0:z1, x0:x1]
    return not occ[z0:z1, x0:x1].any() and np.isin(sub, list(kinds)).all()
def put(x0, z0, x1, z1, h, style, front=2, shop='', kind=LOT, gap=0):
    x0, z0, x1, z1 = int(x0), int(z0), int(x1), int(z1)
    if h > 0 and roadm[max(0, z0):z1, max(0, x0):x1].any(): return -1  # update 159: never build on a road (traffic drove through these)
    B.append([x0, z0, x1, z1, round(h, 1), style, front, shop]); occ[max(0, z0 - gap):z1 + gap, max(0, x0 - gap):x1 + gap] = True
    if kind is not None: K[z0:z1, x0:x1] = kind
    return len(B) - 1
def front_of(x0, z0, x1, z1):
    best = 2; bd = 99
    for d, (xx, zz) in enumerate([((x0 + x1) // 2, z0 - 1), (x1, (z0 + z1) // 2), ((x0 + x1) // 2, z1), (x0 - 1, (z0 + z1) // 2)]):
        for s in range(0, 8):
            px = xx + [0, s, 0, -s][d]; pz = zz + [-s, 0, s, 0][d]
            if 0 <= px < W and 0 <= pz < H and K[pz, px] in (ROAD, PAVE):
                if s < bd: bd, best = s, d
                break
    return best
STY = {'downtown': (14, 54), 'redlight': (8, 18), 'cafe': (7, 15), 'industrial': (8, 16), 'docks': (7, 12), 'labs': (10, 26)}
def inset(w): return int(math.ceil(w / 2 + 1.6))
def roadw_at(x, z):
    best = 2.5; bd = 1e9
    for e in EDGES:
        a, b = NODES[e['a']], NODES[e['b']]
        if len(e['p']) > 1: continue
        vx, vz = b[0] - a[0], b[1] - a[1]; l2 = vx * vx + vz * vz or 1; t = max(0, min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / l2)); d = math.hypot(a[0] + vx * t - x, a[1] + vz * t - z)
        if d < bd: bd, best = d, e['w']
    return best
CX = (522, 340)  # the middle of Clubhouse Row: the tallest towers stand round it
SQUARE = None
groups = {}
for c, g in GRP.items(): groups.setdefault(g, []).append(c)
for g, cells in groups.items():
    ci0 = min(c[0] for c in cells); ci1 = max(c[0] for c in cells) + 1; rj0 = min(c[1] for c in cells); rj1 = max(c[1] for c in cells) + 1
    d = CELL[cells[0]]; sty = DIST[d][2]
    X0, X1, Z0, Z1 = XS[ci0], XS[ci1], ZS[rj0], ZS[rj1]
    x0 = X0 + inset(roadw_at(X0, (Z0 + Z1) / 2)); x1 = X1 - inset(roadw_at(X1, (Z0 + Z1) / 2)); z0 = Z0 + inset(roadw_at((X0 + X1) / 2, Z0)); z1 = Z1 - inset(roadw_at((X0 + X1) / 2, Z1))
    if x1 - x0 < 4 or z1 - z0 < 4: continue
    # the lanes cut the block into two
    parts = [(x0, z0, x1, z1)]
    for (ax, v, a0, a1, lci, lrj) in LANES:
        if (lci, lrj) not in cells: continue
        if ax == 'x': parts = [(x0, z0, v - 2, z1), (v + 2, z0, x1, z1)]
        else: parts = [(x0, z0, x1, v - 2), (x0, v + 2, x1, z1)]
    lo, hi = STY.get(sty, (8, 16))
    # Clubhouse Square: the block west of the boulevard on the main street's north side
    if sty == 'downtown' and SQUARE is None and X1 == BOULEVARD_X and Z1 == MAIN_Z - 22:
        SQUARE = (x0, z0, x1, z1); K[z0:z1, x0:x1] = PAVE; continue
    for (bx0, bz0, bx1, bz1) in parts:
        bw, bd = bx1 - bx0, bz1 - bz0
        if bw < 3 or bd < 3: continue
        sub = K[bz0:bz1, bx0:bx1]; sub[np.isin(sub, [GRASS, PARK, FIELD, FOREST, DIRT, SAND])] = LOT
        if sty == 'docks':  # a container yard, a warehouse along one side
            K[bz0:bz1, bx0:bx1] = YARD; put(bx0, bz0, bx1, bz0 + min(9, bd // 3), R.uniform(lo, hi), 'docks', 0, kind=YARD)
            continue
        if sty == 'labs':  # a campus: a lab building on a lawn, a path to it
            K[bz0:bz1, bx0:bx1] = PARK; m = 3; put(bx0 + m, bz0 + m, bx1 - m, bz0 + m + max(5, (bd - 2 * m) // 2), R.uniform(lo, hi), 'lab', 2)
            if bd > 18: put(bx0 + m, bz1 - m - 6, bx0 + m + (bw - 2 * m) // 2 - 1, bz1 - m, R.uniform(8, 14), 'lab', 2)
            continue
        if sty == 'industrial':
            K[bz0:bz1, bx0:bx1] = YARD
            if R.random() < 0.6: put(bx0 + 1, bz0 + 1, bx1 - 1, bz0 + max(6, bd * 2 // 3), R.uniform(lo, hi), 'shed', 0, kind=YARD)
            else:
                put(bx0 + 1, bz0 + 1, bx0 + bw // 2 - 1, bz1 - 1, R.uniform(lo, hi), 'shed', 3, kind=YARD); put(bx0 + bw // 2 + 1, bz0 + 1, bx1 - 1, bz0 + bd // 2, R.uniform(lo, hi), 'industrial', 1, kind=YARD)
            continue
        # perimeter blocks: a row along each side, a yard in the middle
        dep = min(8 if sty == 'downtown' else 6, max(3, min(bw, bd) // 2))
        def heightf(x, z):
            if sty != 'downtown': return R.uniform(lo, hi)
            f = max(0.0, 1 - math.hypot(x - CX[0], z - CX[1]) / 70.0); return lo + (hi - lo) * (0.25 + 0.75 * f) * R.uniform(0.6, 1.0)
        def row(a0, a1, fixed0, fixed1, axis, front):
            x = a0; cuts = [a0]
            while x < a1 - 3: x += R.randint(3, 6 if sty != 'redlight' else 4); cuts.append(min(x, a1))
            cuts[-1] = a1; segs = [(a, b) for a, b in zip(cuts, cuts[1:]) if b - a >= 2]
            alley = R.randrange(1, len(segs)) if len(segs) >= 4 and sty != 'downtown' else -1
            for si, (a, b) in enumerate(segs):
                if si == alley: a += 1
                if axis == 'x': put(a, fixed0, b, fixed1, heightf((a + b) / 2, fixed0), sty, front)
                else: put(fixed0, a, fixed1, b, heightf(fixed0, (a + b) / 2), sty, front)
        row(bx0, bx1, bz0, bz0 + dep, 'x', 0)
        if bd >= dep * 2: row(bx0, bx1, bz1 - dep, bz1, 'x', 2)
        if bd > dep * 2 + 3 and bw >= dep * 2:
            row(bz0 + dep, bz1 - dep, bx0, bx0 + dep, 'z', 3); row(bz0 + dep, bz1 - dep, bx1 - dep, bx1, 'z', 1)
        # the yard in the middle: a car park, a pocket garden or a courtyard
        iz0, iz1, ix0, ix1 = bz0 + dep, bz1 - dep, bx0 + dep, bx1 - dep
        if ix1 - ix0 >= 4 and iz1 - iz0 >= 4:
            if R.random() < 0.35: K[iz0:iz1, ix0:ix1] = PARK
            elif R.random() < 0.6: B.append([ix0, iz0, ix1, iz1, 0, 'carpark', 2, '']); K[iz0:iz1, ix0:ix1] = YARD
# the Cumstruction Site: dirt plots with half built towers, portacabins
for a, b in zip(XSW, XSW[1:]):
    for c, d2 in zip(ZSW, ZSW[1:]):
        x0, x1, z0, z1 = a + 3, b - 3, c + 3, d2 - 3
        K[z0:z1, x0:x1] = DIRT
        r = R.random()
        if r < 0.55: put(x0 + 2, z0 + 2, x1 - 2, z1 - 2, R.uniform(10, 34), 'frame', 2, kind=DIRT)
        elif r < 0.8: put(x0 + 1, z0 + 1, x0 + 5, z0 + 3, 3, 'shed', 2, kind=DIRT); put(x0 + 1, z0 + 5, x0 + 5, z0 + 7, 3, 'shed', 2, kind=DIRT)
# Cum Hills: houses along every road, set back with gardens, facing the road
def houses_along(L, step=6.0, off=None):
    pts = L['pts']; w = L['w']; off = off or (w / 2 + 1.6 + 3.2); acc = step / 2
    for i in range(1, len(pts) - 1):
        a, b = pts[i - 1], pts[i]; seg = math.hypot(b[0] - a[0], b[1] - a[1]); acc += seg
        if acc < step: continue
        acc = 0; tx, tz = (b[0] - a[0]) / (seg or 1), (b[1] - a[1]) / (seg or 1)
        for s in (1, -1):
            nx, nz = -tz * s, tx * s; cx, cz = b[0] + nx * off, b[1] + nz * off; hw = 1.6
            x0, z0 = int(round(cx - hw)), int(round(cz - hw)); x1, z1 = x0 + 3, z0 + 3
            if not dmask('hills')[int(cz), int(cx)]: continue
            if not free(x0 - 1, z0 - 1, x1 + 1, z1 + 1, (GRASS, FOREST, FIELD, PARK, LOT, DIRT)): continue
            # facing the road
            ang = math.atan2(-nx, -nz)
            fr = 0 if abs(nz) > abs(nx) and nz > 0 else 2 if abs(nz) > abs(nx) else 3 if nx > 0 else 1
            fr = {(0): 0, 1: 1, 2: 2, 3: 3}[fr]
            # grass garden round it, a drive to the road
            K[z0 - 1:z1 + 1, x0 - 1:x1 + 1] = np.where(np.isin(K[z0 - 1:z1 + 1, x0 - 1:x1 + 1], [ROAD, PAVE]), K[z0 - 1:z1 + 1, x0 - 1:x1 + 1], GRASS)
            put(x0, z0, x1, z1, R.choice([5, 5.5, 7.5]), 'house', fr, kind=GRASS, gap=1)
for L in LINES:
    p = L['pts'][len(L['pts']) // 2]
    if dmask('hills')[int(p[1]), int(p[0])]: houses_along(L)
for i in BULB:  # houses round each turning circle
    x, z = NODES[i]
    for k in range(7):
        a = k / 7 * 6.283; cx, cz = x + math.cos(a) * 8.6, z + math.sin(a) * 8.6; x0, z0 = int(round(cx - 1.5)), int(round(cz - 1.5))
        if not free(x0 - 1, z0 - 1, x0 + 4, z0 + 4, (GRASS, FOREST, FIELD, PARK, LOT, DIRT)): continue
        fr = 0 if math.sin(a) > 0.7 else 2 if math.sin(a) < -0.7 else 3 if math.cos(a) > 0 else 1
        K[z0 - 1:z0 + 4, x0 - 1:x0 + 4] = GRASS; put(x0, z0, x0 + 3, z0 + 3, R.choice([5, 5.5, 7.5]), 'house', fr, kind=GRASS, gap=1)

# ---------------------------------------------------------------- shops: every shop front gets a building facing a road
SHOPS = [
    ('club', 'The Clubhouse', 'club'), ('saba', "Saba's Hitless Hemporium", 'club'), ('pulsar', 'PulsarOctopus Beats', 'club'), ('arcade', 'Potbelly Arcade', 'club'),
    ('sanct', "Spermaid's Sanctum Stall", 'club'), ('t', "T's Hussy House", 'red'), ('bonjo', "Bonjo's BJ Boutique", 'red'), ('tb', "TB's Suck n' Fuck", 'red'),
    ('cafe', "Kaya & Elden's Cum Café", 'cafe'), ('greebo', "Greebo's Gourmet Goonery", 'cafe'), ('amy', "Amy's Willy Chilli", 'cafe'), ('joff', "Joff's Pineapple Pizzaria", 'cafe'),
    ('beebs', "Uncle Beeb's Tavern", 'cafe'), ('ali', "Ali's Garlic Grub", 'cafe'), ('harold', "Harold's Mad Tea Party", 'cafe'), ('jessiah', "Jessiah's", 'club'),
    ('natty', 'Nattyboro Enchanting', 'red'), ('judge', 'Judgement Spells', 'red'), ('fate', "Stacked Fate's Table", 'red'), ('bates', 'Master Bates Emporium', 'club'),
    ('motors', 'Cum Motors', 'docks'), ('estate', 'Load Estates', 'club'), ('wash', 'The Cream Wash', 'factory'), ('wash2', 'The Cream Wash', 'hills'), ('cops', 'Cum City Police', 'club'),
    ('hosp', 'Cum City Hospital', 'cafe'), ('gym', 'Iron Loads Gym', 'red'), ('bank', 'Bank of Cum City', 'club'), ('tattoo', 'Inked Loads Tattoos', 'red'),
]
shopB = {}; cand = {}
def facing_road(b):
    f = b[6]; x0, z0, x1, z1 = b[0], b[1], b[2], b[3]
    for s in range(0, 6):
        px, pz = [((x0 + x1) // 2, z0 - 1 - s), (x1 + s, (z0 + z1) // 2), ((x0 + x1) // 2, z1 + s), (x0 - 1 - s, (z0 + z1) // 2)][f]
        if 0 <= px < W and 0 <= pz < H and K[pz, px] in (ROAD, PAVE): return True
        if s > 1 and 0 <= px < W and 0 <= pz < H and occ[pz, px]: return False
    return False
for bi, b in enumerate(B):
    if b[5] in ('downtown', 'redlight', 'cafe', 'industrial', 'docks', 'shed', 'house', 'suburb') and b[4] > 0 and facing_road(b): cand.setdefault(DIST[D[(b[1] + b[3]) // 2, (b[0] + b[2]) // 2]][0], []).append(bi)
for sid, name, dk in SHOPS:
    L = [bi for bi in cand.get(dk, []) if bi not in shopB.values() and B[bi][2] - B[bi][0] >= 3 and B[bi][7] == '' and (B[bi][2] - B[bi][0] if B[bi][6] in (0, 2) else B[bi][3] - B[bi][1]) >= 3]
    if sid == 'club' and SQUARE:  # the Clubhouse faces its square
        L.sort(key=lambda bi: math.hypot((B[bi][0] + B[bi][2]) / 2 - (SQUARE[0] + SQUARE[2]) / 2, (B[bi][1] + B[bi][3]) / 2 - (SQUARE[1] + SQUARE[3]) / 2))
    else: L.sort(key=lambda bi: R.random())
    for bi in L:
        b = B[bi]; shopB[sid] = bi; b[7] = sid; break
HOUSES = []
hb = [bi for bi, b in enumerate(B) if b[5] == 'house' and b[7] == '']; R.shuffle(hb)
for k, bi in enumerate(hb[:5]): B[bi][7] = 'home%d' % k; HOUSES.append({'id': 'home%d' % k, 'b': bi, 'name': ['Cum Hills Starter', 'Cum Hills Family Home', 'Cul-de-Sac Bungalow', 'Load Lane Semi', 'Creamy Close Detached'][k], 'cost': [8000, 15000, 12000, 20000, 28000][k]})
dt = [bi for bi, b in enumerate(B) if b[5] == 'downtown' and b[7] == '' and b[4] > 36]
if dt: B[dt[0]][7] = 'home5'; HOUSES.append({'id': 'home5', 'b': dt[0], 'name': 'Clubhouse Row Penthouse', 'cost': 90000})

# ---------------------------------------------------------------- landmarks and places (POIs)
POI = []
def poi(kind, x, z, **kw):
    d = {'k': kind, 'x': round(float(x), 1), 'z': round(float(z), 1)}; d.update(kw); POI.append(d); return d
hc = flat(310, 96, 352, 140, kind=None, fall=22); K[100:137, 314:349] = PAVE; poi('castle', 331, 118, h=hc, name="Cumhead's Castle", dark=0); poi('dungeon', 331, 142, h=hc, name='The Cum Dungeons')
hb2 = flat(590, 104, 632, 146, kind=None, fall=22); poi('castle', 611, 125, h=hb2, name="Blumhead's Castle", dark=1)
hg = flat(180, 130, 212, 160, kind=GRASS, fall=14); poi('grotto', 196, 140, h=hg, name="Greebo's Grotto")
hp = flat(462, 70, 482, 90, kind=ROCK, fall=10); poi('altar', 472, 80, h=hp, name='The Crimson Moon Altar')
ha = flat(196, 286, 224, 314, kind=PAVE, fall=12); poi('asylum', 210, 300, h=ha, name='Cumwood Asylum')
poi('chapel', 170, 440, h=flat(162, 430, 180, 448, kind=PAVE, fall=10), name='Cemetery Chapel')
poi('quarry', 168, 548, h=float(hgt[548, 168]), name='The Bone Pit')
rw = flat(206, 628, 384, 646, kind=RUNWAY, fall=12); flat(206, 646, 384, 690, h=rw, kind=YARD, fall=12)
poi('runway', 295, 637, h=rw, x0=206, x1=384, z0=628, z1=646); poi('terminal', 250, 668, h=rw); poi('hangar', 310, 672, h=rw); poi('hangar', 340, 672, h=rw); poi('tower', 370, 660, h=rw)
CITYSTY = {i for i, d in enumerate(DIST) if d[2] in ('downtown', 'redlight', 'cafe', 'docks', 'labs', 'industrial')}
incity = np.isin(D, list(CITYSTY))
for _ in range(3):
    nearpave = ndi.binary_dilation(np.isin(K, [PAVE, ROAD]), iterations=1)
    nearlot = ndi.binary_dilation(np.isin(K, [LOT]) | occ, iterations=3)
    K[(K == GRASS) & incity & nearpave & nearlot] = PAVE
# Clubhouse Square: a fountain, statues, benches
if SQUARE:
    sx, sz = (SQUARE[0] + SQUARE[2]) / 2, (SQUARE[1] + SQUARE[3]) / 2; poi('fountain2', sx, sz, h=float(hgt[int(sz), int(sx)]), square=1)
    poi('statue', sx - (SQUARE[2] - SQUARE[0]) * 0.3, sz, h=float(hgt[int(sz), int(sx)]), who='cumhead'); poi('statue', sx + (SQUARE[2] - SQUARE[0]) * 0.3, sz, h=float(hgt[int(sz), int(sx)]), who='lab')
# Ejaculand
he = float(np.median(hgt[ej_in & ~lake]))
for (kind, cx, cz, hw, hd) in SLOTS:
    extra = {}
    if kind not in ('coaster', 'ferris', 'bigtop', 'dropper', 'carousel', 'flume'): extra = {'w': hw * 8, 'd': hd * 8, 'seed': len(POI), 'park': 1}
    poi(kind, cx, cz, h=he, **extra)
poi('gate', EJX, gate_z, h=he); poi('clock', plaza[0], plaza[1], h=he)
B.append([EJX - 34, gate_z - 16, EJX - 8, gate_z - 4, 0, 'carpark', 2, '']); K[gate_z - 16:gate_z - 4, EJX - 34:EJX - 8] = YARD   # the visitors' car park
B.append([EJX + 8, gate_z - 16, EJX + 34, gate_z - 4, 0, 'carpark', 2, '']); K[gate_z - 16:gate_z - 4, EJX + 8:EJX + 34] = YARD
for z in range(EJZ + EJRZ - 2, 744):
    for x in range(514, 526):
        if K[z, x] in (SEA, WATER, SAND, GRASS, PARK): K[z, x] = PIER; hgt[z, x] = 3.5
poi('pierend', 520, 742, h=3.5)
# the docks: cranes on the quay, containers in the yards
for x, z in ((690, 440), (692, 480), (692, 520)): poi('crane', x, z, h=float(hgt[z, x]))
for b in B:
    if b[5] == 'docks':
        yz0 = b[3] + 2; c = DIST[D[min(H - 1, yz0 + 4), (b[0] + b[2]) // 2]][2]
        for k in range(R.randint(3, 6)):
            x = R.uniform(b[0] + 3, b[2] - 3); z = R.uniform(yz0 + 2, yz0 + 12)
            if K[int(z), int(x)] == YARD and not occ[int(z) - 2:int(z) + 2, int(x) - 3:int(x) + 3].any(): poi('containers', x, z, h=float(hgt[int(z), int(x)]), a=R.choice([0, 1.5708]), n=R.randint(1, 3)); occ[int(z) - 2:int(z) + 2, int(x) - 3:int(x) + 3] = True
for x, z in ((600, 210), (640, 230), (620, 270)): poi('chimney', x, z, h=float(hgt[z, x]))
poi('dome', 506, 254, h=float(hgt[254, 506]), name='Spunk Brain Labs')
for x, z in ((330, 314), (382, 358)): poi('crane2', x + 12, z + 10, h=float(hgt[z + 10, x + 12]))
poi('sanctum', 822, 168, h=flat(812, 158, 832, 178, kind=SAND, fall=8), name="Spermaid's Sanctum")
poi('lighthouse', 862, 86, h=float(hgt[86, 862]))
poi('volcano', 812, 452, h=float(hgt[452, 812]))
poi('cove', 772, 640, h=float(hgt[640, 772]), name='Pirate Cove')
for i in range(9): poi('hut', 830 + R.uniform(-22, 22), 300 + R.uniform(-18, 18), h=float(hgt[300, 830]))
for x, z in ((500, 330), (546, 380), (500, 460), (600, 340), (356, 420)): poi('manhole', x + 0.5, z + 0.5, h=float(hgt[z, x]))
poi('outfall', 404, 690, h=1.5, name='The Cream Sewers')
poi('helipad', 520, 360, h=60.0, roof=1); poi('helipad', 300, 690, h=rw); poi('helipad', 660, 260, h=float(hgt[260, 660]))
for x, z in ((706, 480), (530, 712), (760, 250), (420, 690)): poi('boats', x, z, h=1.0)

# ---------------------------------------------------------------- the countryside (update 158: it was empty)
roadd = ndi.distance_transform_edt(~np.isin(K, [ROAD, BRIDGE]))
taken = []
def spot(kinds, dists, size, rmin, rmax, away=40, tries=12000, seed=0, prefer=None, slope=0.5):
    rr = random.Random(seed); best = None
    for _ in range(tries):
        x = rr.randint(20, W - 20); z = rr.randint(20, H - 20)
        if D[z, x] not in dists: continue
        if not (rmin <= roadd[z, x] <= rmax): continue
        x0, z0, x1, z1 = x - size, z - size, x + size, z + size
        if x0 < 2 or z0 < 2 or x1 >= W - 2 or z1 >= H - 2: continue
        sub = K[z0:z1, x0:x1]
        if not np.isin(sub, kinds).all() or occ[z0:z1, x0:x1].any(): continue
        hh = hgt[z0:z1, x0:x1]
        if hh.max() - hh.min() > size * slope * 4: continue
        if any(math.hypot(x - tx, z - tz) < away for (tx, tz) in taken): continue
        if any(math.hypot(x - p['x'], z - p['z']) < 26 for p in POI): continue
        best = (x, z); break
    if best: taken.append(best)
    return best
NATK = (GRASS, FIELD, FOREST)
COUNTRY = [DID['country']]; FOREST_D = [DID['forest'], DID['country'], DID['grotto']]
def track(x, z, w=2.0):
    """a road from the place to the nearest road (a proper road edge, so cars can drive in)"""
    best = None; bd = 1e9
    for e in EDGES:
        for p in ([NODES[e['a']]] + e['p'] + [NODES[e['b']]])[::2]:
            d = (p[0] - x) ** 2 + (p[1] - z) ** 2
            if d < bd: bd, best = d, (e, p)
    return best
NEWROADS = []; CLEAR = []
def place(kind, kinds, dists, size, rmin, rmax, seed, flatten=True, **kw):
    s = spot(kinds, dists, size, rmin, rmax, seed=seed)
    if not s: return None
    x, z = s; h = flat(x - size, z - size, x + size, z + size, fall=10) if flatten else float(hgt[z, x])
    occ[z - size:z + size, x - size:x + size] = True; CLEAR.append([x - size - 3, z - size - 3, x + size + 3, z + size + 3])
    p = poi(kind, x, z, h=h, **kw); NEWROADS.append((x, z + size + 1)); return p
for i in range(5): place('farm', (FIELD, GRASS), COUNTRY, 10, 12, 40, 100 + i, name='Farm')
place('village', (GRASS, FIELD, FOREST, ROCK), COUNTRY, 15, 3, 20, 120, name='Little Load')
place('petrol', (GRASS, FIELD, FOREST, SAND), COUNTRY, 6, 4, 8, 130, name='Pump n Dump')
place('petrol', (GRASS, FIELD, FOREST, SAND), COUNTRY + [DID['beach']], 6, 4, 8, 131, name='Pump n Dump')
place('motel', (GRASS, FIELD, FOREST), COUNTRY, 8, 4, 10, 132, name='The Sticky Sheets Motel')
place('diner', (GRASS, FIELD, FOREST), COUNTRY, 6, 4, 10, 133, name="Dot's Drip Diner")
place('trailers', (GRASS, FIELD, FOREST), COUNTRY, 10, 6, 24, 134, name='Shady Loads Caravan Park')
place('camp', (FOREST, GRASS), FOREST_D, 7, 8, 40, 135, name='Cumwood Campsite')
place('camp', (FOREST, GRASS), FOREST_D, 7, 8, 40, 136, name='Lost Load Camp')
place('logging', (FOREST, GRASS), FOREST_D, 9, 6, 30, 137, name='Woodie Logging Camp')
place('lookout', (FOREST, GRASS, ROCK), FOREST_D + [DID['castle'], DID['peak']], 4, 10, 60, 138, name='Ranger Lookout')
place('lookout', (FOREST, GRASS, ROCK, FIELD), COUNTRY, 4, 10, 60, 139, name='Ranger Lookout')
place('cabin', (FOREST,), FOREST_D, 5, 10, 60, 140, name='Hunting Cabin')
place('cabin', (FOREST, GRASS), FOREST_D, 5, 10, 60, 141, name='Hunting Cabin')
place('mast', (GRASS, FIELD, FOREST, ROCK), COUNTRY + [DID['peak']], 4, 8, 60, 142, flatten=False)
for i in range(4): place('turbine', (GRASS, FIELD, ROCK), COUNTRY, 3, 10, 80, 150 + i, flatten=False)
place('windmill', (FIELD, GRASS), COUNTRY, 4, 6, 40, 160)
place('scrapyard', (GRASS, FIELD, FOREST, DIRT), COUNTRY + [DID['factory']], 10, 4, 16, 161, name='Cum Scrap & Salvage')
place('stones', (GRASS, FIELD, FOREST), COUNTRY + [DID['forest']], 6, 14, 80, 162, name='The Spunkhenge Stones')
for i in range(4): place('picnic', (GRASS, FIELD, FOREST), COUNTRY + [DID['forest']], 4, 3, 14, 170 + i, name='Picnic Spot')
place('observatory', (GRASS, FIELD, FOREST, ROCK), [DID['castle'], DID['peak'], DID['country']], 6, 6, 40, 175, name='Starload Observatory')
place('drivein', (GRASS, FIELD, FOREST), COUNTRY, 11, 3, 20, 176, name='The Load Drive-In')
place('golf', (GRASS, FIELD), COUNTRY, 14, 6, 30, 177, name='Hole in Load Mini Golf')
# fishing jetties: on the coast, sticking out to sea
for i, (x, z) in enumerate(((96, 400), (140, 650), (660, 700), (712, 300), (230, 50), (600, 60))):
    best = None
    for dz in range(-30, 31, 2):
        for dx in range(-30, 31, 2):
            xx, zz = x + dx, z + dz
            if 2 < xx < W - 2 and 2 < zz < H - 2 and K[zz, xx] == SAND and not occ[zz - 2:zz + 2, xx - 2:xx + 2].any():
                # the sea direction
                for a in range(8):
                    ax, az = round(math.cos(a / 8 * 6.283)), round(math.sin(a / 8 * 6.283))
                    if K[min(H - 1, max(0, zz + az * 8)), min(W - 1, max(0, xx + ax * 8))] in (SEA, WATER) and (best is None): best = (xx, zz, math.atan2(ax, az))
    if best: poi('jetty', best[0], best[1], h=float(hgt[best[1], best[0]]), a=round(best[2], 3), name='Fishing Jetty'); occ[best[1] - 2:best[1] + 2, best[0] - 2:best[0] + 2] = True
# view points for photos
for i, (x, z) in enumerate(((472, 104), (330, 170), (180, 360), (796, 420), (862, 96), (700, 620), (250, 560), (560, 30))):
    if land[z, x]: poi('view', x, z, h=float(hgt[z, x]), name=['Crimson Peak', "Cumhead's Castle", 'The Forest', 'The Volcano', 'The Lighthouse', 'Seamen Beach', 'The Western Hills', 'The North Cliffs'][i])
# tracks from each place to the road network: real road edges so traffic and GPS can reach them
EDGES0 = len(EDGES)
for (x, z) in NEWROADS:
    best = None; bd = 1e9
    for e in EDGES[:EDGES0]:
        pts = [NODES[e['a']]] + e['p'] + [NODES[e['b']]]
        for p in pts:
            d = (p[0] - x) ** 2 + (p[1] - z) ** 2
            if d < bd: bd, best = d, (e, p)
    if not best or bd > 70 ** 2: continue
    e, p = best
    # split the edge at p into two so the track joins it at a node
    pts = [NODES[e['a']]] + e['p'] + [NODES[e['b']]]; k = pts.index(p)
    if 0 < k < len(pts) - 1:
        nm = node(*p); EDGES.append({'a': nm, 'b': e['b'], 'w': e['w'], 'p': [list(q) for q in pts[k + 1:-1]], 'hs': None}); e['b'] = nm; e['p'] = [list(q) for q in pts[1:k]]; e['hs'] = None
        a = nm
    else: a = e['a'] if k == 0 else e['b']
    pp = cr(bend(tuple(NODES[a]), (x, z), 3, 1, int(x)), 1.5); b = node(x, z); EDGES.append({'a': a, 'b': b, 'w': 2.0, 'p': [list(q) for q in pp[1:-1]], 'hs': None, 'track': 1})
# heights and tiles for the new tracks and the edges split by them
for e in EDGES:
    if e.get('hs') is not None: continue
    pts = epoints(e); hs = [max(hat(x, z), 0.8) for (x, z) in pts]
    hs = np.convolve(np.pad(hs, 30, mode='edge'), np.ones(61) / 61, mode='same')[30:-30]
    e['hs'] = [round(float(h), 2) for h in hs[::8]] + [round(float(hs[-1]), 2)]
    if e.get('track'):
        for (x, z), h in zip(pts, hs):
            for zz in range(int(z - 2), int(z + 3)):
                for xx in range(int(x - 2), int(x + 3)):
                    if math.hypot(xx + 0.5 - x, zz + 0.5 - z) <= 1.5 and K[zz, xx] not in (SEA, WATER, CREAM, ROAD, BRIDGE): K[zz, xx] = ROAD; hgt[zz, xx] = h; roadm[zz, xx] = True
# the farms' fields round them: crop rows (field tiles)
for p in POI:
    if p['k'] == 'farm':
        x, z = int(p['x']), int(p['z'])
        for zz in range(z - 26, z + 27):
            for xx in range(x - 26, x + 27):
                if 0 < xx < W and 0 < zz < H and K[zz, xx] in (GRASS, FOREST) and not occ[zz, xx] and roadd[zz, xx] > 3: K[zz, xx] = FIELD
    if p['k'] == 'village':  # cottages, a pub and a church round a green
        x, z = int(p['x']), int(p['z'])
        for k, (dx, dz, fr) in enumerate(((-12, -12, 2), (-5, -13, 2), (3, -12, 2), (10, -12, 2), (-13, 8, 0), (-5, 9, 0), (4, 8, 0), (11, 8, 0))):
            sub = K[z + dz:z + dz + 4, x + dx:x + dx + 4]
            if not np.isin(sub, [ROAD, BRIDGE, WATER, SEA, CREAM]).any(): put(x + dx, z + dz, x + dx + 4, z + dz + 4, R.choice([5, 5.5, 7.5]) if k != 2 else 6.5, 'house', fr, shop='pub' if k == 2 else '', kind=GRASS)
        K[z - 5:z + 5, x - 12:x + 12] = PAVE; K[z - 3:z + 3, x - 4:x + 4] = PARK
        poi('church', x - 2, z + 22, h=float(hgt[z, x]), name='St Spunk\'s')
# ---------------------------------------------------------------- forest tidy: a ring of grass round every place so trees never stand inside it
for p in POI:
    x, z = int(p['x']), int(p['z']); r = {'farm': 10, 'camp': 6, 'logging': 8, 'trailers': 10, 'motel': 8, 'petrol': 6, 'diner': 6, 'cabin': 4, 'lookout': 3, 'stones': 6, 'picnic': 4, 'observatory': 6, 'drivein': 12, 'golf': 14, 'scrapyard': 10, 'windmill': 3, 'turbine': 2, 'mast': 3, 'church': 5}.get(p['k'])
    if r:
        sub = K[z - r:z + r, x - r:x + r]; sub[np.isin(sub, [FOREST, FIELD])] = GRASS
# rock on the steep hills (after the roads so the cuttings are rock)
gy, gx = np.gradient(hgt)
steep = np.hypot(gx, gy) > 1.1
K[steep & land & np.isin(K, [GRASS, FOREST, FIELD])] = ROCK
K[(hgt > 50) & land & np.isin(K, [GRASS, FOREST, FIELD])] = ROCK
# lamps along roads in the city
lamps = []
for e in EDGES:
    pts = epoints(e)
    for i in range(0, len(pts), 44):
        x, z = pts[i]; dk = DIST[D[int(z) % H, int(x) % W]][2]
        if (dk in ('downtown', 'redlight', 'cafe', 'suburb', 'labs', 'park', 'industrial', 'docks', 'site') or i % 88 == 0) and not e.get('track'):
            if i + 1 < len(pts): dx, dz = pts[i + 1][0] - x, pts[i + 1][1] - z
            else: dx, dz = 1, 0
            l = math.hypot(dx, dz) or 1; s = e['w'] / 2 + 0.9
            lamps.append([round(x - dz / l * s, 1), round(z + dx / l * s, 1)])

# update 159: roads that later fills painted over (docks yards, car parks, the airport) come back, and the riverbed sits under the cream
BM = np.zeros((H, W), bool)
for b in B:
    if b[4] > 0: BM[b[1]:b[3], b[0]:b[2]] = True
lost = roadm & ~bridgem & ~BM & ~np.isin(K, [ROAD, BRIDGE, SEA, WATER, CREAM]) & land
K[lost] = ROAD; print('roads restored', int(lost.sum()))
cr_m = (K == CREAM); hgt[cr_m] = np.minimum(hgt[cr_m], -1.2)
# ---------------------------------------------------------------- write
def rle(a):
    a = a.astype(np.uint8).ravel(); out = bytearray(); i = 0; n = len(a)
    while i < n:
        v = a[i]; j = i
        while j < n and j - i < 255 and a[j] == v: j += 1
        out += bytes([j - i, v]); i = j
    return base64.b64encode(bytes(out)).decode()
hq = np.clip(np.round((hgt + 4) * 4), 0, 255)
data = {'W': W, 'H': H, 'T': 4, 'v': 158, 'K': rle(K), 'Hq': rle(hq), 'D': rle(D), 'dist': [[d[0], d[1], d[2]] for d in DIST],
        'nodes': [[round(n[0], 1), round(n[1], 1)] for n in NODES], 'edges': [[e['a'], e['b'], e['w'], [[round(p[0], 1), round(p[1], 1)] for p in e['p']], e['hs']] + ([1] if e.get('track') else []) for e in EDGES],
        'clear': CLEAR, 'bulbs': sorted(BULB), 'ppaths': PPATHS, 'pdiscs': PDISCS, 'bld': B, 'poi': POI, 'lamps': lamps, 'houses': HOUSES, 'shops': [[s[0], s[1], shopB.get(s[0], -1)] for s in SHOPS], 'grid': [XS[0], ZS[0], 22]}
js = '/* Cum City, laid out by tools/city/mapgen.py: do not edit by hand */\nvar CITY = ' + json.dumps(data, separators=(',', ':')) + ';\n'
open(OUT, 'w').write(js); print('wrote', OUT, len(js), 'bytes; nodes', len(NODES), 'edges', len(EDGES), 'buildings', len(B), 'pois', len(POI), 'lamps', len(lamps), 'bulbs', len(BULB))
missing = [s[0] for s in SHOPS if s[0] not in shopB]
print('shops placed', len(shopB), 'missing', missing)
from collections import Counter
print('places', Counter(p['k'] for p in POI))
img = np.zeros((H, W, 3), np.uint8)
for k, c in KCOL.items(): img[K == k] = c
shadeh = np.clip((hgt - 2) / 70, 0, 1)[..., None]
img = (img * (0.75 + 0.5 * shadeh)).clip(0, 255).astype(np.uint8)
pim = Image.fromarray(img); dr = ImageDraw.Draw(pim)
for b in B:
    col = (200, 40, 50) if b[7] else (170, 160, 150) if b[4] > 20 else (140, 130, 125)
    if b[5] == 'carpark': col = (80, 80, 84)
    dr.rectangle((b[0], b[1], b[2] - 1, b[3] - 1), fill=col)
for p in POI: dr.ellipse((p['x'] - 2, p['z'] - 2, p['x'] + 2, p['z'] + 2), fill=(255, 220, 60))
pim = pim.resize((W * 2, H * 2), Image.NEAREST); dr = ImageDraw.Draw(pim)
for p in POI:
    if p['k'] not in ('containers', 'hut', 'manhole', 'boats', 'helipad'): dr.text((p['x'] * 2 + 5, p['z'] * 2 - 5), p['k'], fill=(255, 255, 255))
os.makedirs('/home/claude/ck', exist_ok=True); pim.save('/home/claude/ck/citymap.png'); print('preview /home/claude/ck/citymap.png')
