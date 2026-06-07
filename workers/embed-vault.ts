// workers/embed-vault.ts
// Worker script to embed Brain2 vault into Vectorize
// Run with: npx wrangler dev workers/embed-vault.ts --remote

export interface Env {
  AI: Ai
  BRAIN2_INDEX: VectorizeIndex
}

interface VectorizeVector {
  id: string
  values: number[]
  metadata?: Record<string, string>
}

const VAULT_FILES = [
  // Will be populated by reading vault directory
  // For now, we'll use a sample approach
]

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    chunks.push(text.slice(start, start + size))
    start += size - overlap
  }
  return chunks
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/embed' && request.method === 'POST') {
      try {
        const { filePath, content } = await request.json() as { filePath: string, content: string }

        // Strip frontmatter
        const body = content.replace(/^---[\s\S]*?---\n/, '')
        const chunks = chunkText(body, 800, 100)

        const vectors: VectorizeVector[] = []

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i].trim()
          if (chunk.length < 50) continue

          // Embed using Workers AI
          const embeddingResult = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
            text: [chunk]
          }) as any

          vectors.push({
            id: `${filePath.replace(/[^a-zA-Z0-9]/g, '-')}-${i}`,
            values: embeddingResult.data[0],
            metadata: {
              file: filePath,
              chunk: String(i),
              text: chunk.slice(0, 500),
            }
          })
        }

        // Upsert to Vectorize
        await env.BRAIN2_INDEX.upsert(vectors)

        return Response.json({
          success: true,
          vectorsCreated: vectors.length,
          file: filePath
        })

      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 })
      }
    }

    if (url.pathname === '/api/status') {
      // Check index status
      const testQuery = await env.BRAIN2_INDEX.query([0.1, 0.2, 0.3], { topK: 1 })
      return Response.json({
        status: 'ok',
        sampleQuery: testQuery
      })
    }

    return Response.json({
      message: 'Brain2 Vault Embedder',
      endpoints: {
        'POST /embed': 'Embed a file (body: {filePath, content})',
        'GET /status': 'Check index status'
      }
    })
  }
}
