// The guide's trail ("vệt đường người dẫn"): one continuous felt-tip line in lacquer that the
// reader's scroll draws down the page, from the hero question through the margins and gutters of
// every section, to the two closing doors, where it splits into a lime arrow (Tensai) and an ember
// arrow (Conan). It never crosses body text or faces: it only runs between waypoints the markup
// places in the gaps.
//
// Markup (any element inside the root; "|" separates several points on one element):
//   data-trail-point="<order>"        position along the trail (numbers, sorted ascending)
//   data-trail-at="ax ay dx dy"       where on the element's box: fractions of its width/height
//                                     plus px offsets (default "0 0 0 0")
//   data-trail-at-m="ax ay dx dy"     the same on phones (<900px); without it the point is pulled
//                                     into the left gutter at the desktop height
//   data-trail-tone="lacquer|paper|lime|ember"  colour of the stretch that leaves this point
//   data-trail-mobile="off"           the point is skipped on phones
//   data-trail-branch="<order> <tone>" not on the line itself: an arrow that leaves the point
//                                     <order> and lands here (data-trail-at is its tip)
//   data-trail-bend="side|down"       how an arrow travels: sideways first and then down onto its
//                                     tip (default), or down first and then sideways into it
//   data-trail-behind                 the line passes under this element (a strip of photos, a
//                                     tape of words): it is cut out wherever the two overlap
//   data-trail-load                   the point belongs to the opening stretch, drawn on a clock
//                                     between 1s and 2.5s after load instead of by the scroll
//   data-trail-scope="<name>" data-trail-under="<cover>"  a layer another one slides over:
//                                     strokes leaving its points are cut at the top edge of the
//                                     element marked data-trail-cover="<cover>"
//
// One fixed canvas the size of the screen; every frame it is busy (scrolling, resizing, the load
// clock) it measures the waypoints live, so pinned and sticky layers carry the line with them,
// and paints only what is on screen. The drawn head sits at 60% of the screen height (it ramps
// down to the bottom over the last screen of the page, so the end arrows can finish). Nothing
// runs while the page is idle. Under reduced motion there is no trail.
import { gsap } from 'gsap'

type Cleanup = () => void
type Vec = { x: number; y: number }
type Anchor = {
  el: HTMLElement
  order: number
  at: number[]
  atM: number[] | null
  tone: string
  load: boolean
  mobileOff: boolean
  branchFrom: number | null
  down: boolean
  scope: HTMLElement | null
}
type Point = Vec & { a: Anchor; clip: number }
type Sample = Vec & { w: number }

const DESKTOP = '(min-width: 900px)'
const TONES: Record<string, string> = {
  lacquer: '#d23a30',
  lime: '#c3f331',
  ember: '#e0582f',
  paper: '#efe6d6',
  ink: '#151310',
}
const LOAD_FROM = 1000
const LOAD_TO = 2500
const IDLE_AFTER = 1400

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

// A slow tremor: three sines with seeded phases, the same hand on every frame.
function tremor(seed: number) {
  const rnd = mulberry32(seed)
  const f = [1 + rnd(), 2.6 + rnd() * 1.4, 6 + rnd() * 3]
  const p = f.map(() => rnd() * Math.PI * 2)
  return (u: number) => Math.sin(u * f[0] + p[0]) * 0.6 + Math.sin(u * f[1] + p[1]) * 0.3 + Math.sin(u * f[2] + p[2]) * 0.1
}

// Felt-tip pressure along the line: keyed on the stretch and its own progress, so it never swims.
const pressure = (g: number) => 0.8 + 0.14 * Math.sin(g * 2.3 + 0.7) + 0.06 * Math.sin(g * 7.1 + 2.1)

const nums = (value: string | undefined) => (value ?? '').trim().split(/\s+/).filter(Boolean).map(Number)

