#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { access, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * pnpm seed <slug>
 *
 * A thin wrapper so the slug arrives as an env var rather than as an argv the
 * Payload CLI would have to forward. One runner, src/seed/run.ts, does the work.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const slug = process.argv[2]

async function demos() {
  try {
    const entries = await readdir(path.join(root, 'demos'), { withFileTypes: true })
    return entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    return []
  }
}

if (!slug) {
  const available = await demos()
  console.error('Usage: pnpm seed <slug>')
  console.error(available.length ? `Available: ${available.join(', ')}` : 'demos/ is empty.')
  process.exit(1)
}

try {
  await access(path.join(root, 'demos', slug, 'content.ts'))
} catch {
  console.error(`No demos/${slug}/content.ts.`)
  process.exit(1)
}

const child = spawn('pnpm', ['payload', 'run', './src/seed/run.ts'], {
  cwd: root,
  env: { ...process.env, SEED: slug },
  stdio: 'inherit',
  // Windows resolves pnpm through a shim, which needs a shell.
  shell: true,
})

child.on('exit', (code) => process.exit(code ?? 1))
