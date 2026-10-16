// Guide pen ("nét bút người dẫn đường"): felt-tip marks drawn by hand on a 2D canvas around and
// between real elements, revealed as the reader scrolls. Markup on the anchor element:
//   data-pen="circle|underline|arrow|link|fork"
//   data-pen-tone="lacquer|lime|ember|paper|ink"; a fork takes a list: "stem,branch1,branch2"
//     (two values colour the branches, the stem takes the first)
//   data-pen-to="<selector>[,<selector>]"  target of an arrow or link; the two targets of a fork.
//     Each selector resolves to the match nearest the anchor in the DOM.
//   data-pen-seed       integer; same seed, same hand (defaults to a hash of the anchor text)
//   data-pen-trigger="load" + data-pen-delay (ms): drawn once after load instead of on scroll
//   data-pen-duration   ms; how long a load-drawn mark takes (defaults per shape)
//   data-pen-trigger="when" + data-pen-when="<selector>": drawn on a clock while the anchor matches the
//     selector and wiped once it stops (the attributes the selector names are watched under the root)
//   data-pen-width      stroke width in px (default scales with the anchor, 2.5-6px at 1440)
//   data-pen-start / data-pen-end   ScrollTrigger positions (default "top 85%" / "top 45%")
//   data-pen-side="start,end"       top|bottom|left|right|auto: where a connector leaves and lands
//   data-pen-inset      shrinks the box a circle is drawn around (px, or % of its smaller side)
//   data-pen-media      media query; the mark is only drawn while it matches, e.g. "(min-width: 900px)"
// A mark is measured from the anchor's text, so it hugs the words rather than their box; an anchor
// without text, or laid out as flex or grid (a button, a chip), is measured by its box instead.
// Two phases: collectPens() runs before SplitText rewrites headings and records an anchor inside a
// split heading as text, so it can be found again after any re-split; guidePen() builds the
// canvases and triggers once every pin exists. A canvas only repaints when its progress or its
// geometry changes; nothing runs per frame while the page is idle.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Cleanup = () => void
type Shape = 'circle' | 'underline' | 'arrow' | 'link' | 'fork'
type Side = 'top' | 'bottom' | 'left' | 'right' | 'auto'
type Box = { x: number; y: number; w: number; h: number }
type Pt = { x: number; y: number; w: number }
type Stroke = { pts: Pt[]; t0: number; t1: number; color: string }

export type PenSpec = {
  el: HTMLElement
  shape: Shape
  splitHost: HTMLElement | null
  text: string
  offset: number
}

type Geometry = {
  key: string
  lines: Box[]
  targets: Box[]
  fontSize: number
  isText: boolean
  opacity: number
  clipMin: number
  clipMax: number
}

type Mark = {
  spec: PenSpec
  host: HTMLElement
  source: HTMLElement
  targets: HTMLElement[]
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  tones: string[]
  seed: number
  state: { t: number }
  selfHosted: boolean
  boxed: boolean
  key: string
  strokes: Stroke[]
  box: Box
  drawnT: number
  opacity: number
  hidden: boolean
}

const SHAPES: Shape[] = ['circle', 'underline', 'arrow', 'link', 'fork']
const SPLIT_HOST = '[data-split],[data-scrub-words]'
const TONES: Record<string, string> = {
  lacquer: '#d23a30',
  lime: '#c3f331',
  ember: '#e0582f',
  paper: '#efe6d6',
  ink: '#151310',
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const strip = (s: string) => s.replace(/\s+/g, '')

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

// A slow, seeded tremor: three sines with random phases, so a hand never repeats itself exactly.
function wave(rnd: () => number, amp: number) {
  const f = [2 + rnd() * 2, 5 + rnd() * 3, 11 + rnd() * 5]
  const p = f.map(() => rnd() * Math.PI * 2)
  return (u: number) => amp * (Math.sin(u * f[0] + p[0]) * 0.6 + Math.sin(u * f[1] + p[1]) * 0.3 + Math.sin(u * f[2] + p[2]) * 0.1)
}

// Felt-tip pressure: lands firm, swells, then lifts off thinner than it started.
const taper = (u: number) => 0.32 + 0.68 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + 0.86 * u)), 0.55)

