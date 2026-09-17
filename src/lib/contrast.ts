/*
 * WCAG 2.2 contrast, measured rather than assumed.
 *
 * Per ADR 0001: equal OKLCH lightness does not mean equal WCAG contrast,
 * because WCAG computes on sRGB relative luminance. So ratios are read off the
 * colour the browser actually paints, not calculated from the ladder.
 *
 * Canvas is the trick — it parses any CSS colour and hands back sRGB bytes, so
 * oklch(), color-mix() and custom properties all resolve without a colour
 * library.
 */

export type Rgb = [number, number, number]

export function cssColorToRgb(color: string): Rgb | null {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0] ?? 0, d[1] ?? 0, d[2] ?? 0]
}

function linearise(byte: number): number {
  const s = byte / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b)
}

export function contrastRatio(foreground: string, background: string): number | null {
  const fg = cssColorToRgb(foreground)
  const bg = cssColorToRgb(background)
  if (!fg || !bg) return null
  const a = relativeLuminance(fg)
  const b = relativeLuminance(bg)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

export function resolveToken(name: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim()
}
