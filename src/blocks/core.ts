/*
 * The core block set.
 *
 * Every skin must implement all ten. That is what lets one set of content
 * render through three skins, which is the architecture test for this repo —
 * without a mandatory core there is nothing to compare.
 *
 * Module blocks are declared by their module and only exist on sites where
 * that module is enabled. They are NOT in this list.
 */
export const CORE_BLOCKS = [
  'hero',
  'prose',
  'featureGrid',
  'mediaSplit',
  'gallery',
  'quote',
  'logoStrip',
  'cta',
  'faq',
  'contact',
] as const

export type CoreBlock = (typeof CORE_BLOCKS)[number]

/**
 * A block as it arrives from the CMS — only the fields every block has.
 *
 * Deliberately NOT the generated union from payload-types. Those types are
 * generated per site from the active skin's block set, so a skin swap changes
 * them; anything in src/skins typed against them would stop compiling for
 * half the skins in the repo.
 *
 * No index signature either, or the generated types are not assignable to it.
 * A renderer narrows to its own generated type and reads fields from there.
 */
export type BlockData = {
  blockType: string
  id?: string | null
  blockName?: string | null
}

export function isCoreBlock(name: string): name is CoreBlock {
  return (CORE_BLOCKS as readonly string[]).includes(name)
}

/*
 * The gallery's `aspect` values as CSS ratios.
 *
 * Here rather than in blocks/gallery.ts because every skin needs it and that
 * file imports the access helpers — a renderer should not be dragging Payload's
 * access layer in behind it. core.ts has no imports at all, which is the
 * property that makes it safe for all four skins and for payload.config.ts.
 */
const ASPECT_RATIOS: Record<string, string> = {
  square: '1 / 1',
  portrait: '4 / 5',
  landscape: '3 / 2',
  wide: '16 / 9',
  native: 'auto',
}

/** Falls back to square: an unset value on old content should still crop. */
export function aspectRatio(name: string | null | undefined): string {
  return ASPECT_RATIOS[name ?? 'square'] ?? '1 / 1'
}
