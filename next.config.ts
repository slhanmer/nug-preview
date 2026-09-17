import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

/*
 * INDEXING IS OFF UNLESS A DEPLOYMENT SAYS OTHERWISE.
 *
 * The <meta robots> tag and /robots.txt are both driven by `siteConfig.demo`,
 * which is the right switch: it is already in every mock's config and it comes
 * off the day a client signs. This header is the third layer and it covers what
 * the other two cannot — a meta tag only exists in HTML, so it says nothing
 * about an image, a PDF or a JSON response, and those are indexable on their
 * own. A prospect's photographs are the whole reason any of this exists.
 *
 * Read the default carefully. ALLOW_INDEXING has to be set to 1 for a
 * deployment to be crawlable at all, so forgetting it gives a client site that
 * is briefly not indexed — annoying, fixed in a minute, and loud the moment you
 * look. The opposite default fails the other way: silently, and you find out
 * when a prospect searches their own name and gets our copy of their business.
 *
 * Next's config is static, so this cannot check the request host the way the
 * meta tag does. That is fine. It is the belt, not the braces.
 */
const indexable = process.env.ALLOW_INDEXING === '1'

const nextConfig: NextConfig = {
  /*
   * The dev overlay badge, off.
   *
   * It only ever appears in `next dev`, but `next dev` is where the mocks get
   * screenshotted, and a red "2 Issues" pill in the corner of a page you are
   * sending to a prospect is the one thing on it they will ask about.
   *
   * This hides the indicator, not the problems — errors still print in the
   * terminal and in the browser console, and `pnpm build` still fails on
   * anything real. If a page starts misbehaving, look there rather than
   * wondering where the badge went.
   */
  devIndicators: false,

  async headers() {
    if (indexable) return []
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
