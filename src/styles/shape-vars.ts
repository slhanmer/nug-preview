import type { CSSProperties } from 'react'

import type { SiteStyle } from '@/site-config'

/**
 * The shape dials as CSS custom properties, set alongside the brand inputs.
 *
 * Only what the site actually overrides is emitted — an unset dial falls
 * through to the default in tokens.css rather than being restated here, so
 * there is one place to change a default.
 */
export function shapeVars(style: SiteStyle | undefined): CSSProperties {
  if (!style) return {}

  const vars: Record<string, string> = {}
  if (style.typeBase) vars['--type-base'] = style.typeBase
  if (style.typeRatio !== undefined) vars['--type-ratio'] = String(style.typeRatio)
  if (style.density !== undefined) vars['--density'] = String(style.density)
  if (style.radius !== undefined) vars['--radius-base'] = style.radius

  return vars as CSSProperties
}
