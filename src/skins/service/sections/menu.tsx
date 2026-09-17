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
  spicy: 'spicy',
}

/**
 * A bare number is not a price.
 *
 * The field is free text because a price list has "POA" and "from 12.00" in it
 * as well as figures, so the symbol goes in front of the FIRST digit rather
 * than in front of the string, and a value with no digit is left alone. Doing
 * it here rather than in the data keeps the same menu document usable by the
 * venue skin, which sets its prices without one.
 */
function money(value: string) {
  const at = value.search(/\d/)
  if (at < 0 || value.includes('$')) return value
  return (
    <>
      {value.slice(0, at)}
      <span>$</span>
      {value.slice(at)}
    </>
  )
}

/**
 * The same menu block the venue draws, as a price list.
 *
 * A barber, a physio and a dog groomer all have this and none of them call it a
 * menu. The block is one thing; what it looks like is the skin's business, and
 * this is the clearest demonstration of the two axes in the repo.
 */
export function Menu({ block }: { block: BlockData }) {
  const { menu, heading, showPrintLink } = block as MenuBlock
  const doc = typeof menu === 'object' ? (menu as MenuDoc) : null
  if (!doc) return null

  return (
    <section className={styles.section}>
      <div className={styles.wide}>
        <div className={styles.gridHead}>
          <h2 className={`${styles.heading} ${styles.gridHeading}`}>{heading || doc.title}</h2>
          {doc.standfirst ? <p className={styles.lede}>{doc.standfirst}</p> : null}
        </div>

        <div className={styles.prices}>
          {(doc.sections ?? []).map((section, s) => (
            <div key={section.id ?? s} className={styles.priceGroup}>
              <h3 className={styles.priceGroupHeading}>{section.heading}</h3>
              {(section.items ?? []).map((item, i) => {
                if (item.hidden) return null
                const tags = (item.dietary ?? []).map((t) => TAGS[t] ?? t).join(' · ')
                return (
                  <div key={item.id ?? i} className={styles.priceRow}>
                    <div>
                      <span className={styles.priceName}>{item.name}</span>
                      {tags ? <span className={styles.priceTags}>{tags}</span> : null}
                      {item.description ? <p className={styles.priceDesc}>{item.description}</p> : null}
                    </div>
                    {item.price ? (
                      <span className={styles.priceValue}>{money(item.price)}</span>
                    ) : null}
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
