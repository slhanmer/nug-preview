import { defineModule } from '@/modules/types'

import { menu } from './blocks'
import { menuDays, menus } from './collections'

export default defineModule({
  name: 'menu',
  label: 'Menu',
  description: 'Menus edited once, shown on the site and printed for the room from the same data.',
  collections: [menus, menuDays],
  blocks: { menu },
  routes: ['/menu/print'],
})
