import siteConfig from '@site-config'
import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './chrome.module.css'

const { business, nav = [], cta } = siteConfig

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function Header() {
  return (
    <>
      {business.phone ? (
        <div className={styles.utility}>
          <div className={`${styles.inner} ${styles.utilityInner}`}>
            <span>
              Call <a href={telHref(business.phone)}>{business.phone}</a>
            </span>
            {business.tagline ? <span className={styles.utilityNote}>{business.tagline}</span> : null}
          </div>
        </div>
      ) : null}

      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.headerInner}`}>
          {/*
            A wordmark already says the name, so setting the name beside it is
            a stutter — "CHOP/SPOT The Chop Spot Barbershop". With a logo the
            lockup carries the descriptor instead, which is the one thing the
            mark cannot say. The name stays in the accessible tree, because a
            link whose only content is a decorative image has no name at all.
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
    </>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  const hours = business.hours ?? []

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.footerGrid}>
          <div>
            <p className={styles.footerName}>{business.name}</p>
            {business.tagline ? <p className={styles.footerTagline}>{business.tagline}</p> : null}
          </div>

          <div>
            <p className={styles.footerHeading}>Contact</p>
            <ul className={styles.footerList}>
              {business.phone ? (
                <li>
                  <a href={telHref(business.phone)}>{business.phone}</a>
                </li>
              ) : null}
              {business.email ? (
                <li>
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                </li>
              ) : null}
              {business.address ? <li>{business.address}</li> : null}
            </ul>
          </div>

          {hours.length > 0 ? (
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

export function Page({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>
}
