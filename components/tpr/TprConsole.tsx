'use client'

import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  BookOpenText,
  ChevronRight,
  CircleGauge,
  Clock3,
  Database,
  ExternalLink,
  Film,
  GitBranch,
  KeyRound,
  Library,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  Network,
  Play,
  RefreshCw,
  Search,
  ServerCog,
  Sparkles,
  TriangleAlert,
  UploadCloud,
  X,
} from 'lucide-react'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import type {
  TprArtifactRecord,
  TprDashboardSnapshot,
  TprFeedbackInput,
  TprGraphNodeRecord,
  TprRunRecord,
  TprVideoRecord,
} from '@/lib/tpr/contracts'
import styles from './tpr-console.module.css'

type View = 'overview' | 'runs' | 'videos' | 'sources' | 'documents' | 'graph' | 'taste' | 'codex' | 'system'

const navigation: Array<{ id: View; label: string; icon: typeof Activity }> = [
  { id: 'overview', label: 'Tổng quan', icon: CircleGauge },
  { id: 'runs', label: 'Runs', icon: Activity },
  { id: 'videos', label: 'Video', icon: Film },
  { id: 'sources', label: 'Nguồn phim', icon: Library },
  { id: 'documents', label: 'Tài liệu', icon: BookOpenText },
  { id: 'graph', label: 'Model & graph', icon: Network },
  { id: 'taste', label: 'Taste & phản hồi', icon: Sparkles },
  { id: 'codex', label: 'Codex', icon: MessageSquareText },
  { id: 'system', label: 'Hệ thống', icon: ServerCog },
]

const fmtNumber = new Intl.NumberFormat('vi-VN')
const fmtDate = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' })

function formatDate(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Chưa có'
  return fmtDate.format(new Date(value))
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return '—'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function formatLag(seconds: number | null) {
  if (seconds === null) return 'Chưa đồng bộ'
  if (seconds < 60) return `${seconds} giây`
  if (seconds < 3600) return `${Math.round(seconds / 60)} phút`
  return `${Math.round(seconds / 3600)} giờ`
}

function Status({ value }: { value: string }) {
  const tone = ['complete', 'published', 'approved', 'verified', 'active', 'promoted', 'ready'].includes(value)
    ? styles.statusGood
    : ['blocked', 'failed', 'rejected', 'unavailable'].includes(value)
      ? styles.statusBad
      : styles.statusPending
  return <span className={tone}>{value.replaceAll('_', ' ')}</span>
}

function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className={styles.empty}>
      <Archive aria-hidden="true" />
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  )
}

