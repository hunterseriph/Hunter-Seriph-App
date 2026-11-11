"""Spermhog Adventure: everyone is drawn from their own sprites, standing up in the 3D world (Saturn style); the
homunculi in the garden are the real breed art at every age."""
USE = ['ch_idle*', 'ch_rn*', 'ch_jump*', 'ch_walk*', 'ch_hurt*', 'ch_attack', 'greebo_s*', 'greebo_d', 'spermaid_s*', 'spermaid_d', 'lab_idle*', 'lab_run*', 'lab_jump*', 'lab_fire*', 'lab_toss*', 'lab_hurt',
       'npc_tb', 'npc_amy', 'npc_saba', 'npc_spermaid', 'npc_greebo', 'npc_pulsar', 'npc_potbelly', 'npc_harold', 'steve0', 'steve1', 'cat',
       'f_crawler_*', 'f_bat_*', 'f_slime_*', 'f_clown_*', 'f_balloon_*', 'f_knight_*', 'f_imp_*', 'f_skeleton_*', 'f_creamblob_*', 'f_rat_*', 'f_harpy_*', 'f_jelly_*', 'f_wasp_*', 'f_corkbot_*',
       'f_beast_*', 'f_pig_*', 'f_kraken_*', 'f_boner_*', 'f_hotload_*', 'f_execu_*', 'f_mega_*', 'f_golem_*', 'f_sirj_*',
       'h_*', 'fac_*']
import os, importlib.util
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'grinding', 'art.py')
_s = importlib.util.spec_from_file_location('gr_art_for_adv', _p); _m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
ART = {k: v for k, v in _m.ART.items() if k in ('gr_coin', 'gr_coin5', 'gr_heart', 'gr_shield', 'it_pie', 'it_cup', 'it_pineapple', 'it_chilli', 'it_garlic', 'it_egg', 'it_balloon', 'it_moon', 'it_bread')}
