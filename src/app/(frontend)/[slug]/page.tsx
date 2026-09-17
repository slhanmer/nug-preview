import { pageMetadata, PageBySlug } from '@/features/page-by-slug'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return pageMetadata(slug)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PageBySlug slug={slug} />
}
