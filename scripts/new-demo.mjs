#!/usr/bin/env node
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * Stamps out a new mock.
 *
 *   pnpm new toastbuds venue menu
 *   pnpm new nug brand
 *
 * Writes demos/<slug>/{config.ts,content.ts,assets/} and nothing else. The
 * files it writes are the minimum that compiles and seeds green, so a fresh
 * scaffold can go straight to `pnpm use <slug> && pnpm seed <slug>` before a
 * single photograph exists — which is what makes the count of mocks per day a
 * question about content rather than about setup.
 */

const SKINS = ['base', 'service', 'venue', 'brand']

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const demos = path.join(root, 'demos')

const [slug, skin = 'service', modules = ''] = process.argv.slice(2)

function fail(...lines) {
  for (const line of lines) console.error(line)
  process.exit(1)
}

if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  fail(
    'Usage: pnpm new <slug> [skin] [modules,comma,separated]',
    'Slug is lowercase letters, digits and hyphens — it is the database key.',
    `Skins: ${SKINS.join(', ')}`,
  )
}

if (!SKINS.includes(skin)) fail(`Unknown skin "${skin}". One of: ${SKINS.join(', ')}`)

const dir = path.join(demos, slug)
const existing = await readdir(demos).catch(() => [])
if (existing.includes(slug)) {
  fail(`demos/${slug} already exists. Delete it yourself if you meant to start over.`)
}

const moduleList = modules
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean)

const config = `import type { SiteConfig } from '@/site-config'

/*
 * TODO — ${slug}. Speculative: they have agreed to nothing.
 */
const siteConfig: SiteConfig = {
  key: '${slug}',
  skin: '${skin}',
  modules: [${moduleList.map((m) => `'${m}'`).join(', ')}],
  brand: {
    primary: '#2f3a4a', // TODO
    secondary: '#a8763e', // TODO
    groundTint: 0.25,
    groundNudge: 0,
    theme: 'light',
  },
  business: {
    name: 'TODO',
    address: 'TODO',
    phone: 'TODO',
    timezone: 'Australia/Brisbane',
  },
  cta: { label: 'Get in touch', href: '#contact' },
  /* Their photographs, their trading details, their name. Leave this on. */
  demo: true,
}

export default siteConfig
`

const content = `import { defineDemo } from '@/seed/define'

/*
 * TODO — ${slug}.
 *
 * Every fact here is theirs. Take them from the account they actually keep
 * up to date, not from whatever site ranks first.
 */
export default defineDemo({
  site: '${slug}',

  images: {},

  pages: [
    {
      title: 'Home',
      slug: 'home',
      blocks: () => [
        {
          blockType: 'hero',
          heading: 'TODO',
          primaryCta: { label: 'TODO', href: '#contact' },
        },
        {
          blockType: 'contact',
          heading: 'Ask us anything',
        },
      ],
    },
  ],
})
`

await mkdir(path.join(dir, 'assets'), { recursive: true })
await writeFile(path.join(dir, 'config.ts'), config, 'utf8')
await writeFile(path.join(dir, 'content.ts'), content, 'utf8')

console.log(`demos/${slug}/ — ${skin} skin${moduleList.length ? `, modules: ${moduleList.join(', ')}` : ''}`)
console.log(`  assets/     drop photos here as hero.jpg, 01.jpg, 02.jpg …`)
console.log('')
console.log(`  pnpm use ${slug}`)
console.log(`  pnpm seed ${slug}`)
console.log(`  pnpm dev`)
