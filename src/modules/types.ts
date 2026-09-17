import type { Block, CollectionConfig } from 'payload'

/**
 * What a module is, as DATA.
 *
 * A module owns a capability: its collections, its block schemas and its
 * routes. It knows nothing about skins, and a skin supplies renderers for a
 * module's blocks without the module ever referring to one.
 *
 * Everything here has to be importable by plain Node — payload.config.ts reads
 * it, and that config is loaded by the CLI, migrations and seed scripts. No
 * React, no stylesheets. Renderers live in skins; route components live in
 * src/app and import from the module's own client files.
 */
export type ModuleData = {
  /** Must match the registry key and the name in site.config.modules. */
  name: string
  label: string
  description: string

  /** Added to Payload when this module is enabled on a site. */
  collections?: CollectionConfig[]

  /**
   * Block schemas this module owns. A skin declares which of them it can draw;
   * the admin offers the intersection. Names must not collide with core blocks.
   */
  blocks?: Record<string, Block>

  /**
   * Routes this module expects to exist, for documentation and the
   * provisioning runbook. Next owns real routing — this list is not wiring.
   */
  routes?: string[]
}

export function defineModule(module: ModuleData): ModuleData {
  return module
}
