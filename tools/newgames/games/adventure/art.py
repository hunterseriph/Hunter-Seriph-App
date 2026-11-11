"""Spermhog Adventure (update 132): the game is fully 3D, so the sheet only carries the shop fronts (stuck flat on the
buildings in the hubs, names baked in) and the cream drop for the HUD."""
USE = ['fac_*']
from pixelkit import Grid
def _drop():
    g = Grid(10, 13); g.ellipse(5, 8.5, 4.2, 4.2, 'd'); g.poly([(2, 7), (5, 0), (8, 7)], 'd'); g.put(3, 7, 'hi'); g.put(3, 8, 'hi')
    return g, {'d': ('#fffbe8', '#f1e0b0', '#b8a070'), 'hi': '#ffffff'}
ART = {'sa_drop': _drop}
