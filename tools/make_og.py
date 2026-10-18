"""Build public/og.png, the social preview card.

Composed from the real art (the night wallpaper and the official Pip render)
rather than a screenshot, so the words stay live text in the page and the card
still reads at thumbnail size.

    python tools/make_og.py
"""

import os
import random

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def font(size, names=("Fredoka-SemiBold", "Fredoka-Regular", "segoeui", "arial")):
    for n in names:
        p = f"C:/Windows/Fonts/{n}.ttf"
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/System/Library/Fonts/Helvetica.ttc"):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def main():
    a = os.path.join(ROOT, "public", "assets")
    card = Image.open(os.path.join(a, "wallpaper-night.webp")).convert("RGB").resize((W, H), Image.LANCZOS)
    card = Image.blend(card, Image.new("RGB", (W, H), (26, 22, 52)), 0.44)

    pip = Image.open(os.path.join(a, "pip-base.webp")).convert("RGBA")
    ph = 455
    pip = pip.resize((round(pip.width * ph / pip.height), ph), Image.LANCZOS)
    card.paste(pip, (W - pip.width - 60, H - pip.height - 12), pip)

    d = ImageDraw.Draw(card)
    random.seed(7)
    for _ in range(60):
        x, y = random.randint(40, W - 400), random.randint(40, H - 60)
        r = random.choice([1, 1, 2])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 245, 220))

    d.text((70, 176), "Pip’s Midnight", font=font(72), fill=(255, 248, 241))
    d.text((70, 252), "Nursery", font=font(72), fill=(255, 248, 241))
    d.text((74, 350), "I build the dreams you fall asleep inside.", font=font(32), fill=(244, 201, 107))
    d.text((74, 398), "— Pip, Junior Dream Engineer", font=font(26), fill=(239, 198, 210))
    d.text((74, 462), "a cosy 90s desktop, hidden in a nursery", font=font(26), fill=(201, 184, 232))

    out = os.path.join(ROOT, "public", "og.png")
    card.save(out, optimize=True)
    print("og.png", card.size, round(os.path.getsize(out) / 1024), "KB")


if __name__ == "__main__":
    main()
