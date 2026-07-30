'use client'

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileCheck2,
  Film,
  GitBranch,
  LogOut,
  RefreshCw,
  Scale,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import styles from './page.module.css'

type Ranking = {
  rank: number
  candidate_id: string
  gate_status: 'pass' | 'fail'
  hard_gate_failures: string[]
  computed_scores: Record<string, number>
}

type Snapshot = {
  schema_version: string
  generated_at: string
  summary: {
    run_count: number
    visual_claim_count: number
    visual_candidate_count: number
    visual_decision_count: number
    blocked_claim_count: number
    taste_evidence_count: number
    open_risk_count: number
  }
  runs: Array<{
    run_id: string
    production_profile: string
    state: string
    visual_selection_status: string
    updated_at: string
  }>
  decisions: Array<{
    run_id: string
    decision_id: string
    claim_id: string
    beat_id: string
    voice_text_vi: string
    intended_feeling_vi: string
    intended_memory_vi: string
    selection_status: 'selected' | 'blocked'
    selected_candidate_id: string | null
    confidence: { raw_score?: number; calibration_status?: string }
    ranking: Ranking[]
  }>
  taste_evidence: Array<Record<string, unknown>>
  risks: Array<Record<string, unknown>>
  evidence: Array<{
    run_id: string
    artifact: string
    sha256: string
    bytes: number
    updated_at: string
  }>
  graph: {
    entity_type_counts: Record<string, number>
    edge_type_counts: Record<string, number>
  }
}

type TabId = 'overview' | 'runs' | 'decisions' | 'graph' | 'taste' | 'risks' | 'evidence'

const tabs: Array<{ id: TabId; label: string; icon: typeof Activity }> = [
  { id: 'overview', label: 'Tổng quan', icon: Activity },
  { id: 'runs', label: 'Runs', icon: Film },
  { id: 'decisions', label: 'Quyết định hình ảnh', icon: Scale },
  { id: 'graph', label: 'Model & Graph', icon: GitBranch },
  { id: 'taste', label: 'Bằng chứng Taste', icon: BrainCircuit },
  { id: 'risks', label: 'Rủi ro', icon: AlertTriangle },
  { id: 'evidence', label: 'Artifacts', icon: FileCheck2 },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))
}

function formatScore(value: number | undefined) {
  return typeof value === 'number' ? value.toFixed(2) : '—'
}

function humanizeCode(value: unknown) {
  return String(value || '').replaceAll('_', ' ')
}

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <span className={ok ? styles.statusPass : styles.statusFail}>{children}</span>
}

export default function TprDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [tab, setTab] = useState<TabId>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSnapshot = useCallback(async () => {
    try {
      const response = await fetch('/tpr/api/snapshot', { cache: 'no-store' })
      if (response.status === 401) {
        window.location.reload()
        return
      }
      if (!response.ok) throw new Error(`SNAPSHOT_${response.status}`)
      setSnapshot((await response.json()) as Snapshot)
      setError('')
    } catch {
      setError('Không thể đồng bộ snapshot vận hành.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initial = window.setTimeout(() => void loadSnapshot(), 0)
    const timer = setInterval(loadSnapshot, 30_000)
    return () => {
      window.clearTimeout(initial)
      clearInterval(timer)
    }
  }, [loadSnapshot])

  const logout = async () => {
    await fetch('/tpr/api/access', { method: 'DELETE' })
    window.location.reload()
  }

  const graphTotal = useMemo(
    () => Object.values(snapshot?.graph.entity_type_counts ?? {}).reduce((sum, value) => sum + value, 0),
    [snapshot],
  )

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.identity}>
          <span className={styles.mark}><Film aria-hidden="true" size={18} /></span>
          <div><strong>TPR Control Room</strong><small>Thông Phan Remotion</small></div>
        </div>
        <div className={styles.topActions}>
          <span className={styles.syncState}>
            <span className={error ? styles.signalError : styles.signalOk} />
            {error || (loading ? 'Đang đồng bộ' : 'Đã đồng bộ')}
          </span>
          <button className={styles.iconButton} onClick={() => void loadSnapshot()} title="Đồng bộ lại" aria-label="Đồng bộ lại">
            <RefreshCw size={17} aria-hidden="true" />
          </button>
          <button className={styles.iconButton} onClick={() => void logout()} title="Đăng xuất" aria-label="Đăng xuất">
            <LogOut size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        <nav className={styles.sidebar} aria-label="Khu vực quản trị">
          {tabs.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={tab === item.id ? styles.navActive : styles.navButton}
                onClick={() => setTab(item.id)}
              >
                <Icon size={16} aria-hidden="true" /><span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <section className={styles.content} aria-live="polite">
          {!snapshot && loading ? <div className={styles.empty}>Đang tải dữ liệu vận hành…</div> : null}
          {!snapshot && error ? <div className={styles.errorPanel}>{error}</div> : null}
          {snapshot ? (
            <>
              {tab === 'overview' ? <Overview snapshot={snapshot} graphTotal={graphTotal} /> : null}
              {tab === 'runs' ? <Runs snapshot={snapshot} /> : null}
              {tab === 'decisions' ? <Decisions snapshot={snapshot} /> : null}
              {tab === 'graph' ? <Graph snapshot={snapshot} /> : null}
              {tab === 'taste' ? <Taste snapshot={snapshot} /> : null}
              {tab === 'risks' ? <Risks snapshot={snapshot} /> : null}
              {tab === 'evidence' ? <Evidence snapshot={snapshot} /> : null}
            </>
          ) : null}
        </section>
      </div>
    </main>
  )
}

