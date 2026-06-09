import type { CSSProperties } from 'react'

type BrandGlyphName = 'seed' | 'root' | 'leafNote' | 'fruit' | 'gate' | 'growthRing' | 'brainTree'

type BrandGlyphProps = {
  name: BrandGlyphName
  className?: string
  title?: string
  style?: CSSProperties
}

const stroke = 'currentColor'

export function BrandGlyph({ name, className, title, style }: BrandGlyphProps) {
  return (
    <svg
      className={className}
      style={style}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {name === 'seed' ? <SeedGlyph /> : null}
      {name === 'root' ? <RootGlyph /> : null}
      {name === 'leafNote' ? <LeafNoteGlyph /> : null}
      {name === 'fruit' ? <FruitGlyph /> : null}
      {name === 'gate' ? <GateGlyph /> : null}
      {name === 'growthRing' ? <GrowthRingGlyph /> : null}
      {name === 'brainTree' ? <BrainTreeGlyph /> : null}
    </svg>
  )
}

function SeedGlyph() {
  return (
    <>
      <path d="M20 7C13 12 10 18 11.5 24.5C13.1 31.4 19.2 34.2 24.8 30.2C30.7 26 31.3 17.4 20 7Z" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 13.2C18.8 18.4 19.6 23.2 23.2 28" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15.4 22.1C17.5 21.7 20 22.2 22.6 23.8" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </>
  )
}

function RootGlyph() {
  return (
    <>
      <path d="M20 6V18" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 18C20 23 16.2 27.4 10 32" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M20 18C21.3 23.8 25 28.2 31 33" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 23C14.1 23 11.9 21.8 9.7 19.8" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.74" />
      <path d="M23.4 24.2C26.2 23.5 28.4 21.9 30.7 19.4" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.74" />
      <path d="M13.6 29.1C11.6 28.9 9.6 29.4 7.4 30.9" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.64" />
      <path d="M26.9 29.4C29.1 28.9 31.2 29.2 33.6 30.6" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.64" />
    </>
  )
}

function LeafNoteGlyph() {
  return (
    <>
      <path d="M9 22.5C14.4 11.8 23.1 9.6 31 11.1C31.7 19.5 28.3 27.4 17.2 30.5C12.8 29 10 26.6 9 22.5Z" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.2 25.6C18.3 21.7 22.4 18.8 28.2 15.9" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17.3 17.6H23.8" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      <path d="M15.1 21.2H21.5" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
    </>
  )
}

function FruitGlyph() {
  return (
    <>
      <path d="M20 13C17.1 9.4 14.7 8 12 8" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20.5 13C23.8 9.9 27.1 9 31 10.1C29.8 14 26.8 16.2 21.8 16.4" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.2 15.4C13.8 15.7 9.5 20.4 10.4 26.6C11.3 32.9 17.3 35.1 20.1 30.8C23.2 35 29.3 32.8 30 26.4C30.8 20.2 26.4 15.6 20.2 15.4Z" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.2 23.5H23.8" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
      <path d="M17.4 27H22.5" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
    </>
  )
}

function GateGlyph() {
  return (
    <>
      <path d="M8 33V18C8 11.9 13.4 7 20 7C26.6 7 32 11.9 32 18V33" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 33V18.7C13 15.1 16.1 12.2 20 12.2C23.9 12.2 27 15.1 27 18.7V33" stroke={stroke} strokeWidth="1.35" strokeLinecap="round" opacity="0.76" />
      <path d="M6 33H34" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 19.5V32.4" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.74" />
      <path d="M16.2 24.3H23.8" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.74" />
    </>
  )
}

function GrowthRingGlyph() {
  return (
    <>
      <path d="M20 34C27.7 34 34 27.7 34 20C34 12.3 27.7 6 20 6C12.3 6 6 12.3 6 20C6 27.7 12.3 34 20 34Z" stroke={stroke} strokeWidth="1.5" />
      <path d="M20 29.5C25.2 29.5 29.5 25.2 29.5 20C29.5 14.8 25.2 10.5 20 10.5C14.8 10.5 10.5 14.8 10.5 20C10.5 25.2 14.8 29.5 20 29.5Z" stroke={stroke} strokeWidth="1.2" opacity="0.75" />
      <path d="M20 24.8C22.7 24.8 24.8 22.7 24.8 20C24.8 17.3 22.7 15.2 20 15.2C17.3 15.2 15.2 17.3 15.2 20C15.2 22.7 17.3 24.8 20 24.8Z" stroke={stroke} strokeWidth="1.2" opacity="0.68" />
      <path d="M15.6 7.3C17.4 11.2 19.6 14 23.8 16.7" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
      <path d="M9.4 25.8C13.2 23.8 16.5 23.5 20.9 24.9" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
    </>
  )
}

function BrainTreeGlyph() {
  return (
    <>
      <path d="M20 32V19" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 19C15.4 19.2 11.6 17.6 10 14.5C8.3 11.2 10.8 7.7 14.8 8.4C16 5.9 20.1 5.4 22 7.7C24.6 5.9 28.4 7.8 28.1 11.2C31.5 12.7 31.4 17.3 28.2 19C25.9 20.2 23 20.1 20 19Z" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 24C17 25.9 14 28.4 10.4 32" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.74" />
      <path d="M20 24C23 25.9 26.2 28.5 29.8 32" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.74" />
      <path d="M14.4 13.8C16.8 13.5 18.9 14.3 20.3 16.5" stroke={stroke} strokeWidth="1.05" strokeLinecap="round" opacity="0.66" />
      <path d="M24.8 12.1C23.1 13.2 22.1 14.7 21.9 16.8" stroke={stroke} strokeWidth="1.05" strokeLinecap="round" opacity="0.66" />
    </>
  )
}
