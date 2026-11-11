"""Super Spunky Ball: who rides in the ball (their own sprites) and the drops."""
USE = ['ch_idle0', 'spermaid_s0', 'greebo_s0', 'lab_idle0', 'h_gloop_adult_idle0', 'steve0', 'cat', 'gr_coin', 'npc_tb']
import os, importlib.util
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'grinding', 'art.py')
_s = importlib.util.spec_from_file_location('gr_art_for_ball', _p); _m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
ART = {k: v for k, v in _m.ART.items() if k in ('gr_coin', 'gr_coin5')}
