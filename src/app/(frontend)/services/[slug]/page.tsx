import { pageMetadata, PageBySlug } from '@/features/page-by-slug'

/*
 * A real segment rather than a slug containing a slash.
 *
 * `[slug]` is one dynamic segment, so a page stored as "services/canvas" would
 * never match it — the router sees two segments and falls through to a 404.
 * The alternatives were a catch-all `[...slug]`, which also swallows every
 * typo'd URL on the site, or flattening the slug to "services-canvas" and
 * giving up the directory that makes a service page look like a service page.
 *
 * This is additive: `[slug]` is untouched, Next prefers the static segment,
 * and the stored slug stays the honest "services/<name>".
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return pageMetadata(`services/${slug}`)
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PageBySlug slug={`services/${slug}`} />
}
