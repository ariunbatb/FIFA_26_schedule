from PIL import Image, ImageDraw, ImageFont
import math

W, H = 1200, 630
img = Image.new("RGB", (W, H), "#0b6b41")
d = ImageDraw.Draw(img)

# Vertical-ish gradient: light green top -> deep green bottom
top = (18, 138, 84)      # #128a54
mid = (11, 107, 65)      # #0b6b41
bot = (8, 79, 49)        # #084f31
for y in range(H):
    t = y / H
    if t < 0.5:
        f = t / 0.5
        c = tuple(int(top[i] + (mid[i] - top[i]) * f) for i in range(3))
    else:
        f = (t - 0.5) / 0.5
        c = tuple(int(mid[i] + (bot[i] - mid[i]) * f) for i in range(3))
    d.line([(0, y), (W, y)], fill=c)

# Subtle diagonal stripes overlay
stripe = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(stripe)
for x in range(-H, W, 60):
    sd.line([(x, 0), (x + H, H)], fill=(255, 255, 255, 10), width=26)
img = Image.alpha_composite(img.convert("RGBA"), stripe).convert("RGB")
d = ImageDraw.Draw(img)

# Gold bottom border
GOLD = (217, 165, 19)
d.rectangle([0, H - 12, W, H], fill=GOLD)

bold = "/mnt/c/Windows/Fonts/segoeuib.ttf"
reg = "/mnt/c/Windows/Fonts/segoeui.ttf"
f_kicker = ImageFont.truetype(bold, 34)
f_title = ImageFont.truetype(bold, 92)
f_sub = ImageFont.truetype(reg, 40)
f_url = ImageFont.truetype(bold, 34)

M = 90  # left margin

# Kicker chip
kick = "FIFA WORLD CUP 2026"
kb = d.textbbox((0, 0), kick, font=f_kicker)
kw, kh = kb[2] - kb[0], kb[3] - kb[1]
pad = 18
d.rounded_rectangle([M, 120, M + kw + pad * 2, 120 + kh + pad * 2], radius=12, fill=GOLD)
d.text((M + pad, 120 + pad - kb[1]), kick, font=f_kicker, fill=(8, 60, 38))

# Title (two lines)
d.text((M, 230), "Хөлбөмбөгийн", font=f_title, fill="#ffffff")
d.text((M, 330), "ДАШТ 2026", font=f_title, fill="#ffffff")

# Subtitle
d.text((M, 460), "Тоглолтын хуваарь · Шууд оноо · Хэсгийн байр",
       font=f_sub, fill=(220, 240, 230))

# URL bottom-left
d.text((M, 535), "fifa-26-schedule.vercel.app", font=f_url, fill=GOLD)

# Soccer ball (right side)
cx, cy, r = 980, 300, 150
d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="#ffffff", outline=(8, 60, 38), width=6)
# central pentagon
pent = []
for i in range(5):
    a = math.radians(-90 + i * 72)
    pent.append((cx + 52 * math.cos(a), cy + 52 * math.sin(a)))
d.polygon(pent, fill=(20, 30, 26))
# outer pentagons spokes
for i in range(5):
    a = math.radians(-90 + i * 72)
    ex, ey = cx + 110 * math.cos(a), cy + 110 * math.sin(a)
    d.line([pent[i], (ex, ey)], fill=(20, 30, 26), width=8)
    sp = []
    for j in range(3):
        aa = math.radians(-90 + i * 72 - 40 + j * 40)
        sp.append((cx + 135 * math.cos(aa), cy + 135 * math.sin(aa)))
    d.line([sp[0], (ex, ey)], fill=(20, 30, 26), width=8)
    d.line([sp[2], (ex, ey)], fill=(20, 30, 26), width=8)

img.save("og-image.png", "PNG", optimize=True)
print("saved og-image.png", img.size)
