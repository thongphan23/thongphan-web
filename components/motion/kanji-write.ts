// Brush-writes a CJK mark stroke by stroke, so a scrubbed scroll moves the hand that writes it.
// The glyphs are redrawn on a canvas laid over the element's own text, in its font and colour, and
// masked to round brush paths that follow each stroke's centreline in writing order. The text stays
// in the DOM (hidden only while the canvas draws) for assistive tech and as the fallback: a
// character without stroke data leaves the whole mark as plain text.

type Point = readonly [number, number]

// Centrelines in writing order, in each character's em box (x across its advance, y down from the
// top of the em square), traced over Hiragino Mincho.
const STROKES: Record<string, readonly (readonly Point[])[]> = {
  天: [
    [[0.05, 0.137], [0.8, 0.137], [0.85, 0.1], [0.94, 0.135]],
    [[0.11, 0.41], [0.78, 0.41], [0.82, 0.37], [0.92, 0.41]],
    [[0.49, 0.15], [0.49, 0.42], [0.465, 0.5], [0.43, 0.6], [0.38, 0.68], [0.31, 0.76], [0.22, 0.83], [0.13, 0.88], [0.06, 0.91]],
    [[0.52, 0.45], [0.55, 0.54], [0.6, 0.64], [0.66, 0.7], [0.74, 0.77], [0.82, 0.82], [0.92, 0.85], [0.89, 0.895]],
  ],
  才: [
    [[0.06, 0.287], [0.8, 0.287], [0.855, 0.245], [0.94, 0.285]],
    [[0.57, 0.065], [0.535, 0.1], [0.535, 0.6], [0.55, 0.85], [0.53, 0.91], [0.46, 0.89], [0.32, 0.86]],
    [[0.77, 0.36], [0.735, 0.345], [0.68, 0.43], [0.54, 0.535], [0.4, 0.635], [0.3, 0.7], [0.2, 0.75], [0.07, 0.795]],
  ],
}

// The brush, in em: wide enough to take in the Mincho serifs and the swell of the sweeps, so the
// finished strokes match the glyph.
const BRUSH = 0.15
// The pause between strokes, as if the brush lifts, in em of travel.
const LIFT = 0.18

export type KanjiWriter = { draw: (progress: number) => void; destroy: () => void }

type Path = { points: { x: number; y: number }[]; lengths: number[]; length: number }

export function kanjiWriter(el: HTMLElement): KanjiWriter | null {
  const chars = Array.from(el.textContent ?? '')
  if (!chars.length || chars.some((ch) => !STROKES[ch])) return null
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', pointerEvents: 'none' })
  const position = el.style.position
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  el.appendChild(canvas)
  el.dataset.kanjiWriting = ''

  let dirty = true
  let ratio = 1
  let size = 16
  let font = ''
  let colour = ''
  let middle = 0
  let lefts: number[] = []
  let paths: Path[] = []
  let total = 0

  // Lays the strokes out over the text as the browser set it: each character's left edge from the
  // font's advances and the element's letter-spacing, the baseline from a probe in the line.
  const measure = () => {
    dirty = false
    const width = el.offsetWidth
    const height = el.offsetHeight
    ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.round(width * ratio))
    canvas.height = Math.max(1, Math.round(height * ratio))

    const style = getComputedStyle(el)
    size = Number.parseFloat(style.fontSize) || 16
    const spacing = Number.parseFloat(style.letterSpacing) || 0
    font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    colour = style.color
    ctx.font = font

    const probe = document.createElement('span')
    Object.assign(probe.style, { display: 'inline-block', width: '0', height: '0', verticalAlign: 'baseline' })
    el.insertBefore(probe, canvas)
    const baseline = probe.offsetTop
    probe.remove()
    ctx.textBaseline = 'alphabetic'
    const above = ctx.measureText(chars[0]).actualBoundingBoxAscent
    ctx.textBaseline = 'middle'
    middle = baseline - (above - ctx.measureText(chars[0]).actualBoundingBoxAscent)

    lefts = []
    paths = []
    let x = 0
    for (const ch of chars) {
      const advance = ctx.measureText(ch).width
      lefts.push(x)
      for (const stroke of STROKES[ch]) {
        const points = stroke.map(([u, v]) => ({ x: x + u * advance, y: middle + (v - 0.5) * size }))
        const lengths = points.slice(1).map((point, i) => Math.hypot(point.x - points[i].x, point.y - points[i].y))
        paths.push({ points, lengths, length: lengths.reduce((sum, l) => sum + l, 0) })
      }
      x += advance + spacing
    }
    total = paths.reduce((sum, path) => sum + path.length, 0) + LIFT * size * (paths.length - 1)
  }

  // Traces the brush along every stroke up to `travel` px of the whole writing, as one path stroked
  // once: a composite draw keeps only its own shape, so a second call would wipe the first.
  const brush = (travel: number) => {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = BRUSH * size
    ctx.strokeStyle = '#000'
    ctx.beginPath()
    let start = 0
    for (const path of paths) {
      let left = travel - start
      start += path.length + LIFT * size
      if (left <= 0) break
      ctx.moveTo(path.points[0].x, path.points[0].y)
      for (let i = 0; i < path.lengths.length && left > 0; i++) {
        const from = path.points[i]
        const to = path.points[i + 1]
        const step = path.lengths[i]
        const t = Math.min(1, left / step)
        ctx.lineTo(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t)
        left -= step
      }
    }
    ctx.stroke()
  }

  const draw = (progress: number) => {
    if (dirty) measure()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (progress <= 0) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.font = font
    ctx.textBaseline = 'middle'
    ctx.fillStyle = colour
    chars.forEach((ch, i) => ctx.fillText(ch, lefts[i], middle))
    if (progress < 1) {
      // Keep only what the brush has covered so far.
      ctx.globalCompositeOperation = 'destination-in'
      brush(progress * total)
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  let last = 0
  const observer = new ResizeObserver(() => {
    dirty = true
    draw(last)
  })
  observer.observe(el)
  const redraw = (progress: number) => {
    last = progress
    draw(progress)
  }

  return {
    draw: redraw,
    destroy: () => {
      observer.disconnect()
      canvas.remove()
      delete el.dataset.kanjiWriting
      el.style.position = position
    },
  }
}
