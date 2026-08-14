#!/usr/bin/env node
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

// CLI: node render.mjs <input.html> <output.png> [--width N] [--height N]
const argv = process.argv.slice(2);
if (argv.length < 2) {
  console.error('Usage: node render.mjs <input.html> <output.png> [--width N] [--height N]');
  process.exit(1);
}
const inputPath = path.resolve(argv[0]);
const outputPath = path.resolve(argv[1]);
let width = 1200;
let height = 900;
for (let i = 2; i < argv.length; i++) {
  if (argv[i] === '--width' && argv[i + 1]) width = parseInt(argv[++i], 10);
  else if (argv[i] === '--height' && argv[i + 1]) height = parseInt(argv[++i], 10);
}
if (!fs.existsSync(inputPath)) {
  console.error(`Input not found: ${inputPath}`);
  process.exit(1);
}

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
try {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`file://${inputPath}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready); // wait for Poppins
  const stage = page.locator('#stage');
  const png = (await stage.count())
    ? await stage.screenshot({ type: 'png', omitBackground: true })
    : await page.screenshot({ type: 'png', fullPage: false, omitBackground: true });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, png);
  console.log(`Rendered ${outputPath} (${png.length} bytes @ ${width}x${height} 2x)`);
} finally {
  await browser.close();
}
