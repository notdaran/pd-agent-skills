import * as fs from 'fs'
import * as path from 'path'
import type { BrandTokens, Size } from '../../types'

// Inline 4 Poppins woff2 weights as base64. setContent does not go through network
// so this is the deterministic path for fonts to render. ~320KB total HTML overhead.

const FONT_DIR = path.resolve(__dirname, '../../assets/fonts')

const WEIGHTS = [200, 400, 500, 700] as const

function getFontFaceCss(): string {
  return WEIGHTS.map((w) => {
    const file = path.join(FONT_DIR, `Poppins-${w}.woff2`)
    const data = fs.readFileSync(file).toString('base64')
    return `@font-face { font-family: 'Poppins'; font-style: normal; font-weight: ${w}; src: url(data:font/woff2;base64,${data}) format('woff2'); }`
  }).join('\n')
}

export function wrapInShell(innerHtml: string, brand: BrandTokens, size: Size): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      ${getFontFaceCss()}
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        width: ${size.width}px;
        height: ${size.height}px;
        background: ${brand.palette.bg};
        font-family: ${brand.fonts.body}, -apple-system, sans-serif;
        color: ${brand.palette.text};
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      img { display: block; max-width: 100%; }
    </style>
  </head>
  <body>${innerHtml}</body>
</html>`
}
