#!/usr/bin/env python3
"""Update 184: the new sprites for Spermaid Survivors (new characters' portraits, weapons, charms, pickups, shots),
drawn as pixel art in the game's palette, and added to the sheet inside www/games/spermaid-survivors.html.
Run once: python3 sprites184.py  (it skips anything already in the sheet)."""
import re, json, base64, io, os, sys, math
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
GAME = os.path.join(ROOT, 'www', 'games', 'spermaid-survivors.html')
KART = os.path.join(ROOT, 'www', 'games', 'cumhead-kart.html')
INK = (18, 4, 10, 255); CREAM = (241, 231, 208, 255); RED = (196, 18, 28, 255); HOT = (255, 38, 48, 255); GOLD = (255, 227, 106, 255)
BONE = (216, 200, 168, 255); BROWN = (106, 58, 26, 255); TAN = (200, 144, 58, 255); PINK = (255, 106, 180, 255); GREY = (150, 150, 160, 255)
DARK = (58, 58, 64, 255); WHITE = (255, 255, 255, 255); GREEN = (90, 168, 42, 255); BLUE = (106, 138, 255, 255); PURP = (192, 138, 255, 255)

def read(f):
    s = open(f, encoding='utf-8').read(); i = s.index('SPR = {') + 6; S, end = json.JSONDecoder().raw_decode(s[i:])
    m = re.search(r'SHEET\.src = "data:image/png;base64,([^"]+)"', s)
    return s, S, i, i + end, m, Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert('RGBA')

def outline(im):
    """a 1px dark outline round everything drawn, like the rest of the sheet"""
    w, h = im.size; px = im.load(); o = im.copy(); po = o.load()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0 and any(0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] > 0 and px[x + dx, y + dy] != INK for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                po[x, y] = INK
    return o

def new(w, h): im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); return im, ImageDraw.Draw(im)
def shine(d, x, y): d.point((x, y), WHITE)

