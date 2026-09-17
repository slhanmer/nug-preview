import siteConfig from '@site-config'
import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

/*
 * robots.txt.
 *
 * The <meta robots> tag in the frontend layout is the authoritative one and it
 * already does this — `siteConfig.demo` decided per request, exempting
 * loopback so a Lighthouse run measures the site rather than the safeguard.
 * This file exists because a crawler asks for /robots.txt BEFORE it asks for a
 * page, and without the file Next serves a 404 and the crawler proceeds.
 *
 * SAME TEST, SAME REASONING, deliberately not a second switch. An env flag
 * would work right up until the day it is set in the wrong environment and
 * nobody notices; `demo: true` is already in every mock's config and comes off
 * on the day they sign, which is the moment it should.
 *
 * The host check cannot leak, because there is no way to set a deployed site's
 * Host header to localhost.
 */
async function isLoopback(): Promise<boolean> {
  const host = (await headers()).get('host') ?? ''
  const name = host.split(':')[0]
  return name === 'localhost' || name === '127.0.0.1' || name === '[::1]' || name === '::1'
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const blocked = siteConfig.demo && !(await isLoopback())

  return blocked
    ? { rules: { userAgent: '*', disallow: '/' } }
    : {
        rules: { userAgent: '*', allow: '/' },
        ...(process.env.NEXT_PUBLIC_SITE_URL
          ? { sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml` }
          : {}),
      }
}
