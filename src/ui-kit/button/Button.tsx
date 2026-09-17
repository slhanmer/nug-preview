'use client'

import { type ButtonHTMLAttributes, forwardRef, type ReactNode,useCallback, useRef, useState } from 'react'

import { useSauceConfig } from '../provider'
import { Loader } from './Loader'

/**
 * Two colour lanes, each with a filled and an outlined form.
 *
 *   lane 1 — brand fill    `primary` (filled)  ·  `secondary` (outlined)
 *   lane 2 — the other one `cta`     (filled)
 *
 * A call to action is distinguished by being in a DIFFERENT COLOUR, not by
 * being a heavier version of primary. Under one lane the two can only differ by
 * decoration, and nobody reads decoration as meaning.
 *
 * The two lanes are exactly `--fill` and `--fill-alt` — the colour ladder
 * already selects one of the client's two brand colours per theme and holds the
 * other in reserve, with both label polarities measured.
 *
 * `danger` and `success` are status lanes, outside the pairing and outside the
 * brand. `text-only` is bare.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'cta' | 'danger' | 'success' | 'text-only'

/** Control height. Every step keeps a 44×44 hit area however tall it looks. */
export type ButtonHeight = 'sm' | 'md' | 'lg'

/** Control width. `full` fills the container. */
export type ButtonWidth = 'sm' | 'md' | 'lg' | 'full'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  /** @default 'primary' */
  variant?: ButtonVariant
  /** @default 'md' */
  height?: ButtonHeight
  /** @default 'md' — content width. `full` fills the container. */
  width?: ButtonWidth
  /** @default 'button' — never submits a form unless you ask it to. */
  type?: 'button' | 'submit' | 'reset'
  /** Rendered beside the label, or alone when there is no label. */
  icon?: ReactNode
  /** @default 'right' */
  iconPosition?: 'left' | 'right'
  /**
   * Shows the loader and disables the button. Set this for work the button did
   * not start itself; work it did start is handled automatically — an async
   * `onClick` locks the button until its promise settles.
   */
  loading?: boolean
  /**
   * Milliseconds during which repeat clicks are ignored, leading edge. Falls
   * back to `buttonDebounceDelay` on the provider, then to 400.
   */
  debounceDelay?: number
}

/**
 * The primary action control.
 *
 * Double-submit is handled twice, deliberately: repeat clicks inside
 * `debounceDelay` are dropped on the leading edge, and an async `onClick` locks
 * the button until its promise settles. The first covers impatient clicking,
 * the second covers slow networks.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    height = 'md',
    width = 'md',
    type = 'button',
    icon,
    iconPosition = 'right',
    loading = false,
    debounceDelay,
    onClick,
    disabled = false,
    className = '',
    style,
    children,
    ...rest
  },
  ref,
) {
  const [busy, setBusy] = useState(false)
  const lastFired = useRef(0)

  const { buttonDebounceDelay } = useSauceConfig()
  const resolvedDebounce = debounceDelay ?? buttonDebounceDelay ?? 400

  const isIconOnly = icon != null && (children == null || children === '')
  const isBusy = loading || busy
  const isDisabled = disabled || isBusy

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled || !onClick) return

      // Leading edge. A trailing debounce would delay every first click by the
      // full window, which reads as an unresponsive button rather than as
      // protection.
      const now = Date.now()
      if (now - lastFired.current < resolvedDebounce) return
      lastFired.current = now

      const result = onClick(event) as unknown
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        setBusy(true)
        void (result as Promise<unknown>).finally(() => setBusy(false))
      }
    },
    [isDisabled, onClick, resolvedDebounce],
  )

  const classes = [
    'sauce-btn',
    `sauce-btn--${variant}`,
    `sauce-btn--h-${height}`,
    !isIconOnly && `sauce-btn--w-${width}`,
    isIconOnly && 'sauce-btn--icon-only',
    isBusy && 'is-busy',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classes}
      style={style}
      disabled={isDisabled}
      aria-busy={isBusy || undefined}
      onClick={handleClick}
    >
      {/*
        The loader takes the icon's slot rather than covering the label. Hiding
        the label removes it from the accessibility tree, and the button becomes
        unnamed the instant it starts working — by `visibility: hidden` or
        `display: none` alike. Occupying the icon slot also keeps the width
        stable, so the layout does not shift under the cursor mid-click.
      */}
      {isBusy ? (
        <span className="sauce-btn__icon sauce-btn__icon--loading">
          <Loader size="sm" />
        </span>
      ) : (
        icon &&
        iconPosition === 'left' && (
          <span className="sauce-btn__icon" aria-hidden="true">
            {icon}
          </span>
        )
      )}

      {children != null && children !== '' && <span className="sauce-btn__label">{children}</span>}

      {!isBusy && icon && iconPosition === 'right' && (
        <span className="sauce-btn__icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  )
})
