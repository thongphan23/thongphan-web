'use client'

import { useEffect } from 'react'

// One shared film grain for every documentary frame. The tile is drawn once on a canvas,
// turned into a blob URL and published as --brand-grain on :root, so the CSS overlays that
// read it (mix-blend-mode: overlay) all share the same surface. No image file ships; without
// JavaScript --brand-grain stays `none` and the frames simply have no grain.
const TILE = 160
let grainUrl: string | null = null

function drawTile(): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas')
  canvas.width = TILE
  canvas.height = TILE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const image = ctx.createImageData(TILE, TILE)
  const data = image.data
  for (let i = 0; i < data.length; i += 4) {
    // Luminance noise around mid grey (neutral under overlay); two samples soften it towards a bell curve.
    const v = 128 + (Math.random() + Math.random() - 1) * 84
    data[i] = v
    data[i + 1] = v
    data[i + 2] = v
    data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  return canvas
}

export default function FilmGrain() {
  useEffect(() => {
    const root = document.documentElement
    if (grainUrl) {
      root.style.setProperty('--brand-grain', `url(${grainUrl})`)
      return
    }
    const canvas = drawTile()
    canvas?.toBlob((blob) => {
      if (!blob || grainUrl) return
      grainUrl = URL.createObjectURL(blob)
      root.style.setProperty('--brand-grain', `url(${grainUrl})`)
    }, 'image/png')
  }, [])
  return null
}
