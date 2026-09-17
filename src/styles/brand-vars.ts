import type { CSSProperties } from 'react'

import { deriveGrounds, hexToOklch, type Oklch } from '@/lib/brand'
import type { SiteConfig } from '@/site-config'

/*
 * site.config brand inputs, expressed as the CSS custom properties tokens.css
 * derives from. Set on <html>, which IS :root, so the whole ladder re-resolves
 * against the client's colours rather than the defaults in the stylesheet.
 *
 * The derivation and the clamp bounds here must stay identical to the Palette
 * studio's. The studio is what a client signs off; a difference here ships a
 * site that is not the one they approved.
 */

const GROUND_L_MIN = 0.03
const GROUND_L_MAX = 0.99

function parse(hex: string, field: string): Oklch {
  const colour = hexToOklch(hex)
  if (!colour) {
    throw new Error(`site.config brand.${field} must be a hex colour. Got "${hex}".`)
  }
  return colour
}

function nudged({ l, c, h }: Oklch, by: number): Oklch {
  return { l: Math.min(GROUND_L_MAX, Math.max(GROUND_L_MIN, l + by)), c, h }
}

function vars(prefix: string, { l, c, h }: Oklch): Record<string, string> {
  return {
    [`${prefix}-l`]: l.toFixed(4),
    [`${prefix}-c`]: c.toFixed(4),
    [`${prefix}-h`]: h.toFixed(2),
  }
}

export function brandVars(brand: SiteConfig['brand']): CSSProperties {
  const primary = parse(brand.primary, 'primary')
  const secondary = parse(brand.secondary, 'secondary')
  const third = brand.third ? parse(brand.third, 'third') : null
  const grounds = deriveGrounds(primary, secondary, third, brand.groundTint)

  /*
   * An explicit ground replaces the derived one for the theme in force, and
   * takes NO nudge: the hex is the answer, not a starting point. The other
   * theme still derives, so a site pinned to light keeps a sane dark ground if
   * it is ever unpinned.
   */
  const stated = brand.ground ? parse(brand.ground, 'ground') : null
  const isDark = brand.theme === 'dark'
  const light = stated && !isDark ? stated : nudged(grounds.light, brand.groundNudge)
  const dark = stated && isDark ? stated : nudged(grounds.dark, brand.groundNudge)

  return {
    ...vars('--brand', primary),
    ...vars('--accent', secondary),
    /*
     * The third colour reaches CSS too, not just deriveGrounds — but ONLY when
     * there is one.
     *
     * It used to fall back to the secondary here, which looked harmless and
     * was not: `--action` is built from the third, so every two-colour site
     * silently got a call-to-action colour that was not its fill, and a skin
     * wiring a button to `--action` changed those sites without anyone asking.
     * The fallback now lives in tokens.css and resolves to the FILL, so a
     * two-colour site draws exactly what it drew before and a third colour is
     * the only thing that moves it.
     */
    ...(third ? vars('--third', third) : {}),
    ...vars('--ground-light', light),
    ...vars('--ground-dark', dark),
  } as CSSProperties
}
