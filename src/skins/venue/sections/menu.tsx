import Link from 'next/link'

import type { BlockData } from '@/blocks/core'
import type { Menu as MenuDoc, MenuBlock } from '@/payload-types'

import styles from './menu.module.css'

const TAGS: Record<string, string> = {
  v: 'v',
  vg: 'vg',
  gf: 'gf',
  gfo: 'gfo',
  df: 'df',
  n: 'nuts',
  spicy: 'spicy',
}

export function Menu({ block }: { block: BlockData }) {
  const { menu, heading, showPrintLink } = block as MenuBlock
  const doc = typeof menu === 'object' ? (menu as MenuDoc) : null
  if (!doc) return null

  const sections = doc.sections ?? []

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading || doc.title}</h2>
          {doc.standfirst ? <p className={styles.standfirst}>{doc.standfirst}</p> : null}
        </header>

        {/* A wrapper the courses can be columned inside — the head and the
            footnote stay full width, so they cannot be in it. */}
        <div className={styles.groups}>
          {sections.map((section, s) => (
          <div key={section.id ?? s} className={styles.group}>
            <h3 className={styles.groupHeading}>{section.heading}</h3>
            {section.note ? <p className={styles.groupNote}>{section.note}</p> : null}
            <ul className={styles.items}>
              {(section.items ?? []).map((item, i) => {
                if (item.hidden) return null
                const tags = (item.dietary ?? []).map((t) => TAGS[t] ?? t).join(' · ')
                return (
                  <li key={item.id ?? i} className={styles.item}>
                    <div className={styles.itemHead}>
                      <span className={styles.itemName}>{item.name}</span>
                      {tags ? <span className={styles.tags}>{tags}</span> : null}
                      {item.price ? (
                        <>
                          <span className={styles.rule} aria-hidden="true" />
                          <span className={styles.price}>{item.price}</span>
                        </>
                      ) : null}
                    </div>
                    {item.description ? <p className={styles.desc}>{item.description}</p> : null}
                  </li>
                )
              })}
            </ul>
          </div>
          ))}
        </div>

        {doc.footnote ? <p className={styles.footnote}>{doc.footnote}</p> : null}

        {showPrintLink ? (
          <p className={styles.print}>
            <Link href="/menu/print">Print this menu</Link>
          </p>
        ) : null}
      </div>
    </section>
  )
}
