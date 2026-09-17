import type { Block } from 'payload'

export const logoStrip: Block = {
  slug: 'logoStrip',
  interfaceName: 'LogoStripBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 12,
      required: true,
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media', required: true },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}
