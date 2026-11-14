#!/usr/bin/env python3
"""Build a review-only 40x44 PNG from six existing raster layers.

Never marks the frame approved or calls it a recovered run11 original.
Usage: python oronzo/assets/players/r13-match/_drafts/run-right/compose-pose-05.py
"""
from pathlib import Path
from PIL import Image
import hashlib
import io
import struct

ROOT = Path(__file__).resolve().parent
PARTS = ("legs", "boots", "shorts", "jersey", "arms", "head")
SIZE = (40, 44)
# Explicit draft placement: jersey source is 24x31, not a 40x44 canvas.
# Review the (8, 6) offset visually before promoting any frame.
PLACEMENTS = {"jersey": (8, 6)}
OUTPUT = ROOT / "run-right-05-full-composite-DRAFT.png"

def main():
    result = Image.new("RGBA", SIZE)
    for part in PARTS:
        path = ROOT / f"run-right-05-{part}-layer-DRAFT.png"
        with Image.open(path) as source:
            source.load()
            if source.mode != "RGBA":
                raise ValueError(f"{path.name}: expected RGBA, got {source.mode}")
            if part in PLACEMENTS:
                if source.size != (24, 31):
                    raise ValueError(f"{path.name}: expected (24, 31), got {source.size}")
                result.alpha_composite(source, PLACEMENTS[part])
            else:
                if source.size != SIZE:
                    raise ValueError(f"{path.name}: expected {SIZE}, got {source.size}; refuse silent stretch")
                result.alpha_composite(source)
    result.save(OUTPUT, format="PNG", optimize=False)
    data = OUTPUT.read_bytes()
    gitsha = hashlib.sha1(b"blob " + str(len(data)).encode() + bytes([0]) + data).hexdigest()
    with Image.open(io.BytesIO(data)) as check:
        check.verify()
    print(f"{OUTPUT.name}: {len(data)} bytes, Git blob SHA {gitsha}, RGBA {SIZE}, DRAFT/FAIL")
    print("Pivots, anatomical joins and animation continuity NOT certified")

if __name__ == "__main__":
    main()
