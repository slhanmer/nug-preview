import Link from 'next/link'

import type { BlockData } from '@/blocks/core'
import type { Menu as MenuDoc, MenuBlock } from '@/payload-types'

import styles from './sections.module.css'

const TAGS: Record<string, string> = {
  v: 'v',
  vg: 'vg',
  gf: 'gf',
  gfo: 'gfo',
  df: 'df',
  n: 'nuts',
  nf: 'nut free',
  spicy: 'spicy',
}

/**
 * The same menu block again, as a range.
 *
 * A roaster's bag sizes, a distillery's bottles, a brewery's core range — all
 * a list of named things with prices, which is what the block already is. Third
 * skin, third completely different drawing of one schema.
 */
export function Menu({ block }: { block: BlockData }) {
  const { menu, heading, showPrintLink } = block as MenuBlock
  const doc = typeof menu === 'object' ? (menu as MenuDoc) : null
  if (!doc) return null

  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={`${styles.heading} ${styles.listHeading}`}>{heading || doc.title}</h2>

        <div className={styles.list}>
          {(doc.sections ?? []).map((section, s) => (
            <div key={section.id ?? s} className={styles.listGroup}>
              <p className={styles.listGroupHeading}>{section.heading}</p>
              {section.note ? <p className={styles.listGroupNote}>{section.note}</p> : null}
              {(section.items ?? []).map((item, i) => {
                if (item.hidden) return null
                const tags = (item.dietary ?? []).map((t) => TAGS[t] ?? t).join(' · ')
                return (
                  <div key={item.id ?? i} className={styles.listRow}>
                    <div>
                      <span className={styles.listName}>{item.name}</span>
                      {tags ? <span className={styles.cardIndex}> {tags}</span> : null}
                      {item.description ? (
                        <p className={styles.listDesc}>{item.description}</p>
                      ) : null}
                    </div>
                    {item.price ? <span className={styles.listValue}>{item.price}</span> : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {doc.footnote ? <p className={styles.contactNote}>{doc.footnote}</p> : null}

        {showPrintLink ? (
          <p className={styles.contactNote}>
            <Link href="/menu/print">Print this list</Link>
          </p>
        ) : null}
      </div>
    </section>
  )
}