// Selectors in data-pen-to are split on commas outside brackets and parentheses.
function splitSelectors(value: string) {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of value) {
    if (ch === '[' || ch === '(') depth++
    if (ch === ']' || ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

function nearestMatch(from: HTMLElement, selector: string, root: HTMLElement) {
  for (let node: HTMLElement | null = from.parentElement; node; node = node.parentElement) {
    let match: HTMLElement | null = null
    try {
      match = node.querySelector<HTMLElement>(selector)
    } catch {
      return null
    }
    if (match) return match
    if (node === root) break
  }
  return null
}

// Phase one, before SplitText: an anchor inside a split heading is kept as its text and where it
// sits in the heading, because the split replaces the anchor node itself.
export function collectPens(root: HTMLElement): PenSpec[] {
  if (reduced()) return []
  return Array.from(root.querySelectorAll<HTMLElement>('[data-pen]')).flatMap((el) => {
    const shape = el.dataset.pen as Shape
    if (!SHAPES.includes(shape)) return []
    const splitHost = el.closest<HTMLElement>(SPLIT_HOST)
    let text = ''
    let offset = 0
    if (splitHost) {
      text = strip(el.textContent ?? '')
      if (splitHost !== el) {
        const range = document.createRange()
        range.setStart(splitHost, 0)
        range.setEndBefore(el)
        offset = strip(range.toString()).length
      }
    }
    return [{ el, shape, splitHost, text, offset }]
  })
}

// Text boxes of [start, start + length) in the whitespace-free text of host, one rect per text
// node piece, so wrappers added by a split never pad the result.
function textBoxes(host: HTMLElement, text: string | null, offset: number) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text)
  const chars: [number, number][] = []
  let full = ''
  nodes.forEach((node, ni) => {
    const data = node.data
    for (let i = 0; i < data.length; i++) {
      if (/\s/.test(data[i])) continue
      full += data[i]
      chars.push([ni, i])
    }
  })
  let start = 0
  let length = full.length
  if (text !== null) {
    let best = -1
    for (let i = full.indexOf(text); i !== -1; i = full.indexOf(text, i + 1)) {
      if (best === -1 || Math.abs(i - offset) < Math.abs(best - offset)) best = i
    }
    if (best === -1) return []
    start = best
    length = text.length
  }
  if (!length) return []
  const rects: DOMRect[] = []
  const range = document.createRange()
  const first = chars[start]
  const last = chars[start + length - 1]
  for (let ni = first[0]; ni <= last[0]; ni++) {
    const node = nodes[ni]
    range.setStart(node, ni === first[0] ? first[1] : 0)
    range.setEnd(node, ni === last[0] ? last[1] + 1 : node.data.length)
    for (const r of Array.from(range.getClientRects())) if (r.width > 0.5 && r.height > 0.5) rects.push(r)
  }
  return rects
}

// Pieces on the same line merge into one box per line.
function mergeLines(rects: Box[]) {
  const lines: Box[] = []
  rects
    .slice()
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .forEach((r) => {
      const line = lines.find((l) => Math.abs(l.y + l.h / 2 - (r.y + r.h / 2)) < Math.min(l.h, r.h) * 0.5)
      if (!line) return lines.push({ ...r })
      const x = Math.min(line.x, r.x)
      const y = Math.min(line.y, r.y)
      line.w = Math.max(line.x + line.w, r.x + r.w) - x
      line.h = Math.max(line.y + line.h, r.y + r.h) - y
      line.x = x
      line.y = y
    })
  return lines
}

function union(boxes: Box[]): Box {
  const x = Math.min(...boxes.map((b) => b.x))
  const y = Math.min(...boxes.map((b) => b.y))
  return { x, y, w: Math.max(...boxes.map((b) => b.x + b.w)) - x, h: Math.max(...boxes.map((b) => b.y + b.h)) - y }
}

const isPositioned = (el: HTMLElement) => {
  const s = getComputedStyle(el)
  return s.position !== 'static' || s.transform !== 'none' || s.overflow !== 'visible'
}

function commonAncestor(nodes: HTMLElement[]) {
  let node: HTMLElement | null = nodes[0]
  while (node && !nodes.every((n) => node!.contains(n))) node = node.parentElement
  return node
}

// ---------------------------------------------------------------------------------------------
// Shapes. Every builder returns strokes in host coordinates; t0/t1 order them on one timeline.

function sample(n: number, fn: (u: number) => { x: number; y: number }, width: number, press = taper): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const p = fn(u)
    pts.push({ x: p.x, y: p.y, w: width * press(u) })
  }
  return pts
}

