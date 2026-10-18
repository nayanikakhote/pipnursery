"""Turn the collage sheets in art-raw/ into the WebP files the site loads.

    pip install Pillow numpy
    python tools/process_art.py              # everything
    python tools/process_art.py pip-yawn     # just these ids
    python tools/process_art.py --contact    # also write a contact sheet to look at

Reads tools/crops.json. Writes:
    art-raw/by-id/<id>.png     the raw crop, for eyeballing
    public/assets/<id>.webp    the processed, shipped file
    src/content/art.gen.ts     a typed registry of what actually exists
    tools/art-report.txt       sizes, and anything that came out too small

Background removal is done by keying the sheet's own near-white/cream
background rather than with a segmentation model: these objects are rendered on
a flat studio background, so a colour key plus a largest-component pass is both
cleaner at these sizes and keeps the pipeline dependency-light.
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "art-raw"
BYID = RAW / "by-id"
OUT = ROOT / "public" / "assets"
REPORT = ROOT / "tools" / "art-report.txt"
GEN = ROOT / "src" / "content" / "art.gen.ts"

# How wide each asset is actually drawn, at 2x, so nothing ships bigger than it
# needs to be. Anything not listed keeps its natural size (capped at MAX).
DISPLAY_2X = {
    "wallpaper-night": 1920,
    "wallpaper-sunrise": 1920,
    "routes-map": 1400,
    "growth-wall": 760,
    "secret-room": 1200,
    "crt-desk": 900,
    "dreampad-frame": 800,
    "nursery-diorama": 700,
}
MAX = 1600
PREFIX_2X = {"story-": 1360, "book-": 900, "icon-": 128, "sticker-": 160, "pixel-pip-": 160}


# ----------------------------------------------------------------- keying
def keep_big_blobs(solid, keep_frac=0.03):
    """Drop stray specks: keep blobs at least keep_frac of the biggest one."""
    lab, n = ndimage.label(solid)
    if n == 0:
        return solid
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    biggest = sizes.max()
    keep = {i + 1 for i, s in enumerate(sizes) if s >= biggest * keep_frac}
    return np.isin(lab, list(keep))


def key_background(im, tol=6, fringe_tol=30, grow=5):
    """Cut the studio backdrop away.

    Pip is cream and so are several of the sheets, so a plain colour threshold
    eats half of Pip. Two stages instead:

    1. flood the backdrop colour inwards from the border at a *tight*
       tolerance, so only what the border can actually reach is removed —
       interior cream (Pip's face, a cloud, a cream onesie) is kept;
    2. grow that backdrop a few pixels at a looser tolerance, which peels off
       the anti-aliased fringe without ever crossing into the subject.
    """
    arr = np.asarray(im.convert("RGB")).astype(np.int16)
    h, w, _ = arr.shape
    corners = np.concatenate(
        [
            arr[0:10, 0:10].reshape(-1, 3),
            arr[0:10, w - 10 : w].reshape(-1, 3),
            arr[h - 10 : h, 0:10].reshape(-1, 3),
            arr[h - 10 : h, w - 10 : w].reshape(-1, 3),
        ]
    )
    bg = np.median(corners, axis=0)
    dist = np.abs(arr - bg).max(axis=2)
    similar = dist <= tol

    seeds = np.zeros((h, w), dtype=bool)
    seeds[0, :] = seeds[-1, :] = True
    seeds[:, 0] = seeds[:, -1] = True
    seeds &= similar
    lab, _ = ndimage.label(similar)
    bg_labels = set(np.unique(lab[seeds])) - {0}
    backdrop = np.isin(lab, list(bg_labels)) if bg_labels else np.zeros((h, w), bool)

    fringe = dist <= fringe_tol
    for _ in range(grow):
        backdrop |= ndimage.binary_dilation(backdrop, border_value=1) & fringe

    solid = keep_big_blobs(~backdrop)
    alpha = (solid * 255).astype(np.uint8)
    rgba = im.convert("RGBA")
    rgba.putalpha(Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.7)))
    return rgba


def key_green(im, tol=90, bg_kw=None):
    """Green screen -> transparent. Returns the image and the screen's box."""
    arr = np.asarray(im.convert("RGB")).astype(np.int16)
    g = arr[:, :, 1]
    r = arr[:, :, 0]
    b = arr[:, :, 2]
    greenish = (g > 120) & (g - r > tol) & (g - b > tol)
    rgba = np.asarray(im.convert("RGBA")).copy()
    rgba[greenish, 3] = 0
    # de-spill the halo one pixel in
    ys, xs = np.where(greenish)
    box = None
    if len(ys):
        box = [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]
    out = Image.fromarray(rgba, "RGBA")
    # also key the white sheet around the device
    out = Image.alpha_composite(Image.new("RGBA", out.size, (0, 0, 0, 0)), out)
    cut = key_background(im, **(bg_kw or {}))
    cut_a = np.asarray(cut)[:, :, 3]
    final = np.asarray(out).copy()
    final[:, :, 3] = np.minimum(final[:, :, 3], cut_a)
    return Image.fromarray(final, "RGBA"), box


def wipe_ground_shadow(im, band=0.16, tol=22):
    """Erase the soft white shadow a render leaves under an object.

    It can't be keyed by colour: on these lamps the shadow (7-25 from white)
    and the lightest parts of the subject (a cloud's puffs, 6-15) occupy the
    same range, so any tolerance that catches one eats the other. But the
    shadow only ever lies in a band at the very bottom, and everything of the
    subject down there is saturated cream (100+ from white). So the rule is
    positional: in the bottom `band` of the image, drop what is within `tol`
    of white.
    """
    arr = np.asarray(im.convert("RGBA")).copy()
    h = arr.shape[0]
    y0 = int(h * (1 - band))
    sub = arr[y0:, :, :3].astype(np.int16)
    near_white = np.abs(sub - 255).max(axis=2) <= tol
    arr[y0:, :, 3][near_white] = 0
    return Image.fromarray(arr, "RGBA")


def trim(im):
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


# ----------------------------------------------------------------- output
def target_width(name, natural):
    if name in DISPLAY_2X:
        return DISPLAY_2X[name]
    for p, wmax in PREFIX_2X.items():
        if name.startswith(p):
            return wmax
    return min(natural, MAX)


def save(im, name, report, min_display=None):
    OUT.mkdir(parents=True, exist_ok=True)
    natural = im.width
    tw = target_width(name, natural)
    if im.width > tw:
        im = im.resize((tw, max(1, round(im.height * tw / im.width))), Image.LANCZOS)
    elif im.width < tw * 0.7:
        # upscale a weak crop, then put a little bite back into it
        scale = min(2.0, tw / max(im.width, 1))
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        if im.mode == "RGBA":
            a = im.getchannel("A")
            im = im.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=3))
            im.putalpha(a)
        else:
            im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=3))
        report.append(f"  ! {name}: crop was only {natural}px wide for a {tw}px slot — upscaled")
    path = OUT / f"{name}.webp"
    has_alpha = im.mode == "RGBA" and np.asarray(im)[:, :, 3].min() < 250
    im.save(path, "WEBP", quality=85, method=6, lossless=False)
    kb = path.stat().st_size / 1024
    report.append(f"  {name:22s} {im.width:4d}x{im.height:<4d} {kb:6.1f} KB{'  (alpha)' if has_alpha else ''}")
    return {"w": im.width, "h": im.height, "kb": round(kb, 1)}


