# pd-agent-skills

Agent skills I use for product-development work.

A skill is a folder of instructions - plus a renderer, where one is needed -
that a coding agent loads on demand. They are written for Claude Code, but the
instructions are plain Markdown, so any agent that can read a folder can use
them.

What they have in common: each one encodes a piece of taste that would otherwise
have to be re-explained every time. Not "make me an image", but the sixteen
composition rules, the measured timing, the rule about never letting a model
redraw a real screenshot.

English · [Tiếng Việt](./README-vi.md)

## Skills

| Skill | Makes | |
|---|---|---|
| [`feature-demo`](./skills/feature-demo) | A real UI screenshot inside a brand frame: App Store hero, social tile, blog header | [readme](./skills/feature-demo/README.md) |
| [`illustra`](./skills/illustra) | The illustration inside one marketing card: framed screenshots blended with hand-drawn vector UI, exported as a transparent PNG | [readme](./skills/illustra/README.md) |
| [`anima`](./skills/anima) | A short on-brand motion piece: teaser, announcement video, animated hero | [readme](./skills/anima/README.md) |

[`_pf-brand`](./skills/_pf-brand) is not a skill - it is the shared brand
identity the visual skills read from.

The three overlap at the edges, so the short version of who does what: a
screenshot in a frame is `feature-demo`; art drawn around a screenshot is
`illustra`; anything that moves is `anima`.

## Install

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

`install.sh` symlinks each skill into `~/.claude/skills/` and copies any slash
commands into `~/.claude/commands/`. Because they are symlinks, `git pull` here
updates the installed skills in place. Existing entries are never overwritten -
anything already there is reported and skipped.

Each skill needs one setup step before first use. Its own readme says so, and
`install.sh` prints the reminder:

```bash
cd skills/feature-demo && npm install && npx playwright install chromium
cd skills/illustra && npm install && npx playwright install chromium-headless-shell
npx hyperframes doctor             # anima: needs Node >= 22 and FFmpeg
```

## Brand

The visual skills are brand-neutral engines with PageFly as the default preset,
not PageFly-only tools. To use your own brand, swap the preset inside the skill:
`presets/` for `feature-demo`, `references/brand.css` for `illustra` and
`anima`.

That story is further along in `feature-demo`, which already ships a `neutral`
preset selected by an environment variable, than in the other two, which
currently ship only the PageFly values. [`_pf-brand`](./skills/_pf-brand)
documents where the duplication currently sits.

## Licence and assets

Code is MIT - see [LICENSE](./LICENSE).

The PageFly logo and product screenshots inside the example folders belong to
their owner and are there as worked examples. Remove them if you are not
authorised to use them.
