import type { CSSProperties, ReactNode } from 'react'

import styles from './layout.module.css'

/**
 * How a set of things is arranged. Nothing about what they look like.
 *
 * `grid` and `columns` are the same primitive: `grid` fits as many as will fit,
 * `columns` holds a count. Kept as separate names because that is the choice a
 * person actually makes.
 *
 * `fade` is not an arrangement, it is a gallery treatment — one frame, the
 * photographs crossfading through it. It is in this list because the gallery
 * block offers it and every skin passes the block's value straight through, so
 * leaving it out made the type error the fallback its own comment promised.
 * A skin that implements it handles it before reaching here; a skin that does
 * not gets the grid, and every photograph is still on the page.
 */
export const LAYOUTS = ['grid', 'columns', 'bento', 'rail', 'stack', 'fade'] as const
export type LayoutName = (typeof LAYOUTS)[number]

export type ArrangementProps = {
  children: ReactNode
  layout?: LayoutName | null
  /** Smallest a column may get before it reflows. Ignored by bento and stack. */
  min?: string
  /** Fixed column count for `columns`. */
  count?: number
  gap?: string
  className?: string
}

export function Arrangement({
  children,
  layout = 'grid',
  min,
  count,
  gap,
  className,
}: ArrangementProps) {
  const style = {
    ...(min ? { '--layout-min': min } : {}),
    ...(count ? { '--layout-count': count } : {}),
    ...(gap ? { '--layout-gap': gap } : {}),
  } as CSSProperties

  /*
   * `satisfies`, not an annotation.
   *
   * A CSS Module's type is an index signature, so under
   * `noUncheckedIndexedAccess` every `styles.x` is `string | undefined` — a
   * typo in a class name is undefined at runtime, not a compile error. Typing
   * this map as `Record<LayoutName, string>` claimed otherwise and was simply
   * a lie the compiler eventually caught.
   *
   * The template-literal entry is why this went unnoticed: interpolation
   * swallows `undefined` happily, so only the four bare assignments failed.
   *
   * It is also what makes this map the enforcement: adding a name to LAYOUTS
   * without deciding what it draws will not compile.
   */
  const map = {
    grid: styles.columns,
    columns: `${styles.columns} ${styles.columnsFixed}`,
    bento: styles.bento,
    rail: styles.rail,
    stack: styles.stack,
    fade: styles.columns,
  } satisfies Record<LayoutName, string | undefined>

  const classes = [map[layout ?? 'grid'] ?? styles.columns, className].filter(Boolean).join(' ')

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}
