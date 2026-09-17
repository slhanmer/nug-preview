import { CORE_BLOCKS } from '@/blocks/core'

import { checkSkins, orphanedBlocks, schemaGaps } from './check'
import { isSkinName, loadSkin, SKIN_NAMES } from './registry'

describe('skin registry', () => {
  it('registers at least one skin', () => {
    expect(SKIN_NAMES.length).toBeGreaterThan(0)
  })

  it('every registered skin passes structural checks', async () => {
    const problems = await checkSkins()
    expect(
      problems.map((p) => `${p.skin}: ${p.problem}`),
      'skin:check found problems',
    ).toEqual([])
  })

  it('every skin implements every core block', async () => {
    for (const name of SKIN_NAMES) {
      const skin = await loadSkin(name)
      for (const block of CORE_BLOCKS) {
        expect(typeof skin.core[block], `${name} is missing ${block}`).toBe('function')
      }
    }
  })

  it('rejects an unknown skin by name', () => {
    expect(isSkinName('does-not-exist')).toBe(false)
  })

  it('names the registered skins when asked for one that does not exist', async () => {
    await expect(loadSkin('nope' as never)).rejects.toThrow(/Registered: /)
  })
})

describe('orphaned blocks', () => {
  it('reports content the skin cannot draw', async () => {
    const orphans = await orphanedBlocks('base', ['hero', 'prose', 'menu'])
    expect(orphans).toEqual(['menu'])
  })

  it('accepts module blocks when that module is enabled', async () => {
    // base declares no modules, so an enabled module changes nothing for it.
    const orphans = await orphanedBlocks('base', ['hero', 'menu'], ['bookings'])
    expect(orphans).toEqual(['menu'])
  })
})

describe('the CMS/skin seam', () => {
  it('never offers a block that no skin can render', async () => {
    const orphans = (await schemaGaps()).filter((g) => g.gap === 'no-renderer')
    expect(
      orphans.map((g) => g.block),
      'blocks with a Payload schema but nothing to draw them',
    ).toEqual([])
  })

  it('reports which core blocks still need a schema', async () => {
    // Not a failure while the core set is being filled in. This exists so the
    // remaining work is visible rather than discovered in the admin.
    const missing = (await schemaGaps()).filter((g) => g.gap === 'no-schema').map((g) => g.block)
    expect(missing).not.toContain('hero')
  })
})
