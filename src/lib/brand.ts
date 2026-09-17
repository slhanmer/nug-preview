/*
 * Turning a client's brand palette into token inputs.
 *
 * ADR 0001: brand colours are the input, roles are derived, and where a colour
 * cannot carry its duty the system moves it to the nearest compliant value AND
 * REPORTS WHAT IT CHANGED. This module is that step.
 *
 * REPORT, DO NOT MUTATE. An earlier version moved the client's colour
 * automatically. That was over-reach: this is bespoke work with a scoping
 * conversation attached, so a colour that cannot carry its duty is a sentence
 * said out loud, not a silent correction. fitFill computes the nearest value
 * that would work; whether to take it is a human decision.
 */

import { contrastRatio } from './contrast'

export type Oklch = { l: number; c: number; h: number }

export type FittedFill = {
  /** What the client gave us. */
  original: Oklch
  /** What the system will actually use. */
  used: Oklch
  /** Near-white or near-black label. */
  polarity: 'light' | 'dark'
  /** Measured contrast of the label on the used fill. */
  ratio: number
  /** Lightness moved by this much. Zero when the swatch was used untouched. */
  lightnessDelta: number
}

/* ---------- sRGB hex to OKLCH ------------------------------------------- */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  let h = m[1] as string
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

function linearise(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/** sRGB to OKLCH, via OKLab. Björn Ottosson's matrices. */
export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const [r, g, b] = rgb.map(linearise) as [number, number, number]

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const c = Math.sqrt(a * a + bb * bb)
  let h = (Math.atan2(bb, a) * 180) / Math.PI
  if (h < 0) h += 360

  return { l: L, c, h }
}

export function oklchToCss({ l, c, h }: Oklch): string {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`
}

function encode(v: number): number {
  const s = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  return Math.round(Math.max(0, Math.min(1, s)) * 255)
}

/**
 * OKLCH back to a hex string, so an adjusted colour can be handed back to the
 * client. Out-of-gamut values are clamped per channel, which is why a heavily
 * boosted chroma stops changing once it leaves sRGB.
 */
export function oklchToHex({ l, c, h }: Oklch): string {
  const rad = (h * Math.PI) / 180
  const a = c * Math.cos(rad)
  const b = c * Math.sin(rad)

  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3

  const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_

  return (
    '#' + [encode(r), encode(g), encode(bl)].map((v) => v.toString(16).padStart(2, '0')).join('')
  )
}

/* ---------- fitting a fill so its label can pass ------------------------- */

/*
 * These must match what tokens.css actually produces for --on-fill, which
 * clamps to pure 1 or pure 0. Testing advice against a near-black while the
 * stylesheet paints true black made fitFill report a dead band that does not
 * exist.
 */
const LIGHT_LABEL = 'oklch(1 0 0)'
const DARK_LABEL = 'oklch(0 0 0)'

function bestLabel(fill: Oklch): { polarity: 'light' | 'dark'; ratio: number } {
  const css = oklchToCss(fill)
  const light = contrastRatio(LIGHT_LABEL, css) ?? 0
  const dark = contrastRatio(DARK_LABEL, css) ?? 0
  return light >= dark ? { polarity: 'light', ratio: light } : { polarity: 'dark', ratio: dark }
}

/**
 * Finds the smallest lightness move that lets some label clear `required`.
 *
 * Searches outward from the client's own lightness in both directions and takes
 * whichever direction needs less movement, so the result stays as close to the
 * brand as the requirement allows.
 */
export function fitFill(original: Oklch, required = 4.5): FittedFill {
  const asGiven = bestLabel(original)
  if (asGiven.ratio >= required) {
    return { original, used: original, ...asGiven, lightnessDelta: 0 }
  }

  for (let step = 0.01; step <= 0.6; step += 0.01) {
    for (const dir of [-1, 1] as const) {
      const l = original.l + dir * step
      if (l < 0.05 || l > 0.98) continue
      const candidate: Oklch = { ...original, l }
      const label = bestLabel(candidate)
      if (label.ratio >= required) {
        return { original, used: candidate, ...label, lightnessDelta: dir * step }
      }
    }
  }

  // Nothing in range worked, which means chroma is the problem rather than
  // lightness. Return the best available and let the caller report it.
  return { original, used: original, ...asGiven, lightnessDelta: 0 }
}

/* ---------- suggesting grounds from a palette ---------------------------- */

/**
 * Proposes a light and a dark page ground from the brand palette.
 *
 * The heuristic is the one simonhanmer.com.au already uses: the light ground
 * takes the accent hue, the dark ground takes the brand hue, both at heavily
 * reduced chroma. Feeding it a purple brand and a chartreuse accent lands close
 * to that site's sage and aubergine without being told to.
 *
 * These are starting points to nudge, not answers.
 */
export function deriveGrounds(
  brand: Oklch,
  accent: Oklch,
  third?: Oklch | null,
  /**
   * How much of the brand to let into the background. 0 is a neutral white or
   * near-black; 1 is a full statement ground like simonhanmer.com.au.
   * Defaults low — most clients want a hint, not a sage page.
   */
  tint = 0.35,
): { light: Oklch; dark: Oklch } {
  const lightSource = third ?? accent
  const t = Math.max(0, Math.min(1, tint))
  return {
    light: { l: 0.985 - 0.035 * t, c: Math.min(0.04, lightSource.c * 0.3) * t, h: lightSource.h },
    dark: { l: 0.16 + 0.08 * t, c: Math.min(0.05, brand.c * 0.35) * t, h: brand.h },
  }
}
