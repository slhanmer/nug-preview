import siteConfig from '@site-config'
import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './chrome.module.css'

const { business, nav = [], cta } = siteConfig

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.inner} ${styles.headerInner}`}>
        <nav className={styles.nav} aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className={styles.brand}>
          {business.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.brandMark} src={business.logo} alt="" />
          ) : null}
          {business.name}
        </Link>
        <div className={styles.actionWrap}>
          {cta ? (
            <Link href={cta.href} className={styles.action}>
              {cta.label}
            </Link>
          ) : null}
        </div>
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
        <p className={styles.footerName}>{business.name}</p>
        {business.tagline ? <p className={styles.footerTagline}>{business.tagline}</p> : null}

        {/* A brand with a door still has to say where the door is. */}
        {business.address || hours.length > 0 ? (
          <div className={styles.footerFacts}>
            {business.address ? <p>{business.address}</p> : null}
            {hours.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}

        <ul className={styles.footerLinks}>
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
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
