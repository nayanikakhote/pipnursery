"""Build every favicon and app icon from one drawing of Pip's head.

    pip install Pillow numpy
    python tools/make_favicons.py

Reads only art-raw/favicon.* and writes only into public/:

    favicon.ico           16, 32 and 48 px in one file
    favicon-16.png
    favicon-32.png
    apple-touch-icon.png  180x180
    icon-192.png
    icon-512.png

Nothing else in art-raw/ or public/assets/ is read or written, and
tools/process_art.py is not involved.

The source has a transparent background, so everything is composited onto the
site's navy first — a transparent favicon reads as a hole in most browser
chrome. The head is cropped square around its own bounding box, and the two
small sizes get a sharpen pass afterwards, because Pip's face is mostly soft
gradients and those turn to mush at 16px without it.
"""

import os
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "art-raw")
OUT = os.path.join(ROOT, "public")

NAVY = (48, 54, 78)
ICO_SIZES = (16, 32, 48)
PNGS = {"favicon-16.png": 16, "favicon-32.png": 32, "apple-touch-icon.png": 180, "icon-192.png": 192, "icon-512.png": 512}

# How much of the square is head, 0-1. 0.88 keeps the nightcap's pom-pom and
# bow inside the frame.
HEAD_FILL = 0.88

# At 16 and 32px the whole head is unreadable: the nightcap takes most of the
# square and the eyes land on about two pixels. The small sizes use a tighter
# square over the face instead, given as a fraction of the head's bounding box.
FACE_BOX = (0.26, 0.34, 1.0, 1.02)
SMALL = 32


def find_source():
    for name in sorted(os.listdir(RAW)):
        stem, ext = os.path.splitext(name)
        if stem.lower() == "favicon" and ext.lower() in (".png", ".webp", ".jpg", ".jpeg"):
            return os.path.join(RAW, name)
    sys.exit("no art-raw/favicon.* found")


def square_around_head(im):
    """Crop to a square centred on the drawing's own bounding box."""
    rgba = im.convert("RGBA")
    a = np.asarray(rgba)[:, :, 3]
    if a.min() < 250:
        ys, xs = np.where(a > 24)
    else:
        # already opaque: fall back to "not the corner colour"
        rgb = np.asarray(rgba)[:, :, :3].astype(int)
        bg = rgb[0, 0]
        ys, xs = np.where(np.abs(rgb - bg).max(axis=2) > 20)
    if not len(ys):
        return rgba
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    side = max(x1 - x0, y1 - y0) / HEAD_FILL
    half = side / 2
    box = (round(cx - half), round(cy - half), round(cx + half), round(cy + half))
    # crop() pads with transparent outside the image, which is what we want
    return rgba.crop(box)


def face_square(head):
    """A tighter square over just the face, for the small icons."""
    w, h = head.size
    l, t, r, b = FACE_BOX
    box = (w * l, h * t, w * r, h * b)
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    half = max(box[2] - box[0], box[3] - box[1]) / 2
    return head.crop((round(cx - half), round(cy - half), round(cx + half), round(cy + half)))


def on_navy(im, size, sharpen):
    small = im.resize((size, size), Image.LANCZOS)
    card = Image.new("RGBA", (size, size), NAVY + (255,))
    card.alpha_composite(small)
    card = card.convert("RGB")
    if sharpen:
        card = card.filter(ImageFilter.UnsharpMask(radius=0.7, percent=135, threshold=0))
    return card


def main():
    src = find_source()
    head = square_around_head(Image.open(src))
    print(f"source {os.path.basename(src)} -> square {head.size}")

    os.makedirs(OUT, exist_ok=True)
    face = face_square(head)
    for name, size in PNGS.items():
        img = on_navy(face if size <= SMALL else head, size, sharpen=size <= SMALL)
        path = os.path.join(OUT, name)
        img.save(path, "PNG", optimize=True)
        print(f"  {name:22s} {size}x{size}  {os.path.getsize(path) / 1024:.1f} KB")

    ico_path = os.path.join(OUT, "favicon.ico")
    frames = [on_navy(face if s <= SMALL else head, s, sharpen=s <= SMALL) for s in ICO_SIZES]
    # Pillow writes every requested size into the one .ico
    frames[-1].save(ico_path, format="ICO", sizes=[(s, s) for s in ICO_SIZES])
    print(f"  {'favicon.ico':22s} {', '.join(f'{s}x{s}' for s in ICO_SIZES)}  {os.path.getsize(ico_path) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
