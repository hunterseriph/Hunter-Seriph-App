"""Profile portraits: one 64x64 head-and-shoulders bust per character, like the portraits in Final Fantasy VII's menu,
but in our pixel style. Each bust is cut from the character's own sprite (never redrawn), scaled up with Scale2x/Scale3x
so the pixels stay crisp, outlined, lit from the top left, and set on a dark banded backdrop.
Writes www/assets/portraits.png and the portrait list inside www/games/profile.js."""
import os, sys, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); TOOLS = os.path.dirname(HERE); APP = os.path.dirname(TOOLS)
sys.path.insert(0, os.path.join(TOOLS, 'newgames')); sys.path.insert(0, TOOLS)
import art as A
SZ = 64; OUT = (18, 4, 10, 255)
# id, name, sprite, crop (x0, y0, x1, y1) in sprite pixels or None for auto (top part), group, backdrop colour
P = [
    ('cumhead', 'Cumhead', 'ch_idle0', None, 'Heroes', '#c4121c'), ('spermaid', 'Spermaid', 'npc_spermaid', None, 'Heroes', '#3ab4c8'),
    ('greebo', 'Greebo', 'npc_greebo', None, 'Heroes', '#c8862a'), ('amy', 'Amy', 'npc_amy', None, 'Town', '#ff6ab4'),
    ('tb', 'TB', 'npc_tb', None, 'Town', '#8a5a2a'), ('saba', 'Saba', 'npc_saba', None, 'Town', '#3a9a2a'), ('joff', 'Joff', 'npc_joff', None, 'Town', '#ffe36a'),
    ('kaya', 'Kaya', 'npc_kaya', None, 'Town', '#8a3a20'), ('elden', 'Elden', 'npc_elden', None, 'Town', '#7a4a20'), ('beebs', 'Uncle Beeb', 'npc_beebs', None, 'Town', '#a8601e'),
    ('ali', 'Ali', 'npc_ali', None, 'Town', '#5aa82a'), ('potbelly', 'Potbelly', 'npc_potbelly', None, 'Town', '#ff9ab4'), ('t', 'T', 'npc_t', None, 'Town', '#c4121c'),
    ('bonjo', 'Bonjo', 'npc_bonjo', None, 'Town', '#9a3ad8'), ('pulsar', 'PulsarOctopus', 'npc_pulsar', None, 'Town', '#3a8ac8'), ('harold', 'Harold', 'npc_harold', None, 'Town', '#c8903a'),
    ('jessiah', 'Jessiah', 'npc_jessiah', None, 'Town', '#7a6a58'), ('nattyboro', 'Nattyboro', 'npc_nattyboro', None, 'Town', '#5a3ad8'), ('judgement', 'Judgement', 'npc_judgement', None, 'Town', '#d8d0c8'),
    ('stackedfate', 'Stacked Fate', 'npc_stackedfate', None, 'Town', '#d878ff'), ('masterbates', 'Master Bates', 'npc_masterbates', None, 'Town', '#6a646c'),
    ('steve', 'Steve', 'steve0', None, 'Town', '#ff2630'), ('sirj', 'Sir Johnathan', 'f_sirj_0', None, 'Town', '#9adf5a'),
    ('blum', 'Blumhead', 'f_blum_0', None, 'Villains', '#5a0a3a'), ('kingblum', 'King Blumhead', 'f_kingblum_0', None, 'Villains', '#ffe36a'),
    ('gloop_baby', 'Gloop (baby)', 'h_gloop_baby_idle0', None, 'Homunculi', '#3fb43a'), ('gloop_teen', 'Gloop (teen)', 'h_gloop_teen_idle0', None, 'Homunculi', '#3fb43a'),
    ('gloop', 'Gloop', 'h_gloop_adult_idle0', None, 'Homunculi', '#3fb43a'),
]
BREEDS = [('guard', 'Bulwark', '#d8d0c8'), ('ember', 'Embertail', '#ff7a20'), ('frost', 'Frostbite', '#9adfff'), ('volt', 'Voltling', '#ffe36a'), ('medic', 'Mendling', '#f1e7d0'),
          ('leech', 'Leechling', '#c4121c'), ('scout', 'Peeper', '#9a3ad8'), ('goldie', 'Goldie', '#ffc840'), ('titan', 'Titan', '#a8601e'), ('blood', 'Bloodmoon', '#ff2630')]
for b, n, c in BREEDS: P.append(('hom_' + b, n, 'h_%s_adult_idle0' % b, None, 'Homunculi', c))

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def bbox(im):
    b = im.getbbox(); return b or (0, 0, im.width, im.height)
