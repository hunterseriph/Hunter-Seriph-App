"""Cum City Nights (update 154): the game is 3D. The sheet carries the shop fronts (stuck on the buildings, names baked in),
the characters' faces for the HUD and the phone, and the cream drop (the money)."""
USE = ['fac_*', 'npc_*', 'ch_idle0', 'cumface', 'steve0', 'lab_face', 'mn_pill']
from pixelkit import Grid
def _drop():
    g = Grid(10, 13); g.ellipse(5, 8.5, 4.2, 4.2, 'd'); g.poly([(2, 7), (5, 0), (8, 7)], 'd'); g.put(3, 7, 'hi'); g.put(3, 8, 'hi')
    return g, {'d': ('#fffbe8', '#f1e0b0', '#b8a070'), 'hi': '#ffffff'}
ART = {'cc_drop': _drop}