# ----------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--contact", action="store_true")
    a = ap.parse_args()

    spec = json.loads((ROOT / "tools" / "crops.json").read_text(encoding="utf-8"))
    BYID.mkdir(parents=True, exist_ok=True)
    report = ["Pip's Midnight Nursery — art pipeline report", ""]
    made = {}
    screens = {}
    sheets = {}

    for piece in spec["pieces"]:
        if a.ids and piece["id"] not in a.ids:
            continue
        sheet = piece["sheet"]
        if sheet not in sheets:
            sheets[sheet] = Image.open(RAW / f"{sheet}.png").convert("RGB")
        src = sheets[sheet]
        x0, y0, x1, y1 = piece["box"]
        crop = src.crop((x0, y0, x1, y1))
        mode = piece["mode"]
        ship = piece.get("ship", True)

        if mode == "grid":
            cols, rows = piece["cols"], piece["rows"]
            cw = crop.width / cols
            ch = crop.height / rows
            for i, cell in enumerate(piece["names"]):
                cx, cy = i % cols, i // cols
                sub = crop.crop((round(cx * cw), round(cy * ch), round((cx + 1) * cw), round((cy + 1) * ch)))
                name = f"{piece['id']}-{cell}"
                sub.save(BYID / f"{name}.png")
                kw = {k: piece[k] for k in ("tol", "fringe_tol", "grow") if k in piece}
                img = trim(key_background(sub, **kw)) if piece.get("cut") else sub
                if ship:
                    made[name] = save(img, name, report)
            continue

        crop.save(BYID / f"{piece['id']}.png")
        kw = {k: piece[k] for k in ("tol", "fringe_tol", "grow") if k in piece}
        if mode == "cut":
            img = key_background(crop, **kw)
            if piece.get("shadow_floor"):
                img = wipe_ground_shadow(img, band=float(piece["shadow_floor"]))
            img = trim(img)
        elif mode == "green":
            img, box = key_green(crop, bg_kw=kw)
            if box:
                # where the live screen sits, as % of the finished image
                bb = img.getbbox() or (0, 0, img.width, img.height)
                sw, sh = bb[2] - bb[0], bb[3] - bb[1]
                screens[piece["id"]] = {
                    "left": round((box[0] - bb[0]) / sw * 100, 2),
                    "top": round((box[1] - bb[1]) / sh * 100, 2),
                    "width": round((box[2] - box[0]) / sw * 100, 2),
                    "height": round((box[3] - box[1]) / sh * 100, 2),
                }
            img = trim(img)
        else:
            img = crop
        if ship:
            made[piece["id"]] = save(img, piece["id"], report)
        else:
            report.append(f"  {piece['id']:22s} reference only, not shipped")

    # ------------------------------------------------------- generated registry
    # Only a full run may rewrite it, or a filtered run would drop everything else.
    if a.ids:
        print(chr(10).join(report))
        print(chr(10) + "(partial run: src/content/art.gen.ts left alone)")
        return
    lines = [
        "// GENERATED by tools/process_art.py — do not edit by hand.",
        "// Every entry is a file that really exists in public/assets.",
        "import { asset } from '../lib/asset';",
        "",
        "export const ART_SIZES: Record<string, { w: number; h: number }> = {",
    ]
    for k, v in sorted(made.items()):
        lines.append(f"  '{k}': {{ w: {v['w']}, h: {v['h']} }},")
    lines += [
        "};",
        "",
        "/** Path to a processed image, or undefined if that art was never made. */",
        "export function art(name: string): string | undefined {",
        "  return name in ART_SIZES ? asset(`assets/${name}.webp`) : undefined;",
        "}",
        "",
        "/** Where the live DOM screen sits on a green-screened device, in %. */",
        "export const SCREENS: Record<string, { left: number; top: number; width: number; height: number }> = {",
    ]
    for k, v in sorted(screens.items()):
        lines.append(f"  '{k}': {{ left: {v['left']}, top: {v['top']}, width: {v['width']}, height: {v['height']} }},")
    lines += ["};", ""]
    GEN.write_text("\n".join(lines), encoding="utf-8")

    report.append("")
    report.append(f"{len(made)} images written to public/assets/")
    total = sum(v["kb"] for v in made.values())
    report.append(f"total {total/1024:.2f} MB")
    REPORT.write_text("\n".join(report), encoding="utf-8")
    print("\n".join(report))

    if a.contact:
        cols = 8
        thumb = 150
        items = sorted(made)
        rows = (len(items) + cols - 1) // cols
        sheetimg = Image.new("RGB", (cols * thumb, rows * thumb), (48, 54, 78))
        for i, name in enumerate(items):
            im = Image.open(OUT / f"{name}.webp").convert("RGBA")
            im.thumbnail((thumb - 8, thumb - 8))
            px = (i % cols) * thumb + (thumb - im.width) // 2
            py = (i // cols) * thumb + (thumb - im.height) // 2
            sheetimg.paste(im, (px, py), im)
        p = ROOT / "tools" / "shots" / "contact.png"
        p.parent.mkdir(parents=True, exist_ok=True)
        sheetimg.save(p)
        print(f"\ncontact sheet -> {p}")


if __name__ == "__main__":
    sys.exit(main())
