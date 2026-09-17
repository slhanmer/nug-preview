#!/usr/bin/env node
import { access, cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * Cuts one mock out into a repo of its own, ready to deploy.
 *
 * WHY THIS EXISTS, and it is not "the template got too big".
 *
 * `.gitignore` excludes `demos/*` and `public/media` on purpose: those are
 * photographs and trading details belonging to businesses that have agreed to
 * nothing, and this repo's history is not where they go. That rule is right and
 * it is also the reason a mock cannot simply be deployed from here — Vercel
 * builds from git, and from git this mock does not exist.
 *
 * So a mock that has to be a URL becomes its own small, private repo: the
 * template as it stands today, one demo, and a .gitignore that keeps it. It
 * deploys, it gets shown, and when the prospect says no it gets deleted and
 * takes their pictures with it.
 *
 * The ejected copy does NOT track the template afterwards. That is deliberate.
 * A mock is a thing you send once; a template change three weeks later is not
 * an improvement to it, it is a risk to a page somebody is already looking at.
 * If a mock becomes a client, the build starts fresh from the template anyway.
 *
 * ⚠️ THREE THINGS LEAK OUT OF HERE AND THEY LEAK IN DIFFERENT DIRECTIONS.
 *
 * 1. public/media is NOT copied. Payload names an uploaded file after its
 *    source basename and deduplicates collisions, so `public/media` currently
 *    holds room.jpg, room-1.jpg … room-4.jpg and room.png — six different
 *    businesses' dining rooms, and nothing in the filename says which is which.
 *    An earlier version of this script matched by name and would have shipped
 *    one cafe a photograph of another cafe's room. The ejected repo re-seeds
 *    from `demos/<slug>/assets/`, which is the only unambiguous source there
 *    is.
 *
 * 2. public/demo-*.* IS copied, but only the files this one site references.
 *    Those are hand-prepared brand cut-outs that never go through Payload, so
 *    they sit at the top of `public/` under names that are perfectly clear
 *    about whose they are — demo-waho-logo.png, demo-kizuna-wordmark.svg. The
 *    first ejected repo carried thirteen other prospects' marks into a
 *    prospect's repository. References are read out of that demo's own
 *    config.ts and content.ts, not guessed from the slug, because a site can
 *    legitimately name two files and neither has to contain the slug.
 *
 * 3. The studio's own material stays here: the briefs, the notes, the CI, the
 *    workbench, the test attachments. Somebody who opens this repo should find
 *    a website and not a folder called how-we-pitch-you.
 *
 * ⚠️ NEVER SKIP BY BARE DIRECTORY NAME WHERE THE NAME IS AMBIGUOUS. `brand` is
 * both `public/brand` (studio logo, unused) and `src/skins/brand` (a skin, and
 * currently the one Zmirk is built on). Anything positional goes in
 * NESTED_SKIP, which matches a path from the repo root and nothing else.
 *
 * Usage:  pnpm eject <slug> [destination]
 *         pnpm eject nug                      -> ../nug-preview
 *         pnpm eject nug ../clients/nug-site
 *
 * NO GIT IS RUN. It writes a folder; you init, commit and push it yourself.
 */

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')

const slug = process.argv[2]
const destArg = process.argv[3]

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function listDemos() {
  try {
    const entries = await readdir(path.join(root, 'demos'), { withFileTypes: true })
    return entries.filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name)
  } catch {
    return []
  }
}

function die(...lines) {
  for (const line of lines) console.error(line)
  process.exit(1)
}

if (!slug) {
  const available = await listDemos()
  die(
    'Usage: pnpm eject <slug> [destination]',
    available.length ? `Demos: ${available.join(', ')}` : 'demos/ is empty.',
  )
}

const demoDir = path.join(root, 'demos', slug)
if (!(await exists(path.join(demoDir, 'config.ts')))) {
  const available = await listDemos()
  die(
    `No demo named "${slug}".`,
    available.length ? `Demos: ${available.join(', ')}` : 'demos/ is empty.',
  )
}

const assetsDir = path.join(demoDir, 'assets')
const assets = (await exists(assetsDir))
  ? (await readdir(assetsDir)).filter((f) => !f.startsWith('.'))
  : []
if (assets.length === 0) {
  die(
    `demos/${slug}/assets is empty.`,
    'The ejected repo re-seeds from that folder, so there would be no images to seed.',
  )
}

const config = await readFile(path.join(demoDir, 'config.ts'), 'utf8')
const content = await readFile(path.join(demoDir, 'content.ts'), 'utf8').catch(() => '')

/* The brand cut-outs this site names, and nothing else out of public/. */
const DEMO_ASSET = /\/(demo-[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|svg|gif|avif))/gi
const referenced = new Set()
for (const [, file] of `${config}\n${content}`.matchAll(DEMO_ASSET)) referenced.add(file)

const missing = []
for (const file of referenced) {
  if (!(await exists(path.join(root, 'public', file)))) missing.push(file)
}
if (missing.length) {
  die(
    `demos/${slug} references files that are not in public/:`,
    ...missing.map((f) => `  /${f}`),
    'It would deploy with a broken logo. Fix the reference or add the file.',
  )
}

