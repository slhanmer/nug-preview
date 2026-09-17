import config from '@payload-config'
import siteConfig from '@site-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import { loadSkin } from '@/skins/registry'
import { RenderBlocks } from '@/skins/render'

/*
 * A config with no `key` is almost always a stale site.config.ts — most often
 * from `git restore site.config.ts`, which reverts to whatever was last
 * COMMITTED at that path rather than to the reference site.
 *
 * Without this the symptom is a bare 404 on every route with nothing in the
 * logs, because the query below filters on `site: undefined` and matches
 * nothing. Cost an afternoon once; now it says what to run.
 */
function requireKey(): string {
  if (!siteConfig.key) {
    throw new Error(
      'site.config.ts has no `key`. It is probably a stale config — run `pnpm use reference` ' +
        '(or `pnpm use <slug>`). Never `git restore site.config.ts`.',
    )
  }
  return siteConfig.key
}

/*
 * Cached for the request, not for time.
 *
 * generateMetadata and the component both need the same row, and Next calls
 * them separately. React's cache() collapses that to one query per request —
 * without it every page runs this twice, which is easy to miss because nothing
 * about the rendered page looks wrong.
 */
const findPage = cache(async (slug: string) => {
  const key = requireKey()
  const payload = await getPayload({ config })
  const now = new Date().toISOString()

  const { docs } = await payload.find({
    collection: 'pages',
    limit: 1,
    where: {
      and: [
        { slug: { equals: slug } },
        /*
         * Scoped to this site. Slugs are only unique within one — every mock
         * has a `home` — so without this the first row wins and you get
         * somebody else's barber.
         */
        { site: { equals: key } },
        { or: [{ launchesAt: { exists: false } }, { launchesAt: { less_than_equal: now } }] },
        { or: [{ expiresAt: { exists: false } }, { expiresAt: { greater_than: now } }] },
      ],
    },
  })

  return docs[0] ?? null
})

/*
 * Per-page title and description.
 *
 * Every page used to inherit the one title set in the layout, so a site's home
 * page, menu and prices told Google they were three copies of the same page.
 * The template lives in the layout; this supplies the leaf, and home supplies
 * none deliberately so it falls back to the business name rather than reading
 * "Home — Tocco Italiano".
 *
 * The description is the site's rather than the page's, until there is a field
 * on the collection worth filling in. One accurate sentence across five pages
 * beats five empty ones — and it is what Google prints under the link, so an
 * absent one is a real finding rather than a Lighthouse technicality.
 */
export async function pageMetadata(slug: string): Promise<Metadata> {
  const doc = await findPage(slug)
  if (!doc) return {}

  const description = siteConfig.business.description ?? siteConfig.business.tagline
  return {
    ...(slug === 'home' ? {} : { title: doc.title }),
    ...(description ? { description } : {}),
  }
}

/*
 * One published, in-window page from the `pages` collection, drawn in the
 * active skin.
 *
 * Home is not special — it is the row whose slug is "home", rendered by this
 * same component. Giving the homepage its own template is how you end up with
 * a client editing their front page in the admin and nothing changing.
 *
 * The window is evaluated per request, which only holds while these routes are
 * force-dynamic. When E7 makes them static, a timed page needs a scheduled
 * revalidation or it will launch late and expire late.
 */
export async function PageBySlug({ slug }: { slug: string }) {
  const doc = await findPage(slug)
  if (!doc) notFound()

  const skin = await loadSkin(siteConfig.skin)
  const { Header, Footer, Page } = skin.chrome

  return (
    <Page>
      <Header />
      <main>
        <RenderBlocks skin={skin} blocks={doc.blocks ?? []} />
      </main>
      <Footer />
    </Page>
  )
}
