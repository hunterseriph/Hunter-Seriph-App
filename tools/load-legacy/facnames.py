#!/usr/bin/env python3
"""Bakes the shop names into the marquee of the town shop fronts that came without one (fac_joff, fac_bonjo,
fac_pulsar, fac_saba, fac_sanct), exactly where Cumheads Quest writes them (same two lines, same colours), so
every game that uses these sprites (Load Legacy, Kart, Journey to the Void, Spermhog and any new one) shows the
name on the building itself. Never draw shop names over or above these sprites in game code.
Reads sprites-base.png (the unnamed originals), writes sprites.png. Run it, then rebuild the games."""
import json, os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
# a chunky 4x5 pixel font (narrow letters stay 3 wide)
F = {
 'A': ['.##.', '#..#', '####', '#..#', '#..#'], 'B': ['###.', '#..#', '###.', '#..#', '###.'], 'C': ['.###', '#...', '#...', '#...', '.###'],
 'D': ['###.', '#..#', '#..#', '#..#', '###.'], 'E': ['####', '#...', '###.', '#...', '####'], 'F': ['####', '#...', '###.', '#...', '#...'],
 'G': ['.###', '#...', '#.##', '#..#', '.###'], 'H': ['#..#', '#..#', '####', '#..#', '#..#'], 'I': ['###', '.#.', '.#.', '.#.', '###'],
 'J': ['..##', '...#', '...#', '#..#', '.##.'], 'K': ['#..#', '#.#.', '##..', '#.#.', '#..#'], 'L': ['#...', '#...', '#...', '#...', '####'],
 'M': ['#...#', '##.##', '#.#.#', '#...#', '#...#'], 'N': ['#..#', '##.#', '#.##', '#..#', '#..#'], 'O': ['.##.', '#..#', '#..#', '#..#', '.##.'],
 'P': ['###.', '#..#', '###.', '#...', '#...'], 'Q': ['.##.', '#..#', '#..#', '#.#.', '.#.#'], 'R': ['###.', '#..#', '###.', '#.#.', '#..#'],
 'S': ['.###', '#...', '.##.', '...#', '###.'], 'T': ['###', '.#.', '.#.', '.#.', '.#.'], 'U': ['#..#', '#..#', '#..#', '#..#', '.##.'],
 'V': ['#..#', '#..#', '#..#', '.##.', '.##.'], 'W': ['#...#', '#...#', '#.#.#', '##.##', '#...#'], 'X': ['#..#', '#..#', '.##.', '#..#', '#..#'],
 'Y': ['#.#', '#.#', '.#.', '.#.', '.#.'], 'Z': ['####', '...#', '.##.', '#...', '####'], "'": ['#', '#', '.', '.', '.'], '&': ['.#..', '#.#.', '.#.#', '#.#.', '.#.#'],
 ' ': ['..', '..', '..', '..', '..'],
}
# id: (line 1, line 2, colour 1, colour 2) as Cumheads Quest's FACLAB
LABELS = {'fac_joff': ("JOFF'S", 'PIZZERIA', '#f1e7d0', '#ffe36a'), 'fac_bonjo': ("BONJO'S", 'BOUTIQUE', '#f1e7d0', '#ffe36a'),
          'fac_pulsar': ('PULSAR', 'BEATS', '#f1e7d0', '#ffe36a'), 'fac_saba': ("SABA'S", 'HEMPORIUM', '#f1e7d0', '#ffe36a'),
          'fac_sanct': ('SPERMAID', 'SANCTUM', '#7af0ff', '#ff6ab0')}
def hexc(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
def width(s): return sum(len(F[c][0]) + 1 for c in s) - 1
def put(px, s, x, y, col):
    for c in s:
        g = F[c]
        for ry, row in enumerate(g):
            for rx, v in enumerate(row):
                if v == '#': px[x + rx, y + ry] = col
        x += len(g[0]) + 1
spr = json.load(open(os.path.join(HERE, 'sprites.json'))); sheet = Image.open(os.path.join(HERE, 'sprites-base.png')).convert('RGBA'); px = sheet.load()
for k, (a, b, ca, cb) in LABELS.items():
    x0, y0, w, h = spr[k]; bandc = None; top = None
    for y in range(h):  # the marquee: the first tall run of one dark colour under the roof line
        c = px[x0 + w // 2, y0 + y]
        if c[3] and sum(c[:3]) < 90 and all(px[x0 + w // 2, y0 + y + i] == c for i in range(10)): top, bandc = y, c; break
    xs = [x for x in range(w) if px[x0 + x, y0 + top + 4] == bandc]; l, r = min(xs), max(xs)
    for line, y, col in ((a, top + 1, ca), (b, top + 7, cb)):
        put(px, line, x0 + l + (r - l + 1 - width(line)) // 2, y0 + y, hexc(col))
    print(k, 'marquee row', top, 'cols', l, r)
sheet.save(os.path.join(HERE, 'sprites.png'))
