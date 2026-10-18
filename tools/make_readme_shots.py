"""Build the screenshots the README uses, from the QA harness's own output.

    node tools/check.mjs            # produces tools/shots/*.png
    python tools/make_readme_shots.py

Writes into docs/, which is committed — tools/shots/ is git-ignored, since it
is regenerated on every QA run. Everything here is just crop-and-resize, so
the README always shows the real site rather than a mock-up.
"""

import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, "tools", "shots")
DOCS = os.path.join(ROOT, "docs")

# source -> (output name, width it is shown at)
SINGLES = {
    "desktop-1-nursery.png": ("nursery.jpg", 1200),
    "desktop-4-os.png": ("dreamos.jpg", 1200),
    "desktop-finale.png": ("finale.jpg", 1000),
}

# a row of smaller shots side by side
STRIP = ["desktop-app-lullaby.png", "desktop-app-routes.png", "desktop-secretroom.png"]
STRIP_OUT = ("projects.jpg", 1200)

# the phone layouts, side by side
PHONES = ["phone-1-nursery.png", "phone-4-os.png"]
PHONES_OUT = ("mobile.jpg", 760)


def load(name):
    p = os.path.join(SHOTS, name)
    if not os.path.exists(p):
        print(f"  ! missing {name} — run node tools/check.mjs first")
        return None
    return Image.open(p).convert("RGB")


def save(im, name, width):
    # JPEG, not PNG: these are screenshots of soft 3D renders, where PNG costs
    # half a megabyte each and JPEG costs a tenth of that with no visible loss.
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = os.path.join(DOCS, name)
    im.save(path, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"  {name:16s} {im.width}x{im.height}  {os.path.getsize(path) / 1024:.0f} KB")


def row(names, width, gap=14, bg=(31, 34, 51)):
    ims = [i for i in (load(n) for n in names) if i]
    if not ims:
        return None
    h = min(i.height for i in ims)
    ims = [i.resize((round(i.width * h / i.height), h), Image.LANCZOS) for i in ims]
    sheet = Image.new("RGB", (sum(i.width for i in ims) + gap * (len(ims) - 1), h), bg)
    x = 0
    for i in ims:
        sheet.paste(i, (x, 0))
        x += i.width + gap
    return sheet


def main():
    os.makedirs(DOCS, exist_ok=True)
    for src, (out, w) in SINGLES.items():
        im = load(src)
        if im:
            save(im, out, w)
    strip = row(STRIP, STRIP_OUT[1])
    if strip:
        save(strip, *STRIP_OUT)
    phones = row(PHONES, PHONES_OUT[1])
    if phones:
        save(phones, *PHONES_OUT)


if __name__ == "__main__":
    main()
