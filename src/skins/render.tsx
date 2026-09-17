import type { BlockData } from '@/blocks/core'

import type { BlockRenderer, SkinManifest } from './types'

/*
 * A block with no renderer throws. It does not render nothing.
 *
 * Once pages are statically generated this throws during `next build`, so a
 * missing renderer is a failed deploy rather than a hole in a live client
 * site. That is what makes a skin change a migration and not a config flip.
 */
export function resolveRenderer(skin: SkinManifest, blockType: string): BlockRenderer {
  const core: Record<string, BlockRenderer | undefined> = skin.core
  const fromCore = core[blockType]
  if (fromCore) return fromCore

  for (const blocks of Object.values(skin.modules ?? {})) {
    const fromModule = blocks[blockType]
    if (fromModule) return fromModule
  }

  throw new Error(
    `Skin "${skin.name}" has no renderer for block "${blockType}". ` +
      `Run pnpm skin:check before switching skins.`,
  )
}

export function RenderBlocks({ skin, blocks }: { skin: SkinManifest; blocks: BlockData[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        const Renderer = resolveRenderer(skin, block.blockType)
        return <Renderer key={block.id ?? `${block.blockType}-${i}`} block={block} />
      })}
    </>
  )
}