const dest = path.resolve(root, destArg ?? path.join('..', `${slug}-preview`))

if (await exists(dest)) {
  const entries = await readdir(dest)
  if (entries.length > 0) die(`Destination is not empty: ${dest}`, 'Delete it or pass another path.')
}

/*
 * Never copied, matched by bare name at any depth. Every entry here is a name
 * that cannot mean anything else in this repo — see the warning at the top.
 *
 * Rebuilt:   node_modules, .next, .turbo, storybook-static
 * Ours:      .git, .vercel — the new repo gets its own
 * Secrets:   .env* (handled in skipFile) — set in Vercel, not carried
 * Scratch:   _incoming, _to_delete, _shots, _sync, __screenshots__
 * Studio:    Claude outputs and .vitest-attachments hold working notes and
 *            screenshots of OTHER prospects' pages; .storybook is the
 *            component workbench; .github is our CI, which in a client repo
 *            only burns Actions minutes failing.
 * demos:     one of them travels, copied by hand below rather than by the walk.
 */
const SKIP = new Set([
  'node_modules',
  '.next',
  '.turbo',
  '.git',
  '.github',
  '.vercel',
  'storybook-static',
  '.storybook',
  '.vitest-attachments',
  'Claude outputs',
  '_incoming',
  '_to_delete',
  '_shots',
  '_sync',
  '__screenshots__',
  'demos',
])

/* Matched as a path from the repo root, because the bare name is ambiguous. */
const NESTED_SKIP = new Set(
  [
    'public/media', // collides between demos — see the note at the top
    'public/brand', // the studio's own logo; referenced nowhere, and not theirs
    'docs', // template documentation, for us
    'out',
    'build',
    'coverage',
  ].map((p) => p.split('/').join(path.sep)),
)

/*
 * MOCKS.md / AGENTS.md / CLAUDE.md are how we build mocks and what we refuse to
 * claim on them. docker-compose.yml is local studio infra. .simple-git-hooks
 * installs a pre-push hook that runs `pnpm verify` — in a fresh folder with no
 * .git yet, `pnpm install` runs `prepare` and that hook install fails, which is
 * enough to abort the install. The `prepare` script is stripped below to match.
 */
const SKIP_FILES = new Set([
  'MOCKS.md',
  'AGENTS.md',
  'CLAUDE.md',
  'docker-compose.yml',
  '.simple-git-hooks.json',
])

function skipFile(name) {
  return (
    name === '.DS_Store' ||
    SKIP_FILES.has(name) ||
    name.endsWith('.tsbuildinfo') ||
    name === 'next-env.d.ts' ||
    (name.startsWith('.env') && name !== '.env.example')
  )
}

let fileCount = 0
const publicKept = []
const publicDropped = []

async function copyTree(from, to) {
  await mkdir(to, { recursive: true })
  const inPublicRoot = path.relative(root, from) === 'public'

  for (const entry of await readdir(from, { withFileTypes: true })) {
    const name = entry.name
    if (SKIP.has(name)) continue

    const src = path.join(from, name)
    const dst = path.join(to, name)
    if (NESTED_SKIP.has(path.relative(root, src))) continue

    if (entry.isDirectory()) {
      await copyTree(src, dst)
    } else if (entry.isFile()) {
      if (skipFile(name)) continue

      /* Every other prospect's brand mark lives here. Only this one's travels. */
      if (inPublicRoot && /^demo-/i.test(name) && !referenced.has(name)) {
        publicDropped.push(name)
        continue
      }
      if (inPublicRoot) publicKept.push(name)

      await cp(src, dst)
      fileCount += 1
    }
  }
}

console.log(`Ejecting "${slug}" to ${dest}`)
await copyTree(root, dest)

/* The one demo, and it becomes the active site in the same move. */
await cp(demoDir, path.join(dest, 'demos', slug), { recursive: true })
await cp(path.join(demoDir, 'config.ts'), path.join(dest, 'site.config.ts'))

