import type { Block } from 'payload'

import { CORE_BLOCKS } from '@/blocks/core'
import { loadModules } from '@/modules/registry'
import type { ModuleData } from '@/modules/types'
import type { SiteConfig } from '@/site-config'
import { loadSkinBlocks } from '@/skins/registry'
import type { SkinBlocks } from '@/skins/types'

import { BLOCK_SCHEMAS } from './index'

type BlocksLoader = (name: string) => Promise<SkinBlocks>
type ModulesLoader = (names: string[]) => Promise<ModuleData[]>

/**
 * The CMS/skin seam.
 *
 * Payload is handed only the blocks this site can actually draw: the nine core
 * blocks every skin implements by contract, plus module blocks for the modules
 * this site enables and this skin declares a renderer for.
 *
 * It reads DATA on both sides — the skin's declaration and the module's
 * schemas — never a manifest. payload.config.ts is loaded by plain Node for the
 * CLI, migrations and seeds, and a manifest drags in React and stylesheets.
 */
export function blockNamesForSite(config: SiteConfig, skin: SkinBlocks): string[] {
  const names = new Set<string>(CORE_BLOCKS)
  for (const enabled of config.modules) {
    for (const name of skin.modules?.[enabled] ?? []) names.add(name)
  }
  return [...names]
}

/**
 * A block declared by a skin but owned by no enabled module, or owned but with
 * no schema, is skipped here and reported by skin:check — so the set can grow
 * without the admin offering a field group that renders as nothing.
 *
 * Both loaders are injectable so the module path can be tested in isolation.
 */
export async function blocksForSite(
  config: SiteConfig,
  load: BlocksLoader = loadSkinBlocks as BlocksLoader,
  loadMods: ModulesLoader = loadModules,
): Promise<Block[]> {
  const skin = await load(config.skin)
  const modules = await loadMods(config.modules)

  const schemas: Record<string, Block> = { ...BLOCK_SCHEMAS }
  for (const mod of modules) Object.assign(schemas, mod.blocks ?? {})

  return blockNamesForSite(config, skin)
    .filter((name) => name in schemas)
    .map((name) => schemas[name] as Block)
}

/** Collections contributed by the modules this site enables. */
export async function collectionsForSite(
  config: SiteConfig,
  loadMods: ModulesLoader = loadModules,
) {
  const modules = await loadMods(config.modules)
  return modules.flatMap((mod) => mod.collections ?? [])
}
