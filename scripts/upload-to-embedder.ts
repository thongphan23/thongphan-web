// scripts/upload-to-embedder.ts
// Upload vault files to embed-vault worker for processing

import fs from 'fs'
import path from 'path'

const VAULT_PATH = '/Users/rio/obsidian'
const WORKER_URL = 'https://thongphan.com/api/embed'

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
  const files = await getMarkdownFiles(VAULT_PATH)
  console.log(`Found ${files.length} markdown files`)

  let processed = 0
  let errors = 0

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const relPath = path.relative(VAULT_PATH, filePath)

      const res = await fetch(`${WORKER_URL}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: relPath, content })
      })

      if (!res.ok) {
        const err = await res.text()
        console.error(`Error processing ${relPath}: ${err}`)
        errors++
      } else {
        await res.text()
        processed++
        if (processed % 10 === 0) {
          console.log(`Processed ${processed}/${files.length} files...`)
        }
      }
    } catch (e) {
      console.error(`Error with ${filePath}:`, e)
      errors++
    }
  }

  console.log(`\nDone! Processed: ${processed}, Errors: ${errors}`)
}

main().catch(console.error)
