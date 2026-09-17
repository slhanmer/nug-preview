import type { ComponentType, ReactNode } from 'react'

import type { BlockData, CoreBlock } from '@/blocks/core'

/**
 * A renderer draws one block. It receives the block's CMS data and nothing
 * else — no page context, no siblings — so a block is always independently
 * renderable and can be reordered freely by a client.
 */
export type BlockRenderer = ComponentType<{ block: BlockData }>

/**
 * Page-level chrome. This is where skins diverge most: a venue's header is not
 * a trade's header, and the rhythm between sections is a large part of why two
 * skins do not look related.
 */
export type SkinChrome = {
  Header: ComponentType
  Footer: ComponentType
  /** Wraps the whole page — owns section rhythm and any scroll behaviour. */
  Page: ComponentType<{ children: ReactNode }>
}

/**
 * What a skin can draw, as DATA. No renderers, no React, no stylesheet.
 *
 * payload.config.ts derives its block set from this rather than from the
 * manifest, because the config is loaded by plain Node for the CLI, migrations
 * and seeds. Reaching the manifest from there pulls in components and their
 * CSS, and Node cannot import a stylesheet — which broke `generate:types` the
 * moment a skin had one.
 *
 * Core blocks are not listed: every skin implements all nine by contract.
 */
export type SkinBlocks = {
  /** Must match the manifest's name and the registry key. */
  name: string
  /** Module blocks this skin can draw, keyed by module name. */
  modules?: Record<string, readonly string[]>
}

export type SkinManifest = {
  /** Must match the key this skin is registered under. Asserted by skin:check. */
  name: string
  /** Shown in the studio and the admin. */
  label: string
  description: string

  /*
   * Every core block, exhaustively. This is a mapped type over CoreBlock, so
   * omitting one is a COMPILE error rather than a blank space on a live site.
   */
  core: { [K in CoreBlock]: BlockRenderer }

  /**
   * Renderers for module blocks this skin supports, keyed by module then block.
   * A module enabled in site.config whose blocks are missing here is a build
   * failure, caught by skin:check.
   */
  modules?: Record<string, Record<string, BlockRenderer>>

  chrome: SkinChrome
}

/** Helper so a skin file gets full checking without restating the type. */
export function defineSkin(manifest: SkinManifest): SkinManifest {
  return manifest
}

/** The data-only half. Kept free of anything a bundler would have to resolve. */
export function defineSkinBlocks(blocks: SkinBlocks): SkinBlocks {
  return blocks
}
