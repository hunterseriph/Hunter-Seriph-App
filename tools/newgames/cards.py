"""Game cards for the app's Games tab (118 x 138, pixel art scaled up). Writes www/assets/<id>-card.webp."""
import os, sys
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); import art
B = art.base()
def ex(g): return art.extra(g)[0]
def card(bg_rows, items, name):
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
