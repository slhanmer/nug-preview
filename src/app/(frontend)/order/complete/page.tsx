import siteConfig from '@site-config'
import Link from 'next/link'

import { loadSkin } from '@/skins/registry'

/*
 * Says thank you and nothing else.
 *
 * Deliberately does NOT look the order up or confirm a payment. Landing here
 * is a redirect anyone can type, and whether money moved is settled by the
 * webhook against Stripe's signature. A page that says "paid" because of a
 * query parameter is a page that says "paid" to anybody who asks.
 */
export default async function OrderComplete() {
  const skin = await loadSkin(siteConfig.skin)
  const { Header, Footer, Page } = skin.chrome

  return (
    <Page>
      <Header />
      <main>
        <section style={{ padding: 'var(--space-section) var(--space-gutter)' }}>
          <div style={{ maxWidth: '40rem', marginInline: 'auto' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-heading)' }}>
              Thanks — that’s gone through.
            </h1>
            <p
              style={{
                marginBlockStart: 'var(--space-4)',
                fontSize: 'var(--text-lg)',
                lineHeight: 'var(--leading-body)',
                color: 'var(--text-secondary)',
              }}
            >
              Stripe has emailed you a receipt. We’ll be in touch about picking it up — or just
              grab it next time you’re in.
            </p>
            <p style={{ marginBlockStart: 'var(--space-6)' }}>
              <Link href="/">Back to {siteConfig.business.name}</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </Page>
  )
}
