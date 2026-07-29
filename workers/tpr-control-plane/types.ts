import type {
  TprArtifactRecord,
  TprDashboardSnapshot,
  TprFeedbackInput,
  TprIngestBatch,
} from '../../lib/tpr/contracts'

export interface D1ResultLike<T = Record<string, unknown>> {
  results?: T[]
  success?: boolean
  meta?: Record<string, unknown>
}

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike
  first<T = Record<string, unknown>>(): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<D1ResultLike<T>>
  run(): Promise<unknown>
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike
  batch(statements: D1PreparedStatementLike[]): Promise<unknown[]>
}

export interface R2ObjectBodyLike {
  body: ReadableStream
  size: number
  httpEtag: string
  range?: { offset: number; length: number }
  httpMetadata?: { contentType?: string }
}

export interface R2BucketLike {
  get(key: string, options?: { range?: { offset: number; length?: number; suffix?: number } }): Promise<R2ObjectBodyLike | null>
}

export interface TprControlPlaneEnv {
  TPR_DB: D1DatabaseLike
  TPR_OBJECTS?: R2BucketLike
  TPR_OWNER_ACCESS_CODE_HASH: string
  TPR_SESSION_SECRET: string
  TPR_SYNC_SECRET: string
}

export interface TprStore {
  reserveAuthFailure(clientKey: string, now: number): Promise<number | null>
  releaseAuthFailure(reservationId: number, clientKey: string): Promise<void>
  ingest(batch: TprIngestBatch): Promise<{ accepted: number; duplicates: number }>
  dashboard(nowIso: string, objectStorageReady: boolean): Promise<TprDashboardSnapshot>
  artifact(artifactId: string): Promise<TprArtifactRecord | null>
  feedback(input: TprFeedbackInput, nowIso: string): Promise<{ feedback_id: string; taste_change_id: string }>
}

export interface TprControlPlaneWorker {
  fetch(request: Request, env: TprControlPlaneEnv): Promise<Response>
}
