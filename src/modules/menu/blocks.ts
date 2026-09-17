import type { Block } from 'payload'

/**
 * Points at a menu rather than containing one, so the same menu can appear on
 * the home page and the menu page and be edited once.
 */
export const menu: Block = {
  slug: 'menu',
  interfaceName: 'MenuBlock',
  fields: [
    { name: 'menu', type: 'relationship', relationTo: 'menus', required: true },
    { name: 'heading', type: 'text', admin: { description: "Overrides the menu's own title." } },
    {
      name: 'showPrintLink',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Shows a print link for staff. Harmless if the public find it.' },
    },
  ],
}
