// WebGL photo surface for [data-gl-photo]: the real photo is redrawn on a canvas so it can
// bend under the pointer like a liquid lens, ripple slightly with scroll speed and carry a
// fine film grain. The <img> stays in the DOM underneath as the fallback and for SEO and
// assistive tech; the canvas only fades in once its texture is ready.
import { gsap } from 'gsap'

type Cleanup = () => void

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAGMENT = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uFocus;
uniform vec2 uMouse;
uniform float uHover;
uniform float uTime;
uniform float uVel;
uniform float uReveal;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// object-fit: cover with the same object-position as the <img> underneath.
vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 scale = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return clamp(uv * scale + (1.0 - scale) * uFocus, 0.001, 0.999);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 d = uv - uMouse;
  d.x *= aspect;
  float dist = length(d);
  float lens = smoothstep(0.34, 0.0, dist) * uHover;
  vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
  dir.x /= aspect;

  // The photo breathes with a slow flow field, bulges toward the pointer and shears with scroll speed.
  float n = noise(uv * 2.6 + vec2(uTime * 0.04, uTime * 0.03));
  vec2 disp = (vec2(n, noise(uv * 2.6 - uTime * 0.035)) - 0.5) * 0.007;
  disp -= dir * lens * 0.05;
  disp.x += sin(uv.y * 10.0 + uTime * 1.4) * 0.008 * uVel;
  // Entrance: a soft wave that settles as uReveal reaches 1.
  disp.y += (1.0 - uReveal) * sin(uv.x * 6.0 + uTime) * 0.03;

  vec2 p = uv + disp;
  float split = 0.0035 * lens + 0.012 * uVel;
  vec3 col = vec3(
    texture2D(uTex, cover(p + vec2(split, 0.0))).r,
    texture2D(uTex, cover(p)).g,
    texture2D(uTex, cover(p - vec2(split, 0.0))).b
  );

  // A thin lit rim on the lens edge and a moving film grain.
  float rim = smoothstep(0.30, 0.335, dist) * smoothstep(0.37, 0.335, dist);
  col += rim * uHover * 0.05;
  col += (hash(uv * uRes + fract(uTime * 7.0) * 61.0) - 0.5) * 0.045;
  gl_FragColor = vec4(col, uReveal);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function parseFocus(value: string): [number, number] {
  const parts = value.split(' ').map((part) => (part.endsWith('%') ? parseFloat(part) / 100 : 0.5))
  return [parts[0] ?? 0.5, parts[1] ?? 0.5]
}

function mountOne(host: HTMLElement, getVelocity: () => number): Cleanup | null {
  const img = host.querySelector('img')
  if (!img) return null
  const canvas = document.createElement('canvas')
  canvas.className = 'gl-photo'
  canvas.setAttribute('aria-hidden', 'true')
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' })
  if (!gl) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const u = (name: string) => gl.getUniformLocation(program, name)
  const uRes = u('uRes')
  const uImg = u('uImg')
  const uFocus = u('uFocus')
  const uMouse = u('uMouse')
  const uHover = u('uHover')
  const uTime = u('uTime')
  const uVel = u('uVel')
  const uReveal = u('uReveal')

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  const state = { mx: 0.5, my: 0.5, hover: 0, vel: 0, reveal: 0 }
  const target = { mx: 0.5, my: 0.5, hover: 0 }
  let ready = false
  let visible = true
  let disposed = false

  const resize = () => {
    const box = host.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.max(1, Math.round(box.width * dpr))
    canvas.height = Math.max(1, Math.round(box.height * dpr))
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)
    const [fx, fy] = parseFocus(getComputedStyle(img).objectPosition)
    // Texture rows are flipped, so the vertical focus is mirrored.
    gl.uniform2f(uFocus, fx, 1 - fy)
  }

  const upload = () => {
    if (disposed || !img.naturalWidth) return
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.uniform2f(uImg, img.naturalWidth, img.naturalHeight)
    resize()
    ready = true
    host.dataset.glReady = 'true'
    // Hosts that also play a CSS entrance pass data-gl-delay so the canvas takes over after it.
    const delay = Number(host.dataset.glDelay ?? 0)
    gsap.to(state, { reveal: 1, duration: 1.8, delay, ease: 'power2.out' })
  }

  const render = (time: number) => {
    if (!ready || !visible) return
    const ease = 0.085
    state.mx += (target.mx - state.mx) * ease
    state.my += (target.my - state.my) * ease
    state.hover += (target.hover - state.hover) * 0.06
    state.vel += (Math.min(1, Math.abs(getVelocity()) / 40) - state.vel) * 0.1
    gl.uniform2f(uMouse, state.mx, state.my)
    gl.uniform1f(uHover, state.hover)
    gl.uniform1f(uTime, time)
    gl.uniform1f(uVel, state.vel)
    gl.uniform1f(uReveal, state.reveal)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const box = host.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
    target.hover = inside ? 1 : 0
    if (inside) {
      target.mx = x
      target.my = 1 - y
    }
  }
  const leave = () => {
    target.hover = 0
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
  })
  observer.observe(host)
  const resizeObserver = new ResizeObserver(() => ready && resize())
  resizeObserver.observe(host)

  host.appendChild(canvas)
  if (img.complete && img.naturalWidth) upload()
  else img.addEventListener('load', upload, { once: true })
  gsap.ticker.add(render)
  window.addEventListener('pointermove', move, { passive: true })
  document.documentElement.addEventListener('pointerleave', leave)

  return () => {
    disposed = true
    gsap.ticker.remove(render)
    gsap.killTweensOf(state)
    window.removeEventListener('pointermove', move)
    document.documentElement.removeEventListener('pointerleave', leave)
    img.removeEventListener('load', upload)
    observer.disconnect()
    resizeObserver.disconnect()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    canvas.remove()
    delete host.dataset.glReady
  }
}

// One canvas per photo, capped at a few per page so the GPU budget stays small.
export function glPhotos(root: HTMLElement, getVelocity: () => number): Cleanup {
  const hosts = Array.from(root.querySelectorAll<HTMLElement>('[data-gl-photo]')).slice(0, 3)
  const cleanups = hosts.map((host) => mountOne(host, getVelocity)).filter((fn): fn is Cleanup => Boolean(fn))
  return () => cleanups.forEach((fn) => fn())
}
