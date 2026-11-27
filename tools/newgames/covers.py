#!/usr/bin/env python3
"""Game covers for the Games tab (update 184: his ask, "make them look like game covers"). Each one is a real moment from
the game as key art, the title in the same chunky lettering as the logos, and a cover band along the bottom.

python3 tools/newgames/covers.py <shots dir>          -> www/assets/cover-<id>.webp for every game (354 x 414, shown at 118 x 138)
python3 tools/newgames/covers.py <shots dir> kart pn  -> only those
python3 tools/newgames/covers.py bonk-logo           -> www/assets/bonk-logo.webp (Spermabonk has no logo of its own)
The shots are 960 x 540 screenshots named <game file>.png (tools: covshots.js in the bonk folder's notes)."""
import os, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'logos'))
import make as L
W, H = 354, 414
BAND = 40
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
FONTB = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
RED = L.RED
GOLD = dict(face=[(0, '#fff6c0'), (0.5, '#ffe36a'), (1, '#c48a10')], side=['#4a2a0a', '#140a02'], shine='#ffffff')
CREAM = dict(face=[(0, '#fff6e0'), (0.5, '#f1e7d0'), (1, '#b89c78')], side=['#7a0a12', '#2a0408'], shine='#ffffff')
PINK = dict(face=[(0, '#ffe0f0'), (0.5, '#ff6ab4'), (1, '#a0206a')], side=['#4a0a30', '#14020a'], shine='#ffffff')
PURP = dict(face=[(0, '#f0e0ff'), (0.5, '#c08aff'), (1, '#6a2ab0')], side=['#2a0a4a', '#0a0214'], shine='#ffffff')
CYAN = dict(face=[(0, '#e0fbff'), (0.5, '#9adfff'), (1, '#2a7ab0')], side=['#0a2a4a', '#020a14'], shine='#ffffff')
GREEN = dict(face=[(0, '#eaffd0'), (0.5, '#7dff3a'), (1, '#2a8a10')], side=['#0a3a0a', '#021402'], shine='#ffffff')
BONE = dict(face=[(0, '#ffffff'), (0.5, '#d8c8a8'), (1, '#8a7450')], side=['#3a2a1a', '#140a02'], shine='#ffffff')
# id: (game file, [title lines], style, crop centre 0..1 across the shot, tag line)
COVERS = {
    'ccn': ('cum-city-nights', ['CUM CITY', 'NIGHTS'], RED, 0.52, 'OPEN CITY', dict(zoom=1.35, cy=0.52)),
    'hog': ('spermhog', ['CUMHEAD', 'THE SPERMHOG'], GOLD, 0.42, 'PLATFORMER'),
    'meat': ('meatnado', ['MEATNADO', 'ESCAPE'], RED, 0.35, 'ENDLESS RUNNER'),
    'surv': ('spermaid-survivors', ['SPERMAID', 'SURVIVORS'], PINK, 0.45, 'HORDE SURVIVAL', dict(zoom=1.3, cy=0.5, pix=1)),
    'bonk': ('spermabonk', ['SPERMA', 'BONK'], RED, 0.5, '3D HORDE SURVIVAL'),
    'cq': ('cumheads-quest', ['CUMHEADS', 'QUEST'], GOLD, 0.5, 'DUNGEON ROGUELIKE', dict(zoom=1.5, cy=0.4, pix=1)),
    'll': ('load-legacy', ['LOAD', 'LEGACY'], CREAM, 0.5, 'ROGUELITE'),
    'jv': ('journey-to-the-void', ['JOURNEY TO', 'THE VOID'], PURP, 0.3, 'TURN-BASED RPG', dict(zoom=1.3, cy=0.38, tpos='bottom', pix=1, cut=0.645)),
    'sw': ('spuzzworld', ['SPUZZWORLD', "CUM'S ODDYSEE"], GREEN, 0.45, 'PUZZLE PLATFORMER', dict(zoom=1.5, cy=0.62, pix=1)),
    'gr': ('grinding-of-cumhead', ['THE GRINDING', 'OF CUMHEAD'], RED, 0.5, 'TWIN-STICK ROGUELIKE', dict(zoom=1.15, cy=0.45, th=118)),
    'wn': ('willy-nilly', ['WILLY', 'NILLY'], GOLD, 0.5, 'DINER DASH'),
    'ao': ('arcade-overdrive', ['ARCADE', 'OVERDRIVE'], CYAN, 0.66, 'MICRO GAMES', dict(th=108)),
    'ck': ('cumhead-kart', ['CUMHEAD', 'KART'], RED, 0.5, 'KART RACING'),
    'sa': ('spermhog-adventure', ['SPERMHOG', 'ADVENTURE'], GOLD, 0.5, '3D ADVENTURE'),
    'dk': ('dark-loads', ['DARK', 'LOADS'], BONE, 0.5, 'SOULS-LIKE'),
    'lc': ('legend-of-cumhead', ['THE LEGEND', 'OF CUMHEAD'], GREEN, 0.42, 'ADVENTURE', dict(zoom=1.4, cy=0.45, th=118, pix=1)),
    'c3': ('cumstein-3d', ['CUMSTEIN', '3D'], RED, 0.5, 'FIRST-PERSON SHOOTER'),
    'fr': ('fap-rooms', ['THE FAP', 'ROOMS'], GOLD, 0.5, 'HORROR', dict(bright=1.35)),
    'gk': ('gooning-cave-keeper', ['GOONING', 'CAVE KEEPER'], RED, 0.5, 'DUNGEON BUILDER'),
    'sb': ('super-spunky-ball', ['SUPER', 'SPUNKY BALL'], PINK, 0.58, 'BALL ROLLING', dict(zoom=1.25, cy=0.5, bright=1.15)),
    'ob': ('pulsars-octobeats', ["PULSAR'S", 'OCTOBEATS'], PURP, 0.5, 'RHYTHM'),
    'sk': ('skeet-fighter', ['SKEET', 'FIGHTER'], RED, 0.6, "BEAT 'EM UP", dict(th=125)),
    'pn': ('psycho-nightmare', ['PSYCHO', 'NIGHTMARE'], RED, 0.47, 'SURVIVAL HORROR', dict(zoom=1.35, cy=0.463, tpos='bottom')),
}


