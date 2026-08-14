import * as fs from 'fs'
import * as path from 'path'

// Reads intrinsic pixel dimensions from an image file by parsing its header.
// Supports PNG / JPEG / WebP - no external dependency. Used so screenshot
// frames can be sized to the image's real aspect ratio (no cropping) and so
// layout can tell a desktop (landscape) shot apart from a mobile (portrait) one.

export type Orientation = 'desktop' | 'mobile' | 'square'

export interface ImageMeta {
  path: string
  width: number
  height: number
  ratio: number // width / height
  orientation: Orientation
}

// Landscape >= 1.2 -> desktop; portrait <= 0.8 -> mobile; between -> square.
function classify(ratio: number): Orientation {
  if (ratio >= 1.2) return 'desktop'
  if (ratio <= 0.8) return 'mobile'
  return 'square'
}

const DEFAULT_RATIO = 16 / 9 // assume desktop when dimensions can't be read

function readPng(buf: Buffer): { width: number; height: number } | null {
  // PNG signature + IHDR: width = uint32 BE @16, height = uint32 BE @20.
  if (buf.length < 24) return null
  if (buf.readUInt32BE(0) !== 0x89504e47) return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function readJpeg(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let off = 2
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) {
      off++
      continue
    }
    const marker = buf[off + 1]
    // SOF markers carry frame dimensions. Exclude DHT(c4)/JPG(c8)/DAC(cc).
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    if (isSof) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) }
    }
    // Skip this segment: 2-byte length follows the marker.
    const segLen = buf.readUInt16BE(off + 2)
    off += 2 + segLen
  }
  return null
}

function readWebp(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 30) return null
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null
  const fmt = buf.toString('ascii', 12, 16)
  if (fmt === 'VP8X') {
    // 24-bit little-endian (value - 1) for each dimension.
    const w = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1
    const h = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1
    return { width: w, height: h }
  }
  if (fmt === 'VP8 ') {
    // Lossy: dimensions 14 bytes into the chunk, 14-bit each.
    const w = buf.readUInt16LE(26) & 0x3fff
    const h = buf.readUInt16LE(28) & 0x3fff
    return { width: w, height: h }
  }
  if (fmt === 'VP8L') {
    // Lossless: 1 byte signature (0x2f) then 14-bit width/height packed.
    const b0 = buf[21]
    const b1 = buf[22]
    const b2 = buf[23]
    const b3 = buf[24]
    const w = ((b1 & 0x3f) << 8 | b0) + 1
    const h = ((b3 & 0x0f) << 10 | b2 << 2 | (b1 & 0xc0) >> 6) + 1
    return { width: w, height: h }
  }
  return null
}

export function readImageMeta(src: string): ImageMeta {
  const abs = path.isAbsolute(src) ? src : path.resolve(process.cwd(), src)
  let dims: { width: number; height: number } | null = null
  try {
    const buf = fs.readFileSync(abs)
    dims = readPng(buf) ?? readJpeg(buf) ?? readWebp(buf)
  } catch {
    dims = null
  }
  if (!dims || dims.width <= 0 || dims.height <= 0) {
    return { path: src, width: 1600, height: 900, ratio: DEFAULT_RATIO, orientation: 'desktop' }
  }
  const ratio = dims.width / dims.height
  return { path: src, width: dims.width, height: dims.height, ratio, orientation: classify(ratio) }
}
