import { CORE_BLOCKS } from '@/blocks/core'
import type { SiteConfig } from '@/site-config'
import type { SkinBlocks } from '@/skins/types'

import { blockNamesForSite, blocksForSite } from './for-site'

const skin: SkinBlocks = {
  name: 'test',
  modules: { demo: ['menu', 'hours'] },
}

const config = (modules: string[]): SiteConfig => ({
  key: 'test',
  skin: 'base',
  modules,
  brand: { primary: '#000000', secondary: '#ffffff', groundTint: 0.35, groundNudge: 0 },
  business: { name: 'Test' },
})

describe('blockNamesForSite', () => {
  it('always offers every core block', () => {
    expect(blockNamesForSite(config([]), skin)).toEqual([...CORE_BLOCKS])
  })

  it('adds a module’s blocks when that module is enabled', () => {
    const names = blockNamesForSite(config(['demo']), skin)
    expect(names).toContain('menu')
    expect(names).toContain('hours')
  })

  it('ignores a module the skin does not implement', () => {
    expect(blockNamesForSite(config(['bookings']), skin)).toEqual([...CORE_BLOCKS])
  })

  it('does not offer the same block twice when a module repeats a core block', () => {
    const overlapping: SkinBlocks = { name: 'test', modules: { demo: ['hero'] } }
    const names = blockNamesForSite(config(['demo']), overlapping)
    expect(names.filter((n) => n === 'hero')).toHaveLength(1)
  })
})

describe('blocksForSite', () => {
  it('offers only names that have a Payload schema', async () => {
    const blocks = await blocksForSite(config(['demo']), async () => skin)
    // menu and hours are declared by the module but have no schema yet.
    expect(blocks.map((b) => b.slug)).not.toContain('menu')
    expect(blocks.map((b) => b.slug)).toContain('hero')
  })
})