function circle(box: Box, isText: boolean, width: number, rnd: () => number, color: string, clip: [number, number]): Stroke[] {
  // A text box already spans ascenders to descenders, so a ring around a word needs little room
  // above and below; it reaches further sideways to clear the first and last letters.
  const padX = isText ? Math.max(8, box.h * 0.2) : box.w * 0.05
  const padY = isText ? Math.max(3, box.h * 0.02) : box.h * 0.05
  const rx = box.w / 2 + padX
  const ry = box.h / 2 + padY
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const tilt = (rnd() - 0.5) * 0.1
  const start = -Math.PI / 2 - 0.55 - rnd() * 0.35
  const turns = Math.PI * 2 * (1.15 + rnd() * 0.04)
  const egg = rnd() * Math.PI * 2
  const tremor = wave(rnd, 0.018)
  const driftX = (rnd() - 0.3) * rx * 0.05
  const driftY = -ry * (0.05 + rnd() * 0.04)
  const n = Math.ceil(((rx + ry) * Math.PI * 1.2) / 2.2)
  const cos = Math.cos(tilt)
  const sin = Math.sin(tilt)
  const pts = sample(
    n,
    (u) => {
      // The second pass spirals slightly outward and drifts, so the loop never closes on itself.
      const a = start - u * turns
      const k = (1 + (isText ? 0.055 : 0.075) * u) * (1 + 0.035 * Math.sin(2 * a + egg)) * (1 + tremor(u))
      const ex = Math.cos(a) * rx * k + driftX * u
      const ey = Math.sin(a) * ry * k + driftY * u
      return { x: cx + ex * cos - ey * sin, y: cy + ex * sin + ey * cos }
    },
    width,
  )
  // A word at the edge of a phone screen keeps its ring on screen: the side that would run off is
  // pressed in towards the centre, so the loop leans like one drawn in a cramped margin.
  const lo = clip[0] + width + 3
  const hi = clip[1] - width - 3
  const minX = Math.min(...pts.map((p) => p.x))
  const maxX = Math.max(...pts.map((p) => p.x))
  for (const p of pts) {
    if (minX < lo && p.x < cx) p.x = cx - ((cx - p.x) * (cx - lo)) / (cx - minX)
    if (maxX > hi && p.x > cx) p.x = cx + ((p.x - cx) * (hi - cx)) / (maxX - cx)
  }
  return [{ pts, t0: 0, t1: 1, color }]
}

function underline(lines: Box[], width: number, rnd: () => number, color: string): Stroke[] {
  const rows = lines.filter((l) => l.w > 4)
  const total = rows.reduce((s, l) => s + l.w, 0) || 1
  let t = 0
  return rows.map((l, i) => {
    const x0 = l.x - Math.min(8, l.h * 0.12)
    const x1 = l.x + l.w + Math.min(12, l.h * 0.18)
    // Tight display leading lets a line's box reach into the accents of the line below; the stroke
    // then sits halfway up that overlap instead of on the next line's diacritics.
    const below = rows[i + 1]?.y > l.y + l.h * 0.4 ? rows[i + 1] : undefined
    const y0 = l.y + l.h - (below ? Math.max(0, l.y + l.h - below.y) * 0.5 : 0)
    const rise = l.h * (0.06 + rnd() * 0.04)
    const bow = l.h * (0.02 + rnd() * 0.03)
    const tremor = wave(rnd, l.h * 0.012)
    const n = Math.ceil((x1 - x0) / 2.2)
    const pts = sample(n, (u) => {
      const flick = u > 0.9 ? Math.pow((u - 0.9) / 0.1, 2) * l.h * 0.09 : 0
      return { x: x0 + (x1 - x0) * u, y: y0 - rise * u + bow * Math.sin(Math.PI * u) + tremor(u) - flick }
    }, width)
    const span = (l.w / total) * (rows.length > 1 ? 0.94 : 1)
    const stroke = { pts, t0: t, t1: t + span, color }
    t += span + (rows.length > 1 ? 0.06 / (rows.length - 1) : 0)
    return stroke
  })
}

type Vec = { x: number; y: number }
const norm = (v: Vec) => {
  const l = Math.hypot(v.x, v.y) || 1
  return { x: v.x / l, y: v.y / l }
}
const rot = (v: Vec, a: number) => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) })

function cubic(p0: Vec, p1: Vec, p2: Vec, p3: Vec, u: number) {
  const m = 1 - u
  return {
    x: m * m * m * p0.x + 3 * m * m * u * p1.x + 3 * m * u * u * p2.x + u * u * u * p3.x,
    y: m * m * m * p0.y + 3 * m * m * u * p1.y + 3 * m * u * u * p2.y + u * u * u * p3.y,
  }
}

// Two quick strokes, each from its outer end into the tip.
function head(tip: Vec, dir: Vec, size: number, width: number, rnd: () => number, color: string, t0: number, t1: number): Stroke[] {
  const back = { x: -dir.x, y: -dir.y }
  const mid = t0 + (t1 - t0) * 0.5
  return [0, 1].map((i) => {
    const a = (i ? -1 : 1) * ((26 + rnd() * 6) * Math.PI) / 180
    const len = size * (0.9 + rnd() * 0.2)
    const outer = { x: tip.x + rot(back, a).x * len, y: tip.y + rot(back, a).y * len }
    const bend = rot(dir, (i ? -1 : 1) * Math.PI / 2)
    const ctrl = { x: (outer.x + tip.x) / 2 + bend.x * len * 0.08, y: (outer.y + tip.y) / 2 + bend.y * len * 0.08 }
    const pts = sample(Math.ceil(len / 1.6), (u) => {
      const m = 1 - u
      return { x: m * m * outer.x + 2 * m * u * ctrl.x + u * u * tip.x, y: m * m * outer.y + 2 * m * u * ctrl.y + u * u * tip.y }
    }, width, (u) => 0.95 - 0.35 * u)
    return { pts, t0: i ? mid + 0.01 : t0, t1: i ? t1 : mid, color }
  })
}

