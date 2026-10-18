"""Find the pieces inside a collage sheet.

The art in art-raw/ arrived as collage sheets: several assets laid out in one
picture. This prints the bounding box of every distinct piece so the boxes can
be curated into tools/crops.json (which is what actually drives the build).

    python tools/art_scan.py art-raw/batch2.png
    python tools/art_scan.py art-raw/batch3.png --mode=panels

Two strategies:
  objects : connected components of "not the background colour" (objects
            floating on a white/cream sheet)
  panels  : rows/columns of background-coloured gutter (scene grids)
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image


def background_mask(arr, tol=18):
    """True where the pixel looks like the sheet's background."""
    h, w, _ = arr.shape
    # sample the four corners; sheets are white or cream
    corners = np.concatenate(
        [
            arr[0:8, 0:8].reshape(-1, 3),
            arr[0:8, w - 8 : w].reshape(-1, 3),
            arr[h - 8 : h, 0:8].reshape(-1, 3),
            arr[h - 8 : h, w - 8 : w].reshape(-1, 3),
        ]
    )
    bg = np.median(corners, axis=0)
    dist = np.abs(arr.astype(np.int16) - bg.astype(np.int16)).max(axis=2)
    return dist <= tol, bg


def components(mask, min_area):
    """Label 4-connected True regions. Iterative flood fill (no scipy)."""
    h, w = mask.shape
    seen = np.zeros((h, w), dtype=bool)
    boxes = []
    for y in range(h):
        row = mask[y]
        for x in range(w):
            if not row[x] or seen[y, x]:
                continue
            x0 = x1 = x
            y0 = y1 = y
            area = 0
            stack = [(y, x)]
            seen[y, x] = True
            while stack:
                cy, cx = stack.pop()
                area += 1
                if cx < x0:
                    x0 = cx
                if cx > x1:
                    x1 = cx
                if cy < y0:
                    y0 = cy
                if cy > y1:
                    y1 = cy
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            if area >= min_area:
                boxes.append({"box": [x0, y0, x1 + 1, y1 + 1], "area": area})
    return boxes


def find_objects(path, tol, min_frac, downscale):
    im = Image.open(path).convert("RGB")
    full_w, full_h = im.size
    small = im.resize((full_w // downscale, full_h // downscale), Image.BOX)
    arr = np.asarray(small)
    bg, bgcol = background_mask(arr, tol)
    fg = ~bg
    min_area = int(fg.size * min_frac)
    boxes = components(fg, min_area)
    # back to full-resolution coordinates, with a small margin
    out = []
    for b in boxes:
        x0, y0, x1, y1 = [v * downscale for v in b["box"]]
        m = 4
        out.append(
            {
                "box": [max(0, x0 - m), max(0, y0 - m), min(full_w, x1 + m), min(full_h, y1 + m)],
                "area": b["area"] * downscale * downscale,
            }
        )
    # row-major: group into rows by vertical overlap, then sort each row by x
    out.sort(key=lambda b: b["box"][1])
    rows, cur = [], []
    for b in out:
        if not cur:
            cur = [b]
            continue
        top = min(c["box"][1] for c in cur)
        bot = max(c["box"][3] for c in cur)
        if b["box"][1] < bot - (bot - top) * 0.4:
            cur.append(b)
        else:
            rows.append(cur)
            cur = [b]
    if cur:
        rows.append(cur)
    ordered = []
    for r in rows:
        r.sort(key=lambda b: b["box"][0])
        ordered.extend(r)
    return ordered, bgcol, (full_w, full_h)


def find_panels(path, tol, downscale):
    """Scene grids: find gutters — full rows/columns that are background."""
    im = Image.open(path).convert("RGB")
    full_w, full_h = im.size
    small = im.resize((full_w // downscale, full_h // downscale), Image.BOX)
    arr = np.asarray(small)
    bg, bgcol = background_mask(arr, tol)
    h, w = bg.shape

    def runs(is_gutter):
        """Return the spans BETWEEN gutters."""
        spans, start = [], None
        for i, g in enumerate(is_gutter):
            if not g and start is None:
                start = i
            elif g and start is not None:
                spans.append((start, i))
                start = None
        if start is not None:
            spans.append((start, len(is_gutter)))
        return spans

    row_gutter = bg.mean(axis=1) > 0.97
    col_gutter = bg.mean(axis=0) > 0.97
    y_spans = [s for s in runs(row_gutter) if s[1] - s[0] > h * 0.05]
    out = []
    for y0, y1 in y_spans:
        band = bg[y0:y1]
        cg = band.mean(axis=0) > 0.97
        x_spans = [s for s in runs(cg) if s[1] - s[0] > w * 0.04]
        for x0, x1 in x_spans:
            out.append(
                {
                    "box": [x0 * downscale, y0 * downscale, x1 * downscale, y1 * downscale],
                    "area": (x1 - x0) * (y1 - y0) * downscale * downscale,
                }
            )
    return out, bgcol, (full_w, full_h)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sheet")
    ap.add_argument("--mode", choices=["objects", "panels"], default="objects")
    ap.add_argument("--tol", type=int, default=18)
    ap.add_argument("--min-frac", type=float, default=0.0015)
    ap.add_argument("--downscale", type=int, default=2)
    a = ap.parse_args()

    if a.mode == "panels":
        boxes, bgcol, size = find_panels(a.sheet, a.tol, a.downscale)
    else:
        boxes, bgcol, size = find_objects(a.sheet, a.tol, a.min_frac, a.downscale)

    print(f"# {a.sheet}  {size[0]}x{size[1]}  bg~{[int(c) for c in bgcol]}  {len(boxes)} pieces")
    for i, b in enumerate(boxes):
        x0, y0, x1, y1 = b["box"]
        print(f"{i:3d}  box=[{x0},{y0},{x1},{y1}]  {x1 - x0}x{y1 - y0}")
    print(json.dumps([b["box"] for b in boxes]))


if __name__ == "__main__":
    sys.exit(main())