def scale2x(im):
    w, h = im.size; s = im.load(); o = Image.new('RGBA', (w * 2, h * 2)); d = o.load()
    g = lambda x, y: s[min(max(x, 0), w - 1), min(max(y, 0), h - 1)]
    for y in range(h):
        for x in range(w):
            P0 = g(x, y); B, D, F, H = g(x, y - 1), g(x - 1, y), g(x + 1, y), g(x, y + 1)
            e0 = D if (D == B and B != F and D != H) else P0; e1 = F if (B == F and B != D and F != H) else P0
            e2 = D if (D == H and D != B and H != F) else P0; e3 = F if (H == F and D != H and B != F) else P0
            d[2 * x, 2 * y] = e0; d[2 * x + 1, 2 * y] = e1; d[2 * x, 2 * y + 1] = e2; d[2 * x + 1, 2 * y + 1] = e3
    return o
def bust(src, crop, whole=False):
    im = src.convert('RGBA'); x0, y0, x1, y1 = bbox(im)
    if crop: x0, y0, x1, y1 = crop
    elif not whole:  # head and shoulders: at most 32 pixels square, centred on the head
        w = x1 - x0; H = min(y1 - y0, max(int(w * 1.1), 24), 32)
        if w > 32: c = (x0 + x1) // 2; x0, x1 = c - 16, c + 16
        y1 = y0 + H
    im = im.crop((x0, y0, x1, y1)); k = max(im.width, im.height)
    if k <= 21: im = im.resize((im.width * 3, im.height * 3), Image.NEAREST)
    elif k <= 32: im = scale2x(im)
    else: f = 62 / k; im = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.NEAREST)
    return im
def shade(im):
    w, h = im.size; s = im.load(); o = im.copy(); d = o.load()
    solid = lambda x, y: 0 <= x < w and 0 <= y < h and s[x, y][3] > 0
    for y in range(h):
        for x in range(w):
            if not solid(x, y): continue
            r, g, b, a = s[x, y]
            if not solid(x - 2, y - 2) or not solid(x - 1, y - 1): k = 1.18      # light from the top left
            elif not solid(x + 2, y + 2) or not solid(x + 1, y + 1): k = 0.78    # shadow side
            else: k = 1.0
            d[x, y] = (min(255, int(r * k)), min(255, int(g * k)), min(255, int(b * k)), 255)
    # dark outline round the silhouette
    o2 = Image.new('RGBA', (w + 2, h + 2)); o2.paste(o, (1, 1)); q = o2.load(); m = o2.copy(); mm = m.load()
    for y in range(h + 2):
        for x in range(w + 2):
            if q[x, y][3] == 0 and any(0 <= x + dx < w + 2 and 0 <= y + dy < h + 2 and q[x + dx, y + dy][3] > 0 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): mm[x, y] = OUT
    return m
def backdrop(col):
    c = hexc(col); bg = Image.new('RGBA', (SZ, SZ)); px = bg.load()
    tones = [(int(c[0] * k + 7 * (1 - k)), int(c[1] * k + 4 * (1 - k)), int(c[2] * k + 5 * (1 - k)), 255) for k in (0.42, 0.3, 0.2, 0.12)]
    for y in range(SZ):
        for x in range(SZ):
            d = ((x - SZ * 0.42) ** 2 + (y - SZ * 0.4) ** 2) ** 0.5 / SZ; band = 0 if d < 0.3 else 1 if d < 0.48 else 2 if d < 0.62 else 3
            if band < 3 and ((x + y) % 2) and abs(d - (0.3, 0.48, 0.62)[band]) < 0.02: band += 1  # dithered edges between bands
            px[x, y] = tones[min(band, 3)]
    return bg
def main():
    base = A.base(); cols = 8; rows = (len(P) + cols - 1) // cols; sheet = Image.new('RGBA', (cols * SZ, rows * SZ)); meta = []
    for i, (pid, name, spr, crop, grp, col) in enumerate(P):
        b = shade(bust(base[spr], crop, pid in ('gloop_baby', 'steve', 'sirj', 'blum', 'kingblum'))); cell = backdrop(col); x = (SZ - b.width) // 2; y = SZ - b.height
        cell.alpha_composite(b, (x, max(0, y))); sheet.paste(cell, ((i % cols) * SZ, (i // cols) * SZ))
        meta.append({'id': pid, 'n': name, 'g': grp, 'i': i})
    sheet.save(os.path.join(APP, 'www', 'assets', 'portraits.png'), optimize=True)
    pj = os.path.join(APP, 'www', 'games', 'profile.js'); src = open(pj, encoding='utf-8').read()
    import re
    src = re.sub(r'/\*PORTRAITS\*/.*?/\*END\*/', lambda m: '/*PORTRAITS*/' + json.dumps(meta, separators=(',', ':')) + '/*END*/', src, flags=re.S)
    open(pj, 'w', encoding='utf-8').write(src)
    print('portraits', len(P))
if __name__ == '__main__': main()