function edgePoint(b: Box, side: Side, toward: Vec, gap: number): Vec {
  const cx = clamp(toward.x, b.x + b.w * 0.2, b.x + b.w * 0.8)
  const cy = clamp(toward.y, b.y + b.h * 0.15, b.y + b.h * 0.85)
  if (side === 'top') return { x: cx, y: b.y - gap }
  if (side === 'bottom') return { x: cx, y: b.y + b.h + gap }
  if (side === 'left') return { x: b.x - gap, y: cy }
  return { x: b.x + b.w + gap, y: cy }
}

function pickSides(src: Box, dst: Box, wanted: Side[]): [Side, Side] {
  const dx = dst.x + dst.w / 2 - (src.x + src.w / 2)
  const dy = dst.y + dst.h / 2 - (src.y + src.h / 2)
  const vertical = Math.abs(dy) > Math.abs(dx) * 0.6
  const s: Side = vertical ? (dy > 0 ? 'bottom' : 'top') : dx > 0 ? 'right' : 'left'
  const e: Side = vertical ? (dy > 0 ? 'top' : 'bottom') : dx > 0 ? 'left' : 'right'
  return [wanted[0] && wanted[0] !== 'auto' ? wanted[0] : s, wanted[1] && wanted[1] !== 'auto' ? wanted[1] : e]
}

function connector(lines: Box[], dst: Box, width: number, rnd: () => number, color: string, withHead: boolean, sides: Side[]): Stroke[] {
  const all = union(lines)
  const [s0, s1] = pickSides(all, dst, sides)
  // Leave from the line nearest the target: the last line going down, the first going up.
  const from = s0 === 'bottom' ? lines[lines.length - 1] : s0 === 'top' ? lines[0] : all
  const dstC = { x: dst.x + dst.w / 2, y: dst.y + dst.h / 2 }
  const S = edgePoint(from, s0, dstC, Math.max(6, width * 2))
  const E = edgePoint(dst, s1, S, Math.max(5, width * 1.6))
  const d = { x: E.x - S.x, y: E.y - S.y }
  const len = Math.hypot(d.x, d.y) || 1
  const perp = rot(norm(d), -Math.PI / 2)
  const sign = rnd() < 0.5 ? -1 : 1
  const bend = len * (0.14 + rnd() * 0.08) * sign
  const tremor = wave(rnd, width * 0.35)
  let c1 = { x: S.x + d.x * 0.3 + perp.x * bend, y: S.y + d.y * 0.3 + perp.y * bend }
  let c2 = { x: S.x + d.x * 0.75 + perp.x * bend * (withHead ? 0.55 : 1), y: S.y + d.y * 0.75 + perp.y * bend * (withHead ? 0.55 : 1) }
  if (s0 === s1) {
    // Leaving and landing on the same side is a hop: the stroke arcs out over whatever lies between.
    const out = s0 === 'top' ? { x: 0, y: -1 } : s0 === 'bottom' ? { x: 0, y: 1 } : s0 === 'left' ? { x: -1, y: 0 } : { x: 1, y: 0 }
    // The arc rises no further than about the anchors' own height, so it stays in the margin around
    // them instead of reaching into the next block.
    const lift = clamp(len * (0.26 + rnd() * 0.08), 18, clamp(Math.max(from.h, dst.h) * 0.85, 18, 56))
    c1 = { x: S.x + d.x * 0.18 + out.x * lift, y: S.y + d.y * 0.18 + out.y * lift }
    c2 = { x: S.x + d.x * 0.86 + out.x * lift * 0.9, y: S.y + d.y * 0.86 + out.y * lift * 0.9 }
  }
  const pts = sample(Math.ceil(len / 2), (u) => {
    const p = cubic(S, c1, c2, E, u)
    const w = tremor(u) * Math.sin(Math.PI * u)
    return { x: p.x + perp.x * w, y: p.y + perp.y * w }
  }, width)
  if (!withHead) return [{ pts, t0: 0, t1: 1, color }]
  const dir = norm({ x: E.x - c2.x, y: E.y - c2.y })
  const size = clamp(width * 3.6 + len * 0.03, 10, 26)
  return [{ pts, t0: 0, t1: 0.72, color }, ...head(E, dir, size, width, rnd, color, 0.74, 1)]
}