function collect(root: HTMLElement): Anchor[] {
  const out: Anchor[] = []
  root.querySelectorAll<HTMLElement>('[data-trail-point],[data-trail-branch]').forEach((el) => {
    const ats = (el.dataset.trailAt ?? '').split('|')
    const atMs = el.dataset.trailAtM?.split('|')
    const tones = (el.dataset.trailTone ?? '').split('|')
    const scope = el.closest<HTMLElement>('[data-trail-scope]')
    const base = {
      el,
      load: el.hasAttribute('data-trail-load'),
      mobileOff: el.dataset.trailMobile === 'off',
      down: el.dataset.trailBend === 'down',
      scope,
    }
    if (el.dataset.trailBranch) {
      const [from, tone] = el.dataset.trailBranch.trim().split(/\s+/)
      out.push({ ...base, order: Number(from), at: nums(ats[0]), atM: atMs ? nums(atMs[0]) : null, tone: tone || 'lacquer', branchFrom: Number(from) })
    }
    if (el.dataset.trailPoint) {
      el.dataset.trailPoint.split('|').forEach((order, i) => {
        out.push({
          ...base,
          order: Number(order),
          at: nums(ats[i] ?? ats[0]),
          atM: atMs ? nums(atMs[i] ?? atMs[0]) : null,
          tone: tones[i] || tones[0] || 'lacquer',
          branchFrom: null,
        })
      })
    }
  })
  return out.sort((a, b) => a.order - b.order)
}

// Control points for one stretch of a Catmull-Rom curve, with the tangents held short so a
// tight turn between two long runs does not loop.
function bezier(p0: Vec, p1: Vec, p2: Vec, p3: Vec) {
  const d1 = Math.hypot(p2.x - p1.x, p2.y - p1.y)
  const limit = (v: Vec, near: number) => {
    const l = Math.hypot(v.x, v.y) || 1
    const k = Math.min(1, (near * 0.42) / l)
    return { x: v.x * k, y: v.y * k }
  }
  const m1 = limit({ x: (p2.x - p0.x) / 6, y: (p2.y - p0.y) / 6 }, Math.min(d1, Math.hypot(p1.x - p0.x, p1.y - p0.y) || d1))
  const m2 = limit({ x: (p3.x - p1.x) / 6, y: (p3.y - p1.y) / 6 }, Math.min(d1, Math.hypot(p3.x - p2.x, p3.y - p2.y) || d1))
  return [p1, { x: p1.x + m1.x, y: p1.y + m1.y }, { x: p2.x - m2.x, y: p2.y - m2.y }, p2]
}

function cubicAt(c: Vec[], u: number): Vec {
  const m = 1 - u
  return {
    x: m * m * m * c[0].x + 3 * m * m * u * c[1].x + 3 * m * u * u * c[2].x + u * u * u * c[3].x,
    y: m * m * m * c[0].y + 3 * m * m * u * c[1].y + 3 * m * u * u * c[2].y + u * u * u * c[3].y,
  }
}

// One stretch as hand-drawn samples: the curve, pushed sideways by the tremor (pinned to zero at
// both waypoints, so stretches meet), with the width breathing along it.
function stretch(c: Vec[], key: number, width: number, wobble: number): Sample[] {
  const approx = Math.hypot(c[3].x - c[0].x, c[3].y - c[0].y) + Math.hypot(c[1].x - c[0].x, c[1].y - c[0].y) * 0.5
  const n = Math.max(4, Math.ceil(approx / 5))
  const shake = tremor(1013 + key * 7919)
  const out: Sample[] = []
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const p = cubicAt(c, u)
    const q = cubicAt(c, Math.min(1, u + 0.01))
    const r = cubicAt(c, Math.max(0, u - 0.01))
    const tx = q.x - r.x
    const ty = q.y - r.y
    const tl = Math.hypot(tx, ty) || 1
    const off = wobble * Math.sin(Math.PI * u) * shake((u * approx) / 260)
    out.push({ x: p.x - (ty / tl) * off, y: p.y + (tx / tl) * off, w: width * pressure(key + u) })
  }
  return out
}

