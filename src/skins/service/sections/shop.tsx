import type { BlockData } from '@/blocks/core'
import { Arrangement } from '@/components/layout'
import { BuyButton } from '@/modules/commerce/BuyButton'
import { formatMoney } from '@/modules/commerce/money'
import { asProduct, productImage, type ShopBlockData } from '@/modules/commerce/shape'

import styles from './sections.module.css'

/*
 * Narrowed to the MODULE's shape, not to a generated type.
 *
 * Every other renderer in this file's sibling narrows to `HeroBlock` and the
 * rest, which is fine — those are core blocks and always generated. A module
 * block is only generated on sites that enable the module, so importing
 * `ShopBlock` from payload-types would stop the service skin compiling on any
 * site without a shop.
 */
export function Shop({ block }: { block: BlockData }) {
  const { heading, intro, products, layout } = block as BlockData & ShopBlockData

  const items = (products ?? []).map(asProduct).filter((p) => p !== null)
  if (items.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.wide}>
        {heading || intro ? (
          <div className={styles.gridHead}>
            {heading ? (
              <h2 className={`${styles.heading} ${styles.gridHeading}`}>{heading}</h2>
            ) : null}
            {intro ? <p className={styles.lede}>{intro}</p> : null}
          </div>
        ) : null}

        <Arrangement layout={layout ?? 'grid'} min="16rem" gap="1.25rem">
          {items.map((product) => {
            const image = productImage(product)
            return (
              <article key={product.id} className={styles.product}>
                {image ? (
                  <div className={styles.productMedia}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={image.alt} />
                  </div>
                ) : null}

                <div className={styles.productBody}>
                  <h3 className={styles.productTitle}>{product.name}</h3>
                  {product.description ? (
                    <p className={styles.productText}>{product.description}</p>
                  ) : null}

                  <div className={styles.productFoot}>
                    <span className={styles.productPrice}>{formatMoney(product.price)}</span>
                    {product.available ? (
                      <BuyButton productId={String(product.id)} />
                    ) : (
                      <span className={styles.productSold}>Sold out</span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </Arrangement>
      </div>
    </section>
  )
}
