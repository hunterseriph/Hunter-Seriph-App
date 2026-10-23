"""Shared pixel-art toolkit for the games' generated sprites (homunculus, enemies, bosses).

Draw shapes into a Grid of material names, then render() turns materials into colours: shaded materials
get three tones lit from the top left (and a darker tone where they meet a different material underneath),
flat materials get one colour, and every figure gets the house outline (#12040a).
"""
import math
from PIL import Image

OUT = (18, 4, 10)

def hx(s):
    s = s.lstrip('#'); return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))

class Grid:
    def __init__(self, w, h):
        self.w, self.h = w, h; self.m = [[None] * w for _ in range(h)]
    def put(self, x, y, mat, over=True):
        x, y = int(math.floor(x + 0.5)), int(math.floor(y + 0.5))
        if 0 <= x < self.w and 0 <= y < self.h and (over or self.m[y][x] is None): self.m[y][x] = mat
    def get(self, x, y):
        return self.m[y][x] if 0 <= x < self.w and 0 <= y < self.h else None
    def ellipse(self, cx, cy, rx, ry, mat, over=True, fn=None):
        for y in range(max(0, int(cy - ry - 1)), min(self.h, int(cy + ry + 2))):
            for x in range(max(0, int(cx - rx - 1)), min(self.w, int(cx + rx + 2))):
                dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
                if dx * dx + dy * dy <= 1.0:
                    m = fn(x, y) if fn else mat
                    if m is not None and (over or self.m[y][x] is None): self.m[y][x] = m
    def line(self, x0, y0, x1, y1, mat, r=0.5, over=True):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
        for i in range(n + 1):
            t = i / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            if r <= 0.5: self.put(x, y, mat, over)
            else:
                rr = int(math.ceil(r))
                for yy in range(-rr, rr + 1):
                    for xx in range(-rr, rr + 1):
                        if xx * xx + yy * yy <= r * r: self.put(x + xx, y + yy, mat, over)
    def rect(self, x, y, w, h, mat, over=True):
        for yy in range(int(h)):
            for xx in range(int(w)): self.put(x + xx, y + yy, mat, over)
    def poly(self, pts, mat, over=True):
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        for y in range(max(0, int(min(ys))), min(self.h, int(max(ys)) + 1)):
            for x in range(max(0, int(min(xs))), min(self.w, int(max(xs)) + 1)):
                px, py = x + 0.5, y + 0.5; inside = False; j = len(pts) - 1
                for i in range(len(pts)):
                    xi, yi = pts[i]; xj, yj = pts[j]
                    if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / ((yj - yi) or 1e-9) + xi: inside = not inside
                    j = i
                if inside and (over or self.m[y][x] is None): self.m[y][x] = mat
    def text(self, x, y, s, mat):
        """3x5 pixel font for shirt slogans and signs"""
        for ch in s:
            g = FONT.get(ch.upper())
            if g:
                for ry, row in enumerate(g):
                    for rx, c in enumerate(row):
                        if c == '1': self.put(x + rx, y + ry, mat)
            x += 4
    def flip(self):
        g = Grid(self.w, self.h); g.m = [list(reversed(r)) for r in self.m]; return g

FONT = {
    'A': ['010', '101', '111', '101', '101'], 'B': ['110', '101', '110', '101', '110'], 'D': ['110', '101', '101', '101', '110'],
    'E': ['111', '100', '110', '100', '111'], 'H': ['101', '101', '111', '101', '101'], 'L': ['100', '100', '100', '100', '111'],
    'O': ['010', '101', '101', '101', '010'], 'R': ['110', '101', '110', '101', '101'], 'S': ['011', '100', '010', '001', '110'],
    'T': ['111', '010', '010', '010', '010'], 'X': ['101', '101', '010', '101', '101'], 'C': ['011', '100', '100', '100', '011'],
    'N': ['101', '111', '111', '101', '101'], 'U': ['101', '101', '101', '101', '111'], 'P': ['110', '101', '110', '100', '100'],
}

def render(g, pal, outline=True):
    """pal: material -> '#hex' (flat) or ('#hi', '#mid', '#lo') (shaded)"""
    P = {k: ([hx(c) for c in v] if isinstance(v, (tuple, list)) else hx(v)) for k, v in pal.items()}
    img = Image.new('RGBA', (g.w, g.h), (0, 0, 0, 0)); px = img.load()
    def solid(x, y): return g.get(x, y) is not None
    for y in range(g.h):
        for x in range(g.w):
            m = g.m[y][x]
            if m is None: continue
            c = P.get(m, (255, 0, 255))
            if isinstance(c, list):
                # bevel: shade where the part ends below or to the right, light where it starts above or to the left
                tone = 1
                if g.get(x + 1, y) != m or g.get(x, y + 1) != m or g.get(x + 1, y + 1) != m: tone = 2
                elif g.get(x - 1, y) != m or g.get(x, y - 1) != m: tone = 0
                c = c[tone]
            px[x, y] = c + (255,)
    if not outline: return img
    out = img.copy(); po = out.load()
    for y in range(g.h):
        for x in range(g.w):
            if g.m[y][x] is None and any(solid(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                po[x, y] = OUT + (255,)
    return out

def pack(frames, width=1024):
    """frames: name -> image. Returns sheet, {name: [x, y, w, h]}"""
    x = y = rowh = 0; pos = {}
    for n, im in frames.items():
        if x + im.width > width: x = 0; y += rowh + 1; rowh = 0
        pos[n] = [x, y, im.width, im.height]; x += im.width + 1; rowh = max(rowh, im.height)
    sheet = Image.new('RGBA', (width, y + rowh + 1), (0, 0, 0, 0))
    for n, (px, py, w, h) in pos.items(): sheet.paste(frames[n], (px, py))
    return sheet, pos

def preview(rows, path, scale=4, bg=(34, 20, 22, 255)):
    rh = max(max(t.height for t in r) for r in rows) * scale + 8
    rw = max(sum(t.width * scale + 8 for t in r) for r in rows)
    pv = Image.new('RGBA', (rw, rh * len(rows)), bg)
    for i, r in enumerate(rows):
        x = 0
        for t in r:
            big = t.resize((t.width * scale, t.height * scale), Image.NEAREST); pv.paste(big, (x, i * rh + rh - big.height - 4), big); x += big.width + 8
    pv.save(path)
