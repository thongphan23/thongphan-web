import sharp from 'sharp'

const src = new URL('../public/images/hero-lush-knowledge-tree-chatgpt.png', import.meta.url).pathname
const out = new URL('../public/images/hero-lush-knowledge-tree-object.png', import.meta.url).pathname

const meta = await sharp(src).metadata()
const w = meta.width
const h = meta.height

if (!w || !h) throw new Error('Cannot read hero source dimensions')

const left = Math.round(w * 0.36)
const top = Math.round(h * 0.02)
const width = w - left
const height = Math.round(h * 0.96)

const raw = Buffer.alloc(width * height)

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const nx = (x - width * 0.62) / (width * 0.55)
    const ny = (y - height * 0.5) / (height * 0.55)
    const d = Math.sqrt(nx * nx + ny * ny)
    let val = Math.max(0, Math.min(255, Math.round(255 * (1 - d))))

    // Preserve the tree mass on the right, soften the bright landscape edge.
    if (x > width * 0.36 && y > height * 0.08 && y < height * 0.96) {
      val = Math.max(val, Math.round(220 * (1 - Math.abs(y / height - 0.54) * 1.12)))
    }

    raw[y * width + x] = Math.max(0, Math.min(255, val))
  }
}

const mask = await sharp(raw, { raw: { width, height, channels: 1 } })
  .blur(24)
  .png()
  .toBuffer()

await sharp(src)
  .extract({ left, top, width, height })
  .ensureAlpha()
  .joinChannel(mask)
  .png({ compressionLevel: 9 })
  .toFile(out)

const outMeta = await sharp(out).metadata()
console.log(JSON.stringify({ out, width: outMeta.width, height: outMeta.height, size: outMeta.size }, null, 2))
