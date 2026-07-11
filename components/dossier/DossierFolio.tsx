import styles from './Dossier.module.css'

type DossierFolioProps = { index: string; label: string; children: React.ReactNode; className?: string; tone?: 'paper' | 'dark' }

export function DossierFolio({ index, label, children, className = '', tone = 'paper' }: DossierFolioProps) {
  return (
    <section className={`${styles.section} ${className}`} data-tone={tone}>
      <div className={styles.sectionLabel}><span>{index}</span>{label}</div>
      {children}
    </section>
  )
}
