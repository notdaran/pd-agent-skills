#!/usr/bin/env node
// Objective grader for the illustra eval harness.
// Usage: node evals/grade.mjs <evals.json> <results-dir> <out-scores.json>
// For each brief x run it expects <results-dir>/<briefId>-run<N>.html (+ .png).
// Checks: HTML validity (parse5), renderability (PNG exists + non-trivial),
// brand-vars-only (no raw color literals in authored HTML), required components present,
// complexity band (bytes + DOM nodes), stage cropped tight (transparent-margin via sharp).
import fs from 'fs';
import path from 'path';
import { parse } from 'parse5';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

const [, , evalsPath, resultsDir, outPath] = process.argv;
if (!evalsPath || !resultsDir || !outPath) {
  console.error('Usage: node grade.mjs <evals.json> <results-dir> <out-scores.json>');
  process.exit(1);
}
const evals = JSON.parse(fs.readFileSync(evalsPath, 'utf8'));

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}
// raw color literals in AUTHORED html (brand.css is an external link, not inlined) = hard-rule-1 violation
function rawColors(html) {
  const body = stripComments(html);
  const hits = [];
  const hex = body.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const rgb = body.match(/\brgba?\([^)]*\)/g) || [];
  const hsl = body.match(/\bhsla?\([^)]*\)/g) || [];
  for (const h of [...hex, ...rgb, ...hsl]) hits.push(h);
  return hits;
}
function htmlErrors(html) {
  const errors = [];
  parse(html, { sourceCodeLocationInfo: false, onParseError: (e) => errors.push(e.code) });
  return errors;
}
function stageDims(doc) {
  const stage = doc.querySelector('#stage');
  if (!stage) return null;
  // dims may be in a <style> rule or inline; read computed inline first, then style sheet text
  const inline = stage.getAttribute('style') || '';
  const wInline = /width:\s*(\d+)px/.exec(inline);
  const hInline = /height:\s*(\d+)px/.exec(inline);
  let w = wInline ? +wInline[1] : null;
  let h = hInline ? +hInline[1] : null;
  if (w == null || h == null) {
    const styleText = [...doc.querySelectorAll('style')].map((s) => s.textContent).join('\n');
    const block = /#stage\s*\{([^}]*)\}/.exec(styleText);
    if (block) {
      const wm = /width:\s*(\d+)px/.exec(block[1]);
      const hm = /height:\s*(\d+)px/.exec(block[1]);
      if (w == null && wm) w = +wm[1];
      if (h == null && hm) h = +hm[1];
    }
  }
  return { w, h };
}
async function transparentMargins(pngPath) {
  try {
    const img = sharp(pngPath).ensureAlpha();
    const { width, height } = await img.metadata();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const ch = info.channels; // RGBA
    const A = 12; // alpha threshold
    let top = height, bottom = 0, left = width, right = 0, any = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = data[(y * width + x) * ch + (ch - 1)];
        if (a > A) {
          any = true;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }
    if (!any) return { empty: true };
    return {
      width, height,
      marginFrac: {
        top: +(top / height).toFixed(3),
        bottom: +((height - 1 - bottom) / height).toFixed(3),
        left: +(left / width).toFixed(3),
        right: +((width - 1 - right) / width).toFixed(3),
      },
    };
  } catch (e) {
    return { error: String(e) };
  }
}

const results = [];
for (const brief of evals) {
  for (let run = 1; run <= (brief.runs || 2); run++) {
    const base = path.join(resultsDir, `${brief.id}-run${run}`);
    const htmlPath = `${base}.html`;
    const pngPath = `${base}.png`;
    const rec = { brief: brief.id, run, checks: {} };
    if (!fs.existsSync(htmlPath)) {
      rec.checks.exists = { pass: false, note: 'html missing' };
      results.push(rec);
      continue;
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    const bytes = Buffer.byteLength(html);
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const nodeCount = doc.querySelectorAll('*').length;

    // 1. validity
    const errs = htmlErrors(html);
    rec.checks.htmlValid = { pass: errs.length === 0, errorCount: errs.length, sample: errs.slice(0, 5) };

    // 2. renderable
    const pngBytes = fs.existsSync(pngPath) ? fs.statSync(pngPath).size : 0;
    rec.checks.rendered = { pass: pngBytes > 3000, pngBytes };

    // 3. brand-vars-only
    const colors = rawColors(html);
    rec.checks.brandVarsOnly = { pass: colors.length === 0, rawColorCount: colors.length, sample: [...new Set(colors)].slice(0, 8) };

    // 4. required components present (class tokens). Tolerate <=1 missing: hard-rule-4 lets the
    // author rename/adapt a kit class inline, so an exact-token match would penalize correct adaptation.
    const missing = (brief.expectComponents || []).filter((cls) => !doc.querySelector(`.${CSS_escape(cls)}`) && !html.includes(cls));
    rec.checks.components = { pass: missing.length <= 1, expected: brief.expectComponents || [], missing };

    // 5. real screenshot present if required
    const imgCount = doc.querySelectorAll('img').length;
    rec.checks.screenshots = brief.minImgs != null
      ? { pass: imgCount >= brief.minImgs, imgCount, minImgs: brief.minImgs }
      : { pass: true, imgCount };

    // 6. complexity band
    const [minKB, maxKB] = brief.sizeBandKB || [1, 60];
    const kb = +(bytes / 1024).toFixed(1);
    rec.checks.complexity = { pass: kb >= minKB && kb <= maxKB, kb, nodeCount, band: [minKB, maxKB] };

    // 7. stage tight
    const dims = stageDims(doc);
    const margins = await transparentMargins(pngPath);
    const notDefault = dims && !(dims.w === 1200 && dims.h === 900); // template default left untouched = smell
    const maxMargin = margins.marginFrac ? Math.max(...Object.values(margins.marginFrac)) : null;
    rec.checks.tightCrop = {
      pass: notDefault && maxMargin != null && maxMargin <= 0.1,
      stage: dims, maxMarginFrac: maxMargin, margins: margins.marginFrac || margins, leftTemplateDefault: !notDefault,
    };

    // objective composite (hard checks weighted; tightCrop soft)
    const hard = ['htmlValid', 'rendered', 'brandVarsOnly', 'components', 'screenshots', 'complexity'];
    const hardPass = hard.filter((k) => rec.checks[k].pass).length;
    rec.objectiveScore = +((hardPass / hard.length) * 0.85 + (rec.checks.tightCrop.pass ? 0.15 : 0)).toFixed(3);
    results.push(rec);
  }
}

// jsdom has no CSS.escape global; minimal escaper for class tokens (alnum + dash only here)
function CSS_escape(s) { return s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }

const summary = {};
for (const brief of evals) {
  const rs = results.filter((r) => r.brief === brief.id && r.checks.htmlValid);
  if (!rs.length) { summary[brief.id] = { runs: 0 }; continue; }
  const scores = rs.map((r) => r.objectiveScore);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  summary[brief.id] = {
    runs: rs.length,
    objMean: +mean.toFixed(3),
    objSpread: +(Math.max(...scores) - Math.min(...scores)).toFixed(3),
  };
}
fs.writeFileSync(outPath, JSON.stringify({ summary, results }, null, 2));
console.log(JSON.stringify({ summary }, null, 2));
console.log(`\nWrote ${outPath}`);
