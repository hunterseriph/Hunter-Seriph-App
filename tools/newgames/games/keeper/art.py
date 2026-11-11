"""Gooning Cave Keeper: homunculi of every breed are the workers, our foes are the creatures and the heroes."""
USE = ['h_*_baby_idle0', 'h_*_baby_run*', 'h_*_teen_run*', 'h_*_teen_idle0', 'h_*_adult_idle0', 'f_ghoul_*', 'f_skeleton_*', 'f_cultist_*', 'f_vampire_*', 'f_imp_*', 'f_bat_*', 'f_wraith_*', 'f_golem_*',
       'f_knight_*', 'f_harpy_*', 'f_jailer_*', 'f_mummy_*', 'f_gargoyle_*', 'f_sirj_*', 'p_heart*', 'p_hatchery', 'p_chest', 'p_altar', 'p_skulls', 'gr_coin', 'gr_coin5', 'it_pie', 'cat']
import os, importlib.util
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'grinding', 'art.py')
_s = importlib.util.spec_from_file_location('gr_art_for_keeper', _p); _m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
ART = {k: v for k, v in _m.ART.items() if k in ('gr_coin', 'gr_coin5', 'it_pie')}
