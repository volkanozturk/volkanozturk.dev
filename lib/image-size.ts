import fs from 'node:fs'
import path from 'node:path'

/**
 * Intrinsic pixel size of an image under `public/`, read from its file header
 * at build time.
 *
 * Markdown carries no dimensions, but `next/image` needs them to reserve the
 * right box before the file arrives. Reading them here means every body image
 * declares its own shape — a screenshot, a portrait photo and a square all
 * reserve their real ratio — without anyone adding sizes to the Markdown.
 *
 * Only the formats the site publishes are understood (PNG, JPEG, WebP, SVG). Anything
 * else, or a path that does not exist, fails the build with the file named,
 * the same way `lib/posts.ts` rejects bad frontmatter: a guessed ratio would
 * only move the layout shift somewhere harder to notice.
 */

export interface ImageSize {
  width: number
  height: number
}

const PUBLIC_DIR = path.join(process.cwd(), 'public')

const cache = new Map<string, ImageSize>()

function pngSize(buf: Buffer): ImageSize | null {
  // Signature, then the IHDR chunk: width and height as big-endian uint32.
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function jpegSize(buf: Buffer): ImageSize | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null

  // Walk the marker segments until a start-of-frame, which holds the size.
  let offset = 2
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null
    const marker = buf[offset + 1]
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    if (isStartOfFrame) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) }
    }
    offset += 2 + buf.readUInt16BE(offset + 2)
  }
  return null
}

function webpSize(buf: Buffer): ImageSize | null {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    return null
  }

  switch (buf.toString('ascii', 12, 16)) {
    // Lossy: 14-bit dimensions after the frame start code.
    case 'VP8 ':
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
    // Lossless: two 14-bit fields packed after a one-byte signature, stored minus one.
    case 'VP8L': {
      const bits = buf.readUInt32LE(21)
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
    }
    // Extended: 24-bit canvas size, stored minus one.
    case 'VP8X':
      return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 }
    default:
      return null
  }
}

function svgSize(buf: Buffer): ImageSize | null {
  // The root element's own width/height in pixels, else its viewBox.
  const root = /<svg\b[^>]*>/i.exec(buf.toString('utf8'))?.[0]
  if (!root) return null
  const attr = (name: string) => new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(root)?.[1]

  const width = Number(attr('width')?.replace(/px$/, ''))
  const height = Number(attr('height')?.replace(/px$/, ''))
  if (width > 0 && height > 0) return { width, height }

  const viewBox = attr('viewBox')?.trim().split(/[\s,]+/).map(Number)
  if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    return { width: viewBox[2], height: viewBox[3] }
  }
  return null
}

/** Size of a site-relative image path such as `/images/foo.webp`. */
export function getImageSize(src: string): ImageSize {
  const cached = cache.get(src)
  if (cached) return cached

  if (!src.startsWith('/')) {
    throw new Error(`[content] image "${src}" must be a path under /public; its size cannot be read`)
  }

  const file = path.join(PUBLIC_DIR, src)
  if (!file.startsWith(PUBLIC_DIR + path.sep) || !fs.existsSync(file)) {
    throw new Error(`[content] image "${src}" does not exist under /public`)
  }

  // Whole file rather than a fixed prefix: a JPEG's EXIF block can push its
  // frame header arbitrarily far in. Build-time only, and cached per path.
  const buf = fs.readFileSync(file)
  const size = pngSize(buf) ?? jpegSize(buf) ?? webpSize(buf) ?? svgSize(buf)
  if (!size || size.width <= 0 || size.height <= 0) {
    throw new Error(`[content] image "${src}" is not a PNG, JPEG, WebP or SVG file whose size can be read`)
  }

  cache.set(src, size)
  return size
}
