// scripts/embed-via-worker.ts
// Deploy a temporary worker to do the embedding, then call it

import fs from 'fs'
import path from 'path'

const VAULT_PATH = '/Users/rio/obsidian'
const WORKER_URL = 'https://thongphan.com/api/embed' // Will deploy to custom route

type EmbedResponse = { vectorsCreated?: number }

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

async function main() {
  console.log('Step 1: Deploy embed worker to thongphan.com/api/embed')
  console.log('Run: npx wrangler deploy workers/embed-vault.ts --config wrangler.embed.toml --name=brain2-embedder')
  console.log('')
  console.log('Step 2: Run this script again with --upload flag')
  console.log('Usage: npx tsx scripts/embed-via-worker.ts --upload')

  if (!process.argv.includes('--upload')) {
    return
  }

  const files = await getMarkdownFiles(VAULT_PATH)
  console.log(`Found ${files.length} markdown files`)

  let processed = 0
  let errors = 0
  let totalVectors = 0

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const relPath = path.relative(VAULT_PATH, filePath)

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: relPath, content })
      })

      if (!res.ok) {
        const err = await res.text()
        console.error(`Error processing ${relPath}: ${err}`)
        errors++
      } else {
        const result = await res.json() as EmbedResponse
        processed++
        totalVectors += result.vectorsCreated || 0
        if (processed % 10 === 0) {
          console.log(`Processed ${processed}/${files.length} files, ${totalVectors} vectors...`)
        }
      }
    } catch (e) {
      console.error(`Error with ${filePath}:`, e)
      errors++
    }
  }

  console.log(`\nDone! Processed: ${processed}, Errors: ${errors}, Total vectors: ${totalVectors}`)
}

main().catch(console.error)