function Metric({ label, value, detail, tone = 'neutral' }: { label: string; value: string; detail: string; tone?: 'neutral' | 'warn' | 'good' }) {
  return (
    <div className={`${styles.metric} ${styles[`metric_${tone}`]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  )
}

function Login({ onGranted }: { onGranted: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/tpr/session', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
      })
      if (!response.ok) throw new Error(response.status === 429 ? 'Đã thử quá nhiều lần. Vui lòng chờ 15 phút.' : 'Mã truy cập không đúng.')
      onGranted()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể đăng nhập.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className={styles.login} aria-labelledby="login-title">
      <div className={styles.loginMark}><LockKeyhole aria-hidden="true" /></div>
      <p className={styles.kicker}>TPR · OWNER CONTROL PLANE</p>
      <h1 id="login-title">Bảng điều hành video và bằng chứng.</h1>
      <p>Trang riêng để theo dõi run, nguồn phim, quyết định, graph, phản hồi và thay đổi Taste.</p>
      <form onSubmit={submit}>
        <label htmlFor="tpr-access-code">Mã truy cập chủ sở hữu</label>
        <div className={styles.loginInput}>
          <KeyRound aria-hidden="true" />
          <input id="tpr-access-code" type="password" autoComplete="current-password" value={code} onChange={(event) => setCode(event.target.value)} required />
        </div>
        <button type="submit" disabled={pending || code.length < 8}>
          {pending ? <LoaderCircle className={styles.spin} aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
          Mở bảng điều hành
        </button>
        {error && <p className={styles.formError} role="alert">{error}</p>}
      </form>
    </section>
  )
}

export default function TprConsole() {
  const [authState, setAuthState] = useState<'checking' | 'guest' | 'owner'>('checking')
  const [snapshot, setSnapshot] = useState<TprDashboardSnapshot | null>(null)
  const [error, setError] = useState('')
  const [view, setView] = useState<View>('overview')
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    setRefreshing(true)
    setError('')
    try {
      const response = await fetch('/api/tpr/dashboard', { credentials: 'include', cache: 'no-store' })
      if (response.status === 401) { setAuthState('guest'); setSnapshot(null); return }
      if (!response.ok) throw new Error('Control plane tạm thời không phản hồi.')
      setSnapshot(await response.json() as TprDashboardSnapshot)
      setAuthState('owner')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tải dữ liệu.')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function logout() {
    await fetch('/api/tpr/session', { method: 'DELETE', credentials: 'include' })
    setAuthState('guest')
    setSnapshot(null)
  }

  if (authState === 'checking') return <div className={styles.boot}><LoaderCircle className={styles.spin} /><span>Đang xác minh phiên TPR…</span></div>
  if (authState === 'guest') return <Login onGranted={() => { setAuthState('owner'); void load() }} />

  const activeLabel = navigation.find((item) => item.id === view)?.label ?? 'Tổng quan'

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.identity}>
          <span className={styles.logo}><Film aria-hidden="true" /></span>
          <div><strong>TPR</strong><small>Operations Console</small></div>
        </div>
        <nav aria-label="Khu vực quản trị TPR">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id} type="button" className={view === item.id ? styles.navActive : styles.navItem} onClick={() => setView(item.id)}>
                <Icon aria-hidden="true" /><span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className={styles.sidebarFoot}>
          <span><span className={styles.onlineDot} /> Owner session</span>
          <button type="button" onClick={logout} title="Đăng xuất"><LogOut aria-hidden="true" /></button>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.kicker}>THONG PHAN REMOTION</span>
            <h1>{activeLabel}</h1>
          </div>
          <div className={styles.topActions}>
            <label className={styles.search}>
              <Search aria-hidden="true" />
              <span className="sr-only">Tìm trong mục hiện tại</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm run, phim, tài liệu…" />
              {query && <button type="button" onClick={() => setQuery('')} title="Xóa tìm kiếm"><X aria-hidden="true" /></button>}
            </label>
            <button className={styles.iconButton} type="button" onClick={() => void load()} title="Làm mới" disabled={refreshing}>
              <RefreshCw className={refreshing ? styles.spin : ''} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className={styles.mobileNav}>
          {navigation.map((item) => (
            <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>
          ))}
        </div>

        {error && <div className={styles.alert} role="alert"><TriangleAlert aria-hidden="true" /><span>{error}</span><button onClick={() => void load()}>Thử lại</button></div>}
        {!snapshot && !error && <div className={styles.boot}><LoaderCircle className={styles.spin} /><span>Đang nạp dữ liệu vận hành…</span></div>}
        {snapshot && <ConsoleView view={view} snapshot={snapshot} query={query} reload={load} />}
      </div>
    </div>
  )
}

function ConsoleView({ view, snapshot, query, reload }: { view: View; snapshot: TprDashboardSnapshot; query: string; reload: () => Promise<void> }) {
  switch (view) {
    case 'overview': return <Overview snapshot={snapshot} />
    case 'runs': return <Runs runs={snapshot.runs} query={query} />
    case 'videos': return <Videos videos={snapshot.videos} query={query} />
    case 'sources': return <Sources snapshot={snapshot} query={query} />
    case 'documents': return <Documents artifacts={snapshot.artifacts} query={query} />
    case 'graph': return <Graph snapshot={snapshot} query={query} />
    case 'taste': return <Taste snapshot={snapshot} reload={reload} />
    case 'codex': return <Codex snapshot={snapshot} query={query} />
    case 'system': return <System snapshot={snapshot} />
  }
}

function Overview({ snapshot }: { snapshot: TprDashboardSnapshot }) {
  const { metrics } = snapshot
  const warnings = [
    metrics.reuse_rate !== null && metrics.reuse_rate < 0.7 ? 'Tỷ lệ tái sử dụng thấp hơn ngưỡng 70%.' : null,
    metrics.sync_lag_seconds !== null && metrics.sync_lag_seconds > 600 ? 'Đồng bộ local chậm hơn 10 phút.' : null,
    snapshot.capacity.object_storage === 'unavailable' ? 'Object storage chưa bật; hệ thống đang ở chế độ metadata-only.' : null,
    metrics.blocked_runs > 0 ? `${metrics.blocked_runs} run đang bị chặn.` : null,
  ].filter(Boolean) as string[]

  return (
    <div className={styles.content}>
      <section className={styles.metricGrid} aria-label="Chỉ số vận hành">
        <Metric label="Runs hôm nay" value={fmtNumber.format(metrics.runs_today)} detail={`${metrics.active_runs} đang hoạt động`} />
        <Metric label="Video đã xuất bản" value={fmtNumber.format(metrics.published_videos)} detail={`${snapshot.videos.length} video gần nhất`} tone="good" />
        <Metric label="Tái sử dụng" value={metrics.reuse_rate === null ? 'Chưa đo' : `${Math.round(metrics.reuse_rate * 100)}%`} detail="Mục tiêu tối thiểu 70%" tone={metrics.reuse_rate !== null && metrics.reuse_rate < 0.7 ? 'warn' : 'good'} />
        <Metric label="Độ trễ đồng bộ" value={formatLag(metrics.sync_lag_seconds)} detail={`Cập nhật ${formatDate(snapshot.generated_at)}`} tone={metrics.sync_lag_seconds !== null && metrics.sync_lag_seconds > 600 ? 'warn' : 'neutral'} />
      </section>

      {warnings.length > 0 && (
        <section className={styles.warningBand} aria-labelledby="warning-title">
          <header><AlertTriangle aria-hidden="true" /><h2 id="warning-title">Cần chú ý</h2></header>
          <ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </section>
      )}

      <div className={styles.twoColumn}>
        <section className={styles.section}>
          <header className={styles.sectionHeader}><div><span>LIVE PIPELINE</span><h2>Run gần nhất</h2></div><Activity aria-hidden="true" /></header>
          {snapshot.runs.length ? <RunRows runs={snapshot.runs.slice(0, 6)} /> : <Empty title="Chưa có run" detail="Bộ đồng bộ sẽ đưa run đầu tiên vào đây." />}
        </section>
        <section className={styles.section}>
          <header className={styles.sectionHeader}><div><span>COST CONTROL</span><h2>Nút thắt tài nguyên</h2></div><BarChart3 aria-hidden="true" /></header>
          <ol className={styles.hotspots}>
            <li><strong>01</strong><div><b>Source + observation</b><span>Vault-first, chỉ quan sát hash/trim/version mới.</span></div></li>
            <li><strong>02</strong><div><b>LLM/VLM reasoning</b><span>Chấm top-K sau lọc rẻ, cache theo fingerprint.</span></div></li>
            <li><strong>03</strong><div><b>Render + encode</b><span>Proxy 720p trước, 1080p chỉ cho bản thắng.</span></div></li>
            <li><strong>04</strong><div><b>Transfer + evidence</b><span>Manifest diff, content hash, không sync raw Codex.</span></div></li>
          </ol>
        </section>
      </div>

      <section className={styles.section}>
        <header className={styles.sectionHeader}><div><span>ACTIVITY</span><h2>Dòng thay đổi</h2></div><Clock3 aria-hidden="true" /></header>
        <ActivityRows events={snapshot.events.slice(0, 10)} />
      </section>
    </div>
  )
}

function Runs({ runs, query }: { runs: TprRunRecord[]; query: string }) {
  const filtered = runs.filter((run) => `${run.title} ${run.run_id} ${run.phase} ${run.status}`.toLowerCase().includes(query.toLowerCase()))
  return <div className={styles.content}><section className={styles.section}><header className={styles.sectionHeader}><div><span>PIPELINE LEDGER</span><h2>Tất cả run</h2></div><span>{filtered.length} bản ghi</span></header>{filtered.length ? <RunRows runs={filtered} detailed /> : <Empty title="Không tìm thấy run" detail="Thử một từ khóa hoặc mã run khác." />}</section></div>
}

function RunRows({ runs, detailed = false }: { runs: TprRunRecord[]; detailed?: boolean }) {
  return (
    <div className={styles.tableWrap}>
      <table><thead><tr><th>Run</th><th>Trạng thái</th><th>Phase</th>{detailed && <th>Evidence</th>}<th>Tiến độ</th><th>Cập nhật</th></tr></thead>
        <tbody>{runs.map((run) => <tr key={run.run_id}><td><strong>{run.title}</strong><small>{run.run_id}</small></td><td><Status value={run.status} /></td><td>{run.phase}</td>{detailed && <td><Status value={run.evidence_status} /></td>}<td><div className={styles.progress}><span style={{ width: `${run.progress_percent}%` }} /></div><small>{run.progress_percent}% · {formatDuration(run.duration_seconds)}</small></td><td>{formatDate(run.updated_at)}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

function Videos({ videos, query }: { videos: TprVideoRecord[]; query: string }) {
  const filtered = videos.filter((video) => `${video.title} ${video.variant_id} ${video.filename}`.toLowerCase().includes(query.toLowerCase()))
  const [activeId, setActiveId] = useState(filtered[0]?.video_id ?? '')
  const active = filtered.find((video) => video.video_id === activeId) ?? filtered[0]
  return (
    <div className={styles.content}>
      {active ? <section className={styles.videoStage}>
        <div className={styles.playerFrame}>{active.public_url ? <video key={active.video_id} controls playsInline preload="metadata" poster={active.poster_url ?? undefined}><source src={active.public_url} type="video/mp4" /></video> : <div className={styles.videoUnavailable}><Film /><span>Video chỉ có ở local/object storage</span></div>}</div>
        <div className={styles.videoMeta}><span>ĐANG XEM · {active.variant_id}</span><h2>{active.title}</h2><p>{formatDuration(active.duration_seconds)} · {active.width ?? '—'}×{active.height ?? '—'} · <Status value={active.status} /></p>{active.public_url && <a href={active.public_url} target="_blank" rel="noreferrer"><ExternalLink /> Mở file gốc</a>}</div>
      </section> : <Empty title="Chưa có video" detail="Video hoàn thiện và proxy sẽ xuất hiện sau lần đồng bộ kế tiếp." />}
      {filtered.length > 0 && <section className={styles.section}><header className={styles.sectionHeader}><div><span>VIDEO LIBRARY</span><h2>Các bản dựng</h2></div><span>{filtered.length} video</span></header><div className={styles.videoList}>{filtered.map((video) => <button key={video.video_id} type="button" className={video.video_id === active?.video_id ? styles.videoRowActive : styles.videoRow} onClick={() => setActiveId(video.video_id)}><span className={styles.playIcon}><Play /></span><span><strong>{video.title}</strong><small>{video.variant_id} · {video.filename}</small></span><span>{formatDuration(video.duration_seconds)}</span><Status value={video.status} /><ChevronRight /></button>)}</div></section>}
    </div>
  )
}

function Sources({ snapshot, query }: { snapshot: TprDashboardSnapshot; query: string }) {
  const sources = snapshot.sources.filter((item) => `${item.title} ${item.source_type} ${item.status}`.toLowerCase().includes(query.toLowerCase()))
  return <div className={styles.content}><section className={styles.metricGrid}><Metric label="Hồ sơ nguồn" value={fmtNumber.format(snapshot.metrics.source_profiles)} detail="Đã mô hình hóa" /><Metric label="Đã chọn" value={fmtNumber.format(sources.reduce((sum, item) => sum + item.selected_count, 0))} detail="Lượt dùng được lưu" tone="good" /><Metric label="Đã loại" value={fmtNumber.format(sources.reduce((sum, item) => sum + item.rejected_count, 0))} detail="Lý do không bị mất" /><Metric label="Luân phiên" value="5 video" detail="Khoảng cách tối thiểu" /></section><section className={styles.section}><header className={styles.sectionHeader}><div><span>FILM SOURCE VAULT</span><h2>Phim và nguồn đã phân tích</h2></div><Library /></header>{sources.length ? <div className={styles.tableWrap}><table><thead><tr><th>Nguồn</th><th>Phiên bản</th><th>Chọn / loại</th><th>Dùng gần nhất</th><th>Đủ điều kiện lại</th><th>Trạng thái</th></tr></thead><tbody>{sources.map((source) => <tr key={source.source_id}><td><strong>{source.title}</strong><small>{source.source_id} · {source.source_type}</small></td><td>{source.profile_version}</td><td>{source.selected_count} / {source.rejected_count}</td><td>{formatDate(source.last_used_at)}</td><td>{source.next_eligible_ordinal ?? 'Ngay'}</td><td><Status value={source.status} /></td></tr>)}</tbody></table></div> : <Empty title="Chưa có hồ sơ nguồn" detail="Film Source Vault sẽ đồng bộ profile và lịch sử lựa chọn." />}</section></div>
}

function Documents({ artifacts, query }: { artifacts: TprArtifactRecord[]; query: string }) {
  const filtered = artifacts.filter((item) => `${item.title} ${item.artifact_type} ${item.source_ref}`.toLowerCase().includes(query.toLowerCase()))
  const [active, setActive] = useState<TprArtifactRecord | null>(filtered[0] ?? null)
  return <div className={styles.content}><div className={styles.documentLayout}><section className={styles.documentIndex}><header><span>EVIDENCE INDEX</span><strong>{filtered.length} tài liệu</strong></header>{filtered.map((item) => <button key={item.artifact_id} type="button" aria-pressed={active?.artifact_id === item.artifact_id} onClick={() => setActive(item)}><BookOpenText /><span><strong>{item.title}</strong><small>{item.artifact_type} · {(item.byte_size / 1024).toFixed(1)} KB</small></span></button>)}</section><section className={styles.documentViewer}>{active ? <><header><div><span>{active.artifact_type}</span><h2>{active.title}</h2><small>SHA {active.sha256.replace('sha256:', '').slice(0, 16)}… · {formatDate(active.created_at)}</small></div>{active.public_url && <a href={active.public_url} target="_blank" rel="noreferrer" title="Mở tài liệu"><ExternalLink /></a>}</header><pre>{active.content_text || JSON.stringify(active.payload ?? { source_ref: active.source_ref, public_url: active.public_url }, null, 2)}</pre></> : <Empty title="Chọn một tài liệu" detail="Nội dung và lineage sẽ xuất hiện ở đây." />}</section></div></div>
}

function Graph({ snapshot, query }: { snapshot: TprDashboardSnapshot; query: string }) {
  const nodes = snapshot.graph_nodes.filter((node) => `${node.label} ${node.node_type}`.toLowerCase().includes(query.toLowerCase()))
  const nodeMap = new Map(snapshot.graph_nodes.map((node) => [node.node_id, node]))
  const edges = snapshot.graph_edges.filter((edge) => !query || `${edge.edge_type} ${edge.from_ref} ${edge.to_ref}`.toLowerCase().includes(query.toLowerCase()))
  return <div className={styles.content}><section className={styles.metricGrid}><Metric label="Model" value={fmtNumber.format(snapshot.models.length)} detail={`${snapshot.models.filter((item) => item.active).length} active`} /><Metric label="Graph nodes" value={fmtNumber.format(snapshot.graph_nodes.length)} detail={`${new Set(snapshot.graph_nodes.map((item) => item.node_type)).size} loại`} /><Metric label="Graph edges" value={fmtNumber.format(snapshot.graph_edges.length)} detail={`${new Set(snapshot.graph_edges.map((item) => item.edge_type)).size} quan hệ`} /><Metric label="Orphan" value={fmtNumber.format(snapshot.graph_nodes.filter((node) => !snapshot.graph_edges.some((edge) => edge.from_ref === node.node_id || edge.to_ref === node.node_id)).length)} detail="Cần rà soát lineage" /></section><div className={styles.twoColumn}><section className={styles.section}><header className={styles.sectionHeader}><div><span>MODEL REGISTRY</span><h2>Phiên bản model</h2></div><Database /></header><div className={styles.modelList}>{snapshot.models.map((model) => <div key={model.model_id}><span className={styles.modelIcon}><GitBranch /></span><span><strong>{model.title}</strong><small>{model.model_type} · v{model.version}</small></span><Status value={model.active ? 'active' : model.status} /></div>)}</div></section><section className={styles.section}><header className={styles.sectionHeader}><div><span>RELATIONSHIP GRAPH</span><h2>Quan hệ mới nhất</h2></div><Network /></header><div className={styles.edgeList}>{edges.slice(0, 30).map((edge) => <div key={edge.edge_id}><GraphNode node={nodeMap.get(edge.from_ref)} fallback={edge.from_ref} /><span><small>{edge.edge_type}</small><i /></span><GraphNode node={nodeMap.get(edge.to_ref)} fallback={edge.to_ref} /></div>)}</div></section></div><section className={styles.section}><header className={styles.sectionHeader}><div><span>NODE INVENTORY</span><h2>Nút dữ liệu</h2></div><span>{nodes.length} nút</span></header><div className={styles.nodeGrid}>{nodes.slice(0, 80).map((node) => <div key={node.node_id}><span>{node.node_type}</span><strong>{node.label}</strong><small>{node.node_id}</small></div>)}</div></section></div>
}

function GraphNode({ node, fallback }: { node?: TprGraphNodeRecord; fallback: string }) {
  return <div className={styles.graphNode}><span>{node?.node_type ?? 'ref'}</span><strong>{node?.label ?? fallback}</strong></div>
}

function Taste({ snapshot, reload }: { snapshot: TprDashboardSnapshot; reload: () => Promise<void> }) {
  const [videoId, setVideoId] = useState(snapshot.videos[0]?.video_id ?? '')
  const video = snapshot.videos.find((item) => item.video_id === videoId)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState('')
  const [scores, setScores] = useState({ understand: 3, feel: 3, remember: 3, trust: 3 })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!video) return
    setPending(true); setNotice('')
    const form = new FormData(event.currentTarget)
    const input: TprFeedbackInput = {
      run_id: video.run_id, variant_id: video.variant_id,
      timestamp_seconds: form.get('timestamp') ? Number(form.get('timestamp')) : null,
      beat_id: String(form.get('beat') || '') || null,
      shot_id: String(form.get('shot') || '') || null,
      ...scores, comment: message, desired_change: String(form.get('desired_change') || '') || null,
    }
    try {
      const response = await fetch('/api/tpr/feedback', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      if (!response.ok) throw new Error('Không thể ghi phản hồi.')
      setMessage(''); setNotice('Đã lưu bằng chứng và tạo một ứng viên Taste. Chưa tự kích hoạt.')
      await reload()
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Không thể ghi phản hồi.') } finally { setPending(false) }
  }

  return <div className={styles.content}><div className={styles.twoColumn}><section className={styles.feedbackForm}><header><span>OWNER EVIDENCE</span><h2>Ghi phản hồi có tọa độ</h2><p>Mỗi ý kiến gắn đúng video, thời điểm, beat hoặc shot. Nó chỉ là ứng viên Taste cho tới khi outcome được xác minh.</p></header><form onSubmit={submit}><label>Video<select value={videoId} onChange={(event) => setVideoId(event.target.value)}>{snapshot.videos.map((item) => <option key={item.video_id} value={item.video_id}>{item.title} · {item.variant_id}</option>)}</select></label><div className={styles.formGrid}><label>Thời điểm (giây)<input name="timestamp" type="number" min="0" step="0.1" /></label><label>Beat ID<input name="beat" placeholder="B05" /></label><label>Shot ID<input name="shot" placeholder="S21" /></label></div><div className={styles.scoreGrid}>{Object.entries({ understand: 'Hiểu', feel: 'Cảm', remember: 'Nhớ', trust: 'Tin' }).map(([key, label]) => <label key={key}>{label}<select value={scores[key as keyof typeof scores]} onChange={(event) => setScores((current) => ({ ...current, [key]: Number(event.target.value) }))}>{[1,2,3,4,5].map((score) => <option key={score}>{score}</option>)}</select></label>)}</div><label>Phản hồi<textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={3} required placeholder="Điều gì đang tốt hoặc chưa đúng?" /></label><label>Thay đổi mong muốn<textarea name="desired_change" placeholder="Mô tả outcome cần đạt, không chỉ cách sửa." /></label><button type="submit" disabled={pending || !video || message.trim().length < 3}>{pending ? <LoaderCircle className={styles.spin} /> : <MessageSquareText />} Ghi bằng chứng Taste</button>{notice && <p className={styles.formNotice} role="status">{notice}</p>}</form></section><section className={styles.section}><header className={styles.sectionHeader}><div><span>TASTE LEDGER</span><h2>Ứng viên và phiên bản</h2></div><Sparkles /></header>{snapshot.taste_changes.length ? <div className={styles.tasteList}>{snapshot.taste_changes.map((item) => <div key={item.change_id}><header><span>{item.scope}</span><Status value={item.status} /></header><strong>{item.title}</strong><p>{item.summary}</p><small>{formatDate(item.created_at)} · {item.change_id}</small></div>)}</div> : <Empty title="Chưa có ứng viên Taste" detail="Phản hồi đầu tiên sẽ tạo một record có thể truy ngược." />}</section></div></div>
}

function Codex({ snapshot, query }: { snapshot: TprDashboardSnapshot; query: string }) {
  const events = snapshot.events.filter((event) => event.event_type.startsWith('codex') && `${event.title} ${event.summary} ${event.actor}`.toLowerCase().includes(query.toLowerCase()))
  return <div className={styles.content}><section className={styles.codexPolicy}><div><LockKeyhole /><span><strong>Đồng bộ có kiểm soát</strong><small>Chỉ user/assistant message thuộc TPR; bỏ tool output, reasoning, secrets và đường dẫn riêng tư.</small></span></div><Status value="verified" /></section><section className={styles.section}><header className={styles.sectionHeader}><div><span>CODEX ACTIVITY</span><h2>Trao đổi và quyết định</h2></div><MessageSquareText /></header>{events.length ? <ActivityRows events={events} /> : <Empty title="Chưa có hoạt động Codex" detail="Collector sẽ đọc gia tăng session TPR và đẩy các message đã khử bí mật." />}</section></div>
}

function ActivityRows({ events }: { events: TprDashboardSnapshot['events'] }) {
  if (!events.length) return <Empty title="Chưa có sự kiện" detail="Sự kiện vận hành sẽ xuất hiện sau đồng bộ." />
  return <ol className={styles.activityList}>{events.map((event) => <li key={event.event_id}><span className={styles.activityDot} /><div><header><strong>{event.title}</strong><time>{formatDate(event.occurred_at)}</time></header><p>{event.summary}</p><small>{event.actor} · {event.event_type}</small></div></li>)}</ol>
}

function System({ snapshot }: { snapshot: TprDashboardSnapshot }) {
  return <div className={styles.content}><section className={styles.systemHero}><div><span>CAPACITY MODE</span><h2>{snapshot.capacity.mode === 'object_storage_ready' ? 'Sẵn sàng đồng bộ file lớn' : 'Metadata-only an toàn'}</h2><p>D1 giữ trạng thái và graph. Video, contact sheet và evidence lớn chỉ đi vào object storage sau khi R2 được bật rõ ràng.</p></div><Status value={snapshot.capacity.object_storage} /></section><div className={styles.twoColumn}><section className={styles.section}><header className={styles.sectionHeader}><div><span>STORAGE MAP</span><h2>Dữ liệu nằm ở đâu</h2></div><Database /></header><dl className={styles.storageMap}><div><dt>Run + evidence local</dt><dd>Nguồn sự thật đầy đủ, bất biến theo manifest.</dd></div><div><dt>D1 control plane</dt><dd>Trạng thái, index, graph, feedback, Taste, cost ledger.</dd></div><div><dt>Object storage</dt><dd>Video, contact sheet, bundle lớn theo SHA-256.</dd></div><div><dt>Codex projection</dt><dd>Message TPR đã khử bí mật; không có tool/reasoning.</dd></div></dl></section><section className={styles.section}><header className={styles.sectionHeader}><div><span>GUARDRAILS</span><h2>Ngưỡng vận hành</h2></div><CircleGauge /></header><dl className={styles.storageMap}><div><dt>Sync batch</dt><dd>{snapshot.capacity.sync_batch_limit} record · {(snapshot.capacity.max_batch_bytes / 1024).toFixed(0)} KiB</dd></div><div><dt>Reuse floor</dt><dd>70% candidate/observation</dd></div><div><dt>Render policy</dt><dd>1 proxy 720p → 1 final 1080p</dd></div><div><dt>Sync lag</dt><dd>Cảnh báo sau 10 phút</dd></div></dl></section></div><section className={styles.section}><header className={styles.sectionHeader}><div><span>SCALE PLAN</span><h2>Tối ưu trước 100+ run/ngày</h2></div><UploadCloud /></header><ol className={styles.scalePlan}><li><strong>01 · Reuse first</strong><p>Film/Footage Vault trả profile và observation theo fingerprint trước khi search bên ngoài.</p></li><li><strong>02 · Tiered intelligence</strong><p>Rule và embedding rẻ lọc rộng; LLM/VLM chỉ chấm top-K hoặc disagreement.</p></li><li><strong>03 · Proxy before final</strong><p>Storyboard/contact sheet → proxy 720p → human/Taste gate → một final 1080p.</p></li><li><strong>04 · Queue + backpressure</strong><p>Nhóm theo run, giới hạn concurrency cho download/observation/render, retry idempotent.</p></li><li><strong>05 · Retention</strong><p>Giữ evidence/model lâu dài; cache proxy theo TTL; không xóa vật lý trước tombstone và grace period.</p></li><li><strong>06 · Budget ledger</strong><p>Mọi token, phút render, clip tải, byte lưu và cache hit đều có cost event.</p></li></ol></section></div>
}
