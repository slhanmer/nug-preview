import siteConfig from '@site-config'
import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './chrome.module.css'

const { business, nav = [], cta } = siteConfig

/**
 * A masthead, not a navbar.
 *
 * The other three skins all open the same way — mark hard left, nav right, the
 * whole thing stuck to the top of the viewport. That is the correct shape for a
 * site whose job is to get you to a phone number or a booking. It is the wrong
 * shape for a business whose whole proposition is the person behind the
 * counter, because it puts a piece of software furniture between the reader and
 * her.
 *
 * So this is centred, it scrolls away, and the nav sits under a rule beneath it
 * like a masthead rather than beside it like a toolbar. It costs the sticky CTA,
 * which is a real trade: this skin is for businesses sold by being read rather
 * than by being clicked, and the CTA is repeated in the page instead.
 */
export function Header() {
  return (
    <header className={styles.masthead}>
      <div className={styles.inner}>
        {/*
         * THE NAME IS ALWAYS SET, mark or no mark.
         *
         * The other skins hide it behind the logo, because a navbar has room
         * for one thing and the mark is the one people recognise. A masthead is
         * the opposite — it is the business saying its own name at the top of
         * the page, and a monogram does not say it. With the name in an sr-only
         * span, a reader who did not already know the shop got two initials and
         * a strapline.
         */}
        <Link
          href="/"
          className={`${styles.brand} ${business.logo ? styles.brandWithMark : ''}`}
        >
          {business.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className={styles.brandMark} src={business.logo} alt="" />
          ) : null}
          <span className={styles.brandName}>{business.name}</span>
        </Link>

        {business.descriptor ? (
          <p className={styles.descriptor}>{business.descriptor}</p>
        ) : null}

        {nav.length > 0 || cta ? (
          <nav className={styles.nav} aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
            {cta ? (
              <Link href={cta.href} className={`${styles.navLink} ${styles.navCta}`}>
                {cta.label}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </header>
  )
}

/**
 * The name at sign-off size, and the facts underneath in one line.
 *
 * A four-column footer is a sitemap. This is a colophon: the business says its
 * own name last, big, and the things a local actually needs are set small and
 * close under it.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const hours = business.hours ?? []

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.signoff}>{business.name}</p>
        {business.tagline ? <p className={styles.footerTagline}>{business.tagline}</p> : null}

        <div className={styles.footerFacts}>
          {business.address ? (
            <div>
              <p className={styles.factLabel}>Find us</p>
              <p className={styles.factValue}>{business.address}</p>
            </div>
          ) : null}

          {hours.length > 0 ? (
            <div>
              <p className={styles.factLabel}>Hours</p>
              {hours.map((line) => (
                <p key={line} className={styles.factValue}>
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          {business.phone || business.email ? (
            <div>
              <p className={styles.factLabel}>Say hello</p>
              {business.phone ? (
                <p className={styles.factValue}>
                  <a href={`tel:${business.phone.replace(/\s+/g, '')}`}>{business.phone}</a>
                </p>
              ) : null}
              {business.email ? (
                <p className={styles.factValue}>
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                </p>
              ) : null}
            </div>
          ) : null}

          {nav.length > 0 ? (
            <div>
              <p className={styles.factLabel}>Pages</p>
              {nav.map((item) => (
                <p key={item.href} className={styles.factValue}>
                  <Link href={item.href}>{item.label}</Link>
                </p>
              ))}
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
 * No data-tokens here — same reason as every other skin. tokens.css declares
 * its inputs in the same rule as its derivations, so the attribute resets the
 * palette to the stylesheet defaults and throws away site.config.
 */
export function Page({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>
}