function SectionHeader({ title, meta }: { title: string; meta: string }) {
  return <div className={styles.sectionHeader}><div><h1>{title}</h1><p>{meta}</p></div></div>
}

function Overview({ snapshot, graphTotal }: { snapshot: Snapshot; graphTotal: number }) {
  const openRisks = snapshot.risks.filter((risk) => String(risk.status) === 'open')
  const visualGate = snapshot.summary.visual_decision_count === 0
    ? 'NOT EVALUATED'
    : snapshot.summary.blocked_claim_count === 0 ? 'PASS' : 'BLOCKED'
  const metrics = [
    ['Runs', snapshot.summary.run_count],
    ['Claims', snapshot.summary.visual_claim_count],
    ['Candidates', snapshot.summary.visual_candidate_count],
    ['Decisions', snapshot.summary.visual_decision_count],
    ['Graph entities', graphTotal],
    ['Taste evidence', snapshot.summary.taste_evidence_count],
  ]
  return <>
    <SectionHeader title="Tổng quan hệ thống" meta={`Snapshot ${formatDate(snapshot.generated_at)}`} />
    <div className={styles.healthBand}>
      <div><span>Visual gate</span><strong>{visualGate}</strong></div>
      <div><span>Rủi ro mở</span><strong>{snapshot.summary.open_risk_count}</strong></div>
      <div><span>Phiên bản snapshot</span><strong>v{snapshot.schema_version}</strong></div>
    </div>
    <div className={styles.metrics}>{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className={styles.split}>
      <section className={styles.panel}><h2>Quyết định gần nhất</h2>{snapshot.decisions.slice(0, 5).map((item) => <div className={styles.compactRow} key={item.decision_id}><div><strong>{item.voice_text_vi || item.claim_id}</strong><small>{item.run_id} · {item.selected_candidate_id || 'Chưa chọn'}</small></div><Status ok={item.selection_status === 'selected'}>{item.selection_status}</Status></div>)}</section>
      <section className={styles.panel}><h2>Rủi ro cần xử lý</h2>{openRisks.length ? openRisks.slice(0, 6).map((risk, index) => <div className={styles.compactRow} key={`${String(risk.code)}-${index}`}><div><strong>{humanizeCode(risk.code)}</strong><small>{String(risk.message_vi || '')}</small></div><Status ok={false}>{String(risk.severity)}</Status></div>) : <div className={styles.emptyInline}><CheckCircle2 size={18} /> Không có rủi ro mở.</div>}</section>
    </div>
  </>
}

function Runs({ snapshot }: { snapshot: Snapshot }) {
  return <><SectionHeader title="Production runs" meta={`${snapshot.runs.length} run trong snapshot hiện tại`} /><div className={styles.tableWrap}><table><thead><tr><th>Run</th><th>Profile</th><th>State</th><th>Visual graph</th><th>Cập nhật</th></tr></thead><tbody>{snapshot.runs.map((run) => <tr key={run.run_id}><td><strong>{run.run_id}</strong></td><td>{run.production_profile}</td><td>{run.state}</td><td><Status ok={run.visual_selection_status === 'sealed'}>{run.visual_selection_status}</Status></td><td>{formatDate(run.updated_at)}</td></tr>)}</tbody></table></div></>
}

function Decisions({ snapshot }: { snapshot: Snapshot }) {
  return <><SectionHeader title="Quyết định hình ảnh" meta="Đúng nghĩa và dễ hiểu là hard gate; Taste chỉ xếp hạng sau đó." />{snapshot.decisions.map((decision) => <article className={styles.decision} key={decision.decision_id}><header><div><small>{decision.run_id} · {decision.beat_id}</small><h2>{decision.voice_text_vi || decision.claim_id}</h2></div><Status ok={decision.selection_status === 'selected'}>{decision.selection_status}</Status></header><div className={styles.intentGrid}><p><span>Cần cảm thấy</span>{decision.intended_feeling_vi || '—'}</p><p><span>Cần nhớ</span>{decision.intended_memory_vi || '—'}</p><p><span>Phương án chọn</span>{decision.selected_candidate_id || 'Không có'}</p><p><span>Confidence thô</span>{formatScore(decision.confidence.raw_score)} · {decision.confidence.calibration_status || '—'}</p></div><div className={styles.tableWrap}><table><thead><tr><th>Hạng</th><th>Candidate</th><th>Gate</th><th>Đúng nghĩa</th><th>Dễ hiểu</th><th>Taste</th><th>Lý do loại</th></tr></thead><tbody>{decision.ranking.map((rank) => <tr key={rank.candidate_id}><td>{rank.rank}</td><td><strong>{rank.candidate_id}</strong></td><td><Status ok={rank.gate_status === 'pass'}>{rank.gate_status}</Status></td><td>{formatScore(rank.computed_scores.semantic_match)}</td><td>{formatScore(rank.computed_scores.immediate_comprehension)}</td><td>{formatScore(rank.computed_scores.taste_effect)}</td><td className={styles.reason}>{rank.hard_gate_failures.join(', ') || '—'}</td></tr>)}</tbody></table></div></article>)}</>
}

function Graph({ snapshot }: { snapshot: Snapshot }) {
  return <><SectionHeader title="Model & Graph" meta="Projection từ entity và lineage edge bất biến." /><div className={styles.split}><CountList title="Model entities" icon={Database} values={snapshot.graph.entity_type_counts} /><CountList title="Graph relations" icon={GitBranch} values={snapshot.graph.edge_type_counts} /></div></>
}

function CountList({ title, icon: Icon, values }: { title: string; icon: typeof Database; values: Record<string, number> }) {
  return <section className={styles.panel}><h2><Icon size={17} />{title}</h2>{Object.entries(values).length ? Object.entries(values).map(([key, value]) => <div className={styles.countRow} key={key}><code>{key}</code><strong>{value}</strong></div>) : <div className={styles.emptyInline}>Chưa có dữ liệu.</div>}</section>
}

function Taste({ snapshot }: { snapshot: Snapshot }) {
  return <><SectionHeader title="Bằng chứng Taste" meta="Feedback exact winner/loser; chưa tự động trở thành luật toàn cục." /><div className={styles.feed}>{snapshot.taste_evidence.map((item, index) => <article key={String(item.preference_event_id || index)}><header><strong>{String(item.claim_id || 'Không rõ claim')}</strong><Status ok={String(item.promotion_status) === 'promoted'}>{String(item.promotion_status || 'evidence_only')}</Status></header><blockquote>{String(item.owner_comment_vi || '')}</blockquote><div><span>Thắng: <b>{String(item.winner_candidate_id || '')}</b></span><span>Thua: <b>{String(item.loser_candidate_id || '')}</b></span></div></article>)}</div></>
}

function Risks({ snapshot }: { snapshot: Snapshot }) {
  return <><SectionHeader title="Rủi ro" meta={`${snapshot.summary.open_risk_count} rủi ro đang mở · ${snapshot.risks.length} mục đang theo dõi`} />{snapshot.risks.length ? <div className={styles.riskList}>{snapshot.risks.map((risk, index) => <article key={`${String(risk.code)}-${index}`}><AlertTriangle size={18} /><div><header><strong>{humanizeCode(risk.code)}</strong><Status ok={String(risk.status) !== 'open'}>{String(risk.status) === 'open' ? 'open' : 'theo dõi'}</Status></header><p>{String(risk.message_vi || '')}</p><small>{String(risk.run_id || risk.risk_id || 'SYSTEM')} · {String(risk.severity)}</small></div></article>)}</div> : <div className={styles.empty}><CheckCircle2 size={22} />Không có rủi ro mở trong snapshot.</div>}</>
}

function Evidence({ snapshot }: { snapshot: Snapshot }) {
  return <><SectionHeader title="Artifacts & checksums" meta={`${snapshot.evidence.length} artifact có thể truy vết`} /><div className={styles.tableWrap}><table><thead><tr><th>Run</th><th>Artifact</th><th>SHA-256</th><th>Dung lượng</th><th>Cập nhật</th></tr></thead><tbody>{snapshot.evidence.map((item) => <tr key={`${item.run_id}-${item.artifact}`}><td>{item.run_id}</td><td><strong>{item.artifact}</strong></td><td><code>{item.sha256.slice(0, 20)}…</code></td><td>{new Intl.NumberFormat('vi-VN').format(item.bytes)} B</td><td>{formatDate(item.updated_at)}</td></tr>)}</tbody></table></div></>
}
