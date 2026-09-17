import { pageMetadata, PageBySlug } from '@/features/page-by-slug'

/*
 * Dynamic for now. E7 turns this static with ISR, and that change requires a
 * database in CI — prerendering queries Payload at build time.
 */
export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return pageMetadata('home')
}

export default function Home() {
  return <PageBySlug slug="home" />
}