function fork(lines: Box[], targets: Box[], width: number, rnd: () => number, tones: string[], clipMax: number): Stroke[] {
  const src = union(lines)
  // Each branch keeps the tone listed for its own target, wherever the layout puts that target.
  const [stemC, t1C, t2C] = tones.length >= 3 ? tones : tones.length === 2 ? [tones[0], tones[0], tones[1]] : [tones[0], tones[0], tones[0]]
  const paired = [
    { box: targets[0], color: t1C },
    { box: targets[1], color: t2C },
  ].sort((p, q) => p.box.y - q.box.y || p.box.x - q.box.x)
  const [a, b] = paired.map((p) => p.box)
  const [b1C, b2C] = paired.map((p) => p.color)
  const overlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const stacked = overlap > Math.min(a.w, b.w) * 0.3
  const S = { x: src.x + src.w / 2, y: src.y + src.h + Math.max(2, width * 0.5) }
  const room = Math.max(8, a.y - S.y)
  const P = { x: S.x + (rnd() - 0.5) * width, y: S.y + clamp(room * 0.3, 4, 40) }
  const stem = { pts: sample(8, (u) => ({ x: S.x + (P.x - S.x) * u, y: S.y + (P.y - S.y) * u }), width), t0: 0, t1: 0.14, color: stemC }
  const size = clamp(width * 3.4, 11, 22)
  const branch = (E: Vec, c1: Vec, c2: Vec, color: string, t0: number, t1: number) => {
    const len = Math.hypot(E.x - P.x, E.y - P.y)
    const tremor = wave(rnd, width * 0.3)
    const pts = sample(Math.ceil(len / 2), (u) => {
      const p = cubic(P, c1, c2, E, u)
      return { x: p.x, y: p.y + tremor(u) * Math.sin(Math.PI * u) }
    }, width)
    const dir = norm({ x: E.x - c2.x, y: E.y - c2.y })
    return [{ pts, t0, t1: t0 + (t1 - t0) * 0.78, color }, ...head(E, dir, size, width, rnd, color, t0 + (t1 - t0) * 0.8, t1)]
  }
  if (!stacked) {
    // Side by side: two arms leave the stem almost level and turn down into each target's top edge.
    const [left, right] = paired.slice().sort((p, q) => p.box.x - q.box.x)
    // Each arm leaves the stem on a slant, like the split of a Y, and settles into a downward
    // approach over its target.
    const arm = (t: Box, color: string, t0: number, t1: number) => {
      const E = { x: t.x + t.w / 2 + (P.x - (t.x + t.w / 2)) * 0.22, y: t.y - Math.max(1, width * 0.4) }
      const dx = E.x - P.x
      const dy = E.y - P.y
      return branch(E, { x: P.x + dx * 0.3, y: P.y + dy * 0.35 }, { x: E.x - dx * 0.08, y: P.y + dy * 0.3 }, color, t0, t1)
    }
    return [stem, ...arm(left.box, left.color, 0.15, 0.56), ...arm(right.box, right.color, 0.6, 1)]
  }
  // Stacked: the first arm lands on the upper target; the second runs down the right gutter and
  // turns into the lower target's right edge.
  const E1 = { x: a.x + a.w * 0.3, y: a.y - Math.max(1, width * 0.4) }
  const dy1 = E1.y - P.y
  const one = branch(E1, { x: P.x + (E1.x - P.x) * 0.55, y: P.y + dy1 * 0.02 }, { x: E1.x, y: P.y + dy1 * 0.12 }, b1C, 0.15, 0.52)
  const G = Math.min(Math.max(a.x + a.w, b.x + b.w) + clamp((clipMax - (b.x + b.w)) * 0.5, 5, 22), clipMax - width)
  const E2 = { x: b.x + b.w + Math.max(3, width), y: b.y + Math.min(b.h * 0.35, 42) }
  const run = { x: G, y: a.y + a.h * 0.25 }
  const len1 = Math.hypot(run.x - P.x, run.y - P.y)
  const len2 = Math.abs(E2.y - run.y)
  const tremor = wave(rnd, width * 0.3)
  const total = len1 + len2
  const pts = sample(Math.ceil(total / 2), (u) => {
    const s = u * total
    if (s <= len1) {
      const p = cubic(P, { x: P.x + (G - P.x) * 0.7, y: P.y }, { x: G, y: P.y + (run.y - P.y) * 0.3 }, run, s / len1)
      return { x: p.x, y: p.y + tremor(u) }
    }
    const v = (s - len1) / len2
    // The last stretch bends from straight down to straight left.
    const p = cubic(run, { x: G, y: run.y + (E2.y - run.y) * 0.6 }, { x: G, y: E2.y }, E2, v)
    return { x: p.x + tremor(u) * (1 - v), y: p.y }
  }, width)
  return [stem, ...one, { pts, t0: 0.56, t1: 0.9, color: b2C }, ...head(E2, { x: -1, y: 0 }, size, width, rnd, b2C, 0.91, 1)]
}

// ---------------------------------------------------------------------------------------------

function draw(m: Mark, t: number, dpr: number) {
  const { ctx, canvas, box } = m
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (t <= 0) return
  ctx.setTransform(dpr, 0, 0, dpr, -box.x * dpr, -box.y * dpr)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const s of m.strokes) {
    if (t <= s.t0) continue
    const f = clamp((t - s.t0) / (s.t1 - s.t0), 0, 1)
    const end = f * (s.pts.length - 1)
    const whole = Math.floor(end)
    ctx.strokeStyle = s.color
    // Runs of equal (quantised) width share one path; round caps hide the joins between runs.
    let i = 0
    while (i < whole || (i === whole && end > whole && i < s.pts.length - 1)) {
      const w = Math.round(s.pts[i].w * 4) / 4
      ctx.beginPath()
      ctx.lineWidth = w
      ctx.moveTo(s.pts[i].x, s.pts[i].y)
      let j = i
      while (j < whole && Math.round(s.pts[j + 1].w * 4) / 4 === w) {
        j++
        ctx.lineTo(s.pts[j].x, s.pts[j].y)
      }
      if (j === i) {
        const k = Math.min(i + 1, s.pts.length - 1)
        const part = j < whole ? 1 : end - whole
        ctx.lineTo(s.pts[i].x + (s.pts[k].x - s.pts[i].x) * part, s.pts[i].y + (s.pts[k].y - s.pts[i].y) * part)
        j = i + 1
      }
      ctx.stroke()
      i = j
      if (i >= whole && !(end > whole && i === whole)) break
    }
  }
}

