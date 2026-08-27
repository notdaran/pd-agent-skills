#!/usr/bin/env python3
"""
solve-crop.py - work out a safe, border-free crop for a screen capture, and prove it.

Why this exists: on `checkup-hero` the crop was got wrong three times by eye and by contact
sheet. Both failures are invisible at thumbnail size and obvious at full size:
  * a crop tight to the "app region" cut a real inspector panel out of the shot, because a
    brightness-only test called the editor's own white panels (253,253,253) "window backdrop";
  * a crop that looked fine mid-shot still showed the browser tab strip on frame 0, because the
    recorder's auto-zoom was still settling at the cut's in-point.
Both are solved by measuring across the cut's WHOLE duration and testing chroma, not brightness.

Usage
  solve  - print an ffmpeg crop=W:H:X:Y for one cut
    python3 solve-crop.py solve CLIP IN OUT --aspect 1624/854 [--bias 0.75] [--zoom 1.2]
  verify - scan a PRE-CUT SEGMENT for window backdrop / tab strip on any edge
    python3 solve-crop.py verify CUT.mp4 [--samples 24]

    Run this on each cut BEFORE composing, never on the finished render: a composition that has
    light card scenes will false-positive, because a *designed* pale background is genuinely
    indistinguishable from a window backdrop at the frame edge. Cuts are the thing to prove.

`--bias` places the crop vertically inside the available slack: 0 = top, 1 = bottom.
Raise it when the beat's hero action sits low in frame (the drag-and-drop shot needed 0.75).
"""
import argparse, os, subprocess, sys, tempfile
from collections import Counter

try:
    from PIL import Image
except ImportError:
    sys.exit("needs Pillow:  pip install Pillow")

BACKDROP_OVERRIDE = None
INSET = 20          # clears the window's grey rail (~6px) and its rounded corners
CHROME_ROW_FRAC = 0.25   # a real tab strip makes a QUARTER of a row warm; a badge does not


def frame(clip, t, tmp):
    p = os.path.join(tmp, "f.png")
    subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", clip,
                    "-frames:v", "1", p, "-y"], check=True)
    return Image.open(p).convert("RGB")


def duration(f):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", f]).strip())


def detect_backdrop(px, W, H):
    """The OS window backdrop, read off the frame corners. None when the frame is already full-bleed.

    It MUST reject neutral colours. The app's own panels are white (253,253,253); a zoomed frame
    has them in every corner, and accepting that as "backdrop" makes the whole UI look like
    background - the first version of this script did exactly that and returned a crop 40% too
    small. A real OS backdrop here carries a colour cast (238,244,246 -> G-R=6, B-R=8). If a
    capture ever has a truly neutral backdrop, pass --backdrop R,G,B explicitly.
    """
    if BACKDROP_OVERRIDE is not None:
        return BACKDROP_OVERRIDE
    c = Counter(px[x, y] for x in (2, 6, W - 3, W - 7) for y in (2, 6, H - 3, H - 7))
    col, n = c.most_common(1)[0]
    cast = abs(col[1] - col[0]) + abs(col[2] - col[0])
    return col if n >= 3 and col[0] > 200 and cast >= 4 else None


def make_is_backdrop(col):
    """Match the backdrop by CHROMA as well as level.

    The macOS backdrop in these captures is (238,244,246): G-R=6, B-R=8. The editor's own white
    panels are (253,253,253): neutral. A level-only test merges the two - that is the bug that
    cropped a real panel away. Requiring the same colour CAST separates them.
    """
    if col is None:
        return lambda c: False
    dg, db = col[1] - col[0], col[2] - col[0]
    return lambda c: (abs(c[0] - col[0]) <= 6
                      and abs((c[1] - c[0]) - dg) <= 3
                      and abs((c[2] - c[0]) - db) <= 3)


def is_warm(c):
    """Browser tab/bookmark strip: a dark warm band. Tuned to this capture set's browser theme."""
    return 25 < c[0] < 200 and c[0] - c[1] >= 12 and c[0] - c[2] >= 12


