import Link from 'next/link'

import type { BlockData } from '@/blocks/core'
import type { Menu as MenuDoc, MenuBlock } from '@/payload-types'

import styles from './menu.module.css'

/*
 * Uppercased in CSS, not here — these are the codes the kitchen writes, and a
 * venue that has bothered to code every dish deserves them printed the way it
 * writes them rather than expanded into sentences that would double the width
 * of every line.
 */
const TAGS: Record<string, string> = {
  v: 'v',
  vg: 'vg',
  gf: 'gf',
  gfo: 'gfo',
  df: 'df',
  n: 'nuts',
  nf: 'nf',
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
          <span className={styles.tick} aria-hidden="true" />
          <h2 className={styles.heading}>{heading || doc.title}</h2>
          {doc.standfirst ? <p className={styles.standfirst}>{doc.standfirst}</p> : null}
        </header>

        <div className={styles.groups}>
          {sections.map((section, s) => (
            <div key={section.id ?? s} className={styles.group}>
              <h3 className={styles.groupHeading}>{section.heading}</h3>
              {section.note ? <p className={styles.groupNote}>{section.note}</p> : null}
              <ul className={styles.items}>
                {(section.items ?? []).map((item, i) => {
                  if (item.hidden) return null
                  const tags = (item.dietary ?? []).map((t) => TAGS[t] ?? t).join(' ')
                  return (
                    <li key={item.id ?? i} className={styles.item}>
                      <div className={styles.itemHead}>
                        <span className={styles.itemName}>{item.name}</span>
                        {/*
                         * The leader only exists to carry the eye to a price.
                         * A sake list has no prices on it and a row of dots
                         * running to nothing reads as a missing value.
                         */}
                        {item.price ? (
                          <>
                            <span className={styles.rule} aria-hidden="true" />
                            <span className={styles.price}>{item.price}</span>
                          </>
                        ) : null}
                      </div>
                      {item.description ? <p className={styles.desc}>{item.description}</p> : null}
                      {/*
                       * Under the dish rather than beside the name. Beside it,
                       * a three-code run pushes the leader dots into the price
                       * on any dish with a long name — and these codes are the
                       * reason this menu is worth putting on a page at all, so
                       * they are not going somewhere they will be truncated.
                       */}
                      {tags ? <p className={styles.tags}>{tags}</p> : null}
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