function sides(value: string | undefined): Side[] {
  return (value ?? '').split(',').map((s) => s.trim() as Side)
}

// Phase two: canvases and triggers, after SplitText and after every pin exists.
export function guidePen(root: HTMLElement, specs: PenSpec[]): Cleanup {
  if (!specs.length || reduced()) return () => {}
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const marks: Mark[] = []
  const restore: Cleanup[] = []
  const killers: Cleanup[] = []
  const byElement = new Map<Element, Mark[]>()
  const observer = new ResizeObserver((entries) => entries.forEach((e) => byElement.get(e.target)?.forEach(request)))

  const pending = new Set<Mark>()
  let ticking = false
  function request(m: Mark) {
    pending.add(m)
    if (!ticking) {
      ticking = true
      gsap.ticker.add(flush)
    }
  }
  // All reads for the batch first, then all writes, so marks never force layout on each other.
  function flush() {
    const batch = Array.from(pending)
    pending.clear()
    const geos = batch.map(measure)
    batch.forEach((m, i) => apply(m, geos[i]))
    if (!pending.size) {
      gsap.ticker.remove(flush)
      ticking = false
    }
  }

  function measure(m: Mark): (Geometry & { follow: boolean }) | null {
    const { spec, host } = m
    if (m.state.t <= 0 && m.drawnT <= 0) return null
    const hostRect = host.getBoundingClientRect()
    if (!host.offsetWidth) return null
    const sx = hostRect.width / host.offsetWidth || 1
    const sy = hostRect.height / (host.offsetHeight || 1) || 1
    const ox = hostRect.left + host.clientLeft * sx - host.scrollLeft * sx
    const oy = hostRect.top + host.clientTop * sy - host.scrollTop * sy
    const local = (r: { left: number; top: number; width: number; height: number }): Box => ({
      x: (r.left - ox) / sx,
      y: (r.top - oy) / sy,
      w: r.width / sx,
      h: r.height / sy,
    })
    let isText = true
    let pieces = m.boxed ? [] : spec.splitHost ? textBoxes(spec.splitHost, spec.text, spec.offset) : textBoxes(spec.el, null, 0)
    let lines: Box[]
    if (!pieces.length && !spec.splitHost) {
      isText = false
      if (m.selfHosted) lines = spec.el.offsetWidth ? [{ x: 0, y: 0, w: spec.el.offsetWidth, h: spec.el.offsetHeight }] : []
      else {
        const r = spec.el.getBoundingClientRect()
        lines = r.width ? [local(r)] : []
      }
    } else lines = mergeLines(pieces.map(local))
    pieces = []
    const targets = m.targets.map((t) => t.getBoundingClientRect()).filter((r) => r.width > 0).map(local)
    const needs = spec.shape === 'fork' ? 2 : spec.shape === 'arrow' || spec.shape === 'link' ? 1 : 0
    const media = spec.el.dataset.penMedia
    const off = media ? !window.matchMedia(media).matches : false
    if (off || !lines.length || targets.length < needs) return { key: 'hidden', lines: [], targets: [], fontSize: 0, isText, opacity: 0, clipMin: 0, clipMax: 0, follow: false }
    const inset = spec.el.dataset.penInset
    if (inset && !isText) {
      const b = lines[0]
      const v = inset.endsWith('%') ? (parseFloat(inset) / 100) * Math.min(b.w, b.h) : parseFloat(inset) || 0
      lines = [{ x: b.x + v, y: b.y + v, w: b.w - v * 2, h: b.h - v * 2 }]
    }
    // The canvas sits outside the anchor, so it takes on any fade the anchor's ancestors carry.
    let opacity = 1
    if (!m.selfHosted) {
      for (let n: HTMLElement | null = m.source; n && n !== host; n = n.parentElement) opacity *= parseFloat(getComputedStyle(n).opacity) || 0
    }
    const fontSize = parseFloat(getComputedStyle(spec.el).fontSize) || 16
    // While the anchor's own lines are still rising (split reveal, intro), follow them each frame.
    let follow = false
    if (!m.selfHosted) {
      if (spec.splitHost) follow = Array.from(spec.splitHost.querySelectorAll('.motion-line')).some((l) => gsap.isTweening(l))
      if (!follow && typeof spec.el.getAnimations === 'function' && spec.el.isConnected) {
        follow = spec.el.getAnimations({ subtree: true }).some((a) => {
          const end = a.effect?.getComputedTiming().endTime
          return a.playState === 'running' && typeof end === 'number' && Number.isFinite(end)
        })
      }
      // A connector also follows its targets while they are still animating in (a door rising
      // under the arm's head), so its heads settle where the targets settle.
      if (!follow && m.targets.length) {
        follow = m.targets.some((target) => {
          for (let n: HTMLElement | null = target; n && n !== host; n = n.parentElement) {
            if (typeof n.getAnimations !== 'function') break
            const moving = n.getAnimations().some((a) => {
              const end = a.effect?.getComputedTiming().endTime
              return a.playState === 'running' && typeof end === 'number' && Number.isFinite(end)
            })
            if (moving) return true
          }
          return false
        })
      }
    }
    const clipMin = (0 - ox) / sx
    const clipMax = (document.documentElement.clientWidth - ox) / sx
    const r1 = (v: number) => Math.round(v * 2) / 2
    const key = [...lines, ...targets].map((b) => `${r1(b.x)},${r1(b.y)},${r1(b.w)},${r1(b.h)}`).join('|') + `|${fontSize}|${r1(clipMax)}`
    return { key, lines, targets, fontSize, isText, opacity, clipMin, clipMax, follow }
  }

  function apply(m: Mark, g: (Geometry & { follow: boolean }) | null) {
    if (!g) return
    const { canvas } = m
    if (g.key === 'hidden') {
      if (!m.hidden) canvas.style.display = 'none'
      m.hidden = true
      m.key = 'hidden'
      return
    }
    if (m.hidden) canvas.style.display = ''
    m.hidden = false
    if (g.key !== m.key) {
      m.key = g.key
      const rnd = mulberry32(m.seed)
      const fixed = parseFloat(m.spec.el.dataset.penWidth ?? '')
      const box = union(g.lines)
      const basis = m.spec.shape === 'circle' && !g.isText ? Math.min(box.w, box.h) * 0.013 : g.fontSize * 0.082
      const narrow = document.documentElement.clientWidth < 900 ? 0.8 : 1
      const width = Number.isFinite(fixed) ? fixed * narrow : clamp(basis, 2.5, 6) * narrow
      const tone = m.tones[0]
      const sideList = sides(m.spec.el.dataset.penSide)
      if (m.spec.shape === 'circle') m.strokes = circle(box, g.isText, width, rnd, tone, [g.clipMin, g.clipMax])
      else if (m.spec.shape === 'underline') m.strokes = underline(g.lines, width, rnd, tone)
      else if (m.spec.shape === 'arrow') m.strokes = connector(g.lines, g.targets[0], width, rnd, tone, true, sideList)
      else if (m.spec.shape === 'link') m.strokes = connector(g.lines, g.targets[0], width, rnd, tone, false, sideList)
      else m.strokes = fork(g.lines, g.targets, width, rnd, m.tones, g.clipMax)
      const pad = width * 1.5 + 2
      const xs = m.strokes.flatMap((s) => s.pts.map((p) => p.x))
      const ys = m.strokes.flatMap((s) => s.pts.map((p) => p.y))
      // Never wider than the viewport: a mark must not open a horizontal scroll.
      const x0 = Math.max(Math.floor(Math.min(...xs) - pad), Math.ceil(g.clipMin))
      const x1 = Math.min(Math.ceil(Math.max(...xs) + pad), Math.floor(g.clipMax))
      const y0 = Math.floor(Math.min(...ys) - pad)
      const y1 = Math.ceil(Math.max(...ys) + pad)
      const next = { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) }
      if (next.w !== m.box.w || next.h !== m.box.h) {
        canvas.width = Math.round(next.w * dpr)
        canvas.height = Math.round(next.h * dpr)
        canvas.style.width = `${next.w}px`
        canvas.style.height = `${next.h}px`
      }
      if (next.x !== m.box.x) canvas.style.left = `${next.x}px`
      if (next.y !== m.box.y) canvas.style.top = `${next.y}px`
      m.box = next
      m.drawnT = -1
    }
    if (g.opacity !== m.opacity) {
      canvas.style.opacity = String(g.opacity)
      m.opacity = g.opacity
    }
    const t = m.state.t
    if (t !== m.drawnT) {
      draw(m, t, dpr)
      m.drawnT = t
    }
    if (g.follow) request(m)
  }

  specs.forEach((spec) => {
    const { el, shape } = spec
    if (!el.isConnected && !spec.splitHost?.isConnected) return
    const targets = splitSelectors(el.dataset.penTo ?? '')
      .map((sel) => nearestMatch(spec.splitHost ?? el, sel, root))
      .filter((t): t is HTMLElement => Boolean(t))
    if ((shape === 'fork' && targets.length < 2) || ((shape === 'arrow' || shape === 'link') && !targets.length)) return
    const source = spec.splitHost ?? el
    const connectorShape = shape === 'arrow' || shape === 'link' || shape === 'fork'
    // Circles and underlines on a block anchor live inside it and move with it; everything else
    // lives in the nearest positioned ancestor that holds the anchor and its targets.
    let host: HTMLElement | null = null
    let selfHosted = false
    if (!connectorShape && !spec.splitHost && getComputedStyle(el).display !== 'inline') {
      host = el
      selfHosted = true
    } else {
      const base = commonAncestor([source, ...targets])
      for (let n = connectorShape ? base : source.parentElement; n; n = n.parentElement) {
        if (isPositioned(n) || n === root) {
          host = n
          break
        }
      }
    }
    if (!host) return
    if (getComputedStyle(host).position === 'static') {
      const before = host.style.position
      host.style.position = 'relative'
      const h = host
      restore.push(() => {
        h.style.position = before
      })
    }
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.dataset.penCanvas = shape
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:1px;pointer-events:none;overflow:visible;z-index:2'
    host.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      canvas.remove()
      return
    }
    const custom = getComputedStyle(el).getPropertyValue('--pen-color').trim()
    const tones = (el.dataset.penTone ?? 'lacquer').split(',').map((t) => custom || TONES[t.trim()] || TONES.lacquer)
    const m: Mark = {
      spec,
      host,
      source,
      targets,
      canvas,
      ctx,
      tones,
      seed: Number(el.dataset.penSeed) || hash((spec.text || el.textContent || '') + shape),
      state: { t: 0 },
      selfHosted,
      boxed: !spec.splitHost && /flex|grid/.test(getComputedStyle(el).display),
      key: '',
      strokes: [],
      box: { x: 0, y: 0, w: 1, h: 1 },
      drawnT: 0,
      opacity: 1,
      hidden: false,
    }
    marks.push(m)
    const paint = () => request(m)
    let tween: gsap.core.Tween
    if (el.dataset.penTrigger === 'load') {
      const delay = Number(el.dataset.penDelay ?? 0) / 1000
      const duration = shape === 'fork' ? 1.4 : shape === 'underline' ? 0.9 : shape === 'circle' ? 1.1 : 1.2
      tween = gsap.to(m.state, { t: 1, duration, delay, ease: 'power2.inOut', onUpdate: paint })
      if (el.dataset.penDuration) tween.duration(Number(el.dataset.penDuration) / 1000)
    } else if (el.dataset.penTrigger === 'when' && el.dataset.penWhen) {
      // A state mark, e.g. a ring around the step being played: it draws when the state arrives and
      // wipes back quicker when it leaves, so moving on reads as the hand lifting to the next one.
      const when = el.dataset.penWhen
      const drawn = gsap.to(m.state, { t: 1, duration: 0.9, ease: 'power2.inOut', paused: true, onUpdate: paint, onReverseComplete: paint })
      tween = drawn
      let on = false
      const check = () => {
        let now = false
        try {
          now = el.matches(when)
        } catch {
          now = false
        }
        if (now === on) return
        on = now
        if (now) drawn.timeScale(1).play()
        else drawn.timeScale(2.2).reverse()
      }
      const names = Array.from(when.matchAll(/\[([\w-]+)/g), (match) => match[1])
      const watch = new MutationObserver(check)
      if (names.length) watch.observe(root, { subtree: true, attributes: true, attributeFilter: names })
      check()
      killers.push(() => watch.disconnect())
    } else {
      // A sticky anchor would give ScrollTrigger a moving start, so the trigger is its
      // nearest ancestor that scrolls normally.
      let trigger: HTMLElement = source
      for (let n: HTMLElement | null = source; n && n !== root; n = n.parentElement) {
        if (getComputedStyle(n).position === 'sticky') trigger = n.parentElement ?? trigger
      }
      tween = gsap.to(m.state, {
        t: 1,
        ease: 'none',
        onUpdate: paint,
        scrollTrigger: {
          trigger,
          start: el.dataset.penStart ?? 'top 85%',
          end: el.dataset.penEnd ?? 'top 45%',
          scrub: 0.6,
        },
      })
    }
    killers.push(() => {
      tween.scrollTrigger?.kill()
      tween.kill()
    })
    // A mark that does not live inside its anchor follows it while its host is on screen.
    if (!selfHosted) {
      const track = ScrollTrigger.create({
        trigger: host,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: () => {
          if (m.state.t > 0) paint()
        },
      })
      killers.push(() => track.kill())
    }
    ;[host, source, ...targets].forEach((node) => {
      const list = byElement.get(node) ?? []
      list.push(m)
      byElement.set(node, list)
      observer.observe(node)
    })
  })

  const onRefresh = () => marks.forEach(request)
  ScrollTrigger.addEventListener('refresh', onRefresh)

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh)
    observer.disconnect()
    if (ticking) gsap.ticker.remove(flush)
    ticking = false
    pending.clear()
    killers.forEach((fn) => fn())
    marks.forEach((m) => m.canvas.remove())
    restore.forEach((fn) => fn())
  }
}
