/*
 * Responsive sources for an upload.
 *
 * payload.config already generates thumb/card/wide for every image on upload —
 * and every skin then served `photo.url`, the ORIGINAL, to every viewport. A
 * phone at 412px was downloading the full-size file to paint it a third of the
 * width, which is most of what Lighthouse reports as "improve image delivery"
 * and most of a slow LCP on mobile. The derivatives were already on the row;
 * nothing was asking for them.
 *
 * Deliberately loose about its input. Module blocks may not import the
 * generated payload-types (those are per-site), so this takes the shape it
 * needs rather than the type, and a row that came back as a bare id just
 * produces no srcset.
 */

type SizeEntry = { url?: string | null; width?: number | null }

export type SizedImage = {
  url?: string | null
  width?: number | null
  sizes?: Record<string, SizeEntry | null | undefined> | null
}

/**
 * A `srcset` covering every generated width plus the original, or undefined
 * when there is nothing to choose between — a single candidate srcset is bytes
 * on the page that change no decision.
 */
export function srcSet(photo: SizedImage): string | undefined {
  const byWidth = new Map<number, string>()

  for (const entry of Object.values(photo.sizes ?? {})) {
    if (entry?.url && entry.width) byWidth.set(entry.width, entry.url)
  }
  /*
   * The original last, so it wins a tie: Payload skips a derivative wider than
   * the source, which leaves `wide` absent on a small upload and the original
   * as the only large candidate.
   */
  if (photo.url && photo.width) byWidth.set(photo.width, photo.url)

  if (byWidth.size < 2) return undefined

  return [...byWidth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([width, url]) => `${url} ${width}w`)
    .join(', ')
}

/*
 * How wide the image will actually be drawn, as the browser must know it
 * BEFORE layout — these are the one part of a srcset that cannot be derived
 * and has to be told. Wrong values here are worse than no srcset: too large
 * and it fetches more than it needed, too small and it paints a blurry one.
 */
export const SIZES = {
  /** Full-bleed: hero photographs and mark bands. */
  full: '100vw',
  /** Half the measure above the split breakpoint, full width below it. */
  half: '(min-width: 52rem) 50vw, 100vw',
  /** A gallery cell — four up on a wide page, two on a tablet, one on a phone. */
  cell: '(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw',
} as const
