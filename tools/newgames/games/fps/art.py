"""Cumstein 3D: foes and pickups come from the art we have and are drawn as billboards in 3D."""
USE = ['f_cultist_*', 'f_knight_*', 'f_skeleton_*', 'f_ghoul_*', 'f_imp_*', 'f_vampire_*', 'f_blumguard_*', 'f_blumeye_*', 'f_jailer_*', 'f_golem_*', 'f_mummy_*', 'f_wraith_*', 'f_blum_*', 'f_blum2_*', 'f_kingblum_*',
       'cumface', 'ch_icon0', 'p_chest', 'p_skulls', 'p_ribs', 'p_chand', 'p_altar', 'throne', 'p_cell', 'p_shrine', 'p_crucible', 'p_feast', 'p_heart0', 'p_creampool']
import os, importlib.util
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'grinding', 'art.py')
_s = importlib.util.spec_from_file_location('gr_art_for_fps', _p); _m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
ART = {k: v for k, v in _m.ART.items() if k in ('gr_heart', 'gr_key', 'gr_shield', 'gr_coin', 'gr_coin5', 'it_cup', 'it_pie', 'it_chilli', 'it_pizza', 'it_espresso', 'it_moon', 'it_dice', 'it_token', 'it_sword', 'it_charm')}