/*
 * `prepare` would try to install a git hook into a folder that has no .git yet
 * and take `pnpm install` down with it; the storybook scripts point at a
 * workbench that did not travel. Everything else is left exactly as it is,
 * including the drizzle patch, which this build genuinely needs to seed.
 */
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
pkg.name = `${slug}-preview`
delete pkg.scripts.prepare
delete pkg.scripts.storybook
delete pkg.scripts['build-storybook']
await writeFile(path.join(dest, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')

/*
 * A .gitignore that KEEPS what the template's throws away. Written rather than
 * copied, because the template's rule — no prospect content in this history —
 * is exactly the rule this repo has to break in order to exist.
 */
await writeFile(
  path.join(dest, '.gitignore'),
  `# ${slug} — a single mock, cut out of the studio template to be deployed.
#
# demos/ and public/media ARE committed here, which is the whole point: Vercel
# builds from git, so a mock whose content is ignored deploys as a page of
# broken images. This repo is private, it holds one business, and it gets
# deleted if they say no.
#
# public/media is written by \`pnpm seed ${slug}\` — run that BEFORE the first
# commit or the deployment will have no pictures.

/node_modules
/.pnp
.pnp.*
/coverage
/.next/
/out/
/build
.DS_Store
*.pem
.env*
!.env.example
.vercel
*.tsbuildinfo
next-env.d.ts
/storybook-static
_incoming
_to_delete
_shots
_sync
*storybook.log
**/__screenshots__
`,
  'utf8',
)

/* Only ask for the keys this site will actually reach for. */
const hasContact = content.includes("blockType: 'contact'")
const hasCommerce = config.includes("'commerce'")

await writeFile(
  path.join(dest, 'README.md'),
  `# ${slug} — preview

A mock built for a business that has agreed to nothing. **Private repo,
noindexed deployment, delete it when the answer is no.**

Ejected from the studio template. It does not track the template — see the
comment at the top of \`scripts/eject.mjs\` for why.

## Set it up, in this order

The order matters, and **run one line at a time and read each one's output.**
Step 3 is the one that can be skipped without anything looking wrong until the
site is deployed and blank.

\`public/media\` is not carried across from the template, because files there are
named after their source and collide between demos — six businesses currently
share a \`room.jpg\`. This repo re-seeds from \`demos/${slug}/assets/\`, which is
unambiguous.

1. **A database of its own.** A Neon branch is fine. Put \`DATABASE_URL\` and
   \`PAYLOAD_SECRET\` in \`.env.local\`. Do not point this at the studio database —
   it holds every prospect's mock.
2. \`pnpm install\`
3. \`pnpm seed ${slug}\`, then \`ls public/media\` and confirm it has files in it.
   If it is empty or absent, stop — nothing after this is worth doing.
4. \`pnpm build\`. This is the gate: if it builds here it will build on Vercel.
5. \`git init && git add -A && git commit -m "${slug} preview"\`, then push to a
   **private** repo. Run \`git status\` before pushing and confirm \`public/media\`
   is in the commit.
6. Import on Vercel. Name the project so the URL reads as a draft —
   \`${slug}-preview\` — because \`${slug}.vercel.app\` reads like a live site
   claiming to be theirs.
7. Environment variables:

   | Key | Value |
   |---|---|
   | \`DATABASE_URL\` | The same database you seeded |
   | \`PAYLOAD_SECRET\` | Any long random string |
   | \`NEXT_PUBLIC_SITE_URL\` | The deployment's own URL |
${
  hasContact
    ? `   | \`RESEND_API_KEY\` | **This site has a contact form** — without it the form refuses every submission and shows the phone number instead |
   | \`CONTACT_FROM\` | An address on a domain verified in that Resend account |
   | \`CONTACT_TO\` | Where the enquiry lands. Falls back to \`business.email\` if that is set |

   **No Turnstile keys while \`demo: true\`.** The mock renders no widget and
   skips the check on purpose — that is what stops the form erroring the one
   time somebody presses Send in front of a prospect. The keys become required
   the day the demo flag comes off.
`
    : ''
}${
    hasCommerce
      ? `   | \`STRIPE_SECRET_KEY\` | This site enables the commerce module |
   | \`STRIPE_WEBHOOK_SECRET\` | See above |
   | \`STRIPE_CURRENCY\` | e.g. aud |
`
      : ''
  }
   **Do not set \`ALLOW_INDEXING\`.** Unset means noindexed, which is what a mock
   must be. Three layers enforce it: the meta tag, /robots.txt, and an
   \`X-Robots-Tag\` header that also covers the images.

## Before you send the link

- Open every page on a phone. Tap every link, including the footer.
${hasContact ? '- **Submit the contact form on the deployed URL.** It is the one thing that can throw in front of them.\n' : ''}- Check every photograph is this business and not another one.
- \`ls public\` — every \`demo-*\` file in there should be theirs. The eject
  filters the rest out, but look anyway.
- Check the tab icon is theirs and not the studio's.
- Open the URL in an incognito window and look for anything you did not expect.
`,
  'utf8',
)

console.log(`  ${fileCount} template files`)
console.log(`  demos/${slug} (${assets.length} source assets)`)
console.log(`  site.config.ts is ${slug}`)
console.log('')
console.log(`  public/ kept: ${publicKept.sort().join(', ') || '(nothing)'}`)
if (publicDropped.length) {
  console.log(`  public/ dropped ${publicDropped.length} other prospects' brand files`)
}
console.log('')
console.log('public/media was NOT copied — those filenames collide between demos.')
console.log('Re-seed it in the new folder. Run these ONE AT A TIME:')
console.log('')
console.log(`  cd ${path.relative(process.cwd(), dest) || dest}`)
console.log('')
console.log('  1. put DATABASE_URL + PAYLOAD_SECRET in .env.local (its own database)')
console.log('  2. pnpm install')
console.log(`  3. pnpm seed ${slug}`)
console.log('     then: ls public/media    <- must not be empty. if it is, stop.')
console.log('  4. pnpm build')
console.log('     the gate. if it passes here, Vercel will build it.')
console.log('  5. git init / git add -A / git commit')
console.log('     then git status before you push: public/media must be in it.')
