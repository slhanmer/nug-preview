import '@/styles/index.css'

import siteConfig from '@site-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { brandVars } from '@/styles/brand-vars'
import { DISPLAY_FONTS } from '@/styles/fonts'
import { shapeVars } from '@/styles/shape-vars'

/*
 * Is this request being served to a machine nothing can crawl?
 *
 * Host, not an env var, and that is the whole point. A flag like
 * SEO_AUDIT=1 would work until the day it is set in the deploy environment and
 * nobody notices; there is no way to set a deployed site's Host header to
 * localhost, so this cannot leak. A demo reached on its real URL is noindexed
 * unconditionally, which is the only case that matters.
 */
async function isLoopback(): Promise<boolean> {
  const host = (await headers()).get('host') ?? ''
  const name = host.split(':')[0]
  return name === 'localhost' || name === '127.0.0.1' || name === '[::1]' || name === '::1'
}

export async function generateMetadata(): Promise<Metadata> {
  /*
   * A demo is built for a business that has not said yes yet, so it must not be
   * indexed. Enforced here rather than remembered, because the one time it gets
   * forgotten is the time it matters.
   *
   * The loopback exemption exists so a Lighthouse run measures the SITE rather
   * than the safeguard: a noindexed page scores in the sixties on SEO no matter
   * how good it is, and that number is about us protecting their photographs,
   * not about what they would be getting. Run the audit against
   * `pnpm build && pnpm start` on localhost and the score is the one their real
   * site will have the day `demo` comes off.
   *
   * Run it against a dev server instead and the PERFORMANCE number is fiction —
   * unminified, uncached, hot-reload wired in. Build first or do not screenshot
   * it.
   */
  const noindex = siteConfig.demo && !(await isLoopback())

  return {
    /*
     * A template, not a fixed string. Pages supply the leaf via their own
     * generateMetadata and this frames it; home supplies none and takes the
     * default. Before this every route in the site shared one <title>, which
     * tells a search engine they are the same page.
     */
    title: {
      default: siteConfig.business.name,
      template: `%s — ${siteConfig.business.name}`,
    },
    description: siteConfig.business.description ?? siteConfig.business.tagline,

    /*
     * THEIR MARK IN THE TAB, not ours.
     *
     * `app/(frontend)/favicon.ico` is the template's own and Next will use it
     * for anything that does not override it — which meant every mock we have
     * ever sent carried the studio's icon on the client's site. On a phone that
     * icon is most of what a bookmark or a shared link looks like.
     *
     * The logo is already a client-owned file under public/, already the right
     * shape (these are discs and monograms, not lockups), and already required
     * to exist for the header, so there is nothing new to maintain. A site with
     * no logo falls through to favicon.ico, same as before.
     */
    ...(siteConfig.business.logo ? { icons: { icon: siteConfig.business.logo } } : {}),

    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  /*
   * A pinned theme is an attribute on <html>, which tokens.css already honours
   * in both directions. Left unset the ground follows prefers-color-scheme,
   * which is right for most sites and wrong for a demo: the same page reads
   * dark on our laptop and light on the client's.
   */
  const theme = siteConfig.brand.theme ?? 'system'

  /*
   * `--display-site`, not `--display`.
   *
   * Every skin declares `--display` on its own `.page`, which is a descendant
   * of <html> — so a value set here would LOSE to the skin rather than override
   * it. The skins read `var(--display-site, <their own stack>)` instead, which
   * makes the config the override and the skin the default, in that order.
   */
  const display = siteConfig.style?.display ? DISPLAY_FONTS[siteConfig.style.display] : null

  return (
    <html
      lang="en"
      data-theme={theme === 'system' ? undefined : theme}
      className={display?.variable}
      style={{
        ...brandVars(siteConfig.brand),
        ...shapeVars(siteConfig.style),
        ...(display
          ? {
              '--display-site': display.stack,
              '--display-leading': display.leading,
              '--display-tracking': display.tracking,
            }
          : {}),
      }}
    >
      <body>{children}</body>
    </html>
  )
}
