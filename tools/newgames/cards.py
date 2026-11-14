"""Game cards for the app's Games tab (118 x 138, pixel art scaled up). Writes www/assets/<id>-card.webp (all of them, or only the ids given)."""
import os, sys
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); import art
B = art.base()
def ex(g): return art.extra(g)[0]
ONLY = sys.argv[1:]  # python3 cards.py pn  -> only that card
def card(bg_rows, items, name):
    if ONLY and name not in ONLY: return
    im = Image.new('RGBA', (59, 69), bg_rows[0]); d = ImageDraw.Draw(im)
    for i, (y0, y1, c) in enumerate(bg_rows[1]): d.rectangle([0, y0, 58, y1], fill=c)
    for spr, x, y, sc, flip in items:
        s = spr if isinstance(spr, Image.Image) else B[spr]
        if sc != 1: s = s.resize((max(1, int(s.width * sc)), max(1, int(s.height * sc))), Image.NEAREST)
        if flip: s = s.transpose(Image.FLIP_LEFT_RIGHT)
        im.alpha_composite(s, (int(x - s.width / 2), int(y - s.height)))
    im = im.resize((118, 138), Image.NEAREST).convert('RGB')
    out = os.path.join(APP, 'www', 'assets', name + '-card.webp'); im.save(out, 'WEBP', quality=92); print('wrote', out)