// Strokes a run of samples, batching neighbours of equal (quantised) width into one path.
function ink(ctx: CanvasRenderingContext2D, pts: Sample[], color: string, upTo = pts.length - 1) {
  if (upTo < 1) return
  ctx.strokeStyle = color
  let i = 0
  while (i < upTo) {
    const w = Math.round(pts[i].w * 4) / 4
    ctx.beginPath()
    ctx.lineWidth = w
    ctx.moveTo(pts[i].x, pts[i].y)
    let j = i
    while (j < upTo && Math.round(pts[j].w * 4) / 4 === w) {
      ctx.lineTo(pts[j + 1].x, pts[j + 1].y)
      j++
    }
    ctx.stroke()
    i = j
  }
}

// Cuts samples at the head: everything up to index k plus a partial step to the head itself.
function cut(pts: Sample[], headY: number): { pts: Sample[]; done: boolean } {
  let last = -1
  for (let i = pts.length - 1; i >= 0; i--) {
    if (pts[i].y <= headY) {
      last = i
      break
    }
  }
  if (last < 0) return { pts: [], done: false }
  if (last === pts.length - 1) return { pts, done: true }
  const a = pts[last]
  const b = pts[last + 1]
  const t = b.y === a.y ? 0 : clamp((headY - a.y) / (b.y - a.y), 0, 1)
  return { pts: [...pts.slice(0, last + 1), { x: a.x + (b.x - a.x) * t, y: headY, w: a.w }], done: false }
}

// Cuts samples by a share of their length (the load clock).
function share(pts: Sample[], t: number): Sample[] {
  if (t >= 1) return pts
  if (t <= 0) return []
  const k = t * (pts.length - 1)
  const i = Math.floor(k)
  const a = pts[i]
  const b = pts[Math.min(pts.length - 1, i + 1)]
  const f = k - i
  return [...pts.slice(0, i + 1), { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, w: a.w }]
}

