import siteConfig from '@site-config'
import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './chrome.module.css'

const { business, nav = [], cta } = siteConfig

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.inner} ${styles.headerInner}`}>
        {/*
          A mark that already spells the name makes setting the name beside it
          a stutter, so with a logo the lockup carries `descriptor` instead —
          the one thing a wordmark cannot say. The name stays in the accessible
          tree, because a link whose only content is a decorative image has no
          name at all. Same decision as the service skin.
        */}
        <Link href="/" className={styles.brand}>
          {business.logo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.brandMark} src={business.logo} alt="" />
              <span className={styles.srOnly}>{business.name}</span>
              {business.descriptor ? (
                <span className={styles.brandDescriptor}>{business.descriptor}</span>
              ) : null}
            </>
          ) : (
            business.name
          )}
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
        {cta ? (
          <Link href={cta.href} className={styles.action}>
            {cta.label}
          </Link>
        ) : null}
      </div>
    </header>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  const hours = business.hours ?? []
  /*
   * EVERY SHOP, not the first one.
   *
   * A footer is the only part of a site that is on every page, which makes it
   * the only place a two-shop business can reliably answer "which one is near
   * me". Printing one address here and putting the other behind a Locations
   * link tells half the readers about the wrong shop and tells the other half
   * nothing at all.
   *
   * Falls back to the single address block when `venues` is absent, so every
   * site built before this existed renders byte-for-byte as it did.
   */
  const venues = business.venues ?? []

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.footerGrid}>
          <div>
            <p className={styles.footerName}>{business.name}</p>
            {business.tagline ? <p className={styles.footerTagline}>{business.tagline}</p> : null}
            {business.email ? (
              <p className={styles.footerTagline}>
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </p>
            ) : null}
          </div>

          {venues.length > 0 ? (
            venues.map((venue) => (
              <div key={venue.address}>
                <p className={styles.footerHeading}>{venue.name}</p>
                <ul className={styles.footerList}>
                  <li>
                    {venue.mapUrl ? (
                      <a href={venue.mapUrl}>{venue.address}</a>
                    ) : (
                      venue.address
                    )}
                  </li>
                  {venue.phone ? (
                    <li>
                      <a href={`tel:${venue.phone.replace(/\s+/g, '')}`}>{venue.phone}</a>
                    </li>
                  ) : null}
                  {(venue.hours ?? []).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div>
              <p className={styles.footerHeading}>Find us</p>
              <ul className={styles.footerList}>
                {business.address ? <li>{business.address}</li> : null}
                {business.phone ? (
                  <li>
                    <a href={`tel:${business.phone.replace(/\s+/g, '')}`}>{business.phone}</a>
                  </li>
                ) : null}
                {business.email ? (
                  <li>
                    <a href={`mailto:${business.email}`}>{business.email}</a>
                  </li>
                ) : null}
              </ul>
            </div>
          )}

          {venues.length === 0 && hours.length > 0 ? (
            <div>
              <p className={styles.footerHeading}>Hours</p>
              <ul className={styles.footerList}>
                {hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {nav.length > 0 ? (
            <div>
              <p className={styles.footerHeading}>Pages</p>
              <ul className={styles.footerList}>
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <p className={styles.colophon}>
          © {year} {business.name}
        </p>
      </div>
    </footer>
  )
}

/*
 * No data-tokens here.
 *
 * tokens.css declares its INPUTS in the same `:root, [data-tokens]` rule as the
 * derivations, so an element carrying the attribute resets brand and ground back
 * to the stylesheet defaults — throwing away whatever site.config put on <html>.
 * The attribute is for the Palette studio, which shows several palettes at once.
 * A rendered page has one palette and it lives on :root.
 */
export function Page({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>
}
