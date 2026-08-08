export type DisabledEndpointPath = '/api/embed' | '/api/chat'

export interface DisabledEndpointEvent {
  event: 'disabled_endpoint_hit'
  endpoint: DisabledEndpointPath
  method: string
  status: 410
  request_id: string | null
  ai_calls: 0
  vector_reads: 0
  vector_writes: 0
}

export type SecurityLogger = (event: DisabledEndpointEvent) => void

const DISABLED_BODY = JSON.stringify({
  type: 'about:blank',
  title: 'Endpoint disabled',
  status: 410,
})

export function createDisabledEndpointWorker(
  endpoint: DisabledEndpointPath,
  logger: SecurityLogger = (event) => console.log(JSON.stringify(event)),
): ExportedHandler {
  return {
    fetch(request): Response {
      logger({
        event: 'disabled_endpoint_hit',
        endpoint,
        method: request.method,
        status: 410,
        request_id: request.headers.get('CF-Ray'),
        ai_calls: 0,
        vector_reads: 0,
        vector_writes: 0,
      })

      return new Response(DISABLED_BODY, {
        status: 410,
        headers: {
          'Cache-Control': 'private, no-store, max-age=0',
          'Content-Type': 'application/problem+json; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
          'X-TP-Endpoint-State': 'disabled',
        },
      })
    },
  }
}
