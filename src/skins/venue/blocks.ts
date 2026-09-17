import { defineSkinBlocks } from '@/skins/types'

export default defineSkinBlocks({
  name: 'venue',
  /*
   * The venue can draw the menu module's block. skin:check asserts this list
   * and the manifest's renderer map agree — declaring a block with no renderer
   * would put a field group in the admin that draws nothing.
   */
  modules: {
    menu: ['menu'],
  },
})
