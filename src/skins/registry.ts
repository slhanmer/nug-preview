import type { SkinBlocks, SkinManifest } from './types'

/*
 * The skin registry.
 *
 * A map of name to LAZY LOADER, not a build-time import. Two reasons:
 *
 * 1. A client build ships one skin. The others are dynamically imported and
 *    never reach the browser, so src/skins/ stays template-owned and merges
 *    cleanly while costing a client site nothing.
 * 2. The Palette studio and the three-skin architecture test both need to load
 *    several skins at runtime and compare them. A build-time constant cannot do
 *    that, so those two would have been separate work.
 */
export const SKINS = {
  base: () => import('./base'),
  venue: () => import('./venue'),
  service: () => import('./service'),
  brand: () => import('./brand'),
  journal: () => import('./journal'),
  noir: () => import('./noir'),
} satisfies Record<string, () => Promise<{ default: SkinManifest }>>

export type SkinName = keyof typeof SKINS

/*
 * The same skins, declared as data.
 *
 * Typed as Record<SkinName, ...> so a skin present in one map and absent from
 * the other is a compile error rather than a block set that silently differs
 * from what the site can draw.
 */
export const SKIN_BLOCKS = {
  base: () => import('./base/blocks'),
  venue: () => import('./venue/blocks'),
  service: () => import('./service/blocks'),
  brand: () => import('./brand/blocks'),
  journal: () => import('./journal/blocks'),
  noir: () => import('./noir/blocks'),
} satisfies Record<SkinName, () => Promise<{ default: SkinBlocks }>>

export const SKIN_NAMES = Object.keys(SKINS) as SkinName[]

export function isSkinName(name: string): name is SkinName {
  return name in SKINS
}

function unknownSkin(name: string): Error {
  return new Error(
    `Unknown skin "${name}". Registered: ${SKIN_NAMES.join(', ')}. ` +
      `A skin must be added to src/skins/registry.ts to be selectable.`,
  )
}

export async function loadSkin(name: SkinName): Promise<SkinManifest> {
  const loader = SKINS[name]
  if (!loader) throw unknownSkin(name)
  return (await loader()).default
}

/**
 * The half payload.config.ts is allowed to use. Importing loadSkin there pulls
 * renderers and their CSS into a plain Node process and breaks the CLI.
 */
export async function loadSkinBlocks(name: SkinName): Promise<SkinBlocks> {
  const loader = SKIN_BLOCKS[name]
  if (!loader) throw unknownSkin(name)
  return (await loader()).default
}