def content_box(clip, a, b, step=0.15):
    """Intersection, over the whole cut, of the non-backdrop box; plus the worst-case chrome depth.

    Intersecting over the WHOLE cut is the point: sampling once mid-shot misses the frames where
    the recorder's zoom has not settled yet, which is how the tab strip survived on frame 0.
    """
    L = T = R = B = None
    chrome = -1
    with tempfile.TemporaryDirectory() as tmp:
        t = a
        while t < b + 1e-6:
            im = frame(clip, t, tmp)
            px, (W, H) = im.load(), im.size
            is_bd = make_is_backdrop(detect_backdrop(px, W, H))
            for y in range(0, min(320, H)):
                if sum(1 for x in range(0, W, 8) if is_warm(px[x, y])) > (W // 8) * CHROME_ROW_FRAC:
                    chrome = max(chrome, y)
            rows = range(max(0, H // 3), H - 40, 60)
            cols = range(W // 12, W - W // 12, 90)
            l = max(next((x for x in range(W) if not is_bd(px[x, y])), 0) for y in rows)
            r = min(next((x for x in range(W - 1, -1, -1) if not is_bd(px[x, y])), W - 1) for y in rows)
            tp = max(next((y for y in range(H) if not is_bd(px[x, y])), 0) for x in cols)
            bt = min(next((y for y in range(H - 1, -1, -1) if not is_bd(px[x, y])), H - 1) for x in cols)
            L = l if L is None else max(L, l);   R = r if R is None else min(R, r)
            T = tp if T is None else max(T, tp); B = bt if B is None else min(B, bt)
            t += step
    T = max(T, chrome + 6 if chrome >= 0 else 0)
    return L + INSET, T + INSET, R - INSET, B - INSET, chrome


def cmd_solve(args):
    num, den = (float(v) for v in args.aspect.split("/"))
    ar = num / den
    L, T, R, B, chrome = content_box(args.clip, args.start, args.end)
    bw, bh = R - L, B - T
    w = min(bw, bh * ar); h = w / ar
    w /= args.zoom; h /= args.zoom
    x = L + (bw - w) / 2
    y = T + (bh - h) * args.bias
    w, h, x, y = (int(round(v / 2) * 2) for v in (w, h, x, y))
    print(f"content box (inset {INSET}px): x {L}..{R}  y {T}..{B}"
          + (f"   [tab strip ends y={chrome}]" if chrome >= 0 else "   [no tab strip]"))
    print(f"crop={w}:{h}:{x}:{y}     scale to {int(num)}x{int(den)} = {num/w:.3f}x")
    print(f'\nffmpeg -ss {args.start} -to {args.end} -i "{args.clip}" \\\n'
          f'  -vf "crop={w}:{h}:{x}:{y},scale={int(num)}:{int(den)}:flags=lanczos" \\\n'
          f'  -an -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 60 out.mp4 -y')


def cmd_verify(args):
    d = duration(args.file)
    problems = []
    with tempfile.TemporaryDirectory() as tmp:
        for i in range(args.samples):
            t = max(0, d * i / max(1, args.samples - 1) - 0.02)
            im = frame(args.file, t, tmp)
            px, (W, H) = im.load(), im.size
            is_bd = make_is_backdrop(detect_backdrop(px, W, H))
            edges = {"top":    [(x, 0) for x in range(W)],
                     "bottom": [(x, H - 1) for x in range(W)],
                     "left":   [(0, y) for y in range(H)],
                     "right":  [(W - 1, y) for y in range(H)]}
            for name, pts in edges.items():
                run = best = 0
                for p in pts:                     # RUN length, not a pixel count: scattered
                    run = run + 1 if is_bd(px[p]) else 0   # hits are the app's own pale UI,
                    best = max(best, run)                  # a run of 40+ is a real border.
                if best >= 40:
                    problems.append(f"  t={t:6.2f}s  {name} edge: {best}px of window backdrop")
            if [y for y in range(0, 60)
                    if sum(1 for x in range(0, W, 8) if is_warm(px[x, y])) > (W // 8) * CHROME_ROW_FRAC]:
                problems.append(f"  t={t:6.2f}s  browser tab strip visible at the top")
    if problems:
        print(f"FAIL - {len(problems)} problem(s) across {args.samples} samples:")
        print("\n".join(problems[:40]))
        sys.exit(1)
    print(f"PASS - {args.samples} samples, no window backdrop or tab strip on any edge")


p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
sub = p.add_subparsers(dest="cmd", required=True)
s = sub.add_parser("solve"); s.add_argument("clip"); s.add_argument("start", type=float)
s.add_argument("end", type=float); s.add_argument("--aspect", default="1624/854")
s.add_argument("--bias", type=float, default=0.5); s.add_argument("--zoom", type=float, default=1.0)
s.add_argument("--backdrop", default=None, help="R,G,B if auto-detect fails (rare)")
s.set_defaults(func=cmd_solve)
v = sub.add_parser("verify"); v.add_argument("file"); v.add_argument("--samples", type=int, default=24)
v.add_argument("--backdrop", default=None, help="R,G,B if auto-detect fails (rare)")
v.set_defaults(func=cmd_verify)
a = p.parse_args()
if getattr(a, "backdrop", None):
    BACKDROP_OVERRIDE = tuple(int(v) for v in a.backdrop.split(","))
a.func(a)
