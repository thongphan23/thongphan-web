import type { Brain2LessonMeta } from '../../lib/brain2/lesson-contract'

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<unknown>
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike
}

export interface KVNamespaceLike {
  get(key: string): Promise<string | null>
}

export interface Brain2AccessEnv {
  DB: D1DatabaseLike
  BRAIN2_CONTENT: KVNamespaceLike
  BRAIN2_ACCESS_CODE_HASH: string
  BRAIN2_SESSION_SECRET: string
}

export interface ProtectedContentDescriptor {
  slug: string
  key: string
  contentSha256: string
  meta: Brain2LessonMeta
  maxBytes: number
}

export interface Brain2AccessWorker {
  fetch(request: Request, env: Brain2AccessEnv): Promise<Response>
}