def heart(w=16, h=16, col=HOT, hi=PINK):
    im, d = new(w, h); cx = w / 2
    for y in range(h):
        for x in range(w):
            X = (x + 0.5 - cx) / (w * 0.42); Y = -(y + 0.5 - h * 0.42) / (h * 0.42)
            if (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 <= 0: d.point((x, y), col)
    d.point((int(w * 0.3), int(h * 0.3)), hi); d.point((int(w * 0.3) + 1, int(h * 0.3)), hi); return outline(im)

def disco(s=16):
    im, d = new(s, s); r = s / 2 - 1.5; c = s / 2 - 0.5
    for y in range(s):
        for x in range(s):
            if (x - c) ** 2 + (y - c) ** 2 <= r * r: d.point((x, y), (200, 200, 215, 255) if (x // 2 + y // 2) % 2 else (130, 130, 150, 255))
    d.point((int(c) - 2, int(c) - 3), WHITE); d.point((int(c) + 2, int(c)), (255, 106, 180, 255)); d.point((int(c) - 1, int(c) + 3), (154, 223, 255, 255))
    d.line([(c, 0), (c, 1)], DARK); return outline(im)

def pizza(s=16):
    im, d = new(s, s); d.polygon([(1, 2), (s - 2, 2), (s / 2, s - 2)], fill=(255, 200, 80, 255)); d.line([(1, 2), (s - 2, 2)], TAN, 2)
    for p in ((5, 6), (9, 5), (7, 9)): d.ellipse([p[0] - 1, p[1] - 1, p[0] + 1, p[1] + 1], RED)
    d.point((11, 7), GREEN); return outline(im)

def coffee(s=16):
    im, d = new(s, s); d.rectangle([3, 5, 11, 13], fill=CREAM); d.rectangle([3, 5, 11, 6], fill=BROWN); d.arc([9, 7, 14, 12], 270, 90, CREAM, 2)
    d.line([(5, 1), (6, 3)], (220, 220, 220, 200)); d.line([(8, 0), (8, 3)], (220, 220, 220, 200)); d.rectangle([3, 9, 11, 10], fill=RED); return outline(im)

def cleaver(w=16, h=16):
    im, d = new(w, h); d.polygon([(2, 3), (11, 3), (11, 10), (2, 11)], fill=(200, 205, 215, 255)); d.line([(2, 11), (11, 10)], WHITE); d.rectangle([11, 5, 15, 7], fill=BROWN)
    d.point((4, 5), DARK); return outline(im)

def token(s=16):
    im, d = new(s, s); d.ellipse([1, 1, s - 2, s - 2], fill=GOLD); d.ellipse([4, 4, s - 5, s - 5], outline=TAN); d.line([(s / 2 - 0.5, 5), (s / 2 - 0.5, s - 6)], TAN); shine(d, 4, 4); return outline(im)

def beer(w=8, h=16):
    im, d = new(w, h); d.rectangle([2, 0, 5, 4], fill=(70, 120, 40, 255)); d.rectangle([1, 5, 6, 15], fill=(80, 140, 40, 255)); d.rectangle([1, 8, 6, 11], fill=CREAM); d.point((2, 6), WHITE)
    return outline(im)

def blade(s=16):
    im, d = new(s, s); d.line([(3, 12), (13, 2)], (220, 225, 235, 255), 2); d.line([(4, 12), (13, 3)], WHITE); d.line([(2, 10), (6, 14)], GOLD, 2); d.line([(1, 14), (3, 12)], BROWN, 2); return outline(im)

def dice(s=16):
    im, d = new(s, s); d.rectangle([2, 2, s - 3, s - 3], fill=CREAM); d.rectangle([2, 2, s - 3, 3], fill=WHITE)
    for p in ((5, 5), (10, 10), (7, 7), (10, 5), (5, 10)): d.rectangle([p[0], p[1], p[0] + 1, p[1] + 1], RED)
    return outline(im)

def fang(s=16):
    im, d = new(s, s); d.polygon([(3, 2), (12, 2), (10, 6), (8, 14), (6, 6)], fill=CREAM); d.line([(4, 3), (11, 3)], WHITE); d.point((8, 13), HOT); d.point((8, 14), RED); return outline(im)

def collar(s=16):
    im, d = new(s, s); d.ellipse([1, 4, s - 2, s - 3], outline=(40, 20, 20, 255), width=3)
    for a in range(0, 360, 45):
        x = s / 2 - 0.5 + math.cos(math.radians(a)) * 6.5; y = s / 2 + 0.5 + math.sin(math.radians(a)) * 4.5; d.point((round(x), round(y)), (220, 225, 235, 255))
    d.rectangle([7, 12, 8, 14], fill=GOLD); return outline(im)

def rag(s=16):
    im, d = new(s, s); d.polygon([(2, 3), (13, 2), (14, 12), (4, 14)], fill=(200, 190, 170, 255)); d.line([(3, 6), (12, 5)], (170, 160, 140, 255)); d.line([(4, 10), (13, 9)], (170, 160, 140, 255))
    d.ellipse([6, 6, 10, 9], fill=CREAM); d.point((8, 7), WHITE); d.point((11, 11), (120, 40, 200, 255)); d.point((5, 4), (120, 40, 200, 255)); return outline(im)

def wing(s=16):
    im, d = new(s, s); d.polygon([(1, 8), (6, 2), (14, 1), (11, 5), (14, 6), (10, 9), (13, 11), (6, 13)], fill=(60, 20, 30, 255)); d.line([(1, 8), (14, 1)], (120, 40, 50, 255)); return outline(im)

def bomb(s=14):
    im, d = new(s, s + 2); d.ellipse([1, 4, s - 2, s + 1], fill=(40, 30, 40, 255)); d.rectangle([s / 2 - 2, 2, s / 2 + 1, 4], fill=DARK); d.line([(s / 2, 2), (s / 2 + 3, 0)], TAN); d.point((s / 2 + 3, 0), GOLD)
    d.point((4, 7), GREY); return outline(im)

def golden(s=14):
    im, d = new(s, s + 2); d.polygon([(s / 2 - 0.5, 0), (s - 3, s * 0.6), (s / 2 - 0.5, s + 1), (2, s * 0.6)], fill=GOLD); d.ellipse([3, 6, s - 4, s], fill=GOLD); d.point((5, 7), WHITE); d.point((5, 8), WHITE); return outline(im)

def lube(w=10, h=16):
    im, d = new(w, h); d.rectangle([3, 0, 6, 2], fill=RED); d.rectangle([1, 3, 8, 15], fill=(154, 223, 255, 255)); d.rectangle([1, 7, 8, 11], fill=CREAM); d.point((2, 4), WHITE); return outline(im)

def jar(w=14, h=16):
    im, d = new(w, h); d.rectangle([3, 0, 10, 2], fill=GOLD); d.rectangle([1, 3, 12, 15], fill=(240, 232, 210, 255)); d.rectangle([2, 7, 11, 14], fill=CREAM); d.point((3, 4), WHITE); d.point((3, 5), WHITE)
    return outline(im)

def ring(s=16, col=GOLD):
    im, d = new(s, s); d.ellipse([2, 3, s - 3, s - 2], outline=col, width=2); d.ellipse([5, 0, 10, 4], fill=(154, 223, 255, 255)); shine(d, 6, 1); return outline(im)

def clock(s=16):
    im, d = new(s, s); d.ellipse([1, 1, s - 2, s - 2], fill=CREAM); d.ellipse([1, 1, s - 2, s - 2], outline=GOLD); d.line([(7.5, 7.5), (7.5, 3)], INK); d.line([(7.5, 7.5), (11, 9)], RED); return outline(im)

def tiny(img, sc):
    return img.resize((max(1, round(img.width * sc)), max(1, round(img.height * sc))), Image.NEAREST)

NEW = {
    # weapon icons and their shots
    'ic_disco': disco(), 'sv_disco': disco(12), 'ic_love': heart(), 'sv_heart': heart(11, 10), 'ic_pizza': pizza(), 'sv_pizza': pizza(14),
    'ic_coffee': coffee(), 'sv_coffee': coffee(12), 'ic_cleaver': cleaver(), 'sv_cleaver': cleaver(14, 13), 'ic_token': token(), 'sv_token': token(10),
    'ic_beer': beer(8, 16), 'sv_beer': beer(7, 13), 'ic_blade': blade(),
    # charms
    'ic_dice': dice(), 'ic_fang': fang(), 'ic_collar': collar(), 'ic_rag': rag(), 'ic_wing': wing(), 'ic_ring': ring(), 'ic_clock': clock(),
    # pickups
    'pk_bomb': bomb(), 'pk_golden': golden(), 'pk_lube': lube(), 'pk_jar': jar(),
}

def main():
    s, S, a, b, m, sheet = read(GAME)
    K = read(KART); KS, KIM = K[1], K[5]
    for n in ('npc_bonjo', 'npc_t', 'npc_elden'):
        if n not in S: f = KS[n]; NEW[n] = KIM.crop((f[0], f[1], f[0] + f[2], f[1] + f[3]))
    todo = [(k, v) for k, v in NEW.items() if k not in S]
    if not todo: print('nothing to add'); return
    # shelf-pack below what is there
    y0 = max(f[1] + f[3] for f in S.values()) + 1; x = 0; y = y0; row = 0; W = sheet.width; place = {}
    for k, im in todo:
        if x + im.width > W: x = 0; y += row + 1; row = 0
        place[k] = (x, y); x += im.width + 1; row = max(row, im.height)
    H = y + row + 1; out = Image.new('RGBA', (W, max(sheet.height, H)), (0, 0, 0, 0)); out.paste(sheet, (0, 0))
    for k, im in todo: out.paste(im, place[k]); S[k] = [place[k][0], place[k][1], im.width, im.height]
    buf = io.BytesIO(); out.save(buf, 'PNG', optimize=True); b64 = base64.b64encode(buf.getvalue()).decode()
    s2 = s[:a] + json.dumps(S, separators=(',', ':')) + s[b:]
    s2 = re.sub(r'SHEET\.src = "data:image/png;base64,[^"]+"', lambda _: 'SHEET.src = "data:image/png;base64,' + b64 + '"', s2, count=1)
    open(GAME, 'w', encoding='utf-8').write(s2); out.crop((0, y0, W, H)).resize((W * 2, (H - y0) * 2), Image.NEAREST).save('/tmp/claude-0/new184.png')
    print('added', len(todo), 'sheet', out.size)

if __name__ == '__main__':
    main()