wn = ex('willy-nilly'); gr = ex('grinding'); ao = ex('arcade'); sw = ex('spuzzworld'); jv = ex('void')
card(((20, 6, 8, 255), [(0, 30, (58, 10, 16)), (46, 68, (74, 14, 20))]), [(wn['wn_table'], 29, 58, 0.7, False), (B['npc_amy'], 14, 62, 0.9, False), (wn['wn_bowld'], 32, 40, 1, False), (B['npc_tb'], 46, 56, 0.8, True)], 'wn')
card(((20, 10, 14, 255), [(0, 68, (34, 24, 30))]), [(gr['gr_rock0'], 10, 30, 0.7, False), (gr['gr_pile3'], 50, 26, 0.7, False), (B['ch_icon0'], 29, 56, 1.1, False), (gr['gr_tearc'], 29, 14, 1, False), (gr['gr_tearc'], 42, 30, 1, False), (B['f_bat_0'], 46, 46, 0.8, True)], 'gr')
card(((12, 4, 8, 255), [(0, 44, (26, 10, 18)), (45, 68, (42, 14, 18))]), [(ao['ao_cabbig'], 29, 66, 0.42, False), (B['ch_idle0'], 12, 68, 0.62, False), (B['npc_potbelly'], 50, 68, 0.62, True), (ao['ao_coin'], 22, 30, 0.6, False)], 'ao')
card(((14, 8, 16, 255), [(0, 50, (30, 12, 24)), (51, 68, (58, 42, 52))]), [(sw['sw_mine1'], 44, 52, 1, False), (B['ch_run2'], 22, 52, 0.75, False), (B['h_gloop_teen_run0'], 40, 51, 0.9, False), (B['f_blumguard_0'], 52, 51, 0.8, True)], 'sw')
card(((0, 0, 0, 255), [(52, 68, (20, 10, 32))]), [(jv['jv_void0'], 29, 46, 0.32, False), (B['ch_idle0'], 12, 68, 0.55, False), (B['spermaid_s0'], 29, 68, 0.55, False), (B['greebo_s0'], 47, 68, 0.55, True)], 'jv')
ck = ex('kart')
_ch = B['ch_idle0'].crop((0, 0, 30, 34))
_chk = Image.new('RGBA', (59, 4)); [_chk.putpixel((x, y), (241, 231, 208, 255) if (x // 2 + y // 2) % 2 else (18, 4, 10, 255)) for x in range(59) for y in range(4)]
_moon = Image.new('RGBA', (16, 16)); ImageDraw.Draw(_moon).ellipse((1, 1, 14, 14), fill=(196, 18, 28, 255))
card(((10, 4, 8, 255), [(0, 44, (30, 8, 14)), (45, 68, (42, 38, 48))]), [(_moon, 44, 20, 1, False), (_chk, 29, 52, 1, False), (_ch, 26, 54, 0.62, False), (ck['ck_kart'], 28, 66, 1.0, False), (ck['ck_flame0'], 4, 63, 0.9, False)], 'ck')
sk = ex('skeet')
_moon2 = Image.new('RGBA', (20, 20)); ImageDraw.Draw(_moon2).ellipse((1, 1, 18, 18), fill=(196, 18, 28, 255)); ImageDraw.Draw(_moon2).ellipse((3, 3, 14, 14), fill=(255, 38, 48, 255))
card(((8, 3, 6, 255), [(0, 40, (22, 6, 12)), (41, 46, (58, 20, 26)), (47, 68, (46, 16, 20))]), [(_moon2, 44, 22, 1, False), (sk['wb_gloop_teen_hurt'], 46, 62, 1.0, True), (sk.get('sk_cu_jab') or sk['sk_cu_jab1'], 22, 64, 0.62, False), (sk['fx_spark2'], 39, 56, 1, False)], 'sk')
mn = ex('meatnado')
_hall = Image.new('RGBA', (59, 69), (0, 0, 0, 0)); _hd = ImageDraw.Draw(_hall)
for i in range(6): _hd.rectangle([8 + i * 3, 10 + i * 3, 50 - i * 3, 50 - i * 2], outline=(40 - i * 5, 12, 14 + i * 4, 255))  # a long hall into the dark
_hd.rectangle([26, 26, 32, 38], fill=(4, 2, 3, 255)); _hd.rectangle([27, 22, 31, 24], fill=(196, 18, 28, 255))
_pill = mn['mn_pill'] if 'mn_pill' in mn else None
card(((8, 3, 6, 255), [(0, 46, (18, 10, 12)), (47, 68, (30, 22, 20))]), [(_hall, 29, 69, 1, False), (B['npc_tb'], 42, 66, 1.25, True), (B['ch_idle0'].crop((0, 0, 30, 34)), 16, 68, 0.6, False)] + ([(_pill, 10, 20, 1, False), (_pill, 50, 14, 1, True), (_pill, 28, 10, 1, False)] if _pill else []), 'pn')
# update 131: the eight new games
_gr = ex('grinding')
_ball = Image.new('RGBA', (34, 34)); _bd = ImageDraw.Draw(_ball); _bd.ellipse((1, 1, 32, 32), fill=(255, 255, 255, 70), outline=(18, 4, 10, 255)); _bd.ellipse((7, 5, 15, 11), fill=(255, 255, 255, 180))
_bc = B['ch_idle0'].crop((0, 0, 30, 57)).resize((15, 28), Image.NEAREST); _ball.alpha_composite(_bc, (9, 4))
card(((60, 20, 90, 255), [(0, 40, (40, 12, 70)), (41, 68, (20, 8, 30))]), [(B['npc_pulsar'], 29, 50, 1.0, False), (B['h_gloop_adult_idle0'], 10, 68, 0.6, False), (B['h_ember_adult_idle0'], 48, 68, 0.6, True)], 'ob')
_yr = Image.new('RGBA', (59, 69), (0, 0, 0, 0)); _yd = ImageDraw.Draw(_yr)
for i in range(5): _yd.rectangle([6 + i * 4, 8 + i * 4, 52 - i * 4, 52 - i * 2], outline=(200 - i * 25, 180 - i * 24, 80 - i * 10, 255))
_yd.ellipse((24, 22, 34, 28), fill=(0, 0, 0, 255)); _yd.chord((22, 22, 36, 32), 20, 160, fill=(255, 255, 255, 255))
card(((90, 80, 30, 255), [(0, 50, (110, 98, 40)), (51, 68, (80, 70, 30))]), [(_yr, 29, 69, 1, False)], 'fr')
card(((10, 4, 8, 255), [(0, 46, (26, 10, 16)), (47, 68, (40, 30, 34))]), [(B['f_queen_0'] if 'f_queen_0' in B else B['f_knight_0'], 44, 64, 0.6, True), (B['ch_attack'], 18, 66, 0.55, False)], 'dk')
card(((42, 74, 30, 255), [(0, 68, (52, 90, 36))]), [(_gr['chb_d0'], 29, 60, 1.2, False), (B['f_slime_0'], 46, 64, 1, True), (_gr['gr_heart'], 10, 16, 1, False), (_gr['gr_heart'], 20, 16, 1, False)], 'lc')
card(((40, 30, 24, 255), [(0, 68, (58, 42, 36))]), [(B['h_gloop_baby_run0'], 18, 60, 1.2, False), (B['h_ember_baby_run1'], 40, 64, 1.1, True), (B['f_knight_0'], 48, 34, 0.7, True)], 'gk')
card(((30, 26, 28, 255), [(0, 30, (40, 30, 34)), (31, 68, (24, 20, 22))]), [(B['f_cultist_0'], 29, 44, 0.9, False), (B['cumface'], 29, 68, 0.9, False)], 'c3')
card(((90, 30, 70, 255), [(0, 44, (110, 40, 90)), (45, 68, (240, 120, 180))]), [(_ball, 29, 60, 1, False), (_gr['gr_coin'], 10, 30, 1, False), (_gr['gr_coin'], 48, 24, 1, False)], 'sb')
card(((30, 8, 14, 255), [(0, 44, (60, 12, 24)), (45, 68, (40, 20, 24))]), [(B['spermaid_s0'], 10, 68, 0.6, False), (B['ch_rn2'], 30, 68, 0.6, False), (B['greebo_s0'], 48, 68, 0.6, True), (B['npc_tb'], 46, 30, 0.7, True)], 'sa')
# Cum City Nights: the skyline under the red moon, lit windows, Cumhead and Shithead Laboozie on the street
_cc = Image.new('RGBA', (59, 50)); _d = ImageDraw.Draw(_cc); import random as _r; _rr = _r.Random(5); _x = 0
while _x < 59:
    _w = _rr.randint(6, 12); _h = _rr.randint(14, 40); _d.rectangle((_x, 50 - _h, _x + _w - 1, 49), fill=(18, 4, 10, 255))
    for _y in range(52 - _h, 46, 4):
        for _q in range(_x + 1, _x + _w - 2, 3):
            if _rr.random() < 0.4: _d.point((_q, _y), fill=(255, 227, 106, 255) if _rr.random() < 0.7 else (255, 38, 48, 255))
    _x += _w
_mn = Image.new('RGBA', (26, 26)); ImageDraw.Draw(_mn).ellipse((1, 1, 24, 24), fill=(196, 18, 28, 255))
card(((14, 6, 20, 255), [(0, 30, (40, 12, 30)), (31, 50, (70, 20, 36)), (51, 68, (30, 26, 30))]), [(_mn, 40, 30, 1, False), (_cc, 29, 52, 1, False), (B['ch_idle0'], 20, 67, 0.55, False), (B['lab_idle0'], 41, 67, 0.55, True)], 'ccn')
