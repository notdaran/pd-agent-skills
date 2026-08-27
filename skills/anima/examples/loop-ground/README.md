# loop-ground - a footage piece that loops

14.80s, 1624x854, 60fps. The worked reference for `components/loop-ground.html` and for
`references/footage-pieces.md` sections 9-11. Render with `npx hyperframes render` from here.

    card (static) -> findings -> [fix, real footage] -> "now scan again" -> [rescan -> 91] -> card

The last frame is the first frame: **48.6 dB PSNR**, i.e. H.264 dithering on the navy gradient and
nothing else. There is no `loop-tail` veil anywhere in it.

## What this example is here to demonstrate

1. **A footage piece CAN loop** (SKILL.md hard rule 6b) - by returning to frame 0's *state*, not
   by fading to a veil.
2. **One continuous ground.** A single navy `#ground` owns both glows for the whole runtime;
   beats are transparent clusters that travel over it. No light/dark strobing.
3. **Slide, don't dissolve, into a light app UI.** Every navy<->footage join is a vertical slide
   with a hard edge, so the two brightnesses never blend. That is what makes the light Layer B
   preset unnecessary here - see `footage-pieces.md` -> 5, which is scoped to dissolves.
4. **Overlap / follow-through.** Cluster children stagger 0.04-0.07s; no cluster moves as a block.
5. **Tiered joins**, not one uniform crossfade.

## Regenerating the two cuts

The clips in `assets/` are pre-cut, so the example renders as-is. To re-derive them from the
original screen recording (not in the repo - it is a 15 MB capture of the PageFly editor):

    # f1 - the CTA landing in the hero. MUST NOT run past 9.40: the recorder zooms back out
    # at ~9.5 and the operator's personal browser tab strip returns to frame.
    ffmpeg -ss 6.30 -to 9.40 -i SRC.mp4 \
      -vf "crop=1390:730:116:252,scale=1624:854:flags=lanczos,tpad=stop_mode=clone:stop_duration=0.45" \
      -an -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 60 assets/f1.mp4 -y

    # f2 - the rescan and the 91 reveal. The 1.10s clone-freeze buys the hold on the number
    # that the source does not contain (only 1.73s remain after the score flips).
    ffmpeg -ss 17.53 -to 21.03 -i SRC.mp4 \
      -vf "crop=1472:774:132:132,scale=1624:854:flags=lanczos,tpad=stop_mode=clone:stop_duration=1.10" \
      -an -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 60 assets/f2.mp4 -y

Both crops came from `scripts/solve-crop.py solve`, never from eyeballing, and both were proved
with `scripts/solve-crop.py verify` (24 samples each, zero window backdrop on any edge). The
canvas is 1624x854 because that is the capture's own usable geometry - not a house size.

## Before changing anything here

Read the header comment in `index.html`. It records five traps that each cost a full render,
including the two that pass `lint`, `check` AND `render` while being visibly broken: a mis-closed
`<div>` that silently reparents the whole piece, and a cluster wrapped in an extra `.stage` that
loses its width *only while moving*.
