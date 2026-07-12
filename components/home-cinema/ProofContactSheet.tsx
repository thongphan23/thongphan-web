'use client'

import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { HomepageProofPublicAsset } from '@/lib/homepage-proof-assets'
import { resolveMenuKeyAction } from '@/components/site-chrome/mobile-menu-focus'
import HomeTrackedLink from './HomeTrackedLink'
import { homepageEvents } from './homepage-events'
import ProofImage from './ProofImage'
import styles from './HomeCinema.module.css'

export default function ProofContactSheet({ assets }: { assets: HomepageProofPublicAsset[] }) {
  const [selected, setSelected] = useState<HomepageProofPublicAsset | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const closeDialog = () => setSelected(null)

  useEffect(() => {
    if (!selected) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [selected])

  useEffect(() => {
    sheetRef.current?.setAttribute('data-interactive', 'true')
  }, [])

  const scrollSheet = (direction: -1 | 1) => {
    const sheet = sheetRef.current
    if (!sheet) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sheet.scrollBy({ left: direction * Math.min(sheet.clientWidth * 0.92, 900), behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])
    const action = resolveMenuKeyAction({
      key: event.key,
      shiftKey: event.shiftKey,
      activeIndex: focusable.indexOf(document.activeElement as HTMLElement),
      itemCount: focusable.length,
    })
    if (action === 'none') return
    event.preventDefault()
    if (action === 'close') closeDialog()
    if (action === 'focus-first') focusable[0]?.focus()
    if (action === 'focus-last') focusable.at(-1)?.focus()
  }

  return (
    <>
      <div className={styles.proofSheetShell}>
        <div className={styles.proofGrid} ref={sheetRef} aria-label="Ba bằng chứng có thể mở để xem chi tiết" data-interactive="false">
          {assets.map((asset, index) => (
            <button
              key={asset.id}
              type="button"
              className={styles.proofCard}
              onClick={(event) => {
                triggerRef.current = event.currentTarget
                setSelected(asset)
              }}
              aria-label={`Mở bằng chứng: ${asset.caption}`}
              data-motion-surface
            >
              <span className={styles.proofFrameTop} aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span><span>TP · ARCHIVE</span></span>
              <ProofImage
                src={asset.derivativeUrl}
                alt={asset.alt}
                sizes="(max-width: 767px) 86vw, (max-width: 1100px) 46vw, 30vw"
                focalPoint={asset.focalPoint}
              />
              <span className={styles.proofCardCopy}>
                <small>DẤU VẾT {String(index + 1).padStart(2, '0')}</small>
                <strong>{asset.caption}</strong>
                <span>Xem hồ sơ bằng chứng</span>
              </span>
            </button>
          ))}
        </div>
        <div className={styles.proofControls} aria-label="Điều khiển dải bằng chứng">
          <button type="button" onClick={() => scrollSheet(-1)} aria-label="Xem bằng chứng trước"><ArrowLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => scrollSheet(1)} aria-label="Xem bằng chứng tiếp theo"><ArrowRight aria-hidden="true" /></button>
        </div>
      </div>

      {selected ? (
        <div className={styles.proofDialogBackdrop} onMouseDown={closeDialog}>
          <div
            className={styles.proofDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="proof-dialog-title"
            ref={dialogRef}
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={handleDialogKeyDown}
          >
            <button ref={closeRef} type="button" className={styles.proofDialogClose} onClick={closeDialog} aria-label="Đóng hồ sơ bằng chứng"><X aria-hidden="true" /></button>
            <div className={styles.proofDialogImage}>
              <ProofImage src={selected.derivativeUrl} alt={selected.alt} sizes="(max-width: 767px) 100vw, 58vw" focalPoint={selected.focalPoint} />
            </div>
            <div className={styles.proofDialogCopy}>
              <p>TP · EVIDENCE ARCHIVE</p>
              <h3 id="proof-dialog-title">{selected.caption}</h3>
              <strong>{selected.proof}</strong>
              <small>{selected.provenance}</small>
              <HomeTrackedLink href={selected.href} eventName={homepageEvents.proof} eventDetail={{ slug: selected.id }} data-motion-action>
                Đi sâu vào dấu vết này
              </HomeTrackedLink>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
