"""The Legend of Cumhead: hearts, keys, bombs and item icons from The Grinding of Cumhead, chibi Cumhead, our foes,
bosses, townsfolk and shop fronts, and (update 135) the game's own tileset, props and buildings from tiles.py."""
import os, importlib.util
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'grinding', 'art.py')
_s = importlib.util.spec_from_file_location('gr_art_for_zelda', _p); _m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
ART = {k: v for k, v in _m.ART.items() if k.startswith(('gr_heart', 'gr_key', 'gr_bomb', 'gr_shield', 'chb_', 'it_'))}
USE = ['f_slime_*', 'f_slimeR_*', 'f_slimeB_*', 'f_bat_*', 'f_crawler_*', 'f_rat_*', 'f_ghoul_*', 'f_skeleton_*', 'f_cultist_*', 'f_knight_*', 'f_imp_*', 'f_mummy_*', 'f_creamblob_*', 'f_cultrat_*', 'f_wraith_*', 'f_clown_*', 'f_balloon_*', 'f_bonehound_*', 'f_magmaslug_*', 'f_blumling_*', 'f_blumeye_*',
       'f_kraken_*', 'f_boner_*', 'f_pig_*', 'f_execu_*', 'f_blum_*', 'f_blum2_*', 'npc_*', 'steve0', 'cat', 'fac_*']

from pixelkit import Grid
def _drop():
    g = Grid(10, 13); g.ellipse(5, 8.5, 4.2, 4.2, 'd'); g.poly([(2, 7), (5, 0), (8, 7)], 'd'); g.put(3, 7, 'hi'); g.put(3, 8, 'hi')
    return g, {'d': ('#fffbe8', '#f1e0b0', '#b8a070'), 'hi': '#ffffff'}
ART['lc_drop'] = _drop
def _sausage():
    g = Grid(26, 9); g.ellipse(13, 4.5, 12, 3.8, 's'); g.line(5, 3, 20, 3, 'hi', 0.3); g.put(0, 4, 'end'); g.put(25, 4, 'end')
    return g, {'s': ('#e0604a', '#a8301e', '#5a1208'), 'hi': '#ffb0a0', 'end': '#5a1208'}
ART['lc_sausage'] = _sausage

import sys as _sys
_sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tiles as _tiles
for _k, _im in _tiles.build().items(): ART[_k] = (lambda im=_im: im)
