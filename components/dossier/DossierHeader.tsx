import styles from './Dossier.module.css'

type DossierHeaderProps = {
  eyebrow: string
  title: string
  description: string
  folio?: string
  tone?: 'paper' | 'dark'
  children?: React.ReactNode
}

export function DossierHeader({ eyebrow, title, description, folio = 'TP / DOSSIER', tone = 'paper', children }: DossierHeaderProps) {
  return (
    <header className={styles.header} data-tone={tone}>
      <div className={styles.folio}>{folio}</div>
      <div className={styles.headerCopy}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </header>
  )
}