def title(lines, st, th=150):
    s = dict(L.RED); s.update(st); s.update(outline=9, rim=3, depth=10)
    ims = []
    for i, t in enumerate(lines):
        size = 120 if len(t) <= 6 else 104 if len(t) <= 9 else 88
        if i == 1 and len(lines[0]) > len(t) + 3: size = int(size * 1.05)
        m = L.word_mask(t, size, stretch=1.12); ims.append(L.letters(m, s if i == 0 else dict(s, **(GOLD if st is RED else {})) if i else s))
    w = max(im.width for im in ims); hh = sum(im.height for im in ims) - 26 * (len(ims) - 1)
    c = Image.new('RGBA', (w, hh), (0, 0, 0, 0)); y = 0
    for im in ims: c.alpha_composite(im, ((w - im.width) // 2, y)); y += im.height - 26
    c = c.crop(c.getbbox()); k = min((W - 26) / c.width, th / c.height); return c.resize((int(c.width * k), int(c.height * k)), Image.LANCZOS)


def cover(cid, shots):
    g, lines, st, cx, tag = COVERS[cid][:5]; o = COVERS[cid][5] if len(COVERS[cid]) > 5 else {}
    src = Image.open(os.path.join(shots, g + '.png')).convert('RGB')
    # the key art: a tall slice of the moment (zoomed in on the action where it is small), a little punchier, darker at the top for the title and at the edges
    if o.get('cut'): ImageDraw.Draw(src).rectangle((0, int(src.height * o['cut']), src.width, src.height), fill=(10, 4, 6))
    z = o.get('zoom', 1.0); ch = int(src.height / z); sw = int(ch * W / (H - BAND))
    x0 = int(max(0, min(src.width - sw, src.width * cx - sw / 2))); y0 = int(max(0, min(src.height - ch, src.height * o.get('cy', 0.5) - ch / 2)))
    art = src.crop((x0, y0, x0 + sw, y0 + ch)).resize((W, H - BAND), Image.NEAREST if o.get('pix') else Image.LANCZOS)
    if o.get('bright'): art = ImageEnhance.Brightness(art).enhance(o['bright'])
    art = ImageEnhance.Contrast(art).enhance(1.12); art = ImageEnhance.Color(art).enhance(1.15)
    im = Image.new('RGBA', (W, H), (10, 4, 6, 255)); im.paste(art, (0, 0))
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    bot = o.get('tpos') == 'bottom'
    for y in range(0, 200 if not bot else 60): d.line([(0, y), (W, y)], fill=(8, 2, 4, int(225 * (1 - y / (200 if not bot else 60)) ** 1.6)))
    tb = 90 if not bot else 210
    for y in range(H - BAND - tb, H - BAND): d.line([(0, y), (W, y)], fill=(8, 2, 4, int((200 if not bot else 235) * ((y - (H - BAND - tb)) / tb) ** (2 if not bot else 1.4))))
    im.alpha_composite(sh)
    vg = Image.new('L', (W, H), 0); ImageDraw.Draw(vg).ellipse((-W * 0.25, -H * 0.15, W * 1.25, H * 1.1), fill=255); vg = ImageChops.invert(vg.filter(ImageFilter.GaussianBlur(40)))
    im.alpha_composite(Image.composite(Image.new('RGBA', (W, H), (0, 0, 0, 170)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), vg))
    t = title(lines, st, o.get('th', 150)); im.alpha_composite(t, ((W - t.width) // 2, 12 if not bot else H - BAND - t.height - 8))
    # the cover band: genre on the left, the publisher's mark on the right, a red rule above it
    d = ImageDraw.Draw(im); d.rectangle((0, H - BAND, W, H), fill=(14, 6, 8, 255)); d.rectangle((0, H - BAND, W, H - BAND + 3), fill=(196, 18, 28, 255))
    f1 = ImageFont.truetype(FONTB, 15); f2 = ImageFont.truetype(FONT, 15)
    d.text((12, H - BAND + 13), tag, font=f1, fill=(241, 231, 208, 255))
    pub = 'HUNTER SERIPH'; pw = d.textlength(pub, font=f2); d.text((W - 12 - pw, H - BAND + 13), pub, font=f2, fill=(255, 38, 48, 255))
    # a small cream droplet before the mark, and the 18+ badge in the top corner
    px = W - 12 - pw - 16; py = H - BAND + 12; d.polygon([(px + 5, py), (px + 10, py + 9), (px, py + 9)], fill=(241, 231, 208, 255)); d.ellipse((px, py + 5, px + 10, py + 17), fill=(241, 231, 208, 255))
    by = 0 if not bot else -(H - BAND - 30 - 10)
    d.rectangle((W - 44, H - BAND - 30 + by, W - 10, H - BAND - 8 + by), fill=(196, 18, 28, 255), outline=(18, 4, 10, 255), width=2); d.text((W - 39, H - BAND - 28 + by), '18+', font=ImageFont.truetype(FONT, 15), fill=(255, 255, 255, 255))
    d.rectangle((0, 0, W - 1, H - 1), outline=(18, 4, 10, 255), width=3)
    out = os.path.join(APP, 'www', 'assets', 'cover-' + cid + '.webp'); im.convert('RGB').save(out, 'WEBP', quality=86, method=6); return out


def bonk_logo():
    """Spermabonk's logo (the arcade cabinet's marquee and its cartridge in Cum City Nights): the cover's lettering on its own"""
    t = title(['SPERMA', 'BONK'], RED, 300); out = os.path.join(APP, 'www', 'assets', 'bonk-logo.webp'); t.save(out, 'WEBP', quality=88, method=6); return out


if __name__ == '__main__':
    if sys.argv[1:] == ['bonk-logo']: print(bonk_logo()); sys.exit()
    shots = sys.argv[1]; want = sys.argv[2:] or list(COVERS)
    for k in want: print(cover(k, shots))