// The pen itself at the head: a felt nib laid along the stroke.
function nib(ctx: CanvasRenderingContext2D, pts: Sample[], color: string, width: number) {
  if (pts.length < 2) return
  const a = pts[pts.length - 1]
  const b = pts[Math.max(0, pts.length - 4)]
  const ang = Math.atan2(a.y - b.y, a.x - b.x)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(a.x, a.y, width * 1.15, width * 0.72, ang, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgb(255 255 255 / 0.28)'
  ctx.beginPath()
  ctx.ellipse(a.x + Math.cos(ang) * width * 0.35, a.y + Math.sin(ang) * width * 0.35, width * 0.4, width * 0.22, ang, 0, Math.PI * 2)
  ctx.fill()
}

// Two quick strokes into the tip of an arrow, grown by t (0-1).
function arrowHead(ctx: CanvasRenderingContext2D, pts: Sample[], color: string, width: number, t: number, seed: number) {
  if (t <= 0 || pts.length < 3) return
  const tip = pts[pts.length - 1]
  const back = pts[Math.max(0, pts.length - 7)]
  const dir = Math.atan2(tip.y - back.y, tip.x - back.x)
  const rnd = mulberry32(seed)
  const size = width * 4.2
  ctx.strokeStyle = color
  for (const side of [1, -1]) {
    const a = dir + Math.PI + side * ((27 + rnd() * 6) * Math.PI) / 180
    const len = size * (0.9 + rnd() * 0.2) * clamp(t * 2 - (side < 0 ? 0.5 : 0), 0, 1)
    if (len <= 0) continue
    const ox = tip.x + Math.cos(a) * len
    const oy = tip.y + Math.sin(a) * len
    const bend = dir + side * Math.PI * 0.5
    ctx.beginPath()
    ctx.lineWidth = width * 0.9
    ctx.moveTo(ox, oy)
    ctx.quadraticCurveTo((ox + tip.x) / 2 + Math.cos(bend) * len * 0.08, (oy + tip.y) / 2 + Math.sin(bend) * len * 0.08, tip.x, tip.y)
    ctx.stroke()
  }
}

export function guideTrail(root: HTMLElement): Cleanup {
  const anchors = collect(root)
  // A trail needs at least two points of its own; a lone door point (the closing doors reused on
  // other pages) draws nothing.
  if (anchors.filter((a) => a.branchFrom === null).length < 2 || reduced()) return () => {}

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.dataset.guideTrail = ''
  Object.assign(canvas.style, {
    height: '100%',
    inset: '0',
    pointerEvents: 'none',
    position: 'fixed',
    width: '100%',
    zIndex: '45',
  })
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return () => {}
  }

  const behind = Array.from(root.querySelectorAll<HTMLElement>('[data-trail-behind]'))
  const covers = new Map<string, HTMLElement>()
  root.querySelectorAll<HTMLElement>('[data-trail-cover]').forEach((el) => covers.set(el.dataset.trailCover ?? '', el))
  const desktop = window.matchMedia(DESKTOP)
  const born = performance.now()
  const loadFrom = Math.max(LOAD_FROM, born + 150)
  let lastKey = ''
  let busyUntil = 0
  let cw = 0
  let ch = 0

  const measure = (a: Anchor, wide: boolean, vh: number, gutter: number): Point | null => {
    if (!wide && a.mobileOff) return null
    const r = a.el.getBoundingClientRect()
    if (!r.width && !r.height) return null
    const spec = !wide && a.atM ? a.atM : a.at
    const [ax = 0, ay = 0, dx = 0, dy = 0] = spec
    let x = r.left + ax * r.width + dx
    const y = r.top + ay * r.height + dy
    if (!wide && !a.atM) x = gutter
    let clip = Infinity
    const under = a.scope?.dataset.trailUnder
    const cover = under ? covers.get(under) : null
    if (cover) {
      const top = cover.getBoundingClientRect().top
      if (top < vh * 2) clip = top
    }
    if (clip < 0) clip = 0
    return { x, y, a, clip }
  }

  const paint = (now: number) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    if (cw !== vw * dpr || ch !== vh * dpr) {
      cw = canvas.width = Math.round(vw * dpr)
      ch = canvas.height = Math.round(vh * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, vw, vh)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const wide = desktop.matches
    const scale = wide ? clamp(vw / 1440, 0.72, 1.25) : 0.62
    const width = 5.6 * scale
    const wobble = (wide ? 2.4 : 1.4) * scale
    const gutter = Math.max(7, Math.min(16, vw * 0.02))

    const pts: Point[] = []
    const branches: Point[] = []
    for (const a of anchors) {
      const p = measure(a, wide, vh, gutter)
      if (!p) continue
      if (a.branchFrom === null) pts.push(p)
      else if (wide || !a.mobileOff) branches.push(p)
    }
    if (pts.length < 2) return

    const maxScroll = document.documentElement.scrollHeight - vh
    const ramp = clamp(1 - (maxScroll - window.scrollY) / (vh * 0.8), 0, 1)
    const headY = vh * (0.6 + 0.4 * ramp)
    const loadT = clamp((now - loadFrom) / (LOAD_TO - LOAD_FROM), 0, 1)

    // Stretches, each with the clip of the layer it leaves from.
    let frontier = -1
    const runs: { s: Sample[]; tone: string; clip: number; load: boolean }[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const c = bezier(pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)])
      const s = stretch(c, i + pts[i].a.order * 0.37, width, wobble)
      const load = pts[i].a.load && pts[i + 1].a.load
      runs.push({ s, tone: pts[i].a.tone, clip: pts[i].clip, load })
      if (!load && s.some((p) => p.y <= headY)) frontier = i
    }

    const holes = behind
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.bottom > 0 && r.top < vh)
    // Everything is drawn inside the layer's clip, with the elements the line passes under cut out.
    const within = (clip: number, fn: () => void) => {
      if (clip <= 0) return
      const clipped = clip < vh || holes.length > 0
      if (clipped) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, vw, Math.min(clip, vh))
        holes.forEach((r) => ctx.rect(r.left, r.top, r.width, r.height))
        ctx.clip('evenodd')
      }
      fn()
      if (clipped) ctx.restore()
    }
    const drawRun = (s: Sample[], tone: string, clip: number) => {
      if (s.length) within(clip, () => ink(ctx, s, TONES[tone] ?? TONES.lacquer))
    }

    // The opening stretch, on its clock: the stem first, the branches after.
    const loadRuns = runs.filter((r) => r.load)
    loadRuns.forEach((r, i) => {
      const t0 = (i / Math.max(1, loadRuns.length)) * 0.55
      const t1 = t0 + 0.55 / Math.max(1, loadRuns.length)
      drawRun(share(r.s, clamp((loadT - t0) / (t1 - t0), 0, 1)), r.tone, r.clip)
    })

    let head: { s: Sample[]; tone: string; clip: number } | null = null
    let mainDone = false
    runs.forEach((r, i) => {
      if (r.load || i > frontier) return
      if (i < frontier) return drawRun(r.s, r.tone, r.clip)
      const c = cut(r.s, headY)
      drawRun(c.pts, r.tone, r.clip)
      head = { s: c.pts, tone: r.tone, clip: r.clip }
      mainDone = c.done && i === runs.length - 1
    })

    // Arrows: from their waypoint to their tip; the opening ones on the clock, the others when the
    // line has reached their waypoint.
    for (const b of branches) {
      const from = pts.find((p) => p.a.order === b.a.branchFrom)
      if (!from) continue
      const dy = b.y - from.y
      const dx = b.x - from.x
      const c = b.a.down
        ? [
            { x: from.x, y: from.y },
            { x: from.x, y: b.y - Math.min(18, dy * 0.1) },
            { x: from.x + dx * 0.3, y: b.y },
            { x: b.x, y: b.y },
          ]
        : [
            { x: from.x, y: from.y },
            { x: from.x + dx * 0.7, y: from.y - 6 },
            { x: b.x, y: b.y - Math.max(16, dy * 0.75) },
            { x: b.x, y: b.y },
          ]
      const s = stretch(c, 97 + b.a.order + (b.x > from.x ? 3 : 0), width * 0.92, wobble)
      let drawn: Sample[]
      let t: number
      if (b.a.load) {
        t = clamp((loadT - 0.42) / 0.5, 0, 1)
        drawn = share(s, t)
      } else {
        if (!mainDone) continue
        const c2 = cut(s, headY)
        drawn = c2.pts
        t = c2.done ? 1 : 0
      }
      drawRun(drawn, b.a.tone, from.clip)
      const tone = TONES[b.a.tone] ?? TONES.lacquer
      if (t >= 1) within(from.clip, () => arrowHead(ctx, s, tone, width * 0.92, 1, 31 + b.a.order + (b.x > from.x ? 5 : 0)))
      else if (drawn.length > 1) within(from.clip, () => nib(ctx, drawn, tone, width * 0.92))
    }

    const h = head as { s: Sample[]; tone: string; clip: number } | null
    if (h && !mainDone && h.s.length > 1) {
      const hh = h
      within(hh.clip, () => nib(ctx, hh.s, TONES[hh.tone] ?? TONES.lacquer, width))
    }
  }

  const tick = () => {
    const now = performance.now()
    const key = `${window.scrollY}|${window.innerWidth}|${window.innerHeight}`
    if (key !== lastKey) {
      lastKey = key
      busyUntil = now + IDLE_AFTER
    }
    if (now < busyUntil || now < loadFrom + (LOAD_TO - LOAD_FROM) + 120) paint(now)
  }
  const wake = () => {
    busyUntil = performance.now() + IDLE_AFTER
  }
  gsap.ticker.add(tick)
  window.addEventListener('resize', wake)
  window.addEventListener('pointerup', wake)
  paint(performance.now())

  return () => {
    gsap.ticker.remove(tick)
    window.removeEventListener('resize', wake)
    window.removeEventListener('pointerup', wake)
    canvas.remove()
  }
}
