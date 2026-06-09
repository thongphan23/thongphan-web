import { BrandGlyph } from './BrandGlyph'
import styles from './GardenSignature.module.css'

type GardenSignatureProps = {
  variant?: 'tree' | 'gate' | 'seed' | 'fruit'
  eyebrow?: string
  title?: string
  compact?: boolean
}

const variantGlyph = {
  tree: 'brainTree',
  gate: 'gate',
  seed: 'seed',
  fruit: 'fruit',
} as const

export function GardenSignature({
  variant = 'tree',
  eyebrow = 'Living Knowledge Garden',
  title = 'Tri thức sống, có rễ, có tán, có quả.',
  compact = false,
}: GardenSignatureProps) {
  return (
    <aside className={`${styles.signature} ${styles[variant]} ${compact ? styles.compact : ''}`} aria-label={eyebrow}>
      <div className={styles.orbit} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.glyphShell}>
        <BrandGlyph name={variantGlyph[variant]} className={styles.glyph} />
      </div>
      <div className={styles.copy}>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
      </div>
    </aside>
  )
}
