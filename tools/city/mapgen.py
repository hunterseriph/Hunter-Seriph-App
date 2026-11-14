#!/usr/bin/env python3
"""Cum City Nights: lays out the whole of Cum City and writes tools/newgames/games/city/1-map.js (CITY) and a preview.

  python3 tools/city/mapgen.py            writes the map and /home/claude/ck/citymap.png

One tile is 4 m. The map is 896 x 768 tiles (3.6 x 3.1 km): the main island (Clubhouse Row downtown, the Red Light
District, the Cafe Streets, the Cumstruction Site, Cum Hills (houses for sale), the Blood Factory, the Docks, Spunk
Brain Labs, the Cream River, the Forest, the haunted Cumwood Asylum, the Cemetery, the Bone Pit, the Airport, Ejaculand
and its pier, Seamen Beach, the castle hills in the north: Cumhead's Castle, Blumhead's Castle, Greebo's Grotto and the
Crimson Moon altar on the peak) and the Sperm Isles to the east (Spermaid's Sanctum, the village, the volcano, the
lighthouse, Pirate Cove). Roads are a graph (nodes, edges with bends) that the traffic follows; buildings are boxes.
"""
import json, math, os, random, base64
import numpy as np
from PIL import Image, ImageDraw

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
# id: (name, style, polygon in tiles)
DIST = [
    ('sea', 'Open Sea', 'sea', None),
    ('club', 'Clubhouse Row', 'downtown', [(456, 304), (500, 296), (560, 302), (570, 340), (562, 384), (568, 420), (520, 426), (470, 418), (452, 380), (458, 340)]),
    ('red', 'Red Light District', 'redlight', [(560, 302), (612, 296), (664, 306), (668, 352), (656, 404), (606, 398), (568, 420), (562, 384), (570, 340)]),
    ('cafe', 'The Cafe Streets', 'cafe', [(470, 418), (520, 426), (568, 420), (574, 470), (566, 528), (510, 534), (458, 524), (448, 472)]),
    ('site', 'The Cumstruction Site', 'site', [(308, 296), (360, 284), (406, 292), (410, 336), (402, 378), (350, 372), (312, 380), (300, 336)]),
    ('hills', 'Cum Hills', 'suburb', [(312, 380), (350, 372), (402, 378), (410, 430), (404, 500), (380, 540), (330, 546), (296, 520), (286, 460), (296, 410)]),
    ('factory', 'The Blood Factory', 'industrial', [(566, 196), (630, 182), (684, 196), (694, 250), (686, 300), (664, 306), (612, 296), (560, 302), (562, 250)]),
    ('docks', 'The Docks', 'docks', [(664, 352), (706, 380), (712, 470), (716, 560), (660, 566), (600, 562), (574, 532), (574, 470), (606, 398), (656, 404)]),
    ('brain', 'Spunk Brain Labs', 'labs', [(460, 220), (512, 208), (562, 214), (566, 250), (560, 302), (500, 296), (456, 304), (452, 262)]),
    ('forest', 'The Forest', 'forest', [(96, 176), (150, 188), (196, 182), (250, 196), (292, 214), (304, 262), (296, 300), (300, 352), (284, 404), (230, 408), (170, 404), (130, 396), (96, 360), (84, 300), (90, 236)]),
    ('asylum', 'Cumwood Asylum', 'haunted', [(184, 276), (232, 272), (244, 300), (232, 330), (186, 328), (176, 300)]),
    ('cemetery', 'The Cemetery', 'cemetery', [(112, 416), (170, 408), (230, 414), (238, 452), (226, 494), (160, 498), (110, 488), (104, 450)]),
    ('bone', 'The Bone Pit', 'quarry', [(100, 500), (160, 498), (222, 502), (230, 548), (220, 594), (160, 604), (110, 596), (96, 548)]),
    ('airport', 'Cum City Airport', 'airport', [(196, 606), (300, 598), (392, 604), (396, 650), (390, 700), (300, 704), (204, 698), (192, 650)]),
    ('ejac', 'Ejaculand', 'park', [(436, 596), (520, 586), (612, 596), (616, 650), (606, 712), (520, 720), (434, 710), (428, 650)]),
    ('beach', 'Seamen Beach', 'beach', [(616, 568), (700, 560), (704, 630), (690, 704), (612, 704), (616, 650)]),
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

# ---------------------------------------------------------------- land
MAIN = [(120, 64), (210, 52), (300, 40), (420, 30), (520, 34), (610, 50), (676, 92), (704, 170), (712, 260), (700, 340), (710, 430), (716, 520), (704, 610),
        (690, 706), (600, 722), (480, 726), (390, 712), (280, 714), (190, 704), (120, 650), (90, 560), (72, 470), (78, 380), (64, 300), (70, 210), (86, 130)]
ISLES = [  # the Sperm Isles: big isle (Sanctum, village), volcano isle, cove isle, lighthouse rock and some islets
    [(744, 150), (800, 120), (860, 140), (878, 210), (866, 300), (820, 340), (760, 330), (736, 260)],
    [(770, 400), (830, 380), (880, 420), (884, 490), (840, 530), (780, 520), (752, 460)],
    [(744, 580), (790, 560), (830, 590), (826, 650), (780, 676), (740, 640)],
    [(846, 70), (874, 66), (884, 92), (864, 108), (842, 96)],
    [(724, 368), (738, 362), (744, 378), (728, 384)], [(860, 560), (872, 556), (878, 570), (864, 576)],
]
land = poly_mask(MAIN)
for p in ISLES: land |= poly_mask(p)
# wobble the coast
n1 = noise(48, 4, 3)
from scipy import ndimage as ndi  # noqa
dist_in = ndi.distance_transform_edt(land); dist_out = ndi.distance_transform_edt(~land)
signed = dist_in - dist_out + (n1 - 0.5) * 22
land = signed > 0
coast = ndi.distance_transform_edt(land)  # tiles from the sea

K = np.full((H, W), SEA, np.uint8)
K[land] = GRASS
K[(~land) & (ndi.distance_transform_edt(~land) < 14)] = WATER
K[land & (coast < 4)] = SAND

# heights in metres
hgt = np.zeros((H, W)); hn = noise(80, 5, 11); hn2 = noise(24, 3, 12)
hgt[land] = 2.0 + np.minimum(coast[land], 40) * 0.08 + (hn[land] - 0.5) * 6
def bump(cx, cz, r, hh, sharp=2.0):
    yy, xx = np.mgrid[0:H, 0:W]; d = np.hypot(xx - cx, yy - cz) / r
    return hh * np.clip(1 - d, 0, 1) ** sharp
NORTH = bump(330, 110, 110, 36, 1.4) + bump(470, 90, 80, 62, 1.2) + bump(610, 120, 70, 40, 1.5) + bump(200, 140, 80, 26, 1.5) + bump(210, 260, 120, 12, 1.5)
NORTH += bump(800, 450, 46, 44, 1.3)  # the volcano
NORTH += bump(800, 230, 60, 10, 1.5) + bump(780, 620, 34, 12, 1.4)
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

# flatten the city: everything with buildings sits on gentle ground
CITYD = ['club', 'red', 'cafe', 'site', 'hills', 'factory', 'docks', 'brain', 'airport', 'ejac']
city = np.zeros((H, W), bool)
for k in CITYD: city |= dmask(k)
cs = ndi.gaussian_filter(city.astype(float), 10)
base = 3.0 + (hn - 0.5) * 2 + np.clip((300 - np.mgrid[0:H, 0:W][0]) / 60.0, 0, 3)
hgt = hgt * (1 - cs) + base * cs
hgt[~land] = -2

# forest, fields
K[dmask('forest') & (K == GRASS) & (noise(26, 3, 41) > 0.36)] = FOREST
K[dmask('grotto') & (K == GRASS) & (noise(20, 2, 5) > 0.45)] = FOREST
fn = noise(30, 3, 7)
K[(D == DID['country']) & (K == GRASS) & (fn > 0.62)] = FOREST
K[(D == DID['country']) & (K == GRASS) & (fn < 0.3)] = FIELD
K[dmask('isles') & (K == GRASS) & (fn > 0.55)] = FOREST
K[dmask('cemetery') & (K == GRASS)] = GRAVE
# the Bone Pit: a quarry dug into the ground
bp = poly_mask([(124, 512), (206, 510), (212, 580), (128, 588)])
bpd = ndi.distance_transform_edt(bp)
hgt[bp] = hgt[bp] - np.minimum(bpd[bp] * 1.2, 16)
K[dmask('bone') & land] = DIRT
# rock on the steep hills
gy, gx = np.gradient(hgt)
steep = np.hypot(gx, gy) > 1.1
K[steep & land & (K != SAND)] = ROCK
K[(hgt > 50) & land] = ROCK

# ---------------------------------------------------------------- the Cream River (from the lake under Crimson Peak to the sea)
RIVER = [(452, 150), (440, 200), (428, 250), (430, 300), (424, 340), (430, 380), (440, 420), (436, 470), (428, 520), (420, 570), (410, 620), (404, 680), (400, 740)]
riv = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(riv); dr.line(RIVER, fill=255, width=12, joint='curve')
dr.ellipse((436, 128, 482, 164), fill=255)  # the lake
riv = np.array(riv) > 0
K[riv & land] = CREAM; hgt[riv] = np.minimum(hgt[riv], 0.4)
bank = ndi.binary_dilation(riv, iterations=3) & ~riv & land
hgt[bank] = np.minimum(hgt[bank], 2.2)

# ---------------------------------------------------------------- roads
NODES = []; EDGES = []
def node(x, z):
    for i, n in enumerate(NODES):
        if abs(n[0] - x) < 1.5 and abs(n[1] - z) < 1.5: return i
    NODES.append([x, z]); return len(NODES) - 1
def edge(a, b, w=2.5, kind='road', pts=None):
    if a == b: return
    for e in EDGES:
        if (e['a'] == a and e['b'] == b) or (e['a'] == b and e['b'] == a): return
    EDGES.append({'a': a, 'b': b, 'w': w, 'k': kind, 'p': pts or []})
def road(path, w=2.5, kind='road'):
    a = node(*path[0]); b = node(*path[-1]); edge(a, b, w, kind, [list(p) for p in path[1:-1]]); return a, b

# the city grid: one grid for the whole city so the districts join; every 18 tiles
G0x, G0z, GS = 290, 210, 18
gridm = np.zeros((H, W), bool)
for k in ['club', 'red', 'cafe', 'site', 'hills', 'factory', 'docks', 'brain']: gridm |= dmask(k)
gridm = ndi.binary_erosion(gridm, iterations=2)
gnodes = {}
for gz in range(0, 22):
    for gx in range(0, 25):
        x, z = G0x + gx * GS, G0z + gz * GS
        if 0 <= x < W and 0 <= z < H and gridm[z, x]:
            jx = int(round(math.sin(gz * 1.7 + gx * 0.3) * 1.6)); jz = int(round(math.cos(gx * 1.3 + gz * 0.5) * 1.6))  # streets that are not ruler straight
            gnodes[(gx, gz)] = node(x + jx, z + jz)
for (gx, gz), i in gnodes.items():
    for dx, dz in ((1, 0), (0, 1)):
        j = gnodes.get((gx + dx, gz + dz))
        if j is None: continue
        dk = D[(NODES[i][1] + NODES[j][1]) // 2, (NODES[i][0] + NODES[j][0]) // 2]
        style = DIST[dk][2]
        if style == 'suburb' and R.random() < 0.18 and gz % 2: continue  # cul-de-sacs in the suburbs
        w = 3.0 if (gx % 4 == 0 or gz % 4 == 0) and style in ('downtown', 'redlight', 'cafe') else 2.5
        edge(i, j, w)
def gn(gx, gz): return gnodes.get((gx, gz))
for gz in range(0, 22, 2):
    row = sorted([(gx, i) for (gx, gz2), i in gnodes.items() if gz2 == gz])
    for (ga, ia), (gb, ib) in zip(row, row[1:]):
        if gb - ga > 1 and NODES[ib][0] - NODES[ia][0] < 90:
            mid = (NODES[ia][0] + NODES[ib][0]) // 2
            if K[NODES[ia][1], int(mid)] == CREAM or any(K[NODES[ia][1], x] == CREAM for x in range(int(NODES[ia][0]), int(NODES[ib][0]))): edge(ia, ib, 3.0)
def near_grid(x, z):
    best = None; bd = 1e9
    for i in gnodes.values():
        d = math.hypot(NODES[i][0] - x, NODES[i][1] - z)
        if d < bd: bd, best = d, i
    return best

# arterials out of the city (with bends so they wind over the country)
def wind(a, b, n=6, amp=10, seed=0):
    rr = random.Random(seed); pts = [a]
    for i in range(1, n):
        t = i / n; x = a[0] + (b[0] - a[0]) * t; z = a[1] + (b[1] - a[1]) * t
        nx, nz = -(b[1] - a[1]), (b[0] - a[0]); l = math.hypot(nx, nz) or 1
        o = math.sin(t * math.pi) * rr.uniform(-amp, amp); pts.append((x + nx / l * o, z + nz / l * o))
    pts.append(b); return pts
def art(frm, to, w=2.5, seed=0, amp=10, n=8):
    a = frm if isinstance(frm, int) else node(*frm); b = to if isinstance(to, int) else node(*to)
    pts = wind(tuple(NODES[a]), tuple(NODES[b]), n, amp, seed); edge(a, b, w, 'road', [list(p) for p in pts[1:-1]]); return a, b

west = near_grid(300, 300); north = near_grid(470, 214); south = near_grid(470, 528); east = near_grid(680, 300)
# coast highway round the island (the Cum Ring)
RING = [(150, 120), (260, 92), (400, 70), (520, 68), (640, 120), (690, 220), (690, 320), (700, 420), (690, 560), (660, 650), (560, 690), (420, 700), (300, 712), (190, 690), (130, 620), (110, 520), (100, 420), (100, 320), (104, 220)]
ring_nodes = [node(*p) for p in RING]
for i in range(len(ring_nodes)):
    a, b = ring_nodes[i], ring_nodes[(i + 1) % len(ring_nodes)]
    pa, pb = NODES[a], NODES[b]; edge(a, b, 3.0, 'road', [list(p) for p in wind(tuple(pa), tuple(pb), 5, 6, i)[1:-1]])
def link(gn_i, ring_i, seed): art(gn_i, ring_nodes[ring_i], 2.5, seed, 8, 6)
link(west, 18, 1); link(near_grid(300, 440), 16, 2); link(north, 3, 3); link(near_grid(560, 214), 4, 4); link(east, 6, 5)
link(near_grid(680, 420), 7, 6); link(near_grid(660, 540), 8, 7); link(south, 11, 8); link(near_grid(320, 520), 12, 9)
# up to the castles and the peak
cast = node(330, 120); art(ring_nodes[1], cast, 2.5, 21, 6, 6); art(ring_nodes[2], cast, 2.5, 22, 6, 6)
blum = node(610, 128); art(ring_nodes[4], blum, 2.5, 23, 8, 6)
grot = node(196, 148); art(ring_nodes[0], grot, 2.5, 24, 6, 5)
peak = node(470, 92); art(ring_nodes[3], peak, 2.0, 25, 12, 10)
# forest track, asylum, cemetery, quarry, airport, Ejaculand
asy = node(208, 300); art(ring_nodes[18], asy, 2.0, 26, 14, 8); art(asy, west, 2.0, 27, 10, 8)
cem = node(170, 452); art(ring_nodes[16], cem, 2.5, 28, 4, 4)
bon = node(168, 548); art(ring_nodes[15], bon, 2.5, 29, 4, 4)
air = node(300, 650); art(ring_nodes[12], air, 3.0, 30, 3, 3); art(near_grid(320, 520), air, 3.0, 31, 6, 6)
ej = node(520, 600); art(south, ej, 3.0, 32, 4, 4); art(ring_nodes[10], ej, 2.5, 33, 4, 4); art(ring_nodes[11], ej, 2.5, 34, 4, 4)
# the bridge to the Sperm Isles and the island roads
br0 = ring_nodes[5]; br1 = node(752, 236)
edge(br0, br1, 3.0, 'road', [[712, 226], [732, 230]])
isle_c = node(800, 230); art(br1, isle_c, 2.5, 35, 8, 5); vil = node(830, 300); art(isle_c, vil, 2.5, 36, 8, 5); san = node(820, 160); art(isle_c, san, 2.5, 37, 8, 5)

# rasterise the roads
nodeH = {}
def epoints(e):
    pts = [NODES[e['a']]] + e['p'] + [NODES[e['b']]]; out = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]; L = math.hypot(b[0] - a[0], b[1] - a[1]); n = max(1, int(L / 0.5))
        for s in range(n): t = s / n; out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    out.append(tuple(pts[-1])); return out
def hat(x, z):
    xi, zi = int(min(W - 1, max(0, x))), int(min(H - 1, max(0, z))); return hgt[zi, xi]
roadm = np.zeros((H, W), bool); pavem = np.zeros((H, W), bool); roadh = np.full((H, W), np.nan); bridgem = np.zeros((H, W), bool)
for e in EDGES:
    pts = epoints(e); hs = []
    for (x, z) in pts:
        k = K[int(z), int(x)] if 0 <= int(z) < H and 0 <= int(x) < W else SEA
        hs.append(max(hat(x, z), 0.8) if k not in (SEA, WATER, CREAM) else None)
    # bridges: over water the road stays up at deck height
    known = [h for h in hs if h is not None] or [3]
    for i in range(len(hs)):
        if hs[i] is None: hs[i] = max(6.5, max(known[0], known[-1]))
    hs = np.convolve(np.pad(hs, 12, mode='edge'), np.ones(25) / 25, mode='same')[12:-12]
    e['hs'] = [round(float(h), 2) for h in hs[::8]] + [round(float(hs[-1]), 2)]
    r = e['w'] / 2; rp = r + (1.6 if DIST[D[int(pts[len(pts) // 2][1]) % H, int(pts[len(pts) // 2][0]) % W]][2] in ('downtown', 'redlight', 'cafe', 'suburb', 'labs', 'site') else 0)
    for (x, z), h in zip(pts, hs):
        x0, x1, z0, z1 = int(x - rp - 1), int(x + rp + 2), int(z - rp - 1), int(z + rp + 2)
        for zz in range(max(0, z0), min(H, z1)):
            for xx in range(max(0, x0), min(W, x1)):
                d = math.hypot(xx + 0.5 - x, zz + 0.5 - z)
                if d <= r:
                    if K[zz, xx] in (SEA, WATER, CREAM) or bridgem[zz, xx]: bridgem[zz, xx] = True
                    roadm[zz, xx] = True
                    if np.isnan(roadh[zz, xx]) or abs(roadh[zz, xx] - h) > 0: roadh[zz, xx] = h if np.isnan(roadh[zz, xx]) else (roadh[zz, xx] + h) / 2
                elif d <= rp: pavem[zz, xx] = True; roadh[zz, xx] = h if np.isnan(roadh[zz, xx]) else roadh[zz, xx]
for i, n in enumerate(NODES): nodeH[i] = hat(*n)
# terrain under roads follows the road (not on bridges); blend the ground beside it
rm = ~np.isnan(roadh)
hgt[rm & ~bridgem] = roadh[rm & ~bridgem]
near = ndi.binary_dilation(rm, iterations=6) & ~rm
idx = ndi.distance_transform_edt(~rm, return_distances=False, return_indices=True)
nh = roadh[idx[0], idx[1]]; dd = ndi.distance_transform_edt(~rm)
blend = np.clip(dd / 7.0, 0, 1)
ok = near & ~np.isnan(nh) & land
hgt[ok] = nh[ok] * (1 - blend[ok]) + hgt[ok] * blend[ok]
K[pavem & ~roadm & land & (K != CREAM)] = PAVE
hgt[bridgem] = roadh[bridgem]
K[roadm & ~bridgem] = ROAD
K[bridgem] = BRIDGE

# ---------------------------------------------------------------- buildings
B = []  # [x0, z0, x1, z1, h, style, front dir (0 n,1 e,2 s,3 w), shop id or '']
occ = np.zeros((H, W), bool)
def free(x0, z0, x1, z1):
    if x0 < 1 or z0 < 1 or x1 >= W - 1 or z1 >= H - 1: return False
    sub = K[z0:z1, x0:x1]
    return not occ[z0:z1, x0:x1].any() and np.isin(sub, [GRASS, LOT, FIELD, FOREST, DIRT, YARD, PARK, SAND, GRAVE]).all()
def put(x0, z0, x1, z1, h, style, front=2, shop='', kind=LOT, gap=0):
    B.append([int(x0), int(z0), int(x1), int(z1), round(h, 1), style, front, shop]); occ[z0 - gap:z1 + gap, x0 - gap:x1 + gap] = True
    K[z0:z1, x0:x1] = kind
    return len(B) - 1
def front_of(x0, z0, x1, z1):
    best = 2; bd = 99
    for d, (xx, zz) in enumerate([((x0 + x1) // 2, z0 - 2), (x1 + 1, (z0 + z1) // 2), ((x0 + x1) // 2, z1 + 1), (x0 - 2, (z0 + z1) // 2)]):
        for s in range(1, 6):
            px = xx + [0, s, 0, -s][d]; pz = zz + [-s, 0, s, 0][d]
            if 0 <= px < W and 0 <= pz < H and K[pz, px] in (ROAD, PAVE):
                if s < bd: bd, best = s, d
                break
    return best
STY = {'downtown': (14, 54), 'redlight': (8, 18), 'cafe': (7, 14), 'site': (4, 30), 'suburb': (5, 7), 'industrial': (8, 16), 'docks': (7, 12), 'labs': (10, 26), 'park': (6, 12), 'airport': (8, 14)}
# fill each grid block with buildings round its edge (backs together), parks and car parks now and then
gxs = sorted(set(k[0] for k in gnodes)); gzs = sorted(set(k[1] for k in gnodes))
for (gx, gz), i in gnodes.items():
    if (gx + 1, gz + 1) not in gnodes: continue
    x0, z0 = NODES[i][0] + 3, NODES[i][1] + 3; x1, z1 = x0 + GS - 6, z0 + GS - 6
    dk = D[(z0 + z1) // 2, (x0 + x1) // 2]; style = DIST[dk][2]
    if style not in STY: continue
    blk = K[z0:z1, x0:x1]
    if (blk == CREAM).any() or (blk == ROAD).any(): continue
    lo, hi = STY[style]; r = R.random()
    if style in ('downtown', 'cafe', 'redlight') and r < 0.08:
        K[z0:z1, x0:x1] = PARK; continue
    if style in ('downtown', 'industrial', 'docks') and r < 0.12:
        K[z0:z1, x0:x1] = YARD; B.append([x0, z0, x1, z1, 0, 'carpark', 2, '']); continue
    if style == 'site':  # the Cumstruction Site: half-built towers, cranes, dirt
        K[z0:z1, x0:x1] = DIRT
        if R.random() < 0.6: put(x0 + 2, z0 + 2, x1 - 2, z1 - 2, R.uniform(10, 34), 'frame', 2)
        continue
    if style == 'suburb':  # houses with gardens and drives
        for (hx, hz) in ((x0, z0), (x0 + 6, z0), (x0, z0 + 6), (x0 + 6, z0 + 6)):
            if hx + 5 <= x1 and hz + 5 <= z1:
                K[hz:hz + 6, hx:hx + 6] = GRASS
                bi = put(hx + 1, hz + 1, hx + 5, hz + 5, R.choice([5, 5.5, 7.5]), 'house', front_of(hx + 1, hz + 1, hx + 5, hz + 5))
        continue
    if style == 'industrial' and R.random() < 0.5:
        put(x0, z0, x1, z1, R.uniform(lo, hi), 'shed', front_of(x0, z0, x1, z1), kind=YARD); continue
    if style == 'labs':
        put(x0 + 1, z0 + 1, x1 - 1, z1 - 1, R.uniform(lo, hi), 'lab', front_of(x0, z0, x1, z1)); continue
    # perimeter buildings
    K[z0:z1, x0:x1] = LOT
    cuts_x = [x0]; x = x0
    while x < x1 - 3: x += R.randint(3, 6); cuts_x.append(min(x, x1))
    cuts_x[-1] = x1
    dep = (z1 - z0) // 2
    for a, b in zip(cuts_x, cuts_x[1:]):
        if b - a < 2: continue
        put(a, z0, b, z0 + dep, R.uniform(lo, hi), style, 0); put(a, z0 + dep, b, z1, R.uniform(lo, hi), style, 2)

# ---------------------------------------------------------------- shops: every shop front gets a building facing a road
SHOPS = [  # id, name, district, quote, sells
    ('club', 'The Clubhouse', 'club'), ('saba', "Saba's Hitless Hemporium", 'club'), ('pulsar', 'PulsarOctopus Beats', 'club'), ('arcade', 'Potbelly Arcade', 'club'),
    ('sanct', "Spermaid's Sanctum Stall", 'club'), ('t', "T's Hussy House", 'red'), ('bonjo', "Bonjo's BJ Boutique", 'red'), ('tb', "TB's Suck n' Fuck", 'red'),
    ('cafe', "Kaya & Elden's Cum Café", 'cafe'), ('greebo', "Greebo's Gourmet Goonery", 'cafe'), ('amy', "Amy's Willy Chilli", 'cafe'), ('joff', "Joff's Pineapple Pizzaria", 'cafe'),
    ('beebs', "Uncle Beeb's Tavern", 'cafe'), ('ali', "Ali's Garlic Grub", 'cafe'), ('harold', "Harold's Mad Tea Party", 'cafe'), ('jessiah', "Jessiah's", 'club'),
    ('natty', 'Nattyboro Enchanting', 'red'), ('judge', 'Judgement Spells', 'red'), ('fate', "Stacked Fate's Table", 'red'), ('bates', 'Master Bates Emporium', 'club'),
    ('motors', 'Cum Motors', 'docks'), ('estate', 'Load Estates', 'club'), ('wash', 'The Cream Wash', 'factory'), ('wash2', 'The Cream Wash', 'hills'), ('cops', 'Cum City Police', 'club'),
    ('hosp', 'Cum City Hospital', 'cafe'), ('gym', 'Iron Loads Gym', 'red'), ('bank', 'Bank of Cum City', 'club'), ('tattoo', 'Inked Loads Tattoos', 'red'),
]
shopB = {}
cand = {}
for bi, b in enumerate(B):
    if b[5] in ('downtown', 'redlight', 'cafe', 'industrial', 'docks', 'shed', 'house', 'suburb') and b[4] > 0: cand.setdefault(DIST[D[(b[1] + b[3]) // 2, (b[0] + b[2]) // 2]][0], []).append(bi)
for sid, name, dk in SHOPS:
    L = [bi for bi in cand.get(dk, []) if bi not in shopB.values() and B[bi][2] - B[bi][0] >= 3 and B[bi][7] == '']
    # face the road: front 0 means the building's north side faces the road
    L.sort(key=lambda bi: R.random())
    for bi in L:
        b = B[bi]; f = front_of(b[0], b[1], b[2], b[3])
        b[6] = f; b[7] = sid; shopB[sid] = bi; break

# houses for sale (Load Estates sells them): some houses in Cum Hills, a flat downtown, a beach house, a villa on the isles
HOUSES = []
hb = [bi for bi, b in enumerate(B) if b[5] == 'house']; R.shuffle(hb)
for k, bi in enumerate(hb[:5]): B[bi][7] = 'home%d' % k; HOUSES.append({'id': 'home%d' % k, 'b': bi, 'name': ['Cum Hills Starter', 'Cum Hills Family Home', 'Cul-de-Sac Bungalow', 'Load Lane Semi', 'Creamy Close Detached'][k], 'cost': [8000, 15000, 12000, 20000, 28000][k]})
dt = [bi for bi, b in enumerate(B) if b[5] == 'downtown' and b[7] == '' and b[4] > 36]
if dt: B[dt[0]][7] = 'home5'; HOUSES.append({'id': 'home5', 'b': dt[0], 'name': 'Clubhouse Row Penthouse', 'cost': 90000})

# ---------------------------------------------------------------- landmarks and places (POIs)
POI = []
def poi(kind, x, z, **kw):
    d = {'k': kind, 'x': round(float(x), 1), 'z': round(float(z), 1)}; d.update(kw); POI.append(d); return d
def flat(x0, z0, x1, z1, h=None, kind=None):
    sub = hgt[z0:z1, x0:x1]; hh = float(np.median(sub)) if h is None else h; hgt[z0:z1, x0:x1] = hh
    if kind is not None: K[z0:z1, x0:x1] = kind
    return hh
# castles on their hills
hc = flat(310, 96, 352, 140, kind=PAVE); poi('castle', 331, 118, h=hc, name="Cumhead's Castle", dark=0); poi('dungeon', 331, 142, h=hc, name='The Cum Dungeons')
hb2 = flat(590, 104, 632, 146, kind=ROCK); poi('castle', 611, 125, h=hb2, name="Blumhead's Castle", dark=1)
hg = flat(178, 128, 214, 162, kind=GRASS); poi('grotto', 196, 140, h=hg, name="Greebo's Grotto")
hp = flat(462, 70, 482, 90, kind=ROCK); poi('altar', 472, 80, h=hp, name='The Crimson Moon Altar')
ha = flat(196, 286, 224, 314, kind=PAVE); poi('asylum', 210, 300, h=ha, name='Cumwood Asylum')
poi('chapel', 170, 440, h=flat(162, 430, 180, 448, kind=PAVE), name='Cemetery Chapel')
poi('quarry', 168, 548, h=float(hgt[548, 168]), name='The Bone Pit')
# the airport: a runway, terminal, hangars, tower
rw = flat(206, 628, 384, 646, kind=RUNWAY); flat(206, 646, 384, 690, h=rw, kind=YARD)
poi('runway', 295, 637, h=rw, x0=206, x1=384, z0=628, z1=646); poi('terminal', 250, 668, h=rw); poi('hangar', 310, 672, h=rw); poi('hangar', 340, 672, h=rw); poi('tower', 370, 660, h=rw)
# Ejaculand
he = flat(440, 600, 604, 700, kind=PAVE)
for k2, (x, z) in {'ferris': (470, 630), 'coaster': (560, 640), 'carousel': (500, 660), 'clock': (520, 618), 'flume': (590, 676), 'gate': (520, 602), 'bigtop': (465, 682), 'dropper': (580, 610)}.items(): poi(k2, x, z, h=he)
for z in range(700, 744):
    for x in range(514, 526): K[z, x] = PIER; hgt[z, x] = 3.5
poi('pierend', 520, 742, h=3.5)
# the docks: cranes, containers, the ferry pier
for x, z in ((690, 440), (692, 480), (692, 520)): poi('crane', x, z, h=float(hgt[z, x]))
hd = flat(600, 420, 680, 556, kind=YARD)
for i in range(26): poi('containers', R.uniform(610, 676), R.uniform(430, 550), h=hd, a=R.choice([0, 1.5708]), n=R.randint(1, 3))
# factory chimneys, labs dome, site cranes
for x, z in ((600, 210), (640, 230), (620, 270)): poi('chimney', x, z, h=float(hgt[z, x]))
poi('dome', 506, 254, h=flat(494, 242, 518, 266, kind=PAVE), name='Spunk Brain Labs')
for x, z in ((330, 310), (370, 350)): poi('crane2', x, z, h=float(hgt[z, x]))
# the isles
poi('sanctum', 822, 168, h=flat(812, 158, 832, 178, kind=SAND), name="Spermaid's Sanctum")
poi('lighthouse', 862, 86, h=float(hgt[86, 862]))
poi('volcano', 812, 452, h=float(hgt[452, 812]))
poi('cove', 772, 640, h=float(hgt[640, 772]), name='Pirate Cove')
for i in range(9): poi('hut', 830 + R.uniform(-22, 22), 300 + R.uniform(-18, 18), h=float(hgt[300, 830]))
# the Cream Sewers and the outfall
for x, z in ((470, 330), (520, 380), (500, 460), (600, 340), (350, 420)): poi('manhole', x, z, h=float(hgt[z, x]))
poi('outfall', 404, 690, h=1.5, name='The Cream Sewers')
# helipads, boat ramps, bus stops
poi('helipad', 520, 360, h=60.0, roof=1); poi('helipad', 300, 690, h=rw); poi('helipad', 660, 260, h=float(hgt[260, 660]))
for x, z in ((706, 480), (530, 712), (760, 250), (420, 690)): poi('boats', x, z, h=1.0)
# lamps along roads in the city and the stunt jumps: ramps where roads run straight
lamps = []
for e in EDGES:
    pts = epoints(e)
    for i in range(0, len(pts), 44):
        x, z = pts[i]; dk = DIST[D[int(z) % H, int(x) % W]][2]
        if dk in ('downtown', 'redlight', 'cafe', 'suburb', 'labs', 'park', 'industrial', 'docks', 'site') or i % 88 == 0:
            if i + 1 < len(pts): dx, dz = pts[i + 1][0] - x, pts[i + 1][1] - z
            else: dx, dz = 1, 0
            l = math.hypot(dx, dz) or 1; s = e['w'] / 2 + 0.9
            lamps.append([round(x - dz / l * s, 1), round(z + dx / l * s, 1)])

# ---------------------------------------------------------------- write
def rle(a):
    a = a.astype(np.uint8).ravel(); out = bytearray(); i = 0; n = len(a)
    while i < n:
        v = a[i]; j = i
        while j < n and j - i < 255 and a[j] == v: j += 1
        out += bytes([j - i, v]); i = j
    return base64.b64encode(bytes(out)).decode()
hq = np.clip(np.round((hgt + 4) * 4), 0, 255)  # quarter metres from -4 m
data = {'W': W, 'H': H, 'T': 4, 'K': rle(K), 'Hq': rle(hq), 'D': rle(D), 'dist': [[d[0], d[1], d[2]] for d in DIST],
        'nodes': [[round(n[0], 1), round(n[1], 1)] for n in NODES], 'edges': [[e['a'], e['b'], e['w'], [[round(p[0], 1), round(p[1], 1)] for p in e['p']], e['hs']] for e in EDGES],
        'bld': B, 'poi': POI, 'lamps': lamps, 'houses': HOUSES, 'shops': [[s[0], s[1], shopB.get(s[0], -1)] for s in SHOPS], 'grid': [G0x, G0z, GS]}
js = '/* Cum City, laid out by tools/city/mapgen.py: do not edit by hand */\nvar CITY = ' + json.dumps(data, separators=(',', ':')) + ';\n'
open(OUT, 'w').write(js); print('wrote', OUT, len(js), 'bytes; nodes', len(NODES), 'edges', len(EDGES), 'buildings', len(B), 'pois', len(POI), 'lamps', len(lamps))
missing = [s[0] for s in SHOPS if s[0] not in shopB]
print('shops placed', len(shopB), 'missing', missing)
# preview
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
for d in DIST:
    if d[3]: cx = sum(p[0] for p in d[3]) / len(d[3]); cz = sum(p[1] for p in d[3]) / len(d[3]); dr.text((cx - 20, cz), d[1], fill=(255, 255, 255))
pim = pim.resize((W * 2, H * 2), Image.NEAREST); pim.save('/home/claude/ck/citymap.png'); print('preview /home/claude/ck/citymap.png')
