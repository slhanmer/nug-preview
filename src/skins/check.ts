import { BLOCK_SCHEMAS } from '@/blocks'
import { CORE_BLOCKS } from '@/blocks/core'
import { loadModule, MODULE_NAMES } from '@/modules/registry'

import { loadSkin, loadSkinBlocks, SKIN_NAMES } from './registry'

export type SkinProblem = { skin: string; problem: string }

/**
 * Structural checks that types cannot make.
 *
 * The mapped type on SkinManifest['core'] already makes a missing renderer a
 * compile error, so this catches what survives compilation: a manifest whose
 * name disagrees with its registry key, chrome that is absent, renderers that
 * are declared but are not functions, and — since the seam was split — a
 * skin's data declaration disagreeing with its renderers.
 */
export async function checkSkins(): Promise<SkinProblem[]> {
  const problems: SkinProblem[] = []

  for (const name of SKIN_NAMES) {
    const skin = await loadSkin(name)
    const declared = await loadSkinBlocks(name)

    if (skin.name !== name) {
      problems.push({
        skin: name,
        problem: `manifest name is "${skin.name}" but it is registered as "${name}". Config selects by registry key, so these must match.`,
      })
    }

    if (declared.name !== name) {
      problems.push({
        skin: name,
        problem: `blocks.ts name is "${declared.name}" but it is registered as "${name}".`,
      })
    }

    for (const block of CORE_BLOCKS) {
      if (typeof skin.core[block] !== 'function') {
        problems.push({ skin: name, problem: `core block "${block}" has no renderer` })
      }
    }

    for (const [moduleName, blocks] of Object.entries(skin.modules ?? {})) {
      for (const [blockName, renderer] of Object.entries(blocks)) {
        if (typeof renderer !== 'function') {
          problems.push({
            skin: name,
            problem: `module "${moduleName}" block "${blockName}" has no renderer`,
          })
        }
        if (!(declared.modules?.[moduleName] ?? []).includes(blockName)) {
          problems.push({
            skin: name,
            problem: `manifest renders module "${moduleName}" block "${blockName}" but blocks.ts does not declare it, so Payload will never offer it`,
          })
        }
      }
    }

    for (const [moduleName, blockNames] of Object.entries(declared.modules ?? {})) {
      for (const blockName of blockNames) {
        if (typeof skin.modules?.[moduleName]?.[blockName] !== 'function') {
          problems.push({
            skin: name,
            problem: `blocks.ts declares module "${moduleName}" block "${blockName}" but the manifest has no renderer for it`,
          })
        }
      }
    }

    for (const part of ['Header', 'Footer', 'Page'] as const) {
      if (typeof skin.chrome?.[part] !== 'function') {
        problems.push({ skin: name, problem: `chrome is missing ${part}` })
      }
    }
  }

  return problems
}

export type SchemaGap = {
  block: string
  gap: 'no-schema' | 'no-renderer'
}

/**
 * Where the two halves of the seam disagree.
 *
 * `no-schema` — a skin can draw it but Payload has no field definition, so it
 * is silently absent from the admin. Expected while the core set is being
 * filled in; not acceptable once it is.
 *
 * `no-renderer` — Payload would offer it and the page would render nothing.
 * That one is always a bug.
 */
export async function schemaGaps(): Promise<SchemaGap[]> {
  const gaps: SchemaGap[] = []
  const renderable = new Set<string>()

  /*
   * Core schemas plus every module's, whether or not a given site enables it.
   * This report is about the repo being coherent, not about one site's config.
   */
  const known = new Set<string>(Object.keys(BLOCK_SCHEMAS))
  for (const name of MODULE_NAMES) {
    const mod = await loadModule(name)
    Object.keys(mod.blocks ?? {}).forEach((b) => known.add(b))
  }

  for (const name of SKIN_NAMES) {
    const skin = await loadSkin(name)
    Object.keys(skin.core).forEach((b) => renderable.add(b))
    for (const blocks of Object.values(skin.modules ?? {})) {
      Object.keys(blocks).forEach((b) => renderable.add(b))
    }
  }

  for (const block of renderable) {
    if (!known.has(block)) gaps.push({ block, gap: 'no-schema' })
  }
  for (const block of known) {
    if (!renderable.has(block)) gaps.push({ block, gap: 'no-renderer' })
  }

  return gaps
}

/**
 * Which of a site's content blocks the active skin cannot draw. Run before
 * switching a live site's skin — re-skinning is a migration, not a config flip.
 */
export async function orphanedBlocks(
  skinName: string,
  usedBlockTypes: string[],
  enabledModules: string[] = [],
): Promise<string[]> {
  const skin = await loadSkin(skinName as never)
  const drawable = new Set<string>(Object.keys(skin.core))
  for (const m of enabledModules) {
    for (const b of Object.keys(skin.modules?.[m] ?? {})) drawable.add(b)
  }
  return usedBlockTypes.filter((t) => !drawable.has(t))
}
