import * as React from 'react'
import { chromium } from 'playwright-core'
import { renderToString } from 'react-dom/server'
import { templates } from '../templates/registry'
import { brand } from '../brand'
import { wrapInShell } from './shared/html-shell'
import type { AssetSpec } from '../types'

const LAUNCH_ARGS = ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
const RENDER_TIMEOUT_MS = 20_000

export async function renderPng(spec: AssetSpec): Promise<Buffer> {
  const tpl = templates[spec.templateId]
  if (!tpl) {
    throw new Error(
      `Unknown templateId: ${spec.templateId}. Known: ${Object.keys(templates).join(', ')}`,
    )
  }
  if (!tpl.variations.includes(spec.variation)) {
    throw new Error(
      `Unknown variation '${spec.variation}' for template '${spec.templateId}'. Known: ${tpl.variations.join(', ')}`,
    )
  }

  const reactHtml = renderToString(<tpl.Component spec={spec} brand={brand} />)
  const fullHtml = wrapInShell(reactHtml, brand, spec.size)

  return await withTimeout(renderInBrowser(fullHtml, spec), RENDER_TIMEOUT_MS, 'PNG render')
}

async function renderInBrowser(fullHtml: string, spec: AssetSpec): Promise<Buffer> {
  const browser = await chromium.launch({ args: LAUNCH_ARGS, headless: true })
  try {
    const ctx = await browser.newContext({
      viewport: { width: spec.size.width, height: spec.size.height },
      deviceScaleFactor: 1,
    })
    const page = await ctx.newPage()
    await page.setContent(fullHtml, { waitUntil: 'load' })
    // Wait Poppins fonts ready. fonts.check returns true once all weights loaded.
    await page.waitForFunction(
      () => (document as any).fonts && (document as any).fonts.check('700 16px Poppins'),
      undefined,
      { timeout: 5_000 },
    )
    const buf = await page.screenshot({ type: 'png', fullPage: false })
    return buf
  } finally {
    await browser.close()
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`${label} timeout after ${ms}ms`)), ms),
    ),
  ])
}
