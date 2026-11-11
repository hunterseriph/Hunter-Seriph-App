"""Super Spunky Ball: who rides in the ball (their own sprites) and the drops."""
USE = ['ch_idle0', 'spermaid_s0', 'greebo_s0', 'lab_idle0', 'h_gloop_adult_idle0', 'steve0', 'cat', 'gr_coin', 'npc_tb']
import os, importlib.util
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'grinding', 'art.py')
_s = importlib.util.spec_from_file_location('gr_art_for_ball', _p); _m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
ART = {k: v for k, v in _m.ART.items() if k in ('gr_coin', 'gr_coin5')}
from pixelkit import Grid
def _drop():
    g = Grid(10, 13); g.ellipse(5, 8.5, 4.2, 4.2, 'd'); g.poly([(2, 7), (5, 0), (8, 7)], 'd'); g.put(3, 7, 'hi'); g.put(3, 8, 'hi')
    return g, {'d': ('#fffbe8', '#f1e0b0', '#b8a070'), 'hi': '#ffffff'}
ART['sb_drop'] = _drop
