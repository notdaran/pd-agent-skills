# Measuring a live PageFly page

All snippets run against a published page on `pagefly.io` via a browser tool.
For anything inside the Shopify admin app iframe, see the last section.

## 0. Fetch one page at a time, through a real browser

This step exists because skipping it produces answers rather than errors.

**Never crawl the store in parallel.** A concurrent fetch trips the CDN's bot challenge, and the
challenge answers **`200` with a "verifying your connection" page**. Nothing fails. The HTML
parses, every selector below returns an empty array, and every grep answers "not found" - which
reads exactly like a real finding. Most of a several-hundred-page sweep once came back that way and
was believed for a while.

Command-line fetching is fine for one page at a time and unreliable in bulk. A real browser passes
the challenge; `curl` in a loop does not.

**Detect it before trusting a sweep.** Any of these is enough:

```bash
grep -l "Verifying your connection\|_cf_chl" *.html   # the challenge page's own markers
```

or check the byte size: a real page on this store runs into the hundreds of kilobytes, the
challenge page is under ten.

**Run a positive control before believing a negative.** Before concluding "page X does not mention
Y", prove the same pipeline finds something you already know is on that page. A sweep that cannot
find a string you can see with your own eyes is a broken sweep, not a finding. This applies to your
own shell loops too, not just to the fetch - see anti-pattern #23.

**A summary is not evidence.** A claim that will send someone off to edit a page has to come from
the page's raw text, read directly. A model-written summary of the page is fine for orientation and
not fine as the basis for the edit.

## 1. Is this page built from native elements or an HTML blob?

```js
() => {
  const all = [...document.querySelectorAll('[data-pf-type]')];
  const counts = {};
  all.forEach(e => { const t = e.getAttribute('data-pf-type'); counts[t] = (counts[t]||0)+1; });
  return { total: all.length, counts };
}
```

Reading it: a few dozen-plus nodes with `FlexBlock`, `Heading2`, `Paragraph3`, `Image4` means a
real build worth copying. A total of ~6 with 2 `Custom.HTML` means a blob — do not use it as a
reference.

## 2. Design tokens

```js
() => {
  const heads = [...document.querySelectorAll('h1,h2,h3')].slice(0,10).map(h => {
    const s = getComputedStyle(h);
    return { tag: h.tagName, font: s.fontFamily.split(',')[0], size: s.fontSize, weight: s.fontWeight, color: s.color };
  });
  const btn = [...document.querySelectorAll('a,button')].find(b => /try|start|book/i.test(b.innerText||''));
  const bs = btn && getComputedStyle(btn);
  return { heads, cta: bs && { bg: bs.backgroundColor, radius: bs.borderRadius, size: bs.fontSize, weight: bs.fontWeight } };
}
```

Check heading font and body font separately — they are different families on this site.

## 3. Section inventory with backgrounds

```js
() => [...document.querySelectorAll('[data-section-id]')].map(sec => {
  const counts = {};
  sec.querySelectorAll('[data-pf-type]').forEach(e => {
    const t = e.getAttribute('data-pf-type'); counts[t] = (counts[t]||0)+1;
  });
  const h = sec.querySelector('h1,h2');
  return {
    id: sec.getAttribute('data-section-id'),
    type: sec.getAttribute('data-pf-type'),
    heading: h ? h.innerText.replace(/\s+/g,' ').slice(0,48) : '',
    bg: getComputedStyle(sec).backgroundColor,
    counts
  };
})
```

**This tells you what a section contains. It does not tell you what it looks like.** Run step 4.

## 4. Row rhythm — the step that actually identifies a layout

```js
(id) => {
  const sec = document.querySelector(`[data-section-id="${id}"]`);
  const cards = [...sec.querySelectorAll('[data-pf-type="FlexBlock"]')].filter(e => {
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    return parseFloat(s.borderTopLeftRadius) >= 10 && r.width > 200 && r.height > 120;
  });
  const rows = {};
  cards.forEach(c => {
    const r = c.getBoundingClientRect();
    const key = Math.round((r.top + window.scrollY) / 40) * 40;
    const h = c.querySelector('h2,h3,h4');
    (rows[key] = rows[key] || []).push({ w: Math.round(r.width), title: h ? h.innerText.slice(0,40) : '' });
  });
  return Object.keys(rows).sort((a,b)=>a-b).map(k => ({
    cards: rows[k].length, widths: rows[k].map(x=>x.w).join('/'), titles: rows[k].map(x=>x.title)
  }));
}
```

Output like `2 cards (590/590)` then `3 cards (387/387/387)` is a 2+3 bento.
`1 card (1200)` then two rows of 2 is a 1+2+2 bento. `3 cards (387x3)` is an even three-column.

## 5. Matching a storefront section to the editor

`data-section-id` on the storefront is `pf-` plus the **second group of the section's uuid**.

```
pf-31c1  ⇔  0c197612-31c1-46e1-8ee1-55c8b5e7d9da
```

Use it when you need certainty about which section you are selecting: inspect the live page,
read `data-section-id`, then count to that position in the editor outline.

## 6. Reading page structure from inside the admin app

The app iframe is a different origin from `admin.shopify.com`, so a fetch from the parent frame
hits the wrong origin and 404s. Target an element **inside** the iframe so the browser tool
resolves the frame, then use that document's window:

```js
async (el) => {
  const w = el.ownerDocument.defaultView;
  const r = await w.fetch('/api/page/<PAGE_ID>', { credentials: 'include' });
  const page = (await r.json()).data;
  const items = page.items || [];
  const byId = {}; items.forEach(it => byId[it._id] = it);
  const layout = items.find(it => /Layout/i.test(it.type || ''));
  return (layout?.children || []).map((cid, i) => {
    const it = byId[cid];
    return { order: i+1, type: it?.type, name: it?.data?.name || '(unnamed)', short: 'pf-' + String(cid).split('-')[1] };
  });
}
```

Notes:
- Items are keyed by `_id` (a uuid); `children` holds those uuids.
- The label shown in the editor outline is `data.name`. Most sections on this store have none,
  so they all render the same default label — order plus on-canvas heading is the only reliable
  way to tell them apart.

## 7. Opening the editor

Do not paste an editor URL directly — it has produced a blank canvas with a real JS error
(`Cannot read properties of null (reading 'querySelector')`). Enter from the Pages list and
click the row.
