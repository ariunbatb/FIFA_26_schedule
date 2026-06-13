"""Generate PWA app icons for the FIFA 2026 schedule site.
Run:  python generate_icons.py
"""
import math
from PIL import Image, ImageDraw

GREEN      = (11, 107, 65)
GREEN_DEEP = (8, 79, 49)
WHITE      = (255, 255, 255)
DARK       = (10, 36, 24)
SS = 4


def regular_polygon(cx, cy, r, n, rot=-math.pi / 2):
    return [(cx + r * math.cos(rot + 2 * math.pi * i / n),
             cy + r * math.sin(rot + 2 * math.pi * i / n)) for i in range(n)]


def draw_ball(d, cx, cy, r):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE,
              outline=GREEN_DEEP, width=max(2, int(r * 0.045)))
    pr = r * 0.40
    pent = regular_polygon(cx, cy, pr, 5)
    d.polygon(pent, fill=DARK)
    sw = max(2, int(r * 0.05))
    for vx, vy in pent:
        ang = math.atan2(vy - cy, vx - cx)
        ex, ey = cx + r * math.cos(ang), cy + r * math.sin(ang)
        d.line([(vx, vy), (ex, ey)], fill=DARK, width=sw)


def bg(d, size, radius_ratio):
    if radius_ratio <= 0:
        d.rectangle([0, 0, size, size], fill=GREEN)
    else:
        d.rounded_rectangle([0, 0, size - 1, size - 1],
                            radius=int(size * radius_ratio), fill=GREEN)


def make(path, size, ball_ratio=0.74, radius_ratio=0.0, alpha=False):
    big = size * SS
    img = Image.new("RGBA" if alpha else "RGB", (big, big),
                    (0, 0, 0, 0) if alpha else GREEN)
    d = ImageDraw.Draw(img)
    bg(d, big, radius_ratio)
    draw_ball(d, big / 2, big / 2, big * ball_ratio / 2)
    img.resize((size, size), Image.LANCZOS).save(path)
    print("wrote", path)


make("icon-maskable-512.png", 512, 0.62, 0.0)
make("icon-192.png", 192, 0.74, 0.18, alpha=True)
make("icon-512.png", 512, 0.74, 0.18, alpha=True)
make("apple-touch-icon.png", 180, 0.74, 0.0)
make("favicon.png", 32, 0.86, 0.22, alpha=True)
