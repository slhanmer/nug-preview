#!/usr/bin/env node
import { access,copyFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * Swaps a mock's config in as the active site.
 *
 * `site.config.ts` IS the site — see demos/README.md for why this is a file
 * copy rather than an env var and a registry.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const demos = path.join(root, 'demos')
const target = path.join(root, 'site.config.ts')

const slug = process.argv[2]

async function list() {
  try {
    const files = await readdir(demos, { withFileTypes: true }).then((e) => e.filter((d) => d.isDirectory()).map((d) => d.name))
    return files.filter((f) => !f.startsWith('.') && f !== 'README.md')
  } catch {
    return []
  }
}

if (!slug) {
  const available = await list()
  console.error('Usage: pnpm use <slug>')
  console.error(available.length ? `Available: ${available.join(', ')}` : 'demos/ is empty.')
  process.exit(1)
}

const source = path.join(demos, slug, 'config.ts')

try {
  await access(source)
} catch {
  const available = await list()
  console.error(`No demo named "${slug}".`)
  console.error(available.length ? `Available: ${available.join(', ')}` : 'demos/ is empty.')
  process.exit(1)
}

await copyFile(source, target)
console.log(`site.config.ts is now ${slug}.`)
console.log(`Seed it with:  pnpm seed ${slug}`)
