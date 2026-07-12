// scripts/embed-brain2.ts
// Đọc Obsidian vault, chunk, embed, upsert vào Vectorize

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const VAULT_PATH = '/Users/rio/obsidian'
const CHUNK_SIZE = 800  // chars per chunk
const CHUNK_OVERLAP = 100
const ACCOUNT_ID = 'c9ac9be0687c0ce664de7fdc571fbb6a'

interface VectorizeVector {
  id: string
  values: number[]
  metadata?: Record<string, string>
}

type AiEmbeddingResponse = { result?: { data?: number[][] } }

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      files.push(...await getMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    chunks.push(text.slice(start, start + size))
    start += size - overlap
  }
  return chunks
}

async function embedChunk(text: string, apiToken: string): Promise<number[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/baai/bge-base-en-v1.5`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: [text] }),
    }
  )
  const data = await res.json() as AiEmbeddingResponse
  if (!data.result?.data?.[0]) {
    throw new Error(`Embedding failed: ${JSON.stringify(data)}`)
  }
  return data.result.data[0]
}

async function main() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!apiToken) {
    console.error('CLOUDFLARE_API_TOKEN not set')
    process.exit(1)
  }

  const indexName = 'brain2-vault'

  const files = await getMarkdownFiles(VAULT_PATH)
  console.log(`Found ${files.length} markdown files`)

  const vectors: VectorizeVector[] = []
  let chunkCount = 0

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      // Strip frontmatter
      const body = content.replace(/^---[\s\S]*?---\n/, '')
      const chunks = chunkText(body, CHUNK_SIZE, CHUNK_OVERLAP)
      const relPath = path.relative(VAULT_PATH, filePath)

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i].trim()
        if (chunk.length < 50) continue  // skip tiny chunks

        const embedding = await embedChunk(chunk, apiToken)

        // Generate short ID using hash if path is too long
        const relPathClean = relPath.replace(/[^a-zA-Z0-9]/g, '-')
        let vectorId = `${relPathClean}-${i}`
        if (vectorId.length > 64) {
          const hash = crypto.createHash('md5').update(relPath).digest('hex').slice(0, 16)
          vectorId = `${hash}-${i}`
        }

        vectors.push({
          id: vectorId,
          values: embedding,
          metadata: {
            file: relPath,
            chunk: String(i),
            text: chunk.slice(0, 500),  // store first 500 chars as metadata
          }
        })
        chunkCount++
        if (chunkCount % 10 === 0) console.log(`Embedded ${chunkCount} chunks...`)

        // Batch upsert every 100 vectors
        if (vectors.length >= 100) {
          await upsertVectors(vectors.splice(0, 100), ACCOUNT_ID, indexName, apiToken)
        }
      }
    } catch (e) {
      console.error(`Error processing ${filePath}:`, e)
    }
  }

  // Upsert remaining
  if (vectors.length > 0) {
    await upsertVectors(vectors, ACCOUNT_ID, indexName, apiToken)
  }

  console.log(`Done! Total chunks embedded: ${chunkCount}`)
}

async function upsertVectors(
  vectors: VectorizeVector[],
  accountId: string,
  indexName: string,
  apiToken: string
) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes/${indexName}/upsert`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vectors }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    console.error('Upsert error:', err)
  } else {
    console.log(`Upserted ${vectors.length} vectors`)
  }
}

main().catch(console.error)
