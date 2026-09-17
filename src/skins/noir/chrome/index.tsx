import siteConfig from '@site-config'
import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './chrome.module.css'

const { business, nav = [], cta } = siteConfig

/**
 * A thin bar that floats over the photograph, and almost nothing in it.
 *
 * The other four skins all put a solid header at the top of the page, which
 * means the first thing a visitor meets is a strip of furniture with the
 * content starting underneath it. This skin's opening is a photograph in a
 * black void, and a solid bar would put a lid on it — so the bar is
 * translucent, blurred, and the hero runs up underneath it.
 *
 * `backdrop-filter` rather than a solid fill because the ground here is
 * near-black and the photographs are near-black: a solid bar over them is a
 * visible seam, a blurred one is not. Where the filter is unsupported the
 * fallback below is a flat 88% ground, which is the same bar without the trick.
 */
export function Header() {
  return (
    <header className={styles.masthead}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          {business.logo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.brandMark} src={business.logo} alt={business.name} />
              {business.descriptor ? (
                <span className={styles.brandSub}>{business.descriptor}</span>
              ) : null}
            </>
          ) : (
            <span className={styles.brandName}>{business.name}</span>
          )}
        </Link>

        {nav.length > 0 || cta ? (
          <nav className={styles.nav} aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
            {/*
             * The one saturated thing above the fold, and it is a filled
             * control rather than coloured text — the brand magenta measures
             * 4.40:1 on this ground and cannot legally be type, but it carries
             * a dark label at 4.67:1 all day. Which is the contract doing its
             * job: the colour is not banned, it is put where it works.
             */}
            {cta ? (
              <Link href={cta.href} className={styles.navCta}>
                {cta.label}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </header>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  const hours = business.hours ?? []

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.footerTop}>
          {business.logo ? (
            <div className={styles.footerBrand}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.footerMark} src={business.logo} alt={business.name} />
              {business.descriptor ? (
                <p className={styles.footerSub}>{business.descriptor}</p>
              ) : null}
            </div>
          ) : (
            <p className={styles.footerName}>{business.name}</p>
          )}
          {business.tagline ? <p className={styles.footerTagline}>{business.tagline}</p> : null}
        </div>

        <div className={styles.facts}>
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
