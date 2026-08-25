'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from './SystemNote.module.css'

interface NoteDto { id:string; content:string; version:number; updatedAt:string; schemaVersion:'public.note.v1' }
const NOTE_URL = 'https://api.thongphan.com/v1/public/notes/homepage-demo'

async function requestNote(): Promise<NoteDto> {
  const response = await fetch(NOTE_URL, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const body = (await response.json()) as { data?: NoteDto }
  if (!response.ok || !body.data) throw new Error('note_unavailable')
  return body.data
}

export default function SystemNote() {
  const [note,setNote]=useState<NoteDto|null>(null)
  const [error,setError]=useState(false)
  const load = useCallback(async () => {
    setError(false)
    try {
      setNote(await requestNote())
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void requestNote()
      .then((data) => {
        if (!cancelled) setNote(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])
  return <main className={styles.shell}><div className={styles.frame}>
    <header className={styles.header}><div><p className={styles.eyebrow}>API Gateway / D1 proof</p><h1>System note</h1></div><p className={styles.status}><span aria-hidden="true"/>Dữ liệu đang được đọc qua API Gateway</p></header>
    <section className={styles.note} aria-live="polite">
      <div className={styles.content}>{error?<p className={styles.error}>Không thể đọc note.</p>:<p>{note?.content??'Đang đọc dữ liệu…'}</p>}</div>
      <aside className={styles.meta}><p className={styles.eyebrow}>Live contract</p><dl><dt>Source</dt><dd>api.thongphan.com</dd><dt>Canonical ID</dt><dd>{note?.id??'—'}</dd><dt>Version</dt><dd>{note?.version??'—'}</dd><dt>Updated</dt><dd>{note?new Date(note.updatedAt).toLocaleString('vi-VN'):'—'}</dd></dl><button type="button" onClick={()=>void load()}>Đọc lại từ API</button></aside>
    </section>
  </div></main>
}
