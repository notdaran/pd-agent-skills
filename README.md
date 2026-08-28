# pd-agent-skills

Agent skills I use for product-development work: deciding what to build, making
the assets and the marketing page that announce it, and testing the app it all
lives in.

A skill is a folder of instructions - plus a renderer, where one is needed -
that a coding agent loads on demand. They are written for Claude Code, but the
instructions are plain Markdown, so any agent that can read a folder can use
them.

What they have in common: each one carries a piece of taste, or a fact that cost
something to learn, which would otherwise have to be re-explained every time.
Not "make me an image", but the eighteen composition rules and the rule that a
model never redraws a real screenshot. Not "check these numbers", but the gate
that refuses an A/B test your traffic was never going to power. Not "build the
page", but the section library it should be assembled from rather than
hand-written. Not "test the app", but the measured reason one browser tool
cannot drive this surface and another can.

## Skills

| Skill | Makes | |
|---|---|---|
| [`feature-demo`](./skills/feature-demo) | A real UI screenshot inside a brand frame: App Store hero, social tile, blog header | [readme](./skills/feature-demo/README.md) |
| [`illustra`](./skills/illustra) | The illustration inside one marketing card: framed screenshots blended with hand-drawn vector UI, exported as a transparent PNG | [readme](./skills/illustra/README.md) |
| [`anima`](./skills/anima) | A short on-brand motion piece: teaser, announcement video, animated hero | [readme](./skills/anima/README.md) |
| [`product-analyst`](./skills/product-analyst) | A decision: which product problem to work on, sized in absolute users, and whether proving it is worth the cost | [readme](./skills/product-analyst/README.md) |
| [`pf-mainsite-page`](./skills/pf-mainsite-page) | A marketing landing page assembled inside a visual page builder from the section library the site already has, instead of a blob of custom HTML | [readme](./skills/pf-mainsite-page/README.md) |
| [`pagefly-browser-tester`](./skills/pagefly-browser-tester) | An end-to-end browser test that survives Shopify admin's nested iframes, overlay modals and expiring snapshot uids | [readme](./skills/pagefly-browser-tester/README.md) |

[`_pf-brand`](./skills/_pf-brand) is not a skill - it is the shared brand
identity the visual skills read from.

The first three are visual and overlap at the edges, so the short version of who
does what: a screenshot in a frame is `feature-demo`; art drawn around a
screenshot is `illustra`; anything that moves is `anima`.

The other three carry no renderer and no dependencies - they are written maps.
`product-analyst` decides what to build, `pf-mainsite-page` builds the marketing
page that announces it, `pagefly-browser-tester` tests the app it lives in.

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

The rendering skills each need one setup step before first use. Its own readme
says so, and `install.sh` prints the reminder. `product-analyst` and
`pf-mainsite-page` need none; `pagefly-browser-tester` needs a `config.local.md`
copied from its example, which its readme describes.

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

`feature-demo` selects its preset from an environment variable and ships a
`neutral` one alongside `pagefly`. `illustra` and `anima` are rebranded by
editing `references/brand.css`. [`_pf-brand`](./skills/_pf-brand) holds the
identity tokens the two of them share.

## Licence and assets

Code is MIT - see [LICENSE](./LICENSE).

The PageFly logo and product screenshots inside the example folders belong to
their owner and are there as worked examples. Remove them if you are not
authorised to use them.
