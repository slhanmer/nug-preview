import type { ModuleData } from './types'

/*
 * The module registry. Lazy, for the same reason skins are: a client build
 * ships the modules that site enables and nothing else.
 */
export const MODULES = {
  menu: () => import('./menu'),
  commerce: () => import('./commerce'),
} satisfies Record<string, () => Promise<{ default: ModuleData }>>

export type ModuleName = keyof typeof MODULES

export const MODULE_NAMES = Object.keys(MODULES) as ModuleName[]

export function isModuleName(name: string): name is ModuleName {
  return name in MODULES
}

export async function loadModule(name: ModuleName): Promise<ModuleData> {
  const loader = MODULES[name]
  if (!loader) {
    throw new Error(
      `Unknown module "${name}". Registered: ${MODULE_NAMES.join(', ')}. ` +
        `A module must be added to src/modules/registry.ts to be enabled.`,
    )
  }
  return (await loader()).default
}

/** Every enabled module, in the order site.config lists them. */
export async function loadModules(names: string[]): Promise<ModuleData[]> {
  const enabled = names.filter(isModuleName)
  return Promise.all(enabled.map(loadModule))
}
