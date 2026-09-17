'use client'

export type LoaderSize = 'sm' | 'md' | 'lg'

export type LoaderProps = {
  /** @default 'md' */
  size?: LoaderSize
  /** Cover the viewport with a scrim and centre the loader in it. */
  fullPage?: boolean
  /**
   * Accessible name. Omit inside a control that already announces itself as
   * busy — a second announcement is noise, not help.
   */
  label?: string
  className?: string
}

/**
 * Three dots cycling out, flat and in, each on its own period so the row is
 * never in lockstep.
 *
 * Scale and opacity carry it, with a bevel as a secondary cue — that ordering
 * is the second attempt. Carrying the whole animation on the carve alone works
 * at 40px and dies at 14px: a 2px rim on a 14px dot has almost no dynamic
 * range, and a flat colour cannot be lit brighter in one direction or shadowed
 * darker in the other. It read as a flicker rather than a press.
 *
 * The dots are `currentColor`, so the loader takes the label colour of whatever
 * contains it and the carve values are alpha only. Any brand hue, either
 * theme, no configuration.
 */
export function Loader({ size = 'md', fullPage = false, label, className = '' }: LoaderProps) {
  // A page-level loader interrupts everything, so it always announces itself —
  // a silent full-screen block is indistinguishable from a hung application.
  const name = label ?? (fullPage ? 'Loading' : undefined)

  const loader = (
    <span
      className={`sauce-loader sauce-loader--${fullPage ? 'lg' : size} ${className}`.trim()}
      role={name ? 'status' : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
    >
      <span className="sauce-loader__cell" />
      <span className="sauce-loader__cell" />
      <span className="sauce-loader__cell" />
    </span>
  )

  if (!fullPage) return loader

  return (
    <div className="sauce-loader-page" role="presentation">
      {loader}
    </div>
  )
}
