"""Shithead Laboozie seen from behind (for the Spermhog special stage, like Cumhead's chb_u frames): his front frame
with the face, the hoodie strings and the gloves' fronts painted over, the legs stepping."""
from PIL import Image
BROWN = [(74, 38, 12), (106, 58, 20), (138, 80, 34)]
def back(src, i):
    im = src.convert('RGBA').copy(); W, H = im.size; px = im.load(); hr = int(H * 0.39)
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if a < 100: continue
            dark = r + g + b < 70
            if y < hr and not dark:
                # anything that is not poop brown on the head (eyes, teeth, mouth) becomes his brown
                if not (r > g > b and r - b > 30 and r < 200): px[x, y] = BROWN[1 if (x + y) % 5 else 0] + (255,)
            elif hr <= y < int(H * 0.68) and r > 150 and g > 150: px[x, y] = (40, 36, 46, 255)  # strings and glove fronts: hoodie black
    if i % 2:  # the other leg forward
        legs = im.crop((0, int(H * 0.7), W, H)).transpose(Image.FLIP_LEFT_RIGHT); im.paste((0, 0, 0, 0), (0, int(H * 0.7), W, H)); im.alpha_composite(legs, (0, int(H * 0.7)))
    out = Image.new('RGBA', (W, H + 1), (0, 0, 0, 0)); out.alpha_composite(im, (0, 1 if i in (1, 3) else 0)); return out
